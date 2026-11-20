import React, { useState, useRef } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  FileCheck,
  Sparkles,
  Camera,
  X,
} from 'lucide-react';
import {
  EquineAnimal,
  EquineBreed,
  EquineCoatColor,
  EquineSex,
  EquineCategory,
  EquineDiscipline,
  EquineStatus,
  EquineSpecies,
} from '../../types/equine';
import { EquinoIcon } from '../icons/EquinoIcon';

interface Props {
  animals: EquineAnimal[];
  onAddAnimal: (animal: EquineAnimal) => void;
  onUpdateAnimal: (animal: EquineAnimal) => void;
  onDeleteAnimal: (id: string) => void;
  onNavigateTab: (tabId: string, animalId?: string) => void;
  onOpenPassport: (animal: EquineAnimal) => void;
}

const BREED_OPTIONS: EquineBreed[] = [
  'Mangalarga Marchador',
  'Quarto de Milha',
  'Crioulo',
  'Campolina',
  'Puro Sangue Inglês (PSI)',
  'Puro Sangue Árabe',
  'Brasileiro de Hipismo (BH)',
  'Paint Horse',
  'Appaloosa',
  'Lusitano',
  'Andaluz',
  'Pampa',
  'Mangalarga Paulista',
  'Bredão / Cruzado',
  'Outra',
];

const COAT_OPTIONS: EquineCoatColor[] = [
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

const CATEGORY_OPTIONS: EquineCategory[] = [
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

const DISCIPLINE_OPTIONS: EquineDiscipline[] = [
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

const STATUS_OPTIONS: EquineStatus[] = [
  'Ativo no Haras',
  'Em Treinamento Externo',
  'Em Competição',
  'Em Tratamento / Hospital',
  'Em Trânsito',
  'Vendido',
  'Baixa / Óbito',
];

const EMPTY_FORM: Partial<EquineAnimal> = {
  name: '',
  registrationNumber: '',
  microchip: '',
  passportNumber: '',
  species: 'Equino',
  breed: 'Mangalarga Marchador',
  coatColor: 'Castanha',
  sex: 'Garanhão',
  category: 'Treinamento / Esporte',
  discipline: 'Mangalarga Marchador / Concurso de Marcha',
  birthDate: '2021-08-15',
  weightKg: 450,
  heightM: 1.52,
  chestCircumferenceCm: 178,
  bodyScore: 6,
  status: 'Ativo no Haras',
  isPregnant: false,
  owner: '',
  breeder: '',
  association: 'ABCCMM',
  marketValueBrl: 50000,
  photoUrl: '',
  notes: '',
};

const inputCls =
  'w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500';
const labelCls = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const EquineRegistryView: React.FC<Props> = ({
  animals,
  onAddAnimal,
  onUpdateAnimal,
  onDeleteAnimal,
  onNavigateTab,
  onOpenPassport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBreed, setFilterBreed] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<EquineAnimal | null>(null);
  const [formData, setFormData] = useState<Partial<EquineAnimal>>(EMPTY_FORM);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const safeAnimals = (animals || []).filter(a => a && a.id);

  const handleOpenAdd = () => {
    setEditingAnimal(null);
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (animal: EquineAnimal) => {
    setEditingAnimal(animal);
    setFormData({ ...animal });
    setIsModalOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const now = new Date().toISOString();
    if (editingAnimal) {
      onUpdateAnimal({
        ...editingAnimal,
        ...formData,
        updatedAt: now,
      } as EquineAnimal);
    } else {
      const id = `eq-${Date.now()}`;
      const newAnimal: EquineAnimal = {
        id,
        name: formData.name.trim(),
        registrationNumber:
          formData.registrationNumber?.trim() || `REG-${Date.now().toString().slice(-5)}`,
        microchip: formData.microchip?.trim() || `982000${Date.now().toString().slice(-9)}`,
        qrCode: `EQUINE:${id}`,
        species: (formData.species as EquineSpecies) || 'Equino',
        breed: (formData.breed as EquineBreed) || 'Mangalarga Marchador',
        coatColor: (formData.coatColor as EquineCoatColor) || 'Castanha',
        sex: (formData.sex as EquineSex) || 'Garanhão',
        birthDate: formData.birthDate || '2021-08-15',
        category: (formData.category as EquineCategory) || 'Treinamento / Esporte',
        status: (formData.status as EquineStatus) || 'Ativo no Haras',
        weightKg: Number(formData.weightKg) || 450,
        heightM: Number(formData.heightM) || 1.52,
        chestCircumferenceCm: Number(formData.chestCircumferenceCm) || 178,
        bodyScore: Number(formData.bodyScore) || 5,
        breeder: formData.breeder?.trim() || 'Haras Próprio',
        owner: formData.owner?.trim() || 'Proprietário',
        photoUrl: formData.photoUrl || '',
        passportNumber: formData.passportNumber?.trim() || `BR-${Date.now().toString().slice(-6)}`,
        association: formData.association?.trim() || 'ABCCMM',
        pedigree: {},
        discipline: (formData.discipline as EquineDiscipline) || 'Mangalarga Marchador / Concurso de Marcha',
        isPregnant: Boolean(formData.isPregnant),
        marketValueBrl: Number(formData.marketValueBrl) || 0,
        notes: formData.notes?.trim() || '',
        createdAt: now,
        updatedAt: now,
      };
      onAddAnimal(newAnimal);
    }

    setIsModalOpen(false);
  };

  const filteredAnimals = safeAnimals.filter(a => {
    const q = searchTerm.trim().toLowerCase();
    const matchSearch =
      !q ||
      (a.name || '').toLowerCase().includes(q) ||
      (a.registrationNumber || '').toLowerCase().includes(q) ||
      (a.microchip || '').toLowerCase().includes(q);
    const matchBreed = filterBreed === 'all' || a.breed === filterBreed;
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchBreed && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
            Plantel & Registro Oficial
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Cadastro completo com microchip ISO, registro genealógico, biometria e passaporte
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cadastrar Cavalo</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, registro ou microchip..."
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={filterBreed}
          onChange={e => setFilterBreed(e.target.value)}
          className="h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">Todas as raças</option>
          {BREED_OPTIONS.map(b => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">Todos os status</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums px-1 self-center shrink-0">
          {filteredAnimals.length} de {safeAnimals.length}
        </span>
      </div>

      {/* Herd Grid */}
      {filteredAnimals.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-10 text-center space-y-2.5">
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-400 mx-auto flex items-center justify-center">
            <EquinoIcon className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Nenhum animal encontrado
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {safeAnimals.length === 0
              ? 'Cadastre seu primeiro equino para iniciar o controle do haras.'
              : 'Ajuste os filtros de busca ou cadastre um novo cavalo.'}
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar Cavalo</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAnimals.map(animal => (
            <div
              key={animal.id}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col"
            >
              {/* Photo Banner */}
              <div className="h-36 bg-slate-100 dark:bg-zinc-800/70 relative flex items-center justify-center overflow-hidden border-b border-slate-200 dark:border-zinc-800">
                {animal.photoUrl ? (
                  <img
                    src={animal.photoUrl}
                    alt={animal.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <EquinoIcon className="w-10 h-10 text-slate-300 dark:text-zinc-600" />
                )}
              </div>

              {/* Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                        {animal.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                        {animal.breed} · {animal.coatColor} · {animal.sex}
                      </p>
                    </div>
                    <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 shrink-0">
                      {animal.status.split(' /')[0]}
                    </span>
                  </div>

                  {/* Key Specs */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800 grid grid-cols-3 gap-2 text-xs tabular-nums">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Peso</span>
                      <span className="font-semibold text-slate-900 dark:text-zinc-100">
                        {animal.weightKg} kg
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Cernelha</span>
                      <span className="font-semibold text-slate-900 dark:text-zinc-100">
                        {animal.heightM.toFixed(2)} m
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Henneke</span>
                      <span className="font-semibold text-slate-900 dark:text-zinc-100">
                        {animal.bodyScore}/9
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 text-[11px] text-slate-500 dark:text-zinc-400 space-y-0.5 tabular-nums">
                    <div className="truncate">
                      Registro: <span className="text-slate-700 dark:text-zinc-300 font-medium">{animal.registrationNumber}</span> ({animal.association})
                    </div>
                    <div className="truncate">
                      Microchip: <span className="text-slate-700 dark:text-zinc-300 font-mono">{animal.microchip || 'Não informado'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onNavigateTab('digital_twin', animal.id)}
                      className="h-7 px-2.5 rounded-md bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:opacity-90 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Gêmeo 360°</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenPassport(animal)}
                      className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <FileCheck className="w-3 h-3" />
                      <span>Passaporte</span>
                    </button>
                  </div>

                  {confirmDeleteId === animal.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteAnimal(animal.id);
                          setConfirmDeleteId(null);
                        }}
                        className="h-7 px-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-[11px] font-medium cursor-pointer"
                      >
                        Excluir
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="h-7 px-2 rounded-md border border-slate-200 dark:border-zinc-700 text-[11px] text-slate-600 dark:text-zinc-300 cursor-pointer"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(animal)}
                        title="Editar"
                        className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center justify-center cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(animal.id)}
                        title="Excluir"
                        className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create / Edit Equine */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <div className="flex items-center gap-2">
                <EquinoIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  {editingAnimal ? `Editar Animal — ${editingAnimal.name}` : 'Cadastrar Novo Equino'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-7 w-7 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-5">
              {/* Photo Upload */}
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="w-20 h-20 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
                  {formData.photoUrl ? (
                    <img src={formData.photoUrl} alt="Prévia" className="w-full h-full object-cover" />
                  ) : (
                    <EquinoIcon className="w-7 h-7 text-slate-400" />
                  )}
                </div>
                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-slate-900 dark:text-zinc-100">
                    Fotografia do Animal
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Utilizada no perfil do plantel, Gêmeo Digital 360° e passaporte impresso.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Selecionar Foto</span>
                    </button>
                    {formData.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, photoUrl: '' }))}
                        className="h-7 px-2.5 rounded-md text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Identification */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Nome Oficial / de Pista *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Imperador da Serra"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Registro (ABCCMM / ABQM)</label>
                  <input
                    type="text"
                    value={formData.registrationNumber || ''}
                    onChange={e => setFormData({ ...formData, registrationNumber: e.target.value })}
                    placeholder="Ex: ABCCMM-458210"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Microchip ISO</label>
                  <input
                    type="text"
                    value={formData.microchip || ''}
                    onChange={e => setFormData({ ...formData, microchip: e.target.value })}
                    placeholder="15 dígitos ISO 11784"
                    className={`${inputCls} font-mono`}
                  />
                </div>
                <div>
                  <label className={labelCls}>Nº Passaporte</label>
                  <input
                    type="text"
                    value={formData.passportNumber || ''}
                    onChange={e => setFormData({ ...formData, passportNumber: e.target.value })}
                    placeholder="Ex: BR-CBH-2026-001"
                    className={`${inputCls} font-mono`}
                  />
                </div>
                <div>
                  <label className={labelCls}>Data de Nascimento</label>
                  <input
                    type="date"
                    value={formData.birthDate || ''}
                    onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Breed & Classification */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Raça</label>
                  <select
                    value={formData.breed}
                    onChange={e => setFormData({ ...formData, breed: e.target.value as EquineBreed })}
                    className={inputCls}
                  >
                    {BREED_OPTIONS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Pelagem</label>
                  <select
                    value={formData.coatColor}
                    onChange={e => setFormData({ ...formData, coatColor: e.target.value as EquineCoatColor })}
                    className={inputCls}
                  >
                    {COAT_OPTIONS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Sexo</label>
                  <select
                    value={formData.sex}
                    onChange={e => setFormData({ ...formData, sex: e.target.value as EquineSex })}
                    className={inputCls}
                  >
                    <option value="Garanhão">Garanhão</option>
                    <option value="Égua">Égua</option>
                    <option value="Castrado">Castrado</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Categoria</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as EquineCategory })}
                    className={inputCls}
                  >
                    {CATEGORY_OPTIONS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Modalidade / Aptidão</label>
                  <select
                    value={formData.discipline}
                    onChange={e => setFormData({ ...formData, discipline: e.target.value as EquineDiscipline })}
                    className={inputCls}
                  >
                    {DISCIPLINE_OPTIONS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Status Operacional</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as EquineStatus })}
                    className={inputCls}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Biometrics & Origin */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className={labelCls}>Peso Atual (kg)</label>
                  <input
                    type="number"
                    value={formData.weightKg ?? 450}
                    onChange={e => setFormData({ ...formData, weightKg: Number(e.target.value) || 0 })}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
                <div>
                  <label className={labelCls}>Cernelha (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.heightM ?? 1.52}
                    onChange={e => setFormData({ ...formData, heightM: Number(e.target.value) || 0 })}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
                <div>
                  <label className={labelCls}>Perím. Torácico (cm)</label>
                  <input
                    type="number"
                    value={formData.chestCircumferenceCm ?? 178}
                    onChange={e => setFormData({ ...formData, chestCircumferenceCm: Number(e.target.value) || 0 })}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
                <div>
                  <label className={labelCls}>Escore Henneke (1–9)</label>
                  <input
                    type="number"
                    min={1}
                    max={9}
                    step={0.5}
                    value={formData.bodyScore ?? 5}
                    onChange={e => setFormData({ ...formData, bodyScore: Number(e.target.value) || 5 })}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className={labelCls}>Associação</label>
                  <input
                    type="text"
                    value={formData.association || ''}
                    onChange={e => setFormData({ ...formData, association: e.target.value })}
                    placeholder="ABCCMM / ABQM"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Criador / Haras</label>
                  <input
                    type="text"
                    value={formData.breeder || ''}
                    onChange={e => setFormData({ ...formData, breeder: e.target.value })}
                    placeholder="Haras de origem"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Proprietário</label>
                  <input
                    type="text"
                    value={formData.owner || ''}
                    onChange={e => setFormData({ ...formData, owner: e.target.value })}
                    placeholder="Nome do proprietário"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Valor de Mercado (R$)</label>
                  <input
                    type="number"
                    value={formData.marketValueBrl ?? 0}
                    onChange={e => setFormData({ ...formData, marketValueBrl: Number(e.target.value) || 0 })}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
              </div>

              {formData.sex === 'Égua' && (
                <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.isPregnant)}
                    onChange={e => setFormData({ ...formData, isPregnant: e.target.checked })}
                    className="rounded accent-emerald-600"
                  />
                  <span>Égua gestante em acompanhamento</span>
                </label>
              )}

              <div>
                <label className={labelCls}>Observações & Temperamento</label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Histórico clínico, particularidades de manejo ou premiações relevantes..."
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 px-3.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
                >
                  {editingAnimal ? 'Salvar Alterações' : 'Cadastrar Animal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
