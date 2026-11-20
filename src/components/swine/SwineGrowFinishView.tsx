import React, { useMemo, useState } from 'react';
import { Scale, Plus, Truck, X } from 'lucide-react';
import { SwineBatch, SwineBreedLineage } from '../../types/swine';
import {
  SWINE_CARD_CLASS,
  SWINE_INPUT_CLASS,
  SWINE_LABEL_CLASS,
  SWINE_PRIMARY_BTN_CLASS,
  SWINE_SECONDARY_BTN_CLASS,
  SWINE_STAGE_LABELS,
  SWINE_SUBCARD_CLASS,
  addDaysIsoDate,
  formatBrDate,
  getTodayIsoDate,
  useEscapeClose,
} from './swineUi';

interface SwineGrowFinishViewProps {
  batches: SwineBatch[];
  onAddBatch: (batch: SwineBatch) => void;
  onUpdateBatch: (batch: SwineBatch) => void;
}

export const SwineGrowFinishView: React.FC<SwineGrowFinishViewProps> = ({
  batches,
  onAddBatch,
  onUpdateBatch,
}) => {
  const growFinishBatches = useMemo(
    () => batches.filter(b => b.stage === 'crescimento' || b.stage === 'terminacao'),
    [batches]
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [code, setCode] = useState(`LOTE-TERM-${new Date().getFullYear()}-01`);
  const [stage, setStage] = useState<'crescimento' | 'terminacao'>('terminacao');
  const [lineage, setLineage] = useState<SwineBreedLineage>('Topigs Norsvin (TN70)');
  const [shedName, setShedName] = useState('Galpão Terminação 01');
  const [animalsCount, setAnimalsCount] = useState(300);
  const [currentWeight, setCurrentWeight] = useState(95);
  const [gmd, setGmd] = useState(920);
  const [ca, setCa] = useState(2.6);

  useEscapeClose(isModalOpen, () => setIsModalOpen(false));

  const kpis = useMemo(() => {
    const active = growFinishBatches.filter(b => b.status === 'Ativo');
    const totalAnimals = active.reduce((a, b) => a + b.currentAnimalsCount, 0);
    const avgGmd =
      active.length > 0
        ? `${Math.round(active.reduce((a, b) => a + b.averageDailyGainG, 0) / active.length)} g/dia`
        : '—';
    const avgCa =
      active.length > 0
        ? (active.reduce((a, b) => a + b.feedConversionRatio, 0) / active.length).toFixed(2)
        : '—';
    const avgWeight =
      active.length > 0
        ? `${(active.reduce((a, b) => a + b.currentAvgWeightKg, 0) / active.length).toFixed(1)} kg`
        : '—';
    return { totalAnimals, avgGmd, avgCa, avgWeight };
  }, [growFinishBatches]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    const today = getTodayIsoDate();
    const newBatch: SwineBatch = {
      id: `batch_gf_${Date.now()}`,
      code: code.trim().toUpperCase(),
      stage,
      lineage,
      shedId: `shed_${Date.now()}`,
      shedName: shedName.trim() || 'Galpão Engorda',
      startDate: today,
      expectedEndDate: addDaysIsoDate(today, stage === 'terminacao' ? 45 : 50),
      initialAnimalsCount: Number(animalsCount),
      currentAnimalsCount: Number(animalsCount),
      mortalityCount: 0,
      initialAvgWeightKg: stage === 'terminacao' ? 70 : 28,
      currentAvgWeightKg: Number(currentWeight),
      targetWeightKg: stage === 'terminacao' ? 125 : 70,
      totalFeedConsumedKg: 0,
      totalWaterConsumedL: 0,
      feedConversionRatio: Number(ca),
      averageDailyGainG: Number(gmd),
      dailyFeedCostPerAnimal: 3.8,
      status: 'Ativo',
    };

    onAddBatch(newBatch);
    setIsModalOpen(false);
  };

  const toggleShipStatus = (batch: SwineBatch) => {
    onUpdateBatch({
      ...batch,
      status: batch.status === 'Embarcado para Abate' ? 'Ativo' : 'Embarcado para Abate',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`${SWINE_CARD_CLASS} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Crescimento & Terminação</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Engorda final (28 a 130 kg), GMD, conversão alimentar e controle de embarque para frigorífico.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`${SWINE_PRIMARY_BTN_CLASS} shrink-0`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cadastrar Lote de Engorda</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Suínos em Engorda
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
            {kpis.totalAnimals}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">em lotes ativos</span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            GMD Médio
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 mt-0.5 tabular-nums">
            {kpis.avgGmd}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">Meta &gt; 900 g/dia</span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Conversão Alimentar (CA)
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 mt-0.5 tabular-nums">
            {kpis.avgCa}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">Meta &lt; 2,75 kg/kg</span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Peso Médio Atual
          </span>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5 tabular-nums">
            {kpis.avgWeight}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">Meta abate: 125 kg</span>
        </div>
      </div>

      {/* Batches */}
      {growFinishBatches.length === 0 ? (
        <div className={`${SWINE_CARD_CLASS} p-10 text-center space-y-2`}>
          <Scale className="w-8 h-8 text-slate-400 dark:text-zinc-500 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
            Nenhum lote de crescimento ou terminação
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Cadastre lotes de engorda para monitorar GMD, CA e programação de abate.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {growFinishBatches.map(batch => {
            const isShipped = batch.status === 'Embarcado para Abate';
            return (
              <div key={batch.id} className={`${SWINE_CARD_CLASS} p-4 space-y-3`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      {batch.code}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-zinc-400">
                      {SWINE_STAGE_LABELS[batch.stage]} · {batch.shedName}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-md border shrink-0 ${
                      isShipped
                        ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
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
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {batch.currentAvgWeightKg} kg
                    </span>
                  </div>
                  <div className={`${SWINE_SUBCARD_CLASS} p-2`}>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">GMD</span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
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
                    <span>Meta de peso</span>
                    <span className="font-medium text-slate-900 dark:text-zinc-100 tabular-nums">
                      {batch.targetWeightKg} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Previsão de embarque</span>
                    <span className="font-medium text-slate-900 dark:text-zinc-100 tabular-nums">
                      {formatBrDate(batch.expectedEndDate)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
                  <button
                    type="button"
                    onClick={() => toggleShipStatus(batch)}
                    className={SWINE_SECONDARY_BTN_CLASS}
                  >
                    <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{isShipped ? 'Reabrir Lote' : 'Marcar Embarcado'}</span>
                  </button>
                </div>
              </div>
            );
          })}
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
                Novo Lote de Engorda
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <div>
                  <label className={SWINE_LABEL_CLASS}>Linhagem</label>
                  <select
                    value={lineage}
                    onChange={e => setLineage(e.target.value as SwineBreedLineage)}
                    className={SWINE_INPUT_CLASS}
                  >
                    <option value="Topigs Norsvin (TN70)">Topigs Norsvin (TN70)</option>
                    <option value="Camborough (Agroceres PIC)">Camborough (PIC)</option>
                    <option value="DanBred">DanBred</option>
                    <option value="Duroc">Duroc</option>
                    <option value="Pietrain">Pietrain</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={SWINE_LABEL_CLASS}>Fase</label>
                  <select
                    value={stage}
                    onChange={e => setStage(e.target.value as 'crescimento' | 'terminacao')}
                    className={SWINE_INPUT_CLASS}
                  >
                    <option value="crescimento">Crescimento (28–70 kg)</option>
                    <option value="terminacao">Terminação (70–130 kg)</option>
                  </select>
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>Galpão</label>
                  <input
                    type="text"
                    value={shedName}
                    onChange={e => setShedName(e.target.value)}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className={SWINE_LABEL_CLASS}>Animais</label>
                  <input
                    type="number"
                    min="1"
                    value={animalsCount}
                    onChange={e => setAnimalsCount(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>Peso (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={currentWeight}
                    onChange={e => setCurrentWeight(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>GMD (g/dia)</label>
                  <input
                    type="number"
                    min="0"
                    value={gmd}
                    onChange={e => setGmd(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>CA (kg/kg)</label>
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
