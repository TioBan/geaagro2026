import {
  PlantabilitySamplingPoint,
  PlantabilityMetricsResult,
  SeedingConfig,
  DiagnosticRule,
  EconomicLossSimulation,
  CropType
} from '../types/plantability';

/**
 * Calculates complete plantability metrics for a set of sampling points
 */
export function calculatePlantabilityMetrics(
  samplings: PlantabilitySamplingPoint[],
  config?: SeedingConfig
): PlantabilityMetricsResult {
  // Collect all actual spacings and depths
  let allSpacings: number[] = [];
  let allDepths: number[] = [];
  let totalDamaged = 0;

  samplings.forEach(s => {
    allSpacings.push(...s.actualSpacingsCm);
    allDepths.push(...s.actualDepthsCm);
    totalDamaged += s.damagedPlantsCount;
  });

  // Default targets if config missing
  const rowSpacingCm = config ? config.rowSpacingCm : 45; // 45 cm default
  const targetPopHa = config ? config.targetPopulationPerHa : 220000;
  
  // Target spacing between seeds in line (cm)
  // 1 ha = 10000 m² = 1,000,000,000 cm²
  // Line length per ha = 10,000 / (rowSpacing in meters) = meters of row per ha
  // Target seeds per meter = targetPopHa / (10,000 / rowSpacingMeters)
  const rowSpacingMeters = rowSpacingCm / 100;
  const metersOfRowPerHa = 10000 / rowSpacingMeters;
  const targetSeedsPerMeter = targetPopHa / metersOfRowPerHa;
  const calculatedTargetSpacingCm = config?.desiredSeedSpacingCm || (targetSeedsPerMeter > 0 ? (100 / targetSeedsPerMeter) : 13.5);

  if (allSpacings.length === 0) {
    return {
      targetSpacingCm: Number(calculatedTargetSpacingCm.toFixed(1)),
      averageSpacingCm: 0,
      stdDeviationCm: 0,
      cvPercent: 0,
      acceptablePercent: 0,
      skipsPercent: 0,
      doublesPercent: 0,
      triplesPercent: 0,
      realPopulationPerHa: 0,
      targetPopulationPerHa: targetPopHa,
      populationLossPerHa: 0,
      emergenceUniformityPct: 0,
      avgDepthCm: config?.targetDepthCm || 0,
      depthStdDevCm: 0,
      igpScore: 0,
      igpClassification: 'Aguardando Amostragem',
      igpColorClass: 'text-stone-600 bg-stone-100 dark:bg-zinc-800 border-stone-300 dark:border-zinc-700'
    };
  }

  // Calculate Average Spacing
  const sumSpacings = allSpacings.reduce((a, b) => a + b, 0);
  const avgSpacingCm = sumSpacings / allSpacings.length;

  // Variance & Standard Deviation
  const varianceSpacings = allSpacings.reduce((sum, val) => sum + Math.pow(val - avgSpacingCm, 2), 0) / allSpacings.length;
  const stdDevCm = Math.sqrt(varianceSpacings);
  const cvPct = avgSpacingCm > 0 ? (stdDevCm / avgSpacingCm) * 100 : 0;

  // Categorize Spacings:
  // Acceptable: 0.5x target <= spacing <= 1.5x target
  // Double: spacing < 0.5x target
  // Triple: spacing < 0.33x target
  // Skip/Falha: spacing > 1.5x target
  let acceptableCount = 0;
  let doubleCount = 0;
  let tripleCount = 0;
  let skipCount = 0;

  const lowerBound = calculatedTargetSpacingCm * 0.5;
  const upperBound = calculatedTargetSpacingCm * 1.5;
  const tripleBound = calculatedTargetSpacingCm * 0.33;

  allSpacings.forEach(sp => {
    if (sp < tripleBound) {
      tripleCount++;
      doubleCount++; // counts as double/multiple
    } else if (sp < lowerBound) {
      doubleCount++;
    } else if (sp > upperBound) {
      skipCount++;
    } else {
      acceptableCount++;
    }
  });

  const totalCount = allSpacings.length;
  const acceptablePct = (acceptableCount / totalCount) * 100;
  const doublesPct = (doubleCount / totalCount) * 100;
  const triplesPct = (tripleCount / totalCount) * 100;
  const skipsPct = (skipCount / totalCount) * 100;

  // Real Population Calculation
  // Real avg spacing in meters = avgSpacingCm / 100
  // Plants per meter = 1 / (avgSpacingCm / 100) = 100 / avgSpacingCm
  // Real Pop / ha = (100 / avgSpacingCm) * (10000 / rowSpacingMeters)
  const realPopPerHa = avgSpacingCm > 0 ? Math.round((100 / avgSpacingCm) * metersOfRowPerHa) : targetPopHa;
  const popLossPerHa = Math.max(0, targetPopHa - realPopPerHa);

  // Depth statistics
  const avgDepth = allDepths.length > 0 ? allDepths.reduce((a, b) => a + b, 0) / allDepths.length : (config?.targetDepthCm || 4.0);
  const varDepth = allDepths.length > 0
    ? allDepths.reduce((s, v) => s + Math.pow(v - avgDepth, 2), 0) / allDepths.length
    : 0;
  const stdDevDepth = Math.sqrt(varDepth);

  // Emergence Uniformity Calculation
  // Penalize based on days to emergence variance or damaged plants
  const avgEmergenceDays = samplings.length > 0
    ? samplings.reduce((acc, curr) => acc + curr.emergenceDays, 0) / samplings.length
    : 7;
  const emergenceUniformityPct = Math.max(0, Math.min(100, 100 - (avgEmergenceDays > 10 ? (avgEmergenceDays - 7) * 5 : 0) - (totalDamaged * 2)));

  // Calculate Índice GeaAgro de Plantabilidade (IGP) - Composite Score 0 to 100
  // Formula:
  // IGP = 0.40 * AcceptablePct + 0.25 * (100 - CV%) + 0.15 * (100 - Skips%*2) + 0.10 * EmergenceUniformity + 0.10 * DepthScore
  const cvPenaltyScore = Math.max(0, 100 - cvPct);
  const skipScore = Math.max(0, 100 - (skipsPct * 2.5));
  const targetDepth = config?.targetDepthCm || 4.0;
  const depthDeviation = Math.abs(avgDepth - targetDepth);
  const depthScore = Math.max(0, 100 - (depthDeviation * 20) - (stdDevDepth * 15));

  const igpRaw = (0.40 * acceptablePct) + (0.25 * cvPenaltyScore) + (0.15 * skipScore) + (0.10 * emergenceUniformityPct) + (0.10 * depthScore);
  const igpScore = Number(Math.max(0, Math.min(100, igpRaw)).toFixed(1));

  let igpClassification: 'Excelente' | 'Muito bom' | 'Bom' | 'Atenção' | 'Crítico' = 'Bom';
  let igpColorClass = 'text-yellow-600 bg-yellow-50 border-yellow-200';

  if (igpScore >= 95) {
    igpClassification = 'Excelente';
    igpColorClass = 'text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400';
  } else if (igpScore >= 90) {
    igpClassification = 'Muito bom';
    igpColorClass = 'text-blue-700 bg-blue-50 border-blue-300 dark:bg-blue-950/40 dark:text-blue-400';
  } else if (igpScore >= 80) {
    igpClassification = 'Bom';
    igpColorClass = 'text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400';
  } else if (igpScore >= 70) {
    igpClassification = 'Atenção';
    igpColorClass = 'text-orange-700 bg-orange-50 border-orange-300 dark:bg-orange-950/40 dark:text-orange-400';
  } else {
    igpClassification = 'Crítico';
    igpColorClass = 'text-rose-700 bg-rose-50 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400';
  }

  return {
    targetSpacingCm: Number(calculatedTargetSpacingCm.toFixed(1)),
    averageSpacingCm: Number(avgSpacingCm.toFixed(1)),
    stdDeviationCm: Number(stdDevCm.toFixed(2)),
    cvPercent: Number(cvPct.toFixed(1)),
    acceptablePercent: Number(acceptablePct.toFixed(1)),
    skipsPercent: Number(skipsPct.toFixed(1)),
    doublesPercent: Number(doublesPct.toFixed(1)),
    triplesPercent: Number(triplesPct.toFixed(1)),
    realPopulationPerHa: realPopPerHa,
    targetPopulationPerHa: targetPopHa,
    populationLossPerHa: popLossPerHa,
    emergenceUniformityPct: Number(emergenceUniformityPct.toFixed(1)),
    avgDepthCm: Number(avgDepth.toFixed(1)),
    depthStdDevCm: Number(stdDevDepth.toFixed(2)),
    igpScore,
    igpClassification,
    igpColorClass
  };
}

/**
 * Expert Diagnostic Engine: Generates specific maintenance & adjustment rules
 * based on measured metrics and planter parameters without requiring AI.
 */
export function generatePlanterDiagnostics(
  metrics: PlantabilityMetricsResult,
  config?: SeedingConfig
): DiagnosticRule[] {
  const rules: DiagnosticRule[] = [];

  // 1. High Doubles Diagnostic
  if (metrics.doublesPercent > 6) {
    rules.push({
      id: 'diag-doubles',
      symptom: `Elevado percentual de Duplos (${metrics.doublesPercent}%)`,
      possibleCauses: [
        'Excesso de vácuo no dosador pneumático (pressão de sucção alta demais para o tamanho do lote).',
        'Disco de sementes inadequado (furos maiores que o diâmetro médio da semente).',
        'Desgaste do organizador de sementes ou gatilho eliminador de duplos.',
        'Sementes desuniformes com PMS ou peneira variável sem regulagem do dosador.'
      ],
      recommendedActions: [
        'Reduzir a pressão de vácuo do dosador pneumático em 0.5 a 1.0 polegada de água (inH2O).',
        'Ajustar manualmente o gatilho/pente raspador eliminador de duplos.',
        'Substituir o disco de sementes por uma peneira/diâmetro menor.',
        'Verificar se há lubrificação de grafite/talco na proporção recomendada (3 a 5g por kg de semente).'
      ],
      severity: metrics.doublesPercent > 12 ? 'Alta' : 'Média'
    });
  }

  // 2. High Skips Diagnostic
  if (metrics.skipsPercent > 6) {
    rules.push({
      id: 'diag-skips',
      symptom: `Elevado percentual de Falhas (${metrics.skipsPercent}%)`,
      possibleCauses: [
        'Insuficiência de vácuo no dosador pneumático (sucção fraca).',
        'Obstrução parcial dos furos do disco por resíduos, grafite empastado ou tratamento de sementes.',
        'Raspador de duplos muito ajustado (fechado demais), derrubando sementes válidas.',
        'Matéria orgânica ou palhada travando a roseta de limpeza ou tubo condutor.',
        'Velocidade de operação excessiva causando repique da semente no condutor.'
      ],
      recommendedActions: [
        'Aumentar a pressão do vácuo no dosador pneumático.',
        'Limpar completamente os furos do disco de sementes e verificar se há desgaste.',
        'Abrir levemente a regulagem do pente raspador de duplos.',
        'Verificar se os tubos condutores de sementes possuem ranhuras internas ou dobras.'
      ],
      severity: metrics.skipsPercent > 12 ? 'Alta' : 'Média'
    });
  }

  // 3. High CV% Diagnostic
  if (metrics.cvPercent > 25) {
    rules.push({
      id: 'diag-cv',
      symptom: `Alto Coeficiente de Variação de Espaçamento (CV ${metrics.cvPercent}%)`,
      possibleCauses: [
        'Velocidade de plantio acima do limite recomendado para o tipo de dosador.',
        'Folga na corrente/engrenagens de transmissão mecânica das linhas.',
        'Tubo condutor de sementes desgastado, áspero ou com curvatura inadequada.',
        'Efeito "repique" da semente no sulco por falta de roda firmadora ou condensação no condutor.'
      ],
      recommendedActions: [
        'Reduzir a velocidade do trator/semeadora para a faixa ideal (5.5 a 6.5 km/h em dosadores mecânicos ou até 7.5 km/h em pneumáticos).',
        'Inspecionar esticadores e correntes do sistema de transmissão.',
        'Trocar os tubos condutores curvos por condutores retos ou com sensor integrado sem atrito.',
        'Ajustar a roda emborrachada firmadora de sementes no fundo do sulco.'
      ],
      severity: metrics.cvPercent > 35 ? 'Alta' : 'Média'
    });
  }

  // 4. Variable Depth Diagnostic
  if (metrics.depthStdDevCm > 1.0) {
    rules.push({
      id: 'diag-depth',
      symptom: `Variação excessiva na Profundidade das Sementes (Desvio ${metrics.depthStdDevCm} cm)`,
      possibleCauses: [
        'Pressão insuficiente das molas dos chassi/linhas sobre a palhada/solo.',
        'Discos duplos sulcadores desgastados ou com diâmetro inferior ao limite do fabricante.',
        'Banda limitadora de profundidade frouxa, gasta ou acumulando barro.',
        'Solo com variações bruscas de textura ou compactação no mesmo talhão.'
      ],
      recommendedActions: [
        'Incrementar a pressão do sistema de molas/mola pneumática nas linhas de plantio.',
        'Aferir o diâmetro do disco sulcador duplo e substituir se o desgaste for > 10%.',
        'Regular as bandas limitadoras laterais e limpar rascadores de roda.',
        'Utilizar disco de corte de palhada maior e ajustar o alinhamento com a linha de semente.'
      ],
      severity: 'Média'
    });
  }

  // 5. Speed Hazard
  if (config && config.targetSpeedKmH > 7.5) {
    rules.push({
      id: 'diag-speed',
      symptom: `Velocidade de Operação Elevada (${config.targetSpeedKmH} km/h)`,
      possibleCauses: [
        'Operação acelerada excedendo a capacidade do dosador e do condutor de sementes.'
      ],
      recommendedActions: [
        'Para manter o Índice de Plantabilidade > 90%, reduza a velocidade para 6.0 - 7.0 km/h.',
        'Se necessitar alta velocidade (>8 km/h), certifique-se de utilizar dosadores elétricos (E-Drive) ou condutores com correia escovada.'
      ],
      severity: 'Baixa'
    });
  }

  return rules;
}

/**
 * Economic Loss Simulator Calculator
 */
export function simulateEconomicLoss(
  metrics: PlantabilityMetricsResult,
  fieldAreaHa: number,
  crop: CropType = 'Soja',
  targetYieldScHa: number = 70,
  commodityPricePerSc: number = 130,
  seedCostPerHa: number = 380
): EconomicLossSimulation {
  // Agronomic loss estimation model:
  // - Each 1% of skips causes approx 0.8% direct yield reduction due to uncolonized space.
  // - Each 1% of doubles causes approx 0.3% yield loss due to severe interplant competition (shaded runt plants).
  // - CV% above 25% causes approx 0.2% yield loss per 1% CV increase.

  const skipPenalty = metrics.skipsPercent * 0.85;
  const doublePenalty = metrics.doublesPercent * 0.30;
  const cvPenalty = Math.max(0, metrics.cvPercent - 25) * 0.25;

  const totalYieldLossPct = Math.min(45, skipPenalty + doublePenalty + cvPenalty);
  const yieldLossScHa = Number(((totalYieldLossPct / 100) * targetYieldScHa).toFixed(2));
  const totalYieldLossSc = Number((yieldLossScHa * fieldAreaHa).toFixed(1));
  const financialLossPerHa = Number((yieldLossScHa * commodityPricePerSc).toFixed(2));
  const totalFinancialLoss = Number((financialLossPerHa * fieldAreaHa).toFixed(2));
  
  // Wasted seed cost due to doubles
  const seedWastePerHa = Number(((metrics.doublesPercent / 100) * seedCostPerHa).toFixed(2));

  return {
    fieldAreaHa,
    crop,
    targetYieldScHa,
    commodityPricePerSc,
    seedCostPerHa,
    skipsPct: metrics.skipsPercent,
    doublesPct: metrics.doublesPercent,
    cvPct: metrics.cvPercent,
    yieldLossPercent: Number(totalYieldLossPct.toFixed(1)),
    yieldLossScHa,
    totalYieldLossSc,
    financialLossPerHa,
    totalFinancialLoss,
    seedWastePerHa
  };
}
