import React, { useState } from 'react';
import { CaprineAnimal, CaprineMeatRecord, CaprineWeighingRecord } from '../../types/caprine';
import { Scale, Plus, Beef, TrendingUp, Calendar, Activity, X } from 'lucide-react';

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
  const [isWeighModalOpen, setIsWeighModalOpen] = useState(false);
  const [newWeighing, setNewWeighing] = useState<Partial<CaprineWeighingRecord>>({
    id: `wei-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    weightKg: 25.0,
    gmdGramsDay: 200,
    bodyConditionScore: 3.5,
    famachaScore: 1
  });

  const meatCategoryAnimals = animals.filter(a =>
    a.category === 'Cabrito Desmamado' ||
    a.category === 'Caprino para Abate' ||
    a.category === 'Reprodutor (Bode)' ||
    a.breed === 'Boer'
  );

  const handleSaveWeighing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeighing.animalId) {
      alert('Selecione o animal.');
      return;
    }
    onSaveWeighing(newWeighing as CaprineWeighingRecord);
    setIsWeighModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Beef className="w-6 h-6 text-emerald-600" />
            Produção de Carne Caprina, Pesagens & Rendimento de Carcaça
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Acompanhamento do Ganho Médio Diário (GMD g/dia), Conversão Alimentar (CA), Rendimento (%) e Projeção de Abate.
          </p>
        </div>

        <button
          onClick={() => setIsWeighModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          <Scale className="w-4 h-4" />
          Lançar Nova Pesagem
        </button>
      </div>

      {/* Meat KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold text-stone-400 block uppercase">GMD Médio em Recria</span>
          <div className="text-2xl font-black text-emerald-600">220 <span className="text-xs font-normal text-stone-500">g/dia</span></div>
          <p className="text-[10px] text-stone-500 mt-0.5">Cruzamento Boer x Anglo</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold text-stone-400 block uppercase">Conversão Alimentar (CA)</span>
          <div className="text-2xl font-black text-stone-900 dark:text-white">3.2 <span className="text-xs font-normal text-stone-500">kg/kg</span></div>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Alta eficiência nutricional</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold text-stone-400 block uppercase">Rendimento de Carcaça</span>
          <div className="text-2xl font-black text-emerald-600">49.5%</div>
          <p className="text-[10px] text-stone-500 mt-0.5">Carcaça limpa e bem acabada</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold text-stone-400 block uppercase">Idade ao Abate</span>
          <div className="text-2xl font-black text-stone-900 dark:text-white">6 <span className="text-xs font-normal text-stone-500">meses</span></div>
          <p className="text-[10px] text-stone-500 mt-0.5">Peso alvo: 32 a 35 kg</p>
        </div>
      </div>

      {/* Weighings History Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 dark:border-zinc-800">
          <h2 className="font-bold text-sm text-stone-900 dark:text-white">Histórico Recente de Pesagens & Evolução de Peso</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-zinc-800/80 text-stone-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Caprino</th>
                <th className="p-3">Peso (kg)</th>
                <th className="p-3">GMD (g/dia)</th>
                <th className="p-3">ECC (1-5)</th>
                <th className="p-3">FAMACHA</th>
                <th className="p-3">Observações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-800 font-medium">
              {weighings.map(w => {
                const animal = animals.find(a => a.id === w.animalId);
                return (
                  <tr key={w.id} className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                    <td className="p-3 font-mono text-stone-600 dark:text-stone-300">{w.date}</td>
                    <td className="p-3 font-bold text-stone-900 dark:text-white">
                      {animal ? `${animal.earTag} - ${animal.name}` : w.animalId}
                    </td>
                    <td className="p-3 font-black text-emerald-600">{w.weightKg} kg</td>
                    <td className="p-3 text-stone-800 dark:text-stone-200 font-bold">{w.gmdGramsDay || 200} g/dia</td>
                    <td className="p-3 text-stone-600 dark:text-stone-300">{w.bodyConditionScore || 3.5}</td>
                    <td className="p-3 font-bold text-emerald-600">Grau {w.famachaScore || 1}</td>
                    <td className="p-3 text-stone-500 italic max-w-xs truncate">{w.notes || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Weighing */}
      {isWeighModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 dark:border-zinc-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-stone-200 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-600" />
                Lançar Pesagem Zootécnica
              </h3>
              <button onClick={() => setIsWeighModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWeighing} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Caprino *</label>
                <select
                  required
                  value={newWeighing.animalId || ''}
                  onChange={e => setNewWeighing({ ...newWeighing, animalId: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-bold"
                >
                  <option value="">-- Selecione o Caprino --</option>
                  {animals.map(a => (
                    <option key={a.id} value={a.id}>{a.earTag} - {a.name} ({a.category})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={newWeighing.date || ''}
                    onChange={e => setNewWeighing({ ...newWeighing, date: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Peso Medido (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newWeighing.weightKg || ''}
                    onChange={e => setNewWeighing({ ...newWeighing, weightKg: parseFloat(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-black text-emerald-600 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">GMD Estimado (g/dia)</label>
                  <input
                    type="number"
                    value={newWeighing.gmdGramsDay || 200}
                    onChange={e => setNewWeighing({ ...newWeighing, gmdGramsDay: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">ECC (1.0 a 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={newWeighing.bodyConditionScore || 3.5}
                    onChange={e => setNewWeighing({ ...newWeighing, bodyConditionScore: parseFloat(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Anotações da Pesagem</label>
                <input
                  type="text"
                  value={newWeighing.notes || ''}
                  onChange={e => setNewWeighing({ ...newWeighing, notes: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  placeholder="Ex: Pós-desmame, pesagem quinzenal de controle..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWeighModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-stone-200 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold"
                >
                  Salvar Pesagem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
