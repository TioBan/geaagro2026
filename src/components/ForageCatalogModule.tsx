import React, { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { FORAGES_CATALOG, FORAGE_CATEGORIES_INFO, searchForages } from '../data/foragesCatalogData';
import { ForageCategory, ForageItem } from '../types/forage';
import { ForagePhotoCard } from './forage/ForagePhotoCard';
import { lazyWithRetry } from '../utils/lazyWithRetry';
import {
  Search,
  Sprout,
  Compass,
  Bug,
  Calculator,
  Scale,
  X,
  ArrowRight,
  Loader2,
  Droplets,
} from 'lucide-react';

const ForageDetailModal = lazyWithRetry(() =>
  import('./forage/ForageDetailModal').then(m => ({ default: m.ForageDetailModal }))
);
const ForageSoilMatcher = lazyWithRetry(() =>
  import('./forage/ForageSoilMatcher').then(m => ({ default: m.ForageSoilMatcher }))
);
const ForageSeedingCalculator = lazyWithRetry(() =>
  import('./forage/ForageSeedingCalculator').then(m => ({ default: m.ForageSeedingCalculator }))
);
const ForageDiseasesGuide = lazyWithRetry(() =>
  import('./forage/ForageDiseasesGuide').then(m => ({ default: m.ForageDiseasesGuide }))
);
const ForageComparator = lazyWithRetry(() =>
  import('./forage/ForageComparator').then(m => ({ default: m.ForageComparator }))
);

type ForageSubTab =
  | 'catalogo'
  | 'indicacao_solo'
  | 'doencas'
  | 'calculadora_semeadura'
  | 'comparador';

const VALID_SUBTABS: ForageSubTab[] = [
  'catalogo',
  'indicacao_solo',
  'doencas',
  'calculadora_semeadura',
  'comparador',
];

function normalizeSubTab(tab?: string): ForageSubTab {
  if (tab && (VALID_SUBTABS as string[]).includes(tab)) {
    return tab as ForageSubTab;
  }
  return 'catalogo';
}

interface ForageCatalogModuleProps {
  initialSubTab?: string;
  onSubTabChange?: (subTab: string) => void;
}

const CATEGORY_FILTER_OPTIONS: Array<{ id: ForageCategory | 'todas'; label: string; count: number }> = [
  { id: 'todas', label: 'Todas', count: FORAGES_CATALOG.length },
  {
    id: 'graminea_tropical',
    label: 'Gramíneas Tropicais',
    count: FORAGE_CATEGORIES_INFO.graminea_tropical.count,
  },
  {
    id: 'corte_silagem',
    label: 'Corte & Silagem',
    count: FORAGE_CATEGORIES_INFO.corte_silagem.count,
  },
  {
    id: 'graminea_temperada',
    label: 'Inverno / Temperadas',
    count: FORAGE_CATEGORIES_INFO.graminea_temperada.count,
  },
  {
    id: 'leguminosa_tropical',
    label: 'Leguminosas',
    count: FORAGE_CATEGORIES_INFO.leguminosa_tropical.count,
  },
  ...(FORAGE_CATEGORIES_INFO.leguminosa_temperada.count > 0
    ? [
        {
          id: 'leguminosa_temperada' as const,
          label: 'Leguminosas Temperadas',
          count: FORAGE_CATEGORIES_INFO.leguminosa_temperada.count,
        },
      ]
    : []),
];

export const ForageCatalogModule: React.FC<ForageCatalogModuleProps> = ({
  initialSubTab,
  onSubTabChange,
}) => {
  const [activeTab, setActiveTab] = useState<ForageSubTab>(() => normalizeSubTab(initialSubTab));

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(normalizeSubTab(initialSubTab));
    }
  }, [initialSubTab]);

  const handleTabChange = useCallback(
    (tab: ForageSubTab) => {
      setActiveTab(tab);
      onSubTabChange?.(tab);
    },
    [onSubTabChange]
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ForageCategory | 'todas'>('todas');
  const [selectedDrainage, setSelectedDrainage] = useState<string>('todos');
  const [selectedForageModal, setSelectedForageModal] = useState<ForageItem | null>(null);
  const [comparedForageIds, setComparedForageIds] = useState<string[]>([]);

  const handleToggleCompare = useCallback((forage: ForageItem) => {
    setComparedForageIds(prev => {
      if (prev.includes(forage.id)) {
        return prev.filter(id => id !== forage.id);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), forage.id];
      }
      return [...prev, forage.id];
    });
  }, []);

  const handleAddCompareById = useCallback((id: string) => {
    setComparedForageIds(prev => {
      if (!id || prev.includes(id) || prev.length >= 4) return prev;
      return [...prev, id];
    });
  }, []);

  const handleRemoveCompareById = useCallback((id: string) => {
    setComparedForageIds(prev => prev.filter(item => item !== id));
  }, []);

  const handleClearCompare = useCallback(() => {
    setComparedForageIds([]);
  }, []);

  const filteredForages = useMemo(() => {
    let list = searchForages(searchQuery);

    if (selectedCategory !== 'todas') {
      list = list.filter(f => f.category === selectedCategory);
    }

    if (selectedDrainage !== 'todos') {
      if (selectedDrainage === 'encharcamento') {
        list = list.filter(
          f =>
            f.soilAndClimate.drainageRequirement === 'tolerante_encharcamento' ||
            f.soilAndClimate.drainageRequirement === 'tolerante_inundacao'
        );
      } else if (selectedDrainage === 'seca') {
        list = list.filter(
          f =>
            f.phenology.droughtTolerance === 'Excelente' ||
            f.phenology.droughtTolerance === 'Alta'
        );
      } else if (selectedDrainage === 'baixa_fertilidade') {
        list = list.filter(f => f.soilAndClimate.fertilityRequirement === 'baixa');
      } else if (selectedDrainage === 'sombra') {
        list = list.filter(
          f =>
            f.strengthsAndWeaknesses.ilpfCompatibilityRating === 'Excelente' ||
            f.strengthsAndWeaknesses.ilpfCompatibilityRating === 'Boa' ||
            (f.phenology.shadeTolerancePercent !== undefined && f.phenology.shadeTolerancePercent >= 30)
        );
      }
    }

    return list;
  }, [searchQuery, selectedCategory, selectedDrainage]);

  const hasActiveFilters =
    searchQuery.trim() !== '' || selectedCategory !== 'todas' || selectedDrainage !== 'todos';

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('todas');
    setSelectedDrainage('todos');
  }, []);

  const tabs: Array<{
    id: ForageSubTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }> = [
    { id: 'catalogo', label: 'Catálogo', icon: Sprout, badge: FORAGES_CATALOG.length },
    { id: 'indicacao_solo', label: 'Solo & Clima', icon: Compass },
    { id: 'doencas', label: 'Sanidade & Doenças', icon: Bug },
    { id: 'calculadora_semeadura', label: 'Semeadura (VC%)', icon: Calculator },
    {
      id: 'comparador',
      label: 'Comparador',
      icon: Scale,
      badge: comparedForageIds.length > 0 ? comparedForageIds.length : undefined,
    },
  ];

  const lazyFallback = (
    <div className="flex items-center justify-center py-16 text-xs text-slate-500 dark:text-zinc-400 gap-2">
      <Loader2 className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
      <span>Carregando ferramenta...</span>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-14 px-3 sm:px-6 space-y-5">
      {/* Compact Module Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
            Informações sobre Forrageiras
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Catálogo bromatológico, manejo rotacionado, fitossanidade e recomendação por solo e clima.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 tabular-nums shrink-0">
          <span>
            <strong className="font-semibold text-slate-800 dark:text-zinc-200">
              {FORAGES_CATALOG.length}
            </strong>{' '}
            espécies
          </span>
          <span className="text-slate-300 dark:text-zinc-700">·</span>
          <span>
            <strong className="font-semibold text-slate-800 dark:text-zinc-200">
              {comparedForageIds.length}/4
            </strong>{' '}
            em comparação
          </span>
        </div>
      </header>

      {/* Hairline Navigation Bar */}
      <nav
        aria-label="Seções de forrageiras"
        className="flex items-center gap-1 overflow-x-auto border-b border-slate-200/80 dark:border-zinc-800 pb-px"
      >
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors cursor-pointer ${
                isActive
                  ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
                  : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:border-slate-300 dark:hover:border-zinc-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[11px] tabular-nums ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-slate-400 dark:text-zinc-500'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* TAB 1: CATÁLOGO */}
      {activeTab === 'catalogo' && (
        <div className="space-y-4">
          {/* Unified Filter Bar */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-3 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
              <div className="md:col-span-6 relative">
                <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar por espécie, cultivar, nome científico ou característica..."
                  className="w-full h-9 pl-8 pr-8 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/90 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Limpar busca"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="md:col-span-4 relative">
                <Droplets className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedDrainage}
                  onChange={e => setSelectedDrainage(e.target.value)}
                  aria-label="Filtrar por tolerância ou condição"
                  className="w-full h-9 pl-8 pr-3 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/90 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="todos">Condição / Tolerância: Todas</option>
                  <option value="encharcamento">Tolerante a Encharcamento / Várzea</option>
                  <option value="seca">Alta Tolerância à Seca</option>
                  <option value="baixa_fertilidade">Adaptada a Solo de Baixa Fertilidade</option>
                  <option value="sombra">Tolerante a Sombra / ILPF</option>
                </select>
              </div>

              <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-2">
                <span className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums whitespace-nowrap">
                  <strong className="font-semibold text-slate-800 dark:text-zinc-200">
                    {filteredForages.length}
                  </strong>{' '}
                  de {FORAGES_CATALOG.length}
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            {/* Category Segmented Row */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 border-t border-slate-100 dark:border-zinc-800/80">
              {CATEGORY_FILTER_OPTIONS.map(cat => {
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      active
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`text-[11px] tabular-nums ${
                        active ? 'text-emerald-100' : 'text-slate-400 dark:text-zinc-500'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inline Comparison Bar */}
          {comparedForageIds.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-emerald-500/40 dark:border-emerald-500/30 rounded-xl px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-medium text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Comparação ({comparedForageIds.length}/4):
                </span>
                {comparedForageIds.map(id => {
                  const item = FORAGES_CATALOG.find(f => f.id === id);
                  if (!item) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-[11px] font-medium"
                    >
                      <span>{item.commonName}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCompareById(id)}
                        aria-label={`Remover ${item.commonName} da comparação`}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearCompare}
                  className="h-7 px-2.5 rounded-lg text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Limpar
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('comparador')}
                  className="h-7 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Abrir Comparador</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Forage Grid */}
          {filteredForages.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-10 text-center space-y-2.5">
              <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">
                Nenhuma forrageira encontrada para os filtros aplicados.
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Ajuste o termo de busca, categoria ou condição de tolerância.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredForages.map(forage => (
                <ForagePhotoCard
                  key={forage.id}
                  forage={forage}
                  onSelectForage={setSelectedForageModal}
                  isSelectedForCompare={comparedForageIds.includes(forage.id)}
                  onToggleCompare={handleToggleCompare}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RECOMENDADOR SOLO & CLIMA */}
      {activeTab === 'indicacao_solo' && (
        <Suspense fallback={lazyFallback}>
          <ForageSoilMatcher onSelectForage={setSelectedForageModal} />
        </Suspense>
      )}

      {/* TAB 3: SANIDADE & DOENÇAS */}
      {activeTab === 'doencas' && (
        <Suspense fallback={lazyFallback}>
          <ForageDiseasesGuide onSelectForage={setSelectedForageModal} />
        </Suspense>
      )}

      {/* TAB 4: CALCULADORA DE SEMEADURA */}
      {activeTab === 'calculadora_semeadura' && (
        <Suspense fallback={lazyFallback}>
          <ForageSeedingCalculator />
        </Suspense>
      )}

      {/* TAB 5: COMPARADOR */}
      {activeTab === 'comparador' && (
        <Suspense fallback={lazyFallback}>
          <ForageComparator
            selectedForageIds={comparedForageIds}
            onRemoveForage={handleRemoveCompareById}
            onAddForage={handleAddCompareById}
            onClearAll={handleClearCompare}
            onSelectForage={setSelectedForageModal}
            onGoToCatalog={() => handleTabChange('catalogo')}
          />
        </Suspense>
      )}

      {/* DETAIL MODAL */}
      {selectedForageModal && (
        <Suspense fallback={null}>
          <ForageDetailModal
            forage={selectedForageModal}
            onClose={() => setSelectedForageModal(null)}
            onSelectAnotherForage={setSelectedForageModal}
          />
        </Suspense>
      )}
    </div>
  );
};
