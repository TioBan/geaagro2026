import React, { useState, useMemo, useRef, useEffect } from 'react';
import { OfflineImage } from './OfflineImage';
import { useImageCache, prefetchImagesToIndexedDB } from '../hooks/useImageCache';
import {
  Bug, Search, ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw,
  SlidersHorizontal, Filter, Sparkles, Crosshair, Info, Layers,
  ExternalLink, ChevronRight, X, Tag, FlaskConical, ShieldCheck,
  AlertTriangle, Copy, Check, Eye, Leaf, FileText, ArrowRight, Share2,
  ArrowRightLeft, Microscope, Camera
} from 'lucide-react';
import { NematodeSpecies } from '../types/nematology';
import { NEMATODE_SPECIES_CATALOG } from '../data/nematologyData';
import { getSpeciesMediaData } from '../data/nematodeMediaAtlas';
import { NematodeComparator } from './NematodeComparator';

interface NematodeSpeciesBankProps {
  selectedSpeciesId?: string;
  onSelectSpecies?: (id: string) => void;
}

export const NematodeSpeciesBank: React.FC<NematodeSpeciesBankProps> = ({
  selectedSpeciesId: initialSpeciesId,
  onSelectSpecies
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    initialSpeciesId || NEMATODE_SPECIES_CATALOG[0]?.id || 'meloidogyne_incognita'
  );
  const [bankViewMode, setBankViewMode] = useState<'atlas' | 'comparator' | 'gallery'>('atlas');
  useEffect(() => {
    const allUrls = NEMATODE_SPECIES_CATALOG.flatMap(s => [
      getSpeciesMediaData(s.id, s.anatomyType || 'globose').microscope.url,
      getSpeciesMediaData(s.id, s.anatomyType || 'globose').fieldDamage.url
    ]);
    prefetchImagesToIndexedDB(allUrls).catch(console.error);
  }, []);


  useEffect(() => {
    if (initialSpeciesId && initialSpeciesId !== selectedId) {
      setSelectedId(initialSpeciesId);
    }
  }, [initialSpeciesId]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedHostFilter, setSelectedHostFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'genus' | 'type'>('name');
  const [showOnlyWithRealImages, setShowOnlyWithRealImages] = useState<boolean>(false);

  // Viewer & Microscope States
  const [viewerMode, setViewerMode] = useState<'photo_micro' | 'photo_field' | 'svg'>('photo_micro');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0); // 1.0x to 4.0x
  const [microContrast, setMicroContrast] = useState<'light' | 'phase' | 'fuchsin'>('light');
  const [isMagnifierActive, setIsMagnifierActive] = useState<boolean>(false);
  const [magnifierPos, setMagnifierPos] = useState<{ x: number; y: number; relX: number; relY: number }>({ x: 0, y: 0, relX: 0, relY: 0 });
  const [showMagnifier, setShowMagnifier] = useState<boolean>(false);
  const [isFullscreenModal, setIsFullscreenModal] = useState<boolean>(false);
  const [fullscreenZoom, setFullscreenZoom] = useState<number>(1.5);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [activeManejoTab, setActiveManejoTab] = useState<'cultural' | 'quimico' | 'fisico'>('cultural');
  const [galleryPhotoTab, setGalleryPhotoTab] = useState<'both' | 'micro' | 'field'>('both');

  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Common agricultural hosts for fast chip filtering
  const POPULAR_HOSTS = [
    { label: 'Todos Hospedeiros', value: 'all' },
    { label: '🌱 Soja', value: 'soja' },
    { label: '🌽 Milho', value: 'milho' },
    { label: '☁️ Algodão', value: 'algodão' },
    { label: '☕ Café', value: 'café' },
    { label: '🎋 Cana', value: 'cana' },
    { label: '🥔 Batata/Tomate', value: 'batata' },
    { label: '🍊 Citros/Frutas', value: 'citros' },
    { label: '🌾 Trigo/Arroz', value: 'arroz' }
  ];

  // Helper for High-Res Photos & Descriptions from Official Nematode Media Atlas
  const getSpeciesPhotos = (speciesId: string, anatomyType: string) => {
    const media = getSpeciesMediaData(speciesId, anatomyType);
    return {
      micro: media.microscope.url,
      field: media.fieldDamage.url,
      microDesc: media.microscope.caption,
      fieldDesc: media.fieldDamage.caption,
      magnification: media.microscope.magnification,
      staining: media.microscope.staining,
      microMarkers: media.microscope.markers,
      microCredit: media.microscope.credit,
      symptomTitle: media.fieldDamage.symptomTitle,
      organ: media.fieldDamage.organ,
      fieldMarkers: media.fieldDamage.markers,
      fieldCredit: media.fieldDamage.credit,
      severityScore: media.fieldDamage.severityScore
    };
  };

  // Filtered List
  const filteredSpecies = useMemo(() => {
    return NEMATODE_SPECIES_CATALOG.filter(species => {
      const hostStr = (species.hosts || []).join(' ').toLowerCase();
      // Text search
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        species.scientificName.toLowerCase().includes(q) ||
        species.commonName.toLowerCase().includes(q) ||
        hostStr.includes(q) ||
        (species.symptoms && species.symptoms.toLowerCase().includes(q)) ||
        (species.etiology && species.etiology.toLowerCase().includes(q)) ||
        (species.economicDamage && species.economicDamage.toLowerCase().includes(q));

      // Type filter
      const matchType = selectedType === 'all' || species.anatomyType === selectedType;

      // Host filter
      const matchHost =
        selectedHostFilter === 'all' ||
        hostStr.includes(selectedHostFilter.toLowerCase());

      // Real images filter
      const media = getSpeciesMediaData(species.id, species.anatomyType || 'globose');
      const hasReal = media && media.microscope && media.microscope.url !== '/placeholder_nematode.jpg';
      const matchReal = !showOnlyWithRealImages || hasReal;

      return matchQuery && matchType && matchHost && matchReal;
    }).sort((a, b) => {
      if (sortBy === 'genus') {
        return a.scientificName.localeCompare(b.scientificName);
      }
      if (sortBy === 'type') {
        return (a.anatomyType || '').localeCompare(b.anatomyType || '');
      }
      return a.scientificName.localeCompare(b.scientificName);
    });
  }, [searchQuery, selectedType, selectedHostFilter, sortBy, showOnlyWithRealImages]);

  // Selected Active Specie
  const activeSpecie = useMemo(() => {
    const found = NEMATODE_SPECIES_CATALOG.find(s => s.id === selectedId);
    return found || filteredSpecies[0] || NEMATODE_SPECIES_CATALOG[0];
  }, [selectedId, filteredSpecies]);

  const photos = useMemo(() => {
    return getSpeciesPhotos(
      activeSpecie.id,
      activeSpecie.anatomyType || 'vermiform'
    );
  }, [activeSpecie]);

  const cachedViewerImage = useImageCache(viewerMode === 'photo_micro' ? photos.micro : (viewerMode === 'photo_field' ? photos.field : undefined));

  // Handle Specie Selection
  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (onSelectSpecies) {
      onSelectSpecies(id);
    }
  };

  // Mouse Magnifier Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      const relX = (x / rect.width) * 100;
      const relY = (y / rect.height) * 100;
      setMagnifierPos({ x, y, relX, relY });
      setShowMagnifier(true);
    } else {
      setShowMagnifier(false);
    }
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  // Copy Specie Technical Sheet
  const handleCopyReport = () => {
    const text = `FICHA TÉCNICA FITOPATOLÓGICA - AGROFARM PRO
Espécie: ${activeSpecie.scientificName}
Nome Vulgar: ${activeSpecie.commonName}
Grupo Morfológico: ${activeSpecie.anatomyType || 'Vermiforme'}
Principais Culturas Hospedeiras: ${(activeSpecie.hosts || []).join(', ') || 'N/A'}
Etiologia & Biologia: ${activeSpecie.etiology || activeSpecie.morphology || 'N/A'}
Diagnóstico & Identificação: ${activeSpecie.identification || activeSpecie.identificationMethods || 'N/A'}
Sintomas de Campo: ${activeSpecie.symptoms || 'N/A'}
Limiar de Dano Econômico: ${activeSpecie.economicDamage || 'N/A'}
Manejo Cultural: ${activeSpecie.culturalControl || activeSpecie.managementStrategies || 'N/A'}
Manejo Químico/Biológico: ${activeSpecie.chemicalControl || 'N/A'}
Manejo Físico: ${activeSpecie.physicalControl || 'N/A'}
Gerado via Sistema Agronômico Integrado AgroFarm Pro`;

    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  // Color Filter CSS based on contrast selected
  const getFilterStyle = () => {
    if (viewerMode !== 'photo_micro') return {};
    if (microContrast === 'light') {
      return { filter: 'grayscale(15%) sepia(8%) contrast(1.12) brightness(1.02)' };
    }
    if (microContrast === 'fuchsin') {
      return { filter: 'grayscale(100%) brightness(0.68) contrast(1.4) sepia(100%) hue-rotate(300deg) saturate(3.2)' };
    }
    // Phase / Methylene Blue
    return { filter: 'grayscale(100%) brightness(0.7) contrast(1.4) sepia(100%) hue-rotate(180deg) saturate(3.2)' };
  };

  // Helper for anatomy badge colors
  const getAnatomyBadge = (type?: string) => {
    switch (type) {
      case 'globose':
        return { label: 'Galha / Globoso', color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' };
      case 'cyst':
        return { label: 'Cisto Sedentário', color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800' };
      case 'reniform':
        return { label: 'Reniforme', color: 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800' };
      case 'dagger':
        return { label: 'Adaga / Lança', color: 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800' };
      case 'spiral':
        return { label: 'Espiralado', color: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800' };
      case 'sheath':
        return { label: 'Anelado / Bainha', color: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800' };
      default:
        return { label: 'Vermiforme / Lesão', color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800' };
    }
  };

  const currentBadge = getAnatomyBadge(activeSpecie.anatomyType);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ========================================================= */}
      {/* HEADER PRINCIPAL COM STATUS E RESUMO                       */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-800/80 text-emerald-600 dark:text-emerald-400">
              <Bug className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Banco de Espécies Nematológicas
                </h2>
                <span className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-700">
                  50 Espécies Agrícolas
                </span>
                <span className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-700">
                  100% Offline & Atlas HD
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Catálogo fitopatológico completo com morfologia, identificação microscópica, fotos reais de dano de campo e diagnóstico diferencial.
              </p>
            </div>
          </div>

          {/* Quick Actions & Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
              {/* View Mode Switcher */}
            <div className="flex p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-800">
              <button
                onClick={() => setBankViewMode('atlas')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  bankViewMode === 'atlas'
                    ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 font-black shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
              >
                <Microscope className="w-3.5 h-3.5" />
                <span>Atlas Individual</span>
              </button>
              <button
                onClick={() => setBankViewMode('gallery')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  bankViewMode === 'gallery'
                    ? 'bg-white dark:bg-zinc-800 text-purple-700 dark:text-purple-400 font-black shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Galeria Visual (50 Fotos)</span>
              </button>
              <button
                onClick={() => setBankViewMode('comparator')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  bankViewMode === 'comparator'
                    ? 'bg-white dark:bg-zinc-800 text-blue-700 dark:text-blue-400 font-black shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Comparador Lado a Lado</span>
              </button>
            </div>

            {bankViewMode === 'atlas' && (
              <button
                onClick={handleCopyReport}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200 dark:border-zinc-700"
                title="Copiar Ficha Técnica Agronômica Completa"
              >
                {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copiedSuccess ? 'Ficha Copiada!' : 'Copiar Laudo'}</span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* BARRA DE PESQUISA AVANÇADA E FILTROS (MODO ATLAS)          */}
        {/* ========================================================= */}
        {bankViewMode === 'atlas' && (
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-900">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Universal Search Bar */}
              <div className="md:col-span-6 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome científico, nome comum, sintoma ou hospedeiro (ex: Meloidogyne, soja, milho)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Group / Shape Filter */}
              <div className="md:col-span-3">
                <select
                  value={selectedType}
                  onChange={e => setSelectedType(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="all">Formas: Todos os Grupos ({NEMATODE_SPECIES_CATALOG.length})</option>
                  <option value="globose">Galhas / Globosos (Meloidogyne / Nacobbus)</option>
                  <option value="vermiform">Lesões / Vermiformes (Pratylenchus / Radopholus)</option>
                  <option value="cyst">Cistos (Heterodera / Globodera)</option>
                  <option value="reniform">Reniformes (Rotylenchulus / Tylenchulus)</option>
                  <option value="dagger">Adaga / Lança (Xiphinema / Longidorus)</option>
                  <option value="spiral">Espiralados (Helicotylenchus / Scutellonema)</option>
                  <option value="sheath">Anelados / Bainha (Criconemoides)</option>
                </select>
              </div>

              {/* Sorting Order */}
              <div className="md:col-span-3">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="name">Ordem: Nome Científico (A-Z)</option>
                  <option value="genus">Agrupar por Gênero</option>
                  <option value="type">Agrupar por Grupo Anatômico</option>
                </select>
              </div>
            </div>

            {/* Quick Filter Chips (Crops & Hosts) */}
            <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-thin">
              <span className="text-[10px] font-black uppercase text-slate-400 shrink-0 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filtros:
              </span>
              <button
                onClick={() => setShowOnlyWithRealImages(prev => !prev)}
                className={`px-2.5 py-1 rounded-lg font-black shrink-0 transition-all cursor-pointer text-xs flex items-center gap-1.5 border ${
                  showOnlyWithRealImages
                    ? 'bg-purple-600 dark:bg-purple-700 text-white border-purple-500 shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Apenas Fotos Reais HD ({NEMATODE_SPECIES_CATALOG.filter(s => getSpeciesMediaData(s.id, s.anatomyType || 'globose').microscope.url !== '/placeholder_nematode.jpg').length})</span>
              </button>
              <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800 shrink-0 mx-1" />
              {POPULAR_HOSTS.map(host => (
                <button
                  key={host.value}
                  onClick={() => setSelectedHostFilter(host.value)}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer text-xs ${
                    selectedHostFilter === host.value
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                  }`}
                >
                  {host.label}
                </button>
              ))}
              {(searchQuery || selectedType !== 'all' || selectedHostFilter !== 'all' || showOnlyWithRealImages) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedType('all');
                    setSelectedHostFilter('all');
                    setShowOnlyWithRealImages(false);
                  }}
                  className="px-2 py-1 text-[10px] font-bold text-red-600 dark:text-red-400 hover:underline shrink-0 cursor-pointer ml-auto"
                >
                  Limpar Filtros ({filteredSpecies.length} encontrados)
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* RENDERIZAÇÃO: COMPARADOR, GALERIA OU ATLAS INDIVIDUAL      */}
      {/* ========================================================= */}
      {bankViewMode === 'comparator' ? (
        <NematodeComparator
          initialSpeciesAId={selectedId}
          onSelectSpecies={onSelectSpecies}
        />
      ) : bankViewMode === 'gallery' ? (
        <div className="space-y-4 animate-fade-in">
          {/* Gallery Filter & Summary */}
          <div className="flex items-center justify-between gap-4 flex-wrap bg-white dark:bg-black p-4 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                Catálogo Fotográfico de Espécies ({filteredSpecies.length} de {NEMATODE_SPECIES_CATALOG.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Exibindo fotografias reais de microscopia óptica e sintomas em lavoura de cada nematoide fitoparasita.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold">
              <button
                onClick={() => setGalleryPhotoTab('both')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  galleryPhotoTab === 'both'
                    ? 'bg-white dark:bg-zinc-800 text-purple-700 dark:text-purple-400 font-black shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                Ambas (Micro + Campo)
              </button>
              <button
                onClick={() => setGalleryPhotoTab('micro')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  galleryPhotoTab === 'micro'
                    ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 font-black shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                🔬 Apenas Micrografias
              </button>
              <button
                onClick={() => setGalleryPhotoTab('field')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  galleryPhotoTab === 'field'
                    ? 'bg-white dark:bg-zinc-800 text-amber-700 dark:text-amber-400 font-black shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                🌾 Apenas Danos de Campo
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredSpecies.map(sp => {
              const spMedia = getSpeciesPhotos(sp.id, sp.anatomyType || 'vermiform');
              const badge = getAnatomyBadge(sp.anatomyType);
              return (
                <div
                  key={sp.id}
                  className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:border-slate-300 dark:hover:border-zinc-700 transition-all shadow-xs flex flex-col group"
                >
                  {/* Photo Container */}
                  <div className={`grid ${galleryPhotoTab === 'both' ? 'grid-cols-2' : 'grid-cols-1'} bg-black aspect-video relative`}>
                    {(galleryPhotoTab === 'both' || galleryPhotoTab === 'micro') && (
                      <div className="relative overflow-hidden group/img h-full">
                        <OfflineImage
                          src={spMedia.micro}
                          speciesId={sp.id}
                          anatomyType={sp.anatomyType}
                          scientificName={sp.scientificName}
                          viewType="microscope"
                          alt={`Microscopia de ${sp.scientificName}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-1.5 left-1.5 bg-black/80 backdrop-blur-xs text-[9px] font-bold text-white px-2 py-0.5 rounded border border-white/10 flex items-center gap-1">
                          <Microscope className="w-2.5 h-2.5 text-emerald-400" /> {spMedia.magnification}
                        </span>
                      </div>
                    )}
                    {(galleryPhotoTab === 'both' || galleryPhotoTab === 'field') && (
                      <div className="relative overflow-hidden group/img h-full border-l border-white/10">
                        <OfflineImage
                          src={spMedia.field}
                          speciesId={sp.id}
                          anatomyType={sp.anatomyType}
                          scientificName={sp.scientificName}
                          viewType="field"
                          alt={`Dano de campo de ${sp.scientificName}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-xs text-[9px] font-bold text-white px-2 py-0.5 rounded border border-white/10 flex items-center gap-1">
                          <Leaf className="w-2.5 h-2.5 text-amber-400" /> Dano Real
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <h4 className="text-sm font-black italic text-slate-900 dark:text-white truncate">
                            {sp.scientificName}
                          </h4>
                          {spMedia.micro !== '/placeholder_nematode.jpg' && (
                            <span className="text-[9px] font-black text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/50 px-1.5 py-0.2 rounded border border-purple-200 dark:border-purple-800 shrink-0">
                              Real
                            </span>
                          )}
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${badge.color}`}>
                          {badge.label.split('/')[0]}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400 block mt-0.5">
                        {sp.commonName}
                      </span>

                      {sp.hosts && sp.hosts.length > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-zinc-400 mt-2 truncate">
                          <Tag className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{sp.hosts.join(', ')}</span>
                        </div>
                      )}

                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium leading-relaxed mt-2 line-clamp-2">
                        {spMedia.symptomTitle}: {spMedia.fieldDesc}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-zinc-900 flex items-center gap-2">
                      <button
                        onClick={() => {
                          handleSelect(sp.id);
                          setBankViewMode('atlas');
                        }}
                        className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Abrir Atlas & Zoom</span>
                      </button>
                      <button
                        onClick={() => {
                          handleSelect(sp.id);
                          setBankViewMode('comparator');
                        }}
                        className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-bold border border-slate-200 dark:border-zinc-700 transition-all cursor-pointer"
                        title="Comparar Espécie"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SIDEBAR LISTA DE ESPÉCIES */}
        <div className="lg:col-span-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
              Espécies Catalogadas ({filteredSpecies.length})
            </span>
            <span className="text-[10px] font-mono text-slate-400">Clique para selecionar</span>
          </div>

          <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredSpecies.length === 0 ? (
              <div className="text-center py-10 px-4 text-slate-400">
                <Bug className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-bold">Nenhuma espécie encontrada com esses filtros.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedType('all');
                    setSelectedHostFilter('all');
                    setShowOnlyWithRealImages(false);
                  }}
                  className="mt-2 text-xs text-emerald-600 font-black hover:underline cursor-pointer"
                >
                  Resetar busca
                </button>
              </div>
            ) : (
              filteredSpecies.map(s => {
                const isActive = s.id === selectedId;
                const badge = getAnatomyBadge(s.anatomyType);
                const sMedia = getSpeciesPhotos(s.id, s.anatomyType || 'vermiform');
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSelect(s.id)}
                    className={`w-full text-left p-2 rounded-xl transition-all cursor-pointer border flex items-center gap-3 ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-600 shadow-xs ring-1 ring-emerald-500/30'
                        : 'bg-slate-50/70 hover:bg-slate-100 dark:bg-zinc-900/60 dark:hover:bg-zinc-900 border-slate-200/80 dark:border-zinc-800'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-black overflow-hidden shrink-0 border border-slate-300 dark:border-zinc-700 relative">
                      <OfflineImage
                        src={sMedia.micro}
                        speciesId={s.id}
                        anatomyType={s.anatomyType}
                        scientificName={s.scientificName}
                        viewType="microscope"
                        alt={s.scientificName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/10" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <strong className={`text-xs italic font-bold truncate ${isActive ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>
                          {s.scientificName}
                        </strong>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${badge.color}`}>
                          {badge.label.split('/')[0]}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 justify-between mt-0.5">
                        <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium truncate block flex-1">
                          {s.commonName}
                        </span>
                        {sMedia.micro !== '/placeholder_nematode.jpg' && (
                          <span className="text-[9px] font-black text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/50 px-1.5 py-0.5 rounded-md border border-purple-200 dark:border-purple-800 shrink-0 flex items-center gap-0.5" title="Fotos Reais de Microscopia & Campo">
                            <Camera className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
                            <span>REAL</span>
                          </span>
                        )}
                      </div>

                      {s.hosts && s.hosts.length > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                          <Tag className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{s.hosts.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* DETALHE E VISUALIZADOR PRINCIPAL */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header da Espécie Selecionada */}
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-black italic text-slate-900 dark:text-white tracking-tight">
                    {activeSpecie.scientificName}
                  </h3>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${currentBadge.color}`}>
                    {currentBadge.label}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-zinc-400 block mt-1">
                  {activeSpecie.commonName}
                </span>
                {activeSpecie.hosts && activeSpecie.hosts.length > 0 && (
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mt-1.5 flex items-center gap-1.5">
                    <Leaf className="w-3 h-3" />
                    <strong>Hospedeiros:</strong> {activeSpecie.hosts.join(', ')}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBankViewMode('comparator')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold transition-all cursor-pointer border border-blue-200 dark:border-blue-800"
                  title="Comparar esta espécie lado a lado no diagnóstico diferencial"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Comparar Lado a Lado</span>
                </button>
                <button
                  onClick={() => setIsFullscreenModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 rounded-lg text-xs font-bold transition-all cursor-pointer border border-slate-200 dark:border-zinc-700"
                  title="Expandir Foto em Tela Cheia para Análise Laboratorial"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Expandir HD</span>
                </button>
              </div>
            </div>

            {/* ========================================================= */}
            {/* VISUALIZADOR MULTIMODAL COM ZOOM INTERATIVO & LUPA        */}
            {/* ========================================================= */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-900 grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Image & Microscope Stage Container */}
              <div className="md:col-span-7 flex flex-col items-center">
                {/* Mode Selector Tabs */}
                <div className="flex w-full gap-1 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl text-[10px] font-bold border border-slate-200 dark:border-zinc-800 mb-3">
                  <button
                    onClick={() => { setViewerMode('photo_micro'); setZoomLevel(1.0); }}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                      viewerMode === 'photo_micro'
                        ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-xs font-black'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                    }`}
                  >
                    <FlaskConical className="w-3 h-3" /> Micrografia Real
                  </button>
                  <button
                    onClick={() => { setViewerMode('photo_field'); setZoomLevel(1.0); }}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                      viewerMode === 'photo_field'
                        ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-xs font-black'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                    }`}
                  >
                    <Leaf className="w-3 h-3" /> Dano Real (Campo)
                  </button>
                  <button
                    onClick={() => { setViewerMode('svg'); setZoomLevel(1.0); }}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                      viewerMode === 'svg'
                        ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-xs font-black'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3 h-3" /> Atlas Vetorial
                  </button>
                </div>

                {/* Stage Viewport with Interactive Zoom & Magnifier */}
                <div
                  ref={imageContainerRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  className="relative w-full aspect-square max-w-[340px] rounded-2xl bg-stone-950 border-4 border-slate-300 dark:border-zinc-700 overflow-hidden shadow-inner flex items-center justify-center group select-none"
                >
                  {/* Microscope Reticle for Micro and SVG */}
                  {viewerMode !== 'photo_field' && (
                    <>
                      <div className="absolute inset-0 border border-white/10 pointer-events-none rounded-full z-10 m-2" />
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/10 pointer-events-none z-10" />
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 pointer-events-none z-10" />
                    </>
                  )}

                  {/* Scale Bar */}
                  <div className="absolute bottom-3 left-3 bg-black/75 px-2.5 py-1 rounded-md text-[9px] font-mono text-white pointer-events-none z-20 flex items-center gap-1.5 border border-white/10">
                    <span className="w-6 h-0.5 bg-emerald-400 inline-block"></span>
                    <span>
                      {zoomLevel >= 3.0 ? '15 µm' : zoomLevel >= 2.0 ? '40 µm' : '100 µm'}
                    </span>
                    <span className="text-[8px] opacity-75 font-sans">({zoomLevel.toFixed(1)}x)</span>
                  </div>

                  {/* REAL MICROGRAPH VIEW */}
                  {viewerMode === 'photo_micro' && (
                    <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
                      <OfflineImage
                        src={photos.micro}
                        speciesId={activeSpecie.id}
                        anatomyType={activeSpecie.anatomyType}
                        scientificName={activeSpecie.scientificName}
                        viewType="microscope"
                        alt={`Micrografia de ${activeSpecie.scientificName}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-200"
                        style={{
                          transform: `scale(${zoomLevel})`,
                          ...getFilterStyle()
                        }}
                      />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_50%,_rgba(0,0,0,0.65)_100%)] pointer-events-none z-10" />
                    </div>
                  )}

                  {/* REAL FIELD DAMAGE VIEW */}
                  {viewerMode === 'photo_field' && (
                    <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-stone-900">
                      <OfflineImage
                        src={photos.field}
                        speciesId={activeSpecie.id}
                        anatomyType={activeSpecie.anatomyType}
                        scientificName={activeSpecie.scientificName}
                        viewType="field"
                        alt={`Sintoma de campo de ${activeSpecie.scientificName}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-200"
                        style={{ transform: `scale(${zoomLevel})` }}
                      />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_65%,_rgba(0,0,0,0.45)_100%)] pointer-events-none z-10" />
                    </div>
                  )}

                  {/* VECTOR SVG ATLAS VIEW */}
                  {viewerMode === 'svg' && (
                    <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
                      <svg
                        viewBox="0 0 200 200"
                        className="w-4/5 h-4/5 select-none transition-transform duration-300"
                        style={{ transform: `scale(${zoomLevel})` }}
                      >
                        {activeSpecie.anatomyType === 'globose' && (
                          <g className="animate-pulse">
                            <path d="M 100 120 C 50 140, 40 80, 80 50 C 90 40, 100 20, 100 10 C 100 20, 110 40, 120 50 C 160 80, 150 140, 100 120 Z" fill="rgba(52, 211, 153, 0.2)" stroke="#34d399" strokeWidth="2.5" />
                            <line x1="100" y1="10" x2="100" y2="28" stroke="#34d399" strokeWidth="2" />
                            <circle cx="100" cy="28" r="2" fill="#34d399" />
                          </g>
                        )}
                        {activeSpecie.anatomyType === 'cyst' && (
                          <g>
                            <path d="M 100 140 C 55 130, 45 70, 100 40 C 100 30, 100 30, 100 20 C 100 30, 100 30, 100 40 C 155 70, 145 130, 100 140 Z" fill="rgba(251, 191, 36, 0.2)" stroke="#fbbf24" strokeWidth="3" />
                          </g>
                        )}
                        {activeSpecie.anatomyType === 'reniform' && (
                          <g>
                            <path d="M 50 100 Q 80 40, 130 50 C 170 60, 180 120, 130 140 C 90 150, 70 120, 50 100 Z" fill="rgba(249, 115, 22, 0.2)" stroke="#f97316" strokeWidth="2.5" />
                          </g>
                        )}
                        {activeSpecie.anatomyType === 'dagger' && (
                          <g>
                            <path d="M 20 20 Q 80 30, 90 90 T 180 180 Q 120 120, 80 70 T 20 20 Z" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="1.5" />
                            <line x1="22" y1="20" x2="60" y2="35" stroke="#ef4444" strokeWidth="2" />
                          </g>
                        )}
                        {activeSpecie.anatomyType === 'spiral' && (
                          <g>
                            <path d="M 100 50 C 150 50, 150 150, 100 150 C 50 150, 50 80, 80 80 C 110 80, 120 120, 100 120 C 90 120, 85 100, 95 100" fill="rgba(168, 85, 247, 0.2)" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" />
                          </g>
                        )}
                        {(!activeSpecie.anatomyType || activeSpecie.anatomyType === 'vermiform' || activeSpecie.anatomyType === 'sheath' || activeSpecie.anatomyType === 'pin') && (
                          <g>
                            <path d="M 30 50 Q 80 40, 120 80 T 170 150 Q 140 140, 110 110 T 30 50 Z" fill="rgba(59, 130, 246, 0.2)" stroke="#60a5fa" strokeWidth="2" />
                            <line x1="33" y1="48" x2="47" y2="52" stroke="#60a5fa" strokeWidth="1.8" />
                          </g>
                        )}
                      </svg>
                      {/* Hotspots */}
                      <button
                        onClick={() => setSelectedHotspot(selectedHotspot === 'stylet' ? null : 'stylet')}
                        className="absolute top-[28%] left-[30%] w-3 h-3 bg-red-500 rounded-full animate-ping cursor-pointer z-20"
                        title="Estilete"
                      />
                      <button
                        onClick={() => setSelectedHotspot(selectedHotspot === 'esoph' ? null : 'esoph')}
                        className="absolute top-[48%] left-[45%] w-3 h-3 bg-blue-500 rounded-full animate-ping cursor-pointer z-20"
                        title="Esôfago"
                      />
                    </div>
                  )}

                  {/* LUPA INTERATIVA / MAGNIFIER LENS */}
                  {isMagnifierActive && showMagnifier && viewerMode !== 'svg' && (
                    <div
                      className="absolute w-32 h-32 rounded-full border-2 border-white shadow-2xl pointer-events-none z-30 overflow-hidden bg-black"
                      style={{
                        left: `${magnifierPos.x - 64}px`,
                        top: `${magnifierPos.y - 64}px`,
                      }}
                    >
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundImage: `url(${cachedViewerImage})`,
                          backgroundPosition: `${magnifierPos.relX}% ${magnifierPos.relY}%`,
                          backgroundSize: `${(zoomLevel * 300)}%`,
                          backgroundRepeat: 'no-repeat',
                          ...getFilterStyle()
                        }}
                      />
                      <div className="absolute inset-0 border border-emerald-400/50 rounded-full pointer-events-none" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full pointer-events-none" />
                    </div>
                  )}
                </div>

                {/* SLIDER DE ZOOM & CONTROLES DE LENTE */}
                <div className="w-full mt-3 bg-slate-50 dark:bg-zinc-900/80 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-300">
                    <span className="flex items-center gap-1">
                      <ZoomIn className="w-3.5 h-3.5 text-emerald-600" /> Zoom da Imagem:
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">
                      {(zoomLevel * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setZoomLevel(prev => Math.max(1.0, +(prev - 0.25).toFixed(2)))}
                      disabled={zoomLevel <= 1.0}
                      className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border text-slate-700 dark:text-zinc-300 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                      title="Diminuir Zoom"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>

                    <input
                      type="range"
                      min="1.0"
                      max="3.5"
                      step="0.1"
                      value={zoomLevel}
                      onChange={e => setZoomLevel(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg"
                    />

                    <button
                      onClick={() => setZoomLevel(prev => Math.min(3.5, +(prev + 0.25).toFixed(2)))}
                      disabled={zoomLevel >= 3.5}
                      className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border text-slate-700 dark:text-zinc-300 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                      title="Aumentar Zoom"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setZoomLevel(1.0)}
                      className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border text-slate-700 dark:text-zinc-300 hover:bg-slate-100 cursor-pointer text-[10px] font-bold"
                      title="Resetar Zoom para 1.0x"
                    >
                      1.0x
                    </button>
                  </div>

                  {/* Lupa & Contraste Selector */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200 dark:border-zinc-800">
                    <button
                      onClick={() => setIsMagnifierActive(!isMagnifierActive)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        isMagnifierActive
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      <Crosshair className="w-3 h-3" />
                      <span>{isMagnifierActive ? 'Lupa Ativa (Passe o mouse)' : 'Ativar Lupa Óptica'}</span>
                    </button>

                    {viewerMode === 'photo_micro' && (
                      <div className="flex gap-1 shrink-0">
                        {(['light', 'phase', 'fuchsin'] as const).map(c => (
                          <button
                            key={c}
                            onClick={() => setMicroContrast(c)}
                            className={`px-2 py-1 text-[9px] font-bold rounded border cursor-pointer ${
                              microContrast === c
                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-black'
                                : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                            }`}
                          >
                            {c === 'light' ? 'Claro' : c === 'phase' ? 'Azul' : 'Fucsina'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Scientific Caption & Diagnostic Markers */}
                <div className="w-full mt-3 bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
                  {viewerMode === 'photo_micro' && (
                    <>
                      <div className="flex items-center justify-between gap-2 flex-wrap pb-1.5 border-b border-slate-200 dark:border-zinc-800">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
                          <Microscope className="w-3 h-3" />
                          <span>Aumento: {photos.magnification}</span>
                          <span className="opacity-60">•</span>
                          <span>{photos.staining}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                          {photos.microCredit}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 dark:text-zinc-300 font-medium leading-relaxed">
                        <strong>Micrografia:</strong> {photos.microDesc}
                      </p>
                      {photos.microMarkers && photos.microMarkers.length > 0 && (
                        <div className="pt-1.5 border-t border-slate-200/80 dark:border-zinc-800/80">
                          <span className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 block mb-1">
                            Marcadores Anatômicos Observáveis:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {photos.microMarkers.map((m, idx) => (
                              <span key={idx} className="text-[10px] font-semibold bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-700 flex items-center gap-1">
                                <Check className="w-2.5 h-2.5 text-emerald-500" />
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {viewerMode === 'photo_field' && (
                    <>
                      <div className="flex items-center justify-between gap-2 flex-wrap pb-1.5 border-b border-slate-200 dark:border-zinc-800">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-700 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800">
                          <Leaf className="w-3 h-3" />
                          <span>{photos.symptomTitle}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800">
                            Severidade: {photos.severityScore}/5
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                            {photos.fieldCredit}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-700 dark:text-zinc-300 font-medium leading-relaxed">
                        <strong>Dano em Campo:</strong> {photos.fieldDesc}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-zinc-400 font-semibold">
                        <span className="text-slate-400">Órgão Afetado:</span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border">
                          {photos.organ}
                        </span>
                      </div>
                      {photos.fieldMarkers && photos.fieldMarkers.length > 0 && (
                        <div className="pt-1.5 border-t border-slate-200/80 dark:border-zinc-800/80">
                          <span className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 block mb-1">
                            Sintomatologia Primária & Secundária:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {photos.fieldMarkers.map((m, idx) => (
                              <span key={idx} className="text-[10px] font-semibold bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-700 flex items-center gap-1">
                                <Check className="w-2.5 h-2.5 text-amber-500" />
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {viewerMode === 'svg' && (
                    <div className="text-center py-1">
                      <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium">
                        🧬 <strong>Esquema Técnico Vetorial:</strong> Diagrama morfológico com pontos interativos para visualização da anatomia do estilete, bulbo esofagiano e glândulas ventrais.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Description Pane */}
              <div className="md:col-span-5 space-y-3 text-xs">
                <div className="bg-slate-50 dark:bg-zinc-900/80 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2.5">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 block">
                      Etiologia & Biologia
                    </span>
                    <p className="text-slate-700 dark:text-zinc-300 font-medium leading-relaxed mt-0.5">
                      {activeSpecie.etiology || activeSpecie.morphology}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 block">
                      Diagnóstico Fitopatológico
                    </span>
                    <p className="text-slate-700 dark:text-zinc-300 font-medium leading-relaxed mt-0.5">
                      {activeSpecie.identification || activeSpecie.identificationMethods}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 block">
                      Sintomas na Lavoura
                    </span>
                    <p className="text-slate-700 dark:text-zinc-300 font-medium leading-relaxed mt-0.5">
                      {activeSpecie.symptoms}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] font-black uppercase text-red-500 block">
                      Limiar de Dano Econômico
                    </span>
                    <p className="text-red-600 dark:text-red-400 font-bold leading-relaxed mt-0.5">
                      {activeSpecie.economicDamage}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* PLANO DE MANEJO INTEGRADO (MIP) EM ABAS                    */}
          {/* ========================================================= */}
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Plano de Manejo Integrado de Nematoides (MIP)
              </h4>
              <span className="text-[10px] font-bold text-slate-400">Diretrizes Agronômicas</span>
            </div>

            <div className="flex border-b font-bold bg-slate-50 dark:bg-zinc-900/60 rounded-xl p-1 gap-1">
              <button
                onClick={() => setActiveManejoTab('cultural')}
                className={`flex-1 text-center py-2 rounded-lg text-xs cursor-pointer transition-all ${
                  activeManejoTab === 'cultural'
                    ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 font-black shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🌱 Cultural & Rotação
              </button>
              <button
                onClick={() => setActiveManejoTab('quimico')}
                className={`flex-1 text-center py-2 rounded-lg text-xs cursor-pointer transition-all ${
                  activeManejoTab === 'quimico'
                    ? 'bg-white dark:bg-zinc-800 text-blue-700 dark:text-blue-400 font-black shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🧪 Químico & Biológico
              </button>
              <button
                onClick={() => setActiveManejoTab('fisico')}
                className={`flex-1 text-center py-2 rounded-lg text-xs cursor-pointer transition-all ${
                  activeManejoTab === 'fisico'
                    ? 'bg-white dark:bg-zinc-800 text-amber-700 dark:text-amber-400 font-black shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ☀️ Físico & Sanitário
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-zinc-900/40 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 text-xs">
              {activeManejoTab === 'cultural' && (
                <div className="space-y-2">
                  <strong className="text-emerald-700 dark:text-emerald-400 block font-black">
                    Controle Cultural, Rotação e Plantas Antagônicas:
                  </strong>
                  <p className="text-slate-700 dark:text-zinc-300 font-medium leading-relaxed">
                    {activeSpecie.culturalControl || activeSpecie.managementStrategies}
                  </p>
                </div>
              )}
              {activeManejoTab === 'quimico' && (
                <div className="space-y-2">
                  <strong className="text-blue-700 dark:text-blue-400 block font-black">
                    Nematicidas Químicos, Tratamento de Sementes & Bionematicidas:
                  </strong>
                  <p className="text-slate-700 dark:text-zinc-300 font-medium leading-relaxed">
                    {activeSpecie.chemicalControl ||
                      'Tratamento de sementes com ingredientes ativos de choque (Fluopiram, Abamectina) consorciado com bionematicidas microbiológicos (Bacillus subtilis, Bacillus methylotrophicus e fungos nematófagos como Purpureocillium lilacinum).'}
                  </p>
                </div>
              )}
              {activeManejoTab === 'fisico' && (
                <div className="space-y-2">
                  <strong className="text-amber-700 dark:text-amber-400 block font-black">
                    Métodos Físicos, Solarização e Higienização:
                  </strong>
                  <p className="text-slate-700 dark:text-zinc-300 font-medium leading-relaxed">
                    {activeSpecie.physicalControl ||
                      'Alqueive do solo sob radiação solar direta no período de entressafra seco, destruição mecânica e incorporação dos restos radiculares infectados pós-colheita, e desinfecção minuciosa dos rodados e implementos agrícolas com jatos d’água sob pressão antes da troca de talhões.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ========================================================= */}
      {/* MODAL FULLSCREEN / LIGHTBOX DE ALTA RESOLUÇÃO COM ZOOM     */}
      {/* ========================================================= */}
      {isFullscreenModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col max-h-[92vh] shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-950 rounded-lg text-emerald-400 border border-emerald-800">
                  <Bug className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black italic text-white text-base">
                    {activeSpecie.scientificName}
                  </h3>
                  <span className="text-xs text-zinc-400">
                    {viewerMode === 'photo_micro' ? 'Micrografia Laboratorial HD' : 'Foto Real de Campo HD'}
                  </span>
                </div>
              </div>

              {/* Modal Zoom Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFullscreenZoom(prev => Math.max(1.0, +(prev - 0.5).toFixed(1)))}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold border border-zinc-700 cursor-pointer"
                  title="Diminuir Zoom"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-mono text-xs text-emerald-400 font-bold px-2">
                  {(fullscreenZoom * 100).toFixed(0)}%
                </span>
                <button
                  onClick={() => setFullscreenZoom(prev => Math.min(5.0, +(prev + 0.5).toFixed(1)))}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold border border-zinc-700 cursor-pointer"
                  title="Aumentar Zoom"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setFullscreenZoom(1.0)}
                  className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold border border-zinc-700 cursor-pointer"
                >
                  1.0x
                </button>
                <button
                  onClick={() => setIsFullscreenModal(false)}
                  className="p-2 bg-red-950/80 hover:bg-red-900 text-red-300 rounded-lg text-xs font-bold border border-red-800 ml-2 cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Image Viewport */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black min-h-[400px]">
              <OfflineImage
                src={viewerMode === 'photo_micro' ? photos.micro : photos.field}
                speciesId={activeSpecie.id}
                anatomyType={activeSpecie.anatomyType}
                scientificName={activeSpecie.scientificName}
                viewType={viewerMode === 'photo_micro' ? 'microscope' : 'field'}
                alt={activeSpecie.scientificName}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] object-contain transition-transform duration-200 select-none"
                style={{
                  transform: `scale(${fullscreenZoom})`,
                  ...(viewerMode === 'photo_micro' ? getFilterStyle() : {})
                }}
              />
            </div>

            {/* Modal Footer Description */}
            <div className="p-3 bg-zinc-900/90 border-t border-zinc-800 text-xs text-zinc-300 text-center font-medium">
              {viewerMode === 'photo_micro' ? photos.microDesc : photos.fieldDesc}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NematodeSpeciesBank;
