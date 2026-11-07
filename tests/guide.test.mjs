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
const { parseBlueprint, blueprintJSONSchema } = load("../src/lib/ai/blueprint.ts");
const { generateGuide, MODELS } = load("../src/lib/ai/openai.ts");
const { readOpenAIResponse } = load("../src/lib/ai/response.ts");

const vector = (x = 0, y = 0, z = 0) => ({ x, y, z });
const fixture = () => ({
  status: "ready", reason: "", name: "Prueba sintética", summary: "Datos ficticios para verificar el programa.", pageCount: 2,
  dimensionsMm: vector(400, 400, 400), people: 1, tools: [], warnings: [], assumptions: ["Geometría ficticia."],
  parts: ["p001", "p002"].map((id, i) => ({ id, label: "A", name: `Pieza ${i + 1}`, shape: "box", material: "wood", sizeMm: vector(20, 100, 20), positionMm: vector(i * 100, 50, 0), rotationRad: vector(), geometryEvidence: "approximate", sourcePage: 1, note: "Sintética." })),
  steps: ["p001", "p002"].map((partId, i) => ({ title: `Paso ${i + 1}`, detail: "Ejemplo ficticio.", manualStep: `${i + 1}`, sourcePage: i + 1, caution: "", motions: [{ partId, positionMm: vector(i * 100, 50, 0), rotationRad: vector(), approachMm: vector(0, 100, 0) }] })),
});
const blueprint = () => {
  const guide = fixture();
  return { ...guide, steps: guide.steps.map(step => ({ title: step.title, detail: step.detail, manualStep: step.manualStep, sourcePage: step.sourcePage, caution: step.caution })), parts: guide.parts.map((part, index) => ({
    label: part.label, name: part.name, material: part.material, geometryEvidence: part.geometryEvidence, sourcePage: part.sourcePage, note: part.note,
    geometry: { shape: part.shape, sizeMm: part.sizeMm }, placements: [{ stepNumber: index + 1, positionMm: part.positionMm, rotationRad: part.rotationRad, approachMm: vector(0, 100, 0) }],
  })) };
};

test("blueprint assigns unique ids to repeated labels and derives final poses from placements", () => {
  const input = blueprint();
  input.parts[0].placements.unshift({ stepNumber: 2, positionMm: vector(300, 400, 500), rotationRad: vector(0, 1.5, 0), approachMm: vector() });
  const guide = parseBlueprint(input);
  assert.deepEqual(guide.parts.map(p => p.id), ["p001", "p002"]);
  assert.deepEqual(guide.parts[0].positionMm, vector(300, 400, 500));
  assert.deepEqual(guide.parts[0].rotationRad, vector(0, 1.5, 0));
  assert.equal(guide.steps[1].motions.length, 2);
  assert.equal(input.parts[0].id, undefined);
  assert.equal(input.parts[0].positionMm, undefined);
  assert.equal(input.parts[0].placements[0].stepNumber, 2);
});
test("many repeated pieces preserve their count and move together as a subassembly", () => {
  const input = blueprint();
  input.parts = Array.from({ length: 80 }, (_, i) => ({ ...input.parts[0], label: "P1", placements: [
    { stepNumber: 1, positionMm: vector(i * 10, 100, 100), rotationRad: vector(), approachMm: vector() },
    { stepNumber: 2, positionMm: vector(i * 10 + 500, 800, -200), rotationRad: vector(), approachMm: vector(0, 700, 0) },
  ] }));
  const guide = parseBlueprint(input);
  assert.equal(new Set(guide.parts.map(p => p.id)).size, 80);
  for (let i = 0; i < 80; i++) {
    assert.equal(guide.steps[1].motions[i].positionMm.x - guide.steps[0].motions[i].positionMm.x, 500);
    assert.deepEqual(guide.steps[1].motions[i].positionMm, guide.parts[i].positionMm);
  }
});
test("blueprint uses a single cylinder diameter and rejects invalid steps, pages or conflicting placements", () => {
  const input = blueprint(); input.parts[0].geometry = { shape: "cyl", diameterMm: 20, lengthMm: 100 };
  assert.deepEqual(parseBlueprint(input).parts[0].sizeMm, vector(20, 100, 20));
  input.parts[0].placements[0].stepNumber = 3;
  assert.throws(() => parseBlueprint(input), /paso 3.*2 pasos/);
  input.parts[0].placements[0].stepNumber = 1;
  const placement = structuredClone(input.parts[0].placements[0]);
  input.parts[0].placements.push(placement);
  assert.equal(parseBlueprint(input).steps[0].motions.length, 1);
  placement.positionMm.y += 1;
  assert.throws(() => parseBlueprint(input), /dos movimientos distintos/);
  input.parts[0].placements.pop(); input.parts[0].sourcePage = 3;
  assert.throws(() => parseBlueprint(input), /página fuera/);
});
test("strict API schema contains no model-authored ids or duplicate final poses", () => {
  const properties = blueprintJSONSchema.properties.parts.items.properties;
  for (const name of ["id", "partId", "positionMm", "rotationRad"]) assert.equal(properties[name], undefined);
  assert.equal(properties.geometry.anyOf.length, 2);
  assert.equal(blueprintJSONSchema.additionalProperties, false);
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
const run = (phase, signal = new AbortController().signal) => generateGuide("sk-test-only-fictitious", [pdf()], MODELS[0].id, signal, phase);

test("requests Sol xhigh and repairs an invalid step once with the original manual and precise feedback", async t => {
  const calls = []; const phases = [];
  t.mock.method(globalThis, "fetch", async (url, init) => {
    assert.equal(url, "https://api.openai.com/v1/responses");
    calls.push(JSON.parse(init.body));
    const guide = blueprint(); if (calls.length === 1) guide.parts[0].placements[0].stepNumber = 3;
    return response(guide);
  });
  const result = await run(phase => phases.push(phase));
  assert.equal(calls.length, 2);
  assert.deepEqual(phases, ["interpreting", "correcting"]);
  assert.equal(calls[1].input[0].content[1].type, "input_file");
  assert.equal(calls[1].input[1].role, "assistant");
  assert.match(calls[1].input[2].content[0].text, /paso 3.*2 pasos/);
  assert.equal(calls[1].store, false);
  assert.equal(calls[0].model, "gpt-6.1-sol");
  assert.deepEqual(calls[0].reasoning, { effort: "xhigh" });
  assert.equal(calls[0].stream, true);
  assert.equal(calls[0].max_output_tokens, 64000);
  assert.equal(calls[0].text.format.strict, true);
  for (const name of ["temperature", "top_p", "top_logprobs"]) assert.equal(calls[0][name], undefined);
  assert.deepEqual(result.usage, { input: 200, output: 400 });
  assert.equal(result.guide.parts.length, 2);
});
test("identical duplicates need no extra API call", async t => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => { calls++; const guide = blueprint(); guide.parts[0].placements.push(structuredClone(guide.parts[0].placements[0])); return response(guide); });
  assert.equal((await run()).guide.steps[0].motions.length, 1);
  assert.equal(calls, 1);
});
test("stops after one failed correction and never displays the invalid plan", async t => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => { calls++; const guide = blueprint(); guide.parts[0].placements[0].stepNumber = 3; return response(guide); });
  await assert.rejects(run(), /incluso tras revisar/);
  assert.equal(calls, 2);
});
test("does not retry authentication, billing, network, incomplete or refusal errors", async t => {
  for (const status of [401, 404, 429]) {
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
  const mock = t.mock.method(globalThis, "fetch", async () => { calls++; return response({ ...blueprint(), status: "insufficient", reason: "Faltan páginas.", parts: [], steps: [] }); });
  assert.equal((await run()).guide.status, "insufficient"); assert.equal(calls, 1); mock.mock.restore();
  calls = 0;
  const abort = new AbortController();
  t.mock.method(globalThis, "fetch", async () => { calls++; const guide = blueprint(); guide.parts[0].placements[0].stepNumber = 3; return response(guide); });
  await assert.rejects(run(phase => { if (phase === "correcting") abort.abort(); }, abort.signal));
  assert.equal(calls, 1);
});

function eventResponse(events, size = 7, lineEnding = "\n") {
  const bytes = new TextEncoder().encode(events.map(e => `event: ${e.type}${lineEnding}data: ${JSON.stringify(e)}${lineEnding}${lineEnding}`).join(""));
  return new Response(new ReadableStream({ start(controller) {
    for (let i = 0; i < bytes.length; i += size) controller.enqueue(bytes.slice(i, i + size));
    controller.close();
  } }), { headers: { "Content-Type": "text/event-stream; charset=utf-8" } });
}
test("reads chunked SSE including split UTF-8 and CRLF, accepting only the terminal response", async t => {
  const input = blueprint(); input.name = "Montaje sintético, acción";
  const result = await response(input).json();
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => { calls++; return eventResponse([
    { type: "response.created", response: { status: "in_progress" } },
    { type: "response.output_text.delta", delta: "{invalid partial JSON" },
    { type: "response.completed", response: result },
  ], 1, "\r\n"); });
  assert.equal((await run()).guide.name, input.name);
  assert.equal(calls, 1);
});
test("a truncated stream, API error or incomplete response never triggers an automatic repair", async t => {
  for (const events of [
    [{ type: "response.output_text.delta", delta: JSON.stringify(blueprint()) }],
    [{ type: "error", message: "Private upstream payload" }],
    [{ type: "response.incomplete", response: { status: "incomplete", output: [] } }],
  ]) {
    let calls = 0;
    const mock = t.mock.method(globalThis, "fetch", async () => { calls++; return eventResponse(events); });
    await assert.rejects(run(), error => !error.message.includes("Private upstream"));
    assert.equal(calls, 1); mock.mock.restore();
  }
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => { calls++; return new Response(new ReadableStream({ start(controller) { controller.error(new TypeError("Private connection details")); } }), { headers: { "Content-Type": "text/event-stream" } }); });
  await assert.rejects(run(), /conexión con OpenAI se ha interrumpido/);
  assert.equal(calls, 1);
});
test("cancelling an active stream releases the reader without waiting for another event", async () => {
  const abort = new AbortController(); let cancelled = false;
  const stream = new Response(new ReadableStream({ cancel() { cancelled = true; } }), { headers: { "Content-Type": "text/event-stream" } });
  const pending = readOpenAIResponse(stream, abort.signal);
  abort.abort();
  await assert.rejects(pending, error => error.name === "AbortError");
  assert.equal(cancelled, true);
  assert.equal(stream.body.locked, false);
});
