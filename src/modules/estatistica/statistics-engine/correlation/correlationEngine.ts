/**
 * Motor de Análise de Correlação (Pearson e Spearman) — GeaAgro Estatística
 *
 * Calcula coeficientes de correlação pareados (pairwise complete observations),
 * matriz de correlação, teste t exato, p-valores, n utilizado e intervalos de confiança (Fisher-Z).
 * Inclui alerta determinístico obrigatório de que correlação não implica causalidade.
 */

import {
  normalQuantile,
  rankWithTies,
  tPValueTwoTailed,
} from '../distributions/distributions';

export type MetodoCorrelacao = 'pearson' | 'spearman';

export interface ParCorrelacao {
  varA: string;
  varB: string;
  metodo: MetodoCorrelacao;
  coeficiente: number;
  pValor: number | null;
  n: number;
  icInferior: number | null;
  icSuperior: number | null;
  classificacaoForca: string;
  significativo: boolean;
}

export interface CorrelationMatrixResult {
  metodo: MetodoCorrelacao;
  variaveis: string[];
  alpha: number;
  matrizR: number[][];
  matrizP: (number | null)[][];
  matrizN: number[][];
  pares: ParCorrelacao[];
  paresScatter: Record<string, { x: number; y: number }[]>;
  interpretacao: string[];
  avisoCausalidade: string;
}

function classifyCorrelationStrength(rAbs: number): string {
  if (rAbs >= 0.9) return 'Muito forte';
  if (rAbs >= 0.7) return 'Forte';
  if (rAbs >= 0.5) return 'Moderada';
  if (rAbs >= 0.3) return 'Fraca';
  return 'Desprezível / Muito fraca';
}

function pearsonCore(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n < 2) return NaN;
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  const my = ys.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    const a = xs[i] - mx;
    const b = ys[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  const den = Math.sqrt(dx * dy);
  if (den <= 1e-18) return 0;
  return Math.max(-1, Math.min(1, num / den));
}

export function runCorrelationAnalysis(params: {
  rows: Record<string, any>[];
  variaveis: string[];
  metodo: MetodoCorrelacao;
  alpha?: number;
}): CorrelationMatrixResult {
  const { rows, variaveis, metodo } = params;
  const alpha = params.alpha ?? 0.05;

  if (variaveis.length < 2) {
    throw new Error('Selecione pelo menos 2 variáveis numéricas para análise de correlação.');
  }

  const toNum = (v: any): number | null => {
    if (v === null || v === undefined || v === '' || String(v).toUpperCase() === 'N/A') return null;
    const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };

  const k = variaveis.length;
  const matrizR: number[][] = Array.from({ length: k }, () => new Array(k).fill(1));
  const matrizP: (number | null)[][] = Array.from({ length: k }, () => new Array(k).fill(0));
  const matrizN: number[][] = Array.from({ length: k }, () => new Array(k).fill(0));
  const pares: ParCorrelacao[] = [];
  const paresScatter: Record<string, { x: number; y: number }[]> = {};
  const zCrit = normalQuantile(1 - alpha / 2);

  for (let i = 0; i < k; i++) {
    matrizN[i][i] = rows.filter((r) => toNum(r[variaveis[i]]) !== null).length;
    for (let j = i + 1; j < k; j++) {
      const xs: number[] = [];
      const ys: number[] = [];
      for (const row of rows) {
        const vx = toNum(row[variaveis[i]]);
        const vy = toNum(row[variaveis[j]]);
        if (vx !== null && vy !== null) {
          xs.push(vx);
          ys.push(vy);
        }
      }

      const nPair = xs.length;
      matrizN[i][j] = nPair;
      matrizN[j][i] = nPair;
      paresScatter[`${variaveis[i]}__${variaveis[j]}`] = xs.map((x, idx) => ({ x, y: ys[idx] }));

      let r = NaN;
      let pVal: number | null = null;
      let icInf: number | null = null;
      let icSup: number | null = null;

      if (nPair >= 3) {
        if (metodo === 'pearson') {
          r = pearsonCore(xs, ys);
        } else {
          const rx = rankWithTies(xs).ranks;
          const ry = rankWithTies(ys).ranks;
          r = pearsonCore(rx, ry);
        }

        const df = nPair - 2;
        if (Math.abs(r) >= 0.999999999) {
          pVal = 0;
        } else {
          const tObs = r * Math.sqrt(df / Math.max(1e-18, 1 - r * r));
          pVal = tPValueTwoTailed(tObs, df);
        }

        if (nPair >= 4 && Math.abs(r) < 0.999999) {
          const z = 0.5 * Math.log((1 + r) / (1 - r));
          const seZ = (metodo === 'spearman' ? Math.sqrt(1 + (r * r) / 2) : 1) / Math.sqrt(nPair - 3);
          icInf = Math.tanh(z - zCrit * seZ);
          icSup = Math.tanh(z + zCrit * seZ);
        }
      }

      matrizR[i][j] = r;
      matrizR[j][i] = r;
      matrizP[i][j] = pVal;
      matrizP[j][i] = pVal;

      const sig = pVal !== null && Number.isFinite(pVal) && pVal < alpha;
      pares.push({
        varA: variaveis[i],
        varB: variaveis[j],
        metodo,
        coeficiente: r,
        pValor: pVal,
        n: nPair,
        icInferior: icInf,
        icSuperior: icSup,
        classificacaoForca: Number.isFinite(r) ? classifyCorrelationStrength(Math.abs(r)) : 'Indeterminada',
        significativo: sig,
      });
    }
  }

  const avisoCausalidade =
    'ATENÇÃO METODOLÓGICA: Correlação estatística (Pearson ou Spearman) quantifica apenas associação numérica entre variáveis e NÃO implica relação de causa e efeito.';

  const interpretacao: string[] = [];
  const validPairs = pares.filter((p) => Number.isFinite(p.coeficiente));
  if (validPairs.length > 0) {
    const strongest = [...validPairs].sort((a, b) => Math.abs(b.coeficiente) - Math.abs(a.coeficiente))[0];
    const direcao = strongest.coeficiente >= 0 ? 'positiva' : 'negativa';
    interpretacao.push(
      `A associação mais intensa observada foi entre "${strongest.varA}" e "${strongest.varB}" (${metodo === 'pearson' ? 'r' : 'ρ'} = ${strongest.coeficiente.toFixed(4)}, direção ${direcao}, intensidade ${strongest.classificacaoForca.toLowerCase()}, n = ${strongest.n}, p = ${strongest.pValor !== null ? strongest.pValor.toFixed(4) : 'N/A'}).`
    );
  }
  const sigCount = pares.filter((p) => p.significativo).length;
  interpretacao.push(
    `De ${pares.length} pares avaliados ao nível α = ${(alpha * 100).toFixed(1)}%, ${sigCount} apresentaram correlação estatisticamente significativa diferente de zero.`
  );

  return {
    metodo,
    variaveis,
    alpha,
    matrizR,
    matrizP,
    matrizN,
    pares,
    paresScatter,
    interpretacao,
    avisoCausalidade,
  };
}
