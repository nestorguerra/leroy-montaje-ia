import type { Plan, ProductSpec, Vec3 } from "../types";
import { PlanBuilder, type HwDef } from "../plan/builder";
import product from "@/data/leroy-neo.json";

// Board dimensions and fitting counts come from the linked manual. Joint positions
// and fitting geometry are illustrative and must never be used for fabrication.
export function buildNeoPlan(): Plan {
  const spec: ProductSpec = {
    name: product.name, variant: "Tres cajones, modelo simplificado", category: "Cómoda",
    archetype: "drawers", size: { w: product.widthCm, h: product.heightCm, d: product.depthCm },
    minutes: 0, people: 2, difficulty: 3, brand: "Prueba de contenidos", source: "catalog",
  };
  const b = new PlanBuilder(spec);
  const board = (name: string, size: Vec3, at: Vec3, fiber = false) =>
    b.place(b.part(name, size, { material: fiber ? "fiber" : "board" }), at);
  const right = board("Costado derecho (8)", [15, 771, 384], [373.5, 420.5, -7.5]);
  const left = board("Costado izquierdo (10)", [15, 771, 384], [-373.5, 420.5, -7.5]);
  const railType = b.part("Travesaño (9)", [732, 50, 12]);
  const rails = [290, 551, 781].map(y => b.place(railType, [0, y, 174]));
  const base = board("Base (11)", [764, 15, 399], [0, 27.5, 0]);
  const back = board("Trasera de la cómoda (12)", [748, 787, 3], [0, 420.5, -192], true);
  const top = board("Tapa (13)", [767, 18, 399], [0, 815, 0]);
  const drawers = [0, 1, 2].map(i => {
    const small = i === 2, bottomY = 60 + i * 261;
    const sideH = small ? 139 : 196, backH = small ? 138 : 196;
    const front = board(`Frente (${small ? "104" : "108"}), cajón ${i + 1}`, [762, small ? 215 : 239, 15], [0, bottomY + (small ? 215 : 239) / 2, 192]);
    const sides = [
      board(`Lateral izquierdo (${small ? "103" : "107"}), cajón ${i + 1}`, [12, sideH, 350], [-356, bottomY + 18 + sideH / 2, 9.5]),
      board(`Lateral derecho (${small ? "102" : "106"}), cajón ${i + 1}`, [12, sideH, 350], [356, bottomY + 18 + sideH / 2, 9.5]),
    ];
    const rear = board(`Trasera (${small ? "101" : "105"}), cajón ${i + 1}`, [700, backH, 13], [0, bottomY + 18 + backH / 2, -159]);
    const floor = board(`Fondo (2), cajón ${i + 1}`, [710, 3, 349], [0, bottomY + 20, 10], true);
    return { i, small, bottomY, sideH, front, sides, rear, floor, all: [rear, ...sides, floor, front] };
  });
  // Generic silhouettes for the manual's codes. No unverified fitting size is shown in the UI.
  const hw = (name: string, kind: HwDef["kind"], len: number, dia: number): HwDef => ({name, kind, len, dia});
  const ADU = hw("ADU", "dowel", 30, 8), ADM = hw("ADM", "dowel", 35, 8);
  const ANK = hw("ANK", "nut", 10, 8), VG = hw("VG", "screw", 14, 3.5);
  const HR = hw("HR", "runner", 350, 18), EP = hw("EP", "angle", 18, 14);
  const VR = hw("VR", "screw", 12, 4), BSD = hw("BSD", "camScrew", 34, 7);
  const Ai = hw("Ai", "cam", 13, 15), BLL = hw("BLL", "bracket", 45, 25);

  function prepareDrawer(d: typeof drawers[number], offset: number) {
    const relative = (key: string): Vec3 => {
      const p = b.partItem(key).final.pos;
      return [p[0] + offset, p[1] - d.bottomY - 18, p[2]];
    };
    for (const [i, key] of d.all.entries()) {
      b.stage(key, relative(key), [0, 0, 0], i < 3 ? [0, 80, -120] : i === 3 ? [0, 0, 200] : [0, 0, 160]);
      b.then(.04);
    }
    const rear = b.partItem(d.rear).final.pos;
    const n = d.small ? 2 : 3;
    for (const sign of [-1, 1]) for (let i = 0; i < n; i++)
      b.preset(ADU, {on:d.rear, at:[sign * 345, d.bottomY + 40 + i * (d.sideH - 40) / n, rear[2]], dir:[-sign,0,0], hole:false});
    for (const sign of [-1, 1]) for (let i = 0; i < 4; i++)
      b.preset(ADU, {on:d.front, at:[sign * 356, d.bottomY + 38 + i * (d.sideH - 35) / 4, 184.5], dir:[0,0,1], hole:false});
  }

  b.step({title:"Monta los dos cajones grandes", detail:"Une las traseras 105 con los laterales 106 y 107, introduce los fondos 2 y coloca los frentes 108. El manual utiliza ADU y adhesivo CF. Esta etapa se repite dos veces.", scene:"neo-large", kind:"drawer", repeat:2}, () => {
    prepareDrawer(drawers[0], -420); prepareDrawer(drawers[1], 420);
  });
  b.step({title:"Monta el cajón superior", detail:"Repite la secuencia con las piezas más bajas: trasera 101, laterales 102 y 103, fondo 2 y frente 104. Respeta las ranuras que recibe el fondo.", scene:"neo-small", kind:"drawer"}, () => prepareDrawer(drawers[2], 0));

  function prepareSide(key: string) {
    b.stage(key, [0, 200, 0], [0, 0, 0], [0, 0, -160]);
    const sign = key === right ? 1 : -1;
    const x = sign * 366;
    for (const y of [78, 339, 600]) {
      b.fit(HR, {on:key, at:[x,y,8], dir:[sign,0,0], hole:false, travel:75});
      for (const z of [-130, 140]) {
        b.fit(ANK, {on:key, at:[x,y,z], dir:[sign,0,0], hole:false});
        b.fit(VG, {on:key, at:[x - sign * 8,y,z], dir:[sign,0,0], hole:false});
      }
    }
    for (const y of [45, 795]) for (const z of [-125, 125])
      b.fit(ADM, {on:key, at:[sign * 373.5,y,z], dir:[0, y < 100 ? 1 : -1,0], hole:false});
  }
  b.step({title:"Prepara el costado derecho", detail:"En la pieza 8 coloca los insertos ANK, las tres guías HR con sus tornillos VG y las espigas ADM. La orientación de las guías debe coincidir con el manual.", scene:"neo-right", pose:"-x", kind:"runners", tools:["hammer","screwdriver"]}, () => prepareSide(right));
  b.step({title:"Prepara el costado izquierdo", detail:"Prepara la pieza 10 con las otras tres guías, sus insertos, tornillos y espigas. Es el lateral opuesto, no una segunda copia con la misma orientación.", scene:"neo-left", pose:"+x", kind:"runners", tools:["hammer","screwdriver"]}, () => prepareSide(left));
  b.step({title:"Prepara los tres travesaños", detail:"Introduce las espigas ADU en los extremos de las tres piezas 9. Sus posiciones se muestran de forma esquemática.", scene:"neo-rails", kind:"dowels"}, () => {
    rails.forEach((key, i) => {
      b.stage(key, [0, 50 + i * 95, 0], [0,0,0], [0,0,-120]);
      const y = b.partItem(key).final.pos[1];
      for (const sign of [-1,1]) for (const dy of [-12,12]) b.fit(ADU,{on:key, at:[sign*366,y+dy,174],dir:[-sign,0,0],hole:false});
    });
  });
  b.step({title:"Une los costados y los travesaños", detail:"Con ayuda de otra persona, encaja las piezas 9 entre los costados 8 y 10. Mantén la orientación de las ranuras que indica el dibujo del manual.", kind:"join", people:2, warnings:["two"]}, () => {
    b.add(left,[-200,0,0]); rails.forEach(k=>b.add(k,[0,0,140])); b.add(right,[200,0,0]);
  });
  b.step({title:"Fija la base y los apoyos", detail:"Une la base 11 con las fijaciones HW. Coloca los cuatro apoyos BXC y sus tornillos XN. El dibujo mantiene el mueble de pie para que se entienda la posición de cada pieza.", kind:"screws", tools:["allen","screwdriver"]}, () => {
    b.add(base,[0,-130,0]);
    for (const sign of [-1,1]) b.fit(hw("HW","bolt",50,6),{on:base,at:[sign*373.5,20,140],dir:[0,1,0],hole:false});
    for (const x of [-345,345]) for (const z of [-160,160]) {
      b.fit(hw("BXC","glide",20,28),{on:base,at:[x,20,z],dir:[0,1,0],hole:false});
      b.fit(hw("XN","screw",25,4),{on:base,at:[x,7,z],dir:[0,1,0],hole:false});
    }
  });
  b.step({title:"Introduce la trasera", detail:"Desliza la pieza 12 por las ranuras de los costados, como indica el paso 8. La animación no reproduce el perfil exacto de esas ranuras.", kind:"join"}, () => b.add(back,[0,250,0]));
  b.step({title:"Prepara la tapa", detail:"Coloca las dos fijaciones BSD y la escuadra BLL con su tornillo VG en la tapa 13, antes de situarla sobre la estructura.", scene:"neo-top", pose:"-y", kind:"bolts", tools:["screwdriver"]}, () => {
    b.stage(top,[0,25,0],[0,0,0],[0,90,0]);
    for(const x of [-373.5,373.5]) b.fit(BSD,{on:top,at:[x,806,0],dir:[0,1,0],hole:false});
    b.fit(BLL,{on:top,at:[0,806,-185],dir:[0,1,0],hole:false});
    b.fit(VG,{on:top,at:[0,800,-175],dir:[0,1,0],hole:false});
  });
  b.step({title:"Coloca y bloquea la tapa", detail:"Encaja la tapa 13 y gira las dos levas Ai para sujetarla a los costados. La animación representa la unión de forma simplificada.", kind:"cams", tools:["screwdriver"]}, () => {
    b.add(top,[0,200,0]);
    for(const key of [left,right]) {
      const x = b.partItem(key).final.pos[0];
      b.fit(Ai,{on:key,at:[x+(x<0?8:-8),790,0],dir:[x<0?-1:1,0,0],hole:false});
    }
  });
  b.step({title:"Sujeta la trasera", detail:"Coloca las dos fijaciones EP que aparecen en la página 13 del manual. Consulta sus puntos exactos en el documento original.", kind:"screws", tools:["screwdriver"], pose:"-z"}, () => {
    for(const x of [-330,330]) b.fit(EP,{on:back,at:[x,60,-195],dir:[0,0,1],hole:false});
  });
  b.step({title:"Fija el mueble a la pared", detail:"El manual exige esta fijación para prevenir el vuelco. Una persona competente debe elegir los tacos adecuados al tipo de pared. Esta simulación no selecciona el anclaje ni valida su instalación.", kind:"anchor", wall:true, warnings:["wall","tip"], pose:"-z"}, () => {});
  function insertDrawer(d: typeof drawers[number]) {
    b.stagger(0);
    d.all.forEach(key=>b.add(key,[0,0,480]));
    for(const x of [-220,220]) {
      b.fit(EP,{on:d.floor,at:[x,d.bottomY+18.5,-80],dir:[0,1,0],hole:false});
      b.fit(VR,{on:d.sides[x<0?0:1],at:[x<0?-349:349,d.bottomY+38,155],dir:[x<0?-1:1,0,0],hole:false});
    }
    b.wait(.4);
  }
  b.step({title:"Introduce los dos cajones grandes", detail:"Añade las fijaciones EP y coloca los dos cajones con frente 108 sobre sus guías. Asegura cada uno con sus tornillos VR, siguiendo el detalle del manual.", kind:"drawer", tools:["screwdriver"], repeat:2}, () => {insertDrawer(drawers[0]);insertDrawer(drawers[1]);});
  b.step({title:"Coloca el cajón superior", detail:"Coloca las fijaciones EP e introduce el cajón más bajo, con frente 104, en las guías superiores. Asegúralo con VR y comprueba su movimiento sin forzar.", kind:"drawer", tools:["screwdriver"]}, () => insertDrawer(drawers[2]));
  const plan = b.build();
  // The optional packing knife is not a required assembly tool.
  plan.tools = plan.tools.filter(t=>t.id!=="knife");
  return plan;
}
