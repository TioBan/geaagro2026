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
export const INITIAL_SEED_LOTS: SeedLot[] = [];
