"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, FileText } from "lucide-react";
import { buildAIPlan } from "@/lib/ai/guide";
import type { GeneratedGuide } from "@/lib/ai/openai";
import AssemblyPlayer from "./AssemblyPlayer";
import PDFDropzone from "./PDFDropzone";

export default function GuideExperience({ result, manualURL, onFiles, dragging, reduceMotion }: {
  result: GeneratedGuide;
  manualURL: string;
  onFiles: (files: File[]) => void;
  dragging: boolean;
  reduceMotion: boolean;
}) {
  const [step, setStep] = useState(0);
  const heading = useRef<HTMLHeadingElement | null>(null);
  const guide = result.guide;
  const plan = useMemo(() => buildAIPlan(guide), [guide]);
  const captions = useMemo(() => guide.steps.map(s => ({ title: s.title, detail: s.detail, page: s.sourcePage, caution: s.caution })), [guide]);
  useEffect(() => { heading.current?.focus(); }, []);
  const current = guide.steps[step];

  return <section className="guide-experience" aria-labelledby="guide-title">
    <div className="guide-heading"><div><p className="montage-eyebrow">TU GUÍA DE MONTAJE</p><h1 id="guide-title" ref={heading} tabIndex={-1}>{guide.name}</h1><p>{guide.steps.length} pasos. Todo a tu ritmo.</p></div><div className="guide-file"><FileText size={15}/><span>{result.files[0]}</span></div></div>
    <div className="guide-layout">
      <div className="guide-film"><AssemblyPlayer plan={plan} captions={captions} step={step} onStep={setStep} reduceMotion={reduceMotion}/><p className="guide-film-note">Una interpretación visual. Comprueba las uniones y medidas en el manual.</p></div>
      <aside className="guide-steps" aria-labelledby="steps-title"><div className="guide-steps-heading"><h2 id="steps-title">Paso a paso.</h2><span>{step + 1} de {guide.steps.length}</span></div><ol>{guide.steps.map((item, index) => <li key={index} className={step === index ? "is-current" : ""}><button className="guide-step" aria-current={step === index ? "step" : undefined} onClick={() => setStep(index)}><span className="guide-step-number">{String(index + 1).padStart(2, "0")}</span><span className="guide-step-copy"><strong>{item.title}</strong>{step === index && <><span className="guide-step-detail">{item.detail}</span>{item.caution && <span className="guide-step-caution">{item.caution}</span>}{item.sourcePage && <small>Página {item.sourcePage} del manual</small>}</>}</span></button></li>)}</ol><a className="guide-source" href={`${manualURL}${current.sourcePage ? `#page=${current.sourcePage}` : ""}`} target="_blank" rel="noreferrer">Ver manual original<ArrowUpRight size={15}/></a></aside>
    </div>
    {(guide.warnings.length > 0 || guide.assumptions.length > 0) && <details className="guide-context"><summary>Antes de montar, ten en cuenta</summary>{guide.warnings.length > 0 && <div><h2>Indicaciones del manual</h2><ul>{guide.warnings.map((warning, i) => <li key={i}>{warning}</li>)}</ul></div>}{guide.assumptions.length > 0 && <div><h2>Qué simplifica esta animación</h2><ul>{guide.assumptions.map((assumption, i) => <li key={i}>{assumption}</li>)}</ul></div>}</details>}
    <PDFDropzone compact onFiles={onFiles} dragging={dragging}/>
  </section>;
}
