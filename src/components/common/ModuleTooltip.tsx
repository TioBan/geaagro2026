import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  HelpCircle,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { MODULE_DESCRIPTIONS, ModuleDescription } from '../../data/moduleDescriptions';

interface ModuleTooltipProps {
  moduleId: string;
  targetRef: React.RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  onNavigate?: (moduleId: string, subId?: string) => void;
  subItems?: { id: string; label: string; icon?: any }[];
  placement?: 'right' | 'bottom' | 'auto';
}

export const ModuleTooltip: React.FC<ModuleTooltipProps> = ({
  moduleId,
  targetRef,
  isOpen,
  onClose,
  onOpen,
  onNavigate,
  subItems,
  placement = 'right',
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; arrowTop?: number; placement: 'right' | 'bottom' | 'left' }>({
    top: 0,
    left: 0,
    placement: 'right',
  });
  const [isMounted, setIsMounted] = useState(false);

  let description: ModuleDescription | undefined = MODULE_DESCRIPTIONS[moduleId];

  if (!description) {
    const formattedTitle = moduleId
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    description = {
      id: moduleId,
      title: formattedTitle,
      shortDescription: `Módulo agronômico e zootécnico de ${formattedTitle} com ferramentas avançadas e laudos.`,
      producerBenefit: 'Acesse indicadores e análises especializadas para orientar as decisões técnicas na propriedade.',
      producerTip: 'Navegue pelas funcionalidades do módulo para visualizar mapas, gráficos e históricos.',
      category: 'Gestão & Campo',
      highlights: (subItems && subItems.length > 0)
        ? subItems.slice(0, 3).map(s => s.label)
        : ['Acompanhamento técnico', 'Relatórios e indicadores', 'Integração com a fazenda'],
    };
  }

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Compute position relative to targetRef
  useEffect(() => {
    if (!isOpen || !targetRef.current) return;

    const updatePosition = () => {
      if (!targetRef.current) return;
      const rect = targetRef.current.getBoundingClientRect();
      const tooltipWidth = 340;
      const tooltipHeight = 320; // Estimated height for boundary clamping
      const padding = 12;

      let calculatedPlacement: 'right' | 'bottom' | 'left' = 'right';
      let left = rect.right + padding;
      let top = rect.top + rect.height / 2 - 40; // Align slightly above center
      let arrowTop = 40;

      // If opening to the right overflows the viewport, flip to bottom or left
      if (left + tooltipWidth > window.innerWidth - padding) {
        if (rect.left > tooltipWidth + padding) {
          calculatedPlacement = 'left';
          left = rect.left - tooltipWidth - padding;
        } else {
          calculatedPlacement = 'bottom';
          left = Math.max(padding, Math.min(rect.left, window.innerWidth - tooltipWidth - padding));
          top = rect.bottom + padding;
        }
      }

      // Clamp vertical bounds so tooltip never flows outside top or bottom screen
      if (top < padding) {
        const diff = padding - top;
        top = padding;
        arrowTop = Math.max(16, arrowTop - diff);
      } else if (top + tooltipHeight > window.innerHeight - padding) {
        const overflow = top + tooltipHeight - (window.innerHeight - padding);
        top = Math.max(padding, top - overflow);
        arrowTop = Math.min(tooltipHeight - 24, arrowTop + overflow);
      }

      setCoords({
        top,
        left,
        arrowTop,
        placement: calculatedPlacement,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, targetRef]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !isMounted || !description) {
    return null;
  }

  const content = (
    <div
      ref={tooltipRef}
      role="tooltip"
      aria-label={`Guia do módulo ${description.title}`}
      onMouseEnter={() => {
        onOpen?.();
      }}
      onMouseLeave={() => {
        onClose();
      }}
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        width: '340px',
        zIndex: 99999,
      }}
      className="pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-150 ease-out select-none"
    >
      {/* Decorative pointer arrow */}
      {coords.placement === 'right' && (
        <div
          style={{ top: `${coords.arrowTop || 40}px` }}
          className="absolute -left-2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white dark:border-r-zinc-900 drop-shadow-xs"
        />
      )}
      {coords.placement === 'left' && (
        <div
          style={{ top: `${coords.arrowTop || 40}px` }}
          className="absolute -right-2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-white dark:border-l-zinc-900 drop-shadow-xs"
        />
      )}

      {/* Main Tooltip Card */}
      <div className="bg-white/98 dark:bg-zinc-900/98 backdrop-blur-md rounded-2xl border border-emerald-500/25 dark:border-emerald-500/20 shadow-2xl shadow-emerald-950/20 p-4 text-slate-800 dark:text-zinc-100 overflow-hidden relative">
        {/* Subtle top accent gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

        {/* Header: Title + Category badge + Help icon */}
        <div className="flex items-start justify-between gap-2 mb-2 pt-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <Compass className="w-2.5 h-2.5" />
                {description.category}
              </span>
              {description.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60">
                  {description.badge}
                </span>
              )}
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1.5 tracking-tight flex items-center gap-1.5">
              <span>{description.title}</span>
            </h4>
          </div>
          <span className="shrink-0 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 p-1.5 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-normal mb-3">
          {description.shortDescription}
        </p>

        {/* Direct Producer Benefit Box */}
        <div className="bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl p-2.5 border border-emerald-200/70 dark:border-emerald-900/50 mb-2.5 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
              Ganho para o Produtor:
            </span>
            <p className="text-[11px] text-emerald-950 dark:text-emerald-200 font-medium leading-snug mt-0.5">
              {description.producerBenefit}
            </p>
          </div>
        </div>

        {/* Pro Tip from Agro Specialist */}
        <div className="bg-amber-50/80 dark:bg-amber-950/30 rounded-xl p-2.5 border border-amber-200/70 dark:border-amber-900/50 mb-3 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
              💡 Dica Prática de Campo:
            </span>
            <p className="text-[11px] text-amber-950 dark:text-amber-200 font-medium leading-snug mt-0.5">
              {description.producerTip}
            </p>
          </div>
        </div>

        {/* Highlights List */}
        {description.highlights && description.highlights.length > 0 && (
          <div className="mb-3">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">
              Recursos Principais:
            </span>
            <div className="grid grid-cols-1 gap-1">
              {description.highlights.map((highlight, index) => (
                <div key={index} className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Navigate Button / Sub-items preview */}
        {onNavigate && (
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
            {subItems && subItems.length > 0 ? (
              <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-zinc-500">
                <span>{subItems.length} ferramentas internas</span>
              </div>
            ) : (
              <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                Clique para abrir
              </span>
            )}

            <button
              type="button"
              onClick={() => {
                onNavigate(moduleId);
                onClose();
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 ml-auto"
            >
              <span>Abrir Módulo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
