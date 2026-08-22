"use client";

import { useMemo, useState } from "react";

const materials = {
  betong: { label: "Betongpannor", low: 1400, high: 2300 },
  tegel: { label: "Tegelpannor", low: 1700, high: 2800 },
  plat: { label: "Plåttak", low: 1600, high: 2900 },
  papp: { label: "Takpapp", low: 1100, high: 1900 },
};

function money(value: number) {
  return new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(value) + " kr";
}

export function RoofCalculator() {
  const [area, setArea] = useState(140);
  const [material, setMaterial] = useState<keyof typeof materials>("betong");
  const [complexity, setComplexity] = useState(1);

  const estimate = useMemo(() => {
    const selected = materials[material];
    return { low: area * selected.low * complexity, high: area * selected.high * complexity };
  }, [area, material, complexity]);

  return <div className="roof-calculator">
    <div className="calculator-fields">
      <label>Ungefärlig takyta, m²<input type="number" min="20" max="1000" value={area} onChange={(event) => setArea(Math.max(20, Number(event.target.value) || 20))} /></label>
      <label>Takmaterial<select value={material} onChange={(event) => setMaterial(event.target.value as keyof typeof materials)}>{Object.entries(materials).map(([key, item]) => <option value={key} key={key}>{item.label}</option>)}</select></label>
      <label>Takets komplexitet<select value={complexity} onChange={(event) => setComplexity(Number(event.target.value))}><option value="0.9">Enkelt sadeltak</option><option value="1">Normalt tak</option><option value="1.2">Flera vinklar eller kupor</option><option value="1.4">Brant eller komplicerat</option></select></label>
    </div>
    <div className="calculator-result"><small>Indikativt totalintervall</small><strong>{money(estimate.low)}–{money(estimate.high)}</strong><p>Inklusive typiskt material och arbete, före eventuellt ROT-avdrag. Faktiskt pris beror på underlag, åtkomlighet, plåtdetaljer, ort och offert.</p></div>
  </div>;
}
