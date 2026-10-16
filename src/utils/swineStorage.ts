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
      : 2.1;

  // Average GMD and Feed Conversion from batches
  const activeBatches = batches.filter(b => b.status === 'Ativo');
  const avgDailyGainG =
    activeBatches.length > 0
      ? Math.round(
          activeBatches.reduce((acc, b) => acc + b.averageDailyGainG, 0) / activeBatches.length
        )
      : 760;

  const avgFeedConversionRatio =
    activeBatches.length > 0
      ? Number(
          (
            activeBatches.reduce((acc, b) => acc + b.feedConversionRatio, 0) /
            activeBatches.length
          ).toFixed(2)
        )
      : 2.09;

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

  const conceptionRatePct = totalIAs > 0 ? Math.min(100, Math.round((positiveDGs / totalIAs) * 100)) : 91;
  const farrowingRatePct = totalIAs > 0 ? Math.min(100, Math.round((totalPartos / Math.max(1, positiveDGs)) * 100)) : 89;

  // Weaned per sow / year standard calculation (Partos/ano 2.38 * Desmamados/parto 12.8)
  const avgWeanedPerLitter = 12.8;
  const farrowingsPerSowYear = 2.40;
  const weanedPerSowYear = Number((avgWeanedPerLitter * farrowingsPerSowYear).toFixed(1)); // ~30.7 DPA

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
    replacementRatePct: 42.5,
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
  // 1. Feed Conversion Score (CA ideal <= 2.2 in grow-finish / nursery avg) - max 25 pts
  // If CA is 2.0 -> 25pts; if 2.8 -> 10pts
  const ca = kpis.avgFeedConversionRatio;
  let feedConversionScore = Math.max(5, Math.min(25, 25 - (ca - 1.8) * 20));

  // 2. GMD Score (Ideal >= 850g/day overall) - max 20 pts
  const gmd = kpis.avgDailyGainG;
  let gmdScore = Math.max(5, Math.min(20, ((gmd - 400) / 550) * 20));

  // 3. Mortality Score (Ideal < 2.5%) - max 20 pts
  const mort = kpis.overallMortalityPct;
  let mortalityScore = Math.max(2, Math.min(20, 20 - mort * 3.5));

  // 4. Reproductive Efficiency Score (DPA ideal >= 30.0) - max 15 pts
  const dpa = kpis.weanedPerSowYear;
  let reproductiveEfficiencyScore = Math.max(3, Math.min(15, ((dpa - 22) / 10) * 15));

  // 5. Environment Comfort Score (max 10 pts)
  const shedsOk = sheds.filter(s => s.comfortStatus === 'Conforto Ótimo').length;
  const environmentComfortScore = sheds.length > 0 ? (shedsOk / sheds.length) * 10 : 8.5;

  // 6. Biosecurity Compliance Score (max 10 pts)
  const bioOk = biosecurity.filter(b => b.status === 'Conforme').length;
  const biosecurityComplianceScore = biosecurity.length > 0 ? (bioOk / biosecurity.length) * 10 : 9.0;

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
  if (feedConversionScore < 18) {
    recommendations.push('Ajustar granulometria do milho e regular comedouros para evitar desperdício de ração.');
  }
  if (gmdScore < 15) {
    recommendations.push('Verificar densidade de alojamento por baia e vazão dos bebedouros tipo chupeta.');
  }
  if (mortalityScore < 15) {
    recommendations.push('Intensificar monitoramento do colostro na primeira hora de vida e verificar temperatura das campânulas.');
  }
  if (environmentComfortScore < 8) {
    recommendations.push('Aumentar taxa de renovação de ar nos galpões para reduzir concentrações de amônia (NH₃) e CO₂.');
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

