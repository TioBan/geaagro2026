import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  Maximize2,
  ZoomIn,
  ZoomOut,
  X,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  Layers,
  Sprout,
  Activity,
  Droplets,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { VisualNutritionalSymptom } from '../types/nursery';
import { visualNutritionalSymptomsGuide } from '../data/nurseryData';

interface NurseryNutritionalDiagnosticProps {
  onSelectElement?: (symptom: VisualNutritionalSymptom) => void;
}

export const NurseryNutritionalDiagnostic: React.FC<NurseryNutritionalDiagnosticProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'todos' | 'deficiencia' | 'excesso'>('todos');
  const [mobilityFilter, setMobilityFilter] = useState<'todos' | 'folhas_velhas' | 'folhas_jovens' | 'toda_planta'>('todos');
  const [selectedSymptom, setSelectedSymptom] = useState<VisualNutritionalSymptom | null>(null);
  const [activePhotoModalUrl, setActivePhotoModalUrl] = useState<string | null>(null);
  const [activePhotoModalCaption, setActivePhotoModalCaption] = useState<string>('');
  const [activePhotoModalTag, setActivePhotoModalTag] = useState<string>('');
  const [zoomScale, setZoomScale] = useState<number>(1);

  // Filtered symptoms
  const filteredSymptoms = useMemo(() => {
    return visualNutritionalSymptomsGuide.filter((item) => {
      const matchesSearch =
        searchTerm.trim() === '' ||
        item.element.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.symptomsSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.visualDiagnosticDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.correctiveAction.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.affectedCrops && item.affectedCrops.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchesType = typeFilter === 'todos' || item.type === typeFilter;
      const matchesMobility = mobilityFilter === 'todos' || item.plantAreaAffected === mobilityFilter;

      return matchesSearch && matchesType && matchesMobility;
    });
  }, [searchTerm, typeFilter, mobilityFilter]);

  const openLightbox = (imgUrl: string, caption?: string, tag?: string, symptom?: VisualNutritionalSymptom) => {
    setActivePhotoModalUrl(imgUrl);
    setActivePhotoModalCaption(caption || symptom?.symptomsSummary || '');
    setActivePhotoModalTag(tag || symptom?.element || '');
    setSelectedSymptom(symptom || null);
    setZoomScale(1);
  };

  const closeLightbox = () => {
    setActivePhotoModalUrl(null);
    setSelectedSymptom(null);
    setZoomScale(1);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="diagnostico-nutricional-mudas">
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                <WifiOff className="w-3.5 h-3.5" />
                100% Offline (Sem Internet)
              </span>
              <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                <Sparkles className="w-3.5 h-3.5" />
                Atlas Fotográfico de Nutrição
              </span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              Diagnóstico Visual de Deficiências & Excessos Nutricionais em Mudas
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 max-w-3xl">
              Identificação agronômica rápida com fotos reais de campo armazenadas localmente para uso contínuo em estufas e bancadas sem conexão.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-900 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <div className="text-[11px] text-slate-600 dark:text-zinc-400">
              <span className="font-bold text-slate-900 dark:text-zinc-200">{visualNutritionalSymptomsGuide.length} Fichas com Fotos Reais</span>
              <span className="block text-[10px]">Cacheadas no dispositivo do viveiro</span>
            </div>
          </div>
        </div>

        {/* Quick Diagnostic Mobility Rule Guide (Chave Rápida de Campo) */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
          <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-xs mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Folhas Velhas (Basais) • Nutrientes Móveis
            </div>
            <p className="text-[11px] text-slate-600 dark:text-zinc-400">
              O nutriente transloca para o broto novo: <strong>N (clorose uniforme), P (arroxeamento), K (queima de bordas), Mg (espinha de peixe)</strong>.
            </p>
          </div>

          <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-400 font-bold text-xs mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Folhas Jovens (Apicais) • Nutrientes Imóveis
            </div>
            <p className="text-[11px] text-slate-600 dark:text-zinc-400">
              O sintoma aparece no meristema novo: <strong>Ca (tip-burn/gancho), Fe (clorose internerval), B (morte do broto), Zn (folhas em roseta)</strong>.
            </p>
          </div>

          <div className="bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-400 font-bold text-xs mb-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Toda a Planta / Raízes • Excesso & Sais
            </div>
            <p className="text-[11px] text-slate-600 dark:text-zinc-400">
              Seca osmótica e fitotoxidez: <strong>Condutividade Elétrica (CE) excessiva, sais brancos no substrato e queima perimétrica</strong>.
            </p>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="mt-5 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar por elemento (N, Fe, Ca...), sintoma, cultura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Type */}
            <div className="flex items-center bg-slate-100 dark:bg-zinc-900 p-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs">
              <button
                onClick={() => setTypeFilter('todos')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  typeFilter === 'todos'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Todos ({visualNutritionalSymptomsGuide.length})
              </button>
              <button
                onClick={() => setTypeFilter('deficiencia')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                  typeFilter === 'deficiencia'
                    ? 'bg-white dark:bg-zinc-800 text-amber-700 dark:text-amber-400 shadow-2xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Deficiências
              </button>
              <button
                onClick={() => setTypeFilter('excesso')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                  typeFilter === 'excesso'
                    ? 'bg-white dark:bg-zinc-800 text-red-700 dark:text-red-400 shadow-2xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Excessos / Salinidade
              </button>
            </div>

            {/* Filter by Area / Mobility */}
            <div className="flex items-center bg-slate-100 dark:bg-zinc-900 p-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs">
              <button
                onClick={() => setMobilityFilter('todos')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  mobilityFilter === 'todos'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Todas as Áreas
              </button>
              <button
                onClick={() => setMobilityFilter('folhas_velhas')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  mobilityFilter === 'folhas_velhas'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Folhas Velhas
              </button>
              <button
                onClick={() => setMobilityFilter('folhas_jovens')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  mobilityFilter === 'folhas_jovens'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Folhas Jovens / Ápice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Nutritional Symptoms with High-Resolution Photos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSymptoms.map((symptom) => {
          const photoUrl = symptom.realPhotoUrl || symptom.imageUrl;
          return (
            <div
              key={symptom.id}
              className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Photo Container with Offline Badge and Zoom overlay */}
              <div className="relative h-52 bg-slate-900 group overflow-hidden">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={symptom.photoCaption || symptom.element}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => openLightbox(photoUrl, symptom.photoCaption, symptom.photoTag, symptom)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400 text-xs">
                    Foto em Carregamento
                  </div>
                )}

                {/* Badges Over Image */}
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 bg-black/75 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md border border-white/20">
                    <WifiOff className="w-3 h-3 text-emerald-400" />
                    Offline
                  </span>
                  <span
                    className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      symptom.type === 'deficiencia'
                        ? 'bg-amber-500/90 text-white border-amber-400/40'
                        : 'bg-red-600/90 text-white border-red-400/40'
                    }`}
                  >
                    {symptom.type === 'deficiencia' ? 'Deficiência' : 'Excesso / Fitotoxidez'}
                  </span>
                </div>

                {/* Mobility Badge */}
                <div className="absolute top-2.5 right-2.5">
                  <span className="bg-slate-900/85 backdrop-blur-xs text-slate-200 text-[10px] font-medium px-2 py-0.5 rounded-md border border-slate-700">
                    {symptom.plantAreaAffected === 'folhas_velhas'
                      ? 'Folhas Velhas (Móvel)'
                      : symptom.plantAreaAffected === 'folhas_jovens'
                      ? 'Folhas Jovens (Imóvel)'
                      : 'Toda a Planta / Raiz'}
                  </span>
                </div>

                {/* Expand / Lightbox Button */}
                {photoUrl && (
                  <button
                    onClick={() => openLightbox(photoUrl, symptom.photoCaption, symptom.photoTag, symptom)}
                    className="absolute bottom-2.5 right-2.5 bg-black/75 hover:bg-black text-white p-1.5 rounded-lg border border-white/20 opacity-90 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-medium"
                    title="Ampliar Foto em Alta Definição"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    Ampliar Foto
                  </button>
                )}

                {/* Photo Tag description bar */}
                {symptom.photoTag && (
                  <div className="absolute bottom-2.5 left-2.5 max-w-[65%] truncate bg-black/75 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded border border-white/20">
                    {symptom.photoTag}
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          symptom.type === 'deficiencia' ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                      />
                      {symptom.element}
                    </h4>
                  </div>

                  {symptom.photoCaption && (
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 italic">
                      "{symptom.photoCaption}"
                    </p>
                  )}

                  <p className="text-xs text-slate-700 dark:text-zinc-300 font-medium leading-relaxed">
                    {symptom.symptomsSummary}
                  </p>

                  {symptom.biochemicalRole && (
                    <div className="text-[11px] text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900/60 p-2 rounded-lg border border-slate-100 dark:border-zinc-800/80">
                      <strong className="text-slate-800 dark:text-zinc-300 block text-[10px] uppercase tracking-wider mb-0.5">
                        Função na Fisiologia da Muda:
                      </strong>
                      {symptom.biochemicalRole}
                    </div>
                  )}

                  {symptom.affectedCrops && symptom.affectedCrops.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center pt-1">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 mr-1">Culturas:</span>
                      {symptom.affectedCrops.map((crop, i) => (
                        <span
                          key={i}
                          className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[9px] font-medium px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/40"
                        >
                          {crop}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Corrective Actions & Fertigation Box */}
                <div className="bg-slate-50 dark:bg-zinc-900 p-3 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs space-y-2">
                  <div>
                    <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] mb-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ação Corretiva Imediata:
                    </div>
                    <p className="text-slate-600 dark:text-zinc-300 text-[11px] leading-snug">
                      {symptom.correctiveAction}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 dark:border-zinc-800">
                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold text-[11px] mb-0.5">
                      <Droplets className="w-3.5 h-3.5" />
                      Ajuste na Fertirrigação:
                    </div>
                    <p className="text-slate-600 dark:text-zinc-300 text-[11px] leading-snug">
                      {symptom.fertigationAdjustment}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSymptoms.length === 0 && (
        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center">
          <Leaf className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto mb-2" />
          <h4 className="font-bold text-sm text-slate-700 dark:text-zinc-300">Nenhum sintoma ou elemento encontrado</h4>
          <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
            Tente pesquisar por outro nutriente (ex: N, Ca, Fe, P, Mg, B, Zn) ou ajuste os filtros.
          </p>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {activePhotoModalUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[95vh] bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-900 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded border border-emerald-800">
                  <WifiOff className="w-3 h-3" />
                  Foto 100% Offline
                </span>
                <h4 className="text-white font-bold text-sm">
                  {activePhotoModalTag || selectedSymptom?.element || 'Diagnóstico Visual'}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomScale((prev) => Math.min(prev + 0.25, 2.5))}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                  title="Aumentar Zoom"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomScale((prev) => Math.max(prev - 0.25, 0.75))}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                  title="Diminuir Zoom"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={closeLightbox}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-900/60 text-zinc-200 hover:text-white transition-colors"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Image Area */}
            <div className="relative flex-1 min-h-[300px] max-h-[60vh] bg-black flex items-center justify-center overflow-auto p-4">
              <img
                src={activePhotoModalUrl}
                alt={activePhotoModalCaption}
                referrerPolicy="no-referrer"
                style={{ transform: `scale(${zoomScale})`, transition: 'transform 0.2s ease-out' }}
                className="max-h-[55vh] max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Modal Footer with Agronomic Details */}
            <div className="p-4 bg-zinc-900 border-t border-zinc-800 text-xs space-y-2">
              <p className="text-zinc-200 font-medium">
                {activePhotoModalCaption || selectedSymptom?.visualDiagnosticDescription}
              </p>

              {selectedSymptom && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
                  <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                    <span className="text-emerald-400 font-bold text-[11px] block">Ação Corretiva:</span>
                    <span className="text-zinc-300 text-[11px]">{selectedSymptom.correctiveAction}</span>
                  </div>
                  <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                    <span className="text-blue-400 font-bold text-[11px] block">Fertirrigação:</span>
                    <span className="text-zinc-300 text-[11px]">{selectedSymptom.fertigationAdjustment}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
