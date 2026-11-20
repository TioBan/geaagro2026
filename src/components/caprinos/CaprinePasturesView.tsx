import React, { useState } from 'react';
import { CaprinePasturePaddock } from '../../types/caprine';
import { Sprout, Plus, Eye, X } from 'lucide-react';

interface Props {
  paddocks: CaprinePasturePaddock[];
  onSavePaddock: (padd: CaprinePasturePaddock) => void;
}

export const CaprinePasturesView: React.FC<Props> = ({ paddocks, onSavePaddock }) => {
  const [selectedPaddockId, setSelectedPaddockId] = useState<string>(paddocks[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [newPaddock, setNewPaddock] = useState<Partial<CaprinePasturePaddock>>({});

  const selectedPaddock = paddocks.find(p => p.id === selectedPaddockId) || paddocks[0];

  const handleOpenModal = () => {
    setFormError('');
    setNewPaddock({
      id: `piq-${Date.now()}`,
      code: `PIQ-CAP-${paddocks.length + 1}`,
      name: '',
      areaHa: 1.0,
      forageSpecies: 'Capim-Tifton 85 + Palma',
      entryHeightCm: 25,
      exitHeightCm: 10,
      forageMassKgDmHa: 2500,
      carryingCapacityGoatsHa: 25,
      restDays: 28,
      occupancyDays: 3,
      currentOccupancyGoats: 0,
      soilFertilityScore: 80,
      lastFertilizationDate: new Date().toISOString().split('T')[0],
      lastRainfallMm: 35
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaddock.name?.trim()) {
      setFormError('Informe o nome do piquete.');
      return;
    }
    const created: CaprinePasturePaddock = {
      id: newPaddock.id || `piq-${Date.now()}`,
      code: newPaddock.code || `PIQ-CAP-${paddocks.length + 1}`,
      name: newPaddock.name.trim(),
      areaHa: newPaddock.areaHa ?? 1.0,
      forageSpecies: newPaddock.forageSpecies || 'Capim-Tifton 85',
      entryHeightCm: newPaddock.entryHeightCm ?? 25,
      exitHeightCm: newPaddock.exitHeightCm ?? 10,
      forageMassKgDmHa: newPaddock.forageMassKgDmHa ?? 2500,
      carryingCapacityGoatsHa: newPaddock.carryingCapacityGoatsHa ?? 25,
      restDays: newPaddock.restDays ?? 28,
      occupancyDays: newPaddock.occupancyDays ?? 3,
      currentOccupancyGoats: newPaddock.currentOccupancyGoats ?? 0,
      soilFertilityScore: newPaddock.soilFertilityScore ?? 80,
      lastFertilizationDate:
        newPaddock.lastFertilizationDate || new Date().toISOString().split('T')[0],
      lastRainfallMm: newPaddock.lastRainfallMm ?? 0,
      notes: newPaddock.notes
    };
    onSavePaddock(created);
    setSelectedPaddockId(created.id);
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
            <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            Pastagens, Caprineira &amp; Gêmeo do Piquete
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Rotação de pasto, forragens, massa seca, suporte de lotação e fertilidade do solo.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Cadastrar Piquete
        </button>
      </div>

      {/* Selected Paddock Digital Twin Card */}
      {selectedPaddock && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 px-2 py-0.5 rounded-md">
                  {selectedPaddock.code}
                </span>
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  Gêmeo Digital do Piquete
                </span>
              </div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 mt-1">
                {selectedPaddock.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {selectedPaddock.forageSpecies} · Área:{' '}
                <span className="tabular-nums font-medium">{selectedPaddock.areaHa} ha</span>
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                Fertilidade do Solo
              </span>
              <span className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {selectedPaddock.soilFertilityScore}{' '}
                <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">/ 100</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 border-t border-slate-200 dark:border-zinc-800 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30">
            <div className="px-4 py-3">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                Massa Forragem
              </span>
              <span className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {selectedPaddock.forageMassKgDmHa} kg MS/ha
              </span>
            </div>
            <div className="px-4 py-3">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Suporte</span>
              <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                {selectedPaddock.carryingCapacityGoatsHa} cab./ha
              </span>
            </div>
            <div className="px-4 py-3">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                Lotação Atual
              </span>
              <span className="text-sm font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                {selectedPaddock.currentOccupancyGoats} cabras
              </span>
            </div>
            <div className="px-4 py-3">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Descanso</span>
              <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                {selectedPaddock.restDays} dias
              </span>
            </div>
            <div className="px-4 py-3">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                Última Chuva
              </span>
              <span className="text-sm font-semibold tabular-nums text-sky-600 dark:text-sky-400">
                {selectedPaddock.lastRainfallMm} mm
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Paddocks Grid */}
      {paddocks.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-10 text-center text-xs text-slate-500 dark:text-zinc-400">
          Nenhum piquete ou caprineira cadastrada ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paddocks.map(p => {
            const isSelected = selectedPaddock?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPaddockId(p.id)}
                className={`text-left bg-white dark:bg-zinc-900 p-4 rounded-xl border transition-colors cursor-pointer space-y-3 ${
                  isSelected
                    ? 'border-emerald-600 dark:border-emerald-500'
                    : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                    {p.code}
                  </span>
                  <span className="text-[11px] font-medium tabular-nums text-emerald-700 dark:text-emerald-400">
                    {p.areaHa} ha
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    {p.forageSpecies}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800 text-xs tabular-nums">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                      Massa Forragem
                    </span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {p.forageMassKgDmHa} kg MS/ha
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                      Altura Entr./Saída
                    </span>
                    <span className="font-medium text-slate-800 dark:text-zinc-200">
                      {p.entryHeightCm}/{p.exitHeightCm} cm
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-zinc-400 tabular-nums">
                    Solo: <strong className="text-slate-800 dark:text-zinc-200">{p.soilFertilityScore}/100</strong>
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {isSelected ? 'Selecionado' : 'Inspecionar'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Add Paddock Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Cadastrar Piquete / Caprineira
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
                  Nome do Piquete *
                </label>
                <input
                  type="text"
                  required
                  value={newPaddock.name || ''}
                  onChange={e => setNewPaddock({ ...newPaddock, name: e.target.value })}
                  className={inputCls}
                  placeholder="Ex: Piquete Tifton 03"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Código ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPaddock.code || ''}
                    onChange={e => setNewPaddock({ ...newPaddock, code: e.target.value })}
                    className={`${inputCls} font-mono`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Área (ha) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newPaddock.areaHa ?? 1.0}
                    onChange={e =>
                      setNewPaddock({ ...newPaddock, areaHa: parseFloat(e.target.value) || 0 })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Espécie Forrageira *
                </label>
                <input
                  type="text"
                  value={newPaddock.forageSpecies || ''}
                  onChange={e => setNewPaddock({ ...newPaddock, forageSpecies: e.target.value })}
                  className={inputCls}
                  placeholder="Ex: Capim-Tifton 85 + Palma"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Massa (kg MS/ha)
                  </label>
                  <input
                    type="number"
                    value={newPaddock.forageMassKgDmHa ?? 2500}
                    onChange={e =>
                      setNewPaddock({
                        ...newPaddock,
                        forageMassKgDmHa: parseInt(e.target.value, 10) || 0
                      })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Suporte (cabras/ha)
                  </label>
                  <input
                    type="number"
                    value={newPaddock.carryingCapacityGoatsHa ?? 25}
                    onChange={e =>
                      setNewPaddock({
                        ...newPaddock,
                        carryingCapacityGoatsHa: parseInt(e.target.value, 10) || 0
                      })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Descanso (dias)
                  </label>
                  <input
                    type="number"
                    value={newPaddock.restDays ?? 28}
                    onChange={e =>
                      setNewPaddock({ ...newPaddock, restDays: parseInt(e.target.value, 10) || 0 })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Fertilidade (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newPaddock.soilFertilityScore ?? 80}
                    onChange={e =>
                      setNewPaddock({
                        ...newPaddock,
                        soilFertilityScore: parseInt(e.target.value, 10) || 0
                      })
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
                  Salvar Piquete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
