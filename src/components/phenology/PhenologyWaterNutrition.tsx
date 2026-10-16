import React from 'react';
import { Droplets } from 'lucide-react';
import { CropDigitalTwin } from '../../types/phenology';

interface PhenologyWaterNutritionProps {
  currentTwin: CropDigitalTwin;
}

export const PhenologyWaterNutrition: React.FC<PhenologyWaterNutritionProps> = ({ currentTwin }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Droplets className="w-5 h-5 text-cyan-600" />
          Marcha de Absorção de Nutrientes & Demanda Hídrica — {currentTwin.plotName}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border space-y-3">
            <strong className="font-bold text-slate-900 dark:text-white block text-sm">
              Exigência Hídrica por Estádio Fenológico
            </strong>
            <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
              O consumo hídrico inicia em 2.0 mm/dia na fase vegetativa (VE a V2), atinge o pico crítico de 7.5 a 8.5 mm/dia durante o florescimento e enchimento de grãos (R1 a R5), e decai para menos de 1.5 mm/dia na maturação (R7/R8).
            </p>
            <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 rounded-lg text-cyan-950 dark:text-cyan-200 font-semibold">
              Lâmina recomendada hoje para {currentTwin.plotName}: <strong>6.2 mm/dia</strong> (estádio {currentTwin.currentStageCode}).
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border space-y-3">
            <strong className="font-bold text-slate-900 dark:text-white block text-sm">
              Marcha de Absorção de N, P, K e Micronutrientes
            </strong>
            <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
              O Potássio (K) e o Nitrogênio (N) representam mais de 75% de todos os nutrientes extraídos. A maior taxa diária de absorção ocorre entre R1 e R5.2 (até 7.8 kg/ha/dia de N e 7.2 kg/ha/dia de K₂O).
            </p>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-950 dark:text-emerald-200 font-semibold">
              Momento ideal para Diagnose Foliar: <strong>R1 (Primeiras Flores Abertas)</strong>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
