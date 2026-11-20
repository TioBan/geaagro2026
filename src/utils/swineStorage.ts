import {
  SwineAnimal,
  SwineBatch,
  FarrowingLitter,
  SwineFeedDiet,
  SwineFeedInventoryItem,
  SwineShedEnvironment,
  SwineWaterPointCheck,
  SwineBiosecurityLog,
  SwinePhotoRecord,
  SwineIESScore,
} from '../types/swine';
import {
  DEFAULT_SWINE_ANIMALS,
  DEFAULT_SWINE_BATCHES,
  DEFAULT_FARROWING_LITTERS,
  DEFAULT_SWINE_DIETS,
  DEFAULT_SWINE_INVENTORY,
  DEFAULT_SWINE_SHEDS,
  DEFAULT_SWINE_WATER_CHECKS,
  DEFAULT_SWINE_BIOSECURITY_LOGS,
  DEFAULT_SWINE_PHOTOS,
} from '../data/swineDefaultData';

const STORAGE_KEYS = {
  ANIMALS: 'geaagro_swine_animals_v1',
  BATCHES: 'geaagro_swine_batches_v1',
  LITTERS: 'geaagro_swine_litters_v1',
  DIETS: 'geaagro_swine_diets_v1',
  INVENTORY: 'geaagro_swine_inventory_v1',
  SHEDS: 'geaagro_swine_sheds_v1',
  WATER_CHECKS: 'geaagro_swine_water_checks_v1',
  BIOSECURITY: 'geaagro_swine_biosecurity_v1',
  PHOTOS: 'geaagro_swine_photos_v1',
};

// Generic Loader
function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error);
  }
  return defaultValue;
}

// Generic Saver
function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
}

export const loadSwineAnimals = (): SwineAnimal[] =>
  loadFromStorage(STORAGE_KEYS.ANIMALS, DEFAULT_SWINE_ANIMALS);

export const saveSwineAnimals = (animals: SwineAnimal[]): void =>
  saveToStorage(STORAGE_KEYS.ANIMALS, animals);

export const loadSwineBatches = (): SwineBatch[] =>
  loadFromStorage(STORAGE_KEYS.BATCHES, DEFAULT_SWINE_BATCHES);

export const saveSwineBatches = (batches: SwineBatch[]): void =>
  saveToStorage(STORAGE_KEYS.BATCHES, batches);

export const loadFarrowingLitters = (): FarrowingLitter[] =>
  loadFromStorage(STORAGE_KEYS.LITTERS, DEFAULT_FARROWING_LITTERS);

export const saveFarrowingLitters = (litters: FarrowingLitter[]): void =>
  saveToStorage(STORAGE_KEYS.LITTERS, litters);

export const loadSwineDiets = (): SwineFeedDiet[] =>
  loadFromStorage(STORAGE_KEYS.DIETS, DEFAULT_SWINE_DIETS);

export const saveSwineDiets = (diets: SwineFeedDiet[]): void =>
  saveToStorage(STORAGE_KEYS.DIETS, diets);

export const loadSwineInventory = (): SwineFeedInventoryItem[] =>
  loadFromStorage(STORAGE_KEYS.INVENTORY, DEFAULT_SWINE_INVENTORY);

export const saveSwineInventory = (inventory: SwineFeedInventoryItem[]): void =>
  saveToStorage(STORAGE_KEYS.INVENTORY, inventory);

export const loadSwineSheds = (): SwineShedEnvironment[] =>
  loadFromStorage(STORAGE_KEYS.SHEDS, DEFAULT_SWINE_SHEDS);

export const saveSwineSheds = (sheds: SwineShedEnvironment[]): void =>
  saveToStorage(STORAGE_KEYS.SHEDS, sheds);

export const loadSwineWaterChecks = (): SwineWaterPointCheck[] =>
  loadFromStorage(STORAGE_KEYS.WATER_CHECKS, DEFAULT_SWINE_WATER_CHECKS);

export const saveSwineWaterChecks = (checks: SwineWaterPointCheck[]): void =>
  saveToStorage(STORAGE_KEYS.WATER_CHECKS, checks);

export const loadSwineBiosecurity = (): SwineBiosecurityLog[] =>
  loadFromStorage(STORAGE_KEYS.BIOSECURITY, DEFAULT_SWINE_BIOSECURITY_LOGS);

export const saveSwineBiosecurity = (logs: SwineBiosecurityLog[]): void =>
  saveToStorage(STORAGE_KEYS.BIOSECURITY, logs);

export const loadSwinePhotos = (): SwinePhotoRecord[] =>
  loadFromStorage(STORAGE_KEYS.PHOTOS, DEFAULT_SWINE_PHOTOS);

export const saveSwinePhotos = (photos: SwinePhotoRecord[]): void =>
  saveToStorage(STORAGE_KEYS.PHOTOS, photos);

export const resetSwineDataToDefaults = (): void => {
  saveSwineAnimals(DEFAULT_SWINE_ANIMALS);
  saveSwineBatches(DEFAULT_SWINE_BATCHES);
  saveFarrowingLitters(DEFAULT_FARROWING_LITTERS);
  saveSwineDiets(DEFAULT_SWINE_DIETS);
  saveSwineInventory(DEFAULT_SWINE_INVENTORY);
  saveSwineSheds(DEFAULT_SWINE_SHEDS);
  saveSwineWaterChecks(DEFAULT_SWINE_WATER_CHECKS);
  saveSwineBiosecurity(DEFAULT_SWINE_BIOSECURITY_LOGS);
  saveSwinePhotos(DEFAULT_SWINE_PHOTOS);
};

// Summary & KPI calculations
export interface SwineExecutiveKPIs {
  totalAnimals: number;
  activeSows: number; // Matrizes ativas
  activeBoars: number; // Reprodutores
  maternityPiglets: number; // Leitões na maternidade
  nurseryPiglets: number; // Leitões na creche
  growingPigs: number; // Crescimento
  finishingPigs: number; // Terminação
  overallMortalityPct: number; // Taxa de mortalidade (%)
  avgDailyGainG: number; // Ganho Médio Diário (g/dia)
  avgFeedConversionRatio: number; // Conversão Alimentar (CA)
  conceptionRatePct: number; // Taxa de concepção (%)
  farrowingRatePct: number; // Taxa de parto (%)
  weanedPerSowYear: number; // Leitões desmamados por matriz/ano (DPA)
  replacementRatePct: number; // Taxa de reposição
  pendingVaccinesCount: number;
  healthAlertsCount: number;
  criticalStockAlerts: number;
}

export function calculateSwineExecutiveKPIs(
  animals: SwineAnimal[] = [],
  batches: SwineBatch[] = [],
  litters: FarrowingLitter[] = [],
  inventory: SwineFeedInventoryItem[] = [],
  sheds: SwineShedEnvironment[] = []
): SwineExecutiveKPIs {
  // Individual animals counts
  const activeSows = animals.filter(
    a => a.category.includes('Matriz') || a.category.includes('Marrã')
  ).length;

  const activeBoars = animals.filter(
    a => a.sex === 'Cachaço (Reprodutor)' || a.category.includes('Cachaço')
  ).length;

  // Maternity piglets
  const maternityPiglets = litters.reduce(
    (acc, lit) => acc + (lit.status === 'Em Lactação' ? lit.currentPigletsCount : 0),
    0
  );

  // Batch animals counts
  const nurseryBatchAnimals = batches
    .filter(b => b.stage === 'creche' && b.status === 'Ativo')
    .reduce((acc, b) => acc + b.currentAnimalsCount, 0);

  const growingBatchAnimals = batches
    .filter(b => b.stage === 'crescimento' && b.status === 'Ativo')
    .reduce((acc, b) => acc + b.currentAnimalsCount, 0);

  const finishingBatchAnimals = batches
    .filter(b => b.stage === 'terminacao' && b.status === 'Ativo')
    .reduce((acc, b) => acc + b.currentAnimalsCount, 0);

  const totalAnimals =
    activeSows +
    activeBoars +
    maternityPiglets +
    nurseryBatchAnimals +
    growingBatchAnimals +
    finishingBatchAnimals;

  // Mortality calculation across active batches
  const totalBatchInitial = batches.reduce((acc, b) => acc + b.initialAnimalsCount, 0);
  const totalBatchDeaths = batches.reduce((acc, b) => acc + b.mortalityCount, 0);
  const preWeaningDeaths = litters.reduce((acc, l) => acc + l.preWeaningMortalityCount, 0);
  const totalLitterBorn = litters.reduce((acc, l) => acc + l.bornAlive, 0);

  const overallMortalityPct =
    totalBatchInitial + totalLitterBorn > 0
      ? Number(
          (
            ((totalBatchDeaths + preWeaningDeaths) / (totalBatchInitial + totalLitterBorn)) *
            100
          ).toFixed(1)
        )
      : 0;

  // Average GMD and Feed Conversion from batches
  const activeBatches = batches.filter(b => b.status === 'Ativo');
  const avgDailyGainG =
    activeBatches.length > 0
      ? Math.round(
          activeBatches.reduce((acc, b) => acc + b.averageDailyGainG, 0) / activeBatches.length
        )
      : 0;

  const avgFeedConversionRatio =
    activeBatches.length > 0
      ? Number(
          (
            activeBatches.reduce((acc, b) => acc + b.feedConversionRatio, 0) /
            activeBatches.length
          ).toFixed(2)
        )
      : 0;

  // Reproductive KPIs from Sow histories
  let totalIAs = 0;
  let positiveDGs = 0;
  let totalPartos = 0;
  animals.forEach(animal => {
    animal.reproductionHistory.forEach(r => {
      if (r.eventType === 'Inseminação Artificial (IA)' || r.eventType === 'Cobertura Natural') {
        totalIAs += 1;
      }
      if (r.eventType === 'Diagnóstico de Gestação (DG)' && r.dgResult === 'Positivo (Gestante)') {
        positiveDGs += 1;
      }
      if (r.eventType === 'Parto') {
        totalPartos += 1;
      }
    });
  });

  const conceptionRatePct =
    totalIAs > 0 ? Math.min(100, Math.round((positiveDGs / totalIAs) * 100)) : 0;
  const farrowingRatePct =
    positiveDGs > 0 ? Math.min(100, Math.round((totalPartos / positiveDGs) * 100)) : 0;

  // Weaned per sow / year calculated from real weaned litters (2.40 farrowings/sow/year reference)
  const weanedLitters = litters.filter(l => l.status === 'Desmamada' && (l.pigletsWeaned ?? 0) > 0);
  const activeLitters = litters.filter(l => l.currentPigletsCount > 0);
  const avgWeanedPerLitter =
    weanedLitters.length > 0
      ? weanedLitters.reduce((acc, l) => acc + (l.pigletsWeaned ?? 0), 0) / weanedLitters.length
      : activeLitters.length > 0
        ? activeLitters.reduce((acc, l) => acc + l.currentPigletsCount, 0) / activeLitters.length
        : 0;
  const weanedPerSowYear =
    avgWeanedPerLitter > 0 ? Number((avgWeanedPerLitter * 2.4).toFixed(1)) : 0;

  // Replacement rate from actual gilts / active sows ratio
  const giltsCount = animals.filter(a => a.category.includes('Marrã')).length;
  const replacementRatePct =
    activeSows > 0 ? Number(((giltsCount / activeSows) * 100).toFixed(1)) : 0;

  // Pending health and inventory alerts
  let pendingVaccinesCount = 0;
  let healthAlertsCount = 0;
  animals.forEach(a => {
    a.healthHistory.forEach(h => {
      if (h.status === 'Programado') pendingVaccinesCount += 1;
      if (h.status === 'Em Andamento') healthAlertsCount += 1;
    });
  });

  // Check sheds for gas/temp alerts
  sheds.forEach(s => {
    if (s.comfortStatus !== 'Conforto Ótimo') {
      healthAlertsCount += 1;
    }
  });

  const criticalStockAlerts = inventory.filter(i => i.currentStock <= i.minimumStock).length;

  return {
    totalAnimals,
    activeSows,
    activeBoars,
    maternityPiglets,
    nurseryPiglets: nurseryBatchAnimals,
    growingPigs: growingBatchAnimals,
    finishingPigs: finishingBatchAnimals,
    overallMortalityPct,
    avgDailyGainG,
    avgFeedConversionRatio,
    conceptionRatePct,
    farrowingRatePct,
    weanedPerSowYear,
    replacementRatePct,
    pendingVaccinesCount,
    healthAlertsCount,
    criticalStockAlerts,
  };
}

// GeaAgro Swine Efficiency Index (IES) - Proprietary Algorithm
export function calculateSwineIES(
  kpis: SwineExecutiveKPIs,
  sheds: SwineShedEnvironment[] = [],
  biosecurity: SwineBiosecurityLog[] = []
): SwineIESScore {
  const hasOperationalData =
    kpis.totalAnimals > 0 ||
    kpis.avgFeedConversionRatio > 0 ||
    kpis.avgDailyGainG > 0 ||
    kpis.weanedPerSowYear > 0 ||
    sheds.length > 0 ||
    biosecurity.length > 0;

  if (!hasOperationalData) {
    return {
      totalScore: 0,
      classification: 'Crítico',
      feedConversionScore: 0,
      gmdScore: 0,
      mortalityScore: 0,
      reproductiveEfficiencyScore: 0,
      environmentComfortScore: 0,
      biosecurityComplianceScore: 0,
      keyRecommendations: [
        'Cadastre lotes ativos, leitegadas, galpões e registros de biosseguridade para calcular o Índice IES real da granja.',
      ],
    };
  }

  // 1. Feed Conversion Score (CA ideal <= 2.2 in grow-finish / nursery avg) - max 25 pts
  const ca = kpis.avgFeedConversionRatio;
  const feedConversionScore = ca > 0 ? Math.max(5, Math.min(25, 25 - (ca - 1.8) * 20)) : 0;

  // 2. GMD Score (Ideal >= 850g/day overall) - max 20 pts
  const gmd = kpis.avgDailyGainG;
  const gmdScore = gmd > 0 ? Math.max(5, Math.min(20, ((gmd - 400) / 550) * 20)) : 0;

  // 3. Mortality Score (Ideal < 2.5%) - max 20 pts
  const mort = kpis.overallMortalityPct;
  const mortalityScore =
    kpis.totalAnimals > 0 ? Math.max(2, Math.min(20, 20 - mort * 3.5)) : 0;

  // 4. Reproductive Efficiency Score (DPA ideal >= 30.0) - max 15 pts
  const dpa = kpis.weanedPerSowYear;
  const reproductiveEfficiencyScore =
    dpa > 0 ? Math.max(3, Math.min(15, ((dpa - 22) / 10) * 15)) : 0;

  // 5. Environment Comfort Score (max 10 pts)
  const shedsOk = sheds.filter(s => s.comfortStatus === 'Conforto Ótimo').length;
  const environmentComfortScore = sheds.length > 0 ? (shedsOk / sheds.length) * 10 : 0;

  // 6. Biosecurity Compliance Score (max 10 pts)
  const bioOk = biosecurity.filter(b => b.status === 'Conforme').length;
  const biosecurityComplianceScore = biosecurity.length > 0 ? (bioOk / biosecurity.length) * 10 : 0;

  const totalScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        feedConversionScore +
          gmdScore +
          mortalityScore +
          reproductiveEfficiencyScore +
          environmentComfortScore +
          biosecurityComplianceScore
      )
    )
  );

  let classification: SwineIESScore['classification'] = 'Muito Bom';
  if (totalScore >= 90) classification = 'Excelente (Padrão Ouro)';
  else if (totalScore >= 75) classification = 'Muito Bom';
  else if (totalScore >= 60) classification = 'Regular / Atenção';
  else classification = 'Crítico';

  const recommendations: string[] = [];
  if (ca === 0) {
    recommendations.push('Cadastre lotes em Creche ou Terminação para computar Conversão Alimentar e GMD.');
  } else {
    if (feedConversionScore < 18) {
      recommendations.push('Ajustar granulometria do milho e regular comedouros para evitar desperdício de ração.');
    }
    if (gmdScore < 15) {
      recommendations.push('Verificar densidade de alojamento por baia e vazão dos bebedouros tipo chupeta.');
    }
  }
  if (kpis.totalAnimals > 0 && mortalityScore < 15) {
    recommendations.push('Intensificar monitoramento do colostro na primeira hora de vida e verificar temperatura das campânulas.');
  }
  if (sheds.length === 0) {
    recommendations.push('Registre leituras de ambiência dos galpões para pontuar conforto térmico e gases.');
  } else if (environmentComfortScore < 8) {
    recommendations.push('Aumentar taxa de renovação de ar nos galpões para reduzir concentrações de amônia (NH₃) e CO₂.');
  }
  if (biosecurity.length === 0) {
    recommendations.push('Adicione registros de auditoria na aba Biosseguridade para completar os 10 pontos do pilar.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Indicadores em padrão de excelência zootécnica. Manter protocolos de biosseguridade estrita.');
  }

  return {
    totalScore,
    classification,
    feedConversionScore: Number(feedConversionScore.toFixed(1)),
    gmdScore: Number(gmdScore.toFixed(1)),
    mortalityScore: Number(mortalityScore.toFixed(1)),
    reproductiveEfficiencyScore: Number(reproductiveEfficiencyScore.toFixed(1)),
    environmentComfortScore: Number(environmentComfortScore.toFixed(1)),
    biosecurityComplianceScore: Number(biosecurityComplianceScore.toFixed(1)),
    keyRecommendations: recommendations,
  };
}

// Storage function aliases
export const loadSwineLitters = loadFarrowingLitters;
export const saveSwineLitters = saveFarrowingLitters;
export const loadSwineWaterLogs = loadSwineWaterChecks;
export const saveSwineWaterLogs = saveSwineWaterChecks;

