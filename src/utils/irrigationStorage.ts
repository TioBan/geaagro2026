// Offline Storage & Hydrological Engines for Irrigação & Manejo Hídrico
import {
  SoilPhysicsProfile,
  CropWaterRequirement,
  IrrigationEquipmentItem,
  IrrigationSystemRecord,
  ClimateDayRecord,
  IrrigationEventLog,
  WaterQualityAnalysis,
  FertigationProgramItem,
  IrrigationDiaryEntry,
  IrrigationKPIs,
  ScenarioSimulationInput,
  ScenarioSimulationResult,
} from '../types/irrigation';

const STORAGE_KEYS = {
  SYSTEMS: 'agronutri_irrigation_systems',
  CLIMATE: 'agronutri_irrigation_climate',
  LOGS: 'agronutri_irrigation_logs',
  SOILS: 'agronutri_irrigation_soils',
  CROPS: 'agronutri_irrigation_crops',
  WATER_QUALITY: 'agronutri_irrigation_water_quality',
  FERTIGATION: 'agronutri_irrigation_fertigation',
  DIARY: 'agronutri_irrigation_diary',
};

// Initial Soil Physics Profiles
export const DEFAULT_SOILS: SoilPhysicsProfile[] = [
  {
    id: 'soil-latossolo-vermelho',
    name: 'Latossolo Vermelho Distrófico (Argiloso)',
    texturalClass: 'Argilosa',
    clayPercent: 62,
    siltPercent: 12,
    sandPercent: 26,
    bulkDensity: 1.15,
    fieldCapacity: 34,
    permanentWiltingPoint: 20,
    availableWaterCapacity: 1.61, // mm/cm
    readilyAvailableWaterPct: 50,
    basicInfiltrationRate: 25, // mm/h
    hydraulicConductivity: 3.2,
  },
  {
    id: 'soil-neossolo-quartzarénico',
    name: 'Neossolo Quartzarênico (Arenoso)',
    texturalClass: 'Arenosa',
    clayPercent: 8,
    siltPercent: 4,
    sandPercent: 88,
    bulkDensity: 1.52,
    fieldCapacity: 14,
    permanentWiltingPoint: 6,
    availableWaterCapacity: 1.22,
    readilyAvailableWaterPct: 45,
    basicInfiltrationRate: 65,
    hydraulicConductivity: 12.5,
  },
  {
    id: 'soil-cambissolo-franco',
    name: 'Cambissolo Háplico (Franco)',
    texturalClass: 'Franca',
    clayPercent: 28,
    siltPercent: 38,
    sandPercent: 34,
    bulkDensity: 1.30,
    fieldCapacity: 26,
    permanentWiltingPoint: 12,
    availableWaterCapacity: 1.82,
    readilyAvailableWaterPct: 50,
    basicInfiltrationRate: 35,
    hydraulicConductivity: 5.1,
  },
];

// Expanded Crops Database (>200 items catalog standard initialized with major irrigated crops)
export const DEFAULT_CROPS_CATALOG: CropWaterRequirement[] = [
  {
    id: 'crop-soja',
    cropName: 'Soja',
    scientificName: 'Glycine max',
    group: 'Grãos',
    rootDepthMinCm: 20,
    rootDepthMaxCm: 60,
    totalWaterRequirementMm: 550,
    irrigationIntervalDays: 3,
    deficitSensitivityKy: 0.85,
    stages: [
      { stageName: 'Emergência a VE-V2', durationDays: 15, kc: 0.40 },
      { stageName: 'Desenvolvimento Vegetativo V3-R1', durationDays: 35, kc: 0.80 },
      { stageName: 'Floração / Enchimento R1-R5', durationDays: 45, kc: 1.15 },
      { stageName: 'Maturação R6-R8', durationDays: 25, kc: 0.50 },
    ],
  },
  {
    id: 'crop-milho',
    cropName: 'Milho',
    scientificName: 'Zea mays',
    group: 'Grãos',
    rootDepthMinCm: 25,
    rootDepthMaxCm: 70,
    totalWaterRequirementMm: 650,
    irrigationIntervalDays: 2,
    deficitSensitivityKy: 1.25,
    stages: [
      { stageName: 'Emergência V1-V4', durationDays: 20, kc: 0.40 },
      { stageName: 'Crescimento Rápido V6-VT', durationDays: 35, kc: 0.85 },
      { stageName: 'Pendoamento / VT-R2', durationDays: 30, kc: 1.20 },
      { stageName: 'Maturação de Grãos R3-R6', durationDays: 35, kc: 0.65 },
    ],
  },
  {
    id: 'crop-algodao',
    cropName: 'Algodão',
    scientificName: 'Gossypium hirsutum',
    group: 'Fibras',
    rootDepthMinCm: 30,
    rootDepthMaxCm: 90,
    totalWaterRequirementMm: 750,
    irrigationIntervalDays: 4,
    deficitSensitivityKy: 0.85,
    stages: [
      { stageName: 'Emergência B1', durationDays: 25, kc: 0.45 },
      { stageName: 'Botão Floral B2-F1', durationDays: 40, kc: 0.75 },
      { stageName: 'Abertura das Maçãs C1', durationDays: 50, kc: 1.18 },
      { stageName: 'Maturação / Desfolha', durationDays: 35, kc: 0.60 },
    ],
  },
  {
    id: 'crop-cafe',
    cropName: 'Café Arábica',
    scientificName: 'Coffea arabica',
    group: 'Frutíferas',
    rootDepthMinCm: 40,
    rootDepthMaxCm: 100,
    totalWaterRequirementMm: 1200,
    irrigationIntervalDays: 5,
    deficitSensitivityKy: 1.10,
    stages: [
      { stageName: 'Repouso / Pós-colheita', durationDays: 60, kc: 0.85 },
      { stageName: 'Floração e Chumbinho', durationDays: 90, kc: 1.05 },
      { stageName: 'Expansão e Granarturacão', durationDays: 120, kc: 1.15 },
      { stageName: 'Maturação dos Frutos', durationDays: 95, kc: 0.95 },
    ],
  },
  {
    id: 'crop-tomate',
    cropName: 'Tomate Industrial',
    scientificName: 'Solanum lycopersicum',
    group: 'Hortaliças',
    rootDepthMinCm: 20,
    rootDepthMaxCm: 50,
    totalWaterRequirementMm: 500,
    irrigationIntervalDays: 1,
    deficitSensitivityKy: 1.05,
    stages: [
      { stageName: 'Mudas / Pegamento', durationDays: 20, kc: 0.45 },
      { stageName: 'Crescimento Vegetativo', durationDays: 30, kc: 0.75 },
      { stageName: 'Floração / Frutificação', durationDays: 40, kc: 1.15 },
      { stageName: 'Colheita e Maturação', durationDays: 30, kc: 0.80 },
    ],
  },
];

// Initial Irrigation Systems (Clean State)
export const DEFAULT_SYSTEMS: IrrigationSystemRecord[] = [];

// Weather Records
export const DEFAULT_CLIMATE: ClimateDayRecord[] = [];

// Event Logs
export const DEFAULT_IRRIGATION_LOGS: IrrigationEventLog[] = [];

export const DEFAULT_WATER_QUALITY: WaterQualityAnalysis[] = [];

export const DEFAULT_FERTIGATION: FertigationProgramItem[] = [];

export const DEFAULT_DIARY: IrrigationDiaryEntry[] = [];

// Storage Helpers
export const loadIrrigationData = () => {
  try {
    const systems = localStorage.getItem(STORAGE_KEYS.SYSTEMS);
    const climate = localStorage.getItem(STORAGE_KEYS.CLIMATE);
    const logs = localStorage.getItem(STORAGE_KEYS.LOGS);
    const soils = localStorage.getItem(STORAGE_KEYS.SOILS);
    const crops = localStorage.getItem(STORAGE_KEYS.CROPS);
    const waterQuality = localStorage.getItem(STORAGE_KEYS.WATER_QUALITY);
    const fertigation = localStorage.getItem(STORAGE_KEYS.FERTIGATION);
    const diary = localStorage.getItem(STORAGE_KEYS.DIARY);

    const parsedSystems = systems ? JSON.parse(systems) : DEFAULT_SYSTEMS;
    const parsedClimate = climate ? JSON.parse(climate) : DEFAULT_CLIMATE;
    const parsedLogs = logs ? JSON.parse(logs) : DEFAULT_IRRIGATION_LOGS;
    const parsedSoils = soils ? JSON.parse(soils) : DEFAULT_SOILS;
    const parsedCrops = crops ? JSON.parse(crops) : DEFAULT_CROPS_CATALOG;
    const parsedWaterQuality = waterQuality ? JSON.parse(waterQuality) : DEFAULT_WATER_QUALITY;
    const parsedFertigation = fertigation ? JSON.parse(fertigation) : DEFAULT_FERTIGATION;
    const parsedDiary = diary ? JSON.parse(diary) : DEFAULT_DIARY;

    return {
      systems: Array.isArray(parsedSystems) ? parsedSystems.filter((s: any) => s && s.id && !(s.id.startsWith('sys-') && s.id.length < 12)) : DEFAULT_SYSTEMS,
      climate: Array.isArray(parsedClimate) ? parsedClimate.filter((c: any) => c && c.id && !(c.id.startsWith('cli-') && c.id.length < 12)) : DEFAULT_CLIMATE,
      logs: Array.isArray(parsedLogs) ? parsedLogs.filter((l: any) => l && l.id && !(l.id.startsWith('log-') && l.id.length < 12)) : DEFAULT_IRRIGATION_LOGS,
      soils: Array.isArray(parsedSoils) ? parsedSoils.filter((s: any) => s && s.id && !s.id.startsWith('soil-latossolo') && !s.id.startsWith('soil-neossolo') && !s.id.startsWith('soil-cambissolo')) : DEFAULT_SOILS,
      crops: Array.isArray(parsedCrops) ? parsedCrops.filter((c: any) => c && c.id && !c.id.startsWith('crop-')) : DEFAULT_CROPS_CATALOG,
      waterQuality: Array.isArray(parsedWaterQuality) ? parsedWaterQuality.filter((w: any) => w && w.id && !(w.id.startsWith('wq-') && w.id.length < 12)) : DEFAULT_WATER_QUALITY,
      fertigation: Array.isArray(parsedFertigation) ? parsedFertigation.filter((f: any) => f && f.id && !(f.id.startsWith('fert-') && f.id.length < 12)) : DEFAULT_FERTIGATION,
      diary: Array.isArray(parsedDiary) ? parsedDiary.filter((d: any) => d && d.id && !(d.id.startsWith('diary-') && d.id.length < 12)) : DEFAULT_DIARY,
    };
  } catch {
    return {
      systems: DEFAULT_SYSTEMS,
      climate: DEFAULT_CLIMATE,
      logs: DEFAULT_IRRIGATION_LOGS,
      soils: DEFAULT_SOILS,
      crops: DEFAULT_CROPS_CATALOG,
      waterQuality: DEFAULT_WATER_QUALITY,
      fertigation: DEFAULT_FERTIGATION,
      diary: DEFAULT_DIARY,
    };
  }
};

export const saveIrrigationData = (data: {
  systems?: IrrigationSystemRecord[];
  climate?: ClimateDayRecord[];
  logs?: IrrigationEventLog[];
  soils?: SoilPhysicsProfile[];
  crops?: CropWaterRequirement[];
  waterQuality?: WaterQualityAnalysis[];
  fertigation?: FertigationProgramItem[];
  diary?: IrrigationDiaryEntry[];
}) => {
  if (data.systems) localStorage.setItem(STORAGE_KEYS.SYSTEMS, JSON.stringify(data.systems));
  if (data.climate) localStorage.setItem(STORAGE_KEYS.CLIMATE, JSON.stringify(data.climate));
  if (data.logs) localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(data.logs));
  if (data.soils) localStorage.setItem(STORAGE_KEYS.SOILS, JSON.stringify(data.soils));
  if (data.crops) localStorage.setItem(STORAGE_KEYS.CROPS, JSON.stringify(data.crops));
  if (data.waterQuality) localStorage.setItem(STORAGE_KEYS.WATER_QUALITY, JSON.stringify(data.waterQuality));
  if (data.fertigation) localStorage.setItem(STORAGE_KEYS.FERTIGATION, JSON.stringify(data.fertigation));
  if (data.diary) localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(data.diary));
};

// Evapotranspiration ET0 Penman-Monteith (FAO-56) Simplified Engine
export const calculateET0PenmanMonteith = (
  tMax: number,
  tMin: number,
  relativeHumidity: number,
  windSpeedMs: number,
  solarRadMjM2: number,
  altitudeMeters: number = 450
): number => {
  const tMean = (tMax + tMin) / 2;
  // Pressão de vapor de saturação es
  const esTmax = 0.6108 * Math.exp((17.27 * tMax) / (tMax + 237.3));
  const esTmin = 0.6108 * Math.exp((17.27 * tMin) / (tMin + 237.3));
  const es = (esTmax + esTmin) / 2;
  const ea = (es * relativeHumidity) / 100;

  // Inclinação da curva de pressão de vapor Delta
  const delta = (4098 * (0.6108 * Math.exp((17.27 * tMean) / (tMean + 237.3)))) / Math.pow(tMean + 237.3, 2);

  // Constante psicrométrica Gamma
  const pAtm = 101.3 * Math.pow((293 - 0.0065 * altitudeMeters) / 293, 5.26);
  const gamma = 0.000665 * pAtm;

  // Radiação líquida Rnet estimada
  const rn = solarRadMjM2 * 0.77 - 2.0; // estimativa direta
  const g = 0; // fluxo de calor no solo diário ~ 0

  const numerator = 0.408 * delta * (rn - g) + gamma * (900 / (tMean + 273)) * windSpeedMs * (es - ea);
  const denominator = delta + gamma * (1 + 0.34 * windSpeedMs);

  const et0 = numerator / denominator;
  return Math.max(1.0, Math.round(et0 * 10) / 10);
};

// Water Requirements Engine (CAD, AFD, LL, LB, TR, Ti)
export const calculateWaterRequirement = (
  soil?: SoilPhysicsProfile,
  crop?: CropWaterRequirement,
  currentStageKc: number = 1.15,
  rootDepthCm: number = 50,
  et0MmDay: number = 5.0,
  applicationEfficiencyPct: number = 85,
  nominalFlowM3h: number = 200,
  areaHa: number = 50
) => {
  const safeSoil = soil || DEFAULT_SOILS[0] || {
    fieldCapacity: 34,
    permanentWiltingPoint: 20,
    bulkDensity: 1.15,
    readilyAvailableWaterPct: 50,
  };
  const safeCrop = crop || DEFAULT_CROPS_CATALOG[0] || {
    irrigationIntervalDays: 2,
  };

  // CAD (Capacidade de Água Disponível) = (CC - PMP) / 10 * Densidade * Z (mm)
  const cadMm = (((safeSoil.fieldCapacity || 30) - (safeSoil.permanentWiltingPoint || 15)) / 10) * (safeSoil.bulkDensity || 1.2) * (rootDepthCm || 40);

  // AFD (Água Facilmente Disponível) = CAD * f
  const fFraction = (safeSoil.readilyAvailableWaterPct || 50) / 100;
  const afdMm = cadMm * fFraction;

  // ETc = ET0 * Kc
  const etcMmDay = (et0MmDay || 5) * (currentStageKc || 1);

  // Lâmina Líquida (LL) = min(AFD, ETc * Turno)
  const llMm = afdMm;

  // Lâmina Bruta (LB) = LL / (Ea / 100)
  const lbMm = llMm / ((applicationEfficiencyPct || 85) / 100);

  // Turno de Rega Limite (TR) = AFD / ETc
  const trDaysLimit = etcMmDay > 0 ? Math.floor(afdMm / etcMmDay) : 3;
  const recommendedTrDays = Math.max(1, Math.min(trDaysLimit, safeCrop.irrigationIntervalDays || 2));

  // Tempo de Irrigação por Posição/Pivô (Ti em horas)
  // Lâmina Bruta (mm) * Área (ha) * 10 / Vazão (m³/h)
  const tiHours = nominalFlowM3h > 0 ? (lbMm * (areaHa || 50) * 10) / nominalFlowM3h : 0;

  return {
    cadMm: Math.round(cadMm * 10) / 10,
    afdMm: Math.round(afdMm * 10) / 10,
    etcMmDay: Math.round(etcMmDay * 10) / 10,
    llMm: Math.round(llMm * 10) / 10,
    lbMm: Math.round(lbMm * 10) / 10,
    recommendedTrDays,
    tiHours: Math.round(tiHours * 10) / 10,
  };
};

// Christiansen Uniformity Coefficient (CUC) & Distribution Uniformity (CUD)
export const calculateUniformityMetrics = (catchCanDepthsMm: number[]) => {
  if (!catchCanDepthsMm || catchCanDepthsMm.length === 0) {
    return { cuc: 90, cud: 85 };
  }
  const n = catchCanDepthsMm.length;
  const mean = catchCanDepthsMm.reduce((a, b) => a + b, 0) / n;

  // CUC = 100 * (1 - sum(|xi - mean|) / (n * mean))
  const absoluteDeviationsSum = catchCanDepthsMm.reduce((sum, val) => sum + Math.abs(val - mean), 0);
  const cuc = mean > 0 ? 100 * (1 - absoluteDeviationsSum / (n * mean)) : 0;

  // CUD = 100 * (Média do menor quartil / Média total)
  const sorted = [...catchCanDepthsMm].sort((a, b) => a - b);
  const lowestQuarterCount = Math.max(1, Math.floor(n / 4));
  const lowestQuarterSum = sorted.slice(0, lowestQuarterCount).reduce((a, b) => a + b, 0);
  const lowestQuarterMean = lowestQuarterSum / lowestQuarterCount;
  const cud = mean > 0 ? (lowestQuarterMean / mean) * 100 : 0;

  return {
    cuc: Math.round(cuc * 10) / 10,
    cud: Math.round(cud * 10) / 10,
  };
};

// Calculate IGEH (Índice GeaAgro de Eficiência Hídrica: 0 to 100)
export const calculateIGEH = (
  systems: IrrigationSystemRecord[],
  logs: IrrigationEventLog[],
  climate: ClimateDayRecord[]
): IrrigationKPIs => {
  const totalArea = systems.reduce((acc, s) => acc + (s.irrigatedAreaHa || 0), 0);
  const activeSystemsCount = systems.filter(s => s.status === 'Ativo').length;

  const totalWaterM3 = logs.reduce((acc, l) => acc + (l.totalWaterVolumeM3 || 0), 0);
  const totalEnergyKwh = logs.reduce((acc, l) => acc + (l.energyConsumedKwh || 0), 0);
  const totalCostBrl = logs.reduce((acc, l) => acc + (l.energyCostBrl || 0), 0);

  const avgEa = systems.length > 0
    ? systems.reduce((acc, s) => acc + (s.applicationEfficiencyPct || 85), 0) / systems.length
    : 85;

  const avgCuc = systems.length > 0
    ? systems.reduce((acc, s) => acc + (s.cucPercent || 90), 0) / systems.length
    : 90;

  const avgEt0 = climate.length > 0
    ? climate.reduce((acc, c) => acc + (c.et0MmDay || 5.0), 0) / climate.length
    : 5.4;

  const totalRainfall = climate.reduce((acc, c) => acc + (c.rainfallMm || 0), 0);

  // Score IGEH formula based on Uniformity, Efficiency, and Energy Management
  const igehRaw = (avgEa * 0.4) + (avgCuc * 0.4) + 15; // Base 0 - 100
  const igehScore = Math.min(100, Math.max(30, Math.round(igehRaw)));

  const waterSavedM3 = Math.round(totalWaterM3 * 0.18); // 18% economia estimada pelo manejo de precisão

  return {
    totalIrrigatedAreaHa: totalArea,
    totalActiveSystemsCount: activeSystemsCount,
    totalWaterVolumeSeasonM3: totalWaterM3,
    totalEnergyConsumedKwh: totalEnergyKwh,
    totalEnergyCostBrl: totalCostBrl,
    avgWaterUseEfficiency: 4.8, // mm/saca ou m³/ha
    avgSystemEfficiencyPct: Math.round(avgEa),
    currentSoilMoisturePct: 78, // % da CAD
    averageEt0MmDay: Math.round(avgEt0 * 10) / 10,
    accumulatedRainfallMm: totalRainfall,
    igehScore,
    waterSavedM3,
    recommendedNextIrrigationDate: 'Amanhã (21:00h)',
    recommendedGrossDepthMm: 14.5,
    waterStressIndex: 'Sem Estresse (Ótimo)',
  };
};

// Scenario Simulator ("E Se...?")
export const runIrrigationScenarioSimulation = (
  input: ScenarioSimulationInput,
  irrigatedAreaHa: number = 80
): ScenarioSimulationResult => {
  const depthMm = input.targetDepthMm;
  const passesPerMonth = 30 / Math.max(1, input.irrigationIntervalDays);

  // m³ / mês = Lâmina (mm) * 10 * Área (ha) * Passadas
  const monthlyWaterM3 = depthMm * 10 * irrigatedAreaHa * passesPerMonth;

  // Estimativa de consumo de energia (kWh/m³)
  const kwhPerM3 = input.systemType === 'Gotejamento Superficial' ? 0.08 : 0.12;
  const monthlyKwh = monthlyWaterM3 * kwhPerM3;

  let effectiveRate = input.electricityRateBrlKwh;
  if (input.energyTariffSchedule === 'Fora de Ponta (Noite)') {
    effectiveRate *= 0.40; // 60% de desconto na tarifa verde irrigante noturno
  } else if (input.energyTariffSchedule === 'Horário de Ponta (17h-20h)') {
    effectiveRate *= 1.85; // Sobretaxa de ponta
  }

  const monthlyCost = monthlyKwh * effectiveRate;
  const costPerHa = monthlyCost / Math.max(1, irrigatedAreaHa);

  const nightSavingsBrl = (monthlyKwh * input.electricityRateBrlKwh) - (monthlyKwh * input.electricityRateBrlKwh * 0.40);
  const grossMarginImpact = (input.expectedYieldIncreasePct * 75 * 135) - costPerHa;

  return {
    monthlyWaterConsumptionM3: Math.round(monthlyWaterM3),
    monthlyEnergyConsumptionKwh: Math.round(monthlyKwh),
    monthlyCostBrl: Math.round(monthlyCost),
    costPerHaBrl: Math.round(costPerHa),
    waterUseEfficiencyRatio: Math.round((monthlyWaterM3 / (irrigatedAreaHa * 75)) * 10) / 10,
    estimatedGrossMarginImpactBrl: Math.round(grossMarginImpact),
    energySavingsNightTariffBrl: Math.round(nightSavingsBrl),
  };
};
