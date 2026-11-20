import React, { useMemo, useState } from 'react';
import { Heart, Plus, X } from 'lucide-react';
import { SwineAnimal, SwineReproductionRecord } from '../../types/swine';
import {
  SWINE_CARD_CLASS,
  SWINE_INPUT_CLASS,
  SWINE_LABEL_CLASS,
  SWINE_PRIMARY_BTN_CLASS,
  SWINE_SECONDARY_BTN_CLASS,
  SWINE_SUBCARD_CLASS,
  addDaysIsoDate,
  formatBrDate,
  getSwineStatusBadgeClass,
  getTodayIsoDate,
  useEscapeClose,
} from './swineUi';

interface SwineReproductionViewProps {
  animals: SwineAnimal[];
  onUpdateAnimal: (animal: SwineAnimal) => void;
}

export const SwineReproductionView: React.FC<SwineReproductionViewProps> = ({
  animals,
  onUpdateAnimal,
}) => {
  const sows = useMemo(
    () => animals.filter(a => a.category.includes('Matriz') || a.category.includes('Marrã')),
    [animals]
  );

  const [selectedSowId, setSelectedSowId] = useState<string>(sows[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [eventType, setEventType] =
    useState<SwineReproductionRecord['eventType']>('Inseminação Artificial (IA)');
  const [eventDate, setEventDate] = useState(getTodayIsoDate());
  const [boarOrSemen, setBoarOrSemen] = useState('');
  const [boarBreed, setBoarBreed] = useState('Duroc');
  const [inseminator, setInseminator] = useState('');
  const [dgResult, setDgResult] = useState<
    'Positivo (Gestante)' | 'Negativo (Vazia)' | 'Duvidoso'
  >('Positivo (Gestante)');
  const [bornAlive, setBornAlive] = useState(14);
  const [stillborn, setStillborn] = useState(0);
  const [mummified, setMummified] = useState(0);
  const [avgBirthWeight, setAvgBirthWeight] = useState(1.45);
  const [weanPiglets, setWeanPiglets] = useState(13);
  const [weanWeight, setWeanWeight] = useState(6.8);
  const [idcDays, setIdcDays] = useState(4);
  const [notes, setNotes] = useState('');

  useEscapeClose(isModalOpen, () => setIsModalOpen(false));

  const selectedSow = sows.find(s => s.id === selectedSowId) ?? sows[0] ?? null;

  const stats = useMemo(() => {
    let totalIAs = 0;
    let positiveDGs = 0;
    let totalFarrowings = 0;
    let totalBornAlive = 0;
    let idcSum = 0;
    let idcCount = 0;

    sows.forEach(sow => {
      sow.reproductionHistory.forEach(r => {
        if (
          r.eventType === 'Inseminação Artificial (IA)' ||
          r.eventType === 'Cobertura Natural'
        ) {
          totalIAs += 1;
        }
        if (
          r.eventType === 'Diagnóstico de Gestação (DG)' &&
          r.dgResult === 'Positivo (Gestante)'
        ) {
          positiveDGs += 1;
        }
        if (r.eventType === 'Parto') {
          totalFarrowings += 1;
          totalBornAlive += r.bornAlive ?? 0;
        }
        if (r.weanToEstrusIntervalDays && r.weanToEstrusIntervalDays > 0) {
          idcSum += r.weanToEstrusIntervalDays;
          idcCount += 1;
        }
      });
    });

    return {
      conceptionPct: totalIAs > 0 ? Math.min(100, Math.round((positiveDGs / totalIAs) * 100)) : 0,
      farrowingPct:
        positiveDGs > 0 ? Math.min(100, Math.round((totalFarrowings / positiveDGs) * 100)) : 0,
      avgBornAlive:
        totalFarrowings > 0 ? (totalBornAlive / totalFarrowings).toFixed(1) : '—',
      avgIdc: idcCount > 0 ? `${(idcSum / idcCount).toFixed(1)} d` : '—',
    };
  }, [sows]);

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const targetSow = sows.find(s => s.id === selectedSowId) ?? sows[0];
    if (!targetSow) return;

    const totalBorn = Number(bornAlive) + Number(stillborn) + Number(mummified);
    const isService =
      eventType === 'Inseminação Artificial (IA)' || eventType === 'Cobertura Natural';

    const newRecord: SwineReproductionRecord = {
      id: `rep_${Date.now()}`,
      date: eventDate,
      eventType,
      boarOrSemenId: isService ? boarOrSemen.trim() || undefined : undefined,
      boarBreed: isService ? boarBreed.trim() || undefined : undefined,
      inseminatorName: inseminator.trim() || undefined,
      expectedFarrowingDate: isService ? addDaysIsoDate(eventDate, 114) : undefined,
      dgResult: eventType === 'Diagnóstico de Gestação (DG)' ? dgResult : undefined,
      totalBorn: eventType === 'Parto' ? totalBorn : undefined,
      bornAlive: eventType === 'Parto' ? Number(bornAlive) : undefined,
      stillborn: eventType === 'Parto' ? Number(stillborn) : undefined,
      mummified: eventType === 'Parto' ? Number(mummified) : undefined,
      avgPigletBirthWeightKg: eventType === 'Parto' ? Number(avgBirthWeight) : undefined,
      pigletsWeaned: eventType === 'Desmame' ? Number(weanPiglets) : undefined,
      avgWeaningWeightKg: eventType === 'Desmame' ? Number(weanWeight) : undefined,
      weanToEstrusIntervalDays: eventType === 'Retorno ao Cio' ? Number(idcDays) : undefined,
      notes: notes.trim() || undefined,
    };

    let updatedCategory = targetSow.category;
    let updatedStatus = targetSow.status;

    if (isService) {
      updatedStatus = 'Em Cobertura / IA';
    } else if (
      eventType === 'Diagnóstico de Gestação (DG)' &&
      dgResult === 'Positivo (Gestante)'
    ) {
      updatedCategory = 'Matriz Gestante';
      updatedStatus = 'Gestante';
    } else if (
      eventType === 'Diagnóstico de Gestação (DG)' &&
      dgResult === 'Negativo (Vazia)'
    ) {
      updatedCategory = 'Matriz Vazia / Pré-Cobertura';
      updatedStatus = 'Ativo';
    } else if (eventType === 'Parto') {
      updatedCategory = 'Matriz Lactante';
      updatedStatus = 'Em Lactação';
    } else if (eventType === 'Desmame') {
      updatedCategory = 'Matriz Vazia / Pré-Cobertura';
      updatedStatus = 'Seca / Desmamada';
    }

    onUpdateAnimal({
      ...targetSow,
      category: updatedCategory,
      status: updatedStatus,
      reproductionHistory: [newRecord, ...targetSow.reproductionHistory],
    });
    setNotes('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`${SWINE_CARD_CLASS} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Manejo Reprodutivo, IA & Gestação</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Controle de coberturas, inseminação artificial, diagnóstico de gestação (DG), partos e IDC.
          </p>
        </div>

        <button
          type="button"
          disabled={sows.length === 0}
          onClick={() => {
            if (!selectedSowId && sows[0]) setSelectedSowId(sows[0].id);
            setIsModalOpen(true);
          }}
          className={`${SWINE_PRIMARY_BTN_CLASS} shrink-0`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Lançar Evento Reprodutivo</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Taxa de Concepção
          </span>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5 tabular-nums">
            {stats.conceptionPct}%
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">Meta &gt; 90%</span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Taxa de Parto
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 mt-0.5 tabular-nums">
            {stats.farrowingPct}%
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">Partos / DG positivos</span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Leitões Vivos / Parto
          </span>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5 tabular-nums">
            {stats.avgBornAlive}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">Média registrada</span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Intervalo Desmame-Cio
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 mt-0.5 tabular-nums">
            {stats.avgIdc}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">Meta &lt; 5,5 dias</span>
        </div>
      </div>

      {/* Sows Board */}
      <div className={`${SWINE_CARD_CLASS} p-4 space-y-3`}>
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
            Plantel de Matrizes & Status Gestacional
          </h3>
          <span className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
            {sows.length} matriz(es)
          </span>
        </div>

        {sows.length === 0 ? (
          <div className={`${SWINE_SUBCARD_CLASS} p-8 text-center space-y-1.5`}>
            <Heart className="w-7 h-7 text-slate-400 dark:text-zinc-500 mx-auto" />
            <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
              Nenhuma matriz ou marrã cadastrada
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Cadastre fêmeas na aba Cadastro do Plantel para registrar inseminações, DGs e partos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sows.map(sow => {
              const lastEvent = sow.reproductionHistory[0];
              const isSelected = selectedSow?.id === sow.id;
              return (
                <button
                  key={sow.id}
                  type="button"
                  onClick={() => setSelectedSowId(sow.id)}
                  className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20'
                      : 'border-slate-200 dark:border-zinc-800 hover:border-rose-300 dark:hover:border-rose-700 bg-slate-50/50 dark:bg-zinc-950'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      {sow.code}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${getSwineStatusBadgeClass(sow.status)}`}
                    >
                      {sow.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    {sow.breed} · {sow.currentPenNumber || 'Baia não informada'}
                  </p>

                  {lastEvent ? (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/70 dark:border-zinc-800 text-[11px] text-slate-600 dark:text-zinc-400 space-y-0.5">
                      <span className="font-medium text-slate-800 dark:text-zinc-200 block">
                        Último: {lastEvent.eventType} ({formatBrDate(lastEvent.date)})
                      </span>
                      {lastEvent.expectedFarrowingDate && (
                        <span className="text-rose-600 dark:text-rose-400 font-medium block">
                          Prev. Parto: {formatBrDate(lastEvent.expectedFarrowingDate)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/70 dark:border-zinc-800 text-[11px] text-slate-400 dark:text-zinc-500">
                      Sem eventos reprodutivos lançados.
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-zinc-950/60 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Lançar Manejo Reprodutivo
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3">
              <div>
                <label className={SWINE_LABEL_CLASS}>Matriz *</label>
                <select
                  value={selectedSowId || sows[0]?.id || ''}
                  onChange={e => setSelectedSowId(e.target.value)}
                  className={SWINE_INPUT_CLASS}
                >
                  {sows.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code} — {s.breed} ({s.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={SWINE_LABEL_CLASS}>Tipo de Evento *</label>
                  <select
                    value={eventType}
                    onChange={e =>
                      setEventType(e.target.value as SwineReproductionRecord['eventType'])
                    }
                    className={SWINE_INPUT_CLASS}
                  >
                    <option value="Inseminação Artificial (IA)">Inseminação Artificial (IA)</option>
                    <option value="Cobertura Natural">Cobertura Natural</option>
                    <option value="Diagnóstico de Gestação (DG)">Diagnóstico de Gestação (DG)</option>
                    <option value="Parto">Parto</option>
                    <option value="Desmame">Desmame</option>
                    <option value="Retorno ao Cio">Retorno ao Cio</option>
                    <option value="Aborto">Aborto</option>
                  </select>
                </div>

                <div>
                  <label className={SWINE_LABEL_CLASS}>Data *</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
              </div>

              {(eventType === 'Inseminação Artificial (IA)' ||
                eventType === 'Cobertura Natural') && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className={SWINE_LABEL_CLASS}>Cachaço / Dose Sêmen</label>
                    <input
                      type="text"
                      placeholder="Ex: SEM-DUROC-09"
                      value={boarOrSemen}
                      onChange={e => setBoarOrSemen(e.target.value)}
                      className={SWINE_INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={SWINE_LABEL_CLASS}>Raça Reprodutor</label>
                    <input
                      type="text"
                      value={boarBreed}
                      onChange={e => setBoarBreed(e.target.value)}
                      className={SWINE_INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={SWINE_LABEL_CLASS}>Inseminador</label>
                    <input
                      type="text"
                      placeholder="Responsável"
                      value={inseminator}
                      onChange={e => setInseminator(e.target.value)}
                      className={SWINE_INPUT_CLASS}
                    />
                  </div>
                </div>
              )}

              {eventType === 'Diagnóstico de Gestação (DG)' && (
                <div>
                  <label className={SWINE_LABEL_CLASS}>Resultado do Ultrassom / DG</label>
                  <select
                    value={dgResult}
                    onChange={e =>
                      setDgResult(
                        e.target.value as 'Positivo (Gestante)' | 'Negativo (Vazia)' | 'Duvidoso'
                      )
                    }
                    className={SWINE_INPUT_CLASS}
                  >
                    <option value="Positivo (Gestante)">Positivo (Gestante)</option>
                    <option value="Negativo (Vazia)">Negativo (Vazia)</option>
                    <option value="Duvidoso">Duvidoso</option>
                  </select>
                </div>
              )}

              {eventType === 'Parto' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className={SWINE_LABEL_CLASS}>Vivos</label>
                    <input
                      type="number"
                      min="0"
                      value={bornAlive}
                      onChange={e => setBornAlive(Number(e.target.value))}
                      className={SWINE_INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={SWINE_LABEL_CLASS}>Natimortos</label>
                    <input
                      type="number"
                      min="0"
                      value={stillborn}
                      onChange={e => setStillborn(Number(e.target.value))}
                      className={SWINE_INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={SWINE_LABEL_CLASS}>Mumificados</label>
                    <input
                      type="number"
                      min="0"
                      value={mummified}
                      onChange={e => setMummified(Number(e.target.value))}
                      className={SWINE_INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={SWINE_LABEL_CLASS}>Peso Méd. (kg)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      value={avgBirthWeight}
                      onChange={e => setAvgBirthWeight(Number(e.target.value))}
                      className={SWINE_INPUT_CLASS}
                    />
                  </div>
                </div>
              )}

              {eventType === 'Desmame' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={SWINE_LABEL_CLASS}>Leitões Desmamados</label>
                    <input
                      type="number"
                      min="0"
                      value={weanPiglets}
                      onChange={e => setWeanPiglets(Number(e.target.value))}
                      className={SWINE_INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={SWINE_LABEL_CLASS}>Peso Médio Desmame (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={weanWeight}
                      onChange={e => setWeanWeight(Number(e.target.value))}
                      className={SWINE_INPUT_CLASS}
                    />
                  </div>
                </div>
              )}

              {eventType === 'Retorno ao Cio' && (
                <div>
                  <label className={SWINE_LABEL_CLASS}>Intervalo Desmame-Cio (dias)</label>
                  <input
                    type="number"
                    min="1"
                    value={idcDays}
                    onChange={e => setIdcDays(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
              )}

              <div>
                <label className={SWINE_LABEL_CLASS}>Observações</label>
                <input
                  type="text"
                  placeholder="Detalhes adicionais..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className={SWINE_INPUT_CLASS}
                />
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
                  Salvar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
