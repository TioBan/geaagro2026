import React, { useState, useEffect, Suspense } from 'react';
import {
  PropertyField,
  PlanterEquipment,
  SeedBatch,
  SeedingConfig,
  PlantabilitySamplingPoint,
  PlantabilityPhoto,
  ComponentMaintenanceStatus
} from '../types/plantability';
import {
  loadPropertyFields,
  savePropertyField,
  savePlantabilityFields,
  loadPlanters,
  savePlanter,
  savePlanterEquipment,
  loadSeedBatches,
  saveSeedBatch,
  saveSeedBatches,
  loadSeedingConfigs,
  loadSamplingPoints,
  saveSamplingPoint,
  saveSamplingPoints,
  loadPhotos,
  savePhoto,
  savePlantabilityPhotos,
  loadMaintenanceStatus,
  saveMaintenanceStatus
} from '../utils/plantabilityStorage';
import { lazyWithRetry } from '../utils/lazyWithRetry';
import {
  Sprout,
  LayoutDashboard,
  Building2,
  Tractor,
  Package,
  Ruler,
  Layers,
  Wrench,
  TrendingDown,
  Compass,
  Camera,
  FileText
} from 'lucide-react';

const PlantabilityDashboardView = lazyWithRetry(() =>
  import('./plantabilidade/PlantabilityDashboardView').then(m => ({ default: m.PlantabilityDashboardView }))
);
const PlantabilityFieldsView = lazyWithRetry(() =>
  import('./plantabilidade/PlantabilityFieldsView').then(m => ({ default: m.PlantabilityFieldsView }))
);
const PlantabilityEquipmentView = lazyWithRetry(() =>
  import('./plantabilidade/PlantabilityEquipmentView').then(m => ({ default: m.PlantabilityEquipmentView }))
);
const PlantabilitySeedsView = lazyWithRetry(() =>
  import('./plantabilidade/PlantabilitySeedsView').then(m => ({ default: m.PlantabilitySeedsView }))
);
const PlantabilitySamplingView = lazyWithRetry(() =>
  import('./plantabilidade/PlantabilitySamplingView').then(m => ({ default: m.PlantabilitySamplingView }))
);
const PlantabilityDigitalTwinView = lazyWithRetry(() =>
  import('./plantabilidade/PlantabilityDigitalTwinView').then(m => ({ default: m.PlantabilityDigitalTwinView }))
);
const PlantabilityDiagnosticRuleEngineView = lazyWithRetry(() =>
  import('./plantabilidade/PlantabilityDiagnosticRuleEngineView').then(m => ({
    default: m.PlantabilityDiagnosticRuleEngineView
  }))
);
const PlantabilityLossSimulatorView = lazyWithRetry(() =>
  import('./plantabilidade/PlantabilityLossSimulatorView').then(m => ({
    default: m.PlantabilityLossSimulatorView
  }))
);
const PlantabilityMapView = lazyWithRetry(() =>
  import('./plantabilidade/PlantabilityMapView').then(m => ({ default: m.PlantabilityMapView }))
);
const PlantabilityPhotoDiaryView = lazyWithRetry(() =>
  import('./plantabilidade/PlantabilityPhotoDiaryView').then(m => ({ default: m.PlantabilityPhotoDiaryView }))
);
const PlantabilityReportsView = lazyWithRetry(() =>
  import('./plantabilidade/PlantabilityReportsView').then(m => ({ default: m.PlantabilityReportsView }))
);

type TabType =
  | 'dashboard'
  | 'fields'
  | 'equipment'
  | 'seeds'
  | 'sampling'
  | 'digital-twin'
  | 'diagnostics'
  | 'loss-simulator'
  | 'map'
  | 'photo-diary'
  | 'reports';

const VALID_TABS: readonly TabType[] = [
  'dashboard',
  'fields',
  'equipment',
  'seeds',
  'sampling',
  'digital-twin',
  'diagnostics',
  'loss-simulator',
  'map',
  'photo-diary',
  'reports'
];

const TABS: Array<{ id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
  { id: 'fields', label: 'Talhões', icon: Building2 },
  { id: 'equipment', label: 'Plantadeiras', icon: Tractor },
  { id: 'seeds', label: 'Sementes', icon: Package },
  { id: 'sampling', label: 'Amostragem', icon: Ruler },
  { id: 'digital-twin', label: 'Gêmeo 360°', icon: Layers },
  { id: 'diagnostics', label: 'Diagnósticos', icon: Wrench },
  { id: 'loss-simulator', label: 'Simulador', icon: TrendingDown },
  { id: 'map', label: 'Mapa', icon: Compass },
  { id: 'photo-diary', label: 'Diário', icon: Camera },
  { id: 'reports', label: 'Relatórios', icon: FileText }
];

interface PlantabilityModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: string) => void;
}

const normalizeTab = (tab?: string): TabType => {
  if (!tab) return 'dashboard';
  const normalized = tab.replace(/_/g, '-');
  if (normalized === 'simulator') return 'loss-simulator';
  if (normalized === 'diagnostic') return 'diagnostics';
  if ((VALID_TABS as readonly string[]).includes(normalized)) {
    return normalized as TabType;
  }
  return 'dashboard';
};

export const PlantabilityModule: React.FC<PlantabilityModuleProps> = ({
  activeSubTab,
  setActiveSubTab
}) => {
  const [internalTab, setInternalTab] = useState<TabType>('dashboard');

  const activeTab: TabType = activeSubTab ? normalizeTab(activeSubTab) : internalTab;

  const handleTabChange = (tabId: string) => {
    const normalized = normalizeTab(tabId);
    if (setActiveSubTab) {
      setActiveSubTab(normalized);
    } else {
      setInternalTab(normalized);
    }
  };

  // Persistent local state
  const [fields, setFields] = useState<PropertyField[]>([]);
  const [planters, setPlanters] = useState<PlanterEquipment[]>([]);
  const [seeds, setSeeds] = useState<SeedBatch[]>([]);
  const [configs, setConfigs] = useState<SeedingConfig[]>([]);
  const [samplings, setSamplings] = useState<PlantabilitySamplingPoint[]>([]);
  const [photos, setPhotos] = useState<PlantabilityPhoto[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<ComponentMaintenanceStatus[]>([]);

  useEffect(() => {
    setFields(loadPropertyFields());
    setPlanters(loadPlanters());
    setSeeds(loadSeedBatches());
    setConfigs(loadSeedingConfigs());
    setSamplings(loadSamplingPoints());
    setPhotos(loadPhotos());
    setMaintenanceLogs(loadMaintenanceStatus());
  }, []);

  // Save & delete handlers
  const handleSaveField = (f: PropertyField) => {
    savePropertyField(f);
    setFields(loadPropertyFields());
  };

  const handleDeleteField = (id: string) => {
    const updated = loadPropertyFields().filter(f => f.id !== id);
    savePlantabilityFields(updated);
    setFields(updated);
  };

  const handleSavePlanter = (p: PlanterEquipment) => {
    savePlanter(p);
    setPlanters(loadPlanters());
  };

  const handleDeletePlanter = (id: string) => {
    const updated = loadPlanters().filter(p => p.id !== id);
    savePlanterEquipment(updated);
    setPlanters(updated);
  };

  const handleSaveSeed = (s: SeedBatch) => {
    saveSeedBatch(s);
    setSeeds(loadSeedBatches());
  };

  const handleDeleteSeed = (id: string) => {
    const updated = loadSeedBatches().filter(s => s.id !== id);
    saveSeedBatches(updated);
    setSeeds(updated);
  };

  const handleSaveSampling = (s: PlantabilitySamplingPoint) => {
    saveSamplingPoint(s);
    setSamplings(loadSamplingPoints());
  };

  const handleDeleteSampling = (id: string) => {
    const updated = loadSamplingPoints().filter(s => s.id !== id);
    saveSamplingPoints(updated);
    setSamplings(updated);
  };

  const handleSavePhoto = (p: PlantabilityPhoto) => {
    savePhoto(p);
    setPhotos(loadPhotos());
  };

  const handleDeletePhoto = (id: string) => {
    const updated = loadPhotos().filter(p => p.id !== id);
    savePlantabilityPhotos(updated);
    setPhotos(updated);
  };

  const handleSaveMaintenance = (m: ComponentMaintenanceStatus) => {
    saveMaintenanceStatus(m);
    setMaintenanceLogs(loadMaintenanceStatus());
  };

  const totalAreaHa = fields.reduce((acc, f) => acc + (Number(f.areaHa) || 0), 0);

  return (
    <div className="space-y-4 pb-10">
      {/* Compact Module Header + Single-Row Tab Strip */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 px-4 py-3 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Sprout className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
                Plantabilidade & Semeadura
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                Qualidade de distribuição, regulagem de plantadeiras, diagnóstico técnico e impacto econômico
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 tabular-nums shrink-0">
            <span>
              <strong className="font-semibold text-slate-900 dark:text-white">{fields.length}</strong> talhões
            </span>
            <span className="text-slate-300 dark:text-zinc-700">|</span>
            <span>
              <strong className="font-semibold text-slate-900 dark:text-white">{totalAreaHa.toFixed(1)}</strong> ha
            </span>
            <span className="text-slate-300 dark:text-zinc-700">|</span>
            <span>
              <strong className="font-semibold text-slate-900 dark:text-white">{samplings.length}</strong> amostras
            </span>
          </div>
        </div>

        {/* Navigation Strip */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`h-8 px-2.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lazy-Loaded Module Content */}
      <Suspense
        fallback={
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
            Carregando visualização de plantabilidade...
          </div>
        }
      >
        {activeTab === 'dashboard' && (
          <PlantabilityDashboardView
            fields={fields}
            planters={planters}
            seeds={seeds}
            configs={configs}
            samplings={samplings}
            onNavigateTab={handleTabChange}
          />
        )}

        {activeTab === 'fields' && (
          <PlantabilityFieldsView
            fields={fields}
            onSaveField={handleSaveField}
            onDeleteField={handleDeleteField}
          />
        )}

        {activeTab === 'equipment' && (
          <PlantabilityEquipmentView
            planters={planters}
            maintenanceLogs={maintenanceLogs}
            onSavePlanter={handleSavePlanter}
            onDeletePlanter={handleDeletePlanter}
            onSaveMaintenance={handleSaveMaintenance}
          />
        )}

        {activeTab === 'seeds' && (
          <PlantabilitySeedsView
            seeds={seeds}
            onSaveSeed={handleSaveSeed}
            onDeleteSeed={handleDeleteSeed}
          />
        )}

        {activeTab === 'sampling' && (
          <PlantabilitySamplingView
            fields={fields}
            configs={configs}
            samplings={samplings}
            onSaveSampling={handleSaveSampling}
            onDeleteSampling={handleDeleteSampling}
          />
        )}

        {activeTab === 'digital-twin' && (
          <PlantabilityDigitalTwinView
            fields={fields}
            planters={planters}
            seeds={seeds}
            configs={configs}
            samplings={samplings}
            photos={photos}
          />
        )}

        {activeTab === 'diagnostics' && (
          <PlantabilityDiagnosticRuleEngineView samplings={samplings} configs={configs} />
        )}

        {activeTab === 'loss-simulator' && (
          <PlantabilityLossSimulatorView fields={fields} samplings={samplings} configs={configs} />
        )}

        {activeTab === 'map' && (
          <PlantabilityMapView
            fields={fields}
            samplings={samplings}
            configs={configs}
            onSaveField={handleSaveField}
          />
        )}

        {activeTab === 'photo-diary' && (
          <PlantabilityPhotoDiaryView
            photos={photos}
            fields={fields}
            onSavePhoto={handleSavePhoto}
            onDeletePhoto={handleDeletePhoto}
          />
        )}

        {activeTab === 'reports' && (
          <PlantabilityReportsView
            fields={fields}
            planters={planters}
            seeds={seeds}
            configs={configs}
            samplings={samplings}
          />
        )}
      </Suspense>
    </div>
  );
};

export default PlantabilityModule;
