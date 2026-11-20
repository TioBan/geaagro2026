import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sprout,
  Scale,
  FlaskConical,
  Grid2x2,
  Info,
} from 'lucide-react';
import { ComplianceStatus, WaterAnalysisRecord } from '../../types/waterAnalysis';
import {
  evaluateConamaCompliance,
  evaluateFaoAgronomicStandards,
  calculateFertigationCredits,
  calculateAcidNeutralization,
  evaluateFertigationCompatibility,
} from '../../utils/waterInterpretationUtils';
import { EMITTER_RISK_META } from './waterConstants';

interface WaterInterpretationViewProps {
  analysis: WaterAnalysisRecord;
}

type InterpretationMode = 'uso_agricola_fao29' | 'conama_357' | 'fertirrigacao' | 'ussl_riverside';
type ConamaCategoryFilter = 'todos' | 'microbiologico' | 'fisico' | 'quimico_inorganico' | 'metais_pesados';

const USSL_SALINITY_CLASSES = [
  {
    code: 'C1' as const,
    range: '< 250 µS/cm',
    title: 'Salinidade Baixa',
    desc: 'Adequada para a maioria das culturas e solos sem risco de salinização.',
  },
  {
    code: 'C2' as const,
    range: '250 – 750 µS/cm',
    title: 'Salinidade Média',
    desc: 'Utilizável com lixiviação moderada e culturas de tolerância média.',
  },
  {
    code: 'C3' as const,
    range: '750 – 2.250 µS/cm',
    title: 'Salinidade Alta',
    desc: 'Não indicada em solos com drenagem restrita; requer manejo salino.',
  },
  {
    code: 'C4' as const,
    range: '> 2.250 µS/cm',
    title: 'Salinidade Muito Alta',
    desc: 'Uso restrito a solos muito permeáveis, drenagem plena e culturas tolerantes.',
  },
];

const USSL_SODICITY_CLASSES = [
  {
    code: 'S1' as const,
    range: 'RAS ≤ 10',
    title: 'Sodicidade Baixa',
    desc: 'Baixo risco de acúmulo de sódio trocável na maior parte dos solos.',
  },
  {
    code: 'S2' as const,
    range: 'RAS 10 – 18',
    title: 'Sodicidade Média',
    desc: 'Risco moderado em solos de textura fina com alta CTC; gessagem recomendada.',
  },
  {
    code: 'S3' as const,
    range: 'RAS 18 – 26',
    title: 'Sodicidade Alta',
    desc: 'Alto risco de dispersão de argilas; exige drenagem, matéria orgânica e Ca solúvel.',
  },
  {
    code: 'S4' as const,
    range: 'RAS > 26',
    title: 'Sodicidade Muito Alta',
    desc: 'Inadequada para irrigação convencional devido à impermeabilização do solo.',
  },
];

const FERTIGATION_LAMINA_PRESETS = [20, 50, 100, 150];

export const WaterInterpretationView: React.FC<WaterInterpretationViewProps> = ({ analysis }) => {
  const [mode, setMode] = useState<InterpretationMode>('uso_agricola_fao29');
  const [conamaCategory, setConamaCategory] = useState<ConamaCategoryFilter>('todos');
  const [laminaMm, setLaminaMm] = useState<number>(100);

  const conamaSummary = useMemo(() => evaluateConamaCompliance(analysis), [analysis]);
  const faoSummary = useMemo(() => evaluateFaoAgronomicStandards(analysis), [analysis]);
  const fertigationCredits = useMemo(
    () => calculateFertigationCredits(analysis, laminaMm),
    [analysis, laminaMm]
  );
  const acidPlan = useMemo(() => calculateAcidNeutralization(analysis, 35), [analysis]);
  const compatibilityAlerts = useMemo(
    () => evaluateFertigationCompatibility(analysis),
    [analysis]
  );

  const filteredConamaParams = useMemo(() => {
    if (conamaCategory === 'todos') return conamaSummary.parameters;
    return conamaSummary.parameters.filter((p) => p.category === conamaCategory);
  }, [conamaSummary.parameters, conamaCategory]);

  const ecDsM = analysis.physical.electricalConductivityMicroS / 1000;
  const emitterMeta = EMITTER_RISK_META[analysis.calculated.emitterCloggingRisk];

  const renderComplianceBadge = (status: ComplianceStatus) => {
    if (status === 'conforme') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          Conforme
        </span>
      );
    }
    if (status === 'atencao') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          Atenção
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 dark:text-rose-400">
        <XCircle className="w-3.5 h-3.5 shrink-0" />
        Inconforme
      </span>
    );
  };

  const renderFaoRestriction = (level: 'nenhuma' | 'moderada' | 'severa') => {
    if (level === 'nenhuma') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          Nenhuma
        </span>
      );
    }
    if (level === 'moderada') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          Moderada
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 dark:text-rose-400">
        <XCircle className="w-3.5 h-3.5 shrink-0" />
        Severa
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Mode Segmented Selector */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-1.5 flex items-center gap-1 overflow-x-auto">
        {(
          [
            { id: 'uso_agricola_fao29', label: 'Uso Agrícola (FAO 29)', icon: Sprout },
            { id: 'conama_357', label: 'Resolução CONAMA 357', icon: Scale },
            { id: 'fertirrigacao', label: 'Calculadora Fertirrigação', icon: FlaskConical },
            { id: 'ussl_riverside', label: 'Diagrama USSL Riverside', icon: Grid2x2 },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = mode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMode(tab.id)}
              className={`h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                active
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 4-KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Salinidade (CEw)
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-bold tabular-nums text-slate-900 dark:text-zinc-100">
              {ecDsM.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">dS/m</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            {analysis.physical.electricalConductivityMicroS} µS/cm • Classe {analysis.calculated.salinityClass}
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Sodicidade (RAS)
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-bold tabular-nums text-slate-900 dark:text-zinc-100">
              {analysis.calculated.sar.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              ({analysis.calculated.sodicityClass})
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            % Na: {analysis.calculated.sodiumPercentage.toFixed(1)}% • RSC: {analysis.calculated.rscMeqL.toFixed(2)}
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Índice de Langelier (ISL)
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-bold tabular-nums text-slate-900 dark:text-zinc-100">
              {analysis.calculated.langelierIndex >= 0 ? '+' : ''}
              {analysis.calculated.langelierIndex.toFixed(2)}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 capitalize">
            Água {analysis.calculated.langelierInterpretation}
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Risco em Emissores
          </span>
          <div className={`mt-1 text-lg font-bold ${emitterMeta.textClass}`}>
            {emitterMeta.label}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            Turbidez {analysis.physical.turbidityNtu} NTU • Fe {analysis.chemical.ironFeMgL} mg/L
          </span>
        </div>
      </div>

      {/* MODE 1: FAO 29 */}
      {mode === 'uso_agricola_fao29' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Enquadramento Agronômico FAO 29 (Ayers & Westcot)
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Avaliação de restrição de uso para salinidade osmótica, infiltração, toxidez iônica e obstrução.
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100 dark:border-zinc-800">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Restrição Global</span>
                {renderFaoRestriction(faoSummary.overallRestriction)}
              </div>
              <div className="pl-4 border-l border-slate-200 dark:border-zinc-800">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Fração Lixiviação</span>
                <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-zinc-100">
                  {faoSummary.leachingFractionRequired.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    <th className="py-2.5 px-3.5">Parâmetro</th>
                    <th className="py-2.5 px-3.5">Medido</th>
                    <th className="py-2.5 px-3.5">Restrição</th>
                    <th className="py-2.5 px-3.5 hidden md:table-cell">Faixas FAO 29 (Nenhuma / Mod. / Sev.)</th>
                    <th className="py-2.5 px-3.5">Impacto e Manejo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                  {faoSummary.parameters.map((row) => (
                    <tr key={row.key} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40">
                      <td className="py-3 px-3.5 align-top">
                        <div className="font-medium text-slate-900 dark:text-zinc-100">{row.parameterName}</div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400">{row.category}</div>
                      </td>
                      <td className="py-3 px-3.5 align-top font-semibold tabular-nums text-slate-900 dark:text-zinc-100 whitespace-nowrap">
                        {row.measuredValue}
                      </td>
                      <td className="py-3 px-3.5 align-top whitespace-nowrap">
                        {renderFaoRestriction(row.currentRestriction)}
                      </td>
                      <td className="py-3 px-3.5 align-top hidden md:table-cell text-[11px] text-slate-600 dark:text-zinc-400 tabular-nums">
                        <div>Nenhuma: {row.noRestrictionRange}</div>
                        <div>Moderada: {row.moderateRestrictionRange}</div>
                        <div>Severa: {row.severeRestrictionRange}</div>
                      </td>
                      <td className="py-3 px-3.5 align-top max-w-md">
                        <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">{row.agronomicImpact}</p>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                          Manejo: {row.managementTip}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: CONAMA 357 */}
      {mode === 'conama_357' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(
              [
                {
                  key: 'classe_1' as const,
                  title: 'Classe 1 — Hortaliças Cruas',
                  desc: 'Hortaliças consumidas cruas e frutas rentes ao solo sem película.',
                  suitable: conamaSummary.suitability.rawVegetables,
                  stats: conamaSummary.complianceByClass.classe_1,
                },
                {
                  key: 'classe_2' as const,
                  title: 'Classe 2 — Frutíferas e Parques',
                  desc: 'Hortaliças em geral, frutíferas e áreas com contato direto.',
                  suitable: conamaSummary.suitability.fruitTreesAndParks,
                  stats: conamaSummary.complianceByClass.classe_2,
                },
                {
                  key: 'classe_3' as const,
                  title: 'Classe 3 — Grãos e Forrageiras',
                  desc: 'Culturas arbóreas, cerealíferas, pastagens e dessedentação.',
                  suitable: conamaSummary.suitability.grainsAndForages,
                  stats: conamaSummary.complianceByClass.classe_3,
                },
              ]
            ).map((cls) => {
              const isRecommended = conamaSummary.recommendedClass === cls.key;
              return (
                <div
                  key={cls.key}
                  className={`bg-white dark:bg-zinc-900 border rounded-xl p-4 ${
                    isRecommended
                      ? 'border-emerald-500 dark:border-emerald-600'
                      : 'border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                      {cls.title}
                    </h4>
                    <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-zinc-100">
                      {cls.stats.compliancePercentage}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    {cls.desc}
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-zinc-400 tabular-nums">
                      {cls.stats.compliantCount}/{cls.stats.totalEvaluated} parâmetros conformes
                    </span>
                    {cls.suitable ? (
                      <span className="inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Apta
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-medium text-rose-700 dark:text-rose-400">
                        <XCircle className="w-3.5 h-3.5" />
                        Restrita
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {conamaSummary.criticalDeviations.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-400 mb-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Desvios críticos frente aos limites CONAMA 357 ({conamaSummary.criticalDeviations.length})
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {conamaSummary.criticalDeviations.map((dev, idx) => (
                  <div
                    key={`${dev.parameter}-${idx}`}
                    className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 px-3 py-2 text-xs flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <span className="font-medium text-slate-900 dark:text-zinc-100 block truncate">
                        {dev.parameter}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 block truncate">
                        {dev.description}
                      </span>
                    </div>
                    <div className="text-right shrink-0 tabular-nums">
                      <span className="font-semibold text-rose-700 dark:text-rose-400 block">
                        {dev.value}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                        VMP: {dev.limit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter + CONAMA Table */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                Tabela de Valores Máximos Permitidos (VMP — CONAMA 357/2005)
              </span>
              <div className="flex flex-wrap items-center gap-1">
                {(
                  [
                    { id: 'todos', label: 'Todos' },
                    { id: 'microbiologico', label: 'Microbiológico' },
                    { id: 'fisico', label: 'Físico' },
                    { id: 'quimico_inorganico', label: 'Químico' },
                    { id: 'metais_pesados', label: 'Metais Pesados' },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setConamaCategory(cat.id)}
                    className={`h-7 px-2.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      conamaCategory === cat.id
                        ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    <th className="py-2.5 px-3.5">Parâmetro</th>
                    <th className="py-2.5 px-3.5">Medido</th>
                    <th className="py-2.5 px-3.5">Classe 1</th>
                    <th className="py-2.5 px-3.5">Classe 2</th>
                    <th className="py-2.5 px-3.5">Classe 3</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                  {filteredConamaParams.map((row) => (
                    <tr key={row.key} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40">
                      <td className="py-2.5 px-3.5">
                        <div className="font-medium text-slate-900 dark:text-zinc-100">{row.parameterName}</div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400">{row.notes}</div>
                      </td>
                      <td className="py-2.5 px-3.5 font-semibold tabular-nums text-slate-900 dark:text-zinc-100 whitespace-nowrap">
                        {row.measuredValue} {row.unit}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">{row.class1Limit}</div>
                        {renderComplianceBadge(row.class1Status)}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">{row.class2Limit}</div>
                        {renderComplianceBadge(row.class2Status)}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">{row.class3Limit}</div>
                        {renderComplianceBadge(row.class3Status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: FERTIRRIGAÇÃO */}
      {mode === 'fertirrigacao' && (
        <div className="space-y-4">
          {/* Lamina Control + Nutrient Credits */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Aporte Nutricional da Água de Irrigação
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Calcule o crédito de nutrientes dissolvidos na água para descontar do programa de fertirrigação.
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {FERTIGATION_LAMINA_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setLaminaMm(preset)}
                    className={`h-7 px-2.5 rounded-md text-xs font-medium tabular-nums transition-colors cursor-pointer ${
                      laminaMm === preset
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {preset} mm
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <label htmlFor="fertigation-lamina" className="text-xs font-medium text-slate-700 dark:text-zinc-300 shrink-0">
                Lâmina acumulada no ciclo:
              </label>
              <input
                id="fertigation-lamina"
                type="range"
                min={10}
                max={200}
                step={5}
                value={laminaMm}
                onChange={(e) => setLaminaMm(Number(e.target.value))}
                className="flex-1 accent-emerald-600 cursor-pointer"
              />
              <span className="text-xs font-semibold tabular-nums text-slate-900 dark:text-zinc-100 shrink-0">
                {laminaMm} mm ({(laminaMm * 10).toLocaleString('pt-BR')} m³/ha)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    <th className="py-2 pr-3">Nutriente</th>
                    <th className="py-2 px-3">Teor na Água</th>
                    <th className="py-2 px-3">kg / 1.000 m³</th>
                    <th className="py-2 px-3">Aporte em {laminaMm} mm</th>
                    <th className="py-2 pl-3">Equivalência Comercial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                  {fertigationCredits.map((row) => (
                    <tr key={row.element}>
                      <td className="py-2.5 pr-3 font-medium text-slate-900 dark:text-zinc-100">
                        {row.nutrientName}
                      </td>
                      <td className="py-2.5 px-3 tabular-nums text-slate-700 dark:text-zinc-300">
                        {row.concentrationMgL} mg/L
                      </td>
                      <td className="py-2.5 px-3 tabular-nums text-slate-700 dark:text-zinc-300">
                        {row.kgPer1000m3} kg
                      </td>
                      <td className="py-2.5 px-3 font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                        {row.kgPerHectareAtLamina} kg/ha
                      </td>
                      <td className="py-2.5 pl-3 text-slate-600 dark:text-zinc-400">
                        {row.commercialFertilizerEquivalent}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Acid Neutralization */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Acidificação e Neutralização de Bicarbonatos (HCO₃⁻)
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Alvo residual de {acidPlan.targetResidualHco3MgL} mg/L HCO₃⁻ (pH final estimado: {acidPlan.estimatedFinalPh.toFixed(1)}).
                </p>
              </div>
              <div className="text-xs text-slate-600 dark:text-zinc-300 tabular-nums">
                Atual: <strong>{acidPlan.currentHco3MgL} mg/L</strong> ({acidPlan.currentHco3MeqL} meq/L) • Neutralizar:{' '}
                <strong>{acidPlan.hco3ToNeutralizeMeqL} meq/L</strong>
              </div>
            </div>

            {acidPlan.hco3ToNeutralizeMgL <= 0 ? (
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-slate-50 dark:bg-zinc-950 p-3 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Os bicarbonatos já estão abaixo do limiar de {acidPlan.targetResidualHco3MgL} mg/L. Não é necessária acidificação corretiva.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {acidPlan.acidDoses.map((acid) => (
                  <div
                    key={acid.formula}
                    className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-3.5 space-y-2"
                  >
                    <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                      {acid.acidName}
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">Dose por m³</span>
                      <span className="text-base font-bold tabular-nums text-slate-900 dark:text-zinc-100">
                        {acid.volumeMlM3} mL/m³
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-xs border-t border-slate-200/80 dark:border-zinc-800 pt-2">
                      <span className="text-slate-500 dark:text-zinc-400">Em 100 m³</span>
                      <span className="font-medium tabular-nums text-slate-800 dark:text-zinc-200">
                        {acid.volumeLPer100m3} L
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-500 dark:text-zinc-400">Aporte de {acid.nutrientAddedType}</span>
                      <span className="font-medium tabular-nums text-emerald-700 dark:text-emerald-400">
                        +{acid.nutrientAddedValue} g/m³
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tanques A/B/C & Compatibility Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-2.5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Separação de Tanques (A / B / C)
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                <div className="py-2">
                  <div className="font-semibold text-slate-900 dark:text-zinc-100">Tanque A — Cálcio e Quelatos</div>
                  <p className="text-slate-600 dark:text-zinc-400 mt-0.5">
                    Nitrato de Cálcio, Nitrato de Potássio e Ferro Quelatado (Fe-EDDHA / Fe-DTPA).
                  </p>
                </div>
                <div className="py-2">
                  <div className="font-semibold text-slate-900 dark:text-zinc-100">Tanque B — Fosfatos e Sulfatos</div>
                  <p className="text-slate-600 dark:text-zinc-400 mt-0.5">
                    MAP, MKP, Sulfato de Magnésio, Sulfato de Potássio e demais micronutrientes.
                  </p>
                </div>
                <div className="py-2">
                  <div className="font-semibold text-slate-900 dark:text-zinc-100">Tanque C — Ácidos e Correção de pH</div>
                  <p className="text-slate-600 dark:text-zinc-400 mt-0.5">
                    Injeção dedicada de Ácido Fosfórico, Nítrico ou Sulfúrico para manter pH entre 5,8 e 6,2.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-2.5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Alertas de Compatibilidade Química
              </h3>
              {compatibilityAlerts.length === 0 ? (
                <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-slate-50 dark:bg-zinc-950 p-3 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Nenhum risco crítico de precipitação química detectado para esta amostra.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {compatibilityAlerts.map((alert, idx) => (
                    <div
                      key={`${alert.title}-${idx}`}
                      className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-3 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900 dark:text-zinc-100">
                          {alert.title}
                        </span>
                        <span
                          className={`text-[11px] font-medium uppercase ${
                            alert.severity === 'alto'
                              ? 'text-rose-700 dark:text-rose-400'
                              : 'text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          Risco {alert.severity}
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-600 dark:text-zinc-400">
                        {alert.chemicalEquation}
                      </div>
                      <p className="text-slate-700 dark:text-zinc-300">{alert.diagnosisExplanation}</p>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                        Ação preventiva: {alert.preventiveAction}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODE 4: USSL RIVERSIDE */}
      {mode === 'ussl_riverside' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Classificação USSL Riverside (US Salinity Laboratory)
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Enquadramento combinado da salinidade (C1–C4) e sodicidade (S1–S4) da amostra.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-500 dark:text-zinc-400">Classe da amostra:</span>
              <span className="text-base font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                {analysis.calculated.salinityClass}–{analysis.calculated.sodicityClass}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Classes de Salinidade (C1 a C4)
              </h4>
              <div className="space-y-2">
                {USSL_SALINITY_CLASSES.map((cls) => {
                  const active = analysis.calculated.salinityClass === cls.code;
                  return (
                    <div
                      key={cls.code}
                      className={`rounded-lg border p-3 text-xs ${
                        active
                          ? 'border-emerald-500 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900 dark:text-zinc-100">
                          {cls.code} — {cls.title}
                        </span>
                        <span className="text-[11px] tabular-nums text-slate-500 dark:text-zinc-400">
                          {cls.range}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1">{cls.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Classes de Sodicidade (S1 a S4)
              </h4>
              <div className="space-y-2">
                {USSL_SODICITY_CLASSES.map((cls) => {
                  const active = analysis.calculated.sodicityClass === cls.code;
                  return (
                    <div
                      key={cls.code}
                      className={`rounded-lg border p-3 text-xs ${
                        active
                          ? 'border-emerald-500 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900 dark:text-zinc-100">
                          {cls.code} — {cls.title}
                        </span>
                        <span className="text-[11px] tabular-nums text-slate-500 dark:text-zinc-400">
                          {cls.range}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1">{cls.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex items-start gap-2.5 text-xs">
            <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <div className="text-slate-700 dark:text-zinc-300 leading-relaxed">
              <strong>Síntese {analysis.calculated.salinityClass}–{analysis.calculated.sodicityClass}:</strong>{' '}
              CEw de <span className="tabular-nums font-medium">{analysis.physical.electricalConductivityMicroS} µS/cm</span>,
              RAS de <span className="tabular-nums font-medium">{analysis.calculated.sar.toFixed(2)}</span>,
              Carbonato Residual de Sódio (RSC) de{' '}
              <span className="tabular-nums font-medium">{analysis.calculated.rscMeqL.toFixed(2)} meq/L</span> e
              percentual de sódio de{' '}
              <span className="tabular-nums font-medium">{analysis.calculated.sodiumPercentage.toFixed(1)}%</span>.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
