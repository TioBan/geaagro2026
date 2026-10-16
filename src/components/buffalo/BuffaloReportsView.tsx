import React from 'react';
import { BuffaloAnimal, BuffaloPaddock } from '../../types/buffalo';
import {
  FileText,
  Download,
  Printer,
  Table,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers3
} from 'lucide-react';

interface BuffaloReportsViewProps {
  animals: BuffaloAnimal[];
  paddocks: BuffaloPaddock[];
}

export const BuffaloReportsView: React.FC<BuffaloReportsViewProps> = ({
  animals,
  paddocks
}) => {
  const handleExportCSV = () => {
    const headers = ['Identificacao', 'Nome', 'Raca', 'Sexo', 'Categoria', 'PesoKg', 'ECC', 'Status', 'Lote', 'LeiteDiarioL', 'GorduraPct'];
    const rows = animals.map(a => [
      a.identificationNumber,
      `"${a.name}"`,
      a.breed,
      a.sex,
      a.category,
      a.currentWeightKg,
      a.bodyConditionScore,
      a.status,
      `"${a.batchName}"`,
      a.averageDailyMilkLiters || 0,
      a.averageFatPct || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_bubalinos_geaagro_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner de Relatórios */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 block">
            Central de Inteligência &amp; Exportações
          </span>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <span>Relatórios Zootécnicos &amp; Laudos Oficiais</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Exportação de dados completos do rebanho compatível com Excel e Associação Brasileira de Criadores de Búfalos (ABCB).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV / Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Laudo</span>
          </button>
        </div>
      </div>

      {/* Tabela do Relatório do Rebanho */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
          Inventário Zootécnico Geral ({animals.length} Animais)
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-800 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Brinco</th>
                <th className="p-3">Nome</th>
                <th className="p-3">Raça / Grau</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Peso Atual</th>
                <th className="p-3">ECC</th>
                <th className="p-3">Status</th>
                <th className="p-3">Produção Leite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {animals.map((animal) => (
                <tr key={animal.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{animal.identificationNumber}</td>
                  <td className="p-3 font-medium text-slate-700 dark:text-zinc-300">{animal.name}</td>
                  <td className="p-3">{animal.breed} ({animal.bloodDegree})</td>
                  <td className="p-3">{animal.category}</td>
                  <td className="p-3 font-bold">{animal.currentWeightKg} kg</td>
                  <td className="p-3 font-semibold">{animal.bodyConditionScore}</td>
                  <td className="p-3 font-bold text-teal-600">{animal.status}</td>
                  <td className="p-3 font-black text-blue-600">
                    {animal.averageDailyMilkLiters ? `${animal.averageDailyMilkLiters} L/dia (${animal.averageFatPct}%)` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
