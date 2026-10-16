import React, { useState } from 'react';
import { CaprineAnimal, CaprineMilkRecord } from '../../types/caprine';
import { Milk, Plus, Droplets, TrendingUp, Award, Calendar, AlertTriangle, X } from 'lucide-react';

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
  const [newLog, setNewLog] = useState<Partial<CaprineMilkRecord>>({
    id: `mlk-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    morningLiters: 2.2,
    afternoonLiters: 1.8,
    totalLiters: 4.0,
    fatPct: 3.8,
    proteinPct: 3.4,
    lactosePct: 4.5,
    ccsThousand: 180,
    lot: 'Lote Leiteiro A'
  });

  const lactatingDoes = animals.filter(a => a.category === 'Cabra em Lactação');

  // Total daily volume
  const totalVolume = milkLogs.reduce((acc, curr) => acc + curr.totalLiters, 0);
  const avgFat = milkLogs.length > 0 ? (milkLogs.reduce((acc, curr) => acc + (curr.fatPct || 3.8), 0) / milkLogs.length).toFixed(2) : '3.80';
  const avgProtein = milkLogs.length > 0 ? (milkLogs.reduce((acc, curr) => acc + (curr.proteinPct || 3.4), 0) / milkLogs.length).toFixed(2) : '3.40';

  const handleMorningChange = (val: number) => {
    const aft = newLog.afternoonLiters || 0;
    setNewLog({ ...newLog, morningLiters: val, totalLiters: parseFloat((val + aft).toFixed(2)) });
  };

  const handleAfternoonChange = (val: number) => {
    const mrn = newLog.morningLiters || 0;
    setNewLog({ ...newLog, afternoonLiters: val, totalLiters: parseFloat((mrn + val).toFixed(2)) });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.animalId) {
      alert('Selecione a cabra em lactação.');
      return;
    }
    onSaveMilkLog(newLog as CaprineMilkRecord);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Milk className="w-6 h-6 text-sky-600" />
            Produção de Leite Caprino & Qualidade
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Controle de ordenha diária (Manhã e Tarde), análises físico-químicas (Gordura, Proteína, Lactose) e Contagem de Células Somáticas (CCS).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Lançar Ordenha Diária
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold text-stone-400 block uppercase">Média Leite / Cabra</span>
          <div className="text-2xl font-black text-sky-600">
            {lactatingDoes.length > 0 ? (totalVolume / Math.max(1, milkLogs.length)).toFixed(2) : '4.20'} <span className="text-xs font-normal text-stone-500">L/dia</span>
          </div>
          <p className="text-[10px] text-stone-500 mt-0.5">Com base no lote ativo</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold text-stone-400 block uppercase">Teor de Gordura %</span>
          <div className="text-2xl font-black text-amber-600">{avgFat}%</div>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Alto rendimento para Queijo Caprino</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold text-stone-400 block uppercase">Proteína Bruta %</span>
          <div className="text-2xl font-black text-stone-900 dark:text-white">{avgProtein}%</div>
          <p className="text-[10px] text-stone-500 mt-0.5">Sólidos totais elevados</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold text-stone-400 block uppercase">CCS Médio</span>
          <div className="text-2xl font-black text-emerald-600">185 <span className="text-xs font-normal text-stone-500">mil/mL</span></div>
          <p className="text-[10px] text-stone-500 mt-0.5">Saúde do úbere excelente (&lt;400 mil)</p>
        </div>
      </div>

      {/* Milk Logs Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 dark:border-zinc-800">
          <h2 className="font-bold text-sm text-stone-900 dark:text-white">Registros de Ordenha & Qualidade por Animal</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-zinc-800/80 text-stone-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Animal (Cabra)</th>
                <th className="p-3">Lote</th>
                <th className="p-3">Manhã (L)</th>
                <th className="p-3">Tarde (L)</th>
                <th className="p-3">Total (L/dia)</th>
                <th className="p-3">Gordura %</th>
                <th className="p-3">Proteína %</th>
                <th className="p-3">CCS (mil/mL)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-800 font-medium">
              {milkLogs.map(m => {
                const goat = animals.find(a => a.id === m.animalId);
                return (
                  <tr key={m.id} className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                    <td className="p-3 font-mono text-stone-600 dark:text-stone-300">{m.date}</td>
                    <td className="p-3 font-bold text-stone-900 dark:text-white">
                      {goat ? `${goat.earTag} - ${goat.name}` : m.animalId}
                    </td>
                    <td className="p-3 text-stone-600 dark:text-stone-300">{m.lot}</td>
                    <td className="p-3 text-stone-700 dark:text-stone-300 font-bold">{m.morningLiters} L</td>
                    <td className="p-3 text-stone-700 dark:text-stone-300 font-bold">{m.afternoonLiters} L</td>
                    <td className="p-3 font-black text-sky-600">{m.totalLiters} Litros</td>
                    <td className="p-3 text-amber-600 font-bold">{m.fatPct}%</td>
                    <td className="p-3 text-stone-800 dark:text-stone-200">{m.proteinPct}%</td>
                    <td className="p-3 font-bold text-emerald-600">{m.ccsThousand || 180}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Milk */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 dark:border-zinc-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-stone-200 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Milk className="w-5 h-5 text-sky-600" />
                Lançamento de Ordenha
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Cabra em Lactação *</label>
                <select
                  required
                  value={newLog.animalId || ''}
                  onChange={e => setNewLog({ ...newLog, animalId: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-bold"
                >
                  <option value="">-- Selecione a Cabra --</option>
                  {lactatingDoes.map(l => (
                    <option key={l.id} value={l.id}>{l.earTag} - {l.name} ({l.breed})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={newLog.date || ''}
                    onChange={e => setNewLog({ ...newLog, date: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Lote</label>
                  <input
                    type="text"
                    value={newLog.lot || ''}
                    onChange={e => setNewLog({ ...newLog, lot: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Ordenha Manhã (L)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLog.morningLiters || 0}
                    onChange={e => handleMorningChange(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-bold text-sky-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Ordenha Tarde (L)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLog.afternoonLiters || 0}
                    onChange={e => handleAfternoonChange(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-bold text-sky-600"
                  />
                </div>
              </div>

              <div className="bg-sky-50 dark:bg-sky-950/40 p-3 rounded-xl border border-sky-200 dark:border-sky-900/50 flex justify-between items-center">
                <span className="font-bold text-sky-900 dark:text-sky-200">Total Produção Diária:</span>
                <span className="text-lg font-black text-sky-600">{newLog.totalLiters} Litros</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Gordura %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLog.fatPct || 3.8}
                    onChange={e => setNewLog({ ...newLog, fatPct: parseFloat(e.target.value) })}
                    className="w-full p-2 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Proteína %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLog.proteinPct || 3.4}
                    onChange={e => setNewLog({ ...newLog, proteinPct: parseFloat(e.target.value) })}
                    className="w-full p-2 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">CCS (mil)</label>
                  <input
                    type="number"
                    value={newLog.ccsThousand || 180}
                    onChange={e => setNewLog({ ...newLog, ccsThousand: parseInt(e.target.value) })}
                    className="w-full p-2 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-stone-200 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold"
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
