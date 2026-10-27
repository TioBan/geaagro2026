export type RecommendationTab =
  | 'dashboard'
  | 'mapeamento_talhao'
  | 'mapeamento'
  | 'cadastro_analise'
  | 'nutriinterpretacao'
  | 'curvas_calibracao'
  | 'calagem'
  | 'gessagem'
  | 'adubacao_organica'
  | 'adubacao_plantio'
  | 'calculadora_populacao'
  | 'adubacao_cobertura'
  | 'fertirrigacao'
  | 'curvas_absorcao'
  | 'banco_fertilizantes'
  | 'mistura_fertilizantes'
  | 'recomendacoes_personalizadas'
  | 'simulador_cenarios'
  | 'gemeo_digital_solo'
  | 'mapas_fertilidade'
  | 'relatorio_laudo';

export interface SoilAnalysisExtended {
  id: string;
  sampleCode: string;
  laboratoryName: string;
  analysisDate: string;
  depth: '0-20' | '20-40' | '0-10' | '10-20' | '40-60';
  plotId: string;
  plotName: string;
  cropName: string;
  cultivar: string;
  expectedYield: number; // t/ha or sc/ha
  yieldUnit: string;
  latitude?: number;
  longitude?: number;

  // Atributos Químicos
  phCacl2: number;
  phH2o: number;
  phSmp: number;
  organicMatterGKg: number; // g/dm³
  organicCarbonGKg: number;
  pMehlich1: number; // mg/dm³
  pMehlich3?: number;
  pResina: number; // mg/dm³
  pRemanescente?: number; // mg/L
  pRemanescente3?: number; // Remanescente 3 (mg/L)
  kCmolc: number; // cmol_c/dm³
  kMgDm3: number; // mg/dm³
  caCmolc: number;
  mgCmolc: number;
  naCmolc: number;
  alCmolc: number;
  hAlCmolc: number;
  sSulfurMgDm3: number;
  bBoroMgDm3: number;
  cuCobreMgDm3: number;
  feFerroMgDm3: number;
  mnManganesMgDm3: number;
  znZincoMgDm3: number;
  moMolibdenioMgDm3?: number;
  coCobaltoMgDm3?: number;
  niNiquelMgDm3?: number;
  seSelenioMgDm3?: number;
  siSilicioMgDm3?: number;
  clCloroMgDm3?: number;

  // Atributos Físicos
  clayPercent: number; // %
  siltPercent: number;
  sandPercent: number;
  texturalClass: string;
  soilDensityGcm3: number;
  penetrationResistanceMpa?: number;

  // Atributos Biológicos (BioAS - EMBRAPA)
  microbialBiomassCarbonMgKg?: number;
  basalRespirationMgC?: number;
  betaGlucosidaseActivity?: number; // µmol pNP/g solo/h
  acidPhosphataseActivity?: number;
  arylsulfataseActivity?: number;

  // Indicadores Calculados
  sumOfBases: number; // SB
  effectiveCtc: number; // CTC(t)
  potentialCtc: number; // CTC(T) pH 7.0
  baseSaturationPercent: number; // V%
  aluminumSaturationPercent: number; // m%
  caMgRatio: number;
  caKRatio: number;
  mgKRatio: number;
  caMgKRatio: number; // (Ca+Mg)/K
  igfScore: number; // Índice GeaAgro de Fertilidade (0 a 100)
}

export interface OrganicFertilizerItem {
  id: string;
  name: string;
  category: 'esterco' | 'composto' | 'biofertilizante' | 'industrial' | 'personalizado';
  moisturePercent: number;
  nPercent: number;
  p2o5Percent: number;
  k2oPercent: number;
  caPercent: number;
  mgPercent: number;
  sPercent: number;
  cNRatio: number;
  mineralizationRateYear1: number; // % liberado ano 1 (ex: 50%)
  costPerTonR: number;
  defaultDoseTonHa?: number;
}

export interface MineralFertilizerItem {
  id: string;
  name: string;
  type: 'simples' | 'formulado_npk' | 'micronutriente' | 'personalizado';
  formula: string;
  n: number;
  p2o5: number;
  k2o: number;
  s: number;
  ca: number;
  mg: number;
  b: number;
  zn: number;
  cu: number;
  mn: number;
  mo: number;
  saltIndex: number;
  solubilityGPerL: number;
  pricePerTonR: number;
}

export interface AbsorptionCurvePoint {
  dae: number; // Dias após emergência
  phenologicalStage: string;
  percentN: number;
  percentP2O5: number;
  percentK2O: number;
  percentCa: number;
  percentMg: number;
  percentS: number;
}

export interface CropAbsorptionCurve {
  cropId: string;
  cropName: string;
  cycleDays: number;
  criticalAbsorptionPeriod: string;
  points: AbsorptionCurvePoint[];
}

export interface ScenarioRecommendation {
  id: string;
  title: string;
  description: string;
  yieldTarget: number;
  limingTonHa: number;
  gypsumTonHa: number;
  organicDoseTonHa: number;
  organicFertilizerName: string;
  plantingFormula: string;
  plantingDoseKgHa: number;
  topdressingNTotalKgHa: number;
  topdressingSplits: { stage: string; doseKgHa: number; source: string }[];
  totalCostRPerHa: number;
  estimatedROI: number; // % retorno
  sustainabilityIndex: number; // 0-100
}

export interface CropPlantingRecommendation {
  cropId: string;
  cropName: string;
  scientificName?: string;
  recommendedFormulationId: string;
  defaultPlantingDoseKgHa: number;
  expectedYieldDefault: number;
  yieldUnit: string;
  demandsKgPerHa: {
    n: number;
    p2o5: number;
    k2o: number;
    ca?: number; // kg/ha
    mg?: number; // kg/ha
    s?: number;  // kg/ha
    b?: number;  // g/ha
    cu?: number; // g/ha
    fe?: number; // g/ha
    mn?: number; // g/ha
    mo?: number; // g/ha
    zn?: number; // g/ha
  };
  bulletinReference?: string;
  defaultSpacing?: {
    rowSpacingM: number;
    plantsPerMeter?: number;
    plantSpacingM?: number;
  };
  observation: string;
}
