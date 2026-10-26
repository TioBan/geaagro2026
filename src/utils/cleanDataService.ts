/**
 * Clean Data Service for GeaAgro
 * Ensures that the application starts with a clean, professional state without demo/mock data.
 */

const DEMO_STORAGE_KEYS = [
  'agronutri_companies',
  'agronutri_agronomists',
  'agronutri_producers',
  'agronutri_farms',
  'agronutri_soil_samples',
  'agronutri_leaf_samples',
  'agronutri_receitas_v1',
  'agronutri_dashboard_recommendations',
  'agronutri_water_analysis_v2',
  'agronutri_water_collection_points_v2',
  'geaagro_tankmix_current_tank',
  'geaagro_tankmix_applications',
  'poultry_disease_notes',
  'geaagro_plantability_fields_v1',
  'geaagro_plantability_planters_v1',
  'geaagro_plantability_seeds_v1',
  'geaagro_plantability_configs_v1',
  'geaagro_plantability_samplings_v1',
  'geaagro_plantability_environments_v1',
  'geaagro_plantability_photos_v1',
  'geaagro_plantability_maintenance_v1',
  'geaagro_buffalo_animals_v1',
  'geaagro_buffalo_paddocks_v1',
  'geaagro_buffalo_water_points_v1',
  'geaagro_buffalo_pharmacy_v1',
  'geaagro_buffalo_facilities_v1',
  'geaagro_buffalo_thermal_v1',
  'gea_nutrition_animal_profiles',
  'gea_nutrition_formulations',
  'gea_nutrition_forage_plans',
  'geaagro_swine_animals_v1',
  'geaagro_swine_batches_v1',
  'geaagro_swine_litters_v1',
  'geaagro_swine_diets_v1',
  'geaagro_swine_inventory_v1',
  'geaagro_swine_sheds_v1',
  'geaagro_swine_water_checks_v1',
  'geaagro_swine_biosecurity_v1',
  'geaagro_swine_photos_v1',
  'geaagro_caprine_animals_v1',
  'geaagro_caprine_weighings_v1',
  'geaagro_caprine_reproduction_v1',
  'geaagro_caprine_kids_v1',
  'geaagro_caprine_milk_v1',
  'geaagro_caprine_meat_v1',
  'geaagro_caprine_paddocks_v1',
  'geaagro_caprine_health_v1',
  'geaagro_caprine_pharmacy_v1',
  'geaagro_caprine_facilities_v1',
  'geaagro_caprine_photos_v1',
  'geaagro_equine_animals_v1',
  'geaagro_equine_facilities_v1',
  'geaagro_equine_inventory_v1',
  'geaagro_equine_biometrics_v1',
  'geaagro_equine_reproduction_v1',
  'geaagro_equine_health_v1',
  'geaagro_equine_dental_v1',
  'geaagro_equine_farriery_v1',
  'geaagro_equine_trainings_v1',
  'geaagro_equine_competitions_v1',
  'geaagro_equine_expenses_v1',
  'geaagro_equine_exams_v1',
  'geaagro_equine_photos_v1',
  'nema_score_force_offline',
  'geaagro_nursery_batches_v1',
  'geaagro_nursery_greenhouses_v1',
  'geaagro_nursery_orders_v1',
  'geaagro_nursery_pest_records_v1',
  // Administração & Gestão Rural
  'geaagro_gestao_propriedade',
  'geaagro_gestao_talhoes',
  'geaagro_gestao_safras',
  'geaagro_gestao_cronograma',
  'geaagro_gestao_operacoes',
  'geaagro_gestao_estoque',
  'geaagro_gestao_fornecedores',
  'geaagro_gestao_compras',
  'geaagro_gestao_vendas',
  'geaagro_gestao_financeiro',
  'geaagro_gestao_maquinas',
  'geaagro_gestao_manutencoes',
  'geaagro_gestao_funcionarios',
  'geaagro_gestao_irrigacao',
  'geaagro_gestao_clima',
];

const CLEAN_STATE_FLAG = 'geaagro_clean_state_v9';

export function clearAllDemoData(): void {
  if (typeof window === 'undefined') return;

  try {
    DEMO_STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
    });

    // Remoção de todos os contornos e pontos pré-preenchidos do Mapeamento de Coletas no Talhão
    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith('geaagro_plot_boundaries_') ||
        key.startsWith('geaagro_soil_sampling_points_')
      ) {
        localStorage.removeItem(key);
      }
    });

    // Also clear IndexedDB stores if present
    if ('indexedDB' in window) {
      try {
        const req = indexedDB.open('GeaAgroOfflineDB');
        req.onsuccess = (e: any) => {
          const db = e.target.result;
          ['animals', 'paddocks', 'poultry_batches', 'poultry_sheds'].forEach((store) => {
            if (db.objectStoreNames.contains(store)) {
              try {
                const tx = db.transaction(store, 'readwrite');
                tx.objectStore(store).clear();
              } catch (err) {
                console.warn(`[CleanData] Could not clear IndexedDB store: ${store}`, err);
              }
            }
          });
        };
      } catch (err) {
        console.warn('[CleanData] IndexedDB clear skipped', err);
      }
    }

    localStorage.setItem(CLEAN_STATE_FLAG, 'true');
    console.log('[GeaAgro] Todos os dados demonstrativos foram removidos para operação profissional.');
  } catch (e) {
    console.error('[CleanData] Erro ao limpar dados demo:', e);
  }
}

/**
 * Executes a one-time clean reset for production transition
 */
export function ensureCleanProductionState(): void {
  if (typeof window === 'undefined') return;
  const isAlreadyCleaned = localStorage.getItem(CLEAN_STATE_FLAG);
  if (!isAlreadyCleaned) {
    clearAllDemoData();
  }
}
