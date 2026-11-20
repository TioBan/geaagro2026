import React, { useState } from 'react';
import { Thermometer, Wind, Plus, Activity, Droplets, X } from 'lucide-react';
import { SwineShedEnvironment } from '../../types/swine';
import {
  SWINE_CARD_CLASS,
  SWINE_INPUT_CLASS,
  SWINE_LABEL_CLASS,
  SWINE_PRIMARY_BTN_CLASS,
  SWINE_SECONDARY_BTN_CLASS,
  SWINE_SUBCARD_CLASS,
  calculateItu,
  formatBrDate,
  getComfortBadgeClass,
  getTodayIsoDate,
  useEscapeClose,
} from './swineUi';

interface SwineEnvironmentViewProps {
  sheds: SwineShedEnvironment[];
  onAddShedReading: (reading: SwineShedEnvironment) => void;
}

const TARGET_TEMP_BY_PHASE: Record<SwineShedEnvironment['phase'], number> = {
  reproducao: 20,
  gestacao: 20,
  maternidade: 22,
  creche: 27,
  crescimento: 21,
  terminacao: 20,
  comercializacao: 20,
};

function computeComfortStatus(
  tempC: number,
  targetTempC: number,
  rhPct: number,
  ammoniaPpm: number,
  co2Ppm: number
): SwineShedEnvironment['comfortStatus'] {
  if (ammoniaPpm >= 15 || co2Ppm >= 2500) return 'Gases Elevados';
  if (tempC > targetTempC + 4) return 'Alerta Calor';
  if (tempC < targetTempC - 4) return 'Alerta Frio';
  if (rhPct > 80 || rhPct < 45) return 'Umidade Crítica';
  return 'Conforto Ótimo';
}

export const SwineEnvironmentView: React.FC<SwineEnvironmentViewProps> = ({
  sheds,
  onAddShedReading,
}) => {
  const [selectedShedId, setSelectedShedId] = useState<string>(sheds[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('Galpão 01 - Maternidade');
  const [phase, setPhase] = useState<SwineShedEnvironment['phase']>('maternidade');
  const [capacityAnimals, setCapacityAnimals] = useState(300);
  const [currentOccupancy, setCurrentOccupancy] = useState(260);
  const [temp, setTemp] = useState(22.0);
  const [humidity, setHumidity] = useState(64);
  const [airSpeed, setAirSpeed] = useState(0.4);
  const [ammonia, setAmmonia] = useState(6.0);
  const [co2, setCo2] = useState(1200);

  useEscapeClose(isModalOpen, () => setIsModalOpen(false));

  const selectedShed = sheds.find(s => s.id === selectedShedId) ?? sheds[0] ?? null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const today = getTodayIsoDate();
    const targetTempC = TARGET_TEMP_BY_PHASE[phase] ?? 22;
    const tempVal = Number(temp);
    const rhVal = Number(humidity);
    const nh3Val = Number(ammonia);
    const co2Val = Number(co2);

    const newReading: SwineShedEnvironment = {
      id: `shed_${Date.now()}`,
      name: name.trim(),
      phase,
      capacityAnimals: Math.max(1, Number(capacityAnimals) || 1),
      currentOccupancy: Math.max(0, Number(currentOccupancy) || 0),
      ventilationType: 'Pressão Negativa / Túnel',
      coolingType: 'Pad Cooling (Placas Evaporativas)',
      heatingType: phase === 'maternidade' || phase === 'creche' ? 'Campânulas a Gás' : 'Nenhum',
      temperatureC: tempVal,
      targetTempC,
      relativeHumidityPct: rhVal,
      targetHumidityPct: 65,
      ammoniaNhpPpm: nh3Val,
      carbonDioxidePpm: co2Val,
      airSpeedMs: Number(airSpeed) || 0,
      luminosityLux: 50,
      waterDailyFlowL: 0,
      comfortStatus: computeComfortStatus(tempVal, targetTempC, rhVal, nh3Val, co2Val),
      lastCleanedDate: today,
      lastDisinfectedDate: today,
      disinfectantUsed: 'Glutaraldeído 1:500',
      sanitaryBreakDaysRemaining: 0,
    };

    onAddShedReading(newReading);
    setSelectedShedId(newReading.id);
    setIsModalOpen(false);
  };

  const occupancyPct = selectedShed
    ? Math.min(100, Math.round((selectedShed.currentOccupancy / Math.max(1, selectedShed.capacityAnimals)) * 100))
    : 0;

  const selectedItu = selectedShed
    ? calculateItu(selectedShed.temperatureC, selectedShed.relativeHumidityPct)
    : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`${SWINE_CARD_CLASS} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Ambiência, Clima & ITU dos Galpões</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Monitoramento de conforto térmico (ITU), gases (NH₃ e CO₂), ventilação e lotação por galpão.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`${SWINE_PRIMARY_BTN_CLASS} shrink-0`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Registrar Galpão / Leitura</span>
        </button>
      </div>

      {sheds.length === 0 ? (
        <div className={`${SWINE_CARD_CLASS} p-10 text-center space-y-2`}>
          <Thermometer className="w-8 h-8 text-slate-400 dark:text-zinc-500 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
            Nenhum galpão monitorado
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Registre uma leitura de ambiência para calcular ITU, conforto térmico e ocupação.
          </p>
        </div>
      ) : (
        <>
          {/* Shed Selector */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {sheds.map(shed => {
              const isSelected = selectedShed?.id === shed.id;
              return (
                <button
                  key={shed.id}
                  type="button"
                  onClick={() => setSelectedShedId(shed.id)}
                  className={`h-8 px-3 rounded-lg border text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>{shed.name}</span>
                  <span
                    className={`w-1.5 h-1.5 rounded-sm ${
                      shed.comfortStatus === 'Conforto Ótimo' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {selectedShed && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div className={`${SWINE_CARD_CLASS} p-3`}>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                      <span>Temp.</span>
                      <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-1 tabular-nums">
                      {selectedShed.temperatureC}°C
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 tabular-nums">
                      Meta {selectedShed.targetTempC}°C
                    </span>
                  </div>

                  <div className={`${SWINE_CARD_CLASS} p-3`}>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                      <span>Umidade</span>
                      <Droplets className="w-3.5 h-3.5 text-sky-500" />
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-1 tabular-nums">
                      {selectedShed.relativeHumidityPct}%
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 tabular-nums">
                      Meta {selectedShed.targetHumidityPct}%
                    </span>
                  </div>

                  <div className={`${SWINE_CARD_CLASS} p-3`}>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                      <span>ITU</span>
                      <Activity className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-1 tabular-nums">
                      {selectedItu}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                      {selectedItu <= 72 ? 'Confortável' : selectedItu <= 78 ? 'Atenção' : 'Estresse'}
                    </span>
                  </div>

                  <div className={`${SWINE_CARD_CLASS} p-3`}>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                      <span>NH₃</span>
                      <Wind className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
                      {selectedShed.ammoniaNhpPpm} ppm
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400">Ideal &lt; 15</span>
                  </div>

                  <div className={`${SWINE_CARD_CLASS} p-3`}>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                      <span>CO₂</span>
                      <Activity className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-1 tabular-nums">
                      {selectedShed.carbonDioxidePpm}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400">ppm (&lt; 2500)</span>
                  </div>
                </div>

                {/* Equipment */}
                <div className={`${SWINE_CARD_CLASS} p-4 space-y-3`}>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                    Equipamentos & Climatização
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className={`${SWINE_SUBCARD_CLASS} p-3 text-xs space-y-0.5`}>
                      <span className="text-slate-500 dark:text-zinc-400 block">Ventilação</span>
                      <span className="font-semibold text-slate-900 dark:text-zinc-100 block">
                        {selectedShed.ventilationType}
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 tabular-nums">
                        Ar: {selectedShed.airSpeedMs} m/s
                      </span>
                    </div>
                    <div className={`${SWINE_SUBCARD_CLASS} p-3 text-xs space-y-0.5`}>
                      <span className="text-slate-500 dark:text-zinc-400 block">Resfriamento</span>
                      <span className="font-semibold text-slate-900 dark:text-zinc-100 block">
                        {selectedShed.coolingType}
                      </span>
                    </div>
                    <div className={`${SWINE_SUBCARD_CLASS} p-3 text-xs space-y-0.5`}>
                      <span className="text-slate-500 dark:text-zinc-400 block">Aquecimento</span>
                      <span className="font-semibold text-slate-900 dark:text-zinc-100 block">
                        {selectedShed.heatingType}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className={`${SWINE_CARD_CLASS} p-4 space-y-3`}>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                    Lotação & Higienização
                  </h3>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${getComfortBadgeClass(selectedShed.comfortStatus)}`}
                  >
                    {selectedShed.comfortStatus}
                  </span>
                </div>

                <div className={`${SWINE_SUBCARD_CLASS} p-3 space-y-2`}>
                  <div className="flex justify-between text-xs tabular-nums">
                    <span className="text-slate-600 dark:text-zinc-400">Ocupação</span>
                    <span className="font-semibold text-slate-900 dark:text-zinc-100">
                      {selectedShed.currentOccupancy} / {selectedShed.capacityAnimals} ({occupancyPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-rose-600"
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800">
                    <span className="text-slate-500 dark:text-zinc-400">Última Limpeza</span>
                    <span className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums">
                      {formatBrDate(selectedShed.lastCleanedDate)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800">
                    <span className="text-slate-500 dark:text-zinc-400">Desinfetante</span>
                    <span className="font-medium text-slate-800 dark:text-zinc-200">
                      {selectedShed.disinfectantUsed}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500 dark:text-zinc-400">Vazio Sanitário</span>
                    <span className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums">
                      {selectedShed.sanitaryBreakDaysRemaining} dias
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-zinc-950/60 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-lg w-full p-5 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Registrar Galpão / Leitura Ambiental
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
                  <label className={SWINE_LABEL_CLASS}>Nome da Instalação *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>Fase / Setor</label>
                  <select
                    value={phase}
                    onChange={e => setPhase(e.target.value as SwineShedEnvironment['phase'])}
                    className={SWINE_INPUT_CLASS}
                  >
                    <option value="maternidade">Maternidade</option>
                    <option value="creche">Creche</option>
                    <option value="crescimento">Crescimento</option>
                    <option value="terminacao">Terminação</option>
                    <option value="gestacao">Gestação</option>
                    <option value="reproducao">Reprodução</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={SWINE_LABEL_CLASS}>Ocupação Atual</label>
                  <input
                    type="number"
                    min="0"
                    value={currentOccupancy}
                    onChange={e => setCurrentOccupancy(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>Capacidade Total</label>
                  <input
                    type="number"
                    min="1"
                    value={capacityAnimals}
                    onChange={e => setCapacityAnimals(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className={SWINE_LABEL_CLASS}>Temp. (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temp}
                    onChange={e => setTemp(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>Umidade (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={humidity}
                    onChange={e => setHumidity(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>NH₃ (ppm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={ammonia}
                    onChange={e => setAmmonia(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>CO₂ (ppm)</label>
                  <input
                    type="number"
                    min="0"
                    value={co2}
                    onChange={e => setCo2(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
              </div>

              <div>
                <label className={SWINE_LABEL_CLASS}>Velocidade do Ar (m/s)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={airSpeed}
                  onChange={e => setAirSpeed(Number(e.target.value))}
                  className={SWINE_INPUT_CLASS}
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
                  Salvar Leitura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
