import React, { useState } from 'react';
import { BuffaloAnimal } from '../../types/buffalo';
import { calculateMozzarellaYieldLitersPerKg } from '../../data/buffaloData';
import { Milk } from 'lucide-react';

interface BuffaloDairyProductionViewProps {
  animals: BuffaloAnimal[];
  onOpenDigitalTwin: (animalId: string) => void;
}

export const BuffaloDairyProductionView: React.FC<BuffaloDairyProductionViewProps> = ({
  animals,
  onOpenDigitalTwin
}) => {
  const lactatingCows = animals.filter(a => a.status === 'Em Lactação');

  const totalDailyMilk = lactatingCows.reduce((acc, a) => acc + (a.averageDailyMilkLiters || 0), 0);
  const avgMilkPerCow = lactatingCows.length > 0 ? totalDailyMilk / lactatingCows.length : 0;
  const avgFat =
    lactatingCows.length > 0
      ? lactatingCows.reduce((acc, a) => acc + (a.averageFatPct || 0), 0) / lactatingCows.length
      : 0;
  const avgProtein =
    lactatingCows.length > 0
      ? lactatingCows.reduce((acc, a) => acc + (a.averageProteinPct || 0), 0) / lactatingCows.length
      : 0;

  const mozzarellaLitersPerKg =
    avgFat > 0 && avgProtein > 0 ? calculateMozzarellaYieldLitersPerKg(avgFat, avgProtein) : 0;
  const dailyMozzarellaKg = mozzarellaLitersPerKg > 0 ? totalDailyMilk / mozzarellaLitersPerKg : 0;

  const priceMilkPerLiter = 4.8;
  const priceMozzarellaKg = 62.0;
  const dailyRevenueMilk = totalDailyMilk * priceMilkPerLiter;
  const dailyRevenueMozzarella = dailyMozzarellaKg * priceMozzarellaKg;

  const [simFat, setSimFat] = useState(7.8);
  const [simProtein, setSimProtein] = useState(4.4);
  const [simLiters, setSimLiters] = useState(500);

  const simYieldLitersPerKg = calculateMozzarellaYieldLitersPerKg(simFat, simProtein);
  const simTotalMozzarellaKg = Number((simLiters / simYieldLitersPerKg).toFixed(1));
  const simMarajoLitersPerKg = Number((simYieldLitersPerKg * 1.12).toFixed(2));
  const simTotalMarajoKg = Number((simLiters / simMarajoLitersPerKg).toFixed(1));

  return (
    <div className="space-y-4">
      {/* Faixa unificada de KPIs */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-zinc-800">
          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              Produção Diária
            </span>
            <div className="text-xl font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">
              {totalDailyMilk.toFixed(1)} <span className="text-xs font-normal text-slate-500">L/dia</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              Média {avgMilkPerCow.toFixed(1)} L/vaca · {lactatingCows.length} lactantes
            </span>
          </div>

          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              Gordura / Proteína
            </span>
            <div className="text-xl font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">
              {avgFat.toFixed(1)}% <span className="text-xs font-normal text-slate-500">/ {avgProtein.toFixed(1)}%</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              {mozzarellaLitersPerKg > 0 ? `${mozzarellaLitersPerKg} L/kg Mozzarella` : 'Sem controle ativo'}
            </span>
          </div>

          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              Mozzarella D.O.P. Est.
            </span>
            <div className="text-xl font-semibold text-teal-600 dark:text-teal-400 tabular-nums mt-0.5">
              {dailyMozzarellaKg.toFixed(1)} <span className="text-xs font-normal text-slate-500">kg/dia</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              Leite fluido: R$ {dailyRevenueMilk.toFixed(0)}/dia
            </span>
          </div>

          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              Receita Queijaria Est.
            </span>
            <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
              R$ {dailyRevenueMozzarella.toFixed(0)} <span className="text-xs font-normal text-slate-500">/dia</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              Ref.: R$ {priceMozzarellaKg.toFixed(2)}/kg
            </span>
          </div>
        </div>
      </section>

      {/* Simulador de Rendimento Queijeiro */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Milk className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Simulador de Rendimento — Mozzarella &amp; Queijo do Marajó</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Conversão industrial baseada no teor de gordura e proteína do leite bubalino
            </p>
          </div>

          <div className="flex items-center gap-4 text-right tabular-nums shrink-0">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Mozzarella</span>
              <span className="text-base font-semibold text-teal-600 dark:text-teal-400">
                {simTotalMozzarellaKg} kg
              </span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                {simYieldLitersPerKg} L/kg
              </span>
            </div>
            <div className="pl-4 border-l border-slate-200 dark:border-zinc-800">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Queijo Marajó</span>
              <span className="text-base font-semibold text-slate-900 dark:text-white">
                {simTotalMarajoKg} kg
              </span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                {simMarajoLitersPerKg} L/kg
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="text-slate-600 dark:text-zinc-400 font-medium">Volume de leite</label>
              <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{simLiters} L</span>
            </div>
            <input
              type="range"
              min="50"
              max="3000"
              step="50"
              value={simLiters}
              onChange={(e) => setSimLiters(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="text-slate-600 dark:text-zinc-400 font-medium">Teor de gordura</label>
              <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{simFat.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="6.0"
              max="10.0"
              step="0.1"
              value={simFat}
              onChange={(e) => setSimFat(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="text-slate-600 dark:text-zinc-400 font-medium">Teor de proteína</label>
              <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                {simProtein.toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="3.8"
              max="5.5"
              step="0.1"
              value={simProtein}
              onChange={(e) => setSimProtein(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* Tabela de Matrizes em Lactação */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
          Matrizes em Lactação ({lactatingCows.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
              <tr>
                <th className="py-2 pr-3 font-medium">Matriz</th>
                <th className="py-2 px-3 font-medium">Raça</th>
                <th className="py-2 px-3 font-medium text-right">Leite (L/dia)</th>
                <th className="py-2 px-3 font-medium text-right">Gordura</th>
                <th className="py-2 px-3 font-medium text-right">Proteína</th>
                <th className="py-2 px-3 font-medium text-right">Rendimento</th>
                <th className="py-2 px-3 font-medium">Lote</th>
                <th className="py-2 pl-3 font-medium text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 tabular-nums">
              {lactatingCows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 dark:text-zinc-400">
                    Nenhuma matriz com status Em Lactação cadastrada no momento.
                  </td>
                </tr>
              ) : (
                lactatingCows.map(cow => {
                  const fat = cow.averageFatPct || 0;
                  const protein = cow.averageProteinPct || 0;
                  const yieldKg = fat > 0 && protein > 0 ? calculateMozzarellaYieldLitersPerKg(fat, protein) : 0;
                  return (
                    <tr key={cow.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                      <td className="py-2.5 pr-3">
                        <div className="font-semibold text-slate-900 dark:text-white">{cow.identificationNumber}</div>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400">{cow.name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">{cow.breed}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-teal-600 dark:text-teal-400">
                        {cow.averageDailyMilkLiters || 0} L
                      </td>
                      <td className="py-2.5 px-3 text-right">{fat ? `${fat}%` : '—'}</td>
                      <td className="py-2.5 px-3 text-right">{protein ? `${protein}%` : '—'}</td>
                      <td className="py-2.5 px-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                        {yieldKg > 0 ? `${yieldKg} L/kg` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">{cow.batchName || '—'}</td>
                      <td className="py-2.5 pl-3 text-right">
                        <button
                          type="button"
                          onClick={() => onOpenDigitalTwin(cow.id)}
                          className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 cursor-pointer transition-colors"
                        >
                          Controle
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
