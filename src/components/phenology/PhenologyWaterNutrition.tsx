import React from 'react';
import { Droplets, Leaf } from 'lucide-react';
import { CropDigitalTwin, PhenologicalStage } from '../../types/phenology';

interface PhenologyWaterNutritionProps {
  currentTwin: CropDigitalTwin;
  stages: PhenologicalStage[];
}

export const PhenologyWaterNutrition: React.FC<PhenologyWaterNutritionProps> = ({
  currentTwin,
  stages
}) => {
  const activeStage =
    stages.find(s => s.code === currentTwin.currentStageCode) || stages[0];
  const recommendedMm = activeStage
    ? ((activeStage.waterDemand.dailyConsumptionMm[0] + activeStage.waterDemand.dailyConsumptionMm[1]) / 2).toFixed(1)
    : '5.5';
  const absorptionEntries = activeStage
    ? Object.entries(activeStage.nutrition.absorptionRateKgHa)
    : [];

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-4">
      <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Droplets className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span>Marcha de Absorção de Nutrientes & Demanda Hídrica — {currentTwin.plotName}</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Parâmetros de evapotranspiração, coeficiente de cultura (Kc) e taxas diárias de absorção nutricional para o estádio {currentTwin.currentStageCode}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Water Demand Card */}
        <div className="bg-slate-50/70 dark:bg-zinc-950/60 p-4 rounded-xl border border-slate-200/70 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <strong className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Exigência Hídrica ({currentTwin.currentStageCode})</span>
            </strong>
            {activeStage && (
              <span className="text-[11px] font-semibold tabular-nums text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded border border-sky-200/70 dark:border-sky-900/60">
                Kc {activeStage.waterDemand.kc}
              </span>
            )}
          </div>

          <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
            O consumo hídrico parte de 1,5–2,5 mm/dia na emergência (VE), atinge o pico crítico de 6,5–8,5 mm/dia no florescimento e formação de vagens (R1 a R5), e recua abaixo de 1,5 mm/dia na maturação (R7/R8).
          </p>

          <div className="p-3 rounded-lg bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/70 dark:border-sky-900/60 text-sky-900 dark:text-sky-200 space-y-1 tabular-nums">
            <p className="font-semibold">
              Lâmina diária estimada para {currentTwin.plotName}: {recommendedMm} mm/dia
            </p>
            {activeStage && (
              <p className="text-[11px] text-sky-800/90 dark:text-sky-300/90">
                {activeStage.waterDemand.irrigationRecommendation}
              </p>
            )}
          </div>
        </div>

        {/* Nutrient Absorption Card */}
        <div className="bg-slate-50/70 dark:bg-zinc-950/60 p-4 rounded-xl border border-slate-200/70 dark:border-zinc-800 space-y-3">
          <strong className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
            <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Marcha de Absorção ({currentTwin.currentStageCode})</span>
          </strong>

          <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
            Potássio (K) e Nitrogênio (N) concentram mais de 75% dos nutrientes extraídos, com maior taxa diária entre R1 e R5 (até 7,8 kg/ha/dia de N e 7,2 kg/ha/dia de K₂O).
          </p>

          {absorptionEntries.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 tabular-nums">
              {absorptionEntries.map(([nutrient, rate]) => (
                <div
                  key={nutrient}
                  className="px-2.5 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800"
                >
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase block">{nutrient}</span>
                  <strong className="text-xs font-bold text-slate-900 dark:text-white">
                    {rate} kg/ha/dia
                  </strong>
                </div>
              ))}
            </div>
          )}

          <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200 font-medium">
            Momento ideal para Diagnose Foliar: <strong>R1 (Início do Florescimento)</strong>.
          </div>
        </div>
      </div>
    </div>
  );
};
