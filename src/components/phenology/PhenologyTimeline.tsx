import React from 'react';
import {
  Activity,
  Droplets,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
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
  onSelectStage,
}) => {
  const selectedStage = stages.find(s => s.id === selectedStageId) || stages[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
              Escala Fenológica Oficial ({currentTwin.cropName})
            </span>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Navegador Fenológico — {currentTwin.cultivarName} ({currentTwin.plotName})
            </h3>
          </div>
          <div className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">
            Estádio Atual da Lavoura: <span className="text-emerald-600 font-bold">{currentTwin.currentStageCode}</span>
          </div>
        </div>

        {/* Stages Horizontal Flow */}
        <div className="overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-2 min-w-max">
            {stages.map((st) => {
              const isCurrent = st.code === currentTwin.currentStageCode;
              const isSelected = st.id === selectedStageId;
              const isPast = st.dapRange[1] < currentTwin.currentDap;

              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onSelectStage(st.id)}
                  className={`relative flex flex-col items-center p-3 rounded-xl border transition-all cursor-pointer min-w-[105px] text-center ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-400/40 shadow-xs'
                      : isCurrent
                      ? 'border-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/20'
                      : isPast
                      ? 'border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40'
                      : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-black opacity-70 hover:opacity-100'
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute -top-2 bg-cyan-500 text-teal-950 text-[9px] font-black uppercase px-2 py-0.2 rounded-full shadow-xs">
                      Hoje
                    </span>
                  )}

                  <span className="text-sm font-black text-slate-900 dark:text-white">{st.code}</span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    {st.dapRange[0]}-{st.dapRange[1]} DAP
                  </span>

                  <div className="mt-2 w-full pt-1.5 border-t border-slate-200/60 dark:border-zinc-800/80">
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        st.category === 'vegetativo'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : st.category === 'reprodutivo'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                      }`}
                    >
                      {st.category}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Stage Dossier Card */}
        {selectedStage && (
          <div className="bg-slate-50/70 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    Estádio {selectedStage.code}
                  </span>
                  <span className="text-slate-400">•</span>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">{selectedStage.name}</h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
                  {selectedStage.description}
                </p>
              </div>

              <div className="shrink-0 bg-white dark:bg-black p-2.5 rounded-lg border text-center">
                <span className="text-[10px] text-slate-400 block">Janela Temporal Típica</span>
                <strong className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  {selectedStage.dapRange[0]} a {selectedStage.dapRange[1]} DAP
                </strong>
              </div>
            </div>

            {/* Dossier Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* 1. Características Fisiológicas Esperadas */}
              <div className="bg-white dark:bg-black p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2.5">
                <strong className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                  <Activity className="w-4 h-4 text-teal-600" />
                  Morfologia & Desenvolvimento:
                </strong>
                <ul className="space-y-1.5 text-slate-600 dark:text-zinc-300 text-[11px]">
                  <li>• Altura da Planta: <strong>{selectedStage.expectedCharacteristics.plantHeightCm[0]} a {selectedStage.expectedCharacteristics.plantHeightCm[1]} cm</strong></li>
                  <li>• Profundidade Radicular: <strong>{selectedStage.expectedCharacteristics.rootDepthCm[0]} a {selectedStage.expectedCharacteristics.rootDepthCm[1]} cm</strong></li>
                  <li>• Índice de Área Foliar (IAF): <strong>{selectedStage.expectedCharacteristics.leafAreaIndex} m²/m²</strong></li>
                  {selectedStage.expectedCharacteristics.nodesCount !== undefined && (
                    <li>• Nós no Caule Principal: <strong>~{selectedStage.expectedCharacteristics.nodesCount} nós</strong></li>
                  )}
                </ul>
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-[10px] text-slate-500">
                  Eventos: {(selectedStage.expectedCharacteristics.mainEvents || []).join('; ')}.
                </div>
              </div>

              {/* 2. Demanda Hídrica & Coeficiente Kc */}
              <div className="bg-white dark:bg-black p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2.5">
                <strong className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                  <Droplets className="w-4 h-4 text-cyan-600" />
                  Demanda Hídrica & Irrigação:
                </strong>
                <ul className="space-y-1.5 text-slate-600 dark:text-zinc-300 text-[11px]">
                  <li>• Coeficiente da Cultura (Kc): <strong>{selectedStage.waterDemand.kc}</strong></li>
                  <li>• Consumo Diário Estimado: <strong>{selectedStage.waterDemand.dailyConsumptionMm[0]} a {selectedStage.waterDemand.dailyConsumptionMm[1]} mm/dia</strong></li>
                  <li>• Sensibilidade ao Déficit: <span className="font-bold uppercase text-amber-600">{selectedStage.waterDemand.waterStressSensitivity.replace('_', ' ')}</span></li>
                </ul>
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-[10px] text-cyan-700 dark:text-cyan-400 font-semibold">
                  {selectedStage.waterDemand.irrigationRecommendation}
                </div>
              </div>

              {/* 3. Exigência Nutricional & Absorção */}
              <div className="bg-white dark:bg-black p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2.5">
                <strong className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Nutrientes Mais Exigidos:
                </strong>
                <div className="flex flex-wrap gap-1">
                  {selectedStage.nutrition.mostDemandedNutrients.map((n, i) => (
                    <span key={i} className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {n}
                    </span>
                  ))}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-zinc-400 pt-1">
                  Sintoma Crítico: {selectedStage.nutrition.criticalDeficiencySymptoms[0] || 'Nenhum'}
                </div>
              </div>

              {/* 4. Ameaças Sanitárias da Fase */}
              <div className="bg-white dark:bg-black p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2.5">
                <strong className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Ameaças Sanitárias & MIP:
                </strong>
                <div className="space-y-1 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Pragas Mais Frequentes:</span>
                    <strong className="text-slate-800 dark:text-zinc-200">
                      {(selectedStage.sanitaryThreats.frequentPests || []).join(', ')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Doenças de Alerta:</span>
                    <strong className="text-rose-600">
                      {(selectedStage.sanitaryThreats.frequentDiseases || []).join(', ')}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 5. Manejos Recomendados & Operações Proibidas */}
              <div className="lg:col-span-2 bg-white dark:bg-black p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2.5">
                <strong className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  Manejos Recomendados & Práticas Proibidas:
                </strong>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900/50 space-y-1">
                    <strong className="text-emerald-800 dark:text-emerald-300 font-bold block">✓ Operações Recomendadas:</strong>
                    <ul className="space-y-1 text-emerald-950 dark:text-emerald-200">
                      {selectedStage.management.recommendedOperations.map((op, i) => (
                        <li key={i}>• {op}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50 space-y-1">
                    <strong className="text-rose-800 dark:text-rose-300 font-bold block">✕ Operações Estritamente Proibidas:</strong>
                    <ul className="space-y-1 text-rose-950 dark:text-rose-200">
                      {selectedStage.management.strictlyForbiddenOperations.map((op, i) => (
                        <li key={i}>• {op}</li>
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
