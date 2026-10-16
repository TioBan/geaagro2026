import React, { useState } from 'react';
import { DietFormulation, ScenarioSimulation, FeedIngredient } from '../../types/animalNutrition';
import {
  GitCompare,
  TrendingUp,
  Sparkles,
  Award,
  DollarSign,
  Scale,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface Props {
  formulations: DietFormulation[];
  ingredients: FeedIngredient[];
  onApplyScenario: (diet: DietFormulation) => void;
}

export const ScenarioSimulatorView: React.FC<Props> = ({
  formulations,
  ingredients,
  onApplyScenario,
}) => {
  const baseDiet = formulations[0];

  // Pre-configured comparative scenarios
  const scenarios: ScenarioSimulation[] = [
    {
      id: 'scen_base',
      name: 'Cenário 1: Dieta Padrão Atual',
      strategy: 'max_milk',
      description: 'Formulação atual com silagem de milho, grão moído e farelo de soja 46%.',
      formulation: baseDiet,
      expectedMilkLiters: 34.5,
      expectedAdgKg: 1.55,
      feedConversionRatio: 1.45,
      economicMarginPerAnimalDay: 48.50,
    },
    {
      id: 'scen_least_cost',
      name: 'Cenário 2: Otimização Menor Custo',
      strategy: 'least_cost',
      description: 'Substituição de 30% do farelo de soja por DDGS de milho e casca de soja peletizada.',
      formulation: {
        ...baseDiet,
        name: 'Menor Custo com Coprodutos',
        costs: {
          ...baseDiet.costs,
          costPerKgMs: baseDiet.costs.costPerKgMs * 0.88,
          costPerAnimalDay: baseDiet.costs.costPerAnimalDay * 0.88,
          costPerLiterMilk: (baseDiet.costs.costPerLiterMilk || 1.05) * 0.89,
        },
        igen: {
          ...baseDiet.igen,
          score: 93,
          economicEfficiency: 97,
        },
      },
      expectedMilkLiters: 34.0,
      expectedAdgKg: 1.50,
      feedConversionRatio: 1.48,
      economicMarginPerAnimalDay: 52.80, // Maior margem líquida
    },
    {
      id: 'scen_high_gain',
      name: 'Cenário 3: Alta Densidade Energética (Pico)',
      strategy: 'max_gain',
      description: 'Adição de gordura protegida, glúten de milho e aditivos moduladores ruminais.',
      formulation: {
        ...baseDiet,
        name: 'Alta Densidade Energética',
        costs: {
          ...baseDiet.costs,
          costPerKgMs: baseDiet.costs.costPerKgMs * 1.12,
          costPerAnimalDay: baseDiet.costs.costPerAnimalDay * 1.12,
        },
        igen: {
          ...baseDiet.igen,
          score: 95,
          productivePotential: 98,
        },
      },
      expectedMilkLiters: 37.5,
      expectedAdgKg: 1.75,
      feedConversionRatio: 1.38,
      economicMarginPerAnimalDay: 51.20,
    },
  ];

  return (
    <div id="scenario-simulator-view" className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-emerald-400" />
          Simulador Comparativo de Cenários Nutricionais
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Compare diferentes estratégias nutricionais, coprodutos e aditivos para avaliar o impacto em GMD, produção de leite e margem líquida
        </p>
      </div>

      {/* Scenarios Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {scenarios.map((scen, idx) => {
          const isBestMargin = scen.strategy === 'least_cost';

          return (
            <div
              key={scen.id}
              className={`bg-slate-900/90 border rounded-2xl p-5 flex flex-col justify-between transition-all relative overflow-hidden ${
                isBestMargin
                  ? 'border-emerald-500/60 shadow-xl shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {isBestMargin && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-3 py-0.5 rounded-bl-xl shadow-md">
                  MAIOR MARGEM LÍQUIDA
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Estratégia {idx + 1}
                </span>
                <h4 className="text-sm font-bold text-white mt-1">{scen.name}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{scen.description}</p>

                {/* Score & Costs Box */}
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Índice IGEN:</span>
                    <strong className="text-emerald-400 font-bold flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      {scen.formulation.igen?.score || 90} pontos
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Custo / Animal / Dia:</span>
                    <strong className="text-white font-bold">
                      R$ {scen.formulation.costs?.costPerAnimalDay?.toFixed(2)}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Custo por kg MS:</span>
                    <strong className="text-slate-200">
                      R$ {scen.formulation.costs?.costPerKgMs?.toFixed(2)} / kg
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Conversão Alimentar:</span>
                    <strong className="text-blue-400">{scen.feedConversionRatio} kg/kg</strong>
                  </div>
                </div>

                {/* Productive & Economic Highlight */}
                <div className="mt-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700/60 text-xs space-y-1.5">
                  {scen.expectedMilkLiters && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Produção Prevista:</span>
                      <strong className="text-white font-bold">{scen.expectedMilkLiters} L / vaca / dia</strong>
                    </div>
                  )}
                  {scen.expectedAdgKg && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">GMD Esperado:</span>
                      <strong className="text-white font-bold">{scen.expectedAdgKg} kg / dia</strong>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t border-slate-700 text-emerald-400 font-bold">
                    <span>Margem IOFC / Dia:</span>
                    <span>+ R$ {scen.economicMarginPerAnimalDay.toFixed(2)} / cab</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 pt-3 border-t border-slate-800">
                <button
                  onClick={() => onApplyScenario(scen.formulation)}
                  className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isBestMargin
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  Carregar este Cenário no Formulador
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
