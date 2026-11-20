import React from 'react';
import { PlantabilitySamplingPoint, SeedingConfig } from '../../types/plantability';
import { calculatePlantabilityMetrics, generatePlanterDiagnostics } from '../../utils/plantabilityCalculations';
import { AlertTriangle, CheckCircle2, Wrench, ShieldCheck, Sliders } from 'lucide-react';

interface Props {
  samplings: PlantabilitySamplingPoint[];
  configs: SeedingConfig[];
}

const EXPERT_KNOWLEDGE_BASE = [
  {
    symptom: 'Muitos Duplos (> 6%)',
    causes:
      'Disco inadequado, desgaste do dosador, excesso de vácuo, raspador de duplos desregulado ou falta de grafite.',
    action:
      'Ajustar pente raspador de duplos, reduzir o vácuo pneumático em 0,5 inH2O e trocar discos para peneira menor.'
  },
  {
    symptom: 'Muitas Falhas (> 6%)',
    causes:
      'Baixo vácuo, obstrução do dosador por resíduos/grafite empastado, sementes irregulares ou raspador muito fechado.',
    action:
      'Aumentar vácuo no dosador, limpar furos do disco, abrir o pente raspador e inspecionar o tubo condutor.'
  },
  {
    symptom: 'Profundidade Variável (> 1 cm desvio)',
    causes:
      'Desgaste de discos sulcadores, pressão inadequada das molas, bandas limitadoras frouxas ou umidade desigual.',
    action:
      'Aumentar a pressão do sistema de molas, trocar discos sulcadores se desgaste > 10% e regular bandas limitadoras.'
  },
  {
    symptom: 'Emergência Desuniforme',
    causes:
      'Variação de profundidade, baixo vigor de sementes, falta de contato semente-solo ou compactação excessiva do sulco.',
    action:
      'Ajustar rodas firmadoras emborrachadas no fundo do sulco e calibrar pressão das rodas compactadoras em V.'
  },
  {
    symptom: 'Espaçamento Irregular / Alto CV (> 25%)',
    causes:
      'Velocidade excessiva (> 7,5 km/h), folgas em correntes/engrenagens e tubo condutor curvo ou com atrito elevado.',
    action:
      'Reduzir velocidade de plantio para 5,5 – 6,5 km/h, esticar correntes de transmissão e revisar condutores.'
  }
];

export const PlantabilityDiagnosticRuleEngineView: React.FC<Props> = ({ samplings, configs }) => {
  const activeConfig = configs.length > 0 ? configs[0] : undefined;
  const metrics = calculatePlantabilityMetrics(samplings || [], activeConfig);
  const diagnostics = generatePlanterDiagnostics(metrics, activeConfig);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Diagnóstico de Regulagem da Semeadora
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Motor de regras agronômicas offline para identificação de causas prováveis e ações corretivas em campo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs tabular-nums text-slate-600 dark:text-zinc-300 shrink-0">
          <span>
            CV: <strong className="text-slate-900 dark:text-white">{metrics.cvPercent}%</strong>
          </span>
          <span className="text-slate-300 dark:text-zinc-700">|</span>
          <span>
            IGP: <strong className="text-slate-900 dark:text-white">{metrics.igpScore}</strong>
          </span>
        </div>
      </div>

      {/* Active Diagnostics */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Diagnósticos Detectados nas Amostragens</span>
        </h3>

        {diagnostics.length === 0 ? (
          <div className="p-6 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/60 text-center space-y-1.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h4 className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
              {(samplings || []).length === 0
                ? 'Sem amostragens registradas'
                : 'Nenhum problema crítico detectado'}
            </h4>
            <p className="text-xs text-emerald-700/90 dark:text-emerald-400/90">
              {(samplings || []).length === 0
                ? 'Insira medições na aba Amostragem para gerar diagnósticos personalizados.'
                : 'A semeadora apresenta bons índices de distribuição, profundidade e velocidade.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {diagnostics.map(d => (
              <div
                key={d.id}
                className="p-3.5 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 space-y-3"
              >
                <div className="flex flex-wrap justify-between items-center gap-2 pb-2 border-b border-slate-200/70 dark:border-zinc-800">
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{d.symptom}</span>
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      d.severity === 'Alta'
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60'
                    }`}
                  >
                    Gravidade {d.severity}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400 block">
                      Possíveis Causas
                    </span>
                    <ul className="list-disc list-inside text-slate-700 dark:text-zinc-300 space-y-1">
                      {d.possibleCauses.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 block">
                      Ações Corretivas Recomendadas
                    </span>
                    <ul className="list-disc list-inside text-slate-700 dark:text-zinc-300 space-y-1">
                      {d.recommendedActions.map((a, idx) => (
                        <li key={idx}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Technical Rule Reference Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Referência Técnica de Solução de Problemas</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-600 dark:text-zinc-400 font-semibold uppercase text-[10px] tracking-wide">
                <th className="p-2.5">Sintoma Observado</th>
                <th className="p-2.5">Possíveis Causas</th>
                <th className="p-2.5">Ação / Regulagem Recomendada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {EXPERT_KNOWLEDGE_BASE.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 align-top">
                  <td className="p-2.5 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{item.symptom}</span>
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-600 dark:text-zinc-300">{item.causes}</td>
                  <td className="p-2.5 font-medium text-emerald-700 dark:text-emerald-400">{item.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
