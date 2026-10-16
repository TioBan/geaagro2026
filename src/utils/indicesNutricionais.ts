import { LeafSample, LeafLabResults } from '../types/foliar';
import { FOLIAR_SUFFICIENCY_RANGES } from '../data/foliarData';

export interface DOPItem {
  nutrient: string;
  name: string;
  measured: number;
  unit: string;
  minAdequate: number;
  maxAdequate: number;
  optimum: number;
  dop: number; // percentage deviation
  status: 'Muito Deficiente' | 'Deficiente' | 'Equilibrado' | 'Excessivo' | 'Muito Excessivo';
  color: string;
}

export interface DRISItem {
  nutrient: string;
  name: string;
  measured: number;
  unit: string;
  index: number;
  status: 'Deficiente' | 'Equilibrado' | 'Excesso';
  color: string;
}

export interface CNDItem {
  nutrient: string;
  name: string;
  measuredGKg: number; // g/kg
  logRatio: number; // Vx = ln(X/G)
  index: number; // ICND
  status: 'Deficiente' | 'Equilibrado' | 'Excesso';
  color: string;
}

export interface AbsorptionPoint {
  stage: string;
  dae: number;
  demandPercent: number; // 0 to 100%
  rateKgPerHaDay: number;
  measuredVal?: number;
  idealVal?: number;
}

const NUTRIENT_NAMES: Record<string, string> = {
  N: 'Nitrogênio',
  P: 'Fósforo',
  K: 'Potássio',
  Ca: 'Cálcio',
  Mg: 'Magnésio',
  S: 'Enxofre',
  B: 'Boro',
  Cu: 'Cobre',
  Fe: 'Ferro',
  Mn: 'Manganês',
  Zn: 'Zinco',
  Mo: 'Molibdênio'
};

// Returns target sufficiency ranges for a given crop
export function getTargetRanges(cropName?: string) {
  const norm = (cropName || 'Soja').toLowerCase();
  const range = FOLIAR_SUFFICIENCY_RANGES.find(r => r.crop.toLowerCase().includes(norm)) || FOLIAR_SUFFICIENCY_RANGES[0];
  
  const macros = range.macros;
  const micros = range.micros;

  return {
    N: { min: macros.N.minAdequate, max: macros.N.maxAdequate, unit: 'g/kg', type: 'macro' },
    P: { min: macros.P.minAdequate, max: macros.P.maxAdequate, unit: 'g/kg', type: 'macro' },
    K: { min: macros.K.minAdequate, max: macros.K.maxAdequate, unit: 'g/kg', type: 'macro' },
    Ca: { min: macros.Ca.minAdequate, max: macros.Ca.maxAdequate, unit: 'g/kg', type: 'macro' },
    Mg: { min: macros.Mg.minAdequate, max: macros.Mg.maxAdequate, unit: 'g/kg', type: 'macro' },
    S: { min: macros.S.minAdequate, max: macros.S.maxAdequate, unit: 'g/kg', type: 'macro' },
    B: { min: micros.B.minAdequate, max: micros.B.maxAdequate, unit: 'mg/kg', type: 'micro' },
    Cu: { min: micros.Cu.minAdequate, max: micros.Cu.maxAdequate, unit: 'mg/kg', type: 'micro' },
    Fe: { min: micros.Fe.minAdequate, max: micros.Fe.maxAdequate, unit: 'mg/kg', type: 'micro' },
    Mn: { min: micros.Mn.minAdequate, max: micros.Mn.maxAdequate, unit: 'mg/kg', type: 'micro' },
    Zn: { min: micros.Zn.minAdequate, max: micros.Zn.maxAdequate, unit: 'mg/kg', type: 'micro' },
    Mo: { min: micros.Mo.minAdequate, max: micros.Mo.maxAdequate, unit: 'mg/kg', type: 'micro' }
  };
}

// ------------------------------------------------------------------
// 1. CALCULATE DOP (Desvio do Percentual Ótimo)
// ------------------------------------------------------------------
export function calculateDOP(sample: LeafSample) {
  const results = sample?.results || ({} as LeafLabResults);
  const targets = getTargetRanges(sample?.crop || 'Soja');
  const items: DOPItem[] = [];

  let sumAbsDOP = 0;

  (Object.keys(targets) as (keyof typeof targets)[]).forEach((nut) => {
    const measured = Number(results[nut as keyof LeafLabResults]) || 0;
    if (measured <= 0) return;

    const t = targets[nut];
    const optimum = (t.min + t.max) / 2;
    const dop = Math.round(((measured - optimum) / optimum) * 1000) / 10; // 1 decimal place

    sumAbsDOP += Math.abs(dop);

    let status: DOPItem['status'] = 'Equilibrado';
    let color = '#10b981'; // emerald-500

    if (dop < -25) {
      status = 'Muito Deficiente';
      color = '#ef4444'; // red-500
    } else if (dop < -5) {
      status = 'Deficiente';
      color = '#f59e0b'; // amber-500
    } else if (dop <= 5) {
      status = 'Equilibrado';
      color = '#10b981'; // emerald-500
    } else if (dop <= 25) {
      status = 'Excessivo';
      color = '#3b82f6'; // blue-500
    } else {
      status = 'Muito Excessivo';
      color = '#8b5cf6'; // purple-500
    }

    items.push({
      nutrient: nut,
      name: NUTRIENT_NAMES[nut] || nut,
      measured,
      unit: t.unit,
      minAdequate: t.min,
      maxAdequate: t.max,
      optimum,
      dop,
      status,
      color
    });
  });

  const totalDOP = Math.round(sumAbsDOP * 10) / 10;
  const avgDOP = items.length > 0 ? Math.round((totalDOP / items.length) * 10) / 10 : 0;

  // Order of requirement (from most negative to most positive)
  const limitingOrder = [...items].sort((a, b) => a.dop - b.dop);
  const mostDeficient = limitingOrder[0] || null;
  const mostExcessive = limitingOrder[limitingOrder.length - 1] || null;

  return {
    items,
    totalDOP,
    avgDOP,
    limitingOrder,
    mostDeficient,
    mostExcessive
  };
}

// ------------------------------------------------------------------
// 2. CALCULATE DRIS (Sistema Integrado de Diagnose e Recomendação)
// ------------------------------------------------------------------
export function calculateDRIS(sample: LeafSample) {
  const results = sample?.results || ({} as LeafLabResults);
  const targets = getTargetRanges(sample?.crop || 'Soja');

  const nutrients = (Object.keys(targets) as (keyof typeof targets)[]).filter(
    (n) => (Number(results[n as keyof LeafLabResults]) || 0) > 0
  );

  const drisScores: Record<string, number> = {};
  nutrients.forEach(n => { drisScores[n] = 0; });

  const CV = 20; // 20% coefficient of variation default norm

  // Calculate dual ratios
  let pairCount = 0;
  for (let i = 0; i < nutrients.length; i++) {
    for (let j = i + 1; j < nutrients.length; j++) {
      const n1 = nutrients[i];
      const n2 = nutrients[j];

      const val1 = Number(results[n1 as keyof LeafLabResults]) || 0;
      const val2 = Number(results[n2 as keyof LeafLabResults]) || 0;
      if (val2 === 0) continue;

      const observedRatio = val1 / val2;

      const t1 = targets[n1];
      const t2 = targets[n2];
      const opt1 = (t1.min + t1.max) / 2;
      const opt2 = (t2.min + t2.max) / 2;
      const normRatio = opt1 / opt2;

      let fVal = 0;
      if (observedRatio >= normRatio) {
        fVal = ((observedRatio / normRatio) - 1) * (100 / CV);
      } else {
        fVal = (1 - (normRatio / observedRatio)) * (100 / CV);
      }

      drisScores[n1] = (drisScores[n1] || 0) + fVal;
      drisScores[n2] = (drisScores[n2] || 0) - fVal;
      pairCount++;
    }
  }

  const items: DRISItem[] = [];
  let sumAbsDRIS = 0;

  nutrients.forEach((nut) => {
    // Average index divided by number of pairs involving this nutrient
    const rawIndex = (drisScores[nut] || 0) / Math.max(1, nutrients.length - 1);
    const index = Math.round(rawIndex * 10) / 10;
    sumAbsDRIS += Math.abs(index);

    let status: DRISItem['status'] = 'Equilibrado';
    let color = '#10b981';

    if (index < -10) {
      status = 'Deficiente';
      color = '#ef4444';
    } else if (index > 10) {
      status = 'Excesso';
      color = '#3b82f6';
    }

    items.push({
      nutrient: nut,
      name: NUTRIENT_NAMES[nut] || nut,
      measured: Number(results[nut as keyof LeafLabResults]) || 0,
      unit: targets[nut].unit,
      index,
      status,
      color
    });
  });

  const IBN = Math.round(sumAbsDRIS * 10) / 10; // Índice de Balanço Nutricional
  const IBNm = items.length > 0 ? Math.round((IBN / items.length) * 10) / 10 : 0;

  const sorted = [...items].sort((a, b) => a.index - b.index);
  const mostDeficient = sorted[0] || null;
  const mostExcessive = sorted[sorted.length - 1] || null;

  return {
    items,
    IBN,
    IBNm,
    sorted,
    mostDeficient,
    mostExcessive
  };
}

// ------------------------------------------------------------------
// 3. CALCULATE CND (Diagnose Nutricional Composta)
// ------------------------------------------------------------------
export function calculateCND(sample: LeafSample) {
  const results = sample?.results || ({} as LeafLabResults);
  const targets = getTargetRanges(sample?.crop || 'Soja');

  // Convert macros to g/kg and micros to g/kg
  const nutrientsList = (Object.keys(targets) as (keyof typeof targets)[]).filter(
    (n) => (Number(results[n as keyof LeafLabResults]) || 0) > 0
  );

  const valuesInGKg: Record<string, number> = {};
  let totalNutrientMassGKg = 0;

  nutrientsList.forEach((n) => {
    const raw = Number(results[n as keyof LeafLabResults]) || 0;
    const isMicro = targets[n].type === 'micro';
    const gkg = isMicro ? raw / 1000 : raw; // mg/kg -> g/kg
    valuesInGKg[n] = gkg;
    totalNutrientMassGKg += gkg;
  });

  // Filling value Rd (Residue dry matter in g/kg)
  const Rd = Math.max(10, 1000 - totalNutrientMassGKg);

  // Geometric Mean G
  let logSum = Math.log(Rd);
  nutrientsList.forEach((n) => {
    logSum += Math.log(Math.max(0.0001, valuesInGKg[n]));
  });
  const dimension = nutrientsList.length + 1;
  const G = Math.exp(logSum / dimension);

  // Calculate Vx = ln(X / G)
  const items: CNDItem[] = [];
  let sumSquaredIndices = 0;

  nutrientsList.forEach((n) => {
    const gkg = valuesInGKg[n];
    const Vx = Math.log(Math.max(0.0001, gkg) / G);

    // Optimal reference Vx*
    const t = targets[n];
    const isMicro = t.type === 'micro';
    const optGKg = isMicro ? ((t.min + t.max) / 2) / 1000 : (t.min + t.max) / 2;
    const VxStar = Math.log(optGKg / G);

    // Standard deviation norm ~ 0.20
    const SD = 0.20;
    const ICND = Math.round(((Vx - VxStar) / SD) * 10) / 10;

    sumSquaredIndices += Math.pow(ICND, 2);

    let status: CNDItem['status'] = 'Equilibrado';
    let color = '#10b981';

    if (ICND < -1.0) {
      status = 'Deficiente';
      color = '#ef4444';
    } else if (ICND > 1.0) {
      status = 'Excesso';
      color = '#3b82f6';
    }

    items.push({
      nutrient: n,
      name: NUTRIENT_NAMES[n] || n,
      measuredGKg: Math.round(gkg * 100) / 100,
      logRatio: Math.round(Vx * 100) / 100,
      index: ICND,
      status,
      color
    });
  });

  const r2Imbalance = Math.round(sumSquaredIndices * 10) / 10; // Mahalanobis distance / CND r²

  return {
    items,
    Rd: Math.round(Rd * 10) / 10,
    G: Math.round(G * 100) / 100,
    r2Imbalance
  };
}

// ------------------------------------------------------------------
// 4. ABSORPTION & SUFFICIENCY CURVES DATA
// ------------------------------------------------------------------
export function getAbsorptionCurvesData(sample: LeafSample, selectedNutrient = 'N') {
  const results = sample?.results || ({} as LeafLabResults);
  const targets = getTargetRanges(sample?.crop || 'Soja');
  const t = targets[selectedNutrient as keyof typeof targets] || targets.N;

  const currentVal = Number(results[selectedNutrient as keyof LeafLabResults]) || 0;
  const optVal = (t.min + t.max) / 2;

  // Stages DAE (Dias Após Emergência)
  const stages = [
    { stage: 'Emergência (V2)', dae: 10, factor: 0.10, rate: 0.8 },
    { stage: 'Vegetativo (V4)', dae: 25, factor: 0.25, rate: 1.8 },
    { stage: 'Desenvolvimento (V8)', dae: 40, factor: 0.55, rate: 3.5 },
    { stage: 'Florescimento (R1-R2)', dae: 55, factor: 0.85, rate: 4.8 },
    { stage: 'Enchimento (R5)', dae: 75, factor: 1.00, rate: 2.2 },
    { stage: 'Maturação (R8)', dae: 105, factor: 0.90, rate: 0.4 },
  ];

  const curveData = stages.map((s) => {
    const idealVal = Math.round((optVal * s.factor) * 10) / 10;
    const minVal = Math.round((t.min * s.factor) * 10) / 10;
    const maxVal = Math.round((t.max * s.factor) * 10) / 10;

    return {
      stage: s.stage,
      dae: s.dae,
      idealVal,
      minVal,
      maxVal,
      measuredVal: s.stage.includes('R1') ? currentVal : undefined,
      demandRateKgDay: s.rate
    };
  });

  return {
    nutrient: selectedNutrient,
    name: NUTRIENT_NAMES[selectedNutrient] || selectedNutrient,
    unit: t.unit,
    currentVal,
    minAdequate: t.min,
    maxAdequate: t.max,
    curveData
  };
}
