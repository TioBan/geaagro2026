import React, { useState } from 'react';
import { ForageItem } from '../../types/forage';
import { getForagePhotoData } from '../../data/foragePhotosDatabase';
import { Eye, Scale, Check, AlertTriangle, Camera, Leaf } from 'lucide-react';

interface ForagePhotoCardProps {
  forage: ForageItem;
  onSelectForage: (forage: ForageItem) => void;
  isSelectedForCompare?: boolean;
  onToggleCompare?: (forage: ForageItem) => void;
}

const CATEGORY_LABELS: Record<ForageItem['category'], string> = {
  graminea_tropical: 'Gramínea Tropical',
  corte_silagem: 'Corte & Silagem',
  graminea_temperada: 'Inverno / Temperada',
  leguminosa_tropical: 'Leguminosa',
  leguminosa_temperada: 'Leguminosa Temperada',
};

const SUSCEPTIBILITY_LABELS: Record<string, string> = {
  alta: 'Alta',
  moderada: 'Moderada',
  tolerante: 'Tolerante',
  resistente: 'Resistente',
};

const ForageBotanicalIllustration: React.FC<{ forage: ForageItem }> = ({ forage }) => {
  const { mainColorHex, secondaryColorHex } = forage.visuals;
  const habit = forage.phenology.growthHabit;

  return (
    <svg
      viewBox="0 0 400 220"
      className="w-full h-full object-cover"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Ilustração botânica de ${forage.commonName}`}
    >
      <defs>
        <linearGradient id={`bg-${forage.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={mainColorHex} stopOpacity="0.92" />
          <stop offset="58%" stopColor={secondaryColorHex} stopOpacity="0.88" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={`soil-${forage.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b2615" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#1e130b" stopOpacity="0.98" />
        </linearGradient>
      </defs>

      <rect width="400" height="220" fill={`url(#bg-${forage.id})`} />
      <circle cx="330" cy="45" r="52" fill={secondaryColorHex} opacity="0.18" />
      <rect x="0" y="176" width="400" height="44" fill={`url(#soil-${forage.id})`} />

      {habit === 'ereta_porte_alto' ? (
        <g strokeLinecap="round">
          {[100, 155, 210, 265, 310].map(x => (
            <g key={x}>
              <line x1={x} y1="184" x2={x - 4} y2="28" stroke="#a3e635" strokeWidth="9" />
              <line x1={x - 5} y1="142" x2={x + 5} y2="142" stroke="#365314" strokeWidth="2.5" />
              <line x1={x - 5} y1="100" x2={x + 5} y2="100" stroke="#365314" strokeWidth="2.5" />
              <line x1={x - 5} y1="60" x2={x + 5} y2="60" stroke="#365314" strokeWidth="2.5" />
              <path d={`M${x} 110 Q${x - 42} 84 ${x - 72} 102`} stroke="#bef264" strokeWidth="5" fill="none" />
              <path d={`M${x} 76 Q${x + 42} 50 ${x + 70} 70`} stroke="#bef264" strokeWidth="5" fill="none" />
            </g>
          ))}
        </g>
      ) : habit === 'estolonifera' || habit === 'prostrada_decumbente' ? (
        <g stroke="#bef264" strokeLinecap="round" fill="none">
          <path d="M24 176 Q110 156 205 174 T385 168" strokeWidth="5" stroke="#84cc16" />
          {[55, 95, 140, 185, 235, 285, 330].map((x, idx) => (
            <g key={x}>
              <path
                d={`M${x} 174 Q${x - 16} 118 ${x - 28} 82`}
                strokeWidth="4.5"
                stroke={idx % 2 === 0 ? '#a3e635' : '#bef264'}
              />
              <path d={`M${x} 174 Q${x + 14} 122 ${x + 26} 88`} strokeWidth="4" />
            </g>
          ))}
        </g>
      ) : habit === 'arbustiva_ereta' || forage.botanicalFamily === 'Fabaceae (Leguminosa)' ? (
        <g>
          <path d="M55 178 Q180 120 335 162" stroke="#65a30d" strokeWidth="5" fill="none" />
          {[90, 150, 210, 270, 325].map((x, idx) => (
            <g key={x} transform={`translate(${x}, ${118 - (idx % 2) * 18})`}>
              <ellipse cx="-11" cy="-9" rx="13" ry="8" fill="#84cc16" transform="rotate(-28)" />
              <ellipse cx="11" cy="-9" rx="13" ry="8" fill="#84cc16" transform="rotate(28)" />
              <ellipse cx="0" cy="-21" rx="9" ry="13" fill="#bef264" />
              {idx % 2 === 1 && <circle cx="0" cy="-35" r="6" fill="#facc15" />}
            </g>
          ))}
        </g>
      ) : (
        <g stroke="#bef264" strokeLinecap="round" fill="none">
          <path d="M120 182 Q100 102 68 38" strokeWidth="5.5" />
          <path d="M125 182 Q120 96 112 22" strokeWidth="6.5" />
          <path d="M130 182 Q150 92 178 32" strokeWidth="5.5" />
          <path d="M260 182 Q232 104 205 42" strokeWidth="5.5" />
          <path d="M266 182 Q268 88 274 20" strokeWidth="7" />
          <path d="M272 182 Q296 96 334 38" strokeWidth="5.5" />
          <ellipse cx="112" cy="22" rx="7" ry="15" fill="#fde68a" stroke="none" opacity="0.85" />
          <ellipse cx="274" cy="20" rx="8" ry="17" fill="#fef08a" stroke="none" opacity="0.85" />
        </g>
      )}
    </svg>
  );
};

export const ForagePhotoCard: React.FC<ForagePhotoCardProps> = React.memo(
  ({ forage, onSelectForage, isSelectedForCompare = false, onToggleCompare }) => {
    const [viewMode, setViewMode] = useState<'photo' | 'botanical'>('photo');
    const [imgError, setImgError] = useState(false);

    const photoData = getForagePhotoData(forage.id);
    const showPhoto = viewMode === 'photo' && !imgError;

    const firstStrength = forage.strengthsAndWeaknesses.strengths[0];
    const primaryDisease = forage.diseasesAndPests[0];

    return (
      <article
        className={`group bg-white dark:bg-zinc-900 rounded-xl border transition-colors flex flex-col overflow-hidden ${
          isSelectedForCompare
            ? 'border-emerald-500 dark:border-emerald-500/80 ring-1 ring-emerald-500/20'
            : 'border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
        }`}
      >
        {/* Compact Media Header */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelectForage(forage)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectForage(forage);
            }
          }}
          className="relative h-40 w-full overflow-hidden bg-slate-900 cursor-pointer shrink-0 focus:outline-none"
        >
          {showPhoto ? (
            <img
              src={photoData.primaryPhotoUrl}
              alt={`${forage.commonName} (${forage.scientificName})`}
              loading="lazy"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <ForageBotanicalIllustration forage={forage} />
          )}

          {/* Measured Contrast Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20 pointer-events-none" />

          {/* Top Bar: Category Label + View Switch */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-2">
            <span className="px-2 py-0.5 rounded-md bg-black/55 backdrop-blur-xs text-[10px] font-medium text-white/95 tracking-wide">
              {CATEGORY_LABELS[forage.category]}
            </span>

            <div
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center rounded-md bg-black/55 backdrop-blur-xs p-0.5 border border-white/10"
            >
              <button
                type="button"
                onClick={() => {
                  setImgError(false);
                  setViewMode('photo');
                }}
                aria-label="Ver foto real"
                title="Foto real"
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                  viewMode === 'photo'
                    ? 'bg-white text-slate-900'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Camera className="w-2.5 h-2.5" />
                <span>Foto</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('botanical')}
                aria-label="Ver esquema botânico"
                title="Esquema botânico"
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                  viewMode === 'botanical'
                    ? 'bg-white text-slate-900'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Leaf className="w-2.5 h-2.5" />
                <span>Botânica</span>
              </button>
            </div>
          </div>

          {/* Bottom Title Overlay */}
          <div className="absolute bottom-2.5 inset-x-3">
            <h3 className="text-sm font-semibold text-white leading-snug line-clamp-1">
              {forage.commonName}
            </h3>
            <p className="text-[11px] text-white/80 italic line-clamp-1">
              {forage.scientificName} · cv. {forage.cultivar}
            </p>
          </div>
        </div>

        {/* Hairline 3-Column Metric Strip */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-zinc-800 border-b border-slate-100 dark:border-zinc-800 text-center">
          <div className="py-2 px-1.5">
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              PB Média
            </span>
            <span className="block text-xs font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums mt-0.5">
              {forage.bromatology.crudeProteinPercent.average}%
            </span>
          </div>
          <div className="py-2 px-1.5">
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              DIVMS
            </span>
            <span className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 tabular-nums mt-0.5">
              {forage.bromatology.inVitroDryMatterDigestibilityPercent.average}%
            </span>
          </div>
          <div className="py-2 px-1.5">
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              MS t/ha
            </span>
            <span className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 tabular-nums mt-0.5">
              {forage.dryMatterYieldTonHaYear.min}–{forage.dryMatterYieldTonHaYear.max}
            </span>
          </div>
        </div>

        {/* Compact Agronomic Summary */}
        <div className="p-3 flex-1 flex flex-col justify-between gap-2.5">
          <div className="space-y-2">
            {/* Rotational Heights Line */}
            <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-zinc-400 pb-2 border-b border-slate-100 dark:border-zinc-800/80">
              <span>Manejo Rotacionado</span>
              <span className="tabular-nums font-medium text-slate-800 dark:text-zinc-200">
                Entrada{' '}
                <strong className="text-emerald-700 dark:text-emerald-400">
                  {forage.phenology.entryHeightRotationalCm} cm
                </strong>
                <span className="mx-1.5 text-slate-300 dark:text-zinc-700">·</span>
                Saída <strong>{forage.phenology.exitHeightRotationalCm} cm</strong>
              </span>
            </div>

            {/* Highlight & Sanitary Note */}
            <div className="space-y-1 text-[11px] leading-relaxed">
              {firstStrength && (
                <p className="text-slate-600 dark:text-zinc-300 line-clamp-1 flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{firstStrength}</span>
                </p>
              )}
              {primaryDisease && (
                <p className="text-slate-500 dark:text-zinc-400 line-clamp-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="truncate">
                    {primaryDisease.name} (
                    {SUSCEPTIBILITY_LABELS[primaryDisease.susceptibilityLevel] ||
                      primaryDisease.susceptibilityLevel}
                    )
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Compact Footer Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            {onToggleCompare && (
              <button
                type="button"
                onClick={() => onToggleCompare(forage)}
                className={`h-8 flex-1 px-2.5 rounded-lg text-xs font-medium inline-flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                  isSelectedForCompare
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500/60 text-emerald-700 dark:text-emerald-300'
                    : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
              >
                {isSelectedForCompare ? (
                  <>
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>Na Comparação</span>
                  </>
                ) : (
                  <>
                    <Scale className="w-3.5 h-3.5 shrink-0" />
                    <span>Comparar</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => onSelectForage(forage)}
              className="h-8 flex-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span>Ver Ficha</span>
            </button>
          </div>
        </div>
      </article>
    );
  }
);

ForagePhotoCard.displayName = 'ForagePhotoCard';
