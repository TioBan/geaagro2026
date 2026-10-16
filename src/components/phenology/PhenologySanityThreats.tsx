import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { CropDigitalTwin } from '../../types/phenology';

interface PhenologySanityThreatsProps {
  currentTwin: CropDigitalTwin;
}

export const PhenologySanityThreats: React.FC<PhenologySanityThreatsProps> = ({ currentTwin }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          Mapeamento de Pragas & Doenças por Fase da Cultura — {currentTwin.cropName}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
            <span className="text-[10px] font-black uppercase text-emerald-600">Fase Vegetativa (VE - V6)</span>
            <h4 className="font-bold text-slate-900 dark:text-white">Pragas Iniciais & Desfolhadoras</h4>
            <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
              Atenção para lagarta-da-soja e elasmo. Monitorar nível de desfolha (tolerância até 30% no vegetativo).
            </p>
          </div>

          <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900/50 space-y-2">
            <span className="text-[10px] font-black uppercase text-rose-600">
              Fase Reprodutiva (R1 - R5) {currentTwin.currentStageCode.startsWith('R') ? '— FASE ATUAL' : ''}
            </span>
            <h4 className="font-bold text-slate-900 dark:text-white">Ferrugem Asiática & Percevejos</h4>
            <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
              Janela de maior suscetibilidade. Nível de tolerância de desfolha cai para 15%. Controle rigoroso de percevejo-marrom com pano de batida.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
            <span className="text-[10px] font-black uppercase text-amber-600">Maturação (R7 - R8)</span>
            <h4 className="font-bold text-slate-900 dark:text-white">Fungos de Final de Ciclo</h4>
            <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
              Phomopsis e Cercospora em caso de chuvas na pré-colheita. Respeitar período de carência dos defensivos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
