import { describe, it, expect } from 'vitest';

describe('About Module Refactoring & Subcomponents Integrity', () => {
  it('should successfully import AboutModule and all subcomponents without errors', async () => {
    const aboutModule = await import('../components/AboutModule');
    expect(aboutModule).toBeDefined();
    expect(aboutModule.AboutModule || (aboutModule as any).default).toBeDefined();

    const aboutParts = await import('../components/about');
    expect(aboutParts.AboutHeroSection).toBeDefined();
    expect(aboutParts.AboutPwaInstallCard).toBeDefined();
    expect(aboutParts.AboutFeaturesAndStandards).toBeDefined();
    expect(aboutParts.AboutPrivacyTab).toBeDefined();
    expect(aboutParts.AboutTermsTab).toBeDefined();
  });
});
