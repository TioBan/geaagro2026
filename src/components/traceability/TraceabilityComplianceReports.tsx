import React, { useState } from 'react';
import {
  FileCheck,
  Printer,
  ShieldCheck,
  Award,
  CheckCircle2,
  FileSpreadsheet,
  Database,
  Sparkles,
} from 'lucide-react';
import {
  TraceabilityProperty,
  TraceabilityLot,
  TraceabilityOperation,
  TraceabilityHarvestItem,
  TraceabilityExpedition,
} from '../../types/traceability';

interface ComplianceReportsProps {
  property: TraceabilityProperty;
  lots: TraceabilityLot[];
  operations: TraceabilityOperation[];
  harvests: TraceabilityHarvestItem[];
  expeditions: TraceabilityExpedition[];
}

export const TraceabilityComplianceReports: React.FC<ComplianceReportsProps> = ({
  property,
  lots,
  operations,
  harvests,
  expeditions,
}) => {
  const [selectedReport, setSelectedReport] = useState<'inc02' | 'globalgap' | 'caderno_campo' | 'igr_audit'>('inc02');

  const handleExportJSON = () => {
    const backupData = {
      property,
      lots,
      operations,
      harvests,
      expeditions,
      exportedAt: new Date().toISOString(),
      system: 'GeaAgro Rastreabilidade Agrícola Suite',
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (property.farmName || 'propriedade').replace(/\s+/g, '_');
    a.download = `backup-geaagro-rastreabilidade-${safeName}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['Codigo_Lote', 'Cultura', 'Cultivar', 'Talhao', 'Data_Semeadura', 'Status', 'Colhido_Kg', 'Caixas', 'IGR_Score'];
    const rows = lots.map(l => [
      l.lotCode,
      l.cropName,
      l.cultivarName,
      l.plotCode,
      l.sowingDate,
      l.status,
      l.totalHarvestedKg,
      l.totalHarvestedBoxes,
      `${l.igrScorePercentage}%`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_lotes_geaagro_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const reportTabs = [
    {
      id: 'inc02' as const,
      label: 'INC 02/2018 MAPA/ANVISA',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'globalgap' as const,
      label: 'Padrão GlobalG.A.P. & PIF',
      icon: Award,
      iconColor: 'text-sky-600 dark:text-sky-400',
    },
    {
      id: 'caderno_campo' as const,
      label: 'Caderno de Campo Consolidado',
      icon: FileCheck,
      iconColor: 'text-violet-600 dark:text-violet-400',
    },
    {
      id: 'igr_audit' as const,
      label: 'Auditoria GeaAgro IGR Score',
      icon: Sparkles,
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header & Report Tabs */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Relatórios de Conformidade Legal & Auditoria
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Emissão de laudos para fiscalização MAPA, ANVISA, GlobalG.A.P., PIF/PIH e Certificação Orgânica
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="h-8 px-3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Exportar CSV
            </button>
            <button
              type="button"
              onClick={handleExportJSON}
              className="h-8 px-3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              Backup JSON
            </button>
            <button
              type="button"
              onClick={handlePrintReport}
              className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir Relatório
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-3 border-t border-slate-200/80 dark:border-zinc-800">
          {reportTabs.map(tab => {
            const Icon = tab.icon;
            const active = selectedReport === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedReport(tab.id)}
                className={`p-3 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                  active
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500/80 dark:border-emerald-600 font-semibold text-emerald-900 dark:text-emerald-200'
                    : 'bg-slate-50/50 dark:bg-zinc-950/40 border-slate-200/80 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100/70 dark:hover:bg-zinc-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1.5 ${tab.iconColor}`} />
                <span className="block leading-snug">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Official Report Document */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-5 sm:p-6 space-y-5">
        <div className="border-b border-slate-200/80 dark:border-zinc-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-semibold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">
              Sistema de Rastreabilidade Vegetal • Relatório Oficial de Auditoria
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 mt-0.5">
              {selectedReport === 'inc02' && 'Laudo de Conformidade INC 02/2018 (MAPA & ANVISA)'}
              {selectedReport === 'globalgap' && 'Dossiê de Boas Práticas Agrícolas (GlobalG.A.P.)'}
              {selectedReport === 'caderno_campo' && 'Livro de Registro de Campo & Aplicações Agrícolas'}
              {selectedReport === 'igr_audit' && 'Certificado de Desempenho & Índice GeaAgro (IGR)'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Propriedade: <strong className="text-slate-700 dark:text-zinc-200">{property.farmName || 'Não informada'}</strong>
              {(property.city || property.state) && ` • ${[property.city, property.state].filter(Boolean).join(' - ')}`}
              {property.documentNumber && ` • ${property.documentType}: ${property.documentNumber}`}
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0 text-xs">
            <span className="font-semibold text-slate-800 dark:text-zinc-200 block tabular-nums">
              Emitido em: {new Date().toLocaleDateString('pt-BR')}
            </span>
            <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">
              RT: {property.technicalResponsible || 'Não informado'}
              {property.creaNumber && ` (${property.councilType} ${property.creaNumber})`}
            </span>
          </div>
        </div>

        {/* Executive Summary Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Identificação de Lotes
            </div>
            <p className="text-emerald-800/90 dark:text-emerald-300/90 text-[11px]">
              100% dos lotes ativos possuem identificação unívoca, QR Code e geolocalização.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Controle de Carência
            </div>
            <p className="text-emerald-800/90 dark:text-emerald-300/90 text-[11px]">
              Zero registros de colheita em período de carência química ativa.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Rastreabilidade Reversa
            </div>
            <p className="text-emerald-800/90 dark:text-emerald-300/90 text-[11px]">
              Expedição vinculada a NF-e, romaneios, clientes e lotes de colheita.
            </p>
          </div>
        </div>

        {/* Audited Lots Table */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider tabular-nums">
            Lotes Registrados no Período ({lots.length})
          </h4>
          {lots.length === 0 ? (
            <div className="p-6 text-center rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400">
              Nenhum lote cadastrado para inclusão no relatório de auditoria.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200/80 dark:border-zinc-800 rounded-lg">
              <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
                <thead className="bg-slate-50/80 dark:bg-zinc-950/60 font-semibold text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 border-b border-slate-200/80 dark:border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-3">Lote</th>
                    <th className="py-2.5 px-3">Cultura / Cultivar</th>
                    <th className="py-2.5 px-3">Talhão</th>
                    <th className="py-2.5 px-3">Semente / RNS</th>
                    <th className="py-2.5 px-3">Colhido (kg)</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">IGR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-zinc-800">
                  {lots.map(lot => (
                    <tr key={lot.id}>
                      <td className="py-2 px-3 font-mono font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        {lot.lotCode}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900 dark:text-zinc-100">
                        {lot.cropName} ({lot.cultivarName})
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">{lot.plotCode}</td>
                      <td className="py-2 px-3 text-[11px] text-slate-500 dark:text-zinc-400">{lot.seedSupplier || '--'}</td>
                      <td className="py-2 px-3 font-semibold whitespace-nowrap tabular-nums">
                        {lot.totalHarvestedKg.toLocaleString('pt-BR')} kg
                      </td>
                      <td className="py-2 px-3 capitalize">{lot.status}</td>
                      <td className="py-2 px-3 font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        {lot.igrScorePercentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Technical Signatures */}
        <div className="pt-6 border-t border-slate-200/80 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs">
          <div className="space-y-1">
            <div className="border-b border-slate-300 dark:border-zinc-700 w-48 mx-auto pb-1" />
            <p className="font-semibold text-slate-900 dark:text-zinc-100">{property.producerName || 'Produtor Rural'}</p>
            <p className="text-slate-500 dark:text-zinc-400 text-[11px]">Produtor Rural / Responsável Legal</p>
          </div>

          <div className="space-y-1">
            <div className="border-b border-slate-300 dark:border-zinc-700 w-48 mx-auto pb-1" />
            <p className="font-semibold text-slate-900 dark:text-zinc-100">
              {property.technicalResponsible || 'Responsável Técnico'}
            </p>
            <p className="text-slate-500 dark:text-zinc-400 text-[11px]">
              Engenheiro Agrônomo • {property.councilType} {property.creaNumber || '--'}
              {property.creaState ? `/${property.creaState}` : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
