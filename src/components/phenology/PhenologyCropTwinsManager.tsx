import React from 'react';
import { Sliders, PlusCircle } from 'lucide-react';
import { CropDigitalTwin } from '../../types/phenology';

interface PhenologyCropTwinsManagerProps {
  twins: CropDigitalTwin[];
  selectedTwinId: string;
  onSelectTwin: (id: string) => void;
  onOpenNewTwinModal: () => void;
}

export const PhenologyCropTwinsManager: React.FC<PhenologyCropTwinsManagerProps> = ({
  twins,
  selectedTwinId,
  onSelectTwin,
  onOpenNewTwinModal,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-600" />
              Lavouras e Cultivares com Gêmeo Digital Ativo
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Gerencie as áreas monitoradas pela inteligência fenológica da plataforma.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenNewTwinModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            Cadastrar Nova Lavoura
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {twins.map(t => (
            <div
              key={t.id}
              onClick={() => onSelectTwin(t.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                selectedTwinId === t.id
                  ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t.plotName}</h4>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{t.cultivarName}</span>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {t.currentStageCode}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-600 dark:text-zinc-400">
                <div>Área: <strong>{t.plotAreaHa} ha</strong> • Sistema: <strong>{t.cultivationSystem.replace('_', ' ')}</strong></div>
                <div>Plantio: <strong>{t.plantingDate}</strong> ({t.currentDap} DAP)</div>
                <div>População: <strong>{t.plantPopulationPerHa.toLocaleString('pt-BR')} pl/ha</strong></div>
              </div>

              <div className="pt-2 border-t border-slate-200/50 dark:border-zinc-800 flex justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <span>IDC: {t.idcScore}/100</span>
                <span>Ciclo: {t.cycleProgressPercent}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
