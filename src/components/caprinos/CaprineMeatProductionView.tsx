import React, { useState } from 'react';
import { CaprineAnimal, CaprineMeatRecord, CaprineWeighingRecord } from '../../types/caprine';
import { Scale, Beef, Plus, X } from 'lucide-react';

interface Props {
  animals: CaprineAnimal[];
  meatRecords: CaprineMeatRecord[];
  weighings: CaprineWeighingRecord[];
  onSaveMeatRecord: (rec: CaprineMeatRecord) => void;
  onSaveWeighing: (wei: CaprineWeighingRecord) => void;
}

export const CaprineMeatProductionView: React.FC<Props> = ({
  animals,
  meatRecords,
  weighings,
  onSaveMeatRecord,
  onSaveWeighing
}) => {
  const [activeSection, setActiveSection] = useState<'weighings' | 'carcass'>('weighings');
  const [isWeighModalOpen, setIsWeighModalOpen] = useState(false);
  const [isMeatModalOpen, setIsMeatModalOpen] = useState(false);
  const [formError, setFormError] = useState('');

  const [newWeighing, setNewWeighing] = useState<Partial<CaprineWeighingRecord>>({});
  const [newMeat, setNewMeat] = useState<Partial<CaprineMeatRecord>>({});

  // Dynamic KPIs
  const allGmds = [
    ...weighings.map(w => w.gmdGramsDay || 0).filter(v => v > 0),
    ...meatRecords.map(m => m.gmdGramsDay || 0).filter(v => v > 0)
  ];
  const avgGmd =
    allGmds.length > 0 ? Math.round(allGmds.reduce((a, b) => a + b, 0) / allGmds.length) : 0;

  const avgFeedConv =
    meatRecords.length > 0
      ? (
          meatRecords.reduce((acc, curr) => acc + curr.feedConversion, 0) / meatRecords.length
        ).toFixed(1)
      : '--';

  const avgCarcassYield =
    meatRecords.length > 0
      ? (
          meatRecords.reduce((acc, curr) => acc + curr.carcassYieldPct, 0) / meatRecords.length
        ).toFixed(1)
      : '--';

  const avgSlaughterAge =
    meatRecords.length > 0
      ? (
          meatRecords.reduce((acc, curr) => acc + curr.slaughterAgeMonths, 0) / meatRecords.length
        ).toFixed(1)
      : '--';

  const handleOpenWeighModal = () => {
    setFormError('');
    setNewWeighing({
      id: `wei-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      animalId: animals[0]?.id || '',
      weightKg: 25.0,
      gmdGramsDay: 200,
      bodyConditionScore: 3.5,
      famachaScore: 1,
      notes: ''
    });
    setIsWeighModalOpen(true);
  };

  const handleOpenMeatModal = () => {
    setFormError('');
    setNewMeat({
      id: `meat-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      animalId: animals[0]?.id || '',
      liveWeightKg: 34.0,
      gmdGramsDay: 220,
      feedConversion: 3.2,
      targetSlaughterWeightKg: 35.0,
      carcassYieldPct: 49.5,
      slaughterAgeMonths: 6,
      notes: ''
    });
    setIsMeatModalOpen(true);
  };

  const handleSaveWeighing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeighing.animalId) {
      setFormError('Selecione o caprino.');
      return;
    }
    onSaveWeighing({
      id: newWeighing.id || `wei-${Date.now()}`,
      date: newWeighing.date || new Date().toISOString().split('T')[0],
      animalId: newWeighing.animalId,
      weightKg: newWeighing.weightKg ?? 0,
      gmdGramsDay: newWeighing.gmdGramsDay,
      bodyConditionScore: newWeighing.bodyConditionScore,
      famachaScore: newWeighing.famachaScore,
      notes: newWeighing.notes
    });
    setIsWeighModalOpen(false);
    setFormError('');
  };

  const handleSaveMeat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeat.animalId) {
      setFormError('Selecione o caprino.');
      return;
    }
    onSaveMeatRecord({
      id: newMeat.id || `meat-${Date.now()}`,
      animalId: newMeat.animalId,
      date: newMeat.date || new Date().toISOString().split('T')[0],
      liveWeightKg: newMeat.liveWeightKg ?? 34,
      gmdGramsDay: newMeat.gmdGramsDay ?? 220,
      feedConversion: newMeat.feedConversion ?? 3.2,
      targetSlaughterWeightKg: newMeat.targetSlaughterWeightKg ?? 35,
      carcassYieldPct: newMeat.carcassYieldPct ?? 49.5,
      slaughterAgeMonths: newMeat.slaughterAgeMonths ?? 6,
      notes: newMeat.notes
    });
    setIsMeatModalOpen(false);
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
            <Beef className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            Produção de Carne, Pesagens &amp; Carcaça
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Ganho médio diário (GMD), conversão alimentar (CA), rendimento de carcaça e abate.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleOpenMeatModal}
            className="h-8 px-3 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 text-xs font-medium rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Avaliação Carcaça
          </button>
          <button
            type="button"
            onClick={handleOpenWeighModal}
            className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5" />
            Lançar Pesagem
          </button>
        </div>
      </div>

      {/* Unified Hairline KPI Strip */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800 overflow-hidden">
        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            GMD Médio
          </span>
          <div className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
            {avgGmd > 0 ? avgGmd : '--'}{' '}
            <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400">g/dia</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            {weighings.length} pesagem(ns)
          </p>
        </div>

        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Conversão Alimentar (CA)
          </span>
          <div className="text-lg font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5">
            {avgFeedConv}{' '}
            <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400">kg/kg</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">Eficiência nutricional</p>
        </div>

        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Rendimento de Carcaça
          </span>
          <div className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
            {avgCarcassYield !== '--' ? `${avgCarcassYield}%` : '--'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            {meatRecords.length} avaliação(ões)
          </p>
        </div>

        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Idade Média Abate
          </span>
          <div className="text-lg font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5">
            {avgSlaughterAge}{' '}
            <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400">meses</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">Meta: 32 a 35 kg</p>
        </div>
      </div>

      {/* Section Switcher + Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveSection('weighings')}
              className={`h-7 px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeSection === 'weighings'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              Pesagens ({weighings.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('carcass')}
              className={`h-7 px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeSection === 'carcass'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              Carcaça &amp; Terminação ({meatRecords.length})
            </button>
          </div>
        </div>

        {activeSection === 'weighings' ? (
          weighings.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
              Nenhuma pesagem registrada ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-950/60 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-medium">
                  <tr>
                    <th className="px-4 py-2.5">Data</th>
                    <th className="px-4 py-2.5">Caprino</th>
                    <th className="px-4 py-2.5 text-right">Peso (kg)</th>
                    <th className="px-4 py-2.5 text-right">GMD (g/dia)</th>
                    <th className="px-4 py-2.5 text-right">ECC</th>
                    <th className="px-4 py-2.5">FAMACHA</th>
                    <th className="px-4 py-2.5">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {weighings.map(w => {
                    const animal = animals.find(a => a.id === w.animalId);
                    return (
                      <tr
                        key={w.id}
                        className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        <td className="px-4 py-2.5 font-mono text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                          {w.date}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-zinc-100 whitespace-nowrap">
                          {animal ? `${animal.earTag} — ${animal.name}` : w.animalId}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                          {w.weightKg} kg
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-slate-800 dark:text-zinc-200">
                          {w.gmdGramsDay ?? '--'}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-slate-600 dark:text-zinc-400">
                          {w.bodyConditionScore ?? '--'}
                        </td>
                        <td className="px-4 py-2.5 tabular-nums text-emerald-600 dark:text-emerald-400 font-medium">
                          Grau {w.famachaScore || 1}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 dark:text-zinc-400 max-w-xs truncate">
                          {w.notes || '--'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : meatRecords.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
            Nenhuma avaliação de carcaça ou terminação registrada ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-950/60 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-medium">
                <tr>
                  <th className="px-4 py-2.5">Data</th>
                  <th className="px-4 py-2.5">Caprino</th>
                  <th className="px-4 py-2.5 text-right">Peso Vivo</th>
                  <th className="px-4 py-2.5 text-right">GMD</th>
                  <th className="px-4 py-2.5 text-right">CA</th>
                  <th className="px-4 py-2.5 text-right">Rend. Carcaça</th>
                  <th className="px-4 py-2.5 text-right">Idade (m)</th>
                  <th className="px-4 py-2.5">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {meatRecords.map(m => {
                  const animal = animals.find(a => a.id === m.animalId);
                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="px-4 py-2.5 font-mono text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                        {m.date}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-zinc-100 whitespace-nowrap">
                        {animal ? `${animal.earTag} — ${animal.name}` : m.animalId}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-slate-900 dark:text-zinc-100">
                        {m.liveWeightKg} kg
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-emerald-600 dark:text-emerald-400 font-medium">
                        {m.gmdGramsDay} g/d
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-slate-700 dark:text-zinc-300">
                        {m.feedConversion}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                        {m.carcassYieldPct}%
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-slate-700 dark:text-zinc-300">
                        {m.slaughterAgeMonths}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 dark:text-zinc-400 max-w-xs truncate">
                        {m.notes || '--'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add Weighing */}
      {isWeighModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Lançar Pesagem Zootécnica
              </h3>
              <button
                type="button"
                onClick={() => setIsWeighModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveWeighing} className="p-5 space-y-3 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Caprino *
                </label>
                <select
                  required
                  value={newWeighing.animalId || ''}
                  onChange={e => setNewWeighing({ ...newWeighing, animalId: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Selecionar caprino...</option>
                  {animals.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.earTag} — {a.name} ({a.category})
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
                    value={newWeighing.date || ''}
                    onChange={e => setNewWeighing({ ...newWeighing, date: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Peso Medido (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newWeighing.weightKg ?? ''}
                    onChange={e =>
                      setNewWeighing({ ...newWeighing, weightKg: parseFloat(e.target.value) || 0 })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    GMD (g/dia)
                  </label>
                  <input
                    type="number"
                    value={newWeighing.gmdGramsDay ?? 200}
                    onChange={e =>
                      setNewWeighing({
                        ...newWeighing,
                        gmdGramsDay: parseInt(e.target.value, 10) || 0
                      })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    ECC (1-5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={newWeighing.bodyConditionScore ?? 3.5}
                    onChange={e =>
                      setNewWeighing({
                        ...newWeighing,
                        bodyConditionScore: parseFloat(e.target.value) || 3.5
                      })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    FAMACHA
                  </label>
                  <select
                    value={newWeighing.famachaScore ?? 1}
                    onChange={e =>
                      setNewWeighing({
                        ...newWeighing,
                        famachaScore: parseInt(e.target.value, 10)
                      })
                    }
                    className={inputCls}
                  >
                    {[1, 2, 3, 4, 5].map(g => (
                      <option key={g} value={g}>
                        Grau {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Observações
                </label>
                <input
                  type="text"
                  value={newWeighing.notes || ''}
                  onChange={e => setNewWeighing({ ...newWeighing, notes: e.target.value })}
                  className={inputCls}
                  placeholder="Ex: Pesagem quinzenal de recria"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsWeighModalOpen(false)}
                  className="h-8 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Salvar Pesagem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Carcass / Meat Record */}
      {isMeatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Beef className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Avaliação de Carcaça &amp; Terminação
              </h3>
              <button
                type="button"
                onClick={() => setIsMeatModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMeat} className="p-5 space-y-3 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Caprino *
                </label>
                <select
                  required
                  value={newMeat.animalId || ''}
                  onChange={e => setNewMeat({ ...newMeat, animalId: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Selecionar caprino...</option>
                  {animals.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.earTag} — {a.name} ({a.breed})
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
                    value={newMeat.date || ''}
                    onChange={e => setNewMeat({ ...newMeat, date: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Peso Vivo (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeat.liveWeightKg ?? 34}
                    onChange={e =>
                      setNewMeat({ ...newMeat, liveWeightKg: parseFloat(e.target.value) || 0 })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    GMD (g/dia)
                  </label>
                  <input
                    type="number"
                    value={newMeat.gmdGramsDay ?? 220}
                    onChange={e =>
                      setNewMeat({ ...newMeat, gmdGramsDay: parseInt(e.target.value, 10) || 0 })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Conversão Alimentar (CA)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeat.feedConversion ?? 3.2}
                    onChange={e =>
                      setNewMeat({ ...newMeat, feedConversion: parseFloat(e.target.value) || 0 })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Rendimento Carcaça (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeat.carcassYieldPct ?? 49.5}
                    onChange={e =>
                      setNewMeat({ ...newMeat, carcassYieldPct: parseFloat(e.target.value) || 0 })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Idade ao Abate (meses)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newMeat.slaughterAgeMonths ?? 6}
                    onChange={e =>
                      setNewMeat({
                        ...newMeat,
                        slaughterAgeMonths: parseFloat(e.target.value) || 0
                      })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Observações
                </label>
                <input
                  type="text"
                  value={newMeat.notes || ''}
                  onChange={e => setNewMeat({ ...newMeat, notes: e.target.value })}
                  className={inputCls}
                  placeholder="Ex: Acabamento de gordura uniforme"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsMeatModalOpen(false)}
                  className="h-8 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Salvar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
