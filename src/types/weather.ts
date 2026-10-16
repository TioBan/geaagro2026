export type OperationalWindowRating = 'ideal' | 'atencao' | 'nao_recomendado';

export interface OperationalWindowIndex {
  id: string;
  operationName: string; // Ex: 'Pulverização de Defensivos', 'Plantio / Semeadura'
  iconName: string;
  rating: OperationalWindowRating;
  summary: string;
  bestHourWindowToday: string; // Ex: '06:30 às 09:30 e 17:00 às 19:30'
  limitingFactors: string[];
  favorableFactors: string[];
  technicalAdvice: string;
  score: number; // 0 a 100
}

export interface HourlyForecastItem {
  time: string; // Ex: '06:00', '09:00'
  tempC: number;
  humidityPercent: number;
  rainProbabilityPercent: number;
  rainMm: number;
  windSpeedKmh: number;
  windGustKmh: number;
  windDirection: string; // Ex: 'SE', 'N', 'E'
  uvIndex: number;
  solarRadiationWm2: number;
  dewPointC: number;
  conditionIcon: string;
  conditionDescription: string;
  sprayingRating: OperationalWindowRating;
}

export interface DailyForecastItem {
  date: string; // Ex: 'Hoje (19/08)', 'Amanhã (20/08)'
  dayOfWeek: string;
  tempMinC: number;
  tempMaxC: number;
  tempAvgC: number;
  humidityAvgPercent: number;
  rainProbabilityPercent: number;
  rainExpectedMm: number;
  windSpeedAvgKmh: number;
  windGustMaxKmh: number;
  conditionDescription: string;
  conditionIcon: string;
  etoMmDay: number; // Evapotranspiração de referência
  frostRisk: 'nenhum' | 'baixo' | 'moderado' | 'alto';
  heatStressRisk: 'nenhum' | 'baixo' | 'moderado' | 'alto';
  dominantOperationStatus: {
    spray: OperationalWindowRating;
    planting: OperationalWindowRating;
    harvest: OperationalWindowRating;
    irrigation: OperationalWindowRating;
  };
}

export interface CropWeatherThreshold {
  id: string;
  cropName: string;
  scientificName: string;
  category?: 'Grãos & Cereais' | 'Hortaliças & Olerícolas' | 'Frutíferas' | 'Fibras & Bioenergia' | 'Pastagens & Silvicultura' | 'Especialidades & Aromáticas';
  optimalTempRange: { min: number; max: number };
  criticalFrostTempC: number;
  criticalHeatStressTempC: number;
  idealSoilMoisturePercent: { min: number; max: number };
  dailyWaterRequirementMm: { min: number; max: number };
  currentGrowthStage: string;
  activeCropAlerts: string[];
  climateRiskScore: number; // 0 a 100 (baixo a alto)
  kcValue: number; // Coeficiente de cultura
}

export interface WeatherAlertItem {
  id: string;
  title: string;
  type: 'geada' | 'onda_calor' | 'tempestade_granizo' | 'vento_forte' | 'chuva_intensa' | 'baixa_umidade' | 'estiagem';
  severity: 'informativo' | 'moderado' | 'critico';
  timestamp: string;
  validUntil: string;
  affectedPlots: string[]; // Talhões afetados
  description: string;
  recommendedAction: string;
  resolved: boolean;
}

export interface FarmWeatherStation {
  id: string;
  name: string; // Ex: 'Estação Meteorológica Principal - Sede'
  model: string;
  latitude: number;
  longitude: number;
  batteryStatusPercent: number;
  signalQualityPercent: number;
  lastTelemetryTimestamp: string;
  currentAirTempC: number;
  currentHumidityPercent: number;
  currentWindSpeedKmh: number;
  currentWindGustKmh: number;
  currentWindDirectionDeg: number;
  currentRainRateMmHr: number;
  rainAccumulatedTodayMm: number;
  rainAccumulatedMonthMm: number;
  currentSolarRadiationWm2: number;
  currentAtmosphericPressureHpa: number;
  dewPointC?: number;
  soilMoistureSensors: {
    depth10cmPercent: number;
    depth30cmPercent: number;
    depth60cmPercent: number;
  };
}

export interface HistoricalRainMonth {
  month: string;
  currentYearMm: number;
  previousYearMm: number;
  historical30YearAvgMm: number;
}
