import React, { useMemo, useState } from 'react';
import { Activity, Plus, CheckCircle2, X } from 'lucide-react';
import { SwineBatch, SwineBreedLineage } from '../../types/swine';
import {
  SWINE_CARD_CLASS,
  SWINE_INPUT_CLASS,
  SWINE_LABEL_CLASS,
  SWINE_PRIMARY_BTN_CLASS,
  SWINE_SECONDARY_BTN_CLASS,
  SWINE_SUBCARD_CLASS,
  addDaysIsoDate,
  formatBrDate,
  getTodayIsoDate,
  useEscapeClose,
} from './swineUi';

interface SwineNurseryViewProps {
  batches: SwineBatch[];
  onAddBatch: (batch: SwineBatch) => void;
  onUpdateBatch: (batch: SwineBatch) => void;
}

export const SwineNurseryView: React.FC<SwineNurseryViewProps> = ({
  batches,
  onAddBatch,
  onUpdateBatch,
}) => {
  const nurseryBatches = useMemo(() => batches.filter(b => b.stage === 'creche'), [batches]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [code, setCode] = useState(`LOTE-CR-${new Date().getFullYear()}-01`);
  const [lineage, setLineage] = useState<SwineBreedLineage>('Camborough (Agroceres PIC)');
  const [shedName, setShedName] = useState('Galpão Creche 01');
  const [animalsCount, setAnimalsCount] = useState(200);
  const [initialWeight, setInitialWeight] = useState(6.8);
  const [targetWeight, setTargetWeight] = useState(28.0);
  const [gmd, setGmd] = useState(440);
  const [ca, setCa] = useState(1.25);

  useEscapeClose(isModalOpen, () => setIsModalOpen(false));

  const kpis = useMemo(() => {
    const active = nurseryBatches.filter(b => b.status === 'Ativo');
    const avgCa =
      active.length > 0
        ? (active.reduce((a, b) => a + b.feedConversionRatio, 0) / active.length).toFixed(2)
        : '—';
    const avgGmd =
      active.length > 0
        ? `${Math.round(active.reduce((a, b) => a + b.averageDailyGainG, 0) / active.length)} g/dia`
        : '—';
    const initTotal = nurseryBatches.reduce((a, b) => a + b.initialAnimalsCount, 0);
    const mortTotal = nurseryBatches.reduce((a, b) => a + b.mortalityCount, 0);
    const mortPct = initTotal > 0 ? `${((mortTotal / initTotal) * 100).toFixed(1)}%` : '0%';
    return { activeCount: active.length, avgCa, avgGmd, mortPct };
  }, [nurseryBatches]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    const today = getTodayIsoDate();
    const newBatch: SwineBatch = {
      id: `batch_cr_${Date.now()}`,
      code: code.trim().toUpperCase(),
      stage: 'creche',
      lineage,
      shedId: `shed_${Date.now()}`,
      shedName: shedName.trim() || 'Galpão Creche',
      startDate: today,
      expectedEndDate: addDaysIsoDate(today, 42),
      initialAnimalsCount: Number(animalsCount),
      currentAnimalsCount: Number(animalsCount),
      mortalityCount: 0,
      initialAvgWeightKg: Number(initialWeight),
      currentAvgWeightKg: Number(initialWeight),
      targetWeightKg: Number(targetWeight),
      totalFeedConsumedKg: 0,
      totalWaterConsumedL: 0,
      feedConversionRatio: Number(ca),
      averageDailyGainG: Number(gmd),
      dailyFeedCostPerAnimal: 1.8,
      status: 'Ativo',
    };

    onAddBatch(newBatch);
    setIsModalOpen(false);
  };

  const toggleBatchStatus = (batch: SwineBatch) => {
    onUpdateBatch({
      ...batch,
      status: batch.status === 'Ativo' ? 'Fechado' : 'Ativo',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`${SWINE_CARD_CLASS} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Creche Suinícola Climatizada</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Lotes pós-desmame (6 a 28 kg), conversão alimentar, GMD e previsão de saída para crescimento.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`${SWINE_PRIMARY_BTN_CLASS} shrink-0`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Alojar Lote de Creche</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Lotes Ativos
          </span>
          <div className="text-xl font-bold text-sky-600 dark:text-sky-400 mt-0.5 tabular-nums">
            {kpis.activeCount}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">
            {nurseryBatches.length} total na creche
          </span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Conversão Alimentar (CA)
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
            {kpis.avgCa}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">Meta &lt; 1,35 kg/kg</span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            GMD Médio Creche
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 mt-0.5 tabular-nums">
            {kpis.avgGmd}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">Meta &gt; 420 g/dia</span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Mortalidade Fase
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 mt-0.5 tabular-nums">
            {kpis.mortPct}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">Meta &lt; 2,0%</span>
        </div>
      </div>

      {/* Batches */}
      {nurseryBatches.length === 0 ? (
        <div className={`${SWINE_CARD_CLASS} p-10 text-center space-y-2`}>
          <Activity className="w-8 h-8 text-slate-400 dark:text-zinc-500 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
            Nenhum lote na creche
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Cadastre um lote pós-desmame para acompanhar GMD, CA e data prevista de transferência.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {nurseryBatches.map(batch => (
            <div key={batch.id} className={`${SWINE_CARD_CLASS} p-4 space-y-3`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    {batch.code}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-zinc-400">
                    {batch.lineage} · {batch.shedName}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-md border shrink-0 ${
                    batch.status === 'Ativo'
                      ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                  }`}
                >
                  {batch.status}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className={`${SWINE_SUBCARD_CLASS} p-2`}>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Animais</span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                    {batch.currentAnimalsCount}
                  </span>
                </div>
                <div className={`${SWINE_SUBCARD_CLASS} p-2`}>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Peso Méd.</span>
                  <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 tabular-nums">
                    {batch.currentAvgWeightKg} kg
                  </span>
                </div>
                <div className={`${SWINE_SUBCARD_CLASS} p-2`}>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">GMD</span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {batch.averageDailyGainG} g
                  </span>
                </div>
                <div className={`${SWINE_SUBCARD_CLASS} p-2`}>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">CA</span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                    {batch.feedConversionRatio}
                  </span>
                </div>
              </div>

              <div className={`${SWINE_SUBCARD_CLASS} p-2.5 text-xs space-y-1 text-slate-600 dark:text-zinc-400`}>
                <div className="flex justify-between">
                  <span>Início do lote</span>
                  <span className="font-medium text-slate-900 dark:text-zinc-100 tabular-nums">
                    {formatBrDate(batch.startDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Previsão saída ({batch.targetWeightKg} kg)</span>
                  <span className="font-medium text-sky-600 dark:text-sky-400 tabular-nums">
                    {formatBrDate(batch.expectedEndDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Consumo acumulado ração</span>
                  <span className="font-medium text-slate-900 dark:text-zinc-100 tabular-nums">
                    {batch.totalFeedConsumedKg} kg
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => toggleBatchStatus(batch)}
                  className={SWINE_SECONDARY_BTN_CLASS}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{batch.status === 'Ativo' ? 'Encerrar Lote' : 'Reativar Lote'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-zinc-950/60 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-lg w-full p-5 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Alojamento de Lote de Creche
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className={SWINE_LABEL_CLASS}>Código do Lote *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className={SWINE_INPUT_CLASS}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={SWINE_LABEL_CLASS}>Linhagem</label>
                  <select
                    value={lineage}
                    onChange={e => setLineage(e.target.value as SwineBreedLineage)}
                    className={SWINE_INPUT_CLASS}
                  >
                    <option value="Camborough (Agroceres PIC)">Camborough (PIC)</option>
                    <option value="Topigs Norsvin (TN70)">Topigs Norsvin (TN70)</option>
                    <option value="DanBred">DanBred</option>
                    <option value="Landrace">Landrace</option>
                    <option value="Large White">Large White</option>
                  </select>
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>Galpão de Creche</label>
                  <input
                    type="text"
                    value={shedName}
                    onChange={e => setShedName(e.target.value)}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className={SWINE_LABEL_CLASS}>Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    value={animalsCount}
                    onChange={e => setAnimalsCount(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>Peso Entrada (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={initialWeight}
                    onChange={e => setInitialWeight(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>Peso Meta (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={targetWeight}
                    onChange={e => setTargetWeight(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={SWINE_LABEL_CLASS}>GMD Estimado (g/dia)</label>
                  <input
                    type="number"
                    min="0"
                    value={gmd}
                    onChange={e => setGmd(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>CA Estimada (kg/kg)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={ca}
                    onChange={e => setCa(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={SWINE_SECONDARY_BTN_CLASS}
                >
                  Cancelar
                </button>
                <button type="submit" className={SWINE_PRIMARY_BTN_CLASS}>
                  Salvar Lote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
