/**
 * Motor de Estatística Multivariada — GeaAgro Estatística
 *
 * - Análise de Componentes Principais (PCA) via decomposição espectral de Jacobi:
 *   * Seleção explícita de matriz de Correlação (padronizada) ou Covariância
 *   * Autovalores, autovetores, variância explicada/acumulada, scores e loadings (Biplot + Scree)
 * - Agrupamento Hierárquico (HCA):
 *   * Distâncias: Euclidiana, Manhattan, Correlação
 *   * Ligações: Simples, Completa, Média (UPGMA), Ward.D2
 *   * Árvore completa de fusão (Dendrograma) e atribuição de k clusters
 * - K-Means (inicialização determinística K-Means++ e índice Silhueta)
 */

import { symmetricEigenJacobi } from '../linear-models/linearAlgebra';

export interface PcaResult {
  matrizTipo: 'correlacao' | 'covariancia';
  variaveis: string[];
  nObservacoes: number;
  autovalores: number[];
  varianciaExplicadaPct: number[];
  varianciaAcumuladaPct: number[];
  autovetores: number[][]; // [componente][variavel]
  loadings: { variavel: string; pc1: number; pc2: number; comunalidade2Eixos: number }[];
  scores: { label: string; grupo?: string; pc1: number; pc2: number; coords: number[] }[];
  interpretacao: string[];
}

export type MetricaDistancia = 'euclidiana' | 'manhattan' | 'correlacao';
export type MetodoLigacao = 'ward' | 'average' | 'complete' | 'single';

export interface DendrogramNode {
  id: string;
  label?: string;
  height: number;
  size: number;
  left?: DendrogramNode;
  right?: DendrogramNode;
  leafIndices: number[];
}

export interface HierarchicalClusterResult {
  metricaDistancia: MetricaDistancia;
  metodoLigacao: MetodoLigacao;
  padronizadoZ: boolean;
  variaveis: string[];
  nObservacoes: number;
  kGrupos: number;
  dendrograma: DendrogramNode;
  fusoes: { passo: number; altura: number; tamanhoNovoCluster: number }[];
  atribuicoes: { obsIndex: number; rotulo: string; cluster: number }[];
  interpretacao: string[];
}

export interface KMeansResult {
  k: number;
  padronizadoZ: boolean;
  variaveis: string[];
  nObservacoes: number;
  inerciaWcss: number;
  silhuetaMedia: number;
  centroides: { cluster: number; valores: Record<string, number>; tamanho: number }[];
  atribuicoes: { obsIndex: number; rotulo: string; cluster: number }[];
  interpretacao: string[];
}

function extractCompleteMatrix(
  rows: Record<string, any>[],
  variaveis: string[],
  labelCol?: string,
  groupCol?: string
): { X: number[][]; labels: string[]; groups: (string | undefined)[] } {
  const toNum = (v: any): number | null => {
    if (v === null || v === undefined || v === '' || String(v).toUpperCase() === 'N/A') return null;
    const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };

  const X: number[][] = [];
  const labels: string[] = [];
  const groups: (string | undefined)[] = [];

  rows.forEach((r, idx) => {
    const vec: number[] = [];
    let ok = true;
    for (const vCol of variaveis) {
      const val = toNum(r[vCol]);
      if (val === null) {
        ok = false;
        break;
      }
      vec.push(val);
    }
    if (ok) {
      X.push(vec);
      labels.push(labelCol && r[labelCol] !== undefined ? String(r[labelCol]) : `Obs ${idx + 1}`);
      groups.push(groupCol && r[groupCol] !== undefined ? String(r[groupCol]) : undefined);
    }
  });

  if (X.length < 3 || variaveis.length < 2) {
    throw new Error('Análise multivariada exige pelo menos 3 observações completas e 2 variáveis numéricas.');
  }

  return { X, labels, groups };
}

function standardizeColumns(X: number[][]): { Z: number[][]; means: number[]; sds: number[] } {
  const n = X.length;
  const p = X[0].length;
  const means = Array.from({ length: p }, (_, j) => X.reduce((s, r) => s + r[j], 0) / n);
  const sds = Array.from({ length: p }, (_, j) => {
    const ss = X.reduce((s, r) => s + (r[j] - means[j]) * (r[j] - means[j]), 0);
    return Math.sqrt(Math.max(1e-18, ss / Math.max(1, n - 1)));
  });
  const Z = X.map((row) => row.map((val, j) => (val - means[j]) / sds[j]));
  return { Z, means, sds };
}

export function runPcaAnalysis(params: {
  rows: Record<string, any>[];
  variaveis: string[];
  matrizTipo: 'correlacao' | 'covariancia';
  labelCol?: string;
  groupCol?: string;
}): PcaResult {
  const { X, labels, groups } = extractCompleteMatrix(
    params.rows,
    params.variaveis,
    params.labelCol,
    params.groupCol
  );
  const n = X.length;
  const p = params.variaveis.length;
  const { Z, means } = standardizeColumns(X);

  const dataMat =
    params.matrizTipo === 'correlacao'
      ? Z
      : X.map((row) => row.map((val, j) => val - means[j]));

  // Matriz S (p x p)
  const S: number[][] = Array.from({ length: p }, () => new Array(p).fill(0));
  for (let i = 0; i < p; i++) {
    for (let j = i; j < p; j++) {
      let s = 0;
      for (let r = 0; r < n; r++) s += dataMat[r][i] * dataMat[r][j];
      s /= Math.max(1, n - 1);
      S[i][j] = s;
      S[j][i] = s;
    }
  }

  const { eigenvalues, eigenvectors } = symmetricEigenJacobi(S);
  const cleanVals = eigenvalues.map((v) => Math.max(0, v));
  const totalVar = Math.max(1e-18, cleanVals.reduce((s, v) => s + v, 0));

  const varianciaExplicadaPct = cleanVals.map((v) => (v / totalVar) * 100);
  const varianciaAcumuladaPct: number[] = [];
  let acc = 0;
  for (const pct of varianciaExplicadaPct) {
    acc += pct;
    varianciaAcumuladaPct.push(acc);
  }

  // Scores: T = dataMat * V
  const scores = dataMat.map((row, idx) => {
    const coords = eigenvectors.map((vec) => vec.reduce((s, w, j) => s + row[j] * w, 0));
    return {
      label: labels[idx],
      grupo: groups[idx],
      pc1: coords[0] ?? 0,
      pc2: coords[1] ?? 0,
      coords,
    };
  });

  // Loadings escalonados por sqrt(autovalor) (correlação variável-componente quando matriz=correlação)
  const sdsMat = Array.from({ length: p }, (_, j) => Math.sqrt(Math.max(1e-18, S[j][j])));
  const loadings = params.variaveis.map((variavel, j) => {
    const l1 =
      params.matrizTipo === 'correlacao'
        ? eigenvectors[0][j] * Math.sqrt(cleanVals[0] ?? 0)
        : (eigenvectors[0][j] * Math.sqrt(cleanVals[0] ?? 0)) / sdsMat[j];
    const l2 =
      p > 1
        ? params.matrizTipo === 'correlacao'
          ? eigenvectors[1][j] * Math.sqrt(cleanVals[1] ?? 0)
          : (eigenvectors[1][j] * Math.sqrt(cleanVals[1] ?? 0)) / sdsMat[j]
        : 0;
    return {
      variavel,
      pc1: l1,
      pc2: l2,
      comunalidade2Eixos: l1 * l1 + l2 * l2,
    };
  });

  const kaiserCount = cleanVals.filter((v) => (params.matrizTipo === 'correlacao' ? v >= 1 : v > totalVar / p)).length;

  return {
    matrizTipo: params.matrizTipo,
    variaveis: params.variaveis,
    nObservacoes: n,
    autovalores: cleanVals,
    varianciaExplicadaPct,
    varianciaAcumuladaPct,
    autovetores: eigenvectors,
    loadings,
    scores,
    interpretacao: [
      `PCA executada sobre a matriz de ${params.matrizTipo === 'correlacao' ? 'Correlação (variáveis padronizadas)' : 'Covariância (escala original)'} com ${n} observações e ${p} variáveis.`,
      `Os dois primeiros componentes principais (CP1 = ${varianciaExplicadaPct[0].toFixed(2)}%, CP2 = ${(varianciaExplicadaPct[1] ?? 0).toFixed(2)}%) explicam juntos ${(varianciaAcumuladaPct[Math.min(1, varianciaAcumuladaPct.length - 1)]).toFixed(2)}% da variância total.`,
      `Pelo critério de Kaiser (autovalor ≥ média), ${kaiserCount} componente(s) retêm informação superior à média individual das variáveis originais.`,
    ],
  };
}

function pairDistance(a: number[], b: number[], metrica: MetricaDistancia): number {
  const p = a.length;
  if (metrica === 'manhattan') {
    let s = 0;
    for (let j = 0; j < p; j++) s += Math.abs(a[j] - b[j]);
    return s;
  }
  if (metrica === 'correlacao') {
    const ma = a.reduce((s, v) => s + v, 0) / p;
    const mb = b.reduce((s, v) => s + v, 0) / p;
    let num = 0;
    let da = 0;
    let db = 0;
    for (let j = 0; j < p; j++) {
      num += (a[j] - ma) * (b[j] - mb);
      da += (a[j] - ma) * (a[j] - ma);
      db += (b[j] - mb) * (b[j] - mb);
    }
    const r = Math.sqrt(da * db) > 1e-18 ? num / Math.sqrt(da * db) : 0;
    return Math.max(0, 1 - r);
  }
  let sq = 0;
  for (let j = 0; j < p; j++) sq += (a[j] - b[j]) * (a[j] - b[j]);
  return Math.sqrt(sq);
}

export function runHierarchicalClustering(params: {
  rows: Record<string, any>[];
  variaveis: string[];
  metricaDistancia: MetricaDistancia;
  metodoLigacao: MetodoLigacao;
  padronizarZ: boolean;
  kGrupos?: number;
  labelCol?: string;
}): HierarchicalClusterResult {
  const { X, labels } = extractCompleteMatrix(params.rows, params.variaveis, params.labelCol);
  const n = X.length;
  const data = params.padronizarZ ? standardizeColumns(X).Z : X;
  const kGrupos = Math.max(1, Math.min(n, params.kGrupos || Math.min(3, n)));

  // Matriz inicial de distâncias
  const distMat: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = pairDistance(data[i], data[j], params.metricaDistancia);
      distMat[i][j] = d;
      distMat[j][i] = d;
    }
  }

  // Algoritmo de Lance-Williams mantendo lista de clusters ativos
  interface ActiveCluster {
    node: DendrogramNode;
    distMap: Map<number, number>; // id -> distância
    uid: number;
  }

  const clusters: ActiveCluster[] = Array.from({ length: n }, (_, i) => ({
    uid: i,
    node: {
      id: `leaf_${i}`,
      label: labels[i],
      height: 0,
      size: 1,
      leafIndices: [i],
    },
    distMap: new Map(),
  }));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) clusters[i].distMap.set(j, distMat[i][j]);
    }
  }

  let nextUid = n;
  const fusoes: { passo: number; altura: number; tamanhoNovoCluster: number }[] = [];
  let kCutNodes: DendrogramNode[] = [];

  for (let step = 1; step < n; step++) {
    if (clusters.length === kGrupos) {
      kCutNodes = clusters.map((c) => c.node);
    }

    let bestI = 0;
    let bestJ = 1;
    let bestDist = Infinity;
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const d = clusters[i].distMap.get(clusters[j].uid) ?? Infinity;
        if (d < bestDist) {
          bestDist = d;
          bestI = i;
          bestJ = j;
        }
      }
    }

    const cA = clusters[bestI];
    const cB = clusters[bestJ];
    const nA = cA.node.size;
    const nB = cB.node.size;
    const mergedUid = nextUid++;

    const mergedNode: DendrogramNode = {
      id: `node_${step}`,
      height: bestDist,
      size: nA + nB,
      left: cA.node,
      right: cB.node,
      leafIndices: [...cA.node.leafIndices, ...cB.node.leafIndices],
    };

    const newDistMap = new Map<number, number>();
    for (let idx = 0; idx < clusters.length; idx++) {
      if (idx === bestI || idx === bestJ) continue;
      const cK = clusters[idx];
      const nK = cK.node.size;
      const dAK = cA.distMap.get(cK.uid) ?? 0;
      const dBK = cB.distMap.get(cK.uid) ?? 0;

      let dNew = 0;
      if (params.metodoLigacao === 'single') {
        dNew = Math.min(dAK, dBK);
      } else if (params.metodoLigacao === 'complete') {
        dNew = Math.max(dAK, dBK);
      } else if (params.metodoLigacao === 'average') {
        dNew = (nA * dAK + nB * dBK) / (nA + nB);
      } else {
        // Ward.D2 (Lance-Williams sobre distâncias euclidianas)
        const tot = nA + nB + nK;
        const dSq =
          ((nA + nK) * dAK * dAK + (nB + nK) * dBK * dBK - nK * bestDist * bestDist) / tot;
        dNew = Math.sqrt(Math.max(0, dSq));
      }

      newDistMap.set(cK.uid, dNew);
      cK.distMap.delete(cA.uid);
      cK.distMap.delete(cB.uid);
      cK.distMap.set(mergedUid, dNew);
    }

    // Remover bestJ antes de bestI
    clusters.splice(bestJ, 1);
    clusters.splice(bestI, 1);
    clusters.push({ uid: mergedUid, node: mergedNode, distMap: newDistMap });

    fusoes.push({
      passo: step,
      altura: bestDist,
      tamanhoNovoCluster: mergedNode.size,
    });
  }

  if (kGrupos === 1) {
    kCutNodes = [clusters[0].node];
  } else if (kCutNodes.length === 0) {
    kCutNodes = clusters.map((c) => c.node);
  }

  const leafClusterMap = new Map<number, number>();
  kCutNodes.forEach((node, cIdx) => {
    node.leafIndices.forEach((leafIdx) => leafClusterMap.set(leafIdx, cIdx + 1));
  });

  const atribuicoes = labels.map((rotulo, obsIndex) => ({
    obsIndex: obsIndex + 1,
    rotulo,
    cluster: leafClusterMap.get(obsIndex) || 1,
  }));

  return {
    metricaDistancia: params.metricaDistancia,
    metodoLigacao: params.metodoLigacao,
    padronizadoZ: params.padronizarZ,
    variaveis: params.variaveis,
    nObservacoes: n,
    kGrupos,
    dendrograma: clusters[0].node,
    fusoes,
    atribuicoes,
    interpretacao: [
      `Agrupamento hierárquico (${params.metodoLigacao.toUpperCase()}) com distância ${params.metricaDistancia} sobre ${n} observações (${params.padronizarZ ? 'escala Z padronizada' : 'escala original'}).`,
      `Corte para k = ${kGrupos} grupos definido em distância de fusão correspondente.`,
    ],
  };
}

export function runKMeansClustering(params: {
  rows: Record<string, any>[];
  variaveis: string[];
  k: number;
  padronizarZ: boolean;
  labelCol?: string;
}): KMeansResult {
  const { X, labels } = extractCompleteMatrix(params.rows, params.variaveis, params.labelCol);
  const n = X.length;
  const p = params.variaveis.length;
  const k = Math.max(2, Math.min(n - 1, params.k));
  const data = params.padronizarZ ? standardizeColumns(X).Z : X;

  // Inicialização determinística tipo K-Means++ (primeiro centróide = observação mais próxima da média global)
  const globalMean = Array.from({ length: p }, (_, j) => data.reduce((s, r) => s + r[j], 0) / n);
  let firstIdx = 0;
  let minD = Infinity;
  data.forEach((r, i) => {
    const d = pairDistance(r, globalMean, 'euclidiana');
    if (d < minD) {
      minD = d;
      firstIdx = i;
    }
  });

  const centers: number[][] = [[...data[firstIdx]]];
  while (centers.length < k) {
    let farthestIdx = 0;
    let maxDist = -1;
    for (let i = 0; i < n; i++) {
      const minDistToC = Math.min(...centers.map((c) => pairDistance(data[i], c, 'euclidiana')));
      if (minDistToC > maxDist) {
        maxDist = minDistToC;
        farthestIdx = i;
      }
    }
    centers.push([...data[farthestIdx]]);
  }

  const assignments = new Array<number>(n).fill(0);
  for (let iter = 0; iter < 100; iter++) {
    let changed = false;
    for (let i = 0; i < n; i++) {
      let bestC = 0;
      let bestD = Infinity;
      for (let c = 0; c < k; c++) {
        const d = pairDistance(data[i], centers[c], 'euclidiana');
        if (d < bestD) {
          bestD = d;
          bestC = c;
        }
      }
      if (assignments[i] !== bestC) {
        assignments[i] = bestC;
        changed = true;
      }
    }

    for (let c = 0; c < k; c++) {
      const members = data.filter((_, i) => assignments[i] === c);
      if (members.length > 0) {
        centers[c] = Array.from(
          { length: p },
          (_, j) => members.reduce((s, m) => s + m[j], 0) / members.length
        );
      }
    }
    if (!changed) break;
  }

  let wcss = 0;
  for (let i = 0; i < n; i++) {
    const d = pairDistance(data[i], centers[assignments[i]], 'euclidiana');
    wcss += d * d;
  }

  // Cálculo do coeficiente de Silhueta médio
  let silSum = 0;
  for (let i = 0; i < n; i++) {
    const cI = assignments[i];
    const same = data.filter((_, j) => j !== i && assignments[j] === cI);
    const aI =
      same.length > 0
        ? same.reduce((s, r) => s + pairDistance(data[i], r, 'euclidiana'), 0) / same.length
        : 0;
    let bI = Infinity;
    for (let c = 0; c < k; c++) {
      if (c === cI) continue;
      const other = data.filter((_, j) => assignments[j] === c);
      if (other.length > 0) {
        const avgD = other.reduce((s, r) => s + pairDistance(data[i], r, 'euclidiana'), 0) / other.length;
        if (avgD < bI) bI = avgD;
      }
    }
    const denom = Math.max(aI, bI);
    silSum += denom > 1e-18 ? (bI - aI) / denom : 0;
  }
  const silhuetaMedia = silSum / n;

  // Centróides na escala original
  const centroides = Array.from({ length: k }, (_, c) => {
    const origMembers = X.filter((_, i) => assignments[i] === c);
    const valores: Record<string, number> = {};
    params.variaveis.forEach((vCol, j) => {
      valores[vCol] =
        origMembers.length > 0
          ? origMembers.reduce((s, r) => s + r[j], 0) / origMembers.length
          : 0;
    });
    return { cluster: c + 1, valores, tamanho: origMembers.length };
  });

  const atribuicoes = labels.map((rotulo, i) => ({
    obsIndex: i + 1,
    rotulo,
    cluster: assignments[i] + 1,
  }));

  return {
    k,
    padronizadoZ: params.padronizarZ,
    variaveis: params.variaveis,
    nObservacoes: n,
    inerciaWcss: wcss,
    silhuetaMedia,
    centroides,
    atribuicoes,
    interpretacao: [
      `Particionamento K-Means em k = ${k} grupos convergiu com inércia (WCSS) = ${wcss.toFixed(3)}.`,
      `Índice de Silhueta médio = ${silhuetaMedia.toFixed(3)} (${silhuetaMedia >= 0.5 ? 'boa separação entre grupos' : silhuetaMedia >= 0.25 ? 'estrutura moderada' : 'grupos sobrepostos ou fracos'}).`,
    ],
  };
}
