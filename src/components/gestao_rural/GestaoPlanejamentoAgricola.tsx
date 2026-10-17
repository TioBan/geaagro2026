import React, { useState } from 'react';
import {
  Calendar,
  Wheat,
  Clock,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Users,
  Check,
  ListTodo,
  Sparkles,
} from 'lucide-react';
import { SafraAgragricola, TarefaCronograma, TalhaoRural } from '../../types/gestaoRural';

interface GestaoPlanejamentoAgricolaProps {
  safras: SafraAgragricola[];
  cronograma: TarefaCronograma[];
  talhoes: TalhaoRural[];
  onAddSafra: (safra: SafraAgragricola) => void;
  onAddTarefa: (tarefa: TarefaCronograma) => void;
  onToggleChecklistItem: (tarefaId: string, checklistId: string) => void;
}

export const GestaoPlanejamentoAgricola: React.FC<GestaoPlanejamentoAgricolaProps> = ({
  safras,
  cronograma,
  talhoes,
  onAddSafra,
  onAddTarefa,
  onToggleChecklistItem,
}) => {
  const [showAddSafraModal, setShowAddSafraModal] = useState(false);
  const [showAddTarefaModal, setShowAddTarefaModal] = useState(false);

  // New Safra Form State
  const [newSafra, setNewSafra] = useState<Partial<SafraAgragricola>>({
    nomeSafra: '',
    anoAgricola: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
    cultura: 'Soja',
    cultivar: '',
    talhaoId: talhoes[0]?.id || '',
    areaHa: 0,
    sistemaCultivo: 'Plantio Direto',
    cicloDias: 115,
    dataPrevistaPlantio: new Date().toISOString().split('T')[0],
    dataPrevistaColheita: '',
    metaProdutividadeSacasHa: 0,
    status: 'planejada',
  });

  // New Task Form State
  const [newTarefa, setNewTarefa] = useState<Partial<TarefaCronograma>>({
    titulo: '',
    tipoOperacao: 'Pulverização',
    safraId: safras[0]?.id || '',
    talhaoId: talhoes[0]?.id || '',
    dataPrevista: new Date().toISOString().split('T')[0],
    responsavel: '',
    prioridade: 'media',
    observacoes: '',
  });

  const handleCreateSafra = (e: React.FormEvent) => {
    e.preventDefault();
    const talhao = talhoes.find(t => t.id === newSafra.talhaoId) || talhoes[0];
    const created: SafraAgragricola = {
      id: `safra-${Date.now()}`,
      propriedadeId: 'prop-360-01',
      nomeSafra: newSafra.nomeSafra || 'Safra Verão',
      anoAgricola: newSafra.anoAgricola || '2026/2027',
      cultura: newSafra.cultura || 'Soja',
      cultivar: newSafra.cultivar || 'Padrão',
      talhaoId: talhao?.id || 'tal-01',
      talhaoNome: talhao?.nome || 'Talhão 01',
      areaHa: Number(newSafra.areaHa) || 100,
      sistemaCultivo: newSafra.sistemaCultivo || 'Plantio Direto',
      cicloDias: Number(newSafra.cicloDias) || 120,
      dataPrevistaPlantio: newSafra.dataPrevistaPlantio || '2026-10-15',
      dataPrevistaColheita: newSafra.dataPrevistaColheita || '2027-02-15',
      metaProdutividadeSacasHa: Number(newSafra.metaProdutividadeSacasHa) || 80,
      status: 'planejada',
    };

    onAddSafra(created);
    setShowAddSafraModal(false);
  };

  const handleCreateTarefa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTarefa.titulo) return;
    const talhao = talhoes.find(t => t.id === newTarefa.talhaoId) || talhoes[0];

    const created: TarefaCronograma = {
      id: `tar-${Date.now()}`,
      safraId: newTarefa.safraId || safras[0]?.id || 'safra-01',
      talhaoId: talhao?.id || 'tal-01',
      talhaoNome: talhao?.nome || 'Talhão 01',
      titulo: newTarefa.titulo,
      tipoOperacao: newTarefa.tipoOperacao || 'Operação',
      dataPrevista: newTarefa.dataPrevista || new Date().toISOString().split('T')[0],
      responsavel: newTarefa.responsavel || 'Equipe Agrícola',
      prioridade: (newTarefa.prioridade as any) || 'media',
      status: 'pendente',
      checklist: [
        { id: 'ck-1', item: 'Inspeção de máquinas e EPIs', concluido: false },
        { id: 'ck-2', item: 'Aferição de dosagem de insumos', concluido: false },
        { id: 'ck-3', item: 'Registro climático e GPS no aplicativo', concluido: false },
      ],
      observacoes: newTarefa.observacoes || '',
    };

    onAddTarefa(created);
    setShowAddTarefaModal(false);
  };

  const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase text-[10px] tracking-wider">
            <Calendar className="w-4 h-4" />
            Módulo 2 • Planejamento & Cronograma Operacional
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Planejamento de Safras & Calendário Inteligente
          </h2>
          <p className="text-slate-500">
            Dimensionamento de ciclos, cronograma de tarefas com checklist e acompanhamento por safra
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddSafraModal(true)}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <Wheat className="w-4 h-4" />
            <span>Nova Safra</span>
          </button>
          <button
            onClick={() => setShowAddTarefaModal(true)}
            className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* SAFRAS EM ANDAMENTO & PLANEJADAS */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
        <h3 className="font-black text-sm text-slate-900 dark:text-white border-b pb-2 flex items-center gap-2">
          <Wheat className="w-4 h-4 text-emerald-600" />
          Safras Cadastradas ({safras.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safras.map(s => (
            <div
              key={s.id}
              className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2 relative"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                    {s.anoAgricola}
                  </span>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white mt-1">
                    {s.nomeSafra} ({s.cultura} - {s.cultivar})
                  </h4>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                    s.status === 'colhida'
                      ? 'bg-blue-100 text-blue-800'
                      : s.status === 'em_andamento'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {s.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="block text-slate-400 font-bold">Talhão / Área:</span>
                  <span className="font-bold">
                    {s.talhaoNome} ({s.areaHa} ha)
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold">Meta Produtividade:</span>
                  <span className="font-bold text-emerald-600">
                    {s.metaProdutividadeSacasHa} sc/ha
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold">Data Plantio:</span>
                  <span>
                    {s.dataRealizadaPlantio
                      ? `Realizado: ${s.dataRealizadaPlantio}`
                      : `Previsto: ${s.dataPrevistaPlantio}`}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold">Data Colheita:</span>
                  <span>
                    {s.dataRealizadaColheita
                      ? `Realizado: ${s.dataRealizadaColheita}`
                      : `Previsto: ${s.dataPrevistaColheita}`}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {safras.length === 0 && (
            <div className="col-span-full p-8 text-center bg-slate-50 dark:bg-zinc-800/20 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700 text-slate-500 dark:text-zinc-400">
              Nenhuma safra cadastrada. Clique no botão &ldquo;Nova Safra&rdquo; acima para iniciar o planejamento do ano agrícola.
            </div>
          )}
        </div>
      </div>

      {/* CALENDÁRIO AGRÍCOLA INTELIGENTE (MATRIZ POR MÊS) */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
        <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          Calendário Agrícola Inteligente Por Fase
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold">
                <th className="p-2 text-left">Fase / Operação</th>
                {MESES.map(m => (
                  <th key={m} className="p-2">
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
              <tr>
                <td className="p-2 font-bold text-left">Plantio / Semeadura</td>
                {MESES.map((m, i) => (
                  <td key={m} className="p-2">
                    {i === 1 || i === 9 ? (
                      <span className="inline-block w-3 h-3 rounded-full bg-emerald-500"></span>
                    ) : (
                      '-'
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-2 font-bold text-left">Adubação / Cobertura</td>
                {MESES.map((m, i) => (
                  <td key={m} className="p-2">
                    {i === 2 || i === 10 ? (
                      <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
                    ) : (
                      '-'
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-2 font-bold text-left">Pulverização / MIP</td>
                {MESES.map((m, i) => (
                  <td key={m} className="p-2">
                    {i >= 2 && i <= 4 ? (
                      <span className="inline-block w-3 h-3 rounded-full bg-amber-500"></span>
                    ) : (
                      '-'
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-2 font-bold text-left">Colheita</td>
                {MESES.map((m, i) => (
                  <td key={m} className="p-2">
                    {i === 1 || i === 5 ? (
                      <span className="inline-block w-3 h-3 rounded-full bg-purple-500"></span>
                    ) : (
                      '-'
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CRONOGRAMA OPERACIONAL COM CHECKLIST */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
        <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-emerald-600" />
          Cronograma Operacional & Tarefas Ativas ({cronograma.length})
        </h3>

        <div className="space-y-3">
          {cronograma.map(t => (
            <div
              key={t.id}
              className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900 dark:text-white">
                      {t.titulo}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        t.prioridade === 'urgente'
                          ? 'bg-red-100 text-red-800'
                          : t.prioridade === 'alta'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      Prioridade {t.prioridade}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Talhão: <strong>{t.talhaoNome}</strong> | Responsável:{' '}
                    <strong>{t.responsavel}</strong> | Data Prevista: {t.dataPrevista}
                  </span>
                </div>
              </div>

              {/* CHECKLIST ITEMS */}
              <div className="space-y-1.5 pl-2 border-l-2 border-emerald-500">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Checklist Operacional
                </span>
                {t.checklist.map(ck => (
                  <label
                    key={ck.id}
                    onClick={() => onToggleChecklistItem(t.id, ck.id)}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={ck.concluido}
                      onChange={() => {}}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className={ck.concluido ? 'line-through text-slate-400' : ''}>
                      {ck.item}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          {cronograma.length === 0 && (
            <div className="p-8 text-center bg-slate-50 dark:bg-zinc-800/20 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700 text-slate-500 dark:text-zinc-400">
              Nenhuma tarefa cadastrada no cronograma. Clique no botão &ldquo;Nova Tarefa&rdquo; para programar atividades operacionais.
            </div>
          )}
        </div>
      </div>

      {/* MODALS FOR SAFRA AND TAREFA */}
      {showAddSafraModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-lg w-full space-y-4">
            <h3 className="font-black text-base border-b pb-2">Cadastrar Nova Safra</h3>
            <form onSubmit={handleCreateSafra} className="space-y-3">
              <div>
                <label className="block font-bold">Nome da Safra</label>
                <input
                  type="text"
                  value={newSafra.nomeSafra}
                  onChange={e => setNewSafra({ ...newSafra, nomeSafra: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold">Cultura</label>
                  <input
                    type="text"
                    value={newSafra.cultura}
                    onChange={e => setNewSafra({ ...newSafra, cultura: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold">Cultivar</label>
                  <input
                    type="text"
                    value={newSafra.cultivar}
                    onChange={e => setNewSafra({ ...newSafra, cultivar: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSafraModal(false)}
                  className="px-4 py-2 bg-slate-200 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold"
                >
                  Salvar Safra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddTarefaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-lg w-full space-y-4">
            <h3 className="font-black text-base border-b pb-2">Nova Tarefa Operacional</h3>
            <form onSubmit={handleCreateTarefa} className="space-y-3">
              <div>
                <label className="block font-bold">Título da Tarefa</label>
                <input
                  type="text"
                  placeholder="Ex: Pulverização Fungicida V6"
                  value={newTarefa.titulo}
                  onChange={e => setNewTarefa({ ...newTarefa, titulo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold">Responsável</label>
                  <input
                    type="text"
                    value={newTarefa.responsavel}
                    onChange={e => setNewTarefa({ ...newTarefa, responsavel: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold">Data Prevista</label>
                  <input
                    type="date"
                    value={newTarefa.dataPrevista}
                    onChange={e => setNewTarefa({ ...newTarefa, dataPrevista: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddTarefaModal(false)}
                  className="px-4 py-2 bg-slate-200 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold"
                >
                  Agendar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
