export type CaprineTab =
  | 'dashboard'
  | 'registry'
  | 'digital_twin'
  | 'genealogy'
  | 'reproduction'
  | 'kids'
  | 'dairy'
  | 'meat'
  | 'nutrition'
  | 'pastures'
  | 'pasture_twin'
  | 'health'
  | 'diseases_lib'
  | 'pharmacy'
  | 'facilities'
  | 'smart_map'
  | 'photo_diary'
  | 'iec_score'
  | 'reports';

export type CaprineSex = 'Fêmea' | 'Macho (Bode)' | 'Macho Castrado';

export type CaprineCategory =
  | 'Cabra em Lactação'
  | 'Cabra Seca'
  | 'Matriz Gestante'
  | 'Reprodutor (Bode)'
  | 'Cabrito Mamando'
  | 'Cabrita de Reposição'
  | 'Cabrito Desmamado'
  | 'Caprino para Abate';

export type CaprineBreed =
  | 'Anglo-Nubiana'
  | 'Saanen'
  | 'Toggenburg'
  | 'Boer'
  | 'Alpina'
  | 'Canindé'
  | 'Moxotó'
  | 'Marota'
  | 'Savanna'
  | 'SRD (Sem Raça Definida)';

export type CaprineStatus = 'Ativo' | 'Vendido' | 'Descartado' | 'Óbito' | 'Quarentena' | 'Tratamento';

export type CaprineBloodDegree = 'PO (Puro de Origem)' | 'PC (Puro por Cruza)' | '7/8' | '3/4' | '1/2 (F1)' | 'SRD';

export interface CaprineAnimal {
  id: string;
  earTag: string; // Número ID / Brinco
  rfidCode: string; // Brinco eletrônico RFID/NFC
  qrCode: string;
  name: string;
  breed: CaprineBreed;
  sex: CaprineSex;
  category: CaprineCategory;
  birthDate: string;
  weightKg: number;
  bodyConditionScore: number; // ECC 1.0 - 5.0
  famachaScore?: number; // 1 (Vermelho/Ótimo) a 5 (Branco/Anêmico Severo)
  photoUrl?: string;
  owner: string;
  lot: string;
  status: CaprineStatus;
  fatherId?: string;
  fatherName?: string;
  motherId?: string;
  motherName?: string;
  paternalGrandfather?: string;
  paternalGrandmother?: string;
  maternalGrandfather?: string;
  maternalGrandmother?: string;
  bloodDegree: CaprineBloodDegree;
  geneticLineage: string;
  inbreedingCoeff?: number; // % consanguinidade
  currentPaddockId?: string;
  currentFacilityId?: string;
  notes?: string;
}

export interface CaprineWeighingRecord {
  id: string;
  date: string;
  animalId: string;
  weightKg: number;
  gmdGramsDay?: number; // Ganho Médio Diário em g/dia
  bodyConditionScore?: number;
  famachaScore?: number;
  notes?: string;
}

export interface CaprineReproductionRecord {
  id: string;
  date: string;
  animalId: string; // Matriz
  eventType: 'Monta Natural' | 'Inseminação Artificial (IA)' | 'Diagnóstico de Gestação' | 'Parto' | 'Aborto' | 'Desmame' | 'Cio / Estro';
  sireId?: string;
  sireName?: string;
  pregnancyStatus?: 'Confirmada' | 'Não Gestante' | 'Aguardando DG';
  ultrasoundDays?: number;
  kidsCount?: number; // 1 (Simples), 2 (Gêmeos), 3 (Tríplice), 4 (Quádruplo)
  birthWeightTotalKg?: number;
  interBirthDays?: number; // IEP
  notes?: string;
}

export interface CaprineKidRecord {
  id: string;
  kidAnimalId: string;
  earTag: string;
  name: string;
  motherId: string;
  fatherId?: string;
  birthDate: string;
  birthWeightKg: number;
  colostrumHours: number; // horas até colostragem
  colostrumStatus: 'Excelente (<2h)' | 'Adequado (2-6h)' | 'Deficiente (>6h)';
  weaningDate?: string;
  weaningWeightKg?: number;
  gmdGramsDay: number;
  status: 'Em Amamentação' | 'Desmamado' | 'Óbito';
  notes?: string;
}

export interface CaprineMilkRecord {
  id: string;
  date: string;
  animalId: string;
  morningLiters: number;
  afternoonLiters: number;
  totalLiters: number;
  fatPct?: number;
  proteinPct?: number;
  lactosePct?: number;
  ccsThousand?: number; // CCS em milhares/mL
  lot?: string;
}

export interface CaprineMeatRecord {
  id: string;
  animalId: string;
  date: string;
  liveWeightKg: number;
  gmdGramsDay: number; // g/dia
  feedConversion: number; // CA (kg ração / kg ganho)
  targetSlaughterWeightKg: number;
  carcassYieldPct: number; // % rendimento de carcaça
  slaughterAgeMonths: number;
  notes?: string;
}

export interface CaprineFeedItem {
  id: string;
  name: string;
  category: 'Pastagem' | 'Silagem' | 'Feno' | 'Palma Forrageira' | 'Concentrado' | 'Mineral' | 'Aditivo';
  dryMatterPct: number; // % MS
  crudeProteinPct: number; // % PB
  ndtPct: number; // % NDT / Energia
  costPerKgBrl: number;
  notes?: string;
}

export interface CaprinePasturePaddock {
  id: string;
  code: string;
  name: string;
  areaHa: number;
  forageSpecies: string;
  entryHeightCm: number;
  exitHeightCm: number;
  forageMassKgDmHa: number;
  carryingCapacityGoatsHa: number;
  restDays: number;
  occupancyDays: number;
  currentOccupancyGoats: number;
  soilFertilityScore: number; // 0-100
  lastFertilizationDate: string;
  lastRainfallMm: number;
  photoUrl?: string;
  notes?: string;
}

export interface CaprineHealthRecord {
  id: string;
  date: string;
  animalId: string;
  type: 'Vacina' | 'Vermifugação (FAMACHA)' | 'Ectoparasita' | 'Tratamento' | 'Cirurgia' | 'Exame (CAE/Linfoadenite)';
  productName: string;
  dosage: string;
  famachaScore?: number; // 1-5
  opgCount?: number; // Contagem de Ovos por Grama
  withdrawalMilkDays: number;
  withdrawalMeatDays: number;
  veterinarian: string;
  notes?: string;
}

export interface CaprineDiseaseInfo {
  id: string;
  name: string;
  category: 'Viral' | 'Bacteriana' | 'Parasitária' | 'Metabólica' | 'Notificação MAPA' | 'Gastrointestinal';
  causativeAgent: string;
  transmission: string;
  symptoms: string[];
  prevention: string[];
  management: string[];
  technicalRef: string;
  photoUrl?: string;
}

export interface CaprinePharmacyItem {
  id: string;
  name: string;
  category: 'Vacina' | 'Medicamento' | 'Antiparasitário' | 'Vitamina/Suplemento';
  activeIngredient: string;
  quantity: number;
  unit: string;
  batchNumber: string;
  expiryDate: string;
  withdrawalMilkDays: number;
  withdrawalMeatDays: number;
  minStock: number;
  costPerUnitBrl: number;
}

export interface CaprineFacility {
  id: string;
  code: string;
  name: string;
  type: 'Aprisco Ripado/Suspenso' | 'Baia de Crescimento' | 'Maternidade Caprina' | 'Sala de Ordenha' | 'Caprineira' | 'Depósito de Ração' | 'Comedouro/Bebedouro';
  totalCapacity: number;
  currentOccupancy: number;
  lastCleaningDate: string;
  disinfectionMethod: string;
  maintenanceNotes: string;
}

export interface CaprinePhotoEntry {
  id: string;
  date: string;
  title: string;
  category: 'Animal' | 'Lesão/Sanidade' | 'Parto' | 'Crescimento' | 'ECC/FAMACHA' | 'Instalação/Piquete';
  animalId?: string;
  paddockId?: string;
  photoUrl: string;
  notes: string;
}

export interface CaprineIecBreakdown {
  reproductiveScore: number; // 0-20
  milkGmdScore: number; // 0-20
  famachaHealthScore: number; // 0-20
  feedEfficiencyScore: number; // 0-15
  pastureScore: number; // 0-15
  financialMarginScore: number; // 0-10
  totalIec: number; // 0-100
}
