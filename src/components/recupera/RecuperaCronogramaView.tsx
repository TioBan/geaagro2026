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

export const RecuperaCronogramaView: React.FC<Props> = ({
  areaAtiva,
  cronogramas,
  onSalvarCronogramas
}) => {
  const [salvo, dispararSalvo] = useTimedFlag(3000);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novaEtapa, setNovaEtapa] = useState('Preparo e Descompactação');
  const [novoResponsavel, setNovoResponsavel] = useState(areaAtiva.responsavelTecnico || 'Equipe Agronômica');
  const [novaDataInicio, setNovaDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [novaDataFim, setNovaDataFim] = useState(new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]);
  const [novoCustoPrevisto, setNovoCustoPrevisto] = useState<number>(3500);

  useEffect(() => {
    setNovoResponsavel(areaAtiva.responsavelTecnico || 'Equipe Agronômica');
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
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Fase 6 • Gestão Operacional & Prazos
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <span>Cronograma Físico de Operações: {areaAtiva.nomeTalhao}</span>
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhamento de janelas operacionais, responsáveis, progresso de execução e status
          </p>
        </div>
      </div>

      {salvo && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Atividade adicionada ao cronograma com sucesso!</span>
        </div>
      )}

      {/* Formulário de Nova Atividade */}
      <form onSubmit={handleAdicionarAtividade} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <Plus className="w-4 h-4 text-emerald-600" />
          <span>Adicionar Atividade ao Cronograma</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Nome da Atividade *</label>
            <input
              type="text"
              value={novoTitulo}
              onChange={e => setNovoTitulo(e.target.value)}
              placeholder="Ex: Escarificação do talhão com trator 140 cv"
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Etapa Geral</label>
            <select
              value={novaEtapa}
              onChange={e => setNovaEtapa(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
            >
              <option value="Preparo e Descompactação">Preparo e Descompactação</option>
              <option value="Calagem e Gessagem">Calagem e Gessagem</option>
              <option value="Conservação Mecânica">Conservação Mecânica (Terraços)</option>
              <option value="Semeadura / Plantio">Semeadura / Plantio</option>
              <option value="Tratos Culturais & Monitoramento">Tratos Culturais & Monitoramento</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Responsável</label>
            <input
              type="text"
              value={novoResponsavel}
              onChange={e => setNovoResponsavel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Data Início</label>
            <input
              type="date"
              value={novaDataInicio}
              onChange={e => setNovaDataInicio(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Data Término</label>
            <input
              type="date"
              value={novaDataFim}
              onChange={e => setNovaDataFim(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Custo Estimado (R$)</label>
            <input
              type="number"
              value={novoCustoPrevisto}
              onChange={e => setNovoCustoPrevisto(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow"
          >
            <Save className="w-4 h-4" />
            <span>Salvar no Cronograma</span>
          </button>
        </div>
      </form>

      {/* Lista de Atividades com Barra de Progresso */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
        <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
          Atividades Programadas ({cronogramas.length})
        </h3>

        {cronogramas.length === 0 ? (
          <p className="text-center py-8 text-slate-400">Nenhuma atividade programada para este talhão ainda.</p>
        ) : (
          <div className="space-y-3">
            {cronogramas.map(ativ => (
              <div key={ativ.id} className="p-4 bg-slate-50/60 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                      {ativ.etapaGeral}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{ativ.titulo}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoverAtividade(ativ.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-500 text-[11px]">
                  <span>Responsável: <strong>{ativ.responsavelNome}</strong></span>
                  <span>Janela: <strong>{ativ.dataInicio} a {ativ.dataFim}</strong></span>
                  <span>Orçamento: <strong>R$ {ativ.custoPrevistoR$.toFixed(2)}</strong></span>
                  <span>Status: <strong className="capitalize">{ativ.status.replace('_', ' ')}</strong></span>
                </div>

                {/* Barra de Progresso Interativa */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500">Progresso da Operação</span>
                    <span className="font-bold text-emerald-600">{ativ.progressoPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={ativ.progressoPct}
                    onChange={e => handleAtualizarProgresso(ativ.id, parseInt(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
