import React, { useEffect, useState } from 'react';
import { IrrigationSystemRecord, IrrigationSystemType } from '../../types/irrigation';
import { calculateUniformityMetrics } from '../../utils/irrigationStorage';
import { Droplets, Plus, Wrench, Calculator, X } from 'lucide-react';
import {
  IRRIGATION_INPUT_CLASS,
  IRRIGATION_LABEL_CLASS,
  IRRIGATION_SYSTEM_TYPES,
} from './irrigationUi';

interface Props {
  systems: IrrigationSystemRecord[];
  onAddSystem: (system: IrrigationSystemRecord) => void;
  onUpdateSystem: (system: IrrigationSystemRecord) => void;
}

export const IrrigationSystemsView: React.FC<Props> = ({
  systems,
  onAddSystem,
  onUpdateSystem,
}) => {
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const activeSystem =
    (selectedSystemId ? systems.find((s) => s.id === selectedSystemId) : null) ||
    systems[0] ||
    null;

  // New System Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSystemName, setNewSystemName] = useState('');
  const [newPlotName, setNewPlotName] = useState('');
  const [newType, setNewType] = useState<IrrigationSystemType>('Pivô Central');
  const [newAreaHa, setNewAreaHa] = useState(75);
  const [newFlowM3h, setNewFlowM3h] = useState(220);
  const [newPressureMca, setNewPressureMca] = useState(32);
  const [newEaPct, setNewEaPct] = useState(85);
  const [newPowerKw, setNewPowerKw] = useState(90);
  const [newTariff, setNewTariff] =
    useState<IrrigationSystemRecord['energyTariffType']>('Verde');

  // CUC & CUD Calculator State
  const [catchCanDepths, setCatchCanDepths] = useState<string>(
    '12.5, 13.0, 11.8, 12.2, 11.5, 13.2, 12.0, 10.8, 12.9, 12.1, 11.9, 12.4'
  );
  const [calculatedCuc, setCalculatedCuc] = useState<number | null>(null);
  const [calculatedCud, setCalculatedCud] = useState<number | null>(null);

  useEffect(() => {
    if (!showAddModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAddModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showAddModal]);

  const handleCalculateUniformity = () => {
    const depths = catchCanDepths
      .split(',')
      .map((v) => parseFloat(v.trim()))
      .filter((v) => !Number.isNaN(v) && v > 0);

    if (depths.length > 0) {
      const res = calculateUniformityMetrics(depths);
      setCalculatedCuc(res.cuc);
      setCalculatedCud(res.cud);
    }
  };

  const handleApplyCalculatedUniformity = () => {
    if (calculatedCuc !== null && calculatedCud !== null && activeSystem) {
      onUpdateSystem({
        ...activeSystem,
        cucPercent: calculatedCuc,
        cudPercent: calculatedCud,
      });
    }
  };

  const handleCreateSystem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSystemName.trim()) return;

    const now = Date.now();
    const sysId = `sys-${now}`;
    const today = new Date().toISOString().split('T')[0];

    const newSys: IrrigationSystemRecord = {
      id: sysId,
      farmId: 'farm-01',
      farmName: 'Fazenda Principal',
      plotId: `plot-${now}`,
      plotName: newPlotName.trim() || 'Talhão Geral',
      systemName: newSystemName.trim(),
      type: newType,
      irrigatedAreaHa: newAreaHa,
      nominalFlowM3h: newFlowM3h,
      operatingPressureMca: newPressureMca,
      applicationEfficiencyPct: newEaPct,
      cucPercent: 88,
      cudPercent: 82,
      powerKw: newPowerKw,
      energyTariffType: newTariff,
      installationYear: new Date().getFullYear(),
      status: 'Ativo',
      equipments: [
        {
          id: `eq-bomb-${now}`,
          systemId: sysId,
          name: 'Conjunto Motobomba Principal',
          category: 'Bomba',
          brandModel: 'Imbil / WEG W22',
          powerCvKw: newPowerKw,
          installationDate: today,
          lastMaintenanceDate: today,
          status: 'Operacional',
        },
      ],
    };

    onAddSystem(newSys);
    setSelectedSystemId(sysId);
    setShowAddModal(false);
    setNewSystemName('');
    setNewPlotName('');
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Sistemas &amp; Equipamentos de Irrigação
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Cadastro técnico de pivôs, gotejamento, vazões, pressões e ensaio de uniformidade CUC/CUD.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo Sistema
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Systems List */}
        <div className="lg:col-span-4 space-y-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block px-0.5">
            Sistemas Cadastrados ({systems.length})
          </span>

          {systems.length === 0 ? (
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 text-center space-y-2">
              <Droplets className="w-5 h-5 text-sky-600 dark:text-sky-400 mx-auto" />
              <p className="text-xs text-slate-500 dark:text-zinc-400">Nenhum sistema cadastrado.</p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Cadastrar sistema
              </button>
            </div>
          ) : (
            systems.map((sys) => {
              const isSelected = activeSystem?.id === sys.id;
              return (
                <div
                  key={sys.id}
                  onClick={() => setSelectedSystemId(sys.id)}
                  className={`p-3.5 rounded-xl border transition-colors cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-white dark:bg-zinc-900 border-emerald-500 dark:border-emerald-600'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[11px] font-medium text-sky-700 dark:text-sky-400 block">
                        {sys.type}
                      </span>
                      <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 truncate">
                        {sys.systemName}
                      </h4>
                    </div>
                    <span
                      className={`text-[11px] font-medium shrink-0 ${
                        sys.status === 'Ativo'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {sys.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 dark:text-zinc-400 pt-2 border-t border-slate-100 dark:border-zinc-800 tabular-nums">
                    <div>
                      Área: <strong className="text-slate-900 dark:text-zinc-100">{sys.irrigatedAreaHa} ha</strong>
                    </div>
                    <div>
                      Vazão: <strong className="text-slate-900 dark:text-zinc-100">{sys.nominalFlowM3h} m³/h</strong>
                    </div>
                    <div>
                      Pressão: <strong className="text-slate-900 dark:text-zinc-100">{sys.operatingPressureMca} mca</strong>
                    </div>
                    <div>
                      CUC: <strong className="text-emerald-700 dark:text-emerald-400">{sys.cucPercent}%</strong>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Active System Details + CUC/CUD Calculator */}
        <div className="lg:col-span-8 space-y-4">
          {!activeSystem ? (
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl border border-slate-200 dark:border-zinc-800 text-center space-y-2.5">
              <Droplets className="w-6 h-6 text-sky-600 dark:text-sky-400 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Nenhum Sistema Selecionado
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                Adicione um sistema de irrigação para consultar parâmetros hidráulicos, equipamentos e calcular uniformidade CUC/CUD.
              </p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs cursor-pointer"
              >
                Cadastrar Novo Sistema
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <span className="text-[11px] font-medium text-sky-700 dark:text-sky-400">
                    {activeSystem.plotName} · {activeSystem.type}
                  </span>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                    {activeSystem.systemName}
                  </h2>
                </div>
                <select
                  value={activeSystem.status}
                  onChange={(e) =>
                    onUpdateSystem({
                      ...activeSystem,
                      status: e.target.value as IrrigationSystemRecord['status'],
                    })
                  }
                  aria-label="Alterar status operacional do sistema"
                  className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs font-medium text-slate-800 dark:text-zinc-200"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Desligado">Desligado</option>
                </select>
              </div>

              {/* System Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs tabular-nums">
                <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Vazão Nominal</span>
                  <strong className="text-sm text-slate-900 dark:text-zinc-100">
                    {activeSystem.nominalFlowM3h} m³/h
                  </strong>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Pressão</span>
                  <strong className="text-sm text-slate-900 dark:text-zinc-100">
                    {activeSystem.operatingPressureMca} mca
                  </strong>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Eficiência (Ea)</span>
                  <strong className="text-sm text-emerald-700 dark:text-emerald-400">
                    {activeSystem.applicationEfficiencyPct}%
                  </strong>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Potência</span>
                  <strong className="text-sm text-amber-700 dark:text-amber-400">
                    {activeSystem.powerKw} kW
                  </strong>
                </div>
              </div>

              {/* Linked Equipments */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                  Equipamentos Instalados ({(activeSystem.equipments || []).length})
                </h4>
                <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden text-xs">
                  {(activeSystem.equipments || []).map((eq) => (
                    <div
                      key={eq.id}
                      className="px-3 py-2.5 bg-slate-50/60 dark:bg-zinc-950/60 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                          {eq.category} ·{' '}
                        </span>
                        <strong className="text-slate-900 dark:text-zinc-100">{eq.name}</strong>
                        <span className="text-slate-500 dark:text-zinc-400 ml-1.5">({eq.brandModel})</span>
                      </div>
                      <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 shrink-0">
                        {eq.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CUC & CUD Calculator */}
              <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Calculadora de Uniformidade CUC &amp; CUD (Ensaio de Coletores)
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                    Atual: CUC {activeSystem.cucPercent}% · CUD {activeSystem.cudPercent}%
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                  Informe as lâminas coletadas nos copos ensaiados em campo (mm, separadas por vírgula):
                </p>

                <textarea
                  rows={2}
                  value={catchCanDepths}
                  onChange={(e) => setCatchCanDepths(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 text-xs font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleCalculateUniformity}
                    className="h-8 px-3.5 rounded-lg bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-zinc-200 font-medium text-xs cursor-pointer"
                  >
                    Calcular CUC / CUD
                  </button>

                  {calculatedCuc !== null && calculatedCud !== null && (
                    <div className="flex flex-wrap items-center gap-3 text-xs tabular-nums">
                      <span>
                        CUC: <strong className="text-emerald-700 dark:text-emerald-400">{calculatedCuc}%</strong>
                      </span>
                      <span>
                        CUD: <strong className="text-emerald-700 dark:text-emerald-400">{calculatedCud}%</strong>
                      </span>
                      <button
                        type="button"
                        onClick={handleApplyCalculatedUniformity}
                        className="h-7 px-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs cursor-pointer"
                      >
                        Aplicar ao Sistema
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: New System */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Cadastrar Sistema de Irrigação"
        >
          <form
            onSubmit={handleCreateSystem}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-xl max-w-lg w-full border border-slate-200 dark:border-zinc-800 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Cadastrar Sistema de Irrigação
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Fechar modal"
                className="h-7 w-7 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={IRRIGATION_LABEL_CLASS}>Nome do Sistema *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pivô Central 01"
                    value={newSystemName}
                    onChange={(e) => setNewSystemName(e.target.value)}
                    className={IRRIGATION_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={IRRIGATION_LABEL_CLASS}>Talhão Vinculado</label>
                  <input
                    type="text"
                    placeholder="Ex: Talhão 04 — Sede"
                    value={newPlotName}
                    onChange={(e) => setNewPlotName(e.target.value)}
                    className={IRRIGATION_INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={IRRIGATION_LABEL_CLASS}>Tipo de Sistema</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as IrrigationSystemType)}
                    className={IRRIGATION_INPUT_CLASS}
                  >
                    {IRRIGATION_SYSTEM_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={IRRIGATION_LABEL_CLASS}>Área Irrigada (ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newAreaHa}
                    onChange={(e) => setNewAreaHa(Number(e.target.value))}
                    className={IRRIGATION_INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={IRRIGATION_LABEL_CLASS}>Vazão (m³/h)</label>
                  <input
                    type="number"
                    value={newFlowM3h}
                    onChange={(e) => setNewFlowM3h(Number(e.target.value))}
                    className={IRRIGATION_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={IRRIGATION_LABEL_CLASS}>Pressão (mca)</label>
                  <input
                    type="number"
                    value={newPressureMca}
                    onChange={(e) => setNewPressureMca(Number(e.target.value))}
                    className={IRRIGATION_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={IRRIGATION_LABEL_CLASS}>Eficiência Ea (%)</label>
                  <input
                    type="number"
                    value={newEaPct}
                    onChange={(e) => setNewEaPct(Number(e.target.value))}
                    className={IRRIGATION_INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={IRRIGATION_LABEL_CLASS}>Potência Motor (kW)</label>
                  <input
                    type="number"
                    value={newPowerKw}
                    onChange={(e) => setNewPowerKw(Number(e.target.value))}
                    className={IRRIGATION_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={IRRIGATION_LABEL_CLASS}>Tarifa Elétrica</label>
                  <select
                    value={newTariff}
                    onChange={(e) =>
                      setNewTariff(e.target.value as IrrigationSystemRecord['energyTariffType'])
                    }
                    className={IRRIGATION_INPUT_CLASS}
                  >
                    <option value="Verde">Verde</option>
                    <option value="Azul">Azul</option>
                    <option value="Convencional">Convencional</option>
                    <option value="Gerador Diesel">Gerador Diesel</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-slate-700 dark:text-zinc-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
              >
                Salvar Sistema
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default IrrigationSystemsView;
