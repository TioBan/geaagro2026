import React from 'react';
import { TrendingUp } from 'lucide-react';
import { GrowthCurvePoint, CropDigitalTwin } from '../../types/phenology';

interface PhenologyPhysiologyCurvesProps {
  currentTwin: CropDigitalTwin;
  growthPoints: GrowthCurvePoint[];
}

export const PhenologyPhysiologyCurves: React.FC<PhenologyPhysiologyCurvesProps> = ({
  currentTwin,
  growthPoints
}) => {
  const maxDryMass = Math.max(...growthPoints.map(p => p.dryMassKgHa), 1);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-4">
      <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Curvas de Crescimento Vegetativo & Radicular — {currentTwin.plotName}</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Evolução de altura da planta, profundidade radicular efetiva, IAF e acúmulo de matéria seca ao longo do ciclo (DAP).
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-500 dark:text-zinc-400 font-semibold uppercase text-[10px] tracking-wide">
              <th className="py-2.5 px-3">Estádio</th>
              <th className="py-2.5 px-3 text-right">DAP</th>
              <th className="py-2.5 px-3 text-right">Altura (cm)</th>
              <th className="py-2.5 px-3 text-right">Raiz Efetiva (cm)</th>
              <th className="py-2.5 px-3 text-right">IAF (m²/m²)</th>
              <th className="py-2.5 px-3 text-right">Matéria Seca (kg/ha)</th>
              <th className="py-2.5 px-3 w-32 hidden sm:table-cell">Acúmulo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 tabular-nums">
            {growthPoints.map(pt => {
              const isCurrent = pt.stageCode === currentTwin.currentStageCode;
              const massPct = Math.round((pt.dryMassKgHa / maxDryMass) * 100);

              return (
                <tr
                  key={pt.stageCode}
                  className={`transition-colors ${
                    isCurrent
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30'
                      : 'hover:bg-slate-50/70 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{pt.stageCode}</span>
                    {isCurrent && (
                      <span className="ml-2 text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                        Atual
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700 dark:text-zinc-300">{pt.dap}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-900 dark:text-white">
                    {pt.plantHeightCm} cm
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-emerald-700 dark:text-emerald-400">
                    {pt.rootDepthCm} cm
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700 dark:text-zinc-300">
                    {pt.leafAreaIndex.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-900 dark:text-white">
                    {pt.dryMassKgHa.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-2.5 px-3 hidden sm:table-cell">
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 dark:bg-emerald-500"
                        style={{ width: `${massPct}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
