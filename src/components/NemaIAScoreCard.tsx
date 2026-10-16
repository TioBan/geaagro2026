import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Zap,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Copy,
  Info,
  Bug,
  Sliders,
  ChevronDown,
  ChevronUp,
  XCircle,
  TrendingDown,
  Check
} from 'lucide-react';
import { InfestationRisk, LabResult, NematodeField } from '../types/nematology';
import { calculateLocalNemaScore, NemaScoreResult } from '../utils/nemaScoreCalculator';

interface NemaIAScoreCardProps {
  field?: NematodeField;
  labResults?: LabResult[];
  soilType?: string;
  currentCrop?: string;
  pi?: number;
  pf?: number;
  reproductionFactor?: number;
  onRunAIScore?: () => void;
  aiScoreData?: {
    score?: number;
    riskLevel?: InfestationRisk;
    executiveSummary?: string;
    subScores?: {
      populationPressure: number;
      reproductionDynamics: number;
      soilVulnerability: number;
      cropSusceptibility: number;
    };
  } | null;
  loadingAI?: boolean;
}

export type NemaSubCardType = 'pop' | 'fr' | 'soil' | 'crop' | null;

export const NemaIAScoreCard: React.FC<NemaIAScoreCardProps> = ({
  field,
  labResults = [],
  soilType,
  currentCrop,
  pi,
  pf,
  reproductionFactor,
  onRunAIScore,
  aiScoreData,
  loadingAI = false,
}) => {
  const [calculationMode, setCalculationMode] = useState<'local' | 'ia'>('local');
  const [copied, setCopied] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [selectedSubCard, setSelectedSubCard] = useState<NemaSubCardType>('pop');

  // Calculate local score deterministically
  const localResult: NemaScoreResult = calculateLocalNemaScore({
    labResults: field?.labResults || labResults,
    soilType: field?.soilType || soilType,
    currentCrop: field?.currentCrop || currentCrop,
    pi: field?.pi ?? pi,
    pf: field?.pf ?? pf,
    reproductionFactor: field?.reproductionFactor ?? reproductionFactor,
  });

  const hasData = calculationMode === 'ia'
    ? (aiScoreData !== null && aiScoreData?.score !== undefined)
    : (localResult.hasData !== false);

  // Effective Score & Data based on active mode
  const effectiveScore = calculationMode === 'ia' && aiScoreData?.score !== undefined
    ? aiScoreData.score
    : localResult.score;

  const effectiveRisk: InfestationRisk = calculationMode === 'ia' && aiScoreData?.riskLevel
    ? aiScoreData.riskLevel
    : localResult.riskLevel;

  const effectiveSubScores = calculationMode === 'ia' && aiScoreData?.subScores
    ? aiScoreData.subScores
    : localResult.subScores;

  const effectiveSummary = calculationMode === 'ia' && aiScoreData?.executiveSummary
    ? aiScoreData.executiveSummary
    : localResult.summaryInterpretation;

  // Convert risk score (0=good, 100=extreme) into Sanity Score (0-100) or vice versa for label
  const sanityScore = hasData ? Math.max(0, Math.min(100, 100 - effectiveScore)) : 0;

  const getScoreLabel = (riskScore: number) => {
    if (!hasData) return 'Sem Dados';
    if (riskScore < 25) return 'Score Excelente';
    if (riskScore < 50) return 'Score Bom';
    if (riskScore < 75) return 'Score Moderado';
    return 'Score Crítico';
  };

  const getScoreBadgeStyles = (riskScore: number) => {
    if (!hasData) {
      return {
        bg: 'bg-slate-100 dark:bg-zinc-800',
        text: 'text-slate-600 dark:text-zinc-400',
        border: 'border-slate-200 dark:border-zinc-700',
        icon: <Info className="w-3.5 h-3.5 text-slate-500" />
      };
    }
    if (riskScore < 25) {
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      };
    }
    if (riskScore < 50) {
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/40',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
      };
    }
    if (riskScore < 75) {
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-300 dark:border-amber-800',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
      };
    }
    return {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-300 dark:border-rose-800',
      icon: <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
    };
  };

  const badgeStyle = getScoreBadgeStyles(effectiveScore);

  const handleCopyReport = () => {
    const text = `PARECER NEMA SCORE — MATRIZ FITOSSANITÁRIA DE NEMATÓIDES
Data: ${new Date().toLocaleDateString('pt-BR')}
Talhão: ${field?.fieldName || 'Talhão Analisado'} (${field?.areaHa || 0} ha)
Modo de Cálculo: ${calculationMode === 'ia' ? 'Nema Online' : 'Algoritmo Determinístico Local'}
Score de Risco Infestação: ${hasData ? effectiveScore : 0}/100 [Sanidade: ${hasData ? sanityScore : 0}/100 - ${hasData ? effectiveRisk : 'Sem Dados'}]

Desdobramento de Sub-Índices:
- Pressão Populacional: ${effectiveSubScores.populationPressure}/45 pts
- Dinâmica de Reprodução (FR): ${effectiveSubScores.reproductionDynamics}/25 pts
- Vulnerabilidade do Solo (${field?.soilType || soilType || 'Não Informado'}): ${effectiveSubScores.soilVulnerability}/15 pts
- Suscetibilidade da Cultura (${field?.currentCrop || currentCrop || 'Não Informado'}): ${effectiveSubScores.cropSusceptibility}/15 pts

Resumo do Diagnóstico:
${effectiveSummary}

Ações Recomendadas:
${localResult.recommendedActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm relative overflow-hidden transition-all duration-200">
      
      {/* Background Ambient Glow */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Title & Mode Switcher on Left, Recolher/Expandir on Right */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-zinc-800">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Bug className="w-5 h-5" />
          </div>

          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
              NEMA SCORE — SANIDADE FITOSSANITÁRIA
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                {field?.fieldName ? `Índice de Infestação — ${field.fieldName}` : 'Índice Fitossanitário de Nematóides'}
              </h3>

              {/* Mode Toggle Pills */}
              <div className="inline-flex items-center bg-slate-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-[11px] font-bold ml-2">
                <button
                  onClick={() => setCalculationMode('local')}
                  className={`px-2 py-0.5 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                    calculationMode === 'local'
                      ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-2xs border border-amber-500/20'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                  title="Motor Algorítmico Determinístico (100% Offline)"
                >
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>Local</span>
                </button>
                <button
                  onClick={() => {
                    setCalculationMode('ia');
                    if (onRunAIScore && !aiScoreData) onRunAIScore();
                  }}
                  className={`px-2 py-0.5 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                    calculationMode === 'ia'
                      ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-2xs border border-indigo-500/20'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                  title="Análise Avançada Nema Online"
                >
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  <span>Nema Online</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button: Recolher / Expandir */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs border cursor-pointer ${
            isExpanded
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600'
              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
          }`}
        >
          <span>{isExpanded ? 'Recolher' : 'Expandir'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Score Area: Center Score Number + Badge */}
      <div className="flex flex-col items-center justify-center text-center my-4 space-y-3">
        {/* Massive Score Number: e.g. 85 /100 or -- /100 */}
        {hasData ? (
          <div className="text-6xl sm:text-7xl font-black text-slate-900 dark:text-white tracking-tight flex items-baseline justify-center gap-1.5">
            {sanityScore}
            <span className="text-2xl sm:text-3xl font-semibold text-slate-400 dark:text-zinc-500">/100</span>
          </div>
        ) : (
          <div className="text-6xl sm:text-7xl font-black text-slate-300 dark:text-zinc-600 tracking-tight flex items-baseline justify-center gap-1.5">
            --
            <span className="text-2xl sm:text-3xl font-semibold text-slate-300 dark:text-zinc-600">/100</span>
          </div>
        )}

        {/* Badge Underneath Score */}
        <div className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-2xs transition-all ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
          {badgeStyle.icon}
          <span>{getScoreLabel(effectiveScore)}</span>
          <span className="opacity-70 font-normal">
            ({hasData ? `${effectiveRisk} Infestação` : 'Aguardando Amostragem'})
          </span>
        </div>
      </div>

      {/* Bottom Row of Cards (Matching the screenshot layout) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full mt-6 pt-5 border-t border-slate-100 dark:border-zinc-800">
        
        {/* Card 1: POPULAÇÃO */}
        <button
          onClick={() => setSelectedSubCard(selectedSubCard === 'pop' ? null : 'pop')}
          className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all duration-200 cursor-pointer text-center ${
            selectedSubCard === 'pop'
              ? 'border-2 border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/15 shadow-xs'
              : 'bg-slate-50/50 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
            População
          </span>
          <span className="font-mono font-black text-base text-slate-900 dark:text-white">
            {hasData ? `${Math.round(((45 - effectiveSubScores.populationPressure) / 45) * 100)}%` : '--'}
          </span>
          <span className="text-[9px] text-slate-400 dark:text-zinc-500 mt-0.5">
            {effectiveSubScores.populationPressure}/45 pts
          </span>
        </button>

        {/* Card 2: REPRODUÇÃO (FR) */}
        <button
          onClick={() => setSelectedSubCard(selectedSubCard === 'fr' ? null : 'fr')}
          className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all duration-200 cursor-pointer text-center ${
            selectedSubCard === 'fr'
              ? 'border-2 border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/15 shadow-xs'
              : 'bg-slate-50/50 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
            Reprodução (FR)
          </span>
          <span className="font-mono font-black text-base text-emerald-600 dark:text-emerald-400">
            {hasData ? `${Math.round(((25 - effectiveSubScores.reproductionDynamics) / 25) * 100)}%` : '--'}
          </span>
          <span className="text-[9px] text-slate-400 dark:text-zinc-500 mt-0.5">
            {effectiveSubScores.reproductionDynamics}/25 pts
          </span>
        </button>

        {/* Card 3: SOLO */}
        <button
          onClick={() => setSelectedSubCard(selectedSubCard === 'soil' ? null : 'soil')}
          className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all duration-200 cursor-pointer text-center ${
            selectedSubCard === 'soil'
              ? 'border-2 border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/15 shadow-xs'
              : 'bg-slate-50/50 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
            Solo
          </span>
          <span className="font-mono font-black text-base text-slate-900 dark:text-white">
            {hasData ? `${Math.round(((15 - effectiveSubScores.soilVulnerability) / 15) * 100)}%` : '--'}
          </span>
          <span className="text-[9px] text-slate-400 dark:text-zinc-500 mt-0.5">
            {effectiveSubScores.soilVulnerability}/15 pts
          </span>
        </button>

        {/* Card 4: CULTURA */}
        <button
          onClick={() => setSelectedSubCard(selectedSubCard === 'crop' ? null : 'crop')}
          className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all duration-200 cursor-pointer text-center ${
            selectedSubCard === 'crop'
              ? 'border-2 border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/15 shadow-xs'
              : 'bg-slate-50/50 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
            Cultura
          </span>
          <span className="font-mono font-black text-base text-indigo-600 dark:text-indigo-400">
            {hasData ? `${Math.round(((15 - effectiveSubScores.cropSusceptibility) / 15) * 100)}%` : '--'}
          </span>
          <span className="text-[9px] text-slate-400 dark:text-zinc-500 mt-0.5">
            {effectiveSubScores.cropSusceptibility}/15 pts
          </span>
        </button>

      </div>

      {/* Footer Text */}
      <div className="text-[11px] text-slate-400 dark:text-zinc-500 text-center mt-4 flex items-center justify-center gap-1.5 font-semibold">
        <Info className="w-3.5 h-3.5 text-indigo-500" />
        <span>Toque para ver a decomposição matemática</span>
      </div>

      {/* Expanded Breakdown Section when open */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800/80 space-y-5 animate-fade-in">
          
          {/* Sub-Scores Breakdown Progress Bars */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-500" />
                Composição Vetorial do Score (Decomposição Matemática)
              </span>
              <button
                onClick={handleCopyReport}
                className="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar Relatório'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              
              {/* 1. Pressão Populacional */}
              <div className={`p-3 rounded-lg border transition-all ${selectedSubCard === 'pop' ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950'}`}>
                <div className="flex justify-between font-bold text-[11px] text-slate-800 dark:text-zinc-200 mb-1">
                  <span>1. Pressão Populacional (Solo + Raiz)</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                    {effectiveSubScores.populationPressure} / 45 pts
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(effectiveSubScores.populationPressure / 45) * 100}%` }}
                  />
                </div>
              </div>

              {/* 2. Dinâmica de Reprodução FR */}
              <div className={`p-3 rounded-lg border transition-all ${selectedSubCard === 'fr' ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950'}`}>
                <div className="flex justify-between font-bold text-[11px] text-slate-800 dark:text-zinc-200 mb-1">
                  <span>2. Fator de Reprodução (FR = Pf / Pi)</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                    {effectiveSubScores.reproductionDynamics} / 25 pts
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(effectiveSubScores.reproductionDynamics / 25) * 100}%` }}
                  />
                </div>
              </div>

              {/* 3. Vulnerabilidade do Solo */}
              <div className={`p-3 rounded-lg border transition-all ${selectedSubCard === 'soil' ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950'}`}>
                <div className="flex justify-between font-bold text-[11px] text-slate-800 dark:text-zinc-200 mb-1">
                  <span>3. Vulnerabilidade do Solo ({field?.soilType || soilType})</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                    {effectiveSubScores.soilVulnerability} / 15 pts
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(effectiveSubScores.soilVulnerability / 15) * 100}%` }}
                  />
                </div>
              </div>

              {/* 4. Suscetibilidade da Cultura */}
              <div className={`p-3 rounded-lg border transition-all ${selectedSubCard === 'crop' ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950'}`}>
                <div className="flex justify-between font-bold text-[11px] text-slate-800 dark:text-zinc-200 mb-1">
                  <span>4. Suscetibilidade da Cultura ({field?.currentCrop || currentCrop})</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                    {effectiveSubScores.cropSusceptibility} / 15 pts
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(effectiveSubScores.cropSusceptibility / 15) * 100}%` }}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Diagnostic Interpretation & Action Plan */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-3 text-xs">
            <span className="font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-500" />
              Parecer Agronômico SBN / Embrapa
            </span>

            <p className="text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
              {effectiveSummary}
            </p>

            {(localResult?.recommendedActions || []).length > 0 && (
              <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Ações Imediatas Recomendadas:
                </span>
                <ul className="space-y-1">
                  {localResult.recommendedActions.map((act, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-800 dark:text-zinc-200 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default NemaIAScoreCard;
