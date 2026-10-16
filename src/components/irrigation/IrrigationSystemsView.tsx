import React, { useState } from 'react';
import { IrrigationSystemRecord, IrrigationEquipmentItem, IrrigationSystemType } from '../../types/irrigation';
import { calculateUniformityMetrics } from '../../utils/irrigationStorage';
import { Droplets, Settings, Plus, Gauge, Wrench, Calculator, Zap, ShieldCheck, X } from 'lucide-react';

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
  const activeSystem = (selectedSystemId ? systems.find(s => s.id === selectedSystemId) : null) || systems[0] || null;

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

  // CUC & CUD Calculator State
  const [catchCanDepths, setCatchCanDepths] = useState<string>('12.5, 13.0, 11.8, 12.2, 11.5, 13.2, 12.0, 10.8, 12.9, 12.1, 11.9, 12.4');
  const [calculatedCuc, setCalculatedCuc] = useState<number | null>(null);
  const [calculatedCud, setCalculatedCud] = useState<number | null>(null);

  const handleCalculateUniformity = () => {
    const depths = catchCanDepths
      .split(',')
      .map(v => parseFloat(v.trim()))
      .filter(v => !isNaN(v) && v > 0);

    if (depths.length > 0) {
      const res = calculateUniformityMetrics(depths);
      setCalculatedCuc(res.cuc);
      setCalculatedCud(res.cud);
    }
  };

  const handleApplyCalculatedUniformity = () => {
    if (calculatedCuc !== null && calculatedCud !== null && activeSystem) {
      const updated = {
        ...activeSystem,
        cucPercent: calculatedCuc,
        cudPercent: calculatedCud,
      };
      onUpdateSystem(updated);
    }
  };

  const handleCreateSystem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSystemName.trim()) return;

    const newSys: IrrigationSystemRecord = {
      id: `sys-${Date.now()}`,
      farmId: 'farm-01',
      farmName: 'Fazenda Principal',
      plotId: `plot-${Date.now()}`,
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
      energyTariffType: 'Verde',
      installationYear: new Date().getFullYear(),
      status: 'Ativo',
      equipments: [
        {
          id: `eq-bomb-${Date.now()}`,
          systemId: `sys-${Date.now()}`,
          name: 'Conjunto Motobomba Principal',
          category: 'Bomba',
          brandModel: 'Imbil / WEG W22',
          powerCvKw: newPowerKw,
          installationDate: new Date().toISOString().split('T')[0],
          lastMaintenanceDate: new Date().toISOString().split('T')[0],
          status: 'Operacional',
        },
      ],
    };

    onAddSystem(newSys);
    setSelectedSystemId(newSys.id);
    setShowAddModal(false);
    setNewSystemName('');
    setNewPlotName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Droplets className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            Sistemas & Equipamentos de Irrigação
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Cadastro técnico de pivôs, gotejamento, conjunto motobomba, vazões, pressões e uniformidade CUC/CUD
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Sistema
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Lista de Sistemas Cadastrados */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
            Sistemas na Propriedade ({systems.length})
          </span>

          {systems.length === 0 ? (
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-center space-y-2">
              <Droplets className="w-6 h-6 text-cyan-500 mx-auto opacity-60" />
              <p className="text-xs text-slate-500">Nenhum sistema cadastrado.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-xs font-bold text-cyan-600 hover:underline cursor-pointer"
              >
                + Cadastrar Sistema
              </button>
            </div>
          ) : (
            systems.map(sys => (
              <div
                key={sys.id}
                onClick={() => setSelectedSystemId(sys.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  activeSystem?.id === sys.id
                    ? 'bg-cyan-50/50 dark:bg-cyan-950/40 border-cyan-500 dark:border-cyan-500 shadow-sm'
                    : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 rounded text-[10px] font-black uppercase">
                      {sys.type}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{sys.systemName}</h4>
                  </div>
                  <Droplets className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-zinc-300 pt-1 border-t border-slate-100 dark:border-zinc-800/80">
                  <div>Área: <strong>{sys.irrigatedAreaHa} ha</strong></div>
                  <div>Vazão: <strong>{sys.nominalFlowM3h} m³/h</strong></div>
                  <div>Pressão: <strong>{sys.operatingPressureMca} mca</strong></div>
                  <div>CUC: <strong className="text-emerald-600">{sys.cucPercent}%</strong></div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Coluna Direita: Detalhes do Sistema Selecionado & Calculadora CUC */}
        <div className="lg:col-span-2 space-y-6">
          {!activeSystem ? (
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 text-center space-y-3">
              <Droplets className="w-10 h-10 text-cyan-500 mx-auto opacity-60" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Nenhum Sistema Selecionado</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Adicione um sistema de irrigação para visualizar os dados técnicos, equipamentos instalados e a calculadora de uniformidade CUC/CUD.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Cadastrar Novo Sistema
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6">
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-zinc-800 pb-4">
                <div>
                  <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                    {activeSystem.plotName}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    {activeSystem.systemName}
                  </h2>
                </div>

                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                  {activeSystem.status}
                </span>
              </div>

              {/* Métricas do Sistema */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 font-bold block">Vazão Nominal</span>
                  <strong className="text-base text-slate-900 dark:text-white">{activeSystem.nominalFlowM3h} m³/h</strong>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 font-bold block">Pressão de Trabalho</span>
                  <strong className="text-base text-slate-900 dark:text-white">{activeSystem.operatingPressureMca} mca</strong>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 font-bold block">Eficiência de Aplicação (Ea)</span>
                  <strong className="text-base text-cyan-600 dark:text-cyan-400">{activeSystem.applicationEfficiencyPct}%</strong>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 font-bold block">Potência Elétrica</span>
                  <strong className="text-base text-amber-600 dark:text-amber-400">{activeSystem.powerKw} kW</strong>
                </div>
              </div>

              {/* Lista de Equipamentos Vinculados ao Sistema */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-cyan-600" /> Equipamentos Instalados ({(activeSystem.equipments || []).length})
                  </h4>
                </div>

                <div className="space-y-2">
                  {(activeSystem.equipments || []).map(eq => (
                    <div
                      key={eq.id}
                      className="p-3.5 bg-slate-50 dark:bg-zinc-950/60 rounded-xl border border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="px-2 py-0.5 bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded text-[9px] font-bold uppercase mr-2">
                          {eq.category}
                        </span>
                        <strong className="text-slate-900 dark:text-white">{eq.name}</strong>
                        <span className="text-slate-400 ml-2">({eq.brandModel})</span>
                      </div>
                      <span className="text-emerald-600 font-bold">{eq.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculadora Integrada de CUC (Christiansen) & CUD */}
              <div className="bg-cyan-950/20 border border-cyan-800/40 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-cyan-900 dark:text-cyan-200 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-cyan-500" />
                    Avaliação do Sistema: Calculadora CUC & CUD
                  </h4>
                  <span className="text-[10px] text-cyan-400 uppercase font-bold">Teste de Coletores</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-300">
                  Insira as lâminas coletadas nos copos ensaiados em campo (em mm, separadas por vírgula):
                </p>

                <textarea
                  rows={2}
                  value={catchCanDepths}
                  onChange={e => setCatchCanDepths(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 text-xs font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={handleCalculateUniformity}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    Calcular CUC / CUD
                  </button>

                  {calculatedCuc !== null && (
                    <div className="flex items-center gap-4 text-xs">
                      <span>CUC: <strong className="text-emerald-600 dark:text-emerald-400 text-sm">{calculatedCuc}%</strong></span>
                      <span>CUD: <strong className="text-emerald-600 dark:text-emerald-400 text-sm">{calculatedCud}%</strong></span>

                      <button
                        onClick={handleApplyCalculatedUniformity}
                        className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 cursor-pointer"
                      >
                        Atualizar no Sistema
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Cadastrar Novo Sistema */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Droplets className="w-5 h-5 text-cyan-600" /> Cadastrar Sistema de Irrigação
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSystem} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Nome do Sistema *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pivô Central 01"
                    value={newSystemName}
                    onChange={e => setNewSystemName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Talhão Vinculado</label>
                  <input
                    type="text"
                    placeholder="Ex: Talhão 04 - Sede"
                    value={newPlotName}
                    onChange={e => setNewPlotName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Tipo de Sistema</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as IrrigationSystemType)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="Pivô Central">Pivô Central</option>
                    <option value="Gotejamento">Gotejamento</option>
                    <option value="Microaspersão">Microaspersão</option>
                    <option value="Carretel Enrolador">Carretel Enrolador</option>
                    <option value="Aspersão Convencional">Aspersão Convencional</option>
                    <option value="Subsuperficial">Subsuperficial</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Área Irrigada (ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newAreaHa}
                    onChange={e => setNewAreaHa(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Vazão (m³/h)</label>
                  <input
                    type="number"
                    value={newFlowM3h}
                    onChange={e => setNewFlowM3h(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Pressão (mca)</label>
                  <input
                    type="number"
                    value={newPressureMca}
                    onChange={e => setNewPressureMca(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Ea Eficiência (%)</label>
                  <input
                    type="number"
                    value={newEaPct}
                    onChange={e => setNewEaPct(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Salvar Sistema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
