import React, { useState } from 'react';
import {
  CaprineAnimal,
  CaprineBreed,
  CaprineCategory,
  CaprineSex,
  CaprineStatus,
  CaprineBloodDegree
} from '../../types/caprine';
import {
  Search,
  Plus,
  QrCode,
  Edit2,
  Trash2,
  Eye,
  Tag,
  ShieldCheck,
  X,
  Check
} from 'lucide-react';

interface Props {
  animals: CaprineAnimal[];
  onSaveAnimal: (animal: CaprineAnimal) => void;
  onDeleteAnimal: (id: string) => void;
  onSelectAnimalForTwin: (id: string) => void;
}

const FALLBACK_GOAT_IMG =
  'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=600&q=80';

const BREED_OPTIONS: CaprineBreed[] = [
  'Anglo-Nubiana',
  'Saanen',
  'Toggenburg',
  'Boer',
  'Alpina',
  'Canindé',
  'Moxotó',
  'Marota',
  'Savanna',
  'SRD (Sem Raça Definida)'
];

const CATEGORY_OPTIONS: CaprineCategory[] = [
  'Cabra em Lactação',
  'Cabra Seca',
  'Matriz Gestante',
  'Reprodutor (Bode)',
  'Cabrito Mamando',
  'Cabrita de Reposição',
  'Cabrito Desmamado',
  'Caprino para Abate'
];

const STATUS_OPTIONS: CaprineStatus[] = [
  'Ativo',
  'Quarentena',
  'Tratamento',
  'Vendido',
  'Descartado',
  'Óbito'
];

const BLOOD_DEGREE_OPTIONS: CaprineBloodDegree[] = [
  'PO (Puro de Origem)',
  'PC (Puro por Cruza)',
  '7/8',
  '3/4',
  '1/2 (F1)',
  'SRD'
];

export const CaprineIndividualRegistryView: React.FC<Props> = ({
  animals,
  onSaveAnimal,
  onDeleteAnimal,
  onSelectAnimalForTwin
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('TODOS');
  const [breedFilter, setBreedFilter] = useState<string>('TODOS');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Partial<CaprineAnimal> | null>(null);
  const [formError, setFormError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredAnimals = animals.filter(a => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.earTag.toLowerCase().includes(q) ||
      a.rfidCode.toLowerCase().includes(q);

    const matchesCategory = categoryFilter === 'TODOS' || a.category === categoryFilter;
    const matchesBreed = breedFilter === 'TODOS' || a.breed === breedFilter;
    const matchesStatus = statusFilter === 'TODOS' || a.status === statusFilter;

    return matchesSearch && matchesCategory && matchesBreed && matchesStatus;
  });

  const handleOpenAddModal = () => {
    const nextNum = animals.length + 101;
    setFormError('');
    setIsEditingExisting(false);
    setEditingAnimal({
      id: `cap-${Date.now()}`,
      earTag: `CAP-${nextNum}`,
      rfidCode: `982.000${Math.floor(100000000 + Math.random() * 900000000)}`,
      qrCode: `CAP${nextNum}-RFID`,
      name: '',
      breed: 'Anglo-Nubiana',
      sex: 'Fêmea',
      category: 'Cabra em Lactação',
      birthDate: new Date().toISOString().split('T')[0],
      weightKg: 50,
      bodyConditionScore: 3.5,
      famachaScore: 1,
      owner: 'Capril Principal',
      lot: 'Lote Leiteiro A',
      status: 'Ativo',
      bloodDegree: 'PO (Puro de Origem)',
      geneticLineage: 'Seleção Nacional',
      photoUrl: FALLBACK_GOAT_IMG
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (animal: CaprineAnimal) => {
    setFormError('');
    setIsEditingExisting(true);
    setEditingAnimal({ ...animal });
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnimal?.name?.trim() || !editingAnimal?.earTag?.trim()) {
      setFormError('Preencha o nome e o número do brinco do animal.');
      return;
    }

    onSaveAnimal(editingAnimal as CaprineAnimal);
    setIsModalOpen(false);
    setEditingAnimal(null);
    setFormError('');
  };

  const inputCls =
    'w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            Cadastro Individual &amp; Identidade RFID
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Brinco eletrônico, QR Code, escore corporal (ECC), FAMACHA e grau de sangue ({animals.length} animais).
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Cadastrar Caprino
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, brinco (CAP-101) ou RFID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-8 pl-8 pr-3 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 rounded-lg text-xs border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 rounded-lg text-xs border border-slate-200 dark:border-zinc-800"
          >
            <option value="TODOS">Todas Categorias</option>
            {CATEGORY_OPTIONS.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={breedFilter}
            onChange={e => setBreedFilter(e.target.value)}
            className="h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 rounded-lg text-xs border border-slate-200 dark:border-zinc-800"
          >
            <option value="TODOS">Todas Raças</option>
            {BREED_OPTIONS.map(b => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 rounded-lg text-xs border border-slate-200 dark:border-zinc-800"
          >
            <option value="TODOS">Todos Status</option>
            {STATUS_OPTIONS.map(st => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Empty State or Grid */}
      {filteredAnimals.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-10 text-center space-y-2">
          <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
            {animals.length === 0
              ? 'Nenhum caprino cadastrado no plantel.'
              : 'Nenhum animal corresponde aos filtros selecionados.'}
          </p>
          {animals.length === 0 && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="mt-1 h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Cadastrar Primeiro Caprino
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAnimals.map(animal => {
            const isConfirmingDelete = confirmDeleteId === animal.id;
            const famacha = animal.famachaScore || 1;
            return (
              <div
                key={animal.id}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-36 bg-slate-100 dark:bg-zinc-800">
                    <img
                      src={animal.photoUrl || FALLBACK_GOAT_IMG}
                      alt={animal.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-zinc-950/75 text-white text-[11px] font-mono font-medium px-2 py-0.5 rounded-md">
                      {animal.earTag}
                    </span>
                    <span
                      className={`absolute top-2.5 right-2.5 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                        animal.status === 'Ativo'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-900/80 text-zinc-100'
                      }`}
                    >
                      {animal.status}
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                          {animal.name}
                        </h3>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 shrink-0">
                          {animal.breed}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1 font-mono truncate">
                        <QrCode className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        {animal.rfidCode}
                      </p>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-1">
                        {animal.category}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-2.5 border-t border-slate-100 dark:border-zinc-800 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                          Peso / ECC
                        </span>
                        <span className="font-medium tabular-nums text-slate-900 dark:text-zinc-100">
                          {animal.weightKg} kg · ECC {animal.bodyConditionScore}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                          Grau de Sangue
                        </span>
                        <span className="font-medium text-slate-900 dark:text-zinc-100 truncate block">
                          {animal.bloodDegree}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                          Lote / Aprisco
                        </span>
                        <span className="font-medium text-slate-800 dark:text-zinc-200 truncate block">
                          {animal.lot}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                          FAMACHA
                        </span>
                        <span
                          className={`font-medium tabular-nums ${
                            famacha >= 3
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          Grau {famacha}
                        </span>
                      </div>
                    </div>

                    {animal.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                        {animal.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-zinc-950/40 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectAnimalForTwin(animal.id)}
                    className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Gêmeo 360°
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(animal)}
                      className="h-7 w-7 inline-flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:bg-slate-200/70 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                      title="Editar Cadastro"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {isConfirmingDelete ? (
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteAnimal(animal.id);
                            setConfirmDeleteId(null);
                          }}
                          className="h-7 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          Excluir
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="h-7 w-7 inline-flex items-center justify-center text-slate-500 hover:bg-slate-200/70 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
                          title="Cancelar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(animal.id)}
                        className="h-7 w-7 inline-flex items-center justify-center text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Animal Modal */}
      {isModalOpen && editingAnimal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-2xl w-full border border-slate-200 dark:border-zinc-800 shadow-xl my-8 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {isEditingExisting ? 'Editar Ficha Caprina' : 'Novo Cadastro de Caprino'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 space-y-4 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Nome do Animal *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingAnimal.name || ''}
                    onChange={e => setEditingAnimal({ ...editingAnimal, name: e.target.value })}
                    className={inputCls}
                    placeholder="Ex: Estrela do Agreste"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Brinco / ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingAnimal.earTag || ''}
                    onChange={e => setEditingAnimal({ ...editingAnimal, earTag: e.target.value })}
                    className={`${inputCls} font-mono`}
                    placeholder="Ex: CAP-101"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Brinco Eletrônico (RFID/NFC)
                  </label>
                  <input
                    type="text"
                    value={editingAnimal.rfidCode || ''}
                    onChange={e => setEditingAnimal({ ...editingAnimal, rfidCode: e.target.value })}
                    className={`${inputCls} font-mono`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Raça *
                  </label>
                  <select
                    value={editingAnimal.breed || 'Anglo-Nubiana'}
                    onChange={e =>
                      setEditingAnimal({ ...editingAnimal, breed: e.target.value as CaprineBreed })
                    }
                    className={inputCls}
                  >
                    {BREED_OPTIONS.map(b => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Categoria Zootécnica *
                  </label>
                  <select
                    value={editingAnimal.category || 'Cabra em Lactação'}
                    onChange={e =>
                      setEditingAnimal({
                        ...editingAnimal,
                        category: e.target.value as CaprineCategory
                      })
                    }
                    className={inputCls}
                  >
                    {CATEGORY_OPTIONS.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Sexo *
                  </label>
                  <select
                    value={editingAnimal.sex || 'Fêmea'}
                    onChange={e =>
                      setEditingAnimal({ ...editingAnimal, sex: e.target.value as CaprineSex })
                    }
                    className={inputCls}
                  >
                    <option value="Fêmea">Fêmea</option>
                    <option value="Macho (Bode)">Macho (Bode)</option>
                    <option value="Macho Castrado">Macho Castrado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Status
                  </label>
                  <select
                    value={editingAnimal.status || 'Ativo'}
                    onChange={e =>
                      setEditingAnimal({
                        ...editingAnimal,
                        status: e.target.value as CaprineStatus
                      })
                    }
                    className={inputCls}
                  >
                    {STATUS_OPTIONS.map(st => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={editingAnimal.birthDate || ''}
                    onChange={e =>
                      setEditingAnimal({ ...editingAnimal, birthDate: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Peso Atual (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingAnimal.weightKg ?? 50}
                    onChange={e =>
                      setEditingAnimal({
                        ...editingAnimal,
                        weightKg: parseFloat(e.target.value) || 0
                      })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Escore Corporal (ECC 1-5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={editingAnimal.bodyConditionScore ?? 3.5}
                    onChange={e =>
                      setEditingAnimal({
                        ...editingAnimal,
                        bodyConditionScore: parseFloat(e.target.value) || 3.5
                      })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Lote / Aprisco
                  </label>
                  <input
                    type="text"
                    value={editingAnimal.lot || ''}
                    onChange={e => setEditingAnimal({ ...editingAnimal, lot: e.target.value })}
                    className={inputCls}
                    placeholder="Ex: Lote Leiteiro A"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Grau de Sangue
                  </label>
                  <select
                    value={editingAnimal.bloodDegree || 'PO (Puro de Origem)'}
                    onChange={e =>
                      setEditingAnimal({
                        ...editingAnimal,
                        bloodDegree: e.target.value as CaprineBloodDegree
                      })
                    }
                    className={inputCls}
                  >
                    {BLOOD_DEGREE_OPTIONS.map(bd => (
                      <option key={bd} value={bd}>
                        {bd}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Pai (Reprodutor)
                  </label>
                  <input
                    type="text"
                    value={editingAnimal.fatherName || ''}
                    onChange={e =>
                      setEditingAnimal({ ...editingAnimal, fatherName: e.target.value })
                    }
                    className={inputCls}
                    placeholder="Opcional"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Mãe (Matriz)
                  </label>
                  <input
                    type="text"
                    value={editingAnimal.motherName || ''}
                    onChange={e =>
                      setEditingAnimal({ ...editingAnimal, motherName: e.target.value })
                    }
                    className={inputCls}
                    placeholder="Opcional"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    URL da Fotografia
                  </label>
                  <input
                    type="text"
                    value={editingAnimal.photoUrl || ''}
                    onChange={e => setEditingAnimal({ ...editingAnimal, photoUrl: e.target.value })}
                    className={inputCls}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Observações Técnicas
                </label>
                <textarea
                  rows={2}
                  value={editingAnimal.notes || ''}
                  onChange={e => setEditingAnimal({ ...editingAnimal, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Anotações sobre saúde, aprumos ou temperamento..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Salvar Caprino
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
