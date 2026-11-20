import React, { useState, useMemo, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Thermometer,
  Sprout,
  TrendingDown,
  Info,
  Sliders,
} from 'lucide-react';
import { Farm } from '../types/agronomy';
import { CropDigitalTwin } from '../types/phenology';
import { SOJA_PHENOLOGICAL_STAGES } from '../data/phenologyData';
import { daily15ForecastData } from '../data/weatherData';

interface ClimateAlertWidgetProps {
  farm: Farm;
  onNavigatePhenology?: () => void;
}

const loadStoredTwins = (): CropDigitalTwin[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('agronutri_digital_twins');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error loading digital twins', e);
  }
  return [];
};

export const ClimateAlertWidget: React.FC<ClimateAlertWidgetProps> = ({
  farm,
  onNavigatePhenology,
}) => {
  const [persistedTwins, setPersistedTwins] = useState<CropDigitalTwin[]>(loadStoredTwins);

  useEffect(() => {
    const handleStorage = () => setPersistedTwins(loadStoredTwins());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const farmTwins = useMemo<CropDigitalTwin[]>(() => {
    if (!farm || !farm.id) return [];
    return persistedTwins.filter(
      t => t.farmId === farm.id || farm.plots?.some(p => p.id === t.plotId)
    );
  }, [farm, persistedTwins]);

  const [selectedTwinId, setSelectedTwinId] = useState<string>('');

  useEffect(() => {
    if (farmTwins.length > 0) {
      const exists = farmTwins.some(t => t?.id === selectedTwinId);
      if (!exists && farmTwins[0]?.id) {
        setSelectedTwinId(farmTwins[0].id);
      }
    } else {
      setSelectedTwinId('');
    }
  }, [farmTwins, selectedTwinId]);

  const [manualDaysWithoutRain, setManualDaysWithoutRain] = useState<number>(0);
  const [isIrrigatedOverride, setIsIrrigatedOverride] = useState<boolean>(false);

  const selectedTwin = useMemo(() => {
    if (farmTwins.length === 0) return undefined;
    return farmTwins.find(t => t?.id === selectedTwinId) || farmTwins[0] || undefined;
  }, [farmTwins, selectedTwinId]);

  const stageDetails = useMemo(() => {
    if (!selectedTwin) return null;
    const stageCode = selectedTwin.currentStageCode;
    return (
      SOJA_PHENOLOGICAL_STAGES.find(s => s.code === stageCode) || SOJA_PHENOLOGICAL_STAGES[4]
    );
  }, [selectedTwin]);

  const riskAnalysis = useMemo(() => {
    const next5DaysForecast = daily15ForecastData.slice(0, 5);
    const totalRainMmForecast = next5DaysForecast.reduce((acc, d) => acc + d.rainExpectedMm, 0);
    const maxTempForecast =
      next5DaysForecast.length > 0 ? Math.max(...next5DaysForecast.map(d => d.tempMaxC)) : 0;

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
        effectiveDaysDry: 0,
      };
    }

    const sensitivity = stageDetails.waterDemand.waterStressSensitivity;
    const dailyNeed = stageDetails.waterDemand.dailyConsumptionMm;
    const avgDailyNeed = (dailyNeed[0] + dailyNeed[1]) / 2;

    const isIrrigating = isIrrigatedOverride;
    const effectiveDaysDry = isIrrigating ? 0 : manualDaysWithoutRain;
    const waterDeficitMm = effectiveDaysDry * avgDailyNeed;

    let riskScore = 0;
    let riskLevel: 'low' | 'moderate' | 'high' | 'critical' = 'low';

    if (waterDeficitMm > 35) riskScore += 45;
    else if (waterDeficitMm > 20) riskScore += 25;
    else if (waterDeficitMm > 10) riskScore += 10;

    if (maxTempForecast >= 34) riskScore += 25;
    else if (maxTempForecast >= 31) riskScore += 15;

    if (totalRainMmForecast < 3) riskScore += 20;
    else if (totalRainMmForecast < 10) riskScore += 10;

    if (sensitivity === 'critica maxima') riskScore *= 1.3;
    else if (sensitivity === 'alta') riskScore *= 1.15;
    else if (sensitivity === 'baixa') riskScore *= 0.8;

    riskScore = Math.min(100, Math.max(0, Number(riskScore.toFixed(0))));

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
      hasIrrigationEquipment:
        selectedTwin.irrigationType === 'pivo_central' ||
        selectedTwin.irrigationType === 'gotejamento',
      effectiveDaysDry,
    };
  }, [selectedTwin, stageDetails, manualDaysWithoutRain, isIrrigatedOverride]);

  if (!selectedTwin || !stageDetails) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50 flex items-center justify-center shrink-0">
            <Sprout className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Alerta agroclimático e fenologia
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 max-w-xl leading-relaxed">
              Nenhum gêmeo digital ativo para esta propriedade. Cadastre um talhão em{' '}
              <span className="font-medium text-slate-700 dark:text-zinc-300">Fenologia</span> para
              sincronizar e projetar riscos hídricos por estádio.
            </p>
          </div>
        </div>

        {onNavigatePhenology && (
          <button
            type="button"
            onClick={onNavigatePhenology}
            className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-center whitespace-nowrap"
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Configurar em Fenologia</span>
          </button>
        )}
      </div>
    );
  }

  const riskConfig = {
    critical: {
      label: 'Risco crítico',
      accentText: 'text-rose-600 dark:text-rose-400',
      tintBg: 'bg-rose-50/50 dark:bg-rose-950/20',
      headline: `Estresse hídrico severo no estádio ${selectedTwin.currentStageCode}`,
    },
    high: {
      label: 'Risco alto',
      accentText: 'text-orange-600 dark:text-orange-400',
      tintBg: 'bg-orange-50/50 dark:bg-orange-950/20',
      headline: `Risco elevado de estresse no estádio ${selectedTwin.currentStageCode}`,
    },
    moderate: {
      label: 'Risco moderado',
      accentText: 'text-amber-600 dark:text-amber-400',
      tintBg: 'bg-amber-50/50 dark:bg-amber-950/20',
      headline: 'Estresse hídrico moderado sob acompanhamento',
    },
    low: {
      label: 'Risco baixo',
      accentText: 'text-emerald-700 dark:text-emerald-400',
      tintBg: 'bg-emerald-50/40 dark:bg-emerald-950/15',
      headline: 'Balanço hídrico estável na lavoura',
    },
  }[riskAnalysis.riskLevel];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3.5 sm:px-5 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Alerta agroclimático e fenologia
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Cruzamento entre previsão climática de 5 dias e demanda hídrica do estádio fenológico
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="climate-twin-select" className="text-xs text-slate-500 dark:text-zinc-400">
            Lavoura:
          </label>
          <select
            id="climate-twin-select"
            value={selectedTwinId}
            onChange={(e) => setSelectedTwinId(e.target.value)}
            className="h-8 px-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-slate-800 dark:text-zinc-200 focus:border-emerald-500 outline-none cursor-pointer"
          >
            {farmTwins.filter(Boolean).map((t, idx) => (
              <option key={t?.id || `twin-${idx}`} value={t?.id || ''}>
                {t?.plotName || 'Talhão'} ({t?.cropName || 'Cultura'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-zinc-800">
        {/* Left: Status, Metrics & Mitigation */}
        <div className="lg:col-span-8 flex flex-col divide-y divide-slate-200 dark:divide-zinc-800">
          {/* Risk Summary */}
          <div className={`p-4 sm:p-5 space-y-2 ${riskConfig.tintBg}`}>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`inline-flex items-center gap-1.5 font-semibold ${riskConfig.accentText}`}>
                {riskAnalysis.riskLevel === 'low' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{riskConfig.label}</span>
              </span>
              <span className="text-slate-300 dark:text-zinc-700">·</span>
              <span className="text-slate-600 dark:text-zinc-400 tabular-nums">
                Índice de estresse: <strong className="text-slate-900 dark:text-zinc-100">{riskAnalysis.riskScore}%</strong>
              </span>
              <span className="text-slate-300 dark:text-zinc-700">·</span>
              <span className="text-slate-600 dark:text-zinc-400">
                Estádio <strong className="text-slate-900 dark:text-zinc-100">{selectedTwin.currentStageCode}</strong>
              </span>
            </div>

            <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              {riskConfig.headline}
            </h4>

            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              A lavoura de{' '}
              <strong className="font-semibold text-slate-900 dark:text-zinc-100">
                {selectedTwin.cropName} ({selectedTwin.cultivarName})
              </strong>{' '}
              no talhão{' '}
              <strong className="font-semibold text-slate-900 dark:text-zinc-100">
                {selectedTwin.plotName}
              </strong>{' '}
              encontra-se em {selectedTwin.currentStageCode} ({selectedTwin.currentStageName}), com
              sensibilidade hídrica <strong className={riskConfig.accentText}>{stageDetails.waterDemand.waterStressSensitivity}</strong>{' '}
              e demanda de {stageDetails.waterDemand.kc} Kc ({stageDetails.waterDemand.dailyConsumptionMm[0]}–{stageDetails.waterDemand.dailyConsumptionMm[1]} mm/dia).
            </p>
          </div>

          {/* 3-Column Environmental Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800">
            <div className="p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                <span>Temperatura pico</span>
                <Thermometer className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <div className="text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                {riskAnalysis.maxTempForecast.toFixed(1)} °C
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Máxima prevista em 5 dias</p>
            </div>

            <div className="p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                <span>Precipitação estimada</span>
                <Droplets className="w-3.5 h-3.5 text-sky-500" />
              </div>
              <div className="text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                {riskAnalysis.totalRainMmForecast} mm
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Acumulado previsto em 5 dias</p>
            </div>

            <div className="p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                <span>Déficit hídrico</span>
                <TrendingDown className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-lg font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                -{riskAnalysis.waterDeficitMm} mm
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Déficit estimado no solo</p>
            </div>
          </div>

          {/* Mitigation Guidance */}
          <div className="p-4 sm:p-5 bg-slate-50/60 dark:bg-zinc-950/40 space-y-3">
            <h5 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
              Recomendações de mitigação
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-medium text-slate-800 dark:text-zinc-200 block">
                  1. Manejo da irrigação
                </span>
                <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {riskAnalysis.isIrrigating
                    ? `Irrigação de reposição ativa (${
                        selectedTwin.irrigationType === 'gotejamento' ? 'gotejamento' : 'pivô central'
                      }). Aplicar lâmina diária de ${(riskAnalysis.avgDailyNeed * 0.95).toFixed(
                        1
                      )} mm nos períodos frescos (noite/madrugada) para reduzir evaporação.`
                    : `Déficit acumulado de -${riskAnalysis.waterDeficitMm} mm. ${
                        riskAnalysis.hasIrrigationEquipment
                          ? `Recomenda-se acionar o sistema de ${
                              selectedTwin.irrigationType === 'gotejamento' ? 'gotejamento' : 'pivô'
                            } com lâmina de reposição.`
                          : 'Cultura sob sequeiro: priorize manejo conservacionista e osmoprotetores foliares.'
                      }`}
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-medium text-slate-800 dark:text-zinc-200 block">
                  2. Proteção fisiológica foliar
                </span>
                <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Associar aplicações com bioestimulantes osmoprotetores (aminoácidos livres como
                  prolina e glicina-betaína ou extrato de algas) para favorecer regulação estomática.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interactive Drought Simulator */}
        <div className="lg:col-span-4 p-4 sm:p-5 space-y-4">
          <div className="space-y-0.5">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Simulador de estresse</span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Projete o impacto de veranicos ou irrigação no estádio atual.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-zinc-400">Dias sem chuva/irrigação</span>
              <span className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                {manualDaysWithoutRain} dias
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={manualDaysWithoutRain}
              onChange={(e) => setManualDaysWithoutRain(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-600 disabled:opacity-40"
              disabled={isIrrigatedOverride}
            />
            <div className="flex justify-between text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">
              <span>0 d</span>
              <span>10 d</span>
              <span>20 d</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-xs font-medium text-slate-800 dark:text-zinc-200 block">
                {selectedTwin.irrigationType === 'pivo_central'
                  ? 'Ativar irrigação (Pivô)'
                  : selectedTwin.irrigationType === 'gotejamento'
                  ? 'Ativar irrigação (Gotejamento)'
                  : 'Simular irrigação emergencial'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                {selectedTwin.irrigationType === 'pivo_central'
                  ? 'Zera o estresse na área do pivô'
                  : selectedTwin.irrigationType === 'gotejamento'
                  ? 'Zera o estresse na área irrigada'
                  : 'Simula reposição hídrica ativa'}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isIrrigatedOverride}
              onClick={() => setIsIrrigatedOverride(!isIrrigatedOverride)}
              className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${
                isIrrigatedOverride
                  ? 'bg-emerald-600 justify-end'
                  : 'bg-slate-300 dark:bg-zinc-700 justify-start'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
            </button>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
            <span className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Sensibilidade da fase {selectedTwin.currentStageCode}</span>
            </span>
            <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
              {stageDetails.description}
            </p>
            <div className="space-y-1 pt-1 text-[11px] tabular-nums">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Coeficiente de cultura (Kc)</span>
                <span className="font-medium text-slate-900 dark:text-zinc-100">
                  {stageDetails.waterDemand.kc}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Demanda diária</span>
                <span className="font-medium text-slate-900 dark:text-zinc-100">
                  {stageDetails.waterDemand.dailyConsumptionMm[0]}–{stageDetails.waterDemand.dailyConsumptionMm[1]} mm
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClimateAlertWidget;
