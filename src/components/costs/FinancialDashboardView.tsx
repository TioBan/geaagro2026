import React from 'react';
import { PropertyCropSeason, EconomicKPIs, AgriculturalOperationCost, CommercializationRecord, InputItem } from '../../types/costs';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  Calendar,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';

interface FinancialDashboardViewProps {
  season: PropertyCropSeason;
  kpis: EconomicKPIs;
  operations: AgriculturalOperationCost[];
  sales: CommercializationRecord[];
}

export const FinancialDashboardView: React.FC<FinancialDashboardViewProps> = ({
  season,
  kpis,
  operations,
  sales,
}) => {
  // Costs by operation type (Category breakdown)
  const categoryTotals: Record<string, number> = {};
  (operations || []).filter(o => o.seasonId === season.id).forEach(op => {
    categoryTotals[op.operationType] = (categoryTotals[op.operationType] || 0) + (op.totalOperationCost || 0);
  });

  const categoryArray = Object.entries(categoryTotals).map(([name, total]) => ({
    name,
    total,
    pct: kpis.totalSeasonCost > 0 ? Math.round((total / kpis.totalSeasonCost) * 100) : 0,
  })).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      {/* Top Main KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Custo Total da Safra</span>
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-zinc-100">
            R$ {kpis.totalSeasonCost.toLocaleString('pt-BR')}
          </div>
          <div className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1">
            <span className="font-bold text-slate-700 dark:text-zinc-300">R$ {kpis.costPerHa} / ha</span>
            <span>({season.plantedAreaHa} ha)</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Receita Realizada / Projetada</span>
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-zinc-100">
            R$ {kpis.grossRevenueTotal.toLocaleString('pt-BR')}
          </div>
          <div className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1">
            <span className="font-bold text-slate-700 dark:text-zinc-300">R$ {kpis.grossRevenuePerHa} / ha</span>
            <span>({kpis.totalBagsHarvested} sacas)</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Margem Líquida</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${kpis.netMarginPct >= 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'}`}>
              {kpis.netMarginPct}%
            </span>
          </div>
          <div className={`text-3xl font-black ${kpis.netMarginTotal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            R$ {kpis.netMarginTotal.toLocaleString('pt-BR')}
          </div>
          <div className="text-xs text-slate-500 dark:text-zinc-400">
            ROI: <strong className="text-slate-800 dark:text-zinc-200">{kpis.roiPct}%</strong> sobre investimento total
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Ponto de Equilíbrio</span>
            <Scale className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
            {kpis.breakEvenYieldBagsHa.toFixed(1)} sc/ha
          </div>
          <div className="text-xs text-slate-500 dark:text-zinc-400">
            Preço mín. de venda: <strong className="text-slate-800 dark:text-zinc-200">R$ {kpis.breakEvenPricePerBag.toFixed(2)}/sc</strong>
          </div>
        </div>
      </div>

      {/* Grid: Composição dos Custos + Resumo DRE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Composição por Operação / Categoria */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Distribuição dos Custos por Operação
          </h3>

          <div className="space-y-3 pt-2">
            {categoryArray.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-6 text-center">Nenhum custo registrado para esta safra.</p>
            ) : (
              categoryArray.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-zinc-300">
                    <span>{cat.name}</span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100">
                      R$ {cat.total.toLocaleString('pt-BR')} ({cat.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
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
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Demonstrativo do Resultado do Exercício (DRE Agrícola)
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs text-slate-700 dark:text-zinc-300">
            <div className="py-2.5 flex justify-between font-bold text-slate-900 dark:text-zinc-100 text-sm">
              <span>(+) Receita Bruta de Vendas</span>
              <span className="text-emerald-600 dark:text-emerald-400">R$ {kpis.grossRevenueTotal.toLocaleString('pt-BR')}</span>
            </div>

            <div className="py-2.5 flex justify-between">
              <span>(-) Custo Operacional Efetivo (COE)</span>
              <span className="text-rose-600 dark:text-rose-400">R$ {kpis.coe.toLocaleString('pt-BR')} / ha</span>
            </div>

            <div className="py-2.5 flex justify-between font-semibold">
              <span>(=) Margem Bruta de Produção</span>
              <span className="text-slate-900 dark:text-zinc-100">R$ {kpis.grossMarginTotal.toLocaleString('pt-BR')}</span>
            </div>

            <div className="py-2.5 flex justify-between">
              <span>(-) Depreciação de Máquinas e Benfeitorias</span>
              <span className="text-rose-600 dark:text-rose-400">R$ {(kpis.cot - kpis.coe).toLocaleString('pt-BR')} / ha</span>
            </div>

            <div className="py-2.5 flex justify-between">
              <span>(-) Remuneração do Capital / Terra (CTP)</span>
              <span className="text-rose-600 dark:text-rose-400">R$ {(kpis.ctp - kpis.cot).toLocaleString('pt-BR')} / ha</span>
            </div>

            <div className="py-3 flex justify-between font-black text-base text-slate-900 dark:text-zinc-100 bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl mt-2">
              <span>(=) Lucro / Resultado Líquido Final</span>
              <span className={kpis.netMarginTotal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                R$ {kpis.netMarginTotal.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
