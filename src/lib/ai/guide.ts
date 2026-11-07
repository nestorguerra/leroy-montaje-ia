import { z } from "zod";
import { PlanBuilder } from "../plan/builder";
import type { Plan, Vec3 } from "../types";

const vector = z.object({ x: z.number().min(-20000).max(20000), y: z.number().min(-20000).max(20000), z: z.number().min(-20000).max(20000) }).strict();
const text = z.string().max(2500);

export const guideSchema = z.object({
  status: z.enum(["ready", "insufficient"]),
  reason: text,
  name: z.string().max(160),
  summary: text,
  pageCount: z.number().int().min(1).max(500),
  dimensionsMm: vector,
  people: z.number().int().min(1).max(2),
  tools: z.array(z.string().max(120)).max(20),
  warnings: z.array(text).max(20),
  assumptions: z.array(text).max(30),
  parts: z.array(z.object({
    id: z.string().regex(/^[a-zA-Z0-9_-]{1,40}$/),
    label: z.string().max(24),
    name: z.string().max(180),
    shape: z.enum(["box", "cyl"]),
    material: z.enum(["board", "fiber", "wood", "metal", "soft", "glass"]),
    sizeMm: vector,
    positionMm: vector,
    rotationRad: vector,
    geometryEvidence: z.enum(["documented", "approximate"]),
    sourcePage: z.number().int().min(1).max(500).nullable(),
    note: text,
  }).strict()).max(100),
  steps: z.array(z.object({
    title: z.string().max(180),
    detail: text,
    manualStep: z.string().max(80),
    sourcePage: z.number().int().min(1).max(500).nullable(),
    caution: text,
    motions: z.array(z.object({
      partId: z.string().max(40),
      positionMm: vector,
      rotationRad: vector,
      approachMm: vector,
    }).strict()).max(100),
  }).strict()).max(60),
}).strict();

export type AssemblyGuide = z.infer<typeof guideSchema>;
const vec = (v: z.infer<typeof vector>): Vec3 => [v.x, v.y, v.z];

export function parseGuide(value: unknown): AssemblyGuide {
  const result = guideSchema.safeParse(value);
  if (!result.success) throw new Error("La respuesta no tiene un formato de montaje válido. Pruebe con un manual más claro.");
  const guide = result.data;
  if (guide.status !== "ready") return guide;
  if (!guide.name.trim() || !guide.parts.length || !guide.steps.length || vec(guide.dimensionsMm).some(n => n <= 0)) {
    throw new Error("No hay suficientes piezas o pasos para construir una guía. Revise el manual.");
  }
  const ids = new Set<string>();
  const last = new Map<string, AssemblyGuide["steps"][number]["motions"][number]>();
  const pageValid = (n: number | null) => n === null || n <= guide.pageCount;
  for (const part of guide.parts) {
    if (ids.has(part.id) || vec(part.sizeMm).some(n => n <= 0) || !pageValid(part.sourcePage)) throw new Error("El inventario generado contiene medidas, páginas o identificadores incoherentes.");
    if (part.shape === "cyl" && Math.abs(part.sizeMm.x - part.sizeMm.z) > 0.1) throw new Error("Un cilindro generado tiene dos diámetros diferentes. Vuelva a generar la guía.");
    ids.add(part.id);
  }
  for (const step of guide.steps) {
    if (!step.title.trim() || !pageValid(step.sourcePage)) throw new Error("Hay un paso sin título o con una página fuera del manual.");
    const seen = new Set<string>();
    for (const motion of step.motions) {
      if (!ids.has(motion.partId) || seen.has(motion.partId)) throw new Error("Un paso menciona una pieza inexistente o repetida. Vuelva a generar la guía.");
      seen.add(motion.partId);
      last.set(motion.partId, motion);
    }
  }
  for (const part of guide.parts) {
    const motion = last.get(part.id);
    if (!motion) throw new Error("Hay piezas sin ningún paso de montaje. Vuelva a generar la guía.");
    const final = [...vec(part.positionMm), ...vec(part.rotationRad)];
    const end = [...vec(motion.positionMm), ...vec(motion.rotationRad)];
    if (final.some((n, i) => Math.abs(n - end[i]) > 0.1)) throw new Error("La posición final de una pieza no coincide con sus pasos. Vuelva a generar la guía.");
  }
  return guide;
}

export function buildAIPlan(guide: AssemblyGuide): Plan {
  if (guide.status !== "ready") throw new Error(guide.reason || "El manual no contiene información suficiente.");
  const b = new PlanBuilder({
    name: guide.name, variant: "Modelo esquemático generado con IA", category: "Manual propio",
    archetype: "custom", source: "ai", minutes: 0,
    size: { w: guide.dimensionsMm.x / 10, h: guide.dimensionsMm.y / 10, d: guide.dimensionsMm.z / 10 },
    people: guide.people as 1 | 2, difficulty: 2,
  });
  const keys = new Map<string, string>();
  for (const part of guide.parts) {
    const type = b.part(part.name, vec(part.sizeMm), { shape: part.shape, material: part.material, label: part.label });
    keys.set(part.id, b.place(type, vec(part.positionMm), vec(part.rotationRad)));
  }
  for (const step of guide.steps) {
    b.step({ title: step.title, detail: step.detail, kind: "general", people: guide.people as 1 | 2 }, () => {
      for (const motion of step.motions) b.stage(keys.get(motion.partId)!, vec(motion.positionMm), vec(motion.rotationRad), vec(motion.approachMm));
    });
  }
  const plan = b.build();
  plan.tools = [];
  return plan;
}

export const guideJSONSchema = z.toJSONSchema(guideSchema, { target: "draft-7" });
