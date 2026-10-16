import React, { useState, useMemo, useEffect } from 'react';
import {
  Bug,
  Search,
  Filter,
  ShieldCheck,
  Camera,
  Maximize2,
  X,
  AlertTriangle,
  Leaf,
  CheckCircle2,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Download,
  WifiOff,
  Layers,
  Sprout,
  Activity,
  FlaskConical,
  BookOpen,
  RefreshCw,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import { NurseryPestDiseaseLibraryItem, NurseryCrop } from '../types/nursery';
import { nurseryPestsDiseasesLibraryData } from '../data/nurseryPestsDiseasesLibraryData';
import { nurseryCropsCatalog } from '../data/nurseryData';
import { NurseryCropPhytoDetailModal } from './NurseryCropPhytoDetailModal';

interface NurseryPestsDiseasesLibraryProps {
  onNavigateToDiagnostic?: () => void;
}

export const NurseryPestsDiseasesLibrary: React.FC<NurseryPestsDiseasesLibraryProps> = ({
  onNavigateToDiagnostic
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'todos' | 'fungo_oomiceto' | 'bacteria' | 'virus' | 'praga_inseto' | 'acaro' | 'nematoide'>('todos');
  const [organFilter, setOrganFilter] = useState<'todos' | 'colo_raiz' | 'folhas_cotiledones' | 'caule_haste' | 'toda_planta'>('todos');
  const [cropFilter, setCropFilter] = useState<string>('todos');
  const [severityFilter, setSeverityFilter] = useState<'todos' | 'critica' | 'alta' | 'moderada'>('todos');
  
  // Expanded Card State
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Active Photo Swapper per item
  const [activePhotoMap, setActivePhotoMap] = useState<Record<string, number>>({});

  // Image load error tracker
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});

  // Offline caching state
  const [isCachingOffline, setIsCachingOffline] = useState(false);
  const [cachingProgress, setCachingProgress] = useState<number | null>(null);
  const [isCachedOffline, setIsCachedOffline] = useState(false);

  // Fullscreen Lightbox
  const [lightboxPhoto, setLightboxPhoto] = useState<{
    url: string;
    title: string;
    caption: string;
    scientificName: string;
    tag: string;
  } | null>(null);

  // Phyto Crop Detail Modal & Crop Picker State
  const [selectedPhytoCrop, setSelectedPhytoCrop] = useState<NurseryCrop | null>(null);
  const [isCropPickerOpen, setIsCropPickerOpen] = useState(false);
  const [cropPickerSearch, setCropPickerSearch] = useState('');

  // Extract all photo URLs
  const allLibraryPhotoUrls = useMemo(() => {
    const urls: string[] = [];
    nurseryPestsDiseasesLibraryData.forEach(item => {
      if (item.realPhotoUrl) urls.push(item.realPhotoUrl);
      if (item.secondaryPhotoUrl) urls.push(item.secondaryPhotoUrl);
    });
    return Array.from(new Set(urls));
  }, []);

  // Precache all library photos for 100% offline usage on mount or by button
  const handlePrecachePhotos = async (manual: boolean = false) => {
    if (typeof window === 'undefined' || !('caches' in window)) return;
    try {
      if (manual) setIsCachingOffline(true);
      const cache = await caches.open('geaagro-cache-v13');
      let cachedCount = 0;
      
      for (let i = 0; i < allLibraryPhotoUrls.length; i++) {
        const url = allLibraryPhotoUrls[i];
        try {
          const match = await cache.match(url);
          if (!match) {
            const resp = await fetch(url);
            if (resp.ok) {
              await cache.put(url, resp);
            }
          }
          cachedCount++;
          if (manual) {
            setCachingProgress(Math.round((cachedCount / allLibraryPhotoUrls.length) * 100));
          }
        } catch {
          // Ignore individual fetch failure in offline mode
        }
      }
      setIsCachedOffline(true);
    } catch (e) {
      console.warn('Error precaching nursery library photos:', e);
    } finally {
      if (manual) {
        setTimeout(() => {
          setIsCachingOffline(false);
          setCachingProgress(null);
        }, 800);
      }
    }
  };

  useEffect(() => {
    // Run silent background precache on mount
    handlePrecachePhotos(false);
  }, []);

  // Extract all unique crops from catalog
  const availableCrops = useMemo(() => {
    const cropsSet = new Set<string>();
    nurseryPestsDiseasesLibraryData.forEach(item => {
      item.affectedCrops.forEach(c => cropsSet.add(c));
    });
    return Array.from(cropsSet).sort();
  }, []);

  // Filtered List
  const filteredItems = useMemo(() => {
    return nurseryPestsDiseasesLibraryData.filter(item => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.symptomsDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.chemicalControl.some(c => c.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.biologicalControl.some(b => b.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.organicControl && item.organicControl.some(o => o.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (item.physicalControl && item.physicalControl.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        item.affectedCrops.some(ac => ac.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory =
        categoryFilter === 'todos' ||
        (categoryFilter === 'fungo_oomiceto' && (item.category === 'fungo' || item.category === 'oomiceto')) ||
        (categoryFilter === 'bacteria' && item.category === 'bacteria') ||
        (categoryFilter === 'virus' && item.category === 'virus') ||
        (categoryFilter === 'praga_inseto' && item.category === 'praga_inseto') ||
        (categoryFilter === 'acaro' && item.category === 'acaro') ||
        (categoryFilter === 'nematoide' && item.category === 'nematoide');

      const matchOrgan = organFilter === 'todos' || item.plantPart === organFilter;

      const matchCrop = cropFilter === 'todos' || item.affectedCrops.includes(cropFilter);

      const matchSeverity = severityFilter === 'todos' || item.damageSeverity === severityFilter;

      return matchSearch && matchCategory && matchOrgan && matchCrop && matchSeverity;
    });
  }, [searchTerm, categoryFilter, organFilter, cropFilter, severityFilter]);

  // Find matching full crop data if a crop is filtered
  const matchedCrop = useMemo(() => {
    if (cropFilter === 'todos') return null;
    return nurseryCropsCatalog.find(
      c => c.name.toLowerCase() === cropFilter.toLowerCase() ||
        cropFilter.toLowerCase().includes(c.name.toLowerCase()) ||
        c.name.toLowerCase().includes(cropFilter.toLowerCase())
    );
  }, [cropFilter]);

  // Filtered crops for crop picker modal
  const filteredPickerCrops = useMemo(() => {
    const q = cropPickerSearch.toLowerCase();
    if (!q) return nurseryCropsCatalog;
    return nurseryCropsCatalog.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.scientificName.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.cultivars.some(cv => cv.toLowerCase().includes(q))
    );
  }, [cropPickerSearch]);

  const toggleExpand = (id: string) => {
    setExpandedCardId(prev => (prev === id ? null : id));
  };

  const setPhotoIndex = (itemId: string, index: number) => {
    setActivePhotoMap(prev => ({ ...prev, [itemId]: index }));
  };

  const handleImageError = (photoKey: string) => {
    setImageErrorMap(prev => ({ ...prev, [photoKey]: true }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Atlas Fitossanitário de Viveiro
              </span>
              <span className="text-[10px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                <WifiOff className="w-3 h-3" />
                100% Offline & Fotos Reais Locais
              </span>
              <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <FlaskConical className="w-3 h-3" />
                {nurseryCropsCatalog.length} Culturas com Princípios Ativos
              </span>
              {isCachedOffline && (
                <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {allLibraryPhotoUrls.length} Fotos em Cache Offline
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Bug className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              Biblioteca Técnica de Pragas & Doenças em Mudas
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
              Catálogo agronômico visual com fotografias reais de campo abrangendo {availableCrops.length} culturas agrícolas e florestais. Dados técnicos completos com epidemiologia e quadros de controle <strong>Biológico, Químico (Princípios Ativos IRAC/FRAC), Orgânico e Físico/Mecânico</strong> disponíveis 100% sem necessidade de internet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <button
              onClick={() => handlePrecachePhotos(true)}
              disabled={isCachingOffline}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
              title="Armazenar todas as fotos no dispositivo para uso sem conexão"
            >
              {isCachingOffline ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                  <span>Sincronizando Fotos ({cachingProgress ?? 0}%)</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Garantir Fotos Offline</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsCropPickerOpen(true)}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <ShieldCheck className="w-4 h-4 text-teal-200" />
              Guia MIP por Cultura ({nurseryCropsCatalog.length})
            </button>

            {onNavigateToDiagnostic && (
              <button
                onClick={onNavigateToDiagnostic}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer whitespace-nowrap"
              >
                <Activity className="w-4 h-4" />
                Diagnóstico Visual
              </button>
            )}
          </div>
        </div>

        {/* Filters & Search Control */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por praga, doença, sintoma, cultura, biocontrole, orgânico, físico ou químico..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Select Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              {/* Organ */}
              <select
                value={organFilter}
                onChange={e => setOrganFilter(e.target.value as any)}
                className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 focus:outline-none"
              >
                <option value="todos">Todos os Órgãos Afetados</option>
                <option value="colo_raiz">🌱 Colo & Raiz</option>
                <option value="folhas_cotiledones">🍃 Folhas & Cotilédones</option>
                <option value="caule_haste">🎋 Caule & Haste</option>
                <option value="toda_planta">🌿 Toda a Planta / Ápice</option>
              </select>

              {/* Crop */}
              <select
                value={cropFilter}
                onChange={e => setCropFilter(e.target.value)}
                className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 focus:outline-none"
              >
                <option value="todos">Todas as {availableCrops.length} Culturas</option>
                {availableCrops.map(crop => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}
              </select>

              {/* Severity */}
              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value as any)}
                className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 focus:outline-none"
              >
                <option value="todos">Todas as Severidades</option>
                <option value="critica">🔴 Severidade Crítica</option>
                <option value="alta">🟠 Severidade Alta</option>
                <option value="moderada">🟡 Severidade Moderada</option>
              </select>

              {/* Matched Crop Quick Action */}
              {matchedCrop && (
                <button
                  type="button"
                  onClick={() => setSelectedPhytoCrop(matchedCrop)}
                  className="bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <FlaskConical className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Ver Princípios Ativos de {matchedCrop.name} ({(matchedCrop.detailedPestsAndDiseases || []).length})
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 items-center">
            {[
              { id: 'todos', label: 'Todos os Agentes', count: nurseryPestsDiseasesLibraryData.length },
              {
                id: 'fungo_oomiceto',
                label: '🍄 Fungos & Oomicetos',
                count: nurseryPestsDiseasesLibraryData.filter(d => d.category === 'fungo' || d.category === 'oomiceto').length
              },
              {
                id: 'bacteria',
                label: '🦠 Bacterioses',
                count: nurseryPestsDiseasesLibraryData.filter(d => d.category === 'bacteria').length
              },
              {
                id: 'virus',
                label: '🧬 Viroses',
                count: nurseryPestsDiseasesLibraryData.filter(d => d.category === 'virus').length
              },
              {
                id: 'praga_inseto',
                label: '🐛 Insetos & Larvas',
                count: nurseryPestsDiseasesLibraryData.filter(d => d.category === 'praga_inseto').length
              },
              {
                id: 'acaro',
                label: '🕷️ Ácaros',
                count: nurseryPestsDiseasesLibraryData.filter(d => d.category === 'acaro').length
              },
              {
                id: 'nematoide',
                label: '🪱 Nematoides',
                count: nurseryPestsDiseasesLibraryData.filter(d => d.category === 'nematoide').length
              }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id as any)}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Pests & Diseases */}
      {filteredItems.length === 0 ? (
        <div className="py-12 text-center bg-white dark:bg-black rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3">
          <Bug className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">
            Nenhuma praga ou doença encontrada com os filtros selecionados
          </h4>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Tente redefinir os termos de busca ou mudar a categoria de agente fitossanitário.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('todos');
              setOrganFilter('todos');
              setCropFilter('todos');
              setSeverityFilter('todos');
            }}
            className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
          >
            Limpar todos os filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredItems.map(item => {
            const currentPhotoIdx = activePhotoMap[item.id] || 0;
            const currentPhoto = currentPhotoIdx === 1 && item.secondaryPhotoUrl
              ? {
                  url: item.secondaryPhotoUrl,
                  tag: item.secondaryPhotoTag || 'Foto Detalhe',
                  caption: item.secondaryPhotoCaption || item.photoCaption
                }
              : {
                  url: item.realPhotoUrl,
                  tag: item.photoTag,
                  caption: item.photoCaption
                };

            const isExpanded = expandedCardId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs hover:border-emerald-500/80 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Real Photo Atlas Card Header */}
                  <div className="relative group bg-slate-950 aspect-16/9 overflow-hidden flex items-center justify-center">
                    {imageErrorMap[currentPhoto.url] ? (
                      <div className="w-full h-full bg-linear-to-br from-slate-900 via-zinc-900 to-emerald-950 p-4 flex flex-col justify-between text-white">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-700/80 text-white px-2 py-0.5 rounded-md">
                            {currentPhoto.tag}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-md">
                            <WifiOff className="w-3 h-3" />
                            Modo Offline
                          </span>
                        </div>
                        <div className="text-center py-2 space-y-1">
                          <div className="w-10 h-10 mx-auto rounded-full bg-emerald-900/50 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                            {item.category === 'nematoide' ? (
                              <Activity className="w-5 h-5" />
                            ) : item.category === 'praga_inseto' || item.category === 'acaro' ? (
                              <Bug className="w-5 h-5" />
                            ) : (
                              <Leaf className="w-5 h-5" />
                            )}
                          </div>
                          <p className="text-xs font-bold text-slate-200">{item.name}</p>
                          <p className="text-[10px] text-slate-400 italic">{item.scientificName}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageErrorMap(prev => ({ ...prev, [currentPhoto.url]: false }));
                          }}
                          className="self-center text-[10px] font-bold text-emerald-300 hover:text-emerald-100 flex items-center gap-1 bg-black/50 px-2 py-1 rounded cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Recarregar Foto
                        </button>
                      </div>
                    ) : (
                      <img
                        src={currentPhoto.url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 cursor-pointer"
                        onError={() => handleImageError(currentPhoto.url)}
                        onClick={() =>
                          setLightboxPhoto({
                            url: currentPhoto.url,
                            title: item.name,
                            caption: currentPhoto.caption,
                            scientificName: item.scientificName,
                            tag: currentPhoto.tag
                          })
                        }
                        referrerPolicy="no-referrer"
                      />
                    )}

                    {/* Gradient overlay */}
                    {!imageErrorMap[currentPhoto.url] && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                    )}

                    {/* Top Badges */}
                    {!imageErrorMap[currentPhoto.url] && (
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-md shadow-xs">
                            {currentPhoto.tag}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md text-white shadow-xs ${
                              item.damageSeverity === 'critica'
                                ? 'bg-rose-600'
                                : item.damageSeverity === 'alta'
                                ? 'bg-amber-600'
                                : 'bg-yellow-600 text-black'
                            }`}
                          >
                            Dano {item.damageSeverity}
                          </span>
                        </div>

                        <button
                          onClick={() =>
                            setLightboxPhoto({
                              url: currentPhoto.url,
                              title: item.name,
                              caption: currentPhoto.caption,
                              scientificName: item.scientificName,
                              tag: currentPhoto.tag
                            })
                          }
                          className="p-1.5 bg-black/60 backdrop-blur-xs hover:bg-black/80 rounded-lg text-white text-xs transition-colors cursor-pointer flex items-center gap-1"
                          title="Ampliar fotografia"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Bottom Info on Photo */}
                    {!imageErrorMap[currentPhoto.url] && (
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h4 className="text-base sm:text-lg font-bold text-white leading-snug drop-shadow-md">
                          {item.name}
                        </h4>
                        <p className="text-xs italic text-emerald-300 font-medium">
                          {item.scientificName}
                        </p>
                      </div>
                    )}

                    {/* Photo Switcher Pill if secondary photo exists */}
                    {item.secondaryPhotoUrl && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 z-10">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setPhotoIndex(item.id, 0);
                          }}
                          className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md backdrop-blur-xs transition-all cursor-pointer ${
                            currentPhotoIdx === 0
                              ? 'bg-emerald-600 text-white'
                              : 'bg-black/60 text-slate-300 hover:bg-black/80'
                          }`}
                        >
                          Foto 1
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setPhotoIndex(item.id, 1);
                          }}
                          className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md backdrop-blur-xs transition-all cursor-pointer ${
                            currentPhotoIdx === 1
                              ? 'bg-emerald-600 text-white'
                              : 'bg-black/60 text-slate-300 hover:bg-black/80'
                          }`}
                        >
                          Foto 2
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Photo Caption Note */}
                  <div className="bg-slate-50 dark:bg-zinc-900/90 px-4 py-2 text-[11px] text-slate-700 dark:text-zinc-300 border-b border-slate-200 dark:border-zinc-800 flex items-start gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-emerald-700 dark:text-emerald-400">Diagnose de Campo:</strong>{' '}
                      {currentPhoto.caption}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* Tags & Affected Crops */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                          Órgão Afetado:
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[11px]">
                          {item.plantPart === 'colo_raiz'
                            ? '🌱 Colo & Raízes'
                            : item.plantPart === 'folhas_cotiledones'
                            ? '🍃 Folhas & Cotilédones'
                            : item.plantPart === 'caule_haste'
                            ? '🎋 Caule & Haste'
                            : '🌿 Toda a Planta'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                          Culturas Suscetíveis:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {item.affectedCrops.map((c, i) => (
                            <span
                              key={i}
                              className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 text-[10px] font-bold px-2 py-0.5 rounded"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Symptoms Description */}
                    <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1.5">
                      <span className="font-bold text-slate-900 dark:text-zinc-100 text-xs flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        Sintomatologia Visual nas Mudas:
                      </span>
                      <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                        {item.symptomsDescription}
                      </p>
                    </div>

                    {/* Favorable Conditions */}
                    <div className="text-xs space-y-1">
                      <strong className="text-slate-900 dark:text-zinc-100 block text-[11px] uppercase tracking-wider">
                        Condições Climáticas Favoráveis em Estufa:
                      </strong>
                      <p className="text-slate-600 dark:text-zinc-400 italic bg-amber-50/60 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/50 text-[11px]">
                        {item.favorableConditions}
                      </p>
                    </div>

                    {/* Collapsible Technical Sheet */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-3.5 animate-fade-in text-xs">
                        {/* Preventive Management */}
                        <div className="space-y-1.5">
                          <strong className="text-emerald-700 dark:text-emerald-400 font-bold block flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Manejo Preventivo & Sanidade:
                          </strong>
                          <ul className="space-y-1 text-slate-700 dark:text-zinc-300 pl-2">
                            {item.preventiveManagement.map((prev, pIdx) => (
                              <li key={pIdx} className="flex items-start gap-1.5 text-[11px]">
                                <span className="text-emerald-500 font-bold">•</span>
                                <span>{prev}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 4 Pillars of Control Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          {/* 1. Biological Control */}
                          <div className="space-y-1.5 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200/70 dark:border-emerald-900/50">
                            <strong className="text-emerald-800 dark:text-emerald-300 font-bold block flex items-center gap-1 text-[11px]">
                              <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                              Controle Biológico Prioritário:
                            </strong>
                            <ul className="space-y-1 text-slate-700 dark:text-zinc-300 pl-1">
                              {item.biologicalControl.map((bio, bIdx) => (
                                <li key={bIdx} className="flex items-start gap-1.5 text-[11px]">
                                  <span className="text-emerald-600 font-bold">✓</span>
                                  <span>{bio}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* 2. Chemical Control */}
                          <div className="space-y-1.5 bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-200/70 dark:border-blue-900/50">
                            <strong className="text-blue-800 dark:text-blue-300 font-bold block flex items-center gap-1 text-[11px]">
                              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                              Manejo Químico Integrado:
                            </strong>
                            <ul className="space-y-1 text-slate-700 dark:text-zinc-300 pl-1">
                              {item.chemicalControl.map((chem, cIdx) => (
                                <li key={cIdx} className="flex items-start gap-1.5 text-[11px]">
                                  <span className="text-blue-600 font-bold">•</span>
                                  <span>{chem}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* 3. Organic Control */}
                          <div className="space-y-1.5 bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200/70 dark:border-amber-900/50">
                            <strong className="text-amber-800 dark:text-amber-300 font-bold block flex items-center gap-1 text-[11px]">
                              <Leaf className="w-3.5 h-3.5 text-amber-600" />
                              Controle Orgânico & Alternativo:
                            </strong>
                            <ul className="space-y-1 text-slate-700 dark:text-zinc-300 pl-1">
                              {(item.organicControl || [
                                'Extratos botânicos (Alho, Neem, Própolis) para fortalecimento das barreiras foliares.',
                                'Biofertilizantes aerados ricos em silício e micro-organismos benéficos.'
                              ]).map((org, oIdx) => (
                                <li key={oIdx} className="flex items-start gap-1.5 text-[11px]">
                                  <span className="text-amber-600 font-bold">🍃</span>
                                  <span>{org}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* 4. Physical & Mechanical Control */}
                          <div className="space-y-1.5 bg-purple-50/50 dark:bg-purple-950/20 p-3 rounded-xl border border-purple-200/70 dark:border-purple-900/50">
                            <strong className="text-purple-800 dark:text-purple-300 font-bold block flex items-center gap-1 text-[11px]">
                              <Layers className="w-3.5 h-3.5 text-purple-600" />
                              Controle Físico & Mecânico:
                            </strong>
                            <ul className="space-y-1 text-slate-700 dark:text-zinc-300 pl-1">
                              {(item.physicalControl || [
                                'Esterilização e autoclavação de ferramentas, bandejas e substratos reutilizados.',
                                'Telas físicas de alta densidade e armadilhas cromotrópicas de captura.'
                              ]).map((phys, phyIdx) => (
                                <li key={phyIdx} className="flex items-start gap-1.5 text-[11px]">
                                  <span className="text-purple-600 font-bold">🛡️</span>
                                  <span>{phys}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-3 sm:px-5 bg-slate-50 dark:bg-zinc-900/80 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1 cursor-pointer py-1"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Ocultar Manejo Completo
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Ver Manejo Completo & Biocontrole
                      </>
                    )}
                  </button>

                  <button
                    onClick={() =>
                      setLightboxPhoto({
                        url: currentPhoto.url,
                        title: item.name,
                        caption: currentPhoto.caption,
                        scientificName: item.scientificName,
                        tag: currentPhoto.tag
                      })
                    }
                    className="text-[11px] font-bold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-black px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Camera className="w-3 h-3 text-emerald-600" />
                    Ampliar Foto
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX PHOTO INSPECTOR */}
      {lightboxPhoto && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-60 flex flex-col items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/90 border-b border-zinc-800 text-white">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <div>
                  <h4 className="font-bold text-sm leading-tight">{lightboxPhoto.title}</h4>
                  <p className="text-[11px] italic text-emerald-300">{lightboxPhoto.scientificName}</p>
                </div>
              </div>
              <button
                onClick={() => setLightboxPhoto(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image viewer */}
            <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center bg-black min-h-[300px]">
              {imageErrorMap[lightboxPhoto.url] ? (
                <div className="text-center p-6 space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-zinc-900 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold text-white">{lightboxPhoto.title}</p>
                  <p className="text-xs text-zinc-400 max-w-md">{lightboxPhoto.caption}</p>
                  <button
                    onClick={() => setImageErrorMap(prev => ({ ...prev, [lightboxPhoto.url]: false }))}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Tentar Recarregar Fotografia
                  </button>
                </div>
              ) : (
                <img
                  src={lightboxPhoto.url}
                  alt={lightboxPhoto.title}
                  className="max-h-[68vh] w-auto max-w-full object-contain rounded-lg border border-zinc-800 shadow-xl"
                  onError={() => handleImageError(lightboxPhoto.url)}
                  referrerPolicy="no-referrer"
                />
              )}
            </div>

            {/* Caption & Agronomic Note */}
            <div className="px-4 py-3 bg-zinc-900 border-t border-zinc-800 text-xs text-zinc-300 flex items-start gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded shrink-0">
                {lightboxPhoto.tag}
              </span>
              <p className="leading-relaxed">
                <strong className="text-emerald-400 mr-1">Laudo Fotográfico:</strong>
                {lightboxPhoto.caption}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CROP PICKER MODAL: SELECT CROP FOR DETAILED ACTIVE INGREDIENTS */}
      {isCropPickerOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-55 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-fade-in overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Guia Fitossanitário do Viveirista por Cultura
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Selecione uma das {nurseryCropsCatalog.length} culturas para consultar os 4 Pilares: Químico (IRAC/FRAC), Físico, Biológico e Cultural
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCropPickerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-slate-100 dark:border-zinc-800">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrar cultura por nome comum, científico ou cultivar..."
                  value={cropPickerSearch}
                  onChange={e => setCropPickerSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredPickerCrops.map(crop => {
                  const phytoCount = (crop.detailedPestsAndDiseases || []).length;
                  return (
                    <button
                      key={crop.id}
                      onClick={() => {
                        setSelectedPhytoCrop(crop);
                        setIsCropPickerOpen(false);
                      }}
                      className="text-left p-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition-all flex items-start justify-between gap-2 group cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900 dark:text-zinc-100 group-hover:text-teal-700 dark:group-hover:text-teal-400">
                            {crop.name}
                          </span>
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                            {crop.category}
                          </span>
                        </div>
                        <p className="text-[10px] italic text-slate-500 dark:text-zinc-400 mt-0.5">
                          {crop.scientificName}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 line-clamp-1">
                          Cultivares: {crop.cultivars.join(', ')}
                        </p>
                      </div>

                      <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                        {phytoCount} alvos • 4 Pilares MIP
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 border-t border-slate-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setIsCropPickerOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL FITOSANITARY MODAL FOR SELECTED CROP */}
      {selectedPhytoCrop && (
        <NurseryCropPhytoDetailModal
          crop={selectedPhytoCrop}
          onClose={() => setSelectedPhytoCrop(null)}
        />
      )}
    </div>
  );
};
