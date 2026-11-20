import React, { useState, useRef, useEffect } from 'react';
import {
  PropriedadeRecupera,
  AreaDegradadaItem,
  DiagnosticoTecnicoCompleto,
  AnaliseSoloItem,
  ProjetoRecuperacao,
  MonitoramentoVisita,
  ItemCustoRecuperacao,
  AtividadeCronograma,
  TipoRelatorioPdf
} from '../../types/recupera';
import {
  FileText,
  Download,
  CheckCircle2,
  ShieldCheck,
  FileCheck2,
  FileSpreadsheet,
  Award,
  AlertTriangle
} from 'lucide-react';

interface Props {
  propriedade: PropriedadeRecupera;
  areaAtiva: AreaDegradadaItem;
  diagnostico?: DiagnosticoTecnicoCompleto;
  analiseSolo?: AnaliseSoloItem;
  projeto?: ProjetoRecuperacao;
  monitoramentos: MonitoramentoVisita[];
  custos: ItemCustoRecuperacao[];
  cronogramas: AtividadeCronograma[];
}

const RELATORIOS_DISPONIVEIS: {
  id: TipoRelatorioPdf;
  nome: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'diagnostico_inicial',
    nome: '1. Diagnóstico Técnico Inicial de Degradação',
    desc: 'Laudo completo das condições físicas, químicas, biológicas e vegetativas do solo.',
    icon: FileText
  },
  {
    id: 'analise_solo_fertilidade',
    nome: '2. Boletim de Análise de Solo & Fertilidade',
    desc: 'Interpretação agronômica de macronutrientes, micronutrientes, acidez e CTC.',
    icon: FileSpreadsheet
  },
  {
    id: 'projeto_tecnico_completo',
    nome: '3. Projeto Técnico de Recuperação (PRAD)',
    desc: 'Documento executivo estruturado com justificativas, cronograma e orçamentos.',
    icon: ShieldCheck
  },
  {
    id: 'plano_recuperacao_pastagens',
    nome: '4. Plano de Recuperação de Pastagens',
    desc: 'Estratégia de reforma/renovação, cultivares forrageiras e manejo de lotação.',
    icon: FileText
  },
  {
    id: 'plano_conservacao_solo',
    nome: '5. Plano de Conservação do Solo (Terraços)',
    desc: 'Dimensionamento de curvas de nível, espaçamentos EV/EH e bacias de contenção.',
    icon: FileCheck2
  },
  {
    id: 'projeto_recuperacao_ambiental_prad',
    nome: '6. Projeto de Recuperação Ambiental (APP/RL)',
    desc: 'Plano de revegetação com espécies nativas sucessionais e proteção de nascentes.',
    icon: ShieldCheck
  },
  {
    id: 'memorial_descritivo',
    nome: '7. Memorial Descritivo de Operações',
    desc: 'Especificações técnicas de maquinário, preparo, insumos e dosagens recomendadas.',
    icon: FileText
  },
  {
    id: 'cronograma_atividades',
    nome: '8. Cronograma Físico de Atividades',
    desc: 'Janelas operacionais, responsáveis técnicos e marcos de execução.',
    icon: FileText
  },
  {
    id: 'orcamento_detalhado',
    nome: '9. Orçamento Detalhado & Custo por Hectare',
    desc: 'Planilha de insumos, horas-máquina, serviços terceiros e valor total R$/ha.',
    icon: FileSpreadsheet
  },
  {
    id: 'relatorio_fotografico',
    nome: '10. Relatório Fotográfico de Evidências',
    desc: 'Comprovação visual georreferenciada antes, durante e após a recuperação.',
    icon: FileText
  },
  {
    id: 'laudo_monitoramento_igra',
    nome: '11. Laudo de Monitoramento IGRA',
    desc: 'Avaliação das 5 dimensões do Índice GeaAgro e evolução do estágio do solo.',
    icon: Award
  },
  {
    id: 'comparativo_temporal_antes_depois',
    nome: '12. Relatório Comparativo Antes & Depois',
    desc: 'Histórico evolutivo de cobertura de solo, matéria orgânica e produtividade.',
    icon: FileText
  },
  {
    id: 'termo_encerramento_recuperacao',
    nome: '13. Termo de Encerramento & Conclusão',
    desc: 'Parecer técnico conclusivo de consolidação da recuperação da área degradada.',
    icon: CheckCircle2
  }
];

export const RecuperaRelatoriosView: React.FC<Props> = ({
  propriedade,
  areaAtiva,
  diagnostico,
  analiseSolo,
  projeto,
  monitoramentos,
  custos,
  cronogramas
}) => {
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<TipoRelatorioPdf>('diagnostico_inicial');
  const [obsPersonalizada, setObsPersonalizada] = useState('');
  const [gerando, setGerando] = useState(false);
  const [erroPdf, setErroPdf] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const modeloAtivo = RELATORIOS_DISPONIVEIS.find(r => r.id === relatorioSelecionado);

  const handleEmitirPdf = () => {
    setGerando(true);
    setErroPdf(null);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(async () => {
      try {
        const { gerarRelatorioPdfRecupera } = await import('../../utils/recuperaPdfGenerator');
        const doc = gerarRelatorioPdfRecupera({
          tipo: relatorioSelecionado,
          propriedade,
          area: areaAtiva,
          diagnostico,
          analiseSolo,
          projeto,
          monitoramentos,
          custos,
          cronogramas,
          observacoesAdicionais: obsPersonalizada
        });

        const nomeArquivo = `GeaAgro_Recupera_${relatorioSelecionado}_${areaAtiva.codigoIdentificacao}.pdf`;
        doc.save(nomeArquivo);
      } catch (err) {
        console.error('Erro ao gerar PDF:', err);
        setErroPdf('Ocorreu um erro ao gerar o documento PDF. Verifique os dados preenchidos.');
      } finally {
        setGerando(false);
      }
    }, 200);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-slate-200/80 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Fase 6 • Emissão de Relatórios & Laudos Oficiais
          </span>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2 mt-0.5">
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">Central de Emissão de Documentos PDF: {areaAtiva.nomeTalhao}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Geração local offline de 13 modelos profissionais com cabeçalho oficial, memória de cálculo e ART
          </p>
        </div>

        <button
          type="button"
          onClick={handleEmitirPdf}
          disabled={gerando}
          className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition flex items-center gap-1.5 self-start md:self-auto disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{gerando ? 'Gerando PDF...' : 'Baixar Relatório PDF'}</span>
        </button>
      </div>

      {erroPdf && (
        <div className="px-3.5 py-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{erroPdf}</span>
        </div>
      )}

      {/* Grid: 13 Modelos e Prévia */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 space-y-1.5">
          {RELATORIOS_DISPONIVEIS.map(rel => {
            const Icon = rel.icon;
            const isSelected = relatorioSelecionado === rel.id;
            return (
              <button
                key={rel.id}
                type="button"
                onClick={() => setRelatorioSelecionado(rel.id)}
                className={`w-full text-left p-3 rounded-xl border transition text-xs ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
                    : 'border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-300 dark:hover:border-emerald-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <Icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                    {rel.nome}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 pl-5.5">
                  {rel.desc}
                </p>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-xl p-5 border border-slate-200/80 dark:border-zinc-800 space-y-4 text-xs h-fit">
          <div className="border-b border-slate-200/70 dark:border-zinc-800 pb-3">
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Documento Selecionado
            </span>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-1">
              {modeloAtivo?.nome}
            </h3>
            <p className="text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
              {modeloAtivo?.desc}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800 space-y-1.5 text-[11px] text-slate-600 dark:text-zinc-400">
            <p className="font-semibold text-slate-800 dark:text-zinc-200">
              Dados Inclusos no Documento:
            </p>
            <p>
              • Identificação da fazenda ({propriedade.nome || 'N/I'}) e produtor ({propriedade.produtorNome || 'N/I'})
            </p>
            <p className="tabular-nums">
              • Caracterização territorial: Talhão {areaAtiva.nomeTalhao} ({areaAtiva.areaHa} ha)
            </p>
            <p>
              • Diagnóstico e Severidade: {areaAtiva.tipoDegradacao.replace(/_/g, ' ').toUpperCase()} ({areaAtiva.grauSeveridade.replace(/_/g, ' ').toUpperCase()})
            </p>
            <p>
              • Responsável Técnico: {propriedade.responsavelTecnico || 'Eng. Agrônomo'} (CREA: {propriedade.creaNumero || 'N/I'})
            </p>
            <p>• Memória de cálculo agronômica auditável e tabelas orçamentárias</p>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
              Observações e Parecer Técnico Complementar (Opcional)
            </label>
            <textarea
              value={obsPersonalizada}
              onChange={e => setObsPersonalizada(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
              placeholder="Digite recomendações adicionais ou ressalvas específicas para constarem no rodapé do laudo..."
            />
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={handleEmitirPdf}
              disabled={gerando}
              className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{gerando ? 'Gerando Laudo PDF...' : 'Gerar e Fazer Download do Laudo Oficial'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
