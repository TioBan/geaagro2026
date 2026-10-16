import React from 'react';
import { TrendingUp } from 'lucide-react';
import { GrowthCurvePoint, CropDigitalTwin } from '../../types/phenology';

interface PhenologyPhysiologyCurvesProps {
  currentTwin: CropDigitalTwin;
  growthPoints: GrowthCurvePoint[];
}

export const PhenologyPhysiologyCurves: React.FC<PhenologyPhysiologyCurvesProps> = ({
  currentTwin,
  growthPoints,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-5">
        <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Curvas de Crescimento Vegetativo & Radicular
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Evolução da altura da planta, profundidade radicular e acúmulo de matéria seca ao longo do ciclo (DAP).
          </p>
        </div>

        {/* Growth Metrics Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-slate-600 dark:text-zinc-400 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Estádio</th>
                <th className="py-2.5 px-3 text-center">DAP</th>
                <th className="py-2.5 px-3 text-center">Altura (cm)</th>
                <th className="py-2.5 px-3 text-center">Raiz Efetiva (cm)</th>
                <th className="py-2.5 px-3 text-center">IAF (m²/m²)</th>
                <th className="py-2.5 px-3 text-center">Matéria Seca (kg/ha)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {growthPoints.map((pt, i) => {
                const isCurrent = pt.stageCode === currentTwin.currentStageCode;
                return (
                  <tr
                    key={i}
                    className={`hover:bg-slate-50/70 dark:hover:bg-zinc-900/40 transition-colors ${
                      isCurrent ? 'bg-emerald-50/60 dark:bg-emerald-950/30 font-bold' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <span className="font-black text-emerald-700 dark:text-emerald-300">{pt.stageCode}</span>
                      {isCurrent && <span className="ml-2 text-[9px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full">Atual</span>}
                    </td>
                    <td className="py-2.5 px-3 text-center">{pt.dap}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800 dark:text-zinc-200">{pt.plantHeightCm} cm</td>
                    <td className="py-2.5 px-3 text-center text-teal-600 font-bold">{pt.rootDepthCm} cm</td>
                    <td className="py-2.5 px-3 text-center">{pt.leafAreaIndex}</td>
                    <td className="py-2.5 px-3 text-center text-indigo-600 font-bold">{pt.dryMassKgHa.toLocaleString('pt-BR')} kg/ha</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
