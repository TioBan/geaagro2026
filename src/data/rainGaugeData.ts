import {
  RainGaugePoint,
  RainRecord,
  RainEfficiencyIndex,
  RainCropWaterBalance,
  RainAlertItem,
} from '../types/rainGauge';

export const initialRainGauges: RainGaugePoint[] = [];

export const initialRainRecords: RainRecord[] = [];

export const initialRainEfficiency: RainEfficiencyIndex = {
  periodLabel: 'Safra Atual / Últimos 30 Dias',
  totalRainMm: 0,
  rainDaysCount: 0,
  averageRainPerRainDayMm: 0,
  efficiencyCategory: 'moderada',
  efficiencyScore: 0,
  effectiveSoilWaterInfiltrationMm: 0,
  estimatedSurfaceRunoffMm: 0,
  agronomicExplanation: 'Nenhuma chuva registrada no período para cálculo de eficiência de infiltração hídrica.',
  managementRecommendations: [
    'Cadastre seus pluviômetros e registre as precipitações para obter recomendações de manejo hídrico automatizadas.',
  ],
};

export const initialCropWaterBalances: RainCropWaterBalance[] = [];

export const initialRainAlerts: RainAlertItem[] = [];
