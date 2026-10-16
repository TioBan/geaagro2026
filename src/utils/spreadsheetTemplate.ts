import Papa from 'papaparse';
import { SoilSample } from '../types/agronomy';
import { calculateSoilIndices } from './agronomicCalculations';

export const CSV_TEMPLATE_HEADERS = [
  'codigo_amostra',
  'talhao_nome',
  'data_coleta',
  'profundidade',
  'laboratorio',
  'ph_cacl2',
  'ph_h2o',
  'ph_smp',
  'materia_organica_g_dm3',
  'fosforo_p_mehlich1_mg_dm3',
  'fosforo_p_mehlich3_mg_dm3',
  'fosforo_p_resina_mg_dm3',
  'fosforo_p_remanescente_mg_l',
  'fosforo_p_remanescente3_mg_l',
  'potassio_k_cmolc_dm3',
  'potassio_k_mg_dm3',
  'calcio_ca_cmolc_dm3',
  'magnesio_mg_cmolc_dm3',
  'aluminio_al_cmolc_dm3',
  'acidez_potencial_h_al_cmolc_dm3',
  'enxofre_s_mg_dm3',
  'boro_b_mg_dm3',
  'cobre_cu_mg_dm3',
  'ferro_fe_mg_dm3',
  'manganes_mn_mg_dm3',
  'zinco_zn_mg_dm3',
  'silicio_si_mg_dm3',
  'cobalto_co_mg_dm3',
  'niquel_ni_mg_dm3',
  'selenio_se_mg_dm3',
  'sodio_na_cmolc_dm3',
  'argila_porcento',
  'areia_porcento',
  'silte_porcento',
  'arilsulfatase_mg_pnp_kg_h',
  'beta_glicosidase_mg_pnp_kg_h',
  'fosfatase_acida_mg_pnp_kg_h',
  'iqs_bio',
];

export const CSV_TEMPLATE_SAMPLE_ROWS = [
  [
    'AMO-001',
    'Talhão 01 - Sede',
    '2026-08-10',
    '0-20',
    'LabSolos Brasil',
    '4.8',
    '5.4',
    '5.6',
    '22.0',
    '8.5',
    '10.2',
    '12.0',
    '24.0',
    '22.5',
    '0.18',
    '1.80',
    '0.70',
    '0.60',
    '3.80',
    '6.2',
    '0.32',
    '0.90',
    '35.0',
    '8.5',
    '1.20',
    '14.5',
    '0.12',
    '0.25',
    '0.06',
    '0.02',
    '42.0',
    '38.0',
    '20.0',
    '240.0',
    '125.0',
    '480.0',
    '0.78',
  ],
  [
    'AMO-002',
    'Talhão 02 - Pivô Central',
    '2026-08-10',
    '0-20',
    'LabSolos Brasil',
    '5.4',
    '6.0',
    '6.3',
    '28.5',
    '16.0',
    '18.5',
    '22.0',
    '32.0',
    '30.0',
    '0.32',
    '3.20',
    '1.20',
    '0.10',
    '2.40',
    '12.0',
    '0.55',
    '1.40',
    '42.0',
    '14.0',
    '2.60',
    '22.0',
    '0.18',
    '0.38',
    '0.10',
    '0.03',
    '35.0',
    '45.0',
    '20.0',
    '320.0',
    '160.0',
    '620.0',
    '0.92',
  ],
  [
    'AMO-003',
    'Talhão 03 - Baixada',
    '2026-08-11',
    '20-40',
    'LabSolos Brasil',
    '4.6',
    '5.2',
    '5.3',
    '14.0',
    '3.2',
    '4.0',
    '5.0',
    '18.0',
    '16.5',
    '0.09',
    '0.90',
    '0.40',
    '0.90',
    '4.20',
    '3.5',
    '0.18',
    '0.60',
    '28.0',
    '5.2',
    '0.80',
    '10.0',
    '0.08',
    '0.15',
    '0.04',
    '0.01',
    '48.0',
    '32.0',
    '20.0',
    '110.0',
    '60.0',
    '290.0',
    '0.45',
  ],
];

/**
 * Gera e dispara o download do arquivo de modelo CSV oficial para o usuário
 */
export function downloadSoilCsvTemplate(): void {
  const csvContent = [
    CSV_TEMPLATE_HEADERS.join(';'),
    ...CSV_TEMPLATE_SAMPLE_ROWS.map(row => row.join(';')),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'modelo_importacao_analise_solo_agronutri.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export interface ValidationIssue {
  rowNumber: number;
  sampleCode: string;
  field: string;
  type: 'error' | 'warning';
  message: string;
}

export interface ImportValidationResult {
  isValid: boolean;
  totalSamples: number;
  validCount: number;
  warningCount: number;
  errorCount: number;
  samples: SoilSample[];
  issues: ValidationIssue[];
}

/**
 * Valida os dados químicos e agronômicos de até 50 amostras
 */
export function validateAndParseSoilCsv(
  csvText: string,
  defaultFarmId: string,
  defaultPlotId?: string
): ImportValidationResult {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
    delimiter: '', // auto-detect comma or semicolon
  });

  const issues: ValidationIssue[] = [];
  const validSamples: SoilSample[] = [];

  const rawRows = parsed.data;

  // Limite estrito de 50 amostras por lote conforme requisito
  if (rawRows.length > 50) {
    issues.push({
      rowNumber: 0,
      sampleCode: 'LOTE',
      field: 'limite_lote',
      type: 'error',
      message: `O arquivo contém ${rawRows.length} amostras. O limite máximo permitido é de 50 amostras por importação.`,
    });
  }

  const rowsToProcess = rawRows.slice(0, 50);

  rowsToProcess.forEach((row, index) => {
    const rowNum = index + 2; // +1 zero-indexed, +1 header
    const sampleCode = (row.codigo_amostra || row.codigo || row.amostra || `AMO-${String(index + 1).padStart(3, '0')}`).trim();
    const rowIssues: string[] = [];

    // Helper numérico robusto (trata vírgulas decimais brasileiras)
    const parseNumber = (val: any, fallback = 0): number => {
      if (val === undefined || val === null || val === '') return fallback;
      const clean = String(val).replace(/\s/g, '').replace(',', '.');
      const num = parseFloat(clean);
      return isNaN(num) ? fallback : num;
    };

    const ph = parseNumber(row.ph_cacl2 || row.ph || row.ph_cacl, 0);
    const phH2o = parseNumber(row.ph_h2o || row.ph_agua, 0) || (ph > 0 ? Number((ph + 0.6).toFixed(2)) : undefined);
    const phSmp = parseNumber(row.ph_smp || row.smp || row.indice_smp, 0) || undefined;
    const mo = parseNumber(row.materia_organica_g_dm3 || row.mo || row.m_o, 0);
    const p = parseNumber(row.fosforo_p_mehlich1_mg_dm3 || row.fosforo_p_mg_dm3 || row.p || row.p_mehlich1 || row.fosforo, 0);
    const pMehlich3 = parseNumber(row.fosforo_p_mehlich3_mg_dm3 || row.p_mehlich3 || row.p_mehlich_3, 0) || undefined;
    const pResina = parseNumber(row.fosforo_p_resina_mg_dm3 || row.p_resina, 0) || undefined;
    const pRem = parseNumber(row.fosforo_p_remanescente_mg_l || row.p_rem || row.prem || row.p_remanescente, 0) || undefined;
    const pRem3 = parseNumber(row.fosforo_p_remanescente3_mg_l || row.p_rem3 || row.prem3 || row.remanescente_3, 0) || undefined;
    const kCmolc = parseNumber(row.potassio_k_cmolc_dm3 || row.k || row.potassio || row.k_cmolc, 0);
    const kMg = parseNumber(row.potassio_k_mg_dm3 || row.potassio_mg_dm3 || row.k_mg_dm3 || row.k_mgdm3 || row.k_mg, 0);
    const k = kCmolc > 0 ? kCmolc : (kMg > 0 ? Number((kMg / 391).toFixed(3)) : 0);
    const ca = parseNumber(row.calcio_ca_cmolc_dm3 || row.ca || row.calcio, 0);
    const mg = parseNumber(row.magnesio_mg_cmolc_dm3 || row.mg || row.magnesio, 0);
    const al = parseNumber(row.aluminio_al_cmolc_dm3 || row.al || row.aluminio, 0);
    const hAl = parseNumber(row.acidez_potencial_h_al_cmolc_dm3 || row.h_al || row.hal, 0);
    
    const s = parseNumber(row.enxofre_s_mg_dm3 || row.s || row.enxofre, 0);
    const b = parseNumber(row.boro_b_mg_dm3 || row.b || row.boro, 0);
    const cu = parseNumber(row.cobre_cu_mg_dm3 || row.cu || row.cobre, 0);
    const fe = parseNumber(row.ferro_fe_mg_dm3 || row.fe || row.ferro, 0);
    const mn = parseNumber(row.manganes_mn_mg_dm3 || row.mn || row.manganes, 0);
    const zn = parseNumber(row.zinco_zn_mg_dm3 || row.zn || row.zinco, 0);
    
    // Elementos Benéficos
    const si = parseNumber(row.silicio_si_mg_dm3 || row.si || row.silicio, 0) || undefined;
    const co = parseNumber(row.cobalto_co_mg_dm3 || row.co || row.cobalto, 0) || undefined;
    const ni = parseNumber(row.niquel_ni_mg_dm3 || row.ni || row.niquel, 0) || undefined;
    const se = parseNumber(row.selenio_se_mg_dm3 || row.se || row.selenio, 0) || undefined;
    const na = parseNumber(row.sodio_na_cmolc_dm3 || row.na || row.sodio, 0) || undefined;
    
    const clay = parseNumber(row.argila_porcento || row.argila, 30);
    const sand = parseNumber(row.areia_porcento || row.areia, 50);
    const silt = parseNumber(row.silte_porcento || row.silte, 20);

    // Validações de Consistência Agronômica
    if (!sampleCode) {
      issues.push({
        rowNumber: rowNum,
        sampleCode: 'N/A',
        field: 'codigo_amostra',
        type: 'error',
        message: 'Código da amostra não informado.',
      });
      rowIssues.push('Código da amostra ausente');
    }

    if (ph <= 0 || ph < 3.0 || ph > 9.0) {
      issues.push({
        rowNumber: rowNum,
        sampleCode,
        field: 'ph_cacl2',
        type: 'error',
        message: `pH CaCl2 (${ph}) fora da faixa quimicamente plausível (3.0 a 9.0).`,
      });
      rowIssues.push('pH fora da faixa plausível');
    }

    if (ca <= 0 && mg <= 0) {
      issues.push({
        rowNumber: rowNum,
        sampleCode,
        field: 'calcio_ca_cmolc_dm3',
        type: 'error',
        message: 'Cálcio e Magnésio não podem estar ambos zerados.',
      });
      rowIssues.push('Cálcio/Magnésio zerados');
    }

    if (hAl <= 0) {
      issues.push({
        rowNumber: rowNum,
        sampleCode,
        field: 'acidez_potencial_h_al_cmolc_dm3',
        type: 'warning',
        message: 'Acidez potencial (H+Al) zerada; necessária para cálculo preciso da CTC e V%.',
      });
      rowIssues.push('H+Al zerado');
    }

    if (clay <= 0 || clay > 100) {
      issues.push({
        rowNumber: rowNum,
        sampleCode,
        field: 'argila_porcento',
        type: 'warning',
        message: `Teor de argila (${clay}%) incomum; adotado valor padrão para gessagem.`,
      });
      rowIssues.push('Argila atípica');
    }

    // Regra cruzada: Al alto com pH alto é anomalia analítica
    if (ph > 5.8 && al > 0.8) {
      issues.push({
        rowNumber: rowNum,
        sampleCode,
        field: 'aluminio_al_cmolc_dm3',
        type: 'warning',
        message: `Inconsistência química: Al trocável (${al} cmolc/dm³) alto em solo com pH corrigido (${ph}).`,
      });
      rowIssues.push('Inconsistência Al x pH');
    }

    // Cria o objeto SoilSample com índices calculados
    const baseSample: SoilSample = {
      id: `soil-${Date.now()}-${index}`,
      sampleCode,
      farmId: defaultFarmId,
      plotId: defaultPlotId || 'plot-default',
      collectionDate: row.data_coleta || new Date().toISOString().split('T')[0],
      depth: (row.profundidade === '20-40' ? '20-40' : '0-20') as any,
      labName: row.laboratorio || 'Laboratório Agronômico',
      labProtocol: `LA-${Math.floor(100000 + Math.random() * 900000)}`,
      phCaCl2: ph,
      phH2O: phH2o,
      phSmp: phSmp,
      organicMatterGdm3: mo,
      pMehlich1MgDm3: p,
      pMehlich3MgDm3: pMehlich3,
      pResinaMgDm3: pResina,
      pRemanescenteMgL: pRem,
      pRemanescente3MgL: pRem3,
      kCmolcDm3: k,
      caCmolcDm3: ca,
      mgCmolcDm3: mg,
      alCmolcDm3: al,
      hAlCmolcDm3: hAl,
      sSO4MgDm3: s,
      bMgDm3: b,
      cuMgDm3: cu,
      feMgDm3: fe,
      mnMgDm3: mn,
      znMgDm3: zn,
      siMgDm3: si,
      coMgDm3: co,
      niMgDm3: ni,
      seMgDm3: se,
      naCmolcDm3: na,
      clayPercent: clay,
      sandPercent: sand,
      siltPercent: silt,
      hasBioAS: Boolean(row.arilsulfatase_mg_pnp_kg_h || row.beta_glicosidase_mg_pnp_kg_h || row.fosfatase_acida_mg_pnp_kg_h || row.iqs_bio),
      arylsulfataseMgPnpKgH: row.arilsulfatase_mg_pnp_kg_h ? Number(String(row.arilsulfatase_mg_pnp_kg_h).replace(',', '.')) : undefined,
      betaGlucosidaseMgPnpKgH: row.beta_glicosidase_mg_pnp_kg_h ? Number(String(row.beta_glicosidase_mg_pnp_kg_h).replace(',', '.')) : undefined,
      acidPhosphataseMgPnpKgH: row.fosfatase_acida_mg_pnp_kg_h ? Number(String(row.fosfatase_acida_mg_pnp_kg_h).replace(',', '.')) : undefined,
      iqsBioScore: row.iqs_bio ? Number(String(row.iqs_bio).replace(',', '.')) : undefined,
      status: rowIssues.some(i => i.includes('zerados') || i.includes('fora da faixa') || i.includes('ausente'))
        ? 'invalid'
        : rowIssues.length > 0
        ? 'warning'
        : 'valid',
      validationErrors: rowIssues,
    };

    const completedSample = calculateSoilIndices(baseSample) as SoilSample;
    validSamples.push(completedSample);
  });

  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;

  return {
    isValid: errorCount === 0 && validSamples.length > 0,
    totalSamples: rawRows.length,
    validCount: validSamples.filter(s => s.status === 'valid').length,
    warningCount,
    errorCount,
    samples: validSamples,
    issues,
  };
}
