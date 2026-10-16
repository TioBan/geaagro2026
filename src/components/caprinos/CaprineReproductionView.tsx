import React, { useState } from 'react';
import { CaprineAnimal, CaprineReproductionRecord } from '../../types/caprine';
import { Heart, Plus, Calendar, Baby, Activity, AlertCircle, CheckCircle2, Search, X } from 'lucide-react';

interface Props {
  animals: CaprineAnimal[];
  reproductionRecords: CaprineReproductionRecord[];
  onSaveRecord: (rec: CaprineReproductionRecord) => void;
}

export const CaprineReproductionView: React.FC<Props> = ({
  animals,
  reproductionRecords,
  onSaveRecord
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRec, setNewRec] = useState<Partial<CaprineReproductionRecord>>({
    id: `rep-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    eventType: 'Monta Natural',
    pregnancyStatus: 'Confirmada',
    kidsCount: 2
  });

  const does = animals.filter(a => a.sex === 'Fêmea');
  const bucks = animals.filter(a => a.sex === 'Macho (Bode)');

  // KPIs
  const totalEvents = reproductionRecords.length;
  const totalBirths = reproductionRecords.filter(r => r.eventType === 'Parto').length;
  const totalKidsBorn = reproductionRecords.reduce((acc, curr) => acc + (curr.kidsCount || 0), 0);
  const prolificacyRate = totalBirths > 0 ? (totalKidsBorn / totalBirths).toFixed(2) : '1.80';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRec.animalId) {
      alert('Selecione a matriz caprina.');
      return;
    }
    onSaveRecord(newRec as CaprineReproductionRecord);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-600" />
            Reprodução, Inseminação & Maternidade Caprina
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Controle de coberturas, IA, diagnósticos de gestação (ultrassom), partos simples/múltiplos, prolificidade e IEP.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Registrar Evento Reprodutivo
        </button>
      </div>

      {/* Reproductive KPIs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold text-stone-400 block uppercase">Prolificidade</span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{prolificacyRate}</div>
          <p className="text-[10px] text-stone-500 mt-0.5">Crias nascidas por parto</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold text-stone-400 block uppercase">Intervalo Partos (IEP)</span>
          <div className="text-2xl font-black text-stone-900 dark:text-white">240 <span className="text-xs font-normal text-stone-500">dias</span></div>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Meta: 8 meses (3 partos em 2 anos)</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold text-stone-400 block uppercase">Taxa de Prenhez</span>
          <div className="text-2xl font-black text-emerald-600">92.5%</div>
          <p className="text-[10px] text-stone-500 mt-0.5">Eficiência da estação de IA</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold text-stone-400 block uppercase">Total de Partos</span>
          <div className="text-2xl font-black text-stone-900 dark:text-white">{totalBirths}</div>
          <p className="text-[10px] text-stone-500 mt-0.5">{totalKidsBorn} cabritos gerados</p>
        </div>
      </div>

      {/* Reproduction Records Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 dark:border-zinc-800">
          <h2 className="font-bold text-sm text-stone-900 dark:text-white">Histórico de Eventos Reprodutivos</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-zinc-800/80 text-stone-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Matriz (Cabra)</th>
                <th className="p-3">Tipo de Evento</th>
                <th className="p-3">Bode / Sêmen</th>
                <th className="p-3">Status Prenhez</th>
                <th className="p-3">Crias / Prole</th>
                <th className="p-3">IEP (Dias)</th>
                <th className="p-3">Anotações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-800 font-medium">
              {reproductionRecords.map(r => {
                const matrix = animals.find(a => a.id === r.animalId);
                return (
                  <tr key={r.id} className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                    <td className="p-3 font-mono text-stone-600 dark:text-stone-300">{r.date}</td>
                    <td className="p-3 font-bold text-stone-900 dark:text-white">
                      {matrix ? `${matrix.earTag} - ${matrix.name}` : r.animalId}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        r.eventType === 'Parto' ? 'bg-emerald-100 text-emerald-800' :
                        r.eventType === 'Inseminação Artificial (IA)' ? 'bg-sky-100 text-sky-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {r.eventType}
                      </span>
                    </td>
                    <td className="p-3 text-stone-600 dark:text-stone-300">{r.sireName || 'Bode Não Informado'}</td>
                    <td className="p-3 font-bold text-emerald-600">{r.pregnancyStatus || 'Confirmada'}</td>
                    <td className="p-3 font-bold text-stone-900 dark:text-white">
                      {r.kidsCount ? `${r.kidsCount} cria(s)` : '-'}
                    </td>
                    <td className="p-3 text-stone-600 dark:text-stone-300">{r.interBirthDays ? `${r.interBirthDays}d` : '-'}</td>
                    <td className="p-3 text-stone-500 italic max-w-xs truncate">{r.notes || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Reproduction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-6 space-y-4 border border-stone-200 dark:border-zinc-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-stone-200 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-600" />
                Lançamento Reprodutivo Caprino
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Matriz Caprina (Fêmea) *</label>
                <select
                  required
                  value={newRec.animalId || ''}
                  onChange={e => setNewRec({ ...newRec, animalId: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-bold"
                >
                  <option value="">-- Selecione a Matriz --</option>
                  {does.map(d => (
                    <option key={d.id} value={d.id}>{d.earTag} - {d.name} ({d.category})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Tipo de Evento *</label>
                  <select
                    value={newRec.eventType || 'Monta Natural'}
                    onChange={e => setNewRec({ ...newRec, eventType: e.target.value as any })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-bold"
                  >
                    <option value="Monta Natural">Monta Natural</option>
                    <option value="Inseminação Artificial (IA)">Inseminação Artificial (IA)</option>
                    <option value="Diagnóstico de Gestação">Diagnóstico de Gestação (DG)</option>
                    <option value="Parto">Parto</option>
                    <option value="Aborto">Aborto</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={newRec.date || ''}
                    onChange={e => setNewRec({ ...newRec, date: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Bode Reprodutor / Sêmen IA</label>
                <input
                  type="text"
                  value={newRec.sireName || ''}
                  onChange={e => setNewRec({ ...newRec, sireName: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  placeholder="Ex: Titan do Sertão (Bode Boer PO)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Crias (se parto)</label>
                  <select
                    value={newRec.kidsCount || 1}
                    onChange={e => setNewRec({ ...newRec, kidsCount: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-bold"
                  >
                    <option value={1}>1 (Simples)</option>
                    <option value={2}>2 (Gêmeos)</option>
                    <option value={3}>3 (Tríplice)</option>
                    <option value={4}>4 (Quádruplo)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Peso Total Nasc. (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newRec.birthWeightTotalKg || 3.5}
                    onChange={e => setNewRec({ ...newRec, birthWeightTotalKg: parseFloat(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Anotações / Observações</label>
                <textarea
                  rows={2}
                  value={newRec.notes || ''}
                  onChange={e => setNewRec({ ...newRec, notes: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  placeholder="Anotações sobre facilidade do parto ou ultrassom..."
                />
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
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
