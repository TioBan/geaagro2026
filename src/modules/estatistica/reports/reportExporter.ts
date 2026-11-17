/**
 * Gerador de Relatórios Científicos e Exportador Offline — GeaAgro Estatística
 *
 * Exporta localmente (100% offline):
 * - PDF Científico formatado via jsPDF (com metadados, tabelas, interpretações determinísticas e gráficos PNG)
 * - XLSX Multi-abas (via SheetJS / xlsx)
 * - CSV e JSON auditável
 */

import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import {
  EstatisticaProjeto,
  EstatisticaExperimento,
  EstatisticaConjuntoDados,
  EstatisticaResultado,
} from '../types/estatistica';

export interface ReportSelectionOptions {
  projeto?: EstatisticaProjeto | null;
  experimento: EstatisticaExperimento;
  dataset?: EstatisticaConjuntoDados | null;
  resultadosSelecionados: EstatisticaResultado[];
  graficosImagens?: { titulo: string; pngDataUrl: string }[];
  observacoesAutor?: string;
}

function triggerBlobDownload(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export async function exportScientificReportPdf(options: ReportSelectionOptions): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  let y = 16;

  const ensureSpace = (neededMm: number) => {
    if (y + neededMm > pageH - 16) {
      doc.addPage();
      y = 16;
    }
  };

  // Cabeçalho institucional
  doc.setFillColor(5, 150, 105);
  doc.rect(0, 0, pageW, 24, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('GEAAGRO ESTATÍSTICA — RELATÓRIO TÉCNICO-CIENTÍFICO', 14, 11);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Emitido offline em ${new Date().toLocaleString('pt-BR')} • Processamento Local Determinístico (OPFS + WASM)`,
    14,
    18
  );

  y = 32;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Experimento: ${options.experimento.nome}`, 14, y);
  y += 6;

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  const metaLines = [
    `Projeto: ${options.projeto?.nome || 'Não vinculado'} (${options.projeto?.categoria || '-'})`,
    `Pesquisador / Responsável: ${options.projeto?.pesquisador || '-'} | Instituição: ${options.projeto?.instituicao || '-'}`,
    `Delineamento Experimental: ${options.experimento.delineamento} | Nível de Significância Padrão: α = ${(options.experimento.alphaPadrao * 100).toFixed(1)}%`,
    `Registros de Trabalho: ${options.dataset?.linhasWorking.length ?? 0} linhas × ${options.dataset?.colunas.length ?? 0} variáveis`,
  ];
  for (const line of metaLines) {
    doc.text(line, 14, y);
    y += 5;
  }

  if (options.observacoesAutor?.trim()) {
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.text('Notas do Pesquisador:', 14, y);
    y += 4.5;
    doc.setFont('helvetica', 'normal');
    const wrapped = doc.splitTextToSize(options.observacoesAutor.trim(), pageW - 28);
    doc.text(wrapped, 14, y);
    y += wrapped.length * 4.5 + 3;
  }

  // Blocos de resultados selecionados
  for (const res of options.resultadosSelecionados) {
    ensureSpace(26);
    y += 3;
    doc.setDrawColor(203, 213, 225);
    doc.line(14, y, pageW - 14, y);
    y += 6;

    doc.setFontSize(11.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 120, 87);
    doc.text(`${res.titulo} [${res.subtipo}]`, 14, y);
    y += 5.5;
    doc.setTextColor(15, 23, 42);

    // Renderizar tabela sintética quando for ANOVA, Descritiva ou Médias
    if (res.categoria === 'anova' && Array.isArray(res.dados?.tabela)) {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text('Fonte de Variação', 14, y);
      doc.text('GL', 92, y);
      doc.text('SQ', 108, y);
      doc.text('QM', 132, y);
      doc.text('F', 156, y);
      doc.text('p-valor', 176, y);
      y += 4.5;
      doc.setFont('helvetica', 'normal');
      for (const row of res.dados.tabela) {
        ensureSpace(6);
        doc.text(String(row.fonte).slice(0, 40), 14, y);
        doc.text(String(row.gl), 92, y);
        doc.text(Number(row.sq).toFixed(3), 108, y);
        doc.text(Number(row.qm).toFixed(3), 132, y);
        doc.text(row.fValor !== null ? Number(row.fValor).toFixed(3) : '-', 156, y);
        doc.text(
          row.pValor !== null ? `${Number(row.pValor).toFixed(4)} ${row.significancia}` : '-',
          176,
          y
        );
        y += 4.2;
      }
      y += 2;
    } else if (res.categoria === 'comparacao_medias' && Array.isArray(res.dados?.gruposOrdenados)) {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text('Tratamento / Grupo', 14, y);
      doc.text('n', 82, y);
      doc.text('Média', 98, y);
      doc.text('DP', 124, y);
      doc.text('Agrupamento (Letras)', 152, y);
      y += 4.5;
      doc.setFont('helvetica', 'normal');
      for (const g of res.dados.gruposOrdenados) {
        ensureSpace(6);
        doc.text(String(g.grupo).slice(0, 34), 14, y);
        doc.text(String(g.n), 82, y);
        doc.text(Number(g.media).toFixed(4), 98, y);
        doc.text(Number(g.dp).toFixed(4), 124, y);
        doc.text(String(g.letra), 152, y);
        y += 4.2;
      }
      y += 2;
    } else if (res.categoria === 'regressao' && res.dados?.equacaoTexto) {
      doc.setFontSize(9);
      doc.setFont('courier', 'bold');
      doc.text(res.dados.equacaoTexto, 14, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(
        `R² = ${(res.dados.rSquared * 100).toFixed(2)}% | R² aj. = ${(res.dados.adjRSquared * 100).toFixed(2)}% | AIC = ${res.dados.aic.toFixed(2)} | BIC = ${res.dados.bic.toFixed(2)}`,
        14,
        y
      );
      y += 5;
    }

    if (res.interpretacaoDeterministica?.length > 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Interpretação Estatística Determinística:', 14, y);
      y += 4.5;
      doc.setFont('helvetica', 'normal');
      for (const interp of res.interpretacaoDeterministica) {
        const lines = doc.splitTextToSize(`• ${interp}`, pageW - 28);
        ensureSpace(lines.length * 4.5 + 2);
        doc.text(lines, 14, y);
        y += lines.length * 4.2 + 1;
      }
    }
  }

  // Gráficos PNG embutidos
  if (options.graficosImagens && options.graficosImagens.length > 0) {
    for (const graf of options.graficosImagens) {
      ensureSpace(95);
      y += 4;
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.text(graf.titulo, 14, y);
      y += 4;
      try {
        doc.addImage(graf.pngDataUrl, 'PNG', 14, y, pageW - 28, 86);
        y += 90;
      } catch {}
    }
  }

  const safeName = options.experimento.nome.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  doc.save(`relatorio_estatistico_${safeName}.pdf`);
}

export function exportResultsToXlsx(options: ReportSelectionOptions): void {
  const wb = XLSX.utils.book_new();

  if (options.dataset?.linhasWorking?.length) {
    const wsData = XLSX.utils.json_to_sheet(options.dataset.linhasWorking);
    XLSX.utils.book_append_sheet(wb, wsData, 'Dados_Experimento');
  }

  options.resultadosSelecionados.forEach((res, idx) => {
    const sheetBase = `${idx + 1}_${res.categoria}`.slice(0, 28);
    if (res.categoria === 'anova' && Array.isArray(res.dados?.tabela)) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(res.dados.tabela), sheetBase);
    } else if (res.categoria === 'comparacao_medias' && Array.isArray(res.dados?.gruposOrdenados)) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(res.dados.gruposOrdenados), sheetBase);
    } else if (res.categoria === 'descritiva' && res.dados?.geral) {
      const list = [res.dados.geral, ...(res.dados.grupos || [])];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(list), sheetBase);
    } else if (res.categoria === 'regressao' && Array.isArray(res.dados?.coeficientes)) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(res.dados.coeficientes), sheetBase);
    } else {
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(
          (res.interpretacaoDeterministica || []).map((txt, i) => ({ Passo: i + 1, Conclusao: txt }))
        ),
        sheetBase
      );
    }
  });

  const safeName = options.experimento.nome.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  triggerBlobDownload(
    `geaagro_estatistica_${safeName}.xlsx`,
    new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  );
}

export function exportDatasetToCsv(dataset: EstatisticaConjuntoDados, nomeExperimento: string): void {
  const header = dataset.colunas.join(';');
  const lines = dataset.linhasWorking.map((row) =>
    dataset.colunas
      .map((col) => {
        const val = row[col];
        if (val === null || val === undefined) return '';
        const str = String(val);
        return str.includes(';') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
      })
      .join(';')
  );
  const csv = '\uFEFF' + [header, ...lines].join('\n');
  const safeName = nomeExperimento.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  triggerBlobDownload(
    `dados_${safeName}.csv`,
    new Blob([csv], { type: 'text/csv;charset=utf-8' })
  );
}

export function exportProjectReportJson(options: ReportSelectionOptions): void {
  const payload = {
    sistema: 'GeaAgro Estatística',
    exportadoEm: new Date().toISOString(),
    projeto: options.projeto,
    experimento: options.experimento,
    conjuntoDadosMetadados: options.dataset
      ? {
          formato: options.dataset.formato,
          colunas: options.dataset.colunas,
          totalLinhas: options.dataset.linhasWorking.length,
          rawArtifactKey: options.dataset.rawArtifactKey,
          rawChecksum: options.dataset.rawChecksum,
          workingChecksum: options.dataset.workingChecksum,
        }
      : null,
    resultados: options.resultadosSelecionados,
  };
  const safeName = options.experimento.nome.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  triggerBlobDownload(
    `auditoria_estatistica_${safeName}.json`,
    new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  );
}
