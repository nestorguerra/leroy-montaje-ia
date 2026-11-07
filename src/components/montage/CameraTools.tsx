"use client";

import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import type { RefObject } from "react";
import type { StageHandle } from "../StageView";

export default function CameraTools({ handle, freeView }: { handle: RefObject<StageHandle | null>; freeView: boolean }) {
  return <div className="viewer-tools">
    <p id="viewer-help"><span>Arrastra para girar. Pellizca o usa la rueda para acercarte.</span><span className="visually-hidden">Con teclado: flechas para girar, más y menos para zoom, cero para centrar y espacio para reproducir o pausar el montaje.</span></p>
    <div className="viewer-camera-controls" role="group" aria-label="Cámara del modelo 3D">
      <details className="viewer-angles" onKeyDown={e => { if (e.key === "Escape") { e.currentTarget.removeAttribute("open"); e.currentTarget.querySelector("summary")?.focus(); } }}><summary>Vistas</summary><div>{([ ["perspective", "Perspectiva"], ["front", "Frente"], ["side", "Lado"], ["top", "Desde arriba"] ] as const).map(([view, label]) => <button key={view} onClick={e => {
        handle.current?.cameraView(view);
        const menu = e.currentTarget.closest("details");
        menu?.removeAttribute("open");
        menu?.querySelector("summary")?.focus({ preventScroll: true });
      }}>{label}</button>)}</div></details>
      <button className="viewer-icon-button" aria-label="Alejar modelo" onClick={() => handle.current?.zoomView(1.15)}><ZoomOut size={18}/></button>
      <button className="viewer-icon-button" aria-label="Acercar modelo" onClick={() => handle.current?.zoomView(1 / 1.15)}><ZoomIn size={18}/></button>
      <button className="viewer-icon-button" aria-label="Centrar vista" onClick={() => handle.current?.resetView()} title={freeView ? "Recuperar la vista inicial" : "Centrar vista"}><RotateCcw size={17}/></button>
    </div>
  </div>;
}
