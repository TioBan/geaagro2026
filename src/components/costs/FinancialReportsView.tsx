import React from 'react';
import { EconomicKPIs, PropertyCropSeason, AgriculturalOperationCost, CommercializationRecord, InputItem } from '../../types/costs';
import { FileText, Download, Printer, Share2, DollarSign, BarChart3, PieChart, Layers } from 'lucide-react';

interface FinancialReportsViewProps {
  season: PropertyCropSeason;
  kpis: EconomicKPIs;
  operations: AgriculturalOperationCost[];
  sales: CommercializationRecord[];
}

export const FinancialReportsView: React.FC<FinancialReportsViewProps> = ({
  season,
  kpis,
  operations,
  sales,
}) => {
  const exportToCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + `Relatorio da Safra,${season.seasonName}\n`
      + `Cultura,${season.crop}\n`
      + `Area Plantada (ha),${season.plantedAreaHa}\n`
      + `Custo Total (R$),${kpis.totalSeasonCost}\n`
      + `Custo por ha (R$),${kpis.costPerHa}\n`
      + `Receita Total (R$),${kpis.grossRevenueTotal}\n`
      + `Margem Liquida (R$),${kpis.netMarginTotal}\n`
      + `ROI (%),${kpis.roiPct}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_custos_${season.seasonName.replace(/[\/\s]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Upper Export Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Relatórios Financeiros & Gerenciais da Safra
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Demonstrativos prontos para emissão, bancos, investidores e planejamento fiscal
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold rounded-xl flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          <button
            onClick={exportToCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Relatório Impresso / Formato Documento */}
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-8">
        {/* Document Header */}
        <div className="flex justify-between items-start border-b border-slate-200 dark:border-zinc-800 pb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-zinc-100">{season.farmName && season.farmName !== 'Fazenda Santa Maria' ? season.farmName : 'Relatório Financeiro'}</h2>
            <p className="text-xs text-slate-500">{season.seasonName}{season.crop ? ` — Cultura: ${season.crop}` : ''}{season.cultivar ? ` (${season.cultivar})` : ''}</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
            <div>Área Cultivada: {season.plantedAreaHa} ha</div>
          </div>
        </div>

        {/* Resumo de Custos e Margens */}
        <div className="space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm uppercase tracking-wider text-emerald-600">
            1. Resumo Executivo Financeiro (Metodologia CONAB / Embrapa)
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl">
              <span className="text-slate-500 block">Investimento Total</span>
              <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">R$ {kpis.totalSeasonCost.toLocaleString('pt-BR')}</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl">
              <span className="text-slate-500 block">Custo por Hectare</span>
              <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">R$ {kpis.costPerHa.toLocaleString('pt-BR')} / ha</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl">
              <span className="text-slate-500 block">Receita Bruta Total</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">R$ {kpis.grossRevenueTotal.toLocaleString('pt-BR')}</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl">
              <span className="text-slate-500 block">Lucro Líquido Final</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">R$ {kpis.netMarginTotal.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>

        {/* Detalhamento das Operações de Campo */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
          <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm uppercase tracking-wider text-emerald-600">
            2. Histórico de Operações e Alocação de Recursos
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
              <thead className="bg-slate-50 dark:bg-zinc-800 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="p-2.5">Operação</th>
                  <th className="p-2.5">Talhão</th>
                  <th className="p-2.5">Maquinário</th>
                  <th className="p-2.5 text-right">Custo Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {(operations || []).filter(o => o.seasonId === season.id).map(op => (
                  <tr key={op.id}>
                    <td className="p-2.5 font-bold">{op.operationType}</td>
                    <td className="p-2.5">{op.plotName}</td>
                    <td className="p-2.5">{op.machineName || 'Frota Geral'}</td>
                    <td className="p-2.5 text-right font-medium">R$ {op.totalOperationCost.toLocaleString('pt-BR')}</td>
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
