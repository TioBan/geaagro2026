import React, { useMemo, useState } from 'react';
import { Plus, Trash2, ArrowUpRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { PestField } from '../../types/pests';
import { PEST_SPECIES_CATALOG, calculatePopulationTrend } from '../../data/pestsData';

interface MipOperationsTabsProps {
  mode: 'monitoramento' | 'mapa' | 'curvas' | 'manejo';
  currentField: PestField | null;
  onOpenFieldModal: () => void;
  onOpenInspectionModal: (pestId?: string) => void;
  onOpenTrapModal: () => void;
  onOpenManagementModal: () => void;
  onDeleteInspection: (id: string) => void;
  onDeleteTrap: (id: string) => void;
  onUpdateTrapCaptures: (id: string, delta: number) => void;
  onDeleteManagement: (id: string) => void;
  onOpenPestInBank: (pestId: string) => void;
}

const formatDatePt = (iso?: string) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
};

export const MipOperationsTabs: React.FC<MipOperationsTabsProps> = ({
  mode,
  currentField,
  onOpenFieldModal,
  onOpenInspectionModal,
  onOpenTrapModal,
  onOpenManagementModal,
  onDeleteInspection,
  onDeleteTrap,
  onUpdateTrapCaptures,
  onDeleteManagement,
  onOpenPestInBank,
}) => {
  const [monitoringSubView, setMonitoringSubView] = useState<'inspecoes' | 'armadilhas'>(
    'inspecoes'
  );
  const [selectedCurvePestId, setSelectedCurvePestId] = useState<string>('all');
  const [thresholdCropFilter, setThresholdCropFilter] = useState<string>('auto');

  const pestMap = useMemo(
    () => new Map(PEST_SPECIES_CATALOG.map((p) => [p.id, p])),
    []
  );

  // =========================================================================
  // MANEJO & NÍVEIS DE AÇÃO (works even before field is created for NDE table)
  // =========================================================================
  if (mode === 'manejo') {
    const activeCrop =
      thresholdCropFilter === 'auto'
        ? currentField?.crop || 'Todas'
        : thresholdCropFilter;

    const thresholdRows = PEST_SPECIES_CATALOG.flatMap((pest) =>
      (pest.actionThresholds || [])
        .filter((t) => {
          if (activeCrop === 'Todas') return true;
          const cropLower = activeCrop.toLowerCase();
          return (
            t.stage.toLowerCase().includes(cropLower) ||
            pest.hosts.some((h) => h.toLowerCase() === cropLower)
          );
        })
        .map((t, idx) => ({
          key: `${pest.id}-${idx}`,
          pest,
          stage: t.stage,
          threshold: t.threshold,
          unit: t.unit,
        }))
    );

    const sortedManagements = currentField
      ? [...currentField.managements].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      : [];

    return (
      <div className="space-y-4">
        {/* Registro de Aplicações / Manejo do Talhão */}
        <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Histórico de manejo e aplicações
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {currentField
                  ? `${currentField.farmName} · ${currentField.fieldName} (${sortedManagements.length} registros)`
                  : 'Cadastre um talhão para registrar aplicações químicas, biológicas ou culturais.'}
              </p>
            </div>
            {currentField ? (
              <button
                type="button"
                onClick={onOpenManagementModal}
                className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar manejo</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenFieldModal}
                className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo talhão</span>
              </button>
            )}
          </div>

          {!currentField || sortedManagements.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 dark:text-zinc-400">
              {currentField
                ? 'Nenhuma aplicação ou ação de manejo registrada para este talhão.'
                : 'Nenhum talhão selecionado.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                    <th className="py-2.5 px-4">Data</th>
                    <th className="py-2.5 px-4">Tipo</th>
                    <th className="py-2.5 px-4">Produto / Agente</th>
                    <th className="py-2.5 px-4">Dose</th>
                    <th className="py-2.5 px-4">Equipamento &amp; Clima</th>
                    <th className="py-2.5 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {sortedManagements.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-4 text-slate-600 dark:text-zinc-300 tabular-nums whitespace-nowrap">
                        {formatDatePt(m.date)}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-800 dark:text-zinc-200 whitespace-nowrap">
                        {m.type}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-zinc-100">
                        {m.product}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 dark:text-zinc-300 tabular-nums whitespace-nowrap">
                        {m.dose}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 dark:text-zinc-400">
                        {m.equipment} · {m.climateConditions}
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onDeleteManagement(m.id)}
                          aria-label="Excluir registro de manejo"
                          className="h-7 w-7 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Tabela de Referência de Níveis de Ação (NDE) */}
        <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Tabela de níveis de ação (NDE) por cultura
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Limiares técnicos para tomada de decisão de controle no MIP.
              </p>
            </div>
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-lg overflow-x-auto">
              {['Todas', 'Soja', 'Milho', 'Algodão', 'Feijão'].map((c) => {
                const isSelected = activeCrop === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setThresholdCropFilter(c)}
                    className={`h-7 px-2.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                  <th className="py-2.5 px-4">Praga</th>
                  <th className="py-2.5 px-4">Cultura / Fase</th>
                  <th className="py-2.5 px-4 text-right">Nível de ação (NDE)</th>
                  <th className="py-2.5 px-4 text-right">Ficha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {thresholdRows.map((row) => (
                  <tr
                    key={row.key}
                    className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-4 align-top">
                      <div className="font-medium text-slate-900 dark:text-zinc-100">
                        {row.pest.commonName}
                      </div>
                      <div className="text-[11px] italic text-slate-500 dark:text-zinc-400">
                        {row.pest.scientificName}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 align-top text-slate-700 dark:text-zinc-300">
                      {row.stage}
                    </td>
                    <td className="py-2.5 px-4 align-top text-right font-semibold text-amber-700 dark:text-amber-400 tabular-nums">
                      {row.threshold} {row.unit}
                    </td>
                    <td className="py-2.5 px-4 align-top text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onOpenPestInBank(row.pest.id)}
                        className="h-7 px-2 rounded-md border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <span>Bula MIP</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  }

  // Require active field for Monitoramento, Mapa, and Curvas
  if (!currentField) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
          Nenhum talhão monitorado selecionado
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
          Cadastre um talhão para registrar inspeções de campo, armadilhas, distribuição espacial e
          curvas populacionais.
        </p>
        <button
          type="button"
          onClick={onOpenFieldModal}
          className="mt-4 h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cadastrar talhão</span>
        </button>
      </div>
    );
  }

  // =========================================================================
  // INSPEÇÕES DE CAMPO & ARMADILHAS (MONITORAMENTO)
  // =========================================================================
  if (mode === 'monitoramento') {
    const sortedInspections = [...currentField.inspections].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-lg">
            <button
              type="button"
              onClick={() => setMonitoringSubView('inspecoes')}
              className={`h-7 px-3 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                monitoringSubView === 'inspecoes'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              Inspeções ({currentField.inspections.length})
            </button>
            <button
              type="button"
              onClick={() => setMonitoringSubView('armadilhas')}
              className={`h-7 px-3 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                monitoringSubView === 'armadilhas'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              Armadilhas ({currentField.traps.length})
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {monitoringSubView === 'inspecoes' ? (
              <button
                type="button"
                onClick={() => onOpenInspectionModal()}
                className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova inspeção</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenTrapModal}
                className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova armadilha</span>
              </button>
            )}
          </div>
        </div>

        {monitoringSubView === 'inspecoes' ? (
          sortedInspections.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
              Nenhuma inspeção de campo lançada para {currentField.fieldName}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                    <th className="py-2.5 px-4">Data</th>
                    <th className="py-2.5 px-4">Ponto</th>
                    <th className="py-2.5 px-4">Espécie &amp; Estágio</th>
                    <th className="py-2.5 px-4 text-right">Qtd / Amostra</th>
                    <th className="py-2.5 px-4 text-right">Infestação</th>
                    <th className="py-2.5 px-4">Severidade</th>
                    <th className="py-2.5 px-4">Observações</th>
                    <th className="py-2.5 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {sortedInspections.map((insp) => {
                    const pest = pestMap.get(insp.pestId);
                    return (
                      <tr
                        key={insp.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        <td className="py-2.5 px-4 text-slate-600 dark:text-zinc-300 tabular-nums whitespace-nowrap">
                          {formatDatePt(insp.date)}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-zinc-100 whitespace-nowrap">
                          {insp.pointCode}
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="font-medium text-slate-900 dark:text-zinc-100">
                            {pest?.commonName || insp.pestId}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                            {insp.stage} · {insp.responsible}
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-right text-slate-700 dark:text-zinc-300 tabular-nums whitespace-nowrap">
                          {insp.quantityObserved} / {insp.plantsEvaluated}
                        </td>
                        <td className="py-2.5 px-4 text-right font-semibold text-slate-900 dark:text-zinc-100 tabular-nums whitespace-nowrap">
                          {insp.infestationPercentage}%
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
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
                        <td className="py-2.5 px-4 text-slate-500 dark:text-zinc-400 max-w-xs truncate">
                          {insp.notes || '—'}
                        </td>
                        <td className="py-2.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onDeleteInspection(insp.id)}
                            aria-label="Excluir inspeção"
                            className="h-7 w-7 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : currentField.traps.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
            Nenhuma armadilha instalada em {currentField.fieldName}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                  <th className="py-2.5 px-4">Código</th>
                  <th className="py-2.5 px-4">Tipo</th>
                  <th className="py-2.5 px-4">Alvo</th>
                  <th className="py-2.5 px-4">Local / GPS</th>
                  <th className="py-2.5 px-4 text-right">Altura</th>
                  <th className="py-2.5 px-4 text-right">Capturas</th>
                  <th className="py-2.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {currentField.traps.map((trap) => {
                  const target = trap.targetPestId ? pestMap.get(trap.targetPestId) : null;
                  return (
                    <tr
                      key={trap.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-zinc-100 whitespace-nowrap">
                        {trap.code}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                        {trap.type}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700 dark:text-zinc-300">
                        {target?.commonName || 'Geral'}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 dark:text-zinc-400 tabular-nums">
                        {trap.gpsLocation}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-600 dark:text-zinc-300 tabular-nums whitespace-nowrap">
                        {trap.heightCm} cm
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 tabular-nums">
                          <button
                            type="button"
                            onClick={() => onUpdateTrapCaptures(trap.id, -1)}
                            className="h-6 w-6 rounded border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                            aria-label="Diminuir capturas"
                          >
                            -
                          </button>
                          <span className="w-7 text-center font-semibold text-slate-900 dark:text-zinc-100">
                            {trap.totalCaptured}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateTrapCaptures(trap.id, 1)}
                            className="h-6 w-6 rounded border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                            aria-label="Aumentar capturas"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onDeleteTrap(trap.id)}
                          aria-label="Excluir armadilha"
                          className="h-7 w-7 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // MAPA DE DISTRIBUIÇÃO ESPACIAL POR PONTO AMOSTRAL
  // =========================================================================
  if (mode === 'mapa') {
    const byPoint = new Map<
      string,
      {
        pointCode: string;
        count: number;
        maxInfestation: number;
        lastDate: string;
        topSeverity: 'Baixa' | 'Média' | 'Alta';
        speciesNames: string[];
      }
    >();

    const sevWeight = { Baixa: 1, Média: 2, Alta: 3 };
    for (const insp of currentField.inspections) {
      const existing = byPoint.get(insp.pointCode);
      const pestName = pestMap.get(insp.pestId)?.commonName || insp.pestId;
      if (!existing) {
        byPoint.set(insp.pointCode, {
          pointCode: insp.pointCode,
          count: 1,
          maxInfestation: insp.infestationPercentage,
          lastDate: insp.date,
          topSeverity: insp.severity,
          speciesNames: [pestName],
        });
      } else {
        existing.count += 1;
        existing.maxInfestation = Math.max(existing.maxInfestation, insp.infestationPercentage);
        if (insp.date > existing.lastDate) existing.lastDate = insp.date;
        if (sevWeight[insp.severity] > sevWeight[existing.topSeverity]) {
          existing.topSeverity = insp.severity;
        }
        if (!existing.speciesNames.includes(pestName)) {
          existing.speciesNames.push(pestName);
        }
      }
    }

    const points = Array.from(byPoint.values()).sort((a, b) =>
      a.pointCode.localeCompare(b.pointCode, 'pt-BR', { numeric: true })
    );

    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Distribuição espacial por ponto amostral
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Grade de pressão populacional nos pontos inspecionados de {currentField.fieldName}.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-zinc-400">
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">Baixa</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-700 dark:text-amber-400 font-medium">Média</span>
            <span aria-hidden="true">·</span>
            <span className="text-red-700 dark:text-red-400 font-medium">Alta</span>
          </div>
        </div>

        {points.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
            <p>Nenhum ponto amostral registrado neste talhão.</p>
            <button
              type="button"
              onClick={() => onOpenInspectionModal()}
              className="mt-3 h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar ponto amostral</span>
            </button>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {points.map((pt) => {
              const tone =
                pt.topSeverity === 'Alta'
                  ? 'border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20'
                  : pt.topSeverity === 'Média'
                    ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20'
                    : 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20';

              const textTone =
                pt.topSeverity === 'Alta'
                  ? 'text-red-700 dark:text-red-400'
                  : pt.topSeverity === 'Média'
                    ? 'text-amber-700 dark:text-amber-400'
                    : 'text-emerald-700 dark:text-emerald-400';

              return (
                <div key={pt.pointCode} className={`rounded-lg border p-3 space-y-1 ${tone}`}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                      {pt.pointCode}
                    </span>
                    <span className={`text-xs font-semibold tabular-nums ${textTone}`}>
                      {pt.maxInfestation}%
                    </span>
                  </div>
                  <div className={`text-[11px] font-medium ${textTone}`}>
                    Severidade {pt.topSeverity}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-zinc-300 truncate">
                    {pt.speciesNames.join(', ')}
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">
                    {pt.count} {pt.count === 1 ? 'leitura' : 'leituras'} · {formatDatePt(pt.lastDate)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // CURVAS POPULACIONAIS (SVG LEVE E RESPONSIVO)
  // =========================================================================
  const inspectedPestIds = Array.from(new Set(currentField.inspections.map((i) => i.pestId)));

  const filteredSeries = [...currentField.inspections]
    .filter((i) => selectedCurvePestId === 'all' || i.pestId === selectedCurvePestId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Aggregate by date
  const dateBuckets = new Map<string, { date: string; avgInfestation: number; totalQty: number; count: number }>();
  for (const item of filteredSeries) {
    const b = dateBuckets.get(item.date);
    if (!b) {
      dateBuckets.set(item.date, {
        date: item.date,
        avgInfestation: item.infestationPercentage,
        totalQty: item.quantityObserved,
        count: 1,
      });
    } else {
      b.totalQty += item.quantityObserved;
      b.avgInfestation =
        (b.avgInfestation * b.count + item.infestationPercentage) / (b.count + 1);
      b.count += 1;
    }
  }
  const chartPoints = Array.from(dateBuckets.values());

  const svgWidth = 640;
  const svgHeight = 200;
  const padL = 36;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const plotW = svgWidth - padL - padR;
  const plotH = svgHeight - padT - padB;
  const maxVal = Math.max(25, ...chartPoints.map((p) => p.avgInfestation));

  const polylineCoords = chartPoints
    .map((pt, idx) => {
      const x =
        chartPoints.length === 1
          ? padL + plotW / 2
          : padL + (idx / (chartPoints.length - 1)) * plotW;
      const y = padT + plotH - (pt.avgInfestation / maxVal) * plotH;
      return { ...pt, x, y };
    });

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Curvas populacionais ao longo da safra
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Evolução da infestação média (%) em {currentField.fieldName}.
            </p>
          </div>
          <select
            aria-label="Filtrar espécie na curva"
            value={selectedCurvePestId}
            onChange={(e) => setSelectedCurvePestId(e.target.value)}
            className="h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="all">Todas as espécies ({inspectedPestIds.length})</option>
            {inspectedPestIds.map((pid) => (
              <option key={pid} value={pid}>
                {pestMap.get(pid)?.commonName || pid}
              </option>
            ))}
          </select>
        </div>

        {chartPoints.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
            Registre inspeções em diferentes datas para visualizar a curva de evolução populacional.
          </div>
        ) : (
          <div className="p-4">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-52 text-slate-500 dark:text-zinc-400"
              role="img"
              aria-label="Gráfico de evolução populacional"
            >
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = padT + plotH - ratio * plotH;
                const val = Math.round(maxVal * ratio);
                return (
                  <g key={ratio}>
                    <line
                      x1={padL}
                      y1={y}
                      x2={svgWidth - padR}
                      y2={y}
                      stroke="currentColor"
                      strokeOpacity="0.14"
                      strokeWidth="1"
                    />
                    <text
                      x={padL - 6}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="10"
                      fill="currentColor"
                    >
                      {val}%
                    </text>
                  </g>
                );
              })}

              {polylineCoords.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={polylineCoords.map((p) => `${p.x},${p.y}`).join(' ')}
                />
              )}

              {polylineCoords.map((pt) => (
                <g key={pt.date}>
                  <circle cx={pt.x} cy={pt.y} r="3.5" fill="#059669" />
                  <text
                    x={pt.x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    fontSize="10"
                    fill="currentColor"
                  >
                    {formatDatePt(pt.date).slice(0, 5)}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        )}
      </div>

      {/* Resumo de tendência por espécie monitorada */}
      {inspectedPestIds.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
              Tendência calculada por espécie
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 text-xs">
            {inspectedPestIds.map((pid) => {
              const pest = pestMap.get(pid);
              const trend = calculatePopulationTrend(currentField.inspections, pid);
              const count = currentField.inspections.filter((i) => i.pestId === pid).length;
              return (
                <div key={pid} className="px-4 py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="font-medium text-slate-900 dark:text-zinc-100">
                      {pest?.commonName || pid}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 ml-2 tabular-nums">
                      {count} {count === 1 ? 'leitura' : 'leituras'}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 font-medium shrink-0 ${
                      trend === 'Crescente'
                        ? 'text-red-600 dark:text-red-400'
                        : trend === 'Decrescente'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-slate-600 dark:text-zinc-300'
                    }`}
                  >
                    {trend === 'Crescente' ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : trend === 'Decrescente' ? (
                      <TrendingDown className="w-3.5 h-3.5" />
                    ) : (
                      <Minus className="w-3.5 h-3.5" />
                    )}
                    {trend}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
