import React, { useState, useMemo } from 'react';
import {
  Bug, Map, Target, Activity, LocateFixed, Radar, 
  Sprout, Camera, TrendingUp, TrendingDown, BookOpen, 
  ShieldCheck, AlertTriangle, BugOff, Layers, History, CheckCircle2,
  Search, Filter, FlaskConical, Globe, Calendar, Zap, Sparkles,
  Dna, Droplets, Leaf, Shield, AlertOctagon, HeartPulse, ChevronRight, Info
} from 'lucide-react';
import { PestTab, PestField, PestSpecies, PopulationTrend } from '../types/pests';
import { PEST_SPECIES_CATALOG, INITIAL_PEST_FIELDS, calculatePopulationTrend, checkPhenologyAlert } from '../data/pestsData';

interface PestMonitoringModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: PestTab) => void;
}

export const PestMonitoringModule: React.FC<PestMonitoringModuleProps> = ({ activeSubTab, setActiveSubTab }) => {
  const [internalTab, setInternalTab] = useState<PestTab>('dashboard');
  const activeTab = (activeSubTab as PestTab) || internalTab;
  const setActiveTab = (tab: PestTab) => {
    setInternalTab(tab);
    if (setActiveSubTab) {
      setActiveSubTab(tab);
    }
  };
  const [fields, setFields] = useState<PestField[]>(INITIAL_PEST_FIELDS);
  const [selectedFieldId, setSelectedFieldId] = useState<string>(INITIAL_PEST_FIELDS[0]?.id || '');
  const [selectedPestId, setSelectedPestId] = useState<string>('spodoptera_frugiperda');
  const [cropFilter, setCropFilter] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentField = useMemo(() => fields.find(f => f?.id === selectedFieldId) || fields[0] || null, [fields, selectedFieldId]);

  const filteredPests = useMemo(() => {
    return PEST_SPECIES_CATALOG.filter(pest => {
      const matchesCrop = cropFilter === 'Todas' || 
        pest.hosts.some(h => h.toLowerCase() === cropFilter.toLowerCase()) ||
        pest.otherHosts?.some(oh => oh.toLowerCase() === cropFilter.toLowerCase());

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        pest.scientificName.toLowerCase().includes(query) ||
        pest.commonName.toLowerCase().includes(query) ||
        pest.order.toLowerCase().includes(query) ||
        pest.family.toLowerCase().includes(query);

      return matchesCrop && matchesSearch;
    });
  }, [cropFilter, searchQuery]);

  const currentPest = useMemo(() => {
    const found = PEST_SPECIES_CATALOG.find(p => p?.id === selectedPestId);
    if (found) return found;
    return filteredPests[0] || PEST_SPECIES_CATALOG[0] || null;
  }, [selectedPestId, filteredPests]);

  const trendEuschistus = calculatePopulationTrend(currentField?.inspections || [], 'euschistus_heros');
  const isCriticalPhenology = currentPest && currentField?.currentPhenologicalStage ? checkPhenologyAlert(currentPest, currentField.currentPhenologicalStage) : false;

  return (
    <div className="space-y-6">
      {/* Banner Principal */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Bug className="w-6 h-6 text-indigo-400" />
              Manejo Integrado de Pragas (MIP)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-4xl">
              Plataforma de acompanhamento populacional conectada à fenologia e histórico de aplicações da lavoura.
            </p>
          </div>
        </div>
      </div>

      {/* Seletor */}
      {activeTab !== 'banco_pragas' && (
        <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500">Talhão:</span>
            <select
              value={selectedFieldId}
              onChange={e => setSelectedFieldId(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 font-bold text-slate-900 dark:text-white"
            >
              {fields.map(f => (
                <option key={f.id} value={f.id}>{f.farmName} - {f.fieldName}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 text-slate-600 dark:text-zinc-400 text-[11px]">
            <span>Estágio Fenológico: <strong className="text-indigo-600 dark:text-indigo-400">{currentField?.currentPhenologicalStage || 'R3 (Início Formação Vagens)'}</strong></span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* RADAR FITOSSANITÁRIO (GRANDE DIFERENCIAL)                   */}
      {/* ========================================================= */}
      {activeTab === 'radar' && (
        <div className="space-y-6 animate-fade-in bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
           <div className="border-b pb-4">
              <h3 className="font-black text-lg text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                <Radar className="w-5 h-5"/> Radar Fitossanitário Integrado
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Visão unificada das espécies, tendência populacional e cruzamento de risco fenológico.
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             
             {/* Painel de Espécies e Tendências */}
             <div className="md:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm">Espécies Monitoradas (Alerta de Tendência)</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border flex justify-between items-center">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center border border-orange-300">
                          <Bug className="w-5 h-5 text-orange-600" />
                       </div>
                       <div>
                         <strong className="text-sm block dark:text-white">Euschistus heros</strong>
                         <span className="text-[10px] text-slate-500">Percevejo-marrom</span>
                       </div>
                     </div>
                     <div className="text-right">
                       <span className={`text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 ${
                         trendEuschistus === 'Decrescente' ? 'text-emerald-700 bg-emerald-100' : 'text-red-700 bg-red-100'
                       }`}>
                         {trendEuschistus === 'Decrescente' ? <TrendingDown className="w-3 h-3"/> : <TrendingUp className="w-3 h-3"/>}
                         População {trendEuschistus}
                       </span>
                     </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border flex justify-between items-center opacity-60">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center">
                          <Bug className="w-5 h-5 text-slate-500" />
                       </div>
                       <div>
                         <strong className="text-sm block dark:text-white">Spodoptera frugiperda</strong>
                         <span className="text-[10px] text-slate-500">Lagarta-do-cartucho</span>
                       </div>
                     </div>
                     <div className="text-right">
                       <span className="text-xs font-bold px-2 py-1 rounded-md text-slate-600 bg-slate-200 flex items-center gap-1">
                         Sem registros (30d)
                       </span>
                     </div>
                  </div>
                </div>
             </div>

             {/* Alertas Cruzados */}
             <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900">
                  <strong className="text-xs block text-red-800 dark:text-red-400 mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3"/> Interação Fenologia x Praga
                  </strong>
                  <div className="text-[10px] text-slate-700 dark:text-slate-300 space-y-2">
                    <p>A cultura encontra-se em <strong>{currentField?.currentPhenologicalStage || 'Estádio não informado'}</strong>.</p>
                    <p className="font-bold text-red-600 dark:text-red-400">Risco Crítico para Danos de Percevejo!</p>
                    <p>Na fase de formação de vagens, os percevejos podem causar abortamento e afetar o vigor das sementes. Intensificar monitoramento (pano de batida) para 2x na semana.</p>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900">
                  <strong className="text-xs block text-blue-800 dark:text-blue-400 mb-2 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3"/> Último Manejo Efetuado
                  </strong>
                  <div className="text-[10px] text-slate-700 dark:text-slate-300">
                    <p className="font-bold">{currentField?.managements?.[0]?.date || '15/11/2025'}</p>
                    <p>Controle Químico: {currentField?.managements?.[0]?.product || 'Neonicotinoide + Piretroide'}</p>
                    <p className="text-blue-600 mt-1 font-bold">Avaliação do Motor: Eficaz (População Decrescente na última inspeção).</p>
                  </div>
                </div>
             </div>

           </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DASHBOARD GERAL                                             */}
      {/* ========================================================= */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
           <div className="p-4 bg-white dark:bg-black border rounded-xl shadow-2xs">
             <span className="text-[10px] font-bold text-slate-500 uppercase block">Inspeções na Safra</span>
             <strong className="text-2xl font-black text-slate-900 dark:text-white mt-1">{currentField?.inspections?.length || 0}</strong>
           </div>
           <div className="p-4 bg-white dark:bg-black border rounded-xl shadow-2xs">
             <span className="text-[10px] font-bold text-slate-500 uppercase block">Infestação Média Atual</span>
             <strong className="text-2xl font-black text-orange-600 mt-1">10%</strong>
           </div>
           <div className="p-4 bg-white dark:bg-black border rounded-xl shadow-2xs">
             <span className="text-[10px] font-bold text-slate-500 uppercase block">Armadilhas Ativas</span>
             <strong className="text-2xl font-black text-slate-900 dark:text-white mt-1">{currentField?.traps?.length || 0}</strong>
           </div>
           <div className="p-4 bg-white dark:bg-black border rounded-xl shadow-2xs">
             <span className="text-[10px] font-bold text-slate-500 uppercase block">Aplicações (Manejo)</span>
             <strong className="text-2xl font-black text-emerald-600 mt-1">{currentField?.managements?.length || 0}</strong>
           </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* BANCO DE PRAGAS & BIBLIOTECA CIENTÍFICA COMPLETA           */}
      {/* ========================================================= */}
      {activeTab === 'banco_pragas' && (
        <div className="space-y-6 animate-fade-in">

          {/* Cabeçalho da Biblioteca e Controles de Busca / Filtro por Cultura */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  Biblioteca Científica Agronômica de Pragas
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Catálogo taxonômico, etiologia, ciclo biológico, danos econômicos, manejo integrado e nutrição mineral (100% Offline).
                </p>
              </div>

              {/* Filtros de Busca */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Buscar por espécie ou praga..."
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Abas de Seleção por Cultura */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
                <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Cultura:
                </span>
                {['Todas', 'Milho', 'Soja', 'Algodão', 'Feijão'].map(crop => (
                  <button
                    key={crop}
                    onClick={() => setCropFilter(crop)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      cropFilter === crop
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>

              {/* Seletor Rápido de Praga */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Praga Selecionada:</span>
                <select 
                  value={currentPest?.id || ''}
                  onChange={e => setSelectedPestId(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 font-bold text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  {filteredPests.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.commonName} ({p.scientificName})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Ficha Agronômica Completa da Praga Selecionada */}
          {currentPest && (
            <div className="space-y-6">

              {/* Header da Ficha da Praga */}
              <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-zinc-900 text-white rounded-2xl p-6 shadow-md border border-emerald-800/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
                  <Bug className="w-64 h-64 text-emerald-400" />
                </div>

                <div className="relative z-10 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shadow-inner">
                        <Bug className="w-7 h-7 text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-black italic tracking-wide text-white">
                            {currentPest.scientificName}
                          </h2>
                          <span className="text-[11px] font-extrabold bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 px-2.5 py-0.5 rounded-full">
                            {currentPest.order} • {currentPest.family}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-emerald-200 mt-0.5">
                          {currentPest.commonName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Culturas Atacadas (Principais + Secundárias) */}
                  <div className="pt-2 border-t border-emerald-800/40 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-extrabold text-emerald-300 flex items-center gap-1">
                      <Sprout className="w-3.5 h-3.5" /> Culturas de Danos Econômicos:
                    </span>
                    {currentPest.hosts.map(h => (
                      <span key={h} className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-lg font-bold">
                        {h}
                      </span>
                    ))}
                    {currentPest.otherHosts && currentPest.otherHosts.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 ml-2 pl-2 border-l border-emerald-700/50">
                        <span className="text-slate-400 text-[11px]">Outros Hospedeiros:</span>
                        {currentPest.otherHosts.map(oh => (
                          <span key={oh} className="bg-slate-800/80 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md text-[11px]">
                            {oh}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid Principal da Ficha Agronômica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Coluna 1: Classificação, Bioecologia e Ciclo Biológico */}
                <div className="space-y-6">

                  {/* Classificação Agronômica & Etiologia */}
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                      <Dna className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                        Classificação, Etiologia & Bioecologia
                      </h4>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="font-extrabold text-slate-400 uppercase text-[10px] block">Detalhes Taxonômicos</span>
                        <p className="text-slate-700 dark:text-zinc-300 font-medium mt-0.5">
                          {currentPest.classificationDetails || `Subfamília/Família ${currentPest.family}. Pertencente à ordem ${currentPest.order}.`}
                        </p>
                      </div>

                      <div>
                        <span className="font-extrabold text-slate-400 uppercase text-[10px] block">Etiologia & Hábito de Colonização</span>
                        <p className="text-slate-700 dark:text-zinc-300 font-medium mt-0.5 leading-relaxed">
                          {currentPest.etiologyBioecology || currentPest.damage}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-start gap-2 text-slate-600 dark:text-zinc-400">
                        <Globe className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800 dark:text-slate-200 block">Distribuição Geográfica:</strong>
                          <span>{currentPest.geographicalDistribution}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ciclo Biológico Detalhado */}
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                          Ciclo Biológico & Reprodução
                        </h4>
                      </div>
                      <span className="bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                        {currentPest.biologicalCycle}
                      </span>
                    </div>

                    {currentPest.cycleDetails ? (
                      <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-700">
                            <span className="text-[10px] font-black text-slate-400 uppercase block">Fase de Ovo</span>
                            <span className="font-bold text-slate-800 dark:text-zinc-200">{currentPest.cycleDetails.eggDays}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-700">
                            <span className="text-[10px] font-black text-slate-400 uppercase block">Ninfa / Larva</span>
                            <span className="font-bold text-slate-800 dark:text-zinc-200">{currentPest.cycleDetails.nymphOrLarvaDays}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-700">
                            <span className="text-[10px] font-black text-slate-400 uppercase block">Fase Pupa / Solo</span>
                            <span className="font-bold text-slate-800 dark:text-zinc-200">{currentPest.cycleDetails.pupaDays}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-700">
                            <span className="text-[10px] font-black text-slate-400 uppercase block">Fase Adulto</span>
                            <span className="font-bold text-slate-800 dark:text-zinc-200">{currentPest.cycleDetails.adultDays}</span>
                          </div>
                        </div>

                        {currentPest.cycleDetails.reproductionInfo && (
                          <div className="bg-sky-50/60 dark:bg-sky-950/20 p-3 rounded-xl border border-sky-100 dark:border-sky-900 text-sky-900 dark:text-sky-200">
                            <strong className="block text-[11px] font-black uppercase mb-1">Potencial Reprodutivo:</strong>
                            <p className="text-xs leading-relaxed">{currentPest.cycleDetails.reproductionInfo}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600 dark:text-zinc-300">{currentPest.biologicalCycle}</p>
                    )}
                  </div>

                  {/* Relações Nutricionais & Adubação Mineral */}
                  {currentPest.nutritionalRelations && (
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-5 shadow-2xs space-y-3">
                      <div className="flex items-center gap-2 border-b border-emerald-200 dark:border-emerald-900 pb-2">
                        <HeartPulse className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                        <h4 className="font-black text-sm text-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
                          Relações Nutricionais & Nutrição Vegetal
                        </h4>
                      </div>
                      <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
                        {currentPest.nutritionalRelations}
                      </p>
                    </div>
                  )}

                </div>

                {/* Coluna 2: Danos Econômicos, Métodos de Controle e Níveis de Ação */}
                <div className="space-y-6">

                  {/* Danos Econômicos & Sintomatologia */}
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                      <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                        Danos Econômicos & Perdas na Lavoura
                      </h4>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="font-extrabold text-red-600 dark:text-red-400 uppercase text-[10px] block">Sintoma e Injúria Geral</span>
                        <p className="text-slate-800 dark:text-zinc-200 font-medium mt-0.5 leading-relaxed">
                          {currentPest.damage}
                        </p>
                      </div>

                      {currentPest.economicDamageDetails && (
                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                          {currentPest.economicDamageDetails.directDamage && (
                            <div className="bg-red-50/60 dark:bg-red-950/20 p-2.5 rounded-xl border border-red-100 dark:border-red-900/40">
                              <span className="font-bold text-red-900 dark:text-red-300 block text-[11px]">Dano Direto:</span>
                              <span className="text-red-800 dark:text-red-200">{currentPest.economicDamageDetails.directDamage}</span>
                            </div>
                          )}

                          {currentPest.economicDamageDetails.indirectDamage && (
                            <div className="bg-amber-50/60 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/40">
                              <span className="font-bold text-amber-900 dark:text-amber-300 block text-[11px]">Dano Indireto:</span>
                              <span className="text-amber-800 dark:text-amber-200">{currentPest.economicDamageDetails.indirectDamage}</span>
                            </div>
                          )}

                          {currentPest.economicDamageDetails.yieldLossPercentage && (
                            <div className="flex items-center justify-between bg-red-100/70 dark:bg-red-900/40 p-2.5 rounded-xl font-bold text-red-950 dark:text-red-200">
                              <span>Perda Potencial de Produtividade:</span>
                              <span className="text-sm text-red-700 dark:text-red-300">{currentPest.economicDamageDetails.yieldLossPercentage}</span>
                            </div>
                          )}

                          {currentPest.economicDamageDetails.vectorDiseases && (
                            <div className="bg-purple-50 dark:bg-purple-950/20 p-2.5 rounded-xl border border-purple-200 dark:border-purple-900 text-purple-900 dark:text-purple-200">
                              <span className="font-bold block text-[11px]">Vetor de Doenças / Patógenos:</span>
                              <span>{currentPest.economicDamageDetails.vectorDiseases}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Métodos Integrados de Controle (4 Pilares MIP) */}
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                      <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                        Estratégias de Controle Integrado (MIP)
                      </h4>
                    </div>

                    {currentPest.controlMethods ? (
                      <div className="space-y-3 text-xs">
                        <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-100 dark:border-zinc-700">
                          <strong className="text-indigo-600 dark:text-indigo-400 block text-[11px] font-black uppercase mb-1 flex items-center gap-1">
                            <FlaskConical className="w-3.5 h-3.5" /> Controle Químico
                          </strong>
                          <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                            {currentPest.controlMethods.chemical}
                          </p>
                        </div>

                        <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-100 dark:border-zinc-700">
                          <strong className="text-emerald-600 dark:text-emerald-400 block text-[11px] font-black uppercase mb-1 flex items-center gap-1">
                            <Leaf className="w-3.5 h-3.5" /> Controle Biológico
                          </strong>
                          <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                            {currentPest.controlMethods.biological}
                          </p>
                        </div>

                        <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-100 dark:border-zinc-700">
                          <strong className="text-amber-600 dark:text-amber-400 block text-[11px] font-black uppercase mb-1 flex items-center gap-1">
                            <Sprout className="w-3.5 h-3.5" /> Controle Cultural
                          </strong>
                          <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                            {currentPest.controlMethods.cultural}
                          </p>
                        </div>

                        <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-100 dark:border-zinc-700">
                          <strong className="text-sky-600 dark:text-sky-400 block text-[11px] font-black uppercase mb-1 flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5" /> Controle Físico / Comportamental
                          </strong>
                          <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                            {currentPest.controlMethods.physical}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-700 dark:text-zinc-300">{currentPest.managementStrategies}</p>
                    )}
                  </div>

                  {/* Níveis de Ação (Limiares de Tomada de Decisão) */}
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                      <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                        Limiares Econômicos & Níveis de Ação
                      </h4>
                    </div>

                    <div className="space-y-2">
                      {currentPest.actionThresholds?.map((a, idx) => (
                        <div key={idx} className="bg-amber-50/60 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200/60 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <span className="font-bold text-amber-950 dark:text-amber-200">{a.stage}</span>
                          <span className="bg-amber-200/70 dark:bg-amber-800/80 text-amber-950 dark:text-amber-100 px-3 py-1 rounded-lg font-extrabold text-[11px] shrink-0">
                            {a.threshold} {a.unit}
                          </span>
                        </div>
                      ))}
                    </div>

                    {currentPest.criticalPeriods && (
                      <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
                        <span className="font-extrabold text-slate-400 uppercase text-[10px] block mb-1">Fases Críticas de Suscetibilidade</span>
                        <div className="flex flex-wrap gap-1.5">
                          {currentPest.criticalPeriods.map(cp => (
                            <span key={cp} className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-2.5 py-1 rounded-lg font-semibold">
                              {cp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* PLACHOLDER GERAL OUTRAS ABAS */}
      {(activeTab === 'monitoramento' || activeTab === 'mapa' || activeTab === 'curvas' || activeTab === 'manejo' || activeTab === 'inimigos_naturais') && (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 text-slate-500">
           <LocateFixed className="w-10 h-10 mx-auto mb-3 text-indigo-300" />
           <strong className="block text-sm">O módulo de {activeTab.replace('_', ' ')} está sincronizado ao Radar.</strong>
           <p className="text-xs mt-2 max-w-lg mx-auto">Os dados e inspeções realizados no campo alimentam diretamente o Motor de Risco e Tendências Populacionais visualizados no Radar Fitossanitário.</p>
        </div>
      )}

    </div>
  );
};
