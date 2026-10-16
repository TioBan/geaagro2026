import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  X,
  Printer,
  Calendar,
  Layers,
  Thermometer,
  CloudSun,
  Activity,
  Gauge,
  Sun,
  Wind,
  Droplets,
  Sprout,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Building2,
  Trash2,
  Eye,
  Sliders,
  HelpCircle,
  Zap,
  MapPin,
  ClipboardList,
} from 'lucide-react';
import {
  BrixReading,
  PlotBrixSummary,
  CropBrixThresholds,
  PhenologicalStage,
  BrixStatus,
} from '../types/brix';
import {
  CROP_BRIX_DATABASE,
  SAMPLE_PLOTS_DATABASE,
  INITIAL_BRIX_READINGS,
  calculateVPD,
  evaluateBrixReading,
  calculateBrixStatistics,
} from '../data/brixData';

export type BrixSubTab =
  | 'dashboard_isf'
  | 'leituras_refratometro'
  | 'mapa_calor_talhoes'
  | 'banco_culturas'
  | 'inteligencia_trofobiose'
  | 'estatisticas_variabilidade'
  | 'laudo_oficial';

interface BrixModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: BrixSubTab) => void;
}

export const BrixModule: React.FC<BrixModuleProps> = ({
  activeSubTab: externalSubTab,
  setActiveSubTab: setExternalSubTab,
}) => {
  const [internalSubTab, setInternalSubTab] = useState<BrixSubTab>('dashboard_isf');
  const activeSubTab = (externalSubTab as BrixSubTab) || internalSubTab;
  const setActiveSubTab = (tab: BrixSubTab) => {
    setInternalSubTab(tab);
    if (setExternalSubTab) {
      setExternalSubTab(tab);
    }
  };

  const [readings, setReadings] = useState<BrixReading[]>(() => {
    try {
      const saved = localStorage.getItem('geaagro_brix_readings');
      return saved ? JSON.parse(saved) : INITIAL_BRIX_READINGS;
    } catch {
      return INITIAL_BRIX_READINGS;
    }
  });

  const [plots, setPlots] = useState<PlotBrixSummary[]>(() => {
    try {
      const saved = localStorage.getItem('geaagro_brix_plots');
      return saved ? JSON.parse(saved) : SAMPLE_PLOTS_DATABASE;
    } catch {
      return SAMPLE_PLOTS_DATABASE;
    }
  });

  const [selectedReadingId, setSelectedReadingId] = useState<string>(() => {
    return readings[0]?.id || '';
  });

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('geaagro_brix_readings', JSON.stringify(readings));
    } catch (e) {
      console.warn('Erro ao salvar leituras de Brix no localStorage', e);
    }
  }, [readings]);

  useEffect(() => {
    try {
      localStorage.setItem('geaagro_brix_plots', JSON.stringify(plots));
    } catch (e) {
      console.warn('Erro ao salvar talhões de Brix no localStorage', e);
    }
  }, [plots]);

  // Keep selectedReadingId valid
  useEffect(() => {
    if (readings.length > 0 && !readings.some(r => r.id === selectedReadingId)) {
      setSelectedReadingId(readings[0].id);
    } else if (readings.length === 0) {
      setSelectedReadingId('');
    }
  }, [readings, selectedReadingId]);

  // Filters
  const [searchReadingQuery, setSearchReadingQuery] = useState<string>('');
  const [selectedPlotFilter, setSelectedPlotFilter] = useState<string>('todos');
  const [searchCropQuery, setSearchCropQuery] = useState<string>('');

  // Modal for New Brix Reading
  const [isNewReadingModalOpen, setIsNewReadingModalOpen] = useState<boolean>(false);
  const [newPlotMode, setNewPlotMode] = useState<'select' | 'custom'>('custom');
  const [newPlotId, setNewPlotId] = useState<string>('');
  const [newCustomPlotName, setNewCustomPlotName] = useState<string>('');
  const [newPlotArea, setNewPlotArea] = useState<string>('');
  const [newPropertyName, setNewPropertyName] = useState<string>('');

  const [newCropName, setNewCropName] = useState<string>('Soja');
  const [newVariety, setNewVariety] = useState<string>('');
  const [newStage, setNewStage] = useState<PhenologicalStage>('vegetativo');
  const [newPlantId, setNewPlantId] = useState<string>('');
  const [newOperator, setNewOperator] = useState<string>('');
  const [newRefractometer, setNewRefractometer] = useState<string>('');
  const [newBrixValue, setNewBrixValue] = useState<string>('');
  const [newLeafTemp, setNewLeafTemp] = useState<string>('');
  const [newAirTemp, setNewAirTemp] = useState<string>('');
  const [newHumidity, setNewHumidity] = useState<string>('');
  const [newSolarRad, setNewSolarRad] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const currentReading = useMemo(() => {
    if (!readings || readings.length === 0) return null;
    return readings.find(r => r.id === selectedReadingId) || readings[0];
  }, [readings, selectedReadingId]);

  // Overall Statistics
  const stats = useMemo(() => {
    return calculateBrixStatistics(readings);
  }, [readings]);

  const avgHealthScore = useMemo(() => {
    if (!readings || readings.length === 0) return 0;
    return Math.round(readings.reduce((acc, r) => acc + r.physiologicalHealthScore, 0) / readings.length);
  }, [readings]);

  const bestPlot = useMemo(() => {
    if (!plots || plots.length === 0) return null;
    return [...plots].sort((a, b) => b.currentAvgBrix - a.currentAvgBrix)[0];
  }, [plots]);

  const criticalPlot = useMemo(() => {
    if (!plots || plots.length === 0) return null;
    return [...plots].sort((a, b) => a.currentAvgBrix - b.currentAvgBrix)[0];
  }, [plots]);

  const resetForm = () => {
    setNewPlotId(plots[0]?.plotId || '');
    setNewPlotMode(plots.length > 0 ? 'select' : 'custom');
    setNewCustomPlotName('');
    setNewPlotArea('');
    setNewPropertyName('');
    setNewCropName('Soja');
    setNewVariety('');
    setNewStage('vegetativo');
    setNewPlantId('');
    setNewOperator('');
    setNewRefractometer('');
    setNewBrixValue('');
    setNewLeafTemp('');
    setNewAirTemp('');
    setNewHumidity('');
    setNewSolarRad('');
    setNewNotes('');
  };

  const handleOpenModal = () => {
    resetForm();
    setIsNewReadingModalOpen(true);
  };

  const handleCreateReading = () => {
    const parsedBrix = parseFloat(newBrixValue);
    if (isNaN(parsedBrix) || parsedBrix <= 0) {
      showNotification('Por favor, insira um valor válido de °Brix.');
      return;
    }

    let finalPlotId = newPlotId;
    let finalPlotName = '';
    const parsedArea = parseFloat(newPlotArea) || 100;

    if (newPlotMode === 'custom' || !finalPlotId) {
      const plotNameVal = newCustomPlotName.trim() || `Talhão ${plots.length + 1}`;
      finalPlotId = `plot-${Date.now()}`;
      finalPlotName = plotNameVal;

      const cropObj = CROP_BRIX_DATABASE.find(c => c.cropName === newCropName);
      const targetBrixVal = cropObj ? cropObj.idealBrixMin : 10.0;

      const newPlotSummary: PlotBrixSummary = {
        plotId: finalPlotId,
        plotName: finalPlotName,
        cropName: newCropName,
        areaHa: parsedArea,
        currentAvgBrix: parsedBrix,
        targetBrix: targetBrixVal,
        healthStatus: parsedBrix >= targetBrixVal ? 'alto' : 'medio',
        healthScore: Math.min(100, Math.round((parsedBrix / targetBrixVal) * 85)),
        totalReadings: 1,
        trend: 'estavel',
        lastReadingDate: new Date().toISOString().split('T')[0],
      };

      setPlots(prev => [newPlotSummary, ...prev]);
    } else {
      const existingPlot = plots.find(p => p.plotId === finalPlotId);
      finalPlotName = existingPlot ? existingPlot.plotName : 'Talhão';
    }

    const parsedLeafTemp = parseFloat(newLeafTemp) || 25.0;
    const parsedAirTemp = parseFloat(newAirTemp) || 26.5;
    const parsedHumidity = parseInt(newHumidity) || 60;
    const parsedSolarRad = parseInt(newSolarRad) || 800;

    const vpd = calculateVPD(parsedAirTemp, parsedLeafTemp, parsedHumidity);
    const evaluation = evaluateBrixReading(newCropName, newStage, parsedBrix, vpd);

    const newRec: BrixReading = {
      id: `rd-${Date.now()}`,
      sampleCode: `BRX-${new Date().getFullYear()}-${String(readings.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString().slice(0, 5),
      propertyName: newPropertyName.trim() || 'Fazenda Principal',
      plotId: finalPlotId,
      plotName: finalPlotName,
      cropName: newCropName,
      variety: newVariety.trim() || 'Padrão',
      stage: newStage,
      plantId: newPlantId.trim() || `PL-${readings.length + 1}`,
      operatorName: newOperator.trim() || 'Responsável Técnico',
      refractometerModel: newRefractometer.trim() || 'Refratômetro Óptico/Digital',
      brixValue: parsedBrix,
      leafTemperatureCelsius: parsedLeafTemp,
      ambientTemperatureCelsius: parsedAirTemp,
      relativeHumidityPercent: parsedHumidity,
      solarRadiationWattsM2: parsedSolarRad,
      calculatedVpdKPa: vpd,
      soilMoisturePercent: 30,
      nutritionNotes: newNotes.trim() || undefined,
      pestDiseaseStatus: 'sem_pragas',
      status: evaluation.status,
      physiologicalHealthScore: evaluation.healthScore,
      technicalInterpretation: evaluation.interpretation,
    };

    setReadings(prev => [newRec, ...prev]);
    setSelectedReadingId(newRec.id);

    // Update Plot Summary if existing
    if (newPlotMode === 'select' && newPlotId) {
      setPlots(prev =>
        prev.map(p => {
          if (p.plotId === finalPlotId) {
            const newAvg = Math.round(((p.currentAvgBrix * p.totalReadings + parsedBrix) / (p.totalReadings + 1)) * 10) / 10;
            return {
              ...p,
              currentAvgBrix: newAvg,
              totalReadings: p.totalReadings + 1,
              healthScore: evaluation.healthScore,
              healthStatus: evaluation.status,
              trend: parsedBrix >= p.currentAvgBrix ? 'subindo' : 'caindo',
              lastReadingDate: newRec.date,
            };
          }
          return p;
        })
      );
    }

    setIsNewReadingModalOpen(false);
    showNotification(`Leitura de ${parsedBrix}°Brix cadastrada no ${finalPlotName} com sucesso! ISF: ${evaluation.healthScore}/100.`);
  };

  const handleDeleteReading = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Deseja realmente excluir esta leitura de °Brix?')) {
      setReadings(prev => prev.filter(r => r.id !== id));
      showNotification('Leitura excluída com sucesso.');
    }
  };

  const filteredReadings = useMemo(() => {
    return readings.filter(r => {
      const matchesSearch =
        r.sampleCode.toLowerCase().includes(searchReadingQuery.toLowerCase()) ||
        r.plotName.toLowerCase().includes(searchReadingQuery.toLowerCase()) ||
        r.cropName.toLowerCase().includes(searchReadingQuery.toLowerCase()) ||
        r.variety.toLowerCase().includes(searchReadingQuery.toLowerCase());
      const matchesPlot = selectedPlotFilter === 'todos' || r.plotId === selectedPlotFilter;
      return matchesSearch && matchesPlot;
    });
  }, [readings, searchReadingQuery, selectedPlotFilter]);

  const filteredCrops = useMemo(() => {
    return CROP_BRIX_DATABASE.filter(c =>
      c.cropName.toLowerCase().includes(searchCropQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchCropQuery.toLowerCase())
    );
  }, [searchCropQuery]);

  return (
    <div className="space-y-6">
      {/* Header Banner: BRIX PRO & Saúde Fisiológica */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-emerald-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
                <Droplets className="w-3 h-3" />
                Brix Agro Pro
              </span>
              <span className="text-emerald-200/80 text-xs font-semibold">• Fisiologia Vegetal & Trofobiose</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-emerald-400" />
              Módulo de Monitoramento de °Brix Foliar
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-3xl">
              Avaliação de saúde fisiológica, atividade fotossintética, imunidade vegetal (Teoria da Trofobiose de Chaboussou), Déficit de Pressão de Vapor (VPD) e mapas de calor de sólidos solúveis por talhão.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenModal}
              className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nova Leitura de Brix
            </button>
          </div>
        </div>

        {/* Global Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 mt-5 pt-4 border-t border-emerald-800/60 text-xs">
          <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300/80 block">Média Geral de °Brix</span>
            <strong className="text-base text-emerald-300 font-black">
              {stats.mean > 0 ? `${stats.mean}° Brix` : '--'}
            </strong>
            <span className="text-[10px] text-emerald-200 block">
              {stats.mean > 0 ? `CV: ${stats.coefficientOfVariation}%` : 'Sem registros'}
            </span>
          </div>

          <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300/80 block">Saúde Fisiológica (ISF)</span>
            <strong className="text-base text-white font-black">
              {avgHealthScore > 0 ? `${avgHealthScore}/100` : '--'}
            </strong>
            <span className="text-[10px] text-emerald-200 block">Índice Ponderado</span>
          </div>

          <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300/80 block">Melhor Talhão</span>
            <strong className="text-sm font-black text-teal-300 block truncate">
              {bestPlot ? bestPlot.plotName : '--'}
            </strong>
            <span className="text-[10px] text-emerald-200 block truncate">
              {bestPlot ? `${bestPlot.currentAvgBrix}° Brix (${bestPlot.cropName})` : 'Nenhum talhão'}
            </span>
          </div>

          <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300/80 block">Talhão de Atenção</span>
            <strong className="text-sm font-black text-rose-300 block truncate">
              {criticalPlot ? criticalPlot.plotName : '--'}
            </strong>
            <span className="text-[10px] text-rose-200 block truncate">
              {criticalPlot ? `${criticalPlot.currentAvgBrix}° Brix` : 'Nenhum talhão'}
            </span>
          </div>

          <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300/80 block">Total de Leituras</span>
            <strong className="text-base text-white font-black">{stats.totalSamples} Amostras</strong>
            <span className="text-[10px] text-emerald-200 block">{plots.length} Talhões Ativos</span>
          </div>

          <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300/80 block">VPD Médio Atual</span>
            <strong className="text-base text-amber-300 font-black">
              {currentReading ? `${currentReading.calculatedVpdKPa} kPa` : '--'}
            </strong>
            <span className="text-[10px] text-emerald-200 block">
              {currentReading ? 'Transpiração Estável' : 'Sem leituras'}
            </span>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between shadow-md animate-fade-in">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-white hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Active Reading Selector Bar */}
      {readings.length > 0 && currentReading ? (
        <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500 dark:text-zinc-400">Amostra em Foco:</span>
            <select
              value={selectedReadingId}
              onChange={e => setSelectedReadingId(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 font-bold text-slate-900 dark:text-white truncate max-w-xs"
            >
              {readings.map(r => (
                <option key={r.id} value={r.id}>
                  {r.sampleCode} - {r.plotName} ({r.brixValue}°Brix • {r.cropName})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-slate-600 dark:text-zinc-400 text-[11px]">
            <span>Data: <strong>{currentReading.date} {currentReading.time}</strong></span>
            <span>Equipamento: <strong>{currentReading.refractometerModel}</strong></span>
            <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded font-black text-[10px]">
              {currentReading.status.toUpperCase()}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-200 font-medium">
            <ClipboardList className="w-4 h-4 text-emerald-600" />
            <span>Nenhuma leitura de °Brix registrada ainda no sistema.</span>
          </div>
          <button
            onClick={handleOpenModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Registrar Primeira Leitura
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. DASHBOARD & ISF (ÍNDICE DE SAÚDE FISIOLÓGICA)          */}
      {/* ========================================================= */}
      {activeSubTab === 'dashboard_isf' && (
        <div className="space-y-6 animate-fade-in">
          {currentReading ? (
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Gauge Column */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border text-center space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Índice de Saúde Fisiológica (ISF)
                  </span>

                  <div className="relative w-36 h-36 rounded-full flex items-center justify-center border-8 border-emerald-500 bg-white dark:bg-black shadow-inner">
                    <div className="text-center">
                      <span className="text-4xl font-black text-slate-900 dark:text-white">
                        {currentReading.physiologicalHealthScore}
                      </span>
                      <span className="text-xs text-slate-400 block font-bold">/ 100</span>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase ${
                        currentReading.physiologicalHealthScore >= 85
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : currentReading.physiologicalHealthScore >= 70
                          ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                          : currentReading.physiologicalHealthScore >= 50
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      Status: {currentReading.status.replace('_', ' ')}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                      Cultura: {currentReading.cropName} ({currentReading.variety}) • Fase: {currentReading.stage.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                {/* Climate & Plant Physical Indicators */}
                <div className="lg:col-span-7 space-y-4 text-xs">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="font-black text-base text-slate-900 dark:text-white">
                      Condições Fisiológicas & Microclima da Leitura
                    </h3>
                    <span className="text-[11px] text-slate-400">Amostra {currentReading.sampleCode}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border">
                      <span className="text-[10px] text-slate-400 block font-bold">°Brix Medido na Folha</span>
                      <strong className="text-base text-emerald-600 font-black">{currentReading.brixValue}° Brix</strong>
                      <span className="text-[10px] text-slate-500 block font-semibold">Meta da Cultura: &gt; 11.0°</span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border">
                      <span className="text-[10px] text-slate-400 block font-bold">Déficit Pressão Vapor (VPD)</span>
                      <strong className="text-base text-amber-600 font-black">{currentReading.calculatedVpdKPa} kPa</strong>
                      <span className="text-[10px] text-emerald-600 block font-semibold">Ideal: 0.8 - 1.4 kPa</span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border">
                      <span className="text-[10px] text-slate-400 block font-bold">Temp. Folha vs. Ar</span>
                      <strong className="text-sm text-slate-900 dark:text-white">
                        {currentReading.leafTemperatureCelsius}°C / {currentReading.ambientTemperatureCelsius}°C
                      </strong>
                      <span className={`text-[10px] block font-semibold ${currentReading.leafTemperatureCelsius <= currentReading.ambientTemperatureCelsius ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {currentReading.leafTemperatureCelsius <= currentReading.ambientTemperatureCelsius ? '✓ Resfriamento Ativo' : '⚠️ Estresse / Estômatos Fechados'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border">
                      <span className="text-[10px] text-slate-400 block font-bold">Umidade Relativa</span>
                      <strong className="text-sm text-slate-900 dark:text-white">{currentReading.relativeHumidityPercent}%</strong>
                      <span className="text-[10px] text-slate-500 block font-semibold">Radiação: {currentReading.solarRadiationWattsM2} W/m²</span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border">
                      <span className="text-[10px] text-slate-400 block font-bold">Resistência Natural a Pragas</span>
                      <strong className={`text-sm font-black ${currentReading.brixValue >= 11 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {currentReading.brixValue >= 11 ? 'Elevada (Trofobiose)' : 'Vulnerável a Sugadores'}
                      </strong>
                      <span className="text-[10px] text-slate-500 block font-semibold">Limiar: 10-12° Brix</span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border">
                      <span className="text-[10px] text-slate-400 block font-bold">Talhão Monitorado</span>
                      <strong className="text-sm text-slate-900 dark:text-white truncate block">{currentReading.plotName}</strong>
                      <span className="text-[10px] text-slate-500 block font-semibold">Planta: {currentReading.plantId}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl">
                    <strong className="font-bold text-emerald-900 dark:text-emerald-300 block mb-1">
                      Parecer Fisiológico da Leitura:
                    </strong>
                    <p className="text-[11px] text-slate-700 dark:text-zinc-300 leading-relaxed">
                      {currentReading.technicalInterpretation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center space-y-4 shadow-2xs">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <Gauge className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Nenhum dado fisiológico registrado
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Cadastre sua primeira leitura de °Brix foliar para calcular automaticamente o Índice de Saúde Fisiológica (ISF), avaliar o déficit de pressão de vapor (VPD) e obter o parecer de trofobiose.
                </p>
              </div>
              <button
                onClick={handleOpenModal}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Registrar Primeira Leitura de °Brix
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. LEITURAS & REFRATÔMETRO FOLIAR                         */}
      {/* ========================================================= */}
      {activeSubTab === 'leituras_refratometro' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar leitura por código, talhão, cultura ou variedade..."
                  value={searchReadingQuery}
                  onChange={e => setSearchReadingQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                />
              </div>

              <select
                value={selectedPlotFilter}
                onChange={e => setSelectedPlotFilter(e.target.value)}
                className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-bold"
              >
                <option value="todos">Todos os Talhões</option>
                {plots.map(p => (
                  <option key={p.plotId} value={p.plotId}>{p.plotName}</option>
                ))}
              </select>

              <button
                onClick={handleOpenModal}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Nova Leitura
              </button>
            </div>

            {filteredReadings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredReadings.map(r => {
                  const isSelected = r.id === selectedReadingId;

                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedReadingId(r.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 relative group ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs'
                          : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-sm font-bold text-slate-900 dark:text-white">{r.sampleCode}</strong>
                            <span className="text-[10px] text-slate-400 font-mono">({r.date} {r.time})</span>
                          </div>
                          <span className="text-xs text-slate-600 dark:text-zinc-400 block mt-0.5">
                            {r.plotName} • {r.cropName} ({r.variety})
                          </span>
                        </div>

                        <div className="flex items-start gap-2">
                          <div className="text-right">
                            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                              {r.brixValue}° Brix
                            </span>
                            <span className="text-[9px] uppercase font-bold block text-slate-400">
                              ISF {r.physiologicalHealthScore}/100
                            </span>
                          </div>

                          <button
                            onClick={e => handleDeleteReading(r.id, e)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                            title="Excluir leitura"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-center text-xs py-2 bg-slate-50 dark:bg-zinc-900 rounded-lg">
                        <div>
                          <span className="text-[9px] text-slate-400 block">Fase</span>
                          <strong className="text-slate-800 dark:text-zinc-200 capitalize text-[10px] truncate block">
                            {r.stage.replace('_', ' ')}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block">VPD</span>
                          <strong className="text-slate-800 dark:text-zinc-200">{r.calculatedVpdKPa} kPa</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block">T. Folha</span>
                          <strong className="text-slate-800 dark:text-zinc-200">{r.leafTemperatureCelsius}°C</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block">Status</span>
                          <strong className="text-emerald-600 dark:text-emerald-400 uppercase text-[10px]">
                            {r.status.replace('_', ' ')}
                          </strong>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs text-slate-500 dark:text-zinc-400 pt-1">
                        <span className="truncate max-w-[200px]">Operador: {r.operatorName}</span>
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          Ver Detalhes <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed rounded-xl space-y-2">
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Nenhuma leitura encontrada com os filtros selecionados.
                </p>
                <button
                  onClick={handleOpenModal}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-500 underline cursor-pointer"
                >
                  Cadastrar nova leitura agora
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. MAPA DE CALOR DOS TALHÕES                              */}
      {/* ========================================================= */}
      {activeSubTab === 'mapa_calor_talhoes' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 gap-2">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-600" />
                  Mapa de Calor & Distribuição Espacial de °Brix por Talhão
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Visualização da distribuição de sólidos solúveis nas diferentes áreas da fazenda.
                </p>
              </div>

              <button
                onClick={handleOpenModal}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Registrar no Talhão
              </button>
            </div>

            {plots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plots.map(p => {
                  const isOptimal = p.currentAvgBrix >= p.targetBrix;
                  return (
                    <div
                      key={p.plotId}
                      className={`p-5 rounded-2xl border space-y-3 ${
                        p.healthStatus === 'muito_alto'
                          ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800'
                          : p.healthStatus === 'alto'
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                          : p.healthStatus === 'medio'
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                          : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">{p.plotName}</h4>
                          <span className="text-xs text-slate-600 dark:text-zinc-400">
                            {p.cropName} • Área: {p.areaHa} ha • {p.totalReadings} leituras
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-xl font-black text-slate-900 dark:text-white">
                            {p.currentAvgBrix}° Brix
                          </span>
                          <span className="text-[10px] text-slate-500 block font-bold">
                            Meta: {p.targetBrix}° Brix
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar of Brix vs Target */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span>Atingimento da Meta Fisiológica:</span>
                          <span className={isOptimal ? 'text-emerald-600' : 'text-rose-600'}>
                            {p.targetBrix > 0 ? Math.round((p.currentAvgBrix / p.targetBrix) * 100) : 100}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isOptimal ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            style={{
                              width: `${Math.min(100, p.targetBrix > 0 ? (p.currentAvgBrix / p.targetBrix) * 100 : 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200/60 dark:border-zinc-800">
                        <span className="text-[11px] text-slate-500">Última leitura: {p.lastReadingDate}</span>
                        <span className="font-bold flex items-center gap-1 text-[11px]">
                          Tendência:{' '}
                          {p.trend === 'subindo' ? (
                            <span className="text-emerald-600 flex items-center gap-0.5">
                              <TrendingUp className="w-3 h-3" /> Subindo
                            </span>
                          ) : (
                            <span className="text-rose-600 flex items-center gap-0.5">
                              <TrendingDown className="w-3 h-3" /> Caindo
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed rounded-xl space-y-2">
                <MapPin className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Nenhum talhão monitorado ainda.
                </p>
                <button
                  onClick={handleOpenModal}
                  className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs cursor-pointer inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Cadastrar Primeira Leitura de Talhão
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. BANCO DE CULTURAS (21 CULTURAS)                        */}
      {/* ========================================================= */}
      {activeSubTab === 'banco_culturas' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar cultura agrícola por nome ou categoria..."
                  value={searchCropQuery}
                  onChange={e => setSearchCropQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Cultura</th>
                    <th className="py-2.5 px-3">Categoria</th>
                    <th className="py-2.5 px-3">Faixa Ideal (°Brix)</th>
                    <th className="py-2.5 px-3">Limiar Trofobiose</th>
                    <th className="py-2.5 px-3">Frutificação/Enchimento</th>
                    <th className="py-2.5 px-3">Diretriz de Manejo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {filteredCrops.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/40">
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{c.cropName}</td>
                      <td className="py-2.5 px-3 capitalize text-slate-500">{c.category.replace('_', ' ')}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-600">{c.idealBrixMin}° - {c.idealBrixMax}°</td>
                      <td className="py-2.5 px-3 font-bold text-teal-600">&gt; {c.pestsResistanceThresholdBrix}° Brix</td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">
                        {c.stageThresholds.frutificacao_enchimento.ideal}° (Mín {c.stageThresholds.frutificacao_enchimento.min}°)
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-xs truncate">{c.recommendations}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. INTELIGÊNCIA AGRONÔMICA & TROFOBIOSE                   */}
      {/* ========================================================= */}
      {activeSubTab === 'inteligencia_trofobiose' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
              <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                Fundamentação Fisiológica & Imunidade Vegetal
              </span>
              <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2 mt-1">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                Teoria da Trofobiose de Francis Chaboussou & Brix Foliar
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl space-y-2">
                <strong className="font-bold text-emerald-900 dark:text-emerald-300 block flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Alta Fotossíntese & Proteossíntese Completa (°Brix &gt; 12°):
                </strong>
                <p className="text-[11px] text-slate-700 dark:text-zinc-300 leading-relaxed">
                  Quando a planta atinge altos teores de °Brix, os açúcares simples e aminoácidos livres são rapidamente convertidos em carboidratos complexos e proteínas completas. Insetos sugadores (pulgões, mosca-branca, ácaros e tripes) possuem aparelho digestivo rudimentar e não conseguem digerir seiva com alta pressão osmótica e ausência de aminoácidos livres.
                </p>
              </div>

              <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl space-y-2">
                <strong className="font-bold text-rose-900 dark:text-rose-300 block flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Proteólise & Estresse Fisiológico (°Brix &lt; 8°):
                </strong>
                <p className="text-[11px] text-slate-700 dark:text-zinc-300 leading-relaxed">
                  Sob estresse (hídrico, excesso de N solúvel, deficiência de Potássio ou Boro), ocorre acúmulo de aminoácidos livres e glicose redutora no vacúolo foliar. Isso atua como potente atrativo nutricional para pragas e fungos patogênicos.
                </p>
              </div>
            </div>

            {/* Nutritional & VPD Triad */}
            <div className="space-y-3">
              <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                Tríade de Manejo para Elevação do °Brix Foliar:
              </strong>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-xl border space-y-1">
                  <strong className="font-bold text-emerald-600 block">1. Nutrição Potássica & Boro</strong>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                    O Potássio (K⁺) ativa a enzima sintase de amido e regula os estômatos; o Boro (B) forma complexos borato-açúcar que aceleram a translocação floemática para frutos e grãos.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-xl border space-y-1">
                  <strong className="font-bold text-teal-600 block">2. Magnésio & Fotossíntese</strong>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                    O Magnésio (Mg²⁺) é o átomo central da clorofila e ativador da Rubisco. Aumenta a captação de fótons e a taxa fotossintética líquida.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-xl border space-y-1">
                  <strong className="font-bold text-cyan-600 block">3. Equilíbrio de VPD (0.8 - 1.4 kPa)</strong>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                    Manter o VPD na faixa ótima garante transpiração sem estresse e fluxo ininterrupto de água e nutrientes do solo até a copa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. ESTATÍSTICAS & VARIABILIDADE                           */}
      {/* ========================================================= */}
      {activeSubTab === 'estatisticas_variabilidade' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-5">
            <div className="border-b pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                Inteligência Estatística das Leituras de Brix
              </h3>
            </div>

            {readings.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-bold">Média Amostral</span>
                  <strong className="text-base text-slate-900 dark:text-white">{stats.mean}° Brix</strong>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-bold">Mediana</span>
                  <strong className="text-base text-slate-900 dark:text-white">{stats.median}° Brix</strong>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-bold">Desvio Padrão</span>
                  <strong className="text-base text-slate-900 dark:text-white">± {stats.stdDev}° Brix</strong>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-bold">Coeficiente de Variação (CV)</span>
                  <strong className="text-base text-emerald-600 font-black">{stats.coefficientOfVariation}%</strong>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed rounded-xl space-y-2">
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Sem dados estatísticos suficientes. Registre amostras para calcular média, mediana, desvio padrão e CV%.
                </p>
                <button
                  onClick={handleOpenModal}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-500 underline cursor-pointer"
                >
                  Cadastrar primeira leitura
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. LAUDO OFICIAL DE BRIX FOLIAR                           */}
      {/* ========================================================= */}
      {activeSubTab === 'laudo_oficial' && (
        <div className="space-y-6 animate-fade-in">
          {currentReading ? (
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-zinc-800 pb-5 gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                    Documento Fisiológico Oficial • Brix Agro Pro
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    Laudo Técnico de °Brix Foliar & Saúde da Lavoura
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">Código da Amostra: {currentReading.sampleCode}</span>
                </div>

                <button
                  onClick={() => window.print()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Laudo Oficial
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Propriedade / Fazenda</span>
                  <strong className="text-slate-900 dark:text-white">{currentReading.propertyName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Talhão & Cultura</span>
                  <strong className="text-slate-900 dark:text-white">{currentReading.plotName} ({currentReading.cropName})</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Data & Hora da Leitura</span>
                  <strong className="text-slate-900 dark:text-white">{currentReading.date} às {currentReading.time}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Responsável Técnico</span>
                  <strong className="text-slate-900 dark:text-white">{currentReading.operatorName}</strong>
                </div>
              </div>

              <div className="space-y-2">
                <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                  Resultados Fisiológicos da Amostra:
                </strong>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 border rounded-lg">
                    <span className="text-[10px] text-slate-400 block">°Brix Foliar Medido</span>
                    <strong className="text-base text-emerald-600 font-black">{currentReading.brixValue}° Brix</strong>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Déficit Pressão Vapor (VPD)</span>
                    <strong className="text-sm">{currentReading.calculatedVpdKPa} kPa</strong>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Status Fisiológico</span>
                    <strong className="text-sm uppercase">{currentReading.status.replace('_', ' ')}</strong>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Índice ISF</span>
                    <strong className="text-base text-emerald-600 font-black">{currentReading.physiologicalHealthScore}/100</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border space-y-2 text-xs">
                <strong className="font-bold text-slate-900 dark:text-white block">
                  Interpretação Agronômica & Diretrizes:
                </strong>
                <p className="text-[11px] text-slate-700 dark:text-zinc-300 leading-relaxed">
                  {currentReading.technicalInterpretation}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed rounded-2xl bg-white dark:bg-black space-y-3">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Nenhum laudo disponível
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Registre uma leitura de °Brix para gerar e imprimir o Laudo Técnico Oficial.
              </p>
              <button
                onClick={handleOpenModal}
                className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Nova Leitura
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: NOVA LEITURA DE BRIX                               */}
      {/* ========================================================= */}
      {isNewReadingModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Registrar Nova Leitura de °Brix</h3>
              <button onClick={() => setIsNewReadingModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold">Propriedade / Fazenda:</label>
                  <input
                    type="text"
                    placeholder="Ex: Fazenda Santa Maria"
                    value={newPropertyName}
                    onChange={e => setNewPropertyName(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold">Cultura Agrícola:</label>
                  <select
                    value={newCropName}
                    onChange={e => setNewCropName(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-lg font-bold text-xs"
                  >
                    {CROP_BRIX_DATABASE.map(c => (
                      <option key={c.cropName} value={c.cropName}>{c.cropName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Plot Selection or Creation */}
              <div className="space-y-2 p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border">
                <div className="flex items-center justify-between">
                  <label className="font-bold">Talhão / Área:</label>
                  {plots.length > 0 && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setNewPlotMode('select')}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${newPlotMode === 'select' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'}`}
                      >
                        Selecionar Existente
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewPlotMode('custom')}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${newPlotMode === 'custom' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'}`}
                      >
                        Novo Talhão
                      </button>
                    </div>
                  )}
                </div>

                {newPlotMode === 'select' && plots.length > 0 ? (
                  <select
                    value={newPlotId}
                    onChange={e => setNewPlotId(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-zinc-800 border rounded-lg font-bold text-xs"
                  >
                    {plots.map(p => (
                      <option key={p.plotId} value={p.plotId}>{p.plotName} ({p.cropName})</option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nome do talhão (ex: Talhão 01)"
                      value={newCustomPlotName}
                      onChange={e => setNewCustomPlotName(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-zinc-800 border rounded-lg text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Área (ha)"
                      value={newPlotArea}
                      onChange={e => setNewPlotArea(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-zinc-800 border rounded-lg text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold">Variedade / Cultivar:</label>
                  <input
                    type="text"
                    placeholder="Ex: TMG 2381 IPRO"
                    value={newVariety}
                    onChange={e => setNewVariety(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold">Fase Fenológica:</label>
                  <select
                    value={newStage}
                    onChange={e => setNewStage(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-lg font-bold text-xs"
                  >
                    <option value="emergencia">Emergência</option>
                    <option value="vegetativo">Vegetativo</option>
                    <option value="florescimento">Florescimento</option>
                    <option value="frutificacao_enchimento">Frutificação / Enchimento</option>
                    <option value="maturacao_colheita">Maturação / Colheita</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-emerald-700 dark:text-emerald-400">°Brix Medido (*):</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 12.5"
                    value={newBrixValue}
                    onChange={e => setNewBrixValue(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border-2 border-emerald-500 rounded-lg font-black text-emerald-600 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold">Temp. Folha (°C):</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Ex: 25.0"
                    value={newLeafTemp}
                    onChange={e => setNewLeafTemp(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold">Temp. Ar (°C):</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Ex: 26.5"
                    value={newAirTemp}
                    onChange={e => setNewAirTemp(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold">Umidade Relativa (%):</label>
                  <input
                    type="number"
                    placeholder="Ex: 60"
                    value={newHumidity}
                    onChange={e => setNewHumidity(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold">Radiação Solar (W/m²):</label>
                  <input
                    type="number"
                    placeholder="Ex: 800"
                    value={newSolarRad}
                    onChange={e => setNewSolarRad(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold">Identificação da Planta / Ponto:</label>
                  <input
                    type="text"
                    placeholder="Ex: Ponto 01 - Linha 4"
                    value={newPlantId}
                    onChange={e => setNewPlantId(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold">Refratômetro Utilizado:</label>
                  <input
                    type="text"
                    placeholder="Ex: Atago PAL-1 Óptico Digital"
                    value={newRefractometer}
                    onChange={e => setNewRefractometer(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold">Responsável Técnico / Operador:</label>
                <input
                  type="text"
                  placeholder="Nome do agrônomo ou técnico"
                  value={newOperator}
                  onChange={e => setNewOperator(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold">Observações Técnicas / Manejo:</label>
                <input
                  type="text"
                  placeholder="Ex: Amostragem na 3ª folha trifoliolada superior"
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setIsNewReadingModalOpen(false)}
                className="px-3 py-2 border rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateReading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer"
              >
                Salvar & Avaliar Fisiologia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
