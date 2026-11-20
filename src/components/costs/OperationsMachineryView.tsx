import React, { useState, useEffect } from 'react';
import { AgriculturalOperationCost, MachineEquipment, MachineType, PropertyCropSeason } from '../../types/costs';
import { formatCostDate } from '../../utils/costStorage';
import { Fuel, Plus, Tractor, Trash2, X } from 'lucide-react';

interface OperationsMachineryViewProps {
  operations: AgriculturalOperationCost[];
  machines: MachineEquipment[];
  season: PropertyCropSeason;
  onAddOperation: (op: AgriculturalOperationCost) => void;
  onDeleteOperation: (id: string) => void;
  onAddMachine: (m: MachineEquipment) => void;
  onDeleteMachine: (id: string) => void;
  selectedFarmId: string;
}

export const OperationsMachineryView: React.FC<OperationsMachineryViewProps> = ({
  operations,
  machines,
  season,
  onAddOperation,
  onDeleteOperation,
  onAddMachine,
  onDeleteMachine,
  selectedFarmId,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'operations' | 'machines'>('operations');
  const [isOpModalOpen, setIsOpModalOpen] = useState(false);
  const [isMacModalOpen, setIsMacModalOpen] = useState(false);
  const [confirmDeleteOpId, setConfirmDeleteOpId] = useState<string | null>(null);
  const [confirmDeleteMacId, setConfirmDeleteMacId] = useState<string | null>(null);

  // Operation Form state
  const [plotName, setPlotName] = useState('');
  const [operationType, setOperationType] = useState<AgriculturalOperationCost['operationType']>('Plantio');
  const [hoursWorked, setHoursWorked] = useState<number | ''>('');
  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [fuelLiters, setFuelLiters] = useState<number | ''>('');
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState<number | ''>(6.2);
  const [operatorCostTotal, setOperatorCostTotal] = useState<number | ''>('');

  // Machine Form state
  const [macName, setMacName] = useState('');
  const [macType, setMacType] = useState<MachineType>('Trator');
  const [brandModel, setBrandModel] = useState('');
  const [acqValue, setAcqValue] = useState<number | ''>('');
  const [hourlyRate, setHourlyRate] = useState<number | ''>('');

  useEffect(() => {
    if (!isOpModalOpen && !isMacModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpModalOpen(false);
        setIsMacModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpModalOpen, isMacModalOpen]);

  const seasonOps = (operations || []).filter((o) => o.seasonId === season.id);

  const openOpModal = () => {
    setPlotName('');
    setOperationType('Plantio');
    setHoursWorked('');
    setSelectedMachineId(machines[0]?.id || '');
    setFuelLiters('');
    setFuelPricePerLiter(6.2);
    setOperatorCostTotal('');
    setIsOpModalOpen(true);
  };

  const openMacModal = () => {
    setMacName('');
    setMacType('Trator');
    setBrandModel('');
    setAcqValue('');
    setHourlyRate('');
    setIsMacModalOpen(true);
  };

  const handleCreateOperation = (e: React.FormEvent) => {
    e.preventDefault();
    const mac = machines.find((m) => m.id === selectedMachineId);
    const fuelLitersNum = Number(fuelLiters) || 0;
    const fuelPriceNum = Number(fuelPricePerLiter) || 0;
    const fuelTotal = Math.round(fuelLitersNum * fuelPriceNum * 100) / 100;
    const opCostNum = Number(operatorCostTotal) || 0;
    const totalCost = Math.round((fuelTotal + opCostNum) * 100) / 100;

    const newOp: AgriculturalOperationCost = {
      id: `op-${Date.now()}`,
      seasonId: season.id,
      farmId: selectedFarmId || 'farm-1',
      plotId: `plot-${Date.now()}`,
      plotName,
      operationType,
      date: new Date().toISOString().split('T')[0],
      hoursWorked: Number(hoursWorked) || 0,
      machineId: mac?.id,
      machineName: mac?.name || 'Frota Geral',
      fuelLiters: fuelLitersNum,
      fuelPricePerLiter: fuelPriceNum,
      fuelCostTotal: fuelTotal,
      operatorCostTotal: opCostNum,
      inputsUsed: [],
      otherCosts: 0,
      totalOperationCost: totalCost,
    };

    onAddOperation(newOp);
    setIsOpModalOpen(false);
  };

  const handleCreateMachine = (e: React.FormEvent) => {
    e.preventDefault();
    const acq = Number(acqValue) || 0;
    const newMac: MachineEquipment = {
      id: `mac-${Date.now()}`,
      farmId: selectedFarmId || 'farm-1',
      name: macName,
      type: macType,
      brandModel: brandModel.trim() || macName,
      manufactureYear: new Date().getFullYear(),
      acquisitionValue: acq,
      hourlyRate: Number(hourlyRate) || 0,
      fuelConsLh: 18.0,
      accumulatedHours: 0,
      preventiveMaintCostYear: Math.round(acq * 0.03),
      correctiveMaintCostYear: 0,
      depreciationYearCost: Math.round(acq * 0.1),
      insuranceYearCost: Math.round(acq * 0.02),
      status: 'Operacional',
    };

    onAddMachine(newMac);
    setIsMacModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Sub-tab Switcher */}
      <div className="flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveSubTab('operations')}
          className={`h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 tabular-nums ${
            activeSubTab === 'operations'
              ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 border border-slate-200/70 dark:border-zinc-700'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
          }`}
        >
          <Tractor className="w-3.5 h-3.5" />
          Operações de Campo ({seasonOps.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('machines')}
          className={`h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 tabular-nums ${
            activeSubTab === 'machines'
              ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 border border-slate-200/70 dark:border-zinc-700'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
          }`}
        >
          <Fuel className="w-3.5 h-3.5" />
          Frota &amp; Depreciação ({(machines || []).length})
        </button>
      </div>

      {activeSubTab === 'operations' ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              Registros de plantio, pulverização, adubação, colheita e transporte da safra.
            </span>
            <button
              type="button"
              onClick={openOpModal}
              className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              Lançar Operação
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
                <thead className="bg-slate-50/80 dark:bg-zinc-950/60 text-slate-500 dark:text-zinc-400 font-semibold border-b border-slate-200/80 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-3.5">Operação / Talhão</th>
                    <th className="py-3 px-3.5">Data</th>
                    <th className="py-3 px-3.5">Máquina / Horas</th>
                    <th className="py-3 px-3.5">Combustível</th>
                    <th className="py-3 px-3.5 text-right">Operadores</th>
                    <th className="py-3 px-3.5 text-right">Custo Total</th>
                    <th className="py-3 px-3.5 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {seasonOps.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400 dark:text-zinc-500">
                        Nenhuma operação lançada nesta safra ainda.
                      </td>
                    </tr>
                  ) : (
                    seasonOps.map((op) => (
                      <tr key={op.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-950/40">
                        <td className="py-3 px-3.5">
                          <span className="font-semibold text-slate-900 dark:text-zinc-100 block">
                            {op.operationType}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">{op.plotName}</span>
                        </td>
                        <td className="py-3 px-3.5 tabular-nums">{formatCostDate(op.date)}</td>
                        <td className="py-3 px-3.5">
                          <div className="font-medium">{op.machineName || 'Frota Geral'}</div>
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                            {op.hoursWorked} h trabalhadas
                          </div>
                        </td>
                        <td className="py-3 px-3.5 tabular-nums">
                          <div>{op.fuelLiters} L</div>
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                            R$ {op.fuelCostTotal.toLocaleString('pt-BR')}
                          </div>
                        </td>
                        <td className="py-3 px-3.5 text-right tabular-nums">
                          R$ {op.operatorCostTotal.toLocaleString('pt-BR')}
                        </td>
                        <td className="py-3 px-3.5 text-right font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          R$ {op.totalOperationCost.toLocaleString('pt-BR')}
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          {confirmDeleteOpId === op.id ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteOperation(op.id);
                                  setConfirmDeleteOpId(null);
                                }}
                                className="h-7 px-2 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-medium"
                              >
                                Excluir
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteOpId(null)}
                                className="h-7 px-2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-[11px]"
                              >
                                Não
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteOpId(op.id)}
                              aria-label="Excluir operação"
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              Tratores, colhedoras, pulverizadores, custo horário e depreciação patrimonial.
            </span>
            <button
              type="button"
              onClick={openMacModal}
              className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              Cadastrar Equipamento
            </button>
          </div>

          {(!machines || machines.length === 0) ? (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-8 text-center space-y-3">
              <Tractor className="w-7 h-7 text-slate-300 dark:text-zinc-600 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Nenhuma máquina cadastrada</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Cadastre sua frota para calcular automaticamente depreciação e seguros no COT da safra.
                </p>
              </div>
              <button
                type="button"
                onClick={openMacModal}
                className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Cadastrar Primeiro Equipamento
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {machines.map((m) => (
                <div
                  key={m.id}
                  className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-3"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{m.type}</div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mt-0.5 truncate">{m.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 truncate tabular-nums">
                        {m.brandModel} · {m.manufactureYear}
                      </p>
                    </div>

                    {confirmDeleteMacId === m.id ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteMachine(m.id);
                            setConfirmDeleteMacId(null);
                          }}
                          className="h-7 px-2 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-medium"
                        >
                          Excluir
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteMacId(null)}
                          className="h-7 px-2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-[11px]"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteMacId(m.id)}
                        aria-label={`Excluir ${m.name}`}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800">
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Hora Máquina</span>
                      <span className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                        R$ {m.hourlyRate} / h
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800">
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Consumo Médio</span>
                      <span className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                        {m.fuelConsLh} L / h
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-zinc-400 space-y-1 pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <div className="flex justify-between">
                      <span>Depreciação Anual</span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-200 tabular-nums">
                        R$ {m.depreciationYearCost.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Manutenção Anual Est.</span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-200 tabular-nums">
                        R$ {(m.preventiveMaintCostYear + m.correctiveMaintCostYear).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Operação */}
      {isOpModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={() => setIsOpModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full p-5 border border-slate-200 dark:border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">Lançar Operação de Campo</h3>
              <button
                type="button"
                onClick={() => setIsOpModalOpen(false)}
                aria-label="Fechar modal"
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOperation} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Nome do Talhão</label>
                <input
                  type="text"
                  value={plotName}
                  onChange={(e) => setPlotName(e.target.value)}
                  required
                  placeholder="Ex: Talhão 01 - Sede"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Tipo de Operação</label>
                  <select
                    value={operationType}
                    onChange={(e) =>
                      setOperationType(e.target.value as AgriculturalOperationCost['operationType'])
                    }
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                  >
                    <option value="Plantio">Plantio</option>
                    <option value="Pulverização">Pulverização</option>
                    <option value="Adubação">Adubação</option>
                    <option value="Irrigação">Irrigação</option>
                    <option value="Capina / Manejo">Capina / Manejo</option>
                    <option value="Colheita">Colheita</option>
                    <option value="Transporte">Transporte</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Equipamento</label>
                  <select
                    value={selectedMachineId}
                    onChange={(e) => setSelectedMachineId(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                  >
                    <option value="">Frota Geral</option>
                    {machines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Horas</label>
                  <input
                    type="number"
                    step="0.5"
                    value={hoursWorked}
                    onChange={(e) => setHoursWorked(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 tabular-nums outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Diesel (L)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 tabular-nums outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">R$/Litro</label>
                  <input
                    type="number"
                    step="0.01"
                    value={fuelPricePerLiter}
                    onChange={(e) => setFuelPricePerLiter(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 tabular-nums outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                  Custo Total de Operadores (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={operatorCostTotal}
                  onChange={(e) => setOperatorCostTotal(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 tabular-nums outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsOpModalOpen(false)}
                  className="h-9 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  Salvar Operação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Máquina */}
      {isMacModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={() => setIsMacModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full p-5 border border-slate-200 dark:border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                Cadastrar Equipamento / Trator
              </h3>
              <button
                type="button"
                onClick={() => setIsMacModalOpen(false)}
                aria-label="Fechar modal"
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMachine} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Nome do Equipamento</label>
                <input
                  type="text"
                  value={macName}
                  onChange={(e) => setMacName(e.target.value)}
                  required
                  placeholder="Ex: Trator John Deere 6135M"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Tipo</label>
                  <select
                    value={macType}
                    onChange={(e) => setMacType(e.target.value as MachineType)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                  >
                    <option value="Trator">Trator</option>
                    <option value="Colhedora">Colhedora</option>
                    <option value="Pulverizador">Pulverizador</option>
                    <option value="Plantadeira">Plantadeira</option>
                    <option value="Caminhão">Caminhão</option>
                    <option value="Pivô Central">Pivô Central</option>
                    <option value="Utilitário">Utilitário</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Hora Máquina (R$)</label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 tabular-nums outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Marca / Modelo</label>
                  <input
                    type="text"
                    value={brandModel}
                    onChange={(e) => setBrandModel(e.target.value)}
                    placeholder="Ex: JD 6135M"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Valor de Aquisição (R$)
                  </label>
                  <input
                    type="number"
                    value={acqValue}
                    onChange={(e) => setAcqValue(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 tabular-nums outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsMacModalOpen(false)}
                  className="h-9 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  Salvar Equipamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
