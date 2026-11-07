import type { ProductSpec, Plan } from "../types";
import { PlanBuilder } from "../plan/builder";
import product from "@/data/leroy-day.json";

// Dimensions of hidden components are visual assumptions, never manufacturing data.
export function buildDayPlan(diameterCm = product.diameterCm, heightCm = product.heightCm): Plan {
  const spec: ProductSpec = {
    name: product.name, variant: "Tres patas, modelo simplificado", category: "Mesa auxiliar",
    archetype: "table", size: { w: diameterCm, h: heightCm, d: diameterCm },
    minutes: 0, people: 1, difficulty: 1, brand: "Prueba de contenidos", source: "catalog",
  };
  const b = new PlanBuilder(spec);
  const diameter = diameterCm * 10, height = heightCm * 10, thickness = 18;
  const topType = b.part("Tablero", [diameter, thickness, diameter], { shape: "cyl", material: "board" });
  const top = b.place(topType, [0, height - thickness / 2, 0]);
  const legHeight = height - thickness;
  const legType = b.part("Pata", [32, legHeight, 32], { shape: "cyl", material: "wood" });
  const radius = diameter * 0.3125;
  const legs = Array.from({ length: product.legs }, (_, i) => {
    const angle = i * Math.PI * 2 / product.legs;
    return b.place(legType, [Math.cos(angle) * radius, legHeight / 2, Math.sin(angle) * radius]);
  });
  // Illustrative anchor marks; their exact position and diameter need the real component drawing.
  legs.forEach(leg => {
    const p = b.partItem(leg).final.pos;
    b.hole(top, [p[0], height - thickness, p[2]], [0, -1, 0], 4);
  });
  b.step({ title: "Prepara el tablero", detail: "Apoya la cara superior sobre una superficie limpia y blanda, con la parte inferior hacia arriba.", pose: "-y", kind: "general" }, () => b.add(top, [0, 150, 0]));
  b.step({ title: "Localiza los tres anclajes", detail: "Identifica las fijaciones de la parte inferior. Su posición en este dibujo es aproximada.", pose: "-y", kind: "general" }, () => {});
  legs.forEach((leg, i) => b.step({ title: `Enrosca la pata ${i + 1}`, detail: "Alinéala con su anclaje y gira en sentido horario hasta que quede firmemente sujeta. El giro mostrado es ilustrativo.", pose: "-y", kind: "legs" }, () => b.add(leg, [0, -200, 0], { spin: 2 })));
  b.step({ title: "Pon la mesa de pie", detail: "Con las tres patas instaladas, da la vuelta a la mesa.", pose: "+y", kind: "general" }, () => {});
  b.step({ title: "Comprueba la estabilidad", detail: "Si se balancea, revisa que las patas estén roscadas hasta el tope. No te subas ni te sientes sobre la mesa.", pose: "+y", kind: "general" }, () => {});
  const plan = b.build();
  plan.tools = [];
  return plan;
}
