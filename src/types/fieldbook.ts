export type FieldBookSubTab = 
  | 'dashboard' 
  | 'operations' 
  | 'fields' 
  | 'digital_twin' 
  | 'producao_mudas' 
  | 'hidroponia'
  | 'tankmix'
  | 'plantabilidade'
  | 'avicultura'
  | 'nutricao_animal'
  | 'pecuaria'
  | 'suinocultura'
  | 'nematology'
  | 'nematologia'
  | 'recomendacoes' 
  | 'reports' 
  | 'global_gap'
  | 'solos'
  | 'foliar'
  | 'analise_agua'
  | 'brix'
  | 'fenologia'
  | 'irrigacao'
  | 'pluviometria'
  | 'meteorologia'
  | 'doencas_solo'
  | 'custos'
  | 'relatorios'
  | 'historico'
  | 'bulario_vet'
  | 'bulario'
  | 'bubalinos'
  | 'caprinos'
  | 'equinos';

export interface FieldOperation {
  id: string;
  farmId: string;
  fieldId: string;
  type: 
    | 'soil_prep' 
    | 'planting' 
    | 'nursery_sowing' 
    | 'nursery_transplant' 
    | 'nursery_hardening' 
    | 'poultry_housing'
    | 'poultry_vaccination'
    | 'poultry_litter_prep'
    | 'poultry_harvest'
    | 'hydroponics_planting'
    | 'hydroponics_nutrient'
    | 'hydroponics_harvest'
    | 'hydroponics_ph_ec'
    | 'hydroponics_sanitation'
    | 'hydroponics_diary'
    | 'tankmix_application'
    | 'plantability_evaluation'
    | 'buffalo_milking'
    | 'buffalo_sanitary'
    | 'caprine_vaccination'
    | 'caprine_milk'
    | 'equine_farriery'
    | 'equine_vaccination'
    | 'swine_weaning'
    | 'swine_feeding'
    | 'fertility' 
    | 'spraying' 
    | 'irrigation' 
    | 'harvest' 
    | 'phenology' 
    | 'monitoring' 
    | 'other';
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  date: string;
  responsible: string;
  notes?: string;
  
  // Specific data based on type
  details: {
    // Soil Prep
    machine?: string;
    implement?: string;
    workedHours?: number;
    fuelUsed?: number;
    
    // Planting / Transplanting
    crop?: string;
    variety?: string;
    seedLot?: string;
    population?: number;
    spacing?: number;
    depth?: number;

    // Produção de Mudas & Rastreabilidade de Viveiro
    nurseryBatchId?: string; // ID ou Código do Lote no Viveiro (ex: LOTE-255)
    seedlingCount?: number; // Quantidade de mudas transplantadas
    trayType?: string; // ex: 128 células, 200 células, tubetes
    substrateType?: string; // ex: Carolina Soil, Fibra de Coco
    greenhouseOrigin?: string; // Estufa de origem no viveiro
    hardeningDays?: number; // Dias de rustificação
    transplantSuccessPct?: number; // % de pegamento pós-transplante
    phytosanitaryStatus?: string; // Certificado de Sanidade / Atestado

    // Hidroponia & Estufas
    benchCode?: string; // Ex: BANC-NFT-01
    benchId?: string;
    reservoirId?: string;
    reservoirName?: string;
    systemType?: string; // NFT, DFT, Gotejo, Aeroponia
    greenhouseSection?: string;
    phMeasured?: number;
    ecMeasured?: number; // mS/cm
    solutionTempC?: number;
    dissolvedOxygenPpm?: number;
    nutrientAction?: string; // 'Ajuste de pH', 'Reposição de Água', 'Adição de Fertilizantes A/B', 'Troca de Solução'
    harvestedUnits?: number; // Pés / maços colhidos
    phytosanitaryObservation?: string;
    
    // Fertility / Spraying / TankMix
    product?: string;
    dose?: number;
    volume?: number;
    target?: string;
    safetyInterval?: number;
    
    // TankMix Calda & Defensivos Integration
    sprayOrderCode?: string;
    tankMixProducts?: Array<{ productName: string; dose: string; additionOrder: number; category: string }>;
    waterPh?: number;
    waterHardnessPpm?: number;
    carrierVolumeHa?: number;
    sprayTip?: string;
    tankCapacityLiters?: number;
    driftRiskLevel?: 'baixo' | 'medio' | 'alto' | 'critico';
    
    // Irrigation
    system?: string;
    waterBlade?: number;
    durationMinutes?: number;
    
    // Monitoring
    pestOrDisease?: string;
    intensity?: 'low' | 'medium' | 'high';
    affectedAreaPct?: number;

    // Plantabilidade & Qualidade de Semeadura
    pointCode?: string;
    acceptablePct?: number;
    cvPct?: number;
    doublesPct?: number;
    gapsPct?: number;
    skipsPct?: number;
    speedKmh?: number;
    actualPopulation?: number;
    targetPopulation?: number;
    planterName?: string;
    evaluationsCount?: number;
    samplePointsCount?: number;
  };

  costs?: {
    operation: number;
    inputs: number;
    machine: number;
    labor: number;
    total: number;
  };
  
  photos?: string[];
  weather?: {
    temperature: number;
    humidity: number;
    windSpeed: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Field {
  id: string;
  farmId: string;
  name: string;
  areaHa: number;
  crop: string;
  variety: string;
  season: string;
  soilType: string;
  coordinates: { lat: number; lng: number }[];
  activeNurseryBatchId?: string; // Vínculo com lote de mudas
  seedlingTransplantDate?: string;
  seedlingCount?: number;
}

export interface FieldBookDashboardSummary {
  todayOperations: number;
  plannedOperations: number;
  activeFields: number;
  cultivatedAreaHa: number;
  totalCosts: number;
  machineryHours: number;
  fuelUsedLiters: number;
  iggsScore: number; // Índice GeaAgro de Gestão da Safra
}
