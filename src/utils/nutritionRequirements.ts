import {
  AnimalSpecies,
  AnimalProfile,
  NutritionalRequirement,
  NutritionalBromatology,
  DietFormulationItem,
  FeedIngredient,
  MetabolicHealthAlert,
  IgenBreakdown,
  DietCostSummary,
} from '../types/animalNutrition';

export function calculateAnimalRequirements(animal: AnimalProfile): NutritionalRequirement {
  const { species, currentWeightKg, productionGoal } = animal;

  switch (species) {
    case 'bovinos_leite': {
      const milkLiters = productionGoal.targetMilkLitersDay || 25;
      const fatPct = productionGoal.milkFatPct || 3.8;
      // NRC 2001 Dry Matter Intake estimation
      // 4% FCM (Fat Corrected Milk) = 0.4 * L + 15 * (L * Fat / 100)
      const fcm = 0.4 * milkLiters + 15 * (milkLiters * (fatPct / 100));
      const baseDmi = (0.0185 * currentWeightKg + 0.305 * fcm) * 1.05; // kg MS/dia

      // Nutrient targets based on production level
      let targetPb = 15.5;
      let targetNdt = 68.0;
      let targetEm = 2.45;
      let minNdf = 28.0;
      let minPeNdf = 20.0;
      let targetCa = 0.65;
      let targetP = 0.38;

      if (milkLiters > 32) {
        targetPb = 17.5;
        targetNdt = 74.0;
        targetEm = 2.70;
        minNdf = 27.0;
        minPeNdf = 19.0;
        targetCa = 0.82;
        targetP = 0.44;
      } else if (milkLiters < 18) {
        targetPb = 14.0;
        targetNdt = 64.0;
        targetEm = 2.25;
        minNdf = 32.0;
        minPeNdf = 23.0;
        targetCa = 0.55;
        targetP = 0.32;
      }

      return {
        dmiKgDay: { min: baseDmi * 0.9, target: baseDmi, max: baseDmi * 1.15 },
        pbPct: { min: targetPb - 0.5, target: targetPb },
        ndtPct: { min: targetNdt - 1.5, target: targetNdt },
        emMcalKg: { min: targetEm - 0.1, target: targetEm },
        ellMcalKg: { min: targetEm * 0.65, target: targetEm * 0.70 },
        ndfPct: { min: minNdf, target: minNdf + 4, max: 44.0 },
        peNdfPct: { min: minPeNdf, target: minPeNdf + 3 },
        starchPct: { max: 32.0 },
        caPct: { min: targetCa - 0.05, target: targetCa, max: 1.2 },
        pPct: { min: targetP - 0.03, target: targetP, max: 0.7 },
        caPRatio: { min: 1.5, max: 2.2 },
        naPct: { min: 0.22, target: 0.28 },
        sPct: { min: 0.18, max: 0.35 },
        dcadMeq: { min: 200, max: 400 }, // Lactação positiva para tamponamento
      };
    }

    case 'bovinos_corte': {
      const adg = productionGoal.targetAdgKgDay || 1.35; // kg/dia
      // BR-CORTE 2016 CMS: ~2.1 - 2.5% do Peso Vivo
      const dmiPctPv = adg > 1.4 ? 2.3 : 2.1;
      const baseDmi = currentWeightKg * (dmiPctPv / 100);

      const targetPb = adg > 1.4 ? 13.5 : 12.0;
      const targetNdt = adg > 1.4 ? 76.0 : 70.0;
      const targetEm = adg > 1.4 ? 2.75 : 2.50;

      return {
        dmiKgDay: { min: baseDmi * 0.9, target: baseDmi, max: baseDmi * 1.15 },
        pbPct: { min: targetPb - 0.5, target: targetPb },
        ndtPct: { min: targetNdt - 2.0, target: targetNdt },
        emMcalKg: { min: targetEm - 0.1, target: targetEm },
        elgMcalKg: { min: 1.20, target: 1.40 },
        ndfPct: { min: 22.0, target: 28.0, max: 45.0 },
        peNdfPct: { min: 14.0, target: 18.0 },
        starchPct: { max: 42.0 },
        caPct: { min: 0.45, target: 0.60, max: 1.0 },
        pPct: { min: 0.25, target: 0.32, max: 0.55 },
        caPRatio: { min: 1.6, max: 2.5 },
        naPct: { min: 0.12, target: 0.18 },
        sPct: { min: 0.15, max: 0.38 },
      };
    }

    case 'bezerros': {
      const baseDmi = currentWeightKg * 0.028; // ~2.8% PV
      return {
        dmiKgDay: { min: baseDmi * 0.85, target: baseDmi, max: baseDmi * 1.15 },
        pbPct: { min: 18.0, target: 20.0 },
        ndtPct: { min: 76.0, target: 80.0 },
        emMcalKg: { min: 2.80, target: 3.00 },
        ndfPct: { min: 18.0, target: 24.0, max: 35.0 },
        peNdfPct: { min: 12.0, target: 16.0 },
        starchPct: { max: 35.0 },
        caPct: { min: 0.70, target: 0.85, max: 1.3 },
        pPct: { min: 0.45, target: 0.55, max: 0.8 },
        caPRatio: { min: 1.5, max: 2.0 },
        naPct: { min: 0.20, target: 0.25 },
        sPct: { min: 0.18, max: 0.30 },
      };
    }

    case 'suinos': {
      const baseDmi = currentWeightKg < 40 ? 1.6 : currentWeightKg < 80 ? 2.6 : 3.2;
      return {
        dmiKgDay: { min: baseDmi * 0.9, target: baseDmi, max: baseDmi * 1.1 },
        pbPct: { min: 16.0, target: 17.5 },
        ndtPct: { min: 80.0, target: 84.0 },
        emMcalKg: { min: 3.20, target: 3.35 },
        ndfPct: { min: 8.0, target: 12.0, max: 18.0 },
        peNdfPct: { min: 4.0, target: 6.0 },
        starchPct: { max: 55.0 },
        caPct: { min: 0.65, target: 0.75, max: 1.0 },
        pPct: { min: 0.50, target: 0.58, max: 0.8 },
        caPRatio: { min: 1.2, max: 1.5 },
        naPct: { min: 0.18, target: 0.22 },
        sPct: { min: 0.12, max: 0.30 },
        lysinePct: { min: 1.05 },
        methioninePct: { min: 0.35 },
      };
    }

    case 'aves_corte': {
      const baseDmi = 0.14; // 140g ração/ave/dia fase final
      return {
        dmiKgDay: { min: 0.11, target: baseDmi, max: 0.18 },
        pbPct: { min: 19.5, target: 21.0 },
        ndtPct: { min: 82.0, target: 86.0 },
        emMcalKg: { min: 3.15, target: 3.25 },
        ndfPct: { min: 6.0, target: 9.0, max: 14.0 },
        peNdfPct: { min: 2.0, target: 4.0 },
        starchPct: { max: 55.0 },
        caPct: { min: 0.85, target: 0.92, max: 1.15 },
        pPct: { min: 0.40, target: 0.45, max: 0.65 },
        caPRatio: { min: 1.8, max: 2.2 },
        naPct: { min: 0.18, target: 0.22 },
        sPct: { min: 0.15, max: 0.28 },
        lysinePct: { min: 1.15 },
        methioninePct: { min: 0.48 },
      };
    }

    case 'aves_postura': {
      const baseDmi = 0.11; // 110g ração/ave/dia
      return {
        dmiKgDay: { min: 0.095, target: baseDmi, max: 0.125 },
        pbPct: { min: 16.0, target: 17.2 },
        ndtPct: { min: 76.0, target: 80.0 },
        emMcalKg: { min: 2.75, target: 2.85 },
        ndfPct: { min: 8.0, target: 12.0, max: 16.0 },
        peNdfPct: { min: 3.0, target: 5.0 },
        starchPct: { max: 50.0 },
        caPct: { min: 3.8, target: 4.1, max: 4.5 }, // Altíssimo para casca do ovo
        pPct: { min: 0.38, target: 0.42, max: 0.60 },
        caPRatio: { min: 8.5, max: 11.0 },
        naPct: { min: 0.18, target: 0.20 },
        sPct: { min: 0.15, max: 0.25 },
        lysinePct: { min: 0.86 },
        methioninePct: { min: 0.42 },
      };
    }

    case 'caprinos':
    case 'ovinos': {
      const baseDmi = currentWeightKg * 0.035; // ~3.5% PV
      return {
        dmiKgDay: { min: baseDmi * 0.9, target: baseDmi, max: baseDmi * 1.15 },
        pbPct: { min: 14.0, target: 16.0 },
        ndtPct: { min: 66.0, target: 72.0 },
        emMcalKg: { min: 2.40, target: 2.60 },
        ndfPct: { min: 30.0, target: 36.0, max: 48.0 },
        peNdfPct: { min: 20.0, target: 25.0 },
        starchPct: { max: 32.0 },
        caPct: { min: 0.55, target: 0.70, max: 1.2 },
        pPct: { min: 0.30, target: 0.38, max: 0.6 },
        caPRatio: { min: 1.8, max: 2.5 }, // Evitar urólitos (cálculos renais) em machos!
        naPct: { min: 0.18, target: 0.24 },
        sPct: { min: 0.16, max: 0.32 },
      };
    }

    case 'bubalinos': {
      const baseDmi = currentWeightKg * 0.024;
      return {
        dmiKgDay: { min: baseDmi * 0.9, target: baseDmi, max: baseDmi * 1.15 },
        pbPct: { min: 13.5, target: 15.0 },
        ndtPct: { min: 64.0, target: 70.0 },
        emMcalKg: { min: 2.30, target: 2.50 },
        ndfPct: { min: 32.0, target: 40.0, max: 55.0 },
        peNdfPct: { min: 24.0, target: 28.0 },
        starchPct: { max: 30.0 },
        caPct: { min: 0.60, target: 0.75, max: 1.2 },
        pPct: { min: 0.32, target: 0.40, max: 0.65 },
        caPRatio: { min: 1.6, max: 2.2 },
        naPct: { min: 0.20, target: 0.25 },
        sPct: { min: 0.15, max: 0.30 },
      };
    }

    case 'equinos': {
      const baseDmi = currentWeightKg * 0.022; // ~2.2% PV
      return {
        dmiKgDay: { min: baseDmi * 0.9, target: baseDmi, max: baseDmi * 1.15 },
        pbPct: { min: 11.5, target: 13.0 },
        ndtPct: { min: 60.0, target: 66.0 },
        emMcalKg: { min: 2.20, target: 2.45 },
        ndfPct: { min: 40.0, target: 48.0, max: 60.0 },
        peNdfPct: { min: 35.0, target: 45.0 },
        starchPct: { max: 20.0 }, // Cavalos sensíveis a cólica e laminite por amido
        caPct: { min: 0.50, target: 0.65, max: 1.1 },
        pPct: { min: 0.30, target: 0.38, max: 0.55 },
        caPRatio: { min: 1.5, max: 2.5 },
        naPct: { min: 0.25, target: 0.35 },
        sPct: { min: 0.15, max: 0.25 },
      };
    }

    case 'peixes': {
      const baseDmi = currentWeightKg * 0.025;
      return {
        dmiKgDay: { min: baseDmi * 0.8, target: baseDmi, max: baseDmi * 1.2 },
        pbPct: { min: 28.0, target: 32.0 },
        ndtPct: { min: 78.0, target: 82.0 },
        emMcalKg: { min: 3.00, target: 3.20 },
        ndfPct: { min: 4.0, target: 8.0, max: 14.0 },
        peNdfPct: { min: 1.0, target: 2.0 },
        starchPct: { max: 40.0 },
        caPct: { min: 1.10, target: 1.30, max: 1.8 },
        pPct: { min: 0.75, target: 0.90, max: 1.2 },
        caPRatio: { min: 1.2, max: 1.6 },
        naPct: { min: 0.15, target: 0.20 },
        sPct: { min: 0.12, max: 0.25 },
        lysinePct: { min: 1.60 },
        methioninePct: { min: 0.65 },
      };
    }

    default: {
      const baseDmi = currentWeightKg * 0.025;
      return {
        dmiKgDay: { min: baseDmi * 0.9, target: baseDmi, max: baseDmi * 1.1 },
        pbPct: { min: 14.0, target: 16.0 },
        ndtPct: { min: 68.0, target: 72.0 },
        emMcalKg: { min: 2.50, target: 2.65 },
        ndfPct: { min: 28.0, target: 32.0, max: 45.0 },
        peNdfPct: { min: 18.0, target: 22.0 },
        starchPct: { max: 35.0 },
        caPct: { min: 0.60, target: 0.70, max: 1.2 },
        pPct: { min: 0.30, target: 0.38, max: 0.6 },
        caPRatio: { min: 1.5, max: 2.2 },
        naPct: { min: 0.18, target: 0.22 },
        sPct: { min: 0.15, max: 0.35 },
      };
    }
  }
}

export function calculateDietBromatology(
  items: DietFormulationItem[],
  ingredientsMap: Map<string, FeedIngredient>
): NutritionalBromatology {
  const bromatology: NutritionalBromatology = {
    dryMatterPct: 0,
    crudeProteinPct: 0,
    metabolizableEnergyMcal: 0,
    netEnergyElm: 0,
    netEnergyElg: 0,
    netEnergyEll: 0,
    ndfPct: 0,
    adfPct: 0,
    tdnPct: 0,
    peNdfPct: 0,
    starchPct: 0,
    sugarsPct: 0,
    etherExtractPct: 0,
    calciumPct: 0,
    phosphorusPct: 0,
    potassiumPct: 0,
    magnesiumPct: 0,
    sodiumPct: 0,
    sulfurPct: 0,
    chlorinePct: 0,
    zincPpm: 0,
    copperPpm: 0,
    manganesePpm: 0,
    seleniumPpm: 0,
    cobaltPpm: 0,
    iodinePpm: 0,
    lysinePct: 0,
    methioninePct: 0,
    threoninePct: 0,
    tryptophanPct: 0,
    dmdPct: 0,
    minInclusionPct: 0,
    maxInclusionPct: 100,
  };

  const totalPctMs = items.reduce((sum, it) => sum + (it.inclusionPctMs || 0), 0);
  if (totalPctMs === 0) return bromatology;

  let weightedDmSum = 0;
  let totalMnKg = 0;
  let totalMsKg = 0;

  items.forEach((it) => {
    const ing = ingredientsMap.get(it.ingredientId);
    if (!ing) return;
    const fraction = it.inclusionPctMs / 100;
    const b = ing.bromatology;

    bromatology.crudeProteinPct += fraction * b.crudeProteinPct;
    bromatology.metabolizableEnergyMcal += fraction * b.metabolizableEnergyMcal;
    bromatology.netEnergyElm += fraction * b.netEnergyElm;
    bromatology.netEnergyElg += fraction * b.netEnergyElg;
    bromatology.netEnergyEll += fraction * b.netEnergyEll;
    bromatology.ndfPct += fraction * b.ndfPct;
    bromatology.adfPct += fraction * b.adfPct;
    bromatology.tdnPct += fraction * b.tdnPct;
    bromatology.peNdfPct += fraction * b.peNdfPct;
    bromatology.starchPct += fraction * b.starchPct;
    bromatology.sugarsPct += fraction * b.sugarsPct;
    bromatology.etherExtractPct += fraction * b.etherExtractPct;
    bromatology.calciumPct += fraction * b.calciumPct;
    bromatology.phosphorusPct += fraction * b.phosphorusPct;
    bromatology.potassiumPct += fraction * b.potassiumPct;
    bromatology.magnesiumPct += fraction * b.magnesiumPct;
    bromatology.sodiumPct += fraction * b.sodiumPct;
    bromatology.sulfurPct += fraction * b.sulfurPct;
    bromatology.chlorinePct += fraction * b.chlorinePct;
    bromatology.zincPpm += fraction * b.zincPpm;
    bromatology.copperPpm += fraction * b.copperPpm;
    bromatology.manganesePpm += fraction * b.manganesePpm;
    bromatology.seleniumPpm += fraction * b.seleniumPpm;
    bromatology.cobaltPpm += fraction * b.cobaltPpm;
    bromatology.iodinePpm += fraction * b.iodinePpm;
    if (b.lysinePct) bromatology.lysinePct = (bromatology.lysinePct || 0) + fraction * b.lysinePct;
    if (b.methioninePct) bromatology.methioninePct = (bromatology.methioninePct || 0) + fraction * b.methioninePct;
    if (b.threoninePct) bromatology.threoninePct = (bromatology.threoninePct || 0) + fraction * b.threoninePct;
    if (b.tryptophanPct) bromatology.tryptophanPct = (bromatology.tryptophanPct || 0) + fraction * b.tryptophanPct;
    bromatology.dmdPct += fraction * b.dmdPct;

    totalMsKg += it.inclusionKgMsPerAnimal || 0;
    totalMnKg += it.inclusionKgMnPerAnimal || 0;
  });

  // Calculate weighted average Dry Matter % of the total diet (as-fed)
  bromatology.dryMatterPct = totalMnKg > 0 ? (totalMsKg / totalMnKg) * 100 : 50.0;

  return bromatology;
}

export function evaluateMetabolicHealth(
  species: AnimalSpecies,
  b: NutritionalBromatology,
  foragePct: number,
  category?: string
): MetabolicHealthAlert {
  const alerts: string[] = [];

  // 1. DCAD Calculation (mEq/kg MS)
  // DCAD = (Na% * 435 + K% * 256) - (Cl% * 282 + S% * 624)
  const dcadValueMeqKg = Math.round(
    b.sodiumPct * 435 + b.potassiumPct * 256 - (b.chlorinePct * 282 + b.sulfurPct * 624)
  );

  let milkFeverDcadRisk: 'adequado' | 'alerta_alcalogenico' | 'alerta_acidificante' = 'adequado';
  if (category?.toLowerCase().includes('pré-parto') || category?.toLowerCase().includes('pre-parto')) {
    if (dcadValueMeqKg > 0) {
      milkFeverDcadRisk = 'alerta_alcalogenico';
      alerts.push(
        `Alerta Pré-Parto: DCAD positivo (+${dcadValueMeqKg} mEq/kg) aumenta o risco de Hipocalcemia / Febre do Leite. Recomenda-se dieta aniônica (DCAD entre -50 e -150 mEq/kg).`
      );
    }
  }

  // 2. SARA Risk (Subacute Ruminal Acidosis) for Ruminants
  let saraRisk: 'baixo' | 'moderado' | 'alto' = 'baixo';
  let saraReason = 'Equilíbrio ruminal seguro com fibra efetiva adequada.';

  const isRuminant = ['bovinos_leite', 'bovinos_corte', 'bubalinos', 'caprinos', 'ovinos'].includes(species);
  if (isRuminant) {
    if (b.peNdfPct < 15.0 || (b.starchPct > 38.0 && foragePct < 30.0)) {
      saraRisk = 'alto';
      saraReason = `Risco Alto de Acidose Ruminal (SARA): FDN fisicamente efetivo muito baixo (${b.peNdfPct.toFixed(1)}%) ou excesso de amido fermentável (${b.starchPct.toFixed(1)}%).`;
      alerts.push(saraReason);
    } else if (b.peNdfPct < 19.0 || b.starchPct > 34.0) {
      saraRisk = 'moderado';
      saraReason = `Atenção Ruminal: FDNef limítrofe (${b.peNdfPct.toFixed(1)}%). Recomenda-se monitorar pH ruminal e incluir bicarbonato de sódio ou leveduras.`;
      alerts.push(saraReason);
    }
  }

  // 3. Sulfur toxicity risk
  let sulfurToxicityRisk: 'seguro' | 'alerta' | 'toxico' = 'seguro';
  if (b.sulfurPct > 0.40) {
    sulfurToxicityRisk = 'toxico';
    alerts.push(`Excesso de Enxofre (${b.sulfurPct.toFixed(2)}% MS): Risco de Polioencefalomalácia (PEM) e interferência severa na absorção de cobre e selênio.`);
  } else if (b.sulfurPct > 0.35) {
    sulfurToxicityRisk = 'alerta';
    alerts.push(`Nível de Enxofre elevado (${b.sulfurPct.toFixed(2)}% MS). Monitore a ingestão total com a água.`);
  }

  // 4. Ketosis risk
  let ketosisRisk: 'baixo' | 'moderado' | 'alto' = 'baixo';
  let ketosisReason = 'Densidade energética equilibrada.';
  if (species === 'bovinos_leite' && b.crudeProteinPct > 18.5 && b.metabolizableEnergyMcal < 2.4) {
    ketosisRisk = 'alto';
    ketosisReason = 'Desbalanço Proteína/Energia: Excesso de nitrogênio no rúmen com déficit energético induz perda de escore e cetose.';
    alerts.push(ketosisReason);
  }

  // 5. Mycotoxins
  let mycotoxinRisk: 'baixo' | 'moderado' | 'alto' = 'baixo';
  if (b.starchPct > 28 && foragePct > 40) {
    mycotoxinRisk = 'moderado';
  }

  return {
    saraRisk,
    saraReason,
    ketosisRisk,
    ketosisReason,
    milkFeverDcadRisk,
    dcadValueMeqKg,
    sulfurToxicityRisk,
    mycotoxinRisk,
    mycotoxinAdvice: mycotoxinRisk !== 'baixo' ? 'Recomenda-se inclusão de adsorvente de micotoxinas de amplo espectro (aluminossilicato + beta-glucanos).' : undefined,
    alerts,
  };
}

export function calculateIgenScore(
  b: NutritionalBromatology,
  req: NutritionalRequirement,
  costs: DietCostSummary,
  health: MetabolicHealthAlert,
  species: AnimalSpecies,
  profile?: AnimalProfile,
  totalDmiKgInput?: number
): IgenBreakdown {
  // 1. Aderência Nutricional (0 - 100)
  const pbScore = Math.max(0, 100 - Math.abs(b.crudeProteinPct - req.pbPct.target) * 15);
  const ndtScore = Math.max(0, 100 - Math.abs(b.tdnPct - req.ndtPct.target) * 10);
  const caScore = Math.max(0, 100 - Math.abs(b.calciumPct - req.caPct.target) * 40);
  const pScore = Math.max(0, 100 - Math.abs(b.phosphorusPct - req.pPct.target) * 60);
  const nutritionalAdherence = Math.min(100, Math.max(20, Math.round(pbScore * 0.35 + ndtScore * 0.35 + caScore * 0.15 + pScore * 0.15)));

  // 2. Saúde Digestiva / Ruminal (0 - 100)
  let healthPenalty = 0;
  if (health.saraRisk === 'alto') healthPenalty += 35;
  if (health.saraRisk === 'moderado') healthPenalty += 15;
  if (health.sulfurToxicityRisk === 'toxico') healthPenalty += 30;
  if (health.ketosisRisk === 'alto') healthPenalty += 25;
  const digestiveHealth = Math.max(10, 100 - healthPenalty);

  // 3. Determinação do Ganho de Peso Esperado / Produção (kg/dia ou L/dia)
  let baseGainTarget = 1.35; // Padrão bovinos de corte
  if (species === 'bovinos_leite') {
    baseGainTarget = profile?.productionGoal?.targetMilkLitersDay || 25;
  } else if (species === 'bezerros' || species === 'suinos') {
    baseGainTarget = profile?.productionGoal?.targetAdgKgDay || 0.85;
  } else if (species === 'aves_corte' || species === 'aves_postura') {
    baseGainTarget = profile?.productionGoal?.targetAdgKgDay || 0.055;
  } else if (species === 'ovinos' || species === 'caprinos') {
    baseGainTarget = profile?.productionGoal?.targetAdgKgDay || 0.28;
  } else if (species === 'equinos') {
    baseGainTarget = profile?.productionGoal?.targetAdgKgDay || 0.40;
  } else {
    baseGainTarget = profile?.productionGoal?.targetAdgKgDay || 1.35;
  }

  // Fator de atendimento energético e proteico sobre o ganho esperado
  const energyRatio = req.ndtPct.target > 0 ? b.tdnPct / req.ndtPct.target : 1;
  const proteinRatio = req.pbPct.target > 0 ? b.crudeProteinPct / req.pbPct.target : 1;
  const performanceFactor = Math.min(1.25, Math.max(0.5, energyRatio * 0.6 + proteinRatio * 0.4));
  const expectedGain = Math.round(baseGainTarget * performanceFactor * 100) / 100;

  // 4. Consumo Total de Matéria Seca (CMS em kg MS/dia)
  const totalDmiKg = totalDmiKgInput && totalDmiKgInput > 0
    ? totalDmiKgInput
    : (req.dmiKgDay.target || 10);

  // 5. Conversão Alimentar (FCR: kg MS / kg ganho de peso, ou kg MS / L de leite)
  const rawFeedConversion = totalDmiKg / Math.max(0.01, expectedGain);
  const feedConversion = Math.round(rawFeedConversion * 100) / 100;

  // Sub-índice de Conversão Alimentar (0 - 100) comparado com alvos zootécnicos
  let targetFCR = 6.2; // Bovinos corte
  let sensitivityFactor = 12;

  if (species === 'bovinos_leite') {
    targetFCR = 0.72; // kg MS / Litro de leite (EA = 1.39 L/kg MS)
    sensitivityFactor = 75;
  } else if (species === 'bezerros') {
    targetFCR = 3.8;
    sensitivityFactor = 15;
  } else if (species === 'suinos') {
    targetFCR = 2.4;
    sensitivityFactor = 25;
  } else if (species === 'aves_corte' || species === 'aves_postura') {
    targetFCR = 1.6;
    sensitivityFactor = 40;
  } else if (species === 'ovinos' || species === 'caprinos') {
    targetFCR = 5.2;
    sensitivityFactor = 15;
  }

  const fcrDiff = feedConversion - targetFCR;
  const feedConversionEfficiency = Math.min(100, Math.max(20, Math.round(100 - fcrDiff * sensitivityFactor)));

  // 6. Custo da Dieta e Custo por kg de Ganho
  const dietCostDaily = Math.round((costs.costPerAnimalDay || 0) * 100) / 100;
  const costPerKgGain = Math.round((dietCostDaily / Math.max(0.01, expectedGain)) * 100) / 100;

  // Sub-índice de Eficiência Econômica (0 - 100)
  let targetCostPerKgGain = 8.50; // R$/kg ganho de peso
  if (species === 'bovinos_leite') {
    targetCostPerKgGain = 0.55; // R$/L de leite
  }

  const costDiff = costPerKgGain - targetCostPerKgGain;
  const economicEfficiency = Math.min(100, Math.max(20, Math.round(100 - costDiff * (species === 'bovinos_leite' ? 80 : 8))));

  // 7. Potencial Produtivo (0 - 100)
  const productivePotential = Math.min(100, Math.max(20, Math.round(nutritionalAdherence * 0.5 + feedConversionEfficiency * 0.3 + digestiveHealth * 0.2)));

  // 8. PONTUAÇÃO CONSOLIDADA DO IGEN (0 - 100)
  // Consolida: Aderência Nutricional (25%), Conversão Alimentar (30%), Custo/Eficiência Econômica (25%) e Saúde Digestiva (20%)
  const score = Math.min(100, Math.max(10, Math.round(
    nutritionalAdherence * 0.25 +
    feedConversionEfficiency * 0.30 +
    economicEfficiency * 0.25 +
    digestiveHealth * 0.20
  )));

  // 9. Classificação, Resumo e Recomendações
  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'B';
  let summary = '';
  const recommendations: string[] = [];

  const unitLabel = species === 'bovinos_leite' ? 'L' : 'kg';
  const unitName = species === 'bovinos_leite' ? 'litro' : 'kg de ganho';

  if (score >= 92) {
    grade = 'A+';
    summary = `IGEN Excelente (${score}/100): Alta conversão alimentar (${feedConversion} kg MS/${unitLabel}), excelente ganho esperado (${expectedGain} ${unitLabel}/dia) e ótimo custo de produção (R$ ${costPerKgGain.toFixed(2)}/${unitLabel}).`;
  } else if (score >= 82) {
    grade = 'A';
    summary = `IGEN Elevado (${score}/100): Ótimo equilíbrio entre custo alimentar (R$ ${dietCostDaily.toFixed(2)}/dia), conversão (${feedConversion}) e desempenho esperado (${expectedGain} ${unitLabel}/dia).`;
  } else if (score >= 70) {
    grade = 'B';
    summary = `IGEN Satisfatório (${score}/100): Dieta viável com conversão alimentar de ${feedConversion} e custo de R$ ${costPerKgGain.toFixed(2)} por ${unitName}. Espaço para otimização de insumos.`;
  } else if (score >= 55) {
    grade = 'C';
    summary = `IGEN Regular (${score}/100): Conversão alimentar ou custo da dieta acima do ideal. Recomenda-se reajustar a densidade energética para potencializar o ganho.`;
  } else {
    grade = 'D';
    summary = `IGEN Crítico (${score}/100): Ineficiência nutricional ou econômica acentuada. Custo elevado em relação ao ganho de peso esperado.`;
  }

  if (feedConversionEfficiency < 75) {
    recommendations.push(`Aumentar a densidade energética da dieta (NDT/EM) para otimizar a conversão alimentar de ${feedConversion} para mais próxima de ${targetFCR}.`);
  }
  if (economicEfficiency < 75) {
    recommendations.push(`Substituir concentrados de alto valor por coprodutos regionais para reduzir o custo por ${unitName} (R$ ${costPerKgGain.toFixed(2)}).`);
  }
  if (healthPenalty > 15) {
    recommendations.push('Ajustar teor de FDNef e tampões para reduzir o risco de desordens ruminais e manter a eficiência digestiva.');
  }

  return {
    score,
    nutritionalAdherence,
    economicEfficiency,
    digestiveHealth,
    productivePotential,
    feedConversionEfficiency,
    dietCostDaily,
    feedConversion,
    expectedGain,
    costPerKgGain,
    grade,
    summary,
    recommendations,
  };
}

export const calculateIGEN = calculateIgenScore;

export function calculateDietCosts(
  items: DietFormulationItem[],
  ingredientsMap: Map<string, FeedIngredient>,
  totalDmiKgPerAnimal: number,
  targetBatchKg: number,
  species: AnimalSpecies,
  productionGoal?: AnimalProfile['productionGoal']
): DietCostSummary {
  let totalCostDailyPerAnimal = 0;
  let totalMnDailyPerAnimal = 0;

  items.forEach((it) => {
    const ing = ingredientsMap.get(it.ingredientId);
    if (!ing) return;
    const freightPerKg = (ing.freightPerTon || 0) / 1000;
    const opFactor = 1 + (ing.operationalCostPct || 0) / 100;
    const finalPricePerKgMn = (ing.pricePerKg + freightPerKg) * opFactor;

    const itemCostDaily = (it.inclusionKgMnPerAnimal || 0) * finalPricePerKgMn;
    it.costPerAnimalDay = itemCostDaily;
    totalCostDailyPerAnimal += itemCostDaily;
    totalMnDailyPerAnimal += it.inclusionKgMnPerAnimal || 0;
  });

  const costPerKgMs = totalDmiKgPerAnimal > 0 ? totalCostDailyPerAnimal / totalDmiKgPerAnimal : 0;
  const costPerKgMn = totalMnDailyPerAnimal > 0 ? totalCostDailyPerAnimal / totalMnDailyPerAnimal : 0;
  const costPerAnimalMonth = totalCostDailyPerAnimal * 30.5;
  const costPerBatch = costPerKgMn * targetBatchKg;

  let costPerLiterMilk: number | undefined;
  let costPerKgGain: number | undefined;
  let costPerDozenEggs: number | undefined;
  let incomeOverFeedCostDaily: number | undefined;

  if (species === 'bovinos_leite') {
    const liters = productionGoal?.targetMilkLitersDay || 25;
    costPerLiterMilk = liters > 0 ? totalCostDailyPerAnimal / liters : 0;
    const milkPricePerLiter = 2.45; // R$/L preço médio de referência
    incomeOverFeedCostDaily = liters * milkPricePerLiter - totalCostDailyPerAnimal;
  } else if (species === 'bovinos_corte') {
    const adg = productionGoal?.targetAdgKgDay || 1.35;
    costPerKgGain = adg > 0 ? totalCostDailyPerAnimal / adg : 0;
    const beefPricePerKg = 19.50; // R$/kg vivo (~R$ 290/@ com rendimento 54%)
    incomeOverFeedCostDaily = adg * beefPricePerKg - totalCostDailyPerAnimal;
  } else if (species === 'aves_postura') {
    const eggsPerDay = (productionGoal?.eggsPerDayPct || 90) / 100;
    const dozenPerDay = eggsPerDay / 12;
    costPerDozenEggs = dozenPerDay > 0 ? totalCostDailyPerAnimal / dozenPerDay : 0;
  }

  return {
    costPerKgMs: Math.round(costPerKgMs * 100) / 100,
    costPerKgMn: Math.round(costPerKgMn * 100) / 100,
    costPerAnimalDay: Math.round(totalCostDailyPerAnimal * 100) / 100,
    costPerAnimalMonth: Math.round(costPerAnimalMonth * 100) / 100,
    costPerBatch: Math.round(costPerBatch * 100) / 100,
    costPerLiterMilk: costPerLiterMilk !== undefined ? Math.round(costPerLiterMilk * 100) / 100 : undefined,
    costPerKgGain: costPerKgGain !== undefined ? Math.round(costPerKgGain * 100) / 100 : undefined,
    costPerDozenEggs: costPerDozenEggs !== undefined ? Math.round(costPerDozenEggs * 100) / 100 : undefined,
    incomeOverFeedCostDaily: incomeOverFeedCostDaily !== undefined ? Math.round(incomeOverFeedCostDaily * 100) / 100 : undefined,
  };
}
