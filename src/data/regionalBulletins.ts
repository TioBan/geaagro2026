// src/data/regionalBulletins.ts
// Catálogo dos Boletins Técnicos Regionais de Calagem e Adubação do Brasil

export interface RegionalBulletin {
  id: string;
  code: string;
  name: string;
  institution: string;
  region: string;
  coveredStates: string[];
  edition: string;
  description: string;
  badgeColor: string;
  
  // Liming Configuration
  defaultLimingMethod: 'v_percent' | 'smp' | 'al_neutralization';
  supportedLimingMethods: ('v_percent' | 'smp' | 'al_neutralization')[];
  targetVByCrop: {
    [cropId: string]: number; // Target V%
  };
  
  // Soil Texture Classification Thresholds (% Clay)
  textureClasses: {
    sandy: { maxClay: number; label: string };
    medium: { minClay: number; maxClay: number; label: string };
    clayey: { minClay: number; maxClay: number; label: string };
    veryClayey: { minClay: number; label: string };
  };
  
  // Critical & Interpretation Levels for Phosphorus (P)
  phosphorusMethod: 'Resina' | 'Mehlich-1' | 'Mehlich-3';
  pCriticalLevels: {
    // [texture: sandy | medium | clayey | veryClayey]: { low, medium, good, high }
    [textureKey: string]: { low: number; medium: number; good: number; high: number };
  };
  
  // Critical & Interpretation Levels for Potassium (K) (cmolc/dm3)
  kCriticalLevels: { low: number; medium: number; good: number; high: number };
  
  // Gypsum (Gessagem) Formula
  gypsumMethod: 'clay_multiplier' | 'al_saturation' | 'layer_requirement';
  gypsumFactor: number; // e.g., 50 for Cerrado (50 * %clay), 0.28 for IAC (0.28 * %clay or 50 * clay)
  
  // Regional Agronomic Notes
  notes: string[];
  officialReference: string;

  // Additional Reference Parameters & Macronutrients
  pRemanescenteCritical?: number; // mg/L
  pResinaCriticalLevel?: number; // mg/dm3
  pMehlich3CriticalLevel?: number; // mg/dm3
  calciumCriticalLevel?: number; // cmolc/dm3
  magnesiumCriticalLevel?: number; // cmolc/dm3
  potassiumCriticalLevel?: number; // cmolc/dm3
  sulfurCriticalLevel?: number; // mg/dm3
  nitrogenMineralizationFactor?: number; // kg N/ha per g/dm3 OM
  
  // Micronutrient Critical Levels (mg/dm3)
  boronCriticalLevel?: number; // mg/dm3
  zincCriticalLevel?: number; // mg/dm3
  copperCriticalLevel?: number; // mg/dm3
  manganeseCriticalLevel?: number; // mg/dm3
  ironCriticalLevel?: number; // mg/dm3
  molybdenumCriticalLevel?: number; // mg/dm3
  siliconCriticalLevel?: number; // mg/dm3

  // Base Saturation, Cation Balance & Acidity
  tolerableAlSaturation?: number; // m% maximum
  idealCaPercentageRange?: { min: number; max: number };
  idealMgPercentageRange?: { min: number; max: number };
  idealKPercentageRange?: { min: number; max: number };
  idealCaMgRatioRange?: { min: number; max: number };
  idealCaKRatioRange?: { min: number; max: number };
  idealMgKRatioRange?: { min: number; max: number };
  idealCaMgKRatioRange?: { min: number; max: number };

  // BioAS (Bioanálise de Solo - Embrapa Cerrados) Reference Parameters
  bioasArylCriticalLevel?: number; // µmol p-NP / kg solo / h (Arilsulfatase)
  bioasBetaGliCriticalLevel?: number; // µmol p-NP / kg solo / h (Beta-glicosidase)
  bioasFosfAcCriticalLevel?: number; // µmol p-NP / kg solo / h (Fosfatase Ácida)
  bioasCbmCriticalLevel?: number; // mg/kg (Carbono da Biomassa Microbiana)
  bioasRbsCriticalLevel?: number; // mg C-CO2/kg (Respiração Basal do Solo)
}

export const REGIONAL_BULLETINS: RegionalBulletin[] = [
  {
    id: 'boletim-100-iac',
    code: 'IAC B-100',
    name: 'Boletim 100 - IAC (São Paulo & Região Sudeste)',
    institution: 'Instituto Agronômico de Campinas (IAC)',
    region: 'Sudeste (SP, Sul de MG, RJ)',
    coveredStates: ['SP', 'MG', 'RJ'],
    edition: 'Boletim Técnico 100 - Recomendações de Adubação e Calagem para o Estado de SP',
    description: 'Padrão clássico baseado no método de Saturação por Bases (V%), extração de Fósforo por Resina Trocadora de Íons e balanço catiônico rigoroso.',
    badgeColor: 'bg-emerald-500 text-white',
    defaultLimingMethod: 'v_percent',
    supportedLimingMethods: ['v_percent', 'al_neutralization'],
    targetVByCrop: {
      soja: 65,
      milho: 70,
      algodao: 70,
      feijao: 70,
      trigo: 65,
      cafe: 60,
      cana: 60,
      citros: 70,
      pastagem: 50,
      hortalicas: 80,
    },
    textureClasses: {
      sandy: { maxClay: 15, label: 'Arenosa (<15% argila)' },
      medium: { minClay: 15, maxClay: 35, label: 'Média (15 a 35% argila)' },
      clayey: { minClay: 35, maxClay: 60, label: 'Argilosa (35 a 60% argila)' },
      veryClayey: { minClay: 60, label: 'Muito Argilosa (>60% argila)' },
    },
    phosphorusMethod: 'Resina',
    pCriticalLevels: {
      sandy: { low: 10, medium: 20, good: 30, high: 40 },
      medium: { low: 12, medium: 25, good: 40, high: 60 },
      clayey: { low: 15, medium: 30, good: 45, high: 70 },
      veryClayey: { low: 15, medium: 30, good: 45, high: 70 },
    },
    kCriticalLevels: { low: 0.15, medium: 0.30, good: 0.45, high: 0.60 },
    gypsumMethod: 'clay_multiplier',
    gypsumFactor: 0.28, // kg de gesso / ha = 0.28 * % argila * 100 (ou ~28 a 30 kg/ha por 1% argila para solos com deficiência subsuperficial)
    notes: [
      'Utiliza extração de Fósforo por Resina Trocadora de Ânions, que não sofre interferência da fração argila.',
      'Saturação por Bases (V%): método oficial com cálculo NC = CTC * (V2 - V1) / (10 * PRNT).',
      'Critério para Gessagem: Al > 0.3 cmolc/dm³ ou m% > 20% ou Ca < 0.4 cmolc/dm³ na camada 20-40 cm.',
    ],
    officialReference: 'RAIJ, B. van et al. Recomendações de adubação e calagem para o Estado de São Paulo. 2. ed. Campinas: IAC, 1997. 285p. (Boletim Técnico, 100).',
  },
  {
    id: 'boletim-cerrado-embrapa',
    code: 'Embrapa Cerrados',
    name: 'Cerrado - Embrapa (GO, MT, MS, DF, TO, MA, PI, BA)',
    institution: 'Embrapa Cerrados / CPAC',
    region: 'Centro-Oeste e Matopiba',
    coveredStates: ['GO', 'MT', 'MS', 'DF', 'TO', 'MA', 'PI', 'BA'],
    edition: 'Adubação e Calagem para o Bioma Cerrado (Sousa & Lobato)',
    description: 'Manual definitivo para solos tropicais altamente intemperizados (Latossolos Vermelho-Amarelos e Neossolos Quartzênicos). Considera o poder tampão do solo e classes de argila no fósforo Mehlich-1.',
    badgeColor: 'bg-amber-600 text-white',
    defaultLimingMethod: 'v_percent',
    supportedLimingMethods: ['v_percent', 'al_neutralization'],
    targetVByCrop: {
      soja: 60,
      milho: 65,
      algodao: 70,
      feijao: 70,
      trigo: 60,
      cafe: 60,
      cana: 60,
      citros: 70,
      pastagem: 45,
      hortalicas: 75,
    },
    textureClasses: {
      sandy: { maxClay: 20, label: 'Classe 4: Arenosa (<=20% argila)' },
      medium: { minClay: 21, maxClay: 40, label: 'Classe 3: Média (21 a 40% argila)' },
      clayey: { minClay: 41, maxClay: 60, label: 'Classe 2: Argilosa (41 a 60% argila)' },
      veryClayey: { minClay: 61, label: 'Classe 1: Muito Argilosa (>60% argila)' },
    },
    phosphorusMethod: 'Mehlich-1',
    pCriticalLevels: {
      sandy: { low: 10, medium: 20, good: 30, high: 45 },
      medium: { low: 6, medium: 12, good: 18, high: 30 },
      clayey: { low: 4, medium: 8, good: 12, high: 20 },
      veryClayey: { low: 3, medium: 6, good: 9, high: 15 },
    },
    kCriticalLevels: { low: 0.12, medium: 0.25, good: 0.40, high: 0.55 },
    gypsumMethod: 'clay_multiplier',
    gypsumFactor: 50, // NG = 50 * % argila (kg/ha de gesso agrícola) para anuais e 60 * % argila para perenes
    notes: [
      'Interpretação do Fósforo Mehlich-1 é inversamente proporcional ao teor de argila (Classes 1 a 4).',
      'Fórmula de Gessagem oficial de Sousa & Lobato: NG (kg/ha) = 50 × % Argila (culturas anuais) e 60 × % Argila (perenes).',
      'Critério de Gessagem subsuperficial (20-40 cm ou 40-60 cm): Ca < 0.5 cmolc/dm³ ou Al > 0.5 cmolc/dm³ ou m% > 20%.',
    ],
    officialReference: 'SOUSA, D. M. G.; LOBATO, E. (Ed.). Cerrado: correção do solo e adubação. 2. ed. Brasília: Embrapa Informação Tecnológica, 2004. 416 p.',
    pRemanescenteCritical: 25,
    pResinaCriticalLevel: 15,
    pMehlich3CriticalLevel: 14,
    calciumCriticalLevel: 2.0,
    magnesiumCriticalLevel: 0.8,
    potassiumCriticalLevel: 0.20,
    sulfurCriticalLevel: 10,
    nitrogenMineralizationFactor: 0.5,
    boronCriticalLevel: 0.35,
    zincCriticalLevel: 1.5,
    copperCriticalLevel: 0.8,
    manganeseCriticalLevel: 5.0,
    ironCriticalLevel: 15.0,
    molybdenumCriticalLevel: 0.12,
    siliconCriticalLevel: 12.0,
    tolerableAlSaturation: 15,
    idealCaPercentageRange: { min: 50, max: 70 },
    idealMgPercentageRange: { min: 10, max: 20 },
    idealKPercentageRange: { min: 2, max: 5 },
    idealCaMgRatioRange: { min: 3.0, max: 4.5 },
    idealCaKRatioRange: { min: 10.0, max: 20.0 },
    idealMgKRatioRange: { min: 3.0, max: 5.0 },
    idealCaMgKRatioRange: { min: 14.0, max: 25.0 },
    bioasArylCriticalLevel: 50,
    bioasBetaGliCriticalLevel: 140,
    bioasFosfAcCriticalLevel: 210,
    bioasCbmCriticalLevel: 300,
    bioasRbsCriticalLevel: 18.0,
  },
  {
    id: 'quinta-aproximacao-cfsemg',
    code: '5ª Aproximação CFSEMG',
    name: '5ª Aproximação - CFSEMG (Minas Gerais)',
    institution: 'Comissão de Fertilidade do Solo do Estado de Minas Gerais (CFSEMG)',
    region: 'Minas Gerais (MG)',
    coveredStates: ['MG', 'ES'],
    edition: '5ª Aproximação - Recomendações para o Uso de Corretivos e Fertilizantes em MG',
    description: 'Adota o método de Neutralização de Alumínio e elevação de Ca+Mg, além da Saturação por Bases, com ajuste fino de Fósforo por P-Remanescente e micronutrientes.',
    badgeColor: 'bg-red-600 text-white',
    defaultLimingMethod: 'al_neutralization',
    supportedLimingMethods: ['al_neutralization', 'v_percent'],
    targetVByCrop: {
      soja: 60,
      milho: 60,
      algodao: 70,
      feijao: 65,
      trigo: 60,
      cafe: 60,
      cana: 60,
      citros: 70,
      pastagem: 45,
      hortalicas: 75,
    },
    textureClasses: {
      sandy: { maxClay: 15, label: 'Arenosa (<15% argila)' },
      medium: { minClay: 15, maxClay: 35, label: 'Média (15 a 35% argila)' },
      clayey: { minClay: 35, maxClay: 60, label: 'Argilosa (35 a 60% argila)' },
      veryClayey: { minClay: 60, label: 'Muito Argilosa (>60% argila)' },
    },
    phosphorusMethod: 'Mehlich-1',
    pCriticalLevels: {
      sandy: { low: 12, medium: 22, good: 32, high: 45 },
      medium: { low: 7, medium: 14, good: 22, high: 32 },
      clayey: { low: 5, medium: 10, good: 15, high: 24 },
      veryClayey: { low: 3.5, medium: 7, good: 11, high: 18 },
    },
    kCriticalLevels: { low: 0.13, medium: 0.28, good: 0.42, high: 0.58 },
    gypsumMethod: 'clay_multiplier',
    gypsumFactor: 50,
    notes: [
      'Método de Calagem por Neutralização de Al³⁺ e Elevação de Ca+Mg: NC = Y*Al + [X - (Ca+Mg)], onde Y varia com a textura e X com a exigência da cultura.',
      'O teor crítico de Fósforo pode ser ajustado com precisão pelo P-Remanescente (P-rem).',
      'Exigência de gesso calculada para corrigir o ambiente radicular em profundidade.',
    ],
    officialReference: 'RIBEIRO, A. C.; GUIMARÃES, P. T. G.; ALVAREZ V., V. H. Recomendações para o uso de corretivos e fertilizantes em Minas Gerais: 5ª Aproximação. Viçosa: CFSEMG, 1999. 359 p.',
  },
  {
    id: 'manual-sul-sbcs',
    code: 'SBCS Sul (RS/SC)',
    name: 'Manual de Adubação e Calagem RS/SC',
    institution: 'Sociedade Brasileira de Ciência do Solo - Núcleo Regional Sul (CQFS-RS/SC)',
    region: 'Sul (Rio Grande do Sul e Santa Catarina)',
    coveredStates: ['RS', 'SC'],
    edition: 'Manual de Calagem e Adubação para os Estados do RS e SC - SBCS/CQFS',
    description: 'Adota oficialmente o Índice SMP para determinação da necessidade de calagem com base no poder tampão do solo e curvas de resposta a pH 5.5 ou 6.0.',
    badgeColor: 'bg-blue-600 text-white',
    defaultLimingMethod: 'smp',
    supportedLimingMethods: ['smp', 'v_percent'],
    targetVByCrop: {
      soja: 65,
      milho: 65,
      algodao: 70,
      feijao: 70,
      trigo: 65,
      cafe: 60,
      cana: 60,
      citros: 70,
      pastagem: 55,
      hortalicas: 75,
    },
    textureClasses: {
      sandy: { maxClay: 20, label: 'Classe 4 (<=20% argila)' },
      medium: { minClay: 21, maxClay: 40, label: 'Classe 3 (21 a 40% argila)' },
      clayey: { minClay: 41, maxClay: 60, label: 'Classe 2 (41 a 60% argila)' },
      veryClayey: { minClay: 61, label: 'Classe 1 (>60% argila)' },
    },
    phosphorusMethod: 'Mehlich-1',
    pCriticalLevels: {
      sandy: { low: 11, medium: 21, good: 30, high: 45 },
      medium: { low: 7, medium: 14, good: 20, high: 30 },
      clayey: { low: 5, medium: 10, good: 15, high: 22 },
      veryClayey: { low: 3.5, medium: 7, good: 10, high: 16 },
    },
    kCriticalLevels: { low: 0.15, medium: 0.30, good: 0.45, high: 0.65 },
    gypsumMethod: 'layer_requirement',
    gypsumFactor: 40,
    notes: [
      'Calagem via Índice SMP: Tabela oficial do Tampão SMP calibrada para elevar o pH para 5.5, 6.0 ou 6.5.',
      'Fósforo e Potássio classificados em 5 faixas: Muito Baixo, Baixo, Médio, Alto e Muito Alto.',
      'Manejo de Adubação de Manutenção e Reposição em Sistema Plantio Direto consolidado.',
    ],
    officialReference: 'COMISSÃO DE QUÍMICA E FERTILIDADE DO SOLO - CQFS-RS/SC. Manual de calagem e adubação para os Estados do Rio Grande do Sul e de Santa Catarina. 11. ed. Porto Alegre: SBCS - Núcleo Regional Sul, 2016. 376 p.',
  },
  {
    id: 'boletim-103-idr-parana',
    code: 'IDR-Paraná B-103',
    name: 'Manual de Adubação e Calagem do Paraná (IDR/IAPAR)',
    institution: 'Instituto de Desenvolvimento Rural do Paraná (IDR-Paraná / IAPAR / SBCS-NE)',
    region: 'Paraná (PR)',
    coveredStates: ['PR'],
    edition: 'Manual de Adubação e Calagem para o Estado do Paraná - NEPAR-SBCS',
    description: 'Desenvolvido para solos subtropicais e de transição do Paraná, calibrando Mehlich-1 e Mehlich-3 com foco em grãos, silagem e pastagens intensivas.',
    badgeColor: 'bg-emerald-700 text-white',
    defaultLimingMethod: 'v_percent',
    supportedLimingMethods: ['v_percent', 'smp', 'al_neutralization'],
    targetVByCrop: {
      soja: 65,
      milho: 70,
      algodao: 70,
      feijao: 70,
      trigo: 65,
      cafe: 60,
      cana: 60,
      citros: 70,
      pastagem: 50,
      hortalicas: 75,
    },
    textureClasses: {
      sandy: { maxClay: 20, label: 'Arenoso (<=20% argila)' },
      medium: { minClay: 21, maxClay: 40, label: 'Textura Média (21 a 40% argila)' },
      clayey: { minClay: 41, maxClay: 60, label: 'Argiloso (41 a 60% argila)' },
      veryClayey: { minClay: 61, label: 'Muito Argiloso (>60% argila)' },
    },
    phosphorusMethod: 'Mehlich-3',
    pCriticalLevels: {
      sandy: { low: 12, medium: 24, good: 36, high: 50 },
      medium: { low: 8, medium: 16, good: 24, high: 36 },
      clayey: { low: 5, medium: 11, good: 18, high: 28 },
      veryClayey: { low: 4, medium: 8, good: 14, high: 20 },
    },
    kCriticalLevels: { low: 0.14, medium: 0.28, good: 0.44, high: 0.60 },
    gypsumMethod: 'clay_multiplier',
    gypsumFactor: 45,
    notes: [
      'Método de Saturação por Bases V% com meta de 65-70% para grandes culturas.',
      'Considera histórico de adubação e sistema de rotação em SPD consolidado.',
    ],
    officialReference: 'NEPAR-SBCS. Manual de adubação e calagem para o Estado do Paraná. Curitiba: Núcleo Estadual Paraná da SBCS, 2017. 482 p.',
  },
  {
    id: 'recomendacoes-bahia-nordeste',
    code: 'Bahia & Nordeste (SEAGRI/Embrapa)',
    name: 'Recomendações de Adubação Bahia e Nordeste Semiárido',
    institution: 'SEAGRI / Embrapa Mandioca e Fruticultura / Embrapa Semiárido',
    region: 'Nordeste (BA, PE, CE, RN, PB, AL, SE)',
    coveredStates: ['BA', 'PE', 'CE', 'RN', 'PB', 'AL', 'SE'],
    edition: 'Manual de Adubação e Calagem para o Estado da Bahia',
    description: 'Calibrado para condições de tabuleiros costeiros, oeste baiano e semiárido irrigado, considerando retenção hídrica, micronutrientes e risco de salinização.',
    badgeColor: 'bg-orange-600 text-white',
    defaultLimingMethod: 'v_percent',
    supportedLimingMethods: ['v_percent', 'al_neutralization'],
    targetVByCrop: {
      soja: 60,
      milho: 65,
      algodao: 70,
      feijao: 65,
      trigo: 60,
      cafe: 65,
      cana: 60,
      citros: 70,
      pastagem: 50,
      hortalicas: 75,
    },
    textureClasses: {
      sandy: { maxClay: 15, label: 'Arenosa (<15% argila)' },
      medium: { minClay: 15, maxClay: 35, label: 'Média (15 a 35% argila)' },
      clayey: { minClay: 35, maxClay: 60, label: 'Argilosa (35 a 60% argila)' },
      veryClayey: { minClay: 60, label: 'Muito Argilosa (>60% argila)' },
    },
    phosphorusMethod: 'Mehlich-1',
    pCriticalLevels: {
      sandy: { low: 10, medium: 20, good: 30, high: 45 },
      medium: { low: 6, medium: 13, good: 20, high: 30 },
      clayey: { low: 4, medium: 9, good: 14, high: 22 },
      veryClayey: { low: 3, medium: 6, good: 10, high: 16 },
    },
    kCriticalLevels: { low: 0.12, medium: 0.26, good: 0.40, high: 0.55 },
    gypsumMethod: 'clay_multiplier',
    gypsumFactor: 50,
    notes: [
      'Atenção aos micronutrientes Zinco e Boro em solos com baixa matéria orgânica.',
      'Controle rigoroso da condutividade elétrica e sódio trocável em áreas irrigadas.',
    ],
    officialReference: 'SANTANA, M. B. M. et al. Manual de adubação e calagem para o Estado da Bahia. Salvador: SEAGRI, 2012.',
  },
  {
    id: 'embrapa-amazonia-norte',
    code: 'Embrapa Amazônia (Norte)',
    name: 'Amazônia & Região Norte (Embrapa Amazônia)',
    institution: 'Embrapa Amazônia Oriental / Embrapa Amazônia Ocidental',
    region: 'Norte (PA, AM, RO, RR, AC, AP)',
    coveredStates: ['PA', 'AM', 'RO', 'RR', 'AC', 'AP'],
    edition: 'Recomendações de Adubação e Calagem para os Solos da Amazônia',
    description: 'Especializado para solos hiper-lixiviados da Bacia Amazônica, Neossolos e Latossolos Amarelos com elevada saturação por alumínio (m% > 50%) e alta fixação de fósforo.',
    badgeColor: 'bg-teal-700 text-white',
    defaultLimingMethod: 'al_neutralization',
    supportedLimingMethods: ['al_neutralization', 'v_percent'],
    targetVByCrop: {
      soja: 60,
      milho: 60,
      algodao: 65,
      feijao: 60,
      trigo: 60,
      cafe: 60,
      cana: 55,
      citros: 65,
      pastagem: 45,
      hortalicas: 70,
    },
    textureClasses: {
      sandy: { maxClay: 18, label: 'Arenosa (<18% argila)' },
      medium: { minClay: 18, maxClay: 35, label: 'Média (18 a 35% argila)' },
      clayey: { minClay: 35, maxClay: 60, label: 'Argilosa (35 a 60% argila)' },
      veryClayey: { minClay: 60, label: 'Muito Argilosa (>60% argila)' },
    },
    phosphorusMethod: 'Mehlich-1',
    pCriticalLevels: {
      sandy: { low: 8, medium: 16, good: 25, high: 38 },
      medium: { low: 5, medium: 10, good: 16, high: 25 },
      clayey: { low: 3.5, medium: 7, good: 11, high: 18 },
      veryClayey: { low: 2.5, medium: 5, good: 8, high: 14 },
    },
    kCriticalLevels: { low: 0.10, medium: 0.22, good: 0.35, high: 0.50 },
    gypsumMethod: 'clay_multiplier',
    gypsumFactor: 40,
    notes: [
      'Foco na neutralização de alumínio tóxico (Al³⁺) com uso de calcário dolomítico para suprir Cálcio e Magnésio.',
      'Manejo de matéria orgânica e cobertura vegetal permanente como prioridade para reter nutrientes lixiviáveis.',
    ],
    officialReference: 'CRAVO, M. S.; VIÉGAS, I. J. M.; BRASIL, E. C. (Ed.). Recomendações de adubação e calagem para o Estado do Pará. 2. ed. Belém: Embrapa Amazônia Oriental, 2020. 450 p.',
  },
  {
    id: 'boletim-incaper-es',
    code: 'Incaper ES',
    name: 'Manual de Calagem e Adubação do Espírito Santo (Incaper)',
    institution: 'Instituto Capixaba de Pesquisa, Assistência Técnica e Extensão Rural (Incaper)',
    region: 'Sudeste (Espírito Santo)',
    coveredStates: ['ES'],
    edition: 'Manual de Recomendação de Calagem e Adubação para o Estado do Espírito Santo',
    description: 'Focado em culturas de alta relevância para o ES, como café conilon e arábica, pimenta-do-reino, mamão e fruteiras tropicais. Combina V% com Mehlich-1.',
    badgeColor: 'bg-pink-600 text-white',
    defaultLimingMethod: 'v_percent',
    supportedLimingMethods: ['v_percent', 'al_neutralization'],
    targetVByCrop: {
      soja: 60,
      milho: 60,
      algodao: 65,
      feijao: 60,
      trigo: 60,
      cafe: 60,
      cana: 60,
      citros: 60,
      pastagem: 50,
      hortalicas: 70,
    },
    textureClasses: {
      sandy: { maxClay: 15, label: 'Arenosa (<15% argila)' },
      medium: { minClay: 15, maxClay: 35, label: 'Média (15 a 35% argila)' },
      clayey: { minClay: 35, maxClay: 60, label: 'Argilosa (35 a 60% argila)' },
      veryClayey: { minClay: 60, label: 'Muito Argilosa (>60% argila)' },
    },
    phosphorusMethod: 'Mehlich-1',
    pCriticalLevels: {
      sandy: { low: 12, medium: 24, good: 36, high: 50 },
      medium: { low: 8, medium: 16, good: 25, high: 38 },
      clayey: { low: 5, medium: 10, good: 16, high: 25 },
      veryClayey: { low: 3.5, medium: 7, good: 11, high: 18 },
    },
    kCriticalLevels: { low: 0.12, medium: 0.25, good: 0.38, high: 0.55 },
    gypsumMethod: 'clay_multiplier',
    gypsumFactor: 40,
    notes: [
      'Especialmente calibrado para o sistema de manejo de encostas e solos de tabuleiro capixabas.',
      'Altamente direcionado para a cafeicultura de montanha (Arábica) e café Conilon.',
      'Uso integrado de calagem e gesso para melhoria do sistema radicular profundo em café de encosta.',
    ],
    officialReference: 'PREZOTTI, L. C. et al. Manual de recomendação de calagem e adubação para o Estado do Espírito Santo. Vitória: Incaper, 2007. 305 p.',
    pRemanescenteCritical: 28,
    sulfurCriticalLevel: 12,
    boronCriticalLevel: 0.3,
    zincCriticalLevel: 1.5,
    copperCriticalLevel: 0.6,
    manganeseCriticalLevel: 5.0,
    ironCriticalLevel: 15.0,
    tolerableAlSaturation: 10,
    idealCaPercentageRange: { min: 45, max: 65 },
    idealMgPercentageRange: { min: 12, max: 22 },
    idealKPercentageRange: { min: 3, max: 6 },
  },
  {
    id: 'boletim-ipa-pernambuco',
    code: 'IPA Pernambuco',
    name: 'Manual de Adubação e Calagem para Pernambuco (IPA)',
    institution: 'Instituto Agronômico de Pernambuco (IPA)',
    region: 'Nordeste (Pernambuco & Região Agreste/Sertão)',
    coveredStates: ['PE', 'AL', 'PB'],
    edition: 'Recomendações de Adubação para o Estado de Pernambuco',
    description: 'Excelente referência para solos do semiárido, agreste e zona da mata de Pernambuco, com foco em milho, feijão, cana-de-açúcar, capim-elefante, palma forrageira e fruticultura.',
    badgeColor: 'bg-indigo-700 text-white',
    defaultLimingMethod: 'v_percent',
    supportedLimingMethods: ['v_percent', 'al_neutralization'],
    targetVByCrop: {
      soja: 60,
      milho: 60,
      algodao: 65,
      feijao: 60,
      trigo: 55,
      cafe: 60,
      cana: 60,
      citros: 60,
      pastagem: 50,
      hortalicas: 70,
    },
    textureClasses: {
      sandy: { maxClay: 15, label: 'Arenosa (<15% argila)' },
      medium: { minClay: 15, maxClay: 35, label: 'Média (15 a 35% argila)' },
      clayey: { minClay: 35, maxClay: 60, label: 'Argilosa (35 a 60% argila)' },
      veryClayey: { minClay: 60, label: 'Muito Argilosa (>60% argila)' },
    },
    phosphorusMethod: 'Mehlich-1',
    pCriticalLevels: {
      sandy: { low: 10, medium: 20, good: 30, high: 45 },
      medium: { low: 6, medium: 12, good: 18, high: 28 },
      clayey: { low: 4, medium: 8, good: 12, high: 20 },
      veryClayey: { low: 3, medium: 6, good: 9, high: 15 },
    },
    kCriticalLevels: { low: 0.10, medium: 0.20, good: 0.35, high: 0.50 },
    gypsumMethod: 'clay_multiplier',
    gypsumFactor: 45,
    notes: [
      'Desenvolvido considerando a alta variação microclimática entre a Zona da Mata litorânea, Agreste de transição e Sertão semiárido.',
      'Destaque especial para adubação orgânica e manejo qualificado do fósforo em solos de pH neutro a básico do semiárido.',
      'Recomendações clássicas de adubação para palma forrageira e culturas tolerantes à seca.',
    ],
    officialReference: 'CAVALCANTI, F. J. A. (Ed.). Recomendações de adubação para o Estado de Pernambuco: 2ª aproximação. Recife: IPA, 2008. 212 p.',
    pRemanescenteCritical: 22,
    sulfurCriticalLevel: 8,
    boronCriticalLevel: 0.25,
    zincCriticalLevel: 1.0,
    copperCriticalLevel: 0.5,
    manganeseCriticalLevel: 3.5,
    ironCriticalLevel: 10.0,
    tolerableAlSaturation: 20,
    idealCaPercentageRange: { min: 50, max: 70 },
    idealMgPercentageRange: { min: 15, max: 25 },
    idealKPercentageRange: { min: 2, max: 4 },
  },
  {
    id: 'boletim-pesagro-rj',
    code: 'Manual RJ (Pesagro)',
    name: 'Manual de Adubação e Calagem do Rio de Janeiro',
    institution: 'Pesagro-Rio / UFRRJ',
    region: 'Sudeste (Rio de Janeiro)',
    coveredStates: ['RJ'],
    edition: 'Manual de Recomendação de Adubação para o Estado do Rio de Janeiro',
    description: 'Calibrado para as condições fluminenses, incluindo solos de encostas sob pastagens, cinturões hortifrutigranjeiros das regiões serrana e metropolitana.',
    badgeColor: 'bg-cyan-600 text-white',
    defaultLimingMethod: 'v_percent',
    supportedLimingMethods: ['v_percent', 'al_neutralization'],
    targetVByCrop: {
      soja: 60,
      milho: 65,
      algodao: 65,
      feijao: 65,
      trigo: 60,
      cafe: 60,
      cana: 60,
      citros: 60,
      pastagem: 50,
      hortalicas: 75,
    },
    textureClasses: {
      sandy: { maxClay: 15, label: 'Arenosa (<15% argila)' },
      medium: { minClay: 15, maxClay: 35, label: 'Média (15 a 35% argila)' },
      clayey: { minClay: 35, maxClay: 60, label: 'Argilosa (35 a 60% argila)' },
      veryClayey: { minClay: 60, label: 'Muito Argilosa (>60% argila)' },
    },
    phosphorusMethod: 'Mehlich-1',
    pCriticalLevels: {
      sandy: { low: 12, medium: 22, good: 32, high: 45 },
      medium: { low: 8, medium: 15, good: 22, high: 32 },
      clayey: { low: 5, medium: 10, good: 15, high: 22 },
      veryClayey: { low: 3.5, medium: 7, good: 10, high: 15 },
    },
    kCriticalLevels: { low: 0.12, medium: 0.24, good: 0.38, high: 0.52 },
    gypsumMethod: 'clay_multiplier',
    gypsumFactor: 40,
    notes: [
      'Foco em solos com relevo ondulado a forte ondulado, exigindo práticas conservacionistas integradas e sustentáveis.',
      'Desenvolvimento de tabelas de recomendação de adubação orgânica ricas para olericultura de montanha.',
      'Tabelas calibradas para pastagens de baixa tecnologia e recuperação de encostas sob erosão.',
    ],
    officialReference: 'PESAGRO-RIO. Manual de recomendação de adubação e calagem para o Estado do Rio de Janeiro. Niterói: Pesagro-Rio, 2013. 244 p.',
    pRemanescenteCritical: 24,
    sulfurCriticalLevel: 10,
    boronCriticalLevel: 0.3,
    zincCriticalLevel: 1.2,
    copperCriticalLevel: 0.7,
    manganeseCriticalLevel: 4.0,
    ironCriticalLevel: 12.0,
    tolerableAlSaturation: 15,
    idealCaPercentageRange: { min: 50, max: 70 },
    idealMgPercentageRange: { min: 10, max: 20 },
    idealKPercentageRange: { min: 2, max: 5 },
  },
  {
    id: 'boletim-arroz-irrigado-rs',
    code: 'Embrapa/IRGA Arroz',
    name: 'Boletim de Fertilidade e Várzea (Arroz Irrigado/RS)',
    institution: 'Embrapa Clima Temperado / Instituto Rio Grandense do Arroz (IRGA)',
    region: 'Sul (Solos de Várzea e Arroz Irrigado)',
    coveredStates: ['RS', 'SC'],
    edition: 'Recomendações para Arroz Irrigado e Culturas de Sequeiro em Rotação em Várzea',
    description: 'Focaliza solos planos sob inundação temporária (Gleissolos e Planossolos) com calibrações de pH e gessagem exclusivas para ambientes anaeróbios de produção.',
    badgeColor: 'bg-teal-800 text-white',
    defaultLimingMethod: 'v_percent',
    supportedLimingMethods: ['v_percent', 'smp'],
    targetVByCrop: {
      soja: 60,
      milho: 60,
      algodao: 55,
      feijao: 60,
      trigo: 60,
      cafe: 50,
      cana: 50,
      citros: 60,
      pastagem: 50,
      hortalicas: 70,
    },
    textureClasses: {
      sandy: { maxClay: 15, label: 'Textura Arenosa (<15% argila)' },
      medium: { minClay: 15, maxClay: 30, label: 'Textura Média (15 a 30% argila)' },
      clayey: { minClay: 30, maxClay: 50, label: 'Textura Argilosa (30 a 50% argila)' },
      veryClayey: { minClay: 50, label: 'Textura Muito Argilosa (>50% argila)' },
    },
    phosphorusMethod: 'Mehlich-1',
    pCriticalLevels: {
      sandy: { low: 12, medium: 24, good: 35, high: 50 },
      medium: { low: 8, medium: 16, good: 25, high: 38 },
      clayey: { low: 5, medium: 10, good: 16, high: 24 },
      veryClayey: { low: 3.5, medium: 7, good: 11, high: 16 },
    },
    kCriticalLevels: { low: 0.10, medium: 0.22, good: 0.35, high: 0.50 },
    gypsumMethod: 'layer_requirement',
    gypsumFactor: 30,
    notes: [
      'O pH em água tende a se elevar naturalmente para perto de 6.0 a 6.5 após a inundação devido à redução química natural do ferro.',
      'As tabelas de adubação de nitrogênio dependem estritamente da temperatura da água e do estágio fenológico de perfilhamento do arroz.',
      'Critérios específicos de fósforo em solos inundados, onde a solubilidade natural do ferro-fósforo aumenta pela redução química.',
    ],
    officialReference: 'SOCIEDADE SUL-BRASILEIRA DE ARROZ IRRIGADO (SOSBAI). Arroz irrigado: recomendações técnicas da pesquisa para o Sul do Brasil. Pelotas: SOSBAI, 2018. 188 p.',
    pRemanescenteCritical: 32,
    sulfurCriticalLevel: 15,
    boronCriticalLevel: 0.3,
    zincCriticalLevel: 1.8,
    copperCriticalLevel: 0.5,
    manganeseCriticalLevel: 6.0,
    ironCriticalLevel: 20.0,
    tolerableAlSaturation: 5,
    idealCaPercentageRange: { min: 45, max: 60 },
    idealMgPercentageRange: { min: 15, max: 25 },
    idealKPercentageRange: { min: 2, max: 4 },
  },
  {
    id: 'padrao-lab-embrapa-solos',
    code: 'LAB-EMBRAPA',
    name: '🧪 Padrão Laboratorial Embrapa Solos (Método Oficial Nacional)',
    institution: 'Embrapa Solos (Rio de Janeiro / Nacional)',
    region: 'Nacional / Laboratórios Credenciados',
    coveredStates: ['BR', 'RJ', 'DF', 'MT', 'GO', 'SP', 'RS', 'MG', 'PA'],
    edition: 'Manual de Métodos de Análise de Solo - Embrapa (3ª Edição Revisada)',
    description: 'Padrão analítico nacional para extração e quantificação de macro e micronutrientes, pH CaCl2 e água, matéria orgânica e BioAS.',
    badgeColor: 'bg-emerald-600 text-white',
    defaultLimingMethod: 'v_percent',
    supportedLimingMethods: ['v_percent', 'al_neutralization'],
    targetVByCrop: { soja: 65, milho: 65, algodao: 70, feijao: 70, cafe: 60, cana: 60, pastagem: 50 },
    textureClasses: {
      sandy: { maxClay: 15, label: 'Arenosa (<15% argila)' },
      medium: { minClay: 15, maxClay: 35, label: 'Média (15 a 35% argila)' },
      clayey: { minClay: 35, maxClay: 60, label: 'Argilosa (35 a 60% argila)' },
      veryClayey: { minClay: 60, label: 'Muito Argilosa (>60% argila)' },
    },
    phosphorusMethod: 'Mehlich-1',
    pCriticalLevels: {
      sandy: { low: 12, medium: 24, good: 36, high: 50 },
      medium: { low: 10, medium: 20, good: 30, high: 45 },
      clayey: { low: 8, medium: 15, good: 25, high: 35 },
      veryClayey: { low: 6, medium: 12, good: 20, high: 30 },
    },
    kCriticalLevels: { low: 0.15, medium: 0.25, good: 0.40, high: 0.60 },
    gypsumMethod: 'clay_multiplier',
    gypsumFactor: 50,
    notes: [
      'Padrão analítico oficial de referência do Programa de Interlaboratorial de Análise de Solo (PAQLF).',
      'Metodologias padronizadas para determinação de Cátions Trocáveis (Ca, Mg, K, Na) por Espectrometria de Absorção Atômica / ICP-OES.',
      'Suporte integrado para BioAS (Arilsulfatase, Beta-glicosidase e Fosfatase Ácida).',
    ],
    officialReference: 'TEIXEIRA, P. C. et al. Manual de métodos de análise de solo. 3. ed. rev. e ampl. Brasília, DF: Embrapa, 2017. 573 p.',
    pRemanescenteCritical: 25,
    sulfurCriticalLevel: 10,
    boronCriticalLevel: 0.35,
    zincCriticalLevel: 1.2,
    copperCriticalLevel: 0.8,
    manganeseCriticalLevel: 4.0,
    ironCriticalLevel: 12.0,
  },
  {
    id: 'padrao-lab-iac-resina',
    code: 'LAB-IAC',
    name: '🧪 Padrão Laboratorial IAC (Resina Trocadora de Íons)',
    institution: 'Instituto Agronômico de Campinas (IAC)',
    region: 'Sudeste & Centro-Sul',
    coveredStates: ['SP', 'MG', 'PR', 'MS', 'GO'],
    edition: 'Rede IAC de Análise de Solo (Controle de Qualidade CIBRA)',
    description: 'Padrão analítico com extração de Fósforo por Resina de Troca Iônica em lâmina e determinação rigorosa do Complexo Sortivo.',
    badgeColor: 'bg-teal-600 text-white',
    defaultLimingMethod: 'v_percent',
    supportedLimingMethods: ['v_percent', 'al_neutralization'],
    targetVByCrop: { soja: 65, milho: 70, algodao: 70, feijao: 70, cafe: 60, cana: 60, pastagem: 50 },
    textureClasses: {
      sandy: { maxClay: 15, label: 'Arenosa (<15% argila)' },
      medium: { minClay: 15, maxClay: 35, label: 'Média (15 a 35% argila)' },
      clayey: { minClay: 35, maxClay: 60, label: 'Argilosa (35 a 60% argila)' },
      veryClayey: { minClay: 60, label: 'Muito Argilosa (>60% argila)' },
    },
    phosphorusMethod: 'Resina',
    pCriticalLevels: {
      sandy: { low: 10, medium: 20, good: 30, high: 40 },
      medium: { low: 12, medium: 25, good: 40, high: 60 },
      clayey: { low: 15, medium: 30, good: 45, high: 70 },
      veryClayey: { low: 15, medium: 30, good: 45, high: 70 },
    },
    kCriticalLevels: { low: 0.15, medium: 0.30, good: 0.45, high: 0.60 },
    gypsumMethod: 'clay_multiplier',
    gypsumFactor: 0.28,
    notes: [
      'Padrão analítico da Rede IAC de Análise de Solo com controle de qualidade selo ouro.',
      'Extração por Resina Trocadora de Ânions/Cátions (Amberlite) imitando a absorção radicular das plantas.',
    ],
    officialReference: 'CANTARELLA, H. et al. Análise química para avaliação da fertilidade de solos tropicais. Campinas: IAC, 2001. 285 p.',
  },
  {
    id: 'padrao-lab-solocria-cerrado',
    code: 'LAB-SOLOCRIA',
    name: '🧪 Padrão Laboratorial Solocria (Matopiba e Centro-Oeste)',
    institution: 'Solocria Laboratório de Análises Agropecuárias',
    region: 'Centro-Oeste & Matopiba',
    coveredStates: ['GO', 'MT', 'MS', 'TO', 'BA', 'MA', 'PI', 'DF'],
    edition: 'Protocolo de Alta Precisão para Latossolos do Cerrado',
    description: 'Padrão laboratorial focado na agricultura comercial intensiva de grãos e algodão, com calibração precisa para solos argilosos e arenosos.',
    badgeColor: 'bg-amber-600 text-white',
    defaultLimingMethod: 'v_percent',
    supportedLimingMethods: ['v_percent', 'al_neutralization'],
    targetVByCrop: { soja: 65, milho: 65, algodao: 70, feijao: 70, cafe: 60, pastagem: 50 },
    textureClasses: {
      sandy: { maxClay: 15, label: 'Arenosa (<15% argila)' },
      medium: { minClay: 15, maxClay: 35, label: 'Média (15 a 35% argila)' },
      clayey: { minClay: 35, maxClay: 60, label: 'Argilosa (35 a 60% argila)' },
      veryClayey: { minClay: 60, label: 'Muito Argilosa (>60% argila)' },
    },
    phosphorusMethod: 'Mehlich-1',
    pCriticalLevels: {
      sandy: { low: 15, medium: 30, good: 45, high: 60 },
      medium: { low: 10, medium: 20, good: 30, high: 45 },
      clayey: { low: 7, medium: 14, good: 22, high: 32 },
      veryClayey: { low: 5, medium: 10, good: 18, high: 25 },
    },
    kCriticalLevels: { low: 0.18, medium: 0.28, good: 0.45, high: 0.65 },
    gypsumMethod: 'clay_multiplier',
    gypsumFactor: 50,
    notes: [
      'Amplamente utilizado em laudos de análise do Centro-Oeste e fronteira do Matopiba.',
      'Calibração otimizada para textura da camada 0-20 cm e perfil de 20-40 cm.',
    ],
    officialReference: 'SOLOCRIA. Tabela de Interpretação e Laudos Analíticos de Solo e Nutrição Vegetal. Goiânia: Solocria, 2022.',
  },
  {
    id: 'padrao-lab-ibra-nacional',
    code: 'LAB-IBRA',
    name: '🧪 Padrão Laboratorial IBRA (Instituto Brasileiro de Análise)',
    institution: 'IBRA - Instituto Brasileiro de Análise de Solos',
    region: 'Nacional (ISO 17025)',
    coveredStates: ['BR', 'SP', 'MG', 'GO', 'MT', 'PR', 'RS'],
    edition: 'Padrão Analítico Acreditado ISO/IEC 17025',
    description: 'Padrão de laudos de precisão acreditados com métodos Mehlich-1, Resina, Mehlich-3 e caracterização completa de micronutrientes.',
    badgeColor: 'bg-purple-600 text-white',
    defaultLimingMethod: 'v_percent',
    supportedLimingMethods: ['v_percent', 'al_neutralization'],
    targetVByCrop: { soja: 65, milho: 70, algodao: 70, feijao: 70, cafe: 60 },
    textureClasses: {
      sandy: { maxClay: 15, label: 'Arenosa (<15% argila)' },
      medium: { minClay: 15, maxClay: 35, label: 'Média (15 a 35% argila)' },
      clayey: { minClay: 35, maxClay: 60, label: 'Argilosa (35 a 60% argila)' },
      veryClayey: { minClay: 60, label: 'Muito Argilosa (>60% argila)' },
    },
    phosphorusMethod: 'Resina',
    pCriticalLevels: {
      sandy: { low: 10, medium: 20, good: 30, high: 40 },
      medium: { low: 12, medium: 25, good: 40, high: 60 },
      clayey: { low: 15, medium: 30, good: 45, high: 70 },
      veryClayey: { low: 15, medium: 30, good: 45, high: 70 },
    },
    kCriticalLevels: { low: 0.15, medium: 0.30, good: 0.45, high: 0.60 },
    gypsumMethod: 'clay_multiplier',
    gypsumFactor: 0.28,
    notes: [
      'Acreditação ISO 17025 para relatórios laboratoriais de alta precisão e integridade de laudos.',
    ],
    officialReference: 'IBRA. Manual de Interpretação e Métodos Analíticos de Laboratório. Campinas: IBRA, 2023.',
  },
  {
    id: 'boletim-matopiba-meio-norte',
    code: 'Embrapa Matopiba',
    name: 'Manual de Calagem e Adubação do Matopiba (MA, TO, PI, BA)',
    institution: 'Embrapa Meio-Norte / Embrapa Cerrados',
    region: 'Matopiba (Fronteira Agrícola)',
    coveredStates: ['MA', 'TO', 'PI', 'BA'],
    edition: 'Recomendações para a Fronteira Agrícola do Matopiba',
    description: 'Diretrizes calibradas para Neossolos Quartzarênicos e Latossolos de textura média no Maranhão, Tocantins, Piauí e Bahia.',
    badgeColor: 'bg-emerald-600 text-white',
    defaultLimingMethod: 'v_percent',
    supportedLimingMethods: ['v_percent', 'al_neutralization'],
    targetVByCrop: { soja: 65, milho: 65, algodao: 70, feijao: 70 },
    textureClasses: {
      sandy: { maxClay: 15, label: 'Arenosa (<15% argila)' },
      medium: { minClay: 15, maxClay: 35, label: 'Média (15 a 35% argila)' },
      clayey: { minClay: 35, maxClay: 60, label: 'Argilosa (35 a 60% argila)' },
      veryClayey: { minClay: 60, label: 'Muito Argilosa (>60% argila)' },
    },
    phosphorusMethod: 'Mehlich-1',
    pCriticalLevels: {
      sandy: { low: 14, medium: 28, good: 42, high: 58 },
      medium: { low: 10, medium: 20, good: 30, high: 45 },
      clayey: { low: 7, medium: 14, good: 22, high: 32 },
      veryClayey: { low: 5, medium: 10, good: 18, high: 25 },
    },
    kCriticalLevels: { low: 0.15, medium: 0.25, good: 0.40, high: 0.60 },
    gypsumMethod: 'clay_multiplier',
    gypsumFactor: 50,
    notes: [
      'Otimizado para o manejo de solos arenosos do Matopiba com alta suscetibilidade à lixiviação de Potássio e Enxofre.',
    ],
    officialReference: 'EMBRAPA MEIO-NORTE. Recomendações de Adubação para a Região do Matopiba. Teresina: Embrapa, 2020.',
  },
  {
    id: 'boletim-pastagens-embrapa',
    code: 'Embrapa Pastagens',
    name: 'Manual de Adubação e Manejo de Pastagens (Embrapa)',
    institution: 'Embrapa Gado de Corte / Embrapa Pecuária Sul',
    region: 'Nacional (Pecuária Intensiva)',
    coveredStates: ['MS', 'MT', 'GO', 'MG', 'PA', 'RS', 'RO', 'SP', 'BA'],
    edition: 'Recomendações Técnicas para Adubação e Manejo de Pastagens',
    description: 'Manual especializado para estabelecimento, recuperação e adubação de manutenção de Brachiaria, Panicums e pastagens consorciadas.',
    badgeColor: 'bg-lime-600 text-white',
    defaultLimingMethod: 'v_percent',
    supportedLimingMethods: ['v_percent', 'al_neutralization'],
    targetVByCrop: { pastagem: 50, milho: 65, soja: 60 },
    textureClasses: {
      sandy: { maxClay: 15, label: 'Arenosa (<15% argila)' },
      medium: { minClay: 15, maxClay: 35, label: 'Média (15 a 35% argila)' },
      clayey: { minClay: 35, maxClay: 60, label: 'Argilosa (35 a 60% argila)' },
      veryClayey: { minClay: 60, label: 'Muito Argilosa (>60% argila)' },
    },
    phosphorusMethod: 'Mehlich-1',
    pCriticalLevels: {
      sandy: { low: 8, medium: 15, good: 25, high: 35 },
      medium: { low: 6, medium: 12, good: 20, high: 30 },
      clayey: { low: 4, medium: 8, good: 15, high: 22 },
      veryClayey: { low: 3, medium: 6, good: 12, high: 18 },
    },
    kCriticalLevels: { low: 0.12, medium: 0.20, good: 0.35, high: 0.50 },
    gypsumMethod: 'clay_multiplier',
    gypsumFactor: 40,
    notes: [
      'Foco na elevação da Saturação por Bases para V = 50% em gramíneas forrageiras tropicais.',
      'Adubação nitrogenada estritamente calibrada por taxa de lotação (UA/ha).',
    ],
    officialReference: 'EMBRAPA GADO DE CORTE. Adubação de Pastagens: estabelecimento e recuperação. Campo Grande: Embrapa, 2019.',
  },
];

export const DEFAULT_BULLETIN_REFERENCE_PARAMS = {
  pRemanescenteCritical: 25,
  pResinaCriticalLevel: 15,
  pMehlich3CriticalLevel: 14,
  calciumCriticalLevel: 2.0,
  magnesiumCriticalLevel: 0.8,
  potassiumCriticalLevel: 0.22,
  sulfurCriticalLevel: 10,
  nitrogenMineralizationFactor: 0.5,
  boronCriticalLevel: 0.35,
  zincCriticalLevel: 1.2,
  copperCriticalLevel: 0.8,
  manganeseCriticalLevel: 4.0,
  ironCriticalLevel: 12.0,
  molybdenumCriticalLevel: 0.1,
  siliconCriticalLevel: 10.0,
  tolerableAlSaturation: 15,
  idealCaPercentageRange: { min: 50, max: 70 },
  idealMgPercentageRange: { min: 10, max: 20 },
  idealKPercentageRange: { min: 2, max: 5 },
  idealCaMgRatioRange: { min: 3.0, max: 5.0 },
  idealCaKRatioRange: { min: 10.0, max: 25.0 },
  idealMgKRatioRange: { min: 2.5, max: 6.0 },
  idealCaMgKRatioRange: { min: 12.0, max: 30.0 },
  bioasArylCriticalLevel: 50,
  bioasBetaGliCriticalLevel: 140,
  bioasFosfAcCriticalLevel: 210,
  bioasCbmCriticalLevel: 300,
  bioasRbsCriticalLevel: 18.0,
};

// Helper to find bulletin by ID or state
export function getBulletinById(id: string): RegionalBulletin {
  const b = REGIONAL_BULLETINS.find(x => x.id === id) || REGIONAL_BULLETINS[0];
  return { ...DEFAULT_BULLETIN_REFERENCE_PARAMS, ...b };
}

export function getBulletinByState(stateCode: string): RegionalBulletin {
  const upper = stateCode.trim().toUpperCase();
  const matched = REGIONAL_BULLETINS.find(b => b.coveredStates.includes(upper));
  const b = matched || REGIONAL_BULLETINS[0];
  return { ...DEFAULT_BULLETIN_REFERENCE_PARAMS, ...b };
}

// Calculate regional diagnostic interpretation
export function evaluateNutrientStatus(
  value: number,
  levels: { low: number; medium: number; good: number; high: number }
): { status: 'Muito Baixo' | 'Baixo' | 'Médio' | 'Bom / Adequado' | 'Alto' | 'Muito Alto'; color: string; badgeBg: string } {
  if (value < levels.low * 0.6) {
    return { status: 'Muito Baixo', color: 'text-rose-600 dark:text-rose-400', badgeBg: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300' };
  } else if (value < levels.low) {
    return { status: 'Baixo', color: 'text-amber-600 dark:text-amber-400', badgeBg: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' };
  } else if (value < levels.medium) {
    return { status: 'Médio', color: 'text-yellow-600 dark:text-yellow-400', badgeBg: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300' };
  } else if (value <= levels.good) {
    return { status: 'Bom / Adequado', color: 'text-emerald-600 dark:text-emerald-400', badgeBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' };
  } else if (value <= levels.high) {
    return { status: 'Alto', color: 'text-teal-600 dark:text-teal-400', badgeBg: 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300' };
  } else {
    return { status: 'Muito Alto', color: 'text-blue-600 dark:text-blue-400', badgeBg: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300' };
  }
}
