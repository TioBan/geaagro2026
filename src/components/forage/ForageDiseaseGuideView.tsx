import React, { useState } from 'react';
import { FORAGE_SANITY_GUIDE, ForageSanityArticle } from '../../data/forageDiseasesData';
import { ShieldAlert, Bug, AlertTriangle, CheckCircle2, Search, Filter, Sparkles, BookOpen } from 'lucide-react';

export const ForageDiseaseGuideView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgentType, setSelectedAgentType] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<ForageSanityArticle | null>(null);

  const filteredGuide = FORAGE_SANITY_GUIDE.filter(art => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = art.name.toLowerCase().includes(term);
      const matchSci = art.scientificName.toLowerCase().includes(term);
      const matchForage = art.affectedForages.some(f => f.toLowerCase().includes(term));
      if (!matchName && !matchSci && !matchForage) return false;
    }

    if (selectedAgentType !== 'all' && art.agentType !== selectedAgentType) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 rounded-2xl">
              <ShieldAlert className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Compêndio Fitossanitário de Pastagens & Forrageiras
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Diagnóstico de campo, etiologia, condições predisponentes e manejo integrado de pragas e doenças
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            {filteredGuide.length} Problemas Catalogados
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por doença, praga, patógeno ou capim afetado..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <select
              value={selectedAgentType}
              onChange={e => setSelectedAgentType(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-slate-800 dark:text-white"
            >
              <option value="all">Todos os Tipos de Agente</option>
              <option value="Praga">Pragas / Insetos</option>
              <option value="Fungo">Fungos Fitopatogênicos</option>
              <option value="Complexo Patológico">Complexos de Solo</option>
              <option value="Distúrbio Metabólico">Distúrbios Metabólicos / Micotoxinas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Disease Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredGuide.map(art => (
          <div
            key={art.id}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {art.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 italic font-mono">
                    {art.scientificName}
                  </p>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  art.severityLevel === 'Crítica'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                }`}>
                  Severidade: {art.severityLevel}
                </span>
              </div>

              {/* Forrageiras Afetadas */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Afeta:</span>
                {art.affectedForages.map((f, i) => (
                  <span key={i} className="text-[11px] bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-2 py-0.5 rounded-md font-medium">
                    {f}
                  </span>
                ))}
              </div>

              {/* Condições e Sintomas */}
              <div className="space-y-2 text-xs pt-2">
                <p className="text-slate-600 dark:text-zinc-300">
                  <strong className="text-slate-800 dark:text-zinc-200">Condições Favoráveis:</strong> {art.favorableConditions}
                </p>

                <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800/80 space-y-1">
                  <span className="font-bold text-slate-800 dark:text-zinc-200 block text-[11px]">Sintomas Principais:</span>
                  <ul className="space-y-1 text-slate-600 dark:text-zinc-300">
                    {art.symptoms.map((sym, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{sym}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-xs text-rose-700 dark:text-rose-400">
                  <strong>Impacto / Prejuízo:</strong> {art.damageDescription}
                </p>
              </div>
            </div>

            {/* Manejo Integrado Box */}
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                Manejo Integrado Recomendado:
              </span>
              <div className="text-xs text-slate-700 dark:text-zinc-300 space-y-1">
                <p><strong>Genético:</strong> {art.integratedManagement.genetic[0]}</p>
                <p><strong>Cultural / Pastejo:</strong> {art.integratedManagement.cultural[0]}</p>
                {art.integratedManagement.biological[0] && (
                  <p><strong>Biológico:</strong> {art.integratedManagement.biological[0]}</p>
                )}
              </div>

              {/* Diagnostic Field Tip */}
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-600" />
                <span><strong>Dica de Campo:</strong> {art.fieldDiagnosticTips}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
