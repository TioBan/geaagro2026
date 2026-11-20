import React, { useMemo, useState } from 'react';
import { ChevronRight, Compass, Plus, Search, Sprout } from 'lucide-react';
import { HydroponicBench, NutrientSolutionReservoir } from '../../types/hydroponics';
import { BENCH_STATUS_META, formatBrDate, HYDRO_INPUT_CLASS } from './hydroponicsUi';

interface HydroponicsBenchesViewProps {
  mode: 'mapa_estufa' | 'producao_bancadas';
  benches: HydroponicBench[];
  reservoirs: NutrientSolutionReservoir[];
  onSelectBench: (bench: HydroponicBench) => void;
  onOpenNewBench: () => void;
  onUpdateBenchStatus: (benchId: string, status: HydroponicBench['status']) => void;
}

export const HydroponicsBenchesView: React.FC<HydroponicsBenchesViewProps> = ({
  mode,
  benches,
  reservoirs,
  onSelectBench,
  onOpenNewBench,
  onUpdateBenchStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | HydroponicBench['status']>('todos');

  const filteredBenches = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return benches.filter((b) => {
      if (statusFilter !== 'todos' && b.status !== statusFilter) return false;
      if (!q) return true;
      return (
        b.code.toLowerCase().includes(q) ||
        b.cropName.toLowerCase().includes(q) ||
        b.cultivar.toLowerCase().includes(q) ||
        b.greenhouseSection.toLowerCase().includes(q)
      );
    });
  }, [benches, searchTerm, statusFilter]);

  const filterOptions: { id: 'todos' | HydroponicBench['status']; label: string }[] = [
    { id: 'todos', label: 'Todas' },
    { id: 'maternidade', label: 'Berçário' },
    { id: 'desenvolvimento', label: 'Desenvolvimento' },
    { id: 'pronto_colheita', label: 'Pronto p/ Colheita' },
    { id: 'vazia', label: 'Vazias' },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
      {/* Header + Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
            {mode === 'mapa_estufa' ? (
              <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            )}
            {mode === 'mapa_estufa'
              ? 'Planta Baixa & Mapa Digital das Bancadas'
              : 'Controle de Bancadas & Lotes'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            {mode === 'mapa_estufa'
              ? 'Selecione uma bancada para inspecionar lote, reservatório vinculado e previsão de colheita.'
              : 'Acompanhe canais, datas de transplante, idade do lote, produção estimada e estágio.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewBench}
          className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Nova Bancada
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por código, cultura ou setor..."
            className={`${HYDRO_INPUT_CLASS} pl-8`}
          />
        </div>

        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 overflow-x-auto">
          {filterOptions.map((opt) => {
            const active = statusFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStatusFilter(opt.id)}
                className={`h-7 px-2.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredBenches.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/60 p-8 text-center space-y-2.5">
          <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
            {benches.length === 0
              ? 'Nenhuma bancada hidropônica cadastrada'
              : 'Nenhuma bancada corresponde aos filtros aplicados'}
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
            {benches.length === 0
              ? 'Cadastre bancadas NFT, DFT ou calhas de substrato para visualizar a planta baixa e controlar ciclos de colheita.'
              : 'Limpe a busca ou troque o filtro de estágio para visualizar todas as bancadas.'}
          </p>
          {benches.length === 0 && (
            <button
              type="button"
              onClick={onOpenNewBench}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Cadastrar Primeira Bancada
            </button>
          )}
        </div>
      ) : mode === 'mapa_estufa' ? (
        /* Interactive Greenhouse Grid Map */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredBenches.map((bench) => {
            const res = reservoirs.find((r) => r.id === bench.reservoirId);
            const meta = BENCH_STATUS_META[bench.status];
            return (
              <button
                key={bench.id}
                type="button"
                onClick={() => onSelectBench(bench)}
                className="text-left rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/60 hover:border-emerald-500/70 p-3.5 transition-colors cursor-pointer space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
                      <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200">
                        {bench.code}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{bench.systemType.replace('_', ' ')}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate mt-0.5">
                      {bench.cropName}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                      {bench.cultivar || 'Cultivar não informada'}
                    </p>
                  </div>

                  <span className={`text-[11px] font-medium whitespace-nowrap shrink-0 ${meta.textClass}`}>
                    {meta.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-200/70 dark:border-zinc-800 text-[11px] tabular-nums">
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 block">Idade do Lote</span>
                    <strong className="text-slate-800 dark:text-zinc-200">
                      {bench.daysAfterTransplant} dias (DAT)
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 block">Colheita Prev.</span>
                    <strong className="text-slate-800 dark:text-zinc-200">
                      {formatBrDate(bench.expectedHarvestDate)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 block">Lotação</span>
                    <strong className="text-slate-800 dark:text-zinc-200">
                      {bench.currentPlantsCount} / {bench.totalCapacityPlants} un
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 block">Reservatório</span>
                    <strong className="text-emerald-700 dark:text-emerald-400">
                      {res
                        ? `pH ${res.currentPH.toFixed(1)} · CE ${res.currentEC.toFixed(1)}`
                        : 'Não vinculado'}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 dark:border-zinc-800 text-[11px]">
                  <span className="text-slate-500 dark:text-zinc-400 truncate">
                    {bench.greenhouseSection}
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium inline-flex items-center gap-0.5 shrink-0">
                    Detalhes <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* High-Density Benches Table */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse tabular-nums">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                <th className="py-2 px-2.5">Bancada / Setor</th>
                <th className="py-2 px-2.5">Cultura / Cultivar</th>
                <th className="py-2 px-2.5 text-right">Idade</th>
                <th className="py-2 px-2.5">Transplante</th>
                <th className="py-2 px-2.5">Colheita Prev.</th>
                <th className="py-2 px-2.5 text-right">Plantas</th>
                <th className="py-2 px-2.5 text-right">Est. (kg)</th>
                <th className="py-2 px-2.5">Estágio</th>
                <th className="py-2 px-2.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {filteredBenches.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <td className="py-2.5 px-2.5">
                    <div className="font-mono font-semibold text-slate-900 dark:text-zinc-100">
                      {b.code}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                      {b.systemType.replace('_', ' ')} · {b.greenhouseSection}
                    </div>
                  </td>
                  <td className="py-2.5 px-2.5">
                    <div className="font-medium text-slate-900 dark:text-zinc-100">{b.cropName}</div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400">{b.cultivar}</div>
                  </td>
                  <td className="py-2.5 px-2.5 text-right text-slate-700 dark:text-zinc-300">
                    {b.daysAfterTransplant} d
                  </td>
                  <td className="py-2.5 px-2.5 text-slate-600 dark:text-zinc-400">
                    {formatBrDate(b.transplantDate)}
                  </td>
                  <td className="py-2.5 px-2.5 font-medium text-slate-800 dark:text-zinc-200">
                    {formatBrDate(b.expectedHarvestDate)}
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-medium text-slate-900 dark:text-zinc-100">
                    {b.currentPlantsCount.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-medium text-emerald-700 dark:text-emerald-400">
                    {b.estimatedYieldKg} kg
                  </td>
                  <td className="py-2.5 px-2.5">
                    <select
                      value={b.status}
                      onChange={(e) =>
                        onUpdateBenchStatus(b.id, e.target.value as HydroponicBench['status'])
                      }
                      aria-label={`Alterar estágio da bancada ${b.code}`}
                      className="h-7 px-2 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-[11px] font-medium text-slate-700 dark:text-zinc-200"
                    >
                      <option value="maternidade">Berçário</option>
                      <option value="desenvolvimento">Desenvolvimento</option>
                      <option value="pronto_colheita">Pronto p/ Colheita</option>
                      <option value="vazia">Vazia</option>
                    </select>
                  </td>
                  <td className="py-2.5 px-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectBench(b)}
                      className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
