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
  INITIAL_EQUINE_EXPENSES,
  INITIAL_EQUINE_INVENTORY,
  INITIAL_EQUINE_EXAMS,
} from '../data/equineData';

const KEYS = {
  ANIMALS: 'agro_equine_animals_v1',
  BIOMETRICS: 'agro_equine_biometrics_v1',
  REPRODUCTION: 'agro_equine_reproduction_v1',
  HEALTH: 'agro_equine_health_v1',
  DENTAL: 'agro_equine_dental_v1',
  FARRIERY: 'agro_equine_farriery_v1',
  TRAININGS: 'agro_equine_trainings_v1',
  COMPETITIONS: 'agro_equine_competitions_v1',
  NUTRITION_PLANS: 'agro_equine_nutrition_plans_v1',
  FACILITIES: 'agro_equine_facilities_v1',
  EXPENSES: 'agro_equine_expenses_v1',
  INVENTORY: 'agro_equine_inventory_v1',
  EXAMS: 'agro_equine_exams_v1',
};

function safeLoad<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      return fallback;
    }
    return parsed as T;
  } catch (err) {
    console.error(`[EquineStorage] Error loading ${key}:`, err);
    return fallback;
  }
}

function safeSave<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`[EquineStorage] Error saving ${key}:`, err);
  }
}

export const loadEquineAnimals = (): EquineAnimal[] => safeLoad(KEYS.ANIMALS, INITIAL_EQUINE_ANIMALS);
export const saveEquineAnimals = (data: EquineAnimal[]): void => safeSave(KEYS.ANIMALS, data);

export const loadEquineBiometrics = (): EquineBiometricsRecord[] => safeLoad(KEYS.BIOMETRICS, INITIAL_EQUINE_BIOMETRICS);
export const saveEquineBiometrics = (data: EquineBiometricsRecord[]): void => safeSave(KEYS.BIOMETRICS, data);

export const loadEquineReproduction = (): EquineReproductionRecord[] => safeLoad(KEYS.REPRODUCTION, INITIAL_EQUINE_REPRODUCTION);
export const saveEquineReproduction = (data: EquineReproductionRecord[]): void => safeSave(KEYS.REPRODUCTION, data);

export const loadEquineHealth = (): EquineHealthRecord[] => safeLoad(KEYS.HEALTH, INITIAL_EQUINE_HEALTH);
export const saveEquineHealth = (data: EquineHealthRecord[]): void => safeSave(KEYS.HEALTH, data);

export const loadEquineDental = (): EquineDentalRecord[] => safeLoad(KEYS.DENTAL, INITIAL_EQUINE_DENTAL);
export const saveEquineDental = (data: EquineDentalRecord[]): void => safeSave(KEYS.DENTAL, data);

export const loadEquineFarriery = (): EquineFarrieryRecord[] => safeLoad(KEYS.FARRIERY, INITIAL_EQUINE_FARRIERY);
export const saveEquineFarriery = (data: EquineFarrieryRecord[]): void => safeSave(KEYS.FARRIERY, data);

export const loadEquineTrainings = (): EquineTrainingRecord[] => safeLoad(KEYS.TRAININGS, INITIAL_EQUINE_TRAININGS);
export const saveEquineTrainings = (data: EquineTrainingRecord[]): void => safeSave(KEYS.TRAININGS, data);

export const loadEquineCompetitions = (): EquineCompetitionRecord[] => safeLoad(KEYS.COMPETITIONS, INITIAL_EQUINE_COMPETITIONS);
export const saveEquineCompetitions = (data: EquineCompetitionRecord[]): void => safeSave(KEYS.COMPETITIONS, data);

export const loadEquineNutritionPlans = (): EquineNutritionPlan[] => safeLoad(KEYS.NUTRITION_PLANS, []);
export const saveEquineNutritionPlans = (data: EquineNutritionPlan[]): void => safeSave(KEYS.NUTRITION_PLANS, data);

export const loadEquineFacilities = (): EquineFacility[] => safeLoad(KEYS.FACILITIES, INITIAL_EQUINE_FACILITIES);
export const saveEquineFacilities = (data: EquineFacility[]): void => safeSave(KEYS.FACILITIES, data);

export const loadEquineExpenses = (): EquineExpenseRecord[] => safeLoad(KEYS.EXPENSES, INITIAL_EQUINE_EXPENSES);
export const saveEquineExpenses = (data: EquineExpenseRecord[]): void => safeSave(KEYS.EXPENSES, data);

export const loadEquineInventory = (): EquineInventoryItem[] => safeLoad(KEYS.INVENTORY, INITIAL_EQUINE_INVENTORY);
export const saveEquineInventory = (data: EquineInventoryItem[]): void => safeSave(KEYS.INVENTORY, data);

export const loadEquineExams = (): EquineExamRecord[] => safeLoad(KEYS.EXAMS, INITIAL_EQUINE_EXAMS);
export const saveEquineExams = (data: EquineExamRecord[]): void => safeSave(KEYS.EXAMS, data);
