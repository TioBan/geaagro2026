import React from 'react';
import {
  CaprineAnimal,
  CaprineMilkRecord,
  CaprineHealthRecord,
  CaprineReproductionRecord
} from '../../types/caprine';
import { FileText, Download, Printer } from 'lucide-react';

interface Props {
  animals: CaprineAnimal[];
  milkLogs: CaprineMilkRecord[];
  healthRecords: CaprineHealthRecord[];
  reproductionRecords: CaprineReproductionRecord[];
}

function escapeCsvCell(val: string | number): string {
  const s = String(val ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const CaprineReportsView: React.FC<Props> = ({
  animals,
  milkLogs,
  healthRecords,
  reproductionRecords
}) => {
  const lactatingCount = animals.filter(
    a => a.status === 'Ativo' && a.category === 'Cabra em Lactação'
  ).length;
  const avgMilkPerRecord =
    milkLogs.length > 0
      ? (milkLogs.reduce((acc, m) => acc + m.totalLiters, 0) / milkLogs.length).toFixed(1)
      : '0.0';
  const famachaAlerts = animals.filter(
    a => a.status === 'Ativo' && (a.famachaScore || 1) >= 3
  ).length;
  const iecScore = 70 + (famachaAlerts === 0 ? 20 : Math.max(8, 20 - famachaAlerts * 3));

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const csvRows = [
      ['Brinco', 'Nome', 'Raca', 'Sexo', 'Categoria', 'PesoKg', 'ECC', 'FAMACHA', 'Status'],
      ...animals.map(a => [
        a.earTag,
        a.name,
        a.breed,
        a.sex,
        a.category,
        a.weightKg,
        a.bodyConditionScore,
        a.famachaScore ?? 1,
        a.status
      ])
    ];
    const csvBody = csvRows.map(row => row.map(escapeCsvCell).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvBody], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rebanho_Caprinos_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 print:p-0 print:bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            Relatórios Zootécnicos &amp; Exportação
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Boletim consolidado do rebanho, produção leiteira, sanidade e reprodução em PDF ou CSV.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="h-8 px-3 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium rounded-lg border border-slate-200 dark:border-zinc-800 inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={handlePrintReport}
            className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Report Document Surface */}
      <div className="bg-white dark:bg-zinc-900 print:bg-white p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-zinc-800 print:border-0 space-y-6 text-slate-900 dark:text-zinc-100 print:text-slate-900">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 print:border-slate-300 pb-4">
          <div>
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 print:text-emerald-700">
              Módulo Caprinos · Relatório Técnico
            </span>
            <h2 className="text-base font-semibold tracking-tight mt-0.5">
              Boletim Geral Zootécnico &amp; Produtivo
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 print:text-slate-600">
              Emitido em {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="text-left sm:text-right font-mono text-xs text-slate-600 dark:text-zinc-400 print:text-slate-600 tabular-nums">
            <p className="font-medium text-slate-900 dark:text-zinc-100 print:text-slate-900">
              Plantel: {animals.length} cabeça(s)
            </p>
            <p>
              {milkLogs.length} ordenha(s) · {healthRecords.length} sanit. ·{' '}
              {reproductionRecords.length} repr.
            </p>
          </div>
        </div>

        {/* Executive Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border border-slate-200 dark:border-zinc-800 print:border-slate-300 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800 print:divide-slate-300 overflow-hidden bg-slate-50/50 dark:bg-zinc-950/30 print:bg-slate-50">
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              Total Rebanho
            </span>
            <span className="text-base font-semibold tabular-nums">{animals.length} cab.</span>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              Em Lactação
            </span>
            <span className="text-base font-semibold tabular-nums text-sky-600 dark:text-sky-400 print:text-sky-700">
              {lactatingCount}
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              Média Produção
            </span>
            <span className="text-base font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 print:text-emerald-700">
              {avgMilkPerRecord} L/reg.
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Índice IEC</span>
            <span className="text-base font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 print:text-emerald-700">
              {iecScore} / 100
            </span>
          </div>
        </div>

        {/* Section 1: Herd Inventory */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 print:text-slate-700">
            1. Inventário do Rebanho Caprino
          </h3>
          {animals.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400 py-2">
              Nenhum caprino cadastrado.
            </p>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 print:border-slate-300 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-950/60 print:bg-slate-100 text-slate-500 dark:text-zinc-400 print:text-slate-700 border-b border-slate-200 dark:border-zinc-800 print:border-slate-300 text-[11px] font-medium">
                  <tr>
                    <th className="px-3 py-2">Brinco</th>
                    <th className="px-3 py-2">Nome</th>
                    <th className="px-3 py-2">Raça</th>
                    <th className="px-3 py-2">Sexo</th>
                    <th className="px-3 py-2">Categoria</th>
                    <th className="px-3 py-2 text-right">Peso</th>
                    <th className="px-3 py-2 text-right">ECC</th>
                    <th className="px-3 py-2">FAMACHA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 print:divide-slate-200">
                  {animals.map(a => (
                    <tr key={a.id}>
                      <td className="px-3 py-2 font-mono font-medium">{a.earTag}</td>
                      <td className="px-3 py-2 font-medium">{a.name}</td>
                      <td className="px-3 py-2 text-slate-600 dark:text-zinc-400 print:text-slate-700">
                        {a.breed}
                      </td>
                      <td className="px-3 py-2 text-slate-600 dark:text-zinc-400 print:text-slate-700">
                        {a.sex}
                      </td>
                      <td className="px-3 py-2 text-slate-600 dark:text-zinc-400 print:text-slate-700">
                        {a.category}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums font-medium text-emerald-700 dark:text-emerald-400 print:text-emerald-800">
                        {a.weightKg} kg
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{a.bodyConditionScore}</td>
                      <td className="px-3 py-2 tabular-nums">Grau {a.famachaScore || 1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 2: Sanitation */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 print:text-slate-700">
            2. Ocorrências Sanitárias &amp; Vacinações Recentes
          </h3>
          {healthRecords.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400 py-2">
              Nenhuma ocorrência sanitária registrada.
            </p>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 print:border-slate-300 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-950/60 print:bg-slate-100 text-slate-500 dark:text-zinc-400 print:text-slate-700 border-b border-slate-200 dark:border-zinc-800 print:border-slate-300 text-[11px] font-medium">
                  <tr>
                    <th className="px-3 py-2">Data</th>
                    <th className="px-3 py-2">Caprino</th>
                    <th className="px-3 py-2">Tipo</th>
                    <th className="px-3 py-2">Produto</th>
                    <th className="px-3 py-2">Carência</th>
                    <th className="px-3 py-2">Veterinário</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 print:divide-slate-200">
                  {healthRecords.slice(0, 10).map(h => {
                    const goat = animals.find(a => a.id === h.animalId);
                    return (
                      <tr key={h.id}>
                        <td className="px-3 py-2 font-mono">{h.date}</td>
                        <td className="px-3 py-2 font-medium">
                          {goat ? `${goat.earTag} — ${goat.name}` : h.animalId}
                        </td>
                        <td className="px-3 py-2">{h.type}</td>
                        <td className="px-3 py-2 font-medium">{h.productName}</td>
                        <td className="px-3 py-2 tabular-nums">
                          L: {h.withdrawalMilkDays}d · C: {h.withdrawalMeatDays}d
                        </td>
                        <td className="px-3 py-2">{h.veterinarian}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 3: Reproduction */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 print:text-slate-700">
            3. Histórico Reprodutivo Recente
          </h3>
          {reproductionRecords.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400 py-2">
              Nenhum evento reprodutivo registrado.
            </p>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 print:border-slate-300 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-950/60 print:bg-slate-100 text-slate-500 dark:text-zinc-400 print:text-slate-700 border-b border-slate-200 dark:border-zinc-800 print:border-slate-300 text-[11px] font-medium">
                  <tr>
                    <th className="px-3 py-2">Data</th>
                    <th className="px-3 py-2">Matriz</th>
                    <th className="px-3 py-2">Evento</th>
                    <th className="px-3 py-2">Reprodutor / Sêmen</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2 text-right">Crias</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 print:divide-slate-200">
                  {reproductionRecords.slice(0, 10).map(r => {
                    const matrix = animals.find(a => a.id === r.animalId);
                    return (
                      <tr key={r.id}>
                        <td className="px-3 py-2 font-mono">{r.date}</td>
                        <td className="px-3 py-2 font-medium">
                          {matrix ? `${matrix.earTag} — ${matrix.name}` : r.animalId}
                        </td>
                        <td className="px-3 py-2">{r.eventType}</td>
                        <td className="px-3 py-2">{r.sireName || '--'}</td>
                        <td className="px-3 py-2">{r.pregnancyStatus || '--'}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{r.kidsCount ?? '--'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
