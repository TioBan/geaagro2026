// Offline Storage & Calculations Engine for Gestão de Custos Agrícolas & Gêmeo Econômico
import {
  PropertyCropSeason,
  ImplementationCostItem,
  InputItem,
  MachineEquipment,
  LaborCostRecord,
  AgriculturalOperationCost,
  IrrigationCostRecord,
  CommercializationRecord,
  FinancialDiaryEntry,
  EconomicKPIs,
  EconomicSimulationInput,
  EconomicSimulationResult,
  PlotRentabilityStatus,
} from '../types/costs';

const STORAGE_KEYS = {
  SEASONS: 'agronutri_cost_seasons',
  IMPLEMENTATION: 'agronutri_cost_implementation',
  INPUTS: 'agronutri_cost_inputs',
  MACHINES: 'agronutri_cost_machines',
  LABOR: 'agronutri_cost_labor',
  OPERATIONS: 'agronutri_cost_operations',
  IRRIGATION: 'agronutri_cost_irrigation',
  SALES: 'agronutri_cost_sales',
  DIARY: 'agronutri_cost_diary',
};

// Clean state for production use
const DEFAULT_SEASONS: PropertyCropSeason[] = [];
// Default Initial Insumos with Fertilizers and Critical Thresholds
const DEFAULT_INPUTS: InputItem[] = [
  {
    id: 'inp-fert-01',
    farmId: 'farm-1',
    name: 'NPK 04-14-08 Granulado (Adubação de Plantio)',
    category: 'Fertilizantes',
    unit: 'kg',
    quantityPurchased: 15000,
    currentStock: 1200,
    minStockAlert: 5000, // Ponto Crítico: 5.000 kg (Estoque atual 1.200 kg -> CRÍTICO!)
    unitPrice: 3.20,
    totalInvestment: 48000,
    supplier: 'Yara Brasil Fertilizantes',
    batchNumber: 'LOT-YARA-8821',
    purchaseDate: '2026-08-15',
    npkFormulation: '04-14-08',
    storageLocation: 'Galpão Principal - Box A1',
    notes: 'Fertilizante base para semeadura da safra. Abaixo do ponto crítico de segurança.',
  },
  {
    id: 'inp-fert-02',
    farmId: 'farm-1',
    name: 'Ureia Agrícola Protegida 45% N (Adubação de Cobertura)',
    category: 'Fertilizantes',
    unit: 'kg',
    quantityPurchased: 8000,
    currentStock: 850,
    minStockAlert: 3000, // Ponto Crítico: 3.000 kg (Estoque atual 850 kg -> CRÍTICO!)
    unitPrice: 3.85,
    totalInvestment: 30800,
    supplier: 'Mosaic Fertilizantes',
    batchNumber: 'LOT-MOS-4412',
    purchaseDate: '2026-08-20',
    npkFormulation: '45-00-00',
    storageLocation: 'Galpão de Insumos - Box A2',
    notes: 'Ureia tratada com inibidor de urease (NBPT). Reposição urgente para 1ª cobertura.',
  },
  {
    id: 'inp-fert-03',
    farmId: 'farm-1',
    name: 'Cloreto de Potássio (KCl 60% K2O)',
    category: 'Fertilizantes',
    unit: 'kg',
    quantityPurchased: 12000,
    currentStock: 6500,
    minStockAlert: 4000, // Ponto Crítico: 4.000 kg (Estoque atual 6.500 kg -> SEGURO)
    unitPrice: 3.40,
    totalInvestment: 40800,
    supplier: 'EuroChem Fertilizantes',
    batchNumber: 'LOT-EURO-9011',
    purchaseDate: '2026-08-10',
    npkFormulation: '00-00-60',
    storageLocation: 'Galpão de Insumos - Box B1',
    notes: 'Estoque adequado para adubação potássica planejada.',
  },
  {
    id: 'inp-fert-04',
    farmId: 'farm-1',
    name: 'MAP 11-52-00 (Fosfato Monoamônico Purificado)',
    category: 'Fertilizantes',
    unit: 'kg',
    quantityPurchased: 5000,
    currentStock: 2200,
    minStockAlert: 2000, // Ponto Crítico: 2.000 kg (Estoque atual 2.200 kg -> ATENÇÃO/PRÓXIMO AO LIMITE)
    unitPrice: 4.80,
    totalInvestment: 24000,
    supplier: 'Nutrien Soluções Agrícolas',
    batchNumber: 'LOT-NUTR-5561',
    purchaseDate: '2026-08-18',
    npkFormulation: '11-52-00',
    storageLocation: 'Galpão Principal - Box A3',
    notes: 'Fonte de fósforo concentrada para arranque inicial de raízes.',
  },
  {
    id: 'inp-fert-05',
    farmId: 'farm-1',
    name: 'Sulfato de Amônio Granulado (21% N + 24% S)',
    category: 'Fertilizantes',
    unit: 'kg',
    quantityPurchased: 4000,
    currentStock: 420,
    minStockAlert: 1500, // Ponto Crítico: 1.500 kg (Estoque atual 420 kg -> CRÍTICO!)
    unitPrice: 2.90,
    totalInvestment: 11600,
    supplier: 'Fertipar Fertilizantes',
    batchNumber: 'LOT-FERT-2099',
    purchaseDate: '2026-08-22',
    npkFormulation: '21-00-00 + 24% S',
    storageLocation: 'Galpão Principal - Box A4',
    notes: 'Suprimento de nitrogênio e enxofre. Nível crítico de estoque.',
  },
  {
    id: 'inp-sem-01',
    farmId: 'farm-1',
    name: 'Semente de Soja TMG 7062 IPRO (Tratada TSI)',
    category: 'Sementes',
    unit: 'saco',
    quantityPurchased: 350,
    currentStock: 210,
    minStockAlert: 80,
    unitPrice: 265.00,
    totalInvestment: 92750,
    supplier: 'TMG Tropical Genética',
    batchNumber: 'LOT-TMG-7062',
    purchaseDate: '2026-08-25',
    storageLocation: 'Galpão Climatizado de Sementes',
  },
];
const DEFAULT_MACHINES: MachineEquipment[] = [];
const DEFAULT_IMPLEMENTATIONS: ImplementationCostItem[] = [];
const DEFAULT_OPERATIONS: AgriculturalOperationCost[] = [];
const DEFAULT_SALES: CommercializationRecord[] = [];
const DEFAULT_DIARY: FinancialDiaryEntry[] = [];

// Loaders and Savers with safe parsing
export const loadSeasons = (): PropertyCropSeason[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SEASONS);
    return data ? JSON.parse(data) : DEFAULT_SEASONS;
  } catch {
    return DEFAULT_SEASONS;
  }
};

export const saveSeasons = (items: PropertyCropSeason[]) => {
  localStorage.setItem(STORAGE_KEYS.SEASONS, JSON.stringify(items));
};

export const loadInputs = (): InputItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.INPUTS);
    return data ? JSON.parse(data) : DEFAULT_INPUTS;
  } catch {
    return DEFAULT_INPUTS;
  }
};

export const saveInputs = (items: InputItem[]) => {
  localStorage.setItem(STORAGE_KEYS.INPUTS, JSON.stringify(items));
};

export const loadMachines = (): MachineEquipment[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MACHINES);
    return data ? JSON.parse(data) : DEFAULT_MACHINES;
  } catch {
    return DEFAULT_MACHINES;
  }
};

export const saveMachines = (items: MachineEquipment[]) => {
  localStorage.setItem(STORAGE_KEYS.MACHINES, JSON.stringify(items));
};

export const loadImplementations = (): ImplementationCostItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.IMPLEMENTATION);
    return data ? JSON.parse(data) : DEFAULT_IMPLEMENTATIONS;
  } catch {
    return DEFAULT_IMPLEMENTATIONS;
  }
};

export const saveImplementations = (items: ImplementationCostItem[]) => {
  localStorage.setItem(STORAGE_KEYS.IMPLEMENTATION, JSON.stringify(items));
};

export const loadOperations = (): AgriculturalOperationCost[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.OPERATIONS);
    return data ? JSON.parse(data) : DEFAULT_OPERATIONS;
  } catch {
    return DEFAULT_OPERATIONS;
  }
};

export const saveOperations = (items: AgriculturalOperationCost[]) => {
  localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify(items));
};

export const loadSales = (): CommercializationRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SALES);
    return data ? JSON.parse(data) : DEFAULT_SALES;
  } catch {
    return DEFAULT_SALES;
  }
};

export const saveSales = (items: CommercializationRecord[]) => {
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(items));
};

export const loadDiary = (): FinancialDiaryEntry[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DIARY);
    return data ? JSON.parse(data) : DEFAULT_DIARY;
  } catch {
    return DEFAULT_DIARY;
  }
};

export const saveDiary = (items: FinancialDiaryEntry[]) => {
  localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(items));
};

export const loadIrrigation = (): IrrigationCostRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.IRRIGATION);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveIrrigation = (items: IrrigationCostRecord[]) => {
  localStorage.setItem(STORAGE_KEYS.IRRIGATION, JSON.stringify(items));
};

export const loadLabor = (): LaborCostRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LABOR);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveLabor = (items: LaborCostRecord[]) => {
  localStorage.setItem(STORAGE_KEYS.LABOR, JSON.stringify(items));
};

export interface CostModuleData {
  seasons: PropertyCropSeason[];
  inputs: InputItem[];
  machines: MachineEquipment[];
  operations: AgriculturalOperationCost[];
  sales: CommercializationRecord[];
  diary: FinancialDiaryEntry[];
  implementations?: ImplementationCostItem[];
  irrigation?: IrrigationCostRecord[];
  labor?: LaborCostRecord[];
}

export const loadCostModuleData = (): CostModuleData => {
  return {
    seasons: loadSeasons(),
    inputs: loadInputs(),
    machines: loadMachines(),
    operations: loadOperations(),
    sales: loadSales(),
    diary: loadDiary(),
    implementations: loadImplementations(),
    irrigation: loadIrrigation(),
    labor: loadLabor(),
  };
};

export const saveCostModuleData = (data: CostModuleData) => {
  if (data.seasons) saveSeasons(data.seasons);
  if (data.inputs) saveInputs(data.inputs);
  if (data.machines) saveMachines(data.machines);
  if (data.operations) saveOperations(data.operations);
  if (data.sales) saveSales(data.sales);
  if (data.diary) saveDiary(data.diary);
  if (data.implementations) saveImplementations(data.implementations);
  if (data.irrigation) saveIrrigation(data.irrigation);
  if (data.labor) saveLabor(data.labor);
};

// Economic Calculator Engine (COE, COT, CTP, Break-even, ROI, Margins)
export const calculateEconomicKPIs = (
  season: PropertyCropSeason,
  arg2?: ImplementationCostItem[] | AgriculturalOperationCost[],
  arg3?: AgriculturalOperationCost[] | CommercializationRecord[],
  arg4?: CommercializationRecord[] | MachineEquipment[] | InputItem[],
  arg5?: MachineEquipment[],
  arg6: IrrigationCostRecord[] = [],
  arg7: LaborCostRecord[] = []
): EconomicKPIs => {
  // Disambiguate arguments to support different calling conventions
  let implementations: ImplementationCostItem[] = [];
  let operations: AgriculturalOperationCost[] = [];
  let sales: CommercializationRecord[] = [];
  let machines: MachineEquipment[] = [];
  let irrigation: IrrigationCostRecord[] = arg6;
  let labor: LaborCostRecord[] = arg7;

  if (Array.isArray(arg2)) {
    if (arg2.length === 0 || 'category' in arg2[0]) {
      implementations = arg2 as ImplementationCostItem[];
    } else if ('operationType' in arg2[0]) {
      operations = arg2 as AgriculturalOperationCost[];
    }
  }

  if (Array.isArray(arg3)) {
    if (arg3.length > 0 && 'operationType' in arg3[0]) {
      operations = arg3 as AgriculturalOperationCost[];
    } else if (arg3.length === 0 || 'customerName' in arg3[0]) {
      sales = arg3 as CommercializationRecord[];
    }
  }

  if (Array.isArray(arg4)) {
    if (arg4.length > 0 && 'customerName' in arg4[0]) {
      sales = arg4 as CommercializationRecord[];
    } else if (arg4.length > 0 && 'brandModel' in arg4[0]) {
      machines = arg4 as MachineEquipment[];
    }
  }

  if (Array.isArray(arg5)) {
    machines = arg5;
  }

  // Fallback defaults if arrays are empty or unassigned
  if (operations.length === 0 && Array.isArray(arg2) && arg2.length > 0 && 'operationType' in arg2[0]) {
    operations = arg2 as AgriculturalOperationCost[];
  }
  const areaHa = season?.plantedAreaHa > 0 ? season.plantedAreaHa : 1;

  // 1. Direct operational costs (Inputs + Fuel + Operators + Labor)
  const seasonOps = (operations || []).filter(o => o?.seasonId === season?.id);
  const totalOpsCost = seasonOps.reduce((acc, curr) => acc + (curr?.totalOperationCost || 0), 0);

  const seasonImpl = (implementations || []).filter(i => i?.seasonId === season?.id);
  const totalImplCost = seasonImpl.reduce((acc, curr) => acc + (curr?.totalCost || 0), 0);

  const seasonIrrigation = (irrigation || []).filter(i => i?.seasonId === season?.id);
  const totalIrrigationCost = seasonIrrigation.reduce((acc, curr) => acc + (curr?.totalIrrigationCost || 0), 0);

  const seasonLabor = (labor || []).filter(l => l?.seasonId === season?.id);
  const totalLaborCost = seasonLabor.reduce((acc, curr) => acc + (curr?.totalCost || 0), 0);

  // COE (Custo Operacional Efetivo) = Insumos + Operações + Mão de obra direta + Irrigação + Implantação
  const coeTotal = totalOpsCost + totalImplCost + totalIrrigationCost + totalLaborCost;
  const coePerHa = coeTotal / areaHa;

  // Depreciação de máquinas proporcional
  const totalDepreciation = (machines || []).reduce((acc, m) => acc + (m?.depreciationYearCost || 0), 0);
  const totalInsurance = (machines || []).reduce((acc, m) => acc + (m?.insuranceYearCost || 0), 0);
  const fixedMachineCostsSeason = (totalDepreciation + totalInsurance) * 0.5; // proporcional à safra

  // COT (Custo Operacional Total) = COE + Depreciação + Custos Fixos
  const cotTotal = coeTotal + fixedMachineCostsSeason;
  const cotPerHa = cotTotal / areaHa;

  // CTP (Custo Total de Produção) = COT + Remuneração da Terra / Capital (estimado em +12%)
  const ctpTotal = cotTotal * 1.12;
  const ctpPerHa = ctpTotal / areaHa;

  // Commercialization & Revenues
  const seasonSales = (sales || []).filter(s => s?.seasonId === season?.id);
  const grossRevenueTotal = seasonSales.reduce((acc, curr) => acc + (curr?.totalGrossRevenue || 0), 0);
  const netRevenueTotal = seasonSales.reduce((acc, curr) => acc + (curr?.netRevenueRealized || 0), 0);

  const totalBagsHarvested = seasonSales.reduce((acc, curr) => acc + (curr?.quantityBags || 0), 0);

  let estimatedTotalBags = 0;
  let currentAvgPricePerBag = 0;
  let effectiveRevenueTotal = 0;

  if (seasonSales.length > 0 && grossRevenueTotal > 0) {
    effectiveRevenueTotal = grossRevenueTotal;
    estimatedTotalBags = totalBagsHarvested;
    currentAvgPricePerBag = totalBagsHarvested > 0 ? grossRevenueTotal / totalBagsHarvested : 0;
  } else if (season && season.id && season.id !== 'empty' && (season.targetYieldBagsHa || 0) > 0 && areaHa > 0) {
    estimatedTotalBags = season.targetYieldBagsHa * areaHa;
    currentAvgPricePerBag = 135.00;
    effectiveRevenueTotal = estimatedTotalBags * currentAvgPricePerBag;
  } else {
    estimatedTotalBags = 0;
    currentAvgPricePerBag = 0;
    effectiveRevenueTotal = 0;
  }
  const grossRevenuePerHa = effectiveRevenueTotal / areaHa;

  const grossMarginTotal = effectiveRevenueTotal - coeTotal;
  const netMarginTotal = effectiveRevenueTotal - ctpTotal;

  const grossMarginPct = effectiveRevenueTotal > 0 ? (grossMarginTotal / effectiveRevenueTotal) * 100 : 0;
  const netMarginPct = effectiveRevenueTotal > 0 ? (netMarginTotal / effectiveRevenueTotal) * 100 : 0;

  const costPerBag = estimatedTotalBags > 0 ? coeTotal / estimatedTotalBags : 0;
  const breakEvenPricePerBag = estimatedTotalBags > 0 ? ctpTotal / estimatedTotalBags : 0;
  const breakEvenYieldBagsHa = currentAvgPricePerBag > 0 ? ctpPerHa / currentAvgPricePerBag : 0;

  const roiPct = ctpTotal > 0 ? ((effectiveRevenueTotal - ctpTotal) / ctpTotal) * 100 : 0;

  return {
    totalSeasonCost: Math.round(coeTotal),
    coe: Math.round(coePerHa),
    cot: Math.round(cotPerHa),
    ctp: Math.round(ctpPerHa),
    costPerHa: Math.round(coePerHa),
    costPerBag: Math.round(costPerBag * 10) / 10,
    grossRevenueTotal: Math.round(effectiveRevenueTotal),
    grossRevenuePerHa: Math.round(grossRevenuePerHa),
    grossMarginTotal: Math.round(grossMarginTotal),
    netMarginTotal: Math.round(netMarginTotal),
    grossMarginPct: Math.round(grossMarginPct * 10) / 10,
    netMarginPct: Math.round(netMarginPct * 10) / 10,
    breakEvenYieldBagsHa: Math.round(breakEvenYieldBagsHa * 10) / 10,
    breakEvenPricePerBag: Math.round(breakEvenPricePerBag * 10) / 10,
    estimatedProfitTotal: Math.round(netMarginTotal),
    roiPct: Math.round(roiPct * 10) / 10,
    totalAreaHa: areaHa,
    totalBagsHarvested: Math.round(estimatedTotalBags),
  };
};

// Economic Simulator Engine ("What If?")
export const runEconomicSimulation = (
  baseKPIs: EconomicKPIs,
  input: EconomicSimulationInput
): EconomicSimulationResult => {
  const fertImpactPerHa = (baseKPIs.costPerHa * 0.35) * (input.fertilizerPriceChangePct / 100);
  const passReductionImpactPerHa = input.pesticidePassReductionCount * 140; // ~R$ 140 por hectare por pulverização economizada
  const fuelImpactPerHa = (baseKPIs.costPerHa * 0.12) * (input.fuelPriceChangePct / 100);

  const newCostPerHa = baseKPIs.costPerHa + fertImpactPerHa - passReductionImpactPerHa + fuelImpactPerHa;
  const costDiff = newCostPerHa - baseKPIs.costPerHa;

  const yieldMultiplier = 1 + (input.expectedYieldChangePct / 100);
  const newYieldBagsHa = (baseKPIs.totalBagsHarvested / (baseKPIs.totalAreaHa || 1)) * yieldMultiplier;

  const newGrossRevPerHa = newYieldBagsHa * input.commodityPricePerBag;
  const newNetMarginPerHa = newGrossRevPerHa - newCostPerHa;

  const newBreakEvenBagsHa = input.commodityPricePerBag > 0 ? newCostPerHa / input.commodityPricePerBag : 0;
  const newCostPerBag = newYieldBagsHa > 0 ? newCostPerHa / newYieldBagsHa : 0;
  const newProfitabilityPct = newGrossRevPerHa > 0 ? (newNetMarginPerHa / newGrossRevPerHa) * 100 : 0;

  return {
    baseCostPerHa: Math.round(baseKPIs.costPerHa),
    simulatedCostPerHa: Math.round(newCostPerHa),
    costDifferencePerHa: Math.round(costDiff),
    baseCostPerBag: Math.round(baseKPIs.costPerBag * 10) / 10,
    simulatedCostPerBag: Math.round(newCostPerBag * 10) / 10,
    baseNetMarginPerHa: Math.round(baseKPIs.grossRevenuePerHa - baseKPIs.costPerHa),
    simulatedNetMarginPerHa: Math.round(newNetMarginPerHa),
    baseBreakEvenBagsHa: Math.round(baseKPIs.breakEvenYieldBagsHa * 10) / 10,
    simulatedBreakEvenBagsHa: Math.round(newBreakEvenBagsHa * 10) / 10,
    simulatedProfitabilityPct: Math.round(newProfitabilityPct * 10) / 10,
  };
};

// Classify visual rentability for farm plots
export const getPlotRentabilityCategory = (marginPct: number): PlotRentabilityStatus => {
  if (marginPct >= 35) return 'high_profitability';
  if (marginPct >= 15) return 'medium_profitability';
  if (marginPct >= 5) return 'cost_attention';
  return 'low_profitability';
};
