/**
 * Motor de Estatística Não Paramétrica — GeaAgro Estatística
 *
 * Métodos implementados com correção exata de empates (ties):
 * - Kruskal-Wallis + Pós-teste de Dunn (com ajuste de Holm ou Bonferroni e letras)
 * - Mann-Whitney U (Wilcoxon rank-sum) com correlação rank-biserial
 * - Teste de Wilcoxon pareado (Signed-Rank)
 * - Teste de Friedman (blocos) + Pós-teste de Nemenyi/Dunn com letras
 */

import {
  chiSquarePValue,
  normalCdf,
  rankWithTies,
  studentizedRangePValue,
} from '../distributions/distributions';

export interface NonParametricGroupSummary {
  grupo: string;
  n: number;
  mediana: number;
  q1: number;
  q3: number;
  iqr: number;
  mediaPostos: number;
  somaPostos: number;
  letra?: string;
}

export interface DunnPairComparison {
  grupoA: string;
  grupoB: string;
  diferencaPostosMedios: number;
  zEstatistica: number;
  pBruto: number;
  pAjustado: number;
  significativo: boolean;
}

export interface KruskalWallisResult {
  teste: 'Kruskal-Wallis + Dunn';
  alpha: number;
  metodoAjuste: 'holm' | 'bonferroni';
  nTotal: number;
  kGrupos: number;
  estatisticaH: number;
  gl: number;
  pValor: number;
  etaQuadradoH: number;
  grupos: NonParametricGroupSummary[];
  postHocDunn: DunnPairComparison[];
  interpretacao: string[];
}

export interface MannWhitneyResult {
  teste: 'Mann-Whitney U';
  alpha: number;
  grupoA: string;
  grupoB: string;
  nA: number;
  nB: number;
  medianaA: number;
  medianaB: number;
  uEstatistica: number;
  zEstatistica: number;
  pValor: number;
  rRankBiserial: number;
  significativo: boolean;
  interpretacao: string[];
}

export interface WilcoxonPairedResult {
  teste: 'Wilcoxon Pareado (Signed-Rank)';
  alpha: number;
  nTotalPares: number;
  nParesNaoNulos: number;
  somaPostosPositivos: number;
  somaPostosNegativos: number;
  estatisticaW: number;
  zEstatistica: number;
  pValor: number;
  medianaDiferencas: number;
  significativo: boolean;
  interpretacao: string[];
}

export interface FriedmanResult {
  teste: 'Friedman';
  alpha: number;
  nBlocos: number;
  kTratamentos: number;
  chi2Friedman: number;
  gl: number;
  pValor: number;
  wKendall: number;
  tratamentos: NonParametricGroupSummary[];
  postHoc: DunnPairComparison[];
  interpretacao: string[];
}

function quantilesForArray(vals: number[]): { mediana: number; q1: number; q3: number } {
  const s = [...vals].sort((a, b) => a - b);
  const q = (p: number) => {
    if (s.length === 0) return NaN;
    if (s.length === 1) return s[0];
    const pos = p * (s.length - 1);
    const lo = Math.floor(pos);
    const hi = Math.ceil(pos);
    return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]);
  };
  return { mediana: q(0.5), q1: q(0.25), q3: q(0.75) };
}

function assignRankLetters(
  groups: { grupo: string; mediaPostos: number }[],
  sigPairs: Set<string>
): Map<string, string> {
  const ordered = [...groups].sort((a, b) => b.mediaPostos - a.mediaPostos);
  const k = ordered.length;
  const keyOf = (a: string, b: string) => [a, b].sort().join('||');
  const ns: boolean[][] = Array.from({ length: k }, (_, i) =>
    Array.from({ length: k }, (_, j) => (i === j ? true : !sigPairs.has(keyOf(ordered[i].grupo, ordered[j].grupo))))
  );
  const cliques: number[][] = [];
  for (let i = 0; i < k; i++) {
    const cl = [i];
    for (let j = i + 1; j < k; j++) {
      if (cl.every((idx) => ns[idx][j])) cl.push(j);
    }
    if (!cliques.some((c) => cl.every((idx) => c.includes(idx)))) cliques.push(cl);
  }
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const map = new Map<string, string>();
  ordered.forEach((g) => map.set(g.grupo, ''));
  cliques.forEach((cl, idx) => {
    const ch = letters[idx % letters.length];
    cl.forEach((i) => map.set(ordered[i].grupo, (map.get(ordered[i].grupo) || '') + ch));
  });
  return map;
}

export function runKruskalWallis(
  gruposInput: { grupo: string; valores: number[] }[],
  alpha = 0.05,
  metodoAjuste: 'holm' | 'bonferroni' = 'holm'
): KruskalWallisResult {
  const nonEmpty = gruposInput.filter((g) => g.valores.length > 0);
  if (nonEmpty.length < 2) {
    throw new Error('Kruskal-Wallis exige pelo menos 2 grupos com observações válidas.');
  }

  const allValues: number[] = [];
  const groupIndices: number[] = [];
  nonEmpty.forEach((g, gIdx) => {
    for (const v of g.valores) {
      allValues.push(v);
      groupIndices.push(gIdx);
    }
  });

  const N = allValues.length;
  const k = nonEmpty.length;
  const { ranks, tieCorrectionSum } = rankWithTies(allValues);

  const rankSums = new Array<number>(k).fill(0);
  const counts = new Array<number>(k).fill(0);
  ranks.forEach((r, i) => {
    rankSums[groupIndices[i]] += r;
    counts[groupIndices[i]] += 1;
  });

  let sumSqMeanRank = 0;
  for (let g = 0; g < k; g++) {
    sumSqMeanRank += (rankSums[g] * rankSums[g]) / counts[g];
  }
  const Hraw = (12 / (N * (N + 1))) * sumSqMeanRank - 3 * (N + 1);
  const tieFactor = 1 - tieCorrectionSum / Math.max(1, N * N * N - N);
  const estatisticaH = tieFactor > 1e-12 ? Math.max(0, Hraw / tieFactor) : Hraw;
  const gl = k - 1;
  const pValor = chiSquarePValue(estatisticaH, gl);
  const etaQuadradoH = N > k ? Math.max(0, (estatisticaH - k + 1) / (N - k)) : 0;

  // Pós-teste de Dunn com correção de empates
  const tieAdjDunn = tieCorrectionSum / (12 * (N - 1));
  const baseFactor = (N * (N + 1)) / 12 - tieAdjDunn;

  const rawPairs: {
    grupoA: string;
    grupoB: string;
    diff: number;
    z: number;
    pBruto: number;
  }[] = [];

  for (let i = 0; i < k; i++) {
    const mrA = rankSums[i] / counts[i];
    for (let j = i + 1; j < k; j++) {
      const mrB = rankSums[j] / counts[j];
      const se = Math.sqrt(Math.max(1e-18, baseFactor * (1 / counts[i] + 1 / counts[j])));
      const z = Math.abs(mrA - mrB) / se;
      const pBruto = Math.min(1, Math.max(0, 2 * (1 - normalCdf(z))));
      rawPairs.push({
        grupoA: nonEmpty[i].grupo,
        grupoB: nonEmpty[j].grupo,
        diff: mrA - mrB,
        z,
        pBruto,
      });
    }
  }

  const mPairs = rawPairs.length;
  const postHocDunn: DunnPairComparison[] = new Array(mPairs);
  if (metodoAjuste === 'bonferroni') {
    rawPairs.forEach((p, idx) => {
      const pAdj = Math.min(1, p.pBruto * mPairs);
      postHocDunn[idx] = {
        grupoA: p.grupoA,
        grupoB: p.grupoB,
        diferencaPostosMedios: p.diff,
        zEstatistica: p.z,
        pBruto: p.pBruto,
        pAjustado: pAdj,
        significativo: pAdj < alpha,
      };
    });
  } else {
    // Holm step-down
    const sortedIdx = rawPairs.map((_, i) => i).sort((a, b) => rawPairs[a].pBruto - rawPairs[b].pBruto);
    let maxPrev = 0;
    sortedIdx.forEach((origIdx, step) => {
      const mult = mPairs - step;
      const pAdj = Math.min(1, Math.max(maxPrev, rawPairs[origIdx].pBruto * mult));
      maxPrev = pAdj;
      const p = rawPairs[origIdx];
      postHocDunn[origIdx] = {
        grupoA: p.grupoA,
        grupoB: p.grupoB,
        diferencaPostosMedios: p.diff,
        zEstatistica: p.z,
        pBruto: p.pBruto,
        pAjustado: pAdj,
        significativo: pAdj < alpha,
      };
    });
  }

  const sigPairs = new Set<string>();
  postHocDunn.forEach((p) => {
    if (p.significativo) sigPairs.add([p.grupoA, p.grupoB].sort().join('||'));
  });

  const baseSummaries = nonEmpty.map((g, idx) => {
    const qs = quantilesForArray(g.valores);
    return {
      grupo: g.grupo,
      n: g.valores.length,
      mediana: qs.mediana,
      q1: qs.q1,
      q3: qs.q3,
      iqr: qs.q3 - qs.q1,
      mediaPostos: rankSums[idx] / counts[idx],
      somaPostos: rankSums[idx],
    };
  });

  const letterMap = assignRankLetters(baseSummaries, sigPairs);
  const grupos = baseSummaries
    .map((g) => ({ ...g, letra: letterMap.get(g.grupo) || 'a' }))
    .sort((a, b) => b.mediaPostos - a.mediaPostos);

  const interpretacao: string[] = [
    pValor < alpha
      ? `O teste de Kruskal-Wallis indicou diferença estatisticamente significativa entre os grupos (H = ${estatisticaH.toFixed(3)}, GL = ${gl}, p = ${pValor < 0.0001 ? '< 0,0001' : pValor.toFixed(4)} < ${alpha}, tamanho de efeito η²_H = ${etaQuadradoH.toFixed(3)}).`
      : `O teste de Kruskal-Wallis não indicou diferença significativa entre os grupos (H = ${estatisticaH.toFixed(3)}, GL = ${gl}, p = ${pValor.toFixed(4)} ≥ ${alpha}).`,
    `Pós-teste de Dunn com ajuste de multiplicidade (${metodoAjuste === 'holm' ? 'Holm-Bonferroni' : 'Bonferroni'}) aplicado sobre os postos médios.`,
  ];

  return {
    teste: 'Kruskal-Wallis + Dunn',
    alpha,
    metodoAjuste,
    nTotal: N,
    kGrupos: k,
    estatisticaH,
    gl,
    pValor,
    etaQuadradoH,
    grupos,
    postHocDunn,
    interpretacao,
  };
}

export function runMannWhitney(
  grupoA: { nome: string; valores: number[] },
  grupoB: { nome: string; valores: number[] },
  alpha = 0.05
): MannWhitneyResult {
  const nA = grupoA.valores.length;
  const nB = grupoB.valores.length;
  if (nA === 0 || nB === 0) throw new Error('Mann-Whitney exige observações em ambos os grupos.');

  const combined = [...grupoA.valores, ...grupoB.valores];
  const { ranks, tieCorrectionSum } = rankWithTies(combined);
  const N = nA + nB;

  let rSumA = 0;
  for (let i = 0; i < nA; i++) rSumA += ranks[i];
  const uA = rSumA - (nA * (nA + 1)) / 2;
  const uB = nA * nB - uA;
  const uEstatistica = Math.min(uA, uB);

  const muU = (nA * nB) / 2;
  const varU = ((nA * nB) / 12) * (N + 1 - tieCorrectionSum / Math.max(1, N * (N - 1)));
  const sdU = Math.sqrt(Math.max(1e-18, varU));
  const corr = uEstatistica < muU ? 0.5 : uEstatistica > muU ? -0.5 : 0;
  const zEstatistica = Math.abs((uEstatistica - muU + corr) / sdU);
  const pValor = Math.min(1, Math.max(0, 2 * (1 - normalCdf(zEstatistica))));
  const rRankBiserial = 1 - (2 * uEstatistica) / (nA * nB);

  const medA = quantilesForArray(grupoA.valores).mediana;
  const medB = quantilesForArray(grupoB.valores).mediana;
  const significativo = pValor < alpha;

  return {
    teste: 'Mann-Whitney U',
    alpha,
    grupoA: grupoA.nome,
    grupoB: grupoB.nome,
    nA,
    nB,
    medianaA: medA,
    medianaB: medB,
    uEstatistica,
    zEstatistica,
    pValor,
    rRankBiserial,
    significativo,
    interpretacao: [
      significativo
        ? `Há diferença estatisticamente significativa entre "${grupoA.nome}" (mediana = ${medA.toFixed(4)}) e "${grupoB.nome}" (mediana = ${medB.toFixed(4)}) pelo teste de Mann-Whitney (U = ${uEstatistica.toFixed(2)}, Z = ${zEstatistica.toFixed(3)}, p = ${pValor.toFixed(4)} < ${alpha}).`
        : `Não há evidência de diferença significativa entre "${grupoA.nome}" (mediana = ${medA.toFixed(4)}) e "${grupoB.nome}" (mediana = ${medB.toFixed(4)}) (U = ${uEstatistica.toFixed(2)}, p = ${pValor.toFixed(4)} ≥ ${alpha}).`,
    ],
  };
}

export function runWilcoxonPaired(
  amostraA: number[],
  amostraB: number[],
  alpha = 0.05
): WilcoxonPairedResult {
  if (amostraA.length !== amostraB.length || amostraA.length < 3) {
    throw new Error('Wilcoxon pareado exige dois vetores de mesmo tamanho (≥ 3 pares).');
  }

  const diffs = amostraA.map((a, i) => a - amostraB[i]);
  const nonZero = diffs.filter((d) => Math.abs(d) > 1e-15);
  const n = nonZero.length;
  if (n === 0) {
    return {
      teste: 'Wilcoxon Pareado (Signed-Rank)',
      alpha,
      nTotalPares: diffs.length,
      nParesNaoNulos: 0,
      somaPostosPositivos: 0,
      somaPostosNegativos: 0,
      estatisticaW: 0,
      zEstatistica: 0,
      pValor: 1,
      medianaDiferencas: 0,
      significativo: false,
      interpretacao: ['Todas as diferenças pareadas são nulas (p = 1,0000).'],
    };
  }

  const absDiffs = nonZero.map(Math.abs);
  const { ranks, tieCorrectionSum } = rankWithTies(absDiffs);
  let wPlus = 0;
  let wMinus = 0;
  nonZero.forEach((d, idx) => {
    if (d > 0) wPlus += ranks[idx];
    else wMinus += ranks[idx];
  });

  const W = Math.min(wPlus, wMinus);
  const meanW = (n * (n + 1)) / 4;
  const varW = (n * (n + 1) * (2 * n + 1)) / 24 - tieCorrectionSum / 48;
  const sdW = Math.sqrt(Math.max(1e-18, varW));
  const z = Math.abs((W - meanW + (W < meanW ? 0.5 : -0.5)) / sdW);
  const pValor = Math.min(1, Math.max(0, 2 * (1 - normalCdf(z))));
  const medDiff = quantilesForArray(diffs).mediana;

  return {
    teste: 'Wilcoxon Pareado (Signed-Rank)',
    alpha,
    nTotalPares: diffs.length,
    nParesNaoNulos: n,
    somaPostosPositivos: wPlus,
    somaPostosNegativos: wMinus,
    estatisticaW: W,
    zEstatistica: z,
    pValor,
    medianaDiferencas: medDiff,
    significativo: pValor < alpha,
    interpretacao: [
      pValor < alpha
        ? `Diferença pareada estatisticamente significativa pelo teste de Wilcoxon (W = ${W.toFixed(1)}, Z = ${z.toFixed(3)}, p = ${pValor.toFixed(4)} < ${alpha}, mediana das diferenças = ${medDiff.toFixed(4)}).`
        : `Não foi detectada diferença pareada significativa pelo teste de Wilcoxon (W = ${W.toFixed(1)}, p = ${pValor.toFixed(4)} ≥ ${alpha}).`,
    ],
  };
}

export function runFriedmanTest(
  rows: Record<string, any>[],
  tratCol: string,
  blocoCol: string,
  respCol: string,
  alpha = 0.05
): FriedmanResult {
  const toNum = (v: any): number | null => {
    if (v === null || v === undefined || v === '' || String(v).toUpperCase() === 'N/A') return null;
    const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };

  const blocos = Array.from(new Set(rows.map((r) => String(r[blocoCol] ?? '').trim()).filter(Boolean)));
  const trats = Array.from(new Set(rows.map((r) => String(r[tratCol] ?? '').trim()).filter(Boolean)));
  if (blocos.length < 2 || trats.length < 2) {
    throw new Error('Friedman exige ≥ 2 blocos e ≥ 2 tratamentos.');
  }

  // Matriz blocos completos × tratamentos
  const matrix: number[][] = [];
  for (const b of blocos) {
    const valsInBlock: number[] = [];
    let complete = true;
    for (const t of trats) {
      const match = rows.find(
        (r) => String(r[blocoCol] ?? '').trim() === b && String(r[tratCol] ?? '').trim() === t
      );
      const y = match ? toNum(match[respCol]) : null;
      if (y === null) {
        complete = false;
        break;
      }
      valsInBlock.push(y);
    }
    if (complete) matrix.push(valsInBlock);
  }

  const nBlocos = matrix.length;
  const k = trats.length;
  if (nBlocos < 2) {
    throw new Error('O teste de Friedman exige blocos completos sem células ausentes (ao menos 2 blocos completos).');
  }

  const rankSums = new Array<number>(k).fill(0);
  const colValues: number[][] = Array.from({ length: k }, () => []);
  let tieSumTotal = 0;

  for (const row of matrix) {
    const { ranks, tieCorrectionSum } = rankWithTies(row);
    tieSumTotal += tieCorrectionSum;
    ranks.forEach((rk, j) => {
      rankSums[j] += rk;
      colValues[j].push(row[j]);
    });
  }

  const sumR2 = rankSums.reduce((s, r) => s + r * r, 0);
  const denom = nBlocos * k * (k + 1) - tieSumTotal / Math.max(1, k - 1);
  const chi2Friedman = denom > 1e-18 ? Math.max(0, (12 * sumR2) / denom - 3 * nBlocos * (k + 1)) : 0;
  const gl = k - 1;
  const pValor = chiSquarePValue(chi2Friedman, gl);
  const wKendall = chi2Friedman / (nBlocos * (k - 1));

  // Pós-teste de Nemenyi para dados blocados (q_inf / sqrt(2))
  const seNemenyi = Math.sqrt((k * (k + 1)) / (6 * nBlocos));
  const postHoc: DunnPairComparison[] = [];
  const sigPairs = new Set<string>();

  for (let i = 0; i < k; i++) {
    const mrA = rankSums[i] / nBlocos;
    for (let j = i + 1; j < k; j++) {
      const mrB = rankSums[j] / nBlocos;
      const diff = mrA - mrB;
      const qObs = Math.abs(diff) * Math.SQRT2 / Math.max(1e-18, seNemenyi);
      const pAdj = studentizedRangePValue(qObs, k, 1e6);
      const sig = pAdj < alpha;
      if (sig) sigPairs.add([trats[i], trats[j]].sort().join('||'));
      postHoc.push({
        grupoA: trats[i],
        grupoB: trats[j],
        diferencaPostosMedios: diff,
        zEstatistica: Math.abs(diff) / Math.max(1e-18, seNemenyi),
        pBruto: pAdj,
        pAjustado: pAdj,
        significativo: sig,
      });
    }
  }

  const base = trats.map((t, j) => {
    const qs = quantilesForArray(colValues[j]);
    return {
      grupo: t,
      n: nBlocos,
      mediana: qs.mediana,
      q1: qs.q1,
      q3: qs.q3,
      iqr: qs.q3 - qs.q1,
      mediaPostos: rankSums[j] / nBlocos,
      somaPostos: rankSums[j],
    };
  });

  const letters = assignRankLetters(base, sigPairs);
  const tratamentos = base
    .map((g) => ({ ...g, letra: letters.get(g.grupo) || 'a' }))
    .sort((a, b) => b.mediaPostos - a.mediaPostos);

  return {
    teste: 'Friedman',
    alpha,
    nBlocos,
    kTratamentos: k,
    chi2Friedman,
    gl,
    pValor,
    wKendall,
    tratamentos,
    postHoc,
    interpretacao: [
      pValor < alpha
        ? `O teste de Friedman revelou efeito significativo dos tratamentos nos ${nBlocos} blocos completos (χ²_F = ${chi2Friedman.toFixed(3)}, GL = ${gl}, p = ${pValor.toFixed(4)} < ${alpha}, W de Kendall = ${wKendall.toFixed(3)}).`
        : `O teste de Friedman não detectou diferença significativa entre tratamentos (χ²_F = ${chi2Friedman.toFixed(3)}, GL = ${gl}, p = ${pValor.toFixed(4)} ≥ ${alpha}).`,
    ],
  };
}
