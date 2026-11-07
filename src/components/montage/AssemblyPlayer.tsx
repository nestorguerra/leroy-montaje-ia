"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import StageView, { type StageHandle } from "../StageView";
import { secondsForStep, type Caption } from "@/lib/video";
import type { Plan } from "@/lib/types";
import type { StageMode } from "@/engine/stage";
import CameraTools from "./CameraTools";

export type GuideView = "product" | "parts" | "assembly";

export default function AssemblyPlayer({ plan, captions, step, onStep, view, part, playing, onPlaying, reduceMotion }: {
  plan: Plan;
  captions: Caption[];
  step: number;
  onStep: (step: number) => void;
  view: GuideView;
  part: string | null;
  playing: boolean;
  onPlaying: (playing: boolean) => void;
  reduceMotion: boolean;
}) {
  const handle = useRef<StageHandle | null>(null);
  const [complete, setComplete] = useState(false);
  const [ready, setReady] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(secondsForStep(captions[step]));
  const [slow, setSlow] = useState(false);
  const [freeView, setFreeView] = useState(false);
  const mode: StageMode = view === "product" ? { kind: "assembled", dims: true }
    : view === "parts" ? part ? { kind: "part", ref: part } : { kind: "layout" }
      : { kind: "step", index: step };

  useEffect(() => {
    if (!ready || view !== "assembly") return;
    const interval = setInterval(() => {
      const stage = handle.current;
      if (!stage) return;
      const length = Math.max(secondsForStep(captions[step]), stage.getStepSeconds());
      const time = Math.min(length, Math.max(0, stage.getTime()));
      setDuration(length);
      setElapsed(time);
      if (playing && time >= length) {
        stage.setPaused(true);
        if (step < captions.length - 1) onStep(step + 1);
        else { setComplete(true); onPlaying(false); }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [ready, view, playing, captions, step, onStep, onPlaying]);

  function toggle() {
    if (!playing && (handle.current?.getTime() ?? 0) >= duration) {
      if (complete && step === captions.length - 1) { setComplete(false); onStep(0); }
      else handle.current?.seek(0);
    }
    onPlaying(!playing);
  }
  function replay() {
    setComplete(false);
    handle.current?.seek(0);
    setElapsed(0);
    onPlaying(true);
  }
  function seek(value: number) {
    setComplete(false);
    onPlaying(false);
    handle.current?.setPaused(true);
    handle.current?.seek(value);
    setElapsed(value);
  }
  function keyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    const turns: Record<string, [number, number]> = { ArrowLeft: [-0.18, 0], ArrowRight: [0.18, 0], ArrowUp: [0, 0.12], ArrowDown: [0, -0.12] };
    if (turns[event.key]) { event.preventDefault(); handle.current?.rotateView(...turns[event.key]); }
    else if (["+", "=", "-"].includes(event.key)) { event.preventDefault(); handle.current?.zoomView(event.key === "-" ? 1.15 : 1 / 1.15); }
    else if (event.key === "0") { event.preventDefault(); handle.current?.resetView(); }
    else if (event.code === "Space" && view === "assembly") { event.preventDefault(); toggle(); }
  }

  return <div className="assembly-player">
    <div className="assembly-screen" role="group" tabIndex={0} aria-label={`Modelo 3D de ${plan.spec.name}`} aria-describedby="viewer-help" onKeyDown={keyboard}>
      <StageView plan={plan} mode={mode} options={{ labels: true, callout: true, interactive: true, preserveView: true, loop: false }} paused={view !== "assembly" || !playing} speed={slow ? 0.5 : 1} instant={reduceMotion} onUserView={setFreeView} onReady={h => { handle.current = h; setReady(true); }} onModeReady={h => {
        setComplete(false);
        if (view === "assembly" && !playing) h.seek(Math.max(secondsForStep(captions[step]), h.getStepSeconds()));
        else if (view === "assembly" && reduceMotion) h.seek(0);
      }}/>
      <div className="viewer-badge"><span className="viewer-live-dot"/>3D INTERACTIVO</div>
      <span className="viewer-mode-caption">{view === "product" ? "El resultado final" : view === "parts" ? part ? "Una pieza, todos sus ángulos" : "Cada pieza en su sitio" : `Paso ${step + 1} de ${captions.length}`}</span>
      {!ready && <span className="viewer-loading" role="status">Abriendo el modelo 3D…</span>}
    </div>
    <CameraTools handle={handle} freeView={freeView}/>
    {view === "assembly" && <div className="assembly-transport" role="group" aria-label="Reproducción del montaje">
      <div className="transport-top"><span>{complete ? "Montaje completado" : `Paso ${step + 1} de ${captions.length}`}</span><span>{clock(elapsed)} / {clock(duration)}</span></div>
      <input className="assembly-scrubber" type="range" min="0" max={duration} step="0.05" value={Math.min(elapsed, duration)} aria-label="Avance de este paso" aria-valuetext={`${clock(elapsed)} de ${clock(duration)}`} style={{ "--progress": `${100 * elapsed / duration}%` } as CSSProperties} onChange={e => seek(Number(e.target.value))} disabled={!ready}/>
      <div className="transport-buttons">
        <button className="viewer-icon-button" aria-label="Paso anterior" disabled={step === 0 || !ready} onClick={() => onStep(step - 1)}><ChevronLeft size={21}/></button>
        <button className="player-play" aria-label={playing ? "Pausar montaje" : complete ? "Reproducir desde el principio" : "Reproducir montaje"} disabled={!ready} onClick={toggle}>{playing ? <Pause size={19} fill="currentColor"/> : <Play size={19} fill="currentColor"/>}</button>
        <button className="viewer-icon-button" aria-label="Paso siguiente" disabled={step === captions.length - 1 || !ready} onClick={() => onStep(step + 1)}><ChevronRight size={21}/></button>
        <button className="viewer-icon-button replay-step" aria-label="Repetir este paso" disabled={!ready} onClick={replay}><RotateCcw size={17}/><span>Repetir</span></button>
        <button className="viewer-speed" aria-label={slow ? "Restablecer velocidad normal" : "Reproducir a media velocidad"} aria-pressed={slow} onClick={() => setSlow(!slow)}>{slow ? "0,5×" : "1×"}</button>
      </div>
      <p className="transport-hint">Puedes girar el modelo mientras se monta.</p>
    </div>}
  </div>;
}

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
