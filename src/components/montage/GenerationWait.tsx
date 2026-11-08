"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Clock3, FileText, LoaderCircle, X } from "lucide-react";
import { browserStorage } from "@/lib/browser-session";
import { estimateRemaining, formatElapsed, loadGenerationTimes } from "@/lib/generation-timing";
import NailGame from "./NailGame";

export default function GenerationWait({ filename, phase, startedAt, model, reduceMotion, onCancel }: {
  filename: string;
  phase: "interpreting" | "correcting";
  startedAt: number;
  model: string;
  reduceMotion: boolean;
  onCancel: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [elapsed, setElapsed] = useState(0);
  const [samples] = useState(() => loadGenerationTimes(browserStorage("localStorage"), model));
  useEffect(() => {
    heading.current?.focus({ preventScroll: true }); window.scrollTo(0, 0);
    const update = () => setElapsed(Math.max(0, Date.now() - startedAt));
    const first = setTimeout(update, 0), interval = setInterval(update, 1000);
    document.addEventListener("visibilitychange", update);
    return () => { clearTimeout(first); clearInterval(interval); document.removeEventListener("visibilitychange", update); };
  }, [startedAt]);
  const estimate = estimateRemaining(elapsed, samples);
  const remaining = estimate.kind === "unknown" ? "OpenAI no indica cuánto falta." : estimate.kind === "longer" ? "Está tardando más que tus guías anteriores." : estimate.from === 0 ? `Orientativo: menos de ${estimate.to} ${estimate.to === 1 ? "minuto" : "minutos"} más.` : estimate.from === estimate.to ? `Orientativo: unos ${estimate.to} minutos más.` : `Orientativo: entre ${estimate.from} y ${estimate.to} minutos más.`;
  return <section className="generation-wait" aria-labelledby="processing-title">
    <div className="generation-copy"><p className="montage-eyebrow">TU GUÍA ESTÁ EN CAMINO</p><h1 ref={heading} id="processing-title" tabIndex={-1}>Tu guía,<br/><span>en marcha.</span></h1><p className="generation-description">Puedes afinar la puntería mientras preparamos tu montaje. La guía aparecerá aquí en cuanto esté lista.</p>
      <div className="generation-progress" role="status" aria-atomic="true"><LoaderCircle size={18}/><span>{phase === "correcting" ? "Ajustando piezas y movimientos" : "Interpretando piezas y pasos"}</span></div>
      <div className="generation-clock" aria-live="off"><Clock3 size={16}/><div><span>Tiempo transcurrido</span><strong>{formatElapsed(elapsed)}</strong></div></div>
      <p className="generation-estimate">{remaining}{estimate.kind !== "unknown" && <> <span>Referencia de tus últimas guías, puede variar según el manual.</span></>}</p>
      <div className="processing-file generation-file"><FileText size={16}/><span>{filename}</span><button aria-label="Cancelar lectura del manual" onClick={onCancel}><X size={17}/></button></div>
      <p className="generation-reassurance"><Check size={13}/>El juego no cambia la velocidad de la IA.</p>
    </div>
    <NailGame reduceMotion={reduceMotion}/>
  </section>;
}
