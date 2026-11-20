import React, { useMemo } from 'react';
import { BuffaloAnimal, BuffaloPaddock } from '../../types/buffalo';
import { Download, Printer, FileSpreadsheet } from 'lucide-react';

interface BuffaloReportsViewProps {
  animals: BuffaloAnimal[];
  paddocks: BuffaloPaddock[];
}

function escapeCsvCell(value: string | number | undefined): string {
  const str = value === undefined || value === null ? '' : String(value);
  if (/[",\n\r;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export const BuffaloReportsView: React.FC<BuffaloReportsViewProps> = ({
  animals,
  paddocks,
}) => {
  const summary = useMemo(() => {
    const lactating = animals.filter((a) => a.status === 'Em Lactação');
    const dailyMilk = lactating.reduce((sum, a) => sum + (a.averageDailyMilkLiters || 0), 0);
    const totalArea = paddocks.reduce((sum, p) => sum + (p.areaHa || 0), 0);
    const avgWeight =
      animals.length > 0
        ? animals.reduce((sum, a) => sum + (a.currentWeightKg || 0), 0) / animals.length
        : 0;

    return {
      totalAnimals: animals.length,
      lactatingCount: lactating.length,
      dailyMilk,
      totalArea,
      avgWeight,
    };
  }, [animals, paddocks]);

  const handleExportCSV = () => {
    const headers = [
      'Brinco',
      'Nome',
      'Raca',
      'Sexo',
      'Categoria',
      'Finalidade',
      'Status',
      'Lote',
      'Peso_kg',
      'ECC',
      'Leite_L_dia',
      'Gordura_pct',
      'Proteina_pct',
      'Partos',
      'Conforto_Termico',
    ];

    const rows = animals.map((a) =>
      [
        a.identificationNumber,
        a.name,
        a.breed,
        a.sex,
        a.category,
        a.purpose,
        a.status,
        a.batchName,
        a.currentWeightKg,
        a.bodyConditionScore,
        a.averageDailyMilkLiters ?? 0,
        a.averageFatPct ?? '',
        a.averageProteinPct ?? '',
        a.parityCount,
        a.thermalComfortScore,
      ]
        .map(escapeCsvCell)
        .join(';')
    );

    const csvContent = `\uFEFF${headers.join(';')}\r\n${rows.join('\r\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-bubalinos-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Cabeçalho e Exportação */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Relatórios Zootécnicos &amp; Exportação
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Inventário consolidado do rebanho bubalino e panorama das áreas de pastagem pronto para impressão ou planilha.
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={animals.length === 0}
            className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="h-8 px-3.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir Laudo
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-zinc-800">
        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Rebanho Total</span>
          <p className="text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
            {summary.totalAnimals} cab
          </p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            Peso médio: {summary.avgWeight.toFixed(0)} kg
          </p>
        </div>
        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Matrizes em Lactação</span>
          <p className="text-lg font-semibold text-teal-600 dark:text-teal-400 tabular-nums mt-0.5">
            {summary.lactatingCount}
          </p>
        </div>
        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Produção Diária Total</span>
          <p className="text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
            {summary.dailyMilk.toFixed(1)} L/dia
          </p>
        </div>
        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Área de Pastagem</span>
          <p className="text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
            {summary.totalArea.toFixed(1)} ha
          </p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            {paddocks.length} piquetes
          </p>
        </div>
      </div>

      {/* Tabela 1: Inventário do Rebanho */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            Inventário Zootécnico Individual ({animals.length})
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            Emissão: {new Date().toLocaleDateString('pt-BR')}
          </span>
        </div>

        {animals.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 dark:text-zinc-400">
            Nenhum animal cadastrado para compor o inventário.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                  <th className="py-2 px-3.5">Brinco</th>
                  <th className="py-2 px-3">Nome / Raça</th>
                  <th className="py-2 px-3">Categoria</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Peso (kg)</th>
                  <th className="py-2 px-3 text-right">ECC</th>
                  <th className="py-2 px-3 text-right">Leite (L/d)</th>
                  <th className="py-2 px-3.5 text-right">Conforto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs tabular-nums">
                {animals.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/30">
                    <td className="py-2 px-3.5 font-medium text-slate-900 dark:text-zinc-100">
                      {a.identificationNumber}
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-medium text-slate-900 dark:text-zinc-100">{a.name}</span>
                      <span className="text-slate-500 dark:text-zinc-400 ml-1.5">({a.breed})</span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-zinc-300">{a.category}</td>
                    <td className="py-2 px-3 text-slate-700 dark:text-zinc-300">{a.status}</td>
                    <td className="py-2 px-3 text-right text-slate-900 dark:text-zinc-100">
                      {a.currentWeightKg}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700 dark:text-zinc-300">
                      {a.bodyConditionScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700 dark:text-zinc-300">
                      {a.averageDailyMilkLiters ? a.averageDailyMilkLiters.toFixed(1) : '—'}
                    </td>
                    <td className="py-2 px-3.5 text-right text-slate-700 dark:text-zinc-300">
                      {a.thermalComfortScore}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tabela 2: Panorama de Pastagens e Piquetes */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-zinc-300">
            Resumo de Pastagens &amp; Capacidade de Suporte ({paddocks.length})
          </h3>
        </div>

        {paddocks.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 dark:text-zinc-400">
            Nenhum piquete cadastrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                  <th className="py-2 px-3.5">Piquete</th>
                  <th className="py-2 px-3">Forrageira</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Área (ha)</th>
                  <th className="py-2 px-3 text-right">Lotação (UA/ha)</th>
                  <th className="py-2 px-3 text-right">Dossel (cm)</th>
                  <th className="py-2 px-3.5 text-right">Sombra (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs tabular-nums">
                {paddocks.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/30">
                    <td className="py-2 px-3.5 font-medium text-slate-900 dark:text-zinc-100">{p.name}</td>
                    <td className="py-2 px-3 text-slate-600 dark:text-zinc-300">{p.forageSpecies}</td>
                    <td className="py-2 px-3 text-slate-700 dark:text-zinc-300">{p.status}</td>
                    <td className="py-2 px-3 text-right text-slate-900 dark:text-zinc-100">
                      {p.areaHa.toFixed(1)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700 dark:text-zinc-300">
                      {p.currentStockingRateUaHa.toFixed(2)} / {p.carryingCapacityAnimalUnits.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700 dark:text-zinc-300">
                      {p.currentCanopyHeightCm}
                    </td>
                    <td className="py-2 px-3.5 text-right text-slate-700 dark:text-zinc-300">
                      {p.shadeAreaPct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
