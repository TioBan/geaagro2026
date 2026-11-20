import React, { useState } from 'react';
import { Bird, Droplets, Egg, Plus, Scale, Syringe, Wheat } from 'lucide-react';
import {
  PoultryBatch,
  PoultryConsumption,
  PoultryHealthEvent,
  PoultryProduction,
  PoultryWeighing,
} from '../../types/poultry';
import {
  POULTRY_CARD_CLASS,
  POULTRY_INPUT_CLASS,
  POULTRY_LABEL_CLASS,
  POULTRY_PRIMARY_BTN_CLASS,
  POULTRY_SUBCARD_CLASS,
  formatBrDate,
  getTodayIsoDate,
} from './poultryUi';

export type PoultryOperationsMode = 'nutricao' | 'agua' | 'pesagem' | 'sanidade' | 'producao';

interface PoultryOperationsViewProps {
  mode: PoultryOperationsMode;
  currentBatch: PoultryBatch | null;
  onUpdateBatch: (batch: PoultryBatch) => Promise<void>;
  onOpenAddBatch: () => void;
}

export const PoultryOperationsView: React.FC<PoultryOperationsViewProps> = ({
  mode,
  currentBatch,
  onUpdateBatch,
  onOpenAddBatch,
}) => {
  const [date, setDate] = useState<string>(getTodayIsoDate);
  const [isSaving, setIsSaving] = useState(false);

  // Nutrição / Água form
  const [feedType, setFeedType] = useState<string>('Pré-Inicial');
  const [feedConsumed, setFeedConsumed] = useState<string>('1200');
  const [waterConsumed, setWaterConsumed] = useState<string>('2400');

  // Pesagem form
  const [averageWeight, setAverageWeight] = useState<string>('480');
  const [uniformity, setUniformity] = useState<string>('91');
  const [dailyGain, setDailyGain] = useState<string>('58');

  // Sanidade form
  const [healthType, setHealthType] = useState<PoultryHealthEvent['type']>('Vacina');
  const [healthDesc, setHealthDesc] = useState<string>('');
  const [healthQty, setHealthQty] = useState<string>('0');

  // Postura form
  const [totalEggs, setTotalEggs] = useState<string>('0');
  const [brokenEggs, setBrokenEggs] = useState<string>('0');
  const [eggWeightAverage, setEggWeightAverage] = useState<string>('62');

  if (!currentBatch) {
    return (
      <div className={`${POULTRY_CARD_CLASS} p-8 text-center space-y-3`}>
        <Bird className="w-7 h-7 text-slate-400 dark:text-zinc-500 mx-auto" />
        <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
          Nenhum lote selecionado para registro operacional
        </p>
        <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
          Aloje um lote para lançar consumos de ração, água, pesagens, sanidade e coleta de ovos.
        </p>
        <button type="button" onClick={onOpenAddBatch} className={POULTRY_PRIMARY_BTN_CLASS}>
          <Plus className="w-3.5 h-3.5" />
          Alojar Novo Lote
        </button>
      </div>
    );
  }

  const handleSaveConsumption = async (e: React.FormEvent) => {
    e.preventDefault();
    const feedVal = mode === 'agua' ? 0 : Math.max(0, Number(feedConsumed) || 0);
    const waterVal = Math.max(0, Number(waterConsumed) || 0);
    if (feedVal === 0 && waterVal === 0) return;

    setIsSaving(true);
    try {
      const entry: PoultryConsumption = {
        id: `cons-${Date.now()}`,
        date: date || getTodayIsoDate(),
        feedType: mode === 'agua' ? 'Monitoramento Hídrico' : feedType,
        feedConsumed: feedVal,
        waterConsumed: waterVal,
      };
      await onUpdateBatch({
        ...currentBatch,
        consumptions: [entry, ...(currentBatch.consumptions || [])],
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveWeighing = async (e: React.FormEvent) => {
    e.preventDefault();
    const weightVal = Number(averageWeight);
    const unifVal = Number(uniformity);
    const gmdVal = Number(dailyGain);
    if (!Number.isFinite(weightVal) || weightVal <= 0) return;

    setIsSaving(true);
    try {
      const entry: PoultryWeighing = {
        id: `pw-${Date.now()}`,
        date: date || getTodayIsoDate(),
        averageWeight: weightVal,
        uniformity: Math.min(100, Math.max(0, Number.isFinite(unifVal) ? unifVal : 0)),
        dailyGain: Math.max(0, Number.isFinite(gmdVal) ? gmdVal : 0),
      };
      await onUpdateBatch({
        ...currentBatch,
        weighings: [...(currentBatch.weighings || []), entry],
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveHealth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!healthDesc.trim()) return;
    const qtyVal = Math.max(0, Math.floor(Number(healthQty) || 0));

    setIsSaving(true);
    try {
      const entry: PoultryHealthEvent = {
        id: `hlth-${Date.now()}`,
        date: date || getTodayIsoDate(),
        type: healthType,
        description: healthDesc.trim(),
        quantity: healthType === 'Mortalidade' ? qtyVal : undefined,
      };
      const nextCurrentQty =
        healthType === 'Mortalidade' && qtyVal > 0
          ? Math.max(0, currentBatch.currentQuantity - qtyVal)
          : currentBatch.currentQuantity;

      await onUpdateBatch({
        ...currentBatch,
        currentQuantity: nextCurrentQty,
        healthEvents: [entry, ...(currentBatch.healthEvents || [])],
      });
      setHealthDesc('');
      setHealthQty('0');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProduction = async (e: React.FormEvent) => {
    e.preventDefault();
    const eggsVal = Math.max(0, Math.floor(Number(totalEggs) || 0));
    const brokenVal = Math.max(0, Math.floor(Number(brokenEggs) || 0));
    const weightVal = Math.max(0, Number(eggWeightAverage) || 0);
    if (eggsVal <= 0) return;

    setIsSaving(true);
    try {
      const entry: PoultryProduction = {
        id: `prod-${Date.now()}`,
        date: date || getTodayIsoDate(),
        totalEggs: eggsVal,
        brokenEggs: brokenVal,
        eggWeightAverage: weightVal,
      };
      await onUpdateBatch({
        ...currentBatch,
        productions: [entry, ...(currentBatch.productions || [])],
      });
      setTotalEggs('0');
      setBrokenEggs('0');
    } finally {
      setIsSaving(false);
    }
  };

  const consumptions = currentBatch.consumptions || [];
  const weighings = currentBatch.weighings || [];
  const healthEvents = currentBatch.healthEvents || [];
  const productions = currentBatch.productions || [];

  const totalFeed = consumptions.reduce((s, c) => s + c.feedConsumed, 0);
  const totalWater = consumptions.reduce((s, c) => s + c.waterConsumed, 0);
  const waterFeedRatio = totalFeed > 0 ? totalWater / totalFeed : 0;
  const feedPerBirdG =
    currentBatch.currentQuantity > 0 ? Math.round((totalFeed * 1000) / currentBatch.currentQuantity) : 0;
  const waterPerBirdMl =
    currentBatch.currentQuantity > 0 ? Math.round((totalWater * 1000) / currentBatch.currentQuantity) : 0;

  // =========================================================
  // NUTRIÇÃO & ÁGUA
  // =========================================================
  if (mode === 'nutricao' || mode === 'agua') {
    const isWater = mode === 'agua';
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className={`${POULTRY_CARD_CLASS} p-3.5`}>
            <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Ração Acumulada
            </p>
            <p className="text-lg font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-1">
              {totalFeed.toLocaleString('pt-BR')} kg
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              {feedPerBirdG > 0 ? `${feedPerBirdG.toLocaleString('pt-BR')} g/ave` : 'Sem registros'}
            </p>
          </div>
          <div className={`${POULTRY_CARD_CLASS} p-3.5`}>
            <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Água Acumulada
            </p>
            <p className="text-lg font-semibold tabular-nums text-sky-600 dark:text-sky-400 mt-1">
              {totalWater.toLocaleString('pt-BR')} L
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              {waterPerBirdMl > 0 ? `${waterPerBirdMl.toLocaleString('pt-BR')} mL/ave` : 'Sem registros'}
            </p>
          </div>
          <div className={`${POULTRY_CARD_CLASS} p-3.5`}>
            <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Relação Água : Ração
            </p>
            <p className="text-lg font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-1">
              {waterFeedRatio > 0 ? `${waterFeedRatio.toFixed(2)} : 1` : '—'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Meta técnica: 1,80 a 2,10 L/kg
            </p>
          </div>
          <div className={`${POULTRY_CARD_CLASS} p-3.5`}>
            <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Lançamentos no Lote
            </p>
            <p className="text-lg font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-1">
              {consumptions.length}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Lote {currentBatch.code}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <form onSubmit={handleSaveConsumption} className={`${POULTRY_CARD_CLASS} p-4 lg:col-span-4 space-y-3`}>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2 pb-2.5 border-b border-slate-200 dark:border-zinc-800">
              {isWater ? (
                <>
                  <Droplets className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  Registrar Consumo de Água
                </>
              ) : (
                <>
                  <Wheat className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Registrar Trato & Ração
                </>
              )}
            </h2>

            <div>
              <label className={POULTRY_LABEL_CLASS}>Data</label>
              <input type="date" required value={date} onChange={e => setDate(e.target.value)} className={POULTRY_INPUT_CLASS} />
            </div>

            {!isWater && (
              <>
                <div>
                  <label className={POULTRY_LABEL_CLASS}>Fase / Formulação da Ração</label>
                  <select value={feedType} onChange={e => setFeedType(e.target.value)} className={POULTRY_INPUT_CLASS}>
                    <option value="Pré-Inicial">Pré-Inicial (1–7 dias)</option>
                    <option value="Inicial">Inicial (8–21 dias)</option>
                    <option value="Crescimento">Crescimento (22–35 dias)</option>
                    <option value="Final / Retirada">Final / Retirada (36+ dias)</option>
                    <option value="Postura Pico">Postura Pico</option>
                    <option value="Postura Manutenção">Postura Manutenção</option>
                  </select>
                </div>
                <div>
                  <label className={POULTRY_LABEL_CLASS}>Ração Consumida (kg)</label>
                  <input
                    type="number"
                    min={0}
                    step="1"
                    required
                    value={feedConsumed}
                    onChange={e => setFeedConsumed(e.target.value)}
                    className={POULTRY_INPUT_CLASS}
                  />
                </div>
              </>
            )}

            <div>
              <label className={POULTRY_LABEL_CLASS}>Água Consumida (Litros)</label>
              <input
                type="number"
                min={0}
                step="1"
                required={isWater}
                value={waterConsumed}
                onChange={e => setWaterConsumed(e.target.value)}
                className={POULTRY_INPUT_CLASS}
              />
            </div>

            <button type="submit" disabled={isSaving} className={`${POULTRY_PRIMARY_BTN_CLASS} w-full`}>
              <Plus className="w-3.5 h-3.5" />
              {isSaving ? 'Salvando...' : 'Registrar Lançamento'}
            </button>
          </form>

          <section className={`${POULTRY_CARD_CLASS} p-4 lg:col-span-8 space-y-3`}>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 pb-2.5 border-b border-slate-200 dark:border-zinc-800">
              Histórico de Consumo — {currentBatch.code}
            </h3>

            {consumptions.length === 0 ? (
              <div className={`${POULTRY_SUBCARD_CLASS} p-6 text-center`}>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Nenhum registro de ração ou água lançado para este lote.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
                      <th className="py-2 pr-3 font-medium">Data</th>
                      <th className="py-2 px-2 font-medium">Formulação / Tipo</th>
                      <th className="py-2 px-2 font-medium text-right">Ração (kg)</th>
                      <th className="py-2 px-2 font-medium text-right">Água (L)</th>
                      <th className="py-2 pl-2 font-medium text-right">Relação A:R</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                    {consumptions.map(c => {
                      const ratio = c.feedConsumed > 0 ? (c.waterConsumed / c.feedConsumed).toFixed(2) : '—';
                      return (
                        <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                          <td className="py-2 pr-3 tabular-nums text-slate-700 dark:text-zinc-300">
                            {formatBrDate(c.date)}
                          </td>
                          <td className="py-2 px-2 font-medium text-slate-900 dark:text-zinc-100">
                            {c.feedType}
                          </td>
                          <td className="py-2 px-2 text-right tabular-nums text-slate-900 dark:text-zinc-100">
                            {c.feedConsumed.toLocaleString('pt-BR')}
                          </td>
                          <td className="py-2 px-2 text-right tabular-nums text-sky-700 dark:text-sky-400">
                            {c.waterConsumed.toLocaleString('pt-BR')}
                          </td>
                          <td className="py-2 pl-2 text-right tabular-nums text-slate-600 dark:text-zinc-400">
                            {ratio}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  // =========================================================
  // PESAGEM & UNIFORMIDADE
  // =========================================================
  if (mode === 'pesagem') {
    const latestW = weighings.length > 0 ? weighings[weighings.length - 1] : null;
    const avgGmd =
      weighings.length > 0
        ? (weighings.reduce((s, w) => s + w.dailyGain, 0) / weighings.length).toFixed(1)
        : '—';

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className={`${POULTRY_CARD_CLASS} p-3.5`}>
            <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Último Peso Médio</p>
            <p className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
              {latestW ? `${latestW.averageWeight.toLocaleString('pt-BR')} g` : '—'}
            </p>
          </div>
          <div className={`${POULTRY_CARD_CLASS} p-3.5`}>
            <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Última Uniformidade</p>
            <p className="text-lg font-semibold tabular-nums text-sky-600 dark:text-sky-400 mt-1">
              {latestW ? `${latestW.uniformity}%` : '—'}
            </p>
          </div>
          <div className={`${POULTRY_CARD_CLASS} p-3.5`}>
            <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">GMD Médio</p>
            <p className="text-lg font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-1">
              {avgGmd !== '—' ? `${avgGmd} g/d` : '—'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <form onSubmit={handleSaveWeighing} className={`${POULTRY_CARD_CLASS} p-4 lg:col-span-4 space-y-3`}>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2 pb-2.5 border-b border-slate-200 dark:border-zinc-800">
              <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Registrar Pesagem Amostral
            </h2>
            <div>
              <label className={POULTRY_LABEL_CLASS}>Data da Pesagem</label>
              <input type="date" required value={date} onChange={e => setDate(e.target.value)} className={POULTRY_INPUT_CLASS} />
            </div>
            <div>
              <label className={POULTRY_LABEL_CLASS}>Peso Médio (gramas)</label>
              <input
                type="number"
                min={1}
                step="1"
                required
                value={averageWeight}
                onChange={e => setAverageWeight(e.target.value)}
                className={POULTRY_INPUT_CLASS}
              />
            </div>
            <div>
              <label className={POULTRY_LABEL_CLASS}>Uniformidade (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                step="0.5"
                required
                value={uniformity}
                onChange={e => setUniformity(e.target.value)}
                className={POULTRY_INPUT_CLASS}
              />
            </div>
            <div>
              <label className={POULTRY_LABEL_CLASS}>Ganho Médio Diário — GMD (g/dia)</label>
              <input
                type="number"
                min={0}
                step="0.1"
                required
                value={dailyGain}
                onChange={e => setDailyGain(e.target.value)}
                className={POULTRY_INPUT_CLASS}
              />
            </div>
            <button type="submit" disabled={isSaving} className={`${POULTRY_PRIMARY_BTN_CLASS} w-full`}>
              <Plus className="w-3.5 h-3.5" />
              {isSaving ? 'Salvando...' : 'Salvar Pesagem'}
            </button>
          </form>

          <section className={`${POULTRY_CARD_CLASS} p-4 lg:col-span-8 space-y-3`}>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 pb-2.5 border-b border-slate-200 dark:border-zinc-800">
              Evolução Ponderal — {currentBatch.code}
            </h3>
            {weighings.length === 0 ? (
              <div className={`${POULTRY_SUBCARD_CLASS} p-6 text-center`}>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Nenhuma pesagem registrada para este lote.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
                      <th className="py-2 pr-3 font-medium">Data</th>
                      <th className="py-2 px-2 font-medium text-right">Peso Médio (g)</th>
                      <th className="py-2 px-2 font-medium text-right">Uniformidade</th>
                      <th className="py-2 pl-2 font-medium text-right">GMD (g/dia)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                    {weighings
                      .slice()
                      .reverse()
                      .map(w => (
                        <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                          <td className="py-2 pr-3 tabular-nums text-slate-700 dark:text-zinc-300">
                            {formatBrDate(w.date)}
                          </td>
                          <td className="py-2 px-2 text-right tabular-nums font-semibold text-slate-900 dark:text-zinc-100">
                            {w.averageWeight.toLocaleString('pt-BR')} g
                          </td>
                          <td className="py-2 px-2 text-right tabular-nums text-slate-700 dark:text-zinc-300">
                            {w.uniformity}%
                          </td>
                          <td className="py-2 pl-2 text-right tabular-nums text-emerald-600 dark:text-emerald-400 font-medium">
                            {w.dailyGain} g/d
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  // =========================================================
  // SANIDADE & VACINAS
  // =========================================================
  if (mode === 'sanidade') {
    const vaccinesCount = healthEvents.filter(h => h.type === 'Vacina').length;
    const treatmentsCount = healthEvents.filter(h => h.type === 'Tratamento').length;
    const mortalityEventsQty = healthEvents
      .filter(h => h.type === 'Mortalidade')
      .reduce((s, h) => s + (h.quantity || 0), 0);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className={`${POULTRY_CARD_CLASS} p-3.5`}>
            <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Vacinações Aplicadas</p>
            <p className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
              {vaccinesCount}
            </p>
          </div>
          <div className={`${POULTRY_CARD_CLASS} p-3.5`}>
            <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Tratamentos / Medicação</p>
            <p className="text-lg font-semibold tabular-nums text-amber-600 dark:text-amber-400 mt-1">
              {treatmentsCount}
            </p>
          </div>
          <div className={`${POULTRY_CARD_CLASS} p-3.5`}>
            <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Baixas Registradas</p>
            <p className="text-lg font-semibold tabular-nums text-rose-600 dark:text-rose-400 mt-1">
              {mortalityEventsQty.toLocaleString('pt-BR')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <form onSubmit={handleSaveHealth} className={`${POULTRY_CARD_CLASS} p-4 lg:col-span-4 space-y-3`}>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2 pb-2.5 border-b border-slate-200 dark:border-zinc-800">
              <Syringe className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              Lançar Evento Sanitário
            </h2>
            <div>
              <label className={POULTRY_LABEL_CLASS}>Data</label>
              <input type="date" required value={date} onChange={e => setDate(e.target.value)} className={POULTRY_INPUT_CLASS} />
            </div>
            <div>
              <label className={POULTRY_LABEL_CLASS}>Tipo de Ocorrência</label>
              <select
                value={healthType}
                onChange={e => setHealthType(e.target.value as PoultryHealthEvent['type'])}
                className={POULTRY_INPUT_CLASS}
              >
                <option value="Vacina">Vacina</option>
                <option value="Tratamento">Tratamento</option>
                <option value="Necropsia">Necropsia</option>
                <option value="Mortalidade">Mortalidade (desconta saldo do lote)</option>
              </select>
            </div>
            <div>
              <label className={POULTRY_LABEL_CLASS}>Descrição / Protocolo</label>
              <input
                type="text"
                required
                placeholder="Ex: Vacina Gumboro via água de bebida"
                value={healthDesc}
                onChange={e => setHealthDesc(e.target.value)}
                className={POULTRY_INPUT_CLASS}
              />
            </div>
            {healthType === 'Mortalidade' && (
              <div>
                <label className={POULTRY_LABEL_CLASS}>Quantidade de Aves (baixas)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={healthQty}
                  onChange={e => setHealthQty(e.target.value)}
                  className={POULTRY_INPUT_CLASS}
                />
              </div>
            )}
            <button type="submit" disabled={isSaving} className={`${POULTRY_PRIMARY_BTN_CLASS} w-full`}>
              <Plus className="w-3.5 h-3.5" />
              {isSaving ? 'Salvando...' : 'Registrar Evento'}
            </button>
          </form>

          <section className={`${POULTRY_CARD_CLASS} p-4 lg:col-span-8 space-y-3`}>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 pb-2.5 border-b border-slate-200 dark:border-zinc-800">
              Prontuário Sanitário — {currentBatch.code}
            </h3>
            {healthEvents.length === 0 ? (
              <div className={`${POULTRY_SUBCARD_CLASS} p-6 text-center`}>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Nenhum evento sanitário registrado neste lote.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                {healthEvents.map(ev => (
                  <div key={ev.id} className="p-3 bg-white dark:bg-zinc-900 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                            ev.type === 'Vacina'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : ev.type === 'Mortalidade'
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {ev.type}
                        </span>
                        <span className="font-medium text-slate-900 dark:text-zinc-100">
                          {ev.description}
                        </span>
                      </div>
                      {ev.quantity ? (
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 tabular-nums">
                          Baixa contabilizada: {ev.quantity.toLocaleString('pt-BR')} aves
                        </p>
                      ) : null}
                    </div>
                    <span className="text-[11px] tabular-nums text-slate-500 dark:text-zinc-400 shrink-0">
                      {formatBrDate(ev.date)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  // =========================================================
  // POSTURA & OVOS
  // =========================================================
  const totalEggsSum = productions.reduce((s, p) => s + (p.totalEggs || 0), 0);
  const brokenEggsSum = productions.reduce((s, p) => s + (p.brokenEggs || 0), 0);
  const brokenPct = totalEggsSum > 0 ? ((brokenEggsSum / totalEggsSum) * 100).toFixed(2) : '0.00';
  const latestEggEntry = productions[0];
  const latestLayingRate =
    latestEggEntry && currentBatch.currentQuantity > 0
      ? (((latestEggEntry.totalEggs || 0) / currentBatch.currentQuantity) * 100).toFixed(1)
      : '—';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className={`${POULTRY_CARD_CLASS} p-3.5`}>
          <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Ovos Coletados (Acum.)</p>
          <p className="text-lg font-semibold tabular-nums text-amber-600 dark:text-amber-400 mt-1">
            {totalEggsSum.toLocaleString('pt-BR')}
          </p>
        </div>
        <div className={`${POULTRY_CARD_CLASS} p-3.5`}>
          <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Taxa de Postura (Última)</p>
          <p className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
            {latestLayingRate !== '—' ? `${latestLayingRate}%` : '—'}
          </p>
        </div>
        <div className={`${POULTRY_CARD_CLASS} p-3.5`}>
          <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Índice de Quebra</p>
          <p className="text-lg font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-1">
            {brokenPct}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <form onSubmit={handleSaveProduction} className={`${POULTRY_CARD_CLASS} p-4 lg:col-span-4 space-y-3`}>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2 pb-2.5 border-b border-slate-200 dark:border-zinc-800">
            <Egg className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Registrar Coleta de Ovos
          </h2>
          <div>
            <label className={POULTRY_LABEL_CLASS}>Data da Coleta</label>
            <input type="date" required value={date} onChange={e => setDate(e.target.value)} className={POULTRY_INPUT_CLASS} />
          </div>
          <div>
            <label className={POULTRY_LABEL_CLASS}>Total de Ovos Coletados</label>
            <input
              type="number"
              min={1}
              required
              value={totalEggs}
              onChange={e => setTotalEggs(e.target.value)}
              className={POULTRY_INPUT_CLASS}
            />
          </div>
          <div>
            <label className={POULTRY_LABEL_CLASS}>Ovos Trincados / Quebrados</label>
            <input
              type="number"
              min={0}
              value={brokenEggs}
              onChange={e => setBrokenEggs(e.target.value)}
              className={POULTRY_INPUT_CLASS}
            />
          </div>
          <div>
            <label className={POULTRY_LABEL_CLASS}>Peso Médio do Ovo (g)</label>
            <input
              type="number"
              min={0}
              step="0.5"
              value={eggWeightAverage}
              onChange={e => setEggWeightAverage(e.target.value)}
              className={POULTRY_INPUT_CLASS}
            />
          </div>
          <button type="submit" disabled={isSaving} className={`${POULTRY_PRIMARY_BTN_CLASS} w-full`}>
            <Plus className="w-3.5 h-3.5" />
            {isSaving ? 'Salvando...' : 'Salvar Coleta'}
          </button>
        </form>

        <section className={`${POULTRY_CARD_CLASS} p-4 lg:col-span-8 space-y-3`}>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 pb-2.5 border-b border-slate-200 dark:border-zinc-800">
            Histórico de Postura — {currentBatch.code}
          </h3>
          {productions.length === 0 ? (
            <div className={`${POULTRY_SUBCARD_CLASS} p-6 text-center`}>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Nenhuma coleta de ovos registrada neste lote.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
                    <th className="py-2 pr-3 font-medium">Data</th>
                    <th className="py-2 px-2 font-medium text-right">Total Ovos</th>
                    <th className="py-2 px-2 font-medium text-right">Quebrados</th>
                    <th className="py-2 px-2 font-medium text-right">Peso Médio</th>
                    <th className="py-2 pl-2 font-medium text-right">Taxa Postura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                  {productions.map(p => {
                    const rate =
                      currentBatch.currentQuantity > 0
                        ? (((p.totalEggs || 0) / currentBatch.currentQuantity) * 100).toFixed(1)
                        : '0.0';
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                        <td className="py-2 pr-3 tabular-nums text-slate-700 dark:text-zinc-300">
                          {formatBrDate(p.date)}
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums font-semibold text-slate-900 dark:text-zinc-100">
                          {(p.totalEggs || 0).toLocaleString('pt-BR')}
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums text-rose-600 dark:text-rose-400">
                          {(p.brokenEggs || 0).toLocaleString('pt-BR')}
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums text-slate-700 dark:text-zinc-300">
                          {p.eggWeightAverage || 0} g
                        </td>
                        <td className="py-2 pl-2 text-right tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
                          {rate}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
