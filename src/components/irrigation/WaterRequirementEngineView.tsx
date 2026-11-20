import React, { useState } from 'react';
import {
  SoilPhysicsProfile,
  CropWaterRequirement,
  IrrigationSystemRecord,
  IrrigationEventLog,
} from '../../types/irrigation';
import { calculateWaterRequirement } from '../../utils/irrigationStorage';
import { Gauge, Calculator, Plus, Droplets } from 'lucide-react';
import {
  formatBrDate,
  IRRIGATION_INPUT_CLASS,
  IRRIGATION_LABEL_CLASS,
} from './irrigationUi';

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

  const selectedSoil =
    (selectedSoilId ? soils.find((s) => s.id === selectedSoilId) : null) || soils[0] || undefined;
  const selectedCrop =
    (selectedCropId ? crops.find((c) => c.id === selectedCropId) : null) || crops[0] || undefined;
  const selectedSystem =
    (selectedSystemId ? systems.find((sys) => sys.id === selectedSystemId) : null) ||
    systems[0] ||
    null;

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

  const [durationHours, setDurationHours] = useState<number>(calc.tiHours || 8);
  const [operator, setOperator] = useState('');
  const [purpose, setPurpose] = useState<IrrigationEventLog['purpose']>('Manejo Hídrico');

  const handleCreateIrrigationLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSystem || durationHours <= 0) return;

    const volumeM3 = selectedSystem.nominalFlowM3h * durationHours;
    const grossMm =
      selectedSystem.irrigatedAreaHa > 0 ? volumeM3 / (selectedSystem.irrigatedAreaHa * 10) : 0;
    const netMm = grossMm * (selectedSystem.applicationEfficiencyPct / 100);
    const kwh = selectedSystem.powerKw * durationHours;
    const cost = kwh * 0.42;

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
      operatorName: operator.trim() || 'Operador de Campo',
      purpose,
    };

    onAddLog(newLog);
    setOperator('');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
          <Gauge className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          Cálculo da Necessidade de Irrigação &amp; Lâminas
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Dimensionamento de CAD, AFD, ETc, Lâmina Líquida (LL), Lâmina Bruta (LB), Turno de Rega e Tempo de Irrigação (Ti).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Calculator */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-4">
          <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
            <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Parâmetros de Entrada
          </h4>

          <div className="space-y-3">
            <div>
              <label className={IRRIGATION_LABEL_CLASS}>Sistema / Pivô</label>
              <select
                value={selectedSystem?.id || ''}
                onChange={(e) => setSelectedSystemId(e.target.value)}
                disabled={systems.length === 0}
                className={IRRIGATION_INPUT_CLASS}
              >
                {systems.length === 0 ? (
                  <option value="">Nenhum sistema cadastrado</option>
                ) : (
                  systems.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.systemName} ({s.irrigatedAreaHa} ha)
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={IRRIGATION_LABEL_CLASS}>Solo do Talhão</label>
                <select
                  value={selectedSoil?.id || ''}
                  onChange={(e) => setSelectedSoilId(e.target.value)}
                  disabled={soils.length === 0}
                  className={IRRIGATION_INPUT_CLASS}
                >
                  {soils.length === 0 ? (
                    <option value="">Solo padrão</option>
                  ) : (
                    soils.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className={IRRIGATION_LABEL_CLASS}>Cultura</label>
                <select
                  value={selectedCrop?.id || ''}
                  onChange={(e) => setSelectedCropId(e.target.value)}
                  disabled={crops.length === 0}
                  className={IRRIGATION_INPUT_CLASS}
                >
                  {crops.length === 0 ? (
                    <option value="">Cultura padrão</option>
                  ) : (
                    crops.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.cropName}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className={IRRIGATION_LABEL_CLASS}>Kc Atual</label>
                <input
                  type="number"
                  step="0.05"
                  value={currentKc}
                  onChange={(e) => setCurrentKc(Number(e.target.value))}
                  className={IRRIGATION_INPUT_CLASS}
                />
              </div>
              <div>
                <label className={IRRIGATION_LABEL_CLASS}>Raízes (cm)</label>
                <input
                  type="number"
                  value={rootDepthCm}
                  onChange={(e) => setRootDepthCm(Number(e.target.value))}
                  className={IRRIGATION_INPUT_CLASS}
                />
              </div>
              <div>
                <label className={IRRIGATION_LABEL_CLASS}>ET₀ (mm/d)</label>
                <input
                  type="number"
                  step="0.1"
                  value={et0}
                  onChange={(e) => setEt0(Number(e.target.value))}
                  className={IRRIGATION_INPUT_CLASS}
                />
              </div>
            </div>
          </div>

          {/* Calculation Results */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-zinc-200">
                Resultados Calculados
              </span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                Turno: {calc.recommendedTrDays} d · CAD: {calc.cadMm} mm
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs tabular-nums">
              <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-2.5">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">ETc Diária</span>
                <strong className="text-sm text-sky-700 dark:text-sky-400">
                  {calc.etcMmDay} mm/dia
                </strong>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-2.5">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Água Disp. (AFD)</span>
                <strong className="text-sm text-slate-900 dark:text-zinc-100">{calc.afdMm} mm</strong>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-2.5">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Lâmina Bruta (LB)</span>
                <strong className="text-sm text-emerald-700 dark:text-emerald-400">
                  {calc.lbMm} mm
                </strong>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-2.5">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Tempo (Ti)</span>
                <strong className="text-sm text-emerald-700 dark:text-emerald-400">
                  {calc.tiHours} h
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Field Execution Form + Logs */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                Registrar Irrigação Executada em Campo
              </h4>
              {calc.tiHours > 0 && (
                <button
                  type="button"
                  onClick={() => setDurationHours(calc.tiHours)}
                  className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer tabular-nums"
                >
                  Usar Ti calculado ({calc.tiHours} h)
                </button>
              )}
            </div>

            <form
              onSubmit={handleCreateIrrigationLog}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              <div>
                <label className={IRRIGATION_LABEL_CLASS}>Duração (Horas)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className={IRRIGATION_INPUT_CLASS}
                />
              </div>

              <div>
                <label className={IRRIGATION_LABEL_CLASS}>Operador Responsável</label>
                <input
                  type="text"
                  placeholder="Nome do operador"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className={IRRIGATION_INPUT_CLASS}
                />
              </div>

              <div>
                <label className={IRRIGATION_LABEL_CLASS}>Finalidade</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value as IrrigationEventLog['purpose'])}
                  className={IRRIGATION_INPUT_CLASS}
                >
                  <option value="Manejo Hídrico">Manejo Hídrico</option>
                  <option value="Germinação">Germinação</option>
                  <option value="Fertirrigação">Fertirrigação</option>
                  <option value="Resfriamento / Anti-geada">Resfriamento / Anti-geada</option>
                </select>
              </div>

              <div className="sm:col-span-3 flex items-center justify-between gap-2 pt-1">
                {!selectedSystem ? (
                  <span className="text-[11px] text-amber-700 dark:text-amber-400">
                    Cadastre um sistema na aba Sistemas para registrar aplicações.
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Sistema selecionado: <strong className="text-slate-800 dark:text-zinc-200">{selectedSystem.systemName}</strong>
                  </span>
                )}
                <button
                  type="submit"
                  disabled={!selectedSystem}
                  className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Registrar Irrigação
                </button>
              </div>
            </form>
          </div>

          {/* Irrigation Logs */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
            <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100">
              Histórico de Irrigações Realizadas ({logs.length})
            </h4>

            {logs.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 p-6 text-center text-xs text-slate-500 dark:text-zinc-400">
                Nenhuma irrigação registrada ainda.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden text-xs">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-900 dark:text-zinc-100">
                        {log.systemName}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                        {formatBrDate(log.date)} · {log.durationHours}h · {log.purpose} · {log.operatorName}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 tabular-nums shrink-0">
                      <div>
                        <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">Lâmina Bruta</span>
                        <strong className="text-sky-700 dark:text-sky-400">
                          {log.grossDepthAppliedMm} mm
                        </strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">Volume</span>
                        <strong className="text-slate-900 dark:text-zinc-100">
                          {log.totalWaterVolumeM3.toLocaleString('pt-BR')} m³
                        </strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">Energia</span>
                        <strong className="text-amber-700 dark:text-amber-400">
                          R$ {log.energyCostBrl.toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterRequirementEngineView;
