import React, { useState } from 'react';
import { ForageItem } from '../../types/forage';
import { getForagePhotoData } from '../../data/foragePhotosDatabase';
import { ForageSideBySideCompareModal } from './ForageSideBySideCompareModal';
import {
  X,
  Printer,
  Sparkles,
  Leaf,
  FlaskConical,
  Scale,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  BookOpen,
  Droplets,
  Tractor,
  Layers,
  Thermometer,
  Zap,
  Camera,
  ZoomIn,
  MapPin,
  Maximize2,
  Sprout,
  ArrowLeftRight,
} from 'lucide-react';

interface ForageDetailModalProps {
  forage: ForageItem | null;
  onClose: () => void;
  onSelectAnotherForage?: (forage: ForageItem) => void;
}

type TabType = 'galeria_fotos' | 'geral' | 'bromatologia' | 'manejo' | 'adubacao_solo' | 'doencas_pragas' | 'ficha_impressao';

export const ForageDetailModal: React.FC<ForageDetailModalProps> = ({ forage, onClose, onSelectAnotherForage }) => {
  const [activeTab, setActiveTab] = useState<TabType>('galeria_fotos');
  const [photoZoom, setPhotoZoom] = useState<boolean>(false);
  const [showSideBySideCompare, setShowSideBySideCompare] = useState<boolean>(false);

  if (!forage) return null;

  const photoData = getForagePhotoData(forage.id);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="fixed inset-0 z-[200] overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden print:max-h-none print:border-none print:shadow-none">
          {/* Fixed Header */}
          <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-lg sm:text-xl text-white">
                    {forage.commonName}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {forage.cultivar}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    📷 FOTOS REAIS OFFLINE
                  </span>
                </div>
                <p className="text-xs text-slate-400 italic">
                  {forage.scientificName} &bull; {forage.botanicalFamily}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSideBySideCompare(true)}
                className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                title="Comparar lateralmente exigências nutricionais e de solo com outra forrageira"
              >
                <Scale className="w-4 h-4" />
                <span className="hidden sm:inline">Comparar Lado a Lado</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Imprimir Ficha Técnica"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Imprimir Ficha</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Navigation Sub-tabs */}
          <div className="bg-slate-100 dark:bg-zinc-800/80 p-2 border-b border-slate-200 dark:border-zinc-800 flex items-center gap-1 overflow-x-auto scrollbar-thin print:hidden">
            <button
              type="button"
              onClick={() => setActiveTab('galeria_fotos')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'galeria_fotos'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Fotos Reais de Campo & Macro
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('geral')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'geral'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Visão Geral & Morfologia
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bromatologia')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'bromatologia'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              Bromatologia & Nutrição
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('manejo')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'manejo'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Fenologia & Manejo Rotacionado
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('adubacao_solo')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'adubacao_solo'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Adubação, Calagem & Solo
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('doencas_pragas')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'doencas_pragas'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Doenças & Pragas ({forage.diseasesAndPests.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ficha_impressao')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'ficha_impressao'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              Ficha Completa
            </button>

            <div className="h-5 w-[1px] bg-slate-300 dark:bg-zinc-700 mx-1 shrink-0" />

            <button
              type="button"
              onClick={() => setShowSideBySideCompare(true)}
              className="px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Modal de Comparação Lateral (Solo & Nutrição)</span>
            </button>
          </div>

        {/* Scrollable Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 0: GALERIA DE FOTOS REAIS DE CAMPO & MACRO */}
          {activeTab === 'galeria_fotos' && (
            <div className="space-y-6">
              {/* Main Photo Showcase Hero Card */}
              <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl group">
                <div className="relative h-80 sm:h-96 w-full overflow-hidden">
                  <img
                    src={photoData.primaryPhotoUrl}
                    alt={`Foto real de campo de ${forage.commonName}`}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      photoZoom ? 'scale-125' : 'scale-100 group-hover:scale-105'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                </div>

                {/* Floating Top Info Badges */}
                <div className="absolute top-4 inset-x-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 text-white text-xs font-extrabold shadow-md">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span>FOTOGRAFIA AGRONÔMICA REAL OFFLINE</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPhotoZoom(!photoZoom)}
                    className="p-2 rounded-xl bg-black/80 backdrop-blur-md text-white hover:text-emerald-400 border border-white/20 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                    title={photoZoom ? 'Diminuir Zoom' : 'Ampliar Zoom'}
                  >
                    <ZoomIn className="w-4 h-4" />
                    <span className="hidden sm:inline">{photoZoom ? 'Zoom 1x' : 'Zoom 1.25x'}</span>
                  </button>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white space-y-2">
                  <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>{photoData.tagLocation}</span>
                    <span className="text-slate-400">&bull;</span>
                    <span>IL 95% &bull; Entrada {forage.phenology.entryHeightRotationalCm} cm</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
                    {forage.commonName} ({forage.cultivar})
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-3xl drop-shadow-sm">
                    {photoData.fieldAngleDescription}
                  </p>
                </div>
              </div>

              {/* Macro & Botanical Focus Gallery Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Perfilhos & Lâmina Foliar */}
                <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                    <Leaf className="w-4 h-4" />
                    <span>1. Lâmina Foliar & Textura</span>
                  </div>
                  <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {photoData.macroZoomTitle}
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {photoData.macroZoomDescription}
                  </p>
                  <div className="pt-2 border-t border-slate-200 dark:border-zinc-700 text-[11px] text-slate-500 dark:text-zinc-400">
                    <strong>Detalhe:</strong> {photoData.botanicalZoomDetails.leafTexture}
                  </div>
                </div>

                {/* Card 2: Bainha, Lígula & Colar */}
                <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-xs">
                    <Layers className="w-4 h-4" />
                    <span>2. Inserção, Bainha & Colar</span>
                  </div>
                  <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Morfologia do Colar & Lígula
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {forage.visuals.collarAndLiguleDescription}
                  </p>
                  <div className="pt-2 border-t border-slate-200 dark:border-zinc-700 text-[11px] text-slate-500 dark:text-zinc-400">
                    <strong>Estrutura:</strong> {photoData.botanicalZoomDetails.collarAndLigule}
                  </div>
                </div>

                {/* Card 3: Inflorescência & Sementes */}
                <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs">
                    <Sprout className="w-4 h-4" />
                    <span>3. Inflorescência & Sementes</span>
                  </div>
                  <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Panícula / Racemo Reprodutivo
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {forage.visuals.inflorescenceType}
                  </p>
                  <div className="pt-2 border-t border-slate-200 dark:border-zinc-700 text-[11px] text-slate-500 dark:text-zinc-400">
                    <strong>Visual:</strong> {photoData.botanicalZoomDetails.seedheadVisual}
                  </div>
                </div>
              </div>

              {/* Dry Season Photographic Note */}
              <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                <Thermometer className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <strong className="text-amber-900 dark:text-amber-200 block">
                    Comportamento Fotográfico no Período Seco (Estiagem):
                  </strong>
                  <p className="text-amber-950 dark:text-amber-300 leading-relaxed">
                    {photoData.drySeasonPhotoNote}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: VISÃO GERAL */}
          {activeTab === 'geral' && (
            <div className="space-y-6">
              {/* Botanical Description Hero Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-1 bg-slate-950 rounded-2xl p-4 border border-slate-800 text-white space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block mb-1">
                      Identificação Botânica Offline
                    </span>
                    <h4 className="font-bold text-lg text-white">
                      {forage.commonName}
                    </h4>
                    <p className="text-xs text-slate-300 italic">
                      {forage.scientificName}
                    </p>
                    <p className="text-xs text-emerald-300 mt-2">
                      Origem: <span className="text-white">{forage.origin}</span>
                    </p>
                    {forage.releaseYearOrInstitution && (
                      <p className="text-xs text-emerald-300">
                        Lançamento: <span className="text-white">{forage.releaseYearOrInstitution}</span>
                      </p>
                    )}
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block">
                      Produção Média de Matéria Seca:
                    </span>
                    <span className="text-xl font-black text-emerald-400">
                      {forage.dryMatterYieldTonHaYear.average} <span className="text-xs font-normal text-slate-300">toneladas/ha/ano</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Faixa: {forage.dryMatterYieldTonHaYear.min} a {forage.dryMatterYieldTonHaYear.max} t MS/ha
                    </span>
                  </div>
                </div>

                <div className="md:col-span-2 bg-slate-50 dark:bg-zinc-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    Morfologia & Arquitetura da Planta
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">
                        Hábito de Crescimento:
                      </span>
                      <span className="text-slate-700 dark:text-zinc-300">
                        {forage.visuals.growthHabitBadge}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">
                        Inflorescência & Sementes:
                      </span>
                      <span className="text-slate-700 dark:text-zinc-300">
                        {forage.visuals.inflorescenceType}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">
                        Lâmina Foliar & Colmos:
                      </span>
                      <span className="text-slate-700 dark:text-zinc-300">
                        {forage.visuals.leafBladeDescription}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">
                        Sistema Radicular:
                      </span>
                      <span className="text-slate-700 dark:text-zinc-300">
                        {forage.visuals.rootSystemDescription}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-900 dark:text-emerald-200">
                    <span className="font-bold block mb-1">📸 Descrição Fotográfica de Campo:</span>
                    <p className="italic">{forage.visuals.realPhotoDescription}</p>
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses (Pontos Fortes e Fracos) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-emerald-50/70 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                  <h4 className="font-extrabold text-sm text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Pontos Fortes & Vantagens Agronômicas
                  </h4>
                  <ul className="space-y-2">
                    {forage.strengthsAndWeaknesses.strengths.map((st, i) => (
                      <li key={i} className="text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-50/70 dark:bg-rose-950/20 p-5 rounded-2xl border border-rose-200 dark:border-rose-800/60 space-y-3">
                  <h4 className="font-extrabold text-sm text-rose-900 dark:text-rose-300 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    Pontos Fracos & Limitações de Uso
                  </h4>
                  <ul className="space-y-2">
                    {forage.strengthsAndWeaknesses.weaknesses.map((wk, i) => (
                      <li key={i} className="text-xs text-rose-950 dark:text-rose-200 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        <span>{wk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Livestock & Production Categories */}
              <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Indicações Zootécnicas & Aptidões
                </h4>
                <div className="flex flex-wrap gap-2">
                  {forage.strengthsAndWeaknesses.animalCategoriesRecommended.map((cat, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 text-xs font-bold text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 shadow-2xs">
                      🐂 {cat}
                    </span>
                  ))}
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    🌾 Aptidão: {forage.strengthsAndWeaknesses.hayOrSilageSuitability}
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-xs font-bold text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                    🌲 ILPF: {forage.strengthsAndWeaknesses.ilpfCompatibilityRating}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BROMATOLOGIA */}
          {activeTab === 'bromatologia' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-center">
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block uppercase">
                    Proteína Bruta (PB)
                  </span>
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 my-1 block">
                    {forage.bromatology.crudeProteinPercent.average}%
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                    {forage.bromatology.crudeProteinPercent.min}% a {forage.bromatology.crudeProteinPercent.max}%
                  </span>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-800 text-center">
                  <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 block uppercase">
                    Digestibilidade (DIVMS)
                  </span>
                  <span className="text-2xl font-black text-blue-700 dark:text-blue-400 my-1 block">
                    {forage.bromatology.inVitroDryMatterDigestibilityPercent.average}%
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                    {forage.bromatology.inVitroDryMatterDigestibilityPercent.min}% a {forage.bromatology.inVitroDryMatterDigestibilityPercent.max}%
                  </span>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/40 p-4 rounded-2xl border border-purple-200 dark:border-purple-800 text-center">
                  <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300 block uppercase">
                    Nutrientes Digestíveis (NDT)
                  </span>
                  <span className="text-2xl font-black text-purple-700 dark:text-purple-400 my-1 block">
                    {forage.bromatology.totalDigestibleNutrientsPercent.average}%
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                    {forage.bromatology.totalDigestibleNutrientsPercent.min}% a {forage.bromatology.totalDigestibleNutrientsPercent.max}%
                  </span>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-800 text-center">
                  <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block uppercase">
                    Fibra Deterg. Neutro (FDN)
                  </span>
                  <span className="text-2xl font-black text-amber-700 dark:text-amber-400 my-1 block">
                    {forage.bromatology.neutralDetergentFiberPercent.average}%
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                    {forage.bromatology.neutralDetergentFiberPercent.min}% a {forage.bromatology.neutralDetergentFiberPercent.max}%
                  </span>
                </div>

                <div className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-2xl border border-rose-200 dark:border-rose-800 text-center">
                  <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 block uppercase">
                    Fibra Deterg. Ácido (FDA)
                  </span>
                  <span className="text-2xl font-black text-rose-700 dark:text-rose-400 my-1 block">
                    {forage.bromatology.acidDetergentFiberPercent.average}%
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                    {forage.bromatology.acidDetergentFiberPercent.min}% a {forage.bromatology.acidDetergentFiberPercent.max}%
                  </span>
                </div>
              </div>

              {/* Bromatology Technical Details */}
              <div className="bg-slate-50 dark:bg-zinc-800/40 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Scale className="w-4 h-4 text-emerald-600" />
                    Palatabilidade e Consumo Voluntário Animal
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowSideBySideCompare(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>Comparar Nutrição com Outra Forrageira</span>
                  </button>
                </div>

                <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-500 dark:text-zinc-400">Grau de Palatabilidade:</span>
                    <span className="px-2.5 py-0.5 rounded-md font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {forage.bromatology.palatabilityRating}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                    {forage.bromatology.voluntaryIntakeNotes}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MANEJO & FENOLOGIA */}
          {activeTab === 'manejo' && (
            <div className="space-y-6">
              {/* Grazing Heights Infographic Card */}
              <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-5 rounded-2xl shadow-md">
                <h4 className="font-extrabold text-base mb-4 flex items-center gap-2 text-emerald-200">
                  <Scale className="w-5 h-5 text-emerald-400" />
                  Manejo de Pastejo Rotacionado (Ponto Ótimo de Desfolha)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
                    <span className="text-xs font-bold text-emerald-300 block uppercase">
                      Altura de Entrada (Pré-Pastejo)
                    </span>
                    <span className="text-3xl font-black text-white block my-1">
                      {forage.phenology.entryHeightRotationalCm} <span className="text-base font-normal">cm</span>
                    </span>
                    <p className="text-[11px] text-emerald-100">
                      Momento de 95% de interceptação luminosa (IL) com máxima proporção de folhas e digestibilidade.
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
                    <span className="text-xs font-bold text-rose-300 block uppercase">
                      Altura de Saída (Pós-Pastejo / Resíduo)
                    </span>
                    <span className="text-3xl font-black text-white block my-1">
                      {forage.phenology.exitHeightRotationalCm} <span className="text-base font-normal">cm</span>
                    </span>
                    <p className="text-[11px] text-rose-100">
                      Garante reserva de carboidratos basais e gemas para rebrote acelerado sem degradar a touceira.
                    </p>
                  </div>
                </div>
              </div>

              {/* Phenological Attributes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <span className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                    Época de Florescimento:
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {forage.phenology.floweringSeason}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <span className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                    Produção na Estiagem (Seca):
                  </span>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">
                    {forage.phenology.drySeasonAccumulationPercent}% do total anual
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <span className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                    Tolerância à Seca / Estiagem:
                  </span>
                  <span className="font-extrabold text-amber-700 dark:text-amber-400 text-sm">
                    {forage.phenology.droughtTolerance}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <span className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                    Tolerância ao Frio / Geadas:
                  </span>
                  <span className="font-extrabold text-blue-700 dark:text-blue-400 text-sm">
                    {forage.phenology.frostTolerance}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <span className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                    Tempo de Estabelecimento:
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {forage.phenology.establishmentDays.min} a {forage.phenology.establishmentDays.max} dias
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <span className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                    Descanso nas Águas vs Seca:
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {forage.phenology.grazingRestPeriodDays.rainy.min}-{forage.phenology.grazingRestPeriodDays.rainy.max} d (Águas) / {forage.phenology.grazingRestPeriodDays.dry.min}-{forage.phenology.grazingRestPeriodDays.dry.max} d (Seca)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADUBAÇÃO & INDICAÇÃO DE SOLO */}
          {activeTab === 'adubacao_solo' && (
            <div className="space-y-6">
              {/* Soil Requirements Hero */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-800">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block uppercase">
                    Exigência em Fertilidade
                  </span>
                  <span className="text-xl font-extrabold text-amber-900 dark:text-amber-200 capitalize my-1 block">
                    {forage.soilAndClimate.fertilityRequirement}
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-zinc-400">
                    Saturação por Bases (V%): <strong className="text-amber-800 dark:text-amber-300">{forage.fertilization.targetBaseSaturationPercent}%</strong>
                  </span>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-2xl border border-blue-200 dark:border-blue-800">
                  <span className="text-xs font-bold text-blue-800 dark:text-blue-300 block uppercase">
                    Drenagem do Solo
                  </span>
                  <span className="text-xl font-extrabold text-blue-900 dark:text-blue-200 capitalize my-1 block">
                    {forage.soilAndClimate.drainageRequirement.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-zinc-400">
                    Tolerância ao Encharcamento: <strong>{forage.soilAndClimate.waterloggingTolerance}</strong>
                  </span>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block uppercase">
                    Pluviometria Anual
                  </span>
                  <span className="text-xl font-extrabold text-emerald-900 dark:text-emerald-200 my-1 block">
                    {forage.soilAndClimate.annualRainfallMmRange.ideal} <span className="text-xs font-normal">mm/ano</span>
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-zinc-400">
                    Faixa: {forage.soilAndClimate.annualRainfallMmRange.min} a {forage.soilAndClimate.annualRainfallMmRange.max} mm
                  </span>
                </div>
              </div>

              {/* Detailed Fertilization Recommendations */}
              <div className="bg-slate-50 dark:bg-zinc-800/40 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-emerald-600" />
                    Programa Técnico de Calagem, Gessagem & Adubação
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowSideBySideCompare(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>Comparar Exigências de Solo & V%</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                      1. Correção e Calagem (V%):
                    </span>
                    <p className="text-slate-700 dark:text-zinc-300">
                      {forage.fertilization.limingRecommendation}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                      2. Adubação de Estabelecimento (Plantio):
                    </span>
                    <p className="text-slate-700 dark:text-zinc-300">
                      {forage.fertilization.establishmentFertilizerNPK}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                      3. Adubação Anual de Manutenção / Produção:
                    </span>
                    <p className="text-slate-700 dark:text-zinc-300">
                      {forage.fertilization.annualMaintenanceFertilizer}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                      4. Micronutrientes & Gessagem:
                    </span>
                    <p className="text-slate-700 dark:text-zinc-300">
                      {forage.fertilization.micronutrientsNeeds} &bull; {forage.fertilization.gypsumNeedIndication}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DOENÇAS & PRAGAS */}
          {activeTab === 'doencas_pragas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Sanidade Vegetal: Doenças e Pragas Críticas da Forrageira
                </h4>
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  Total de enfermidades catalogadas: {forage.diseasesAndPests.length}
                </span>
              </div>

              {forage.diseasesAndPests.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-200 dark:border-zinc-800">
                  <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                    Forrageira com altíssima rusticidade fitossanitária
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Não há registros de pragas limitantes severas sob manejo rotacionado padrão.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {forage.diseasesAndPests.map((disease, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 dark:bg-zinc-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {disease.name}
                          </h5>
                          {disease.scientificName && (
                            <span className="text-xs text-slate-400 italic">
                              ({disease.scientificName})
                            </span>
                          )}
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            disease.susceptibilityLevel === 'alta'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : disease.susceptibilityLevel === 'moderada'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          Suscetibilidade: {disease.susceptibilityLevel}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
                          <span className="font-bold text-rose-700 dark:text-rose-400 block mb-0.5">
                            Sintomas no Campo:
                          </span>
                          <p className="text-slate-700 dark:text-zinc-300">
                            {disease.symptoms}
                          </p>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
                          <span className="font-bold text-amber-700 dark:text-amber-400 block mb-0.5">
                            Impacto & Dano Zootécnico:
                          </span>
                          <p className="text-slate-700 dark:text-zinc-300">
                            {disease.damageImpact}
                          </p>
                        </div>

                        <div className="sm:col-span-2 bg-emerald-50 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                          <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-1">
                            Medidas de Controle, Prevenção e Manejo Agronômico:
                          </span>
                          <p className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
                            {disease.controlAndManagement}
                          </p>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block mt-1.5 font-medium">
                            Condições Favoráveis: {disease.favorableConditions}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: FICHA COMPLETA PARA IMPRESSÃO */}
          {activeTab === 'ficha_impressao' && (
            <div className="space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 print:p-0 print:border-none">
              <div className="border-b-2 border-emerald-600 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    FICHA TÉCNICA OFICIAL &bull; {forage.commonName.toUpperCase()}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">
                    GeaAgro CRM &bull; Catálogo Nacional de Forrageiras Tropicais e Subtropicais
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    {forage.scientificName}
                  </span>
                  <p className="text-[10px] text-slate-400">{forage.cultivar}</p>
                </div>
              </div>

              {/* Printable Table Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-zinc-800 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">PB Média:</span>
                  <strong className="text-sm text-emerald-600">{forage.bromatology.crudeProteinPercent.average}%</strong>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-zinc-800 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">DIVMS Média:</span>
                  <strong className="text-sm text-blue-600">{forage.bromatology.inVitroDryMatterDigestibilityPercent.average}%</strong>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-zinc-800 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Altura Entrada:</span>
                  <strong className="text-sm text-slate-900 dark:text-white">{forage.phenology.entryHeightRotationalCm} cm</strong>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-zinc-800 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Altura Saída:</span>
                  <strong className="text-sm text-slate-900 dark:text-white">{forage.phenology.exitHeightRotationalCm} cm</strong>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <h5 className="font-bold text-slate-900 dark:text-white">Semeadura & Implantação:</h5>
                <p className="text-slate-700 dark:text-zinc-300">
                  Pontos de VC: <strong>{forage.seeding.pureLiveSeedPointsVC}</strong> &bull; Profundidade: <strong>{forage.seeding.seedPlantingDepthCm.min} a {forage.seeding.seedPlantingDepthCm.max} cm</strong> &bull; Taxa a lanço: <strong>{forage.seeding.seedingRateKgHa.broadcast.min} a {forage.seeding.seedingRateKgHa.broadcast.max} kg/ha</strong>.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <h5 className="font-bold text-slate-900 dark:text-white">Adubação & Calagem:</h5>
                <p className="text-slate-700 dark:text-zinc-300">
                  {forage.fertilization.limingRecommendation} &bull; {forage.fertilization.establishmentFertilizerNPK} &bull; {forage.fertilization.annualMaintenanceFertilizer}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Consulta realizada no módulo de Análise Técnica &bull; GeaAgro 4.2.3.2</span>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-xs print:hidden cursor-pointer"
                >
                  Imprimir Documento
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Side-by-side comparison modal */}
    {showSideBySideCompare && (
      <ForageSideBySideCompareModal
        primaryForage={forage}
        onClose={() => setShowSideBySideCompare(false)}
        onSelectForageToView={onSelectAnotherForage}
      />
    )}
  </>
  );
};
