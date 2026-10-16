import { FieldOperation } from '../types/fieldbook';
import { STORAGE_KEYS } from './hydroponicsFieldBookSync';

export interface TankMixApplicationInput {
  farmId: string;
  fieldId: string;
  responsible: string;
  date?: string;
  sprayOrderCode: string;
  carrierVolumeHa: number;
  totalVolumeLiters: number;
  waterPh?: number;
  waterHardnessPpm?: number;
  sprayTip?: string;
  driftRiskLevel?: 'baixo' | 'medio' | 'alto' | 'critico';
  products: Array<{
    productName: string;
    dose: string;
    additionOrder: number;
    category: string;
    target?: string;
    safetyInterval?: number;
  }>;
  notes?: string;
  costs?: {
    operation: number;
    inputs: number;
    machine: number;
    labor: number;
    total: number;
  };
}

/**
 * Registers a TankMix Spray Application directly into Caderno de Campo operations history.
 */
export function addTankMixApplicationToFieldBook(input: TankMixApplicationInput): FieldOperation {
  const existingOps: FieldOperation[] = (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OPERATIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })();

  const productsSummary = input.products
    .map(p => `${p.additionOrder}º ${p.productName} (${p.dose})`)
    .join(', ');

  const mainTarget = input.products.find(p => p.target)?.target || 'Manejo Fitossanitário Generalizado';
  const maxSafetyInterval = Math.max(...input.products.map(p => p.safetyInterval || 0), 0);

  const newOp: FieldOperation = {
    id: `op-tankmix-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    farmId: input.farmId || 'farm-1',
    fieldId: input.fieldId || 'field-1',
    type: 'tankmix_application',
    status: 'completed',
    date: input.date || new Date().toISOString().split('T')[0],
    responsible: input.responsible || 'Engº Agrônomo Responsável',
    notes: input.notes || `Aplicação de Calda TankMix Ordem #${input.sprayOrderCode}. Produtos: ${productsSummary}.`,
    details: {
      sprayOrderCode: input.sprayOrderCode,
      product: input.products[0]?.productName || 'Calda TankMix Complexa',
      target: mainTarget,
      dose: parseFloat(input.products[0]?.dose || '0') || 0,
      volume: input.totalVolumeLiters,
      carrierVolumeHa: input.carrierVolumeHa,
      waterPh: input.waterPh,
      waterHardnessPpm: input.waterHardnessPpm,
      sprayTip: input.sprayTip || 'Leque Amplo Antideriva (AIXI)',
      driftRiskLevel: input.driftRiskLevel || 'baixo',
      safetyInterval: maxSafetyInterval,
      tankMixProducts: input.products,
    },
    costs: input.costs || {
      operation: 85,
      inputs: input.products.length * 120,
      machine: 150,
      labor: 60,
      total: 85 + (input.products.length * 120) + 150 + 60,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedOps = [newOp, ...existingOps];
  try {
    localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify(updatedOps));
    window.dispatchEvent(new CustomEvent('geaagro-fieldbook-operations-updated'));
  } catch (e) {
    console.error('Erro ao salvar aplicação TankMix no Caderno de Campo:', e);
  }

  return newOp;
}

/**
 * Calculates metrics from TankMix spray applications logged in Caderno de Campo.
 */
export function getTankMixSummaryMetrics(operations: FieldOperation[]) {
  const tankMixOps = (operations || []).filter(
    op => op?.type === 'tankmix_application' || op?.type === 'spraying'
  );

  const totalApplications = tankMixOps.length;
  const totalVolumeLiters = tankMixOps.reduce((sum, op) => sum + (op.details?.volume || 0), 0);
  
  const phReadings = tankMixOps
    .map(op => op.details?.waterPh)
    .filter((val): val is number => typeof val === 'number' && !isNaN(val));

  const avgPh = phReadings.length > 0
    ? (phReadings.reduce((a, b) => a + b, 0) / phReadings.length).toFixed(1)
    : '5.8';

  const totalInvestment = tankMixOps.reduce((sum, op) => sum + (op.costs?.total || 0), 0);

  return {
    totalApplications,
    totalVolumeLiters,
    avgPh,
    totalInvestment,
    recentApplications: tankMixOps.slice(0, 5),
  };
}
