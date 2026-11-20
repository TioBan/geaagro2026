import React from 'react';
import {
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  CloudRain,
  XCircle,
} from 'lucide-react';
import { WeatherCondition } from '../../types/tankMix';
import { evaluateApplicationWindow } from '../../data/tankMixData';

interface Props {
  weather: WeatherCondition;
  setWeather: React.Dispatch<React.SetStateAction<WeatherCondition>>;
}

export const TankMixWeatherApplicationView: React.FC<Props> = ({ weather, setWeather }) => {
  const currentEvaluation = evaluateApplicationWindow(
    weather.temperatureC,
    weather.relativeHumidityPct,
    weather.windSpeedKmH,
    weather.rainForecastHours
  );

  const deltaT = currentEvaluation.deltaT;
  const deltaTMarkerPct = Math.min(100, Math.max(0, (deltaT / 12) * 100));

  const handleUpdate = (field: keyof WeatherCondition, val: number) => {
    setWeather(prev => {
      const updated = { ...prev, [field]: val };
      const evalRes = evaluateApplicationWindow(
        updated.temperatureC,
        updated.relativeHumidityPct,
        updated.windSpeedKmH,
        updated.rainForecastHours
      );
      return {
        ...updated,
        deltaT: evalRes.deltaT,
        applicationWindowStatus: evalRes.status,
        windowNotes: evalRes.notes,
      };
    });
  };

  const deltaTTone =
    deltaT >= 2 && deltaT <= 8
      ? 'text-emerald-700 dark:text-emerald-400'
      : deltaT < 2
      ? 'text-amber-700 dark:text-amber-400'
      : 'text-rose-700 dark:text-rose-400';

  const statusMeta =
    currentEvaluation.status === 'ideal'
      ? {
          icon: CheckCircle2,
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          boxClass:
            'border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100',
          label: 'Janela operacional ideal para pulverização',
        }
      : currentEvaluation.status === 'aceitavel'
      ? {
          icon: CheckCircle2,
          iconColor: 'text-sky-600 dark:text-sky-400',
          boxClass:
            'border-sky-200 dark:border-sky-800/70 bg-sky-50/70 dark:bg-sky-950/30 text-sky-950 dark:text-sky-100',
          label: 'Condições aceitáveis com monitoramento',
        }
      : currentEvaluation.status === 'desfavoravel'
      ? {
          icon: AlertTriangle,
          iconColor: 'text-amber-600 dark:text-amber-400',
          boxClass:
            'border-amber-200 dark:border-amber-800/70 bg-amber-50/70 dark:bg-amber-950/30 text-amber-950 dark:text-amber-100',
          label: 'Condições desfavoráveis',
        }
      : {
          icon: XCircle,
          iconColor: 'text-rose-600 dark:text-rose-400',
          boxClass:
            'border-rose-200 dark:border-rose-800/70 bg-rose-50/70 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100',
          label: 'Aplicação não recomendada (alto risco de deriva/evaporação)',
        };

  const StatusIcon = statusMeta.icon;

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
          Condições Ambientais e Delta T (ΔT)
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Correlação entre temperatura e umidade relativa para estimar evaporação, deriva e janela de pulverização
        </p>
      </div>

      {/* Grade Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Controles Meteorológicos */}
        <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Parâmetros Meteorológicos no Campo
            </h3>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {/* Temperatura */}
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-center gap-2">
                <label
                  htmlFor="weather-temp"
                  className="text-xs font-medium text-slate-800 dark:text-zinc-200 flex items-center gap-1.5"
                >
                  <Thermometer className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>Temperatura do ar</span>
                </label>
                <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                  {weather.temperatureC} °C
                </span>
              </div>
              <input
                id="weather-temp"
                type="range"
                min={10}
                max={45}
                step={1}
                value={weather.temperatureC}
                onChange={e => handleUpdate('temperatureC', Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-500 tabular-nums">
                <span>10 °C</span>
                <span>Ideal: 18 a 28 °C</span>
                <span>45 °C</span>
              </div>
            </div>

            {/* Umidade Relativa */}
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-center gap-2">
                <label
                  htmlFor="weather-rh"
                  className="text-xs font-medium text-slate-800 dark:text-zinc-200 flex items-center gap-1.5"
                >
                  <Droplets className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span>Umidade relativa do ar</span>
                </label>
                <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                  {weather.relativeHumidityPct} %
                </span>
              </div>
              <input
                id="weather-rh"
                type="range"
                min={20}
                max={100}
                step={1}
                value={weather.relativeHumidityPct}
                onChange={e => handleUpdate('relativeHumidityPct', Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-500 tabular-nums">
                <span>20% (Seco)</span>
                <span>Ideal: &gt; 55%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Vento */}
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-center gap-2">
                <label
                  htmlFor="weather-wind"
                  className="text-xs font-medium text-slate-800 dark:text-zinc-200 flex items-center gap-1.5"
                >
                  <Wind className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <span>Velocidade do vento</span>
                </label>
                <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                  {weather.windSpeedKmH} km/h
                </span>
              </div>
              <input
                id="weather-wind"
                type="range"
                min={0}
                max={30}
                step={1}
                value={weather.windSpeedKmH}
                onChange={e => handleUpdate('windSpeedKmH', Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-500 tabular-nums">
                <span>0 km/h (Inversão)</span>
                <span>Ideal: 3 a 10 km/h</span>
                <span>30 km/h</span>
              </div>
            </div>

            {/* Previsão de Chuva */}
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-center gap-2">
                <label
                  htmlFor="weather-rain"
                  className="text-xs font-medium text-slate-800 dark:text-zinc-200 flex items-center gap-1.5"
                >
                  <CloudRain className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Previsão de chuva (horas até ocorrer)</span>
                </label>
                <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                  {weather.rainForecastHours === 0 ? 'Sem previsão' : `${weather.rainForecastHours} h`}
                </span>
              </div>
              <input
                id="weather-rain"
                type="range"
                min={0}
                max={24}
                step={1}
                value={weather.rainForecastHours}
                onChange={e => handleUpdate('rainForecastHours', Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-500 tabular-nums">
                <span>0 h</span>
                <span>Mínimo: 2 h a 4 h sem chuva</span>
                <span>24 h+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnóstico de Delta T e Espectro de Gotas */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Diagnóstico de Delta T (ΔT)
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Diferença psicrométrica entre bulbo seco e bulbo úmido
                </p>
              </div>

              <div className={`text-2xl font-semibold tabular-nums ${deltaTTone}`}>
                {deltaT.toFixed(1)} °C
              </div>
            </div>

            {/* Escala Delta T com Marcador */}
            <div className="space-y-1.5">
              <div className="relative pt-1">
                <div className="h-2.5 w-full rounded-full overflow-hidden flex">
                  <div className="w-[16.7%] bg-amber-400/90" title="0 a 2 °C: Evaporação lenta / risco de inversão" />
                  <div className="w-[50%] bg-emerald-500" title="2 a 8 °C: Faixa ideal de pulverização" />
                  <div className="w-[33.3%] bg-rose-500" title="> 8 °C: Evaporação severa" />
                </div>
                <div
                  className="absolute top-0 -translate-x-1/2 w-2.5 h-4 rounded-xs bg-slate-900 dark:bg-white border border-white dark:border-zinc-900 shadow-xs transition-all"
                  style={{ left: `${deltaTMarkerPct}%` }}
                  aria-hidden="true"
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-500 font-mono tabular-nums">
                <span>0 °C</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                  2 °C — Ideal — 8 °C
                </span>
                <span>12 °C+</span>
              </div>
            </div>

            {/* Parecer Operacional */}
            <div className={`p-3.5 rounded-lg border text-xs leading-relaxed ${statusMeta.boxClass}`}>
              <div className="flex items-center gap-2 font-semibold mb-1">
                <StatusIcon className={`w-4 h-4 shrink-0 ${statusMeta.iconColor}`} />
                <span>{statusMeta.label}</span>
              </div>
              <p className="pl-6 opacity-90">{currentEvaluation.notes}</p>
            </div>
          </div>

          {/* Recomendação de Bicos */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800">
              <h4 className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                Recomendação de Pontas e Espectro de Gotas
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-zinc-800 text-xs">
              <div className="p-4 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-zinc-100">
                  Herbicidas sistêmicos (Glifosato / 2,4-D)
                </div>
                <div className="text-emerald-700 dark:text-emerald-400 font-medium text-[11px]">
                  Gotas grossas a muito grossas
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Pontas com indução de ar (AI / AVI / TTI) minimizam deriva e arraste pelo vento.
                </p>
              </div>

              <div className="p-4 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-zinc-100">
                  Fungicidas e inseticidas (Dossel)
                </div>
                <div className="text-sky-700 dark:text-sky-400 font-medium text-[11px]">
                  Gotas médias a finas
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Pontas leque duplo ou cone vazio aumentam a cobertura (70–100 gotas/cm²).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
