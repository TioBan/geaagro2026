import { useState, useEffect, useCallback } from 'react';
import { formatBytes } from '../utils/backupService';

export interface StorageEstimateResult {
  usage: number;
  quota: number;
  available: number;
  usedFormatted: string;
  quotaFormatted: string;
  availableFormatted: string;
  percentageUsed: number;
  customDiskGb: number | null;
  setCustomDiskGb: (gb: number | null) => void;
  loading: boolean;
  isPersisted: boolean | null;
  refresh: () => Promise<void>;
}

const CUSTOM_DISK_KEY = 'geaagro_custom_disk_capacity_gb';

export function useStorageEstimate(pollIntervalMs: number = 8000): StorageEstimateResult {
  const [usage, setUsage] = useState<number>(0);
  const [quota, setQuota] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPersisted, setIsPersisted] = useState<boolean | null>(null);
  const [customDiskGb, setCustomDiskGbState] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem(CUSTOM_DISK_KEY);
    return saved ? parseInt(saved, 10) : null;
  });

  const setCustomDiskGb = useCallback((gb: number | null) => {
    if (typeof window !== 'undefined') {
      if (gb === null) {
        localStorage.removeItem(CUSTOM_DISK_KEY);
      } else {
        localStorage.setItem(CUSTOM_DISK_KEY, gb.toString());
      }
    }
    setCustomDiskGbState(gb);
  }, []);

  const refresh = useCallback(async () => {
    try {
      let actualUsed = 0;
      let browserQuota = 0;

      // 1. LocalStorage usage calculation
      if (typeof window !== 'undefined' && window.localStorage) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const val = localStorage.getItem(key) || '';
            actualUsed += (key.length + val.length) * 2;
          }
        }
      }

      // 2. StorageManager API call: navigator.storage.estimate()
      if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        if (estimate.usage !== undefined) {
          actualUsed = Math.max(actualUsed, estimate.usage);
        }
        if (estimate.quota !== undefined) {
          browserQuota = estimate.quota;
        }
      }

      // 3. StorageManager persistence check: navigator.storage.persisted()
      if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persisted) {
        const persisted = await navigator.storage.persisted();
        setIsPersisted(persisted);
      }

      // 4. Resolve total quota capacity (Custom GB or auto-detect or browser quota)
      let resolvedQuota = browserQuota;

      if (customDiskGb && customDiskGb > 0) {
        resolvedQuota = customDiskGb * 1024 * 1024 * 1024;
      } else if (!resolvedQuota || resolvedQuota === 0) {
        const deviceMem = (navigator as any).deviceMemory || 8;
        const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const estimatedGb = isMobile ? (deviceMem >= 6 ? 256 : 128) : (deviceMem >= 16 ? 512 : 256);
        resolvedQuota = estimatedGb * 1024 * 1024 * 1024;
      }

      setUsage(actualUsed);
      setQuota(resolvedQuota);
    } catch (err) {
      console.error('Erro ao consultar StorageManager (navigator.storage.estimate):', err);
    } finally {
      setLoading(false);
    }
  }, [customDiskGb]);

  useEffect(() => {
    refresh();
    if (pollIntervalMs > 0) {
      const interval = setInterval(refresh, pollIntervalMs);
      return () => clearInterval(interval);
    }
  }, [refresh, pollIntervalMs]);

  const available = Math.max(0, quota - usage);
  const percentageUsed = quota > 0 ? Number(((usage / quota) * 100).toFixed(3)) : 0;

  return {
    usage,
    quota,
    available,
    usedFormatted: formatBytes(usage),
    quotaFormatted: formatBytes(quota),
    availableFormatted: formatBytes(available),
    percentageUsed,
    customDiskGb,
    setCustomDiskGb,
    loading,
    isPersisted,
    refresh,
  };
}
