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
  ANIMALS: 'geaagro_buffalo_animals_v1',
  PADDOCKS: 'geaagro_buffalo_paddocks_v1',
  WATER_POINTS: 'geaagro_buffalo_water_points_v1',
  PHARMACY: 'geaagro_buffalo_pharmacy_v1',
  FACILITIES: 'geaagro_buffalo_facilities_v1',
  THERMAL: 'geaagro_buffalo_thermal_v1'
};

export const buffaloStorage = {
  getAnimals(): BuffaloAnimal[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ANIMALS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Erro ao carregar búfalos do storage:', e);
    }
    return INITIAL_BUFFALO_ANIMALS;
  },

  saveAnimals(animals: BuffaloAnimal[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ANIMALS, JSON.stringify(animals));
    } catch (e) {
      console.error('Erro ao salvar búfalos no storage:', e);
    }
  },

  getPaddocks(): BuffaloPaddock[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PADDOCKS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Erro ao carregar piquetes do storage:', e);
    }
    return INITIAL_BUFFALO_PADDOCKS;
  },

  savePaddocks(paddocks: BuffaloPaddock[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.PADDOCKS, JSON.stringify(paddocks));
    } catch (e) {
      console.error('Erro ao salvar piquetes no storage:', e);
    }
  },

  getWaterPoints(): BuffaloWaterPoint[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WATER_POINTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Erro ao carregar pontos de água do storage:', e);
    }
    return INITIAL_BUFFALO_WATER_POINTS;
  },

  saveWaterPoints(waterPoints: BuffaloWaterPoint[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.WATER_POINTS, JSON.stringify(waterPoints));
    } catch (e) {
      console.error('Erro ao salvar pontos de água no storage:', e);
    }
  },

  getPharmacy(): BuffaloPharmacyItem[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PHARMACY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Erro ao carregar farmácia do storage:', e);
    }
    return INITIAL_BUFFALO_PHARMACY;
  },

  savePharmacy(pharmacy: BuffaloPharmacyItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.PHARMACY, JSON.stringify(pharmacy));
    } catch (e) {
      console.error('Erro ao salvar farmácia no storage:', e);
    }
  },

  getFacilities(): BuffaloFacility[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FACILITIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Erro ao carregar instalações do storage:', e);
    }
    return INITIAL_BUFFALO_FACILITIES;
  },

  saveFacilities(facilities: BuffaloFacility[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(facilities));
    } catch (e) {
      console.error('Erro ao salvar instalações no storage:', e);
    }
  },

  getThermalWelfare(): BuffaloThermalWelfareIndex {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THERMAL);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Erro ao carregar bem-estar térmico do storage:', e);
    }
    return INITIAL_THERMAL_WELFARE;
  },

  saveThermalWelfare(thermal: BuffaloThermalWelfareIndex) {
    try {
      localStorage.setItem(STORAGE_KEYS.THERMAL, JSON.stringify(thermal));
    } catch (e) {
      console.error('Erro ao salvar bem-estar térmico no storage:', e);
    }
  },

  resetAll() {
    try {
      localStorage.removeItem(STORAGE_KEYS.ANIMALS);
      localStorage.removeItem(STORAGE_KEYS.PADDOCKS);
      localStorage.removeItem(STORAGE_KEYS.WATER_POINTS);
      localStorage.removeItem(STORAGE_KEYS.PHARMACY);
      localStorage.removeItem(STORAGE_KEYS.FACILITIES);
      localStorage.removeItem(STORAGE_KEYS.THERMAL);
    } catch (e) {
      console.error('Erro ao resetar storage de bubalinos:', e);
    }
  }
};

// Named exports for convenient imports
export const loadBuffaloAnimals = buffaloStorage.getAnimals;
export const saveBuffaloAnimals = buffaloStorage.saveAnimals;
export const loadBuffaloPaddocks = buffaloStorage.getPaddocks;
export const saveBuffaloPaddocks = buffaloStorage.savePaddocks;
export const loadBuffaloWaterPoints = buffaloStorage.getWaterPoints;
export const saveBuffaloWaterPoints = buffaloStorage.saveWaterPoints;
export const loadBuffaloPharmacy = buffaloStorage.getPharmacy;
export const saveBuffaloPharmacy = buffaloStorage.savePharmacy;
export const loadBuffaloFacilities = buffaloStorage.getFacilities;
export const saveBuffaloFacilities = buffaloStorage.saveFacilities;
export const loadBuffaloThermalWelfare = buffaloStorage.getThermalWelfare;
export const saveBuffaloThermalWelfare = buffaloStorage.saveThermalWelfare;
export const resetBuffaloDataToDefaults = buffaloStorage.resetAll;
