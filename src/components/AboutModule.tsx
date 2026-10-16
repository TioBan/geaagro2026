import React, { useState, useEffect } from 'react';
import {
  Info,
  Cpu,
  Lock,
  Scale,
  ChevronDown,
} from 'lucide-react';
import { ArchitectureDocModule } from './ArchitectureDocModule';
import { getLgpdConsentStatus, saveLgpdConsentStatus, revokeLgpdConsent, LgpdConsentData } from './LgpdConsentModal';
import { AboutHeroSection } from './about/AboutHeroSection';
import { AboutPwaInstallCard } from './about/AboutPwaInstallCard';
import { AboutFeaturesAndStandards } from './about/AboutFeaturesAndStandards';
import { AboutPrivacyTab } from './about/AboutPrivacyTab';
import { AboutTermsTab } from './about/AboutTermsTab';

interface AboutModuleProps {
  setActiveTab?: (tab: string) => void;
  initialSubTab?: 'sobre' | 'blueprint' | 'privacidade' | 'termos' | string;
}

export const AboutModule: React.FC<AboutModuleProps> = ({ setActiveTab, initialSubTab = 'sobre' }) => {
  const [activeInternalTab, setActiveInternalTab] = useState<'sobre' | 'blueprint' | 'privacidade' | 'termos'>(
    (initialSubTab === 'privacidade' || initialSubTab === 'termos' || initialSubTab === 'blueprint')
      ? initialSubTab
      : 'sobre'
  );
  const [consentStatus, setConsentStatus] = useState<LgpdConsentData | null>(null);

  useEffect(() => {
    if (initialSubTab && (initialSubTab === 'sobre' || initialSubTab === 'privacidade' || initialSubTab === 'termos' || initialSubTab === 'blueprint')) {
      setActiveInternalTab(initialSubTab);
    }
  }, [initialSubTab]);

  useEffect(() => {
    setConsentStatus(getLgpdConsentStatus());
  }, [activeInternalTab]);

  const handleReAccept = () => {
    const updated = saveLgpdConsentStatus();
    setConsentStatus(updated);
  };

  const handleRevoke = () => {
    revokeLgpdConsent();
    setConsentStatus(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-fade-in">
      {/* Mobile Dropdown (Menu Suspenso) */}
      <div className="block sm:hidden mb-6 px-1">
        <label htmlFor="select-about-tab" className="sr-only">
          Navegar na seção Sobre e Termos
        </label>
        <div className="relative flex items-center">
          <div className="absolute left-3 pointer-events-none text-emerald-600 dark:text-emerald-400">
            {activeInternalTab === 'sobre' && <Info className="w-4 h-4" />}
            {activeInternalTab === 'privacidade' && <Lock className="w-4 h-4" />}
            {activeInternalTab === 'termos' && <Scale className="w-4 h-4" />}
            {activeInternalTab === 'blueprint' && <Cpu className="w-4 h-4" />}
          </div>
          <select
            id="select-about-tab"
            data-testid="select-about-tab"
            value={activeInternalTab}
            onChange={(e) => setActiveInternalTab(e.target.value as any)}
            className="w-full appearance-none pl-9 pr-9 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:ring-2 focus:ring-emerald-500 shadow-2xs outline-none cursor-pointer"
          >
            <option value="sobre">Sobre o Sistema</option>
            <option value="privacidade">Política de Privacidade (LGPD)</option>
            <option value="termos">Termos de Uso Agronômico</option>
            <option value="blueprint">Blueprint & Arquitetura</option>
          </select>
          <div className="absolute right-3 pointer-events-none text-slate-400 dark:text-zinc-500">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Tabs for Desktop */}
      <div className="hidden sm:flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-lg text-xs font-semibold overflow-x-auto max-w-full border border-slate-200 dark:border-zinc-800 w-max mx-auto mb-6">
        <button
          id="btn-about-tab-sobre"
          onClick={() => setActiveInternalTab('sobre')}
          className={`px-4 py-2 min-h-[36px] rounded-md flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeInternalTab === 'sobre'
              ? 'bg-white dark:bg-black text-emerald-800 dark:text-emerald-400 shadow-xs font-bold'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <Info className="w-4 h-4 text-emerald-500" />
          Sobre o Sistema
        </button>
        <button
          id="btn-about-tab-privacy"
          data-testid="btn-about-tab-privacy"
          onClick={() => setActiveInternalTab('privacidade')}
          className={`px-4 py-2 min-h-[36px] rounded-md flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeInternalTab === 'privacidade'
              ? 'bg-white dark:bg-black text-emerald-800 dark:text-emerald-400 shadow-xs font-bold'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <Lock className="w-4 h-4 text-emerald-500" />
          Política de Privacidade (LGPD)
        </button>
        <button
          id="btn-about-tab-terms"
          data-testid="btn-about-tab-terms"
          onClick={() => setActiveInternalTab('termos')}
          className={`px-4 py-2 min-h-[36px] rounded-md flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeInternalTab === 'termos'
              ? 'bg-white dark:bg-black text-emerald-800 dark:text-emerald-400 shadow-xs font-bold'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <Scale className="w-4 h-4 text-emerald-500" />
          Termos de Uso Agronômico
        </button>
        <button
          id="btn-about-tab-blueprint"
          onClick={() => setActiveInternalTab('blueprint')}
          className={`px-4 py-2 min-h-[36px] rounded-md flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeInternalTab === 'blueprint'
              ? 'bg-white dark:bg-black text-emerald-800 dark:text-emerald-400 shadow-xs font-bold'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <Cpu className="w-4 h-4 text-emerald-500" />
          Blueprint & Arquitetura
        </button>
      </div>

      {activeInternalTab === 'blueprint' && <ArchitectureDocModule />}

      {activeInternalTab === 'privacidade' && (
        <AboutPrivacyTab
          consentStatus={consentStatus}
          onReAccept={handleReAccept}
          onRevoke={handleRevoke}
        />
      )}

      {activeInternalTab === 'termos' && <AboutTermsTab />}

      {activeInternalTab === 'sobre' && (
        <div className="space-y-8">
          <AboutHeroSection />
          <AboutPwaInstallCard />
          <AboutFeaturesAndStandards setActiveTab={setActiveTab} />
        </div>
      )}
    </div>
  );
};
