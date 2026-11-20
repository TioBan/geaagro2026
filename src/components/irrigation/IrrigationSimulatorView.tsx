import React, { useState } from 'react';
import { IrrigationSystemType, ScenarioSimulationInput } from '../../types/irrigation';
import { runIrrigationScenarioSimulation } from '../../utils/irrigationStorage';
import { Droplets, Zap, TrendingUp, Calculator } from 'lucide-react';
import {
  IRRIGATION_INPUT_CLASS,
  IRRIGATION_LABEL_CLASS,
  IRRIGATION_SYSTEM_TYPES,
} from './irrigationUi';

export const IrrigationSimulatorView: React.FC = () => {
  const [systemType, setSystemType] = useState<IrrigationSystemType>('Pivô Central');
  const [targetDepthMm, setTargetDepthMm] = useState(15);
  const [irrigationIntervalDays, setIrrigationIntervalDays] = useState(3);
  const [energySchedule, setEnergySchedule] =
    useState<ScenarioSimulationInput['energyTariffSchedule']>('Fora de Ponta (Noite)');
  const [rateBrlKwh, setRateBrlKwh] = useState(0.7);
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

  const isPositiveMargin = simulation.estimatedGrossMarginImpactBrl >= 0;

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
          Simulador de Cenários &amp; Otimização Econômico-Hídrica
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Compare consumo hídrico, custo energético por faixa tarifária e impacto estimado na margem bruta.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Variables */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
          <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
            <Calculator className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Variáveis do Cenário
          </h4>

          <div>
            <label className={IRRIGATION_LABEL_CLASS}>Sistema de Irrigação</label>
            <select
              value={systemType}
              onChange={(e) => setSystemType(e.target.value as IrrigationSystemType)}
              className={IRRIGATION_INPUT_CLASS}
            >
              {IRRIGATION_SYSTEM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className={IRRIGATION_LABEL_CLASS}>Área Irrigada (ha)</label>
              <input
                type="number"
                min="1"
                value={irrigatedAreaHa}
                onChange={(e) => setIrrigatedAreaHa(Number(e.target.value))}
                className={IRRIGATION_INPUT_CLASS}
              />
            </div>
            <div>
              <label className={IRRIGATION_LABEL_CLASS}>Tarifa Base (R$/kWh)</label>
              <input
                type="number"
                step="0.05"
                min="0"
                value={rateBrlKwh}
                onChange={(e) => setRateBrlKwh(Number(e.target.value))}
                className={IRRIGATION_INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className={IRRIGATION_LABEL_CLASS}>Lâmina (mm)</label>
              <input
                type="number"
                min="1"
                value={targetDepthMm}
                onChange={(e) => setTargetDepthMm(Number(e.target.value))}
                className={IRRIGATION_INPUT_CLASS}
              />
            </div>
            <div>
              <label className={IRRIGATION_LABEL_CLASS}>Turno (Dias)</label>
              <input
                type="number"
                min="1"
                value={irrigationIntervalDays}
                onChange={(e) => setIrrigationIntervalDays(Number(e.target.value))}
                className={IRRIGATION_INPUT_CLASS}
              />
            </div>
          </div>

          <div>
            <label className={IRRIGATION_LABEL_CLASS}>Horário de Tarifação Elétrica</label>
            <select
              value={energySchedule}
              onChange={(e) =>
                setEnergySchedule(
                  e.target.value as ScenarioSimulationInput['energyTariffSchedule']
                )
              }
              className={IRRIGATION_INPUT_CLASS}
            >
              <option value="Fora de Ponta (Noite)">Fora de Ponta (Noturno — 60% desc.)</option>
              <option value="Horário de Ponta (17h-20h)">Horário de Ponta (17h–20h — Sobretaxa)</option>
              <option value="Bandeira Vermelha">Bandeira Vermelha Convencional</option>
            </select>
          </div>

          <div>
            <label className={IRRIGATION_LABEL_CLASS}>Ganho de Produtividade Estimado (%)</label>
            <input
              type="number"
              value={yieldIncreasePct}
              onChange={(e) => setYieldIncreasePct(Number(e.target.value))}
              className={IRRIGATION_INPUT_CLASS}
            />
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
              <div className="flex justify-between items-center text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                <span>Consumo Mensal</span>
                <Droplets className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-zinc-100">
                {simulation.monthlyWaterConsumptionM3.toLocaleString('pt-BR')}{' '}
                <span className="text-xs font-normal text-slate-500">m³</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                Uso específico: {simulation.waterUseEfficiencyRatio} m³/saca
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
              <div className="flex justify-between items-center text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                <span>Energia Mensal</span>
                <Zap className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-zinc-100">
                {simulation.monthlyEnergyConsumptionKwh.toLocaleString('pt-BR')}{' '}
                <span className="text-xs font-normal text-slate-500">kWh</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                Tarifa base: R$ {rateBrlKwh.toFixed(2)}/kWh
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
              <div className="flex justify-between items-center text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                <span>Custo Energético</span>
                <Zap className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-zinc-100">
                R$ {simulation.monthlyCostBrl.toLocaleString('pt-BR')}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                Unitário: R$ {simulation.costPerHaBrl.toLocaleString('pt-BR')}/ha
              </p>
            </div>
          </div>

          <div
            className={`bg-white dark:bg-zinc-900 border rounded-xl p-5 space-y-3 ${
              isPositiveMargin
                ? 'border-emerald-200 dark:border-emerald-900/50'
                : 'border-rose-200 dark:border-rose-900/50'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <TrendingUp
                  className={`w-4 h-4 ${
                    isPositiveMargin
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                />
                Impacto Estimado na Margem Bruta
              </h4>
              <span
                className={`text-xs font-semibold ${
                  isPositiveMargin
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-rose-700 dark:text-rose-400'
                }`}
              >
                {isPositiveMargin ? 'Retorno Positivo' : 'Margem Negativa'}
              </span>
            </div>

            <div
              className={`text-2xl font-bold tabular-nums ${
                isPositiveMargin
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-rose-700 dark:text-rose-400'
              }`}
            >
              {isPositiveMargin ? '+' : '-'} R${' '}
              {Math.abs(simulation.estimatedGrossMarginImpactBrl).toLocaleString('pt-BR')} / ha
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed tabular-nums">
              Economia potencial operando no horário reservado noturno (60% de desconto):{' '}
              <strong className="text-emerald-700 dark:text-emerald-400">
                R$ {simulation.energySavingsNightTariffBrl.toLocaleString('pt-BR')}
              </strong>{' '}
              por ciclo mensal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IrrigationSimulatorView;
