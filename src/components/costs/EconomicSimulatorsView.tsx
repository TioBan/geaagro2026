import React, { useState } from 'react';
import { EconomicKPIs, EconomicSimulationInput, PropertyCropSeason } from '../../types/costs';
import { runEconomicSimulation } from '../../utils/costStorage';
import { RotateCcw, Scale, Sliders, TrendingUp } from 'lucide-react';

interface EconomicSimulatorsViewProps {
  kpis: EconomicKPIs;
  season: PropertyCropSeason;
}

export const EconomicSimulatorsView: React.FC<EconomicSimulatorsViewProps> = ({ kpis, season }) => {
  const [fertChange, setFertChange] = useState<number>(15);
  const [passReduction, setPassReduction] = useState<number>(1);
  const [fuelChange, setFuelChange] = useState<number>(10);
  const [yieldChange, setYieldChange] = useState<number>(0);
  const [commodityPrice, setCommodityPrice] = useState<number>(135.0);

  const simInput: EconomicSimulationInput = {
    fertilizerPriceChangePct: fertChange,
    pesticidePassReductionCount: passReduction,
    fuelPriceChangePct: fuelChange,
    expectedYieldChangePct: yieldChange,
    commodityPricePerBag: commodityPrice,
  };

  const simResult = runEconomicSimulation(kpis, simInput);

  const handleReset = () => {
    setFertChange(0);
    setPassReduction(0);
    setFuelChange(0);
    setYieldChange(0);
    setCommodityPrice(135.0);
  };

  return (
    <div className="space-y-5">
      {/* Header Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
            Simulador Econômico de Sensibilidade
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Projete variações de insumos, diesel, produtividade e cotação para {season.seasonName}.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Zerar Cenário
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Parâmetros */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-5">
          <h4 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Parâmetros Simulados
          </h4>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 dark:text-zinc-300 font-medium">Variação do Fertilizante</span>
              <span
                className={`font-semibold tabular-nums ${
                  fertChange > 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {fertChange > 0 ? `+${fertChange}%` : `${fertChange}%`}
              </span>
            </div>
            <input
              type="range"
              min={-30}
              max={50}
              value={fertChange}
              onChange={(e) => setFertChange(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 dark:text-zinc-300 font-medium">Redução de Pulverizações</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                {passReduction > 0 ? `-${passReduction} aplicação(ões)` : 'Sem redução'}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={3}
              value={passReduction}
              onChange={(e) => setPassReduction(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 dark:text-zinc-300 font-medium">Variação do Preço do Diesel</span>
              <span
                className={`font-semibold tabular-nums ${
                  fuelChange > 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {fuelChange > 0 ? `+${fuelChange}%` : `${fuelChange}%`}
              </span>
            </div>
            <input
              type="range"
              min={-20}
              max={40}
              value={fuelChange}
              onChange={(e) => setFuelChange(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 dark:text-zinc-300 font-medium">Variação de Produtividade</span>
              <span
                className={`font-semibold tabular-nums ${
                  yieldChange >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {yieldChange > 0 ? `+${yieldChange}%` : `${yieldChange}%`}
              </span>
            </div>
            <input
              type="range"
              min={-30}
              max={30}
              value={yieldChange}
              onChange={(e) => setYieldChange(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block">
              Preço de Venda da Saca (R$/sc)
            </label>
            <input
              type="number"
              value={commodityPrice}
              onChange={(e) => setCommodityPrice(Number(e.target.value))}
              step={0.5}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 font-semibold text-xs tabular-nums outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Impacto Financeiro */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-5">
          <h4 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Impacto no Resultado da Safra
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800 space-y-1">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Custo Original / ha</span>
              <span className="text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums block">
                R$ {simResult.baseCostPerHa.toLocaleString('pt-BR')}
              </span>
            </div>

            <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/70 dark:border-emerald-900/50 space-y-1">
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium block">
                Custo Simulado / ha
              </span>
              <span className="text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums block">
                R$ {simResult.simulatedCostPerHa.toLocaleString('pt-BR')}
              </span>
              <span
                className={`text-[11px] block font-semibold tabular-nums ${
                  simResult.costDifferencePerHa > 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {simResult.costDifferencePerHa >= 0
                  ? `+R$ ${simResult.costDifferencePerHa}`
                  : `-R$ ${Math.abs(simResult.costDifferencePerHa)}`}{' '}
                / ha
              </span>
            </div>
          </div>

          <div className="text-xs divide-y divide-slate-100 dark:divide-zinc-800">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600 dark:text-zinc-400">Novo Ponto de Equilíbrio</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                {simResult.simulatedBreakEvenBagsHa} sc/ha
              </span>
            </div>

            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600 dark:text-zinc-400">Novo Custo por Saca Produzida</span>
              <span className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                R$ {simResult.simulatedCostPerBag.toFixed(2)}
              </span>
            </div>

            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600 dark:text-zinc-400">Margem Líquida Simulada</span>
              <span
                className={`font-bold tabular-nums ${
                  simResult.simulatedNetMarginPerHa >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {simResult.simulatedProfitabilityPct}% (R$ {simResult.simulatedNetMarginPerHa.toLocaleString('pt-BR')}/ha)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Painel COE / COT / CTP */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-4">
        <h4 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-2">
          <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Indicadores Econômicos Base (COE, COT, CTP)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800 space-y-1">
            <span className="font-semibold text-slate-800 dark:text-zinc-200 block">COE — Custo Operacional Efetivo</span>
            <p className="text-slate-500 dark:text-zinc-400 text-[11px]">
              Insumos, mão de obra direta, operações de máquinas e irrigação.
            </p>
            <div className="text-lg font-bold text-slate-900 dark:text-zinc-100 pt-1 tabular-nums">
              R$ {kpis.coe.toLocaleString('pt-BR')} / ha
            </div>
          </div>

          <div className="p-3.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800 space-y-1">
            <span className="font-semibold text-slate-800 dark:text-zinc-200 block">COT — Custo Operacional Total</span>
            <p className="text-slate-500 dark:text-zinc-400 text-[11px]">
              COE somado à depreciação de máquinas, seguros e custos fixos.
            </p>
            <div className="text-lg font-bold text-slate-900 dark:text-zinc-100 pt-1 tabular-nums">
              R$ {kpis.cot.toLocaleString('pt-BR')} / ha
            </div>
          </div>

          <div className="p-3.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800 space-y-1">
            <span className="font-semibold text-slate-800 dark:text-zinc-200 block">CTP — Custo Total de Produção</span>
            <p className="text-slate-500 dark:text-zinc-400 text-[11px]">
              COT mais remuneração do capital próprio e custo de oportunidade da terra.
            </p>
            <div className="text-lg font-bold text-slate-900 dark:text-zinc-100 pt-1 tabular-nums">
              R$ {kpis.ctp.toLocaleString('pt-BR')} / ha
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
