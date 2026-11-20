import React, { useMemo, useState } from 'react';
import { FileText, Printer, Download, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  SwineAnimal,
  SwineBatch,
  FarrowingLitter,
  SwineIESScore,
} from '../../types/swine';
import { calculateSwineExecutiveKPIs } from '../../utils/swineStorage';
import { SuinoIcon } from '../icons/SuinoIcon';
import {
  SWINE_CARD_CLASS,
  SWINE_PRIMARY_BTN_CLASS,
  SWINE_SECONDARY_BTN_CLASS,
  SWINE_STAGE_LABELS,
  SWINE_SUBCARD_CLASS,
  formatBrDate,
} from './swineUi';

interface SwineReportsViewProps {
  animals: SwineAnimal[];
  batches: SwineBatch[];
  litters: FarrowingLitter[];
  iesScore: SwineIESScore;
}

type ReportType = 'executive' | 'gta_slaughter' | 'reproductive' | 'batch_closure';

export const SwineReportsView: React.FC<SwineReportsViewProps> = ({
  animals,
  batches,
  litters,
  iesScore,
}) => {
  const [reportType, setReportType] = useState<ReportType>('executive');

  const kpis = useMemo(
    () => calculateSwineExecutiveKPIs(animals, batches, litters),
    [animals, batches, litters]
  );

  const activeWithdrawalAnimals = useMemo(() => {
    const now = Date.now();
    return animals.filter(a =>
      (a.healthHistory || []).some(h => {
        if (!h.withdrawalDays || h.withdrawalDays <= 0) return false;
        const end = new Date(h.date).getTime() + h.withdrawalDays * 86400000;
        return Number.isFinite(end) && now < end;
      })
    );
  }, [animals]);

  const finishingBatches = useMemo(
    () => batches.filter(b => b.stage === 'terminacao'),
    [batches]
  );

  const sows = useMemo(
    () => animals.filter(a => a.category.includes('Matriz') || a.category.includes('Marrã')),
    [animals]
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const rows: string[][] = [
      ['Indicador', 'Valor'],
      ['Total de Animais', String(kpis.totalAnimals)],
      ['Matrizes Ativas', String(kpis.activeSows)],
      ['Leitoes Maternidade', String(kpis.maternityPiglets)],
      ['Leitoes Creche', String(kpis.nurseryPiglets)],
      ['Crescimento + Terminacao', String(kpis.growingPigs + kpis.finishingPigs)],
      ['Conversao Alimentar Media', String(kpis.avgFeedConversionRatio)],
      ['GMD Medio (g/dia)', String(kpis.avgDailyGainG)],
      ['Mortalidade Geral (%)', String(kpis.overallMortalityPct)],
      ['Indice IES', `${iesScore.totalScore} (${iesScore.classification})`],
    ];

    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-suinocultura-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`${SWINE_CARD_CLASS} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Relatórios Executivos & Pré-GTA</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Laudos zootécnicos consolidados, checklist pré-GTA, mapa reprodutivo e fechamento de lotes.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={handleExportCsv} className={SWINE_SECONDARY_BTN_CLASS}>
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <button type="button" onClick={handlePrint} className={SWINE_PRIMARY_BTN_CLASS}>
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className={`${SWINE_CARD_CLASS} p-2 flex items-center gap-1 overflow-x-auto`}>
        {(
          [
            { id: 'executive', label: '1. Resumo Executivo & IES' },
            { id: 'gta_slaughter', label: '2. Checklist Pré-GTA' },
            { id: 'reproductive', label: '3. Mapa Reprodutivo' },
            { id: 'batch_closure', label: '4. Fechamento de Lotes' },
          ] as const
        ).map(r => (
          <button
            key={r.id}
            type="button"
            onClick={() => setReportType(r.id)}
            className={`h-8 px-3 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              reportType === r.id
                ? 'bg-rose-600 text-white'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Report Sheet */}
      <div className={`${SWINE_CARD_CLASS} p-5 sm:p-6 space-y-5 max-w-4xl mx-auto`}>
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <SuinoIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Laudo Técnico de Suinocultura
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Relatório consolidado a partir dos registros operacionais da granja
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500 dark:text-zinc-400 shrink-0 tabular-nums">
            <span className="block font-semibold text-slate-900 dark:text-zinc-100">
              Emissão: {new Date().toLocaleDateString('pt-BR')}
            </span>
            <span>Documento Técnico</span>
          </div>
        </div>

        {/* 1. Executive */}
        {reportType === 'executive' && (
          <div className="space-y-4">
            <div className={`${SWINE_SUBCARD_CLASS} p-3.5 flex items-center justify-between gap-3`}>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  Índice de Eficiência Suinícola (IES)
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {iesScore.totalScore > 0 ? iesScore.classification : 'Sem dados suficientes'}
                </p>
              </div>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                {iesScore.totalScore} pts
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className={`${SWINE_SUBCARD_CLASS} p-3`}>
                <span className="text-slate-500 dark:text-zinc-400 block">Total do Rebanho</span>
                <span className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                  {kpis.totalAnimals} suínos
                </span>
              </div>
              <div className={`${SWINE_SUBCARD_CLASS} p-3`}>
                <span className="text-slate-500 dark:text-zinc-400 block">Matrizes Ativas</span>
                <span className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                  {kpis.activeSows} matrizes
                </span>
              </div>
              <div className={`${SWINE_SUBCARD_CLASS} p-3`}>
                <span className="text-slate-500 dark:text-zinc-400 block">Conversão Média</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {kpis.avgFeedConversionRatio > 0 ? `${kpis.avgFeedConversionRatio} kg/kg` : '—'}
                </span>
              </div>
              <div className={`${SWINE_SUBCARD_CLASS} p-3`}>
                <span className="text-slate-500 dark:text-zinc-400 block">Mortalidade Geral</span>
                <span className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                  {kpis.overallMortalityPct}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. Pré-GTA */}
        {reportType === 'gta_slaughter' && (
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Checklist de Rastreabilidade & Carência Pré-GTA
            </h4>

            <div
              className={`p-3.5 rounded-lg border space-y-1 ${
                activeWithdrawalAnimals.length > 0
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold">
                {activeWithdrawalAnimals.length > 0 ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>
                  {activeWithdrawalAnimals.length > 0
                    ? `Atenção: ${activeWithdrawalAnimals.length} animal(is) em período de carência`
                    : 'Status de Carência: Sem bloqueios ativos registrados'}
                </span>
              </div>
              <p className="text-xs opacity-90">
                {activeWithdrawalAnimals.length > 0
                  ? `Brincos em carência: ${activeWithdrawalAnimals.map(a => a.code).join(', ')}.`
                  : 'Conferir histórico sanitário individual antes da emissão oficial da GTA.'}
              </p>
            </div>

            {finishingBatches.length === 0 ? (
              <p className="text-slate-500 dark:text-zinc-400 py-4 text-center">
                Nenhum lote em terminação cadastrado para embarque.
              </p>
            ) : (
              <div className="space-y-2">
                {finishingBatches.map(b => (
                  <div
                    key={b.id}
                    className={`${SWINE_SUBCARD_CLASS} p-3 flex flex-wrap items-center justify-between gap-2`}
                  >
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-zinc-100">
                        {b.code}
                      </span>
                      <span className="text-slate-500 dark:text-zinc-400 block">
                        {b.shedName} · Prev. embarque: {formatBrDate(b.expectedEndDate)}
                      </span>
                    </div>
                    <div className="text-right tabular-nums">
                      <span className="font-semibold text-slate-900 dark:text-zinc-100 block">
                        {b.currentAnimalsCount} cabeças
                      </span>
                      <span className="text-slate-500 dark:text-zinc-400">
                        Peso méd.: {b.currentAvgWeightKg} kg
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. Reproductive */}
        {reportType === 'reproductive' && (
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Espelho Reprodutivo do Plantel
            </h4>
            {sows.length === 0 ? (
              <p className="text-slate-500 dark:text-zinc-400 py-4 text-center">
                Nenhuma matriz cadastrada para exibição no espelho reprodutivo.
              </p>
            ) : (
              <div className="border border-slate-200 dark:border-zinc-800 rounded-lg overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-medium">
                    <tr>
                      <th className="px-3 py-2">Matriz</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2 text-center">Partos Reg.</th>
                      <th className="px-3 py-2 text-center">Méd. Vivos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {sows.map(a => {
                      const farrowings = a.reproductionHistory.filter(r => r.eventType === 'Parto');
                      const sowLitters = litters.filter(l => l.sowId === a.id || l.sowCode === a.code);
                      const count = Math.max(farrowings.length, sowLitters.length);
                      const avgAlive =
                        sowLitters.length > 0
                          ? (
                              sowLitters.reduce((acc, l) => acc + l.bornAlive, 0) /
                              sowLitters.length
                            ).toFixed(1)
                          : farrowings.length > 0
                            ? (
                                farrowings.reduce((acc, r) => acc + (r.bornAlive ?? 0), 0) /
                                farrowings.length
                              ).toFixed(1)
                            : '—';
                      return (
                        <tr key={a.id}>
                          <td className="px-3 py-2 font-medium text-slate-900 dark:text-zinc-100">
                            {a.code} ({a.breed})
                          </td>
                          <td className="px-3 py-2 text-slate-600 dark:text-zinc-400">
                            {a.status}
                          </td>
                          <td className="px-3 py-2 text-center tabular-nums text-slate-800 dark:text-zinc-200">
                            {count}
                          </td>
                          <td className="px-3 py-2 text-center font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                            {avgAlive}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 4. Batch Closure */}
        {reportType === 'batch_closure' && (
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Fechamento Zootécnico de Lotes
            </h4>
            {batches.length === 0 ? (
              <p className="text-slate-500 dark:text-zinc-400 py-4 text-center">
                Nenhum lote cadastrado na creche, crescimento ou terminação.
              </p>
            ) : (
              <div className="border border-slate-200 dark:border-zinc-800 rounded-lg overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-medium">
                    <tr>
                      <th className="px-3 py-2">Lote</th>
                      <th className="px-3 py-2">Fase</th>
                      <th className="px-3 py-2 text-right">Animais</th>
                      <th className="px-3 py-2 text-right">GMD</th>
                      <th className="px-3 py-2 text-right">CA</th>
                      <th className="px-3 py-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {batches.map(b => (
                      <tr key={b.id}>
                        <td className="px-3 py-2 font-medium text-slate-900 dark:text-zinc-100">
                          {b.code}
                        </td>
                        <td className="px-3 py-2 text-slate-600 dark:text-zinc-400">
                          {SWINE_STAGE_LABELS[b.stage]}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-slate-800 dark:text-zinc-200">
                          {b.currentAnimalsCount}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-slate-800 dark:text-zinc-200">
                          {b.averageDailyGainG} g/d
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                          {b.feedConversionRatio}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-600 dark:text-zinc-400">
                          {b.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Signatures */}
        <div className="pt-6 border-t border-slate-200 dark:border-zinc-800 grid grid-cols-2 gap-8 text-center text-xs text-slate-500 dark:text-zinc-400">
          <div>
            <div className="border-b border-slate-300 dark:border-zinc-700 max-w-[200px] mx-auto mb-2" />
            <span className="font-medium text-slate-800 dark:text-zinc-200 block">
              Médico Veterinário Responsável
            </span>
            <span className="text-[11px]">CRMV</span>
          </div>
          <div>
            <div className="border-b border-slate-300 dark:border-zinc-700 max-w-[200px] mx-auto mb-2" />
            <span className="font-medium text-slate-800 dark:text-zinc-200 block">
              Gerente Técnico da Granja
            </span>
            <span className="text-[11px]">Responsável Zootécnico</span>
          </div>
        </div>
      </div>
    </div>
  );
};
