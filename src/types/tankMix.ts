export type AgrochemicalClass =
  | 'herbicida'
  | 'fungicida'
  | 'inseticida'
  | 'acaricida'
  | 'regulador_crescimento'
  | 'adjuvante'
  | 'fertilizante_foliar'
  | 'biologico'
  | 'condicionador_calda';

export type PesticideFormulationCode =
  | 'EC' // Concentrado Emulsionável
  | 'SC' // Suspensão Concentrada
  | 'WG' // Grânulos Dispersíveis em Água
  | 'WP' // Pó Molhável
  | 'SL' // Concentrado Solúvel
  | 'OD' // Dispersão em Óleo
  | 'SE' // Suspo-Emulsão
  | 'CS' // Suspensão de Encapsulado
  | 'ME' // Microemulsão
  | 'EW' // Emulsão Óleo em Água
  | 'FS' // Suspensão Concentrada para TS
  | 'SP' // Pó Solúvel
  | 'ZC' // Mistura CS + SC
  | 'SG' // Grânulos Solúveis em Água
  | 'DF' // Grânulos Secos (Dry Flowable)
  | 'DC' // Concentrado Dispersível
  | 'AS' // Solução Aquosa
  | 'WSB' // Bolsa Hidrossolúvel
  | 'EO'; // Emulsão Água em Óleo

export type CompatibilityRating =
  | 'compativel' // 🟢 Compatibilidade elevada
  | 'compativel_restricoes' // 🟡 Compatibilidade aceitável com cuidados
  | 'restricao_severa' // 🟠 Mistura com restrições
  | 'incompativel'; // 🔴 Mistura não recomendada

export type IncompatibilityType =
  | 'fisica' // Precipitação, separação de fases, nata, "queijo", aumento de viscosidade, espuma
  | 'quimica' // Hidrólise ácida/alcalina, complexação catiônica, degradação do ativo
  | 'biologica_antagonismo' // Redução de controle biológico, antagonismo de espectro
  | 'fitotoxicidade'; // Queima foliar, injúria na cultura

export interface FormulationInfo {
  code: PesticideFormulationCode;
  fullName: string;
  description: string;
  waterBehavior: string;
  mixingOrderIndex: number; // Order index in WALES / DAMES
  mixingOrderGroup:
    | 'Bolsas Hidrossolúveis (WSB)'
    | 'Sólidos (WP/WG/DF)'
    | 'Sólidos Solúveis (SP/SG)'
    | 'Suspensões (SC/FS/OD/CS/ZC/SE)'
    | 'Soluções (SL/AS/DC)'
    | 'Emulsões (EC/EW/ME/EO)'
    | 'Adjuvantes'
    | 'Condicionadores'
    | 'Fertilizantes Foliares'
    | string;
  advantages: string[];
  precautions: string[];
  recommendedAgitation: 'Baixa' | 'Média' | 'Alta e Contínua';
  filterMeshRecommendation?: string;
  carrierCompatibilityNotes?: string;
}

export interface TankMixProduct {
  id: string;
  commercialName: string;
  activeIngredient: string;
  concentration: string;
  formulation: PesticideFormulationCode;
  agrochemicalClass: AgrochemicalClass;
  chemicalGroup: string;
  actionMechanism: string; // Ex: HRAC A, FRAC 11, IRAC 4A
  manufacturer: string;
  mapaRegistration: string;
  defaultDose: number;
  doseUnit: 'L/ha' | 'kg/ha' | 'mL/ha' | 'g/ha' | 'mL/100L' | 'L/100L';
  targetPests: string[];
  registeredCrops: string[];
  optimalPhRange: { min: number; max: number };
  hydrolysisRiskHighPh: boolean; // Quebra em pH > 7.0
  cationBindingRisk: boolean; // Complexa com Ca/Mg/Fe
  mixingOrderStep: number;
  safetyIntervalDays: number; // Intervalo de reentrada / carência
  toxicologicalClass: 'I - Extremamente Tóxico' | 'II - Altamente Tóxico' | 'III - Moderadamente Tóxico' | 'IV - Pouco Tóxico' | 'V - Improvável Dano Agudo';
  environmentalHazard: 'I - Altamente Perigoso' | 'II - Muito Perigoso' | 'III - Perigoso' | 'IV - Pouco Perigoso';
  packagingPhotoUrl?: string;
  leafletNotes: string;
  ppeRequired: string[]; // EPIs recomendados
}

export interface CompatibilityRule {
  id: string;
  productAId?: string;
  productBId?: string;
  classA?: AgrochemicalClass | PesticideFormulationCode;
  classB?: AgrochemicalClass | PesticideFormulationCode;
  aiA?: string;
  aiB?: string;
  rating: CompatibilityRating;
  incompatibilityType?: IncompatibilityType;
  issueSummary: string;
  technicalDetails: string;
  precipitateRisk: boolean;
  phaseSeparationRisk: boolean;
  foamRisk: boolean;
  cloggingRiskLevel: 'Nenhum' | 'Baixo' | 'Médio' | 'Crítico (Bicos e Filtros 50/100 mesh)';
  recommendedAction: string;
  jarTestRequired: boolean;
  scientificReference: string;
}

export interface WaterQualityParameters {
  ph: number; // 3.0 to 10.0
  electricalConductivityUsCm: number; // uS/cm
  hardnessMgL: number; // mg/L CaCO3
  alkalinityMgL: number; // mg/L CaCO3
  temperatureC: number;
  calciumMgL: number;
  magnesiumMgL: number;
  ironMgL: number;
  manganeseMgL: number;
  bicarbonatesMgL: number;
  classification?: 'Muito Mole' | 'Mole' | 'Média' | 'Dura' | 'Muito Dura';
}

export interface TankSelectedProduct {
  productId?: string;
  product?: TankMixProduct;
  dose: number;
  doseUnit: 'L/ha' | 'kg/ha' | 'mL/ha' | 'g/ha' | 'mL/100L' | 'L/100L' | string;
  additionOrder?: number;
}

export interface TankMixEvaluationIssue {
  id: string;
  summary: string;
  details: string;
  recommendedAction: string;
}

export interface TankMixEvaluationResult {
  loadedProducts: { product: TankMixProduct; dose: number; doseUnit: string }[];
  detectedRules: CompatibilityRule[];
  activeAlerts: string[];
  worstRating: CompatibilityRating;
  rating?: CompatibilityRating;
  icgScore: number;
  sortedByMixingOrder: { product: TankMixProduct; dose: number; doseUnit: string }[];
  recommendedMixingOrder?: { stepNumber: number; stepName: string; instructions: string }[];
  issues?: TankMixEvaluationIssue[];
  jarTestRequired: boolean;
  totalHectaresPerTank: number;
}

export interface SprayerEquipment {
  id: string;
  name: string;
  type: 'costal' | 'barra_tratorizada' | 'autopropelido' | 'turbo_atomizador' | 'drone';
  tankCapacityLiters: number;
  boomWidthMeters: number;
  nozzleType: string;
  nozzleSpacingCm: number;
  operatingPressureBar: number;
  operatingSpeedKmH: number;
  nozzleFlowRateLMin: number;
  applicationRateLHa: number; // L/ha
  filterMesh: number; // Ex: 50, 80, 100
}

export interface WeatherCondition {
  temperatureC: number;
  relativeHumidityPct: number;
  windSpeedKmH: number;
  rainForecastHours: number; // Horas até chuva
  deltaT: number; // Delta T calculado em °C
  applicationWindowStatus: 'ideal' | 'aceitavel' | 'desfavoravel' | 'critica_inadequada';
  windowNotes: string;
}

export interface SprayApplicationRecord {
  id: string;
  farmId: string;
  farmName: string;
  plotId: string;
  plotName: string;
  crop: string;
  cultivar: string;
  areaHa: number;
  growthStage: string; // V4, R1, etc.
  date: string;
  startTime: string;
  endTime: string;
  operatorName: string;
  equipmentId: string;
  equipmentName: string;
  nozzleModel: string;
  totalSprayVolumeLHa: number;
  totalTankVolumeL: number;
  tankLoadsCount: number;
  productsUsed: {
    productId: string;
    productName: string;
    formulation: string;
    class: string;
    dosePerHa: number;
    doseUnit: string;
    totalAmountUsed: number;
    amountUnit: string;
  }[];
  waterPh: number;
  waterHardnessMgL: number;
  weather: WeatherCondition;
  icgScore: number;
  icgRating: CompatibilityRating;
  detectedAlerts: string[];
  mixingOrderFollowed: boolean;
  jarTestConducted: boolean;
  safetyIntervalDays: number;
  reentryDate: string;
  harvestSafetyDate: string;
  epiChecklistOk: boolean;
  tripleRinseDone: boolean;
  notes: string;
  photos: string[];
  createdAt: string;
}

export interface JarTestStep {
  stepNumber: number;
  title: string;
  description: string;
  proportionFormula: string;
  waitTimeMinutes: number;
  observationCheckpoints: string[];
}
