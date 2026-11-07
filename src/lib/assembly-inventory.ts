import type { AssemblyGuide } from "./ai/guide";
import type { Plan } from "./types";

export function assemblyInventory(guide: AssemblyGuide, plan: Plan) {
  const groups = new Map<string, { ref: string; label: string; name: string; count: number; part: AssemblyGuide["parts"][number] }>();
  guide.parts.forEach((part, index) => {
    const key = JSON.stringify([part.label, part.name, part.shape, part.material, part.sizeMm, part.geometryEvidence, part.note]);
    const existing = groups.get(key);
    if (existing) existing.count++;
    else groups.set(key, { ref: plan.parts[index].id, label: part.label, name: part.name, count: 1, part });
  });
  return [...groups.values()];
}

export type InventoryGroup = ReturnType<typeof assemblyInventory>[number];
