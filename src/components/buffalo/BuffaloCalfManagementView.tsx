import React, { useState } from 'react';
import { BuffaloAnimal } from '../../types/buffalo';
import {
  Baby,
  ShieldCheck,
  Scale,
  Milk,
  AlertTriangle,
  Award,
  Sparkles,
  CheckCircle2,
  Calendar,
  Activity,
  Plus
} from 'lucide-react';

interface BuffaloCalfManagementViewProps {
  animals: BuffaloAnimal[];
  onOpenDigitalTwin: (animalId: string) => void;
}

export const BuffaloCalfManagementView: React.FC<BuffaloCalfManagementViewProps> = ({
  animals,
  onOpenDigitalTwin
}) => {
  const calves = animals.filter(a => a.category === 'Bezerra (0-6m)' || a.category === 'Bezerro (0-6m)');
  const heifers = animals.filter(a => a.category === 'Novilha em Recria (7-24m)');

  return (
    <div className="space-y-6">
      {/* Top Banner de Métricas Neonatais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total no Bezerreiro</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{calves.length}</div>
          <span className="text-xs text-teal-600 font-bold">100% com desmame assistido</span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Taxa de Sobrevivência Neonatal</span>
          <div className="text-3xl font-black text-emerald-600">98.8%</div>
          <span className="text-xs text-slate-500">Mortalidade &lt; 1.2% (Padrão Ouro)</span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">GMD Neonatal Médio</span>
          <div className="text-3xl font-black text-blue-600">0.68 <span className="text-sm font-bold text-slate-400">kg/dia</span></div>
          <span className="text-xs text-slate-500">Peso médio ao nascer: 38.5 kg</span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Qualidade da Colostragem</span>
          <div className="text-3xl font-black text-amber-600">&gt; 23° Brix</div>
          <span className="text-xs text-teal-600 font-bold">Transferência de Imunidade Passiva</span>
        </div>
      </div>

      {/* Protocolo Neonatal de Sucesso (Checklist Obrigatório) */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-5">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Protocolo Operacional Padrão (POP) Neonatal de Búfalos</span>
          </h3>
          <p className="text-xs text-slate-500">
            Cuidados cruciais nas primeiras horas e semanas para garantir longevidade e robustez imunológica.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Passo 1 */}
          <div className="p-4 bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">1</span>
              <h4 className="font-extrabold text-xs text-teal-950 dark:text-teal-200">Colostragem Imediata (&lt; 6h)</h4>
            </div>
            <p className="text-xs text-teal-900 dark:text-teal-300 leading-relaxed">
              Fornecer <strong>3.5 a 4.0 Litros</strong> de colostro de primeira ordenha com densidade aferida no refratômetro (&gt; 22° Brix) nas primeiras 6 horas de vida.
            </p>
          </div>

          {/* Passo 2 */}
          <div className="p-4 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">2</span>
              <h4 className="font-extrabold text-xs text-blue-950 dark:text-blue-200">Cura de Umbigo com Iodo 10%</h4>
            </div>
            <p className="text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
              Imersão completa do cordão umbilical em solução de <strong>Iodo 10% Puro</strong> 2x ao dia durante 4 a 5 dias até a secagem total, prevenindo onfaloflebite.
            </p>
          </div>

          {/* Passo 3 */}
          <div className="p-4 bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center">3</span>
              <h4 className="font-extrabold text-xs text-amber-950 dark:text-amber-200">Anti-helmíntico (10º-15º dia)</h4>
            </div>
            <p className="text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
              Desverminação profilática precoce contra <em>Toxocara vitulorum</em> (nematóide transmitido via leite materno), evitando timpanismo e diarreia neonatal.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Bezerros Cadastrados no Rebanho */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
          Bezerras &amp; Bezerros no Bezerreiro
        </h4>

        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
          {calves.map((calf) => (
            <div key={calf.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-slate-900 dark:text-white">{calf.identificationNumber}</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">{calf.name}</span>
                  <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-[10px] rounded">
                    {calf.breed} ({calf.sex})
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Nascimento: {calf.birthDate} • Peso Atual: <strong>{calf.currentWeightKg} kg</strong> (Nasceu com {calf.birthWeightKg || 38} kg)
                </p>
                {calf.damName && (
                  <span className="text-[11px] text-teal-600 font-semibold block">
                    Mãe: {calf.damName} • Pai: {calf.sireName || 'Touro PO'}
                  </span>
                )}
              </div>

              <button
                onClick={() => onOpenDigitalTwin(calf.id)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
              >
                Acompanhar Curva de Crescimento
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
