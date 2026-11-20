import React from 'react';
import {
  EconomicKPIs,
  PropertyCropSeason,
  AgriculturalOperationCost,
  CommercializationRecord,
  InputItem,
} from '../../types/costs';
import { Download, FileText, Printer } from 'lucide-react';

interface FinancialReportsViewProps {
  season: PropertyCropSeason;
  kpis: EconomicKPIs;
  operations: AgriculturalOperationCost[];
  sales: CommercializationRecord[];
  inputs?: InputItem[];
}

export const FinancialReportsView: React.FC<FinancialReportsViewProps> = ({
  season,
  kpis,
  operations,
  sales,
  inputs = [],
}) => {
  const seasonOps = (operations || []).filter((o) => o.seasonId === season.id);
  const seasonSales = (sales || []).filter((s) => s.seasonId === season.id);
  const stockValueTotal = inputs.reduce((acc, item) => acc + item.currentStock * item.unitPrice, 0);

  const exportToCSV = () => {
    const csvLines = [
      `Relatorio da Safra;${season.seasonName}`,
      `Cultura;${season.crop || '-'}`,
      `Area Plantada (ha);${season.plantedAreaHa}`,
      `Custo Total COE (R$);${kpis.totalSeasonCost}`,
      `Custo por ha (R$);${kpis.costPerHa}`,
      `Receita Total (R$);${kpis.grossRevenueTotal}`,
      `Margem Liquida (R$);${kpis.netMarginTotal}`,
      `ROI (%);${kpis.roiPct}`,
      `Contratos Comercializados;${seasonSales.length}`,
      `Valor em Estoque de Insumos (R$);${stockValueTotal.toFixed(2)}`,
    ];

    const blob = new Blob(['\uFEFF' + csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_custos_${season.seasonName.replace(/[\/\s]/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Upper Export Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Relatórios Financeiros &amp; Gerenciais da Safra
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Demonstrativos estruturados para emissão, crédito rural e planejamento fiscal.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => window.print()}
            className="h-9 px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir
          </button>
          <button
            type="button"
            onClick={exportToCSV}
            className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Document Body */}
      <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b border-slate-200/80 dark:border-zinc-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
              {season.farmName || 'Relatório Financeiro da Safra'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {season.seasonName}
              {season.crop ? ` · Cultura: ${season.crop}` : ''}
              {season.cultivar ? ` (${season.cultivar})` : ''}
            </p>
          </div>
          <div className="sm:text-right text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
            <div>Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
            <div>Área Cultivada: {season.plantedAreaHa.toLocaleString('pt-BR')} ha</div>
          </div>
        </div>

        {/* Section 1: Summary */}
        <div className="space-y-3">
          <h4 className="font-semibold text-xs text-emerald-600 dark:text-emerald-400">
            1. Resumo Executivo Financeiro (Metodologia CONAB / Embrapa)
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">Investimento Total</span>
              <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm tabular-nums">
                R$ {kpis.totalSeasonCost.toLocaleString('pt-BR')}
              </span>
            </div>

            <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">Custo por Hectare</span>
              <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm tabular-nums">
                R$ {kpis.costPerHa.toLocaleString('pt-BR')} / ha
              </span>
            </div>

            <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">Receita Bruta Total</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm tabular-nums">
                R$ {kpis.grossRevenueTotal.toLocaleString('pt-BR')}
              </span>
            </div>

            <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">Lucro Líquido Final</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 text-sm tabular-nums">
                R$ {kpis.netMarginTotal.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Operations */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
          <h4 className="font-semibold text-xs text-emerald-600 dark:text-emerald-400">
            2. Histórico de Operações e Alocação de Recursos ({seasonOps.length})
          </h4>

          <div className="overflow-x-auto border border-slate-200/70 dark:border-zinc-800 rounded-lg">
            <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
              <thead className="bg-slate-50/80 dark:bg-zinc-950/60 text-slate-500 dark:text-zinc-400 font-semibold border-b border-slate-200/70 dark:border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">Operação</th>
                  <th className="py-2.5 px-3">Talhão</th>
                  <th className="py-2.5 px-3">Maquinário</th>
                  <th className="py-2.5 px-3 text-right">Custo Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {seasonOps.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 dark:text-zinc-500">
                      Nenhuma operação registrada nesta safra.
                    </td>
                  </tr>
                ) : (
                  seasonOps.map((op) => (
                    <tr key={op.id}>
                      <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-zinc-100">{op.operationType}</td>
                      <td className="py-2.5 px-3">{op.plotName}</td>
                      <td className="py-2.5 px-3">{op.machineName || 'Frota Geral'}</td>
                      <td className="py-2.5 px-3 text-right font-medium tabular-nums">
                        R$ {op.totalOperationCost.toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Commercialization & Inventory Position */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
          <h4 className="font-semibold text-xs text-emerald-600 dark:text-emerald-400">
            3. Comercialização &amp; Posição de Almoxarifado
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">Contratos de Venda</span>
              <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm tabular-nums">
                {seasonSales.length} contrato{seasonSales.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">Itens em Almoxarifado</span>
              <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm tabular-nums">
                {inputs.length} insumo{inputs.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">Capital Imobilizado em Insumos</span>
              <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm tabular-nums">
                R$ {stockValueTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
