import { describe, it, expect } from 'vitest';
import { INITIAL_PESTICIDES_CATALOG } from '../data/pesticidesData';
import { GLOBACHEM_OFFICIAL_CATALOG } from '../data/globachemCatalogData';
import { PILARQUIM_OFFICIAL_CATALOG } from '../data/pilarquimCatalogData';

describe('Globachem and Pilarquim Catalogs Integration Tests', () => {
  it('should have loaded Globachem catalog with exactly 24 products', () => {
    expect(GLOBACHEM_OFFICIAL_CATALOG).toBeDefined();
    expect(GLOBACHEM_OFFICIAL_CATALOG.length).toBe(24);
  });

  it('should have loaded Pilarquim catalog with exactly 25 products', () => {
    expect(PILARQUIM_OFFICIAL_CATALOG).toBeDefined();
    expect(PILARQUIM_OFFICIAL_CATALOG.length).toBe(25);
  });

  it('should successfully find Globachem and Pilarquim products in the INITIAL_PESTICIDES_CATALOG', () => {
    // Look for a specific Globachem product
    const alon = INITIAL_PESTICIDES_CATALOG.find(p => p.registrationNumber === '31422');
    expect(alon).toBeDefined();
    expect(alon?.productName).toContain('Alon');
    expect(alon?.manufacturer).toContain('Globachem');

    // Look for a specific Pilarquim product
    const agrotop = INITIAL_PESTICIDES_CATALOG.find(p => p.registrationNumber === '28220');
    expect(agrotop).toBeDefined();
    expect(agrotop?.productName).toContain('Agrotop');
    expect(agrotop?.manufacturer).toContain('Pilarquim');
  });

  it('all registered products should have valid properties and indications', () => {
    const combined = [...GLOBACHEM_OFFICIAL_CATALOG, ...PILARQUIM_OFFICIAL_CATALOG];
    for (const prod of combined) {
      expect(prod.id).toBeDefined();
      expect(prod.productName).toBeDefined();
      expect(prod.registrationNumber).toBeDefined();
      expect(prod.activeIngredient).toBeDefined();
      expect(prod.manufacturer).toBeDefined();
      expect(prod.agrochemicalClass).toBeDefined();
      expect(prod.toxicologicalClass).toBeDefined();
      expect(prod.formulation).toBeDefined();
      expect(prod.indications.length).toBeGreaterThanOrEqual(1);

      // Verify each indication
      for (const ind of prod.indications) {
        expect(ind.cropName).toBeDefined();
        expect(ind.recommendedDosage).toBeGreaterThan(0);
        expect(ind.dosageUnit).toBeDefined();
        expect(ind.targetOrganism).toBeDefined();
      }
    }
  });
});
