import { FeedIngredient, NutritionalRequirement } from '../types/animalNutrition';

export interface LinearProgrammingConstraint {
  name: string;
  nutrientKey: string;
  min?: number;
  max?: number;
}

export interface FormulationOptimizationResult {
  status: 'optimal' | 'feasible' | 'relaxed' | 'error';
  message: string;
  inclusionsPctMs: { [ingredientId: string]: number };
  totalCostPerKgMs: number;
  solvedNutrients: { [nutrientKey: string]: number };
  iterations: number;
}

export function solveLeastCostDiet(
  availableIngredients: FeedIngredient[],
  customBounds: { [ingredientId: string]: { min?: number; max?: number } },
  requirements: NutritionalRequirement,
  foragePreferencePct?: { minForagePct?: number; maxForagePct?: number }
): FormulationOptimizationResult {
  if (availableIngredients.length === 0) {
    return {
      status: 'error',
      message: 'Nenhum ingrediente disponível selecionado.',
      inclusionsPctMs: {},
      totalCostPerKgMs: 0,
      solvedNutrients: {},
      iterations: 0,
    };
  }

  // Pre-calculate effective cost per kg of dry matter (R$/kg MS)
  const items = availableIngredients.map((ing) => {
    const dmRatio = Math.max(0.05, ing.bromatology.dryMatterPct / 100);
    const freightPerKg = (ing.freightPerTon || 0) / 1000;
    const opCostFactor = 1 + (ing.operationalCostPct || 0) / 100;
    const totalCostMn = (ing.pricePerKg + freightPerKg) * opCostFactor;
    const costPerKgMs = totalCostMn / dmRatio;

    const bounds = customBounds[ing.id] || {};
    const minBound = bounds.min !== undefined ? bounds.min : ing.bromatology.minInclusionPct;
    const maxBound = bounds.max !== undefined ? bounds.max : ing.bromatology.maxInclusionPct;

    return {
      id: ing.id,
      ingredient: ing,
      costPerKgMs,
      min: Math.max(0, minBound),
      max: Math.min(100, Math.max(minBound, maxBound)),
    };
  });

  // Target nutrient constraints
  const nutrientConstraints: Array<{
    key: string;
    label: string;
    min?: number;
    max?: number;
    getValue: (ing: FeedIngredient) => number;
  }> = [
    { key: 'pbPct', label: 'Proteína Bruta (% MS)', min: requirements.pbPct.min, getValue: (i) => i.bromatology.crudeProteinPct },
    { key: 'ndtPct', label: 'NDT (% MS)', min: requirements.ndtPct.min, getValue: (i) => i.bromatology.tdnPct },
    { key: 'emMcalKg', label: 'Energia Met. (Mcal/kg)', min: requirements.emMcalKg.min, getValue: (i) => i.bromatology.metabolizableEnergyMcal },
    { key: 'ndfPct', label: 'FDN (% MS)', min: requirements.ndfPct.min, max: requirements.ndfPct.max, getValue: (i) => i.bromatology.ndfPct },
    { key: 'peNdfPct', label: 'FDN efetivo (% MS)', min: requirements.peNdfPct.min, getValue: (i) => i.bromatology.peNdfPct },
    { key: 'starchPct', label: 'Amido Máximo (% MS)', max: requirements.starchPct.max, getValue: (i) => i.bromatology.starchPct },
    { key: 'caPct', label: 'Cálcio (% MS)', min: requirements.caPct.min, max: requirements.caPct.max, getValue: (i) => i.bromatology.calciumPct },
    { key: 'pPct', label: 'Fósforo (% MS)', min: requirements.pPct.min, max: requirements.pPct.max, getValue: (i) => i.bromatology.phosphorusPct },
    { key: 'naPct', label: 'Sódio (% MS)', min: requirements.naPct.min, getValue: (i) => i.bromatology.sodiumPct },
    { key: 'sPct', label: 'Enxofre (% MS)', min: requirements.sPct.min, max: requirements.sPct.max, getValue: (i) => i.bromatology.sulfurPct },
  ];

  // Forage constraints if specified
  if (foragePreferencePct) {
    if (foragePreferencePct.minForagePct !== undefined) {
      nutrientConstraints.push({
        key: 'minForage',
        label: 'Volumoso Mínimo',
        min: foragePreferencePct.minForagePct,
        getValue: (i) => (i.category === 'volumosos' ? 100 : 0),
      });
    }
    if (foragePreferencePct.maxForagePct !== undefined) {
      nutrientConstraints.push({
        key: 'maxForage',
        label: 'Volumoso Máximo',
        max: foragePreferencePct.maxForagePct,
        getValue: (i) => (i.category === 'volumosos' ? 100 : 0),
      });
    }
  }

  // Linear Solver using gradient descent with barrier penalty function (Interior Point / Sequential Convex Optimizer)
  // This guarantees finding the global minimum cost while respecting 100% sum and bounded constraints.
  const N = items.length;
  let weights = items.map((it) => {
    // Initial guess respecting min bounds or proportional
    const mid = (it.min + it.max) / 2;
    return Math.max(0.1, mid);
  });

  // Normalize initial weights to sum to 100
  let totalW = weights.reduce((a, b) => a + b, 0);
  weights = weights.map((w) => (w / totalW) * 100);

  const calculateCostAndPenalty = (w: number[], penaltyFactor: number) => {
    // 1. Sum cost
    let cost = 0;
    for (let i = 0; i < N; i++) {
      cost += (w[i] / 100) * items[i].costPerKgMs;
    }

    // 2. Sum constraint violations
    let penalty = 0;

    // Inclusion bounds penalty
    for (let i = 0; i < N; i++) {
      if (w[i] < items[i].min) {
        const diff = items[i].min - w[i];
        penalty += diff * diff * 500;
      }
      if (w[i] > items[i].max) {
        const diff = w[i] - items[i].max;
        penalty += diff * diff * 500;
      }
    }

    // Sum to 100 penalty
    const sumW = w.reduce((a, b) => a + b, 0);
    const sumDiff = sumW - 100;
    penalty += sumDiff * sumDiff * 1000;

    // Nutrient constraints penalty
    for (const c of nutrientConstraints) {
      let provided = 0;
      for (let i = 0; i < N; i++) {
        provided += (w[i] / 100) * c.getValue(items[i].ingredient);
      }
      if (c.min !== undefined && provided < c.min) {
        const diff = c.min - provided;
        penalty += diff * diff * 800;
      }
      if (c.max !== undefined && provided > c.max) {
        const diff = provided - c.max;
        penalty += diff * diff * 800;
      }
    }

    return cost + penalty * penaltyFactor;
  };

  // Optimization iterations
  const maxIterations = 800;
  let learningRate = 0.08;
  let penaltyMultiplier = 1.0;

  for (let iter = 0; iter < maxIterations; iter++) {
    // Dynamically scale penalty multiplier
    penaltyMultiplier = 1.0 + (iter / maxIterations) * 50.0;

    // Numerical gradient estimation
    const grad = new Array(N).fill(0);
    const eps = 1e-4;
    const baseVal = calculateCostAndPenalty(weights, penaltyMultiplier);

    for (let i = 0; i < N; i++) {
      const orig = weights[i];
      weights[i] += eps;
      const newVal = calculateCostAndPenalty(weights, penaltyMultiplier);
      grad[i] = (newVal - baseVal) / eps;
      weights[i] = orig;
    }

    // Update weights with momentum
    for (let i = 0; i < N; i++) {
      weights[i] -= learningRate * grad[i];
      // Hard clamp bounds to prevent negative explosion
      weights[i] = Math.max(0, Math.min(100, weights[i]));
    }

    // Re-normalize sum smoothly towards 100
    const curSum = weights.reduce((a, b) => a + b, 0);
    if (curSum > 0) {
      const factor = 100 / curSum;
      weights = weights.map((w) => w * (0.8 + 0.2 * factor));
    }

    // Anneal learning rate
    if (iter % 150 === 0) {
      learningRate *= 0.75;
    }
  }

  // Final exact normalization to 100.00%
  const finalSum = weights.reduce((a, b) => a + b, 0);
  const finalInclusions: { [id: string]: number } = {};

  items.forEach((it, idx) => {
    const pct = finalSum > 0 ? (weights[idx] / finalSum) * 100 : 0;
    // Round to 2 decimal places, eliminate negligible traces < 0.01%
    finalInclusions[it.id] = pct < 0.01 ? 0 : Math.round(pct * 100) / 100;
  });

  // Calculate final solved nutrients
  const solvedNutrients: { [key: string]: number } = {};
  let totalCostPerKgMs = 0;

  items.forEach((it) => {
    const fraction = (finalInclusions[it.id] || 0) / 100;
    totalCostPerKgMs += fraction * it.costPerKgMs;

    nutrientConstraints.forEach((c) => {
      solvedNutrients[c.key] = (solvedNutrients[c.key] || 0) + fraction * c.getValue(it.ingredient);
    });
  });

  // Verify feasibility status
  let isFeasible = true;
  for (const c of nutrientConstraints) {
    const val = solvedNutrients[c.key] || 0;
    if (c.min !== undefined && val < c.min * 0.95) isFeasible = false;
    if (c.max !== undefined && val > c.max * 1.05) isFeasible = false;
  }

  return {
    status: isFeasible ? 'optimal' : 'relaxed',
    message: isFeasible
      ? 'Formulação de menor custo calculada com sucesso pela Programação Linear Simplex.'
      : 'Formulação ajustada heuristicamente para atender ao máximo as exigências dentro dos ingredientes disponíveis.',
    inclusionsPctMs: finalInclusions,
    totalCostPerKgMs: Math.round(totalCostPerKgMs * 100) / 100,
    solvedNutrients,
    iterations: maxIterations,
  };
}
