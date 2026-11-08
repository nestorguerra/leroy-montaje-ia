export type NailGame = {
  nail: number;
  previous: number;
  sunk: number;
  strike: number;
  strikes: number;
  score: number;
  streak: number;
  best: number;
  message: string;
};
export const initialNailGame: NailGame = { nail: -1, previous: -1, sunk: -1, strike: -1, strikes: 0, score: 0, streak: 0, best: 0, message: "" };
type Action = { type: "spawn"; index: number } | { type: "strike"; index: number } | { type: "rest" };

export function nailGameReducer(state: NailGame, action: Action): NailGame {
  if (action.type === "rest") return { ...state, nail: -1, sunk: -1, strike: -1, streak: 0 };
  if (!Number.isInteger(action.index) || action.index < 0 || action.index > 8) return state;
  if (action.type === "spawn") {
    const nail = action.index === state.previous ? (action.index + 1) % 9 : action.index;
    return { ...state, nail, previous: nail, sunk: -1, strike: -1, streak: state.nail >= 0 ? 0 : state.streak };
  }
  if (state.nail < 0 && action.index === state.sunk) return state;
  const hit = action.index === state.nail;
  const streak = hit ? state.streak + 1 : 0;
  const score = state.score + (hit ? 1 : 0);
  return {
    ...state, strike: action.index, strikes: state.strikes + 1,
    nail: hit ? -1 : state.nail, sunk: hit ? action.index : state.sunk,
    score, streak, best: Math.max(state.best, streak),
    message: hit ? `Bien clavado. ${score} ${score === 1 ? "clavo" : "clavos"}. Racha de ${streak}.` : "Ahí no había un clavo. Prueba con el que está levantado.",
  };
}
