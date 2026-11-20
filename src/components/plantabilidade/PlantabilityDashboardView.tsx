import React from 'react';
import {
  PropertyField,
  PlanterEquipment,
  SeedBatch,
  SeedingConfig,
  PlantabilitySamplingPoint
} from '../../types/plantability';
import {
  calculatePlantabilityMetrics,
  simulateEconomicLoss,
  generatePlanterDiagnostics
} from '../../utils/plantabilityCalculations';
import {
  Sprout,
  TrendingUp,
  AlertTriangle,
  Tractor,
  DollarSign,
  Gauge,
  CheckCircle2,
  Layers,
  Plus,
  ArrowRight
} from 'lucide-react';

interface Props {
  fields: PropertyField[];
  samplings: PlantabilitySamplingPoint[];
  configs: SeedingConfig[];
  planters?: PlanterEquipment[];
  seeds?: SeedBatch[];
  onNavigateTab?: (tabId: string) => void;
}

export const PlantabilityDashboardView: React.FC<Props> = ({
  fields,
  samplings,
  configs,
  planters = [],
  seeds = [],
  onNavigateTab
}) => {
  const safeFields = (fields || []).filter(f => f && f.id);
  const safeSamplings = samplings || [];
  const totalAreaHa = safeFields.reduce((acc, f) => acc + (Number(f.areaHa) || 0), 0);
  const activeConfig = configs.length > 0 ? configs[0] : undefined;
  const metrics = calculatePlantabilityMetrics(safeSamplings, activeConfig);
  const lossSim = simulateEconomicLoss(metrics, totalAreaHa > 0 ? totalAreaHa : 100);
  const diagnostics = generatePlanterDiagnostics(metrics, activeConfig);

  const navigate = (tabId: string) => {
    onNavigateTab?.(tabId);
  };

  return (
    <div className="space-y-4">
      {/* Executive IGP Summary + KPI Strip */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="space-y-1 min-w-0">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Índice GeaAgro de Plantabilidade (IGP)
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Uniformidade de emergência, coeficiente de variação (CV%), falhas, duplos e projeção de perdas com base nas amostragens de campo.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              <span>Plantadeiras: <strong className="text-slate-800 dark:text-zinc-200">{planters.length}</strong></span>
              <span className="text-slate-300 dark:text-zinc-700">|</span>
              <span>Lotes de sementes: <strong className="text-slate-800 dark:text-zinc-200">{seeds.length}</strong></span>
              <span className="text-slate-300 dark:text-zinc-700">|</span>
              <span>Amostras: <strong className="text-slate-800 dark:text-zinc-200">{safeSamplings.length}</strong></span>
            </div>
          </div>

          <div className={`px-4 py-3 rounded-lg border flex items-center gap-4 shrink-0 ${metrics.igpColorClass}`}>
            <div className="pr-4 border-r border-current/20 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wide block opacity-80">
                IGP Geral
              </span>
              <span className="text-2xl font-bold tabular-nums leading-tight">
                {metrics.igpScore}
              </span>
              <span className="text-[10px] block opacity-75">/ 100 pts</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide block opacity-80">
                Classificação
              </span>
              <span className="text-sm font-bold block">{metrics.igpClassification}</span>
              <span className="text-[11px] tabular-nums block opacity-90">
                CV {metrics.cvPercent}% • Aceitáveis {metrics.acceptablePercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Compact KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              <span>Talhões Avaliados</span>
              <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
              {safeFields.length}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              {totalAreaHa.toFixed(1)} ha mapeados
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              <span>Falhas</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
              {metrics.skipsPercent}%
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">Meta: &lt; 5,0%</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              <span>Duplos</span>
              <Layers className="w-3.5 h-3.5 text-sky-500" />
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
              {metrics.doublesPercent}%
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">Meta: &lt; 5,0%</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              <span>População Real</span>
              <Sprout className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {metrics.realPopulationPerHa.toLocaleString('pt-BR')}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              Alvo: {metrics.targetPopulationPerHa.toLocaleString('pt-BR')} p/ha
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 space-y-1 col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              <span>Velocidade Média</span>
              <Gauge className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
              {activeConfig ? activeConfig.targetSpeedKmH : 6.5} km/h
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Faixa ideal: 5,5 – 7,5 km/h
            </p>
          </div>
        </div>
      </div>

      {/* Economic Loss Preview & Planter Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 flex flex-col justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                Impacto Econômico
              </span>
              <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Projeção de Perdas na Semeadura
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Estimativa financeira gerada por falhas, duplos e variabilidade de espaçamento.
            </p>
          </div>

          <div className="rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 divide-y divide-slate-200/70 dark:divide-zinc-800 text-xs">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-slate-600 dark:text-zinc-400">Perda por hectare</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                R$ {lossSim.financialLossPerHa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ha
              </span>
            </div>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-slate-600 dark:text-zinc-400">Perda em sacas ({lossSim.crop})</span>
              <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                {lossSim.yieldLossScHa} sc/ha ({lossSim.yieldLossPercent}%)
              </span>
            </div>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="font-medium text-slate-800 dark:text-zinc-200">
                Total estimado ({lossSim.fieldAreaHa} ha)
              </span>
              <span className="font-bold text-rose-700 dark:text-rose-400 tabular-nums">
                R$ {lossSim.totalFinancialLoss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('loss-simulator')}
            className="h-9 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Abrir Simulador Interativo</span>
          </button>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Tractor className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Diagnóstico Automático de Regulagem</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Regras agronômicas locais identificando causas prováveis e ações corretivas imediatas.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('diagnostics')}
              className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Ver completo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {diagnostics.length === 0 ? (
            <div className="p-6 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/60 text-center space-y-1.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                {safeSamplings.length === 0
                  ? 'Aguardando amostragens para diagnóstico automático'
                  : 'Semeadura dentro dos parâmetros ideais'}
              </p>
              <p className="text-xs text-emerald-700/90 dark:text-emerald-400/90">
                {safeSamplings.length === 0
                  ? 'Registre medições na aba Amostragem para ativar o motor de regras técnicas.'
                  : 'Distribuição, profundidade e velocidade estão dentro das metas de produtividade.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {diagnostics.map(diag => (
                <div
                  key={diag.id}
                  className="p-3 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{diag.symptom}</span>
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${
                        diag.severity === 'Alta'
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60'
                      }`}
                    >
                      Prioridade {diag.severity}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400 block mb-1">
                        Possíveis Causas
                      </span>
                      <ul className="list-disc list-inside text-slate-600 dark:text-zinc-300 space-y-0.5">
                        {diag.possibleCauses.slice(0, 2).map((c, idx) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 block mb-1">
                        Ações Recomendadas
                      </span>
                      <ul className="list-disc list-inside text-slate-600 dark:text-zinc-300 space-y-0.5">
                        {diag.recommendedActions.slice(0, 2).map((a, idx) => (
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
      </div>

      {/* Evaluated Fields Overview */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Talhões com Avaliação de Plantabilidade
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Clique em um talhão para inspecionar o Gêmeo Digital 360°.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('fields')}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Gerenciar Talhões
            </button>
            <button
              type="button"
              onClick={() => navigate('sampling')}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Amostragem</span>
            </button>
          </div>
        </div>

        {safeFields.length === 0 ? (
          <div className="p-8 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 text-center space-y-2">
            <p className="text-xs font-semibold text-slate-700 dark:text-zinc-200">
              Nenhum talhão cadastrado para avaliação
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Cadastre a propriedade e seus talhões semeados para acompanhar o IGP por área.
            </p>
            <button
              type="button"
              onClick={() => navigate('fields')}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium inline-flex items-center gap-1.5 mt-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar Primeiro Talhão</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {safeFields.map(f => {
              const fieldSamplings = safeSamplings.filter(s => s?.fieldId === f.id);
              const fieldConfig = configs.find(c => c?.fieldId === f.id);
              const fieldMetrics = calculatePlantabilityMetrics(fieldSamplings, fieldConfig);

              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => navigate('digital-twin')}
                  className="text-left p-3.5 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 hover:bg-slate-100/80 dark:hover:bg-zinc-800/70 border border-slate-200/70 dark:border-zinc-800 transition-colors cursor-pointer space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 block truncate">
                        {f.crop} • {f.cultivar}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
                        {f.fieldCode}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 truncate tabular-nums">
                        {f.farmName} ({f.areaHa} ha)
                      </p>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-md border text-[11px] font-semibold tabular-nums shrink-0 ${fieldMetrics.igpColorClass}`}
                    >
                      IGP {fieldMetrics.igpScore}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-200/70 dark:border-zinc-800 text-center text-xs tabular-nums">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Aceitáveis</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {fieldMetrics.acceptablePercent}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Falhas</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        {fieldMetrics.skipsPercent}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Duplos</span>
                      <span className="font-semibold text-sky-600 dark:text-sky-400">
                        {fieldMetrics.doublesPercent}%
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
