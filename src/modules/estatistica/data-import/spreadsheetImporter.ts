/**
 * Importador e Validador de Planilhas Científicas — GeaAgro Estatística
 *
 * Suporta:
 * - CSV, TSV, TXT delimitado (via PapaParse com detecção automática de delimitador e vírgula decimal)
 * - XLSX e XLS (via SheetJS / xlsx, com seleção de aba quando houver múltiplas planilhas)
 * - Colagem direta do Excel / LibreOffice Calc / Google Sheets
 * - Conversão entre Formato Largo (tratamentos em colunas) e Formato Longo (empilhado)
 * - Validação rigorosa distinguindo células vazias, N/A explícito, zeros numéricos, erros de tipo e duplicidades
 */

import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import {
  CelulaValor,
  DataValidationIssue,
  DataValidationReport,
  DelineamentoMapeamento,
  EstatisticaVariavel,
  TipoDelineamento,
  TipoVariavel,
} from '../types/estatistica';
import { parseNumericCell, validateDesignCompatibility } from '../statistics-engine/designs/experimentalDesigns';

export interface ParsedSpreadsheetPreview {
  fileName: string;
  mimeType: string;
  rawBytes: Uint8Array;
  sheetNames: string[];
  selectedSheet: string;
  columns: string[];
  rows: Record<string, CelulaValor>[];
}

function normalizeCellRaw(raw: any): CelulaValor {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
  const s = String(raw).trim();
  if (s === '') return null;
  if (s.toUpperCase() === 'NA' || s.toUpperCase() === 'N/A' || s === '-') return 'N/A';

  // Reconhecer números no padrão brasileiro (ex: 1.250,45 ou 45,8) e internacional (45.8)
  if (/^-?\d{1,3}(\.\d{3})*,\d+$/.test(s)) {
    const num = Number(s.replace(/\./g, '').replace(',', '.'));
    if (Number.isFinite(num)) return num;
  }
  if (/^-?\d+,\d+$/.test(s)) {
    const num = Number(s.replace(',', '.'));
    if (Number.isFinite(num)) return num;
  }
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(s)) {
    const num = Number(s);
    if (Number.isFinite(num)) return num;
  }
  return s;
}

function matrixToObjects(matrix: any[][]): {
  columns: string[];
  rows: Record<string, CelulaValor>[];
} {
  const cleanMatrix = matrix.filter((r) => Array.isArray(r) && r.some((c) => c !== null && c !== undefined && String(c).trim() !== ''));
  if (cleanMatrix.length === 0) return { columns: [], rows: [] };

  const headerRow = cleanMatrix[0];
  const usedNames = new Set<string>();
  const columns = headerRow.map((cell, idx) => {
    let base = String(cell ?? '').trim() || `Coluna_${idx + 1}`;
    let candidate = base;
    let suffix = 2;
    while (usedNames.has(candidate)) {
      candidate = `${base}_${suffix++}`;
    }
    usedNames.add(candidate);
    return candidate;
  });

  const rows: Record<string, CelulaValor>[] = [];
  for (let r = 1; r < cleanMatrix.length; r++) {
    const rowArr = cleanMatrix[r];
    const obj: Record<string, CelulaValor> = {};
    let hasAny = false;
    columns.forEach((col, cIdx) => {
      const val = normalizeCellRaw(rowArr[cIdx]);
      if (val !== null) hasAny = true;
      obj[col] = val;
    });
    if (hasAny) rows.push(obj);
  }

  return { columns, rows };
}

export async function parseSpreadsheetFile(
  file: File,
  sheetName?: string
): Promise<ParsedSpreadsheetPreview> {
  const buffer = await file.arrayBuffer();
  const rawBytes = new Uint8Array(buffer);
  const lower = file.name.toLowerCase();

  if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.ods')) {
    const wb = XLSX.read(rawBytes, { type: 'array' });
    const sheetNames = wb.SheetNames || [];
    if (sheetNames.length === 0) {
      throw new Error('Planilha sem abas legíveis.');
    }
    const targetSheet = sheetName && sheetNames.includes(sheetName) ? sheetName : sheetNames[0];
    const ws = wb.Sheets[targetSheet];
    const aoa = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: null });
    const { columns, rows } = matrixToObjects(aoa);
    return {
      fileName: file.name,
      mimeType: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      rawBytes,
      sheetNames,
      selectedSheet: targetSheet,
      columns,
      rows,
    };
  }

  // CSV / TSV / TXT
  const text = new TextDecoder('utf-8').decode(rawBytes);
  const parsed = Papa.parse<any[]>(text, {
    skipEmptyLines: true,
    delimitersToGuess: [';', ',', '\t', '|'],
  });
  const { columns, rows } = matrixToObjects(parsed.data || []);
  return {
    fileName: file.name,
    mimeType: file.type || 'text/csv',
    rawBytes,
    sheetNames: ['CSV'],
    selectedSheet: 'CSV',
    columns,
    rows,
  };
}

export function parsePastedTabularText(text: string): {
  columns: string[];
  rows: Record<string, CelulaValor>[];
  rawBytes: Uint8Array;
} {
  const parsed = Papa.parse<any[]>(text.trim(), {
    skipEmptyLines: true,
    delimitersToGuess: ['\t', ';', ',', '|'],
  });
  const { columns, rows } = matrixToObjects(parsed.data || []);
  return {
    columns,
    rows,
    rawBytes: new TextEncoder().encode(text),
  };
}

/**
 * Converte tabela em Formato Largo (cada coluna numérica ou selecionada é um tratamento)
 * para Formato Longo [tratColName, repColName, valColName]
 */
export function convertWideToLong(params: {
  rows: Record<string, CelulaValor>[];
  treatmentCols: string[];
  idCol?: string; // Opcional (ex: Bloco ou Repetição já existente em coluna)
  tratColName?: string;
  repColName?: string;
  valColName?: string;
}): { columns: string[]; rows: Record<string, CelulaValor>[] } {
  const tratColName = params.tratColName || 'Tratamento';
  const repColName = params.repColName || (params.idCol ? params.idCol : 'Repeticao');
  const valColName = params.valColName || 'Resposta';

  const longRows: Record<string, CelulaValor>[] = [];
  params.rows.forEach((row, rIdx) => {
    const repLabel = params.idCol && row[params.idCol] !== null && row[params.idCol] !== undefined
      ? row[params.idCol]
      : rIdx + 1;

    for (const tCol of params.treatmentCols) {
      longRows.push({
        [tratColName]: tCol,
        [repColName]: repLabel,
        [valColName]: row[tCol] ?? null,
      });
    }
  });

  return {
    columns: [tratColName, repColName, valColName],
    rows: longRows,
  };
}

/**
 * Converte Formato Longo para Formato Largo para visualização ou exportação
 */
export function convertLongToWide(params: {
  rows: Record<string, CelulaValor>[];
  tratCol: string;
  valCol: string;
  repCol?: string;
}): { columns: string[]; rows: Record<string, CelulaValor>[] } {
  const trats = Array.from(new Set(params.rows.map((r) => String(r[params.tratCol] ?? '').trim()).filter(Boolean)));
  const grouped = new Map<string, CelulaValor[]>();
  trats.forEach((t) => grouped.set(t, []));

  for (const r of params.rows) {
    const t = String(r[params.tratCol] ?? '').trim();
    if (t && grouped.has(t)) grouped.get(t)!.push(r[params.valCol] ?? null);
  }

  const maxLen = Math.max(0, ...Array.from(grouped.values()).map((a) => a.length));
  const wideRows: Record<string, CelulaValor>[] = [];
  for (let i = 0; i < maxLen; i++) {
    const obj: Record<string, CelulaValor> = { Repeticao: i + 1 };
    for (const t of trats) {
      obj[t] = grouped.get(t)![i] ?? null;
    }
    wideRows.push(obj);
  }

  return {
    columns: ['Repeticao', ...trats],
    rows: wideRows,
  };
}

/**
 * Infere tipos e papéis iniciais sugeridos (sempre editáveis pelo usuário)
 */
export function inferVariablesFromDataset(
  experimentoId: string,
  columns: string[],
  rows: Record<string, CelulaValor>[]
): Omit<EstatisticaVariavel, 'id' | 'criadoEm'>[] {
  return columns.map((col) => {
    const lower = col.toLowerCase();
    const nonNull = rows.map((r) => r[col]).filter((v) => v !== null && v !== undefined && v !== 'N/A' && v !== '');
    const numericCount = nonNull.filter((v) => parseNumericCell(v) !== null).length;
    const isNumeric = nonNull.length > 0 && numericCount / nonNull.length >= 0.8;

    let tipo: TipoVariavel = isNumeric ? 'quantitativa_continua' : 'qualitativa_nominal';
    if (isNumeric && nonNull.every((v) => Number.isInteger(parseNumericCell(v)))) {
      tipo = 'quantitativa_discreta';
    }

    let papel: EstatisticaVariavel['papel'] = isNumeric ? 'resposta' : 'tratamento';
    if (lower.includes('trat') || lower.includes('cultivar') || lower.includes('genot') || lower.includes('manejo')) {
      papel = 'tratamento';
    } else if (lower.includes('bloc')) {
      papel = 'bloco';
    } else if (lower.includes('rep')) {
      papel = 'repeticao';
    } else if (lower.includes('linha') || lower === 'row') {
      papel = 'linha';
    } else if (lower.includes('col')) {
      papel = 'coluna';
    } else if (lower.includes('parcela') && !lower.includes('sub')) {
      papel = 'parcela';
    } else if (lower.includes('subparcela') || lower.includes('sub')) {
      papel = 'subparcela';
    } else if (lower.includes('tempo') || lower.includes('dia') || lower.includes('epoca') || lower.includes('ano')) {
      papel = 'tempo';
    } else if (lower.includes('dose') || lower.includes('conc')) {
      papel = 'dose';
    }

    return {
      experimentoId,
      nome: col,
      rotulo: col,
      unidade: '',
      tipo,
      papel,
      transformacao: 'nenhuma',
      origemColuna: col,
    };
  });
}

/**
 * Validação completa do banco de dados experimental
 */
export function validateDataset(params: {
  columns: string[];
  rows: Record<string, CelulaValor>[];
  variaveis: Pick<EstatisticaVariavel, 'nome' | 'tipo' | 'papel'>[];
  delineamento: TipoDelineamento;
  mapeamento: DelineamentoMapeamento;
}): DataValidationReport {
  const { columns, rows, variaveis, delineamento, mapeamento } = params;
  let celulasVazias = 0;
  let celulasNA = 0;
  let celulasZero = 0;
  let celulasInvalidasNumericas = 0;
  const problemas: DataValidationIssue[] = [];

  const varTypeMap = new Map(variaveis.map((v) => [v.nome, v]));
  const rowSignatures = new Map<string, number>();
  const linhasDuplicadas: number[] = [];

  rows.forEach((row, rIdx) => {
    const sig = JSON.stringify(columns.map((c) => row[c] ?? null));
    if (rowSignatures.has(sig)) {
      linhasDuplicadas.push(rIdx + 1);
      if (problemas.length < 100) {
        problemas.push({
          linha: rIdx + 1,
          coluna: '(Linha inteira)',
          tipo: 'duplicata',
          mensagem: `Linha ${rIdx + 1} possui valores idênticos à linha ${rowSignatures.get(sig)}.`,
          valorBruto: sig,
        });
      }
    } else {
      rowSignatures.set(sig, rIdx + 1);
    }

    for (const col of columns) {
      const val = row[col];
      if (val === null || val === undefined || val === '') {
        celulasVazias++;
        continue;
      }
      if (val === 'N/A' || String(val).toUpperCase() === 'NA') {
        celulasNA++;
        continue;
      }

      const vMeta = varTypeMap.get(col);
      const isQuant =
        vMeta && (vMeta.tipo === 'quantitativa_continua' || vMeta.tipo === 'quantitativa_discreta');
      const num = parseNumericCell(val);

      if (num === 0) celulasZero++;

      if (isQuant && num === null) {
        celulasInvalidasNumericas++;
        if (problemas.length < 100) {
          problemas.push({
            linha: rIdx + 1,
            coluna: col,
            tipo: 'texto_em_numerica',
            mensagem: `Valor não numérico "${String(val)}" na coluna quantitativa "${col}" (linha ${rIdx + 1}).`,
            valorBruto: val,
          });
        }
      }
    }
  });

  // Balanceamento por tratamento
  const observacoesPorGrupo: Record<string, number> = {};
  const gCol = mapeamento.tratamentoCol || mapeamento.fatoresCols?.[0] || mapeamento.parcelaCol;
  const respCol = mapeamento.respostaCols?.[0];
  if (gCol) {
    for (const r of rows) {
      const g = r[gCol] !== null && r[gCol] !== undefined ? String(r[gCol]).trim() : '';
      if (!g) continue;
      if (respCol && parseNumericCell(r[respCol]) === null) continue;
      observacoesPorGrupo[g] = (observacoesPorGrupo[g] || 0) + 1;
    }
  }
  const counts = Object.values(observacoesPorGrupo);
  const desbalanceado = counts.length > 1 && new Set(counts).size > 1;

  const compat = validateDesignCompatibility(delineamento, mapeamento, rows, respCol);

  return {
    totalLinhas: rows.length,
    totalColunas: columns.length,
    celulasVazias,
    celulasNA,
    celulasZero,
    celulasInvalidasNumericas,
    linhasDuplicadas,
    desbalanceado,
    observacoesPorGrupo,
    problemas,
    compatibilidadeDelineamento: {
      compativel: compat.compativel,
      motivos: compat.motivos,
      avisos: compat.avisos,
    },
  };
}
