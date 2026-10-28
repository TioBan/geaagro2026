import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { PRIVACY_POLICY_DATA, DPO_CONTACT_EMAIL, PRIVACY_POLICY_VERSION } from '../data/privacyPolicyData';
import { TERMS_OF_USE_DATA, TERMS_OF_USE_VERSION } from '../data/termsOfUseData';
import { getLgpdConsentStatus, saveLgpdConsentStatus, revokeLgpdConsent } from '../components/LgpdConsentModal';

describe('LGPD Privacy Policy & Terms of Use Distinction', () => {
  it('should have separate, distinct data structures for Privacy Policy and Terms of Use', () => {
    // Verify Privacy Policy structure & LGPD references
    expect(PRIVACY_POLICY_DATA.title).toContain('Privacidade');
    expect(PRIVACY_POLICY_DATA.legislation).toContain('13.709');
    expect(PRIVACY_POLICY_DATA.controller.dpoEmail).toBe(DPO_CONTACT_EMAIL);
    expect(PRIVACY_POLICY_DATA.sections.length).toBeGreaterThanOrEqual(4);

    // Verify Terms of Use structure & Technical Responsibility references
    expect(TERMS_OF_USE_DATA.title).toContain('Termos');
    const termsJson = JSON.stringify(TERMS_OF_USE_DATA);
    expect(termsJson).toContain('CREA');
    expect(termsJson).toContain('Receituário Agronômico');
    expect(TERMS_OF_USE_DATA.sections.length).toBeGreaterThanOrEqual(4);

    // Confirm that Privacy Policy is completely distinct from Terms of Use
    expect(PRIVACY_POLICY_DATA.title).not.toEqual(TERMS_OF_USE_DATA.title);
    expect(PRIVACY_POLICY_DATA.subtitle).not.toEqual(TERMS_OF_USE_DATA.subtitle);
  });

  it('should have deployed standalone HTML documents in /public for direct navigation', () => {
    const privacyHtmlPath = resolve(process.cwd(), 'public/privacy-policy.html');
    const termsHtmlPath = resolve(process.cwd(), 'public/terms-of-use.html');

    expect(existsSync(privacyHtmlPath)).toBe(true);
    expect(existsSync(termsHtmlPath)).toBe(true);

    const privacyHtmlContent = readFileSync(privacyHtmlPath, 'utf-8');
    const termsHtmlContent = readFileSync(termsHtmlPath, 'utf-8');

    // Verify Privacy HTML content
    expect(privacyHtmlContent).toContain('Lei Geral de Proteção de Dados');
    expect(privacyHtmlContent).toContain('13.709/2018');
    expect(privacyHtmlContent).toContain(DPO_CONTACT_EMAIL);
    expect(privacyHtmlContent).toContain('Privacy by Design');

    // Verify Terms HTML content
    expect(termsHtmlContent).toContain('Termos de Uso');
    expect(termsHtmlContent).toContain('CREA');
    expect(termsHtmlContent).toContain('Receituário Agronômico');

    // Ensure they are two different documents
    expect(privacyHtmlContent).not.toEqual(termsHtmlContent);
  });

  describe('LGPD Consent State Management', () => {
    beforeEach(() => {
      // Mock localStorage in testing environment
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

    it('should correctly save, retrieve, and revoke LGPD consent status', () => {
      // Initial status should be null
      expect(getLgpdConsentStatus()).toBeNull();

      // Save consent
      const saved = saveLgpdConsentStatus();
      expect(saved.accepted).toBe(true);
      expect(saved.version).toBe('4.2.3.7');
      expect(saved.timestamp).toBeDefined();

      // Retrieve consent
      const retrieved = getLgpdConsentStatus();
      expect(retrieved).not.toBeNull();
      expect(retrieved?.accepted).toBe(true);

      // Revoke consent
      revokeLgpdConsent();
      expect(getLgpdConsentStatus()).toBeNull();
    });
  });
});


