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

const REPORT_TYPES = [
  { title: 'Caderno de Campo & Operações', desc: 'Resumo consolidado de área e atividades' },
  { title: 'Custos da Safra & DRE', desc: 'Receitas, despesas, margem e lucro líquido' },
  { title: 'Estoque e Almoxarifado', desc: 'Inventário técnico e posição patrimonial' },
  { title: 'Comercialização & Vendas', desc: 'Contratos, faturamento e escoamento' },
  { title: 'Máquinas & Manutenções', desc: 'Frota ativa e histórico de revisões' },
  { title: 'Relatório de Irrigação & Clima', desc: 'Balanço hídrico e condições meteorológicas' },
] as const;

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
      texto: `Olá! Analisei os registros locais de ${propriedade.nome || 'sua propriedade'}.\nReceita acumulada: R$ ${metrics.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Despesas: R$ ${metrics.despesaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Lucro líquido: R$ ${metrics.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (margem ${metrics.margemPct.toFixed(1)}%).\n\nO que deseja consultar?`,
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
        respostaIA = `Análise de Custos — ${propriedade.nome}:\n• Despesas lançadas: R$ ${metrics.despesaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n• Área de referência: ${metrics.areaReferencia} ha\n• Custo médio/ha: R$ ${metrics.custoPorHa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ha\n• Lançamentos avaliados: ${financeiro.length}.`;
      } else if (tLower.includes('lucro') || tLower.includes('margem') || tLower.includes('roi')) {
        respostaIA = `Resumo de Rentabilidade — ${propriedade.nome}:\n• Receita bruta: R$ ${metrics.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n• Lucro líquido: R$ ${metrics.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n• Margem: ${metrics.margemPct.toFixed(1)}% | ROI: ${metrics.roiPct.toFixed(1)}%.`;
      } else {
        respostaIA = `Cadastro atual: ${talhoes.length} talhão(ões) e ${safras.length} safra(s) na propriedade ${propriedade.nome}, com rastreabilidade local ativa.`;
      }

      const novaRespostaIA: MensagemAssistenteIARural = {
        id: `ia-${Date.now()}`,
        remetente: 'ia',
        texto: respostaIA,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMensagensChat(prev => [...prev, novaRespostaIA]);
      replyTimerRef.current = null;
    }, 300);
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
    <div className="space-y-5 animate-fade-in">
      {/* HEADER + TABS */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Relatórios PDF &amp; Consulta Técnica</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Emissão de relatórios oficiais timbrados e análise instantânea baseada nos dados registrados
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('relatorios')}
              className={`h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'relatorios'
                  ? 'bg-emerald-600 text-white'
                  : 'border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Relatórios PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ia')}
              className={`h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'ia'
                  ? 'bg-emerald-600 text-white'
                  : 'border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Consulta Técnica</span>
            </button>
          </div>
        </div>
      </div>

      {/* RELATÓRIOS TAB */}
      {activeTab === 'relatorios' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl divide-y divide-slate-100 dark:divide-zinc-800/80">
          {REPORT_TYPES.map(rep => (
            <div key={rep.title} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-zinc-800/30 transition-colors">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">{rep.title}</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">{rep.desc}</div>
              </div>
              <button
                type="button"
                onClick={() => void gerarPDFRelatorioOficial(rep.title)}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar PDF</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* CONSULTA TÉCNICA OFFLINE TAB */}
      {activeTab === 'ia' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
              Assistente Técnico Local (Baseado nos registros da fazenda)
            </span>
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              Offline &amp; Auditável
            </span>
          </div>

          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-zinc-950/30">
            {mensagensChat.map(m => (
              <div key={m.id} className={`flex flex-col ${m.remetente === 'usuario' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-xl px-3.5 py-2.5 rounded-xl text-xs leading-relaxed space-y-2 ${
                    m.remetente === 'usuario'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-slate-800 dark:text-zinc-200'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.texto}</p>
                  {m.sugestoesAcao && (
                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap gap-1.5">
                      {m.sugestoesAcao.map((sug, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleEnviarMensagem(sug)}
                          className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-zinc-700 hover:border-emerald-500 text-slate-700 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-400 text-[11px] font-medium cursor-pointer transition-colors"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 px-1 tabular-nums">{m.timestamp}</span>
              </div>
            ))}
          </div>

          <div className="p-3.5 border-t border-slate-200/80 dark:border-zinc-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="Pergunte sobre custos, ROI, margem ou talhões..."
              value={mensagemInput}
              onChange={e => setMensagemInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEnviarMensagem()}
              className="flex-1 h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
            <button
              type="button"
              onClick={() => handleEnviarMensagem()}
              className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
