import React from 'react';
import { Calendar } from 'lucide-react';
import { TechnicalScheduleItem } from '../../types/phenology';

interface PhenologyTechnicalAgendaProps {
  schedules: TechnicalScheduleItem[];
}

export const PhenologyTechnicalAgenda: React.FC<PhenologyTechnicalAgendaProps> = ({ schedules }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Cronograma Fenológico de Operações Agronômicas
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Recomendações técnicas de manejo disparadas pelo estádio fenológico (DAP) e soma térmica acumulada (GDD).
          </p>
        </div>

        <div className="space-y-2.5">
          {schedules.map(item => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-[10px] px-2 py-0.5 rounded">
                    Estádio {item.targetStageCode} ({item.targetDap} DAP)
                  </span>
                  <strong className="font-bold text-slate-900 dark:text-white">{item.title}</strong>
                </div>
                <p className="text-slate-600 dark:text-zinc-400">{item.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-slate-500">{item.scheduledDate}</span>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    item.priority === 'urgente'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                  }`}
                >
                  {item.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
