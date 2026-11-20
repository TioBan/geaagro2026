import React, { useState } from 'react';
import { ClimateDayRecord } from '../../types/irrigation';
import { calculateET0PenmanMonteith } from '../../utils/irrigationStorage';
import { Sun, Calendar, Plus, Calculator } from 'lucide-react';
import {
  formatBrDate,
  IRRIGATION_INPUT_CLASS,
  IRRIGATION_LABEL_CLASS,
} from './irrigationUi';

interface Props {
  climate: ClimateDayRecord[];
  onAddClimateRecord: (record: ClimateDayRecord) => void;
}

export const MeteorologyIrrigationView: React.FC<Props> = ({
  climate,
  onAddClimateRecord,
}) => {
  const [recordDate, setRecordDate] = useState(() => new Date().toISOString().split('T')[0]);
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
      date: recordDate || new Date().toISOString().split('T')[0],
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
      evaporationMm: Math.round(calculatedEt0 * 0.9 * 10) / 10,
      et0MmDay: calculatedEt0,
    };

    onAddClimateRecord(newRecord);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Sun className="w-4 h-4 text-amber-500" />
            Meteorologia &amp; Evapotranspiração de Referência (ET₀)
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Registro diário de temperatura, radiação, umidade, vento e precipitação com cálculo Penman-Monteith (FAO-56).
          </p>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums shrink-0">
          {climate.length} {climate.length === 1 ? 'leitura registrada' : 'leituras registradas'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ET0 Calculator Form */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-zinc-800">
            <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Lançar Leitura Diária
            </h4>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">FAO-56</span>
          </div>

          <form onSubmit={handleCreateRecord} className="space-y-3">
            <div>
              <label className={IRRIGATION_LABEL_CLASS}>Data da Leitura</label>
              <input
                type="date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                className={IRRIGATION_INPUT_CLASS}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={IRRIGATION_LABEL_CLASS}>Temp. Máx (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={tMax}
                  onChange={(e) => setTMax(Number(e.target.value))}
                  className={IRRIGATION_INPUT_CLASS}
                />
              </div>
              <div>
                <label className={IRRIGATION_LABEL_CLASS}>Temp. Mín (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={tMin}
                  onChange={(e) => setTMin(Number(e.target.value))}
                  className={IRRIGATION_INPUT_CLASS}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={IRRIGATION_LABEL_CLASS}>Umidade Relat. (%)</label>
                <input
                  type="number"
                  value={humidity}
                  onChange={(e) => setHumidity(Number(e.target.value))}
                  className={IRRIGATION_INPUT_CLASS}
                />
              </div>
              <div>
                <label className={IRRIGATION_LABEL_CLASS}>Vento u2 (m/s)</label>
                <input
                  type="number"
                  step="0.1"
                  value={windSpeed}
                  onChange={(e) => setWindSpeed(Number(e.target.value))}
                  className={IRRIGATION_INPUT_CLASS}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={IRRIGATION_LABEL_CLASS}>Radiação (MJ/m²)</label>
                <input
                  type="number"
                  step="0.1"
                  value={solarRad}
                  onChange={(e) => setSolarRad(Number(e.target.value))}
                  className={IRRIGATION_INPUT_CLASS}
                />
              </div>
              <div>
                <label className={IRRIGATION_LABEL_CLASS}>Chuva (mm)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={rainfall}
                  onChange={(e) => setRainfall(Number(e.target.value))}
                  className={IRRIGATION_INPUT_CLASS}
                />
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-3 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                ET₀ Calculada
              </span>
              <span className="text-base font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                {calculatedEt0.toFixed(1)} mm/dia
              </span>
            </div>

            <button
              type="submit"
              className="w-full h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Registrar Leitura Diária
            </button>
          </form>
        </div>

        {/* Climate History */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
          <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
            Histórico Meteorológico ({climate.length})
          </h4>

          {climate.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 p-8 text-center">
              <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                Nenhuma leitura climática registrada
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Preencha os dados diários ao lado para calcular a ET₀ e alimentar o balanço hídrico.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    <th className="py-2 px-3">Data</th>
                    <th className="py-2 px-3">Temp (Máx/Mín)</th>
                    <th className="py-2 px-3">UR / Vento</th>
                    <th className="py-2 px-3 text-right">Chuva</th>
                    <th className="py-2 px-3 text-right">ET₀</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 tabular-nums">
                  {[...climate].reverse().map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40">
                      <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-zinc-100 whitespace-nowrap">
                        {formatBrDate(c.date)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                        {c.tempMaxC}°C / {c.tempMinC}°C
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                        {c.humidityRelativePct}% · {c.windSpeedMs} m/s
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-sky-700 dark:text-sky-400 whitespace-nowrap">
                        {c.rainfallMm} mm
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        {c.et0MmDay} mm/dia
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeteorologyIrrigationView;
