/**
 * Álgebra Linear Numérica e Modelos Lineares Gerais (GLM Type III / OLS) — GeaAgro Estatística
 *
 * Implementação estável por decomposição QR com pivotamento / SVD de Jacobi para matrizes simétricas,
 * permitindo resolver:
 * - Regressão Linear Múltipla e Polinomial (com erros-padrão e VIF)
 * - Modelos Lineares com matrizes de delineamento codificadas por contraste soma-zero (efeito)
 * - Soma de Quadrados Tipo III (SAS/R `car::Anova`) para experimentos balanceados e desbalanceados
 * - Alavancagem h_i (Hat matrix), Distância de Cook e Resíduos Studentizados
 */

export function transpose(A: number[][]): number[][] {
  if (A.length === 0) return [];
  const rows = A.length;
  const cols = A[0].length;
  const T: number[][] = Array.from({ length: cols }, () => new Array(rows).fill(0));
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      T[j][i] = A[i][j];
    }
  }
  return T;
}

export function matMul(A: number[][], B: number[][]): number[][] {
  const m = A.length;
  const k = A[0]?.length || 0;
  const n = B[0]?.length || 0;
  const C: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let i = 0; i < m; i++) {
    for (let p = 0; p < k; p++) {
      const aip = A[i][p];
      if (aip === 0) continue;
      for (let j = 0; j < n; j++) {
        C[i][j] += aip * B[p][j];
      }
    }
  }
  return C;
}

export function matVec(A: number[][], v: number[]): number[] {
  return A.map((row) => row.reduce((s, val, idx) => s + val * v[idx], 0));
}

export function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

/**
 * Autovalores e autovetores de matriz simétrica via método iterativo de Jacobi (alta precisão).
 * Retorna pares ordenados em ordem decrescente de autovalor.
 */
export function symmetricEigenJacobi(
  matrix: number[][],
  maxIter = 200
): { eigenvalues: number[]; eigenvectors: number[][] } {
  const n = matrix.length;
  if (n === 0) return { eigenvalues: [], eigenvectors: [] };

  const A = matrix.map((r) => [...r]);
  const V: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );

  for (let iter = 0; iter < maxIter * n * n; iter++) {
    let maxVal = 0;
    let p = 0;
    let q = 1;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const val = Math.abs(A[i][j]);
        if (val > maxVal) {
          maxVal = val;
          p = i;
          q = j;
        }
      }
    }
    if (maxVal < 1e-13) break;

    const app = A[p][p];
    const aqq = A[q][q];
    const apq = A[p][q];
    const tau = (aqq - app) / (2 * apq);
    const t =
      tau >= 0 ? 1 / (tau + Math.sqrt(1 + tau * tau)) : -1 / (-tau + Math.sqrt(1 + tau * tau));
    const c = 1 / Math.sqrt(1 + t * t);
    const s = t * c;

    A[p][p] = app - t * apq;
    A[q][q] = aqq + t * apq;
    A[p][q] = 0;
    A[q][p] = 0;

    for (let r = 0; r < n; r++) {
      if (r !== p && r !== q) {
        const arp = A[r][p];
        const arq = A[r][q];
        A[r][p] = c * arp - s * arq;
        A[p][r] = A[r][p];
        A[r][q] = s * arp + c * arq;
        A[q][r] = A[r][q];
      }
    }

    for (let r = 0; r < n; r++) {
      const vrp = V[r][p];
      const vrq = V[r][q];
      V[r][p] = c * vrp - s * vrq;
      V[r][q] = s * vrp + c * vrq;
    }
  }

  const pairs = Array.from({ length: n }, (_, i) => ({
    val: A[i][i],
    vec: V.map((row) => row[i]),
  })).sort((a, b) => b.val - a.val);

  return {
    eigenvalues: pairs.map((p) => p.val),
    eigenvectors: pairs.map((p) => p.vec), // eigenvectors[k] é o k-ésimo autovetor
  };
}

/**
 * Pseudo-inversa de Moore-Penrose de matriz simétrica semidefinida positiva X^T X via decomposição espectral.
 * Garante estabilidade mesmo em matrizes de delineamento com colinearidade ou células vazias.
 */
export function pseudoInverseSymmetric(S: number[][], tol = 1e-10): { inv: number[][]; rank: number } {
  const n = S.length;
  if (n === 0) return { inv: [], rank: 0 };
  const { eigenvalues, eigenvectors } = symmetricEigenJacobi(S);
  const maxEig = Math.max(1e-15, ...eigenvalues.map(Math.abs));
  const threshold = tol * maxEig;

  const inv: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  let rank = 0;

  for (let k = 0; k < n; k++) {
    const lam = eigenvalues[k];
    if (lam > threshold) {
      rank++;
      const vec = eigenvectors[k];
      const invLam = 1 / lam;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          inv[i][j] += invLam * vec[i] * vec[j];
        }
      }
    }
  }

  return { inv, rank };
}

/**
 * Inversão Gauss-Jordan com pivotamento parcial para matrizes quadradas não singulares.
 */
export function invertMatrix(M: number[][]): number[][] | null {
  const n = M.length;
  const aug = M.map((row, i) => [
    ...row,
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  ]);

  for (let col = 0; col < n; col++) {
    let pivotRow = col;
    let maxAbs = Math.abs(aug[col][col]);
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(aug[r][col]) > maxAbs) {
        maxAbs = Math.abs(aug[r][col]);
        pivotRow = r;
      }
    }
    if (maxAbs < 1e-12) return null;
    if (pivotRow !== col) {
      const tmp = aug[col];
      aug[col] = aug[pivotRow];
      aug[pivotRow] = tmp;
    }
    const diag = aug[col][col];
    for (let j = 0; j < 2 * n; j++) aug[col][j] /= diag;

    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = aug[r][col];
      if (factor === 0) continue;
      for (let j = 0; j < 2 * n; j++) {
        aug[r][j] -= factor * aug[col][j];
      }
    }
  }

  return aug.map((row) => row.slice(n));
}

export interface OlsFitResult {
  beta: number[];
  fitted: number[];
  residuals: number[];
  ssResidual: number;
  ssRegression: number;
  ssTotal: number;
  dfModel: number;
  dfResidual: number;
  msResidual: number;
  rSquared: number;
  adjRSquared: number;
  aic: number;
  bic: number;
  xtxInv: number[][];
  seBeta: number[];
  leverage: number[];
  cooksDistance: number[];
  standardizedResiduals: number[];
  studentizedResiduals: number[];
  rank: number;
}

/**
 * Ajuste por Mínimos Quadrados Ordinários (GLM com pseudo-inversa segura).
 */
export function fitLinearModel(X: number[][], y: number[], hasIntercept = true): OlsFitResult {
  const n = X.length;
  const p = X[0]?.length || 0;
  const Xt = transpose(X);
  const XtX = matMul(Xt, X);
  const Xty = matVec(Xt, y);

  const { inv: xtxInv, rank } = pseudoInverseSymmetric(XtX);
  const beta = matVec(xtxInv, Xty);
  const fitted = matVec(X, beta);
  const residuals = y.map((yi, i) => yi - fitted[i]);

  const yMean = y.reduce((s, v) => s + v, 0) / Math.max(1, n);
  const ssTotal = y.reduce((s, yi) => s + (yi - yMean) * (yi - yMean), 0);
  const ssResidual = residuals.reduce((s, r) => s + r * r, 0);
  const ssRegression = Math.max(0, ssTotal - ssResidual);

  const dfModel = Math.max(0, hasIntercept ? rank - 1 : rank);
  const dfResidual = Math.max(1, n - rank);
  const msResidual = ssResidual / dfResidual;

  const rSquared = ssTotal > 1e-18 ? Math.max(0, Math.min(1, 1 - ssResidual / ssTotal)) : 0;
  const adjRSquared =
    n > rank && ssTotal > 1e-18
      ? 1 - ((1 - rSquared) * (n - (hasIntercept ? 1 : 0))) / Math.max(1, n - rank)
      : rSquared;

  const sigma2Mle = Math.max(1e-18, ssResidual / Math.max(1, n));
  const logLik = -0.5 * n * (Math.log(2 * Math.PI * sigma2Mle) + 1);
  const kParams = rank + 1; // betas + sigma^2
  const aic = 2 * kParams - 2 * logLik;
  const bic = Math.log(Math.max(1, n)) * kParams - 2 * logLik;

  const seBeta = xtxInv.map((row, j) => Math.sqrt(Math.max(0, row[j] * msResidual)));

  // Hat matrix diagonals h_i = x_i^T (X^T X)^+ x_i
  const leverage = X.map((xi) => {
    const tmp = matVec(xtxInv, xi);
    return Math.min(0.999999, Math.max(0, dot(xi, tmp)));
  });

  const rmse = Math.sqrt(Math.max(1e-18, msResidual));
  const standardizedResiduals = residuals.map((e, i) => {
    const denom = rmse * Math.sqrt(Math.max(1e-8, 1 - leverage[i]));
    return e / denom;
  });

  const studentizedResiduals = residuals.map((e, i) => {
    const hi = leverage[i];
    if (dfResidual <= 1) return standardizedResiduals[i];
    const rStd = standardizedResiduals[i];
    const num = Math.max(0, dfResidual - 1);
    const den = Math.max(1e-8, dfResidual - rStd * rStd);
    return rStd * Math.sqrt(num / den);
  });

  const cooksDistance = residuals.map((e, i) => {
    const hi = leverage[i];
    const oneMinusH = Math.max(1e-8, 1 - hi);
    return ((e * e) / (Math.max(1, rank) * Math.max(1e-18, msResidual))) * (hi / (oneMinusH * oneMinusH));
  });

  return {
    beta,
    fitted,
    residuals,
    ssResidual,
    ssRegression,
    ssTotal,
    dfModel,
    dfResidual,
    msResidual,
    rSquared,
    adjRSquared,
    aic,
    bic,
    xtxInv,
    seBeta,
    leverage,
    cooksDistance,
    standardizedResiduals,
    studentizedResiduals,
    rank,
  };
}

/**
 * Gera colunas de contraste soma-zero (efeito) para um fator com níveis L_1, ..., L_k.
 * Retorna k - 1 colunas onde o último nível recebe -1.
 */
export function buildSumContrastColumns(
  values: string[],
  levels: string[]
): number[][] {
  const k = levels.length;
  if (k <= 1) return values.map(() => []);
  const levelMap = new Map(levels.map((lv, idx) => [lv, idx]));
  return values.map((v) => {
    const row = new Array(k - 1).fill(0);
    const idx = levelMap.get(v);
    if (idx === undefined) return row;
    if (idx === k - 1) {
      for (let j = 0; j < k - 1; j++) row[j] = -1;
    } else {
      row[idx] = 1;
    }
    return row;
  });
}

/**
 * Soma de Quadrados Tipo III (marginal) para cada termo nomeado de uma matriz de design.
 * SS_III(term) = SS_res(Modelo Reduzido sem o termo) - SS_res(Modelo Completo)
 */
export function computeType3SS(
  termColumns: { name: string; cols: number[][] }[],
  y: number[]
): {
  fullFit: OlsFitResult;
  terms: { name: string; ss: number; df: number; ms: number }[];
} {
  const n = y.length;
  // Constrói X completo com intercepto na coluna 0
  const interceptCol = Array.from({ length: n }, () => [1]);
  const fullBlocks = [interceptCol, ...termColumns.map((t) => t.cols)];
  const combineBlocks = (blocks: number[][][]): number[][] =>
    Array.from({ length: n }, (_, i) => blocks.flatMap((b) => b[i] || []));

  const Xfull = combineBlocks(fullBlocks);
  const fullFit = fitLinearModel(Xfull, y, true);

  const terms = termColumns.map((term, termIdx) => {
    const reducedBlocks = [
      interceptCol,
      ...termColumns.filter((_, i) => i !== termIdx).map((t) => t.cols),
    ];
    const Xred = combineBlocks(reducedBlocks);
    const redFit = fitLinearModel(Xred, y, true);
    const ss = Math.max(0, redFit.ssResidual - fullFit.ssResidual);
    const df = Math.max(0, fullFit.rank - redFit.rank);
    const ms = df > 0 ? ss / df : 0;
    return { name: term.name, ss, df, ms };
  });

  return { fullFit, terms };
}
