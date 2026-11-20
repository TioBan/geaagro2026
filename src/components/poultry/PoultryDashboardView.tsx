import React from 'react';
import { Activity, ArrowUpRight, Bird, Home, Plus, Scale, Thermometer } from 'lucide-react';
import { IEA_Result, PoultryBatch, PoultryShed, PoultryTab } from '../../types/poultry';
import {
  POULTRY_CARD_CLASS,
  POULTRY_PRIMARY_BTN_CLASS,
  POULTRY_SECONDARY_BTN_CLASS,
  POULTRY_SUBCARD_CLASS,
  formatBrDate,
  getBatchAgeDays,
  getIeaBadgeClass,
} from './poultryUi';

interface PoultryDashboardViewProps {
  batches: PoultryBatch[];
  sheds: PoultryShed[];
  currentBatch: PoultryBatch | null;
  onSelectBatch: (id: string) => void;
  onOpenAddBatch: () => void;
  onOpenAddShed: () => void;
  onNavigate: (tab: PoultryTab) => void;
  ieaResult: IEA_Result;
  simAgeDays: number;
  setSimAgeDays: (v: number) => void;
  simSlaughterWeight: number;
  setSimSlaughterWeight: (v: number) => void;
  simTotalFeed: number;
  setSimTotalFeed: (v: number) => void;
}

export const PoultryDashboardView: React.FC<PoultryDashboardViewProps> = ({
  batches,
  sheds,
  currentBatch,
  onSelectBatch,
  onOpenAddBatch,
  onOpenAddShed,
  onNavigate,
  ieaResult,
  simAgeDays,
  setSimAgeDays,
  simSlaughterWeight,
  setSimSlaughterWeight,
  simTotalFeed,
  setSimTotalFeed,
}) => {
  if (!currentBatch) {
    return (
      <div className={`${POULTRY_CARD_CLASS} p-8 text-center space-y-4`}>
        <div className="w-11 h-11 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-center mx-auto">
          <Bird className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Nenhum lote avícola alojado
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            Cadastre o primeiro galpão e aloje um lote para acompanhar mortalidade, pesagens, conversão alimentar, ambiência e o simulador de Índice de Eficiência Avícola (IEA).
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <button type="button" onClick={onOpenAddBatch} className={POULTRY_PRIMARY_BTN_CLASS}>
            <Plus className="w-3.5 h-3.5" />
            Alojar Primeiro Lote
          </button>
          <button type="button" onClick={onOpenAddShed} className={POULTRY_SECONDARY_BTN_CLASS}>
            <Home className="w-3.5 h-3.5" />
            Cadastrar Galpão
          </button>
        </div>
      </div>
    );
  }

  const latestWeighing =
    currentBatch.weighings.length > 0
      ? currentBatch.weighings[currentBatch.weighings.length - 1]
      : null;
  const ageDays = getBatchAgeDays(currentBatch.housingDate);
  const deadBirds = Math.max(0, currentBatch.initialQuantity - currentBatch.currentQuantity);
  const mortalityPct =
    currentBatch.initialQuantity > 0
      ? ((deadBirds / currentBatch.initialQuantity) * 100).toFixed(2)
      : '0.00';
  const totalShedCapacity = sheds.reduce((acc, s) => acc + (s.capacity || 0), 0);
  const totalFeedLogged = currentBatch.consumptions.reduce((acc, c) => acc + c.feedConsumed, 0);
  const totalWaterLogged = currentBatch.consumptions.reduce((acc, c) => acc + c.waterConsumed, 0);
  const linkedShed = sheds.find(s => s.id === currentBatch.shedId);

  return (
    <div className="space-y-4">
      {/* Real KPI Row for Active Batch */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className={`${POULTRY_CARD_CLASS} p-3.5`}>
          <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            Aves Alojadas (Ativas)
          </p>
          <p className="text-lg font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-1">
            {currentBatch.currentQuantity.toLocaleString('pt-BR')}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 tabular-nums">
            Mortalidade: <span className="font-medium text-rose-600 dark:text-rose-400">{mortalityPct}%</span> ({deadBirds.toLocaleString('pt-BR')} aves)
          </p>
        </div>

        <div className={`${POULTRY_CARD_CLASS} p-3.5`}>
          <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            Último Peso Médio
          </p>
          <p className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
            {latestWeighing ? `${latestWeighing.averageWeight.toLocaleString('pt-BR')} g` : '—'}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 tabular-nums">
            {latestWeighing
              ? `GMD ${latestWeighing.dailyGain} g/d · ${ageDays}º dia`
              : `Alojado há ${ageDays} dia(s)`}
          </p>
        </div>

        <div className={`${POULTRY_CARD_CLASS} p-3.5`}>
          <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            Uniformidade do Lote
          </p>
          <p className="text-lg font-semibold tabular-nums text-sky-600 dark:text-sky-400 mt-1">
            {latestWeighing ? `${latestWeighing.uniformity}%` : '—'}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
            {latestWeighing
              ? latestWeighing.uniformity >= 90
                ? 'Dentro da meta (>= 90%)'
                : 'Abaixo da meta (90%)'
              : 'Sem pesagem registrada'}
          </p>
        </div>

        <div className={`${POULTRY_CARD_CLASS} p-3.5`}>
          <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            Estrutura & Galpões
          </p>
          <p className="text-lg font-semibold tabular-nums text-amber-600 dark:text-amber-400 mt-1">
            {sheds.length} {sheds.length === 1 ? 'galpão' : 'galpões'}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 tabular-nums truncate">
            {totalShedCapacity > 0
              ? `Capacidade total: ${totalShedCapacity.toLocaleString('pt-BR')} aves`
              : 'Nenhum galpão cadastrado'}
          </p>
        </div>
      </div>

      {/* IEA Simulator Panel */}
      <section className={`${POULTRY_CARD_CLASS} p-4 sm:p-5`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-200 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Simulador de Índice de Eficiência Avícola (IEA)
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Projete o fechamento do lote {currentBatch.code} ({currentBatch.lineage}) ajustando idade, peso de abate e consumo de ração.
            </p>
          </div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium self-start sm:self-auto ${getIeaBadgeClass(
              ieaResult.status
            )}`}
          >
            Classificação: {ieaResult.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-4">
          {/* Controls */}
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="iea-age" className="font-medium text-slate-700 dark:text-zinc-300">
                  Idade de Abate Projetada
                </label>
                <span className="font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                  {simAgeDays} dias
                </span>
              </div>
              <input
                id="iea-age"
                type="range"
                min={28}
                max={56}
                value={simAgeDays}
                onChange={e => setSimAgeDays(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-500 tabular-nums">
                <span>28 d</span>
                <span>42 d</span>
                <span>56 d</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="iea-weight" className="font-medium text-slate-700 dark:text-zinc-300">
                  Peso Médio de Abate
                </label>
                <span className="font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                  {simSlaughterWeight.toFixed(2)} kg
                </span>
              </div>
              <input
                id="iea-weight"
                type="range"
                min={1.6}
                max={3.8}
                step={0.05}
                value={simSlaughterWeight}
                onChange={e => setSimSlaughterWeight(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-500 tabular-nums">
                <span>1,60 kg</span>
                <span>2,70 kg</span>
                <span>3,80 kg</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="iea-feed" className="font-medium text-slate-700 dark:text-zinc-300">
                  Consumo Total de Ração do Lote
                </label>
                <span className="font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                  {simTotalFeed.toLocaleString('pt-BR')} kg
                </span>
              </div>
              <input
                id="iea-feed"
                type="range"
                min={5000}
                max={250000}
                step={1000}
                value={simTotalFeed}
                onChange={e => setSimTotalFeed(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-500 tabular-nums">
                <span>5.000 kg</span>
                <span>125.000 kg</span>
                <span>250.000 kg</span>
              </div>
            </div>
          </div>

          {/* Computed Result Box */}
          <div className={`lg:col-span-5 ${POULTRY_SUBCARD_CLASS} p-4 flex flex-col justify-between gap-4`}>
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                  Pontuação IEA Projetada
                </p>
                <p className="text-3xl font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-1">
                  {ieaResult.score}
                  <span className="text-xs font-normal text-slate-500 dark:text-zinc-400 ml-1">pts</span>
                </p>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                Viabilidade {(100 - ieaResult.mortalityRate).toFixed(2)}%
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
              <div>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">Conv. Alimentar</p>
                <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5">
                  {ieaResult.feedConversion > 0 ? ieaResult.feedConversion.toFixed(2) : '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">Mortalidade</p>
                <p className="text-sm font-semibold tabular-nums text-rose-600 dark:text-rose-400 mt-0.5">
                  {ieaResult.mortalityRate.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">Uniformidade</p>
                <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5">
                  {ieaResult.uniformity > 0 ? `${ieaResult.uniformity}%` : '—'}
                </p>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-zinc-400 pt-2 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2">
              <span>Referência Corte: Excelente &ge; 400 · Bom &ge; 350</span>
            </div>
          </div>
        </div>
      </section>

      {/* Active Batches & Quick Access Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <section className={`${POULTRY_CARD_CLASS} p-4 lg:col-span-7`}>
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-zinc-800">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
              Lotes Ativos ({batches.length})
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('lote_twin')}
              className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              Ver Gêmeo do Lote
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-zinc-800 mt-1">
            {batches.map(batch => {
              const isSelected = batch.id === currentBatch.id;
              const batchAge = getBatchAgeDays(batch.housingDate);
              return (
                <button
                  key={batch.id}
                  type="button"
                  onClick={() => onSelectBatch(batch.id)}
                  className={`w-full text-left py-2.5 px-2 -mx-2 rounded-lg flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/70 dark:bg-amber-950/30'
                      : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                      {batch.code}
                      <span className="font-normal text-slate-500 dark:text-zinc-400">
                        {' '}· {batch.lineage} · {batch.purpose}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                      Alojado em {formatBrDate(batch.housingDate)} ({batchAge} d) · {batch.hatchery}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                      {batch.currentQuantity.toLocaleString('pt-BR')} aves
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                      {isSelected ? 'Selecionado' : 'Selecionar'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className={`${POULTRY_CARD_CLASS} p-4 lg:col-span-5 space-y-3`}>
          <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 pb-3 border-b border-slate-200 dark:border-zinc-800">
            Resumo Operacional do Lote {currentBatch.code}
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-zinc-400">Galpão Vinculado</span>
              <span className="font-medium text-slate-900 dark:text-zinc-100">
                {linkedShed ? linkedShed.identification : 'Não vinculado'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-zinc-400">Ração Acumulada</span>
              <span className="font-medium tabular-nums text-slate-900 dark:text-zinc-100">
                {totalFeedLogged > 0 ? `${totalFeedLogged.toLocaleString('pt-BR')} kg` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-zinc-400">Água Acumulada</span>
              <span className="font-medium tabular-nums text-slate-900 dark:text-zinc-100">
                {totalWaterLogged > 0 ? `${totalWaterLogged.toLocaleString('pt-BR')} L` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-zinc-400">Ocorrências Sanitárias</span>
              <span className="font-medium tabular-nums text-slate-900 dark:text-zinc-100">
                {currentBatch.healthEvents.length}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => onNavigate('pesagem')}
              className={POULTRY_SECONDARY_BTN_CLASS}
            >
              <Scale className="w-3.5 h-3.5" />
              Registrar Pesagem
            </button>
            <button
              type="button"
              onClick={() => onNavigate('ambiente')}
              className={POULTRY_SECONDARY_BTN_CLASS}
            >
              <Thermometer className="w-3.5 h-3.5" />
              Climatização
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
