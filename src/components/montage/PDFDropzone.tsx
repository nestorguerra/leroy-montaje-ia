"use client";

import { useRef } from "react";

export function ManualIllustration() {
  return <svg className="manual-illustration" width="82" height="94" viewBox="0 0 82 94" fill="none" aria-hidden="true">
    <rect x="12" y="8" width="55" height="73" rx="7" fill="#eceef1" transform="rotate(-10 12 8)"/>
    <path d="M24 5h28l17 17v57a7 7 0 0 1-7 7H24a7 7 0 0 1-7-7V12a7 7 0 0 1 7-7Z" fill="white" stroke="#d2d2d7"/>
    <path d="M52 5v11a6 6 0 0 0 6 6h11" fill="#f5f5f7" stroke="#d2d2d7"/>
    <path d="m30 42 13-6 14 6-14 6-13-6Z" stroke="#85858a" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M31 43v16m24-16v16M43 49v17" stroke="#85858a" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M26 71h15m5 0h12" stroke="#d2d2d7" strokeWidth="2" strokeLinecap="round"/>
    <rect x="1" y="64" width="32" height="21" rx="6" fill="#0071e3"/>
    <text x="17" y="78" textAnchor="middle" fill="white" fontFamily="Arial,sans-serif" fontSize="10" fontWeight="700">PDF</text>
  </svg>;
}

export default function PDFDropzone({ onFiles, compact = false, dragging = false }: {
  onFiles: (files: File[]) => void;
  compact?: boolean;
  dragging?: boolean;
}) {
  const input = useRef<HTMLInputElement | null>(null);
  return <div className={`pdf-dropzone ${compact ? "is-compact" : ""} ${dragging ? "is-dragging" : ""}`}>
    <input ref={input} id="manual-upload" type="file" accept=".pdf,application/pdf" className="visually-hidden" aria-label="Elegir manual PDF" tabIndex={-1} onChange={e => { const files = Array.from(e.target.files || []); if (files.length) onFiles(files); e.target.value = ""; }}/>
    <button className="pdf-drop-target" type="button" onClick={() => input.current?.click()} aria-label={compact ? "Subir otro manual PDF" : "Subir manual PDF"} aria-describedby={compact ? undefined : "upload-help"}>
      {!compact && <ManualIllustration/>}
      <strong>{compact ? "Arrastra otro manual para empezar de nuevo" : "Arrastra aquí tu manual"}</strong>
      <span>{compact ? "o elige otro PDF" : <>o <span className="pdf-choose">elige un PDF de tu dispositivo</span></>}</span>
      {!compact && <small>PDF · Hasta 20 MB</small>}
    </button>
    {!compact && <p id="upload-help" className="upload-help">Lo demás sucede automáticamente.</p>}
  </div>;
}
