import React from 'react';
import { CaprineAnimal, CaprineMilkRecord, CaprineHealthRecord, CaprineReproductionRecord } from '../../types/caprine';
import { FileText, Download, Printer, Award, BarChart3, CheckCircle2, ShieldCheck } from 'lucide-react';

interface Props {
  animals: CaprineAnimal[];
  milkLogs: CaprineMilkRecord[];
  healthRecords: CaprineHealthRecord[];
  reproductionRecords: CaprineReproductionRecord[];
}

export const CaprineReportsView: React.FC<Props> = ({
  animals,
  milkLogs,
  healthRecords,
  reproductionRecords
}) => {
  const handlePrintReport = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const csvRows = [
      ['Brinco', 'Nome', 'Raca', 'Sexo', 'Categoria', 'PesoKg', 'ECC', 'Status'],
      ...animals.map(a => [a.earTag, a.name, a.breed, a.sex, a.category, a.weightKg, a.bodyConditionScore, a.status])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rebanho_Caprinos_GeaAgro_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 print:p-0 print:bg-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm print:hidden">
        <div>
          <h1 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            Relatórios Zootécnicos, Livro de Campo & Exportação Offline
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Gere boletins oficiais do rebanho, extrato de produção de leite, relatórios sanitários e arquivos CSV/PDF 100% offline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-800 dark:text-stone-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 border border-stone-200 dark:border-zinc-700"
          >
            <Download className="w-4 h-4" />
            Exportar Planilha (CSV)
          </button>
          <button
            onClick={handlePrintReport}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimir Relatório (PDF)
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-md space-y-6 text-stone-900 font-sans">
        {/* Document Header */}
        <div className="flex justify-between items-start border-b-2 border-emerald-600 pb-4">
          <div>
            <span className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-2.5 py-1 rounded">
              GeaAgro Suite • Módulo Caprinos
            </span>
            <h2 className="text-2xl font-black tracking-tight mt-1 text-stone-900">Relatório Geral Zootécnico & Produtivo</h2>
            <p className="text-xs text-stone-500">Fazenda Caprina Sertão Verde • Emitido em: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          <div className="text-right font-mono text-xs text-stone-600">
            <p className="font-bold">Total Caprinos: {animals.length}</p>
            <p>Sincronização: Local (100% Offline)</p>
          </div>
        </div>

        {/* Executive Metrics Summary */}
        <div className="grid grid-cols-4 gap-4 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200">
          <div>
            <span className="text-stone-500 block uppercase font-bold text-[10px]">Total do Rebanho</span>
            <span className="text-lg font-black text-stone-900">{animals.length} cabeças</span>
          </div>
          <div>
            <span className="text-stone-500 block uppercase font-bold text-[10px]">Cabras em Lactação</span>
            <span className="text-lg font-black text-sky-600">
              {animals.filter(a => a.category === 'Cabra em Lactação').length}
            </span>
          </div>
          <div>
            <span className="text-stone-500 block uppercase font-bold text-[10px]">Média Produção</span>
            <span className="text-lg font-black text-emerald-600">4.2 L/cabra/dia</span>
          </div>
          <div>
            <span className="text-stone-500 block uppercase font-bold text-[10px]">Índice IEC</span>
            <span className="text-lg font-black text-emerald-700">89.4 / 100</span>
          </div>
        </div>

        {/* Animal Inventory List */}
        <div className="space-y-2">
          <h3 className="font-extrabold text-sm uppercase text-stone-800 border-b pb-1">1. Inventário do Rebanho Caprino</h3>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b bg-stone-100 text-stone-700 font-bold uppercase text-[10px]">
                <th className="p-2">Brinco / ID</th>
                <th className="p-2">Nome</th>
                <th className="p-2">Raça</th>
                <th className="p-2">Sexo</th>
                <th className="p-2">Categoria</th>
                <th className="p-2">Peso (kg)</th>
                <th className="p-2">ECC (1-5)</th>
                <th className="p-2">FAMACHA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 font-medium">
              {animals.map(a => (
                <tr key={a.id}>
                  <td className="p-2 font-mono font-bold">{a.earTag}</td>
                  <td className="p-2 font-bold">{a.name}</td>
                  <td className="p-2">{a.breed}</td>
                  <td className="p-2">{a.sex}</td>
                  <td className="p-2">{a.category}</td>
                  <td className="p-2 font-bold text-emerald-700">{a.weightKg} kg</td>
                  <td className="p-2">{a.bodyConditionScore}</td>
                  <td className="p-2 font-bold">Grau {a.famachaScore || 1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sanitation Summary */}
        <div className="space-y-2 pt-2">
          <h3 className="font-extrabold text-sm uppercase text-stone-800 border-b pb-1">2. Ocorrências Sanitárias & Vacinações Recentes</h3>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b bg-stone-100 text-stone-700 font-bold uppercase text-[10px]">
                <th className="p-2">Data</th>
                <th className="p-2">Caprino</th>
                <th className="p-2">Tipo</th>
                <th className="p-2">Produto</th>
                <th className="p-2">Carência Leite/Carne</th>
                <th className="p-2">Veterinário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 font-medium">
              {healthRecords.slice(0, 5).map(h => {
                const goat = animals.find(a => a.id === h.animalId);
                return (
                  <tr key={h.id}>
                    <td className="p-2 font-mono">{h.date}</td>
                    <td className="p-2 font-bold">{goat ? `${goat.earTag} - ${goat.name}` : h.animalId}</td>
                    <td className="p-2">{h.type}</td>
                    <td className="p-2 font-bold">{h.productName}</td>
                    <td className="p-2">Leite: {h.withdrawalMilkDays}d | Carne: {h.withdrawalMeatDays}d</td>
                    <td className="p-2">{h.veterinarian}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Stamp */}
        <div className="pt-6 border-t text-center text-xs text-stone-500 space-y-1">
          <p className="font-bold">GeaAgro Suite Caprinos • Plataforma Integrada de Gestão Caprina 100% Offline</p>
          <p className="text-[10px]">Documento gerado automaticamente sem dependência de internet.</p>
        </div>
      </div>
    </div>
  );
};
