import React, { useState } from 'react';
import {
  BuffaloAnimal,
  BuffaloBreed,
  BuffaloCategory,
  BuffaloCoatColor,
  BuffaloStatus,
  BuffaloPurpose
} from '../../types/buffalo';
import {
  Search,
  Plus,
  QrCode,
  Edit2,
  Trash2,
  Filter,
  Eye,
  Activity,
  Milk,
  Beef,
  Award,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  FileText,
  Camera,
  X
} from 'lucide-react';

interface BuffaloIndividualRegistryViewProps {
  animals: BuffaloAnimal[];
  onAddAnimal: (newAnimal: BuffaloAnimal) => void;
  onUpdateAnimal: (updatedAnimal: BuffaloAnimal) => void;
  onDeleteAnimal: (animalId: string) => void;
  onOpenDigitalTwin: (animalId: string) => void;
}

export const BuffaloIndividualRegistryView: React.FC<BuffaloIndividualRegistryViewProps> = ({
  animals,
  onAddAnimal,
  onUpdateAnimal,
  onDeleteAnimal,
  onOpenDigitalTwin
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBreed, setFilterBreed] = useState<string>('todos');
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<BuffaloAnimal | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    id?: string;
    identificationNumber: string;
    rfidCode: string;
    name: string;
    breed: BuffaloBreed;
    sex: 'Fêmea' | 'Macho';
    category: BuffaloCategory;
    coatColor: BuffaloCoatColor;
    birthDate: string;
    purpose: BuffaloPurpose;
    ownerFarm: string;
    batchName: string;
    status: BuffaloStatus;
    bloodDegree: 'PO (Puro de Origem)' | 'PC (Puro por Cruza)' | 'PA (Puro por Absorção)' | 'Mestiço F1' | 'Comercial';
    registrationCodeABCB: string;
    currentWeightKg: number;
    birthWeightKg: number;
    bodyConditionScore: number;
    sireName: string;
    damName: string;
    averageDailyMilkLiters: number;
    averageFatPct: number;
    notes: string;
  }>({
    identificationNumber: '',
    rfidCode: '',
    name: '',
    breed: 'Murrah',
    sex: 'Fêmea',
    category: 'Matriz em Lactação',
    coatColor: 'Preta',
    birthDate: new Date().toISOString().split('T')[0],
    purpose: 'Leite',
    ownerFarm: 'Fazenda Vale dos Búfalos',
    batchName: 'Lote Alta Lactação (Leite A)',
    status: 'Em Lactação',
    bloodDegree: 'PO (Puro de Origem)',
    registrationCodeABCB: '',
    currentWeightKg: 650,
    birthWeightKg: 38,
    bodyConditionScore: 3.5,
    sireName: '',
    damName: '',
    averageDailyMilkLiters: 14.5,
    averageFatPct: 7.8,
    notes: ''
  });

  // QR Code Preview Modal State
  const [selectedQRAnimal, setSelectedQRAnimal] = useState<BuffaloAnimal | null>(null);

  // Filtragem
  const filteredAnimals = animals.filter(animal => {
    const matchesSearch =
      animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.identificationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (animal.rfidCode && animal.rfidCode.includes(searchTerm)) ||
      (animal.registrationCodeABCB && animal.registrationCodeABCB.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesBreed = filterBreed === 'todos' || animal.breed === filterBreed;
    const matchesCategory = filterCategory === 'todos' || animal.category === filterCategory;
    const matchesStatus = filterStatus === 'todos' || animal.status === filterStatus;

    return matchesSearch && matchesBreed && matchesCategory && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingAnimal(null);
    setFormData({
      identificationNumber: `BUF-${Math.floor(1000 + Math.random() * 9000)}`,
      rfidCode: `9820003${Math.floor(10000000 + Math.random() * 90000000)}`,
      name: '',
      breed: 'Murrah',
      sex: 'Fêmea',
      category: 'Matriz em Lactação',
      coatColor: 'Preta',
      birthDate: new Date().toISOString().split('T')[0],
      purpose: 'Leite',
      ownerFarm: 'Fazenda Vale dos Búfalos',
      batchName: 'Lote Alta Lactação (Leite A)',
      status: 'Em Lactação',
      bloodDegree: 'PO (Puro de Origem)',
      registrationCodeABCB: `ABCB-MR-${Math.floor(10000 + Math.random() * 90000)}`,
      currentWeightKg: 640,
      birthWeightKg: 38,
      bodyConditionScore: 3.5,
      sireName: '',
      damName: '',
      averageDailyMilkLiters: 14.0,
      averageFatPct: 7.8,
      notes: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (animal: BuffaloAnimal) => {
    setEditingAnimal(animal);
    setFormData({
      id: animal.id,
      identificationNumber: animal.identificationNumber,
      rfidCode: animal.rfidCode || '',
      name: animal.name,
      breed: animal.breed,
      sex: animal.sex,
      category: animal.category,
      coatColor: animal.coatColor,
      birthDate: animal.birthDate,
      purpose: animal.purpose,
      ownerFarm: animal.ownerFarm,
      batchName: animal.batchName,
      status: animal.status,
      bloodDegree: animal.bloodDegree,
      registrationCodeABCB: animal.registrationCodeABCB || '',
      currentWeightKg: animal.currentWeightKg,
      birthWeightKg: animal.birthWeightKg,
      bodyConditionScore: animal.bodyConditionScore,
      sireName: animal.sireName || '',
      damName: animal.damName || '',
      averageDailyMilkLiters: animal.averageDailyMilkLiters || 0,
      averageFatPct: animal.averageFatPct || 7.8,
      notes: animal.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.identificationNumber || !formData.name) return;

    if (editingAnimal) {
      const updated: BuffaloAnimal = {
        ...editingAnimal,
        ...formData,
        id: editingAnimal.id
      };
      onUpdateAnimal(updated);
    } else {
      const newAnimal: BuffaloAnimal = {
        id: `buf-${Date.now()}`,
        identificationNumber: formData.identificationNumber,
        rfidCode: formData.rfidCode,
        name: formData.name,
        breed: formData.breed,
        sex: formData.sex,
        category: formData.category,
        coatColor: formData.coatColor,
        birthDate: formData.birthDate,
        purpose: formData.purpose,
        ownerFarm: formData.ownerFarm,
        batchName: formData.batchName,
        status: formData.status,
        bloodDegree: formData.bloodDegree,
        registrationCodeABCB: formData.registrationCodeABCB,
        currentWeightKg: Number(formData.currentWeightKg),
        birthWeightKg: Number(formData.birthWeightKg),
        bodyConditionScore: Number(formData.bodyConditionScore),
        sireName: formData.sireName,
        damName: formData.damName,
        averageDailyMilkLiters: Number(formData.averageDailyMilkLiters),
        averageFatPct: Number(formData.averageFatPct),
        notes: formData.notes,
        parityCount: formData.sex === 'Fêmea' && formData.category.includes('Matriz') ? 1 : 0,
        thermalComfortScore: 92,
        weighings: [
          {
            id: `w-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            weightKg: Number(formData.currentWeightKg),
            bodyConditionScore: Number(formData.bodyConditionScore)
          }
        ],
        healthRecords: [],
        reproductionRecords: [],
        milkRecords: [],
        photos: []
      };
      onAddAnimal(newAnimal);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar com Busca, Filtros e Botão Adicionar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por Brinco, RFID, Nome, Registro ABCB..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Búfalo</span>
          </button>
        </div>

        {/* Filtros por Raça, Categoria e Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Raça:</label>
            <select
              value={filterBreed}
              onChange={(e) => setFilterBreed(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-zinc-200"
            >
              <option value="todos">Todas as Raças</option>
              <option value="Murrah">Murrah (Leiteiro Principal)</option>
              <option value="Mediterrâneo">Mediterrâneo (Mozzarella D.O.P.)</option>
              <option value="Jafarabadi">Jafarabadi (Grande Porte &amp; Leite)</option>
              <option value="Carabao">Carabao (Dupla Aptidão &amp; Tração)</option>
              <option value="Baio">Baio</option>
              <option value="Mestiço Bubalino">Mestiço Bubalino</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Categoria:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-zinc-200"
            >
              <option value="todos">Todas as Categorias</option>
              <option value="Matriz em Lactação">Matriz em Lactação</option>
              <option value="Matriz Seca">Matriz Seca</option>
              <option value="Reprodutor (Touro)">Reprodutor (Touro)</option>
              <option value="Bezerra (0-6m)">Bezerra (0-6m)</option>
              <option value="Bezerro (0-6m)">Bezerro (0-6m)</option>
              <option value="Novilha em Recria (7-24m)">Novilha em Recria (7-24m)</option>
              <option value="Garrote em Engorda">Garrote em Engorda</option>
              <option value="Búfalo em Terminação">Búfalo em Terminação</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Status Sanitário/Produtivo:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-zinc-200"
            >
              <option value="todos">Todos os Status</option>
              <option value="Em Lactação">Em Lactação</option>
              <option value="Seca">Seca</option>
              <option value="Gestante">Gestante</option>
              <option value="Ativo">Ativo</option>
              <option value="Quarentena">Quarentena</option>
              <option value="Tratamento Sanitário">Tratamento Sanitário</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Cards de Búfalos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAnimals.map((animal) => (
          <div
            key={animal.id}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative"
          >
            {/* Header do Card */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {animal.identificationNumber}
                    </span>
                    <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-[10px] rounded-md">
                      {animal.breed}
                    </span>
                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-bold text-[10px] rounded">
                      {animal.sex === 'Fêmea' ? '♀' : '♂'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                    {animal.name}
                  </h4>
                  {animal.registrationCodeABCB && (
                    <span className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold block">
                      Reg: {animal.registrationCodeABCB} ({animal.bloodDegree})
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setSelectedQRAnimal(animal)}
                  title="Gerar Identidade Digital & QR Code"
                  className="p-2 bg-slate-100 dark:bg-zinc-800 hover:bg-teal-50 dark:hover:bg-teal-950 text-slate-700 dark:text-zinc-300 hover:text-teal-600 rounded-xl cursor-pointer transition-all"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>

              {/* Informações Zootécnicas Rápidas */}
              <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Categoria</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200 truncate block">{animal.category}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Peso Atual</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">{animal.currentWeightKg} kg (ECC {animal.bodyConditionScore})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Lote</span>
                  <span className="font-semibold text-slate-700 dark:text-zinc-300 truncate block">{animal.batchName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
                  <span className="font-black text-teal-600 dark:text-teal-400 block">{animal.status}</span>
                </div>
              </div>

              {/* Se for leiteira, mostra produção */}
              {animal.averageDailyMilkLiters && animal.averageDailyMilkLiters > 0 ? (
                <div className="mt-2.5 px-3 py-1.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/50 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-blue-800 dark:text-blue-300 font-semibold flex items-center gap-1.5">
                    <Milk className="w-3.5 h-3.5 text-blue-600" />
                    Produção Diária:
                  </span>
                  <span className="font-black text-blue-900 dark:text-blue-200">
                    {animal.averageDailyMilkLiters} L/dia ({animal.averageFatPct}% Gord.)
                  </span>
                </div>
              ) : null}
            </div>

            {/* Ações do Card */}
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
              <button
                onClick={() => onOpenDigitalTwin(animal.id)}
                className="flex-1 py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Gêmeo Digital</span>
              </button>

              <button
                onClick={() => handleOpenEdit(animal)}
                title="Editar dados"
                className="p-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  if (confirm(`Deseja realmente remover o animal ${animal.identificationNumber}?`)) {
                    onDeleteAnimal(animal.id);
                  }
                }}
                title="Excluir"
                className="p-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 rounded-xl cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Cadastro / Edição */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl my-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {editingAnimal ? 'Editar Búfalo' : 'Novo Cadastro de Búfalo'}
                  </h3>
                  <p className="text-xs text-slate-500">Identidade Digital &amp; Registro Zootécnico Oficial</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-zinc-300 block mb-1">Nº Brinco / Identificação *</label>
                  <input
                    type="text"
                    required
                    value={formData.identificationNumber}
                    onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-zinc-300 block mb-1">RFID / NFC (Transponder)</label>
                  <input
                    type="text"
                    value={formData.rfidCode}
                    onChange={(e) => setFormData({ ...formData, rfidCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-zinc-300 block mb-1">Registro ABCB Oficial</label>
                  <input
                    type="text"
                    value={formData.registrationCodeABCB}
                    onChange={(e) => setFormData({ ...formData, registrationCodeABCB: e.target.value })}
                    placeholder="Ex: ABCB-MR-84920"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-zinc-300 block mb-1">Nome / Apelido do Animal *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Morena do Pontal"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-zinc-300 block mb-1">Raça</label>
                  <select
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value as BuffaloBreed })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Murrah">Murrah</option>
                    <option value="Mediterrâneo">Mediterrâneo</option>
                    <option value="Jafarabadi">Jafarabadi</option>
                    <option value="Carabao">Carabao</option>
                    <option value="Baio">Baio</option>
                    <option value="Mestiço Bubalino">Mestiço Bubalino</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-zinc-300 block mb-1">Sexo</label>
                  <select
                    value={formData.sex}
                    onChange={(e) => setFormData({ ...formData, sex: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Fêmea">Fêmea (♀)</option>
                    <option value="Macho">Macho (♂)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 dark:text-zinc-300 block mb-1">Categoria Zootécnica</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as BuffaloCategory })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Matriz em Lactação">Matriz em Lactação</option>
                    <option value="Matriz Seca">Matriz Seca</option>
                    <option value="Matriz Gestante Seca">Matriz Gestante Seca</option>
                    <option value="Reprodutor (Touro)">Reprodutor (Touro)</option>
                    <option value="Bezerra (0-6m)">Bezerra (0-6m)</option>
                    <option value="Bezerro (0-6m)">Bezerro (0-6m)</option>
                    <option value="Novilha em Recria (7-24m)">Novilha em Recria (7-24m)</option>
                    <option value="Garrote em Engorda">Garrote em Engorda</option>
                    <option value="Búfalo em Terminação">Búfalo em Terminação</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 dark:text-zinc-300 block mb-1">Pelagem</label>
                  <select
                    value={formData.coatColor}
                    onChange={(e) => setFormData({ ...formData, coatColor: e.target.value as BuffaloCoatColor })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Preta">Preta</option>
                    <option value="Parda Escura">Parda Escura</option>
                    <option value="Baia / Castanha">Baia / Castanha</option>
                    <option value="Ruana">Ruana</option>
                    <option value="Preta com Estrela Branca na Testa">Preta c/ Estrela Branca</option>
                    <option value="Cinza Ardosia">Cinza Ardosia</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-zinc-300 block mb-1">Peso Atual (kg)</label>
                  <input
                    type="number"
                    value={formData.currentWeightKg}
                    onChange={(e) => setFormData({ ...formData, currentWeightKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-zinc-300 block mb-1">Escore Corporal ECC (1 a 5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.bodyConditionScore}
                    onChange={(e) => setFormData({ ...formData, bodyConditionScore: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-zinc-300 block mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Genealogia Básica */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div>
                  <label className="text-slate-700 dark:text-zinc-300 block mb-1">Pai (Touro Sire)</label>
                  <input
                    type="text"
                    value={formData.sireName}
                    onChange={(e) => setFormData({ ...formData, sireName: e.target.value })}
                    placeholder="Nome ou Registro do Pai"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-zinc-300 block mb-1">Mãe (Matriz Dam)</label>
                  <input
                    type="text"
                    value={formData.damName}
                    onChange={(e) => setFormData({ ...formData, damName: e.target.value })}
                    placeholder="Nome ou Registro da Mãe"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Visualização do QR Code / Identidade Digital */}
      {selectedQRAnimal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full text-center space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-teal-600 tracking-wider">Identidade Digital GeaAgro</span>
              <button
                onClick={() => setSelectedQRAnimal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 inline-block mx-auto">
              {/* QR Code Simulado com SVG de alta fidelidade */}
              <div className="w-48 h-48 bg-white p-2 rounded-xl flex items-center justify-center shadow-xs">
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                  <rect width="100" height="100" fill="white" />
                  <rect x="10" y="10" width="25" height="25" fill="currentColor" />
                  <rect x="15" y="15" width="15" height="15" fill="white" />
                  <rect x="18" y="18" width="9" height="9" fill="currentColor" />
                  <rect x="65" y="10" width="25" height="25" fill="currentColor" />
                  <rect x="70" y="15" width="15" height="15" fill="white" />
                  <rect x="73" y="18" width="9" height="9" fill="currentColor" />
                  <rect x="10" y="65" width="25" height="25" fill="currentColor" />
                  <rect x="15" y="70" width="15" height="15" fill="white" />
                  <rect x="18" y="73" width="9" height="9" fill="currentColor" />
                  <rect x="45" y="20" width="10" height="10" fill="currentColor" />
                  <rect x="45" y="45" width="15" height="15" fill="currentColor" />
                  <rect x="65" y="65" width="10" height="25" fill="currentColor" />
                  <rect x="78" y="45" width="12" height="12" fill="currentColor" />
                  <rect x="20" y="45" width="15" height="10" fill="currentColor" />
                </svg>
              </div>
            </div>

            <div>
              <h4 className="text-base font-black text-slate-900 dark:text-white">{selectedQRAnimal.identificationNumber}</h4>
              <p className="text-xs font-bold text-slate-600 dark:text-zinc-400">{selectedQRAnimal.name}</p>
              <p className="text-[11px] text-teal-600 font-semibold mt-1">
                RFID: {selectedQRAnimal.rfidCode || 'Não configurado'} • {selectedQRAnimal.breed}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex gap-2">
              <button
                onClick={() => {
                  alert('Etiqueta enviada para impressão bluetooth/térmica.');
                  setSelectedQRAnimal(null);
                }}
                className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Imprimir Brinco / Etiqueta
              </button>
              <button
                onClick={() => setSelectedQRAnimal(null)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
