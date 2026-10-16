export type AnimalSpecies =
  | 'bovinos_leite'
  | 'bovinos_corte'
  | 'bezerros'
  | 'bubalinos'
  | 'caprinos'
  | 'ovinos'
  | 'suinos'
  | 'aves_corte'
  | 'aves_postura'
  | 'reprodutores'
  | 'equinos'
  | 'peixes';

export type IngredientCategory =
  | 'energeticos'
  | 'proteicos'
  | 'volumosos'
  | 'minerais'
  | 'vitaminas'
  | 'aditivos';

export interface NutritionalBromatology {
  dryMatterPct: number; // Matéria Seca (% MS)
  crudeProteinPct: number; // Proteína Bruta (% MS)
  metabolizableEnergyMcal: number; // EM (Mcal/kg MS)
  netEnergyElm: number; // ELm - Manutenção (Mcal/kg MS)
  netEnergyElg: number; // ELg - Ganho (Mcal/kg MS)
  netEnergyEll: number; // ELl - Lactação (Mcal/kg MS)
  ndfPct: number; // FDN (% MS)
  adfPct: number; // FDA (% MS)
  tdnPct: number; // NDT (% MS)
  peNdfPct: number; // FDN efetivo / fisicamente efetivo (% MS)
  starchPct: number; // Amido (% MS)
  sugarsPct: number; // Açúcares solúveis (% MS)
  etherExtractPct: number; // Extrato Etéreo (% MS)
  calciumPct: number; // Cálcio (% MS)
  phosphorusPct: number; // Fósforo (% MS)
  potassiumPct: number; // Potássio (% MS)
  magnesiumPct: number; // Magnésio (% MS)
  sodiumPct: number; // Sódio (% MS)
  sulfurPct: number; // Enxofre (% MS)
  chlorinePct: number; // Cloro (% MS)
  zincPpm: number; // Zinco (mg/kg)
  copperPpm: number; // Cobre (mg/kg)
  manganesePpm: number; // Manganês (mg/kg)
  seleniumPpm: number; // Selênio (mg/kg)
  cobaltPpm: number; // Cobalto (mg/kg)
  iodinePpm: number; // Iodo (mg/kg)
  lysinePct?: number; // Lisina digestível (%)
  methioninePct?: number; // Metionina digestível (%)
  threoninePct?: number; // Treonina (%)
  tryptophanPct?: number; // Triptofano (%)
  dmdPct: number; // Digestibilidade da Matéria Seca (%)
  minInclusionPct: number; // Limite mínimo de inclusão na dieta (% MS)
  maxInclusionPct: number; // Limite máximo de inclusão na dieta (% MS)
  antiNutritionalFactors?: string;
  processingType?: string;
}

export interface FeedIngredient {
  id: string;
  name: string;
  category: IngredientCategory;
  bromatology: NutritionalBromatology;
  pricePerKg: number; // Preço base em R$/kg
  freightPerTon: number; // Frete em R$/t
  operationalCostPct: number; // Custos operacionais e quebra (%)
  stockKg: number; // Estoque atual disponível (kg)
  minStockAlertKg: number; // Ponto de reposição / Alerta estoque baixo (kg)
  supplier?: string;
  notes?: string;
  isCustom?: boolean;
}

export interface AnimalProfile {
  id: string;
  name: string; // Ex: "Lote Lactação 1", "Confinamento Piquete A", "Matrizes PO"
  species: AnimalSpecies;
  category: string; // Ex: "Vacas Alta Produção (35L)", "Boi Gordo Terminação", "Frango Corte 28-42d"
  breed: string; // Holandesa, Girolando, Nelore, Angus, Dorper, Cobb 500, Landrace, etc.
  sex: 'macho' | 'femea' | 'misto';
  ageMonths: number;
  currentWeightKg: number; // Peso Vivo médio (PV)
  bodyConditionScore: number; // Escore corporal (1.0 a 5.0 ou 1 a 9)
  count: number; // Quantidade de animais no lote
  productionGoal: {
    type: 'leite' | 'carne' | 'ovos' | 'manutencao' | 'trabalho';
    targetMilkLitersDay?: number;
    milkFatPct?: number;
    milkProteinPct?: number;
    targetAdgKgDay?: number; // Ganho Médio Diário esperado (kg/dia)
    eggsPerDayPct?: number; // % de postura
  };
  targetDmiKgDay: number; // CMS estimado (kg MS/cab/dia)
  lotNumber: string;
  farmLocation?: string;
}

export interface NutritionalRequirement {
  dmiKgDay: { min: number; target: number; max: number };
  pbPct: { min: number; target: number };
  ndtPct: { min: number; target: number };
  emMcalKg: { min: number; target: number };
  elmMcalKg?: { min: number; target: number };
  elgMcalKg?: { min: number; target: number };
  ellMcalKg?: { min: number; target: number };
  ndfPct: { min: number; target: number; max: number };
  peNdfPct: { min: number; target: number };
  starchPct: { max: number };
  caPct: { min: number; target: number; max: number };
  pPct: { min: number; target: number; max: number };
  caPRatio: { min: number; max: number };
  naPct: { min: number; target: number };
  sPct: { min: number; max: number };
  dcadMeq?: { min: number; max: number }; // DCAD (mEq/kg MS)
  lysinePct?: { min: number };
  methioninePct?: { min: number };
}

export interface DietFormulationItem {
  ingredientId: string;
  inclusionPctMs: number; // % de inclusão na Matéria Seca total
  inclusionKgMsPerAnimal: number; // kg MS por animal/dia
  inclusionKgMnPerAnimal: number; // kg Matéria Natural por animal/dia
  inclusionKgBatch: number; // kg Matéria Natural para a batelada total
  costPerAnimalDay: number; // R$/animal/dia para este ingrediente
}

export interface DietCostSummary {
  costPerKgMs: number; // R$/kg MS
  costPerKgMn: number; // R$/kg MN
  costPerAnimalDay: number; // R$/animal/dia
  costPerAnimalMonth: number; // R$/animal/mês
  costPerBatch: number; // R$/batelada do misturador
  costPerLiterMilk?: number; // R$/litro de leite produzido
  costPerKgGain?: number; // R$/kg de ganho de peso (custo alimentar da arroba/kg)
  costPerDozenEggs?: number; // R$/dúzia de ovos
  incomeOverFeedCostDaily?: number; // IOFC diário por animal (R$/dia)
}

export interface MetabolicHealthAlert {
  saraRisk: 'baixo' | 'moderado' | 'alto'; // Subacute Ruminal Acidosis
  saraReason?: string;
  ketosisRisk: 'baixo' | 'moderado' | 'alto'; // Cetose
  ketosisReason?: string;
  milkFeverDcadRisk: 'adequado' | 'alerta_alcalogenico' | 'alerta_acidificante';
  dcadValueMeqKg: number;
  sulfurToxicityRisk: 'seguro' | 'alerta' | 'toxico';
  mycotoxinRisk: 'baixo' | 'moderado' | 'alto';
  mycotoxinAdvice?: string;
  alerts: string[];
}

export interface IgenBreakdown {
  score: number; // 0 - 100 (Índice GeaAgro de Eficiência Nutricional)
  nutritionalAdherence: number; // 0 - 100 (Aderência às exigências)
  economicEfficiency: number; // 0 - 100 (Sub-índice do custo da dieta e custo/kg ganho)
  digestiveHealth: number; // 0 - 100 (Saúde ruminal/digestiva)
  productivePotential: number; // 0 - 100 (Potencial de ganho/produção)
  feedConversionEfficiency?: number; // 0 - 100 (Sub-índice de conversão alimentar)
  
  // Métricas Consolidadas do IGEN
  dietCostDaily?: number; // Custo diário da dieta (R$/animal/dia)
  feedConversion?: number; // Conversão alimentar (kg MS / kg ganho de peso ou kg MS / L de leite)
  expectedGain?: number; // Ganho de peso esperado (kg/dia) ou Produção esperada (L/dia)
  costPerKgGain?: number; // Custo alimentar por kg de ganho de peso (R$/kg ganho)
  
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  summary: string;
  recommendations?: string[];
}

export interface DigitalTwinValidation {
  id: string;
  date: string;
  formulationVersion: number;
  observedMilkLiters?: number;
  observedAdgKg?: number;
  milkDeviation?: number;
  feedRefusalPct?: number;
  fecalScore?: number;
  dryMatterIntakeKg?: number;
  notes?: string;
  recommendedAdjustments?: string;
}

export interface DietDigitalTwinEntry {
  id: string;
  timestamp: string;
  version: number;
  changeDescription: string;
  operator: string;
  observedMilkLiters?: number;
  observedAdgKg?: number;
  feedRefusalPct?: number; // Sobras de cocho (%)
  manureConsistencyScore?: number; // Escore de fezes (1 a 5)
  photoUrl?: string;
  notes?: string;
}

export interface DietFormulation {
  id: string;
  name: string;
  species: AnimalSpecies;
  category: string;
  animalProfileId?: string;
  animalCount: number;
  targetBatchKg: number; // Tamanho da batelada (ex: 1000 kg, 3000 kg, 5000 kg)
  createdAt: string;
  updatedAt: string;
  version: number;
  isLocked?: boolean;
  items: DietFormulationItem[];
  totalDmiKgPerAnimal: number;
  totalDmnKgPerAnimal: number;
  calculatedBromatology: NutritionalBromatology;
  costs: DietCostSummary;
  metabolicHealth: MetabolicHealthAlert;
  igen: IgenBreakdown;
  forageToConcentrateRatio: { foragePct: number; concentratePct: number };
  digitalTwin: any[];
  notes?: string;
}

export interface ScenarioSimulation {
  id: string;
  name: string;
  strategy: 'least_cost' | 'max_gain' | 'max_milk' | 'best_fcr' | 'max_margin';
  description: string;
  formulation: DietFormulation;
  expectedAdgKg?: number;
  expectedMilkLiters?: number;
  feedConversionRatio: number; // CA (kg ração / kg produto)
  economicMarginPerAnimalDay: number; // R$/cab/dia
}

export interface ForageProductionPlan {
  id: string;
  name: string;
  forageType: 'silagem_milho' | 'silagem_sorgo' | 'cana_acucar' | 'feno_tifton' | 'capineira' | 'pastagem_rotacionada';
  areaHectares: number;
  expectedYieldTonPerHa: number;
  currentStockTon: number;
  monthlyConsumptionTon: number;
  monthsOfAutonomy: number;
  stockStatus: 'confortavel' | 'atencao' | 'critico';
  dryMatterPct: number;
  costPerTon: number;
}
