"use client";

import { useEffect, useRef, useState } from "react";
import type { Plan } from "@/lib/types";
import type { Stage, StageMode, StageOptions } from "@/engine/stage";

export interface StageHandle {
  replay(): void;
  resetView(): void;
  setSpeed(s: number): void;
  setPaused(p: boolean): void;
  getStepSeconds(): number;
}

export default function StageView({
  plan,
  mode,
  highlight,
  options,
  className,
  onReady,
  onIntroDone,
  onHover,
  onUserView,
  paused,
  speed,
  instant,
}: {
  plan: Plan | null;
  mode: StageMode;
  highlight?: string[] | null;
  options?: Omit<StageOptions, "onIntroDone" | "onHover" | "onUserView">;
  className?: string;
  onReady?: (h: StageHandle) => void;
  onIntroDone?: () => void;
  onHover?: (ref: string | null) => void;
  onUserView?: (changed: boolean) => void;
  paused?: boolean;
  speed?: number;
  instant?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const stage = useRef<Stage | null>(null);
  const cbs = useRef({ onIntroDone, onHover, onUserView, onReady });
  useEffect(() => {
    cbs.current = { onIntroDone, onHover, onUserView, onReady };
  });
  const modeKey = JSON.stringify(mode);
  const latest = useRef({ plan, mode, highlight, paused, speed, instant });
  useEffect(() => {
    latest.current = { plan, mode, highlight, paused, speed, instant };
  });

  useEffect(() => {
    let alive = true;
    let s: Stage | null = null;
    import("@/engine/stage").then(({ Stage }) => {
      if (!alive || !host.current) return;
      s = new Stage(host.current, {
        ...options,
        onIntroDone: () => cbs.current.onIntroDone?.(),
        onHover: (r) => cbs.current.onHover?.(r),
        onUserView: (c) => cbs.current.onUserView?.(c),
      });
      stage.current = s;
      const { plan: p, mode: m, highlight: h } = latest.current;
      if (p) {
        s.setPlan(p);
        s.setMode(m, { instant: latest.current.instant });
      }
      s.setHighlight(h ?? null);
      s.setPaused(!!latest.current.paused);
      s.setSpeed(latest.current.speed ?? 1);
      cbs.current.onReady?.({
        replay: () => s?.replay(),
        resetView: () => s?.resetView(),
        setSpeed: (v) => s?.setSpeed(v),
        setPaused: (v) => s?.setPaused(v),
        getStepSeconds: () => (s?.stepEnd ?? 3) + 3,
      });
    }).catch(() => {
      if (alive) setError("No se ha podido abrir el modelo 3D. Compruebe que WebGL está disponible o pruebe en otro navegador. Los pasos escritos siguen disponibles.");
    });
    return () => {
      alive = false;
      s?.dispose();
      stage.current = null;
    };
    // options are read once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const s = stage.current;
    if (!s || !plan) return;
    const fresh = s.plan !== plan;
    s.setPlan(plan);
    if (fresh) s.setMode(latest.current.mode, { instant: latest.current.instant });
  }, [plan]);

  useEffect(() => {
    const s = stage.current;
    if (!s || !s.plan) return;
    s.setMode(latest.current.mode, { instant: latest.current.instant });
  }, [modeKey, instant]);

  useEffect(() => {
    stage.current?.setHighlight(highlight ?? null);
  }, [highlight]);

  useEffect(() => {
    stage.current?.setPaused(!!paused);
  }, [paused]);
  useEffect(() => {
    stage.current?.setSpeed(speed ?? 1);
  }, [speed]);

  return <div ref={host} className={"stage " + (className ?? "")}>{error && <p role="alert" className="stage-error">{error}</p>}</div>;
}
