import {
  BuffaloAnimal,
  BuffaloPaddock,
  BuffaloWaterPoint,
  BuffaloPharmacyItem,
  BuffaloFacility,
  BuffaloThermalWelfareIndex
} from '../types/buffalo';
import {
  INITIAL_BUFFALO_ANIMALS,
  INITIAL_BUFFALO_PADDOCKS,
  INITIAL_BUFFALO_WATER_POINTS,
  INITIAL_BUFFALO_PHARMACY,
  INITIAL_BUFFALO_FACILITIES,
  INITIAL_THERMAL_WELFARE
} from '../data/buffaloData';

const STORAGE_KEYS = {
  ANIMALS: 'geaagro_buffalo_animals_v2',
  PADDOCKS: 'geaagro_buffalo_paddocks_v2',
  WATER_POINTS: 'geaagro_buffalo_water_points_v2',
  PHARMACY: 'geaagro_buffalo_pharmacy_v2',
  FACILITIES: 'geaagro_buffalo_facilities_v2',
  THERMAL: 'geaagro_buffalo_thermal_v2'
} as const;

function readJSON<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved) as T;
  } catch (e) {
    console.warn(`Erro ao carregar ${key}:`, e);
  }
  return fallback;
}

function writeJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Erro ao salvar ${key}:`, e);
  }
}

export const loadBuffaloAnimals = (): BuffaloAnimal[] =>
  readJSON(STORAGE_KEYS.ANIMALS, INITIAL_BUFFALO_ANIMALS);

export const saveBuffaloAnimals = (animals: BuffaloAnimal[]): void =>
  writeJSON(STORAGE_KEYS.ANIMALS, animals);

export const loadBuffaloPaddocks = (): BuffaloPaddock[] =>
  readJSON(STORAGE_KEYS.PADDOCKS, INITIAL_BUFFALO_PADDOCKS);

export const saveBuffaloPaddocks = (paddocks: BuffaloPaddock[]): void =>
  writeJSON(STORAGE_KEYS.PADDOCKS, paddocks);

export const loadBuffaloWaterPoints = (): BuffaloWaterPoint[] =>
  readJSON(STORAGE_KEYS.WATER_POINTS, INITIAL_BUFFALO_WATER_POINTS);

export const saveBuffaloWaterPoints = (waterPoints: BuffaloWaterPoint[]): void =>
  writeJSON(STORAGE_KEYS.WATER_POINTS, waterPoints);

export const loadBuffaloPharmacy = (): BuffaloPharmacyItem[] =>
  readJSON(STORAGE_KEYS.PHARMACY, INITIAL_BUFFALO_PHARMACY);

export const saveBuffaloPharmacy = (pharmacy: BuffaloPharmacyItem[]): void =>
  writeJSON(STORAGE_KEYS.PHARMACY, pharmacy);

export const loadBuffaloFacilities = (): BuffaloFacility[] =>
  readJSON(STORAGE_KEYS.FACILITIES, INITIAL_BUFFALO_FACILITIES);

export const saveBuffaloFacilities = (facilities: BuffaloFacility[]): void =>
  writeJSON(STORAGE_KEYS.FACILITIES, facilities);

export const loadBuffaloThermalWelfare = (): BuffaloThermalWelfareIndex =>
  readJSON(STORAGE_KEYS.THERMAL, INITIAL_THERMAL_WELFARE);

export const saveBuffaloThermalWelfare = (thermal: BuffaloThermalWelfareIndex): void =>
  writeJSON(STORAGE_KEYS.THERMAL, thermal);
