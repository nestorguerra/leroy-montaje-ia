/* Synthetic software fixtures. No manufacturer manual or valid API credential. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

const load = createRequire(import.meta.url);
load.extensions[".ts"] = (module, filename) => {
  const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    fileName: filename,
  });
  module._compile(source.outputText, filename);
};
const { parseGuide, GuideValidationError } = load("../src/lib/ai/guide.ts");
const { generateGuide } = load("../src/lib/ai/openai.ts");

const vector = (x = 0, y = 0, z = 0) => ({ x, y, z });
const fixture = () => ({
  status: "ready", reason: "", name: "Prueba sintética", summary: "Datos ficticios para verificar el programa.", pageCount: 2,
  dimensionsMm: vector(400, 400, 400), people: 1, tools: [], warnings: [], assumptions: ["Geometría ficticia."],
  parts: ["p001", "p002"].map((id, i) => ({ id, label: "A", name: `Pieza ${i + 1}`, shape: "box", material: "wood", sizeMm: vector(20, 100, 20), positionMm: vector(i * 100, 50, 0), rotationRad: vector(), geometryEvidence: "approximate", sourcePage: 1, note: "Sintética." })),
  steps: ["p001", "p002"].map((partId, i) => ({ title: `Paso ${i + 1}`, detail: "Ejemplo ficticio.", manualStep: `${i + 1}`, sourcePage: i + 1, caution: "", motions: [{ partId, positionMm: vector(i * 100, 50, 0), rotationRad: vector(), approachMm: vector(0, 100, 0) }] })),
});

test("allows repeated labels and the same physical piece in separate steps", () => {
  const guide = fixture();
  const motion = structuredClone(guide.steps[0].motions[0]);
  guide.steps[0].motions[0].positionMm.y = 200;
  guide.steps[1].motions.push(motion);
  assert.equal(parseGuide(guide).parts.length, 2);
});
test("unknown references identify the precise step and id", () => {
  const guide = fixture(); guide.steps[1].motions[0].partId = "missing";
  assert.throws(() => parseGuide(guide), e => e instanceof GuideValidationError && /paso 2.*missing/.test(e.message));
});
test("removes only an identical repeated motion without mutating input", () => {
  const guide = fixture(); guide.steps[0].motions.push(structuredClone(guide.steps[0].motions[0]));
  assert.equal(parseGuide(guide).steps[0].motions.length, 1);
  assert.equal(guide.steps[0].motions.length, 2);
});
test("conflicting motions for one piece in one step remain rejected", () => {
  const guide = fixture(); const motion = structuredClone(guide.steps[0].motions[0]);
  motion.positionMm.y += 40; guide.steps[0].motions.push(motion);
  assert.throws(() => parseGuide(guide), /dos veces con poses diferentes/);
});
test("trims a reference only when it exactly matches an inventory id", () => {
  const guide = fixture(); guide.steps[0].motions[0].partId = " p001 ";
  assert.equal(parseGuide(guide).steps[0].motions[0].partId, "p001");
  guide.steps[0].motions[0].partId = "P001";
  assert.throws(() => parseGuide(guide), /no existe en parts/);
});
test("rejects duplicate inventory ids, unassembled pieces and mismatched final poses", () => {
  const duplicate = fixture(); duplicate.parts[1].id = "p001";
  assert.throws(() => parseGuide(duplicate), /inventario repite/);
  const missing = fixture(); missing.steps[0].motions = [];
  assert.throws(() => parseGuide(missing), /no aparece en ningún paso/);
  const wrong = fixture(); wrong.steps[0].motions[0].positionMm.y = 150;
  assert.throws(() => parseGuide(wrong), /última pose/);
});

class TestFileReader {
  readAsDataURL(file) { file.arrayBuffer().then(bytes => { this.result = `data:application/pdf;base64,${Buffer.from(bytes).toString("base64")}`; this.onload(); }); }
}
globalThis.FileReader = TestFileReader;
const pdf = () => new File(["%PDF-1.4\nSynthetic software test only."], "synthetic.pdf", { type: "application/pdf" });
const response = guide => new Response(JSON.stringify({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(guide) }] }], usage: { input_tokens: 100, output_tokens: 200 } }), { status: 200 });
const run = (phase, signal = new AbortController().signal) => generateGuide("sk-test-only-fictitious", [pdf()], "gpt-5.4-mini", signal, phase);

test("repairs a dangling reference once using the original manual and precise feedback", async t => {
  const calls = []; const phases = [];
  t.mock.method(globalThis, "fetch", async (url, init) => {
    assert.equal(url, "https://api.openai.com/v1/responses");
    calls.push(JSON.parse(init.body));
    const guide = fixture(); if (calls.length === 1) guide.steps[0].motions[0].partId = "missing";
    return response(guide);
  });
  const result = await run(phase => phases.push(phase));
  assert.equal(calls.length, 2);
  assert.deepEqual(phases, ["interpreting", "correcting"]);
  assert.equal(calls[1].input[0].content[1].type, "input_file");
  assert.equal(calls[1].input[1].role, "assistant");
  assert.match(calls[1].input[2].content[0].text, /paso 1.*missing/);
  assert.equal(calls[1].store, false);
  assert.deepEqual(result.usage, { input: 200, output: 400 });
  assert.equal(result.guide.parts.length, 2);
});
test("identical duplicates need no extra API call", async t => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => { calls++; const guide = fixture(); guide.steps[0].motions.push(structuredClone(guide.steps[0].motions[0])); return response(guide); });
  assert.equal((await run()).guide.steps[0].motions.length, 1);
  assert.equal(calls, 1);
});
test("stops after one failed correction and never displays the invalid plan", async t => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => { calls++; const guide = fixture(); guide.steps[0].motions[0].partId = "missing"; return response(guide); });
  await assert.rejects(run(), /incluso tras revisar/);
  assert.equal(calls, 2);
});
test("does not retry authentication, billing, network, incomplete or refusal errors", async t => {
  for (const status of [401, 429]) {
    let calls = 0;
    const mock = t.mock.method(globalThis, "fetch", async () => { calls++; return new Response("private payload must not be displayed", { status }); });
    await assert.rejects(run(), e => !e.message.includes("private payload"));
    assert.equal(calls, 1); mock.mock.restore();
  }
  for (const result of [{ status: "incomplete", output: [] }, { status: "completed", output: [{ content: [{ type: "refusal" }] }] }]) {
    let calls = 0;
    const mock = t.mock.method(globalThis, "fetch", async () => { calls++; return new Response(JSON.stringify(result)); });
    await assert.rejects(run()); assert.equal(calls, 1); mock.mock.restore();
  }
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => { calls++; throw new Error("Network failure"); });
  await assert.rejects(run(), /conectar con OpenAI/); assert.equal(calls, 1);
});
test("does not repair an insufficient manual or continue a cancelled correction", async t => {
  let calls = 0;
  const mock = t.mock.method(globalThis, "fetch", async () => { calls++; return response({ ...fixture(), status: "insufficient", reason: "Faltan páginas.", parts: [], steps: [] }); });
  assert.equal((await run()).guide.status, "insufficient"); assert.equal(calls, 1); mock.mock.restore();
  calls = 0;
  const abort = new AbortController();
  t.mock.method(globalThis, "fetch", async () => { calls++; const guide = fixture(); guide.steps[0].motions[0].partId = "missing"; return response(guide); });
  await assert.rejects(run(phase => { if (phase === "correcting") abort.abort(); }, abort.signal));
  assert.equal(calls, 1);
});
