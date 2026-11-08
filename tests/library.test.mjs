/* Synthetic software fixtures. No manufacturer manual or valid API credential. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

const load = createRequire(import.meta.url);
load.extensions[".ts"] = (module, filename) => {
  const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, fileName: filename });
  module._compile(source.outputText, filename);
};
const { prepareLibraryGuide, librarySummary, parseLibraryEntries, orderLibrary, saveLibraryGuide, listLibrary, loadLibraryGuide } = load("../src/lib/guide-library.ts");
const vector = (x = 0, y = 0, z = 0) => ({ x, y, z });
const input = (id = "sample-a", createdAt = "2026-11-08T09:00:00.000Z") => ({
  id, manual: new Blob(["%PDF-1.7\nSynthetic test only"], { type: "application/pdf" }),
  generated: { model: "test-model", createdAt, files: ["prueba.pdf"], usage: { input: 10, output: 20 }, guide: {
    status: "ready", reason: "", name: "Modelo sintético", summary: "Prueba del histórico", pageCount: 1,
    dimensionsMm: vector(200, 200, 200), people: 1, tools: [], warnings: [], assumptions: ["Datos ficticios"],
    parts: [{ id: "p001", label: "A", name: "Pieza", shape: "box", material: "wood", sizeMm: vector(100, 20, 100), positionMm: vector(0, 10, 0), rotationRad: vector(), geometryEvidence: "approximate", sourcePage: 1, note: "Sintética" }],
    steps: [{ title: "Colocar pieza", detail: "Prueba", manualStep: "1", sourcePage: 1, caution: "", motions: [{ partId: "p001", positionMm: vector(0, 10, 0), rotationRad: vector(), approachMm: vector(0, 100, 0) }] }],
  } },
});

// Controllable transaction boundary: requests can succeed before a commit or abort.
function memoryDatabase({ holdWrites = false } = {}) {
  const stores = { summaries: new Map(), guides: new Map() };
  const writes = [];
  let requested;
  const requestReady = new Promise(resolve => { requested = resolve; });
  const factory = { open() {
    const request = {};
    queueMicrotask(() => {
      request.result = { close() {}, transaction(names, mode) {
        const transaction = {};
        const drafts = Object.fromEntries(Object.entries(stores).map(([name, data]) => [name, new Map(data)]));
        let aborted = false;
        transaction.objectStore = name => ({
          put(record) { drafts[name].set(record.id, structuredClone(record)); requested(); },
          getAll() { return { result: structuredClone([...stores[name].values()]) }; },
          get(id) { return { result: structuredClone(stores[name].get(id)) }; },
        });
        transaction.abort = () => { aborted = true; queueMicrotask(() => transaction.onabort?.()); };
        const finish = error => {
          if (aborted) return;
          if (error) { transaction.error = error; transaction.onabort?.(); return; }
          if (mode === "readwrite") for (const name of names) stores[name] = drafts[name];
          transaction.oncomplete?.();
        };
        if (mode === "readwrite" && holdWrites) writes.push(finish);
        else queueMicrotask(() => finish());
        return transaction;
      } };
      request.onsuccess?.();
    });
    return request;
  } };
  return { factory, stores, writes, requestReady };
}

test("saved guides keep the complete validated model and PDF with an explicit metadata allowlist", async () => {
  const source = input();
  source.apiKey = "synthetic-secret-must-not-be-stored";
  source.manualURL = "blob:temporary";
  source.generated.apiKey = source.apiKey;
  const record = await prepareLibraryGuide({ ...source, version: 1 });
  assert.deepEqual(Object.keys(record).sort(), ["generated", "id", "manual", "version"]);
  assert.equal(JSON.stringify(record).includes(source.apiKey), false);
  assert.equal(JSON.stringify(record).includes("blob:temporary"), false);
  assert.equal(record.generated.guide.steps.length, 1);
  assert.equal(await record.manual.text(), await source.manual.text());
  assert.equal(source.generated.apiKey, source.apiKey);
});

test("incomplete guides, bad references, incompatible versions and missing PDFs cannot enter the library", async () => {
  const record = { ...input(), version: 1 };
  await assert.rejects(prepareLibraryGuide({ ...record, version: 2 }), /versión/);
  await assert.rejects(prepareLibraryGuide({ ...record, manual: new Blob(["not a pdf"]) }), /PDF/);
  await assert.rejects(prepareLibraryGuide({ ...record, manual: undefined }), /PDF/);
  const bad = structuredClone(record); bad.generated.guide.steps[0].motions[0].partId = "absent";
  await assert.rejects(prepareLibraryGuide(bad), /absent/);
  const insufficient = structuredClone(record); insufficient.generated.guide.status = "insufficient";
  await assert.rejects(prepareLibraryGuide(insufficient), /completas/);
});

test("library summaries sort newest first without modifying the input or accepting duplicate ids", async () => {
  const older = librarySummary(await prepareLibraryGuide({ ...input("old", "2026-11-07T09:00:00.000Z"), version: 1 }));
  const newer = librarySummary(await prepareLibraryGuide({ ...input("new"), version: 1 }));
  const source = [older, newer];
  assert.deepEqual(orderLibrary(source).map(x => x.id), ["new", "old"]);
  assert.deepEqual(source.map(x => x.id), ["old", "new"]);
  assert.throws(() => parseLibraryEntries([older, older]), /repetidas/);
  assert.throws(() => parseLibraryEntries([{ ...older, steps: 0 }]));
  assert.equal("manual" in older, false);
  assert.equal("generated" in older, false);
});

test("a guide is reported as saved only after the model, PDF and summary transaction commits", async () => {
  const db = memoryDatabase({ holdWrites: true });
  let saved = false;
  const pending = saveLibraryGuide(input(), db.factory).then(entry => { saved = true; return entry; });
  await db.requestReady;
  assert.equal(saved, false);
  assert.equal(db.stores.summaries.size, 0);
  assert.equal(db.stores.guides.size, 0);
  db.writes.shift()();
  assert.equal((await pending).id, "sample-a");
  assert.equal(saved, true);
  const reopened = await loadLibraryGuide("sample-a", db.factory);
  assert.equal(reopened.generated.guide.name, "Modelo sintético");
  assert.equal(await reopened.manual.text(), await input().manual.text());
});

test("a quota failure never increments the counter or leaves a partial saved guide", async () => {
  const db = memoryDatabase({ holdWrites: true });
  const pending = saveLibraryGuide(input(), db.factory);
  const rejected = assert.rejects(pending, /No queda espacio/);
  await db.requestReady;
  db.writes.shift()(new DOMException("Quota exceeded", "QuotaExceededError"));
  await rejected;
  assert.equal(db.stores.summaries.size, 0);
  assert.equal(db.stores.guides.size, 0);
});

test("retrying a save and reopening a guide do not duplicate conversions or remove unrelated entries", async () => {
  const db = memoryDatabase();
  await saveLibraryGuide(input("first"), db.factory);
  await saveLibraryGuide(input("second"), db.factory);
  await saveLibraryGuide(input("first"), db.factory);
  assert.equal((await listLibrary(db.factory)).length, 2);
  for (let i = 0; i < 3; i++) await loadLibraryGuide("first", db.factory);
  assert.equal((await listLibrary(db.factory)).length, 2);
  await assert.rejects(loadLibraryGuide("missing", db.factory), /ya no está/);
  assert.equal(db.stores.guides.size, 2);
});

test("unavailable storage is an explicit failure, never a successful save or a fabricated empty library", async () => {
  await assert.rejects(listLibrary(null), /histórico local/);
  await assert.rejects(saveLibraryGuide(input(), null), /histórico local/);
  const blocked = { open() { throw new DOMException("Blocked", "SecurityError"); } };
  await assert.rejects(listLibrary(blocked));
});
