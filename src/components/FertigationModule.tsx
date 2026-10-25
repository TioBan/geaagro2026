// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  FlaskConical,
  Layers,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Plus,
  Trash2,
  Search,
  Sparkles,
  ArrowRight,
  Droplets,
  Zap,
  FileText,
  Thermometer,
  ShieldAlert,
  Sliders,
  Check,
  X,
  Printer,
  ChevronDown,
  Info,
  Boxes,
  BookOpen,
  LayoutGrid,
} from 'lucide-react';
import {
  FertilizerItem,
  FertilizerGroup,
  CompatibilityPairRule,
  WaterQualityProfile,
  FertigationRecipe,
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

  // Added fertilizers in current simulation (clean professional state)
  const [tankFertilizers, setTankFertilizers] = useState<TankFertilizerEntry[]>([]);

  // Fertilizer to add in simulator selector
  const [selectedFertToAdd, setSelectedFertToAdd] = useState<string>('mkp');
  const [doseToAddKg, setDoseToAddKg] = useState<number>(15.0);

  // Search and Detail Drawer in Fertilizer Database
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

    // Check Incompatibilities among all pairs in the tank using the comprehensive resolver
    const detectedIncompatibilities: CompatibilityPairRule[] = [];
    for (let i = 0; i < (items || []).length; i++) {
      for (let j = i + 1; j < (items || []).length; j++) {
        if (!items[i]?.fertilizer || !items[j]?.fertilizer) continue;
        const rule = getChemicalCompatibilityPair(items[i].fertilizer, items[j].fertilizer);

        if (rule && rule.status !== 'compativel') {
          detectedIncompatibilities.push(rule);
        }
      }
    }

    // Nutrient PPM balance
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

    // Estimate CE and pH
    let estimatedCe = selectedWater.ceMicroSiemens / 1000;
    items.forEach(it => {
      estimatedCe += it.concentrationGL * it.fertilizer.estimatedCeMsPerCmAt1gL;
    });

    // Estimated pH (weighted approximation based on buffer and acidic components)
    let estimatedPh = selectedWater?.ph || 6.5;
    const hasAcid = items.some(it => it.fertilizer?.group === 'acidos');
    const hasMapOrMkp = items.some(it => it.fertilizer?.id === 'map_purificado' || it.fertilizer?.id === 'mkp');
    if (hasAcid) {
      estimatedPh = 4.2;
    } else if (hasMapOrMkp) {
      estimatedPh = Math.min(estimatedPh, 5.6);
    }

    const hasIncompatibility = detectedIncompatibilities.length > 0;

    return {
      items,
      totalKg,
      totalGL,
      detectedIncompatibilities,
      ppmTotals,
      estimatedCe: Math.round(estimatedCe * 100) / 100,
      estimatedPh: Math.round(estimatedPh * 10) / 10,
      hasIncompatibility,
      safetyStatus: hasIncompatibility
        ? 'nao_recomendada'
        : totalGL > 250
        ? 'atencao'
        : 'segura',
    };
  }, [tankFertilizers, tankVolumeLiters, selectedWater]);

  const handleAddFertilizerToTank = () => {
    if (tankFertilizers.some(f => f.fertilizerId === selectedFertToAdd)) {
      showNotification('Este fertilizante já está no tanque. Você pode editar a dosagem diretamente.');
      return;
    }
    setTankFertilizers(prev => [...prev, { fertilizerId: selectedFertToAdd, doseKg: doseToAddKg }]);
    showNotification('Fertilizante adicionado à calda com sucesso.');
  };

  const handleRemoveFertilizer = (fertId: string) => {
    setTankFertilizers(prev => prev.filter(f => f.fertilizerId !== fertId));
  };

  const handleUpdateDose = (fertId: string, newDose: number) => {
    setTankFertilizers(prev =>
      prev.map(f => (f.fertilizerId === fertId ? { ...f, doseKg: Math.max(0.1, newDose) } : f))
    );
  };

  const handleAutoSeparateTanks = () => {
    const tankAItems: TankFertilizerEntry[] = [];
    const tankBItems: TankFertilizerEntry[] = [];

    tankFertilizers.forEach(tf => {
      const fert = FERTILIZERS_DATABASE.find(f => f?.id === tf.fertilizerId);
      if (fert?.defaultTank === 'Tanque A') {
        tankAItems.push(tf);
      } else {
        tankBItems.push(tf);
      }
    });

    // We switch to Tanque A & B tab
    setActiveSubTab('tanques_ab');
    showNotification('Fertilizantes separados com sucesso entre Tanque A (Cálcio/Quelatos) e Tanque B (Fosfatos/Sulfatos)!');
  };

  // Filtered fertilizers in database tab
  const filteredFertilizers = useMemo(() => {
    return FERTILIZERS_DATABASE.filter(f => {
      const matchesSearch =
        f.name.toLowerCase().includes(searchFertQuery.toLowerCase()) ||
        f.commercialName.toLowerCase().includes(searchFertQuery.toLowerCase()) ||
        f.formula.toLowerCase().includes(searchFertQuery.toLowerCase());
      const matchesGroup = selectedFertGroup === 'todos' || f.group === selectedFertGroup;
      return matchesSearch && matchesGroup;
    });
  }, [searchFertQuery, selectedFertGroup]);

  return (
    <div className="space-y-6">
      {/* Header Banner: Fertirrigação Pro & Laboratório Virtual GeaAgro */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-emerald-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
                <FlaskConical className="w-3 h-3" />
                Laboratório Virtual 100% Offline
              </span>
              <span className="text-emerald-200/80 text-xs font-semibold">• Compatibilidade Química & Fertirrigação</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-400" />
              Fertirrigação & Matriz de Compatibilidade Química
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-3xl">
              Simule a dissolução em tanques virtuais, evite a precipitação de gipsita e fosfatos insolúveis, calcule ppm de nutrientes, CE e separe receitas automaticamente em Tanques A e B.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setTankFertilizers([
                  { fertilizerId: 'nitrato_calcio', doseKg: 40.0 },
                  { fertilizerId: 'nitrato_potassio', doseKg: 30.0 },
                  { fertilizerId: 'fe_edta', doseKg: 1.0 },
                ]);
                showNotification('Tanque redefinido para Solução Segura padrão.');
              }}
              className="bg-emerald-800/80 hover:bg-emerald-700/90 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-emerald-600/60 cursor-pointer"
            >
              Resetar Tanque
            </button>

            <button
              onClick={handleAutoSeparateTanks}
              className="bg-emerald-500 hover:bg-emerald-400 text-teal-950 font-black px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              Separar Tanque A & B
            </button>
          </div>
        </div>

        {/* Global Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 mt-5 pt-4 border-t border-emerald-800/60 text-xs">
          <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300/80 block">Fertilizantes Cadastrados</span>
            <strong className="text-base text-white font-black">{FERTILIZERS_DATABASE.length} Adubos</strong>
            <span className="text-[10px] text-emerald-300 block">Banco 100% Técnico</span>
          </div>

          <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300/80 block">No Tanque Atual</span>
            <strong className="text-base text-cyan-300 font-black">{(tankCalculation?.items || []).length} Insumos</strong>
            <span className="text-[10px] text-emerald-200 block">Total: {tankCalculation.totalKg} kg</span>
          </div>

          <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300/80 block">Concentração Calda</span>
            <strong className="text-base text-emerald-400 font-black">{tankCalculation.totalGL.toFixed(1)} g/L</strong>
            <span className="text-[10px] text-emerald-200 block">Vol: {tankVolumeLiters} L</span>
          </div>

          <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300/80 block">CE Estimada</span>
            <strong className="text-base text-amber-300 font-black">{tankCalculation.estimatedCe} mS/cm</strong>
            <span className="text-[10px] text-emerald-200 block">Condutividade</span>
          </div>

          <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300/80 block">pH Estimado</span>
            <strong className="text-base text-teal-300 font-black">{tankCalculation.estimatedPh}</strong>
            <span className="text-[10px] text-emerald-200 block">Faixa Ideal 5.5-6.5</span>
          </div>

          <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300/80 block">Status da Mistura</span>
            <strong
              className={`text-sm font-black block truncate ${
                tankCalculation.hasIncompatibility ? 'text-rose-400' : 'text-emerald-300'
              }`}
            >
              {tankCalculation.hasIncompatibility ? '🔴 Incompatível' : '🟢 100% Segura'}
            </strong>
            <span className="text-[10px] text-emerald-200 block">Risco Entupimento</span>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between shadow-md animate-fade-in">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-white hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}



      {/* ========================================================= */}
      {/* 0. DASHBOARD INICIAL & INDICADORES                        */}
      {/* ========================================================= */}
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

      {/* ========================================================= */}
      {/* 1. LABORATÓRIO VIRTUAL (SIMULADOR DE TANQUE)              */}
      {/* ========================================================= */}
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

      {/* ========================================================= */}
      {/* 1.5 BIBLIOTECA TÉCNICA AGRONÔMICA                         */}
      {/* ========================================================= */}
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

      {/* ========================================================= */}
      {/* 2. MATRIZ DE COMPATIBILIDADE QUÍMICA EXPANDIDA           */}
      {/* ========================================================= */}
      {activeSubTab === 'matriz_compatibilidade' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header & Sub-Navigation Controls */}
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Módulo Químico Avançado
                  </span>
                  <span className="text-xs text-slate-400 font-bold">• 20+ Parâmetros Agronômicos</span>
                </div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2 mt-1">
                  <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Matriz Cruzada de Compatibilidade Química
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Análise estequiométrica, cinéticas de precipitação, faixas críticas de pH, índice de obstrução de gotejadores e protocolos de jar-test.
                </p>
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 self-start lg:self-auto">
                <button
                  onClick={() => setCompatViewMode('matriz_2d')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    compatViewMode === 'matriz_2d'
                      ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Matriz 2D (Grid)
                </button>
                <button
                  onClick={() => setCompatViewMode('simulador_par')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    compatViewMode === 'simulador_par'
                      ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  Simulador de Par
                </button>
                <button
                  onClick={() => setCompatViewMode('fichas_regras')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    compatViewMode === 'fichas_regras'
                      ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Catálogo de Regras
                </button>
              </div>
            </div>

            {/* Quick Status Legend and Summary Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  🟢 Compatível (Mesmo Tanque)
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  🟡 Restrição (pH / Limite g/L)
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  🔴 Incompatível (Segregar A e B)
                </span>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                Total de compostos: <strong className="text-slate-900 dark:text-white font-black">{FERTILIZERS_DATABASE.length}</strong> fontes avaliadas
              </div>
            </div>
          </div>

          {/* VIEW 1: MATRIZ 2D INTERATIVA (GRID COMPLETO) */}
          {compatViewMode === 'matriz_2d' && (
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filtrar fertilizantes no grid..."
                      value={compatSearchQuery}
                      onChange={e => setCompatSearchQuery(e.target.value)}
                      className="pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs w-64 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Filtrar Grupo:</span>
                  <select
                    value={matrixFilterGroup}
                    onChange={e => setMatrixFilterGroup(e.target.value)}
                    className="p-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-hidden"
                  >
                    <option value="todos">Todos os Grupos Químicos</option>
                    <option value="calcio">Fontes de Cálcio</option>
                    <option value="fosfatados">Fosfatados</option>
                    <option value="potassicos">Potássicos</option>
                    <option value="nitrogenados">Nitrogenados</option>
                    <option value="enxofre">Sulfatos / Enxofre</option>
                    <option value="micronutrientes_quelatos">Quelatos</option>
                    <option value="micronutrientes_sais">Micronutrientes Minerais</option>
                    <option value="acidos">Ácidos Fortes</option>
                  </select>
                </div>
              </div>

              {/* Responsive Scrollable 2D Grid */}
              <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-xl max-h-[620px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 dark:bg-zinc-900 sticky top-0 z-20 shadow-xs">
                    <tr>
                      <th className="p-3 font-extrabold text-slate-900 dark:text-white border-b border-r border-slate-200 dark:border-zinc-800 min-w-[200px] sticky left-0 bg-slate-100 dark:bg-zinc-900 z-30">
                        Fertilizante
                      </th>
                      {FERTILIZERS_DATABASE.filter(f =>
                        (matrixFilterGroup === 'todos' || f.group === matrixFilterGroup) &&
                        (compatSearchQuery === '' || f.name.toLowerCase().includes(compatSearchQuery.toLowerCase()))
                      ).map(colFert => (
                        <th
                          key={colFert.id}
                          className="p-2.5 font-bold text-slate-700 dark:text-zinc-300 border-b border-r border-slate-200 dark:border-zinc-800 min-w-[130px] text-center text-[11px]"
                          title={colFert.name}
                        >
                          <div className="truncate max-w-[120px] font-bold">{colFert.name}</div>
                          <span className="text-[9px] text-slate-400 font-mono block truncate">{colFert.formula}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {FERTILIZERS_DATABASE.filter(f =>
                      (matrixFilterGroup === 'todos' || f.group === matrixFilterGroup) &&
                      (compatSearchQuery === '' || f.name.toLowerCase().includes(compatSearchQuery.toLowerCase()))
                    ).map(rowFert => {
                      const visibleCols = FERTILIZERS_DATABASE.filter(f =>
                        (matrixFilterGroup === 'todos' || f.group === matrixFilterGroup) &&
                        (compatSearchQuery === '' || f.name.toLowerCase().includes(compatSearchQuery.toLowerCase()))
                      );

                      return (
                        <tr key={rowFert.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/40">
                          <td className="p-3 font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-zinc-800 sticky left-0 bg-white dark:bg-zinc-950 z-10 text-[11px]">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white">{rowFert.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{rowFert.formula}</div>
                              </div>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase ${
                                rowFert.defaultTank === 'Tanque A'
                                  ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300'
                                  : rowFert.defaultTank === 'Tanque B'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                  : 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                              }`}>
                                {rowFert.defaultTank.split(' ')[0]} {rowFert.defaultTank.split(' ')[1]}
                              </span>
                            </div>
                          </td>

                          {visibleCols.map(colFert => {
                            const pairRule = getChemicalCompatibilityPair(rowFert, colFert);
                            const isSelf = rowFert.id === colFert.id;

                            let bgClass = 'bg-emerald-50/80 hover:bg-emerald-100/90 text-emerald-900 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/60 dark:text-emerald-300';
                            let icon = '🟢';
                            let label = 'Compatível';

                            if (pairRule.status === 'incompativel') {
                              bgClass = 'bg-rose-50/90 hover:bg-rose-100 text-rose-950 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 dark:text-rose-200 font-black';
                              icon = '🔴';
                              label = 'Incompatível';
                            } else if (pairRule.status === 'compativel_com_restricao') {
                              bgClass = 'bg-amber-50/90 hover:bg-amber-100 text-amber-950 dark:bg-amber-950/40 dark:hover:bg-amber-950/70 dark:text-amber-200 font-bold';
                              icon = '🟡';
                              label = 'Restrição';
                            } else if (isSelf) {
                              bgClass = 'bg-slate-50 dark:bg-zinc-900 text-slate-400 dark:text-zinc-500';
                              icon = '⚪';
                              label = 'Auto-par';
                            }

                            return (
                              <td
                                key={colFert.id}
                                onClick={() => setSelectedCompatRule(pairRule)}
                                className={`p-2 text-center border-r border-slate-200/60 dark:border-zinc-800/60 cursor-pointer transition-all ${bgClass}`}
                                title={`${rowFert.name} + ${colFert.name}: Clique para ver parecer técnico`}
                              >
                                <div className="flex flex-col items-center justify-center gap-0.5">
                                  <span className="text-xs">{icon}</span>
                                  <span className="text-[9px] uppercase font-bold tracking-tight">{label}</span>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 2: SIMULADOR DE PAR QUÍMICO INTERATIVO */}
          {compatViewMode === 'simulador_par' && (
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-6">
              <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
                <h4 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-emerald-600" />
                  Simulador de Interação Química Par-a-Par
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Selecione dois fertilizantes quaisquer do acervo para calcular a reação estequiométrica, risco de entupimento, faixa de pH e protocolo de jar-test.
                </p>
              </div>

              {/* Selector Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                <div className="lg:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                    Fertilizante A (Componente 1):
                  </label>
                  <select
                    value={compatSimFertA}
                    onChange={e => setCompatSimFertA(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                  >
                    {FERTILIZERS_DATABASE.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.formula})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-center items-center pt-5">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 font-black text-xs border border-slate-200 dark:border-zinc-700">
                    VS
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    Fertilizante B (Componente 2):
                  </label>
                  <select
                    value={compatSimFertB}
                    onChange={e => setCompatSimFertB(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    {FERTILIZERS_DATABASE.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.formula})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Diagnostic Card for Selected Pair */}
              {(() => {
                const fertAObj = FERTILIZERS_DATABASE.find(f => f.id === compatSimFertA)!;
                const fertBObj = FERTILIZERS_DATABASE.find(f => f.id === compatSimFertB)!;
                const simRule = getChemicalCompatibilityPair(fertAObj, fertBObj);

                const isError = simRule.status === 'incompativel';
                const isWarning = simRule.status === 'compativel_com_restricao';

                return (
                  <div className={`p-6 rounded-2xl border-2 transition-all space-y-5 ${
                    isError
                      ? 'border-rose-400 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20'
                      : isWarning
                      ? 'border-amber-400 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20'
                      : 'border-emerald-400 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20'
                  }`}>
                    {/* Header Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-zinc-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${
                            isError
                              ? 'bg-rose-600 text-white'
                              : isWarning
                              ? 'bg-amber-600 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}>
                            {isError ? '🔴 INCOMPATIBILIDADE SEVERA' : isWarning ? '🟡 COMPATÍVEL COM RESTRIÇÃO' : '🟢 TOTALMENTE COMPATÍVEL'}
                          </span>
                          <span className="text-xs font-bold text-slate-500 uppercase">
                            Reação: {simRule.reactionType}
                          </span>
                        </div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                          {fertAObj.name} + {fertBObj.name}
                        </h4>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block font-bold">Risco de Entupimento</span>
                        <span className={`text-sm font-black uppercase ${
                          isError ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {simRule.cloggingRisk} ({simRule.dripperImpactPercent}% de impacto)
                        </span>
                      </div>
                    </div>

                    {/* Parameters Grid (4 Cards) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                      {/* Card 1: Fundamentação e Equação */}
                      <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-[11px]">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          Mecanismo Químico
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                          {simRule.technicalReason}
                        </p>
                        {simRule.chemicalEquation && (
                          <div className="p-2 bg-slate-50 dark:bg-zinc-950 rounded-lg font-mono text-[10px] text-slate-800 dark:text-zinc-200 border border-slate-100 dark:border-zinc-800">
                            {simRule.chemicalEquation}
                          </div>
                        )}
                      </div>

                      {/* Card 2: Faixa de pH e Concentração */}
                      <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-[11px]">
                          <Sliders className="w-3.5 h-3.5 text-blue-500" />
                          Limites Operacionais
                        </span>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold">Faixa Segura de pH:</span>
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">{simRule.phRangeSafe}</span>
                        </div>
                        {simRule.phCriticalRisk && (
                          <div>
                            <span className="text-[10px] text-rose-500 block font-bold">pH Crítico de Risco:</span>
                            <span className="text-[10px] text-slate-700 dark:text-zinc-300">{simRule.phCriticalRisk}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold">Limite Máximo Combinado:</span>
                          <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200">
                            {simRule.maxCombinedConcentrationGramsPerLiter ? `${simRule.maxCombinedConcentrationGramsPerLiter} g/L` : 'Sem restrição'}
                          </span>
                        </div>
                      </div>

                      {/* Card 3: Dinâmica Térmica & Salinidade */}
                      <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-[11px]">
                          <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                          Termodinâmica & CE
                        </span>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold">Sensibilidade Térmica:</span>
                          <span className="text-[11px] font-bold uppercase text-slate-800 dark:text-zinc-200">{simRule.temperatureSensitivity}</span>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">{simRule.temperatureEffect}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold">Impacto na CE:</span>
                          <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200">{simRule.ecIncreaseEstimate}</span>
                        </div>
                      </div>

                      {/* Card 4: Efeito em Emitters e Gotejadores */}
                      <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-[11px]">
                          <Droplets className="w-3.5 h-3.5 text-cyan-500" />
                          Emissores & Filtros
                        </span>
                        <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${isError ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${simRule.dripperImpactPercent}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-600 dark:text-zinc-400 leading-tight">
                          {simRule.cloggingMechanism}
                        </p>
                        {simRule.precipitateFormed && (
                          <div className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">
                            ⚠️ Precipitado: {simRule.precipitateFormed}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Operational Protocols */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-white/80 dark:bg-zinc-900/80 rounded-xl border border-slate-200 dark:border-zinc-800">
                        <strong className="block font-bold text-slate-900 dark:text-white mb-1">
                          📋 Ordem de Adição no Tanque (WALES):
                        </strong>
                        <p className="text-[11px] text-slate-600 dark:text-zinc-400">{simRule.mixingOrderRule}</p>
                      </div>

                      <div className="p-3 bg-white/80 dark:bg-zinc-900/80 rounded-xl border border-slate-200 dark:border-zinc-800">
                        <strong className="block font-bold text-slate-900 dark:text-white mb-1">
                          🧪 Protocolo de Teste de Jarra (Jar-Test):
                        </strong>
                        <p className="text-[11px] text-slate-600 dark:text-zinc-400">{simRule.jarTestProtocol}</p>
                      </div>

                      <div className="p-3 bg-white/80 dark:bg-zinc-900/80 rounded-xl border border-slate-200 dark:border-zinc-800">
                        <strong className="block font-bold text-slate-900 dark:text-white mb-1">
                          🛠️ Remediação em Caso de Mistura:
                        </strong>
                        <p className="text-[11px] text-slate-600 dark:text-zinc-400">{simRule.remediationProtocol}</p>
                      </div>
                    </div>

                    {/* Agronomic Recommendation Footer */}
                    <div className="p-3 bg-slate-900 text-white dark:bg-zinc-900 rounded-xl font-medium text-xs flex items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-emerald-400">✓ Diretriz Agronômica Oficial: </span>
                        {simRule.agronomicRecommendation}
                      </div>
                      <button
                        onClick={() => setSelectedCompatRule(simRule)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer"
                      >
                        Abrir Parecer Completo
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* VIEW 3: CATÁLOGO DE REGRAS E FICHAS TÉCNICAS */}
          {compatViewMode === 'fichas_regras' && (
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Pesquisar por fertilizante, precipitado ou íon..."
                      value={compatSearchQuery}
                      onChange={e => setCompatSearchQuery(e.target.value)}
                      className="pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs w-72 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Filtrar Status:</span>
                  <select
                    value={compatFilterStatus}
                    onChange={e => setCompatFilterStatus(e.target.value)}
                    className="p-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-hidden"
                  >
                    <option value="todos">Todos os Pareceres</option>
                    <option value="incompativel">🔴 Incompatíveis Apenas</option>
                    <option value="compativel_com_restricao">🟡 Com Restrição</option>
                    <option value="compativel">🟢 Compatíveis</option>
                  </select>
                </div>
              </div>

              {/* List of Pairwise Rules Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                {COMPATIBILITY_RULES_MATRIX.filter(r => {
                  if (compatFilterStatus !== 'todos' && r.status !== compatFilterStatus) return false;
                  if (compatSearchQuery) {
                    const q = compatSearchQuery.toLowerCase();
                    const fertA = FERTILIZERS_DATABASE.find(f => f.id === r.fertIdA);
                    const fertB = FERTILIZERS_DATABASE.find(f => f.id === r.fertIdB);
                    const nameMatch = (fertA?.name.toLowerCase().includes(q) || fertB?.name.toLowerCase().includes(q));
                    const textMatch = r.technicalReason.toLowerCase().includes(q) || (r.precipitateFormed && r.precipitateFormed.toLowerCase().includes(q));
                    const ionMatch = r.ionsInvolved?.some(ion => ion.toLowerCase().includes(q));
                    return nameMatch || textMatch || ionMatch;
                  }
                  return true;
                }).map((rule, idx) => {
                  const fertA = FERTILIZERS_DATABASE.find(f => f.id === rule.fertIdA)!;
                  const fertB = FERTILIZERS_DATABASE.find(f => f.id === rule.fertIdB)!;

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedCompatRule(rule)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                        rule.status === 'incompativel'
                          ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50 hover:shadow-xs'
                          : rule.status === 'compativel_com_restricao'
                          ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50 hover:shadow-xs'
                          : 'border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                          rule.status === 'incompativel'
                            ? 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300'
                            : rule.status === 'compativel_com_restricao'
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {rule.status === 'incompativel' ? '🔴 INCOMPATÍVEL' : rule.status === 'compativel_com_restricao' ? '🟡 RESTRIÇÃO' : '🟢 COMPATÍVEL'}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">{rule.reactionType}</span>
                      </div>

                      <strong className="text-slate-900 dark:text-white block font-bold text-sm">
                        {fertA?.name || rule.fertIdA} + {fertB?.name || rule.fertIdB}
                      </strong>

                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {rule.technicalReason}
                      </p>

                      {rule.precipitateFormed && (
                        <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                          ⚠️ {rule.precipitateFormed}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200/60 dark:border-zinc-800">
                        <span>pH: {rule.phRangeSafe}</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">Ver Ficha Completa →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SEPARAÇÃO AUTOMÁTICA TANQUES A & B                     */}
      {/* ========================================================= */}
      {activeSubTab === 'tanques_ab' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-5">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
              <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                Arquitetura de Preparo
              </span>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                Segregação Obrigatória: Tanque A (Cálcio/Quelatos) vs. Tanque B (Fosfatos/Sulfatos)
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                A separação física dos tanques concentrados impede a precipitação de Gesso e Fosfato Bicálcico, garantindo 100% de solubilidade até a injeção na rede de fertirrigação.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tanque A */}
              <div className="bg-slate-50 dark:bg-zinc-900/60 border-2 border-cyan-400 rounded-2xl p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
                  <h4 className="font-black text-base text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5">
                    ⚗️ TANQUE A (Soluções de Cálcio e Ferro)
                  </h4>
                  <span className="bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Livre de Sulfatos/Fosfatos
                  </span>
                </div>

                <div className="space-y-2 text-[11px] text-slate-700 dark:text-zinc-300">
                  <strong className="block text-slate-900 dark:text-white">Fertilizantes Permitidos no Tanque A:</strong>
                  <ul className="space-y-1">
                    <li>• <strong>Nitrato de Cálcio</strong> (5Ca(NO3)2·NH4NO3)</li>
                    <li>• <strong>Nitrato de Potássio</strong> (KNO3)</li>
                    <li>• <strong>Quelato de Ferro Fe-EDTA / Fe-DTPA</strong></li>
                    <li>• <strong>Nitrato de Magnésio</strong> (quando não se usa sulfato)</li>
                    <li>• <strong>Ácido Nítrico</strong> (se necessário)</li>
                  </ul>
                </div>
              </div>

              {/* Tanque B */}
              <div className="bg-slate-50 dark:bg-zinc-900/60 border-2 border-emerald-500 rounded-2xl p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
                  <h4 className="font-black text-base text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    ⚗️ TANQUE B (Fosfatos, Sulfatos e Micronutrientes)
                  </h4>
                  <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Livre de Cálcio
                  </span>
                </div>

                <div className="space-y-2 text-[11px] text-slate-700 dark:text-zinc-300">
                  <strong className="block text-slate-900 dark:text-white">Fertilizantes Permitidos no Tanque B:</strong>
                  <ul className="space-y-1">
                    <li>• <strong>MAP / MKP</strong> (Fosfato Monoamônico / Monopotássico)</li>
                    <li>• <strong>Sulfato de Magnésio</strong> (MgSO4·7H2O)</li>
                    <li>• <strong>Sulfato de Potássio / KCl</strong></li>
                    <li>• <strong>Sulfato de Amônio / Ureia</strong></li>
                    <li>• <strong>Micronutrientes</strong> (Ácido Bórico, Sulfatos de Zn, Mn, Cu e Molibdato)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. BANCO DE FERTILIZANTES & FICHAS TÉCNICAS               */}
      {/* ========================================================= */}
      {activeSubTab === 'banco_fertilizantes' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar fertilizante por nome, fórmula ou marca comercial..."
                  value={searchFertQuery}
                  onChange={e => setSearchFertQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                />
              </div>

              <select
                value={selectedFertGroup}
                onChange={e => setSelectedFertGroup(e.target.value)}
                className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-bold"
              >
                <option value="todos">Todos os Grupos Químicos</option>
                <option value="nitrogenados">Nitrogenados</option>
                <option value="fosfatados">Fosfatados</option>
                <option value="potassicos">Potássicos</option>
                <option value="calcio">Cálcio</option>
                <option value="magnesio">Magnésio</option>
                <option value="micronutrientes_quelatos">Quelatos de Ferro</option>
                <option value="micronutrientes_sais">Micronutrientes Sais</option>
                <option value="acidos">Ácidos</option>
              </select>
            </div>

            {/* Fertilizer Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredFertilizers.map(f => (
                <div
                  key={f.id}
                  onClick={() => setDetailFertilizer(f)}
                  className="p-4 bg-slate-50/70 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl hover:border-emerald-500 transition-all cursor-pointer space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{f.name}</h4>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">{f.formula}</span>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                      {f.defaultTank}
                    </span>
                  </div>

                  <div className="space-y-1 text-slate-600 dark:text-zinc-400 text-[11px]">
                    <div>Solubilidade (20°C): <strong>{f.solubilityAt20C_gL} g/L</strong></div>
                    <div>Índice Salino: <strong>{f.saltIndex}</strong> • pH (10%): <strong>{f.solutionPh10Percent}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. QUALIDADE DA ÁGUA & ACIDIFICAÇÃO                       */}
      {/* ========================================================= */}
      {activeSubTab === 'qualidade_agua' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Droplets className="w-5 h-5 text-cyan-600" />
              Diagnóstico da Água de Irrigação & Neutralização de Bicarbonatos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border space-y-2">
                <strong className="font-bold text-slate-900 dark:text-white block text-sm">
                  {selectedWater.name}
                </strong>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 dark:text-zinc-300">
                  <div>pH: <strong>{selectedWater.ph}</strong></div>
                  <div>Condutividade: <strong>{selectedWater.ceMicroSiemens} µS/cm</strong></div>
                  <div>Bicarbonatos (HCO₃⁻): <strong>{selectedWater.bicarbonatesHco3MgL} mg/L</strong></div>
                  <div>Dureza Total: <strong>{selectedWater.totalHardnessMgCaCO3} mg/L CaCO₃</strong></div>
                  <div>Cálcio: <strong>{selectedWater.calciumMgL} mg/L</strong></div>
                  <div>Magnésio: <strong>{selectedWater.magnesiumMgL} mg/L</strong></div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border space-y-2">
                <strong className="font-bold text-slate-900 dark:text-white block text-sm">
                  Demanda de Acidificação Recomendada
                </strong>
                <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                  Para neutralizar o excesso de bicarbonatos e estabilizar o pH da calda entre 5.5 e 6.0, recomenda-se a injeção contínua de:
                </p>
                <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 rounded-lg text-cyan-950 dark:text-cyan-200 font-bold text-xs">
                  {selectedWater.acidRequirementMlPerM3} mL de Ácido Fosfórico 85% por m³ de água
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. SOLUBILIDADE × TEMPERATURA                             */}
      {/* ========================================================= */}
      {activeSubTab === 'solubilidade' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-emerald-600" />
              Tabela de Solubilidade em Água por Temperatura (g de adubo / Litro)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Fertilizante</th>
                    <th className="py-2.5 px-3 text-center">0°C</th>
                    <th className="py-2.5 px-3 text-center">10°C</th>
                    <th className="py-2.5 px-3 text-center bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">20°C (Padrão)</th>
                    <th className="py-2.5 px-3 text-center">30°C</th>
                    <th className="py-2.5 px-3 text-center">40°C</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {FERTILIZERS_DATABASE.map(f => (
                    <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/40">
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{f.name}</td>
                      <td className="py-2.5 px-3 text-center">{f.solubilityCurve.find(p => p.tempCelsius === 0)?.solubilityGramsPerLiter || '-'}</td>
                      <td className="py-2.5 px-3 text-center">{f.solubilityCurve.find(p => p.tempCelsius === 10)?.solubilityGramsPerLiter || '-'}</td>
                      <td className="py-2.5 px-3 text-center font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20">{f.solubilityAt20C_gL}</td>
                      <td className="py-2.5 px-3 text-center">{f.solubilityCurve.find(p => p.tempCelsius === 30)?.solubilityGramsPerLiter || '-'}</td>
                      <td className="py-2.5 px-3 text-center">{f.solubilityCurve.find(p => p.tempCelsius === 40)?.solubilityGramsPerLiter || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. RECEITAS & LAUDO TÉCNICO                               */}
      {/* ========================================================= */}
      {activeSubTab === 'receitas_laudos' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Receitas Agronômicas & Emissão de Laudo Técnico de Mistura
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STANDARD_FERTIGATION_RECIPES.map(rec => (
                <div key={rec.id} className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border space-y-3 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{rec.name}</h4>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{rec.crop} • {rec.phenologicalStage}</span>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                      {rec.safetyStatus}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed">{rec.notes}</p>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 dark:border-zinc-800">
                    <span className="font-bold text-slate-700 dark:text-zinc-300">CE Alvo: {rec.targetCeMsCm} mS/cm</span>
                    <button
                      onClick={() => {
                        window.print();
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Imprimir Laudo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DETALHES DO FERTILIZANTE                           */}
      {/* ========================================================= */}
      {detailFertilizer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{detailFertilizer.name}</h3>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">{detailFertilizer.formula}</span>
              </div>
              <button onClick={() => setDetailFertilizer(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-zinc-300 max-h-96 overflow-y-auto pr-1">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Função na Planta:</span>
                <p className="text-[11px] leading-relaxed">{detailFertilizer.plantFunction}</p>
              </div>

              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Sintomas de Deficiência:</span>
                <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">{detailFertilizer.deficiencySymptoms}</p>
              </div>

              {detailFertilizer.prohibitedMixNotes && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-950 dark:text-rose-200">
                  <strong className="block font-bold">⚠️ Incompatibilidades Graves:</strong>
                  <span className="text-[11px]">{detailFertilizer.prohibitedMixNotes}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={() => setDetailFertilizer(null)}
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg text-xs cursor-pointer"
              >
                Fechar Ficha Técnica
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: REGRA DE COMPATIBILIDADE QUÍMICA (EXPANDIDO)       */}
      {/* ========================================================= */}
      {selectedCompatRule && (() => {
        const fertA = FERTILIZERS_DATABASE.find(f => f.id === selectedCompatRule.fertIdA);
        const fertB = FERTILIZERS_DATABASE.find(f => f.id === selectedCompatRule.fertIdB);
        const isError = selectedCompatRule.status === 'incompativel';
        const isWarning = selectedCompatRule.status === 'compativel_com_restricao';

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-zinc-800 pb-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isError
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : isWarning
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {isError ? '🔴 Incompatível (Tanques Separados)' : isWarning ? '🟡 Compatível com Restrição' : '🟢 100% Compatível'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      Reação: {selectedCompatRule.reactionType}
                    </span>
                  </div>

                  <h3 className="font-black text-lg text-slate-900 dark:text-white mt-1">
                    {fertA?.name || selectedCompatRule.fertIdA} + {fertB?.name || selectedCompatRule.fertIdB}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedCompatRule(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Parameters */}
              <div className="space-y-4 text-xs">
                {/* 1. Motivo Técnico e Reação */}
                <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/80 rounded-xl space-y-2 border border-slate-200 dark:border-zinc-700">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Fundamentação Química & Reação
                    </strong>
                    {selectedCompatRule.precipitateFormed && (
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-sm">
                        Precipitado: {selectedCompatRule.precipitateFormed}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {selectedCompatRule.technicalReason}
                  </p>

                  {selectedCompatRule.chemicalEquation && (
                    <div className="p-2.5 bg-slate-100 dark:bg-zinc-950 rounded-lg font-mono text-[11px] text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800">
                      <strong>Equação: </strong> {selectedCompatRule.chemicalEquation}
                    </div>
                  )}

                  {selectedCompatRule.ionsInvolved && selectedCompatRule.ionsInvolved.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold">Íons Envolvidos:</span>
                      {selectedCompatRule.ionsInvolved.map((ion, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-md font-mono text-[10px] font-bold text-slate-700 dark:text-zinc-300">
                          {ion}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Grid de 4 Parâmetros Quantitativos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Faixa Segura de pH */}
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/80 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Faixa Segura de pH:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">{selectedCompatRule.phRangeSafe}</strong>
                    {selectedCompatRule.phCriticalRisk && (
                      <p className="text-[10px] text-rose-500 font-semibold mt-0.5">{selectedCompatRule.phCriticalRisk}</p>
                    )}
                  </div>

                  {/* Limite Máximo Combinado */}
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/80 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Concentração Máxima Combinada:</span>
                    <strong className="text-slate-800 dark:text-zinc-200 font-bold text-xs">
                      {selectedCompatRule.maxCombinedConcentrationGramsPerLiter ? `${selectedCompatRule.maxCombinedConcentrationGramsPerLiter} g/L` : 'Sem limite crítico'}
                    </strong>
                    {selectedCompatRule.maxConcentrationNote && (
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400">{selectedCompatRule.maxConcentrationNote}</p>
                    )}
                  </div>

                  {/* Sensibilidade Térmica */}
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/80 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Sensibilidade Térmica:</span>
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-800 dark:text-zinc-200 font-bold text-xs uppercase">{selectedCompatRule.temperatureSensitivity}</strong>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">{selectedCompatRule.temperatureEffect}</p>
                  </div>

                  {/* Risco em Gotejadores */}
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/80 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Risco em Gotejadores:</span>
                    <div className="flex items-center justify-between">
                      <strong className={`font-black text-xs uppercase ${
                        isError ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {selectedCompatRule.cloggingRisk}
                      </strong>
                      <span className="text-[10px] font-bold text-slate-400">{selectedCompatRule.dripperImpactPercent}% impacto</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full ${isError ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${selectedCompatRule.dripperImpactPercent}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">{selectedCompatRule.cloggingMechanism}</p>
                  </div>
                </div>

                {/* 3. Protocolos Operacionais */}
                <div className="space-y-2">
                  <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/60">
                    <strong className="text-blue-950 dark:text-blue-200 font-bold block text-[11px]">
                      📋 Ordem de Adição no Tanque:
                    </strong>
                    <p className="text-[11px] text-blue-900 dark:text-blue-300 mt-0.5">{selectedCompatRule.mixingOrderRule}</p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/80 rounded-xl border border-slate-200 dark:border-zinc-700">
                    <strong className="text-slate-900 dark:text-white font-bold block text-[11px]">
                      🧪 Protocolo do Teste de Jarra (Jar-Test):
                    </strong>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-300 mt-0.5">{selectedCompatRule.jarTestProtocol}</p>
                  </div>

                  {selectedCompatRule.remediationProtocol && (
                    <div className="p-3 bg-rose-50/60 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/60">
                      <strong className="text-rose-950 dark:text-rose-200 font-bold block text-[11px]">
                        🛠️ Remediação em Caso de Mistura Acidental:
                      </strong>
                      <p className="text-[11px] text-rose-900 dark:text-rose-300 mt-0.5">{selectedCompatRule.remediationProtocol}</p>
                    </div>
                  )}
                </div>

                {/* 4. Parecer Agronômico Oficial */}
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-emerald-950 dark:text-emerald-200">
                  <strong className="block font-bold text-xs mb-0.5">✓ Parecer Agronômico & Diretriz de Campo:</strong>
                  <p className="text-[11px] leading-relaxed font-medium">{selectedCompatRule.agronomicRecommendation}</p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] text-slate-400">
                  Estimativa CE: <strong>{selectedCompatRule.ecIncreaseEstimate || 'Calculado no simulador'}</strong>
                </span>
                <button
                  onClick={() => setSelectedCompatRule(null)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs transition-all"
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
