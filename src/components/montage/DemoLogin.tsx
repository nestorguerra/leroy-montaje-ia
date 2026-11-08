"use client";

import { useState } from "react";
import { ArrowRight, CircleAlert, Layers3 } from "lucide-react";
import { demoCredentialsMatch } from "@/lib/browser-session";
import Brand from "./Brand";

export default function DemoLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  return <div className="montage-app login-page">
    <header className="montage-header"><div className="montage-header-inner"><Brand/><span className="demo-badge">DEMO</span></div></header>
    <main className="login-layout">
      <div className="login-copy"><span className="login-mark" aria-hidden="true"><Layers3 size={32} strokeWidth={1.25}/></span><p className="montage-eyebrow">DEL MANUAL AL MONTAJE</p><h1>Todo empieza<br/>por entenderlo.</h1><p>Tu manual, sus piezas y el montaje.<br/>Juntos, en una guía 3D interactiva.</p><div className="login-preview" aria-hidden="true"><span>01</span>Producto<i/><span>02</span>Piezas<i/><span>03</span>Montaje</div></div>
      <section className="login-form-panel" aria-labelledby="login-title"><p className="panel-eyebrow">TU ESPACIO DE MONTAJE</p><h2 id="login-title">Bienvenido.</h2><p>Entra y dale movimiento a tu manual.</p>
        <form onSubmit={e => { e.preventDefault(); if (!demoCredentialsMatch(username, password)) { setError(true); return; } setPassword(""); onLogin(); }}>
          <label htmlFor="demo-user">Usuario</label><input id="demo-user" name="username" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={username} onChange={e => { setUsername(e.target.value); setError(false); }} required aria-invalid={error} aria-describedby={error ? "login-error" : undefined} autoFocus/>
          <label htmlFor="demo-password">Contraseña</label><input id="demo-password" name="password" type="password" autoComplete="current-password" value={password} onChange={e => { setPassword(e.target.value); setError(false); }} required aria-invalid={error} aria-describedby={error ? "login-error" : undefined}/>
          {error && <p id="login-error" className="login-error" role="alert"><CircleAlert size={16}/>Revisa el usuario y la contraseña.</p>}
          <button className="connection-submit login-submit" type="submit">Entrar<ArrowRight size={18}/></button>
        </form>
        <p className="login-demo-credentials">Para probar: <strong>demo</strong> / <strong>demo</strong></p><p className="login-local-note">Acceso de demostración en este navegador. No crea una cuenta personal.</p>
      </section>
    </main><footer className="login-footer">Proyecto experimental independiente de Leroy Merlin.</footer>
  </div>;
}
