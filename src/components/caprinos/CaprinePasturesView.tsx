import React, { useState } from 'react';
import { CaprinePasturePaddock } from '../../types/caprine';
import { Sprout, Plus, CloudRain, ShieldCheck, Sun, Layers, Eye, Compass, X } from 'lucide-react';

interface Props {
  paddocks: CaprinePasturePaddock[];
  onSavePaddock: (padd: CaprinePasturePaddock) => void;
}

export const CaprinePasturesView: React.FC<Props> = ({ paddocks, onSavePaddock }) => {
  const [selectedPaddockId, setSelectedPaddockId] = useState<string>(paddocks[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPaddock, setNewPaddock] = useState<Partial<CaprinePasturePaddock>>({
    id: `piq-${Date.now()}`,
    code: `PIQ-CAP-${paddocks.length + 1}`,
    name: 'Novo Piquete Caprineira',
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

  const selectedPaddock = paddocks.find(p => p.id === selectedPaddockId) || paddocks[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaddock.name) {
      alert('Informe o nome do piquete.');
      return;
    }
    onSavePaddock(newPaddock as CaprinePasturePaddock);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Sprout className="w-6 h-6 text-emerald-600" />
            Gestão de Pastagens, Caprineira & Gêmeo Digital do Piquete
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Controle de rotação de pasto, forragens (Tifton, Palma, Leucena), suporte de lotação, adubações e chuvas.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Piquete
        </button>
      </div>

      {/* Gêmeo Digital do Piquete Selected Banner */}
      {selectedPaddock && (
        <div className="bg-gradient-to-br from-emerald-950 via-stone-900 to-zinc-900 rounded-2xl p-6 text-white shadow-xl space-y-4 border border-emerald-500/30">
          <div className="flex justify-between items-start">
            <div>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-emerald-400/30">
                🌱 Gêmeo Digital 360° do Piquete • {selectedPaddock.code}
              </span>
              <h2 className="text-2xl font-black mt-2">{selectedPaddock.name}</h2>
              <p className="text-xs text-emerald-200/80">{selectedPaddock.forageSpecies} • Área: {selectedPaddock.areaHa} ha</p>
            </div>

            <div className="text-right bg-white/10 p-3 rounded-xl border border-white/10">
              <span className="text-[10px] text-stone-300 uppercase block">Fertilidade do Solo</span>
              <span className="text-xl font-black text-emerald-400">{selectedPaddock.soilFertilityScore} / 100</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-white/5 p-4 rounded-xl border border-white/10 text-xs">
            <div>
              <span className="text-stone-400 block text-[10px] uppercase">Massa de Forragem</span>
              <span className="font-bold text-emerald-300 text-sm">{selectedPaddock.forageMassKgDmHa} kg MS/ha</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase">Capacidade Suporte</span>
              <span className="font-bold text-white text-sm">{selectedPaddock.carryingCapacityGoatsHa} cabras/ha</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase">Lotação Atual</span>
              <span className="font-bold text-amber-300 text-sm">{selectedPaddock.currentOccupancyGoats} cabras</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase">Dias de Descanso</span>
              <span className="font-bold text-white text-sm">{selectedPaddock.restDays} dias</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase">Última Chuva</span>
              <span className="font-bold text-sky-300 text-sm">{selectedPaddock.lastRainfallMm} mm</span>
            </div>
          </div>
        </div>
      )}

      {/* Paddocks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paddocks.map(p => (
          <div
            key={p.id}
            onClick={() => setSelectedPaddockId(p.id)}
            className={`bg-white dark:bg-zinc-900 p-5 rounded-2xl border transition-all cursor-pointer shadow-sm ${
              selectedPaddockId === p.id
                ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                : 'border-stone-200 dark:border-zinc-800 hover:border-emerald-400'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                {p.code}
              </span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                {p.areaHa} ha
              </span>
            </div>

            <h3 className="font-extrabold text-base text-stone-900 dark:text-white mb-1">{p.name}</h3>
            <p className="text-xs text-stone-500 mb-3">{p.forageSpecies}</p>

            <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-stone-200/60 dark:border-zinc-700/60">
              <div>
                <span className="text-stone-400 block text-[10px]">Massa Forragem:</span>
                <span className="font-bold text-emerald-600">{p.forageMassKgDmHa} kg MS/ha</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Altura Entrada/Saída:</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">{p.entryHeightCm}/{p.exitHeightCm} cm</span>
              </div>
            </div>

            <div className="mt-3 text-xs text-stone-500 flex justify-between items-center pt-2 border-t border-stone-100 dark:border-zinc-800">
              <span>Fertilidade Solo: <strong>{p.soilFertilityScore}/100</strong></span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Ver Gêmeo
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Paddock */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 dark:border-zinc-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-stone-200 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-600" />
                Cadastrar Piquete / Caprineira
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Nome do Piquete *</label>
                <input
                  type="text"
                  required
                  value={newPaddock.name || ''}
                  onChange={e => setNewPaddock({ ...newPaddock, name: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  placeholder="Ex: Piquete Tifton 03"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Código ID *</label>
                  <input
                    type="text"
                    required
                    value={newPaddock.code || ''}
                    onChange={e => setNewPaddock({ ...newPaddock, code: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Área (Hectares) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newPaddock.areaHa || 1.0}
                    onChange={e => setNewPaddock({ ...newPaddock, areaHa: parseFloat(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Espécie Forrageira *</label>
                <input
                  type="text"
                  value={newPaddock.forageSpecies || ''}
                  onChange={e => setNewPaddock({ ...newPaddock, forageSpecies: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  placeholder="Ex: Capim-Tifton 85 + Palma"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Massa Forragem (kg MS/ha)</label>
                  <input
                    type="number"
                    value={newPaddock.forageMassKgDmHa || 2500}
                    onChange={e => setNewPaddock({ ...newPaddock, forageMassKgDmHa: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-bold text-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Capacidade (Cabras/ha)</label>
                  <input
                    type="number"
                    value={newPaddock.carryingCapacityGoatsHa || 25}
                    onChange={e => setNewPaddock({ ...newPaddock, carryingCapacityGoatsHa: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold"
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
