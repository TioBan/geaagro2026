import React, { useState } from 'react';
import { FORAGES_CATALOG } from '../../data/foragesCatalogData';
import { ForageDisease, ForageItem } from '../../types/forage';
import { AlertTriangle, Bug, ShieldCheck, Search, HelpCircle, Eye, ArrowRight } from 'lucide-react';

interface ForageDiseasesGuideProps {
  onSelectForage: (forage: ForageItem) => void;
}

export const ForageDiseasesGuide: React.FC<ForageDiseasesGuideProps> = ({ onSelectForage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [agentFilter, setAgentFilter] = useState<string>('todos');

  // Extract all distinct diseases across the 30 forages
  const diseaseEntries: { disease: ForageDisease; forage: ForageItem }[] = [];
  FORAGES_CATALOG.forEach(forage => {
    forage.diseasesAndPests.forEach(disease => {
      diseaseEntries.push({ disease, forage });
    });
  });

  const filtered = diseaseEntries.filter(({ disease, forage }) => {
    const matchesSearch =
      disease.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disease.symptoms.toLowerCase().includes(searchTerm.toLowerCase()) ||
      forage.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (disease.scientificName && disease.scientificName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAgent = agentFilter === 'todos' || disease.agentType === agentFilter;

    return matchesSearch && matchesAgent;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-zinc-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center font-bold">
            <Bug className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Guia Fitossanitário: Sanidade, Doenças e Pragas de Pastagens
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Atlas completo de diagnóstico a campo, sintomas visuais, nível de suscetibilidade e medidas de controle e manejo agronômico.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por doença, sintoma, cigarrinha, fungo ou forrageira..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin">
            {['todos', 'inseto_praga', 'fungo', 'disturbio_fisiologico'].map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setAgentFilter(type)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap capitalize ${
                  agentFilter === type
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                {type === 'todos' ? 'Todos os Agentes' : type === 'inseto_praga' ? 'Insetos & Cigarrinhas' : type === 'fungo' ? 'Fungos & Ferrugens' : 'Distúrbios / Fisiologia'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Disease Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(({ disease, forage }, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    {disease.name}
                  </h4>
                  {disease.scientificName && (
                    <p className="text-[11px] text-slate-400 italic">
                      Agente: {disease.scientificName}
                    </p>
                  )}
                </div>

                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 ${
                    disease.susceptibilityLevel === 'alta'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : disease.susceptibilityLevel === 'moderada'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {disease.susceptibilityLevel}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs mb-3">
                <span className="text-slate-500 dark:text-zinc-400 block text-[10px] font-bold uppercase">
                  Forrageira Hospedeira:
                </span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {forage.commonName} ({forage.cultivar})
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <strong className="text-rose-700 dark:text-rose-400 block mb-0.5">
                    Sintomas Visuais no Pasto:
                  </strong>
                  <p className="text-slate-700 dark:text-zinc-300 leading-relaxed text-[11.5px]">
                    {disease.symptoms}
                  </p>
                </div>

                <div>
                  <strong className="text-amber-700 dark:text-amber-400 block mb-0.5">
                    Impacto & Prejuízo:
                  </strong>
                  <p className="text-slate-700 dark:text-zinc-300 leading-relaxed text-[11.5px]">
                    {disease.damageImpact}
                  </p>
                </div>

                <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
                  <strong className="text-emerald-900 dark:text-emerald-300 block mb-0.5">
                    Controle & Manejo Agronômico:
                  </strong>
                  <p className="text-emerald-950 dark:text-emerald-200 text-[11px] leading-relaxed">
                    {disease.controlAndManagement}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 italic">
                {disease.favorableConditions}
              </span>
              <button
                type="button"
                onClick={() => onSelectForage(forage)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Ficha da Espécie</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
