import React, { Suspense, useCallback, useMemo, useState } from 'react';
import {
  SoilPhysicsProfile,
  CropWaterRequirement,
  IrrigationSystemRecord,
  ClimateDayRecord,
  IrrigationEventLog,
  WaterQualityAnalysis,
  FertigationProgramItem,
  IrrigationDiaryEntry,
  IrrigationKPIs,
} from '../../types/irrigation';
import {
  loadIrrigationData,
  saveIrrigationData,
  calculateIGEH,
} from '../../utils/irrigationStorage';
import { lazyWithRetry } from '../../utils/lazyWithRetry';
import { IrrigationDashboardView } from './IrrigationDashboardView';
import {
  Droplets,
  LayoutDashboard,
  Layers,
  Settings,
  Sun,
  Gauge,
  Zap,
  Camera,
  Activity,
  SlidersHorizontal,
  FileText,
} from 'lucide-react';

const AreaAndSoilsView = lazyWithRetry(() =>
  import('./AreaAndSoilsView').then((m) => ({ default: m.AreaAndSoilsView }))
);
const IrrigationSystemsView = lazyWithRetry(() =>
  import('./IrrigationSystemsView').then((m) => ({ default: m.IrrigationSystemsView }))
);
const MeteorologyIrrigationView = lazyWithRetry(() =>
  import('./MeteorologyIrrigationView').then((m) => ({ default: m.MeteorologyIrrigationView }))
);
const WaterRequirementEngineView = lazyWithRetry(() =>
  import('./WaterRequirementEngineView').then((m) => ({ default: m.WaterRequirementEngineView }))
);
const EnergyAndFertigationView = lazyWithRetry(() =>
  import('./EnergyAndFertigationView').then((m) => ({ default: m.EnergyAndFertigationView }))
);
const WaterQualityAndDiaryView = lazyWithRetry(() =>
  import('./WaterQualityAndDiaryView').then((m) => ({ default: m.WaterQualityAndDiaryView }))
);
const SystemDigitalTwinView = lazyWithRetry(() =>
  import('./SystemDigitalTwinView').then((m) => ({ default: m.SystemDigitalTwinView }))
);
const IrrigationSimulatorView = lazyWithRetry(() =>
  import('./IrrigationSimulatorView').then((m) => ({ default: m.IrrigationSimulatorView }))
);
const IrrigationReportsView = lazyWithRetry(() =>
  import('./IrrigationReportsView').then((m) => ({ default: m.IrrigationReportsView }))
);

export type IrrigationTab =
  | 'dashboard'
  | 'soils_areas'
  | 'systems'
  | 'weather'
  | 'calculator'
  | 'energy_fertigation'
  | 'water_quality'
  | 'digital_twin'
  | 'simulator'
  | 'reports';

interface IrrigationModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: string) => void;
}

const IRRIGATION_TABS: {
  id: IrrigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'systems', label: 'Sistemas', icon: Settings },
  { id: 'calculator', label: 'Lâminas & Rega', icon: Gauge },
  { id: 'weather', label: 'Meteorologia', icon: Sun },
  { id: 'soils_areas', label: 'Solos & Culturas', icon: Layers },
  { id: 'energy_fertigation', label: 'Energia & Ferti', icon: Zap },
  { id: 'water_quality', label: 'Água & Diário', icon: Camera },
  { id: 'digital_twin', label: 'Operacional', icon: Activity },
  { id: 'simulator', label: 'Simulador', icon: SlidersHorizontal },
  { id: 'reports', label: 'Relatórios', icon: FileText },
];

const TabLoadingFallback: React.FC = () => (
  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
    Carregando painel...
  </div>
);

export const IrrigationModule: React.FC<IrrigationModuleProps> = ({
  activeSubTab,
  setActiveSubTab,
}) => {
  const [internalTab, setInternalTab] = useState<IrrigationTab>('dashboard');
  const activeTab: IrrigationTab =
    activeSubTab && IRRIGATION_TABS.some((t) => t.id === activeSubTab)
      ? (activeSubTab as IrrigationTab)
      : internalTab;

  const setActiveTab = useCallback(
    (tab: IrrigationTab) => {
      setInternalTab(tab);
      if (setActiveSubTab) {
        setActiveSubTab(tab);
      }
    },
    [setActiveSubTab]
  );

  // Load persisted data ONCE on initial mount instead of 8 separate reads
  const [store, setStore] = useState(() => loadIrrigationData());

  const handleAddSoil = useCallback((newSoil: SoilPhysicsProfile) => {
    setStore((prev) => {
      const soils = [...prev.soils, newSoil];
      saveIrrigationData({ soils });
      return { ...prev, soils };
    });
  }, []);

  const handleAddCrop = useCallback((newCrop: CropWaterRequirement) => {
    setStore((prev) => {
      const crops = [...prev.crops, newCrop];
      saveIrrigationData({ crops });
      return { ...prev, crops };
    });
  }, []);

  const handleAddSystem = useCallback((newSys: IrrigationSystemRecord) => {
    setStore((prev) => {
      const systems = [...prev.systems, newSys];
      saveIrrigationData({ systems });
      return { ...prev, systems };
    });
  }, []);

  const handleUpdateSystem = useCallback((updatedSys: IrrigationSystemRecord) => {
    setStore((prev) => {
      const systems = prev.systems.map((s) => (s.id === updatedSys.id ? updatedSys : s));
      saveIrrigationData({ systems });
      return { ...prev, systems };
    });
  }, []);

  const handleAddClimate = useCallback((rec: ClimateDayRecord) => {
    setStore((prev) => {
      const climate = [...prev.climate, rec];
      saveIrrigationData({ climate });
      return { ...prev, climate };
    });
  }, []);

  const handleAddLog = useCallback((log: IrrigationEventLog) => {
    setStore((prev) => {
      const logs = [log, ...prev.logs];
      saveIrrigationData({ logs });
      return { ...prev, logs };
    });
  }, []);

  const handleAddWaterQuality = useCallback((wq: WaterQualityAnalysis) => {
    setStore((prev) => {
      const waterQuality = [wq, ...prev.waterQuality];
      saveIrrigationData({ waterQuality });
      return { ...prev, waterQuality };
    });
  }, []);

  const handleAddFertigation = useCallback((item: FertigationProgramItem) => {
    setStore((prev) => {
      const fertigation = [item, ...prev.fertigation];
      saveIrrigationData({ fertigation });
      return { ...prev, fertigation };
    });
  }, []);

  const handleDeleteFertigation = useCallback((id: string) => {
    setStore((prev) => {
      const fertigation = prev.fertigation.filter((item) => item.id !== id);
      saveIrrigationData({ fertigation });
      return { ...prev, fertigation };
    });
  }, []);

  const handleClearFertigation = useCallback(() => {
    setStore((prev) => {
      saveIrrigationData({ fertigation: [] });
      return { ...prev, fertigation: [] };
    });
  }, []);

  const handleAddDiary = useCallback((entry: IrrigationDiaryEntry) => {
    setStore((prev) => {
      const diary = [entry, ...prev.diary];
      saveIrrigationData({ diary });
      return { ...prev, diary };
    });
  }, []);

  const kpis: IrrigationKPIs = useMemo(
    () => calculateIGEH(store.systems, store.logs, store.climate),
    [store.systems, store.logs, store.climate]
  );

  const igehLabel =
    kpis.igehScore >= 80
      ? 'Alta Eficiência'
      : kpis.igehScore >= 60
      ? 'Boa Eficiência'
      : kpis.igehScore > 0
      ? 'Eficiência Regular'
      : 'Aguardando Dados';

  const igehTextClass =
    kpis.igehScore >= 80
      ? 'text-emerald-700 dark:text-emerald-400'
      : kpis.igehScore >= 60
      ? 'text-sky-700 dark:text-sky-400'
      : kpis.igehScore > 0
      ? 'text-amber-700 dark:text-amber-400'
      : 'text-slate-500 dark:text-zinc-400';

  return (
    <div className="space-y-4 w-full pb-8">
      {/* Compact Hairline Header */}
      <div className="print:hidden bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Droplets className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-semibold tracking-tight text-slate-900 dark:text-zinc-100 truncate">
                Irrigação &amp; Eficiência Hídrica
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                Manejo de lâminas, balanço hídrico ET₀/ETc, uniformidade CUC/CUD, energia e índice IGEH.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 tabular-nums border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100 dark:border-zinc-800">
            <div className="text-left sm:text-right">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                Índice IGEH · {igehLabel}
              </span>
              <span className={`text-base font-bold ${igehTextClass}`}>
                {kpis.igehScore > 0 ? `${kpis.igehScore}/100` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* 5-Metric Compact Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs tabular-nums">
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Sistemas Ativos</span>
            <strong className="text-sm text-slate-900 dark:text-zinc-100">
              {kpis.totalActiveSystemsCount}/{store.systems.length}
            </strong>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Eficiência (Ea)</span>
            <strong className="text-sm text-emerald-700 dark:text-emerald-400">
              {kpis.avgSystemEfficiencyPct > 0 ? `${kpis.avgSystemEfficiencyPct}%` : '—'}
            </strong>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">ET₀ Média</span>
            <strong className="text-sm text-slate-900 dark:text-zinc-100">
              {kpis.averageEt0MmDay > 0 ? `${kpis.averageEt0MmDay} mm/d` : '—'}
            </strong>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Economia Est.</span>
            <strong className="text-sm text-sky-700 dark:text-sky-400">
              {kpis.waterSavedM3 > 0 ? `${kpis.waterSavedM3.toLocaleString('pt-BR')} m³` : '—'}
            </strong>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Regas na Safra</span>
            <strong className="text-sm text-slate-900 dark:text-zinc-100">
              {store.logs.length}
            </strong>
          </div>
        </div>
      </div>

      {/* Single-Row Scrollable Subtab Bar */}
      <div className="print:hidden bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-1 flex items-center gap-1 overflow-x-auto">
        {IRRIGATION_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`h-8 px-2.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                active
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      {activeTab === 'dashboard' && (
        <IrrigationDashboardView
          systems={store.systems}
          climate={store.climate}
          logs={store.logs}
          kpis={kpis}
          onNavigateToTab={setActiveTab}
        />
      )}

      {activeTab === 'soils_areas' && (
        <Suspense fallback={<TabLoadingFallback />}>
          <AreaAndSoilsView
            soils={store.soils}
            crops={store.crops}
            onAddSoil={handleAddSoil}
            onAddCrop={handleAddCrop}
          />
        </Suspense>
      )}

      {activeTab === 'systems' && (
        <Suspense fallback={<TabLoadingFallback />}>
          <IrrigationSystemsView
            systems={store.systems}
            onAddSystem={handleAddSystem}
            onUpdateSystem={handleUpdateSystem}
          />
        </Suspense>
      )}

      {activeTab === 'weather' && (
        <Suspense fallback={<TabLoadingFallback />}>
          <MeteorologyIrrigationView
            climate={store.climate}
            onAddClimateRecord={handleAddClimate}
          />
        </Suspense>
      )}

      {activeTab === 'calculator' && (
        <Suspense fallback={<TabLoadingFallback />}>
          <WaterRequirementEngineView
            soils={store.soils}
            crops={store.crops}
            systems={store.systems}
            logs={store.logs}
            onAddLog={handleAddLog}
          />
        </Suspense>
      )}

      {activeTab === 'energy_fertigation' && (
        <Suspense fallback={<TabLoadingFallback />}>
          <EnergyAndFertigationView
            systems={store.systems}
            fertigation={store.fertigation}
            onAddFertigation={handleAddFertigation}
            onDeleteFertigation={handleDeleteFertigation}
            onClearFertigation={handleClearFertigation}
          />
        </Suspense>
      )}

      {activeTab === 'water_quality' && (
        <Suspense fallback={<TabLoadingFallback />}>
          <WaterQualityAndDiaryView
            waterQuality={store.waterQuality}
            diary={store.diary}
            systems={store.systems}
            onAddWaterQuality={handleAddWaterQuality}
            onAddDiaryEntry={handleAddDiary}
          />
        </Suspense>
      )}

      {activeTab === 'digital_twin' && (
        <Suspense fallback={<TabLoadingFallback />}>
          <SystemDigitalTwinView
            systems={store.systems}
            climate={store.climate}
            kpis={kpis}
          />
        </Suspense>
      )}

      {activeTab === 'simulator' && (
        <Suspense fallback={<TabLoadingFallback />}>
          <IrrigationSimulatorView />
        </Suspense>
      )}

      {activeTab === 'reports' && (
        <Suspense fallback={<TabLoadingFallback />}>
          <IrrigationReportsView
            kpis={kpis}
            systems={store.systems}
            logs={store.logs}
          />
        </Suspense>
      )}
    </div>
  );
};

export default IrrigationModule;
