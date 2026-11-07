"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FileText } from "lucide-react";
import { buildAIPlan } from "@/lib/ai/guide";
import { assemblyInventory } from "@/lib/assembly-inventory";
import type { GeneratedGuide } from "@/lib/ai/openai";
import AssemblyPlayer, { type GuideView } from "./AssemblyPlayer";
import GuideTabs from "./GuideTabs";
import GuideDetails from "./GuideDetails";
import PDFDropzone from "./PDFDropzone";

export default function GuideExperience({ result, manualURL, onFiles, dragging, reduceMotion }: {
  result: GeneratedGuide;
  manualURL: string;
  onFiles: (files: File[]) => void;
  dragging: boolean;
  reduceMotion: boolean;
}) {
  const [step, setStep] = useState(0);
  const [view, setView] = useState<GuideView>("product");
  const [part, setPart] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const heading = useRef<HTMLHeadingElement | null>(null);
  const guide = result.guide;
  const plan = useMemo(() => buildAIPlan(guide), [guide]);
  const inventory = useMemo(() => assemblyInventory(guide, plan), [guide, plan]);
  const captions = useMemo(() => guide.steps.map(s => ({ title: s.title, detail: s.detail, page: s.sourcePage, caution: s.caution })), [guide]);
  useEffect(() => { heading.current?.focus(); }, []);
  function changeView(next: GuideView) { setView(next); setPlaying(false); }
  function start() {
    setView("assembly"); setPlaying(!reduceMotion);
    requestAnimationFrame(() => document.getElementById("tab-assembly")?.focus({ preventScroll: true }));
  }

  return <section className="guide-experience" aria-labelledby="guide-title">
    <div className="guide-heading"><div><p className="montage-eyebrow">TU GUÍA INTERACTIVA</p><h1 id="guide-title" ref={heading} tabIndex={-1}>{guide.name}</h1><p>Explora cada pieza. Monta a tu ritmo.</p></div><div className="guide-file"><FileText size={15}/><span>{result.files[0]}</span></div></div>
    <GuideTabs view={view} onView={changeView}/>
    <div id="guide-workspace" className="guide-layout" role="tabpanel" aria-labelledby={`tab-${view}`}>
      <div className="guide-film"><AssemblyPlayer plan={plan} captions={captions} step={step} onStep={setStep} view={view} part={part} playing={playing} onPlaying={setPlaying} reduceMotion={reduceMotion}/><p className="guide-film-note">Modelo esquemático generado con IA. Contrasta las medidas y uniones con el manual.</p></div>
      <GuideDetails guide={guide} inventory={inventory} view={view} step={step} onStep={setStep} part={part} onPart={setPart} onStart={start} manualURL={manualURL}/>
    </div>
    {(guide.warnings.length > 0 || guide.assumptions.length > 0) && <details className="guide-context"><summary>Antes de montar, ten en cuenta</summary>{guide.warnings.length > 0 && <div><h2>Indicaciones del manual</h2><ul>{guide.warnings.map((warning, i) => <li key={i}>{warning}</li>)}</ul></div>}{guide.assumptions.length > 0 && <div><h2>Qué simplifica esta animación</h2><ul>{guide.assumptions.map((assumption, i) => <li key={i}>{assumption}</li>)}</ul></div>}</details>}
    <PDFDropzone compact onFiles={onFiles} dragging={dragging}/>
  </section>;
}
