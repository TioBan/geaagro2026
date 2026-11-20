import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bird,
  BookOpen,
  Bookmark,
  Camera,
  Check,
  FileSearch,
  FileText,
  Save,
  Search,
} from 'lucide-react';
import {
  POULTRY_DISEASES,
  POULTRY_SYMPTOMS,
  POULTRY_SYMPTOM_DISEASE_MAP,
} from '../../data/poultryData';
import {
  POULTRY_CARD_CLASS,
  POULTRY_INPUT_CLASS,
  POULTRY_PRIMARY_BTN_CLASS,
  POULTRY_SUBCARD_CLASS,
  POULTRY_TEXTAREA_CLASS,
} from './poultryUi';

const DISEASE_NOTES_STORAGE_KEY = 'poultry_disease_notes';

export const PoultryDiseaseLibraryView: React.FC = () => {
  const [diseaseSearchTerm, setDiseaseSearchTerm] = useState('');
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string>(POULTRY_DISEASES[0]?.id || 'd1');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [diseaseNotes, setDiseaseNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(DISEASE_NOTES_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as Record<string, string>) : {};
    } catch {
      return {};
    }
  });
  const [currentNoteText, setCurrentNoteText] = useState('');
  const [saveNoteSuccess, setSaveNoteSuccess] = useState<string | null>(null);

  useEffect(() => {
    setCurrentNoteText(diseaseNotes[selectedDiseaseId] || '');
  }, [selectedDiseaseId, diseaseNotes]);

  const handleSaveNote = (diseaseId: string) => {
    const updated = { ...diseaseNotes, [diseaseId]: currentNoteText };
    setDiseaseNotes(updated);
    try {
      localStorage.setItem(DISEASE_NOTES_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save poultry disease note:', err);
    }
    setSaveNoteSuccess(diseaseId);
    window.setTimeout(() => setSaveNoteSuccess(null), 2000);
  };

  const filteredDiseases = useMemo(() => {
    const term = diseaseSearchTerm.trim().toLowerCase();
    return POULTRY_DISEASES.filter(d => {
      const matchesSearch =
        !term ||
        d.name.toLowerCase().includes(term) ||
        d.agent.toLowerCase().includes(term) ||
        d.symptoms.toLowerCase().includes(term) ||
        d.etiology.toLowerCase().includes(term);

      if (!matchesSearch) return false;
      if (selectedSymptoms.length === 0) return true;

      return selectedSymptoms.some(sym =>
        (POULTRY_SYMPTOM_DISEASE_MAP[sym] || []).includes(d.id)
      );
    }).sort((a, b) => {
      if (selectedSymptoms.length === 0) return 0;
      const countA = selectedSymptoms.filter(sym =>
        (POULTRY_SYMPTOM_DISEASE_MAP[sym] || []).includes(a.id)
      ).length;
      const countB = selectedSymptoms.filter(sym =>
        (POULTRY_SYMPTOM_DISEASE_MAP[sym] || []).includes(b.id)
      ).length;
      return countB - countA;
    });
  }, [diseaseSearchTerm, selectedSymptoms]);

  const activeDisease =
    POULTRY_DISEASES.find(d => d.id === selectedDiseaseId) || POULTRY_DISEASES[0];

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const markImageFailed = (id: string) => {
    setFailedImages(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className={`${POULTRY_CARD_CLASS} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div className="space-y-0.5">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Guia Clínico de Patologia & Sanidade Aviária
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Manual de referência de campo com triagem presuntiva por sinais clínicos e anotações locais da granja.
          </p>
        </div>
        <div className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums shrink-0">
          Acervo: <span className="font-semibold text-slate-900 dark:text-zinc-100">{POULTRY_DISEASES.length} enfermidades</span>
        </div>
      </div>

      {/* Symptom Triage Panel */}
      <section className={`${POULTRY_CARD_CLASS} p-4 space-y-3`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
              Triagem Presuntiva por Sinais Clínicos
            </h3>
          </div>
          {selectedSymptoms.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedSymptoms([])}
              className="text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline self-start sm:self-auto cursor-pointer"
            >
              Limpar sintomas ({selectedSymptoms.length})
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5">
          {POULTRY_SYMPTOMS.map(symptom => {
            const isSelected = selectedSymptoms.includes(symptom);
            return (
              <button
                key={symptom}
                type="button"
                onClick={() => toggleSymptom(symptom)}
                className={`text-left px-2.5 py-2 rounded-lg border text-xs transition-colors flex items-start gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-600 text-white border-amber-700'
                    : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 hover:border-amber-400 dark:hover:border-amber-700 text-slate-700 dark:text-zinc-300'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border mt-0.5 ${
                    isSelected
                      ? 'bg-amber-700 border-amber-800 text-white'
                      : 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700'
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5" />}
                </span>
                <span className="leading-snug">{symptom}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Split Master-Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar enfermidade, agente ou sintoma..."
              value={diseaseSearchTerm}
              onChange={e => setDiseaseSearchTerm(e.target.value)}
              className={`${POULTRY_INPUT_CLASS} pl-8`}
            />
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-0.5">
            {filteredDiseases.length === 0 ? (
              <div className={`${POULTRY_SUBCARD_CLASS} p-6 text-center space-y-1.5`}>
                <FileSearch className="w-6 h-6 text-slate-400 dark:text-zinc-500 mx-auto" />
                <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                  Nenhuma enfermidade encontrada
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Reduza os sintomas marcados ou altere o termo de busca.
                </p>
              </div>
            ) : (
              filteredDiseases.map(disease => {
                const isSelected = disease.id === activeDisease?.id;
                const matchCount = selectedSymptoms.filter(sym =>
                  (POULTRY_SYMPTOM_DISEASE_MAP[sym] || []).includes(disease.id)
                ).length;

                return (
                  <button
                    key={disease.id}
                    type="button"
                    onClick={() => setSelectedDiseaseId(disease.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-colors flex gap-3 items-center cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-400 dark:border-amber-700'
                        : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-zinc-800 shrink-0 overflow-hidden border border-slate-200 dark:border-zinc-700 flex items-center justify-center">
                      {disease.image && !failedImages[disease.id] ? (
                        <img
                          src={disease.image}
                          alt={disease.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={() => markImageFailed(disease.id)}
                        />
                      ) : (
                        <Bird className="w-5 h-5 text-slate-400 dark:text-zinc-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-slate-900 dark:text-zinc-100 truncate">
                          {disease.name}
                        </span>
                        {matchCount > 0 && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 shrink-0 tabular-nums">
                            {matchCount} {matchCount === 1 ? 'sinal' : 'sinais'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                        {disease.agent}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Detail Panel */}
        {activeDisease && (
          <article className={`${POULTRY_CARD_CLASS} lg:col-span-8 overflow-hidden`}>
            {/* Title Header */}
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 flex-wrap">
                  <span className="font-medium text-amber-700 dark:text-amber-400">
                    {activeDisease.agent}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Código {activeDisease.id.toUpperCase()}</span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 mt-0.5">
                  {activeDisease.name}
                </h3>
              </div>

              {diseaseNotes[activeDisease.id] && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 shrink-0">
                  <Bookmark className="w-3.5 h-3.5" />
                  Anotação salva
                </span>
              )}
            </div>

            {/* Image + Quick Epidemiology */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 border-b border-slate-200 dark:border-zinc-800">
              <div className="md:col-span-5">
                <div className="aspect-4/3 rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-950 flex items-center justify-center">
                  {activeDisease.image && !failedImages[activeDisease.id] ? (
                    <img
                      src={activeDisease.image}
                      alt={activeDisease.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={() => markImageFailed(activeDisease.id)}
                    />
                  ) : (
                    <div className="text-center p-4 space-y-1">
                      <Camera className="w-6 h-6 text-slate-400 dark:text-zinc-500 mx-auto" />
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Imagem clínica indisponível
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5 content-start">
                <div className={`${POULTRY_SUBCARD_CLASS} p-3`}>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-zinc-400">
                    Mortalidade Estimada
                  </p>
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-400 mt-1 leading-snug">
                    {activeDisease.mortality || 'Variável'}
                  </p>
                </div>
                <div className={`${POULTRY_SUBCARD_CLASS} p-3`}>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-zinc-400">
                    Período de Incubação
                  </p>
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mt-1 leading-snug">
                    {activeDisease.incubation || 'Imediato'}
                  </p>
                </div>
                <div className={`${POULTRY_SUBCARD_CLASS} p-3 sm:col-span-2`}>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-zinc-400">
                    Principal Via de Transmissão
                  </p>
                  <p className="text-xs text-slate-700 dark:text-zinc-300 mt-1 leading-relaxed">
                    {activeDisease.transmission || 'Contato direto e fômites contaminados'}
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Clinical Sections */}
            <div className="p-4 space-y-4 text-xs text-slate-700 dark:text-zinc-300">
              <div className="space-y-1">
                <h4 className="font-semibold text-slate-900 dark:text-zinc-100">
                  Etiologia (Agente e Mecanismo)
                </h4>
                <p className="leading-relaxed">{activeDisease.etiology}</p>
              </div>

              <div className="space-y-1 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <h4 className="font-semibold text-slate-900 dark:text-zinc-100">
                  Sintomas e Manifestações no Campo
                </h4>
                <p className="leading-relaxed">{activeDisease.symptoms}</p>
              </div>

              <div className="space-y-1 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <h4 className="font-semibold text-slate-900 dark:text-zinc-100">
                  Ações de Controle e Tratamento
                </h4>
                <p className="leading-relaxed">{activeDisease.control}</p>
              </div>

              <div className="space-y-1 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <h4 className="font-semibold text-slate-900 dark:text-zinc-100">
                  Manejo Preventivo e Biosseguridade
                </h4>
                <p className="leading-relaxed">{activeDisease.management}</p>
              </div>

              <div className="space-y-1 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <h4 className="font-semibold text-slate-900 dark:text-zinc-100">
                  Cuidados de Suporte e Recuperação
                </h4>
                <p className="leading-relaxed">{activeDisease.care}</p>
              </div>

              {/* Farm Notes */}
              <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Anotações Técnicas da Granja
                  </h4>
                  {saveNoteSuccess === activeDisease.id && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <Check className="w-3 h-3" />
                      Salvo
                    </span>
                  )}
                </div>

                <textarea
                  value={currentNoteText}
                  onChange={e => setCurrentNoteText(e.target.value)}
                  placeholder="Registre cepas identificadas, protocolos vacinais adotados, datas de ocorrência ou resposta a antibiograma..."
                  rows={3}
                  className={`${POULTRY_TEXTAREA_CLASS} resize-y`}
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSaveNote(activeDisease.id)}
                    className={POULTRY_PRIMARY_BTN_CLASS}
                  >
                    <Save className="w-3.5 h-3.5" />
                    Salvar Observação
                  </button>
                </div>
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  );
};
