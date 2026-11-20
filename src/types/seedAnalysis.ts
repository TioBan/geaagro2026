export type SeedModuleTab =
  | 'dashboard_estatisticas'
  | 'recepcao_amostras'
  | 'identidade_gemeo_digital'
  | 'qualidade_fisica'
  | 'germinacao'
  | 'vigor'
  | 'umidade'
  | 'sanidade'
  | 'tratamento'
  | 'armazenamento'
  | 'banco_imagens'
  | 'biblioteca_tecnologia'
  | 'sistema_especialista'
  | 'certificados';

export type SeedClass = 'Genética' | 'Básica' | 'C1' | 'C2' | 'S1' | 'S2';
export type IQSClassification = 'Excelente' | 'Muito Bom' | 'Bom' | 'Regular' | 'Reprovado';
export type RegulatoryProfileId = 'laboratorio' | 'sementeira' | 'produtor' | 'pesquisa';

export interface ProfileThresholds {
  moistureLimit: number;
  minGermination: number;
  maxMechanicalDamage: number;
  minVigor: number;
  minPurity: number;
}

export interface RegulatoryProfilePreset {
  id: RegulatoryProfileId;
  label: string;
  shortLabel: string;
  description: string;
  thresholds: ProfileThresholds;
}

export interface SeedSpeciesRAS {
  id: string;
  commonName: string;
  scientificName: string;
  family: string;
  substrate: string;
  temperatureC: string;
  firstCountDays: number;
  finalCountDays: number;
  dormancyMethods: string;
  minGerminationOfficialPct: number;
  minPurityOfficialPct: number;
  maxMoistureOfficialPct: number;
  defaultPmsG: number;
  seedType: string;
  morphology: string;
  avgWeightG: number;
  color: string;
  shape: string;
  longevity: string;
}

export interface SampleReception {
  company: string;
  client: string;
  farm: string;
  technicalResponsible: string;
  sampleNumber: string;
  receiptDate: string;
  quantitySentKg: number;
  collectorName: string;
  photos: SeedPhotoRecord[];
}

export interface SeedPhotoRecord {
  id: string;
  title: string;
  category: 'Recepção' | 'Dano Mecânico' | 'Germinação (TPG)' | 'Tetrazólio (TZ)' | 'Patologia' | 'Armazenamento';
  date: string;
  notes: string;
  dataUrl: string;
}

export interface PhysicalQualityAnalysis {
  purityPct: number;
  inertMaterialPct: number;
  otherSeedsPct: number;
  brokenSeedsPct: number;
  crackedSeedsPct: number;
  shriveledSeedsPct: number;
  mechanicalDamageHypochloritePct: number;
  stinkbugDamagePct: number;
  weatheringDamagePct: number;
  pmsG: number;
  hectoliterWeightKgHl: number;
  screenUniformityPct: number;
}

export interface GerminationRepetition {
  repNumber: number;
  seedCount: number;
  normalSeedlings: number;
  abnormalSeedlings: number;
  deadSeeds: number;
  hardSeeds: number;
  dormantSeeds: number;
}

export interface GerminationAnalysis {
  installationDate: string;
  firstCountDate: string;
  finalCountDate: string;
  substrateUsed: string;
  temperatureC: number;
  repetitions: GerminationRepetition[];
  firstCountPct: number;
  finalGerminationPct: number;
  normalSeedlingsAvgPct: number;
  abnormalSeedlingsAvgPct: number;
  deadSeedsAvgPct: number;
  hardSeedsAvgPct: number;
  dormantSeedsAvgPct: number;
  standardDeviation: number;
}

export interface VigorAnalysis {
  acceleratedAgingPct: number;
  electricalConductivityUscmG: number;
  tetrazoliumViabilityPct: number;
  tetrazoliumVigorPct: number;
  tetrazoliumMechanicalDamagePct: number;
  tetrazoliumStinkbugDamagePct: number;
  tetrazoliumWeatherDamagePct: number;
  coldTestPct: number;
  sandEmergencePct: number;
  fieldEmergencePct: number;
  ivgIndex: number;
  rootLengthCm: number;
  shootLengthCm: number;
  seedlingDryMassMg: number;
}

export interface MoistureAnalysis {
  method: 'Estufa 105°C (24h)' | 'Estufa 130°C (1h)' | 'Medidor Capacitivo Rápido';
  initialWeightG: number;
  finalWeightG: number;
  moisturePct: number;
  temperatureC: number;
  date: string;
}

export interface SeedPathogenRecord {
  id: string;
  pathogenName: string;
  type: 'Fungo' | 'Bactéria' | 'Nematóide' | 'Vírus';
  incidencePct: number;
  severity: 'Baixa' | 'Média' | 'Alta' | 'Severa';
  method: 'Blotter Test' | 'Ágar BDA' | 'Sementes Lavadas' | 'PCR';
  notes: string;
}

export interface SeedTreatmentRecord {
  id: string;
  productName: string;
  targetCategory: 'Inseticida' | 'Fungicida' | 'Nematicida' | 'Inoculante' | 'Bioestimulante' | 'Polímero' | 'Micronutriente';
  activeIngredient: string;
  dosePer100kg: string;
  caldaVolumeLPerTon: number;
  treatmentDate: string;
  operatorName: string;
  dryingTimeHours?: number;
  curingTimeDays?: number;
  coverageUniformityPct?: number;
}

export interface StorageRecord {
  locationName: string;
  storageType: 'Câmara Fria Climatizada' | 'Galpão Convencional' | 'Silo Bag Climatizado';
  temperatureC: number;
  relativeHumidityPct: number;
  ventilation: string;
  packagingType: 'Big Bag Impermeável' | 'Sacos Papel Multifolhado 40kg' | 'Sacos Ráfia 50kg';
  stackingLayers: number;
  palletsInfo: string;
  entryDate: string;
  nextAnalysisDate: string;
  daysInStorage: number;
  estimatedShelfLifeMonths: number;
}

export interface SeedTimelineEvent {
  date: string;
  title: string;
  description: string;
  stage: string;
}

export interface SeedLot {
  id: string;
  internalCode: string;
  lotNumber: string;
  speciesId: string;
  speciesName: string;
  cultivar: string;
  hybrid: string;
  seedClass: SeedClass;
  category: string;
  cropSeason: string;
  productionDate: string;
  originProducer: string;
  originFarm: string;
  processingPlant: string;
  totalWeightKg: number;
  totalBags: number;
  bagWeightKg: number;

  reception: SampleReception;
  storage: StorageRecord;
  treatment: SeedTreatmentRecord[];
  physicalQuality: PhysicalQualityAnalysis;
  germination: GerminationAnalysis;
  vigor: VigorAnalysis;
  moisture: MoistureAnalysis;
  sanitaryQuality: SeedPathogenRecord[];

  iqsScore: number;
  iqsClassification: IQSClassification;

  timeline: SeedTimelineEvent[];

  physiologicalAgeDays: number;
  germinationPotentialPct: number;
  vigorPotentialPct: number;
}
