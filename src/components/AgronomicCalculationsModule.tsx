import React, { useState, useMemo, useEffect } from 'react';
import {
  Calculator,
  Search,
  Layers,
  TrendingUp,
  FlaskConical,
  Activity,
  RefreshCw,
  Droplets,
  Gauge,
  Zap,
  Cpu,
  CloudRain,
  Sprout,
  CheckCircle2,
  Copy,
  RotateCcw,
  Play,
  X,
  BookOpen,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import { CalculationSubmenu, CalculatorItem } from '../types/agronomicCalculations';
import { SUBMENUS_CONFIG, CALCULATORS_CATALOG } from '../data/agronomicCalculatorsData';
import { CALCULATION_ENGINES } from '../utils/agronomicCalculationsEngine';

interface AgronomicCalculationsModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: CalculationSubmenu) => void;
}

const CATEGORY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  plantabilidade: Sprout,
  regulagens_adubo: Layers,
  produtividade: TrendingUp,
  analise_solo: FlaskConical,
  calagem: SlidersHorizontal,
  gessagem: Layers,
  correcao_nutricao: Activity,
  manutencao_adubacao: RefreshCw,
  foliar_ts: Droplets,
  pulverizacao: Gauge,
  pulverizacao_drone: Zap,
  mecanizacao: Cpu,
  hidrico_iaf: CloudRain,
};

const stripLeadingEmoji = (label: string): string =>
  label.replace(/^[\p{Emoji}\p{Extended_Pictographic}\uFE0F\s]+/gu, '').trim();

const RESULT_VALUE_COLORS: Record<string, string> = {
  emerald: 'text-emerald-700 dark:text-emerald-400',
  teal: 'text-teal-700 dark:text-teal-400',
  cyan: 'text-cyan-700 dark:text-cyan-400',
  blue: 'text-blue-700 dark:text-blue-400',
  amber: 'text-amber-700 dark:text-amber-400',
  violet: 'text-violet-700 dark:text-violet-400',
  rose: 'text-rose-700 dark:text-rose-400',
  slate: 'text-slate-900 dark:text-zinc-100',
};

export const AgronomicCalculationsModule: React.FC<AgronomicCalculationsModuleProps> = ({
  activeSubTab,
  setActiveSubTab,
}) => {
  const [internalSubmenu, setInternalSubmenu] = useState<CalculationSubmenu>('plantabilidade');
  const activeSubmenu = (activeSubTab as CalculationSubmenu) || internalSubmenu;

  const [selectedCalcId, setSelectedCalcId] = useState<string>('plant_pms');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'interactive'>('all');
  const [params, setParams] = useState<Record<string, string | number>>({});
  const [notification, setNotification] = useState<string | null>(null);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const calc of CALCULATORS_CATALOG) {
      counts[calc.category] = (counts[calc.category] || 0) + 1;
    }
    return counts;
  }, []);

  const interactiveCount = useMemo(
    () => CALCULATORS_CATALOG.filter(c => Boolean(CALCULATION_ENGINES[c.id])).length,
    []
  );

  const categoryLabels = useMemo(() => {
    const map: Record<string, string> = {};
    for (const sub of SUBMENUS_CONFIG) {
      map[sub.id] = stripLeadingEmoji(sub.label);
    }
    return map;
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const setActiveSubmenu = (tab: CalculationSubmenu) => {
    setInternalSubmenu(tab);
    setSearchQuery('');
    if (setActiveSubTab) {
      setActiveSubTab(tab);
    }
    const firstInCat =
      CALCULATORS_CATALOG.find(c => c.category === tab && Boolean(CALCULATION_ENGINES[c.id])) ||
      CALCULATORS_CATALOG.find(c => c.category === tab);
    if (firstInCat) {
      setSelectedCalcId(firstInCat.id);
      setParams({});
    }
  };

  // Sync selected calculator when Navbar changes activeSubTab externally
  useEffect(() => {
    if (searchQuery.trim()) return;
    const current = CALCULATORS_CATALOG.find(c => c.id === selectedCalcId);
    if (!current || current.category !== activeSubmenu) {
      const firstInCat =
        CALCULATORS_CATALOG.find(c => c.category === activeSubmenu && Boolean(CALCULATION_ENGINES[c.id])) ||
        CALCULATORS_CATALOG.find(c => c.category === activeSubmenu);
      if (firstInCat) {
        setSelectedCalcId(firstInCat.id);
        setParams({});
      }
    }
  }, [activeSubmenu, selectedCalcId, searchQuery]);

  // Filtered Calculators by active category or global search query
  const filteredCalculators = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return CALCULATORS_CATALOG.filter(c => {
      if (availabilityFilter === 'interactive' && !CALCULATION_ENGINES[c.id]) {
        return false;
      }
      if (q) {
        return (
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.formulaDescription.toLowerCase().includes(q) ||
          (categoryLabels[c.category] || '').toLowerCase().includes(q) ||
          c.tags.some(t => t.toLowerCase().includes(q))
        );
      }
      return c.category === activeSubmenu;
    });
  }, [activeSubmenu, searchQuery, availabilityFilter, categoryLabels]);

  const activeCalculator: CalculatorItem = useMemo(() => {
    return (
      CALCULATORS_CATALOG.find(c => c.id === selectedCalcId) ||
      filteredCalculators[0] ||
      CALCULATORS_CATALOG[0]
    );
  }, [selectedCalcId, filteredCalculators]);

  // Current calculation engine
  const engine = useMemo(() => {
    return CALCULATION_ENGINES[activeCalculator.id] || null;
  }, [activeCalculator]);

  // Dynamic execution of calculations
  const calculationOutput = useMemo(() => {
    if (!engine) return { results: [], hasData: false };
    return engine.calculate(params);
  }, [engine, params]);

  const hasAnyParamValue = useMemo(
    () => Object.values(params).some(val => val !== '' && val !== undefined && val !== null),
    [params]
  );

  const handleSelectCalculator = (calc: CalculatorItem) => {
    setSelectedCalcId(calc.id);
    setParams({});
  };

  const handleInputChange = (key: string, value: string | number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    setParams({});
    showNotification('Campos limpos para nova simulação.');
  };

  const handleLoadExample = () => {
    if (engine && engine.sampleData) {
      setParams(engine.sampleData);
      showNotification('Valores de referência técnica carregados.');
    }
  };

  const handleCopyResults = () => {
    if (!engine) {
      const refLines = [
        `--- AgroNutri Pro · Referência Técnica ---`,
        `Cálculo: ${activeCalculator.name}`,
        `Categoria: ${categoryLabels[activeCalculator.category] || activeCalculator.category}`,
        `Fórmula: ${activeCalculator.formulaDescription}`,
        `Descrição: ${activeCalculator.description}`,
      ];
      navigator.clipboard.writeText(refLines.join('\n'));
      showNotification('Referência da fórmula copiada para a área de transferência.');
      return;
    }

    if (!calculationOutput.hasData || calculationOutput.results.length === 0) {
      showNotification('Preencha os parâmetros acima para copiar o relatório calculado.');
      return;
    }

    const lines = [
      `--- AgroNutri Pro · Relatório Técnico ---`,
      `Cálculo: ${activeCalculator.name}`,
      `Fórmula: ${activeCalculator.formulaDescription}`,
      `Resultados:`,
      ...calculationOutput.results.map(r => `• ${r.label}: ${r.value} ${r.unit || ''}`.trim()),
      calculationOutput.interpretation ? `\nDiagnóstico: ${calculationOutput.interpretation}` : '',
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join('\n'));
    showNotification('Relatório e resultados copiados para a área de transferência.');
  };

  const activeCategoryLabel = categoryLabels[activeSubmenu] || activeSubmenu.replace(/_/g, ' ');
  const activeCalculatorCategoryLabel =
    categoryLabels[activeCalculator.category] || activeCalculator.category.replace(/_/g, ' ');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 pb-12">
      {/* Cabeçalho Compacto do Módulo */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-4 sm:px-6 pt-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
                Cálculos Agronômicos
              </h1>
              <span className="text-xs text-slate-400 dark:text-zinc-500" aria-hidden="true">
                ·
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                Regulagens, Fertilidade &amp; Engenharia de Campo
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
              <span>{CALCULATORS_CATALOG.length} fórmulas</span>
              <span aria-hidden="true">·</span>
              <span>{interactiveCount} interativas</span>
              <span aria-hidden="true">·</span>
              <span>{SUBMENUS_CONFIG.length} categorias</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-700 dark:text-zinc-300 font-medium">
                {searchQuery.trim()
                  ? `${filteredCalculators.length} na busca`
                  : `${activeCategoryLabel} (${categoryCounts[activeSubmenu] || 0})`}
              </span>
            </div>
          </div>

          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar cálculo (PMS, V%, Drone, Calagem)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-7 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Navegação Horizontal Limpa (Underline Tabs) */}
        <nav
          aria-label="Categorias de cálculos agronômicos"
          className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto border-t border-slate-100 dark:border-zinc-800/80 -mb-px"
        >
          {SUBMENUS_CONFIG.map(sub => {
            const Icon = CATEGORY_ICONS[sub.id] || Calculator;
            const isActive = !searchQuery.trim() && activeSubmenu === sub.id;
            const count = categoryCounts[sub.id] ?? sub.count;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setActiveSubmenu(sub.id)}
                className={`px-2.5 py-2.5 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-semibold'
                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{stripLeadingEmoji(sub.label)}</span>
                <span className="text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-4">
        {/* Feedback Inline Discreto */}
        {notification && (
          <div className="bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/60 rounded-xl px-3.5 py-2 text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">{notification}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              aria-label="Fechar aviso"
              className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Layout Mestre-Detalhe */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Coluna Esquerda: Catálogo de Fórmulas */}
          <aside className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                  {searchQuery.trim() ? 'Resultados da busca' : activeCategoryLabel}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                  {filteredCalculators.length}{' '}
                  {filteredCalculators.length === 1 ? 'fórmula' : 'fórmulas'}
                </p>
              </div>

              <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-zinc-800 rounded-lg shrink-0">
                <button
                  type="button"
                  onClick={() => setAvailabilityFilter('all')}
                  className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    availabilityFilter === 'all'
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={() => setAvailabilityFilter('interactive')}
                  className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    availabilityFilter === 'interactive'
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  Interativas
                </button>
              </div>
            </div>

            {filteredCalculators.length === 0 ? (
              <div className="p-6 text-center space-y-2.5">
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {searchQuery.trim()
                    ? `Nenhum cálculo encontrado para "${searchQuery}".`
                    : 'Nenhuma calculadora interativa nesta categoria.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setAvailabilityFilter('all');
                  }}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Redefinir filtros</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800 max-h-[680px] overflow-y-auto">
                {filteredCalculators.map(calc => {
                  const isSelected = calc.id === activeCalculator.id;
                  const hasEngine = Boolean(CALCULATION_ENGINES[calc.id]);
                  return (
                    <button
                      key={calc.id}
                      type="button"
                      onClick={() => handleSelectCalculator(calc)}
                      className={`w-full text-left px-3.5 py-2.5 transition-colors cursor-pointer block ${
                        isSelected
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30'
                          : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-xs font-semibold leading-snug ${
                            isSelected
                              ? 'text-emerald-800 dark:text-emerald-300'
                              : 'text-slate-900 dark:text-zinc-100'
                          }`}
                        >
                          {calc.name}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 mt-0.5 leading-relaxed">
                        {calc.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1.5 text-[11px] text-slate-400 dark:text-zinc-500">
                        <span
                          className={
                            hasEngine
                              ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                              : 'text-slate-500 dark:text-zinc-400'
                          }
                        >
                          {hasEngine ? 'Interativa' : 'Referência'}
                        </span>
                        {searchQuery.trim() && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{categoryLabels[calc.category] || calc.category}</span>
                          </>
                        )}
                        {calc.tags.slice(0, 2).map((tag, idx) => (
                          <React.Fragment key={idx}>
                            <span aria-hidden="true">·</span>
                            <span>{tag}</span>
                          </React.Fragment>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </aside>

          {/* Coluna Direita: Área de Cálculo e Resultados */}
          <section className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            {/* Cabeçalho do Cálculo Ativo */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-500 dark:text-zinc-400">
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">
                      {activeCalculatorCategoryLabel}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{engine ? 'Calculadora interativa' : 'Fórmula de referência'}</span>
                  </div>

                  <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 mt-0.5 leading-snug">
                    {activeCalculator.name}
                  </h2>

                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    {activeCalculator.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {engine && (
                    <button
                      type="button"
                      onClick={handleClear}
                      disabled={!hasAnyParamValue}
                      className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-45 disabled:cursor-not-allowed text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      title="Limpar parâmetros"
                    >
                      <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                      <span>Limpar</span>
                    </button>
                  )}

                  {engine?.sampleData && (
                    <button
                      type="button"
                      onClick={handleLoadExample}
                      className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      title="Preencher com exemplo agronômico de referência"
                    >
                      <Play className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Exemplo</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCopyResults}
                    className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 shrink-0" />
                    <span>{engine ? 'Copiar' : 'Copiar fórmula'}</span>
                  </button>
                </div>
              </div>

              {/* Expressão Matemática */}
              <div className="mt-3 px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-lg font-mono text-xs text-slate-700 dark:text-zinc-300 overflow-x-auto">
                <span className="text-slate-400 dark:text-zinc-500 select-none mr-1.5">
                  Fórmula:
                </span>
                {activeCalculator.formulaDescription}
              </div>
            </div>

            {/* Motor Interativo ou Referência */}
            {engine ? (
              <div>
                {/* Grade de Entradas */}
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    {engine.fields.map(field => {
                      const fieldId = `calc-field-${activeCalculator.id}-${field.key}`;

                      if (field.type === 'select' && field.options) {
                        return (
                          <div key={field.key} className="space-y-1">
                            <label
                              htmlFor={fieldId}
                              className="block text-xs font-medium text-slate-700 dark:text-zinc-300"
                            >
                              {field.label}
                            </label>
                            <select
                              id={fieldId}
                              value={params[field.key] ?? field.defaultValue ?? ''}
                              onChange={e => handleInputChange(field.key, e.target.value)}
                              className="w-full h-9 px-2.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                            >
                              {field.options.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      }

                      const isTextField = field.type === 'text';

                      return (
                        <div key={field.key} className="space-y-1">
                          <label
                            htmlFor={fieldId}
                            className="block text-xs font-medium text-slate-700 dark:text-zinc-300"
                          >
                            {field.label}
                            {field.unit && (
                              <span className="text-slate-400 dark:text-zinc-500 font-normal ml-1">
                                ({field.unit})
                              </span>
                            )}
                          </label>
                          <input
                            id={fieldId}
                            type={field.type || 'number'}
                            step={isTextField ? undefined : field.step || 'any'}
                            placeholder={field.placeholder || ''}
                            value={params[field.key] ?? ''}
                            onChange={e => {
                              const raw = e.target.value;
                              if (isTextField) {
                                handleInputChange(field.key, raw);
                              } else {
                                handleInputChange(field.key, raw === '' ? '' : Number(raw));
                              }
                            }}
                            className="w-full h-9 px-3 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Resultados do Dimensionamento */}
                {calculationOutput.hasData && calculationOutput.results.length > 0 ? (
                  <div className="border-t border-slate-200 dark:border-zinc-800">
                    <div className="px-5 py-2.5 bg-slate-50/80 dark:bg-zinc-950/60 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                      <h3 className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        Resultado do dimensionamento técnico
                      </h3>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Calculado</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200/70 dark:bg-zinc-800">
                      {calculationOutput.results.map((res, idx) => (
                        <div
                          key={idx}
                          className={`p-4 ${
                            res.highlight
                              ? 'bg-emerald-50/35 dark:bg-emerald-950/20'
                              : 'bg-white dark:bg-zinc-900'
                          }`}
                        >
                          <span className="block text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                            {res.label}
                          </span>
                          <div className="flex items-baseline gap-1.5 mt-1 tabular-nums">
                            <strong
                              className={`text-lg font-semibold tracking-tight ${
                                RESULT_VALUE_COLORS[res.color || 'slate'] ||
                                'text-slate-900 dark:text-zinc-100'
                              }`}
                            >
                              {res.value}
                            </strong>
                            {res.unit && (
                              <span className="text-xs text-slate-500 dark:text-zinc-400">
                                {res.unit}
                              </span>
                            )}
                          </div>
                          {res.description && (
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                              {res.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {calculationOutput.interpretation && (
                      <div className="px-5 py-3.5 border-t border-slate-100 dark:border-zinc-800 bg-emerald-50/40 dark:bg-emerald-950/15 flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                          <span className="font-semibold text-slate-900 dark:text-zinc-100 mr-1">
                            Diagnóstico técnico:
                          </span>
                          {calculationOutput.interpretation}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border-t border-slate-100 dark:border-zinc-800 px-5 py-8 text-center">
                    <Calculator className="w-5 h-5 text-slate-400 dark:text-zinc-500 mx-auto" />
                    <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 mt-2">
                      Aguardando preenchimento dos parâmetros
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto mt-1">
                      Informe as variáveis acima para calcular em tempo real ou carregue um cenário de referência agronômica.
                    </p>
                    {engine.sampleData && (
                      <button
                        type="button"
                        onClick={handleLoadExample}
                        className="mt-3.5 h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Carregar exemplo de referência</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-zinc-300">
                  <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Ficha de referência técnica para consulta rápida em campo. Utilize a expressão acima com os dados da sua lavoura ou equipamento.
                  </p>
                </div>

                {activeCalculator.tags.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-zinc-400">
                    <span className="font-medium text-slate-700 dark:text-zinc-300">
                      Aplicações:
                    </span>
                    {activeCalculator.tags.map((tag, idx) => (
                      <React.Fragment key={idx}>
                        {idx > 0 && <span aria-hidden="true">·</span>}
                        <span>{tag}</span>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default AgronomicCalculationsModule;
