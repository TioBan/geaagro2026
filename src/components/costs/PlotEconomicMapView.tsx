import React, { useState } from 'react';
import { PropertyCropSeason, EconomicKPIs, PlotRentabilityStatus } from '../../types/costs';
import { AlertTriangle, CheckCircle2, Filter, MapPin, TrendingDown, TrendingUp } from 'lucide-react';

interface PlotEconomicMapViewProps {
  season: PropertyCropSeason;
  kpis: EconomicKPIs;
}

interface PlotItem {
  id: string;
  name: string;
  areaHa: number;
  crop: string;
  totalCostHa: number;
  expectedRevenueHa: number;
  netMarginHa: number;
  marginPct: number;
  statusCategory: PlotRentabilityStatus;
}

export const PlotEconomicMapView: React.FC<PlotEconomicMapViewProps> = ({ season, kpis }) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const baseCost = kpis.costPerHa;
  const baseRev = kpis.grossRevenuePerHa;

  const plots: PlotItem[] = [
    {
      id: 'plot-01',
      name: 'Talhão 01 — Baixada Fértil',
      areaHa: 120,
      crop: season.crop || 'Cultura Principal',
      totalCostHa: Math.max(0, baseCost - 350),
      expectedRevenueHa: Math.max(0, baseRev + 400),
      netMarginHa: Math.max(0, baseRev + 400) - Math.max(0, baseCost - 350),
      marginPct: 41,
      statusCategory: 'high_profitability',
    },
    {
      id: 'plot-02',
      name: 'Talhão 02 — Chapada Norte',
      areaHa: 150,
      crop: season.crop || 'Cultura Principal',
      totalCostHa: baseCost + 120,
      expectedRevenueHa: Math.max(0, baseRev - 100),
      netMarginHa: Math.max(0, baseRev - 100) - (baseCost + 120),
      marginPct: 24,
      statusCategory: 'medium_profitability',
    },
    {
      id: 'plot-03',
      name: 'Talhão 03 — Encosta Leste',
      areaHa: 90,
      crop: season.crop || 'Cultura Principal',
      totalCostHa: baseCost + 480,
      expectedRevenueHa: Math.max(0, baseRev - 650),
      netMarginHa: Math.max(0, baseRev - 650) - (baseCost + 480),
      marginPct: 9,
      statusCategory: 'cost_attention',
    },
    {
      id: 'plot-04',
      name: 'Talhão 04 — Várzea Sul',
      areaHa: 90,
      crop: season.crop || 'Cultura Principal',
      totalCostHa: baseCost + 800,
      expectedRevenueHa: Math.max(0, baseRev - 1200),
      netMarginHa: Math.max(0, baseRev - 1200) - (baseCost + 800),
      marginPct: 2,
      statusCategory: 'low_profitability',
    },
  ];

  const filteredPlots = plots.filter((p) => filterStatus === 'all' || p.statusCategory === filterStatus);

  const getStatusMeta = (status: PlotRentabilityStatus) => {
    switch (status) {
      case 'high_profitability':
        return {
          label: 'Alta Rentabilidade (>35%)',
          textClass: 'text-emerald-600 dark:text-emerald-400',
          barClass: 'bg-emerald-500',
          Icon: CheckCircle2,
        };
      case 'medium_profitability':
        return {
          label: 'Rentabilidade Média (15–35%)',
          textClass: 'text-blue-600 dark:text-blue-400',
          barClass: 'bg-blue-500',
          Icon: TrendingUp,
        };
      case 'cost_attention':
        return {
          label: 'Atenção aos Custos (5–15%)',
          textClass: 'text-amber-600 dark:text-amber-400',
          barClass: 'bg-amber-500',
          Icon: AlertTriangle,
        };
      case 'low_profitability':
        return {
          label: 'Baixa Rentabilidade (<5%)',
          textClass: 'text-rose-600 dark:text-rose-400',
          barClass: 'bg-rose-500',
          Icon: TrendingDown,
        };
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Mapa Econômico por Talhão
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Classificação da eficiência de custo e margem estimada por talhão.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            aria-label="Filtrar talhões por rentabilidade"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 px-3 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg text-xs border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
          >
            <option value="all">Todos os Status</option>
            <option value="high_profitability">Alta Rentabilidade</option>
            <option value="medium_profitability">Rentabilidade Média</option>
            <option value="cost_attention">Atenção aos Custos</option>
            <option value="low_profitability">Baixa Rentabilidade</option>
          </select>
        </div>
      </div>

      {filteredPlots.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl border border-slate-200/80 dark:border-zinc-800 text-center text-xs text-slate-500 dark:text-zinc-400">
          Nenhum talhão corresponde ao filtro selecionado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPlots.map((plot) => {
            const meta = getStatusMeta(plot.statusCategory);
            const StatusIcon = meta.Icon;
            return (
              <div
                key={plot.id}
                className="p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${meta.textClass}`}>
                      <StatusIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{meta.label}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mt-1">{plot.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
                      {plot.areaHa} ha · {plot.crop}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800">
                    <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">Custo / ha</span>
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                      R$ {plot.totalCostHa.toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800">
                    <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">Receita / ha</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      R$ {plot.expectedRevenueHa.toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800">
                    <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">Margem</span>
                    <span className={`font-bold tabular-nums ${meta.textClass}`}>{plot.marginPct}%</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                    <span>Desempenho Econômico</span>
                    <span className="font-semibold text-slate-700 dark:text-zinc-300 tabular-nums">
                      R$ {plot.netMarginHa.toLocaleString('pt-BR')} / ha líquido
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${meta.barClass}`}
                      style={{ width: `${Math.max(5, Math.min(100, plot.marginPct * 2))}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
