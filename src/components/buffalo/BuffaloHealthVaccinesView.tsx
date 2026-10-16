import React, { useState } from 'react';
import { BuffaloAnimal, BuffaloHealthRecord } from '../../types/buffalo';
import {
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Plus,
  Activity,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  Bug
} from 'lucide-react';

interface BuffaloHealthVaccinesViewProps {
  animals: BuffaloAnimal[];
  onOpenDigitalTwin: (animalId: string) => void;
}

export const BuffaloHealthVaccinesView: React.FC<BuffaloHealthVaccinesViewProps> = ({
  animals,
  onOpenDigitalTwin
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner de Sanidade & Biosseguridade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Status Sanitário do Rebanho</span>
          <div className="text-2xl font-black text-emerald-600">100% Regular</div>
          <span className="text-xs text-slate-500">Monitoramento PNCEBT em dia</span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Vacinação de Clostridioses</span>
          <div className="text-2xl font-black text-teal-600">Válida até 05/2027</div>
          <span className="text-xs text-slate-500">Poli-Star 10 (Dose anual)</span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Brucelose &amp; Tuberculose</span>
          <div className="text-2xl font-black text-blue-600">Livre Oficial</div>
          <span className="text-xs text-emerald-600 font-bold">Teste Cervical Comparado Negativo</span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Animais em Carência</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">0</div>
          <span className="text-xs text-teal-600 font-bold">Leite 100% apto para processamento</span>
        </div>
      </div>

      {/* Calendário Sanitário Obrigatório e Específico para Búfalos */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-5">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            <span>Calendário Sanitário &amp; Protocolos Preventivos Bubalinos</span>
          </h3>
          <p className="text-xs text-slate-500">
            Recomendações técnicas baseadas no Ministério da Agricultura (MAPA) e Associação Brasileira de Criadores de Búfalos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Brucelose (B19 ou RB51)</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-300">
              Obrigatória para todas as bezerras entre <strong>3 e 8 meses de idade</strong> com marcação a ferro no lado esquerdo da cara.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Tuberculose Bubalina</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-300">
              Exame diagnóstico anual por <strong>Teste Cervical Comparado (TCC)</strong> em todos os animais com idade &ge; 24 meses.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-2">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4 text-amber-600" />
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Piolho do Búfalo (Haematopinus)</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-300">
              Monitoramento e banho estratégico pour-on na entrada do período seco para erradicação do ectoparasita específico.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
