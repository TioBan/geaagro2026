import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Search,
  Sparkles,
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
  AlertTriangle,
  Copy,
  Trash2,
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
  calagem: Sparkles,
  gessagem: Layers,
  correcao_nutricao: Activity,
  manutencao_adubacao: RefreshCw,
  foliar_ts: Droplets,
  pulverizacao: Gauge,
  pulverizacao_drone: Zap,
  mecanizacao: Cpu,
  hidrico_iaf: CloudRain,
};

export const AgronomicCalculationsModule: React.FC<AgronomicCalculationsModuleProps> = ({
  activeSubTab,
  setActiveSubTab,
}) => {
  const [internalSubmenu, setInternalSubmenu] = useState<CalculationSubmenu>('plantabilidade');
  const activeSubmenu = (activeSubTab as CalculationSubmenu) || internalSubmenu;

  const setActiveSubmenu = (tab: CalculationSubmenu) => {
    setInternalSubmenu(tab);
    if (setActiveSubTab) {
      setActiveSubTab(tab);
    }
    // Automatically select the first calculator in the chosen category
    const firstInCat = CALCULATORS_CATALOG.find(c => c.category === tab);
    if (firstInCat) {
      setSelectedCalcId(firstInCat.id);
      setParams({});
    }
  };

  const [selectedCalcId, setSelectedCalcId] = useState<string>('plant_pms');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [params, setParams] = useState<Record<string, any>>({});
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Filtered Calculators by active category or search query
  const filteredCalculators = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return CALCULATORS_CATALOG.filter(c => {
      if (q) {
        return (
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.formulaDescription.toLowerCase().includes(q) ||
          c.tags.some(t => t.toLowerCase().includes(q))
        );
      }
      return c.category === activeSubmenu;
    });
  }, [activeSubmenu, searchQuery]);

  const activeCalculator: CalculatorItem = useMemo(() => {
    return CALCULATORS_CATALOG.find(c => c.id === selectedCalcId) || filteredCalculators[0] || CALCULATORS_CATALOG[0];
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

  const handleSelectCalculator = (calc: CalculatorItem) => {
    setSelectedCalcId(calc.id);
    setParams({});
  };

  const handleInputChange = (key: string, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    setParams({});
    showNotification('Campos limpos. Pronto para nova inserção de parâmetros.');
  };

  const handleLoadExample = () => {
    if (engine && engine.sampleData) {
      setParams(engine.sampleData);
      showNotification('Valores de referência técnica carregados para simulação.');
    } else {
      showNotification('Exemplo de referência técnica pronto.');
    }
  };

  const handleCopyResults = () => {
    if (!calculationOutput.hasData || calculationOutput.results.length === 0) {
      showNotification('Preencha os campos para copiar o relatório calculado.');
      return;
    }
    const lines = [
      `--- AgroNutri Pro • Relatório Técnico ---`,
      `Cálculo: ${activeCalculator.name}`,
      `Fórmula: ${activeCalculator.formulaDescription}`,
      `Resultados:`,
      ...calculationOutput.results.map(r => `• ${r.label}: ${r.value} ${r.unit || ''}`),
      calculationOutput.interpretation ? `\nDiagnóstico: ${calculationOutput.interpretation}` : '',
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join('\n'));
    showNotification('Relatório e resultados copiados para a área de transferência!');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner: Cálculos Agronômicos Profissionais */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-emerald-700/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
                <Calculator className="w-3 h-3" />
                AgroMath Pro • 100% Offline
              </span>
              <span className="text-emerald-200/80 text-xs font-semibold">• 13 Submenus Técnicos</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-400" />
              Cálculos & Regulagens Agronômicas
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-3xl">
              Biblioteca de fórmulas agronômicas de precisão: Plantabilidade, Regulagens de Adubadeiras, Estimativas de Safra, Calagem, Gessagem, Nutrição, Pulverização Terrestre & Drones, Mecanização e Balanço Hídrico.
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-emerald-300 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar qualquer cálculo (ex: PMS, V%, Drone, Calagem)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-emerald-900/50 border border-emerald-500/40 rounded-xl text-xs font-semibold text-white placeholder:text-emerald-300/60 focus:outline-none focus:border-emerald-400"
            />
          </div>
        </div>

        {/* Quick Highlights of Total Calculators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 mt-5 pt-4 border-t border-emerald-800/60 text-xs">
          <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300/80 block">Total de Fórmulas</span>
            <strong className="text-base text-emerald-300 font-black">72 Cálculos</strong>
            <span className="text-[10px] text-emerald-200 block">100% Validados</span>
          </div>
          <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300/80 block">Submenu Ativo</span>
            <strong className="text-sm font-black text-white truncate block capitalize">{activeSubmenu.replace('_', ' ')}</strong>
            <span className="text-[10px] text-emerald-200 block">{filteredCalculators.length} ferramentas</span>
          </div>
          <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300/80 block">Plantabilidade</span>
            <strong className="text-base text-teal-300 font-black">12 Fórmulas</strong>
            <span className="text-[10px] text-emerald-200 block">PMS, VC%, Singulação</span>
          </div>
          <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300/80 block">Calagem & Gessagem</span>
            <strong className="text-base text-amber-300 font-black">12 Métodos</strong>
            <span className="text-[10px] text-emerald-200 block">V%, SMP, Al, Argila</span>
          </div>
          <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300/80 block">Pulverização & Drones</span>
            <strong className="text-base text-cyan-300 font-black">11 Cálculos</strong>
            <span className="text-[10px] text-emerald-200 block">Delta T, Pontas, Calda</span>
          </div>
          <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300/80 block">Mecanização & Tratores</span>
            <strong className="text-base text-rose-300 font-black">5 Modelos</strong>
            <span className="text-[10px] text-emerald-200 block">Patinagem, Horímetro</span>
          </div>
        </div>
      </div>

      {/* Submenus Horizontal Pill Bar */}
      {!searchQuery && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {SUBMENUS_CONFIG.map(sub => {
            const Icon = CATEGORY_ICONS[sub.id] || Calculator;
            const isSelected = activeSubmenu === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setActiveSubmenu(sub.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                <span>{sub.label.replace(/^[\p{Emoji}\s]+/gu, '')}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-emerald-700/80 text-white'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  {sub.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between shadow-md animate-fade-in">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-white hover:text-emerald-200">
            ✕
          </button>
        </div>
      )}

      {/* Main Content Area: Sidebar of Calculators + Active Interactive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List of Calculators in Active Category */}
        <div className="lg:col-span-4 space-y-2 max-h-[720px] overflow-y-auto pr-1">
          {filteredCalculators.length === 0 ? (
            <div className="p-6 bg-white dark:bg-zinc-900 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl text-center">
              <p className="text-xs text-slate-500">Nenhum cálculo encontrado para "{searchQuery}".</p>
            </div>
          ) : (
            filteredCalculators.map(c => {
              const isSelected = c.id === activeCalculator.id;
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectCalculator(c)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs ring-1 ring-emerald-400/30'
                      : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <strong className="text-xs font-bold text-slate-900 dark:text-white block leading-snug">
                    {c.name}
                  </strong>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {c.tags.map((t, idx) => (
                      <span key={idx} className="bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-[9px] font-semibold px-1.5 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Active Interactive Calculator Canvas */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
          {/* Header of Active Calculator */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-zinc-800 pb-4 gap-3">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                {activeCalculator.category.replace('_', ' ').toUpperCase()} • FÓRMULA OFICIAL
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {activeCalculator.name}
              </h3>
              <span className="text-xs text-slate-500 font-mono block mt-0.5">
                Fórmula: {activeCalculator.formulaDescription}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-zinc-900 dark:hover:bg-rose-950/40 text-slate-600 dark:text-zinc-300 text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-transparent hover:border-rose-200 dark:hover:border-rose-900"
                title="Limpar todos os campos"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar</span>
              </button>

              {engine?.sampleData && (
                <button
                  type="button"
                  onClick={handleLoadExample}
                  className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-zinc-900 dark:hover:bg-emerald-950/40 text-slate-600 dark:text-zinc-300 text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-transparent hover:border-emerald-200 dark:hover:border-emerald-900"
                  title="Carregar exemplo agronômico demonstrativo"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Exemplo</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopyResults}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Resultados</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC FORM ENGINE */}
          {engine ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {engine.fields.map(field => {
                  if (field.type === 'select' && field.options) {
                    return (
                      <div key={field.key} className="space-y-1">
                        <label className="font-bold text-slate-700 dark:text-zinc-300 block">
                          {field.label}:
                        </label>
                        <select
                          value={params[field.key] ?? field.defaultValue ?? ''}
                          onChange={e => handleInputChange(field.key, e.target.value)}
                          className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg font-bold text-slate-900 dark:text-white"
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

                  return (
                    <div key={field.key} className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-zinc-300 block">
                        {field.label} {field.unit ? `(${field.unit})` : ''}:
                      </label>
                      <input
                        type={field.type || 'number'}
                        step={field.step || 'any'}
                        placeholder={field.placeholder || ''}
                        value={params[field.key] ?? ''}
                        onChange={e => handleInputChange(field.key, e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Output Results Card */}
              {calculationOutput.hasData && calculationOutput.results.length > 0 ? (
                <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-2xl space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-900 pb-2">
                    <strong className="font-black text-sm text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Resultado do Dimensionamento Técnico:
                    </strong>
                    <span className="text-xs bg-emerald-600 text-white font-bold px-2 py-0.5 rounded">
                      Cálculo Concluído
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    {calculationOutput.results.map((res, idx) => (
                      <div
                        key={idx}
                        className={`p-3 bg-white dark:bg-black rounded-xl border ${
                          res.highlight
                            ? 'border-emerald-400 dark:border-emerald-700 shadow-2xs'
                            : 'border-slate-200 dark:border-zinc-800'
                        }`}
                      >
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 block font-bold">
                          {res.label}
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <strong
                            className={`text-lg sm:text-xl font-black ${
                              res.color === 'emerald'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : res.color === 'teal'
                                ? 'text-teal-600 dark:text-teal-400'
                                : res.color === 'cyan'
                                ? 'text-cyan-600 dark:text-cyan-400'
                                : res.color === 'blue'
                                ? 'text-blue-600 dark:text-blue-400'
                                : res.color === 'amber'
                                ? 'text-amber-600 dark:text-amber-400'
                                : res.color === 'violet'
                                ? 'text-violet-600 dark:text-violet-400'
                                : res.color === 'rose'
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {res.value}
                          </strong>
                          {res.unit && (
                            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                              {res.unit}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {calculationOutput.interpretation && (
                    <div className="p-3 bg-white/80 dark:bg-black/80 rounded-xl border border-emerald-100 dark:border-emerald-950 text-xs text-slate-700 dark:text-zinc-300 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        {calculationOutput.interpretation}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 bg-slate-50 dark:bg-zinc-900/60 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <strong className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">
                    Aguardando Preenchimento dos Parâmetros
                  </strong>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                    Insira as variáveis acima ou clique no botão <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Exemplo</strong> para simulação instantânea com parâmetros agronômicos de referência.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Catalog General Formula Reference */
            <div className="p-6 bg-slate-50 dark:bg-zinc-900 rounded-2xl border text-center space-y-3">
              <Calculator className="w-10 h-10 text-emerald-600 mx-auto" />
              <div>
                <strong className="text-base font-bold text-slate-900 dark:text-white block">
                  {activeCalculator.name}
                </strong>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  {activeCalculator.description}
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-black border rounded-xl max-w-lg mx-auto text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                {activeCalculator.formulaDescription}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AgronomicCalculationsModule;
