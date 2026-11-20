import React, { useState } from 'react';
import { BuffaloAnimal } from '../../types/buffalo';
import { BUFFALO_FEEDS } from '../../data/buffaloData';
import { Wheat } from 'lucide-react';

interface BuffaloNutritionViewProps {
  animals: BuffaloAnimal[];
}

type NutritionCategory = 'Matriz em Lactação' | 'Garrote em Engorda' | 'Bezerro Desmame';

const inputCls =
  'w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500';
const labelCls = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const BuffaloNutritionView: React.FC<BuffaloNutritionViewProps> = ({ animals }) => {
  const defaultWeight =
    animals.length > 0
      ? Math.round(animals.reduce((acc, a) => acc + (a.currentWeightKg || 0), 0) / animals.length) || 650
      : 650;

  const [targetCategory, setTargetCategory] = useState<NutritionCategory>('Matriz em Lactação');
  const [animalWeightKg, setAnimalWeightKg] = useState(defaultWeight);
  const [targetMilkLiters, setTargetMilkLiters] = useState(14);
  const [targetGmdKg, setTargetGmdKg] = useState(0.8);
  const [feedFilter, setFeedFilter] = useState<string>('todos');

  // Cálculo dinâmico de exigências para bubalinos
  const intakeRatePct =
    targetCategory === 'Matriz em Lactação'
      ? Number((2.2 + Math.min(0.6, targetMilkLiters * 0.025)).toFixed(2))
      : targetCategory === 'Garrote em Engorda'
        ? Number((2.1 + Math.min(0.4, targetGmdKg * 0.25)).toFixed(2))
        : 2.4;

  const totalDryMatterKg = Number(((animalWeightKg * intakeRatePct) / 100).toFixed(2));
  const pbPct =
    targetCategory === 'Matriz em Lactação'
      ? Number((12.5 + Math.min(3.5, targetMilkLiters * 0.14)).toFixed(1))
      : targetCategory === 'Garrote em Engorda'
        ? Number((11.0 + Math.min(2.5, targetGmdKg * 1.5)).toFixed(1))
        : 15.0;

  const tdnPct =
    targetCategory === 'Matriz em Lactação'
      ? Number((60 + Math.min(8, targetMilkLiters * 0.3)).toFixed(1))
      : targetCategory === 'Garrote em Engorda'
        ? Number((60 + Math.min(8, targetGmdKg * 5)).toFixed(1))
        : 66.0;

  const crudeProteinKgReq = Number(((totalDryMatterKg * pbPct) / 100).toFixed(2));
  const tdnKgReq = Number(((totalDryMatterKg * tdnPct) / 100).toFixed(2));

  // Custo estimado combinando volumoso + concentrado do banco de alimentos
  const forageCostPerKgMS = 0.32;
  const concCostPerKgMS = 1.95;
  const concShare =
    targetCategory === 'Matriz em Lactação'
      ? Math.min(0.45, 0.15 + targetMilkLiters * 0.015)
      : targetCategory === 'Garrote em Engorda'
        ? Math.min(0.4, 0.1 + targetGmdKg * 0.22)
        : 0.3;
  const estimatedCostDayBRL = Number(
    (totalDryMatterKg * ((1 - concShare) * forageCostPerKgMS + concShare * concCostPerKgMS)).toFixed(2)
  );
  const costPerLiterBRL =
    targetCategory === 'Matriz em Lactação' && targetMilkLiters > 0
      ? Number((estimatedCostDayBRL / targetMilkLiters).toFixed(2))
      : 0;

  const filteredFeeds =
    feedFilter === 'todos' ? BUFFALO_FEEDS : BUFFALO_FEEDS.filter(f => f.type === feedFilter);

  return (
    <div className="space-y-4">
      {/* Calculadora Nutricional Interativa */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Wheat className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Calculadora Nutricional &amp; Eficiência Fibrolítica</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            O rúmen bubalino possui microbiota celulolítica até 30% mais ativa, elevando a conversão de forragens fibrosas em sólidos do leite e ganho ponderal.
          </p>
        </div>

        {/* Entradas interativas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Categoria Alvo</label>
            <select
              value={targetCategory}
              onChange={(e) => {
                const cat = e.target.value as NutritionCategory;
                setTargetCategory(cat);
                if (cat === 'Matriz em Lactação') setAnimalWeightKg(650);
                else if (cat === 'Garrote em Engorda') setAnimalWeightKg(420);
                else setAnimalWeightKg(180);
              }}
              className={inputCls}
            >
              <option value="Matriz em Lactação">Matriz em Lactação</option>
              <option value="Garrote em Engorda">Garrote em Engorda</option>
              <option value="Bezerro Desmame">Bezerro em Desmame</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Peso Vivo Médio (kg)</label>
            <input
              type="number"
              min="60"
              max="1100"
              step="10"
              value={animalWeightKg}
              onChange={(e) => setAnimalWeightKg(Number(e.target.value) || 0)}
              className={inputCls}
            />
          </div>

          {targetCategory === 'Matriz em Lactação' ? (
            <div>
              <label className={labelCls}>Meta de Leite (L/dia)</label>
              <input
                type="number"
                min="2"
                max="30"
                step="0.5"
                value={targetMilkLiters}
                onChange={(e) => setTargetMilkLiters(Number(e.target.value) || 0)}
                className={inputCls}
              />
            </div>
          ) : (
            <div>
              <label className={labelCls}>Meta de GMD (kg/dia)</label>
              <input
                type="number"
                min="0.2"
                max="1.6"
                step="0.05"
                value={targetGmdKg}
                onChange={(e) => setTargetGmdKg(Number(e.target.value) || 0)}
                className={inputCls}
              />
            </div>
          )}
        </div>

        {/* Faixa de Resultados */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <div className="p-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Consumo MS (CMS)</span>
            <span className="text-base font-semibold text-slate-900 dark:text-white tabular-nums">
              {totalDryMatterKg} kg/dia
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block tabular-nums">
              {intakeRatePct}% do PV
            </span>
          </div>

          <div className="p-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Proteína Bruta (PB)</span>
            <span className="text-base font-semibold text-slate-900 dark:text-white tabular-nums">
              {crudeProteinKgReq} kg/dia
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block tabular-nums">{pbPct}% na MS</span>
          </div>

          <div className="p-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Energia (NDT)</span>
            <span className="text-base font-semibold text-teal-600 dark:text-teal-400 tabular-nums">
              {tdnKgReq} kg/dia
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block tabular-nums">{tdnPct}% NDT</span>
          </div>

          <div className="p-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Custo Estimado</span>
            <span className="text-base font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              R$ {estimatedCostDayBRL.toFixed(2)}/dia
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block tabular-nums">
              {costPerLiterBRL > 0 ? `R$ ${costPerLiterBRL.toFixed(2)} / L leite` : `${Math.round(concShare * 100)}% concentrado`}
            </span>
          </div>
        </div>
      </section>

      {/* Banco de Alimentos */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
            Banco de Ingredientes &amp; Bromatologia ({filteredFeeds.length})
          </h3>
          <select
            value={feedFilter}
            onChange={(e) => setFeedFilter(e.target.value)}
            className="h-7 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-md text-xs text-slate-800 dark:text-zinc-200"
          >
            <option value="todos">Todos os tipos</option>
            <option value="Volumoso Pasto">Volumoso Pasto</option>
            <option value="Silagem">Silagem</option>
            <option value="Feno">Feno</option>
            <option value="Concentrado Energético">Concentrado Energético</option>
            <option value="Concentrado Proteico">Concentrado Proteico</option>
            <option value="Suplemento Mineral com Macro/Micros">Suplemento Mineral</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
              <tr>
                <th className="py-2 pr-3 font-medium">Alimento / Forragem</th>
                <th className="py-2 px-3 font-medium">Tipo</th>
                <th className="py-2 px-3 font-medium text-right">MS (%)</th>
                <th className="py-2 px-3 font-medium text-right">PB (%)</th>
                <th className="py-2 px-3 font-medium text-right">NDT (%)</th>
                <th className="py-2 px-3 font-medium text-right">FDN (%)</th>
                <th className="py-2 pl-3 font-medium text-right">Custo (R$/kg MN)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 tabular-nums">
              {filteredFeeds.map(feed => (
                <tr key={feed.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                  <td className="py-2.5 pr-3 font-medium text-slate-900 dark:text-white">{feed.name}</td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">{feed.type}</td>
                  <td className="py-2.5 px-3 text-right">{feed.dryMatterPct}%</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-teal-600 dark:text-teal-400">
                    {feed.crudeProteinPct}%
                  </td>
                  <td className="py-2.5 px-3 text-right">{feed.totalDigestibleNutrientsPct}%</td>
                  <td className="py-2.5 px-3 text-right text-slate-600 dark:text-zinc-400">
                    {feed.neutralDetergentFiberPct}%
                  </td>
                  <td className="py-2.5 pl-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                    R$ {feed.costPerKgNaturalBRL.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
