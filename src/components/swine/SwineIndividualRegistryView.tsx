import React, { useMemo, useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Cpu,
  Trash2,
  Edit2,
  X,
} from 'lucide-react';
import {
  SwineAnimal,
  SwineSex,
  SwineBreedLineage,
  SwineCategory,
  SwineStatus,
} from '../../types/swine';
import {
  SWINE_CARD_CLASS,
  SWINE_INPUT_CLASS,
  SWINE_LABEL_CLASS,
  SWINE_PRIMARY_BTN_CLASS,
  SWINE_SECONDARY_BTN_CLASS,
  SWINE_SUBCARD_CLASS,
  SWINE_TEXTAREA_CLASS,
  getSwineStatusBadgeClass,
  getTodayIsoDate,
  useEscapeClose,
} from './swineUi';

interface SwineIndividualRegistryViewProps {
  animals: SwineAnimal[];
  onAddAnimal: (animal: SwineAnimal) => void;
  onUpdateAnimal: (animal: SwineAnimal) => void;
  onDeleteAnimal: (id: string) => void;
  onSelectAnimalForTwin: (animal: SwineAnimal) => void;
}

const BREED_OPTIONS: SwineBreedLineage[] = [
  'Landrace',
  'Large White',
  'Duroc',
  'Pietrain',
  'Camborough (Agroceres PIC)',
  'Topigs Norsvin (TN70)',
  'DanBred',
  'Choice Genetics',
  'Moura (Crioulo)',
  'Mestiço Comercial',
];

const CATEGORY_OPTIONS: SwineCategory[] = [
  'Matriz Gestante',
  'Matriz Lactante',
  'Matriz Vazia / Pré-Cobertura',
  'Marrã / Leitoa de Reposição',
  'Cachaço / Rufião',
  'Leitão na Maternidade',
  'Leitão na Creche',
  'Suíno em Crescimento',
  'Suíno em Terminação',
];

const STATUS_OPTIONS: SwineStatus[] = [
  'Ativo',
  'Em Cobertura / IA',
  'Gestante',
  'Em Lactação',
  'Seca / Desmamada',
  'Quarentena',
  'Tratamento / Enfermaria',
  'Pronto para Abate',
];

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
  const [editingAnimal, setEditingAnimal] = useState<SwineAnimal | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form state
  const [formCode, setFormCode] = useState('');
  const [formRfid, setFormRfid] = useState('');
  const [formName, setFormName] = useState('');
  const [formSex, setFormSex] = useState<SwineSex>('Fêmea');
  const [formBreed, setFormBreed] = useState<SwineBreedLineage>('Landrace');
  const [formCategory, setFormCategory] = useState<SwineCategory>('Matriz Gestante');
  const [formStatus, setFormStatus] = useState<SwineStatus>('Gestante');
  const [formBirthDate, setFormBirthDate] = useState(getTodayIsoDate());
  const [formCurrentWeight, setFormCurrentWeight] = useState(210);
  const [formEcc, setFormEcc] = useState(3.0);
  const [formTeatCount, setFormTeatCount] = useState(16);
  const [formOrigin, setFormOrigin] = useState('Nascido na Fazenda');
  const [formPenNumber, setFormPenNumber] = useState('Baia 01');
  const [formNotes, setFormNotes] = useState('');

  useEscapeClose(isModalOpen, () => setIsModalOpen(false));

  const filteredAnimals = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return animals.filter(a => {
      const matchesSearch =
        !term ||
        a.code.toLowerCase().includes(term) ||
        (a.name && a.name.toLowerCase().includes(term)) ||
        (a.rfidOrQrCode && a.rfidOrQrCode.toLowerCase().includes(term));
      const matchesSex = selectedSex === 'all' || a.sex === selectedSex;
      const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
      const matchesBreed = selectedBreed === 'all' || a.breed === selectedBreed;
      return matchesSearch && matchesSex && matchesCategory && matchesBreed;
    });
  }, [animals, searchTerm, selectedSex, selectedCategory, selectedBreed]);

  const openCreateModal = () => {
    setEditingAnimal(null);
    setFormCode('');
    setFormRfid('');
    setFormName('');
    setFormSex('Fêmea');
    setFormBreed('Landrace');
    setFormCategory('Matriz Gestante');
    setFormStatus('Gestante');
    setFormBirthDate(getTodayIsoDate());
    setFormCurrentWeight(210);
    setFormEcc(3.0);
    setFormTeatCount(16);
    setFormOrigin('Nascido na Fazenda');
    setFormPenNumber('Baia 01');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (animal: SwineAnimal) => {
    setEditingAnimal(animal);
    setFormCode(animal.code);
    setFormRfid(animal.rfidOrQrCode ?? '');
    setFormName(animal.name ?? '');
    setFormSex(animal.sex);
    setFormBreed(animal.breed);
    setFormCategory(animal.category);
    setFormStatus(animal.status);
    setFormBirthDate(animal.birthDate);
    setFormCurrentWeight(animal.currentWeightKg);
    setFormEcc(animal.bodyConditionScore);
    setFormTeatCount(animal.teatCount ?? 14);
    setFormOrigin(animal.origin);
    setFormPenNumber(animal.currentPenNumber ?? '');
    setFormNotes(animal.notes ?? '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim()) return;
    const today = getTodayIsoDate();

    if (editingAnimal) {
      const updated: SwineAnimal = {
        ...editingAnimal,
        code: formCode.trim().toUpperCase(),
        rfidOrQrCode: formRfid.trim() || editingAnimal.rfidOrQrCode,
        name: formName.trim() || undefined,
        sex: formSex,
        breed: formBreed,
        category: formCategory,
        status: formStatus,
        birthDate: formBirthDate,
        origin: formOrigin.trim() || 'Nascido na Fazenda',
        currentWeightKg: Number(formCurrentWeight) || 0,
        bodyConditionScore: Number(formEcc) || 3,
        teatCount: Number(formTeatCount) || undefined,
        currentPenNumber: formPenNumber.trim() || undefined,
        notes: formNotes.trim() || undefined,
      };
      onUpdateAnimal(updated);
      setIsModalOpen(false);
      setEditingAnimal(null);
      return;
    }

    const weightVal = Number(formCurrentWeight) || 0;
    const newAnimal: SwineAnimal = {
      id: `swine_${Date.now()}`,
      code: formCode.trim().toUpperCase(),
      rfidOrQrCode: formRfid.trim() || `RFID-${Date.now().toString().slice(-8)}`,
      name: formName.trim() || undefined,
      sex: formSex,
      breed: formBreed,
      category: formCategory,
      status: formStatus,
      birthDate: formBirthDate,
      entryDate: today,
      origin: formOrigin.trim() || 'Nascido na Fazenda',
      initialWeightKg: weightVal,
      currentWeightKg: weightVal,
      bodyConditionScore: Number(formEcc) || 3,
      teatCount: Number(formTeatCount) || undefined,
      currentPenNumber: formPenNumber.trim() || 'Baia 01',
      weighingHistory: [
        {
          id: `w_${Date.now()}`,
          date: today,
          weightKg: weightVal,
          bodyConditionScore: Number(formEcc) || 3,
        },
      ],
      healthHistory: [],
      reproductionHistory: [],
      movements: [
        {
          id: `m_${Date.now()}`,
          date: today,
          fromLocation: 'Entrada / Quarentena',
          toLocation: formPenNumber.trim() || 'Baia 01',
          reason: 'Troca de Baia',
          operator: 'Responsável Técnico',
        },
      ],
      notes: formNotes.trim() || undefined,
    };

    onAddAnimal(newAnimal);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`${SWINE_CARD_CLASS} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Cadastro & Plantel Individual</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Fichas zootécnicas de matrizes, marrãs, cachaços e animais com identificação por brinco ou RFID.
          </p>
        </div>

        <button type="button" onClick={openCreateModal} className={`${SWINE_PRIMARY_BTN_CLASS} shrink-0`}>
          <Plus className="w-3.5 h-3.5" />
          <span>Cadastrar Suíno</span>
        </button>
      </div>

      {/* Filters */}
      <div className={`${SWINE_CARD_CLASS} p-3`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar brinco, nome ou RFID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`${SWINE_INPUT_CLASS} pl-8`}
            />
          </div>

          <select
            value={selectedSex}
            onChange={e => setSelectedSex(e.target.value)}
            className={SWINE_INPUT_CLASS}
          >
            <option value="all">Todos os sexos</option>
            <option value="Fêmea">Fêmea</option>
            <option value="Cachaço (Reprodutor)">Cachaço (Reprodutor)</option>
            <option value="Macho Castrado">Macho Castrado</option>
          </select>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className={SWINE_INPUT_CLASS}
          >
            <option value="all">Todas as categorias</option>
            {CATEGORY_OPTIONS.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={selectedBreed}
            onChange={e => setSelectedBreed(e.target.value)}
            className={SWINE_INPUT_CLASS}
          >
            <option value="all">Todas as linhagens</option>
            {BREED_OPTIONS.map(b => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredAnimals.length === 0 ? (
        <div className={`${SWINE_CARD_CLASS} p-10 text-center space-y-2`}>
          <Users className="w-8 h-8 text-slate-400 dark:text-zinc-500 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
            Nenhum suíno encontrado
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Ajuste os filtros de busca ou cadastre um novo animal no plantel.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredAnimals.map(animal => (
            <div key={animal.id} className={`${SWINE_CARD_CLASS} p-4 space-y-3`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center justify-center font-semibold text-xs shrink-0">
                    {animal.code.slice(0, 3)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                        {animal.code}
                      </h3>
                      {animal.name && (
                        <span className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                          ({animal.name})
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block truncate">
                      {animal.breed} · {animal.sex}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-md shrink-0 ${getSwineStatusBadgeClass(animal.status)}`}
                >
                  {animal.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className={`${SWINE_SUBCARD_CLASS} p-2`}>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Peso</span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                    {animal.currentWeightKg} kg
                  </span>
                </div>
                <div className={`${SWINE_SUBCARD_CLASS} p-2`}>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">ECC</span>
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                    {animal.bodyConditionScore} / 5
                  </span>
                </div>
                <div className={`${SWINE_SUBCARD_CLASS} p-2`}>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Tetos</span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                    {animal.teatCount ?? '—'}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-zinc-400 space-y-1">
                <div className="flex justify-between gap-2">
                  <span>Localização</span>
                  <span className="font-medium text-slate-800 dark:text-zinc-200 truncate">
                    {animal.currentPenNumber || 'Não definida'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span>RFID</span>
                  <span className="font-mono text-[11px] text-slate-700 dark:text-zinc-300 truncate">
                    {animal.rfidOrQrCode || 'Sem tag'}
                  </span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectAnimalForTwin(animal)}
                  className={SWINE_SECONDARY_BTN_CLASS}
                >
                  <Cpu className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>Gêmeo Digital</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(animal)}
                    className="h-8 w-8 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                    title="Editar suíno"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {confirmDeleteId === animal.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteAnimal(animal.id);
                          setConfirmDeleteId(null);
                        }}
                        className="h-8 px-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-medium cursor-pointer"
                      >
                        Excluir
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="h-8 px-2 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 text-[11px] cursor-pointer"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(animal.id)}
                      className="h-8 w-8 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center transition-colors cursor-pointer"
                      title="Excluir suíno"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-zinc-950/60 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-2xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                {editingAnimal ? `Editar Suíno ${editingAnimal.code}` : 'Novo Cadastro de Suíno'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={SWINE_LABEL_CLASS}>Brinco / Código *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: MTZ-1090"
                    value={formCode}
                    onChange={e => setFormCode(e.target.value)}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className={SWINE_LABEL_CLASS}>RFID / QR Code</label>
                  <input
                    type="text"
                    placeholder="Ex: RFID-982000412895"
                    value={formRfid}
                    onChange={e => setFormRfid(e.target.value)}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className={SWINE_LABEL_CLASS}>Nome / Apelido</label>
                  <input
                    type="text"
                    placeholder="Opcional"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className={SWINE_LABEL_CLASS}>Sexo *</label>
                  <select
                    value={formSex}
                    onChange={e => setFormSex(e.target.value as SwineSex)}
                    className={SWINE_INPUT_CLASS}
                  >
                    <option value="Fêmea">Fêmea</option>
                    <option value="Cachaço (Reprodutor)">Cachaço (Reprodutor)</option>
                    <option value="Macho Castrado">Macho Castrado</option>
                  </select>
                </div>

                <div>
                  <label className={SWINE_LABEL_CLASS}>Raça / Linhagem *</label>
                  <select
                    value={formBreed}
                    onChange={e => setFormBreed(e.target.value as SwineBreedLineage)}
                    className={SWINE_INPUT_CLASS}
                  >
                    {BREED_OPTIONS.map(b => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={SWINE_LABEL_CLASS}>Categoria *</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as SwineCategory)}
                    className={SWINE_INPUT_CLASS}
                  >
                    {CATEGORY_OPTIONS.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={SWINE_LABEL_CLASS}>Status *</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as SwineStatus)}
                    className={SWINE_INPUT_CLASS}
                  >
                    {STATUS_OPTIONS.map(st => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={SWINE_LABEL_CLASS}>Data de Nascimento</label>
                  <input
                    type="date"
                    value={formBirthDate}
                    onChange={e => setFormBirthDate(e.target.value)}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className={SWINE_LABEL_CLASS}>Peso Atual (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formCurrentWeight}
                    onChange={e => setFormCurrentWeight(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className={SWINE_LABEL_CLASS}>Escore Corporal (ECC 1–5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formEcc}
                    onChange={e => setFormEcc(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className={SWINE_LABEL_CLASS}>Tetos Viáveis</label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={formTeatCount}
                    onChange={e => setFormTeatCount(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className={SWINE_LABEL_CLASS}>Baia / Localização</label>
                  <input
                    type="text"
                    placeholder="Ex: Gestação Baia 04"
                    value={formPenNumber}
                    onChange={e => setFormPenNumber(e.target.value)}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={SWINE_LABEL_CLASS}>Origem</label>
                  <input
                    type="text"
                    placeholder="Ex: Nascido na Fazenda ou Granja Multiplicadora"
                    value={formOrigin}
                    onChange={e => setFormOrigin(e.target.value)}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
              </div>

              <div>
                <label className={SWINE_LABEL_CLASS}>Observações Técnicas</label>
                <textarea
                  rows={2}
                  placeholder="Informações genéticas, docilidade ou histórico..."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className={SWINE_TEXTAREA_CLASS}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={SWINE_SECONDARY_BTN_CLASS}
                >
                  Cancelar
                </button>
                <button type="submit" className={SWINE_PRIMARY_BTN_CLASS}>
                  {editingAnimal ? 'Salvar Alterações' : 'Salvar Suíno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
