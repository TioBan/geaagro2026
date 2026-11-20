import React, { useMemo, useState } from 'react';
import { BUFFALO_DISEASES } from '../../data/buffaloData';
import {
  getPhotosForDisease,
  BuffaloDiseasePhoto,
  getAllBuffaloDiseaseRealPhotos,
} from '../../utils/buffaloDiseasePhotos';
import {
  Search,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Bug,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Maximize2,
  X,
  Stethoscope,
  Pill,
  Syringe,
  Microscope,
  Clock,
  Eye,
  Layers,
  Thermometer,
  FileText,
  Camera,
  WifiOff,
  Grid,
  List,
} from 'lucide-react';

type DiseaseSubTab = 'overview' | 'etiology' | 'symptoms' | 'control' | 'photos';

export const BuffaloDiseasesLibraryView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'gallery' | 'cards'>('gallery');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [zoonoticFilter, setZoonoticFilter] = useState<'all' | 'true' | 'false'>('all');
  const [expandedDiseaseId, setExpandedDiseaseId] = useState<string | null>(BUFFALO_DISEASES[0]?.id || null);
  const [activeTabByDisease, setActiveTabByDisease] = useState<Record<string, DiseaseSubTab>>({});
  const [modalPhoto, setModalPhoto] = useState<BuffaloDiseasePhoto | null>(null);

  const realPhotosList = useMemo(() => getAllBuffaloDiseaseRealPhotos(), []);

  const getActiveTab = (diseaseId: string): DiseaseSubTab => activeTabByDisease[diseaseId] || 'overview';

  const setActiveTab = (diseaseId: string, tab: DiseaseSubTab) => {
    setActiveTabByDisease((prev) => ({ ...prev, [diseaseId]: tab }));
  };

  const filteredDiseases = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return BUFFALO_DISEASES.filter((d) => {
      const matchesSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        (d.popularName && d.popularName.toLowerCase().includes(q)) ||
        d.scientificAgent.toLowerCase().includes(q) ||
        d.clinicalSigns.some((s) => s.toLowerCase().includes(q)) ||
        (d.controlDetails?.drugOfChoice && d.controlDetails.drugOfChoice.toLowerCase().includes(q));

      const matchesCategory = selectedCategory === 'todas' || d.category === selectedCategory;
      const matchesZoonotic =
        zoonoticFilter === 'all' || (zoonoticFilter === 'true' ? d.zoonotic : !d.zoonotic);

      return matchesSearch && matchesCategory && matchesZoonotic;
    });
  }, [searchTerm, selectedCategory, zoonoticFilter]);

  const filteredRealPhotos = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return realPhotosList.filter((item) => {
      const matchesSearch =
        !q ||
        item.diseaseName.toLowerCase().includes(q) ||
        item.popularName.toLowerCase().includes(q) ||
        item.photo.title.toLowerCase().includes(q) ||
        item.photo.description.toLowerCase().includes(q) ||
        item.photo.anatomicalSite.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === 'todas' || item.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesZoonotic =
        zoonoticFilter === 'all' || (zoonoticFilter === 'true' ? item.zoonotic : !item.zoonotic);

      return matchesSearch && matchesCategory && matchesZoonotic;
    });
  }, [realPhotosList, searchTerm, selectedCategory, zoonoticFilter]);

  const handleOpenDiseaseCard = (diseaseId: string, tab: DiseaseSubTab = 'overview') => {
    setViewMode('cards');
    setExpandedDiseaseId(diseaseId);
    setActiveTab(diseaseId, tab);
  };

  const zoonoticCount = useMemo(() => BUFFALO_DISEASES.filter((d) => d.zoonotic).length, []);

  return (
    <div className="space-y-4">
      {/* Cabeçalho e Filtros */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Biblioteca de Doenças &amp; Atlas Clínico Bubalino
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Etiologia, diagnóstico diferencial, protocolos terapêuticos e registros fotográficos clínicos disponíveis offline.
            </p>
          </div>

          <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg self-start md:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('gallery')}
              className={`h-7 px-2.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'gallery'
                  ? 'bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-300 shadow-2xs border border-slate-200 dark:border-zinc-700'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Galeria Clínica</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`h-7 px-2.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-300 shadow-2xs border border-slate-200 dark:border-zinc-700'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Fichas Clínicas</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
          <div className="sm:col-span-6 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por doença, agente, sintoma ou princípio ativo..."
              className="w-full h-8 pl-8 pr-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-teal-500"
            >
              <option value="todas">Todas as categorias ({BUFFALO_DISEASES.length})</option>
              <option value="Infecciosa">Infecciosas</option>
              <option value="Reprodutiva">Reprodutivas</option>
              <option value="Parasitária">Parasitárias</option>
              <option value="Podal (Cascos)">Podais / Cascos</option>
              <option value="Neonatal">Neonatais</option>
              <option value="Metabólica / Nutricional">Metabólicas / Conforto Térmico</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={zoonoticFilter}
              onChange={(e) => setZoonoticFilter(e.target.value as 'all' | 'true' | 'false')}
              className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-teal-500"
            >
              <option value="all">Todas as enfermidades</option>
              <option value="true">Apenas zoonoses ({zoonoticCount})</option>
              <option value="false">Apenas não zoonóticas</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
          <div className="flex flex-wrap items-center gap-3 tabular-nums">
            <span>
              Catálogo: <strong className="text-slate-900 dark:text-zinc-100">{filteredDiseases.length}</strong> doenças
            </span>
            <span className="text-slate-300 dark:text-zinc-700">|</span>
            <span className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-400 font-medium">
              <WifiOff className="w-3 h-3" />
              {realPhotosList.length} fotografias clínicas embutidas offline
            </span>
          </div>
          {searchTerm || selectedCategory !== 'todas' || zoonoticFilter !== 'all' ? (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('todas');
                setZoonoticFilter('all');
              }}
              className="text-teal-600 dark:text-teal-400 hover:underline font-medium cursor-pointer"
            >
              Limpar filtros
            </button>
          ) : null}
        </div>
      </div>

      {/* MODO 1: GALERIA CLÍNICA OFFLINE */}
      {viewMode === 'gallery' && (
        filteredRealPhotos.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center">
            <Camera className="w-6 h-6 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
              Nenhum registro fotográfico encontrado para os filtros atuais.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredRealPhotos.map((item) => (
              <article
                key={item.diseaseId}
                className="group bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-teal-500/50 dark:hover:border-teal-500/50 rounded-xl overflow-hidden transition-colors flex flex-col justify-between"
              >
                <div>
                  <div
                    onClick={() => setModalPhoto(item.photo)}
                    className="relative aspect-video bg-slate-950 overflow-hidden cursor-pointer border-b border-slate-200 dark:border-zinc-800"
                    title="Ampliar imagem clínica"
                  >
                    <img
                      src={item.photo.imageDataUri}
                      alt={item.photo.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-slate-900/85 text-white text-[10px] font-medium rounded border border-white/15">
                        Offline
                      </span>
                      {item.zoonotic && (
                        <span className="px-2 py-0.5 bg-rose-600/95 text-white text-[10px] font-semibold rounded inline-flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Zoonose
                        </span>
                      )}
                    </div>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-slate-900/85 text-white rounded text-[10px] font-medium inline-flex items-center gap-1">
                      <Maximize2 className="w-3 h-3" />
                      Ampliar
                    </span>
                  </div>

                  <div className="p-3.5 space-y-2.5">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
                        {item.category}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-0.5 leading-snug">
                        {item.diseaseName}
                      </h3>
                      {item.popularName && (
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                          Nome popular: {item.popularName}
                        </p>
                      )}
                    </div>

                    <div className="p-2.5 bg-slate-50 dark:bg-zinc-950/70 rounded-lg border border-slate-100 dark:border-zinc-800 space-y-1">
                      <p className="text-xs font-medium text-slate-800 dark:text-zinc-200 leading-snug">
                        {item.photo.title}
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2">
                        {item.photo.description}
                      </p>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-500 dark:text-zinc-400">
                      {item.photo.anatomicalSite && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-700 dark:text-zinc-300 shrink-0">Sítio:</span>
                          <span className="truncate">{item.photo.anatomicalSite}</span>
                        </div>
                      )}
                      {item.photo.stageOrLesion && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-700 dark:text-zinc-300 shrink-0">Achado:</span>
                          <span className="text-amber-700 dark:text-amber-400 truncate">{item.photo.stageOrLesion}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-3.5 pb-3.5 pt-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalPhoto(item.photo)}
                    className="flex-1 h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Ver foto
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDiseaseCard(item.diseaseId, 'overview')}
                    className="flex-1 h-7 px-2.5 rounded-md bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Ficha clínica
                  </button>
                </div>
              </article>
            ))}
          </div>
        )
      )}

      {/* MODO 2: FICHAS CLÍNICAS EXPANDÍVEIS */}
      {viewMode === 'cards' && (
        filteredDiseases.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center">
            <Stethoscope className="w-6 h-6 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
              Nenhuma doença encontrada para os filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredDiseases.map((disease) => {
              const isExpanded = expandedDiseaseId === disease.id;
              const activeTab = getActiveTab(disease.id);
              const photos = getPhotosForDisease(disease.id);
              const realPhoto = photos.find((p) => p.isRealPhoto) || photos[0];

              return (
                <div
                  key={disease.id}
                  className={`bg-white dark:bg-zinc-900 border rounded-xl overflow-hidden transition-colors ${
                    isExpanded
                      ? 'border-teal-500/60 dark:border-teal-600/60'
                      : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {/* Cabeçalho da Ficha */}
                  <div
                    onClick={() => setExpandedDiseaseId(isExpanded ? null : disease.id)}
                    className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 select-none transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {realPhoto && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalPhoto(realPhoto);
                          }}
                          className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-zinc-700 bg-slate-950 cursor-pointer"
                          title="Ampliar foto clínica"
                        >
                          <img
                            src={realPhoto.imageDataUri}
                            alt={disease.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      )}

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                            {disease.name}
                          </h3>
                          <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] font-medium rounded border border-slate-200 dark:border-zinc-700">
                            {disease.category}
                          </span>
                          {disease.zoonotic && (
                            <span className="px-1.5 py-0.5 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-semibold rounded border border-rose-200 dark:border-rose-800/60 inline-flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Zoonose
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500 dark:text-zinc-400">
                          {disease.popularName && <span>Popular: {disease.popularName}</span>}
                          <span className="italic text-slate-600 dark:text-zinc-300">
                            Agente: {disease.scientificAgent}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-slate-500 dark:text-zinc-400">
                      <span className="text-[11px] font-medium text-teal-600 dark:text-teal-400 hidden sm:inline">
                        {isExpanded ? 'Recolher' : 'Abrir ficha'}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Corpo Expandido */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-950/40">
                      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-zinc-800 px-3 bg-white dark:bg-zinc-900 gap-1">
                        {(
                          [
                            { id: 'overview', label: 'Visão Geral', icon: FileText },
                            { id: 'etiology', label: 'Etiologia', icon: Microscope },
                            { id: 'symptoms', label: 'Sintomas & Diagnóstico', icon: Stethoscope },
                            { id: 'control', label: 'Controle & Terapêutica', icon: ShieldCheck },
                            { id: 'photos', label: `Fotos (${photos.length})`, icon: ImageIcon },
                          ] as const
                        ).map((tab) => {
                          const Icon = tab.icon;
                          const active = activeTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setActiveTab(disease.id, tab.id)}
                              className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                                active
                                  ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                                  : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              <span>{tab.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="p-4 text-xs space-y-4">
                        {activeTab === 'overview' && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-2">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400 inline-flex items-center gap-1.5">
                                  <Stethoscope className="w-3.5 h-3.5" />
                                  Principais Sinais Clínicos
                                </span>
                                <ul className="space-y-1 text-slate-700 dark:text-zinc-300 list-disc pl-4 leading-relaxed">
                                  {disease.clinicalSigns.map((sign, idx) => (
                                    <li key={idx}>{sign}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-2">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400 inline-flex items-center gap-1.5">
                                  <Bug className="w-3.5 h-3.5" />
                                  Transmissão &amp; Epidemiologia
                                </span>
                                <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                                  {disease.transmission}
                                </p>
                                <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-800">
                                  <div>
                                    Morbidade:{' '}
                                    <strong className="text-slate-800 dark:text-zinc-200">{disease.morbidityRate}</strong>
                                  </div>
                                  <div>
                                    Mortalidade:{' '}
                                    <strong className="text-slate-800 dark:text-zinc-200">{disease.mortalityRate}</strong>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {photos.length > 0 && (
                              <div className="p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                  <ImageIcon className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                                  <div>
                                    <p className="font-medium text-slate-900 dark:text-zinc-100">
                                      Atlas Clínico Offline ({photos.length} imagens disponíveis)
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                      Fotografia clínica de campo e esquema diagnóstico vet-HD.
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setActiveTab(disease.id, 'photos')}
                                  className="h-7 px-3 rounded-md bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium shrink-0 cursor-pointer"
                                >
                                  Abrir fotos
                                </button>
                              </div>
                            )}

                            {disease.withdrawalTimeWarning && (
                              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg text-amber-900 dark:text-amber-200 flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-semibold block">Carência Sanitária &amp; Saúde Pública</span>
                                  <span>{disease.withdrawalTimeWarning}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {activeTab === 'etiology' && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-2.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[11px] font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400 inline-flex items-center gap-1.5">
                                    <Microscope className="w-3.5 h-3.5" />
                                    Agente Etiológico
                                  </span>
                                  {disease.etiologyDetails?.agentType && (
                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] font-medium rounded">
                                      {disease.etiologyDetails.agentType}
                                    </span>
                                  )}
                                </div>
                                <p className="italic text-sm text-slate-900 dark:text-zinc-100 font-medium bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-md border border-slate-200 dark:border-zinc-800">
                                  {disease.scientificAgent}
                                </p>
                                {disease.etiologyDetails?.incubationPeriod && (
                                  <div className="text-[11px] text-slate-600 dark:text-zinc-300 inline-flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                                    <span>
                                      Incubação / Pré-patente:{' '}
                                      <strong>{disease.etiologyDetails.incubationPeriod}</strong>
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-2">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400 inline-flex items-center gap-1.5">
                                  <Activity className="w-3.5 h-3.5" />
                                  Patogenia
                                </span>
                                <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                                  {disease.etiologyDetails?.pathogenesis ||
                                    'Mecanismo de patogenicidade característico da espécie bubalina.'}
                                </p>
                              </div>
                            </div>

                            {disease.etiologyDetails?.predisposingFactors && (
                              <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-2">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 inline-flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  Fatores Predisponentes em Búfalos
                                </span>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-700 dark:text-zinc-300 list-disc pl-4">
                                  {disease.etiologyDetails.predisposingFactors.map((factor, idx) => (
                                    <li key={idx}>{factor}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {activeTab === 'symptoms' && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-2">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 inline-flex items-center gap-1.5">
                                  <Eye className="w-3.5 h-3.5" />
                                  Sinais Iniciais / Precoces
                                </span>
                                <ul className="space-y-1 text-slate-700 dark:text-zinc-300 list-disc pl-4">
                                  {(disease.symptomsDetails?.earlySigns || disease.clinicalSigns.slice(0, 2)).map(
                                    (item, idx) => (
                                      <li key={idx}>{item}</li>
                                    )
                                  )}
                                </ul>
                              </div>

                              <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-2">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-400 inline-flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  Sinais Avançados &amp; Complicações
                                </span>
                                <ul className="space-y-1 text-slate-700 dark:text-zinc-300 list-disc pl-4">
                                  {(disease.symptomsDetails?.advancedSigns || disease.clinicalSigns.slice(2)).map(
                                    (item, idx) => (
                                      <li key={idx}>{item}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-2">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-700 dark:text-zinc-300 inline-flex items-center gap-1.5">
                                  <Thermometer className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                                  Sinais Vitais &amp; Achados de Necropsia
                                </span>
                                <ul className="space-y-1 text-slate-700 dark:text-zinc-300 list-disc pl-4">
                                  {(
                                    disease.symptomsDetails?.vitalSignsAlterations || [
                                      'Monitorar temperatura retal (referência: 38,0°C a 39,2°C)',
                                      'Frequência respiratória basal (referência: 18 a 30 mov/min)',
                                    ]
                                  ).map((vital, idx) => (
                                    <li key={idx}>{vital}</li>
                                  ))}
                                  {(disease.symptomsDetails?.necropsyOrLesionFindings || []).map((finding, idx) => (
                                    <li key={`nec-${idx}`} className="text-slate-600 dark:text-zinc-400">
                                      {finding}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-2">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400 inline-flex items-center gap-1.5">
                                  <Layers className="w-3.5 h-3.5" />
                                  Diagnóstico Laboratorial
                                </span>
                                <ul className="space-y-1 text-slate-700 dark:text-zinc-300 list-disc pl-4">
                                  {disease.diagnosticMethods.map((method, idx) => (
                                    <li key={idx}>{method}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === 'control' && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-2.5">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400 inline-flex items-center gap-1.5">
                                  <Pill className="w-3.5 h-3.5" />
                                  Protocolo Terapêutico &amp; Posologia
                                </span>
                                <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                                  {disease.treatmentProtocol}
                                </p>
                                {disease.controlDetails?.drugOfChoice && (
                                  <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-md border border-slate-200 dark:border-zinc-800 space-y-1">
                                    <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-zinc-400 block">
                                      Princípio Ativo / Posologia
                                    </span>
                                    <p className="font-semibold text-slate-900 dark:text-zinc-100">
                                      {disease.controlDetails.drugOfChoice}
                                    </p>
                                    {disease.controlDetails.dosageAndRoute && (
                                      <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                                        {disease.controlDetails.dosageAndRoute}
                                      </p>
                                    )}
                                  </div>
                                )}
                                {disease.controlDetails?.supportiveCare && (
                                  <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                                    <strong className="text-slate-800 dark:text-zinc-200">Suporte clínico:</strong>{' '}
                                    {disease.controlDetails.supportiveCare}
                                  </p>
                                )}
                              </div>

                              <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-2.5">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1.5">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  Biosseguridade &amp; Prevenção
                                </span>
                                <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                                  {disease.preventionManagement}
                                </p>
                                {disease.controlDetails?.biosecurityMeasures &&
                                  disease.controlDetails.biosecurityMeasures.length > 0 && (
                                    <ul className="space-y-1 text-[11px] text-slate-600 dark:text-zinc-400 list-disc pl-4">
                                      {disease.controlDetails.biosecurityMeasures.map((m, idx) => (
                                        <li key={idx}>{m}</li>
                                      ))}
                                    </ul>
                                  )}
                                {disease.controlDetails?.vaccinationProtocol && (
                                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-md border border-emerald-200 dark:border-emerald-900/50 space-y-0.5">
                                    <span className="text-[10px] uppercase font-semibold text-emerald-800 dark:text-emerald-300 inline-flex items-center gap-1">
                                      <Syringe className="w-3 h-3" />
                                      Esquema Vacinal
                                    </span>
                                    <p className="text-[11px] text-emerald-900 dark:text-emerald-100">
                                      {disease.controlDetails.vaccinationProtocol}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {disease.withdrawalTimeWarning && (
                                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg text-amber-900 dark:text-amber-200 flex items-start gap-2">
                                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                  <span>{disease.withdrawalTimeWarning}</span>
                                </div>
                              )}
                              {disease.controlDetails?.quarantineDays !== undefined && (
                                <div className="p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-700 dark:text-zinc-300 flex items-center gap-2 tabular-nums">
                                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                                  <span>
                                    Quarentena recomendada:{' '}
                                    <strong className="text-slate-900 dark:text-zinc-100">
                                      {disease.controlDetails.quarantineDays} dias
                                    </strong>
                                  </span>
                                </div>
                              )}
                            </div>

                            {disease.references && (
                              <p className="text-[11px] text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-200 dark:border-zinc-800">
                                Referências: {disease.references}
                              </p>
                            )}
                          </div>
                        )}

                        {activeTab === 'photos' && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
                                Registros Visuais Clínicos (Offline)
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                                Clique na imagem para ampliar
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {photos.map((photo) => (
                                <div
                                  key={photo.id}
                                  onClick={() => setModalPhoto(photo)}
                                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-teal-500/60 rounded-lg overflow-hidden cursor-pointer transition-colors"
                                >
                                  <div className="relative aspect-video bg-slate-950 border-b border-slate-200 dark:border-zinc-800">
                                    <img
                                      src={photo.imageDataUri}
                                      alt={photo.title}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover"
                                    />
                                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/85 text-white text-[10px] font-medium rounded">
                                      {photo.isRealPhoto ? 'Fotografia Clínica Real' : 'Atlas Vet-HD'}
                                    </span>
                                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-slate-900/85 text-white text-[10px] font-medium rounded inline-flex items-center gap-1">
                                      <Maximize2 className="w-3 h-3" />
                                      Ampliar
                                    </span>
                                  </div>
                                  <div className="p-3 space-y-1">
                                    <p className="font-semibold text-slate-900 dark:text-zinc-100">{photo.title}</p>
                                    <p className="text-[11px] text-slate-600 dark:text-zinc-400">{photo.description}</p>
                                    <div className="pt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-500 dark:text-zinc-400">
                                      <span>Sítio: {photo.anatomicalSite}</span>
                                      <span>Lesão: {photo.stageOrLesion}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Modal Lightbox de Zoom */}
      {modalPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setModalPhoto(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-4xl w-full overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                  {modalPhoto.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                  {modalPhoto.anatomicalSite} • {modalPhoto.stageOrLesion}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalPhoto(null)}
                className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300 shrink-0 cursor-pointer"
                aria-label="Fechar visualização"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-slate-950 flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={modalPhoto.imageDataUri}
                alt={modalPhoto.title}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            <div className="px-4 py-3 border-t border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-300">
              {modalPhoto.description}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
