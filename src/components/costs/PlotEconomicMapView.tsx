import React, { useState } from 'react';
import { PropertyCropSeason, EconomicKPIs, PlotRentabilityStatus } from '../../types/costs';
import { getPlotRentabilityCategory } from '../../utils/costStorage';
import { MapPin, Filter, Layers, DollarSign, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface PlotEconomicMapViewProps {
  season: PropertyCropSeason;
  kpis: EconomicKPIs;
}

interface PlotMockItem {
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

  // Generate plot representations for the property
  const plots: PlotMockItem[] = [
    {
      id: 'plot-01',
      name: 'Talhão 01 — Baixada Fértil',
      areaHa: 120,
      crop: season.crop,
      totalCostHa: kpis.costPerHa - 350,
      expectedRevenueHa: kpis.grossRevenuePerHa + 400,
      netMarginHa: kpis.grossRevenuePerHa + 400 - (kpis.costPerHa - 350),
      marginPct: 41,
      statusCategory: 'high_profitability',
    },
    {
      id: 'plot-02',
      name: 'Talhão 02 — Chapada Norte',
      areaHa: 150,
      crop: season.crop,
      totalCostHa: kpis.costPerHa + 120,
      expectedRevenueHa: kpis.grossRevenuePerHa - 100,
      netMarginHa: kpis.grossRevenuePerHa - 100 - (kpis.costPerHa + 120),
      marginPct: 24,
      statusCategory: 'medium_profitability',
    },
    {
      id: 'plot-03',
      name: 'Talhão 03 — Encosta Leste',
      areaHa: 90,
      crop: season.crop,
      totalCostHa: kpis.costPerHa + 480,
      expectedRevenueHa: kpis.grossRevenuePerHa - 650,
      netMarginHa: kpis.grossRevenuePerHa - 650 - (kpis.costPerHa + 480),
      marginPct: 9,
      statusCategory: 'cost_attention',
    },
    {
      id: 'plot-04',
      name: 'Talhão 04 — Várzea Sul',
      areaHa: 90,
      crop: season.crop,
      totalCostHa: kpis.costPerHa + 800,
      expectedRevenueHa: kpis.grossRevenuePerHa - 1200,
      netMarginHa: kpis.grossRevenuePerHa - 1200 - (kpis.costPerHa + 800),
      marginPct: 2,
      statusCategory: 'low_profitability',
    },
  ];

  const filteredPlots = plots.filter(p => filterStatus === 'all' || p.statusCategory === filterStatus);

  const getStatusBadge = (status: PlotRentabilityStatus) => {
    switch (status) {
      case 'high_profitability':
        return { label: '🟢 Alta Rentabilidade (>35%)', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300' };
      case 'medium_profitability':
        return { label: '🟡 Rentabilidade Média (15-35%)', bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 border-yellow-300' };
      case 'cost_attention':
        return { label: '🟠 Atenção aos Custos (5-15%)', bg: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-300' };
      case 'low_profitability':
        return { label: '🔴 Baixa Rentabilidade (<5%)', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Mapa Econômico por Talhão
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Classificação visual instantânea da eficiência de custo e rentabilidade de cada talhão
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-zinc-800 rounded-xl text-xs border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 outline-none"
          >
            <option value="all">Todos os Status</option>
            <option value="high_profitability">🟢 Alta Rentabilidade</option>
            <option value="medium_profitability">🟡 Rentabilidade Média</option>
            <option value="cost_attention">🟠 Atenção aos Custos</option>
            <option value="low_profitability">🔴 Baixa Rentabilidade</option>
          </select>
        </div>
      </div>

      {/* Grid do Mapa Visual dos Talhões */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPlots.map((plot) => {
          const badge = getStatusBadge(plot.statusCategory);
          return (
            <div
              key={plot.id}
              className={`p-5 rounded-2xl border bg-white dark:bg-zinc-900 shadow-sm space-y-4 relative overflow-hidden`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${badge.bg}`}>
                    {badge.label}
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-2">{plot.name}</h4>
                  <p className="text-xs text-slate-500">{plot.areaHa} Hectares — {plot.crop}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl">
                  <span className="text-slate-500 block text-[10px]">Custo / ha</span>
                  <span className="font-bold text-slate-900 dark:text-zinc-100">R$ {plot.totalCostHa.toLocaleString('pt-BR')}</span>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl">
                  <span className="text-slate-500 block text-[10px]">Receita / ha</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">R$ {plot.expectedRevenueHa.toLocaleString('pt-BR')}</span>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl">
                  <span className="text-slate-500 block text-[10px]">Margem Líquida</span>
                  <span className={`font-black ${plot.marginPct >= 15 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {plot.marginPct}%
                  </span>
                </div>
              </div>

              {/* Barra de Progresso da Margem */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-500">
                  <span>Desempenho Econômico</span>
                  <span className="font-bold text-slate-700 dark:text-zinc-300">R$ {plot.netMarginHa.toLocaleString('pt-BR')} / ha líquido</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${plot.marginPct >= 35 ? 'bg-emerald-500' : plot.marginPct >= 15 ? 'bg-yellow-500' : plot.marginPct >= 5 ? 'bg-orange-500' : 'bg-rose-500'}`}
                    style={{ width: `${Math.max(5, Math.min(100, plot.marginPct * 2))}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
