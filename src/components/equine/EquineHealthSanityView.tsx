import React, { useState } from 'react';
import {
  ShieldCheck,
  Syringe,
  Stethoscope,
  Plus,
  Calendar,
  AlertCircle,
  FileText,
  User,
  Clock,
  X,
  CheckCircle2,
  DollarSign,
  Search,
} from 'lucide-react';
import {
  EquineAnimal,
  EquineHealthRecord,
  EquineHealthType,
  EquineExamRecord,
} from '../../types/equine';

interface Props {
  animals: EquineAnimal[];
  healthRecords: EquineHealthRecord[];
  examRecords: EquineExamRecord[];
  onAddHealth: (record: EquineHealthRecord) => void;
  onAddExam: (record: EquineExamRecord) => void;
  onNavigateTab: (tabId: string, animalId?: string) => void;
}

export const EquineHealthSanityView: React.FC<Props> = ({
  animals,
  healthRecords,
  examRecords,
  onAddHealth,
  onAddExam,
  onNavigateTab,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedAnimalFilter, setSelectedAnimalFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<EquineHealthRecord>>({
    animalId: animals[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    type: 'Vacinação',
    title: 'Vacinação Anual Polivalente',
    productOrDrug: 'Equi-Protec 6',
    activeIngredient: '',
    dose: '3 mL',
    route: 'Intramuscular (IM)',
    veterinarian: 'Dr. Fernando Campos - CRMV 14920',
    costBrl: 85,
    status: 'Concluído',
    notes: '',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.animalId || !formData.title) return;

    const newRecord: EquineHealthRecord = {
      ...(formData as EquineHealthRecord),
      id: `hlt-${Date.now()}`,
    };

    onAddHealth(newRecord);
    setIsModalOpen(false);
  };

  const filteredRecords = healthRecords.filter(h => {
    const matchType = selectedFilter === 'all' || h.type === selectedFilter;
    const matchAnimal = selectedAnimalFilter === 'all' || h.animalId === selectedAnimalFilter;
    return matchType && matchAnimal;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="text-[10px] font-black uppercase text-blue-900 tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" /> Sanidade Animal, Vacinas & Prontuário Veterinário
          </div>
          <h2 className="text-xl font-black text-stone-900">
            Gestão Clínica & Protocolos Sanitários
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Controle rigoroso de imunizações, rotação de vermífugos, laudos MAPA (AIE/Mormo) e tratamentos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('diseases_bank')}
            className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            📚 Guia de Enfermidades
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Registro Clínico</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-500 font-bold uppercase block">Vacinas Aplicadas</span>
          <span className="text-2xl font-black text-blue-900">
            {healthRecords.filter(h => h.type === 'Vacinação').length}
          </span>
          <span className="text-[11px] text-emerald-700 block mt-0.5 font-semibold">100% Plantel imunizado</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-500 font-bold uppercase block">Vermifugações OPG</span>
          <span className="text-2xl font-black text-stone-900">
            {healthRecords.filter(h => h.type === 'Vermifugação').length}
          </span>
          <span className="text-[11px] text-stone-500 block mt-0.5">Rotação semestral</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-500 font-bold uppercase block">Laudos MAPA (AIE/Mormo)</span>
          <span className="text-2xl font-black text-emerald-800 font-mono">{examRecords.length}</span>
          <span className="text-[11px] text-emerald-700 block mt-0.5 font-semibold">Laudos Negativos Vigentes</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-500 font-bold uppercase block">Tratamentos em Curso</span>
          <span className="text-2xl font-black text-purple-900">
            {healthRecords.filter(h => h.status === 'Em Tratamento').length}
          </span>
          <span className="text-[11px] text-purple-700 block mt-0.5">Sem gravidade</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedFilter}
            onChange={e => setSelectedFilter(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
          >
            <option value="all">Todos os Procedimentos</option>
            <option value="Vacinação">Vacinação</option>
            <option value="Vermifugação">Vermifugação</option>
            <option value="Exame Laboratorial">Exame Laboratorial</option>
            <option value="Tratamento Clínico">Tratamento Clínico</option>
            <option value="Tratamento de Lesão">Tratamento de Lesão</option>
          </select>

          <select
            value={selectedAnimalFilter}
            onChange={e => setSelectedAnimalFilter(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
          >
            <option value="all">Todos os Cavalos</option>
            {animals.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div className="text-stone-500 font-bold">
          {filteredRecords.length} registros encontrados
        </div>
      </div>

      {/* Health Records List */}
      <div className="space-y-3">
        {filteredRecords.map(record => {
          const animal = animals.find(a => a.id === record.animalId);

          return (
            <div
              key={record.id}
              className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs hover:border-blue-300 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center text-xl font-bold">
                    {record.type === 'Vacinação' ? '💉' : record.type === 'Vermifugação' ? '💊' : '🩺'}
                  </div>
                  <div>
                    <h3 className="font-black text-stone-900 text-sm">{record.title}</h3>
                    <div className="text-xs text-stone-500 font-medium">
                      Cavalo: <strong className="text-stone-800">{animal?.name || 'Animal'}</strong> ({animal?.registrationNumber}) • Data: {new Date(record.date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                    record.status === 'Concluído' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {record.status}
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-700 bg-stone-100 px-2 py-1 rounded-lg">
                    R$ {record.costBrl?.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-stone-50 rounded-xl">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Produto / Fármaco</span>
                  <strong className="text-stone-900 block truncate">{record.productOrDrug}</strong>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Dose & Via</span>
                  <strong className="text-stone-900 block">{record.dose} ({record.route})</strong>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Veterinário</span>
                  <strong className="text-stone-900 block truncate">{record.veterinarian}</strong>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Próxima Dose / Rev.</span>
                  <strong className="text-blue-900 block font-mono">
                    {record.nextDueDate ? new Date(record.nextDueDate).toLocaleDateString('pt-BR') : 'Conforme Protocolo'}
                  </strong>
                </div>
              </div>

              {record.notes && (
                <div className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                  <strong>Observações Clínicas:</strong> {record.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Health Record Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-950 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <h3 className="font-black text-sm">Registrar Evento Sanitário / Clínico</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-300 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs text-stone-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
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
                  <label className="font-bold text-stone-700 block mb-1">Tipo de Procedimento</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as EquineHealthType })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                  >
                    <option value="Vacinação">Vacinação</option>
                    <option value="Vermifugação">Vermifugação</option>
                    <option value="Exame Laboratorial">Exame Laboratorial</option>
                    <option value="Exame de Imagem">Exame de Imagem (Raio-X / Ultrassom)</option>
                    <option value="Tratamento Clínico">Tratamento Clínico</option>
                    <option value="Tratamento de Lesão">Tratamento de Lesão</option>
                    <option value="Procedimento Cirúrgico">Procedimento Cirúrgico</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">Título do Procedimento *</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Vacina Polivalente Equina (Tétano, Influenza, EHV)"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Fármaco / Vacina Utilizada</label>
                  <input
                    type="text"
                    value={formData.productOrDrug || ''}
                    onChange={e => setFormData({ ...formData, productOrDrug: e.target.value })}
                    placeholder="Ex: Equi-Protec 6"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Dose & Via de Aplicação</label>
                  <input
                    type="text"
                    value={formData.dose || ''}
                    onChange={e => setFormData({ ...formData, dose: e.target.value })}
                    placeholder="Ex: 3 mL (IM)"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Data da Aplicação</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Próximo Vencimento / Reforço</label>
                  <input
                    type="date"
                    value={formData.nextDueDate || ''}
                    onChange={e => setFormData({ ...formData, nextDueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Médico Veterinário Responsável</label>
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
                    step="0.01"
                    value={formData.costBrl || 0}
                    onChange={e => setFormData({ ...formData, costBrl: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Observações Clínicas</label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Reação pós-vacinal, tempo de carência para dopagem esportiva..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                />
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
                  className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white font-black rounded-xl shadow-md cursor-pointer"
                >
                  Salvar Procedimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
