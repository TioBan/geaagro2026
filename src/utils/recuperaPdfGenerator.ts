/**
 * GeaAgro Recupera - Gerador de Relatórios e Laudos Técnicos em PDF
 * Suporte a 13 tipos de relatórios técnicos agronômicos de recuperação de áreas degradadas (RAD / PRAD).
 */

import { jsPDF } from 'jspdf';
import {
  PropriedadeRecupera,
  AreaDegradadaItem,
  DiagnosticoTecnicoCompleto,
  AnaliseSoloItem,
  ProjetoRecuperacao,
  OperacaoRecuperacao,
  MonitoramentoVisita,
  ItemCustoRecuperacao,
  AtividadeCronograma,
  TipoRelatorioPdf
} from '../types/recupera';

export interface OpcoesRelatorioPdfRecupera {
  tipo: TipoRelatorioPdf;
  propriedade: PropriedadeRecupera;
  area: AreaDegradadaItem;
  diagnostico?: DiagnosticoTecnicoCompleto;
  analiseSolo?: AnaliseSoloItem;
  projeto?: ProjetoRecuperacao;
  monitoramentos?: MonitoramentoVisita[];
  custos?: ItemCustoRecuperacao[];
  cronogramas?: AtividadeCronograma[];
  observacoesAdicionais?: string;
}

export function gerarRelatorioPdfRecupera(dados: OpcoesRelatorioPdfRecupera): jsPDF {
  const {
    tipo,
    propriedade,
    area,
    diagnostico,
    projeto,
    observacoesAdicionais
  } = dados;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const titulosPorTipo: Record<TipoRelatorioPdf, { titulo: string; subtitulo: string; norma: string }> = {
    diagnostico_inicial: {
      titulo: 'LAUDO DE DIAGNÓSTICO TÉCNICO INICIAL DE DEGRADAÇÃO',
      subtitulo: 'Caracterização Física, Química, Biológica e Ambiental do Solo',
      norma: 'Metodologia GeaAgro RAD / Embrapa Solos'
    },
    analise_solo_fertilidade: {
      titulo: 'BOLETIM DE INTERPRETAÇÃO DE ANÁLISE DE SOLO & FERTILIDADE',
      subtitulo: 'Balanço Nutricional, Saturação por Bases e Diagnóstico do Subsolo',
      norma: 'Boletim 100 IAC / 5ª Aproximação SBCS'
    },
    projeto_tecnico_completo: {
      titulo: 'PROJETO TÉCNICO DE RECUPERAÇÃO DE ÁREAS DEGRADADAS (PRAD)',
      subtitulo: 'Planejamento Agronômico, Cronograma Físico-Financeiro e Estratégia',
      norma: 'Instrução Normativa IBAMA / Resolução CONAMA'
    },
    plano_recuperacao_pastagens: {
      titulo: 'PLANO AGRONÔMICO DE RECUPERAÇÃO E MANEJO DE PASTAGENS',
      subtitulo: 'Correção do Solo, Escolha Forrageira, Reforma vs Renovação e Lotação',
      norma: 'Recomendações Técnicas Embrapa Gado de Corte'
    },
    plano_conservacao_solo: {
      titulo: 'PROJETO DE CONSERVAÇÃO DO SOLO E CONTROLE DE EROSÃO',
      subtitulo: 'Dimensionamento de Curvas de Nível, Terraceamento e Bacias de Contenção',
      norma: 'Manual de Conservação do Solo / Fórmula de Bentley'
    },
    projeto_recuperacao_ambiental_prad: {
      titulo: 'PLANO DE RECUPERAÇÃO DE ÁREAS DE PRESERVAÇÃO PERMANENTE (APP)',
      subtitulo: 'Revegetação com Espécies Nativas, Isolamento e Regeneração Assistida',
      norma: 'Lei Federal 12.651/2012 (Código Florestal)'
    },
    memorial_descritivo: {
      titulo: 'MEMORIAL DESCRITIVO E ESPECIFICAÇÕES TÉCNICAS DE CAMPO',
      subtitulo: 'Detalhamento de Operações Mecânicas, Insumos e Aplicações',
      norma: 'Responsabilidade Técnica CREA/CONFEA'
    },
    cronograma_atividades: {
      titulo: 'CRONOGRAMA FÍSICO DE OPERAÇÕES DE RECUPERAÇÃO AGRONÔMICA',
      subtitulo: 'Planejamento Temporal de Etapas, Janelas Operacionais e Marcos',
      norma: 'Planejamento Executivo GeaAgro'
    },
    orcamento_detalhado: {
      titulo: 'PLANILHA ORÇAMENTÁRIA DETALHADA E CUSTOS DE RECUPERAÇÃO',
      subtitulo: 'Insumos, Horas-Máquina, Mão de Obra e Custo por Hectare (R$/ha)',
      norma: 'Gestão Econômica Rural GeaAgro'
    },
    relatorio_fotografico: {
      titulo: 'RELATÓRIO FOTOGRÁFICO DE EVIDÊNCIAS E EVOLUÇÃO TEMPORAL',
      subtitulo: 'Registro Visual Georreferenciado Antes, Durante e Pós-Intervenção',
      norma: 'Auditoria de Conformidade Ambiental'
    },
    laudo_monitoramento_igra: {
      titulo: 'LAUDO DE MONITORAMENTO E ÍNDICE IGRA DE RECUPERAÇÃO',
      subtitulo: 'Avaliação das 5 Dimensões: Física, Química, Biológica, Vegetativa e Produtiva',
      norma: 'Índice Proprietário GeaAgro IGRA (0 a 100)'
    },
    comparativo_temporal_antes_depois: {
      titulo: 'RELATÓRIO COMPARATIVO TEMPORAL DE EVOLUÇÃO ESTRUTURAL',
      subtitulo: 'Indicadores Históricos de Solo, Cobertura Vegetal e Produtividade',
      norma: 'Série Histórica GeaAgro CRM'
    },
    termo_encerramento_recuperacao: {
      titulo: 'TERMO DE CONCLUSÃO E CONSOLIDAÇÃO DA RECUPERAÇÃO DA ÁREA',
      subtitulo: 'Homologação Técnica de Estabilização do Solo e Restauração Produtiva',
      norma: 'Parecer Técnico Conclusivo CREA/ART'
    }
  };

  const infoTipo = titulosPorTipo[tipo] || titulosPorTipo.diagnostico_inicial;

  // Header Helper
  const drawHeader = (tituloPagina: string) => {
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 18, 'F');

    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(0, 18, pageWidth, 1.2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('GEAAGRO RECUPERA • GESTÃO DE RECUPERAÇÃO DE ÁREAS DEGRADADAS', margin, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text(infoTipo.norma, pageWidth - margin - 50, 11);

    // Rodapé
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Propriedade: ${propriedade.nome} • Talhão: ${area.nomeTalhao} (${area.areaHa} ha)`, margin, pageHeight - 7);
    doc.text(`Emissão: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - margin - 35, pageHeight - 7);

    if (tituloPagina) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(tituloPagina.toUpperCase(), margin, 27);

      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(0.6);
      doc.line(margin, 29, margin + 45, 29);
    }
  };

  // ==========================================
  // PÁGINA 1: CAPA & DADOS PRINCIPAIS
  // ==========================================
  drawHeader('IDENTIFICAÇÃO & DADOS DO IMÓVEL');

  let y = 35;

  // Banner Principal do Relatório
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'F');
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(6, 95, 70); // emerald-800
  doc.text(infoTipo.titulo, margin + 5, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(5, 150, 105);
  doc.text(infoTipo.subtitulo, margin + 5, y + 15);
  doc.text(`Classificação da Degradação: ${area.grauSeveridade.toUpperCase()} • Status: ${area.statusRecuperacao.toUpperCase()}`, margin + 5, y + 20);

  y += 30;

  // Bloco 1: Dados da Propriedade e Produtor
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('1. DADOS CADASTRAIS DA PROPRIEDADE RURAL', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  doc.text(`Imóvel Rural: ${propriedade.nome || 'Não informado'}`, margin + 4, y + 13);
  doc.text(`Município/UF: ${propriedade.municipio || '-'}/${propriedade.estado || '-'}`, margin + 100, y + 13);

  doc.text(`Produtor: ${propriedade.produtorNome || 'Não informado'}`, margin + 4, y + 19);
  doc.text(`CPF/CNPJ: ${propriedade.produtorCpfCnpj || '-'}`, margin + 100, y + 19);

  doc.text(`Área Total: ${propriedade.areaTotalHa || 0} ha | APP: ${propriedade.areaPreservacaoPermanenteHa || 0} ha | RL: ${propriedade.areaReservaLegalHa || 0} ha`, margin + 4, y + 25);
  doc.text(`CAR: ${propriedade.carNumero || '-'} | CCIR: ${propriedade.ccirNumero || '-'} | Matrícula: ${propriedade.matricula || '-'}`, margin + 4, y + 31);

  y += 44;

  // Bloco 2: Caracterização da Área Degradada Avaliada
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 42, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 42, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('2. CARACTERIZAÇÃO TÉCNICA DA ÁREA ALVO', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  doc.text(`Identificação: ${area.nomeTalhao} (${area.codigoIdentificacao})`, margin + 4, y + 13);
  doc.text(`Área Degradada: ${area.areaHa} hectares`, margin + 110, y + 13);

  doc.text(`Tipo de Degradação: ${area.tipoDegradacao.replace(/_/g, ' ').toUpperCase()}`, margin + 4, y + 19);
  doc.text(`Grau de Severidade: ${area.grauSeveridade.toUpperCase()}`, margin + 110, y + 19);

  doc.text(`Histórico de Uso: ${area.historicoUsoManejo || 'Histórico de exploração contínua sem reposição mineral'}`, margin + 4, y + 25);
  doc.text(`Uso Atual: ${area.tipoUtilizacaoAtual}`, margin + 4, y + 31);
  doc.text(`Coordenadas Sede/Centróide: Lat ${area.coordenadasCentroid.latitude.toFixed(5)}°, Long ${area.coordenadasCentroid.longitude.toFixed(5)}°`, margin + 4, y + 37);

  y += 48;

  // Bloco 3: Diagnóstico Técnico e Indicadores
  if (diagnostico) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 52, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 52, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text('3. DIAGNÓSTICO TÉCNICO MULTIFATORIAL (FÍSICO, QUÍMICO, BIOLÓGICO)', margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);

    doc.text(`• Físico: Compactação: ${diagnostico.fisico.compactacaoPresente ? 'SIM' : 'NÃO'} | Infiltração: ${diagnostico.fisico.infiltracaoAguaMmH} mm/h | Sulcos/Voçorocas: ${diagnostico.fisico.erosaoSulcos || diagnostico.fisico.vocorocasPresentes ? 'PRESENTE' : 'AUSENTE'}`, margin + 4, y + 13);
    doc.text(`• Químico: pH ${diagnostico.quimico.phAgua} | V%: ${diagnostico.quimico.saturacaoBasesVpct}% | m%: ${diagnostico.quimico.saturacaoAluminioMpct}% | MO: ${diagnostico.quimico.teorMateriaOrganicaGDm3} g/dm³`, margin + 4, y + 19);
    doc.text(`• Biológico: Cobertura viva: ${diagnostico.biologico.coberturaVegetalVivaPct}% | Palhada: ${diagnostico.biologico.coberturaPalhadaMortaPct}% | Macrofauna: ${diagnostico.biologico.presencaMacrofaunaMinhocas}`, margin + 4, y + 25);
    doc.text(`• Pastagens: Daninhas: ${diagnostico.pastagem.infestacaoPlantasDaninhasPct}% | Falhas: ${diagnostico.pastagem.percentualFalhasCoberturaPct}% | Suporte Atual: ${diagnostico.pastagem.capacidadeSuporteAtualUaHa} UA/ha`, margin + 4, y + 31);
    doc.text(`• Pontuação Geral de Degradação: ${diagnostico.pontuacaoDegradacao}/100 • Severidade: ${diagnostico.classificacaoGeral.toUpperCase()}`, margin + 4, y + 37);
    doc.text(`• Parecer Técnico: ${diagnostico.justificativaTecnica || 'Área com degradação agronômica severa, requerendo descompactação mecânica e calagem imediata.'}`, margin + 4, y + 43);

    y += 58;
  }

  // Bloco 4: Responsável Técnico e Assinatura
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 36, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 36, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('4. RESPONSÁVEL TÉCNICO & ASSINATURA AGRONÔMICA', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  const respNome = propriedade.responsavelTecnico || area.responsavelTecnico || 'Engenheiro Agrônomo Responsável';
  const respCrea = propriedade.creaNumero || area.creaNumero || 'CREA-00000/D';
  const respArt = propriedade.artNumero || 'ART-REC-000000';

  doc.text(`Profissional Habilitado: ${respNome}`, margin + 4, y + 14);
  doc.text(`Registro Profissional: ${respCrea} • Anotação de Responsabilidade Técnica: ${respArt}`, margin + 4, y + 20);

  doc.setDrawColor(148, 163, 184);
  doc.line(margin + 20, y + 30, margin + 110, y + 30);
  doc.setFontSize(7.5);
  doc.text('Assinatura do Profissional Responsável', margin + 35, y + 34);

  // ==========================================
  // PÁGINA 2: ESTRATÉGIAS, OPERAÇÕES E CUSTOS
  // ==========================================
  doc.addPage();
  drawHeader('PLANEJAMENTO AGRONÔMICO, OPERAÇÕES & CUSTOS');

  y = 35;

  if (projeto) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`PROJETO TÉCNICO VINCULADO: ${projeto.titulo} (${projeto.codigoProjeto})`, margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Tipo de Projeto: ${projeto.tipoProjeto.replace(/_/g, ' ').toUpperCase()}`, margin + 4, y + 13);
    doc.text(`Objetivo Principal: ${projeto.objetivoPrincipal}`, margin + 4, y + 19);
    doc.text(`Estratégia Adotada: ${projeto.estrategiaAdotada}`, margin + 4, y + 25);
    doc.text(`Prazo Executivo: ${projeto.prazoMeses} meses • Orçamento Total: R$ ${projeto.orcamentoTotalPrevistoR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin + 4, y + 30);

    y += 40;
  }

  // Tabela de Operações Previstas
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('CRONOGRAMA DE OPERAÇÕES AGRONÔMICAS SEQUENCIADAS', margin, y);
  y += 4;

  // Cabeçalho da Tabela
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('ORD', margin + 2, y + 4.5);
  doc.text('OPERAÇÃO / ETAPA', margin + 12, y + 4.5);
  doc.text('EQUIPAMENTO / INSUMO', margin + 65, y + 4.5);
  doc.text('STATUS', margin + 120, y + 4.5);
  doc.text('CUSTO PREV. (R$)', margin + 152, y + 4.5);
  y += 6.5;

  const ops: Pick<OperacaoRecuperacao, 'ordem' | 'titulo' | 'maquinarioEquipamento' | 'status' | 'custoPrevistoR$'>[] =
    projeto?.operacoes && projeto.operacoes.length > 0 ? projeto.operacoes : [
      { ordem: 1, titulo: 'Escarificação / Descompactação', maquinarioEquipamento: 'Trator 140cv + Escarificador 7 hastes', status: 'concluida', custoPrevistoR$: 4500 },
      { ordem: 2, titulo: 'Aplicação de Calcário e Gesso Agrícola', maquinarioEquipamento: 'Distribuidor centrífugo a lanço', status: 'em_andamento', custoPrevistoR$: 7800 },
      { ordem: 3, titulo: 'Levantamento de Curvas de Nível / Terraços', maquinarioEquipamento: 'Motoniveladora / Terraceador de arrasto', status: 'pendente', custoPrevistoR$: 3600 },
      { ordem: 4, titulo: 'Semeadura de Braquiária + Crotalária', maquinarioEquipamento: 'Semeadora com rolo compactador', status: 'pendente', custoPrevistoR$: 8900 }
    ];

  ops.slice(0, 7).forEach((op, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 6, margin + contentWidth, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);

    doc.text(String(op.ordem || idx + 1), margin + 3, y + 4.2);
    doc.text(op.titulo.slice(0, 32), margin + 12, y + 4.2);
    doc.text(op.maquinarioEquipamento.slice(0, 30), margin + 65, y + 4.2);
    doc.text(op.status.toUpperCase(), margin + 120, y + 4.2);
    doc.text(`R$ ${op.custoPrevistoR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin + 152, y + 4.2);

    y += 6;
  });

  y += 8;

  // Tabela de Custos e Orçamento por Hectare
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('ORÇAMENTO CONSOLIDADO POR HECTARE (R$/HA)', margin, y);
  y += 4;

  const custoTotalArea = ops.reduce((acc, o) => acc + (Number(o.custoPrevistoR$) || 0), 0);
  const custoPorHa = area.areaHa > 0 ? custoTotalArea / area.areaHa : 0;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`Custo Estimado Total da Intervenção: R$ ${custoTotalArea.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin + 5, y + 6);
  doc.text(`Investimento Médio por Hectare Recuperado: R$ ${custoPorHa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / ha`, margin + 5, y + 12);

  y += 24;

  // Observações e Recomendações Finais
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('OBSERVAÇÕES AGRONÔMICAS FINAIS & RECOMENDAÇÕES', margin, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const obs = observacoesAdicionais ||
    '1. As intervenções de preparo do solo devem ocorrer preferencialmente no final do período seco para início das chuvas.\n' +
    '2. A semeadura das espécies forrageiras e de cobertura deve respeitar a profundidade máxima de 1 a 2 cm para sementes pequenas.\n' +
    '3. O pastejo na área em recuperação só deve ser iniciado após o enraizamento pleno e perfilhamento (mínimo de 70 a 90 dias após emergência).';

  const splitObs = doc.splitTextToSize(obs, contentWidth);
  doc.text(splitObs, margin, y);

  return doc;
}
