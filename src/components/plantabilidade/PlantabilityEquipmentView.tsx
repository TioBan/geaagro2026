import React, { useState, useEffect } from 'react';
import { PlanterEquipment, ComponentMaintenanceStatus, MeterType } from '../../types/plantability';
import { Tractor, Plus, Wrench, Pencil, Trash2, X } from 'lucide-react';

interface Props {
  planters: PlanterEquipment[];
  maintenanceLogs: ComponentMaintenanceStatus[];
  onSavePlanter: (planter: PlanterEquipment) => void;
  onDeletePlanter?: (id: string) => void;
  onSaveMaintenance: (maint: ComponentMaintenanceStatus) => void;
}

const createEmptyPlanter = (): Partial<PlanterEquipment> => ({
  brand: '',
  model: '',
  rowsCount: 12,
  rowSpacingMeters: 0.45,
  meterType: 'Pneumático (Vácuo)',
  discSpecification: '',
  componentsCondition: 'Excelente',
  springPressureSetting: 'Média',
  strawCuttingSystem: 'Disco Turbo',
  notes: ''
});

const createEmptyMaint = (planterId: string): Partial<ComponentMaintenanceStatus> => ({
  planterId,
  componentName: 'Discos de Corte',
  wearConditionPct: 0,
  lastInspectionDate: new Date().toISOString().split('T')[0],
  actionTaken: 'Inspeção Normal',
  hoursWorked: 0,
  hectaresWorked: 0,
  nextReplacementEstHectares: 1000
});

const inputClass =
  'w-full h-9 px-3 mt-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500';

export const PlantabilityEquipmentView: React.FC<Props> = ({
  planters,
  maintenanceLogs,
  onSavePlanter,
  onDeletePlanter,
  onSaveMaintenance
}) => {
  const safePlanters = (planters || []).filter(p => p && p.id);
  const [showPlanterModal, setShowPlanterModal] = useState(false);
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [planterForm, setPlanterForm] = useState<Partial<PlanterEquipment>>(createEmptyPlanter);
  const [maintForm, setMaintForm] = useState<Partial<ComponentMaintenanceStatus>>(() =>
    createEmptyMaint(safePlanters[0]?.id || '')
  );

  useEffect(() => {
    if (!showPlanterModal && !showMaintModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowPlanterModal(false);
        setShowMaintModal(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showPlanterModal, showMaintModal]);

  const openNewPlanter = () => {
    setPlanterForm(createEmptyPlanter());
    setShowPlanterModal(true);
  };

  const openEditPlanter = (p: PlanterEquipment) => {
    setPlanterForm({ ...p });
    setShowPlanterModal(true);
  };

  const openMaintModal = (planterId?: string) => {
    const resolvedId = planterId || safePlanters[0]?.id || '';
    setMaintForm(createEmptyMaint(resolvedId));
    setShowMaintModal(true);
  };

  const handlePlanterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planterForm.brand?.trim() || !planterForm.model?.trim()) return;

    const newPlanter: PlanterEquipment = {
      id: planterForm.id || `plt-${Date.now()}`,
      brand: planterForm.brand.trim(),
      model: planterForm.model.trim(),
      rowsCount: Number(planterForm.rowsCount) || 12,
      rowSpacingMeters: Number(planterForm.rowSpacingMeters) || 0.45,
      meterType: (planterForm.meterType as MeterType) || 'Pneumático (Vácuo)',
      discSpecification: planterForm.discSpecification?.trim() || 'Disco Padrão',
      componentsCondition: planterForm.componentsCondition || 'Boa',
      springPressureSetting: planterForm.springPressureSetting || 'Média',
      strawCuttingSystem: planterForm.strawCuttingSystem || 'Disco Turbo',
      notes: planterForm.notes?.trim()
    };

    onSavePlanter(newPlanter);
    setShowPlanterModal(false);
    setPlanterForm(createEmptyPlanter());
  };

  const handleMaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPlanterId = maintForm.planterId || safePlanters[0]?.id || '';
    const newMaint: ComponentMaintenanceStatus = {
      id: maintForm.id || `maint-${Date.now()}`,
      planterId: targetPlanterId,
      componentName: maintForm.componentName || 'Discos de Corte',
      wearConditionPct: Math.min(100, Math.max(0, Number(maintForm.wearConditionPct) || 0)),
      lastInspectionDate: maintForm.lastInspectionDate || new Date().toISOString().split('T')[0],
      actionTaken: maintForm.actionTaken || 'Inspeção Normal',
      hoursWorked: Number(maintForm.hoursWorked) || 0,
      hectaresWorked: Number(maintForm.hectaresWorked) || 0,
      nextReplacementEstHectares: Number(maintForm.nextReplacementEstHectares) || 1000
    };

    onSaveMaintenance(newMaint);
    setShowMaintModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Tractor className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Plantadeiras & Monitoramento de Componentes</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Controle de dosadores, discos, molas, condutos e acompanhamento de desgaste em campo.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => openMaintModal()}
            disabled={safePlanters.length === 0}
            className="h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-500" />
            <span>Inspeção / Desgaste</span>
          </button>
          <button
            type="button"
            onClick={openNewPlanter}
            className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar Máquina</span>
          </button>
        </div>
      </div>

      {/* Equipment List or Empty State */}
      {safePlanters.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-3">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Tractor className="w-5 h-5" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Nenhuma semeadora cadastrada
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Cadastre plantadeiras, número de linhas, dosadores e componentes para monitoramento de desgaste.
            </p>
          </div>
          <button
            type="button"
            onClick={openNewPlanter}
            className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar Primeira Máquina</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safePlanters.map(p => {
            const planterLogs = (maintenanceLogs || []).filter(m => m?.planterId === p.id);
            const workingWidth = Number((p.rowsCount * p.rowSpacingMeters).toFixed(2));

            return (
              <div
                key={p.id}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-3.5"
              >
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 block">
                      {p.brand}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                      {p.model}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
                      {p.rowsCount} linhas × {p.rowSpacingMeters} m ({workingWidth} m úteis)
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/70 dark:border-emerald-900/60">
                      {p.componentsCondition}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEditPlanter(p)}
                      title="Editar máquina"
                      className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 inline-flex items-center justify-center cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {onDeletePlanter && (
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmDeleteId(confirmDeleteId === p.id ? null : p.id)
                        }
                        title="Remover máquina"
                        className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {confirmDeleteId === p.id && onDeletePlanter && (
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs">
                    <span className="text-rose-700 dark:text-rose-300 font-medium">Excluir semeadora?</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="h-7 px-2 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 text-[11px] font-medium cursor-pointer"
                      >
                        Não
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeletePlanter(p.id);
                          setConfirmDeleteId(null);
                        }}
                        className="h-7 px-2 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-medium cursor-pointer"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/70 dark:bg-zinc-950/60 p-3 rounded-lg border border-slate-200/70 dark:border-zinc-800">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase block">Dosador</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-100">{p.meterType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase block">Disco</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-100">{p.discSpecification}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase block">Pressão Molas</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-100">{p.springPressureSetting}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase block">Corte de Palha</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-100">{p.strawCuttingSystem}</span>
                  </div>
                </div>

                {/* Component Wear Logs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-amber-500" />
                      <span>Desgaste dos Componentes</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => openMaintModal(p.id)}
                      className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      + Registrar inspeção
                    </button>
                  </div>

                  {planterLogs.length === 0 ? (
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                      Nenhum histórico de desgaste registrado.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {planterLogs.map(m => (
                        <div
                          key={m.id}
                          className="p-2.5 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 space-y-1.5 text-xs"
                        >
                          <div className="flex justify-between items-center font-medium">
                            <span className="text-slate-900 dark:text-white">{m.componentName}</span>
                            <span
                              className={`text-[11px] font-semibold tabular-nums ${
                                m.wearConditionPct > 70
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : m.wearConditionPct > 40
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              Desgaste: {m.wearConditionPct}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-sm overflow-hidden">
                            <div
                              className={`h-full ${
                                m.wearConditionPct > 70
                                  ? 'bg-rose-600'
                                  : m.wearConditionPct > 40
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, m.wearConditionPct))}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 dark:text-zinc-400 tabular-nums">
                            <span>
                              {m.actionTaken} ({m.lastInspectionDate})
                            </span>
                            <span>
                              {m.hectaresWorked} / {m.nextReplacementEstHectares} ha est.
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Planter Modal */}
      {showPlanterModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setShowPlanterModal(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Tractor className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{planterForm.id ? 'Editar Semeadora' : 'Cadastrar Semeadora / Plantadeira'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPlanterModal(false)}
                className="h-7 w-7 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePlanterSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Marca</label>
                  <input
                    type="text"
                    required
                    value={planterForm.brand || ''}
                    onChange={e => setPlanterForm({ ...planterForm, brand: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Modelo</label>
                  <input
                    type="text"
                    required
                    value={planterForm.model || ''}
                    onChange={e => setPlanterForm({ ...planterForm, model: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Nº de Linhas</label>
                  <input
                    type="number"
                    min="1"
                    value={planterForm.rowsCount ?? 12}
                    onChange={e => setPlanterForm({ ...planterForm, rowsCount: Number(e.target.value) })}
                    className={`${inputClass} tabular-nums`}
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Espaçamento (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={planterForm.rowSpacingMeters ?? 0.45}
                    onChange={e =>
                      setPlanterForm({ ...planterForm, rowSpacingMeters: Number(e.target.value) })
                    }
                    className={`${inputClass} tabular-nums`}
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Condição Geral</label>
                  <select
                    value={planterForm.componentsCondition || 'Excelente'}
                    onChange={e =>
                      setPlanterForm({
                        ...planterForm,
                        componentsCondition: e.target.value as PlanterEquipment['componentsCondition']
                      })
                    }
                    className={inputClass}
                  >
                    <option value="Excelente">Excelente</option>
                    <option value="Boa">Boa</option>
                    <option value="Regular">Regular</option>
                    <option value="Ruim">Ruim</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Tipo de Dosador</label>
                  <select
                    value={planterForm.meterType || 'Pneumático (Vácuo)'}
                    onChange={e => setPlanterForm({ ...planterForm, meterType: e.target.value as MeterType })}
                    className={inputClass}
                  >
                    <option value="Pneumático (Vácuo)">Pneumático (Vácuo)</option>
                    <option value="Dosador Elétrico (E-Drive)">Dosador Elétrico (E-Drive)</option>
                    <option value="Disco Mecânico Alveolado">Disco Mecânico Alveolado</option>
                    <option value="Pneumático (Pressão)">Pneumático (Pressão)</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Especificação do Disco</label>
                  <input
                    type="text"
                    value={planterForm.discSpecification || ''}
                    onChange={e => setPlanterForm({ ...planterForm, discSpecification: e.target.value })}
                    placeholder="Ex: Disco 28 furos 4,5 mm"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Pressão das Molas</label>
                  <select
                    value={planterForm.springPressureSetting || 'Média'}
                    onChange={e =>
                      setPlanterForm({
                        ...planterForm,
                        springPressureSetting: e.target.value as PlanterEquipment['springPressureSetting']
                      })
                    }
                    className={inputClass}
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Pneumática">Pneumática / Hidráulica</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Corte de Palha</label>
                  <select
                    value={planterForm.strawCuttingSystem || 'Disco Turbo'}
                    onChange={e =>
                      setPlanterForm({
                        ...planterForm,
                        strawCuttingSystem: e.target.value as PlanterEquipment['strawCuttingSystem']
                      })
                    }
                    className={inputClass}
                  >
                    <option value="Disco Liso">Disco Liso</option>
                    <option value="Disco Corrugado">Disco Corrugado</option>
                    <option value="Disco Turbo">Disco Turbo</option>
                    <option value="Duplo Disco Limpador">Duplo Disco Limpador</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowPlanterModal(false)}
                  className="h-9 px-3.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium cursor-pointer"
                >
                  Salvar Máquina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setShowMaintModal(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-500" />
                <span>Regulagem & Inspeção de Componentes</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowMaintModal(false)}
                className="h-7 w-7 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMaintSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-600 dark:text-zinc-300">Plantadeira</label>
                <select
                  value={maintForm.planterId || ''}
                  onChange={e => setMaintForm({ ...maintForm, planterId: e.target.value })}
                  className={inputClass}
                >
                  {safePlanters.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.brand} {p.model} ({p.rowsCount} linhas)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-600 dark:text-zinc-300">Componente</label>
                <select
                  value={maintForm.componentName || 'Discos de Corte'}
                  onChange={e =>
                    setMaintForm({
                      ...maintForm,
                      componentName: e.target.value as ComponentMaintenanceStatus['componentName']
                    })
                  }
                  className={inputClass}
                >
                  <option value="Discos de Corte">Discos de Corte</option>
                  <option value="Discos Duplos Sulcadores">Discos Duplos Sulcadores</option>
                  <option value="Rodas Limitadoras de Profundidade">Rodas Limitadoras de Profundidade</option>
                  <option value="Rodas Compactadoras V">Rodas Compactadoras V</option>
                  <option value="Molas de Pressão">Molas de Pressão</option>
                  <option value="Dosadores de Semente">Dosadores de Semente</option>
                  <option value="Tubos Condutores (Condutos)">Tubos Condutores (Condutos)</option>
                  <option value="Mancais e Rolamentos">Mancais e Rolamentos</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Desgaste Estimado (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={maintForm.wearConditionPct ?? 0}
                    onChange={e =>
                      setMaintForm({ ...maintForm, wearConditionPct: Number(e.target.value) })
                    }
                    className={`${inputClass} tabular-nums`}
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Ação Realizada</label>
                  <select
                    value={maintForm.actionTaken || 'Inspeção Normal'}
                    onChange={e =>
                      setMaintForm({
                        ...maintForm,
                        actionTaken: e.target.value as ComponentMaintenanceStatus['actionTaken']
                      })
                    }
                    className={inputClass}
                  >
                    <option value="Inspeção Normal">Inspeção Normal</option>
                    <option value="Regulagem Efetuada">Regulagem Efetuada</option>
                    <option value="Componente Substituído">Componente Substituído</option>
                    <option value="Limpeza Geral">Limpeza Geral</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Hectares Trabalhados</label>
                  <input
                    type="number"
                    min="0"
                    value={maintForm.hectaresWorked ?? 0}
                    onChange={e => setMaintForm({ ...maintForm, hectaresWorked: Number(e.target.value) })}
                    className={`${inputClass} tabular-nums`}
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Vida Útil Estimada (ha)</label>
                  <input
                    type="number"
                    min="1"
                    value={maintForm.nextReplacementEstHectares ?? 1000}
                    onChange={e =>
                      setMaintForm({ ...maintForm, nextReplacementEstHectares: Number(e.target.value) })
                    }
                    className={`${inputClass} tabular-nums`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowMaintModal(false)}
                  className="h-9 px-3.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium cursor-pointer"
                >
                  Registrar Inspeção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
