import React, { useState, useMemo } from 'react';
import { FORAGES_CATALOG, FORAGE_CATEGORIES_INFO, searchForages } from '../data/foragesCatalogData';
import { ForageItem, ForageCategory } from '../types/forage';
import { ForagePhotoCard } from './forage/ForagePhotoCard';
import { ForageDetailModal } from './forage/ForageDetailModal';
import { ForageSoilMatcher } from './forage/ForageSoilMatcher';
import { ForageSeedingCalculator } from './forage/ForageSeedingCalculator';
import { ForageDiseasesGuide } from './forage/ForageDiseasesGuide';
import { ForageComparator } from './forage/ForageComparator';
import {
  Leaf,
  Search,
  SlidersHorizontal,
  Compass,
  Calculator,
  Bug,
  Scale,
  Sparkles,
  BookOpen,
  Filter,
  CheckCircle2,
} from 'lucide-react';

interface ForageCatalogModuleProps {
  initialSubTab?: string;
  onNavigateSubTab?: (subTabId: string) => void;
}

export const ForageCatalogModule: React.FC<ForageCatalogModuleProps> = ({
  initialSubTab = 'catalogo',
  onNavigateSubTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>(initialSubTab);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ForageCategory | 'todas'>('todas');
  const [selectedSoilDrainage, setSelectedSoilDrainage] = useState<string>('todos');
  const [selectedFertility, setSelectedFertility] = useState<string>('todos');
  const [selectedForageModal, setSelectedForageModal] = useState<ForageItem | null>(null);
  const [comparedForageIds, setComparedForageIds] = useState<string[]>([]);

  // Keep subTab synced with parent navigation if changed
  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleSubTabChange = (tabId: string) => {
    setActiveSubTab(tabId);
    if (onNavigateSubTab) {
      onNavigateSubTab(tabId);
    }
  };

  const handleToggleCompare = (forageId: string) => {
    setComparedForageIds(prev => {
      if (prev.includes(forageId)) {
        return prev.filter(id => id !== forageId);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), forageId];
      }
      return [...prev, forageId];
    });
  };

  const filteredForages = useMemo(() => {
    let list = searchForages(searchQuery);

    if (selectedCategory !== 'todas') {
      list = list.filter(f => f.category === selectedCategory);
    }

    if (selectedSoilDrainage !== 'todos') {
      list = list.filter(f => f.soilAndClimate.drainageRequirement === selectedSoilDrainage);
    }

    if (selectedFertility !== 'todos') {
      list = list.filter(f => f.soilAndClimate.fertilityRequirement === selectedFertility);
    }

    return list;
  }, [searchQuery, selectedCategory, selectedSoilDrainage, selectedFertility]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 pb-12 pt-2">
      {/* Main Sub-tabs Navigation */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
        <button
          type="button"
          onClick={() => handleSubTabChange('catalogo')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'catalogo'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Catálogo de Forrageiras ({FORAGES_CATALOG.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleSubTabChange('indicacao_solo')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'indicacao_solo'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Recomendador por Solo & Clima</span>
        </button>

        <button
          type="button"
          onClick={() => handleSubTabChange('doencas')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'doencas'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Bug className="w-4 h-4" />
          <span>Sanidade & Doenças</span>
        </button>

        <button
          type="button"
          onClick={() => handleSubTabChange('calculadora_semeadura')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'calculadora_semeadura'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Calculadora de Semeadura (VC%)</span>
        </button>

        <button
          type="button"
          onClick={() => handleSubTabChange('comparador')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 relative ${
            activeSubTab === 'comparador'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Comparador ({comparedForageIds.length})</span>
          {comparedForageIds.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-2 right-2" />
          )}
        </button>
      </div>

      {/* TAB 1: CATÁLOGO GERAL (30 FORRAGEIRAS) */}
      {activeSubTab === 'catalogo' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Search Bar */}
              <div className="md:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Buscar por nome (ex: Marandu, Mombaça, Tifton, Aveia, Estilosantes...)"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-emerald-500"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-emerald-500"
                >
                  <option value="todas">Todas as Categorias ({FORAGES_CATALOG.length})</option>
                  <option value="graminea_tropical">Gramíneas Tropicais</option>
                  <option value="graminea_temperada">Gramíneas de Inverno</option>
                  <option value="leguminosa_tropical">Leguminosas Forrageiras</option>
                  <option value="corte_silagem">Capins de Corte & Silagem</option>
                </select>
              </div>

              {/* Drainage / Soil Filter */}
              <div>
                <select
                  value={selectedSoilDrainage}
                  onChange={e => setSelectedSoilDrainage(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-emerald-500"
                >
                  <option value="todos">Todos os Solos / Drenagem</option>
                  <option value="bem_drenado">Solos Bem Drenados (Terra Firme)</option>
                  <option value="tolerante_encharcamento">Tolerante a Encharcamento</option>
                  <option value="tolerante_inundacao">Alagado / Várzea / Pantanal</option>
                </select>
              </div>
            </div>

            {/* Category Quick Chips */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pt-1">
              <button
                type="button"
                onClick={() => setSelectedCategory('todas')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'todas'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
                }`}
              >
                Todas ({FORAGES_CATALOG.length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('graminea_tropical')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'graminea_tropical'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
                }`}
              >
                Gramíneas Tropicais ({FORAGE_CATEGORIES_INFO.graminea_tropical.count})
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('corte_silagem')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'corte_silagem'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
                }`}
              >
                Corte & Silagem ({FORAGE_CATEGORIES_INFO.corte_silagem.count})
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('graminea_temperada')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'graminea_temperada'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
                }`}
              >
                Inverno / Temperadas ({FORAGE_CATEGORIES_INFO.graminea_temperada.count})
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('leguminosa_tropical')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'leguminosa_tropical'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
                }`}
              >
                Leguminosas Fixadoras ({FORAGE_CATEGORIES_INFO.leguminosa_tropical.count})
              </button>
            </div>
          </div>

          {/* Forage Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredForages.map(forage => (
              <ForagePhotoCard
                key={forage.id}
                forage={forage}
                onSelect={f => setSelectedForageModal(f)}
                onCompareToggle={handleToggleCompare}
                isCompared={comparedForageIds.includes(forage.id)}
              />
            ))}
          </div>

          {filteredForages.length === 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 text-center space-y-3">
              <Leaf className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="font-bold text-base text-slate-800 dark:text-zinc-200">
                Nenhuma forrageira encontrada
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Tente ajustar os termos de busca ou remover os filtros de categoria/solo.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('todas');
                  setSelectedSoilDrainage('todos');
                  setSelectedFertility('todos');
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RECOMENDADOR POR SOLO E CLIMA */}
      {activeSubTab === 'indicacao_solo' && (
        <ForageSoilMatcher onSelectForage={f => setSelectedForageModal(f)} />
      )}

      {/* TAB 3: SANIDADE E DOENÇAS */}
      {activeSubTab === 'doencas' && (
        <ForageDiseasesGuide onSelectForage={f => setSelectedForageModal(f)} />
      )}

      {/* TAB 4: CALCULADORA DE SEMEADURA */}
      {activeSubTab === 'calculadora_semeadura' && (
        <ForageSeedingCalculator />
      )}

      {/* TAB 5: COMPARADOR LADO A LADO */}
      {activeSubTab === 'comparador' && (
        <ForageComparator
          selectedIds={comparedForageIds}
          onRemove={id => handleToggleCompare(id)}
          onSelectForage={f => setSelectedForageModal(f)}
          onAddMore={() => setActiveSubTab('catalogo')}
        />
      )}

      {/* Detailed Modal */}
      <ForageDetailModal
        forage={selectedForageModal}
        onClose={() => setSelectedForageModal(null)}
        onSelectAnotherForage={f => setSelectedForageModal(f)}
      />
    </div>
  );
};
