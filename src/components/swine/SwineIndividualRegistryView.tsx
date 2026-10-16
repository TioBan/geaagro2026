import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  QrCode,
  Sparkles,
  Heart,
  Scale,
  Calendar,
  Eye,
  Trash2,
  Edit2,
  X,
  Check,
  Building,
} from 'lucide-react';
import {
  SwineAnimal,
  SwineSex,
  SwineBreedLineage,
  SwineCategory,
  SwineStatus,
  SwineTab,
} from '../../types/swine';

interface SwineIndividualRegistryViewProps {
  animals: SwineAnimal[];
  onAddAnimal: (animal: SwineAnimal) => void;
  onUpdateAnimal: (animal: SwineAnimal) => void;
  onDeleteAnimal: (id: string) => void;
  onSelectAnimalForTwin: (animal: SwineAnimal) => void;
}

export const SwineIndividualRegistryView: React.FC<SwineIndividualRegistryViewProps> = ({
  animals,
  onAddAnimal,
  onUpdateAnimal,
  onDeleteAnimal,
  onSelectAnimalForTwin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSex, setSelectedSex] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBreed, setSelectedBreed] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Animal Form State
  const [formCode, setFormCode] = useState('');
  const [formRfid, setFormRfid] = useState('');
  const [formName, setFormName] = useState('');
  const [formSex, setFormSex] = useState<SwineSex>('Fêmea');
  const [formBreed, setFormBreed] = useState<SwineBreedLineage>('Landrace');
  const [formCategory, setFormCategory] = useState<SwineCategory>('Matriz Gestante');
  const [formBirthDate, setFormBirthDate] = useState(new Date().toISOString().split('T')[0]);
  const [formInitialWeight, setFormInitialWeight] = useState(180);
  const [formCurrentWeight, setFormCurrentWeight] = useState(210);
  const [formEcc, setFormEcc] = useState(3.0);
  const [formTeatCount, setFormTeatCount] = useState(16);
  const [formSire, setFormSire] = useState('');
  const [formDam, setFormDam] = useState('');
  const [formOrigin, setFormOrigin] = useState('Nascido na Fazenda');
  const [formPenNumber, setFormPenNumber] = useState('Gaiola 01');
  const [formNotes, setFormNotes] = useState('');

  const filteredAnimals = animals.filter(a => {
    const matchesSearch =
      a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.name && a.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.rfidOrQrCode && a.rfidOrQrCode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSex = selectedSex === 'all' || a.sex === selectedSex;
    const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
    const matchesBreed = selectedBreed === 'all' || a.breed === selectedBreed;
    return matchesSearch && matchesSex && matchesCategory && matchesBreed;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim()) return;

    const newAnimal: SwineAnimal = {
      id: `swine_${Date.now()}`,
      code: formCode.trim().toUpperCase(),
      rfidOrQrCode: formRfid.trim() || `RFID-982000${Math.floor(100000 + Math.random() * 900000)}`,
      name: formName.trim() || undefined,
      sex: formSex,
      breed: formBreed,
      category: formCategory,
      status: formCategory.includes('Gestante') ? 'Gestante' : formCategory.includes('Lactante') ? 'Em Lactação' : 'Ativo',
      birthDate: formBirthDate,
      entryDate: new Date().toISOString().split('T')[0],
      origin: formOrigin,
      sireCode: formSire.trim() || undefined,
      damCode: formDam.trim() || undefined,
      initialWeightKg: Number(formInitialWeight),
      currentWeightKg: Number(formCurrentWeight),
      bodyConditionScore: Number(formEcc),
      teatCount: Number(formTeatCount),
      currentPenNumber: formPenNumber,
      weighingHistory: [
        {
          id: `w_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          weightKg: Number(formCurrentWeight),
          bodyConditionScore: Number(formEcc),
        },
      ],
      healthHistory: [],
      reproductionHistory: [],
      movements: [
        {
          id: `m_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          fromLocation: 'Entrada / Quarentena',
          toLocation: formPenNumber,
          reason: 'Troca de Baia',
          operator: 'Responsável Técnico',
        },
      ],
      notes: formNotes.trim() || undefined,
    };

    onAddAnimal(newAnimal);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormCode('');
    setFormRfid('');
    setFormName('');
    setFormSex('Fêmea');
    setFormBreed('Landrace');
    setFormCategory('Matriz Gestante');
    setFormInitialWeight(180);
    setFormCurrentWeight(210);
    setFormEcc(3.0);
    setFormTeatCount(16);
    setFormSire('');
    setFormDam('');
    setFormOrigin('Nascido na Fazenda');
    setFormPenNumber('Gaiola 01');
    setFormNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-600" />
            <span>Cadastro & Plantel Individual de Suínos</span>
          </h2>
          <p className="text-xs text-gray-500">
            Ficha digital zootécnica de reprodutoras, cachaços, marrãs e lotes com RFID e histórico completo.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Suíno</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por brinco, nome ou RFID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all"
            />
          </div>

          {/* Sex Filter */}
          <select
            value={selectedSex}
            onChange={e => setSelectedSex(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">Todos os Sexos</option>
            <option value="Fêmea">Fêmeas (Matrizes/Marrãs)</option>
            <option value="Cachaço (Reprodutor)">Cachaços (Reprodutores)</option>
            <option value="Macho Castrado">Machos Castrados</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">Todas as Categorias</option>
            <option value="Matriz Lactante">Matriz Lactante</option>
            <option value="Matriz Gestante">Matriz Gestante</option>
            <option value="Marrã / Leitoa de Reposição">Marrã / Leitoa</option>
            <option value="Cachaço / Rufião">Cachaço / Rufião</option>
          </select>

          {/* Breed Filter */}
          <select
            value={selectedBreed}
            onChange={e => setSelectedBreed(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">Todas as Raças / Linhagens</option>
            <option value="Landrace">Landrace</option>
            <option value="Large White">Large White</option>
            <option value="Duroc">Duroc</option>
            <option value="Pietrain">Pietrain</option>
            <option value="Camborough (Agroceres PIC)">Camborough (PIC)</option>
            <option value="Topigs Norsvin (TN70)">Topigs Norsvin</option>
            <option value="DanBred">DanBred</option>
          </select>
        </div>
      </div>

      {/* Animals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAnimals.map(animal => (
          <div
            key={animal.id}
            className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:border-pink-300 transition-all p-5 space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 text-pink-700 flex items-center justify-center font-black text-sm border border-pink-200">
                  {animal.code.substring(0, 3)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-gray-900">{animal.code}</h3>
                    {animal.name && (
                      <span className="text-xs text-gray-500 font-medium truncate max-w-[100px]">
                        ({animal.name})
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-500 block">
                    {animal.breed} • {animal.sex}
                  </span>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  animal.status === 'Em Lactação'
                    ? 'bg-amber-100 text-amber-800'
                    : animal.status === 'Gestante'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {animal.status}
              </span>
            </div>

            {/* Metrics pills */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 block">Peso Atual</span>
                <span className="font-bold text-gray-900">{animal.currentWeightKg} kg</span>
              </div>
              <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 block">Escore (ECC)</span>
                <span className="font-bold text-pink-700">{animal.bodyConditionScore} / 5</span>
              </div>
              <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 block">Tetos Viáveis</span>
                <span className="font-bold text-gray-900">{animal.teatCount || 14}</span>
              </div>
            </div>

            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Localização:</span>
                <span className="font-medium text-gray-900">{animal.currentPenNumber || 'Galpão 01'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">RFID:</span>
                <span className="font-mono text-[11px] text-gray-700">{animal.rfidOrQrCode || 'Sem tag'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => onSelectAnimalForTwin(animal)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold rounded-xl transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gêmeo Digital</span>
              </button>

              <button
                onClick={() => onDeleteAnimal(animal.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {(filteredAnimals || []).length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-3">
          <Users className="w-10 h-10 text-gray-400 mx-auto" />
          <h4 className="text-sm font-bold text-gray-800">Nenhum suíno encontrado</h4>
          <p className="text-xs text-gray-500">
            Ajuste os filtros de busca ou cadastre um novo animal no plantel.
          </p>
        </div>
      )}

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center font-bold">
                  +
                </div>
                <h3 className="text-base font-black text-gray-900">Novo Cadastro de Suíno</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Número do Brinco / Código *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: MTZ-1090"
                    value={formCode}
                    onChange={e => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    RFID / QR Code
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: RFID-982000412895"
                    value={formRfid}
                    onChange={e => setFormRfid(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Nome / Apelido (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Estrela Camborough"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Sexo *</label>
                  <select
                    value={formSex}
                    onChange={e => setFormSex(e.target.value as SwineSex)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="Fêmea">Fêmea</option>
                    <option value="Cachaço (Reprodutor)">Cachaço (Reprodutor)</option>
                    <option value="Macho Castrado">Macho Castrado</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Raça / Linhagem *</label>
                  <select
                    value={formBreed}
                    onChange={e => setFormBreed(e.target.value as SwineBreedLineage)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="Landrace">Landrace</option>
                    <option value="Large White">Large White</option>
                    <option value="Duroc">Duroc</option>
                    <option value="Pietrain">Pietrain</option>
                    <option value="Camborough (Agroceres PIC)">Camborough (Agroceres PIC)</option>
                    <option value="Topigs Norsvin (TN70)">Topigs Norsvin (TN70)</option>
                    <option value="DanBred">DanBred</option>
                    <option value="Choice Genetics">Choice Genetics</option>
                    <option value="Moura (Crioulo)">Moura (Crioulo)</option>
                    <option value="Mestiço Comercial">Mestiço Comercial</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Categoria *</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as SwineCategory)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="Matriz Gestante">Matriz Gestante</option>
                    <option value="Matriz Lactante">Matriz Lactante</option>
                    <option value="Matriz Vazia / Pré-Cobertura">Matriz Vazia / Pré-Cobertura</option>
                    <option value="Marrã / Leitoa de Reposição">Marrã / Leitoa de Reposição</option>
                    <option value="Cachaço / Rufião">Cachaço / Rufião</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={formBirthDate}
                    onChange={e => setFormBirthDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Peso Atual (kg)</label>
                  <input
                    type="number"
                    value={formCurrentWeight}
                    onChange={e => setFormCurrentWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Escore Corporal (ECC 1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formEcc}
                    onChange={e => setFormEcc(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Tetos Viáveis</label>
                  <input
                    type="number"
                    value={formTeatCount}
                    onChange={e => setFormTeatCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Baia / Localização</label>
                  <input
                    type="text"
                    placeholder="Ex: Gestação Baia 04"
                    value={formPenNumber}
                    onChange={e => setFormPenNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Origem</label>
                  <input
                    type="text"
                    placeholder="Ex: Nascido na Fazenda ou Granja Multiplicadora"
                    value={formOrigin}
                    onChange={e => setFormOrigin(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Observações Técnicas</label>
                <textarea
                  rows={2}
                  placeholder="Informações genéticas, docilidade ou histórico prévio..."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  Salvar Suíno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
