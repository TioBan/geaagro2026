import React from 'react';
import {
  FlaskConical,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Boxes,
  Thermometer,
  BookOpen,
  FileText,
  ShieldCheck,
  Activity,
  XCircle,
} from 'lucide-react';
import { CompatibilityPairRule } from '../../types/fertigation';
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
  const stabilityIndex = hasIncompatibility
    ? 25
    : tankTotalGL > 250
    ? 65
    : tankTotalGL > 150
    ? 85
    : 98;

  const saturationPercent = Math.min(100, Math.round((tankTotalGL / 350) * 100));

  const phStateLabel =
    estimatedPh < 5.5 ? 'Ácido' : estimatedPh > 6.8 ? 'Alcalino' : 'Ideal';

  return (
    <div className="space-y-5" id="fertigation-dashboard">
      {/* Faixa Unificada de Indicadores de Acesso Rápido */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-slate-200 dark:divide-zinc-800 overflow-hidden">
        <button
          type="button"
          onClick={() => onNavigateTab('banco_fertilizantes')}
          className="p-4 text-left hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-[11px] font-medium">Banco de fertilizantes</span>
            <Boxes className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          </div>
          <div className="text-xl font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-1">
            {FERTILIZERS_DATABASE.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            Fontes catalogadas
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('simulador_tanque')}
          className="p-4 text-left hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-[11px] font-medium">Insumos no tanque</span>
            <FlaskConical className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          </div>
          <div className="text-xl font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-1">
            {tankFertilizersCount}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
            {tankTotalKg.toFixed(1)} kg · {tankVolumeLiters} L
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('simulador_tanque')}
          className={`p-4 text-left transition-colors cursor-pointer ${
            hasIncompatibility
              ? 'bg-rose-50/60 dark:bg-rose-950/25 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-[11px] font-medium">Alertas químicos</span>
            <AlertTriangle
              className={`w-3.5 h-3.5 shrink-0 ${
                hasIncompatibility ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-zinc-500'
              }`}
            />
          </div>
          <div
            className={`text-xl font-semibold tabular-nums mt-1 ${
              hasIncompatibility ? 'text-rose-700 dark:text-rose-400' : 'text-slate-900 dark:text-zinc-100'
            }`}
          >
            {detectedIncompatibilities.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            {hasIncompatibility ? 'Separação obrigatória' : 'Sem incompatibilidades'}
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('receitas_laudos')}
          className="p-4 text-left hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-[11px] font-medium">Receitas técnicas</span>
            <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          </div>
          <div className="text-xl font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-1">
            {savedRecipesCount}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            Modelos prontos para laudo
          </div>
        </button>
      </div>

      {/* Painel Principal: Indicadores da Calda + Diagnóstico de Segurança */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Esquerda (8 colunas): Indicadores em Tempo Real */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    Indicadores da Calda em Tempo Real
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Monitoramento físico-químico, condutividade e estabilidade da solução nutritiva
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap shrink-0 ${
                  hasIncompatibility
                    ? 'text-rose-700 dark:text-rose-400'
                    : safetyStatus === 'atencao'
                    ? 'text-amber-700 dark:text-amber-400'
                    : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {hasIncompatibility ? (
                  <>
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>Incompatível</span>
                  </>
                ) : safetyStatus === 'atencao' ? (
                  <>
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Atenção</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Solução segura</span>
                  </>
                )}
              </span>
            </div>

            {/* Grade 2x3 com divisores finos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-zinc-800 border-b border-slate-100 dark:border-zinc-800">
              <div className="p-4 space-y-1.5">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                  Compatibilidade geral
                </span>
                <div className="text-xs font-semibold flex items-center gap-1.5">
                  {hasIncompatibility ? (
                    <span className="text-rose-700 dark:text-rose-400">Crítica (segregar)</span>
                  ) : (
                    <span className="text-emerald-700 dark:text-emerald-400">Estável sem precipitados</span>
                  )}
                </div>
                <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${hasIncompatibility ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${stabilityIndex}%` }}
                  />
                </div>
              </div>

              <div className="p-4 space-y-0.5">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                  Condutividade elétrica (CE)
                </span>
                <div className="text-base font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                  {estimatedCe.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">mS/cm</span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block tabular-nums">
                  Alvo: 1,2 a 2,4 mS/cm
                </span>
              </div>

              <div className="p-4 space-y-0.5">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                  pH estimado da calda
                </span>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-base font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                    {estimatedPh.toFixed(1)}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                    {phStateLabel}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block tabular-nums">
                  Faixa ideal: 5,5 a 6,5
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-zinc-800 border-b border-slate-100 dark:border-zinc-800">
              <div className="p-4 space-y-1.5">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                  Saturação da solução
                </span>
                <div className="flex items-baseline justify-between gap-2 tabular-nums">
                  <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    {saturationPercent}%
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {tankTotalGL.toFixed(1)} g/L
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      saturationPercent > 80
                        ? 'bg-rose-500'
                        : saturationPercent > 60
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${saturationPercent}%` }}
                  />
                </div>
              </div>

              <div className="p-4 space-y-1.5">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                  Índice de estabilidade
                </span>
                <div className="flex items-baseline justify-between gap-2 tabular-nums">
                  <span
                    className={`text-sm font-semibold ${
                      stabilityIndex >= 80
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : stabilityIndex >= 50
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    {stabilityIndex}%
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">Termodinâmica</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      stabilityIndex >= 80
                        ? 'bg-emerald-500'
                        : stabilityIndex >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${stabilityIndex}%` }}
                  />
                </div>
              </div>

              <div className="p-4 space-y-0.5">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                  Temperatura da calda
                </span>
                <div className="text-base font-semibold tabular-nums text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{tankTemperatureC} °C</span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                  Referência de solubilidade: 20 °C
                </span>
              </div>
            </div>
          </div>

          {/* Barra de Atalhos Proporcionais */}
          <div className="px-4 py-3 bg-slate-50/70 dark:bg-zinc-950/40 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateTab('simulador_tanque')}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
            >
              <FlaskConical className="w-3.5 h-3.5 shrink-0" />
              <span>Abrir Laboratório</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('matriz_compatibilidade')}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Matriz 2D</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('tanques_ab')}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Tanques A &amp; B</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('biblioteca_tecnica')}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 shrink-0" />
              <span>Biblioteca</span>
            </button>
          </div>
        </div>

        {/* Direita (4 colunas): Diagnóstico de Segurança */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Diagnóstico de Segurança
              </h4>
            </div>

            <div className="p-4">
              {hasIncompatibility ? (
                <div className="p-3.5 rounded-lg border border-rose-200 dark:border-rose-800/70 bg-rose-50/70 dark:bg-rose-950/30 space-y-2.5 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-rose-800 dark:text-rose-300">
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>Risco crítico de precipitação</span>
                  </div>
                  <p className="text-[11px] text-rose-950 dark:text-rose-200/90 leading-relaxed">
                    Pares químicos incompatíveis detectados com formação de cristais insolúveis (gipsita ou fosfatos de cálcio), com alto risco de entupimento de gotejadores.
                  </p>
                  <button
                    type="button"
                    onClick={onAutoSeparate}
                    className="h-8 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 shrink-0" />
                    <span>Separar em Tanques A e B</span>
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/70 dark:bg-emerald-950/30 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Calda segura para injeção</span>
                  </div>
                  <p className="text-[11px] text-emerald-950 dark:text-emerald-200/90 leading-relaxed">
                    Os sais carregados permanecem dentro do limite de solubilidade a {tankTemperatureC} °C sem risco de precipitação nas linhas.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="px-4 py-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/40 space-y-2 text-xs">
            <div className="flex justify-between gap-2">
              <span className="text-slate-500 dark:text-zinc-400">Volume configurado</span>
              <span className="font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                {tankVolumeLiters} L
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-500 dark:text-zinc-400">Carga de sais</span>
              <span className="font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                {tankTotalKg.toFixed(1)} kg ({tankTotalGL.toFixed(1)} g/L)
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-500 dark:text-zinc-400">Risco em gotejadores</span>
              <span
                className={`font-semibold tabular-nums ${
                  hasIncompatibility
                    ? 'text-rose-700 dark:text-rose-400'
                    : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {hasIncompatibility ? 'Crítico (95%+)' : 'Baixo (< 5%)'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
