import { describe, it, expect } from 'vitest';

describe('Dashboard Module Refactoring & Integrity Tests', () => {
  it('should successfully import DashboardModule and subcomponents without errors', async () => {
    const dashboardModule = await import('../components/DashboardModule');
    expect(dashboardModule).toBeDefined();
    expect(dashboardModule.DashboardModule || dashboardModule.default).toBeDefined();

    const dashboardParts = await import('../components/dashboard');
    expect(dashboardParts.DashboardHeaderBanner).toBeDefined();
    expect(dashboardParts.DashboardKpiSection).toBeDefined();
    expect(dashboardParts.DashboardFarmsSummary).toBeDefined();
    expect(dashboardParts.DashboardRecommendationsSection).toBeDefined();
    expect(dashboardParts.DashboardDiagnosticsSection).toBeDefined();
  });
});
