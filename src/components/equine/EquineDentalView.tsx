// @ts-nocheck
import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Plus,
  Calendar,
  User,
  X,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { EquineAnimal, EquineDentalRecord } from '../../types/equine';

interface Props {
  animals: EquineAnimal[];
  dentalRecords: EquineDentalRecord[];
  onAddDental: (record: EquineDentalRecord) => void;
}

export const EquineDentalView: React.FC<Props> = ({
  animals,
  dentalRecords,
  onAddDental,
}) => {
  const [selectedAnimalId, setSelectedAnimalFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<EquineDentalRecord>>({
    animalId: animals[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    veterinarian: 'Dra. Luísa Odonto Equina - CRMV 21450',
    wearGrade: 'Leve',
    proceduresPerformed: ['Odontoplastia (Grosagem Elétrica)', 'Nivelamento de Pontas de Esmalte'],
    costBrl: 450,
    findings: 'Presença de pontas de esmalte nas arcadas superiores vestibulares e inferiores linguais.',
    notes: 'Melhora imediata na mastigação e aceitação da embocadura.',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.animalId) return;

    const baseDate = new Date(formData.date || new Date());
    const nextDate = new Date(baseDate);
    nextDate.setMonth(nextDate.getMonth() + 6);

    const newRecord: EquineDentalRecord = {
      ...(formData as EquineDentalRecord),
      id: `den-${Date.now()}`,
      nextReviewDate: nextDate.toISOString().split('T')[0],
      proceduresPerformed: formData.proceduresPerformed || ['Grosagem Elétrica'],
    };

    onAddDental(newRecord);
    setIsModalOpen(false);
  };

  const filteredRecords = dentalRecords.filter(d =>
    selectedAnimalId === 'all' || d.animalId === selectedAnimalId
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="text-[10px] font-black uppercase text-teal-900 tracking-wider flex items-center gap-1">
            <span className="text-base">🦷</span> Odontologia & Saúde Oral Equina
          </div>
          <h2 className="text-xl font-black text-stone-900">
            Odontoplastia, Nivelamento & Tabela Dentária Triadan
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Manutenção da mastigação eficiente, conforto da embocadura e prevenção de lesões orais
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedAnimalId}
            onChange={e => setSelectedAnimalFilter(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-hidden"
          >
            <option value="all">Todos os Cavalos</option>
            {animals.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Revisão Dental</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-500 font-bold uppercase block">Revisões Realizadas</span>
          <span className="text-2xl font-black text-stone-900">{dentalRecords.length}</span>
          <span className="text-[11px] text-teal-700 block mt-0.5 font-semibold">Odontoplastia completa</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-teal-800 font-bold uppercase block">Ciclo de Revisão</span>
          <span className="text-2xl font-black text-teal-900 font-mono">6 meses</span>
          <span className="text-[11px] text-stone-500 block mt-0.5">Semestral / Atletas</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-500 font-bold uppercase block">Dente de Lobo Extraído</span>
          <span className="text-2xl font-black text-stone-900 font-mono">100%</span>
          <span className="text-[11px] text-emerald-700 block mt-0.5 font-semibold">Sem conflito de embocadura</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-500 font-bold uppercase block">Eficiência de Mastigação</span>
          <span className="text-2xl font-black text-emerald-800 font-mono">98%</span>
          <span className="text-[11px] text-emerald-700 block mt-0.5 font-semibold">Absorção de nutrientes</span>
        </div>
      </div>

      {/* Dental Records Listing */}
      <div className="space-y-4">
        {filteredRecords.map(d => {
          const animal = animals.find(a => a.id === d.animalId);

          return (
            <div
              key={d.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-teal-400 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center text-xl font-bold">
                    🦷
                  </div>
                  <div>
                    <h3 className="font-black text-stone-900 text-sm">
                      {d.proceduresPerformed.join(' • ')}
                    </h3>
                    <div className="text-xs text-stone-500 font-medium">
                      Cavalo: <strong className="text-stone-800">{animal?.name || 'Cavalo'}</strong> • Data: {new Date(d.date).toLocaleDateString('pt-BR')} • Vet: {d.veterinarian}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-teal-50 text-teal-900 border border-teal-200 px-3 py-1 rounded-full">
                    Grau de Desgaste: {d.wearGrade}
                  </span>
                  <span className="text-xs font-mono font-bold bg-stone-100 px-2.5 py-1 rounded-lg">
                    R$ {d.costBrl?.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Achados Clínicos & Lesões</span>
                  <p className="text-stone-800 mt-1">{d.findings}</p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Próxima Revisão Recomendada</span>
                  <strong className="text-sm font-black text-teal-900 block font-mono mt-1">
                    {d.nextRevisionDate ? new Date(d.nextRevisionDate).toLocaleDateString('pt-BR') : 'Semestral'}
                  </strong>
                  <span className="text-[10px] text-stone-500 mt-0.5 block">{d.notes}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Dental Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full">
            <div className="bg-teal-950 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xl">🦷</span>
                <h3 className="font-black text-sm">Registrar Revisão Odontológica</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-300 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs text-stone-800">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">Cavalo *</label>
                  <select
                    value={formData.animalId}
                    onChange={e => setFormData({ ...formData, animalId: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                  >
                    {animals.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.registrationNumber})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Data da Revisão</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Grau de Desgaste</label>
                  <select
                    value={formData.wearGrade}
                    onChange={e => setFormData({ ...formData, wearGrade: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                  >
                    <option value="Leve">Leve (Pontas de esmalte iniciais)</option>
                    <option value="Moderado">Moderado (Úlceras na mucosa jugal)</option>
                    <option value="Severo">Severo (Ganchos / Rampas pronunciados)</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">Achados Clínicos</label>
                  <input
                    type="text"
                    value={formData.findings || ''}
                    onChange={e => setFormData({ ...formData, findings: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Veterinário(a) Odontologista</label>
                  <input
                    type="text"
                    value={formData.veterinarian || ''}
                    onChange={e => setFormData({ ...formData, veterinarian: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Custo Total (R$)</label>
                  <input
                    type="number"
                    value={formData.costBrl}
                    onChange={e => setFormData({ ...formData, costBrl: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl shadow-md cursor-pointer"
                >
                  Salvar Revisão Dental
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
