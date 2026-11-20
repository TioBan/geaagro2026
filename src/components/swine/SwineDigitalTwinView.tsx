import React, { useEffect, useState } from 'react';
import {
  Cpu,
  Heart,
  Scale,
  ShieldCheck,
  MapPin,
  Clock,
} from 'lucide-react';
import { SwineAnimal, SwineWeighingRecord } from '../../types/swine';
import {
  SWINE_CARD_CLASS,
  SWINE_INPUT_CLASS,
  SWINE_LABEL_CLASS,
  SWINE_PRIMARY_BTN_CLASS,
  SWINE_SUBCARD_CLASS,
  formatBrDate,
  getSwineStatusBadgeClass,
  getTodayIsoDate,
} from './swineUi';

interface SwineDigitalTwinViewProps {
  animals: SwineAnimal[];
  selectedAnimal?: SwineAnimal;
  onSelectAnimal: (animal: SwineAnimal) => void;
  onUpdateAnimal: (animal: SwineAnimal) => void;
}

type TwinSubTab = 'timeline' | 'weighing' | 'reproduction' | 'health' | 'movements';

export const SwineDigitalTwinView: React.FC<SwineDigitalTwinViewProps> = ({
  animals,
  selectedAnimal,
  onSelectAnimal,
  onUpdateAnimal,
}) => {
  const currentAnimal = selectedAnimal || animals[0];

  const [activeTab, setActiveTab] = useState<TwinSubTab>('timeline');
  const [newWeight, setNewWeight] = useState(currentAnimal?.currentWeightKg || 200);
  const [newEcc, setNewEcc] = useState(currentAnimal?.bodyConditionScore || 3.0);
  const [newBackfat, setNewBackfat] = useState(14);

  useEffect(() => {
    if (currentAnimal) {
      setNewWeight(currentAnimal.currentWeightKg);
      setNewEcc(currentAnimal.bodyConditionScore);
    }
  }, [currentAnimal?.id, currentAnimal?.currentWeightKg, currentAnimal?.bodyConditionScore]);

  if (!currentAnimal) {
    return (
      <div className={`${SWINE_CARD_CLASS} p-10 text-center space-y-2`}>
        <Cpu className="w-8 h-8 text-rose-600 dark:text-rose-400 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
          Nenhum animal selecionado
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Cadastre um suíno no Plantel Individual para visualizar seu Gêmeo Digital 360°.
        </p>
      </div>
    );
  }

  const activeWithdrawals = (currentAnimal.healthHistory || []).filter(h => {
    if (!h.withdrawalDays || h.withdrawalDays <= 0) return false;
    const treatDate = new Date(h.date).getTime();
    const endDate = treatDate + h.withdrawalDays * 86400000;
    return Number.isFinite(endDate) && Date.now() < endDate;
  });

  const isWithdrawalActive = activeWithdrawals.length > 0;

  const handleAddWeighing = (e: React.FormEvent) => {
    e.preventDefault();
    const weighingHist = currentAnimal.weighingHistory || [];
    const lastWeighing = weighingHist[weighingHist.length - 1];
    let dailyGain = 0;
    if (lastWeighing) {
      const daysDiff = Math.max(
        1,
        (Date.now() - new Date(lastWeighing.date).getTime()) / 86400000
      );
      dailyGain = Number(((newWeight - lastWeighing.weightKg) / daysDiff).toFixed(2));
    }

    const updatedWeighing: SwineWeighingRecord = {
      id: `w_${Date.now()}`,
      date: getTodayIsoDate(),
      weightKg: Number(newWeight),
      dailyGainKg: dailyGain,
      bodyConditionScore: Number(newEcc),
      backfatMm: Number(newBackfat) || undefined,
    };

    const updatedAnimal: SwineAnimal = {
      ...currentAnimal,
      currentWeightKg: Number(newWeight),
      bodyConditionScore: Number(newEcc),
      weighingHistory: [...weighingHist, updatedWeighing],
    };

    onUpdateAnimal(updatedAnimal);
  };

  return (
    <div className="space-y-4">
      {/* Animal Selector Bar */}
      <div className={`${SWINE_CARD_CLASS} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Gêmeo Digital 360° — Passaporte Biológico
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Histórico produtivo, biometria, reprodução, sanidade e rastreabilidade individual.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-medium text-slate-600 dark:text-zinc-400 shrink-0">
            Suíno:
          </label>
          <select
            value={currentAnimal.id}
            onChange={e => {
              const found = animals.find(a => a.id === e.target.value);
              if (found) onSelectAnimal(found);
            }}
            className={`${SWINE_INPUT_CLASS} sm:w-64`}
          >
            {animals.map(a => (
              <option key={a.id} value={a.id}>
                {a.code} — {a.breed} ({a.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Passport Card */}
      <div className={`${SWINE_CARD_CLASS} overflow-hidden`}>
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
              {currentAnimal.code.slice(0, 3)}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                  {currentAnimal.code}
                </h3>
                {currentAnimal.name && (
                  <span className="text-xs text-slate-500 dark:text-zinc-400">
                    “{currentAnimal.name}”
                  </span>
                )}
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${getSwineStatusBadgeClass(currentAnimal.status)}`}
                >
                  {currentAnimal.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                <span className="font-medium text-slate-800 dark:text-zinc-200">
                  {currentAnimal.breed}
                </span>{' '}
                · {currentAnimal.sex} · {currentAnimal.category}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                <span>Nasc.: {formatBrDate(currentAnimal.birthDate)}</span>
                <span>·</span>
                <span>Local: {currentAnimal.currentPenNumber || 'Não informado'}</span>
                {currentAnimal.rfidOrQrCode && (
                  <>
                    <span>·</span>
                    <span className="font-mono">{currentAnimal.rfidOrQrCode}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 w-full lg:w-auto">
            <div className={`${SWINE_SUBCARD_CLASS} px-3 py-2 text-center`}>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Peso Atual</span>
              <div className="text-sm font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
                {currentAnimal.currentWeightKg} kg
              </div>
            </div>
            <div className={`${SWINE_SUBCARD_CLASS} px-3 py-2 text-center`}>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">ECC</span>
              <div className="text-sm font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                {currentAnimal.bodyConditionScore} / 5
              </div>
            </div>
            <div className={`${SWINE_SUBCARD_CLASS} px-3 py-2 text-center`}>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Carência</span>
              <div
                className={`text-xs font-semibold mt-0.5 ${
                  isWithdrawalActive
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {isWithdrawalActive ? 'Em Carência' : 'Liberado'}
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="px-3 py-2 bg-slate-50 dark:bg-zinc-950 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-1 overflow-x-auto">
          {(
            [
              { id: 'timeline', label: 'Linha do Tempo', icon: Clock },
              { id: 'weighing', label: 'Peso & GMD', icon: Scale },
              { id: 'reproduction', label: 'Reprodução', icon: Heart },
              { id: 'health', label: 'Sanidade', icon: ShieldCheck },
              { id: 'movements', label: 'Movimentações', icon: MapPin },
            ] as const
          ).map(tab => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isTabActive
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-200/60 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4">
          {activeTab === 'timeline' && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                Cronologia do Animal
              </h4>

              <div className="space-y-2.5 border-l border-slate-200 dark:border-zinc-800 pl-4 ml-2">
                <div className="relative">
                  <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                    {formatBrDate(currentAnimal.entryDate)}
                  </span>
                  <h5 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                    Entrada no Plantel
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Origem: {currentAnimal.origin} · Peso inicial: {currentAnimal.initialWeightKg} kg
                  </p>
                </div>

                {currentAnimal.reproductionHistory.map(rep => (
                  <div key={rep.id} className="relative">
                    <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                      {formatBrDate(rep.date)}
                    </span>
                    <h5 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                      {rep.eventType}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      {rep.eventType === 'Parto'
                        ? `Nascidos: ${rep.totalBorn ?? 0} (${rep.bornAlive ?? 0} vivos, ${rep.stillborn ?? 0} natimortos).`
                        : rep.eventType === 'Inseminação Artificial (IA)'
                          ? `Sêmen: ${rep.boarOrSemenId ?? '—'} (${rep.boarBreed ?? '—'}) · Prev. parto: ${formatBrDate(rep.expectedFarrowingDate)}`
                          : rep.notes || 'Evento reprodutivo registrado.'}
                    </p>
                  </div>
                ))}

                {currentAnimal.healthHistory.map(h => (
                  <div key={h.id} className="relative">
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      {formatBrDate(h.date)}
                    </span>
                    <h5 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                      {h.type}: {h.productName}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Dose: {h.dosage} · Via: {h.route} · Resp.: {h.veterinarianOrOperator}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'weighing' && (
            <div className="space-y-4">
              <form
                onSubmit={handleAddWeighing}
                className={`${SWINE_SUBCARD_CLASS} p-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 items-end`}
              >
                <div>
                  <label className={SWINE_LABEL_CLASS}>Peso (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={newWeight}
                    onChange={e => setNewWeight(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>ECC (1–5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={newEcc}
                    onChange={e => setNewEcc(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>Toucinho P2 (mm)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={newBackfat}
                    onChange={e => setNewBackfat(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <button type="submit" className={`${SWINE_PRIMARY_BTN_CLASS} h-9 w-full`}>
                  Registrar Pesagem
                </button>
              </form>

              {currentAnimal.weighingHistory.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-zinc-400 text-center py-6">
                  Nenhuma pesagem registrada para este animal.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {currentAnimal.weighingHistory.map((w, idx) => (
                    <div key={w.id} className={`${SWINE_SUBCARD_CLASS} p-3 space-y-1`}>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {formatBrDate(w.date)} · Pesagem #{idx + 1}
                      </span>
                      <div className="text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
                        {w.weightKg} kg
                      </div>
                      <div className="text-xs text-slate-600 dark:text-zinc-400 flex justify-between tabular-nums">
                        <span>ECC: {w.bodyConditionScore ?? '—'} / 5</span>
                        {w.backfatMm !== undefined && <span>P2: {w.backfatMm} mm</span>}
                      </div>
                      {w.dailyGainKg !== undefined && w.dailyGainKg !== 0 && (
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 tabular-nums">
                          GMD: {w.dailyGainKg} kg/dia
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reproduction' && (
            <div className="space-y-2.5">
              {currentAnimal.reproductionHistory.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-zinc-400 text-center py-6">
                  Nenhum evento reprodutivo registrado.
                </p>
              ) : (
                currentAnimal.reproductionHistory.map(rep => (
                  <div
                    key={rep.id}
                    className={`${SWINE_SUBCARD_CLASS} p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                          {rep.eventType}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                          {formatBrDate(rep.date)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                        {rep.eventType === 'Parto'
                          ? `Total: ${rep.totalBorn ?? 0} · Vivos: ${rep.bornAlive ?? 0} · Natimortos: ${rep.stillborn ?? 0}`
                          : rep.eventType === 'Inseminação Artificial (IA)'
                            ? `Sêmen: ${rep.boarOrSemenId ?? '—'} (${rep.boarBreed ?? '—'}) · Prev. parto: ${formatBrDate(rep.expectedFarrowingDate)}`
                            : rep.notes || 'Registro concluído'}
                      </p>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shrink-0">
                      Registrado
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'health' && (
            <div className="space-y-2.5">
              {currentAnimal.healthHistory.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-zinc-400 text-center py-6">
                  Nenhum manejo sanitário registrado para este animal.
                </p>
              ) : (
                currentAnimal.healthHistory.map(h => (
                  <div
                    key={h.id}
                    className={`${SWINE_SUBCARD_CLASS} p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                          {h.productName}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {h.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                        Dose: {h.dosage} ({h.route}) · Carência: {h.withdrawalDays} dias · Resp.: {h.veterinarianOrOperator}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 shrink-0 tabular-nums">
                      {formatBrDate(h.date)}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'movements' && (
            <div className="space-y-2">
              {currentAnimal.movements.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-zinc-400 text-center py-6">
                  Nenhuma movimentação registrada.
                </p>
              ) : (
                currentAnimal.movements.map(m => (
                  <div
                    key={m.id}
                    className={`${SWINE_SUBCARD_CLASS} p-3 flex items-center justify-between gap-2 text-xs`}
                  >
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-zinc-100">
                        {m.fromLocation} → {m.toLocation}
                      </span>
                      <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">
                        Motivo: {m.reason} · Resp.: {m.operator}
                      </span>
                    </div>
                    <span className="text-slate-500 dark:text-zinc-400 shrink-0 tabular-nums">
                      {formatBrDate(m.date)}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
