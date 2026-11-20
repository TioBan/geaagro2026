import React, { useMemo } from 'react';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  ShieldCheck,
  ArrowUpRight,
  Radar,
  Bug,
} from 'lucide-react';
import { PestField, PestTab, PopulationTrend } from '../../types/pests';
import {
  PEST_SPECIES_CATALOG,
  calculatePopulationTrend,
  checkPhenologyAlert,
} from '../../data/pestsData';

interface MipDashboardAndRadarProps {
  mode: 'dashboard' | 'radar';
  fields: PestField[];
  currentField: PestField | null;
  onUpdateFieldStage: (fieldId: string, stage: string) => void;
  onOpenFieldModal: () => void;
  onOpenInspectionModal: (pestId?: string) => void;
  onOpenManagementModal: () => void;
  onNavigateTab: (tab: PestTab) => void;
  onOpenPestInBank: (pestId: string) => void;
}

const formatDatePt = (iso?: string) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
};

export const MipDashboardAndRadar: React.FC<MipDashboardAndRadarProps> = ({
  mode,
  fields,
  currentField,
  onUpdateFieldStage,
  onOpenFieldModal,
  onOpenInspectionModal,
  onOpenManagementModal,
  onNavigateTab,
  onOpenPestInBank,
}) => {
  const pestMap = useMemo(
    () => new Map(PEST_SPECIES_CATALOG.map((p) => [p.id, p])),
    []
  );

  // Relevant pests for the current field (hosts match OR already inspected)
  const radarSpeciesAnalysis = useMemo(() => {
    if (!currentField) return [];
    const inspectedIds = new Set(currentField.inspections.map((i) => i.pestId));
    const cropLower = currentField.crop.toLowerCase();

    const relevantPests = PEST_SPECIES_CATALOG.filter(
      (p) =>
        inspectedIds.has(p.id) ||
        p.hosts.some((h) => h.toLowerCase() === cropLower) ||
        p.otherHosts?.some((oh) => oh.toLowerCase() === cropLower)
    );

    return relevantPests
      .map((pest) => {
        const pestInspections = currentField.inspections
          .filter((i) => i.pestId === pest.id)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const latest = pestInspections[0] || null;
        const trend: PopulationTrend = calculatePopulationTrend(
          currentField.inspections,
          pest.id
        );
        const phenologyRisk = checkPhenologyAlert(
          pest,
          currentField.currentPhenologicalStage
        );

        let riskStatus: 'Crítico' | 'Atenção' | 'Controlado' | 'Sem registro' = 'Sem registro';
        if (latest) {
          if (latest.severity === 'Alta' || (trend === 'Crescente' && phenologyRisk)) {
            riskStatus = 'Crítico';
          } else if (
            latest.severity === 'Média' ||
            trend === 'Crescente' ||
            phenologyRisk
          ) {
            riskStatus = 'Atenção';
          } else {
            riskStatus = 'Controlado';
          }
        } else if (phenologyRisk) {
          riskStatus = 'Atenção';
        }

        return {
          pest,
          inspectionsCount: pestInspections.length,
          latest,
          trend,
          phenologyRisk,
          riskStatus,
        };
      })
      .sort((a, b) => {
        const weight = { Crítico: 3, Atenção: 2, Controlado: 1, 'Sem registro': 0 };
        const diff = weight[b.riskStatus] - weight[a.riskStatus];
        if (diff !== 0) return diff;
        return b.inspectionsCount - a.inspectionsCount;
      });
  }, [currentField]);

  const avgInfestation = useMemo(() => {
    if (!currentField || currentField.inspections.length === 0) return 0;
    const sum = currentField.inspections.reduce(
      (acc, i) => acc + (i.infestationPercentage || 0),
      0
    );
    return Math.round(sum / currentField.inspections.length);
  }, [currentField]);

  const criticalAlerts = useMemo(
    () => radarSpeciesAnalysis.filter((item) => item.phenologyRisk || item.riskStatus === 'Crítico'),
    [radarSpeciesAnalysis]
  );

  // Empty state when no field exists
  if (!currentField) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center mx-auto mb-3">
          {mode === 'radar' ? <Radar className="w-5 h-5" /> : <Bug className="w-5 h-5" />}
        </div>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
          Nenhum talhão monitorado cadastrado
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
          Cadastre um talhão com cultura e estádio fenológico para acompanhar inspeções, armadilhas,
          curvas populacionais e alertas cruzados no Radar Fitossanitário.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={onOpenFieldModal}
            className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar primeiro talhão</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('banco_pragas')}
            className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <span>Explorar banco de pragas</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // DASHBOARD MIP
  // =========================================================================
  if (mode === 'dashboard') {
    const recentInspections = [...currentField.inspections]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);

    const lastManagement = [...currentField.managements].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

    return (
      <div className="space-y-4">
        {/* Faixa de KPIs com divisórias finas */}
        <section
          aria-label="Indicadores do talhão"
          className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800"
        >
          <div className="p-4">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              Inspeções na safra
            </span>
            <div className="text-xl font-semibold text-slate-900 dark:text-zinc-100 mt-1 tabular-nums">
              {currentField.inspections.length}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              {fields.length} {fields.length === 1 ? 'talhão ativo' : 'talhões ativos'}
            </span>
          </div>

          <div className="p-4">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              Infestação média atual
            </span>
            <div
              className={`text-xl font-semibold mt-1 tabular-nums ${
                avgInfestation >= 20
                  ? 'text-red-600 dark:text-red-400'
                  : avgInfestation >= 10
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-900 dark:text-zinc-100'
              }`}
            >
              {avgInfestation}%
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              {criticalAlerts.length} {criticalAlerts.length === 1 ? 'alerta fenológico' : 'alertas fenológicos'}
            </span>
          </div>

          <div className="p-4">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              Armadilhas ativas
            </span>
            <div className="text-xl font-semibold text-slate-900 dark:text-zinc-100 mt-1 tabular-nums">
              {currentField.traps.length}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              {currentField.traps.reduce((s, t) => s + t.totalCaptured, 0)} capturas totais
            </span>
          </div>

          <div className="p-4">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              Aplicações de manejo
            </span>
            <div className="text-xl font-semibold text-emerald-700 dark:text-emerald-400 mt-1 tabular-nums">
              {currentField.managements.length}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 truncate block">
              {lastManagement ? `Última: ${formatDatePt(lastManagement.date)}` : 'Sem aplicações'}
            </span>
          </div>
        </section>

        {/* Grade operacional 8/4 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Últimas inspeções */}
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Últimas inspeções de campo
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {currentField.farmName} · {currentField.fieldName} ({currentField.crop})
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onOpenInspectionModal()}
                  className="h-8 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Inspeção</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('monitoramento')}
                  className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer whitespace-nowrap"
                >
                  Ver todas
                </button>
              </div>
            </div>

            {recentInspections.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
                Nenhuma inspeção registrada neste talhão. Clique em{' '}
                <strong className="font-medium text-slate-700 dark:text-zinc-200">Inspeção</strong>{' '}
                para iniciar o acompanhamento populacional.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                      <th className="py-2.5 px-4">Data</th>
                      <th className="py-2.5 px-4">Ponto</th>
                      <th className="py-2.5 px-4">Espécie</th>
                      <th className="py-2.5 px-4">Estágio</th>
                      <th className="py-2.5 px-4 text-right">Infestação</th>
                      <th className="py-2.5 px-4 text-right">Severidade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                    {recentInspections.map((insp) => {
                      const pest = pestMap.get(insp.pestId);
                      return (
                        <tr
                          key={insp.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          <td className="py-2.5 px-4 text-slate-600 dark:text-zinc-300 tabular-nums whitespace-nowrap">
                            {formatDatePt(insp.date)}
                          </td>
                          <td className="py-2.5 px-4 font-medium text-slate-800 dark:text-zinc-200 whitespace-nowrap">
                            {insp.pointCode}
                          </td>
                          <td className="py-2.5 px-4">
                            <button
                              type="button"
                              onClick={() => onOpenPestInBank(insp.pestId)}
                              className="text-left hover:underline font-medium text-slate-900 dark:text-zinc-100 cursor-pointer"
                            >
                              {pest?.commonName || insp.pestId}
                            </button>
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 dark:text-zinc-300 whitespace-nowrap">
                            {insp.stage}
                          </td>
                          <td className="py-2.5 px-4 text-right font-medium text-slate-900 dark:text-zinc-100 tabular-nums whitespace-nowrap">
                            {insp.infestationPercentage}%
                          </td>
                          <td className="py-2.5 px-4 text-right whitespace-nowrap">
                            <span
                              className={`font-medium ${
                                insp.severity === 'Alta'
                                  ? 'text-red-600 dark:text-red-400'
                                  : insp.severity === 'Média'
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-emerald-700 dark:text-emerald-400'
                              }`}
                            >
                              {insp.severity}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Ficha resumida do talhão e atalho Radar */}
          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl divide-y divide-slate-200 dark:divide-zinc-800">
            <div className="p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Contexto do talhão
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigateTab('radar')}
                  className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer whitespace-nowrap"
                >
                  <span>Abrir radar</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <dl className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500 dark:text-zinc-400">Cultura / Cultivar</dt>
                  <dd className="font-medium text-slate-900 dark:text-zinc-100 text-right truncate">
                    {currentField.crop} · {currentField.cultivar}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500 dark:text-zinc-400">Área monitorada</dt>
                  <dd className="font-medium text-slate-900 dark:text-zinc-100 tabular-nums">
                    {currentField.areaHa.toLocaleString('pt-BR')} ha
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500 dark:text-zinc-400">Data de plantio</dt>
                  <dd className="font-medium text-slate-900 dark:text-zinc-100 tabular-nums">
                    {formatDatePt(currentField.plantingDate)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <dt className="text-slate-500 dark:text-zinc-400">Estádio fenológico</dt>
                  <dd>
                    <input
                      type="text"
                      aria-label="Atualizar estádio fenológico"
                      value={currentField.currentPhenologicalStage}
                      onChange={(e) => onUpdateFieldStage(currentField.id, e.target.value)}
                      className="w-24 h-7 px-2 text-right bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-md text-xs font-semibold text-emerald-700 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </dd>
                </div>
              </dl>
            </div>

            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  Pragas em atenção fenológica ({criticalAlerts.length})
                </span>
              </div>
              {criticalAlerts.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Nenhuma sobreposição crítica para o estádio {currentField.currentPhenologicalStage}.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-zinc-800/80 text-xs">
                  {criticalAlerts.slice(0, 4).map((item) => (
                    <li key={item.pest.id} className="py-2 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => onOpenPestInBank(item.pest.id)}
                          className="font-medium text-slate-900 dark:text-zinc-100 hover:underline truncate block cursor-pointer"
                        >
                          {item.pest.commonName}
                        </button>
                        <span className="text-[11px] italic text-slate-500 dark:text-zinc-400 truncate block">
                          {item.pest.scientificName}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-semibold shrink-0 ${
                          item.riskStatus === 'Crítico'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {item.riskStatus}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RADAR FITOSSANITÁRIO INTEGRADO
  // =========================================================================
  const lastManagement = [...currentField.managements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];

  const decrescenteCount = radarSpeciesAnalysis.filter(
    (r) => r.inspectionsCount >= 2 && r.trend === 'Decrescente'
  ).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      {/* Matriz principal de espécies monitoradas e tendências */}
      <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Radar Fitossanitário Integrado
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Tendência populacional e cruzamento fenológico para {currentField.crop} em{' '}
              <strong className="font-medium text-slate-700 dark:text-zinc-200">
                {currentField.currentPhenologicalStage}
              </strong>
              .
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenInspectionModal()}
            className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova inspeção</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                <th className="py-2.5 px-4">Espécie</th>
                <th className="py-2.5 px-4">Tendência</th>
                <th className="py-2.5 px-4 text-right">Última leitura</th>
                <th className="py-2.5 px-4">Risco</th>
                <th className="py-2.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {radarSpeciesAnalysis.map((row) => (
                <tr
                  key={row.pest.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <td className="py-3 px-4 align-top">
                    <button
                      type="button"
                      onClick={() => onOpenPestInBank(row.pest.id)}
                      className="text-left hover:underline font-medium text-slate-900 dark:text-zinc-100 block cursor-pointer"
                    >
                      {row.pest.commonName}
                    </button>
                    <span className="text-[11px] italic text-slate-500 dark:text-zinc-400 block">
                      {row.pest.scientificName}
                    </span>
                    {row.phenologyRisk && (
                      <span className="text-[11px] text-amber-700 dark:text-amber-400 block mt-0.5">
                        Janela fenológica sensível ({currentField.currentPhenologicalStage})
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 align-top whitespace-nowrap">
                    {row.inspectionsCount >= 2 ? (
                      <span
                        className={`inline-flex items-center gap-1 font-medium ${
                          row.trend === 'Crescente'
                            ? 'text-red-600 dark:text-red-400'
                            : row.trend === 'Decrescente'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-slate-600 dark:text-zinc-300'
                        }`}
                      >
                        {row.trend === 'Crescente' ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : row.trend === 'Decrescente' ? (
                          <TrendingDown className="w-3.5 h-3.5" />
                        ) : (
                          <Minus className="w-3.5 h-3.5" />
                        )}
                        {row.trend}
                      </span>
                    ) : row.inspectionsCount === 1 ? (
                      <span className="text-slate-500 dark:text-zinc-400">1 leitura</span>
                    ) : (
                      <span className="text-slate-400 dark:text-zinc-500">Sem registros</span>
                    )}
                  </td>
                  <td className="py-3 px-4 align-top text-right tabular-nums whitespace-nowrap">
                    {row.latest ? (
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-zinc-100 block">
                          {row.latest.infestationPercentage}%
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                          {formatDatePt(row.latest.date)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-zinc-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 align-top whitespace-nowrap">
                    <span
                      className={`font-medium ${
                        row.riskStatus === 'Crítico'
                          ? 'text-red-600 dark:text-red-400'
                          : row.riskStatus === 'Atenção'
                            ? 'text-amber-600 dark:text-amber-400'
                            : row.riskStatus === 'Controlado'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-slate-400 dark:text-zinc-500'
                      }`}
                    >
                      {row.riskStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 align-top text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onOpenInspectionModal(row.pest.id)}
                      className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer whitespace-nowrap"
                    >
                      Inspecionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Painel Lateral de Alertas Cruzados e Último Manejo */}
      <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl divide-y divide-slate-200 dark:divide-zinc-800">
        {/* Interação Fenologia x Praga */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-zinc-100">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Interação fenologia × praga</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
            Cultura <strong className="font-medium text-slate-900 dark:text-zinc-100">{currentField.crop}</strong> no estádio{' '}
            <strong className="font-medium text-slate-900 dark:text-zinc-100">
              {currentField.currentPhenologicalStage}
            </strong>
            .
          </p>

          {criticalAlerts.length > 0 ? (
            <div className="space-y-2 text-xs">
              {criticalAlerts.slice(0, 3).map((item) => {
                const threshold = item.pest.actionThresholds[0];
                return (
                  <div
                    key={item.pest.id}
                    className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-900 dark:text-zinc-100">
                        {item.pest.commonName}
                      </span>
                      <span
                        className={`text-[11px] font-semibold ${
                          item.riskStatus === 'Crítico'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {item.riskStatus}
                      </span>
                    </div>
                    {threshold && (
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                        NDE: {threshold.threshold} {threshold.unit}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Sem sobreposição de fase crítica identificada para o estádio informado. Mantenha o
              monitoramento semanal de rotina.
            </p>
          )}
        </div>

        {/* Último Manejo Efetuado */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-zinc-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Último manejo efetuado</span>
            </div>
            <button
              type="button"
              onClick={onOpenManagementModal}
              className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer whitespace-nowrap"
            >
              Registrar
            </button>
          </div>

          {lastManagement ? (
            <div className="space-y-1 text-xs">
              <div className="font-medium text-slate-900 dark:text-zinc-100">
                {lastManagement.product}
              </div>
              <div className="text-slate-500 dark:text-zinc-400 tabular-nums">
                {formatDatePt(lastManagement.date)} · {lastManagement.type} · {lastManagement.dose}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                {lastManagement.equipment} · {lastManagement.climateConditions}
              </div>
              <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 pt-1">
                {decrescenteCount > 0
                  ? `Tendência decrescente observada em ${decrescenteCount} espécie(s) após manejo.`
                  : 'Registre nova inspeção pós-aplicação para avaliar eficácia populacional.'}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Nenhuma aplicação ou liberação registrada neste talhão até o momento.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
