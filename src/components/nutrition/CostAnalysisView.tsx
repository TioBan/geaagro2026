import React, { useMemo, useState } from 'react';
import { DietFormulation, FeedIngredient } from '../../types/animalNutrition';
import { getIngredientCategoryLabel, getSpeciesLabel } from './nutritionConstants';
import { TrendingUp, Plus } from 'lucide-react';

interface Props {
  formulations: DietFormulation[];
  ingredients: FeedIngredient[];
  onNavigateFormulator?: () => void;
}

export const CostAnalysisView: React.FC<Props> = ({
  formulations,
  ingredients,
  onNavigateFormulator,
}) => {
  const [selectedDietId, setSelectedDietId] = useState<string>(formulations[0]?.id || '');
  const [simulatedCornPrice, setSimulatedCornPrice] = useState<number>(1.15);
  const [simulatedSoyPrice, setSimulatedSoyPrice] = useState<number>(2.25);
  const [simulatedMilkPrice, setSimulatedMilkPrice] = useState<number>(2.45);
  const [simulatedBeefPrice, setSimulatedBeefPrice] = useState<number>(19.5);

  const currentDiet =
    (formulations || []).find((d) => d?.id === selectedDietId) || formulations?.[0] || null;

  const ingredientsMap = useMemo(
    () => new Map<string, FeedIngredient>((ingredients || []).filter((i) => i && i.id).map((i) => [i.id, i])),
    [ingredients]
  );

  if (!currentDiet) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg py-10 px-4 text-center">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Nenhuma formulação ativa para análise econômica
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          Salve ao menos uma dieta no Formulador para projetar custo alimentar, participação de ingredientes e margem IOFC.
        </p>
        {onNavigateFormulator && (
          <button
            type="button"
            onClick={onNavigateFormulator}
            className="mt-4 h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Abrir Formulador
          </button>
        )}
      </div>
    );
  }

  const itemsCostBreakdown = (currentDiet.items || []).map((item) => {
    const ing = ingredientsMap.get(item.ingredientId);
    let pricePerKg = ing ? ing.pricePerKg : 1.0;
    if (item.ingredientId === 'milho_moido') pricePerKg = simulatedCornPrice;
    if (item.ingredientId === 'farelo_soja_46') pricePerKg = simulatedSoyPrice;

    const freightPerKg = (ing?.freightPerTon || 0) / 1000;
    const opFactor = 1 + (ing?.operationalCostPct || 0) / 100;
    const effectivePriceMn = (pricePerKg + freightPerKg) * opFactor;
    const dailyCostPerAnimal = item.inclusionKgMnPerAnimal * effectivePriceMn;

    return {
      ingredientId: item.ingredientId,
      ingredientName: ing ? ing.name : item.ingredientId,
      category: ing ? getIngredientCategoryLabel(ing.category) : 'Outros',
      inclusionKgMn: item.inclusionKgMnPerAnimal,
      pricePerKg,
      dailyCostPerAnimal,
    };
  });

  const totalDailyCostSimulated = itemsCostBreakdown.reduce((sum, it) => sum + it.dailyCostPerAnimal, 0);
  const costPerKgMsSimulated =
    currentDiet.totalDmiKgPerAnimal > 0 ? totalDailyCostSimulated / currentDiet.totalDmiKgPerAnimal : 0;

  let simulatedRevenue = 0;
  let revenueLabel = '';
  let iofcDaily = 0;

  if (currentDiet.species === 'bovinos_leite') {
    const liters = currentDiet.igen?.expectedGain && currentDiet.igen.expectedGain > 0 ? currentDiet.igen.expectedGain : 32.0;
    simulatedRevenue = liters * simulatedMilkPrice;
    revenueLabel = `${liters.toFixed(1)} L/vaca/d @ R$ ${simulatedMilkPrice.toFixed(2)}/L`;
    iofcDaily = simulatedRevenue - totalDailyCostSimulated;
  } else if (currentDiet.species === 'bovinos_corte') {
    const gmd = currentDiet.igen?.expectedGain && currentDiet.igen.expectedGain > 0 ? currentDiet.igen.expectedGain : 1.5;
    simulatedRevenue = gmd * simulatedBeefPrice;
    revenueLabel = `${gmd.toFixed(2)} kg GMD/d @ R$ ${simulatedBeefPrice.toFixed(2)}/kg`;
    iofcDaily = simulatedRevenue - totalDailyCostSimulated;
  } else {
    simulatedRevenue = totalDailyCostSimulated * 1.45;
    revenueLabel = 'Receita estimada padrão';
    iofcDaily = simulatedRevenue - totalDailyCostSimulated;
  }

  const sensitivityVariations = [-0.2, -0.1, 0, 0.1, 0.2];

  return (
    <div id="cost-analysis-view" className="space-y-4">
      {/* Header & Diet Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Análise Econômica & Margem sobre Custo Alimentar (IOFC)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Participação de ingredientes, sensibilidade a commodities e rentabilidade diária por lote
          </p>
        </div>

        <select
          value={currentDiet.id}
          onChange={(e) => setSelectedDietId(e.target.value)}
          className="h-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          {formulations.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} ({getSpeciesLabel(f.species)})
            </option>
          ))}
        </select>
      </div>

      {/* Unified 4-KPI Hairline Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Custo / Animal / Dia</span>
          <div className="mt-1 flex items-baseline gap-1 tabular-nums">
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              R$ {totalDailyCostSimulated.toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
            R$ {(totalDailyCostSimulated * 30.5).toFixed(2)} / mês por cabeça
          </p>
        </div>

        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Custo por kg de MS</span>
          <div className="mt-1 flex items-baseline gap-1 tabular-nums">
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              R$ {costPerKgMsSimulated.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">/kg MS</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
            Consumo: {currentDiet.totalDmiKgPerAnimal.toFixed(1)} kg MS/cab/d
          </p>
        </div>

        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Margem IOFC / Cabeça</span>
          <div className="mt-1 flex items-baseline gap-1 tabular-nums">
            <span
              className={`text-xl font-bold ${
                iofcDaily >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
              }`}
            >
              R$ {iofcDaily.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">/dia</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate tabular-nums">{revenueLabel}</p>
        </div>

        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Desembolso Mensal do Lote</span>
          <div className="mt-1 flex items-baseline gap-1 tabular-nums">
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              R${' '}
              {(totalDailyCostSimulated * currentDiet.animalCount * 30.5).toLocaleString('pt-BR', {
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
            Para {currentDiet.animalCount} animais no lote
          </p>
        </div>
      </div>

      {/* Main Split: Cost Table + Commodity Sensitivity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
              Participação dos Custos por Ingrediente
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-2 px-4 font-medium">Ingrediente</th>
                  <th className="py-2 px-3 font-medium text-right">kg MN/cab</th>
                  <th className="py-2 px-3 font-medium text-right">Preço/kg</th>
                  <th className="py-2 px-3 font-medium text-right">Custo/dia</th>
                  <th className="py-2 px-4 font-medium text-right">% Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 tabular-nums">
                {itemsCostBreakdown.map((item) => {
                  const pctOfTotal =
                    totalDailyCostSimulated > 0 ? (item.dailyCostPerAnimal / totalDailyCostSimulated) * 100 : 0;

                  return (
                    <tr key={item.ingredientId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-4">
                        <span className="font-medium text-slate-900 dark:text-slate-100 block">
                          {item.ingredientName}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{item.category}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                        {item.inclusionKgMn.toFixed(2)} kg
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                        R$ {item.pricePerKg.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-900 dark:text-white">
                        R$ {item.dailyCostPerAnimal.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                        {pctOfTotal.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 font-semibold tabular-nums">
                <tr>
                  <td className="py-2.5 px-4 text-slate-900 dark:text-white">Total / Animal / Dia</td>
                  <td className="py-2.5 px-3 text-right text-slate-900 dark:text-white">
                    {itemsCostBreakdown.reduce((s, it) => s + it.inclusionKgMn, 0).toFixed(2)} kg
                  </td>
                  <td className="py-2.5 px-3" />
                  <td className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-400">
                    R$ {totalDailyCostSimulated.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-emerald-700 dark:text-emerald-400">100.0%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Commodity Sensitivity Simulator */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Sensibilidade a Grãos & Receita
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Ajuste as cotações de mercado para simular impacto no custo diário e na margem IOFC
            </p>
          </div>

          <div className="space-y-3.5 text-xs tabular-nums">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-600 dark:text-slate-400">Milho Grão</span>
                <strong className="text-slate-900 dark:text-white">
                  R$ {simulatedCornPrice.toFixed(2)}/kg (R$ {(simulatedCornPrice * 60).toFixed(2)}/sc)
                </strong>
              </div>
              <input
                type="range"
                min="0.70"
                max="1.80"
                step="0.05"
                value={simulatedCornPrice}
                onChange={(e) => setSimulatedCornPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-600 dark:text-slate-400">Farelo de Soja</span>
                <strong className="text-slate-900 dark:text-white">
                  R$ {simulatedSoyPrice.toFixed(2)}/kg (R$ {(simulatedSoyPrice * 1000).toFixed(0)}/t)
                </strong>
              </div>
              <input
                type="range"
                min="1.40"
                max="3.20"
                step="0.05"
                value={simulatedSoyPrice}
                onChange={(e) => setSimulatedSoyPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {currentDiet.species === 'bovinos_leite' && (
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Preço Pago pelo Leite</span>
                  <strong className="text-emerald-700 dark:text-emerald-400">
                    R$ {simulatedMilkPrice.toFixed(2)} / L
                  </strong>
                </div>
                <input
                  type="range"
                  min="1.80"
                  max="3.50"
                  step="0.05"
                  value={simulatedMilkPrice}
                  onChange={(e) => setSimulatedMilkPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            )}

            {currentDiet.species === 'bovinos_corte' && (
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Preço do kg Vivo (Corte)</span>
                  <strong className="text-emerald-700 dark:text-emerald-400">
                    R$ {simulatedBeefPrice.toFixed(2)} / kg
                  </strong>
                </div>
                <input
                  type="range"
                  min="12.00"
                  max="28.00"
                  step="0.50"
                  value={simulatedBeefPrice}
                  onChange={(e) => setSimulatedBeefPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            )}
          </div>

          {/* Corn Sensitivity Matrix */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
              Impacto no Custo Diário por Variação do Milho
            </span>
            <div className="grid grid-cols-5 gap-1.5 text-center text-[11px] tabular-nums">
              {sensitivityVariations.map((variation) => {
                const cornPrice = simulatedCornPrice * (1 + variation);
                const cornItem = currentDiet.items.find((it) => it.ingredientId === 'milho_moido');
                const deltaCost = cornItem
                  ? cornItem.inclusionKgMnPerAnimal * (cornPrice - simulatedCornPrice)
                  : 0;
                const newDaily = totalDailyCostSimulated + deltaCost;

                return (
                  <div
                    key={variation}
                    className={`p-2 rounded-md border ${
                      variation === 0
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span className="block text-[10px] font-medium">
                      {variation > 0 ? `+${Math.round(variation * 100)}%` : `${Math.round(variation * 100)}%`}
                    </span>
                    <strong className="block text-xs mt-0.5 text-slate-900 dark:text-white">
                      R$ {newDaily.toFixed(2)}
                    </strong>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
