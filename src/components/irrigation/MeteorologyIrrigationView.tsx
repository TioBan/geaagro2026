import React, { useState } from 'react';
import { ClimateDayRecord } from '../../types/irrigation';
import { calculateET0PenmanMonteith } from '../../utils/irrigationStorage';
import { Sun, CloudRain, Wind, Thermometer, Calendar, Plus, Radio, Calculator } from 'lucide-react';

interface Props {
  climate: ClimateDayRecord[];
  onAddClimateRecord: (record: ClimateDayRecord) => void;
}

export const MeteorologyIrrigationView: React.FC<Props> = ({
  climate,
  onAddClimateRecord,
}) => {
  const [tMax, setTMax] = useState(33.5);
  const [tMin, setTMin] = useState(21.0);
  const [humidity, setHumidity] = useState(60);
  const [windSpeed, setWindSpeed] = useState(2.8);
  const [solarRad, setSolarRad] = useState(22.0);
  const [rainfall, setRainfall] = useState(0);

  const calculatedEt0 = calculateET0PenmanMonteith(tMax, tMin, humidity, windSpeed, solarRad);

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: ClimateDayRecord = {
      id: `clim-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      farmId: 'farm-1',
      tempMaxC: tMax,
      tempMinC: tMin,
      tempAvgC: Math.round(((tMax + tMin) / 2) * 10) / 10,
      humidityRelativePct: humidity,
      windSpeedMs: windSpeed,
      solarRadiationMjM2: solarRad,
      atmosphericPressureKpa: 96.5,
      rainfallMm: rainfall,
      effectiveRainfallMm: Math.max(0, rainfall - 5),
      evaporationMm: calculatedEt0 * 0.9,
      et0MmDay: calculatedEt0,
    };

    onAddClimateRecord(newRecord);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500" />
            Meteorologia & Cálculo de Evapotranspiração (ET₀)
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Monitoramento de temperatura, radiação, umidade e vento com cálculo Penman-Monteith (FAO-56)
          </p>
        </div>

        {/* Badge de Integração de Sensores */}
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300">
          <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span>Estação Meteorológica GeaAgro Sincronizada</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário / Calculadora de ET0 */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-cyan-600" />
              Lançar Leitura Diária & ET₀
            </h4>
            <span className="text-[10px] text-cyan-600 font-bold uppercase">Penman-Monteith</span>
          </div>

          <form onSubmit={handleCreateRecord} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Temp. Máx (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={tMax}
                  onChange={e => setTMax(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Temp. Mín (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={tMin}
                  onChange={e => setTMin(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Umidade Relat. (%)</label>
                <input
                  type="number"
                  value={humidity}
                  onChange={e => setHumidity(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Vento u2 (m/s)</label>
                <input
                  type="number"
                  step="0.1"
                  value={windSpeed}
                  onChange={e => setWindSpeed(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Radiação Solar (MJ/m²)</label>
                <input
                  type="number"
                  step="0.1"
                  value={solarRad}
                  onChange={e => setSolarRad(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Chuva / Pluviômetro (mm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={rainfall}
                  onChange={e => setRainfall(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Resultado da ET0 Calculada em tempo real */}
            <div className="bg-cyan-950/30 border border-cyan-800/50 p-4 rounded-xl text-center space-y-1">
              <span className="text-[10px] text-cyan-300 font-black uppercase tracking-wider block">
                Evapotranspiração Calculada
              </span>
              <div className="text-2xl font-black text-white">
                ET₀ = {calculatedEt0} mm/dia
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Registar Leitura Diária
            </button>
          </form>
        </div>

        {/* Histórico Climatológico */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-600" />
              Histórico de Registros Meteorológicos ({climate.length})
            </h4>
          </div>

          <div className="space-y-3">
            {climate.map(c => (
              <div
                key={c.id}
                className="p-4 bg-slate-50 dark:bg-zinc-950/60 rounded-xl border border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                    {new Date(c.date).toLocaleDateString('pt-BR')}
                  </span>
                  <div className="flex items-center gap-3 mt-1 text-slate-700 dark:text-zinc-300">
                    <span>Temp: <strong>{c.tempMaxC}°C / {c.tempMinC}°C</strong></span>
                    <span>UR: <strong>{c.humidityRelativePct}%</strong></span>
                    <span>Vento: <strong>{c.windSpeedMs} m/s</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Chuva</span>
                    <strong className="text-blue-600 dark:text-blue-400 text-sm">{c.rainfallMm} mm</strong>
                  </div>

                  <div className="bg-cyan-100 dark:bg-cyan-950 px-3 py-1.5 rounded-lg border border-cyan-200 dark:border-cyan-800">
                    <span className="text-[10px] text-cyan-800 dark:text-cyan-300 block font-bold">ET₀</span>
                    <strong className="text-cyan-700 dark:text-cyan-300 text-sm">{c.et0MmDay} mm/dia</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
