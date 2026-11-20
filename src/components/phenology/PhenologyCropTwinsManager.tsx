import React, { useState } from 'react';
import { Sliders, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { CropDigitalTwin } from '../../types/phenology';

interface PhenologyCropTwinsManagerProps {
  twins: CropDigitalTwin[];
  selectedTwinId: string;
  onSelectTwin: (id: string) => void;
  onOpenNewTwinModal: () => void;
  onDeleteTwin?: (id: string) => void;
}

export const PhenologyCropTwinsManager: React.FC<PhenologyCropTwinsManagerProps> = ({
  twins,
  selectedTwinId,
  onSelectTwin,
  onOpenNewTwinModal,
  onDeleteTwin
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Lavouras & Cultivares Monitoradas ({twins.length})</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Selecione um talhão ativo para acompanhar a evolução fenológica ou cadastre novas áreas.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewTwinModal}
          className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Lavoura</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {twins.map(t => {
          const isSelected = selectedTwinId === t.id;
          return (
            <div
              key={t.id}
              onClick={() => onSelectTwin(t.id)}
              className={`p-4 rounded-xl border transition-colors cursor-pointer space-y-3 ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 hover:border-slate-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {t.plotName}
                    </h3>
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium block truncate">
                    {t.cropName} • {t.cultivarName}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-900/60">
                    {t.currentStageCode}
                  </span>

                  {onDeleteTwin && (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setConfirmDeleteId(confirmDeleteId === t.id ? null : t.id);
                      }}
                      title="Remover lavoura"
                      className="h-7 w-7 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {confirmDeleteId === t.id && onDeleteTwin && (
                <div
                  onClick={e => e.stopPropagation()}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs"
                >
                  <span className="text-rose-700 dark:text-rose-300 font-medium">Excluir lavoura?</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="h-6 px-2 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 text-[11px] cursor-pointer"
                    >
                      Não
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteTwin(t.id);
                        setConfirmDeleteId(null);
                      }}
                      className="h-6 px-2 rounded bg-rose-600 text-white text-[11px] cursor-pointer"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1 text-xs text-slate-600 dark:text-zinc-400 tabular-nums">
                <div>
                  Área: <strong className="text-slate-900 dark:text-white">{t.plotAreaHa} ha</strong> • Sistema:{' '}
                  <strong className="text-slate-900 dark:text-white capitalize">
                    {t.cultivationSystem.replace(/_/g, ' ')}
                  </strong>
                </div>
                <div>
                  Plantio: <strong className="text-slate-900 dark:text-white">{t.plantingDate}</strong> ({t.currentDap} DAP)
                </div>
                <div>
                  População:{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {t.plantPopulationPerHa.toLocaleString('pt-BR')} pl/ha
                  </strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/70 dark:border-zinc-800 flex justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                <span>IDC: {t.idcScore}/100</span>
                <span>Ciclo: {t.cycleProgressPercent}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
