import React, { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Info,
} from 'lucide-react';
import { loadCostModuleData } from '../../utils/costStorage';

interface DashboardKpiSectionProps {
  farmId?: string;
  totalCultivatedAreaHa: number;
  totalAreaHa: number;
  activeCropName?: string;
  activeCropTargetVPercent?: number;
  activeCropYieldTarget?: number;
  activeCropYieldUnit?: string;
  onNavigateToCosts?: () => void;
  onNavigateToCadastros?: () => void;
}

export const DashboardKpiSection: React.FC<DashboardKpiSectionProps> = ({
  farmId,
  totalCultivatedAreaHa,
  totalAreaHa,
  activeCropName,
  activeCropTargetVPercent,
  activeCropYieldTarget,
  activeCropYieldUnit,
  onNavigateToCosts,
  onNavigateToCadastros,
}) => {
  const [showBaseInfo, setShowBaseInfo] = useState<boolean>(false);
  const [highlightedMetric, setHighlightedMetric] = useState<'todos' | 'area' | 'custo' | 'colheita'>('todos');

  const cultivatedPercentage =
    totalAreaHa > 0 ? Math.round((totalCultivatedAreaHa / totalAreaHa) * 100) : 0;

  const cleanCropName = activeCropName?.trim() || '';
  const hasRegisteredCrop = cleanCropName.length > 0;

  const harvestForecast = useMemo(() => {
    if (
      !hasRegisteredCrop ||
      !activeCropYieldTarget ||
      activeCropYieldTarget <= 0 ||
      totalCultivatedAreaHa <= 0
    ) {
      return null;
    }

    const unitLower = (activeCropYieldUnit || '').toLowerCase();
    const totalVolume = Math.round(totalCultivatedAreaHa * activeCropYieldTarget);

    if (unitLower.includes('sc')) {
      const netTons = ((totalCultivatedAreaHa * activeCropYieldTarget * 60) / 1000).toLocaleString(
        'pt-BR',
        { maximumFractionDigits: 1 }
      );
      return {
        totalFormatted: totalVolume.toLocaleString('pt-BR'),
        unitLabel: 'sacas',
        refLabel: `${activeCropYieldTarget} ${activeCropYieldUnit || 'sc/ha'}`,
        detailLine: `Ref. ${activeCropYieldTarget} ${activeCropYieldUnit || 'sc/ha'} · ~${netTons} t líquidas`,
        formulaText: `${totalCultivatedAreaHa.toLocaleString('pt-BR')} ha × ${activeCropYieldTarget} sc/ha = ${totalVolume.toLocaleString('pt-BR')} sc`,
      };
    }

    if (unitLower.includes('@')) {
      const netTons = ((totalCultivatedAreaHa * activeCropYieldTarget * 15) / 1000).toLocaleString(
        'pt-BR',
        { maximumFractionDigits: 1 }
      );
      return {
        totalFormatted: totalVolume.toLocaleString('pt-BR'),
        unitLabel: '@',
        refLabel: `${activeCropYieldTarget} ${activeCropYieldUnit}`,
        detailLine: `Ref. ${activeCropYieldTarget} ${activeCropYieldUnit} · ~${netTons} t`,
        formulaText: `${totalCultivatedAreaHa.toLocaleString('pt-BR')} ha × ${activeCropYieldTarget} @/ha = ${totalVolume.toLocaleString('pt-BR')} @`,
      };
    }

    if (unitLower.includes('ton')) {
      return {
        totalFormatted: totalVolume.toLocaleString('pt-BR'),
        unitLabel: 't',
        refLabel: `${activeCropYieldTarget} ${activeCropYieldUnit}`,
        detailLine: `Ref. ${activeCropYieldTarget} ${activeCropYieldUnit}`,
        formulaText: `${totalCultivatedAreaHa.toLocaleString('pt-BR')} ha × ${activeCropYieldTarget} t/ha = ${totalVolume.toLocaleString('pt-BR')} t`,
      };
    }

    return {
      totalFormatted: totalVolume.toLocaleString('pt-BR'),
      unitLabel: activeCropYieldUnit || 'unid.',
      refLabel: `${activeCropYieldTarget} ${activeCropYieldUnit || ''}`.trim(),
      detailLine: `Ref. ${activeCropYieldTarget} ${activeCropYieldUnit || ''}`.trim(),
      formulaText: `${totalCultivatedAreaHa.toLocaleString('pt-BR')} ha × ${activeCropYieldTarget} = ${totalVolume.toLocaleString('pt-BR')}`,
    };
  }, [hasRegisteredCrop, activeCropYieldTarget, activeCropYieldUnit, totalCultivatedAreaHa]);

  // Cálculo dinâmico dos custos reais da propriedade (sem dados pré-preenchidos)
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
      const totalRecords =
        operations.length + implementations.length + labor.length + irrigation.length;

      const area = totalCultivatedAreaHa > 0 ? totalCultivatedAreaHa : totalAreaHa > 0 ? totalAreaHa : 0;
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

  const handleOpenMetric = (metric: 'area' | 'custo' | 'colheita') => {
    setShowBaseInfo(true);
    setHighlightedMetric(metric);
  };

  return (
    <section className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Indicadores consolidados de campo
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Ocupação agrícola, custo efetivo por hectare e estimativa de colheita.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            const next = !showBaseInfo;
            setShowBaseInfo(next);
            if (next) setHighlightedMetric('todos');
          }}
          className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 inline-flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap transition-colors cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{showBaseInfo ? 'Ocultar base de cálculo' : 'Base de cálculo'}</span>
          {showBaseInfo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Faixa Única de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800 overflow-hidden tabular-nums">
        <button
          type="button"
          onClick={() => handleOpenMetric('area')}
          className={`p-4 text-left transition-colors cursor-pointer hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 ${
            showBaseInfo && highlightedMetric === 'area' ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
          }`}
        >
          <span className="text-xs text-slate-500 dark:text-zinc-400 block">
            Área total plantada
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold text-slate-900 dark:text-zinc-100">
              {totalCultivatedAreaHa.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">ha</span>
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 block">
            {cultivatedPercentage}% da área total disponível
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleOpenMetric('custo')}
          className={`p-4 text-left transition-colors cursor-pointer hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 ${
            showBaseInfo && highlightedMetric === 'custo' ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
          }`}
        >
          <span className="text-xs text-slate-500 dark:text-zinc-400 block">
            Custo médio por hectare
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xs text-slate-500 dark:text-zinc-400">R$</span>
            <span className="text-2xl font-semibold text-slate-900 dark:text-zinc-100">
              {costCalculation.hasRealCosts
                ? costCalculation.costPerHa.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : '0,00'}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">/ha</span>
          </div>
          <span
            className={`text-[11px] mt-1 block ${
              costCalculation.hasRealCosts
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-slate-400 dark:text-zinc-500'
            }`}
          >
            {costCalculation.hasRealCosts
              ? `Apurado em ${costCalculation.totalRecords} lançamento(s)`
              : 'Nenhum custo lançado'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleOpenMetric('colheita')}
          className={`p-4 text-left transition-colors cursor-pointer hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 ${
            showBaseInfo && highlightedMetric === 'colheita' ? 'bg-sky-50/40 dark:bg-sky-950/20' : ''
          }`}
        >
          <span className="text-xs text-slate-500 dark:text-zinc-400 block">
            {hasRegisteredCrop ? `Previsão de colheita (${cleanCropName})` : 'Previsão de colheita'}
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold text-slate-900 dark:text-zinc-100">
              {harvestForecast ? harvestForecast.totalFormatted : '—'}
            </span>
            {harvestForecast && (
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                {harvestForecast.unitLabel}
              </span>
            )}
          </div>
          <span
            className={`text-[11px] mt-1 block ${
              harvestForecast
                ? 'text-slate-500 dark:text-zinc-400'
                : 'text-slate-400 dark:text-zinc-500'
            }`}
          >
            {harvestForecast
              ? harvestForecast.detailLine
              : hasRegisteredCrop
                ? 'Sem referência de produtividade'
                : 'Nenhuma cultura definida'}
          </span>
        </button>
      </div>

      {/* Painel Expansível de Metodologia (Single Elevation) */}
      {showBaseInfo && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Metodologia e fórmulas dos indicadores
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Recalculados automaticamente conforme talhões, amostras e lançamentos de custos são registrados.
              </p>
            </div>

            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800 self-start sm:self-auto">
              {(
                [
                  { id: 'todos', label: 'Todos' },
                  { id: 'area', label: 'Área' },
                  { id: 'custo', label: 'Custo' },
                  { id: 'colheita', label: 'Colheita' },
                ] as const
              ).map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setHighlightedMetric(tab.id)}
                  className={`h-6 px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    highlightedMetric === tab.id
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs tabular-nums">
            {(highlightedMetric === 'todos' || highlightedMetric === 'area') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900 dark:text-zinc-100">
                    1. Área plantada
                  </h4>
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">
                    {totalCultivatedAreaHa.toLocaleString('pt-BR')} ha
                  </span>
                </div>
                <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Somatório da área cultivável delimitada nas propriedades cadastradas.
                </p>
                <p className="font-mono text-[11px] text-slate-700 dark:text-zinc-300 pt-1 border-t border-slate-100 dark:border-zinc-800">
                  Taxa = ({totalCultivatedAreaHa} ÷ {totalAreaHa || 1}) × 100 = {cultivatedPercentage}%
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-500">
                  A diferença corresponde a APP, Reserva Legal, carreadores e benfeitorias.
                </p>
              </div>
            )}

            {(highlightedMetric === 'todos' || highlightedMetric === 'custo') && (
              <div className="space-y-2 md:border-l md:border-slate-100 md:dark:border-zinc-800 md:pl-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900 dark:text-zinc-100">
                    2. Custo por hectare
                  </h4>
                  <span className="font-medium text-amber-700 dark:text-amber-400">
                    {costCalculation.hasRealCosts
                      ? `R$ ${costCalculation.costPerHa.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}/ha`
                      : 'Sem lançamentos'}
                  </span>
                </div>
                {costCalculation.hasRealCosts ? (
                  <div className="space-y-1.5">
                    <p className="text-slate-600 dark:text-zinc-400">
                      COE apurado em {costCalculation.totalRecords} lançamento(s) reais:
                    </p>
                    <ul className="space-y-1 pt-1 border-t border-slate-100 dark:border-zinc-800">
                      {costCalculation.items.map(item => (
                        <li key={item.label} className="flex justify-between gap-2 text-[11px]">
                          <span className="text-slate-500 dark:text-zinc-400 truncate">
                            {item.label} ({item.percent}%)
                          </span>
                          <strong className="font-medium text-slate-800 dark:text-zinc-200 shrink-0">
                            R${' '}
                            {item.value.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </strong>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-1.5 border-t border-slate-100 dark:border-zinc-800 flex justify-between font-semibold text-slate-900 dark:text-zinc-100">
                      <span>Total acumulado</span>
                      <span>
                        R${' '}
                        {costCalculation.totalCost.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                      Nenhum custo operacional lançado para esta propriedade. Os valores refletem apenas registros reais do módulo de custos.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigateToCosts) {
                          onNavigateToCosts();
                        } else if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('app:navigate', { detail: { tab: 'custos' } }));
                        }
                      }}
                      className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      <span>Lançar em Gestão de Custos</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {(highlightedMetric === 'todos' || highlightedMetric === 'colheita') && (
              <div className="space-y-2 md:border-l md:border-slate-100 md:dark:border-zinc-800 md:pl-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900 dark:text-zinc-100">
                    3. Previsão de colheita
                  </h4>
                  <span className="font-medium text-sky-700 dark:text-sky-400">
                    {harvestForecast
                      ? harvestForecast.refLabel
                      : hasRegisteredCrop
                        ? cleanCropName
                        : 'Sem cultura'}
                  </span>
                </div>
                {harvestForecast ? (
                  <>
                    <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                      Estimativa de produção baseada na cultura cadastrada nos talhões ({cleanCropName}).
                    </p>
                    <p className="font-mono text-[11px] text-slate-700 dark:text-zinc-300 pt-1 border-t border-slate-100 dark:border-zinc-800">
                      {harvestForecast.formulaText}
                    </p>
                    {activeCropTargetVPercent !== undefined && (
                      <p className="text-[11px] text-slate-500 dark:text-zinc-500">
                        Meta de saturação por bases (V%): {activeCropTargetVPercent}% para máxima eficiência produtiva.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                      {hasRegisteredCrop
                        ? `Cultura registrada (${cleanCropName}) sem área plantada ou referência de produtividade vinculada.`
                        : 'Nenhuma cultura definida nos talhões desta propriedade. Cadastre a cultura do talhão para exibir a previsão de colheita.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigateToCadastros) {
                          onNavigateToCadastros();
                        } else if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('app:navigate', { detail: { tab: 'cadastros' } }));
                        }
                      }}
                      className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      <span>Definir cultura em Gestão Agronômica</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
