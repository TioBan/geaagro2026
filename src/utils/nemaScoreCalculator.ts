import { InfestationRisk, LabResult, NematodeSpecies } from '../types/nematology';
import { NEMATODE_SPECIES_CATALOG } from '../data/nematologyData';

export interface NemaScoreInputParams {
  labResults?: LabResult[];
  soilType?: 'Arenoso' | 'Misto' | 'Argiloso' | 'Muito Argiloso' | string;
  currentCrop?: string;
  pi?: number;
  pf?: number;
  reproductionFactor?: number;
  speciesCatalog?: NematodeSpecies[];
}

export interface NemaScoreResult {
  score: number; // 0 to 100
  riskLevel: InfestationRisk;
  subScores: {
    populationPressure: number; // 0-45
    reproductionDynamics: number; // 0-25
    soilVulnerability: number; // 0-15
    cropSusceptibility: number; // 0-15
  };
  dominantSpecies: string[];
  maxPopulationRatio: number; // ratio vs species threshold
  reproductionFactor: number;
  summaryInterpretation: string;
  recommendedActions: string[];
  mode: 'local' | 'ia';
  hasData?: boolean;
}

/**
 * Local / Offline deterministic calculation of the Nema IA Score (0 - 100).
 * Based on SBN, Embrapa and IAC agronomic risk models.
 */
export function calculateLocalNemaScore(params: NemaScoreInputParams): NemaScoreResult {
  const catalog = params.speciesCatalog || NEMATODE_SPECIES_CATALOG;
  const labResults = params.labResults || [];
  const soilType = params.soilType;
  const crop = (params.currentCrop || '').toLowerCase();

  const hasLab = labResults.length > 0;
  const hasPi = params.pi !== undefined && params.pi > 0;
  const hasFr = params.reproductionFactor !== undefined && params.reproductionFactor > 0;
  const hasData = hasLab || hasPi || hasFr;

  if (!hasData) {
    return {
      score: 0,
      riskLevel: 'Baixa',
      subScores: {
        populationPressure: 0,
        reproductionDynamics: 0,
        soilVulnerability: 0,
        cropSusceptibility: 0,
      },
      dominantSpecies: [],
      maxPopulationRatio: 0,
      reproductionFactor: 0,
      summaryInterpretation: 'Aguardando cadastro de laudo laboratorial ou contagem de nematóides para este talhão.',
      recommendedActions: ['Cadastrar um laudo laboratorial ou amostragem de nematóides para calcular o índice fitossanitário.'],
      mode: 'local',
      hasData: false,
    };
  }

  let maxPopScore = 0;
  let maxRatio = 0;
  const dominantSet = new Set<string>();
  const actions: string[] = [];

  if (labResults.length > 0) {
    labResults.forEach(lab => {
      const sp = catalog.find(s => s.id === lab.speciesId) || catalog.find(s => lab.speciesId.includes(s.id));
      const thresholds = sp?.riskThresholds || { moderate: 100, high: 500, veryHigh: 2000 };

      // Calculate ratio based on soil and root populations
      const soilRatio = lab.populationSoil200cm3 / (thresholds.high || 500);
      const rootRatio = lab.populationRoot10g / (thresholds.high / 2 || 250);
      const spRatio = Math.max(soilRatio, rootRatio);

      if (spRatio > maxRatio) {
        maxRatio = spRatio;
      }

      if (spRatio > 0.3) {
        dominantSet.add(sp?.scientificName || lab.speciesId);
      }
    });

    // Score from population pressure (0 to 45 pts)
    if (maxRatio >= 2.5) {
      maxPopScore = 45;
    } else if (maxRatio >= 1.5) {
      maxPopScore = 38;
    } else if (maxRatio >= 1.0) {
      maxPopScore = 30;
    } else if (maxRatio >= 0.5) {
      maxPopScore = 20;
    } else if (maxRatio >= 0.2) {
      maxPopScore = 10;
    } else {
      maxPopScore = 5;
    }
  } else if (params.pi && params.pi > 0) {
    // If no lab results array, fallback to Pi population count
    const ratio = params.pi / 500;
    maxRatio = ratio;
    if (ratio >= 2.0) maxPopScore = 42;
    else if (ratio >= 1.0) maxPopScore = 30;
    else if (ratio >= 0.5) maxPopScore = 18;
    else maxPopScore = 8;
  }

  // 2. Reproduction Dynamics Subscore (0 to 25 pts)
  let fr = params.reproductionFactor;
  if (fr === undefined || fr === null) {
    if (params.pi && params.pf && params.pi > 0) {
      fr = params.pf / params.pi;
    } else {
      fr = 0;
    }
  }

  let frScore = 0;
  if (fr >= 3.0) {
    frScore = 25; // Explosion
  } else if (fr >= 1.5) {
    frScore = 20;
  } else if (fr >= 1.0) {
    frScore = 14;
  } else if (fr >= 0.5) {
    frScore = 8;
  } else if (fr > 0) {
    frScore = 3; // Declining population
  } else {
    frScore = 0;
  }

  // 3. Soil Vulnerability Subscore (0 to 15 pts)
  let soilScore = 0;
  if (soilType === 'Arenoso') {
    soilScore = 15; // High vulnerability for roots and movement
  } else if (soilType === 'Misto') {
    soilScore = 10;
  } else if (soilType === 'Argiloso') {
    soilScore = 6;
  } else if (soilType === 'Muito Argiloso') {
    soilScore = 4;
  } else {
    soilScore = 0;
  }

  // 4. Crop Susceptibility Subscore (0 to 15 pts)
  let cropScore = 0;
  if (crop.includes('soja') || crop.includes('milho') || crop.includes('algodão') || crop.includes('café')) {
    cropScore = 15; // High host susceptibility
  } else if (crop.includes('crotalaria') || crop.includes('ruziziensis') || crop.includes('milheto')) {
    cropScore = 2; // Low host susceptibility / antagonist
  } else if (crop.length > 0) {
    cropScore = 8;
  } else {
    cropScore = 0;
  }

  // Total Score (0 - 100)
  const totalScore = Math.min(100, Math.round(maxPopScore + frScore + soilScore + cropScore));

  // Risk Classification
  let riskLevel: InfestationRisk = 'Baixa';
  if (totalScore >= 75) {
    riskLevel = 'Muito Alta';
  } else if (totalScore >= 50) {
    riskLevel = 'Alta';
  } else if (totalScore >= 25) {
    riskLevel = 'Moderada';
  } else {
    riskLevel = 'Baixa';
  }

  // Generate actions and summary interpretation
  const dominantList = Array.from(dominantSet);

  if (totalScore >= 75) {
    actions.push('Adoção imediata de nematicidas biológicos (Bacillus + Purpureocillium) no sulco de semeadura.');
    actions.push('Inclusão de Crotalaria spectabilis ou Crotalaria ochroleuca na entressafra (FR < 1.0).');
    actions.push('Evitar a sucessão direta Soja -> Milho suscetível sem cobertura antagônica.');
  } else if (totalScore >= 50) {
    actions.push('Tratamento de sementes com nematicidas biológicos/químicos.');
    actions.push('Monitoramento semestral com amostragem de solo e raízes pós-colheita.');
    actions.push('Incremento de Matéria Orgânica e condicionadores de solo biológicos.');
  } else {
    actions.push('Manter práticas de rotação de culturas e monitoramento preventivo.');
    actions.push('Preservar a microbiota benéfica e saúde estrutural do solo.');
  }

  const summaryInterpretation = `Score Local Nema IA: ${totalScore}/100 (${riskLevel}). ` +
    `Pressão populacional (${maxPopScore}/45 pts), Dinâmica de Reprodução FR=${fr.toFixed(2)} (${frScore}/25 pts), ` +
    `Vulnerabilidade do Solo ${soilType || 'Não Informado'} (${soilScore}/15 pts) e Suscetibilidade da Cultura (${cropScore}/15 pts).`;

  return {
    score: totalScore,
    riskLevel,
    subScores: {
      populationPressure: maxPopScore,
      reproductionDynamics: frScore,
      soilVulnerability: soilScore,
      cropSusceptibility: cropScore,
    },
    dominantSpecies: dominantList,
    maxPopulationRatio: Number(maxRatio.toFixed(2)),
    reproductionFactor: Number(fr.toFixed(2)),
    summaryInterpretation,
    recommendedActions: actions,
    mode: 'local',
    hasData: true,
  };
}
