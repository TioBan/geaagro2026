import { describe, it, expect, beforeEach } from 'vitest';
import {
  USER_PROFILES,
  USER_PROFILES_LIST,
  SYSTEM_MODULES,
  getActiveProfileId,
  setActiveProfileId,
  getProfileEnabledModules,
  setProfileEnabledModules,
  resetProfileToDefault,
  isModuleActiveInCurrentProfile,
} from '../utils/userProfilesStorage';

describe('User Profiles (Perfis de Uso) System', () => {
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

  it('should have all 5 specified user profiles available', () => {
    const profileIds = USER_PROFILES_LIST.map(p => p.id);
    expect(profileIds).toContain('agricultor');
    expect(profileIds).toContain('pecuarista');
    expect(profileIds).toContain('administrador');
    expect(profileIds).toContain('pericia');
    expect(profileIds).toContain('todos');
  });

  it('should default to "todos" profile when no preference is saved', () => {
    expect(getActiveProfileId()).toBe('todos');
  });

  it('should switch profiles and dispatch change event', () => {
    setActiveProfileId('agricultor');
    expect(getActiveProfileId()).toBe('agricultor');

    setActiveProfileId('pecuarista');
    expect(getActiveProfileId()).toBe('pecuarista');

    setActiveProfileId('administrador');
    expect(getActiveProfileId()).toBe('administrador');

    setActiveProfileId('pericia');
    expect(getActiveProfileId()).toBe('pericia');
  });

  it('should have correct module assignments for Agricultor profile', () => {
    const agricultorModules = getProfileEnabledModules('agricultor');
    // Must include agriculture modules
    expect(agricultorModules).toContain('solos');
    expect(agricultorModules).toContain('foliar');
    expect(agricultorModules).toContain('pragas');
    expect(agricultorModules).toContain('tankmix');
    expect(agricultorModules).toContain('bulario');
    // Must NOT include purely animal livestock modules
    expect(agricultorModules).not.toContain('bubalinos');
    expect(agricultorModules).not.toContain('caprinos');
    expect(agricultorModules).not.toContain('equinos');
    expect(agricultorModules).not.toContain('suinocultura');
  });

  it('should have correct module assignments for Pecuarista profile', () => {
    const pecuaristaModules = getProfileEnabledModules('pecuarista');
    // Must include livestock modules
    expect(pecuaristaModules).toContain('pecuaria');
    expect(pecuaristaModules).toContain('nutricao_animal');
    expect(pecuaristaModules).toContain('forrageiras');
    expect(pecuaristaModules).toContain('bulario_vet');
    expect(pecuaristaModules).toContain('equinos');
    // Must NOT include purely crop modules
    expect(pecuaristaModules).not.toContain('tankmix');
    expect(pecuaristaModules).not.toContain('foliar');
    expect(pecuaristaModules).not.toContain('brix');
  });

  it('should have correct module assignments for Administrador profile', () => {
    const adminModules = getProfileEnabledModules('administrador');
    // Must include rural administration & management modules
    expect(adminModules).toContain('gestao_rural');
    expect(adminModules).toContain('custos');
    expect(adminModules).toContain('rastreabilidade');
    expect(adminModules).toContain('cadastros');
    expect(adminModules).toContain('zarc_risco');
    expect(adminModules).toContain('relatorios');
  });

  it('should have correct module assignments for Perícia profile', () => {
    const periciaModules = getProfileEnabledModules('pericia');
    // Must include rural appraisal and inspection modules
    expect(periciaModules).toContain('pericia_rural');
    expect(periciaModules).toContain('geoprocessamento');
    expect(periciaModules).toContain('zarc_risco');
    expect(periciaModules).toContain('solos');
    expect(periciaModules).toContain('relatorios');
  });

  it('should allow user to customize and toggle modules on/off for any profile', () => {
    setActiveProfileId('agricultor');
    // Agricultor initially doesn't have 'pecuaria'
    expect(isModuleActiveInCurrentProfile('pecuaria', 'agricultor')).toBe(false);

    // User customizes Agricultor profile to include 'pecuaria'
    const currentModules = getProfileEnabledModules('agricultor');
    const updated = [...currentModules, 'pecuaria'];
    setProfileEnabledModules('agricultor', updated);

    // Verify it is now enabled
    expect(getProfileEnabledModules('agricultor')).toContain('pecuaria');
    expect(isModuleActiveInCurrentProfile('pecuaria', 'agricultor')).toBe(true);

    // Reset back to default
    resetProfileToDefault('agricultor');
    expect(getProfileEnabledModules('agricultor')).not.toContain('pecuaria');
    expect(isModuleActiveInCurrentProfile('pecuaria', 'agricultor')).toBe(false);
  });

  it('should always keep dashboard accessible regardless of profile customizations', () => {
    // Even if user attempts to remove dashboard
    setProfileEnabledModules('agricultor', ['solos']);
    expect(isModuleActiveInCurrentProfile('dashboard', 'agricultor')).toBe(true);
  });
});
