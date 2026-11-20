import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BookOpen,
  Droplets,
  Egg,
  Home,
  LayoutGrid,
  Plus,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Syringe,
  Thermometer,
  Wheat,
  X,
} from 'lucide-react';
import { PoultryBatch, PoultryPurpose, PoultryShed, PoultryTab } from '../types/poultry';
import {
  INITIAL_POULTRY_BATCHES,
  INITIAL_POULTRY_SHEDS,
  calculateIEA,
} from '../data/poultryData';
import { offlineDB } from '../utils/indexedDB';
import { lazyWithRetry } from '../utils/lazyWithRetry';
import {
  POULTRY_INPUT_CLASS,
  POULTRY_LABEL_CLASS,
  POULTRY_PRIMARY_BTN_CLASS,
  POULTRY_SECONDARY_BTN_CLASS,
  getIeaBadgeClass,
  getTodayIsoDate,
  normalizePoultryTab,
  useEscapeClose,
} from './poultry/poultryUi';
import { PoultryDashboardView } from './poultry/PoultryDashboardView';

const PoultryBatchTwinView = lazyWithRetry(() =>
  import('./poultry/PoultryBatchTwinView').then(m => ({ default: m.PoultryBatchTwinView }))
);
const PoultryShedAndEnvView = lazyWithRetry(() =>
  import('./poultry/PoultryShedAndEnvView').then(m => ({ default: m.PoultryShedAndEnvView }))
);
const PoultryOperationsView = lazyWithRetry(() =>
  import('./poultry/PoultryOperationsView').then(m => ({ default: m.PoultryOperationsView }))
);
const PoultryBiosecurityAndTraceView = lazyWithRetry(() =>
  import('./poultry/PoultryBiosecurityAndTraceView').then(m => ({
    default: m.PoultryBiosecurityAndTraceView,
  }))
);
const PoultryDiseaseLibraryView = lazyWithRetry(() =>
  import('./poultry/PoultryDiseaseLibraryView').then(m => ({
    default: m.PoultryDiseaseLibraryView,
  }))
);

interface PoultryModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: string) => void;
}

interface PoultryNavItem {
  id: PoultryTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const POULTRY_NAV_ITEMS: PoultryNavItem[] = [
  { id: 'dashboard', label: 'Visão Geral & IEA', icon: LayoutGrid },
  { id: 'lote_twin', label: 'Gêmeo do Lote', icon: Activity },
  { id: 'galpao_twin', label: 'Gêmeo do Galpão', icon: Home },
  { id: 'ambiente', label: 'Climatização', icon: Thermometer },
  { id: 'nutricao', label: 'Nutrição', icon: Wheat },
  { id: 'agua', label: 'Água', icon: Droplets },
  { id: 'pesagem', label: 'Pesagens', icon: Scale },
  { id: 'sanidade', label: 'Sanidade', icon: Syringe },
  { id: 'banco_doencas', label: 'Enfermidades', icon: BookOpen },
  { id: 'biosseguridade', label: 'Biosseguridade', icon: ShieldAlert },
  { id: 'producao', label: 'Postura & Ovos', icon: Egg },
  { id: 'rastreabilidade', label: 'Rastreabilidade', icon: ShieldCheck },
];

const ViewFallback: React.FC = () => (
  <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-8 text-center">
    <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
      Carregando módulo de avicultura...
    </p>
  </div>
);

export const PoultryModule: React.FC<PoultryModuleProps> = ({
  activeSubTab: propActiveSubTab,
  setActiveSubTab: propSetActiveSubTab,
}) => {
  const [internalTab, setInternalTab] = useState<PoultryTab>(() =>
    normalizePoultryTab(propActiveSubTab)
  );

  useEffect(() => {
    if (propActiveSubTab !== undefined) {
      const normalized = normalizePoultryTab(propActiveSubTab);
      setInternalTab(prev => (prev === normalized ? prev : normalized));
    }
  }, [propActiveSubTab]);

  const activeTab: PoultryTab =
    propActiveSubTab !== undefined ? normalizePoultryTab(propActiveSubTab) : internalTab;

  const setActiveTab = useCallback(
    (tab: PoultryTab | string) => {
      const normalized = normalizePoultryTab(tab);
      setInternalTab(normalized);
      propSetActiveSubTab?.(normalized);
    },
    [propSetActiveSubTab]
  );

  const [batches, setBatches] = useState<PoultryBatch[]>([]);
  const [sheds, setSheds] = useState<PoultryShed[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');

  // Modal states
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [newBatchCode, setNewBatchCode] = useState('');
  const [newBatchLineage, setNewBatchLineage] = useState('Cobb 500');
  const [newBatchPurpose, setNewBatchPurpose] = useState<PoultryPurpose>('Corte');
  const [newBatchQuantity, setNewBatchQuantity] = useState('30000');
  const [newBatchSupplier, setNewBatchSupplier] = useState('');
  const [newBatchHatchery, setNewBatchHatchery] = useState('');
  const [newBatchShedId, setNewBatchShedId] = useState('');
  const [newBatchTech, setNewBatchTech] = useState('');

  const [showAddShed, setShowAddShed] = useState(false);
  const [newShedName, setNewShedName] = useState('');
  const [newShedCapacity, setNewShedCapacity] = useState('35000');
  const [newShedDimensions, setNewShedDimensions] = useState('150x15m');
  const [newShedVentilation, setNewShedVentilation] = useState('Pressão Negativa (Dark House)');
  const [newShedHeating, setNewShedHeating] = useState('Fornos Automatizados');

  // IEA Simulator state
  const [simAgeDays, setSimAgeDays] = useState(42);
  const [simSlaughterWeight, setSimSlaughterWeight] = useState(2.8);
  const [simTotalFeed, setSimTotalFeed] = useState(130000);

  const closeBatchModal = useCallback(() => setShowAddBatch(false), []);
  const closeShedModal = useCallback(() => setShowAddShed(false), []);
  useEscapeClose(showAddBatch, closeBatchModal);
  useEscapeClose(showAddShed, closeShedModal);

  const loadOfflineData = useCallback(async () => {
    try {
      const [dbBatches, dbSheds] = await Promise.all([
        offlineDB.getAll<PoultryBatch>('poultry_batches'),
        offlineDB.getAll<PoultryShed>('poultry_sheds'),
      ]);
      setBatches(dbBatches.length > 0 ? dbBatches : INITIAL_POULTRY_BATCHES);
      setSheds(dbSheds.length > 0 ? dbSheds : INITIAL_POULTRY_SHEDS);
    } catch (err) {
      console.warn('Could not load poultry data from local DB:', err);
      setBatches(INITIAL_POULTRY_BATCHES);
      setSheds(INITIAL_POULTRY_SHEDS);
    }
  }, []);

  useEffect(() => {
    loadOfflineData();
  }, [loadOfflineData]);

  const currentBatch = useMemo<PoultryBatch | null>(() => {
    if (batches.length === 0) return null;
    return batches.find(b => b.id === selectedBatchId) ?? batches[0];
  }, [batches, selectedBatchId]);

  const ieaResult = useMemo(() => {
    if (!currentBatch) {
      return {
        score: 0,
        status: 'Crítico' as const,
        feedConversion: 0,
        mortalityRate: 0,
        uniformity: 0,
      };
    }
    return calculateIEA(currentBatch, simTotalFeed, simSlaughterWeight, simAgeDays);
  }, [currentBatch, simTotalFeed, simSlaughterWeight, simAgeDays]);

  const handleAddBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchCode.trim()) return;

    const initialQty = Math.max(1, Math.floor(Number(newBatchQuantity) || 0));
    const today = getTodayIsoDate();
    const newBatch: PoultryBatch = {
      id: `batch-${Date.now()}`,
      code: newBatchCode.trim(),
      lineage: newBatchLineage,
      purpose: newBatchPurpose,
      housingDate: today,
      initialQuantity: initialQty,
      currentQuantity: initialQty,
      supplier: newBatchSupplier.trim() || 'Não informado',
      hatchery: newBatchHatchery.trim() || 'Não informado',
      shedId: newBatchShedId || sheds[0]?.id || '',
      technicalResponsible: newBatchTech.trim() || 'Não informado',
      weighings: [
        {
          id: `pw-${Date.now()}`,
          date: today,
          averageWeight: 42,
          uniformity: 95,
          dailyGain: 0,
        },
      ],
      consumptions: [],
      healthEvents: [],
      productions: [],
    };

    await offlineDB.add('poultry_batches', newBatch);
    setBatches(prev => [newBatch, ...prev]);
    setSelectedBatchId(newBatch.id);
    setShowAddBatch(false);
    setNewBatchCode('');
    setNewBatchSupplier('');
    setNewBatchHatchery('');
    setNewBatchTech('');
  };

  const handleUpdateBatch = useCallback(async (updatedBatch: PoultryBatch) => {
    await offlineDB.put('poultry_batches', updatedBatch);
    setBatches(prev => prev.map(b => (b.id === updatedBatch.id ? updatedBatch : b)));
  }, []);

  const handleDeleteBatch = useCallback(async (id: string) => {
    await offlineDB.delete('poultry_batches', id);
    setBatches(prev => prev.filter(b => b.id !== id));
    setSelectedBatchId(prevId => (prevId === id ? '' : prevId));
  }, []);

  const handleAddShedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShedName.trim()) return;

    const newShed: PoultryShed = {
      id: `shed-${Date.now()}`,
      identification: newShedName.trim(),
      dimensions: newShedDimensions.trim() || '150x15m',
      capacity: Math.max(1, Math.floor(Number(newShedCapacity) || 0)),
      ventilationType: newShedVentilation.trim() || 'Pressão Negativa (Dark House)',
      heatingSystem: newShedHeating.trim() || 'Fornos Automatizados',
      environmentHistory: [],
    };

    await offlineDB.add('poultry_sheds', newShed);
    setSheds(prev => [newShed, ...prev]);
    setShowAddShed(false);
    setNewShedName('');
  };

  const handleUpdateShed = useCallback(async (updatedShed: PoultryShed) => {
    await offlineDB.put('poultry_sheds', updatedShed);
    setSheds(prev => prev.map(s => (s.id === updatedShed.id ? updatedShed : s)));
  }, []);

  const handleDeleteShed = useCallback(async (id: string) => {
    await offlineDB.delete('poultry_sheds', id);
    setSheds(prev => prev.filter(s => s.id !== id));
  }, []);

  const totalHousedBirds = useMemo(
    () => batches.reduce((sum, b) => sum + b.currentQuantity, 0),
    [batches]
  );
  const totalShedCapacity = useMemo(
    () => sheds.reduce((sum, s) => sum + s.capacity, 0),
    [sheds]
  );
  const latestBatchWeighing =
    currentBatch && currentBatch.weighings.length > 0
      ? currentBatch.weighings[currentBatch.weighings.length - 1]
      : null;

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-10">
      {/* Compact Module Header + Summary KPI Strip */}
      <header className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-center shrink-0">
              <Egg className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
                  Avicultura de Precisão
                </h1>
                {currentBatch && (
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    · Lote {currentBatch.code} ({currentBatch.lineage})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                Gestão de lotes, galpões, ambiência, nutrição, sanidade, postura, rastreabilidade e Índice IEA.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {batches.length > 1 && currentBatch && (
              <select
                aria-label="Lote ativo"
                value={currentBatch.id}
                onChange={e => setSelectedBatchId(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                {batches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.code} ({b.lineage})
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={() => setShowAddBatch(true)}
              className={POULTRY_PRIMARY_BTN_CLASS}
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Lote
            </button>
            <button
              type="button"
              onClick={() => setShowAddShed(true)}
              className={POULTRY_SECONDARY_BTN_CLASS}
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Galpão
            </button>
          </div>
        </div>

        {/* 4-KPI Summary Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 pt-3 mt-3 border-t border-slate-200 dark:border-zinc-800">
          <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Plantel Alojado
            </p>
            <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5">
              {totalHousedBirds.toLocaleString('pt-BR')}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-500 tabular-nums">
              {batches.length} {batches.length === 1 ? 'lote ativo' : 'lotes ativos'}
            </p>
          </div>

          <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Peso Médio / Unif.
            </p>
            <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5">
              {latestBatchWeighing ? `${latestBatchWeighing.averageWeight.toLocaleString('pt-BR')} g` : '—'}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-500 tabular-nums">
              {latestBatchWeighing ? `Uniformidade ${latestBatchWeighing.uniformity}%` : 'Sem pesagem'}
            </p>
          </div>

          <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Galpões & Capacidade
            </p>
            <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5">
              {sheds.length} {sheds.length === 1 ? 'aviário' : 'aviários'}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-500 tabular-nums">
              {totalShedCapacity > 0
                ? `${totalShedCapacity.toLocaleString('pt-BR')} aves`
                : 'Sem capacidade cadastrada'}
            </p>
          </div>

          <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Índice IEA Projetado
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                {currentBatch ? `${ieaResult.score} pts` : '—'}
              </p>
              {currentBatch && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getIeaBadgeClass(ieaResult.status)}`}>
                  {ieaResult.status}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-zinc-500 tabular-nums">
              {currentBatch ? `CA ${ieaResult.feedConversion.toFixed(2)}` : 'Cadastre um lote'}
            </p>
          </div>
        </div>
      </header>

      {/* Single-row Horizontally Scrollable 12-Tab Bar */}
      <nav
        aria-label="Submódulos de Avicultura"
        className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-1.5"
      >
        <div role="tablist" className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {POULTRY_NAV_ITEMS.map(item => {
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
                    ? 'bg-amber-600 text-white'
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

      {/* Main Content */}
      <main>
        {activeTab === 'dashboard' && (
          <PoultryDashboardView
            batches={batches}
            sheds={sheds}
            currentBatch={currentBatch}
            onSelectBatch={setSelectedBatchId}
            onOpenAddBatch={() => setShowAddBatch(true)}
            onOpenAddShed={() => setShowAddShed(true)}
            onNavigate={setActiveTab}
            ieaResult={ieaResult}
            simAgeDays={simAgeDays}
            setSimAgeDays={setSimAgeDays}
            simSlaughterWeight={simSlaughterWeight}
            setSimSlaughterWeight={setSimSlaughterWeight}
            simTotalFeed={simTotalFeed}
            setSimTotalFeed={setSimTotalFeed}
          />
        )}

        {activeTab !== 'dashboard' && (
          <Suspense fallback={<ViewFallback />}>
            {activeTab === 'lote_twin' && (
              <PoultryBatchTwinView
                batches={batches}
                sheds={sheds}
                currentBatch={currentBatch}
                onSelectBatch={setSelectedBatchId}
                onDeleteBatch={handleDeleteBatch}
                onOpenAddBatch={() => setShowAddBatch(true)}
                onNavigate={setActiveTab}
              />
            )}

            {(activeTab === 'galpao_twin' || activeTab === 'ambiente') && (
              <PoultryShedAndEnvView
                mode={activeTab}
                sheds={sheds}
                batches={batches}
                onOpenAddShed={() => setShowAddShed(true)}
                onUpdateShed={handleUpdateShed}
                onDeleteShed={handleDeleteShed}
              />
            )}

            {(activeTab === 'nutricao' ||
              activeTab === 'agua' ||
              activeTab === 'pesagem' ||
              activeTab === 'sanidade' ||
              activeTab === 'producao') && (
              <PoultryOperationsView
                mode={activeTab}
                currentBatch={currentBatch}
                onUpdateBatch={handleUpdateBatch}
                onOpenAddBatch={() => setShowAddBatch(true)}
              />
            )}

            {activeTab === 'banco_doencas' && <PoultryDiseaseLibraryView />}

            {(activeTab === 'biosseguridade' || activeTab === 'rastreabilidade') && (
              <PoultryBiosecurityAndTraceView
                mode={activeTab}
                currentBatch={currentBatch}
                sheds={sheds}
                ieaResult={ieaResult}
                onOpenAddBatch={() => setShowAddBatch(true)}
              />
            )}
          </Suspense>
        )}
      </main>

      {/* Modal: Novo Lote */}
      {showAddBatch && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-new-batch-title"
          onClick={e => {
            if (e.target === e.currentTarget) closeBatchModal();
          }}
          className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-zinc-950/75 flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleAddBatchSubmit}
            className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-5 space-y-4"
          >
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-zinc-800">
              <h2
                id="modal-new-batch-title"
                className="text-sm font-semibold text-slate-900 dark:text-zinc-100"
              >
                Alojar Novo Lote Avícola
              </h2>
              <button
                type="button"
                onClick={closeBatchModal}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
                aria-label="Fechar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={POULTRY_LABEL_CLASS}>Código do Lote *</label>
                <input
                  type="text"
                  required
                  value={newBatchCode}
                  onChange={e => setNewBatchCode(e.target.value)}
                  placeholder="Ex: LOTE-2026-A"
                  className={POULTRY_INPUT_CLASS}
                />
              </div>
              <div>
                <label className={POULTRY_LABEL_CLASS}>Linhagem</label>
                <select
                  value={newBatchLineage}
                  onChange={e => setNewBatchLineage(e.target.value)}
                  className={POULTRY_INPUT_CLASS}
                >
                  <option value="Cobb 500">Cobb 500</option>
                  <option value="Ross 308">Ross 308</option>
                  <option value="Hubbard">Hubbard</option>
                  <option value="Hy-Line Brown">Hy-Line Brown</option>
                  <option value="Lohmann LSL">Lohmann LSL</option>
                  <option value="Isa Brown">Isa Brown</option>
                </select>
              </div>
              <div>
                <label className={POULTRY_LABEL_CLASS}>Finalidade</label>
                <select
                  value={newBatchPurpose}
                  onChange={e => setNewBatchPurpose(e.target.value as PoultryPurpose)}
                  className={POULTRY_INPUT_CLASS}
                >
                  <option value="Corte">Corte</option>
                  <option value="Postura">Postura</option>
                  <option value="Reprodução">Reprodução</option>
                </select>
              </div>
              <div>
                <label className={POULTRY_LABEL_CLASS}>Qtd. Inicial de Aves *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={newBatchQuantity}
                  onChange={e => setNewBatchQuantity(e.target.value)}
                  className={POULTRY_INPUT_CLASS}
                />
              </div>
              <div>
                <label className={POULTRY_LABEL_CLASS}>Incubatório de Origem</label>
                <input
                  type="text"
                  value={newBatchHatchery}
                  onChange={e => setNewBatchHatchery(e.target.value)}
                  placeholder="Ex: Incubatório Regional"
                  className={POULTRY_INPUT_CLASS}
                />
              </div>
              <div>
                <label className={POULTRY_LABEL_CLASS}>Fornecedor / Integradora</label>
                <input
                  type="text"
                  value={newBatchSupplier}
                  onChange={e => setNewBatchSupplier(e.target.value)}
                  placeholder="Ex: Granja Matrizeira"
                  className={POULTRY_INPUT_CLASS}
                />
              </div>
              <div>
                <label className={POULTRY_LABEL_CLASS}>Galpão Vinculado</label>
                <select
                  value={newBatchShedId}
                  onChange={e => setNewBatchShedId(e.target.value)}
                  className={POULTRY_INPUT_CLASS}
                >
                  <option value="">Selecionar galpão...</option>
                  {sheds.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.identification} ({s.capacity.toLocaleString('pt-BR')} aves)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={POULTRY_LABEL_CLASS}>Responsável Técnico</label>
                <input
                  type="text"
                  value={newBatchTech}
                  onChange={e => setNewBatchTech(e.target.value)}
                  placeholder="Nome do técnico / veterinário"
                  className={POULTRY_INPUT_CLASS}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={closeBatchModal}
                className={POULTRY_SECONDARY_BTN_CLASS}
              >
                Cancelar
              </button>
              <button type="submit" className={POULTRY_PRIMARY_BTN_CLASS}>
                Salvar Lote
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Novo Galpão */}
      {showAddShed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-new-shed-title"
          onClick={e => {
            if (e.target === e.currentTarget) closeShedModal();
          }}
          className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-zinc-950/75 flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleAddShedSubmit}
            className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-5 space-y-4"
          >
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-zinc-800">
              <h2
                id="modal-new-shed-title"
                className="text-sm font-semibold text-slate-900 dark:text-zinc-100"
              >
                Cadastrar Novo Galpão / Aviário
              </h2>
              <button
                type="button"
                onClick={closeShedModal}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
                aria-label="Fechar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className={POULTRY_LABEL_CLASS}>Identificação do Galpão *</label>
                <input
                  type="text"
                  required
                  value={newShedName}
                  onChange={e => setNewShedName(e.target.value)}
                  placeholder="Ex: Galpão 01 - Dark House"
                  className={POULTRY_INPUT_CLASS}
                />
              </div>
              <div>
                <label className={POULTRY_LABEL_CLASS}>Capacidade (Aves) *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={newShedCapacity}
                  onChange={e => setNewShedCapacity(e.target.value)}
                  className={POULTRY_INPUT_CLASS}
                />
              </div>
              <div>
                <label className={POULTRY_LABEL_CLASS}>Dimensões</label>
                <input
                  type="text"
                  value={newShedDimensions}
                  onChange={e => setNewShedDimensions(e.target.value)}
                  placeholder="Ex: 150x15m"
                  className={POULTRY_INPUT_CLASS}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={POULTRY_LABEL_CLASS}>Sistema de Ventilação</label>
                <input
                  type="text"
                  value={newShedVentilation}
                  onChange={e => setNewShedVentilation(e.target.value)}
                  className={POULTRY_INPUT_CLASS}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={POULTRY_LABEL_CLASS}>Sistema de Aquecimento</label>
                <input
                  type="text"
                  value={newShedHeating}
                  onChange={e => setNewShedHeating(e.target.value)}
                  className={POULTRY_INPUT_CLASS}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={closeShedModal}
                className={POULTRY_SECONDARY_BTN_CLASS}
              >
                Cancelar
              </button>
              <button type="submit" className={POULTRY_PRIMARY_BTN_CLASS}>
                Salvar Galpão
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PoultryModule;
