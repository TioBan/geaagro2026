import React, { useState } from 'react';
import { DietFormulation, FeedIngredient } from '../../types/animalNutrition';
import {
  DollarSign,
  TrendingUp,
  Scale,
  PieChart,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface Props {
  formulations: DietFormulation[];
  ingredients: FeedIngredient[];
}

export const CostAnalysisView: React.FC<Props> = ({ formulations, ingredients }) => {
  const [selectedDietId, setSelectedDietId] = useState<string>(formulations[0]?.id || '');
  const [simulatedCornPrice, setSimulatedCornPrice] = useState<number>(1.15); // R$/kg milho
  const [simulatedSoyPrice, setSimulatedSoyPrice] = useState<number>(2.25); // R$/kg farelo soja
  const [simulatedMilkPrice, setSimulatedMilkPrice] = useState<number>(2.45); // R$/litro leite
  const [simulatedBeefPrice, setSimulatedBeefPrice] = useState<number>(19.50); // R$/kg vivo

  const currentDiet = (formulations || []).find((d) => d?.id === selectedDietId) || formulations?.[0] || null;
  const ingredientsMap = new Map<string, FeedIngredient>((ingredients || []).filter(i => i && i.id).map((i) => [i.id, i]));

  if (!currentDiet) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        Nenhuma formulação ativa encontrada para análise econômica. Crie uma dieta no Formulador primeiro.
      </div>
    );
  }

  // Calculate items cost share
  const itemsCostBreakdown = (currentDiet.items || []).map((item) => {
    const ing = ingredientsMap.get(item.ingredientId);
    let pricePerKg = ing ? ing.pricePerKg : 1.0;
    // Apply simulation price if corn or soybean
    if (item.ingredientId === 'milho_moido') pricePerKg = simulatedCornPrice;
    if (item.ingredientId === 'farelo_soja_46') pricePerKg = simulatedSoyPrice;

    const freightPerKg = (ing?.freightPerTon || 0) / 1000;
    const opFactor = 1 + (ing?.operationalCostPct || 0) / 100;
    const effectivePriceMn = (pricePerKg + freightPerKg) * opFactor;
    const dailyCostPerAnimal = item.inclusionKgMnPerAnimal * effectivePriceMn;

    return {
      ingredientName: ing ? ing.name : item.ingredientId,
      category: ing ? ing.category : 'Outros',
      inclusionKgMn: item.inclusionKgMnPerAnimal,
      pricePerKg,
      dailyCostPerAnimal,
    };
  });

  const totalDailyCostSimulated = itemsCostBreakdown.reduce((sum, it) => sum + it.dailyCostPerAnimal, 0);
  const costPerKgMsSimulated = currentDiet.totalDmiKgPerAnimal > 0 ? totalDailyCostSimulated / currentDiet.totalDmiKgPerAnimal : 0;

  // IOFC Simulation (Income Over Feed Cost)
  let simulatedRevenue = 0;
  let revenueLabel = '';
  let iofcDaily = 0;

  if (currentDiet.species === 'bovinos_leite') {
    const liters = 32.0;
    simulatedRevenue = liters * simulatedMilkPrice;
    revenueLabel = `${liters} L/vaca/dia @ R$ ${simulatedMilkPrice.toFixed(2)}/L`;
    iofcDaily = simulatedRevenue - totalDailyCostSimulated;
  } else if (currentDiet.species === 'bovinos_corte') {
    const gmd = 1.5;
    simulatedRevenue = gmd * simulatedBeefPrice;
    revenueLabel = `${gmd} kg GMD/dia @ R$ ${simulatedBeefPrice.toFixed(2)}/kg vivo`;
    iofcDaily = simulatedRevenue - totalDailyCostSimulated;
  } else {
    simulatedRevenue = totalDailyCostSimulated * 1.45;
    revenueLabel = 'Receita Estimada Média';
    iofcDaily = simulatedRevenue - totalDailyCostSimulated;
  }

  // Corn price sensitivity variations (-20%, -10%, Base, +10%, +20%)
  const sensitivityVariations = [-0.2, -0.1, 0, 0.1, 0.2];

  return (
    <div id="cost-analysis-view" className="space-y-6">
      {/* Header & Diet Selector */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Análise Econômica & Margem sobre Custo Alimentar (IOFC)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Demonstrativo de custos, sensibilidade a variações de commodities e rentabilidade diária
          </p>
        </div>

        <select
          value={selectedDietId}
          onChange={(e) => setSelectedDietId(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
        >
          {formulations.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} ({f.species})
            </option>
          ))}
        </select>
      </div>

      {/* Main KPI Economic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cost per Animal/Day */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-medium text-slate-400">Custo Alimentar / Animal / Dia</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white">R$ {totalDailyCostSimulated.toFixed(2)}</span>
            <span className="text-xs text-slate-400">/dia</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            R$ {(totalDailyCostSimulated * 30.5).toFixed(2)} / mês por cabeça
          </p>
        </div>

        {/* Cost per kg DM */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-medium text-slate-400">Custo por kg de Matéria Seca</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-emerald-400">R$ {costPerKgMsSimulated.toFixed(2)}</span>
            <span className="text-xs text-slate-400">/kg MS</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Consumo: {currentDiet.totalDmiKgPerAnimal} kg MS/cab/dia
          </p>
        </div>

        {/* IOFC (Income Over Feed Cost) */}
        <div className="bg-gradient-to-br from-emerald-950/50 to-slate-900 border border-emerald-500/40 rounded-xl p-4">
          <span className="text-xs font-bold text-emerald-400">IOFC (Margem sobre Ração)</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-emerald-300">R$ {iofcDaily.toFixed(2)}</span>
            <span className="text-xs text-emerald-400 font-semibold">/cab/dia</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">{revenueLabel}</p>
        </div>

        {/* Herd Total Monthly Cost */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-medium text-slate-400">Desembolso Mensal do Lote</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-amber-400">
              R$ {(totalDailyCostSimulated * currentDiet.animalCount * 30.5).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Para {currentDiet.animalCount} animais no lote
          </p>
        </div>
      </div>

      {/* Ingredient Cost Participation Table & Sensitivity Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cost Participation Table (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Composição Detalhada dos Custos por Ingrediente
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="pb-2 font-semibold">Ingrediente</th>
                  <th className="pb-2 font-semibold text-right">kg MN / cab</th>
                  <th className="pb-2 font-semibold text-right">Preço (R$/kg)</th>
                  <th className="pb-2 font-semibold text-right">Custo Diário</th>
                  <th className="pb-2 font-semibold text-right">% do Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {itemsCostBreakdown.map((item, idx) => {
                  const pctOfTotal = totalDailyCostSimulated > 0 ? (item.dailyCostPerAnimal / totalDailyCostSimulated) * 100 : 0;

                  return (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-2.5 font-medium text-white">
                        {item.ingredientName}
                        <span className="block text-[10px] text-slate-500">{item.category}</span>
                      </td>
                      <td className="py-2.5 text-right text-slate-300">{item.inclusionKgMn.toFixed(2)} kg</td>
                      <td className="py-2.5 text-right text-slate-300">R$ {item.pricePerKg.toFixed(2)}</td>
                      <td className="py-2.5 text-right font-bold text-white">
                        R$ {item.dailyCostPerAnimal.toFixed(2)}
                      </td>
                      <td className="py-2.5 text-right font-bold text-emerald-400">{pctOfTotal.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-700 font-bold text-slate-200">
                  <td className="pt-3">Total Alimentar / Animal / Dia</td>
                  <td className="pt-3 text-right">
                    {itemsCostBreakdown.reduce((s, it) => s + it.inclusionKgMn, 0).toFixed(2)} kg
                  </td>
                  <td className="pt-3"></td>
                  <td className="pt-3 text-right text-emerald-400">R$ {totalDailyCostSimulated.toFixed(2)}</td>
                  <td className="pt-3 text-right text-emerald-400">100.0%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Commodity Price Sensitivity Matrix & Market Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Simulador de Sensibilidade a Grãos & Receita
            </h4>
            <p className="text-xs text-slate-400">
              Altere as cotações de mercado para projetar o impacto direto no custo da diária e margem IOFC
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Preço do Milho Grão (R$/kg):</span>
                  <strong className="text-white">R$ {simulatedCornPrice.toFixed(2)} / kg (R$ {(simulatedCornPrice * 60).toFixed(2)}/saca)</strong>
                </div>
                <input
                  type="range"
                  min="0.70"
                  max="1.80"
                  step="0.05"
                  value={simulatedCornPrice}
                  onChange={(e) => setSimulatedCornPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Preço do Farelo de Soja (R$/kg):</span>
                  <strong className="text-white">R$ {simulatedSoyPrice.toFixed(2)} / kg (R$ {(simulatedSoyPrice * 1000).toFixed(0)}/t)</strong>
                </div>
                <input
                  type="range"
                  min="1.40"
                  max="3.20"
                  step="0.05"
                  value={simulatedSoyPrice}
                  onChange={(e) => setSimulatedSoyPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {currentDiet.species === 'bovinos_leite' && (
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Preço Pago pelo Leite (R$/Litro):</span>
                    <strong className="text-emerald-400">R$ {simulatedMilkPrice.toFixed(2)} / L</strong>
                  </div>
                  <input
                    type="range"
                    min="1.80"
                    max="3.50"
                    step="0.05"
                    value={simulatedMilkPrice}
                    onChange={(e) => setSimulatedMilkPrice(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-400"
                  />
                </div>
              )}
            </div>

            {/* Sensitivity Grid */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-300 block">
                Matriz de Impacto no Custo da Diária (Milho):
              </span>
              <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
                {sensitivityVariations.map((variation, idx) => {
                  const cornPrice = simulatedCornPrice * (1 + variation);
                  const cornItem = currentDiet.items.find((it) => it.ingredientId === 'milho_moido');
                  const deltaCost = cornItem ? cornItem.inclusionKgMnPerAnimal * (cornPrice - simulatedCornPrice) : 0;
                  const newDaily = totalDailyCostSimulated + deltaCost;

                  return (
                    <div
                      key={idx}
                      className={`p-1.5 rounded-lg ${
                        variation === 0 ? 'bg-emerald-500/20 border border-emerald-500/40 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="block font-bold">{(variation * 100 > 0 ? '+' : '') + variation * 100}%</span>
                      <strong className="block text-xs mt-0.5 text-slate-200">R$ {newDaily.toFixed(2)}</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
