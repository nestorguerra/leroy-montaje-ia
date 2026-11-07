import type { Plan } from "./types";

export type Caption = { title: string; detail: string; page?: number | null; caution?: string };
export const secondsForStep = (caption: Caption, slow = false) => Math.max(6, Math.min(24, (caption.detail + (caption.caution || "")).split(/\s+/).length / 2.8)) * (slow ? 1.6 : 1);

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

function lines(context: CanvasRenderingContext2D, text: string, width: number) {
  const rows: string[] = [];
  let row = "";
  for (const word of text.split(/\s+/)) {
    if (context.measureText(`${row} ${word}`).width > width && row) { rows.push(row); row = word; }
    else row = row ? `${row} ${word}` : word;
  }
  if (row) rows.push(row);
  return rows;
}

export async function exportVideo(plan: Plan, captions: Caption[], options: { signal: AbortSignal; onProgress: (n: number) => void; onChapters?: (seconds: number[]) => void }): Promise<Blob> {
  if (typeof MediaRecorder === "undefined" || !HTMLCanvasElement.prototype.captureStream) throw new Error("Este navegador no permite exportar vídeo. Abra la aplicación en Chrome, Edge o Safari actualizado.");
  const mime = ["video/mp4", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find(m => MediaRecorder.isTypeSupported(m));
  if (!mime) throw new Error("El navegador no ofrece un formato de grabación compatible.");
  const { Stage } = await import("@/engine/stage");
  options.signal.throwIfAborted();
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-10000px;top:0;width:1280px;height:590px;pointer-events:none";
  document.body.appendChild(host);
  const output = document.createElement("canvas");
  output.width = 1280; output.height = 960;
  const ctx = output.getContext("2d");
  if (!ctx) { host.remove(); throw new Error("No se ha podido preparar el vídeo."); }
  let stage: InstanceType<typeof Stage> | null = null;
  let recorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  let frame = 0;
  let ended: Promise<void> | null = null;
  let recordingError = false;
  const chunks: Blob[] = [];
  const chapters: number[] = [];
  let recordedTime = 0;
  try {
    stage = new Stage(host, { offscreen: true, loop: false, labels: false, callout: false, interactive: false });
    stage.renderer.setPixelRatio(1);
    stage.resize(1280, 590);
    stage.setPlan(plan);
    stream = output.captureStream(30);
    recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4500000 });
    recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    ended = new Promise(resolve => { recorder!.onstop = () => resolve(); });
    recorder.onerror = () => { recordingError = true; };
    recorder.start(1000);
    for (let index = 0; index < captions.length; index++) {
      options.signal.throwIfAborted();
      const caption = captions[index];
      stage.setMode({ kind: "step", index }, { instant: true });
      stage.replay();
      const duration = Math.max(secondsForStep(caption), stage.stepEnd + 2);
      chapters.push(recordedTime);
      options.onChapters?.([...chapters]);
      const active = stage;
      await new Promise<void>((resolve, reject) => {
        let last = performance.now();
        let elapsed = 0;
        const cleanup = () => { options.signal.removeEventListener("abort", onAbort); document.removeEventListener("visibilitychange", onVisibility); };
        const onAbort = () => { cancelAnimationFrame(frame); cleanup(); reject(options.signal.reason || new DOMException("Cancelado", "AbortError")); };
        const onVisibility = () => {
          cancelAnimationFrame(frame);
          if (document.hidden) { if (recorder?.state === "recording") recorder.pause(); }
          else { if (recorder?.state === "paused") recorder.resume(); last = performance.now(); frame = requestAnimationFrame(draw); }
        };
        options.signal.addEventListener("abort", onAbort, { once: true });
        document.addEventListener("visibilitychange", onVisibility);
        const draw = (now: number) => {
          if (recordingError) {
            cleanup();
            reject(new Error("El navegador ha interrumpido la grabación."));
            return;
          }
          const dt = (now - last) / 1000; last = now; elapsed += dt; recordedTime += dt;
          active.tick(dt); active.render();
          ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, 1280, 960);
          ctx.fillStyle = "#1d1d1f"; ctx.fillRect(0, 0, 1280, 3);
          ctx.font = "bold 21px Arial"; ctx.fillText(plan.spec.name.slice(0, 85), 48, 49);
          ctx.font = "15px Arial"; ctx.fillStyle = "#6e6e73"; ctx.fillText("GUÍA VISUAL · GEOMETRÍA ESQUEMÁTICA · CONTRASTAR CON EL MANUAL", 48, 79);
          ctx.drawImage(active.renderer.domElement, 0, 85, 1280, 560);
          ctx.fillStyle = "#f5f5f7"; ctx.fillRect(0, 645, 1280, 315);
          ctx.fillStyle = "#0071e3"; ctx.font = "bold 17px Arial";
          ctx.fillText(`PASO ${index + 1} DE ${captions.length}${caption.page ? ` · MANUAL PÁG. ${caption.page}` : ""}`, 48, 681);
          ctx.font = "bold 29px Arial"; ctx.fillStyle = "#1d1d1f";
          ctx.fillText(caption.title.slice(0, 77), 48, 724);
          const message = caption.detail + (caption.caution ? ` Atención: ${caption.caution}` : "");
          ctx.font = "22px Arial";
          let rows = lines(ctx, message, 1184);
          if (rows.length > 6) { ctx.font = "18px Arial"; rows = lines(ctx, message, 1184); }
          rows.slice(0, 7).forEach((row, line) => ctx.fillText(line === 6 && rows.length > 7 ? `${row.slice(0, -25)}… Consulte la guía completa.` : row, 48, 766 + line * 24));
          ctx.fillStyle = "#d2d2d7"; ctx.fillRect(48, 944, 1184, 4);
          ctx.fillStyle = "#0071e3"; ctx.fillRect(48, 944, 1184 * (index + Math.min(1, elapsed / duration)) / captions.length, 4);
          options.onProgress(Math.min(99, Math.round(100 * (index + elapsed / duration) / captions.length)));
          if (elapsed >= duration) { cleanup(); resolve(); }
          else frame = requestAnimationFrame(draw);
        };
        if (document.hidden) onVisibility();
        else frame = requestAnimationFrame(draw);
      });
    }
    recorder.stop();
    await ended;
    options.onProgress(100);
    const blob = new Blob(chunks, { type: recorder.mimeType });
    if (!blob.size) throw new Error("La grabación no contiene fotogramas. Pruebe en otro navegador.");
    return blob;
  } finally {
    cancelAnimationFrame(frame);
    if (recorder && recorder.state !== "inactive") { recorder.stop(); if (ended) await ended; }
    stream?.getTracks().forEach(track => track.stop());
    stage?.dispose();
    host.remove();
  }
}
