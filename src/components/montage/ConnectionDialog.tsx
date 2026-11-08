"use client";

import { useEffect, useRef, useState } from "react";
import { KeyRound, X } from "lucide-react";
import { apiKeyHasValidFormat } from "@/lib/browser-session";

export default function ConnectionDialog({ open, connected, remembered, pendingName, onDismiss, onConnect, onDisconnect }: {
  open: boolean;
  connected: boolean;
  remembered: boolean;
  pendingName?: string;
  onDismiss: () => void;
  onConnect: (key: string | null, remember: boolean) => void;
  onDisconnect: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState("");
  const [remember, setRemember] = useState(remembered);
  const [storageError, setStorageError] = useState("");
  const valid = apiKeyHasValidFormat(draft.trim());
  const canConnect = valid || (connected && !draft.trim());
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    if (open && !element?.open) {
      element?.showModal();
      element?.querySelector<HTMLInputElement>("#openai-key")?.focus({ preventScroll: true });
    }
    if (!open && element?.open) element.close();
    return () => {
      if (element?.open) element.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open]);

  return <dialog ref={dialog} className="connection-dialog" aria-labelledby="connection-title" aria-describedby="connection-description" onKeyDown={e => {
    if (e.key !== "Tab") return;
    const controls = e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), a[href]');
    const first = controls[0], last = controls[controls.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
  }} onCancel={e => { e.preventDefault(); setDraft(""); onDismiss(); }} onClick={e => {
    if (e.target !== e.currentTarget) return;
    const r = e.currentTarget.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) { setDraft(""); onDismiss(); }
  }}>
    <button className="dialog-close" aria-label="Cerrar conexión" onClick={() => { setDraft(""); onDismiss(); }}><X size={20}/></button>
    <span className="connection-icon"><KeyRound size={26}/></span>
    <h2 id="connection-title">Una conexión.<br/>Y manos a la obra.</h2>
    <p id="connection-description">{pendingName ? <>Tu manual <strong>{pendingName}</strong> ya está listo. Añade tu clave de OpenAI para crear la guía.</> : connected ? remembered ? "Tu clave está conectada y guardada en este navegador. Puedes cambiarla, dejar de guardarla o borrarla." : "Tu clave está conectada para esta sesión. Puedes guardarla para la próxima vez o cambiarla." : "Añade tu clave de OpenAI. Después, solo tendrás que arrastrar el manual."}</p>
    <form onSubmit={e => {
      e.preventDefault(); if (!canConnect) return;
      try { onConnect(valid ? draft.trim() : null, remember); setDraft(""); }
      catch (error) { setStorageError(error instanceof Error ? error.message : "No se ha podido actualizar la conexión."); }
    }}>
      <label htmlFor="openai-key">API Key de OpenAI</label>
      <input id="openai-key" name="openai-key" type="password" value={draft} onChange={e => { setDraft(e.target.value); setStorageError(""); }} placeholder={connected ? "Introduce otra clave para cambiarla" : "sk-proj-…"} autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} data-1p-ignore="true" data-lpignore="true" aria-describedby="connection-privacy" autoFocus/>
      <label className="remember-key"><input type="checkbox" checked={remember} onChange={e => { setRemember(e.target.checked); setStorageError(""); }} aria-describedby="key-storage-note"/><span>Guardar clave en este navegador</span></label>
      <p id="key-storage-note" className="key-storage-note">{remember ? "Úsalo en un dispositivo propio. Cualquier persona con acceso a este navegador podrá usar la clave guardada." : "Solo para esta sesión. La clave se borra al recargar o cerrar sesión."}</p>
      {storageError && <p className="connection-storage-error" role="alert">{storageError}</p>}
      <button className="connection-submit" type="submit" disabled={!canConnect}>{pendingName ? "Conectar y continuar" : connected && !draft.trim() ? "Guardar cambios" : "Conectar OpenAI"}</button>
    </form>
    <p id="connection-privacy" className="connection-note">Usamos GPT-6.1 Sol con razonamiento Muy alto. El manual se envía a OpenAI y el uso se factura en tu cuenta de API. Si los datos no encajan, se solicita una única revisión adicional.</p>
    <div className="connection-links"><a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer">Dónde encontrar mi clave <span aria-hidden="true">↗</span></a>{connected && <button onClick={() => {
      try { onDisconnect(); setDraft(""); }
      catch (error) { setStorageError(error instanceof Error ? error.message : "No se ha podido borrar la conexión."); }
    }}>{remembered ? "Desconectar y borrar clave" : "Desconectar"}</button>}</div>
  </dialog>;
}
