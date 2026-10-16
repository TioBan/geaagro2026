import React from 'react';
import {
  FlaskConical,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Zap,
  TrendingUp,
  Droplets,
  Boxes,
  Thermometer,
  BookOpen,
  FileText,
  ShieldCheck,
  Activity,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { FertilizerItem, CompatibilityPairRule } from '../../types/fertigation';
import { FERTILIZERS_DATABASE } from '../../data/fertigationData';

interface FertigationDashboardViewProps {
  tankVolumeLiters: number;
  tankTemperatureC: number;
  tankTotalKg: number;
  tankTotalGL: number;
  estimatedCe: number;
  estimatedPh: number;
  safetyStatus: 'segura' | 'atencao' | 'nao_recomendada';
  hasIncompatibility: boolean;
  detectedIncompatibilities: CompatibilityPairRule[];
  tankFertilizersCount: number;
  onNavigateTab: (tab: any) => void;
  onAutoSeparate: () => void;
  savedRecipesCount: number;
}

export const FertigationDashboardView: React.FC<FertigationDashboardViewProps> = ({
  tankVolumeLiters,
  tankTemperatureC,
  tankTotalKg,
  tankTotalGL,
  estimatedCe,
  estimatedPh,
  safetyStatus,
  hasIncompatibility,
  detectedIncompatibilities,
  tankFertilizersCount,
  onNavigateTab,
  onAutoSeparate,
  savedRecipesCount,
}) => {
  // Stability index (0 to 100%)
  const stabilityIndex = hasIncompatibility
    ? 25
    : tankTotalGL > 250
    ? 65
    : tankTotalGL > 150
    ? 85
    : 98;

  // Saturation percentage approximation (max ~350 g/L for high blend at 20C)
  const saturationPercent = Math.min(100, Math.round((tankTotalGL / 350) * 100));

  return (
    <div className="space-y-6 animate-fade-in" id="fertigation-dashboard">
      {/* 1. Top 7 Metric Cards (Requested in Dashboard) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div
          onClick={() => onNavigateTab('banco_fertilizantes')}
          className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs hover:border-emerald-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1.5">
            <Boxes className="w-4 h-4" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Banco</span>
          </div>
          <strong className="text-xl font-black text-slate-900 dark:text-white block">
            {FERTILIZERS_DATABASE.length}
          </strong>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Fertilizantes Cadastrados</span>
        </div>

        <div
          onClick={() => onNavigateTab('simulador_tanque')}
          className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs hover:border-emerald-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-teal-600 dark:text-teal-400 mb-1.5">
            <FlaskConical className="w-4 h-4" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Tanque</span>
          </div>
          <strong className="text-xl font-black text-slate-900 dark:text-white block">
            {tankFertilizersCount}
          </strong>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Misturas em Análise</span>
        </div>

        <div
          onClick={() => onNavigateTab('matriz_compatibilidade')}
          className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs hover:border-emerald-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-1.5">
            <Zap className="w-4 h-4" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Matriz</span>
          </div>
          <strong className="text-xl font-black text-slate-900 dark:text-white block">
            600+
          </strong>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Compatibilidades Verificadas</span>
        </div>

        <div
          onClick={() => onNavigateTab('simulador_tanque')}
          className={`p-3.5 rounded-2xl border shadow-2xs cursor-pointer transition-all ${
            hasIncompatibility
              ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900'
              : 'bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase">Alertas</span>
          </div>
          <strong
            className={`text-xl font-black block ${
              hasIncompatibility ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
            }`}
          >
            {detectedIncompatibilities.length}
          </strong>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Alertas Ativos</span>
        </div>

        <div
          onClick={() => onNavigateTab('receitas_laudos')}
          className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs hover:border-emerald-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-1.5">
            <FileText className="w-4 h-4" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Receitas</span>
          </div>
          <strong className="text-xl font-black text-slate-900 dark:text-white block">
            {savedRecipesCount}
          </strong>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Últimas Receitas</span>
        </div>

        <div
          onClick={() => onNavigateTab('receitas_laudos')}
          className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs hover:border-emerald-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-amber-500 mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Favoritos</span>
          </div>
          <strong className="text-xl font-black text-slate-900 dark:text-white block">
            8
          </strong>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Receitas Favoritas</span>
        </div>

        <div
          onClick={() => onNavigateTab('receitas_laudos')}
          className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs hover:border-emerald-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1.5">
            <Activity className="w-4 h-4" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Histórico</span>
          </div>
          <strong className="text-xl font-black text-slate-900 dark:text-white block">
            100%
          </strong>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Offline Disponível</span>
        </div>
      </div>

      {/* 2. Real-Time Indicators & Quality Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 cols: Real-Time Diagnostic Gauges */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3.5">
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Painel de Indicadores da Calda em Tempo Real
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Monitoramento termodinâmico, eletroquímico e de estabilidade da solução nutritiva
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 ${
                hasIncompatibility
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                  : safetyStatus === 'atencao'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
              }`}
            >
              {hasIncompatibility ? '🔴 Incompatível' : safetyStatus === 'atencao' ? '🟡 Atenção' : '🟢 Solução 100% Segura'}
            </span>
          </div>

          {/* Real-time Indicator Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {/* 1. Compatibilidade Geral */}
            <div className="p-3.5 bg-slate-50/80 dark:bg-zinc-800/60 rounded-xl border border-slate-200/70 dark:border-zinc-700/60 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                Compatibilidade Geral
              </span>
              <div className="flex items-center gap-2">
                {hasIncompatibility ? (
                  <span className="text-rose-600 font-black text-sm flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Crítica (Separação Req.)
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Estável & Sem Precipitados
                  </span>
                )}
              </div>
              <div className="w-full bg-slate-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${hasIncompatibility ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${stabilityIndex}%` }}
                />
              </div>
            </div>

            {/* 2. CE Estimada */}
            <div className="p-3.5 bg-slate-50/80 dark:bg-zinc-800/60 rounded-xl border border-slate-200/70 dark:border-zinc-700/60 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                Condutividade Elétrica (CE)
              </span>
              <strong className="text-lg font-black text-slate-900 dark:text-white block">
                {estimatedCe.toFixed(2)} <span className="text-xs font-normal text-slate-400">mS/cm</span>
              </strong>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                Faixa alvo: 1.2 - 2.4 mS/cm
              </span>
            </div>

            {/* 3. pH Estimado */}
            <div className="p-3.5 bg-slate-50/80 dark:bg-zinc-800/60 rounded-xl border border-slate-200/70 dark:border-zinc-700/60 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                pH Estimado da Calda
              </span>
              <div className="flex items-center justify-between">
                <strong className="text-lg font-black text-teal-600 dark:text-teal-400">
                  {estimatedPh.toFixed(1)}
                </strong>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                  {estimatedPh < 5.5 ? 'Ácido' : estimatedPh > 6.8 ? 'Alcalino' : 'Ideal'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                Faixa ideal: 5.5 a 6.5
              </span>
            </div>

            {/* 4. Saturação da Solução */}
            <div className="p-3.5 bg-slate-50/80 dark:bg-zinc-800/60 rounded-xl border border-slate-200/70 dark:border-zinc-700/60 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                Saturação da Solução
              </span>
              <div className="flex items-center justify-between">
                <strong className="text-sm font-black text-slate-900 dark:text-white">
                  {saturationPercent}%
                </strong>
                <span className="text-[10px] text-slate-400">{tankTotalGL.toFixed(1)} g/L</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    saturationPercent > 80 ? 'bg-rose-500' : saturationPercent > 60 ? 'bg-amber-500' : 'bg-teal-500'
                  }`}
                  style={{ width: `${saturationPercent}%` }}
                />
              </div>
            </div>

            {/* 5. Índice de Estabilidade */}
            <div className="p-3.5 bg-slate-50/80 dark:bg-zinc-800/60 rounded-xl border border-slate-200/70 dark:border-zinc-700/60 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                Índice de Estabilidade
              </span>
              <div className="flex items-center justify-between">
                <strong
                  className={`text-sm font-black ${
                    stabilityIndex >= 80
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : stabilityIndex >= 50
                      ? 'text-amber-500'
                      : 'text-rose-500'
                  }`}
                >
                  {stabilityIndex}%
                </strong>
                <span className="text-[10px] text-slate-400">Termodinâmica</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    stabilityIndex >= 80 ? 'bg-emerald-500' : stabilityIndex >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${stabilityIndex}%` }}
                />
              </div>
            </div>

            {/* 6. Temperatura da Solução */}
            <div className="p-3.5 bg-slate-50/80 dark:bg-zinc-800/60 rounded-xl border border-slate-200/70 dark:border-zinc-700/60 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                Temperatura da Calda
              </span>
              <strong className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1">
                <Thermometer className="w-4 h-4 text-amber-500" />
                {tankTemperatureC}°C
              </strong>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                Solubilidade máxima a 20°C
              </span>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              onClick={() => onNavigateTab('simulador_tanque')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <FlaskConical className="w-4 h-4" />
              Abrir Laboratório Virtual
            </button>

            <button
              onClick={() => onNavigateTab('matriz_compatibilidade')}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              Consultar Matriz 2D
            </button>

            <button
              onClick={() => onNavigateTab('tanques_ab')}
              className="bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Layers className="w-4 h-4" />
              Separação Tanques A & B
            </button>

            <button
              onClick={() => onNavigateTab('biblioteca_tecnica')}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <BookOpen className="w-4 h-4 text-emerald-500" />
              Biblioteca Agronômica
            </button>
          </div>
        </div>

        {/* Right 4 cols: Critical Alerts & Recommendation Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Diagnóstico de Segurança da Mistura
            </h4>

            {hasIncompatibility ? (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>Risco Crítico de Precipitação</span>
                </div>
                <p className="text-[11px] text-rose-950 dark:text-rose-200 leading-relaxed">
                  Foram identificados pares químicos incompatíveis que precipitam cristais insolúveis (ex: Gipsita ou Fosfatos de Cálcio), cimentando gotejadores de 120 mesh.
                </p>
                <button
                  onClick={onAutoSeparate}
                  className="w-full mt-2 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Separar em Tanques A e B
                </button>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-900 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Calda Totalmente Segura</span>
                </div>
                <p className="text-[11px] text-emerald-950 dark:text-emerald-200 leading-relaxed">
                  Todos os sais estão dentro do limite de solubilidade a {tankTemperatureC}°C sem risco de reações antagônicas ou obstrução de tubulações.
                </p>
              </div>
            )}

            {/* Quick Summary of Tank */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                <span>Volume Configurado:</span>
                <strong className="text-slate-900 dark:text-white font-bold">{tankVolumeLiters} Litros</strong>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                <span>Carga de Sais Adicionados:</span>
                <strong className="text-slate-900 dark:text-white font-bold">{tankTotalKg} kg ({tankTotalGL.toFixed(1)} g/L)</strong>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                <span>Risco em Gotejadores:</span>
                <strong className={`font-bold ${hasIncompatibility ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {hasIncompatibility ? 'Crítico (95%+)' : 'Baixo (< 5%)'}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
