import React, { useState } from 'react';
import { BuffaloDisease } from '../../types/buffalo';
import { BUFFALO_DISEASES } from '../../data/buffaloData';
import {
  getPhotosForDisease,
  BuffaloDiseasePhoto,
  getAllBuffaloDiseaseRealPhotos,
  BuffaloRealPhotoItem
} from '../../utils/buffaloDiseasePhotos';
import {
  BookOpen,
  Search,
  AlertTriangle,
  ShieldCheck,
  Activity,
  HeartPulse,
  Bug,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Maximize2,
  X,
  Stethoscope,
  Pill,
  Syringe,
  Microscope,
  CheckCircle2,
  HelpCircle,
  Clock,
  Eye,
  Layers,
  Thermometer,
  FileText,
  Camera,
  WifiOff,
  Grid,
  List
} from 'lucide-react';

export const BuffaloDiseasesLibraryView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'gallery' | 'cards'>('gallery');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [zoonoticFilter, setZoonoticFilter] = useState<boolean | 'all'>('all');
  const [expandedDiseaseId, setExpandedDiseaseId] = useState<string | null>(BUFFALO_DISEASES[0]?.id || null);
  const [activeTabByDisease, setActiveTabByDisease] = useState<Record<string, 'overview' | 'etiology' | 'symptoms' | 'control' | 'photos'>>({});
  const [modalPhoto, setModalPhoto] = useState<BuffaloDiseasePhoto | null>(null);

  const realPhotosList = getAllBuffaloDiseaseRealPhotos();

  const getActiveTab = (diseaseId: string) => {
    return activeTabByDisease[diseaseId] || 'overview';
  };

  const setActiveTab = (diseaseId: string, tab: 'overview' | 'etiology' | 'symptoms' | 'control' | 'photos') => {
    setActiveTabByDisease(prev => ({ ...prev, [diseaseId]: tab }));
  };

  const filteredDiseases = BUFFALO_DISEASES.filter(d => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.popularName && d.popularName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      d.scientificAgent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.clinicalSigns.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.controlDetails?.drugOfChoice && d.controlDetails.drugOfChoice.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'todas' || d.category === selectedCategory;
    const matchesZoonotic = zoonoticFilter === 'all' || d.zoonotic === zoonoticFilter;

    return matchesSearch && matchesCategory && matchesZoonotic;
  });

  const filteredRealPhotos = realPhotosList.filter(item => {
    const matchesSearch =
      item.diseaseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.popularName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.photo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.photo.anatomicalSite.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'todas' || item.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesZoonotic = zoonoticFilter === 'all' || item.zoonotic === zoonoticFilter;

    return matchesSearch && matchesCategory && matchesZoonotic;
  });

  const handleOpenDiseaseCard = (diseaseId: string, tab: 'overview' | 'etiology' | 'symptoms' | 'control' | 'photos' = 'overview') => {
    setViewMode('cards');
    setExpandedDiseaseId(diseaseId);
    setActiveTab(diseaseId, tab);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner da Biblioteca de Sanidade */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-teal-950 border border-teal-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-full text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-teal-400" />
            <span>Biblioteca Clínica &amp; Atlas Sanitário de Bubalinos</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Biblioteca de Doenças &amp; Sanidade Bubalina
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Catálogo completo com <strong>Etiologia</strong>, <strong>Sintomas</strong>, <strong>Protocolos de Controle</strong> e <strong>Fotos Clínicas / Ilustrações Médicas</strong> 100% integradas e disponíveis sem dependência de internet.
          </p>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-4 border-t border-slate-800">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por doença, agente, sintoma, antibiótico ou medicamento..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-teal-500/30 rounded-xl text-xs font-semibold text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950/80 border border-teal-500/30 rounded-xl text-xs font-bold text-teal-300 focus:outline-none"
            >
              <option value="todas">Todas Categorias ({BUFFALO_DISEASES.length})</option>
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
              value={zoonoticFilter === 'all' ? 'all' : zoonoticFilter ? 'true' : 'false'}
              onChange={(e) => setZoonoticFilter(e.target.value === 'all' ? 'all' : e.target.value === 'true')}
              className="w-full px-3 py-2.5 bg-slate-950/80 border border-teal-500/30 rounded-xl text-xs font-bold text-amber-300 focus:outline-none"
            >
              <option value="all">Todas as Enfermidades</option>
              <option value="true">⚠️ Apenas Zoonoses (Risco Humano)</option>
              <option value="false">Apenas Não Zoonóticas</option>
            </select>
          </div>
        </div>

        {/* Resumo Rápido de Doenças e Modo de Visualização */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-3 border-t border-slate-800/60">
          <div className="flex items-center gap-4">
            <span>Encontradas: <strong className="text-teal-400">{filteredDiseases.length}</strong> doenças</span>
            <span className="hidden md:inline">•</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" /> 13 Fotos Reais Integradas (100% Offline)
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline">Visualização:</span>
            <div className="p-1 bg-slate-950/90 border border-teal-500/30 rounded-xl flex items-center gap-1">
              <button
                onClick={() => setViewMode('gallery')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'gallery'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>📸 Galeria de Fotos Reais</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>📋 Fichas Clínicas</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODO 1: GALERIA VISUAL DE FOTOS REAIS (100% OFFLINE) */}
      {viewMode === 'gallery' && (
        <div className="space-y-6">
          {/* Banner explicativo de fotos reais offline */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950 border border-emerald-500/40 rounded-3xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-2xl shrink-0">
                <Camera className="w-7 h-7 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                    <WifiOff className="w-3 h-3" />
                    100% Offline • Sem Internet
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">
                    13 Enfermidades com Registros Fotográficos Clínicos Reais de Campo
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Atlas Fotográfico Clínico dos Búfalos (Bubalus bubalis)
                </h3>
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                  Todas as imagens clínicas (mastite, pododermatite, brucelose, tuberculose, tristeza parasitária, leptospirose, clostridiose, parasitoses e bezerros) estão <strong>embutidas localmente</strong> no sistema, permitindo diagnóstico visual imediato em currais, piquetes ou áreas sem sinal telefônico.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="px-3 py-1 bg-slate-950/80 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300">
                {filteredRealPhotos.length} fotos exibidas
              </span>
            </div>
          </div>

          {/* Grid de Fotografias Clínicas Reais */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredRealPhotos.map((item) => (
              <div
                key={item.diseaseId}
                className="group bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Foto Real com Ação de Zoom e Badges */}
                  <div
                    onClick={() => setModalPhoto(item.photo)}
                    className="relative aspect-video bg-slate-950 overflow-hidden cursor-pointer flex items-center justify-center border-b border-slate-100 dark:border-zinc-800"
                    title="Clique para ampliar em alta definição"
                  >
                    <img
                      src={item.photo.imageDataUri}
                      alt={item.photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Badge Foto Real Offline */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                      <span className="px-2.5 py-1 bg-emerald-600/95 backdrop-blur-sm text-white font-black text-[10px] rounded-md shadow-md flex items-center gap-1.5 border border-emerald-400/40">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        FOTO REAL DE CAMPO • OFFLINE
                      </span>
                      {item.zoonotic && (
                        <span className="px-2 py-0.5 bg-rose-600/95 backdrop-blur-sm text-white font-black text-[9px] rounded-md shadow flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" /> ZOONOSE
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-slate-900/90 text-white rounded-lg opacity-90 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[10px] font-bold shadow-md">
                      <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ampliar</span>
                    </div>
                  </div>

                  {/* Detalhes da Doença e Diagnóstico */}
                  <div className="p-4 space-y-3">
                    <div>
                      <span className="px-2 py-0.5 bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 font-bold text-[10px] rounded border border-teal-200 dark:border-teal-800">
                        {item.category}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1.5 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {item.diseaseName}
                      </h4>
                      {item.popularName && (
                        <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                          Vulgo: "{item.popularName}"
                        </p>
                      )}
                    </div>

                    {/* Descrição da lesão na foto */}
                    <div className="p-2.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Diagnóstico Visual Clínico:</span>
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 leading-snug">
                        {item.photo.title}
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2">
                        {item.photo.description}
                      </p>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-500 dark:text-zinc-400">
                      {item.photo.anatomicalSite && (
                        <div className="flex items-center gap-1.5">
                          <strong className="text-slate-700 dark:text-zinc-300">Sítio:</strong>
                          <span className="truncate">{item.photo.anatomicalSite}</span>
                        </div>
                      )}
                      {item.photo.stageOrLesion && (
                        <div className="flex items-center gap-1.5">
                          <strong className="text-slate-700 dark:text-zinc-300">Lesão:</strong>
                          <span className="text-amber-600 dark:text-amber-400 font-medium truncate">{item.photo.stageOrLesion}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ações da Foto */}
                <div className="p-4 pt-0 flex items-center gap-2">
                  <button
                    onClick={() => setModalPhoto(item.photo)}
                    className="flex-1 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Foto</span>
                  </button>
                  <button
                    onClick={() => handleOpenDiseaseCard(item.diseaseId, 'overview')}
                    className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Ficha Clínica</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODO 2: GRID DE FICHAS DE DOENÇAS EXPANDÍVEIS */}
      {viewMode === 'cards' && (
      <div className="space-y-4">
        {filteredDiseases.map((disease) => {
          const isExpanded = expandedDiseaseId === disease.id;
          const activeTab = getActiveTab(disease.id);
          const photos = getPhotosForDisease(disease.id);
          const realPhoto = photos.find(p => p.isRealPhoto) || photos[0];

          return (
            <div
              key={disease.id}
              className={`bg-white dark:bg-zinc-900 border rounded-2xl shadow-xs overflow-hidden transition-all duration-200 ${
                isExpanded
                  ? 'border-teal-500/50 dark:border-teal-600/50 ring-1 ring-teal-500/20 shadow-md'
                  : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
              }`}
            >
              {/* Header da Ficha com Miniatura da Foto Real */}
              <div
                onClick={() => setExpandedDiseaseId(isExpanded ? null : disease.id)}
                className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 select-none transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Miniatura da Foto Real no Cabeçalho */}
                  {realPhoto && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalPhoto(realPhoto);
                      }}
                      className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-zinc-700 group/thumb cursor-pointer shadow-xs bg-slate-950"
                      title="Clique para ampliar a foto clínica real"
                    >
                      <img
                        src={realPhoto.imageDataUri}
                        alt={disease.name}
                        className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover/thumb:bg-black/0 transition-colors" />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.2 bg-emerald-600/95 text-white font-black text-[8px] rounded flex items-center gap-0.5 shadow">
                        <Camera className="w-2.5 h-2.5" /> Real
                      </span>
                    </div>
                  )}

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {disease.name}
                      </span>
                      <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-bold text-[10px] rounded-md border border-teal-300/40 dark:border-teal-700/40">
                        {disease.category}
                      </span>
                      {disease.zoonotic && (
                        <span className="px-2.5 py-0.5 bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 font-black text-[10px] rounded-md border border-rose-300/40 dark:border-rose-700/40 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                          ZOONOSE
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-zinc-400 font-medium">
                      {disease.popularName && (
                        <span className="text-slate-600 dark:text-zinc-300 font-semibold">
                          Vulgo: "{disease.popularName}"
                        </span>
                      )}
                      <span className="italic font-serif text-slate-600 dark:text-zinc-300">
                        Agente: {disease.scientificAgent}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400 hidden sm:inline">
                    {isExpanded ? 'Recolher Ficha' : 'Ver Ficha Completa'}
                  </span>
                  <div className={`p-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 transition-transform ${isExpanded ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-600' : 'text-slate-400'}`}>
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Corpo Detalhado da Ficha com Abas Clínicas */}
              {isExpanded && (
                <div className="border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40">
                  {/* Navegação de Abas da Doença */}
                  <div className="flex overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-zinc-800 px-4 pt-2 gap-1 bg-white/60 dark:bg-zinc-900/60">
                    <button
                      onClick={() => setActiveTab(disease.id, 'overview')}
                      className={`px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
                        activeTab === 'overview'
                          ? 'border-teal-500 text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/30'
                          : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Visão Geral</span>
                    </button>

                    <button
                      onClick={() => setActiveTab(disease.id, 'etiology')}
                      className={`px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
                        activeTab === 'etiology'
                          ? 'border-teal-500 text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/30'
                          : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Microscope className="w-3.5 h-3.5" />
                      <span>Etiologia &amp; Agente</span>
                    </button>

                    <button
                      onClick={() => setActiveTab(disease.id, 'symptoms')}
                      className={`px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
                        activeTab === 'symptoms'
                          ? 'border-teal-500 text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/30'
                          : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Sintomas &amp; Diagnóstico</span>
                    </button>

                    <button
                      onClick={() => setActiveTab(disease.id, 'control')}
                      className={`px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
                        activeTab === 'control'
                          ? 'border-teal-500 text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/30'
                          : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Controle &amp; Terapêutica</span>
                    </button>

                    <button
                      onClick={() => setActiveTab(disease.id, 'photos')}
                      className={`px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
                        activeTab === 'photos'
                          ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 font-black'
                          : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Fotos das Doenças ({(photos || []).length})</span>
                    </button>
                  </div>

                  {/* Conteúdo da Aba */}
                  <div className="p-6 text-xs space-y-5">
                    {/* TAB: VISÃO GERAL */}
                    {activeTab === 'overview' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                            <span className="font-extrabold text-xs uppercase text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                              <Stethoscope className="w-4 h-4" /> Principais Sinais Clínicos
                            </span>
                            <ul className="space-y-1.5 text-slate-700 dark:text-zinc-300 list-disc pl-4 leading-relaxed">
                              {disease.clinicalSigns.map((sign, idx) => (
                                <li key={idx}>{sign}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                            <span className="font-extrabold text-xs uppercase text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                              <Bug className="w-4 h-4" /> Transmissão &amp; Epidemiologia
                            </span>
                            <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                              {disease.transmission}
                            </p>
                            <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-800">
                              <div>Morbidade: <strong className="text-slate-800 dark:text-zinc-200">{disease.morbidityRate}</strong></div>
                              <div>Mortalidade: <strong className="text-slate-800 dark:text-zinc-200">{disease.mortalityRate}</strong></div>
                            </div>
                          </div>
                        </div>

                        {/* Card de Destaque de Fotos */}
                        {(photos || []).length > 0 && (
                          <div
                            onClick={() => setActiveTab(disease.id, 'photos')}
                            className="p-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/30 rounded-xl flex items-center justify-between gap-4 cursor-pointer hover:bg-emerald-500/15 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-emerald-500 text-white rounded-lg">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-black text-slate-900 dark:text-white text-xs">
                                  Atlas Clínico &amp; Fotos Disponíveis Offline ({(photos || []).length} registro visual)
                                </h4>
                                <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                                  Clique para abrir a galeria com lesões macroscópicas, microscopia e peças anatômicas.
                                </p>
                              </div>
                            </div>
                            <span className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shrink-0">
                              Ver Fotos
                            </span>
                          </div>
                        )}

                        {disease.withdrawalTimeWarning && (
                          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/50 rounded-xl text-amber-900 dark:text-amber-200 font-medium text-xs flex items-start gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block font-bold">Aviso de Carência Sanitária &amp; Saúde Pública:</strong>
                              {disease.withdrawalTimeWarning}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB: ETIOLOGIA */}
                    {activeTab === 'etiology' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-xs uppercase text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                                <Microscope className="w-4 h-4" /> Agente Etiológico &amp; Classificação
                              </span>
                              {disease.etiologyDetails?.agentType && (
                                <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-[10px] rounded-md">
                                  {disease.etiologyDetails.agentType}
                                </span>
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <span className="text-[11px] text-slate-400 uppercase font-bold block">Taxonomia / Agente Científico:</span>
                              <p className="font-serif italic text-sm text-slate-800 dark:text-zinc-100 font-bold bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-700">
                                {disease.scientificAgent}
                              </p>
                            </div>
                            {disease.etiologyDetails?.incubationPeriod && (
                              <div className="text-[11px] text-slate-600 dark:text-zinc-300 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-teal-500" />
                                <span>Período de Incubação / Pré-patente: <strong>{disease.etiologyDetails.incubationPeriod}</strong></span>
                              </div>
                            )}
                          </div>

                          <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                            <span className="font-extrabold text-xs uppercase text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                              <Activity className="w-4 h-4" /> Patogenia &amp; Mecanismo de Ação
                            </span>
                            <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                              {disease.etiologyDetails?.pathogenesis || 'Mecanismo de patogenicidade bacteriana/parasitária característico da espécie bubalina.'}
                            </p>
                          </div>
                        </div>

                        {disease.etiologyDetails?.predisposingFactors && (
                          <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                            <span className="font-extrabold text-xs uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4" /> Fatores de Risco &amp; Predisponentes em Búfalos
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 dark:text-zinc-300">
                              {disease.etiologyDetails.predisposingFactors.map((factor, idx) => (
                                <div key={idx} className="flex items-start gap-2 bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-200/50 dark:border-amber-900/30">
                                  <span className="text-amber-600 font-bold shrink-0">•</span>
                                  <span>{factor}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB: SINTOMAS & DIAGNÓSTICO */}
                    {activeTab === 'symptoms' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Sinais Precoces vs Avançados */}
                          <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                            <span className="font-extrabold text-xs uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                              <Eye className="w-4 h-4" /> Sinais Clínicos Iniciais / Precoces
                            </span>
                            <ul className="space-y-1.5 text-slate-700 dark:text-zinc-300 list-disc pl-4">
                              {(disease.symptomsDetails?.earlySigns || disease.clinicalSigns.slice(0, 2)).map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                            <span className="font-extrabold text-xs uppercase text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4" /> Sinais Avançados &amp; Complicações
                            </span>
                            <ul className="space-y-1.5 text-slate-700 dark:text-zinc-300 list-disc pl-4">
                              {(disease.symptomsDetails?.advancedSigns || disease.clinicalSigns.slice(2)).map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Alterações Fisiológicas & Necropsia */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                            <span className="font-extrabold text-xs uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                              <Thermometer className="w-4 h-4" /> Alterações de Sinais Vitais
                            </span>
                            <ul className="space-y-1 text-slate-700 dark:text-zinc-300 list-disc pl-4">
                              {(disease.symptomsDetails?.vitalSignsAlterations || [
                                'Monitorar temperatura retal (normal: 38.0°C a 39.2°C)',
                                'Frequência respiratória basal (normal: 18 a 30 mov/min)'
                              ]).map((vital, idx) => (
                                <li key={idx}>{vital}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                            <span className="font-extrabold text-xs uppercase text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                              <Layers className="w-4 h-4" /> Métodos de Diagnóstico Laboratorial
                            </span>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {disease.diagnosticMethods.map((method, idx) => (
                                <span key={idx} className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold text-[11px] rounded-lg border border-slate-200 dark:border-zinc-700">
                                  {method}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB: CONTROLE & TERAPÊUTICA */}
                    {activeTab === 'control' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Protocolo de Medicamento */}
                          <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                            <span className="font-extrabold text-xs uppercase text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                              <Pill className="w-4 h-4" /> Protocolo de Medicamento &amp; Posologia
                            </span>
                            <p className="text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                              {disease.treatmentProtocol}
                            </p>
                            {disease.controlDetails?.drugOfChoice && (
                              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-900/50 space-y-1">
                                <span className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-300 block">Princípio Ativo de Escolha:</span>
                                <span className="text-xs font-black text-blue-900 dark:text-blue-100">{disease.controlDetails.drugOfChoice}</span>
                              </div>
                            )}
                          </div>

                          {/* Biosseguridade e Manejo */}
                          <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                            <span className="font-extrabold text-xs uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4" /> Medidas de Biosseguridade &amp; Prevenção
                            </span>
                            <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                              {disease.preventionManagement}
                            </p>
                            {disease.controlDetails?.vaccinationProtocol && (
                              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-900/50 space-y-1">
                                <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                                  <Syringe className="w-3.5 h-3.5" /> Esquema de Vacinação Recomendado:
                                </span>
                                <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-100">{disease.controlDetails.vaccinationProtocol}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Carência e Quarentena */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {disease.withdrawalTimeWarning && (
                            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/50 rounded-xl text-amber-900 dark:text-amber-200 font-bold text-xs flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>⚠️ {disease.withdrawalTimeWarning}</span>
                            </div>
                          )}
                          {disease.controlDetails?.quarantineDays !== undefined && (
                            <div className="p-3.5 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200 font-semibold text-xs flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                              <span>Período de Quarentena Recomendado: <strong>{disease.controlDetails.quarantineDays} dias</strong></span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* TAB: FOTOS & ATLAS CLÍNICO OFFLINE */}
                    {activeTab === 'photos' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4" /> Atlas Clínico Fotográfico (100% Offline)
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            Clique na imagem para ampliar em alta definição
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {photos.map((photo) => (
                            <div
                              key={photo.id}
                              className="group bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                            >
                              {/* Imagem SVG / Data URI em Alta Fidelidade */}
                              <div
                                onClick={() => setModalPhoto(photo)}
                                className="relative aspect-video bg-slate-950 flex items-center justify-center cursor-pointer overflow-hidden border-b border-slate-200 dark:border-zinc-800"
                              >
                                <img
                                  src={photo.imageDataUri}
                                  alt={photo.title}
                                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-bold">
                                  <Maximize2 className="w-3 h-3" /> Ampliar
                                </div>
                                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-950/90 backdrop-blur-xs text-white border rounded text-[9px] font-mono flex items-center gap-1.5">
                                  {photo.isRealPhoto ? (
                                    <>
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                      <span className="text-emerald-400 font-bold">FOTO REAL • OFFLINE</span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                                      <span className="text-sky-400 font-bold">ATLAS VET-HD • OFFLINE</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Descrição e Anotações Anatômicas */}
                              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                                <div className="space-y-1">
                                  <h4 className="font-black text-slate-900 dark:text-white text-xs leading-snug">
                                    {photo.title}
                                  </h4>
                                  <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
                                    {photo.description}
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 space-y-1 text-[10px] text-slate-500 dark:text-zinc-400">
                                  {photo.anatomicalSite && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-slate-700 dark:text-zinc-300">Sítio Anatômico:</span>
                                      <span>{photo.anatomicalSite}</span>
                                    </div>
                                  )}
                                  {photo.stageOrLesion && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-slate-700 dark:text-zinc-300">Estadiamento:</span>
                                      <span className="text-amber-600 dark:text-amber-400 font-medium">{photo.stageOrLesion}</span>
                                    </div>
                                  )}
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
      )}

      {/* MODAL DE ZOOM DE FOTO CLÍNICA OFFLINE */}
      {modalPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative bg-slate-900 border border-teal-500/40 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header do Modal */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-4 text-white">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold">
                    Atlas Clínico Offline
                  </span>
                  {modalPhoto.anatomicalSite && (
                    <span className="text-xs text-slate-400 font-medium">
                      {modalPhoto.anatomicalSite}
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {modalPhoto.title}
                </h3>
              </div>

              <button
                onClick={() => setModalPhoto(null)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Imagem Ampliada */}
            <div className="p-4 bg-slate-950 flex-1 flex items-center justify-center overflow-auto min-h-[320px] max-h-[55vh]">
              <img
                src={modalPhoto.imageDataUri}
                alt={modalPhoto.title}
                className="max-h-full max-w-full object-contain rounded-xl border border-slate-800 shadow-lg"
              />
            </div>

            {/* Rodapé com Explicação e Detalhamento da Lesão */}
            <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 text-xs text-slate-300 space-y-2">
              <p className="leading-relaxed">
                {modalPhoto.description}
              </p>
              {modalPhoto.stageOrLesion && (
                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-teal-500/30 text-teal-300 text-[11px] font-medium flex items-center gap-2">
                  <Info className="w-4 h-4 text-teal-400 shrink-0" />
                  <span><strong>Critério Diagnóstico:</strong> {modalPhoto.stageOrLesion}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
