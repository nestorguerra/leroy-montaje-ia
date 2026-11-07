"use client";

import { useEffect, useRef, useState } from "react";
import { KeyRound, X } from "lucide-react";

export default function ConnectionDialog({ open, connected, pendingName, onDismiss, onConnect, onDisconnect }: {
  open: boolean;
  connected: boolean;
  pendingName?: string;
  onDismiss: () => void;
  onConnect: (key: string) => void;
  onDisconnect: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState("");
  const valid = draft.trim().startsWith("sk-") && draft.trim().length > 12 && !/\s/.test(draft.trim());
  useEffect(() => {
    const element = dialog.current;
    if (open && !element?.open) element?.showModal();
    if (!open && element?.open) element.close();
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
    <p id="connection-description">{pendingName ? <>Tu manual <strong>{pendingName}</strong> ya está listo. Añade tu clave de OpenAI para crear la guía.</> : connected ? "Ya tienes una clave preparada para esta sesión. Puedes cambiarla o desconectarla aquí." : "Añade tu clave de OpenAI una vez por sesión. Después, solo tendrás que arrastrar el manual."}</p>
    <form onSubmit={e => { e.preventDefault(); if (valid) { const key = draft.trim(); setDraft(""); onConnect(key); } }}>
      <label htmlFor="openai-key">API Key de OpenAI</label>
      <input id="openai-key" name="openai-key" type="password" value={draft} onChange={e => setDraft(e.target.value)} placeholder="sk-proj-…" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} data-1p-ignore="true" data-lpignore="true" aria-describedby="connection-privacy" autoFocus/>
      <button className="connection-submit" type="submit" disabled={!valid}>{pendingName ? "Conectar y continuar" : "Conectar OpenAI"}</button>
    </form>
    <p id="connection-privacy" className="connection-note">Usamos GPT-6.1 Sol con razonamiento Muy alto. La clave se borra al recargar. El manual se envía a OpenAI y el uso se factura en tu cuenta de API. Si los datos no encajan, se solicita una única revisión adicional.</p>
    <div className="connection-links"><a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer">Dónde encontrar mi clave <span aria-hidden="true">↗</span></a>{connected && <button onClick={() => { setDraft(""); onDisconnect(); }}>Desconectar</button>}</div>
  </dialog>;
}
