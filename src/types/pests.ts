export type PestTab =
  | 'dashboard'
  | 'radar'
  | 'mapa'
  | 'monitoramento'
  | 'armadilhas'
  | 'banco_pragas'
  | 'inimigos_naturais'
  | 'curvas'
  | 'manejo'
  | 'diario'
  | 'biblioteca';

export type PestStage = 'Ovo' | 'Ninfa' | 'Larva' | 'Pupa' | 'Adulto';
export type PopulationTrend = 'Crescente' | 'Estável' | 'Decrescente';
export type TrapType = 'Adesiva' | 'Luminosa' | 'Feromônio' | 'Alimentar' | 'Cromática';

export interface PestSpecies {
  id: string;
  scientificName: string;
  commonName: string;
  order: string;
  family: string;
  classificationDetails?: string;
  biologicalCycle: string;
  cycleDetails?: {
    eggDays?: string;
    nymphOrLarvaDays?: string;
    pupaDays?: string;
    adultDays?: string;
    totalCycleDays?: string;
    reproductionInfo?: string;
  };
  hosts: string[]; // Primary crops (Milho, Soja, Algodão, Feijão, etc.)
  otherHosts?: string[]; // Secondary/wild hosts
  geographicalDistribution: string;
  damage: string;
  economicDamageDetails?: {
    directDamage?: string;
    indirectDamage?: string;
    yieldLossPercentage?: string;
    vectorDiseases?: string;
  };
  etiologyBioecology?: string;
  controlMethods?: {
    chemical?: string;
    physical?: string;
    cultural?: string;
    biological?: string;
  };
  nutritionalRelations?: string; // Interação com estado nutricional da planta (N, K, Ca, Si, Zn, etc)
  criticalPeriods: string[]; // Phenological stages
  naturalEnemies: string[];
  monitoringMethods: string;
  managementStrategies: string;
  actionThresholds: {
    stage: string;
    threshold: number; // e.g., per meter or per plant
    unit: string;
  }[];
}

export interface Trap {
  id: string;
  code: string;
  fieldId: string;
  type: TrapType;
  gpsLocation: string;
  heightCm: number;
  installationDate: string;
  lastReplacementDate: string;
  targetPestId?: string;
  totalCaptured: number;
}

export interface PestInspection {
  id: string;
  date: string;
  fieldId: string;
  pointCode: string;
  responsible: string;
  pestId: string;
  stage: PestStage;
  quantityObserved: number;
  plantsEvaluated: number;
  infestationPercentage: number;
  severity: 'Baixa' | 'Média' | 'Alta';
  notes: string;
  photos: string[];
}

export interface NaturalEnemy {
  id: string;
  commonName: string;
  scientificName: string;
  type: 'Predador' | 'Parasitoide' | 'Fungo Entomopatogênico';
  targetPests: string[];
}

export interface PestManagement {
  id: string;
  date: string;
  fieldId: string;
  type: 'Biológico' | 'Químico' | 'Cultural' | 'Mecânico';
  product: string;
  dose: string;
  equipment: string;
  climateConditions: string;
}

export interface PestField {
  id: string;
  farmName: string;
  fieldName: string;
  areaHa: number;
  crop: string;
  cultivar: string;
  plantingDate: string;
  currentPhenologicalStage: string;
  inspections: PestInspection[];
  traps: Trap[];
  managements: PestManagement[];
}
