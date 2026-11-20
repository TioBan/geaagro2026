import React from 'react';
import {
  Plus,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Microscope,
  Wrench,
} from 'lucide-react';
import { CollectionPoint, WaterAnalysisRecord } from '../../types/waterAnalysis';
import {
  COLLECTION_POINT_TYPE_LABELS,
  EMITTER_RISK_META,
  IGA_META,
  WaterAnalysisSubTab,
} from './waterConstants';

interface WaterDashboardIgaViewProps {
  hasAnalyses: boolean;
  analysis: WaterAnalysisRecord;
  point: CollectionPoint;
  onCreateAnalysis: () => void;
  onNavigateSubTab: (tab: WaterAnalysisSubTab) => void;
}

interface CriticalParamItem {
  id: string;
  label: string;
  value: string;
  unit: string;
  reference: string;
  status: 'ok' | 'warn' | 'bad';
  statusText: string;
}

export const WaterDashboardIgaView: React.FC<WaterDashboardIgaViewProps> = ({
  hasAnalyses,
  analysis,
  point,
  onCreateAnalysis,
  onNavigateSubTab,
}) => {
  if (!hasAnalyses) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 sm:p-10 text-center">
        <div className="w-10 h-10 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto mb-3">
          <Droplets className="w-5 h-5" />
        </div>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
          Nenhuma análise de água cadastrada
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto mt-1.5 leading-relaxed">
          Registre os laudos físico-químicos e microbiológicos dos seus mananciais para calcular o IGA,
          enquadramento CONAMA 357, diretrizes FAO 29 e plano de tratamento.
        </p>
        <div className="mt-5 flex items-center justify-center">
          <button
            type="button"
            onClick={onCreateAnalysis}
            className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Cadastrar Primeira Análise
          </button>
        </div>
      </div>
    );
  }

  const igaScore = analysis.calculated.igaScore;
  const igaMeta = IGA_META[analysis.calculated.igaClassification];
  const emitterMeta = EMITTER_RISK_META[analysis.calculated.emitterCloggingRisk];

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (Math.max(0, Math.min(100, igaScore)) / 100) * circumference;

  const ecDsM = analysis.physical.electricalConductivityMicroS / 1000;
  const ph = analysis.chemical.ph;
  const sar = analysis.calculated.sar;
  const hco3 = analysis.chemical.bicarbonatesHco3MgL;
  const fe = analysis.chemical.ironFeMgL;
  const ecoli = analysis.biological.escherichiaColiNmp100ml;

  const criticalParams: CriticalParamItem[] = [
    {
      id: 'ph',
      label: 'pH da Água',
      value: ph.toFixed(2),
      unit: 'pH',
      reference: 'Ideal: 6,0 – 7,5',
      status: ph >= 6.0 && ph <= 7.5 ? 'ok' : ph >= 5.5 && ph <= 8.5 ? 'warn' : 'bad',
      statusText: ph >= 6.0 && ph <= 7.5 ? 'Adequado' : ph < 6.0 ? 'Ácido' : 'Alcalino',
    },
    {
      id: 'ec',
      label: 'Condutividade Elétrica',
      value: ecDsM.toFixed(2),
      unit: 'dS/m',
      reference: `${analysis.physical.electricalConductivityMicroS} µS/cm (Ideal < 0,7)`,
      status: ecDsM < 0.7 ? 'ok' : ecDsM <= 3.0 ? 'warn' : 'bad',
      statusText: ecDsM < 0.7 ? 'Baixa salinidade' : ecDsM <= 3.0 ? 'Restrição moderada' : 'Salinidade severa',
    },
    {
      id: 'sar',
      label: 'Relação de Sódio (RAS)',
      value: sar.toFixed(2),
      unit: 'RAS',
      reference: `Classe ${analysis.calculated.salinityClass}-${analysis.calculated.sodicityClass} (Ideal < 3,0)`,
      status: sar < 3 ? 'ok' : sar <= 9 ? 'warn' : 'bad',
      statusText: sar < 3 ? 'Baixo sódio' : sar <= 9 ? 'Atenção estrutural' : 'Risco sódico alto',
    },
    {
      id: 'hco3',
      label: 'Bicarbonatos (HCO₃⁻)',
      value: String(hco3),
      unit: 'mg/L',
      reference: 'Ideal < 90 mg/L (gotejo)',
      status: hco3 < 90 ? 'ok' : hco3 <= 200 ? 'warn' : 'bad',
      statusText: hco3 < 90 ? 'Baixa alcalinidade' : hco3 <= 200 ? 'Risco incrustante' : 'Alta alcalinidade',
    },
    {
      id: 'fe',
      label: 'Ferro Total (Fe)',
      value: fe.toFixed(2),
      unit: 'mg/L',
      reference: 'Ideal < 0,20 mg/L',
      status: fe < 0.2 ? 'ok' : fe <= 1.5 ? 'warn' : 'bad',
      statusText: fe < 0.2 ? 'Sem obstrução' : fe <= 1.5 ? 'Risco moderado' : 'Entupimento severo',
    },
    {
      id: 'ecoli',
      label: 'Escherichia coli',
      value: String(ecoli),
      unit: 'NMP/100mL',
      reference: 'CONAMA Cl. 1 ≤ 200',
      status: ecoli === 0 ? 'ok' : ecoli <= 200 ? 'warn' : 'bad',
      statusText: ecoli === 0 ? 'Ausente' : ecoli <= 200 ? 'Dentro da Cl. 1' : 'Acima do limite Cl. 1',
    },
  ];

  const renderStatusIndicator = (status: CriticalParamItem['status'], text: string) => {
    if (status === 'ok') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          {text}
        </span>
      );
    }
    if (status === 'warn') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {text}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 dark:text-rose-400">
        <XCircle className="w-3.5 h-3.5 shrink-0" />
        {text}
      </span>
    );
  };

  const langelierLabel =
    analysis.calculated.langelierInterpretation === 'corrosiva'
      ? 'Corrosiva'
      : analysis.calculated.langelierInterpretation === 'incrustante'
      ? 'Incrustante'
      : 'Balanceada';

  const infiltrationLabel =
    analysis.calculated.infiltrationRisk === 'sem_restricao'
      ? 'Sem restrição'
      : analysis.calculated.infiltrationRisk === 'restricao_moderada'
      ? 'Restrição moderada'
      : 'Restrição severa';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Left column: IGA Score Gauge & Quick Actions */}
      <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Índice Geral da Água (IGA)
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                {point.name} • {COLLECTION_POINT_TYPE_LABELS[point.type]}
              </p>
            </div>
            <span className={`text-xs font-semibold ${igaMeta.textClass}`}>
              {igaMeta.label}
            </span>
          </div>

          <div className="flex items-center justify-center py-5">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  strokeWidth="8"
                  className="stroke-slate-100 dark:stroke-zinc-800"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className={`${igaMeta.strokeClass} transition-all duration-500`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-zinc-100">
                  {igaScore}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                  de 100 pts
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-zinc-800 pt-3 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Infiltração FAO 29</span>
              <span className="font-medium text-slate-900 dark:text-zinc-100">{infiltrationLabel}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Langelier (ISL)</span>
              <span className="font-medium text-slate-900 dark:text-zinc-100 tabular-nums">
                {analysis.calculated.langelierIndex >= 0 ? '+' : ''}
                {analysis.calculated.langelierIndex.toFixed(2)} ({langelierLabel})
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Risco Emissores</span>
              <span className={`font-medium ${emitterMeta.textClass}`}>{emitterMeta.label}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Carbonato Residual</span>
              <span className="font-medium text-slate-900 dark:text-zinc-100 tabular-nums">
                {analysis.calculated.rscMeqL.toFixed(2)} meq/L
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => onNavigateSubTab('interpretacao_agronomica')}
            className="flex-1 h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Microscope className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            Interpretação
          </button>
          <button
            type="button"
            onClick={() => onNavigateSubTab('assistente_correcao')}
            className="flex-1 h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Plano Correção
          </button>
        </div>
      </div>

      {/* Right column: 6 Critical Parameters Breakdown */}
      <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-between gap-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Painel de Parâmetros Críticos
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Amostra {analysis.sampleCode} • Coleta em {analysis.collectionDate}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateSubTab('laudo_oficial')}
            className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            Ver Laudo
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {criticalParams.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 p-3.5 flex flex-col justify-between gap-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-600 dark:text-zinc-400 truncate">
                  {item.label}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-zinc-100">
                  {item.value}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {item.unit}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200/80 dark:border-zinc-800/80 flex flex-col gap-1">
                {renderStatusIndicator(item.status, item.statusText)}
                <span className="text-[11px] text-slate-500 dark:text-zinc-500 tabular-nums">
                  {item.reference}
                </span>
              </div>
            </div>
          ))}
        </div>

        {analysis.correctionPlan.diagnosedProblems.length > 0 && (
          <div className="border-t border-slate-100 dark:border-zinc-800 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300 min-w-0">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="truncate">
                {analysis.correctionPlan.diagnosedProblems.length}{' '}
                {analysis.correctionPlan.diagnosedProblems.length === 1
                  ? 'ponto de atenção diagnosticado'
                  : 'pontos de atenção diagnosticados'}
                : {analysis.correctionPlan.diagnosedProblems[0]}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateSubTab('assistente_correcao')}
              className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline shrink-0 inline-flex items-center gap-1 cursor-pointer"
            >
              Abrir recomendações
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
