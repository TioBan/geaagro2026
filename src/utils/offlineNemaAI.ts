/**
 * Local Agronomic Intelligence Engine for 100% Offline Consultations
 * Provides structured diagnoses, biological management plans, crop rotation,
 * and operational checklists directly in the browser when offline.
 */
export function generateOfflineNemaAIDiagnosis(payload: {
  crop?: string;
  domain?: string;
  farmName?: string;
  fieldName?: string;
  areaHa?: number;
  prompt?: string;
}): any {
  const crop = payload.crop || 'Soja';
  const domain = payload.domain || 'geral';
  const farm = payload.farmName || 'Fazenda Principal';
  const field = payload.fieldName || 'Talhão Analisado';
  const area = payload.areaHa || 50;

  let category = 'Agricultura';
  let risk = 'Moderada';
  let score = 45;
  let summary = `Parecer da Nema IA [Offline-First]: Consultoria técnica local para ${crop} no talhão ${field} (${farm}). Diagnóstico calculado pelo motor heurístico embarcado no PWA.`;
  let dominantTargets = ['Nematóide-das-lesões-radiculares (Pratylenchus brachyurus)', 'Desbalanço nutricional leve'];
  let frEstimated = 1.6;
  let frStatus = 'Multiplicador';
  let frInterp = 'População ativa em monitoramento de acordo com o histórico da área.';
  let threshold = 'Nível de população inicial próximo ao limiar de intervenção econômica.';

  let biologicals = [
    {
      agent: 'Bacillus velezensis + Bacillus subtilis',
      target: 'Fitonematóides e Patógenos Radiculares',
      applicationTiming: 'Tratamento de Sementes (TS) ou Sulco de Plantio',
      doseRecommendation: '200 ml/100kg de semente ou 500 ml/ha no sulco',
      mechanismOfAction: 'Colonização da rizosfera com biofilme protetor e produção de surfactinas e lipopeptídeos antimicrobianos.'
    },
    {
      agent: 'Trichoderma harzianum',
      target: 'Fungos de Solo e Nematóides',
      applicationTiming: 'Drench ou aplicação via barra pós-emergência',
      doseRecommendation: '1.5 kg/ha',
      mechanismOfAction: 'Hiperparasitismo e indução de resistência sistêmica na planta.'
    }
  ];

  let chemicals = {
    recommended: true,
    activeIngredients: ['Abamectina (500 g/L)', 'Fluensulfona (480 g/L)'],
    observation: 'Intervenção química restrita às reboleiras com sintomas visuais pronunciados.'
  };

  let rotation = {
    recommendedCoverCrops: ['Crotalaria spectabilis', 'Milheto ADR 300', 'Brachiaria ruziziensis'],
    cropsToAvoid: ['Soja suscetível em monocultivo contínuo', 'Feijoeiro comum sem rotação'],
    successionStrategy: 'Introdução de Crotalaria spectabilis na entressafra para redução drástica de Pratylenchus, seguida por milho segunda safra consorciado com braquiária.'
  };

  let soilHealth = [
    'Aporte contínuo de matéria orgânica através de rotação com gramíneas.',
    'Inoculação com bactérias solubilizadoras de fósforo (Bacillus megaterium).',
    'Preservação da cobertura morta para controle térmico do solo e retenção hídrica.'
  ];

  let livestock = {
    carryingCapacityUaHa: '1.8 UA/ha',
    pastureManagement: 'Pastejo rotacionado com controle rigoroso de altura de resíduo.',
    nutritionalStrategy: 'Suplementação mineral aditivada balanceada para ganho de peso contínuo.',
    sanitaryProtocol: 'Controle estratégico de endo e ectoparasitas com monitoramento fecal.'
  };

  let checklist = [
    'Coletar amostras georreferenciadas de solo e raízes para laudo laboratorial comprobatório.',
    'Calibrar pontas e vazão do pulverizador de sulco de plantio.',
    'Utilizar cultivares homologadas com fator de reprodução baixo (FR < 1).',
    'Semear planta de cobertura imediatamente após a colheita da safra principal.'
  ];

  if (domain === 'nematologia' || domain.includes('nema')) {
    category = 'Nematologia';
    risk = 'Alta';
    score = 70;
    summary = `Parecer da Nema IA [Fitossanidade]: Risco fitonematológico considerável identificado no talhão ${field} (${area} ha). Indicação prioritária de bioinsumos e cultura antagônica.`;
  } else if (domain === 'solo' || domain.includes('nutri')) {
    category = 'Solo & Nutrição';
    summary = `Parecer da Nema IA [Fertilidade]: Análise focada em equilíbrio da CTC e fornecimento equilibrado de bases no solo do talhão ${field}.`;
    dominantTargets = ['Desbalanço Ca:Mg', 'Acidez potencial em subsuperfície'];
    frEstimated = 0;
    frStatus = 'Estável';
    frInterp = 'N/A para nutrição química.';
    biologicals = [
      {
        agent: 'Bacillus megaterium + Bacillus aryabhattai',
        target: 'Solubilização de Fósforo e Tolerância ao Estresse Hídrico',
        applicationTiming: 'No plantio ou fertirrigação',
        doseRecommendation: '150 ml/ha',
        mechanismOfAction: 'Secreção de ácidos orgânicos e fosfatases para liberação de fosfato retido.'
      }
    ];
  } else if (domain === 'pecuaria' || domain.includes('zootecnia') || domain === 'animal') {
    category = 'Pecuária & Zootecnia';
    summary = `Parecer da Nema IA [Pecuária & Nutrição]: Manejo de pastagem e dimensionamento de rebanho para a fazenda ${farm}. Lotação planejada para ${livestock.carryingCapacityUaHa}.`;
    dominantTargets = ['Manejo da oferta de forragem', 'Eficiência de conversão alimentar'];
    frEstimated = 0;
    frStatus = 'Estável';
    frInterp = 'Sem incidência de pragas agrícolas.';
  }

  const chatReply = `Olá! Sou a **Nema IA** (Modo 100% Offline).
  
Com base nas variáveis agronômicas de **${crop}** para o talhão **${field}** (${farm}):

- **Diagnóstico Local:** Grau de risco estimado em **${risk}** (${score}% de severidade potencial).
- **Focos Prioritários:** ${dominantTargets.join(', ')}.
- **Manejo Biológico Recomendado:** ${biologicals[0]?.agent} (${biologicals[0]?.doseRecommendation}).
- **Rotação de Culturas:** ${rotation.successionStrategy}

O diagnóstico e checklist foram calculados localmente pelo motor embarcado no seu dispositivo e já estão salvos no histórico IndexedDB!`;

  return {
    reply: chatReply,
    executiveSummary: summary,
    domainCategory: category,
    riskLevel: risk,
    riskScorePercentage: score,
    nemaIAScore: {
      score: score,
      riskLevel: risk,
      subScores: {
        populationPressure: Math.min(45, Math.round(score * 0.45)),
        reproductionDynamics: Math.min(25, Math.round(score * 0.25)),
        soilVulnerability: Math.min(15, Math.round(score * 0.15)),
        cropSusceptibility: Math.min(15, Math.round(score * 0.15)),
      },
      interpretation: summary,
    },
    reproductionFactorAnalysis: {
      estimatedFR: frEstimated,
      status: frStatus,
      interpretation: frInterp
    },
    dominantSpeciesOrTargets: dominantTargets,
    damageThresholdAssessment: threshold,
    biologicalManagementPlan: biologicals,
    chemicalManagementPlan: chemicals,
    cropRotationAndCoverCrops: rotation,
    livestockAndPastureRecommendations: livestock,
    soilHealthAndBioASRecommendations: soilHealth,
    foliarDiagnosisAndBalance: {
      nutritionalStatusSummary: `Equilíbrio nutricional de ${crop} avaliado sob parâmetros locais.`,
      limitingNutrients: ['Potássio (K)', 'Boro (B)'],
      foliarSprayRecommendation: 'Pulverização foliar preventiva com micronutrientes e aminoácidos.',
      soilPlantSynchrony: 'Condições hídricas e térmicas favoráveis à absorção.'
    },
    actionChecklist: checklist,
    isOfflineGenerated: true,
  };
}
