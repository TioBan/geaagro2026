import React, { useMemo, useState } from 'react';
import { Baby, Plus, CheckCircle2, X } from 'lucide-react';
import { FarrowingLitter, SwineAnimal } from '../../types/swine';
import {
  SWINE_CARD_CLASS,
  SWINE_INPUT_CLASS,
  SWINE_LABEL_CLASS,
  SWINE_PRIMARY_BTN_CLASS,
  SWINE_SECONDARY_BTN_CLASS,
  SWINE_SUBCARD_CLASS,
  formatBrDate,
  getTodayIsoDate,
  useEscapeClose,
} from './swineUi';

interface SwineFarrowingMaternityViewProps {
  litters: FarrowingLitter[];
  onAddLitter: (litter: FarrowingLitter) => void;
  onUpdateLitter: (litter: FarrowingLitter) => void;
  animals: SwineAnimal[];
}

export const SwineFarrowingMaternityView: React.FC<SwineFarrowingMaternityViewProps> = ({
  litters,
  onAddLitter,
  onUpdateLitter,
  animals,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const registeredSows = useMemo(
    () => animals.filter(a => a.category.includes('Matriz') || a.category.includes('Marrã')),
    [animals]
  );

  // Form State
  const [sowCode, setSowCode] = useState(registeredSows[0]?.code || '');
  const [farrowingDate, setFarrowingDate] = useState(getTodayIsoDate());
  const [penNumber, setPenNumber] = useState('Maternidade 01');
  const [bornAlive, setBornAlive] = useState(14);
  const [stillborn, setStillborn] = useState(0);
  const [mummified, setMummified] = useState(0);
  const [avgBirthWeight, setAvgBirthWeight] = useState(1.45);
  const [uniformityCv, setUniformityCv] = useState(9.0);
  const [colostrumChecked, setColostrumChecked] = useState(true);
  const [splitNursing, setSplitNursing] = useState(false);

  useEscapeClose(isModalOpen, () => setIsModalOpen(false));

  const metrics = useMemo(() => {
    const pigletsInMaternity = litters.reduce(
      (acc, l) => acc + (l.status === 'Em Lactação' ? l.currentPigletsCount : 0),
      0
    );
    const totalBornAlive = litters.reduce((acc, l) => acc + l.bornAlive, 0);
    const totalStillborn = litters.reduce((acc, l) => acc + l.stillborn, 0);
    const avgWeight =
      litters.length > 0
        ? `${(litters.reduce((acc, l) => acc + l.avgBirthWeightKg, 0) / litters.length).toFixed(2)} kg`
        : '—';
    const avgCv =
      litters.length > 0
        ? `CV ${(litters.reduce((acc, l) => acc + l.litterUniformityCvPct, 0) / litters.length).toFixed(1)}%`
        : '—';

    return { pigletsInMaternity, totalBornAlive, totalStillborn, avgWeight, avgCv };
  }, [litters]);

  const handleSaveLitter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sowCode.trim()) return;
    const matchedSow = registeredSows.find(
      s => s.code.toLowerCase() === sowCode.trim().toLowerCase()
    );
    const total = Number(bornAlive) + Number(stillborn) + Number(mummified);
    const newLitter: FarrowingLitter = {
      id: `lit_${Date.now()}`,
      sowId: matchedSow?.id ?? `sow_${Date.now()}`,
      sowCode: sowCode.trim().toUpperCase(),
      farrowingDate,
      penNumber: penNumber.trim() || 'Maternidade 01',
      totalBorn: total,
      bornAlive: Number(bornAlive),
      stillborn: Number(stillborn),
      mummified: Number(mummified),
      avgBirthWeightKg: Number(avgBirthWeight),
      litterUniformityCvPct: Number(uniformityCv),
      colostrumIntakeChecked: colostrumChecked,
      splitNursingApplied: splitNursing,
      crossFosteredIn: 0,
      crossFosteredOut: 0,
      currentPigletsCount: Number(bornAlive),
      preWeaningMortalityCount: 0,
      status: 'Em Lactação',
    };

    onAddLitter(newLitter);
    setIsModalOpen(false);
  };

  const handleApplyCrossFostering = (litterId: string, direction: 'in' | 'out') => {
    const target = litters.find(l => l.id === litterId);
    if (!target || target.status !== 'Em Lactação') return;

    onUpdateLitter({
      ...target,
      crossFosteredIn: direction === 'in' ? target.crossFosteredIn + 1 : target.crossFosteredIn,
      crossFosteredOut: direction === 'out' ? target.crossFosteredOut + 1 : target.crossFosteredOut,
      currentPigletsCount:
        direction === 'in'
          ? target.currentPigletsCount + 1
          : Math.max(0, target.currentPigletsCount - 1),
    });
  };

  const handleWeanLitter = (litter: FarrowingLitter) => {
    const today = getTodayIsoDate();
    onUpdateLitter({
      ...litter,
      status: 'Desmamada',
      weaningDate: today,
      pigletsWeaned: litter.currentPigletsCount,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`${SWINE_CARD_CLASS} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Baby className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Maternidade & Manejo de Leitegadas</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Controle de partos, peso ao nascer, uniformidade (CV%), colostro, adoções cruzadas e desmame.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!sowCode && registeredSows[0]) setSowCode(registeredSows[0].code);
            setIsModalOpen(true);
          }}
          className={`${SWINE_PRIMARY_BTN_CLASS} shrink-0`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Registrar Parto</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Leitões Lactantes
          </span>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5 tabular-nums">
            {metrics.pigletsInMaternity}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">nas baias ativas</span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Nascidos Vivos
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
            {metrics.totalBornAlive}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            {metrics.totalStillborn} natimortos
          </span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Peso Médio ao Nascer
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 mt-0.5 tabular-nums">
            {metrics.avgWeight}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">Meta &gt; 1,35 kg</span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Uniformidade Média
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 mt-0.5 tabular-nums">
            {metrics.avgCv}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">Meta &lt; 12%</span>
        </div>
      </div>

      {/* Litters Grid */}
      {litters.length === 0 ? (
        <div className={`${SWINE_CARD_CLASS} p-10 text-center space-y-2`}>
          <Baby className="w-8 h-8 text-slate-400 dark:text-zinc-500 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
            Nenhuma leitegada registrada
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Registre o primeiro parto para acompanhar colostro, adoções cruzadas e desmame.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {litters.map(litter => {
            const isLactating = litter.status === 'Em Lactação';
            return (
              <div key={litter.id} className={`${SWINE_CARD_CLASS} p-4 space-y-3`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                        {litter.sowCode}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-zinc-400">
                        ({litter.penNumber})
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Parto: {formatBrDate(litter.farrowingDate)}
                      {litter.weaningDate ? ` · Desmame: ${formatBrDate(litter.weaningDate)}` : ''}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-md border shrink-0 ${
                      isLactating
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {litter.status}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className={`${SWINE_SUBCARD_CLASS} p-2`}>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Vivos</span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {litter.bornAlive}
                    </span>
                  </div>
                  <div className={`${SWINE_SUBCARD_CLASS} p-2`}>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Natim.</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 tabular-nums">
                      {litter.stillborn}
                    </span>
                  </div>
                  <div className={`${SWINE_SUBCARD_CLASS} p-2`}>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Peso Méd.</span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                      {litter.avgBirthWeightKg} kg
                    </span>
                  </div>
                  <div className={`${SWINE_SUBCARD_CLASS} p-2`}>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Atual</span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                      {litter.currentPigletsCount}
                    </span>
                  </div>
                </div>

                <div className={`${SWINE_SUBCARD_CLASS} p-2.5 text-xs space-y-1 text-slate-600 dark:text-zinc-400`}>
                  <div className="flex justify-between">
                    <span>Colostro monitorado</span>
                    <span className="font-medium text-slate-900 dark:text-zinc-100">
                      {litter.colostrumIntakeChecked ? 'Sim' : 'Pendente'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Split Nursing</span>
                    <span className="font-medium text-slate-900 dark:text-zinc-100">
                      {litter.splitNursingApplied ? 'Aplicado' : 'Não aplicado'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Adoções / Uniformidade</span>
                    <span className="font-medium text-slate-900 dark:text-zinc-100 tabular-nums">
                      +{litter.crossFosteredIn} / -{litter.crossFosteredOut} · CV {litter.litterUniformityCvPct}%
                    </span>
                  </div>
                </div>

                {isLactating && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleApplyCrossFostering(litter.id, 'in')}
                        className="h-7 px-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium hover:bg-emerald-100 dark:hover:bg-emerald-950/70 transition-colors cursor-pointer"
                      >
                        + Adotar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyCrossFostering(litter.id, 'out')}
                        className="h-7 px-2.5 rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[11px] font-medium hover:bg-rose-100 dark:hover:bg-rose-950/70 transition-colors cursor-pointer"
                      >
                        - Doar
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleWeanLitter(litter)}
                      className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Registrar Desmame</span>
                    </button>
                  </div>
                )}
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
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Novo Parto na Maternidade
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLitter} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className={SWINE_LABEL_CLASS}>Brinco da Matriz *</label>
                  <input
                    type="text"
                    required
                    list="registered-sows-list"
                    placeholder="Ex: MTZ-1042"
                    value={sowCode}
                    onChange={e => setSowCode(e.target.value)}
                    className={SWINE_INPUT_CLASS}
                  />
                  {registeredSows.length > 0 && (
                    <datalist id="registered-sows-list">
                      {registeredSows.map(s => (
                        <option key={s.id} value={s.code} />
                      ))}
                    </datalist>
                  )}
                </div>

                <div>
                  <label className={SWINE_LABEL_CLASS}>Data do Parto *</label>
                  <input
                    type="date"
                    required
                    value={farrowingDate}
                    onChange={e => setFarrowingDate(e.target.value)}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className={SWINE_LABEL_CLASS}>Baia / Cela</label>
                  <input
                    type="text"
                    value={penNumber}
                    onChange={e => setPenNumber(e.target.value)}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className={SWINE_LABEL_CLASS}>Nascidos Vivos *</label>
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={SWINE_LABEL_CLASS}>Peso Médio ao Nascer (kg)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={avgBirthWeight}
                    onChange={e => setAvgBirthWeight(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>Uniformidade (CV %)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={uniformityCv}
                    onChange={e => setUniformityCv(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={colostrumChecked}
                    onChange={e => setColostrumChecked(e.target.checked)}
                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Ingestão de colostro garantida nas primeiras 2 horas</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={splitNursing}
                    onChange={e => setSplitNursing(e.target.checked)}
                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Mamada dividida (Split Nursing) aplicada</span>
                </label>
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
                  Salvar Parto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
