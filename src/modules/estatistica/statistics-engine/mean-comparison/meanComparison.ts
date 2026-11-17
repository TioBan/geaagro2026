/**
 * Motor de Comparação Múltipla de Médias — GeaAgro Estatística
 *
 * Métodos suportados com cálculo exato de distribuições (zero tabelas truncadas):
 * - Tukey HSD (distribuição da amplitude estudentizada q, inclusive Kramer-Tukey para desbalanceamento)
 * - Scott-Knott (agrupamento hierárquico livre de ambiguidade via razão de verossimilhança B₀ e χ² crítico)
 * - Duncan MRT (amplitudes estudentizadas múltiplas α_p = 1 - (1 - α)^{p - 1})
 * - Dunnett (comparação contra testemunha selecionada, distribuição d bicaudal ou unicaudal)
 * - Fisher LSD (protegido/não protegido via distribuição t de Student)
 * - Teste t de Student (Amostras Independentes igual/Welch ou Pareado)
 *
 * Gera automaticamente letras distintas de agrupamento (CLD - Compact Letter Display).
 */

import {
  chiSquareQuantile,
  dunnettQuantile,
  normalCdf,
  studentizedRangePValue,
  studentizedRangeQuantile,
  tPValueTwoTailed,
  tQuantile,
} from '../distributions/distributions';

export type MetodoComparacaoMedias =
  | 'tukey'
  | 'scott_knott'
  | 'duncan'
  | 'dunnett'
  | 'lsd'
  | 'teste_t';

export interface GrupoMediaResumo {
  grupo: string;
  n: number;
  media: number;
  dp: number;
  epm: number;
  letra: string;
  grupoScottKnott?: string;
}

export interface ParComparacaoMedias {
  grupoA: string;
  grupoB: string;
  diferenca: number;
  erroPadraoDif: number;
  estatistica: number;
  valorCritico: number;
  dms: number;
  pValor: number | null;
  significativo: boolean;
}

export interface MeanComparisonResult {
  metodo: MetodoComparacaoMedias;
  alpha: number;
  dfErro: number;
  qmErro: number;
  testemunha?: string;
  valorCriticoPrincipal: number;
  dmsMedio: number;
  gruposOrdenados: GrupoMediaResumo[];
  comparacoesPares: ParComparacaoMedias[];
  observacoes: string[];
  interpretacao: string[];
}

/**
 * Algoritmo padrão de Compact Letter Display (Piepho 2004 / clique-absorption simplificado):
 * Duas médias compartilham pelo menos uma letra se NÃO diferem significativamente entre si.
 */
function buildCompactLetters(
  sortedGroups: { grupo: string; media: number }[],
  isSignificant: (g1: string, g2: string) => boolean
): Map<string, string> {
  const k = sortedGroups.length;
  const labels = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // Matriz de não-significância (ns) entre i < j
  const ns: boolean[][] = Array.from({ length: k }, (_, i) =>
    Array.from({ length: k }, (_, j) => (i === j ? true : !isSignificant(sortedGroups[i].grupo, sortedGroups[j].grupo)))
  );

  // Encontrar blocos contíguos / cliques maximais na matriz de não-significância
  const cliques: number[][] = [];
  for (let i = 0; i < k; i++) {
    // Tenta estender clique começando em i
    const clique = [i];
    for (let j = i + 1; j < k; j++) {
      if (clique.every((idx) => ns[idx][j])) {
        clique.push(j);
      }
    }
    // Verificar se esse clique já é subconjunto de um anterior
    const alreadyCovered = cliques.some((c) => clique.every((idx) => c.includes(idx)));
    if (!alreadyCovered) {
      cliques.push(clique);
    }
  }

  // Verificar pares não-significantes não contíguos que eventualmente faltaram
  for (let i = 0; i < k; i++) {
    for (let j = i + 1; j < k; j++) {
      if (ns[i][j]) {
        const covered = cliques.some((c) => c.includes(i) && c.includes(j));
        if (!covered) {
          const newClique = [i, j];
          for (let m = 0; m < k; m++) {
            if (m !== i && m !== j && newClique.every((idx) => ns[idx][m])) {
              newClique.push(m);
            }
          }
          cliques.push(newClique.sort((a, b) => a - b));
        }
      }
    }
  }

  const lettersMap = new Map<string, string>();
  sortedGroups.forEach((g) => lettersMap.set(g.grupo, ''));

  cliques.forEach((clique, cIdx) => {
    const ch = labels[cIdx % labels.length];
    for (const idx of clique) {
      const key = sortedGroups[idx].grupo;
      lettersMap.set(key, (lettersMap.get(key) || '') + ch);
    }
  });

  return lettersMap;
}

/**
 * Implementação exata do Teste de Scott-Knott (1974) / Jelihovschi et al. (ScottKnott CRAN)
 */
function runScottKnottClustering(
  sortedGroups: { grupo: string; n: number; media: number; dp: number; epm: number }[],
  dfErro: number,
  qmErro: number,
  alpha: number
): { clusterAssignments: Map<string, string>; passos: string[] } {
  const k = sortedGroups.length;
  const rHarm = k / sortedGroups.reduce((s, g) => s + 1 / Math.max(1, g.n), 0);
  // Variância estimada da média de cada tratamento
  const s2Mean = qmErro / rHarm;
  const passos: string[] = [];

  const finalClusters: number[][] = [];

  const splitNode = (indices: number[]) => {
    const m = indices.length;
    if (m < 2) {
      finalClusters.push(indices);
      return;
    }

    // Encontrar partição binária contígua (índices já estão ordenados por média decrescente) que maximiza B0
    const sumMeans = indices.reduce((s, idx) => s + sortedGroups[idx].media, 0);
    const totalMean = sumMeans / m;

    let bestB0 = -1;
    let bestSplit = 1;
    let sumLeft = 0;
    for (let cut = 1; cut < m; cut++) {
      sumLeft += sortedGroups[indices[cut - 1]].media;
      const n1 = cut;
      const n2 = m - cut;
      const m1 = sumLeft / n1;
      const m2 = (sumMeans - sumLeft) / n2;
      const b0 = n1 * (m1 - totalMean) * (m1 - totalMean) + n2 * (m2 - totalMean) * (m2 - totalMean);
      if (b0 > bestB0) {
        bestB0 = b0;
        bestSplit = cut;
      }
    }

    // Estimador ML de σ²_0 = (SQ_entre_grupos_no_no + dfErro * s2Mean) / (m + dfErro)
    const ssWithinNode = indices.reduce(
      (s, idx) => s + (sortedGroups[idx].media - totalMean) * (sortedGroups[idx].media - totalMean),
      0
    );
    const sigmaHat2 = (ssWithinNode + dfErro * s2Mean) / (m + dfErro);
    const lambda = (Math.PI / (2 * (Math.PI - 2))) * (bestB0 / Math.max(1e-18, sigmaHat2));
    const dfChi = m / (Math.PI - 2);
    const chiCrit = chiSquareQuantile(1 - alpha, dfChi);

    const g1Names = indices.slice(0, bestSplit).map((i) => sortedGroups[i].grupo).join(', ');
    const g2Names = indices.slice(bestSplit).map((i) => sortedGroups[i].grupo).join(', ');

    if (lambda > chiCrit) {
      passos.push(
        `Partição [${g1Names}] vs [${g2Names}]: λ = ${lambda.toFixed(3)} > χ²_crítico(${dfChi.toFixed(2)}, ${(alpha * 100).toFixed(1)}%) = ${chiCrit.toFixed(3)} → Grupos distintos.`
      );
      splitNode(indices.slice(0, bestSplit));
      splitNode(indices.slice(bestSplit));
    } else {
      passos.push(
        `Nó [${indices.map((i) => sortedGroups[i].grupo).join(', ')}]: λ = ${lambda.toFixed(3)} ≤ χ²_crítico = ${chiCrit.toFixed(3)} → Grupo homogêneo.`
      );
      finalClusters.push(indices);
    }
  };

  splitNode(Array.from({ length: k }, (_, i) => i));

  // Ordenar clusters pela média do primeiro elemento (decrescente)
  finalClusters.sort((a, b) => a[0] - b[0]);
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const clusterAssignments = new Map<string, string>();
  finalClusters.forEach((cluster, cIdx) => {
    const ch = letters[cIdx % letters.length];
    for (const idx of cluster) {
      clusterAssignments.set(sortedGroups[idx].grupo, ch);
    }
  });

  return { clusterAssignments, passos };
}

export function runMeanComparison(params: {
  metodo: MetodoComparacaoMedias;
  grupos: { grupo: string; valores: number[] }[];
  dfErro: number;
  qmErro: number;
  alpha?: number;
  testemunha?: string;
  anovaSignificativa?: boolean;
  twoSided?: boolean;
  pairedT?: boolean;
}): MeanComparisonResult {
  const { metodo, grupos, dfErro, qmErro } = params;
  const alpha = params.alpha ?? 0.05;
  const twoSided = params.twoSided ?? true;
  const observacoes: string[] = [];

  const resumo = grupos
    .filter((g) => g.valores.length > 0)
    .map((g) => {
      const n = g.valores.length;
      const media = g.valores.reduce((s, v) => s + v, 0) / n;
      const ss = g.valores.reduce((s, v) => s + (v - media) * (v - media), 0);
      const dp = n > 1 ? Math.sqrt(ss / (n - 1)) : 0;
      const epm = Math.sqrt(qmErro / n);
      return { grupo: g.grupo, n, media, dp, epm, valores: g.valores };
    })
    .sort((a, b) => b.media - a.media);

  const k = resumo.length;
  if (k < 2) {
    throw new Error('São necessários pelo menos 2 tratamentos para comparação de médias.');
  }

  const comparacoesPares: ParComparacaoMedias[] = [];
  let valorCriticoPrincipal = 0;
  let dmsMedio = 0;
  const sigPairSet = new Set<string>();
  const pairKey = (a: string, b: string) => [a, b].sort().join('||');

  const nSet = new Set(resumo.map((g) => g.n));
  const isUnbalanced = nSet.size > 1;
  if (isUnbalanced) {
    observacoes.push('Detectado número desigual de repetições entre tratamentos; aplicado ajuste de Kramer / variância ponderada nos erros-padrão das diferenças.');
  }

  let lettersMap = new Map<string, string>();

  if (metodo === 'tukey') {
    const qCrit = studentizedRangeQuantile(1 - alpha, k, dfErro);
    valorCriticoPrincipal = qCrit;

    let sumDms = 0;
    let cnt = 0;
    for (let i = 0; i < k; i++) {
      for (let j = i + 1; j < k; j++) {
        const g1 = resumo[i];
        const g2 = resumo[j];
        const dif = Math.abs(g1.media - g2.media);
        // Tukey-Kramer SE = sqrt(QM_erro/2 * (1/n1 + 1/n2))
        const seTukey = Math.sqrt((qmErro / 2) * (1 / g1.n + 1 / g2.n));
        const dms = qCrit * seTukey;
        const qObs = seTukey > 1e-18 ? dif / seTukey : 0;
        const pValor = studentizedRangePValue(qObs, k, dfErro);
        const sig = dif > dms;

        if (sig) sigPairSet.add(pairKey(g1.grupo, g2.grupo));
        sumDms += dms;
        cnt++;

        comparacoesPares.push({
          grupoA: g1.grupo,
          grupoB: g2.grupo,
          diferenca: g1.media - g2.media,
          erroPadraoDif: seTukey,
          estatistica: qObs,
          valorCritico: qCrit,
          dms,
          pValor,
          significativo: sig,
        });
      }
    }
    dmsMedio = cnt > 0 ? sumDms / cnt : 0;
    lettersMap = buildCompactLetters(resumo, (a, b) => sigPairSet.has(pairKey(a, b)));
  } else if (metodo === 'lsd') {
    if (params.anovaSignificativa === false) {
      observacoes.push(
        'AVISO (Fisher LSD protegido): A ANOVA global não foi significativa ao nível α. Em procedimentos protegidos, recomenda-se não declarar diferenças pareadas por LSD para evitar inflação do Erro Tipo I.'
      );
    }
    const tCrit = tQuantile(1 - alpha / 2, dfErro);
    valorCriticoPrincipal = tCrit;
    let sumDms = 0;
    let cnt = 0;
    for (let i = 0; i < k; i++) {
      for (let j = i + 1; j < k; j++) {
        const g1 = resumo[i];
        const g2 = resumo[j];
        const dif = Math.abs(g1.media - g2.media);
        const se = Math.sqrt(qmErro * (1 / g1.n + 1 / g2.n));
        const dms = tCrit * se;
        const tObs = se > 1e-18 ? dif / se : 0;
        const pValor = tPValueTwoTailed(tObs, dfErro);
        const sig = pValor < alpha;
        if (sig) sigPairSet.add(pairKey(g1.grupo, g2.grupo));
        sumDms += dms;
        cnt++;

        comparacoesPares.push({
          grupoA: g1.grupo,
          grupoB: g2.grupo,
          diferenca: g1.media - g2.media,
          erroPadraoDif: se,
          estatistica: tObs,
          valorCritico: tCrit,
          dms,
          pValor,
          significativo: sig,
        });
      }
    }
    dmsMedio = cnt > 0 ? sumDms / cnt : 0;
    lettersMap = buildCompactLetters(resumo, (a, b) => sigPairSet.has(pairKey(a, b)));
  } else if (metodo === 'duncan') {
    // Duncan MRT: para span p = j - i + 1 (2..k), nível de proteção α_p = 1 - (1 - α)^{p - 1}
    // Regra de proteção sequencial: se intervalo maior não for significativo, subintervalos também não são.
    const qCritBySpan = new Map<number, number>();
    for (let span = 2; span <= k; span++) {
      const alphaP = 1 - Math.pow(1 - alpha, span - 1);
      qCritBySpan.set(span, studentizedRangeQuantile(1 - alphaP, span, dfErro));
    }
    valorCriticoPrincipal = qCritBySpan.get(k) || 0;

    // Verificação top-down (span decrescente de k até 2)
    const nonSigRange: boolean[][] = Array.from({ length: k }, () => new Array(k).fill(false));
    for (let span = k; span >= 2; span--) {
      const qSpan = qCritBySpan.get(span)!;
      for (let i = 0; i <= k - span; i++) {
        const j = i + span - 1;
        // Verificar se já coberto por um intervalo maior não significativo
        let coveredByNs = false;
        for (let a = 0; a <= i && !coveredByNs; a++) {
          for (let b = j; b < k; b++) {
            if ((a < i || b > j) && nonSigRange[a][b]) {
              coveredByNs = true;
              break;
            }
          }
        }
        const g1 = resumo[i];
        const g2 = resumo[j];
        const seDuncan = Math.sqrt((qmErro / 2) * (1 / g1.n + 1 / g2.n));
        const dms = qSpan * seDuncan;
        const dif = Math.abs(g1.media - g2.media);
        const qObs = seDuncan > 1e-18 ? dif / seDuncan : 0;
        const isNs = coveredByNs || dif <= dms;
        if (isNs) {
          nonSigRange[i][j] = true;
        } else {
          sigPairSet.add(pairKey(g1.grupo, g2.grupo));
        }

        const pRaw = studentizedRangePValue(qObs, span, dfErro);
        const pAdj = 1 - Math.pow(1 - pRaw, 1 / (span - 1));
        comparacoesPares.push({
          grupoA: g1.grupo,
          grupoB: g2.grupo,
          diferenca: g1.media - g2.media,
          erroPadraoDif: seDuncan,
          estatistica: qObs,
          valorCritico: qSpan,
          dms,
          pValor: pAdj,
          significativo: !isNs,
        });
      }
    }
    dmsMedio =
      comparacoesPares.reduce((s, c) => s + c.dms, 0) / Math.max(1, comparacoesPares.length);
    lettersMap = buildCompactLetters(resumo, (a, b) => sigPairSet.has(pairKey(a, b)));
  } else if (metodo === 'scott_knott') {
    const { clusterAssignments, passos } = runScottKnottClustering(resumo, dfErro, qmErro, alpha);
    lettersMap = clusterAssignments;
    observacoes.push(...passos);
    valorCriticoPrincipal = chiSquareQuantile(1 - alpha, k / (Math.PI - 2));

    for (let i = 0; i < k; i++) {
      for (let j = i + 1; j < k; j++) {
        const g1 = resumo[i];
        const g2 = resumo[j];
        const sig = lettersMap.get(g1.grupo) !== lettersMap.get(g2.grupo);
        if (sig) sigPairSet.add(pairKey(g1.grupo, g2.grupo));
        const se = Math.sqrt(qmErro * (1 / g1.n + 1 / g2.n));
        comparacoesPares.push({
          grupoA: g1.grupo,
          grupoB: g2.grupo,
          diferenca: g1.media - g2.media,
          erroPadraoDif: se,
          estatistica: Math.abs(g1.media - g2.media) / Math.max(1e-18, se),
          valorCritico: valorCriticoPrincipal,
          dms: 0,
          pValor: null,
          significativo: sig,
        });
      }
    }
  } else if (metodo === 'dunnett') {
    const ctrlName = params.testemunha || resumo[resumo.length - 1].grupo;
    const ctrl = resumo.find((g) => g.grupo === ctrlName);
    if (!ctrl) {
      throw new Error(`Testemunha "${ctrlName}" não encontrada entre os tratamentos.`);
    }
    const mComp = k - 1;
    const dCrit = dunnettQuantile(1 - alpha, mComp, dfErro, twoSided);
    valorCriticoPrincipal = dCrit;

    let sumDms = 0;
    let cnt = 0;
    for (const g of resumo) {
      if (g.grupo === ctrl.grupo) {
        lettersMap.set(g.grupo, 'T');
        continue;
      }
      const dif = g.media - ctrl.media;
      const se = Math.sqrt(qmErro * (1 / g.n + 1 / ctrl.n));
      const dms = dCrit * se;
      const dObs = se > 1e-18 ? Math.abs(dif) / se : 0;
      const sig = twoSided ? Math.abs(dif) > dms : dif > dms;

      lettersMap.set(g.grupo, sig ? '* (Difere)' : 'ns (Igual T)');
      sumDms += dms;
      cnt++;
      comparacoesPares.push({
        grupoA: g.grupo,
        grupoB: ctrl.grupo,
        diferenca: dif,
        erroPadraoDif: se,
        estatistica: dObs,
        valorCritico: dCrit,
        dms,
        pValor: null,
        significativo: sig,
      });
    }
    dmsMedio = cnt > 0 ? sumDms / cnt : 0;
    observacoes.push(`Todas as médias foram comparadas exclusivamente contra a testemunha "${ctrl.grupo}" (nível global α = ${(alpha * 100).toFixed(1)}%).`);
  } else if (metodo === 'teste_t') {
    // Se 2 grupos e pairedT, ou múltiplos pares com Welch/Student-t
    if (k === 2 && params.pairedT && resumo[0].valores.length === resumo[1].valores.length) {
      const a = resumo[0];
      const b = resumo[1];
      const diffs = a.valores.map((v, idx) => v - b.valores[idx]);
      const nP = diffs.length;
      const meanD = diffs.reduce((s, d) => s + d, 0) / nP;
      const ssD = diffs.reduce((s, d) => s + (d - meanD) * (d - meanD), 0);
      const sdD = Math.sqrt(ssD / Math.max(1, nP - 1));
      const seD = sdD / Math.sqrt(nP);
      const dfP = nP - 1;
      const tObs = seD > 1e-18 ? Math.abs(meanD) / seD : 0;
      const tCrit = tQuantile(1 - alpha / 2, dfP);
      const pVal = tPValueTwoTailed(tObs, dfP);
      const sig = pVal < alpha;
      valorCriticoPrincipal = tCrit;
      dmsMedio = tCrit * seD;
      if (sig) sigPairSet.add(pairKey(a.grupo, b.grupo));
      comparacoesPares.push({
        grupoA: a.grupo,
        grupoB: b.grupo,
        diferenca: meanD,
        erroPadraoDif: seD,
        estatistica: tObs,
        valorCritico: tCrit,
        dms: tCrit * seD,
        pValor: pVal,
        significativo: sig,
      });
      lettersMap = buildCompactLetters(resumo, (x, y) => sigPairSet.has(pairKey(x, y)));
      observacoes.push(`Executado Teste t pareado (GL = ${dfP}).`);
    } else {
      // Welch t-test para cada par (usando variâncias individuais dos grupos)
      for (let i = 0; i < k; i++) {
        for (let j = i + 1; j < k; j++) {
          const g1 = resumo[i];
          const g2 = resumo[j];
          const v1 = g1.dp * g1.dp;
          const v2 = g2.dp * g2.dp;
          const seW = Math.sqrt(v1 / g1.n + v2 / g2.n);
          const numDf = Math.pow(v1 / g1.n + v2 / g2.n, 2);
          const denDf =
            Math.pow(v1 / g1.n, 2) / Math.max(1, g1.n - 1) +
            Math.pow(v2 / g2.n, 2) / Math.max(1, g2.n - 1);
          const dfW = denDf > 1e-18 ? numDf / denDf : g1.n + g2.n - 2;
          const tCrit = tQuantile(1 - alpha / 2, dfW);
          const dif = g1.media - g2.media;
          const tObs = seW > 1e-18 ? Math.abs(dif) / seW : 0;
          const pVal = tPValueTwoTailed(tObs, dfW);
          const sig = pVal < alpha;
          if (sig) sigPairSet.add(pairKey(g1.grupo, g2.grupo));
          valorCriticoPrincipal = tCrit;
          comparacoesPares.push({
            grupoA: g1.grupo,
            grupoB: g2.grupo,
            diferenca: dif,
            erroPadraoDif: seW,
            estatistica: tObs,
            valorCritico: tCrit,
            dms: tCrit * seW,
            pValor: pVal,
            significativo: sig,
          });
        }
      }
      dmsMedio =
        comparacoesPares.reduce((s, c) => s + c.dms, 0) / Math.max(1, comparacoesPares.length);
      lettersMap = buildCompactLetters(resumo, (a, b) => sigPairSet.has(pairKey(a, b)));
      if (k > 2) {
        observacoes.push(
          'Atenção: Teste t aplicado em mais de 2 grupos sem ajuste de multiplicidade aumenta o Erro Tipo I familiar. Prefira Tukey ou Scott-Knott para múltiplos tratamentos.'
        );
      }
    }
  }

  const gruposOrdenados: GrupoMediaResumo[] = resumo.map((g) => ({
    grupo: g.grupo,
    n: g.n,
    media: g.media,
    dp: g.dp,
    epm: g.epm,
    letra: lettersMap.get(g.grupo) || 'a',
    grupoScottKnott: metodo === 'scott_knott' ? lettersMap.get(g.grupo) : undefined,
  }));

  const interpretacao: string[] = [];
  const melhor = gruposOrdenados[0];
  const pior = gruposOrdenados[gruposOrdenados.length - 1];
  interpretacao.push(
    `O tratamento com maior média foi "${melhor.grupo}" (${melhor.media.toFixed(4)}, grupo "${melhor.letra}") e o de menor média foi "${pior.grupo}" (${pior.media.toFixed(4)}, grupo "${pior.letra}").`
  );
  if (metodo !== 'dunnett') {
    const letrasUnicas = new Set(gruposOrdenados.map((g) => g.letra));
    if (letrasUnicas.size === 1) {
      interpretacao.push(
        `Pelo teste selecionado (α = ${(alpha * 100).toFixed(1)}%), todos os tratamentos compartilham a mesma letra, não havendo separação estatística significativa entre pares.`
      );
    } else {
      interpretacao.push(
        `Médias seguidas pela mesma letra não diferem estatisticamente entre si pelo teste aplicado ao nível nominal α = ${(alpha * 100).toFixed(1)}%.`
      );
    }
  } else {
    const nSig = comparacoesPares.filter((p) => p.significativo).length;
    interpretacao.push(
      `Pelo teste de Dunnett (α = ${(alpha * 100).toFixed(1)}%), ${nSig} de ${comparacoesPares.length} tratamentos diferiram significativamente da testemunha.`
    );
  }

  void normalCdf;

  return {
    metodo,
    alpha,
    dfErro,
    qmErro,
    testemunha: params.testemunha,
    valorCriticoPrincipal,
    dmsMedio,
    gruposOrdenados,
    comparacoesPares,
    observacoes,
    interpretacao,
  };
}
