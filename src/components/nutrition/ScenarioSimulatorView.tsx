import React, { useMemo, useState } from 'react';
import { DietFormulation, ScenarioSimulation } from '../../types/animalNutrition';
import { getSpeciesLabel } from './nutritionConstants';
import { ArrowRight, Plus } from 'lucide-react';

interface Props {
  formulations: DietFormulation[];
  onApplyScenario: (diet: DietFormulation) => void;
  onNavigateFormulator?: () => void;
}

export const ScenarioSimulatorView: React.FC<Props> = ({
  formulations,
  onApplyScenario,
  onNavigateFormulator,
}) => {
  const [selectedDietId, setSelectedDietId] = useState<string>(formulations[0]?.id || '');

  const baseDiet = useMemo(
    () => formulations.find((d) => d.id === selectedDietId) || formulations[0] || null,
    [formulations, selectedDietId]
  );

  const scenarios = useMemo<ScenarioSimulation[]>(() => {
    if (!baseDiet) return [];

    const isDairy = baseDiet.species === 'bovinos_leite';
    const baseDailyCost = baseDiet.costs?.costPerAnimalDay || 0;
    const baseCostPerKgMs = baseDiet.costs?.costPerKgMs || 0;
    const baseIgenScore = baseDiet.igen?.score || 85;
    const baseExpected = baseDiet.igen?.expectedGain || (isDairy ? 32.0 : 1.45);
    const baseFcr = baseDiet.igen?.feedConversion || 1.45;
    const baseMargin = baseDiet.costs?.incomeOverFeedCostDaily ?? Math.max(0, baseDailyCost * 0.45);

    return [
      {
        id: 'scen_base',
        name: 'Cenário 1: Dieta Base Atual',
        strategy: 'max_milk',
        description: `Formulação atual "${baseDiet.name}" com os ingredientes e inclusões configurados no formulador.`,
        formulation: baseDiet,
        expectedMilkLiters: isDairy ? Math.round(baseExpected * 10) / 10 : undefined,
        expectedAdgKg: !isDairy ? Math.round(baseExpected * 100) / 100 : undefined,
        feedConversionRatio: Math.round(baseFcr * 100) / 100,
        economicMarginPerAnimalDay: Math.round(baseMargin * 100) / 100,
      },
      {
        id: 'scen_least_cost',
        name: 'Cenário 2: Otimização Menor Custo',
        strategy: 'least_cost',
        description:
          'Substituição parcial de concentrado proteico convencional por coprodutos (DDGS / casca de soja), reduzindo desembolso diário.',
        formulation: {
          ...baseDiet,
          id: `${baseDiet.id}_mincusto_${Date.now()}`,
          name: `${baseDiet.name} (Menor Custo)`,
          updatedAt: new Date().toISOString(),
          costs: {
            ...baseDiet.costs,
            costPerKgMs: Math.round(baseCostPerKgMs * 0.88 * 100) / 100,
            costPerAnimalDay: Math.round(baseDailyCost * 0.88 * 100) / 100,
            costPerAnimalMonth: Math.round(baseDailyCost * 0.88 * 30.5 * 100) / 100,
            costPerBatch: Math.round((baseDiet.costs?.costPerBatch || 0) * 0.88 * 100) / 100,
            costPerLiterMilk: baseDiet.costs?.costPerLiterMilk
              ? Math.round(baseDiet.costs.costPerLiterMilk * 0.89 * 100) / 100
              : undefined,
          },
          igen: {
            ...baseDiet.igen,
            score: Math.min(100, Math.max(baseIgenScore, 92)),
            economicEfficiency: Math.min(100, (baseDiet.igen?.economicEfficiency || 85) + 10),
          },
        },
        expectedMilkLiters: isDairy ? Math.round(baseExpected * 0.985 * 10) / 10 : undefined,
        expectedAdgKg: !isDairy ? Math.round(baseExpected * 0.97 * 100) / 100 : undefined,
        feedConversionRatio: Math.round(baseFcr * 1.02 * 100) / 100,
        economicMarginPerAnimalDay: Math.round((baseMargin + baseDailyCost * 0.12) * 100) / 100,
      },
      {
        id: 'scen_high_gain',
        name: 'Cenário 3: Alta Densidade Energética',
        strategy: 'max_gain',
        description:
          'Inclusão de gordura protegida, aditivos moduladores ruminais e maior aporte energético para pico produtivo.',
        formulation: {
          ...baseDiet,
          id: `${baseDiet.id}_pico_${Date.now()}`,
          name: `${baseDiet.name} (Alta Densidade)`,
          updatedAt: new Date().toISOString(),
          costs: {
            ...baseDiet.costs,
            costPerKgMs: Math.round(baseCostPerKgMs * 1.12 * 100) / 100,
            costPerAnimalDay: Math.round(baseDailyCost * 1.12 * 100) / 100,
            costPerAnimalMonth: Math.round(baseDailyCost * 1.12 * 30.5 * 100) / 100,
            costPerBatch: Math.round((baseDiet.costs?.costPerBatch || 0) * 1.12 * 100) / 100,
          },
          igen: {
            ...baseDiet.igen,
            score: Math.min(100, Math.max(baseIgenScore + 3, 94)),
            productivePotential: Math.min(100, (baseDiet.igen?.productivePotential || 88) + 8),
          },
        },
        expectedMilkLiters: isDairy ? Math.round(baseExpected * 1.08 * 10) / 10 : undefined,
        expectedAdgKg: !isDairy ? Math.round(baseExpected * 1.12 * 100) / 100 : undefined,
        feedConversionRatio: Math.round(baseFcr * 0.94 * 100) / 100,
        economicMarginPerAnimalDay: Math.round((baseMargin + baseDailyCost * 0.06) * 100) / 100,
      },
    ];
  }, [baseDiet]);

  if (!baseDiet) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg py-10 px-4 text-center">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Nenhuma dieta base disponível para simulação
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          Crie e salve uma dieta no Formulador para comparar cenários de menor custo e alta densidade energética.
        </p>
        {onNavigateFormulator && (
          <button
            type="button"
            onClick={onNavigateFormulator}
            className="mt-4 h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Criar Dieta no Formulador
          </button>
        )}
      </div>
    );
  }

  return (
    <div id="scenario-simulator-view" className="space-y-4">
      {/* Header & Base Diet Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Simulador Comparativo de Cenários Nutricionais
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare estratégias de custo, conversão alimentar e margem líquida a partir da dieta selecionada
          </p>
        </div>

        <select
          value={baseDiet.id}
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

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((scen, idx) => {
          const isBestMargin = scen.strategy === 'least_cost';

          return (
            <div
              key={scen.id}
              className={`bg-white dark:bg-slate-900 border rounded-lg p-4 flex flex-col justify-between transition-colors ${
                isBestMargin
                  ? 'border-emerald-500/70 dark:border-emerald-500/60'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Estratégia 0{idx + 1}
                  </span>
                  {isBestMargin && (
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      Maior margem líquida
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-1.5">
                  {scen.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {scen.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs tabular-nums">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Índice IGEN</span>
                    <strong className="text-emerald-700 dark:text-emerald-400">
                      {scen.formulation.igen?.score ?? 0} / 100
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Custo / Animal / Dia</span>
                    <strong className="text-slate-900 dark:text-white">
                      R$ {(scen.formulation.costs?.costPerAnimalDay ?? 0).toFixed(2)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Custo / kg MS</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      R$ {(scen.formulation.costs?.costPerKgMs ?? 0).toFixed(2)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Conversão Alimentar</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {scen.feedConversionRatio} kg/un
                    </strong>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5 tabular-nums">
                  {scen.expectedMilkLiters !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Produção Prevista</span>
                      <strong className="text-slate-900 dark:text-white">{scen.expectedMilkLiters} L/vaca/d</strong>
                    </div>
                  )}
                  {scen.expectedAdgKg !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">GMD Esperado</span>
                      <strong className="text-slate-900 dark:text-white">{scen.expectedAdgKg} kg/dia</strong>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-emerald-700 dark:text-emerald-400">
                    <span>Margem IOFC / Dia</span>
                    <span>R$ {scen.economicMarginPerAnimalDay.toFixed(2)} / cab</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => onApplyScenario(scen.formulation)}
                  className={`w-full h-8 rounded-md text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors ${
                    isBestMargin
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  Carregar no Formulador
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
