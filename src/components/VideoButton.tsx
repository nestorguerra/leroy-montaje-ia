"use client";

import { useEffect, useRef, useState } from "react";
import { Download, X } from "lucide-react";
import type { Plan } from "@/lib/types";
import { downloadBlob, exportVideo, type Caption } from "@/lib/video";

export default function VideoButton({ plan, captions }: { plan: Plan; captions: Caption[] }) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function record() {
    const abort = new AbortController(); controller.current = abort;
    setError(""); setProgress(0);
    try {
      const blob = await exportVideo(plan, captions, { signal: abort.signal, onProgress: setProgress });
      if (!abort.signal.aborted) downloadBlob(blob, `${plan.spec.name.replace(/[^a-zA-Z0-9áéíóúñ -]/g, "").slice(0, 80)}-montaje.${blob.type.includes("mp4") ? "mp4" : "webm"}`);
    } catch (e) {
      if (!abort.signal.aborted) setError(e instanceof Error ? e.message : "No se ha podido exportar el vídeo.");
    } finally {
      if (controller.current === abort) { setProgress(null); controller.current = null; }
    }
  }
  return <div className="video-export">
    {progress === null ? <button className="studio-secondary" onClick={record}><Download size={16}/>Descargar vídeo</button> : <div className="video-recording" role="status"><span>Grabando {progress}% · Mantén esta pestaña visible</span><button aria-label="Cancelar exportación" onClick={() => controller.current?.abort()}><X size={16}/></button></div>}
    <small>Vídeo animado con los pasos escritos, sin audio. Se exporta en tiempo real.</small>
    {error && <p role="alert" className="studio-error">{error}</p>}
  </div>;
}
