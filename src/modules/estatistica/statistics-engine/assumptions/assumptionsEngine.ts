/**
 * Motor de Diagnóstico, Pressupostos e Transformações Controladas — GeaAgro Estatística
 *
 * Verifica rigorosamente os pressupostos do modelo linear:
 * - Normalidade dos resíduos: Shapiro-Wilk + pontos Q-Q plot + histograma
 * - Homogeneidade de variâncias: Levene (média e mediana / Brown-Forsythe) + Bartlett
 * - Independência: Durbin-Watson + autocorrelação de primeira ordem
 * - Diagnóstico de observações: resíduos padronizados, studentizados, alavancagem, Distância de Cook,
 *   detecção de outliers / pontos influentes (sem jamais excluir dados automaticamente!)
 * - Transformações explícitas (Log10, Ln, Raiz, Raiz(x+0.5), Arcoseno√p, Box-Cox MLE) preservando os originais.
 */

import {
  chiSquarePValue,
  fPValue,
  normalQuantile,
  shapiroWilkTest,
} from '../distributions/distributions';
import { TransformacaoDados } from '../../types/estatistica';

export interface AssumptionDiagnosticsResult {
  alpha: number;
  n: number;
  normalidade: {
    teste: 'Shapiro-Wilk';
    estatisticaW: number;
    pValor: number;
    atendido: boolean;
    qqPoints: { teoricoZ: number; residuoPadronizado: number; obsIndex: number }[];
    histogramBins: { inicio: number; fim: number; contagem: number }[];
  };
  homogeneidade: {
    leveneMedia: { fValor: number; pValor: number; atendido: boolean } | null;
    leveneMediana: { fValor: number; pValor: number; atendido: boolean } | null;
    bartlett: { chi2: number; gl: number; pValor: number; atendido: boolean } | null;
  };
  independencia: {
    durbinWatson: number;
    autocorrelacaoLag1: number;
    alertaDependencia: boolean;
    observacao: string;
  };
  diagnosticoObservacoes: {
    obsIndex: number;
    residuoBruto: number;
    residuoPadronizado: number;
    residuoStudentizado: number;
    alavancagem: number;
    distanciaCook: number;
    outlierResiduo: boolean;
    pontoInfluenteCook: boolean;
  }[];
  outliersDetectados: number[];
  pontosInfluentesDetectados: number[];
  interpretacao: string[];
  recomendacaoTransformacao: string;
}

function runOneWayLevene(groups: number[][], useMedian: boolean): { fValor: number; pValor: number } | null {
  const validGroups = groups.filter((g) => g.length >= 2);
  if (validGroups.length < 2) return null;

  const zGroups: number[][] = validGroups.map((g) => {
    let center: number;
    if (useMedian) {
      const s = [...g].sort((a, b) => a - b);
      const mid = Math.floor(s.length / 2);
      center = s.length % 2 === 1 ? s[mid] : 0.5 * (s[mid - 1] + s[mid]);
    } else {
      center = g.reduce((a, b) => a + b, 0) / g.length;
    }
    return g.map((v) => Math.abs(v - center));
  });

  const allZ = zGroups.flat();
  const N = allZ.length;
  const k = zGroups.length;
  if (N <= k) return null;

  const grandMean = allZ.reduce((a, b) => a + b, 0) / N;
  let ssBetween = 0;
  let ssWithin = 0;
  for (const zg of zGroups) {
    const gm = zg.reduce((a, b) => a + b, 0) / zg.length;
    ssBetween += zg.length * (gm - grandMean) * (gm - grandMean);
    for (const z of zg) ssWithin += (z - gm) * (z - gm);
  }

  const df1 = k - 1;
  const df2 = N - k;
  const msWithin = ssWithin / df2;
  const fValor = msWithin > 1e-18 ? (ssBetween / df1) / msWithin : 0;
  const pValor = fPValue(fValor, df1, df2);
  return { fValor, pValor };
}

function runBartlett(groups: number[][]): { chi2: number; gl: number; pValor: number } | null {
  const validGroups = groups.filter((g) => g.length >= 2);
  const k = validGroups.length;
  if (k < 2) return null;

  const stats = validGroups.map((g) => {
    const n = g.length;
    const m = g.reduce((a, b) => a + b, 0) / n;
    const s2 = g.reduce((a, b) => a + (b - m) * (b - m), 0) / (n - 1);
    return { df: n - 1, s2: Math.max(1e-18, s2) };
  });

  const dfTotal = stats.reduce((s, g) => s + g.df, 0);
  if (dfTotal <= 0) return null;
  const sp2 = stats.reduce((s, g) => s + g.df * g.s2, 0) / dfTotal;
  const num =
    dfTotal * Math.log(sp2) - stats.reduce((s, g) => s + g.df * Math.log(g.s2), 0);
  const corr =
    1 +
    (1 / (3 * (k - 1))) *
      (stats.reduce((s, g) => s + 1 / g.df, 0) - 1 / dfTotal);
  const chi2 = Math.max(0, num / corr);
  const gl = k - 1;
  return { chi2, gl, pValor: chiSquarePValue(chi2, gl) };
}

export function runAssumptionDiagnostics(params: {
  residuos: number[];
  residuosPadronizados: number[];
  residuosStudentizados: number[];
  alavancagem: number[];
  distanciaCook: number[];
  observacoesIndices: number[];
  gruposParaVariancia?: number[][]; // Valores originais ou resíduos agrupados por tratamento
  alpha?: number;
}): AssumptionDiagnosticsResult {
  const alpha = params.alpha ?? 0.05;
  const n = params.residuos.length;

  // 1. Shapiro-Wilk sobre resíduos
  const sw = shapiroWilkTest(params.residuos);
  const normAtendido = Number.isFinite(sw.pValue) ? sw.pValue >= alpha : false;

  // Q-Q Plot (quantis teóricos da normal vs resíduos padronizados ordenados)
  const indexedStd = params.residuosPadronizados
    .map((r, i) => ({ r, obsIndex: params.observacoesIndices[i] ?? i + 1 }))
    .sort((a, b) => a.r - b.r);
  const qqPoints = indexedStd.map((item, rankIdx) => {
    const p = (rankIdx + 1 - 0.375) / (n + 0.25);
    return {
      teoricoZ: normalQuantile(p),
      residuoPadronizado: item.r,
      obsIndex: item.obsIndex,
    };
  });

  // Histograma de resíduos
  const minR = Math.min(...params.residuos);
  const maxR = Math.max(...params.residuos);
  const nBins = Math.max(5, Math.min(15, Math.ceil(Math.sqrt(n))));
  const span = Math.max(1e-9, maxR - minR);
  const width = span / nBins;
  const histogramBins = Array.from({ length: nBins }, (_, b) => {
    const inicio = minR + b * width;
    const fim = inicio + width;
    const contagem = params.residuos.filter((v) =>
      b === nBins - 1 ? v >= inicio && v <= fim + 1e-12 : v >= inicio && v < fim
    ).length;
    return { inicio, fim, contagem };
  });

  // 2. Homogeneidade de variâncias
  const groups = params.gruposParaVariancia || [];
  const levMean = runOneWayLevene(groups, false);
  const levMed = runOneWayLevene(groups, true);
  const bart = runBartlett(groups);

  // 3. Independência (Durbin-Watson)
  let dwNum = 0;
  let dwDen = 0;
  let autoCov = 0;
  for (let i = 0; i < n; i++) {
    dwDen += params.residuos[i] * params.residuos[i];
    if (i > 0) {
      const d = params.residuos[i] - params.residuos[i - 1];
      dwNum += d * d;
      autoCov += params.residuos[i] * params.residuos[i - 1];
    }
  }
  const dw = dwDen > 1e-18 ? dwNum / dwDen : 2;
  const rho1 = dwDen > 1e-18 ? autoCov / dwDen : 0;
  const alertaDependencia = dw < 1.5 || dw > 2.5;

  // 4. Diagnóstico por observação (Outliers & Cook)
  const cookThreshold = 4 / Math.max(1, n);
  const diagnosticoObservacoes = params.residuos.map((resBruto, i) => {
    const rPad = params.residuosPadronizados[i] ?? 0;
    const rStu = params.residuosStudentizados[i] ?? 0;
    const h = params.alavancagem[i] ?? 0;
    const dCook = params.distanciaCook[i] ?? 0;
    const outlierResiduo = Math.abs(rStu) > 3.0 || Math.abs(rPad) > 3.0;
    const pontoInfluenteCook = dCook > cookThreshold && dCook > 0.5;
    return {
      obsIndex: (params.observacoesIndices[i] ?? i) + 1,
      residuoBruto: resBruto,
      residuoPadronizado: rPad,
      residuoStudentizado: rStu,
      alavancagem: h,
      distanciaCook: dCook,
      outlierResiduo,
      pontoInfluenteCook,
    };
  });

  const outliersDetectados = diagnosticoObservacoes
    .filter((d) => d.outlierResiduo)
    .map((d) => d.obsIndex);
  const pontosInfluentesDetectados = diagnosticoObservacoes
    .filter((d) => d.pontoInfluenteCook || d.distanciaCook > cookThreshold)
    .map((d) => d.obsIndex);

  const interpretacao: string[] = [];
  interpretacao.push(
    normAtendido
      ? `Normalidade (Shapiro-Wilk): W = ${sw.W.toFixed(4)}, p = ${sw.pValue.toFixed(4)} ≥ ${alpha} → Não há evidência contra a normalidade dos resíduos.`
      : `Normalidade (Shapiro-Wilk): W = ${sw.W.toFixed(4)}, p = ${sw.pValue.toFixed(4)} < ${alpha} → Desvio significativo da normalidade dos resíduos.`
  );
  if (levMean) {
    interpretacao.push(
      levMean.pValor >= alpha
        ? `Homocedasticidade (Levene - média): F = ${levMean.fValor.toFixed(4)}, p = ${levMean.pValor.toFixed(4)} ≥ ${alpha} → Variâncias homogêneas.`
        : `Homocedasticidade (Levene - média): F = ${levMean.fValor.toFixed(4)}, p = ${levMean.pValor.toFixed(4)} < ${alpha} → Heterocedasticidade detectada.`
    );
  }
  if (bart) {
    interpretacao.push(
      bart.pValor >= alpha
        ? `Homocedasticidade (Bartlett): χ² = ${bart.chi2.toFixed(4)}, p = ${bart.pValor.toFixed(4)} ≥ ${alpha} → Variâncias homogêneas.`
        : `Homocedasticidade (Bartlett): χ² = ${bart.chi2.toFixed(4)}, p = ${bart.pValor.toFixed(4)} < ${alpha} → Violação de homogeneidade (nota: Bartlett é sensível à não normalidade).`
    );
  }
  interpretacao.push(
    `Independência (Durbin-Watson): DW = ${dw.toFixed(3)} (ρ₁ = ${rho1.toFixed(3)}). ${
      alertaDependencia
        ? 'Alerta: possível autocorrelação residual; avalie ordenação temporal/espacial.'
        : 'Dentro da faixa esperada (~1,5 a 2,5) indicando ausência de autocorrelação serial severa.'
    }`
  );
  if (outliersDetectados.length > 0) {
    interpretacao.push(
      `Outliers potenciais (|resíduo studentizado| > 3): linha(s) ${outliersDetectados.join(', ')}. Os dados originais NÃO são removidos automaticamente; verifique digitação ou ocorrência biológica real.`
    );
  }

  let recomendacaoTransformacao = 'Pressupostos paramétricos atendidos; não há necessidade de transformar a variável resposta.';
  const homFail = (levMean && levMean.pValor < alpha) || (levMed && levMed.pValor < alpha);
  if (!normAtendido || homFail) {
    recomendacaoTransformacao =
      'Pelo menos um pressuposto paramétrico falhou. Opções recomendadas mediante decisão do pesquisador: (1) Aplicar transformação explícita (Box-Cox, Log, √x ou Arcoseno√p para porcentagens) preservando os dados brutos, ou (2) Executar testes não paramétricos equivalentes (Kruskal-Wallis / Friedman).';
  }

  return {
    alpha,
    n,
    normalidade: {
      teste: 'Shapiro-Wilk',
      estatisticaW: sw.W,
      pValor: sw.pValue,
      atendido: normAtendido,
      qqPoints,
      histogramBins,
    },
    homogeneidade: {
      leveneMedia: levMean ? { ...levMean, atendido: levMean.pValor >= alpha } : null,
      leveneMediana: levMed ? { ...levMed, atendido: levMed.pValor >= alpha } : null,
      bartlett: bart ? { ...bart, atendido: bart.pValor >= alpha } : null,
    },
    independencia: {
      durbinWatson: dw,
      autocorrelacaoLag1: rho1,
      alertaDependencia,
      observacao: alertaDependencia
        ? 'Possível dependência sequencial entre resíduos.'
        : 'Sem evidência forte de autocorrelação serial.',
    },
    diagnosticoObservacoes,
    outliersDetectados,
    pontosInfluentesDetectados,
    interpretacao,
    recomendacaoTransformacao,
  };
}

/**
 * Estima o parâmetro ótimo λ de Box-Cox via máxima verossimilhança perfilada em λ ∈ [-2, 2]
 */
export function estimateBoxCoxLambda(values: number[]): number {
  const pos = values.filter((v) => Number.isFinite(v) && v > 0);
  if (pos.length < 3) return 1;
  const n = pos.length;
  const sumLog = pos.reduce((s, v) => s + Math.log(v), 0);

  let bestLambda = 1;
  let bestLL = -Infinity;

  for (let lam = -2; lam <= 2.0001; lam += 0.05) {
    const l = Math.round(lam * 100) / 100;
    const yT = pos.map((y) => (Math.abs(l) < 1e-6 ? Math.log(y) : (Math.pow(y, l) - 1) / l));
    const m = yT.reduce((s, v) => s + v, 0) / n;
    const varT = Math.max(1e-18, yT.reduce((s, v) => s + (v - m) * (v - m), 0) / n);
    const ll = -(n / 2) * Math.log(varT) + (l - 1) * sumLog;
    if (ll > bestLL) {
      bestLL = ll;
      bestLambda = l;
    }
  }
  return bestLambda;
}

/**
 * Aplica transformação numérica controlada retornando novo vetor sem mutar a coluna original.
 */
export function applyDataTransformation(
  values: (number | null)[],
  metodo: TransformacaoDados,
  customLambda?: number
): { transformed: (number | null)[]; lambdaUsed?: number; warnings: string[] } {
  const warnings: string[] = [];
  if (metodo === 'nenhuma') {
    return { transformed: [...values], warnings };
  }

  const valid = values.filter((v): v is number => v !== null && Number.isFinite(v));
  let lambdaUsed = customLambda;

  if (metodo === 'box_cox') {
    if (valid.some((v) => v <= 0)) {
      throw new Error('Transformação Box-Cox exige todos os valores estritamente positivos (> 0).');
    }
    if (lambdaUsed === undefined) {
      lambdaUsed = estimateBoxCoxLambda(valid);
    }
  }

  const transformed = values.map((v) => {
    if (v === null || !Number.isFinite(v)) return null;
    if (metodo === 'log10') {
      if (v <= 0) throw new Error('Log10(x) exige valores > 0. Caso haja zeros, utilize √(x + 0,5).');
      return Math.log10(v);
    }
    if (metodo === 'ln') {
      if (v <= 0) throw new Error('Ln(x) exige valores > 0.');
      return Math.log(v);
    }
    if (metodo === 'raiz') {
      if (v < 0) throw new Error('√x não aceita valores negativos.');
      return Math.sqrt(v);
    }
    if (metodo === 'raiz_mais_05') {
      if (v + 0.5 < 0) throw new Error('√(x + 0,5) exige x ≥ -0,5.');
      return Math.sqrt(v + 0.5);
    }
    if (metodo === 'arcoseno_raiz') {
      // Detecta se dados estão em 0..100 (%) ou 0..1 (proporção)
      const isPercent = valid.some((x) => x > 1);
      const prop = isPercent ? v / 100 : v;
      if (prop < 0 || prop > 1) {
        throw new Error('Arcoseno(√p) exige proporções entre 0 e 1 (ou porcentagens entre 0 e 100).');
      }
      return Math.asin(Math.sqrt(prop));
    }
    if (metodo === 'box_cox') {
      const lam = lambdaUsed ?? 1;
      return Math.abs(lam) < 1e-6 ? Math.log(v) : (Math.pow(v, lam) - 1) / lam;
    }
    return v;
  });

  if (metodo === 'arcoseno_raiz' && valid.some((x) => x > 1)) {
    warnings.push('Valores detectados na escala 0–100%; convertidos para proporção p = x/100 antes de aplicar arcsen(√p) em radianos.');
  }

  return { transformed, lambdaUsed, warnings };
}
