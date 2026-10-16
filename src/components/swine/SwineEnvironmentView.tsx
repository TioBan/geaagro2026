import React, { useState } from 'react';
import {
  Thermometer,
  Wind,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Sparkles,
  Zap,
  Droplets,
  Sun,
} from 'lucide-react';
import {
  SwineShedEnvironment,
} from '../../types/swine';

interface SwineEnvironmentViewProps {
  sheds: SwineShedEnvironment[];
  onAddShedReading: (reading: SwineShedEnvironment) => void;
}

export const SwineEnvironmentView: React.FC<SwineEnvironmentViewProps> = ({
  sheds,
  onAddShedReading,
}) => {
  const [selectedShedId, setSelectedShedId] = useState<string>(sheds[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('Galpão 01 - Maternidade A');
  const [phase, setPhase] = useState<SwineShedEnvironment['phase']>('maternidade');
  const [temp, setTemp] = useState(21.8);
  const [humidity, setHumidity] = useState(64);
  const [airSpeed, setAirSpeed] = useState(0.4);
  const [ammonia, setAmmonia] = useState(5.2);
  const [co2, setCo2] = useState(1200);

  const selectedShed = sheds.find(s => s?.id === selectedShedId) || sheds[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newReading: SwineShedEnvironment = {
      id: `shed_${Date.now()}`,
      name,
      phase,
      capacityAnimals: 300,
      currentOccupancy: 280,
      ventilationType: 'Pressão Negativa / Túnel',
      coolingType: 'Pad Cooling (Placas Evaporativas)',
      heatingType: 'Campânulas a Gás',
      temperatureC: Number(temp),
      targetTempC: 22,
      relativeHumidityPct: Number(humidity),
      targetHumidityPct: 65,
      ammoniaNhpPpm: Number(ammonia),
      carbonDioxidePpm: Number(co2),
      airSpeedMs: Number(airSpeed),
      luminosityLux: 50,
      waterDailyFlowL: 4200,
      comfortStatus: 'Conforto Ótimo',
      lastCleanedDate: new Date().toISOString().split('T')[0],
      lastDisinfectedDate: new Date().toISOString().split('T')[0],
      disinfectantUsed: 'Glutaraldeído 1:500',
      sanitaryBreakDaysRemaining: 0,
    };

    onAddShedReading(newReading);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-pink-600" />
            <span>Ambiência & Climatização Automatizada</span>
          </h2>
          <p className="text-xs text-gray-500">
            Monitoramento em tempo real de conforto térmico (ITU), gases tóxicos (NH₃, CO₂), ventilação por túnel e pad cooling.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Galpão / Leitura</span>
        </button>
      </div>

      {/* Shed Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sheds.map(shed => (
          <button
            key={shed.id}
            onClick={() => setSelectedShedId(shed.id)}
            className={`px-4 py-2.5 rounded-2xl border text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedShed?.id === shed.id
                ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span>{shed.name}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                shed.comfortStatus === 'Conforto Ótimo' ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Main Shed Dashboard */}
      {selectedShed && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Gauges */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Temperatura</span>
                  <Thermometer className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-2xl font-black text-gray-900 mt-2">
                  {selectedShed.temperatureC}°C
                </div>
                <span className="text-[11px] text-gray-400">Meta: {selectedShed.targetTempC}°C</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Umidade Rel.</span>
                  <Droplets className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-black text-gray-900 mt-2">
                  {selectedShed.relativeHumidityPct}%
                </div>
                <span className="text-[11px] text-gray-400">Meta: {selectedShed.targetHumidityPct}%</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Amônia (NH₃)</span>
                  <Wind className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-amber-600 mt-2">
                  {selectedShed.ammoniaNhpPpm} ppm
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold">Ideal &lt; 15 ppm</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Dióxido (CO₂)</span>
                  <Activity className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-2xl font-black text-gray-900 mt-2">
                  {selectedShed.carbonDioxidePpm} ppm
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold">Ideal &lt; 2500 ppm</span>
              </div>
            </div>

            {/* Climate & Equipments Status */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Controle de Equipamentos & Ventilação
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-gray-50 rounded-2xl border text-xs space-y-1">
                  <span className="text-gray-500 font-semibold block">Sistema de Ventilação</span>
                  <span className="font-bold text-gray-900 block">{selectedShed.ventilationType}</span>
                  <span className="text-[11px] text-emerald-700">Velocidade: {selectedShed.airSpeedMs} m/s</span>
                </div>
                <div className="p-3.5 bg-gray-50 rounded-2xl border text-xs space-y-1">
                  <span className="text-gray-500 font-semibold block">Resfriamento Evaporativo</span>
                  <span className="font-bold text-gray-900 block">{selectedShed.coolingType}</span>
                  <span className="text-[11px] text-emerald-700">Status: Operando</span>
                </div>
                <div className="p-3.5 bg-gray-50 rounded-2xl border text-xs space-y-1">
                  <span className="text-gray-500 font-semibold block">Aquecimento / Campânulas</span>
                  <span className="font-bold text-gray-900 block">{selectedShed.heatingType}</span>
                  <span className="text-[11px] text-blue-700">Controle Automático</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Sanity & Occupancy */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Lotação & Vazio Sanitário
            </h3>

            <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Taxa de Ocupação:</span>
                <span className="font-bold text-pink-700">
                  {selectedShed.currentOccupancy} / {selectedShed.capacityAnimals} animais
                </span>
              </div>
              <div className="w-full h-2.5 bg-pink-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-600 rounded-full"
                  style={{
                    width: `${(selectedShed.currentOccupancy / selectedShed.capacityAnimals) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-gray-500">Última Limpeza:</span>
                <span className="font-bold text-gray-800">{selectedShed.lastCleanedDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-gray-500">Desinfetante:</span>
                <span className="font-bold text-gray-800">{selectedShed.disinfectantUsed}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500">Status Geral:</span>
                <span className="font-bold text-emerald-600">{selectedShed.comfortStatus}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-gray-900">Registrar Novo Galpão / Leitura</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Nome da Instalação *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Fase / Setor</label>
                  <select
                    value={phase}
                    onChange={e => setPhase(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-bold"
                  >
                    <option value="maternidade">Maternidade</option>
                    <option value="creche">Creche</option>
                    <option value="crescimento">Crescimento</option>
                    <option value="terminacao">Terminação</option>
                    <option value="gestacao">Gestação</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Temperatura (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temp}
                    onChange={e => setTemp(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Umidade Relativa (%)</label>
                  <input
                    type="number"
                    value={humidity}
                    onChange={e => setHumidity(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Amônia (NH₃ ppm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ammonia}
                    onChange={e => setAmmonia(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-600 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
