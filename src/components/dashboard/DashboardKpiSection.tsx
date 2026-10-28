import React, { useState, useMemo } from 'react';
import {
  Calculator,
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Info,
  Layers,
  TrendingUp,
  Leaf,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { loadCostModuleData } from '../../utils/costStorage';

interface DashboardKpiSectionProps {
  farmId?: string;
  totalCultivatedAreaHa: number;
  totalAreaHa: number;
  activeCropName?: string;
  activeCropTargetVPercent?: number;
  onNavigateToCosts?: () => void;
}

export const DashboardKpiSection: React.FC<DashboardKpiSectionProps> = ({
  farmId,
  totalCultivatedAreaHa,
  totalAreaHa,
  activeCropName = 'Soja',
  activeCropTargetVPercent = 70,
  onNavigateToCosts,
}) => {
  const [showBaseInfo, setShowBaseInfo] = useState<boolean>(true);
  const [highlightedMetric, setHighlightedMetric] = useState<'todos' | 'area' | 'custo' | 'colheita'>('todos');

  const cultivatedPercentage = Math.round((totalCultivatedAreaHa / (totalAreaHa || 1)) * 100);
  const totalBagsHarvestForecast = Math.round(totalCultivatedAreaHa * 74);
  const netTonsForecast = ((totalCultivatedAreaHa * 74 * 60) / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 });

  // Cálculo Dinâmico dos Custos Reais da Propriedade (Sem dados fictícios/pré-preenchidos)
  const costCalculation = useMemo(() => {
    try {
      const data = loadCostModuleData();
      const operations = (data.operations || []).filter(op => !farmId || op.farmId === farmId);
      const implementations = (data.implementations || []).filter(imp => !farmId || imp.farmId === farmId);
      const labor = (data.labor || []).filter(lab => !farmId || lab.farmId === farmId);
      const irrigation = (data.irrigation || []).filter(irr => !farmId || irr.farmId === farmId);

      const opsCost = operations.reduce((sum, op) => sum + (Number(op.totalOperationCost) || 0), 0);
      const implCost = implementations.reduce((sum, imp) => sum + (Number(imp.totalCost) || 0), 0);
      const laborCost = labor.reduce((sum, lab) => sum + (Number(lab.totalCost) || 0), 0);
      const irrCost = irrigation.reduce((sum, irr) => sum + (Number(irr.totalIrrigationCost) || 0), 0);

      const totalCost = opsCost + implCost + laborCost + irrCost;
      const totalRecords = operations.length + implementations.length + labor.length + irrigation.length;

      const area = totalCultivatedAreaHa > 0 ? totalCultivatedAreaHa : (totalAreaHa > 0 ? totalAreaHa : 0);
      const costPerHa = area > 0 && totalCost > 0 ? totalCost / area : 0;

      const items: { label: string; value: number; percent: number }[] = [];
      if (totalCost > 0) {
        if (opsCost > 0) {
          items.push({
            label: 'Operações Agrícolas & Tratos',
            value: opsCost,
            percent: Math.round((opsCost / totalCost) * 100),
          });
        }
        if (implCost > 0) {
          items.push({
            label: 'Insumos & Implantação',
            value: implCost,
            percent: Math.round((implCost / totalCost) * 100),
          });
        }
        if (laborCost > 0) {
          items.push({
            label: 'Mão de Obra Operacional',
            value: laborCost,
            percent: Math.round((laborCost / totalCost) * 100),
          });
        }
        if (irrCost > 0) {
          items.push({
            label: 'Irrigação & Energia',
            value: irrCost,
            percent: Math.round((irrCost / totalCost) * 100),
          });
        }
      }

      return {
        hasRealCosts: totalCost > 0 && totalRecords > 0,
        totalCost,
        totalRecords,
        costPerHa,
        items,
      };
    } catch {
      return {
        hasRealCosts: false,
        totalCost: 0,
        totalRecords: 0,
        costPerHa: 0,
        items: [],
      };
    }
  }, [farmId, totalCultivatedAreaHa, totalAreaHa]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Indicadores Consolidados de Campo
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            Métricas consolidadas de ocupação, custos referenciais e projeção de colheita.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowBaseInfo(!showBaseInfo);
            if (!showBaseInfo) setHighlightedMetric('todos');
          }}
          className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-3xs ${
            showBaseInfo
              ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
              : 'bg-white dark:bg-zinc-900 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-50 dark:hover:bg-zinc-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>{showBaseInfo ? 'Ocultar Base de Cálculo' : 'Como é calculada a base?'}</span>
          {showBaseInfo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* KPI 1: Área Total Plantada */}
        <div
          onClick={() => {
            setShowBaseInfo(true);
            setHighlightedMetric('area');
          }}
          className={`bg-white dark:bg-zinc-950 border rounded-2xl p-5 shadow-3xs flex items-center justify-between gap-4 transition-all cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700/60 ${
            showBaseInfo && (highlightedMetric === 'area' || highlightedMetric === 'todos')
              ? 'border-emerald-500 ring-2 ring-emerald-500/10'
              : 'border-slate-100 dark:border-zinc-800'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-black tracking-wider block">
                Área Total Plantada
              </span>
              <Info className="w-3 h-3 text-slate-400 hover:text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">
                {totalCultivatedAreaHa.toLocaleString('pt-BR')}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">ha</span>
            </div>
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block">
              ★ {cultivatedPercentage}% do total disponível
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Custo Médio por Hectare */}
        <div
          onClick={() => {
            setShowBaseInfo(true);
            setHighlightedMetric('custo');
          }}
          className={`bg-white dark:bg-zinc-950 border rounded-2xl p-5 shadow-3xs flex items-center justify-between gap-4 transition-all cursor-pointer hover:border-amber-300 dark:hover:border-amber-700/60 ${
            showBaseInfo && (highlightedMetric === 'custo' || highlightedMetric === 'todos')
              ? 'border-amber-500 ring-2 ring-amber-500/10'
              : 'border-slate-100 dark:border-zinc-800'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-black tracking-wider block">
                Custo Médio por Hectare
              </span>
              <Info className="w-3 h-3 text-slate-400 hover:text-amber-600" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">R$</span>
              <span className="text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">
                {costCalculation.hasRealCosts
                  ? costCalculation.costPerHa.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : '0,00'}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">/ha</span>
            </div>
            <span className={`text-[9px] block ${costCalculation.hasRealCosts ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-400 dark:text-zinc-500'}`}>
              {costCalculation.hasRealCosts ? 'Base: Lançamentos da safra' : 'Nenhum custo lançado'}
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-100 dark:border-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Previsão de Colheita */}
        <div
          onClick={() => {
            setShowBaseInfo(true);
            setHighlightedMetric('colheita');
          }}
          className={`bg-white dark:bg-zinc-950 border rounded-2xl p-5 shadow-3xs flex items-center justify-between gap-4 transition-all cursor-pointer hover:border-blue-300 dark:hover:border-blue-700/60 ${
            showBaseInfo && (highlightedMetric === 'colheita' || highlightedMetric === 'todos')
              ? 'border-blue-500 ring-2 ring-blue-500/10'
              : 'border-slate-100 dark:border-zinc-800'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-black tracking-wider block">
                Previsão de Colheita
              </span>
              <Info className="w-3 h-3 text-slate-400 hover:text-blue-600" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">
                {totalBagsHarvestForecast.toLocaleString('pt-BR')}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">sc</span>
            </div>
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block">
              ↑ Base: Média de 74 sc/ha
            </span>
          </div>
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Leaf className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Card Informativo Detalhado sobre a Base de Cálculo */}
      {showBaseInfo && (
        <div className="bg-white dark:bg-zinc-950 border border-emerald-200/80 dark:border-emerald-800/40 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-zinc-100">
                    Entenda como é calculada a base desses dados
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                    Metodologia & Benchmarks
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Fundamentação técnica, fórmulas matemáticas e fontes referenciais utilizadas nos indicadores acima.
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setHighlightedMetric('todos')}
                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  highlightedMetric === 'todos'
                    ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-3xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
              >
                Ver Todos
              </button>
              <button
                type="button"
                onClick={() => setHighlightedMetric('area')}
                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  highlightedMetric === 'area'
                    ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-3xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
              >
                Área
              </button>
              <button
                type="button"
                onClick={() => setHighlightedMetric('custo')}
                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  highlightedMetric === 'custo'
                    ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-3xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
              >
                Custo
              </button>
              <button
                type="button"
                onClick={() => setHighlightedMetric('colheita')}
                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  highlightedMetric === 'colheita'
                    ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-3xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
              >
                Colheita
              </button>
            </div>
          </div>

          {/* 3 Pillars Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pillar 1: Área Total Plantada */}
            {(highlightedMetric === 'todos' || highlightedMetric === 'area') && (
              <div className="bg-slate-50/70 dark:bg-zinc-900/60 rounded-xl p-4 border border-emerald-100 dark:border-emerald-950/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-zinc-200">
                      1. Área Total Plantada
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/40">
                    {totalCultivatedAreaHa} ha
                  </span>
                </div>

                <div className="space-y-2 text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                  <p>
                    <strong>Origem da Base:</strong> Somatório da área agricultável delimitada nos talhões cadastrados da propriedade ativa.
                  </p>
                  <div className="p-2.5 bg-white dark:bg-zinc-950 rounded-lg border border-slate-200/70 dark:border-zinc-800 text-[10px] space-y-1">
                    <span className="font-bold text-slate-700 dark:text-zinc-300 block">Fórmula de Aproveitamento:</span>
                    <code className="text-emerald-700 dark:text-emerald-400 font-mono block">
                      Taxa (%) = ({totalCultivatedAreaHa} ha ÷ {totalAreaHa || 1} ha) × 100 = {cultivatedPercentage}%
                    </code>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-500">
                    • <em>Nota:</em> O percentual restante corresponde a Áreas de Preservação Permanente (APP), Reserva Legal, estradas internas e instalações prediais.
                  </p>
                </div>
              </div>
            )}

            {/* Pillar 2: Custo Médio por Hectare */}
            {(highlightedMetric === 'todos' || highlightedMetric === 'custo') && (
              <div className="bg-slate-50/70 dark:bg-zinc-900/60 rounded-xl p-4 border border-amber-100 dark:border-amber-950/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-zinc-200">
                      2. Custo Médio por Hectare
                    </h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    costCalculation.hasRealCosts
                      ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900/40'
                      : 'text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700'
                  }`}>
                    {costCalculation.hasRealCosts
                      ? `R$ ${costCalculation.costPerHa.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/ha`
                      : 'Sem lançamentos'}
                  </span>
                </div>

                <div className="space-y-2 text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                  <p>
                    <strong>Origem da Base:</strong> {costCalculation.hasRealCosts 
                      ? `Custo Operacional Efetivo (COE) calculado a partir de ${costCalculation.totalRecords} lançamento(s) reais registrados na propriedade ativa.`
                      : 'Custo apurado dinamicamente a partir dos lançamentos reais de operações, insumos e serviços no módulo de Gestão de Custos.'}
                  </p>
                  
                  {costCalculation.hasRealCosts ? (
                    <div className="p-2.5 bg-white dark:bg-zinc-950 rounded-lg border border-slate-200/70 dark:border-zinc-800 text-[10px] space-y-1">
                      <span className="font-bold text-slate-700 dark:text-zinc-300 block">Composição Real dos Custos:</span>
                      <ul className="space-y-0.5 text-[10px]">
                        {costCalculation.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between">
                            <span>• {item.label} ({item.percent}%):</span>
                            <strong className="text-slate-700 dark:text-zinc-300">
                              R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </strong>
                          </li>
                        ))}
                      </ul>
                      <div className="pt-1.5 mt-1.5 border-t border-slate-100 dark:border-zinc-800 flex justify-between font-bold text-slate-800 dark:text-zinc-200">
                        <span>Total Acumulado:</span>
                        <span>R$ {costCalculation.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200/60 dark:border-amber-900/40 text-[11px] space-y-1.5">
                      <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold">
                        <Info className="w-3.5 h-3.5 shrink-0" />
                        <span>Nenhum custo operacional lançado para esta propriedade.</span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-zinc-400">
                        Os dados não contêm valores fictícios ou pré-preenchidos. Lance operações, insumos ou serviços na aba Gestão de Custos para apurar o custo real por hectare.
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onNavigateToCosts) {
                            onNavigateToCosts();
                          } else if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('app:navigate', { detail: { tab: 'custos' } }));
                          }
                        }}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:underline cursor-pointer pt-0.5"
                      >
                        Acessar Gestão de Custos →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pillar 3: Previsão de Colheita */}
            {(highlightedMetric === 'todos' || highlightedMetric === 'colheita') && (
              <div className="bg-slate-50/70 dark:bg-zinc-900/60 rounded-xl p-4 border border-blue-100 dark:border-blue-950/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                      <Leaf className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-zinc-200">
                      3. Previsão de Colheita
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900/40">
                    74 sc/ha
                  </span>
                </div>

                <div className="space-y-2 text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                  <p>
                    <strong>Origem da Base:</strong> Projeção agronômica de produtividade média para a cultura de {activeCropName} (sacas padrão de 60 kg).
                  </p>
                  <div className="p-2.5 bg-white dark:bg-zinc-950 rounded-lg border border-slate-200/70 dark:border-zinc-800 text-[10px] space-y-1">
                    <span className="font-bold text-slate-700 dark:text-zinc-300 block">Fórmula de Produção Total:</span>
                    <code className="text-blue-700 dark:text-blue-400 font-mono block">
                      Volume = {totalCultivatedAreaHa} ha × 74 sc/ha = {totalBagsHarvestForecast.toLocaleString('pt-BR')} sacas
                    </code>
                    <span className="text-[9px] text-slate-500 block">
                      Equivale a ~{netTonsForecast} toneladas líquidas.
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-500">
                    • <em>Fator de Otimização:</em> Corrigir a saturação por bases (V% para {activeCropTargetVPercent}%) e neutralizar o alumínio tóxico elevam a eficiência para superar a meta.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Informative Footer Note */}
          <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between text-[11px] text-emerald-900 dark:text-emerald-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              Os dados recalculam automaticamente sempre que novos talhões, amostras de solo ou custos forem cadastrados nas propriedades.
            </span>
            <button
              type="button"
              onClick={() => setShowBaseInfo(false)}
              className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline ml-3 shrink-0 cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
