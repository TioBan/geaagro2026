import React, { useMemo, useState } from 'react';
import { BookOpen, Search, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { SwineDiseaseInfo } from '../../types/swine';
import { DEFAULT_SWINE_DISEASES } from '../../data/swineDefaultData';
import {
  SWINE_CARD_CLASS,
  SWINE_INPUT_CLASS,
  SWINE_SUBCARD_CLASS,
  getDiseaseSeverityBadgeClass,
} from './swineUi';

export const SwineDiseasesLibraryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string>(
    DEFAULT_SWINE_DISEASES[0]?.id ?? ''
  );

  const filteredDiseases = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return DEFAULT_SWINE_DISEASES.filter(d => {
      const matchesSearch =
        !term ||
        d.name.toLowerCase().includes(term) ||
        d.causativeAgent.toLowerCase().includes(term) ||
        d.symptoms.some(s => s.toLowerCase().includes(term));
      const matchesCat = selectedCategory === 'all' || d.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchTerm, selectedCategory]);

  const selectedDisease: SwineDiseaseInfo | null =
    filteredDiseases.find(d => d.id === selectedDiseaseId) ?? filteredDiseases[0] ?? null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`${SWINE_CARD_CLASS} p-4`}>
        <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span>Guia Técnico de Enfermidades Suínas</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Referência clínica de sinais, lesões anatomopatológicas, transmissão, prevenção e controle sanitário.
        </p>
      </div>

      {/* Filters */}
      <div className={`${SWINE_CARD_CLASS} p-3 flex flex-col sm:flex-row gap-2.5`}>
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar doença, agente etiológico ou sintoma..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={`${SWINE_INPUT_CLASS} pl-8`}
          />
        </div>

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className={`${SWINE_INPUT_CLASS} sm:w-52`}
        >
          <option value="all">Todas as categorias</option>
          <option value="Viral">Viral</option>
          <option value="Bacteriana">Bacteriana</option>
          <option value="Parasitária">Parasitária</option>
          <option value="Nutricional / Manejo">Nutricional / Manejo</option>
        </select>
      </div>

      {/* 2-Column Library */}
      {filteredDiseases.length === 0 ? (
        <div className={`${SWINE_CARD_CLASS} p-10 text-center space-y-1.5`}>
          <BookOpen className="w-7 h-7 text-slate-400 dark:text-zinc-500 mx-auto" />
          <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
            Nenhuma enfermidade encontrada para o filtro informado.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            {filteredDiseases.map(disease => {
              const isSelected = selectedDisease?.id === disease.id;
              return (
                <button
                  key={disease.id}
                  type="button"
                  onClick={() => setSelectedDiseaseId(disease.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-500'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-rose-300 dark:hover:border-rose-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 leading-snug">
                      {disease.name}
                    </h3>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-md shrink-0 ${getDiseaseSeverityBadgeClass(disease.severity)}`}
                    >
                      {disease.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 italic mt-0.5 truncate">
                    {disease.scientificName || disease.causativeAgent}
                  </p>
                  <div className="mt-1.5 text-[11px] text-slate-600 dark:text-zinc-400 truncate">
                    Fases: {disease.affectedStages.join(', ')}
                  </div>
                </button>
              );
            })}
          </div>

          <div className={`lg:col-span-2 ${SWINE_CARD_CLASS} p-4 space-y-4`}>
            {selectedDisease && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                        {selectedDisease.name}
                      </h3>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${getDiseaseSeverityBadgeClass(selectedDisease.severity)}`}
                      >
                        {selectedDisease.severity}
                      </span>
                    </div>
                    <p className="text-xs text-rose-600 dark:text-rose-400">
                      Agente etiológico: {selectedDisease.causativeAgent}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                      <span>Vacina: {selectedDisease.vaccinationAvailable ? 'Disponível' : 'Não disponível'}</span>
                      <span>·</span>
                      <span>Zoonose: {selectedDisease.zoonosisRisk ? 'Sim' : 'Não'}</span>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                      Fases Suscetíveis
                    </span>
                    <span className="text-xs font-medium text-slate-800 dark:text-zinc-200">
                      {selectedDisease.affectedStages.join(', ')}
                    </span>
                  </div>
                </div>

                {/* Clinical Signs */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Sinais Clínicos</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedDisease.symptoms.map(sign => (
                      <div
                        key={sign}
                        className={`${SWINE_SUBCARD_CLASS} px-3 py-2 text-xs text-slate-700 dark:text-zinc-300`}
                      >
                        {sign}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lesions */}
                {selectedDisease.anatomopathologicalLesions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      <span>Lesões Anatomopatológicas</span>
                    </h4>
                    <div className="space-y-1.5">
                      {selectedDisease.anatomopathologicalLesions.map(lesion => (
                        <div
                          key={lesion}
                          className={`${SWINE_SUBCARD_CLASS} px-3 py-2 text-xs text-slate-700 dark:text-zinc-300`}
                        >
                          {lesion}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transmission & Prevention */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className={`${SWINE_SUBCARD_CLASS} p-3 space-y-1.5`}>
                    <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 block">
                      Transmissão
                    </span>
                    <ul className="text-xs text-slate-600 dark:text-zinc-400 list-disc list-inside space-y-0.5">
                      {selectedDisease.transmission.map(t => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>

                  <div className={`${SWINE_SUBCARD_CLASS} p-3 space-y-1.5`}>
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block">
                      Prevenção & Biosseguridade
                    </span>
                    <ul className="text-xs text-slate-600 dark:text-zinc-400 list-disc list-inside space-y-0.5">
                      {selectedDisease.preventionAndBiosecurity.map(p => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Treatment */}
                <div className={`${SWINE_SUBCARD_CLASS} p-3 space-y-1.5`}>
                  <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>Protocolo de Controle / Conduta</span>
                  </span>
                  <ul className="text-xs text-slate-600 dark:text-zinc-400 list-disc list-inside space-y-0.5">
                    {selectedDisease.treatmentAndControl.map(tc => (
                      <li key={tc}>{tc}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
