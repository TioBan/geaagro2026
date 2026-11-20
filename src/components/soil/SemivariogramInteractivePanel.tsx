import React, { useMemo, useState } from 'react';
import { TrendingUp, Sparkles, Sliders, Activity } from 'lucide-react';
import {
  SamplePoint,
  KrigingParameters,
  SemivariogramModel,
  calculateSemivariance,
  calculateEmpiricalSemivariogram,
  fitOptimalSemivariogram,
} from '../../utils/spatialInterpolationEngine';

interface SemivariogramInteractivePanelProps {
  samples: SamplePoint[];
  krigingParams: KrigingParameters;
  onChangeParams: (params: KrigingParameters) => void;
}

export const SemivariogramInteractivePanel: React.FC<SemivariogramInteractivePanelProps> = ({
  samples,
  krigingParams,
  onChangeParams,
}) => {
  const { modelo, nugget, sill, range } = krigingParams;
  const [feedback, setFeedback] = useState<string | null>(null);

  const empiricalPoints = useMemo(() => {
    return calculateEmpiricalSemivariogram(samples, 10);
  }, [samples]);

  const handleAutoFit = () => {
    if (!samples || samples.length < 3) {
      setFeedback('Carregue pelo menos 3 pontos de amostra para ajustar o semivariograma.');
      return;
    }
    setFeedback(null);
    const fitted = fitOptimalSemivariogram(samples, modelo);
    onChangeParams(fitted);
  };

  const maxDistance = useMemo(() => {
    const maxEmp =
      empiricalPoints.length > 0 ? Math.max(...empiricalPoints.map((e) => e.distance)) : 300;
    return Math.max(maxEmp * 1.15, range * 1.25, 100);
  }, [empiricalPoints, range]);

  const maxSemivariance = useMemo(() => {
    const maxEmp =
      empiricalPoints.length > 0 ? Math.max(...empiricalPoints.map((e) => e.semivariance)) : 1.5;
    return Math.max(maxEmp * 1.2, sill * 1.25, 0.5);
  }, [empiricalPoints, sill]);

  const curvePoints = useMemo(() => {
    const steps = 80;
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= steps; i++) {
      const h = (i / steps) * maxDistance;
      const gamma = calculateSemivariance(h, krigingParams);
      pts.push({ x: h, y: gamma });
    }
    return pts;
  }, [krigingParams, maxDistance]);

  const svgWidth = 520;
  const svgHeight = 220;
  const paddingLeft = 45;
  const paddingBottom = 30;
  const paddingTop = 15;
  const paddingRight = 20;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

  const mapX = (h: number) => paddingLeft + (h / maxDistance) * chartW;
  const mapY = (gamma: number) => paddingTop + chartH - (gamma / maxSemivariance) * chartH;

  const pathD = useMemo(() => {
    if (curvePoints.length === 0) return '';
    return curvePoints.reduce((acc, pt, idx) => {
      const x = mapX(pt.x);
      const y = mapY(pt.y);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [curvePoints, maxDistance, maxSemivariance]);

  const structuralVariance = Math.max(0, sill - nugget);
  const spatialDependenceRatio = sill > 0 ? (structuralVariance / sill) * 100 : 0;

  let spatialClass = 'Moderada';
  let spatialClassColor = 'text-amber-700 dark:text-amber-400';
  if (spatialDependenceRatio >= 75) {
    spatialClass = 'Forte (Ideal)';
    spatialClassColor = 'text-emerald-700 dark:text-emerald-400';
  } else if (spatialDependenceRatio < 25) {
    spatialClass = 'Fraca (Efeito Pepita)';
    spatialClassColor = 'text-rose-600 dark:text-rose-400';
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h4 className="font-semibold text-slate-900 dark:text-zinc-100">
              Modelagem do Semivariograma Teórico
            </h4>
            <span className="text-slate-300 dark:text-zinc-700" aria-hidden="true">
              ·
            </span>
            <span className="text-slate-500 dark:text-zinc-400">Krigagem Ordinária</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            Ajuste dinâmico de autocorrelação espacial com pré-visualização em tempo real.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAutoFit}
          className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-md transition-colors cursor-pointer inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap"
          title="Ajusta Alcance, Patamar e Pepita automaticamente ao semivariograma empírico via MQO"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ajuste Automático (MQO)</span>
        </button>
      </div>

      {feedback && (
        <div className="px-3 py-2 rounded-md border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs">
          {feedback}
        </div>
      )}

      {/* Controles + Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Controles Manuais */}
        <div className="lg:col-span-5 space-y-3.5 bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800 text-xs">
            <span className="font-semibold text-slate-800 dark:text-zinc-200 inline-flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Parâmetros</span>
            </span>
            <span className={`text-[11px] font-semibold tabular-nums ${spatialClassColor}`}>
              GD {spatialDependenceRatio.toFixed(0)}% · {spatialClass}
            </span>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 block mb-1">
              Modelo Matemático
            </label>
            <select
              value={modelo}
              onChange={(e) =>
                onChangeParams({ ...krigingParams, modelo: e.target.value as SemivariogramModel })
              }
              className="w-full h-8 px-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 rounded-md text-xs font-medium cursor-pointer focus:outline-none focus:border-emerald-500"
            >
              <option value="spherical">Esférico (Recomendado em Solos)</option>
              <option value="exponential">Exponencial (Crescimento Suave)</option>
              <option value="gaussian">Gaussiano (Curvatura em S)</option>
            </select>
          </div>

          {/* Range */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs tabular-nums">
              <span className="text-slate-600 dark:text-zinc-400">Alcance / Range (a)</span>
              <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                {range} m
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="1000"
              step="5"
              value={range}
              onChange={(e) => onChangeParams({ ...krigingParams, range: Number(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-zinc-800 rounded"
            />
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-500 font-mono tabular-nums">
              <span>20m</span>
              <span>Distância máxima de correlação</span>
              <span>1000m</span>
            </div>
          </div>

          {/* Sill */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs tabular-nums">
              <span className="text-slate-600 dark:text-zinc-400">Patamar / Sill (C₀ + C)</span>
              <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                {sill}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="20"
              step="0.1"
              value={sill}
              onChange={(e) => onChangeParams({ ...krigingParams, sill: Number(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-zinc-800 rounded"
            />
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-500 font-mono tabular-nums">
              <span>0.1</span>
              <span>Variância máxima estruturada</span>
              <span>20.0</span>
            </div>
          </div>

          {/* Nugget */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs tabular-nums">
              <span className="text-slate-600 dark:text-zinc-400">Efeito Pepita / Nugget (C₀)</span>
              <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                {nugget}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.max(0.1, sill - 0.1)}
              step="0.05"
              value={nugget}
              onChange={(e) => onChangeParams({ ...krigingParams, nugget: Number(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-zinc-800 rounded"
            />
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-500 font-mono tabular-nums">
              <span>0.0</span>
              <span>Microvariabilidade / erro</span>
              <span>{sill}</span>
            </div>
          </div>

          {/* Métricas derivadas */}
          <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 grid grid-cols-2 gap-2 text-xs tabular-nums">
            <div className="bg-white dark:bg-zinc-900 p-2 rounded-md border border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                Variância Estrutural (C)
              </span>
              <strong className="font-mono text-slate-900 dark:text-zinc-100">
                {structuralVariance.toFixed(2)}
              </strong>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-2 rounded-md border border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                Razão Pepita (C₀/Sill)
              </span>
              <strong className="font-mono text-slate-900 dark:text-zinc-100">
                {sill > 0 ? ((nugget / sill) * 100).toFixed(1) : '0.0'}%
              </strong>
            </div>
          </div>
        </div>

        {/* Gráfico SVG */}
        <div className="lg:col-span-7 bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-zinc-200 inline-flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Semivariograma γ(h) vs Distância h (m)</span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              {empiricalPoints.length} lags empíricos
            </span>
          </div>

          <div className="relative w-full overflow-hidden bg-white dark:bg-zinc-900 rounded-md border border-slate-200 dark:border-zinc-800 p-2">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible select-none"
            >
              {[0.25, 0.5, 0.75, 1.0].map((frac, i) => {
                const y = paddingTop + chartH * (1 - frac);
                return (
                  <line
                    key={i}
                    x1={paddingLeft}
                    y1={y}
                    x2={svgWidth - paddingRight}
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-200 dark:text-zinc-800"
                    strokeWidth="1"
                    strokeDasharray="3, 3"
                  />
                );
              })}

              {/* Patamar (Sill) */}
              <line
                x1={paddingLeft}
                y1={mapY(sill)}
                x2={svgWidth - paddingRight}
                y2={mapY(sill)}
                stroke="#d97706"
                strokeWidth="1.25"
                strokeDasharray="4, 4"
              />
              <text
                x={svgWidth - paddingRight - 4}
                y={mapY(sill) - 4}
                fill="#d97706"
                fontSize="9"
                fontWeight="600"
                textAnchor="end"
              >
                Sill = {sill}
              </text>

              {/* Pepita (Nugget) */}
              {nugget > 0 && (
                <line
                  x1={paddingLeft}
                  y1={mapY(nugget)}
                  x2={svgWidth - paddingRight}
                  y2={mapY(nugget)}
                  stroke="#dc2626"
                  strokeWidth="1"
                  strokeDasharray="2, 2"
                />
              )}

              {/* Alcance (Range) */}
              <line
                x1={mapX(range)}
                y1={paddingTop}
                x2={mapX(range)}
                y2={paddingTop + chartH}
                stroke="#059669"
                strokeWidth="1.25"
                strokeDasharray="4, 4"
              />
              <text
                x={mapX(range)}
                y={paddingTop + chartH + 18}
                fill="#059669"
                fontSize="9"
                fontWeight="600"
                textAnchor="middle"
              >
                Range = {range}m
              </text>

              {/* Eixos */}
              <line
                x1={paddingLeft}
                y1={paddingTop + chartH}
                x2={svgWidth - paddingRight}
                y2={paddingTop + chartH}
                stroke="currentColor"
                className="text-slate-400 dark:text-zinc-600"
                strokeWidth="1.25"
              />
              <line
                x1={paddingLeft}
                y1={paddingTop}
                x2={paddingLeft}
                y2={paddingTop + chartH}
                stroke="currentColor"
                className="text-slate-400 dark:text-zinc-600"
                strokeWidth="1.25"
              />

              <text
                x={svgWidth - paddingRight}
                y={paddingTop + chartH + 18}
                fill="currentColor"
                className="text-slate-500 dark:text-zinc-400"
                fontSize="9"
                textAnchor="end"
              >
                h (m)
              </text>
              <text
                x={paddingLeft - 8}
                y={paddingTop + 8}
                fill="currentColor"
                className="text-slate-500 dark:text-zinc-400"
                fontSize="9"
                textAnchor="end"
              >
                γ(h)
              </text>

              {/* Curva Teórica */}
              <path
                d={pathD}
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Pontos Empíricos */}
              {empiricalPoints.map((pt, idx) => {
                const cx = mapX(pt.distance);
                const cy = mapY(pt.semivariance);
                return (
                  <g key={idx} className="cursor-pointer">
                    <circle
                      cx={cx}
                      cy={cy}
                      r="4"
                      fill="#0284c7"
                      stroke="#ffffff"
                      strokeWidth="1.25"
                    />
                    <title>
                      {`Lag h: ${pt.distance}m | Semivariância: ${pt.semivariance} | Pares N: ${pt.pairCount}`}
                    </title>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 gap-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-emerald-600 inline-block" />
                <span>Modelo ({modelo})</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 bg-sky-600 inline-block rounded-sm" />
                <span>Empíricos</span>
              </span>
            </div>
            <span className="font-mono text-[10px]">γ(h) = C₀ + C · f(h/a)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
