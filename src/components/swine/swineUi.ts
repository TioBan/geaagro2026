import { useEffect } from 'react';
import {
  ProductionStage,
  SwineBiosecurityLog,
  SwineDiseaseInfo,
  SwineShedEnvironment,
  SwineStatus,
  SwineTab,
  SwineWaterPointCheck,
} from '../../types/swine';

export const SWINE_INPUT_CLASS =
  'w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-colors';

export const SWINE_TEXTAREA_CLASS =
  'w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-colors';

export const SWINE_LABEL_CLASS =
  'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const SWINE_CARD_CLASS =
  'bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800';

export const SWINE_SUBCARD_CLASS =
  'bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800';

export const SWINE_PRIMARY_BTN_CLASS =
  'inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50';

export const SWINE_SECONDARY_BTN_CLASS =
  'inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50';

export const SWINE_STAGE_LABELS: Record<ProductionStage, string> = {
  reproducao: 'Reprodução',
  gestacao: 'Gestação',
  maternidade: 'Maternidade',
  creche: 'Creche',
  crescimento: 'Crescimento',
  terminacao: 'Terminação',
  comercializacao: 'Comercialização',
};

export const SWINE_TAB_ALIAS_MAP: Record<string, SwineTab> = {
  dashboard: 'dashboard',
  flow_pipeline: 'flow_pipeline',
  animals: 'animals',
  biometria: 'animals',
  digital_twin: 'digital_twin',
  reproduction: 'reproduction',
  gestacao: 'reproduction',
  maternity: 'maternity',
  maternidade: 'maternity',
  nursery: 'nursery',
  creche: 'nursery',
  grow_finish: 'grow_finish',
  terminacao: 'grow_finish',
  nutrition: 'nutrition',
  nutricao: 'nutrition',
  water: 'water',
  environment: 'environment',
  health: 'health',
  sanidade: 'health',
  diseases: 'diseases_lib',
  diseases_lib: 'diseases_lib',
  guia_enfermidades: 'diseases_lib',
  biosecurity: 'biosecurity',
  inventory: 'inventory',
  photo_diary: 'photo_diary',
  ies_score: 'ies_score',
  reports: 'reports',
  relatorios: 'reports',
  gea_suite: 'suite_integration',
  suite_integration: 'suite_integration',
};

export function normalizeSwineTab(tab?: string): SwineTab {
  if (!tab) return 'dashboard';
  return SWINE_TAB_ALIAS_MAP[tab] ?? 'dashboard';
}

export function getTodayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysIsoDate(baseIso: string, days: number): string {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(baseIso.trim());
  const d = parts
    ? new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
    : new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Timezone-safe formatter for YYYY-MM-DD strings. */
export function formatBrDate(value?: string): string {
  if (!value) return '—';
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }
  return value;
}

export function formatCurrencyBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function getSwineStatusBadgeClass(status: SwineStatus): string {
  switch (status) {
    case 'Gestante':
    case 'Em Cobertura / IA':
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
    case 'Em Lactação':
      return 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800';
    case 'Ativo':
    case 'Pronto para Abate':
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
    case 'Tratamento / Enfermaria':
    case 'Quarentena':
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
    case 'Morto':
      return 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800';
    default:
      return 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700';
  }
}

export function getComfortBadgeClass(status: SwineShedEnvironment['comfortStatus']): string {
  switch (status) {
    case 'Conforto Ótimo':
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
    case 'Alerta Calor':
    case 'Gases Elevados':
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
    case 'Alerta Frio':
      return 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800';
    default:
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
  }
}

export function getWaterFlowBadgeClass(status: SwineWaterPointCheck['flowStatus']): string {
  switch (status) {
    case 'Adequado':
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
    case 'Vazão Baixa':
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
    default:
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
  }
}

export function getBiosecurityBadgeClass(status: SwineBiosecurityLog['status']): string {
  switch (status) {
    case 'Conforme':
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
    case 'Não Conforme / Advertência':
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
    default:
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
  }
}

export function getDiseaseSeverityBadgeClass(severity: SwineDiseaseInfo['severity']): string {
  if (severity.startsWith('Muito Alta')) {
    return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
  }
  if (severity === 'Alta') {
    return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
  }
  return 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800';
}

export function calculateItu(tempC: number, rhPct: number): number {
  if (!Number.isFinite(tempC) || !Number.isFinite(rhPct)) return 0;
  return Number((0.8 * tempC + (rhPct / 100) * (tempC - 14.4) + 46.4).toFixed(1));
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
