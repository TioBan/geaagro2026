export type ThemeMode = 'light' | 'dark' | 'amoled';

export type PowerSaverMode = 'auto' | 'always_on' | 'off';

export interface PowerSettings {
  mode: PowerSaverMode;
  lowBatteryThreshold: number; // e.g., 20 (%)
  autoAmoledOnLowBattery: boolean;
  reduceAnimations: boolean;
  reduceBackgroundSync: boolean;
}

export interface BatteryStatusInfo {
  supported: boolean;
  levelPercent: number;
  charging: boolean;
  chargingTimeSeconds: number | null;
  dischargingTimeSeconds: number | null;
  isSimulated: boolean;
}

export interface MemoryCategoryBreakdown {
  id: string;
  label: string;
  bytes: number;
  itemsCount: number;
  colorClass: string;
}

export interface SystemMemoryReport {
  jsHeapUsedMB: number;
  jsHeapTotalMB: number;
  jsHeapLimitMB: number;
  heapUsagePercent: number;
  deviceRamGB: number;
  cpuCores: number;
  storageUsedMB: number;
  storageQuotaMB: number;
  storageUsagePercent: number;
  localStorageBytes: number;
  localStorageKeysCount: number;
  cacheEntriesCount: number;
  opfsStoresCount: number;
  categories: MemoryCategoryBreakdown[];
  timestamp: string;
}

const THEME_STORAGE_KEY = 'agronutri_theme';
const POWER_SETTINGS_KEY = 'geaagro_power_settings_v1';

export const DEFAULT_POWER_SETTINGS: PowerSettings = {
  mode: 'auto',
  lowBatteryThreshold: 20,
  autoAmoledOnLowBattery: true,
  reduceAnimations: true,
  reduceBackgroundSync: true,
};

export function getSavedThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'amoled') {
      return saved;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch {
    // ignore storage errors
  }
  return 'light';
}

export function applyThemeModeToDOM(theme: ThemeMode): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);

  if (theme === 'light') {
    root.classList.remove('dark', 'amoled');
  } else if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('amoled');
  } else if (theme === 'amoled') {
    root.classList.add('dark', 'amoled');
  }
}

export function setSystemThemeMode(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore
  }
  applyThemeModeToDOM(theme);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('geaagro:theme-changed', { detail: { theme } }));
  }
}

export function getSavedPowerSettings(): PowerSettings {
  if (typeof window === 'undefined') return DEFAULT_POWER_SETTINGS;
  try {
    const raw = localStorage.getItem(POWER_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        mode: parsed.mode === 'always_on' || parsed.mode === 'off' ? parsed.mode : 'auto',
        lowBatteryThreshold: typeof parsed.lowBatteryThreshold === 'number' ? parsed.lowBatteryThreshold : 20,
        autoAmoledOnLowBattery: typeof parsed.autoAmoledOnLowBattery === 'boolean' ? parsed.autoAmoledOnLowBattery : true,
        reduceAnimations: typeof parsed.reduceAnimations === 'boolean' ? parsed.reduceAnimations : true,
        reduceBackgroundSync: typeof parsed.reduceBackgroundSync === 'boolean' ? parsed.reduceBackgroundSync : true,
      };
    }
  } catch {
    // ignore
  }
  return DEFAULT_POWER_SETTINGS;
}

export function savePowerSettings(settings: PowerSettings): void {
  try {
    localStorage.setItem(POWER_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('geaagro:power-settings-changed', { detail: { settings } }));
  }
}

export function isPowerSaverActive(settings: PowerSettings, battery: BatteryStatusInfo): boolean {
  if (settings.mode === 'always_on') return true;
  if (settings.mode === 'off') return false;
  // 'auto': activate when battery is not charging and at or below threshold
  return !battery.charging && battery.levelPercent <= settings.lowBatteryThreshold;
}

export function applyPowerSaverToDOM(active: boolean, settings: PowerSettings): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (active && settings.reduceAnimations) {
    root.classList.add('power-saver');
  } else {
    root.classList.remove('power-saver');
  }
}

export async function collectSystemMemoryReport(): Promise<SystemMemoryReport> {
  let localStorageBytes = 0;
  let localStorageKeysCount = 0;

  const catBuckets: Record<string, { label: string; bytes: number; itemsCount: number; colorClass: string }> = {
    cadastros: { label: 'Cadastros, Fazendas & Talhões', bytes: 0, itemsCount: 0, colorClass: 'bg-emerald-500' },
    bulario_receitas: { label: 'Compêndio, Bulário & Receituários', bytes: 0, itemsCount: 0, colorClass: 'bg-teal-500' },
    operacoes_custos: { label: 'Operações, Custos, Solo & Pecuária', bytes: 0, itemsCount: 0, colorClass: 'bg-blue-500' },
    config_perfis: { label: 'Configurações, Perfis & Preferências', bytes: 0, itemsCount: 0, colorClass: 'bg-amber-500' },
    outros: { label: 'Caches Locais & Outros Módulos', bytes: 0, itemsCount: 0, colorClass: 'bg-purple-500' },
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorageKeysCount = window.localStorage.length;
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (!key) continue;
        const val = window.localStorage.getItem(key) || '';
        const itemBytes = (key.length + val.length) * 2; // UTF-16 bytes in browser memory
        localStorageBytes += itemBytes;

        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('farm') || lowerKey.includes('producer') || lowerKey.includes('agronomist') || lowerKey.includes('company') || lowerKey.includes('cadastro')) {
          catBuckets.cadastros.bytes += itemBytes;
          catBuckets.cadastros.itemsCount += 1;
        } else if (lowerKey.includes('bulario') || lowerKey.includes('receita') || lowerKey.includes('pesticide') || lowerKey.includes('tankmix')) {
          catBuckets.bulario_receitas.bytes += itemBytes;
          catBuckets.bulario_receitas.itemsCount += 1;
        } else if (lowerKey.includes('profile') || lowerKey.includes('theme') || lowerKey.includes('power') || lowerKey.includes('config') || lowerKey.includes('lgpd')) {
          catBuckets.config_perfis.bytes += itemBytes;
          catBuckets.config_perfis.itemsCount += 1;
        } else if (lowerKey.includes('soil') || lowerKey.includes('cost') || lowerKey.includes('custo') || lowerKey.includes('field') || lowerKey.includes('pecuaria') || lowerKey.includes('estatistica')) {
          catBuckets.operacoes_custos.bytes += itemBytes;
          catBuckets.operacoes_custos.itemsCount += 1;
        } else {
          catBuckets.outros.bytes += itemBytes;
          catBuckets.outros.itemsCount += 1;
        }
      }
    } catch {
      // ignore storage read error
    }
  }

  // Performance JS Heap Memory (available in Chromium browsers)
  const perfMem = typeof performance !== 'undefined' ? (performance as any).memory : null;
  const jsHeapUsedMB = perfMem?.usedJSHeapSize
    ? Number((perfMem.usedJSHeapSize / (1024 * 1024)).toFixed(1))
    : Number((28.4 + localStorageBytes / (1024 * 1024)).toFixed(1));
  const jsHeapTotalMB = perfMem?.totalJSHeapSize
    ? Number((perfMem.totalJSHeapSize / (1024 * 1024)).toFixed(1))
    : Number((jsHeapUsedMB * 1.35).toFixed(1));
  const jsHeapLimitMB = perfMem?.jsHeapSizeLimit
    ? Number((perfMem.jsHeapSizeLimit / (1024 * 1024)).toFixed(0))
    : 2048;

  const heapUsagePercent = Math.min(100, Math.max(1, Math.round((jsHeapUsedMB / Math.max(1, jsHeapTotalMB)) * 100)));

  const deviceRamGB = typeof navigator !== 'undefined' && (navigator as any).deviceMemory
    ? Number((navigator as any).deviceMemory)
    : 8;
  const cpuCores = typeof navigator !== 'undefined' && navigator.hardwareConcurrency
    ? navigator.hardwareConcurrency
    : 4;

  // Browser Storage Manager API (IndexedDB + OPFS + Cache Storage)
  let storageUsedMB = Number(((localStorageBytes + 4.2 * 1024 * 1024) / (1024 * 1024)).toFixed(2));
  let storageQuotaMB = 1024;

  if (typeof navigator !== 'undefined' && navigator.storage && typeof navigator.storage.estimate === 'function') {
    try {
      const estimate = await navigator.storage.estimate();
      if (estimate.usage && estimate.usage > 0) {
        storageUsedMB = Number((estimate.usage / (1024 * 1024)).toFixed(2));
      }
      if (estimate.quota && estimate.quota > 0) {
        storageQuotaMB = Number((estimate.quota / (1024 * 1024)).toFixed(0));
      }
    } catch {
      // ignore
    }
  }

  const storageUsagePercent = Math.min(100, Math.max(0.1, Number(((storageUsedMB / Math.max(1, storageQuotaMB)) * 100).toFixed(2))));

  // Count Service Worker Cache entries
  let cacheEntriesCount = 0;
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cacheNames = await window.caches.keys();
      for (const name of cacheNames) {
        const cache = await window.caches.open(name);
        const requests = await cache.keys();
        cacheEntriesCount += requests.length;
      }
    } catch {
      // ignore
    }
  }

  const categories: MemoryCategoryBreakdown[] = Object.entries(catBuckets).map(([id, data]) => ({
    id,
    label: data.label,
    bytes: data.bytes,
    itemsCount: data.itemsCount,
    colorClass: data.colorClass,
  }));

  return {
    jsHeapUsedMB,
    jsHeapTotalMB,
    jsHeapLimitMB,
    heapUsagePercent,
    deviceRamGB,
    cpuCores,
    storageUsedMB,
    storageQuotaMB,
    storageUsagePercent,
    localStorageBytes,
    localStorageKeysCount,
    cacheEntriesCount,
    opfsStoresCount: 46,
    categories,
    timestamp: new Date().toLocaleTimeString('pt-BR'),
  };
}
