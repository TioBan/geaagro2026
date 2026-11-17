/**
 * Motor Completo de Análise de Variância (ANOVA) Multi-Estratos — GeaAgro Estatística
 *
 * Implementa modelos exatos para:
 * - DIC (Balanceado e Desbalanceado)
 * - DBC (Balanceado e Desbalanceado via Type III GLM)
 * - DQL (Quadrado Latino)
 * - Fatorial 2 e 3 fatores (em DIC ou DBC) + Desdobramento Automático de Efeitos Simples
 * - Parcelas Subdivididas (Split-Plot) & Parcelas Subdivididas no Tempo (Erro A e Erro B exatos + Satterthwaite)
 * - Experimento em Faixas (Strip-Plot com Erro A, Erro B e Erro C)
 * - Delineamento Aninhado / Hierárquico B(A)
 * - Medidas Repetidas (com correção Greenhouse-Geisser e Huynh-Feldt) e Modelo Misto
 */

import {
  DelineamentoMapeamento,
  TipoDelineamento,
  CelulaValor,
} from '../../types/estatistica';
import {
  buildSumContrastColumns,
  computeType3SS,
  fitLinearModel,
  invertMatrix,
} from '../linear-models/linearAlgebra';
import { fPValue } from '../distributions/distributions';
import {
  parseNumericCell,
  validateDesignCompatibility,
} from '../designs/experimentalDesigns';

export interface AnovaRow {
  fonte: string;
  gl: number;
  sq: number;
  qm: number;
  fValor: number | null;
  pValor: number | null;
  significancia: '***' | '**' | '*' | 'ns' | '-';
  erroReferencia?: string;
}

export interface SimpleEffectSlice {
  titulo: string;
  fatorAvaliado: string;
  condicaoFixa: string;
  tabela: AnovaRow[];
  mediasGrupo: { nivel: string; n: number; media: number; dp: number }[];
}

export interface GroupMeanSummary {
  grupo: string;
  n: number;
  media: number;
  dp: number;
  epm: number;
}

export interface AnovaResult {
  delineamento: TipoDelineamento;
  variavelResposta: string;
  alpha: number;
  nObservacoes: number;
  mediaGeral: number;
  cvExperimental: number;
  rSquared: number;
  erroPadraoResidual: number;
  dfErroPrincipal: number;
  qmErroPrincipal: number;
  // Para parcelas subdivididas / faixas / satterthwaite
  estratosErro: { nome: string; df: number; sq: number; qm: number }[];
  satterthwaiteInfo?: {
    qmCombinadoParcela: number;
    dfSatterthwaiteParcela: number;
    descricao: string;
  };
  esfericidade?: {
    epsilonGG: number;
    epsilonHF: number;
    pValorGG: number | null;
    pValorHF: number | null;
    tempoFator: string;
  };
  tabela: AnovaRow[];
  desdobramentos: SimpleEffectSlice[];
  mediasTratamentos: GroupMeanSummary[];
  residuos: number[];
  valoresAjustados: number[];
  residuosPadronizados: number[];
  residuosStudentizados: number[];
  alavancagem: number[];
  distanciaCook: number[];
  observacoesIndices: number[];
  desbalanceado: boolean;
  interpretacao: string[];
  avisos: string[];
}

function sigSymbol(p: number | null, alpha: number): '***' | '**' | '*' | 'ns' | '-' {
  if (p === null || !Number.isFinite(p)) return '-';
  if (p < 0.001) return '***';
  if (p < 0.01) return '**';
  if (p < alpha) return '*';
  return 'ns';
}

function buildInteractionCols(A: number[][], B: number[][]): number[][] {
  return A.map((rowA, i) => {
    const rowB = B[i];
    const prod: number[] = [];
    for (let a = 0; a < rowA.length; a++) {
      for (let b = 0; b < rowB.length; b++) {
        prod.push(rowA[a] * rowB[b]);
      }
    }
    return prod;
  });
}

function summarizeByCol(
  validRecords: { rawIndex: number; row: Record<string, CelulaValor>; y: number }[],
  groupCol: string
): GroupMeanSummary[] {
  const map = new Map<string, number[]>();
  for (const rec of validRecords) {
    const key = String(rec.row[groupCol] ?? '').trim();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(rec.y);
  }
  return Array.from(map.entries()).map(([grupo, vals]) => {
    const n = vals.length;
    const media = vals.reduce((s, v) => s + v, 0) / n;
    const ss = vals.reduce((s, v) => s + (v - media) * (v - media), 0);
    const dp = n > 1 ? Math.sqrt(ss / (n - 1)) : 0;
    const epm = n > 0 ? dp / Math.sqrt(n) : 0;
    return { grupo, n, media, dp, epm };
  });
}

function runSimpleEffects2Way(
  validRecords: { rawIndex: number; row: Record<string, CelulaValor>; y: number }[],
  fA: string,
  fB: string,
  qmErroGlobal: number,
  dfErroGlobal: number,
  alpha: number
): SimpleEffectSlice[] {
  const slices: SimpleEffectSlice[] = [];
  const levelsA = Array.from(new Set(validRecords.map((r) => String(r.row[fA] ?? '').trim())));
  const levelsB = Array.from(new Set(validRecords.map((r) => String(r.row[fB] ?? '').trim())));

  // Efeito simples de A dentro de cada nível de B
  for (const bLv of levelsB) {
    const sub = validRecords.filter((r) => String(r.row[fB] ?? '').trim() === bLv);
    const subMean = sub.reduce((s, r) => s + r.y, 0) / Math.max(1, sub.length);
    const groups = new Map<string, number[]>();
    for (const r of sub) {
      const aLv = String(r.row[fA] ?? '').trim();
      if (!groups.has(aLv)) groups.set(aLv, []);
      groups.get(aLv)!.push(r.y);
    }
    if (groups.size < 2) continue;
    let sqA = 0;
    const mediasGrupo: { nivel: string; n: number; media: number; dp: number }[] = [];
    for (const [lv, vals] of groups.entries()) {
      const m = vals.reduce((s, v) => s + v, 0) / vals.length;
      sqA += vals.length * (m - subMean) * (m - subMean);
      const ss = vals.reduce((s, v) => s + (v - m) * (v - m), 0);
      mediasGrupo.push({
        nivel: lv,
        n: vals.length,
        media: m,
        dp: vals.length > 1 ? Math.sqrt(ss / (vals.length - 1)) : 0,
      });
    }
    const glA = groups.size - 1;
    const qmA = sqA / glA;
    const fVal = qmErroGlobal > 1e-18 ? qmA / qmErroGlobal : null;
    const pVal = fVal !== null ? fPValue(fVal, glA, dfErroGlobal) : null;

    slices.push({
      titulo: `Desdobramento de ${fA} dentro de ${fB} = ${bLv}`,
      fatorAvaliado: fA,
      condicaoFixa: `${fB} = ${bLv}`,
      tabela: [
        {
          fonte: `${fA} d. ${fB}(${bLv})`,
          gl: glA,
          sq: sqA,
          qm: qmA,
          fValor: fVal,
          pValor: pVal,
          significancia: sigSymbol(pVal, alpha),
          erroReferencia: 'Resíduo Global',
        },
      ],
      mediasGrupo,
    });
  }

  // Efeito simples de B dentro de cada nível de A
  for (const aLv of levelsA) {
    const sub = validRecords.filter((r) => String(r.row[fA] ?? '').trim() === aLv);
    const subMean = sub.reduce((s, r) => s + r.y, 0) / Math.max(1, sub.length);
    const groups = new Map<string, number[]>();
    for (const r of sub) {
      const bLv = String(r.row[fB] ?? '').trim();
      if (!groups.has(bLv)) groups.set(bLv, []);
      groups.get(bLv)!.push(r.y);
    }
    if (groups.size < 2) continue;
    let sqB = 0;
    const mediasGrupo: { nivel: string; n: number; media: number; dp: number }[] = [];
    for (const [lv, vals] of groups.entries()) {
      const m = vals.reduce((s, v) => s + v, 0) / vals.length;
      sqB += vals.length * (m - subMean) * (m - subMean);
      const ss = vals.reduce((s, v) => s + (v - m) * (v - m), 0);
      mediasGrupo.push({
        nivel: lv,
        n: vals.length,
        media: m,
        dp: vals.length > 1 ? Math.sqrt(ss / (vals.length - 1)) : 0,
      });
    }
    const glB = groups.size - 1;
    const qmB = sqB / glB;
    const fVal = qmErroGlobal > 1e-18 ? qmB / qmErroGlobal : null;
    const pVal = fVal !== null ? fPValue(fVal, glB, dfErroGlobal) : null;

    slices.push({
      titulo: `Desdobramento de ${fB} dentro de ${fA} = ${aLv}`,
      fatorAvaliado: fB,
      condicaoFixa: `${fA} = ${aLv}`,
      tabela: [
        {
          fonte: `${fB} d. ${fA}(${aLv})`,
          gl: glB,
          sq: sqB,
          qm: qmB,
          fValor: fVal,
          pValor: pVal,
          significancia: sigSymbol(pVal, alpha),
          erroReferencia: 'Resíduo Global',
        },
      ],
      mediasGrupo,
    });
  }

  return slices;
}

export function runAnova(params: {
  delineamento: TipoDelineamento;
  mapeamento: DelineamentoMapeamento;
  rows: Record<string, CelulaValor>[];
  responseCol: string;
  alpha?: number;
}): AnovaResult {
  const { delineamento, mapeamento, rows, responseCol } = params;
  const alpha = params.alpha ?? 0.05;

  const compat = validateDesignCompatibility(delineamento, mapeamento, rows, responseCol);
  if (!compat.compativel) {
    throw new Error(`Delineamento incompatível: ${compat.motivos.join(' ')}`);
  }

  const validRecords = rows
    .map((row, rawIndex) => {
      const y = parseNumericCell(row[responseCol]);
      return y !== null ? { rawIndex, row, y } : null;
    })
    .filter((v): v is { rawIndex: number; row: Record<string, CelulaValor>; y: number } => v !== null);

  const y = validRecords.map((r) => r.y);
  const n = y.length;
  const mediaGeral = y.reduce((s, v) => s + v, 0) / n;
  const observacoesIndices = validRecords.map((r) => r.rawIndex);

  const levelsOf = (col: string) =>
    Array.from(new Set(validRecords.map((r) => String(r.row[col] ?? '').trim())));

  const avisos: string[] = [...compat.avisos];
  const tabela: AnovaRow[] = [];
  const estratosErro: { nome: string; df: number; sq: number; qm: number }[] = [];
  let desdobramentos: SimpleEffectSlice[] = [];
  let dfErroPrincipal = 1;
  let qmErroPrincipal = 0;
  let fitResult = fitLinearModel(
    y.map(() => [1]),
    y,
    true
  );
  let mediasTratamentos: GroupMeanSummary[] = [];
  let desbalanceado = false;
  let satterthwaiteInfo: AnovaResult['satterthwaiteInfo'];
  let esfericidade: AnovaResult['esfericidade'];

  if (delineamento === 'DIC') {
    const tratCol = mapeamento.tratamentoCol!;
    const tratVals = validRecords.map((r) => String(r.row[tratCol] ?? '').trim());
    const tLevels = levelsOf(tratCol);
    const tCols = buildSumContrastColumns(tratVals, tLevels);

    const { fullFit, terms } = computeType3SS([{ name: tratCol, cols: tCols }], y);
    fitResult = fullFit;
    dfErroPrincipal = fullFit.dfResidual;
    qmErroPrincipal = fullFit.msResidual;

    const counts = tLevels.map((lv) => tratVals.filter((v) => v === lv).length);
    desbalanceado = new Set(counts).size > 1;

    const tTerm = terms[0];
    const fVal = qmErroPrincipal > 1e-18 ? tTerm.ms / qmErroPrincipal : null;
    const pVal = fVal !== null ? fPValue(fVal, tTerm.df, dfErroPrincipal) : null;

    tabela.push({
      fonte: `Tratamento (${tratCol})`,
      gl: tTerm.df,
      sq: tTerm.ss,
      qm: tTerm.ms,
      fValor: fVal,
      pValor: pVal,
      significancia: sigSymbol(pVal, alpha),
      erroReferencia: 'Resíduo',
    });
    tabela.push({
      fonte: 'Resíduo (Erro Experimental)',
      gl: dfErroPrincipal,
      sq: fullFit.ssResidual,
      qm: qmErroPrincipal,
      fValor: null,
      pValor: null,
      significancia: '-',
    });
    tabela.push({
      fonte: 'Total',
      gl: n - 1,
      sq: fullFit.ssTotal,
      qm: fullFit.ssTotal / Math.max(1, n - 1),
      fValor: null,
      pValor: null,
      significancia: '-',
    });

    estratosErro.push({
      nome: 'Erro Experimental (DIC)',
      df: dfErroPrincipal,
      sq: fullFit.ssResidual,
      qm: qmErroPrincipal,
    });
    mediasTratamentos = summarizeByCol(validRecords, tratCol);
  } else if (delineamento === 'DBC') {
    const tratCol = mapeamento.tratamentoCol!;
    const blocoCol = mapeamento.blocoCol!;
    const tVals = validRecords.map((r) => String(r.row[tratCol] ?? '').trim());
    const bVals = validRecords.map((r) => String(r.row[blocoCol] ?? '').trim());
    const tLevels = levelsOf(tratCol);
    const bLevels = levelsOf(blocoCol);

    desbalanceado = n !== tLevels.length * bLevels.length;

    const { fullFit, terms } = computeType3SS(
      [
        { name: tratCol, cols: buildSumContrastColumns(tVals, tLevels) },
        { name: blocoCol, cols: buildSumContrastColumns(bVals, bLevels) },
      ],
      y
    );
    fitResult = fullFit;
    dfErroPrincipal = fullFit.dfResidual;
    qmErroPrincipal = fullFit.msResidual;

    for (const term of terms) {
      const fVal = qmErroPrincipal > 1e-18 ? term.ms / qmErroPrincipal : null;
      const pVal = fVal !== null ? fPValue(fVal, term.df, dfErroPrincipal) : null;
      tabela.push({
        fonte: term.name === tratCol ? `Tratamento (${tratCol})` : `Bloco (${blocoCol})`,
        gl: term.df,
        sq: term.ss,
        qm: term.ms,
        fValor: fVal,
        pValor: pVal,
        significancia: sigSymbol(pVal, alpha),
        erroReferencia: 'Resíduo',
      });
    }
    tabela.push({
      fonte: 'Resíduo (Erro Experimental)',
      gl: dfErroPrincipal,
      sq: fullFit.ssResidual,
      qm: qmErroPrincipal,
      fValor: null,
      pValor: null,
      significancia: '-',
    });
    tabela.push({
      fonte: 'Total',
      gl: n - 1,
      sq: fullFit.ssTotal,
      qm: fullFit.ssTotal / Math.max(1, n - 1),
      fValor: null,
      pValor: null,
      significancia: '-',
    });

    estratosErro.push({
      nome: 'Erro Experimental (DBC)',
      df: dfErroPrincipal,
      sq: fullFit.ssResidual,
      qm: qmErroPrincipal,
    });
    mediasTratamentos = summarizeByCol(validRecords, tratCol);
  } else if (delineamento === 'DQL') {
    const tratCol = mapeamento.tratamentoCol!;
    const linhaCol = mapeamento.linhaCol!;
    const colunaCol = mapeamento.colunaCol!;

    const tVals = validRecords.map((r) => String(r.row[tratCol] ?? '').trim());
    const lVals = validRecords.map((r) => String(r.row[linhaCol] ?? '').trim());
    const cVals = validRecords.map((r) => String(r.row[colunaCol] ?? '').trim());

    const { fullFit, terms } = computeType3SS(
      [
        { name: `Linha (${linhaCol})`, cols: buildSumContrastColumns(lVals, levelsOf(linhaCol)) },
        { name: `Coluna (${colunaCol})`, cols: buildSumContrastColumns(cVals, levelsOf(colunaCol)) },
        { name: `Tratamento (${tratCol})`, cols: buildSumContrastColumns(tVals, levelsOf(tratCol)) },
      ],
      y
    );
    fitResult = fullFit;
    dfErroPrincipal = fullFit.dfResidual;
    qmErroPrincipal = fullFit.msResidual;

    for (const term of terms) {
      const fVal = qmErroPrincipal > 1e-18 ? term.ms / qmErroPrincipal : null;
      const pVal = fVal !== null ? fPValue(fVal, term.df, dfErroPrincipal) : null;
      tabela.push({
        fonte: term.name,
        gl: term.df,
        sq: term.ss,
        qm: term.ms,
        fValor: fVal,
        pValor: pVal,
        significancia: sigSymbol(pVal, alpha),
        erroReferencia: 'Resíduo',
      });
    }
    tabela.push({
      fonte: 'Resíduo (Erro Experimental)',
      gl: dfErroPrincipal,
      sq: fullFit.ssResidual,
      qm: qmErroPrincipal,
      fValor: null,
      pValor: null,
      significancia: '-',
    });
    tabela.push({
      fonte: 'Total',
      gl: n - 1,
      sq: fullFit.ssTotal,
      qm: fullFit.ssTotal / Math.max(1, n - 1),
      fValor: null,
      pValor: null,
      significancia: '-',
    });
    estratosErro.push({
      nome: 'Erro Experimental (DQL)',
      df: dfErroPrincipal,
      sq: fullFit.ssResidual,
      qm: qmErroPrincipal,
    });
    mediasTratamentos = summarizeByCol(validRecords, tratCol);
  } else if (delineamento === 'FATORIAL') {
    const fatores = mapeamento.fatoresCols || [];
    const blocoCol = mapeamento.blocoCol;
    const fA = fatores[0];
    const fB = fatores[1];
    const fC = fatores[2];

    const colsA = buildSumContrastColumns(
      validRecords.map((r) => String(r.row[fA] ?? '').trim()),
      levelsOf(fA)
    );
    const colsB = buildSumContrastColumns(
      validRecords.map((r) => String(r.row[fB] ?? '').trim()),
      levelsOf(fB)
    );
    const colsAB = buildInteractionCols(colsA, colsB);

    const termList: { name: string; cols: number[][] }[] = [
      { name: fA, cols: colsA },
      { name: fB, cols: colsB },
      { name: `${fA} × ${fB}`, cols: colsAB },
    ];

    if (fC) {
      const colsC = buildSumContrastColumns(
        validRecords.map((r) => String(r.row[fC] ?? '').trim()),
        levelsOf(fC)
      );
      const colsAC = buildInteractionCols(colsA, colsC);
      const colsBC = buildInteractionCols(colsB, colsC);
      const colsABC = buildInteractionCols(colsAB, colsC);
      termList.push(
        { name: fC, cols: colsC },
        { name: `${fA} × ${fC}`, cols: colsAC },
        { name: `${fB} × ${fC}`, cols: colsBC },
        { name: `${fA} × ${fB} × ${fC}`, cols: colsABC }
      );
    }

    if (blocoCol) {
      termList.unshift({
        name: `Bloco (${blocoCol})`,
        cols: buildSumContrastColumns(
          validRecords.map((r) => String(r.row[blocoCol] ?? '').trim()),
          levelsOf(blocoCol)
        ),
      });
    }

    const { fullFit, terms } = computeType3SS(termList, y);
    fitResult = fullFit;
    dfErroPrincipal = fullFit.dfResidual;
    qmErroPrincipal = fullFit.msResidual;

    for (const term of terms) {
      const fVal = qmErroPrincipal > 1e-18 ? term.ms / qmErroPrincipal : null;
      const pVal = fVal !== null ? fPValue(fVal, term.df, dfErroPrincipal) : null;
      tabela.push({
        fonte: term.name,
        gl: term.df,
        sq: term.ss,
        qm: term.ms,
        fValor: fVal,
        pValor: pVal,
        significancia: sigSymbol(pVal, alpha),
        erroReferencia: 'Resíduo',
      });
    }

    tabela.push({
      fonte: 'Resíduo',
      gl: dfErroPrincipal,
      sq: fullFit.ssResidual,
      qm: qmErroPrincipal,
      fValor: null,
      pValor: null,
      significancia: '-',
    });
    tabela.push({
      fonte: 'Total',
      gl: n - 1,
      sq: fullFit.ssTotal,
      qm: fullFit.ssTotal / Math.max(1, n - 1),
      fValor: null,
      pValor: null,
      significancia: '-',
    });

    estratosErro.push({
      nome: 'Resíduo Fatorial',
      df: dfErroPrincipal,
      sq: fullFit.ssResidual,
      qm: qmErroPrincipal,
    });
    desdobramentos = runSimpleEffects2Way(validRecords, fA, fB, qmErroPrincipal, dfErroPrincipal, alpha);
    mediasTratamentos = summarizeByCol(validRecords, fA);
  } else if (
    delineamento === 'PARCELA_SUBDIVIDIDA' ||
    delineamento === 'PARCELA_SUBDIVIDIDA_TEMPO'
  ) {
    const blocoCol = mapeamento.blocoCol!;
    const fA = mapeamento.parcelaCol!;
    const fB = delineamento === 'PARCELA_SUBDIVIDIDA_TEMPO' ? mapeamento.tempoCol! : mapeamento.subparcelaCol!;

    const bVals = validRecords.map((r) => String(r.row[blocoCol] ?? '').trim());
    const aVals = validRecords.map((r) => String(r.row[fA] ?? '').trim());
    const sVals = validRecords.map((r) => String(r.row[fB] ?? '').trim());

    const bCols = buildSumContrastColumns(bVals, levelsOf(blocoCol));
    const aCols = buildSumContrastColumns(aVals, levelsOf(fA));
    const erroACols = buildInteractionCols(bCols, aCols);
    const sCols = buildSumContrastColumns(sVals, levelsOf(fB));
    const abCols = buildInteractionCols(aCols, sCols);

    const { fullFit, terms } = computeType3SS(
      [
        { name: `Bloco (${blocoCol})`, cols: bCols },
        { name: `Parcela (${fA})`, cols: aCols },
        { name: 'Erro (a) [Bloco × Parcela]', cols: erroACols },
        {
          name:
            delineamento === 'PARCELA_SUBDIVIDIDA_TEMPO'
              ? `Tempo (${fB})`
              : `Subparcela (${fB})`,
          cols: sCols,
        },
        { name: `${fA} × ${fB}`, cols: abCols },
      ],
      y
    );

    fitResult = fullFit;
    const tBloco = terms[0];
    const tParcela = terms[1];
    const tErroA = terms[2];
    const tSub = terms[3];
    const tInter = terms[4];

    const qmErroA = tErroA.df > 0 ? tErroA.ms : fullFit.msResidual;
    const dfErroA = Math.max(1, tErroA.df);
    const qmErroB = fullFit.msResidual;
    const dfErroB = fullFit.dfResidual;

    dfErroPrincipal = dfErroB;
    qmErroPrincipal = qmErroB;

    const fBloco = qmErroA > 1e-18 ? tBloco.ms / qmErroA : null;
    const pBloco = fBloco !== null ? fPValue(fBloco, tBloco.df, dfErroA) : null;
    const fParcela = qmErroA > 1e-18 ? tParcela.ms / qmErroA : null;
    const pParcela = fParcela !== null ? fPValue(fParcela, tParcela.df, dfErroA) : null;
    const fSub = qmErroB > 1e-18 ? tSub.ms / qmErroB : null;
    const pSub = fSub !== null ? fPValue(fSub, tSub.df, dfErroB) : null;
    const fInter = qmErroB > 1e-18 ? tInter.ms / qmErroB : null;
    const pInter = fInter !== null ? fPValue(fInter, tInter.df, dfErroB) : null;

    tabela.push(
      {
        fonte: tBloco.name,
        gl: tBloco.df,
        sq: tBloco.ss,
        qm: tBloco.ms,
        fValor: fBloco,
        pValor: pBloco,
        significancia: sigSymbol(pBloco, alpha),
        erroReferencia: 'Erro (a)',
      },
      {
        fonte: tParcela.name,
        gl: tParcela.df,
        sq: tParcela.ss,
        qm: tParcela.ms,
        fValor: fParcela,
        pValor: pParcela,
        significancia: sigSymbol(pParcela, alpha),
        erroReferencia: 'Erro (a)',
      },
      {
        fonte: 'Erro (a) — Parcelas',
        gl: tErroA.df,
        sq: tErroA.ss,
        qm: qmErroA,
        fValor: null,
        pValor: null,
        significancia: '-',
      },
      {
        fonte: tSub.name,
        gl: tSub.df,
        sq: tSub.ss,
        qm: tSub.ms,
        fValor: fSub,
        pValor: pSub,
        significancia: sigSymbol(pSub, alpha),
        erroReferencia: 'Erro (b)',
      },
      {
        fonte: tInter.name,
        gl: tInter.df,
        sq: tInter.ss,
        qm: tInter.ms,
        fValor: fInter,
        pValor: pInter,
        significancia: sigSymbol(pInter, alpha),
        erroReferencia: 'Erro (b)',
      },
      {
        fonte: 'Erro (b) — Subparcelas',
        gl: dfErroB,
        sq: fullFit.ssResidual,
        qm: qmErroB,
        fValor: null,
        pValor: null,
        significancia: '-',
      },
      {
        fonte: 'Total',
        gl: n - 1,
        sq: fullFit.ssTotal,
        qm: fullFit.ssTotal / Math.max(1, n - 1),
        fValor: null,
        pValor: null,
        significancia: '-',
      }
    );

    estratosErro.push(
      { nome: 'Erro (a) — Parcelas', df: tErroA.df, sq: tErroA.ss, qm: qmErroA },
      { nome: 'Erro (b) — Subparcelas', df: dfErroB, sq: fullFit.ssResidual, qm: qmErroB }
    );

    // Satterthwaite para comparar Parcela dentro de um nível de Subparcela
    const bCount = Math.max(2, levelsOf(fB).length);
    const qmComb = (qmErroA + (bCount - 1) * qmErroB) / bCount;
    const numSat = Math.pow(qmErroA + (bCount - 1) * qmErroB, 2);
    const denSat =
      (qmErroA * qmErroA) / Math.max(1, dfErroA) +
      Math.pow((bCount - 1) * qmErroB, 2) / Math.max(1, dfErroB);
    const dfSat = denSat > 1e-18 ? numSat / denSat : dfErroA;
    satterthwaiteInfo = {
      qmCombinadoParcela: qmComb,
      dfSatterthwaiteParcela: dfSat,
      descricao: `Erro efetivo de Satterthwaite para comparações da parcela dentro de cada nível da subparcela: QM_comb = ${qmComb.toFixed(4)} com GL ≈ ${dfSat.toFixed(2)}.`,
    };

    desdobramentos = runSimpleEffects2Way(validRecords, fA, fB, qmErroB, dfErroB, alpha);
    mediasTratamentos = summarizeByCol(validRecords, fA);
  } else if (delineamento === 'FAIXAS') {
    const blocoCol = mapeamento.blocoCol!;
    const fA = mapeamento.parcelaCol!;
    const fB = mapeamento.subparcelaCol!;

    const bCols = buildSumContrastColumns(
      validRecords.map((r) => String(r.row[blocoCol] ?? '').trim()),
      levelsOf(blocoCol)
    );
    const aCols = buildSumContrastColumns(
      validRecords.map((r) => String(r.row[fA] ?? '').trim()),
      levelsOf(fA)
    );
    const sCols = buildSumContrastColumns(
      validRecords.map((r) => String(r.row[fB] ?? '').trim()),
      levelsOf(fB)
    );
    const erroACols = buildInteractionCols(bCols, aCols);
    const erroBCols = buildInteractionCols(bCols, sCols);
    const abCols = buildInteractionCols(aCols, sCols);

    const { fullFit, terms } = computeType3SS(
      [
        { name: `Bloco (${blocoCol})`, cols: bCols },
        { name: `Faixa A (${fA})`, cols: aCols },
        { name: 'Erro (a) [Bloco × A]', cols: erroACols },
        { name: `Faixa B (${fB})`, cols: sCols },
        { name: 'Erro (b) [Bloco × B]', cols: erroBCols },
        { name: `Interação (${fA} × ${fB})`, cols: abCols },
      ],
      y
    );

    fitResult = fullFit;
    const tBloco = terms[0];
    const tA = terms[1];
    const tErrA = terms[2];
    const tB = terms[3];
    const tErrB = terms[4];
    const tAB = terms[5];
    const qmErrC = fullFit.msResidual;
    const dfErrC = fullFit.dfResidual;
    dfErroPrincipal = dfErrC;
    qmErroPrincipal = qmErrC;

    const fAVal = tErrA.ms > 1e-18 ? tA.ms / tErrA.ms : null;
    const pAVal = fAVal !== null ? fPValue(fAVal, tA.df, Math.max(1, tErrA.df)) : null;
    const fBVal = tErrB.ms > 1e-18 ? tB.ms / tErrB.ms : null;
    const pBVal = fBVal !== null ? fPValue(fBVal, tB.df, Math.max(1, tErrB.df)) : null;
    const fABVal = qmErrC > 1e-18 ? tAB.ms / qmErrC : null;
    const pABVal = fABVal !== null ? fPValue(fABVal, tAB.df, dfErrC) : null;

    tabela.push(
      { fonte: tBloco.name, gl: tBloco.df, sq: tBloco.ss, qm: tBloco.ms, fValor: null, pValor: null, significancia: '-' },
      { fonte: tA.name, gl: tA.df, sq: tA.ss, qm: tA.ms, fValor: fAVal, pValor: pAVal, significancia: sigSymbol(pAVal, alpha), erroReferencia: 'Erro (a)' },
      { fonte: 'Erro (a)', gl: tErrA.df, sq: tErrA.ss, qm: tErrA.ms, fValor: null, pValor: null, significancia: '-' },
      { fonte: tB.name, gl: tB.df, sq: tB.ss, qm: tB.ms, fValor: fBVal, pValor: pBVal, significancia: sigSymbol(pBVal, alpha), erroReferencia: 'Erro (b)' },
      { fonte: 'Erro (b)', gl: tErrB.df, sq: tErrB.ss, qm: tErrB.ms, fValor: null, pValor: null, significancia: '-' },
      { fonte: tAB.name, gl: tAB.df, sq: tAB.ss, qm: tAB.ms, fValor: fABVal, pValor: pABVal, significancia: sigSymbol(pABVal, alpha), erroReferencia: 'Erro (c)' },
      { fonte: 'Erro (c) — Interação', gl: dfErrC, sq: fullFit.ssResidual, qm: qmErrC, fValor: null, pValor: null, significancia: '-' },
      { fonte: 'Total', gl: n - 1, sq: fullFit.ssTotal, qm: fullFit.ssTotal / Math.max(1, n - 1), fValor: null, pValor: null, significancia: '-' }
    );

    estratosErro.push(
      { nome: 'Erro (a)', df: tErrA.df, sq: tErrA.ss, qm: tErrA.ms },
      { nome: 'Erro (b)', df: tErrB.df, sq: tErrB.ss, qm: tErrB.ms },
      { nome: 'Erro (c)', df: dfErrC, sq: fullFit.ssResidual, qm: qmErrC }
    );
    desdobramentos = runSimpleEffects2Way(validRecords, fA, fB, qmErrC, dfErrC, alpha);
    mediasTratamentos = summarizeByCol(validRecords, fA);
  } else if (delineamento === 'ANINHADO') {
    const fPai = mapeamento.fatorPaiCol!;
    const fSub = mapeamento.fatorAninhadoCol!;
    const paiVals = validRecords.map((r) => String(r.row[fPai] ?? '').trim());
    const subPairs = validRecords.map(
      (r) => `${String(r.row[fPai] ?? '').trim()}::${String(r.row[fSub] ?? '').trim()}`
    );
    const paiLevels = Array.from(new Set(paiVals));
    const subLevels = Array.from(new Set(subPairs));

    // Constrói modelo completo com todas as células Pai::Sub e compara contra só Pai
    const paiCols = buildSumContrastColumns(paiVals, paiLevels);
    const subCols = buildSumContrastColumns(subPairs, subLevels);
    const intercept = Array.from({ length: n }, () => [1]);
    const Xfull = Array.from({ length: n }, (_, i) => [...intercept[i], ...subCols[i]]);
    const Xpai = Array.from({ length: n }, (_, i) => [...intercept[i], ...paiCols[i]]);

    const fitFull = fitLinearModel(Xfull, y, true);
    const fitPai = fitLinearModel(Xpai, y, true);

    const ssPai = fitPai.ssRegression;
    const dfPai = Math.max(1, paiLevels.length - 1);
    const qmPai = ssPai / dfPai;

    const ssSubInPai = Math.max(0, fitPai.ssResidual - fitFull.ssResidual);
    const dfSubInPai = Math.max(1, fitFull.rank - fitPai.rank);
    const qmSubInPai = ssSubInPai / dfSubInPai;

    fitResult = fitFull;
    dfErroPrincipal = fitFull.dfResidual;
    qmErroPrincipal = fitFull.msResidual;

    const fValPai = qmSubInPai > 1e-18 ? qmPai / qmSubInPai : null;
    const pValPai = fValPai !== null ? fPValue(fValPai, dfPai, dfSubInPai) : null;
    const fValSub = qmErroPrincipal > 1e-18 ? qmSubInPai / qmErroPrincipal : null;
    const pValSub = fValSub !== null ? fPValue(fValSub, dfSubInPai, dfErroPrincipal) : null;

    tabela.push(
      {
        fonte: `Fator Superior (${fPai})`,
        gl: dfPai,
        sq: ssPai,
        qm: qmPai,
        fValor: fValPai,
        pValor: pValPai,
        significancia: sigSymbol(pValPai, alpha),
        erroReferencia: `${fSub}(${fPai})`,
      },
      {
        fonte: `Aninhado ${fSub}(${fPai})`,
        gl: dfSubInPai,
        sq: ssSubInPai,
        qm: qmSubInPai,
        fValor: fValSub,
        pValor: pValSub,
        significancia: sigSymbol(pValSub, alpha),
        erroReferencia: 'Resíduo',
      },
      {
        fonte: 'Resíduo (Dentro)',
        gl: dfErroPrincipal,
        sq: fitFull.ssResidual,
        qm: qmErroPrincipal,
        fValor: null,
        pValor: null,
        significancia: '-',
      },
      {
        fonte: 'Total',
        gl: n - 1,
        sq: fitFull.ssTotal,
        qm: fitFull.ssTotal / Math.max(1, n - 1),
        fValor: null,
        pValor: null,
        significancia: '-',
      }
    );

    estratosErro.push(
      { nome: `Aninhado ${fSub}(${fPai})`, df: dfSubInPai, sq: ssSubInPai, qm: qmSubInPai },
      { nome: 'Resíduo (Dentro)', df: dfErroPrincipal, sq: fitFull.ssResidual, qm: qmErroPrincipal }
    );
    mediasTratamentos = summarizeByCol(validRecords, fPai);
  } else if (delineamento === 'MEDIDAS_REPETIDAS' || delineamento === 'MODELO_MISTO') {
    const isRM = delineamento === 'MEDIDAS_REPETIDAS';
    const fixedCol = mapeamento.tratamentoCol;
    const randCol = isRM ? mapeamento.unidadeCol! : mapeamento.efeitoAleatorioCol!;
    const timeCol = isRM ? mapeamento.tempoCol! : undefined;

    const termsInput: { name: string; cols: number[][] }[] = [];
    const rVals = validRecords.map((r) => String(r.row[randCol] ?? '').trim());
    const rLevels = levelsOf(randCol);
    termsInput.push({ name: `Efeito Aleatório (${randCol})`, cols: buildSumContrastColumns(rVals, rLevels) });

    if (fixedCol) {
      const fVals = validRecords.map((r) => String(r.row[fixedCol] ?? '').trim());
      termsInput.push({
        name: `Fator Fixo (${fixedCol})`,
        cols: buildSumContrastColumns(fVals, levelsOf(fixedCol)),
      });
    }

    if (timeCol) {
      const tVals = validRecords.map((r) => String(r.row[timeCol] ?? '').trim());
      const tCols = buildSumContrastColumns(tVals, levelsOf(timeCol));
      termsInput.push({ name: `Tempo (${timeCol})`, cols: tCols });
      if (fixedCol) {
        const fCols = buildSumContrastColumns(
          validRecords.map((r) => String(r.row[fixedCol] ?? '').trim()),
          levelsOf(fixedCol)
        );
        termsInput.push({ name: `${fixedCol} × ${timeCol}`, cols: buildInteractionCols(fCols, tCols) });
      }
    }

    const { fullFit, terms } = computeType3SS(termsInput, y);
    fitResult = fullFit;
    dfErroPrincipal = fullFit.dfResidual;
    qmErroPrincipal = fullFit.msResidual;

    const randTerm = terms[0];
    estratosErro.push(
      { nome: randTerm.name, df: randTerm.df, sq: randTerm.ss, qm: randTerm.ms },
      { nome: 'Resíduo (Intra-unidade)', df: dfErroPrincipal, sq: fullFit.ssResidual, qm: qmErroPrincipal }
    );

    // Calcular Greenhouse-Geisser epsilon se Medidas Repetidas com T >= 3
    let epsGG = 1;
    let epsHF = 1;
    if (isRM && timeCol) {
      const times = levelsOf(timeCol);
      const units = rLevels;
      if (times.length >= 3 && units.length > times.length) {
        // Matriz de dados U x T centralizada por tratamento/média
        const mat: number[][] = [];
        for (const u of units) {
          const rowVals: number[] = [];
          let ok = true;
          for (const t of times) {
            const match = validRecords.find(
              (rec) => String(rec.row[randCol] ?? '').trim() === u && String(rec.row[timeCol] ?? '').trim() === t
            );
            if (!match) {
              ok = false;
              break;
            }
            rowVals.push(match.y);
          }
          if (ok) mat.push(rowVals);
        }
        if (mat.length > times.length) {
          const T = times.length;
          const N = mat.length;
          // Covariância S (T x T)
          const colMeans = Array.from({ length: T }, (_, j) => mat.reduce((s, r) => s + r[j], 0) / N);
          const S: number[][] = Array.from({ length: T }, () => new Array(T).fill(0));
          for (let i = 0; i < T; i++) {
            for (let j = i; j < T; j++) {
              let cov = 0;
              for (let u = 0; u < N; u++) cov += (mat[u][i] - colMeans[i]) * (mat[u][j] - colMeans[j]);
              cov /= Math.max(1, N - 1);
              S[i][j] = cov;
              S[j][i] = cov;
            }
          }
          // Matriz duplamente centrada C = S - S_i. - S_.j + S_..
          const rowMeansS = S.map((r) => r.reduce((a, b) => a + b, 0) / T);
          const grandMeanS = rowMeansS.reduce((a, b) => a + b, 0) / T;
          let traceC = 0;
          let sumSqC = 0;
          for (let i = 0; i < T; i++) {
            for (let j = 0; j < T; j++) {
              const cij = S[i][j] - rowMeansS[i] - rowMeansS[j] + grandMeanS;
              if (i === j) traceC += cij;
              sumSqC += cij * cij;
            }
          }
          if (sumSqC > 1e-18) {
            epsGG = Math.min(1, Math.max(1 / (T - 1), (traceC * traceC) / ((T - 1) * sumSqC)));
            const hfNum = N * (T - 1) * epsGG - 2;
            const hfDen = (T - 1) * (N - 1 - (T - 1) * epsGG);
            epsHF = hfDen > 0 ? Math.min(1, Math.max(epsGG, hfNum / hfDen)) : 1;
          }
        }
      }
    }

    for (let idx = 0; idx < terms.length; idx++) {
      const term = terms[idx];
      // Fator entre-sujeitos (índice 1 quando não há apenas tempo) testado contra o efeito aleatório da unidade quando aplicável
      const useSubjectErr = fixedCol && idx === 1 && randTerm.df > 0 && randTerm.ms > 1e-18;
      const errQm = useSubjectErr ? randTerm.ms : qmErroPrincipal;
      const errDf = useSubjectErr ? randTerm.df : dfErroPrincipal;
      const fVal = errQm > 1e-18 ? term.ms / errQm : null;
      const pVal = fVal !== null ? fPValue(fVal, term.df, errDf) : null;

      if (isRM && timeCol && idx >= (fixedCol ? 2 : 1) && fVal !== null) {
        esfericidade = {
          epsilonGG: epsGG,
          epsilonHF: epsHF,
          pValorGG: fPValue(fVal, term.df * epsGG, errDf * epsGG),
          pValorHF: fPValue(fVal, term.df * epsHF, errDf * epsHF),
          tempoFator: term.name,
        };
      }

      tabela.push({
        fonte: term.name,
        gl: term.df,
        sq: term.ss,
        qm: term.ms,
        fValor: fVal,
        pValor: pVal,
        significancia: sigSymbol(pVal, alpha),
        erroReferencia: useSubjectErr ? randTerm.name : 'Resíduo',
      });
    }

    tabela.push(
      { fonte: 'Resíduo', gl: dfErroPrincipal, sq: fullFit.ssResidual, qm: qmErroPrincipal, fValor: null, pValor: null, significancia: '-' },
      { fonte: 'Total', gl: n - 1, sq: fullFit.ssTotal, qm: fullFit.ssTotal / Math.max(1, n - 1), fValor: null, pValor: null, significancia: '-' }
    );
    mediasTratamentos = summarizeByCol(validRecords, fixedCol || timeCol || randCol);
  }

  const erroPadraoResidual = Math.sqrt(Math.max(0, qmErroPrincipal));
  const cvExperimental = Math.abs(mediaGeral) > 1e-12 ? (erroPadraoResidual / Math.abs(mediaGeral)) * 100 : NaN;

  // Interpretação determinística rigorosa
  const interpretacao: string[] = [];
  const mainSources = tabela.filter((r) => r.pValor !== null);
  for (const row of mainSources) {
    const pStr = row.pValor! < 0.0001 ? '< 0,0001' : row.pValor!.toFixed(4);
    if (row.pValor! < alpha) {
      interpretacao.push(
        `A fonte de variação "${row.fonte}" apresentou efeito estatisticamente significativo ao nível α = ${(alpha * 100).toFixed(1)}% (F = ${row.fValor?.toFixed(3)}, p = ${pStr}), rejeitando-se H₀ de igualdade entre seus níveis.`
      );
    } else {
      interpretacao.push(
        `A fonte de variação "${row.fonte}" não apresentou efeito estatisticamente significativo ao nível α = ${(alpha * 100).toFixed(1)}% (F = ${row.fValor?.toFixed(3)}, p = ${pStr}), não havendo evidência para rejeitar H₀.`
      );
    }
  }
  if (Number.isFinite(cvExperimental)) {
    const precisao =
      cvExperimental < 10
        ? 'alta precisão experimental'
        : cvExperimental <= 20
        ? 'precisão experimental adequada/média'
        : cvExperimental <= 30
        ? 'precisão baixa (variabilidade considerável)'
        : 'precisão muito baixa (recomenda-se inspecionar pressupostos e outliers)';
    interpretacao.push(`O Coeficiente de Variação experimental (CV%) foi de ${cvExperimental.toFixed(2)}%, indicando ${precisao}.`);
  }
  if (desdobramentos.length > 0) {
    const interRow = tabela.find((r) => r.fonte.includes('×'));
    if (interRow && interRow.pValor !== null && interRow.pValor < alpha) {
      interpretacao.push(
        `Como a interação "${interRow.fonte}" foi significativa (p < ${alpha}), os fatores devem ser interpretados conjuntamente através das tabelas de desdobramento de efeitos simples abaixo, e não isoladamente pelas médias marginais.`
      );
    }
  }

  // Suprimir unused import warning caso invertMatrix seja referenciado para extensões futuras
  void invertMatrix;

  return {
    delineamento,
    variavelResposta: responseCol,
    alpha,
    nObservacoes: n,
    mediaGeral,
    cvExperimental,
    rSquared: fitResult.rSquared,
    erroPadraoResidual,
    dfErroPrincipal,
    qmErroPrincipal,
    estratosErro,
    satterthwaiteInfo,
    esfericidade,
    tabela,
    desdobramentos,
    mediasTratamentos,
    residuos: fitResult.residuals,
    valoresAjustados: fitResult.fitted,
    residuosPadronizados: fitResult.standardizedResiduals,
    residuosStudentizados: fitResult.studentizedResiduals,
    alavancagem: fitResult.leverage,
    distanciaCook: fitResult.cooksDistance,
    observacoesIndices,
    desbalanceado,
    interpretacao,
    avisos,
  };
}
