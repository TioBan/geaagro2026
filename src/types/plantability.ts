export type CropType = 'Soja' | 'Milho' | 'Algodão' | 'Feijão' | 'Girassol' | 'Sorgo' | 'Trigo' | 'Outra';

export type SoilType = 'Argiloso' | 'Arenoso' | 'Misto' | 'Franco-Argiloso' | 'Siltoso';

export type TillageSystem = 'Plantio Direto' | 'Convencional' | 'Mínimo';

export type MeterType = 'Pneumático (Vácuo)' | 'Disco Mecânico Alveolado' | 'Dosador Elétrico (E-Drive)' | 'Pneumático (Pressão)';

export type SeedCategory = 'C1' | 'C2' | 'S1' | 'S2' | 'Básica' | 'Certificada';

export interface PropertyField {
  id: string;
  farmName: string;
  fieldCode: string; // e.g., Talhão 01
  crop: CropType;
  cultivar: string;
  areaHa: number;
  soilType: SoilType;
  tillageSystem: TillageSystem;
  seedingDate: string;
  notes?: string;
}

export interface PlanterEquipment {
  id: string;
  brand: string;
  model: string;
  rowsCount: number;
  rowSpacingMeters: number; // e.g. 0.45m or 0.50m
  meterType: MeterType;
  discSpecification: string; // e.g., Disco 28 furos 4.5mm
  componentsCondition: 'Excelente' | 'Boa' | 'Regular' | 'Ruim';
  springPressureSetting: 'Baixa' | 'Média' | 'Alta' | 'Pneumática';
  strawCuttingSystem: 'Disco Liso' | 'Disco Corrugado' | 'Disco Turbo' | 'Duplo Disco Limpador';
  notes?: string;
}

export interface SeedBatch {
  id: string;
  crop: CropType;
  cultivar: string;
  batchNumber: string;
  category: SeedCategory;
  treatment: string; // e.g., Fungicida + Inseticida + Nematicida + Inoculante
  pmsGrams: number; // Peso de Mil Sementes em g
  germinationRate: number; // %
  vigorRate: number; // %
  purityRate: number; // %
  supplier: string;
}

export interface SeedingConfig {
  id: string;
  fieldId: string;
  planterId: string;
  seedBatchId: string;
  rowSpacingCm: number; // e.g., 45cm or 50cm
  desiredSeedSpacingCm: number; // e.g., 12.5 cm between seeds
  targetPopulationPerHa: number; // e.g., 220,000 plants/ha
  targetDepthCm: number; // e.g., 4.0 cm
  targetSpeedKmH: number; // e.g., 6.5 km/h
  seedingDateTime: string;
  operatorName: string;
  soilMoisturePct: number; // %
  soilTempCelsius: number; // °C
}

export interface PlantabilitySamplingPoint {
  id: string;
  fieldId: string;
  pointCode: string; // e.g., Pnt-01
  evaluator: string;
  timestamp: string;
  rowNumber: number; // Linha avaliada
  sampledLengthMeters: number; // e.g., 5.0m or 10.0m
  actualSpacingsCm: number[]; // Array de distâncias reais entre plantas sucessivas ex: [12, 13, 25, 6, 12]
  actualDepthsCm: number[]; // Array de profundidades medidas ex: [4, 4.2, 3.8]
  emergenceDays: number; // Dias para emergência
  damagedPlantsCount: number;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export interface EnvironmentalConditions {
  id: string;
  fieldId: string;
  timestamp: string;
  airTempCelsius: number;
  soilTempCelsius: number;
  soilMoisturePct: number;
  relativeHumidityPct: number;
  windSpeedKmH: number;
  rainfallPostPlantingMm: number;
}

export interface PlantabilityPhoto {
  id: string;
  fieldId: string;
  category: 'sulco' | 'sementes' | 'emergência' | 'desenvolvimento' | 'equipamento' | 'problema';
  photoUrl: string;
  caption: string;
  timestamp: string;
  notes?: string;
}

export interface ComponentMaintenanceStatus {
  id: string;
  planterId: string;
  componentName: 'Discos de Corte' | 'Discos Duplos Sulcadores' | 'Rodas Limitadoras de Profundidade' | 'Rodas Compactadoras V' | 'Molas de Pressão' | 'Dosadores de Semente' | 'Tubos Condutores (Condutos)' | 'Mancais e Rolamentos';
  wearConditionPct: number; // 0% (novo) a 100% (gasto)
  lastInspectionDate: string;
  actionTaken: 'Inspeção Normal' | 'Regulagem Efetuada' | 'Componente Substituído' | 'Limpeza Geral';
  hoursWorked: number;
  hectaresWorked: number;
  nextReplacementEstHectares: number;
}

export interface PlantabilityMetricsResult {
  targetSpacingCm: number;
  averageSpacingCm: number;
  stdDeviationCm: number;
  cvPercent: number; // Coeficiente de Variação (%)
  acceptablePercent: number; // 0.5x to 1.5x target
  skipsPercent: number; // > 1.5x target
  doublesPercent: number; // < 0.5x target
  triplesPercent: number;
  realPopulationPerHa: number;
  targetPopulationPerHa: number;
  populationLossPerHa: number;
  emergenceUniformityPct: number;
  avgDepthCm: number;
  depthStdDevCm: number;
  igpScore: number; // Índice GeaAgro de Plantabilidade 0-100
  igpClassification: 'Excelente' | 'Muito bom' | 'Bom' | 'Atenção' | 'Crítico' | 'Aguardando Amostragem';
  igpColorClass: string;
}

export interface DiagnosticRule {
  id: string;
  symptom: string;
  possibleCauses: string[];
  recommendedActions: string[];
  severity: 'Alta' | 'Média' | 'Baixa';
}

export interface EconomicLossSimulation {
  fieldAreaHa: number;
  crop: CropType;
  targetYieldScHa: number; // e.g. 70 bags/ha
  commodityPricePerSc: number; // e.g. R$ 130/saca
  seedCostPerHa: number; // e.g. R$ 350/ha
  skipsPct: number;
  doublesPct: number;
  cvPct: number;
  // Computed output
  yieldLossPercent: number;
  yieldLossScHa: number;
  totalYieldLossSc: number;
  financialLossPerHa: number;
  totalFinancialLoss: number;
  seedWastePerHa: number;
}
