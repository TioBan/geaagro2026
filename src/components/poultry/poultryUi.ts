import { useEffect } from 'react';
import { EnvironmentRecord, IEA_Result, PoultryBiosecurityCheck, PoultryTab } from '../../types/poultry';

export const POULTRY_INPUT_CLASS =
  'w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-colors';

export const POULTRY_TEXTAREA_CLASS =
  'w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-colors';

export const POULTRY_LABEL_CLASS =
  'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const POULTRY_CARD_CLASS =
  'bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800';

export const POULTRY_SUBCARD_CLASS =
  'bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800';

export const POULTRY_PRIMARY_BTN_CLASS =
  'inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0';

export const POULTRY_SECONDARY_BTN_CLASS =
  'inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0';

const VALID_POULTRY_TABS: ReadonlySet<PoultryTab> = new Set<PoultryTab>([
  'dashboard',
  'lote_twin',
  'galpao_twin',
  'ambiente',
  'nutricao',
  'agua',
  'pesagem',
  'sanidade',
  'banco_doencas',
  'biosseguridade',
  'producao',
  'rastreabilidade',
]);

export function normalizePoultryTab(tab?: string): PoultryTab {
  if (!tab) return 'dashboard';
  if (VALID_POULTRY_TABS.has(tab as PoultryTab)) {
    return tab as PoultryTab;
  }
  return 'dashboard';
}

export function getTodayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatBrDate(value?: string): string {
  if (!value) return '—';
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }
  return value;
}

export function getBatchAgeDays(housingDate?: string): number {
  if (!housingDate) return 0;
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(housingDate.trim());
  if (!isoMatch) return 0;
  const start = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

export function calculatePoultryItu(tempC: number, humidityPct: number): number {
  if (!Number.isFinite(tempC) || !Number.isFinite(humidityPct)) return 0;
  return Number((0.8 * tempC + (humidityPct / 100) * (tempC - 14.4) + 46.4).toFixed(1));
}

export function getEnvironmentComfortStatus(record: EnvironmentRecord): {
  label: string;
  badgeClass: string;
} {
  if (record.ammonia > 20 || record.co2 > 3000) {
    return {
      label: 'Gases Elevados',
      badgeClass:
        'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
    };
  }
  const itu = calculatePoultryItu(record.temperature, record.humidity);
  if (itu >= 78 || record.temperature > 33) {
    return {
      label: 'Alerta Calor',
      badgeClass:
        'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    };
  }
  if (record.temperature < 18) {
    return {
      label: 'Alerta Frio',
      badgeClass:
        'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800',
    };
  }
  return {
    label: 'Conforto Ótimo',
    badgeClass:
      'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
  };
}

export function getIeaBadgeClass(status: IEA_Result['status']): string {
  switch (status) {
    case 'Excelente':
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
    case 'Bom':
      return 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800';
    case 'Atenção':
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
    default:
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
  }
}

export function getBiosecurityBadgeClass(status: PoultryBiosecurityCheck['status']): string {
  switch (status) {
    case 'Conforme':
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
    case 'Pendente':
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
    default:
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
  }
}

export function useEscapeClose(isOpen: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
}
