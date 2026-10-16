// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  Sliders,
  Sparkles,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Download,
  Upload,
  Layers,
  Sprout,
  Activity,
  Plus,
  Info,
  TrendingUp,
  FlaskConical,
  Compass,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceDot,
  AreaChart,
  Area,
} from 'recharts';
import { RegionalBulletin } from '../data/regionalBulletins';
import { SoilAnalysisExtended } from '../types/recommendationsPro';

interface SoilCalibrationCurvesProps {
  currentSoil?: SoilAnalysisExtended;
  allBulletins: RegionalBulletin[];
  selectedBulletinId: string;
  onSelectBulletin: (id: string) => void;
  onUpdateBulletin?: (bulletin: RegionalBulletin) => void;
  showNotification: (msg: string) => void;
}

// Soil texture classes for calibration curve configuration
export type TextureClassKey = 'sandy' | 'medium' | 'clayey' | 'veryClayey';

export const TEXTURE_LABELS: Record<TextureClassKey, { name: string; clayRange: string; desc: string }> = {
  sandy: { name: 'Arenosa', clayRange: '< 15% Argila', desc: 'Solos com baixa retenção de cátions (CTC baixa) e alta lixiviação' },
  medium: { name: 'Média', clayRange: '15% a 35% Argila', desc: 'Solos francos equilibrados com retenção média' },
  clayey: { name: 'Argilosa', clayRange: '35% a 60% Argila', desc: 'Solos típicos do Cerrado e Sul com alta fixação de Fósforo' },
  veryClayey: { name: 'Muito Argilosa', clayRange: '> 60% Argila', desc: 'Latosolos pesados com altíssima capacidade de fixação de P' },
};

export const SoilCalibrationCurves: React.FC<SoilCalibrationCurvesProps> = ({
  currentSoil,
  allBulletins,
  selectedBulletinId,
  onSelectBulletin,
  onUpdateBulletin,
  showNotification,
}) => {
  // Active Bulletin
  const activeBulletin = useMemo(() => {
    return allBulletins.find(b => b.id === selectedBulletinId) || allBulletins[0];
  }, [allBulletins, selectedBulletinId]);

  // Selected Texture Class for configuration
  const [selectedTexture, setSelectedTexture] = useState<TextureClassKey>('clayey');

  // Selected Tab for active Nutrient Calibration Curve (P, K, MO)
  const [activeNutrient, setActiveNutrient] = useState<'p' | 'k' | 'mo'>('p');

  // Editable local state for the active bulletin parameters
  const [editingBulletin, setEditingBulletin] = useState<RegionalBulletin>(activeBulletin);

  // Sync editing bulletin when selectedBulletinId changes
  React.useEffect(() => {
    setEditingBulletin(activeBulletin);
  }, [activeBulletin]);

  // Handle changes to Phosphorus critical thresholds
  const handlePThresholdChange = (key: 'low' | 'medium' | 'good' | 'high', val: number) => {
    setEditingBulletin(prev => {
      const currentTextureP = prev.pCriticalLevels[selectedTexture] || { low: 10, medium: 20, good: 30, high: 45 };
      return {
        ...prev,
        pCriticalLevels: {
          ...prev.pCriticalLevels,
          [selectedTexture]: {
            ...currentTextureP,
            [key]: val,
          },
        },
      };
    });
  };

  // Handle changes to Potassium critical thresholds
  const handleKThresholdChange = (key: 'low' | 'medium' | 'good' | 'high', val: number) => {
    setEditingBulletin(prev => ({
      ...prev,
      kCriticalLevels: {
        ...prev.kCriticalLevels,
        [key]: val,
      },
    }));
  };

  // Handle Organic Matter (MO) critical thresholds
  const [moThresholds, setMoThresholds] = useState<{ low: number; medium: number; good: number; high: number }>({
    low: 15,
    medium: 25,
    good: 35,
    high: 50,
  });

  // Save changes to current calibration curve
  const handleSaveCurve = () => {
    if (onUpdateBulletin) {
      onUpdateBulletin(editingBulletin);
    }
    // Save to local storage for persistence
    const customKey = `geaagro_custom_curve_${editingBulletin.id}`;
    localStorage.setItem(customKey, JSON.stringify(editingBulletin));
    showNotification(`Curva de calibração para "${editingBulletin.name}" atualizada e salva com sucesso!`);
  };

  // Reset to original preset values
  const handleResetCurve = () => {
    setEditingBulletin(activeBulletin);
    showNotification('Valores restaurados para o padrão do boletim oficial.');
  };

  // Generate Mitscherlich Yield Response Curve Data Points for Phosphorus (P)
  const pResponseCurveData = useMemo(() => {
    const pLevels = editingBulletin.pCriticalLevels[selectedTexture] || { low: 10, medium: 20, good: 30, high: 45 };
    const criticalPoint = pLevels.good; // NC (90% of max yield)
    
    // Mitscherlich equation parameter: Y = 100 * (1 - e^(-c * x))
    // at x = criticalPoint, Y = 90% => 0.1 = e^(-c * NC) => c = -ln(0.1) / NC
    const c = Math.log(10) / (criticalPoint || 15);

    const points = [];
    const maxVal = Math.round(criticalPoint * 2.2);
    const step = Math.max(1, Math.round(maxVal / 25));

    for (let x = 0; x <= maxVal; x += step) {
      const relYield = Math.min(100, Math.round(100 * (1 - Math.exp(-c * x)) * 10) / 10);
      let classLabel = 'Muito Baixo';
      if (x >= pLevels.high) classLabel = 'Muito Alto';
      else if (x >= pLevels.good) classLabel = 'Alto / Adequado (NC)';
      else if (x >= pLevels.medium) classLabel = 'Médio';
      else if (x >= pLevels.low) classLabel = 'Baixo';

      points.push({
        nutrientValue: x,
        relYield,
        classLabel,
      });
    }

    return {
      points,
      pLevels,
      criticalPoint,
    };
  }, [editingBulletin, selectedTexture]);

  // Generate Mitscherlich Yield Response Curve Data Points for Potassium (K)
  const kResponseCurveData = useMemo(() => {
    const kLevels = editingBulletin.kCriticalLevels || { low: 0.15, medium: 0.30, good: 0.45, high: 0.60 };
    const criticalPoint = kLevels.good; // NC (90% max yield)
    const c = Math.log(10) / (criticalPoint || 0.45);

    const points = [];
    const maxVal = Math.round(criticalPoint * 2.2 * 100) / 100;
    const step = 0.05;

    for (let x = 0; x <= maxVal; x += step) {
      const xFixed = Math.round(x * 100) / 100;
      const relYield = Math.min(100, Math.round(100 * (1 - Math.exp(-c * xFixed)) * 10) / 10);
      let classLabel = 'Muito Baixo';
      if (xFixed >= kLevels.high) classLabel = 'Muito Alto';
      else if (xFixed >= kLevels.good) classLabel = 'Alto / Adequado (NC)';
      else if (xFixed >= kLevels.medium) classLabel = 'Médio';
      else if (xFixed >= kLevels.low) classLabel = 'Baixo';

      points.push({
        nutrientValue: xFixed,
        relYield,
        classLabel,
      });
    }

    return {
      points,
      kLevels,
      criticalPoint,
    };
  }, [editingBulletin]);

  // Generate Organic Matter (MO) Curve Data Points
  const moResponseCurveData = useMemo(() => {
    const criticalPoint = moThresholds.good; // 35 g/dm3
    const c = Math.log(10) / criticalPoint;

    const points = [];
    for (let x = 0; x <= 60; x += 2.5) {
      const relYield = Math.min(100, Math.round(100 * (1 - Math.exp(-c * x)) * 10) / 10);
      let classLabel = 'Baixo';
      if (x >= moThresholds.high) classLabel = 'Muito Alto';
      else if (x >= moThresholds.good) classLabel = 'Adequado / Crítico (NC)';
      else if (x >= moThresholds.medium) classLabel = 'Médio';
      else if (x >= moThresholds.low) classLabel = 'Baixo';

      points.push({
        nutrientValue: x,
        relYield,
        classLabel,
      });
    }

    return {
      points,
      criticalPoint,
    };
  }, [moThresholds]);

  // Current active soil values for chart overlay
  const activeSoilP = currentSoil ? (activeBulletin.phosphorusMethod === 'Resina' ? currentSoil.pResina : currentSoil.pMehlich1) : 18;
  const activeSoilK = currentSoil ? currentSoil.kCmolc : 0.28;
  const activeSoilMO = currentSoil ? currentSoil.organicMatterGKg : 26;

  // Export curve configuration as JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(editingBulletin, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `curva_calibracao_${editingBulletin.code.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification('Configuração exportada em formato JSON!');
  };

  // Import curve configuration from JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.code && parsed.pCriticalLevels) {
            setEditingBulletin(parsed);
            showNotification(`Curva de calibração "${parsed.name}" importada com sucesso!`);
          } else {
            alert('Arquivo JSON inválido. Certifique-se de carregar uma curva de calibração válida.');
          }
        } catch (err) {
          console.error(err);
          alert('Erro ao carregar o arquivo JSON.');
        }
      };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Info Box */}
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-4 border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold shrink-0 shadow-2xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Configuração de Curvas de Calibração Agronômica
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Defina e ajuste os valores críticos (NC) e faixas de resposta para Fósforo, Potássio e Matéria Orgânica por classe textural e região.
              </p>
            </div>
          </div>

          {/* Preset Bulletin Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <label htmlFor="bulletin-preset-selector" className="text-xs font-bold text-slate-700 dark:text-zinc-300 shrink-0">
              Boletim Regional:
            </label>
            <select
              id="bulletin-preset-selector"
              value={selectedBulletinId}
              onChange={e => onSelectBulletin(e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-emerald-500 dark:border-emerald-600 rounded-xl px-3 py-2 font-bold text-xs text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs"
            >
              {allBulletins.map(b => (
                <option key={b.id} value={b.id} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-bold py-1">
                  {b.code} - {b.name} ({b.region})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Bulletin Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <div className="p-3 bg-slate-50 dark:bg-zinc-900/80 rounded-xl border border-slate-200 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Extrator de Fósforo</span>
            <strong className="text-sm font-black text-emerald-700 dark:text-emerald-400">
              {editingBulletin.phosphorusMethod}
            </strong>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {editingBulletin.phosphorusMethod === 'Resina' ? 'Independente do P-Rem' : 'Variável conforme teor de argila'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-zinc-900/80 rounded-xl border border-slate-200 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Método de Calagem</span>
            <strong className="text-sm font-black text-amber-700 dark:text-amber-400">
              {editingBulletin.defaultLimingMethod === 'v_percent' ? 'Saturação por Bases (V%)' : editingBulletin.defaultLimingMethod === 'smp' ? 'Índice SMP' : 'Neutralização de Al'}
            </strong>
            <span className="text-[10px] text-slate-500 block mt-0.5">Meta Padrão Soja: {editingBulletin.targetVByCrop?.soja || 65}% V</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-zinc-900/80 rounded-xl border border-slate-200 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Fator de Gessagem</span>
            <strong className="text-sm font-black text-teal-700 dark:text-teal-400">
              NG = {editingBulletin.gypsumFactor} × % Argila
            </strong>
            <span className="text-[10px] text-slate-500 block mt-0.5">Condicionador em profundidade</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-zinc-900/80 rounded-xl border border-slate-200 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Estados de Abrangência</span>
            <strong className="text-sm font-black text-slate-800 dark:text-slate-200">
              {editingBulletin.coveredStates.join(', ')}
            </strong>
            <span className="text-[10px] text-slate-500 block mt-0.5">{editingBulletin.institution}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Control Panel Left + Curve Visualization Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Nutrient Selector & Critical Threshold Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Nutrient Tab Selector */}
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-2 flex gap-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveNutrient('p')}
              className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeNutrient === 'p'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              Fósforo (P)
            </button>

            <button
              type="button"
              onClick={() => setActiveNutrient('k')}
              className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeNutrient === 'k'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Potássio (K)
            </button>

            <button
              type="button"
              onClick={() => setActiveNutrient('mo')}
              className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeNutrient === 'mo'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Sprout className="w-4 h-4" />
              M. Orgânica
            </button>
          </div>

          {/* PHOSPHORUS (P) CONFIGURATION PANEL */}
          {activeNutrient === 'p' && (
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-zinc-800">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Calibração de Fósforo (P)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Extrator: <strong>{editingBulletin.phosphorusMethod}</strong> (mg/dm³)
                  </p>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full">
                  Mitscherlich Model
                </span>
              </div>

              {/* Texture Class Selector for P */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Classe Textural do Solo (% Argila):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(TEXTURE_LABELS) as TextureClassKey[]).map(tKey => (
                    <button
                      key={tKey}
                      type="button"
                      onClick={() => setSelectedTexture(tKey)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedTexture === tKey
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 dark:border-emerald-500 font-bold text-emerald-900 dark:text-emerald-200'
                          : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-xs block font-black">{TEXTURE_LABELS[tKey].name}</span>
                      <span className="text-[10px] text-slate-500 block">{TEXTURE_LABELS[tKey].clayRange}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* P Threshold Inputs */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                  Níveis de Interpretação Agronômica de P ({TEXTURE_LABELS[selectedTexture].name}):
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl space-y-1">
                    <label className="text-[11px] font-bold text-rose-800 dark:text-rose-400 block">
                      Muito Baixo / Baixo (&lt; mg/dm³):
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={pResponseCurveData.pLevels.low}
                      onChange={e => handlePThresholdChange('low', Number(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-black border border-rose-300 dark:border-rose-800 rounded-lg font-black text-xs text-rose-900 dark:text-rose-200"
                    />
                  </div>

                  <div className="p-3 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl space-y-1">
                    <label className="text-[11px] font-bold text-amber-800 dark:text-amber-400 block">
                      Médio (mg/dm³):
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={pResponseCurveData.pLevels.medium}
                      onChange={e => handlePThresholdChange('medium', Number(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-black border border-amber-300 dark:border-amber-800 rounded-lg font-black text-xs text-amber-900 dark:text-amber-200"
                    />
                  </div>

                  <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-xl space-y-1 col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black text-emerald-900 dark:text-emerald-300 block">
                        🎯 Nível Crítico (NC) / Adequado (mg/dm³):
                      </label>
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-emerald-600 text-white rounded">
                        90% Produtividade
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.5"
                      value={pResponseCurveData.pLevels.good}
                      onChange={e => handlePThresholdChange('good', Number(e.target.value))}
                      className="w-full p-2.5 bg-white dark:bg-black border-2 border-emerald-500 rounded-lg font-black text-sm text-emerald-900 dark:text-emerald-300 shadow-xs"
                    />
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 italic">
                      Valores abaixo de {pResponseCurveData.pLevels.good} mg/dm³ exigem adubação de correção/construção de fertilidade.
                    </p>
                  </div>

                  <div className="p-3 bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/40 rounded-xl space-y-1 col-span-2">
                    <label className="text-[11px] font-bold text-teal-800 dark:text-teal-400 block">
                      Alto / Muito Alto (&gt; mg/dm³):
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={pResponseCurveData.pLevels.high}
                      onChange={e => handlePThresholdChange('high', Number(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-black border border-teal-300 dark:border-teal-800 rounded-lg font-black text-xs text-teal-900 dark:text-teal-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* POTASSIUM (K) CONFIGURATION PANEL */}
          {activeNutrient === 'k' && (
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-zinc-800">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    Calibração de Potássio (K)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Unidade: <strong>cmol_c/dm³</strong> (Troquei 1 cmol_c/dm³ = 391 mg/dm³)
                  </p>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-full">
                  Saturação CTC Ideal: 3% a 5%
                </span>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                  Níveis de Interpretação Agronômica de K:
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl space-y-1">
                    <label className="text-[11px] font-bold text-rose-800 dark:text-rose-400 block">
                      Muito Baixo / Baixo (&lt; cmol_c/dm³):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={kResponseCurveData.kLevels.low}
                      onChange={e => handleKThresholdChange('low', Number(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-black border border-rose-300 dark:border-rose-800 rounded-lg font-black text-xs text-rose-900 dark:text-rose-200"
                    />
                  </div>

                  <div className="p-3 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl space-y-1">
                    <label className="text-[11px] font-bold text-amber-800 dark:text-amber-400 block">
                      Médio (cmol_c/dm³):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={kResponseCurveData.kLevels.medium}
                      onChange={e => handleKThresholdChange('medium', Number(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-black border border-amber-300 dark:border-amber-800 rounded-lg font-black text-xs text-amber-900 dark:text-amber-200"
                    />
                  </div>

                  <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-xl space-y-1 col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black text-emerald-900 dark:text-emerald-300 block">
                        🎯 Nível Crítico (NC) / Adequado (cmol_c/dm³):
                      </label>
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-emerald-600 text-white rounded">
                        90% Produtividade
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={kResponseCurveData.kLevels.good}
                      onChange={e => handleKThresholdChange('good', Number(e.target.value))}
                      className="w-full p-2.5 bg-white dark:bg-black border-2 border-emerald-500 rounded-lg font-black text-sm text-emerald-900 dark:text-emerald-300 shadow-xs"
                    />
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 italic">
                      Equivale a cerca de {Math.round(kResponseCurveData.kLevels.good * 391)} mg/dm³ de K trocável.
                    </p>
                  </div>

                  <div className="p-3 bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/40 rounded-xl space-y-1 col-span-2">
                    <label className="text-[11px] font-bold text-teal-800 dark:text-teal-400 block">
                      Alto / Muito Alto (&gt; cmol_c/dm³):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={kResponseCurveData.kLevels.high}
                      onChange={e => handleKThresholdChange('high', Number(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-black border border-teal-300 dark:border-teal-800 rounded-lg font-black text-xs text-teal-900 dark:text-teal-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ORGANIC MATTER (MO) CONFIGURATION PANEL */}
          {activeNutrient === 'mo' && (
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-zinc-800">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                    Calibração de Matéria Orgânica (M.O.)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Unidade: <strong>g/dm³</strong> (10 g/dm³ = 1,0%)
                  </p>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded-full">
                  Fornecimento N Biológico
                </span>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                  Níveis de Interpretação Agronômica de M.O.:
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl space-y-1">
                    <label className="text-[11px] font-bold text-rose-800 dark:text-rose-400 block">
                      Baixo (&lt; g/dm³):
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={moThresholds.low}
                      onChange={e => setMoThresholds(prev => ({ ...prev, low: Number(e.target.value) }))}
                      className="w-full p-2 bg-white dark:bg-black border border-rose-300 dark:border-rose-800 rounded-lg font-black text-xs text-rose-900 dark:text-rose-200"
                    />
                  </div>

                  <div className="p-3 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl space-y-1">
                    <label className="text-[11px] font-bold text-amber-800 dark:text-amber-400 block">
                      Médio (g/dm³):
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={moThresholds.medium}
                      onChange={e => setMoThresholds(prev => ({ ...prev, medium: Number(e.target.value) }))}
                      className="w-full p-2 bg-white dark:bg-black border border-amber-300 dark:border-amber-800 rounded-lg font-black text-xs text-amber-900 dark:text-amber-200"
                    />
                  </div>

                  <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-xl space-y-1 col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black text-emerald-900 dark:text-emerald-300 block">
                        🎯 Nível Crítico / Adequado (g/dm³):
                      </label>
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-emerald-600 text-white rounded">
                        Ideal de Sustentabilidade
                      </span>
                    </div>
                    <input
                      type="number"
                      step="1"
                      value={moThresholds.good}
                      onChange={e => setMoThresholds(prev => ({ ...prev, good: Number(e.target.value) }))}
                      className="w-full p-2.5 bg-white dark:bg-black border-2 border-emerald-500 rounded-lg font-black text-sm text-emerald-900 dark:text-emerald-300 shadow-xs"
                    />
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 italic">
                      Equivale a {moThresholds.good / 10}% de M.O. Fornece em média {Math.round(moThresholds.good * 0.8)} kg/ha/ano de Nitrogênio mineralizado.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons: Save, Reset, Export/Import */}
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs space-y-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveCurve}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Salvar Curva Regional
              </button>

              <button
                type="button"
                onClick={handleResetCurve}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                title="Restaurar padrão"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2 pt-1 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200 dark:border-zinc-800"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar JSON
              </button>

              <label className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200 dark:border-zinc-800">
                <Upload className="w-3.5 h-3.5" />
                Importar JSON
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Yield Response Curve Chart (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-slate-200 dark:border-zinc-800">
              <div>
                <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Curva de Resposta de Produtividade Relativa (%)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Modelo Mitscherlich de Rendimentos Decrescentes • Ponto Infletor = Nível Crítico (NC)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black px-2.5 py-1 bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-zinc-800">
                  Boletim: <strong>{editingBulletin.code}</strong>
                </span>
              </div>
            </div>

            {/* Recharts Response Curve Display */}
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={
                    activeNutrient === 'p'
                      ? pResponseCurveData.points
                      : activeNutrient === 'k'
                      ? kResponseCurveData.points
                      : moResponseCurveData.points
                  }
                  margin={{ top: 15, right: 25, left: -10, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeNutrient === 'p' ? '#10b981' : activeNutrient === 'k' ? '#f59e0b' : '#0d9488'} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={activeNutrient === 'p' ? '#10b981' : activeNutrient === 'k' ? '#f59e0b' : '#0d9488'} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  
                  <XAxis
                    dataKey="nutrientValue"
                    unit={activeNutrient === 'p' ? ' mg/dm³' : activeNutrient === 'k' ? ' cmol' : ' g/dm³'}
                    tick={{ fontSize: 11, fontWeight: 'bold' }}
                    label={{
                      value:
                        activeNutrient === 'p'
                          ? `Teor de Fósforo P (${editingBulletin.phosphorusMethod}) - mg/dm³`
                          : activeNutrient === 'k'
                          ? 'Teor de Potássio K - cmol_c/dm³'
                          : 'Teor de Matéria Orgânica - g/dm³',
                      position: 'insideBottom',
                      offset: -12,
                      fontSize: 11,
                      fontWeight: 'bold',
                    }}
                  />

                  <YAxis
                    domain={[0, 100]}
                    unit="%"
                    tick={{ fontSize: 11, fontWeight: 'bold' }}
                    label={{
                      value: 'Rendimento Relativo (%)',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 15,
                      fontSize: 11,
                      fontWeight: 'bold',
                    }}
                  />

                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
                            <span className="font-black block text-emerald-400">
                              Concentração: {data.nutrientValue} {activeNutrient === 'p' ? 'mg/dm³' : activeNutrient === 'k' ? 'cmol_c/dm³' : 'g/dm³'}
                            </span>
                            <span className="block font-bold">
                              Produtividade Esperada: <strong className="text-amber-300">{data.relYield}%</strong> do Máximo
                            </span>
                            <span className="block text-[10px] text-slate-300 italic">
                              Interpretação: {data.classLabel}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  {/* Reference Line for Critical Level (NC = 90% Yield) */}
                  <ReferenceLine
                    x={
                      activeNutrient === 'p'
                        ? pResponseCurveData.criticalPoint
                        : activeNutrient === 'k'
                        ? kResponseCurveData.criticalPoint
                        : moResponseCurveData.criticalPoint
                    }
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    label={{
                      value: 'NC (90%)',
                      fill: '#10b981',
                      fontSize: 11,
                      fontWeight: 'bold',
                      position: 'top',
                    }}
                  />

                  <ReferenceLine y={90} stroke="#f59e0b" strokeDasharray="3 3" />

                  {/* Reference Dot for Current Soil Sample if available */}
                  {currentSoil && (
                    <ReferenceDot
                      x={activeNutrient === 'p' ? activeSoilP : activeNutrient === 'k' ? activeSoilK : activeSoilMO}
                      y={Math.min(
                        100,
                        Math.round(
                          100 *
                            (1 -
                              Math.exp(
                                -(
                                  Math.log(10) /
                                  (activeNutrient === 'p'
                                    ? pResponseCurveData.criticalPoint
                                    : activeNutrient === 'k'
                                    ? kResponseCurveData.criticalPoint
                                    : moResponseCurveData.criticalPoint)
                                ) *
                                  (activeNutrient === 'p' ? activeSoilP : activeNutrient === 'k' ? activeSoilK : activeSoilMO)
                              )
                            )
                        )
                      )}
                      r={7}
                      fill="#3b82f6"
                      stroke="#ffffff"
                      strokeWidth={2}
                      isFront
                    />
                  )}

                  <Area
                    type="monotone"
                    dataKey="relYield"
                    name="Rendimento Relativo (%)"
                    stroke={activeNutrient === 'p' ? '#10b981' : activeNutrient === 'k' ? '#f59e0b' : '#0d9488'}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#yieldGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Diagnostic Summary of Active Soil vs Critical Curve */}
            {currentSoil && (
              <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Amostra em Foco: {currentSoil.sampleCode} ({currentSoil.plotName})
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-600 text-white">
                    Ponto Azul no Gráfico
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg border border-emerald-100 dark:border-emerald-900">
                    <span className="text-[10px] text-slate-500 block font-bold">Teor na Amostra</span>
                    <strong className="text-sm text-slate-900 dark:text-white font-black">
                      {activeNutrient === 'p'
                        ? `${activeSoilP} mg/dm³`
                        : activeNutrient === 'k'
                        ? `${activeSoilK} cmol_c/dm³`
                        : `${activeSoilMO} g/dm³`}
                    </strong>
                  </div>

                  <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg border border-emerald-100 dark:border-emerald-900">
                    <span className="text-[10px] text-slate-500 block font-bold">Nível Crítico (NC)</span>
                    <strong className="text-sm text-emerald-600 dark:text-emerald-400 font-black">
                      {activeNutrient === 'p'
                        ? `${pResponseCurveData.criticalPoint} mg/dm³`
                        : activeNutrient === 'k'
                        ? `${kResponseCurveData.criticalPoint} cmol_c/dm³`
                        : `${moResponseCurveData.criticalPoint} g/dm³`}
                    </strong>
                  </div>

                  <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg border border-emerald-100 dark:border-emerald-900">
                    <span className="text-[10px] text-slate-500 block font-bold">Status do Solo</span>
                    <strong
                      className={`text-xs font-black ${
                        (activeNutrient === 'p' ? activeSoilP : activeNutrient === 'k' ? activeSoilK : activeSoilMO) >=
                        (activeNutrient === 'p'
                          ? pResponseCurveData.criticalPoint
                          : activeNutrient === 'k'
                          ? kResponseCurveData.criticalPoint
                          : moResponseCurveData.criticalPoint)
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {(activeNutrient === 'p' ? activeSoilP : activeNutrient === 'k' ? activeSoilK : activeSoilMO) >=
                      (activeNutrient === 'p'
                        ? pResponseCurveData.criticalPoint
                        : activeNutrient === 'k'
                        ? kResponseCurveData.criticalPoint
                        : moResponseCurveData.criticalPoint)
                        ? 'Acima do NC (Adequado)'
                        : 'Abaixo do NC (Requer Adubação)'}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Technical Agronomic Notes on Calibration Curves */}
            <div className="p-3.5 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 block flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-emerald-600" />
                Fundamentação Agronômica dos Níveis Críticos:
              </span>
              <p className="leading-relaxed">
                • <strong>Nível Crítico (NC):</strong> É o teor de nutriente no solo no qual a cultura atinge aproximadamente <strong>90% do seu rendimento relativo máximo</strong>. Teores acima do NC geralmente não apresentam resposta econômica significativa a doses adicionais de fertilizante (adubação de manutenção).
              </p>
              <p className="leading-relaxed">
                • <strong>Capacidade Tampão de P (Argila / P-rem):</strong> Quanto maior o teor de argila e menor o P-remanescente, maior é a fixação de Fósforo pelos oxihidróxidos de Fe e Al, exigindo maiores teores totais de P no solo para manter o mesmo P livre na solução.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
