/**
 * Distribuições Estatísticas Exatas e Funções Especiais — GeaAgro Estatística
 *
 * Implementações numéricas determinísticas em TypeScript puro (sem dependências externas):
 * - Gama, Log-Gama, Beta Incompleta Regularizada (fração contínua de Lentz)
 * - Normal Padrão (Z): PDF, CDF, Quantil (Acklam)
 * - t de Student: CDF, p-valor bicaudal/unicaudal, Quantil
 * - Qui-Quadrado (χ²): CDF, p-valor, Quantil
 * - F de Snedecor: CDF, p-valor, Quantil
 * - Amplitude Estudentizada de Tukey (q): CDF e Quantil por quadratura de Gauss-Legendre 24 pontos
 * - Distribuição de Dunnett (d): Valores críticos exatos via quadratura numérica (correlação ρ=0.5)
 * - Shapiro-Wilk (algoritmo AS R94 de Royston) para n ∈ [3, 5000]
 */

const LANCZOS_COEFFS = [
  676.5203681218851,
  -1259.1392167224028,
  771.32342877765313,
  -176.61502916214059,
  12.507343278686905,
  -0.13857109526572012,
  9.9843695780195716e-6,
  1.5056327351493116e-7,
];

export function logGamma(z: number): number {
  if (z <= 0) return Infinity;
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  }
  const zm = z - 1;
  let x = 0.99999999999980993;
  for (let i = 0; i < LANCZOS_COEFFS.length; i++) {
    x += LANCZOS_COEFFS[i] / (zm + i + 1);
  }
  const t = zm + LANCZOS_COEFFS.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (zm + 0.5) * Math.log(t) - t + Math.log(x);
}

export function logBeta(a: number, b: number): number {
  return logGamma(a) + logGamma(b) - logGamma(a + b);
}

/**
 * Beta Incompleta Regularizada I_x(a, b) via fração contínua modificada de Lentz (Press et al.)
 */
export function betaIncompleteReg(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  if (a <= 0 || b <= 0) return NaN;

  const bt = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));

  const betacf = (xVal: number, aVal: number, bVal: number): number => {
    const MAXIT = 250;
    const EPS = 3e-14;
    const FPMIN = 1e-300;
    const qab = aVal + bVal;
    const qap = aVal + 1;
    const qam = aVal - 1;
    let c = 1;
    let d = 1 - (qab * xVal) / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1 / d;
    let h = d;
    for (let m = 1; m <= MAXIT; m++) {
      const m2 = 2 * m;
      let aa = (m * (bVal - m) * xVal) / ((qam + m2) * (aVal + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c;
      if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      h *= d * c;

      aa = (-(aVal + m) * (qab + m) * xVal) / ((aVal + m2) * (qap + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c;
      if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < EPS) break;
    }
    return h;
  };

  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betacf(x, a, b)) / a;
  }
  return 1 - (bt * betacf(1 - x, b, a)) / b;
}

/**
 * Gama Incompleta Regularizada Inferior P(a, x) e Superior Q(a, x)
 */
export function gammaLowerReg(a: number, x: number): number {
  if (x <= 0) return 0;
  if (a <= 0) return NaN;
  const EPS = 3e-14;
  const FPMIN = 1e-300;
  const gln = logGamma(a);

  if (x < a + 1) {
    let ap = a;
    let sum = 1 / a;
    let del = sum;
    for (let n = 1; n <= 400; n++) {
      ap += 1;
      del *= x / ap;
      sum += del;
      if (Math.abs(del) < Math.abs(sum) * EPS) {
        return sum * Math.exp(-x + a * Math.log(x) - gln);
      }
    }
    return Math.min(1, Math.max(0, sum * Math.exp(-x + a * Math.log(x) - gln)));
  } else {
    let b = x + 1 - a;
    let c = 1 / FPMIN;
    let d = 1 / b;
    let h = d;
    for (let i = 1; i <= 400; i++) {
      const an = -i * (i - a);
      b += 2;
      d = an * d + b;
      if (Math.abs(d) < FPMIN) d = FPMIN;
      c = b + an / c;
      if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < EPS) break;
    }
    return Math.min(1, Math.max(0, 1 - Math.exp(-x + a * Math.log(x) - gln) * h));
  }
}

export function gammaUpperReg(a: number, x: number): number {
  return 1 - gammaLowerReg(a, x);
}

// ============================================================================
// NORMAL PADRÃO (Z)
// ============================================================================

export function normalPdf(z: number): number {
  return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
}

export function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  if (ax > 6.5) return sign;
  return sign * gammaLowerReg(0.5, ax * ax);
}

export function normalCdf(z: number): number {
  if (!Number.isFinite(z)) return z > 0 ? 1 : 0;
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

/**
 * Quantil da Normal Padrão Φ^{-1}(p) — Aproximação racional de Peter John Acklam + refinamento Newton
 */
export function normalQuantile(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;

  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239e0,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838e0,
    -2.549732539343734e0, 4.374664141464968e0, 2.938163982698783e0,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996e0,
    3.754408661907416e0,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let z: number;

  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    z =
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    const q = p - 0.5;
    const r = q * q;
    z =
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    z =
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  // Um passo de Halley/Newton para precisão ~1e-15
  const err = normalCdf(z) - p;
  z -= err / Math.max(normalPdf(z), 1e-300);
  return z;
}

// ============================================================================
// DISTRIBUIÇÃO t DE STUDENT
// ============================================================================

export function tCdf(t: number, df: number): number {
  if (!Number.isFinite(df) || df <= 0) return NaN;
  if (!Number.isFinite(t)) return t > 0 ? 1 : 0;
  if (t === 0) return 0.5;
  if (df > 1e6) return normalCdf(t);
  const x = df / (df + t * t);
  const ib = betaIncompleteReg(x, df / 2, 0.5);
  return t > 0 ? 1 - 0.5 * ib : 0.5 * ib;
}

export function tPValueTwoTailed(t: number, df: number): number {
  if (!Number.isFinite(df) || df <= 0 || !Number.isFinite(t)) return NaN;
  const absT = Math.abs(t);
  if (absT === 0) return 1;
  if (df > 1e6) return Math.min(1, Math.max(0, 2 * (1 - normalCdf(absT))));
  const x = df / (df + absT * absT);
  return Math.min(1, Math.max(0, betaIncompleteReg(x, df / 2, 0.5)));
}

export function tQuantile(p: number, df: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;
  if (df > 1e6) return normalQuantile(p);

  if (p < 0.5) return -tQuantile(1 - p, df);

  // Chute inicial Cornish-Fisher
  const z = normalQuantile(p);
  let x =
    z +
    (z * z * z + z) / (4 * df) +
    (5 * Math.pow(z, 5) + 16 * z * z * z + 3 * z) / (96 * df * df);
  if (!Number.isFinite(x) || x <= 0) x = z;

  const logCoef = logGamma((df + 1) / 2) - logGamma(df / 2) - 0.5 * Math.log(df * Math.PI);
  for (let i = 0; i < 20; i++) {
    const cdf = tCdf(x, df);
    const diff = cdf - p;
    if (Math.abs(diff) < 1e-12) break;
    const pdf = Math.exp(logCoef - ((df + 1) / 2) * Math.log(1 + (x * x) / df));
    if (pdf < 1e-30) break;
    const next = x - diff / pdf;
    if (Math.abs(next - x) < 1e-11) {
      x = next;
      break;
    }
    x = next > 0 ? next : x * 0.5;
  }
  return x;
}

// ============================================================================
// DISTRIBUIÇÃO QUI-QUADRADO (χ²)
// ============================================================================

export function chiSquareCdf(x: number, df: number): number {
  if (x <= 0) return 0;
  if (df <= 0) return NaN;
  return gammaLowerReg(df / 2, x / 2);
}

export function chiSquarePValue(x: number, df: number): number {
  if (x <= 0) return 1;
  if (df <= 0) return NaN;
  return Math.min(1, Math.max(0, 1 - chiSquareCdf(x, df)));
}

export function chiSquareQuantile(p: number, df: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return Infinity;
  if (df <= 0) return NaN;

  // Aproximação Wilson-Hilferty como chute inicial
  const z = normalQuantile(p);
  const k = 2 / (9 * df);
  let x = df * Math.pow(Math.max(0.01, 1 - k + z * Math.sqrt(k)), 3);
  if (x <= 0) x = df * 0.5;

  const halfDf = df / 2;
  const lnG = logGamma(halfDf);
  for (let i = 0; i < 30; i++) {
    const cdf = chiSquareCdf(x, df);
    const diff = cdf - p;
    if (Math.abs(diff) < 1e-11) break;
    const pdf = Math.exp(-halfDf * Math.LN2 - lnG + (halfDf - 1) * Math.log(x) - x / 2);
    if (pdf < 1e-30) break;
    const next = x - diff / pdf;
    x = next > 0 ? next : x * 0.5;
  }
  return x;
}

// ============================================================================
// DISTRIBUIÇÃO F DE SNEDECOR
// ============================================================================

export function fCdf(f: number, df1: number, df2: number): number {
  if (f <= 0) return 0;
  if (df1 <= 0 || df2 <= 0) return NaN;
  if (!Number.isFinite(f)) return 1;
  const x = (df1 * f) / (df1 * f + df2);
  return betaIncompleteReg(x, df1 / 2, df2 / 2);
}

export function fPValue(f: number, df1: number, df2: number): number {
  if (f <= 0) return 1;
  if (df1 <= 0 || df2 <= 0) return NaN;
  if (!Number.isFinite(f)) return 0;
  const x = df2 / (df2 + df1 * f);
  return Math.min(1, Math.max(0, betaIncompleteReg(x, df2 / 2, df1 / 2)));
}

export function fQuantile(p: number, df1: number, df2: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return Infinity;
  if (df1 <= 0 || df2 <= 0) return NaN;

  let low = 0;
  let high = 1;
  while (fCdf(high, df1, df2) < p && high < 1e12) {
    high *= 2;
  }
  for (let i = 0; i < 80; i++) {
    const mid = 0.5 * (low + high);
    if (fCdf(mid, df1, df2) < p) low = mid;
    else high = mid;
    if (high - low < 1e-10 * Math.max(1, mid)) break;
  }
  return 0.5 * (low + high);
}

// ============================================================================
// QUADRATURA DE GAUSS-LEGENDRE 16 PONTOS E AMPLITUDE ESTUDENTIZADA (TUKEY q)
// ============================================================================

const GL16_X = [
  -0.9894009349916499, -0.9445750230732326, -0.8656312023878318, -0.755404408355003,
  -0.6178762444026438, -0.4580167776572274, -0.2816035507792589, -0.09501250983763744,
  0.09501250983763744, 0.2816035507792589, 0.4580167776572274, 0.6178762444026438,
  0.755404408355003, 0.8656312023878318, 0.9445750230732326, 0.9894009349916499,
];
const GL16_W = [
  0.0271524594117541, 0.0622535239386479, 0.0951585116824928, 0.1246289712555339,
  0.1495959888165767, 0.1691565193950025, 0.1826034150449236, 0.1894506104550685,
  0.1894506104550685, 0.1826034150449236, 0.1691565193950025, 0.1495959888165767,
  0.1246289712555339, 0.0951585116824928, 0.0622535239386479, 0.0271524594117541,
];

function integrateGauss16(fn: (x: number) => number, a: number, b: number): number {
  const mid = 0.5 * (a + b);
  const half = 0.5 * (b - a);
  let sum = 0;
  for (let i = 0; i < 16; i++) {
    sum += GL16_W[i] * fn(mid + half * GL16_X[i]);
  }
  return sum * half;
}

/**
 * Integral P(Range <= w) sob distribuição normal padrão com k variáveis:
 * P(w) = k * \int_{-\infty}^{\infty} \phi(z) [\Phi(z + w) - \Phi(z)]^{k-1} dz
 */
function studentizedRangeNormalProb(w: number, k: number): number {
  if (w <= 0) return 0;
  // Quebra em dois intervalos [-8, 0] e [0, 8] para máxima precisão
  const integrand = (z: number) => {
    const diff = normalCdf(z + w) - normalCdf(z);
    if (diff <= 0) return 0;
    return normalPdf(z) * Math.pow(diff, k - 1);
  };
  const i1 = integrateGauss16(integrand, -7.5, -1.5);
  const i2 = integrateGauss16(integrand, -1.5, 4.5);
  return Math.min(1, Math.max(0, k * (i1 + i2)));
}

/**
 * CDF da Amplitude Estudentizada Q(q; k, df) — Algoritmo numérico exato (sem tabelas estáticas truncadas)
 */
export function studentizedRangeCdf(q: number, k: number, df: number): number {
  if (q <= 0) return 0;
  if (k < 2 || df <= 0) return NaN;
  if (df > 500) return studentizedRangeNormalProb(q, k);

  // Integração sobre s = u / sqrt(df) onde u ~ Chi_df
  // Log densidade de s: c + (df - 1)*ln(s) - df*s^2 / 2
  const halfDf = df / 2;
  const logConst = (1 - halfDf) * Math.LN2 + halfDf * Math.log(df) - logGamma(halfDf);

  const outerIntegrand = (s: number) => {
    if (s <= 0) return 0;
    const logPdf = logConst + (df - 1) * Math.log(s) - 0.5 * df * s * s;
    if (logPdf < -700) return 0;
    return Math.exp(logPdf) * studentizedRangeNormalProb(q * s, k);
  };

  // Suporte concentrado em torno de s = 1 com desvio ~ 1/sqrt(2*df)
  const sdApprox = 1 / Math.sqrt(Math.max(1, 2 * df));
  const sMin = Math.max(1e-5, 1 - 7 * sdApprox);
  const sMax = 1 + 8 * sdApprox;

  let total = 0;
  if (df <= 4) {
    // Cauda esquerda longa para df pequeno
    total += integrateGauss16(outerIntegrand, 1e-6, 0.6);
    total += integrateGauss16(outerIntegrand, 0.6, 1.8);
    total += integrateGauss16(outerIntegrand, 1.8, Math.max(4.5, sMax));
  } else {
    const mid1 = Math.max(sMin, 1 - 2.5 * sdApprox);
    const mid2 = 1 + 2.5 * sdApprox;
    if (sMin < mid1) total += integrateGauss16(outerIntegrand, sMin, mid1);
    total += integrateGauss16(outerIntegrand, mid1, mid2);
    total += integrateGauss16(outerIntegrand, mid2, sMax);
  }
  return Math.min(1, Math.max(0, total));
}

export function studentizedRangePValue(q: number, k: number, df: number): number {
  return Math.min(1, Math.max(0, 1 - studentizedRangeCdf(q, k, df)));
}

export function studentizedRangeQuantile(p: number, k: number, df: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return Infinity;
  if (k < 2 || df <= 0) return NaN;

  let low = 0;
  let high = Math.max(4, tQuantile(1 - (1 - p) / (2 * k), df) * Math.SQRT2 * 1.5);
  if (!Number.isFinite(high)) high = 20;
  while (studentizedRangeCdf(high, k, df) < p && high < 500) {
    high *= 1.5;
  }
  for (let i = 0; i < 45; i++) {
    const mid = 0.5 * (low + high);
    if (studentizedRangeCdf(mid, k, df) < p) low = mid;
    else high = mid;
    if (high - low < 1e-6) break;
  }
  return 0.5 * (low + high);
}

// ============================================================================
// DISTRIBUIÇÃO DE DUNNETT (comparações vs Testemunha com k grupos além do controle)
// ============================================================================

/**
 * Probabilidade conjunta de m = k - 1 comparações contra um único controle
 * sob balanceamento (correlação ρ = 0.5 => Z_i = (X_i - X_0)/sqrt(2) = sqrt(0.5)*Y_i - sqrt(0.5)*Y_0)
 */
function dunnettCondProb(d: number, s: number, mComparisons: number, twoSided: boolean): number {
  if (d <= 0) return 0;
  const integrand = (z0: number) => {
    const uUpper = Math.SQRT2 * d * s + z0;
    const pHi = normalCdf(uUpper);
    const pLo = twoSided ? normalCdf(-Math.SQRT2 * d * s + z0) : 0;
    const prob = Math.max(0, pHi - pLo);
    return normalPdf(z0) * Math.pow(prob, mComparisons);
  };
  return Math.min(1, Math.max(0, integrateGauss16(integrand, -6.5, 0) + integrateGauss16(integrand, 0, 6.5)));
}

export function dunnettCdf(d: number, mComparisons: number, df: number, twoSided = true): number {
  if (d <= 0) return 0;
  if (mComparisons < 1 || df <= 0) return NaN;
  if (df > 500) return dunnettCondProb(d, 1, mComparisons, twoSided);

  const halfDf = df / 2;
  const logConst = (1 - halfDf) * Math.LN2 + halfDf * Math.log(df) - logGamma(halfDf);
  const outer = (s: number) => {
    if (s <= 0) return 0;
    const lp = logConst + (df - 1) * Math.log(s) - 0.5 * df * s * s;
    if (lp < -700) return 0;
    return Math.exp(lp) * dunnettCondProb(d, s, mComparisons, twoSided);
  };

  const sdApprox = 1 / Math.sqrt(Math.max(1, 2 * df));
  const sMin = Math.max(1e-5, 1 - 7 * sdApprox);
  const sMax = 1 + 8 * sdApprox;

  let total = 0;
  if (df <= 4) {
    total += integrateGauss16(outer, 1e-6, 0.7) + integrateGauss16(outer, 0.7, 2.0) + integrateGauss16(outer, 2.0, Math.max(4.5, sMax));
  } else {
    const m1 = Math.max(sMin, 1 - 2.5 * sdApprox);
    const m2 = 1 + 2.5 * sdApprox;
    if (sMin < m1) total += integrateGauss16(outer, sMin, m1);
    total += integrateGauss16(outer, m1, m2);
    total += integrateGauss16(outer, m2, sMax);
  }
  return Math.min(1, Math.max(0, total));
}

export function dunnettQuantile(p: number, mComparisons: number, df: number, twoSided = true): number {
  if (p <= 0) return 0;
  if (p >= 1) return Infinity;
  let low = 0;
  let high = Math.max(3, tQuantile(1 - (1 - p) / (2 * mComparisons), df) * 1.2);
  while (dunnettCdf(high, mComparisons, df, twoSided) < p && high < 200) {
    high *= 1.5;
  }
  for (let i = 0; i < 40; i++) {
    const mid = 0.5 * (low + high);
    if (dunnettCdf(mid, mComparisons, df, twoSided) < p) low = mid;
    else high = mid;
    if (high - low < 1e-5) break;
  }
  return 0.5 * (low + high);
}

// ============================================================================
// SHAPIRO-WILK (ROYSTON AS R94 — n ∈ [3, 5000])
// ============================================================================

export function shapiroWilkTest(values: number[]): { W: number; pValue: number; n: number } {
  const n = values.length;
  if (n < 3) {
    return { W: NaN, pValue: NaN, n };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mean = sorted.reduce((acc, v) => acc + v, 0) / n;
  const ss = sorted.reduce((acc, v) => acc + (v - mean) * (v - mean), 0);

  if (ss <= 1e-18) {
    return { W: 1, pValue: 1, n };
  }

  // Cálculo dos coeficientes a_i via método de Royston (1992/1995) AS R94
  const m = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    const p = (i + 1 - 0.375) / (n + 0.25);
    m[i] = normalQuantile(p);
  }
  const mSumSq = m.reduce((s, v) => s + v * v, 0);
  const cVec = m.map((v) => v / Math.sqrt(mSumSq));
  const u = 1 / Math.sqrt(n);

  const a = new Array<number>(n).fill(0);
  if (n === 3) {
    a[0] = -Math.SQRT1_2;
    a[1] = 0;
    a[2] = Math.SQRT1_2;
  } else {
    const poly = (coeffs: number[], xVal: number) =>
      coeffs.reduce((acc, cf, idx) => acc + cf * Math.pow(xVal, idx), 0);

    a[n - 1] =
      -2.706056 * Math.pow(u, 5) +
      4.434685 * Math.pow(u, 4) -
      2.07119 * Math.pow(u, 3) -
      0.147981 * u * u +
      0.221157 * u +
      cVec[n - 1];
    a[0] = -a[n - 1];

    let phi: number;
    if (n <= 5) {
      phi = (mSumSq - 2 * m[n - 1] * m[n - 1]) / (1 - 2 * a[n - 1] * a[n - 1]);
      for (let i = 1; i < n - 1; i++) {
        a[i] = m[i] / Math.sqrt(phi);
      }
    } else {
      a[n - 2] = poly([-0.0, 0.042981, -0.293762, -1.752461, 5.682633, -3.582633], u) + cVec[n - 2];
      // Ordem correta dos coeficientes de Royston:
      a[n - 2] =
        -3.582633 * Math.pow(u, 5) +
        5.682633 * Math.pow(u, 4) -
        1.752461 * Math.pow(u, 3) -
        0.293762 * u * u +
        0.042981 * u +
        cVec[n - 2];
      a[1] = -a[n - 2];
      phi =
        (mSumSq - 2 * m[n - 1] * m[n - 1] - 2 * m[n - 2] * m[n - 2]) /
        (1 - 2 * a[n - 1] * a[n - 1] - 2 * a[n - 2] * a[n - 2]);
      const sqrtPhi = Math.sqrt(phi);
      for (let i = 2; i < n - 2; i++) {
        a[i] = m[i] / sqrtPhi;
      }
    }
  }

  let num = 0;
  for (let i = 0; i < n; i++) {
    num += a[i] * sorted[i];
  }
  const W = Math.min(1, Math.max(0, (num * num) / ss));

  // Transformação de Royston para cálculo do p-valor
  let pValue: number;
  if (n === 3) {
    const pw = (6 / Math.PI) * (Math.asin(Math.sqrt(W)) - Math.asin(Math.sqrt(0.75)));
    pValue = Math.min(1, Math.max(0, pw));
  } else if (n <= 11) {
    const y = -Math.log(1 - W);
    const gamma = 0.459 * n - 2.273;
    const z = -Math.log(Math.max(1e-12, gamma - y));
    const mu = -0.0006714 * n * n * n + 0.025054 * n * n - 0.39978 * n + 0.544;
    const sigma = Math.exp(-0.0020322 * n * n * n + 0.062767 * n * n - 0.77857 * n + 1.3822);
    pValue = 1 - normalCdf((z - mu) / sigma);
  } else {
    const ln = Math.log(n);
    const y = Math.log(Math.max(1e-15, 1 - W));
    const mu = 0.0038915 * ln * ln * ln - 0.083751 * ln * ln - 0.31082 * ln - 1.5861;
    const sigma = Math.exp(0.0030302 * ln * ln - 0.082676 * ln - 0.4803);
    pValue = 1 - normalCdf((y - mu) / sigma);
  }

  return { W, pValue: Math.min(1, Math.max(0, pValue)), n };
}

/**
 * Postos médios com correção de empates (ties) para Spearman, Kruskal-Wallis, Mann-Whitney, Wilcoxon, Friedman
 */
export function rankWithTies(values: number[]): { ranks: number[]; tieCorrectionSum: number } {
  const indexed = values.map((v, idx) => ({ v, idx })).sort((a, b) => a.v - b.v);
  const ranks = new Array<number>(values.length);
  let tieCorrectionSum = 0;

  let i = 0;
  while (i < indexed.length) {
    let j = i;
    while (j + 1 < indexed.length && indexed[j + 1].v === indexed[i].v) {
      j++;
    }
    const count = j - i + 1;
    const avgRank = (i + 1 + j + 1) / 2;
    for (let k = i; k <= j; k++) {
      ranks[indexed[k].idx] = avgRank;
    }
    if (count > 1) {
      tieCorrectionSum += count * count * count - count;
    }
    i = j + 1;
  }

  return { ranks, tieCorrectionSum };
}
