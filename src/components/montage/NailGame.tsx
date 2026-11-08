"use client";

import { useEffect, useReducer, useRef, useState, type KeyboardEvent } from "react";
import { Hammer, Pause, Play } from "lucide-react";
import { initialNailGame, nailGameReducer } from "@/lib/waiting-game";

function Mallet() {
  return <svg className="nail-mallet" viewBox="0 0 80 88" aria-hidden="true"><g transform="rotate(-32 41 46)"><rect x="36" y="31" width="12" height="51" rx="4" fill="#277a17"/><path d="M38 35h8v36h-8z" fill="#78be20" opacity=".35"/><path d="M15 14h32l15 9v13H46V26H29l-9 12-6-3 5-12-7-2z" fill="#5b645d"/><path d="M47 21h16v17H47z" fill="#38463b"/><path d="M48 21h15v4H48z" fill="#78867b"/></g></svg>;
}

export default function NailGame({ reduceMotion }: { reduceMotion: boolean }) {
  const [game, dispatch] = useReducer(nailGameReducer, initialNailGame);
  const [paused, setPaused] = useState(reduceMotion);
  const [visible, setVisible] = useState(true);
  const [focused, setFocused] = useState(0);
  const cells = useRef<(HTMLButtonElement | null)[]>([]);
  const playing = !paused && visible;
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    const frame = requestAnimationFrame(update);
    document.addEventListener("visibilitychange", update);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("visibilitychange", update); };
  }, []);
  useEffect(() => {
    if (!playing) return;
    const spawn = () => dispatch({ type: "spawn", index: Math.floor(Math.random() * 9) });
    const first = setTimeout(spawn, 300);
    const loop = setInterval(spawn, 1900);
    return () => { clearTimeout(first); clearInterval(loop); };
  }, [playing, game.score]);

  function moveFocus(event: KeyboardEvent, index: number) {
    const row = Math.floor(index / 3), column = index % 3;
    const next = { ArrowRight: row * 3 + (column + 1) % 3, ArrowLeft: row * 3 + (column + 2) % 3, ArrowDown: ((row + 1) % 3) * 3 + column, ArrowUp: ((row + 2) % 3) * 3 + column, Home: row * 3, End: row * 3 + 2 }[event.key];
    if (next === undefined) return;
    event.preventDefault(); cells.current[next]?.focus();
  }

  return <section className="nail-game" aria-labelledby="nail-game-title">
    <header className="nail-game-heading"><div><p><Hammer size={13}/> UN POCO DE PRÁCTICA</p><h2 id="nail-game-title">Clava la espera.</h2></div><button className="nail-pause" aria-label={paused ? "Continuar minijuego" : "Pausar minijuego"} onClick={() => { dispatch({ type: "rest" }); setPaused(value => !value); }}>{paused ? <Play size={16}/> : <Pause size={16}/>}<span>{paused ? "Jugar" : "Pausa"}</span></button></header>
    <p className="nail-game-intro">Los clavos aparecen. Tú pones el martillo.</p>
    <div className="nail-stats" aria-live="off"><div><strong>{String(game.score).padStart(2, "0")}</strong><span>Clavos</span></div><div><strong>{String(game.streak).padStart(2, "0")}</strong><span>Racha</span></div><div><strong>{String(game.best).padStart(2, "0")}</strong><span>Mejor racha</span></div></div>
    <div className={`nail-arena ${!playing ? "is-paused" : ""}`}>
      <div className="nail-board" role="grid" aria-label="Tablero de clavos" aria-describedby="nail-instructions">
        {[0, 1, 2].map(row => <div className="nail-row" role="row" key={row}>{[0, 1, 2].map(column => {
          const index = row * 3 + column, raised = game.nail === index, sunk = game.sunk === index;
          return <div role="gridcell" key={index}><button ref={element => { cells.current[index] = element; }} className={`nail-cell ${raised ? "is-raised" : ""} ${sunk ? "is-sunk" : ""}`} disabled={!playing} tabIndex={focused === index && playing ? 0 : -1} onFocus={() => setFocused(index)} onKeyDown={event => moveFocus(event, index)} onClick={() => { if (playing) dispatch({ type: "strike", index }); }} aria-label={raised ? `Clavo ${index + 1}. Golpear` : `Hueco ${index + 1}. Sin clavo`}><span className="nail-hole" aria-hidden="true"/><svg className="nail-pin" viewBox="0 0 48 72" aria-hidden="true"><path d="M21 19h6v42l-3 7-3-7z" fill="#768477"/><path d="M25 22h2v38l-2 4z" fill="#556458"/><ellipse cx="24" cy="18" rx="14" ry="6" fill="#657761"/><ellipse cx="24" cy="15" rx="14" ry="6" fill="#d9e5d1" stroke="#506747" strokeWidth="1.5"/><path d="m17 13 14 4m-14 0 14-4" stroke="#91a087" strokeWidth="1.2"/></svg>{game.strike === index && <span className="nail-strike" key={game.strikes} aria-hidden="true"><Mallet/><i/><i/><i/></span>}</button></div>;
        })}</div>)}
      </div>
      {!playing && <div className="nail-paused-message"><Hammer size={28}/><strong>Martillo en reposo.</strong><span>La IA sigue con tu guía.</span></div>}
    </div>
    <p id="nail-instructions" className="nail-instructions">Golpea el clavo levantado. Con teclado, usa flechas y Espacio.</p>
    <p className="visually-hidden" role="status" aria-atomic="true">{game.message}</p>
  </section>;
}
