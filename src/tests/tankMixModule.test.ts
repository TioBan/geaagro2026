import { describe, it, expect } from 'vitest';

describe('TankMix Module & Subcomponents Integrity Verification', () => {
  it('TankMixModule should import successfully with named and default export', async () => {
    const mod = await import('../components/TankMixModule');
    expect(mod.TankMixModule).toBeDefined();
    expect(mod.default).toBeDefined();
    expect(mod.TankMixModule).toBe(mod.default);
  });

  it('TankMix subcomponents and data should load without syntax or runtime error', async () => {
    const labView = await import('../components/tankmix/TankMixVirtualLabView');
    expect(labView.TankMixVirtualLabView).toBeDefined();

    const data = await import('../data/tankMixData');
    expect(data.TANKMIX_PRODUCTS_DATABASE).toBeDefined();
    expect(Array.isArray(data.TANKMIX_PRODUCTS_DATABASE)).toBe(true);
    expect(data.TANKMIX_PRODUCTS_DATABASE.length).toBeGreaterThan(0);
  });

  it('TankMix virtual lab should evaluate empty tank cleanly without dummy parameters', async () => {
    const { calculateTankMixEvaluation } = await import('../data/tankMixData');
    const waterQuality = {
      ph: 6.2,
      electricalConductivityUsCm: 180,
      hardnessMgL: 65,
      alkalinityMgL: 45,
      temperatureC: 24,
      calciumMgL: 18,
      magnesiumMgL: 5,
      ironMgL: 0.1,
      manganeseMgL: 0.05,
      bicarbonatesMgL: 40,
    };

    const emptyEval = calculateTankMixEvaluation([], waterQuality, 2000, 100);
    expect(emptyEval.loadedProducts).toHaveLength(0);
    expect(emptyEval.detectedRules).toHaveLength(0);
    expect(emptyEval.activeAlerts).toHaveLength(0);
    expect(emptyEval.icgScore).toBe(0);
    expect(emptyEval.jarTestRequired).toBe(false);
    expect(emptyEval.totalHectaresPerTank).toBe(20);
  });
});
