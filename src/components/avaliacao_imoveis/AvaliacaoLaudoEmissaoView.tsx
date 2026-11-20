import React, { useState, useEffect, useRef } from 'react';
import {
  PropriedadeRuralAvaliacao,
  SolicitanteAvaliacao,
  BenfeitoriaItem,
  ImovelComparativoMercado,
  VistoriaTecnica,
  AvaliacaoCompletaImovel
} from '../../types/avaliacaoImoveis';
import {
  FileText,
  Download,
  CheckCircle2,
  Award,
  AlertCircle
} from 'lucide-react';

interface Props {
  propriedade: PropriedadeRuralAvaliacao;
  solicitante: SolicitanteAvaliacao;
  benfeitorias: BenfeitoriaItem[];
  comparativos: ImovelComparativoMercado[];
  vistoria: VistoriaTecnica;
  avaliacao: AvaliacaoCompletaImovel;
  onSalvarConclusao: (conclusao: string, ressalvas: string[]) => void;
}

export const AvaliacaoLaudoEmissaoView: React.FC<Props> = ({
  propriedade,
  solicitante,
  benfeitorias,
  comparativos,
  vistoria,
  avaliacao,
  onSalvarConclusao
}) => {
  const [conclusaoTexto, setConclusaoTexto] = useState(avaliacao.conclusaoLaudo);
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState<string | null>(null);
  const [erroPdf, setErroPdf] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setConclusaoTexto(avaliacao.conclusaoLaudo);
  }, [avaliacao.conclusaoLaudo]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const mostrarStatus = (msg: string) => {
    setMensagemStatus(msg);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setMensagemStatus(null), 3000);
  };

  const handleDownloadPdf = async () => {
    setGerandoPdf(true);
    setErroPdf(null);
    try {
      const { gerarLaudoAvaliacaoPdf } = await import('../../utils/avaliacaoImoveisPdfGenerator');
      const doc = gerarLaudoAvaliacaoPdf({
        propriedade,
        solicitante,
        benfeitorias,
        comparativos,
        vistoria,
        avaliacao: {
          ...avaliacao,
          conclusaoLaudo: conclusaoTexto
        }
      });
      const nomeArquivo = `Laudo_NBR14653_${avaliacao.codigoLaudo}_${(propriedade.nome || 'Imovel').replace(/\s+/g, '_')}.pdf`;
      doc.save(nomeArquivo);
      mostrarStatus('Laudo PDF gerado');
    } catch (err) {
      console.error('Erro ao gerar laudo em PDF:', err);
      setErroPdf('Não foi possível gerar o laudo PDF. Verifique os dados cadastrados e tente novamente.');
    } finally {
      setGerandoPdf(false);
    }
  };

  const handleSalvarConclusao = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvarConclusao(conclusaoTexto, avaliacao.ressalvasLimitacoes);
    mostrarStatus('Conclusão salva');
  };

  const precoMedioPorHa = Math.round(avaliacao.valorFinalImovelR$ / (propriedade.areaTotalHa || 1));
  const vtnPorHa = Math.round(avaliacao.valorTotalHomogeneizadoR$ / (propriedade.areaTotalHa || 1));

  return (
    <div className="space-y-5">
      {/* Barra de Ação Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Emissão & Conclusão do Laudo Técnico (NBR 14653-3)
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Revisão final dos valores apurados, redação conclusiva e download do documento pericial em PDF
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {mensagemStatus && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {mensagemStatus}
            </span>
          )}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={gerandoPdf}
            className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {gerandoPdf ? 'Gerando PDF...' : 'Baixar Laudo (PDF)'}
          </button>
        </div>
      </div>

      {erroPdf && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/70 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{erroPdf}</span>
        </div>
      )}

      {/* Síntese Executiva de Valores */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Síntese da Avaliação Mercadológica
            </span>
            <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100 mt-0.5">
              {propriedade.nome || 'Imóvel Rural'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {propriedade.municipio || 'Município'}
              {propriedade.estado ? ` - ${propriedade.estado}` : ''}
              {propriedade.numeroMatricula ? ` · Matrícula ${propriedade.numeroMatricula}` : ''}
              {' · '}
              <span className="tabular-nums">{propriedade.areaTotalHa.toLocaleString('pt-BR')} ha</span>
            </p>
          </div>

          <div className="md:text-right">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block uppercase tracking-wider">
              Código do Laudo
            </span>
            <span className="text-sm font-mono font-semibold text-slate-900 dark:text-zinc-100">
              {avaliacao.codigoLaudo}
            </span>
          </div>
        </div>

        {/* Breakdown Financeiro em Hairline Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-slate-200/80 dark:border-zinc-800 divide-y md:divide-y-0 md:divide-x divide-slate-200/80 dark:divide-zinc-800">
          <div className="p-4">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
              1. Terra Nua Homogeneizada (VTN)
            </span>
            <p className="text-lg font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-1">
              R$ {avaliacao.valorTotalHomogeneizadoR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
              Média: R$ {vtnPorHa.toLocaleString('pt-BR')}/ha
            </p>
          </div>

          <div className="p-4">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
              2. Benfeitorias Depreciadas (R-H)
            </span>
            <p className="text-lg font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-1">
              R$ {avaliacao.valorTotalBenfeitoriasR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
              {benfeitorias.length} construções e equipamentos avaliados
            </p>
          </div>

          <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20">
            <span className="text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block font-semibold">
              Valor Total Concluído
            </span>
            <p className="text-xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400 mt-1">
              R$ {avaliacao.valorFinalImovelR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-0.5 font-medium tabular-nums">
              R$ {precoMedioPorHa.toLocaleString('pt-BR')}/ha global
            </p>
          </div>
        </div>

        {/* Faixa Admissível de Tolerância ±15% */}
        <div className="px-5 py-3 border-t border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 dark:text-zinc-300">
          <span className="tabular-nums">
            <strong className="text-slate-900 dark:text-zinc-100">Campo de Arbítrio (±15%):</strong>{' '}
            R$ {avaliacao.intervaloAdmissivelMinR$.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} a R${' '}
            {avaliacao.intervaloAdmissivelMaxR$.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60 w-fit">
            {avaliacao.grauFundamentacao} · {avaliacao.grauPrecisao}
          </span>
        </div>
      </div>

      {/* Editor da Conclusão do Laudo */}
      <form
        onSubmit={handleSalvarConclusao}
        className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-4"
      >
        <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
          <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Conclusão Formal do Laudo Pericial
        </h3>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
            Parecer Conclusivo do Avaliador (incorporado à página final do laudo)
          </label>
          <textarea
            rows={4}
            value={conclusaoTexto}
            onChange={(e) => setConclusaoTexto(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>

        {/* Responsável Técnico e ART */}
        <div className="p-3.5 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-semibold text-slate-900 dark:text-zinc-100 block">
              {solicitante.profissionalResponsavel || 'Responsável técnico não informado'}
            </span>
            <span className="text-slate-500 dark:text-zinc-400">
              {solicitante.creaNumero || 'CREA não informado'} · ART nº {solicitante.artNumero || '—'}
            </span>
          </div>

          <button
            type="submit"
            className="h-8 px-3.5 bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-zinc-900 font-medium rounded-lg text-xs transition-colors shrink-0"
          >
            Salvar Conclusão
          </button>
        </div>
      </form>
    </div>
  );
};
