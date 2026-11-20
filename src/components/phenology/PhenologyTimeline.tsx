import React from 'react';
import {
  Activity,
  Droplets,
  Leaf,
  ShieldAlert,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { PhenologicalStage, CropDigitalTwin } from '../../types/phenology';

interface PhenologyTimelineProps {
  currentTwin: CropDigitalTwin;
  stages: PhenologicalStage[];
  selectedStageId: string;
  onSelectStage: (stageId: string) => void;
}

export const PhenologyTimeline: React.FC<PhenologyTimelineProps> = ({
  currentTwin,
  stages,
  selectedStageId,
  onSelectStage
}) => {
  const selectedStage = stages.find(s => s.id === selectedStageId) || stages[0];

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              Escala Fenológica ({currentTwin.cropName})
            </span>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Navegador Fenológico — {currentTwin.cultivarName} ({currentTwin.plotName})
            </h2>
          </div>
          <div className="text-xs text-slate-500 dark:text-zinc-400 shrink-0">
            Estádio atual:{' '}
            <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">
              {currentTwin.currentStageCode}
            </strong>
          </div>
        </div>

        {/* Stages Horizontal Selector */}
        <div className="overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-stretch gap-2 min-w-max">
            {stages.map(st => {
              const isCurrent = st.code === currentTwin.currentStageCode;
              const isSelected = st.id === selectedStageId;
              const isPast = st.dapRange[1] < currentTwin.currentDap;

              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onSelectStage(st.id)}
                  className={`flex flex-col items-center justify-between px-3 py-2.5 rounded-lg border transition-colors cursor-pointer min-w-[96px] text-center ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40'
                      : isCurrent
                        ? 'border-sky-400 dark:border-sky-700 bg-sky-50/60 dark:bg-sky-950/30'
                        : isPast
                          ? 'border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60'
                          : 'border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{st.code}</span>
                    {isCurrent && (
                      <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-sky-600 text-white">
                        Atual
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                    {st.dapRange[0]}–{st.dapRange[1]} DAP
                  </span>

                  <span
                    className={`mt-2 text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded border ${
                      st.category === 'vegetativo'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-900/60'
                        : st.category === 'reprodutivo'
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-900/60'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                    }`}
                  >
                    {st.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Stage Dossier */}
        {selectedStage && (
          <div className="bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 rounded-xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/70 dark:border-zinc-800">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    Estádio {selectedStage.code}
                  </span>
                  <span className="text-slate-300 dark:text-zinc-700">|</span>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {selectedStage.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {selectedStage.description}
                </p>
              </div>

              <div className="shrink-0 bg-white dark:bg-zinc-900 px-3 py-2 rounded-lg border border-slate-200/80 dark:border-zinc-800 text-center tabular-nums">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">Janela Típica</span>
                <strong className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {selectedStage.dapRange[0]} a {selectedStage.dapRange[1]} DAP
                </strong>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">
                  {selectedStage.gddAccumulatedNeeded} °C GDD
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {/* 1. Morphology */}
              <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-lg border border-slate-200/80 dark:border-zinc-800 space-y-2">
                <strong className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Morfologia & Desenvolvimento</span>
                </strong>
                <ul className="space-y-1 text-slate-600 dark:text-zinc-300 text-[11px] tabular-nums">
                  <li>
                    Altura: <strong>{selectedStage.expectedCharacteristics.plantHeightCm[0]} a {selectedStage.expectedCharacteristics.plantHeightCm[1]} cm</strong>
                  </li>
                  <li>
                    Raiz: <strong>{selectedStage.expectedCharacteristics.rootDepthCm[0]} a {selectedStage.expectedCharacteristics.rootDepthCm[1]} cm</strong>
                  </li>
                  <li>
                    IAF: <strong>{selectedStage.expectedCharacteristics.leafAreaIndex} m²/m²</strong>
                  </li>
                  {selectedStage.expectedCharacteristics.nodesCount !== undefined && (
                    <li>
                      Nós principais: <strong>~{selectedStage.expectedCharacteristics.nodesCount} nós</strong>
                    </li>
                  )}
                </ul>
                <p className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
                  Eventos: {(selectedStage.expectedCharacteristics.mainEvents || []).join('; ')}.
                </p>
              </div>

              {/* 2. Water Demand */}
              <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-lg border border-slate-200/80 dark:border-zinc-800 space-y-2">
                <strong className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Demanda Hídrica & Irrigação</span>
                </strong>
                <ul className="space-y-1 text-slate-600 dark:text-zinc-300 text-[11px] tabular-nums">
                  <li>
                    Coeficiente Kc: <strong>{selectedStage.waterDemand.kc}</strong>
                  </li>
                  <li>
                    Consumo diário: <strong>{selectedStage.waterDemand.dailyConsumptionMm[0]} a {selectedStage.waterDemand.dailyConsumptionMm[1]} mm/dia</strong>
                  </li>
                  <li>
                    Sensibilidade ao déficit:{' '}
                    <span className="font-semibold uppercase text-amber-600 dark:text-amber-400">
                      {selectedStage.waterDemand.waterStressSensitivity.replace('_', ' ')}
                    </span>
                  </li>
                </ul>
                <p className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-sky-700 dark:text-sky-400 font-medium">
                  {selectedStage.waterDemand.irrigationRecommendation}
                </p>
              </div>

              {/* 3. Nutrition */}
              <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-lg border border-slate-200/80 dark:border-zinc-800 space-y-2">
                <strong className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Exigência Nutricional</span>
                </strong>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStage.nutrition.mostDemandedNutrients.map((n, i) => (
                    <span
                      key={i}
                      className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-900/60 text-[10px] font-medium px-2 py-0.5 rounded"
                    >
                      {n}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 pt-1">
                  <strong className="text-slate-700 dark:text-zinc-300">Sintoma crítico:</strong>{' '}
                  {selectedStage.nutrition.criticalDeficiencySymptoms[0] || 'Nenhum'}
                </p>
              </div>

              {/* 4. Sanitary Threats */}
              <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-lg border border-slate-200/80 dark:border-zinc-800 space-y-2">
                <strong className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>Ameaças Sanitárias & MIP</span>
                </strong>
                <div className="space-y-1.5 text-[11px]">
                  <div>
                    <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">Pragas Frequentes</span>
                    <span className="font-medium text-slate-800 dark:text-zinc-200">
                      {selectedStage.sanitaryThreats.frequentPests.length > 0
                        ? selectedStage.sanitaryThreats.frequentPests.join(', ')
                        : 'Baixa pressão nesta fase'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">Doenças de Alerta</span>
                    <span className="font-medium text-rose-600 dark:text-rose-400">
                      {selectedStage.sanitaryThreats.frequentDiseases.length > 0
                        ? selectedStage.sanitaryThreats.frequentDiseases.join(', ')
                        : 'Monitoramento preventivo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. Management */}
              <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-3.5 rounded-lg border border-slate-200/80 dark:border-zinc-800 space-y-2">
                <strong className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Manejos Recomendados & Operações Proibidas</span>
                </strong>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                  <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-200/70 dark:border-emerald-900/60 space-y-1">
                    <span className="text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Operações Recomendadas</span>
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-emerald-950 dark:text-emerald-200">
                      {selectedStage.management.recommendedOperations.map((op, i) => (
                        <li key={i}>{op}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-rose-50/70 dark:bg-rose-950/30 p-2.5 rounded-lg border border-rose-200/70 dark:border-rose-900/60 space-y-1">
                    <span className="text-rose-800 dark:text-rose-300 font-semibold flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      <span>Operações Proibidas</span>
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-rose-950 dark:text-rose-200">
                      {selectedStage.management.strictlyForbiddenOperations.map((op, i) => (
                        <li key={i}>{op}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
