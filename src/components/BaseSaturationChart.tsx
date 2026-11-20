import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Info,
  BarChart2,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  Legend,
} from 'recharts';
import { SoilSample, Farm } from '../types/agronomy';

interface BaseSaturationChartProps {
  farm: Farm;
  soilSamples: SoilSample[];
  targetVPercent?: number;
}

const NUTRIENT_CONFIGS: Record<
  string,
  {
    label: string;
    dataKey: string;
    color: string;
    unit: string;
    domain: [number, number];
  }
> = {
  ph: {
    label: 'pH (CaCl₂)',
    dataKey: 'phCaCl2',
    color: '#6366f1',
    unit: '',
    domain: [3.5, 7.5],
  },
  mo: {
    label: 'Matéria orgânica',
    dataKey: 'organicMatter',
    color: '#b45309',
    unit: ' g/dm³',
    domain: [0, 50],
  },
  ca: {
    label: 'Cálcio (Ca)',
    dataKey: 'ca',
    color: '#2563eb',
    unit: ' cmolc/dm³',
    domain: [0, 10],
  },
  mg: {
    label: 'Magnésio (Mg)',
    dataKey: 'mg',
    color: '#db2777',
    unit: ' cmolc/dm³',
    domain: [0, 4],
  },
  k: {
    label: 'Potássio (K)',
    dataKey: 'k',
    color: '#7c3aed',
    unit: ' cmolc/dm³',
    domain: [0, 1.2],
  },
};

export const BaseSaturationChart: React.FC<BaseSaturationChartProps> = ({
  farm,
  soilSamples,
  targetVPercent = 70,
}) => {
  const [selectedPlotId, setSelectedPlotId] = useState<string>('all');
  const [selectedDepth, setSelectedDepth] = useState<'all' | '0-20' | '20-40'>('0-20');
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area');
  const [showTargetZone, setShowTargetZone] = useState<boolean>(true);
  const [comparisonNutrient, setComparisonNutrient] = useState<string>('none');

  const filteredSamples = useMemo(() => {
    if (!farm?.id) return [];
    return soilSamples
      .filter((s) => s.farmId === farm.id)
      .filter((s) => selectedPlotId === 'all' || s.plotId === selectedPlotId)
      .filter((s) => selectedDepth === 'all' || s.depth === selectedDepth)
      .sort((a, b) => new Date(a.collectionDate).getTime() - new Date(b.collectionDate).getTime());
  }, [soilSamples, farm?.id, selectedPlotId, selectedDepth]);

  const chartData = useMemo(() => {
    return filteredSamples.map((s) => {
      const plot = (farm?.plots || []).find((p) => p?.id === s?.plotId);
      const plotName = plot ? plot.name : `Talhão ${s?.plotId || ''}`;
      const vVal = s?.vPercent !== undefined ? s.vPercent : 0;

      const dateObj = new Date(s.collectionDate);
      const formattedDate = isNaN(dateObj.getTime())
        ? s.collectionDate
        : dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });

      return {
        id: s.id,
        sampleCode: s.sampleCode,
        plotId: s.plotId,
        plotName,
        depth: s.depth,
        collectionDate: s.collectionDate,
        dateLabel: formattedDate,
        vPercent: Number(vVal.toFixed(1)),
        targetV: targetVPercent,
        phCaCl2: s.phCaCl2,
        organicMatter: s.organicMatterGdm3,
        ca: s.caCmolcDm3,
        mg: s.mgCmolcDm3,
        k: s.kCmolcDm3,
      };
    });
  }, [filteredSamples, farm?.plots, targetVPercent]);

  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return { latest: 0, avg: 0, min: 0, max: 0, delta: 0, count: 0 };
    }
    const values = chartData.map((d) => d.vPercent);
    const latest = values[values.length - 1];
    const earliest = values[0];
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    return {
      latest,
      avg: sum / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      delta: latest - earliest,
      count: values.length,
    };
  }, [chartData]);

  const latestStatus =
    stats.latest >= targetVPercent
      ? { text: 'Ideal', color: 'text-emerald-700 dark:text-emerald-400' }
      : stats.latest >= 50
      ? { text: 'Atenção', color: 'text-amber-600 dark:text-amber-400' }
      : { text: 'Crítico', color: 'text-rose-600 dark:text-rose-400' };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: (typeof chartData)[number] }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const compConfig = comparisonNutrient !== 'none' ? NUTRIENT_CONFIGS[comparisonNutrient] : null;
      const compValue = compConfig ? (data as Record<string, unknown>)[compConfig.dataKey] : null;

      return (
        <div className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 border border-slate-200 dark:border-zinc-700 rounded-xl p-3 shadow-lg text-xs space-y-2 min-w-[210px]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-1.5 gap-2">
            <div>
              <span className="font-semibold">{data.sampleCode}</span>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {data.plotName} ({data.depth} cm)
              </p>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              {data.dateLabel}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-slate-500 dark:text-zinc-400">Saturação (V%):</span>
            <span className="text-base font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {data.vPercent}%
            </span>
          </div>

          {compConfig && compValue !== null && compValue !== undefined && (
            <div className="flex items-baseline justify-between border-t border-slate-100 dark:border-zinc-800 pt-1.5">
              <span className="text-slate-500 dark:text-zinc-400">{compConfig.label}:</span>
              <span className="font-semibold tabular-nums" style={{ color: compConfig.color }}>
                {typeof compValue === 'number' ? compValue.toFixed(2) : String(compValue)}
                {compConfig.unit}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-100 dark:border-zinc-800 text-[11px] tabular-nums">
            <div>
              <span className="text-slate-400 block">pH (CaCl₂)</span>
              <span className="font-medium">{data.phCaCl2?.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">M.O.</span>
              <span className="font-medium">{data.organicMatter?.toFixed(1)} g/dm³</span>
            </div>
            <div>
              <span className="text-slate-400 block">Ca + Mg</span>
              <span className="font-medium">
                {((data.ca || 0) + (data.mg || 0)).toFixed(2)} cmolc
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Potássio (K)</span>
              <span className="font-medium">{data.k?.toFixed(2)} cmolc</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center text-[11px] tabular-nums">
            <span className="text-slate-500 dark:text-zinc-400">Meta: {targetVPercent}%</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              {data.vPercent >= targetVPercent
                ? 'Atingida'
                : `${(targetVPercent - data.vPercent).toFixed(1)}% abaixo`}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
      {/* Header & Filters */}
      <div className="px-4 py-3.5 sm:px-5 border-b border-slate-200 dark:border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Evolução da saturação por bases (V%)
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            {farm.name} · Histórico de fertilidade química e resposta à calagem
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            aria-label="Filtrar por talhão"
            value={selectedPlotId}
            onChange={(e) => setSelectedPlotId(e.target.value)}
            className="h-7 px-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 focus:border-emerald-500 outline-none cursor-pointer"
          >
            <option value="all">Todos os talhões ({(farm?.plots || []).length})</option>
            {(farm?.plots || []).filter(Boolean).map((p, idx) => (
              <option key={p?.id || `plot-${idx}`} value={p?.id || ''}>
                {p?.name || 'Talhão'}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar por profundidade"
            value={selectedDepth}
            onChange={(e) => setSelectedDepth(e.target.value as 'all' | '0-20' | '20-40')}
            className="h-7 px-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 focus:border-emerald-500 outline-none cursor-pointer"
          >
            <option value="0-20">0–20 cm</option>
            <option value="20-40">20–40 cm</option>
            <option value="all">Todas camadas</option>
          </select>

          <select
            aria-label="Comparar com nutriente"
            value={comparisonNutrient}
            onChange={(e) => setComparisonNutrient(e.target.value)}
            className="h-7 px-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 focus:border-emerald-500 outline-none cursor-pointer"
          >
            <option value="none">Apenas V%</option>
            <option value="ph">Comparar: pH (CaCl₂)</option>
            <option value="mo">Comparar: M.O.</option>
            <option value="ca">Comparar: Cálcio (Ca)</option>
            <option value="mg">Comparar: Magnésio (Mg)</option>
            <option value="k">Comparar: Potássio (K)</option>
          </select>

          <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
            {[
              { id: 'area' as const, label: 'Gráfico de área', icon: AreaChartIcon },
              { id: 'line' as const, label: 'Gráfico de linha', icon: LineChartIcon },
              { id: 'bar' as const, label: 'Gráfico de barras', icon: BarChart2 },
            ].map(opt => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setChartType(opt.id)}
                  title={opt.label}
                  className={`h-6 w-7 inline-flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                    chartType === opt.id
                      ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4-Column Hairline Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-200 dark:border-zinc-800 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800">
        <div className="p-4 space-y-0.5">
          <span className="text-xs text-slate-500 dark:text-zinc-400 block">Último V% medido</span>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
              {stats.latest.toFixed(1)}%
            </span>
            <span className={`text-xs font-medium ${latestStatus.color}`}>{latestStatus.text}</span>
          </div>
        </div>

        <div className="p-4 space-y-0.5">
          <span className="text-xs text-slate-500 dark:text-zinc-400 block tabular-nums">
            Média ({stats.count} análises)
          </span>
          <div className="flex items-baseline justify-between gap-2 tabular-nums">
            <span className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
              {stats.avg.toFixed(1)}%
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              {stats.min.toFixed(0)}–{stats.max.toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="p-4 space-y-0.5">
          <span className="text-xs text-slate-500 dark:text-zinc-400 block">Evolução histórica</span>
          <div className="flex items-center justify-between gap-2 tabular-nums">
            <span
              className={`text-lg font-semibold inline-flex items-center gap-1 ${
                stats.delta >= 0
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {stats.delta >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {stats.delta >= 0 ? `+${stats.delta.toFixed(1)}%` : `${stats.delta.toFixed(1)}%`}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-0.5">
          <span className="text-xs text-slate-500 dark:text-zinc-400 block">Meta recomendada</span>
          <div className="flex items-baseline justify-between gap-2 tabular-nums">
            <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
              {targetVPercent}%
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">Saturação ideal</span>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="p-4 sm:p-5">
        {chartData.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-lg text-center p-6 space-y-1.5">
            <Info className="w-6 h-6 text-slate-400" />
            <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
              Nenhuma amostra de solo encontrada para os filtros selecionados.
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Selecione outro talhão ou profundidade de amostragem.
            </p>
          </div>
        ) : (
          <div className="h-68 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                {chartType === 'area' && (
                  <defs>
                    <linearGradient id="vPercentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                )}
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis
                  dataKey="dateLabel"
                  tickLine={false}
                  axisLine={{ opacity: 0.2 }}
                  tick={{ fontSize: 11, fill: '#888888' }}
                />
                <YAxis
                  yAxisId="left"
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={{ opacity: 0.2 }}
                  tick={{ fontSize: 11, fill: '#888888' }}
                  unit="%"
                />
                {comparisonNutrient !== 'none' && (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={NUTRIENT_CONFIGS[comparisonNutrient].domain}
                    tickLine={false}
                    axisLine={{ opacity: 0.2 }}
                    tick={{ fontSize: 11, fill: NUTRIENT_CONFIGS[comparisonNutrient].color }}
                    label={{
                      value: NUTRIENT_CONFIGS[comparisonNutrient].label,
                      angle: 90,
                      position: 'insideRight',
                      fontSize: 10,
                      fill: NUTRIENT_CONFIGS[comparisonNutrient].color,
                      offset: 5,
                    }}
                  />
                )}
                <Tooltip content={<CustomTooltip />} />
                {comparisonNutrient !== 'none' && (
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                )}

                {showTargetZone && chartType === 'area' && (
                  <ReferenceArea
                    {...({
                      y1: 60,
                      y2: 75,
                      fill: '#10b981',
                      fillOpacity: 0.07,
                      stroke: 'none',
                    } as Record<string, unknown>)}
                  />
                )}

                <ReferenceLine
                  yAxisId="left"
                  y={targetVPercent}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Meta: ${targetVPercent}%`,
                    fill: '#10b981',
                    fontSize: 10,
                    position: 'top',
                  }}
                />

                {chartType !== 'bar' && (
                  <ReferenceLine
                    yAxisId="left"
                    y={50}
                    stroke="#ef4444"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    label={{
                      value: 'Crítico: 50%',
                      fill: '#ef4444',
                      fontSize: 10,
                      position: 'bottom',
                    }}
                  />
                )}

                {chartType === 'area' && (
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="vPercent"
                    name="Saturação por Bases (V%)"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#vPercentGrad)"
                    activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
                  />
                )}

                {chartType === 'line' && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="vPercent"
                    name="Saturação por Bases (V%)"
                    stroke="#059669"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: '#059669', strokeWidth: 1 }}
                    activeDot={{ r: 6 }}
                  />
                )}

                {chartType === 'bar' && (
                  <Bar
                    yAxisId="left"
                    dataKey="vPercent"
                    name="Saturação por Bases (V%)"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={42}
                  />
                )}

                {comparisonNutrient !== 'none' && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey={NUTRIENT_CONFIGS[comparisonNutrient].dataKey}
                    name={NUTRIENT_CONFIGS[comparisonNutrient].label}
                    stroke={NUTRIENT_CONFIGS[comparisonNutrient].color}
                    strokeWidth={2}
                    dot={{ r: 3.5, fill: NUTRIENT_CONFIGS[comparisonNutrient].color }}
                    activeDot={{ r: 5 }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="px-4 py-2.5 sm:px-5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
        <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Ideal (≥ {targetVPercent}%)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Médio (50%–{targetVPercent}%)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Crítico (&lt; 50%)
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowTargetZone(!showTargetZone)}
          className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{showTargetZone ? 'Ocultar faixa ótima' : 'Exibir faixa ótima'}</span>
        </button>
      </div>
    </div>
  );
};
