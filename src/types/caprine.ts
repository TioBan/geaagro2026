export type CaprineTab =
  | 'dashboard'
  | 'digital_twin'
  | 'registry'
  | 'genealogy'
  | 'reproduction'
  | 'kids'
  | 'milk'
  | 'meat'
  | 'nutrition'
  | 'pastures'
  | 'health'
  | 'pharmacy'
  | 'disease_library'
  | 'photo_diary'
  | 'facilities'
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
  earTag: string;
  rfidCode: string;
  qrCode: string;
  name: string;
  breed: CaprineBreed;
  sex: CaprineSex;
  category: CaprineCategory;
  birthDate: string;
  weightKg: number;
  bodyConditionScore: number;
  famachaScore?: number;
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
  inbreedingCoeff?: number;
  currentPaddockId?: string;
  currentFacilityId?: string;
  notes?: string;
}

export interface CaprineWeighingRecord {
  id: string;
  date: string;
  animalId: string;
  weightKg: number;
  gmdGramsDay?: number;
  bodyConditionScore?: number;
  famachaScore?: number;
  notes?: string;
}

export type CaprineReproductionEventType =
  | 'Monta Natural'
  | 'Inseminação Artificial (IA)'
  | 'Diagnóstico de Gestação'
  | 'Parto'
  | 'Aborto'
  | 'Desmame'
  | 'Cio / Estro';

export interface CaprineReproductionRecord {
  id: string;
  date: string;
  animalId: string;
  eventType: CaprineReproductionEventType;
  sireId?: string;
  sireName?: string;
  pregnancyStatus?: 'Confirmada' | 'Não Gestante' | 'Aguardando DG';
  ultrasoundDays?: number;
  kidsCount?: number;
  birthWeightTotalKg?: number;
  interBirthDays?: number;
  notes?: string;
}

export interface CaprineKidRecord {
  id: string;
  kidAnimalId?: string;
  earTag: string;
  name: string;
  motherId: string;
  fatherId?: string;
  birthDate: string;
  birthWeightKg: number;
  colostrumHours: number;
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
  ccsThousand?: number;
  lot?: string;
}

export interface CaprineMeatRecord {
  id: string;
  animalId: string;
  date: string;
  liveWeightKg: number;
  gmdGramsDay: number;
  feedConversion: number;
  targetSlaughterWeightKg: number;
  carcassYieldPct: number;
  slaughterAgeMonths: number;
  notes?: string;
}

export type CaprineFeedCategory =
  | 'Pastagem'
  | 'Silagem'
  | 'Feno'
  | 'Palma Forrageira'
  | 'Concentrado'
  | 'Mineral'
  | 'Aditivo';

export interface CaprineFeedItem {
  id: string;
  name: string;
  category: CaprineFeedCategory;
  dryMatterPct: number;
  crudeProteinPct: number;
  ndtPct: number;
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
  soilFertilityScore: number;
  lastFertilizationDate: string;
  lastRainfallMm: number;
  photoUrl?: string;
  notes?: string;
}

export type CaprineHealthType =
  | 'Vacina'
  | 'Vermifugação (FAMACHA)'
  | 'Ectoparasita'
  | 'Tratamento'
  | 'Cirurgia'
  | 'Exame (CAE/Linfoadenite)';

export interface CaprineHealthRecord {
  id: string;
  date: string;
  animalId: string;
  type: CaprineHealthType;
  productName: string;
  dosage: string;
  famachaScore?: number;
  opgCount?: number;
  withdrawalMilkDays: number;
  withdrawalMeatDays: number;
  veterinarian: string;
  notes?: string;
}

export type CaprinePharmacyCategory =
  | 'Vermífugo'
  | 'Vacina'
  | 'Antibiótico'
  | 'Anti-inflamatório'
  | 'Vitamina/Mineral'
  | 'Material Cirúrgico'
  | 'Medicamento'
  | 'Antiparasitário'
  | 'Vitamina/Suplemento';

export interface CaprinePharmacyItem {
  id: string;
  name: string;
  category: CaprinePharmacyCategory;
  activeIngredient?: string;
  currentQuantity: number;
  minQuantityAlert: number;
  /** Legacy compatibility aliases */
  quantity?: number;
  minStock?: number;
  unit: string;
  batchNumber?: string;
  expirationDate: string;
  /** Legacy compatibility alias */
  expiryDate?: string;
  withdrawalMilkDays: number;
  withdrawalMeatDays: number;
  costPerUnitBrl: number;
}

export type CaprineFacilityType =
  | 'Aprisco Suspenso Ripado'
  | 'Aprisco Ripado/Suspenso'
  | 'Maternidade'
  | 'Maternidade Caprina'
  | 'Bezerreiro / Creche'
  | 'Baia de Crescimento'
  | 'Sala de Ordenha'
  | 'Pedilúvio'
  | 'Esterqueira / Compostagem'
  | 'Caprineira'
  | 'Depósito de Ração'
  | 'Comedouro/Bebedouro';

export interface CaprineFacility {
  id: string;
  code?: string;
  name: string;
  type: CaprineFacilityType;
  capacityHead: number;
  /** Legacy compatibility alias */
  totalCapacity?: number;
  currentOccupancy: number;
  areaSqMeters: number;
  sanitationStatus: string;
  lastSanitationDate: string;
  /** Legacy compatibility aliases */
  lastCleaningDate?: string;
  disinfectionMethod?: string;
  maintenanceNotes?: string;
  notes?: string;
}

export type CaprinePhotoCategory =
  | 'Escore Corporal'
  | 'Podologia / Casco'
  | 'Aprisco & Instalações'
  | 'Ocorrência Clínica'
  | 'Matriz & Cria'
  | 'Animal'
  | 'Lesão/Sanidade'
  | 'Parto'
  | 'Crescimento'
  | 'ECC/FAMACHA'
  | 'Instalação/Piquete';

export interface CaprinePhotoEntry {
  id: string;
  date: string;
  title: string;
  categoryTag: CaprinePhotoCategory;
  /** Legacy compatibility alias */
  category?: CaprinePhotoCategory;
  animalId?: string;
  paddockId?: string;
  photoUrl: string;
  description?: string;
  /** Legacy compatibility alias */
  notes?: string;
}

export interface CaprineIecBreakdown {
  reproductiveScore: number;
  milkGmdScore: number;
  famachaHealthScore: number;
  feedEfficiencyScore: number;
  pastureScore: number;
  financialMarginScore: number;
  totalIec: number;
}
