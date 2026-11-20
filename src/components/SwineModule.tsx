import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Award,
  Baby,
  BookOpen,
  Boxes,
  Camera,
  Cpu,
  Droplets,
  FileText,
  GitCommit,
  Heart,
  Layers,
  LayoutDashboard,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Thermometer,
  Users,
  Wheat,
} from 'lucide-react';
import {
  FarrowingLitter,
  SwineAnimal,
  SwineBatch,
  SwineBiosecurityLog,
  SwineFeedDiet,
  SwineFeedInventoryItem,
  SwineHealthRecord,
  SwinePhotoRecord,
  SwineShedEnvironment,
  SwineTab,
  SwineWaterPointCheck,
} from '../types/swine';
import { SuinoIcon } from './icons/SuinoIcon';
import {
  calculateSwineExecutiveKPIs,
  calculateSwineIES,
  loadFarrowingLitters,
  loadSwineAnimals,
  loadSwineBatches,
  loadSwineBiosecurity,
  loadSwineDiets,
  loadSwineInventory,
  loadSwinePhotos,
  loadSwineSheds,
  loadSwineWaterChecks,
  saveFarrowingLitters,
  saveSwineAnimals,
  saveSwineBatches,
  saveSwineBiosecurity,
  saveSwineDiets,
  saveSwineInventory,
  saveSwinePhotos,
  saveSwineSheds,
  saveSwineWaterChecks,
} from '../utils/swineStorage';
import { lazyWithRetry } from '../utils/lazyWithRetry';
import { normalizeSwineTab } from './swine/swineUi';
import { SwineDashboardView } from './swine/SwineDashboardView';

const SwineProductionFlowView = lazyWithRetry(() =>
  import('./swine/SwineProductionFlowView').then(m => ({ default: m.SwineProductionFlowView }))
);
const SwineIndividualRegistryView = lazyWithRetry(() =>
  import('./swine/SwineIndividualRegistryView').then(m => ({ default: m.SwineIndividualRegistryView }))
);
const SwineDigitalTwinView = lazyWithRetry(() =>
  import('./swine/SwineDigitalTwinView').then(m => ({ default: m.SwineDigitalTwinView }))
);
const SwineReproductionView = lazyWithRetry(() =>
  import('./swine/SwineReproductionView').then(m => ({ default: m.SwineReproductionView }))
);
const SwineFarrowingMaternityView = lazyWithRetry(() =>
  import('./swine/SwineFarrowingMaternityView').then(m => ({ default: m.SwineFarrowingMaternityView }))
);
const SwineNurseryView = lazyWithRetry(() =>
  import('./swine/SwineNurseryView').then(m => ({ default: m.SwineNurseryView }))
);
const SwineGrowFinishView = lazyWithRetry(() =>
  import('./swine/SwineGrowFinishView').then(m => ({ default: m.SwineGrowFinishView }))
);
const SwineNutritionView = lazyWithRetry(() =>
  import('./swine/SwineNutritionView').then(m => ({ default: m.SwineNutritionView }))
);
const SwineWaterManagementView = lazyWithRetry(() =>
  import('./swine/SwineWaterManagementView').then(m => ({ default: m.SwineWaterManagementView }))
);
const SwineEnvironmentView = lazyWithRetry(() =>
  import('./swine/SwineEnvironmentView').then(m => ({ default: m.SwineEnvironmentView }))
);
const SwineHealthSanityView = lazyWithRetry(() =>
  import('./swine/SwineHealthSanityView').then(m => ({ default: m.SwineHealthSanityView }))
);
const SwineDiseasesLibraryView = lazyWithRetry(() =>
  import('./swine/SwineDiseasesLibraryView').then(m => ({ default: m.SwineDiseasesLibraryView }))
);
const SwineBiosecurityView = lazyWithRetry(() =>
  import('./swine/SwineBiosecurityView').then(m => ({ default: m.SwineBiosecurityView }))
);
const SwineInventoryView = lazyWithRetry(() =>
  import('./swine/SwineInventoryView').then(m => ({ default: m.SwineInventoryView }))
);
const SwinePhotoDiaryView = lazyWithRetry(() =>
  import('./swine/SwinePhotoDiaryView').then(m => ({ default: m.SwinePhotoDiaryView }))
);
const SwineIESScoreView = lazyWithRetry(() =>
  import('./swine/SwineIESScoreView').then(m => ({ default: m.SwineIESScoreView }))
);
const SwineReportsView = lazyWithRetry(() =>
  import('./swine/SwineReportsView').then(m => ({ default: m.SwineReportsView }))
);
const SwineGeaSuiteIntegrationView = lazyWithRetry(() =>
  import('./swine/SwineGeaSuiteIntegrationView').then(m => ({ default: m.SwineGeaSuiteIntegrationView }))
);

interface SwineModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (subTab: string) => void;
  onNavigateToTankMix?: () => void;
  onNavigateToPoultry?: () => void;
  onNavigateToBuffalo?: () => void;
}

interface SwineNavItem {
  id: SwineTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SWINE_NAV_ITEMS: SwineNavItem[] = [
  { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'flow_pipeline', label: 'Fluxo Produtivo', icon: GitCommit },
  { id: 'animals', label: 'Plantel', icon: Users },
  { id: 'digital_twin', label: 'Gêmeo Digital', icon: Cpu },
  { id: 'reproduction', label: 'Reprodução & IA', icon: Heart },
  { id: 'maternity', label: 'Maternidade', icon: Baby },
  { id: 'nursery', label: 'Creche', icon: Activity },
  { id: 'grow_finish', label: 'Terminação', icon: Scale },
  { id: 'nutrition', label: 'Nutrição', icon: Wheat },
  { id: 'water', label: 'Água & Vazão', icon: Droplets },
  { id: 'environment', label: 'Ambiência & ITU', icon: Thermometer },
  { id: 'health', label: 'Sanidade', icon: ShieldCheck },
  { id: 'diseases_lib', label: 'Enfermidades', icon: BookOpen },
  { id: 'biosecurity', label: 'Biosseguridade', icon: ShieldAlert },
  { id: 'inventory', label: 'Estoque', icon: Boxes },
  { id: 'photo_diary', label: 'Diário Fotográfico', icon: Camera },
  { id: 'ies_score', label: 'Índice IES', icon: Award },
  { id: 'reports', label: 'Relatórios', icon: FileText },
  { id: 'suite_integration', label: 'Integrações', icon: Layers },
];

const ViewFallback: React.FC = () => (
  <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-8 text-center">
    <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
      Carregando módulo de suinocultura...
    </p>
  </div>
);

export const SwineModule: React.FC<SwineModuleProps> = ({
  activeSubTab: propActiveSubTab,
  setActiveSubTab: propSetActiveSubTab,
  onNavigateToTankMix,
  onNavigateToPoultry,
  onNavigateToBuffalo,
}) => {
  const [internalTab, setInternalTab] = useState<SwineTab>(() => normalizeSwineTab(propActiveSubTab));

  useEffect(() => {
    if (propActiveSubTab !== undefined) {
      const normalized = normalizeSwineTab(propActiveSubTab);
      setInternalTab(prev => (prev === normalized ? prev : normalized));
    }
  }, [propActiveSubTab]);

  const activeTab: SwineTab =
    propActiveSubTab !== undefined ? normalizeSwineTab(propActiveSubTab) : internalTab;

  const setActiveTab = useCallback(
    (tab: SwineTab | string) => {
      const normalized = normalizeSwineTab(tab);
      setInternalTab(normalized);
      propSetActiveSubTab?.(normalized);
    },
    [propSetActiveSubTab]
  );

  // Core Data States (loaded lazily once from localStorage)
  const [animals, setAnimals] = useState<SwineAnimal[]>(loadSwineAnimals);
  const [batches, setBatches] = useState<SwineBatch[]>(loadSwineBatches);
  const [litters, setLitters] = useState<FarrowingLitter[]>(loadFarrowingLitters);
  const [diets, setDiets] = useState<SwineFeedDiet[]>(loadSwineDiets);
  const [waterLogs, setWaterLogs] = useState<SwineWaterPointCheck[]>(loadSwineWaterChecks);
  const [sheds, setSheds] = useState<SwineShedEnvironment[]>(loadSwineSheds);
  const [biosecurity, setBiosecurity] = useState<SwineBiosecurityLog[]>(loadSwineBiosecurity);
  const [inventory, setInventory] = useState<SwineFeedInventoryItem[]>(loadSwineInventory);
  const [photos, setPhotos] = useState<SwinePhotoRecord[]>(loadSwinePhotos);

  // Selected animal ID for Digital Twin (always synchronized with animals list)
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | undefined>(() => animals[0]?.id);

  const selectedAnimalForTwin = useMemo(
    () => animals.find(a => a.id === selectedAnimalId) ?? animals[0],
    [animals, selectedAnimalId]
  );

  // Dynamic Calculated Metrics
  const kpis = useMemo(
    () => calculateSwineExecutiveKPIs(animals, batches, litters, inventory, sheds),
    [animals, batches, litters, inventory, sheds]
  );

  const iesScore = useMemo(
    () => calculateSwineIES(kpis, sheds, biosecurity),
    [kpis, sheds, biosecurity]
  );

  // Animal CRUD (direct persistence on mutation)
  const handleAddAnimal = useCallback((animal: SwineAnimal) => {
    setAnimals(prev => {
      const updated = [animal, ...prev];
      saveSwineAnimals(updated);
      return updated;
    });
    setSelectedAnimalId(animal.id);
  }, []);

  const handleUpdateAnimal = useCallback((updatedAnimal: SwineAnimal) => {
    setAnimals(prev => {
      const updatedList = prev.map(a => (a.id === updatedAnimal.id ? updatedAnimal : a));
      saveSwineAnimals(updatedList);
      return updatedList;
    });
  }, []);

  const handleDeleteAnimal = useCallback((id: string) => {
    setAnimals(prev => {
      const updated = prev.filter(a => a.id !== id);
      saveSwineAnimals(updated);
      return updated;
    });
    setSelectedAnimalId(prevId => (prevId === id ? undefined : prevId));
  }, []);

  const handleSelectAnimal = useCallback((animal: SwineAnimal) => {
    setSelectedAnimalId(animal.id);
  }, []);

  const handleSelectAnimalForTwin = useCallback(
    (animal: SwineAnimal) => {
      setSelectedAnimalId(animal.id);
      setActiveTab('digital_twin');
    },
    [setActiveTab]
  );

  // Batch CRUD
  const handleAddBatch = useCallback((batch: SwineBatch) => {
    setBatches(prev => {
      const updated = [batch, ...prev];
      saveSwineBatches(updated);
      return updated;
    });
  }, []);

  const handleUpdateBatch = useCallback((updatedBatch: SwineBatch) => {
    setBatches(prev => {
      const updated = prev.map(b => (b.id === updatedBatch.id ? updatedBatch : b));
      saveSwineBatches(updated);
      return updated;
    });
  }, []);

  // Litter CRUD
  const handleAddLitter = useCallback((litter: FarrowingLitter) => {
    setLitters(prev => {
      const updated = [litter, ...prev];
      saveFarrowingLitters(updated);
      return updated;
    });
  }, []);

  const handleUpdateLitter = useCallback((updatedLitter: FarrowingLitter) => {
    setLitters(prev => {
      const updated = prev.map(l => (l.id === updatedLitter.id ? updatedLitter : l));
      saveFarrowingLitters(updated);
      return updated;
    });
  }, []);

  // Diet CRUD
  const handleAddDiet = useCallback((diet: SwineFeedDiet) => {
    setDiets(prev => {
      const updated = [diet, ...prev];
      saveSwineDiets(updated);
      return updated;
    });
  }, []);

  // Water CRUD
  const handleAddWaterLog = useCallback((log: SwineWaterPointCheck) => {
    setWaterLogs(prev => {
      const updated = [log, ...prev];
      saveSwineWaterChecks(updated);
      return updated;
    });
  }, []);

  // Shed Reading CRUD
  const handleAddShedReading = useCallback((reading: SwineShedEnvironment) => {
    setSheds(prev => {
      const updated = [reading, ...prev];
      saveSwineSheds(updated);
      return updated;
    });
  }, []);

  // Health record attached to animal
  const handleAddHealthRecordToAnimal = useCallback((animalId: string, record: SwineHealthRecord) => {
    setAnimals(prev => {
      const updatedList = prev.map(a =>
        a.id === animalId
          ? { ...a, healthHistory: [record, ...a.healthHistory] }
          : a
      );
      saveSwineAnimals(updatedList);
      return updatedList;
    });
  }, []);

  // Biosecurity CRUD
  const handleAddBiosecurityCheck = useCallback((check: SwineBiosecurityLog) => {
    setBiosecurity(prev => {
      const updated = [check, ...prev];
      saveSwineBiosecurity(updated);
      return updated;
    });
  }, []);

  const handleUpdateBiosecurityCheck = useCallback((updatedCheck: SwineBiosecurityLog) => {
    setBiosecurity(prev => {
      const updated = prev.map(b => (b.id === updatedCheck.id ? updatedCheck : b));
      saveSwineBiosecurity(updated);
      return updated;
    });
  }, []);

  // Inventory CRUD
  const handleAddInventoryItem = useCallback((item: SwineFeedInventoryItem) => {
    setInventory(prev => {
      const updated = [item, ...prev];
      saveSwineInventory(updated);
      return updated;
    });
  }, []);

  const handleUpdateInventoryItem = useCallback((updatedItem: SwineFeedInventoryItem) => {
    setInventory(prev => {
      const updated = prev.map(i => (i.id === updatedItem.id ? updatedItem : i));
      saveSwineInventory(updated);
      return updated;
    });
  }, []);

  // Photo Diary CRUD
  const handleAddPhoto = useCallback((photo: SwinePhotoRecord) => {
    setPhotos(prev => {
      const updated = [photo, ...prev];
      saveSwinePhotos(updated);
      return updated;
    });
  }, []);

  const handleDeletePhoto = useCallback((id: string) => {
    setPhotos(prev => {
      const updated = prev.filter(p => p.id !== id);
      saveSwinePhotos(updated);
      return updated;
    });
  }, []);

  const totalAlerts = kpis.healthAlertsCount + kpis.criticalStockAlerts;

  const iesBadgeClass =
    iesScore.totalScore >= 90
      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
      : iesScore.totalScore >= 75
        ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
        : iesScore.totalScore >= 60
          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-10">
      {/* Compact Module Header + Summary KPI Strip */}
      <header className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center shrink-0">
              <SuinoIcon className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
                  Suinocultura de Precisão
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                  Ciclo Completo
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                Gestão zootécnica de plantel, reprodução, fases produtivas, ambiência, biosseguridade e Índice IES.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('ies_score')}
            className={`inline-flex items-center gap-2.5 h-9 px-3 rounded-lg border text-left transition-colors cursor-pointer shrink-0 ${iesBadgeClass}`}
            title="Abrir detalhamento do Índice IES"
          >
            <Award className="w-4 h-4 shrink-0" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-[11px] font-medium opacity-85">IES</span>
              <span className="text-sm font-semibold tabular-nums">{iesScore.totalScore}</span>
              <span className="text-[11px] opacity-80">/ 100</span>
            </div>
          </button>
        </div>

        {/* 5-KPI Executive Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-3 mt-3 border-t border-slate-200 dark:border-zinc-800">
          <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Plantel Total</p>
            <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5">
              {kpis.totalAnimals.toLocaleString('pt-BR')}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-500 tabular-nums">
              {kpis.activeSows} matrizes · {kpis.activeBoars} cachaços
            </p>
          </div>

          <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">GMD / Conversão</p>
            <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5">
              {kpis.avgDailyGainG > 0 ? `${kpis.avgDailyGainG} g/d` : '—'}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-500 tabular-nums">
              CA {kpis.avgFeedConversionRatio > 0 ? kpis.avgFeedConversionRatio.toFixed(2) : '—'}
            </p>
          </div>

          <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Desm./Matriz/Ano</p>
            <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5">
              {kpis.weanedPerSowYear > 0 ? kpis.weanedPerSowYear.toFixed(1) : '—'}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-500 tabular-nums">
              {kpis.maternityPiglets} leitões em lactação
            </p>
          </div>

          <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Mortalidade Global</p>
            <p
              className={`text-sm font-semibold tabular-nums mt-0.5 ${
                kpis.overallMortalityPct > 3
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-900 dark:text-zinc-100'
              }`}
            >
              {kpis.totalAnimals > 0 ? `${kpis.overallMortalityPct}%` : '—'}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-500 tabular-nums">
              Concepção {kpis.conceptionRatePct > 0 ? `${kpis.conceptionRatePct}%` : '—'}
            </p>
          </div>

          <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 col-span-2 sm:col-span-1">
            <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Alertas Operacionais</p>
            <p
              className={`text-sm font-semibold tabular-nums mt-0.5 ${
                totalAlerts > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {totalAlerts}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-500 tabular-nums">
              {kpis.pendingVaccinesCount} vacinas · {kpis.criticalStockAlerts} estoque crítico
            </p>
          </div>
        </div>
      </header>

      {/* Single-row Horizontally Scrollable Subtab Bar */}
      <nav
        aria-label="Submódulos de Suinocultura"
        className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-1.5"
      >
        <div role="tablist" className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {SWINE_NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(item.id)}
                className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Tab Render Container */}
      <main>
        {activeTab === 'dashboard' && (
          <SwineDashboardView
            kpis={kpis}
            iesScore={iesScore}
            animals={animals}
            batches={batches}
            litters={litters}
            sheds={sheds}
            inventory={inventory}
            biosecurity={biosecurity}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab !== 'dashboard' && (
          <Suspense fallback={<ViewFallback />}>
            {activeTab === 'flow_pipeline' && (
              <SwineProductionFlowView
                animals={animals}
                batches={batches}
                litters={litters}
                sheds={sheds}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'animals' && (
              <SwineIndividualRegistryView
                animals={animals}
                onAddAnimal={handleAddAnimal}
                onUpdateAnimal={handleUpdateAnimal}
                onDeleteAnimal={handleDeleteAnimal}
                onSelectAnimalForTwin={handleSelectAnimalForTwin}
              />
            )}

            {activeTab === 'digital_twin' && (
              <SwineDigitalTwinView
                animals={animals}
                selectedAnimal={selectedAnimalForTwin}
                onSelectAnimal={handleSelectAnimal}
                onUpdateAnimal={handleUpdateAnimal}
              />
            )}

            {activeTab === 'reproduction' && (
              <SwineReproductionView
                animals={animals}
                onUpdateAnimal={handleUpdateAnimal}
              />
            )}

            {activeTab === 'maternity' && (
              <SwineFarrowingMaternityView
                litters={litters}
                onAddLitter={handleAddLitter}
                onUpdateLitter={handleUpdateLitter}
                animals={animals}
              />
            )}

            {activeTab === 'nursery' && (
              <SwineNurseryView
                batches={batches}
                onAddBatch={handleAddBatch}
                onUpdateBatch={handleUpdateBatch}
              />
            )}

            {activeTab === 'grow_finish' && (
              <SwineGrowFinishView
                batches={batches}
                onAddBatch={handleAddBatch}
                onUpdateBatch={handleUpdateBatch}
              />
            )}

            {activeTab === 'nutrition' && (
              <SwineNutritionView
                diets={diets}
                onAddDiet={handleAddDiet}
              />
            )}

            {activeTab === 'water' && (
              <SwineWaterManagementView
                waterLogs={waterLogs}
                onAddWaterLog={handleAddWaterLog}
              />
            )}

            {activeTab === 'environment' && (
              <SwineEnvironmentView
                sheds={sheds}
                onAddShedReading={handleAddShedReading}
              />
            )}

            {activeTab === 'health' && (
              <SwineHealthSanityView
                animals={animals}
                onAddHealthRecordToAnimal={handleAddHealthRecordToAnimal}
              />
            )}

            {activeTab === 'diseases_lib' && <SwineDiseasesLibraryView />}

            {activeTab === 'biosecurity' && (
              <SwineBiosecurityView
                checks={biosecurity}
                onAddCheck={handleAddBiosecurityCheck}
                onUpdateCheck={handleUpdateBiosecurityCheck}
              />
            )}

            {activeTab === 'inventory' && (
              <SwineInventoryView
                items={inventory}
                onAddItem={handleAddInventoryItem}
                onUpdateItem={handleUpdateInventoryItem}
              />
            )}

            {activeTab === 'photo_diary' && (
              <SwinePhotoDiaryView
                animals={animals}
                photos={photos}
                onAddPhoto={handleAddPhoto}
                onDeletePhoto={handleDeletePhoto}
              />
            )}

            {activeTab === 'ies_score' && <SwineIESScoreView iesScore={iesScore} />}

            {activeTab === 'reports' && (
              <SwineReportsView
                animals={animals}
                batches={batches}
                litters={litters}
                iesScore={iesScore}
              />
            )}

            {activeTab === 'suite_integration' && (
              <SwineGeaSuiteIntegrationView
                onNavigateToTankMix={onNavigateToTankMix}
                onNavigateToPoultry={onNavigateToPoultry}
                onNavigateToBuffalo={onNavigateToBuffalo}
              />
            )}
          </Suspense>
        )}
      </main>
    </div>
  );
};

export default SwineModule;
