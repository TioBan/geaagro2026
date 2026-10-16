// @ts-nocheck
import React, { useState } from 'react';
import {
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Compass,
  Zap,
  Info,
  ShieldCheck,
  CloudRain,
} from 'lucide-react';
import { WeatherCondition } from '../../types/tankMix';
import { evaluateApplicationWindow, calculateDeltaT } from '../../data/tankMixData';

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Tecnologia de Aplicação & Clima
            </span>
            <span className="text-xs text-gray-500">• Avaliação da Janela de Pulverização</span>
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 mt-1">Condições Ambientais & Delta T ($\Delta T$)</h1>
          <p className="text-xs text-gray-600 mt-1">
            O Delta T correlaciona temperatura e umidade relativa para predizer a taxa de evaporação e a vida útil da gota no trajeto do bico até o alvo vegetal.
          </p>
        </div>
      </div>

      {/* Main Grid: Controls vs Live Interpretation & Droplet Spectrum */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Environmental Sliders */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-600" />
            Parâmetros Meteorológicos no Momento da Aplicação
          </h2>

          <div className="space-y-4">
            {/* Temperatura */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-rose-500" />
                  Temperatura do Ar (°C)
                </label>
                <span className="text-sm font-extrabold text-gray-900">{weather.temperatureC} °C</span>
              </div>
              <input
                type="range"
                min={10}
                max={45}
                step={1}
                value={weather.temperatureC}
                onChange={e => handleUpdate('temperatureC', Number(e.target.value))}
                className="w-full accent-amber-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>10°C (Frio)</span>
                <span>Ideal: 18°C a 28°C</span>
                <span>45°C (Calor Extremo)</span>
              </div>
            </div>

            {/* Umidade Relativa */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  Umidade Relativa do Ar (%)
                </label>
                <span className="text-sm font-extrabold text-gray-900">{weather.relativeHumidityPct} %</span>
              </div>
              <input
                type="range"
                min={20}
                max={100}
                step={1}
                value={weather.relativeHumidityPct}
                onChange={e => handleUpdate('relativeHumidityPct', Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>20% (Seco - Evaporação)</span>
                <span>Ideal: &gt; 55%</span>
                <span>100% (Saturado)</span>
              </div>
            </div>

            {/* Velocidade do Vento */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-teal-500" />
                  Velocidade do Vento (km/h)
                </label>
                <span className="text-sm font-extrabold text-gray-900">{weather.windSpeedKmH} km/h</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                step={1}
                value={weather.windSpeedKmH}
                onChange={e => handleUpdate('windSpeedKmH', Number(e.target.value))}
                className="w-full accent-teal-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>0 km/h (Inversão)</span>
                <span>Ideal: 3 a 10 km/h</span>
                <span>&gt; 15 km/h (Deriva Crítica)</span>
              </div>
            </div>

            {/* Previsão de Chuva */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-indigo-500" />
                  Previsão de Chuva (Horas até ocorrer)
                </label>
                <span className="text-sm font-extrabold text-gray-900">
                  {weather.rainForecastHours === 0 ? 'Sem chuva prevista' : `${weather.rainForecastHours} horas`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={24}
                step={1}
                value={weather.rainForecastHours}
                onChange={e => handleUpdate('rainForecastHours', Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>0h</span>
                <span>Exigência: 2h a 4h de secagem</span>
                <span>24h+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delta T Gauge & Application Decision */}
        <div className="lg:col-span-6 space-y-6">
          {/* Delta T Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Diagnóstico de Delta T ($\Delta T$)</h3>
                <p className="text-xs text-gray-500">Diferença psicrométrica de bulbo seco e úmido</p>
              </div>

              <div
                className={`text-2xl font-black px-4 py-1.5 rounded-2xl border ${
                  deltaT >= 2 && deltaT <= 8
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : deltaT < 2
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-rose-50 text-rose-700 border-rose-300'
                }`}
              >
                {deltaT.toFixed(1)} °C
              </div>
            </div>

            {/* Delta T Scale Bar */}
            <div className="space-y-1">
              <div className="h-4 w-full rounded-full overflow-hidden flex shadow-inner">
                <div className="w-[20%] bg-amber-400" title="0 a 2°C: Muito Baixo (Gotas lentas para secar)" />
                <div className="w-[60%] bg-emerald-500" title="2 a 8°C: Faixa Ideal de Pulverização" />
                <div className="w-[20%] bg-rose-500" title="> 8°C: Evaporação Severa" />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                <span>0°C</span>
                <span className="text-emerald-700 font-bold">2°C (Ideal) 8°C</span>
                <span>12°C+</span>
              </div>
            </div>

            {/* Status Feedback Box */}
            <div
              className={`p-4 rounded-xl border text-xs leading-relaxed ${
                currentEvaluation.status === 'ideal'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : currentEvaluation.status === 'aceitavel'
                  ? 'bg-blue-50 border-blue-200 text-blue-950'
                  : currentEvaluation.status === 'desfavoravel'
                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-2 font-bold mb-1">
                {currentEvaluation.status === 'ideal' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                )}
                <span>
                  {currentEvaluation.status === 'ideal'
                    ? '🟢 Janela Operacional Ideal para Pulverização'
                    : currentEvaluation.status === 'aceitavel'
                    ? '🔵 Condições Aceitáveis com Monitoramento'
                    : currentEvaluation.status === 'desfavoravel'
                    ? '🟡 Condições Desfavoráveis'
                    : '🔴 Aplicação Não Recomendada (Alto Risco de Deriva/Evaporação)'}
                </span>
              </div>
              <p className="mt-1">{currentEvaluation.notes}</p>
            </div>
          </div>

          {/* Droplet & Nozzle Advisory */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Recomendação de Bicos & Espectro de Gotas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="font-bold text-gray-900">Herbicidas Sistêmicos (Glifosato/2,4-D)</div>
                <div className="text-emerald-700 font-bold text-[11px] mt-0.5">Gotas Grossas a Muito Grossas</div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Bicos com Indução de Ar (AI / AVI / TTI). Minimizam a deriva e o arraste pelo vento.
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="font-bold text-gray-900">Fungicidas & Inseticidas (Dossel)</div>
                <div className="text-blue-700 font-bold text-[11px] mt-0.5">Gotas Médias a Finas</div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Bicos Leque Duplo ou Cone Vazio. Proporcionam alta densidade de gotas (70-100 gotas/cm²).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
