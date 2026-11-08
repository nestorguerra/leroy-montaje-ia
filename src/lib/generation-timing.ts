const TIMING_KEY = "leroy-montaje-ia:generation-timing:v1";
type TimingStorage = Pick<Storage, "getItem" | "setItem">;
const validDuration = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 3000 && value <= 15 * 60 * 1000;

export function loadGenerationTimes(storage: TimingStorage | null, model: string): number[] {
  try {
    const record = JSON.parse(storage?.getItem(TIMING_KEY) || "null");
    return record?.version === 1 && record.model === model && Array.isArray(record.durations) ? record.durations.filter(validDuration).slice(-6) : [];
  } catch { return []; }
}

export function recordGenerationTime(storage: TimingStorage | null, model: string, duration: number) {
  if (!validDuration(duration)) return;
  const durations = [...loadGenerationTimes(storage, model), duration].slice(-6);
  try { storage?.setItem(TIMING_KEY, JSON.stringify({ version: 1, model, durations })); }
  catch { /* Timing is optional and never blocks a guide. */ }
}

export type RemainingEstimate = { kind: "unknown" } | { kind: "longer" } | { kind: "range"; from: number; to: number };
export function estimateRemaining(elapsed: number, samples: number[]): RemainingEstimate {
  const durations = samples.filter(validDuration);
  if (durations.length < 2 || !Number.isFinite(elapsed) || elapsed < 0) return { kind: "unknown" };
  // A broad reference window from completed guides, not progress reported by OpenAI.
  const earliest = Math.min(...durations) * .75;
  const latest = Math.max(...durations) * 1.5 + 30000;
  if (elapsed >= latest) return { kind: "longer" };
  return { kind: "range", from: Math.max(0, Math.floor((earliest - elapsed) / 60000)), to: Math.max(1, Math.ceil((latest - elapsed) / 60000)) };
}

export function formatElapsed(milliseconds: number) {
  const seconds = Math.floor(Math.max(0, milliseconds) / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
