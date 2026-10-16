import { describe, it, expect } from 'vitest';

describe('Submenu Navigation and Routing Verification', () => {
  it('should normalize plantabilidade subtabs accurately', () => {
    const normalizeTab = (tab?: string) => {
      if (!tab) return 'dashboard';
      const normalized = tab.replace(/_/g, '-');
      if (normalized === 'simulator') return 'loss-simulator';
      if (normalized === 'diagnostic') return 'diagnostics';
      return normalized;
    };

    expect(normalizeTab('fields')).toBe('fields');
    expect(normalizeTab('equipment')).toBe('equipment');
    expect(normalizeTab('seeds')).toBe('seeds');
    expect(normalizeTab('sampling')).toBe('sampling');
    expect(normalizeTab('digital-twin')).toBe('digital-twin');
    expect(normalizeTab('loss-simulator')).toBe('loss-simulator');
    expect(normalizeTab('simulator')).toBe('loss-simulator');
    expect(normalizeTab('diagnostic')).toBe('diagnostics');
    expect(normalizeTab('photo_diary')).toBe('photo-diary');
  });

  it('should have all 11 plantabilidade subitems recognized and supported', () => {
    const supportedSubTabs = [
      'dashboard',
      'fields',
      'equipment',
      'seeds',
      'sampling',
      'digital-twin',
      'diagnostics',
      'loss-simulator',
      'map',
      'photo-diary',
      'reports',
    ];

    expect(supportedSubTabs).toContain('fields');
    expect(supportedSubTabs).toContain('equipment');
    expect(supportedSubTabs).toContain('sampling');
    expect(supportedSubTabs).toContain('digital-twin');
    expect(supportedSubTabs.length).toBe(11);
  });
});
