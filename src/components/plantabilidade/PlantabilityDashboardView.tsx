import React from 'react';
import { PropertyField, PlanterEquipment, SeedBatch, SeedingConfig, PlantabilitySamplingPoint } from '../../types/plantability';
import { calculatePlantabilityMetrics, simulateEconomicLoss, generatePlanterDiagnostics } from '../../utils/plantabilityCalculations';
import {
  Sprout,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Tractor,
  DollarSign,
  Gauge,
  CheckCircle2,
  Calendar,
  Layers,
  Thermometer,
  CloudRain
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
  onNavigateTab
}) => {
  // Aggregate stats across all fields or active field
  const totalAreaHa = fields.reduce((acc, f) => acc + f.areaHa, 0);
  const activeConfig = configs.length > 0 ? configs[0] : undefined;
  const metrics = calculatePlantabilityMetrics(samplings, activeConfig);
  const lossSim = simulateEconomicLoss(metrics, totalAreaHa > 0 ? totalAreaHa : 100);
  const diagnostics = generatePlanterDiagnostics(metrics, activeConfig);

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Header - Integrated Unified Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-zinc-950 text-white p-6 rounded-3xl border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sprout className="w-64 h-64 text-emerald-400" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              🌱 Plantabilidade & Qualidade de Semeadura
            </h1>
            <p className="text-xs md:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Avaliação técnica de uniformidade de emergência, falhas, duplos, coeficiente de variação (CV%), calibração de dosadores e projeção de impacto econômico.
            </p>
          </div>

          {/* IGP Main Score Card Badge */}
          <div className={`p-5 rounded-2xl border-2 flex items-center gap-4 ${metrics.igpColorClass} shadow-2xl shrink-0`}>
            <div className="text-center border-r border-stone-300 dark:border-stone-700 pr-4">
              <span className="text-[10px] font-black uppercase tracking-wider block opacity-75">Pontuação IGP</span>
              <span className="text-4xl font-black font-mono tracking-tight">{metrics.igpScore}</span>
              <span className="text-[10px] font-bold block">/ 100 pts</span>
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider block">Classificação</span>
              <span className="text-lg font-extrabold block">{metrics.igpClassification}</span>
              <span className="text-[11px] font-medium opacity-90 block">CV: {metrics.cvPercent}% | Aceitáveis: {metrics.acceptablePercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-stone-500 text-xs font-bold">
            <span>Talhões Avaliados</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-stone-900 dark:text-white font-mono">{(fields || []).length}</p>
          <p className="text-[11px] text-stone-500">{totalAreaHa.toFixed(1)} ha mapeados</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-stone-500 text-xs font-bold">
            <span>Falhas (%)</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-stone-900 dark:text-white font-mono">{metrics.skipsPercent}%</p>
          <p className="text-[11px] text-stone-500">Meta: &lt; 5.0%</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-stone-500 text-xs font-bold">
            <span>Duplos (%)</span>
            <Layers className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-stone-900 dark:text-white font-mono">{metrics.doublesPercent}%</p>
          <p className="text-[11px] text-stone-500">Meta: &lt; 5.0%</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-stone-500 text-xs font-bold">
            <span>População Real</span>
            <Sprout className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
            {metrics.realPopulationPerHa.toLocaleString('pt-BR')}
          </p>
          <p className="text-[11px] text-stone-500">Alvo: {metrics.targetPopulationPerHa.toLocaleString('pt-BR')} p/ha</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-1 col-span-2 sm:col-span-1">
          <div className="flex justify-between items-center text-stone-500 text-xs font-bold">
            <span>Velocidade Média</span>
            <Gauge className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-stone-900 dark:text-white font-mono">
            {activeConfig ? activeConfig.targetSpeedKmH : 6.5} km/h
          </p>
          <p className="text-[11px] text-emerald-600 font-bold">Faixa Ideal (5.5 - 7.5 km/h)</p>
        </div>
      </div>

      {/* Loss Simulator Quick Card & Diagnostics Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Economic Loss Preview */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-4 lg:col-span-1 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                Simulador Exclusivo
              </span>
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-black text-stone-900 dark:text-white">Projeção de Perda Econômica</h3>
            <p className="text-xs text-stone-500">
              Impacto financeiro estimado devido a falhas, duplos e variação no espaçamento entre sementes no campo.
            </p>
          </div>

          <div className="bg-stone-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-stone-200 dark:border-zinc-700 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-stone-600 dark:text-stone-300 font-medium">Perda Estimada por Hectare:</span>
              <span className="text-sm font-black text-rose-600 font-mono">R$ {lossSim.financialLossPerHa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / ha</span>
            </div>
            <div className="flex justify-between items-center border-t border-stone-200 dark:border-zinc-700 pt-2">
              <span className="text-xs text-stone-600 dark:text-stone-300 font-medium">Perda em Sacas ({lossSim.crop}):</span>
              <span className="text-sm font-black text-stone-900 dark:text-white font-mono">{lossSim.yieldLossScHa} sc/ha ({lossSim.yieldLossPercent}%)</span>
            </div>
            <div className="flex justify-between items-center border-t border-stone-200 dark:border-zinc-700 pt-2">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200">Prejuízo Total na Área ({lossSim.fieldAreaHa} ha):</span>
              <span className="text-base font-black text-rose-700 dark:text-rose-400 font-mono">R$ {lossSim.totalFinancialLoss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('simulator')}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Abrir Simulador Interativo
          </button>
        </div>

        {/* Planter Diagnostic Rules */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
                <Tractor className="w-5 h-5 text-emerald-600" />
                Diagnóstico Automático de Regulagem da Plantadeira
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Regras agronômicas automatizadas detectando possíveis causas e correções em tempo real sem dependência de internet.
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('diagnostic')}
              className="text-xs font-extrabold text-emerald-600 hover:text-emerald-500 underline"
            >
              Ver Tudo
            </button>
          </div>

          {diagnostics.length === 0 ? (
            <div className="p-8 text-center bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">Semeadura em Excelentes Condições!</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Os parâmetros de distribuição, profundidade e velocidade estão dentro das metas de alta produtividade.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {diagnostics.map((diag, i) => (
                <div key={i} className="p-4 rounded-2xl bg-stone-50 dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {diag.symptom}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      diag.severity === 'Alta' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      Prioridade {diag.severity}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-500 block">Possíveis Causas:</span>
                      <ul className="list-disc list-inside text-stone-700 dark:text-stone-300 space-y-0.5">
                        {diag.possibleCauses.slice(0, 2).map((c, idx) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-600 block">Ações Recomendadas:</span>
                      <ul className="list-disc list-inside text-stone-700 dark:text-stone-300 space-y-0.5">
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

      {/* Field List Overview Cards */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Talhões com Avaliação de Plantabilidade
          </h3>
          <button
            onClick={() => onNavigateTab('sampling')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
          >
            + Nova Amostragem
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(fields || []).filter(f => f && f.id).map(f => {
            const fieldSamplings = (samplings || []).filter(s => s?.fieldId === f.id);
            const fieldMetrics = calculatePlantabilityMetrics(fieldSamplings);

            return (
              <div
                key={f.id}
                onClick={() => onNavigateTab('digital_twin')}
                className="p-5 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 hover:bg-stone-100 dark:hover:bg-zinc-800 border border-stone-200 dark:border-zinc-700 transition-all cursor-pointer space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded">
                      {f.crop} • {f.cultivar}
                    </span>
                    <h4 className="text-sm font-black text-stone-900 dark:text-white mt-1">{f.fieldCode}</h4>
                    <p className="text-xs text-stone-500">{f.farmName} ({f.areaHa} ha)</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-xl text-xs font-black ${fieldMetrics.igpColorClass}`}>
                    IGP {fieldMetrics.igpScore}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-stone-200 dark:border-zinc-700 font-mono">
                  <div>
                    <span className="text-[10px] text-stone-500 block uppercase">Aceitáveis</span>
                    <span className="font-bold text-emerald-600">{fieldMetrics.acceptablePercent}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block uppercase">Falhas</span>
                    <span className="font-bold text-amber-600">{fieldMetrics.skipsPercent}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block uppercase">Duplos</span>
                    <span className="font-bold text-sky-600">{fieldMetrics.doublesPercent}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
