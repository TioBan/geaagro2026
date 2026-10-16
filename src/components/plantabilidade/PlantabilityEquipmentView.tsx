import React, { useState } from 'react';
import { PlanterEquipment, ComponentMaintenanceStatus, MeterType } from '../../types/plantability';
import { Tractor, Plus, Wrench, ShieldAlert, CheckCircle2, Sliders, Layers } from 'lucide-react';

interface Props {
  planters: PlanterEquipment[];
  maintenanceLogs: ComponentMaintenanceStatus[];
  onSavePlanter: (planter: PlanterEquipment) => void;
  onSaveMaintenance: (maint: ComponentMaintenanceStatus) => void;
}

export const PlantabilityEquipmentView: React.FC<Props> = ({
  planters,
  maintenanceLogs,
  onSavePlanter,
  onSaveMaintenance
}) => {
  const [showPlanterModal, setShowPlanterModal] = useState(false);
  const [showMaintModal, setShowMaintModal] = useState(false);

  const [planterForm, setPlanterForm] = useState<Partial<PlanterEquipment>>({
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

  const [maintForm, setMaintForm] = useState<Partial<ComponentMaintenanceStatus>>({
    planterId: planters.length > 0 ? planters[0]?.id || '' : '',
    componentName: 'Discos de Corte',
    wearConditionPct: 0,
    lastInspectionDate: new Date().toISOString().split('T')[0],
    actionTaken: 'Inspeção Normal',
    hoursWorked: 0,
    hectaresWorked: 0,
    nextReplacementEstHectares: 1000
  });

  const handlePlanterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planterForm.brand || !planterForm.model) return;

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
    setPlanterForm({
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
  };

  const handleMaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMaint: ComponentMaintenanceStatus = {
      id: maintForm.id || `maint-${Date.now()}`,
      planterId: maintForm.planterId || (planters.length > 0 ? planters[0]?.id || '' : ''),
      componentName: maintForm.componentName || 'Discos de Corte',
      wearConditionPct: Number(maintForm.wearConditionPct) || 10,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Tractor className="w-6 h-6 text-emerald-600" />
            Cadastro de Plantadeiras & Monitoramento de Componentes
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Controle de dosadores, discos, molas, condutos e acompanhamento de desgaste para prevenir falhas de semeadura em campo.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowMaintModal(true)}
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-800 dark:text-stone-200 font-bold text-xs rounded-xl border border-stone-200 dark:border-zinc-700 transition-all flex items-center gap-2"
          >
            <Wrench className="w-4 h-4 text-amber-500" />
            Regulagem & Inspeção
          </button>
          <button
            onClick={() => setShowPlanterModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Máquina
          </button>
        </div>
      </div>

      {/* Equipment List or Empty State */}
      {planters.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
            <Tractor className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-black text-stone-900 dark:text-white">Nenhuma semeadora cadastrada</h3>
            <p className="text-xs text-stone-500">
              Cadastre suas plantadeiras, número de linhas, dosadores (pneumáticos ou mecânicos) e componentes para controle de manutenção.
            </p>
          </div>
          <button
            onClick={() => setShowPlanterModal(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Primeira Máquina
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(planters || []).filter(p => p && p.id).map(p => {
          const planterLogs = (maintenanceLogs || []).filter(m => m?.planterId === p.id);

          return (
            <div key={p.id} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex justify-between items-start border-b border-stone-100 dark:border-zinc-800 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                    {p.brand}
                  </span>
                  <h3 className="text-lg font-black text-stone-900 dark:text-white mt-1">{p.model}</h3>
                  <p className="text-xs text-stone-500">{p.rowsCount} linhas x {p.rowSpacingMeters}m ({p.rowsCount * p.rowSpacingMeters}m de largura útil)</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    Condição: {p.componentsCondition}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-stone-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-stone-100 dark:border-zinc-700">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase block font-bold">Tipo de Dosador</span>
                  <span className="font-bold text-stone-800 dark:text-stone-100">{p.meterType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 uppercase block font-bold">Disco Utilizado</span>
                  <span className="font-bold text-stone-800 dark:text-stone-100">{p.discSpecification}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 uppercase block font-bold">Pressão de Molas</span>
                  <span className="font-bold text-stone-800 dark:text-stone-100">{p.springPressureSetting}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 uppercase block font-bold">Corte de Palha</span>
                  <span className="font-bold text-stone-800 dark:text-stone-100">{p.strawCuttingSystem}</span>
                </div>
              </div>

              {/* Maintenance Component Wear Overview */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-extrabold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-500" />
                  Monitoramento de Desgaste dos Componentes
                </h4>

                <div className="space-y-2 text-xs">
                  {planterLogs.length === 0 ? (
                    <p className="text-stone-400 italic text-[11px]">Nenhum histórico de desgaste registrado.</p>
                  ) : (
                    planterLogs.map(m => (
                      <div key={m.id} className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 space-y-1.5">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-stone-900 dark:text-white">{m.componentName}</span>
                          <span className={`text-[11px] font-mono ${
                            m.wearConditionPct > 70 ? 'text-rose-600 font-black' : m.wearConditionPct > 40 ? 'text-amber-600' : 'text-emerald-600'
                          }`}>
                            Desgaste: {m.wearConditionPct}%
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-stone-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              m.wearConditionPct > 70 ? 'bg-rose-600' : m.wearConditionPct > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${m.wearConditionPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-stone-500 pt-0.5">
                          <span>Ação: {m.actionTaken} ({m.lastInspectionDate})</span>
                          <span>Hectares: {m.hectaresWorked} / {m.nextReplacementEstHectares} ha est.</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Planter Modal */}
      {showPlanterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl max-w-lg w-full space-y-4 border border-stone-200 dark:border-zinc-800 shadow-2xl">
            <h3 className="text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
              <Tractor className="w-5 h-5 text-emerald-600" />
              Cadastrar Semeadora / Plantadeira
            </h3>

            <form onSubmit={handlePlanterSubmit} className="space-y-3 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-600 dark:text-stone-300">Marca</label>
                  <input
                    type="text"
                    required
                    value={planterForm.brand}
                    onChange={e => setPlanterForm({ ...planterForm, brand: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-stone-600 dark:text-stone-300">Modelo</label>
                  <input
                    type="text"
                    required
                    value={planterForm.model}
                    onChange={e => setPlanterForm({ ...planterForm, model: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-600 dark:text-stone-300">Número de Linhas</label>
                  <input
                    type="number"
                    value={planterForm.rowsCount}
                    onChange={e => setPlanterForm({ ...planterForm, rowsCount: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-600 dark:text-stone-300">Espaçamento entre Linhas (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={planterForm.rowSpacingMeters}
                    onChange={e => setPlanterForm({ ...planterForm, rowSpacingMeters: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-600 dark:text-stone-300">Tipo de Dosador</label>
                  <select
                    value={planterForm.meterType}
                    onChange={e => setPlanterForm({ ...planterForm, meterType: e.target.value as MeterType })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white"
                  >
                    <option value="Pneumático (Vácuo)">Pneumático (Vácuo)</option>
                    <option value="Dosador Elétrico (E-Drive)">Dosador Elétrico (E-Drive)</option>
                    <option value="Disco Mecânico Alveolado">Disco Mecânico Alveolado</option>
                    <option value="Pneumático (Pressão)">Pneumático (Pressão)</option>
                  </select>
                </div>
                <div>
                  <label className="text-stone-600 dark:text-stone-300">Especificação do Disco</label>
                  <input
                    type="text"
                    value={planterForm.discSpecification}
                    onChange={e => setPlanterForm({ ...planterForm, discSpecification: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-600 dark:text-stone-300">Pressão das Molas</label>
                  <select
                    value={planterForm.springPressureSetting}
                    onChange={e => setPlanterForm({ ...planterForm, springPressureSetting: e.target.value as any })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Pneumática">Pneumática/Hidráulica</option>
                  </select>
                </div>
                <div>
                  <label className="text-stone-600 dark:text-stone-300">Sistema de Corte de Palha</label>
                  <select
                    value={planterForm.strawCuttingSystem}
                    onChange={e => setPlanterForm({ ...planterForm, strawCuttingSystem: e.target.value as any })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white"
                  >
                    <option value="Disco Liso">Disco Liso</option>
                    <option value="Disco Corrugado">Disco Corrugado</option>
                    <option value="Disco Turbo">Disco Turbo</option>
                    <option value="Duplo Disco Limpador">Duplo Disco Limpador</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPlanterModal(false)}
                  className="px-4 py-2 bg-stone-200 dark:bg-zinc-800 text-stone-800 dark:text-stone-200 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl max-w-lg w-full space-y-4 border border-stone-200 dark:border-zinc-800 shadow-2xl">
            <h3 className="text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-500" />
              Regulagem & Inspeção de Componentes
            </h3>

            <form onSubmit={handleMaintSubmit} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="text-stone-600 dark:text-stone-300">Componente</label>
                <select
                  value={maintForm.componentName}
                  onChange={e => setMaintForm({ ...maintForm, componentName: e.target.value as any })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-600 dark:text-stone-300">Desgaste Estimado (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={maintForm.wearConditionPct}
                    onChange={e => setMaintForm({ ...maintForm, wearConditionPct: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-600 dark:text-stone-300">Ação Realizada</label>
                  <select
                    value={maintForm.actionTaken}
                    onChange={e => setMaintForm({ ...maintForm, actionTaken: e.target.value as any })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white"
                  >
                    <option value="Inspeção Normal">Inspeção Normal</option>
                    <option value="Regulagem Efetuada">Regulagem Efetuada</option>
                    <option value="Componente Substituído">Componente Substituído</option>
                    <option value="Limpeza Geral">Limpeza Geral</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-600 dark:text-stone-300">Hectares Trabalhados</label>
                  <input
                    type="number"
                    value={maintForm.hectaresWorked}
                    onChange={e => setMaintForm({ ...maintForm, hectaresWorked: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-600 dark:text-stone-300">Vida Útil Estimada (ha)</label>
                  <input
                    type="number"
                    value={maintForm.nextReplacementEstHectares}
                    onChange={e => setMaintForm({ ...maintForm, nextReplacementEstHectares: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMaintModal(false)}
                  className="px-4 py-2 bg-stone-200 dark:bg-zinc-800 text-stone-800 dark:text-stone-200 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md"
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
