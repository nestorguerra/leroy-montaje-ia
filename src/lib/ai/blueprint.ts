import { z } from "zod";
import { GuideValidationError, guideSchema, parseGuide, type AssemblyGuide } from "./guide";

const vector = guideSchema.shape.dimensionsMm;
const length = z.number().min(0.01).max(20000);
const geometry = z.union([
  z.object({ shape: z.literal("box"), sizeMm: z.object({ x: length, y: length, z: length }).strict() }).strict(),
  z.object({ shape: z.literal("cyl"), diameterMm: length, lengthMm: length }).strict(),
]);

// A piece owns its placements. Ids and final poses belong to the compiler,
// so the model never has to keep duplicate copies of those values in sync.
export const blueprintSchema = guideSchema.omit({ parts: true, steps: true }).extend({
  steps: z.array(guideSchema.shape.steps.element.omit({ motions: true })).max(60),
  parts: z.array(guideSchema.shape.parts.element.omit({
    id: true, shape: true, sizeMm: true, positionMm: true, rotationRad: true,
  }).extend({
    geometry,
    placements: z.array(z.object({
      stepNumber: z.number().int().min(1).max(60).describe("Índice de steps contando desde 1, no el número impreso en el manual."),
      positionMm: vector,
      rotationRad: vector,
      approachMm: vector,
    }).strict()).min(1).max(60),
  }).strict()).max(100),
}).strict();

export function parseBlueprint(value: unknown): AssemblyGuide {
  const parsed = blueprintSchema.safeParse(value);
  if (!parsed.success) throw new GuideValidationError(`La respuesta tiene campos inválidos: ${parsed.error.issues.slice(0, 5).map(issue => issue.path.join(".")).join(", ")}.`);
  const blueprint = parsed.data;
  const steps: AssemblyGuide["steps"] = blueprint.steps.map(step => ({ ...step, motions: [] }));
  const parts: AssemblyGuide["parts"] = [];
  for (const [index, part] of blueprint.parts.entries()) {
    const { geometry, placements, ...metadata } = part;
    const id = `p${String(index + 1).padStart(3, "0")}`;
    const byStep = new Map<number, typeof placements[number]>();
    for (const placement of placements) {
      if (placement.stepNumber > steps.length) throw new GuideValidationError(`La pieza ${index + 1} (${part.label}) usa el paso ${placement.stepNumber}, pero steps solo tiene ${steps.length} pasos. stepNumber es el índice de steps desde 1.`);
      const previous = byStep.get(placement.stepNumber);
      if (previous && JSON.stringify(previous) !== JSON.stringify(placement)) throw new GuideValidationError(`La pieza ${index + 1} (${part.label}) tiene dos movimientos distintos en el paso ${placement.stepNumber}. Conserva las acciones del manual en etapas separadas.`);
      byStep.set(placement.stepNumber, placement);
    }
    const ordered = [...byStep.values()].sort((a, b) => a.stepNumber - b.stepNumber);
    const final = ordered[ordered.length - 1];
    parts.push({ ...metadata, id, shape: geometry.shape,
      sizeMm: geometry.shape === "box" ? geometry.sizeMm : { x: geometry.diameterMm, y: geometry.lengthMm, z: geometry.diameterMm },
      positionMm: final.positionMm, rotationRad: final.rotationRad,
    });
    for (const { stepNumber, ...pose } of ordered) steps[stepNumber - 1].motions.push({ partId: id, ...pose });
  }
  return parseGuide({ ...blueprint, parts, steps });
}

export const blueprintJSONSchema = z.toJSONSchema(blueprintSchema, { target: "draft-7" });
