import {
  CropBrixThresholds,
  BrixReading,
  PlotBrixSummary,
  PhenologicalStage,
  BrixStatus,
  BrixStatisticalSummary,
} from '../types/brix';

export const CROP_BRIX_DATABASE: CropBrixThresholds[] = [
  {
    cropName: 'Soja',
    category: 'graos',
    minBrix: 4.0,
    idealBrixMin: 8.0,
    idealBrixMax: 14.0,
    maxBrix: 18.0,
    pestsResistanceThresholdBrix: 10.0,
    stageThresholds: {
      emergencia: { min: 3.5, ideal: 6.0, max: 8.0 },
      vegetativo: { min: 5.0, ideal: 9.0, max: 12.0 },
      florescimento: { min: 6.5, ideal: 11.0, max: 15.0 },
      frutificacao_enchimento: { min: 8.0, ideal: 13.0, max: 17.0 },
      maturacao_colheita: { min: 7.0, ideal: 10.0, max: 14.0 },
    },
    recommendations: 'Brix > 10° na fase R1-R5 proporciona resistência natural a lagartas e percevejos, além de máximo enchimento de grãos.',
  },
  {
    cropName: 'Milho',
    category: 'graos',
    minBrix: 5.0,
    idealBrixMin: 9.0,
    idealBrixMax: 16.0,
    maxBrix: 20.0,
    pestsResistanceThresholdBrix: 12.0,
    stageThresholds: {
      emergencia: { min: 4.0, ideal: 7.0, max: 9.0 },
      vegetativo: { min: 6.0, ideal: 10.0, max: 14.0 },
      florescimento: { min: 8.0, ideal: 13.0, max: 17.0 },
      frutificacao_enchimento: { min: 9.0, ideal: 14.0, max: 19.0 },
      maturacao_colheita: { min: 8.0, ideal: 11.0, max: 15.0 },
    },
    recommendations: 'Brix acima de 12° reduz severamente danos por Spodoptera frugiperda e cigarrinha do milho (Dalbulus maidis).',
  },
  {
    cropName: 'Algodão',
    category: 'industriais',
    minBrix: 5.0,
    idealBrixMin: 10.0,
    idealBrixMax: 16.0,
    maxBrix: 20.0,
    pestsResistanceThresholdBrix: 12.0,
    stageThresholds: {
      emergencia: { min: 4.5, ideal: 7.5, max: 9.5 },
      vegetativo: { min: 6.5, ideal: 11.0, max: 14.5 },
      florescimento: { min: 8.5, ideal: 13.5, max: 17.0 },
      frutificacao_enchimento: { min: 9.5, ideal: 14.5, max: 19.0 },
      maturacao_colheita: { min: 8.0, ideal: 12.0, max: 16.0 },
    },
    recommendations: 'Brix elevado na emissão de botões florais previne abortamento e reduz ataque de bicudo e mosca-branca.',
  },
  {
    cropName: 'Café Arábica',
    category: 'industriais',
    minBrix: 6.0,
    idealBrixMin: 11.0,
    idealBrixMax: 18.0,
    maxBrix: 22.0,
    pestsResistanceThresholdBrix: 12.5,
    stageThresholds: {
      emergencia: { min: 5.0, ideal: 8.0, max: 10.0 },
      vegetativo: { min: 7.0, ideal: 12.0, max: 16.0 },
      florescimento: { min: 9.0, ideal: 14.0, max: 18.0 },
      frutificacao_enchimento: { min: 10.0, ideal: 15.5, max: 20.0 },
      maturacao_colheita: { min: 11.0, ideal: 16.0, max: 21.0 },
    },
    recommendations: 'Brix foliar superior a 12° correlaciona-se com maior teor de sólidos nos frutos cereja e bebida de alta qualidade.',
  },
  {
    cropName: 'Cana-de-Açúcar',
    category: 'industriais',
    minBrix: 8.0,
    idealBrixMin: 14.0,
    idealBrixMax: 22.0,
    maxBrix: 26.0,
    pestsResistanceThresholdBrix: 14.0,
    stageThresholds: {
      emergencia: { min: 5.0, ideal: 8.0, max: 11.0 },
      vegetativo: { min: 8.0, ideal: 13.0, max: 17.0 },
      florescimento: { min: 10.0, ideal: 15.0, max: 19.0 },
      frutificacao_enchimento: { min: 12.0, ideal: 18.0, max: 23.0 },
      maturacao_colheita: { min: 15.0, ideal: 20.0, max: 25.0 },
    },
    recommendations: 'Acompanhamento do gradiente entre terço superior e inferior do colmo para estimativa precisa do ponto de corte.',
  },
  {
    cropName: 'Feijão Comum',
    category: 'graos',
    minBrix: 4.0,
    idealBrixMin: 8.0,
    idealBrixMax: 13.0,
    maxBrix: 16.0,
    pestsResistanceThresholdBrix: 10.0,
    stageThresholds: {
      emergencia: { min: 3.5, ideal: 6.0, max: 8.0 },
      vegetativo: { min: 5.5, ideal: 9.0, max: 12.0 },
      florescimento: { min: 7.0, ideal: 11.0, max: 14.0 },
      frutificacao_enchimento: { min: 8.0, ideal: 12.0, max: 15.0 },
      maturacao_colheita: { min: 7.0, ideal: 9.5, max: 13.0 },
    },
    recommendations: 'Excelente indicador da atividade fotossintética durante a floração para evitar aborto de vagens.',
  },
  {
    cropName: 'Trigo',
    category: 'graos',
    minBrix: 4.5,
    idealBrixMin: 8.5,
    idealBrixMax: 14.0,
    maxBrix: 17.0,
    pestsResistanceThresholdBrix: 10.5,
    stageThresholds: {
      emergencia: { min: 3.5, ideal: 6.5, max: 8.5 },
      vegetativo: { min: 5.5, ideal: 9.5, max: 13.0 },
      florescimento: { min: 7.5, ideal: 12.0, max: 15.5 },
      frutificacao_enchimento: { min: 8.5, ideal: 13.0, max: 16.5 },
      maturacao_colheita: { min: 7.5, ideal: 10.5, max: 14.0 },
    },
    recommendations: 'Monitorar no afilhamento e emborrachamento; prediz acúmulo de amido e proteína no grão.',
  },
  {
    cropName: 'Arroz Irrigado',
    category: 'graos',
    minBrix: 4.0,
    idealBrixMin: 7.5,
    idealBrixMax: 13.0,
    maxBrix: 16.0,
    pestsResistanceThresholdBrix: 9.5,
    stageThresholds: {
      emergencia: { min: 3.0, ideal: 5.5, max: 7.5 },
      vegetativo: { min: 5.0, ideal: 8.5, max: 11.5 },
      florescimento: { min: 6.5, ideal: 10.5, max: 13.5 },
      frutificacao_enchimento: { min: 7.5, ideal: 12.0, max: 15.0 },
      maturacao_colheita: { min: 6.5, ideal: 9.0, max: 12.5 },
    },
    recommendations: 'Brix foliar reflete a eficiência de absorção de Nitrogênio e Potássio sob lâmina de água.',
  },
  {
    cropName: 'Citros (Laranja/Limão)',
    category: 'frutiferas',
    minBrix: 6.0,
    idealBrixMin: 10.0,
    idealBrixMax: 16.0,
    maxBrix: 20.0,
    pestsResistanceThresholdBrix: 12.0,
    stageThresholds: {
      emergencia: { min: 5.0, ideal: 7.5, max: 9.5 },
      vegetativo: { min: 7.0, ideal: 11.0, max: 15.0 },
      florescimento: { min: 8.5, ideal: 13.0, max: 17.0 },
      frutificacao_enchimento: { min: 9.5, ideal: 14.0, max: 18.5 },
      maturacao_colheita: { min: 10.0, ideal: 14.5, max: 19.0 },
    },
    recommendations: 'Plantas com Brix foliar > 12° apresentam menor atratividade para psilídeo (Diaphorina citri / Greening).',
  },
  {
    cropName: 'Uva de Mesa / Vinho',
    category: 'frutiferas',
    minBrix: 7.0,
    idealBrixMin: 12.0,
    idealBrixMax: 18.0,
    maxBrix: 24.0,
    pestsResistanceThresholdBrix: 13.0,
    stageThresholds: {
      emergencia: { min: 5.0, ideal: 8.0, max: 11.0 },
      vegetativo: { min: 7.5, ideal: 12.0, max: 16.0 },
      florescimento: { min: 9.0, ideal: 14.0, max: 18.0 },
      frutificacao_enchimento: { min: 11.0, ideal: 16.5, max: 21.0 },
      maturacao_colheita: { min: 13.0, ideal: 19.0, max: 24.0 },
    },
    recommendations: 'Fundamental no controle de desfolha e maturação fenólica dos cachos no período pré-colheita.',
  },
  {
    cropName: 'Tomateiro',
    category: 'hortalicas',
    minBrix: 4.5,
    idealBrixMin: 8.0,
    idealBrixMax: 14.0,
    maxBrix: 18.0,
    pestsResistanceThresholdBrix: 10.0,
    stageThresholds: {
      emergencia: { min: 3.5, ideal: 6.0, max: 8.5 },
      vegetativo: { min: 5.5, ideal: 9.0, max: 12.5 },
      florescimento: { min: 7.0, ideal: 11.5, max: 15.0 },
      frutificacao_enchimento: { min: 8.5, ideal: 13.0, max: 16.5 },
      maturacao_colheita: { min: 8.0, ideal: 12.0, max: 16.0 },
    },
    recommendations: 'Brix foliar elevado garante excelente translocação de cálcio e açúcares para os frutos.',
  },
  {
    cropName: 'Batata',
    category: 'hortalicas',
    minBrix: 4.0,
    idealBrixMin: 7.5,
    idealBrixMax: 13.0,
    maxBrix: 16.0,
    pestsResistanceThresholdBrix: 9.5,
    stageThresholds: {
      emergencia: { min: 3.5, ideal: 6.0, max: 8.0 },
      vegetativo: { min: 5.0, ideal: 8.5, max: 11.5 },
      florescimento: { min: 6.5, ideal: 10.5, max: 14.0 },
      frutificacao_enchimento: { min: 7.5, ideal: 12.0, max: 15.0 },
      maturacao_colheita: { min: 6.5, ideal: 9.5, max: 13.0 },
    },
    recommendations: 'Monitora a tuberização e resistência a requeima (Phytophthora infestans).',
  },
  {
    cropName: 'Cebola',
    category: 'hortalicas',
    minBrix: 5.0,
    idealBrixMin: 9.0,
    idealBrixMax: 15.0,
    maxBrix: 18.0,
    pestsResistanceThresholdBrix: 11.0,
    stageThresholds: {
      emergencia: { min: 4.0, ideal: 6.5, max: 9.0 },
      vegetativo: { min: 6.0, ideal: 9.5, max: 13.0 },
      florescimento: { min: 7.5, ideal: 12.0, max: 15.5 },
      frutificacao_enchimento: { min: 8.5, ideal: 13.5, max: 17.0 },
      maturacao_colheita: { min: 8.0, ideal: 11.5, max: 15.0 },
    },
    recommendations: 'Brix foliar alto confere maior espessura cerosa na cutícula e menor dano por tripes.',
  },
  {
    cropName: 'Alface',
    category: 'hortalicas',
    minBrix: 3.0,
    idealBrixMin: 5.5,
    idealBrixMax: 10.0,
    maxBrix: 13.0,
    pestsResistanceThresholdBrix: 7.5,
    stageThresholds: {
      emergencia: { min: 2.5, ideal: 4.5, max: 6.5 },
      vegetativo: { min: 4.0, ideal: 7.0, max: 10.0 },
      florescimento: { min: 5.0, ideal: 8.5, max: 11.5 },
      frutificacao_enchimento: { min: 5.0, ideal: 8.5, max: 11.5 },
      maturacao_colheita: { min: 4.5, ideal: 7.5, max: 10.5 },
    },
    recommendations: 'Em cultivo hidropônico e solo, Brix > 7° evita queima de bordos e prolonga pós-colheita.',
  },
  {
    cropName: 'Morango',
    category: 'frutiferas',
    minBrix: 5.0,
    idealBrixMin: 9.0,
    idealBrixMax: 15.0,
    maxBrix: 19.0,
    pestsResistanceThresholdBrix: 11.5,
    stageThresholds: {
      emergencia: { min: 4.0, ideal: 6.5, max: 9.0 },
      vegetativo: { min: 6.0, ideal: 10.0, max: 13.5 },
      florescimento: { min: 7.5, ideal: 12.0, max: 16.0 },
      frutificacao_enchimento: { min: 8.5, ideal: 13.5, max: 17.5 },
      maturacao_colheita: { min: 8.5, ideal: 13.0, max: 17.0 },
    },
    recommendations: 'Folhas com alto Brix geram frutos mais doces e reduzem severamente infestação de ácaro-rajado.',
  },
  {
    cropName: 'Banana',
    category: 'frutiferas',
    minBrix: 5.5,
    idealBrixMin: 9.5,
    idealBrixMax: 16.0,
    maxBrix: 20.0,
    pestsResistanceThresholdBrix: 12.0,
    stageThresholds: {
      emergencia: { min: 4.5, ideal: 7.0, max: 9.5 },
      vegetativo: { min: 6.5, ideal: 10.5, max: 14.5 },
      florescimento: { min: 8.0, ideal: 13.0, max: 17.0 },
      frutificacao_enchimento: { min: 9.0, ideal: 14.5, max: 18.5 },
      maturacao_colheita: { min: 8.5, ideal: 13.5, max: 17.5 },
    },
    recommendations: 'Brix foliar da folha vela e folha 3 monitora o vigor e tolerância a Sigatoka-negra.',
  },
  {
    cropName: 'Manga',
    category: 'frutiferas',
    minBrix: 6.0,
    idealBrixMin: 11.0,
    idealBrixMax: 18.0,
    maxBrix: 22.0,
    pestsResistanceThresholdBrix: 13.0,
    stageThresholds: {
      emergencia: { min: 5.0, ideal: 8.0, max: 10.5 },
      vegetativo: { min: 7.0, ideal: 12.0, max: 16.0 },
      florescimento: { min: 9.0, ideal: 14.5, max: 19.0 },
      frutificacao_enchimento: { min: 10.0, ideal: 16.0, max: 20.5 },
      maturacao_colheita: { min: 10.5, ideal: 16.5, max: 21.0 },
    },
    recommendations: 'Crucial na indução floral e maturação de ramos pré-pulverização de paclobutrazol.',
  },
  {
    cropName: 'Maracujá',
    category: 'frutiferas',
    minBrix: 5.5,
    idealBrixMin: 10.0,
    idealBrixMax: 16.0,
    maxBrix: 20.0,
    pestsResistanceThresholdBrix: 12.0,
    stageThresholds: {
      emergencia: { min: 4.5, ideal: 7.0, max: 9.5 },
      vegetativo: { min: 6.5, ideal: 11.0, max: 14.5 },
      florescimento: { min: 8.0, ideal: 13.0, max: 17.0 },
      frutificacao_enchimento: { min: 9.5, ideal: 14.5, max: 18.5 },
      maturacao_colheita: { min: 9.0, ideal: 14.0, max: 18.0 },
    },
    recommendations: 'Acompanhamento contínuo da seiva das gavinhas e folhas maduras durante pegamento de frutos.',
  },
  {
    cropName: 'Cacau',
    category: 'industriais',
    minBrix: 5.5,
    idealBrixMin: 9.5,
    idealBrixMax: 15.5,
    maxBrix: 19.0,
    pestsResistanceThresholdBrix: 11.5,
    stageThresholds: {
      emergencia: { min: 4.0, ideal: 7.0, max: 9.0 },
      vegetativo: { min: 6.0, ideal: 10.0, max: 14.0 },
      florescimento: { min: 7.5, ideal: 12.5, max: 16.5 },
      frutificacao_enchimento: { min: 8.5, ideal: 13.5, max: 17.5 },
      maturacao_colheita: { min: 8.5, ideal: 13.0, max: 17.0 },
    },
    recommendations: 'Brix foliar elevado correlaciona-se com maior tolerância a vassoura-de-bruxa e podridão-parda.',
  },
  {
    cropName: 'Eucalipto',
    category: 'silvicultura_pastagem',
    minBrix: 4.0,
    idealBrixMin: 7.0,
    idealBrixMax: 12.0,
    maxBrix: 15.0,
    pestsResistanceThresholdBrix: 9.0,
    stageThresholds: {
      emergencia: { min: 3.5, ideal: 5.5, max: 7.5 },
      vegetativo: { min: 5.0, ideal: 8.5, max: 12.0 },
      florescimento: { min: 6.0, ideal: 9.5, max: 13.0 },
      frutificacao_enchimento: { min: 6.0, ideal: 9.5, max: 13.0 },
      maturacao_colheita: { min: 5.5, ideal: 8.5, max: 12.0 },
    },
    recommendations: 'Diagnóstico precoce de estresse hídrico em plantios clonais jovens e viveiros.',
  },
  {
    cropName: 'Pastagens (Brachiaria/Panicum)',
    category: 'silvicultura_pastagem',
    minBrix: 4.0,
    idealBrixMin: 8.0,
    idealBrixMax: 14.0,
    maxBrix: 18.0,
    pestsResistanceThresholdBrix: 10.0,
    stageThresholds: {
      emergencia: { min: 3.0, ideal: 5.5, max: 7.5 },
      vegetativo: { min: 5.5, ideal: 9.5, max: 13.5 },
      florescimento: { min: 6.5, ideal: 10.5, max: 14.5 },
      frutificacao_enchimento: { min: 6.0, ideal: 9.5, max: 13.0 },
      maturacao_colheita: { min: 5.0, ideal: 8.0, max: 11.5 },
    },
    recommendations: 'Brix foliar superior a 10° confere maior palatabilidade, consumo voluntário e ganho de peso diário (GPD) do rebanho.',
  },
];

// Calculation Functions
export function calculateVPD(airTempC: number, leafTempC: number, rhPercent: number): number {
  // Tetens Formula for Saturated Vapor Pressure (kPa)
  const esLeaf = 0.61078 * Math.exp((17.27 * leafTempC) / (leafTempC + 237.3));
  const esAir = 0.61078 * Math.exp((17.27 * airTempC) / (airTempC + 237.3));
  const eaAir = esAir * (rhPercent / 100);
  const vpd = esLeaf - eaAir;
  return Math.max(0.1, Math.round(vpd * 100) / 100);
}

export function evaluateBrixReading(
  cropName: string,
  stage: PhenologicalStage,
  brixValue: number,
  vpdKpa: number
): { status: BrixStatus; healthScore: number; interpretation: string } {
  const crop = CROP_BRIX_DATABASE.find(c => c.cropName === cropName) || CROP_BRIX_DATABASE[0];
  const stageRange = crop.stageThresholds[stage];

  let status: BrixStatus = 'medio';
  let healthScore = 70;
  let interpretation = '';

  if (brixValue < stageRange.min) {
    status = 'muito_baixo';
    healthScore = Math.max(15, Math.round((brixValue / stageRange.min) * 45));
    interpretation = `°Brix muito abaixo do mínimo esperado (${stageRange.min}°Brix). Alerta crítico de fotossíntese deprimida, estresse hídrico agudo ou forte desequilíbrio nutricional (deficiência de K, B, Mg ou excesso de N nítrico livre). Alto risco de infestação por insetos sugadores.`;
  } else if (brixValue < stageRange.ideal) {
    status = 'baixo';
    healthScore = Math.round(45 + ((brixValue - stageRange.min) / (stageRange.ideal - stageRange.min)) * 25);
    interpretation = `°Brix abaixo da meta ideal (${stageRange.ideal}°Brix). Atividade fotossintética moderada; planta susceptível a estresses abióticos temporários. Sugere-se aplicação foliar de Potássio + Boro para estímulo da translocação de açúcares.`;
  } else if (brixValue <= stageRange.max) {
    status = 'alto';
    healthScore = Math.round(75 + ((brixValue - stageRange.ideal) / (stageRange.max - stageRange.ideal)) * 20);
    interpretation = `°Brix excelente (Faixa Ideal: ${stageRange.ideal}° - ${stageRange.max}°Brix). Planta com alta síntese de carboidratos, imunidade natural elevada (Trofobiose) e ótimo enchimento de órgãos produtivos.`;
  } else {
    status = 'muito_alto';
    healthScore = 98;
    interpretation = `°Brix excepcional (> ${stageRange.max}°Brix). Máxima eficiência fisiológica e fotossintética; tecidos vegetais túrgidos e ricos em compostos secundários de defesa.`;
  }

  // Adjust for VPD stress (Ideal VPD is 0.8 - 1.4 kPa)
  if (vpdKpa > 1.8) {
    healthScore = Math.max(10, healthScore - 10);
    interpretation += ` Atenção: VPD elevado (${vpdKpa} kPa) indica atmosfera muito seca, induzindo fechamento parcial dos estômatos e limitação de trocas gasosas.`;
  } else if (vpdKpa < 0.4) {
    healthScore = Math.max(10, healthScore - 5);
    interpretation += ` Atenção: VPD muito baixo (${vpdKpa} kPa) com atmosfera saturada, limitando a taxa transpiratória e transporte de cálcio via xilema.`;
  }

  return { status, healthScore, interpretation };
}

export function calculateBrixStatistics(readings: BrixReading[]): BrixStatisticalSummary {
  if (readings.length === 0) {
    return { mean: 0, median: 0, stdDev: 0, coefficientOfVariation: 0, min: 0, max: 0, amplitude: 0, totalSamples: 0 };
  }

  const values = readings.map(r => r.brixValue).sort((a, b) => a - b);
  const n = values.length;
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = Math.round((sum / n) * 100) / 100;

  const median = n % 2 === 0 ? Math.round(((values[n / 2 - 1] + values[n / 2]) / 2) * 100) / 100 : values[Math.floor(n / 2)];
  const min = values[0];
  const max = values[n - 1];
  const amplitude = Math.round((max - min) * 100) / 100;

  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.round(Math.sqrt(variance) * 100) / 100;
  const coefficientOfVariation = mean > 0 ? Math.round((stdDev / mean) * 1000) / 10 : 0;

  return { mean, median, stdDev, coefficientOfVariation, min, max, amplitude, totalSamples: n };
}

// Sample Plots and Database Readings
export const SAMPLE_PLOTS_DATABASE: PlotBrixSummary[] = [];

export const INITIAL_BRIX_READINGS: BrixReading[] = [];
