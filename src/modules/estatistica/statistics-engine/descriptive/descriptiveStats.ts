/**
 * Motor de Estatística Descritiva — GeaAgro Estatística
 *
 * Calcula métricas completas globais e estratificadas por grupo:
 * - Contagem total, válidas, ausentes/N/A, zeros
 * - Média aritmética, mediana, moda(s), mínimo, máximo, amplitude total
 * - Variância amostral (s²) e populacional (σ²), Desvio-padrão (s), Erro-padrão da média (EPM)
 * - Coeficiente de variação (CV%), Quartis (Q1, Q2, Q3), AIQ (IQR), Percentis configuráveis
 * - Intervalo de Confiança (t de Student) e Medidas de Forma (Assimetria g1 e Curtose g2)
 */

import { tQuantile } from '../distributions/distributions';

export interface DescriptiveStatsItem {
  grupo: string;
  variavel: string;
  nTotal: number;
  nValidas: number;
  nAusentes: number;
  nZeros: number;
  media: number;
  mediana: number;
  modas: number[];
  minimo: number;
  maximo: number;
  amplitude: number;
  varianciaAmostral: number;
  varianciaPopulacional: number;
  desvioPadrao: number;
  erroPadrao: number;
  cvPercent: number;
  q1: number;
  q2: number;
  q3: number;
  iqr: number;
  percentis: Record<string, number>;
  icInferior: number;
  icSuperior: number;
  icNivel: number;
  assimetria: number;
  curtoseExcesso: number;
}

export function calculatePercentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return NaN;
  if (sorted.length === 1) return sorted[0];
  const pos = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  const frac = pos - lo;
  return sorted[lo] * (1 - frac) + sorted[hi] * frac;
}

export function computeDescriptiveForArray(
  rawValues: (number | null | undefined)[],
  options: {
    grupo?: string;
    variavel?: string;
    alpha?: number;
    percentisAlvo?: number[];
  } = {}
): DescriptiveStatsItem {
  const grupo = options.grupo || 'Geral';
  const variavel = options.variavel || 'Variável';
  const alpha = options.alpha ?? 0.05;
  const percentisAlvo = options.percentisAlvo || [5, 10, 25, 50, 75, 90, 95];

  const nTotal = rawValues.length;
  const valid = rawValues.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  const nValidas = valid.length;
  const nAusentes = nTotal - nValidas;
  const nZeros = valid.filter((v) => v === 0).length;

  if (nValidas === 0) {
    return {
      grupo,
      variavel,
      nTotal,
      nValidas: 0,
      nAusentes,
      nZeros: 0,
      media: NaN,
      mediana: NaN,
      modas: [],
      minimo: NaN,
      maximo: NaN,
      amplitude: NaN,
      varianciaAmostral: NaN,
      varianciaPopulacional: NaN,
      desvioPadrao: NaN,
      erroPadrao: NaN,
      cvPercent: NaN,
      q1: NaN,
      q2: NaN,
      q3: NaN,
      iqr: NaN,
      percentis: {},
      icInferior: NaN,
      icSuperior: NaN,
      icNivel: 1 - alpha,
      assimetria: NaN,
      curtoseExcesso: NaN,
    };
  }

  const sorted = [...valid].sort((a, b) => a - b);
  const sum = valid.reduce((acc, v) => acc + v, 0);
  const media = sum / nValidas;
  const minimo = sorted[0];
  const maximo = sorted[nValidas - 1];
  const amplitude = maximo - minimo;

  const q1 = calculatePercentile(sorted, 25);
  const q2 = calculatePercentile(sorted, 50);
  const q3 = calculatePercentile(sorted, 75);
  const iqr = q3 - q1;

  const percentis: Record<string, number> = {};
  for (const p of percentisAlvo) {
    percentis[`P${p}`] = calculatePercentile(sorted, p);
  }

  // Moda(s)
  const freqMap = new Map<number, number>();
  let maxFreq = 0;
  for (const v of valid) {
    const f = (freqMap.get(v) || 0) + 1;
    freqMap.set(v, f);
    if (f > maxFreq) maxFreq = f;
  }
  const modas =
    maxFreq > 1
      ? Array.from(freqMap.entries())
          .filter(([, f]) => f === maxFreq)
          .map(([v]) => v)
          .sort((a, b) => a - b)
      : [];

  const ss = valid.reduce((acc, v) => acc + (v - media) * (v - media), 0);
  const varianciaPopulacional = ss / nValidas;
  const varianciaAmostral = nValidas > 1 ? ss / (nValidas - 1) : 0;
  const desvioPadrao = Math.sqrt(varianciaAmostral);
  const erroPadrao = nValidas > 1 ? desvioPadrao / Math.sqrt(nValidas) : 0;
  const cvPercent = Math.abs(media) > 1e-12 ? (desvioPadrao / Math.abs(media)) * 100 : NaN;

  // IC baseado na distribuição t
  let icInferior = media;
  let icSuperior = media;
  if (nValidas > 1) {
    const tCrit = tQuantile(1 - alpha / 2, nValidas - 1);
    const margin = tCrit * erroPadrao;
    icInferior = media - margin;
    icSuperior = media + margin;
  }

  // Assimetria amostral ajustada (g1) e Curtose excesso ajustada (g2)
  let assimetria = NaN;
  let curtoseExcesso = NaN;
  if (nValidas >= 3 && desvioPadrao > 1e-12) {
    const m3 = valid.reduce((acc, v) => acc + Math.pow((v - media) / desvioPadrao, 3), 0);
    assimetria = (nValidas / ((nValidas - 1) * (nValidas - 2))) * m3;
  }
  if (nValidas >= 4 && desvioPadrao > 1e-12) {
    const m4 = valid.reduce((acc, v) => acc + Math.pow((v - media) / desvioPadrao, 4), 0);
    const term1 = ((nValidas * (nValidas + 1)) / ((nValidas - 1) * (nValidas - 2) * (nValidas - 3))) * m4;
    const term2 = (3 * (nValidas - 1) * (nValidas - 1)) / ((nValidas - 2) * (nValidas - 3));
    curtoseExcesso = term1 - term2;
  }

  return {
    grupo,
    variavel,
    nTotal,
    nValidas,
    nAusentes,
    nZeros,
    media,
    mediana: q2,
    modas,
    minimo,
    maximo,
    amplitude,
    varianciaAmostral,
    varianciaPopulacional,
    desvioPadrao,
    erroPadrao,
    cvPercent,
    q1,
    q2,
    q3,
    iqr,
    percentis,
    icInferior,
    icSuperior,
    icNivel: 1 - alpha,
    assimetria,
    curtoseExcesso,
  };
}

export function runDescriptiveAnalysis(
  rows: Record<string, any>[],
  responseCol: string,
  groupCol?: string,
  alpha = 0.05
): {
  geral: DescriptiveStatsItem;
  grupos: DescriptiveStatsItem[];
  interpretacao: string[];
} {
  const toNumOrNull = (val: any): number | null => {
    if (val === null || val === undefined || val === '' || String(val).toUpperCase() === 'N/A' || String(val).toUpperCase() === 'NA') {
      return null;
    }
    const n = typeof val === 'number' ? val : Number(String(val).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };

  const allVals = rows.map((r) => toNumOrNull(r[responseCol]));
  const geral = computeDescriptiveForArray(allVals, {
    grupo: 'Conjunto Completo',
    variavel: responseCol,
    alpha,
  });

  const grupos: DescriptiveStatsItem[] = [];
  if (groupCol) {
    const map = new Map<string, (number | null)[]>();
    for (const r of rows) {
      const gKey = r[groupCol] !== null && r[groupCol] !== undefined && String(r[groupCol]).trim() !== ''
        ? String(r[groupCol]).trim()
        : '(Sem grupo)';
      if (!map.has(gKey)) map.set(gKey, []);
      map.get(gKey)!.push(toNumOrNull(r[responseCol]));
    }
    for (const [gKey, vals] of map.entries()) {
      grupos.push(
        computeDescriptiveForArray(vals, {
          grupo: gKey,
          variavel: responseCol,
          alpha,
        })
      );
    }
  }

  const interpretacao: string[] = [];
  if (geral.nValidas > 0) {
    interpretacao.push(
      `Foram avaliadas ${geral.nValidas} observações válidas para "${responseCol}"${
        geral.nAusentes > 0 ? ` (${geral.nAusentes} ausentes/N/A ignoradas nos cálculos paramétricos)` : ''
      }, obtendo-se média de ${geral.media.toFixed(4)} ± ${geral.desvioPadrao.toFixed(4)} (mediana = ${geral.mediana.toFixed(4)}).`
    );
    if (Number.isFinite(geral.cvPercent)) {
      const classeCv =
        geral.cvPercent < 10
          ? 'baixa dispersão relativa (alta precisão)'
          : geral.cvPercent <= 20
          ? 'dispersão média'
          : geral.cvPercent <= 30
          ? 'dispersão alta'
          : 'dispersão muito alta';
      interpretacao.push(
        `O coeficiente de variação global (CV%) foi de ${geral.cvPercent.toFixed(2)}%, indicando ${classeCv}.`
      );
    }
    if (Number.isFinite(geral.assimetria) && Math.abs(geral.assimetria) > 1) {
      interpretacao.push(
        `A distribuição apresenta assimetria acentuada (g1 = ${geral.assimetria.toFixed(3)}), recomendando-se verificar a normalidade antes de aplicar testes paramétricos.`
      );
    }
  } else {
    interpretacao.push(`Não há valores numéricos válidos na variável "${responseCol}".`);
  }

  return { geral, grupos, interpretacao };
}
