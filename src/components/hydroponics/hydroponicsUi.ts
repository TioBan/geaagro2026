import {
  HydroponicBench,
  HydroponicCropCategory,
  HydroponicNutrientRecipe,
  HydroponicSystemType,
  NutrientSolutionReservoir,
} from '../../types/hydroponics';

export const HYDRO_INPUT_CLASS =
  'w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors';

export const HYDRO_TEXTAREA_CLASS =
  'w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors';

export const HYDRO_LABEL_CLASS =
  'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const HYDRO_SYSTEM_LABELS: Record<HydroponicSystemType, string> = {
  NFT: 'NFT (Lâmina Fina)',
  DFT: 'DFT (Floating / Piscina)',
  Substrato_Gotejo: 'Substrato + Gotejo',
  Aeroponia: 'Aeroponia',
};

export const HYDRO_CROP_CATEGORIES: { value: HydroponicCropCategory; label: string }[] = [
  { value: 'folhosa', label: 'Folhosa' },
  { value: 'erva_condimento', label: 'Erva / Condimento' },
  { value: 'fruto', label: 'Fruto' },
  { value: 'fruta', label: 'Fruta' },
];

export const BENCH_STATUS_META: Record<
  HydroponicBench['status'],
  { label: string; textClass: string; dotClass: string }
> = {
  vazia: {
    label: 'Vazia',
    textClass: 'text-slate-500 dark:text-zinc-400',
    dotClass: 'bg-slate-400',
  },
  maternidade: {
    label: 'Berçário',
    textClass: 'text-amber-700 dark:text-amber-400',
    dotClass: 'bg-amber-500',
  },
  desenvolvimento: {
    label: 'Desenvolvimento',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    dotClass: 'bg-emerald-500',
  },
  pronto_colheita: {
    label: 'Pronto p/ Colheita',
    textClass: 'text-sky-700 dark:text-sky-400',
    dotClass: 'bg-sky-500',
  },
};

export const PUMP_STATUS_META: Record<
  NutrientSolutionReservoir['pumpStatus'],
  { label: string; textClass: string }
> = {
  ligada: { label: 'Ligada', textClass: 'text-emerald-700 dark:text-emerald-400' },
  timer: { label: 'Timer automático', textClass: 'text-sky-700 dark:text-sky-400' },
  em_espera: { label: 'Em espera', textClass: 'text-slate-600 dark:text-zinc-400' },
  alerta: { label: 'Em alerta', textClass: 'text-rose-700 dark:text-rose-400' },
};

export function getTodayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getCurrentTimeHHMM(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

/** Timezone-safe formatter for YYYY-MM-DD strings (passes through already-formatted DD/MM/YYYY). */
export function formatBrDate(value?: string): string {
  if (!value) return '—';
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }
  return value;
}

export function calculateVpdKpa(airTempC: number, rhPercent: number): number {
  if (airTempC <= 0 || rhPercent <= 0) return 0;
  const svp = 0.6108 * Math.exp((17.27 * airTempC) / (airTempC + 237.3));
  const vpd = svp * (1 - Math.min(100, Math.max(0, rhPercent)) / 100);
  return Number(vpd.toFixed(2));
}

export type SimulatorPhase = 'bercario' | 'desenvolvimento_engorda' | 'frutificacao';

export function calculateHydroponicFertilizers(
  recipe: HydroponicNutrientRecipe,
  volumeLiters: number,
  phase: SimulatorPhase = 'desenvolvimento_engorda'
) {
  const safeVolume = Math.max(10, Number(volumeLiters) || 100);
  const phaseMultiplier =
    phase === 'bercario'
      ? 0.5
      : phase === 'frutificacao'
      ? recipe.stage === 'frutificacao'
        ? 1.0
        : 1.15
      : 1.0;

  const factor = (safeVolume / 1000) * phaseMultiplier;
  const base = recipe.fertilizerStockGramsPer1000L;

  const tankA = {
    calciumNitrate: Math.round(base.calciumNitrate * factor),
    ironChelateEDDHA: Math.round(base.ironChelateEDDHA * factor),
  };

  const tankB = {
    potassiumNitrate: Math.round(base.potassiumNitrate * factor),
    monopotassiumPhosphate: Math.round(base.monopotassiumPhosphate * factor),
    magnesiumSulfate: Math.round(base.magnesiumSulfate * factor),
    micronutrients: Math.round(base.micronutrientsConMicros * factor),
  };

  const tankATotal = tankA.calciumNitrate + tankA.ironChelateEDDHA;
  const tankBTotal =
    tankB.potassiumNitrate +
    tankB.monopotassiumPhosphate +
    tankB.magnesiumSulfate +
    tankB.micronutrients;

  return {
    phaseMultiplier,
    tankA,
    tankB,
    tankATotal,
    tankBTotal,
    totalGrams: tankATotal + tankBTotal,
  };
}
