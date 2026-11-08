import { z } from "zod";
import { guideSchema, parseGuide } from "./ai/guide";
import { MAX_TOTAL_BYTES, type GeneratedGuide } from "./ai/openai";

const DATABASE = "leroy-montaje-ia:library";
const SUMMARIES = "summaries";
const GUIDES = "guides";
const idSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/);
const generatedSchema = z.object({
  guide: guideSchema,
  model: z.string().min(1).max(120),
  createdAt: z.iso.datetime(),
  files: z.array(z.string().min(1).max(512).regex(/\.pdf$/i)).length(1),
  usage: z.object({ input: z.number().int().nonnegative(), output: z.number().int().nonnegative() }).nullable(),
});
const summarySchema = z.object({
  version: z.literal(1), id: idSchema, name: z.string().min(1).max(160),
  filename: z.string().min(1).max(512), createdAt: z.iso.datetime(),
  steps: z.number().int().min(1).max(60), parts: z.number().int().min(1).max(100),
}).strict();

export type LibraryEntry = z.infer<typeof summarySchema>;
export type LibraryInput = { id: string; generated: GeneratedGuide; manual: Blob };
export type LibraryGuide = LibraryInput & { version: 1 };

export function orderLibrary(entries: LibraryEntry[]) {
  return [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id));
}

export function parseLibraryEntries(value: unknown): LibraryEntry[] {
  const entries = z.array(summarySchema).parse(value);
  if (new Set(entries.map(entry => entry.id)).size !== entries.length) throw new Error("El histórico contiene entradas repetidas.");
  return orderLibrary(entries);
}

export async function prepareLibraryGuide(value: unknown): Promise<LibraryGuide> {
  if (!value || typeof value !== "object") throw new Error("No se ha podido leer la guía guardada.");
  const record = value as Partial<LibraryGuide>;
  if (record.version !== 1) throw new Error("Esta guía guardada pertenece a una versión no compatible.");
  const id = idSchema.parse(record.id);
  const generated = generatedSchema.parse(record.generated);
  generated.guide = parseGuide(generated.guide);
  if (generated.guide.status !== "ready") throw new Error("Solo se guardan guías de montaje completas.");
  const manual = record.manual;
  if (!(manual instanceof Blob) || manual.size === 0 || manual.size > MAX_TOTAL_BYTES || await manual.slice(0, 5).text() !== "%PDF-") {
    throw new Error("No se ha podido recuperar el PDF original de esta guía.");
  }
  // Keep an explicit allowlist. Credentials and temporary object URLs never enter the library.
  return { version: 1, id, generated, manual };
}

export function librarySummary(record: LibraryGuide): LibraryEntry {
  return {
    version: 1, id: record.id, name: record.generated.guide.name,
    filename: record.generated.files[0], createdAt: record.generated.createdAt,
    steps: record.generated.guide.steps.length, parts: record.generated.guide.parts.length,
  };
}

function browserDatabase(): IDBFactory | null {
  try { return typeof window === "undefined" ? null : window.indexedDB; } catch { return null; }
}

function storageError(error?: DOMException | null) {
  return new Error(error?.name === "QuotaExceededError"
    ? "No queda espacio en este navegador. Tu guía sigue abierta, pero no se ha guardado en el histórico."
    : "Este navegador no ha permitido guardar la guía. Sigue disponible en esta pestaña; puedes volver a intentar guardarla.");
}

function openLibrary(factory: IDBFactory | null): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!factory) { reject(new Error("Este navegador no permite acceder al histórico local.")); return; }
    let failed = false;
    let request: IDBOpenDBRequest;
    try { request = factory.open(DATABASE, 1); } catch { reject(storageError()); return; }
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore(SUMMARIES, { keyPath: "id" });
      db.createObjectStore(GUIDES, { keyPath: "id" });
    };
    request.onblocked = () => {
      failed = true;
      reject(new Error("Cierra las otras pestañas de esta aplicación y vuelve a abrir el histórico."));
    };
    request.onerror = () => { failed = true; reject(storageError(request.error)); };
    request.onsuccess = () => {
      const db = request.result;
      if (failed) { db.close(); return; }
      db.onversionchange = () => db.close();
      resolve(db);
    };
  });
}

function readStore<T>(db: IDBDatabase, store: string, read: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(store, "readonly");
      const request = read(transaction.objectStore(store));
      transaction.oncomplete = () => { db.close(); resolve(request.result); };
      transaction.onabort = () => { db.close(); reject(new Error("No se ha podido leer el histórico. Vuelve a intentarlo.")); };
    } catch { db.close(); reject(new Error("No se ha podido abrir el histórico de este navegador.")); }
  });
}

export async function listLibrary(factory: IDBFactory | null = browserDatabase()): Promise<LibraryEntry[]> {
  const db = await openLibrary(factory);
  const entries = await readStore(db, SUMMARIES, store => store.getAll());
  try { return parseLibraryEntries(entries); }
  catch { throw new Error("El histórico contiene datos que esta versión no puede leer. No se ha borrado ninguna guía."); }
}

export async function loadLibraryGuide(id: string, factory: IDBFactory | null = browserDatabase()): Promise<LibraryGuide> {
  idSchema.parse(id);
  const db = await openLibrary(factory);
  const value = await readStore(db, GUIDES, store => store.get(id));
  if (!value) throw new Error("Esta guía ya no está en el histórico de este navegador.");
  return prepareLibraryGuide(value);
}

export async function saveLibraryGuide(input: LibraryInput, factory: IDBFactory | null = browserDatabase()): Promise<LibraryEntry> {
  const record = await prepareLibraryGuide({ ...input, version: 1 });
  const summary = librarySummary(record);
  const db = await openLibrary(factory);
  return new Promise((resolve, reject) => {
    let transaction: IDBTransaction | undefined;
    try {
      transaction = db.transaction([SUMMARIES, GUIDES], "readwrite");
      transaction.oncomplete = () => { db.close(); resolve(summary); };
      transaction.onabort = () => { db.close(); reject(storageError(transaction?.error)); };
      transaction.objectStore(GUIDES).put(record);
      transaction.objectStore(SUMMARIES).put(summary);
    } catch {
      transaction?.abort(); db.close(); reject(storageError());
    }
  });
}
