import React, { useState, useMemo } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { SoilSample, Farm } from '../types/agronomy';

interface FinancialEfficiencyChartProps {
  farm: Farm;
  soilSamples: SoilSample[];
}

export const FinancialEfficiencyChart: React.FC<FinancialEfficiencyChartProps> = ({
  farm,
  soilSamples,
}) => {
  const [selectedPlotId, setSelectedPlotId] = useState<string>('all');
  const [sellingPricePerBag, setSellingPricePerBag] = useState<number>(125);
  const [activeUnit, setActiveUnit] = useState<'sc' | 'ton'>('sc');

  const farmSoilSamples = useMemo(() => {
    if (!farm?.id) return [];
    return soilSamples
      .filter((s) => s.farmId === farm.id)
      .filter((s) => selectedPlotId === 'all' || s.plotId === selectedPlotId)
      .sort((a, b) => new Date(a.collectionDate).getTime() - new Date(b.collectionDate).getTime());
  }, [soilSamples, farm?.id, selectedPlotId]);

  const historicalData = useMemo(() => {
    if (!farmSoilSamples || farmSoilSamples.length === 0) {
      return [];
    }

    const yearsMap = new Map<number, SoilSample[]>();
    farmSoilSamples.forEach((sample) => {
      const d = new Date(sample.collectionDate);
      const year = isNaN(d.getFullYear()) ? new Date().getFullYear() : d.getFullYear();
      const existing = yearsMap.get(year) || [];
      existing.push(sample);
      yearsMap.set(year, existing);
    });

    const uniqueYears = Array.from(yearsMap.keys()).sort((a, b) => a - b);

    let storedOperations: Array<{
      farmId?: string;
      status?: string;
      fieldId?: string;
      date?: string;
      costs?: { total?: number };
    }> = [];
    try {
      const raw =
        localStorage.getItem('agronutri_fieldbook_operations') ||
        localStorage.getItem('geaagro_fieldbook_operations_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) storedOperations = parsed;
      }
    } catch {
      // ignore storage errors
    }

    return uniqueYears.map((year) => {
      const samplesInYear = yearsMap.get(year) || [];

      const vValues = samplesInYear
        .map((s) => s.vPercent)
        .filter((v): v is number => v !== undefined && !isNaN(v));
      const phValues = samplesInYear
        .map((s) => s.phCaCl2 || s.phH2O)
        .filter((p): p is number => p !== undefined && !isNaN(p));

      const vPercent =
        vValues.length > 0 ? vValues.reduce((a, b) => a + b, 0) / vValues.length : 50;
      const ph =
        phValues.length > 0 ? phValues.reduce((a, b) => a + b, 0) / phValues.length : 5.2;

      let yieldMultiplier = 0.75;
      if (vPercent >= 70) yieldMultiplier = 1.15;
      else if (vPercent >= 60) yieldMultiplier = 1.05;
      else if (vPercent >= 50) yieldMultiplier = 0.92;
      else if (vPercent >= 40) yieldMultiplier = 0.8;

      const plotCrop =
        farm?.plots?.find((p) => selectedPlotId === 'all' || p.id === selectedPlotId)
          ?.currentCrop ||
        farm?.plots?.[0]?.currentCrop ||
        'Soja';
      const isCorn = plotCrop.toLowerCase().includes('milho');
      const baseYield = isCorn ? 140 : 68;
      const cropName = plotCrop.split(' ')[0] || 'Soja';

      const rawYieldSc = Number((baseYield * yieldMultiplier).toFixed(1));
      const yieldTon = Number((rawYieldSc * 0.06).toFixed(2));

      const relatedOps = storedOperations.filter(
        (op) =>
          op?.farmId === farm?.id &&
          op?.status === 'completed' &&
          (selectedPlotId === 'all' || op?.fieldId === selectedPlotId) &&
          op?.date &&
          new Date(op.date).getFullYear() === year
      );

      const totalOpsCost = relatedOps.reduce((acc, op) => acc + (op.costs?.total || 0), 0);
      const cultivatedArea = farm?.cultivatedAreaHa || 100;

      const operationAndInputCost =
        totalOpsCost > 0
          ? Math.round(totalOpsCost / cultivatedArea)
          : Math.round(vPercent < 50 ? 4800 : vPercent < 65 ? 4200 : 3800);

      const correctiveCost = vPercent < 50 ? 900 : vPercent < 65 ? 450 : 200;
      const fertilizerCost = Math.round(operationAndInputCost * 0.45);
      const totalCostPerHa = operationAndInputCost + (totalOpsCost === 0 ? correctiveCost : 0);

      const costPerBag = rawYieldSc > 0 ? Number((totalCostPerHa / rawYieldSc).toFixed(2)) : 0;
      const grossRevenue = Number((rawYieldSc * sellingPricePerBag).toFixed(2));
      const netProfit = Number((grossRevenue - totalCostPerHa).toFixed(2));
      const roiPercent =
        totalCostPerHa > 0 ? Number(((netProfit / totalCostPerHa) * 100).toFixed(1)) : 0;

      return {
        year,
        seasonLabel: `${year}/${(year + 1).toString().slice(2)}`,
        vPercent: Number(vPercent.toFixed(1)),
        ph: Number(ph.toFixed(1)),
        cropName,
        yieldSc: rawYieldSc,
        yieldTon,
        costCorrective: correctiveCost,
        costFertilizer: fertilizerCost,
        costOperations: operationAndInputCost,
        costTotal: totalCostPerHa,
        costPerBag,
        grossRevenue,
        netProfit,
        roi: roiPercent,
        samplesCount: samplesInYear.length,
      };
    });
  }, [farmSoilSamples, farm, selectedPlotId, sellingPricePerBag]);

  const stats = useMemo(() => {
    if (historicalData.length === 0) {
      return {
        avgCost: 0,
        avgYield: 0,
        avgCostPerBag: 0,
        profitGrowth: 0,
        latest: null,
        earliest: null,
      };
    }
    const latest = historicalData[historicalData.length - 1];
    const earliest = historicalData[0];
    const avgCost = historicalData.reduce((acc, d) => acc + d.costTotal, 0) / historicalData.length;
    const avgYield = historicalData.reduce((acc, d) => acc + d.yieldSc, 0) / historicalData.length;
    const avgCostPerBag = avgYield > 0 ? avgCost / avgYield : 0;
    const profitGrowth = historicalData.length > 1 ? latest.netProfit - earliest.netProfit : 0;

    return { avgCost, avgYield, avgCostPerBag, profitGrowth, latest, earliest };
  }, [historicalData]);

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: (typeof historicalData)[number] }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 border border-slate-200 dark:border-zinc-700 rounded-xl p-3 shadow-lg text-xs space-y-2 min-w-[230px]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-1.5 gap-2">
            <div>
              <span className="font-semibold">Safra {data.seasonLabel}</span>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {data.cropName} · {data.samplesCount} laudo(s)
              </p>
            </div>
            <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 tabular-nums">
              V% {data.vPercent}%
            </span>
          </div>

          <div className="space-y-1 tabular-nums">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-zinc-400">Produtividade</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                {activeUnit === 'sc' ? `${data.yieldSc} sc/ha` : `${data.yieldTon} t/ha`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-zinc-400">Custo total</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                R$ {data.costTotal.toLocaleString('pt-BR')}/ha
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400">Custo por saca</span>
              <span className="font-semibold">R$ {data.costPerBag.toFixed(2)}/sc</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-zinc-400">Receita bruta</span>
              <span className="font-medium">R$ {data.grossRevenue.toLocaleString('pt-BR')}/ha</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-zinc-400">Margem líquida</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                R$ {data.netProfit.toLocaleString('pt-BR')}/ha
              </span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center text-[11px] tabular-nums">
            <span className="text-slate-500 dark:text-zinc-400">ROI estimado</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              {data.roi >= 0 ? '+' : ''}
              {data.roi}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
      {/* Header & Controls */}
      <div className="px-4 py-3.5 sm:px-5 border-b border-slate-200 dark:border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Eficiência financeira e produtividade
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Comparativo cronológico de custos (R$/ha) e produtividade ({activeUnit === 'sc' ? 'sc/ha' : 't/ha'})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {(farm?.plots || []).length > 0 && (
            <select
              aria-label="Filtrar eficiência por talhão"
              value={selectedPlotId}
              onChange={(e) => setSelectedPlotId(e.target.value)}
              className="h-7 px-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 focus:border-emerald-500 outline-none cursor-pointer"
            >
              <option value="all">Todos os talhões</option>
              {(farm?.plots || []).filter(Boolean).map((p, idx) => (
                <option key={p?.id || `plot-${idx}`} value={p?.id || ''}>
                  {p?.name || 'Talhão'}
                </option>
              ))}
            </select>
          )}

          <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setActiveUnit('sc')}
              className={`h-6 px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeUnit === 'sc'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              Sacas (sc)
            </button>
            <button
              type="button"
              onClick={() => setActiveUnit('ton')}
              className={`h-6 px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeUnit === 'ton'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              Toneladas (t)
            </button>
          </div>

          <label className="h-7 px-2 inline-flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs">
            <span className="text-slate-500 dark:text-zinc-400">Preço sc:</span>
            <span className="text-slate-400">R$</span>
            <input
              type="number"
              value={sellingPricePerBag}
              onChange={(e) => setSellingPricePerBag(Math.max(1, Number(e.target.value)))}
              className="w-12 bg-transparent font-semibold text-slate-900 dark:text-zinc-100 focus:outline-none tabular-nums text-right"
              min={1}
            />
          </label>
        </div>
      </div>

      {historicalData.length === 0 ? (
        <div className="p-8 text-center space-y-2">
          <FileSpreadsheet className="w-6 h-6 text-slate-400 mx-auto" />
          <h4 className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
            Nenhum dado histórico cadastrado para esta propriedade
          </h4>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
            Cadastre laudos de solo ou registre operações no Caderno de Campo para acompanhar a eficiência financeira por safra.
          </p>
        </div>
      ) : (
        <>
          {/* 4-Column Hairline KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-200 dark:border-zinc-800 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800">
            <div className="p-4 space-y-0.5">
              <span className="text-xs text-slate-500 dark:text-zinc-400 block">Custo médio / ha</span>
              <span className="text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums block">
                R$ {stats.avgCost.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </span>
            </div>

            <div className="p-4 space-y-0.5">
              <span className="text-xs text-slate-500 dark:text-zinc-400 block">Produtividade média</span>
              <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums block">
                {activeUnit === 'sc'
                  ? `${stats.avgYield.toFixed(1)} sc/ha`
                  : `${(stats.avgYield * 0.06).toFixed(1)} t/ha`}
              </span>
            </div>

            <div className="p-4 space-y-0.5">
              <span className="text-xs text-slate-500 dark:text-zinc-400 block">Custo médio / saca</span>
              <span className="text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums block">
                R$ {stats.avgCostPerBag.toFixed(2)}
              </span>
            </div>

            <div className="p-4 space-y-0.5">
              <span className="text-xs text-slate-500 dark:text-zinc-400 block">Variação de margem</span>
              <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums block">
                {stats.profitGrowth >= 0 ? '+' : ''}R${' '}
                {stats.profitGrowth.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/ha
              </span>
            </div>
          </div>

          {/* Chart */}
          <div className="p-4 sm:p-5">
            <div className="h-68 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={historicalData} margin={{ top: 15, right: -5, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis
                    dataKey="seasonLabel"
                    tickLine={false}
                    axisLine={{ opacity: 0.2 }}
                    tick={{ fontSize: 11, fill: '#888888' }}
                  />
                  <YAxis
                    yAxisId="left"
                    domain={[0, activeUnit === 'sc' ? 100 : 6]}
                    tickLine={false}
                    axisLine={{ opacity: 0.2 }}
                    tick={{ fontSize: 11, fill: '#10b981' }}
                    label={{
                      value: activeUnit === 'sc' ? 'Produtividade (sc/ha)' : 'Produtividade (t/ha)',
                      angle: -90,
                      position: 'insideLeft',
                      fontSize: 10,
                      fill: '#10b981',
                      offset: 0,
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 'auto']}
                    tickLine={false}
                    axisLine={{ opacity: 0.2 }}
                    tick={{ fontSize: 11, fill: '#f59e0b' }}
                    label={{
                      value: 'Custo Total (R$/ha)',
                      angle: 90,
                      position: 'insideRight',
                      fontSize: 10,
                      fill: '#f59e0b',
                      offset: 0,
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

                  <Bar
                    yAxisId="right"
                    dataKey="costTotal"
                    name="Custo por hectare (R$/ha)"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={34}
                    opacity={0.85}
                  />

                  <Bar
                    yAxisId="left"
                    dataKey={activeUnit === 'sc' ? 'yieldSc' : 'yieldTon'}
                    name={activeUnit === 'sc' ? 'Produtividade (sc/ha)' : 'Produtividade (t/ha)'}
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={34}
                    opacity={0.9}
                  />

                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="costPerBag"
                    name="Custo por saca (R$)"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 3.5, fill: '#6366f1' }}
                    activeDot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary & Cost Breakdown Footer */}
          <div className="px-4 py-3.5 sm:px-5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/40 flex flex-col md:flex-row md:items-start justify-between gap-4 text-xs">
            <div className="space-y-1 max-w-2xl">
              <span className="font-semibold text-slate-900 dark:text-zinc-100 block">
                Síntese agronômica e financeira
              </span>
              <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                {historicalData.length > 1 ? (
                  <>
                    Nas safras registradas, a saturação por bases (V%) variou de{' '}
                    <strong className="text-slate-900 dark:text-zinc-100">{stats.earliest?.vPercent}%</strong> para{' '}
                    <strong className="text-slate-900 dark:text-zinc-100">{stats.latest?.vPercent}%</strong>, com produtividade estimada de{' '}
                    <strong className="text-slate-900 dark:text-zinc-100">{stats.latest?.yieldSc} sc/ha</strong> e custo de{' '}
                    <strong className="text-slate-900 dark:text-zinc-100">R$ {stats.latest?.costPerBag.toFixed(2)}/sc</strong>.
                  </>
                ) : (
                  <>
                    Na safra {stats.latest?.seasonLabel}, o V% médio dos laudos é{' '}
                    <strong className="text-slate-900 dark:text-zinc-100">{stats.latest?.vPercent}%</strong>, com produtividade estimada de{' '}
                    <strong className="text-slate-900 dark:text-zinc-100">{stats.latest?.yieldSc} sc/ha</strong> e custo de{' '}
                    <strong className="text-slate-900 dark:text-zinc-100">R$ {stats.latest?.costPerBag.toFixed(2)}/sc</strong>.
                  </>
                )}
              </p>
            </div>

            {stats.latest && (
              <div className="md:w-64 shrink-0 md:border-l md:border-slate-200 md:dark:border-zinc-800 md:pl-4 space-y-1 text-[11px] tabular-nums">
                <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
                  Composição estimada ({stats.latest.seasonLabel})
                </span>
                <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                  <span>Fertilizantes e insumos</span>
                  <span className="font-medium text-slate-800 dark:text-zinc-200">
                    R$ {stats.latest.costFertilizer.toLocaleString('pt-BR')}/ha
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                  <span>Corretivos de solo</span>
                  <span className="font-medium text-slate-800 dark:text-zinc-200">
                    R$ {stats.latest.costCorrective.toLocaleString('pt-BR')}/ha
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-zinc-800 font-semibold">
                  <span className="text-slate-800 dark:text-zinc-200">Custo total</span>
                  <span className="text-amber-600 dark:text-amber-400">
                    R$ {stats.latest.costTotal.toLocaleString('pt-BR')}/ha
                  </span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
