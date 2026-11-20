import React, { useState } from 'react';
import { BuffaloAnimal } from '../../types/buffalo';
import { Beef } from 'lucide-react';

interface BuffaloBeefProductionViewProps {
  animals: BuffaloAnimal[];
  onOpenDigitalTwin: (animalId: string) => void;
}

export const BuffaloBeefProductionView: React.FC<BuffaloBeefProductionViewProps> = ({
  animals,
  onOpenDigitalTwin
}) => {
  const [carcassYieldPct, setCarcassYieldPct] = useState(51.5);
  const [priceArrobaBRL, setPriceArrobaBRL] = useState(310);

  const beefAnimals = animals.filter(
    a =>
      a.purpose === 'Corte' ||
      a.category.includes('Engorda') ||
      a.category.includes('Terminação') ||
      a.category.includes('Recria')
  );

  const avgWeight =
    beefAnimals.length > 0
      ? Math.round(beefAnimals.reduce((acc, a) => acc + (a.currentWeightKg || 0), 0) / beefAnimals.length)
      : 0;

  const beefGmds = beefAnimals
    .flatMap(a => a.weighings || [])
    .map(w => w.dailyGainKg)
    .filter((v): v is number => typeof v === 'number' && v > 0);

  const avgGmd =
    beefGmds.length > 0
      ? Number((beefGmds.reduce((acc, v) => acc + v, 0) / beefGmds.length).toFixed(2))
      : 0;

  const totalEstimatedArrobas = beefAnimals.reduce(
    (acc, a) => acc + ((a.currentWeightKg || 0) * (carcassYieldPct / 100)) / 15,
    0
  );

  return (
    <div className="space-y-4">
      {/* Faixa unificada de KPIs */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-zinc-800">
          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              Animais de Corte / Recria
            </span>
            <div className="text-xl font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">
              {beefAnimals.length}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              Peso médio: {avgWeight} kg
            </span>
          </div>

          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">GMD Médio</span>
            <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
              {avgGmd > 0 ? `${avgGmd} kg/dia` : '—'}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">Calculado das pesagens</span>
          </div>

          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              Total em Arrobas Est.
            </span>
            <div className="text-xl font-semibold text-teal-600 dark:text-teal-400 tabular-nums mt-0.5">
              {totalEstimatedArrobas.toFixed(1)} @
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              Rendimento {carcassYieldPct}%
            </span>
          </div>

          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              Valor Bruto do Lote
            </span>
            <div className="text-xl font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">
              R$ {(totalEstimatedArrobas * priceArrobaBRL).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              Cotação R$ {priceArrobaBRL.toFixed(2)}/@
            </span>
          </div>
        </div>
      </section>

      {/* Parâmetros de Simulação + Perfil Nutricional */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Beef className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Parâmetros de Carcaça &amp; Perfil da Carne Bubalina</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Ajuste o rendimento de carcaça e a cotação da arroba para estimar a receita do lote
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
              <span>Rendimento (%)</span>
              <input
                type="number"
                step="0.5"
                min="40"
                max="65"
                value={carcassYieldPct}
                onChange={(e) => setCarcassYieldPct(Number(e.target.value) || 50)}
                className="w-16 h-7 px-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-md text-xs text-slate-900 dark:text-white tabular-nums"
              />
            </label>
            <label className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
              <span>R$/@</span>
              <input
                type="number"
                step="5"
                min="100"
                value={priceArrobaBRL}
                onChange={(e) => setPriceArrobaBRL(Number(e.target.value) || 0)}
                className="w-20 h-7 px-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-md text-xs text-slate-900 dark:text-white tabular-nums"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40">
            <span className="text-base font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">-40%</span>
            <p className="font-medium text-slate-900 dark:text-white mt-0.5">Menos colesterol</p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Gordura branca e predominantemente periférica.
            </p>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40">
            <span className="text-base font-semibold text-teal-600 dark:text-teal-400 tabular-nums">-55%</span>
            <p className="font-medium text-slate-900 dark:text-white mt-0.5">Menos calorias</p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Alto teor proteico com menor gordura intramuscular.
            </p>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40">
            <span className="text-base font-semibold text-amber-600 dark:text-amber-400 tabular-nums">+10%</span>
            <p className="font-medium text-slate-900 dark:text-white mt-0.5">Mais minerais e ferro</p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Elevada conversão de forragens tropicais em proteína magra.
            </p>
          </div>
        </div>
      </section>

      {/* Tabela de Animais de Corte */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
          Lote em Recria, Engorda &amp; Terminação ({beefAnimals.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
              <tr>
                <th className="py-2 pr-3 font-medium">Animal</th>
                <th className="py-2 px-3 font-medium">Categoria</th>
                <th className="py-2 px-3 font-medium text-right">Peso Vivo</th>
                <th className="py-2 px-3 font-medium text-right">ECC</th>
                <th className="py-2 px-3 font-medium text-right">Arrobas Est.</th>
                <th className="py-2 px-3 font-medium text-right">Valor Est.</th>
                <th className="py-2 pl-3 font-medium text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 tabular-nums">
              {beefAnimals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 dark:text-zinc-400">
                    Nenhum búfalo cadastrado com aptidão de corte ou em recria/engorda.
                  </td>
                </tr>
              ) : (
                beefAnimals.map(animal => {
                  const arrobas = Number(((animal.currentWeightKg * (carcassYieldPct / 100)) / 15).toFixed(1));
                  const estimatedValue = arrobas * priceArrobaBRL;
                  return (
                    <tr key={animal.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                      <td className="py-2.5 pr-3">
                        <div className="font-semibold text-slate-900 dark:text-white">{animal.identificationNumber}</div>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400">{animal.name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-300">{animal.category}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-900 dark:text-white">
                        {animal.currentWeightKg} kg
                      </td>
                      <td className="py-2.5 px-3 text-right">{animal.bodyConditionScore}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-teal-600 dark:text-teal-400">
                        {arrobas} @
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        R$ {estimatedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 pl-3 text-right">
                        <button
                          type="button"
                          onClick={() => onOpenDigitalTwin(animal.id)}
                          className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 cursor-pointer transition-colors"
                        >
                          Curva
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
