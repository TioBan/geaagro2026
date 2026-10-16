export type HydroponicSystemType = 'NFT' | 'DFT' | 'Substrato_Gotejo' | 'Aeroponia';

export type HydroponicCropCategory = 'folhosa' | 'fruto' | 'erva_condimento' | 'fruta';

export interface HydroponicBench {
  id: string;
  code: string; // Ex: 'BANC-NFT-01'
  systemType: HydroponicSystemType;
  greenhouseSection: string; // Ex: 'Estufa 01 - Setor A'
  cropName: string;
  cultivar: string;
  category: HydroponicCropCategory;
  transplantDate: string;
  expectedHarvestDate: string;
  daysAfterTransplant: number;
  totalCapacityPlants: number;
  currentPlantsCount: number;
  reservoirId: string;
  status: 'vazia' | 'maternidade' | 'desenvolvimento' | 'pronto_colheita';
  healthStatus: 'excelente' | 'alerta' | 'critico';
  estimatedYieldKg: number;
  notes?: string;
  // Spatial coordinates for the Digital Greenhouse Map (grid x, y)
  gridPosition: {
    row: number;
    col: number;
  };
}

export interface NutrientSolutionReservoir {
  id: string;
  name: string; // Ex: 'Reservatório Central 01 (Folhosas)'
  capacityLiters: number;
  currentVolumeLiters: number;
  currentPH: number;
  targetPHMin: number;
  targetPHMax: number;
  currentEC: number; // mS/cm
  targetECMin: number;
  targetECMax: number;
  solutionTempC: number;
  dissolvedOxygenPpm: number; // mg/L O2
  pumpStatus: 'ligada' | 'timer' | 'em_espera' | 'alerta';
  lastWaterRefillDate: string;
  lastNutrientAdjustmentDate: string;
  waterConsumptionLitersDay: number;
  associatedBenches: string[];
}

export interface HydroponicNutrientRecipe {
  id: string;
  cropName: string;
  scientificName: string;
  category: HydroponicCropCategory;
  stage: 'bercario' | 'desenvolvimento_engorda' | 'frutificacao';
  targetPH: { min: number; max: number; ideal: number };
  targetEC: { min: number; max: number; ideal: number }; // mS/cm
  idealSolutionTempC: { min: number; max: number };
  replacementFrequencyDays: number;
  
  // Macronutrients (ppm / mg/L)
  macroPpm: {
    N_NO3: number;
    N_NH4: number;
    P: number;
    K: number;
    Ca: number;
    Mg: number;
    S: number;
  };
  
  // Micronutrients (ppm / mg/L)
  microPpm: {
    Fe: number;
    B: number;
    Mn: number;
    Zn: number;
    Cu: number;
    Mo: number;
  };
  
  // Suggested fertilizer formulations per 1000 Liters (in grams)
  fertilizerStockGramsPer1000L: {
    calciumNitrate: number; // Nitrato de Cálcio (15.5% N, 19% Ca)
    potassiumNitrate: number; // Nitrato de Potássio (13% N, 44% K2O)
    monopotassiumPhosphate: number; // MKP (52% P2O5, 34% K2O)
    magnesiumSulfate: number; // Sulfato de Magnésio (9% Mg, 12% S)
    potassiumSulfate?: number; // Sulfato de Potássio
    ironChelateEDDHA: number; // Fe-EDDHA / Fe-DTPA (6% Fe)
    micronutrientsConMicros: number; // Mix de Quelatos (B, Zn, Mn, Cu, Mo)
  };
  technicalNotes: string;
}

export interface IrrigationTimerSchedule {
  id: string;
  reservoirId: string;
  systemType: HydroponicSystemType;
  daytimeOnMinutes: number;
  daytimeOffMinutes: number;
  nighttimeOnMinutes: number;
  nighttimeOffIntervalHours: number;
  startTimeDaytime: string; // Ex: '06:00'
  endTimeDaytime: string; // Ex: '18:30'
  status: 'ativo' | 'pausado' | 'manual';
  averageFlowRateLitersMin: number;
}

export interface HydroponicEnvironmentSensors {
  greenhouseName: string;
  airTempC: number;
  relativeHumidityPercent: number;
  vpdKpa: number;
  lightLux: number;
  radiationWm2: number;
  co2Ppm?: number;
  ventilationActive: boolean;
  foggingActive: boolean;
  shadingScreenPercent: number;
}

export interface HydroponicAlert {
  id: string;
  timestamp: string;
  type: 'ph_fora' | 'ce_fora' | 'agua_baixa' | 'bomba_off' | 'temp_solucao_alta' | 'colheita_proxima' | 'falha_eletrica';
  severity: 'baixo' | 'moderado' | 'critico';
  title: string;
  description: string;
  targetEntity: string; // Ex: 'Reservatório 01', 'Bancada NFT-04'
  resolved: boolean;
}

export interface HydroponicCustomerOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerType: 'Supermercado' | 'Restaurante' | 'Quitanda/Hortifruti' | 'Distribuidor' | 'Consumidor Final';
  cropName: string;
  quantityBunched: number; // Maços ou pés
  unitPriceBrl: number;
  totalValueBrl: number;
  deliveryDateTarget: string;
  recurrence: 'Avulso' | 'Semanal (Seg/Qui)' | 'Semanal (Ter/Sex)' | 'Diário';
  status: 'agendado' | 'em_colheita' | 'faturado' | 'entregue';
}

export interface HydroponicFinancialSummary {
  monthYear: string;
  grossRevenueBrl: number;
  totalHarvestedUnits: number;
  totalHarvestedKg: number;
  
  costBreakdown: {
    fertilizers: number;
    seeds: number;
    phenolicFoamAndCups: number;
    electricity: number;
    water: number;
    packagingAndLabels: number;
    labor: number;
    transport: number;
  };
  
  totalOperatingCostBrl: number;
  netProfitBrl: number;
  profitMarginPercent: number;
  unitCostPerPlantBrl: number;
  unitSellingPriceAvgBrl: number;
}

export interface HydroponicPestDiseaseGuide {
  id: string;
  name: string;
  scientificName: string;
  category: 'doenca_radicular' | 'doenca_foliar' | 'praga' | 'fisiopatia_nutricional';
  affectedCrops: string[];
  symptoms: string[];
  preventiveMeasures: string[];
  correctiveActions: string[];
  solutionAdjustmentTip: string;
}

export interface HydroponicAnnotation {
  id: string;
  date: string;
  time: string;
  author: string;
  category:
    | 'manejo_solucao'
    | 'bancada_transplante'
    | 'colheita'
    | 'sanidade_pragas'
    | 'clima_estufa'
    | 'limpeza_manutencao'
    | 'geral';
  title: string;
  notes: string;
  benchId?: string;
  benchCode?: string;
  reservoirId?: string;
  reservoirName?: string;
  phValue?: number;
  ecValue?: number; // mS/cm
  waterRefilledLiters?: number;
  fertilizersAddedSummary?: string;
  pestOrDiseaseObserved?: string;
  temperatureC?: number;
  syncedWithFieldBook: boolean;
  fieldOperationId?: string;
  createdAt: string;
}
