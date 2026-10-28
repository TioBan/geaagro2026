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

  it('should not contain hardcoded pre-filled cost values (3.840) in DashboardKpiSection source', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(process.cwd(), 'src/components/dashboard/DashboardKpiSection.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Ensure mock 3.840 and mock breakdown were removed
    expect(content).not.toContain('3.840');
    expect(content).not.toContain('Benchmark da safra regional');
    expect(content).not.toContain('Nutrição, Calcário e NPK (42%): R$ 1.613');
  });
});
