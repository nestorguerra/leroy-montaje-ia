"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Search } from "lucide-react";
import type { AssemblyGuide } from "@/lib/ai/guide";
import type { InventoryGroup } from "@/lib/assembly-inventory";
import type { GuideView } from "./AssemblyPlayer";

const number = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 });
const cm = (mm: number) => `${number.format(mm / 10)} cm`;

export default function GuideDetails({ guide, inventory, view, step, onStep, part, onPart, onStart, manualURL }: {
  guide: AssemblyGuide;
  inventory: InventoryGroup[];
  view: GuideView;
  step: number;
  onStep: (step: number) => void;
  part: string | null;
  onPart: (ref: string | null) => void;
  onStart: () => void;
  manualURL: string;
}) {
  if (view === "parts") return <PartsPanel inventory={inventory} count={guide.parts.length} part={part} onPart={onPart} manualURL={manualURL}/>;
  if (view === "assembly") return <StepsPanel guide={guide} step={step} onStep={onStep} manualURL={manualURL}/>;
  return <aside className="guide-panel product-panel" aria-labelledby="product-title">
    <p className="panel-eyebrow">ANTES DE EMPEZAR</p><h2 id="product-title">Conoce lo que vas a montar.</h2><p className="product-summary">{guide.summary}</p>
    <dl className="product-measures">{[["Ancho", guide.dimensionsMm.x], ["Alto", guide.dimensionsMm.y], ["Fondo", guide.dimensionsMm.z]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{cm(Number(value))}</dd></div>)}</dl>
    <p className="product-facts">{guide.parts.length} piezas representadas<span>·</span>{guide.steps.length} pasos<span>·</span>{guide.people === 1 ? "1 persona" : "2 personas"}</p>
    {guide.tools.length > 0 && <div className="product-tools"><h3>Ten a mano</h3><p>{guide.tools.join(" · ")}</p></div>}
    <button className="guide-start-button" onClick={onStart}>Empezar montaje<ArrowRight size={18}/></button>
    <a className="guide-source" href={manualURL} target="_blank" rel="noreferrer">Abrir manual original<ArrowUpRight size={15}/></a>
  </aside>;
}

function PartsPanel({ inventory, count, part, onPart, manualURL }: { inventory: InventoryGroup[]; count: number; part: string | null; onPart: (ref: string | null) => void; manualURL: string }) {
  const [query, setQuery] = useState("");
  const search = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
  const filtered = inventory.filter(item => search(`${item.label} ${item.name}`).includes(search(query.trim())));
  const selected = inventory.find(item => item.ref === part);
  return <aside className="guide-panel parts-panel" aria-labelledby="parts-title">
    <p className="panel-eyebrow">TODO LO QUE NECESITAS</p><h2 id="parts-title">Pieza por pieza.</h2><p className="panel-intro">{count} piezas representadas. Toca una para verla por separado.</p>
    <label className="parts-search"><Search size={16}/><span className="visually-hidden">Buscar pieza o código</span><input type="search" placeholder="Buscar pieza o código" value={query} onChange={e => setQuery(e.target.value)}/></label>
    <button className={`parts-show-all ${!part ? "is-active" : ""}`} aria-pressed={!part} onClick={() => onPart(null)}>Ver todas las piezas<span>{count}</span></button>
    <ul className="parts-list" aria-label="Inventario de piezas">{filtered.map(item => <li key={item.ref}><button aria-pressed={part === item.ref} onClick={() => onPart(item.ref)}><span className="part-code">{item.label}</span><span className="part-name">{item.name}<small>{cm(item.part.sizeMm.x)} × {cm(item.part.sizeMm.y)} × {cm(item.part.sizeMm.z)}</small></span><span className="part-count">×{item.count}</span></button></li>)}</ul>
    {filtered.length === 0 && <p className="parts-empty" role="status">No hay piezas con ese nombre o código.</p>}
    {selected && <div className="part-selection" role="status"><strong>{selected.name}</strong><p>{selected.count === 1 ? "Pieza aislada." : `Mostrando 1 de ${selected.count} unidades.`} {selected.part.note}</p><a className="guide-source" href={`${manualURL}${selected.part.sourcePage ? `#page=${selected.part.sourcePage}` : ""}`} target="_blank" rel="noreferrer">Ver en el manual<ArrowUpRight size={15}/></a></div>}
  </aside>;
}

function StepsPanel({ guide, step, onStep, manualURL }: { guide: AssemblyGuide; step: number; onStep: (step: number) => void; manualURL: string }) {
  const list = useRef<HTMLOListElement>(null);
  const current = guide.steps[step];
  useEffect(() => {
    const container = list.current;
    const active = container?.querySelector('[aria-current="step"]');
    if (!container || !active) return;
    const box = container.getBoundingClientRect(), item = active.getBoundingClientRect();
    if (item.top < box.top) container.scrollTop += item.top - box.top;
    else if (item.bottom > box.bottom) container.scrollTop += item.bottom - box.bottom;
  }, [step]);
  return <aside className="guide-panel guide-steps" aria-labelledby="steps-title">
    <div className="guide-current-step"><p className="panel-eyebrow">PASO {step + 1} DE {guide.steps.length}</p><h2 id="steps-title">{current.title}</h2><p className="guide-step-detail">{current.detail}</p>{current.caution && <p className="guide-step-caution">{current.caution}</p>}
      <a className="guide-source" href={`${manualURL}${current.sourcePage ? `#page=${current.sourcePage}` : ""}`} target="_blank" rel="noreferrer">{current.sourcePage ? `Página ${current.sourcePage} del manual` : "Ver manual original"}<ArrowUpRight size={15}/></a>
    </div>
    <div className="guide-steps-heading"><h3>Todos los pasos</h3><span>{step + 1} / {guide.steps.length}</span></div>
    <ol ref={list} aria-label="Elegir paso del montaje">{guide.steps.map((item, index) => <li key={index} className={step === index ? "is-current" : ""}><button className="guide-step" aria-current={step === index ? "step" : undefined} onClick={() => onStep(index)}><span className="guide-step-number">{String(index + 1).padStart(2, "0")}</span><span className="guide-step-copy"><strong>{item.title}</strong></span>{index < step && <span className="guide-step-visited" aria-hidden="true">·</span>}</button></li>)}</ol>
  </aside>;
}
