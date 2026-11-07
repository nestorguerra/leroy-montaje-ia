"use client";

import { useRef } from "react";
import { Box, Layers3, Play } from "lucide-react";
import type { GuideView } from "./AssemblyPlayer";

const tabs = [{ id: "product", label: "Producto", icon: Box }, { id: "parts", label: "Piezas", icon: Layers3 }, { id: "assembly", label: "Montaje", icon: Play }] as const;

export default function GuideTabs({ view, onView }: { view: GuideView; onView: (view: GuideView) => void }) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  return <div className="guide-tabs" role="tablist" aria-label="Explorar la guía 3D">{tabs.map(({ id, label, icon: Icon }, index) => <button key={id} ref={element => { buttons.current[index] = element; }} role="tab" id={`tab-${id}`} aria-controls="guide-workspace" aria-selected={view === id} tabIndex={view === id ? 0 : -1} onClick={() => onView(id)} onKeyDown={event => {
    const next = event.key === "ArrowRight" ? (index + 1) % 3 : event.key === "ArrowLeft" ? (index + 2) % 3 : event.key === "Home" ? 0 : event.key === "End" ? 2 : null;
    if (next === null) return;
    event.preventDefault();
    onView(tabs[next].id);
    buttons.current[next]?.focus();
  }}><Icon size={17}/>{label}</button>)}</div>;
}
