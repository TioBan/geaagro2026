import React, { useState } from 'react';
import { Check, Clock, Save, Thermometer } from 'lucide-react';
import {
  HydroponicEnvironmentSensors,
  IrrigationTimerSchedule,
} from '../../types/hydroponics';
import {
  calculateVpdKpa,
  HYDRO_INPUT_CLASS,
  HYDRO_LABEL_CLASS,
} from './hydroponicsUi';

interface HydroponicsEnvironmentAndTimerViewProps {
  mode: 'ambiente' | 'irrigacao';
  sensors: HydroponicEnvironmentSensors;
  onSaveSensors: (updated: HydroponicEnvironmentSensors) => void;
  schedule: IrrigationTimerSchedule;
  onSaveSchedule: (updated: IrrigationTimerSchedule) => void;
}

export const HydroponicsEnvironmentAndTimerView: React.FC<
  HydroponicsEnvironmentAndTimerViewProps
> = ({ mode, sensors, onSaveSensors, schedule, onSaveSchedule }) => {
  const [sensorDraft, setSensorDraft] = useState<HydroponicEnvironmentSensors>(sensors);
  const [scheduleDraft, setScheduleDraft] = useState<IrrigationTimerSchedule>(schedule);

  if (mode === 'ambiente') {
    const hasReading =
      sensors.airTempC > 0 || sensors.relativeHumidityPercent > 0 || sensors.lightLux > 0;

    const tempStatus =
      !hasReading || sensors.airTempC <= 0
        ? 'Sem leitura'
        : sensors.airTempC >= 18 && sensors.airTempC <= 28
        ? 'Faixa ideal (18–28 °C)'
        : sensors.airTempC > 28
        ? 'Elevada (>28 °C)'
        : 'Baixa (<18 °C)';

    const rhStatus =
      !hasReading || sensors.relativeHumidityPercent <= 0
        ? 'Sem leitura'
        : sensors.relativeHumidityPercent >= 55 && sensors.relativeHumidityPercent <= 75
        ? 'Adequada (55–75%)'
        : sensors.relativeHumidityPercent > 75
        ? 'Alta (risco fúngico)'
        : 'Baixa (estresse hídrico)';

    const vpdStatus =
      !hasReading || sensors.vpdKpa <= 0
        ? 'Sem leitura'
        : sensors.vpdKpa >= 0.8 && sensors.vpdKpa <= 1.2
        ? 'Ótimo p/ transpiração'
        : sensors.vpdKpa > 1.2
        ? 'Demanda evaporativa alta'
        : 'Baixa transpiração';

    const handleTempOrRhChange = (field: 'airTempC' | 'relativeHumidityPercent', val: number) => {
      setSensorDraft((prev) => {
        const next = { ...prev, [field]: val };
        next.vpdKpa = calculateVpdKpa(next.airTempC, next.relativeHumidityPercent);
        return next;
      });
    };

    const handleSubmitSensors = (e: React.FormEvent) => {
      e.preventDefault();
      onSaveSensors({
        ...sensorDraft,
        vpdKpa: calculateVpdKpa(sensorDraft.airTempC, sensorDraft.relativeHumidityPercent),
      });
    };

    return (
      <div className="space-y-4">
        {/* 6-Metric Climate Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 tabular-nums">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Temp. do Ar</span>
            <strong className="text-lg font-bold text-slate-900 dark:text-zinc-100 block mt-1">
              {sensors.airTempC > 0 ? `${sensors.airTempC.toFixed(1)} °C` : '—'}
            </strong>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">{tempStatus}</span>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Umidade (UR)</span>
            <strong className="text-lg font-bold text-sky-700 dark:text-sky-400 block mt-1">
              {sensors.relativeHumidityPercent > 0 ? `${sensors.relativeHumidityPercent}%` : '—'}
            </strong>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">{rhStatus}</span>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">VPD Calculado</span>
            <strong className="text-lg font-bold text-emerald-700 dark:text-emerald-400 block mt-1">
              {sensors.vpdKpa > 0 ? `${sensors.vpdKpa.toFixed(2)} kPa` : '—'}
            </strong>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">{vpdStatus}</span>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Luminosidade</span>
            <strong className="text-lg font-bold text-amber-700 dark:text-amber-400 block mt-1">
              {sensors.lightLux > 0 ? `${(sensors.lightLux / 1000).toFixed(1)}k lx` : '—'}
            </strong>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              {sensors.radiationWm2 > 0 ? `${sensors.radiationWm2} W/m²` : 'Sem radiação'}
            </span>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">CO₂ Interno</span>
            <strong className="text-lg font-bold text-slate-900 dark:text-zinc-100 block mt-1">
              {sensors.co2Ppm && sensors.co2Ppm > 0 ? `${sensors.co2Ppm} ppm` : '—'}
            </strong>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              {sensors.co2Ppm && sensors.co2Ppm >= 400 ? 'Monitorado' : 'Sem leitura'}
            </span>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Sombreamento</span>
            <strong className="text-lg font-bold text-slate-900 dark:text-zinc-100 block mt-1">
              {sensors.shadingScreenPercent}%
            </strong>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              {sensors.ventilationActive ? 'Ventilação ON' : 'Ventilação OFF'} ·{' '}
              {sensors.foggingActive ? 'Nebuliz. ON' : 'Nebuliz. OFF'}
            </span>
          </div>
        </div>

        {/* Sensor Input Form */}
        <form
          onSubmit={handleSubmitSensors}
          className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4"
        >
          <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Registrar Leitura Climática da Estufa
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              O déficit de pressão de vapor (VPD) é calculado automaticamente a partir da temperatura do ar e umidade relativa.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className={HYDRO_LABEL_CLASS}>Estufa / Setor</label>
              <input
                type="text"
                value={sensorDraft.greenhouseName}
                onChange={(e) =>
                  setSensorDraft((s) => ({ ...s, greenhouseName: e.target.value }))
                }
                placeholder="Ex: Estufa 01 - Folhosas"
                className={HYDRO_INPUT_CLASS}
              />
            </div>

            <div>
              <label className={HYDRO_LABEL_CLASS}>Temperatura do Ar (°C)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="60"
                value={sensorDraft.airTempC || ''}
                onChange={(e) => handleTempOrRhChange('airTempC', Number(e.target.value) || 0)}
                placeholder="24.5"
                className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
              />
            </div>

            <div>
              <label className={HYDRO_LABEL_CLASS}>Umidade Relativa (%)</label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={sensorDraft.relativeHumidityPercent || ''}
                onChange={(e) =>
                  handleTempOrRhChange('relativeHumidityPercent', Number(e.target.value) || 0)
                }
                placeholder="65"
                className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
              />
            </div>

            <div>
              <label className={HYDRO_LABEL_CLASS}>Luminosidade (Lux)</label>
              <input
                type="number"
                step="500"
                min="0"
                value={sensorDraft.lightLux || ''}
                onChange={(e) =>
                  setSensorDraft((s) => ({ ...s, lightLux: Number(e.target.value) || 0 }))
                }
                placeholder="35000"
                className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
              />
            </div>

            <div>
              <label className={HYDRO_LABEL_CLASS}>Radiação Solar (W/m²)</label>
              <input
                type="number"
                step="10"
                min="0"
                value={sensorDraft.radiationWm2 || ''}
                onChange={(e) =>
                  setSensorDraft((s) => ({ ...s, radiationWm2: Number(e.target.value) || 0 }))
                }
                placeholder="480"
                className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
              />
            </div>

            <div>
              <label className={HYDRO_LABEL_CLASS}>CO₂ (ppm)</label>
              <input
                type="number"
                step="10"
                min="0"
                value={sensorDraft.co2Ppm || ''}
                onChange={(e) =>
                  setSensorDraft((s) => ({ ...s, co2Ppm: Number(e.target.value) || 0 }))
                }
                placeholder="450"
                className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
              />
            </div>

            <div>
              <label className={HYDRO_LABEL_CLASS}>Tela Sombreamento (%)</label>
              <input
                type="number"
                step="5"
                min="0"
                max="100"
                value={sensorDraft.shadingScreenPercent}
                onChange={(e) =>
                  setSensorDraft((s) => ({
                    ...s,
                    shadingScreenPercent: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                  }))
                }
                className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <label className="inline-flex items-center gap-2 text-slate-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sensorDraft.ventilationActive}
                  onChange={(e) =>
                    setSensorDraft((s) => ({ ...s, ventilationActive: e.target.checked }))
                  }
                  className="rounded border-slate-300 dark:border-zinc-700 accent-emerald-600"
                />
                Ventilação forçada ativa
              </label>

              <label className="inline-flex items-center gap-2 text-slate-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sensorDraft.foggingActive}
                  onChange={(e) =>
                    setSensorDraft((s) => ({ ...s, foggingActive: e.target.checked }))
                  }
                  className="rounded border-slate-300 dark:border-zinc-700 accent-emerald-600"
                />
                Nebulização / resfriamento ativo
              </label>
            </div>

            <button
              type="submit"
              className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Salvar Leitura Climática
            </button>
          </div>
        </form>
      </div>
    );
  }

  /* MODE: IRRIGAÇÃO & TEMPORIZAÇÃO DE BOMBAS */
  const dayCycleTotal =
    Math.max(1, scheduleDraft.daytimeOnMinutes + scheduleDraft.daytimeOffMinutes);
  const daytimeDutyPct = Math.round((scheduleDraft.daytimeOnMinutes / dayCycleTotal) * 100);
  const estimatedDayRunMinutes = Math.round(12.5 * 60 * (scheduleDraft.daytimeOnMinutes / dayCycleTotal));
  const estimatedNightRuns =
    scheduleDraft.nighttimeOffIntervalHours > 0
      ? Math.floor(11.5 / scheduleDraft.nighttimeOffIntervalHours)
      : 0;
  const totalRunMinutesDay =
    estimatedDayRunMinutes + estimatedNightRuns * scheduleDraft.nighttimeOnMinutes;
  const estimatedDailyRecirculationL = Math.round(
    totalRunMinutesDay * (scheduleDraft.averageFlowRateLitersMin || 0)
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSaveSchedule(scheduleDraft);
      }}
      className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Programação de Ciclos das Bombas (NFT / DFT)
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Configure temporização diurna, pulsos noturnos, vazão média e modo operacional.
          </p>
        </div>

        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 self-start sm:self-auto">
          {(['ativo', 'pausado', 'manual'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setScheduleDraft((s) => ({ ...s, status: st }))}
              className={`h-7 px-2.5 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer ${
                scheduleDraft.status === st
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 tabular-nums">
        <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Fator de Trabalho (Dia)</span>
          <strong className="text-sm text-slate-900 dark:text-zinc-100">{daytimeDutyPct}% ligado</strong>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Tempo Ativo / 24h</span>
          <strong className="text-sm text-slate-900 dark:text-zinc-100">
            {(totalRunMinutesDay / 60).toFixed(1)} h/dia
          </strong>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Pulsos Noturnos</span>
          <strong className="text-sm text-slate-900 dark:text-zinc-100">
            {estimatedNightRuns} ciclos ({scheduleDraft.nighttimeOnMinutes} min)
          </strong>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Recirculação Est.</span>
          <strong className="text-sm text-sky-700 dark:text-sky-400">
            {estimatedDailyRecirculationL.toLocaleString('pt-BR')} L/dia
          </strong>
        </div>
      </div>

      {/* Day & Night Schedules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 p-3.5 space-y-3">
          <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 block">
            Ciclo Diurno ({scheduleDraft.startTimeDaytime} às {scheduleDraft.endTimeDaytime})
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={HYDRO_LABEL_CLASS}>Início Diurno</label>
              <input
                type="time"
                value={scheduleDraft.startTimeDaytime}
                onChange={(e) =>
                  setScheduleDraft((s) => ({ ...s, startTimeDaytime: e.target.value }))
                }
                className={`${HYDRO_INPUT_CLASS} font-mono`}
              />
            </div>
            <div>
              <label className={HYDRO_LABEL_CLASS}>Fim Diurno</label>
              <input
                type="time"
                value={scheduleDraft.endTimeDaytime}
                onChange={(e) =>
                  setScheduleDraft((s) => ({ ...s, endTimeDaytime: e.target.value }))
                }
                className={`${HYDRO_INPUT_CLASS} font-mono`}
              />
            </div>
            <div>
              <label className={HYDRO_LABEL_CLASS}>Ligado (min)</label>
              <input
                type="number"
                min="1"
                value={scheduleDraft.daytimeOnMinutes}
                onChange={(e) =>
                  setScheduleDraft((s) => ({
                    ...s,
                    daytimeOnMinutes: Math.max(1, Number(e.target.value) || 1),
                  }))
                }
                className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
              />
            </div>
            <div>
              <label className={HYDRO_LABEL_CLASS}>Desligado (min)</label>
              <input
                type="number"
                min="0"
                value={scheduleDraft.daytimeOffMinutes}
                onChange={(e) =>
                  setScheduleDraft((s) => ({
                    ...s,
                    daytimeOffMinutes: Math.max(0, Number(e.target.value) || 0),
                  }))
                }
                className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 p-3.5 space-y-3">
          <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 block">
            Ciclo Noturno &amp; Hidráulica
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={HYDRO_LABEL_CLASS}>Pulso Noturno Ligado (min)</label>
              <input
                type="number"
                min="0"
                value={scheduleDraft.nighttimeOnMinutes}
                onChange={(e) =>
                  setScheduleDraft((s) => ({
                    ...s,
                    nighttimeOnMinutes: Math.max(0, Number(e.target.value) || 0),
                  }))
                }
                className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
              />
            </div>
            <div>
              <label className={HYDRO_LABEL_CLASS}>Intervalo Noturno (horas)</label>
              <input
                type="number"
                min="1"
                max="12"
                value={scheduleDraft.nighttimeOffIntervalHours}
                onChange={(e) =>
                  setScheduleDraft((s) => ({
                    ...s,
                    nighttimeOffIntervalHours: Math.max(1, Number(e.target.value) || 1),
                  }))
                }
                className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
              />
            </div>
            <div className="col-span-2">
              <label className={HYDRO_LABEL_CLASS}>Vazão Média do Conjunto (L/min)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={scheduleDraft.averageFlowRateLitersMin}
                onChange={(e) =>
                  setScheduleDraft((s) => ({
                    ...s,
                    averageFlowRateLitersMin: Math.max(0, Number(e.target.value) || 0),
                  }))
                }
                className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-zinc-800">
        <button
          type="submit"
          className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          Salvar Programação de Temporizadores
        </button>
      </div>
    </form>
  );
};
