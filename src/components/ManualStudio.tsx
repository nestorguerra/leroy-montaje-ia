"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Check, CircleAlert, FileText, KeyRound, X } from "lucide-react";
import StageView from "./StageView";
import ConnectionDialog from "./montage/ConnectionDialog";
import PDFDropzone, { ManualIllustration } from "./montage/PDFDropzone";
import GuideExperience from "./montage/GuideExperience";
import { buildDayPlan } from "@/lib/leroy/day-plan";
import { buildAIPlan } from "@/lib/ai/guide";
import { generateGuide, MODELS, validateFiles, type GeneratedGuide } from "@/lib/ai/openai";

type Result = { generated: GeneratedGuide; manualURL: string };

export default function ManualStudio() {
  const [apiKey, setApiKey] = useState("");
  const [connectionOpen, setConnectionOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<"interpreting" | "correcting">("interpreting");
  const [filename, setFilename] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const sourceURL = useRef("");
  const mounted = useRef(true);
  const selection = useRef(0);
  const dragDepth = useRef(0);
  const processingHeading = useRef<HTMLHeadingElement | null>(null);
  const preview = useMemo(() => buildDayPlan(), []);

  useEffect(() => {
    mounted.current = true;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(motion.matches);
    update(); motion.addEventListener("change", update);
    return () => { mounted.current = false; controller.current?.abort(); URL.revokeObjectURL(sourceURL.current); motion.removeEventListener("change", update); };
  }, []);
  useEffect(() => { if (busy) processingHeading.current?.focus(); }, [busy]);

  async function start(file: File, key: string) {
    if (controller.current) return;
    const abort = new AbortController(); controller.current = abort;
    setBusy(true); setFilename(file.name); setError(""); setPendingFile(null); setResult(null);
    URL.revokeObjectURL(sourceURL.current); sourceURL.current = "";
    const timeout = setTimeout(() => abort.abort("timeout"), 15 * 60 * 1000);
    try {
      const generated = await generateGuide(key, [file], MODELS[0].id, abort.signal, setPhase);
      if (abort.signal.aborted || !mounted.current) return;
      if (generated.guide.status !== "ready") throw new Error(generated.guide.reason || "Faltan instrucciones de montaje. Prueba con el manual completo.");
      buildAIPlan(generated.guide);
      const url = URL.createObjectURL(file); sourceURL.current = url;
      setResult({ generated, manualURL: url });
    } catch (e) {
      if (!mounted.current) return;
      setError(abort.signal.aborted ? abort.signal.reason === "timeout" ? "La respuesta está tardando demasiado. Puedes volver a subir el PDF. OpenAI puede haber procesado la petición anterior." : "Has cancelado la lectura. Puedes subir otro manual cuando quieras. OpenAI puede haber iniciado el procesamiento." : e instanceof Error ? e.message : "No se ha podido leer el manual. Prueba con otra copia del PDF.");
    } finally {
      clearTimeout(timeout);
      if (mounted.current) setBusy(false);
      controller.current = null;
    }
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
  function connect(key: string) {
    setApiKey(key); setConnectionOpen(false);
    if (pendingFile) void start(pendingFile, key);
  }
  function closeConnection() { setConnectionOpen(false); setPendingFile(null); }

  return <div className={`montage-app ${dragging ? "has-file-drag" : ""}`} onDragEnter={e => {
    if (!Array.from(e.dataTransfer.types).includes("Files")) return;
    e.preventDefault(); dragDepth.current++; if (!busy && !connectionOpen) setDragging(true);
  }} onDragOver={e => { if (Array.from(e.dataTransfer.types).includes("Files")) e.preventDefault(); }} onDragLeave={e => {
    e.preventDefault(); dragDepth.current = Math.max(0, dragDepth.current - 1); if (!dragDepth.current) setDragging(false);
  }} onDrop={e => { e.preventDefault(); setDragging(false); dragDepth.current = 0; if (!busy && !connectionOpen) void acceptFiles(Array.from(e.dataTransfer.files)); }}>
    <header className="montage-header"><div className="montage-header-inner"><a className="montage-brand" href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/`} aria-label="Montaje, inicio"><Box size={22} strokeWidth={1.5}/><span>montaje<span className="brand-stop">.</span></span></a><button className="connection-trigger" onClick={() => setConnectionOpen(true)} disabled={busy} aria-label="Conexión con OpenAI"><span className={`connection-dot ${apiKey ? "is-ready" : ""}`}/><span>OpenAI</span><KeyRound size={13}/></button></div></header>
    <main id="main-content">
      {!busy && !result && <section className="montage-start" aria-labelledby="montage-title">
        <p className="montage-eyebrow">DEL MANUAL AL MONTAJE</p>
        <h1 id="montage-title">Tu manual.<br/><span>Ahora, en movimiento.</span></h1>
        <p className="montage-intro">Arrastra el PDF. Descubre cómo se monta,<br className="desktop-break"/> paso a paso.</p>
        {error && <div className="montage-error" role="alert"><CircleAlert size={19}/><div><strong>No hemos podido crear la guía.</strong><p>{error}</p></div></div>}
        <PDFDropzone onFiles={files => void acceptFiles(files)} dragging={dragging}/>
        <p className="montage-upload-note">Tu producto en 3D. Cada pieza. Todos los pasos.</p>
        <div className="montage-preview" aria-label="Ejemplo de una animación de montaje"><div className="preview-copy"><span className="preview-small">ASÍ SE VE UNA GUÍA</span><p>Cada pieza.<br/>Todo más claro.</p><span className="preview-detail">Una interpretación visual de tu manual.</span></div><div className="preview-model"><StageView plan={preview} mode={{ kind: "assembled", turntable: !reduceMotion }} paused={reduceMotion} options={{ labels: false, interactive: false }}/></div><span className="preview-example">Modelo de ejemplo</span></div>
      </section>}
      {busy && <section className="montage-processing" aria-busy="true" aria-labelledby="processing-title"><div className="processing-art" aria-hidden="true"><ManualIllustration/><span/><span/></div><p className="montage-eyebrow">TU GUÍA ESTÁ EN CAMINO</p><h1 id="processing-title" ref={processingHeading} tabIndex={-1}>El manual se lee.<br/><span>El montaje se ve.</span></h1><p role="status">{phase === "correcting" ? "Estamos ajustando las piezas y sus movimientos." : "Estamos interpretando las piezas y los pasos."}<br/>Puede tardar unos minutos.</p><div className="processing-file"><FileText size={16}/><span>{filename}</span><button aria-label="Cancelar lectura del manual" onClick={() => controller.current?.abort()}><X size={17}/></button></div><div className="processing-line" aria-hidden="true"><span/></div></section>}
      {!busy && result && error && <div className="montage-error result-error" role="alert"><CircleAlert size={19}/><p>{error}</p></div>}
      {!busy && result && <GuideExperience key={result.generated.createdAt} result={result.generated} manualURL={result.manualURL} onFiles={files => void acceptFiles(files)} dragging={dragging} reduceMotion={reduceMotion}/>}
    </main>
    <footer className="montage-footer"><div><span><Check size={13}/> Tu manual no se publica.</span><p>Guía visual orientativa. Contrasta siempre el montaje con el manual original.</p><p>Proyecto independiente de Leroy Merlin. Motor 3D de <a href="https://github.com/Nutlope/bygga" target="_blank" rel="noreferrer">Bygga</a>, licencia MIT.</p></div></footer>
    <ConnectionDialog open={connectionOpen} connected={!!apiKey} pendingName={pendingFile?.name} onDismiss={closeConnection} onConnect={connect} onDisconnect={() => { controller.current?.abort(); setApiKey(""); closeConnection(); }}/>
    {dragging && <div className="global-drop-hint" aria-hidden="true"><span><FileText size={25}/>Suelta tu manual. Nosotros seguimos.</span></div>}
  </div>;
}
