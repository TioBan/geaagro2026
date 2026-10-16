import React, { useState } from 'react';
import {
  SoilPhysicsProfile,
  CropWaterRequirement,
  IrrigationSystemRecord,
  IrrigationEventLog,
} from '../../types/irrigation';
import { calculateWaterRequirement } from '../../utils/irrigationStorage';
import { Gauge, Calculator, Plus, Droplets, Clock, Zap, CheckCircle2 } from 'lucide-react';

interface Props {
  soils: SoilPhysicsProfile[];
  crops: CropWaterRequirement[];
  systems: IrrigationSystemRecord[];
  logs: IrrigationEventLog[];
  onAddLog: (log: IrrigationEventLog) => void;
}

export const WaterRequirementEngineView: React.FC<Props> = ({
  soils,
  crops,
  systems,
  logs,
  onAddLog,
}) => {
  const [selectedSoilId, setSelectedSoilId] = useState<string | null>(null);
  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);

  const selectedSoil = (selectedSoilId ? soils.find(s => s.id === selectedSoilId) : null) || soils[0] || null;
  const selectedCrop = (selectedCropId ? crops.find(c => c.id === selectedCropId) : null) || crops[0] || null;
  const selectedSystem = (selectedSystemId ? systems.find(sys => sys.id === selectedSystemId) : null) || systems[0] || null;

  const [currentKc, setCurrentKc] = useState(1.15);
  const [rootDepthCm, setRootDepthCm] = useState(50);
  const [et0, setEt0] = useState(5.8);

  const calc = calculateWaterRequirement(
    selectedSoil,
    selectedCrop,
    currentKc,
    rootDepthCm,
    et0,
    selectedSystem?.applicationEfficiencyPct || 85,
    selectedSystem?.nominalFlowM3h || 240,
    selectedSystem?.irrigatedAreaHa || 80
  );

  // Form Lançamento de Irrigação
  const [durationHours, setDurationHours] = useState(calc.tiHours);
  const [operator, setOperator] = useState('João da Silva (Irrigador)');
  const [purpose, setPurpose] = useState<IrrigationEventLog['purpose']>('Manejo Hídrico');

  const handleCreateIrrigationLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSystem) return;

    const volumeM3 = selectedSystem.nominalFlowM3h * durationHours;
    const grossMm = (volumeM3 / (selectedSystem.irrigatedAreaHa * 10));
    const netMm = grossMm * (selectedSystem.applicationEfficiencyPct / 100);
    const kwh = selectedSystem.powerKw * durationHours;
    const cost = kwh * 0.42; // Tarifa média verde

    const newLog: IrrigationEventLog = {
      id: `irrig-${Date.now()}`,
      systemId: selectedSystem.id,
      systemName: selectedSystem.systemName,
      plotId: selectedSystem.plotId,
      plotName: selectedSystem.plotName,
      date: new Date().toISOString().split('T')[0],
      startTime: '21:00',
      durationHours,
      grossDepthAppliedMm: Math.round(grossMm * 10) / 10,
      netDepthAppliedMm: Math.round(netMm * 10) / 10,
      totalWaterVolumeM3: Math.round(volumeM3),
      energyConsumedKwh: Math.round(kwh),
      energyCostBrl: Math.round(cost * 100) / 100,
      operatorName: operator,
      purpose,
    };

    onAddLog(newLog);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Gauge className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            Cálculo da Necessidade de Irrigação & Lâminas
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Dimensionamento automático de CAD, AFD, ETc, Lâmina Líquida (LL), Lâmina Bruta (LB) e Tempo de Irrigação (Ti)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Seleção e Calculadora */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-cyan-600" /> Parâmetros de Entrada
            </h4>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Selecione o Pivô / Sistema</label>
              <select
                value={selectedSystem?.id || ''}
                onChange={e => setSelectedSystemId(e.target.value)}
                disabled={systems.length === 0}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white disabled:opacity-60"
              >
                {systems.length === 0 ? (
                  <option value="">Nenhum sistema cadastrado</option>
                ) : (
                  systems.map(s => (
                    <option key={s.id} value={s.id}>{s.systemName} ({s.irrigatedAreaHa} ha)</option>
                  ))
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Solo do Talhão</label>
                <select
                  value={selectedSoil?.id || ''}
                  onChange={e => setSelectedSoilId(e.target.value)}
                  disabled={soils.length === 0}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white disabled:opacity-60"
                >
                  {soils.length === 0 ? (
                    <option value="">Nenhum solo cadastrado</option>
                  ) : (
                    soils.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Cultura Agrícola</label>
                <select
                  value={selectedCrop?.id || ''}
                  onChange={e => setSelectedCropId(e.target.value)}
                  disabled={crops.length === 0}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white disabled:opacity-60"
                >
                  {crops.length === 0 ? (
                    <option value="">Nenhuma cultura cadastrada</option>
                  ) : (
                    crops.map(c => (
                      <option key={c.id} value={c.id}>{c.cropName}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Kc Atual</label>
                <input
                  type="number"
                  step="0.05"
                  value={currentKc}
                  onChange={e => setCurrentKc(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Raízes Z (cm)</label>
                <input
                  type="number"
                  value={rootDepthCm}
                  onChange={e => setRootDepthCm(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">ET₀ (mm/dia)</label>
                <input
                  type="number"
                  step="0.1"
                  value={et0}
                  onChange={e => setEt0(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Cards de Resultados do Cálculo */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Resultados da Lâmina & Turno:</span>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-cyan-950/20 p-2.5 rounded-xl border border-cyan-800/40">
                <span className="text-[10px] text-cyan-400 font-bold block">Evapotransp. ETc</span>
                <strong className="text-base text-cyan-300">{calc.etcMmDay} mm/dia</strong>
              </div>

              <div className="bg-cyan-950/20 p-2.5 rounded-xl border border-cyan-800/40">
                <span className="text-[10px] text-cyan-400 font-bold block">Água Disp. AFD</span>
                <strong className="text-base text-cyan-300">{calc.afdMm} mm</strong>
              </div>

              <div className="bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-800/40">
                <span className="text-[10px] text-emerald-400 font-bold block">Lâmina Bruta LB</span>
                <strong className="text-base text-emerald-300">{calc.lbMm} mm</strong>
              </div>

              <div className="bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-800/40">
                <span className="text-[10px] text-emerald-400 font-bold block">Tempo Irrig. (Ti)</span>
                <strong className="text-base text-emerald-300">{calc.tiHours} h</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Lançamento e Histórico de Irrigações Realizadas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-600" /> Lançar Irrigação Executada em Campo
            </h4>

            <form onSubmit={handleCreateIrrigationLog} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Duração da Volta/Rega (Horas)</label>
                <input
                  type="number"
                  step="0.5"
                  value={durationHours}
                  onChange={e => setDurationHours(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Operador Responsável</label>
                <input
                  type="text"
                  value={operator}
                  onChange={e => setOperator(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Finalidade</label>
                <select
                  value={purpose}
                  onChange={e => setPurpose(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="Manejo Hídrico">Manejo Hídrico Regular</option>
                  <option value="Germinação">Germinação / Plantio</option>
                  <option value="Fertirrigação">Fertirrigação</option>
                  <option value="Resfriamento / Anti-geada">Resfriamento / Anti-geada</option>
                </select>
              </div>

              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Registrar Irrigação no Sistema
                </button>
              </div>
            </form>
          </div>

          {/* Lista do Diário de Irrigações */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Histórico de Irrigações Realizadas ({logs.length})</h4>

            <div className="space-y-2">
              {logs.map(log => (
                <div
                  key={log.id}
                  className="p-4 bg-slate-50 dark:bg-zinc-950/60 rounded-xl border border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{log.systemName}</span>
                    <p className="text-[11px] text-slate-500">
                      {new Date(log.date).toLocaleDateString('pt-BR')} • {log.durationHours}h • Operador: {log.operatorName}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Lâmina Bruta</span>
                      <strong className="text-cyan-600 dark:text-cyan-400">{log.grossDepthAppliedMm} mm</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Volume Água</span>
                      <strong className="text-slate-800 dark:text-zinc-200">{log.totalWaterVolumeM3.toLocaleString('pt-BR')} m³</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Energia (R$)</span>
                      <strong className="text-amber-600 dark:text-amber-400">R$ {log.energyCostBrl.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
