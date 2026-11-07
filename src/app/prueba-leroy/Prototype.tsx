"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import StageView, { type StageHandle } from "@/components/StageView";
import ManualStudio from "@/components/ManualStudio";
import VideoButton from "@/components/VideoButton";
import { buildDayPlan } from "@/lib/leroy/day-plan";
import { buildNeoPlan } from "@/lib/leroy/neo-plan";
import day from "@/data/leroy-day.json";
import neo from "@/data/leroy-neo.json";
import { ArrowLeft, ArrowRight, RotateCcw, Layers, Box, Play, FileText, Check, Maximize2 } from "lucide-react";
import "./prototype.css";
import "./studio.css";

type ProductId = "day" | "neo";
type View = "product" | "parts" | "steps";
const number = (n: number) => n.toLocaleString("es-ES");
const choices = [
  { id: "day" as const, name: "Mesa DAY", description: "Sencillo · 4 piezas", n: "01" },
  { id: "neo" as const, name: "Cómoda NEO", description: "Complejo · 3 cajones", n: "02" },
];

export default function Prototype() {
  const [productId, setProductId] = useState<ProductId | "manual">("manual");
  return <div className="lab">
    <div className="lab-strip">LEROY MONTAJE IA <span>Una adaptación independiente de Bygga, sin afiliación oficial con Leroy Merlin</span></div>
    <header className="lab-header">
      <a className="lab-brand" href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/`}><span className="lab-brand-icon"><Layers size={23}/></span><span>Del manual al montaje<small>Una guía visual para cada pieza</small></span></a>
      <a className="lab-source-link" href="#fuentes"><FileText size={16}/> Datos y fuentes</a>
    </header>
    <main>
      <nav className="lab-products" aria-label="Elegir manual o ejemplo">
        <button aria-pressed={productId === "manual"} onClick={() => setProductId("manual")}><span className="lab-choice-number">✦</span><span><strong>Tu manual con IA</strong><small>PDF o fotos · OpenAI</small></span><span className="lab-choice-dot"/></button>
        {choices.map(choice => <button key={choice.id} aria-pressed={productId === choice.id} onClick={() => setProductId(choice.id)}>
          <span className="lab-choice-number">{choice.n}</span><span><strong>{choice.name}</strong><small>{choice.description}</small></span><span className="lab-choice-dot"/>
        </button>)}
      </nav>
      <div hidden={productId !== "manual"}><ManualStudio/></div>
      {productId !== "manual" && <ProductPreview key={productId} productId={productId}/>}
    </main>
    <footer className="lab-footer"><p>Adaptación experimental sobre <a href="https://github.com/Nutlope/bygga" target="_blank" rel="noreferrer">Bygga, código abierto con licencia MIT</a>. Conserva su motor 3D. Mesa DAY y cómoda NEO son ejemplos preparados a mano; los nuevos manuales se interpretan con OpenAI.</p><p>Guías visuales esquemáticas. Contrasta siempre los pasos con el manual del fabricante. Vídeo animado sin audio, generado en tu navegador.</p></footer>
  </div>;
}

function ProductPreview({ productId }: { productId: ProductId }) {
  const isNeo = productId === "neo";
  const product = isNeo ? neo : day;
  const [view, setView] = useState<View>("product");
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [slow, setSlow] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [diameter, setDiameter] = useState(day.diameterCm);
  const [height, setHeight] = useState(day.heightCm);
  const plan = useMemo(() => isNeo ? buildNeoPlan() : buildDayPlan(diameter, height), [isNeo, diameter, height]);
  const handle = useRef<StageHandle | null>(null);
  const workspace = useRef<HTMLElement | null>(null);
  const variant = !isNeo && (diameter !== day.diameterCm || height !== day.heightCm);
  const current = plan.steps[step];
  useEffect(() => {
    if (!autoplay || paused || view !== "steps") return;
    const duration = Math.max(8, (handle.current?.getStepSeconds() ?? 8) / (slow ? .45 : 1));
    const timer = setTimeout(() => { if (step < plan.steps.length - 1) setStep(n => n + 1); else setAutoplay(false); }, duration * 1000);
    return () => clearTimeout(timer);
  }, [autoplay, paused, view, step, plan.steps.length, slow]);
  const start = () => {
    setStep(0); setView("steps"); setPaused(false);
    workspace.current?.scrollIntoView({ behavior: "auto", block: "start" });
  };
  const move = (n: number) => { setStep(n); setPaused(false); setAutoplay(false); };
  const dimensions = isNeo ? [
    { value:neo.widthCm, label:"ancho" }, { value:neo.heightCm, label:"alto" }, { value:neo.depthCm, label:"fondo" },
  ] : [{ value:diameter, label:"diámetro" }, { value:height, label:"alto" }];
  return <>
    <section className="lab-heading">
      <div><p className="lab-eyebrow">{isNeo ? "02 · UN MONTAJE CON MÁS ETAPAS" : "01 · EMPEZAMOS POR LO SENCILLO"}</p><h1>{product.name}<span>Ver. Entender. Montar.</span></h1><p className="lab-intro">{isNeo ? "De los tableros a los cajones: un segundo caso para probar los límites de la adaptación." : "Del catálogo de Leroy a una guía visual con el motor 3D abierto de Bygga."}</p></div>
      <div className="lab-dimensions">{dimensions.map(d => <div key={d.label}><strong>{number(d.value)}<small> cm</small></strong><span>{d.label}</span></div>)}<div className="lab-legs">{isNeo ? "3 cajones" : "3 patas"}</div></div>
    </section>
    <div className="lab-notice"><span className="lab-status">{variant ? "VARIACIÓN HIPOTÉTICA" : "MODELO SIMPLIFICADO"}</span><p>{variant ? "Estas medidas son una simulación. No corresponden a una variante confirmada del catálogo." : isNeo ? "Las medidas de los tableros y el orden de montaje proceden del manual. Las posiciones de las uniones y los herrajes son esquemáticas." : "Las medidas generales y el proceso están documentados. El grosor, las patas y los anclajes se dibujan de forma aproximada."} <a href="#fuentes">Ver qué falta validar</a>.</p></div>
    <section ref={workspace} className="lab-workspace" aria-label={`Guía interactiva: ${product.name}`}>
      <div className="lab-visual">
        <nav className="lab-views" aria-label="Vistas del producto">
          <button aria-pressed={view === "product"} onClick={() => setView("product")}><Box size={16}/>Producto</button>
          <button aria-pressed={view === "parts"} onClick={() => setView("parts")}><Layers size={16}/>Piezas</button>
          <button aria-pressed={view === "steps"} onClick={start}><Play size={16}/>Montaje</button>
        </nav>
        <div className="lab-canvas" role="img" aria-label={view === "steps" ? `Modelo 3D, paso ${step + 1}: ${current.title}` : `Modelo 3D simplificado: ${product.name}`}>
          <StageView plan={plan} mode={view === "steps" ? {kind:"step",index:step} : view === "parts" ? {kind:"layout"} : {kind:"assembled",dims:true}} paused={paused} speed={slow ? .45 : 1} options={{callout:true,labels:true,interactive:true}} onReady={h => { handle.current = h; }}/>
        </div>
        <div className="lab-visual-footer"><span>Arrastra para girar · Usa la rueda para acercarte</span><button aria-label="Restablecer vista" title="Restablecer vista" onClick={() => handle.current?.resetView()}><Maximize2 size={17}/></button></div>
      </div>
      <aside className="lab-panel">
        {view === "product" ? <>
          <p className="lab-eyebrow">ANTES DE EMPEZAR</p><h2>{isNeo ? <>Más piezas.<br/> Más conexiones.</> : <>Una mesa.<br/> Cuatro piezas.</>}</h2>
          <p>{isNeo ? "Una estructura de ocho tableros y tres cajones. El superior es más bajo. El manual describe 14 etapas, desde los cajones hasta su instalación." : "Un tablero circular y tres patas de bambú. El manual enlazado por Leroy describe un montaje por rosca, sin herramientas externas."}</p>
          <div className="lab-part-list">{(isNeo ? [
            {label:"A",name:"Estructura",detail:"Costados, travesaños, base, trasera y tapa",qty:8},
            {label:"B",name:"Tableros de los cajones",detail:"5 por cajón, 3 cajones",qty:15},
            {label:"C",name:"Guías metálicas HR",detail:"2 por cajón",qty:6},
          ] : [
            {label:"A",name:"Tablero de MDF",detail:"Diámetro publicado: 40 cm",qty:1},
            {label:"B",name:"Patas de bambú",detail:"Geometría simplificada",qty:3},
          ]).map(part => <div key={part.label}><span>{part.label}</span><p>{part.name}<small>{part.detail}</small></p><b>{part.qty}</b></div>)}</div>
          <div className="lab-small-note">{isNeo ? "El manual exige fijar la cómoda a la pared. El dibujo no valida el anclaje ni sustituye una revisión del montaje real." : "El dibujo no reproduce el detalle real de las roscas. Consulta siempre el manual del producto."}</div>
          <button className="lab-primary" onClick={start}>Explorar el montaje <ArrowRight size={19}/></button>
        </> : view === "parts" ? <>
          <p className="lab-eyebrow">PREPARA LAS PIEZAS</p><h2>Todo a la vista.</h2>
          <p>{isNeo ? "La vista separada muestra los 23 tableros. El inventario bajo el dibujo conserva los códigos del manual para poder cotejarlos." : "Identifica el tablero y las tres patas antes de empezar. La vista separada permite reconocer cada componente."}</p>
          <ul className="lab-checklist">{(isNeo ? ["8 tableros de estructura", "15 tableros de cajones", "Herrajes y consumibles: consulta el inventario", "Dos personas al unir la estructura"] : ["1 tablero circular", "3 patas", "Superficie limpia y blanda de apoyo"]).map(text=><li key={text}><Check size={17}/>{text}</li>)}</ul>
          <div className="lab-small-note">{isNeo ? "Las letras de la vista 3D son etiquetas de esta prueba. Los códigos entre paréntesis en el inventario corresponden al manual." : "No añadimos tornillos sueltos: el documento describe patas que se enroscan en los anclajes del tablero."}</div>
          <button className="lab-primary" onClick={start}>Empezar paso a paso <ArrowRight size={19}/></button>
        </> : <>
          <p className="lab-eyebrow">PASO {step + 1} DE {plan.steps.length}{isNeo ? ` · MANUAL, PÁG. ${neo.manualStepPages[step]}` : ""}</p>
          <div className="lab-progress" aria-label={`Paso ${step + 1} de ${plan.steps.length}`}>{plan.steps.map((_, i) => <button key={i} aria-label={`Ir al paso ${i+1}`} title={`Paso ${i+1}: ${plan.steps[i].title}`} aria-current={i === step ? "step" : undefined} className={i <= step ? "is-done" : ""} onClick={() => move(i)}/>)}</div>
          <h2>{current.title}</h2><p className="lab-step-detail">{current.detail}</p>
          {isNeo && step === 11 ? <div className="lab-anchor-note">Fijación obligatoria según el manual. Requiere comprobar la pared y escoger las fijaciones adecuadas.</div> : <div className="lab-source-note"><FileText size={16}/><span>{isNeo ? "Conservamos las 14 etapas y su orden. La animación simplifica los movimientos y la forma de las uniones." : "Basado en los apartados 2 y 4 del manual. La fase de las patas se divide en tres acciones para mostrarla con claridad."}</span></div>}
          <div className="lab-playback"><button onClick={() => {handle.current?.replay();setPaused(false);}}><RotateCcw size={16}/>Repetir</button><button onClick={() => setPaused(!paused)}>{paused ? "Reanudar" : "Pausar"}</button><button aria-pressed={slow} onClick={() => setSlow(!slow)}>Más lento</button></div>
          <button className="studio-autoplay" aria-pressed={autoplay} onClick={() => {if (!autoplay && step === plan.steps.length - 1) setStep(0); setAutoplay(!autoplay); setPaused(false);}}><Play size={16}/>{autoplay ? "Detener secuencia" : "Reproducir todos los pasos"}</button>
          <div className="lab-step-nav"><button disabled={step === 0} aria-label="Paso anterior" onClick={() => move(step-1)}><ArrowLeft size={19}/></button>{step < plan.steps.length-1 ? <button className="lab-primary" onClick={() => move(step+1)}>Siguiente paso <ArrowRight size={19}/></button> : <button className="lab-primary" onClick={() => setView("product")}>Volver al producto <Check size={19}/></button>}</div>
        </>}
      </aside>
    </section>
    <div className="studio-downloads"><VideoButton plan={plan} captions={plan.steps.map((s,i) => ({title:s.title,detail:s.detail || "",page:isNeo ? neo.manualStepPages[i] : null}))}/></div>
    {isNeo ? <details className="lab-inventory"><summary>Inventario del manual <span>23 tableros, herrajes y consumibles</span></summary><div className="lab-inventory-scroll"><table><caption>Tableros, página 3. Medidas en milímetros, tal como aparecen en el manual.</caption><thead><tr><th>Código</th><th>Pieza</th><th>Cantidad</th><th>Medidas</th></tr></thead><tbody>{neo.panels.map(p=><tr key={p.code}><td>{p.code}</td><td>{p.name}</td><td>{p.qty}</td><td>{p.mm.join(" × ")}</td></tr>)}</tbody></table></div><p className="lab-hardware-list">{Object.entries(neo.fittings).map(([code, qty])=><span key={code}>{code} <b>× {qty}</b></span>)}</p><p className="lab-inventory-note">Inventario de la página 4. CF es adhesivo y HV es la herramienta indicada. Ambos constan aquí; no se representan como tableros o fijaciones en el dibujo. Las medidas de los herrajes dibujados son aproximadas.</p></details> : <details className="lab-experiment"><summary>Probar cómo cambia el dibujo con otras medidas <span>Experimento, no catálogo</span></summary><div><p>Los mismos pasos generan otra geometría al cambiar los datos. Esto prueba la reutilización de la plantilla, no la validez de otro producto.</p><label>Diámetro: {diameter} cm<input aria-label="Diámetro de prueba" type="range" min="30" max="70" step="5" value={diameter} onChange={e => setDiameter(Number(e.target.value))}/></label><label>Altura: {height} cm<input aria-label="Altura de prueba" type="range" min="30" max="70" step="5" value={height} onChange={e => setHeight(Number(e.target.value))}/></label><button onClick={() => {setDiameter(40);setHeight(40);}}>Restablecer medidas publicadas</button></div></details>}
    <section id="fuentes" className="lab-evidence">
      <div className="lab-evidence-heading"><p className="lab-eyebrow">QUÉ SABEMOS Y QUÉ NO</p><h2>La prueba, con sus fuentes.</h2><p>Referencia Leroy {product.reference}. {isNeo ? "Manual enlazado: " : "El manual vinculado identifica la mesa gris de tres patas como "}{product.manufacturerReference}.</p></div>
      <div className="lab-evidence-grid"><article><span className="lab-tag green">Documentado</span><h3>Datos de partida</h3><ul>{product.confirmed.map(x => <li key={x}>{x}</li>)}</ul><a href={product.productUrl} target="_blank" rel="noreferrer">Abrir ficha en Leroy Merlin</a><a href={product.manualUrl} target="_blank" rel="noreferrer">Consultar manual enlazado por Leroy</a></article><article><span className="lab-tag amber">Aproximado</span><h3>Solo para visualizar</h3><ul>{product.assumptions.map(x => <li key={x}>{x}</li>)}</ul></article><article><span className="lab-tag neutral">Pendiente</span><h3>Antes de usarlo como guía real</h3><ul>{product.pending.map(x => <li key={x}>{x}</li>)}</ul></article></div>
    </section>
  </>;
}
