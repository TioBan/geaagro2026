export interface ActiveIngredientControl {
  name: string; // Princípio ativo (ex: "Clorantraniliprole", "Metalaxil-M + Mancozebe")
  chemicalGroup: string; // Grupo químico (IRAC / FRAC)
  modeOfAction?: string;
  commercialProducts: string[]; // Exemplos de produtos comerciais
  recommendedDosage: string; // Dosagem viveiro/estufa
  applicationMethod: 'pulverizacao_foliar' | 'drench_substrato' | 'tratamento_sementes' | 'imersao_raizes';
  gracePeriodDays?: number;
  observations?: string;
  resistanceManagement?: string; // Manejo anti-resistência (rotação de grupos)
  phytotoxicityNotes?: string; // Cuidados com plântulas tenras
}

export interface BiologicalControlAgent {
  agentName: string; // Ex: "Beauveria bassiana", "Bacillus subtilis", "Trichoderma harzianum"
  agentType: 'fungo_entomopatogenico' | 'bacteria_antagonista' | 'fungo_antagonista' | 'parasitoide_predador' | 'virus_baculovirus' | 'nematoide_entomopatogenico';
  targetStage: string;
  commercialExamples: string[];
  dosage: string;
  modeOfUse: string;
  applicationConditions?: string; // Ex: "Aplicar no entardecer com UR > 70% e temperatura < 28°C"
}

export interface PhysicalMechanicalControl {
  methodName: string; // Ex: "Tela monofilamento 50 mesh antiafídeo", "Termoterapia de sementes (50°C / 25 min)", "Armadilhas cromotrópicas adesivas amarelas/azuis"
  category: 'barreira_fisica' | 'termoterapia' | 'armadilha_monitoramento' | 'solarizacao_vaporizacao' | 'roguing_descarte' | 'sanitizacao_superficies';
  specifications: string; // Detalhes técnicos de operação (densidade, temperatura, malha, etc.)
  mechanism: string; // Modo de atuação física no viveiro
  efficiencyRating?: 'alta' | 'moderada' | 'preventiva_obrigatoria';
}

export interface CulturalControlMeasure {
  practiceName: string; // Ex: "Manejo estrito da umidade e ventilação para evitar condensação foliar"
  category: 'vazio_sanitario' | 'gestao_irrigacao_vpd' | 'nutricao_equilibrio' | 'sanidade_sementes' | 'espacamento_aeracao' | 'desinfeccao_bandejas' | 'higiene_pessoal' | 'roguing_descarte';
  actionGuideline: string; // Instrução prática passo a passo
  impactOnDiseaseOrPest: string; // Efeito direto na quebra do ciclo da praga/patógeno
}

export interface CropPestDiseaseDetail {
  id: string;
  name: string; // Nome vulgar da praga ou doença
  scientificName: string; // Nome científico
  type: 'praga' | 'doenca';
  agentCategory: 'inseto' | 'acaro' | 'nematoide' | 'fungo' | 'bacteria' | 'oomiceto' | 'virus';
  plantPartsAffected: string[]; // Órgãos afetados na muda
  symptomsAndDamage: string; // Descrição dos danos na fase de viveiro
  economicThresholdInNursery: string; // Limiar de ação no viveiro
  activeIngredients: ActiveIngredientControl[]; // CONTROLE QUÍMICO
  biologicalControls: BiologicalControlAgent[]; // CONTROLE BIOLÓGICO
  physicalControls?: PhysicalMechanicalControl[]; // CONTROLE FÍSICO / MECÂNICO
  culturalControls?: CulturalControlMeasure[]; // CONTROLE CULTURAL ESTRUTURADO
  culturalPreventivePractices: string[]; // Boas práticas no viveiro (compatibilidade)
  favorableClimate?: {
    tempMin?: number;
    tempMax?: number;
    humidityMin?: number;
    description: string;
  };
}

export interface NurseryCrop {
  id: string;
  name: string;
  category: 'hortalica' | 'flor' | 'frutifera' | 'aromatica' | 'florestal';
  scientificName: string;
  cultivars: string[];
  germinationDaysMin: number;
  germinationDaysMax: number;
  nurseryCycleDaysMin: number;
  nurseryCycleDaysMax: number;
  idealTempMin: number;
  idealTempMax: number;
  idealHumidityMin: number;
  idealHumidityMax: number;
  recommendedTray: string; // Ex: '128 células', '200 células', '288 células'
  idealECMin: number; // mS/cm
  idealECMax: number;
  idealPhMin: number;
  idealPhMax: number;
  waterNeed: 'baixa' | 'moderada' | 'alta';
  lightRequirement: string;
  mainPests: string[];
  mainDiseases: string[];
  nutritionalNotes: string;
  hardeningTips: string; // Aclimatação / Rustificação
  iconName?: string;
  detailedPestsAndDiseases?: CropPestDiseaseDetail[];
}

export interface ProductionBatch {
  id: string;
  batchCode: string; // Ex: "LOTE-254"
  cropId: string;
  cropName: string;
  cultivar: string;
  trayType: '128' | '200' | '288' | '450' | 'tubete_55' | 'tubete_120';
  trayCount: number;
  cellsPerTray: number;
  totalSeedsSown: number;
  sowingDate: string;
  expectedGerminationDate: string;
  expectedReadyDate: string;
  greenhouse: string; // Ex: 'Estufa 01 - Hortaliças', 'Estufa 03 - Flores'
  benchLocation: string; // Ex: 'Bancada A-04'
  
  germinationRatePercent: number; // Taxa de germinação (%)
  lossRatePercent: number; // Taxa de perdas (%)
  lossReasons?: string[];
  
  // Estimativa automática
  estimatedReadyPlants: number;
  reservedPlants: number;
  availableForSalePlants: number;
  
  status: 'semeadura' | 'germinacao' | 'desenvolvimento' | 'aclimatacao' | 'pronto_expedicao' | 'entregue';
  unitCostBrl: number;
  unitSellingPriceBrl: number;
  substrateType: string;
  seedLotNumber: string;
  
  // Histórico de manejos
  irrigationHistory: { date: string; volumeLiters: number; ec: number; ph: number }[];
  sanitaryHistory: { date: string; product: string; target: string; type: 'quimico' | 'biologico' }[];
  nutritionalHistory: { date: string; recipe: string; stage: string }[];
  notes?: string;
}

export interface GreenhouseEnvironment {
  id: string;
  name: string;
  type: 'hortalicas' | 'flores' | 'enraizamento' | 'camara_germinacao';
  currentTemp: number; // °C
  currentHumidity: number; // %
  currentLux: number; // lux
  currentVpdKpa: number; // Déficit de pressão de vapor (kPa)
  ventilationStatus: 'aberto_100' | 'aberto_50' | 'fechado' | 'automatico';
  foggingStatus: 'ativo' | 'inativo' | 'temporizado';
  shadingScreenStatus: 'aberto' | 'fechado_50' | 'fechado_80';
  activeBatchesCount: number;
  totalCapacityTrays: number;
  currentOccupiedTrays: number;
  alerts: { severity: 'critical' | 'warning' | 'info'; message: string; timestamp: string }[];
}

export interface FertigationRecipe {
  id: string;
  name: string;
  stage: 'semeadura_enraizamento' | 'desenvolvimento_vegetativo' | 'aclimatacao_rustificacao' | 'florescimento' | 'solanaceas_cucurbitaceas' | 'clonagem_silvicultura' | 'frutiferas_cafe' | 'hidroponia_floating' | 'ervas_aromaticas' | 'brassicas_folhosas' | string;
  targetEC: number; // mS/cm
  targetPh: number;
  npkRatio: string; // Ex: "10-52-10" ou "20-10-20"
  elementsPpm: {
    n: number;
    p: number;
    k: number;
    ca: number;
    mg: number;
    s: number;
    fe: number;
    b: number;
    zn: number;
    mn?: number;
    cu?: number;
    mo?: number;
  };
  preparationDoseGPer100L: number;
  frequency: string;
  description: string;
  cropCategory?: string;
  compatibilityNotes?: string;
}

export interface PestDiseaseRecord {
  id: string;
  batchId: string;
  batchCode: string;
  greenhouse: string;
  pestOrDiseaseName: string;
  type: 'praga' | 'fungo' | 'bacteria' | 'virus' | 'fisiopatia';
  severity: 'baixo' | 'moderado' | 'severo';
  detectionDate: string;
  treatmentApplied: string;
  controlType: 'biologico' | 'quimico' | 'cultural' | 'fisico';
  responsibleTechnician: string;
  status: 'em_tratamento' | 'controlado' | 'recorrente';
}

export interface VisualNutritionalSymptom {
  id: string;
  element: string; // Ex: 'Nitrogênio (N)', 'Ferro (Fe)'
  type: 'deficiencia' | 'excesso';
  mobility: 'movel' | 'imovel';
  plantAreaAffected: 'folhas_velhas' | 'folhas_jovens' | 'toda_planta' | 'sistema_radicular';
  symptomsSummary: string;
  visualDiagnosticDescription: string;
  correctiveAction: string;
  fertigationAdjustment: string;
  imageUrl?: string;
  realPhotoUrl?: string;
  photoCaption?: string;
  photoTag?: string;
  secondaryPhotoUrl?: string;
  secondaryPhotoCaption?: string;
  secondaryPhotoTag?: string;
  affectedCrops?: string[];
  biochemicalRole?: string;
}

export interface NurseryCustomerOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  cropName: string;
  cultivar: string;
  quantityPlants: number;
  reservedBatchCode?: string;
  orderDate: string;
  deliveryDateTarget: string;
  unitPriceBrl: number;
  totalPriceBrl: number;
  status: 'reservado' | 'em_producao' | 'pronto' | 'entregue' | 'cancelado';
  paymentStatus: 'pendente' | 'sinal_pago' | 'quitado';
  deliveryMode: 'retirada_viveiro' | 'entrega_propriedade';
}

export interface NurseryFinancialMetrics {
  month: string;
  producedPlants: number;
  soldPlants: number;
  germinationAvgRate: number;
  lossesRatePercent: number;
  grossRevenueBrl: number;
  totalCostsBrl: number;
  netProfitBrl: number;
  costBreakdown: {
    seeds: number;
    substrate: number;
    fertilizers: number;
    packagingTrays: number;
    labor: number;
    energyWater: number;
  };
}

export interface NurseryPestDiseaseLibraryItem {
  id: string;
  name: string;
  scientificName: string;
  category: 'fungo' | 'oomiceto' | 'bacteria' | 'virus' | 'praga_inseto' | 'acaro' | 'nematoide';
  affectedCrops: string[];
  plantPart: 'colo_raiz' | 'folhas_cotiledones' | 'caule_haste' | 'sistema_vascular' | 'toda_planta';
  symptomsDescription: string;
  favorableConditions: string;
  damageSeverity: 'critica' | 'alta' | 'moderada';
  economicImpact: string;
  preventiveManagement: string[];
  biologicalControl: string[];
  chemicalControl: string[];
  organicControl?: string[];
  physicalControl?: string[];
  realPhotoUrl: string;
  photoCaption: string;
  photoTag: string;
  secondaryPhotoUrl?: string;
  secondaryPhotoCaption?: string;
  secondaryPhotoTag?: string;
}

