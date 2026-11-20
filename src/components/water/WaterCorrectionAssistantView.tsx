import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Wrench,
  ClipboardList,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { WaterAnalysisRecord } from '../../types/waterAnalysis';
import { RISK_LEVEL_META } from './waterConstants';

interface WaterCorrectionAssistantViewProps {
  analysis: WaterAnalysisRecord;
}

export const WaterCorrectionAssistantView: React.FC<WaterCorrectionAssistantViewProps> = ({
  analysis,
}) => {
  const { correctionPlan, chemical, biological, calculated } = analysis;
  const riskMeta = RISK_LEVEL_META[correctionPlan.riskLevel];
  const sim = correctionPlan.simulatedAfterTreatment;

  const comparisons = [
    {
      label: 'pH da Água',
      before: chemical.ph.toFixed(2),
      after: sim.expectedPh.toFixed(2),
      unit: 'pH',
    },
    {
      label: 'Bicarbonatos (HCO₃⁻)',
      before: String(chemical.bicarbonatesHco3MgL),
      after: String(sim.expectedBicarbonates),
      unit: 'mg/L',
    },
    {
      label: 'Escherichia coli',
      before: String(biological.escherichiaColiNmp100ml),
      after: String(sim.expectedColiforms),
      unit: 'NMP/100mL',
    },
    {
      label: 'Índice Geral (IGA)',
      before: String(calculated.igaScore),
      after: String(sim.expectedIgaScore),
      unit: 'pts',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header Summary */}
      <div className={`bg-white dark:bg-zinc-900 border ${riskMeta.borderClass} rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Assistente de Correção e Tratamento Hídrico
            </h2>
            <span className={`text-xs font-semibold ${riskMeta.textClass}`}>
              • {riskMeta.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Diagnóstico automatizado e protocolo de tratamento para a amostra {analysis.sampleCode}.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-300 shrink-0 tabular-nums">
          <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
          Reavaliar a cada <strong>{correctionPlan.monitoringFrequencyDays} dias</strong>
        </div>
      </div>

      {/* Diagnosed Problems & Expected Impacts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Problemas Diagnosticados
          </h3>
          {correctionPlan.diagnosedProblems.length === 0 ? (
            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 py-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Nenhum desvio crítico identificado nos parâmetros laboratoriais.
            </div>
          ) : (
            <ul className="space-y-2 text-xs text-slate-700 dark:text-zinc-300">
              {correctionPlan.diagnosedProblems.map((problem, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>{problem}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Impactos Agronômicos e Operacionais Esperados
          </h3>
          {correctionPlan.expectedImpacts.length === 0 ? (
            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 py-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Baixo potencial de impacto negativo sobre o solo, culturas ou emissores.
            </div>
          ) : (
            <ul className="space-y-2 text-xs text-slate-700 dark:text-zinc-300">
              {correctionPlan.expectedImpacts.map((impact, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-sm bg-rose-500 shrink-0 mt-1.5" />
                  <span>{impact}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recommended Treatments */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Tecnologias e Intervenções Recomendadas
          </h3>
        </div>
        {correctionPlan.treatmentRecommendations.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Manter filtragem preventiva padrão de linha e monitoramento periódico.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {correctionPlan.treatmentRecommendations.map((item, idx) => (
              <div
                key={`${item.technology}-${idx}`}
                className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-3.5 space-y-1.5"
              >
                <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  {item.technology}
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
                {item.dosageOrSpec && (
                  <div className="pt-2 border-t border-slate-200/80 dark:border-zinc-800 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                    Especificação: {item.dosageOrSpec}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Management + Before vs After Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Boas Práticas de Manejo
            </h3>
          </div>
          {correctionPlan.managementRecommendations.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Seguir calendário padrão de limpeza de filtros e calibração de vazão.
            </p>
          ) : (
            <ul className="space-y-2 text-xs text-slate-700 dark:text-zinc-300">
              {correctionPlan.managementRecommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Simulação Antes vs. Pós-Tratamento
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Projeção esperada após aplicação das intervenções corretivas indicadas.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {comparisons.map((row) => (
              <div
                key={row.label}
                className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-3 flex flex-col gap-1.5"
              >
                <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                  {row.label}
                </span>
                <div className="flex items-center gap-2 tabular-nums">
                  <span className="text-sm font-semibold text-slate-600 dark:text-zinc-400">
                    {row.before}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                  <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                    {row.after}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">{row.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
