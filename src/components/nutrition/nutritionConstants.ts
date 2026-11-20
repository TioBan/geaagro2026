import { AnimalSpecies, ForageProductionPlan, IngredientCategory } from '../../types/animalNutrition';

export const SPECIES_OPTIONS: Array<{ id: AnimalSpecies; label: string; shortLabel: string }> = [
  { id: 'bovinos_leite', label: 'Bovinos de Leite', shortLabel: 'Bovinos Leite' },
  { id: 'bovinos_corte', label: 'Bovinos de Corte', shortLabel: 'Bovinos Corte' },
  { id: 'bezerros', label: 'Bezerros / Creep-Feeding', shortLabel: 'Bezerros' },
  { id: 'bubalinos', label: 'Bubalinos', shortLabel: 'Bubalinos' },
  { id: 'caprinos', label: 'Caprinos', shortLabel: 'Caprinos' },
  { id: 'ovinos', label: 'Ovinos', shortLabel: 'Ovinos' },
  { id: 'suinos', label: 'Suínos', shortLabel: 'Suínos' },
  { id: 'aves_corte', label: 'Aves de Corte', shortLabel: 'Aves Corte' },
  { id: 'aves_postura', label: 'Aves de Postura', shortLabel: 'Aves Postura' },
  { id: 'reprodutores', label: 'Reprodutores', shortLabel: 'Reprodutores' },
  { id: 'equinos', label: 'Equinos', shortLabel: 'Equinos' },
  { id: 'peixes', label: 'Peixes / Piscicultura', shortLabel: 'Piscicultura' },
];

export const INGREDIENT_CATEGORIES: Array<{ id: IngredientCategory; label: string }> = [
  { id: 'energeticos', label: 'Energéticos' },
  { id: 'proteicos', label: 'Proteicos' },
  { id: 'volumosos', label: 'Volumosos / Silagens' },
  { id: 'minerais', label: 'Macro & Micro Minerais' },
  { id: 'vitaminas', label: 'Vitaminas & Premixes' },
  { id: 'aditivos', label: 'Aditivos & Moduladores' },
];

export const FORAGE_TYPE_LABELS: Record<ForageProductionPlan['forageType'], string> = {
  silagem_milho: 'Silagem de Milho',
  silagem_sorgo: 'Silagem de Sorgo',
  cana_acucar: 'Cana-de-Açúcar',
  feno_tifton: 'Feno de Tifton',
  capineira: 'Capineira / Capiaçu',
  pastagem_rotacionada: 'Pastagem Rotacionada',
};

export function getSpeciesLabel(species: AnimalSpecies): string {
  return SPECIES_OPTIONS.find((s) => s.id === species)?.shortLabel ?? species.replace(/_/g, ' ');
}

export function getIngredientCategoryLabel(category: IngredientCategory): string {
  return INGREDIENT_CATEGORIES.find((c) => c.id === category)?.label ?? category;
}

export function getForageTypeLabel(type: ForageProductionPlan['forageType']): string {
  return FORAGE_TYPE_LABELS[type] ?? type.replace(/_/g, ' ');
}
