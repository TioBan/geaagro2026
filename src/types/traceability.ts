export type CropCategory = 
  | 'hortalicas_frutos'
  | 'hortalicas_folhosas'
  | 'raizes_tuberculos'
  | 'frutiferas'
  | 'graos_cereais'
  | 'industriais_especiais';

export type LotStatus = 
  | 'planejado'
  | 'semeadura'
  | 'desenvolvimento'
  | 'florescimento'
  | 'frutificacao'
  | 'colheita'
  | 'finalizado'
  | 'cancelado';

export type OperationType = 
  | 'plantio'
  | 'adubacao_solo'
  | 'adubacao_cobertura'
  | 'fertirrigacao'
  | 'irrigacao'
  | 'pulverizacao'
  | 'pulverizacao_defensivo'
  | 'pulverizacao_biologico'
  | 'trato_cultural'
  | 'poda_desbrota'
  | 'analise_solo_folha'
  | 'monitoramento_mip'
  | 'colheita'
  | 'outro';

export type SeverityLevel = 'baixa' | 'moderada' | 'alta' | 'critica' | 'media';

export type CommercialClass = string;

export type PhotoCategory = 
  | 'plantio'
  | 'desenvolvimento'
  | 'florescimento'
  | 'frutificacao'
  | 'colheita'
  | 'pragas'
  | 'doencas'
  | 'fitossanidade'
  | 'qualidade'
  | 'irrigacao'
  | 'nutricao'
  | 'embalagem'
  | 'packing_house';

export interface TraceabilityProperty {
  id: string;
  farmName: string;
  producerName: string;
  documentNumber: string; // CPF or CNPJ
  documentType: 'CPF' | 'CNPJ';
  stateRegistration: string; // Inscrição Estadual
  technicalResponsible: string;
  creaNumber: string;
  creaState: string;
  councilType: 'CREA' | 'CRBio' | 'CFTA' | 'Outro';
  artNumber?: string; // Anotação de Responsabilidade Técnica
  city: string;
  state: string;
  carRegister?: string;
  latitude?: number;
  longitude?: number;
  totalAreaHa: number;
  cultivatedAreaHa: number;
  packingHouseName?: string;
  packingHouseAddress?: string;
  coldRoomsCount?: number;
  hasSanitaryPermit?: boolean;
  certifications: string[]; // ['GlobalG.A.P.', 'INC 02/2018 MAPA/ANVISA', 'Produção Integrada (PIF/PIH)', 'Orgânicos Brasil', 'Rainforest Alliance', 'Fair Trade']
  logoUrl?: string;
  updatedAt: string;
}

export interface TraceabilityPlot {
  id: string;
  code: string; // Ex: T-01, EST-02
  name: string;
  farmId: string;
  areaHa: number;
  structureType: 'campo_aberto' | 'estufa_plastica' | 'telado' | 'hidroponia_nft' | 'hidroponia_substrato' | 'outro';
  type?: string;
  currentCrop?: string;
  currentCultivar?: string;
  currentLotCode?: string;
  irrigationSystem: 'gotejamento' | 'microaspersao' | 'aspersao' | 'pivo_central' | 'sulco' | 'sequeiro';
  irrigationType?: string;
  soilType: string;
  soilTexture: 'arenoso' | 'medio' | 'argiloso' | 'muito_argiloso';
  latitude?: number;
  longitude?: number;
  croquiData?: string; // GeoJSON or drawing description
  active: boolean;
}

export interface TraceabilityCrop {
  id: string;
  name: string;
  scientificName: string;
  category: CropCategory;
  cycleDays?: number;
  cycleDaysAverage: number;
  defaultSpacingMeters: string; // Ex: '1.20 x 0.40 m'
  recommendedPlantDensityPerHa: number;
  averageYieldKgHa: number;
  defaultYieldUnit: 't/ha' | 'cx/ha' | 'kg/ha' | 'sc/ha' | 'unid/ha';
  boxWeightKg: number; // Peso médio da caixa comercial
  packagingTypeDefault?: string;
  waterDemandMmPerCycle: number;
  averageKc: number;
  safetyIntervalGeneralDays: number; // Carência média geral
  commercialClasses: CommercialClass[];
  commercialClassesAvailable?: string[];
  cultivarsRecommended: string[];
  nutritionalNeedsSummary: string;
  iconName?: string;
}

export interface TraceabilityCultivar {
  id: string;
  cropId: string;
  cropName: string;
  name: string; // Ex: 'Tomate Gaúcho', 'Tomate Sweet Grape', 'Alface Crespa Vanda'
  breederCompany: string; // Obtentor / Empresa de Sementes
  rncNumber?: string; // Registro Nacional de Cultivares MAPA
  cycleDays: number;
  growthHabit: 'determinado' | 'indeterminado' | 'semi_determinado' | 'ereto' | 'prostrado' | 'outro';
  resistanceTraits: string[]; // Resistências a viroses, nematoides, fungos
  idealHarvestPeriodDays: number;
}

export interface TraceabilityLot {
  id: string;
  lotCode: string; // Unique format: GA-TOM-2027-T05-0001
  farmId: string;
  farmName: string;
  plotId: string;
  plotCode: string;
  plotName: string;
  cropId: string;
  cropName: string;
  cultivarId?: string;
  cultivarName: string;
  seasonYear: number;
  sequentialNumber: number;
  status: LotStatus;
  
  // Datas de Produção
  sowingDate: string;
  nurseryTransplantDate?: string;
  estimatedHarvestStartDate: string;
  estimatedHarvestEndDate: string;
  actualHarvestStartDate?: string;
  actualHarvestEndDate?: string;
  
  // Origem e Insumos
  seedSupplier: string;
  seedLotNumber: string;
  seedOriginRNS?: string;
  nurserySupplier?: string;
  
  // População & Área
  plantedAreaHa: number;
  plantsCount: number;
  spacingBetweenRowsMeters: number;
  spacingBetweenPlantsMeters: number;
  
  // Estimativas e Resultados
  estimatedYieldKg: number;
  estimatedBoxesCount: number;
  totalHarvestedKg: number;
  totalHarvestedBoxes: number;
  totalExpeditedBoxes: number;
  
  // Carência e Segurança
  activeQuarantineUntilDate?: string; // Data até a qual o lote está em carência
  isUnderActiveQuarantine: boolean;
  activeQuarantineProduct?: string;
  
  // Índices
  igrScorePercentage: number; // 0 - 100%
  igrStatus: 'excelente' | 'boa' | 'atencao' | 'incompleta';
  
  notes?: string;
  qrCodeUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TraceabilityOperation {
  id: string;
  lotId: string;
  lotCode: string;
  farmId?: string;
  plotId: string;
  type: OperationType;
  date: string;
  time?: string;
  operatorName: string;
  equipmentOrMachinery?: string;
  
  // Condições Ambientais
  temperatureC?: number;
  relativeHumidityPercent?: number;
  windSpeedKmH?: number;
  deltaT?: number;
  weatherCondition?: string;
  
  // Detalhes de Insumo / Pulverização / Adubação
  commercialProduct?: string;
  activeIngredient?: string;
  mapaRegistrationNumber?: string;
  dosageValue?: number;
  dosageUnit?: 'L/ha' | 'kg/ha' | 'ml/100L' | 'g/100L' | 'g/planta' | 'm³/ha' | 'mm' | 'outro' | string;
  dosagePerHa?: number | string;
  totalQuantityUsed?: string | number;
  waterVolumeLitersPerHa?: number;
  sprayVolumeLitersPerHa?: number;
  targetPestOrDisease?: string;
  targetPestDisease?: string;
  agronomistPrescriptionArt?: string;
  description?: string;
  
  // Intervalos de Segurança
  safetyIntervalDays?: number; // Período de carência
  withholdingPeriodDays?: number;
  reentryIntervalHours?: number; // Período de reentrada
  harvestReleaseDate?: string; // Data calculada de liberação para colheita
  safeHarvestDate?: string;
  
  // Irrigação & Fertirrigação
  irrigationTimeHours?: number;
  waterVolumeM3?: number;
  waterLayerMm?: number;
  conductivityEC?: number;
  solutionPH?: number;
  
  // Custos e Observações
  totalOperationCostBrl?: number;
  costPerHaBrl?: number;
  technicalObservations?: string;
  agronomistSignature?: boolean;
  createdAt: string;
}

export interface TraceabilityPestMonitoring {
  id: string;
  lotId: string;
  lotCode: string;
  date: string;
  scoutName?: string;
  pestOrDiseaseName?: string;
  pestOrDisease?: string;
  scientificName?: string;
  type?: 'praga' | 'doenca' | 'nematoide' | 'planta_daninha' | 'deficiencia_nutricional' | string;
  severity?: 'baixa' | 'moderada' | 'alta' | 'critica' | 'media';
  percentageAttackedPlants?: number;
  infestationPercentage?: number;
  affectedOrgan?: string;
  economicThresholdExceeded?: boolean;
  affectedAreaDescription?: string;
  managementActionApplied?: string;
  recommendedAction?: string;
  inspectorName?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
}

export interface TraceabilityPhotoDiaryItem {
  id: string;
  lotId: string;
  lotCode: string;
  date: string;
  time?: string;
  category: PhotoCategory;
  stage?: string;
  title?: string;
  caption?: string;
  description?: string;
  photoUrl: string;
  takenBy?: string;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
}

export type TraceabilityPhotoDiary = TraceabilityPhotoDiaryItem;

export interface TraceabilityHarvestItem {
  id: string;
  lotId: string;
  lotCode: string;
  date: string;
  time?: string;
  harvestTeam?: string;
  harvesterTeam?: string;
  boxWeightKg?: number;
  grossWeightKg?: number;
  tareWeightKg?: number;
  netWeightKg: number;
  boxesCount: number;
  commercialClass: CommercialClass;
  wasteRefugeKg?: number;
  brixDegrees?: number;
  firmnessPressure?: number;
  destination?: 'packing_house' | 'camara_fria' | 'venda_direta' | 'ceasa' | 'industria' | 'outro';
  destinationPackingHouse?: string;
  carCheckPassed?: boolean; // Confirmação de que carência fitossanitária estava cumprida
  notes?: string;
  responsibleName?: string;
  createdAt?: string;
}

export interface TraceabilityPackingItem {
  id: string;
  lotId: string;
  lotCode: string;
  harvestId?: string;
  packagingDate: string;
  packagingType: 'caixa_papelao' | 'caixa_plastica_k' | 'caixa_madeira' | 'bandeja_flowpack' | 'sacaria' | 'palete' | 'outro';
  boxSequentialStart: number;
  boxSequentialEnd: number;
  totalBoxes: number;
  unitWeightKg: number;
  totalNetWeightKg: number;
  commercialClass: CommercialClass;
  assignedPalletCode?: string; // Ex: PLT-2027-001
  coldRoomNumber?: string;
  storageTemperatureC?: number;
  relativeHumidityPercent?: number;
  inspectorName: string;
  labelPrinted: boolean;
  createdAt: string;
}

export interface TraceabilityPallet {
  id: string;
  palletCode: string; // Ex: PLT-2027-001
  lotId: string;
  lotCode: string;
  cropName: string;
  cultivarName: string;
  assemblyDate: string;
  boxesCount: number;
  boxType?: string;
  totalGrossWeightKg?: number;
  totalNetWeightKg: number;
  commercialClass: CommercialClass;
  status: 'montado' | 'em_camara_fria' | 'expedido' | 'entregue' | 'estocado_camara' | string;
  coldRoomNumber?: string;
  coldChamberLocation?: string;
  storageTemperatureCelsius?: number;
  qrCodeUrl?: string;
  expeditionId?: string;
  createdAt?: string;
}

export interface TraceabilityExpedition {
  id: string;
  expeditionCode: string; // Ex: EXP-2027-0012
  date: string;
  time?: string;
  customerName: string;
  customerDocument: string; // CNPJ or CPF
  destinationCity: string;
  destinationState: string;
  invoiceNumber?: string; // Nota Fiscal (NF-e)
  nfeNumber?: string;
  orderNumber?: string;
  
  // Logística e Transporte
  carrierCompany?: string;
  transportCompanyName?: string;
  driverName?: string;
  driverDocument?: string;
  vehiclePlate?: string;
  transportTemperatureC?: number;
  truckTemperatureCelsius?: number;
  temperatureControlled?: boolean;
  
  // Lotes & Cargas
  items?: {
    lotId: string;
    lotCode: string;
    cropName: string;
    cultivarName: string;
    palletCode?: string;
    boxesCount: number;
    weightKg: number;
    commercialClass: CommercialClass;
  }[];
  lotsContained?: any[];
  palletsContained?: string[];
  
  totalPallets?: number;
  totalBoxes?: number;
  totalWeightKg?: number;
  totalNetWeightKg?: number;
  totalValueBrl?: number;
  
  status?: 'preparando' | 'em_transito' | 'entregue' | 'cancelado' | string;
  departureTime?: string;
  deliveryTime?: string;
  shippingNotes?: string;
  notes?: string;
  createdAt?: string;
}

export interface DigitalFoodPassport {
  lotCode: string;
  qrCodeUrl: string;
  publicUrl: string;
  
  // Visão Pública (Consumidor)
  publicData: {
    farmName: string;
    producerName: string;
    city: string;
    state: string;
    cropName: string;
    cultivarName: string;
    harvestDate: string;
    commercialClass: string;
    certifications: string[];
    sustainablePractices: string[];
    farmPhotos: string[];
    conservationTips: string;
  };
  
  // Visão Restrita (Auditoria / Comprador / Técnico)
  restrictedData: {
    lotDetails: TraceabilityLot;
    propertyDetails: TraceabilityProperty;
    operationsTimeline: TraceabilityOperation[];
    pesticideApplications: {
      date: string;
      product: string;
      activeIngredient: string;
      mapaNumber: string;
      dosage: string;
      target: string;
      safetyDays: number;
      releaseDate: string;
      carCompleted: boolean;
    }[];
    fertilizationSummary: string[];
    waterManagementSummary: string;
    monitoringRecords: TraceabilityPestMonitoring[];
    harvestRecord?: TraceabilityHarvestItem;
    expeditionRecord?: TraceabilityExpedition;
    responsibleAgronomist: {
      name: string;
      crea: string;
      artNumber?: string;
    };
  };
  
  shareSettings: {
    showOperationsToPublic: boolean;
    showPesticidesToPublic: boolean;
    showNutritionalPlanToPublic: boolean;
    showAgronomistToPublic: boolean;
  };
}

export interface TraceabilityComplianceChecklist {
  inc022018Compliance: {
    originIdentification: boolean;
    lotCodeOnBoxes: boolean;
    fieldBookMaintained: boolean;
    quarantineComplianceVerified: boolean;
    invoiceLinkedToLot: boolean;
    receptionRecordsStored: boolean;
  };
  globalGapCompliance: {
    pesticideStorageCertified: boolean;
    operatorPpeUsed: boolean;
    waterAnalysisCurrent: boolean;
    wasteDisposalRecorded: boolean;
    hygieneProtocolsFollowed: boolean;
  };
  integratedProductionCompliance: {
    soilAnalysisCurrent: boolean;
    leafAnalysisRecorded: boolean;
    biologicalPestControlPrioritized: boolean;
    registeredPesticidesOnly: boolean;
  };
  organicCompliance: {
    syntheticChemicalFree: boolean;
    certifiedOrganicInputsOnly: boolean;
    bufferZonesMaintained: boolean;
  };
}

export type LabelSize = '100x50' | '100x150' | '150x200' | '60x40' | 'a4_multipage';
export type PrinterType = 'zebra_zpl' | 'elgin_escpos' | 'argox_ppla' | 'brother' | 'padrao_a4';
export type PrinterDpi = 203 | 300 | 600;

export type QRCodeSize = 'pequeno' | 'medio' | 'grande';
export type PrintFormat = 'pdf' | 'termica';
export type TraceabilityUnit = 'kg' | 'cx' | 'sc' | 'un' | 't' | 'g';

export interface TraceabilityLabelSettings {
  defaultSize: LabelSize;
  defaultPrinterType: PrinterType;
  defaultDpi: PrinterDpi;
  defaultCopies: number;
  qrCodeSize?: QRCodeSize;
  printFormat?: PrintFormat;
  defaultUnit?: TraceabilityUnit;
  showProducerName: boolean;
  showDocument: boolean;
  showStateRegistration: boolean;
  showPlotInfo: boolean;
  showCultivar: boolean;
  showCommercialClass: boolean;
  showNetWeight: boolean;
  showHarvestDate: boolean;
  showSafeExpirationDate: boolean;
  showAgronomistArt: boolean;
  showInc02ComplianceBadge: boolean;
  showCustomLogo: boolean;
  customLogoUrl?: string;
  enableSafetyIntervalLock: boolean;
  baseUrlPassport: string;
  autoIncrementBoxNumber: boolean;
  paperOrientation: 'portrait' | 'landscape';
}

