export type CropType =
  | 'soja'
  | 'milho'
  | 'algodao'
  | 'feijao'
  | 'cafe'
  | 'cana'
  | 'trigo'
  | 'hortalicas';

export type CultivationSystem = 'plantio_direto' | 'convencional' | 'cultivo_minimo' | 'organico';
export type SoilTextureType = 'argiloso' | 'medio_franco' | 'arenoso';
export type IrrigationType = 'sequeiro' | 'pivo_central' | 'gotejamento' | 'aspersao_convencional';

export type IDCStatus = 'dentro_do_esperado' | 'ligeiramente_atrasado' | 'comprometido' | 'critico';

export interface PhenologicalStage {
  id: string; // Ex: 'soja_V4'
  code: string; // Ex: 'V4'
  name: string; // Ex: 'Quarto Nó / Quatro Folhas Trifolioladas'
  category: 'vegetativo' | 'reprodutivo' | 'maturacao';
  dapRange: [number, number]; // Ex: [24, 30] dias após plantio
  gddAccumulatedNeeded: number; // Graus-dia acumulados necessários
  description: string;
  expectedCharacteristics: {
    plantHeightCm: [number, number];
    rootDepthCm: [number, number];
    leafAreaIndex: number; // IAF
    nodesCount?: number;
    mainEvents: string[];
  };
  waterDemand: {
    kc: number;
    dailyConsumptionMm: [number, number];
    waterStressSensitivity: 'baixa' | 'moderada' | 'alta' | 'critica maxima';
    waterloggingRisk: string;
    irrigationRecommendation: string;
  };
  nutrition: {
    mostDemandedNutrients: string[];
    absorptionRateKgHa: Record<string, number>; // Ex: { N: 3.2, K2O: 2.8, P2O5: 0.6 } kg/ha/dia
    criticalDeficiencySymptoms: string[];
    excessSymptoms: string[];
  };
  sanitaryThreats: {
    frequentPests: string[];
    frequentDiseases: string[];
  };
  management: {
    recommendedOperations: string[];
    strictlyForbiddenOperations: string[];
  };
}

export interface CropDigitalTwin {
  id: string;
  farmId: string;
  farmName: string;
  plotId: string;
  plotName: string;
  plotAreaHa: number;
  crop: CropType;
  cropName: string;
  cultivarName: string; // Ex: 'TMG 2383 IPRO'
  cycleDays: number; // Ex: 115 dias
  plantingDate: string; // YYYY-MM-DD
  emergenceDate: string;
  spacingMeters: number; // Ex: 0.45 m
  plantPopulationPerHa: number; // Ex: 260000 plantas/ha
  cultivationSystem: CultivationSystem;
  soilTexture: SoilTextureType;
  irrigationType: IrrigationType;
  currentDap: number; // Dias após o plantio atual
  currentStageId: string;
  currentStageCode: string;
  currentStageName: string;
  cycleProgressPercent: number;
  expectedHarvestDate: string;
  accumulatedGdd: number; // Graus-dia acumulados
  targetGdd: number;
  idcScore: number; // 0 a 100
  idcStatus: IDCStatus;
  nextStageCode: string;
  daysToNextStage: number;
  limitingFactors: string[];
  notes?: string;
}

export interface GrowthCurvePoint {
  dap: number;
  stageCode: string;
  plantHeightCm: number;
  rootDepthCm: number;
  leafAreaIndex: number; // IAF
  dryMassKgHa: number;
}

export interface FieldPhotoRecord {
  id: string;
  twinId: string;
  plotName: string;
  stageCode: string;
  dap: number;
  date: string;
  photoUrl: string;
  caption: string;
  healthStatus: 'saudavel' | 'atencao' | 'sintoma_detectado';
  observedBy: string;
}

export interface TechnicalScheduleItem {
  id: string;
  twinId: string;
  plotName: string;
  targetStageCode: string;
  targetDap: number;
  scheduledDate: string;
  operationType:
    | 'monitoramento_mip'
    | 'adubacao_cobertura'
    | 'aplicacao_fitossanitaria'
    | 'irrigacao_estrategica'
    | 'diagnose_foliar'
    | 'dessecacao_colheita';
  title: string;
  description: string;
  status: 'pendente' | 'em_andamento' | 'concluido' | 'atrasado';
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
}
