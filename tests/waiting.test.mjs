import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

const load = createRequire(import.meta.url);
load.extensions[".ts"] = (module, filename) => {
  const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, fileName: filename });
  module._compile(source.outputText, filename);
};
const { initialNailGame, nailGameReducer: reduce } = load("../src/lib/waiting-game.ts");
const { loadGenerationTimes, recordGenerationTime, estimateRemaining, formatElapsed } = load("../src/lib/generation-timing.ts");
const memory = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
};

test("a nail scores only once even when two taps arrive before the next round", () => {
  const ready = reduce(initialNailGame, { type: "spawn", index: 4 });
  const hit = reduce(ready, { type: "strike", index: 4 });
  const twice = reduce(hit, { type: "strike", index: 4 });
  assert.equal(hit.score, 1); assert.equal(hit.streak, 1); assert.equal(hit.nail, -1);
  assert.equal(twice.score, 1); assert.equal(twice.streak, 1); assert.equal(initialNailGame.score, 0);
});
test("misses and expired nails reset the streak without erasing the score or best streak", () => {
  let state = initialNailGame;
  for (const index of [1, 3, 6]) { state = reduce(state, { type: "spawn", index }); state = reduce(state, { type: "strike", index }); }
  assert.equal(state.streak, 3); assert.equal(state.best, 3);
  state = reduce(state, { type: "spawn", index: 6 });
  assert.notEqual(state.nail, 6);
  state = reduce(state, { type: "spawn", index: 4 });
  assert.equal(state.streak, 0); assert.equal(state.score, 3); assert.equal(state.best, 3);
  const paused = reduce(state, { type: "rest" });
  assert.equal(paused.nail, -1); assert.equal(paused.score, 3);
  assert.equal(reduce(paused, { type: "strike", index: 4 }).score, 3);
  assert.equal(reduce(state, { type: "spawn", index: 9 }), state);
});
test("timing stores only six valid durations for the same model and preserves unrelated data", () => {
  const storage = memory(); storage.setItem("other-app", "keep");
  for (const duration of [10000, 20000, 30000, 40000, 50000, 60000, 70000, -1, NaN, Infinity, 901000]) recordGenerationTime(storage, "model-a", duration);
  assert.deepEqual(loadGenerationTimes(storage, "model-a"), [20000, 30000, 40000, 50000, 60000, 70000]);
  assert.deepEqual(loadGenerationTimes(storage, "model-b"), []);
  assert.equal(storage.getItem("other-app"), "keep");
  for (const value of storage.getItem("leroy-montaje-ia:generation-timing:v1").split('"')) assert.equal(/manual|filename|key|api/i.test(value), false);
});
test("blocked or malformed timing storage never prevents a guide or creates a time estimate", () => {
  const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  assert.doesNotThrow(() => recordGenerationTime(blocked, "model", 120000));
  assert.deepEqual(loadGenerationTimes(blocked, "model"), []);
  assert.deepEqual(loadGenerationTimes({ getItem: () => "broken JSON" }, "model"), []);
  assert.deepEqual(estimateRemaining(1000, []), { kind: "unknown" });
  assert.deepEqual(estimateRemaining(1000, [120000]), { kind: "unknown" });
  assert.deepEqual(estimateRemaining(NaN, [120000, 180000]), { kind: "unknown" });
});
test("a remaining-time reference uses completed durations and becomes uncertain instead of promising zero", () => {
  const samples = [180000, 240000];
  assert.deepEqual(estimateRemaining(60000, samples), { kind: "range", from: 1, to: 6 });
  const nearEnd = estimateRemaining(389999, samples);
  assert.equal(nearEnd.kind, "range"); assert.equal(nearEnd.to, 1);
  assert.deepEqual(estimateRemaining(390000, samples), { kind: "longer" });
  assert.deepEqual(samples, [180000, 240000]);
});
test("elapsed time uses real elapsed milliseconds without rounding up or becoming negative", () => {
  assert.equal(formatElapsed(-1000), "0:00");
  assert.equal(formatElapsed(59999), "0:59");
  assert.equal(formatElapsed(65000), "1:05");
  assert.equal(formatElapsed(900000), "15:00");
});
