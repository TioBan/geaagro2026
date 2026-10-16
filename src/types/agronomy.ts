export type SoilTexture = 'arenoso' | 'medio' | 'argiloso' | 'muito_argiloso';

export interface Company {
  id: string;
  name: string;
  tradingName: string;
  cnpj: string;
  stateRegistration: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  creaRegister: string;
  mapaRegister?: string;
  logoUrl?: string;
  hasDigitalSignature?: boolean;
  legalSignatureHash?: string;
  legalSignatureDate?: string;
  createdAt: string;
}

export type TechnicalProfession =
  | 'Engenheiro Agrônomo'
  | 'Médica Veterinária'
  | 'Médico Veterinário'
  | 'Zootecnista'
  | 'Engenheiro Florestal'
  | 'Engenheiro Ambiental'
  | 'Técnico Agropecuário'
  | 'Outro';

export interface Agronomist {
  id: string;
  name: string;
  profession?: TechnicalProfession | string;
  councilType?: 'CREA' | 'CRMV' | 'CFTA' | 'CFT' | 'CRBio' | 'Outro' | string;
  crea: string; // Número de registro no conselho de classe
  councilNumber?: string;
  creaState: string;
  rnp: string;
  cpf: string;
  email: string;
  phone: string;
  address?: string; // Endereço profissional / clínica / consultório
  clinicAddress?: string;
  companyId: string;
  specialty: string;
  signatureText?: string;
  hasDigitalSignature?: boolean;
  legalSignatureHash?: string;
  legalSignatureDate?: string;
  createdAt: string;
}

export type TechnicalResponsible = Agronomist;

export interface RuralProducer {
  id: string;
  name: string;
  document: string; // CPF or CNPJ
  documentType: 'CPF' | 'CNPJ';
  stateRegistration: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  companyId: string;
  createdAt: string;
}

export interface FieldPlot {
  id: string;
  name: string;
  farmId: string;
  areaHa: number;
  texture: SoilTexture;
  clayPercentage: number;
  currentCrop?: string;
  spacingBetweenRowsMeters: number; // Espaçamento entre linhas (m)
  spacingBetweenPlantsMeters: number; // Espaçamento entre plantas (m)
  plantPopulationPerHa: number; // População de plantas/ha
  linearMetersPerHa: number; // Metros lineares/ha
  altitudeMeters?: number;
  irrigationType: 'sequeiro' | 'pivo_central' | 'gotejamento' | 'aspersao';
  historyNotes?: string;
}

export interface Farm {
  id: string;
  name: string;
  producerId: string;
  agronomistId: string;
  companyId: string;
  carRegister?: string; // Cadastro Ambiental Rural
  totalAreaHa: number;
  cultivatedAreaHa: number;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  soilGeneralType: string;
  cropHistory: string[];
  plots: FieldPlot[];
  createdAt: string;
}

// Soil Analysis Data (Laboratório Químico e Físico)
export interface SoilSample {
  id: string;
  sampleCode: string;
  farmId: string;
  plotId: string;
  collectionDate: string;
  depth: '0-20' | '20-40' | '0-40';
  labName: string;
  labProtocol: string;
  
  // Análise Química Básica / Acidez & M.O.
  phCaCl2: number; // Padrão Brasil
  phH2O?: number; // pH em Água (H2O)
  phSmp?: number; // Índice SMP (Acidez Potencial)
  organicMatterGdm3: number; // M.O. g/dm³ ou dag/kg (1 dag/kg = 10 g/dm³)
  
  // Macronutrientes Primários e Secundários
  pMehlich1MgDm3: number; // P fósforo Mehlich-1 mg/dm³
  pMehlich3MgDm3?: number; // P fósforo Mehlich-3 mg/dm³
  pResinaMgDm3?: number; // P resina mg/dm³
  pRemanescenteMgL?: number; // P Remanescente (P-Rem, mg/L)
  pRemanescente3MgL?: number; // Remanescente 3 / P-Rem 3 (mg/L)
  kCmolcDm3: number; // K potássio cmolc/dm³ (ou mg/dm³ / 391)
  kMgDm3?: number; // K potássio mg/dm³ (kCmolcDm3 * 391)
  caCmolcDm3: number; // Ca cálcio cmolc/dm³
  mgCmolcDm3: number; // Mg magnésio cmolc/dm³
  alCmolcDm3: number; // Al alumínio trocável cmolc/dm³
  hAlCmolcDm3: number; // H+Al acidez potencial cmolc/dm³
  
  // Enxofre e Micronutrientes
  sSO4MgDm3: number; // Enxofre S-SO4 mg/dm³
  bMgDm3: number; // Boro mg/dm³
  cuMgDm3: number; // Cobre mg/dm³
  feMgDm3: number; // Ferro mg/dm³
  mnMgDm3: number; // Manganês mg/dm³
  znMgDm3: number; // Zinco mg/dm³
  moMgDm3?: number; // Molibdênio mg/dm³

  // Elementos Benéficos e Funcionais
  siMgDm3?: number; // Silício (Si) mg/dm³
  coMgDm3?: number; // Cobalto (Co) mg/dm³
  niMgDm3?: number; // Níquel (Ni) mg/dm³
  seMgDm3?: number; // Selênio (Se) mg/dm³
  naCmolcDm3?: number; // Sódio (Na) cmolc/dm³
  
  // Granulometria / Física (%)
  clayPercent: number; // Argila %
  sandPercent: number; // Areia %
  siltPercent: number; // Silte %
  soilDensityGcm3?: number; // Densidade do solo g/cm³
  
  // BioAS - Bioanálise de Solo (Tecnologia Embrapa)
  hasBioAS?: boolean;
  arylsulfataseMgPnpKgH?: number; // Arilsulfatase (mg PNP/kg solo/h) - Ciclo do Enxofre
  betaGlucosidaseMgPnpKgH?: number; // Beta-glicosidase (mg PNP/kg solo/h) - Ciclo do Carbono
  acidPhosphataseMgPnpKgH?: number; // Fosfatase Ácida (mg PNP/kg solo/h) - Ciclo do Fósforo
  iqsBioScore?: number; // IQS Biológico (0 a 1.0 ou 0 a 100%)
  iqsChemicalScore?: number; // IQS Químico (0 a 1.0 ou 0 a 100%)
  iqsFertbioScore?: number; // IQS Fertbio Embrapa (0 a 1.0 ou 0 a 100%)
  iqsTotalScore?: number; // IQS Geral (Índice de Qualidade do Solo)
  bioasHealthClass?: 'Muito Baixa' | 'Baixa' | 'Média' | 'Alta' | 'Muito Alta';
  bioasInterpretation?: string; // Parecer agronômico biológico

  // Índices Calculados
  sb?: number; // Soma de Bases (Ca + Mg + K)
  ctcEffective?: number; // CTC efetiva (t = SB + Al)
  ctcTotal?: number; // CTC a pH 7.0 (T = SB + (H+Al))
  vPercent?: number; // Saturação por Bases % (SB / T * 100)
  mPercent?: number; // Saturação por Alumínio % (Al / t * 100)
  caMgRatio?: number; // Relação Ca/Mg
  caKRatio?: number; // Relação Ca/K
  mgKRatio?: number; // Relação Mg/K
  
  status: 'valid' | 'warning' | 'invalid';
  validationErrors?: string[];
  notes?: string;
}

// Leaf Analysis Data (Diagnose Foliar)
export interface LeafSample {
  id: string;
  sampleCode: string;
  farmId: string;
  plotId: string;
  crop: string;
  samplingDate: string;
  growthStage: string; // Ex: 'Florescimento', 'V4', 'Enchimento de Grãos'
  sampledPlantPart: string; // Ex: '3ª folha trifoliolada com pecíolo'
  labName: string;
  
  // Macronutrientes (g/kg ou dag/kg)
  n_g_kg: number; // Nitrogênio
  p_g_kg: number; // Fósforo
  k_g_kg: number; // Potássio
  ca_g_kg: number; // Cálcio
  mg_g_kg: number; // Magnésio
  s_g_kg: number; // Enxofre
  
  // Micronutrientes (mg/kg ou ppm)
  b_mg_kg: number; // Boro
  cu_mg_kg: number; // Cobre
  fe_mg_kg: number; // Ferro
  mn_mg_kg: number; // Manganês
  zn_mg_kg: number; // Zinco
  
  status: 'valid' | 'warning' | 'invalid';
  notes?: string;
}

// Crop Target Standards
export interface CropNutritionalTarget {
  id: string;
  name: string;
  scientificName: string;
  targetVPercent: number; // Saturação de bases ideal (%)
  targetCaMgRatioMin: number;
  targetCaMgRatioMax: number;
  expectedYieldUnit: string; // Ex: 'sc/ha', 'ton/ha', 'kg/ha'
  defaultYieldTarget: number;
  
  // Faixas ideais foliares (g/kg para macros, mg/kg para micros)
  leafSufficiencyRange: {
    n: [number, number];
    p: [number, number];
    k: [number, number];
    ca: [number, number];
    mg: [number, number];
    s: [number, number];
    b: [number, number];
    cu: [number, number];
    fe: [number, number];
    mn: [number, number];
    zn: [number, number];
  };
  
  // Extração e Exportação estimada por unidade de produtividade
  extractionKgPerYieldUnit: {
    n: number;
    p2o5: number;
    k2o: number;
    cao: number;
    mgo: number;
    s: number;
  };
  
  defaultRowSpacingM: number;
  defaultPlantSpacingM: number;
}

// Recommendation Result Structure (3 Units)
export interface UnitTriadValue {
  kgPerHa: number; // kg por hectare
  gPerPlant: number; // gramas por planta
  gPerLinearMeter: number; // gramas por metro linear
}

export interface LimingRecommendation {
  method: 'base_saturation' | 'aluminum_neutralization' | 'ca_elevation' | 'mg_elevation';
  targetVPercent: number;
  currentVPercent: number;
  prntPercent: number;
  soilIncorporationDepthCm: number;
  dose: UnitTriadValue; // t/ha convertido para kg/ha, g/planta, g/metro
  limestoneTypeRecommended: 'calcico' | 'magnesiano' | 'dolomitico';
  justification: string;
  applicationMode: string;
}

export interface GypsumRecommendation {
  isNeeded: boolean;
  criteriaTriggered: string[];
  clayPercentage: number;
  dose: UnitTriadValue;
  justification: string;
  applicationMode: string;
}

export interface FertilizerRecommendation {
  crop: string;
  expectedYield: number;
  yieldUnit: string;
  plantingFertilizer: {
    formulaName: string; // Ex: "04-14-08" ou "08-28-16"
    npkComposition: [number, number, number]; // [N%, P2O5%, K2O%]
    dose: UnitTriadValue;
    nutrientsProvidedKgHa: { n: number; p2o5: number; k2o: number };
  };
  topDressingFertilizer?: {
    formulaName: string; // Ex: "Ureia 46-00-00 + KCL"
    dose: UnitTriadValue;
    splitApplications: number; // Parcelamentos
    timing: string;
  };
  micronutrients?: {
    productName: string;
    dose: UnitTriadValue;
    elements: { b?: number; zn?: number; mn?: number; cu?: number };
  }[];
  technicalObservations: string[];
}

export interface TechnicalReport {
  id: string;
  reportNumber: string;
  issueDate: string;
  artNumber: string;
  farm: Farm;
  plot: FieldPlot;
  producer: RuralProducer;
  agronomist: Agronomist;
  company: Company;
  soilSample: SoilSample;
  leafSample?: LeafSample;
  crop: CropNutritionalTarget;
  targetYield: number;
  liming: LimingRecommendation;
  gypsum: GypsumRecommendation;
  fertilization: FertilizerRecommendation;
  foliarDiagnosisSummary?: string;
  conclusions: string[];
}
