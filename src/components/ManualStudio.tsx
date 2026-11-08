"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, CircleAlert, FileText, KeyRound, LogOut } from "lucide-react";
import StageView from "./StageView";
import ConnectionDialog from "./montage/ConnectionDialog";
import PDFDropzone from "./montage/PDFDropzone";
import GuideExperience from "./montage/GuideExperience";
import Brand from "./montage/Brand";
import GenerationWait from "./montage/GenerationWait";
import GuideLibrary from "./montage/GuideLibrary";
import { browserStorage, loadSavedApiKey, updateSavedApiKey } from "@/lib/browser-session";
import { recordGenerationTime } from "@/lib/generation-timing";
import { listLibrary, loadLibraryGuide, orderLibrary, saveLibraryGuide, type LibraryEntry, type LibraryInput } from "@/lib/guide-library";
import { buildDayPlan } from "@/lib/leroy/day-plan";
import { buildAIPlan } from "@/lib/ai/guide";
import { generateGuide, MODELS, validateFiles, type GeneratedGuide } from "@/lib/ai/openai";

type Result = { generated: GeneratedGuide; manualURL: string; libraryId: string };

export default function ManualStudio({ onLogout }: { onLogout: () => void }) {
  const [connection, setConnection] = useState(() => { const key = loadSavedApiKey(browserStorage("localStorage")); return { key, saved: !!key }; });
  const { key: apiKey, saved: keySaved } = connection;
  const [connectionOpen, setConnectionOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<"interpreting" | "correcting">("interpreting");
  const [filename, setFilename] = useState("");
  const [startedAt, setStartedAt] = useState(0);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [library, setLibrary] = useState<LibraryEntry[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [libraryError, setLibraryError] = useState("");
  const [opening, setOpening] = useState<string | null>(null);
  const [openError, setOpenError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [pendingSave, setPendingSave] = useState<LibraryInput | null>(null);
  const controller = useRef<AbortController | null>(null);
  const sourceURL = useRef("");
  const mounted = useRef(true);
  const selection = useRef(0);
  const dragDepth = useRef(0);
  const saveSequence = useRef(0);
  const homeHeading = useRef<HTMLHeadingElement | null>(null);
  const preview = useMemo(() => buildDayPlan(), []);

  const refreshLibrary = useCallback(async () => {
    try {
      const entries = await listLibrary();
      if (mounted.current) { setLibrary(entries); setLibraryError(""); }
    } catch (e) {
      if (mounted.current) setLibraryError(e instanceof Error && !(e instanceof SyntaxError) ? e.message : "No se puede leer el histórico de este navegador.");
    } finally { if (mounted.current) setLibraryLoading(false); }
  }, []);

  useEffect(() => {
    mounted.current = true;
    homeHeading.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(motion.matches);
    update(); motion.addEventListener("change", update);
    return () => { mounted.current = false; controller.current?.abort(); URL.revokeObjectURL(sourceURL.current); motion.removeEventListener("change", update); };
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => { void refreshLibrary(); });
    const refresh = () => { void refreshLibrary(); };
    window.addEventListener("focus", refresh);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("focus", refresh); };
  }, [refreshLibrary]);

  async function persistGuide(input: LibraryInput) {
    const sequence = ++saveSequence.current;
    setPendingSave(input); setSaving(true); setSaveError("");
    try {
      const entry = await saveLibraryGuide(input);
      if (!mounted.current) return;
      setLibrary(previous => orderLibrary([entry, ...previous.filter(item => item.id !== entry.id)]));
      setLibraryError(""); setLibraryLoading(false);
      if (saveSequence.current === sequence) setPendingSave(null);
    } catch (e) {
      if (mounted.current && saveSequence.current === sequence) setSaveError(e instanceof Error ? e.message : "Vuelve a intentar guardar esta guía.");
    } finally { if (mounted.current && saveSequence.current === sequence) setSaving(false); }
  }

  async function openGuide(id: string) {
    if (controller.current || opening) return;
    const request = ++selection.current;
    setOpening(id); setOpenError("");
    try {
      const record = await loadLibraryGuide(id);
      if (!mounted.current || request !== selection.current) return;
      buildAIPlan(record.generated.guide);
      const url = URL.createObjectURL(record.manual);
      URL.revokeObjectURL(sourceURL.current); sourceURL.current = url;
      setError(""); setPendingFile(null);
      setResult({ generated: record.generated, manualURL: url, libraryId: record.id });
      window.scrollTo(0, 0);
    } catch (e) {
      if (mounted.current && request === selection.current) setOpenError(e instanceof Error ? e.message : "No se ha podido abrir este montaje guardado.");
    } finally { if (mounted.current) setOpening(null); }
  }

  async function start(file: File, key: string) {
    if (controller.current) return;
    const abort = new AbortController(); controller.current = abort;
    const startTime = Date.now();
    setStartedAt(startTime); setBusy(true); setFilename(file.name); setError(""); setPendingFile(null); setResult(null);
    URL.revokeObjectURL(sourceURL.current); sourceURL.current = "";
    const timeout = setTimeout(() => abort.abort("timeout"), 15 * 60 * 1000);
    let completed: LibraryInput | null = null;
    try {
      const generated = await generateGuide(key, [file], MODELS[0].id, abort.signal, setPhase);
      if (abort.signal.aborted || !mounted.current) return;
      if (generated.guide.status !== "ready") throw new Error(generated.guide.reason || "Faltan instrucciones de montaje. Prueba con el manual completo.");
      buildAIPlan(generated.guide);
      const url = URL.createObjectURL(file); sourceURL.current = url;
      recordGenerationTime(browserStorage("localStorage"), MODELS[0].id, Date.now() - startTime);
      completed = { id: crypto.randomUUID(), generated, manual: file };
      setResult({ generated, manualURL: url, libraryId: completed.id });
    } catch (e) {
      if (!mounted.current) return;
      setError(abort.signal.aborted ? abort.signal.reason === "timeout" ? "La respuesta está tardando demasiado. Puedes volver a subir el PDF. OpenAI puede haber procesado la petición anterior." : "Has cancelado la lectura. Puedes subir otro manual cuando quieras. OpenAI puede haber iniciado el procesamiento." : e instanceof Error ? e.message : "No se ha podido leer el manual. Prueba con otra copia del PDF.");
    } finally {
      clearTimeout(timeout);
      if (mounted.current) setBusy(false);
      controller.current = null;
    }
    if (completed && mounted.current) void persistGuide(completed);
  }
  async function acceptFiles(files: File[]) {
    if (controller.current) return;
    const id = ++selection.current;
    setDragging(false); dragDepth.current = 0; setError("");
    try {
      if (files.length !== 1 || !/\.pdf$/i.test(files[0].name)) throw new Error("Elige un solo manual en PDF. Si tienes fotos, guárdalas primero como PDF.");
      await validateFiles(files);
      if (selection.current !== id || !mounted.current) return;
      if (apiKey) await start(files[0], apiKey);
      else { setPendingFile(files[0]); setConnectionOpen(true); }
    } catch (e) { if (mounted.current && id === selection.current) setError(e instanceof Error ? e.message : "No se ha podido abrir el PDF."); }
  }
  function connect(key: string | null, remember: boolean) {
    const next = key || apiKey;
    updateSavedApiKey(browserStorage("localStorage"), next, remember, keySaved);
    setConnection({ key: next, saved: remember }); setConnectionOpen(false);
    if (pendingFile) void start(pendingFile, next);
  }
  function closeConnection() { setConnectionOpen(false); setPendingFile(null); }
  function disconnect() {
    updateSavedApiKey(browserStorage("localStorage"), "", false, keySaved);
    controller.current?.abort(); setConnection({ key: "", saved: false }); closeConnection();
  }

  return <div className={`montage-app ${dragging ? "has-file-drag" : ""}`} onDragEnter={e => {
    if (!Array.from(e.dataTransfer.types).includes("Files")) return;
    e.preventDefault(); dragDepth.current++; if (!busy && !connectionOpen) setDragging(true);
  }} onDragOver={e => { if (Array.from(e.dataTransfer.types).includes("Files")) e.preventDefault(); }} onDragLeave={e => {
    e.preventDefault(); dragDepth.current = Math.max(0, dragDepth.current - 1); if (!dragDepth.current) setDragging(false);
  }} onDrop={e => { e.preventDefault(); setDragging(false); dragDepth.current = 0; if (!busy && !connectionOpen) void acceptFiles(Array.from(e.dataTransfer.files)); }}>
    <header className="montage-header"><div className="montage-header-inner"><Brand/><div className="header-actions"><button className="connection-trigger" onClick={() => setConnectionOpen(true)} disabled={busy} aria-label="Conexión con OpenAI"><span className={`connection-dot ${apiKey ? "is-ready" : ""}`}/><span>OpenAI</span><KeyRound size={13}/></button><button className="session-exit" onClick={onLogout} aria-label="Cerrar sesión demo"><LogOut size={16}/><span>Salir</span></button></div></div></header>
    <main id="main-content">
      {!busy && !result && <section className="montage-start" aria-labelledby="montage-title">
        <p className="montage-eyebrow">DEL MANUAL AL MONTAJE</p>
        <h1 id="montage-title" ref={homeHeading} tabIndex={-1}>Tu manual.<br/><span>Ahora, en movimiento.</span></h1>
        <p className="montage-intro">Arrastra el PDF. Descubre cómo se monta,<br className="desktop-break"/> paso a paso.</p>
        {error && <div className="montage-error" role="alert"><CircleAlert size={19}/><div><strong>No hemos podido crear la guía.</strong><p>{error}</p></div></div>}
        <PDFDropzone onFiles={files => void acceptFiles(files)} dragging={dragging}/>
        <p className="montage-upload-note">Tu producto en 3D. Cada pieza. Todos los pasos.</p>
        <div className="montage-preview" aria-label="Ejemplo de una animación de montaje"><div className="preview-copy"><span className="preview-small">ASÍ SE VE UNA GUÍA</span><p>Cada pieza.<br/>Todo más claro.</p><span className="preview-detail">Una interpretación visual de tu manual.</span></div><div className="preview-model"><StageView plan={preview} mode={{ kind: "assembled", turntable: !reduceMotion }} paused={reduceMotion} options={{ labels: false, interactive: false }}/></div><span className="preview-example">Modelo de ejemplo</span></div>
      </section>}
      {busy && <GenerationWait filename={filename} phase={phase} startedAt={startedAt} model={MODELS[0].id} reduceMotion={reduceMotion} onCancel={() => controller.current?.abort()}/>}
      {!busy && result && error && <div className="montage-error result-error" role="alert"><CircleAlert size={19}/><p>{error}</p></div>}
      {!busy && result && <GuideExperience key={result.libraryId} result={result.generated} manualURL={result.manualURL} onFiles={files => void acceptFiles(files)} dragging={dragging} reduceMotion={reduceMotion}/>}
      {!busy && <GuideLibrary entries={library} loading={libraryLoading} opening={opening} activeId={result?.libraryId ?? null} error={libraryError} openError={openError} saving={saving} saveError={saveError} onOpen={id => void openGuide(id)} onReload={() => { setLibraryLoading(true); setLibraryError(""); void refreshLibrary(); }} onRetrySave={() => { if (pendingSave && !saving) void persistGuide(pendingSave); }}/>}
    </main>
    <footer className="montage-footer"><div><span><Check size={13}/> Tu manual no se publica.</span><p>Guía visual orientativa. Contrasta siempre el montaje con el manual original.</p><p>Proyecto independiente de Leroy Merlin. Motor 3D de <a href="https://github.com/Nutlope/bygga" target="_blank" rel="noreferrer">Bygga</a>, licencia MIT.</p></div></footer>
    {connectionOpen && <ConnectionDialog open connected={!!apiKey} remembered={keySaved} pendingName={pendingFile?.name} onDismiss={closeConnection} onConnect={connect} onDisconnect={disconnect}/>}
    {dragging && <div className="global-drop-hint" aria-hidden="true"><span><FileText size={25}/>Suelta tu manual. Nosotros seguimos.</span></div>}
  </div>;
}
