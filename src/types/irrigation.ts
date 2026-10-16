// Types for Módulo de Irrigação, Manejo Hídrico & Gêmeo Digital Hídrico

export type IrrigationSystemType =
  | 'Pivô Central'
  | 'Pivô Reboque'
  | 'Linear'
  | 'Aspersão Convencional'
  | 'Aspersão Canhão'
  | 'Gotejamento Superficial'
  | 'Gotejamento Subsuperficial (SDI)'
  | 'Microaspersão'
  | 'Inundação / Tabuleiros'
  | 'Sulcos de Irrigação';

export type WaterQualityRiskLevel = 'Baixo / Excelente' | 'Moderado' | 'Severo / Restritivo';

export interface SoilPhysicsProfile {
  id: string;
  name: string;
  texturalClass: 'Arenosa' | 'Franco-Arenosa' | 'Franca' | 'Franco-Argilosa' | 'Argilosa' | 'Muito Argilosa';
  clayPercent: number; // % Argila
  siltPercent: number; // % Silte
  sandPercent: number; // % Areia
  bulkDensity: number; // g/cm³ (Densidade do solo)
  fieldCapacity: number; // % (Capacidade de Campo - CC)
  permanentWiltingPoint: number; // % (Ponto de Murcha Permanente - PMP)
  availableWaterCapacity: number; // mm/cm de solo (CAD)
  readilyAvailableWaterPct: number; // % (Fator f/MAD ex: 50%)
  basicInfiltrationRate: number; // mm/h (IB)
  hydraulicConductivity: number; // cm/h (Ksat)
}

export interface CropWaterRequirement {
  id: string;
  cropName: string;
  scientificName: string;
  group: 'Grãos' | 'Hortaliças' | 'Frutíferas' | 'Forragens' | 'Fibras' | 'Raízes/Tubérculos';
  rootDepthMinCm: number;
  rootDepthMaxCm: number;
  totalWaterRequirementMm: number; // Ex: 450 - 700 mm
  irrigationIntervalDays: number; // Turno de rega padrão
  deficitSensitivityKy: number; // Fator Ky de sensibilidade ao estresse hídrico
  stages: {
    stageName: string; // Ex: "Inicial V1-V4", "Vegetativo V5-R1", "Floração/Enchimento R1-R5", "Maturação R6"
    durationDays: number;
    kc: number; // Coeficiente de Cultura Kc
  }[];
}

export interface IrrigationEquipmentItem {
  id: string;
  systemId: string;
  name: string;
  category: 'Bomba' | 'Motor' | 'Tubulação' | 'Filtro' | 'Válvula' | 'Emissor' | 'Inversor' | 'Sensor de Umidade';
  brandModel: string;
  flowRateM3h?: number; // m³/h
  pressureMca?: number; // mca
  powerCvKw?: number; // CV ou kW
  efficiencyPct?: number; // %
  installationDate: string;
  lastMaintenanceDate: string;
  status: 'Operacional' | 'Necessita Manutenção' | 'Inativo';
  notes?: string;
}

export interface IrrigationSystemRecord {
  id: string;
  farmId: string;
  farmName: string;
  plotId: string;
  plotName: string;
  systemName: string; // Ex: "Pivô Central 01 - Chapada"
  type: IrrigationSystemType;
  irrigatedAreaHa: number;
  nominalFlowM3h: number; // m³/h
  operatingPressureMca: number; // mca
  applicationEfficiencyPct: number; // Ea % (ex: 85% pivô, 92% gotejamento)
  cucPercent: number; // Uniformidade de Christiansen CUC %
  cudPercent: number; // Uniformidade de Distribuição CUD %
  powerKw: number; // kW do motor elétrico/diesel
  energyTariffType: 'Verde' | 'Azul' | 'Convencional' | 'Gerador Diesel';
  installationYear: number;
  status: 'Ativo' | 'Manutenção' | 'Desligado';
  latitude?: number;
  longitude?: number;
  photoUrl?: string;
  equipments: IrrigationEquipmentItem[];
}

export interface ClimateDayRecord {
  id: string;
  date: string;
  farmId: string;
  tempMaxC: number;
  tempMinC: number;
  tempAvgC: number;
  humidityRelativePct: number;
  windSpeedMs: number; // m/s
  solarRadiationMjM2: number; // MJ/m²/dia
  atmosphericPressureKpa: number;
  rainfallMm: number; // mm
  effectiveRainfallMm: number; // mm de chuva aproveitada
  evaporationMm: number;
  et0MmDay: number; // Evapotranspiração de Referência
}

export interface IrrigationEventLog {
  id: string;
  systemId: string;
  systemName: string;
  plotId: string;
  plotName: string;
  date: string;
  startTime: string;
  durationHours: number;
  grossDepthAppliedMm: number; // Lâmina Bruta
  netDepthAppliedMm: number; // Lâmina Líquida
  totalWaterVolumeM3: number; // m³
  energyConsumedKwh: number; // kWh
  energyCostBrl: number; // R$
  operatorName: string;
  purpose: 'Manejo Hídrico' | 'Germinação' | 'Fertirrigação' | 'Resfriamento / Anti-geada';
  notes?: string;
}

export interface WaterQualityAnalysis {
  id: string;
  waterSourceName: string; // Ex: "Poço Artesiano 02", "Represa Principal"
  date: string;
  ph: number;
  electricalConductivityDsm: number; // CEw dS/m
  sarRras: number; // Razão de Adsorção de Sódio (RAS)
  sodiumMeql: number;
  chlorideMeql: number;
  bicarbonatesMeql: number;
  carbonatesMeql: number;
  ironPpm: number;
  manganesePpm: number;
  hardnessPpm: number; // Dureza CaCO3
  salinityRiskLevel: WaterQualityRiskLevel;
  sodicityRiskLevel: WaterQualityRiskLevel;
  cloggingRiskLevel: WaterQualityRiskLevel;
  notes?: string;
}

export interface FertigationProgramItem {
  id: string;
  systemId: string;
  date: string;
  fertilizerName: string;
  amountKgOrL: number;
  unit: 'kg' | 'L';
  targetNutrients: string; // Ex: "N: 15 kg/ha, K2O: 20 kg/ha"
  injectionDurationHours: number;
  compatibilityCheck: 'Compatível' | 'Requer Atenção' | 'Incompatível';
  status: 'Agendado' | 'Aplicado' | 'Cancelado';
}

export interface IrrigationDiaryEntry {
  id: string;
  systemId: string;
  date: string;
  type: 'Inspeção de Rotina' | 'Vazamento' | 'Entupimento de Bico' | 'Manutenção Bomba' | 'Troca de Filtro' | 'Teste de Pressão';
  description: string;
  photoUrl?: string;
  resolved: boolean;
  costImpactBrl?: number;
}

export interface IrrigationKPIs {
  totalIrrigatedAreaHa: number;
  totalActiveSystemsCount: number;
  totalWaterVolumeSeasonM3: number;
  totalEnergyConsumedKwh: number;
  totalEnergyCostBrl: number;
  avgWaterUseEfficiency: number; // mm/saca ou m³/ha
  avgSystemEfficiencyPct: number; // %
  currentSoilMoisturePct: number; // %
  averageEt0MmDay: number;
  accumulatedRainfallMm: number;
  igehScore: number; // Índice GeaAgro de Eficiência Hídrica (0 a 100)
  waterSavedM3: number;
  recommendedNextIrrigationDate: string;
  recommendedGrossDepthMm: number;
  waterStressIndex: 'Sem Estresse (Ótimo)' | 'Leve' | 'Moderado' | 'Crítico';
}

export interface ScenarioSimulationInput {
  systemType: IrrigationSystemType;
  targetDepthMm: number; // ex: 15 mm
  irrigationIntervalDays: number; // ex: 3 dias
  energyTariffSchedule: 'Fora de Ponta (Noite)' | 'Horário de Ponta (17h-20h)' | 'Bandeira Vermelha';
  electricityRateBrlKwh: number; // R$/kWh
  expectedYieldIncreasePct: number; // %
}

export interface ScenarioSimulationResult {
  monthlyWaterConsumptionM3: number;
  monthlyEnergyConsumptionKwh: number;
  monthlyCostBrl: number;
  costPerHaBrl: number;
  waterUseEfficiencyRatio: number; // m³/saca
  estimatedGrossMarginImpactBrl: number;
  energySavingsNightTariffBrl: number;
}
