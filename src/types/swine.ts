export type SwineTab =
  | 'dashboard'
  | 'flow_pipeline'
  | 'animals'
  | 'digital_twin'
  | 'reproduction'
  | 'maternity'
  | 'nursery'
  | 'grow_finish'
  | 'nutrition'
  | 'water'
  | 'environment'
  | 'health'
  | 'diseases_lib'
  | 'biosecurity'
  | 'inventory'
  | 'photo_diary'
  | 'ies_score'
  | 'reports'
  | 'suite_integration';

export type SwineSex = 'Fêmea' | 'Macho Castrado' | 'Cachaço (Reprodutor)';

export type SwineCategory =
  | 'Matriz Lactante'
  | 'Matriz Gestante'
  | 'Matriz Vazia / Pré-Cobertura'
  | 'Marrã / Leitoa de Reposição'
  | 'Cachaço / Rufião'
  | 'Leitão na Maternidade'
  | 'Leitão na Creche'
  | 'Suíno em Crescimento'
  | 'Suíno em Terminação'
  | 'Descartado / Abatido';

export type SwineBreedLineage =
  | 'Landrace'
  | 'Large White'
  | 'Duroc'
  | 'Pietrain'
  | 'Camborough (Agroceres PIC)'
  | 'Topigs Norsvin (TN70)'
  | 'DanBred'
  | 'Choice Genetics'
  | 'Moura (Crioulo)'
  | 'Mestiço Comercial';

export type SwineStatus =
  | 'Ativo'
  | 'Em Cobertura / IA'
  | 'Gestante'
  | 'Em Lactação'
  | 'Seca / Desmamada'
  | 'Quarentena'
  | 'Tratamento / Enfermaria'
  | 'Pronto para Abate'
  | 'Vendido'
  | 'Abatido'
  | 'Morto';

export type ProductionStage =
  | 'reproducao'
  | 'gestacao'
  | 'maternidade'
  | 'creche'
  | 'crescimento'
  | 'terminacao'
  | 'comercializacao';

export interface SwineWeighingRecord {
  id: string;
  date: string;
  weightKg: number;
  dailyGainKg?: number; // GMD (kg/dia)
  bodyConditionScore?: number; // ECC 1 to 5
  backfatMm?: number; // Espessura de toucinho P2 (mm)
  notes?: string;
}

export interface SwineHealthRecord {
  id: string;
  date: string;
  type: 'Vacina' | 'Vermifugação' | 'Antibiótico' | 'Anti-inflamatório' | 'Ferro Dextrano' | 'Cura de Umbigo' | 'Desgaste de Dentes/Cauda' | 'Outro';
  productName: string;
  activeIngredient?: string;
  batchNumber?: string;
  dosage: string;
  route: 'Intramuscular' | 'Subcutânea' | 'Oral' | 'Tópica' | 'Na Água' | 'Na Ração';
  withdrawalDays: number; // Período de carência carne (dias)
  withdrawalEndDate?: string;
  veterinarianOrOperator: string;
  reasonOrDiagnosis?: string;
  status: 'Concluído' | 'Em Andamento' | 'Programado';
  notes?: string;
}

export interface SwineReproductionRecord {
  id: string;
  date: string;
  eventType: 'Cobertura Natural' | 'Inseminação Artificial (IA)' | 'Diagnóstico de Gestação (DG)' | 'Parto' | 'Desmame' | 'Retorno ao Cio' | 'Aborto';
  boarOrSemenId?: string;
  boarBreed?: string;
  inseminatorName?: string;
  semenBatch?: string;
  dgResult?: 'Positivo (Gestante)' | 'Negativo (Vazia)' | 'Duvidoso';
  gestationDays?: number;
  expectedFarrowingDate?: string;
  // Parto details
  totalBorn?: number;
  bornAlive?: number;
  stillborn?: number; // Natimortos
  mummified?: number; // Mumificados
  litterBirthWeightKg?: number; // Peso total da leitegada
  avgPigletBirthWeightKg?: number; // Peso médio do leitão (kg)
  farrowingType?: 'Normal (Eutócico)' | 'Assistido / Ocitocina' | 'Cesariana';
  // Desmame details
  weaningDate?: string;
  pigletsWeaned?: number;
  totalWeaningWeightKg?: number;
  avgWeaningWeightKg?: number;
  lactationDays?: number;
  weanToEstrusIntervalDays?: number; // IDC
  notes?: string;
}

export interface SwineMovementRecord {
  id: string;
  date: string;
  fromLocation: string;
  toLocation: string;
  reason: 'Troca de Baia' | 'Entrada Maternidade' | 'Desmame para Creche' | 'Transferência Crescimento' | 'Transferência Terminação' | 'Embarque Abate' | 'Isolamento';
  operator: string;
}

export interface SwinePhotoRecord {
  id: string;
  date: string;
  imageUrl: string;
  title: string;
  category: 'Animal' | 'Leitegada' | 'Baia' | 'Lesão/Necropsia' | 'Instalação' | 'Manejo';
  description?: string;
  swineId?: string;
  batchId?: string;
  shedId?: string;
}

export interface SwineAnimal {
  id: string;
  code: string; // Brinco / Tatuagem / Número
  rfidOrQrCode?: string;
  name?: string;
  sex: SwineSex;
  breed: SwineBreedLineage;
  category: SwineCategory;
  status: SwineStatus;
  birthDate: string;
  entryDate: string;
  origin: string; // 'Nascido na Fazenda' | 'Granja Multiplicadora' | 'Compra Externa'
  sireCode?: string; // Pai
  damCode?: string; // Mãe
  currentBatchId?: string;
  currentShedId?: string;
  currentPenNumber?: string; // Número da baia / gaiola
  photoUrl?: string;
  initialWeightKg: number;
  currentWeightKg: number;
  bodyConditionScore: number; // 1 (Muito magra), 3 (Ideal), 5 (Obesa)
  teatCount?: number; // Número de tetos viáveis (ex: 14, 16)
  weighingHistory: SwineWeighingRecord[];
  healthHistory: SwineHealthRecord[];
  reproductionHistory: SwineReproductionRecord[];
  movements: SwineMovementRecord[];
  notes?: string;
}

export interface SwineBatch {
  id: string;
  code: string;
  stage: ProductionStage;
  lineage: SwineBreedLineage;
  shedId: string;
  shedName: string;
  startDate: string;
  expectedEndDate: string;
  initialAnimalsCount: number;
  currentAnimalsCount: number;
  mortalityCount: number;
  initialAvgWeightKg: number;
  currentAvgWeightKg: number;
  targetWeightKg: number;
  totalFeedConsumedKg: number;
  totalWaterConsumedL: number;
  feedConversionRatio: number; // CA = kg ração / kg ganho
  averageDailyGainG: number; // GMD em gramas/dia
  dailyFeedCostPerAnimal: number; // R$/dia
  status: 'Ativo' | 'Fechado' | 'Embarcado para Abate';
  notes?: string;
}

export interface FarrowingLitter {
  id: string;
  sowId: string;
  sowCode: string;
  farrowingDate: string;
  penNumber: string;
  totalBorn: number;
  bornAlive: number;
  stillborn: number;
  mummified: number;
  avgBirthWeightKg: number;
  litterUniformityCvPct: number; // Coeficiente de Variação do peso (%)
  colostrumIntakeChecked: boolean;
  splitNursingApplied: boolean;
  crossFosteredIn: number; // Leitões adotados recebidos
  crossFosteredOut: number; // Leitões doados para outra mãe
  currentPigletsCount: number;
  preWeaningMortalityCount: number;
  preWeaningMortalityCauses?: string[];
  weaningDate?: string;
  pigletsWeaned?: number;
  avgWeaningWeightKg?: number;
  lactationDurationDays?: number;
  status: 'Em Lactação' | 'Desmamada';
}

export interface SwineFeedDiet {
  id: string;
  name: string; // Ex: 'Pré-Inicial 1', 'Inicial 2', 'Crescimento 1', 'Terminação', 'Gestação', 'Lactação'
  phase: ProductionStage | 'gestacao' | 'lactacao' | 'marrans';
  recommendedWeightRange: string; // Ex: '6 - 12 kg'
  crudeProteinPct: number; // PB %
  metabolizableEnergyKcalKg: number; // EM kcal/kg
  digestibleLysinePct: number; // Lisina digestível %
  availablePhosphorusPct: number; // Fósforo disponível %
  calciumPct: number; // Cálcio %
  costPerKg: number; // R$/kg
  ingredients: {
    ingredientName: string;
    inclusionPct: number;
  }[];
  notes?: string;
}

export interface SwineFeedInventoryItem {
  id: string;
  name: string;
  category: 'Ração Pronta' | 'Milho / Grão' | 'Farelo de Soja' | 'Núcleo / Premix' | 'Medicamento' | 'Vacina' | 'Desinfetante' | 'Material de Manejo' | 'Dose de Sêmen';
  currentStock: number;
  unit: 'kg' | 'ton' | 'doses' | 'frascos' | 'L' | 'unidades';
  minimumStock: number;
  costPerUnit: number;
  supplier: string;
  expirationDate?: string;
  storageLocation: string;
}

export interface SwineShedEnvironment {
  id: string;
  name: string; // Ex: 'Galpão 01 - Maternidade A', 'Galpão 03 - Creche Climatizada'
  phase: ProductionStage;
  capacityAnimals: number;
  currentOccupancy: number;
  ventilationType: 'Natural / Cortinas' | 'Pressão Negativa / Túnel' | 'Ventilação Cruzada' | 'Com Pás de Teto';
  coolingType: 'Pad Cooling (Placas Evaporativas)' | 'Nebulização / Aspersão' | 'Nenhum';
  heatingType: 'Campânulas a Gás' | 'Pisos Aquecidos / Resistência' | 'Lâmpadas Infravermelho' | 'Nenhum';
  // Sensor readings
  temperatureC: number;
  targetTempC: number;
  relativeHumidityPct: number;
  targetHumidityPct: number;
  ammoniaNhpPpm: number; // Limite ideal < 10-15 ppm
  carbonDioxidePpm: number; // Limite ideal < 2500 ppm
  airSpeedMs: number; // Velocidade do ar (m/s)
  luminosityLux: number;
  waterDailyFlowL: number;
  comfortStatus: 'Conforto Ótimo' | 'Alerta Frio' | 'Alerta Calor' | 'Gases Elevados' | 'Umidade Crítica';
  lastCleanedDate: string;
  lastDisinfectedDate: string;
  disinfectantUsed: string;
  sanitaryBreakDaysRemaining: number; // Vazio sanitário
  notes?: string;
}

export interface SwineWaterPointCheck {
  id: string;
  shedId: string;
  shedName: string;
  date: string;
  drinkerType: 'Chupeta Nipple' | 'Bebedouro Pendular / Taça' | 'Calha Contínua';
  flowRateLMin: number; // Vazão medida (L/min)
  recommendedFlowLMin: number;
  flowStatus: 'Adequado' | 'Vazão Baixa' | 'Vazão Excessiva / Vazamento';
  ph: number; // 6.5 a 7.8
  chlorinePpm: number; // 2 a 4 ppm no ponto de consumo
  totalDissolvedSolidsMgL: number;
  cleaningDone: boolean;
  operator: string;
  notes?: string;
}

export interface SwineDiseaseInfo {
  id: string;
  name: string;
  scientificName?: string;
  category: 'Viral' | 'Bacteriana' | 'Parasitária' | 'Nutricional / Manejo';
  severity: 'Muito Alta (Notificação Obrigatória)' | 'Alta' | 'Média' | 'Baixa';
  affectedStages: string[];
  causativeAgent: string;
  transmission: string[];
  symptoms: string[];
  anatomopathologicalLesions: string[];
  preventionAndBiosecurity: string[];
  treatmentAndControl: string[];
  vaccinationAvailable: boolean;
  zoonosisRisk: boolean;
}

export interface SwineBiosecurityLog {
  id: string;
  date: string;
  type: 'Acesso de Visitante' | 'Caminhão de Ração' | 'Caminhão de Carga / Animais' | 'Vazio Sanitário' | 'Controle de Roedores / Moscas' | 'Destino de Carcaças / Compostagem' | 'Quarentena de Reposição';
  description: string;
  downtimeHoursObserved?: number; // Vazio de contato prévio com suínos (min 48-72h)
  showerTakenAndBootsChanged: boolean;
  vehicleDisinfected: boolean;
  status: 'Conforme' | 'Não Conforme / Advertência' | 'Pendente';
  responsibleName: string;
  notes?: string;
}

export interface SwineIESScore {
  totalScore: number; // 0 to 100
  classification: 'Excelente (Padrão Ouro)' | 'Muito Bom' | 'Regular / Atenção' | 'Crítico';
  feedConversionScore: number; // peso 25%
  gmdScore: number; // peso 20%
  mortalityScore: number; // peso 20%
  reproductiveEfficiencyScore: number; // peso 15%
  environmentComfortScore: number; // peso 10%
  biosecurityComplianceScore: number; // peso 10%
  keyRecommendations: string[];
}

// Aliases for sub-views flexibility
export type SwineDiet = SwineFeedDiet;
export type SwineWaterLog = SwineWaterPointCheck;
export type SwineBiosecurityCheck = SwineBiosecurityLog;
export type SwineInventoryItem = SwineFeedInventoryItem;
export type SwineDiseaseGuide = SwineDiseaseInfo;
export type SwinePhotoDiaryEntry = SwinePhotoRecord;

