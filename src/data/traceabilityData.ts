import {
  TraceabilityProperty,
  TraceabilityPlot,
  TraceabilityCrop,
  TraceabilityCultivar,
  TraceabilityLot,
  TraceabilityOperation,
  TraceabilityPestMonitoring,
  TraceabilityPhotoDiaryItem,
  TraceabilityHarvestItem,
  TraceabilityPackingItem,
  TraceabilityPallet,
  TraceabilityExpedition,
  TraceabilityComplianceChecklist,
} from '../types/traceability';

export const INITIAL_TRACEABILITY_PROPERTY: TraceabilityProperty = {
  id: 'prop-01',
  farmName: '',
  producerName: '',
  documentNumber: '',
  documentType: 'CNPJ',
  stateRegistration: '',
  technicalResponsible: '',
  creaNumber: '',
  creaState: '',
  councilType: 'CREA',
  artNumber: '',
  city: '',
  state: '',
  carRegister: '',
  latitude: 0,
  longitude: 0,
  totalAreaHa: 0,
  cultivatedAreaHa: 0,
  packingHouseName: '',
  packingHouseAddress: '',
  coldRoomsCount: 0,
  hasSanitaryPermit: false,
  certifications: [],
  logoUrl: '',
  updatedAt: new Date().toISOString(),
};

export const INITIAL_TRACEABILITY_PLOTS: TraceabilityPlot[] = [];

export const INITIAL_TRACEABILITY_CULTIVARS: TraceabilityCultivar[] = [];

export const INITIAL_TRACEABILITY_LOTS: TraceabilityLot[] = [];

export const INITIAL_TRACEABILITY_OPERATIONS: TraceabilityOperation[] = [];

export const INITIAL_TRACEABILITY_MONITORING: TraceabilityPestMonitoring[] = [];

export const INITIAL_TRACEABILITY_PHOTO_DIARY: TraceabilityPhotoDiaryItem[] = [];

export const INITIAL_TRACEABILITY_HARVESTS: TraceabilityHarvestItem[] = [];

export const INITIAL_TRACEABILITY_PACKING: TraceabilityPackingItem[] = [];

export const INITIAL_TRACEABILITY_PALLETS: TraceabilityPallet[] = [];

export const INITIAL_TRACEABILITY_EXPEDITIONS: TraceabilityExpedition[] = [];

export const INITIAL_COMPLIANCE_CHECKLIST: TraceabilityComplianceChecklist = {
  inc022018Compliance: {
    originIdentification: false,
    lotCodeOnBoxes: false,
    fieldBookMaintained: false,
    quarantineComplianceVerified: false,
    invoiceLinkedToLot: false,
    receptionRecordsStored: false,
  },
  globalGapCompliance: {
    pesticideStorageCertified: false,
    operatorPpeUsed: false,
    waterAnalysisCurrent: false,
    wasteDisposalRecorded: false,
    hygieneProtocolsFollowed: false,
  },
  integratedProductionCompliance: {
    soilAnalysisCurrent: false,
    leafAnalysisRecorded: false,
    biologicalPestControlPrioritized: false,
    registeredPesticidesOnly: false,
  },
  organicCompliance: {
    syntheticChemicalFree: false,
    certifiedOrganicInputsOnly: false,
    bufferZonesMaintained: false,
  },
};

export const NATIONAL_CROPS_DATABASE: TraceabilityCrop[] = [
  // HORTALIÇAS FRUTOS
  {
    id: 'tomate',
    name: 'Tomate',
    scientificName: 'Solanum lycopersicum',
    category: 'hortalicas_frutos',
    cycleDaysAverage: 110,
    defaultSpacingMeters: '1.20 x 0.40 m',
    recommendedPlantDensityPerHa: 20800,
    averageYieldKgHa: 85000,
    defaultYieldUnit: 'cx/ha',
    boxWeightKg: 20,
    waterDemandMmPerCycle: 600,
    averageKc: 1.05,
    safetyIntervalGeneralDays: 7,
    commercialClasses: ['Extra AA', 'Extra A', 'Especial', 'Comercial', 'Industria', 'Refugo'],
    cultivarsRecommended: ['Sweet Grape', 'Gaúcho', 'Débora Plus', 'Italiano San Marzano', 'Saladete Carmem', 'Pizzadoro'],
    nutritionalNeedsSummary: 'Elevada demanda de Potássio (K) e Cálcio (Ca) no enchimento; Boro e Zinco essenciais no pegamento floral.',
    iconName: 'Apple',
  },
  {
    id: 'pimentao',
    name: 'Pimentão',
    scientificName: 'Capsicum annuum',
    category: 'hortalicas_frutos',
    cycleDaysAverage: 120,
    defaultSpacingMeters: '1.00 x 0.45 m',
    recommendedPlantDensityPerHa: 22000,
    averageYieldKgHa: 60000,
    defaultYieldUnit: 'cx/ha',
    boxWeightKg: 10,
    waterDemandMmPerCycle: 550,
    averageKc: 1.0,
    safetyIntervalGeneralDays: 7,
    commercialClasses: ['Extra AA', 'Extra A', 'Comercial', 'Refugo'],
    cultivarsRecommended: ['Magali R', 'Dahra R Amarelo', 'Zarco Vermelho', 'All Big', 'Rubi'],
    nutritionalNeedsSummary: 'Muito sensível à deficiência de Cálcio (fundo preto) e Magnésio. Relação Ca:Mg ideal de 3:1.',
  },
  {
    id: 'pepino',
    name: 'Pepino',
    scientificName: 'Cucumis sativus',
    category: 'hortalicas_frutos',
    cycleDaysAverage: 65,
    defaultSpacingMeters: '1.00 x 0.35 m',
    recommendedPlantDensityPerHa: 28500,
    averageYieldKgHa: 45000,
    defaultYieldUnit: 'cx/ha',
    boxWeightKg: 20,
    waterDemandMmPerCycle: 400,
    averageKc: 0.95,
    safetyIntervalGeneralDays: 3,
    commercialClasses: ['Extra AA', 'Extra A', 'Comercial', 'Industria'],
    cultivarsRecommended: ['Japonês Tsuyataro', 'Caipira Samurai', 'Conserva Vlasic', 'Holandês'],
    nutritionalNeedsSummary: 'Crescimento ultrarrápido; demanda constante de Nitrogênio e Potássio em fertirrigação diária.',
  },
  {
    id: 'jilo',
    name: 'Jiló',
    scientificName: 'Solanum gilo',
    category: 'hortalicas_frutos',
    cycleDaysAverage: 110,
    defaultSpacingMeters: '1.20 x 0.60 m',
    recommendedPlantDensityPerHa: 13800,
    averageYieldKgHa: 35000,
    defaultYieldUnit: 'cx/ha',
    boxWeightKg: 14,
    waterDemandMmPerCycle: 500,
    averageKc: 0.95,
    safetyIntervalGeneralDays: 5,
    commercialClasses: ['Extra A', 'Comercial', 'Refugo'],
    cultivarsRecommended: ['Morro Redondo', 'Tinguá Verde Claro', 'Comprido Grande'],
    nutritionalNeedsSummary: 'Rústico, boa resposta a adubações orgânicas e correção de acidez no solo (V% > 60%).',
  },
  {
    id: 'quiabo',
    name: 'Quiabo',
    scientificName: 'Abelmoschus esculentus',
    category: 'hortalicas_frutos',
    cycleDaysAverage: 80,
    defaultSpacingMeters: '1.00 x 0.30 m',
    recommendedPlantDensityPerHa: 33000,
    averageYieldKgHa: 25000,
    defaultYieldUnit: 'cx/ha',
    boxWeightKg: 14,
    waterDemandMmPerCycle: 450,
    averageKc: 0.9,
    safetyIntervalGeneralDays: 3,
    commercialClasses: ['Extra AA (8-12cm)', 'Extra A', 'Comercial', 'Refugo (Fibroso)'],
    cultivarsRecommended: ['Santa Cruz 47', 'Clemson Spineless', 'Speedy F1', 'Valença'],
    nutritionalNeedsSummary: 'Exige colheita a cada 2 dias; alta exportação de Potássio e Cálcio.',
  },
  {
    id: 'berinjela',
    name: 'Berinjela',
    scientificName: 'Solanum melongena',
    category: 'hortalicas_frutos',
    cycleDaysAverage: 120,
    defaultSpacingMeters: '1.20 x 0.70 m',
    recommendedPlantDensityPerHa: 11900,
    averageYieldKgHa: 50000,
    defaultYieldUnit: 'cx/ha',
    boxWeightKg: 12,
    waterDemandMmPerCycle: 580,
    averageKc: 1.0,
    safetyIntervalGeneralDays: 5,
    commercialClasses: ['Extra AA', 'Extra A', 'Comercial', 'Refugo'],
    cultivarsRecommended: ['Ciça Embrapa', 'Napoli F1', 'Preta Comprida', 'Flórida Market'],
    nutritionalNeedsSummary: 'Produção longa e contínua; parcelamento de adubação de cobertura a cada 15 dias.',
  },
  {
    id: 'abobrinha',
    name: 'Abobrinha Italiana',
    scientificName: 'Cucurbita pepo',
    category: 'hortalicas_frutos',
    cycleDaysAverage: 55,
    defaultSpacingMeters: '1.00 x 0.50 m',
    recommendedPlantDensityPerHa: 20000,
    averageYieldKgHa: 30000,
    defaultYieldUnit: 'cx/ha',
    boxWeightKg: 18,
    waterDemandMmPerCycle: 350,
    averageKc: 0.95,
    safetyIntervalGeneralDays: 3,
    commercialClasses: ['Extra AA', 'Extra A', 'Comercial', 'Refugo'],
    cultivarsRecommended: ['Caserta', 'Novazur F1', 'Clarinda F1', 'Tronco Redonda'],
    nutritionalNeedsSummary: 'Ciclo curto; exige adubação fosfatada forte no sulco para florescimento precoce.',
  },

  // HORTALIÇAS FOLHOSAS
  {
    id: 'alface',
    name: 'Alface',
    scientificName: 'Lactuca sativa',
    category: 'hortalicas_folhosas',
    cycleDaysAverage: 45,
    defaultSpacingMeters: '0.25 x 0.25 m',
    recommendedPlantDensityPerHa: 160000,
    averageYieldKgHa: 35000,
    defaultYieldUnit: 'cx/ha',
    boxWeightKg: 8,
    waterDemandMmPerCycle: 220,
    averageKc: 1.0,
    safetyIntervalGeneralDays: 3,
    commercialClasses: ['Extra AA (Maço grande)', 'Extra A', 'Comercial', 'Mini'],
    cultivarsRecommended: ['Crespa Vanda', 'Americana Lucy Brown', 'Lisa Regina', 'Mimosa Roxa', 'Romana'],
    nutritionalNeedsSummary: 'Sensível à queima de bordos (tipburn) por deficiência temporária de Cálcio sob alta temperatura.',
  },
  {
    id: 'couve',
    name: 'Couve-Manteiga',
    scientificName: 'Brassica oleracea var. acephala',
    category: 'hortalicas_folhosas',
    cycleDaysAverage: 90,
    defaultSpacingMeters: '0.80 x 0.40 m',
    recommendedPlantDensityPerHa: 31000,
    averageYieldKgHa: 40000,
    defaultYieldUnit: 'cx/ha',
    boxWeightKg: 10,
    waterDemandMmPerCycle: 400,
    averageKc: 1.0,
    safetyIntervalGeneralDays: 3,
    commercialClasses: ['Extra AA', 'Comercial', 'Processamento (Higienizada)'],
    cultivarsRecommended: ['Manteiga da Geórgia', 'Híbrida HS-20', 'Topazio'],
    nutritionalNeedsSummary: 'Alta demanda de Nitrogênio e Enxofre para síntese de glucosinolatos e clorofila.',
  },
  {
    id: 'repolho',
    name: 'Repolho',
    scientificName: 'Brassica oleracea var. capitata',
    category: 'hortalicas_folhosas',
    cycleDaysAverage: 85,
    defaultSpacingMeters: '0.60 x 0.40 m',
    recommendedPlantDensityPerHa: 41000,
    averageYieldKgHa: 60000,
    defaultYieldUnit: 'cx/ha',
    boxWeightKg: 25,
    waterDemandMmPerCycle: 450,
    averageKc: 1.05,
    safetyIntervalGeneralDays: 7,
    commercialClasses: ['Extra AA (Cabeça firme 1.8-2.2kg)', 'Comercial', 'Indústria'],
    cultivarsRecommended: ['Astrus Plus F1', 'Kenzan F1', 'Coração de Boi', 'Roxo F1'],
    nutritionalNeedsSummary: 'Demanda de Boro para evitar podridão oca e necrose interna da cabeça.',
  },
  {
    id: 'rucula',
    name: 'Rúcula',
    scientificName: 'Eruca sativa',
    category: 'hortalicas_folhosas',
    cycleDaysAverage: 32,
    defaultSpacingMeters: '0.20 x 0.05 m',
    recommendedPlantDensityPerHa: 500000,
    averageYieldKgHa: 18000,
    defaultYieldUnit: 'cx/ha',
    boxWeightKg: 6,
    waterDemandMmPerCycle: 150,
    averageKc: 0.95,
    safetyIntervalGeneralDays: 2,
    commercialClasses: ['Maço Padrão', 'Higienizada Baby Leaf', 'Comercial'],
    cultivarsRecommended: ['Cultivada Gigante', 'Folha Larga Antonella', 'Donatella F1'],
    nutritionalNeedsSummary: 'Ciclo ultracurto de 28 a 35 dias; irrigação suave e frequente.',
  },

  // RAÍZES E TUBÉRCULOS
  {
    id: 'cenoura',
    name: 'Cenoura',
    scientificName: 'Daucus carota',
    category: 'raizes_tuberculos',
    cycleDaysAverage: 100,
    defaultSpacingMeters: '0.20 x 0.04 m',
    recommendedPlantDensityPerHa: 650000,
    averageYieldKgHa: 55000,
    defaultYieldUnit: 'cx/ha',
    boxWeightKg: 20,
    waterDemandMmPerCycle: 500,
    averageKc: 0.95,
    safetyIntervalGeneralDays: 7,
    commercialClasses: ['Extra 3A (>22cm)', 'Extra 2A (18-22cm)', 'Extra A (14-18cm)', 'G (Curta)', 'Refugo'],
    cultivarsRecommended: ['Brasília', 'Juliana F1', 'Kuronoda', 'Supreme F1', 'Nantes'],
    nutritionalNeedsSummary: 'Solo profundo e descompactado; evitar excesso de Nitrogênio que causa bifurcação de raíces.',
  },
  {
    id: 'beterraba',
    name: 'Beterraba',
    scientificName: 'Beta vulgaris',
    category: 'raizes_tuberculos',
    cycleDaysAverage: 75,
    defaultSpacingMeters: '0.25 x 0.08 m',
    recommendedPlantDensityPerHa: 350000,
    averageYieldKgHa: 38000,
    defaultYieldUnit: 'cx/ha',
    boxWeightKg: 20,
    waterDemandMmPerCycle: 380,
    averageKc: 0.9,
    safetyIntervalGeneralDays: 5,
    commercialClasses: ['Extra AA (6-8cm)', 'Extra A (5-6cm)', 'Comercial', 'Refugo'],
    cultivarsRecommended: ['Early Wonder', 'Boro F1', 'Itapuã', 'Tall Top Wonder'],
    nutritionalNeedsSummary: 'Alta sensibilidade à deficiência de Boro (coração negro); exige solo com pH em água > 6.0.',
  },
  {
    id: 'batata',
    name: 'Batata',
    scientificName: 'Solanum tuberosum',
    category: 'raizes_tuberculos',
    cycleDaysAverage: 105,
    defaultSpacingMeters: '0.80 x 0.30 m',
    recommendedPlantDensityPerHa: 41600,
    averageYieldKgHa: 40000,
    defaultYieldUnit: 'sc/ha',
    boxWeightKg: 50,
    waterDemandMmPerCycle: 550,
    averageKc: 1.1,
    safetyIntervalGeneralDays: 7,
    commercialClasses: ['Especial (Graúda)', 'Primeira', 'Segunda', 'Bolinha (Conservinha)', 'Refugo'],
    cultivarsRecommended: ['Ágata', 'Asterix (Fritura)', 'Cupido', 'Markies', 'Atlantic'],
    nutritionalNeedsSummary: 'Alta demanda de Fósforo no plantio e Potássio na tuberização; amontoa rigorosa.',
  },
  {
    id: 'mandioca',
    name: 'Mandioca de Mesa (Aipim)',
    scientificName: 'Manihot esculenta',
    category: 'raizes_tuberculos',
    cycleDaysAverage: 240,
    defaultSpacingMeters: '1.00 x 0.60 m',
    recommendedPlantDensityPerHa: 16600,
    averageYieldKgHa: 28000,
    defaultYieldUnit: 'cx/ha',
    boxWeightKg: 20,
    waterDemandMmPerCycle: 700,
    averageKc: 0.85,
    safetyIntervalGeneralDays: 0,
    commercialClasses: ['Mesa Extra (Cozimento Rápido)', 'Comercial', 'Farinha/Indústria'],
    cultivarsRecommended: ['BRS 399', 'IAC 576-70 (Amarelinha)', 'Vassourinha', 'Pão da China'],
    nutritionalNeedsSummary: 'Rústica; responde fortemente a Fósforo e adubação potássica para espessamento das raízes.',
  },

  // FRUTÍFERAS
  {
    id: 'melancia',
    name: 'Melancia',
    scientificName: 'Citrullus lanatus',
    category: 'frutiferas',
    cycleDaysAverage: 85,
    defaultSpacingMeters: '2.50 x 1.00 m',
    recommendedPlantDensityPerHa: 4000,
    averageYieldKgHa: 45000,
    defaultYieldUnit: 't/ha',
    boxWeightKg: 12,
    waterDemandMmPerCycle: 420,
    averageKc: 0.85,
    safetyIntervalGeneralDays: 7,
    commercialClasses: ['Graúda (>10kg)', 'Média (7-10kg)', 'Baby (Sem Semente 2-4kg)', 'Refugo'],
    cultivarsRecommended: ['Manchester', 'Crimson Sweet', 'Talisman F1', 'Precious Petite (Sem Semente)'],
    nutritionalNeedsSummary: 'Polinização entomológica essencial; suspender irrigação 7 dias antes da colheita para concentrar açúcar (°Brix > 11).',
  },
  {
    id: 'melao',
    name: 'Melão',
    scientificName: 'Cucumis melo',
    category: 'frutiferas',
    cycleDaysAverage: 70,
    defaultSpacingMeters: '2.00 x 0.40 m',
    recommendedPlantDensityPerHa: 12500,
    averageYieldKgHa: 32000,
    defaultYieldUnit: 'cx/ha',
    boxWeightKg: 13,
    waterDemandMmPerCycle: 380,
    averageKc: 0.9,
    safetyIntervalGeneralDays: 5,
    commercialClasses: ['Tipo 5 (5 frutos/cx)', 'Tipo 6', 'Tipo 7', 'Tipo 8', 'Exportação'],
    cultivarsRecommended: ['Amarelo Gladial', 'Cantaloupe Robson', 'Pele de Sapo Sancho', 'Gália'],
    nutritionalNeedsSummary: 'Controle fino de condutividade elétrica (CE) na fertirrigação para atingir °Brix > 12.',
  },
  {
    id: 'morango',
    name: 'Morango',
    scientificName: 'Fragaria x ananassa',
    category: 'frutiferas',
    cycleDaysAverage: 180,
    defaultSpacingMeters: '0.30 x 0.30 m',
    recommendedPlantDensityPerHa: 65000,
    averageYieldKgHa: 50000,
    defaultYieldUnit: 'cx/ha',
    boxWeightKg: 1.2,
    waterDemandMmPerCycle: 600,
    averageKc: 0.95,
    safetyIntervalGeneralDays: 3,
    commercialClasses: ['Extra AA (Graúdo)', 'Extra A', 'Comercial', 'Indústria (Geleia)'],
    cultivarsRecommended: ['San Andreas', 'Albion', 'Camarosa', 'Monterey', 'Pircinque'],
    nutritionalNeedsSummary: 'Cultivo em calhas suspensas com fertirrigação balanceada; monitoramento rigoroso de ácaro-rajado.',
  },
  {
    id: 'maracuja',
    name: 'Maracujá Azedo',
    scientificName: 'Passiflora edulis',
    category: 'frutiferas',
    cycleDaysAverage: 240,
    defaultSpacingMeters: '3.00 x 2.50 m',
    recommendedPlantDensityPerHa: 1330,
    averageYieldKgHa: 30000,
    defaultYieldUnit: 'cx/ha',
    boxWeightKg: 12,
    waterDemandMmPerCycle: 900,
    averageKc: 0.95,
    safetyIntervalGeneralDays: 7,
    commercialClasses: ['Extra (Graúdo >200g)', 'Primeira', 'Segunda', 'Indústria (Polpa)'],
    cultivarsRecommended: ['BRS Gigante Amarelo', 'BRS Rubi do Cerrado', 'IAC 275', 'Maguary'],
    nutritionalNeedsSummary: 'Tutoramento em espaldeira; polinização manual ou por mamangavas (Xylocopa).',
  },
  {
    id: 'mamao',
    name: 'Mamão',
    scientificName: 'Carica papaya',
    category: 'frutiferas',
    cycleDaysAverage: 300,
    defaultSpacingMeters: '3.00 x 2.00 m',
    recommendedPlantDensityPerHa: 1660,
    averageYieldKgHa: 60000,
    defaultYieldUnit: 'cx/ha',
    boxWeightKg: 8,
    waterDemandMmPerCycle: 1200,
    averageKc: 1.05,
    safetyIntervalGeneralDays: 7,
    commercialClasses: ['Exportação (Calibre 8-10)', 'Comercial 1', 'Comercial 2', 'Indústria'],
    cultivarsRecommended: ['Formosa Tainung 01', 'Papaya Golden', 'Sunrise Solo', 'Aliança'],
    nutritionalNeedsSummary: 'Sexagem no florescimento para manter plantas hermafroditas; alta exigência de Boro.',
  },
  {
    id: 'banana',
    name: 'Banana',
    scientificName: 'Musa spp.',
    category: 'frutiferas',
    cycleDaysAverage: 360,
    defaultSpacingMeters: '2.50 x 2.00 m',
    recommendedPlantDensityPerHa: 2000,
    averageYieldKgHa: 35000,
    defaultYieldUnit: 'cx/ha',
    boxWeightKg: 20,
    waterDemandMmPerCycle: 1300,
    averageKc: 1.1,
    safetyIntervalGeneralDays: 7,
    commercialClasses: ['Extra (Penca uniforme)', 'Primeira', 'Segunda', 'Climatizada'],
    cultivarsRecommended: ['Prata Anã', 'BRS Princesa', 'Nanica (Cavendish)', 'Grand Naine', 'Terra'],
    nutritionalNeedsSummary: 'Maior consumidora de Potássio do reino vegetal; desbaste de filhos e ensacamento do cacho.',
  },

  // GRÃOS E INDUSTRIAIS
  {
    id: 'soja',
    name: 'Soja',
    scientificName: 'Glycine max',
    category: 'graos_cereais',
    cycleDaysAverage: 115,
    defaultSpacingMeters: '0.45 x 0.07 m',
    recommendedPlantDensityPerHa: 310000,
    averageYieldKgHa: 3900,
    defaultYieldUnit: 'sc/ha',
    boxWeightKg: 60,
    waterDemandMmPerCycle: 550,
    averageKc: 1.1,
    safetyIntervalGeneralDays: 14,
    commercialClasses: ['Padrão Exportação (Grão Tipo 1)', 'Semente Certificada', 'Comercial'],
    cultivarsRecommended: ['TMG 2381 IPRO', 'Monsoy 6210 IPRO', 'Brasmax Fibra', 'Embrapa BRS 539'],
    nutritionalNeedsSummary: 'Inoculação obrigatória com Bradyrhizobium; adubação com Fósforo, Potássio e Cobalto/Molibdênio.',
  },
  {
    id: 'milho',
    name: 'Milho',
    scientificName: 'Zea mays',
    category: 'graos_cereais',
    cycleDaysAverage: 130,
    defaultSpacingMeters: '0.50 x 0.30 m',
    recommendedPlantDensityPerHa: 66000,
    averageYieldKgHa: 9500,
    defaultYieldUnit: 'sc/ha',
    boxWeightKg: 60,
    waterDemandMmPerCycle: 600,
    averageKc: 1.15,
    safetyIntervalGeneralDays: 21,
    commercialClasses: ['Padrão Granel Tipo 1', 'Milho Verde (Espiga)', 'Silagem'],
    cultivarsRecommended: ['DKB 390 PRO3', 'P3844VYHR', 'FS500', 'Agroceres AG 8088'],
    nutritionalNeedsSummary: 'Alta resposta a Nitrogênio em cobertura (V4 a V6); Zinco no sulco de plantio.',
  },
  {
    id: 'feijao',
    name: 'Feijão Comum',
    scientificName: 'Phaseolus vulgaris',
    category: 'graos_cereais',
    cycleDaysAverage: 85,
    defaultSpacingMeters: '0.45 x 0.10 m',
    recommendedPlantDensityPerHa: 220000,
    averageYieldKgHa: 2800,
    defaultYieldUnit: 'sc/ha',
    boxWeightKg: 60,
    waterDemandMmPerCycle: 400,
    averageKc: 1.05,
    safetyIntervalGeneralDays: 14,
    commercialClasses: ['Carioca Nota 10', 'Preto Extra', 'Especial Exportação'],
    cultivarsRecommended: ['BRS Pérola', 'BRS FC402', 'IPR Campos Gerais', 'BRS Esteio'],
    nutritionalNeedsSummary: 'Sistema radicular superficial; sensível a déficit hídrico no florescimento e enchimento.',
  },
  {
    id: 'cafe',
    name: 'Café Arábica',
    scientificName: 'Coffea arabica',
    category: 'industriais_especiais',
    cycleDaysAverage: 365,
    defaultSpacingMeters: '3.50 x 0.70 m',
    recommendedPlantDensityPerHa: 4080,
    averageYieldKgHa: 2400,
    defaultYieldUnit: 'sc/ha',
    boxWeightKg: 60,
    waterDemandMmPerCycle: 1200,
    averageKc: 0.95,
    safetyIntervalGeneralDays: 21,
    commercialClasses: ['Especial (>84 pts SCA)', 'Fino Tipo 2/3', 'Duro', 'Rio'],
    cultivarsRecommended: ['Catuaí Vermelho IAC 144', 'Mundo Novo', 'Catuaí Amarelo IAC 62', 'Arara'],
    nutritionalNeedsSummary: 'Bienalidade produtiva; parcelamento de N e K no período chuvoso; adubação foliar com Zn e B.',
  },
];

export function calculateIGR(
  lot: TraceabilityLot,
  operations: TraceabilityOperation[],
  harvests: TraceabilityHarvestItem[],
  monitoring: TraceabilityPestMonitoring[],
  packing: any[]
): { score: number; status: 'excelente' | 'boa' | 'atencao' | 'incompleta'; breakdown: Record<string, number> } {
  let score = 0;
  const breakdown = {
    identificacaoLote: 0,
    cadernoOperacoes: 0,
    segurancaFitossanitaria: 0,
    registroColheita: 0,
    embalagemQRCodes: 0,
    expedicaoLogistica: 0,
    responsabilidadeTecnica: 0,
  };

  if (lot.lotCode) breakdown.identificacaoLote += 5;
  if (lot.sowingDate && (lot.nurseryTransplantDate || lot.estimatedHarvestStartDate)) breakdown.identificacaoLote += 5;
  if (lot.seedSupplier && lot.seedLotNumber) breakdown.identificacaoLote += 5;
  if (lot.plantsCount > 0 && lot.plantedAreaHa > 0) breakdown.identificacaoLote += 5;

  const lotOps = operations.filter(o => o.lotId === lot.id || o.lotCode === lot.lotCode);
  if (lotOps.length >= 1) breakdown.cadernoOperacoes += 5;
  if (lotOps.some(o => o.type === 'plantio')) breakdown.cadernoOperacoes += 5;
  if (lotOps.some(o => o.type === 'adubacao_solo' || o.type === 'fertirrigacao' || o.type === 'adubacao_cobertura')) breakdown.cadernoOperacoes += 5;
  if (lotOps.some(o => o.type === 'pulverizacao_defensivo' || o.type === 'pulverizacao_biologico' || o.type === 'irrigacao')) breakdown.cadernoOperacoes += 5;

  const sprayOps = lotOps.filter(o => o.type === 'pulverizacao_defensivo');
  if (sprayOps.length === 0) {
    breakdown.segurancaFitossanitaria += 15;
  } else {
    const allHaveMapa = sprayOps.every(o => o.mapaRegistrationNumber && o.activeIngredient);
    if (allHaveMapa) breakdown.segurancaFitossanitaria += 8;
    if (!lot.isUnderActiveQuarantine) breakdown.segurancaFitossanitaria += 7;
  }

  const lotHarvs = harvests.filter(h => h.lotId === lot.id || h.lotCode === lot.lotCode);
  if (lotHarvs.length > 0) {
    breakdown.registroColheita += 8;
    if (lotHarvs.every(h => h.netWeightKg > 0 && h.commercialClass)) breakdown.registroColheita += 7;
  } else if (lot.status === 'planejado' || lot.status === 'semeadura' || lot.status === 'desenvolvimento') {
    breakdown.registroColheita += 15;
  }

  const lotPacks = packing.filter(p => p.lotId === lot.id || p.lotCode === lot.lotCode);
  if (lotPacks.length > 0) {
    breakdown.embalagemQRCodes += 8;
    if (lotPacks.some(p => p.labelPrinted)) breakdown.embalagemQRCodes += 7;
  } else if (lot.status === 'planejado' || lot.status === 'semeadura' || lot.status === 'desenvolvimento') {
    breakdown.embalagemQRCodes += 15;
  }

  if (lot.totalExpeditedBoxes > 0) {
    breakdown.expedicaoLogistica += 10;
  } else {
    breakdown.expedicaoLogistica += 10;
  }

  if (lotOps.some(o => o.agronomistSignature)) {
    breakdown.responsabilidadeTecnica += 5;
  } else {
    breakdown.responsabilidadeTecnica += 3;
  }

  score = Object.values(breakdown).reduce((a, b) => a + b, 0);
  score = Math.min(100, Math.max(0, score));

  let status: 'excelente' | 'boa' | 'atencao' | 'incompleta' = 'incompleta';
  if (score >= 90) status = 'excelente';
  else if (score >= 75) status = 'boa';
  else if (score >= 50) status = 'atencao';

  return { score, status, breakdown };
}

export function generateGeaAgroLotCode(
  cropName: string,
  year: number,
  plotCode: string,
  sequential: number
): string {
  const cropPrefix = cropName
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .slice(0, 3);
  
  const cleanPlot = plotCode
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

  const seqStr = String(sequential).padStart(4, '0');

  return `GA-${cropPrefix}-${year}-${cleanPlot}-${seqStr}`;
}

export const DEFAULT_TRACEABILITY_LABEL_SETTINGS: any = {
  defaultSize: '100x50',
  defaultPrinterType: 'zebra_zpl',
  defaultDpi: 203,
  defaultCopies: 1,
  qrCodeSize: 'medio',
  printFormat: 'pdf',
  defaultUnit: 'kg',
  showProducerName: true,
  showDocument: true,
  showStateRegistration: true,
  showPlotInfo: true,
  showCultivar: true,
  showCommercialClass: true,
  showNetWeight: true,
  showHarvestDate: true,
  showSafeExpirationDate: true,
  showAgronomistArt: true,
  showInc02ComplianceBadge: true,
  showCustomLogo: true,
  customLogoUrl: '',
  enableSafetyIntervalLock: true,
  baseUrlPassport: '',
  autoIncrementBoxNumber: true,
  paperOrientation: 'landscape',
};
