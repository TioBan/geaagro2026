import { HydroponicBench, NutrientSolutionReservoir, HydroponicAnnotation } from '../types/hydroponics';
import { FieldOperation } from '../types/fieldbook';

export const STORAGE_KEYS = {
  BENCHES: 'geaagro_hydroponics_benches_v1',
  RESERVOIRS: 'geaagro_hydroponics_reservoirs_v1',
  ANNOTATIONS: 'geaagro_hydroponics_annotations_v1',
  OPERATIONS: 'geaagro_fieldbook_operations_v1',
  ALERTS: 'geaagro_hydroponics_alerts_v1',
};

// Initial Benches for Hydroponics
export const DEFAULT_HYDROPONIC_BENCHES: HydroponicBench[] = [];

// Initial Reservoirs
export const DEFAULT_HYDROPONIC_RESERVOIRS: NutrientSolutionReservoir[] = [];

// Initial Technical Annotations (Synchronized with Caderno de Campo)
export const DEFAULT_HYDROPONIC_ANNOTATIONS: HydroponicAnnotation[] = [];

// Helper to convert an annotation to a FieldOperation in Caderno de Campo
export function createFieldOperationFromHydroponicAnnotation(
  annotation: HydroponicAnnotation,
  farmId = 'farm-1'
): FieldOperation {
  let opType: FieldOperation['type'] = 'hydroponics_diary';
  if (annotation.category === 'manejo_solucao') opType = 'hydroponics_nutrient';
  else if (annotation.category === 'bancada_transplante') opType = 'hydroponics_planting';
  else if (annotation.category === 'colheita') opType = 'hydroponics_harvest';
  else if (annotation.category === 'sanidade_pragas') opType = 'monitoring';
  else if (annotation.category === 'limpeza_manutencao') opType = 'hydroponics_sanitation';

  return {
    id: annotation.fieldOperationId || `op-hydro-${annotation.id}`,
    farmId,
    fieldId: 'hidroponia-estufa-01',
    type: opType,
    status: 'completed',
    date: annotation.date,
    responsible: annotation.author || 'Equipe de Hidroponia',
    notes: `[HIDROPONIA] ${annotation.title}: ${annotation.notes}`,
    details: {
      benchCode: annotation.benchCode,
      benchId: annotation.benchId,
      reservoirId: annotation.reservoirId,
      reservoirName: annotation.reservoirName,
      phMeasured: annotation.phValue,
      ecMeasured: annotation.ecValue,
      solutionTempC: annotation.temperatureC,
      nutrientAction: annotation.fertilizersAddedSummary,
      phytosanitaryObservation: annotation.pestOrDiseaseObserved,
      systemType: 'NFT / DFT / Substrato',
      greenhouseSection: 'Estufa Principal Hidropônica',
    },
    costs: {
      operation: 0,
      inputs: annotation.waterRefilledLiters ? Math.round(annotation.waterRefilledLiters * 0.08) + 15 : 0,
      machine: 0,
      labor: 40,
      total: annotation.waterRefilledLiters ? Math.round(annotation.waterRefilledLiters * 0.08) + 55 : 40,
    },
    createdAt: annotation.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Storage helpers
export function getHydroponicBenches(): HydroponicBench[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BENCHES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading hydroponic benches from localStorage', e);
  }
  return DEFAULT_HYDROPONIC_BENCHES;
}

export function saveHydroponicBenches(benches: HydroponicBench[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BENCHES, JSON.stringify(benches));
    window.dispatchEvent(new CustomEvent('geaagro-hydroponics-updated'));
  } catch (e) {
    console.error('Error saving hydroponic benches', e);
  }
}

export function getHydroponicReservoirs(): NutrientSolutionReservoir[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESERVOIRS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading hydroponic reservoirs from localStorage', e);
  }
  return DEFAULT_HYDROPONIC_RESERVOIRS;
}

export function saveHydroponicReservoirs(reservoirs: NutrientSolutionReservoir[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RESERVOIRS, JSON.stringify(reservoirs));
    window.dispatchEvent(new CustomEvent('geaagro-hydroponics-updated'));
  } catch (e) {
    console.error('Error saving hydroponic reservoirs', e);
  }
}

export function getHydroponicAnnotations(): HydroponicAnnotation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ANNOTATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading hydroponic annotations from localStorage', e);
  }
  return DEFAULT_HYDROPONIC_ANNOTATIONS;
}

export function saveHydroponicAnnotations(annotations: HydroponicAnnotation[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ANNOTATIONS, JSON.stringify(annotations));
    window.dispatchEvent(new CustomEvent('geaagro-hydroponics-annotations-updated'));
  } catch (e) {
    console.error('Error saving hydroponic annotations', e);
  }
}

// Add a new annotation and automatically sync it to Caderno de Campo operations
export function addHydroponicAnnotationAndSync(
  annotationData: Omit<HydroponicAnnotation, 'id' | 'createdAt' | 'syncedWithFieldBook' | 'fieldOperationId'>,
  farmId = 'farm-1'
): { annotation: HydroponicAnnotation; operation: FieldOperation } {
  const annId = `ann-${Date.now()}`;
  const opId = `op-hydro-${Date.now()}`;

  const annotation: HydroponicAnnotation = {
    ...annotationData,
    id: annId,
    syncedWithFieldBook: true,
    fieldOperationId: opId,
    createdAt: new Date().toISOString(),
  };

  // Save annotation
  const existingAnn = getHydroponicAnnotations();
  const updatedAnn = [annotation, ...existingAnn];
  saveHydroponicAnnotations(updatedAnn);

  // Create and save Caderno de Campo operation
  const operation = createFieldOperationFromHydroponicAnnotation(annotation, farmId);
  try {
    const opsRaw = localStorage.getItem(STORAGE_KEYS.OPERATIONS);
    const existingOps: FieldOperation[] = opsRaw ? JSON.parse(opsRaw) : [];
    const updatedOps = [operation, ...existingOps.filter(o => o.id !== opId)];
    localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify(updatedOps));
    window.dispatchEvent(new CustomEvent('geaagro-fieldbook-operations-updated', { detail: { operation } }));
  } catch (e) {
    console.error('Error syncing operation with FieldBook', e);
  }

  return { annotation, operation };
}

const LEGACY_SEED_OP_IDS = new Set(['op-hydro-01', 'op-hydro-02', 'op-hydro-03', 'op-hydro-04']);

// Sync all existing user hydroponic operations into FieldBook and clean legacy mock seed ops
export function ensureInitialHydroponicSync(farmId = 'farm-1'): void {
  try {
    const opsRaw = localStorage.getItem(STORAGE_KEYS.OPERATIONS);
    const existingOps: FieldOperation[] = opsRaw ? JSON.parse(opsRaw) : [];
    const cleanedOps = existingOps.filter(o => !LEGACY_SEED_OP_IDS.has(o.id));
    let changed = cleanedOps.length !== existingOps.length;

    const initialAnnotations = getHydroponicAnnotations();
    const mergedOps = [...cleanedOps];

    for (const ann of initialAnnotations) {
      const opId = ann.fieldOperationId || `op-hydro-${ann.id}`;
      const found = mergedOps.some(o => o.id === opId);
      if (!found) {
        mergedOps.unshift(createFieldOperationFromHydroponicAnnotation(ann, farmId));
        changed = true;
      }
    }

    if (changed) {
      localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify(mergedOps));
    }
  } catch (e) {
    console.warn('Could not complete initial hydroponic sync check', e);
  }
}

// Summary Metrics for Caderno de Campo Dashboard
export function getHydroponicSummaryMetrics() {
  const benches = getHydroponicBenches();
  const reservoirs = getHydroponicReservoirs();
  const annotations = getHydroponicAnnotations();

  const activeBenches = benches.filter(b => b.status !== 'vazia');
  const totalPlants = benches.reduce((sum, b) => sum + b.currentPlantsCount, 0);
  const readyBenches = benches.filter(b => b.status === 'pronto_colheita');
  
  const avgPH = reservoirs.length > 0 
    ? (reservoirs.reduce((sum, r) => sum + r.currentPH, 0) / reservoirs.length).toFixed(2)
    : '--';
    
  const avgEC = reservoirs.length > 0
    ? (reservoirs.reduce((sum, r) => sum + r.currentEC, 0) / reservoirs.length).toFixed(2)
    : '--';

  return {
    totalBenches: benches.length,
    activeBenches: activeBenches.length,
    totalPlants,
    readyBenchesCount: readyBenches.length,
    reservoirsCount: reservoirs.length,
    avgPH,
    avgEC,
    totalAnnotationsCount: annotations.length,
    latestAnnotation: annotations[0] || null,
  };
}
