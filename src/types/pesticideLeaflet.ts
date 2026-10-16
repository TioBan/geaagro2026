export type AgrochemicalClass =
  | 'Fungicida'
  | 'Inseticida'
  | 'Herbicida'
  | 'Acaricida'
  | 'Nematicida'
  | 'Bactericida'
  | 'Biológico'
  | 'Adjuvante'
  | 'Tratamento de Sementes'
  | 'Fisioativador'
  | 'Regulador de Crescimento'
  | 'Regulador Vegetal'
  | 'Regulador Vegetal / Desfolhante'
  | 'Inseticida de Grãos Armazenados'
  | 'Fumigante / Inseticida'
  | 'Inseticida e Acaricida'
  | 'Acaricida e Inseticida'
  | 'Fisioativador e Nutriente'
  | 'Nutrição de Precisão'
  | 'Condicionador Biológico'
  | 'Bioestimulante'
  | 'Biológico TS'
  | 'Inoculante TS'
  | 'Nutrição TS'
  | 'Adjuvante TS'
  | 'Outros'
  | (string & {});

export type ToxicologicalClass =
  | 'Classe I - Extremamente Tóxico'
  | 'Classe II - Altamente Tóxico'
  | 'Classe III - Moderadamente Tóxico'
  | 'Classe IV - Pouco Tóxico'
  | 'Classe V - Improvável de Causar Dano Agudo'
  | 'Não Classificado'
  | (string & {});

export type FormulationType =
  | 'EC - Emulsão Concentrada'
  | 'SC - Suspensão Concentrada'
  | 'WG - Grânulos Dispersíveis em Água'
  | 'SL - Concentrado Solúvel'
  | 'WP - Pó Molhável'
  | 'OD - Dispersão em Óleo'
  | 'CS - Suspensão de Encapsulado'
  | 'FS - Suspensão para Tratamento de Sementes'
  | 'FS - Suspensão Concentrada para Tratamento de Sementes'
  | 'TO - Tecnologia em Óleo / SC'
  | 'SE - Suspoemulsão'
  | 'SC - Suspensão Concentrada micro-milled'
  | 'ZC - Mistura de CS e SC'
  | 'SP - Pó Solúvel'
  | 'LIQ - Inoculante Líquido'
  | 'Outro'
  | (string & {});

export type DosageUnit =
  | 'L/ha'
  | 'mL/ha'
  | 'kg/ha'
  | 'g/ha'
  | 'L/100L de água'
  | 'mL/100L de água'
  | 'g/100L de água'
  | 'L/100kg de semente'
  | 'mL/100kg de semente'
  | 'mL/100kg sementes'
  | 'mL/24kg sementes'
  | 'mL/50kg sementes'
  | 'L/1000 mudas'
  | (string & {});

export interface CropIndication {
  id: string;
  cropName: string; // Ex: 'Soja', 'Milho', 'Algodão', 'Café', 'Feijão', 'Trigo', 'Citros', 'Cana-de-açúcar'
  recommendedDosage: number; // Ex: 0.5
  dosageUnit: DosageUnit; // Ex: 'L/ha'
  minDosage?: number;
  maxDosage?: number;
  targetOrganism: string; // Ex: 'Ferrugem-asiática (Phakopsora pachyrhizi)'
  applicationPhase?: string; // Ex: 'Preventivo no V8 a R1'
  gracePeriodDays: number; // Intervalo de carência em dias
  maxApplicationsPerSeason?: number; // Aplicações máx por safra
  recommendedSprayVolumeLha?: number; // Volume de calda recomendado L/ha
  notes?: string;
}

export interface PesticideProduct {
  id: string;
  productName: string; // Ex: 'Fox Xpro'
  registrationNumber: string; // Ex: '02919' (Registro no MAPA)
  activeIngredient: string; // Ex: 'Protioconazol + Trifloxistrobina + Bixafen'
  chemicalGroup: string; // Ex: 'Triazolintiona + Estrobilurina + Carboxamida'
  manufacturer: string; // Ex: 'Bayer SA'
  agrochemicalClass: AgrochemicalClass;
  toxicologicalClass: ToxicologicalClass;
  environmentalClass?: string; // Ex: 'Classe II - Produto Muito Perigoso'
  formulation: FormulationType;
  reentryIntervalHours: number; // Intervalo de reentrada em horas (ex: 24h)
  indications: CropIndication[]; // Relação produto -> cultura -> dosagem
  packageSizes?: number[]; // Ex: [1, 5, 20] Litros
  modeOfAction?: string; // Ex: 'Sistêmico e Mesostêmico'
  leafletUrl?: string; // Bula oficial PDF
  notes?: string;
  isCustom?: boolean;
  createdAt?: string;
}

export interface DosageCalculationRequest {
  productId: string;
  cropName: string;
  treatedAreaHa: number;
  sprayerTankVolumeL?: number;
  applicationVolumeLha?: number;
}

export interface PackageBreakdown {
  packageSize: number;
  quantity: number;
}

export interface PrescribedItem {
  id: string;
  productId: string;
  productName: string;
  registrationNumber: string;
  activeIngredient: string;
  chemicalGroup?: string;
  manufacturer: string;
  agrochemicalClass: AgrochemicalClass;
  toxicologicalClass: ToxicologicalClass;
  environmentalClass?: string;
  formulation: FormulationType;
  cropName: string;
  dosage: string;
  dosageVal: number;
  dosageUnit: DosageUnit;
  targetOrganism: string;
  treatedAreaHa: number;
  totalQuantityNeeded: number;
  totalQuantityUnit: string;
  sprayVolumeLha: number;
  totalSprayVolumeL: number;
  applicationEpoch: string;
  gracePeriodDays: number;
  reentryIntervalHours: number;
  packageSuggestions?: PackageBreakdown[];
}

export interface AgronomicRecipe {
  id: string;
  recipeNumber: string;
  createdAt: string;
  verificationCode: string;
  // Company info
  companyName: string;
  companyCNPJ: string;
  companyCREA: string;
  companyAddress: string;
  companyContact: string;
  // RT info
  rtName: string;
  rtCREA: string;
  rtCPF: string;
  rtEmail: string;
  rtPhone: string;
  // Farm & Producer info
  farmName: string;
  farmLocation: string;
  farmOwner: string;
  farmCPF: string;
  // Multi-item prescribed defensivos
  items: PrescribedItem[];
  // Global prescription fields
  treatedCrop: string;
  treatedAreaHa: number;
  returnLocation: string;
  notes: string;
  epiRequirements: string[];
  producerName: string;
  producerSignature?: string;
  rtSignature?: string;
  status?: 'Emitida' | 'Assinada Digitalmente' | 'Enviada ao Produtor';
}

export interface DosageCalculationResult {
  product: PesticideProduct;
  indication: CropIndication;
  treatedAreaHa: number;
  totalProductNeeded: number;
  unit: DosageUnit;
  recommendedTotalSprayVolumeL: number;
  numberOfTankLoads?: number;
  productPerTank?: number;
  packageSuggestions?: PackageBreakdown[];
  gracePeriodDays: number;
  reentryIntervalHours: number;
  warningMessages: string[];
}
