import { describe, it, expect } from 'vitest';
import { INITIAL_FIELDS, INITIAL_OPERATIONS, MOCK_DASHBOARD_SUMMARY } from '../data/fieldbookData';
import { INITIAL_FARMS } from '../utils/sampleData';

describe('FieldBook / Caderno de Campo Dashboard Configuration', () => {
  it('should have initial mock summary metrics and structure for FieldBook dashboard', () => {
    expect(MOCK_DASHBOARD_SUMMARY).toBeDefined();
    expect(typeof MOCK_DASHBOARD_SUMMARY.todayOperations).toBe('number');
    expect(typeof MOCK_DASHBOARD_SUMMARY.plannedOperations).toBe('number');
    expect(typeof MOCK_DASHBOARD_SUMMARY.cultivatedAreaHa).toBe('number');
    expect(typeof MOCK_DASHBOARD_SUMMARY.machineryHours).toBe('number');
    expect(typeof MOCK_DASHBOARD_SUMMARY.iggsScore).toBe('number');
  });

  it('should verify initial farms structure exists for farm binding in Caderno de Campo', () => {
    expect(INITIAL_FARMS).toBeDefined();
    expect(Array.isArray(INITIAL_FARMS)).toBe(true);
  });

  it('should successfully load FieldBookModule without reference errors', async () => {
    const module = await import('../components/FieldBookModule');
    expect(module).toBeDefined();
  });
});

