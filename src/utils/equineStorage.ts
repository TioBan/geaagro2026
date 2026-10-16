import {
  EquineAnimal,
  EquineBiometricsRecord,
  EquineReproductionRecord,
  EquineHealthRecord,
  EquineDentalRecord,
  EquineFarrieryRecord,
  EquineTrainingRecord,
  EquineCompetitionRecord,
  EquineNutritionPlan,
  EquineFacility,
  EquineExpenseRecord,
  EquineInventoryItem,
  EquineExamRecord,
  EquinePhotoRecord,
} from '../types/equine';
import {
  INITIAL_EQUINE_ANIMALS,
  INITIAL_EQUINE_BIOMETRICS,
  INITIAL_EQUINE_REPRODUCTION,
  INITIAL_EQUINE_HEALTH,
  INITIAL_EQUINE_DENTAL,
  INITIAL_EQUINE_FARRIERY,
  INITIAL_EQUINE_TRAININGS,
  INITIAL_EQUINE_COMPETITIONS,
  INITIAL_EQUINE_FACILITIES,
  INITIAL_EQUINE_INVENTORY,
  INITIAL_EQUINE_EXPENSES,
  INITIAL_EQUINE_EXAMS,
  INITIAL_EQUINE_PHOTOS,
} from '../data/equineData';

const KEYS = {
  ANIMALS: 'geaagro_equine_animals',
  BIOMETRICS: 'geaagro_equine_biometrics',
  REPRODUCTION: 'geaagro_equine_reproduction',
  HEALTH: 'geaagro_equine_health',
  DENTAL: 'geaagro_equine_dental',
  FARRIERY: 'geaagro_equine_farriery',
  TRAININGS: 'geaagro_equine_trainings',
  COMPETITIONS: 'geaagro_equine_competitions',
  NUTRITION_PLANS: 'geaagro_equine_nutrition_plans',
  FACILITIES: 'geaagro_equine_facilities',
  EXPENSES: 'geaagro_equine_expenses',
  INVENTORY: 'geaagro_equine_inventory',
  EXAMS: 'geaagro_equine_exams',
  PHOTOS: 'geaagro_equine_photos',
};

// Generic safe loader
function safeLoad<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    return JSON.parse(data) as T;
  } catch (error) {
    console.warn(`Error loading key ${key} from storage:`, error);
    return fallback;
  }
}

// Generic safe saver
function safeSave<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving key ${key} to storage:`, error);
  }
}

// Animals
export function loadEquineAnimals(): EquineAnimal[] {
  return safeLoad<EquineAnimal[]>(KEYS.ANIMALS, INITIAL_EQUINE_ANIMALS);
}
export function saveEquineAnimals(data: EquineAnimal[]): void {
  safeSave(KEYS.ANIMALS, data);
}

// Biometrics
export function loadEquineBiometrics(): EquineBiometricsRecord[] {
  return safeLoad<EquineBiometricsRecord[]>(KEYS.BIOMETRICS, INITIAL_EQUINE_BIOMETRICS);
}
export function saveEquineBiometrics(data: EquineBiometricsRecord[]): void {
  safeSave(KEYS.BIOMETRICS, data);
}

// Reproduction
export function loadEquineReproduction(): EquineReproductionRecord[] {
  return safeLoad<EquineReproductionRecord[]>(KEYS.REPRODUCTION, INITIAL_EQUINE_REPRODUCTION);
}
export function saveEquineReproduction(data: EquineReproductionRecord[]): void {
  safeSave(KEYS.REPRODUCTION, data);
}

// Health
export function loadEquineHealth(): EquineHealthRecord[] {
  return safeLoad<EquineHealthRecord[]>(KEYS.HEALTH, INITIAL_EQUINE_HEALTH);
}
export function saveEquineHealth(data: EquineHealthRecord[]): void {
  safeSave(KEYS.HEALTH, data);
}

// Dental
export function loadEquineDental(): EquineDentalRecord[] {
  return safeLoad<EquineDentalRecord[]>(KEYS.DENTAL, INITIAL_EQUINE_DENTAL);
}
export function saveEquineDental(data: EquineDentalRecord[]): void {
  safeSave(KEYS.DENTAL, data);
}

// Farriery
export function loadEquineFarriery(): EquineFarrieryRecord[] {
  return safeLoad<EquineFarrieryRecord[]>(KEYS.FARRIERY, INITIAL_EQUINE_FARRIERY);
}
export function saveEquineFarriery(data: EquineFarrieryRecord[]): void {
  safeSave(KEYS.FARRIERY, data);
}

// Trainings
export function loadEquineTrainings(): EquineTrainingRecord[] {
  return safeLoad<EquineTrainingRecord[]>(KEYS.TRAININGS, INITIAL_EQUINE_TRAININGS);
}
export function saveEquineTrainings(data: EquineTrainingRecord[]): void {
  safeSave(KEYS.TRAININGS, data);
}

// Competitions
export function loadEquineCompetitions(): EquineCompetitionRecord[] {
  return safeLoad<EquineCompetitionRecord[]>(KEYS.COMPETITIONS, INITIAL_EQUINE_COMPETITIONS);
}
export function saveEquineCompetitions(data: EquineCompetitionRecord[]): void {
  safeSave(KEYS.COMPETITIONS, data);
}

// Nutrition Plans
export function loadEquineNutritionPlans(): EquineNutritionPlan[] {
  return safeLoad<EquineNutritionPlan[]>(KEYS.NUTRITION_PLANS, []);
}
export function saveEquineNutritionPlans(data: EquineNutritionPlan[]): void {
  safeSave(KEYS.NUTRITION_PLANS, data);
}

// Facilities
export function loadEquineFacilities(): EquineFacility[] {
  return safeLoad<EquineFacility[]>(KEYS.FACILITIES, INITIAL_EQUINE_FACILITIES);
}
export function saveEquineFacilities(data: EquineFacility[]): void {
  safeSave(KEYS.FACILITIES, data);
}

// Expenses
export function loadEquineExpenses(): EquineExpenseRecord[] {
  return safeLoad<EquineExpenseRecord[]>(KEYS.EXPENSES, INITIAL_EQUINE_EXPENSES);
}
export function saveEquineExpenses(data: EquineExpenseRecord[]): void {
  safeSave(KEYS.EXPENSES, data);
}

// Inventory
export function loadEquineInventory(): EquineInventoryItem[] {
  return safeLoad<EquineInventoryItem[]>(KEYS.INVENTORY, INITIAL_EQUINE_INVENTORY);
}
export function saveEquineInventory(data: EquineInventoryItem[]): void {
  safeSave(KEYS.INVENTORY, data);
}

// Exams
export function loadEquineExams(): EquineExamRecord[] {
  return safeLoad<EquineExamRecord[]>(KEYS.EXAMS, INITIAL_EQUINE_EXAMS);
}
export function saveEquineExams(data: EquineExamRecord[]): void {
  safeSave(KEYS.EXAMS, data);
}

// Photos
export function loadEquinePhotos(): EquinePhotoRecord[] {
  return safeLoad<EquinePhotoRecord[]>(KEYS.PHOTOS, INITIAL_EQUINE_PHOTOS);
}
export function saveEquinePhotos(data: EquinePhotoRecord[]): void {
  safeSave(KEYS.PHOTOS, data);
}

// Reset data to defaults
export function resetEquineDataToDefaults(): void {
  Object.values(KEYS).forEach(key => localStorage.removeItem(key));
}
