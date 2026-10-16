import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  Sparkles,
  BarChart2,
  LineChart as LineChartIcon,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
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
  targetVPercent?: number; // Target V% (e.g., 70% for Soybean/Corn/Coffee)
}

const NUTRIENT_CONFIGS: Record<string, {
  label: string;
  dataKey: string;
  color: string;
  unit: string;
  domain: [number, number];
}> = {
  ph: {
    label: 'pH (CaCl2)',
    dataKey: 'phCaCl2',
    color: '#6366f1',
    unit: '',
    domain: [3.5, 7.5],
  },
  mo: {
    label: 'M.O. (Matéria Orgânica)',
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

  // Filter soil samples for current farm, plot, and depth
  const filteredSamples = useMemo(() => {
    if (!farm?.id) return [];
    return soilSamples
      .filter((s) => s.farmId === farm.id)
      .filter((s) => selectedPlotId === 'all' || s.plotId === selectedPlotId)
      .filter((s) => selectedDepth === 'all' || s.depth === selectedDepth)
      .sort((a, b) => new Date(a.collectionDate).getTime() - new Date(b.collectionDate).getTime());
  }, [soilSamples, farm?.id, selectedPlotId, selectedDepth]);

  // Transform data for Recharts
  const chartData = useMemo(() => {
    return filteredSamples.map((s) => {
      const plot = (farm?.plots || []).find((p) => p?.id === s?.plotId);
      const plotName = plot ? plot.name : `Talhão ${s?.plotId || ''}`;
      const vVal = s?.vPercent !== undefined ? s.vPercent : 0;

      let statusLabel = 'Crítico';
      let statusColor = '#ef4444'; // red

      if (vVal >= targetVPercent) {
        statusLabel = 'Ótimo';
        statusColor = '#10b981'; // emerald
      } else if (vVal >= 50) {
        statusLabel = 'Médio';
        statusColor = '#f59e0b'; // amber
      } else {
        statusLabel = 'Baixo / Crítico';
        statusColor = '#ef4444'; // red
      }

      // Date formatting: e.g. "25/07/2024" or "2024"
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
        criticalV: 50,
        phCaCl2: s.phCaCl2,
        organicMatter: s.organicMatterGdm3,
        ca: s.caCmolcDm3,
        mg: s.mgCmolcDm3,
        k: s.kCmolcDm3,
        statusLabel,
        statusColor,
      };
    });
  }, [filteredSamples, farm?.plots, targetVPercent]);

  // Statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return { latest: 0, avg: 0, min: 0, max: 0, delta: 0, count: 0 };
    }
    const values = chartData.map((d) => d.vPercent);
    const latest = values[values.length - 1];
    const earliest = values[0];
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const delta = latest - earliest;

    return {
      latest,
      avg,
      min,
      max,
      delta,
      count: values.length,
    };
  }, [chartData]);

  // Helper for status badge
  const getStatusBadge = (v: number) => {
    if (v >= targetVPercent) {
      return {
        text: 'Nível Ideal',
        bg: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      };
    }
    if (v >= 50) {
      return {
        text: 'Atenção / Médio',
        bg: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      };
    }
    return {
      text: 'Crítico / Calagem Necessária',
      bg: 'bg-red-50 dark:bg-red-950/70 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    };
  };

  const latestBadge = getStatusBadge(stats.latest);

  // Custom Tooltip Component for Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 dark:bg-zinc-900/95 text-white border border-slate-700 dark:border-zinc-700 rounded-xl p-3.5 shadow-xl text-xs space-y-2 backdrop-blur-md min-w-[220px]">
          <div className="flex items-center justify-between border-b border-slate-800 dark:border-zinc-800 pb-2 gap-2">
            <div>
              <span className="font-bold text-slate-200">{data.sampleCode}</span>
              <p className="text-[10px] text-slate-400">{data.plotName} ({data.depth} cm)</p>
            </div>
            <span className="text-[10px] bg-slate-800 dark:bg-zinc-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              {data.dateLabel}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <span className="text-slate-400 text-[11px]">Saturação de Bases (V%):</span>
            <span className="text-lg font-black text-emerald-400">
              {data.vPercent}%
            </span>
          </div>

          {comparisonNutrient !== 'none' && (
            <div className="flex items-baseline justify-between border-t border-slate-800/80 dark:border-zinc-800/80 pt-1.5 mt-1.5">
              <span className="text-slate-300 text-[11px] font-medium">
                {NUTRIENT_CONFIGS[comparisonNutrient].label}:
              </span>
              <span className="text-sm font-extrabold" style={{ color: NUTRIENT_CONFIGS[comparisonNutrient].color }}>
                {data[NUTRIENT_CONFIGS[comparisonNutrient].dataKey]?.toFixed(2) || data[NUTRIENT_CONFIGS[comparisonNutrient].dataKey]}
                {NUTRIENT_CONFIGS[comparisonNutrient].unit}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 dark:border-zinc-800 text-[10px]">
            <div>
              <span className="text-slate-400 block">pH (CaCl2):</span>
              <span className="font-bold text-slate-200">{data.phCaCl2?.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">M.O.:</span>
              <span className="font-bold text-slate-200">{data.organicMatter?.toFixed(1)} g/dm³</span>
            </div>
            <div>
              <span className="text-slate-400 block">Ca + Mg:</span>
              <span className="font-bold text-slate-200">
                {((data.ca || 0) + (data.mg || 0)).toFixed(2)} cmolc
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Potássio (K):</span>
              <span className="font-bold text-slate-200">{data.k?.toFixed(2)} cmolc</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 dark:border-zinc-800 flex justify-between items-center text-[10px]">
            <span className="text-slate-400">Meta da Cultura: {targetVPercent}%</span>
            <span className="font-bold text-emerald-400">
              {data.vPercent >= targetVPercent ? '✓ Atingida' : `${(targetVPercent - data.vPercent).toFixed(1)}% abaixo`}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-6 transition-colors">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base flex items-center gap-2">
                Evolução da Saturação por Bases (V%)
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800">
                  {farm.name}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Histórico de fertilidade química e resposta à calagem ao longo das amostras de solo
              </p>
            </div>
          </div>
        </div>

        {/* Filters and View Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Plot Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 dark:text-zinc-400 font-medium">Talhão:</span>
            <select
              value={selectedPlotId}
              onChange={(e) => setSelectedPlotId(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-zinc-900">Todos ({(farm?.plots || []).length})</option>
              {(farm?.plots || []).filter(Boolean).map((p) => (
                <option key={p?.id || Math.random()} value={p?.id || ''} className="bg-white dark:bg-zinc-900">
                  {p?.name || 'Talhão'}
                </option>
              ))}
            </select>
          </div>

          {/* Depth Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 dark:text-zinc-400 font-medium">Prof.:</span>
            <select
              value={selectedDepth}
              onChange={(e) => setSelectedDepth(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="0-20" className="bg-white dark:bg-zinc-900">0-20 cm (Superficial)</option>
              <option value="20-40" className="bg-white dark:bg-zinc-900">20-40 cm (Subsuperfície)</option>
              <option value="all" className="bg-white dark:bg-zinc-900">Todas as Camadas</option>
            </select>
          </div>

          {/* Nutrient Comparison Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 dark:text-zinc-400 font-medium">Comparar com:</span>
            <select
              value={comparisonNutrient}
              onChange={(e) => setComparisonNutrient(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="none" className="bg-white dark:bg-zinc-900">Apenas V%</option>
              <option value="ph" className="bg-white dark:bg-zinc-900">pH (CaCl2)</option>
              <option value="mo" className="bg-white dark:bg-zinc-900">Matéria Orgânica (M.O.)</option>
              <option value="ca" className="bg-white dark:bg-zinc-900">Cálcio (Ca)</option>
              <option value="mg" className="bg-white dark:bg-zinc-900">Magnésio (Mg)</option>
              <option value="k" className="bg-white dark:bg-zinc-900">Potássio (K)</option>
            </select>
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-slate-200 dark:border-zinc-800">
            <button
              onClick={() => setChartType('area')}
              title="Gráfico de Área"
              className={`p-1.5 rounded-md transition-all ${
                chartType === 'area'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('line')}
              title="Gráfico de Linha"
              className={`p-1.5 rounded-md transition-all ${
                chartType === 'line'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              title="Gráfico de Barras"
              className={`p-1.5 rounded-md transition-all ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Metric Summary Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Latest V% */}
        <div className="p-3.5 bg-slate-50 dark:bg-zinc-900/80 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
          <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider block">
            Último V% Medido
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-zinc-50">
              {stats.latest.toFixed(1)}%
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${latestBadge.bg}`}>
              {latestBadge.text}
            </span>
          </div>
        </div>

        {/* Average V% */}
        <div className="p-3.5 bg-slate-50 dark:bg-zinc-900/80 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
          <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider block">
            V% Médio ({stats.count} análises)
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-800 dark:text-zinc-200">
              {stats.avg.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-500">
              Min {stats.min.toFixed(0)}% · Max {stats.max.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Evolution Delta */}
        <div className="p-3.5 bg-slate-50 dark:bg-zinc-900/80 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
          <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider block">
            Evolução Histórica
          </span>
          <div className="flex items-center justify-between">
            <span
              className={`text-xl font-bold flex items-center gap-1 ${
                stats.delta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
              }`}
            >
              {stats.delta >= 0 ? (
                <TrendingUp className="w-4 h-4 inline" />
              ) : (
                <TrendingDown className="w-4 h-4 inline" />
              )}
              {stats.delta >= 0 ? `+${stats.delta.toFixed(1)}%` : `${stats.delta.toFixed(1)}%`}
            </span>
            <span className="text-[10px] text-slate-400">
              {stats.delta >= 0 ? 'Ganhos em fertilidade' : 'Redução no período'}
            </span>
          </div>
        </div>

        {/* Target V% */}
        <div className="p-3.5 bg-emerald-900/10 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/60 space-y-1">
          <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold uppercase tracking-wider block">
            Meta Recomendada
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
              {targetVPercent}%
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              Saturação Ideal
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart Graphic */}
      <div className="pt-2">
        {chartData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl text-center p-6 space-y-2">
            <Info className="w-8 h-8 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
              Nenhuma amostra de solo encontrada para os filtros selecionados.
            </p>
            <p className="text-xs text-slate-500">
              Tente selecionar outro talhão ou profundidade de amostragem.
            </p>
          </div>
        ) : (
          <div className="h-72 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="vPercentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
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
                        offset: 5
                      }}
                    />
                  )}
                  <Tooltip content={<CustomTooltip />} />
                  {comparisonNutrient !== 'none' && (
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                  )}

                  {/* Ideal Target Band (60% to 75%) */}
                  {showTargetZone && (
                    <ReferenceArea
                      {...({
                        y1: 60,
                        y2: 75,
                        fill: '#10b981',
                        fillOpacity: 0.07,
                        stroke: 'none',
                      } as any)}
                    />
                  )}

                  {/* Target Line */}
                  <ReferenceLine
                    y={targetVPercent}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: `Meta V%: ${targetVPercent}%`,
                      fill: '#10b981',
                      fontSize: 10,
                      position: 'top',
                    }}
                  />

                  {/* Critical Line */}
                  <ReferenceLine
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

                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="vPercent"
                    name="Saturação por Bases (V%)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#vPercentGrad)"
                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
                  />
                  {comparisonNutrient !== 'none' && (
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey={NUTRIENT_CONFIGS[comparisonNutrient].dataKey}
                      name={NUTRIENT_CONFIGS[comparisonNutrient].label}
                      stroke={NUTRIENT_CONFIGS[comparisonNutrient].color}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: NUTRIENT_CONFIGS[comparisonNutrient].color }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                </AreaChart>
              ) : chartType === 'line' ? (
                <LineChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
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
                        offset: 5
                      }}
                    />
                  )}
                  <Tooltip content={<CustomTooltip />} />
                  {comparisonNutrient !== 'none' && (
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                  )}
                  <ReferenceLine
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
                  <ReferenceLine
                    y={50}
                    stroke="#ef4444"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="vPercent"
                    name="Saturação por Bases (V%)"
                    stroke="#059669"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#059669', strokeWidth: 1 }}
                    activeDot={{ r: 7 }}
                  />
                  {comparisonNutrient !== 'none' && (
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey={NUTRIENT_CONFIGS[comparisonNutrient].dataKey}
                      name={NUTRIENT_CONFIGS[comparisonNutrient].label}
                      stroke={NUTRIENT_CONFIGS[comparisonNutrient].color}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: NUTRIENT_CONFIGS[comparisonNutrient].color }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                </LineChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
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
                        offset: 5
                      }}
                    />
                  )}
                  <Tooltip content={<CustomTooltip />} />
                  {comparisonNutrient !== 'none' && (
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                  )}
                  <ReferenceLine
                    y={targetVPercent}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="vPercent"
                    name="Saturação por Bases (V%)"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  />
                  {comparisonNutrient !== 'none' && (
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey={NUTRIENT_CONFIGS[comparisonNutrient].dataKey}
                      name={NUTRIENT_CONFIGS[comparisonNutrient].label}
                      stroke={NUTRIENT_CONFIGS[comparisonNutrient].color}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: NUTRIENT_CONFIGS[comparisonNutrient].color }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Legend & Agronomic Interpretation Footnote */}
      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span>Ideal (V% ≥ {targetVPercent}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span>Médio (50% - {targetVPercent}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
            <span>Crítico (V% &lt; 50%)</span>
          </div>
        </div>

        <button
          onClick={() => setShowTargetZone(!showTargetZone)}
          className="text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 text-[11px] underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          {showTargetZone ? 'Ocultar Faixa Ótima' : 'Exibir Faixa Ótima'}
        </button>
      </div>
    </div>
  );
};
