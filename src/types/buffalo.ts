export type BuffaloBreed = 
  | 'Murrah'
  | 'Mediterrâneo'
  | 'Jafarabadi'
  | 'Carabao'
  | 'Baio'
  | 'Mestiço Bubalino';

export type BuffaloCategory = 
  | 'Matriz em Lactação'
  | 'Matriz Seca'
  | 'Matriz Gestante Seca'
  | 'Reprodutor (Touro)'
  | 'Bezerra (0-6m)'
  | 'Bezerro (0-6m)'
  | 'Novilha em Recria (7-24m)'
  | 'Garrote em Engorda'
  | 'Búfalo em Terminação'
  | 'Rufião';

export type BuffaloCoatColor = 
  | 'Preta'
  | 'Parda Escura'
  | 'Baia / Castanha'
  | 'Ruana'
  | 'Preta com Estrela Branca na Testa'
  | 'Cinza Ardosia';

export type BuffaloStatus = 
  | 'Ativo'
  | 'Em Lactação'
  | 'Seca'
  | 'Gestante'
  | 'Inseminada'
  | 'Quarentena'
  | 'Tratamento Sanitário'
  | 'Vendido'
  | 'Abatido'
  | 'Descartado';

export type BuffaloPurpose = 'Leite' | 'Corte' | 'Dupla Aptidão' | 'Genética / PO';

export type BuffaloTab = 
  | 'dashboard'
  | 'animais'
  | 'gemeo_digital'
  | 'genealogia'
  | 'reproducao'
  | 'bezerros'
  | 'leite'
  | 'corte'
  | 'nutricao'
  | 'pastagens'
  | 'bem_estar_agua'
  | 'sanidade'
  | 'doencas'
  | 'farmacia'
  | 'instalacoes'
  | 'diario_fotos'
  | 'mapa'
  | 'relatorios';

export interface BuffaloWeighing {
  id: string;
  date: string;
  weightKg: number;
  bodyConditionScore: number; // 1 to 5 (1=Muito Magro, 3=Ideal, 5=Obeso)
  dailyGainKg?: number; // GMD
  chestCircumferenceCm?: number;
  withersHeightCm?: number;
  notes?: string;
}

export interface BuffaloHealthRecord {
  id: string;
  date: string;
  type: 'Vacina' | 'Vermifugação' | 'Ectoparasiticida' | 'Tratamento Clínico' | 'Exame Diagnóstico' | 'Casqueamento';
  productName: string;
  activeIngredient?: string;
  batchNumber?: string;
  dosage: string;
  route: 'Subcutânea' | 'Intramuscular' | 'Pour-on' | 'Oral' | 'Intramamária' | 'Tópica' | 'Intradérmica' | 'Endovenosa';
  milkWithdrawalDays: number; // Carência leite
  meatWithdrawalDays: number; // Carência carne
  veterinarian: string;
  status: 'Concluído' | 'Programado' | 'Em Andamento';
  notes?: string;
}

export interface BuffaloReproductionRecord {
  id: string;
  date: string;
  eventType: 'Cobertura Natural' | 'Inseminação Artificial (IA)' | 'Protocolo IATF' | 'Diagnóstico de Gestação (DG)' | 'Parto' | 'Aborto' | 'Secagem';
  bullOrSemenCode?: string;
  bullBreed?: BuffaloBreed;
  inseminator?: string;
  dgResult?: 'Positivo (Gestante)' | 'Negativo (Vazia)' | 'Dúvidoso';
  gestationDays?: number;
  expectedCalvingDate?: string;
  calvingType?: 'Eutócico (Normal)' | 'Distócico Leve' | 'Distócico Cirúrgico';
  calfId?: string;
  calfSex?: 'Macho' | 'Fêmea' | 'Gêmeos';
  calfBirthWeightKg?: number;
  calfVigor?: 'Excelente' | 'Bom' | 'Fraco';
  protocolName?: string; // ex: IATF Ovsynch Bubalino com eCG
  notes?: string;
}

export interface BuffaloMilkRecord {
  id: string;
  date: string;
  milkingSession: '1ª Ordenha (Manhã)' | '2ª Ordenha (Tarde)' | 'Total do Dia';
  productionLiters: number;
  fatPercentage?: number; // Típico: 6.5 - 9.0%
  proteinPercentage?: number; // Típico: 4.0 - 4.8%
  lactosePercentage?: number; // Típico: 4.8 - 5.2%
  totalSolidsPercentage?: number; // Típico: 16.5 - 19.5%
  somaticCellCountThousands?: number; // CCS (mil/mL)
  totalBacterialCountThousands?: number; // CBT
  cmtScore?: 'Negativo' | 'Traços' | 'Grau 1' | 'Grau 2' | 'Grau 3'; // California Mastitis Test
  estimatedMozzarellaYieldKg?: number; // Rendimento de queijo mozzarella D.O.P.
  notes?: string;
}

export interface BuffaloPhoto {
  id: string;
  date: string;
  url: string;
  caption: string;
  tag: 'Identificação' | 'Parto' | 'Úbere / Lactação' | 'Casco' | 'Lesão' | 'Piquete / Banho' | 'Instalação';
}

export interface BuffaloAnimal {
  id: string;
  identificationNumber: string; // Brinco / Número
  rfidCode?: string;
  name: string;
  breed: BuffaloBreed;
  sex: 'Fêmea' | 'Macho';
  category: BuffaloCategory;
  coatColor: BuffaloCoatColor;
  birthDate: string;
  purpose: BuffaloPurpose;
  ownerFarm: string;
  batchName: string; // Ex: Lote Alta Produção, Lote Maternidade
  paddockId?: string;
  status: BuffaloStatus;
  bloodDegree: 'PO (Puro de Origem)' | 'PC (Puro por Cruza)' | 'PA (Puro por Absorção)' | 'Mestiço F1' | 'Comercial';
  registrationCodeABCB?: string; // Registro na Associação Brasileira de Criadores de Búfalos
  currentWeightKg: number;
  birthWeightKg: number;
  bodyConditionScore: number; // 1 to 5
  
  // Genealogia
  sireId?: string; // Pai
  sireName?: string;
  sireRegistration?: string;
  damId?: string; // Mãe
  damName?: string;
  damRegistration?: string;
  paternalGrandsire?: string;
  paternalGranddam?: string;
  maternalGrandsire?: string;
  maternalGranddam?: string;
  geneticLineage?: string; // ex: Linhagem Murrah Italiana, Jafarabadi da Índia

  // Reprodução
  parityCount: number; // Número de partos
  calvingIntervalDays?: number; // IEP
  lastCalvingDate?: string;
  lastInseminationDate?: string;
  expectedCalvingDate?: string;
  daysInMilk?: number; // DEL
  lactationStatus?: 'Em Lactação' | 'Seca' | 'Nulípara' | 'Pré-parto';

  // Produção acumulada
  totalLactations?: number;
  accumulatedMilkKg?: number;
  averageDailyMilkLiters?: number;
  averageFatPct?: number;
  averageProteinPct?: number;
  
  // Bem-estar & Biometria
  thermalComfortScore: number; // 0 to 100
  favoriteWaterPointId?: string;

  // Coleções
  weighings: BuffaloWeighing[];
  healthRecords: BuffaloHealthRecord[];
  reproductionRecords: BuffaloReproductionRecord[];
  milkRecords: BuffaloMilkRecord[];
  photos: BuffaloPhoto[];
  notes?: string;
}

export interface BuffaloPaddock {
  id: string;
  name: string;
  areaHa: number;
  forageSpecies: string; // ex: Brachiaria humidicola, Mombaça, Capim Angola (Brachiaria mutica), Paspalum
  currentCanopyHeightCm: number;
  entryCanopyHeightCm: number;
  exitCanopyHeightCm: number;
  forageMassKgMsPerHa: number;
  carryingCapacityAnimalUnits: number; // UA/ha
  currentStockingRateUaHa: number;
  currentAnimalCount: number;
  restDaysTarget: number;
  currentRestDays: number;
  occupationDaysTarget: number;
  currentOccupationDays: number;
  status: 'Ocupado' | 'Em Descanso' | 'Diferido' | 'Em Reforma' | 'Adubado';
  waterPointType: 'Açude Natural' | 'Lagoa de Banho' | 'Bebedouro Artificial' | 'Brejo Controlado';
  shadeAreaPct: number; // % área sombreada
  soilFertilityScore: 'Excelente' | 'Boa' | 'Média' | 'Baixa';
  lastFertilizationDate?: string;
  irrigation: boolean;
  notes?: string;
}

export interface BuffaloWaterPoint {
  id: string;
  name: string;
  type: 'Açude de Banho' | 'Represa de Resfriamento' | 'Lagoa Escavada' | 'Bebedouro de Alta Vazão' | 'Sistema de Aspersão/Nebulização';
  locationPaddock: string;
  capacityM3: number;
  currentWaterQuality: 'Excelente' | 'Boa' | 'Regular (Necessita Limpeza)' | 'Crítica';
  waterTemperatureC: number;
  dailyConsumptionM3: number;
  hasMudWall: boolean; // Área de lama para proteção contra insetos e sol
  bathAreaCapacityAnimals: number;
  maintenanceStatus: 'Operacional' | 'Em Manutenção' | 'Limpeza Agendada';
  notes?: string;
}

export interface BuffaloThermalWelfareIndex {
  date: string;
  ambientTemperatureC: number;
  relativeHumidityPct: number;
  blackGlobeTemperatureC: number;
  windSpeedKmH: number;
  thiCalculated: number; // Temperature-Humidity Index (ITU)
  bgthiCalculated: number; // BGT Index
  stressLevel: 'Normal / Conforto Pleno' | 'Alerta Leve' | 'Estresse Moderado' | 'Estresse Severo / Emergência Térmica';
  waterBathAvailabilityHours: number;
  shadeAvailabilityM2PerHead: number;
  herdRuminationPct: number;
  herdPantingPct: number; // % animais ofegantes
  recommendations: string[];
}

export interface BuffaloDisease {
  id: string;
  name: string;
  popularName?: string;
  scientificAgent: string;
  category: 'Infecciosa' | 'Parasitária' | 'Metabólica / Nutricional' | 'Reprodutiva' | 'Podal (Cascos)' | 'Neonatal';
  transmission: string;
  clinicalSigns: string[];
  morbidityRate: string;
  mortalityRate: string;
  diagnosticMethods: string[];
  treatmentProtocol: string;
  preventionManagement: string;
  zoonotic: boolean;
  withdrawalTimeWarning: string;
  images: string[];
  references: string;
  // Estrutura aprofundada de Sanidade e Diagnóstico Veterinário
  etiologyDetails?: {
    agentType: 'Bactéria' | 'Vírus' | 'Nematóide' | 'Protozoário' | 'Fungo' | 'Ectoparasita' | 'Distúrbio Bioclimático / Nutricional';
    pathogenesis: string;
    predisposingFactors: string[];
    incubationPeriod?: string;
  };
  symptomsDetails?: {
    earlySigns: string[];
    advancedSigns: string[];
    vitalSignsAlterations: string[];
    necropsyOrLesionFindings: string[];
  };
  controlDetails?: {
    drugOfChoice: string;
    dosageAndRoute: string;
    supportiveCare: string;
    biosecurityMeasures: string[];
    vaccinationProtocol?: string;
    quarantineDays?: number;
  };
}

export interface BuffaloPharmacyItem {
  id: string;
  name: string;
  category: 'Antibiótico' | 'Anti-inflamatório' | 'Vacina' | 'Antiparasitário' | 'Vitamina / Mineral' | 'Desinfetante / Teto' | 'Hormônio Reprodutivo';
  activeIngredient: string;
  presentation: string; // Frasco 100ml, Caixa 50 doses, etc.
  stockQuantity: number;
  minimumStock: number;
  unit: 'frascos' | 'doses' | 'litros' | 'kg' | 'ampolas';
  unitCostBRL: number;
  batchNumber: string;
  expirationDate: string;
  milkWithdrawalDays: number;
  meatWithdrawalDays: number;
  storageConditions: 'Temperatura Ambiente (15-30°C)' | 'Refrigerado (2-8°C)' | 'Proteger da Luz';
  supplier: string;
}

export interface BuffaloFacility {
  id: string;
  name: string;
  type: 'Curral Anti-Estresse' | 'Tronco de Contenção & Balança' | 'Sala de Ordenha Mecânica' | 'Sombrite Artificial' | 'Açude / Ponto de Banho' | 'Cocheira de Suplementação' | 'Cerca Elétrica Reforçada' | 'Bezerreiro / Maternidade';
  dimensions: string;
  capacityAnimals: number;
  condition: 'Excelente' | 'Bom' | 'Necessita Reparo' | 'Crítico';
  lastInspectionDate: string;
  nextMaintenanceDate: string;
  features: string[];
  notes?: string;
}

export interface BuffaloFeedItem {
  id: string;
  name: string;
  type: 'Volumoso Pasto' | 'Silagem' | 'Feno' | 'Concentrado Energético' | 'Concentrado Proteico' | 'Suplemento Mineral com Macro/Micros' | 'Subproduto Agroindustrial';
  dryMatterPct: number; // % MS
  crudeProteinPct: number; // % PB na MS
  totalDigestibleNutrientsPct: number; // % NDT na MS
  neutralDetergentFiberPct: number; // % FDN na MS
  calciumPct: number;
  phosphorusPct: number;
  costPerKgNaturalBRL: number;
  recommendedMaxIntakePctPV: number;
}

export interface BuffaloIEBCalculation {
  overallScore: number; // 0 to 100
  classification: 'Excelente / Elite' | 'Muito Bom' | 'Satisfatório' | 'Abaixo da Média' | 'Crítico';
  reproductiveEfficiencyScore: number; // 25%
  productiveEfficiencyScore: number; // 25%
  healthBiosecurityScore: number; // 15%
  thermalWelfareScore: number; // 15%
  foragePastureManagementScore: number; // 10%
  economicCostScore: number; // 10%
  strengths: string[];
  opportunities: string[];
  actionPlan: string[];
}
