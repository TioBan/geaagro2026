export type LivestockTab =
  | 'dashboard'
  | 'animal_twin'
  | 'pasture_twin'
  | 'ispa'
  | 'weight'
  | 'reproduction'
  | 'health'
  | 'nutrition'
  | 'genetics'
  | 'milk'
  | 'beef'
  | 'pharmacy'
  | 'analytics';

export type AnimalCategory = 'Bezerro(a)' | 'Novilha' | 'Garrote' | 'Vaca' | 'Touro' | 'Boi Magro' | 'Boi Gordo';
export type AnimalPurpose = 'Corte' | 'Leite' | 'Misto';

export interface WeightRecord {
  id: string;
  date: string;
  weight: number; // kg
  gmd?: number; // kg/day
  bodyConditionScore: number; // 1 to 5
}

export interface HealthRecord {
  id: string;
  date: string;
  type: 'Vacina' | 'Vermífugo' | 'Tratamento' | 'Exame';
  description: string;
  product?: string;
  gracePeriodDays?: number; // Carência
}

export interface ReproductionRecord {
  id: string;
  date: string;
  type: 'Cio' | 'IA' | 'IATF' | 'Monta Natural' | 'Diagnóstico Gestação' | 'Parto' | 'Aborto';
  result?: string;
  bullId?: string;
  notes?: string;
}

export interface MilkRecord {
  id: string;
  date: string;
  volume: number; // L
  ccs?: number;
  fatPercentage?: number;
  proteinPercentage?: number;
}

export interface Animal {
  id: string;
  rfid: string;
  name: string;
  number: string;
  species: 'Bovina' | 'Ovina' | 'Caprina' | 'Equina';
  breed: string;
  sex: 'M' | 'F';
  birthDate: string;
  category: AnimalCategory;
  purpose: AnimalPurpose;
  batch: string; // Lote
  origin: string;
  paddockId: string; // Piquete atual
  bloodDegree: string; // Grau de sangue
  birthWeight: number;
  currentWeight: number;
  photos: string[];
  weightHistory: WeightRecord[];
  healthHistory: HealthRecord[];
  reproHistory: ReproductionRecord[];
  milkHistory?: MilkRecord[];
}

export interface PaddockRecord {
  id: string;
  date: string;
  event: 'Entrada' | 'Saída' | 'Manejo' | 'Adubação';
  biomassKgHa?: number;
  heightCm?: number;
  notes?: string;
}

export interface Paddock {
  id: string;
  name: string;
  areaHa: number;
  forageSpecies: string;
  cultivar: string;
  currentHeightCm: number;
  targetHeightCm: number;
  currentBiomassKgHa: number;
  stockingRateAU: number; // Taxa de lotação UA/ha
  restDays: number;
  occupationDays: number;
  history: PaddockRecord[];
}

// Integrated Soil-Plant-Animal (ISPA) Metrics
export interface ISPAMetrics {
  soilPhosphorus: number; // mg/dm3
  soilStatus: 'Baixo' | 'Médio' | 'Alto';
  pastureGrowthRate: number; // kg MS/ha/dia
  pastureStatus: 'Degradada' | 'Recuperação' | 'Produtiva';
  animalGmd: number; // kg/dia
  animalStatus: 'Abaixo' | 'Meta' | 'Acima';
  costPerArroba: number; // R$
  profitabilityImpact: 'Negativo' | 'Neutro' | 'Positivo';
}
