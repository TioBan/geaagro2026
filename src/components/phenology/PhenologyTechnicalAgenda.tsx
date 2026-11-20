import React, { useState } from 'react';
import { Calendar, Plus, CheckCircle2, Circle, Trash2, ClipboardList } from 'lucide-react';
import {
  TechnicalScheduleItem,
  CropDigitalTwin,
  PhenologicalStage
} from '../../types/phenology';

interface PhenologyTechnicalAgendaProps {
  currentTwin: CropDigitalTwin;
  stages: PhenologicalStage[];
  schedules: TechnicalScheduleItem[];
  onAddSchedule: (item: TechnicalScheduleItem) => void;
  onToggleStatus: (id: string) => void;
  onDeleteSchedule: (id: string) => void;
  onGenerateStageSchedules: () => void;
}

const inputClass =
  'w-full h-9 px-3 mt-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500';

export const PhenologyTechnicalAgenda: React.FC<PhenologyTechnicalAgendaProps> = ({
  currentTwin,
  stages,
  schedules,
  onAddSchedule,
  onToggleStatus,
  onDeleteSchedule,
  onGenerateStageSchedules
}) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetStageCode, setTargetStageCode] = useState(currentTwin.currentStageCode || 'R1');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<TechnicalScheduleItem['priority']>('alta');
  const [operationType, setOperationType] =
    useState<TechnicalScheduleItem['operationType']>('monitoramento_mip');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const matchedStage = stages.find(s => s.code === targetStageCode);
    onAddSchedule({
      id: `sched-${Date.now()}`,
      twinId: currentTwin.id,
      plotName: currentTwin.plotName,
      targetStageCode,
      targetDap: matchedStage ? matchedStage.dapRange[0] : currentTwin.currentDap,
      scheduledDate,
      operationType,
      title: title.trim(),
      description: description.trim() || 'Atividade técnica programada.',
      status: 'pendente',
      priority
    });

    setTitle('');
    setDescription('');
    setShowForm(false);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Cronograma Fenológico de Operações — {currentTwin.plotName}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Atividades técnicas vinculadas ao estádio fenológico (DAP) e soma térmica acumulada (GDD).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onGenerateStageSchedules}
            className="h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <ClipboardList className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Sugerir p/ {currentTwin.currentStageCode}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowForm(prev => !prev)}
            className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Atividade</span>
          </button>
        </div>
      </div>

      {/* Inline New Activity Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800 space-y-3 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="font-medium text-slate-600 dark:text-zinc-300">Título da Operação</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Aplicação preventiva de fungicida + Boro"
                className={inputClass}
              />
            </div>

            <div>
              <label className="font-medium text-slate-600 dark:text-zinc-300">Estádio Alvo</label>
              <select
                value={targetStageCode}
                onChange={e => setTargetStageCode(e.target.value)}
                className={inputClass}
              >
                {stages.map(s => (
                  <option key={s.id} value={s.code}>
                    {s.code} ({s.dapRange[0]}–{s.dapRange[1]} DAP)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-600 dark:text-zinc-300">Data Prevista</label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                className={`${inputClass} tabular-nums`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-medium text-slate-600 dark:text-zinc-300">Tipo de Operação</label>
              <select
                value={operationType}
                onChange={e =>
                  setOperationType(e.target.value as TechnicalScheduleItem['operationType'])
                }
                className={inputClass}
              >
                <option value="monitoramento_mip">Monitoramento MIP</option>
                <option value="adubacao_cobertura">Adubação / Foliar</option>
                <option value="aplicacao_fitossanitaria">Aplicação Fitossanitária</option>
                <option value="irrigacao_estrategica">Irrigação Estratégica</option>
                <option value="diagnose_foliar">Diagnose Foliar</option>
                <option value="dessecacao_colheita">Dessecação / Colheita</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-600 dark:text-zinc-300">Prioridade</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TechnicalScheduleItem['priority'])}
                className={inputClass}
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-600 dark:text-zinc-300">Detalhes</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Dose, alvo ou recomendação técnica..."
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-medium hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer"
            >
              Adicionar
            </button>
          </div>
        </form>
      )}

      {/* Schedule List or Empty State */}
      {schedules.length === 0 ? (
        <div className="text-center py-10 bg-slate-50/70 dark:bg-zinc-950/60 rounded-xl border border-slate-200/70 dark:border-zinc-800 space-y-2.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Calendar className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-zinc-200">
            Nenhuma atividade técnica agendada para esta lavoura
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
            Gere automaticamente as operações recomendadas para o estádio {currentTwin.currentStageCode} ou cadastre uma nova atividade manualmente.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {schedules.map(item => {
            const isDone = item.status === 'concluido';
            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                  isDone
                    ? 'bg-slate-50/50 dark:bg-zinc-950/40 border-slate-200/60 dark:border-zinc-800/70 opacity-75'
                    : 'bg-slate-50/70 dark:bg-zinc-950/60 border-slate-200/80 dark:border-zinc-800'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => onToggleStatus(item.id)}
                    title={isDone ? 'Marcar como pendente' : 'Marcar como concluída'}
                    className="mt-0.5 text-emerald-600 dark:text-emerald-400 hover:opacity-80 shrink-0 cursor-pointer"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-900/60 font-semibold text-[10px] px-1.5 py-0.5 rounded tabular-nums">
                        {item.targetStageCode} ({item.targetDap} DAP)
                      </span>
                      <strong
                        className={`font-semibold text-slate-900 dark:text-white ${
                          isDone ? 'line-through text-slate-500 dark:text-zinc-500' : ''
                        }`}
                      >
                        {item.title}
                      </strong>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-400">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 tabular-nums">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                    {item.scheduledDate}
                  </span>
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                      item.priority === 'urgente'
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
                        : item.priority === 'alta'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                    }`}
                  >
                    {item.priority}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteSchedule(item.id)}
                    title="Remover atividade"
                    className="h-7 w-7 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
