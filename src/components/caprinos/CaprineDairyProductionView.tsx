import React, { useState } from 'react';
import { CaprineAnimal, CaprineMilkRecord } from '../../types/caprine';
import { Milk, Plus, X } from 'lucide-react';

interface Props {
  animals: CaprineAnimal[];
  milkLogs: CaprineMilkRecord[];
  onSaveMilkLog: (log: CaprineMilkRecord) => void;
}

export const CaprineDairyProductionView: React.FC<Props> = ({
  animals,
  milkLogs,
  onSaveMilkLog
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [newLog, setNewLog] = useState<Partial<CaprineMilkRecord>>({});

  const lactatingDoes = animals.filter(a => a.category === 'Cabra em Lactação');
  const femaleFallback = animals.filter(a => a.sex === 'Fêmea');
  const selectableDoes = lactatingDoes.length > 0 ? lactatingDoes : femaleFallback;

  const totalVolume = milkLogs.reduce((acc, curr) => acc + curr.totalLiters, 0);
  const avgLiters = milkLogs.length > 0 ? (totalVolume / milkLogs.length).toFixed(2) : '0.00';
  const avgFat =
    milkLogs.length > 0
      ? (milkLogs.reduce((acc, curr) => acc + (curr.fatPct || 0), 0) / milkLogs.length).toFixed(2)
      : '--';
  const avgProtein =
    milkLogs.length > 0
      ? (milkLogs.reduce((acc, curr) => acc + (curr.proteinPct || 0), 0) / milkLogs.length).toFixed(2)
      : '--';
  const ccsLogs = milkLogs.filter(m => m.ccsThousand !== undefined);
  const avgCcs =
    ccsLogs.length > 0
      ? Math.round(ccsLogs.reduce((acc, curr) => acc + (curr.ccsThousand || 0), 0) / ccsLogs.length)
      : 0;

  const handleOpenModal = () => {
    setFormError('');
    setNewLog({
      id: `mlk-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      animalId: selectableDoes[0]?.id || '',
      morningLiters: 2.2,
      afternoonLiters: 1.8,
      totalLiters: 4.0,
      fatPct: 3.8,
      proteinPct: 3.4,
      lactosePct: 4.5,
      ccsThousand: 180,
      lot: selectableDoes[0]?.lot || 'Lote Leiteiro A'
    });
    setIsModalOpen(true);
  };

  const handleMorningChange = (val: number) => {
    const aft = newLog.afternoonLiters || 0;
    setNewLog({
      ...newLog,
      morningLiters: val,
      totalLiters: parseFloat((val + aft).toFixed(2))
    });
  };

  const handleAfternoonChange = (val: number) => {
    const mrn = newLog.morningLiters || 0;
    setNewLog({
      ...newLog,
      afternoonLiters: val,
      totalLiters: parseFloat((mrn + val).toFixed(2))
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.animalId) {
      setFormError('Selecione a cabra em lactação.');
      return;
    }
    onSaveMilkLog({
      id: newLog.id || `mlk-${Date.now()}`,
      date: newLog.date || new Date().toISOString().split('T')[0],
      animalId: newLog.animalId,
      morningLiters: newLog.morningLiters ?? 0,
      afternoonLiters: newLog.afternoonLiters ?? 0,
      totalLiters: newLog.totalLiters ?? 0,
      fatPct: newLog.fatPct,
      proteinPct: newLog.proteinPct,
      lactosePct: newLog.lactosePct,
      ccsThousand: newLog.ccsThousand,
      lot: newLog.lot
    });
    setIsModalOpen(false);
    setFormError('');
  };

  const inputCls =
    'w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Milk className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
            Produção de Leite Caprino &amp; Qualidade
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Ordenhas diárias (manhã e tarde), sólidos (gordura e proteína) e CCS.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Lançar Ordenha
        </button>
      </div>

      {/* Unified Hairline KPI Strip */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800 overflow-hidden">
        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Média / Cabra
          </span>
          <div className="text-lg font-semibold tabular-nums text-sky-600 dark:text-sky-400 mt-0.5">
            {avgLiters}{' '}
            <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400">L/dia</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            Total acumulado: {totalVolume.toFixed(1)} L
          </p>
        </div>

        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Gordura Média
          </span>
          <div className="text-lg font-semibold tabular-nums text-amber-600 dark:text-amber-400 mt-0.5">
            {avgFat !== '--' ? `${avgFat}%` : '--'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">Rendimento queijeiro</p>
        </div>

        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Proteína Bruta
          </span>
          <div className="text-lg font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5">
            {avgProtein !== '--' ? `${avgProtein}%` : '--'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">Sólidos totais</p>
        </div>

        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            CCS Médio
          </span>
          <div className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
            {avgCcs > 0 ? avgCcs : '--'}{' '}
            <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400">mil/mL</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">Referência &lt; 400 mil</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Registros de Ordenha &amp; Qualidade
          </h2>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            {milkLogs.length} lançamento(s)
          </span>
        </div>

        {milkLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
            Nenhum lançamento de ordenha registrado ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-950/60 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-medium">
                <tr>
                  <th className="px-4 py-2.5">Data</th>
                  <th className="px-4 py-2.5">Cabra</th>
                  <th className="px-4 py-2.5">Lote</th>
                  <th className="px-4 py-2.5 text-right">Manhã (L)</th>
                  <th className="px-4 py-2.5 text-right">Tarde (L)</th>
                  <th className="px-4 py-2.5 text-right">Total (L)</th>
                  <th className="px-4 py-2.5 text-right">Gord. %</th>
                  <th className="px-4 py-2.5 text-right">Prot. %</th>
                  <th className="px-4 py-2.5 text-right">CCS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {milkLogs.map(m => {
                  const goat = animals.find(a => a.id === m.animalId);
                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="px-4 py-2.5 font-mono text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                        {m.date}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-zinc-100 whitespace-nowrap">
                        {goat ? `${goat.earTag} — ${goat.name}` : m.animalId}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-zinc-400">
                        {m.lot || '--'}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-slate-700 dark:text-zinc-300">
                        {m.morningLiters.toFixed(1)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-slate-700 dark:text-zinc-300">
                        {m.afternoonLiters.toFixed(1)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-sky-600 dark:text-sky-400">
                        {m.totalLiters.toFixed(1)} L
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-amber-600 dark:text-amber-400">
                        {m.fatPct !== undefined ? `${m.fatPct}%` : '--'}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-slate-700 dark:text-zinc-300">
                        {m.proteinPct !== undefined ? `${m.proteinPct}%` : '--'}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
                        {m.ccsThousand ?? '--'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Milk Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Milk className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                Lançamento de Ordenha
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Cabra em Lactação *
                </label>
                <select
                  required
                  value={newLog.animalId || ''}
                  onChange={e => setNewLog({ ...newLog, animalId: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Selecionar cabra...</option>
                  {selectableDoes.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.earTag} — {l.name} ({l.breed})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={newLog.date || ''}
                    onChange={e => setNewLog({ ...newLog, date: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Lote
                  </label>
                  <input
                    type="text"
                    value={newLog.lot || ''}
                    onChange={e => setNewLog({ ...newLog, lot: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Ordenha Manhã (L)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLog.morningLiters ?? 0}
                    onChange={e => handleMorningChange(parseFloat(e.target.value) || 0)}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Ordenha Tarde (L)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLog.afternoonLiters ?? 0}
                    onChange={e => handleAfternoonChange(parseFloat(e.target.value) || 0)}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
              </div>

              <div className="px-3 py-2.5 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800 flex justify-between items-center">
                <span className="font-medium text-slate-600 dark:text-zinc-400">
                  Produção Diária Total
                </span>
                <span className="text-sm font-semibold tabular-nums text-sky-600 dark:text-sky-400">
                  {(newLog.totalLiters ?? 0).toFixed(2)} L
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Gordura %
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLog.fatPct ?? 3.8}
                    onChange={e =>
                      setNewLog({ ...newLog, fatPct: parseFloat(e.target.value) || 0 })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Proteína %
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLog.proteinPct ?? 3.4}
                    onChange={e =>
                      setNewLog({ ...newLog, proteinPct: parseFloat(e.target.value) || 0 })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    CCS (mil)
                  </label>
                  <input
                    type="number"
                    value={newLog.ccsThousand ?? 180}
                    onChange={e =>
                      setNewLog({ ...newLog, ccsThousand: parseInt(e.target.value, 10) || 0 })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Salvar Ordenha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
