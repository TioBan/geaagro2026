import React, { useState, useEffect } from 'react';
import { Info, Cpu, Lock, Scale, ChevronDown } from 'lucide-react';
import { ArchitectureDocModule } from './ArchitectureDocModule';
import {
  getLgpdConsentStatus,
  saveLgpdConsentStatus,
  revokeLgpdConsent,
  LgpdConsentData,
} from './LgpdConsentModal';
import { AboutHeroSection } from './about/AboutHeroSection';
import { AboutPwaInstallCard } from './about/AboutPwaInstallCard';
import { AboutFeaturesAndStandards } from './about/AboutFeaturesAndStandards';
import { AboutPrivacyTab } from './about/AboutPrivacyTab';
import { AboutTermsTab } from './about/AboutTermsTab';

interface AboutModuleProps {
  setActiveTab?: (tab: string) => void;
  initialSubTab?: 'sobre' | 'blueprint' | 'privacidade' | 'termos' | string;
}

type AboutInternalTab = 'sobre' | 'privacidade' | 'termos' | 'blueprint';

const ABOUT_TABS: Array<{
  id: AboutInternalTab;
  btnId: string;
  testId?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'sobre', btnId: 'btn-about-tab-sobre', label: 'Sobre o Sistema', icon: Info },
  {
    id: 'privacidade',
    btnId: 'btn-about-tab-privacy',
    testId: 'btn-about-tab-privacy',
    label: 'Política de Privacidade (LGPD)',
    icon: Lock,
  },
  {
    id: 'termos',
    btnId: 'btn-about-tab-terms',
    testId: 'btn-about-tab-terms',
    label: 'Termos de Uso Agronômico',
    icon: Scale,
  },
  { id: 'blueprint', btnId: 'btn-about-tab-blueprint', label: 'Blueprint & Arquitetura', icon: Cpu },
];

export const AboutModule: React.FC<AboutModuleProps> = ({
  setActiveTab,
  initialSubTab = 'sobre',
}) => {
  const [activeInternalTab, setActiveInternalTab] = useState<AboutInternalTab>(
    initialSubTab === 'privacidade' || initialSubTab === 'termos' || initialSubTab === 'blueprint'
      ? initialSubTab
      : 'sobre'
  );
  const [consentStatus, setConsentStatus] = useState<LgpdConsentData | null>(null);

  useEffect(() => {
    if (
      initialSubTab === 'sobre' ||
      initialSubTab === 'privacidade' ||
      initialSubTab === 'termos' ||
      initialSubTab === 'blueprint'
    ) {
      setActiveInternalTab(initialSubTab);
    }
  }, [initialSubTab]);

  useEffect(() => {
    setConsentStatus(getLgpdConsentStatus());
  }, [activeInternalTab]);

  const handleReAccept = () => {
    setConsentStatus(saveLgpdConsentStatus());
  };

  const handleRevoke = () => {
    revokeLgpdConsent();
    setConsentStatus(null);
  };

  const ActiveIcon = ABOUT_TABS.find(t => t.id === activeInternalTab)?.icon || Info;

  return (
    <div className="space-y-5">
      {/* Seletor compacto no mobile */}
      <div className="block sm:hidden">
        <label htmlFor="select-about-tab" className="sr-only">
          Navegar na seção Sobre e Termos
        </label>
        <div className="relative flex items-center">
          <div className="absolute left-3 pointer-events-none text-emerald-600 dark:text-emerald-400">
            <ActiveIcon className="w-3.5 h-3.5" />
          </div>
          <select
            id="select-about-tab"
            data-testid="select-about-tab"
            value={activeInternalTab}
            onChange={e => setActiveInternalTab(e.target.value as AboutInternalTab)}
            className="w-full h-9 appearance-none pl-9 pr-9 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {ABOUT_TABS.map(tab => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 pointer-events-none text-slate-400 dark:text-zinc-500">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Controle segmentado no desktop */}
      <div className="hidden sm:inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg max-w-full overflow-x-auto">
        {ABOUT_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeInternalTab === tab.id;
          return (
            <button
              key={tab.id}
              id={tab.btnId}
              data-testid={tab.testId}
              type="button"
              onClick={() => setActiveInternalTab(tab.id)}
              className={`h-8 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
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
        <div className="space-y-5">
          <AboutHeroSection />
          <AboutPwaInstallCard />
          <AboutFeaturesAndStandards setActiveTab={setActiveTab} />
        </div>
      )}
    </div>
  );
};
