export type RainGaugeType = 'convencional' | 'automatico_lora' | 'automatico_wifi' | 'automatico_gsm';
export type RainIntensityLevel = 'garoa_leve' | 'moderada' | 'forte' | 'tempestade_torrencial';
export type RainEfficiencyCategory = 'excelente' | 'boa' | 'moderada' | 'baixa_escoamento_alto';

export interface RainGaugePoint {
  id: string;
  name: string; // Ex: 'Pluviômetro Sede', 'Talhão 01 - Soja', 'Pastagem Norte'
  type: RainGaugeType;
  model: string;
  plotId?: string;
  plotName: string;
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  installedDate: string;
  status: 'ativo' | 'manutencao' | 'inativo';
  batteryPercent?: number;
  signalPercent?: number;
  lastTelemetryTimestamp?: string;
  accumulatedTodayMm: number;
  accumulatedLast24hMm: number;
  accumulatedLast7DaysMm: number;
  accumulatedMonthMm: number;
  accumulatedYearMm: number;
  notes: string;
}

export interface RainRecord {
  id: string;
  gaugeId: string;
  gaugeName: string;
  plotName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  amountMm: number;
  durationMinutes: number;
  intensity: RainIntensityLevel;
  recordedBy: string; // 'Manual - Operador João' ou 'Automático IoT LoRa'
  efficiencyScore: number; // 0 a 100%
  runoffEstimatedPercent: number; // % estimada de perda por escorrimento superficial
  photoUrl?: string;
  notes?: string;
}

export interface RainEfficiencyIndex {
  periodLabel: string;
  totalRainMm: number;
  rainDaysCount: number;
  averageRainPerRainDayMm: number;
  efficiencyCategory: RainEfficiencyCategory;
  efficiencyScore: number; // 0 a 100
  effectiveSoilWaterInfiltrationMm: number;
  estimatedSurfaceRunoffMm: number;
  agronomicExplanation: string;
  managementRecommendations: string[];
}

export interface RainCropWaterBalance {
  id: string;
  cropName: string;
  growthStage: string;
  cycleAccumulatedRainMm: number;
  cycleRequiredWaterMm: number;
  waterAdequacyPercent: number; // Ex: 95%
  waterDeficitMm: number;
  irrigationNeededMm: number;
  status: 'adequado' | 'deficit_moderado' | 'deficit_severo' | 'excesso_encharcamento';
  recommendations: string;
}

export interface RainAlertItem {
  id: string;
  title: string;
  type: 'estiagem_veranico' | 'chuva_torrencial_erosao' | 'encharcamento_solo' | 'volume_insuficiente_adubacao' | 'chuva_ideal_semeadura';
  severity: 'informativo' | 'moderado' | 'critico';
  timestamp: string;
  gaugeNames: string[];
  description: string;
  actionRequired: string;
  resolved: boolean;
}
