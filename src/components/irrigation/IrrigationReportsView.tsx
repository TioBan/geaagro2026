import React from 'react';
import {
  IrrigationKPIs,
  IrrigationSystemRecord,
  IrrigationEventLog,
} from '../../types/irrigation';
import { FileText, Download, Printer } from 'lucide-react';
import { formatBrDate } from './irrigationUi';

interface Props {
  kpis: IrrigationKPIs;
  systems: IrrigationSystemRecord[];
  logs: IrrigationEventLog[];
}

export const IrrigationReportsView: React.FC<Props> = ({
  kpis,
  systems,
  logs,
}) => {
  const handleExportCSV = () => {
    const headers =
      'Data,Sistema,Talhão,Duração (h),Lâmina Bruta (mm),Volume (m³),Energia (kWh),Custo (R$)\n';
    const rows = logs
      .map(
        (l) =>
          `${l.date},"${l.systemName}","${l.plotName}",${l.durationHours},${l.grossDepthAppliedMm},${l.totalWaterVolumeM3},${l.energyConsumedKwh},${l.energyCostBrl}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Relatorio_Manejo_Hidrico_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="print:hidden bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            Relatórios &amp; Exportação de Manejo Hídrico
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Extrato consolidado de consumo de água, energia, sistemas ativos e índice IGEH.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => window.print()}
            className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir / PDF
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Consolidated Printable Sheet */}
      <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div>
            <span className="text-[11px] font-medium text-sky-700 dark:text-sky-400">
              Relatório Consolidado de Irrigação
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              Demonstrativo de Eficiência Hídrica (IGEH)
            </h2>
          </div>

          <div className="text-left sm:text-right tabular-nums">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Nota IGEH</span>
            <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
              {kpis.igehScore > 0 ? `${kpis.igehScore} / 100` : '—'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs tabular-nums">
          <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Área Irrigada</span>
            <strong className="text-base text-slate-900 dark:text-zinc-100">
              {kpis.totalIrrigatedAreaHa.toLocaleString('pt-BR')} ha
            </strong>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Volume Aplicado</span>
            <strong className="text-base text-sky-700 dark:text-sky-400">
              {kpis.totalWaterVolumeSeasonM3.toLocaleString('pt-BR')} m³
            </strong>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Energia Consumida</span>
            <strong className="text-base text-amber-700 dark:text-amber-400">
              {kpis.totalEnergyConsumedKwh.toLocaleString('pt-BR')} kWh
            </strong>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Custo Energético</span>
            <strong className="text-base text-slate-900 dark:text-zinc-100">
              R$ {kpis.totalEnergyCostBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>
          </div>
        </div>

        {/* Systems Summary */}
        {systems.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100">
              Sistemas Registrados ({systems.length})
            </h4>
            <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    <th className="py-2 px-3">Sistema</th>
                    <th className="py-2 px-3">Tipo</th>
                    <th className="py-2 px-3 text-right">Área</th>
                    <th className="py-2 px-3 text-right">Vazão</th>
                    <th className="py-2 px-3 text-right">CUC / Ea</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 tabular-nums">
                  {systems.map((s) => (
                    <tr key={s.id}>
                      <td className="py-2 px-3 font-medium text-slate-900 dark:text-zinc-100">
                        {s.systemName}
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-zinc-400">{s.type}</td>
                      <td className="py-2 px-3 text-right text-slate-800 dark:text-zinc-200">
                        {s.irrigatedAreaHa} ha
                      </td>
                      <td className="py-2 px-3 text-right text-slate-800 dark:text-zinc-200">
                        {s.nominalFlowM3h} m³/h
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-emerald-700 dark:text-emerald-400">
                        {s.cucPercent}% / {s.applicationEfficiencyPct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Irrigation Logs Table */}
        <div className="space-y-2">
          <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100">
            Extrato de Regas Executadas ({logs.length})
          </h4>

          {logs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 p-6 text-center text-xs text-slate-500 dark:text-zinc-400">
              Nenhuma irrigação registrada para compor o extrato.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    <th className="py-2 px-3">Data</th>
                    <th className="py-2 px-3">Sistema / Pivô</th>
                    <th className="py-2 px-3 text-right">Duração</th>
                    <th className="py-2 px-3 text-right">Lâmina Bruta</th>
                    <th className="py-2 px-3 text-right">Volume</th>
                    <th className="py-2 px-3 text-right">Energia</th>
                    <th className="py-2 px-3 text-right">Custo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 tabular-nums">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40">
                      <td className="py-2 px-3 font-medium text-slate-900 dark:text-zinc-100 whitespace-nowrap">
                        {formatBrDate(log.date)}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-800 dark:text-zinc-200">
                        {log.systemName}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700 dark:text-zinc-300">
                        {log.durationHours}h
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-sky-700 dark:text-sky-400">
                        {log.grossDepthAppliedMm} mm
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700 dark:text-zinc-300">
                        {log.totalWaterVolumeM3.toLocaleString('pt-BR')} m³
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700 dark:text-zinc-300">
                        {log.energyConsumedKwh.toLocaleString('pt-BR')} kWh
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-amber-700 dark:text-amber-400">
                        R$ {log.energyCostBrl.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IrrigationReportsView;
