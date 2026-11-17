/**
 * Motor de Análise de Regressão & Dose-Resposta — GeaAgro Estatística
 *
 * Modelos implementados:
 * - Linear Simples (y = b0 + b1*x)
 * - Linear Múltipla (y = b0 + b1*x1 + ... + bk*xk, com VIF)
 * - Polinomial Quadrático (grau 2), Cúbico (grau 3) e Polinomial de grau p
 * - Exponencial (y = a * exp(b*x))
 * - Logarítmico (y = a + b * ln(x))
 * - Potência / Alométrico (y = a * x^b)
 * - Logístico 3 parâmetros (Dose-Resposta / Crescimento não linear via Levenberg-Marquardt)
 *
 * Regras científicas obrigatórias:
 * - Nunca selecionar modelos apenas pelo R² isolado (reporta AIC, BIC, R² ajustado e F da regressão)
 * - Alertar extrapolação quando previsões/ótimos caem fora de [x_min, x_max]
 * - Ponto de máximo/mínimo e MET em dose-resposta calculados com verificação de concavidade
 */

import {
  fPValue,
  tPValueTwoTailed,
  tQuantile,
} from '../distributions/distributions';
import {
  fitLinearModel,
  invertMatrix,
  matMul,
  matVec,
  transpose,
} from '../linear-models/linearAlgebra';

export type TipoModeloRegressao =
  | 'linear_simples'
  | 'linear_multipla'
  | 'quadratica'
  | 'cubica'
  | 'polinomial'
  | 'exponencial'
  | 'logaritmica'
  | 'potencia'
  | 'logistica';

export interface CoeficienteRegressao {
  nome: string;
  estimativa: number;
  erroPadrao: number;
  tValor: number;
  pValor: number;
  icInferior: number;
  icSuperior: number;
  vif?: number;
}

export interface PontoCurvaRegressao {
  x: number;
  yPred: number;
  icInf: number;
  icSup: number;
}

export interface DoseRespostaResumo {
  pontoCriticoX: number | null;
  pontoCriticoY: number | null;
  tipoPonto: 'maximo' | 'minimo' | 'inflexao_ec50' | 'nenhum';
  dentroDoIntervaloExperimental: boolean;
  metX: number | null;
  metY: number | null;
  descricao: string;
}

export interface RegressionResult {
  modelo: TipoModeloRegressao;
  equacaoTexto: string;
  variavelResposta: string;
  variaveisPreditoras: string[];
  nObservacoes: number;
  alpha: number;
  coeficientes: CoeficienteRegressao[];
  rSquared: number;
  adjRSquared: number;
  erroPadraoEstimativa: number;
  aic: number;
  bic: number;
  anovaRegressao: {
    fonte: string;
    gl: number;
    sq: number;
    qm: number;
    fValor: number | null;
    pValor: number | null;
  }[];
  observacoes: { x: number; xOriginais: Record<string, number>; yObservado: number; yPredito: number; residuo: number }[];
  curvaPredita: PontoCurvaRegressao[];
  xMin: number;
  xMax: number;
  doseResposta?: DoseRespostaResumo;
  interpretacao: string[];
  avisos: string[];
}

export interface RegressionComparisonSummary {
  modelo: TipoModeloRegressao;
  nomeModelo: string;
  equacao: string;
  kParametros: number;
  rSquared: number;
  adjRSquared: number;
  aic: number;
  bic: number;
  rmse: number;
  pValorGlobal: number | null;
  recomendadoPorCriterio: boolean;
  justificativa: string;
}

function fitLogistic3ParamLM(x: number[], y: number[]): {
  L: number;
  k: number;
  x0: number;
  fitted: number[];
  se: [number, number, number];
  converged: boolean;
} {
  const n = x.length;
  const yMin = Math.min(...y);
  const yMax = Math.max(...y);
  const xMid = (Math.min(...x) + Math.max(...x)) / 2;
  const xSpan = Math.max(1e-6, Math.max(...x) - Math.min(...x));

  // Detectar tendência crescente ou decrescente para sinal inicial de k
  const corrSign =
    x.reduce((s, xi, i) => s + (xi - xMid) * (y[i] - (yMin + yMax) / 2), 0) >= 0 ? 1 : -1;

  let L = yMax * 1.05 > 0 ? yMax * 1.05 : yMax + 1;
  if (yMax <= 0) L = Math.abs(yMax) + 1;
  let k = (corrSign * 4) / xSpan;
  let x0 = xMid;

  const pred = (xi: number, pL: number, pk: number, px0: number) => {
    const expTerm = Math.exp(Math.max(-60, Math.min(60, -pk * (xi - px0))));
    return pL / (1 + expTerm);
  };

  let lambda = 0.01;
  let converged = false;

  for (let iter = 0; iter < 150; iter++) {
    const r = x.map((xi, i) => y[i] - pred(xi, L, k, x0));
    const sse = r.reduce((s, ri) => s + ri * ri, 0);

    // Jacobiano J (n x 3)
    const J: number[][] = x.map((xi) => {
      const z = Math.max(-60, Math.min(60, -k * (xi - x0)));
      const e = Math.exp(z);
      const denom = 1 + e;
      const dL = 1 / denom;
      const dk = (L * (xi - x0) * e) / (denom * denom);
      const dx0 = (-L * k * e) / (denom * denom);
      return [dL, dk, dx0];
    });

    const Jt = transpose(J);
    const JtJ = matMul(Jt, J);
    const Jtr = matVec(Jt, r);

    // Amortecimento de Levenberg-Marquardt
    const damped = JtJ.map((row, i) =>
      row.map((val, j) => (i === j ? val * (1 + lambda) + 1e-10 : val))
    );
    const inv = invertMatrix(damped);
    if (!inv) {
      lambda *= 10;
      continue;
    }

    const step = matVec(inv, Jtr);
    const nL = L + step[0];
    const nk = k + step[1];
    const nx0 = x0 + step[2];

    const newSse = x.reduce((s, xi, i) => {
      const d = y[i] - pred(xi, nL, nk, nx0);
      return s + d * d;
    }, 0);

    if (newSse < sse) {
      L = nL;
      k = nk;
      x0 = nx0;
      lambda = Math.max(1e-7, lambda * 0.3);
      if (Math.abs(sse - newSse) < 1e-10 * (1 + sse)) {
        converged = true;
        break;
      }
    } else {
      lambda = Math.min(1e7, lambda * 5);
    }
  }

  const fitted = x.map((xi) => pred(xi, L, k, x0));
  const ssRes = y.reduce((s, yi, i) => s + (yi - fitted[i]) * (yi - fitted[i]), 0);
  const mse = ssRes / Math.max(1, n - 3);

  const Jfinal: number[][] = x.map((xi) => {
    const z = Math.max(-60, Math.min(60, -k * (xi - x0)));
    const e = Math.exp(z);
    const denom = 1 + e;
    return [1 / denom, (L * (xi - x0) * e) / (denom * denom), (-L * k * e) / (denom * denom)];
  });
  const JtJ = matMul(transpose(Jfinal), Jfinal);
  const covInv = invertMatrix(JtJ);
  const se: [number, number, number] = covInv
    ? [
        Math.sqrt(Math.max(0, covInv[0][0] * mse)),
        Math.sqrt(Math.max(0, covInv[1][1] * mse)),
        Math.sqrt(Math.max(0, covInv[2][2] * mse)),
      ]
    : [NaN, NaN, NaN];

  return { L, k, x0, fitted, se, converged };
}

export function runRegressionAnalysis(params: {
  modelo: TipoModeloRegressao;
  rows: Record<string, any>[];
  responseCol: string;
  predictorCols: string[];
  polyDegree?: number;
  alpha?: number;
  metTargetPercent?: number; // Ex: 0.95 para 95% da resposta máxima (MET)
}): RegressionResult {
  const { modelo, rows, responseCol, predictorCols } = params;
  const alpha = params.alpha ?? 0.05;
  const polyDegree = Math.max(2, Math.min(6, params.polyDegree || (modelo === 'cubica' ? 3 : 2)));

  if (!predictorCols.length) {
    throw new Error('Selecione ao menos uma variável preditora (X).');
  }

  const toNum = (v: any): number | null => {
    if (v === null || v === undefined || v === '' || String(v).toUpperCase() === 'N/A') return null;
    const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };

  const validObs: { y: number; xs: number[]; map: Record<string, number> }[] = [];
  for (const r of rows) {
    const yVal = toNum(r[responseCol]);
    if (yVal === null) continue;
    const xs: number[] = [];
    const map: Record<string, number> = {};
    let ok = true;
    for (const pCol of predictorCols) {
      const xv = toNum(r[pCol]);
      if (xv === null) {
        ok = false;
        break;
      }
      xs.push(xv);
      map[pCol] = xv;
    }
    if (ok) validObs.push({ y: yVal, xs, map });
  }

  const n = validObs.length;
  if (n < 3) {
    throw new Error(`Observações numéricas insuficientes (${n}) para ajustar regressão.`);
  }

  const avisos: string[] = [];
  const xPrimary = validObs.map((o) => o.xs[0]);
  const yArr = validObs.map((o) => o.y);
  const xMin = Math.min(...xPrimary);
  const xMax = Math.max(...xPrimary);
  const yMean = yArr.reduce((s, v) => s + v, 0) / n;
  const ssTot = yArr.reduce((s, yi) => s + (yi - yMean) * (yi - yMean), 0);

  let equacaoTexto = '';
  const coeficientes: CoeficienteRegressao[] = [];
  let rSquared = 0;
  let adjRSquared = 0;
  let erroPadraoEstimativa = 0;
  let aic = 0;
  let bic = 0;
  let anovaRegressao: RegressionResult['anovaRegressao'] = [];
  let fitted: number[] = [];
  let residuals: number[] = [];
  const curvaPredita: PontoCurvaRegressao[] = [];
  let doseResposta: DoseRespostaResumo | undefined;

  if (modelo === 'linear_multipla') {
    if (predictorCols.length < 2) {
      avisos.push('Apenas 1 preditora informada; modelo equivalente à Regressão Linear Simples.');
    }
    const X = validObs.map((o) => [1, ...o.xs]);
    const fit = fitLinearModel(X, yArr, true);
    const tCrit = tQuantile(1 - alpha / 2, fit.dfResidual);

    // Calcular VIF para cada preditora (quando p >= 2)
    const vifs: (number | undefined)[] = [undefined];
    if (predictorCols.length >= 2) {
      for (let j = 0; j < predictorCols.length; j++) {
        const yj = validObs.map((o) => o.xs[j]);
        const XminusJ = validObs.map((o) => [1, ...o.xs.filter((_, idx) => idx !== j)]);
        const fitJ = fitLinearModel(XminusJ, yj, true);
        vifs.push(1 / Math.max(1e-6, 1 - fitJ.rSquared));
      }
    }

    const names = ['Intercepto (β₀)', ...predictorCols.map((c, i) => `β${i + 1} (${c})`)];
    for (let j = 0; j < names.length; j++) {
      const est = fit.beta[j];
      const se = fit.seBeta[j];
      const tVal = se > 1e-18 ? est / se : 0;
      const pVal = tPValueTwoTailed(tVal, fit.dfResidual);
      coeficientes.push({
        nome: names[j],
        estimativa: est,
        erroPadrao: se,
        tValor: tVal,
        pValor: pVal,
        icInferior: est - tCrit * se,
        icSuperior: est + tCrit * se,
        vif: vifs[j],
      });
    }

    if (vifs.some((v) => v !== undefined && v > 10)) {
      avisos.push('Multicolinearidade severa detectada (VIF > 10). Os coeficientes parciais podem estar instáveis.');
    }

    const termsEq = predictorCols
      .map((c, idx) => {
        const b = fit.beta[idx + 1];
        return `${b >= 0 ? '+' : '-'} ${Math.abs(b).toFixed(4)}·${c}`;
      })
      .join(' ');
    equacaoTexto = `${responseCol} = ${fit.beta[0].toFixed(4)} ${termsEq}`;
    rSquared = fit.rSquared;
    adjRSquared = fit.adjRSquared;
    erroPadraoEstimativa = Math.sqrt(fit.msResidual);
    aic = fit.aic;
    bic = fit.bic;
    fitted = fit.fitted;
    residuals = fit.residuals;

    const msReg = fit.dfModel > 0 ? fit.ssRegression / fit.dfModel : 0;
    const fVal = fit.msResidual > 1e-18 ? msReg / fit.msResidual : null;
    const pGlob = fVal !== null && fit.dfModel > 0 ? fPValue(fVal, fit.dfModel, fit.dfResidual) : null;
    anovaRegressao = [
      { fonte: 'Regressão', gl: fit.dfModel, sq: fit.ssRegression, qm: msReg, fValor: fVal, pValor: pGlob },
      { fonte: 'Resíduo', gl: fit.dfResidual, sq: fit.ssResidual, qm: fit.msResidual, fValor: null, pValor: null },
      { fonte: 'Total', gl: n - 1, sq: fit.ssTotal, qm: fit.ssTotal / (n - 1), fValor: null, pValor: null },
    ];
  } else if (
    modelo === 'linear_simples' ||
    modelo === 'quadratica' ||
    modelo === 'cubica' ||
    modelo === 'polinomial'
  ) {
    const deg =
      modelo === 'linear_simples' ? 1 : modelo === 'quadratica' ? 2 : modelo === 'cubica' ? 3 : polyDegree;
    if (n <= deg + 1) {
      throw new Error(`São necessárias ao menos ${deg + 2} observações para polinômio de grau ${deg}.`);
    }

    const X = xPrimary.map((x) => Array.from({ length: deg + 1 }, (_, d) => Math.pow(x, d)));
    const fit = fitLinearModel(X, yArr, true);
    const tCrit = tQuantile(1 - alpha / 2, fit.dfResidual);

    const names = Array.from({ length: deg + 1 }, (_, d) =>
      d === 0 ? 'Intercepto (β₀)' : d === 1 ? `Linear (β₁ · ${predictorCols[0]})` : `Grau ${d} (β${d} · ${predictorCols[0]}^${d})`
    );
    for (let j = 0; j <= deg; j++) {
      const est = fit.beta[j];
      const se = fit.seBeta[j];
      const tVal = se > 1e-18 ? est / se : 0;
      const pVal = tPValueTwoTailed(tVal, fit.dfResidual);
      coeficientes.push({
        nome: names[j],
        estimativa: est,
        erroPadrao: se,
        tValor: tVal,
        pValor: pVal,
        icInferior: est - tCrit * se,
        icSuperior: est + tCrit * se,
      });
    }

    const eqParts = fit.beta.map((b, d) => {
      if (d === 0) return b.toFixed(4);
      const sign = b >= 0 ? ' + ' : ' - ';
      const xPow = d === 1 ? 'x' : `x^${d}`;
      return `${sign}${Math.abs(b).toFixed(4)}${xPow}`;
    });
    equacaoTexto = `ŷ = ${eqParts.join('')}`;
    rSquared = fit.rSquared;
    adjRSquared = fit.adjRSquared;
    erroPadraoEstimativa = Math.sqrt(fit.msResidual);
    aic = fit.aic;
    bic = fit.bic;
    fitted = fit.fitted;
    residuals = fit.residuals;

    const msReg = fit.dfModel > 0 ? fit.ssRegression / fit.dfModel : 0;
    const fVal = fit.msResidual > 1e-18 ? msReg / fit.msResidual : null;
    const pGlob = fVal !== null && fit.dfModel > 0 ? fPValue(fVal, fit.dfModel, fit.dfResidual) : null;
    anovaRegressao = [
      { fonte: 'Regressão', gl: fit.dfModel, sq: fit.ssRegression, qm: msReg, fValor: fVal, pValor: pGlob },
      { fonte: 'Resíduo', gl: fit.dfResidual, sq: fit.ssResidual, qm: fit.msResidual, fValor: null, pValor: null },
      { fonte: 'Total', gl: n - 1, sq: fit.ssTotal, qm: fit.ssTotal / (n - 1), fValor: null, pValor: null },
    ];

    // Banda de confiança sobre 60 pontos entre xMin e xMax
    const gridN = 60;
    for (let i = 0; i <= gridN; i++) {
      const xg = xMin + ((xMax - xMin) * i) / gridN;
      const xVec = Array.from({ length: deg + 1 }, (_, d) => Math.pow(xg, d));
      const yg = xVec.reduce((s, v, idx) => s + v * fit.beta[idx], 0);
      const tmp = matVec(fit.xtxInv, xVec);
      const varPred = fit.msResidual * xVec.reduce((s, v, idx) => s + v * tmp[idx], 0);
      const margin = tCrit * Math.sqrt(Math.max(0, varPred));
      curvaPredita.push({ x: xg, yPred: yg, icInf: yg - margin, icSup: yg + margin });
    }

    // Análise de ponto crítico e MET para quadrática
    if (deg === 2) {
      const b1 = fit.beta[1];
      const b2 = fit.beta[2];
      if (Math.abs(b2) > 1e-15) {
        const xOpt = -b1 / (2 * b2);
        const yOpt = fit.beta[0] + b1 * xOpt + b2 * xOpt * xOpt;
        const tipo = b2 < 0 ? 'maximo' : 'minimo';
        const inside = xOpt >= xMin && xOpt <= xMax;

        // Máxima Eficiência Técnica (MET) / percentual alvo da resposta máxima quando concavidade para baixo
        let metX: number | null = null;
        let metY: number | null = null;
        if (b2 < 0 && inside) {
          const pct = params.metTargetPercent ?? 0.95;
          const y0 = fit.beta[0];
          const targetY = y0 + pct * (yOpt - y0);
          // b2*x^2 + b1*x + (b0 - targetY) = 0 -> menor raiz positiva até xOpt
          const disc = b1 * b1 - 4 * b2 * (y0 - targetY);
          if (disc >= 0) {
            const r1 = (-b1 + Math.sqrt(disc)) / (2 * b2);
            const r2 = (-b1 - Math.sqrt(disc)) / (2 * b2);
            const candidates = [r1, r2].filter((rx) => rx >= xMin && rx <= xOpt);
            if (candidates.length > 0) {
              metX = Math.min(...candidates);
              metY = targetY;
            }
          }
        }

        if (!inside) {
          avisos.push(
            `ALERTA DE EXTRAPOLAÇÃO: O ponto de ${tipo} calculado (x = ${xOpt.toFixed(3)}) encontra-se FORA do intervalo experimental observado [${xMin.toFixed(3)}, ${xMax.toFixed(3)}]. Não recomenda-se extrapolar doses/valores além do testado.`
          );
        }

        doseResposta = {
          pontoCriticoX: xOpt,
          pontoCriticoY: yOpt,
          tipoPonto: tipo,
          dentroDoIntervaloExperimental: inside,
          metX,
          metY,
          descricao:
            tipo === 'maximo'
              ? `Ponto de Máximo: x = ${xOpt.toFixed(4)} → ŷ_máx = ${yOpt.toFixed(4)}${inside ? ' (dentro do intervalo testado)' : ' (EXTRAPOLAÇÃO — fora do intervalo)'}${metX !== null ? `. Dose para ${((params.metTargetPercent ?? 0.95) * 100).toFixed(0)}% da resposta máxima (MET): x = ${metX.toFixed(4)}.` : '.'}`
              : `Ponto de Mínimo: x = ${xOpt.toFixed(4)} → ŷ_mín = ${yOpt.toFixed(4)}${inside ? ' (dentro do intervalo testado)' : ' (EXTRAPOLAÇÃO)'}.`,
        };
      }
    }
  } else if (modelo === 'exponencial' || modelo === 'logaritmica' || modelo === 'potencia') {
    if (modelo === 'exponencial' && yArr.some((y) => y <= 0)) {
      throw new Error('Modelo exponencial (y = a·e^{bx}) exige todos os valores de Y estritamente positivos (> 0).');
    }
    if (modelo === 'logaritmica' && xPrimary.some((x) => x <= 0)) {
      throw new Error('Modelo logarítmico (y = a + b·ln(x)) exige todos os valores de X estritamente positivos (> 0).');
    }
    if (modelo === 'potencia' && (xPrimary.some((x) => x <= 0) || yArr.some((y) => y <= 0))) {
      throw new Error('Modelo de potência (y = a·x^b) exige valores de X e Y estritamente positivos (> 0).');
    }

    const xTrans = modelo === 'exponencial' ? xPrimary : xPrimary.map((x) => Math.log(x));
    const yTrans = modelo === 'logaritmica' ? yArr : yArr.map((y) => Math.log(y));
    const X = xTrans.map((x) => [1, x]);
    const fit = fitLinearModel(X, yTrans, true);
    const tCrit = tQuantile(1 - alpha / 2, fit.dfResidual);

    const b0 = fit.beta[0];
    const b1 = fit.beta[1];

    if (modelo === 'exponencial') {
      const a = Math.exp(b0);
      fitted = xPrimary.map((x) => a * Math.exp(b1 * x));
      equacaoTexto = `ŷ = ${a.toFixed(4)} · e^(${b1.toFixed(4)}x)`;
      coeficientes.push(
        {
          nome: 'a = exp(β₀)',
          estimativa: a,
          erroPadrao: a * fit.seBeta[0],
          tValor: fit.beta[0] / Math.max(1e-18, fit.seBeta[0]),
          pValor: tPValueTwoTailed(fit.beta[0] / Math.max(1e-18, fit.seBeta[0]), fit.dfResidual),
          icInferior: Math.exp(b0 - tCrit * fit.seBeta[0]),
          icSuperior: Math.exp(b0 + tCrit * fit.seBeta[0]),
        },
        {
          nome: 'Taxa b (β₁)',
          estimativa: b1,
          erroPadrao: fit.seBeta[1],
          tValor: b1 / Math.max(1e-18, fit.seBeta[1]),
          pValor: tPValueTwoTailed(b1 / Math.max(1e-18, fit.seBeta[1]), fit.dfResidual),
          icInferior: b1 - tCrit * fit.seBeta[1],
          icSuperior: b1 + tCrit * fit.seBeta[1],
        }
      );
    } else if (modelo === 'logaritmica') {
      fitted = xPrimary.map((x) => b0 + b1 * Math.log(x));
      equacaoTexto = `ŷ = ${b0.toFixed(4)} ${b1 >= 0 ? '+' : '-'} ${Math.abs(b1).toFixed(4)}·ln(x)`;
      coeficientes.push(
        {
          nome: 'Intercepto (a)',
          estimativa: b0,
          erroPadrao: fit.seBeta[0],
          tValor: b0 / Math.max(1e-18, fit.seBeta[0]),
          pValor: tPValueTwoTailed(b0 / Math.max(1e-18, fit.seBeta[0]), fit.dfResidual),
          icInferior: b0 - tCrit * fit.seBeta[0],
          icSuperior: b0 + tCrit * fit.seBeta[0],
        },
        {
          nome: 'Inclinação ln(x) (b)',
          estimativa: b1,
          erroPadrao: fit.seBeta[1],
          tValor: b1 / Math.max(1e-18, fit.seBeta[1]),
          pValor: tPValueTwoTailed(b1 / Math.max(1e-18, fit.seBeta[1]), fit.dfResidual),
          icInferior: b1 - tCrit * fit.seBeta[1],
          icSuperior: b1 + tCrit * fit.seBeta[1],
        }
      );
    } else {
      const a = Math.exp(b0);
      fitted = xPrimary.map((x) => a * Math.pow(x, b1));
      equacaoTexto = `ŷ = ${a.toFixed(4)} · x^(${b1.toFixed(4)})`;
      coeficientes.push(
        {
          nome: 'Escala a = exp(β₀)',
          estimativa: a,
          erroPadrao: a * fit.seBeta[0],
          tValor: b0 / Math.max(1e-18, fit.seBeta[0]),
          pValor: tPValueTwoTailed(b0 / Math.max(1e-18, fit.seBeta[0]), fit.dfResidual),
          icInferior: Math.exp(b0 - tCrit * fit.seBeta[0]),
          icSuperior: Math.exp(b0 + tCrit * fit.seBeta[0]),
        },
        {
          nome: 'Expoente (b)',
          estimativa: b1,
          erroPadrao: fit.seBeta[1],
          tValor: b1 / Math.max(1e-18, fit.seBeta[1]),
          pValor: tPValueTwoTailed(b1 / Math.max(1e-18, fit.seBeta[1]), fit.dfResidual),
          icInferior: b1 - tCrit * fit.seBeta[1],
          icSuperior: b1 + tCrit * fit.seBeta[1],
        }
      );
    }

    residuals = yArr.map((yi, i) => yi - fitted[i]);
    const ssResOrig = residuals.reduce((s, r) => s + r * r, 0);
    const ssRegOrig = Math.max(0, ssTot - ssResOrig);
    const dfRes = Math.max(1, n - 2);
    const msResOrig = ssResOrig / dfRes;

    rSquared = ssTot > 1e-18 ? Math.max(0, 1 - ssResOrig / ssTot) : 0;
    adjRSquared = n > 2 ? 1 - ((1 - rSquared) * (n - 1)) / dfRes : rSquared;
    erroPadraoEstimativa = Math.sqrt(msResOrig);
    const sigma2Mle = Math.max(1e-18, ssResOrig / n);
    const logLik = -0.5 * n * (Math.log(2 * Math.PI * sigma2Mle) + 1);
    aic = 2 * 3 - 2 * logLik;
    bic = Math.log(n) * 3 - 2 * logLik;

    const fVal = msResOrig > 1e-18 ? ssRegOrig / msResOrig : null;
    const pGlob = fVal !== null ? fPValue(fVal, 1, dfRes) : null;
    anovaRegressao = [
      { fonte: 'Modelo', gl: 1, sq: ssRegOrig, qm: ssRegOrig, fValor: fVal, pValor: pGlob },
      { fonte: 'Resíduo', gl: dfRes, sq: ssResOrig, qm: msResOrig, fValor: null, pValor: null },
      { fonte: 'Total', gl: n - 1, sq: ssTot, qm: ssTot / (n - 1), fValor: null, pValor: null },
    ];

    const gridN = 60;
    for (let i = 0; i <= gridN; i++) {
      const xg = xMin + ((xMax - xMin) * i) / gridN;
      let yg = 0;
      if (modelo === 'exponencial') yg = Math.exp(b0) * Math.exp(b1 * xg);
      else if (modelo === 'logaritmica') yg = b0 + b1 * Math.log(Math.max(1e-9, xg));
      else yg = Math.exp(b0) * Math.pow(Math.max(1e-9, xg), b1);
      curvaPredita.push({
        x: xg,
        yPred: yg,
        icInf: yg - tCrit * erroPadraoEstimativa * Math.sqrt(1 / n),
        icSup: yg + tCrit * erroPadraoEstimativa * Math.sqrt(1 / n),
      });
    }
  } else if (modelo === 'logistica') {
    if (n < 4) throw new Error('Modelo logístico não linear (3 parâmetros) exige ≥ 4 observações.');
    const lm = fitLogistic3ParamLM(xPrimary, yArr);
    if (!lm.converged) {
      avisos.push('Otimizador Levenberg-Marquardt atingiu o limite máximo de iterações; avalie se os dados seguem forma sigmoidal.');
    }
    fitted = lm.fitted;
    residuals = yArr.map((yi, i) => yi - fitted[i]);
    const ssRes = residuals.reduce((s, r) => s + r * r, 0);
    const ssReg = Math.max(0, ssTot - ssRes);
    const dfRes = Math.max(1, n - 3);
    const msRes = ssRes / dfRes;
    const tCrit = tQuantile(1 - alpha / 2, dfRes);

    rSquared = ssTot > 1e-18 ? Math.max(0, 1 - ssRes / ssTot) : 0;
    adjRSquared = n > 3 ? 1 - ((1 - rSquared) * (n - 1)) / dfRes : rSquared;
    erroPadraoEstimativa = Math.sqrt(msRes);

    const sigma2Mle = Math.max(1e-18, ssRes / n);
    const logLik = -0.5 * n * (Math.log(2 * Math.PI * sigma2Mle) + 1);
    aic = 2 * 4 - 2 * logLik;
    bic = Math.log(n) * 4 - 2 * logLik;

    const pData = [
      { nome: 'Assíntota Superior (L)', est: lm.L, se: lm.se[0] },
      { nome: 'Taxa de Crescimento (k)', est: lm.k, se: lm.se[1] },
      { nome: 'Ponto de Inflexão / EC50 (x₀)', est: lm.x0, se: lm.se[2] },
    ];
    for (const item of pData) {
      const tVal = Number.isFinite(item.se) && item.se > 1e-18 ? item.est / item.se : 0;
      const pVal = Number.isFinite(item.se) ? tPValueTwoTailed(tVal, dfRes) : 1;
      coeficientes.push({
        nome: item.nome,
        estimativa: item.est,
        erroPadrao: item.se,
        tValor: tVal,
        pValor: pVal,
        icInferior: Number.isFinite(item.se) ? item.est - tCrit * item.se : NaN,
        icSuperior: Number.isFinite(item.se) ? item.est + tCrit * item.se : NaN,
      });
    }

    equacaoTexto = `ŷ = ${lm.L.toFixed(4)} / (1 + e^(-${lm.k.toFixed(4)}·(x - ${lm.x0.toFixed(4)})))`;
    const fVal = msRes > 1e-18 ? (ssReg / 2) / msRes : null;
    const pGlob = fVal !== null ? fPValue(fVal, 2, dfRes) : null;
    anovaRegressao = [
      { fonte: 'Regressão Não Linear', gl: 2, sq: ssReg, qm: ssReg / 2, fValor: fVal, pValor: pGlob },
      { fonte: 'Resíduo', gl: dfRes, sq: ssRes, qm: msRes, fValor: null, pValor: null },
      { fonte: 'Total', gl: n - 1, sq: ssTot, qm: ssTot / (n - 1), fValor: null, pValor: null },
    ];

    const gridN = 60;
    for (let i = 0; i <= gridN; i++) {
      const xg = xMin + ((xMax - xMin) * i) / gridN;
      const yg = lm.L / (1 + Math.exp(Math.max(-60, Math.min(60, -lm.k * (xg - lm.x0)))));
      curvaPredita.push({
        x: xg,
        yPred: yg,
        icInf: yg - tCrit * erroPadraoEstimativa * Math.sqrt(1 / n),
        icSup: yg + tCrit * erroPadraoEstimativa * Math.sqrt(1 / n),
      });
    }

    const inside = lm.x0 >= xMin && lm.x0 <= xMax;
    doseResposta = {
      pontoCriticoX: lm.x0,
      pontoCriticoY: lm.L / 2,
      tipoPonto: 'inflexao_ec50',
      dentroDoIntervaloExperimental: inside,
      metX: null,
      metY: null,
      descricao: `Ponto de inflexão / EC50: x₀ = ${lm.x0.toFixed(4)} (50% da assíntota superior ${lm.L.toFixed(4)}).`,
    };
  }

  const observacoes = validObs.map((o, i) => ({
    x: o.xs[0],
    xOriginais: o.map,
    yObservado: o.y,
    yPredito: fitted[i],
    residuo: residuals[i],
  }));

  const interpretacao: string[] = [
    `Equação ajustada: ${equacaoTexto} (R² = ${(rSquared * 100).toFixed(2)}%, R² ajustado = ${(adjRSquared * 100).toFixed(2)}%, AIC = ${aic.toFixed(2)}, BIC = ${bic.toFixed(2)}).`,
  ];
  const regRow = anovaRegressao[0];
  if (regRow && regRow.pValor !== null) {
    interpretacao.push(
      regRow.pValor < alpha
        ? `A regressão foi globalmente significativa (F = ${regRow.fValor?.toFixed(3)}, p = ${regRow.pValor.toFixed(4)} < ${alpha}).`
        : `A regressão não atingiu significância estatística global ao nível α = ${(alpha * 100).toFixed(1)}% (p = ${regRow.pValor.toFixed(4)}).`
    );
  }
  if (doseResposta) {
    interpretacao.push(doseResposta.descricao);
  }
  interpretacao.push(
    'Nota metodológica: O ajuste deve ser avaliado conjuntamente por significância dos parâmetros, AIC/BIC, análise de resíduos e coerência agronômica/biológica, jamais apenas por R² bruto.'
  );

  return {
    modelo,
    equacaoTexto,
    variavelResposta: responseCol,
    variaveisPreditoras: predictorCols,
    nObservacoes: n,
    alpha,
    coeficientes,
    rSquared,
    adjRSquared,
    erroPadraoEstimativa,
    aic,
    bic,
    anovaRegressao,
    observacoes,
    curvaPredita,
    xMin,
    xMax,
    doseResposta,
    interpretacao,
    avisos,
  };
}

/**
 * Compara automaticamente modelos candidatos para (X, Y) sem selecionar cegamente por R² bruto:
 * Utiliza AICc/BIC + significância do termo de maior ordem para recomendar o melhor equilíbrio ajuste-parcimônia.
 */
export function compareCandidateRegressions(
  rows: Record<string, any>[],
  responseCol: string,
  predictorCol: string,
  alpha = 0.05
): RegressionComparisonSummary[] {
  const candidates: { modelo: TipoModeloRegressao; label: string }[] = [
    { modelo: 'linear_simples', label: 'Linear Simples' },
    { modelo: 'quadratica', label: 'Polinomial Quadrática (2º grau)' },
    { modelo: 'cubica', label: 'Polinomial Cúbica (3º grau)' },
    { modelo: 'exponencial', label: 'Exponencial' },
    { modelo: 'logaritmica', label: 'Logarítmica' },
    { modelo: 'potencia', label: 'Potência (Alométrica)' },
    { modelo: 'logistica', label: 'Logística Não Linear (3P)' },
  ];

  const results: RegressionComparisonSummary[] = [];
  for (const c of candidates) {
    try {
      const res = runRegressionAnalysis({
        modelo: c.modelo,
        rows,
        responseCol,
        predictorCols: [predictorCol],
        alpha,
      });
      const n = res.nObservacoes;
      const k = res.coeficientes.length + 1;
      const aicc = n - k - 1 > 0 ? res.aic + (2 * k * (k + 1)) / (n - k - 1) : res.aic;
      const pGlob = res.anovaRegressao[0]?.pValor ?? null;
      const highestTerm = res.coeficientes[res.coeficientes.length - 1];
      const highestSig = highestTerm ? highestTerm.pValor < alpha : false;

      results.push({
        modelo: c.modelo,
        nomeModelo: c.label,
        equacao: res.equacaoTexto,
        kParametros: res.coeficientes.length,
        rSquared: res.rSquared,
        adjRSquared: res.adjRSquared,
        aic: aicc,
        bic: res.bic,
        rmse: res.erroPadraoEstimativa,
        pValorGlobal: pGlob,
        recomendadoPorCriterio: false,
        justificativa: highestSig
          ? `Termo principal significativo (p = ${highestTerm.pValor.toFixed(4)}). AICc = ${aicc.toFixed(2)}.`
          : `Termo de maior ordem não significativo (p = ${highestTerm?.pValor?.toFixed(4) ?? 'N/A'}); risco de sobreajuste se escolhido só por R².`,
      });
    } catch {
      // Ignora candidatos cujo domínio (ex: log com x<=0) é incompatível
    }
  }

  if (results.length > 0) {
    const validForRec = results.filter((r) => r.pValorGlobal === null || r.pValorGlobal < alpha);
    const pool = validForRec.length > 0 ? validForRec : results;
    let best = pool[0];
    for (const item of pool) {
      if (item.aic < best.aic) best = item;
    }
    best.recomendadoPorCriterio = true;
    best.justificativa = `Menor AICc (${best.aic.toFixed(2)}) entre modelos estatisticamente válidos, equilibrando aderência e parcimônia.`;
  }

  return results.sort((a, b) => a.aic - b.aic);
}
