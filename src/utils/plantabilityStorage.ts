import {
  PropertyField,
  PlanterEquipment,
  SeedBatch,
  SeedingConfig,
  PlantabilitySamplingPoint,
  EnvironmentalConditions,
  PlantabilityPhoto,
  ComponentMaintenanceStatus
} from '../types/plantability';

const STORAGE_KEYS = {
  FIELDS: 'geaagro_plantability_fields_v1',
  PLANTERS: 'geaagro_plantability_planters_v1',
  SEEDS: 'geaagro_plantability_seeds_v1',
  CONFIGS: 'geaagro_plantability_configs_v1',
  SAMPLINGS: 'geaagro_plantability_samplings_v1',
  ENVIRONMENTS: 'geaagro_plantability_environments_v1',
  PHOTOS: 'geaagro_plantability_photos_v1',
  MAINTENANCE: 'geaagro_plantability_maintenance_v1'
};

// Clean Production Storage Layer (No Mock Data)
export function loadPropertyFields(): PropertyField[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FIELDS);
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed.filter(f => f && typeof f === 'object' && f.id) : [];
  } catch (e) {
    return [];
  }
}
export const loadPlantabilityFields = loadPropertyFields;

export function savePropertyField(field: PropertyField): void {
  if (!field || !field.id) return;
  const current = loadPropertyFields();
  const index = current.findIndex(f => f?.id === field.id);
  if (index >= 0) {
    current[index] = field;
  } else {
    current.push(field);
  }
  localStorage.setItem(STORAGE_KEYS.FIELDS, JSON.stringify(current));
}
export const savePlantabilityFields = (fields: PropertyField[]) => {
  localStorage.setItem(STORAGE_KEYS.FIELDS, JSON.stringify((fields || []).filter(f => f && f.id)));
};

export function loadPlanters(): PlanterEquipment[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PLANTERS);
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed.filter(p => p && typeof p === 'object' && p.id) : [];
  } catch (e) {
    return [];
  }
}
export const loadPlanterEquipment = loadPlanters;

export function savePlanter(planter: PlanterEquipment): void {
  if (!planter || !planter.id) return;
  const current = loadPlanters();
  const index = current.findIndex(p => p?.id === planter.id);
  if (index >= 0) {
    current[index] = planter;
  } else {
    current.push(planter);
  }
  localStorage.setItem(STORAGE_KEYS.PLANTERS, JSON.stringify(current));
}
export const savePlanterEquipment = (planters: PlanterEquipment[]) => {
  localStorage.setItem(STORAGE_KEYS.PLANTERS, JSON.stringify((planters || []).filter(p => p && p.id)));
};

export function loadSeedBatches(): SeedBatch[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SEEDS);
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed.filter(s => s && typeof s === 'object' && s.id) : [];
  } catch (e) {
    return [];
  }
}

export function saveSeedBatch(seed: SeedBatch): void {
  if (!seed || !seed.id) return;
  const current = loadSeedBatches();
  const index = current.findIndex(s => s?.id === seed.id);
  if (index >= 0) {
    current[index] = seed;
  } else {
    current.push(seed);
  }
  localStorage.setItem(STORAGE_KEYS.SEEDS, JSON.stringify(current));
}

export function saveSeedBatches(seeds: SeedBatch[]): void {
  localStorage.setItem(STORAGE_KEYS.SEEDS, JSON.stringify((seeds || []).filter(s => s && s.id)));
}

export function loadSeedingConfigs(): SeedingConfig[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CONFIGS);
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed.filter(c => c && typeof c === 'object' && c.id) : [];
  } catch (e) {
    return [];
  }
}

export function saveSeedingConfig(cfg: SeedingConfig): void {
  if (!cfg || !cfg.id) return;
  const current = loadSeedingConfigs();
  const index = current.findIndex(c => c?.id === cfg.id);
  if (index >= 0) {
    current[index] = cfg;
  } else {
    current.push(cfg);
  }
  localStorage.setItem(STORAGE_KEYS.CONFIGS, JSON.stringify(current));
}

export function saveSeedingConfigs(configs: SeedingConfig[]): void {
  localStorage.setItem(STORAGE_KEYS.CONFIGS, JSON.stringify((configs || []).filter(c => c && c.id)));
}

export function loadSamplingPoints(): PlantabilitySamplingPoint[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SAMPLINGS);
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed.filter(s => s && typeof s === 'object' && s.id) : [];
  } catch (e) {
    return [];
  }
}

export function saveSamplingPoint(sp: PlantabilitySamplingPoint): void {
  if (!sp || !sp.id) return;
  const current = loadSamplingPoints();
  const index = current.findIndex(s => s?.id === sp.id);
  if (index >= 0) {
    current[index] = sp;
  } else {
    current.push(sp);
  }
  localStorage.setItem(STORAGE_KEYS.SAMPLINGS, JSON.stringify(current));
}

export function saveSamplingPoints(samplings: PlantabilitySamplingPoint[]): void {
  localStorage.setItem(STORAGE_KEYS.SAMPLINGS, JSON.stringify((samplings || []).filter(s => s && s.id)));
}

export function loadEnvironmentalConditions(): EnvironmentalConditions[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ENVIRONMENTS);
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed.filter(e => e && typeof e === 'object' && e.id) : [];
  } catch (e) {
    return [];
  }
}

export function saveEnvironmentalConditions(envs: EnvironmentalConditions[]): void {
  localStorage.setItem(STORAGE_KEYS.ENVIRONMENTS, JSON.stringify((envs || []).filter(e => e && e.id)));
}

export function loadPhotos(): PlantabilityPhoto[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PHOTOS);
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed.filter(p => p && typeof p === 'object' && p.id) : [];
  } catch (e) {
    return [];
  }
}
export const loadPlantabilityPhotos = loadPhotos;

export function savePhoto(photo: PlantabilityPhoto): void {
  if (!photo || !photo.id) return;
  const current = loadPhotos();
  const index = current.findIndex(p => p?.id === photo.id);
  if (index >= 0) {
    current[index] = photo;
  } else {
    current.push(photo);
  }
  localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(current));
}

export function savePlantabilityPhotos(photos: PlantabilityPhoto[]): void {
  localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify((photos || []).filter(p => p && p.id)));
}

export function loadMaintenanceStatus(): ComponentMaintenanceStatus[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MAINTENANCE);
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed.filter(m => m && typeof m === 'object' && m.id) : [];
  } catch (e) {
    return [];
  }
}
export const loadMaintenanceLogs = loadMaintenanceStatus;

export function saveMaintenanceStatus(maint: ComponentMaintenanceStatus): void {
  if (!maint || !maint.id) return;
  const current = loadMaintenanceStatus();
  const index = current.findIndex(m => m?.id === maint.id);
  if (index >= 0) {
    current[index] = maint;
  } else {
    current.push(maint);
  }
  localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(current));
}

export function saveMaintenanceLogs(logs: ComponentMaintenanceStatus[]): void {
  localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify((logs || []).filter(m => m && m.id)));
}

export function clearAllPlantabilityData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}
