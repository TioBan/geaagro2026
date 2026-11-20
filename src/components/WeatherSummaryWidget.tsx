import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Thermometer, Wind, Droplets, CloudRain, CloudSun, ArrowRight, RefreshCw } from 'lucide-react';
import { initialFarmWeatherStation } from '../data/weatherData';
import { fetchRealtimeWeatherDataForFarm } from '../services/weatherApi';
import { FarmWeatherStation } from '../types/weather';
import { Farm } from '../types/agronomy';

export const WeatherSummaryWidget: React.FC<{ farm?: Farm; onClickDetails?: () => void }> = ({
  farm,
  onClickDetails,
}) => {
  const [station, setStation] = useState<FarmWeatherStation>(initialFarmWeatherStation);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadRealtimeData = useCallback(async () => {
    if (!farm || (!farm.city && !farm.latitude)) {
      return;
    }
    setLoading(true);
    try {
      const live = await fetchRealtimeWeatherDataForFarm(farm);
      if (!isMountedRef.current) return;
      setStation(live.station);
      setLastUpdated(
        live.fetchedAt.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    } catch (err) {
      if (isMountedRef.current) {
        console.warn('Erro ao carregar telemetria em tempo real:', err);
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [farm?.id, farm?.latitude, farm?.longitude, farm?.city, farm?.state, farm?.name]);

  useEffect(() => {
    loadRealtimeData();
    const timer = setInterval(() => {
      loadRealtimeData();
    }, 60000);
    return () => clearInterval(timer);
  }, [loadRealtimeData]);

  const dewPointDisplay =
    station.dewPointC !== undefined
      ? `${station.dewPointC}°C`
      : `${((station.currentAirTempC || 24) - 4).toFixed(1)}°C`;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
      <div className="px-4 py-3.5 sm:px-5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <CloudSun className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Climatologia e estação local
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
              {station.name}
              {lastUpdated ? ` · Atualizado às ${lastUpdated}` : ' · Telemetria local'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={loadRealtimeData}
            disabled={loading}
            title="Atualizar dados climáticos"
            className="h-7 w-7 inline-flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-500' : ''}`} />
          </button>
          {onClickDetails && (
            <button
              type="button"
              onClick={onClickDetails}
              className="h-7 px-2.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Ver clima</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-slate-200 dark:border-zinc-800 divide-y lg:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800">
        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>Temperatura</span>
            <Thermometer className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
            {station.currentAirTempC !== 0 ? station.currentAirTempC : '--'}
            <span className="text-xs font-normal text-slate-500 dark:text-zinc-400 ml-0.5">°C</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            Orvalho {dewPointDisplay} · {station.currentSolarRadiationWm2} W/m²
          </p>
        </div>

        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>Umidade</span>
            <Droplets className="w-3.5 h-3.5 text-sky-500" />
          </div>
          <div className="text-xl font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
            {station.currentHumidityPercent}
            <span className="text-xs font-normal text-slate-500 dark:text-zinc-400 ml-0.5">%</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            Pressão {station.currentAtmosphericPressureHpa} hPa
          </p>
        </div>

        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>Vento</span>
            <Wind className="w-3.5 h-3.5 text-sky-500" />
          </div>
          <div className="text-xl font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
            {station.currentWindSpeedKmh}
            <span className="text-xs font-normal text-slate-500 dark:text-zinc-400 ml-1">km/h</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            Rajadas {station.currentWindGustKmh} km/h
          </p>
        </div>

        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>Chuva hoje</span>
            <CloudRain className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-xl font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
            {station.rainAccumulatedTodayMm}
            <span className="text-xs font-normal text-slate-500 dark:text-zinc-400 ml-1">mm</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            Acumulado mensal {station.rainAccumulatedMonthMm} mm
          </p>
        </div>
      </div>
    </div>
  );
};
