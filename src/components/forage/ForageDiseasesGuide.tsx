import React, { useState, useMemo } from 'react';
import { FORAGES_CATALOG } from '../../data/foragesCatalogData';
import { ForageDisease, ForageItem } from '../../types/forage';
import { Search, Eye, X, ShieldCheck } from 'lucide-react';

interface ForageDiseasesGuideProps {
  onSelectForage: (forage: ForageItem) => void;
}

const AGENT_FILTERS: Array<{ id: 'todos' | ForageDisease['agentType']; label: string }> = [
  { id: 'todos', label: 'Todos' },
  { id: 'fungo', label: 'Fungos' },
  { id: 'inseto_praga', label: 'Pragas / Insetos' },
  { id: 'nematoide', label: 'Nematoides' },
  { id: 'bacteria', label: 'Bactérias' },
  { id: 'virus', label: 'Vírus' },
  { id: 'disturbio_fisiologico', label: 'Fisiológico / Solo' },
];

const AGENT_LABELS: Record<ForageDisease['agentType'], string> = {
  fungo: 'Fungo',
  inseto_praga: 'Praga / Inseto',
  nematoide: 'Nematoide',
  bacteria: 'Bactéria',
  virus: 'Vírus',
  disturbio_fisiologico: 'Distúrbio Fisiológico',
};

const SUSCEPTIBILITY_LABELS: Record<ForageDisease['susceptibilityLevel'], string> = {
  alta: 'Alta',
  moderada: 'Moderada',
  tolerante: 'Tolerante',
  resistente: 'Resistente',
};

export const ForageDiseasesGuide: React.FC<ForageDiseasesGuideProps> = ({ onSelectForage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [agentFilter, setAgentFilter] = useState<'todos' | ForageDisease['agentType']>('todos');

  const allDiseases = useMemo(() => {
    const list: Array<{
      disease: ForageDisease;
      forage: ForageItem;
    }> = [];

    for (const forage of FORAGES_CATALOG) {
      for (const disease of forage.diseasesAndPests) {
        list.push({ disease, forage });
      }
    }
    return list;
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return allDiseases.filter(({ disease, forage }) => {
      const matchesAgent = agentFilter === 'todos' || disease.agentType === agentFilter;
      if (!matchesAgent) return false;
      if (!q) return true;
      return (
        disease.name.toLowerCase().includes(q) ||
        (disease.scientificName?.toLowerCase().includes(q) ?? false) ||
        disease.symptoms.toLowerCase().includes(q) ||
        disease.controlAndManagement.toLowerCase().includes(q) ||
        forage.commonName.toLowerCase().includes(q) ||
        forage.cultivar.toLowerCase().includes(q)
      );
    });
  }, [allDiseases, searchTerm, agentFilter]);

  const hasFilters = searchTerm.trim() !== '' || agentFilter !== 'todos';

  const getSusceptibilityStyle = (level: ForageDisease['susceptibilityLevel']) => {
    switch (level) {
      case 'alta':
        return 'text-rose-700 dark:text-rose-400';
      case 'moderada':
        return 'text-amber-700 dark:text-amber-400';
      case 'resistente':
      case 'tolerante':
        return 'text-emerald-700 dark:text-emerald-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Guia de Sanidade, Pragas & Doenças
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Diagnóstico de sintomas, suscetibilidade por cultivar e protocolos de controle integrado.
            </p>
          </div>
          <span className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
            <strong className="font-semibold text-slate-800 dark:text-zinc-200">{filtered.length}</strong>{' '}
            de {allDiseases.length} registros
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center pt-2.5 border-t border-slate-100 dark:border-zinc-800">
          <div className="md:col-span-5 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar cigarrinha, morte súbita, ferrugem, cultivar..."
              className="w-full h-9 pl-8 pr-8 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/90 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Limpar busca"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="md:col-span-7 flex items-center gap-1 overflow-x-auto">
            {AGENT_FILTERS.map(item => {
              const active = agentFilter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAgentFilter(item.id)}
                  className={`h-8 px-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Disease Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-10 text-center space-y-2.5">
          <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">
            Nenhum registro fitossanitário encontrado.
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Tente outro termo ou altere o filtro de agente causador.
          </p>
          {hasFilters && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setAgentFilter('todos');
                }}
                className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filtered.map(({ disease, forage }, idx) => (
            <article
              key={`${forage.id}-${disease.id}-${idx}`}
              className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 leading-snug">
                      {disease.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      Agente:{' '}
                      <strong className="font-medium text-slate-700 dark:text-zinc-300">
                        {AGENT_LABELS[disease.agentType]}
                      </strong>
                      {disease.scientificName && (
                        <span className="italic"> · {disease.scientificName}</span>
                      )}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] font-semibold shrink-0 ${getSusceptibilityStyle(
                      disease.susceptibilityLevel
                    )}`}
                  >
                    {SUSCEPTIBILITY_LABELS[disease.susceptibilityLevel]}
                  </span>
                </div>

                <div className="space-y-2.5 pt-2.5 border-t border-slate-100 dark:border-zinc-800 text-xs">
                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-0.5">
                      Sintomas & Impacto
                    </span>
                    <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                      {disease.symptoms}
                    </p>
                    {disease.favorableConditions && (
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                        Condições favoráveis: {disease.favorableConditions}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80">
                    <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-0.5">
                      <ShieldCheck className="w-3 h-3" />
                      Controle & Manejo
                    </span>
                    <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                      {disease.controlAndManagement}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-zinc-800">
                <div className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Hospedeiro
                  </span>
                  <span className="block text-xs font-medium text-slate-800 dark:text-zinc-200 truncate">
                    {forage.commonName}{' '}
                    <span className="text-slate-400 dark:text-zinc-500 font-normal">
                      ({forage.cultivar})
                    </span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectForage(forage)}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ficha da Espécie</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
