import React, { useState } from 'react';
import { CaprineAnimal, CaprineKidRecord } from '../../types/caprine';
import { Baby, Plus, Scale, Milk, Activity, ShieldCheck, Heart, X } from 'lucide-react';

interface Props {
  animals: CaprineAnimal[];
  kidRecords: CaprineKidRecord[];
  onSaveKid: (kid: CaprineKidRecord) => void;
}

export const CaprineKidsManagementView: React.FC<Props> = ({
  animals,
  kidRecords,
  onSaveKid
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKid, setNewKid] = useState<Partial<CaprineKidRecord>>({
    id: `kid-${Date.now()}`,
    earTag: `CAP-${kidRecords.length + 201}`,
    name: 'Cabrito Novo',
    birthDate: new Date().toISOString().split('T')[0],
    birthWeightKg: 3.5,
    colostrumHours: 1.5,
    colostrumStatus: 'Excelente (<2h)',
    gmdGramsDay: 200,
    status: 'Em Amamentação'
  });

  const mothers = animals.filter(a => a.sex === 'Fêmea');

  // KPIs
  const totalKids = kidRecords.length;
  const colostrumSuccessRate = totalKids > 0
    ? Math.round((kidRecords.filter(k => k.colostrumHours <= 2).length / totalKids) * 100)
    : 100;
  const avgGmdKids = totalKids > 0
    ? Math.round(kidRecords.reduce((acc, curr) => acc + curr.gmdGramsDay, 0) / totalKids)
    : 210;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKid.name || !newKid.motherId) {
      alert('Preencha o nome do cabrito e a mãe matriz.');
      return;
    }
    onSaveKid(newKid as CaprineKidRecord);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Baby className="w-6 h-6 text-amber-500" />
            Maternidade & Criação de Cabritos (Bezerreiro Caprino)
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Controle de colostragem precoce, ganho de peso diário (GMD), desmame orientado e sanidade dos neonatos.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Registrar Nascimento de Cabrito
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold text-stone-400 block uppercase">Colostragem em Tempo Hábil</span>
          <div className="text-2xl font-black text-emerald-600">{colostrumSuccessRate}%</div>
          <p className="text-[10px] text-stone-500 mt-0.5">Ingestão de colostro nas primeiras 2 horas de vida</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold text-stone-400 block uppercase">GMD Pré-Desmame</span>
          <div className="text-2xl font-black text-amber-600">{avgGmdKids} <span className="text-xs font-normal text-stone-500">g/dia</span></div>
          <p className="text-[10px] text-stone-500 mt-0.5">Crescimento acelerado na fase mamando</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold text-stone-400 block uppercase">Mortalidade Neonatal</span>
          <div className="text-2xl font-black text-emerald-600">0.0%</div>
          <p className="text-[10px] text-stone-500 mt-0.5">Ambiente e colostragem 100% eficientes</p>
        </div>
      </div>

      {/* Kid Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kidRecords.map(kid => {
          const mother = animals.find(a => a.id === kid.motherId);
          return (
            <div
              key={kid.id}
              className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-mono text-xs font-bold px-2 py-0.5 rounded">
                    {kid.earTag}
                  </span>
                  <h3 className="font-extrabold text-base text-stone-900 dark:text-white mt-1">{kid.name}</h3>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  {kid.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-stone-200/60 dark:border-zinc-700/60">
                <div>
                  <span className="text-stone-400 block">Nascimento:</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{kid.birthDate}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">Peso Nasc.:</span>
                  <span className="font-bold text-amber-600">{kid.birthWeightKg} kg</span>
                </div>
                <div>
                  <span className="text-stone-400 block">Colostragem:</span>
                  <span className="font-bold text-emerald-600">{kid.colostrumHours}h ({kid.colostrumStatus})</span>
                </div>
                <div>
                  <span className="text-stone-400 block">GMD Diário:</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{kid.gmdGramsDay} g/dia</span>
                </div>
              </div>

              <div className="text-xs text-stone-500 pt-2 border-t border-stone-100 dark:border-zinc-800 flex justify-between">
                <span>Mãe Matriz: <strong>{mother?.name || 'Matriz N/I'}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Kid */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-6 space-y-4 border border-stone-200 dark:border-zinc-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-stone-200 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Baby className="w-5 h-5 text-amber-500" />
                Registrar Nascimento de Cabrito
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Nome / Identificação *</label>
                  <input
                    type="text"
                    required
                    value={newKid.name || ''}
                    onChange={e => setNewKid({ ...newKid, name: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Número do Brinco *</label>
                  <input
                    type="text"
                    required
                    value={newKid.earTag || ''}
                    onChange={e => setNewKid({ ...newKid, earTag: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Mãe Matriz *</label>
                <select
                  required
                  value={newKid.motherId || ''}
                  onChange={e => setNewKid({ ...newKid, motherId: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-bold"
                >
                  <option value="">-- Selecione a Matriz --</option>
                  {mothers.map(m => (
                    <option key={m.id} value={m.id}>{m.earTag} - {m.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={newKid.birthDate || ''}
                    onChange={e => setNewKid({ ...newKid, birthDate: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Peso ao Nascer (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newKid.birthWeightKg || 3.5}
                    onChange={e => setNewKid({ ...newKid, birthWeightKg: parseFloat(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-bold text-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Tempo de Colostragem (horas)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newKid.colostrumHours || 1.5}
                    onChange={e => setNewKid({ ...newKid, colostrumHours: parseFloat(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Qualidade Colostro</label>
                  <select
                    value={newKid.colostrumStatus || 'Excelente (<2h)'}
                    onChange={e => setNewKid({ ...newKid, colostrumStatus: e.target.value as any })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  >
                    <option value="Excelente (<2h)">Excelente (&lt;2h)</option>
                    <option value="Adequado (2-6h)">Adequado (2-6h)</option>
                    <option value="Deficiente (>6h)">Deficiente (&gt;6h)</option>
                  </select>
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
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-bold"
                >
                  Salvar Cabrito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
