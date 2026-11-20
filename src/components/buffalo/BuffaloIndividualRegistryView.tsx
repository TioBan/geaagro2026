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
  Eye,
  X,
  Printer,
  Check
} from 'lucide-react';

interface BuffaloIndividualRegistryViewProps {
  animals: BuffaloAnimal[];
  onAddAnimal: (newAnimal: BuffaloAnimal) => void;
  onUpdateAnimal: (updatedAnimal: BuffaloAnimal) => void;
  onDeleteAnimal: (animalId: string) => void;
  onOpenDigitalTwin: (animalId: string) => void;
}

interface AnimalFormState {
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
  bloodDegree: BuffaloAnimal['bloodDegree'];
  registrationCodeABCB: string;
  currentWeightKg: number;
  birthWeightKg: number;
  bodyConditionScore: number;
  sireName: string;
  damName: string;
  averageDailyMilkLiters: number;
  averageFatPct: number;
  averageProteinPct: number;
  notes: string;
}

const createEmptyForm = (): AnimalFormState => ({
  identificationNumber: '',
  rfidCode: '',
  name: '',
  breed: 'Murrah',
  sex: 'Fêmea',
  category: 'Matriz em Lactação',
  coatColor: 'Preta',
  birthDate: new Date().toISOString().split('T')[0],
  purpose: 'Leite',
  ownerFarm: '',
  batchName: '',
  status: 'Em Lactação',
  bloodDegree: 'PO (Puro de Origem)',
  registrationCodeABCB: '',
  currentWeightKg: 0,
  birthWeightKg: 0,
  bodyConditionScore: 3.5,
  sireName: '',
  damName: '',
  averageDailyMilkLiters: 0,
  averageFatPct: 0,
  averageProteinPct: 0,
  notes: ''
});

const inputCls =
  'w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-teal-500';
const labelCls = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

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

  const [showModal, setShowModal] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<BuffaloAnimal | null>(null);
  const [formData, setFormData] = useState<AnimalFormState>(() => createEmptyForm());
  const [formError, setFormError] = useState<string | null>(null);

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [selectedQRAnimal, setSelectedQRAnimal] = useState<BuffaloAnimal | null>(null);
  const [qrPrintConfirmed, setQrPrintConfirmed] = useState(false);

  const filteredAnimals = animals.filter(animal => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      animal.name.toLowerCase().includes(q) ||
      animal.identificationNumber.toLowerCase().includes(q) ||
      (animal.rfidCode && animal.rfidCode.toLowerCase().includes(q)) ||
      (animal.registrationCodeABCB && animal.registrationCodeABCB.toLowerCase().includes(q)) ||
      (animal.batchName && animal.batchName.toLowerCase().includes(q));

    const matchesBreed = filterBreed === 'todos' || animal.breed === filterBreed;
    const matchesCategory = filterCategory === 'todos' || animal.category === filterCategory;
    const matchesStatus = filterStatus === 'todos' || animal.status === filterStatus;

    return matchesSearch && matchesBreed && matchesCategory && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingAnimal(null);
    setFormData(createEmptyForm());
    setFormError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (animal: BuffaloAnimal) => {
    setEditingAnimal(animal);
    setFormData({
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
      averageFatPct: animal.averageFatPct || 0,
      averageProteinPct: animal.averageProteinPct || 0,
      notes: animal.notes || ''
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.identificationNumber.trim() || !formData.name.trim()) {
      setFormError('Informe o número de identificação (brinco) e o nome do animal.');
      return;
    }

    if (editingAnimal) {
      const updated: BuffaloAnimal = {
        ...editingAnimal,
        ...formData,
        identificationNumber: formData.identificationNumber.trim(),
        name: formData.name.trim(),
        currentWeightKg: Number(formData.currentWeightKg) || 0,
        birthWeightKg: Number(formData.birthWeightKg) || 0,
        bodyConditionScore: Number(formData.bodyConditionScore) || 3,
        averageDailyMilkLiters: Number(formData.averageDailyMilkLiters) || 0,
        averageFatPct: Number(formData.averageFatPct) || 0,
        averageProteinPct: Number(formData.averageProteinPct) || 0
      };
      onUpdateAnimal(updated);
    } else {
      const weight = Number(formData.currentWeightKg) || 0;
      const bcs = Number(formData.bodyConditionScore) || 3;
      const newAnimal: BuffaloAnimal = {
        id: `buf-${Date.now()}`,
        identificationNumber: formData.identificationNumber.trim(),
        rfidCode: formData.rfidCode.trim(),
        name: formData.name.trim(),
        breed: formData.breed,
        sex: formData.sex,
        category: formData.category,
        coatColor: formData.coatColor,
        birthDate: formData.birthDate,
        purpose: formData.purpose,
        ownerFarm: formData.ownerFarm.trim(),
        batchName: formData.batchName.trim() || 'Lote Geral',
        status: formData.status,
        bloodDegree: formData.bloodDegree,
        registrationCodeABCB: formData.registrationCodeABCB.trim(),
        currentWeightKg: weight,
        birthWeightKg: Number(formData.birthWeightKg) || 0,
        bodyConditionScore: bcs,
        sireName: formData.sireName.trim(),
        damName: formData.damName.trim(),
        averageDailyMilkLiters: Number(formData.averageDailyMilkLiters) || 0,
        averageFatPct: Number(formData.averageFatPct) || 0,
        averageProteinPct: Number(formData.averageProteinPct) || 0,
        notes: formData.notes.trim(),
        parityCount: formData.sex === 'Fêmea' && formData.category.includes('Matriz') ? 1 : 0,
        thermalComfortScore: 90,
        weighings: weight > 0
          ? [
              {
                id: `w-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                weightKg: weight,
                bodyConditionScore: bcs
              }
            ]
          : [],
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
    <div className="space-y-4">
      {/* Barra de busca, filtros e ação principal */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por brinco, RFID, nome, lote ou registro ABCB..."
              className="w-full h-8 pl-8 pr-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-teal-500"
            />
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="h-8 px-3.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar Búfalo</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2.5 border-t border-slate-100 dark:border-zinc-800">
          <div>
            <label className={labelCls}>Raça</label>
            <select value={filterBreed} onChange={(e) => setFilterBreed(e.target.value)} className={inputCls}>
              <option value="todos">Todas as raças</option>
              <option value="Murrah">Murrah</option>
              <option value="Mediterrâneo">Mediterrâneo</option>
              <option value="Jafarabadi">Jafarabadi</option>
              <option value="Carabao">Carabao</option>
              <option value="Baio">Baio</option>
              <option value="Mestiço Bubalino">Mestiço Bubalino</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Categoria</label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={inputCls}>
              <option value="todos">Todas as categorias</option>
              <option value="Matriz em Lactação">Matriz em Lactação</option>
              <option value="Matriz Seca">Matriz Seca</option>
              <option value="Matriz Gestante Seca">Matriz Gestante Seca</option>
              <option value="Reprodutor (Touro)">Reprodutor (Touro)</option>
              <option value="Bezerra (0-6m)">Bezerra (0-6m)</option>
              <option value="Bezerro (0-6m)">Bezerro (0-6m)</option>
              <option value="Novilha em Recria (7-24m)">Novilha em Recria (7-24m)</option>
              <option value="Garrote em Engorda">Garrote em Engorda</option>
              <option value="Búfalo em Terminação">Búfalo em Terminação</option>
              <option value="Rufião">Rufião</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={inputCls}>
              <option value="todos">Todos os status</option>
              <option value="Em Lactação">Em Lactação</option>
              <option value="Seca">Seca</option>
              <option value="Gestante">Gestante</option>
              <option value="Inseminada">Inseminada</option>
              <option value="Ativo">Ativo</option>
              <option value="Quarentena">Quarentena</option>
              <option value="Tratamento Sanitário">Tratamento Sanitário</option>
              <option value="Vendido">Vendido</option>
              <option value="Abatido">Abatido</option>
              <option value="Descartado">Descartado</option>
            </select>
          </div>
        </div>
      </section>

      {/* Lista / Grade de Animais */}
      {filteredAnimals.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-dashed border-slate-300 dark:border-zinc-700 rounded-xl p-10 text-center space-y-2.5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
            {animals.length === 0 ? 'Nenhum búfalo cadastrado no rebanho' : 'Nenhum animal corresponde aos filtros'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
            {animals.length === 0
              ? 'Cadastre matrizes, reprodutores e lotes para ativar os controles de leite, pesagem, reprodução e Gêmeo Digital 360°.'
              : 'Ajuste os termos de busca ou limpe os filtros selecionados.'}
          </p>
          {animals.length === 0 && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-1 h-8 px-3.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar Primeiro Búfalo</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredAnimals.map(animal => (
            <article
              key={animal.id}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col justify-between gap-3"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                        {animal.identificationNumber}
                      </span>
                      <span className="text-slate-300 dark:text-zinc-700">·</span>
                      <span className="text-slate-600 dark:text-zinc-400 truncate">{animal.breed}</span>
                      <span className="text-slate-300 dark:text-zinc-700">·</span>
                      <span className="text-slate-500 dark:text-zinc-400">{animal.sex}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate mt-0.5">
                      {animal.name}
                    </h3>
                    {animal.registrationCodeABCB && (
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                        ABCB {animal.registrationCodeABCB} · {animal.bloodDegree}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setQrPrintConfirmed(false);
                      setSelectedQRAnimal(animal);
                    }}
                    title="Identidade Digital e QR Code"
                    className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 inline-flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>
                </div>

                <dl className="grid grid-cols-2 gap-x-3 gap-y-2 pt-2.5 border-t border-slate-100 dark:border-zinc-800 text-xs">
                  <div>
                    <dt className="text-[11px] text-slate-500 dark:text-zinc-400">Categoria</dt>
                    <dd className="font-medium text-slate-800 dark:text-zinc-200 truncate">{animal.category}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-slate-500 dark:text-zinc-400">Peso / ECC</dt>
                    <dd className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums">
                      {animal.currentWeightKg} kg · ECC {animal.bodyConditionScore}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-slate-500 dark:text-zinc-400">Lote</dt>
                    <dd className="font-medium text-slate-700 dark:text-zinc-300 truncate">
                      {animal.batchName || '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-slate-500 dark:text-zinc-400">Status</dt>
                    <dd className="font-semibold text-teal-600 dark:text-teal-400 truncate">{animal.status}</dd>
                  </div>
                </dl>

                {animal.averageDailyMilkLiters && animal.averageDailyMilkLiters > 0 ? (
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs tabular-nums">
                    <span className="text-slate-500 dark:text-zinc-400">Leite diário</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {animal.averageDailyMilkLiters} L/dia
                      {animal.averageFatPct ? ` · ${animal.averageFatPct}% gord.` : ''}
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Ações */}
              <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-1.5">
                {pendingDeleteId === animal.id ? (
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                      Confirmar exclusão?
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(null)}
                        className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 text-xs text-slate-600 dark:text-zinc-300 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteAnimal(animal.id);
                          setPendingDeleteId(null);
                        }}
                        className="h-7 px-2.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium cursor-pointer"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onOpenDigitalTwin(animal.id)}
                      className="flex-1 h-7 px-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-md inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Gêmeo 360°</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(animal)}
                      title="Editar registro"
                      className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 inline-flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(animal.id)}
                      title="Remover animal"
                      className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 hover:border-rose-300 hover:text-rose-600 dark:hover:text-rose-400 text-slate-500 dark:text-zinc-400 inline-flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal de Cadastro / Edição */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 max-w-2xl w-full my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {editingAnimal ? 'Editar Cadastro de Búfalo' : 'Novo Cadastro de Búfalo'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Identificação individual, genealogia e parâmetros zootécnicos
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="h-7 w-7 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white inline-flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className={labelCls}>Brinco / Identificação *</label>
                  <input
                    type="text"
                    required
                    value={formData.identificationNumber}
                    onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })}
                    placeholder="Ex: BUF-001"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>RFID / Transponder</label>
                  <input
                    type="text"
                    value={formData.rfidCode}
                    onChange={(e) => setFormData({ ...formData, rfidCode: e.target.value })}
                    placeholder="Ex: 982000412345678"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Registro ABCB</label>
                  <input
                    type="text"
                    value={formData.registrationCodeABCB}
                    onChange={(e) => setFormData({ ...formData, registrationCodeABCB: e.target.value })}
                    placeholder="Ex: ABCB-MR-84920"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Nome do Animal *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Morena do Pontal"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Raça</label>
                  <select
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value as BuffaloBreed })}
                    className={inputCls}
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className={labelCls}>Sexo</label>
                  <select
                    value={formData.sex}
                    onChange={(e) => setFormData({ ...formData, sex: e.target.value as 'Fêmea' | 'Macho' })}
                    className={inputCls}
                  >
                    <option value="Fêmea">Fêmea</option>
                    <option value="Macho">Macho</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Categoria Zootécnica</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as BuffaloCategory })}
                    className={inputCls}
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
                    <option value="Rufião">Rufião</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as BuffaloStatus })}
                    className={inputCls}
                  >
                    <option value="Em Lactação">Em Lactação</option>
                    <option value="Seca">Seca</option>
                    <option value="Gestante">Gestante</option>
                    <option value="Inseminada">Inseminada</option>
                    <option value="Ativo">Ativo</option>
                    <option value="Quarentena">Quarentena</option>
                    <option value="Tratamento Sanitário">Tratamento Sanitário</option>
                    <option value="Vendido">Vendido</option>
                    <option value="Abatido">Abatido</option>
                    <option value="Descartado">Descartado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className={labelCls}>Aptidão</label>
                  <select
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value as BuffaloPurpose })}
                    className={inputCls}
                  >
                    <option value="Leite">Leite</option>
                    <option value="Corte">Corte</option>
                    <option value="Dupla Aptidão">Dupla Aptidão</option>
                    <option value="Genética / PO">Genética / PO</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Grau de Sangue</label>
                  <select
                    value={formData.bloodDegree}
                    onChange={(e) =>
                      setFormData({ ...formData, bloodDegree: e.target.value as BuffaloAnimal['bloodDegree'] })
                    }
                    className={inputCls}
                  >
                    <option value="PO (Puro de Origem)">PO (Puro de Origem)</option>
                    <option value="PC (Puro por Cruza)">PC (Puro por Cruza)</option>
                    <option value="PA (Puro por Absorção)">PA (Puro por Absorção)</option>
                    <option value="Mestiço F1">Mestiço F1</option>
                    <option value="Comercial">Comercial</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Pelagem</label>
                  <select
                    value={formData.coatColor}
                    onChange={(e) => setFormData({ ...formData, coatColor: e.target.value as BuffaloCoatColor })}
                    className={inputCls}
                  >
                    <option value="Preta">Preta</option>
                    <option value="Parda Escura">Parda Escura</option>
                    <option value="Baia / Castanha">Baia / Castanha</option>
                    <option value="Ruana">Ruana</option>
                    <option value="Preta com Estrela Branca na Testa">Preta c/ Estrela Branca</option>
                    <option value="Cinza Ardosia">Cinza Ardósia</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className={labelCls}>Peso Atual (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.currentWeightKg}
                    onChange={(e) => setFormData({ ...formData, currentWeightKg: Number(e.target.value) })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Peso Nascer (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.birthWeightKg}
                    onChange={(e) => setFormData({ ...formData, birthWeightKg: Number(e.target.value) })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>ECC (1 a 5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.bodyConditionScore}
                    onChange={(e) => setFormData({ ...formData, bodyConditionScore: Number(e.target.value) })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Nascimento</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className={labelCls}>Leite Diário (L)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.averageDailyMilkLiters}
                    onChange={(e) => setFormData({ ...formData, averageDailyMilkLiters: Number(e.target.value) })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Gordura (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    step="0.1"
                    value={formData.averageFatPct}
                    onChange={(e) => setFormData({ ...formData, averageFatPct: Number(e.target.value) })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Proteína (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.averageProteinPct}
                    onChange={(e) => setFormData({ ...formData, averageProteinPct: Number(e.target.value) })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className={labelCls}>Lote</label>
                  <input
                    type="text"
                    value={formData.batchName}
                    onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
                    placeholder="Ex: Lote Alta Produção"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Pai (Sire)</label>
                  <input
                    type="text"
                    value={formData.sireName}
                    onChange={(e) => setFormData({ ...formData, sireName: e.target.value })}
                    placeholder="Nome ou registro"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Mãe (Dam)</label>
                  <input
                    type="text"
                    value={formData.damName}
                    onChange={(e) => setFormData({ ...formData, damName: e.target.value })}
                    placeholder="Nome ou registro"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Observações</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Anotações de manejo ou histórico clínico"
                  className={inputCls}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium cursor-pointer transition-colors"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal QR Code / Identidade Digital */}
      {selectedQRAnimal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 max-w-sm w-full text-center space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-zinc-800">
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                Identidade Digital &amp; QR Code
              </span>
              <button
                type="button"
                onClick={() => setSelectedQRAnimal(null)}
                className="h-7 w-7 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white inline-flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800 inline-block mx-auto">
              <div className="w-40 h-40 bg-white p-2 rounded-md flex items-center justify-center">
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

            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                {selectedQRAnimal.identificationNumber} · {selectedQRAnimal.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {selectedQRAnimal.breed} · RFID: {selectedQRAnimal.rfidCode || 'Não informado'}
              </p>
            </div>

            {qrPrintConfirmed && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 inline-flex items-center justify-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Janela de impressão aberta para etiqueta do brinco.</span>
              </p>
            )}

            <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setQrPrintConfirmed(true);
                  window.print();
                }}
                className="flex-1 h-8 px-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Etiqueta</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedQRAnimal(null)}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 cursor-pointer"
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
