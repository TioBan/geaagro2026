import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Droplets,
  Thermometer,
  Sprout,
  TrendingDown,
  Info,
  Zap,
  Sliders,
} from 'lucide-react';
import { Farm } from '../types/agronomy';
import { CropDigitalTwin } from '../types/phenology';
import { initialCropDigitalTwins, SOJA_PHENOLOGICAL_STAGES } from '../data/phenologyData';
import { daily15ForecastData } from '../data/weatherData';

interface ClimateAlertWidgetProps {
  farm: Farm;
  onNavigatePhenology?: () => void;
}

export const ClimateAlertWidget: React.FC<ClimateAlertWidgetProps> = ({ farm, onNavigatePhenology }) => {
  // Only load digital twins that were explicitly configured by the user in Fenologia
  const [persistedTwins, setPersistedTwins] = useState<CropDigitalTwin[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('agronutri_digital_twins');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.error('Error loading digital twins', e);
      }
    }
    return [];
  });

  // Keep in sync with user changes across the application
  React.useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('agronutri_digital_twins');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setPersistedTwins(parsed);
        } else {
          setPersistedTwins([]);
        }
      } catch {
        setPersistedTwins([]);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Filter twins for this specific farm only - DO NOT fabricate fake twins with hardcoded stages
  const farmTwins = useMemo<CropDigitalTwin[]>(() => {
    if (!farm || !farm.id) return [];
    return persistedTwins.filter(t => t.farmId === farm.id || farm.plots?.some(p => p.id === t.plotId));
  }, [farm, persistedTwins]);

  // Let the user select which plot/twin to inspect
  const [selectedTwinId, setSelectedTwinId] = useState<string>('');

  // Sync selectedTwinId when farmTwins changes
  React.useEffect(() => {
    if (farmTwins && farmTwins.length > 0) {
      const exists = farmTwins.some(t => t?.id === selectedTwinId);
      if (!exists && farmTwins[0]?.id) {
        setSelectedTwinId(farmTwins[0].id);
      }
    } else {
      setSelectedTwinId('');
    }
  }, [farmTwins, selectedTwinId]);

  // Simulator states - start at 0 days without rain (NO pre-filled artificial drought)
  const [manualDaysWithoutRain, setManualDaysWithoutRain] = useState<number>(0);
  const [isIrrigatedOverride, setIsIrrigatedOverride] = useState<boolean>(false);

  const selectedTwin = useMemo(() => {
    if (farmTwins.length === 0) return undefined;
    return farmTwins.find(t => t?.id === selectedTwinId) || farmTwins[0] || undefined;
  }, [farmTwins, selectedTwinId]);

  // Find the exact phenological details for the current stage (matching codes like 'R1', 'V4', etc.)
  const stageDetails = useMemo(() => {
    if (!selectedTwin) return null;
    const stageCode = selectedTwin.currentStageCode;
    return SOJA_PHENOLOGICAL_STAGES.find(s => s.code === stageCode) || SOJA_PHENOLOGICAL_STAGES[4]; // default to R1 if not found
  }, [selectedTwin]);

  // Calculate risks dynamically based on weather forecast and crop sensitivity
  const riskAnalysis = useMemo(() => {
    // 1. Calculate rain forecast in next 5 days from daily15ForecastData
    const next5DaysForecast = daily15ForecastData.slice(0, 5);
    const totalRainMmForecast = next5DaysForecast.reduce((acc, d) => acc + d.rainExpectedMm, 0);
    const maxTempForecast = Math.max(...next5DaysForecast.map(d => d.tempMaxC));

    if (!selectedTwin || !stageDetails) {
      return {
        totalRainMmForecast: Number(totalRainMmForecast.toFixed(1)),
        maxTempForecast,
        sensitivity: 'alta',
        avgDailyNeed: 4.8,
        waterDeficitMm: 0,
        riskScore: 0,
        riskLevel: 'low' as const,
        isIrrigating: false,
        hasIrrigationEquipment: false,
        effectiveDaysDry: 0
      };
    }

    // 2. Crop Water Sensitivity
    const sensitivity = stageDetails.waterDemand.waterStressSensitivity; // 'baixa' | 'moderada' | 'alta' | 'critica maxima'
    const cropType = selectedTwin.cropName; // e.g. 'Soja'
    const dailyNeed = stageDetails.waterDemand.dailyConsumptionMm; // e.g. [4.0, 5.5] mm/dia
    const avgDailyNeed = (dailyNeed[0] + dailyNeed[1]) / 2;

    // 3. Determine Soil Moisture Deficit
    // For every day without rain, soil water deficit increases by daily crop consumption
    const isIrrigating = isIrrigatedOverride;
    const effectiveDaysDry = isIrrigating ? 0 : manualDaysWithoutRain;
    const waterDeficitMm = effectiveDaysDry * avgDailyNeed;

    // 4. Calculate Risk Score (0 to 100)
    let riskScore = 0;
    let riskLevel: 'low' | 'moderate' | 'high' | 'critical' = 'low';

    // Base risk from water deficit
    if (waterDeficitMm > 35) riskScore += 45;
    else if (waterDeficitMm > 20) riskScore += 25;
    else if (waterDeficitMm > 10) riskScore += 10;

    // Add risk from temperature & drought forecast
    if (maxTempForecast >= 34) riskScore += 25;
    else if (maxTempForecast >= 31) riskScore += 15;

    if (totalRainMmForecast < 3) riskScore += 20;
    else if (totalRainMmForecast < 10) riskScore += 10;

    // Weight by stage sensitivity
    if (sensitivity === 'critica maxima') riskScore *= 1.3;
    else if (sensitivity === 'alta') riskScore *= 1.15;
    else if (sensitivity === 'baixa') riskScore *= 0.8;

    riskScore = Math.min(100, Math.max(0, Number(riskScore.toFixed(0))));

    // Categorize
    if (riskScore >= 75) riskLevel = 'critical';
    else if (riskScore >= 50) riskLevel = 'high';
    else if (riskScore >= 25) riskLevel = 'moderate';

    return {
      totalRainMmForecast: Number(totalRainMmForecast.toFixed(1)),
      maxTempForecast,
      sensitivity,
      avgDailyNeed,
      waterDeficitMm: Number(waterDeficitMm.toFixed(1)),
      riskScore,
      riskLevel,
      isIrrigating,
      hasIrrigationEquipment: selectedTwin?.irrigationType === 'pivo_central' || selectedTwin?.irrigationType === 'gotejamento',
      effectiveDaysDry
    };
  }, [selectedTwin, stageDetails, manualDaysWithoutRain, isIrrigatedOverride]);

  if (!selectedTwin) {
    return (
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 p-8 flex flex-col items-center text-center space-y-4 shadow-2xs">
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-full text-emerald-600 dark:text-emerald-400">
          <Sprout className="w-10 h-10 animate-pulse" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Sistema de Alerta Agroclimático & Fenologia
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md leading-relaxed">
          Nenhum Gêmeo Digital ativo para esta fazenda. Ative ou cadastre um talhão na aba <strong>Fenologia</strong> para sincronizar e projetar riscos agroclimáticos em tempo real.
        </p>
        {onNavigatePhenology && (
          <button
            onClick={onNavigatePhenology}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sprout className="w-4 h-4" />
            <span>Configurar Lavoura em Fenologia</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-100 dark:border-rose-900/50">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base flex items-center gap-2">
                Sistema de Alerta Agroclimático & Fenologia
                <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 uppercase tracking-widest animate-pulse">
                  Tempo Real
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Cruzamento inteligente de previsão do tempo (IoT) com as fases críticas de consumo hídrico das lavouras
              </p>
            </div>
          </div>
        </div>

        {/* Selection Dropdown */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5">
            <Sprout className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 dark:text-zinc-400 font-medium">Lavouras:</span>
            <select
              value={selectedTwinId}
              onChange={(e) => setSelectedTwinId(e.target.value)}
              className="bg-transparent font-bold text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
            >
              {farmTwins.filter(Boolean).map(t => (
                <option key={t?.id || Math.random()} value={t?.id || ''} className="bg-white dark:bg-zinc-900">
                  {t?.plotName || 'Talhão'} ({t?.cropName || 'Cultura'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Alert Banner & Interactive Simulator */}
      {!selectedTwin ? (
        <div className="p-8 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl text-center text-slate-400 dark:text-zinc-500">
          <Sprout className="w-10 h-10 mx-auto text-emerald-500/60 mb-2" />
          <h4 className="font-bold text-sm text-slate-700 dark:text-zinc-300">Nenhum talhão com cultura cadastrado</h4>
          <p className="text-xs max-w-sm mx-auto mt-1 text-slate-400 dark:text-zinc-500">
            Cadastre os talhões da propriedade com suas respectivas culturas no módulo de Cadastros para ativar o monitoramento agroclimático em tempo real.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Side: Dynamic Status Banner */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Risk Level Badge and Summary */}
          <div className={`p-5 rounded-xl border flex flex-col sm:flex-row items-start gap-4 transition-all ${
            riskAnalysis.riskLevel === 'critical'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-100'
              : riskAnalysis.riskLevel === 'high'
              ? 'bg-orange-500/10 border-orange-500/30 text-orange-950 dark:text-orange-100'
              : riskAnalysis.riskLevel === 'moderate'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100'
          }`}>
            <div className={`p-3 rounded-lg shrink-0 ${
              riskAnalysis.riskLevel === 'critical' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400' :
              riskAnalysis.riskLevel === 'high' ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' :
              riskAnalysis.riskLevel === 'moderate' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' :
              'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            }`}>
              <AlertTriangle className="w-8 h-8 shrink-0" />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  riskAnalysis.riskLevel === 'critical' ? 'bg-rose-500/20 border-rose-500/40 text-rose-600 dark:text-rose-400' :
                  riskAnalysis.riskLevel === 'high' ? 'bg-orange-500/20 border-orange-500/40 text-orange-600 dark:text-orange-400' :
                  riskAnalysis.riskLevel === 'moderate' ? 'bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-400' :
                  'bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                }`}>
                  Risco {riskAnalysis.riskLevel === 'critical' ? 'Crítico 🚨' :
                         riskAnalysis.riskLevel === 'high' ? 'Alto ⚠️' :
                         riskAnalysis.riskLevel === 'moderate' ? 'Moderado ⚡' :
                         'Baixo (Seguro) ✅'}
                </span>
                <span className="text-xs text-slate-400">• Índice de estresse: {riskAnalysis.riskScore}%</span>
              </div>

              <h4 className="font-extrabold text-sm sm:text-base leading-snug">
                {riskAnalysis.riskLevel === 'critical' && `Alerta de Estresse Hídrico Severo no Florescimento (${selectedTwin.currentStageCode})`}
                {riskAnalysis.riskLevel === 'high' && `Risco Elevado de Estresse no Estágio ${selectedTwin.currentStageCode}`}
                {riskAnalysis.riskLevel === 'moderate' && `Estresse Hídrico Moderado sob Acompanhamento`}
                {riskAnalysis.riskLevel === 'low' && `Balanço Hídrico Estável na Lavoura`}
              </h4>

              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                A lavoura de <strong className="font-black">{selectedTwin.cropName} ({selectedTwin.cultivarName})</strong> no <strong className="font-semibold">{selectedTwin.plotName}</strong> está atualmente no estágio <strong className="text-indigo-600 dark:text-indigo-400">{selectedTwin.currentStageCode} - {selectedTwin.currentStageName}</strong>. 
                Nesta etapa fenológica, a sensibilidade hídrica celular é classificada como <strong className="text-rose-500 uppercase">{stageDetails.waterDemand.waterStressSensitivity}</strong> devido ao altíssimo consumo diário de evapotranspiração de <strong className="font-bold text-slate-800 dark:text-slate-100">{stageDetails.waterDemand.kc} Kc ({stageDetails.waterDemand.dailyConsumptionMm[0]}-{stageDetails.waterDemand.dailyConsumptionMm[1]} mm/dia)</strong>.
              </p>
            </div>
          </div>

          {/* Environmental parameters details row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-zinc-900/80 rounded-xl border border-slate-100 dark:border-zinc-800/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 font-bold">
                <Thermometer className="w-4 h-4 text-rose-500" />
                <span>Temperatura Pico</span>
              </div>
              <span className="text-xl font-black text-slate-900 dark:text-zinc-50 block">
                {riskAnalysis.maxTempForecast.toFixed(1)} °C
              </span>
              <p className="text-[10px] text-slate-400 leading-none">Previsão máxima nos próximos 5 dias</p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-zinc-900/80 rounded-xl border border-slate-100 dark:border-zinc-800/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 font-bold">
                <Droplets className="w-4 h-4 text-sky-500" />
                <span>Precipitação Estimada</span>
              </div>
              <span className="text-xl font-black text-slate-900 dark:text-zinc-50 block">
                {riskAnalysis.totalRainMmForecast} mm
              </span>
              <p className="text-[10px] text-slate-400 leading-none">Previsão acumulada para 5 dias</p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-zinc-900/80 rounded-xl border border-slate-100 dark:border-zinc-800/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 font-bold">
                <TrendingDown className="w-4 h-4 text-amber-500" />
                <span>Déficit de Água</span>
              </div>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400 block">
                -{riskAnalysis.waterDeficitMm} mm
              </span>
              <p className="text-[10px] text-slate-400 leading-none">Déficit acumulado no perfil do solo</p>
            </div>
          </div>

          {/* Action Recommendations Card */}
          <div className="p-4 bg-slate-900 dark:bg-zinc-900/40 text-white rounded-xl border border-slate-800 dark:border-zinc-800/80 space-y-3">
            <h5 className="font-black text-xs text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <Zap className="w-4 h-4 shrink-0" /> Recomendações Críticas de Manejo (Mitigação)
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1 bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                <span className="font-extrabold text-slate-200 block">1. Manejo da Irrigação</span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {riskAnalysis.isIrrigating 
                    ? `Irrigação de reposição ativa (${selectedTwin.irrigationType === 'gotejamento' ? 'Gotejamento' : 'Pivô Central'}). Aplicar lâmina diária de ${(riskAnalysis.avgDailyNeed * 0.95).toFixed(1)} mm durante as horas frescas (noite/madrugada) para minimizar perda por deriva e evaporação.`
                    : `Déficit hídrico acumulado de -${riskAnalysis.waterDeficitMm} mm. ${riskAnalysis.hasIrrigationEquipment ? `Recomenda-se acionar o sistema de ${selectedTwin.irrigationType === 'gotejamento' ? 'gotejamento' : 'pivô'} imediatamente com lâmina de salvação.` : 'Cultura sob regime de sequeiro. Recomenda-se aplicação foliar de osmoprotetores e monitoramento rigoroso.'}`}
                </p>
              </div>
              <div className="space-y-1 bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                <span className="font-extrabold text-slate-200 block">2. Proteção Fisiológica Foliar</span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Aplicar defensivos combinados com bioestimulantes osmoprotetores (Aminoácidos livres como Prolina e Glicina-Betaina, ou Extrato de Algas) para induzir fechamento estomático controlado.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Interactive Weather-Phenology Simulator Panel */}
        <div className="lg:col-span-4 p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-5">
          <div className="space-y-1 pb-2 border-b border-slate-200 dark:border-zinc-800">
            <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-xs flex items-center gap-1">
              <Sliders className="w-4 h-4 text-indigo-500" />
              Simulador de Estresse
            </h4>
            <p className="text-[11px] text-slate-500">
              Simule o comportamento da planta alterando as condições de seca e água:
            </p>
          </div>

          {/* Simulator input 1: Days without rain */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-zinc-400 font-semibold">Período Sem Chuva / Irrigação:</span>
              <span className="font-black text-indigo-600 dark:text-indigo-400">{manualDaysWithoutRain} dias</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={manualDaysWithoutRain}
              onChange={(e) => setManualDaysWithoutRain(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              disabled={isIrrigatedOverride}
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
              <span>0 dias (Chuva)</span>
              <span>10 dias (Seca)</span>
              <span>20 dias (Severo)</span>
            </div>
          </div>

          {/* Simulator input 2: Irrigation Switch */}
          <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs">
            <div>
              <span className="font-extrabold text-slate-800 dark:text-zinc-200 block">
                {selectedTwin.irrigationType === 'pivo_central' ? 'Ativar Irrigação (Pivô)' : 
                 selectedTwin.irrigationType === 'gotejamento' ? 'Ativar Irrigação (Gotejamento)' : 
                 'Ativar Irrigação Emergencial'}
              </span>
              <span className="text-[10px] text-slate-400">
                {selectedTwin.irrigationType === 'pivo_central' ? 'Zera o estresse na área do pivô' : 
                 selectedTwin.irrigationType === 'gotejamento' ? 'Zera o estresse na área do gotejamento' : 
                 'Simula acionamento de aspersão móvel'}
              </span>
            </div>
            <button
              onClick={() => setIsIrrigatedOverride(!isIrrigatedOverride)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-all shrink-0 ${
                isIrrigatedOverride ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-zinc-800 justify-start'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white shadow-md"></span>
            </button>
          </div>

          {/* Sensitivity details of this Crop stage */}
          <div className="p-3.5 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-lg border border-indigo-100/60 dark:border-indigo-900/40 text-xs space-y-2.5">
            <span className="font-extrabold text-indigo-900 dark:text-indigo-400 flex items-center gap-1 uppercase tracking-wider text-[10px]">
              <Info className="w-4 h-4" /> Sensibilidade da Fase {selectedTwin.currentStageCode}
            </span>
            <div className="space-y-1.5 leading-relaxed text-slate-600 dark:text-zinc-400 text-[11px]">
              <p>
                <strong>Atividade da Planta:</strong> {stageDetails.description}
              </p>
              <div className="pt-1.5 border-t border-indigo-100/50 dark:border-indigo-900/30 flex justify-between text-[10px]">
                <span>Coeficiente de Cultura (Kc):</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">{stageDetails.waterDemand.kc}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Demanda Diária de Água:</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">
                  {stageDetails.waterDemand.dailyConsumptionMm[0]}-{stageDetails.waterDemand.dailyConsumptionMm[1]} mm
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    )}

  </div>
);
};

export default ClimateAlertWidget;
