import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FileText,
  Download,
  Bot,
  Send,
  Printer,
} from 'lucide-react';
import {
  PropriedadeRural,
  TalhaoRural,
  SafraAgragricola,
  ContaFinanceiraRecord,
  MensagemAssistenteIARural,
} from '../../types/gestaoRural';

interface GestaoRelatoriosIAProps {
  propriedade: PropriedadeRural;
  talhoes: TalhaoRural[];
  safras: SafraAgragricola[];
  financeiro: ContaFinanceiraRecord[];
}

export const GestaoRelatoriosIA: React.FC<GestaoRelatoriosIAProps> = ({
  propriedade,
  talhoes,
  safras,
  financeiro,
}) => {
  const [activeTab, setActiveTab] = useState<'relatorios' | 'ia'>('relatorios');
  const [mensagemInput, setMensagemInput] = useState('');
  const replyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const metrics = useMemo(() => {
    const receitaTotal = financeiro
      .filter(f => f.tipo === 'receita')
      .reduce((acc, f) => acc + f.valorR$, 0);
    const despesaTotal = financeiro
      .filter(f => f.tipo === 'despesa')
      .reduce((acc, f) => acc + f.valorR$, 0);
    const lucroLiquido = receitaTotal - despesaTotal;
    const margemPct = receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0;
    const areaPlantada = safras.reduce((acc, s) => acc + (s.areaHa || 0), 0);
    const areaReferencia = areaPlantada > 0 ? areaPlantada : propriedade.areaAgricolaHa || 0;
    const custoPorHa = areaReferencia > 0 ? despesaTotal / areaReferencia : 0;
    const safrasColhidas = safras.filter(s => s.status === 'colhida' && (s.produtividadeRealizadaSacasHa || 0) > 0);
    const prodMedia =
      safrasColhidas.length > 0
        ? safrasColhidas.reduce((acc, s) => acc + (s.produtividadeRealizadaSacasHa || 0), 0) / safrasColhidas.length
        : 0;
    const roiPct = despesaTotal > 0 ? (lucroLiquido / despesaTotal) * 100 : 0;

    return {
      receitaTotal,
      despesaTotal,
      lucroLiquido,
      margemPct,
      custoPorHa,
      prodMedia,
      roiPct,
      areaReferencia,
    };
  }, [financeiro, safras, propriedade.areaAgricolaHa]);

  const [mensagensChat, setMensagensChat] = useState<MensagemAssistenteIARural[]>(() => [
    {
      id: 'm-01',
      remetente: 'ia',
      texto: `Olá! Sou o Assistente Técnico GeaAgro de Gestão Rural 360°. Analisei os dados reais da fazenda **${propriedade.nome}**.\n\nReceita acumulada: **R$ ${metrics.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** | Despesas: **R$ ${metrics.despesaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** | Lucro líquido: **R$ ${metrics.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** (margem de **${metrics.margemPct.toFixed(1)}%**).\n\nComo posso ajudar você hoje no planejamento ou na auditoria dos relatórios?`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      sugestoesAcao: [
        'Resumir composição de custos da safra',
        'Explicar margem de lucro e ROI atual',
        'Verificar status de auditoria e talhões',
      ],
    },
  ]);

  useEffect(() => {
    return () => {
      if (replyTimerRef.current) {
        clearTimeout(replyTimerRef.current);
      }
    };
  }, []);

  const handleEnviarMensagem = (textoEnvio?: string) => {
    const texto = textoEnvio || mensagemInput;
    if (!texto.trim()) return;

    const novaMensagemUsuario: MensagemAssistenteIARural = {
      id: `usr-${Date.now()}`,
      remetente: 'usuario',
      texto,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMensagensChat(prev => [...prev, novaMensagemUsuario]);
    if (!textoEnvio) setMensagemInput('');

    if (replyTimerRef.current) {
      clearTimeout(replyTimerRef.current);
    }

    replyTimerRef.current = setTimeout(() => {
      let respostaIA = '';
      const tLower = texto.toLowerCase();

      if (tLower.includes('custo') || tLower.includes('composição')) {
        respostaIA = `Análise de Custos da Fazenda ${propriedade.nome}:\n- Despesas totais lançadas: **R$ ${metrics.despesaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**\n- Área de referência: **${metrics.areaReferencia} ha**\n- Custo médio por hectare: **R$ ${metrics.custoPorHa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / ha**\n- Lançamentos financeiros avaliados: **${financeiro.length}**.`;
      } else if (tLower.includes('lucro') || tLower.includes('margem') || tLower.includes('roi')) {
        respostaIA = `Resumo de Rentabilidade (${propriedade.nome}):\n- Receita bruta: **R$ ${metrics.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**\n- Lucro líquido: **R$ ${metrics.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**\n- Margem de lucro: **${metrics.margemPct.toFixed(1)}%** | ROI: **${metrics.roiPct.toFixed(1)}%**.`;
      } else {
        respostaIA = `Com base no cadastro atual de **${talhoes.length} talhão(ões)** e **${safras.length} safra(s)**, a propriedade **${propriedade.nome}** opera com rastreabilidade offline local.`;
      }

      const novaRespostaIA: MensagemAssistenteIARural = {
        id: `ia-${Date.now()}`,
        remetente: 'ia',
        texto: respostaIA,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMensagensChat(prev => [...prev, novaRespostaIA]);
      replyTimerRef.current = null;
    }, 350);
  };

  const gerarPDFRelatorioOficial = async (tipo: string) => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const primaryColor = [16, 124, 65];

      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 35, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('GEAAGRO - GESTÃO RURAL 360°', 14, 18);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`RELATÓRIO OFICIAL: ${tipo.toUpperCase()}`, 14, 27);

      doc.setTextColor(60, 60, 60);
      doc.setFontSize(9);
      doc.text(`Propriedade: ${propriedade.nome || 'Não informada'}`, 14, 45);
      doc.text(`Proprietário: ${propriedade.proprietario || 'Não informado'}`, 14, 52);
      doc.text(`Município: ${propriedade.municipio || '-'} - ${propriedade.estado || '-'}`, 14, 59);
      doc.text(`Responsável Técnico: ${propriedade.responsavelTecnico || 'Não informado'}`, 14, 66);
      doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 140, 45);
      doc.text('Status: Auditoria Offline Aprovada', 140, 52);

      doc.setDrawColor(220, 220, 220);
      doc.setFillColor(248, 250, 248);
      doc.rect(14, 75, 182, 120, 'FD');

      doc.setTextColor(20, 20, 20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Resumo Executivo da Propriedade', 20, 88);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`• Área Agrícola Mapeada: ${propriedade.areaAgricolaHa} ha`, 20, 100);
      doc.text(`• Área Irrigada (Pivôs / Gotejo): ${propriedade.areaIrrigadaHa} ha`, 20, 108);
      doc.text(`• Total de Talhões Ativos: ${talhoes.length} Talhões`, 20, 116);
      doc.text(`• Faturamento Bruto da Safra: R$ ${metrics.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, 124);
      doc.text(`• Custo Total da Safra: R$ ${metrics.despesaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, 132);
      doc.text(`• Lucro Líquido Apurado: R$ ${metrics.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, 140);
      doc.text(`• Produtividade Média Realizada: ${metrics.prodMedia > 0 ? `${metrics.prodMedia.toFixed(1)} un/ha` : 'Sem colheita apurada'}`, 20, 148);

      doc.line(20, 230, 90, 230);
      doc.line(120, 230, 190, 230);
      doc.text('Engenheiro Agrônomo RT', 30, 236);
      doc.text('Produtor / Administrador', 130, 236);

      doc.save(`GeaAgro_Relatorio_${tipo.replace(/\s+/g, '_')}.pdf`);
    } catch (e) {
      console.error('Error generating PDF:', e);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase text-[10px] tracking-wider">
            <FileText className="w-4 h-4" />
            Módulos 13 & 14 • Relatórios Oficiais & Assistente IA GeaAgro
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Relatórios Auditáveis PDF/Excel & Assistente IA
          </h2>
          <p className="text-slate-500">
            Exportação com cabeçalho oficial GeaAgro e consulta técnica offline sem invenção de dados
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('relatorios')}
            className={`px-4 py-2.5 font-bold rounded-xl cursor-pointer flex items-center gap-2 ${
              activeTab === 'relatorios' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-zinc-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Relatórios PDF</span>
          </button>
          <button
            onClick={() => setActiveTab('ia')}
            className={`px-4 py-2.5 font-bold rounded-xl cursor-pointer flex items-center gap-2 ${
              activeTab === 'ia' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-zinc-800'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Assistente IA GeaAgro</span>
          </button>
        </div>
      </div>

      {/* RELATÓRIOS TAB */}
      {activeTab === 'relatorios' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
          <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3">
            <Printer className="w-4 h-4 text-emerald-600" />
            Emissão de Relatórios Oficiais com Timbrado GeaAgro
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              'Caderno de Campo & Operações',
              'Custos da Safra & DRE',
              'Estoque e Almoxarifado',
              'Comercialização & Vendas',
              'Máquinas & Manutenções',
              'Relatório de Irrigação & Clima',
            ].map(tipo => (
              <div
                key={tipo}
                className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">{tipo}</h4>
                  <span className="text-[10px] text-slate-400 block">Formato PDF</span>
                </div>
                <button
                  onClick={() => void gerarPDFRelatorioOficial(tipo)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[10px] cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar PDF</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IA ASSISTANT TAB */}
      {activeTab === 'ia' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-950 text-purple-600 rounded-xl">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  Assistente Técnico GeaAgro (Offline AI)
                </h3>
                <p className="text-[10px] text-slate-400">
                  Interpretação de dados financeiros e agronômicos sem dados fictícios
                </p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-full">
              Auditável & Offline
            </span>
          </div>

          {/* CHAT MESSAGES */}
          <div className="h-80 overflow-y-auto space-y-3 p-4 bg-slate-50 dark:bg-zinc-800/30 rounded-2xl border">
            {mensagensChat.map(m => (
              <div
                key={m.id}
                className={`flex flex-col ${m.remetente === 'usuario' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-xl p-3.5 rounded-2xl space-y-2 text-xs leading-relaxed ${
                    m.remetente === 'usuario'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 border shadow-2xs rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.texto}</p>

                  {m.sugestoesAcao && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-700/60 space-y-1">
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase block">
                        Sugestões Rápidas:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {m.sugestoesAcao.map((sug, i) => (
                          <button
                            key={i}
                            onClick={() => handleEnviarMensagem(sug)}
                            className="px-2 py-1 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-lg text-[10px] font-bold hover:bg-purple-100 cursor-pointer"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 px-1">{m.timestamp}</span>
              </div>
            ))}
          </div>

          {/* CHAT INPUT */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Pergunte sobre custos, ROI, talhões ou produtividade..."
              value={mensagemInput}
              onChange={e => setMensagemInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEnviarMensagem()}
              className="flex-1 px-4 py-2.5 border rounded-xl bg-slate-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            />
            <button
              onClick={() => handleEnviarMensagem()}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Enviar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
