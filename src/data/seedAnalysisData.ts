import {
  SeedSpeciesRAS,
  SeedLot,
  SeedClass,
  IQSClassification,
  RegulatoryProfilePreset,
  RegulatoryProfileId,
  GerminationRepetition,
} from '../types/seedAnalysis';

export const SEED_SPECIES_RAS_CATALOG: SeedSpeciesRAS[] = [
  {
    id: 'soja',
    commonName: 'Soja',
    scientificName: 'Glycine max (L.) Merrill',
    family: 'Fabaceae',
    substrate: 'RP (Rolo de Papel) ou EA (Entre Areia)',
    temperatureC: '25°C constante ou 20-30°C alternada',
    firstCountDays: 5,
    finalCountDays: 8,
    dormancyMethods: 'Geralmente nula; pré-resfriamento a 5-10°C por 3 dias se necessário',
    minGerminationOfficialPct: 80,
    minPurityOfficialPct: 98,
    maxMoistureOfficialPct: 12.5,
    defaultPmsG: 165,
    seedType: 'Dicotiledônea (Exoalbuminosa)',
    morphology: 'Semente esférica a oval, hilo pronunciado, tegumento espesso. Cotilédones representam >90% da massa seca.',
    avgWeightG: 0.165,
    color: 'Amarela, com hilo marrom, preto ou incolor',
    shape: 'Esférica / Oval',
    longevity: 'Média (1 a 3 anos sob refrigeração)',
  },
  {
    id: 'milho',
    commonName: 'Milho',
    scientificName: 'Zea mays L.',
    family: 'Poaceae',
    substrate: 'RP (Rolo de Papel) ou EA (Entre Areia)',
    temperatureC: '25°C constante ou 20-30°C',
    firstCountDays: 4,
    finalCountDays: 7,
    dormancyMethods: 'Nenhuma exigência de quebra',
    minGerminationOfficialPct: 85,
    minPurityOfficialPct: 98,
    maxMoistureOfficialPct: 13.0,
    defaultPmsG: 340,
    seedType: 'Monocotiledônea (Endospérmica)',
    morphology: 'Cariopse, pericarpo fundido ao tegumento. Endosperma abundante (amiláceo/córneo).',
    avgWeightG: 0.34,
    color: 'Amarela, laranja ou branca',
    shape: 'Dentada, dura ou achatada',
    longevity: 'Média/Alta (3 a 5 anos sob refrigeração)',
  },
  {
    id: 'algodao',
    commonName: 'Algodoeiro',
    scientificName: 'Gossypium hirsutum L.',
    family: 'Malvaceae',
    substrate: 'RP (Rolo de Papel) ou EA (Entre Areia)',
    temperatureC: '20-30°C ou 25°C',
    firstCountDays: 4,
    finalCountDays: 12,
    dormancyMethods: 'Deslintamento químico com H₂SO₄ e pré-aquecimento a 40°C',
    minGerminationOfficialPct: 75,
    minPurityOfficialPct: 98,
    maxMoistureOfficialPct: 10.0,
    defaultPmsG: 110,
    seedType: 'Dicotiledônea (Endospérmica)',
    morphology: 'Semente de formato oval a piriforme. Embrião curvo, cotilédones glandulares.',
    avgWeightG: 0.11,
    color: 'Marrom-escura (pós-deslintamento)',
    shape: 'Piriforme',
    longevity: 'Média a longa',
  },
  {
    id: 'trigo',
    commonName: 'Trigo',
    scientificName: 'Triticum aestivum L.',
    family: 'Poaceae',
    substrate: 'RP (Rolo de Papel) ou SP (Sobre Papel)',
    temperatureC: '20°C constante',
    firstCountDays: 4,
    finalCountDays: 8,
    dormancyMethods: 'Pré-resfriamento a 5-10°C por 5 dias ou secagem prévia a 35°C',
    minGerminationOfficialPct: 80,
    minPurityOfficialPct: 98,
    maxMoistureOfficialPct: 13.0,
    defaultPmsG: 38,
    seedType: 'Monocotiledônea (Endospérmica)',
    morphology: 'Cariopse sulcada ventralmente com tufo piloso apical e embrião basal lateral.',
    avgWeightG: 0.038,
    color: 'Âmbar clara a avermelhada',
    shape: 'Oval alongada com sulco',
    longevity: 'Média/Alta (2 a 4 anos)',
  },
  {
    id: 'feijao',
    commonName: 'Feijão',
    scientificName: 'Phaseolus vulgaris L.',
    family: 'Fabaceae',
    substrate: 'RP (Rolo de Papel) ou EA (Entre Areia)',
    temperatureC: '25°C constante ou 20-30°C',
    firstCountDays: 5,
    finalCountDays: 9,
    dormancyMethods: 'Geralmente nula; escarificação leve em lotes com tegumento duro',
    minGerminationOfficialPct: 80,
    minPurityOfficialPct: 98,
    maxMoistureOfficialPct: 12.0,
    defaultPmsG: 245,
    seedType: 'Dicotiledônea (Exoalbuminosa)',
    morphology: 'Semente reniforme com hilo elíptico e micrópila visível; tegumento fino sensível a impacto.',
    avgWeightG: 0.245,
    color: 'Carioca, preto, vermelho ou branco',
    shape: 'Reniforme',
    longevity: 'Curta a média (1 a 2 anos)',
  },
  {
    id: 'sorgo',
    commonName: 'Sorgo',
    scientificName: 'Sorghum bicolor (L.) Moench',
    family: 'Poaceae',
    substrate: 'RP (Rolo de Papel) ou SP (Sobre Papel)',
    temperatureC: '20-30°C alternada ou 25°C',
    firstCountDays: 4,
    finalCountDays: 10,
    dormancyMethods: 'Pré-resfriamento a 5-10°C por 5 dias quando recém-colhido',
    minGerminationOfficialPct: 80,
    minPurityOfficialPct: 98,
    maxMoistureOfficialPct: 12.5,
    defaultPmsG: 28,
    seedType: 'Monocotiledônea (Endospérmica)',
    morphology: 'Cariopse globosa a elíptica, endosperma vítreo/farinhoso e pericarpo fino.',
    avgWeightG: 0.028,
    color: 'Avermelhada, bronze, amarela ou branca',
    shape: 'Globosa',
    longevity: 'Média (2 a 3 anos)',
  },
];

export const REGULATORY_PROFILES: Record<RegulatoryProfileId, RegulatoryProfilePreset> = {
  laboratorio: {
    id: 'laboratorio',
    label: 'Laboratório de Análise (RAS/MAPA)',
    shortLabel: 'Laboratório',
    description: 'Critérios oficiais RAS/MAPA para emissão de Boletim de Análise de Sementes.',
    thresholds: {
      moistureLimit: 12.5,
      minGermination: 80,
      maxMechanicalDamage: 5.0,
      minVigor: 80,
      minPurity: 98.0,
    },
  },
  sementeira: {
    id: 'sementeira',
    label: 'Empresa Sementeira / UBS',
    shortLabel: 'Sementeira',
    description: 'Padrão comercial rigoroso de controle interno de qualidade na UBS.',
    thresholds: {
      moistureLimit: 12.0,
      minGermination: 85,
      maxMechanicalDamage: 4.0,
      minVigor: 85,
      minPurity: 98.5,
    },
  },
  produtor: {
    id: 'produtor',
    label: 'Produtor Rural',
    shortLabel: 'Produtor',
    description: 'Critérios operacionais para decisão de semeadura e ajuste de população.',
    thresholds: {
      moistureLimit: 13.0,
      minGermination: 80,
      maxMechanicalDamage: 7.0,
      minVigor: 75,
      minPurity: 97.0,
    },
  },
  pesquisa: {
    id: 'pesquisa',
    label: 'Instituição de Pesquisa',
    shortLabel: 'Pesquisa',
    description: 'Padrão de alta precisão fisiológica para ensaios e melhoramento.',
    thresholds: {
      moistureLimit: 11.5,
      minGermination: 90,
      maxMechanicalDamage: 3.0,
      minVigor: 90,
      minPurity: 99.0,
    },
  },
};

export interface IQSBreakdown {
  score: number;
  classification: IQSClassification;
  components: {
    germination: number;
    vigor: number;
    purity: number;
    sanitary: number;
    moisture: number;
    integrity: number;
  };
}

export function calculateIQS(lot: {
  germinationPct: number;
  vigorTzPct: number;
  purityPct: number;
  moisturePct: number;
  idealMoisturePct: number;
  stinkbugDamagePct: number;
  mechanicalDamagePct: number;
  pathogenIncidencePct: number;
}): IQSBreakdown {
  const clampPct = (v: number) => Math.min(100, Math.max(0, Number.isFinite(v) ? v : 0));
  const germScore = (clampPct(lot.germinationPct) / 100) * 30;
  const vigorScore = (clampPct(lot.vigorTzPct) / 100) * 30;
  const purityScore = (clampPct(lot.purityPct) / 100) * 15;
  const healthScore = Math.max(0, (100 - clampPct(lot.pathogenIncidencePct)) / 100) * 10;
  const moistureDiff = Math.abs((lot.moisturePct || 0) - (lot.idealMoisturePct || 12));
  const moistureScore = Math.max(0, 1 - moistureDiff / 5) * 10;
  const integrityPenalty = Math.max(0, lot.mechanicalDamagePct * 3 + lot.stinkbugDamagePct * 3);
  const integrityScore = Math.max(0, (100 - integrityPenalty) / 100) * 5;

  const totalScore = Math.min(
    100,
    Math.max(10, Math.round(germScore + vigorScore + purityScore + healthScore + moistureScore + integrityScore))
  );

  let classification: IQSClassification = 'Reprovado';
  if (totalScore >= 90) classification = 'Excelente';
  else if (totalScore >= 80) classification = 'Muito Bom';
  else if (totalScore >= 70) classification = 'Bom';
  else if (totalScore >= 60) classification = 'Regular';

  return {
    score: totalScore,
    classification,
    components: {
      germination: Math.round(germScore * 10) / 10,
      vigor: Math.round(vigorScore * 10) / 10,
      purity: Math.round(purityScore * 10) / 10,
      sanitary: Math.round(healthScore * 10) / 10,
      moisture: Math.round(moistureScore * 10) / 10,
      integrity: Math.round(integrityScore * 10) / 10,
    },
  };
}

export function getLotPathogenMaxIncidence(lot: SeedLot): number {
  if (!lot.sanitaryQuality?.length) return 0;
  return Math.max(...lot.sanitaryQuality.map((p) => p.incidencePct || 0));
}

export function recalculateSeedLot(lot: SeedLot): SeedLot {
  const species =
    SEED_SPECIES_RAS_CATALOG.find((s) => s.id === lot.speciesId) || SEED_SPECIES_RAS_CATALOG[0];
  const maxPathogenIncidence = getLotPathogenMaxIncidence(lot);

  const iqs = calculateIQS({
    germinationPct: lot.germination.finalGerminationPct,
    vigorTzPct: lot.vigor.tetrazoliumVigorPct,
    purityPct: lot.physicalQuality.purityPct,
    moisturePct: lot.moisture.moisturePct,
    idealMoisturePct: species.maxMoistureOfficialPct - 0.5,
    stinkbugDamagePct: lot.physicalQuality.stinkbugDamagePct,
    mechanicalDamagePct: lot.physicalQuality.mechanicalDamageHypochloritePct,
    pathogenIncidencePct: maxPathogenIncidence,
  });

  const vigorPotential = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        (lot.vigor.tetrazoliumVigorPct * 0.5 +
          lot.vigor.acceleratedAgingPct * 0.3 +
          lot.vigor.fieldEmergencePct * 0.2)
      )
    )
  );

  return {
    ...lot,
    iqsScore: iqs.score,
    iqsClassification: iqs.classification,
    germinationPotentialPct: Math.round(lot.germination.finalGerminationPct),
    vigorPotentialPct: vigorPotential || Math.round(lot.vigor.tetrazoliumVigorPct),
  };
}

export function computeGerminationStats(repetitions: GerminationRepetition[]) {
  if (!repetitions.length) {
    return {
      normalAvg: 0,
      abnormalAvg: 0,
      deadAvg: 0,
      hardAvg: 0,
      dormantAvg: 0,
      stdDev: 0,
    };
  }
  const pctList = repetitions.map((r) => {
    const total = r.seedCount > 0 ? r.seedCount : 100;
    return {
      normal: (r.normalSeedlings / total) * 100,
      abnormal: (r.abnormalSeedlings / total) * 100,
      dead: (r.deadSeeds / total) * 100,
      hard: (r.hardSeeds / total) * 100,
      dormant: (r.dormantSeeds / total) * 100,
    };
  });
  const avg = (vals: number[]) =>
    Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;

  const normalAvg = avg(pctList.map((p) => p.normal));
  const variance =
    pctList.reduce((acc, p) => acc + Math.pow(p.normal - normalAvg, 2), 0) / pctList.length;

  return {
    normalAvg,
    abnormalAvg: avg(pctList.map((p) => p.abnormal)),
    deadAvg: avg(pctList.map((p) => p.dead)),
    hardAvg: avg(pctList.map((p) => p.hard)),
    dormantAvg: avg(pctList.map((p) => p.dormant)),
    stdDev: Math.round(Math.sqrt(variance) * 10) / 10,
  };
}

export interface NewSeedLotInput {
  lotNumber: string;
  speciesId: string;
  cultivar: string;
  seedClass: SeedClass;
  cropSeason: string;
  client: string;
  farm: string;
  technicalResponsible: string;
  totalWeightKg: number;
  bagWeightKg: number;
  germinationPct: number;
  vigorTzPct: number;
  purityPct: number;
  moisturePct: number;
  mechanicalDamagePct: number;
}

export function createSeedLotFromInput(input: NewSeedLotInput): SeedLot {
  const species =
    SEED_SPECIES_RAS_CATALOG.find((s) => s.id === input.speciesId) || SEED_SPECIES_RAS_CATALOG[0];
  const today = new Date().toISOString().split('T')[0];
  const nextAnalysis = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const id = `lot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const internalCode = `GEA-${species.id.slice(0, 3).toUpperCase()}-${String(Date.now()).slice(-5)}`;
  const bagWeight = input.bagWeightKg > 0 ? input.bagWeightKg : 40;
  const totalWeight = Math.max(0, input.totalWeightKg);
  const totalBags = bagWeight > 0 ? Math.round(totalWeight / bagWeight) : 0;

  const germInt = Math.min(100, Math.max(0, Math.round(input.germinationPct)));
  const abnormal = Math.min(100 - germInt, Math.max(0, Math.round((100 - germInt) * 0.45)));
  const dead = Math.max(0, 100 - germInt - abnormal);
  const defaultReps: GerminationRepetition[] = [1, 2, 3, 4].map((repNumber) => ({
    repNumber,
    seedCount: 100,
    normalSeedlings: germInt,
    abnormalSeedlings: abnormal,
    deadSeeds: dead,
    hardSeeds: 0,
    dormantSeeds: 0,
  }));

  const rawLot: SeedLot = {
    id,
    internalCode,
    lotNumber: input.lotNumber.trim(),
    speciesId: species.id,
    speciesName: species.commonName,
    cultivar: input.cultivar.trim() || 'Cultivar Padrão',
    hybrid: '',
    seedClass: input.seedClass,
    category: input.seedClass,
    cropSeason: input.cropSeason.trim() || '2025/2026',
    productionDate: today,
    originProducer: input.client.trim() || 'Produtor não informado',
    originFarm: input.farm.trim() || 'Fazenda não informada',
    processingPlant: 'UBS Principal',
    totalWeightKg: totalWeight,
    totalBags,
    bagWeightKg: bagWeight,
    reception: {
      company: input.client.trim() || 'Laboratório Interno',
      client: input.client.trim() || 'Cliente não informado',
      farm: input.farm.trim() || 'Origem não informada',
      technicalResponsible: input.technicalResponsible.trim() || 'Responsável Técnico',
      sampleNumber: `AM-${String(Date.now()).slice(-4)}`,
      receiptDate: today,
      quantitySentKg: 1.5,
      collectorName: input.technicalResponsible.trim() || 'Amostrador',
      photos: [],
    },
    storage: {
      locationName: 'Câmara Fria 01',
      storageType: 'Câmara Fria Climatizada',
      temperatureC: 15,
      relativeHumidityPct: 55,
      ventilation: 'Forçada controlada',
      packagingType: 'Big Bag Impermeável',
      stackingLayers: 3,
      palletsInfo: 'Pallets de madeira tratada (15 cm do piso)',
      entryDate: today,
      nextAnalysisDate: nextAnalysis,
      daysInStorage: 0,
      estimatedShelfLifeMonths: 12,
    },
    treatment: [],
    physicalQuality: {
      purityPct: input.purityPct,
      inertMaterialPct: Math.max(0, Math.round((100 - input.purityPct) * 100) / 100),
      otherSeedsPct: 0,
      brokenSeedsPct: Math.round(input.mechanicalDamagePct * 0.4 * 10) / 10,
      crackedSeedsPct: Math.round(input.mechanicalDamagePct * 0.6 * 10) / 10,
      shriveledSeedsPct: 0.5,
      mechanicalDamageHypochloritePct: input.mechanicalDamagePct,
      stinkbugDamagePct: 0.5,
      weatheringDamagePct: 1.0,
      pmsG: species.defaultPmsG,
      hectoliterWeightKgHl: species.id === 'trigo' ? 78 : 72,
      screenUniformityPct: 92,
    },
    germination: {
      installationDate: today,
      firstCountDate: today,
      finalCountDate: today,
      substrateUsed: species.substrate,
      temperatureC: 25,
      repetitions: defaultReps,
      firstCountPct: Math.max(0, germInt - 4),
      finalGerminationPct: input.germinationPct,
      normalSeedlingsAvgPct: germInt,
      abnormalSeedlingsAvgPct: abnormal,
      deadSeedsAvgPct: dead,
      hardSeedsAvgPct: 0,
      dormantSeedsAvgPct: 0,
      standardDeviation: 0,
    },
    vigor: {
      acceleratedAgingPct: Math.max(0, Math.round(input.vigorTzPct - 2)),
      electricalConductivityUscmG: input.vigorTzPct >= 85 ? 58 : input.vigorTzPct >= 75 ? 74 : 96,
      tetrazoliumViabilityPct: Math.min(100, Math.round(input.germinationPct + 2)),
      tetrazoliumVigorPct: input.vigorTzPct,
      tetrazoliumMechanicalDamagePct: input.mechanicalDamagePct,
      tetrazoliumStinkbugDamagePct: 0.5,
      tetrazoliumWeatherDamagePct: 1.0,
      coldTestPct: Math.max(0, Math.round(input.vigorTzPct - 3)),
      sandEmergencePct: Math.max(0, Math.round(input.germinationPct - 2)),
      fieldEmergencePct: Math.max(0, Math.round(input.vigorTzPct - 4)),
      ivgIndex: 18.4,
      rootLengthCm: 11.2,
      shootLengthCm: 8.6,
      seedlingDryMassMg: 42.5,
    },
    moisture: {
      method: 'Estufa 105°C (24h)',
      initialWeightG: 5.0,
      finalWeightG: Math.round(5.0 * (1 - input.moisturePct / 100) * 1000) / 1000,
      moisturePct: input.moisturePct,
      temperatureC: 25,
      date: today,
    },
    sanitaryQuality: [],
    iqsScore: 0,
    iqsClassification: 'Regular',
    timeline: [
      {
        date: today,
        stage: 'Recepção',
        title: 'Amostra registrada no laboratório',
        description: `Lote ${input.lotNumber.trim()} (${species.commonName} — ${input.cultivar.trim() || 'Padrão'}) recebido para avaliação física e fisiológica.`,
      },
    ],
    physiologicalAgeDays: 0,
    germinationPotentialPct: Math.round(input.germinationPct),
    vigorPotentialPct: Math.round(input.vigorTzPct),
  };

  return recalculateSeedLot(rawLot);
}

export const INITIAL_SEED_LOTS: SeedLot[] = [];
