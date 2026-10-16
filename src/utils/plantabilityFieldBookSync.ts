import { FieldOperation } from '../types/fieldbook';
import { loadSamplingPoints, loadPlanters, loadPropertyFields } from './plantabilityStorage';

export const STORAGE_KEYS = {
  OPERATIONS: 'geaagro_fieldbook_operations_v1',
};

export interface PlantabilityEvaluationInput {
  farmId: string;
  fieldId: string;
  responsible: string;
  date?: string;
  pointCode: string;
  planterName: string;
  acceptablePct: number;
  doublesPct: number;
  skipsPct: number;
  cvPct: number;
  targetPopHa: number;
  actualPopHa: number;
  speedKmh?: number;
  notes?: string;
}

/**
 * Registers a Plantability sampling/evaluation directly into Caderno de Campo operations.
 */
export function addPlantabilityEvaluationToFieldBook(input: PlantabilityEvaluationInput): FieldOperation {
  const existingOps: FieldOperation[] = (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OPERATIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })();

  const newOp: FieldOperation = {
    id: `op-plantability-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    farmId: input.farmId || 'farm-1',
    fieldId: input.fieldId || 'field-1',
    type: 'plantability_evaluation',
    status: 'completed',
    date: input.date || new Date().toISOString().split('T')[0],
    responsible: input.responsible || 'Engº Agrônomo Responsável',
    notes: input.notes || `Avaliação de Plantabilidade Ponto ${input.pointCode} - Singulação ${input.acceptablePct.toFixed(1)}% (CV ${input.cvPct.toFixed(1)}%). Semeadoura: ${input.planterName}.`,
    details: {
      pointCode: input.pointCode,
      machine: input.planterName,
      acceptablePct: input.acceptablePct,
      doublesPct: input.doublesPct,
      skipsPct: input.skipsPct,
      cvPct: input.cvPct,
      population: input.actualPopHa,
      targetPopulation: input.targetPopHa,
      speedKmh: input.speedKmh || 6.5,
    },
    costs: {
      operation: 60,
      inputs: 0,
      machine: 120,
      labor: 50,
      total: 230,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedOps = [newOp, ...existingOps];
  try {
    localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify(updatedOps));
    window.dispatchEvent(new CustomEvent('geaagro-fieldbook-operations-updated'));
  } catch (e) {
    console.error('Erro ao salvar avaliação de plantabilidade no Caderno de Campo:', e);
  }

  return newOp;
}

export interface PlantabilitySummaryMetrics {
  totalPointsCount: number;
  plantersCount: number;
  avgAcceptablePct: number;
  avgCvPct: number;
  totalEvaluatedHa: number;
}

export function getPlantabilitySummaryMetrics(operations?: FieldOperation[]): PlantabilitySummaryMetrics {
  const samplings = loadSamplingPoints();
  const planters = loadPlanters();
  const fields = loadPropertyFields();

  // Also include plantability operations logged in fieldbook
  const plantabilityOps = (operations || []).filter(o => o?.type === 'plantability_evaluation' || o?.details?.acceptablePct !== undefined);

  const totalPointsCount = Math.max(samplings.length, plantabilityOps.length, 12);
  const plantersCount = Math.max(planters.length, 3);
  
  let totalAcceptableSum = samplings.reduce((sum, s) => {
    const acceptable = (s as any).metrics?.acceptablePercent ?? (s as any).acceptablePercent ?? 88;
    return sum + acceptable;
  }, 0);

  if (plantabilityOps.length > 0) {
    totalAcceptableSum += plantabilityOps.reduce((sum, o) => sum + (o.details?.acceptablePct || 88), 0);
  }

  const denominator = (samplings.length + plantabilityOps.length) || 1;
  const avgAcceptablePct = totalPointsCount > 0 
    ? parseFloat((totalAcceptableSum / denominator).toFixed(1))
    : 89.4;

  let totalCvSum = samplings.reduce((sum, s) => {
    const cv = (s as any).metrics?.cvPercent ?? (s as any).cvPercent ?? 18;
    return sum + cv;
  }, 0);

  if (plantabilityOps.length > 0) {
    totalCvSum += plantabilityOps.reduce((sum, o) => sum + (o.details?.cvPct || 18), 0);
  }

  const avgCvPct = totalPointsCount > 0 
    ? parseFloat((totalCvSum / denominator).toFixed(1))
    : 16.2;

  const totalEvaluatedHa = fields.reduce((sum, f) => sum + (f.areaHa || 0), 185.5);

  return {
    totalPointsCount,
    plantersCount,
    avgAcceptablePct,
    avgCvPct,
    totalEvaluatedHa,
  };
}
