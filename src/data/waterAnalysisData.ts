import {
  CollectionPoint,
  CropSalinityTolerance,
  WaterAnalysisRecord,
  WaterPhysicalParams,
  WaterChemicalParams,
  WaterHeavyMetals,
  WaterBiologicalParams,
  WaterCalculatedIndices,
  WaterCorrectionPlan,
} from '../types/waterAnalysis';

import { FULL_CROP_SALINITY_DATABASE } from './cropSalinityData';
export { FULL_CROP_SALINITY_DATABASE };
export const CROP_SALINITY_DATABASE: CropSalinityTolerance[] = FULL_CROP_SALINITY_DATABASE;

export const COLLECTION_POINTS_DATABASE: CollectionPoint[] = [];

// Calculation Functions
export function calculateWaterIndices(
  chem: WaterChemicalParams,
  phys: WaterPhysicalParams,
  bio: WaterBiologicalParams
): WaterCalculatedIndices {
  // Convert mg/L to meq/L for ions
  // Ca: PM 40.08, valencia 2 => eq = 20.04
  const caMeq = chem.calciumCaMgL / 20.04;
  // Mg: PM 24.31, valencia 2 => eq = 12.15
  const mgMeq = chem.magnesiumMgL / 12.15;
  // Na: PM 23.00, valencia 1 => eq = 23.00
  const naMeq = chem.sodiumNaMgL / 23.0;
  // HCO3: PM 61.01, valencia 1 => eq = 61.01
  const hco3Meq = chem.bicarbonatesHco3MgL / 61.01;
  // CO3: PM 60.01, valencia 2 => eq = 30.00
  const co3Meq = chem.carbonatesCo3MgL / 30.0;

  // 1. SAR (Relação de Adsorção de Sódio)
  const denom = Math.sqrt((caMeq + mgMeq) / 2);
  const sar = denom > 0 ? naMeq / denom : 0;

  // 2. RSC (Carbonato Residual de Sódio em meq/L)
  const rscMeqL = (co3Meq + hco3Meq) - (caMeq + mgMeq);

  // 3. Percentual de Sódio (% Na)
  const totalCations = naMeq + caMeq + mgMeq;
  const sodiumPercentage = totalCations > 0 ? (naMeq / totalCations) * 100 : 0;

  // 4. Salinity & Sodicity Class (Riverside USSL)
  const ec = phys.electricalConductivityMicroS; // µS/cm
  let salinityClass: 'C1' | 'C2' | 'C3' | 'C4' = 'C1';
  if (ec <= 250) salinityClass = 'C1';
  else if (ec <= 750) salinityClass = 'C2';
  else if (ec <= 2250) salinityClass = 'C3';
  else salinityClass = 'C4';

  let sodicityClass: 'S1' | 'S2' | 'S3' | 'S4' = 'S1';
  if (sar <= 10) sodicityClass = 'S1';
  else if (sar <= 18) sodicityClass = 'S2';
  else if (sar <= 26) sodicityClass = 'S3';
  else sodicityClass = 'S4';

  // 5. Infiltration Risk (FAO 29 relationship between EC and SAR)
  let infiltrationRisk: 'sem_restricao' | 'restricao_moderada' | 'restricao_severa' = 'sem_restricao';
  const ecDsM = ec / 1000;
  if (sar < 3) {
    if (ecDsM > 0.7) infiltrationRisk = 'sem_restricao';
    else if (ecDsM >= 0.2) infiltrationRisk = 'restricao_moderada';
    else infiltrationRisk = 'restricao_severa';
  } else if (sar < 6) {
    if (ecDsM > 1.2) infiltrationRisk = 'sem_restricao';
    else if (ecDsM >= 0.3) infiltrationRisk = 'restricao_moderada';
    else infiltrationRisk = 'restricao_severa';
  } else {
    if (ecDsM > 1.9) infiltrationRisk = 'sem_restricao';
    else if (ecDsM >= 0.5) infiltrationRisk = 'restricao_moderada';
    else infiltrationRisk = 'restricao_severa';
  }

  // 6. Langelier Saturation Index (ISL)
  // Simplified ISL = pH - pHs, where pHs ≈ (9.3 + A + B) - (C + D)
  const tds = phys.totalDissolvedSolidsMgL || ec * 0.64;
  const A = (Math.log10(tds) - 1) / 10;
  const B = -13.12 * Math.log10(phys.waterTempCelsius + 273) + 34.55;
  const C = Math.log10(Math.max(1, chem.totalHardnessMgCaCO3)) - 0.4;
  const D = Math.log10(Math.max(1, chem.totalAlkalinityMgCaCO3));
  const pHs = 9.3 + A + B - (C + D);
  const langelierIndex = Math.round((chem.ph - pHs) * 100) / 100;

  let langelierInterpretation: 'corrosiva' | 'balanceada' | 'incrustante' = 'balanceada';
  if (langelierIndex < -0.5) langelierInterpretation = 'corrosiva';
  else if (langelierIndex > 0.5) langelierInterpretation = 'incrustante';

  // 7. Emitter Clogging Risk (Chemical + Physical + Biological)
  let emitterRisk: 'baixo' | 'moderado' | 'alto' | 'severo' = 'baixo';
  if (chem.ironFeMgL > 1.5 || chem.bicarbonatesHco3MgL > 200 || phys.turbidityNtu > 30 || bio.algaeDetected) {
    emitterRisk = 'severo';
  } else if (chem.ironFeMgL > 0.5 || chem.bicarbonatesHco3MgL > 120 || phys.turbidityNtu > 10) {
    emitterRisk = 'alto';
  } else if (chem.ironFeMgL > 0.2 || chem.bicarbonatesHco3MgL > 80 || phys.turbidityNtu > 5) {
    emitterRisk = 'moderado';
  }

  // 8. IGA (Índice Geral da Água - 0 a 100)
  // Physical (20%), Chemical (30%), Biological (20%), Purpose Adequacy (20%), Temporal (10%)
  let scorePhys = 20;
  if (phys.turbidityNtu > 15) scorePhys -= 6;
  if (phys.electricalConductivityMicroS > 1500) scorePhys -= 8;
  else if (phys.electricalConductivityMicroS > 750) scorePhys -= 4;

  let scoreChem = 30;
  if (chem.ph < 6.0 || chem.ph > 8.5) scoreChem -= 6;
  if (sar > 6) scoreChem -= 6;
  if (chem.ironFeMgL > 0.5) scoreChem -= 5;
  if (chem.bicarbonatesHco3MgL > 150) scoreChem -= 5;
  if (chem.nitrateNo3MgL > 45) scoreChem -= 5;

  let scoreBio = 20;
  if (bio.escherichiaColiNmp100ml > 0) scoreBio -= 12;
  if (bio.totalColiformsNmp100ml > 0) scoreBio -= 4;
  if (bio.algaeDetected) scoreBio -= 4;

  const scorePurpose = 18;
  const scoreTemporal = 9;

  const totalIga = Math.max(0, Math.min(100, Math.round(scorePhys + scoreChem + scoreBio + scorePurpose + scoreTemporal)));

  let igaRange: 'excelente' | 'muito_boa' | 'boa' | 'regular' | 'restrita' | 'inadequada' = 'boa';
  if (totalIga >= 95) igaRange = 'excelente';
  else if (totalIga >= 85) igaRange = 'muito_boa';
  else if (totalIga >= 70) igaRange = 'boa';
  else if (totalIga >= 50) igaRange = 'regular';
  else if (totalIga >= 30) igaRange = 'restrita';
  else igaRange = 'inadequada';

  return {
    sar: Math.round(sar * 100) / 100,
    rscMeqL: Math.round(rscMeqL * 100) / 100,
    sodiumPercentage: Math.round(sodiumPercentage * 10) / 10,
    salinityClass,
    sodicityClass,
    infiltrationRisk,
    langelierIndex,
    langelierInterpretation,
    emitterCloggingRisk: emitterRisk,
    igaScore: totalIga,
    igaClassification: igaRange,
  };
}

export function generateWaterCorrectionPlan(
  chem: WaterChemicalParams,
  phys: WaterPhysicalParams,
  bio: WaterBiologicalParams,
  calc: WaterCalculatedIndices
): WaterCorrectionPlan {
  const problems: string[] = [];
  const impacts: string[] = [];
  const treatments: { technology: string; description: string; dosageOrSpec?: string }[] = [];
  const management: string[] = [];

  // Evaluate Bicarbonates & High pH
  if (chem.bicarbonatesHco3MgL > 100 || chem.ph > 7.5) {
    problems.push(`Alcalinidade e Bicarbonatos elevados (${chem.bicarbonatesHco3MgL} mg/L HCO₃⁻; pH ${chem.ph})`);
    impacts.push('Precipitação de carbonato de cálcio nos gotejadores, elevação do pH da calda de pulverização e redução da eficiência de defensivos.');
    const acidMl = Math.round((chem.bicarbonatesHco3MgL - 40) * 0.85);
    treatments.push({
      technology: 'Acidificação Contínua da Água',
      description: 'Injeção automatizada de Ácido Fosfórico 85% ou Ácido Nítrico para neutralização dos bicarbonatos até atingir pH 5.8-6.2.',
      dosageOrSpec: `${acidMl} mL de H₃PO₄ 85% por m³ de água`,
    });
    management.push('Monitorar o pH no final da linha lateral de irrigação semanalmente.');
  }

  // Evaluate Iron & Manganese
  if (chem.ironFeMgL > 0.3) {
    problems.push(`Teor de Ferro dissolvido acima do limite crítico (${chem.ironFeMgL} mg/L Fe)`);
    impacts.push('Oxidação do ferro solúvel em hidróxido férrico insolúvel (lodo avermelhado) com proliferação de ferro-bactérias e entupimento de filtros.');
    treatments.push({
      technology: 'Aeração Forçada + Decantação + Filtro de Areia',
      description: 'Promover a oxigenação da água na entrada do reservatório para precipitar o Fe²⁺ em Fe³⁺, seguido por filtração em leito de areia/quartzo.',
      dosageOrSpec: 'Retenção hidráulica mínima de 2 horas no tanque de decantação',
    });
    management.push('Realizar retrolavagem dos filtros de areia a cada 4 horas de operação contínua.');
  }

  // Evaluate Microbiological (Coliforms / E. coli)
  if (bio.escherichiaColiNmp100ml > 0 || bio.totalColiformsNmp100ml > 0) {
    problems.push(`Presença de Contaminação Microbiológica (${bio.escherichiaColiNmp100ml} NMP/100mL E. coli)`);
    impacts.push('Risco sanitário gravíssimo para consumo humano, contaminação de hortaliças folhosas e transmissão de patógenos entéricos.');
    treatments.push({
      technology: 'Cloração de Choque e Residual',
      description: 'Dosagem de Hipoclorito de Sódio 10-12% para manter cloro residual livre entre 0.5 e 2.0 mg/L com tempo de contato de 30 min.',
      dosageOrSpec: '2 a 5 mg/L de Cloro Ativo na entrada do reservatório',
    });
    management.push('Interromper consumo humano imediato sem antes passar por barreira de cloração e desinfecção.');
  }

  // Evaluate Turbidity & Suspended Solids
  if (phys.turbidityNtu > 15) {
    problems.push(`Turbidez elevada (${phys.turbidityNtu} NTU) com alta carga de sólidos em suspensão`);
    impacts.push('Abrasão de rotores de bombas e entupimento físico de bicos e microtubos.');
    treatments.push({
      technology: 'Bateria de Filtros de Disco (120 a 130 mesh) + Decantação',
      description: 'Instalação de hidrociclone na captação de areia e filtros de disco auto-limpantes.',
      dosageOrSpec: 'Filtragem mecânica de 120 mesh (130 micras)',
    });
  }

  // Evaluate Salinity and Infiltration
  if (calc.salinityClass === 'C3' || calc.salinityClass === 'C4' || calc.sar > 6) {
    problems.push(`Salinidade ou Sodicidade Elevada (Classe ${calc.salinityClass}-${calc.sodicityClass}; RAS: ${calc.sar})`);
    impacts.push('Risco de salinização progressiva do solo, estresse osmótico nas raízes e dispersão de argilas na superfície.');
    management.push('Aplicar fração de lixiviação de sais de 15% a 20% sobre a lâmina de irrigação líquida.');
    management.push('Realizar gessagem no solo para deslocar o sódio trocável pelo cálcio solúvel.');
  }

  if (problems.length === 0) {
    problems.push('Nenhuma desconformidade química, física ou biológica identificada.');
    impacts.push('Água com excelente estabilidade e alta segurança para todas as finalidades agronômicas e sanitárias.');
    treatments.push({
      technology: 'Filtração Preventiva Simples',
      description: 'Manter filtro de tela ou disco padrão (120 mesh) para retenção de eventuais impurezas pontuais.',
    });
    management.push('Manter monitoramento semestral de rotina.');
  }

  let riskLevel: 'baixo' | 'moderado' | 'alto' | 'critico' = 'baixo';
  if (bio.escherichiaColiNmp100ml > 0 || chem.ironFeMgL > 1.5 || calc.sar > 9) {
    riskLevel = 'critico';
  } else if (chem.ironFeMgL > 0.5 || chem.bicarbonatesHco3MgL > 180 || phys.turbidityNtu > 20) {
    riskLevel = 'alto';
  } else if (chem.bicarbonatesHco3MgL > 100 || phys.turbidityNtu > 5) {
    riskLevel = 'moderado';
  }

  return {
    diagnosedProblems: problems,
    riskLevel,
    expectedImpacts: impacts,
    treatmentRecommendations: treatments,
    managementRecommendations: management,
    monitoringFrequencyDays: riskLevel === 'critico' ? 15 : riskLevel === 'alto' ? 30 : 90,
    simulatedAfterTreatment: {
      expectedPh: 6.0,
      expectedCe: Math.round(phys.electricalConductivityMicroS * 0.95),
      expectedTurbidity: Math.min(2.0, phys.turbidityNtu * 0.1),
      expectedBicarbonates: 35.0,
      expectedColiforms: 0,
      expectedEmitterRisk: 'baixo',
      expectedIgaScore: Math.min(98, calc.igaScore + 28),
    },
  };
}

// Initial Sample Analyses
const sample1Phys: WaterPhysicalParams = {
  waterTempCelsius: 23.5,
  colorPtCo: 5,
  turbidityNtu: 2.1,
  electricalConductivityMicroS: 320,
  salinityPpt: 0.16,
  totalDissolvedSolidsMgL: 205,
  totalSuspendedSolidsMgL: 4,
  odor: 'inodoro',
  taste: 'insipido',
};

const sample1Chem: WaterChemicalParams = {
  ph: 6.8,
  totalAlkalinityMgCaCO3: 65,
  totalHardnessMgCaCO3: 75,
  carbonatesCo3MgL: 0,
  bicarbonatesHco3MgL: 78,
  chloridesClMgL: 14.5,
  sulfatesSo4MgL: 12.0,
  nitrateNo3MgL: 8.5,
  nitriteNo2MgL: 0.01,
  ammoniumNh4MgL: 0.05,
  totalNitrogenMgL: 2.1,
  phosphorusPMgL: 0.08,
  potassiumKMgL: 3.2,
  calciumCaMgL: 18.5,
  magnesiumMgL: 7.0,
  sodiumNaMgL: 11.2,
  ironFeMgL: 0.08,
  manganeseMnMgL: 0.02,
  zincZnMgL: 0.05,
  copperCuMgL: 0.01,
  aluminumAlMgL: 0.02,
  boronBMgL: 0.15,
  residualChlorineMgL: 0.0,
  fluorideFMgL: 0.4,
  dissolvedOxygenMgL: 6.8,
  bod5MgL: 1.2,
  codMgL: 4.5,
};

const sample1Heavy: WaterHeavyMetals = {
  arsenicAsMgL: 0.001,
  cadmiumCdMgL: 0.0005,
  leadPbMgL: 0.002,
  totalChromiumCrMgL: 0.003,
  mercuryHgMgL: 0.0001,
  nickelNiMgL: 0.002,
  seleniumSeMgL: 0.001,
};

const sample1Bio: WaterBiologicalParams = {
  totalColiformsNmp100ml: 0,
  escherichiaColiNmp100ml: 0,
  enterococciNmp100ml: 0,
  salmonellaPresent: false,
  cyanobacteriaCellsMl: 0,
  algaeDetected: false,
};

const sample1Calc = calculateWaterIndices(sample1Chem, sample1Phys, sample1Bio);
const sample1Plan = generateWaterCorrectionPlan(sample1Chem, sample1Phys, sample1Bio, sample1Calc);

// Sample 2: Hard water with high Bicarbonate & Iron
const sample2Phys: WaterPhysicalParams = {
  waterTempCelsius: 24.0,
  colorPtCo: 25,
  turbidityNtu: 18.5,
  electricalConductivityMicroS: 820,
  salinityPpt: 0.45,
  totalDissolvedSolidsMgL: 525,
  totalSuspendedSolidsMgL: 22,
  odor: 'caracteristico',
  taste: 'metalico',
};

const sample2Chem: WaterChemicalParams = {
  ph: 7.9,
  totalAlkalinityMgCaCO3: 240,
  totalHardnessMgCaCO3: 280,
  carbonatesCo3MgL: 8.0,
  bicarbonatesHco3MgL: 285,
  chloridesClMgL: 48.0,
  sulfatesSo4MgL: 35.0,
  nitrateNo3MgL: 18.0,
  nitriteNo2MgL: 0.05,
  ammoniumNh4MgL: 0.15,
  totalNitrogenMgL: 4.8,
  phosphorusPMgL: 0.12,
  potassiumKMgL: 6.5,
  calciumCaMgL: 68.0,
  magnesiumMgL: 26.5,
  sodiumNaMgL: 54.0,
  ironFeMgL: 1.85,
  manganeseMnMgL: 0.45,
  zincZnMgL: 0.18,
  copperCuMgL: 0.04,
  aluminumAlMgL: 0.12,
  boronBMgL: 0.65,
  residualChlorineMgL: 0.0,
  fluorideFMgL: 0.8,
  dissolvedOxygenMgL: 4.5,
  bod5MgL: 3.5,
  codMgL: 12.0,
};

const sample2Bio: WaterBiologicalParams = {
  totalColiformsNmp100ml: 45,
  escherichiaColiNmp100ml: 12,
  enterococciNmp100ml: 4,
  salmonellaPresent: false,
  cyanobacteriaCellsMl: 120,
  algaeDetected: true,
};

const sample2Calc = calculateWaterIndices(sample2Chem, sample2Phys, sample2Bio);
const sample2Plan = generateWaterCorrectionPlan(sample2Chem, sample2Phys, sample2Bio, sample2Calc);

export const WATER_ANALYSIS_DATABASE: WaterAnalysisRecord[] = [];

export const DEFAULT_BLANK_ANALYSIS: WaterAnalysisRecord = {
  id: 'blank-template',
  sampleCode: 'NENHUMA-AMOSTRA',
  collectionDate: new Date().toISOString().split('T')[0],
  collectionTime: '12:00',
  responsibleTechnician: 'Sem Técnico',
  creaCrq: '',
  clientName: 'Nenhum',
  propertyName: 'Nenhuma propriedade',
  collectionPointId: 'blank-pt',
  purposes: ['irrigacao'],
  referenceStandard: 'FAO_29',
  physical: {
    waterTempCelsius: 25,
    colorPtCo: 0,
    turbidityNtu: 0,
    electricalConductivityMicroS: 0,
    salinityPpt: 0,
    totalDissolvedSolidsMgL: 0,
    totalSuspendedSolidsMgL: 0,
    odor: 'inodoro',
    taste: 'insipido',
  },
  chemical: {
    ph: 7.0,
    totalAlkalinityMgCaCO3: 0,
    totalHardnessMgCaCO3: 0,
    carbonatesCo3MgL: 0,
    bicarbonatesHco3MgL: 0,
    chloridesClMgL: 0,
    sulfatesSo4MgL: 0,
    nitrateNo3MgL: 0,
    nitriteNo2MgL: 0,
    ammoniumNh4MgL: 0,
    totalNitrogenMgL: 0,
    phosphorusPMgL: 0,
    potassiumKMgL: 0,
    calciumCaMgL: 0,
    magnesiumMgL: 0,
    sodiumNaMgL: 0,
    ironFeMgL: 0,
    manganeseMnMgL: 0,
    zincZnMgL: 0,
    copperCuMgL: 0,
    aluminumAlMgL: 0,
    boronBMgL: 0,
    residualChlorineMgL: 0,
    fluorideFMgL: 0,
    dissolvedOxygenMgL: 0,
    bod5MgL: 0,
    codMgL: 0,
  },
  heavyMetals: {
    arsenicAsMgL: 0,
    cadmiumCdMgL: 0,
    leadPbMgL: 0,
    totalChromiumCrMgL: 0,
    mercuryHgMgL: 0,
    nickelNiMgL: 0,
    seleniumSeMgL: 0,
  },
  biological: {
    totalColiformsNmp100ml: 0,
    escherichiaColiNmp100ml: 0,
    enterococciNmp100ml: 0,
    salmonellaPresent: false,
    cyanobacteriaCellsMl: 0,
    algaeDetected: false,
  },
  calculated: {
    sar: 0,
    rscMeqL: 0,
    sodiumPercentage: 0,
    salinityClass: 'C1',
    sodicityClass: 'S1',
    infiltrationRisk: 'sem_restricao',
    langelierIndex: 0,
    langelierInterpretation: 'balanceada',
    emitterCloggingRisk: 'baixo',
    igaScore: 0,
    igaClassification: 'excelente',
  },
  correctionPlan: {
    diagnosedProblems: [],
    riskLevel: 'baixo',
    expectedImpacts: [],
    treatmentRecommendations: [],
    managementRecommendations: [],
    monitoringFrequencyDays: 30,
    simulatedAfterTreatment: {
      expectedPh: 7.0,
      expectedCe: 0.1,
      expectedTurbidity: 0,
      expectedBicarbonates: 0,
      expectedColiforms: 0,
      expectedEmitterRisk: 'baixo',
      expectedIgaScore: 100,
    },
  },
  technicalNotes: '',
  status: 'em_analise',
};

export const DEFAULT_BLANK_POINT: CollectionPoint = {
  id: 'blank-pt',
  name: 'Nenhum Ponto Cadastrado',
  code: 'PT-000',
  type: 'outro',
  propertyName: 'Nenhuma',
  latitude: 0,
  longitude: 0,
  altitudeMeters: 0,
  notes: 'Nenhum ponto de coleta cadastrado no sistema.',
};
