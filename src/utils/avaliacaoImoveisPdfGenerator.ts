import { jsPDF } from 'jspdf';
import {
  PropriedadeRuralAvaliacao,
  SolicitanteAvaliacao,
  BenfeitoriaItem,
  ImovelComparativoMercado,
  VistoriaTecnica,
  AvaliacaoCompletaImovel
} from '../types/avaliacaoImoveis';

export interface OpcoesGeracaoLaudoPdf {
  propriedade: PropriedadeRuralAvaliacao;
  solicitante: SolicitanteAvaliacao;
  benfeitorias: BenfeitoriaItem[];
  comparativos: ImovelComparativoMercado[];
  vistoria: VistoriaTecnica;
  avaliacao: AvaliacaoCompletaImovel;
}

export function gerarLaudoAvaliacaoPdf(dados: OpcoesGeracaoLaudoPdf): jsPDF {
  const { propriedade, solicitante, benfeitorias, comparativos, vistoria, avaliacao } = dados;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  let y = margin;

  // Helper para desenhar cabeçalho padrão
  const drawHeader = (tituloSecao: string, pageNum: number, totalPages: number) => {
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 18, 'F');

    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(0, 18, pageWidth, 1.2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('GEAAGRO • PLATAFORMA DE ENGENHARIA DE AVALIAÇÕES', margin, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text('NBR 14653-3:2019', pageWidth - margin - 25, 11);

    // Rodapé
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Laudo nº ${avaliacao.codigoLaudo} • ${propriedade.nome}`, margin, pageHeight - 7);
    doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - margin - 20, pageHeight - 7);

    // Subtítulo da seção na página
    if (tituloSecao) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(tituloSecao.toUpperCase(), margin, 27);

      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(0.5);
      doc.line(margin, 29, margin + 40, 29);
    }
  };

  // ==========================================
  // PÁGINA 1: CAPA & SUMÁRIO EXECUTIVO
  // ==========================================
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Faixa decorativa verde GeaAgro
  doc.setFillColor(16, 185, 129);
  doc.rect(margin, 35, 6, 45, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(16, 185, 129);
  doc.text('GEAAGRO ENGENHARIA & AVALIAÇÕES AGRONÔMICAS', margin + 12, 42);

  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('LAUDO TÉCNICO DE AVALIAÇÃO', margin + 12, 54);
  doc.text('MERCADOLÓGICA DE IMÓVEL RURAL', margin + 12, 64);

  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text('Avaliação Patrimonial Conforme Diretrizes da Norma ABNT NBR 14653-3:2019', margin + 12, 74);

  // Card do Imóvel em destaque
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(margin, 95, contentWidth, 75, 3, 3, 'F');
  doc.setDrawColor(51, 65, 85);
  doc.roundedRect(margin, 95, contentWidth, 75, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(248, 250, 252);
  doc.text(propriedade.nome, margin + 8, 107);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);

  const leftX = margin + 8;
  const colW = (contentWidth - 16) / 2;
  const rightX = leftX + colW;

  doc.text(`Município / UF: ${propriedade.municipio} - ${propriedade.estado}`, leftX, 118);
  doc.text(`Área Total: ${propriedade.areaTotalHa.toLocaleString('pt-BR')} hectares`, leftX, 126);
  doc.text(`Matrícula nº: ${propriedade.numeroMatricula}`, leftX, 134);
  doc.text(`CAR: ${propriedade.numeroCar || 'Não informado'}`, leftX, 142);
  doc.text(`CCIR: ${propriedade.numeroCcir || 'Não informado'}`, leftX, 150);
  doc.text(`ITR / NIRF: ${propriedade.numeroItr || 'Não informado'}`, leftX, 158);

  doc.text(`Proprietário: ${propriedade.proprietarioNome}`, rightX, 118);
  doc.text(`CPF/CNPJ: ${propriedade.proprietarioCpfCnpj}`, rightX, 126);
  doc.text(`Finalidade: ${solicitante.finalidade.toUpperCase().replace('_', ' ')}`, rightX, 134);
  doc.text(`Data Referência: ${solicitante.dataReferencia}`, rightX, 142);
  doc.text(`Método: Comparativo Direto + Ross-Heidecke`, rightX, 150);
  doc.text(`Enquadramento: ${avaliacao.grauFundamentacao} / ${avaliacao.grauPrecisao}`, rightX, 158);

  // Valor Final em Destaque
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(margin, 180, contentWidth, 42, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('VALOR DE MERCADO TOTAL CONCLUÍDO (R$)', margin + 10, 192);

  doc.setFontSize(22);
  const valorFormatado = avaliacao.valorFinalImovelR$.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  doc.text(`R$ ${valorFormatado}`, margin + 10, 204);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(240, 253, 250);
  const valorHaFormatado = (propriedade.areaTotalHa > 0
    ? avaliacao.valorFinalImovelR$ / propriedade.areaTotalHa
    : 0
  ).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  doc.text(
    `Valor Médio Global: R$ ${valorHaFormatado}/ha • Intervalo Admissível (±15%): R$ ${avaliacao.intervaloAdmissivelMinR$.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} a R$ ${avaliacao.intervaloAdmissivelMaxR$.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
    margin + 10,
    214
  );

  // Rodapé da capa com RT
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(241, 245, 249);
  doc.text(`Responsável Técnico: ${solicitante.profissionalResponsavel}`, margin, 245);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Registro Profissional: ${solicitante.creaNumero} • ART nº ${solicitante.artNumero}`, margin, 252);
  doc.text(`Emissão: ${avaliacao.dataAvaliacao} • Código Laudo: ${avaliacao.codigoLaudo}`, margin, 259);

  // ==========================================
  // PÁGINA 2: CARACTERIZAÇÃO TERRITORIAL & VISTORIA
  // ==========================================
  doc.addPage();
  drawHeader('1. Caracterização Territorial & Vistoria Técnica', 2, 4);

  y = 36;

  // Box Territorial
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 54, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 54, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Distribuição do Uso e Ocupação do Solo (Hectares)', margin + 6, y + 8);

  const t = propriedade.territorial;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const tCol1 = margin + 6;
  const tCol2 = margin + 65;
  const tCol3 = margin + 125;

  doc.text(`• Área Total: ${t.areaTotalHa.toLocaleString('pt-BR')} ha (100%)`, tCol1, y + 17);
  doc.text(`• Área Agricultável: ${t.areaAgricultavelHa.toLocaleString('pt-BR')} ha`, tCol1, y + 25);
  doc.text(`• Lavouras Consolidadas: ${t.areaLavourasHa.toLocaleString('pt-BR')} ha`, tCol1, y + 33);
  doc.text(`• Irrigada (Pivot): ${t.areaIrrigadaHa.toLocaleString('pt-BR')} ha`, tCol1, y + 41);

  doc.text(`• Pastagens: ${t.areaPastagensHa.toLocaleString('pt-BR')} ha`, tCol2, y + 17);
  doc.text(`• Reserva Legal: ${t.areaReservaLegalHa.toLocaleString('pt-BR')} ha`, tCol2, y + 25);
  doc.text(`• APP Preservada: ${t.areaAppHa.toLocaleString('pt-BR')} ha`, tCol2, y + 33);
  doc.text(`• Veg. Nativa Total: ${t.areaVegetacaoNativaHa.toLocaleString('pt-BR')} ha`, tCol2, y + 41);

  doc.text(`• Infraestrutura/Sede: ${t.areaInfraestruturaHa.toLocaleString('pt-BR')} ha`, tCol3, y + 17);
  doc.text(`• Relevo: ${propriedade.solosTopografia.relevo}`, tCol3, y + 25);
  doc.text(`• Textura: ${propriedade.solosTopografia.textura}`, tCol3, y + 33);
  doc.text(`• Mecanização: ${propriedade.solosTopografia.mecanizacaoAptidao}`, tCol3, y + 41);

  y += 62;

  // Box Aptidão e Solos
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Diagnóstico Pedológico e Aptidão Agrícola (Embrapa)', margin, y);

  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Solo Predominante: ${propriedade.solosTopografia.classeSolo}. Profundidade: ${propriedade.solosTopografia.profundidadeEfetiva}.`,
    margin,
    y + 4
  );
  doc.text(
    `Capacidade de Uso: ${propriedade.aptidao.classeCapacidadeUso} • Aptidão Embrapa: ${propriedade.aptidao.aptidaoAgricolaEmbrapa}.`,
    margin,
    y + 10
  );
  doc.text(
    `Culturas Históricas: ${propriedade.aptidao.culturasExploradas.join(', ')} • Potencial Irrigação: ${propriedade.aptidao.potencialIrrigacao}.`,
    margin,
    y + 16
  );

  y += 26;

  // Vistoria e Checklist
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Constatações Periciais da Vistoria Técnica', margin, y);

  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Vistoria realizada em ${vistoria.dataVistoria} (${vistoria.horaVistoria}) pelo perito ${vistoria.vistoriadorNome} (${vistoria.vistoriadorCrea}).`,
    margin,
    y + 4
  );
  doc.text(`Condições climáticas: ${vistoria.condicoesClimaticas}`, margin, y + 10);

  y += 18;

  // Tabela simplificada de itens de checklist
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('ITEM VISTORIADO', margin + 4, y + 5);
  doc.text('STATUS', margin + 90, y + 5);
  doc.text('OBSERVAÇÃO TÉCNICA', margin + 115, y + 5);

  y += 7;
  vistoria.checklist.slice(0, 5).forEach((item, idx) => {
    const bg = idx % 2 === 0 ? 255 : 250;
    doc.setFillColor(bg, bg, bg);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(item.item.slice(0, 50), margin + 4, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(item.status === 'conforme' ? 16 : 220, item.status === 'conforme' ? 149 : 38, item.status === 'conforme' ? 106 : 38);
    doc.text(item.status.toUpperCase(), margin + 90, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(item.observacao.slice(0, 50), margin + 115, y + 5.5);
    y += 8;
  });

  // ==========================================
  // PÁGINA 3: BENFEITORIAS (ROSS-HEIDECKE) & MERCADO
  // ==========================================
  doc.addPage();
  drawHeader('4. Benfeitorias Reprodutivas & Tratamento de Mercado', 3, 4);

  y = 36;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Inventário de Benfeitorias e Depreciação Ross-Heidecke', margin, y);

  y += 5;
  // Tabela de Benfeitorias
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('BENFEITORIA', margin + 3, y + 5);
  doc.text('ESTADO (R-H)', margin + 65, y + 5);
  doc.text('IDADE / VIDA', margin + 95, y + 5);
  doc.text('NOVO (R$)', margin + 125, y + 5);
  doc.text('DEPRECIADO (R$)', margin + 155, y + 5);

  y += 7;
  let totalBenf = 0;
  benfeitorias.forEach((b, idx) => {
    const bg = idx % 2 === 0 ? 255 : 250;
    doc.setFillColor(bg, bg, bg);
    doc.rect(margin, y, contentWidth, 7.5, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(51, 65, 85);
    doc.text(b.nome.slice(0, 36), margin + 3, y + 5);
    doc.text(`Cat. ${b.estadoConservacao}`, margin + 65, y + 5);
    doc.text(`${b.idadeAparenteAnos} / ${b.vidaUtilAnos} anos`, margin + 95, y + 5);
    doc.text(`${b.custoReproducaoNovoTotalR$.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, margin + 125, y + 5);
    doc.text(`${b.valorDepreciadoFinalR$.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, margin + 155, y + 5);
    totalBenf += b.valorDepreciadoFinalR$;
    y += 7.5;
  });

  // Total Benfeitorias
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('VALOR TOTAL DAS BENFEITORIAS DEPRECIADAS:', margin + 3, y + 5.5);
  doc.text(`R$ ${totalBenf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin + 145, y + 5.5);

  y += 18;

  // Comparativos de Mercado
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('5. Amostras de Mercado e Homogeneização de Dados', margin, y);

  y += 5;
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(30, 41, 59);
  doc.text('AMOSTRA', margin + 3, y + 5);
  doc.text('ÁREA (HA)', margin + 55, y + 5);
  doc.text('UNITÁRIO INF. (R$/HA)', margin + 78, y + 5);
  doc.text('F. HOMOG.', margin + 120, y + 5);
  doc.text('HOMOGENEIZADO (R$/HA)', margin + 145, y + 5);

  y += 7;
  const comparativosValidos = comparativos.filter((c) => c.statusInclusao === 'incluido');
  comparativosValidos.slice(0, 6).forEach((c, idx) => {
    const bg = idx % 2 === 0 ? 255 : 250;
    doc.setFillColor(bg, bg, bg);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(51, 65, 85);
    doc.text(c.identificacao.slice(0, 30), margin + 3, y + 5);
    doc.text(`${c.areaTotalHa.toLocaleString('pt-BR')} ha`, margin + 55, y + 5);
    doc.text(`R$ ${c.precoPorHectareR$.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, margin + 78, y + 5);
    doc.text(`${c.fatores?.fatorTotal ? c.fatores.fatorTotal.toFixed(3) : '1.000'}`, margin + 120, y + 5);
    const vHomog = c.fatores?.valorHomogeneizadoPorHaR$ || c.precoPorHectareR$;
    doc.text(`R$ ${vHomog.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, margin + 145, y + 5);
    y += 7;
  });

  // ==========================================
  // PÁGINA 4: RESULTADO FINAL & ENCERRAMENTO
  // ==========================================
  doc.addPage();
  drawHeader('6. Determinação Final do Valor & Conclusão Técnica', 4, 4);

  y = 36;

  // Box Estatística
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 48, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 48, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Tratamento Estatístico dos Dados de Mercado (NBR 14653-3)', margin + 6, y + 8);

  const est = avaliacao.estatistica;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  const eCol1 = margin + 6;
  const eCol2 = margin + 65;
  const eCol3 = margin + 125;

  if (est) {
    doc.text(`• Amostras Válidas: ${est.quantidadeAmostras}`, eCol1, y + 17);
    doc.text(`• Média Homogeneizada: R$ ${est.mediaR$PorHa.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/ha`, eCol1, y + 25);
    doc.text(`• Mediana: R$ ${est.medianaR$PorHa.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/ha`, eCol1, y + 33);
    doc.text(`• Desvio Padrão: R$ ${est.desvioPadraoR$PorHa.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, eCol1, y + 41);

    doc.text(`• Coeficiente de Variação (CV): ${est.coeficienteVariacaoPct.toFixed(2)}%`, eCol2, y + 17);
    doc.text(`• Mínimo Homogeneizado: R$ ${est.minimoR$PorHa.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, eCol2, y + 25);
    doc.text(`• Máximo Homogeneizado: R$ ${est.maximoR$PorHa.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, eCol2, y + 33);
    doc.text(`• Amplitude: R$ ${est.amplitudeR$PorHa.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, eCol2, y + 41);

    doc.text(`• Grau de Fundamentação: ${est.grauFundamentacaoApurado}`, eCol3, y + 17);
    doc.text(`• Grau de Precisão: ${est.grauPrecisaoApurado}`, eCol3, y + 25);
    doc.text(`• Int. Confiança 80%: R$ ${est.intervaloConfianca80Min.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, eCol3, y + 33);
    doc.text(`  até R$ ${est.intervaloConfianca80Max.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/ha`, eCol3, y + 41);
  }

  y += 56;

  // Box Resumo Final de Valores
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, contentWidth, 54, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(16, 185, 129);
  doc.text('COMPOSIÇÃO ANALÍTICA DO VALOR TOTAL', margin + 8, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(241, 245, 249);

  const vTerraNua = avaliacao.valorTotalHomogeneizadoR$;
  doc.text(`• Valor da Terra Nua (VTN) [${propriedade.areaTotalHa} ha × Preço Médio]:`, margin + 8, y + 20);
  doc.text(`R$ ${vTerraNua.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin + 125, y + 20);

  doc.text(`• Valor Reprodutivo das Benfeitorias Depreciadas:`, margin + 8, y + 28);
  doc.text(`R$ ${avaliacao.valorTotalBenfeitoriasR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin + 125, y + 28);

  doc.setDrawColor(51, 65, 85);
  doc.line(margin + 8, y + 33, margin + contentWidth - 8, y + 33);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(16, 185, 129);
  doc.text(`VALOR TOTAL CONCLUÍDO DO IMÓVEL:`, margin + 8, y + 42);
  doc.text(`R$ ${avaliacao.valorFinalImovelR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin + 125, y + 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Campo de Arbítrio / Intervalo Admissível (±15%): R$ ${avaliacao.intervaloAdmissivelMinR$.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} a R$ ${avaliacao.intervaloAdmissivelMaxR$.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
    margin + 8,
    y + 49
  );

  y += 64;

  // Conclusão e Assinatura
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('7. Conclusão do Laudo e Encerramento', margin, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    doc.splitTextToSize(
      `${avaliacao.conclusaoLaudo} O presente trabalho foi estruturado estritamente segundo os preceitos da boa técnica agronômica e engenharia de avaliações, nada tendo sido omitido ou acrescido com o propósito de favorecer ou prejudicar quaisquer partes interessadas.`,
      contentWidth
    ),
    margin,
    y
  );

  y += 28;

  // Campo de Assinatura
  doc.setDrawColor(100, 116, 139);
  doc.line(pageWidth / 2 - 40, y + 10, pageWidth / 2 + 40, y + 10);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(solicitante.profissionalResponsavel, pageWidth / 2, y + 15, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`${solicitante.creaNumero} • ART ${solicitante.artNumero}`, pageWidth / 2, y + 20, { align: 'center' });
  doc.text(`GeaAgro Rural Intelligence Engine • Versão 4.2.3.8`, pageWidth / 2, y + 25, { align: 'center' });

  return doc;
}
