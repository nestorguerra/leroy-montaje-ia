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
const { DEMO_SESSION, SAVED_API_KEY, demoCredentialsMatch, hasDemoSession, saveDemoSession, loadSavedApiKey, updateSavedApiKey } = load("../src/lib/browser-session.ts");
const fakeKey = "sk-proj-synthetic-storage-test-not-a-real-key";
const memory = () => {
  const values = new Map();
  return { getItem: name => values.get(name) ?? null, setItem: (name, value) => values.set(name, String(value)), removeItem: name => values.delete(name) };
};

test("demo login checks both fields and never accepts a partial match", () => {
  assert.equal(demoCredentialsMatch("demo", "demo"), true);
  assert.equal(demoCredentialsMatch(" DEMO ", "demo"), true);
  for (const pair of [["demo", ""], ["", "demo"], ["other", "demo"], ["demo", "DEMO"], ["demo", " demo "]]) assert.equal(demoCredentialsMatch(...pair), false);
});
test("session reload and logout use only this application's session marker", () => {
  const storage = memory(); storage.setItem("other-app", "keep");
  assert.equal(hasDemoSession(storage), false);
  saveDemoSession(storage, true); assert.equal(hasDemoSession(storage), true);
  saveDemoSession(storage, false); assert.equal(hasDemoSession(storage), false);
  assert.equal(storage.getItem("other-app"), "keep");
});
test("logout keeps an explicitly saved API key available for the next demo login", () => {
  const session = memory(), local = memory();
  saveDemoSession(session, true); updateSavedApiKey(local, fakeKey, true);
  saveDemoSession(session, false);
  assert.equal(hasDemoSession(session), false); assert.equal(loadSavedApiKey(local), fakeKey);
  saveDemoSession(session, true); assert.equal(hasDemoSession(session), true);
});
test("session-only connection removes saved credentials without clearing unrelated storage", () => {
  const local = memory(); local.setItem("other-app", "keep");
  updateSavedApiKey(local, fakeKey, true); assert.equal(loadSavedApiKey(local), fakeKey);
  updateSavedApiKey(local, fakeKey, false, true);
  assert.equal(local.getItem(SAVED_API_KEY), null); assert.equal(local.getItem("other-app"), "keep");
});
test("malformed or unsupported saved values never become API credentials", () => {
  const local = memory();
  for (const value of ["broken JSON", "null", "123", JSON.stringify({ version: 2, key: fakeKey }), JSON.stringify({ version: 1, key: 123 }), JSON.stringify({ version: 1, key: "invalid" })]) {
    local.setItem(SAVED_API_KEY, value); assert.equal(loadSavedApiKey(local), "");
  }
  assert.throws(() => updateSavedApiKey(local, "invalid", true), /formato/);
});
test("blocked storage allows an ephemeral session but reports save and removal failures without leaking the key", () => {
  const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("quota"); }, removeItem() { throw new Error("blocked"); } };
  assert.equal(hasDemoSession(blocked), false); assert.equal(loadSavedApiKey(blocked), "");
  assert.doesNotThrow(() => saveDemoSession(blocked, true));
  assert.doesNotThrow(() => updateSavedApiKey(null, fakeKey, false));
  assert.throws(() => updateSavedApiKey(blocked, fakeKey, true), error => /no permite guardar/.test(error.message) && !error.message.includes(fakeKey));
  assert.throws(() => updateSavedApiKey(blocked, "", false, true), /no se ha podido borrar/i);
  assert.equal(hasDemoSession(null), false); assert.equal(loadSavedApiKey(null), "");
  assert.equal(DEMO_SESSION.includes("leroy-montaje-ia"), true);
});
