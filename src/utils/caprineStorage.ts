import {
  CaprineAnimal,
  CaprineWeighingRecord,
  CaprineReproductionRecord,
  CaprineKidRecord,
  CaprineMilkRecord,
  CaprineMeatRecord,
  CaprineFeedItem,
  CaprinePasturePaddock,
  CaprineHealthRecord,
  CaprineDiseaseInfo,
  CaprinePharmacyItem,
  CaprineFacility,
  CaprinePhotoEntry
} from '../types/caprine';

import {
  INITIAL_CAPRINE_ANIMALS,
  INITIAL_CAPRINE_WEIGHINGS,
  INITIAL_CAPRINE_REPRODUCTION,
  INITIAL_CAPRINE_KIDS,
  INITIAL_CAPRINE_MILK_LOGS,
  INITIAL_CAPRINE_MEAT_LOGS,
  INITIAL_CAPRINE_FEEDS,
  INITIAL_CAPRINE_PADDOCKS,
  INITIAL_CAPRINE_HEALTH,
  INITIAL_CAPRINE_DISEASES,
  INITIAL_CAPRINE_PHARMACY,
  INITIAL_CAPRINE_FACILITIES,
  INITIAL_CAPRINE_PHOTOS
} from '../data/caprineData';

const KEYS = {
  ANIMALS: 'gea_caprine_animals_v1',
  WEIGHINGS: 'gea_caprine_weighings_v1',
  REPRODUCTION: 'gea_caprine_reproduction_v1',
  KIDS: 'gea_caprine_kids_v1',
  MILK_LOGS: 'gea_caprine_milk_logs_v1',
  MEAT_LOGS: 'gea_caprine_meat_logs_v1',
  FEEDS: 'gea_caprine_feeds_v1',
  PADDOCKS: 'gea_caprine_paddocks_v1',
  HEALTH: 'gea_caprine_health_v1',
  DISEASES: 'gea_caprine_diseases_v1',
  PHARMACY: 'gea_caprine_pharmacy_v1',
  FACILITIES: 'gea_caprine_facilities_v1',
  PHOTOS: 'gea_caprine_photos_v1'
};

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Erro ao carregar chave ${key} do localStorage`, error);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Erro ao salvar chave ${key} no localStorage`, error);
  }
}

export function loadCaprineAnimals(): CaprineAnimal[] {
  return getItem<CaprineAnimal[]>(KEYS.ANIMALS, INITIAL_CAPRINE_ANIMALS);
}

export function saveCaprineAnimals(animals: CaprineAnimal[]): void {
  setItem(KEYS.ANIMALS, animals);
}

export function loadCaprineWeighings(): CaprineWeighingRecord[] {
  return getItem<CaprineWeighingRecord[]>(KEYS.WEIGHINGS, INITIAL_CAPRINE_WEIGHINGS);
}

export function saveCaprineWeighings(records: CaprineWeighingRecord[]): void {
  setItem(KEYS.WEIGHINGS, records);
}

export function loadCaprineReproduction(): CaprineReproductionRecord[] {
  return getItem<CaprineReproductionRecord[]>(KEYS.REPRODUCTION, INITIAL_CAPRINE_REPRODUCTION);
}

export function saveCaprineReproduction(records: CaprineReproductionRecord[]): void {
  setItem(KEYS.REPRODUCTION, records);
}

export function loadCaprineKids(): CaprineKidRecord[] {
  return getItem<CaprineKidRecord[]>(KEYS.KIDS, INITIAL_CAPRINE_KIDS);
}

export function saveCaprineKids(records: CaprineKidRecord[]): void {
  setItem(KEYS.KIDS, records);
}

export function loadCaprineMilkLogs(): CaprineMilkRecord[] {
  return getItem<CaprineMilkRecord[]>(KEYS.MILK_LOGS, INITIAL_CAPRINE_MILK_LOGS);
}

export function saveCaprineMilkLogs(records: CaprineMilkRecord[]): void {
  setItem(KEYS.MILK_LOGS, records);
}

export function loadCaprineMeatLogs(): CaprineMeatRecord[] {
  return getItem<CaprineMeatRecord[]>(KEYS.MEAT_LOGS, INITIAL_CAPRINE_MEAT_LOGS);
}

export function saveCaprineMeatLogs(records: CaprineMeatRecord[]): void {
  setItem(KEYS.MEAT_LOGS, records);
}

export function loadCaprineFeeds(): CaprineFeedItem[] {
  return getItem<CaprineFeedItem[]>(KEYS.FEEDS, INITIAL_CAPRINE_FEEDS);
}

export function saveCaprineFeeds(feeds: CaprineFeedItem[]): void {
  setItem(KEYS.FEEDS, feeds);
}

export function loadCaprinePaddocks(): CaprinePasturePaddock[] {
  return getItem<CaprinePasturePaddock[]>(KEYS.PADDOCKS, INITIAL_CAPRINE_PADDOCKS);
}

export function saveCaprinePaddocks(paddocks: CaprinePasturePaddock[]): void {
  setItem(KEYS.PADDOCKS, paddocks);
}

export function loadCaprineHealth(): CaprineHealthRecord[] {
  return getItem<CaprineHealthRecord[]>(KEYS.HEALTH, INITIAL_CAPRINE_HEALTH);
}

export function saveCaprineHealth(health: CaprineHealthRecord[]): void {
  setItem(KEYS.HEALTH, health);
}

export function loadCaprineDiseases(): CaprineDiseaseInfo[] {
  return getItem<CaprineDiseaseInfo[]>(KEYS.DISEASES, INITIAL_CAPRINE_DISEASES);
}

export function saveCaprineDiseases(diseases: CaprineDiseaseInfo[]): void {
  setItem(KEYS.DISEASES, diseases);
}

export function loadCaprinePharmacy(): CaprinePharmacyItem[] {
  return getItem<CaprinePharmacyItem[]>(KEYS.PHARMACY, INITIAL_CAPRINE_PHARMACY);
}

export function saveCaprinePharmacy(pharmacy: CaprinePharmacyItem[]): void {
  setItem(KEYS.PHARMACY, pharmacy);
}

export function loadCaprineFacilities(): CaprineFacility[] {
  return getItem<CaprineFacility[]>(KEYS.FACILITIES, INITIAL_CAPRINE_FACILITIES);
}

export function saveCaprineFacilities(facilities: CaprineFacility[]): void {
  setItem(KEYS.FACILITIES, facilities);
}

export function loadCaprinePhotos(): CaprinePhotoEntry[] {
  return getItem<CaprinePhotoEntry[]>(KEYS.PHOTOS, INITIAL_CAPRINE_PHOTOS);
}

export function saveCaprinePhotos(photos: CaprinePhotoEntry[]): void {
  setItem(KEYS.PHOTOS, photos);
}

export function resetCaprineDataToDefaults(): void {
  saveCaprineAnimals(INITIAL_CAPRINE_ANIMALS);
  saveCaprineWeighings(INITIAL_CAPRINE_WEIGHINGS);
  saveCaprineReproduction(INITIAL_CAPRINE_REPRODUCTION);
  saveCaprineKids(INITIAL_CAPRINE_KIDS);
  saveCaprineMilkLogs(INITIAL_CAPRINE_MILK_LOGS);
  saveCaprineMeatLogs(INITIAL_CAPRINE_MEAT_LOGS);
  saveCaprineFeeds(INITIAL_CAPRINE_FEEDS);
  saveCaprinePaddocks(INITIAL_CAPRINE_PADDOCKS);
  saveCaprineHealth(INITIAL_CAPRINE_HEALTH);
  saveCaprineDiseases(INITIAL_CAPRINE_DISEASES);
  saveCaprinePharmacy(INITIAL_CAPRINE_PHARMACY);
  saveCaprineFacilities(INITIAL_CAPRINE_FACILITIES);
  saveCaprinePhotos(INITIAL_CAPRINE_PHOTOS);
}
