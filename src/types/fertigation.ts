export type FertilizerGroup =
  | 'nitrogenados'
  | 'fosfatados'
  | 'potassicos'
  | 'calcio'
  | 'magnesio'
  | 'enxofre'
  | 'micronutrientes_quelatos'
  | 'micronutrientes_sais'
  | 'acidos';

export type NutrientType = 'macro' | 'micro' | 'corretivo';

export type CompatibilityStatus = 'compativel' | 'compativel_com_restricao' | 'incompativel';

export type CompatibilityReactionType =
  | 'precipitacao'
  | 'desestabilizacao_quelato'
  | 'exotermica'
  | 'liberacao_gases'
  | 'acidificacao_severa'
  | 'salting_out'
  | 'nenhuma';

export type TemperatureSensitivity = 'alta' | 'moderada' | 'baixa' | 'estavel';
export type CloggingRiskLevel = 'nenhum' | 'baixo' | 'medio' | 'alto' | 'critico';
export type EcImpactRating = 'baixo' | 'moderado' | 'alto' | 'muito_alto';

export interface SolubilityCurvePoint {
  tempCelsius: number;
  solubilityGramsPerLiter: number;
}

export interface FertilizerItem {
  id: string;
  name: string;
  commercialName: string;
  chemicalName: string;
  formula: string;
  group: FertilizerGroup;
  nutrientType: NutrientType;
  guaranteedNutrients: Record<string, number>; // Ex: { N: 15.5, Ca: 19.0, K2O: 0 }
  solubilityAt20C_gL: number; // Solubilidade em g/L a 20°C
  solubilityCurve: SolubilityCurvePoint[]; // Curva 0C a 40C
  densityGramsCm3: number;
  saltIndex: number; // Índice salino (base NaNO3 = 100)
  solutionPh10Percent: number; // pH de solução a 10%
  estimatedCeMsPerCmAt1gL: number; // CE a 1 g/L (mS/cm)
  purityPercent: number;
  molecularWeightGmol: number;
  color: string;
  physicalState: 'cristalino' | 'po' | 'granulado' | 'liquido';
  defaultTank: 'Tanque A' | 'Tanque B' | 'Tanque C (Ácidos)';
  description: string;
  plantFunction: string;
  deficiencySymptoms: string;
  excessSymptoms: string;
  storageAndSafety: string;
  prohibitedMixNotes?: string;
}

export interface CompatibilityPairRule {
  fertIdA: string;
  fertIdB: string;
  status: CompatibilityStatus;
  technicalReason: string;
  reactionType: CompatibilityReactionType;
  precipitateFormed?: string;
  chemicalEquation?: string;
  ionsInvolved: string[];
  phRangeSafe: string;
  phCriticalRisk?: string;
  maxCombinedConcentrationGramsPerLiter?: number;
  maxConcentrationNote?: string;
  temperatureSensitivity: TemperatureSensitivity;
  temperatureEffect: string;
  cloggingRisk: CloggingRiskLevel;
  cloggingMechanism: string;
  dripperImpactPercent: number;
  mixingOrderRule: string;
  jarTestProtocol: string;
  remediationProtocol: string;
  ecImpactRating: EcImpactRating;
  ecIncreaseEstimate: string;
  agronomicRecommendation: string;
}

export interface VirtualTankFertilizerItem {
  fertilizerId: string;
  fertilizer: FertilizerItem;
  gramsPerLiter: number;
  totalKgInTank: number;
  dissolutionStatus: 'dissolvido' | 'saturado' | 'precipitando';
}

export interface WaterQualityProfile {
  id: string;
  name: string;
  ph: number;
  ceMicroSiemens: number; // µS/cm
  temperatureC: number;
  totalHardnessMgCaCO3: number; // mg/L de CaCO3
  bicarbonatesHco3MgL: number; // mg/L de HCO3-
  carbonatesCo3MgL: number; // mg/L de CO3(2-)
  calciumMgL: number;
  magnesiumMgL: number;
  sodiumMgL: number;
  chloridesMgL: number;
  sulfatesMgL: number;
  ironMgL: number;
  manganeseMgL: number;
  sar: number; // Razão de Adsorção de Sódio
  cloggingRisk: 'baixo' | 'moderado' | 'severo';
  acidRequirementMlPerM3: number; // ml de Ácido Fosfórico/Nítrico para neutralizar bicarbonatos
}

export interface FertigationRecipe {
  id: string;
  name: string;
  crop: string;
  phenologicalStage: string;
  tankVolumeLiters: number;
  waterQualityProfileId: string;
  tankAFertilizers: { fertilizerId: string; doseKg: number }[];
  tankBFertilizers: { fertilizerId: string; doseKg: number }[];
  tankCConcentratedAcid?: { fertilizerId: string; doseLiters: number };
  targetNutrientsPpm: Record<string, number>;
  targetCeMsCm: number;
  targetPh: number;
  notes: string;
  safetyStatus: 'segura' | 'atencao' | 'nao_recomendada';
}
