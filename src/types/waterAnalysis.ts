export type WaterPurpose =
  | 'consumo_humano'
  | 'irrigacao'
  | 'fertirrigacao'
  | 'hidroponia'
  | 'pulverizacao'
  | 'bovinocultura'
  | 'avicultura'
  | 'suinocultura'
  | 'piscicultura'
  | 'viveiros_mudas';

export type CollectionPointType =
  | 'poco_artesiano'
  | 'poco_semiartesiano'
  | 'rio'
  | 'lago'
  | 'represa'
  | 'acude'
  | 'nascente'
  | 'cisterna'
  | 'rede_publica'
  | 'reservatorio'
  | 'canal_irrigacao'
  | 'outro';

export type IGARange = 'excelente' | 'muito_boa' | 'boa' | 'regular' | 'restrita' | 'inadequada';

export interface CollectionPoint {
  id: string;
  name: string;
  code: string;
  type: CollectionPointType;
  propertyName: string;
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  notes?: string;
}

export interface WaterPhysicalParams {
  waterTempCelsius: number;
  colorPtCo: number; // Unidades Pt-Co (mg/L Pt)
  turbidityNtu: number; // NTU
  electricalConductivityMicroS: number; // µS/cm
  salinityPpt: number; // ‰ ou g/L
  totalDissolvedSolidsMgL: number; // TDS em mg/L
  totalSuspendedSolidsMgL: number; // SST em mg/L
  odor: 'inodoro' | 'caracteristico' | 'sulfuroso' | 'objetavel';
  taste: 'insipido' | 'salobro' | 'metalico' | 'objetavel';
}

export interface WaterChemicalParams {
  ph: number;
  totalAlkalinityMgCaCO3: number;
  totalHardnessMgCaCO3: number;
  carbonatesCo3MgL: number;
  bicarbonatesHco3MgL: number;
  chloridesClMgL: number;
  sulfatesSo4MgL: number;
  nitrateNo3MgL: number;
  nitriteNo2MgL: number;
  ammoniumNh4MgL: number;
  totalNitrogenMgL: number;
  phosphorusPMgL: number;
  potassiumKMgL: number;
  calciumCaMgL: number;
  magnesiumMgL: number;
  sodiumNaMgL: number;
  ironFeMgL: number;
  manganeseMnMgL: number;
  zincZnMgL: number;
  copperCuMgL: number;
  aluminumAlMgL: number;
  boronBMgL: number;
  residualChlorineMgL: number;
  fluorideFMgL: number;
  dissolvedOxygenMgL: number;
  bod5MgL: number; // DBO5
  codMgL: number; // DQO
}

export interface WaterHeavyMetals {
  arsenicAsMgL: number;
  cadmiumCdMgL: number;
  leadPbMgL: number;
  totalChromiumCrMgL: number;
  mercuryHgMgL: number;
  nickelNiMgL: number;
  seleniumSeMgL: number;
}

export interface WaterBiologicalParams {
  totalColiformsNmp100ml: number; // NMP/100 mL
  escherichiaColiNmp100ml: number;
  enterococciNmp100ml: number;
  salmonellaPresent: boolean;
  cyanobacteriaCellsMl: number;
  algaeDetected: boolean;
}

export interface WaterCalculatedIndices {
  sar: number; // Relação de Adsorção de Sódio
  rscMeqL: number; // Carbonato Residual de Sódio em meq/L
  sodiumPercentage: number; // % Na
  salinityClass: 'C1' | 'C2' | 'C3' | 'C4'; // USSL
  sodicityClass: 'S1' | 'S2' | 'S3' | 'S4'; // USSL
  infiltrationRisk: 'sem_restricao' | 'restricao_moderada' | 'restricao_severa';
  langelierIndex: number; // ISL
  langelierInterpretation: 'corrosiva' | 'balanceada' | 'incrustante';
  emitterCloggingRisk: 'baixo' | 'moderado' | 'alto' | 'severo';
  igaScore: number; // 0 a 100
  igaClassification: IGARange;
}

export interface WaterCorrectionPlan {
  diagnosedProblems: string[];
  riskLevel: 'baixo' | 'moderado' | 'alto' | 'critico';
  expectedImpacts: string[];
  treatmentRecommendations: {
    technology: string;
    description: string;
    dosageOrSpec?: string;
  }[];
  managementRecommendations: string[];
  monitoringFrequencyDays: number;
  simulatedAfterTreatment: {
    expectedPh: number;
    expectedCe: number;
    expectedTurbidity: number;
    expectedBicarbonates: number;
    expectedColiforms: number;
    expectedEmitterRisk: string;
    expectedIgaScore: number;
  };
}

export interface WaterAnalysisRecord {
  id: string;
  sampleCode: string;
  collectionDate: string;
  collectionTime: string;
  responsibleTechnician: string;
  creaCrq: string;
  clientName: string;
  propertyName: string;
  collectionPointId: string;
  purposes: WaterPurpose[];
  referenceStandard: 'FAO_29' | 'MS_888' | 'CONAMA_357' | 'HIDROPONIA_PRO';
  physical: WaterPhysicalParams;
  chemical: WaterChemicalParams;
  heavyMetals: WaterHeavyMetals;
  biological: WaterBiologicalParams;
  calculated: WaterCalculatedIndices;
  correctionPlan: WaterCorrectionPlan;
  technicalNotes: string;
  status: 'concluido' | 'em_analise';
}

export type CropCategory =
  | 'graos'
  | 'hortalicas'
  | 'frutiferas'
  | 'pastagens'
  | 'industriais'
  | 'florestais'
  | 'ornamentais'
  | 'medicinais'
  | 'outros';

export interface CropSalinityTolerance {
  cropName: string;
  scientificName?: string;
  category: CropCategory;
  sensitivityRating: 'sensivel' | 'moderadamente_sensivel' | 'moderadamente_tolerante' | 'tolerante';
  thresholdEcDeciSiemensM: number; // CE linear de início de perda de produtividade
  yieldLossPercentPerUnitEc: number; // % perda por dS/m acima do limiar
  maxBoronMgL: number;
  sodiumToleranceRating: 'baixa' | 'moderada' | 'alta';
  specialRecommendations: string;
}

export type ConamaClassLevel = 'classe_1' | 'classe_2' | 'classe_3';
export type ComplianceStatus = 'conforme' | 'atencao' | 'inconforme';

export interface ConamaParameterRule {
  id: string;
  name: string;
  category: 'microbiologico' | 'fisico' | 'quimico_inorganico' | 'metais_pesados';
  unit: string;
  limitClass1: number | string;
  limitClass2: number | string;
  limitClass3: number | string;
  comparison: '<=' | '>=' | 'range' | 'presence';
  minVal?: number;
  maxVal1?: number;
  maxVal2?: number;
  maxVal3?: number;
  descriptionForIrrigation: string;
}

export interface ConamaEvaluationResult {
  parameterId: string;
  parameterName: string;
  category: 'microbiologico' | 'fisico' | 'quimico_inorganico' | 'metais_pesados';
  unit: string;
  measuredValue: number | string | boolean;
  statusClass1: ComplianceStatus;
  statusClass2: ComplianceStatus;
  statusClass3: ComplianceStatus;
  limitClass1Text: string;
  limitClass2Text: string;
  limitClass3Text: string;
  notes: string;
}

export type FaoRestrictionLevel = 'nenhuma' | 'moderada' | 'severa';

export interface Fao29ParameterEvaluation {
  id: string;
  parameterName: string;
  category: 'salinidade' | 'infiltracao' | 'toxicidade_especifica' | 'efeitos_diversos' | 'obstrucao_gotejo';
  measuredValue: number | string;
  unit: string;
  restrictionLevel: FaoRestrictionLevel;
  noneRangeText: string;
  slightToModerateRangeText: string;
  severeRangeText: string;
  agronomicImpact: string;
  managementTip: string;
}

export interface FertigationNutrientCredit {
  nutrient: string;
  chemicalSymbol: string;
  waterConcentrationMgL: number;
  appliedKgPer1000M3: number; // 1.000 m³ = 100 mm em 1 ha ou 1.000.000 L
  appliedKgPerHectareAtDepth: number; // baseado na lâmina informada
  equivalentFertilizer: string;
  fertilizerSavingsKgPerHa: number;
}

export interface AcidNeutralizationRequirement {
  acidType: 'acido_fosforico_85' | 'acido_nitrico_58' | 'acido_sulfurico_98' | 'acido_citrico';
  acidName: string;
  commercialConcentration: string;
  requiredDoseMlPerM3: number;
  suppliedNutrientPerM3: {
    nutrient: string;
    amountGrams: number;
  };
  safetyWarning: string;
}

