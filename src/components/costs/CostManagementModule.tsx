import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart2,
  Calendar,
  Compass,
  DollarSign,
  FileText,
  MapPin,
  Package,
  Sliders,
  Tractor,
  Wheat,
} from 'lucide-react';
import {
  PropertyCropSeason,
  InputItem,
  MachineEquipment,
  AgriculturalOperationCost,
  CommercializationRecord,
  FinancialDiaryEntry,
} from '../../types/costs';
import {
  loadCostModuleData,
  saveCostModuleData,
  calculateEconomicKPIs,
  isFertilizerInput,
} from '../../utils/costStorage';
import { lazyWithRetry } from '../../utils/lazyWithRetry';

const EconomicTwin360View = lazyWithRetry(() =>
  import('./EconomicTwin360View').then((m) => ({ default: m.EconomicTwin360View }))
);
const FinancialDashboardView = lazyWithRetry(() =>
  import('./FinancialDashboardView').then((m) => ({ default: m.FinancialDashboardView }))
);
const SeasonPlanningView = lazyWithRetry(() =>
  import('./SeasonPlanningView').then((m) => ({ default: m.SeasonPlanningView }))
);
const InputsStockView = lazyWithRetry(() =>
  import('./InputsStockView').then((m) => ({ default: m.InputsStockView }))
);
const OperationsMachineryView = lazyWithRetry(() =>
  import('./OperationsMachineryView').then((m) => ({ default: m.OperationsMachineryView }))
);
const CommercializationView = lazyWithRetry(() =>
  import('./CommercializationView').then((m) => ({ default: m.CommercializationView }))
);
const EconomicSimulatorsView = lazyWithRetry(() =>
  import('./EconomicSimulatorsView').then((m) => ({ default: m.EconomicSimulatorsView }))
);
const PlotEconomicMapView = lazyWithRetry(() =>
  import('./PlotEconomicMapView').then((m) => ({ default: m.PlotEconomicMapView }))
);
const TimelineAndDiaryView = lazyWithRetry(() =>
  import('./TimelineAndDiaryView').then((m) => ({ default: m.TimelineAndDiaryView }))
);
const FinancialReportsView = lazyWithRetry(() =>
  import('./FinancialReportsView').then((m) => ({ default: m.FinancialReportsView }))
);

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

const VALID_TABS: CostTabType[] = [
  '360',
  'dashboard',
  'planning',
  'inputs',
  'operations',
  'commercialization',
  'simulators',
  'map',
  'timeline',
  'reports',
];

const TAB_ITEMS: { id: CostTabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: '360', label: 'Visão 360°', icon: Compass },
  { id: 'dashboard', label: 'Dashboard DRE', icon: BarChart2 },
  { id: 'planning', label: 'Safras', icon: Wheat },
  { id: 'inputs', label: 'Insumos', icon: Package },
  { id: 'operations', label: 'Operações & Frota', icon: Tractor },
  { id: 'commercialization', label: 'Vendas', icon: DollarSign },
  { id: 'simulators', label: 'Simulador', icon: Sliders },
  { id: 'map', label: 'Mapa Econômico', icon: MapPin },
  { id: 'timeline', label: 'Diário', icon: Calendar },
  { id: 'reports', label: 'Relatórios', icon: FileText },
];

export const CostManagementModule: React.FC<CostManagementModuleProps> = ({
  activeSubTab: externalSubTab,
  setActiveSubTab: externalSetActiveSubTab,
  selectedFarmId,
}) => {
  const [internalTab, setInternalTab] = useState<CostTabType>('360');

  useEffect(() => {
    if (externalSubTab && VALID_TABS.includes(externalSubTab as CostTabType)) {
      setInternalTab(externalSubTab as CostTabType);
    }
  }, [externalSubTab]);

  const activeTab: CostTabType =
    externalSubTab && VALID_TABS.includes(externalSubTab as CostTabType)
      ? (externalSubTab as CostTabType)
      : internalTab;

  const [seasons, setSeasons] = useState<PropertyCropSeason[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<PropertyCropSeason | null>(null);
  const [inputs, setInputs] = useState<InputItem[]>([]);
  const [machines, setMachines] = useState<MachineEquipment[]>([]);
  const [operations, setOperations] = useState<AgriculturalOperationCost[]>([]);
  const [sales, setSales] = useState<CommercializationRecord[]>([]);
  const [diary, setDiary] = useState<FinancialDiaryEntry[]>([]);

  useEffect(() => {
    const data = loadCostModuleData();
    setSeasons(data.seasons);
    setInputs(data.inputs);
    setMachines(data.machines);
    setOperations(data.operations);
    setSales(data.sales);
    setDiary(data.diary);

    if (data.seasons.length > 0) {
      setSelectedSeason(data.seasons[0]);
    }
  }, []);

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

  const activeSeason: PropertyCropSeason = useMemo(
    () =>
      selectedSeason ||
      (seasons.length > 0
        ? seasons[0]
        : {
            id: 'empty',
            farmId: selectedFarmId || '',
            farmName: 'Propriedade Agrícola',
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
          }),
    [selectedSeason, seasons, selectedFarmId]
  );

  const kpis = useMemo(
    () => calculateEconomicKPIs(activeSeason, operations, sales, machines),
    [activeSeason, operations, sales, machines]
  );

  const handleAddSeason = (newSeason: PropertyCropSeason) => {
    const updated = [newSeason, ...seasons];
    updateStateAndPersist(updated);
    setSelectedSeason(newSeason);
  };

  const handleUpdateSeason = (updatedSeason: PropertyCropSeason) => {
    const updated = seasons.map((s) => (s.id === updatedSeason.id ? updatedSeason : s));
    updateStateAndPersist(updated);
    setSelectedSeason(updatedSeason);
  };

  const handleDeleteSeason = (id: string) => {
    const updated = seasons.filter((s) => s.id !== id);
    updateStateAndPersist(updated);
    if (selectedSeason?.id === id) {
      setSelectedSeason(updated.length > 0 ? updated[0] : null);
    }
  };

  const handleAddInput = (item: InputItem) => {
    updateStateAndPersist(seasons, [item, ...inputs]);
  };
  const handleUpdateInput = (item: InputItem) => {
    updateStateAndPersist(
      seasons,
      inputs.map((i) => (i.id === item.id ? item : i))
    );
  };
  const handleDeleteInput = (id: string) => {
    updateStateAndPersist(
      seasons,
      inputs.filter((i) => i.id !== id)
    );
  };

  const handleAddOperation = (op: AgriculturalOperationCost) => {
    updateStateAndPersist(seasons, inputs, machines, [op, ...operations]);
  };
  const handleDeleteOperation = (id: string) => {
    updateStateAndPersist(
      seasons,
      inputs,
      machines,
      operations.filter((o) => o.id !== id)
    );
  };

  const handleAddMachine = (mac: MachineEquipment) => {
    updateStateAndPersist(seasons, inputs, [mac, ...machines]);
  };
  const handleDeleteMachine = (id: string) => {
    updateStateAndPersist(
      seasons,
      inputs,
      machines.filter((m) => m.id !== id)
    );
  };

  const handleAddSale = (sale: CommercializationRecord) => {
    updateStateAndPersist(seasons, inputs, machines, operations, [sale, ...sales]);
  };
  const handleDeleteSale = (id: string) => {
    updateStateAndPersist(
      seasons,
      inputs,
      machines,
      operations,
      sales.filter((s) => s.id !== id)
    );
  };

  const handleAddDiaryEntry = (entry: FinancialDiaryEntry) => {
    updateStateAndPersist(seasons, inputs, machines, operations, sales, [entry, ...diary]);
  };
  const handleDeleteDiaryEntry = (id: string) => {
    updateStateAndPersist(
      seasons,
      inputs,
      machines,
      operations,
      sales,
      diary.filter((d) => d.id !== id)
    );
  };

  const criticalFertilizerCount = useMemo(
    () =>
      inputs.filter((item) => isFertilizerInput(item) && item.currentStock <= (item.minStockAlert || 0)).length,
    [inputs]
  );

  const navigateToTab = (tab: CostTabType) => {
    if (externalSetActiveSubTab) {
      externalSetActiveSubTab(tab);
    }
    setInternalTab(tab);
  };

  const effectiveFarmId = activeSeason.farmId || selectedFarmId || 'farm-1';

  return (
    <div className="space-y-5 pb-10">
      {/* Compact Module Header & Season Switcher */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Gestão de Custo &amp; DRE Agrícola</span>
              {activeSeason.crop && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{activeSeason.crop}</span>
                </>
              )}
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 mt-0.5 truncate">
              {activeSeason.seasonName}
              {activeSeason.cultivar ? ` (${activeSeason.cultivar})` : ''}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60">
              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
              <select
                aria-label="Selecionar safra ativa"
                value={activeSeason.id}
                onChange={(e) => {
                  const found = seasons.find((s) => s.id === e.target.value);
                  if (found) setSelectedSeason(found);
                }}
                className="bg-transparent text-xs font-medium text-slate-800 dark:text-zinc-100 outline-none cursor-pointer pr-1"
              >
                {seasons.length > 0 ? (
                  seasons.map((s) => (
                    <option key={s.id} value={s.id} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">
                      {s.seasonName} {s.crop ? `· ${s.crop} (${s.plantedAreaHa} ha)` : ''}
                    </option>
                  ))
                ) : (
                  <option value="empty" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">
                    Nenhuma safra cadastrada
                  </option>
                )}
              </select>
            </div>

            {criticalFertilizerCount > 0 && (
              <button
                type="button"
                onClick={() => navigateToTab('inputs')}
                className="h-9 px-3 rounded-lg border border-rose-200 dark:border-rose-900/70 bg-rose-50/80 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-xs font-medium transition-colors whitespace-nowrap shrink-0 tabular-nums"
              >
                {criticalFertilizerCount} fertilizante{criticalFertilizerCount > 1 ? 's' : ''} em nível crítico
              </button>
            )}
          </div>
        </div>

        {/* Single-row Horizontal Module Tab Strip */}
        <div className="flex items-center gap-1 overflow-x-auto pt-1 border-t border-slate-100 dark:border-zinc-800">
          {TAB_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateToTab(item.id)}
                className={`h-8 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
                {item.id === 'inputs' && criticalFertilizerCount > 0 && (
                  <span
                    className={`text-[11px] font-semibold tabular-nums ${
                      isActive ? 'text-emerald-100' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    ({criticalFertilizerCount})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic View Content wrapped in Suspense */}
      <React.Suspense
        fallback={
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-6 space-y-4">
            <div className="h-5 w-48 bg-slate-100 dark:bg-zinc-800 rounded" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="h-20 bg-slate-50 dark:bg-zinc-950/60 rounded-lg border border-slate-100 dark:border-zinc-800" />
              <div className="h-20 bg-slate-50 dark:bg-zinc-950/60 rounded-lg border border-slate-100 dark:border-zinc-800" />
              <div className="h-20 bg-slate-50 dark:bg-zinc-950/60 rounded-lg border border-slate-100 dark:border-zinc-800" />
              <div className="h-20 bg-slate-50 dark:bg-zinc-950/60 rounded-lg border border-slate-100 dark:border-zinc-800" />
            </div>
          </div>
        }
      >
        {activeTab === '360' && (
          <EconomicTwin360View
            season={activeSeason}
            kpis={kpis}
            operations={operations}
            inputs={inputs}
            machines={machines}
            diary={diary}
            onNavigateTab={navigateToTab}
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
            selectedFarmId={effectiveFarmId}
          />
        )}

        {activeTab === 'inputs' && (
          <InputsStockView
            inputs={inputs}
            onAddInput={handleAddInput}
            onUpdateInput={handleUpdateInput}
            onDeleteInput={handleDeleteInput}
            selectedFarmId={effectiveFarmId}
          />
        )}

        {activeTab === 'operations' && (
          <OperationsMachineryView
            operations={operations}
            machines={machines}
            season={activeSeason}
            onAddOperation={handleAddOperation}
            onDeleteOperation={handleDeleteOperation}
            onAddMachine={handleAddMachine}
            onDeleteMachine={handleDeleteMachine}
            selectedFarmId={effectiveFarmId}
          />
        )}

        {activeTab === 'commercialization' && (
          <CommercializationView
            sales={sales}
            season={activeSeason}
            onAddSale={handleAddSale}
            onDeleteSale={handleDeleteSale}
            selectedFarmId={effectiveFarmId}
          />
        )}

        {activeTab === 'simulators' && <EconomicSimulatorsView kpis={kpis} season={activeSeason} />}

        {activeTab === 'map' && <PlotEconomicMapView season={activeSeason} kpis={kpis} />}

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
