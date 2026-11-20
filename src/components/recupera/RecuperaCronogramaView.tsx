import React, { useState, useEffect } from 'react';
import { AreaDegradadaItem, AtividadeCronograma } from '../../types/recupera';
import { useTimedFlag } from './useTimedFlag';
import {
  Calendar,
  Plus,
  Trash2,
  Save,
  CheckCircle2
} from 'lucide-react';

interface Props {
  areaAtiva: AreaDegradadaItem;
  cronogramas: AtividadeCronograma[];
  onSalvarCronogramas: (atividades: AtividadeCronograma[]) => void;
}

const INPUT_CLASS =
  'w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500';

const LABEL_CLASS =
  'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

const STATUS_BADGE: Record<AtividadeCronograma['status'], { label: string; cls: string }> = {
  nao_iniciada: {
    label: 'Não iniciada',
    cls: 'border-slate-200 dark:border-zinc-700 bg-slate-100/80 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
  },
  em_andamento: {
    label: 'Em andamento',
    cls: 'border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
  },
  concluida: {
    label: 'Concluída',
    cls: 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
  },
  atrasada: {
    label: 'Atrasada',
    cls: 'border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
  }
};

export const RecuperaCronogramaView: React.FC<Props> = ({
  areaAtiva,
  cronogramas,
  onSalvarCronogramas
}) => {
  const [salvo, dispararSalvo] = useTimedFlag(3000);
  const [confirmandoExcluirId, setConfirmandoExcluirId] = useState<string | null>(null);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novaEtapa, setNovaEtapa] = useState('Preparo e Descompactação');
  const [novoResponsavel, setNovoResponsavel] = useState(areaAtiva.responsavelTecnico || 'Equipe Agronômica');
  const [novaDataInicio, setNovaDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [novaDataFim, setNovaDataFim] = useState(new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]);
  const [novoCustoPrevisto, setNovoCustoPrevisto] = useState<number>(3500);

  useEffect(() => {
    setNovoResponsavel(areaAtiva.responsavelTecnico || 'Equipe Agronômica');
    setConfirmandoExcluirId(null);
  }, [areaAtiva.id, areaAtiva.responsavelTecnico]);

  const handleAdicionarAtividade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim()) return;

    const nova: AtividadeCronograma = {
      id: `ativ-${Date.now()}`,
      projetoId: `proj-${areaAtiva.id}`,
      titulo: novoTitulo.trim(),
      etapaGeral: novaEtapa,
      responsavelNome: novoResponsavel,
      dataInicio: novaDataInicio,
      dataFim: novaDataFim,
      progressoPct: 0,
      status: 'nao_iniciada',
      custoPrevistoR$: novoCustoPrevisto,
      custoRealizadoR$: 0,
      observacoes: ''
    };

    onSalvarCronogramas([...cronogramas, nova]);
    setNovoTitulo('');
    dispararSalvo();
  };

  const handleAtualizarProgresso = (id: string, novoProgresso: number) => {
    const atualizadas = cronogramas.map(a => {
      if (a.id === id) {
        let status: AtividadeCronograma['status'] = 'em_andamento';
        if (novoProgresso >= 100) status = 'concluida';
        else if (novoProgresso === 0) status = 'nao_iniciada';
        return { ...a, progressoPct: novoProgresso, status };
      }
      return a;
    });
    onSalvarCronogramas(atualizadas);
  };

  const handleRemoverAtividade = (id: string) => {
    onSalvarCronogramas(cronogramas.filter(a => a.id !== id));
    setConfirmandoExcluirId(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-slate-200/80 dark:border-zinc-800">
        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
          Fase 6 • Gestão Operacional & Prazos
        </span>
        <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2 mt-0.5">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="truncate">Cronograma Físico de Operações: {areaAtiva.nomeTalhao}</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Acompanhamento de janelas operacionais, responsáveis, progresso de execução e status
        </p>
      </div>

      {salvo && (
        <div className="px-3.5 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Atividade adicionada ao cronograma com sucesso.</span>
        </div>
      )}

      {/* Formulário de Nova Atividade */}
      <form
        onSubmit={handleAdicionarAtividade}
        className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-slate-200/80 dark:border-zinc-800 space-y-3.5"
      >
        <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 border-b border-slate-200/70 dark:border-zinc-800 pb-2.5">
          <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Adicionar Atividade ao Cronograma</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS}>Nome da Atividade *</label>
            <input
              type="text"
              value={novoTitulo}
              onChange={e => setNovoTitulo(e.target.value)}
              placeholder="Ex: Escarificação do talhão com trator 140 cv"
              required
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Etapa Geral</label>
            <select
              value={novaEtapa}
              onChange={e => setNovaEtapa(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="Preparo e Descompactação">Preparo e Descompactação</option>
              <option value="Calagem e Gessagem">Calagem e Gessagem</option>
              <option value="Conservação Mecânica">Conservação Mecânica (Terraços)</option>
              <option value="Semeadura / Plantio">Semeadura / Plantio</option>
              <option value="Tratos Culturais & Monitoramento">Tratos Culturais & Monitoramento</option>
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS}>Responsável</label>
            <input
              type="text"
              value={novoResponsavel}
              onChange={e => setNovoResponsavel(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={LABEL_CLASS}>Data Início</label>
            <input
              type="date"
              value={novaDataInicio}
              onChange={e => setNovaDataInicio(e.target.value)}
              className={`${INPUT_CLASS} tabular-nums`}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Data Término</label>
            <input
              type="date"
              value={novaDataFim}
              onChange={e => setNovaDataFim(e.target.value)}
              className={`${INPUT_CLASS} tabular-nums`}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Custo Estimado (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={novoCustoPrevisto}
              onChange={e => setNovoCustoPrevisto(parseFloat(e.target.value) || 0)}
              className={`${INPUT_CLASS} font-semibold tabular-nums`}
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar no Cronograma</span>
          </button>
        </div>
      </form>

      {/* Lista de Atividades */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-slate-200/80 dark:border-zinc-800 space-y-3">
        <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 border-b border-slate-200/70 dark:border-zinc-800 pb-2.5 tabular-nums">
          Atividades Programadas ({cronogramas.length})
        </h3>

        {cronogramas.length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-400 dark:text-zinc-500">
            Nenhuma atividade programada para este talhão ainda.
          </p>
        ) : (
          <div className="space-y-2.5">
            {cronogramas.map(ativ => {
              const badge = STATUS_BADGE[ativ.status] || STATUS_BADGE.nao_iniciada;
              return (
                <div
                  key={ativ.id}
                  className="p-3.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                          {ativ.etapaGeral}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>
                      <h4 className="font-semibold text-slate-900 dark:text-zinc-100 text-xs mt-1">
                        {ativ.titulo}
                      </h4>
                    </div>

                    {confirmandoExcluirId === ativ.id ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRemoverAtividade(ativ.id)}
                          className="h-7 px-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-medium transition"
                        >
                          Confirmar
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmandoExcluirId(null)}
                          className="h-7 px-2 rounded-md border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 text-[11px] font-medium hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmandoExcluirId(ativ.id)}
                        title="Remover atividade"
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-500 dark:text-zinc-400 text-[11px] tabular-nums">
                    <span>
                      Responsável:{' '}
                      <strong className="text-slate-800 dark:text-zinc-200">{ativ.responsavelNome}</strong>
                    </span>
                    <span>
                      Janela:{' '}
                      <strong className="text-slate-800 dark:text-zinc-200">
                        {ativ.dataInicio} a {ativ.dataFim}
                      </strong>
                    </span>
                    <span>
                      Orçamento:{' '}
                      <strong className="text-slate-800 dark:text-zinc-200">
                        R$ {ativ.custoPrevistoR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </strong>
                    </span>
                  </div>

                  <div className="space-y-1 pt-0.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500 dark:text-zinc-400">Progresso da Operação</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        {ativ.progressoPct}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="10"
                      value={ativ.progressoPct}
                      onChange={e => handleAtualizarProgresso(ativ.id, parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
