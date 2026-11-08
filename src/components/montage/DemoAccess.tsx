"use client";

import { useEffect, useState } from "react";
import { browserStorage, hasDemoSession, saveDemoSession } from "@/lib/browser-session";
import ManualStudio from "../ManualStudio";
import Brand from "./Brand";
import DemoLogin from "./DemoLogin";

export default function DemoAccess() {
  const [session, setSession] = useState<boolean | null>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setSession(hasDemoSession(browserStorage("sessionStorage"))));
    return () => cancelAnimationFrame(frame);
  }, []);
  if (session === null) return <div className="montage-app"><header className="montage-header"><div className="montage-header-inner"><Brand/></div></header><p className="session-loading" role="status">Abriendo tu espacio…</p></div>;
  if (!session) return <DemoLogin onLogin={() => { saveDemoSession(browserStorage("sessionStorage"), true); setSession(true); }}/>;
  return <ManualStudio onLogout={() => { saveDemoSession(browserStorage("sessionStorage"), false); setSession(false); }}/>;
}
