import React, { useEffect, useState, useCallback } from 'react';
import { Thermometer, Wind, Droplets, CloudRain, CloudSun, ArrowRight, RefreshCw, MapPin } from 'lucide-react';
import { initialFarmWeatherStation } from '../data/weatherData';
import { fetchRealtimeWeatherDataForFarm } from '../services/weatherApi';
import { FarmWeatherStation } from '../types/weather';
import { Farm } from '../types/agronomy';

export const WeatherSummaryWidget: React.FC<{ farm?: Farm; onClickDetails?: () => void }> = ({ farm, onClickDetails }) => {
  const [station, setStation] = useState<FarmWeatherStation>(initialFarmWeatherStation);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadRealtimeData = useCallback(async () => {
    setLoading(true);
    try {
      const live = await fetchRealtimeWeatherDataForFarm(farm);
      setStation(live.station);
      setLastUpdated(live.fetchedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.warn('Erro ao carregar telemetria em tempo real:', err);
    } finally {
      setLoading(false);
    }
  }, [farm?.id, farm?.latitude, farm?.longitude, farm?.city, farm?.state, farm?.name]);

  useEffect(() => {
    loadRealtimeData();
    const timer = setInterval(() => {
      loadRealtimeData();
    }, 60000); // 60s auto refresh
    return () => clearInterval(timer);
  }, [loadRealtimeData]);

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs p-5 sm:p-6 transition-colors">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <CloudSun className="w-5 h-5 text-sky-500" />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-slate-700 dark:text-zinc-200 uppercase text-xs tracking-wider">
                Climatologia & Estação Local
              </h3>
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Tempo Real
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-400 mt-0.5 flex items-center gap-2">
              <span>{station.name}</span>
              {lastUpdated && <span>• Atualizado às {lastUpdated}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadRealtimeData}
            disabled={loading}
            title="Atualizar dados de temperatura em tempo real"
            className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-500' : ''}`} />
          </button>
          {onClickDetails && (
            <button
              onClick={onClickDetails}
              className="text-xs text-sky-700 dark:text-sky-400 font-semibold hover:underline flex items-center gap-1"
            >
              Ver Dashboard Climático <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-lg border border-slate-100 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 dark:text-zinc-400 uppercase font-bold">Temperatura em Tempo Real</span>
            <Thermometer className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-light text-slate-900 dark:text-zinc-100 flex items-baseline gap-1">
            <span>{station.currentAirTempC}</span>
            <small className="text-xs font-normal text-slate-500">°C</small>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded ml-auto">
              Ao Vivo
            </span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-zinc-400 flex justify-between">
            <span>Orvalho: {station.dewPointC !== undefined ? `${station.dewPointC}°C` : `${((station.currentAirTempC || 24) - 4).toFixed(1)}°C`}</span>
            <span>Radiação: {station.currentSolarRadiationWm2} W/m²</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-lg border border-slate-100 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 dark:text-zinc-400 uppercase font-bold">Umidade</span>
            <Droplets className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-light text-slate-900 dark:text-zinc-100">
            {station.currentHumidityPercent}<small className="text-xs font-normal text-slate-500">%</small>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-zinc-400">Pressão: {station.currentAtmosphericPressureHpa} hPa</div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-lg border border-slate-100 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 dark:text-zinc-400 uppercase font-bold">Vento (Km/h)</span>
            <Wind className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-light text-slate-900 dark:text-zinc-100">
            {station.currentWindSpeedKmh}<small className="text-xs font-normal text-slate-500"> km/h</small>
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Rajadas: {station.currentWindGustKmh} km/h</div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-lg border border-slate-100 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 dark:text-zinc-400 uppercase font-bold">Chuva</span>
            <CloudRain className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-light text-slate-900 dark:text-zinc-100">
            {station.rainAccumulatedTodayMm}<small className="text-xs font-normal text-slate-500"> mm</small>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-zinc-400">Mensal: {station.rainAccumulatedMonthMm} mm</div>
        </div>
      </div>
    </div>
  );
};
