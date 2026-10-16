import { describe, it, expect, beforeEach } from 'vitest';
import {
  QUICK_ACCESS_ITEMS,
  getStoredQuickAccessOrder,
  saveStoredQuickAccessOrder,
  resetStoredQuickAccessOrder,
} from '../components/dashboard/DashboardQuickAccessSection';

describe('Quick Access Drag-and-Drop Ordering System', () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    globalThis.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => { store[key] = val; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
      key: (idx: number) => Object.keys(store)[idx] || null,
      length: Object.keys(store).length,
    } as Storage;
  });

  it('should have all 17 initial quick access items defined', () => {
    expect(QUICK_ACCESS_ITEMS.length).toBeGreaterThanOrEqual(17);
    const ids = QUICK_ACCESS_ITEMS.map(item => item.id);
    expect(ids).toContain('caderno_campo');
    expect(ids).toContain('solos');
    expect(ids).toContain('recomendacoes');
    expect(ids).toContain('bulario');
  });

  it('should correctly save, retrieve, and reset custom tool order in localStorage', () => {
    expect(getStoredQuickAccessOrder()).toBeNull();

    // Reorder: Put 'caderno_campo' and 'bulario' first
    const customOrder = ['caderno_campo', 'bulario', ...QUICK_ACCESS_ITEMS.map(i => i.id).filter(id => id !== 'caderno_campo' && id !== 'bulario')];
    saveStoredQuickAccessOrder(customOrder);

    const retrieved = getStoredQuickAccessOrder();
    expect(retrieved).not.toBeNull();
    expect(retrieved?.[0]).toBe('caderno_campo');
    expect(retrieved?.[1]).toBe('bulario');

    // Reset order
    resetStoredQuickAccessOrder();
    expect(getStoredQuickAccessOrder()).toBeNull();
  });
});
