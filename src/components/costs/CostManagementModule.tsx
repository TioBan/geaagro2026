import React, { useState, useEffect } from 'react';
import {
  PropertyCropSeason,
  InputItem,
  MachineEquipment,
  AgriculturalOperationCost,
  CommercializationRecord,
  FinancialDiaryEntry,
} from '../../types/costs';
import { loadCostModuleData, saveCostModuleData, calculateEconomicKPIs } from '../../utils/costStorage';

// Lazy load heavy child modules to improve performance and avoid "Failed to fetch dynamically imported module" errors
const EconomicTwin360View = React.lazy(() => import('./EconomicTwin360View').then((m: any) => ({ default: m.EconomicTwin360View || m.default }))) as any;
const FinancialDashboardView = React.lazy(() => import('./FinancialDashboardView').then((m: any) => ({ default: m.FinancialDashboardView || m.default }))) as any;
const SeasonPlanningView = React.lazy(() => import('./SeasonPlanningView').then((m: any) => ({ default: m.SeasonPlanningView || m.default }))) as any;
const InputsStockView = React.lazy(() => import('./InputsStockView').then((m: any) => ({ default: m.InputsStockView || m.default }))) as any;
const OperationsMachineryView = React.lazy(() => import('./OperationsMachineryView').then((m: any) => ({ default: m.OperationsMachineryView || m.default }))) as any;
const CommercializationView = React.lazy(() => import('./CommercializationView').then((m: any) => ({ default: m.CommercializationView || m.default }))) as any;
const EconomicSimulatorsView = React.lazy(() => import('./EconomicSimulatorsView').then((m: any) => ({ default: m.EconomicSimulatorsView || m.default }))) as any;
const PlotEconomicMapView = React.lazy(() => import('./PlotEconomicMapView').then((m: any) => ({ default: m.PlotEconomicMapView || m.default }))) as any;
const TimelineAndDiaryView = React.lazy(() => import('./TimelineAndDiaryView').then((m: any) => ({ default: m.TimelineAndDiaryView || m.default }))) as any;
const FinancialReportsView = React.lazy(() => import('./FinancialReportsView').then((m: any) => ({ default: m.FinancialReportsView || m.default }))) as any;

export type CostTabType =
  | '360'
  | 'dashboard'
  | 'planning'
  | 'inputs'
  | 'operations'
  | 'commercialization'
  | 'simulators'
  | 'map'
  | 'timeline'
  | 'reports';

interface CostManagementModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (subTab: string) => void;
  selectedFarmId?: string;
}

export const CostManagementModule: React.FC<CostManagementModuleProps> = ({
  activeSubTab: externalSubTab,
  setActiveSubTab: externalSetActiveSubTab,
  selectedFarmId,
}) => {
  const [internalTab, setInternalTab] = useState<CostTabType>('360');

  useEffect(() => {
    if (externalSubTab) {
      setInternalTab(externalSubTab as CostTabType);
    }
  }, [externalSubTab]);

  const activeTab = (externalSubTab as CostTabType) || internalTab;

  const [seasons, setSeasons] = useState<PropertyCropSeason[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<PropertyCropSeason | null>(null);
  const [inputs, setInputs] = useState<InputItem[]>([]);
  const [machines, setMachines] = useState<MachineEquipment[]>([]);
  const [operations, setOperations] = useState<AgriculturalOperationCost[]>([]);
  const [sales, setSales] = useState<CommercializationRecord[]>([]);
  const [diary, setDiary] = useState<FinancialDiaryEntry[]>([]);

  // Load initial data from offline storage
  useEffect(() => {
    const data = loadCostModuleData();
    setSeasons(data.seasons);
    setInputs(data.inputs);
    setMachines(data.machines);
    setOperations(data.operations);
    setSales(data.sales);
    setDiary(data.diary);

    if (data.seasons && data.seasons.length > 0) {
      setSelectedSeason(data.seasons[0]);
    }
  }, []);

  // Save changes to localStorage whenever state updates
  const updateStateAndPersist = (
    newSeasons = seasons,
    newInputs = inputs,
    newMachines = machines,
    newOps = operations,
    newSales = sales,
    newDiary = diary
  ) => {
    setSeasons(newSeasons);
    setInputs(newInputs);
    setMachines(newMachines);
    setOperations(newOps);
    setSales(newSales);
    setDiary(newDiary);

    saveCostModuleData({
      seasons: newSeasons,
      inputs: newInputs,
      machines: newMachines,
      operations: newOps,
      sales: newSales,
      diary: newDiary,
    });
  };

  // Safe fallback if season not selected yet
  const activeSeason = selectedSeason || (seasons.length > 0 ? seasons[0] : {
    id: 'empty',
    farmId: '',
    farmName: 'Sua Propriedade',
    seasonName: 'Nenhuma Safra Cadastrada',
    crop: '',
    cultivar: '',
    plantedAreaHa: 0,
    productionSystem: 'Plantio Direto',
    targetYieldBagsHa: 0,
    targetCostPerHa: 0,
    targetProfitabilityPct: 0,
    plannedBudgetTotal: 0,
    startDate: '',
    endDate: '',
    status: 'Planejada',
  });

  const kpis = calculateEconomicKPIs(activeSeason, operations, sales, inputs);

  // Handlers for Season modifications
  const handleAddSeason = (newSeason: PropertyCropSeason) => {
    const updated = [newSeason, ...seasons];
    updateStateAndPersist(updated);
    setSelectedSeason(newSeason);
  };

  const handleUpdateSeason = (updatedSeason: PropertyCropSeason) => {
    const updated = seasons.map(s => s.id === updatedSeason.id ? updatedSeason : s);
    updateStateAndPersist(updated);
    setSelectedSeason(updatedSeason);
  };

  const handleDeleteSeason = (id: string) => {
    const updated = seasons.filter(s => s.id !== id);
    updateStateAndPersist(updated);
    if (selectedSeason?.id === id && updated.length > 0) {
      setSelectedSeason(updated[0]);
    }
  };

  // Handlers for Inputs
  const handleAddInput = (item: InputItem) => {
    const updated = [item, ...inputs];
    updateStateAndPersist(seasons, updated);
  };
  const handleUpdateInput = (item: InputItem) => {
    const updated = inputs.map(i => i.id === item.id ? item : i);
    updateStateAndPersist(seasons, updated);
  };
  const handleDeleteInput = (id: string) => {
    const updated = inputs.filter(i => i.id !== id);
    updateStateAndPersist(seasons, updated);
  };

  // Handlers for Operations
  const handleAddOperation = (op: AgriculturalOperationCost) => {
    const updated = [op, ...operations];
    updateStateAndPersist(seasons, inputs, machines, updated);
  };
  const handleDeleteOperation = (id: string) => {
    const updated = operations.filter(o => o.id !== id);
    updateStateAndPersist(seasons, inputs, machines, updated);
  };

  // Handlers for Machines
  const handleAddMachine = (mac: MachineEquipment) => {
    const updated = [mac, ...machines];
    updateStateAndPersist(seasons, inputs, updated);
  };
  const handleDeleteMachine = (id: string) => {
    const updated = machines.filter(m => m.id !== id);
    updateStateAndPersist(seasons, inputs, updated);
  };

  // Handlers for Commercialization
  const handleAddSale = (sale: CommercializationRecord) => {
    const updated = [sale, ...sales];
    updateStateAndPersist(seasons, inputs, machines, operations, updated);
  };
  const handleDeleteSale = (id: string) => {
    const updated = sales.filter(s => s.id !== id);
    updateStateAndPersist(seasons, inputs, machines, operations, updated);
  };

  // Handlers for Diary
  const handleAddDiaryEntry = (entry: FinancialDiaryEntry) => {
    const updated = [entry, ...diary];
    updateStateAndPersist(seasons, inputs, machines, operations, sales, updated);
  };
  const handleDeleteDiaryEntry = (id: string) => {
    const updated = diary.filter(d => d.id !== id);
    updateStateAndPersist(seasons, inputs, machines, operations, sales, updated);
  };

  // Fertilizer critical monitoring count
  const isFertilizer = (item: InputItem) => {
    if (item.category === 'Fertilizantes') return true;
    const nameLower = (item.name || '').toLowerCase();
    return nameLower.includes('npk') ||
      nameLower.includes('ureia') ||
      nameLower.includes('potássio') ||
      nameLower.includes('cloreto') ||
      nameLower.includes('fósforo') ||
      nameLower.includes('adubo') ||
      nameLower.includes('map ') ||
      nameLower.includes('dap ') ||
      nameLower.includes('sulfato de amônio');
  };

  const criticalFertilizerCount = (inputs || []).filter(item => isFertilizer(item) && item.currentStock <= (item.minStockAlert || 0)).length;

  const navigateToTab = (tab: CostTabType) => {
    if (externalSetActiveSubTab) {
      externalSetActiveSubTab(tab);
    }
    setInternalTab(tab);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Dynamic View Content wrapped in Suspense for lazy-loading */}
      <React.Suspense fallback={
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm animate-pulse">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <span className="text-xs text-slate-500 font-bold">Carregando painel financeiro...</span>
        </div>
      }>
        {activeTab === '360' && (
          <EconomicTwin360View
            season={activeSeason}
            seasons={seasons}
            onSelectSeason={setSelectedSeason}
            kpis={kpis}
            operations={operations}
            inputs={inputs}
            machines={machines}
            sales={sales}
            diary={diary}
          />
        )}

        {activeTab === 'dashboard' && (
          <FinancialDashboardView
            season={activeSeason}
            kpis={kpis}
            operations={operations}
            sales={sales}
            inputs={inputs}
            onNavigateToInputs={() => navigateToTab('inputs')}
          />
        )}

        {activeTab === 'planning' && (
          <SeasonPlanningView
            seasons={seasons}
            onAddSeason={handleAddSeason}
            onUpdateSeason={handleUpdateSeason}
            onDeleteSeason={handleDeleteSeason}
            selectedFarmId={activeSeason.farmId}
          />
        )}

        {activeTab === 'inputs' && (
          <InputsStockView
            inputs={inputs}
            onAddInput={handleAddInput}
            onUpdateInput={handleUpdateInput}
            onDeleteInput={handleDeleteInput}
            selectedFarmId={activeSeason.farmId}
          />
        )}

        {activeTab === 'operations' && (
          <OperationsMachineryView
            operations={operations}
            machines={machines}
            season={activeSeason}
            inputs={inputs}
            onAddOperation={handleAddOperation}
            onDeleteOperation={handleDeleteOperation}
            onAddMachine={handleAddMachine}
            onDeleteMachine={handleDeleteMachine}
            selectedFarmId={activeSeason.farmId}
          />
        )}

        {activeTab === 'commercialization' && (
          <CommercializationView
            sales={sales}
            season={activeSeason}
            onAddSale={handleAddSale}
            onDeleteSale={handleDeleteSale}
            selectedFarmId={activeSeason.farmId}
          />
        )}

        {activeTab === 'simulators' && (
          <EconomicSimulatorsView
            kpis={kpis}
            season={activeSeason}
          />
        )}

        {activeTab === 'map' && (
          <PlotEconomicMapView
            season={activeSeason}
            kpis={kpis}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineAndDiaryView
            diary={diary}
            season={activeSeason}
            onAddDiaryEntry={handleAddDiaryEntry}
            onDeleteDiaryEntry={handleDeleteDiaryEntry}
          />
        )}

        {activeTab === 'reports' && (
          <FinancialReportsView
            season={activeSeason}
            kpis={kpis}
            operations={operations}
            sales={sales}
            inputs={inputs}
          />
        )}
      </React.Suspense>
    </div>
  );
};
