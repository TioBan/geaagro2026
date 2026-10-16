import {
  SoilSample,
  FieldPlot,
  CropNutritionalTarget,
  LimingRecommendation,
  GypsumRecommendation,
  FertilizerRecommendation,
  UnitTriadValue,
  LeafSample,
} from '../types/agronomy';
import { CROPS_CATALOG, STANDARD_COMMERCIAL_FERTILIZERS } from '../data/agronomicStandards';

/**
 * Converte qualquer valor em kg/ha para a tríade: kg/ha, g/planta e g/metro linear
 * @param kgPerHa Dose em kg/ha
 * @param rowSpacingM Espaçamento entre linhas (m)
 * @param plantSpacingM Espaçamento entre plantas (m)
 */
export function calculateUnitTriad(
  kgPerHa: number,
  rowSpacingM: number = 0.5,
  plantSpacingM: number = 0.1
): UnitTriadValue {
  const safeRow = rowSpacingM > 0 ? rowSpacingM : 0.5;
  const safePlant = plantSpacingM > 0 ? plantSpacingM : 0.1;

  // Metros lineares por hectare = 10.000 / espaçamento entre linhas
  const linearMetersPerHa = 10000 / safeRow;

  // População de plantas por hectare = 10.000 / (espaçamento entre linhas * espaçamento entre plantas)
  const plantsPerHa = 10000 / (safeRow * safePlant);

  // g/planta = (kg/ha * 1000) / plantas/ha
  const gPerPlant = plantsPerHa > 0 ? (kgPerHa * 1000) / plantsPerHa : 0;

  // g/metro linear = (kg/ha * 1000) / metros lineares/ha = (kg/ha * safeRow) / 10
  const gPerLinearMeter = linearMetersPerHa > 0 ? (kgPerHa * 1000) / linearMetersPerHa : 0;

  return {
    kgPerHa: Number(kgPerHa.toFixed(2)),
    gPerPlant: Number(gPerPlant.toFixed(2)),
    gPerLinearMeter: Number(gPerLinearMeter.toFixed(2)),
  };
}

/**
 * Calcula todos os índices derivados da análise de fertilidade do solo
 */
export function calculateSoilIndices(sample: Partial<SoilSample>): Partial<SoilSample> {
  const ca = sample.caCmolcDm3 || 0;
  const mg = sample.mgCmolcDm3 || 0;
  const k = sample.kCmolcDm3 || 0;
  const al = sample.alCmolcDm3 || 0;
  const hAl = sample.hAlCmolcDm3 || 0;
  const kMgDm3 = sample.kMgDm3 || (k > 0 ? Number((k * 391).toFixed(1)) : 0);

  const sb = Number((ca + mg + k).toFixed(2));
  const ctcEffective = Number((sb + al).toFixed(2));
  const ctcTotal = Number((sb + hAl).toFixed(2));
  
  const vPercent = ctcTotal > 0 ? Number(((sb / ctcTotal) * 100).toFixed(1)) : 0;
  const mPercent = ctcEffective > 0 ? Number(((al / ctcEffective) * 100).toFixed(1)) : 0;

  const caMgRatio = mg > 0 ? Number((ca / mg).toFixed(2)) : 0;
  const caKRatio = k > 0 ? Number((ca / k).toFixed(2)) : 0;
  const mgKRatio = k > 0 ? Number((mg / k).toFixed(2)) : 0;

  // BioAS (Embrapa Bioanálise de Solo)
  const hasBioAS = Boolean(
    sample.hasBioAS ||
    (sample.arylsulfataseMgPnpKgH && sample.arylsulfataseMgPnpKgH > 0) ||
    (sample.betaGlucosidaseMgPnpKgH && sample.betaGlucosidaseMgPnpKgH > 0)
  );

  // Cálculo do IQS Químico (Embrapa / Sousa et al.)
  const phVal = sample.phCaCl2 || 5.0;
  const phScore = phVal >= 5.2 && phVal <= 6.0 ? 1.0 : phVal >= 4.8 && phVal < 5.2 ? 0.75 : phVal >= 4.4 && phVal < 4.8 ? 0.5 : 0.25;
  const vScore = vPercent >= 60 ? 1.0 : vPercent >= 50 ? 0.8 : vPercent >= 40 ? 0.6 : 0.3;
  const mScore = mPercent <= 0.5 ? 1.0 : mPercent <= 10 ? 0.8 : mPercent <= 25 ? 0.5 : 0.2;
  const pVal = sample.pMehlich1MgDm3 || sample.pResinaMgDm3 || 10;
  const pScore = pVal >= 15 ? 1.0 : pVal >= 10 ? 0.8 : pVal >= 6 ? 0.55 : 0.3;
  const kScore = k >= 0.25 ? 1.0 : k >= 0.15 ? 0.8 : k >= 0.10 ? 0.55 : 0.3;
  const caScore = ca >= 2.5 ? 1.0 : ca >= 1.5 ? 0.8 : ca >= 1.0 ? 0.55 : 0.3;
  const mgScore = mg >= 0.8 ? 1.0 : mg >= 0.5 ? 0.8 : mg >= 0.3 ? 0.55 : 0.3;
  const moVal = sample.organicMatterGdm3 || 20;
  const moScore = moVal >= 30 ? 1.0 : moVal >= 20 ? 0.8 : moVal >= 15 ? 0.55 : 0.3;

  const iqsChemicalScore = sample.iqsChemicalScore ?? Number(((phScore + vScore + mScore + pScore + kScore + caScore + mgScore + moScore) / 8).toFixed(2));

  let iqsBioScore = sample.iqsBioScore;
  let bioasHealthClass = sample.bioasHealthClass;
  let bioasInterpretation = sample.bioasInterpretation;

  if (hasBioAS && (sample.arylsulfataseMgPnpKgH || sample.betaGlucosidaseMgPnpKgH)) {
    const aryl = sample.arylsulfataseMgPnpKgH || 0;
    const beta = sample.betaGlucosidaseMgPnpKgH || 0;
    const fosf = sample.acidPhosphataseMgPnpKgH || 0;
    const clay = sample.clayPercent || 35;

    // Critérios Embrapa Cerrados por teor de argila
    // Referência: Solos Argilosos (>35% argila) vs Textura Média (15-35%)
    const isHeavyClay = clay >= 35;
    const arylRef = isHeavyClay ? 350 : 200;
    const betaRef = isHeavyClay ? 170 : 100;
    const fosfRef = isHeavyClay ? 650 : 450;

    const arylRatio = Math.min(1.2, aryl / arylRef);
    const betaRatio = Math.min(1.2, beta / betaRef);
    const fosfRatio = fosf > 0 ? Math.min(1.2, fosf / fosfRef) : null;

    if (!iqsBioScore) {
      // IQS Bio ponderado (0 a 1.0)
      if (fosfRatio !== null) {
        iqsBioScore = Number(((arylRatio * 0.4 + betaRatio * 0.4 + fosfRatio * 0.2)).toFixed(2));
      } else {
        iqsBioScore = Number(((arylRatio * 0.5 + betaRatio * 0.5)).toFixed(2));
      }
      if (iqsBioScore > 1.0) iqsBioScore = 1.0;
    }

    if (!bioasHealthClass) {
      if (iqsBioScore >= 0.85) bioasHealthClass = 'Muito Alta';
      else if (iqsBioScore >= 0.70) bioasHealthClass = 'Alta';
      else if (iqsBioScore >= 0.50) bioasHealthClass = 'Média';
      else if (iqsBioScore >= 0.30) bioasHealthClass = 'Baixa';
      else bioasHealthClass = 'Muito Baixa';
    }

    if (!bioasInterpretation) {
      if (bioasHealthClass === 'Muito Alta' || bioasHealthClass === 'Alta') {
        bioasInterpretation = 'Excelente atividade biológica e ciclagem enzimática (C e S). Solo altamente resiliente com microbiota ativa.';
      } else if (bioasHealthClass === 'Média') {
        bioasInterpretation = 'Atividade enzimática moderada. Recomenda-se aumentar aporte de palhada, rotação com plantas de cobertura e bioinsumos.';
      } else {
        bioasInterpretation = 'Baixa atividade biológica do solo. Indicativo de estresse microbiano, baixa ciclagem de nutrientes e necessidade de manejo regenerativo/biológico.';
      }
    }
  }

  // IQS FertBio Integrado Embrapa (Química + Biologia)
  const iqsFertbioScore = sample.iqsFertbioScore ?? (
    iqsBioScore != null 
      ? Number(((iqsChemicalScore * 0.5) + (iqsBioScore * 0.5)).toFixed(2))
      : iqsChemicalScore
  );
  const iqsTotalScore = sample.iqsTotalScore ?? iqsFertbioScore;

  return {
    ...sample,
    hasBioAS,
    iqsChemicalScore,
    iqsBioScore,
    iqsFertbioScore,
    iqsTotalScore,
    bioasHealthClass,
    bioasInterpretation,
    sb,
    kMgDm3,
    ctcEffective,
    ctcTotal,
    vPercent,
    mPercent,
    caMgRatio,
    caKRatio,
    mgKRatio,
  };
}

/**
 * Motor de Cálculo de Calagem (Necessidade de Calcário)
 */
export function calculateLiming(
  soil: SoilSample,
  plot: FieldPlot,
  crop: CropNutritionalTarget,
  prntPercent: number = 80,
  incorporationDepthCm: number = 20,
  surfaceCoverPercent: number = 100,
  preferredMethod: 'base_saturation' | 'aluminum_neutralization' | 'ca_elevation' | 'mg_elevation' = 'base_saturation'
): LimingRecommendation {
  const calculatedSoil = calculateSoilIndices(soil);
  const currentV = calculatedSoil.vPercent || 0;
  const targetV = crop.targetVPercent;
  const ctcT = calculatedSoil.ctcTotal || 1;
  const prnt = prntPercent > 0 ? prntPercent : 80;
  const depthFactor = (incorporationDepthCm || 20) / 20;
  const areaFactor = (surfaceCoverPercent || 100) / 100;
  const f = 85 / prnt;

  let doseTonsPerHa = 0;
  let justification = '';

  if (preferredMethod === 'base_saturation') {
    if (currentV >= targetV) {
      doseTonsPerHa = 0;
      justification = `A Saturação por Bases atual (V% = ${currentV.toFixed(1)}%) já atinge ou supera o valor ideal para ${crop.name} (V% = ${targetV}%). Não há necessidade de calagem no momento.`;
    } else {
      // Fórmula NC (t/ha) = [(V2 - V1) * T / PRNT] * (Profundidade / 20) * (SC / 100)
      doseTonsPerHa = ((targetV - currentV) * ctcT / prnt) * depthFactor * areaFactor;
      doseTonsPerHa = Math.max(0, doseTonsPerHa);
      justification = `Elevação da Saturação por Bases de ${currentV.toFixed(1)}% para a meta de ${targetV}%, considerando CTC(T) = ${ctcT.toFixed(2)} cmolc/dm³ e calcário com PRNT de ${prnt}%.`;
    }
  } else if (preferredMethod === 'ca_elevation') {
    const caAtual = soil.caCmolcDm3 || 0;
    const caAlvo = 3.0;
    const deltaCa = Math.max(0, caAlvo - caAtual);
    const baseDose85 = deltaCa * (100 / 85);
    doseTonsPerHa = baseDose85 * f * depthFactor * areaFactor;
    doseTonsPerHa = Math.max(0, doseTonsPerHa);
    justification = `Elevação de Cálcio de ${caAtual.toFixed(2)} cmolc/dm³ para a meta de ${caAlvo.toFixed(1)} cmolc/dm³, aplicando o fator de correção f = ${f.toFixed(3)} (Base PRNT 85%).`;
  } else if (preferredMethod === 'mg_elevation') {
    const mgAtual = soil.mgCmolcDm3 || 0;
    const mgAlvo = 1.0;
    const deltaMg = Math.max(0, mgAlvo - mgAtual);
    const baseDose85 = deltaMg * (100 / 85);
    doseTonsPerHa = baseDose85 * f * depthFactor * areaFactor;
    doseTonsPerHa = Math.max(0, doseTonsPerHa);
    justification = `Elevação de Magnésio de ${mgAtual.toFixed(2)} cmolc/dm³ para a meta de ${mgAlvo.toFixed(1)} cmolc/dm³, aplicando o fator de correção f = ${f.toFixed(3)} (Base PRNT 85%).`;
  } else {
    // Método Neutralização de Al e Elevação de Ca+Mg (IAC / CFSEMG)
    // NC = [Y * Al + (X - (Ca + Mg))] * 100 / PRNT
    const al = soil.alCmolcDm3 || 0;
    const caMg = (soil.caCmolcDm3 || 0) + (soil.mgCmolcDm3 || 0);
    const yFactor = soil.clayPercent > 40 ? 2.0 : soil.clayPercent > 15 ? 1.5 : 1.0;
    const xMin = crop.targetVPercent > 65 ? 3.5 : 2.5; // Exigência mínima de Ca+Mg
    
    const alDose = yFactor * al;
    const caMgDeficit = Math.max(0, xMin - caMg);
    doseTonsPerHa = ((alDose + caMgDeficit) * 100 / prnt) * depthFactor * areaFactor;
    doseTonsPerHa = Math.max(0, doseTonsPerHa);
    justification = `Neutralização do Alumínio trocável (${al.toFixed(2)} cmolc/dm³) com fator textural Y=${yFactor} e suprimento de Ca+Mg mínimo (${xMin} cmolc/dm³).`;
  }

  // Recomendação do Tipo de Calcário
  let limestoneType: 'calcico' | 'magnesiano' | 'dolomitico' = 'dolomitico';
  const mg = soil.mgCmolcDm3 || 0;
  const ca = soil.caCmolcDm3 || 0;
  const caMgRatio = mg > 0 ? ca / mg : 4;

  if (mg < 0.8 || caMgRatio > 4.5) {
    limestoneType = 'dolomitico';
    justification += ' Recomendado Calcário Dolomítico (>12% de MgO) para correção do déficit crítico de Magnésio e ajuste da relação Ca:Mg.';
  } else if (ca < 1.5 && mg >= 1.0) {
    limestoneType = 'calcico';
    justification += ' Recomendado Calcário Calcítico (<5% de MgO) devido aos teores já adequados de Magnésio no solo.';
  } else {
    limestoneType = 'magnesiano';
    justification += ' Recomendado Calcário Magnesiano (5 a 12% de MgO) para manter o equilíbrio nutricional do solo.';
  }

  const doseKgPerHa = doseTonsPerHa * 1000;
  const triad = calculateUnitTriad(
    doseKgPerHa,
    plot.spacingBetweenRowsMeters,
    plot.spacingBetweenPlantsMeters
  );

  return {
    method: preferredMethod,
    targetVPercent: targetV,
    currentVPercent: currentV,
    prntPercent: prnt,
    soilIncorporationDepthCm: incorporationDepthCm,
    dose: triad,
    limestoneTypeRecommended: limestoneType,
    justification,
    applicationMode: doseTonsPerHa > 0
      ? 'Distribuir uniformemente a lanço em área total 60 a 90 dias antes do plantio, incorporando na profundidade de aração/gradagem ou mantendo em superfície para Sistema Plantio Direto consolidado.'
      : 'Não requer aplicação.',
  };
}

/**
 * Motor de Cálculo de Gessagem (Necessidade de Gesso Agrícola)
 */
export function calculateGypsum(
  soil: SoilSample,
  subsoil: SoilSample | undefined,
  plot: FieldPlot,
  crop: CropNutritionalTarget
): GypsumRecommendation {
  // Avalia camada superficial (0-20) e subsuperficial (20-40)
  const clay = subsoil?.clayPercent || soil.clayPercent || 30;
  const ca = subsoil?.caCmolcDm3 ?? soil.caCmolcDm3;
  const al = subsoil?.alCmolcDm3 ?? soil.alCmolcDm3;
  const sSO4 = subsoil?.sSO4MgDm3 ?? soil.sSO4MgDm3;
  
  const mPercent = subsoil?.mPercent ?? soil.mPercent ?? 0;

  const criteria: string[] = [];
  if (ca < 0.5) criteria.push(`Cálcio baixo em subsuperfície (${ca.toFixed(2)} cmolc/dm³ < 0.5 cmolc/dm³)`);
  if (al > 0.5) criteria.push(`Alumínio tóxico em subsuperfície (${al.toFixed(2)} cmolc/dm³ > 0.5 cmolc/dm³)`);
  if (mPercent > 20) criteria.push(`Saturação por Alumínio elevada (${mPercent.toFixed(1)}% > 20%)`);
  if (sSO4 < 5.0) criteria.push(`Enxofre-sulfato deficiente (${sSO4.toFixed(1)} mg/dm³ < 5.0 mg/dm³)`);

  const isNeeded = criteria.length > 0;
  let doseKgPerHa = 0;
  let justification = '';

  if (isNeeded) {
    // Fórmula Embrapa / Souza & Lobato: NG (kg/ha) = Fator * Argila (%)
    let clayFactor = 50; // Culturas anuais (soja/milho/feijão)
    if (['cafe_arabica', 'citros_laranja'].includes(crop.id)) {
      clayFactor = 60; // Culturas perenes
    } else if (['cana_de_acucar', 'pastagem_brachiaria'].includes(crop.id)) {
      clayFactor = 35;
    }

    doseKgPerHa = clayFactor * clay;
    justification = `Gessagem indicada por apresentar: ${criteria.join('; ')}. Cálculo baseado na textura do solo (${clay}% de argila) com fator multiplicador de ${clayFactor} kg de gesso/% de argila para condicionamento subsuperficial e descompactação química de raízes.`;
  } else {
    doseKgPerHa = 0;
    justification = 'O solo apresenta teores satisfatórios de Cálcio e Enxofre, sem barreira química de Alumínio tóxico em profundidade. Gessagem desnecessária no ciclo atual.';
  }

  const triad = calculateUnitTriad(
    doseKgPerHa,
    plot.spacingBetweenRowsMeters,
    plot.spacingBetweenPlantsMeters
  );

  return {
    isNeeded,
    criteriaTriggered: criteria,
    clayPercentage: clay,
    dose: triad,
    justification,
    applicationMode: isNeeded
      ? 'Aplicar a lanço em área total sem necessidade de incorporação (o gesso é 150x mais solúvel que o calcário e lixiviará naturalmente para o subsolo com a chuva).'
      : 'Não requer aplicação.',
  };
}

/**
 * Motor de Cálculo de Adubação de Plantio e Produção (N, P2O5, K2O e Micronutrientes)
 */
export function calculateFertilization(
  soil: SoilSample,
  plot: FieldPlot,
  crop: CropNutritionalTarget,
  targetYield?: number
): FertilizerRecommendation {
  const yieldTarget = targetYield || crop.defaultYieldTarget;
  const pSoil = soil.pMehlich1MgDm3 || 10;
  const kSoil = soil.kCmolcDm3 || 0.15;
  const clay = soil.clayPercent || 30;

  // 1. Demanda de Fósforo (P2O5)
  let p2o5DemandKgHa = 0;
  let pClass = 'medio';
  if (clay > 40) {
    if (pSoil < 6) pClass = 'muito_baixo';
    else if (pSoil < 12) pClass = 'baixo';
    else if (pSoil < 20) pClass = 'medio';
    else pClass = 'bom';
  } else {
    if (pSoil < 10) pClass = 'muito_baixo';
    else if (pSoil < 20) pClass = 'baixo';
    else if (pSoil < 30) pClass = 'medio';
    else pClass = 'bom';
  }

  if (pClass === 'muito_baixo') p2o5DemandKgHa = 120 + (yieldTarget * crop.extractionKgPerYieldUnit.p2o5 * 0.5);
  else if (pClass === 'baixo') p2o5DemandKgHa = 90 + (yieldTarget * crop.extractionKgPerYieldUnit.p2o5 * 0.4);
  else if (pClass === 'medio') p2o5DemandKgHa = 60 + (yieldTarget * crop.extractionKgPerYieldUnit.p2o5 * 0.3);
  else p2o5DemandKgHa = 30 + (yieldTarget * crop.extractionKgPerYieldUnit.p2o5 * 0.2);

  // 2. Demanda de Potássio (K2O)
  let k2oDemandKgHa = 0;
  if (kSoil < 0.10) k2oDemandKgHa = 100 + (yieldTarget * crop.extractionKgPerYieldUnit.k2o * 0.4);
  else if (kSoil < 0.20) k2oDemandKgHa = 70 + (yieldTarget * crop.extractionKgPerYieldUnit.k2o * 0.3);
  else if (kSoil < 0.35) k2oDemandKgHa = 40 + (yieldTarget * crop.extractionKgPerYieldUnit.k2o * 0.2);
  else k2oDemandKgHa = 20 + (yieldTarget * crop.extractionKgPerYieldUnit.k2o * 0.1);

  // 3. Demanda de Nitrogênio (N)
  let nPlantingKgHa = 20;
  let nTopDressingKgHa = 0;

  if (crop.id === 'soja') {
    nPlantingKgHa = 0; // Fixação Biológica de Nitrogênio (FBN via Bradyrhizobium)
    nTopDressingKgHa = 0;
  } else if (crop.id === 'milho') {
    nPlantingKgHa = 30;
    nTopDressingKgHa = Math.max(60, (yieldTarget * 1.3) - 30);
  } else if (crop.id === 'cafe_arabica') {
    nPlantingKgHa = 40;
    nTopDressingKgHa = Math.max(120, yieldTarget * 5.0);
  } else {
    nPlantingKgHa = 25;
    nTopDressingKgHa = Math.max(40, yieldTarget * crop.extractionKgPerYieldUnit.n * 0.6);
  }

  // Seleciona melhor formulado comercial de plantio
  let bestFertilizer = STANDARD_COMMERCIAL_FERTILIZERS[1]; // 08-28-16
  if (crop.id === 'soja') {
    bestFertilizer = STANDARD_COMMERCIAL_FERTILIZERS[3]; // 04-30-10 ou 02-20-20
  } else if (p2o5DemandKgHa > 100) {
    bestFertilizer = STANDARD_COMMERCIAL_FERTILIZERS[1]; // 08-28-16
  } else {
    bestFertilizer = STANDARD_COMMERCIAL_FERTILIZERS[2]; // 05-25-15
  }

  // Dose do formulado calculada para suprir o Fósforo
  const plantingFertilizerDoseKgHa = Math.round((p2o5DemandKgHa / (bestFertilizer.p2o5 / 100)));
  const plantingTriad = calculateUnitTriad(
    plantingFertilizerDoseKgHa,
    plot.spacingBetweenRowsMeters,
    plot.spacingBetweenPlantsMeters
  );

  const nSupplied = (plantingFertilizerDoseKgHa * bestFertilizer.n) / 100;
  const pSupplied = (plantingFertilizerDoseKgHa * bestFertilizer.p2o5) / 100;
  const kSupplied = (plantingFertilizerDoseKgHa * bestFertilizer.k2o) / 100;

  // Cobertura (Top Dressing)
  let topDressingRecommendation = undefined;
  if (nTopDressingKgHa > 0 || (k2oDemandKgHa - kSupplied) > 30) {
    const ureiaDoseKgHa = nTopDressingKgHa > 0 ? Math.round(nTopDressingKgHa / 0.46) : 0;
    const kclDoseKgHa = (k2oDemandKgHa - kSupplied) > 0 ? Math.round((k2oDemandKgHa - kSupplied) / 0.60) : 0;
    const totalTopDressingKgHa = ureiaDoseKgHa + kclDoseKgHa;

    const topDressingTriad = calculateUnitTriad(
      totalTopDressingKgHa,
      plot.spacingBetweenRowsMeters,
      plot.spacingBetweenPlantsMeters
    );

    topDressingRecommendation = {
      formulaName: `${ureiaDoseKgHa > 0 ? `Ureia (${ureiaDoseKgHa} kg/ha)` : ''} ${kclDoseKgHa > 0 ? `+ KCl (${kclDoseKgHa} kg/ha)` : ''}`.trim(),
      dose: topDressingTriad,
      splitApplications: crop.id === 'cafe_arabica' ? 3 : 2,
      timing: crop.id === 'milho' 
        ? 'Aplicar entre os estágios V4 e V6 da cultura com solo úmido.'
        : crop.id === 'cafe_arabica'
        ? 'Parcelar em 3 aplicações durante o período chuvoso (Nov, Jan, Mar).'
        : 'Aplicar no início do perfilhamento / desenvolvimento vegetativo pleno.',
    };
  }

  // Micronutrientes
  const micronutrients = [];
  if (soil.bMgDm3 < 0.5) {
    micronutrients.push({
      productName: 'Ácido Bórico ou Octaborato de Sódio (Via Solo ou Foliar)',
      dose: calculateUnitTriad(2.5, plot.spacingBetweenRowsMeters, plot.spacingBetweenPlantsMeters),
      elements: { b: 0.5 },
    });
  }
  if (soil.znMgDm3 < 1.5) {
    micronutrients.push({
      productName: 'Sulfato de Zinco (20% Zn)',
      dose: calculateUnitTriad(15.0, plot.spacingBetweenRowsMeters, plot.spacingBetweenPlantsMeters),
      elements: { zn: 3.0 },
    });
  }

  const technicalObservations = [
    `Meta de produtividade estipulada: ${yieldTarget} ${crop.expectedYieldUnit}.`,
    `Fósforo no solo classificado como '${pClass.toUpperCase()}' (${pSoil} mg/dm³ em solo com ${clay}% de argila).`,
    crop.id === 'soja'
      ? 'Para a soja, realizar inoculação padrão de sementes com estirpes selecionadas de Bradyrhizobium + Co-inoculação com Azospirillum brasilense, dispensando adubação nitrogenada mineral.'
      : `Adubação nitrogenada planejada para suprir ${nPlantingKgHa + nTopDressingKgHa} kg/ha de N total.`,
    'Aplicar adubo de plantio no sulco, posicionado 5 cm abaixo e 5 cm ao lado das sementes para evitar fitotoxidez por salinidade.',
  ];

  return {
    crop: crop.name,
    expectedYield: yieldTarget,
    yieldUnit: crop.expectedYieldUnit,
    plantingFertilizer: {
      formulaName: bestFertilizer.name,
      npkComposition: [bestFertilizer.n, bestFertilizer.p2o5, bestFertilizer.k2o],
      dose: plantingTriad,
      nutrientsProvidedKgHa: {
        n: Number(nSupplied.toFixed(1)),
        p2o5: Number(pSupplied.toFixed(1)),
        k2o: Number(kSupplied.toFixed(1)),
      },
    },
    topDressingFertilizer: topDressingRecommendation,
    micronutrients,
    technicalObservations,
  };
}

/**
 * Motor de Diagnose e Interpretação Foliar
 */
export function interpretLeafAnalysis(
  leaf: LeafSample,
  crop: CropNutritionalTarget,
  soil?: SoilSample
) {
  const ranges = crop.leafSufficiencyRange;

  const nutrients = [
    { key: 'n', name: 'Nitrogênio (N)', unit: 'g/kg', value: leaf.n_g_kg, range: ranges.n, isMacro: true },
    { key: 'p', name: 'Fósforo (P)', unit: 'g/kg', value: leaf.p_g_kg, range: ranges.p, isMacro: true },
    { key: 'k', name: 'Potássio (K)', unit: 'g/kg', value: leaf.k_g_kg, range: ranges.k, isMacro: true },
    { key: 'ca', name: 'Cálcio (Ca)', unit: 'g/kg', value: leaf.ca_g_kg, range: ranges.ca, isMacro: true },
    { key: 'mg', name: 'Magnésio (Mg)', unit: 'g/kg', value: leaf.mg_g_kg, range: ranges.mg, isMacro: true },
    { key: 's', name: 'Enxofre (S)', unit: 'g/kg', value: leaf.s_g_kg, range: ranges.s, isMacro: true },
    { key: 'b', name: 'Boro (B)', unit: 'mg/kg', value: leaf.b_mg_kg, range: ranges.b, isMacro: false },
    { key: 'cu', name: 'Cobre (Cu)', unit: 'mg/kg', value: leaf.cu_mg_kg, range: ranges.cu, isMacro: false },
    { key: 'fe', name: 'Ferro (Fe)', unit: 'mg/kg', value: leaf.fe_mg_kg, range: ranges.fe, isMacro: false },
    { key: 'mn', name: 'Manganês (Mn)', unit: 'mg/kg', value: leaf.mn_mg_kg, range: ranges.mn, isMacro: false },
    { key: 'zn', name: 'Zinco (Zn)', unit: 'mg/kg', value: leaf.zn_mg_kg, range: ranges.zn, isMacro: false },
  ];

  const evaluations = nutrients.map(n => {
    const [min, max] = n.range;
    let status: 'severely_deficient' | 'deficient' | 'adequate' | 'high' | 'excessive' = 'adequate';
    let label = 'Adequado / Suficiente';
    let color = 'text-emerald-700 bg-emerald-50 border-emerald-200';

    if (n.value < min * 0.7) {
      status = 'severely_deficient';
      label = 'Deficiência Severa';
      color = 'text-rose-700 bg-rose-50 border-rose-200';
    } else if (n.value < min) {
      status = 'deficient';
      label = 'Abaixo do Ideal';
      color = 'text-amber-700 bg-amber-50 border-amber-200';
    } else if (n.value > max * 1.3) {
      status = 'excessive';
      label = 'Excessivo / Tóxico';
      color = 'text-purple-700 bg-purple-50 border-purple-200';
    } else if (n.value > max) {
      status = 'high';
      label = 'Acima do Ideal';
      color = 'text-blue-700 bg-blue-50 border-blue-200';
    }

    return {
      ...n,
      min,
      max,
      status,
      label,
      color,
      percentOfIdealMin: Number(((n.value / min) * 100).toFixed(0)),
    };
  });

  // Correlações Solo x Folha
  const correlations: string[] = [];
  if (soil) {
    if (leaf.k_g_kg > ranges.k[1] && leaf.mg_g_kg < ranges.mg[0]) {
      correlations.push('Antagonismo K x Mg observado: O alto teor de Potássio foliar está inibindo a absorção radicular de Magnésio pela planta.');
    }
    if (leaf.p_g_kg < ranges.p[0] && soil.pMehlich1MgDm3 > 15 && soil.clayPercent > 45) {
      correlations.push('Fixação de Fósforo por argilas/óxidos: O solo apresenta P disponível razoável, porém a folha acusa deficiência, indicando alta adsorção de fosfato na fração argilosa.');
    }
    if (leaf.b_mg_kg < ranges.b[0] && soil.organicMatterGdm3 < 20) {
      correlations.push('Baixo teor de Matéria Orgânica no solo reduzindo a disponibilidade contínua de Boro para as folhas novas.');
    }
  }

  return {
    evaluations,
    correlations,
    allAdequate: evaluations.every(e => e.status === 'adequate'),
    deficientCount: evaluations.filter(e => e.status === 'deficient' || e.status === 'severely_deficient').length,
    excessiveCount: evaluations.filter(e => e.status === 'high' || e.status === 'excessive').length,
  };
}
