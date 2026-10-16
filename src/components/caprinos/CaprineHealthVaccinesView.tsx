import React, { useState } from 'react';
import { CaprineAnimal, CaprineHealthRecord } from '../../types/caprine';
import { Syringe, Plus, Activity, ShieldCheck, AlertTriangle, CheckCircle2, Clock, Eye, X } from 'lucide-react';

interface Props {
  animals: CaprineAnimal[];
  healthRecords: CaprineHealthRecord[];
  onSaveHealthRecord: (rec: CaprineHealthRecord) => void;
}

export const CaprineHealthVaccinesView: React.FC<Props> = ({
  animals,
  healthRecords,
  onSaveHealthRecord
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHealth, setNewHealth] = useState<Partial<CaprineHealthRecord>>({
    id: `hea-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    type: 'Vermifugação (FAMACHA)',
    productName: 'Moxidectina 1% Caprinos',
    dosage: '1 mL / 50 kg SC',
    famachaScore: 1,
    withdrawalMilkDays: 0,
    withdrawalMeatDays: 14,
    veterinarian: 'Dra. Camila Nogueira'
  });

  // FAMACHA Color Scale Helper
  const getFamachaBadge = (score: number) => {
    switch (score) {
      case 1:
        return { label: 'Grau 1: Ótimo (Vermelho Escuro)', color: 'bg-emerald-600 text-white' };
      case 2:
        return { label: 'Grau 2: Bom (Vermelho Rosa)', color: 'bg-emerald-500 text-white' };
      case 3:
        return { label: 'Grau 3: Atenção (Rosa Pálido)', color: 'bg-amber-500 text-white' };
      case 4:
        return { label: 'Grau 4: Anêmico (Rosa Muito Pálido)', color: 'bg-rose-600 text-white' };
      case 5:
        return { label: 'Grau 5: Anêmico Severo (Branco)', color: 'bg-red-700 text-white font-black animate-pulse' };
      default:
        return { label: 'Grau 1: Ótimo', color: 'bg-emerald-600 text-white' };
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHealth.animalId) {
      alert('Selecione o caprino.');
      return;
    }
    onSaveHealthRecord(newHealth as CaprineHealthRecord);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Syringe className="w-6 h-6 text-emerald-600" />
            Sanidade Caprina, Controle FAMACHA & Carência
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Vacinações (Clostridiose, Raiva, Linfoadenite), avaliação ocular FAMACHA (1-5), exames de CAE e controle de carência de leite e carne.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Registrar Evento Sanitário / FAMACHA
        </button>
      </div>

      {/* FAMACHA Visual Guide Card */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-emerald-600" />
          Escala Oficial do Cartão FAMACHA (Controle da Haemonchose Caprina)
        </h2>
        <p className="text-xs text-stone-500">
          Desverminação seletiva: Tratar apenas animais com mucosa ocular Rosa Pálido (Grau 3), Anêmico (Grau 4) e Branco (Grau 5) para conter a resistência parasitária.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3 bg-red-800 text-white rounded-xl space-y-1 text-center">
            <span className="font-black text-sm block">Grau 1</span>
            <span className="text-[10px] opacity-90 block font-bold">Vermelho Vivo</span>
            <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded block">Não Desverminar</span>
          </div>

          <div className="p-3 bg-red-500 text-white rounded-xl space-y-1 text-center">
            <span className="font-black text-sm block">Grau 2</span>
            <span className="text-[10px] opacity-90 block font-bold">Vermelho Rosa</span>
            <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded block">Não Desverminar</span>
          </div>

          <div className="p-3 bg-pink-400 text-stone-900 rounded-xl space-y-1 text-center font-bold">
            <span className="font-black text-sm block">Grau 3</span>
            <span className="text-[10px] block">Rosa Pálido</span>
            <span className="text-[9px] bg-stone-900/10 px-2 py-0.5 rounded block">Atenção / Tratar</span>
          </div>

          <div className="p-3 bg-pink-200 text-stone-900 rounded-xl space-y-1 text-center font-bold">
            <span className="font-black text-sm block">Grau 4</span>
            <span className="text-[10px] block">Anêmico</span>
            <span className="text-[9px] bg-rose-600 text-white px-2 py-0.5 rounded block font-bold">Desverminar Urgente</span>
          </div>

          <div className="p-3 bg-stone-100 text-stone-900 border-2 border-red-600 rounded-xl space-y-1 text-center font-black">
            <span className="font-black text-sm block text-red-600">Grau 5</span>
            <span className="text-[10px] block text-stone-700">Branco Severo</span>
            <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded block">Emergência U.T.I</span>
          </div>
        </div>
      </div>

      {/* Health Records Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 dark:border-zinc-800">
          <h2 className="font-bold text-sm text-stone-900 dark:text-white">Histórico de Eventos Sanitários & Ocorrências</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-zinc-800/80 text-stone-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Caprino</th>
                <th className="p-3">Tipo de Procedimento</th>
                <th className="p-3">Produto / Exame</th>
                <th className="p-3">FAMACHA / OPG</th>
                <th className="p-3">Carência Leite/Carne</th>
                <th className="p-3">Veterinário</th>
                <th className="p-3">Observações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-800 font-medium">
              {healthRecords.map(h => {
                const goat = animals.find(a => a.id === h.animalId);
                const badge = getFamachaBadge(h.famachaScore || 1);
                return (
                  <tr key={h.id} className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                    <td className="p-3 font-mono text-stone-600 dark:text-stone-300">{h.date}</td>
                    <td className="p-3 font-bold text-stone-900 dark:text-white">
                      {goat ? `${goat.earTag} - ${goat.name}` : h.animalId}
                    </td>
                    <td className="p-3">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        {h.type}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-stone-800 dark:text-stone-200">{h.productName}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badge.color}`}>
                        Grau {h.famachaScore || 1}
                      </span>
                    </td>
                    <td className="p-3 text-stone-600 dark:text-stone-300">
                      {h.withdrawalMilkDays > 0 || h.withdrawalMeatDays > 0 ? (
                        <span className="text-amber-600 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Leite: {h.withdrawalMilkDays}d | Carne: {h.withdrawalMeatDays}d
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-bold">Sem carência</span>
                      )}
                    </td>
                    <td className="p-3 text-stone-600 dark:text-stone-300">{h.veterinarian}</td>
                    <td className="p-3 text-stone-500 italic max-w-xs truncate">{h.notes || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Health */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 dark:border-zinc-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-stone-200 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Syringe className="w-5 h-5 text-emerald-600" />
                Registrar Procedimento Sanitário
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Caprino *</label>
                <select
                  required
                  value={newHealth.animalId || ''}
                  onChange={e => setNewHealth({ ...newHealth, animalId: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-bold"
                >
                  <option value="">-- Selecione o Caprino --</option>
                  {animals.map(a => (
                    <option key={a.id} value={a.id}>{a.earTag} - {a.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Tipo de Evento *</label>
                  <select
                    value={newHealth.type || 'Vermifugação (FAMACHA)'}
                    onChange={e => setNewHealth({ ...newHealth, type: e.target.value as any })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  >
                    <option value="Vermifugação (FAMACHA)">Vermifugação (FAMACHA)</option>
                    <option value="Vacina">Vacina</option>
                    <option value="Ectoparasita">Ectoparasita</option>
                    <option value="Tratamento">Tratamento Clínico</option>
                    <option value="Exame (CAE/Linfoadenite)">Exame (CAE/Linfoadenite)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={newHealth.date || ''}
                    onChange={e => setNewHealth({ ...newHealth, date: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Nome do Produto / Exame *</label>
                <input
                  type="text"
                  required
                  value={newHealth.productName || ''}
                  onChange={e => setNewHealth({ ...newHealth, productName: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  placeholder="Ex: Moxidectina 1% / Vacina Clostridiose"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Grau FAMACHA (1 a 5)</label>
                  <select
                    value={newHealth.famachaScore || 1}
                    onChange={e => setNewHealth({ ...newHealth, famachaScore: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-bold"
                  >
                    <option value={1}>Grau 1 (Vermelho/Ótimo)</option>
                    <option value={2}>Grau 2 (Vermelho Rosa)</option>
                    <option value={3}>Grau 3 (Rosa Pálido - Tratar)</option>
                    <option value={4}>Grau 4 (Anêmico - Urgente)</option>
                    <option value={5}>Grau 5 (Branco - Severo)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Dosagem / Aplicação</label>
                  <input
                    type="text"
                    value={newHealth.dosage || ''}
                    onChange={e => setNewHealth({ ...newHealth, dosage: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                    placeholder="Ex: 1 mL / 50 kg SC"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Carência Leite (Dias)</label>
                  <input
                    type="number"
                    value={newHealth.withdrawalMilkDays || 0}
                    onChange={e => setNewHealth({ ...newHealth, withdrawalMilkDays: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-bold text-amber-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Carência Carne (Dias)</label>
                  <input
                    type="number"
                    value={newHealth.withdrawalMeatDays || 0}
                    onChange={e => setNewHealth({ ...newHealth, withdrawalMeatDays: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-bold text-rose-600"
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
                  Salvar Ocorrência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
