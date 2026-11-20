import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  Filter,
  ShieldAlert,
  PackageCheck,
} from 'lucide-react';
import { FORMULATION_DATABASE, TANKMIX_PRODUCTS_DATABASE } from '../../data/tankMixData';
import { FormulationInfo } from '../../types/tankMix';

const CATEGORY_OPTIONS = [
  { id: 'all', label: 'Todas' },
  { id: 'solido', label: 'Sólidos' },
  { id: 'liquido', label: 'Líquidos' },
  { id: 'oleo', label: 'Óleos' },
  { id: 'encapsulado', label: 'Encaps.' },
] as const;

export const TankMixFormulationsLibraryView: React.FC = () => {
  const [selectedFormulation, setSelectedFormulation] = useState<FormulationInfo>(FORMULATION_DATABASE[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'solido' | 'liquido' | 'encapsulado' | 'oleo'>('all');

  const filtered = FORMULATION_DATABASE.filter(f => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      f.code.toLowerCase().includes(q) ||
      f.fullName.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (categoryFilter === 'solido') return ['WP', 'WG', 'DF', 'SP', 'SG', 'WSB'].includes(f.code);
    if (categoryFilter === 'encapsulado') return ['CS', 'ZC', 'ME'].includes(f.code);
    if (categoryFilter === 'oleo') return ['EC', 'OD', 'EW', 'SE'].includes(f.code);
    if (categoryFilter === 'liquido') return ['SC', 'SL', 'AS', 'DC', 'FS'].includes(f.code);
    return true;
  });

  const matchingProducts = TANKMIX_PRODUCTS_DATABASE.filter(
    p => p.formulation === selectedFormulation.code
  );

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
          Biblioteca de Formulações de Defensivos
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Comportamento físico em água, filtragem recomendada e ordem oficial WALES por sigla
        </p>
      </div>

      {/* Layout Mestre-Detalhe */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Lista Esquerda */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-3 border-b border-slate-100 dark:border-zinc-800 space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar sigla ou tipo (ex: ZC, WG)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="inline-flex flex-wrap items-center gap-0.5 p-0.5 bg-slate-100 dark:bg-zinc-800 rounded-lg w-full">
              {CATEGORY_OPTIONS.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`flex-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800 max-h-[540px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 dark:text-zinc-400">
                Nenhuma formulação encontrada.
              </div>
            ) : (
              filtered.map(f => {
                const isSelected = selectedFormulation.code === f.code;
                return (
                  <button
                    key={f.code}
                    type="button"
                    onClick={() => setSelectedFormulation(f)}
                    className={`w-full px-3.5 py-2.5 text-left transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/35'
                        : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-mono font-semibold ${
                            isSelected
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-slate-700 dark:text-zinc-300'
                          }`}
                        >
                          {f.code}
                        </span>
                        <span className="text-xs font-medium text-slate-900 dark:text-zinc-100 truncate">
                          {f.fullName.split('(')[0].trim()}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                        {f.mixingOrderGroup}
                      </div>
                    </div>
                    <span className="text-[11px] tabular-nums text-slate-400 dark:text-zinc-500 whitespace-nowrap shrink-0">
                      Passo {f.mixingOrderIndex}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Detalhes da Formulação */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          {/* Cabeçalho da Formulação */}
          <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-zinc-400">
                <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                  {selectedFormulation.code}
                </span>
                <span aria-hidden="true">·</span>
                <span>{selectedFormulation.mixingOrderGroup}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">Ordem WALES #{selectedFormulation.mixingOrderIndex}</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                {selectedFormulation.fullName}
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                {selectedFormulation.description}
              </p>
            </div>

            <div className="shrink-0 md:text-right">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                Agitação recomendada
              </span>
              <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                {selectedFormulation.recommendedAgitation}
              </span>
            </div>
          </div>

          {/* Especificações Técnicas */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-zinc-800 border-b border-slate-100 dark:border-zinc-800">
            <div className="md:col-span-2 p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200">
                <Droplets className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Comportamento físico em água</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                {selectedFormulation.waterBehavior}
              </p>
            </div>

            <div className="p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200">
                <Filter className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Filtro recomendado</span>
              </div>
              <p className="text-xs font-medium text-slate-700 dark:text-zinc-300 leading-relaxed">
                {selectedFormulation.filterMeshRecommendation || 'Filtro padrão malha 50 a 80 mesh.'}
              </p>
            </div>
          </div>

          {selectedFormulation.carrierCompatibilityNotes && (
            <div className="px-4 py-3.5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/40 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Compatibilidade com veículo e óleo</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                {selectedFormulation.carrierCompatibilityNotes}
              </p>
            </div>
          )}

          {/* Vantagens e Cuidados */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-zinc-800 border-b border-slate-100 dark:border-zinc-800">
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Vantagens agronômicas</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-zinc-400">
                {selectedFormulation.advantages.map((adv, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 select-none">·</span>
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Cuidados no preparo e restrições</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-zinc-400">
                {selectedFormulation.precautions.map((prec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 dark:text-amber-400 select-none">·</span>
                    <span>{prec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Produtos Comerciais com esta Formulação */}
          {matchingProducts.length > 0 && (
            <div className="p-4 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200">
                <PackageCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  Exemplos cadastrados no TankMix ({selectedFormulation.code})
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 border-t border-slate-100 dark:border-zinc-800 pt-2">
                {matchingProducts.map(p => (
                  <div key={p.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 dark:text-zinc-100 truncate">
                        {p.commercialName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                        {p.activeIngredient} · {p.manufacturer}
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 shrink-0">
                      {p.formulation}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
