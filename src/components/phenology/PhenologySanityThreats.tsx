import React from 'react';
import { ShieldAlert, Bug, AlertTriangle } from 'lucide-react';
import { CropDigitalTwin, PhenologicalStage } from '../../types/phenology';

interface PhenologySanityThreatsProps {
  currentTwin: CropDigitalTwin;
  stages: PhenologicalStage[];
}

export const PhenologySanityThreats: React.FC<PhenologySanityThreatsProps> = ({
  currentTwin,
  stages
}) => {
  const activeStage = stages.find(s => s.code === currentTwin.currentStageCode) || stages[0];
  const isVegetative = activeStage?.category === 'vegetativo';
  const isReproductive = activeStage?.category === 'reprodutivo';
  const isMaturation = activeStage?.category === 'maturacao';

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Mapeamento de Pragas & Doenças por Fase — {currentTwin.cropName}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Níveis de atenção fitossanitária e alvos prioritários de MIP para o estádio atual ({currentTwin.currentStageCode}).
          </p>
        </div>

        {/* Active Stage Threats */}
        {activeStage && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/60 space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Bug className="w-3.5 h-3.5" />
                <span>Pragas Prioritárias em {activeStage.code}</span>
              </span>
              {activeStage.sanitaryThreats.frequentPests.length > 0 ? (
                <ul className="list-disc list-inside text-slate-700 dark:text-zinc-200 space-y-0.5">
                  {activeStage.sanitaryThreats.frequentPests.map((pest, idx) => (
                    <li key={idx}>{pest}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-600 dark:text-zinc-400">Baixa pressão de pragas típica neste estádio.</p>
              )}
            </div>

            <div className="p-3.5 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/60 space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Doenças de Alerta em {activeStage.code}</span>
              </span>
              {activeStage.sanitaryThreats.frequentDiseases.length > 0 ? (
                <ul className="list-disc list-inside text-slate-700 dark:text-zinc-200 space-y-0.5">
                  {activeStage.sanitaryThreats.frequentDiseases.map((disease, idx) => (
                    <li key={idx}>{disease}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-600 dark:text-zinc-400">Monitoramento preventivo padrão.</p>
              )}
            </div>
          </div>
        )}

        {/* 3-Phase Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div
            className={`p-3.5 rounded-lg border space-y-1.5 ${
              isVegetative
                ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                : 'bg-slate-50/70 dark:bg-zinc-950/60 border-slate-200/70 dark:border-zinc-800'
            }`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 block">
              Fase Vegetativa (VE – V6){isVegetative ? ' • Fase Atual' : ''}
            </span>
            <h3 className="font-semibold text-slate-900 dark:text-white">Pragas Iniciais & Desfolhadoras</h3>
            <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
              Atenção para lagarta-da-soja e elasmo. Monitorar nível de desfolha (tolerância de até 30% no período vegetativo).
            </p>
          </div>

          <div
            className={`p-3.5 rounded-lg border space-y-1.5 ${
              isReproductive
                ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                : 'bg-slate-50/70 dark:bg-zinc-950/60 border-slate-200/70 dark:border-zinc-800'
            }`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-400 block">
              Fase Reprodutiva (R1 – R5){isReproductive ? ' • Fase Atual' : ''}
            </span>
            <h3 className="font-semibold text-slate-900 dark:text-white">Ferrugem Asiática & Percevejos</h3>
            <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
              Janela de maior suscetibilidade. Tolerância de desfolha cai para 15%. Controle rigoroso de percevejo-marrom com pano de batida.
            </p>
          </div>

          <div
            className={`p-3.5 rounded-lg border space-y-1.5 ${
              isMaturation
                ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                : 'bg-slate-50/70 dark:bg-zinc-950/60 border-slate-200/70 dark:border-zinc-800'
            }`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 block">
              Maturação (R7 – R8){isMaturation ? ' • Fase Atual' : ''}
            </span>
            <h3 className="font-semibold text-slate-900 dark:text-white">Fungos de Final de Ciclo</h3>
            <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
              Phomopsis e Cercospora em caso de chuvas na pré-colheita. Respeitar rigorosamente o período de carência dos defensivos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
