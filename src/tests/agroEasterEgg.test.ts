import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AGRO_QUOTES } from '../data/agroQuotesData';
import { handleAgroLogoClick, triggerAgroEasterEggModal } from '../utils/agroEasterEgg';

describe('Agro Easter Egg & 20 Agro Quotes Tests', () => {
  let dispatchedEvents: any[] = [];

  beforeEach(() => {
    dispatchedEvents = [];
    // Setup window & CustomEvent in node environment
    (globalThis as any).CustomEvent = class CustomEvent {
      type: string;
      detail: any;
      constructor(type: string, params?: { detail?: any }) {
        this.type = type;
        this.detail = params?.detail;
      }
    };
    (globalThis as any).window = {
      dispatchEvent: vi.fn((event: any) => {
        dispatchedEvents.push(event);
        return true;
      }),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
  });

  it('should have exactly 20 rich and inspiring agro quotes', () => {
    expect(AGRO_QUOTES).toHaveLength(20);
    
    AGRO_QUOTES.forEach((item, index) => {
      expect(item.id).toBe(index + 1);
      expect(item.quote).toBeTruthy();
      expect(item.quote.length).toBeGreaterThan(15);
      expect(item.author).toBeTruthy();
      expect(item.category).toBeTruthy();
      expect(item.context).toBeTruthy();
      expect(item.tag).toMatch(/^#/);
    });
  });

  it('should dispatch open event when triggered directly', () => {
    triggerAgroEasterEggModal();
    
    expect(dispatchedEvents.length).toBe(1);
    expect(dispatchedEvents[0].type).toBe('geaagro:open-agro-easter-egg');
  });

  it('should trigger easter egg modal precisely upon 7 clicks', () => {
    // First 6 clicks: dispatches progress events for 3..6
    for (let i = 1; i <= 6; i++) {
      handleAgroLogoClick();
    }
    
    // 7th click: should dispatch open modal event
    handleAgroLogoClick();
    
    const eventTypes = dispatchedEvents.map(e => e.type);
    expect(eventTypes).toContain('geaagro:open-agro-easter-egg');
  });
});
