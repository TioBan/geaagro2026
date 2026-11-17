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
  const [sucesso, setSucesso] = useState(false);
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

  const agendarLimpezaSucesso = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSucesso(false), 3000);
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
      setSucesso(true);
      agendarLimpezaSucesso();
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
    setSucesso(true);
    agendarLimpezaSucesso();
  };

  const precoMedioPorHa = Math.round(avaliacao.valorFinalImovelR$ / (propriedade.areaTotalHa || 1));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Emissão & Conclusão do Laudo Técnico (NBR 14653-3)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Revisão final dos valores apurados, redação conclusiva e download do documento pericial oficial em PDF
          </p>
        </div>

        <div className="flex items-center gap-2">
          {sucesso && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mr-2">
              <CheckCircle2 className="w-4 h-4" /> Laudo Emitido!
            </span>
          )}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={gerandoPdf}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {gerandoPdf ? 'Gerando Relatório...' : 'Baixar Laudo Oficial (PDF)'}
          </button>
        </div>
      </div>

      {erroPdf && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{erroPdf}</span>
        </div>
      )}

      {/* Card Executivo de Valores */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 rounded-2xl border border-emerald-500/30 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Síntese da Avaliação Mercadológica
            </span>
            <h3 className="text-2xl font-bold tracking-tight text-white mt-0.5">
              {propriedade.nome}
            </h3>
            <p className="text-xs text-slate-300">
              {propriedade.municipio} - {propriedade.estado} • Matrícula {propriedade.numeroMatricula} • {propriedade.areaTotalHa.toLocaleString('pt-BR')} ha
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block uppercase">Código do Laudo</span>
            <span className="text-sm font-mono font-bold text-emerald-300">{avaliacao.codigoLaudo}</span>
          </div>
        </div>

        {/* Breakdown Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
              1. Terra Nua Homogeneizada (VTN)
            </span>
            <p className="text-xl font-bold text-slate-100 mt-1">
              R$ {avaliacao.valorTotalHomogeneizadoR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Média: R$ {Math.round(avaliacao.valorTotalHomogeneizadoR$ / (propriedade.areaTotalHa || 1)).toLocaleString('pt-BR')}/ha
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
              2. Benfeitorias Depreciadas (R-H)
            </span>
            <p className="text-xl font-bold text-slate-100 mt-1">
              R$ {avaliacao.valorTotalBenfeitoriasR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {benfeitorias.length} construções & equipamentos avaliados
            </p>
          </div>

          <div className="bg-emerald-950/60 p-4 rounded-xl border border-emerald-500/50">
            <span className="text-[11px] uppercase tracking-wider text-emerald-400 block font-bold">
              VALOR TOTAL CONCLUÍDO DO IMÓVEL
            </span>
            <p className="text-2xl font-extrabold text-emerald-300 mt-1">
              R$ {avaliacao.valorFinalImovelR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-emerald-400 mt-0.5 font-semibold">
              R$ {precoMedioPorHa.toLocaleString('pt-BR')}/ha global
            </p>
          </div>
        </div>

        {/* Faixa Admissível de Tolerância ±15% */}
        <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-300">
          <span>
            <strong>Campo de Arbítrio Admissível (±15%):</strong> R$ {avaliacao.intervaloAdmissivelMinR$.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} a R$ {avaliacao.intervaloAdmissivelMaxR$.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </span>
          <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
            {avaliacao.grauFundamentacao} • {avaliacao.grauPrecisao}
          </span>
        </div>
      </div>

      {/* Editor da Conclusão do Laudo */}
      <form onSubmit={handleSalvarConclusao} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
          <Award className="w-4 h-4 text-emerald-500" />
          Conclusão Formal do Laudo Pericial
        </h3>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Parecer Conclusivo do Avaliador (incorporado à página final do laudo)
          </label>
          <textarea
            rows={4}
            value={conclusaoTexto}
            onChange={(e) => setConclusaoTexto(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white leading-relaxed"
          />
        </div>

        {/* Responsável Técnico e ART */}
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              {solicitante.profissionalResponsavel}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {solicitante.creaNumero} • ART nº {solicitante.artNumero}
            </span>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-medium rounded-lg text-xs transition-colors"
          >
            Salvar Conclusão
          </button>
        </div>
      </form>
    </div>
  );
};
