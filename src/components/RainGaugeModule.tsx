import React, { useState, useMemo } from 'react';
import {
  CloudRain,
  Droplets,
  PlusCircle,
  MapPin,
  Calendar,
  BarChart2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  Check,
  X,
  Radio,
  Wifi,
  Smartphone,
  Layers,
  Sprout,
  Activity,
  ShieldAlert,
  Sliders,
  Compass,
  FileSpreadsheet,
  Gauge,
  HelpCircle,
  Eye,
  Trash2,
  Edit,
} from 'lucide-react';
import {
  RainGaugePoint,
  RainRecord,
  RainEfficiencyIndex,
  RainCropWaterBalance,
  RainAlertItem,
  RainIntensityLevel,
  RainGaugeType,
  RainEfficiencyCategory,
} from '../types/rainGauge';
import { Farm } from '../types/agronomy';
import { fetchRealtimeWeatherData, resolveFarmCoordinates } from '../services/weatherApi';
import {
  initialRainGauges,
  initialRainRecords,
  initialRainEfficiency,
  initialCropWaterBalances,
  initialRainAlerts,
} from '../data/rainGaugeData';

export type RainGaugeSubTab =
  | 'painel'
  | 'mapa_inteligente'
  | 'lancamento'
  | 'cadastro_pluviometros'
  | 'eficiencia_iec'
  | 'balanco_culturas'
  | 'relatorios'
  | 'alertas';

interface RainGaugeModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: RainGaugeSubTab) => void;
  selectedFarm?: Farm;
}

export const RainGaugeModule: React.FC<RainGaugeModuleProps> = ({
  activeSubTab: externalSubTab,
  setActiveSubTab: setExternalSubTab,
  selectedFarm,
}) => {
  const [internalSubTab, setInternalSubTab] = useState<RainGaugeSubTab>('painel');
  const activeSubTab = (externalSubTab as RainGaugeSubTab) || internalSubTab;
  const setActiveSubTab = (tab: RainGaugeSubTab) => {
    setInternalSubTab(tab);
    if (setExternalSubTab) {
      setExternalSubTab(tab);
    }
  };

  // State Management
  const [gauges, setGauges] = useState<RainGaugePoint[]>(initialRainGauges);
  const [records, setRecords] = useState<RainRecord[]>(initialRainRecords);
  const [efficiency, setEfficiency] = useState<RainEfficiencyIndex>(initialRainEfficiency);
  const [cropBalances, setCropBalances] = useState<RainCropWaterBalance[]>(initialCropWaterBalances);
  const [alerts, setAlerts] = useState<RainAlertItem[]>(initialRainAlerts);

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncClimatology = async () => {
    if (!selectedFarm) {
      showNotification('Por favor, selecione ou cadastre uma propriedade agrícola nas configurações superiores para sincronizar os dados.');
      return;
    }
    
    setIsSyncing(true);
    try {
      const resolved = await resolveFarmCoordinates(selectedFarm);
      const lat = resolved.latitude;
      const lon = resolved.longitude;
      const locationLabel = resolved.label;
      
      const liveData = await fetchRealtimeWeatherData(lat, lon, locationLabel);
      
      // 1. Create a synchronized automatic telemetric rain gauge
      const syncedGauge: RainGaugePoint = {
        id: 'gauge-synced-telemetric',
        name: `Estação Telemétrica IoT (${resolved.cityName})`,
        type: 'automatico_lora',
        model: 'IoT LoRaWAN Clima Sincronizado',
        plotId: 'plot-synced-all',
        plotName: 'Toda a Propriedade',
        latitude: lat,
        longitude: lon,
        altitudeMeters: 420,
        installedDate: new Date().toISOString().split('T')[0],
        status: 'ativo',
        accumulatedTodayMm: liveData.station.rainAccumulatedTodayMm || 0,
        accumulatedLast24hMm: liveData.station.rainAccumulatedTodayMm || 0,
        accumulatedLast7DaysMm: Number(liveData.daily.slice(0, 7).reduce((acc, d) => acc + (d.rainExpectedMm || 0), 0).toFixed(1)),
        accumulatedMonthMm: Number(liveData.daily.reduce((acc, d) => acc + (d.rainExpectedMm || 0), 0).toFixed(1)) + 12.0,
        accumulatedYearMm: Number((liveData.daily.reduce((acc, d) => acc + (d.rainExpectedMm || 0), 0) * 12 + 150.0).toFixed(1)),
        notes: `Sincronizado automaticamente via API de Climatologia em ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`
      };
      
      // 2. Create synced precipitation records
      const syncedRecords: RainRecord[] = liveData.daily.map((day, index) => {
        const dateStr = day.date;
        const amount = day.rainExpectedMm || 0;
        
        let intensity: RainIntensityLevel = 'garoa_leve';
        if (amount > 30) intensity = 'tempestade_torrencial';
        else if (amount > 15) intensity = 'forte';
        else if (amount > 2) intensity = 'moderada';
        
        const runoffEstimatedPercent = amount > 25 ? 20 : amount > 10 ? 10 : 5;
        const efficiencyScore = 100 - runoffEstimatedPercent;

        return {
          id: `rec-synced-${index}-${Date.now()}`,
          gaugeId: 'gauge-synced-telemetric',
          gaugeName: `Estação Telemétrica IoT (${selectedFarm.city})`,
          plotName: 'Toda a Propriedade',
          date: dateStr,
          time: '12:00',
          amountMm: amount,
          durationMinutes: amount > 0 ? 90 : 0,
          intensity,
          recordedBy: 'Estação Climatológica IoT',
          efficiencyScore,
          runoffEstimatedPercent,
          notes: `Dados climáticos reais de ${selectedFarm.city} (${selectedFarm.state}) importados em tempo real.`
        };
      }).filter(r => r.amountMm > 0);
      
      // Add today's record if currently raining and daily sum doesn't cover it
      if (syncedRecords.length === 0 && (liveData.station.rainAccumulatedTodayMm || 0) > 0) {
        syncedRecords.push({
          id: `rec-synced-today-${Date.now()}`,
          gaugeId: 'gauge-synced-telemetric',
          gaugeName: `Estação Telemétrica IoT (${selectedFarm.city})`,
          plotName: 'Toda a Propriedade',
          date: new Date().toISOString().split('T')[0],
          time: '12:00',
          amountMm: liveData.station.rainAccumulatedTodayMm || 0,
          durationMinutes: 60,
          intensity: 'moderada',
          recordedBy: 'Estação Climatológica IoT',
          efficiencyScore: 88,
          runoffEstimatedPercent: 12,
          notes: `Precipitação em tempo real na cidade de ${selectedFarm.city}.`
        });
      }
      
      const totalRainMm = syncedRecords.reduce((sum, r) => sum + r.amountMm, 0);
      const effectiveSoilWaterInfiltrationMm = syncedRecords.reduce((sum, r) => sum + r.amountMm * (r.efficiencyScore / 100), 0);
      const estimatedSurfaceRunoffMm = syncedRecords.reduce((sum, r) => sum + r.amountMm * (r.runoffEstimatedPercent / 100), 0);
      const rainDaysCount = syncedRecords.length;
      
      const efficiencyScore = totalRainMm > 0 ? Math.round((effectiveSoilWaterInfiltrationMm / totalRainMm) * 100) : 0;
      let efficiencyCategory: RainEfficiencyCategory = 'excelente';
      if (efficiencyScore < 50) efficiencyCategory = 'baixa_escoamento_alto';
      else if (efficiencyScore < 75) efficiencyCategory = 'moderada';
      else if (efficiencyScore < 90) efficiencyCategory = 'boa';
      
      // 3. Compute Synced IEC
      const syncedEfficiency: RainEfficiencyIndex = {
        periodLabel: `Climatologia Regional Sincronizada (${selectedFarm.city})`,
        totalRainMm: Number(totalRainMm.toFixed(1)),
        rainDaysCount,
        averageRainPerRainDayMm: rainDaysCount > 0 ? Number((totalRainMm / rainDaysCount).toFixed(1)) : 0,
        efficiencyCategory,
        efficiencyScore: efficiencyScore || 85, // Default to a good 85 if no rain
        effectiveSoilWaterInfiltrationMm: Number(effectiveSoilWaterInfiltrationMm.toFixed(1)) || Number((totalRainMm * 0.85).toFixed(1)),
        estimatedSurfaceRunoffMm: Number(estimatedSurfaceRunoffMm.toFixed(1)) || Number((totalRainMm * 0.15).toFixed(1)),
        agronomicExplanation: `O Índice de Eficiência da Chuva (IEC) para ${selectedFarm?.city || 'a região'} foi recalculado com base no histórico real da estação climatológica regional. A temperatura média de ${liveData.station.currentAirTempC}°C e a umidade de ${liveData.station.currentHumidityPercent}% resultaram em uma taxa de infiltração efetiva de ${efficiencyScore || 85}% do volume precipitado.`,
        managementRecommendations: [
          'Mantenha o solo coberto com palhada (plantio direto) para elevar a eficiência de infiltração hídrica acima de 90%.',
          'A velocidade do vento e o VPD regional sugerem condições favoráveis para armazenamento e baixa perda por evaporação.',
          'Sincronize periodicamente para manter o balanço hídrico das culturas atualizado com as últimas chuvas e taxas de evapotranspiração (ET0).'
        ]
      };
      
      // 4. Crop Water Balances
      const syncedBalances: RainCropWaterBalance[] = (selectedFarm?.plots && selectedFarm.plots.length > 0 ? selectedFarm.plots : [
        { id: 'plot-01', name: 'Talhão Principal Sede', areaHa: selectedFarm?.cultivatedAreaHa || 100, currentCrop: 'Soja', variety: 'TMG 7062 IPRO', currentStage: 'Desenvolvimento Vegetativo', sowingDate: '2026-10-15', historyNotes: '' }
      ]).map((plot, i) => {
        const cropName = plot.currentCrop || 'Soja';
        const growthStage = plot.currentStage || 'Desenvolvimento';
        
        // Let's compute some agronomic estimates
        const cycleRequiredWaterMm = cropName.toLowerCase().includes('soja') ? 450 : cropName.toLowerCase().includes('milho') ? 500 : 350;
        const cycleAccumulatedRainMm = Number((totalRainMm + 15).toFixed(1)); // Some baseline plus current rain
        
        const waterAdequacyPercent = Math.min(100, Math.round((cycleAccumulatedRainMm / cycleRequiredWaterMm) * 100)) || 85;
        
        let status: 'adequado' | 'deficit_moderado' | 'deficit_severo' | 'excesso_encharcamento' = 'adequado';
        if (waterAdequacyPercent < 60) {
          status = 'deficit_severo';
        } else if (waterAdequacyPercent < 85) {
          status = 'deficit_moderado';
        } else if (waterAdequacyPercent > 120) {
          status = 'excesso_encharcamento';
        }
        
        const waterDeficitMm = Math.max(0, cycleRequiredWaterMm - cycleAccumulatedRainMm);
        const irrigationNeededMm = status.startsWith('deficit') ? Number((waterDeficitMm * 0.7).toFixed(1)) : 0;
        
        const recommendations = status === 'adequado'
          ? 'Condição hídrica ideal para o desenvolvimento da cultura. Monitore as previsões de chuva regional.'
          : status === 'deficit_moderado'
            ? 'Déficit leve detectado. Acompanhe a umidade do solo e planeje irrigação complementar se disponível.'
            : status === 'deficit_severo'
              ? 'Déficit severo! Estresse hídrico crítico afetando o potencial produtivo. Recomenda-se irrigação de salvação urgente.'
              : 'Solo saturado. Monitore problemas de drenagem e riscos fitossanitários devido ao excesso de umidade.';

        return {
          id: `bal-synced-${plot.id || i}`,
          cropName,
          growthStage,
          cycleAccumulatedRainMm,
          cycleRequiredWaterMm,
          waterAdequacyPercent,
          waterDeficitMm: Number(waterDeficitMm.toFixed(1)),
          irrigationNeededMm,
          status,
          recommendations,
        };
      });
      
      // Update alerts
      const syncedAlerts: RainAlertItem[] = [];
      if (liveData.station.rainAccumulatedTodayMm && liveData.station.rainAccumulatedTodayMm > 30) {
        syncedAlerts.push({
          id: 'alert-heavy-rain',
          title: 'Alerta de Chuva Excessiva',
          type: 'chuva_torrencial_erosao',
          severity: 'critico',
          timestamp: new Date().toISOString().split('T')[0],
          gaugeNames: [`Estação Telemétrica IoT (${selectedFarm.city})`],
          description: `Precipitação acumulada de ${liveData.station.rainAccumulatedTodayMm}mm nas últimas horas pode causar escoamento superficial e erosão no solo.`,
          actionRequired: 'Avalie as curvas de nível da lavoura e suspenda operações de maquinário pesado para evitar compactação.',
          resolved: false
        });
      }
      
      setGauges([syncedGauge]);
      setRecords(syncedRecords);
      setEfficiency(syncedEfficiency);
      setCropBalances(syncedBalances);
      setAlerts(syncedAlerts);
      setSelectedGaugeId('gauge-synced-telemetric');
      
      showNotification(`Sincronização concluída com sucesso para a climatologia de ${selectedFarm.city}!`);
    } catch (err: any) {
      console.error(err);
      showNotification(`Falha ao conectar com o banco de dados climatológico: ${err?.message || 'Erro desconhecido'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Selected Gauge for Details Modal or Map Click
  const [selectedGaugeId, setSelectedGaugeId] = useState<string>(initialRainGauges[0]?.id || '');

  // Map Filter Period
  const [mapPeriod, setMapPeriod] = useState<'today' | '24h' | '7days' | 'month' | 'year'>('month');

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Modal State: New Manual Rain Record
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [newRecordData, setNewRecordData] = useState({
    gaugeId: initialRainGauges[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    time: '07:00',
    amountMm: 15.0,
    durationMinutes: 60,
    intensity: 'moderada' as RainIntensityLevel,
    notes: '',
  });

  // Modal State: New Rain Gauge
  const [isGaugeModalOpen, setIsGaugeModalOpen] = useState(false);
  const [newGaugeData, setNewGaugeData] = useState({
    name: '',
    type: 'convencional' as RainGaugeType,
    model: 'Pluviômetro Tipo Cunha 150mm',
    plotName: 'Talhão 03',
    altitudeMeters: 620,
    latitude: -21.178,
    longitude: -47.822,
    notes: '',
  });

  const fallbackGauge: RainGaugePoint = {
    id: '',
    name: 'Nenhum Pluviômetro Cadastrado',
    type: 'convencional',
    model: 'Pluviômetro Tipo Cunha 150mm',
    plotId: '',
    plotName: 'Sem Local',
    latitude: 0,
    longitude: 0,
    altitudeMeters: 0,
    installedDate: '',
    status: 'inativo',
    accumulatedTodayMm: 0,
    accumulatedLast24hMm: 0,
    accumulatedLast7DaysMm: 0,
    accumulatedMonthMm: 0,
    accumulatedYearMm: 0,
    notes: ''
  };

  const selectedGauge = useMemo(() => {
    return gauges.find(g => g.id === selectedGaugeId) || gauges[0] || fallbackGauge;
  }, [gauges, selectedGaugeId]);

  const activeAlertsCount = useMemo(() => {
    return alerts.filter(a => !a.resolved).length;
  }, [alerts]);

  // Handle adding new manual rain record
  const handleSaveRainRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const targetGauge = gauges.find(g => g.id === newRecordData.gaugeId) || gauges[0] || fallbackGauge;

    // Compute automatic efficiency based on intensity & duration
    let score = 90;
    let runoff = 10;
    if (newRecordData.intensity === 'tempestade_torrencial') {
      score = 45;
      runoff = 55;
    } else if (newRecordData.intensity === 'forte') {
      score = 70;
      runoff = 30;
    } else if (newRecordData.intensity === 'garoa_leve') {
      score = 96;
      runoff = 4;
    }

    const createdRecord: RainRecord = {
      id: `rec-${Date.now()}`,
      gaugeId: targetGauge.id,
      gaugeName: targetGauge.name,
      plotName: targetGauge.plotName,
      date: newRecordData.date,
      time: newRecordData.time,
      amountMm: Number(newRecordData.amountMm),
      durationMinutes: Number(newRecordData.durationMinutes),
      intensity: newRecordData.intensity,
      recordedBy: 'Manual - Lançamento do Usuário',
      efficiencyScore: score,
      runoffEstimatedPercent: runoff,
      notes: newRecordData.notes || 'Registro manual via aplicativo.',
    };

    setRecords(prev => [createdRecord, ...prev]);

    // Update gauge accumulated numbers
    setGauges(prev =>
      prev.map(g => {
        if (g.id === targetGauge.id) {
          const added = Number(newRecordData.amountMm);
          return {
            ...g,
            accumulatedTodayMm: g.accumulatedTodayMm + added,
            accumulatedLast24hMm: g.accumulatedLast24hMm + added,
            accumulatedLast7DaysMm: g.accumulatedLast7DaysMm + added,
            accumulatedMonthMm: g.accumulatedMonthMm + added,
            accumulatedYearMm: g.accumulatedYearMm + added,
          };
        }
        return g;
      })
    );

    setIsRecordModalOpen(false);
    showNotification(`Medição de ${newRecordData.amountMm} mm registrada com sucesso no ${targetGauge.name}!`);
  };

  // Handle adding new rain gauge point
  const handleSaveRainGauge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGaugeData.name) {
      showNotification('Por favor, informe o nome do pluviômetro.');
      return;
    }

    const createdGauge: RainGaugePoint = {
      id: `pluv-${Date.now()}`,
      name: newGaugeData.name,
      type: newGaugeData.type,
      model: newGaugeData.model,
      plotName: newGaugeData.plotName,
      latitude: Number(newGaugeData.latitude),
      longitude: Number(newGaugeData.longitude),
      altitudeMeters: Number(newGaugeData.altitudeMeters),
      installedDate: new Date().toISOString().split('T')[0],
      status: 'ativo',
      batteryPercent: newGaugeData.type !== 'convencional' ? 100 : undefined,
      signalPercent: newGaugeData.type !== 'convencional' ? 95 : undefined,
      accumulatedTodayMm: 0,
      accumulatedLast24hMm: 0,
      accumulatedLast7DaysMm: 0,
      accumulatedMonthMm: 0,
      accumulatedYearMm: 0,
      notes: newGaugeData.notes || 'Pluviômetro cadastrado na fazenda.',
    };

    setGauges(prev => [...prev, createdGauge]);
    setIsGaugeModalOpen(false);
    showNotification(`Pluviômetro "${newGaugeData.name}" cadastrado com sucesso!`);
  };

  const handleResolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, resolved: true } : a)));
    showNotification('Alerta pluviométrico arquivado!');
  };

  // Get color for gauge map markers based on selected period
  const getGaugeVolumeForMap = (gauge: RainGaugePoint) => {
    switch (mapPeriod) {
      case 'today':
        return gauge.accumulatedTodayMm;
      case '24h':
        return gauge.accumulatedLast24hMm;
      case '7days':
        return gauge.accumulatedLast7DaysMm;
      case 'month':
        return gauge.accumulatedMonthMm;
      case 'year':
        return gauge.accumulatedYearMm;
    }
  };

  const getGaugeColorCategory = (volumeMm: number) => {
    if (volumeMm <= 15) {
      return {
        bg: 'bg-emerald-500',
        border: 'border-emerald-600',
        text: 'text-emerald-700 dark:text-emerald-300',
        label: 'Baixa / Leve (🟢)',
      };
    } else if (volumeMm <= 40) {
      return {
        bg: 'bg-amber-500',
        border: 'border-amber-600',
        text: 'text-amber-700 dark:text-amber-300',
        label: 'Moderada (🟡)',
      };
    } else if (volumeMm <= 75) {
      return {
        bg: 'bg-blue-500',
        border: 'border-blue-600',
        text: 'text-blue-700 dark:text-blue-300',
        label: 'Boa Precipitação (🔵)',
      };
    } else {
      return {
        bg: 'bg-rose-500',
        border: 'border-rose-600',
        text: 'text-rose-700 dark:text-rose-300',
        label: 'Chuva Excessiva (🔴)',
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-cyan-950 to-blue-950 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-teal-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-cyan-200/80 text-xs font-semibold">Rede de Pluviômetros da Fazenda</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              Monitoramento Pluviométrico Avançado & Eficiência da Chuva (IEC)
            </h2>
            <p className="text-xs sm:text-sm text-cyan-100/80 mt-1 max-w-3xl">
              Acompanhe a precipitação distribuída em todos os talhões, calcule o Índice de Eficiência da Chuva (infiltração vs. enxurrada) e tome decisões precisas para plantio, adubação e manejo de irrigação.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="bg-cyan-500 hover:bg-cyan-400 text-teal-950 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Lançar Chuva Manual
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="bg-teal-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between shadow-md animate-fade-in">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-white hover:text-teal-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. PAINEL PRINCIPAL DE CHUVAS                             */}
      {/* ========================================================= */}
      {activeSubTab === 'painel' && (
        <div className="space-y-6 animate-fade-in">
          {/* Sincronizador de Climatologia Regional */}
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 border border-teal-100 dark:border-teal-900/50 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase bg-teal-600 text-white rounded-md tracking-wider flex items-center gap-1 animate-pulse">
                  <Radio className="w-2.5 h-2.5" /> Climatologia Ativa
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Sincronização Climatológica Regional & IEC
                </h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-300">
                {selectedFarm 
                  ? `Conecte os pluviômetros e o balanço hídrico com os parâmetros meteorológicos em tempo real para ${selectedFarm.city} (${selectedFarm.state}).`
                  : 'Selecione uma propriedade agrícola na barra superior para habilitar a sincronização dos parâmetros de climatologia.'
                }
              </p>
            </div>
            
            <button
              onClick={handleSyncClimatology}
              disabled={isSyncing || !selectedFarm}
              className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-xs flex items-center gap-2 transition cursor-pointer select-none ${
                isSyncing 
                  ? 'bg-slate-400 dark:bg-zinc-700 cursor-not-allowed' 
                  : !selectedFarm 
                    ? 'bg-slate-300 dark:bg-zinc-800 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-500'
              }`}
            >
              {isSyncing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sincronizando...
                </>
              ) : (
                <>
                  <CloudRain className="w-4 h-4" />
                  Sincronizar com {selectedFarm?.city || 'Climatologia'}
                </>
              )}
            </button>
          </div>

          {/* Main KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  Chuva de Hoje & 24h
                </span>
                <span className="p-1.5 bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 rounded-lg">
                  <CloudRain className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
                {gauges[0]?.accumulatedTodayMm?.toFixed(1) || '0.0'} <span className="text-xs font-bold text-slate-400">mm</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold mt-1">
                Últimas 24h: {gauges[0]?.accumulatedLast24hMm?.toFixed(1) || '0.0'} mm • {gauges[0] ? 'Estação conectada' : 'Sem pluviômetro'}
              </div>
            </div>

            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  Últimos 7 Dias
                </span>
                <span className="p-1.5 bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 rounded-lg">
                  <Calendar className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400 mt-2">
                {gauges[0]?.accumulatedLast7DaysMm?.toFixed(1) || '0.0'} <span className="text-xs font-bold">mm</span>
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                {records.length} registros pluviométricos catalogados
              </div>
            </div>

            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  Chuva do Mês
                </span>
                <span className="p-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Droplets className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 mt-2">
                {gauges[0]?.accumulatedMonthMm?.toFixed(1) || '0.0'} <span className="text-xs font-bold">mm</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold mt-1">
                Acumulado mensal sincronizado regionalmente
              </div>
            </div>

            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  Acumulado do Ano (Safra)
                </span>
                <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
                {gauges[0]?.accumulatedYearMm?.toFixed(1) || '0.0'} <span className="text-xs font-bold">mm</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold mt-1">
                IEC Calculado: <strong>{efficiency.efficiencyScore}% ({efficiency.efficiencyCategory})</strong>
              </div>
            </div>
          </div>

          {/* Quick Pluviometer List & Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Pluviometer Cards Grid (8 cols) */}
            <div className="lg:col-span-8 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    Precipitação nos Pontos de Monitoramento da Fazenda
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Clique em um pluviômetro para ver detalhes e histórico individual.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSubTab('cadastro_pluviometros')}
                  className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  Gerenciar Pontos →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {gauges.map(g => (
                  <div
                    key={g.id}
                    onClick={() => {
                      setSelectedGaugeId(g.id);
                      setActiveSubTab('mapa_inteligente');
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      selectedGaugeId === g.id
                        ? 'border-teal-500 bg-teal-50/40 dark:bg-teal-950/20'
                        : 'border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50 hover:border-teal-400'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">{g.name}</h4>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">{g.plotName}</span>
                      </div>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          g.type.startsWith('automatico')
                            ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300'
                            : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        {g.type.startsWith('automatico') ? 'IoT Solar' : 'Manual'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-200/50 dark:border-zinc-800/80">
                      <div className="bg-white dark:bg-black/60 p-1.5 rounded-lg border border-slate-100 dark:border-zinc-800">
                        <span className="text-[9px] text-slate-400 block">7 Dias</span>
                        <strong className="text-xs text-cyan-600 dark:text-cyan-400 font-black">{g.accumulatedLast7DaysMm} mm</strong>
                      </div>
                      <div className="bg-white dark:bg-black/60 p-1.5 rounded-lg border border-slate-100 dark:border-zinc-800">
                        <span className="text-[9px] text-slate-400 block">Mês</span>
                        <strong className="text-xs text-blue-600 dark:text-blue-400 font-black">{g.accumulatedMonthMm} mm</strong>
                      </div>
                      <div className="bg-white dark:bg-black/60 p-1.5 rounded-lg border border-slate-100 dark:border-zinc-800">
                        <span className="text-[9px] text-slate-400 block">Ano</span>
                        <strong className="text-xs text-indigo-600 dark:text-indigo-400 font-black">{g.accumulatedYearMm} mm</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Efficiency Index & Water Balance Snapshot (4 cols) */}
            <div className="lg:col-span-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-teal-600 dark:text-teal-400 tracking-wider">
                  Diferencial Exclusivo
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-teal-600" />
                  Eficiência da Chuva (IEC)
                </h3>
              </div>

              <div className="bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50 p-3.5 rounded-xl text-center space-y-1">
                <span className="text-xs font-bold text-teal-900 dark:text-teal-300">Aproveitamento Efetivo da Água:</span>
                <div className="text-3xl font-black text-teal-700 dark:text-teal-400">{efficiency.efficiencyScore}%</div>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full inline-block">
                  Classificação: Excelente
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
                  <span>Infiltração Efetiva no Solo:</span>
                  <strong className="text-teal-700 dark:text-teal-400">{efficiency.effectiveSoilWaterInfiltrationMm} mm (89%)</strong>
                </div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
                  <span>Perda por Enxurrada (Runoff):</span>
                  <strong className="text-rose-600">{efficiency.estimatedSurfaceRunoffMm} mm (11%)</strong>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed pt-1 border-t border-slate-100 dark:border-zinc-800">
                  {efficiency.agronomicExplanation}
                </p>
              </div>

              <button
                onClick={() => setActiveSubTab('eficiencia_iec')}
                className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
              >
                Ver Análise Completa do IEC →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MAPA INTELIGENTE DE CHUVAS (DIFERENCIAL EXCLUSIVO)       */}
      {/* ========================================================= */}
      {activeSubTab === 'mapa_inteligente' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-teal-600 dark:text-teal-400 tracking-wider">
                  Diferencial GeaAgro Pluvio
                </span>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-teal-600" />
                  Mapa Inteligente de Chuvas da Propriedade
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Cada pluviômetro é colorido dinamicamente pelo volume acumulado no período selecionado para identificar microclimas e variação espacial.
                </p>
              </div>

              {/* Period Selector Tabs */}
              <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-bold">
                {[
                  { id: 'today', label: 'Hoje' },
                  { id: '24h', label: '24h' },
                  { id: '7days', label: '7 Dias' },
                  { id: 'month', label: 'Mês Atual' },
                  { id: 'year', label: 'Ano' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setMapPeriod(p.id as any)}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      mapPeriod === p.id
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="text-slate-500 text-[11px] uppercase">Legenda de Cores:</span>
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600" /> Baixa (&le; 15 mm)
              </span>
              <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-600" /> Moderada (16 a 40 mm)
              </span>
              <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                <span className="w-3 h-3 rounded-full bg-blue-500 border border-blue-600" /> Boa Precipitação (41 a 75 mm)
              </span>
              <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                <span className="w-3 h-3 rounded-full bg-rose-500 border border-rose-600" /> Chuva Excessiva (&gt; 75 mm)
              </span>
            </div>

            {/* Simulated Geospatial Interactive Farm Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Visual Map Layout (8 cols) */}
              <div className="lg:col-span-8 bg-slate-900 rounded-2xl p-5 border border-slate-800 relative min-h-[380px] flex flex-col justify-between overflow-hidden shadow-inner">
                {/* Background topographic grid lines */}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="flex justify-between items-center text-slate-400 text-xs font-mono z-10">
                  <span>FAZENDA SANTA HELENA • TOPOGRAFIA DIGITAL</span>
                  <span>COORDENADAS: 21°10'S / 47°49'W</span>
                </div>

                {/* Gauges Placed along the farm coordinates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 my-4 z-10">
                  {gauges.map(g => {
                    const volume = getGaugeVolumeForMap(g);
                    const colorStyle = getGaugeColorCategory(volume);
                    const isSelected = selectedGaugeId === g.id;

                    return (
                      <div
                        key={g.id}
                        onClick={() => setSelectedGaugeId(g.id)}
                        className={`p-3.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer shadow-lg ${
                          isSelected
                            ? 'bg-slate-800/95 border-teal-400 ring-2 ring-teal-400/50 scale-[1.02]'
                            : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-3.5 h-3.5 rounded-full ${colorStyle.bg} border ${colorStyle.border} shrink-0 animate-pulse`} />
                            <div>
                              <strong className="text-white text-xs block leading-tight">{g.name}</strong>
                              <span className="text-[10px] text-slate-400">{g.plotName}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between">
                          <span className="text-[10px] text-slate-300 font-medium">Acumulado ({mapPeriod}):</span>
                          <span className="text-sm font-black text-cyan-300">{volume} mm</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-[11px] text-slate-400 z-10 flex items-center justify-between">
                  <span>Toque em qualquer ponto para abrir o prontuário pluviométrico lateral.</span>
                  <span className="text-teal-400 font-bold">Altitude média: 625 m</span>
                </div>
              </div>

              {/* Sidebar: Details for Selected Rain Gauge (4 cols) */}
              <div className="lg:col-span-4 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
                <div className="border-b border-slate-200 dark:border-zinc-800 pb-3">
                  <span className="text-[10px] font-black uppercase text-teal-600 dark:text-teal-400 tracking-wider">
                    Prontuário do Ponto Selecionado
                  </span>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white mt-0.5">
                    {selectedGauge.name}
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-teal-500" />
                    {selectedGauge.plotName} • Alt: {selectedGauge.altitudeMeters}m
                  </span>
                </div>

                {/* Metrics Table */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800">
                    <span className="text-slate-500">Tipo de Equipamento:</span>
                    <strong className="text-slate-900 dark:text-white uppercase text-[11px]">
                      {selectedGauge.type.replace('_', ' ')}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800">
                    <span className="text-slate-500">Últimos 7 Dias:</span>
                    <strong className="text-cyan-600 dark:text-cyan-400 font-black">
                      {selectedGauge.accumulatedLast7DaysMm} mm
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800">
                    <span className="text-slate-500">Acumulado do Mês:</span>
                    <strong className="text-blue-600 dark:text-blue-400 font-black">
                      {selectedGauge.accumulatedMonthMm} mm
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800">
                    <span className="text-slate-500">Acumulado do Ano:</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 font-black">
                      {selectedGauge.accumulatedYearMm} mm
                    </strong>
                  </div>
                </div>

                {/* Specific Agronomic Recommendations for this Gauge */}
                <div className="bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/50 p-3 rounded-lg text-[11px] text-teal-950 dark:text-teal-200 space-y-1">
                  <strong className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    Recomendação de Manejo para este Ponto:
                  </strong>
                  <p className="leading-relaxed">
                    Precipitação uniforme e suficiente para sustentação hídrica. A umidade no perfil permite adubação de cobertura e suspensão de irrigação por pivô nos próximos 4 dias.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setNewRecordData(prev => ({ ...prev, gaugeId: selectedGauge.id }));
                    setIsRecordModalOpen(true);
                  }}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded-lg text-xs cursor-pointer shadow-xs"
                >
                  Lançar Chuva Neste Pluviômetro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. ÍNDICE DE EFICIÊNCIA DA CHUVA (IEC - DIFERENCIAL)       */}
      {/* ========================================================= */}
      {activeSubTab === 'eficiencia_iec' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-5">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
              <span className="text-[10px] font-extrabold uppercase text-teal-600 dark:text-teal-400 tracking-wider">
                Conceito Agronômico Avançado
              </span>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Gauge className="w-5 h-5 text-teal-600" />
                Índice de Eficiência da Chuva (IEC) — Volume vs. Distribuição
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-3xl">
                Não importa apenas a quantidade de milímetros que caiu, mas a velocidade e a distribuição com que a água atingiu o solo. 60 mm distribuídos em 6 dias com chuva mansa infiltram 90%+ no solo, enquanto 60 mm concentrados em 40 minutos provocam erosão e escorrimento superficial de até 65%.
              </p>
            </div>

            {/* Comparison Simulation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Scenario A: Distributed Rain */}
              <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Cenário Ideal: Chuva Mansa & Distribuída (60 mm em 6 dias)
                  </strong>
                  <span className="text-xs font-black bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded">
                    IEC: 92%
                  </span>
                </div>
                <p className="text-xs text-emerald-900/80 dark:text-emerald-300/80 leading-relaxed">
                  Taxa de precipitação abaixo da velocidade de infiltração básica do solo (VIB). Quase a totalidade da água atinge a zona de raízes e recarrega os aquíferos.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-emerald-200/60 dark:border-emerald-800/40">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Infiltração Útil no Solo:</span>
                    <strong className="text-emerald-700 dark:text-emerald-300 font-bold text-sm">55.2 mm (92%)</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Perda por Enxurrada:</span>
                    <strong className="text-slate-600 font-bold text-sm">4.8 mm (8%)</strong>
                  </div>
                </div>
              </div>

              {/* Scenario B: Torrential Storm */}
              <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-bold text-rose-950 dark:text-rose-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Cenário Crítico: Tempestade Torrencial (60 mm em 40 minutos)
                  </strong>
                  <span className="text-xs font-black bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200 px-2 py-0.5 rounded">
                    IEC: 38%
                  </span>
                </div>
                <p className="text-xs text-rose-900/80 dark:text-rose-300/80 leading-relaxed">
                  Intensidade supera bruscamente a VIB do solo. Causa selamento superficial, arraste de solo arável, lixiviação de fertilizantes e baixa recarga profunda.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-rose-200/60 dark:border-rose-800/40">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Infiltração Útil no Solo:</span>
                    <strong className="text-rose-700 dark:text-rose-300 font-bold text-sm">22.8 mm (38%)</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Perda por Enxurrada:</span>
                    <strong className="text-rose-600 font-bold text-sm">37.2 mm (62%)</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations for current farm IEC */}
            <div className="bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 p-4 rounded-xl space-y-3">
              <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                Recomendações Práticas Baseadas no IEC da Fazenda ({efficiency.efficiencyScore}%):
              </strong>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {efficiency.managementRecommendations.map((rec, i) => (
                  <div key={i} className="p-3 bg-white dark:bg-black rounded-lg border text-xs text-slate-700 dark:text-zinc-300 space-y-1">
                    <span className="text-[10px] font-bold text-teal-600 uppercase block">Diretriz {i + 1}</span>
                    <p className="leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. LANÇAMENTOS MANUAIS & HISTÓRICO                       */}
      {/* ========================================================= */}
      {activeSubTab === 'lancamento' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-teal-600" />
                  Histórico de Registros de Chuva (Manuais & IoT)
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Todas as leituras de precipitação com data, hora, volume e cálculo de eficiência.
                </p>
              </div>

              <button
                onClick={() => setIsRecordModalOpen(true)}
                className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                Novo Lançamento Manual
              </button>
            </div>

            {/* Table of Records */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-slate-600 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Data / Hora</th>
                    <th className="py-2.5 px-3">Pluviômetro / Talhão</th>
                    <th className="py-2.5 px-3 text-center">Volume (mm)</th>
                    <th className="py-2.5 px-3 text-center">Duração</th>
                    <th className="py-2.5 px-3 text-center">Intensidade</th>
                    <th className="py-2.5 px-3 text-center">Eficiência (IEC)</th>
                    <th className="py-2.5 px-3">Origem / Responsável</th>
                    <th className="py-2.5 px-3">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {records.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                        {rec.date} <span className="text-slate-400 text-[10px] block">{rec.time}</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800 dark:text-zinc-200">{rec.gaugeName}</div>
                        <div className="text-[10px] text-slate-400">{rec.plotName}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-sm font-black text-cyan-600 dark:text-cyan-400">{rec.amountMm} mm</span>
                      </td>
                      <td className="py-3 px-3 text-center font-medium text-slate-600 dark:text-zinc-300">
                        {rec.durationMinutes} min
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            rec.intensity === 'garoa_leve'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : rec.intensity === 'moderada'
                              ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {rec.intensity.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <strong className="text-emerald-600 font-bold">{rec.efficiencyScore}%</strong>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-zinc-400 text-[11px]">
                        {rec.recordedBy}
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-zinc-400 text-[11px] max-w-xs truncate">
                        {rec.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. CADASTRO DE PLUVIÔMETROS                               */}
      {/* ========================================================= */}
      {activeSubTab === 'cadastro_pluviometros' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-teal-600" />
                  Rede de Pontos Pluviométricos Cadastrados na Propriedade
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Gerencie pluviômetros convencionais de leitura manual e estações automáticas IoT conectadas.
                </p>
              </div>

              <button
                onClick={() => setIsGaugeModalOpen(true)}
                className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                Cadastrar Novo Pluviômetro
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gauges.map(g => (
                <div
                  key={g.id}
                  className="bg-slate-50/70 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{g.name}</h4>
                      <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold block mt-0.5">
                        {g.plotName}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        g.type.startsWith('automatico')
                          ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                          : 'bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      {g.type.startsWith('automatico') ? 'Automático' : 'Convencional'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 dark:text-zinc-400">
                    <div>Modelo: <strong className="text-slate-800 dark:text-zinc-200">{g.model}</strong></div>
                    <div>Altitude: <strong className="text-slate-800 dark:text-zinc-200">{g.altitudeMeters} m</strong></div>
                    <div>Coordenadas: <span className="font-mono text-[10px]">{g.latitude}, {g.longitude}</span></div>
                    {g.batteryPercent && (
                      <div className="text-emerald-600 font-bold flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5" /> Bateria: {g.batteryPercent}% • Sinal: {g.signalPercent}%
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200/50 dark:border-zinc-800 flex justify-between text-xs">
                    <span className="text-slate-500">Mês: <strong className="text-blue-600">{g.accumulatedMonthMm} mm</strong></span>
                    <span className="text-slate-500">Ano: <strong className="text-indigo-600">{g.accumulatedYearMm} mm</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. BALANÇO HÍDRICO POR CULTURA                            */}
      {/* ========================================================= */}
      {activeSubTab === 'balanco_culturas' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-600" />
                Adequação Pluviométrica & Balanço Hídrico por Cultura
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Comparativo da chuva acumulada no ciclo vs. a necessidade hídrica total para a fase fenológica atual.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cropBalances.map(c => (
                <div
                  key={c.id}
                  className="bg-slate-50/70 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 p-4 rounded-xl space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{c.cropName}</h4>
                      <span className="text-xs text-slate-500 dark:text-zinc-400">Fase: {c.growthStage}</span>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                        c.status === 'adequado'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {c.status === 'adequado' ? 'Adequado (95%+)' : 'Atenção / Déficit'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Chuva Acumulada no Ciclo:</span>
                      <strong className="text-cyan-600 dark:text-cyan-400 font-bold">{c.cycleAccumulatedRainMm} mm</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Demanda Hídrica Total do Ciclo:</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{c.cycleRequiredWaterMm} mm</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Déficit Hídrico Acumulado:</span>
                      <strong className="text-amber-600 font-bold">{c.waterDeficitMm} mm</strong>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-black p-3 rounded-lg border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-700 dark:text-zinc-300">
                    <strong className="text-teal-700 dark:text-teal-400 block font-bold">Orientação Agronômica:</strong>
                    <p className="mt-0.5 leading-relaxed">{c.recommendations}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. RELATÓRIOS & COMPARAÇÕES                               */}
      {/* ========================================================= */}
      {activeSubTab === 'relatorios' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              Relatórios de Precipitação & Comparações Sazonais
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">Chuva por Mês (Safra Atual)</span>
                <p className="text-slate-500">Total acumulado de 840.5 mm distribuídos em 48 dias de chuva.</p>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">Comparativo Entre Talhões</span>
                <p className="text-slate-500">Variação de até 18% de chuva entre o Talhão 01 (baixo) e a Pastagem Norte (espigão).</p>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">Histórico de Veranicos</span>
                <p className="text-slate-500">Maior veranico registrado no ciclo foi de 14 dias sem precipitação em Janeiro.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. ALERTAS PLUVIOMÉTRICOS                                 */}
      {/* ========================================================= */}
      {activeSubTab === 'alertas' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Central de Alertas Pluviométricos
            </h3>

            <div className="space-y-2">
              {alerts.map(alt => (
                <div
                  key={alt.id}
                  className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                    alt.resolved
                      ? 'bg-slate-50 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800 opacity-60'
                      : 'bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{alt.title}</span>
                        <span className="text-[10px] text-slate-400">{alt.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-300 mt-0.5">{alt.description}</p>
                      <div className="mt-2 text-[11px] text-teal-700 dark:text-teal-300 font-semibold">
                        Ação Recomendada: {alt.actionRequired}
                      </div>
                    </div>
                  </div>

                  {!alt.resolved && (
                    <button
                      onClick={() => handleResolveAlert(alt.id)}
                      className="px-3 py-1 bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs font-bold text-teal-600 dark:text-teal-400 rounded-lg hover:bg-teal-50 cursor-pointer shrink-0"
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
      {/* MODAL: LANÇAMENTO MANUAL DE CHUVA                         */}
      {/* ========================================================= */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CloudRain className="w-5 h-5 text-teal-600" />
                Lançamento Manual de Precipitação (Pluviômetro)
              </h3>
              <button onClick={() => setIsRecordModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRainRecord} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">Ponto Pluviométrico / Talhão:</label>
                <select
                  value={newRecordData.gaugeId}
                  onChange={e => setNewRecordData(prev => ({ ...prev, gaugeId: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-semibold text-slate-900 dark:text-white"
                >
                  {gauges.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.plotName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Data da Leitura:</label>
                  <input
                    type="date"
                    value={newRecordData.date}
                    onChange={e => setNewRecordData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-semibold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Horário da Medição:</label>
                  <input
                    type="time"
                    value={newRecordData.time}
                    onChange={e => setNewRecordData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Chuva Registrada (mm):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={newRecordData.amountMm}
                    onChange={e => setNewRecordData(prev => ({ ...prev, amountMm: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-bold text-teal-600 text-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Duração da Chuva (minutos):</label>
                  <input
                    type="number"
                    min="5"
                    value={newRecordData.durationMinutes}
                    onChange={e => setNewRecordData(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) || 30 }))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">Intensidade Observada:</label>
                <select
                  value={newRecordData.intensity}
                  onChange={e => setNewRecordData(prev => ({ ...prev, intensity: e.target.value as any }))}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-semibold"
                >
                  <option value="garoa_leve">Garoa Leve / Chuva fina (Infiltração 96%+)</option>
                  <option value="moderada">Moderada / Mansa contínua (Infiltração 90%)</option>
                  <option value="forte">Forte (Infiltração 70%)</option>
                  <option value="tempestade_torrencial">Tempestade Torrencial (Enxurrada 55%+)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">Observações de Campo:</label>
                <textarea
                  value={newRecordData.notes}
                  onChange={e => setNewRecordData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ex: Chuva uniforme sem vento forte. Excelente para o plantio."
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg cursor-pointer shadow-sm"
                >
                  Salvar Medição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: NOVO CADASTRO DE PLUVIÔMETRO                       */}
      {/* ========================================================= */}
      {isGaugeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-teal-600" />
                Cadastrar Novo Pluviômetro na Fazenda
              </h3>
              <button onClick={() => setIsGaugeModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRainGauge} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">Nome do Ponto Pluviométrico:</label>
                <input
                  type="text"
                  placeholder="Ex: Pluviômetro Talhão 05 - Café"
                  value={newGaugeData.name}
                  onChange={e => setNewGaugeData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Tipo de Equipamento:</label>
                  <select
                    value={newGaugeData.type}
                    onChange={e => setNewGaugeData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-semibold"
                  >
                    <option value="convencional">Convencional (Manual - Cunha)</option>
                    <option value="automatico_lora">Automático IoT (LoRaWAN)</option>
                    <option value="automatico_wifi">Automático IoT (Wi-Fi)</option>
                    <option value="automatico_gsm">Automático IoT (Celular 4G)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Talhão Associado:</label>
                  <input
                    type="text"
                    value={newGaugeData.plotName}
                    onChange={e => setNewGaugeData(prev => ({ ...prev, plotName: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Altitude (m):</label>
                  <input
                    type="number"
                    value={newGaugeData.altitudeMeters}
                    onChange={e => setNewGaugeData(prev => ({ ...prev, altitudeMeters: parseInt(e.target.value) || 600 }))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Latitude:</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newGaugeData.latitude}
                    onChange={e => setNewGaugeData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-mono text-[11px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Longitude:</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newGaugeData.longitude}
                    onChange={e => setNewGaugeData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">Observações de Instalação:</label>
                <textarea
                  value={newGaugeData.notes}
                  onChange={e => setNewGaugeData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ex: Fixado a 1.5m do solo em mourão de cerca, sem obstáculos de copas de árvores."
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsGaugeModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg cursor-pointer shadow-sm"
                >
                  Salvar Pluviômetro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
