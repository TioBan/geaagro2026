import React from 'react';
import { Activity, CheckCircle2, Info } from 'lucide-react';
import { CropDigitalTwin, IDCStatus } from '../../types/phenology';

interface PhenologyIdcDiagnosticProps {
  currentTwin: CropDigitalTwin;
}

export const PhenologyIdcDiagnostic: React.FC<PhenologyIdcDiagnosticProps> = ({ currentTwin }) => {
  const getIDCBadge = (status: IDCStatus) => {
    switch (status) {
      case 'dentro_do_esperado':
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-950/60',
          border: 'border-emerald-300 dark:border-emerald-800',
          label: '🟢 Desenvolvimento Dentro do Esperado',
        };
      case 'ligeiramente_atrasado':
        return {
          bg: 'bg-amber-100 dark:bg-amber-950/60',
          border: 'border-amber-300 dark:border-amber-800',
          label: '🟡 Ligeiramente Atrasado',
        };
      case 'comprometido':
        return {
          bg: 'bg-orange-100 dark:bg-orange-950/60',
          border: 'border-orange-300 dark:border-orange-800',
          label: '🟠 Desenvolvimento Comprometido',
        };
      case 'critico':
        return {
          bg: 'bg-rose-100 dark:bg-rose-950/60',
          border: 'border-rose-300 dark:border-rose-800',
          label: '🔴 Desenvolvimento Crítico',
        };
    }
  };

  const idcStyle = getIDCBadge(currentTwin.idcStatus);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-5">
        <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
          <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
            Motor de Inteligência Fisiológica
          </span>
          <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            Índice de Desenvolvimento da Cultura (IDC) — {currentTwin.plotName}
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-3xl">
            O IDC cruza a idade da lavoura (DAP), soma térmica acumulada (GDD), disponibilidade hídrica no perfil e sanidade foliar para diagnosticar o ritmo de desenvolvimento real comparado ao potencial genético da cultivar.
          </p>
        </div>

        {/* IDC Big Score Card */}
        <div className={`p-5 rounded-2xl border ${idcStyle.bg} ${idcStyle.border} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-300">Status Geral de Resposta da Lavoura:</span>
            <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{idcStyle.label}</h4>
            <p className="text-xs text-slate-600 dark:text-zinc-300 max-w-xl">
              A cultivar {currentTwin.cultivarName} está respondendo em plena capacidade fotossintética, sem gargalos hídricos ou nutricionais no momento.
            </p>
          </div>

          <div className="text-center bg-white/80 dark:bg-black/80 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-700/80 shrink-0">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Pontuação IDC</span>
            <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">{currentTwin.idcScore}</span>
            <span className="text-xs text-slate-400 font-bold"> / 100</span>
          </div>
        </div>

        {/* 4 Pillars of IDC */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1.5">
            <span className="text-slate-400 text-[10px] font-bold uppercase block">1. Soma Térmica (GDD)</span>
            <strong className="text-sm text-slate-900 dark:text-white block font-black">{currentTwin.accumulatedGdd} °C</strong>
            <p className="text-[11px] text-slate-500 leading-tight">Graus-dia suficientes para a transição floral R1.</p>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1.5">
            <span className="text-slate-400 text-[10px] font-bold uppercase block">2. Balanço Hídrico</span>
            <strong className="text-sm text-cyan-600 dark:text-cyan-400 block font-black">94% Adequado</strong>
            <p className="text-[11px] text-slate-500 leading-tight">Perfil de solo entre 0-40 cm com água disponível.</p>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1.5">
            <span className="text-slate-400 text-[10px] font-bold uppercase block">3. Nutrição Foliar</span>
            <strong className="text-sm text-emerald-600 dark:text-emerald-400 block font-black">Equilibrada</strong>
            <p className="text-[11px] text-slate-500 leading-tight">Nodulação ativa de Bradyrhizobium suprindo N.</p>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1.5">
            <span className="text-slate-400 text-[10px] font-bold uppercase block">4. Estande & População</span>
            <strong className="text-sm text-indigo-600 dark:text-indigo-400 block font-black">{currentTwin.plantPopulationPerHa.toLocaleString('pt-BR')} pl/ha</strong>
            <p className="text-[11px] text-slate-500 leading-tight">Espaçamento de {currentTwin.spacingMeters}m com alta uniformidade.</p>
          </div>
        </div>

        {/* Limiting Factors Diagnostic */}
        <div className="bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 p-4 rounded-xl space-y-2">
          <strong className="text-xs font-bold text-slate-900 dark:text-white block">
            Diagnóstico de Fatores Limitantes & Previsão da Próxima Fase:
          </strong>
          <div className="space-y-1.5 text-xs text-slate-700 dark:text-zinc-300">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Previsão de Transição para {currentTwin.nextStageCode}:</strong> Estimada para ocorrer em <strong>{currentTwin.daysToNextStage} dias</strong> mantendo a média térmica favorável.
              </span>
            </div>
            {currentTwin.limitingFactors.length > 0 && (
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Fatores de Atenção:</strong> {currentTwin.limitingFactors.join('; ')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
