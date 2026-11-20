import { IrrigationSystemType } from '../../types/irrigation';

export const IRRIGATION_INPUT_CLASS =
  'w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 tabular-nums disabled:opacity-50';

export const IRRIGATION_LABEL_CLASS =
  'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const IRRIGATION_SYSTEM_TYPES: IrrigationSystemType[] = [
  'Pivô Central',
  'Pivô Reboque',
  'Linear',
  'Aspersão Convencional',
  'Aspersão Canhão',
  'Gotejamento Superficial',
  'Gotejamento Subsuperficial (SDI)',
  'Microaspersão',
  'Inundação / Tabuleiros',
  'Sulcos de Irrigação',
];

/** Safely format YYYY-MM-DD strings without local timezone shift. */
export function formatBrDate(isoDate: string): string {
  if (!isoDate) return '—';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString('pt-BR');
}
