import React from 'react';
import {
  PropertyCropSeason,
  EconomicKPIs,
  AgriculturalOperationCost,
  CommercializationRecord,
  InputItem,
} from '../../types/costs';
import { isFertilizerInput } from '../../utils/costStorage';
import { AlertTriangle, BarChart3, DollarSign, PieChart as PieChartIcon, Scale, TrendingUp } from 'lucide-react';

interface FinancialDashboardViewProps {
  season: PropertyCropSeason;
  kpis: EconomicKPIs;
  operations: AgriculturalOperationCost[];
  sales: CommercializationRecord[];
  inputs?: InputItem[];
  onNavigateToInputs?: () => void;
}

export const FinancialDashboardView: React.FC<FinancialDashboardViewProps> = ({
  season,
  kpis,
  operations,
  sales,
  inputs = [],
  onNavigateToInputs,
}) => {
  const categoryTotals: Record<string, number> = {};
  (operations || [])
    .filter((o) => o.seasonId === season.id)
    .forEach((op) => {
      categoryTotals[op.operationType] = (categoryTotals[op.operationType] || 0) + (op.totalOperationCost || 0);
    });

  const categoryArray = Object.entries(categoryTotals)
    .map(([name, total]) => ({
      name,
      total,
      pct: kpis.totalSeasonCost > 0 ? Math.round((total / kpis.totalSeasonCost) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const seasonSalesCount = (sales || []).filter((s) => s.seasonId === season.id).length;
  const criticalFertilizers = inputs.filter(
    (item) => isFertilizerInput(item) && item.currentStock <= (item.minStockAlert || 0)
  );

  return (
    <div className="space-y-5">
      {/* Unified 4-KPI Strip */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-zinc-800">
          <div className="p-4 space-y-1">
            <div className="flex justify-between items-center text-slate-500 dark:text-zinc-400 text-xs font-medium">
              <span>Custo Total da Safra</span>
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
              R$ {kpis.totalSeasonCost.toLocaleString('pt-BR')}
            </div>
            <div className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
              R$ {kpis.costPerHa.toLocaleString('pt-BR')}/ha · {season.plantedAreaHa.toLocaleString('pt-BR')} ha
            </div>
          </div>

          <div className="p-4 space-y-1">
            <div className="flex justify-between items-center text-slate-500 dark:text-zinc-400 text-xs font-medium">
              <span>Receita Realizada / Projetada</span>
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
              R$ {kpis.grossRevenueTotal.toLocaleString('pt-BR')}
            </div>
            <div className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
              R$ {kpis.grossRevenuePerHa.toLocaleString('pt-BR')}/ha · {kpis.totalBagsHarvested.toLocaleString('pt-BR')} sc ({seasonSalesCount} contratos)
            </div>
          </div>

          <div className="p-4 space-y-1">
            <div className="flex justify-between items-center text-slate-500 dark:text-zinc-400 text-xs font-medium">
              <span>Margem Líquida</span>
              <span
                className={`text-xs font-semibold tabular-nums ${
                  kpis.netMarginPct >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {kpis.netMarginPct}%
              </span>
            </div>
            <div
              className={`text-2xl font-bold tabular-nums ${
                kpis.netMarginTotal >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              R$ {kpis.netMarginTotal.toLocaleString('pt-BR')}
            </div>
            <div className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
              ROI: <span className="font-semibold text-slate-700 dark:text-zinc-200">{kpis.roiPct}%</span> sobre CTP
            </div>
          </div>

          <div className="p-4 space-y-1">
            <div className="flex justify-between items-center text-slate-500 dark:text-zinc-400 text-xs font-medium">
              <span>Ponto de Equilíbrio</span>
              <Scale className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {kpis.breakEvenYieldBagsHa.toFixed(1)} sc/ha
            </div>
            <div className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
              Preço mín.: <span className="font-semibold text-slate-700 dark:text-zinc-200">R$ {kpis.breakEvenPricePerBag.toFixed(2)}/sc</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Critical Stock Notice if applicable */}
      {criticalFertilizers.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/20">
          <div className="flex items-center gap-2.5 text-xs text-rose-800 dark:text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>
              <strong className="font-semibold tabular-nums">{criticalFertilizers.length}</strong> fertilizante
              {criticalFertilizers.length > 1 ? 's' : ''} abaixo do ponto crítico mínimo em estoque.
            </span>
          </div>
          {onNavigateToInputs && (
            <button
              type="button"
              onClick={onNavigateToInputs}
              className="h-8 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              Verificar Almoxarifado
            </button>
          )}
        </div>
      )}

      {/* Grid: Composição dos Custos + Resumo DRE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Composição por Operação / Categoria */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Distribuição dos Custos por Operação
          </h3>

          <div className="space-y-3">
            {categoryArray.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-zinc-500 py-8 text-center">
                Nenhum custo operacional registrado para esta safra.
              </p>
            ) : (
              categoryArray.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-700 dark:text-zinc-300">
                    <span className="font-medium">{cat.name}</span>
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                      R$ {cat.total.toLocaleString('pt-BR')} ({cat.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
                      style={{ width: `${cat.pct}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* DRE Agrícola Sintético */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Demonstrativo do Resultado do Exercício (DRE Agrícola)
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs text-slate-700 dark:text-zinc-300">
            <div className="py-2.5 flex justify-between font-semibold text-slate-900 dark:text-zinc-100 text-sm">
              <span>(+) Receita Bruta de Vendas</span>
              <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">
                R$ {kpis.grossRevenueTotal.toLocaleString('pt-BR')}
              </span>
            </div>

            <div className="py-2.5 flex justify-between">
              <span>(-) Custo Operacional Efetivo (COE)</span>
              <span className="text-rose-600 dark:text-rose-400 tabular-nums">
                R$ {kpis.coe.toLocaleString('pt-BR')} / ha
              </span>
            </div>

            <div className="py-2.5 flex justify-between font-medium">
              <span>(=) Margem Bruta de Produção</span>
              <span className="text-slate-900 dark:text-zinc-100 tabular-nums">
                R$ {kpis.grossMarginTotal.toLocaleString('pt-BR')}
              </span>
            </div>

            <div className="py-2.5 flex justify-between">
              <span>(-) Depreciação de Máquinas e Benfeitorias</span>
              <span className="text-rose-600 dark:text-rose-400 tabular-nums">
                R$ {(kpis.cot - kpis.coe).toLocaleString('pt-BR')} / ha
              </span>
            </div>

            <div className="py-2.5 flex justify-between">
              <span>(-) Remuneração do Capital / Terra (CTP)</span>
              <span className="text-rose-600 dark:text-rose-400 tabular-nums">
                R$ {(kpis.ctp - kpis.cot).toLocaleString('pt-BR')} / ha
              </span>
            </div>

            <div className="pt-3 mt-1 flex justify-between items-center font-bold text-sm text-slate-900 dark:text-zinc-100 bg-slate-50/80 dark:bg-zinc-950/60 px-3 py-2.5 rounded-lg border border-slate-200/70 dark:border-zinc-800">
              <span>(=) Lucro / Resultado Líquido Final</span>
              <span
                className={`tabular-nums ${
                  kpis.netMarginTotal >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                R$ {kpis.netMarginTotal.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
