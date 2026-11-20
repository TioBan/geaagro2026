import React, { useState, useMemo } from 'react';
import {
  FlaskConical,
  Layers,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Droplets,
  Zap,
  FileText,
  Thermometer,
  Sliders,
  X,
  Printer,
  Boxes,
  BookOpen,
  LayoutGrid,
  RotateCcw,
} from 'lucide-react';
import {
  FertilizerItem,
  CompatibilityPairRule,
} from '../types/fertigation';
import {
  FERTILIZERS_DATABASE,
  COMPATIBILITY_RULES_MATRIX,
  WATER_QUALITY_PRESETS,
  STANDARD_FERTIGATION_RECIPES,
  getChemicalCompatibilityPair,
} from '../data/fertigationData';
import { FertigationDashboardView } from './fertigation/FertigationDashboardView';
import { VirtualLabSimulatorView } from './fertigation/VirtualLabSimulatorView';
import { TechnicalLibraryView } from './fertigation/TechnicalLibraryView';

interface TankFertilizerEntry {
  fertilizerId: string;
  doseKg: number;
}

export type FertigationSubTab =
  | 'dashboard'
  | 'simulador_tanque'
  | 'matriz_compatibilidade'
  | 'tanques_ab'
  | 'banco_fertilizantes'
  | 'biblioteca_tecnica'
  | 'qualidade_agua'
  | 'solubilidade'
  | 'receitas_laudos';

interface FertigationModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: FertigationSubTab) => void;
}

const SUB_TABS: { id: FertigationSubTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Painel', icon: LayoutGrid },
  { id: 'simulador_tanque', label: 'Laboratório', icon: FlaskConical },
  { id: 'matriz_compatibilidade', label: 'Matriz', icon: Zap },
  { id: 'tanques_ab', label: 'Tanques A & B', icon: Layers },
  { id: 'banco_fertilizantes', label: 'Fertilizantes', icon: Boxes },
  { id: 'biblioteca_tecnica', label: 'Biblioteca', icon: BookOpen },
  { id: 'qualidade_agua', label: 'Água & Ácidos', icon: Droplets },
  { id: 'solubilidade', label: 'Solubilidade', icon: Thermometer },
  { id: 'receitas_laudos', label: 'Receitas & Laudos', icon: FileText },
];

export const FertigationModule: React.FC<FertigationModuleProps> = ({
  activeSubTab: externalSubTab,
  setActiveSubTab: setExternalSubTab,
}) => {
  const [internalSubTab, setInternalSubTab] = useState<FertigationSubTab>('dashboard');
  const activeSubTab = (externalSubTab as FertigationSubTab) || internalSubTab;
  const setActiveSubTab = (tab: FertigationSubTab) => {
    setInternalSubTab(tab);
    if (setExternalSubTab) {
      setExternalSubTab(tab);
    }
  };

  // Virtual Tank Simulator State
  const [tankVolumeLiters, setTankVolumeLiters] = useState<number>(1000);
  const [tankTemperatureC, setTankTemperatureC] = useState<number>(22);
  const [selectedWaterId, setSelectedWaterId] = useState<string>(WATER_QUALITY_PRESETS[0]?.id || '');

  // Added fertilizers in current simulation
  const [tankFertilizers, setTankFertilizers] = useState<TankFertilizerEntry[]>([]);

  // Search and Detail Modal in Fertilizer Database
  const [searchFertQuery, setSearchFertQuery] = useState<string>('');
  const [selectedFertGroup, setSelectedFertGroup] = useState<string>('todos');
  const [detailFertilizer, setDetailFertilizer] = useState<FertilizerItem | null>(null);

  // Selected compatibility rule for modal
  const [selectedCompatRule, setSelectedCompatRule] = useState<CompatibilityPairRule | null>(null);

  // Compatibility Matrix Navigation & Interactive Simulator State
  const [compatViewMode, setCompatViewMode] = useState<'matriz_2d' | 'simulador_par' | 'fichas_regras'>('matriz_2d');
  const [compatSimFertA, setCompatSimFertA] = useState<string>('nitrato_calcio');
  const [compatSimFertB, setCompatSimFertB] = useState<string>('sulfato_magnesio');
  const [compatFilterStatus, setCompatFilterStatus] = useState<string>('todos');
  const [compatSearchQuery, setCompatSearchQuery] = useState<string>('');
  const [matrixFilterGroup, setMatrixFilterGroup] = useState<string>('todos');

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const selectedWater = useMemo(() => {
    return WATER_QUALITY_PRESETS.find(w => w.id === selectedWaterId) || WATER_QUALITY_PRESETS[0];
  }, [selectedWaterId]);

  // Calculate Tank Diagnostics, Incompatibilities, PPMs, EC, pH
  const tankCalculation = useMemo(() => {
    const items = tankFertilizers
      .map(tf => {
        const fert = FERTILIZERS_DATABASE.find(f => f?.id === tf.fertilizerId);
        if (!fert) return null;
        return {
          ...tf,
          fertilizer: fert,
          concentrationGL: (tf.doseKg * 1000) / tankVolumeLiters,
        };
      })
      .filter((it): it is NonNullable<typeof it> => it !== null);

    const totalKg = items.reduce((acc, it) => acc + it.doseKg, 0);
    const totalGL = (totalKg * 1000) / tankVolumeLiters;

    const detectedIncompatibilities: CompatibilityPairRule[] = [];
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        if (!items[i]?.fertilizer || !items[j]?.fertilizer) continue;
        const rule = getChemicalCompatibilityPair(items[i].fertilizer, items[j].fertilizer);
        if (rule && rule.status !== 'compativel') {
          detectedIncompatibilities.push(rule);
        }
      }
    }

    const ppmTotals: Record<string, number> = {
      N: 0,
      P: 0,
      K: 0,
      Ca: 0,
      Mg: 0,
      S: 0,
      Fe: 0,
      B: 0,
      Zn: 0,
      Mn: 0,
      Cu: 0,
      Mo: 0,
    };

    items.forEach(it => {
      const gL = it.concentrationGL;
      const g = it.fertilizer.guaranteedNutrients;

      if (g.N) ppmTotals.N += gL * (g.N / 100) * 1000;
      if (g.P2O5) ppmTotals.P += gL * (g.P2O5 / 100) * 0.4364 * 1000;
      if (g.K2O) ppmTotals.K += gL * (g.K2O / 100) * 0.8302 * 1000;
      if (g.Ca) ppmTotals.Ca += gL * (g.Ca / 100) * 1000;
      if (g.Mg) ppmTotals.Mg += gL * (g.Mg / 100) * 1000;
      if (g.S) ppmTotals.S += gL * (g.S / 100) * 1000;
      if (g.Fe) ppmTotals.Fe += gL * (g.Fe / 100) * 1000;
      if (g.B) ppmTotals.B += gL * (g.B / 100) * 1000;
      if (g.Zn) ppmTotals.Zn += gL * (g.Zn / 100) * 1000;
      if (g.Mn) ppmTotals.Mn += gL * (g.Mn / 100) * 1000;
      if (g.Cu) ppmTotals.Cu += gL * (g.Cu / 100) * 1000;
      if (g.Mo) ppmTotals.Mo += gL * (g.Mo / 100) * 1000;
    });

    let estimatedCe = selectedWater.ceMicroSiemens / 1000;
    items.forEach(it => {
      estimatedCe += it.concentrationGL * it.fertilizer.estimatedCeMsPerCmAt1gL;
    });

    let estimatedPh = selectedWater?.ph || 6.5;
    const hasAcid = items.some(it => it.fertilizer?.group === 'acidos');
    const hasMapOrMkp = items.some(
      it => it.fertilizer?.id === 'map_purificado' || it.fertilizer?.id === 'mkp'
    );
    if (hasAcid) {
      estimatedPh = 4.2;
    } else if (hasMapOrMkp) {
      estimatedPh = Math.min(estimatedPh, 5.6);
    }

    const hasIncompatibility = detectedIncompatibilities.length > 0;
    const safetyStatus: 'segura' | 'atencao' | 'nao_recomendada' = hasIncompatibility
      ? 'nao_recomendada'
      : totalGL > 250
      ? 'atencao'
      : 'segura';

    return {
      items,
      totalKg,
      totalGL,
      detectedIncompatibilities,
      ppmTotals,
      estimatedCe: Math.round(estimatedCe * 100) / 100,
      estimatedPh: Math.round(estimatedPh * 10) / 10,
      hasIncompatibility,
      safetyStatus,
    };
  }, [tankFertilizers, tankVolumeLiters, selectedWater]);

  const handleAutoSeparateTanks = () => {
    setActiveSubTab('tanques_ab');
    showNotification(
      'Fertilizantes organizados entre Tanque A (Cálcio/Quelatos) e Tanque B (Fosfatos/Sulfatos).'
    );
  };

  const handleResetStandardTank = () => {
    setTankFertilizers([
      { fertilizerId: 'nitrato_calcio', doseKg: 40.0 },
      { fertilizerId: 'nitrato_potassio', doseKg: 30.0 },
      { fertilizerId: 'fe_edta', doseKg: 1.0 },
    ]);
    showNotification('Tanque carregado com solução segura padrão.');
  };

  const filteredFertilizers = useMemo(() => {
    const q = searchFertQuery.toLowerCase();
    return FERTILIZERS_DATABASE.filter(f => {
      const matchesSearch =
        f.name.toLowerCase().includes(q) ||
        f.commercialName.toLowerCase().includes(q) ||
        f.formula.toLowerCase().includes(q);
      const matchesGroup = selectedFertGroup === 'todos' || f.group === selectedFertGroup;
      return matchesSearch && matchesGroup;
    });
  }, [searchFertQuery, selectedFertGroup]);

  const matrixVisibleFerts = useMemo(() => {
    const q = compatSearchQuery.toLowerCase();
    return FERTILIZERS_DATABASE.filter(
      f =>
        (matrixFilterGroup === 'todos' || f.group === matrixFilterGroup) &&
        (q === '' || f.name.toLowerCase().includes(q))
    );
  }, [matrixFilterGroup, compatSearchQuery]);

  const tankAItems = useMemo(
    () => tankCalculation.items.filter(it => it.fertilizer.defaultTank === 'Tanque A'),
    [tankCalculation.items]
  );

  const tankBItems = useMemo(
    () => tankCalculation.items.filter(it => it.fertilizer.defaultTank !== 'Tanque A'),
    [tankCalculation.items]
  );

  const renderRuleStatusBadge = (status: CompatibilityPairRule['status']) => {
    if (status === 'incompativel') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-400">
          <XCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Incompatível</span>
        </span>
      );
    }
    if (status === 'compativel_com_restricao') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Com restrição</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span>Compatível</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 pb-12">
      {/* Cabeçalho Compacto do Módulo */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-4 sm:px-6 pt-4 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
                Compatibilidade de Fertilizantes
              </h1>
              <span className="text-xs text-slate-400 dark:text-zinc-500">·</span>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                Fertirrigação, Solubilidade &amp; Tanques A/B
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
              <span>{tankCalculation.items.length} no tanque ({tankCalculation.totalKg.toFixed(1)} kg)</span>
              <span aria-hidden="true">·</span>
              <span>CE {tankCalculation.estimatedCe.toFixed(2)} mS/cm</span>
              <span aria-hidden="true">·</span>
              <span>pH {tankCalculation.estimatedPh.toFixed(1)}</span>
              <span aria-hidden="true">·</span>
              <span
                className={`font-medium ${
                  tankCalculation.hasIncompatibility
                    ? 'text-rose-700 dark:text-rose-400'
                    : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {tankCalculation.hasIncompatibility ? 'Incompatível' : 'Mistura segura'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResetStandardTank}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>Solução Padrão</span>
            </button>

            <button
              type="button"
              onClick={handleAutoSeparateTanks}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>Tanques A &amp; B</span>
            </button>
          </div>
        </div>

        {/* Navegação Horizontal Limpa (Underline Tabs) */}
        <nav
          aria-label="Seções de compatibilidade de fertilizantes"
          className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto border-t border-slate-100 dark:border-zinc-800/80 -mb-px"
        >
          {SUB_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-2.5 py-2.5 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-semibold'
                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
                {tab.id === 'simulador_tanque' && tankFertilizers.length > 0 && (
                  <span className="text-[11px] font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                    ({tankFertilizers.length})
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        {notification && (
          <div className="bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800/70 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-300 print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{notification}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              aria-label="Fechar aviso"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 0. DASHBOARD */}
        {activeSubTab === 'dashboard' && (
          <FertigationDashboardView
            tankVolumeLiters={tankVolumeLiters}
            tankTemperatureC={tankTemperatureC}
            tankTotalKg={tankCalculation.totalKg}
            tankTotalGL={tankCalculation.totalGL}
            estimatedCe={tankCalculation.estimatedCe}
            estimatedPh={tankCalculation.estimatedPh}
            safetyStatus={tankCalculation.safetyStatus}
            hasIncompatibility={tankCalculation.hasIncompatibility}
            detectedIncompatibilities={tankCalculation.detectedIncompatibilities}
            tankFertilizersCount={tankFertilizers.length}
            onNavigateTab={setActiveSubTab}
            onAutoSeparate={handleAutoSeparateTanks}
            savedRecipesCount={STANDARD_FERTIGATION_RECIPES.length}
          />
        )}

        {/* 1. LABORATÓRIO VIRTUAL */}
        {activeSubTab === 'simulador_tanque' && (
          <VirtualLabSimulatorView
            tankVolumeLiters={tankVolumeLiters}
            setTankVolumeLiters={setTankVolumeLiters}
            tankTemperatureC={tankTemperatureC}
            setTankTemperatureC={setTankTemperatureC}
            selectedWaterId={selectedWaterId}
            setSelectedWaterId={setSelectedWaterId}
            tankFertilizers={tankFertilizers}
            setTankFertilizers={setTankFertilizers}
            tankCalculation={tankCalculation}
            onAutoSeparateTanks={handleAutoSeparateTanks}
            showNotification={showNotification}
            onOpenRuleDetail={rule => setSelectedCompatRule(rule)}
          />
        )}

        {/* 1.5 BIBLIOTECA TÉCNICA */}
        {activeSubTab === 'biblioteca_tecnica' && (
          <TechnicalLibraryView
            onSelectFertilizerForDetail={fert => setDetailFertilizer(fert)}
            onSendToTank={fertId => {
              if (!tankFertilizers.some(f => f.fertilizerId === fertId)) {
                setTankFertilizers(prev => [...prev, { fertilizerId: fertId, doseKg: 10.0 }]);
              }
              setActiveSubTab('simulador_tanque');
              showNotification('Insumo enviado para o Laboratório Virtual.');
            }}
          />
        )}

        {/* 2. MATRIZ DE COMPATIBILIDADE QUÍMICA */}
        {activeSubTab === 'matriz_compatibilidade' && (
          <div className="space-y-5">
            {/* Cabeçalho e Controle Segmentado */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                  Matriz Cruzada de Compatibilidade Química
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                  {FERTILIZERS_DATABASE.length} fontes avaliadas · Reações estequiométricas, faixas de pH e risco de entupimento
                </p>
              </div>

              <div className="inline-flex items-center gap-0.5 p-0.5 bg-slate-200/70 dark:bg-zinc-800 rounded-lg self-start md:self-auto">
                {[
                  { id: 'matriz_2d' as const, label: 'Matriz 2D', icon: Layers },
                  { id: 'simulador_par' as const, label: 'Simulador de Par', icon: FlaskConical },
                  { id: 'fichas_regras' as const, label: 'Catálogo de Regras', icon: FileText },
                ].map(mode => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setCompatViewMode(mode.id)}
                      className={`h-7 px-2.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                        compatViewMode === mode.id
                          ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* VIEW 1: MATRIZ 2D */}
            {compatViewMode === 'matriz_2d' && (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-3.5 border-b border-slate-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Filtrar fertilizantes..."
                        value={compatSearchQuery}
                        onChange={e => setCompatSearchQuery(e.target.value)}
                        className="h-8 pl-8 pr-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs w-56 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <select
                      value={matrixFilterGroup}
                      onChange={e => setMatrixFilterGroup(e.target.value)}
                      aria-label="Filtrar grupo químico na matriz"
                      className="h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="todos">Todos os grupos</option>
                      <option value="calcio">Fontes de cálcio</option>
                      <option value="fosfatados">Fosfatados</option>
                      <option value="potassicos">Potássicos</option>
                      <option value="nitrogenados">Nitrogenados</option>
                      <option value="enxofre">Sulfatos / Enxofre</option>
                      <option value="micronutrientes_quelatos">Quelatos</option>
                      <option value="micronutrientes_sais">Micronutrientes sais</option>
                      <option value="acidos">Ácidos fortes</option>
                    </select>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-zinc-400">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500/20 border border-emerald-500/60" />
                      Compatível
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-amber-500/20 border border-amber-500/60" />
                      Restrição
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-rose-500/20 border border-rose-500/60" />
                      Incompatível
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 dark:bg-zinc-950 sticky top-0 z-20">
                      <tr className="border-b border-slate-200 dark:border-zinc-800">
                        <th className="px-3 py-2 font-semibold text-slate-700 dark:text-zinc-300 border-r border-slate-200 dark:border-zinc-800 min-w-[190px] sticky left-0 bg-slate-50 dark:bg-zinc-950 z-30">
                          Fertilizante
                        </th>
                        {matrixVisibleFerts.map(colFert => (
                          <th
                            key={colFert.id}
                            className="px-2 py-2 font-medium text-slate-700 dark:text-zinc-300 border-r border-slate-100 dark:border-zinc-800 min-w-[100px] text-center text-[11px]"
                            title={colFert.name}
                          >
                            <div className="truncate max-w-[94px] mx-auto">{colFert.name}</div>
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono font-normal block truncate">
                              {colFert.formula}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {matrixVisibleFerts.map(rowFert => (
                        <tr key={rowFert.id}>
                          <td className="px-3 py-2 border-r border-slate-200 dark:border-zinc-800 sticky left-0 bg-white dark:bg-zinc-900 z-10 text-[11px]">
                            <div className="font-medium text-slate-900 dark:text-zinc-100 truncate max-w-[175px]">
                              {rowFert.name}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                              {rowFert.formula} · {rowFert.defaultTank}
                            </div>
                          </td>

                          {matrixVisibleFerts.map(colFert => {
                            const pairRule = getChemicalCompatibilityPair(rowFert, colFert);
                            const isSelf = rowFert.id === colFert.id;

                            let cellClass =
                              'bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/25 dark:hover:bg-emerald-950/50 dark:text-emerald-400';
                            let label = 'OK';

                            if (isSelf) {
                              cellClass = 'bg-slate-50 dark:bg-zinc-950/50 text-slate-300 dark:text-zinc-700';
                              label = '—';
                            } else if (pairRule.status === 'incompativel') {
                              cellClass =
                                'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 dark:text-rose-400 font-semibold';
                              label = 'Incomp.';
                            } else if (pairRule.status === 'compativel_com_restricao') {
                              cellClass =
                                'bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:hover:bg-amber-950/70 dark:text-amber-400 font-medium';
                              label = 'Restr.';
                            }

                            return (
                              <td
                                key={colFert.id}
                                onClick={() => !isSelf && setSelectedCompatRule(pairRule)}
                                className={`px-2 py-2 text-center border-r border-slate-100 dark:border-zinc-800/70 text-[11px] transition-colors ${
                                  isSelf ? 'cursor-default' : 'cursor-pointer'
                                } ${cellClass}`}
                                title={
                                  isSelf
                                    ? ''
                                    : `${rowFert.name} + ${colFert.name}: clique para ver parecer técnico`
                                }
                              >
                                {label}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIEW 2: SIMULADOR DE PAR QUÍMICO */}
            {compatViewMode === 'simulador_par' && (() => {
              const fertAObj = FERTILIZERS_DATABASE.find(f => f.id === compatSimFertA) || FERTILIZERS_DATABASE[0];
              const fertBObj = FERTILIZERS_DATABASE.find(f => f.id === compatSimFertB) || FERTILIZERS_DATABASE[1];
              const simRule = getChemicalCompatibilityPair(fertAObj, fertBObj);
              const isError = simRule.status === 'incompativel';
              const isWarning = simRule.status === 'compativel_com_restricao';

              return (
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-slate-100 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="sim-fert-a"
                        className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block mb-1"
                      >
                        Fertilizante A
                      </label>
                      <select
                        id="sim-fert-a"
                        value={compatSimFertA}
                        onChange={e => setCompatSimFertA(e.target.value)}
                        className="w-full h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                      >
                        {FERTILIZERS_DATABASE.map(f => (
                          <option key={f.id} value={f.id}>
                            {f.name} ({f.formula})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="sim-fert-b"
                        className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block mb-1"
                      >
                        Fertilizante B
                      </label>
                      <select
                        id="sim-fert-b"
                        value={compatSimFertB}
                        onChange={e => setCompatSimFertB(e.target.value)}
                        className="w-full h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                      >
                        {FERTILIZERS_DATABASE.map(f => (
                          <option key={f.id} value={f.id}>
                            {f.name} ({f.formula})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Resumo do Diagnóstico */}
                  <div className="px-4 py-3.5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        {renderRuleStatusBadge(simRule.status)}
                        <span className="text-slate-300 dark:text-zinc-700 text-xs">·</span>
                        <span className="text-xs text-slate-500 dark:text-zinc-400">
                          Reação: {simRule.reactionType}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-1">
                        {fertAObj.name} + {fertBObj.name}
                      </h3>
                    </div>

                    <div className="sm:text-right">
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                        Risco em gotejadores
                      </span>
                      <span
                        className={`text-xs font-semibold tabular-nums capitalize ${
                          isError
                            ? 'text-rose-700 dark:text-rose-400'
                            : isWarning
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {simRule.cloggingRisk} ({simRule.dripperImpactPercent}% impacto)
                      </span>
                    </div>
                  </div>

                  {/* 4 Parâmetros em Faixa Hairline */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-zinc-800 border-b border-slate-100 dark:border-zinc-800 text-xs">
                    <div className="p-4 space-y-1.5">
                      <div className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Mecanismo químico</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                        {simRule.technicalReason}
                      </p>
                      {simRule.chemicalEquation && (
                        <div className="font-mono text-[11px] text-slate-800 dark:text-zinc-200 pt-1">
                          {simRule.chemicalEquation}
                        </div>
                      )}
                    </div>

                    <div className="p-4 space-y-1.5">
                      <div className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Limites operacionais</span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-zinc-400">
                        pH seguro:{' '}
                        <strong className="text-emerald-700 dark:text-emerald-400 tabular-nums">
                          {simRule.phRangeSafe}
                        </strong>
                      </div>
                      {simRule.phCriticalRisk && (
                        <div className="text-[11px] text-rose-600 dark:text-rose-400">
                          {simRule.phCriticalRisk}
                        </div>
                      )}
                      <div className="text-[11px] text-slate-600 dark:text-zinc-400 tabular-nums">
                        Máx. combinado:{' '}
                        <strong className="text-slate-900 dark:text-zinc-100">
                          {simRule.maxCombinedConcentrationGramsPerLiter
                            ? `${simRule.maxCombinedConcentrationGramsPerLiter} g/L`
                            : 'Sem restrição'}
                        </strong>
                      </div>
                    </div>

                    <div className="p-4 space-y-1.5">
                      <div className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <Thermometer className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>Termodinâmica e CE</span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-zinc-400">
                        Sensibilidade:{' '}
                        <strong className="text-slate-900 dark:text-zinc-100 capitalize">
                          {simRule.temperatureSensitivity}
                        </strong>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                        {simRule.temperatureEffect}
                      </p>
                      <div className="text-[11px] text-slate-600 dark:text-zinc-400">
                        CE: <strong className="text-slate-900 dark:text-zinc-100">{simRule.ecIncreaseEstimate}</strong>
                      </div>
                    </div>

                    <div className="p-4 space-y-1.5">
                      <div className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <span>Emissores e filtros</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            isError ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${simRule.dripperImpactPercent}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                        {simRule.cloggingMechanism}
                      </p>
                      {simRule.precipitateFormed && (
                        <div className="text-[11px] font-medium text-rose-700 dark:text-rose-400">
                          Precipitado: {simRule.precipitateFormed}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Protocolos */}
                  <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-zinc-800 border-b border-slate-100 dark:border-zinc-800 text-xs">
                    <div className="p-4 space-y-1">
                      <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
                        Ordem de adição
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                        {simRule.mixingOrderRule}
                      </p>
                    </div>
                    <div className="p-4 space-y-1">
                      <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
                        Teste de jarra (Jar-Test)
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                        {simRule.jarTestProtocol}
                      </p>
                    </div>
                    <div className="p-4 space-y-1">
                      <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
                        Remediação
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                        {simRule.remediationProtocol}
                      </p>
                    </div>
                  </div>

                  {/* Rodapé Recomendação */}
                  <div className="px-4 py-3 bg-slate-50/70 dark:bg-zinc-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="text-slate-700 dark:text-zinc-300">
                      <strong className="text-emerald-700 dark:text-emerald-400">Diretriz agronômica: </strong>
                      {simRule.agronomicRecommendation}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCompatRule(simRule)}
                      className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
                    >
                      Parecer Completo
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* VIEW 3: CATÁLOGO DE REGRAS */}
            {compatViewMode === 'fichas_regras' && (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-3.5 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Pesquisar fertilizante, precipitado ou íon..."
                      value={compatSearchQuery}
                      onChange={e => setCompatSearchQuery(e.target.value)}
                      className="w-full h-8 pl-8 pr-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="inline-flex items-center gap-0.5 p-0.5 bg-slate-100 dark:bg-zinc-800 rounded-lg">
                    {[
                      { id: 'todos', label: 'Todos' },
                      { id: 'incompativel', label: 'Incompatíveis' },
                      { id: 'compativel_com_restricao', label: 'Restrição' },
                      { id: 'compativel', label: 'Compatíveis' },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setCompatFilterStatus(opt.id)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                          compatFilterStatus === opt.id
                            ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs'
                            : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {COMPATIBILITY_RULES_MATRIX.filter(r => {
                    if (compatFilterStatus !== 'todos' && r.status !== compatFilterStatus) return false;
                    if (compatSearchQuery) {
                      const q = compatSearchQuery.toLowerCase();
                      const fertA = FERTILIZERS_DATABASE.find(f => f.id === r.fertIdA);
                      const fertB = FERTILIZERS_DATABASE.find(f => f.id === r.fertIdB);
                      const nameMatch =
                        fertA?.name.toLowerCase().includes(q) || fertB?.name.toLowerCase().includes(q);
                      const textMatch =
                        r.technicalReason.toLowerCase().includes(q) ||
                        (r.precipitateFormed && r.precipitateFormed.toLowerCase().includes(q));
                      const ionMatch = r.ionsInvolved?.some(ion => ion.toLowerCase().includes(q));
                      return Boolean(nameMatch || textMatch || ionMatch);
                    }
                    return true;
                  }).map((rule, idx) => {
                    const fertA = FERTILIZERS_DATABASE.find(f => f.id === rule.fertIdA);
                    const fertB = FERTILIZERS_DATABASE.find(f => f.id === rule.fertIdB);

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedCompatRule(rule)}
                        className="w-full p-4 text-left hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                              {fertA?.name || rule.fertIdA} + {fertB?.name || rule.fertIdB}
                            </span>
                            <span className="text-slate-300 dark:text-zinc-700 text-xs">·</span>
                            {renderRuleStatusBadge(rule.status)}
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-1">
                            {rule.technicalReason}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                            <span>pH seguro: {rule.phRangeSafe}</span>
                            {rule.precipitateFormed && (
                              <span className="text-rose-700 dark:text-rose-400 font-medium">
                                Precipitado: {rule.precipitateFormed}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 whitespace-nowrap shrink-0">
                          Ver ficha
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. SEPARAÇÃO TANQUES A & B */}
        {activeSubTab === 'tanques_ab' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                Separação de Tanques Concentrados (A e B)
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Segregação química para impedir a precipitação de gipsita (CaSO₄) e fosfatos de cálcio na fertirrigação
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-zinc-800 overflow-hidden">
              {/* Tanque A */}
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      Tanque A · Cálcio e Quelatos de Ferro
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      Livre de sulfatos e fosfatos
                    </p>
                  </div>
                  <span className="text-xs font-semibold tabular-nums text-sky-700 dark:text-sky-400">
                    {tankAItems.length} no simulador
                  </span>
                </div>

                {tankAItems.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 block">
                      Itens separados da sua calda atual:
                    </span>
                    <div className="border border-slate-200 dark:border-zinc-800 rounded-lg divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                      {tankAItems.map(it => (
                        <div key={it.fertilizerId} className="px-3 py-2 flex items-center justify-between">
                          <span className="font-medium text-slate-900 dark:text-zinc-100">
                            {it.fertilizer.name}
                          </span>
                          <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                            {it.doseKg} kg
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-zinc-400">
                  <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
                    Fontes permitidas no Tanque A:
                  </span>
                  <ul className="space-y-1">
                    <li>· <strong className="text-slate-800 dark:text-zinc-200">Nitrato de Cálcio</strong> (5Ca(NO₃)₂·NH₄NO₃)</li>
                    <li>· <strong className="text-slate-800 dark:text-zinc-200">Nitrato de Potássio</strong> (KNO₃)</li>
                    <li>· <strong className="text-slate-800 dark:text-zinc-200">Quelatos de Ferro</strong> (Fe-EDTA / Fe-DTPA / Fe-EDDHA)</li>
                    <li>· <strong className="text-slate-800 dark:text-zinc-200">Nitrato de Magnésio</strong> (sem uso de sulfatos)</li>
                    <li>· <strong className="text-slate-800 dark:text-zinc-200">Ácido Nítrico</strong> (ajuste de pH)</li>
                  </ul>
                </div>
              </div>

              {/* Tanque B */}
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      Tanque B · Fosfatos, Sulfatos e Micronutrientes
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      Livre de cálcio
                    </p>
                  </div>
                  <span className="text-xs font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                    {tankBItems.length} no simulador
                  </span>
                </div>

                {tankBItems.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 block">
                      Itens separados da sua calda atual:
                    </span>
                    <div className="border border-slate-200 dark:border-zinc-800 rounded-lg divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                      {tankBItems.map(it => (
                        <div key={it.fertilizerId} className="px-3 py-2 flex items-center justify-between">
                          <span className="font-medium text-slate-900 dark:text-zinc-100">
                            {it.fertilizer.name}
                          </span>
                          <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                            {it.doseKg} kg
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-zinc-400">
                  <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
                    Fontes permitidas no Tanque B:
                  </span>
                  <ul className="space-y-1">
                    <li>· <strong className="text-slate-800 dark:text-zinc-200">MAP / MKP</strong> (Fosfatos monoamônico e monopotássico)</li>
                    <li>· <strong className="text-slate-800 dark:text-zinc-200">Sulfato de Magnésio</strong> (MgSO₄·7H₂O)</li>
                    <li>· <strong className="text-slate-800 dark:text-zinc-200">Sulfato de Potássio / KCl</strong></li>
                    <li>· <strong className="text-slate-800 dark:text-zinc-200">Sulfato de Amônio / Ureia</strong></li>
                    <li>· <strong className="text-slate-800 dark:text-zinc-200">Micronutrientes</strong> (Ácido Bórico, sulfatos de Zn, Mn, Cu e Molibdato)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. BANCO DE FERTILIZANTES */}
        {activeSubTab === 'banco_fertilizantes' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                Banco de Fertilizantes Solúveis
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                Exibindo {filteredFertilizers.length} de {FERTILIZERS_DATABASE.length} fertilizantes · Clique em qualquer item para ver ficha rápida
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nome, fórmula ou marca comercial..."
                  value={searchFertQuery}
                  onChange={e => setSearchFertQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={selectedFertGroup}
                onChange={e => setSelectedFertGroup(e.target.value)}
                aria-label="Filtrar grupo químico"
                className="h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="todos">Todos os grupos químicos</option>
                <option value="nitrogenados">Nitrogenados</option>
                <option value="fosfatados">Fosfatados</option>
                <option value="potassicos">Potássicos</option>
                <option value="calcio">Cálcio</option>
                <option value="magnesio">Magnésio</option>
                <option value="micronutrientes_quelatos">Quelatos de ferro</option>
                <option value="micronutrientes_sais">Micronutrientes sais</option>
                <option value="acidos">Ácidos</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFertilizers.map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setDetailFertilizer(f)}
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 rounded-xl p-4 text-left transition-colors space-y-2.5 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                        {f.name}
                      </h3>
                      <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 mt-0.5 truncate">
                        {f.formula}
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 whitespace-nowrap shrink-0">
                      {f.defaultTank}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-1 text-xs text-slate-600 dark:text-zinc-400 tabular-nums">
                    <div className="flex justify-between">
                      <span>Solubilidade (20 °C)</span>
                      <strong className="font-semibold text-slate-900 dark:text-zinc-100">
                        {f.solubilityAt20C_gL} g/L
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Índice salino · pH (10%)</span>
                      <strong className="font-semibold text-slate-900 dark:text-zinc-100">
                        {f.saltIndex} · {f.solutionPh10Percent}
                      </strong>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 5. QUALIDADE DA ÁGUA & ACIDIFICAÇÃO */}
        {activeSubTab === 'qualidade_agua' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                  Qualidade da Água e Neutralização de Bicarbonatos
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Diagnóstico da fonte hídrica selecionada e demanda de acidificação para estabilizar o pH
                </p>
              </div>

              <select
                value={selectedWaterId}
                onChange={e => setSelectedWaterId(e.target.value)}
                aria-label="Selecionar perfil de água"
                className="h-8 px-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500 self-start sm:self-auto"
              >
                {WATER_QUALITY_PRESETS.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} (pH {w.ph})
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-zinc-800 overflow-hidden text-xs">
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-zinc-100">
                  <Droplets className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>{selectedWater.name}</span>
                </div>

                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 pt-2 border-t border-slate-100 dark:border-zinc-800 tabular-nums">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">pH</span>
                    <strong className="font-semibold text-slate-900 dark:text-zinc-100">{selectedWater.ph}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Condutividade</span>
                    <strong className="font-semibold text-slate-900 dark:text-zinc-100">
                      {selectedWater.ceMicroSiemens} µS/cm
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Bicarbonatos (HCO₃⁻)</span>
                    <strong className="font-semibold text-slate-900 dark:text-zinc-100">
                      {selectedWater.bicarbonatesHco3MgL} mg/L
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Dureza total</span>
                    <strong className="font-semibold text-slate-900 dark:text-zinc-100">
                      {selectedWater.totalHardnessMgCaCO3} mg/L CaCO₃
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Cálcio</span>
                    <strong className="font-semibold text-slate-900 dark:text-zinc-100">
                      {selectedWater.calciumMgL} mg/L
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Magnésio</span>
                    <strong className="font-semibold text-slate-900 dark:text-zinc-100">
                      {selectedWater.magnesiumMgL} mg/L
                    </strong>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    Demanda de Acidificação Recomendada
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Para neutralizar o excesso de bicarbonatos e estabilizar o pH da solução nutritiva entre 5,5 e 6,0, recomenda-se a injeção contínua de:
                  </p>
                </div>

                <div className="px-4 py-3 rounded-lg border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/70 dark:bg-emerald-950/30 font-semibold tabular-nums text-emerald-900 dark:text-emerald-200">
                  {selectedWater.acidRequirementMlPerM3} mL de Ácido Fosfórico 85% por m³ de água
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. SOLUBILIDADE × TEMPERATURA */}
        {activeSubTab === 'solubilidade' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                Solubilidade em Água por Temperatura
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Limite máximo de dissolução em gramas de fertilizante por litro de água (g/L)
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse tabular-nums">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 text-slate-600 dark:text-zinc-400 font-medium">
                      <th className="py-2.5 px-4">Fertilizante</th>
                      <th className="py-2.5 px-3 text-right">0 °C</th>
                      <th className="py-2.5 px-3 text-right">10 °C</th>
                      <th className="py-2.5 px-3 text-right bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-semibold">
                        20 °C (Padrão)
                      </th>
                      <th className="py-2.5 px-3 text-right">30 °C</th>
                      <th className="py-2.5 px-3 text-right">40 °C</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {FERTILIZERS_DATABASE.map(f => (
                      <tr key={f.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40">
                        <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-zinc-100">
                          {f.name}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600 dark:text-zinc-400">
                          {f.solubilityCurve.find(p => p.tempCelsius === 0)?.solubilityGramsPerLiter ?? '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600 dark:text-zinc-400">
                          {f.solubilityCurve.find(p => p.tempCelsius === 10)?.solubilityGramsPerLiter ?? '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/15">
                          {f.solubilityAt20C_gL}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600 dark:text-zinc-400">
                          {f.solubilityCurve.find(p => p.tempCelsius === 30)?.solubilityGramsPerLiter ?? '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600 dark:text-zinc-400">
                          {f.solubilityCurve.find(p => p.tempCelsius === 40)?.solubilityGramsPerLiter ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 7. RECEITAS & LAUDOS */}
        {activeSubTab === 'receitas_laudos' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                Receitas Agronômicas e Emissão de Laudos
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Formulações de referência balanceadas por cultura e estádio fenológico
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl divide-y divide-slate-100 dark:divide-zinc-800 overflow-hidden">
              {STANDARD_FERTIGATION_RECIPES.map(rec => (
                <div
                  key={rec.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                        {rec.name}
                      </h3>
                      <span className="text-slate-300 dark:text-zinc-700 text-xs">·</span>
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        {rec.crop} ({rec.phenologicalStage})
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                      {rec.notes}
                    </p>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                      CE alvo: <strong className="text-slate-800 dark:text-zinc-200">{rec.targetCeMsCm} mS/cm</strong> · Status:{' '}
                      <span className="capitalize">{rec.safetyStatus}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-center"
                  >
                    <Printer className="w-3.5 h-3.5 shrink-0" />
                    <span>Imprimir Laudo</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: DETALHES DO FERTILIZANTE */}
      {detailFertilizer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-lg w-full overflow-hidden shadow-xl">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  {detailFertilizer.name}
                </h3>
                <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400">
                  {detailFertilizer.formula} · {detailFertilizer.defaultTank}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDetailFertilizer(null)}
                className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 inline-flex items-center justify-center cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs text-slate-700 dark:text-zinc-300 max-h-[68vh] overflow-y-auto">
              <div>
                <span className="font-semibold text-slate-900 dark:text-zinc-100 block mb-0.5">
                  Função na planta
                </span>
                <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {detailFertilizer.plantFunction}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-900 dark:text-zinc-100 block mb-0.5">
                  Sintomas de deficiência
                </span>
                <p className="text-amber-700 dark:text-amber-400 leading-relaxed">
                  {detailFertilizer.deficiencySymptoms}
                </p>
              </div>

              {detailFertilizer.prohibitedMixNotes && (
                <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-800/70 bg-rose-50/70 dark:bg-rose-950/30 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-rose-800 dark:text-rose-300">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Incompatibilidades graves</span>
                  </div>
                  <p className="text-[11px] text-rose-950 dark:text-rose-200/90 leading-relaxed">
                    {detailFertilizer.prohibitedMixNotes}
                  </p>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const id = detailFertilizer.id;
                  if (!tankFertilizers.some(f => f.fertilizerId === id)) {
                    setTankFertilizers(prev => [...prev, { fertilizerId: id, doseKg: 10.0 }]);
                  }
                  setDetailFertilizer(null);
                  setActiveSubTab('simulador_tanque');
                  showNotification('Fertilizante enviado ao Laboratório Virtual.');
                }}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Usar no Tanque
              </button>
              <button
                type="button"
                onClick={() => setDetailFertilizer(null)}
                className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGRA DE COMPATIBILIDADE QUÍMICA */}
      {selectedCompatRule && (() => {
        const fertA = FERTILIZERS_DATABASE.find(f => f.id === selectedCompatRule.fertIdA);
        const fertB = FERTILIZERS_DATABASE.find(f => f.id === selectedCompatRule.fertIdB);
        const isError = selectedCompatRule.status === 'incompativel';
        const isWarning = selectedCompatRule.status === 'compativel_com_restricao';

        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-2xl w-full overflow-hidden shadow-xl max-h-[88vh] flex flex-col">
              <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {renderRuleStatusBadge(selectedCompatRule.status)}
                    <span className="text-slate-300 dark:text-zinc-700 text-xs">·</span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Reação: {selectedCompatRule.reactionType}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-1">
                    {fertA?.name || selectedCompatRule.fertIdA} + {fertB?.name || selectedCompatRule.fertIdB}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCompatRule(null)}
                  className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 inline-flex items-center justify-center cursor-pointer"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100">
                      Fundamentação química
                    </span>
                    {selectedCompatRule.precipitateFormed && (
                      <span className="text-[11px] font-medium text-rose-700 dark:text-rose-400">
                        Precipitado: {selectedCompatRule.precipitateFormed}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                    {selectedCompatRule.technicalReason}
                  </p>
                  {selectedCompatRule.chemicalEquation && (
                    <div className="px-3 py-2 bg-slate-50 dark:bg-zinc-950 rounded-lg font-mono text-[11px] text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800">
                      {selectedCompatRule.chemicalEquation}
                    </div>
                  )}
                  {selectedCompatRule.ionsInvolved && selectedCompatRule.ionsInvolved.length > 0 && (
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                      Íons: {selectedCompatRule.ionsInvolved.join(' · ')}
                    </div>
                  )}
                </div>

                {/* 4 Parâmetros Quantitativos */}
                <div className="border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 divide-slate-100 dark:divide-zinc-800">
                  <div className="p-3.5 sm:border-r border-slate-100 dark:border-zinc-800">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Faixa segura de pH</span>
                    <strong className="text-emerald-700 dark:text-emerald-400 font-semibold tabular-nums">
                      {selectedCompatRule.phRangeSafe}
                    </strong>
                    {selectedCompatRule.phCriticalRisk && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
                        {selectedCompatRule.phCriticalRisk}
                      </p>
                    )}
                  </div>

                  <div className="p-3.5">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                      Concentração máxima combinada
                    </span>
                    <strong className="text-slate-900 dark:text-zinc-100 font-semibold tabular-nums">
                      {selectedCompatRule.maxCombinedConcentrationGramsPerLiter
                        ? `${selectedCompatRule.maxCombinedConcentrationGramsPerLiter} g/L`
                        : 'Sem limite crítico'}
                    </strong>
                    {selectedCompatRule.maxConcentrationNote && (
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        {selectedCompatRule.maxConcentrationNote}
                      </p>
                    )}
                  </div>

                  <div className="p-3.5 border-t border-slate-100 dark:border-zinc-800 sm:border-r">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                      Sensibilidade térmica
                    </span>
                    <strong className="text-slate-900 dark:text-zinc-100 font-semibold capitalize">
                      {selectedCompatRule.temperatureSensitivity}
                    </strong>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      {selectedCompatRule.temperatureEffect}
                    </p>
                  </div>

                  <div className="p-3.5 border-t border-slate-100 dark:border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">Risco em gotejadores</span>
                      <span
                        className={`text-[11px] font-semibold tabular-nums capitalize ${
                          isError
                            ? 'text-rose-700 dark:text-rose-400'
                            : isWarning
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {selectedCompatRule.cloggingRisk} ({selectedCompatRule.dripperImpactPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          isError ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${selectedCompatRule.dripperImpactPercent}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      {selectedCompatRule.cloggingMechanism}
                    </p>
                  </div>
                </div>

                {/* Protocolos Operacionais */}
                <div className="border border-slate-200 dark:border-zinc-800 rounded-xl divide-y divide-slate-100 dark:divide-zinc-800">
                  <div className="p-3.5">
                    <strong className="text-slate-900 dark:text-zinc-100 font-semibold block">
                      Ordem de adição no tanque
                    </strong>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">
                      {selectedCompatRule.mixingOrderRule}
                    </p>
                  </div>

                  <div className="p-3.5">
                    <strong className="text-slate-900 dark:text-zinc-100 font-semibold block">
                      Protocolo de Teste de Jarra (Jar-Test)
                    </strong>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">
                      {selectedCompatRule.jarTestProtocol}
                    </p>
                  </div>

                  {selectedCompatRule.remediationProtocol && (
                    <div className="p-3.5">
                      <strong className="text-rose-700 dark:text-rose-400 font-semibold block">
                        Remediação em caso de mistura acidental
                      </strong>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">
                        {selectedCompatRule.remediationProtocol}
                      </p>
                    </div>
                  )}
                </div>

                {/* Diretriz Agronômica */}
                <div className="p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/70 dark:bg-emerald-950/30">
                  <strong className="text-emerald-900 dark:text-emerald-200 font-semibold block mb-0.5">
                    Parecer agronômico e diretriz de campo
                  </strong>
                  <p className="text-[11px] text-emerald-950 dark:text-emerald-100/90 leading-relaxed">
                    {selectedCompatRule.agronomicRecommendation}
                  </p>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Estimativa CE:{' '}
                  <strong className="text-slate-800 dark:text-zinc-200">
                    {selectedCompatRule.ecIncreaseEstimate || 'Calculado no simulador'}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCompatRule(null)}
                  className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
                >
                  Fechar Parecer
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default FertigationModule;
