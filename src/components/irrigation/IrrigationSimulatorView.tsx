import React, { useState } from 'react';
import { IrrigationSystemType, ScenarioSimulationInput } from '../../types/irrigation';
import { runIrrigationScenarioSimulation } from '../../utils/irrigationStorage';
import { Sparkles, DollarSign, Droplets, Zap, TrendingUp, Calculator } from 'lucide-react';

export const IrrigationSimulatorView: React.FC = () => {
  const [systemType, setSystemType] = useState<IrrigationSystemType>('Pivô Central');
  const [targetDepthMm, setTargetDepthMm] = useState(15);
  const [irrigationIntervalDays, setIrrigationIntervalDays] = useState(3);
  const [energySchedule, setEnergySchedule] = useState<ScenarioSimulationInput['energyTariffSchedule']>('Fora de Ponta (Noite)');
  const [rateBrlKwh, setRateBrlKwh] = useState(0.70);
  const [yieldIncreasePct, setYieldIncreasePct] = useState(12);
  const [irrigatedAreaHa, setIrrigatedAreaHa] = useState(80);

  const simulation = runIrrigationScenarioSimulation(
    {
      systemType,
      targetDepthMm,
      irrigationIntervalDays,
      energyTariffSchedule: energySchedule,
      electricityRateBrlKwh: rateBrlKwh,
      expectedYieldIncreasePct: yieldIncreasePct,
    },
    irrigatedAreaHa
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-950 via-cyan-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-800/40 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Simulador Inteligente "E Se...?"
        </div>
        <h2 className="text-2xl font-black">Simulador de Cenários & Otimização Econômico-Hídrica</h2>
        <p className="text-xs text-amber-100/80">
          Simule o impacto financeiro e o consumo de recursos alterando lâminas, sistemas, tarifas de energia e intervalos de rega
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Variáveis de Simulação */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <Calculator className="w-4 h-4 text-amber-500" /> Variáveis do Cenário
          </h4>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Sistema de Irrigação</label>
              <select
                value={systemType}
                onChange={e => setSystemType(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
              >
                <option value="Pivô Central">Pivô Central</option>
                <option value="Gotejamento Superficial">Gotejamento Superficial</option>
                <option value="Gotejamento Subsuperficial (SDI)">Gotejamento Subsuperficial (SDI)</option>
                <option value="Microaspersão">Microaspersão</option>
                <option value="Aspersão Convencional">Aspersão Convencional</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Área Irrigada (ha)</label>
              <input
                type="number"
                value={irrigatedAreaHa}
                onChange={e => setIrrigatedAreaHa(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Lâmina (mm)</label>
                <input
                  type="number"
                  value={targetDepthMm}
                  onChange={e => setTargetDepthMm(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Turno (Dias)</label>
                <input
                  type="number"
                  value={irrigationIntervalDays}
                  onChange={e => setIrrigationIntervalDays(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Horário de Tarifação Elétrica</label>
              <select
                value={energySchedule}
                onChange={e => setEnergySchedule(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
              >
                <option value="Fora de Ponta (Noite)">Fora de Ponta (Noturno - 60% Desc.)</option>
                <option value="Horário de Ponta (17h-20h)">Horário de Ponta (17h-20h - Sobretaxa)</option>
                <option value="Bandeira Vermelha">Bandeira Vermelha Convencional</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Ganho de Produtividade Estimado (%)</label>
              <input
                type="number"
                value={yieldIncreasePct}
                onChange={e => setYieldIncreasePct(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Resultados da Simulação */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                <span>Consumo de Água Mensal</span>
                <Droplets className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {simulation.monthlyWaterConsumptionM3.toLocaleString('pt-BR')} <span className="text-xs font-normal text-slate-500">m³</span>
              </div>
              <p className="text-[11px] text-slate-500">Volume acumulado estimado para a área</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                <span>Custo com Energia Mensal</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                R$ {simulation.monthlyCostBrl.toLocaleString('pt-BR')}
              </div>
              <p className="text-[11px] text-slate-500">Custo unitário: R$ {simulation.costPerHaBrl}/ha</p>
            </div>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-800/40 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" /> Impacto na Margem Bruta Estimado
              </h4>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/30">
                Retorno Positivo
              </span>
            </div>

            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              + R$ {simulation.estimatedGrossMarginImpactBrl.toLocaleString('pt-BR')} / ha
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-300">
              Economia estimada pela irrigação noturna com desconto tarifário: <strong className="text-emerald-400">R$ {simulation.energySavingsNightTariffBrl.toLocaleString('pt-BR')}</strong> por safra.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
