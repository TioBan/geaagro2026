// Types for Gestão de Custos Agrícolas & Gêmeo Econômico da Safra

export type CostCategoryType =
  | 'Preparo do Solo'
  | 'Correção (Calagem/Gessagem)'
  | 'Semeadura / Plantio'
  | 'Fertilizantes & Adubação'
  | 'Defensivos & Manejo'
  | 'Bioinsumos & Inoculantes'
  | 'Irrigação & Energia'
  | 'Mão de Obra & Diárias'
  | 'Máquinas & Combustível'
  | 'Colheita & Transporte'
  | 'Pós-Colheita & Comercialização'
  | 'Outros Custos Operacionais';

export type InputCategory =
  | 'Sementes'
  | 'Fertilizantes'
  | 'Corretivos'
  | 'Defensivos'
  | 'Bioinsumos'
  | 'Inoculantes'
  | 'Adjuvantes'
  | 'Outros';

export type MachineType =
  | 'Trator'
  | 'Colhedora'
  | 'Pulverizador'
  | 'Plantadeira'
  | 'Caminhão'
  | 'Pivô Central'
  | 'Utilitário';

export type ProductionSystem =
  | 'Plantio Direto'
  | 'Convencional'
  | 'Irrigado (Pivô)'
  | 'Orgânico'
  | 'Integração Lavoura-Pectuária (ILP)';

export type PlotRentabilityStatus =
  | 'high_profitability'   // 🟢 Alta rentabilidade (> 35% margem)
  | 'medium_profitability' // 🟡 Rentabilidade média (15-35% margem)
  | 'cost_attention'       // 🟠 Atenção aos custos (5-15% margem)
  | 'low_profitability';   // 🔴 Baixa rentabilidade / Prejuízo (< 5% margem)

export interface PropertyCropSeason {
  id: string;
  farmId: string;
  farmName: string;
  seasonName: string; // e.g. "Safra 2025/2026"
  crop: string; // e.g. "Soja", "Milho", "Algodão"
  cultivar: string;
  plantedAreaHa: number;
  productionSystem: ProductionSystem;
  targetYieldBagsHa: number; // saca/ha ou t/ha
  targetCostPerHa: number; // R$/ha
  targetProfitabilityPct: number; // %
  plannedBudgetTotal: number; // R$
  startDate: string;
  endDate: string;
  status: 'Planejada' | 'Em Andamento' | 'Encerrada';
  notes?: string;
}

export interface ImplementationCostItem {
  id: string;
  seasonId: string;
  farmId: string;
  plotId?: string;
  plotName?: string;
  category: 'Preparo do Solo' | 'Correção (Calagem/Gessagem)' | 'Semeadura / Plantio' | 'Irrigação Inicial' | 'Análises de Solo';
  description: string;
  costPerHa: number;
  totalCost: number;
  date: string;
  supplierOrService?: string;
  notes?: string;
}

export interface InputItem {
  id: string;
  farmId: string;
  name: string;
  category: InputCategory;
  unit: 'kg' | 'L' | 'saco' | 'dose' | 't' | 'galão';
  quantityPurchased: number;
  currentStock: number;
  minStockAlert: number; // Ponto Crítico de Estoque
  unitPrice: number; // R$/unidade
  totalInvestment: number; // R$
  supplier: string;
  batchNumber: string;
  purchaseDate: string;
  expirationDate?: string;
  notes?: string;
  npkFormulation?: string; // Ex: "04-14-08", "20-00-20", "MAP 11-52-00"
  storageLocation?: string; // Ex: "Galpão Principal - Box 02", "Silo de Fertilizantes"
}

export interface MachineEquipment {
  id: string;
  farmId: string;
  name: string;
  type: MachineType;
  brandModel: string;
  manufactureYear: number;
  acquisitionValue: number; // R$
  hourlyRate: number; // R$/hora
  fuelConsLh: number; // L/hora
  accumulatedHours: number;
  preventiveMaintCostYear: number;
  correctiveMaintCostYear: number;
  depreciationYearCost: number;
  insuranceYearCost: number;
  status: 'Operacional' | 'Em Manutenção' | 'Inativo';
}

export interface LaborCostRecord {
  id: string;
  farmId: string;
  employeeName: string;
  contractType: 'CLT / Mensalista' | 'Diarista / Terceirizado' | 'Empreitada / Serviço';
  hoursWorked: number;
  dailyRateOrHourly: number;
  chargesPercent: number; // % encargos (ex: 45%)
  totalCost: number;
  activityDescription: string;
  date: string;
  seasonId?: string;
}

export interface AgriculturalOperationCost {
  id: string;
  seasonId: string;
  farmId: string;
  plotId: string;
  plotName: string;
  operationType: 'Plantio' | 'Pulverização' | 'Adubação' | 'Irrigação' | 'Capina / Manejo' | 'Colheita' | 'Transporte';
  date: string;
  hoursWorked: number;
  machineId?: string;
  machineName?: string;
  fuelLiters: number;
  fuelPricePerLiter: number;
  fuelCostTotal: number;
  operatorCostTotal: number;
  inputsUsed: {
    inputId: string;
    inputName: string;
    quantityUsed: number;
    unit: string;
    unitPrice: number;
    totalCost: number;
  }[];
  otherCosts: number;
  totalOperationCost: number;
}

export interface IrrigationCostRecord {
  id: string;
  farmId: string;
  seasonId: string;
  plotId: string;
  plotName: string;
  systemName: string; // Ex: Pivô 01
  electricEnergyCost: number;
  dieselCost: number;
  waterVolumeM3: number;
  operatingHours: number;
  maintenanceCost: number;
  irrigatedAreaHa: number;
  totalIrrigationCost: number;
  date: string;
}

export interface CommercializationRecord {
  id: string;
  seasonId: string;
  farmId: string;
  customerName: string;
  crop: string;
  quantityBags: number;
  pricePerBag: number; // R$/saca
  totalGrossRevenue: number;
  freightCost: number;
  commissionCost: number;
  storageCost: number;
  taxesCost: number;
  netRevenueRealized: number;
  contractType: 'Balcão' | 'Mercado Futuro' | 'Barter' | 'Contrato Físico';
  date: string;
}

export interface FinancialDiaryEntry {
  id: string;
  farmId?: string;
  seasonId: string;
  plotId?: string;
  plotName?: string;
  date: string;
  title: string;
  photoUrl?: string;
  notes: string;
  weatherEvent?: 'Sem Eventos' | 'Geada' | 'Estiagem' | 'Chuva Forte' | 'Granizo' | 'Onda de Calor';
  phytosanitaryOccurrence?: string;
  phytosanitaryEvent?: string;
  managementDecision?: string;
  costImpact?: number;
}

export interface EconomicKPIs {
  totalSeasonCost: number; // R$
  coe: number; // Custo Operacional Efetivo R$/ha
  cot: number; // Custo Operacional Total R$/ha
  ctp: number; // Custo Total de Produção R$/ha
  costPerHa: number; // R$/ha
  costPerBag: number; // R$/saca (baseado na produção total estimada/realizada)
  grossRevenueTotal: number; // R$
  grossRevenuePerHa: number; // R$/ha
  grossMarginTotal: number; // R$
  netMarginTotal: number; // R$
  grossMarginPct: number; // %
  netMarginPct: number; // %
  breakEvenYieldBagsHa: number; // sacas/ha para cobrir custos
  breakEvenPricePerBag: number; // R$/saca para cobrir custos
  estimatedProfitTotal: number; // R$
  roiPct: number; // % Retorno sobre Investimento
  totalAreaHa: number;
  totalBagsHarvested: number;
}

export interface EconomicSimulationInput {
  fertilizerPriceChangePct: number; // % (ex: +15%)
  pesticidePassReductionCount: number; // ex: -1 aplicação
  fuelPriceChangePct: number; // %
  expectedYieldChangePct: number; // %
  commodityPricePerBag: number; // R$/saca
}

export interface EconomicSimulationResult {
  baseCostPerHa: number;
  simulatedCostPerHa: number;
  costDifferencePerHa: number;
  baseCostPerBag: number;
  simulatedCostPerBag: number;
  baseNetMarginPerHa: number;
  simulatedNetMarginPerHa: number;
  baseBreakEvenBagsHa: number;
  simulatedBreakEvenBagsHa: number;
  simulatedProfitabilityPct: number;
}

export interface TimelineFinancialEvent {
  id: string;
  date: string;
  phase: 'Compra de Insumos' | 'Preparo & Implantação' | 'Tratos Culturais' | 'Colheita' | 'Comercialização';
  title: string;
  description: string;
  amount: number;
  type: 'inflow' | 'outflow'; // receita ou despesa
  category: string;
}
