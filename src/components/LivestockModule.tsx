import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Beef,
  Droplets,
  Heart,
  LayoutGrid,
  Leaf,
  Plus,
  Printer,
  Search,
  ShieldCheck,
  Syringe,
  Trash2,
} from 'lucide-react';
import { Animal, AnimalPurpose, Paddock } from '../types/livestock';
import { INITIAL_ANIMALS, INITIAL_PADDOCKS } from '../data/livestockData';
import { offlineDB } from '../utils/indexedDB';
import { AddAnimalModal, AddPaddockModal } from './livestock/LivestockFormsModal';
import {
  BeefWeightView,
  DairyMilkView,
  HealthSanitationView,
  ReproductionView,
} from './livestock/LivestockRecordsViews';
import {
  IspaSimulatorView,
  PastureTwinView,
} from './livestock/LivestockPastureAndIspaViews';

type CanonicalLivestockTab =
  | 'dashboard'
  | 'rebanho'
  | 'corte'
  | 'leite'
  | 'reproducao'
  | 'sanidade'
  | 'pastagens'
  | 'ispa';

interface LivestockModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: string) => void;
}

const TABS: Array<{
  id: CanonicalLivestockTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'dashboard', label: 'Visão Geral', icon: LayoutGrid },
  { id: 'rebanho', label: 'Rebanho & Gêmeo', icon: ShieldCheck },
  { id: 'corte', label: 'Corte & Pesagens', icon: Beef },
  { id: 'leite', label: 'Leite & Tanque', icon: Droplets },
  { id: 'reproducao', label: 'Reprodução & IATF', icon: Heart },
  { id: 'sanidade', label: 'Sanidade & Vacinas', icon: Syringe },
  { id: 'pastagens', label: 'Pastagens & Piquetes', icon: Leaf },
  { id: 'ispa', label: 'Simulador ISPA', icon: Activity },
];

function normalizeLivestockTab(tab?: string): CanonicalLivestockTab {
  switch (tab) {
    case 'rebanho':
    case 'animal_twin':
      return 'rebanho';
    case 'corte':
    case 'weight':
    case 'beef':
      return 'corte';
    case 'leite':
    case 'milk':
      return 'leite';
    case 'reproducao':
    case 'reproduction':
      return 'reproducao';
    case 'sanidade':
    case 'health':
    case 'pharmacy':
    case 'guia_doencas':
      return 'sanidade';
    case 'pastagens':
    case 'pasture_twin':
      return 'pastagens';
    case 'ispa':
    case 'nutricao':
    case 'nutrition':
    case 'analytics':
    case 'relatorios':
    case 'genetics':
      return 'ispa';
    case 'dashboard':
    default:
      return 'dashboard';
  }
}

export const LivestockModule: React.FC<LivestockModuleProps> = ({
  activeSubTab,
  setActiveSubTab,
}) => {
  const [internalTab, setInternalTab] = useState<CanonicalLivestockTab>('dashboard');
  const activeTab: CanonicalLivestockTab = activeSubTab
    ? normalizeLivestockTab(activeSubTab)
    : internalTab;

  const navigateTab = (tab: CanonicalLivestockTab) => {
    setInternalTab(tab);
    if (setActiveSubTab) {
      setActiveSubTab(tab);
    }
  };

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [paddocks, setPaddocks] = useState<Paddock[]>([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [selectedPaddockId, setSelectedPaddockId] = useState<string>('');

  const [showAddAnimal, setShowAddAnimal] = useState(false);
  const [showAddPaddock, setShowAddPaddock] = useState(false);

  const [herdSearch, setHerdSearch] = useState('');
  const [purposeFilter, setPurposeFilter] = useState<'Todas' | AnimalPurpose>('Todas');
  const [confirmDeleteAnimalId, setConfirmDeleteAnimalId] = useState<string | null>(null);

  const loadOfflineData = async () => {
    try {
      const [dbAnimals, dbPaddocks] = await Promise.all([
        offlineDB.getAll<Animal>('animals'),
        offlineDB.getAll<Paddock>('paddocks'),
      ]);
      const nextAnimals = dbAnimals.length > 0 ? dbAnimals : INITIAL_ANIMALS;
      const nextPaddocks = dbPaddocks.length > 0 ? dbPaddocks : INITIAL_PADDOCKS;
      setAnimals(nextAnimals);
      setPaddocks(nextPaddocks);
      setSelectedAnimalId((prev) =>
        nextAnimals.some((a) => a.id === prev) ? prev : nextAnimals[0]?.id || ''
      );
      setSelectedPaddockId((prev) =>
        nextPaddocks.some((p) => p.id === prev) ? prev : nextPaddocks[0]?.id || ''
      );
    } catch (err) {
      console.warn('Não foi possível carregar dados locais da bovinocultura:', err);
      setAnimals(INITIAL_ANIMALS);
      setPaddocks(INITIAL_PADDOCKS);
    }
  };

  useEffect(() => {
    loadOfflineData();
  }, []);

  const handleAddAnimal = async (newAnimal: Animal) => {
    await offlineDB.add('animals', newAnimal);
    await loadOfflineData();
    setSelectedAnimalId(newAnimal.id);
  };

  const handleUpdateAnimal = async (updated: Animal) => {
    await offlineDB.put('animals', updated);
    await loadOfflineData();
  };

  const handleDeleteAnimal = async (id: string) => {
    await offlineDB.delete('animals', id);
    setConfirmDeleteAnimalId(null);
    await loadOfflineData();
  };

  const handleAddPaddock = async (newPaddock: Paddock) => {
    await offlineDB.add('paddocks', newPaddock);
    await loadOfflineData();
    setSelectedPaddockId(newPaddock.id);
  };

  const handleUpdatePaddock = async (updated: Paddock) => {
    await offlineDB.put('paddocks', updated);
    await loadOfflineData();
  };

  const handleDeletePaddock = async (id: string) => {
    await offlineDB.delete('paddocks', id);
    await loadOfflineData();
  };

  // Dynamic KPIs computed exclusively from real stored herd & pasture records
  const kpis = useMemo(() => {
    const totalAnimals = animals.length;
    const beefCount = animals.filter((a) => a.purpose === 'Corte').length;
    const dairyMixedCount = totalAnimals - beefCount;

    const avgWeight =
      totalAnimals > 0
        ? animals.reduce((sum, a) => sum + (a.currentWeight || 0), 0) / totalAnimals
        : 0;
    const totalArrobas = animals.reduce(
      (sum, a) => sum + ((a.currentWeight || 0) * 0.5) / 15,
      0
    );

    const gmds: number[] = [];
    let diagTotal = 0;
    let diagPos = 0;
    let activeGraceCount = 0;
    const now = Date.now();

    animals.forEach((a) => {
      (a.weightHistory || []).forEach((w) => {
        if (typeof w.gmd === 'number') gmds.push(w.gmd);
      });
      (a.reproHistory || []).forEach((r) => {
        if (r.type === 'Diagnóstico Gestação') {
          diagTotal += 1;
          if ((r.result || '').toLowerCase().includes('prenh')) {
            diagPos += 1;
          }
        }
      });
      (a.healthHistory || []).forEach((h) => {
        if (h.gracePeriodDays && h.gracePeriodDays > 0) {
          const end = new Date(h.date).getTime() + h.gracePeriodDays * 86400000;
          if (end > now) activeGraceCount += 1;
        }
      });
    });

    const avgGmd = gmds.length > 0 ? gmds.reduce((s, v) => s + v, 0) / gmds.length : null;
    const pregnancyRate = diagTotal > 0 ? Math.round((diagPos / diagTotal) * 100) : null;

    const totalAreaHa = paddocks.reduce((s, p) => s + (p.areaHa || 0), 0);
    const avgStockingAU =
      paddocks.length > 0
        ? paddocks.reduce((s, p) => s + (p.stockingRateAU || 0), 0) / paddocks.length
        : 0;

    return {
      totalAnimals,
      beefCount,
      dairyMixedCount,
      avgWeight,
      totalArrobas,
      avgGmd,
      diagTotal,
      pregnancyRate,
      activeGraceCount,
      totalAreaHa,
      avgStockingAU,
    };
  }, [animals, paddocks]);

  const filteredAnimals = useMemo(() => {
    const query = herdSearch.trim().toLowerCase();
    return animals.filter((a) => {
      if (purposeFilter !== 'Todas' && a.purpose !== purposeFilter) return false;
      if (!query) return true;
      return (
        a.number.toLowerCase().includes(query) ||
        a.name.toLowerCase().includes(query) ||
        a.breed.toLowerCase().includes(query) ||
        a.batch.toLowerCase().includes(query) ||
        a.category.toLowerCase().includes(query)
      );
    });
  }, [animals, herdSearch, purposeFilter]);

  const currentAnimal = useMemo(() => {
    return (
      filteredAnimals.find((a) => a.id === selectedAnimalId) ||
      filteredAnimals[0] ||
      null
    );
  }, [filteredAnimals, selectedAnimalId]);

  const currentAnimalPaddockName = useMemo(() => {
    if (!currentAnimal) return '—';
    const found = paddocks.find((p) => p.id === currentAnimal.paddockId);
    return found ? `${found.name} (${found.areaHa} ha)` : currentAnimal.paddockId || 'Não alocado';
  }, [currentAnimal, paddocks]);

  const currentAnimalTimeline = useMemo(() => {
    if (!currentAnimal) return [];
    const items: Array<{
      id: string;
      date: string;
      category: 'Pesagem' | 'Reprodução' | 'Sanidade' | 'Leite';
      title: string;
      detail: string;
    }> = [];

    (currentAnimal.weightHistory || []).forEach((w) => {
      items.push({
        id: w.id,
        date: w.date,
        category: 'Pesagem',
        title: `${w.weight} kg`,
        detail: `${w.gmd !== undefined ? `GMD ${w.gmd >= 0 ? '+' : ''}${w.gmd.toFixed(2)} kg/d · ` : ''}ECC ${w.bodyConditionScore.toFixed(2)}`,
      });
    });
    (currentAnimal.reproHistory || []).forEach((r) => {
      items.push({
        id: r.id,
        date: r.date,
        category: 'Reprodução',
        title: r.type,
        detail: [r.result, r.bullId ? `Touro: ${r.bullId}` : '', r.notes]
          .filter(Boolean)
          .join(' · ') || 'Registrado',
      });
    });
    (currentAnimal.healthHistory || []).forEach((h) => {
      items.push({
        id: h.id,
        date: h.date,
        category: 'Sanidade',
        title: `${h.type}${h.product ? ` · ${h.product}` : ''}`,
        detail: `${h.description}${h.gracePeriodDays ? ` · Carência ${h.gracePeriodDays}d` : ''}`,
      });
    });
    (currentAnimal.milkHistory || []).forEach((m) => {
      items.push({
        id: m.id,
        date: m.date,
        category: 'Leite',
        title: `${m.volume.toFixed(1)} L`,
        detail: [
          m.fatPercentage !== undefined ? `Gord ${m.fatPercentage.toFixed(1)}%` : '',
          m.proteinPercentage !== undefined ? `Prot ${m.proteinPercentage.toFixed(1)}%` : '',
          m.ccs !== undefined ? `CCS ${m.ccs} mil` : '',
        ]
          .filter(Boolean)
          .join(' · '),
      });
    });

    return items.sort((a, b) => b.date.localeCompare(a.date));
  }, [currentAnimal]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-5 space-y-4">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Bovinocultura & Gestão Zootécnica
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Controle de rebanho, pesagens GMD, produção leiteira, reprodução IATF, sanidade e pastagens
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap print:hidden">
          <button
            type="button"
            onClick={() => setShowAddAnimal(true)}
            className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Animal
          </button>
          <button
            type="button"
            onClick={() => setShowAddPaddock(true)}
            className="h-8 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-md inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Piquete
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            title="Imprimir resumo zootécnico"
            className="h-8 px-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-md inline-flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Imprimir</span>
          </button>
        </div>
      </div>

      {/* Horizontal Hairline Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 overflow-x-auto print:hidden">
        <nav className="flex items-center gap-1 min-w-max" aria-label="Submódulos de Bovinocultura">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => navigateTab(tab.id)}
                className={`h-9 px-3 text-xs font-medium inline-flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ==================== 1. DASHBOARD ==================== */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          {/* Unified 4-KPI Hairline Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
            <div className="p-4">
              <span className="text-xs text-slate-500 dark:text-slate-400">Rebanho Ativo</span>
              <strong className="text-xl font-bold text-slate-900 dark:text-white block mt-1 tabular-nums">
                {kpis.totalAnimals}
              </strong>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                Corte: {kpis.beefCount} · Leite/Misto: {kpis.dairyMixedCount}
              </span>
            </div>

            <div className="p-4">
              <span className="text-xs text-slate-500 dark:text-slate-400">Lotação Média</span>
              <strong className="text-xl font-bold text-slate-900 dark:text-white block mt-1 tabular-nums">
                {paddocks.length > 0 ? `${kpis.avgStockingAU.toFixed(2)} UA/ha` : '—'}
              </strong>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                {paddocks.length} piquetes · {kpis.totalAreaHa.toFixed(1)} ha
              </span>
            </div>

            <div className="p-4">
              <span className="text-xs text-slate-500 dark:text-slate-400">Peso Médio & Estoque</span>
              <strong className="text-xl font-bold text-emerald-700 dark:text-emerald-400 block mt-1 tabular-nums">
                {kpis.totalAnimals > 0 ? `${kpis.avgWeight.toFixed(1)} kg` : '—'}
              </strong>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                GMD {kpis.avgGmd !== null ? `${kpis.avgGmd.toFixed(2)} kg/d` : '—'} ·{' '}
                {kpis.totalArrobas.toFixed(1)} @
              </span>
            </div>

            <div className="p-4">
              <span className="text-xs text-slate-500 dark:text-slate-400">Taxa de Prenhez (DG)</span>
              <strong className="text-xl font-bold text-slate-900 dark:text-white block mt-1 tabular-nums">
                {kpis.pregnancyRate !== null ? `${kpis.pregnancyRate}%` : '—'}
              </strong>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                {kpis.diagTotal} diagnósticos · {kpis.activeGraceCount} carência(s)
              </span>
            </div>
          </div>

          {/* Two-Column Operational Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Herd */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-xs font-semibold text-slate-900 dark:text-white">
                  Animais Cadastrados
                </h2>
                <button
                  type="button"
                  onClick={() => navigateTab('rebanho')}
                  className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Abrir Rebanho
                </button>
              </div>

              {animals.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Nenhum bovino cadastrado no rebanho.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddAnimal(true)}
                    className="mt-3 h-7 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Cadastrar Animal
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {animals.slice(0, 6).map((animal) => (
                    <button
                      key={animal.id}
                      type="button"
                      onClick={() => {
                        setSelectedAnimalId(animal.id);
                        navigateTab('rebanho');
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                          #{animal.number} · {animal.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {animal.breed} · {animal.category} · {animal.purpose} · {animal.batch}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white tabular-nums shrink-0">
                        {animal.currentWeight} kg
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Paddocks Overview */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-xs font-semibold text-slate-900 dark:text-white">
                  Situação das Pastagens
                </h2>
                <button
                  type="button"
                  onClick={() => navigateTab('pastagens')}
                  className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Gerenciar Piquetes
                </button>
              </div>

              {paddocks.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Nenhum piquete registrado na propriedade.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddPaddock(true)}
                    className="mt-3 h-7 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Cadastrar Piquete
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paddocks.slice(0, 6).map((paddock) => {
                    const lowHeight = paddock.currentHeightCm < paddock.targetHeightCm * 0.85;
                    return (
                      <button
                        key={paddock.id}
                        type="button"
                        onClick={() => {
                          setSelectedPaddockId(paddock.id);
                          navigateTab('pastagens');
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                            {paddock.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {paddock.forageSpecies} ({paddock.cultivar}) · {paddock.areaHa} ha
                          </p>
                        </div>
                        <div className="text-right tabular-nums shrink-0">
                          <p
                            className={`text-xs font-semibold ${
                              lowHeight
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-emerald-700 dark:text-emerald-400'
                            }`}
                          >
                            {paddock.currentHeightCm} / {paddock.targetHeightCm} cm
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {paddock.stockingRateAU} UA/ha
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== 2. REBANHO & GÊMEO DIGITAL ==================== */}
      {activeTab === 'rebanho' && (
        <div className="space-y-4">
          {/* Search & Purpose Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={herdSearch}
                onChange={(e) => setHerdSearch(e.target.value)}
                placeholder="Buscar por brinco, nome, raça, categoria ou lote..."
                className="w-full h-8 pl-8 pr-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 rounded-md w-fit">
              {(['Todas', 'Corte', 'Leite', 'Misto'] as const).map((purpose) => (
                <button
                  key={purpose}
                  type="button"
                  onClick={() => setPurposeFilter(purpose)}
                  className={`h-7 px-2.5 text-xs font-medium rounded transition-colors ${
                    purposeFilter === purpose
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {purpose}
                </button>
              ))}
            </div>
          </div>

          {animals.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg py-10 px-4 text-center">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Nenhum bovino cadastrado no rebanho
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Adicione os animais com brinco, raça, categoria e peso inicial para habilitar o Gêmeo Digital e a rastreabilidade completa.
              </p>
              <button
                type="button"
                onClick={() => setShowAddAnimal(true)}
                className="mt-4 h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Cadastrar Primeiro Animal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Left: Herd List */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Lista do Rebanho
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                    {filteredAnimals.length} de {animals.length}
                  </span>
                </div>

                {filteredAnimals.length === 0 ? (
                  <p className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                    Nenhum animal corresponde aos filtros selecionados.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[540px] overflow-y-auto">
                    {filteredAnimals.map((animal) => {
                      const isSelected = currentAnimal?.id === animal.id;
                      return (
                        <button
                          key={animal.id}
                          type="button"
                          onClick={() => {
                            setSelectedAnimalId(animal.id);
                            setConfirmDeleteAnimalId(null);
                          }}
                          className={`w-full px-4 py-2.5 text-left flex items-center justify-between gap-2 transition-colors border-l-2 ${
                            isSelected
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-600 dark:border-emerald-400'
                              : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                              #{animal.number} · {animal.name}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {animal.breed} · {animal.category} · {animal.batch}
                            </p>
                          </div>
                          <div className="text-right shrink-0 tabular-nums">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">
                              {animal.currentWeight} kg
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {animal.purpose}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right: Animal Digital Twin Detail */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 sm:p-5 space-y-4">
                {currentAnimal ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                            #{currentAnimal.number} · {currentAnimal.name}
                          </h2>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {currentAnimal.purpose}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                          {currentAnimal.breed} ({currentAnimal.bloodDegree}) ·{' '}
                          {currentAnimal.sex === 'F' ? 'Fêmea' : 'Macho'} · {currentAnimal.category} · RFID{' '}
                          {currentAnimal.rfid}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {confirmDeleteAnimalId === currentAnimal.id ? (
                          <div className="flex items-center gap-1 text-xs">
                            <button
                              type="button"
                              onClick={() => handleDeleteAnimal(currentAnimal.id)}
                              className="h-7 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-medium"
                            >
                              Confirmar exclusão
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteAnimalId(null)}
                              className="h-7 px-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-md"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteAnimalId(currentAnimal.id)}
                            title="Remover animal"
                            className="h-7 w-7 inline-flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 hover:text-rose-600 dark:hover:text-rose-400 text-slate-500 dark:text-slate-400 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Key Animal Attributes */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs tabular-nums">
                      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-md p-3">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                          Peso Atual
                        </span>
                        <strong className="text-sm font-bold text-slate-900 dark:text-white block mt-0.5">
                          {currentAnimal.currentWeight} kg
                        </strong>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {((currentAnimal.currentWeight * 0.5) / 15).toFixed(1)} @ (50% RC)
                        </span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-md p-3">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                          Lote & Origem
                        </span>
                        <strong className="text-sm font-semibold text-slate-900 dark:text-white block mt-0.5 truncate">
                          {currentAnimal.batch}
                        </strong>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                          {currentAnimal.origin}
                        </span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-md p-3">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                          Piquete Atual
                        </span>
                        <strong className="text-sm font-semibold text-slate-900 dark:text-white block mt-0.5 truncate">
                          {currentAnimalPaddockName}
                        </strong>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-md p-3">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                          Nascimento
                        </span>
                        <strong className="text-sm font-semibold text-slate-900 dark:text-white block mt-0.5">
                          {currentAnimal.birthDate}
                        </strong>
                      </div>
                    </div>

                    {/* Quick Action Shortcuts */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 print:hidden">
                      <button
                        type="button"
                        onClick={() => navigateTab('corte')}
                        className="h-7 px-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-md transition-colors"
                      >
                        + Pesagem
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateTab('leite')}
                        className="h-7 px-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-md transition-colors"
                      >
                        + Controle Leiteiro
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateTab('reproducao')}
                        className="h-7 px-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-md transition-colors"
                      >
                        + Reprodução
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateTab('sanidade')}
                        className="h-7 px-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-md transition-colors"
                      >
                        + Sanidade
                      </button>
                    </div>

                    {/* Unified Event Timeline */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                        Histórico Unificado do Animal ({currentAnimalTimeline.length})
                      </h3>
                      {currentAnimalTimeline.length === 0 ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                          Nenhum evento registrado para este animal.
                        </p>
                      ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto text-xs">
                          {currentAnimalTimeline.map((item) => (
                            <div
                              key={item.id}
                              className="py-2 flex items-start justify-between gap-3"
                            >
                              <div className="min-w-0">
                                <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                                  {item.date}
                                </span>
                                <span className="mx-1.5 text-slate-300 dark:text-slate-700">·</span>
                                <span className="font-medium text-emerald-700 dark:text-emerald-400">
                                  {item.category}
                                </span>
                                <span className="mx-1.5 text-slate-300 dark:text-slate-700">·</span>
                                <strong className="text-slate-900 dark:text-white">
                                  {item.title}
                                </strong>
                                {item.detail && (
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    {item.detail}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-8 text-center">
                    Selecione um animal na lista ao lado para inspecionar o Gêmeo Digital.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== 3. CORTE & PESAGENS ==================== */}
      {activeTab === 'corte' && (
        <BeefWeightView
          animals={animals}
          onUpdateAnimal={handleUpdateAnimal}
          onOpenAddAnimal={() => setShowAddAnimal(true)}
        />
      )}

      {/* ==================== 4. LEITE & TANQUE ==================== */}
      {activeTab === 'leite' && (
        <DairyMilkView
          animals={animals}
          onUpdateAnimal={handleUpdateAnimal}
          onOpenAddAnimal={() => setShowAddAnimal(true)}
        />
      )}

      {/* ==================== 5. REPRODUÇÃO & IATF ==================== */}
      {activeTab === 'reproducao' && (
        <ReproductionView
          animals={animals}
          onUpdateAnimal={handleUpdateAnimal}
          onOpenAddAnimal={() => setShowAddAnimal(true)}
        />
      )}

      {/* ==================== 6. SANIDADE & VACINAS ==================== */}
      {activeTab === 'sanidade' && (
        <HealthSanitationView
          animals={animals}
          onUpdateAnimal={handleUpdateAnimal}
          onOpenAddAnimal={() => setShowAddAnimal(true)}
        />
      )}

      {/* ==================== 7. PASTAGENS & PIQUETES ==================== */}
      {activeTab === 'pastagens' && (
        <PastureTwinView
          paddocks={paddocks}
          selectedPaddockId={selectedPaddockId}
          onSelectPaddock={setSelectedPaddockId}
          onUpdatePaddock={handleUpdatePaddock}
          onDeletePaddock={handleDeletePaddock}
          onOpenAddPaddock={() => setShowAddPaddock(true)}
        />
      )}

      {/* ==================== 8. SIMULADOR ISPA ==================== */}
      {activeTab === 'ispa' && <IspaSimulatorView />}

      {/* Modals */}
      {showAddAnimal && (
        <AddAnimalModal
          paddocks={paddocks}
          onClose={() => setShowAddAnimal(false)}
          onSave={handleAddAnimal}
        />
      )}

      {showAddPaddock && (
        <AddPaddockModal
          onClose={() => setShowAddPaddock(false)}
          onSave={handleAddPaddock}
        />
      )}
    </div>
  );
};
