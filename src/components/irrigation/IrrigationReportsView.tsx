import React from 'react';
import { IrrigationKPIs, IrrigationSystemRecord, IrrigationEventLog } from '../../types/irrigation';
import { FileText, Download, Printer, CheckCircle2, Droplets, Zap, ShieldCheck } from 'lucide-react';

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
    const headers = 'Data,Sistema,Talhão,Lâmina Bruta (mm),Volume (m³),Energia (kWh),Custo (R$)\n';
    const rows = logs
      .map(
        l =>
          `${l.date},"${l.systemName}","${l.plotName}",${l.grossDepthAppliedMm},${l.totalWaterVolumeM3},${l.energyConsumedKwh},${l.energyCostBrl}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Relatorio_Manejo_Hidrico_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            Relatórios Tecnológicos & Emissão Hídrica
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Exportação de dados de manejo de irrigação, consumo de água, energia, auditoria IGEH e certificação sustentável
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Imprimir Relatório
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Exportar Planilha CSV
          </button>
        </div>
      </div>

      {/* Visão Geral da Certificação de Eficiência Hídrica IGEH */}
      <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6">
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div>
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
              Relatório Consolidado de Manejo
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              Certificado IGEH de Eficiência Hídrica Agricultura Sustentável
            </h2>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Nota IGEH</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{kpis.igehScore} / 100</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-100 dark:border-zinc-800">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Área Total Irrigada</span>
            <strong className="text-lg text-slate-900 dark:text-white">{kpis.totalIrrigatedAreaHa} ha</strong>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-100 dark:border-zinc-800">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Volume Total Aplicado</span>
            <strong className="text-lg text-cyan-600 dark:text-cyan-400">{kpis.totalWaterVolumeSeasonM3.toLocaleString('pt-BR')} m³</strong>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-100 dark:border-zinc-800">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Energia Consumida</span>
            <strong className="text-lg text-amber-600 dark:text-amber-400">{kpis.totalEnergyConsumedKwh.toLocaleString('pt-BR')} kWh</strong>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-100 dark:border-zinc-800">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Custo Total de Energia</span>
            <strong className="text-lg text-slate-900 dark:text-white">R$ {kpis.totalEnergyCostBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>

        {/* Tabela para impressão / extrato */}
        <div className="space-y-3 pt-2">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Extrato de Regas e Manejo Executado</h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 uppercase text-[10px] font-bold">
                  <th className="py-2 px-3">Data</th>
                  <th className="py-2 px-3">Sistema / Pivô</th>
                  <th className="py-2 px-3">Duração</th>
                  <th className="py-2 px-3">Lâmina Bruta</th>
                  <th className="py-2 px-3">Volume Água</th>
                  <th className="py-2 px-3">Energia</th>
                  <th className="py-2 px-3 text-right">Custo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-800 dark:text-zinc-200">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                    <td className="py-2.5 px-3 font-semibold">{new Date(log.date).toLocaleDateString('pt-BR')}</td>
                    <td className="py-2.5 px-3 font-bold">{log.systemName}</td>
                    <td className="py-2.5 px-3">{log.durationHours}h</td>
                    <td className="py-2.5 px-3 text-cyan-600 dark:text-cyan-400 font-bold">{log.grossDepthAppliedMm} mm</td>
                    <td className="py-2.5 px-3">{log.totalWaterVolumeM3.toLocaleString('pt-BR')} m³</td>
                    <td className="py-2.5 px-3">{log.energyConsumedKwh.toLocaleString('pt-BR')} kWh</td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-600">R$ {log.energyCostBrl.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
