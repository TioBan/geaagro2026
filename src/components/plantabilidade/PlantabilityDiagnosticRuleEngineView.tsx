import React from 'react';
import { PlantabilitySamplingPoint, SeedingConfig } from '../../types/plantability';
import { calculatePlantabilityMetrics, generatePlanterDiagnostics } from '../../utils/plantabilityCalculations';
import { Tractor, AlertTriangle, CheckCircle2, Wrench, ShieldCheck, Sliders } from 'lucide-react';

interface Props {
  samplings: PlantabilitySamplingPoint[];
  configs: SeedingConfig[];
}

export const PlantabilityDiagnosticRuleEngineView: React.FC<Props> = ({ samplings, configs }) => {
  const activeConfig = configs.length > 0 ? configs[0] : undefined;
  const metrics = calculatePlantabilityMetrics(samplings, activeConfig);
  const diagnostics = generatePlanterDiagnostics(metrics, activeConfig);

  // Standard Expert Knowledge Base Rules (Rule-based table as requested by prompt)
  const expertKnowledgeBase = [
    {
      symptom: 'Muitos Duplos (> 6%)',
      causes: 'Disco inadequado, desgaste do dosador, excesso de vácuo, raspador de duplos desregulada ou falta de grafite.',
      action: 'Ajustar pente raspador de duplos, reduzir o vácuo pneumático em 0.5 inH2O, trocar discos para peneira menor.'
    },
    {
      symptom: 'Muitas Falhas (> 6%)',
      causes: 'Baixo vácuo, obstrução do dosador por resíduos/grafite empastado, sementes irregulares ou raspador muito fechado.',
      action: 'Aumentar vácuo no dosador, limpar furos do disco, abrir o pente raspador e inspecionar tubo condutor.'
    },
    {
      symptom: 'Profundidade Variável (> 1 cm desvio)',
      causes: 'Desgaste de discos sulcadores, pressão inadequada das molas da linha, bandas limitadoras frouxas ou solo com umidade desigual.',
      action: 'Aumentar a pressão do sistema de molas, trocar discos sulcadores se desgaste > 10%, regular bandas limitadoras.'
    },
    {
      symptom: 'Emergência Desuniforme',
      causes: 'Variação de profundidade de semeadura, baixa qualidade de vigor das sementes, falta de contato semente-solo ou compactação do sulco.',
      action: 'Ajustar rodas firmadoras emborrachadas no fundo do sulco, ajustar pressão das rodas compactadoras em V.'
    },
    {
      symptom: 'Espaçamento Irregular / Alto CV (> 25%)',
      causes: 'Velocidade de operação excessiva (>7.5 km/h), folgas nas engrenagens/correntes, tubo condutor curvo/atrito elevado.',
      action: 'Reduzir a velocidade de plantio para 5.5 - 6.5 km/h, esticar correntes de transmissão, trocar condutores de sementes.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/60 rounded-2xl text-amber-700 dark:text-amber-300">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-stone-900 dark:text-white">
              🛠️ Diagnóstico de Regulagem da Semeadora (Motor de Regras Agronômicas)
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Identificação automática de causas e soluções de problemas de semeadura em campo baseada em regras técnicas offline.
            </p>
          </div>
        </div>
      </div>

      {/* Active Diagnostics for Current Field */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-4">
        <h3 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Diagnósticos Detectados na Última Amostragem (CV: {metrics.cvPercent}%, IGP: {metrics.igpScore})
        </h3>

        {diagnostics.length === 0 ? (
          <div className="p-6 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">Nenhum Problema Crítico Detectado!</h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Sua semeadora apresenta excelentes índices de distribuição, profundidade e velocidade.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {diagnostics.map((d, i) => (
              <div key={i} className="p-5 bg-stone-50 dark:bg-zinc-800/80 rounded-2xl border border-stone-200 dark:border-zinc-700 space-y-3">
                <div className="flex justify-between items-center border-b border-stone-200 dark:border-zinc-700 pb-2">
                  <span className="text-sm font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {d.symptom}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    d.severity === 'Alta' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    Gravidade {d.severity}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                  <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-stone-200 dark:border-zinc-700 space-y-1">
                    <span className="text-[10px] font-black uppercase text-stone-500 block">Possíveis Causas</span>
                    <ul className="list-disc list-inside text-stone-800 dark:text-stone-200 space-y-1">
                      {d.possibleCauses.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-1">
                    <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 block">Ações Corretivas Recomendadas</span>
                    <ul className="list-disc list-inside text-stone-800 dark:text-stone-200 space-y-1">
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

      {/* Complete Expert Rule Table */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-4">
        <h3 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Tabela do Banco de Dados Técnico de Solução de Problemas
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 font-bold uppercase text-[10px]">
                <th className="p-3">Sintoma / Problema Observado</th>
                <th className="p-3">Possíveis Causas</th>
                <th className="p-3">Ação / Regulagem Recomendada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-zinc-800 font-medium">
              {expertKnowledgeBase.map((item, idx) => (
                <tr key={idx} className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                  <td className="p-3 font-bold text-stone-900 dark:text-white flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-amber-500" />
                    {item.symptom}
                  </td>
                  <td className="p-3 text-stone-600 dark:text-stone-300">{item.causes}</td>
                  <td className="p-3 font-semibold text-emerald-700 dark:text-emerald-400">{item.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
