import React from 'react';
import { BuffaloFacility } from '../../types/buffalo';
import {
  Building2,
  ShieldCheck,
  Wrench,
  Calendar,
  CheckCircle2,
  Sparkles,
  Layers3
} from 'lucide-react';

interface BuffaloFacilitiesViewProps {
  facilities: BuffaloFacility[];
}

export const BuffaloFacilitiesView: React.FC<BuffaloFacilitiesViewProps> = ({ facilities }) => {
  return (
    <div className="space-y-6">
      {/* Top Banner de Benfeitorias e Bem-Estar */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-teal-950 border border-teal-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-full text-xs font-bold uppercase">
            <Building2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Infraestrutura Zootécnica de Alta Performance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Benfeitorias, Currais Anti-Estresse &amp; Sala de Ordenha
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Instalações dimensionadas para o comportamento dócil e gregário dos búfalos, com paredes curvas, travas emborrachadas e seringa circular tipo Temple Grandin, minimizando estresse e hematomas na carcaça.
          </p>
        </div>
      </div>

      {/* Grid de Instalações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {facilities.map((fac) => (
          <div
            key={fac.id}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-[10px] rounded-md">
                  {fac.type}
                </span>
                <span className="text-xs font-bold text-emerald-600">{fac.condition}</span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{fac.name}</h4>
              <p className="text-xs text-slate-500">Dimensões: {fac.dimensions} • Capacidade: <strong>{fac.capacityAnimals} animais</strong></p>

              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Diferenciais Técnicos:</span>
                <ul className="space-y-1 text-xs text-slate-700 dark:text-zinc-300 list-disc pl-4">
                  {fac.features.map((feat, idx) => (
                    <li key={idx}>{feat}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-500 flex justify-between">
              <span>Última inspeção: {fac.lastInspectionDate}</span>
              <span className="text-teal-600 font-semibold">Próx: {fac.nextMaintenanceDate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
