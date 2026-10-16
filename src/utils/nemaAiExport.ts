import { jsPDF } from 'jspdf';
import { ChatMessage, CentralAIAnalysisResult } from '../components/nema-ai/types';

export interface NemaAIExportContext {
  farmName?: string;
  fieldName?: string;
  producerName?: string;
  cropOrPasture?: string;
  cultivarOrForage?: string;
  soilType?: string;
  domain?: string;
  messages: ChatMessage[];
  latestResult?: CentralAIAnalysisResult | null;
}

// Clean markdown symbols for plain text and PDF layout
function cleanMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/^###\s+/gm, '• ')
    .replace(/^##\s+/gm, '• ')
    .replace(/^#\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '[Bloco de Código/Dados]')
    .replace(/\r\n/g, '\n')
    .trim();
}

/**
 * Generates and downloads a formatted TXT file of the chat history and agronomic record
 */
export function exportChatToTxt(context: NemaAIExportContext): void {
  const {
    farmName = 'Fazenda Principal',
    fieldName = 'Talhão Geral',
    producerName = 'Produtor Não Informado',
    cropOrPasture = 'Soja',
    cultivarOrForage = 'Padrão',
    soilType = 'Médio',
    domain = 'Agronomia & Manejo Integrado',
    messages = [],
    latestResult,
  } = context;

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('pt-BR');
  const timeFormatted = now.toLocaleTimeString('pt-BR');
  const protocol = `PRONT-NEMA-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Date.now().toString(36).toUpperCase()}`;

  let content = `================================================================================
          AGRONUTRI & NEMA IA - PRONTUÁRIO AGRONÔMICO OFICIAL
================================================================================
Protocolo: ${protocol}
Data de Emissão: ${dateFormatted} às ${timeFormatted}

IDENTIFICAÇÃO DA PROPRIEDADE E TALHÃO
--------------------------------------------------------------------------------
Propriedade / Fazenda: ${farmName}
Produtor Rural:        ${producerName}
Talhão / Gleba:        ${fieldName}
Cultura / Forrageira:  ${cropOrPasture} (Cultivar/Híbrido: ${cultivarOrForage})
Textura de Solo:       ${soilType}
Domínio Técnico:       ${domain}
Total de Interações:   ${messages.length} mensagens
`;

  if (latestResult) {
    content += `
PARECER TÉCNICO VIGENTE (NEMA IA SCORE)
--------------------------------------------------------------------------------
Nível de Risco:        ${latestResult.riskLevel} (${latestResult.riskScorePercentage || 0}%)
Categoria:             ${latestResult.domainCategory || domain}
${latestResult.reproductionFactorAnalysis?.estimatedFR !== undefined ? `Fator de Reprodução (FR): ${latestResult.reproductionFactorAnalysis.estimatedFR}\n` : ''}
Resumo Executivo:
${latestResult.executiveSummary || 'Sem resumo registrado.'}

`;

    if (latestResult.biologicalManagementPlan && latestResult.biologicalManagementPlan.length > 0) {
      content += `PRESCRIÇÃO BIOLÓGICA & MANEJO:\n`;
      latestResult.biologicalManagementPlan.forEach((b, i) => {
        content += `  ${i + 1}. Agente: ${b.agent} | Alvo: ${b.target} | Dose: ${b.doseRecommendation} (${b.applicationTiming})\n`;
      });
      content += `\n`;
    }

    if (latestResult.actionChecklist && latestResult.actionChecklist.length > 0) {
      content += `CHECKLIST OPERACIONAL RECOMENDADO:\n`;
      latestResult.actionChecklist.forEach((act) => {
        content += `  [ ] ${act}\n`;
      });
      content += `\n`;
    }
  }

  content += `================================================================================
                   TRANSCRIÇÃO DO DIÁLOGO TÉCNICO (CHAT)
================================================================================\n`;

  if (messages.length === 0) {
    content += `Nenhuma interação registrada neste atendimento.\n`;
  } else {
    messages.forEach((msg, idx) => {
      const msgDate = new Date(msg.timestamp).toLocaleString('pt-BR');
      const author = msg.role === 'user' ? 'PRODUTOR / AGRÔNOMO' : 'NEMA IA (CONSULTORA TÉCNICA)';
      content += `\n[#${idx + 1}] [${msgDate}] ${author}\n`;
      if (msg.attachedFileName) {
        content += `>>> Arquivo Anexo: ${msg.attachedFileName}\n`;
      }
      content += `--------------------------------------------------------------------------------\n`;
      content += `${cleanMarkdown(msg.content)}\n`;
    });
  }

  content += `\n================================================================================
                    VALIDAÇÃO DO PRONTUÁRIO AGRONÔMICO
================================================================================
Este documento consolida o histórico de orientações agronômicas realizadas através
da Nema IA (Cérebro Agronômico AgroNutri), emitido para composição de prontuário
agronômico, rastreabilidade fitossanitária e conformidade técnica no campo.

____________________________________________        ____________________________________________
Engenheiro(a) Agrônomo(a) - CREA / ART             Produtor(a) / Gestor(a) da Propriedade

Emitido via Sistema AgroNutri • Todos os direitos reservados.
================================================================================
`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeFarm = farmName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeField = fieldName.replace(/[^a-zA-Z0-9_-]/g, '_');
  a.href = url;
  a.download = `Prontuario_NemaIA_${safeFarm}_${safeField}_${now.toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a clean, multi-page vector PDF of the agronomic record
 */
export async function exportChatToPdf(context: NemaAIExportContext): Promise<void> {
  const {
    farmName = 'Fazenda Principal',
    fieldName = 'Talhão Geral',
    producerName = 'Produtor Não Informado',
    cropOrPasture = 'Soja',
    cultivarOrForage = 'Padrão',
    soilType = 'Médio',
    domain = 'Agronomia & Manejo Integrado',
    messages = [],
    latestResult,
  } = context;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const marginLeft = 15;
  const marginRight = 15;
  const contentWidth = pageWidth - marginLeft - marginRight; // 180mm
  const marginBottom = 18;
  const marginTop = 15;

  let currentY = marginTop;

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('pt-BR');
  const timeFormatted = now.toLocaleTimeString('pt-BR');
  const protocol = `PRONT-NEMA-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Date.now().toString(36).toUpperCase()}`;

  // Helper to check page break and reserve space
  const ensureSpace = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - marginBottom) {
      doc.addPage();
      currentY = marginTop + 10;
      drawPageHeaderCompact();
    }
  };

  const drawPageHeaderCompact = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('AGRONUTRI • PRONTUÁRIO AGRONÔMICO NEMA IA', marginLeft, marginTop);
    doc.text(`Protocolo: ${protocol}`, pageWidth - marginRight, marginTop, { align: 'right' });
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(marginLeft, marginTop + 2, pageWidth - marginRight, marginTop + 2);
  };

  // --- 1. COVER / MAIN HEADER BANNER ---
  doc.setFillColor(24, 34, 25); // Deep Forest Agronomic Green
  doc.rect(marginLeft, currentY, contentWidth, 24, 'F');

  // Accent golden/amber stripe
  doc.setFillColor(217, 119, 6); // Amber 600
  doc.rect(marginLeft, currentY, 3, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('AGRONUTRI • PRONTUÁRIO AGRONÔMICO & CONSULTORIA', marginLeft + 7, currentY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(220, 230, 220);
  doc.text('Registro Oficial de Atendimento Técnico • Nema IA Consultora Agropecuária', marginLeft + 7, currentY + 14);

  doc.setFontSize(7.5);
  doc.setTextColor(200, 210, 200);
  doc.text(`Protocolo: ${protocol}  |  Emissão: ${dateFormatted} às ${timeFormatted}`, marginLeft + 7, currentY + 19);

  currentY += 28;

  // --- 2. PROPERTY & PLOT METADATA BOX ---
  ensureSpace(28);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(marginLeft, currentY, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);

  // Column 1
  const col1X = marginLeft + 4;
  const col2X = marginLeft + 65;
  const col3X = marginLeft + 125;

  doc.text('Propriedade:', col1X, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(farmName, col1X + 20, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Produtor:', col1X, currentY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(producerName, col1X + 20, currentY + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('Talhão/Área:', col1X, currentY + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(fieldName, col1X + 20, currentY + 18);

  // Column 2
  doc.setFont('helvetica', 'bold');
  doc.text('Cultura:', col2X, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(cropOrPasture, col2X + 16, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Cultivar:', col2X, currentY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(cultivarOrForage, col2X + 16, currentY + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('Tipo Solo:', col2X, currentY + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(soilType, col2X + 16, currentY + 18);

  // Column 3
  doc.setFont('helvetica', 'bold');
  doc.text('Especialidade:', col3X, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(domain, col3X + 22, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Interações:', col3X, currentY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${messages.length} mensagens`, col3X + 22, currentY + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('Risco Vigente:', col3X, currentY + 18);
  const risk = latestResult?.riskLevel || 'Registrado';
  if (risk === 'Muito Alta' || risk === 'Alta') {
    doc.setTextColor(190, 18, 60);
  } else if (risk === 'Moderada') {
    doc.setTextColor(180, 83, 9);
  } else {
    doc.setTextColor(21, 128, 61);
  }
  doc.text(risk, col3X + 22, currentY + 18);

  currentY += 28;

  // --- 3. LATEST TECHNICAL SCORE & SUMMARY (IF AVAILABLE) ---
  if (latestResult) {
    ensureSpace(32);
    doc.setFillColor(254, 243, 199); // Light amber
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(marginLeft, currentY, contentWidth, 8, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(146, 64, 14);
    doc.text('RESUMO EXECUTIVO DO PARECER TÉCNICO', marginLeft + 4, currentY + 5.5);

    currentY += 11;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    const summaryLines = doc.splitTextToSize(
      cleanMarkdown(latestResult.executiveSummary || 'Parecer técnico gerado.'),
      contentWidth - 4
    );

    ensureSpace(summaryLines.length * 3.8 + 8);
    doc.text(summaryLines, marginLeft + 2, currentY);
    currentY += summaryLines.length * 3.8 + 6;

    // Biological management plan highlights if present
    if (latestResult.biologicalManagementPlan && latestResult.biologicalManagementPlan.length > 0) {
      ensureSpace(18);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(21, 128, 61);
      doc.text('Recomendações de Bioinsumos / Manejo:', marginLeft + 2, currentY);
      currentY += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);

      latestResult.biologicalManagementPlan.slice(0, 3).forEach((b) => {
        const line = `• ${b.agent}: Dose ${b.doseRecommendation} voltado para ${b.target} (${b.applicationTiming})`;
        const splitted = doc.splitTextToSize(line, contentWidth - 6);
        ensureSpace(splitted.length * 3.5 + 2);
        doc.text(splitted, marginLeft + 4, currentY);
        currentY += splitted.length * 3.5;
      });
      currentY += 4;
    }
  }

  // --- 4. CHAT HISTORY TRANSCRIPT ---
  ensureSpace(14);
  doc.setDrawColor(203, 213, 225);
  doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('HISTÓRICO DO BATE-PAPO TÉCNICO (DIÁLOGO)', marginLeft, currentY);
  currentY += 6;

  if (messages.length === 0) {
    ensureSpace(10);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Nenhuma mensagem registrada nesta sessão.', marginLeft, currentY);
    currentY += 8;
  } else {
    messages.forEach((msg, idx) => {
      const isUser = msg.role === 'user';
      const msgTime = new Date(msg.timestamp).toLocaleString('pt-BR');
      const authorTitle = isUser
        ? `[#${idx + 1}] PRODUTOR / AGRÔNOMO (${msgTime})`
        : `[#${idx + 1}] NEMA IA - CONSULTORIA TÉCNICA (${msgTime})`;

      const cleanText = cleanMarkdown(msg.content);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const textLines = doc.splitTextToSize(cleanText, contentWidth - 8);
      const blockHeight = textLines.length * 3.8 + 12 + (msg.attachedFileName ? 5 : 0);

      ensureSpace(Math.min(blockHeight, 40)); // Ensure at least heading and initial lines fit

      // Background card for message
      if (isUser) {
        doc.setFillColor(241, 245, 249); // slate-100
        doc.setDrawColor(203, 213, 225);
      } else {
        doc.setFillColor(254, 252, 232); // amber-50
        doc.setDrawColor(253, 224, 71); // amber-300
      }

      // We draw block incrementally to handle multi-page long messages
      doc.roundedRect(marginLeft, currentY, contentWidth, 6.5, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      if (isUser) {
        doc.setTextColor(30, 41, 59);
      } else {
        doc.setTextColor(180, 83, 9);
      }
      doc.text(authorTitle, marginLeft + 3, currentY + 4.5);
      currentY += 8;

      if (msg.attachedFileName) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(217, 119, 6);
        doc.text(`Anexo analisado: ${msg.attachedFileName}`, marginLeft + 3, currentY);
        currentY += 4.5;
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);

      // Print lines one by one, wrapping across pages if needed
      for (const line of textLines) {
        ensureSpace(4.5);
        doc.text(line, marginLeft + 3, currentY);
        currentY += 3.7;
      }

      currentY += 3.5;
    });
  }

  // --- 5. SIGNATURE & AGRONOMIC AUDIT BLOCK ---
  ensureSpace(38);
  currentY += 4;
  doc.setDrawColor(203, 213, 225);
  doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
  currentY += 7;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('TERMO DE REGISTRO EM PRONTUÁRIO AGRONÔMICO', marginLeft, currentY);
  currentY += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'As orientações registradas neste prontuário foram processadas pela Nema IA integrando laudos laboratoriais,',
    marginLeft,
    currentY
  );
  currentY += 3.5;
  doc.text(
    'parâmetros de solo, histórico da cultura e referências agronômicas para rastreabilidade fitossanitária.',
    marginLeft,
    currentY
  );
  currentY += 12;

  // Signatures lines
  const sig1X = marginLeft + 10;
  const sig2X = marginLeft + 100;
  const sigLineWidth = 65;

  doc.setDrawColor(100, 116, 139);
  doc.line(sig1X, currentY, sig1X + sigLineWidth, currentY);
  doc.line(sig2X, currentY, sig2X + sigLineWidth, currentY);

  currentY += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text('Responsável Técnico (CREA / ART)', sig1X + 5, currentY);
  doc.text('Produtor / Administrador Agrícola', sig2X + 5, currentY);

  // --- 6. NUMBER ALL PAGES IN FOOTER ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);

    doc.setDrawColor(226, 232, 240);
    doc.line(marginLeft, pageHeight - 10, pageWidth - marginRight, pageHeight - 10);

    doc.text(
      'AgroNutri Sistema Agronômico • Nema IA Assistente Especializada',
      marginLeft,
      pageHeight - 6
    );
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - marginRight, pageHeight - 6, {
      align: 'right',
    });
  }

  const safeFarm = farmName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeField = fieldName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Prontuario_NemaIA_${safeFarm}_${safeField}_${now.toISOString().slice(0, 10)}.pdf`;

  doc.save(filename);
}
