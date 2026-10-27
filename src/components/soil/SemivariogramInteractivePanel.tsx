import React, { useMemo } from 'react';
import {
  TrendingUp,
  Sparkles,
  Sliders,
  HelpCircle,
  Zap,
  Info,
  Activity,
  CheckCircle2
} from 'lucide-react';
import {
  SamplePoint,
  KrigingParameters,
  SemivariogramModel,
  calculateSemivariance,
  calculateEmpiricalSemivariogram,
  fitOptimalSemivariogram
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

  // 1. Calcular Pontos Empíricos
  const empiricalPoints = useMemo(() => {
    return calculateEmpiricalSemivariogram(samples, 10);
  }, [samples]);

  // 2. Auto-Ajustar Parâmetros ao Dataset
  const handleAutoFit = () => {
    if (!samples || samples.length < 3) {
      alert('Carregue pelo menos 3 pontos de amostra para ajustar o semivariograma.');
      return;
    }
    const fitted = fitOptimalSemivariogram(samples, modelo);
    onChangeParams(fitted);
  };

  // 3. Cálculos de Escala do Gráfico SVG
  const maxDistance = useMemo(() => {
    const maxEmp = empiricalPoints.length > 0 ? Math.max(...empiricalPoints.map((e) => e.distance)) : 300;
    return Math.max(maxEmp * 1.15, range * 1.25, 100);
  }, [empiricalPoints, range]);

  const maxSemivariance = useMemo(() => {
    const maxEmp = empiricalPoints.length > 0 ? Math.max(...empiricalPoints.map((e) => e.semivariance)) : 1.5;
    return Math.max(maxEmp * 1.2, sill * 1.25, 0.5);
  }, [empiricalPoints, sill]);

  // 4. Gerar Curva Teórica (SVG Path)
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

  // Mapeamento das Coordenadas no SVG (largura 500, altura 220)
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

  // Grau de Dependência Espacial (GD% = C / Sill * 100)
  const C = Math.max(0, sill - nugget);
  const spatialDependenceRatio = sill > 0 ? (C / sill) * 100 : 0;

  let spatialClass = 'Moderada';
  let spatialClassColor = 'text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-300';
  if (spatialDependenceRatio >= 75) {
    spatialClass = 'Forte (Ideal)';
    spatialClassColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300';
  } else if (spatialDependenceRatio < 25) {
    spatialClass = 'Fraca (Efeito Pepita Puro)';
    spatialClassColor = 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 border-rose-300';
  }

  return (
    <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-5 shadow-2xl space-y-5">
      {/* Header do Painel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <span>Modelagem do Semivariograma Teórico</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Krigagem Ordinária
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Ajuste dinâmico de autocorrelação espacial com pré-visualização em tempo real.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAutoFit}
          className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95 shrink-0"
          title="Ajusta Alcance, Patamar e Pepita automaticamente ao semivariograma empírico via MQO"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Ajuste Automático (MQO)</span>
        </button>
      </div>

      {/* Grid Principal: Controles do Semivariograma (Esquerda) + Gráfico Visual (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LADO ESQUERDO: CONTROLES MANUAIS (5 cols) */}
        <div className="lg:col-span-5 space-y-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ajuste de Parâmetros</span>
            </span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${spatialClassColor}`}>
              GD: {spatialDependenceRatio.toFixed(0)}% ({spatialClass})
            </span>
          </div>

          {/* Modelo Teórico */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Modelo Matemático:
            </label>
            <select
              value={modelo}
              onChange={(e) =>
                onChangeParams({ ...krigingParams, modelo: e.target.value as SemivariogramModel })
              }
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-bold cursor-pointer"
            >
              <option value="spherical">Esférico (Spherical) - Recomendado em Solos</option>
              <option value="exponential">Exponencial (Exponential) - Crescimento Suave</option>
              <option value="gaussian">Gaussiano (Gaussian) - Curvatura em S</option>
            </select>
          </div>

          {/* Alcance / Range (a) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Alcance / Range (a):</span>
              <span className="text-emerald-400 font-mono">{range}m</span>
            </div>
            <input
              type="range"
              min="20"
              max="1000"
              step="5"
              value={range}
              onChange={(e) => onChangeParams({ ...krigingParams, range: Number(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>20m</span>
              <span>Distância máxima de autocorrelação</span>
              <span>1000m</span>
            </div>
          </div>

          {/* Patamar / Sill (C0 + C) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Patamar / Sill (C₀ + C):</span>
              <span className="text-emerald-400 font-mono">{sill}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="20"
              step="0.1"
              value={sill}
              onChange={(e) => onChangeParams({ ...krigingParams, sill: Number(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.1</span>
              <span>Variância máxima estruturada</span>
              <span>20.0</span>
            </div>
          </div>

          {/* Efeito Pepita / Nugget (C0) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Efeito Pepita / Nugget (C₀):</span>
              <span className="text-emerald-400 font-mono">{nugget}</span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.max(0.1, sill - 0.1)}
              step="0.05"
              value={nugget}
              onChange={(e) => onChangeParams({ ...krigingParams, nugget: Number(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.0</span>
              <span>Erro de amostragem micro-variabilidade</span>
              <span>{sill}</span>
            </div>
          </div>

          {/* Contribuição Estrutural (C = Sill - Nugget) */}
          <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Variância Estrutural (C):</span>
              <strong className="text-emerald-300 font-mono">{C.toFixed(2)}</strong>
            </div>
            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Razão de Pepita (C₀/Sill):</span>
              <strong className="text-amber-300 font-mono">{sill > 0 ? ((nugget / sill) * 100).toFixed(1) : 0}%</strong>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: GRÁFICO SVG INTERATIVO (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Semivariograma Teórico γ(h) vs Distância Espacial h (m)</span>
            </span>
            <span className="text-[10px] text-slate-400">
              {empiricalPoints.length} pontos empíricos
            </span>
          </div>

          {/* Renderização SVG da Curva + Pontos Empíricos */}
          <div className="relative w-full overflow-hidden bg-slate-900/90 rounded-xl border border-slate-800 p-2">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible select-none"
            >
              {/* Definições de Gradientes */}
              <defs>
                <linearGradient id="semivarGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>

              {/* Linhas de Grade de Fundo */}
              {[0.25, 0.5, 0.75, 1.0].map((frac, i) => {
                const y = paddingTop + chartH * (1 - frac);
                return (
                  <line
                    key={i}
                    x1={paddingLeft}
                    y1={y}
                    x2={svgWidth - paddingRight}
                    y2={y}
                    stroke="#334155"
                    strokeWidth="1"
                    strokeDasharray="3, 3"
                    opacity="0.4"
                  />
                );
              })}

              {/* Linha Tracejada do Patamar (Sill) */}
              <line
                x1={paddingLeft}
                y1={mapY(sill)}
                x2={svgWidth - paddingRight}
                y2={mapY(sill)}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4, 4"
              />
              <text
                x={svgWidth - paddingRight - 4}
                y={mapY(sill) - 4}
                fill="#f59e0b"
                fontSize="9"
                fontWeight="bold"
                textAnchor="end"
              >
                Sill (C₀ + C) = {sill}
              </text>

              {/* Linha Tracejada do Efeito Pepita (Nugget) */}
              {nugget > 0 && (
                <line
                  x1={paddingLeft}
                  y1={mapY(nugget)}
                  x2={svgWidth - paddingRight}
                  y2={mapY(nugget)}
                  stroke="#ef4444"
                  strokeWidth="1"
                  strokeDasharray="2, 2"
                />
              )}

              {/* Linha Tracejada Vertical do Alcance (Range) */}
              <line
                x1={mapX(range)}
                y1={paddingTop}
                x2={mapX(range)}
                y2={paddingTop + chartH}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4, 4"
              />
              <text
                x={mapX(range)}
                y={paddingTop + chartH + 18}
                fill="#10b981"
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
              >
                Range = {range}m
              </text>

              {/* Eixos X e Y */}
              <line
                x1={paddingLeft}
                y1={paddingTop + chartH}
                x2={svgWidth - paddingRight}
                y2={paddingTop + chartH}
                stroke="#64748b"
                strokeWidth="1.5"
              />
              <line
                x1={paddingLeft}
                y1={paddingTop}
                x2={paddingLeft}
                y2={paddingTop + chartH}
                stroke="#64748b"
                strokeWidth="1.5"
              />

              {/* Rótulos dos Eixos */}
              <text x={svgWidth - paddingRight} y={paddingTop + chartH + 18} fill="#94a3b8" fontSize="9" textAnchor="end">
                h (m)
              </text>
              <text x={paddingLeft - 8} y={paddingTop + 8} fill="#94a3b8" fontSize="9" textAnchor="end">
                γ(h)
              </text>

              {/* Curva Teórica Ajustada */}
              <path
                d={pathD}
                fill="none"
                stroke="url(#semivarGradient)"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Pontos Empíricos da Amostragem */}
              {empiricalPoints.map((pt, idx) => {
                const cx = mapX(pt.distance);
                const cy = mapY(pt.semivariance);
                return (
                  <g key={idx} className="cursor-pointer group">
                    <circle
                      cx={cx}
                      cy={cy}
                      r="4.5"
                      fill="#38bdf8"
                      stroke="#0f172a"
                      strokeWidth="1.5"
                      className="transition-transform hover:scale-150"
                    />
                    <title>
                      {`Lag h: ${pt.distance}m | Semivariância: ${pt.semivariance} | Pares N: ${pt.pairCount}`}
                    </title>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legenda do Gráfico */}
          <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 gap-2 pt-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-3 h-1 bg-emerald-500 rounded" />
                <span>Modelo Teórico ({modelo})</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-sky-400 rounded-full border border-slate-900" />
                <span>Pontos Empíricos</span>
              </span>
            </div>
            <span className="text-slate-500 font-mono">
              Equação: γ(h) = C₀ + C &bull; f(h/a)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
