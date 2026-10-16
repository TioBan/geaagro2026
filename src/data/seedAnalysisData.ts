import {
  SeedSpeciesRAS,
  SeedLot,
  IQSClassification,
  ExpertSystemRule
} from '../types/seedAnalysis';

// 1. RAS (Regras para Análise de Sementes) & Biblioteca Tecnológica Catalog
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
    shape: 'Esférica/Oval',
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
    avgWeightG: 0.340,
    color: 'Amarela, Laranja, Branca',
    shape: 'Dentada, Dura ou Achatada',
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
    dormancyMethods: 'Deslintamento químico com H₂SO₄ e pré-aquecimento 40°C',
    minGerminationOfficialPct: 75,
    minPurityOfficialPct: 98,
    maxMoistureOfficialPct: 10.0,
    defaultPmsG: 110,
    seedType: 'Dicotiledônea (Endospérmica)',
    morphology: 'Semente de formato oval a piriforme. Embrião curvo, cotilédones glandulares.',
    avgWeightG: 0.110,
    color: 'Marrom-escura (pós-deslintamento)',
    shape: 'Piriforme',
    longevity: 'Média a Longa',
  }
];

// 2. Expert System Rules Database (Sistema Especialista Sem IA)
export const EXPERT_RULES: ExpertSystemRule[] = [
  {
    id: 'rule-moisture-soja',
    parameter: 'moisturePct',
    condition: '>',
    threshold: 12.5,
    alertMessage: 'Umidade acima do limite crítico (12.5%).',
    recommendation: 'Reduzir umidade imediata para evitar deterioração por patógenos (fungos de armazenamento) e perda de vigor.',
    severity: 'critical'
  },
  {
    id: 'rule-germination-low',
    parameter: 'germinationPct',
    condition: '<',
    threshold: 80,
    alertMessage: 'Germinação abaixo do padrão legal MAPA.',
    recommendation: 'Lote não apto para comercialização. Avaliar possibilidade de rebeneficiamento na mesa densimétrica.',
    severity: 'critical'
  },
  {
    id: 'rule-vigor-mechanical',
    parameter: 'mechanicalDamagePct',
    condition: '>',
    threshold: 5,
    alertMessage: 'Alto índice de dano mecânico detectado.',
    recommendation: 'Revisar regulagens de colhedora, velocidade do cilindro trilhador e quedas nos elevadores (UBS).',
    severity: 'warning'
  }
];

// 3. IQS Calculation Algorithm
export function calculateIQS(lot: {
  germinationPct: number;
  vigorTzPct: number;
  purityPct: number;
  moisturePct: number;
  idealMoisturePct: number;
  stinkbugDamagePct: number;
  mechanicalDamagePct: number;
  pathogenIncidencePct: number;
}): { score: number; classification: IQSClassification } {
  const germScore = (lot.germinationPct / 100) * 30;
  const vigorScore = (lot.vigorTzPct / 100) * 30;
  const purityScore = (lot.purityPct / 100) * 15;
  const healthScore = Math.max(0, (100 - lot.pathogenIncidencePct) / 100) * 10;
  const moistureDiff = Math.abs(lot.moisturePct - lot.idealMoisturePct);
  const moistureScore = Math.max(0, (1 - moistureDiff / 5)) * 10;
  const integrityScore = Math.max(0, (100 - (lot.mechanicalDamagePct * 3 + lot.stinkbugDamagePct * 3)) / 100) * 5;

  const totalScore = Math.min(100, Math.max(10, Math.round(germScore + vigorScore + purityScore + healthScore + moistureScore + integrityScore)));

  let classification: IQSClassification = 'Reprovado';
  if (totalScore >= 90) classification = 'Excelente';
  else if (totalScore >= 80) classification = 'Muito Bom';
  else if (totalScore >= 70) classification = 'Bom';
  else if (totalScore >= 60) classification = 'Regular';

  return { score: totalScore, classification };
}

// 4. Initial Detailed Seed Lots (Clean State with Representative Data)
export const INITIAL_SEED_LOTS: SeedLot[] = [
  {
    id: 'lot-soja-2024-01',
    internalCode: 'SLP-BR-2024-001',
    lotNumber: 'LT-SJ-2024-8841',
    speciesId: 'soja',
    speciesName: 'Soja',
    cultivar: 'BRS 5440IPRO',
    hybrid: 'Intacta RR2 PRO',
    seedClass: 'C1',
    category: 'Certificada 1',
    cropSeason: '2024/2025',
    productionDate: '2024-04-15',
    originProducer: 'Sementes Progresso Agro',
    originFarm: 'Fazenda Santa Maria - Campo Verde/MT',
    processingPlant: 'UBS Unidade Matriz 01',
    totalWeightKg: 40000,
    totalBags: 800,
    bagWeightKg: 50,
    reception: {
      company: 'Sementes Progresso Agro S.A.',
      client: 'Agropecuária Centro-Oeste Ltda',
      farm: 'Fazenda Santa Maria - Talhão 12',
      technicalResponsible: 'Dra. Camila Nogueira - Engª Agrônoma CREA-MT 14.892/D',
      sampleNumber: 'AMO-2024-9912',
      receiptDate: '2024-05-10',
      quantitySentKg: 2.5,
      collectorName: 'Marcos Vinícius Silva (Amostrador Credenciado)',
      photos: []
    },
    storage: {
      locationName: 'Câmara Climatizada 03 - Silo Matriz',
      storageType: 'Câmara Fria Climatizada',
      temperatureC: 12.5,
      relativeHumidityPct: 55,
      ventilation: 'Ar forçado com desumidificador contínuo',
      packagingType: 'Big Bag Impermeável',
      stackingLayers: 3,
      palletsInfo: 'Paletes de madeira tratada com ventilação inferior',
      entryDate: '2024-05-12',
      nextAnalysisDate: '2024-11-12',
      daysInStorage: 45,
      estimatedShelfLifeMonths: 18
    },
    treatment: [
      {
        productName: 'Fortenza Duo + Cruiser + Maxim Advanced',
        targetCategory: 'Inseticida',
        activeIngredient: 'Ciantraniliprole + Tiametoxam + Fludioxonil + Metalaxil-M',
        dosePer100kg: '300 mL / 100 kg',
        caldaVolumeLPerTon: 6.0,
        treatmentDate: '2024-05-15',
        operatorName: 'Rodrigo Medeiros',
        dryingTimeHours: 1.5,
        curingTimeDays: 7,
        coverageUniformityPct: 98.2
      }
    ],
    physicalQuality: {
      purityPct: 99.4,
      inertMaterialPct: 0.4,
      otherSeedsPct: 0.2,
      brokenSeedsPct: 0.8,
      crackedSeedsPct: 0.5,
      shriveledSeedsPct: 0.3,
      mechanicalDamageHypochloritePct: 2.1,
      stinkbugDamagePct: 1.4,
      weatheringDamagePct: 0.9,
      pmsG: 168.5,
      hectoliterWeightKgHl: 78.4,
      screenUniformityPct: 96.5
    },
    germination: {
      installationDate: '2024-05-16',
      firstCountDate: '2024-05-21',
      finalCountDate: '2024-05-24',
      substrateUsed: 'RP (Rolo de Papel Germitest umedecido 2.5x)',
      temperatureC: 25,
      repetitions: [
        { repNumber: 1, seedCount: 50, normalSeedlings: 47, abnormalSeedlings: 2, deadSeeds: 1, hardSeeds: 0, dormantSeeds: 0 },
        { repNumber: 2, seedCount: 50, normalSeedlings: 48, abnormalSeedlings: 1, deadSeeds: 1, hardSeeds: 0, dormantSeeds: 0 },
        { repNumber: 3, seedCount: 50, normalSeedlings: 46, abnormalSeedlings: 3, deadSeeds: 1, hardSeeds: 0, dormantSeeds: 0 },
        { repNumber: 4, seedCount: 50, normalSeedlings: 47, abnormalSeedlings: 2, deadSeeds: 1, hardSeeds: 0, dormantSeeds: 0 }
      ],
      firstCountPct: 91.0,
      finalGerminationPct: 94.0,
      normalSeedlingsAvgPct: 94.0,
      abnormalSeedlingsAvgPct: 4.0,
      deadSeedsAvgPct: 2.0,
      hardSeedsAvgPct: 0,
      dormantSeedsAvgPct: 0,
      standardDeviation: 1.2
    },
    vigor: {
      acceleratedAgingPct: 91.5,
      electricalConductivityUscmG: 68.2,
      tetrazoliumViabilityPct: 96.0,
      tetrazoliumVigorPct: 92.0,
      tetrazoliumMechanicalDamagePct: 2.0,
      tetrazoliumStinkbugDamagePct: 1.5,
      tetrazoliumWeatherDamagePct: 0.5,
      coldTestPct: 90.0,
      sandEmergencePct: 93.0,
      fieldEmergencePct: 91.0,
      ivgIndex: 18.6,
      rootLengthCm: 14.8,
      shootLengthCm: 11.2,
      seedlingDryMassMg: 42.5
    },
    moisture: {
      method: 'Estufa 105°C (24h)',
      initialWeightG: 5.0,
      finalWeightG: 4.43,
      moisturePct: 11.4,
      temperatureC: 105,
      date: '2024-05-11'
    },
    sanitaryQuality: [
      {
        id: 'san-01',
        pathogenName: 'Cercospora kikuchii',
        type: 'Fungo',
        incidencePct: 1.5,
        severity: 'Baixa',
        method: 'Blotter Test',
        notes: 'Incidência insignificante, controlável pelo TSI'
      },
      {
        id: 'san-02',
        pathogenName: 'Fusarium semitectum',
        type: 'Fungo',
        incidencePct: 0.5,
        severity: 'Baixa',
        method: 'Blotter Test',
        notes: 'Dentro dos limites de tolerância para semente C1'
      }
    ],
    iqsScore: 94,
    iqsClassification: 'Excelente',
    timeline: [
      { date: '15/04/2024', stage: 'Colheita', title: 'Colheita Mecanizada Realizada', description: 'Umidade no campo a 14.2%, velocidade reduzida do molinete.' },
      { date: '10/05/2024', stage: 'Recepção', title: 'Amostragem e Laudo Entrada', description: 'Entrada na UBS com pré-limpeza e determinação de impurezas.' },
      { date: '15/05/2024', stage: 'TSI', title: 'Tratamento Industrial de Sementes', description: 'Aplicação de fungicida, inseticida e polímero protetor.' },
      { date: '24/05/2024', stage: 'Laudo Final', title: 'Emissão de BAS e IQS 94', description: 'Lote aprovado com Germinação 94% e Vigor Tetrazólio 92%.' }
    ],
    physiologicalAgeDays: 45,
    germinationPotentialPct: 94,
    vigorPotentialPct: 92
  },
  {
    id: 'lot-milho-2024-02',
    internalCode: 'SLP-BR-2024-002',
    lotNumber: 'LT-MZ-2024-4109',
    speciesId: 'milho',
    speciesName: 'Milho',
    cultivar: 'DKB 390 PRO3',
    hybrid: 'Simples Modificado',
    seedClass: 'C1',
    category: 'Certificada 1',
    cropSeason: '2024/2025',
    productionDate: '2024-03-28',
    originProducer: 'Agropecuária Rio Formoso',
    originFarm: 'Fazenda Boa Esperança - Rio Verde/GO',
    processingPlant: 'UBS Unidade Goiás 02',
    totalWeightKg: 30000,
    totalBags: 1500,
    bagWeightKg: 20,
    reception: {
      company: 'Agropecuária Rio Formoso S.A.',
      client: 'Grupo Grãos do Sul',
      farm: 'Fazenda Boa Esperança - Pivô 04',
      technicalResponsible: 'Dr. Leonardo Rezende - Engº Agrônomo CREA-GO 28.310/D',
      sampleNumber: 'AMO-2024-4109',
      receiptDate: '2024-04-18',
      quantitySentKg: 2.0,
      collectorName: 'Felipe Santana (Amostrador)',
      photos: []
    },
    storage: {
      locationName: 'Câmara Fria Sul 02',
      storageType: 'Câmara Fria Climatizada',
      temperatureC: 10.0,
      relativeHumidityPct: 50,
      ventilation: 'Controle automatizado de CO2 e umidade',
      packagingType: 'Sacos Papel Multifolhado 40kg',
      stackingLayers: 8,
      palletsInfo: 'Paletes duplos com espaçamento lateral de 0.5m',
      entryDate: '2024-04-20',
      nextAnalysisDate: '2024-10-20',
      daysInStorage: 60,
      estimatedShelfLifeMonths: 24
    },
    treatment: [
      {
        productName: 'Maxim Quattro + Cruiser 600 FS + Vermis',
        targetCategory: 'Inseticida',
        activeIngredient: 'Fludioxonil + Metalaxil-M + Tiabendazol + Azoxistrobina + Tiametoxam',
        dosePer100kg: '250 mL / 100 kg',
        caldaVolumeLPerTon: 5.5,
        treatmentDate: '2024-04-22',
        operatorName: 'Carlos Eduardo Matos',
        dryingTimeHours: 1.0,
        curingTimeDays: 5,
        coverageUniformityPct: 99.0
      }
    ],
    physicalQuality: {
      purityPct: 99.8,
      inertMaterialPct: 0.2,
      otherSeedsPct: 0.0,
      brokenSeedsPct: 0.3,
      crackedSeedsPct: 0.2,
      shriveledSeedsPct: 0.1,
      mechanicalDamageHypochloritePct: 1.0,
      stinkbugDamagePct: 0.5,
      weatheringDamagePct: 0.4,
      pmsG: 342.0,
      hectoliterWeightKgHl: 76.0,
      screenUniformityPct: 98.0
    },
    germination: {
      installationDate: '2024-04-24',
      firstCountDate: '2024-04-28',
      finalCountDate: '2024-05-01',
      substrateUsed: 'RP (Rolo de Papel)',
      temperatureC: 25,
      repetitions: [
        { repNumber: 1, seedCount: 50, normalSeedlings: 48, abnormalSeedlings: 1, deadSeeds: 1, hardSeeds: 0, dormantSeeds: 0 },
        { repNumber: 2, seedCount: 50, normalSeedlings: 49, abnormalSeedlings: 1, deadSeeds: 0, hardSeeds: 0, dormantSeeds: 0 },
        { repNumber: 3, seedCount: 50, normalSeedlings: 48, abnormalSeedlings: 2, deadSeeds: 0, hardSeeds: 0, dormantSeeds: 0 },
        { repNumber: 4, seedCount: 50, normalSeedlings: 49, abnormalSeedlings: 0, deadSeeds: 1, hardSeeds: 0, dormantSeeds: 0 }
      ],
      firstCountPct: 94.0,
      finalGerminationPct: 97.0,
      normalSeedlingsAvgPct: 97.0,
      abnormalSeedlingsAvgPct: 2.0,
      deadSeedsAvgPct: 1.0,
      hardSeedsAvgPct: 0,
      dormantSeedsAvgPct: 0,
      standardDeviation: 0.8
    },
    vigor: {
      acceleratedAgingPct: 95.0,
      electricalConductivityUscmG: 52.0,
      tetrazoliumViabilityPct: 98.0,
      tetrazoliumVigorPct: 96.0,
      tetrazoliumMechanicalDamagePct: 1.0,
      tetrazoliumStinkbugDamagePct: 0.5,
      tetrazoliumWeatherDamagePct: 0.5,
      coldTestPct: 94.0,
      sandEmergencePct: 96.0,
      fieldEmergencePct: 95.0,
      ivgIndex: 22.4,
      rootLengthCm: 18.2,
      shootLengthCm: 14.5,
      seedlingDryMassMg: 68.0
    },
    moisture: {
      method: 'Estufa 105°C (24h)',
      initialWeightG: 5.0,
      finalWeightG: 4.39,
      moisturePct: 12.2,
      temperatureC: 105,
      date: '2024-04-19'
    },
    sanitaryQuality: [
      {
        id: 'san-03',
        pathogenName: 'Fusarium verticillioides',
        type: 'Fungo',
        incidencePct: 0.8,
        severity: 'Baixa',
        method: 'Blotter Test',
        notes: 'Incidência residual perfeitamente neutralizada pelo TSI'
      }
    ],
    iqsScore: 97,
    iqsClassification: 'Excelente',
    timeline: [
      { date: '28/03/2024', stage: 'Colheita', title: 'Colheita em Espiga', description: 'Colheita e despalha em alta umidade com secagem lenta em espigas.' },
      { date: '18/04/2024', stage: 'Recepção', title: 'Classificação por Peneiras', description: 'Classificação uniforme C2M (chato médio).' },
      { date: '22/04/2024', stage: 'TSI', title: 'Tratamento TSI Completo', description: 'Aplicação de calda fungicida e inseticida de amplo espectro.' },
      { date: '01/05/2024', stage: 'Laudo Final', title: 'Emissão de BAS e IQS 97', description: 'Lote de qualidade excelente com germinação de 97%.' }
    ],
    physiologicalAgeDays: 60,
    germinationPotentialPct: 97,
    vigorPotentialPct: 96
  }
];
