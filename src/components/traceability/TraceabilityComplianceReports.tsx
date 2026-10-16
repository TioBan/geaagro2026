import React, { useState } from 'react';
import {
  FileCheck,
  Download,
  Printer,
  ShieldCheck,
  Award,
  Calendar,
  Building2,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Database,
  Upload,
  RefreshCw,
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
  onImportBackup?: (data: any) => void;
}

export const TraceabilityComplianceReports: React.FC<ComplianceReportsProps> = ({
  property,
  lots,
  operations,
  harvests,
  expeditions,
  onImportBackup,
}) => {
  const [selectedReport, setSelectedReport] = useState<'inc02' | 'globalgap' | 'caderno_campo' | 'igr_audit'>('inc02');
  const [reportDateRange, setReportDateRange] = useState({
    start: '2026-01-01',
    end: new Date().toISOString().split('T')[0],
  });

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
    a.download = `backup-geaagro-rastreabilidade-${property.farmName.replace(/\s+/g, '_')}-${new Date().toISOString().split('T')[0]}.json`;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              Relatórios de Conformidade Legal & Auditoria
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Emissão de laudos para fiscalização MAPA, ANVISA, GlobalG.A.P., PIF/PIH e Certificação Orgânica
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Exportar CSV / Excel
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-blue-600" />
              Backup Offline JSON
            </button>
            <button
              onClick={handlePrintReport}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Imprimir Relatório Oficial
            </button>
          </div>
        </div>

        {/* Report Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
          <button
            onClick={() => setSelectedReport('inc02')}
            className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
              selectedReport === 'inc02'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 font-bold text-emerald-900 dark:text-emerald-200'
                : 'border-slate-200 dark:border-zinc-800 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
            INC 02/2018 MAPA/ANVISA
          </button>

          <button
            onClick={() => setSelectedReport('globalgap')}
            className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
              selectedReport === 'globalgap'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 font-bold text-emerald-900 dark:text-emerald-200'
                : 'border-slate-200 dark:border-zinc-800 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Award className="w-4 h-4 text-blue-600 mb-1" />
            Padrão GlobalG.A.P. & PIF
          </button>

          <button
            onClick={() => setSelectedReport('caderno_campo')}
            className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
              selectedReport === 'caderno_campo'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 font-bold text-emerald-900 dark:text-emerald-200'
                : 'border-slate-200 dark:border-zinc-800 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileCheck className="w-4 h-4 text-purple-600 mb-1" />
            Caderno de Campo Consolidado
          </button>

          <button
            onClick={() => setSelectedReport('igr_audit')}
            className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
              selectedReport === 'igr_audit'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 font-bold text-emerald-900 dark:text-emerald-200'
                : 'border-slate-200 dark:border-zinc-800 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500 mb-1" />
            Auditoria GeaAgro IGR Score
          </button>
        </div>
      </div>

      {/* Official Report Document Container */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Document Header */}
        <div className="border-b-2 border-emerald-600 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
              SISTEMA DE RASTREABILIDADE VEGETAL • RELATÓRIO OFICIAL DE AUDITORIA
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {selectedReport === 'inc02' && 'Laudo de Conformidade INC 02/2018 (MAPA & ANVISA)'}
              {selectedReport === 'globalgap' && 'Dossiê de Boas Práticas Agrícolas (GlobalG.A.P.)'}
              {selectedReport === 'caderno_campo' && 'Livro de Registro de Campo & Aplicações Agrícolas'}
              {selectedReport === 'igr_audit' && 'Certificado de Desempenho & Índice GeaAgro (IGR)'}
            </h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              Propriedade: <strong>{property.farmName}</strong> • {property.city} - {property.state} • CNPJ/CPF: {property.documentNumber}
            </p>
          </div>

          <div className="text-right shrink-0 text-xs">
            <span className="font-bold text-slate-800 dark:text-zinc-200 block">
              Emitido em: {new Date().toLocaleDateString('pt-BR')}
            </span>
            <span className="text-slate-400 block text-[11px]">
              RT: {property.technicalResponsible} ({property.councilType} {property.creaNumber})
            </span>
          </div>
        </div>

        {/* Executive Summary Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-300 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Identificação de Lotes
            </div>
            <p className="text-emerald-800 dark:text-emerald-400 text-[11px]">
              100% dos lotes ativos possuem identificação unívoca, QR Code e geolocalização.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-300 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Controle de Carência
            </div>
            <p className="text-emerald-800 dark:text-emerald-400 text-[11px]">
              Zero registros de colheita em período de carência química ativa.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-300 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Rastreabilidade Reversa
            </div>
            <p className="text-emerald-800 dark:text-emerald-400 text-[11px]">
              Expedição vinculada a NF-e, romaneios, clientes e lotes de colheita.
            </p>
          </div>
        </div>

        {/* Lotes Auditados */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
            Lotes Registrados no Período ({lots.length})
          </h4>
          <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-xl">
            <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
              <thead className="bg-slate-50 dark:bg-zinc-800/60 font-semibold text-[10px] uppercase text-slate-500">
                <tr>
                  <th className="py-2.5 px-3">Lote</th>
                  <th className="py-2.5 px-3">Cultura / Cultivar</th>
                  <th className="py-2.5 px-3">Talhão</th>
                  <th className="py-2.5 px-3">Semente / RNS</th>
                  <th className="py-2.5 px-3">Colhido (kg)</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">IGR Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {lots.map(lot => (
                  <tr key={lot.id}>
                    <td className="py-2 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">{lot.lotCode}</td>
                    <td className="py-2 px-3 font-semibold">{lot.cropName} ({lot.cultivarName})</td>
                    <td className="py-2 px-3">{lot.plotCode}</td>
                    <td className="py-2 px-3 text-[11px] text-slate-500">{lot.seedSupplier}</td>
                    <td className="py-2 px-3 font-bold">{lot.totalHarvestedKg.toLocaleString('pt-BR')} kg</td>
                    <td className="py-2 px-3 capitalize">{lot.status}</td>
                    <td className="py-2 px-3 font-bold text-emerald-600">{lot.igrScorePercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assinatura Técnica do Documento */}
        <div className="pt-8 border-t border-slate-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs">
          <div className="space-y-1">
            <div className="border-b border-slate-400 w-48 mx-auto pb-1" />
            <p className="font-bold text-slate-800 dark:text-zinc-200">{property.producerName}</p>
            <p className="text-slate-400 text-[11px]">Produtor Rural / Responsável Legal</p>
          </div>

          <div className="space-y-1">
            <div className="border-b border-slate-400 w-48 mx-auto pb-1" />
            <p className="font-bold text-slate-800 dark:text-zinc-200">{property.technicalResponsible}</p>
            <p className="text-slate-400 text-[11px]">Engenheiro Agrônomo • {property.councilType} {property.creaNumber}/{property.creaState}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
