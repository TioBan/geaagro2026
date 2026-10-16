export type PhenologicalStage =
  | 'emergencia'
  | 'vegetativo'
  | 'florescimento'
  | 'frutificacao_enchimento'
  | 'maturacao_colheita';

export type BrixStatus =
  | 'muito_baixo'
  | 'baixo'
  | 'medio'
  | 'alto'
  | 'muito_alto';

export interface CropBrixThresholds {
  cropName: string;
  category: 'graos' | 'hortalicas' | 'frutiferas' | 'industriais' | 'silvicultura_pastagem';
  minBrix: number;
  idealBrixMin: number;
  idealBrixMax: number;
  maxBrix: number;
  stageThresholds: Record<PhenologicalStage, { min: number; ideal: number; max: number }>;
  pestsResistanceThresholdBrix: number; // Brix a partir do qual pragas sugadoras têm dificuldade de digestão
  recommendations: string;
}

export interface BrixReading {
  id: string;
  sampleCode: string;
  date: string;
  time: string;
  propertyName: string;
  plotId: string;
  plotName: string;
  cropName: string;
  variety: string;
  stage: PhenologicalStage;
  plantId: string;
  operatorName: string;
  refractometerModel: string;
  brixValue: number; // °Brix medido
  leafTemperatureCelsius: number;
  ambientTemperatureCelsius: number;
  relativeHumidityPercent: number;
  solarRadiationWattsM2: number;
  calculatedVpdKPa: number; // Vapor Pressure Deficit
  soilMoisturePercent?: number;
  nutritionNotes?: string;
  pestDiseaseStatus?: 'sem_pragas' | 'sugadores_leves' | 'ataque_severo' | 'doenca_foliar';
  status: BrixStatus;
  physiologicalHealthScore: number; // 0 a 100
  technicalInterpretation: string;
  photoUrl?: string;
}

export interface PlotBrixSummary {
  plotId: string;
  plotName: string;
  cropName: string;
  areaHa: number;
  currentAvgBrix: number;
  targetBrix: number;
  healthStatus: BrixStatus;
  healthScore: number;
  totalReadings: number;
  trend: 'subindo' | 'estavel' | 'caindo';
  lastReadingDate: string;
}

export interface BrixStatisticalSummary {
  mean: number;
  median: number;
  stdDev: number;
  coefficientOfVariation: number; // CV%
  min: number;
  max: number;
  amplitude: number;
  totalSamples: number;
}
