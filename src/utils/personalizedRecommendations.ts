import { SoilSample, FieldPlot, UnitTriadValue } from '../types/agronomy';
import { SoilAnalysisExtended } from '../types/recommendationsPro';
import { calculateUnitTriad, calculateSoilIndices } from './agronomicCalculations';

export type ManagementSystem =
  | 'plantio_direto_consolidado' // > 5 anos, alta palhada, sem revolvimento
  | 'plantio_direto_recente'     // 1 a 4 anos
  | 'convencional'              // aração e gradagem
  | 'cultivo_minimo'            // escarificação / preparo reduzido
  | 'organico'                  // bioinsumos e fontes naturais
  | 'regenerativo'              // foco em biologia, palhada e ciclagem
  | 'integracao_lavoura_pecuaria'; // ILP com pastejo

export type BudgetStrategy =
  | 'teto_produtivo_alta_tecnologia' // busca máxima produtividade econômica
  | 'equilibrado_custo_beneficio'    // equilíbrio risco-retorno
  | 'baixo_investimento_seguranca';  // foco em redução de desembolso

export type FertilizerFormPreference =
  | 'mistura_de_granulos'       // NPK granulado convencional
  | 'complexo_granulado'        // todos os nutrientes no mesmo grânulo
  | 'organomineral'             // base orgânica enriquecida com minerais
  | 'liberacao_lenta_polimerizado' // revestimento com polímeros
  | 'liquido_sulco'             // suspensão ou solução líquida no sulco
  | 'hidrossoluvel_fertirrigacao' // sais 100% solúveis
  | 'fontes_naturais_reformatadas'; // pós de rocha, termofosfatos, etc.

export interface ProducerPreferences {
  managementSystem: ManagementSystem;
  budgetStrategy: BudgetStrategy;
  fertilizerFormPreference: FertilizerFormPreference;
  phosphorusSourcePreference: 'soluvel_acidulado' | 'organomineral' | 'termofosfato_magnesiano' | 'fosfato_reativo' | 'misto';
  potassiumSourcePreference: 'kcl_padrao' | 'kcl_protegido_polimero' | 'sulfato_potassio' | 'nitrato_potassio' | 'silicato_potassio';
  nitrogenSourcePreference: 'ureia_protegida_nbpt' | 'sulfato_amonio' | 'nitrato_amonio_calcio' | 'organomineral' | 'fbn_biologico';
  topDressingSplits: number; // 1, 2, 3 ou 4 parcelas
  maxPlanterBoxKgHa: number; // Capacidade da semeadora no sulco (ex: 400 kg/ha)
  maxSalinityInFurrowKgHa: number; // Limite de N + K2O no sulco para evitar queima (ex: 60-80 kg/ha)
  riskTolerance: 'conservador' | 'moderado' | 'arrojado';
  sustainabilityPriority: 'alta' | 'media' | 'padrao';
  preferCustomBlends: boolean; // Preferência por misturas sob medida (Big Bag formulado)
}

export interface FarmPlotHistory {
  previousCrop: 'soja' | 'milho' | 'braquiaria' | 'crotalaria' | 'trigo' | 'algodao' | 'feijao' | 'pousio' | 'cana' | 'hortalicas';
  previousCropYield?: number;
  yearsInDirectPlanting: number;
  strawDensity: 'baixa_pouca_palha' | 'media_3_a_5_ton' | 'alta_mais_6_ton';
  lastLimingMonthsAgo: number; // Meses desde a última calagem
  lastLimingDoseTonsHa: number;
  lastLimingPRNT: number;
  lastGypsumMonthsAgo: number; // Meses desde a última gessagem
  lastGypsumDoseKgHa: number;
  organicFertilization: {
    applied: boolean;
    type?: 'cama_frango' | 'esterco_bovino' | 'torta_filtro' | 'composto' | 'chorume';
    doseTonsHa?: number;
    monthsAgo?: number;
  };
  soilCompactionLevel: 'nenhuma' | 'leve_superficial' | 'moderada_15_25cm' | 'severa_subsuperficial';
  nematodePressure: 'ausente' | 'baixa' | 'moderada' | 'alta';
  diseaseHistoryNotes?: string;
}

export interface PersonalizedCropTarget {
  cropId: string;
  cropName: string;
  scientificName?: string;
  targetYield: number;
  yieldUnit: string;
  targetVPercent: number;
  targetCaMgRatioMin: number;
  targetCaMgRatioMax: number;
  extractionRatesKgPerUnit: {
    n: number;
    p2o5: number;
    k2o: number;
    ca: number;
    mg: number;
    s: number;
    b: number;  // g/unidade
    zn: number; // g/unidade
    cu: number; // g/unidade
    mn: number; // g/unidade
    mo: number; // g/unidade
    fe: number; // g/unidade
  };
  isFruitOrPerennial?: boolean;
}

export interface SpacingParameters {
  rowSpacingM: number;
  plantSpacingM: number;
  plantsPerMeter?: number;
  linearMetersPerHa: number;
  plantPopulationHa: number;
}

export interface RawMaterialItem {
  id: string;
  name: string;
  kgPerTon: number;
  percentage: number;
  contributedNutrients: string;
}

export interface PersonalizedLimingResult {
  needed: boolean;
  doseTonsHa: number;
  dose: UnitTriadValue;
  currentV: number;
  targetV: number;
  recommendedCorrective: string;
  prntConsidered: number;
  incorporationMethod: string;
  justification: string;
  integratedFactors: { factor: string; influence: string; impact: string }[];
}

export interface PersonalizedGypsumResult {
  needed: boolean;
  doseKgHa: number;
  dose: UnitTriadValue;
  clayPercent: number;
  multiplierFactor: number;
  triggerCriteria: string[];
  justification: string;
  integratedFactors: { factor: string; influence: string; impact: string }[];
}

export interface PersonalizedFertilizationResult {
  grossNutrientDemandKgHa: {
    n: number;
    p2o5: number;
    k2o: number;
    s: number;
    ca: number;
    mg: number;
    b: number;  // g/ha
    zn: number; // g/ha
    cu: number; // g/ha
    mn: number; // g/ha
    mo: number; // g/ha
  };
  netNutrientDemandKgHa: {
    n: number;
    p2o5: number;
    k2o: number;
    s: number;
    ca: number;
    mg: number;
    b: number;  // g/ha
    zn: number; // g/ha
    cu: number; // g/ha
    mn: number; // g/ha
    mo: number; // g/ha
  };
  creditsAndDiscounts: {
    previousCropNCreditKgHa: number;
    organicFertilizationCredits: { n: number; p2o5: number; k2o: number; s: number };
    strawNImmobilizationPenaltyKgHa: number;
    soilBaseSupplyingPower: { p2o5: number; k2o: number; s: number };
    bioASAdjustmentFactor: number;
    historySummary: string[];
  };
  suggestedCommercialBlend: {
    name: string;
    formula: string;
    npkGrade: [number, number, number];
    dose: UnitTriadValue;
    nutrientsSuppliedKgHa: { n: number; p2o5: number; k2o: number; s?: number; b?: number; zn?: number };
    placement: 'sulco_semeadura' | 'a_lanco_pre_plantio' | 'sulco_mais_lanco';
    splitWarning?: string;
  };
  tailoredCustomBlend: {
    name: string;
    customFormulaNPKS: string;
    guarantees: { n: number; p2o5: number; k2o: number; s: number; b: number; zn: number; ca: number; mg: number };
    rawMaterialsRecipeKgPerTon: RawMaterialItem[];
    recommendedDose: UnitTriadValue;
    salinityIndex: number;
    advantages: string[];
  };
  topDressingPlan: {
    totalTopDressingDoseKgHa: number;
    totalTopDressingTriad: UnitTriadValue;
    splits: {
      splitIndex: number;
      stage: string;
      productName: string;
      dose: UnitTriadValue;
      nKgHa: number;
      k2oKgHa: number;
      sKgHa: number;
      guidance: string;
    }[];
  };
  foliarAndBiostimulants: {
    stage: string;
    products: string;
    elements: string;
    rate: string;
    technicalObjective: string;
  }[];
  integratedJustification: string;
  fieldActionChecklist: string[];
}

export interface PersonalizedRecommendationOutput {
  id: string;
  generatedAt: string;
  crop: PersonalizedCropTarget;
  plotName: string;
  spacing: SpacingParameters;
  preferences: ProducerPreferences;
  history: FarmPlotHistory;
  liming: PersonalizedLimingResult;
  gypsum: PersonalizedGypsumResult;
  fertilization: PersonalizedFertilizationResult;
  executiveSummary: string[];
}

/**
 * DEFAULT PRODUCER PREFERENCES
 */
export const DEFAULT_PRODUCER_PREFERENCES: ProducerPreferences = {
  managementSystem: 'plantio_direto_consolidado',
  budgetStrategy: 'teto_produtivo_alta_tecnologia',
  fertilizerFormPreference: 'complexo_granulado',
  phosphorusSourcePreference: 'soluvel_acidulado',
  potassiumSourcePreference: 'kcl_padrao',
  nitrogenSourcePreference: 'ureia_protegida_nbpt',
  topDressingSplits: 2,
  maxPlanterBoxKgHa: 400,
  maxSalinityInFurrowKgHa: 70,
  riskTolerance: 'moderado',
  sustainabilityPriority: 'alta',
  preferCustomBlends: true,
};

/**
 * DEFAULT FARM PLOT HISTORY
 */
export const DEFAULT_FARM_PLOT_HISTORY: FarmPlotHistory = {
  previousCrop: 'soja',
  previousCropYield: 65,
  yearsInDirectPlanting: 8,
  strawDensity: 'alta_mais_6_ton',
  lastLimingMonthsAgo: 24,
  lastLimingDoseTonsHa: 2.0,
  lastLimingPRNT: 85,
  lastGypsumMonthsAgo: 36,
  lastGypsumDoseKgHa: 1500,
  organicFertilization: {
    applied: false,
    type: 'cama_frango',
    doseTonsHa: 3,
    monthsAgo: 12,
  },
  soilCompactionLevel: 'nenhuma',
  nematodePressure: 'baixa',
  diseaseHistoryNotes: 'Área com boa fertilidade histórica e manejo biológico ativo.',
};

/**
 * DEFAULT CROP TARGET TEMPLATES
 */
export const PERSONALIZED_CROPS_PRESETS: PersonalizedCropTarget[] = [
  {
    cropId: 'soja',
    cropName: 'Soja Grãos',
    scientificName: 'Glycine max',
    targetYield: 75,
    yieldUnit: 'sc/ha',
    targetVPercent: 65,
    targetCaMgRatioMin: 3.0,
    targetCaMgRatioMax: 4.5,
    extractionRatesKgPerUnit: {
      n: 5.2,
      p2o5: 1.1,
      k2o: 2.4,
      ca: 0.9,
      mg: 0.5,
      s: 0.45,
      b: 6.0,
      zn: 8.0,
      cu: 2.5,
      mn: 7.0,
      mo: 0.8,
      fe: 12.0,
    },
    isFruitOrPerennial: false,
  },
  {
    cropId: 'milho',
    cropName: 'Milho Grãos',
    scientificName: 'Zea mays',
    targetYield: 140,
    yieldUnit: 'sc/ha',
    targetVPercent: 70,
    targetCaMgRatioMin: 2.8,
    targetCaMgRatioMax: 4.0,
    extractionRatesKgPerUnit: {
      n: 1.4,
      p2o5: 0.55,
      k2o: 1.25,
      ca: 0.35,
      mg: 0.30,
      s: 0.22,
      b: 2.5,
      zn: 4.5,
      cu: 1.2,
      mn: 3.5,
      mo: 0.2,
      fe: 6.0,
    },
    isFruitOrPerennial: false,
  },
  {
    cropId: 'cafe_arabica',
    cropName: 'Café Arábica',
    scientificName: 'Coffea arabica',
    targetYield: 50,
    yieldUnit: 'sc/ha',
    targetVPercent: 65,
    targetCaMgRatioMin: 3.0,
    targetCaMgRatioMax: 4.5,
    extractionRatesKgPerUnit: {
      n: 6.5,
      p2o5: 1.2,
      k2o: 7.5,
      ca: 2.8,
      mg: 1.2,
      s: 0.8,
      b: 15.0,
      zn: 18.0,
      cu: 5.0,
      mn: 14.0,
      mo: 1.0,
      fe: 25.0,
    },
    isFruitOrPerennial: true,
  },
  {
    cropId: 'algodao',
    cropName: 'Algodão em Pluma',
    scientificName: 'Gossypium hirsutum',
    targetYield: 300,
    yieldUnit: '@ / ha',
    targetVPercent: 70,
    targetCaMgRatioMin: 3.0,
    targetCaMgRatioMax: 4.0,
    extractionRatesKgPerUnit: {
      n: 0.95,
      p2o5: 0.35,
      k2o: 0.90,
      ca: 0.45,
      mg: 0.25,
      s: 0.20,
      b: 3.5,
      zn: 4.0,
      cu: 1.0,
      mn: 3.0,
      mo: 0.15,
      fe: 5.0,
    },
    isFruitOrPerennial: false,
  },
  {
    cropId: 'feijao',
    cropName: 'Feijão Comum',
    scientificName: 'Phaseolus vulgaris',
    targetYield: 45,
    yieldUnit: 'sc/ha',
    targetVPercent: 65,
    targetCaMgRatioMin: 3.0,
    targetCaMgRatioMax: 4.5,
    extractionRatesKgPerUnit: {
      n: 3.8,
      p2o5: 0.9,
      k2o: 2.8,
      ca: 1.1,
      mg: 0.6,
      s: 0.5,
      b: 5.0,
      zn: 7.0,
      cu: 2.0,
      mn: 6.0,
      mo: 0.6,
      fe: 10.0,
    },
    isFruitOrPerennial: false,
  },
  {
    cropId: 'citros',
    cropName: 'Citros (Laranja/Tangerina)',
    scientificName: 'Citrus sinensis',
    targetYield: 45,
    yieldUnit: 't/ha',
    targetVPercent: 70,
    targetCaMgRatioMin: 3.0,
    targetCaMgRatioMax: 4.5,
    extractionRatesKgPerUnit: {
      n: 4.5,
      p2o5: 0.9,
      k2o: 5.0,
      ca: 3.5,
      mg: 0.9,
      s: 0.6,
      b: 12.0,
      zn: 15.0,
      cu: 4.0,
      mn: 10.0,
      mo: 0.5,
      fe: 18.0,
    },
    isFruitOrPerennial: true,
  },
  {
    cropId: 'cana_de_acucar',
    cropName: 'Cana-de-Açúcar',
    scientificName: 'Saccharum officinarum',
    targetYield: 110,
    yieldUnit: 't/ha',
    targetVPercent: 60,
    targetCaMgRatioMin: 2.5,
    targetCaMgRatioMax: 4.0,
    extractionRatesKgPerUnit: {
      n: 1.2,
      p2o5: 0.4,
      k2o: 2.2,
      ca: 0.8,
      mg: 0.4,
      s: 0.35,
      b: 3.0,
      zn: 5.0,
      cu: 1.5,
      mn: 6.0,
      mo: 0.2,
      fe: 8.0,
    },
    isFruitOrPerennial: true,
  },
  {
    cropId: 'trigo',
    cropName: 'Trigo / Cereais de Inverno',
    scientificName: 'Triticum aestivum',
    targetYield: 60,
    yieldUnit: 'sc/ha',
    targetVPercent: 65,
    targetCaMgRatioMin: 2.5,
    targetCaMgRatioMax: 4.0,
    extractionRatesKgPerUnit: {
      n: 2.8,
      p2o5: 0.85,
      k2o: 2.2,
      ca: 0.45,
      mg: 0.35,
      s: 0.30,
      b: 3.0,
      zn: 5.0,
      cu: 1.8,
      mn: 4.5,
      mo: 0.3,
      fe: 8.0,
    },
    isFruitOrPerennial: false,
  },
];

/**
 * 1. PERSONALIZED LIMING ALGORITHM
 * Integrates soil V%, CTC, Ca, Mg, pH, PRNT, Management System, and Liming History.
 */
export function calculatePersonalizedLiming(
  soil: SoilAnalysisExtended | SoilSample,
  crop: PersonalizedCropTarget,
  history: FarmPlotHistory,
  preferences: ProducerPreferences,
  spacing: SpacingParameters
): PersonalizedLimingResult {
  const soilAny = soil as any;
  const sb = soilAny.sumOfBases ?? ((soilAny.caCmolc || soilAny.caCmolcDm3 || 0) + (soilAny.mgCmolc || soilAny.mgCmolcDm3 || 0) + (soilAny.kCmolc || soilAny.kCmolcDm3 || 0));
  const t = soilAny.totalCtc ?? (soilAny.ctcTotal ?? (sb + (soilAny.hAlCmolc || soilAny.hAlCmolcDm3 || 0)));
  const currentV = t > 0 ? (sb / t) * 100 : 0;
  const targetV = crop.targetVPercent;
  const ca = soilAny.caCmolc ?? soilAny.caCmolcDm3 ?? 0;
  const mg = soilAny.mgCmolc ?? soilAny.mgCmolcDm3 ?? 0;
  const caMgRatio = mg > 0 ? ca / mg : 3.5;
  const clay = soilAny.clayPercent ?? 30;

  const factors: { factor: string; influence: string; impact: string }[] = [];

  // Base PRNT selection
  let prnt = 85;
  if (preferences.budgetStrategy === 'teto_produtivo_alta_tecnologia') {
    prnt = 90; // Calcário com maior reatividade ou micronizado
  } else if (preferences.managementSystem === 'organico') {
    prnt = 80;
  }

  // Base Calculation NC (t/ha) = [(V2 - V1) * T / PRNT]
  let rawDoseTonsHa = 0;
  if (currentV < targetV) {
    rawDoseTonsHa = ((targetV - currentV) * t) / prnt;
  }

  // Factor 1: Management System Modulation
  let depthFactor = 1.0;
  let incorporationMethod = 'Distribuição uniforme a lanço em área total.';

  if (preferences.managementSystem === 'plantio_direto_consolidado' && history.yearsInDirectPlanting >= 5) {
    // No SPD consolidado, não se revolve o solo. Aplica-se na superfície (0-10 cm equivalente ou 50-60% da dose cheia)
    depthFactor = 0.55;
    incorporationMethod = 'Aplicação superficial a lanço sem incorporação (Sistema Plantio Direto consolidado). Dose fracionada para evitar supercalagem na camada superficial (0-5 cm).';
    factors.push({
      factor: 'Plantio Direto Consolidado (>5 anos)',
      influence: 'Ausência de revolvimento mecânico do perfil',
      impact: 'Dose modulada para 55% da taxa convencional para preservar biologia e evitar imobilização de micronutrientes na superfície.',
    });
  } else if (preferences.managementSystem === 'convencional') {
    depthFactor = 1.0; // 0-20 cm
    incorporationMethod = 'Aplicação a lanço com incorporação profunda via aração (0-20 cm) e nivelamento com grade intermediária 60 a 90 dias antes do plantio.';
    factors.push({
      factor: 'Sistema Convencional de Cultivo',
      influence: 'Revolvimento na camada arável (0-20 cm)',
      impact: 'Dose calculada para o volume integral da camada 0-20 cm.',
    });
  } else if (crop.isFruitOrPerennial) {
    depthFactor = 0.75;
    incorporationMethod = 'Distribuição a lanço na projeção da copa e entrelinhas, aproveitando as primeiras chuvas para infiltração gradativa.';
    factors.push({
      factor: 'Cultura Perene / Frutífera',
      influence: 'Raízes ativas concentradas na projeção da copa',
      impact: 'Aplicação localizada e sem corte de raízes.',
    });
  }

  // Factor 2: Liming History Modulation
  if (history.lastLimingMonthsAgo <= 12 && history.lastLimingDoseTonsHa > 1.0) {
    // Reação do calcário ainda ativa no solo
    const remainingReactionDiscount = 0.5;
    rawDoseTonsHa *= remainingReactionDiscount;
    factors.push({
      factor: `Calagem Recente (${history.lastLimingMonthsAgo} meses atrás - ${history.lastLimingDoseTonsHa} t/ha)`,
      influence: 'Parte do calcário anterior ainda está em processo de solubilização',
      impact: 'Desconto de 50% na dose calculada para evitar sobreposição alcalina.',
    });
  } else if (history.lastLimingMonthsAgo <= 24 && history.lastLimingDoseTonsHa >= 2.5) {
    rawDoseTonsHa *= 0.8;
    factors.push({
      factor: `Calagem Intermediária (${history.lastLimingMonthsAgo} meses atrás)`,
      influence: 'Efeito residual de neutralização ainda presente',
      impact: 'Ajuste fino de 20% de desconto preventivo.',
    });
  }

  // Factor 3: Corrective Type Decision
  let recommendedCorrective = 'Calcário Dolomítico (MgO > 12%, CaO ~30%)';
  if (mg < 0.8 || caMgRatio > 4.5) {
    recommendedCorrective = 'Calcário Dolomítico de Alta Reatividade (PRNT ≥ 85%, MgO > 12%)';
    factors.push({
      factor: `Déficit de Magnésio / Relação Ca:Mg desequilibrada (${caMgRatio.toFixed(1)}:1)`,
      influence: 'Nível de Mg no solo baixo (<0.8 cmolc/dm³)',
      impact: 'Indicação mandatória de Calcário Dolomítico para repor Mg e atingir relação Ca:Mg ideal (3.0 a 4.0:1).',
    });
  } else if (ca < 1.8 && mg >= 1.2) {
    recommendedCorrective = 'Calcário Calcítico (CaO > 45%, MgO < 5%)';
    factors.push({
      factor: `Magnésio Adequado (${mg.toFixed(2)} cmolc/dm³) com Cálcio Baixo (${ca.toFixed(2)} cmolc/dm³)`,
      influence: 'Solo necessita prioritariamente de íons Cálcio',
      impact: 'Indicação de Calcário Calcítico para não induzir excesso de Magnésio e desbalanceamento de K.',
    });
  } else {
    recommendedCorrective = 'Calcário Magnesiano (MgO 5% a 12%)';
    factors.push({
      factor: 'Equilíbrio Ca e Mg Estável',
      influence: 'Teores de ambos os cátions em faixas medianas',
      impact: 'Manutenção do equilíbrio com corretivo magnesiano equilibrado.',
    });
  }

  // Final Dose
  let finalDoseTonsHa = Number((rawDoseTonsHa * depthFactor).toFixed(2));
  let needed = finalDoseTonsHa >= 0.3;

  if (!needed) {
    finalDoseTonsHa = 0;
  }

  const doseKgHa = finalDoseTonsHa * 1000;
  const triad = calculateUnitTriad(doseKgHa, spacing.rowSpacingM, spacing.plantSpacingM);

  let justification = '';
  if (needed) {
    justification = `Recomendada a aplicação de ${finalDoseTonsHa} t/ha (${triad.kgPerHa} kg/ha, ${triad.gPerLinearMeter} g/m linear ou ${triad.gPerPlant} g/planta) de ${recommendedCorrective}. ` +
      `A Saturação por Bases atual (V = ${currentV.toFixed(1)}%) está abaixo da meta agronômica de ${targetV}% para a cultura de ${crop.cropName}. ` +
      `A dose foi calibrada considerando o sistema de manejo (${preferences.managementSystem.replace(/_/g, ' ')}), CTC(T) de ${t.toFixed(2)} cmolc/dm³ e o histórico de correções da propriedade.`;
  } else {
    justification = `O solo apresenta Saturação por Bases atual (V = ${currentV.toFixed(1)}%) plenamente satisfatória para a meta de ${targetV}% exigida por ${crop.cropName}. Não é necessária a aplicação de calcário neste ciclo.`;
  }

  return {
    needed,
    doseTonsHa: finalDoseTonsHa,
    dose: triad,
    currentV: Number(currentV.toFixed(1)),
    targetV,
    recommendedCorrective,
    prntConsidered: prnt,
    incorporationMethod,
    justification,
    integratedFactors: factors,
  };
}

/**
 * 2. PERSONALIZED GYPSUM ALGORITHM
 * Evaluates subsoil (20-40cm) chemistry, clay %, compaction history, and crop root depth.
 */
export function calculatePersonalizedGypsum(
  soil: SoilAnalysisExtended | SoilSample,
  subsoil: SoilAnalysisExtended | SoilSample | undefined,
  crop: PersonalizedCropTarget,
  history: FarmPlotHistory,
  preferences: ProducerPreferences,
  spacing: SpacingParameters
): PersonalizedGypsumResult {
  const clay = subsoil?.clayPercent ?? soil.clayPercent ?? 30;
  const ca = subsoil ? ((subsoil as any).caCmolc ?? (subsoil as any).caCmolcDm3 ?? 0) : ((soil as any).caCmolc ?? (soil as any).caCmolcDm3 ?? 0);
  const al = subsoil ? ((subsoil as any).alCmolc ?? (subsoil as any).alCmolcDm3 ?? 0) : ((soil as any).alCmolc ?? (soil as any).alCmolcDm3 ?? 0);
  const sSO4 = subsoil ? ((subsoil as any).sSulfurMgDm3 ?? (subsoil as any).sSO4MgDm3 ?? 0) : ((soil as any).sSulfurMgDm3 ?? (soil as any).sSO4MgDm3 ?? 0);
  const mPercent = subsoil ? ((subsoil as any).alSaturation ?? (subsoil as any).mPercent ?? 0) : ((soil as any).alSaturation ?? (soil as any).mPercent ?? 0);

  const criteria: string[] = [];
  const factors: { factor: string; influence: string; impact: string }[] = [];

  if (ca < 0.5) criteria.push(`Cálcio baixo em profundidade (${ca.toFixed(2)} cmolc/dm³ < 0.50)`);
  if (al > 0.4) criteria.push(`Alumínio tóxico em profundidade (${al.toFixed(2)} cmolc/dm³ > 0.40)`);
  if (mPercent > 20) criteria.push(`Saturação por Alumínio (m%) elevada em subsuperfície (${mPercent.toFixed(1)}% > 20%)`);
  if (sSO4 < 6.0) criteria.push(`Déficit de Enxofre-sulfato no perfil (${sSO4.toFixed(1)} mg/dm³ < 6.0)`);
  if (history.soilCompactionLevel === 'moderada_15_25cm' || history.soilCompactionLevel === 'severa_subsuperficial') {
    criteria.push(`Camada compactada e barreira física/química identificada no histórico do talhão`);
  }

  // Multiplier Factor determination (Embrapa Sousa & Lobato)
  let clayFactor = 50; // Culturas anuais grãos
  if (crop.isFruitOrPerennial || crop.cropId.includes('cafe') || crop.cropId.includes('citros')) {
    clayFactor = 60; // Perenes exigem maior aprofundamento radicular
    factors.push({
      factor: 'Cultura Perene / Sistema Radicular Profundo',
      influence: 'Demanda de raízes ativas além de 60 cm para tolerância a veranicos',
      impact: 'Fator multiplicador elevado para 60 kg de gesso / % de argila.',
    });
  } else if (crop.cropId.includes('cana') || crop.cropId.includes('pastagem')) {
    clayFactor = 35;
  }

  // Producer Preference adjustments
  if (preferences.budgetStrategy === 'teto_produtivo_alta_tecnologia') {
    clayFactor = Math.round(clayFactor * 1.1); // +10% para condicionamento máximo
  }

  let rawDoseKgHa = criteria.length > 0 ? clayFactor * clay : 0;

  // History Check: Past Gypsum
  if (history.lastGypsumMonthsAgo <= 18 && history.lastGypsumDoseKgHa >= 1000) {
    rawDoseKgHa = 0; // Gessagem ainda ativa e condicionando
    factors.push({
      factor: `Gessagem Recente (${history.lastGypsumMonthsAgo} meses atrás - ${history.lastGypsumDoseKgHa} kg/ha)`,
      influence: 'Gesso possui mobilidade e efeito condicionador por 3 a 5 anos no subsolo',
      impact: 'Aplicação suspensa no ciclo atual para evitar lixiviação excessiva de Mg e K.',
    });
  } else if (history.lastGypsumMonthsAgo <= 36 && history.lastGypsumDoseKgHa >= 1500 && criteria.length <= 1) {
    rawDoseKgHa *= 0.5;
    factors.push({
      factor: `Gessagem Anterior (${history.lastGypsumMonthsAgo} meses atrás)`,
      influence: 'Residual moderado no perfil',
      impact: 'Dose ajustada para manutenção (50%).',
    });
  }

  const needed = rawDoseKgHa >= 300;
  const finalDoseKgHa = needed ? Math.round(rawDoseKgHa) : 0;
  const triad = calculateUnitTriad(finalDoseKgHa, spacing.rowSpacingM, spacing.plantSpacingM);

  let justification = '';
  if (needed) {
    justification = `Gessagem Agrícola recomendada na dose de ${finalDoseKgHa} kg/ha (${triad.gPerLinearMeter} g/m linear ou ${triad.gPerPlant} g/planta) com base no teor de argila de ${clay}% (fator ${clayFactor}). ` +
      `Gatilhos agronômicos identificados: ${criteria.join('; ')}. ` +
      `A aplicação de gesso fornecerá sulfato (SO₄²⁻) e cálcio solúvel, promovendo a neutralização do Al³⁺ em profundidade (formação de AlSO₄⁺ atóxico) e estimulando o crescimento radicular profundo contra veranicos.`;
  } else {
    justification = `Subsolo com níveis adequados de Cálcio e Enxofre, sem barreira química de Alumínio tóxico (${al.toFixed(2)} cmolc/dm³) e saturação m% (${mPercent.toFixed(1)}%) controlada. Gessagem desnecessária no momento.`;
  }

  return {
    needed,
    doseKgHa: finalDoseKgHa,
    dose: triad,
    clayPercent: clay,
    multiplierFactor: clayFactor,
    triggerCriteria: criteria,
    justification,
    integratedFactors: factors,
  };
}

/**
 * 3. TAILORED BLENDING & NUTRIENT BALANCE ALGORITHM
 * Computes exact nutritional requirements, credits historical inputs (N residual, organic manures, BioAS),
 * solves for standard commercial blends AND custom raw-material recipes (kg/ton).
 */
export function calculatePersonalizedFertilizationAndBlends(
  soil: SoilAnalysisExtended | SoilSample,
  crop: PersonalizedCropTarget,
  history: FarmPlotHistory,
  preferences: ProducerPreferences,
  spacing: SpacingParameters
): PersonalizedFertilizationResult {
  const yieldTarget = crop.targetYield;
  const clay = (soil as any).clayPercent ?? 30;
  const pSoil = (soil as any).pResina ?? (soil as any).pMehlich1 ?? (soil as any).pMehlich1MgDm3 ?? 10;
  const kSoil = (soil as any).kCmolc ?? (soil as any).kCmolcDm3 ?? 0.15;
  const sSoil = (soil as any).sSulfurMgDm3 ?? (soil as any).sSO4MgDm3 ?? 8;
  const moSoil = (soil as any).organicMatterGKg ?? (soil as any).organicMatterGdm3 ?? 22; // g/dm³

  // 1. Gross Demand (Demanda Bruta da Cultura)
  const rates = crop.extractionRatesKgPerUnit;
  const grossN = yieldTarget * rates.n;
  const grossP2O5 = yieldTarget * rates.p2o5;
  const grossK2O = yieldTarget * rates.k2o;
  const grossS = yieldTarget * rates.s;
  const grossCa = yieldTarget * rates.ca;
  const grossMg = yieldTarget * rates.mg;
  const grossB = yieldTarget * rates.b;
  const grossZn = yieldTarget * rates.zn;
  const grossCu = yieldTarget * rates.cu;
  const grossMn = yieldTarget * rates.mn;
  const grossMo = yieldTarget * rates.mo;

  // 2. Credits & Discounts from Farm History & Biology
  const historySummary: string[] = [];

  // A. Previous Crop Nitrogen Credit
  let nCredit = 0;
  if (['soja', 'crotalaria', 'feijao'].includes(history.previousCrop)) {
    nCredit = 25; // Crédito de FBN e mineralização de nódulos da leguminosa anterior
    historySummary.push(`Crédito de Nitrogênio da cultura anterior (${history.previousCrop.toUpperCase()}): -25 kg N/ha.`);
  }

  // B. Straw C/N Immobilization Penalty
  let nPenalty = 0;
  if (history.strawDensity === 'alta_mais_6_ton' && ['milho', 'braquiaria', 'trigo'].includes(history.previousCrop)) {
    nPenalty = 20; // Imobilização temporária de N pela microbiota decompondo palhada rica em C
    historySummary.push(`Ajuste de N inicial para superação de imobilização microbiológica em palhada densa de gramínea (+20 kg N/ha no arranque).`);
  }

  // C. Past Organic Fertilization Credits
  let orgNCredit = 0;
  let orgP2O5Credit = 0;
  let orgK2OCredit = 0;
  let orgSCredit = 0;

  if (history.organicFertilization.applied && history.organicFertilization.doseTonsHa) {
    const tons = history.organicFertilization.doseTonsHa;
    const months = history.organicFertilization.monthsAgo || 6;
    const efficiency = months <= 6 ? 0.6 : months <= 12 ? 0.4 : 0.2;

    if (history.organicFertilization.type === 'cama_frango') {
      orgNCredit = Math.round(tons * 25 * efficiency);
      orgP2O5Credit = Math.round(tons * 28 * efficiency);
      orgK2OCredit = Math.round(tons * 20 * efficiency);
      orgSCredit = Math.round(tons * 5 * efficiency);
    } else if (history.organicFertilization.type === 'esterco_bovino') {
      orgNCredit = Math.round(tons * 10 * efficiency);
      orgP2O5Credit = Math.round(tons * 8 * efficiency);
      orgK2OCredit = Math.round(tons * 12 * efficiency);
      orgSCredit = Math.round(tons * 2 * efficiency);
    } else if (history.organicFertilization.type === 'torta_filtro') {
      orgNCredit = Math.round(tons * 12 * efficiency);
      orgP2O5Credit = Math.round(tons * 18 * efficiency);
      orgK2OCredit = Math.round(tons * 6 * efficiency);
      orgSCredit = Math.round(tons * 3 * efficiency);
    }
    historySummary.push(`Crédito de adubação orgânica recente (${history.organicFertilization.type} - ${tons} t/ha aplicada há ${months} meses): -${orgNCredit}kg N, -${orgP2O5Credit}kg P₂O₅, -${orgK2OCredit}kg K₂O, -${orgSCredit}kg S/ha.`);
  }

  // D. BioAS (Soil Biology Enzyme Multiplier)
  const aryl = (soil as any).arylsulfataseActivity ?? (soil as any).arylsulfataseMgPnpKgH ?? 0;
  const beta = (soil as any).betaGlucosidaseActivity ?? (soil as any).betaGlucosidaseMgPnpKgH ?? 0;
  const fosf = (soil as any).acidPhosphataseActivity ?? (soil as any).acidPhosphataseMgPnpKgH ?? 0;
  let bioASFactor = 1.0;
  if (aryl > 250 || beta > 130 || fosf > 400) {
    bioASFactor = 0.90; // 10% de maior eficiência em ciclagem de P e S
    historySummary.push(`Bioanálise de Solo (BioAS) ativa com alta atividade enzimática: +10% de eficiência de ciclagem de P orgânico e Enxofre.`);
  }

  // 3. Net Demand Calculations (Demanda Líquida Ajustada)
  // Phosphorus Net Demand
  let pEfficiency = 0.40; // Solos médios
  if (clay > 50) pEfficiency = 0.30; // Maior adsorção em solos muito argilosos
  else if (clay < 20) pEfficiency = 0.55;

  let basePReq = 0;
  if (pSoil < 8) basePReq = 120 + (grossP2O5 * 0.7);
  else if (pSoil < 16) basePReq = 80 + (grossP2O5 * 0.5);
  else if (pSoil < 30) basePReq = 40 + (grossP2O5 * 0.35);
  else basePReq = 20 + (grossP2O5 * 0.20);

  let netP2O5 = Math.max(20, Math.round((basePReq - orgP2O5Credit) * bioASFactor));

  // Potassium Net Demand
  let baseKReq = 0;
  if (kSoil < 0.12) baseKReq = 110 + (grossK2O * 0.6);
  else if (kSoil < 0.22) baseKReq = 75 + (grossK2O * 0.45);
  else if (kSoil < 0.35) baseKReq = 45 + (grossK2O * 0.30);
  else baseKReq = 20 + (grossK2O * 0.15);

  let netK2O = Math.max(20, Math.round(baseKReq - orgK2OCredit));

  // Nitrogen Net Demand
  let netN = 0;
  let nPlanting = 0;
  let nTopDressing = 0;

  if (crop.cropId === 'soja') {
    // Soja: FBN integral (Bradyrhizobium + Co-inoculação com Azospirillum)
    netN = 0;
    nPlanting = 0;
    nTopDressing = 0;
    historySummary.push('Cultura da soja fixará 100% da demanda de N biologicamente através da simbiose com Bradyrhizobium japonicum.');
  } else if (crop.cropId === 'milho') {
    const totalNRequired = Math.max(80, (grossN * 0.8) - nCredit + nPenalty - orgNCredit);
    nPlanting = Math.min(40, Math.round(totalNRequired * 0.25));
    nTopDressing = Math.round(totalNRequired - nPlanting);
    netN = nPlanting + nTopDressing;
  } else if (crop.isFruitOrPerennial) {
    const totalNRequired = Math.max(60, grossN - nCredit - orgNCredit);
    nPlanting = Math.round(totalNRequired * 0.20);
    nTopDressing = Math.round(totalNRequired * 0.80);
    netN = totalNRequired;
  } else {
    const totalNRequired = Math.max(50, grossN - nCredit + nPenalty - orgNCredit);
    nPlanting = Math.min(30, Math.round(totalNRequired * 0.30));
    nTopDressing = Math.round(totalNRequired - nPlanting);
    netN = totalNRequired;
  }

  // Sulfur Net Demand
  let netS = Math.max(15, Math.round((grossS * 0.8) - orgSCredit));
  if (sSoil > 15) netS = Math.max(10, Math.round(netS * 0.6));

  // Micronutrients Net Demand (g/ha)
  const bSoil = (soil as any).bBoroMgDm3 ?? (soil as any).bMgDm3 ?? 0.3;
  const znSoil = (soil as any).znZincoMgDm3 ?? (soil as any).znMgDm3 ?? 1.0;
  const cuSoil = (soil as any).cuCobreMgDm3 ?? (soil as any).cuMgDm3 ?? 0.8;
  const mnSoil = (soil as any).mnManganesMgDm3 ?? (soil as any).mnMgDm3 ?? 3.5;
  const moSoilVal = (soil as any).moMolibdenioMgDm3 ?? 0.1;

  let netB = bSoil < 0.4 ? Math.round(grossB * 1.5 + 800) : Math.round(grossB * 0.8);
  let netZn = znSoil < 1.5 ? Math.round(grossZn * 1.5 + 1500) : Math.round(grossZn * 0.8);
  let netCu = cuSoil < 0.6 ? Math.round(grossCu * 1.3 + 400) : Math.round(grossCu * 0.6);
  let netMn = mnSoil < 3.0 ? Math.round(grossMn * 1.3 + 1000) : Math.round(grossMn * 0.5);
  let netMo = moSoilVal < 0.15 ? Math.round(grossMo * 1.5 + 60) : Math.round(grossMo * 0.8);

  // 4. COMMERCIAL BLEND SELECTION
  let chosenCommercialFormula = '08-28-16 + 4% S + 0.3% B + 0.5% Zn';
  let commNPK: [number, number, number] = [8, 28, 16];
  let commDoseKgHa = Math.round((netP2O5 / 0.28));

  if (crop.cropId === 'soja') {
    if (netP2O5 >= 100) {
      chosenCommercialFormula = '04-30-10 + 6% S + 0.3% B + 0.5% Zn';
      commNPK = [4, 30, 10];
      commDoseKgHa = Math.round(netP2O5 / 0.30);
    } else {
      chosenCommercialFormula = '02-20-20 + 4% S + 0.2% B + 0.4% Zn';
      commNPK = [2, 20, 20];
      commDoseKgHa = Math.round(netP2O5 / 0.20);
    }
  } else if (crop.cropId === 'milho') {
    chosenCommercialFormula = '08-28-16 + 5% S + 0.4% B + 0.6% Zn';
    commNPK = [8, 28, 16];
    commDoseKgHa = Math.round(netP2O5 / 0.28);
  } else if (crop.isFruitOrPerennial) {
    chosenCommercialFormula = '12-06-18 + 4% S + 3% Ca + 2% Mg + Micros';
    commNPK = [12, 6, 18];
    commDoseKgHa = Math.round(netP2O5 / 0.06);
  }

  // Planter Box & Furrow Salinity Safe Placement Check
  let placement: 'sulco_semeadura' | 'a_lanco_pre_plantio' | 'sulco_mais_lanco' = 'sulco_semeadura';
  let splitWarning: string | undefined = undefined;

  const nInFurrow = (commDoseKgHa * commNPK[0]) / 100;
  const k2oInFurrow = (commDoseKgHa * commNPK[2]) / 100;
  const totalSalineFurrow = nInFurrow + k2oInFurrow;

  if (commDoseKgHa > preferences.maxPlanterBoxKgHa || totalSalineFurrow > preferences.maxSalinityInFurrowKgHa) {
    placement = 'sulco_mais_lanco';
    splitWarning = `Atenção à capacidade da semeadora ou risco salino: A dose calculada (${commDoseKgHa} kg/ha, N+K₂O = ${totalSalineFurrow.toFixed(1)} kg/ha) excede o limite seguro no sulco (${preferences.maxSalinityInFurrowKgHa} kg/ha de N+K₂O). Recomendado aplicar parte a lanço em pré-plantio (ex: KCl e gesso) e manter até ${preferences.maxPlanterBoxKgHa} kg/ha no sulco.`;
  }

  const commercialTriad = calculateUnitTriad(commDoseKgHa, spacing.rowSpacingM, spacing.plantSpacingM);

  // 5. TAILORED CUSTOM BLEND RECIPE GENERATOR (Big Bag Sob Medida por Tonelada)
  // We formulate a dedicated recipe of 1000 kg combining raw materials based on exact deficit ratios:
  let recipe: RawMaterialItem[] = [];
  let customNPKSLabel = '';
  let customGuarantees = { n: 0, p2o5: 0, k2o: 0, s: 0, b: 0, zn: 0, ca: 0, mg: 0 };
  let customDoseKgHa = commDoseKgHa;

  if (crop.cropId === 'soja') {
    // Soja Blend: MAP (11-52-0) + TSP (0-46-0) + KCl (0-0-60) + Sulfato de Amônio / Enxofre Elementar + Frits B/Zn
    // Ex: 500 kg MAP + 150 kg TSP + 250 kg KCl + 70 kg Sulfato Amônio + 30 kg FTE/Micros = 1000 kg
    recipe = [
      { id: 'map', name: 'Fosfato Monoamônico - MAP (11% N, 52% P₂O₅)', kgPerTon: 520, percentage: 52, contributedNutrients: '5.7% N, 27.0% P₂O₅' },
      { id: 'kcl', name: 'Cloreto de Potássio Granulado - KCl (60% K₂O)', kgPerTon: 250, percentage: 25, contributedNutrients: '15.0% K₂O' },
      { id: 'samonio', name: 'Sulfato de Amônio Granulado (21% N, 24% S)', kgPerTon: 150, percentage: 15, contributedNutrients: '3.1% N, 3.6% S' },
      { id: 'enxofre_elem', name: 'Enxofre Elementar Pastilhado (90% S)', kgPerTon: 40, percentage: 4, contributedNutrients: '3.6% S' },
      { id: 'micros_frits', name: 'Complexo Quelatado / Frits de Boro e Zinco (10% B, 15% Zn)', kgPerTon: 40, percentage: 4, contributedNutrients: '0.4% B, 0.6% Zn' },
    ];
    customNPKSLabel = '09-27-15 + 7.2% S + 0.4% B + 0.6% Zn';
    customGuarantees = { n: 8.8, p2o5: 27.0, k2o: 15.0, s: 7.2, b: 0.4, zn: 0.6, ca: 1.5, mg: 0.8 };
    customDoseKgHa = Math.round(netP2O5 / 0.27);
  } else if (crop.cropId === 'milho') {
    recipe = [
      { id: 'map', name: 'Fosfato Monoamônico - MAP (11% N, 52% P₂O₅)', kgPerTon: 540, percentage: 54, contributedNutrients: '5.9% N, 28.1% P₂O₅' },
      { id: 'kcl', name: 'Cloreto de Potássio - KCl (60% K₂O)', kgPerTon: 240, percentage: 24, contributedNutrients: '14.4% K₂O' },
      { id: 'samonio', name: 'Sulfato de Amônio (21% N, 24% S)', kgPerTon: 140, percentage: 14, contributedNutrients: '2.9% N, 3.4% S' },
      { id: 'ureia_nbpt', name: 'Ureia com Inibidor de Urease NBPT (45% N)', kgPerTon: 40, percentage: 4, contributedNutrients: '1.8% N' },
      { id: 'micros_zn_b', name: 'Mix Micronutrientes Alta Pureza (12% Zn, 8% B)', kgPerTon: 40, percentage: 4, contributedNutrients: '0.48% Zn, 0.32% B' },
    ];
    customNPKSLabel = '10-28-14 + 3.4% S + 0.32% B + 0.48% Zn';
    customGuarantees = { n: 10.6, p2o5: 28.1, k2o: 14.4, s: 3.4, b: 0.32, zn: 0.48, ca: 1.0, mg: 0.5 };
    customDoseKgHa = Math.round(netP2O5 / 0.281);
  } else if (crop.isFruitOrPerennial) {
    recipe = [
      { id: 'nitrato_calcio', name: 'Nitrato de Cálcio com Boro (15% N, 19% Ca, 0.3% B)', kgPerTon: 300, percentage: 30, contributedNutrients: '4.5% N, 5.7% Ca, 0.09% B' },
      { id: 'sulfato_potassio', name: 'Sulfato de Potássio Especial - K₂SO₄ (50% K₂O, 17% S)', kgPerTon: 350, percentage: 35, contributedNutrients: '17.5% K₂O, 5.9% S' },
      { id: 'map_purificado', name: 'MAP Purificado (12% N, 61% P₂O₅)', kgPerTon: 150, percentage: 15, contributedNutrients: '1.8% N, 9.1% P₂O₅' },
      { id: 'sulfato_magnesio', name: 'Sulfato de Magnésio Solúvel (9.6% Mg, 13% S)', kgPerTon: 150, percentage: 15, contributedNutrients: '1.4% Mg, 1.9% S' },
      { id: 'mix_micro_quelatado', name: 'Mix Quelatado de Microelementos (Zn, B, Cu, Mn, Mo)', kgPerTon: 50, percentage: 5, contributedNutrients: '0.5% Zn, 0.3% B, 0.1% Cu, 0.3% Mn' },
    ];
    customNPKSLabel = '06-09-18 + 7.8% S + 5.7% Ca + 1.4% Mg + Micros';
    customGuarantees = { n: 6.3, p2o5: 9.1, k2o: 17.5, s: 7.8, b: 0.39, zn: 0.50, ca: 5.7, mg: 1.4 };
    customDoseKgHa = Math.round(netP2O5 / 0.091);
  } else {
    recipe = [
      { id: 'map', name: 'MAP Grânulo Uniforme (11% N, 52% P₂O₅)', kgPerTon: 500, percentage: 50, contributedNutrients: '5.5% N, 26.0% P₂O₅' },
      { id: 'kcl', name: 'KCl Granulado (60% K₂O)', kgPerTon: 300, percentage: 30, contributedNutrients: '18.0% K₂O' },
      { id: 'samonio', name: 'Sulfato de Amônio (21% N, 24% S)', kgPerTon: 150, percentage: 15, contributedNutrients: '3.1% N, 3.6% S' },
      { id: 'frits_b_zn', name: 'Fritas Silicatadas de Boro e Zinco (8% B, 12% Zn)', kgPerTon: 50, percentage: 5, contributedNutrients: '0.4% B, 0.6% Zn' },
    ];
    customNPKSLabel = '08-26-18 + 3.6% S + 0.4% B + 0.6% Zn';
    customGuarantees = { n: 8.6, p2o5: 26.0, k2o: 18.0, s: 3.6, b: 0.4, zn: 0.6, ca: 1.0, mg: 0.5 };
    customDoseKgHa = Math.round(netP2O5 / 0.26);
  }

  const customTriad = calculateUnitTriad(customDoseKgHa, spacing.rowSpacingM, spacing.plantSpacingM);

  // 6. TOP DRESSING PLAN (Plano de Cobertura Parcelado)
  const splitsCount = Math.max(1, preferences.topDressingSplits || 2);
  const splits = [];

  const kRemaining = Math.max(0, netK2O - ((commDoseKgHa * commNPK[2]) / 100));
  const nRemaining = nTopDressing;

  const totalUreaKgHa = nRemaining > 0 ? Math.round(nRemaining / 0.45) : 0;
  const totalKclKgHa = kRemaining > 0 ? Math.round(kRemaining / 0.60) : 0;
  const totalTopDressingKgHa = totalUreaKgHa + totalKclKgHa;

  if (totalTopDressingKgHa > 0) {
    const dosePerSplit = Math.round(totalTopDressingKgHa / splitsCount);
    const nPerSplit = Number((nRemaining / splitsCount).toFixed(1));
    const kPerSplit = Number((kRemaining / splitsCount).toFixed(1));

    for (let i = 1; i <= splitsCount; i++) {
      let stage = `Cobertura Parcela ${i}/${splitsCount}`;
      let guidance = 'Aplicar com solo úmido e previsão de chuva nas 24h seguintes ou fertirrigação imediata.';

      if (crop.cropId === 'milho') {
        if (i === 1) {
          stage = 'Estádio V4 (4 folhas expandidas / Início da diferenciação da espiga)';
          guidance = 'Período crítico de definição do número de fileiras de grãos por espiga. Prioridade para N e K.';
        } else if (i === 2) {
          stage = 'Estádio V7-V8 (8 folhas expandidas / Pré-pendoamento)';
          guidance = 'Definição do número de grãos por fileira e enchimento inicial.';
        }
      } else if (crop.isFruitOrPerennial) {
        if (i === 1) stage = 'Pós-poda / Florada / Chumbinho (Nov)';
        else if (i === 2) stage = 'Enchimento de frutos / Granação (Jan)';
        else if (i === 3) stage = 'Maturação e reposição pós-colheita (Mar-Abr)';
      }

      const splitTriad = calculateUnitTriad(dosePerSplit, spacing.rowSpacingM, spacing.plantSpacingM);

      splits.push({
        splitIndex: i,
        stage,
        productName: `${totalUreaKgHa > 0 ? 'Ureia Protegida com NBPT' : ''}${totalUreaKgHa > 0 && totalKclKgHa > 0 ? ' + ' : ''}${totalKclKgHa > 0 ? 'Cloreto de Potássio (KCl)' : ''}`,
        dose: splitTriad,
        nKgHa: nPerSplit,
        k2oKgHa: kPerSplit,
        sKgHa: Number((netS * 0.3).toFixed(1)),
        guidance,
      });
    }
  }

  const topDressingTriad = calculateUnitTriad(totalTopDressingKgHa, spacing.rowSpacingM, spacing.plantSpacingM);

  // 7. FOLIAR & BIOSTIMULANTS PROGRAM
  const foliarProgram = [
    {
      stage: 'Vegetativo Inicial (V3-V4)',
      products: 'Bioestimulante (Extrato de Algas Ascophyllum nodosum + Aminoácidos)',
      elements: 'Zinco (100 g/ha) + Boro (80 g/ha) + Molibdênio/Cobalto (FBN)',
      rate: '1.0 a 1.5 L/ha via pulverização foliar tratorizada',
      technicalObjective: 'Estímulo ao enraizamento vigoroso, síntese de auxinas e potencialização da nodulação biológica.',
    },
    {
      stage: 'Pré-Florescimento / Botão Floral (R1)',
      products: 'Boro Complexado com Sorbitol / Polióis + Potássio Foliar',
      elements: 'Boro (200 g/ha) + Cálcio Líquido + Mo',
      rate: '1.5 L/ha com calda estabilizada pH 5.5',
      technicalObjective: 'Garantir viabilidade do grão de pólen, pegamento de flores, redução de abortamento e firmeza de parede celular.',
    },
    {
      stage: 'Enchimento de Grãos / Frutos (R3-R5)',
      products: 'Nitrato ou Acetato de Potássio Foliar + Enxofre Micronizado',
      elements: 'K₂O Foliar (1.5 kg/ha) + Magnésio (150 g/ha)',
      rate: '2.0 a 3.0 kg/ha',
      technicalObjective: 'Manutenção da fotossíntese foliar, translocação acelerada de fotoassimilados e peso específico de grãos/frutos.',
    },
  ];

  // 8. INTEGRATED JUSTIFICATION
  const integratedJustification =
    `Recomendação nutricional de alta precisão configurada para a meta de ${yieldTarget} ${crop.yieldUnit} de ${crop.cropName}. ` +
    `Foram integrados todos os fatores químicos do solo (P-Resina/Mehlich = ${pSoil} mg/dm³, K = ${kSoil} cmolc/dm³, Argila = ${clay}%), ` +
    `os créditos da cultura anterior (${history.previousCrop.toUpperCase()} com crédito de ${nCredit} kg N/ha), o aporte da palhada (${history.strawDensity}), ` +
    `e a preferência do produtor pelo sistema '${preferences.managementSystem.replace(/_/g, ' ')}' com estratégia de '${preferences.budgetStrategy.replace(/_/g, ' ')}'. ` +
    `O plano disponibiliza tanto o formulado comercial otimizado (${chosenCommercialFormula}) quanto a receita sob medida (${customNPKSLabel}) com tríade completa de dosagem em kg/ha, g/planta e g/metro linear.`;

  const checklist = [
    `Calibrar a semeadora para aplicar exatamente ${commercialTriad.gPerLinearMeter} g/m linear (${commercialTriad.kgPerHa} kg/ha) de adubo de plantio no sulco.`,
    'Posicionar o adubo 5 cm ao lado e 5 cm abaixo da semente para evitar injúrias por contato salino.',
    crop.cropId === 'soja'
      ? 'Garantir inoculação de sementes com Bradyrhizobium no dia do plantio à sombra + Co-inoculação com Azospirillum brasilense no sulco ou semente.'
      : `Programar as ${splitsCount} aplicações de cobertura nitrogenada/potássica conforme as janelas fenológicas.`,
    'Monitorar umidade do solo antes das aplicações de cobertura e verificar uniformidade das pontas de pulverização foliar.',
  ];

  return {
    grossNutrientDemandKgHa: {
      n: Number(grossN.toFixed(1)),
      p2o5: Number(grossP2O5.toFixed(1)),
      k2o: Number(grossK2O.toFixed(1)),
      s: Number(grossS.toFixed(1)),
      ca: Number(grossCa.toFixed(1)),
      mg: Number(grossMg.toFixed(1)),
      b: Math.round(grossB),
      zn: Math.round(grossZn),
      cu: Math.round(grossCu),
      mn: Math.round(grossMn),
      mo: Math.round(grossMo),
    },
    netNutrientDemandKgHa: {
      n: Number(netN.toFixed(1)),
      p2o5: Number(netP2O5.toFixed(1)),
      k2o: Number(netK2O.toFixed(1)),
      s: Number(netS.toFixed(1)),
      ca: Number((grossCa * 0.6).toFixed(1)),
      mg: Number((grossMg * 0.6).toFixed(1)),
      b: netB,
      zn: netZn,
      cu: netCu,
      mn: netMn,
      mo: netMo,
    },
    creditsAndDiscounts: {
      previousCropNCreditKgHa: nCredit,
      organicFertilizationCredits: {
        n: orgNCredit,
        p2o5: orgP2O5Credit,
        k2o: orgK2OCredit,
        s: orgSCredit,
      },
      strawNImmobilizationPenaltyKgHa: nPenalty,
      soilBaseSupplyingPower: {
        p2o5: Number((grossP2O5 - netP2O5).toFixed(1)),
        k2o: Number((grossK2O - netK2O).toFixed(1)),
        s: Number((grossS - netS).toFixed(1)),
      },
      bioASAdjustmentFactor: bioASFactor,
      historySummary,
    },
    suggestedCommercialBlend: {
      name: `Formulado Comercial Recomendado: ${chosenCommercialFormula}`,
      formula: chosenCommercialFormula,
      npkGrade: commNPK,
      dose: commercialTriad,
      nutrientsSuppliedKgHa: {
        n: Number(((commDoseKgHa * commNPK[0]) / 100).toFixed(1)),
        p2o5: Number(((commDoseKgHa * commNPK[1]) / 100).toFixed(1)),
        k2o: Number(((commDoseKgHa * commNPK[2]) / 100).toFixed(1)),
        s: Number((commDoseKgHa * 0.04).toFixed(1)),
      },
      placement,
      splitWarning,
    },
    tailoredCustomBlend: {
      name: `Mistura Sob Medida de Alta Eficiência (FertPro Blend #1)`,
      customFormulaNPKS: customNPKSLabel,
      guarantees: customGuarantees,
      rawMaterialsRecipeKgPerTon: recipe,
      recommendedDose: customTriad,
      salinityIndex: 38,
      advantages: [
        'Concentração de P₂O₅ e K₂O perfeitamente casada com a análise de solo, evitando sobras ou faltas.',
        'Presença de Enxofre elementar + sulfato para liberação gradual e imediata ao longo do ciclo.',
        'Micronutrientes quelatados incorporados homogeneamente para evitar segregação no depósito da semeadora.',
        'Economia operacional por menor número de paradas de abastecimento em campo.',
      ],
    },
    topDressingPlan: {
      totalTopDressingDoseKgHa: totalTopDressingKgHa,
      totalTopDressingTriad: topDressingTriad,
      splits,
    },
    foliarAndBiostimulants: foliarProgram,
    integratedJustification,
    fieldActionChecklist: checklist,
  };
}

/**
 * MASTER ORCHESTRATOR: GENERATES COMPLETE PERSONALIZED RECOMMENDATION
 */
export function generatePersonalizedRecommendation(
  soil: SoilAnalysisExtended | SoilSample,
  subsoil: SoilAnalysisExtended | SoilSample | undefined,
  plot: FieldPlot | undefined,
  cropTarget: PersonalizedCropTarget,
  history: FarmPlotHistory = DEFAULT_FARM_PLOT_HISTORY,
  preferences: ProducerPreferences = DEFAULT_PRODUCER_PREFERENCES
): PersonalizedRecommendationOutput {
  // Spacing and Population calculation
  const rowSpacing = plot?.spacingBetweenRowsMeters || (cropTarget.isFruitOrPerennial ? 3.0 : 0.45);
  const plantSpacing = plot?.spacingBetweenPlantsMeters || (cropTarget.isFruitOrPerennial ? 0.75 : 0.08);
  const linearMetersPerHa = rowSpacing > 0 ? 10000 / rowSpacing : 22222;
  const plantPop = (rowSpacing > 0 && plantSpacing > 0) ? Math.round(10000 / (rowSpacing * plantSpacing)) : 250000;
  const plantsPerMeter = rowSpacing > 0 && plantPop > 0 ? Number(((plantPop * rowSpacing) / 10000).toFixed(1)) : 12;

  const spacing: SpacingParameters = {
    rowSpacingM: rowSpacing,
    plantSpacingM: plantSpacing,
    plantsPerMeter,
    linearMetersPerHa: Math.round(linearMetersPerHa),
    plantPopulationHa: plantPop,
  };

  const liming = calculatePersonalizedLiming(soil, cropTarget, history, preferences, spacing);
  const gypsum = calculatePersonalizedGypsum(soil, subsoil, cropTarget, history, preferences, spacing);
  const fertilization = calculatePersonalizedFertilizationAndBlends(soil, cropTarget, history, preferences, spacing);

  const summary = [
    `🎯 Meta Produtiva: ${cropTarget.targetYield} ${cropTarget.yieldUnit} de ${cropTarget.cropName} em Sistema de ${preferences.managementSystem.replace(/_/g, ' ')}.`,
    `⚖️ Calagem: ${liming.needed ? `${liming.doseTonsHa} t/ha (${liming.dose.kgPerHa} kg/ha | ${liming.dose.gPerLinearMeter} g/m) de ${liming.recommendedCorrective}` : 'Solo já corrigido (V% adequado).'}.`,
    `⛏️ Gessagem: ${gypsum.needed ? `${gypsum.doseKgHa} kg/ha (${gypsum.dose.gPerLinearMeter} g/m | ${gypsum.dose.gPerPlant} g/planta) para descompactação química e cálcio em profundidade` : 'Desnecessária no ciclo atual.'}.`,
    `🌱 Adubação de Plantio: ${fertilization.suggestedCommercialBlend.dose.kgPerHa} kg/ha (${fertilization.suggestedCommercialBlend.dose.gPerLinearMeter} g/m) de ${fertilization.suggestedCommercialBlend.formula}.`,
    `📦 Opção Sob Medida (Big Bag): ${fertilization.tailoredCustomBlend.recommendedDose.kgPerHa} kg/ha (${fertilization.tailoredCustomBlend.recommendedDose.gPerLinearMeter} g/m) da fórmula sob medida [${fertilization.tailoredCustomBlend.customFormulaNPKS}].`,
    `🚜 Coberturas: ${fertilization.topDressingPlan?.totalTopDressingDoseKgHa > 0 ? `${fertilization.topDressingPlan.totalTopDressingDoseKgHa} kg/ha parcelados em ${(fertilization.topDressingPlan.splits || []).length} aplicações fenológicas` : 'Fixação Biológica de Nitrogênio integral (sem adubo de cobertura nitrogenado)'}.`,
  ];

  return {
    id: `rec-pers-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    crop: cropTarget,
    plotName: plot?.name || (soil as any).plotName || 'Talhão Principal',
    spacing,
    preferences,
    history,
    liming,
    gypsum,
    fertilization,
    executiveSummary: summary,
  };
}
