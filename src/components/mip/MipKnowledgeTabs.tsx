import React, { useMemo, useState } from 'react';
import {
  Search,
  X,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import { PestSpecies } from '../../types/pests';
import { PEST_SPECIES_CATALOG, NATURAL_ENEMIES_CATALOG } from '../../data/pestsData';

interface MipKnowledgeTabsProps {
  mode: 'banco_pragas' | 'inimigos_naturais';
  cropFilter: string;
  setCropFilter: (crop: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredPests: PestSpecies[];
  currentPest: PestSpecies | null;
  setSelectedPestId: (id: string) => void;
  onInspectPest?: (pestId: string) => void;
  onOpenPestInBank: (pestId: string) => void;
  hasActiveField: boolean;
}

const CROP_FILTERS = ['Todas', 'Soja', 'Milho', 'Algodão', 'Feijão'];

interface EnrichedBioAgent {
  id: string;
  scientificName: string;
  commonName: string;
  category: 'Parasitoide' | 'Predador' | 'Entomopatógeno' | 'Outro';
  targets: { id: string; commonName: string; scientificName: string; biologicalNote?: string }[];
}

function classifyBioAgent(name: string): EnrichedBioAgent['category'] {
  const n = name.toLowerCase();
  if (
    n.includes('beauveria') ||
    n.includes('metarhizium') ||
    n.includes('baculovirus') ||
    n.includes('bacillus') ||
    n.includes('cordyceps') ||
    n.includes('nomuraea') ||
    n.includes('steinernema')
  ) {
    return 'Entomopatógeno';
  }
  if (
    n.includes('trichogramma') ||
    n.includes('telenomus') ||
    n.includes('trissolcus') ||
    n.includes('encarsia') ||
    n.includes('eretmocerus') ||
    n.includes('campoletis') ||
    n.includes('copidosoma') ||
    n.includes('microplitis') ||
    n.includes('catolaccus') ||
    n.includes('bracon') ||
    n.includes('orgilus') ||
    n.includes('pristomerus') ||
    n.includes('anagrus') ||
    n.includes('celatoria') ||
    n.includes('centistes') ||
    n.includes('gonatopus')
  ) {
    return 'Parasitoide';
  }
  if (
    n.includes('doru') ||
    n.includes('podisus') ||
    n.includes('geocoris') ||
    n.includes('orius') ||
    n.includes('chrysoperla') ||
    n.includes('neoseiulus') ||
    n.includes('phytoseiulus') ||
    n.includes('stethorus') ||
    n.includes('carab') ||
    n.includes('formiga') ||
    n.includes('solenopsis') ||
    n.includes('ectatomma')
  ) {
    return 'Predador';
  }
  return 'Outro';
}

export const MipKnowledgeTabs: React.FC<MipKnowledgeTabsProps> = ({
  mode,
  cropFilter,
  setCropFilter,
  searchQuery,
  setSearchQuery,
  filteredPests,
  currentPest,
  setSelectedPestId,
  onInspectPest,
  onOpenPestInBank,
  hasActiveField,
}) => {
  const [bioSearch, setBioSearch] = useState('');
  const [bioCategory, setBioCategory] = useState<string>('Todos');

  const bioAgents = useMemo<EnrichedBioAgent[]>(() => {
    const map = new Map<string, EnrichedBioAgent>();

    for (const base of NATURAL_ENEMIES_CATALOG) {
      const key = base.scientificName.toLowerCase();
      map.set(key, {
        id: base.id,
        scientificName: base.scientificName,
        commonName: base.commonName,
        category:
          base.type === 'Fungo Entomopatogênico'
            ? 'Entomopatógeno'
            : base.type === 'Parasitoide'
              ? 'Parasitoide'
              : 'Predador',
        targets: [],
      });
    }

    for (const pest of PEST_SPECIES_CATALOG) {
      for (const enemy of pest.naturalEnemies || []) {
        const cleanName = enemy.trim();
        if (!cleanName || cleanName.toLowerCase().includes('feromônio')) continue;
        const key = cleanName.toLowerCase();
        const existing = map.get(key);
        const targetInfo = {
          id: pest.id,
          commonName: pest.commonName,
          scientificName: pest.scientificName,
          biologicalNote: pest.controlMethods?.biological,
        };
        if (existing) {
          if (!existing.targets.some((t) => t.id === pest.id)) {
            existing.targets.push(targetInfo);
          }
        } else {
          map.set(key, {
            id: `bio-${key.replace(/[^a-z0-9]/g, '_')}`,
            scientificName: cleanName,
            commonName: classifyBioAgent(cleanName),
            category: classifyBioAgent(cleanName),
            targets: [targetInfo],
          });
        }
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      a.scientificName.localeCompare(b.scientificName, 'pt-BR')
    );
  }, []);

  const filteredBioAgents = useMemo(() => {
    const q = bioSearch.trim().toLowerCase();
    return bioAgents.filter((agent) => {
      const matchesCat = bioCategory === 'Todos' || agent.category === bioCategory;
      const matchesQuery =
        !q ||
        agent.scientificName.toLowerCase().includes(q) ||
        agent.commonName.toLowerCase().includes(q) ||
        agent.targets.some(
          (t) =>
            t.commonName.toLowerCase().includes(q) || t.scientificName.toLowerCase().includes(q)
        );
      return matchesCat && matchesQuery;
    });
  }, [bioAgents, bioCategory, bioSearch]);

  if (mode === 'inimigos_naturais') {
    const categories = ['Todos', 'Parasitoide', 'Predador', 'Entomopatógeno'];
    return (
      <div className="space-y-4">
        {/* Filtros de controle biológico */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={bioSearch}
              onChange={(e) => setBioSearch(e.target.value)}
              placeholder="Buscar agente biológico ou praga-alvo..."
              className="w-full h-8 pl-8 pr-7 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {bioSearch && (
              <button
                type="button"
                onClick={() => setBioSearch('')}
                aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-lg overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setBioCategory(cat)}
                className={`h-7 px-2.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  bioCategory === cat
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela de inimigos naturais */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Catálogo de Controle Biológico &amp; Inimigos Naturais
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Agentes parasitoides, predadores e entomopatógenos associados às pragas agrícolas do MIP.
              </p>
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums shrink-0">
              {filteredBioAgents.length} {filteredBioAgents.length === 1 ? 'agente' : 'agentes'}
            </span>
          </div>

          {filteredBioAgents.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
              Nenhum agente biológico encontrado para os filtros selecionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                    <th className="py-2.5 px-4">Agente biológico</th>
                    <th className="py-2.5 px-4">Grupo funcional</th>
                    <th className="py-2.5 px-4">Pragas-alvo</th>
                    <th className="py-2.5 px-4 text-right">Ficha MIP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 text-xs">
                  {filteredBioAgents.map((agent) => (
                    <tr
                      key={agent.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-4 align-top">
                        <div className="font-medium italic text-slate-900 dark:text-zinc-100">
                          {agent.scientificName}
                        </div>
                        {agent.commonName && agent.commonName !== agent.category && (
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                            {agent.commonName}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-4 align-top text-slate-600 dark:text-zinc-300 whitespace-nowrap">
                        {agent.category}
                      </td>
                      <td className="py-2.5 px-4 align-top">
                        <div className="text-slate-700 dark:text-zinc-300">
                          {agent.targets.map((t) => t.commonName).join(' · ') || '—'}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 align-top text-right whitespace-nowrap">
                        {agent.targets[0] && (
                          <button
                            type="button"
                            onClick={() => onOpenPestInBank(agent.targets[0].id)}
                            className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                          >
                            <span>Ver alvo</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        )}
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
  }

  // =========================================================================
  // BANCO DE PRAGAS (BIBLIOTECA CIENTÍFICA)
  // =========================================================================
  return (
    <div className="space-y-4">
      {/* Barra de busca e filtro por cultura */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome científico, popular, ordem ou família..."
            className="w-full h-8 pl-8 pr-7 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Limpar busca"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-lg overflow-x-auto">
            {CROP_FILTERS.map((crop) => (
              <button
                key={crop}
                type="button"
                onClick={() => setCropFilter(crop)}
                className={`h-7 px-2.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  cropFilter === crop
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                {crop}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums whitespace-nowrap">
            {filteredPests.length} {filteredPests.length === 1 ? 'espécie' : 'espécies'}
          </span>
        </div>
      </div>

      {/* Layout Mestre-Detalhe: Lista à esquerda + Ficha Técnica à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Lista de espécies */}
        <aside className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
              Espécies catalogadas
            </span>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500">Consulta offline</span>
          </div>

          {filteredPests.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 dark:text-zinc-400">
              Nenhuma praga encontrada para o filtro atual.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 max-h-[680px] overflow-y-auto">
              {filteredPests.map((pest) => {
                const isSelected = currentPest?.id === pest.id;
                return (
                  <button
                    key={pest.id}
                    type="button"
                    onClick={() => setSelectedPestId(pest.id)}
                    className={`w-full text-left px-4 py-3 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30'
                        : 'hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={`text-xs font-semibold truncate ${
                          isSelected
                            ? 'text-emerald-800 dark:text-emerald-300'
                            : 'text-slate-900 dark:text-zinc-100'
                        }`}
                      >
                        {pest.commonName}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-zinc-500 shrink-0">
                        {pest.order}
                      </span>
                    </div>
                    <div className="text-[11px] italic text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                      {pest.scientificName}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 truncate">
                      {pest.hosts.join(' · ')}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* Ficha Técnica Completa (Superfície única com divisórias finas) */}
        <section className="lg:col-span-8">
          {!currentPest ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
              Selecione uma espécie na lista para visualizar a ficha agronômica completa.
            </div>
          ) : (
            <article className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl divide-y divide-slate-200 dark:divide-zinc-800">
              {/* 1. Cabeçalho da espécie */}
              <div className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <h2 className="text-base sm:text-lg font-semibold italic text-slate-900 dark:text-zinc-100">
                      {currentPest.scientificName}
                    </h2>
                    <span className="text-xs text-slate-400 dark:text-zinc-500" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      {currentPest.commonName}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-zinc-400">
                    <span>Ordem {currentPest.order}</span>
                    <span aria-hidden="true">·</span>
                    <span>Família {currentPest.family}</span>
                    {currentPest.cycleDetails?.totalCycleDays && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          Ciclo: {currentPest.cycleDetails.totalCycleDays}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="pt-1.5 text-xs text-slate-600 dark:text-zinc-300 space-y-0.5">
                    <p>
                      <span className="font-medium text-slate-800 dark:text-zinc-200">
                        Culturas de dano econômico:{' '}
                      </span>
                      {currentPest.hosts.join(' · ')}
                    </p>
                    {currentPest.otherHosts && currentPest.otherHosts.length > 0 && (
                      <p className="text-slate-500 dark:text-zinc-400">
                        <span className="font-medium text-slate-700 dark:text-zinc-300">
                          Hospedeiros secundários:{' '}
                        </span>
                        {currentPest.otherHosts.join(' · ')}
                      </p>
                    )}
                  </div>
                </div>

                {hasActiveField && onInspectPest && (
                  <button
                    type="button"
                    onClick={() => onInspectPest(currentPest.id)}
                    className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Registrar inspeção</span>
                  </button>
                )}
              </div>

              {/* 2. Classificação, Etiologia e Distribuição */}
              <div className="p-5 space-y-3">
                <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  Classificação, etiologia e distribuição
                </h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <dt className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                      Taxonomia
                    </dt>
                    <dd className="text-slate-700 dark:text-zinc-300 mt-0.5 leading-relaxed">
                      {currentPest.classificationDetails ||
                        `Família ${currentPest.family}, ordem ${currentPest.order}.`}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                      Distribuição geográfica
                    </dt>
                    <dd className="text-slate-700 dark:text-zinc-300 mt-0.5 leading-relaxed">
                      {currentPest.geographicalDistribution}
                    </dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                      Etiologia e bioecologia
                    </dt>
                    <dd className="text-slate-700 dark:text-zinc-300 mt-0.5 leading-relaxed">
                      {currentPest.etiologyBioecology || currentPest.damage}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* 3. Ciclo Biológico */}
              <div className="p-5 space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                    Ciclo biológico e reprodução
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
                    {currentPest.cycleDetails?.totalCycleDays || currentPest.biologicalCycle}
                  </span>
                </div>

                {currentPest.cycleDetails ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-slate-200 dark:border-zinc-800 rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800">
                      <div className="p-3">
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                          Fase de ovo
                        </span>
                        <span className="text-xs font-medium text-slate-800 dark:text-zinc-200 mt-0.5 block leading-snug">
                          {currentPest.cycleDetails.eggDays}
                        </span>
                      </div>
                      <div className="p-3">
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                          Ninfa / Larva
                        </span>
                        <span className="text-xs font-medium text-slate-800 dark:text-zinc-200 mt-0.5 block leading-snug">
                          {currentPest.cycleDetails.nymphOrLarvaDays}
                        </span>
                      </div>
                      <div className="p-3">
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                          Pupa / Solo
                        </span>
                        <span className="text-xs font-medium text-slate-800 dark:text-zinc-200 mt-0.5 block leading-snug">
                          {currentPest.cycleDetails.pupaDays}
                        </span>
                      </div>
                      <div className="p-3">
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                          Adulto
                        </span>
                        <span className="text-xs font-medium text-slate-800 dark:text-zinc-200 mt-0.5 block leading-snug">
                          {currentPest.cycleDetails.adultDays}
                        </span>
                      </div>
                    </div>
                    {currentPest.cycleDetails.reproductionInfo && (
                      <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                        <span className="font-medium text-slate-800 dark:text-zinc-200">
                          Potencial reprodutivo:{' '}
                        </span>
                        {currentPest.cycleDetails.reproductionInfo}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-slate-600 dark:text-zinc-300">
                    {currentPest.biologicalCycle}
                  </p>
                )}
              </div>

              {/* 4. Danos Econômicos & Sintomatologia */}
              <div className="p-5 space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                    Danos econômicos e sintomatologia
                  </h3>
                  {currentPest.economicDamageDetails?.yieldLossPercentage && (
                    <span className="text-xs font-semibold text-red-700 dark:text-red-400 tabular-nums">
                      {currentPest.economicDamageDetails.yieldLossPercentage}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                  {currentPest.damage}
                </p>

                {currentPest.economicDamageDetails && (
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                    {currentPest.economicDamageDetails.directDamage && (
                      <div>
                        <dt className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                          Dano direto
                        </dt>
                        <dd className="text-slate-700 dark:text-zinc-300 mt-0.5 leading-relaxed">
                          {currentPest.economicDamageDetails.directDamage}
                        </dd>
                      </div>
                    )}
                    {currentPest.economicDamageDetails.indirectDamage && (
                      <div>
                        <dt className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                          Dano indireto
                        </dt>
                        <dd className="text-slate-700 dark:text-zinc-300 mt-0.5 leading-relaxed">
                          {currentPest.economicDamageDetails.indirectDamage}
                        </dd>
                      </div>
                    )}
                    {currentPest.economicDamageDetails.vectorDiseases && (
                      <div className="md:col-span-2">
                        <dt className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                          Transmissão de patógenos / viroses
                        </dt>
                        <dd className="text-slate-700 dark:text-zinc-300 mt-0.5 leading-relaxed">
                          {currentPest.economicDamageDetails.vectorDiseases}
                        </dd>
                      </div>
                    )}
                  </dl>
                )}
              </div>

              {/* 5. Limiares Econômicos (NDE) e Amostragem */}
              <div className="p-5 space-y-3">
                <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  Níveis de ação (NDE), amostragem e fases críticas
                </h3>

                {currentPest.actionThresholds && currentPest.actionThresholds.length > 0 && (
                  <div className="border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                          <th className="py-2 px-3">Cultura / Estádio</th>
                          <th className="py-2 px-3 text-right">Limiar de ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                        {currentPest.actionThresholds.map((a, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3 font-medium text-slate-800 dark:text-zinc-200">
                              {a.stage}
                            </td>
                            <td className="py-2 px-3 text-right font-semibold text-amber-700 dark:text-amber-400 tabular-nums">
                              {a.threshold} {a.unit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
                      Método de monitoramento
                    </span>
                    <p className="text-slate-700 dark:text-zinc-300 mt-0.5 leading-relaxed">
                      {currentPest.monitoringMethods}
                    </p>
                  </div>
                  {currentPest.criticalPeriods && currentPest.criticalPeriods.length > 0 && (
                    <div>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
                        Fases críticas de suscetibilidade
                      </span>
                      <p className="text-slate-700 dark:text-zinc-300 mt-0.5 leading-relaxed">
                        {currentPest.criticalPeriods.join(' · ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 6. Estratégias de Controle Integrado (4 Pilares MIP) */}
              <div className="p-5 space-y-3">
                <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  Estratégias de controle integrado (MIP)
                </h3>

                {currentPest.controlMethods ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-900 dark:text-zinc-100 block">
                        Controle químico
                      </span>
                      <p className="text-slate-600 dark:text-zinc-300 mt-0.5 leading-relaxed">
                        {currentPest.controlMethods.chemical}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block">
                        Controle biológico
                      </span>
                      <p className="text-slate-600 dark:text-zinc-300 mt-0.5 leading-relaxed">
                        {currentPest.controlMethods.biological}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 block">
                        Controle cultural
                      </span>
                      <p className="text-slate-600 dark:text-zinc-300 mt-0.5 leading-relaxed">
                        {currentPest.controlMethods.cultural}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-200 block">
                        Controle físico e comportamental
                      </span>
                      <p className="text-slate-600 dark:text-zinc-300 mt-0.5 leading-relaxed">
                        {currentPest.controlMethods.physical}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                    {currentPest.managementStrategies}
                  </p>
                )}
              </div>

              {/* 7. Relações Nutricionais e Inimigos Naturais */}
              {(currentPest.nutritionalRelations ||
                (currentPest.naturalEnemies && currentPest.naturalEnemies.length > 0)) && (
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {currentPest.nutritionalRelations && (
                    <div>
                      <h3 className="text-[11px] font-semibold text-slate-900 dark:text-zinc-100 mb-1">
                        Relações nutricionais e adubação
                      </h3>
                      <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                        {currentPest.nutritionalRelations}
                      </p>
                    </div>
                  )}
                  {currentPest.naturalEnemies && currentPest.naturalEnemies.length > 0 && (
                    <div>
                      <h3 className="text-[11px] font-semibold text-slate-900 dark:text-zinc-100 mb-1">
                        Principais inimigos naturais
                      </h3>
                      <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                        {currentPest.naturalEnemies.join(' · ')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </article>
          )}
        </section>
      </div>
    </div>
  );
};
