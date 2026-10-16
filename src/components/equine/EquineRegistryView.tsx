import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Award,
  Sparkles,
  Edit2,
  Trash2,
  QrCode,
  CheckCircle2,
  Scale,
  Calendar,
  X,
  Upload,
  User,
  ShieldCheck,
  Dna,
} from 'lucide-react';
import {
  EquineAnimal,
  EquineBreed,
  EquineCoatColor,
  EquineSex,
  EquineCategory,
  EquineStatus,
  EquineDiscipline,
} from '../../types/equine';

interface Props {
  animals: EquineAnimal[];
  onAddAnimal: (animal: EquineAnimal) => void;
  onUpdateAnimal: (animal: EquineAnimal) => void;
  onDeleteAnimal: (animalId: string) => void;
  onOpenPassport: (animal: EquineAnimal) => void;
  onNavigateTab: (tabId: string, animalId?: string) => void;
}

const BREEDS: EquineBreed[] = [
  'Mangalarga Marchador',
  'Quarto de Milha',
  'Crioulo',
  'Puro Sangue Inglês (PSI)',
  'Puro Sangue Árabe',
  'Brasileiro de Hipismo (BH)',
  'Campolina',
  'Paint Horse',
  'Appaloosa',
  'Lusitano',
  'Andaluz',
  'Pampa',
  'Mangalarga Paulista',
  'Bredão / Cruzado',
  'Outra',
];

const COAT_COLORS: EquineCoatColor[] = [
  'Alazã',
  'Castanha',
  'Tordilha',
  'Baia',
  'Preta',
  'Rosilha',
  'Pampa',
  'Palomino',
  'Lobuna',
  'Gateada',
  'Zaina',
  'Alazã Tostada',
  'Ruã',
  'Outra',
];

const CATEGORIES: EquineCategory[] = [
  'Garanhão',
  'Matriz',
  'Doadora de Embrião',
  'Receptora de Embrião',
  'Potro ao Pé',
  'Potro Desmamado',
  'Potro em Recria',
  'Treinamento / Esporte',
  'Trabalho / Lida',
  'Aposentado / Lazer',
];

const DISCIPLINES: EquineDiscipline[] = [
  'Mangalarga Marchador / Concurso de Marcha',
  'Três Tambores',
  'Seis Balizas',
  'Hipismo Clássico / Salto',
  'Corrida / Turfe',
  'Enduro Equestre',
  'Prova de Laço / Roping',
  'Vaquejada',
  'Polo Equestre',
  'Adestramento / Dressage',
  'Concurso Completo de Equitação (CCE)',
  'Rédeas / Western',
  'Lida de Campo / Pecuária',
  'Cavalgada / Lazer',
];

export const EquineRegistryView: React.FC<Props> = ({
  animals,
  onAddAnimal,
  onUpdateAnimal,
  onDeleteAnimal,
  onOpenPassport,
  onNavigateTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBreed, setSelectedBreed] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSex, setSelectedSex] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<EquineAnimal | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<EquineAnimal>>({
    name: '',
    nickname: '',
    registrationNumber: '',
    microchip: '',
    rfid: '',
    species: 'Equino',
    breed: 'Mangalarga Marchador',
    coatColor: 'Castanha',
    sex: 'Garanhão',
    birthDate: new Date().toISOString().split('T')[0],
    category: 'Garanhão',
    status: 'Ativo no Haras',
    weightKg: 450,
    heightM: 1.52,
    chestCircumferenceCm: 180,
    shinCircumferenceCm: 19.5,
    bodyLengthCm: 152,
    bodyScore: 6,
    breeder: 'Haras GeaAgro',
    owner: 'Lucas Mendes',
    photoUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    association: 'ABCCMM',
    discipline: 'Mangalarga Marchador / Concurso de Marcha',
    marketValueBrl: 50000,
    notes: '',
  });

  const handleOpenAdd = () => {
    const nextId = `eq-${String(animals.length + 1).padStart(3, '0')}`;
    const nextReg = `REG-${Math.floor(100000 + Math.random() * 900000)}`;
    const nextChip = `982000${Math.floor(100000000 + Math.random() * 900000000)}`;
    setEditingAnimal(null);
    setFormData({
      id: nextId,
      name: '',
      nickname: '',
      registrationNumber: nextReg,
      microchip: nextChip,
      rfid: `RFID-${nextId.toUpperCase()}-BR`,
      qrCode: `GEA-EQUINE-${nextId.toUpperCase()}`,
      species: 'Equino',
      breed: 'Mangalarga Marchador',
      coatColor: 'Castanha',
      sex: 'Garanhão',
      birthDate: '2022-01-15',
      category: 'Garanhão',
      status: 'Ativo no Haras',
      weightKg: 450,
      heightM: 1.52,
      chestCircumferenceCm: 180,
      shinCircumferenceCm: 19.5,
      bodyLengthCm: 152,
      bodyScore: 6,
      breeder: 'Haras Fazenda GeaAgro',
      owner: 'Lucas Mendes',
      photoUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
      passportNumber: `BR-PASS-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      association: 'ABCCMM - Ass. Bras. Criadores do Cavalo Mangalarga Marchador',
      discipline: 'Mangalarga Marchador / Concurso de Marcha',
      marketValueBrl: 50000,
      inbreedingCoefficient: 1.2,
      pedigree: {
        sire: { name: 'Pai do Cavalo', breed: 'Mangalarga Marchador' },
        dam: { name: 'Mãe do Cavalo', breed: 'Mangalarga Marchador' },
      },
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (animal: EquineAnimal) => {
    setEditingAnimal(animal);
    setFormData(animal);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    if (editingAnimal) {
      const updated: EquineAnimal = {
        ...editingAnimal,
        ...(formData as EquineAnimal),
        updatedAt: new Date().toISOString(),
      };
      onUpdateAnimal(updated);
    } else {
      const newAnimal: EquineAnimal = {
        ...(formData as EquineAnimal),
        id: formData.id || `eq-${Date.now()}`,
        passportNumber: formData.passportNumber || `BR-PASS-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        qrCode: formData.qrCode || `GEA-EQ-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onAddAnimal(newAnimal);
    }
    setIsModalOpen(false);
  };

  // Filtered animals
  const filteredAnimals = animals.filter(animal => {
    const matchQuery =
      animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.microchip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.association.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (animal.nickname && animal.nickname.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchBreed = selectedBreed === 'all' || animal.breed === selectedBreed;
    const matchCategory = selectedCategory === 'all' || animal.category === selectedCategory;
    const matchSex = selectedSex === 'all' || animal.sex === selectedSex;

    return matchQuery && matchBreed && matchCategory && matchSex;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <span>Plantel de Cavalos & Passaportes</span>
            <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full">
              {(filteredAnimals || []).length} de {animals.length}
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Cadastro completo com identificação eletrônica, microchip, RFID, genealogia e resenha física
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Cavalo</span>
        </button>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, registro, chip..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-hidden focus:border-amber-600 focus:bg-white"
            />
          </div>

          {/* Breed Filter */}
          <select
            value={selectedBreed}
            onChange={e => setSelectedBreed(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:border-amber-600 focus:bg-white"
          >
            <option value="all">Todas as Raças</option>
            {BREEDS.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:border-amber-600 focus:bg-white"
          >
            <option value="all">Todas as Categorias</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Sex Filter */}
          <select
            value={selectedSex}
            onChange={e => setSelectedSex(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:border-amber-600 focus:bg-white"
          >
            <option value="all">Todos os Sexos</option>
            <option value="Garanhão">Garanhão (Macho Inteiro)</option>
            <option value="Égua">Égua (Fêmea)</option>
            <option value="Castrado">Castrado</option>
          </select>
        </div>
      </div>

      {/* Horses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAnimals.map(animal => (
          <div
            key={animal.id}
            className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
          >
            {/* Top Photo with Badges */}
            <div className="relative aspect-16/10 bg-stone-200 overflow-hidden">
              <img
                src={animal.photoUrl}
                alt={animal.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 left-2 bg-stone-900/80 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30">
                {animal.breed}
              </div>
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs text-stone-900 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                {animal.category}
              </div>
              <div className="absolute bottom-2 left-2 bg-amber-950/80 backdrop-blur-xs text-amber-200 text-[9px] font-mono px-2 py-0.5 rounded-md">
                Chip: {animal.microchip.slice(-6)}
              </div>
            </div>

            {/* Content Details */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-black text-stone-900 text-base group-hover:text-amber-800 transition-colors">
                      {animal.name}
                    </h3>
                    <div className="text-[11px] text-stone-500 font-mono">
                      Reg: {animal.registrationNumber} • {animal.association.split('-')[0]}
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    animal.sex === 'Garanhão' ? 'bg-blue-100 text-blue-800' :
                    animal.sex === 'Égua' ? 'bg-rose-100 text-rose-800' : 'bg-stone-100 text-stone-800'
                  }`}>
                    {animal.sex}
                  </span>
                </div>

                <div className="text-xs text-stone-600 mt-2 line-clamp-1">
                  <strong>Pelagem:</strong> {animal.coatColor} • <strong>Modalidade:</strong> {animal.discipline.split('/')[0]}
                </div>
              </div>

              {/* Physical Snapshot */}
              <div className="grid grid-cols-4 gap-1 py-2 border-y border-stone-100 text-[11px] text-center">
                <div className="bg-stone-50 p-1 rounded-lg">
                  <span className="text-[9px] text-stone-400 uppercase font-bold block">Peso</span>
                  <strong className="text-stone-800 font-mono">{animal.weightKg} kg</strong>
                </div>
                <div className="bg-stone-50 p-1 rounded-lg">
                  <span className="text-[9px] text-stone-400 uppercase font-bold block">Cernelha</span>
                  <strong className="text-stone-800 font-mono">{animal.heightM} m</strong>
                </div>
                <div className="bg-stone-50 p-1 rounded-lg">
                  <span className="text-[9px] text-stone-400 uppercase font-bold block">Tórax</span>
                  <strong className="text-stone-800 font-mono">{animal.chestCircumferenceCm} cm</strong>
                </div>
                <div className="bg-stone-50 p-1 rounded-lg">
                  <span className="text-[9px] text-stone-400 uppercase font-bold block">Escore</span>
                  <strong className="text-emerald-800 font-mono">{animal.bodyScore}/9</strong>
                </div>
              </div>

              {/* Actions Button Row */}
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  onClick={() => onOpenPassport(animal)}
                  title="Abrir Passaporte Digital"
                  className="flex-1 py-2 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-amber-700" />
                  <span>Passaporte</span>
                </button>

                <button
                  onClick={() => onNavigateTab('digital_twin', animal.id)}
                  title="Gêmeo Digital 360°"
                  className="flex-1 py-2 px-2 bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gêmeo 360°</span>
                </button>

                <button
                  onClick={() => handleOpenEdit(animal)}
                  title="Editar cadastro"
                  className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Tem certeza que deseja excluir o cadastro de "${animal.name}"?`)) {
                      onDeleteAnimal(animal.id);
                    }
                  }}
                  title="Excluir"
                  className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit Animal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🐎</span>
                <h3 className="font-black text-base">
                  {editingAnimal ? `Editar Ficha: ${editingAnimal.name}` : 'Cadastrar Novo Animal / Passaporte Digital'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 text-stone-800">
              {/* Section 1: Identification */}
              <div className="space-y-3">
                <div className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5 border-b pb-1">
                  <ShieldCheck className="w-4 h-4 text-amber-700" /> Identificação & Registro Oficial
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-stone-700 block mb-1">Nome Completo do Animal *</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: El Toro Negro da Serra"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-hidden focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Apelido / Nome de Pista</label>
                    <input
                      type="text"
                      value={formData.nickname || ''}
                      onChange={e => setFormData({ ...formData, nickname: e.target.value })}
                      placeholder="Ex: El Toro"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-hidden focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Nº Registro Associação</label>
                    <input
                      type="text"
                      value={formData.registrationNumber || ''}
                      onChange={e => setFormData({ ...formData, registrationNumber: e.target.value })}
                      placeholder="Ex: ABCCMM-194820/D"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-hidden focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Microchip ISO 11784</label>
                    <input
                      type="text"
                      value={formData.microchip || ''}
                      onChange={e => setFormData({ ...formData, microchip: e.target.value })}
                      placeholder="Ex: 982000364910284"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-hidden focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Tag RFID / Brinco</label>
                    <input
                      type="text"
                      value={formData.rfid || ''}
                      onChange={e => setFormData({ ...formData, rfid: e.target.value })}
                      placeholder="Ex: RFID-EQ-001"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-hidden focus:border-amber-600"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Breed, Sex, Colors */}
              <div className="space-y-3">
                <div className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5 border-b pb-1">
                  <Dna className="w-4 h-4 text-amber-700" /> Raça, Categoria & Modalidade
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Raça</label>
                    <select
                      value={formData.breed}
                      onChange={e => setFormData({ ...formData, breed: e.target.value as EquineBreed })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-hidden focus:border-amber-600"
                    >
                      {BREEDS.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Pelagem</label>
                    <select
                      value={formData.coatColor}
                      onChange={e => setFormData({ ...formData, coatColor: e.target.value as EquineCoatColor })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-hidden focus:border-amber-600"
                    >
                      {COAT_COLORS.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Sexo</label>
                    <select
                      value={formData.sex}
                      onChange={e => setFormData({ ...formData, sex: e.target.value as EquineSex })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-hidden focus:border-amber-600"
                    >
                      <option value="Garanhão">Garanhão</option>
                      <option value="Égua">Égua</option>
                      <option value="Castrado">Castrado</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Categoria no Haras</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value as EquineCategory })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-hidden focus:border-amber-600"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Data de Nascimento</label>
                    <input
                      type="date"
                      value={formData.birthDate || ''}
                      onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-hidden focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Modalidade Esportiva</label>
                    <select
                      value={formData.discipline}
                      onChange={e => setFormData({ ...formData, discipline: e.target.value as EquineDiscipline })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-hidden focus:border-amber-600"
                    >
                      {DISCIPLINES.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Biometrics & Morphology */}
              <div className="space-y-3">
                <div className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5 border-b pb-1">
                  <Scale className="w-4 h-4 text-amber-700" /> Biometria & Resenha Corporal
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Peso (kg)</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.weightKg || 450}
                      onChange={e => setFormData({ ...formData, weightKg: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-hidden focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Altura Cernelha (m)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.heightM || 1.52}
                      onChange={e => setFormData({ ...formData, heightM: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-hidden focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">P. Torácico (cm)</label>
                    <input
                      type="number"
                      value={formData.chestCircumferenceCm || 180}
                      onChange={e => setFormData({ ...formData, chestCircumferenceCm: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-hidden focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Escore Henneke (1-9)</label>
                    <input
                      type="number"
                      min="1"
                      max="9"
                      step="0.5"
                      value={formData.bodyScore || 6}
                      onChange={e => setFormData({ ...formData, bodyScore: parseFloat(e.target.value) || 6 })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-hidden focus:border-amber-600"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Breeder, Owner, Photo URL */}
              <div className="space-y-3">
                <div className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5 border-b pb-1">
                  <User className="w-4 h-4 text-amber-700" /> Titularidade & Imagem
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Criador Original</label>
                    <input
                      type="text"
                      value={formData.breeder || ''}
                      onChange={e => setFormData({ ...formData, breeder: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-hidden focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Proprietário Atual</label>
                    <input
                      type="text"
                      value={formData.owner || ''}
                      onChange={e => setFormData({ ...formData, owner: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-hidden focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">URL da Fotografia</label>
                    <input
                      type="text"
                      value={formData.photoUrl || ''}
                      onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-hidden focus:border-amber-600"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  {editingAnimal ? 'Salvar Alterações' : 'Cadastrar Cavalo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
