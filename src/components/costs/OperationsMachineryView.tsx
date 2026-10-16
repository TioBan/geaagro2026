import React, { useState } from 'react';
import { AgriculturalOperationCost, MachineEquipment, PropertyCropSeason, InputItem } from '../../types/costs';
import { Plus, Tractor, Fuel, Wrench, Clock, Edit2, Trash2, Check, X, ShieldAlert } from 'lucide-react';

interface OperationsMachineryViewProps {
  operations: AgriculturalOperationCost[];
  machines: MachineEquipment[];
  season: PropertyCropSeason;
  inputs: InputItem[];
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
  inputs,
  onAddOperation,
  onDeleteOperation,
  onAddMachine,
  onDeleteMachine,
  selectedFarmId,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'operations' | 'machines'>('operations');
  const [isOpModalOpen, setIsOpModalOpen] = useState(false);
  const [isMacModalOpen, setIsMacModalOpen] = useState(false);

  // New Operation Form state
  const [plotName, setPlotName] = useState('');
  const [operationType, setOperationType] = useState<any>('Plantio');
  const [hoursWorked, setHoursWorked] = useState<number | ''>('');
  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [fuelLiters, setFuelLiters] = useState<number | ''>('');
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState<number | ''>('');
  const [operatorCostTotal, setOperatorCostTotal] = useState<number | ''>('');

  // New Machine Form state
  const [macName, setMacName] = useState('');
  const [macType, setMacType] = useState<any>('Trator');
  const [brandModel, setBrandModel] = useState('');
  const [acqValue, setAcqValue] = useState<number | ''>('');
  const [hourlyRate, setHourlyRate] = useState<number | ''>('');

  const seasonOps = (operations || []).filter(o => o.seasonId === season.id);

  const handleCreateOperation = (e: React.FormEvent) => {
    e.preventDefault();
    const mac = machines.find(m => m.id === selectedMachineId);
    const fuelTotal = Number(fuelLiters) * Number(fuelPricePerLiter);
    const totalCost = fuelTotal + Number(operatorCostTotal);

    const newOp: AgriculturalOperationCost = {
      id: `op-${Date.now()}`,
      seasonId: season.id,
      farmId: selectedFarmId || 'farm-1',
      plotId: `plot-${Date.now()}`,
      plotName,
      operationType,
      date: new Date().toISOString().split('T')[0],
      hoursWorked: Number(hoursWorked),
      machineId: mac?.id,
      machineName: mac?.name || 'Trator Geral',
      fuelLiters: Number(fuelLiters),
      fuelPricePerLiter: Number(fuelPricePerLiter),
      fuelCostTotal: fuelTotal,
      operatorCostTotal: Number(operatorCostTotal),
      inputsUsed: [],
      otherCosts: 0,
      totalOperationCost: totalCost,
    };

    onAddOperation(newOp);
    setIsOpModalOpen(false);
  };

  const handleCreateMachine = (e: React.FormEvent) => {
    e.preventDefault();
    const newMac: MachineEquipment = {
      id: `mac-${Date.now()}`,
      farmId: selectedFarmId || 'farm-1',
      name: macName,
      type: macType,
      brandModel: brandModel || macName,
      manufactureYear: 2023,
      acquisitionValue: Number(acqValue),
      hourlyRate: Number(hourlyRate),
      fuelConsLh: 18.0,
      accumulatedHours: 500,
      preventiveMaintCostYear: 12000,
      correctiveMaintCostYear: 3000,
      depreciationYearCost: Number(acqValue) * 0.1,
      insuranceYearCost: Number(acqValue) * 0.02,
      status: 'Operacional',
    };

    onAddMachine(newMac);
    setIsMacModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Switcher */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveSubTab('operations')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeSubTab === 'operations'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400'
          }`}
        >
          <Tractor className="w-4 h-4" />
          Operações Agrícolas de Campo ({seasonOps.length})
        </button>

        <button
          onClick={() => setActiveSubTab('machines')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeSubTab === 'machines'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400'
          }`}
        >
          <Fuel className="w-4 h-4" />
          Frota de Máquinas & Depreciação ({(machines || []).length})
        </button>
      </div>

      {activeSubTab === 'operations' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Registros de Plantio, Pulverização, Adubação e Colheita
            </span>
            <button
              onClick={() => setIsOpModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Lançar Operação
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
                <thead className="bg-slate-50 dark:bg-zinc-800/80 text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Operação / Talhão</th>
                    <th className="p-3.5">Data</th>
                    <th className="p-3.5">Máquina / Horas</th>
                    <th className="p-3.5">Combustível</th>
                    <th className="p-3.5">Operadores</th>
                    <th className="p-3.5 text-right">Custo Total</th>
                    <th className="p-3.5 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {seasonOps.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400 italic">
                        Nenhuma operação lançada nesta safra ainda.
                      </td>
                    </tr>
                  ) : (
                    seasonOps.map((op) => (
                      <tr key={op.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40">
                        <td className="p-3.5">
                          <span className="font-bold text-slate-900 dark:text-zinc-100 block">{op.operationType}</span>
                          <span className="text-[11px] text-slate-400 block">{op.plotName}</span>
                        </td>
                        <td className="p-3.5">{new Date(op.date).toLocaleDateString('pt-BR')}</td>
                        <td className="p-3.5">
                          <div>{op.machineName || 'Frota Geral'}</div>
                          <div className="text-[10px] text-slate-400">{op.hoursWorked} horas trabalhadas</div>
                        </td>
                        <td className="p-3.5">
                          <div>{op.fuelLiters} Litros</div>
                          <div className="text-[10px] text-slate-400">R$ {op.fuelCostTotal.toLocaleString('pt-BR')}</div>
                        </td>
                        <td className="p-3.5">R$ {op.operatorCostTotal.toLocaleString('pt-BR')}</td>
                        <td className="p-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          R$ {op.totalOperationCost.toLocaleString('pt-BR')}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => onDeleteOperation(op.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Frota de Tratores, Colhedoras, Pulverizadores e Manutenção
            </span>
            <button
              onClick={() => setIsMacModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Cadastrar Equipamento
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(machines || []).map((m) => (
              <div key={m.id} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full">
                      {m.type}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-zinc-100 mt-1">{m.name}</h4>
                    <p className="text-xs text-slate-500">{m.brandModel} ({m.manufactureYear})</p>
                  </div>
                  <button onClick={() => onDeleteMachine(m.id)} className="text-slate-400 hover:text-rose-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                  <div className="p-2 bg-slate-50 dark:bg-zinc-800/50 rounded-lg">
                    <span className="text-slate-500 block">Hora Máquina</span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100">R$ {m.hourlyRate} / h</span>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-zinc-800/50 rounded-lg">
                    <span className="text-slate-500 block">Consumo Médio</span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100">{m.fuelConsLh} L / h</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 dark:text-zinc-400 space-y-1 pt-1">
                  <div className="flex justify-between">
                    <span>Depreciação Anual:</span>
                    <span className="font-bold text-slate-700 dark:text-zinc-200">R$ {m.depreciationYearCost.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Manutenção Acumulada:</span>
                    <span className="font-bold text-slate-700 dark:text-zinc-200">R$ {(m.preventiveMaintCostYear + m.correctiveMaintCostYear).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Operação */}
      {isOpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-zinc-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 mb-4">Lançar Operação de Campo</h3>
            <form onSubmit={handleCreateOperation} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Nome do Talhão</label>
                <input
                  type="text"
                  value={plotName}
                  onChange={(e) => setPlotName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Tipo de Operação</label>
                <select
                  value={operationType}
                  onChange={(e) => setOperationType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Horas Trabalhadas</label>
                  <input
                    type="number"
                    value={hoursWorked}
                    onChange={(e) => setHoursWorked(Number(e.target.value))}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Combustível (Litros)</label>
                  <input
                    type="number"
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(Number(e.target.value))}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Custo Total de Operadores (R$)</label>
                <input
                  type="number"
                  value={operatorCostTotal}
                  onChange={(e) => setOperatorCostTotal(Number(e.target.value))}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-zinc-800">
                <button type="button" onClick={() => setIsOpModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold">Salvar Operação</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Máquina */}
      {isMacModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-zinc-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 mb-4">Cadastrar Equipamento / Trator</h3>
            <form onSubmit={handleCreateMachine} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Nome do Equipamento</label>
                <input
                  type="text"
                  value={macName}
                  onChange={(e) => setMacName(e.target.value)}
                  required
                  placeholder="Ex: Trator John Deere 6135M"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Tipo</label>
                  <select
                    value={macType}
                    onChange={(e) => setMacType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  >
                    <option value="Trator">Trator</option>
                    <option value="Colhedora">Colhedora</option>
                    <option value="Pulverizador">Pulverizador</option>
                    <option value="Plantadeira">Plantadeira</option>
                    <option value="Caminhão">Caminhão</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Hora Máquina (R$)</label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Valor de Aquisição (R$)</label>
                <input
                  type="number"
                  value={acqValue}
                  onChange={(e) => setAcqValue(Number(e.target.value))}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-zinc-800">
                <button type="button" onClick={() => setIsMacModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold">Salvar Equipamento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
