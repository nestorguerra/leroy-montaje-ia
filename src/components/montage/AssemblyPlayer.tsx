"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Pause, Play } from "lucide-react";
import StageView, { type StageHandle } from "../StageView";
import { exportVideo, secondsForStep, type Caption } from "@/lib/video";
import type { Plan } from "@/lib/types";

export default function AssemblyPlayer({ plan, captions, step, onStep, reduceMotion }: {
  plan: Plan;
  captions: Caption[];
  step: number;
  onStep: (step: number) => void;
  reduceMotion: boolean;
}) {
  const [playing, setPlaying] = useState(!reduceMotion);
  const [progress, setProgress] = useState(0);
  const [asset, setAsset] = useState<{ url: string; extension: string } | null>(null);
  const [exportError, setExportError] = useState("");
  const [ready, setReady] = useState(false);
  const video = useRef<HTMLVideoElement | null>(null);
  const handle = useRef<StageHandle | null>(null);
  const chapters = useRef<number[]>([]);
  const liveElapsed = useRef(0);
  const previousStep = useRef(step);
  const currentStep = useRef(step);
  const playback = useRef(playing);
  const pendingSeek = useRef(false);
  useEffect(() => { currentStep.current = step; playback.current = playing; }, [step, playing]);

  useEffect(() => {
    const abort = new AbortController();
    let url = "";
    exportVideo(plan, captions, { signal: abort.signal, onProgress: setProgress, onChapters: seconds => { chapters.current = seconds; } }).then(blob => {
      if (abort.signal.aborted) return;
      url = URL.createObjectURL(blob);
      setAsset({ url, extension: blob.type.includes("mp4") ? "mp4" : "webm" });
    }).catch(e => {
      if (!abort.signal.aborted) setExportError(e instanceof Error ? e.message : "El vídeo no está disponible en este navegador.");
    });
    return () => { abort.abort(); if (url) URL.revokeObjectURL(url); };
  }, [plan, captions]);

  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    liveElapsed.current = 0;
    if (asset && video.current && Math.abs(indexAt(video.current.currentTime, chapters.current) - step) > 0) {
      pendingSeek.current = true;
      video.current.currentTime = chapters.current[step] || 0;
    }
  }, [step, asset]);

  useEffect(() => {
    if (asset || !ready || !playing) return;
    const duration = Math.max(secondsForStep(captions[step]), handle.current?.getStepSeconds() || 6);
    let last = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      if (!document.hidden) liveElapsed.current += Math.min((now - last) / 1000, 0.25);
      last = now;
      if (liveElapsed.current >= duration) {
        liveElapsed.current = 0;
        if (step < captions.length - 1) onStep(step + 1);
        else setPlaying(false);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [asset, ready, playing, captions, step, onStep]);

  useEffect(() => {
    if (!asset || !video.current) return;
    if (playing) void video.current.play().catch(() => setPlaying(false));
    else video.current.pause();
  }, [playing, asset]);

  function toggle() {
    if (!asset && !playing && step === captions.length - 1 && liveElapsed.current === 0) onStep(0);
    if (reduceMotion && !playing) liveElapsed.current = 0;
    setPlaying(p => !p);
  }
  function onVideoReady() {
    const element = video.current;
    if (!element) return;
    const index = currentStep.current;
    const chapter = chapters.current[index] || 0;
    const chapterEnd = chapters.current[index + 1] ?? (Number.isFinite(element.duration) ? element.duration : chapter + secondsForStep(captions[index]));
    const start = reduceMotion && !playback.current ? Math.max(chapter, chapterEnd - 0.25) : chapter + liveElapsed.current;
    element.currentTime = Number.isFinite(element.duration) ? Math.min(start, Math.max(0, element.duration - 0.25)) : start;
    if (playback.current) void element.play().catch(() => setPlaying(false));
  }
  function syncStep(element: HTMLVideoElement) {
    if (pendingSeek.current || element.seeking) return;
    const index = indexAt(element.currentTime, chapters.current);
    if (index !== currentStep.current) onStep(index);
  }
  return <div className="assembly-player">
    <div className="assembly-screen" aria-label="Vídeo del montaje">
      {asset ? <video ref={video} src={asset.url} controls playsInline muted preload="auto" onLoadedMetadata={onVideoReady} onTimeUpdate={e => syncStep(e.currentTarget)} onSeeked={e => { pendingSeek.current = false; syncStep(e.currentTarget); }} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} aria-label={`Vídeo de montaje de ${plan.spec.name}`}/> : <>
        <StageView plan={plan} mode={{ kind: "step", index: step }} options={{ labels: true, interactive: false, loop: false }} paused={!playing} instant={reduceMotion && !playing} onReady={h => { handle.current = h; setReady(true); }}/>
        <div className="live-player-top"><span>ANIMACIÓN DE MONTAJE</span><span>{step + 1} / {captions.length}</span></div>
        <div className="live-player-bottom"><button className="player-play" aria-label={playing ? "Pausar animación" : "Reproducir animación"} onClick={toggle}>{playing ? <Pause size={18} fill="currentColor"/> : <Play size={18} fill="currentColor"/>}</button><span>{captions[step].title}</span><div className="live-step-track" aria-hidden="true">{captions.map((_, i) => <i key={i} className={i <= step ? "is-played" : ""}/>)}</div></div>
      </>}
    </div>
    <div className="player-caption"><span role="status">{asset ? "Vídeo listo. A tu ritmo." : exportError ? "Puedes seguir la animación y los pasos." : `Preparando el vídeo · ${progress}%`}</span>{asset && <a href={asset.url} download={`montaje.${asset.extension}`}><Download size={14}/>Guardar vídeo</a>}</div>
    {exportError && <p className="player-export-note">La descarga de vídeo no está disponible. {exportError}</p>}
  </div>;
}

function indexAt(time: number, chapters: number[]) {
  let step = 0;
  for (let i = 0; i < chapters.length; i++) { if (time + 0.05 >= chapters[i]) step = i; else break; }
  return step;
}
