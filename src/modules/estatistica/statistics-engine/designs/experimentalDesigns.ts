/**
 * Validação de Compatibilidade de Delineamentos Experimentais — GeaAgro Estatística
 *
 * Verifica se a estrutura dos dados atende estritamente às exigências matemáticas
 * do delineamento escolhido antes de permitir qualquer análise inferencial.
 * Regra obrigatória: nunca executar análises incompatíveis ou simplificar um modelo sem alertar.
 */

import {
  DelineamentoMapeamento,
  TipoDelineamento,
  CelulaValor,
} from '../../types/estatistica';

export interface DesignMetadata {
  id: TipoDelineamento;
  nome: string;
  sigla: string;
  formulaModelo: string;
  descricao: string;
  camposObrigatorios: (keyof DelineamentoMapeamento)[];
  exigeParcelaSubdividida?: boolean;
}

export const EXPERIMENTAL_DESIGNS_CATALOG: Record<TipoDelineamento, DesignMetadata> = {
  DIC: {
    id: 'DIC',
    nome: 'Delineamento Inteiramente Casualizado',
    sigla: 'DIC (CRD)',
    formulaModelo: 'Y_ij = μ + τ_i + ε_ij',
    descricao: 'Unidades experimentais homogêneas com alocação totalmente aleatória dos tratamentos.',
    camposObrigatorios: ['tratamentoCol'],
  },
  DBC: {
    id: 'DBC',
    nome: 'Delineamento em Blocos Casualizados',
    sigla: 'DBC (RCBD)',
    formulaModelo: 'Y_ij = μ + τ_i + β_j + ε_ij',
    descricao: 'Controle local em uma direção (blocos homogêneos) com todos os tratamentos casualizados em cada bloco.',
    camposObrigatorios: ['tratamentoCol', 'blocoCol'],
  },
  DQL: {
    id: 'DQL',
    nome: 'Delineamento em Quadrado Latino',
    sigla: 'DQL (LSD)',
    formulaModelo: 'Y_ijk = μ + α_i + γ_j + τ_k + ε_ijk',
    descricao: 'Duplo controle local (linhas e colunas), exigindo nº linhas = nº colunas = nº tratamentos.',
    camposObrigatorios: ['tratamentoCol', 'linhaCol', 'colunaCol'],
  },
  FATORIAL: {
    id: 'FATORIAL',
    nome: 'Experimento Fatorial (≥ 2 Fatores)',
    sigla: 'Fatorial',
    formulaModelo: 'Y_ijk = μ + α_i + β_j + (αβ)_ij + [bloco] + ε_ijk',
    descricao: 'Avalia efeitos principais e interações de dois ou mais fatores simultaneamente (em DIC ou DBC).',
    camposObrigatorios: ['fatoresCols'],
  },
  PARCELA_SUBDIVIDIDA: {
    id: 'PARCELA_SUBDIVIDIDA',
    nome: 'Parcelas Subdivididas (Split-Plot)',
    sigla: 'Split-Plot',
    formulaModelo: 'Y_ijk = μ + β_k + α_i + δ_ik [Erro A] + γ_j + (αγ)_ij + ε_ijk [Erro B]',
    descricao: 'Dois fatores em escalas experimentais distintas: Fator A na parcela (Erro A) e Fator B na subparcela (Erro B).',
    camposObrigatorios: ['parcelaCol', 'subparcelaCol', 'blocoCol'],
    exigeParcelaSubdividida: true,
  },
  PARCELA_SUBDIVIDIDA_TEMPO: {
    id: 'PARCELA_SUBDIVIDIDA_TEMPO',
    nome: 'Parcelas Subdivididas no Tempo',
    sigla: 'Split-Plot Tempo',
    formulaModelo: 'Y_ijk = μ + β_k + α_i + δ_ik [Erro A] + T_j + (αT)_ij + ε_ijk [Erro B]',
    descricao: 'Fator principal na parcela avaliado repetidamente em diferentes épocas/tempos na mesma parcela.',
    camposObrigatorios: ['parcelaCol', 'tempoCol', 'blocoCol'],
    exigeParcelaSubdividida: true,
  },
  FAIXAS: {
    id: 'FAIXAS',
    nome: 'Experimento em Faixas (Strip-Plot)',
    sigla: 'Faixas',
    formulaModelo: 'Y_ijk = μ + β_k + α_i + e_ik [Erro A] + γ_j + e_jk [Erro B] + (αγ)_ij + ε_ijk [Erro C]',
    descricao: 'Fatores aplicados em faixas perpendiculares dentro de cada bloco, gerando três erros experimentais.',
    camposObrigatorios: ['parcelaCol', 'subparcelaCol', 'blocoCol'],
    exigeParcelaSubdividida: true,
  },
  MEDIDAS_REPETIDAS: {
    id: 'MEDIDAS_REPETIDAS',
    nome: 'Medidas Repetidas (com Correção de Esfericidade)',
    sigla: 'Medidas Repetidas',
    formulaModelo: 'Y_ijt = μ + α_i + s_j(i) + T_t + (αT)_it + ε_ijt',
    descricao: 'Múltiplas medições longitudinais no mesmo indivíduo/parcela, com correções Greenhouse-Geisser e Huynh-Feldt.',
    camposObrigatorios: ['unidadeCol', 'tempoCol'],
  },
  MODELO_MISTO: {
    id: 'MODELO_MISTO',
    nome: 'Modelo Misto Linear (Efeitos Fixos + Aleatório)',
    sigla: 'Modelo Misto',
    formulaModelo: 'Y = Xβ + Zu + ε',
    descricao: 'Modula fatores fixos combinados com fator aleatório de agrupamento/bloco/sujeito via decomposição de estratos.',
    camposObrigatorios: ['tratamentoCol', 'efeitoAleatorioCol'],
  },
  ANINHADO: {
    id: 'ANINHADO',
    nome: 'Delineamento Hierárquico / Aninhado',
    sigla: 'Aninhado (Nested)',
    formulaModelo: 'Y_ijk = μ + α_i + β_j(i) + ε_ijk',
    descricao: 'Níveis de um subfator B ocorrem exclusivamente dentro de níveis específicos do fator superior A.',
    camposObrigatorios: ['fatorPaiCol', 'fatorAninhadoCol'],
  },
};

export function parseNumericCell(val: CelulaValor): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return Number.isFinite(val) ? val : null;
  const trimmed = String(val).trim();
  if (!trimmed || trimmed.toUpperCase() === 'N/A' || trimmed.toUpperCase() === 'NA') return null;
  const num = Number(trimmed.replace(',', '.'));
  return Number.isFinite(num) ? num : null;
}

export function validateDesignCompatibility(
  delineamento: TipoDelineamento,
  mapeamento: DelineamentoMapeamento,
  rows: Record<string, CelulaValor>[],
  responseCol?: string
): { compativel: boolean; motivos: string[]; avisos: string[]; validRowsCount: number } {
  const motivos: string[] = [];
  const avisos: string[] = [];

  const respCol = responseCol || mapeamento.respostaCols?.[0];
  if (!respCol) {
    motivos.push('Nenhuma variável resposta numérica selecionada.');
    return { compativel: false, motivos, avisos, validRowsCount: 0 };
  }

  const validRows = rows.filter((r) => parseNumericCell(r[respCol]) !== null);
  if (validRows.length < 3) {
    motivos.push(`São necessárias pelo menos 3 observações válidas para "${respCol}" (encontradas: ${validRows.length}).`);
    return { compativel: false, motivos, avisos, validRowsCount: validRows.length };
  }

  const distinct = (col?: string): string[] => {
    if (!col) return [];
    const set = new Set<string>();
    for (const r of validRows) {
      const v = r[col];
      if (v !== null && v !== undefined && String(v).trim() !== '') {
        set.add(String(v).trim());
      }
    }
    return Array.from(set);
  };

  if (delineamento === 'DIC') {
    if (!mapeamento.tratamentoCol) motivos.push('DIC exige a coluna de Tratamento.');
    else {
      const tLevels = distinct(mapeamento.tratamentoCol);
      if (tLevels.length < 2) motivos.push('DIC exige pelo menos 2 tratamentos distintos.');
      if (validRows.length - tLevels.length < 1) {
        motivos.push('Graus de liberdade do resíduo insuficientes (é necessário ter repetições).');
      }
    }
  } else if (delineamento === 'DBC') {
    if (!mapeamento.tratamentoCol) motivos.push('DBC exige a coluna de Tratamento.');
    if (!mapeamento.blocoCol) motivos.push('DBC exige a coluna de Bloco.');
    if (mapeamento.tratamentoCol && mapeamento.blocoCol) {
      const tLevels = distinct(mapeamento.tratamentoCol);
      const bLevels = distinct(mapeamento.blocoCol);
      if (tLevels.length < 2) motivos.push('DBC exige pelo menos 2 tratamentos.');
      if (bLevels.length < 2) motivos.push('DBC exige pelo menos 2 blocos.');
      const dfErr = validRows.length - 1 - (tLevels.length - 1) - (bLevels.length - 1);
      if (dfErr < 1) motivos.push('Graus de liberdade do resíduo inválidos (< 1) para DBC.');
      if (validRows.length < tLevels.length * bLevels.length) {
        avisos.push(
          `Experimento desbalanceado (${validRows.length}/${tLevels.length * bLevels.length} parcelas). Será usada ANOVA Tipo III via Modelo Linear Geral (GLM).`
        );
      }
    }
  } else if (delineamento === 'DQL') {
    if (!mapeamento.tratamentoCol || !mapeamento.linhaCol || !mapeamento.colunaCol) {
      motivos.push('DQL exige colunas de Tratamento, Linha e Coluna.');
    } else {
      const t = distinct(mapeamento.tratamentoCol);
      const l = distinct(mapeamento.linhaCol);
      const c = distinct(mapeamento.colunaCol);
      if (t.length < 3) motivos.push('DQL exige ordem mínima 3×3 (≥ 3 tratamentos, linhas e colunas) para haver resíduo.');
      if (l.length !== c.length || l.length !== t.length) {
        motivos.push(
          `No Quadrado Latino, o nº de Linhas (${l.length}), Colunas (${c.length}) e Tratamentos (${t.length}) deve ser estritamente igual.`
        );
      }
      // Verificar unicidade de tratamento por linha e por coluna
      const rowPairs = new Set<string>();
      const colPairs = new Set<string>();
      for (const r of validRows) {
        const lv = String(r[mapeamento.linhaCol!] ?? '').trim();
        const cv = String(r[mapeamento.colunaCol!] ?? '').trim();
        const tv = String(r[mapeamento.tratamentoCol!] ?? '').trim();
        if (rowPairs.has(`${lv}::${tv}`) || colPairs.has(`${cv}::${tv}`)) {
          motivos.push('Violação de Quadrado Latino: há tratamento repetido na mesma linha ou na mesma coluna.');
          break;
        }
        rowPairs.add(`${lv}::${tv}`);
        colPairs.add(`${cv}::${tv}`);
      }
    }
  } else if (delineamento === 'FATORIAL') {
    const fatores = mapeamento.fatoresCols || [];
    if (fatores.length < 2) {
      motivos.push('Experimento Fatorial exige pelo menos 2 fatores selecionados.');
    } else {
      for (const f of fatores) {
        if (distinct(f).length < 2) motivos.push(`O fator "${f}" deve ter pelo menos 2 níveis distintos.`);
      }
    }
  } else if (
    delineamento === 'PARCELA_SUBDIVIDIDA' ||
    delineamento === 'PARCELA_SUBDIVIDIDA_TEMPO' ||
    delineamento === 'FAIXAS'
  ) {
    const fA = mapeamento.parcelaCol;
    const fB = delineamento === 'PARCELA_SUBDIVIDIDA_TEMPO' ? mapeamento.tempoCol : mapeamento.subparcelaCol;
    const bloco = mapeamento.blocoCol;
    if (!fA || !fB || !bloco) {
      motivos.push('Exige Bloco, Fator da Parcela (A) e Fator da Subparcela/Tempo (B).');
    } else {
      if (distinct(fA).length < 2) motivos.push(`Fator A ("${fA}") precisa ter ≥ 2 níveis.`);
      if (distinct(fB).length < 2) motivos.push(`Fator B ("${fB}") precisa ter ≥ 2 níveis.`);
      if (distinct(bloco).length < 2) motivos.push(`Bloco ("${bloco}") precisa ter ≥ 2 blocos para estimar o Erro (a).`);
    }
  } else if (delineamento === 'MEDIDAS_REPETIDAS') {
    if (!mapeamento.unidadeCol || !mapeamento.tempoCol) {
      motivos.push('Medidas Repetidas exige identificação da Unidade Experimental/Indivíduo e do Fator Tempo/Repetição.');
    } else {
      if (distinct(mapeamento.unidadeCol).length < 3) motivos.push('São necessárias ao menos 3 unidades experimentais.');
      if (distinct(mapeamento.tempoCol).length < 2) motivos.push('São necessários ao menos 2 instantes de tempo.');
    }
  } else if (delineamento === 'MODELO_MISTO') {
    if (!mapeamento.tratamentoCol || !mapeamento.efeitoAleatorioCol) {
      motivos.push('Modelo Misto exige pelo menos um fator Fixo e um fator de Efeito Aleatório.');
    } else {
      if (distinct(mapeamento.tratamentoCol).length < 2) motivos.push('Fator fixo precisa de ≥ 2 níveis.');
      if (distinct(mapeamento.efeitoAleatorioCol).length < 2) motivos.push('Fator aleatório precisa de ≥ 2 níveis.');
    }
  } else if (delineamento === 'ANINHADO') {
    if (!mapeamento.fatorPaiCol || !mapeamento.fatorAninhadoCol) {
      motivos.push('Delineamento Aninhado exige Fator Superior (A) e Fator Aninhado B(A).');
    } else {
      if (distinct(mapeamento.fatorPaiCol).length < 2) motivos.push('Fator superior (A) precisa de ≥ 2 níveis.');
      if (distinct(mapeamento.fatorAninhadoCol).length < 3) motivos.push('Fator aninhado B(A) precisa de múltiplos subníveis.');
    }
  }

  return {
    compativel: motivos.length === 0,
    motivos,
    avisos,
    validRowsCount: validRows.length,
  };
}
