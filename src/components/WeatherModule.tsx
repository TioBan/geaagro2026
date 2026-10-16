import React, { useState, useMemo, useEffect } from 'react';
import {
  CloudSun,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  Compass,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Calendar,
  Sparkles,
  Tractor,
  Sprout,
  Activity,
  Layers,
  BarChart2,
  TrendingUp,
  MapPin,
  Clock,
  BookOpen,
  Eye,
  X,
  Check,
  Zap,
  Gauge,
  Sunrise,
  Sunset,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  LocateFixed,
} from 'lucide-react';
import {
  OperationalWindowIndex,
  HourlyForecastItem,
  DailyForecastItem,
  CropWeatherThreshold,
  WeatherAlertItem,
  FarmWeatherStation,
  HistoricalRainMonth,
  OperationalWindowRating,
} from '../types/weather';
import {
  operationalWindowIndices,
  hourlyForecastData,
  daily15ForecastData,
  cropWeatherThresholdsCatalog,
  weatherAlertsCatalog,
  initialFarmWeatherStation,
  historicalRainMonthlyData,
} from '../data/weatherData';
import {
  fetchRealtimeWeatherData,
  resolveFarmCoordinates,
  PRESET_AGRICULTURAL_LOCATIONS,
  WeatherLocation,
} from '../services/weatherApi';
import { ClimatologyLibraryView } from './ClimatologyLibraryView';
import { Farm } from '../types/agronomy';

export type WeatherSubTab =
  | 'dashboard'
  | 'janela_operacional'
  | 'previsao_15dias'
  | 'culturas'
  | 'balanco_hidrico'
  | 'chuva_historico'
  | 'mapa_fazenda'
  | 'alertas'
  | 'biblioteca';

interface WeatherModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: WeatherSubTab) => void;
  activeFarm?: Farm;
}

export const WeatherModule: React.FC<WeatherModuleProps> = ({
  activeSubTab: externalSubTab,
  setActiveSubTab: setExternalSubTab,
  activeFarm,
}) => {
  const [internalSubTab, setInternalSubTab] = useState<WeatherSubTab>('dashboard');
  const activeSubTab = (externalSubTab as WeatherSubTab) || internalSubTab;
  const setActiveSubTab = (tab: WeatherSubTab) => {
    setInternalSubTab(tab);
    if (setExternalSubTab) {
      setExternalSubTab(tab);
    }
  };

  // Realtime Weather State Management
  const [station, setStation] = useState<FarmWeatherStation>(initialFarmWeatherStation);
  const [operationalIndices, setOperationalIndices] = useState<OperationalWindowIndex[]>(operationalWindowIndices);
  const [hourlyData, setHourlyData] = useState<HourlyForecastItem[]>(hourlyForecastData);
  const [dailyData, setDailyData] = useState<DailyForecastItem[]>(daily15ForecastData);
  const [cropThresholds] = useState<CropWeatherThreshold[]>(cropWeatherThresholdsCatalog);
  const [selectedCropId, setSelectedCropId] = useState<string>(cropWeatherThresholdsCatalog[0]?.id || '');
  const [cropSearchTerm, setCropSearchTerm] = useState<string>('');
  const [cropCategoryFilter, setCropCategoryFilter] = useState<string>('Todas');

  const filteredCrops = useMemo(() => {
    return cropThresholds.filter(c => {
      const term = cropSearchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        c.cropName.toLowerCase().includes(term) ||
        c.scientificName.toLowerCase().includes(term) ||
        (c.category && c.category.toLowerCase().includes(term));
      const matchesCategory = cropCategoryFilter === 'Todas' || c.category === cropCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [cropThresholds, cropSearchTerm, cropCategoryFilter]);
  const [alerts, setAlerts] = useState<WeatherAlertItem[]>(weatherAlertsCatalog);
  const [historicalRain] = useState<HistoricalRainMonth[]>(historicalRainMonthlyData);

  // Mapeamento e cálculo de riscos por cultura na fazenda ativa
  const matchedCropThresholds = useMemo(() => {
    if (!activeFarm || !activeFarm.plots) return [];
    const matched: CropWeatherThreshold[] = [];
    const farmCropNames = new Set<string>();

    activeFarm.plots.forEach(plot => {
      if (plot.currentCrop) {
        const cleanPlotCrop = plot.currentCrop.split(' (')[0].split(' / ')[0].split(' - ')[0].trim().toLowerCase();
        farmCropNames.add(cleanPlotCrop);
      }
    });

    cropWeatherThresholdsCatalog.forEach(catalogCrop => {
      const cleanCatalogName = catalogCrop.cropName.split(' (')[0].split(' / ')[0].split(' - ')[0].trim().toLowerCase();
      
      let isMatch = false;
      for (const farmCrop of farmCropNames) {
        if (cleanCatalogName.includes(farmCrop) || farmCrop.includes(cleanCatalogName)) {
          isMatch = true;
          break;
        }
      }
      if (isMatch) {
        matched.push(catalogCrop);
      }
    });

    if (matched.length === 0 && farmCropNames.size > 0) {
      cropWeatherThresholdsCatalog.forEach(catalogCrop => {
        const cleanCatalogName = catalogCrop.cropName.toLowerCase();
        for (const farmCrop of farmCropNames) {
          const words = farmCrop.split(' ');
          const matchesAnyWord = words.some(w => w.length > 3 && cleanCatalogName.includes(w));
          if (matchesAnyWord) {
            matched.push(catalogCrop);
            break;
          }
        }
      });
    }

    return matched;
  }, [activeFarm]);

  const cropAlerts = useMemo(() => {
    if (!activeFarm || matchedCropThresholds.length === 0) return [];

    const alertsList: {
      cropName: string;
      type: 'geada' | 'estresse_hidrico';
      level: 'critico' | 'alto' | 'moderado' | 'baixo';
      message: string;
      details: string;
      dateOfOccurrence?: string;
    }[] = [];

    const next7Days = dailyData.slice(0, 7);
    const totalRain7Days = next7Days.reduce((acc, d) => acc + d.rainExpectedMm, 0);

    matchedCropThresholds.forEach(crop => {
      // 1. Frost (Geada) Check
      const frostDay = next7Days.find(d => d.tempMinC <= crop.criticalFrostTempC + 3.0 || d.frostRisk === 'moderado' || d.frostRisk === 'alto');
      if (frostDay) {
        let level: 'critico' | 'alto' | 'moderado' | 'baixo' = 'moderado';
        if (frostDay.tempMinC <= crop.criticalFrostTempC) {
          level = 'critico';
        } else if (frostDay.tempMinC <= crop.criticalFrostTempC + 1.5 || frostDay.frostRisk === 'alto') {
          level = 'alto';
        }

        alertsList.push({
          cropName: crop.cropName,
          type: 'geada',
          level,
          message: `Risco de Geada`,
          details: `Previsão de ${frostDay.tempMinC}°C em ${frostDay.date} (limite crítico: ${crop.criticalFrostTempC}°C).`,
          dateOfOccurrence: frostDay.date
        });
      }

      // 2. Water Stress (Estresse Hídrico) Check
      const currentSoilMoisture = station.soilMoistureSensors.depth30cmPercent;
      const minIdealMoisture = crop.idealSoilMoisturePercent?.min || 60;
      
      const cropWaterNeed7Days = (crop.dailyWaterRequirementMm?.min || 4.5) * 7;
      const waterDeficit = cropWaterNeed7Days - totalRain7Days;

      if (currentSoilMoisture < minIdealMoisture || waterDeficit > 20) {
        let level: 'critico' | 'alto' | 'moderado' | 'baixo' = 'baixo';
        let details = '';

        if (currentSoilMoisture < minIdealMoisture - 15 && waterDeficit > 25) {
          level = 'critico';
          details = `Solo muito seco (${currentSoilMoisture}% vs ideal ${minIdealMoisture}%) e déficit previsto de ${waterDeficit.toFixed(1)} mm nos próximos 7 dias.`;
        } else if (currentSoilMoisture < minIdealMoisture - 5 || waterDeficit > 20) {
          level = 'alto';
          details = `Solo seco (${currentSoilMoisture}% vs ideal ${minIdealMoisture}%) e déficit previsto de ${waterDeficit.toFixed(1)} mm nos próximos 7 dias.`;
        } else {
          level = 'moderado';
          details = `Possível déficit em 7 dias (necessidade: ${cropWaterNeed7Days.toFixed(1)} mm, chuva: ${totalRain7Days} mm, umidade atual: ${currentSoilMoisture}%).`;
        }

        alertsList.push({
          cropName: crop.cropName,
          type: 'estresse_hidrico',
          level,
          message: `Risco de Estresse Hídrico`,
          details
        });
      }
    });

    return alertsList;
  }, [activeFarm, matchedCropThresholds, dailyData, station]);

  // Realtime controls & locations
  const [selectedLocation, setSelectedLocation] = useState<WeatherLocation>(PRESET_AGRICULTURAL_LOCATIONS[0]);
  const [isLiveLoading, setIsLiveLoading] = useState<boolean>(false);
  const [lastLiveUpdatedTime, setLastLiveUpdatedTime] = useState<string>('');

  // Automatically synchronize selected location when activeFarm changes
  useEffect(() => {
    let isSubscribed = true;
    async function syncFarmLocation() {
      if (activeFarm) {
        try {
          const resolved = await resolveFarmCoordinates(activeFarm);
          if (isSubscribed) {
            setSelectedLocation({
              id: `farm-${activeFarm.id || 'current'}`,
              name: `${activeFarm.name} (${resolved.cityName})`,
              state: resolved.state,
              latitude: resolved.latitude,
              longitude: resolved.longitude,
            });
          }
        } catch (e) {
          console.warn('Erro ao resolver coordenadas da fazenda ativa:', e);
        }
      }
    }
    syncFarmLocation();
    return () => {
      isSubscribed = false;
    };
  }, [activeFarm?.id, activeFarm?.city, activeFarm?.state, activeFarm?.latitude, activeFarm?.longitude, activeFarm?.name]);

  // Selected Operation for Details Modal
  const [selectedOperation, setSelectedOperation] = useState<OperationalWindowIndex | null>(null);

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch real-time weather from Open-Meteo API
  const handleFetchRealtimeData = async (lat: number, lon: number, locationLabel: string) => {
    setIsLiveLoading(true);
    try {
      const live = await fetchRealtimeWeatherData(lat, lon, locationLabel);
      setStation(live.station);
      setOperationalIndices(live.operationalIndices);
      setHourlyData(live.hourly);
      setDailyData(live.daily);
      const timeString = live.fetchedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastLiveUpdatedTime(timeString);
      showNotification(`Temperatura e clima em tempo real atualizados (${timeString})!`);
    } catch (err) {
      console.error('Erro ao buscar dados meteorológicos em tempo real:', err);
      showNotification('Usando telemetria em cache. Não foi possível conectar ao satélite.');
    } finally {
      setIsLiveLoading(false);
    }
  };

  // Initial load & automatic timer refresh (60 seconds)
  useEffect(() => {
    handleFetchRealtimeData(selectedLocation.latitude, selectedLocation.longitude, `${selectedLocation.name} - ${selectedLocation.state}`);
    const interval = setInterval(() => {
      handleFetchRealtimeData(selectedLocation.latitude, selectedLocation.longitude, `${selectedLocation.name} - ${selectedLocation.state}`);
    }, 60000);
    return () => clearInterval(interval);
  }, [selectedLocation]);

  // Handle GPS location auto-detect
  const handleUseGpsLocation = () => {
    if (!navigator.geolocation) {
      showNotification('Geolocalização não é suportada por este navegador.');
      return;
    }
    setIsLiveLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const gpsLocation: WeatherLocation = {
          id: 'gps-local',
          name: 'Minha Localização GPS',
          state: 'Atual',
          latitude,
          longitude,
        };
        setSelectedLocation(gpsLocation);
      },
      (err) => {
        console.warn('Erro ao obter GPS:', err);
        showNotification('Permissão de localização negada ou indisponível.');
        setIsLiveLoading(false);
      }
    );
  };

  const selectedCrop = useMemo(() => {
    return cropThresholds.find(c => c?.id === selectedCropId) || cropThresholds[0];
  }, [cropThresholds, selectedCropId]);

  const activeAlertsCount = useMemo(() => {
    return alerts.filter(a => !a.resolved).length;
  }, [alerts]);

  const handleResolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, resolved: true } : a)));
    showNotification('Alerta meteorológico arquivado com sucesso!');
  };

  const getRatingBadge = (rating: OperationalWindowRating) => {
    switch (rating) {
      case 'ideal':
        return (
          <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Ideal
          </span>
        );
      case 'atencao':
        return (
          <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Atenção
          </span>
        );
      case 'nao_recomendado':
        return (
          <span className="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-xs font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Não Recomendado
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-sky-700/50 space-y-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-sky-400" />
            Climatologia Agrícola & Índice de Janela Operacional (IJO)
          </h2>
          <p className="text-xs sm:text-sm text-sky-100/80 mt-1 max-w-3xl">
            Monitoramento meteorológico em tempo real: temperatura, umidade, vento, ponto de orvalho e radiação para decisões agronômicas precisas de pulverização, semeadura e colheita.
          </p>
        </div>

        {/* Bottom Controls Row: Property Selector & Realtime Temperature */}
        <div className="pt-4 border-t border-sky-800/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Location / Farm Selector */}
          <div className="bg-sky-950/90 border border-sky-400/30 p-2 rounded-xl flex items-center gap-2 max-w-full sm:max-w-md">
            <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
            <select
              value={selectedLocation.id}
              onChange={async (e) => {
                const val = e.target.value;
                if (val.startsWith('farm-') && activeFarm) {
                  const resolved = await resolveFarmCoordinates(activeFarm);
                  setSelectedLocation({
                    id: `farm-${activeFarm.id || 'current'}`,
                    name: `${activeFarm.name} (${resolved.cityName})`,
                    state: resolved.state,
                    latitude: resolved.latitude,
                    longitude: resolved.longitude,
                  });
                  return;
                }
                const target = PRESET_AGRICULTURAL_LOCATIONS.find(l => l.id === val);
                if (target) setSelectedLocation(target);
              }}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-1 flex-1 truncate"
            >
              {activeFarm && (
                <option value={`farm-${activeFarm.id || 'current'}`} className="bg-emerald-950 font-bold text-emerald-300">
                  🏡 {activeFarm.name} ({activeFarm.city || 'Sede'} - {activeFarm.state || 'UF'})
                </option>
              )}
              {PRESET_AGRICULTURAL_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">
                  {loc.name} - {loc.state}
                </option>
              ))}
              {selectedLocation.id === 'gps-local' && (
                <option value="gps-local" className="bg-slate-900 text-white">
                  📍 Minha Localização GPS
                </option>
              )}
            </select>

            <button
              onClick={handleUseGpsLocation}
              title="Usar minha localização GPS atual"
              className="p-1.5 bg-sky-800/80 hover:bg-sky-700 text-sky-200 rounded-lg transition-all cursor-pointer shrink-0"
            >
              <LocateFixed className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleFetchRealtimeData(selectedLocation.latitude, selectedLocation.longitude, `${selectedLocation.name} - ${selectedLocation.state}`)}
              disabled={isLiveLoading}
              title="Atualizar dados climáticos em tempo real"
              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLiveLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Realtime Temperature Box */}
          <div className="bg-sky-950/80 border border-sky-400/30 px-3.5 py-2 rounded-xl flex items-center justify-between sm:justify-end gap-3 shrink-0">
            <div>
              <span className="text-[10px] text-sky-300 font-bold block uppercase leading-none">Temperatura em Tempo Real</span>
              <span className="text-[10px] text-sky-300/80 block mt-0.5">
                {lastLiveUpdatedTime ? `Atualizado às ${lastLiveUpdatedTime}` : station.lastTelemetryTimestamp}
              </span>
            </div>
            <div className="text-right pl-3 border-l border-sky-800/70">
              <span className="text-base font-black text-emerald-400 flex items-center gap-1 justify-end">
                <Thermometer className="w-4 h-4" />
                {station.currentAirTempC}°C
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="bg-sky-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between shadow-md animate-fade-in">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-white hover:text-sky-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}



      {/* ========================================================= */}
      {/* 1. DASHBOARD CLIMÁTICO PRINCIPAL                          */}
      {/* ========================================================= */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
          {/* Monitoramento de Risco Agroclimático por Cultura */}
          {activeFarm && (
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    Sistema de Monitoramento Agroclimático por Cultura
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Acompanhamento contínuo de riscos de geada e estresse hídrico para as culturas cadastradas na fazenda ativa: <strong className="font-bold text-slate-700 dark:text-zinc-300">{activeFarm.name}</strong>.
                  </p>
                </div>
                <div className="text-xs text-slate-400 font-medium bg-slate-100 dark:bg-zinc-900 px-2.5 py-1 rounded-lg">
                  {matchedCropThresholds.length} de {activeFarm.plots?.length || 0} talhões monitorados
                </div>
              </div>

              {matchedCropThresholds.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 dark:bg-zinc-900/40 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
                  <Sprout className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                    Nenhuma cultura ativa registrada nesta fazenda.
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Defina as culturas dos seus talhões na aba "Fazendas" para carregar as métricas agroclimáticas personalizadas.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Grid of Crops with Risk Badges */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchedCropThresholds.map(crop => {
                      // Find alerts for this specific crop
                      const cropSpecificAlerts = cropAlerts.filter(a => a.cropName === crop.cropName);
                      const frostAlert = cropSpecificAlerts.find(a => a.type === 'geada');
                      const waterAlert = cropSpecificAlerts.find(a => a.type === 'estresse_hidrico');

                      return (
                        <div key={crop.id} className="p-4 bg-slate-50/50 dark:bg-zinc-900/40 border border-slate-150 dark:border-zinc-800 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                                <Sprout className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-200">{crop.cropName.split(' (')[0]}</h4>
                                <span className="text-[10px] text-slate-400 italic block">{crop.scientificName}</span>
                              </div>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-400">
                              Estágio: <span className="font-bold text-slate-700 dark:text-zinc-300">{crop.currentGrowthStage.split(' - ')[0]}</span>
                            </span>
                          </div>

                          {/* Risks Rows */}
                          <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-200/50 dark:border-zinc-800/60">
                            {/* Geada Risk Badge Container */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">Risco de Geada</span>
                              {frostAlert ? (
                                <span className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full border ${
                                  frostAlert.level === 'critico'
                                    ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
                                    : frostAlert.level === 'alto'
                                    ? 'bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-900/60'
                                    : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/60'
                                }`}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                  {frostAlert.level === 'critico' ? 'Crítico 🚨' : frostAlert.level === 'alto' ? 'Alto ⚠️' : 'Moderado ⚡'}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full border bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Sob Controle
                                </span>
                              )}
                            </div>

                            {/* Estresse Hidrico Risk Badge Container */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">Estresse Hídrico</span>
                              {waterAlert ? (
                                <span className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full border ${
                                  waterAlert.level === 'critico'
                                    ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
                                    : waterAlert.level === 'alto'
                                    ? 'bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-900/60'
                                    : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/60'
                                }`}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                  {waterAlert.level === 'critico' ? 'Crítico 🚨' : waterAlert.level === 'alto' ? 'Alto ⚠️' : 'Moderado ⚡'}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full border bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Adequado
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Specific Alert details if any */}
                          {cropSpecificAlerts.length > 0 && (
                            <div className="pt-2.5 space-y-1.5 border-t border-dashed border-slate-150 dark:border-zinc-800">
                              {cropSpecificAlerts.map((alt, ai) => (
                                <div key={ai} className="p-2.5 bg-white dark:bg-zinc-950 rounded-lg border border-slate-100 dark:border-zinc-800 text-[11px] text-slate-600 dark:text-zinc-300 flex items-start gap-1.5">
                                  <AlertTriangle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                                    alt.level === 'critico' ? 'text-rose-500' : alt.level === 'alto' ? 'text-orange-500' : 'text-amber-500'
                                  }`} />
                                  <div>
                                    <span className="font-extrabold text-slate-800 dark:text-zinc-200">{alt.message}:</span>{' '}
                                    {alt.details}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Main Weather Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  Temperatura em Tempo Real
                </span>
                <span className="p-1.5 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-lg flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <Thermometer className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2 flex items-baseline gap-2">
                <span>{station.currentAirTempC}°C</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  Ao Vivo
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold mt-1 flex items-center justify-between">
                <span>Mín: {dailyData[0]?.tempMinC ?? 17.5}°C</span>
                <span>Máx: {dailyData[0]?.tempMaxC ?? 31.2}°C</span>
                <span>Orvalho: {(station.currentAirTempC - (100 - station.currentHumidityPercent) / 5).toFixed(1)}°C</span>
              </div>
            </div>

            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  Vento & Rajadas
                </span>
                <span className="p-1.5 bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 rounded-lg">
                  <Wind className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-sky-600 dark:text-sky-400 mt-2">
                {station.currentWindSpeedKmh} <span className="text-xs font-bold">km/h</span>
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                Direção: Sudeste (SE) • Rajadas: {station.currentWindGustKmh} km/h
              </div>
            </div>

            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  Umidade Relativa
                </span>
                <span className="p-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Droplets className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
                {station.currentHumidityPercent}%
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold mt-1">
                Pressão: {station.currentAtmosphericPressureHpa} hPa (Estável)
              </div>
            </div>

            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  Chuva Acumulada
                </span>
                <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <CloudRain className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
                {station.rainAccumulatedTodayMm} <span className="text-xs font-bold">mm (hoje)</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold mt-1">
                Mês: {station.rainAccumulatedMonthMm} mm (7 dias sem chuva)
              </div>
            </div>
          </div>

          {/* Quick Operational Window Snapshot & 24h Hourly Strip */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Quick Operational Window Status (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                    Índice de Janela Operacional de Hoje (IJO)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Classificação agronômica em tempo real para as principais atividades de campo.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSubTab('janela_operacional')}
                  className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                >
                  Ver Detalhes do IJO →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {operationalIndices.slice(0, 4).map(op => (
                  <div
                    key={op.id}
                    onClick={() => setSelectedOperation(op)}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50 hover:border-sky-400 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                        {op.operationName}
                      </span>
                      {getRatingBadge(op.rating)}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2">
                      {op.summary}
                    </p>
                    <div className="text-[10px] text-sky-700 dark:text-sky-300 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {op.bestHourWindowToday}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Solar Radiation, UV Index & Soil Moisture (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-500" />
                Radiação Solar & Umidade do Solo
              </h3>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Radiação Solar</span>
                  <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                    {station.currentSolarRadiationWm2} <span className="text-xs font-normal">W/m²</span>
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold">Índice UV: 7 (Alto)</span>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Evapotranspiração</span>
                  <span className="text-xl font-black text-sky-600 dark:text-sky-400 mt-1 block">
                    4.2 <span className="text-xs font-normal">mm/dia</span>
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold">ET₀ Penman-Monteith</span>
                </div>
              </div>

              {/* Soil Moisture Depths */}
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-zinc-800">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">
                  Perfil de Umidade do Solo (Sensores TDR):
                </span>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-semibold text-slate-600 dark:text-zinc-400 text-[11px]">
                    <span>Camada 0-10 cm (Semeadura):</span>
                    <strong className="text-slate-900 dark:text-white">{station.soilMoistureSensors.depth10cmPercent}% (Adequada)</strong>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${station.soilMoistureSensors.depth10cmPercent * 2}%` }} />
                  </div>

                  <div className="flex justify-between font-semibold text-slate-600 dark:text-zinc-400 text-[11px]">
                    <span>Camada 10-30 cm (Zona Radicular):</span>
                    <strong className="text-slate-900 dark:text-white">{station.soilMoistureSensors.depth30cmPercent}% (Ótima)</strong>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-full rounded-full" style={{ width: `${station.soilMoistureSensors.depth30cmPercent * 2}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 24h Hourly Forecast Slider */}
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600" />
                Previsão Horária das Próximas 24 Horas & Aptidão para Pulverização
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">Atualizado a cada hora</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 overflow-x-auto pb-1">
              {hourlyData.map((h, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/60 text-center space-y-1.5"
                >
                  <span className="text-xs font-black text-slate-800 dark:text-zinc-200 block">{h.time}</span>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white">{h.tempC}°C</div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">UR {h.humidityPercent}%</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">Vento: {h.windSpeedKmh} km/h</div>
                  <div className="pt-1">
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                        h.sprayingRating === 'ideal'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : h.sprayingRating === 'atencao'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {h.sprayingRating === 'ideal' ? 'Pulverizar' : h.sprayingRating === 'atencao' ? 'Atenção' : 'Pausar'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ÍNDICE DE JANELA OPERACIONAL (GRANDE DIFERENCIAL)       */}
      {/* ========================================================= */}
      {activeSubTab === 'janela_operacional' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-sky-600 dark:text-sky-400 tracking-wider">
                  Inteligência Agronômica em Ação
                </span>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  Índice de Janela Operacional (IJO) - O que fazer hoje?
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Cruzamento automático de vento, temperatura, umidade relativa, orvalho e previsão de chuvas para liberar ou restringir operações no campo.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Ideal
                </span>
                <span className="flex items-center gap-1 text-amber-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Atenção
                </span>
                <span className="flex items-center gap-1 text-rose-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Não Recomendado
                </span>
              </div>
            </div>

            {/* List of Operational Index Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {operationalIndices.map(op => (
                <div
                  key={op.id}
                  className="bg-slate-50/70 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3 hover:border-sky-400 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                        {op.operationName}
                      </h4>
                      <span className="text-[11px] text-sky-700 dark:text-sky-400 font-bold flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        Melhor Janela: {op.bestHourWindowToday}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {getRatingBadge(op.rating)}
                      <span className="text-[10px] text-slate-400 font-semibold">Score: {op.score}/100</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                    {op.summary}
                  </p>

                  {/* Favorable vs Limiting bullets */}
                  <div className="space-y-1.5 text-xs pt-1 border-t border-slate-200/60 dark:border-zinc-800">
                    <div className="space-y-1">
                      <strong className="text-[11px] text-emerald-700 dark:text-emerald-400 block">Fatores Favoráveis:</strong>
                      {(op.favorableFactors || []).map((f, i) => (
                        <div key={i} className="text-[11px] text-slate-600 dark:text-zinc-400 flex items-start gap-1">
                          <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>

                    {(op.limitingFactors || []).length > 0 && (
                      <div className="space-y-1 pt-1">
                        <strong className="text-[11px] text-amber-700 dark:text-amber-400 block">Fatores de Atenção:</strong>
                        {(op.limitingFactors || []).map((l, i) => (
                          <div key={i} className="text-[11px] text-slate-600 dark:text-zinc-400 flex items-start gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                            <span>{l}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Technical Advice Box */}
                  <div className="bg-sky-50 dark:bg-sky-950/30 p-2.5 rounded-lg border border-sky-200 dark:border-sky-900/50 text-[11px]">
                    <strong className="text-sky-950 dark:text-sky-200 block font-bold">Orientação Técnica do Agrônomo:</strong>
                    <p className="text-sky-900/80 dark:text-sky-300/80 mt-0.5">{op.technicalAdvice}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. PREVISÃO 15 DIAS & TENDÊNCIAS                          */}
      {/* ========================================================= */}
      {activeSubTab === 'previsao_15dias' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-600" />
                  Previsão Meteorológica Agroclimática de 15 Dias
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Estimativas diárias de chuva, temperaturas extremas, evapotranspiração (ET₀) e aptidão para trabalhos a campo.
                </p>
              </div>
            </div>

            {/* Desktop Table View (Hidden on mobile/tablet) */}
            <div className="hidden lg:block overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-slate-600 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Data / Dia</th>
                    <th className="py-2.5 px-3">Condição Prevista</th>
                    <th className="py-2.5 px-3 text-center">Temp (Mín / Máx)</th>
                    <th className="py-2.5 px-3 text-center">Chuva (Prob / mm)</th>
                    <th className="py-2.5 px-3 text-center">Vento Médio</th>
                    <th className="py-2.5 px-3 text-center">ET₀ (mm/dia)</th>
                    <th className="py-2.5 px-3 text-center">Pulverização</th>
                    <th className="py-2.5 px-3 text-center">Plantio</th>
                    <th className="py-2.5 px-3 text-center">Colheita</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {dailyData.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">{d.date}</div>
                        <div className="text-[10px] text-slate-400">{d.dayOfWeek}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800 dark:text-zinc-200">{d.conditionDescription}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-blue-600 font-bold">{d.tempMinC}°C</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-amber-600 font-bold">{d.tempMaxC}°C</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="font-bold text-indigo-600 dark:text-indigo-400">
                          {d.rainExpectedMm > 0 ? `${d.rainExpectedMm} mm` : '0 mm'}
                        </div>
                        <div className="text-[10px] text-slate-400">{d.rainProbabilityPercent}% prob.</div>
                      </td>
                      <td className="py-3 px-3 text-center font-medium text-slate-700 dark:text-zinc-300">
                        {d.windSpeedAvgKmh} km/h
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-sky-600 dark:text-sky-400">
                        {d.etoMmDay} mm
                      </td>
                      <td className="py-3 px-3 text-center">
                        {getRatingBadge(d.dominantOperationStatus.spray)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {getRatingBadge(d.dominantOperationStatus.planting)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {getRatingBadge(d.dominantOperationStatus.harvest)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card-Based List View (Optimized for smartphones, tablets, small screens) */}
            <div className="block lg:hidden space-y-3.5">
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider mb-2">
                Previsão Detalhada por Dia (Lista Responsiva):
              </span>
              {dailyData.map((d, i) => (
                <div 
                  key={i} 
                  className="bg-slate-50/50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3 hover:border-sky-400 transition-all"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-zinc-800 pb-2">
                    <div>
                      <span className="font-black text-sm text-slate-900 dark:text-white">{d.date}</span>
                      <span className="text-xs text-slate-500 dark:text-zinc-400 ml-2">({d.dayOfWeek})</span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 px-2 py-1 rounded-lg border">
                      {d.conditionDescription}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white dark:bg-zinc-950 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-800/80">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase mb-0.5">Temperatura</span>
                      <div className="font-extrabold flex items-center gap-1">
                        <span className="text-blue-600">{d.tempMinC}°C</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-amber-600">{d.tempMaxC}°C</span>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-950 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-800/80">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase mb-0.5">Precipitação</span>
                      <div className="font-extrabold text-indigo-600 dark:text-indigo-400">
                        {d.rainExpectedMm > 0 ? `${d.rainExpectedMm} mm` : 'Sem chuva'}
                        <span className="text-[10px] text-slate-400 font-normal ml-1">({d.rainProbabilityPercent}%)</span>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-950 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-800/80">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase mb-0.5">Vento Médio</span>
                      <span className="font-extrabold text-slate-700 dark:text-zinc-300">{d.windSpeedAvgKmh} km/h</span>
                    </div>

                    <div className="bg-white dark:bg-zinc-950 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-800/80">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase mb-0.5">Evapotranspiração (ET₀)</span>
                      <span className="font-extrabold text-sky-600 dark:text-sky-400">{d.etoMmDay} mm/dia</span>
                    </div>
                  </div>

                  {/* Operational Status Badges */}
                  <div className="pt-2 border-t border-dashed border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1.5">Aptidão Operacional:</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-950 px-2 py-1 rounded-lg border">
                        <span className="text-[10px] text-slate-500 font-semibold">Pulverizar:</span>
                        {getRatingBadge(d.dominantOperationStatus.spray)}
                      </div>
                      <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-950 px-2 py-1 rounded-lg border">
                        <span className="text-[10px] text-slate-500 font-semibold">Plantio:</span>
                        {getRatingBadge(d.dominantOperationStatus.planting)}
                      </div>
                      <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-950 px-2 py-1 rounded-lg border">
                        <span className="text-[10px] text-slate-500 font-semibold">Colheita:</span>
                        {getRatingBadge(d.dominantOperationStatus.harvest)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. LIMITES POR CULTURA                                    */}
      {/* ========================================================= */}
      {activeSubTab === 'culturas' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
                    <Sprout className="w-3 h-3" />
                    {cropThresholds.length} Culturas Mapeadas
                  </span>
                  <span className="bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                    Geadas, Calores & ETc
                  </span>
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  Módulo Agroclimático Específico por Cultura
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Análise fitoclimática individualizada para todas as culturas agrícolas cadastradas na plataforma.
                </p>
              </div>

              {/* Controls: Search & Select Dropdown */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative shrink-0 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={cropSearchTerm}
                    onChange={e => setCropSearchTerm(e.target.value)}
                    placeholder="Buscar cultura..."
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg pl-9 pr-7 py-2 text-xs font-semibold text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                  {cropSearchTerm && (
                    <button
                      onClick={() => setCropSearchTerm('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <select
                  value={selectedCropId}
                  onChange={e => setSelectedCropId(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                >
                  {filteredCrops.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.cropName} {c.category ? `(${c.category})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[
                'Todas',
                'Grãos & Cereais',
                'Hortaliças & Olerícolas',
                'Frutíferas',
                'Fibras & Bioenergia',
                'Pastagens & Silvicultura',
                'Especialidades & Aromáticas',
              ].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCropCategoryFilter(cat)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    cropCategoryFilter === cat
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-zinc-900/80 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:border-emerald-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Quick Selector Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Atalhos Rápidos ({filteredCrops.length} cultura{filteredCrops.length !== 1 ? 's' : ''}):
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-slate-50/60 dark:bg-zinc-900/40 rounded-xl border border-slate-100 dark:border-zinc-800/80">
                {filteredCrops.map(c => {
                  const isSelected = c.id === selectedCropId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCropId(c.id)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200/80 dark:border-zinc-700 hover:bg-emerald-50 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <Sprout className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                      <span>{c.cropName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Crop Detail Panel */}
            {selectedCrop && (
              <div className="bg-slate-50/80 dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-5">
                {/* Selected Crop Title Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-zinc-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {selectedCrop.category && (
                        <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          {selectedCrop.category}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-slate-400 italic">
                        {selectedCrop.scientificName}
                      </span>
                    </div>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Sprout className="w-5 h-5 text-emerald-600" />
                      {selectedCrop.cropName}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Evapotranspiração da Cultura (ETc)
                      </span>
                      <strong className="text-base font-black text-sky-600 dark:text-sky-400">
                        {(4.2 * selectedCrop.kcValue).toFixed(2)} mm/dia
                      </strong>
                      <span className="text-[10px] text-slate-400 block">
                        (ET₀ 4.2mm × Kc {selectedCrop.kcValue})
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-white dark:bg-black p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Fase Fenológica Atual</span>
                    <strong className="text-xs text-emerald-700 dark:text-emerald-400 block font-black">
                      {selectedCrop.currentGrowthStage}
                    </strong>
                    <span className="text-[10px] text-slate-500 font-semibold block">
                      Coeficiente Kc: <span className="font-bold text-slate-800 dark:text-white">{selectedCrop.kcValue}</span>
                    </span>
                  </div>

                  <div className="bg-white dark:bg-black p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Faixa Térmica Ótima</span>
                    <strong className="text-xs text-slate-900 dark:text-white block font-black">
                      {selectedCrop.optimalTempRange.min}°C a {selectedCrop.optimalTempRange.max}°C
                    </strong>
                    <div className="text-[10px] text-slate-500 flex justify-between pt-0.5">
                      <span>Geada: &le;{selectedCrop.criticalFrostTempC}°C</span>
                      <span className="text-amber-600 font-semibold">Calor: &ge;{selectedCrop.criticalHeatStressTempC}°C</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-black p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Demanda Hídrica Diária</span>
                    <strong className="text-xs text-sky-600 dark:text-sky-400 block font-black">
                      {selectedCrop.dailyWaterRequirementMm.min} a {selectedCrop.dailyWaterRequirementMm.max} mm/dia
                    </strong>
                    <span className="text-[10px] text-slate-500 block font-semibold">
                      Umidade do Solo Ideal: {selectedCrop.idealSoilMoisturePercent.min}% - {selectedCrop.idealSoilMoisturePercent.max}%
                    </span>
                  </div>

                  <div className="bg-white dark:bg-black p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Índice de Risco Agroclimático</span>
                    <strong
                      className={`text-xs block font-black ${
                        selectedCrop.climateRiskScore < 25
                          ? 'text-emerald-600'
                          : selectedCrop.climateRiskScore < 40
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {selectedCrop.climateRiskScore < 25
                        ? 'Baixo Risco'
                        : selectedCrop.climateRiskScore < 40
                        ? 'Risco Moderado'
                        : 'Risco Elevado'}{' '}
                      ({selectedCrop.climateRiskScore}/100)
                    </strong>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full ${
                          selectedCrop.climateRiskScore < 25
                            ? 'bg-emerald-500'
                            : selectedCrop.climateRiskScore < 40
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${selectedCrop.climateRiskScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Thermal Status Bar comparing current station temp (26.4°C) with crop limits */}
                <div className="bg-white dark:bg-black p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-sky-600" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Análise Térmica em Tempo Real (Estação Atual: {station.currentAirTempC}°C)
                      </span>
                    </div>

                    {station.currentAirTempC >= selectedCrop.optimalTempRange.min &&
                    station.currentAirTempC <= selectedCrop.optimalTempRange.max ? (
                      <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Temperatura Ideal para a Cultura
                      </span>
                    ) : station.currentAirTempC < selectedCrop.optimalTempRange.min ? (
                      <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Temperatura Abaixo do Faixa Ótima
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Temperatura Próxima ao Estresse
                      </span>
                    )}
                  </div>

                  {/* Temperature Range Visual Gauge */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                      <span>Geada (&le;{selectedCrop.criticalFrostTempC}°C)</span>
                      <span>Mín Ótima ({selectedCrop.optimalTempRange.min}°C)</span>
                      <span className="text-emerald-600 dark:text-emerald-400">Atual: {station.currentAirTempC}°C</span>
                      <span>Máx Ótima ({selectedCrop.optimalTempRange.max}°C)</span>
                      <span className="text-rose-600">Estresse (&ge;{selectedCrop.criticalHeatStressTempC}°C)</span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-zinc-800 h-3 rounded-full relative overflow-hidden flex">
                      <div className="bg-blue-400 h-full" style={{ width: '20%' }} title="Zona Fria / Geada" />
                      <div className="bg-emerald-500 h-full" style={{ width: '50%' }} title="Faixa Ótima de Desenvolvimento" />
                      <div className="bg-amber-400 h-full" style={{ width: '15%' }} title="Atenção / Alerta" />
                      <div className="bg-rose-500 h-full" style={{ width: '15%' }} title="Estresse Térmico Severo" />
                    </div>
                  </div>
                </div>

                {/* Active Alerts for this crop */}
                <div className="space-y-2">
                  <strong className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Alertas Fitoclimáticos & Recomendações de Manejo para {selectedCrop.cropName}:
                  </strong>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {selectedCrop.activeCropAlerts.map((alert, i) => (
                      <div
                        key={i}
                        className="bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 rounded-lg text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2.5"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed font-medium">{alert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Matrix Table of All Filtered Crops */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  Comparativo de Limiares Agroclimáticos ({filteredCrops.length} culturas)
                </h4>
                <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400">
                  Selecione uma cultura para carregar seus dados no painel superior
                </span>
              </div>
 
              {/* Desktop Table View (Hidden on mobile/tablet) */}
              <div className="hidden lg:block overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/80 text-slate-600 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Cultura</th>
                      <th className="py-2.5 px-3">Categoria</th>
                      <th className="py-2.5 px-3 text-center">Temp. Ótima</th>
                      <th className="py-2.5 px-3 text-center">Geadas</th>
                      <th className="py-2.5 px-3 text-center">Estresse Calor</th>
                      <th className="py-2.5 px-3 text-center">Umidade Solo</th>
                      <th className="py-2.5 px-3 text-center">Kc</th>
                      <th className="py-2.5 px-3 text-center">Risco</th>
                      <th className="py-2.5 px-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {filteredCrops.map(c => {
                      const isCurrent = c.id === selectedCropId;
                      return (
                        <tr
                          key={c.id}
                          className={`hover:bg-slate-50/80 dark:hover:bg-zinc-900/50 transition-colors ${
                            isCurrent ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900 dark:text-white">{c.cropName}</div>
                            <div className="text-[10px] text-slate-400 italic">{c.scientificName}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-[10px] font-semibold text-slate-600 dark:text-zinc-300">
                              {c.category || 'Geral'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-semibold text-emerald-700 dark:text-emerald-400">
                            {c.optimalTempRange.min}°C - {c.optimalTempRange.max}°C
                          </td>
                          <td className="py-2.5 px-3 text-center font-medium text-blue-600 dark:text-blue-400">
                            &le; {c.criticalFrostTempC}°C
                          </td>
                          <td className="py-2.5 px-3 text-center font-medium text-rose-600 dark:text-rose-400">
                            &ge; {c.criticalHeatStressTempC}°C
                          </td>
                          <td className="py-2.5 px-3 text-center font-medium text-slate-700 dark:text-zinc-300">
                            {c.idealSoilMoisturePercent.min}-{c.idealSoilMoisturePercent.max}%
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-sky-600 dark:text-sky-400">
                            {c.kcValue}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                                c.climateRiskScore < 25
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : c.climateRiskScore < 40
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              }`}
                            >
                              {c.climateRiskScore}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => setSelectedCropId(c.id)}
                              className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition-all ${
                                isCurrent
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-emerald-600 hover:text-white'
                              }`}
                            >
                              {isCurrent ? 'Selecionada' : 'Analisar'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card-Based Grid View (Optimized for smartphones and tablets) */}
              <div className="block lg:hidden space-y-3.5">
                {filteredCrops.map(c => {
                  const isCurrent = c.id === selectedCropId;
                  return (
                    <div 
                      key={c.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrent 
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500' 
                          : 'bg-slate-50/50 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between border-b border-slate-200/50 dark:border-zinc-800/80 pb-2.5 gap-2">
                        <div>
                          <h5 className="font-bold text-sm text-slate-900 dark:text-white">{c.cropName}</h5>
                          <span className="text-[10px] text-slate-400 italic block">{c.scientificName}</span>
                        </div>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase shrink-0 ${
                          c.climateRiskScore < 25
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : c.climateRiskScore < 40
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          Risco: {c.climateRiskScore}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs pt-3">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Categoria</span>
                          <span className="font-semibold text-slate-700 dark:text-zinc-300">{c.category || 'Geral'}</span>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Temp. Ótima</span>
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">{c.optimalTempRange.min}°C - {c.optimalTempRange.max}°C</span>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Limite Geada</span>
                          <span className="font-semibold text-blue-600">&le; {c.criticalFrostTempC}°C</span>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Estresse Calor</span>
                          <span className="font-semibold text-rose-600">&ge; {c.criticalHeatStressTempC}°C</span>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Umidade Solo</span>
                          <span className="font-semibold text-slate-700 dark:text-zinc-300">{c.idealSoilMoisturePercent.min}-{c.idealSoilMoisturePercent.max}%</span>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Coeficiente Kc</span>
                          <span className="font-extrabold text-sky-600 dark:text-sky-400">{c.kcValue}</span>
                        </div>
                      </div>

                      <div className="pt-3.5 border-t border-dashed border-slate-200 dark:border-zinc-800/80 mt-3 flex justify-end">
                        <button
                          onClick={() => setSelectedCropId(c.id)}
                          className={`w-full sm:w-auto text-xs font-bold px-4 py-2.5 rounded-lg transition-all text-center cursor-pointer min-h-[44px] flex items-center justify-center ${
                            isCurrent
                              ? 'bg-emerald-600 text-white font-extrabold shadow-xs'
                              : 'bg-slate-200 hover:bg-emerald-600 hover:text-white text-slate-700 dark:bg-zinc-800 dark:text-zinc-200'
                          }`}
                        >
                          {isCurrent ? 'Cultura Selecionada' : 'Selecionar & Analisar'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. BALANÇO HÍDRICO & IRRIGAÇÃO                            */}
      {/* ========================================================= */}
      {activeSubTab === 'balanco_hidrico' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Droplets className="w-5 h-5 text-sky-600" />
              Manejo de Irrigação & Balanço Hídrico Climatológico
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">1. Evapotranspiração de Referência (ET₀)</span>
                <span className="text-2xl font-black text-sky-600 block">4.2 mm/dia</span>
                <p className="text-[11px] text-slate-500">Calculada via equação padrão FAO Penman-Monteith com dados da estação IoT.</p>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">2. Evapotranspiração da Cultura (ETc)</span>
                <span className="text-2xl font-black text-emerald-600 block">4.8 mm/dia</span>
                <p className="text-[11px] text-slate-500">ETc = ET₀ &times; Kc (1.15 para Soja em fase R1).</p>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">3. Lâmina Líquida Recomendada</span>
                <span className="text-2xl font-black text-indigo-600 block">5.5 mm</span>
                <p className="text-[11px] text-slate-500">Considerando eficiência do pivô central de 88%.</p>
              </div>
            </div>

            <button
              onClick={() => showNotification('Ordem de irrigação noturna (5.5 mm) transmitida para o pivô central!')}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-4 rounded-lg text-xs cursor-pointer shadow-xs"
            >
              Registrar Manejo de Irrigação
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. CHUVAS & HISTÓRICO PLUVIOMÉTRICO                       */}
      {/* ========================================================= */}
      {activeSubTab === 'chuva_historico' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              Histórico Pluviométrico & Comparativo de Safras (mm)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {historicalRain.map((m, i) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border text-center text-xs">
                  <span className="font-extrabold text-slate-800 dark:text-zinc-200 block">{m.month}</span>
                  <strong className="text-indigo-600 text-base block mt-1">{m.currentYearMm} mm</strong>
                  <span className="text-[10px] text-slate-400 block">Média 30a: {m.historical30YearAvgMm} mm</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. ALERTAS CLIMÁTICOS                                     */}
      {/* ========================================================= */}
      {activeSubTab === 'alertas' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Central de Alertas Meteorológicos Inteligentes
            </h3>

            <div className="space-y-2">
              {alerts.map(alt => (
                <div
                  key={alt.id}
                  className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                    alt.resolved
                      ? 'bg-slate-50 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800 opacity-60'
                      : alt.severity === 'moderado'
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900'
                      : 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-900'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{alt.title}</span>
                        <span className="text-[10px] text-slate-400">{alt.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-300 mt-0.5">{alt.description}</p>
                      <div className="mt-2 text-[11px] text-sky-700 dark:text-sky-300 font-semibold">
                        Ação Recomendada: {alt.recommendedAction}
                      </div>
                    </div>
                  </div>

                  {!alt.resolved && (
                    <button
                      onClick={() => handleResolveAlert(alt.id)}
                      className="px-3 py-1 bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs font-bold text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-50 cursor-pointer shrink-0"
                    >
                      Arquivar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. BIBLIOTECA TÉCNICA CLIMATOLÓGICA                       */}
      {/* ========================================================= */}
      {activeSubTab === 'biblioteca' && <ClimatologyLibraryView />}

      {/* ========================================================= */}
      {/* 9. MAPA DA FAZENDA & SENSORES                             */}
      {/* ========================================================= */}
      {activeSubTab === 'mapa_fazenda' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-sky-600" />
              Estações Meteorológicas & Sensores de Solo na Propriedade
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">Estação Sede (Principal)</span>
                <p className="text-slate-500">Modelo: {station.model}</p>
                <span className="text-emerald-600 font-bold block">Bateria: 98% • Sinal: 100%</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">Pluviômetro IoT - Talhão 04</span>
                <p className="text-slate-500">Acumulado Mês: 49.2 mm</p>
                <span className="text-emerald-600 font-bold block">Bateria: 94% • Conectado</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">Sonda Capacitiva TDR - Talhão 08</span>
                <p className="text-slate-500">Umidade a 30 cm: 31%</p>
                <span className="text-emerald-600 font-bold block">Bateria: 100% • Conectado</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
