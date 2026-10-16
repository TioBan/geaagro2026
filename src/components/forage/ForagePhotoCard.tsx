import React, { useState } from 'react';
import { ForageItem } from '../../types/forage';
import { getForagePhotoData } from '../../data/foragePhotosDatabase';
import {
  Sprout,
  ShieldCheck,
  AlertTriangle,
  Eye,
  ArrowUpRight,
  Scale,
  Droplets,
  Sparkles,
  CheckCircle2,
  Camera,
  Layers,
  MapPin,
} from 'lucide-react';

interface ForagePhotoCardProps {
  forage: ForageItem;
  onSelect: (forage: ForageItem) => void;
  onCompareToggle?: (forageId: string) => void;
  isCompared?: boolean;
}

export const ForagePhotoCard: React.FC<ForagePhotoCardProps> = ({
  forage,
  onSelect,
  onCompareToggle,
  isCompared = false,
}) => {
  const [viewMode, setViewMode] = useState<'photo' | 'botanical'>('photo');
  const photoData = getForagePhotoData(forage.id);
  const isLegume = forage.botanicalFamily.includes('Leguminosa');
  const isSilage = forage.category === 'corte_silagem';

  // SVG Botanical Habitus Fallback / Alternative View
  const renderBotanicalHabitus = () => {
    return (
      <svg
        viewBox="0 0 320 200"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`skyGrad-${forage.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#f0fdf4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#dcfce7" stopOpacity="1" />
          </linearGradient>
          <linearGradient id={`groundGrad-${forage.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="30%" stopColor="#166534" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
          <linearGradient id={`leafGrad-${forage.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={forage.visuals.secondaryColorHex} />
            <stop offset="70%" stopColor={forage.visuals.mainColorHex} />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>
        </defs>

        <rect width="320" height="200" fill={`url(#skyGrad-${forage.id})`} />
        <circle cx="280" cy="35" r="22" fill="#fef08a" opacity="0.6" />
        <circle cx="280" cy="35" r="14" fill="#fde047" opacity="0.8" />
        <path d="M0,130 Q80,110 160,125 T320,120 L320,200 L0,200 Z" fill="#bbf7d0" opacity="0.6" />
        <path d="M0,145 Q120,135 240,150 T320,140 L320,200 L0,200 Z" fill="#86efac" opacity="0.7" />
        <rect y="165" width="320" height="35" fill={`url(#groundGrad-${forage.id})`} />
        
        <g stroke="#92400e" strokeWidth="1.2" opacity="0.7" fill="none">
          <path d="M160,170 Q150,185 140,198" />
          <path d="M160,170 Q165,185 175,198" />
          <path d="M155,170 Q145,180 130,192" />
          <path d="M165,170 Q180,182 195,195" />
          {isLegume && (
            <>
              <circle cx="150" cy="182" r="3" fill="#f43f5e" />
              <circle cx="170" cy="186" r="3.5" fill="#f43f5e" />
              <circle cx="142" cy="192" r="2.5" fill="#f43f5e" />
            </>
          )}
        </g>

        <g fill="none" stroke={`url(#leafGrad-${forage.id})`} strokeLinecap="round">
          <path d="M160,170 Q155,90 140,35" strokeWidth="4.5" />
          <path d="M160,170 Q168,85 185,45" strokeWidth="4" />
          <path d="M158,170 Q140,105 110,65" strokeWidth="3.5" />
          <path d="M162,170 Q180,110 215,75" strokeWidth="3.5" />
          <path d="M155,145 Q120,120 70,135" strokeWidth="5" stroke={`url(#leafGrad-${forage.id})`} />
          <path d="M165,140 Q200,115 250,130" strokeWidth="5" stroke={`url(#leafGrad-${forage.id})`} />
          <path d="M150,120 Q95,95 50,115" strokeWidth="4.5" stroke={`url(#leafGrad-${forage.id})`} />
          <path d="M170,115 Q225,90 270,110" strokeWidth="4.5" stroke={`url(#leafGrad-${forage.id})`} />
          <path d="M148,90 Q90,65 55,80" strokeWidth="4" stroke={`url(#leafGrad-${forage.id})`} />
          <path d="M172,85 Q230,60 265,75" strokeWidth="4" stroke={`url(#leafGrad-${forage.id})`} />
        </g>
      </svg>
    );
  };

  return (
    <div className="group bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between hover:border-emerald-500/60 dark:hover:border-emerald-500/60">
      <div>
        {/* Real Photo / Botanical Viewport Container */}
        <div className="relative h-52 w-full overflow-hidden bg-slate-950">
          {viewMode === 'photo' ? (
            <div className="relative w-full h-full cursor-pointer" onClick={() => onSelect(forage)}>
              <img
                src={photoData.primaryPhotoUrl}
                alt={`Foto real de ${forage.commonName}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            </div>
          ) : (
            <div className="w-full h-full cursor-pointer" onClick={() => onSelect(forage)}>
              {renderBotanicalHabitus()}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            </div>
          )}

          {/* Top Floating Badges */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
            {/* Real Photo Offline Tag */}
            <div className="flex items-center gap-1.5 pointer-events-auto">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-black/75 backdrop-blur-md text-emerald-400 border border-emerald-500/40 shadow-xs flex items-center gap-1">
                <Camera className="w-3 h-3 text-emerald-400" />
                FOTO REAL OFFLINE
              </span>
            </div>

            {/* View Mode Switcher Toggle */}
            <div className="flex items-center gap-1 pointer-events-auto bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/20">
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setViewMode('photo');
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  viewMode === 'photo'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Foto Real de Campo"
              >
                Foto
              </button>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setViewMode('botanical');
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  viewMode === 'botanical'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Morfologia Botânica"
              >
                Botânica
              </button>
            </div>
          </div>

          {/* Overlay Info at bottom of image */}
          <div className="absolute inset-x-0 bottom-0 p-3.5 flex items-end justify-between cursor-pointer" onClick={() => onSelect(forage)}>
            <div className="space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1 drop-shadow-sm">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>{photoData.tagLocation}</span>
              </span>
              <h4 className="text-white font-extrabold text-base leading-tight drop-shadow-sm group-hover:text-emerald-300 transition-colors">
                {forage.commonName}
              </h4>
              <p className="text-[11px] text-slate-300 italic line-clamp-1 drop-shadow-xs">
                {forage.scientificName} &bull; {forage.cultivar}
              </p>
            </div>

            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/30 shrink-0">
              {forage.category === 'graminea_tropical'
                ? 'Tropical'
                : forage.category === 'graminea_temperada'
                ? 'Inverno'
                : forage.category === 'leguminosa_tropical'
                ? 'Leguminosa'
                : 'Corte'}
            </span>
          </div>
        </div>

        {/* Nutritional & Agronomic Key Indicators */}
        <div className="p-4 space-y-3">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block uppercase">
                Proteína (PB)
              </span>
              <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                {forage.bromatology.crudeProteinPercent.average}%
              </span>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/40 p-2 rounded-xl border border-blue-100 dark:border-blue-900/50">
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block uppercase">
                Digestib.
              </span>
              <span className="text-sm font-extrabold text-blue-700 dark:text-blue-400">
                {forage.bromatology.inVitroDryMatterDigestibilityPercent.average}%
              </span>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-100 dark:border-amber-900/50">
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block uppercase">
                Prod. MS
              </span>
              <span className="text-xs font-black text-amber-700 dark:text-amber-400">
                {forage.dryMatterYieldTonHaYear.average} <span className="text-[9px] font-normal">t/ha</span>
              </span>
            </div>
          </div>

          {/* Management Heights */}
          <div className="bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
              <span className="text-slate-600 dark:text-zinc-300 font-medium">Manejo Rotacionado:</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-[11px]">
              <span className="text-emerald-600 dark:text-emerald-400" title="Altura de Entrada">
                Entrada: {forage.phenology.entryHeightRotationalCm} cm
              </span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-rose-600 dark:text-rose-400" title="Altura de Saída">
                Saída: {forage.phenology.exitHeightRotationalCm} cm
              </span>
            </div>
          </div>

          {/* Highlights & Strengths */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-zinc-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span className="line-clamp-2 leading-relaxed text-[11.5px]">
                {forage.strengthsAndWeaknesses.strengths[0]}
              </span>
            </div>

            {/* Disease Alert Preview */}
            {forage.diseasesAndPests.length > 0 && (
              <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-zinc-400">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span className="line-clamp-1 text-[11px]">
                  Atenção: {forage.diseasesAndPests[0].name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="p-3 bg-slate-50/80 dark:bg-zinc-950/80 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2">
        {onCompareToggle && (
          <button
            type="button"
            onClick={() => onCompareToggle(forage.id)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isCompared
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isCompared ? 'Comparando' : 'Comparar'}
          </button>
        )}

        <button
          type="button"
          onClick={() => onSelect(forage)}
          className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Ver Fotos & Ficha Completa</span>
          <ArrowUpRight className="w-3 h-3 ml-0.5 opacity-70" />
        </button>
      </div>
    </div>
  );
};
