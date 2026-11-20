import React, { useMemo, useState } from 'react';
import { BuffaloFacility } from '../../types/buffalo';
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  X,
  Calendar,
  Ruler,
  Users,
} from 'lucide-react';

interface BuffaloFacilitiesViewProps {
  facilities: BuffaloFacility[];
  onSaveFacility: (facility: BuffaloFacility) => void;
  onDeleteFacility: (facilityId: string) => void;
}

const FACILITY_TYPES: BuffaloFacility['type'][] = [
  'Curral Anti-Estresse',
  'Tronco de Contenção & Balança',
  'Sala de Ordenha Mecânica',
  'Sombrite Artificial',
  'Açude / Ponto de Banho',
  'Cocheira de Suplementação',
  'Cerca Elétrica Reforçada',
  'Bezerreiro / Maternidade',
];

const CONDITIONS: BuffaloFacility['condition'][] = [
  'Excelente',
  'Bom',
  'Necessita Reparo',
  'Crítico',
];

const todayIso = () => new Date().toISOString().split('T')[0];

interface FacilityFormState {
  name: string;
  type: BuffaloFacility['type'];
  dimensions: string;
  capacityAnimals: number;
  condition: BuffaloFacility['condition'];
  lastInspectionDate: string;
  nextMaintenanceDate: string;
  featuresText: string;
  notes: string;
}

const emptyFacilityForm = (): FacilityFormState => ({
  name: '',
  type: 'Curral Anti-Estresse',
  dimensions: '',
  capacityAnimals: 40,
  condition: 'Bom',
  lastInspectionDate: todayIso(),
  nextMaintenanceDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
  featuresText: '',
  notes: '',
});

const getConditionClass = (condition: BuffaloFacility['condition']) => {
  switch (condition) {
    case 'Excelente':
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
    case 'Bom':
      return 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/60';
    case 'Necessita Reparo':
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
    default:
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
  }
};

export const BuffaloFacilitiesView: React.FC<BuffaloFacilitiesViewProps> = ({
  facilities,
  onSaveFacility,
  onDeleteFacility,
}) => {
  const [conditionFilter, setConditionFilter] = useState<string>('todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FacilityFormState>(emptyFacilityForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const metrics = useMemo(() => {
    const totalCapacity = facilities.reduce((sum, f) => sum + (f.capacityAnimals || 0), 0);
    const attentionCount = facilities.filter(
      (f) => f.condition === 'Necessita Reparo' || f.condition === 'Crítico'
    ).length;
    return {
      total: facilities.length,
      totalCapacity,
      attentionCount,
    };
  }, [facilities]);

  const filteredFacilities = useMemo(() => {
    if (conditionFilter === 'todas') return facilities;
    return facilities.filter((f) => f.condition === conditionFilter);
  }, [facilities, conditionFilter]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyFacilityForm());
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (fac: BuffaloFacility) => {
    setEditingId(fac.id);
    setForm({
      name: fac.name,
      type: fac.type,
      dimensions: fac.dimensions,
      capacityAnimals: fac.capacityAnimals,
      condition: fac.condition,
      lastInspectionDate: fac.lastInspectionDate,
      nextMaintenanceDate: fac.nextMaintenanceDate,
      featuresText: fac.features.join(', '),
      notes: fac.notes || '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Informe o nome da instalação.');
      return;
    }

    const features = form.featuresText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onSaveFacility({
      id: editingId || `fac-${Date.now()}`,
      name: form.name.trim(),
      type: form.type,
      dimensions: form.dimensions.trim() || 'Não informado',
      capacityAnimals: Math.max(0, Number(form.capacityAnimals) || 0),
      condition: form.condition,
      lastInspectionDate: form.lastInspectionDate || todayIso(),
      nextMaintenanceDate: form.nextMaintenanceDate || todayIso(),
      features,
      notes: form.notes.trim() || undefined,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* KPI Strip */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800">
        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            Instalações Cadastradas
          </span>
          <p className="text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
            {metrics.total}
          </p>
        </div>
        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            Capacidade Total Instalada
          </span>
          <p className="text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
            {metrics.totalCapacity} cabeças
          </p>
        </div>
        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            Manutenção Pendente / Crítica
          </span>
          <p
            className={`text-lg font-semibold tabular-nums mt-0.5 ${
              metrics.attentionCount > 0
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {metrics.attentionCount}
          </p>
        </div>
      </div>

      {/* Cabeçalho e Filtros */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Infraestrutura &amp; Instalações de Manejo
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Currais reforçados, troncos, sala de ordenha, sombrites e cronograma de manutenção.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-teal-500"
          >
            <option value="todas">Todas as condições</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={openCreateModal}
            className="h-8 px-3.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Instalação
          </button>
        </div>
      </div>

      {/* Grid de Instalações */}
      {filteredFacilities.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center">
          <Building2 className="w-6 h-6 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
            Nenhuma instalação registrada para o filtro selecionado.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFacilities.map((fac) => (
            <div
              key={fac.id}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col justify-between gap-3"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
                      {fac.type}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-0.5">
                      {fac.name}
                    </h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded border shrink-0 ${getConditionClass(
                      fac.condition
                    )}`}
                  >
                    {fac.condition}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-zinc-950/70 border border-slate-100 dark:border-zinc-800 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
                    <Ruler className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{fac.dimensions}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400 tabular-nums">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Capacidade: {fac.capacityAnimals} cab</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 tabular-nums text-[11px]">
                    <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>Inspeção: {fac.lastInspectionDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 tabular-nums text-[11px]">
                    <Calendar className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>Próx. manut.: {fac.nextMaintenanceDate}</span>
                  </div>
                </div>

                {fac.features.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {fac.features.map((feat, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px] rounded"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                )}

                {fac.notes && (
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">{fac.notes}</p>
                )}
              </div>

              <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => openEditModal(fac)}
                  className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                  Editar
                </button>
                {confirmDeleteId === fac.id ? (
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteFacility(fac.id);
                      setConfirmDeleteId(null);
                    }}
                    className="h-7 px-2.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium cursor-pointer"
                  >
                    Confirmar Exclusão
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(fac.id)}
                    className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 hover:border-rose-300 dark:hover:border-rose-800 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-medium text-slate-600 dark:text-zinc-400 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Excluir
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar / Editar Instalação */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-xl w-full overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                {editingId ? 'Editar Instalação' : 'Nova Instalação de Manejo'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              {formError && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs text-rose-700 dark:text-rose-300">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                    Nome da Instalação *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex: Curral Anti-Estresse Principal"
                    className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                    Tipo
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value as BuffaloFacility['type'] })
                    }
                    className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                  >
                    {FACILITY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                    Dimensões
                  </label>
                  <input
                    type="text"
                    value={form.dimensions}
                    onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                    placeholder="Ex: 24m x 16m"
                    className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                    Capacidade (cab)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.capacityAnimals}
                    onChange={(e) =>
                      setForm({ ...form, capacityAnimals: Number(e.target.value) || 0 })
                    }
                    className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                    Condição
                  </label>
                  <select
                    value={form.condition}
                    onChange={(e) =>
                      setForm({ ...form, condition: e.target.value as BuffaloFacility['condition'] })
                    }
                    className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                    Última Inspeção
                  </label>
                  <input
                    type="date"
                    value={form.lastInspectionDate}
                    onChange={(e) => setForm({ ...form, lastInspectionDate: e.target.value })}
                    className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                    Próxima Manutenção
                  </label>
                  <input
                    type="date"
                    value={form.nextMaintenanceDate}
                    onChange={(e) => setForm({ ...form, nextMaintenanceDate: e.target.value })}
                    className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                  Características / Recursos (separados por vírgula)
                </label>
                <input
                  type="text"
                  value={form.featuresText}
                  onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
                  placeholder="Ex: Piso ranhurado, Aspersores no brete, Balança eletrônica"
                  className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                  Observações
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Detalhes de estrutura, manutenção ou adequação para bubalinos..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-3.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg cursor-pointer"
                >
                  {editingId ? 'Salvar Alterações' : 'Cadastrar Instalação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
