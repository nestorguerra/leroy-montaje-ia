"use client";

import { useEffect, useId, useReducer, useState } from "react";
import { Hammer, Pause, Play } from "lucide-react";
import { createNailRound, initialNailGame, nailGameReducer } from "@/lib/waiting-game";

function Mallet() {
  const id = useId();
  return <svg className="nail-mallet" viewBox="0 0 120 140" aria-hidden="true"><defs><linearGradient id={`${id}-steel`} x2="0" y2="1"><stop stopColor="#f2f5f4"/><stop offset=".35" stopColor="#b8c5c3"/><stop offset=".55" stopColor="#819695"/><stop offset="1" stopColor="#496162"/></linearGradient><linearGradient id={`${id}-grip`}><stop stopColor="#184d22"/><stop offset=".4" stopColor="#66a63c"/><stop offset=".7" stopColor="#3f842b"/><stop offset="1" stopColor="#22552a"/></linearGradient></defs><g transform="rotate(-25 64 76)"><path d="M56 44h17l-3 79c0 9-14 9-15 0z" fill="#4c3924" opacity=".2" transform="translate(3 4)"/><path d="M55 40h17l-2 88q-7 8-16-1z" fill={`url(#${id}-grip)`} stroke="#244b29" strokeWidth="1.5"/><path d="m58 56 9 1-1 45-8-1z" fill="#a6d66e" opacity=".45"/><path d="m56 108 13 2m-13 4 13 2m-13 4 13 2" stroke="#184827" strokeWidth="2"/><path d="M14 22q17-16 40-9h26v30H53L36 34l-9 18-7-3 6-22-10 7z" fill={`url(#${id}-steel)`} stroke="#485e61" strokeWidth="1.5"/><rect x="76" y="11" width="24" height="36" rx="5" fill={`url(#${id}-steel)`} stroke="#485e61" strokeWidth="1.5"/><path d="M81 14h12q4 0 4 4v3H80z" fill="#fff" opacity=".65"/><path d="M39 19h31" stroke="#fff" strokeWidth="2" opacity=".6"/><path d="m29 26-7 19" stroke="#e7f0ed" strokeWidth="2"/></g></svg>;
}

function WoodBoard() {
  const id = useId();
  return <svg className="nail-board-art" viewBox="0 0 600 360" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id={`${id}-face`} x2=".3" y2="1"><stop stopColor="#f4d9a8"/><stop offset=".48" stopColor="#e6be83"/><stop offset="1" stopColor="#d7a86b"/></linearGradient><linearGradient id={`${id}-edge`} x2="0" y2="1"><stop stopColor="#bf8d53"/><stop offset="1" stopColor="#94663e"/></linearGradient></defs><rect x="5" y="18" width="590" height="336" rx="23" fill="#6f4b2d" opacity=".15"/><rect x="4" y="13" width="592" height="338" rx="23" fill={`url(#${id}-edge)`}/><rect x="4" y="4" width="592" height="335" rx="23" fill={`url(#${id}-face)`} stroke="#bb8b56" strokeWidth="2"/><g fill="none" stroke="#a77845" strokeWidth="1.3" opacity=".25"><path d="M24 58q110-16 216 0t335-6M24 66q125-18 235 1t315-5M22 105q130 18 231-3t322 8M21 150q105-20 197-3t359 2M22 193q160 17 288-4t264 8M23 244q93-20 201-4t351-8M24 292q115 19 220-1t331 7M25 304q141 20 267-1t281 7"/><ellipse cx="411" cy="110" rx="48" ry="10"/><ellipse cx="411" cy="110" rx="28" ry="5"/><path d="M350 111q-18-20-62-16M472 110q32 11 88 3M72 235q22-18 58-15t57 15M86 235q35-18 76 0"/></g><path d="M28 9h542q19 0 20 18" stroke="#fff3da" strokeWidth="3" fill="none" opacity=".7"/><path d="M23 333h550" stroke="#b68148" opacity=".5"/><text x="551" y="316" textAnchor="end" fontSize="10" letterSpacing="3" fill="#9b6d3f" opacity=".65">MONTAJE DE N</text></svg>;
}

function Nail() {
  const id = useId();
  return <svg className="nail-pin" viewBox="0 0 64 92" aria-hidden="true"><defs><linearGradient id={`${id}-shaft`}><stop stopColor="#718a89"/><stop offset=".34" stopColor="#e9f1ef"/><stop offset=".65" stopColor="#a3b6b3"/><stop offset="1" stopColor="#56716f"/></linearGradient><linearGradient id={`${id}-head`} x2=".2" y2="1"><stop stopColor="#fff"/><stop offset=".5" stopColor="#d6e1dd"/><stop offset="1" stopColor="#8ca6a0"/></linearGradient></defs><path d="M28 21h8v56l-4 10-4-10z" fill={`url(#${id}-shaft)`} stroke="#5e7c76" strokeWidth="1"/><path d="M30 27v46" stroke="#fff" opacity=".8"/><ellipse cx="32" cy="23" rx="19" ry="8" fill="#68837b"/><ellipse cx="32" cy="19" rx="19" ry="8" fill={`url(#${id}-head)`} stroke="#557667" strokeWidth="1.5"/><ellipse cx="32" cy="18" rx="12" ry="4.5" fill="#88bd55"/><path d="M19 17q12-7 25 0" fill="none" stroke="#fff" opacity=".8" strokeWidth="1.5"/></svg>;
}

export default function NailGame({ reduceMotion }: { reduceMotion: boolean }) {
  const [game, dispatch] = useReducer(nailGameReducer, initialNailGame);
  const [paused, setPaused] = useState(reduceMotion);
  const [visible, setVisible] = useState(true);
  const [round, setRound] = useState({ index: 0, x: 50, y: 50, duration: 2400, rise: 220, sequence: 0 });
  const [strikePoint, setStrikePoint] = useState({ x: 50, y: 50 });
  const playing = !paused && visible;
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    const frame = requestAnimationFrame(update);
    document.addEventListener("visibilitychange", update);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("visibilitychange", update); };
  }, []);
  useEffect(() => {
    if (!playing) return;
    let timer: ReturnType<typeof setTimeout>;
    const spawn = () => {
      const next = createNailRound(game.score);
      setRound(current => ({ ...next, sequence: current.sequence + 1 })); dispatch({ type: "spawn", index: next.index });
      timer = setTimeout(spawn, next.duration);
    };
    timer = setTimeout(spawn, 450);
    return () => clearTimeout(timer);
  }, [playing, game.score]);

  return <section className="nail-game" aria-labelledby="nail-game-title">
    <header className="nail-game-heading"><div><p><Hammer size={13}/> UN POCO DE PRÁCTICA</p><h2 id="nail-game-title">Clava la espera.</h2></div><button className="nail-pause" aria-label={paused ? "Continuar minijuego" : "Pausar minijuego"} onClick={() => { dispatch({ type: "rest" }); setPaused(value => !value); }}>{paused ? <Play size={16}/> : <Pause size={16}/>}<span>{paused ? "Jugar" : "Pausa"}</span></button></header>
    <p className="nail-game-intro">Una tabla. Clavos imprevisibles. Tu mejor puntería.</p>
    <div className="nail-stats" aria-live="off"><div><strong>{String(game.score).padStart(2, "0")}</strong><span>Clavos</span></div><div><strong>{String(game.streak).padStart(2, "0")}</strong><span>Racha</span></div><div><strong>{String(game.best).padStart(2, "0")}</strong><span>Mejor racha</span></div></div>
    <div className={`nail-arena ${!playing ? "is-paused" : ""}`}>
      <div className="nail-board" role="group" aria-label="Tabla de clavos" aria-describedby="nail-instructions" onClick={event => {
        if (!playing) return;
        const box = event.currentTarget.getBoundingClientRect();
        setStrikePoint({ x: (event.clientX - box.left) / box.width * 100, y: (event.clientY - box.top) / box.height * 100 });
        dispatch({ type: "miss" });
      }}>
        <WoodBoard/>
        <span className="nail-pace" aria-hidden="true">{round.duration < 1400 ? "Ritmo rápido" : round.duration < 2100 ? "Ritmo ágil" : "Ritmo suave"}</span>
        <button className={`nail-cell ${game.nail >= 0 ? "is-raised" : ""} ${game.sunk >= 0 ? "is-sunk" : ""}`} style={{ left: `${round.x}%`, top: `${round.y}%` }} disabled={!playing} aria-disabled={game.nail < 0} onClick={event => {
          event.stopPropagation();
          if (!playing || game.nail < 0) return;
          setStrikePoint({ x: round.x, y: round.y }); dispatch({ type: "strike", index: game.nail });
        }} aria-label={game.nail >= 0 ? `Clavo ${game.nail + 1}. Golpear` : "Esperando al siguiente clavo"}>
          <span className="nail-hole" aria-hidden="true"/>
          <span className="nail-figure" key={round.sequence} style={{ animationDuration: `${round.rise}ms` }}><Nail/></span>
        </button>
        {game.strike !== -1 && <span className="nail-strike" style={{ left: `${strikePoint.x}%`, top: `${strikePoint.y}%` }} key={game.strikes} aria-hidden="true"><Mallet/><i/><i/><i/>{game.strike >= 0 && <b>+1</b>}</span>}
      </div>
      {!playing && <div className="nail-paused-message"><Mallet/><strong>Martillo en reposo.</strong><span>La IA sigue con tu guía.</span></div>}
    </div>
    <p id="nail-instructions" className="nail-instructions">Golpea el clavo antes de que cambie de sitio. Con teclado, enfoca el clavo y pulsa Espacio.</p>
    <p className="visually-hidden" role="status" aria-atomic="true">{game.message}</p>
  </section>;
}
