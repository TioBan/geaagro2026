export type PoultryTab =
  | 'dashboard'
  | 'lote_twin'
  | 'galpao_twin'
  | 'ambiente'
  | 'nutricao'
  | 'agua'
  | 'pesagem'
  | 'sanidade'
  | 'banco_doencas'
  | 'biosseguridade'
  | 'producao'
  | 'rastreabilidade';

export type PoultryPurpose = 'Corte' | 'Postura' | 'Reprodução';

export interface PoultryWeighing {
  id: string;
  date: string;
  averageWeight: number; // gramas
  uniformity: number; // %
  dailyGain: number; // gramas
}

export interface PoultryConsumption {
  id: string;
  date: string;
  feedType: string;
  feedConsumed: number; // kg
  waterConsumed: number; // Litros
}

export interface PoultryHealthEvent {
  id: string;
  date: string;
  type: 'Vacina' | 'Tratamento' | 'Necropsia' | 'Mortalidade';
  description: string;
  quantity?: number; // Para mortalidade
}

export interface PoultryProduction {
  id: string;
  date: string;
  totalEggs?: number;
  brokenEggs?: number;
  eggWeightAverage?: number; // gramas
}

export interface PoultryBatch {
  id: string;
  code: string;
  lineage: string;
  purpose: PoultryPurpose;
  housingDate: string;
  initialQuantity: number;
  currentQuantity: number;
  supplier: string;
  hatchery: string;
  shedId: string;
  technicalResponsible: string;
  weighings: PoultryWeighing[];
  consumptions: PoultryConsumption[];
  healthEvents: PoultryHealthEvent[];
  productions: PoultryProduction[];
}

export interface EnvironmentRecord {
  id: string;
  date: string;
  temperature: number; // °C
  humidity: number; // %
  ammonia: number; // ppm
  co2: number; // ppm
}

export interface PoultryShed {
  id: string;
  identification: string;
  capacity: number;
  dimensions: string;
  ventilationType: string;
  heatingSystem: string;
  environmentHistory: EnvironmentRecord[];
}

export interface PoultryDisease {
  id: string;
  name: string;
  agent: string;
  symptoms: string;
  prevention?: string;
  management: string;
  etiology: string;
  control: string;
  care: string;
  image?: string;
  transmission?: string;
  mortality?: string;
  incubation?: string;
}

export interface IEA_Result {
  score: number;
  feedConversion: number;
  mortalityRate: number;
  uniformity: number;
  status: 'Excelente' | 'Bom' | 'Atenção' | 'Crítico';
}
