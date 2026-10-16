import { HydroponicBench, NutrientSolutionReservoir, HydroponicAnnotation, HydroponicAlert } from '../types/hydroponics';
import { FieldOperation } from '../types/fieldbook';

export const STORAGE_KEYS = {
  BENCHES: 'geaagro_hydroponics_benches_v1',
  RESERVOIRS: 'geaagro_hydroponics_reservoirs_v1',
  ANNOTATIONS: 'geaagro_hydroponics_annotations_v1',
  OPERATIONS: 'geaagro_fieldbook_operations_v1',
  ALERTS: 'geaagro_hydroponics_alerts_v1',
};

// Initial Benches for Hydroponics
export const DEFAULT_HYDROPONIC_BENCHES: HydroponicBench[] = [
  {
    id: 'banc-01',
    code: 'BANC-NFT-01',
    systemType: 'NFT',
    greenhouseSection: 'Estufa 01 - Setor A (Norte)',
    cropName: 'Alface Crespa',
    cultivar: 'Vanda (Enza Zaden)',
    category: 'folhosa',
    transplantDate: '2026-08-25',
    expectedHarvestDate: '2026-09-18',
    daysAfterTransplant: 22,
    totalCapacityPlants: 750,
    currentPlantsCount: 742,
    reservoirId: 'res-01',
    status: 'pronto_colheita',
    healthStatus: 'excelente',
    estimatedYieldKg: 225,
    notes: 'Plantas com excelente vigor vegetativo, coloração verde brilhante e sistema radicular branco e denso. Pronto para colheita comercial.',
    gridPosition: { row: 1, col: 1 },
  },
  {
    id: 'banc-02',
    code: 'BANC-NFT-02',
    systemType: 'NFT',
    greenhouseSection: 'Estufa 01 - Setor A (Norte)',
    cropName: 'Rúcula Gigante',
    cultivar: 'Cultivada Folha Larga',
    category: 'folhosa',
    transplantDate: '2026-09-02',
    expectedHarvestDate: '2026-09-22',
    daysAfterTransplant: 14,
    totalCapacityPlants: 900,
    currentPlantsCount: 885,
    reservoirId: 'res-01',
    status: 'desenvolvimento',
    healthStatus: 'excelente',
    estimatedYieldKg: 180,
    notes: 'Excelente pegamento. Manter condutividade elétrica rigorosa entre 1.5 e 1.7 mS/cm para picância ideal.',
    gridPosition: { row: 1, col: 2 },
  },
  {
    id: 'banc-03',
    code: 'BANC-DFT-01',
    systemType: 'DFT',
    greenhouseSection: 'Estufa 01 - Setor B (Centro)',
    cropName: 'Agrião d’Água',
    cultivar: 'Folha Larga d’Água',
    category: 'folhosa',
    transplantDate: '2026-09-06',
    expectedHarvestDate: '2026-09-28',
    daysAfterTransplant: 10,
    totalCapacityPlants: 600,
    currentPlantsCount: 590,
    reservoirId: 'res-02',
    status: 'desenvolvimento',
    healthStatus: 'excelente',
    estimatedYieldKg: 150,
    notes: 'Lâmina de solução de 5 cm com aeração contínua. Oxigênio dissolvido mantido em 7.2 mg/L.',
    gridPosition: { row: 1, col: 3 },
  },
  {
    id: 'banc-04',
    code: 'BANC-NFT-03',
    systemType: 'NFT',
    greenhouseSection: 'Estufa 01 - Setor B (Centro)',
    cropName: 'Alface Americana',
    cultivar: 'Lucy Brown',
    category: 'folhosa',
    transplantDate: '2026-08-28',
    expectedHarvestDate: '2026-09-25',
    daysAfterTransplant: 19,
    totalCapacityPlants: 650,
    currentPlantsCount: 638,
    reservoirId: 'res-01',
    status: 'desenvolvimento',
    healthStatus: 'alerta',
    estimatedYieldKg: 260,
    notes: 'Atenção aos horários de pico térmico (12h-14h). Pulverização foliar de Cloreto de Cálcio 0.2% aplicada para prevenção de tip-burn.',
    gridPosition: { row: 2, col: 1 },
  },
  {
    id: 'banc-05',
    code: 'BANC-SUB-01',
    systemType: 'Substrato_Gotejo',
    greenhouseSection: 'Estufa 02 - Setor Frutos (Sul)',
    cropName: 'Tomate Cereja / Sweet Grape',
    cultivar: 'Grape Sweet Heaven',
    category: 'fruto',
    transplantDate: '2026-07-15',
    expectedHarvestDate: '2026-10-30',
    daysAfterTransplant: 63,
    totalCapacityPlants: 300,
    currentPlantsCount: 298,
    reservoirId: 'res-03',
    status: 'desenvolvimento',
    healthStatus: 'excelente',
    estimatedYieldKg: 1200,
    notes: 'Em pleno florescimento e pegamento dos primeiros cachos. CE calibrada em 2.4 mS/cm com alto K e Ca.',
    gridPosition: { row: 2, col: 2 },
  },
  {
    id: 'banc-06',
    code: 'BANC-BERC-01',
    systemType: 'NFT',
    greenhouseSection: 'Estufa 01 - Maternidade / Berçário',
    cropName: 'Mix Alfaces & Ervas (Berçário)',
    cultivar: 'Variadas',
    category: 'folhosa',
    transplantDate: '2026-09-10',
    expectedHarvestDate: '2026-09-20',
    daysAfterTransplant: 6,
    totalCapacityPlants: 2400,
    currentPlantsCount: 2350,
    reservoirId: 'res-01',
    status: 'maternidade',
    healthStatus: 'excelente',
    estimatedYieldKg: 0,
    notes: 'Mudas recém transferidas das espumas fenólicas para o perfil de berçário (50mm). CE leve de 1.0 mS/cm.',
    gridPosition: { row: 2, col: 3 },
  },
];

// Initial Reservoirs
export const DEFAULT_HYDROPONIC_RESERVOIRS: NutrientSolutionReservoir[] = [
  {
    id: 'res-01',
    name: 'Reservatório 01 - Folhosas NFT (Principal)',
    capacityLiters: 2000,
    currentVolumeLiters: 1850,
    currentPH: 6.05,
    targetPHMin: 5.8,
    targetPHMax: 6.3,
    currentEC: 1.48, // mS/cm
    targetECMin: 1.3,
    targetECMax: 1.6,
    solutionTempC: 21.4,
    dissolvedOxygenPpm: 6.8,
    pumpStatus: 'ligada',
    lastWaterRefillDate: '2026-09-15 08:30',
    lastNutrientAdjustmentDate: '2026-09-15 09:10',
    waterConsumptionLitersDay: 180,
    associatedBenches: ['banc-01', 'banc-02', 'banc-04', 'banc-06'],
  },
  {
    id: 'res-02',
    name: 'Reservatório 02 - Agrião & Rúcula DFT',
    capacityLiters: 1500,
    currentVolumeLiters: 1420,
    currentPH: 6.2,
    targetPHMin: 6.0,
    targetPHMax: 6.5,
    currentEC: 1.65, // mS/cm
    targetECMin: 1.5,
    targetECMax: 1.8,
    solutionTempC: 20.8,
    dissolvedOxygenPpm: 7.4,
    pumpStatus: 'timer',
    lastWaterRefillDate: '2026-09-14 16:00',
    lastNutrientAdjustmentDate: '2026-09-14 16:45',
    waterConsumptionLitersDay: 130,
    associatedBenches: ['banc-03'],
  },
  {
    id: 'res-03',
    name: 'Reservatório 03 - Tomateiro & Frutos em Substrato',
    capacityLiters: 1200,
    currentVolumeLiters: 1100,
    currentPH: 5.95,
    targetPHMin: 5.8,
    targetPHMax: 6.2,
    currentEC: 2.35, // mS/cm
    targetECMin: 2.0,
    targetECMax: 2.6,
    solutionTempC: 22.1,
    dissolvedOxygenPpm: 6.2,
    pumpStatus: 'timer',
    lastWaterRefillDate: '2026-09-15 07:45',
    lastNutrientAdjustmentDate: '2026-09-15 08:15',
    waterConsumptionLitersDay: 240,
    associatedBenches: ['banc-05'],
  },
];

// Initial Technical Annotations (Synchronized with Caderno de Campo)
export const DEFAULT_HYDROPONIC_ANNOTATIONS: HydroponicAnnotation[] = [
  {
    id: 'ann-01',
    date: '2026-09-15',
    time: '09:10',
    author: 'Eng. Agrônomo Marcelo Torres',
    category: 'manejo_solucao',
    title: 'Ajuste e Calibração de Nutrientes - Reservatório 01',
    notes: 'Reposição de 350L de água no reservatório principal. Adição de 260g de Nitrato de Cálcio (Tanque A) e 180g de Nitrato de Potássio + 70g MKP (Tanque B). Leitura final: pH 6.05 | CE 1.48 mS/cm | Temp: 21.4°C.',
    reservoirId: 'res-01',
    reservoirName: 'Reservatório 01 - Folhosas NFT (Principal)',
    phValue: 6.05,
    ecValue: 1.48,
    waterRefilledLiters: 350,
    fertilizersAddedSummary: 'Nitrato de Cálcio 260g, Nitrato de Potássio 180g, MKP 70g, Micros Quelatizados 10g',
    temperatureC: 21.4,
    syncedWithFieldBook: true,
    fieldOperationId: 'op-hydro-01',
    createdAt: '2026-09-15T09:10:00Z',
  },
  {
    id: 'ann-02',
    date: '2026-09-14',
    time: '14:30',
    author: 'Téc. Agrícola Juliana Silveira',
    category: 'sanidade_pragas',
    title: 'Inspeção Fitossanitária de Raízes e Copas - Setor A e B',
    notes: 'Varredura visual em todas as bancadas NFT. Raízes da BANC-NFT-01 e BANC-NFT-02 completamente brancas e sadias, sem indícios de Pythium. Nenhuma ocorrência de tripes ou pulgões nas armadilhas amarelas adesivas.',
    benchId: 'banc-01',
    benchCode: 'BANC-NFT-01',
    pestOrDiseaseObserved: 'Ausência de pragas / Raízes 100% sadias',
    syncedWithFieldBook: true,
    fieldOperationId: 'op-hydro-02',
    createdAt: '2026-09-14T14:30:00Z',
  },
  {
    id: 'ann-03',
    date: '2026-09-12',
    time: '08:00',
    author: 'Carlos Eduardo (Coord. Estufas)',
    category: 'colheita',
    title: 'Despesca / Colheita Comercial de Rúcula - Lote BANC-NFT-02',
    notes: 'Colheita parcial matinal de 280 maços padronizados com raiz embalados em saco microperfurado. Destinado ao Supermercado Alvorada. Qualidade sensorial excelente e crocância comprovada.',
    benchId: 'banc-02',
    benchCode: 'BANC-NFT-02',
    syncedWithFieldBook: true,
    fieldOperationId: 'op-hydro-03',
    createdAt: '2026-09-12T08:00:00Z',
  },
  {
    id: 'ann-04',
    date: '2026-09-10',
    time: '11:00',
    author: 'Eng. Agrônomo Marcelo Torres',
    category: 'bancada_transplante',
    title: 'Transplante da Espuma Fenólica para Berçário NFT',
    notes: 'Transferência de 2.400 plântulas de Alface Crespa e Roxa das bandejas de germinação para o Berçário BANC-BERC-01. Pegamento imediato sob tela termorrefletora 50%.',
    benchId: 'banc-06',
    benchCode: 'BANC-BERC-01',
    syncedWithFieldBook: true,
    fieldOperationId: 'op-hydro-04',
    createdAt: '2026-09-10T11:00:00Z',
  },
];

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

// Sync all existing default hydroponic operations into FieldBook if not already present
export function ensureInitialHydroponicSync(farmId = 'farm-1'): void {
  try {
    const opsRaw = localStorage.getItem(STORAGE_KEYS.OPERATIONS);
    const existingOps: FieldOperation[] = opsRaw ? JSON.parse(opsRaw) : [];
    
    // Check if initial hydroponics annotations exist in operations
    const initialAnnotations = getHydroponicAnnotations();
    let hasNew = false;
    const mergedOps = [...existingOps];

    for (const ann of initialAnnotations) {
      const opId = ann.fieldOperationId || `op-hydro-${ann.id}`;
      const found = mergedOps.some(o => o.id === opId);
      if (!found) {
        mergedOps.unshift(createFieldOperationFromHydroponicAnnotation(ann, farmId));
        hasNew = true;
      }
    }

    if (hasNew) {
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
    : '6.05';
    
  const avgEC = reservoirs.length > 0
    ? (reservoirs.reduce((sum, r) => sum + r.currentEC, 0) / reservoirs.length).toFixed(2)
    : '1.50';

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
