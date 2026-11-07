"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Box, Check, Download, Eye, EyeOff, FileText, KeyRound, Layers, LoaderCircle, Maximize2, Pause, Play, RotateCcw, Sparkles, Trash2, Upload, X } from "lucide-react";
import StageView, { type StageHandle } from "./StageView";
import VideoButton from "./VideoButton";
import { buildAIPlan } from "@/lib/ai/guide";
import { generateGuide, MODELS, validateFiles, type GeneratedGuide } from "@/lib/ai/openai";
import { downloadBlob, secondsForStep } from "@/lib/video";
import { buildDayPlan } from "@/lib/leroy/day-plan";

type SourceFile = { name: string; url: string; pdf: boolean };

export default function ManualStudio() {
  const [apiKey, setApiKey] = useState("");
  const [visible, setVisible] = useState(false);
  const [model, setModel] = useState(MODELS[0].id);
  const [files, setFiles] = useState<File[]>([]);
  const [sources, setSources] = useState<SourceFile[]>([]);
  const [generated, setGenerated] = useState<GeneratedGuide | null>(null);
  const [busy, setBusy] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dragging, setDragging] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const sourceRef = useRef<SourceFile[]>([]);
  const mounted = useRef(true);
  const generationId = useRef(0);
  const input = useRef<HTMLInputElement | null>(null);
  const viewer = useRef<HTMLDivElement | null>(null);
  const demoPlan = useMemo(() => buildDayPlan(), []);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; controller.current?.abort(); sourceRef.current.forEach(s => URL.revokeObjectURL(s.url)); };
  }, []);
  useEffect(() => {
    if (!busy) return;
    const timer = setInterval(() => setElapsed(n => n + 1), 1000);
    return () => clearInterval(timer);
  }, [busy]);

  async function selectFiles(incoming: File[]) {
    if (busy) return;
    setError(""); setNotice("");
    const id = ++generationId.current;
    try {
      await validateFiles(incoming);
      if (id === generationId.current && mounted.current) setFiles(incoming);
    } catch (e) { if (id === generationId.current) setError(e instanceof Error ? e.message : "Revise los archivos."); }
  }
  function reorder(index: number, by: number) {
    setFiles(previous => { const next = [...previous]; [next[index], next[index + by]] = [next[index + by], next[index]]; return next; });
  }
  async function generate() {
    if (busy) return;
    const abort = new AbortController(); controller.current = abort;
    setBusy(true); setElapsed(0); setError(""); setNotice("");
    const timeout = setTimeout(() => abort.abort("timeout"), 240000);
    try {
      const result = await generateGuide(apiKey, files, model, abort.signal);
      if (abort.signal.aborted || !mounted.current) return;
      if (result.guide.status !== "ready") {
        setError(result.guide.reason || "El documento no permite reconstruir un montaje fiable.");
        return;
      }
      buildAIPlan(result.guide);
      const nextSources = files.map(f => ({ name: f.name, url: URL.createObjectURL(f), pdf: /\.pdf$/i.test(f.name) }));
      sourceRef.current.forEach(s => URL.revokeObjectURL(s.url));
      sourceRef.current = nextSources;
      setSources(nextSources); setGenerated(result);
      setNotice("Guía generada. Revise cada paso con el manual antes de montar.");
      setTimeout(() => viewer.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e) {
      if (!mounted.current) return;
      if (abort.signal.aborted) setNotice(abort.signal.reason === "timeout" ? "Se ha agotado el tiempo de espera. OpenAI puede haber procesado la petición; no se ha reintentado." : "Petición cancelada. OpenAI puede haber iniciado su procesamiento.");
      else setError(e instanceof Error ? e.message : "No se ha podido generar la guía.");
    } finally {
      clearTimeout(timeout);
      if (mounted.current) setBusy(false);
      controller.current = null;
    }
  }
  function clearKey() {
    if (busy) controller.current?.abort();
    setApiKey(""); setVisible(false); setNotice("Clave eliminada de esta sesión.");
  }

  return <div className="studio">
    <section className="studio-hero">
      <div><p className="lab-eyebrow">TU MANUAL + OPENAI + BYGGA</p><h1>Del papel,<br/><em>a verlo montado.</em></h1><p className="studio-lead">Sube el manual de tu mueble. La IA interpreta sus piezas y pasos para crear una guía animada que puedes girar, pausar y llevarte en vídeo.</p><div className="studio-pills"><span><FileText size={14}/> PDF o fotos</span><span><Box size={14}/> Montaje en 3D</span><span><Play size={14}/> Vídeo por pasos</span></div></div>
      <div className="studio-preview"><span className="studio-preview-label">ASÍ SE VE UNA GUÍA · EJEMPLO DAY</span><StageView plan={demoPlan} mode={{ kind: "assembled", turntable: true }} options={{ labels: false, interactive: true }}/><span className="studio-preview-note">Modelo preparado · Prueba a girarlo</span></div>
    </section>

    <section className="studio-form" aria-label="Crear una guía con OpenAI">
      <div className="studio-form-heading"><div><p className="lab-eyebrow">EMPIEZA AQUÍ</p><h2>Un manual. Tu propia guía.</h2></div><span className="studio-private"><KeyRound size={14}/> Clave solo en esta sesión</span></div>
      <div className="studio-fields">
        <div className="studio-key-panel">
          <label className="studio-label" htmlFor="openai-key"><span>01</span>Tu API Key de OpenAI</label>
          <div className="studio-key-input"><input id="openai-key" type={visible ? "text" : "password"} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-proj-…" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} data-1p-ignore="true" data-lpignore="true" aria-describedby="key-help" disabled={busy}/><button type="button" aria-label={visible ? "Ocultar clave" : "Mostrar clave"} aria-pressed={visible} onClick={() => setVisible(v => !v)}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button><button type="button" aria-label="Borrar clave" disabled={!apiKey} onClick={clearKey}><Trash2 size={17}/></button></div>
          <p id="key-help" className="studio-help">La clave se envía únicamente a OpenAI. Esta app no la guarda en el navegador ni en GitHub. Se borra al recargar o cerrar esta pestaña.</p>
          <label className="studio-model-label" htmlFor="model">Modelo</label><select id="model" value={model} disabled={busy} onChange={e => setModel(e.target.value)}>{MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}</select>
          <p className="studio-help">El uso se factura en tu cuenta de OpenAI. La suscripción de ChatGPT no incluye este consumo. <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer">Gestionar claves</a></p>
        </div>
        <div className="studio-upload-panel">
          <label className="studio-label" htmlFor="manual-upload"><span>02</span>El manual de montaje</label>
          <input ref={input} id="manual-upload" type="file" className="studio-file-input" accept=".pdf,.png,.jpg,.jpeg,.webp" multiple disabled={busy} onChange={e => { selectFiles(Array.from(e.target.files || [])); e.target.value = ""; }}/>
          <button type="button" className={`studio-drop ${dragging ? "is-dragging" : ""}`} disabled={busy} onClick={() => input.current?.click()} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); selectFiles(Array.from(e.dataTransfer.files)); }}><Upload size={27}/><strong>{files.length ? "Cambiar archivos" : "Arrastra aquí tu manual"}</strong><span>o pulsa para elegirlo</span><small>Un PDF o hasta 12 fotos · 20 MB en total</small></button>
          {!!files.length && <ol className="studio-file-list">{files.map((f, i) => <li key={`${f.name}-${i}`}><FileText size={15}/><span>{files.length > 1 ? `${i + 1}. ` : ""}{f.name}<small>{(f.size / 1024 / 1024).toFixed(1)} MB</small></span>{files.length > 1 && <><button aria-label={`Subir página ${i + 1}`} disabled={busy || i === 0} onClick={() => reorder(i, -1)}><ArrowUp size={14}/></button><button aria-label={`Bajar página ${i + 1}`} disabled={busy || i === files.length - 1} onClick={() => reorder(i, 1)}><ArrowDown size={14}/></button></>}<button aria-label={`Quitar ${f.name}`} disabled={busy} onClick={() => setFiles(prev => prev.filter((_, n) => i !== n))}><X size={14}/></button></li>)}</ol>}
          <p className="studio-help">Incluye el inventario, todas las páginas de montaje y las advertencias. Si subes fotos, ordénalas antes de generar.</p>
        </div>
      </div>
      <div className="studio-submit"><p>El manual se envía directamente a OpenAI. El dibujo será una interpretación esquemática que podrás contrastar con el original.</p>{busy ? <button className="studio-secondary" onClick={() => controller.current?.abort()}><X size={16}/>Cancelar</button> : <button className="lab-primary" disabled={!apiKey.trim() || !files.length} onClick={generate}><Sparkles size={17}/>{generated ? "Generar otra guía" : "Crear mi guía animada"}<ArrowRight size={18}/></button>}</div>
      {busy && <div className="studio-loading" role="status"><LoaderCircle className="studio-spinner" size={18}/><span>{elapsed < 10 ? "Preparando y enviando el manual…" : "OpenAI está interpretando las piezas y los pasos…"}<small>{elapsed}s · Puede tardar varios minutos. No cierres esta pestaña.</small></span></div>}
      {error && <p className="studio-error" role="alert">{error}</p>}
      {notice && <p className="studio-notice" role="status">{notice}</p>}
    </section>
    <div ref={viewer} className="studio-result">{generated && <GeneratedViewer key={generated.createdAt} result={generated} sources={sources}/>}</div>
    <section id="fuentes" className="studio-explainer"><p className="lab-eyebrow">CÓMO SE CONSTRUYE LA GUÍA</p><div><article><span>01</span><h3>La IA lee el manual</h3><p>OpenAI recibe el PDF completo o las fotos, e interpreta el inventario, los pasos y las advertencias.</p></article><article><span>02</span><h3>Bygga lo pone en movimiento</h3><p>El motor 3D dibuja las piezas con formas simples y anima cómo encajan. Las medidas inferidas se indican.</p></article><article><span>03</span><h3>Tú contrastas y montas</h3><p>Cada paso enlaza su página del manual. Puedes repetirlo, girar el modelo o descargar la secuencia en vídeo.</p></article></div><p className="studio-help">Esta prueba usa tu clave desde el navegador. Extensiones o personas con acceso al dispositivo podrían verla durante la sesión. Usa una clave de proyecto con un límite de gasto apropiado. La geometría no sirve para fabricar, taladrar ni validar anclajes.</p></section>
  </div>;
}

function GeneratedViewer({ result, sources }: { result: GeneratedGuide; sources: SourceFile[] }) {
  const guide = result.guide;
  const plan = useMemo(() => buildAIPlan(guide), [guide]);
  const [view, setView] = useState<"product" | "parts" | "steps">("steps");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [slow, setSlow] = useState(false);
  const handle = useRef<StageHandle | null>(null);
  const current = guide.steps[step];
  const captions = guide.steps.map(s => ({ title: s.title, detail: s.detail, page: s.sourcePage, caution: s.caution }));
  useEffect(() => {
    if (!playing || paused || view !== "steps") return;
    const moves = current.motions.length;
    const duration = Math.max(secondsForStep(current, slow), (handle.current?.getStepSeconds() ?? moves * 0.22 + 3) / (slow ? 0.45 : 1));
    const timer = setTimeout(() => { if (step < guide.steps.length - 1) setStep(n => n + 1); else setPlaying(false); }, duration * 1000);
    return () => clearTimeout(timer);
  }, [playing, paused, step, view, slow, guide.steps.length, current]);
  const move = (index: number) => { setStep(index); setPaused(false); setPlaying(false); setView("steps"); };
  function source(page: number | null) {
    if (sources[0]?.pdf) return page ? `${sources[0].url}#page=${page}` : sources[0].url;
    return page ? sources[page - 1]?.url : sources[0]?.url;
  }
  return <>
    <section className="studio-result-heading"><div><p className="lab-eyebrow"><Check size={14}/> GUÍA GENERADA CON OPENAI</p><h2>{guide.name}</h2><p>{guide.summary}</p></div><div className="studio-result-stats"><strong>{guide.steps.length}<span>pasos</span></strong><strong>{guide.parts.length}<span>piezas visuales</span></strong></div></section>
    <div className="lab-notice"><span className="lab-status">INTERPRETACIÓN CON IA</span><p>Revisa el orden, las uniones y las medidas con el manual. El modelo es aproximado y puede contener errores.</p></div>
    <section className="lab-workspace" aria-label="Guía generada de montaje">
      <div className="lab-visual"><nav className="lab-views" aria-label="Vistas de la guía"><button aria-pressed={view === "product"} onClick={() => { setView("product"); setPlaying(false); }}><Box size={16}/>Producto</button><button aria-pressed={view === "parts"} onClick={() => { setView("parts"); setPlaying(false); }}><Layers size={16}/>Piezas</button><button aria-pressed={view === "steps"} onClick={() => setView("steps")}><Play size={16}/>Montaje</button></nav><div className="lab-canvas" role="img" aria-label={view === "steps" ? `Paso ${step + 1}: ${current.title}` : `Modelo 3D de ${guide.name}`}><StageView plan={plan} mode={view === "steps" ? { kind: "step", index: step } : view === "parts" ? { kind: "layout" } : { kind: "assembled", dims: false }} options={{ interactive: true, labels: true, loop: false }} paused={paused} speed={slow ? 0.45 : 1} onReady={h => { handle.current = h; }}/></div><div className="lab-visual-footer"><span>Arrastra para girar · Pellizca para acercarte</span><button aria-label="Restablecer vista de la guía" onClick={() => handle.current?.resetView()}><Maximize2 size={17}/></button></div></div>
      <aside className="lab-panel">{view === "steps" ? <>
        <p className="lab-eyebrow">PASO {step + 1} DE {guide.steps.length}{current.manualStep ? ` · MANUAL ${current.manualStep}` : ""}</p><div className="studio-step-picker"><label className="studio-sr" htmlFor="step-picker">Elegir paso</label><select id="step-picker" value={step} onChange={e => move(Number(e.target.value))}>{guide.steps.map((s, i) => <option key={i} value={i}>{i + 1}. {s.title}</option>)}</select></div>
        <h3>{current.title}</h3><p className="lab-step-detail">{current.detail}</p>{current.caution && <div className="lab-anchor-note">{current.caution}</div>}
        {source(current.sourcePage) && <a className="studio-manual-link" href={source(current.sourcePage)} target="_blank" rel="noreferrer"><FileText size={16}/>{current.sourcePage ? `Abrir manual · página ${current.sourcePage}` : "Abrir manual original"}</a>}
        <div className="lab-playback"><button onClick={() => { handle.current?.replay(); setPaused(false); }}><RotateCcw size={15}/>Repetir</button><button onClick={() => setPaused(p => !p)}>{paused ? "Reanudar" : "Pausar"}</button><button aria-pressed={slow} onClick={() => setSlow(s => !s)}>Más lento</button></div>
        <button className="studio-autoplay" aria-pressed={playing} onClick={() => { if (!playing && step === guide.steps.length - 1) setStep(0); setPlaying(p => !p); setPaused(false); }}>{playing ? <Pause size={16}/> : <Play size={16}/>} {playing ? "Detener secuencia" : "Reproducir todos los pasos"}</button>
        <div className="lab-step-nav"><button aria-label="Paso anterior de la guía" disabled={step === 0} onClick={() => move(step - 1)}><ArrowLeft size={18}/></button><button className="lab-primary" onClick={() => step === guide.steps.length - 1 ? setView("product") : move(step + 1)}>{step === guide.steps.length - 1 ? "Ver resultado" : "Siguiente paso"}<ArrowRight size={18}/></button></div>
      </> : <><p className="lab-eyebrow">{view === "parts" ? "INVENTARIO VISUAL" : "VISTA DEL RESULTADO"}</p><h3>{view === "parts" ? "Cada pieza, en su sitio." : "Así lo interpreta la IA."}</h3><p>{view === "parts" ? "Los códigos conservan las referencias del manual. Los herrajes pequeños pueden estar descritos solo en los pasos." : guide.summary}</p><p>{guide.people} persona{guide.people > 1 ? "s" : ""}{guide.tools.length ? ` · ${guide.tools.join(", ")}` : " · Herramientas: consulta el manual"}</p><button className="lab-primary" onClick={() => move(0)}>Ver montaje paso a paso<ArrowRight size={18}/></button></>}
      </aside>
    </section>
    <div className="studio-downloads"><VideoButton plan={plan} captions={captions}/><button className="studio-secondary" onClick={() => downloadBlob(new Blob([JSON.stringify(result, null, 2)], { type: "application/json" }), "guia-montaje.json")}><Download size={16}/>Guardar guía JSON</button></div>
    <section className="studio-evidence"><h3>Comprueba la interpretación</h3>{!!guide.warnings.length && <div className="studio-warnings"><strong>Advertencias recogidas del manual</strong><ul>{guide.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul></div>}<details><summary>Aproximaciones y límites del dibujo <span>{guide.assumptions.length}</span></summary><ul>{guide.assumptions.map((a, i) => <li key={i}>{a}</li>)}</ul></details><details><summary>Inventario interpretado <span>{guide.parts.length} piezas visuales</span></summary><div className="studio-table-scroll"><table><thead><tr><th>Código</th><th>Pieza</th><th>Geometría</th><th>Notas</th></tr></thead><tbody>{guide.parts.map(p => <tr key={p.id}><td>{p.label}</td><td>{p.name}</td><td>{p.geometryEvidence === "approximate" ? "Aproximada" : "Según manual"}</td><td>{p.note}{p.sourcePage ? ` (pág. ${p.sourcePage})` : ""}</td></tr>)}</tbody></table></div></details><p className="studio-help">Generada con {result.model} · {new Date(result.createdAt).toLocaleString("es-ES")} · {result.usage ? `${result.usage.input.toLocaleString("es-ES")} tokens de entrada / ${result.usage.output.toLocaleString("es-ES")} de salida` : "Consumo no disponible"}. Archivos: {result.files.join(", ")}. El JSON y el vídeo no incluyen la clave ni el manual.</p></section>
  </>;
}
