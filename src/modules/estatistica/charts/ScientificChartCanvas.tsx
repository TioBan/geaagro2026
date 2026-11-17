/**
 * Renderizador de Gráficos Científicos SVG + Exportação PNG/SVG — GeaAgro Estatística
 *
 * Suporta todos os 12 gráficos científicos com qualidade de publicação:
 * - Barras e Colunas (com barras de erro DP/IC95% e letras de Tukey/Scott-Knott)
 * - Linhas
 * - Dispersão (Scatter)
 * - Boxplot (Bigodes, Q1, Mediana, Q3, Outliers)
 * - Histograma (com curva Normal teórica sobreposta)
 * - Curva de Regressão / Crescimento (com Banda de Confiança IC95%, Equação, R² e Ponto Ótimo)
 * - Gráfico de Resíduos (Resíduos vs Ajustados com faixas ±2σ)
 * - Q-Q Plot Normal (com linha identidade y=x)
 * - Heatmap de Correlação (matriz r com significância)
 * - Biplot PCA (escores + vetores loadings das variáveis)
 * - Dendrograma Hierárquico (altura de fusão)
 */

import React, { forwardRef } from 'react';
import { ConfiguracaoGraficoCientifico } from '../types/estatistica';
import { normalPdf } from '../statistics-engine/distributions/distributions';
import { DendrogramNode } from '../statistics-engine/multivariate/multivariateEngine';

const PALETTES: Record<ConfiguracaoGraficoCientifico['paleta'], string[]> = {
  scientific_emerald: ['#059669', '#0284c7', '#d97706', '#7c3aed', '#e11d48', '#0d9488'],
  monochrome_paper: ['#18181b', '#52525b', '#71717a', '#a1a1aa', '#27272a', '#3f3f46'],
  high_contrast_colorblind: ['#0072B2', '#D55E00', '#009E73', '#CC79A7', '#E69F00', '#56B4E9'],
  cobalt_amber: ['#1d4ed8', '#f59e0b', '#0f766e', '#be123c', '#4338ca', '#65a30d'],
};

export interface ScientificChartCanvasProps {
  config: ConfiguracaoGraficoCientifico;
  data: any;
  width?: number;
  height?: number;
  className?: string;
}

export async function exportSvgElementToPngDataUrl(
  svgEl: SVGSVGElement,
  scale = 2
): Promise<string> {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  const vb = svgEl.viewBox.baseVal;
  const w = vb && vb.width > 0 ? vb.width : svgEl.clientWidth || 760;
  const h = vb && vb.height > 0 ? vb.height : svgEl.clientHeight || 440;
  clone.setAttribute('width', String(w));
  clone.setAttribute('height', String(h));

  // Inserir fundo branco sólido para publicação científica
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('x', '0');
  bg.setAttribute('y', '0');
  bg.setAttribute('width', String(w));
  bg.setAttribute('height', String(h));
  bg.setAttribute('fill', '#ffffff');
  clone.insertBefore(bg, clone.firstChild);

  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(clone);
  const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = w * scale;
        canvas.height = h * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D indisponível');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

export function downloadSvgElement(svgEl: SVGSVGElement, fileName: string) {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  const vb = svgEl.viewBox.baseVal;
  bg.setAttribute('x', '0');
  bg.setAttribute('y', '0');
  bg.setAttribute('width', String(vb?.width || 760));
  bg.setAttribute('height', String(vb?.height || 440));
  bg.setAttribute('fill', '#ffffff');
  clone.insertBefore(bg, clone.firstChild);

  const svgStr = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.svg') ? fileName : `${fileName}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export async function downloadSvgElementAsPng(svgEl: SVGSVGElement, fileName: string) {
  const dataUrl = await exportSvgElementToPngDataUrl(svgEl, 2);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function niceTicks(minVal: number, maxVal: number, count = 5): number[] {
  if (!Number.isFinite(minVal) || !Number.isFinite(maxVal)) return [0, 1];
  if (Math.abs(maxVal - minVal) < 1e-12) {
    return [minVal - 1, minVal, minVal + 1];
  }
  const range = maxVal - minVal;
  const roughStep = range / Math.max(2, count);
  const mag = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const norm = roughStep / mag;
  const niceNorm = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  const step = niceNorm * mag;
  const start = Math.floor(minVal / step) * step;
  const end = Math.ceil(maxVal / step) * step;
  const ticks: number[] = [];
  for (let t = start; t <= end + step * 0.01; t += step) {
    ticks.push(Number(t.toPrecision(10)));
  }
  return ticks;
}

export const ScientificChartCanvas = forwardRef<SVGSVGElement, ScientificChartCanvasProps>(
  ({ config, data, width = 760, height = 440, className = '' }, ref) => {
    const colors = PALETTES[config.paleta] || PALETTES.scientific_emerald;
    const dec = Math.max(0, Math.min(6, config.casasDecimais ?? 2));
    const fmt = (v: number) => (Number.isFinite(v) ? v.toFixed(dec) : '-');

    const pad = { top: 68, right: 36, bottom: 72, left: 78 };
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;

    const xAxisLabel = config.unidadeX ? `${config.eixoX} (${config.unidadeX})` : config.eixoX;
    const yAxisLabel = config.unidadeY ? `${config.eixoY} (${config.unidadeY})` : config.eixoY;

    const renderHeader = () => (
      <g>
        <text x={width / 2} y={26} textAnchor="middle" fontSize="15" fontWeight="700" fill="#0f172a" fontFamily="Inter, system-ui, sans-serif">
          {config.titulo || 'Gráfico Científico'}
        </text>
        {config.subtitulo && (
          <text x={width / 2} y={45} textAnchor="middle" fontSize="11.5" fill="#475569" fontFamily="Inter, system-ui, sans-serif">
            {config.subtitulo}
          </text>
        )}
      </g>
    );

    const renderAxesLabels = (xLbl = xAxisLabel, yLbl = yAxisLabel) => (
      <g>
        <text x={pad.left + plotW / 2} y={height - 16} textAnchor="middle" fontSize="12" fontWeight="600" fill="#1e293b">
          {xLbl}
        </text>
        <text
          x={20}
          y={pad.top + plotH / 2}
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          fill="#1e293b"
          transform={`rotate(-90, 20, ${pad.top + plotH / 2})`}
        >
          {yLbl}
        </text>
      </g>
    );

    const renderEmpty = (msg: string) => (
      <svg ref={ref} viewBox={`0 0 ${width} ${height}`} className={`w-full h-auto bg-white rounded-xl border border-slate-200 ${className}`}>
        {renderHeader()}
        <text x={width / 2} y={height / 2} textAnchor="middle" fontSize="13" fill="#64748b">
          {msg}
        </text>
      </svg>
    );

    // ------------------------------------------------------------------------
    // 1. COLUNAS OU BARRAS (com DP/IC + Letras de Tukey/Scott-Knott)
    // ------------------------------------------------------------------------
    if (config.tipo === 'colunas' || config.tipo === 'barras') {
      const items: { label: string; value: number; error?: number; letra?: string }[] = data?.items || [];
      if (items.length === 0) return renderEmpty('Sem grupos válidos para plotar.');

      const maxRaw = Math.max(...items.map((d) => d.value + (config.mostrarIC && d.error ? d.error : 0)));
      const minRaw = Math.min(0, ...items.map((d) => d.value - (config.mostrarIC && d.error ? d.error : 0)));
      const ticks = niceTicks(minRaw, maxRaw * 1.08, 5);
      const yMin = ticks[0];
      const yMax = ticks[ticks.length - 1];

      if (config.tipo === 'colunas') {
        const yScale = (v: number) => pad.top + plotH - ((v - yMin) / Math.max(1e-12, yMax - yMin)) * plotH;
        const zeroY = yScale(0);
        const stepW = plotW / items.length;
        const barW = Math.min(54, stepW * 0.62);

        return (
          <svg ref={ref} viewBox={`0 0 ${width} ${height}`} className={`w-full h-auto bg-white rounded-xl border border-slate-200 ${className}`}>
            {renderHeader()}
            {ticks.map((tk, i) => (
              <g key={i}>
                <line x1={pad.left} x2={pad.left + plotW} y1={yScale(tk)} y2={yScale(tk)} stroke="#e2e8f0" strokeDasharray="3,3" />
                <text x={pad.left - 8} y={yScale(tk) + 4} textAnchor="end" fontSize="10.5" fill="#475569" fontFamily="monospace">
                  {fmt(tk)}
                </text>
              </g>
            ))}
            <line x1={pad.left} x2={pad.left} y1={pad.top} y2={pad.top + plotH} stroke="#334155" strokeWidth="1.2" />
            <line x1={pad.left} x2={pad.left + plotW} y1={zeroY} y2={zeroY} stroke="#334155" strokeWidth="1.2" />

            {items.map((item, idx) => {
              const cx = pad.left + stepW * idx + stepW / 2;
              const yVal = yScale(item.value);
              const barTop = Math.min(zeroY, yVal);
              const barH = Math.abs(zeroY - yVal);
              const errTop = item.error ? yScale(item.value + item.error) : yVal;
              const errBot = item.error ? yScale(item.value - item.error) : yVal;

              return (
                <g key={idx}>
                  <rect
                    x={cx - barW / 2}
                    y={barTop}
                    width={barW}
                    height={Math.max(1, barH)}
                    fill={colors[idx % colors.length]}
                    fillOpacity="0.88"
                    rx="2"
                  />
                  {config.mostrarIC && item.error !== undefined && item.error > 0 && (
                    <g stroke="#0f172a" strokeWidth="1.3">
                      <line x1={cx} x2={cx} y1={errTop} y2={errBot} />
                      <line x1={cx - 6} x2={cx + 6} y1={errTop} y2={errTop} />
                      <line x1={cx - 6} x2={cx + 6} y1={errBot} y2={errBot} />
                    </g>
                  )}
                  {config.mostrarRotulos && (
                    <text
                      x={cx}
                      y={Math.min(barTop, errTop) - 7}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="700"
                      fill="#0f172a"
                      fontFamily="monospace"
                    >
                      {fmt(item.value)}
                      {item.letra ? ` ${item.letra}` : ''}
                    </text>
                  )}
                  <text x={cx} y={pad.top + plotH + 18} textAnchor="middle" fontSize="11" fill="#1e293b">
                    {item.label.length > 14 ? `${item.label.slice(0, 12)}…` : item.label}
                  </text>
                </g>
              );
            })}
            {renderAxesLabels()}
          </svg>
        );
      } else {
        // Barras horizontais
        const xScale = (v: number) => pad.left + ((v - yMin) / Math.max(1e-12, yMax - yMin)) * plotW;
        const stepH = plotH / items.length;
        const barH = Math.min(30, stepH * 0.65);

        return (
          <svg ref={ref} viewBox={`0 0 ${width} ${height}`} className={`w-full h-auto bg-white rounded-xl border border-slate-200 ${className}`}>
            {renderHeader()}
            {ticks.map((tk, i) => (
              <g key={i}>
                <line x1={xScale(tk)} x2={xScale(tk)} y1={pad.top} y2={pad.top + plotH} stroke="#e2e8f0" strokeDasharray="3,3" />
                <text x={xScale(tk)} y={pad.top + plotH + 16} textAnchor="middle" fontSize="10.5" fill="#475569" fontFamily="monospace">
                  {fmt(tk)}
                </text>
              </g>
            ))}
            <line x1={pad.left} x2={pad.left} y1={pad.top} y2={pad.top + plotH} stroke="#334155" strokeWidth="1.2" />
            <line x1={pad.left} x2={pad.left + plotW} y1={pad.top + plotH} y2={pad.top + plotH} stroke="#334155" strokeWidth="1.2" />

            {items.map((item, idx) => {
              const cy = pad.top + stepH * idx + stepH / 2;
              const x0 = xScale(0);
              const x1 = xScale(item.value);
              return (
                <g key={idx}>
                  <rect x={Math.min(x0, x1)} y={cy - barH / 2} width={Math.max(2, Math.abs(x1 - x0))} height={barH} fill={colors[idx % colors.length]} rx="2" />
                  <text x={pad.left - 8} y={cy + 4} textAnchor="end" fontSize="11" fill="#1e293b">
                    {item.label.length > 12 ? `${item.label.slice(0, 10)}…` : item.label}
                  </text>
                  {config.mostrarRotulos && (
                    <text x={Math.max(x0, x1) + 6} y={cy + 4} textAnchor="start" fontSize="10.5" fontWeight="700" fill="#0f172a" fontFamily="monospace">
                      {fmt(item.value)}{item.letra ? ` ${item.letra}` : ''}
                    </text>
                  )}
                </g>
              );
            })}
            {renderAxesLabels()}
          </svg>
        );
      }
    }

    // ------------------------------------------------------------------------
    // 2. BOXPLOT CIENTÍFICO
    // ------------------------------------------------------------------------
    if (config.tipo === 'boxplot') {
      const groups: { label: string; values: number[] }[] = data?.groups || [];
      if (groups.length === 0) return renderEmpty('Sem grupos numéricos para Boxplot.');

      const allVals = groups.flatMap((g) => g.values);
      const ticks = niceTicks(Math.min(...allVals), Math.max(...allVals), 6);
      const yMin = ticks[0];
      const yMax = ticks[ticks.length - 1];
      const yScale = (v: number) => pad.top + plotH - ((v - yMin) / Math.max(1e-12, yMax - yMin)) * plotH;
      const stepW = plotW / groups.length;
      const boxW = Math.min(46, stepW * 0.55);

      const qCalc = (s: number[], p: number) => {
        const pos = p * (s.length - 1);
        const lo = Math.floor(pos);
        const hi = Math.ceil(pos);
        return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]);
      };

      return (
        <svg ref={ref} viewBox={`0 0 ${width} ${height}`} className={`w-full h-auto bg-white rounded-xl border border-slate-200 ${className}`}>
          {renderHeader()}
          {ticks.map((tk, i) => (
            <g key={i}>
              <line x1={pad.left} x2={pad.left + plotW} y1={yScale(tk)} y2={yScale(tk)} stroke="#e2e8f0" strokeDasharray="3,3" />
              <text x={pad.left - 8} y={yScale(tk) + 4} textAnchor="end" fontSize="10.5" fill="#475569" fontFamily="monospace">
                {fmt(tk)}
              </text>
            </g>
          ))}
          <line x1={pad.left} x2={pad.left} y1={pad.top} y2={pad.top + plotH} stroke="#334155" strokeWidth="1.2" />
          <line x1={pad.left} x2={pad.left + plotW} y1={pad.top + plotH} y2={pad.top + plotH} stroke="#334155" strokeWidth="1.2" />

          {groups.map((g, idx) => {
            const s = [...g.values].sort((a, b) => a - b);
            if (s.length === 0) return null;
            const q1 = qCalc(s, 0.25);
            const med = qCalc(s, 0.5);
            const q3 = qCalc(s, 0.75);
            const iqr = q3 - q1;
            const lowFence = q1 - 1.5 * iqr;
            const highFence = q3 + 1.5 * iqr;
            const inliers = s.filter((v) => v >= lowFence && v <= highFence);
            const wLow = inliers.length > 0 ? inliers[0] : s[0];
            const wHigh = inliers.length > 0 ? inliers[inliers.length - 1] : s[s.length - 1];
            const outliers = s.filter((v) => v < lowFence || v > highFence);
            const mean = s.reduce((a, b) => a + b, 0) / s.length;

            const cx = pad.left + stepW * idx + stepW / 2;
            const c = colors[idx % colors.length];

            return (
              <g key={idx}>
                <line x1={cx} x2={cx} y1={yScale(wHigh)} y2={yScale(q3)} stroke="#334155" strokeWidth="1.2" />
                <line x1={cx} x2={cx} y1={yScale(q1)} y2={yScale(wLow)} stroke="#334155" strokeWidth="1.2" />
                <line x1={cx - 10} x2={cx + 10} y1={yScale(wHigh)} y2={yScale(wHigh)} stroke="#334155" strokeWidth="1.2" />
                <line x1={cx - 10} x2={cx + 10} y1={yScale(wLow)} y2={yScale(wLow)} stroke="#334155" strokeWidth="1.2" />
                <rect
                  x={cx - boxW / 2}
                  y={yScale(q3)}
                  width={boxW}
                  height={Math.max(2, yScale(q1) - yScale(q3))}
                  fill={c}
                  fillOpacity="0.28"
                  stroke={c}
                  strokeWidth="1.8"
                />
                <line x1={cx - boxW / 2} x2={cx + boxW / 2} y1={yScale(med)} y2={yScale(med)} stroke="#0f172a" strokeWidth="2.2" />
                {/* Losango da Média */}
                <polygon
                  points={`${cx},${yScale(mean) - 4} ${cx + 4},${yScale(mean)} ${cx},${yScale(mean) + 4} ${cx - 4},${yScale(mean)}`}
                  fill="#0f172a"
                />
                {outliers.map((o, oi) => (
                  <circle key={oi} cx={cx} cy={yScale(o)} r="3.5" fill="none" stroke="#dc2626" strokeWidth="1.5" />
                ))}
                <text x={cx} y={pad.top + plotH + 18} textAnchor="middle" fontSize="11" fill="#1e293b">
                  {g.label.length > 14 ? `${g.label.slice(0, 12)}…` : g.label}
                </text>
              </g>
            );
          })}
          {renderAxesLabels()}
        </svg>
      );
    }

    // ------------------------------------------------------------------------
    // 3. HISTOGRAMA COM CURVA NORMAL SOBREPOSTA
    // ------------------------------------------------------------------------
    if (config.tipo === 'histograma') {
      const values: number[] = (data?.values || []).filter((v: any) => typeof v === 'number' && Number.isFinite(v));
      if (values.length < 3) return renderEmpty('Valores insuficientes para Histograma.');

      const minV = Math.min(...values);
      const maxV = Math.max(...values);
      const binsCount = Math.max(5, Math.min(16, Math.ceil(Math.sqrt(values.length))));
      const span = Math.max(1e-9, maxV - minV);
      const binW = span / binsCount;
      const bins = Array.from({ length: binsCount }, (_, i) => {
        const start = minV + i * binW;
        const end = start + binW;
        const count = values.filter((v) =>
          i === binsCount - 1 ? v >= start && v <= end + 1e-12 : v >= start && v < end
        ).length;
        return { start, end, count };
      });

      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const sd = Math.sqrt(values.reduce((s, v) => s + (v - mean) * (v - mean), 0) / Math.max(1, values.length - 1));
      const maxFreq = Math.max(1, ...bins.map((b) => b.count));

      const xScale = (x: number) => pad.left + ((x - minV) / span) * plotW;
      const yScale = (c: number) => pad.top + plotH - (c / (maxFreq * 1.15)) * plotH;
      const yTicks = niceTicks(0, maxFreq * 1.15, 5);
      const xTicks = niceTicks(minV, maxV, 6);

      // Curva normal esperada em frequência
      const curvePts: string[] = [];
      if (sd > 1e-12) {
        for (let i = 0; i <= 60; i++) {
          const x = minV + (span * i) / 60;
          const expectedFreq = normalPdf((x - mean) / sd) * (values.length * binW / sd);
          curvePts.push(`${xScale(x).toFixed(1)},${yScale(expectedFreq).toFixed(1)}`);
        }
      }

      return (
        <svg ref={ref} viewBox={`0 0 ${width} ${height}`} className={`w-full h-auto bg-white rounded-xl border border-slate-200 ${className}`}>
          {renderHeader()}
          {yTicks.map((tk, i) => (
            <g key={i}>
              <line x1={pad.left} x2={pad.left + plotW} y1={yScale(tk)} y2={yScale(tk)} stroke="#e2e8f0" strokeDasharray="3,3" />
              <text x={pad.left - 8} y={yScale(tk) + 4} textAnchor="end" fontSize="10.5" fill="#475569" fontFamily="monospace">
                {Math.round(tk)}
              </text>
            </g>
          ))}
          {xTicks.map((tk, i) => {
            const x = xScale(tk);
            if (x < pad.left - 2 || x > pad.left + plotW + 2) return null;
            return (
              <text key={i} x={x} y={pad.top + plotH + 17} textAnchor="middle" fontSize="10.5" fill="#475569" fontFamily="monospace">
                {fmt(tk)}
              </text>
            );
          })}
          {bins.map((b, i) => {
            const x0 = xScale(b.start);
            const x1 = xScale(b.end);
            const yT = yScale(b.count);
            return (
              <rect
                key={i}
                x={x0 + 1}
                y={yT}
                width={Math.max(2, x1 - x0 - 2)}
                height={Math.max(0, pad.top + plotH - yT)}
                fill={colors[0]}
                fillOpacity="0.72"
                stroke="#ffffff"
              />
            );
          })}
          {curvePts.length > 0 && (
            <polyline fill="none" stroke={colors[2]} strokeWidth="2.2" points={curvePts.join(' ')} />
          )}
          <line x1={pad.left} x2={pad.left} y1={pad.top} y2={pad.top + plotH} stroke="#334155" strokeWidth="1.2" />
          <line x1={pad.left} x2={pad.left + plotW} y1={pad.top + plotH} y2={pad.top + plotH} stroke="#334155" strokeWidth="1.2" />
          {renderAxesLabels()}
        </svg>
      );
    }

    // ------------------------------------------------------------------------
    // 4. REGRESSÃO / DISPERSÃO / LINHAS / RESÍDUOS / Q-Q PLOT
    // ------------------------------------------------------------------------
    if (
      config.tipo === 'regressao' ||
      config.tipo === 'dispersao' ||
      config.tipo === 'linhas' ||
      config.tipo === 'residuos' ||
      config.tipo === 'qqplot'
    ) {
      const points: { x: number; y: number; label?: string }[] = data?.points || [];
      const curve: { x: number; yPred: number; icInf?: number; icSup?: number }[] = data?.curve || [];
      if (points.length === 0 && curve.length === 0) return renderEmpty('Sem coordenadas X/Y para exibir.');

      const allX = [...points.map((p) => p.x), ...curve.map((c) => c.x)];
      const allY = [
        ...points.map((p) => p.y),
        ...curve.map((c) => c.yPred),
        ...curve.filter((c) => config.mostrarIC && c.icInf !== undefined).map((c) => c.icInf!),
        ...curve.filter((c) => config.mostrarIC && c.icSup !== undefined).map((c) => c.icSup!),
      ];

      const xTicks = niceTicks(Math.min(...allX), Math.max(...allX), 6);
      const yTicks = niceTicks(Math.min(...allY), Math.max(...allY), 6);
      const xMin = xTicks[0];
      const xMax = xTicks[xTicks.length - 1];
      const yMin = yTicks[0];
      const yMax = yTicks[yTicks.length - 1];

      const xScale = (x: number) => pad.left + ((x - xMin) / Math.max(1e-12, xMax - xMin)) * plotW;
      const yScale = (y: number) => pad.top + plotH - ((y - yMin) / Math.max(1e-12, yMax - yMin)) * plotH;

      const sortedPts = [...points].sort((a, b) => a.x - b.x);
      const lineStr = sortedPts.map((p) => `${xScale(p.x).toFixed(1)},${yScale(p.y).toFixed(1)}`).join(' ');
      const regCurveStr = curve.map((c) => `${xScale(c.x).toFixed(1)},${yScale(c.yPred).toFixed(1)}`).join(' ');

      let bandPoly = '';
      if (config.mostrarIC && curve.length > 1 && curve[0].icInf !== undefined) {
        const top = curve.map((c) => `${xScale(c.x).toFixed(1)},${yScale(c.icSup ?? c.yPred).toFixed(1)}`);
        const bot = [...curve].reverse().map((c) => `${xScale(c.x).toFixed(1)},${yScale(c.icInf ?? c.yPred).toFixed(1)}`);
        bandPoly = [...top, ...bot].join(' ');
      }

      return (
        <svg ref={ref} viewBox={`0 0 ${width} ${height}`} className={`w-full h-auto bg-white rounded-xl border border-slate-200 ${className}`}>
          {renderHeader()}
          {yTicks.map((tk, i) => (
            <g key={`y-${i}`}>
              <line x1={pad.left} x2={pad.left + plotW} y1={yScale(tk)} y2={yScale(tk)} stroke="#e2e8f0" strokeDasharray="3,3" />
              <text x={pad.left - 8} y={yScale(tk) + 4} textAnchor="end" fontSize="10.5" fill="#475569" fontFamily="monospace">
                {fmt(tk)}
              </text>
            </g>
          ))}
          {xTicks.map((tk, i) => (
            <g key={`x-${i}`}>
              <line x1={xScale(tk)} x2={xScale(tk)} y1={pad.top} y2={pad.top + plotH} stroke="#f1f5f9" />
              <text x={xScale(tk)} y={pad.top + plotH + 17} textAnchor="middle" fontSize="10.5" fill="#475569" fontFamily="monospace">
                {fmt(tk)}
              </text>
            </g>
          ))}

          {config.tipo === 'residuos' && (
            <>
              <line x1={pad.left} x2={pad.left + plotW} y1={yScale(0)} y2={yScale(0)} stroke="#0f172a" strokeDasharray="4,3" />
              {yMax >= 2 && <line x1={pad.left} x2={pad.left + plotW} y1={yScale(2)} y2={yScale(2)} stroke="#dc2626" strokeDasharray="3,4" />}
              {yMin <= -2 && <line x1={pad.left} x2={pad.left + plotW} y1={yScale(-2)} y2={yScale(-2)} stroke="#dc2626" strokeDasharray="3,4" />}
            </>
          )}

          {config.tipo === 'qqplot' && (
            <line
              x1={xScale(Math.max(xMin, yMin))}
              y1={yScale(Math.max(xMin, yMin))}
              x2={xScale(Math.min(xMax, yMax))}
              y2={yScale(Math.min(xMax, yMax))}
              stroke={colors[2]}
              strokeWidth="1.8"
              strokeDasharray="5,3"
            />
          )}

          {bandPoly && <polygon points={bandPoly} fill={colors[0]} fillOpacity="0.14" />}
          {config.tipo === 'linhas' && sortedPts.length > 1 && (
            <polyline fill="none" stroke={colors[0]} strokeWidth="2.2" points={lineStr} />
          )}
          {curve.length > 1 && (
            <polyline fill="none" stroke={colors[0]} strokeWidth="2.4" points={regCurveStr} />
          )}
          {points.map((p, idx) => (
            <circle key={idx} cx={xScale(p.x)} cy={yScale(p.y)} r="4" fill={colors[1]} fillOpacity="0.85" stroke="#ffffff" strokeWidth="1" />
          ))}

          {config.mostrarEquacao && data?.equationText && (
            <g>
              <rect x={pad.left + 12} y={pad.top + 8} width={Math.min(plotW - 24, 420)} height={26} rx="4" fill="#f8fafc" stroke="#cbd5e1" />
              <text x={pad.left + 20} y={pad.top + 25} fontSize="11" fontWeight="600" fill="#0f172a" fontFamily="monospace">
                {data.equationText}
              </text>
            </g>
          )}

          <line x1={pad.left} x2={pad.left} y1={pad.top} y2={pad.top + plotH} stroke="#334155" strokeWidth="1.2" />
          <line x1={pad.left} x2={pad.left + plotW} y1={pad.top + plotH} y2={pad.top + plotH} stroke="#334155" strokeWidth="1.2" />
          {renderAxesLabels()}
        </svg>
      );
    }

    // ------------------------------------------------------------------------
    // 5. HEATMAP DE CORRELAÇÃO
    // ------------------------------------------------------------------------
    if (config.tipo === 'heatmap') {
      const vars: string[] = data?.variaveis || [];
      const matR: number[][] = data?.matrizR || [];
      if (vars.length < 2) return renderEmpty('Sem matriz de correlação para Heatmap.');

      const k = vars.length;
      const cellSize = Math.min(plotW / k, plotH / k);
      const startX = pad.left + (plotW - cellSize * k) / 2;
      const startY = pad.top + (plotH - cellSize * k) / 2;

      const colorForR = (r: number) => {
        if (!Number.isFinite(r)) return '#f1f5f9';
        if (r >= 0) {
          const alpha = Math.min(1, Math.max(0.08, r));
          return `rgba(5, 150, 105, ${alpha.toFixed(2)})`;
        }
        const alpha = Math.min(1, Math.max(0.08, Math.abs(r)));
        return `rgba(220, 38, 38, ${alpha.toFixed(2)})`;
      };

      return (
        <svg ref={ref} viewBox={`0 0 ${width} ${height}`} className={`w-full h-auto bg-white rounded-xl border border-slate-200 ${className}`}>
          {renderHeader()}
          {vars.map((v, i) => (
            <g key={i}>
              <text x={startX - 8} y={startY + i * cellSize + cellSize / 2 + 4} textAnchor="end" fontSize="10.5" fontWeight="600" fill="#1e293b">
                {v.slice(0, 12)}
              </text>
              <text x={startX + i * cellSize + cellSize / 2} y={startY + k * cellSize + 18} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#1e293b">
                {v.slice(0, 10)}
              </text>
            </g>
          ))}
          {matR.map((row, i) =>
            row.map((rVal, j) => (
              <g key={`${i}-${j}`}>
                <rect
                  x={startX + j * cellSize}
                  y={startY + i * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill={colorForR(rVal)}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <text
                  x={startX + j * cellSize + cellSize / 2}
                  y={startY + i * cellSize + cellSize / 2 + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill={Math.abs(rVal) > 0.55 ? '#ffffff' : '#0f172a'}
                  fontFamily="monospace"
                >
                  {Number.isFinite(rVal) ? rVal.toFixed(2) : '-'}
                </text>
              </g>
            ))
          )}
        </svg>
      );
    }

    // ------------------------------------------------------------------------
    // 6. BIPLOT PCA
    // ------------------------------------------------------------------------
    if (config.tipo === 'biplot') {
      const scores: { label: string; pc1: number; pc2: number }[] = data?.scores || [];
      const loadings: { variavel: string; pc1: number; pc2: number }[] = data?.loadings || [];
      if (scores.length === 0) return renderEmpty('Sem escores PCA para Biplot.');

      const maxAbsScore = Math.max(
        1e-6,
        ...scores.map((s) => Math.abs(s.pc1)),
        ...scores.map((s) => Math.abs(s.pc2))
      );
      const scale = maxAbsScore * 1.15;
      const xScale = (v: number) => pad.left + ((v + scale) / (2 * scale)) * plotW;
      const yScale = (v: number) => pad.top + plotH - ((v + scale) / (2 * scale)) * plotH;

      return (
        <svg ref={ref} viewBox={`0 0 ${width} ${height}`} className={`w-full h-auto bg-white rounded-xl border border-slate-200 ${className}`}>
          {renderHeader()}
          <line x1={pad.left} x2={pad.left + plotW} y1={yScale(0)} y2={yScale(0)} stroke="#cbd5e1" strokeDasharray="4,3" />
          <line x1={xScale(0)} x2={xScale(0)} y1={pad.top} y2={pad.top + plotH} stroke="#cbd5e1" strokeDasharray="4,3" />
          <rect x={pad.left} y={pad.top} width={plotW} height={plotH} fill="none" stroke="#334155" strokeWidth="1.2" />

          {scores.map((s, idx) => (
            <g key={`sc-${idx}`}>
              <circle cx={xScale(s.pc1)} cy={yScale(s.pc2)} r="4.5" fill={colors[0]} fillOpacity="0.85" />
              {config.mostrarRotulos && (
                <text x={xScale(s.pc1) + 6} y={yScale(s.pc2) + 3} fontSize="9.5" fill="#334155">
                  {s.label}
                </text>
              )}
            </g>
          ))}

          {loadings.map((l, idx) => {
            const vx = xScale(l.pc1 * maxAbsScore * 0.9);
            const vy = yScale(l.pc2 * maxAbsScore * 0.9);
            return (
              <g key={`ld-${idx}`}>
                <line x1={xScale(0)} y1={yScale(0)} x2={vx} y2={vy} stroke={colors[2]} strokeWidth="1.8" />
                <circle cx={vx} cy={vy} r="2.5" fill={colors[2]} />
                <text x={vx + 5} y={vy - 3} fontSize="10.5" fontWeight="700" fill="#9a3412">
                  {l.variavel}
                </text>
              </g>
            );
          })}
          {renderAxesLabels(
            data?.pc1Label || 'CP1',
            data?.pc2Label || 'CP2'
          )}
        </svg>
      );
    }

    // ------------------------------------------------------------------------
    // 7. DENDROGRAMA HIERÁRQUICO
    // ------------------------------------------------------------------------
    if (config.tipo === 'dendrograma') {
      const root: DendrogramNode | undefined = data?.dendrograma;
      if (!root) return renderEmpty('Sem árvore de agrupamento para Dendrograma.');

      const labels: string[] = data?.labels || [];
      const leafOrder: number[] = root.leafIndices;
      const nLeaves = leafOrder.length;
      const maxH = Math.max(1e-6, root.height * 1.1);

      const leafPosMap = new Map<number, number>();
      leafOrder.forEach((leafIdx, posIdx) => {
        leafPosMap.set(leafIdx, pad.left + ((posIdx + 0.5) / nLeaves) * plotW);
      });
      const yScale = (h: number) => pad.top + plotH - (h / maxH) * plotH;

      const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
      const layoutNode = (node: DendrogramNode): { x: number; y: number } => {
        if (!node.left || !node.right) {
          const x = leafPosMap.get(node.leafIndices[0]) ?? pad.left;
          return { x, y: yScale(0) };
        }
        const L = layoutNode(node.left);
        const R = layoutNode(node.right);
        const y = yScale(node.height);
        edges.push({ x1: L.x, y1: L.y, x2: L.x, y2: y });
        edges.push({ x1: R.x, y1: R.y, x2: R.x, y2: y });
        edges.push({ x1: L.x, y1: y, x2: R.x, y2: y });
        return { x: (L.x + R.x) / 2, y };
      };
      layoutNode(root);
      const yTicks = niceTicks(0, maxH, 5);

      return (
        <svg ref={ref} viewBox={`0 0 ${width} ${height}`} className={`w-full h-auto bg-white rounded-xl border border-slate-200 ${className}`}>
          {renderHeader()}
          {yTicks.map((tk, i) => (
            <g key={i}>
              <line x1={pad.left} x2={pad.left + plotW} y1={yScale(tk)} y2={yScale(tk)} stroke="#f1f5f9" />
              <text x={pad.left - 8} y={yScale(tk) + 4} textAnchor="end" fontSize="10" fill="#475569" fontFamily="monospace">
                {fmt(tk)}
              </text>
            </g>
          ))}
          {edges.map((e, idx) => (
            <line key={idx} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke={colors[0]} strokeWidth="1.6" />
          ))}
          {leafOrder.map((leafIdx) => {
            const x = leafPosMap.get(leafIdx)!;
            const lbl = labels[leafIdx] || `Obs ${leafIdx + 1}`;
            return (
              <text
                key={leafIdx}
                x={x}
                y={pad.top + plotH + 14}
                textAnchor="end"
                fontSize="9.5"
                fill="#1e293b"
                transform={`rotate(-35, ${x}, ${pad.top + plotH + 14})`}
              >
                {lbl.slice(0, 14)}
              </text>
            );
          })}
          <line x1={pad.left} x2={pad.left} y1={pad.top} y2={pad.top + plotH} stroke="#334155" strokeWidth="1.2" />
          {renderAxesLabels('Observações / Tratamentos', 'Distância / Altura de Fusão')}
        </svg>
      );
    }

    return renderEmpty('Tipo de gráfico não reconhecido.');
  }
);

ScientificChartCanvas.displayName = 'ScientificChartCanvas';
