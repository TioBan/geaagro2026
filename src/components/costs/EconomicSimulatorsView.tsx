import React, { useState } from 'react';
import { EconomicKPIs, EconomicSimulationInput, PropertyCropSeason } from '../../types/costs';
import { runEconomicSimulation } from '../../utils/costStorage';
import { Sliders, Sparkles, TrendingUp, TrendingDown, DollarSign, Scale, HelpCircle, ArrowRight } from 'lucide-react';

interface EconomicSimulatorsViewProps {
  kpis: EconomicKPIs;
  season: PropertyCropSeason;
}

export const EconomicSimulatorsView: React.FC<EconomicSimulatorsViewProps> = ({ kpis, season }) => {
  const [fertChange, setFertChange] = useState<number>(15); // +15%
  const [passReduction, setPassReduction] = useState<number>(1); // -1 pulverização
  const [fuelChange, setFuelChange] = useState<number>(10); // +10%
  const [yieldChange, setYieldChange] = useState<number>(0); // 0%
  const [commodityPrice, setCommodityPrice] = useState<number>(135.00); // R$/saca

  const simInput: EconomicSimulationInput = {
    fertilizerPriceChangePct: fertChange,
    pesticidePassReductionCount: passReduction,
    fuelPriceChangePct: fuelChange,
    expectedYieldChangePct: yieldChange,
    commodityPricePerBag: commodityPrice,
  };

  const simResult = runEconomicSimulation(kpis, simInput);

  return (
    <div className="space-y-6">
      {/* Header Banner do Simulador */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 rounded-2xl shadow-md space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-emerald-300">
          <Sparkles className="w-3.5 h-3.5" />
          Simulador Econômico Exclusivo — "E Se...?"
        </div>
        <h3 className="text-2xl font-black">Análise de Sensibilidade & Cenários de Mercado</h3>
        <p className="text-emerald-100/80 text-xs max-w-2xl">
          Simule em tempo real variações no preço de fertilizantes, redução de aplicações, alteração no valor do diesel e oscilações da cotação de commodities para prever seu ponto de equilíbrio e margem de lucro.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Painel de Parâmetros de Simulação */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
          <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-base flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Parâmetros & Variações Simuladas
          </h4>

          {/* Slider Fertilizantes */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-zinc-300">Variação do Fertilizante:</span>
              <span className={fertChange >= 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                {fertChange >= 0 ? `+${fertChange}%` : `${fertChange}%`}
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

          {/* Slider Pulverizações */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-zinc-300">Redução de Aplicações de Defensivos:</span>
              <span className="text-emerald-600 font-bold">
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

          {/* Slider Combustível */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-zinc-300">Variação do Preço do Diesel:</span>
              <span className={fuelChange >= 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                {fuelChange >= 0 ? `+${fuelChange}%` : `${fuelChange}%`}
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

          {/* Input Cotação da Commodity */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">
              Preço de Venda da Saca da Commodity (R$ / saca):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={commodityPrice}
                onChange={(e) => setCommodityPrice(Number(e.target.value))}
                step={0.5}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-bold text-sm"
              />
            </div>
          </div>
        </div>

        {/* Resultado Impacto Financeiro */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
          <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Impacto no Resultado Final da Safra
          </h4>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl space-y-1">
              <span className="text-slate-500 block">Custo Original / ha</span>
              <span className="text-xl font-bold text-slate-900 dark:text-zinc-100">
                R$ {simResult.baseCostPerHa.toLocaleString('pt-BR')}
              </span>
            </div>

            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl space-y-1 border border-emerald-100 dark:border-emerald-900">
              <span className="text-emerald-700 dark:text-emerald-300 font-semibold block">Custo Simulado / ha</span>
              <span className="text-xl font-black text-emerald-900 dark:text-emerald-200">
                R$ {simResult.simulatedCostPerHa.toLocaleString('pt-BR')}
              </span>
              <span className={`text-[11px] block font-bold ${simResult.costDifferencePerHa > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {simResult.costDifferencePerHa >= 0 ? `+R$ ${simResult.costDifferencePerHa}` : `-R$ ${Math.abs(simResult.costDifferencePerHa)}`} / ha
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs divide-y divide-slate-100 dark:divide-zinc-800">
            <div className="py-2 flex justify-between">
              <span className="text-slate-600 dark:text-zinc-400">Novo Ponto de Equilíbrio (sacas/ha):</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{simResult.simulatedBreakEvenBagsHa} sc/ha</span>
            </div>

            <div className="py-2 flex justify-between">
              <span className="text-slate-600 dark:text-zinc-400">Novo Custo por Saca Produzida:</span>
              <span className="font-bold text-slate-900 dark:text-zinc-100">R$ {simResult.simulatedCostPerBag.toFixed(2)}</span>
            </div>

            <div className="py-2 flex justify-between">
              <span className="text-slate-600 dark:text-zinc-400">Margem Líquida Simulada:</span>
              <span className={`font-black ${simResult.simulatedNetMarginPerHa >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {simResult.simulatedProfitabilityPct}% (R$ {simResult.simulatedNetMarginPerHa.toLocaleString('pt-BR')} / ha)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Painel de Indicadores KPIs Oficiais (COE, COT, CTP) */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 space-y-4">
        <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-base flex items-center gap-2">
          <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Painel de Metricas Agronômico-Financeiras (COE, COT, CTP)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl space-y-1">
            <span className="font-bold text-slate-800 dark:text-zinc-200 block">COE — Custo Operacional Efetivo</span>
            <p className="text-slate-500 text-[11px]">Gastos com Insumos, Mão de Obra direta, Operações de Máquinas e Irrigação.</p>
            <div className="text-xl font-black text-slate-900 dark:text-zinc-100 pt-2">R$ {kpis.coe.toLocaleString('pt-BR')} / ha</div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl space-y-1">
            <span className="font-bold text-slate-800 dark:text-zinc-200 block">COT — Custo Operacional Total</span>
            <p className="text-slate-500 text-[11px]">COE + Depreciação de Máquinas, Benfeitorias e Custos Fixos de Gestão.</p>
            <div className="text-xl font-black text-slate-900 dark:text-zinc-100 pt-2">R$ {kpis.cot.toLocaleString('pt-BR')} / ha</div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl space-y-1">
            <span className="font-bold text-slate-800 dark:text-zinc-200 block">CTP — Custo Total de Produção</span>
            <p className="text-slate-500 text-[11px]">COT + Remuneração do Capital Próprio e Custo de Oportunidade da Terra.</p>
            <div className="text-xl font-black text-slate-900 dark:text-zinc-100 pt-2">R$ {kpis.ctp.toLocaleString('pt-BR')} / ha</div>
          </div>
        </div>
      </div>
    </div>
  );
};
