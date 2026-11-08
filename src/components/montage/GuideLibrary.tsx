"use client";

import { ArrowUpRight, Box, Check, CircleAlert, FolderOpen, LoaderCircle } from "lucide-react";
import type { LibraryEntry } from "@/lib/guide-library";

const date = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" });

export default function GuideLibrary({ entries, loading, opening, activeId, error, openError, saving, saveError, onOpen, onReload, onRetrySave }: {
  entries: LibraryEntry[];
  loading: boolean;
  opening: string | null;
  activeId: string | null;
  error: string;
  openError: string;
  saving: boolean;
  saveError: string;
  onOpen: (id: string) => void;
  onReload: () => void;
  onRetrySave: () => void;
}) {
  return <section className="guide-library" aria-labelledby="library-title">
    <div className="library-heading"><div><p className="montage-eyebrow">HECHOS POR TI</p><h2 id="library-title">Tu biblioteca de montajes.</h2><p>Tus guías y sus manuales, guardados en este navegador.</p></div><div className="library-count" aria-live="polite"><strong>{loading || error ? <span aria-label="Sin recuento disponible">...</span> : entries.length}</strong><span>{entries.length === 1 && !error ? "manual convertido" : "manuales convertidos"}</span></div></div>
    <p className="library-save-state" role="status">{saving ? <><LoaderCircle size={14} className="spin"/>Guardando tu último montaje...</> : activeId && entries.some(entry => entry.id === activeId) ? <><Check size={14}/>Este montaje ya está guardado.</> : null}</p>
    {saveError && <div className="library-notice" role="alert"><CircleAlert size={18}/><div><strong>Tu guía está lista, pero no se ha guardado.</strong><p>{saveError}</p><button onClick={onRetrySave} disabled={saving}>Volver a guardar</button></div></div>}
    {openError && <div className="library-notice" role="alert"><CircleAlert size={18}/><div><strong>No hemos podido abrir ese montaje.</strong><p>{openError}</p></div></div>}
    {error ? <div className="library-notice" role="alert"><CircleAlert size={18}/><div><strong>No hemos podido cargar tu biblioteca.</strong><p>{error}</p><button onClick={onReload}>Volver a intentar</button></div></div> : loading ? <p className="library-loading" role="status"><LoaderCircle size={16} className="spin"/>Abriendo tus montajes guardados...</p> : entries.length === 0 ? <div className="library-empty"><FolderOpen size={30} strokeWidth={1.3}/><div><h3>Aquí empieza tu colección.</h3><p>Tu primer manual convertido aparecerá aquí automáticamente. Después podrás abrirlo sin volver a usar la IA.</p></div></div> : <ul className="library-list" aria-label="Montajes guardados">{entries.map(entry => <li key={entry.id}><span className="library-icon" aria-hidden="true"><Box size={23} strokeWidth={1.5}/></span><div className="library-copy"><h3>{entry.name}</h3><p className="library-filename" title={entry.filename}>{entry.filename}</p><p className="library-meta"><time dateTime={entry.createdAt}>{date.format(new Date(entry.createdAt))}</time><span aria-hidden="true">·</span><span>{entry.steps} {entry.steps === 1 ? "paso" : "pasos"}</span><span aria-hidden="true">·</span><span>{entry.parts} {entry.parts === 1 ? "pieza" : "piezas"}</span></p></div><button className="library-open" disabled={!!opening || entry.id === activeId} onClick={() => onOpen(entry.id)} aria-label={entry.id === activeId ? `${entry.name}, en pantalla` : `Abrir montaje ${entry.name}`}>{opening === entry.id ? <><LoaderCircle size={16} className="spin"/><span>Abriendo...</span></> : entry.id === activeId ? <><Check size={16}/><span>En pantalla</span></> : <><span>Abrir montaje</span><ArrowUpRight size={17}/></>}</button></li>)}</ul>}
    <p className="library-local-note">Puedes volver a tus montajes al recargar o entrar de nuevo. Si borras los datos de esta web, también se borrará esta biblioteca.</p>
  </section>;
}
