import React from 'react';
import { Activity, CheckCircle2, Info } from 'lucide-react';
import { CropDigitalTwin, IDCStatus } from '../../types/phenology';

interface PhenologyIdcDiagnosticProps {
  currentTwin: CropDigitalTwin;
}

const getIdcStyle = (status: IDCStatus) => {
  switch (status) {
    case 'dentro_do_esperado':
      return {
        surface: 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/60',
        dot: 'bg-emerald-500',
        scoreText: 'text-emerald-700 dark:text-emerald-400',
        label: 'Desenvolvimento Dentro do Esperado',
        summary: 'Respondendo em boa capacidade fotossintética, sem gargalos hídricos ou nutricionais críticos no estádio atual.'
      };
    case 'ligeiramente_atrasado':
      return {
        surface: 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-900/60',
        dot: 'bg-amber-500',
        scoreText: 'text-amber-700 dark:text-amber-400',
        label: 'Ligeiramente Atrasado',
        summary: 'Ritmo de acúmulo térmico ou umidade ligeiramente abaixo do ideal; recomenda-se revisão de manejo preventivo.'
      };
    case 'comprometido':
      return {
        surface: 'bg-orange-50/70 dark:bg-orange-950/30 border-orange-200/80 dark:border-orange-900/60',
        dot: 'bg-orange-500',
        scoreText: 'text-orange-700 dark:text-orange-400',
        label: 'Desenvolvimento Comprometido',
        summary: 'Foram identificados fatores limitantes afetando o potencial produtivo. Priorize intervenção corretiva no talhão.'
      };
    case 'critico':
      return {
        surface: 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-900/60',
        dot: 'bg-rose-500',
        scoreText: 'text-rose-700 dark:text-rose-400',
        label: 'Desenvolvimento Crítico',
        summary: 'Estresse severo detectado. Vistoria agronômica imediata recomendada para conter perdas no estande.'
      };
  }
};

export const PhenologyIdcDiagnostic: React.FC<PhenologyIdcDiagnosticProps> = ({ currentTwin }) => {
  const idcStyle = getIdcStyle(currentTwin.idcStatus);
  const gddProgressPct =
    currentTwin.targetGdd > 0
      ? Math.min(100, Math.round((currentTwin.accumulatedGdd / currentTwin.targetGdd) * 100))
      : 0;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-4">
      <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          Diagnóstico Fisiológico
        </span>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
          <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Índice de Desenvolvimento da Cultura (IDC) — {currentTwin.plotName}</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 max-w-3xl">
          Cruza idade da lavoura (DAP), soma térmica acumulada (GDD), balanço hídrico e estande para comparar o ritmo real ao potencial genético da cultivar.
        </p>
      </div>

      {/* IDC Score Banner */}
      <div
        className={`p-4 rounded-xl border ${idcStyle.surface} flex flex-col md:flex-row md:items-center justify-between gap-4`}
      >
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-slate-600 dark:text-zinc-300 block">
            Status Geral de Resposta da Lavoura
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-xs shrink-0 ${idcStyle.dot}`} />
            <span>{idcStyle.label}</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-zinc-300 max-w-2xl">
            Cultivar <strong>{currentTwin.cultivarName}</strong> ({currentTwin.currentStageCode}): {idcStyle.summary}
          </p>
        </div>

        <div className="text-center bg-white dark:bg-zinc-900 px-4 py-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 shrink-0 tabular-nums">
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase block">
            Pontuação IDC
          </span>
          <span className={`text-3xl font-bold ${idcStyle.scoreText}`}>{currentTwin.idcScore}</span>
          <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium"> / 100</span>
        </div>
      </div>

      {/* 4 Pillars of IDC */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs tabular-nums">
        <div className="bg-slate-50/70 dark:bg-zinc-950/60 p-3.5 rounded-lg border border-slate-200/70 dark:border-zinc-800 space-y-1">
          <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-semibold uppercase block">
            1. Soma Térmica (GDD)
          </span>
          <strong className="text-sm text-slate-900 dark:text-white block font-bold">
            {currentTwin.accumulatedGdd} °C ({gddProgressPct}%)
          </strong>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
            Meta do ciclo: {currentTwin.targetGdd} °C para estádio atual {currentTwin.currentStageCode}.
          </p>
        </div>

        <div className="bg-slate-50/70 dark:bg-zinc-950/60 p-3.5 rounded-lg border border-slate-200/70 dark:border-zinc-800 space-y-1">
          <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-semibold uppercase block">
            2. Regime Hídrico
          </span>
          <strong className="text-sm text-sky-600 dark:text-sky-400 block font-bold capitalize">
            {currentTwin.irrigationType.replace(/_/g, ' ')}
          </strong>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
            Solo de textura {currentTwin.soilTexture.replace(/_/g, ' ')} em monitoramento.
          </p>
        </div>

        <div className="bg-slate-50/70 dark:bg-zinc-950/60 p-3.5 rounded-lg border border-slate-200/70 dark:border-zinc-800 space-y-1">
          <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-semibold uppercase block">
            3. Sistema de Cultivo
          </span>
          <strong className="text-sm text-emerald-600 dark:text-emerald-400 block font-bold capitalize">
            {currentTwin.cultivationSystem.replace(/_/g, ' ')}
          </strong>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
            Colheita estimada para {currentTwin.expectedHarvestDate}.
          </p>
        </div>

        <div className="bg-slate-50/70 dark:bg-zinc-950/60 p-3.5 rounded-lg border border-slate-200/70 dark:border-zinc-800 space-y-1">
          <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-semibold uppercase block">
            4. Estande & População
          </span>
          <strong className="text-sm text-slate-900 dark:text-white block font-bold">
            {currentTwin.plantPopulationPerHa.toLocaleString('pt-BR')} pl/ha
          </strong>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
            Espaçamento de {currentTwin.spacingMeters} m em {currentTwin.plotAreaHa} ha.
          </p>
        </div>
      </div>

      {/* Limiting Factors Diagnostic */}
      <div className="bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 p-3.5 rounded-lg space-y-2">
        <strong className="text-xs font-semibold text-slate-900 dark:text-white block">
          Fatores Limitantes & Previsão da Próxima Fase
        </strong>
        <div className="space-y-1.5 text-xs text-slate-600 dark:text-zinc-300">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-900 dark:text-white">
                Previsão de transição para {currentTwin.nextStageCode}:
              </strong>{' '}
              estimada em <strong className="tabular-nums">{currentTwin.daysToNextStage} dias</strong> mantendo a média térmica atual.
            </span>
          </div>
          {currentTwin.limitingFactors.length > 0 && (
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-900 dark:text-white">Fatores de atenção:</strong>{' '}
                {currentTwin.limitingFactors.join('; ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
