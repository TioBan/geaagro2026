import React from 'react';
import { BuffaloAnimal } from '../../types/buffalo';
import { ShieldCheck } from 'lucide-react';

interface BuffaloCalfManagementViewProps {
  animals: BuffaloAnimal[];
  onOpenDigitalTwin: (animalId: string) => void;
}

export const BuffaloCalfManagementView: React.FC<BuffaloCalfManagementViewProps> = ({
  animals,
  onOpenDigitalTwin
}) => {
  const calves = animals.filter(
    a => a.category === 'Bezerra (0-6m)' || a.category === 'Bezerro (0-6m)'
  );
  const heifers = animals.filter(a => a.category === 'Novilha em Recria (7-24m)');

  const calvesWithBirthWeight = calves.filter(c => c.birthWeightKg > 0);
  const avgBirthWeight =
    calvesWithBirthWeight.length > 0
      ? (
          calvesWithBirthWeight.reduce((acc, c) => acc + c.birthWeightKg, 0) /
          calvesWithBirthWeight.length
        ).toFixed(1)
      : '—';

  const avgCurrentWeight =
    calves.length > 0
      ? Math.round(calves.reduce((acc, c) => acc + (c.currentWeightKg || 0), 0) / calves.length)
      : 0;

  const calfGmds = calves
    .flatMap(c => c.weighings || [])
    .map(w => w.dailyGainKg)
    .filter((v): v is number => typeof v === 'number' && v > 0);
  const avgGmd =
    calfGmds.length > 0
      ? (calfGmds.reduce((acc, v) => acc + v, 0) / calfGmds.length).toFixed(2)
      : '—';

  const neonatalPop = [
    {
      step: '01',
      title: 'Colostragem imediata (< 6h)',
      desc: 'Fornecer 3,5 a 4,0 L de colostro de primeira ordenha aferido em refratômetro (> 22° Brix) nas primeiras 6 horas.'
    },
    {
      step: '02',
      title: 'Cura do umbigo com iodo 10%',
      desc: 'Imersão completa do coto umbilical em solução de iodo 10% duas vezes ao dia por 4 a 5 dias até mumificação.'
    },
    {
      step: '03',
      title: 'Anti-helmíntico (10º ao 15º dia)',
      desc: 'Controle profilático precoce contra Toxocara vitulorum transmitido via colostro, com reforço aos 30 dias.'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Faixa unificada de KPIs */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-zinc-800">
          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              Bezerros (0-6m)
            </span>
            <div className="text-xl font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">
              {calves.length}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              {heifers.length} novilhas em recria
            </span>
          </div>

          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              Peso Médio Atual
            </span>
            <div className="text-xl font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">
              {calves.length > 0 ? `${avgCurrentWeight} kg` : '—'}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              Nascer: {avgBirthWeight !== '—' ? `${avgBirthWeight} kg` : '—'}
            </span>
          </div>

          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              GMD Neonatal
            </span>
            <div className="text-xl font-semibold text-teal-600 dark:text-teal-400 tabular-nums mt-0.5">
              {avgGmd !== '—' ? `${avgGmd} kg/dia` : '—'}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">Calculado das pesagens</span>
          </div>

          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              Meta Colostragem
            </span>
            <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
              &gt; 22° Brix
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">Imunidade passiva</span>
          </div>
        </div>
      </section>

      {/* POP Neonatal */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Protocolo Operacional Padrão (POP) Neonatal</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Cuidados essenciais nas primeiras horas e semanas de vida do bezerro bubalino
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {neonatalPop.map(item => (
            <div
              key={item.step}
              className="p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 space-y-1"
            >
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-teal-600 dark:text-teal-400 tabular-nums">{item.step}.</span>
                <h3 className="font-semibold text-slate-900 dark:text-white">{item.title}</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lista de Bezerros */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
          Bezerras &amp; Bezerros Cadastrados ({calves.length})
        </h3>

        {calves.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400 py-8 text-center">
            Nenhum bezerro cadastrado na categoria 0-6 meses. Utilize a aba Cadastro para incluir nascimentos.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {calves.map(calf => (
              <div
                key={calf.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                      {calf.identificationNumber}
                    </span>
                    <span className="font-medium text-slate-700 dark:text-zinc-300">{calf.name}</span>
                    <span className="text-slate-300 dark:text-zinc-700">·</span>
                    <span className="text-teal-600 dark:text-teal-400">
                      {calf.breed} ({calf.sex})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                    Nasc.: {calf.birthDate || '—'} · Atual: {calf.currentWeightKg} kg
                    {calf.birthWeightKg ? ` (Nascer: ${calf.birthWeightKg} kg)` : ''}
                  </p>
                  {(calf.damName || calf.sireName) && (
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Mãe: {calf.damName || '—'} · Pai: {calf.sireName || '—'}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onOpenDigitalTwin(calf.id)}
                  className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 cursor-pointer self-start sm:self-auto shrink-0 transition-colors"
                >
                  Curva de Crescimento
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
