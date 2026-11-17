/**
 * Motor de Análises Estatísticas Especiais — GeaAgro Estatística
 *
 * 1. Séries Temporais & Tendências: Teste de Mann-Kendall + Inclinação de Sen + Média Móvel
 * 2. Regressão Logística Binária: IRLS (Newton-Raphson), Odds Ratios, Teste de Wald, AIC, Pseudo-R²
 * 3. Dados Categóricos: Tabela de Contingência χ², Correção de Yates, Teste Exato de Fisher (2×2), Teste G, V de Cramér
 * 4. Análise de Sobrevivência: Estimador de Kaplan-Meier (Erro-Padrão de Greenwood) + Teste Log-Rank
 */

import {
  chiSquarePValue,
  logGamma,
  normalCdf,
} from '../distributions/distributions';
import { invertMatrix, matMul, matVec, transpose } from '../linear-models/linearAlgebra';

// ============================================================================
// 1. SÉRIES TEMPORAIS — MANN-KENDALL & SEN'S SLOPE
// ============================================================================

export interface MannKendallResult {
  n: number;
  sEstatistica: number;
  varianciaS: number;
  zEstatistica: number;
  pValor: number;
  tauKendall: number;
  inclinacaoSen: number;
  mediaMovel3: (number | null)[];
  tendencia: 'crescente' | 'decrescente' | 'estacionaria';
  interpretacao: string[];
}

export function runMannKendallAnalysis(values: number[], alpha = 0.05): MannKendallResult {
  const n = values.length;
  if (n < 4) {
    throw new Error('O teste de Mann-Kendall exige pelo menos 4 pontos temporais ordenados.');
  }

  let S = 0;
  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const diff = values[j] - values[i];
      if (diff > 0) S += 1;
      else if (diff < 0) S -= 1;
      slopes.push(diff / (j - i));
    }
  }

  // Contagem de empates para variância de S
  const counts = new Map<number, number>();
  values.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
  let tieTerm = 0;
  counts.forEach((t) => {
    if (t > 1) tieTerm += t * (t - 1) * (2 * t + 5);
  });

  const varS = (n * (n - 1) * (2 * n + 5) - tieTerm) / 18;
  const sdS = Math.sqrt(Math.max(1e-18, varS));
  let Z = 0;
  if (S > 0) Z = (S - 1) / sdS;
  else if (S < 0) Z = (S + 1) / sdS;

  const pValor = Math.min(1, Math.max(0, 2 * (1 - normalCdf(Math.abs(Z)))));
  const tauKendall = S / ((n * (n - 1)) / 2);

  slopes.sort((a, b) => a - b);
  const mid = Math.floor(slopes.length / 2);
  const inclinacaoSen = slopes.length % 2 === 1 ? slopes[mid] : 0.5 * (slopes[mid - 1] + slopes[mid]);

  const mediaMovel3 = values.map((_, idx) => {
    if (idx === 0 || idx === n - 1) return null;
    return (values[idx - 1] + values[idx] + values[idx + 1]) / 3;
  });

  const tendencia: MannKendallResult['tendencia'] =
    pValor < alpha ? (S > 0 ? 'crescente' : 'decrescente') : 'estacionaria';

  return {
    n,
    sEstatistica: S,
    varianciaS: varS,
    zEstatistica: Z,
    pValor,
    tauKendall,
    inclinacaoSen,
    mediaMovel3,
    tendencia,
    interpretacao: [
      pValor < alpha
        ? `Tendência monotônica ${tendencia} estatisticamente significativa detectada (Mann-Kendall S = ${S}, Z = ${Z.toFixed(3)}, p = ${pValor.toFixed(4)} < ${alpha}, τ = ${tauKendall.toFixed(3)}).`
        : `Série sem tendência monotônica significativa ao nível α = ${(alpha * 100).toFixed(1)}% (Z = ${Z.toFixed(3)}, p = ${pValor.toFixed(4)}).`,
      `Taxa mediana estimada pelo estimador robusto de Theil-Sen: ${inclinacaoSen.toFixed(4)} unidades por período.`,
    ],
  };
}

// ============================================================================
// 2. REGRESSÃO LOGÍSTICA BINÁRIA (IRLS)
// ============================================================================

export interface LogisticRegressionResult {
  n: number;
  alpha: number;
  variavelResposta: string;
  preditoras: string[];
  coeficientes: {
    nome: string;
    beta: number;
    erroPadrao: number;
    waldChi2: number;
    pValor: number;
    oddsRatio: number;
    orIcInf: number;
    orIcSup: number;
  }[];
  logVerossimilhanca: number;
  aic: number;
  pseudoR2McFadden: number;
  acuraciaClassificacao: number;
  matrizConfusao: { vp: number; vn: number; fp: number; fn: number };
  interpretacao: string[];
}

export function runLogisticRegression(params: {
  rows: Record<string, any>[];
  responseCol: string;
  predictorCols: string[];
  positiveValue?: string;
  alpha?: number;
}): LogisticRegressionResult {
  const alpha = params.alpha ?? 0.05;
  const toNum = (v: any): number | null => {
    if (v === null || v === undefined || v === '') return null;
    const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };

  // Determinar classes binárias 0/1
  const rawY = params.rows.map((r) => String(r[params.responseCol] ?? '').trim()).filter(Boolean);
  const distinctY = Array.from(new Set(rawY));
  if (distinctY.length !== 2) {
    throw new Error(`Regressão Logística Binária exige exatamente 2 classes na resposta "${params.responseCol}" (encontradas: ${distinctY.length}).`);
  }
  const posVal = params.positiveValue || (distinctY.includes('1') ? '1' : distinctY[1]);

  const X: number[][] = [];
  const y: number[] = [];
  for (const r of params.rows) {
    const rv = String(r[params.responseCol] ?? '').trim();
    if (!rv) continue;
    const xs = params.predictorCols.map((c) => toNum(r[c]));
    if (xs.some((v) => v === null)) continue;
    X.push([1, ...(xs as number[])]);
    y.push(rv === posVal ? 1 : 0);
  }

  const n = y.length;
  const p = X[0].length;
  if (n < p + 3) {
    throw new Error('Observações insuficientes para ajuste da Regressão Logística.');
  }

  let beta = new Array<number>(p).fill(0);
  let covMat: number[][] | null = null;

  for (let iter = 0; iter < 50; iter++) {
    const eta = matVec(X, beta);
    const mu = eta.map((e) => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, e)))));
    const w = mu.map((m) => Math.max(1e-8, m * (1 - m)));

    // X^T W X e X^T (y - mu)
    const XtWX: number[][] = Array.from({ length: p }, () => new Array(p).fill(0));
    const XtRes = new Array<number>(p).fill(0);
    for (let i = 0; i < n; i++) {
      const wi = w[i];
      const res = y[i] - mu[i];
      for (let a = 0; a < p; a++) {
        XtRes[a] += X[i][a] * res;
        for (let b = 0; b < p; b++) {
          XtWX[a][b] += X[i][a] * wi * X[i][b];
        }
      }
    }

    // Ridge mínimo apenas para evitar singularidade exata em separação quase completa
    const regularized = XtWX.map((row, idx) => row.map((val, j) => (idx === j ? val + 1e-9 : val)));
    const inv = invertMatrix(regularized);
    if (!inv) break;
    covMat = inv;

    const delta = matVec(inv, XtRes);
    let maxStep = 0;
    for (let j = 0; j < p; j++) {
      beta[j] += delta[j];
      maxStep = Math.max(maxStep, Math.abs(delta[j]));
    }
    if (maxStep < 1e-8) break;
  }

  const etaFinal = matVec(X, beta);
  const probs = etaFinal.map((e) => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, e)))));
  const llModel = y.reduce(
    (s, yi, i) => s + yi * Math.log(Math.max(1e-15, probs[i])) + (1 - yi) * Math.log(Math.max(1e-15, 1 - probs[i])),
    0
  );
  const pNull = y.reduce((s, v) => s + v, 0) / n;
  const llNull =
    pNull > 0 && pNull < 1
      ? n * (pNull * Math.log(pNull) + (1 - pNull) * Math.log(1 - pNull))
      : -1e-6;
  const pseudoR2McFadden = Math.max(0, 1 - llModel / llNull);
  const aic = 2 * p - 2 * llModel;

  const zCrit = 1.9599639845;
  const names = ['Intercepto (β₀)', ...params.predictorCols];
  const coeficientes = names.map((nome, j) => {
    const b = beta[j];
    const se = covMat ? Math.sqrt(Math.max(1e-18, covMat[j][j])) : 1;
    const waldChi2 = (b / se) * (b / se);
    const pValor = chiSquarePValue(waldChi2, 1);
    const oddsRatio = Math.exp(Math.min(50, b));
    return {
      nome,
      beta: b,
      erroPadrao: se,
      waldChi2,
      pValor,
      oddsRatio,
      orIcInf: Math.exp(b - zCrit * se),
      orIcSup: Math.exp(b + zCrit * se),
    };
  });

  let vp = 0, vn = 0, fp = 0, fn = 0;
  y.forEach((yi, i) => {
    const pred = probs[i] >= 0.5 ? 1 : 0;
    if (yi === 1 && pred === 1) vp++;
    else if (yi === 0 && pred === 0) vn++;
    else if (yi === 0 && pred === 1) fp++;
    else fn++;
  });
  const acuraciaClassificacao = (vp + vn) / n;

  return {
    n,
    alpha,
    variavelResposta: `${params.responseCol} (evento = "${posVal}")`,
    preditoras: params.predictorCols,
    coeficientes,
    logVerossimilhanca: llModel,
    aic,
    pseudoR2McFadden,
    acuraciaClassificacao,
    matrizConfusao: { vp, vn, fp, fn },
    interpretacao: [
      `Modelo logístico ajustado sobre ${n} observações (evento positivo = "${posVal}"): Pseudo-R² de McFadden = ${pseudoR2McFadden.toFixed(4)}, AIC = ${aic.toFixed(2)}, acurácia = ${(acuraciaClassificacao * 100).toFixed(1)}%.`,
    ],
  };
}

// ============================================================================
// 3. DADOS CATEGÓRICOS — QUI-QUADRADO, EXATO DE FISHER E TESTE G
// ============================================================================

export interface CategoricalContingencyResult {
  linhasNomes: string[];
  colunasNomes: string[];
  observado: number[][];
  esperado: number[][];
  nTotal: number;
  gl: number;
  chi2Pearson: number;
  pValorChi2: number;
  chi2Yates?: number;
  pValorYates?: number;
  testeG: number;
  pValorG: number;
  fisherExatoP?: number;
  vCramer: number;
  alertaFrequenciasBaixas: boolean;
  interpretacao: string[];
}

function logFact(n: number): number {
  return logGamma(n + 1);
}

function hypergeomProb(a: number, b: number, c: number, d: number): number {
  const n = a + b + c + d;
  const lnP =
    logFact(a + b) +
    logFact(c + d) +
    logFact(a + c) +
    logFact(b + d) -
    logFact(n) -
    logFact(a) -
    logFact(b) -
    logFact(c) -
    logFact(d);
  return Math.exp(lnP);
}

export function runCategoricalContingency(
  rows: Record<string, any>[],
  rowCol: string,
  colCol: string,
  alpha = 0.05
): CategoricalContingencyResult {
  const rowSet = new Set<string>();
  const colSet = new Set<string>();
  const validPairs: [string, string][] = [];

  for (const r of rows) {
    const rv = r[rowCol] !== undefined && r[rowCol] !== null ? String(r[rowCol]).trim() : '';
    const cv = r[colCol] !== undefined && r[colCol] !== null ? String(r[colCol]).trim() : '';
    if (rv && cv) {
      rowSet.add(rv);
      colSet.add(cv);
      validPairs.push([rv, cv]);
    }
  }

  const linhasNomes = Array.from(rowSet);
  const colunasNomes = Array.from(colSet);
  if (linhasNomes.length < 2 || colunasNomes.length < 2) {
    throw new Error('Tabela de contingência exige ao menos 2 categorias em ambas as variáveis.');
  }

  const R = linhasNomes.length;
  const C = colunasNomes.length;
  const observado: number[][] = Array.from({ length: R }, () => new Array(C).fill(0));
  const rIdx = new Map(linhasNomes.map((n, i) => [n, i]));
  const cIdx = new Map(colunasNomes.map((n, j) => [n, j]));
  for (const [rv, cv] of validPairs) {
    observado[rIdx.get(rv)!][cIdx.get(cv)!] += 1;
  }

  const rowTotals = observado.map((r) => r.reduce((s, v) => s + v, 0));
  const colTotals = Array.from({ length: C }, (_, j) => observado.reduce((s, r) => s + r[j], 0));
  const nTotal = validPairs.length;

  const esperado: number[][] = Array.from({ length: R }, (_, i) =>
    Array.from({ length: C }, (_, j) => (rowTotals[i] * colTotals[j]) / nTotal)
  );

  let chi2Pearson = 0;
  let testeG = 0;
  let lowExpectedCount = 0;
  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      const O = observado[i][j];
      const E = esperado[i][j];
      if (E < 5) lowExpectedCount++;
      if (E > 0) {
        chi2Pearson += ((O - E) * (O - E)) / E;
        if (O > 0) testeG += 2 * O * Math.log(O / E);
      }
    }
  }

  const gl = (R - 1) * (C - 1);
  const pValorChi2 = chiSquarePValue(chi2Pearson, gl);
  const pValorG = chiSquarePValue(testeG, gl);
  const vCramer = Math.sqrt(chi2Pearson / Math.max(1, nTotal * Math.min(R - 1, C - 1)));
  const alertaFrequenciasBaixas = lowExpectedCount / (R * C) > 0.2;

  let chi2Yates: number | undefined;
  let pValorYates: number | undefined;
  let fisherExatoP: number | undefined;

  if (R === 2 && C === 2) {
    const a = observado[0][0], b = observado[0][1], c = observado[1][0], d = observado[1][1];
    const yatesNum = nTotal * Math.pow(Math.max(0, Math.abs(a * d - b * c) - 0.5 * nTotal), 2);
    const yatesDen = rowTotals[0] * rowTotals[1] * colTotals[0] * colTotals[1];
    chi2Yates = yatesDen > 0 ? yatesNum / yatesDen : 0;
    pValorYates = chiSquarePValue(chi2Yates, 1);

    // Teste exato de Fisher bicaudal
    const pObs = hypergeomProb(a, b, c, d);
    const minA = Math.max(0, rowTotals[0] - colTotals[1]);
    const maxA = Math.min(rowTotals[0], colTotals[0]);
    let pSum = 0;
    for (let x = minA; x <= maxA; x++) {
      const xb = rowTotals[0] - x;
      const xc = colTotals[0] - x;
      const xd = rowTotals[1] - xc;
      if (xb >= 0 && xc >= 0 && xd >= 0) {
        const px = hypergeomProb(x, xb, xc, xd);
        if (px <= pObs + 1e-12) pSum += px;
      }
    }
    fisherExatoP = Math.min(1, pSum);
  }

  const pPrincipal = R === 2 && C === 2 && alertaFrequenciasBaixas && fisherExatoP !== undefined ? fisherExatoP : pValorChi2;

  return {
    linhasNomes,
    colunasNomes,
    observado,
    esperado,
    nTotal,
    gl,
    chi2Pearson,
    pValorChi2,
    chi2Yates,
    pValorYates,
    testeG,
    pValorG,
    fisherExatoP,
    vCramer,
    alertaFrequenciasBaixas,
    interpretacao: [
      pPrincipal < alpha
        ? `Há associação estatisticamente significativa entre "${rowCol}" e "${colCol}" (χ² = ${chi2Pearson.toFixed(3)}, GL = ${gl}, p = ${pPrincipal.toFixed(4)} < ${alpha}, V de Cramér = ${vCramer.toFixed(3)}).`
        : `Não há evidência de associação entre "${rowCol}" e "${colCol}" (χ² = ${chi2Pearson.toFixed(3)}, GL = ${gl}, p = ${pPrincipal.toFixed(4)} ≥ ${alpha}).`,
      ...(alertaFrequenciasBaixas
        ? ['Mais de 20% das células possuem frequência esperada < 5; priorize o Teste Exato de Fisher (2×2) ou o Teste G.']
        : []),
    ],
  };
}

// ============================================================================
// 4. SOBREVIVÊNCIA — KAPLAN-MEIER & LOG-RANK
// ============================================================================

export interface KaplanMeierCurve {
  grupo: string;
  n: number;
  eventos: number;
  medianaSobrevivencia: number | null;
  pontos: { tempo: number; sobrevivencia: number; erroPadrao: number; nRisco: number; eventos: number }[];
}

export interface SurvivalAnalysisResult {
  curvas: KaplanMeierCurve[];
  logRankChi2?: number;
  logRankGl?: number;
  logRankPValor?: number;
  interpretacao: string[];
}

export function runKaplanMeierAnalysis(params: {
  rows: Record<string, any>[];
  timeCol: string;
  eventCol: string; // 1 = evento ocorrido, 0 = censurado
  groupCol?: string;
  alpha?: number;
}): SurvivalAnalysisResult {
  const alpha = params.alpha ?? 0.05;
  const toNum = (v: any): number | null => {
    if (v === null || v === undefined || v === '') return null;
    const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };

  interface Obs { t: number; e: number; g: string }
  const obs: Obs[] = [];
  for (const r of params.rows) {
    const t = toNum(r[params.timeCol]);
    const evRaw = r[params.eventCol];
    const eNum = toNum(evRaw);
    const e = eNum !== null ? (eNum > 0 ? 1 : 0) : ['sim', 'true', 'evento', '1', 'óbito'].includes(String(evRaw).toLowerCase()) ? 1 : 0;
    if (t !== null && t >= 0) {
      obs.push({
        t,
        e,
        g: params.groupCol && r[params.groupCol] ? String(r[params.groupCol]).trim() : 'Geral',
      });
    }
  }

  if (obs.length < 3) {
    throw new Error('Análise de sobrevivência exige ao menos 3 registros com tempo válido.');
  }

  const gruposNomes = Array.from(new Set(obs.map((o) => o.g)));
  const curvas: KaplanMeierCurve[] = [];

  for (const g of gruposNomes) {
    const sub = obs.filter((o) => o.g === g).sort((a, b) => a.t - b.t);
    const times = Array.from(new Set(sub.map((o) => o.t))).sort((a, b) => a - b);
    let surv = 1;
    let greenwoodSum = 0;
    let mediana: number | null = null;
    const pontos: KaplanMeierCurve['pontos'] = [
      { tempo: 0, sobrevivencia: 1, erroPadrao: 0, nRisco: sub.length, eventos: 0 },
    ];

    for (const t of times) {
      const nRisco = sub.filter((o) => o.t >= t).length;
      const eventosT = sub.filter((o) => o.t === t && o.e === 1).length;
      if (eventosT > 0 && nRisco > 0) {
        surv *= 1 - eventosT / nRisco;
        if (nRisco > eventosT) {
          greenwoodSum += eventosT / (nRisco * (nRisco - eventosT));
        }
        const se = surv * Math.sqrt(greenwoodSum);
        pontos.push({ tempo: t, sobrevivencia: surv, erroPadrao: se, nRisco, eventos: eventosT });
        if (mediana === null && surv <= 0.5) mediana = t;
      }
    }

    curvas.push({
      grupo: g,
      n: sub.length,
      eventos: sub.filter((o) => o.e === 1).length,
      medianaSobrevivencia: mediana,
      pontos,
    });
  }

  let logRankChi2: number | undefined;
  let logRankGl: number | undefined;
  let logRankPValor: number | undefined;

  if (gruposNomes.length >= 2) {
    const k = gruposNomes.length;
    const eventTimes = Array.from(new Set(obs.filter((o) => o.e === 1).map((o) => o.t))).sort((a, b) => a - b);
    const O = new Array<number>(k).fill(0);
    const E = new Array<number>(k).fill(0);
    const V: number[][] = Array.from({ length: k }, () => new Array(k).fill(0));

    for (const t of eventTimes) {
      const rAll = obs.filter((o) => o.t >= t);
      const nAll = rAll.length;
      const dAll = rAll.filter((o) => o.t === t && o.e === 1).length;
      if (nAll <= 1 || dAll === 0) continue;

      const nGrp = gruposNomes.map((g) => rAll.filter((o) => o.g === g).length);
      const dGrp = gruposNomes.map((g) => rAll.filter((o) => o.g === g && o.t === t && o.e === 1).length);

      for (let i = 0; i < k; i++) {
        O[i] += dGrp[i];
        E[i] += (nGrp[i] * dAll) / nAll;
        for (let j = 0; j < k; j++) {
          const covFactor = (dAll * (nAll - dAll)) / Math.max(1, nAll * nAll * (nAll - 1));
          V[i][j] += covFactor * nGrp[i] * ((i === j ? nAll : 0) - nGrp[j]);
        }
      }
    }

    // Submatriz (k-1) x (k-1)
    const km1 = k - 1;
    const diff = Array.from({ length: km1 }, (_, i) => O[i] - E[i]);
    const Vsub = Array.from({ length: km1 }, (_, i) => Array.from({ length: km1 }, (_, j) => V[i][j]));
    const Vinv = invertMatrix(Vsub);
    if (Vinv) {
      const VinvDiff = matVec(Vinv, diff);
      logRankChi2 = Math.max(0, diff.reduce((s, d, i) => s + d * VinvDiff[i], 0));
      logRankGl = km1;
      logRankPValor = chiSquarePValue(logRankChi2, logRankGl);
    }
  }

  void matMul;
  void transpose;

  const interpretacao: string[] = curvas.map(
    (c) =>
      `Grupo "${c.grupo}": n = ${c.n}, ${c.eventos} eventos ocorridos, mediana de sobrevivência = ${c.medianaSobrevivencia !== null ? c.medianaSobrevivencia.toFixed(2) : 'não atingida (>50% de sobrevida ao final)'}.`
  );
  if (logRankPValor !== undefined && logRankChi2 !== undefined) {
    interpretacao.push(
      logRankPValor < alpha
        ? `O teste Log-Rank apontou diferença significativa entre as curvas de sobrevivência (χ² = ${logRankChi2.toFixed(3)}, GL = ${logRankGl}, p = ${logRankPValor.toFixed(4)} < ${alpha}).`
        : `O teste Log-Rank não apontou diferença significativa entre as curvas (χ² = ${logRankChi2.toFixed(3)}, GL = ${logRankGl}, p = ${logRankPValor.toFixed(4)} ≥ ${alpha}).`
    );
  }

  return {
    curvas,
    logRankChi2,
    logRankGl,
    logRankPValor,
    interpretacao,
  };
}
