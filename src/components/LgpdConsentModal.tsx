import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, CheckCircle2, Lock,
  Scale, UserCheck, ExternalLink, X, ArrowRight,
  ChevronDown
} from 'lucide-react';
import { PRIVACY_POLICY_DATA, DPO_CONTACT_EMAIL } from '../data/privacyPolicyData';
import { TERMS_OF_USE_DATA } from '../data/termsOfUseData';

const LGPD_STORAGE_KEY = 'lgpd_consent_accepted_v4_2';

export interface LgpdConsentData {
  accepted: boolean;
  timestamp: string;
  version: string;
  userIP?: string;
}

export function getLgpdConsentStatus(): LgpdConsentData | null {
  try {
    const data = localStorage.getItem(LGPD_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Erro ao ler consentimento LGPD:', e);
  }
  return null;
}

export function saveLgpdConsentStatus(): LgpdConsentData {
  const consent: LgpdConsentData = {
    accepted: true,
    timestamp: new Date().toISOString(),
    version: '4.2.2',
  };
  try {
    localStorage.setItem(LGPD_STORAGE_KEY, JSON.stringify(consent));
  } catch (e) {
    console.error('Erro ao salvar consentimento LGPD:', e);
  }
  return consent;
}

export function revokeLgpdConsent(): void {
  try {
    localStorage.removeItem(LGPD_STORAGE_KEY);
  } catch (e) {
    console.error('Erro ao revogar consentimento LGPD:', e);
  }
}

interface LgpdConsentModalProps {
  onOpenPrivacyDoc?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  initialTab?: 'resumo' | 'privacidade' | 'termos';
  onAcceptSuccess?: () => void;
}

export const LgpdConsentModal: React.FC<LgpdConsentModalProps> = ({
  onOpenPrivacyDoc,
  isOpen: propIsOpen,
  onClose,
  initialTab = 'resumo',
  onAcceptSuccess,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<'resumo' | 'privacidade' | 'termos'>(initialTab);
  const [, setConsentData] = useState<LgpdConsentData | null>(null);

  const isControlled = propIsOpen !== undefined;
  const isVisible = isControlled ? propIsOpen : internalIsOpen;

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (!isControlled) {
      const existing = getLgpdConsentStatus();
      if (!existing || !existing.accepted) {
        setInternalIsOpen(true);
      } else {
        setConsentData(existing);
      }
    }
  }, [isControlled]);

  const handleClose = () => {
    if (isControlled) {
      onClose?.();
    } else {
      setInternalIsOpen(false);
      onClose?.();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, isControlled]);

  const handleAccept = () => {
    if (!isChecked) return;
    const saved = saveLgpdConsentStatus();
    setConsentData(saved);
    if (!isControlled) {
      setInternalIsOpen(false);
    }
    onAcceptSuccess?.();
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div 
      id="lgpd-consent-modal-overlay"
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-fade-in flex items-center justify-center p-2.5 sm:p-4 md:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        id="lgpd-consent-modal-container"
        className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col my-auto max-h-[92vh] sm:max-h-[88vh] relative z-10"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar - Spacious, clean, never covered by external headers */}
        <div className="bg-slate-900 dark:bg-zinc-900 border-b border-slate-800 px-4 sm:px-6 py-3.5 sm:py-4 shrink-0 text-white flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              {activeTab === 'privacidade' ? (
                <Lock className="w-5 h-5" />
              ) : activeTab === 'termos' ? (
                <Scale className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0 flex-1 flex flex-col justify-center">
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 uppercase tracking-wider block truncate leading-normal">
                {activeTab === 'privacidade' 
                  ? 'Privacidade & Proteção de Dados (LGPD)' 
                  : activeTab === 'termos' 
                  ? 'Responsabilidade Agronômica' 
                  : 'Conformidade e Transparência'}
              </span>
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight leading-snug break-words mt-0.5">
                {activeTab === 'privacidade'
                  ? 'Política de Privacidade de Dados'
                  : activeTab === 'termos'
                  ? 'Termos e Condições de Uso Agronômico'
                  : 'Termos de Uso & Política de Privacidade de Dados'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            id="btn-modal-header-close"
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Fechar"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation - Dropdown for Mobile (Menu Suspenso) */}
        <div className="block sm:hidden px-4 py-2.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/90 dark:bg-zinc-900/80 shrink-0">
          <div className="relative">
            <label htmlFor="select-modal-terms-tab" className="sr-only">
              Navegar pelos documentos
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 pointer-events-none text-emerald-600 dark:text-emerald-400">
                {activeTab === 'resumo' && <CheckCircle2 className="w-4 h-4" />}
                {activeTab === 'privacidade' && <Lock className="w-4 h-4" />}
                {activeTab === 'termos' && <Scale className="w-4 h-4" />}
              </div>
              <select
                id="select-modal-terms-tab"
                data-testid="select-modal-terms-tab"
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as 'resumo' | 'privacidade' | 'termos')}
                className="w-full appearance-none pl-9 pr-9 py-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:ring-2 focus:ring-emerald-500 shadow-2xs outline-none cursor-pointer"
              >
                <option value="resumo">Resumo de Aceite</option>
                <option value="privacidade">Política de Privacidade (LGPD)</option>
                <option value="termos">Termos de Uso</option>
              </select>
              <div className="absolute right-3 pointer-events-none text-slate-400 dark:text-zinc-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs - Modern Segmented Control for Desktop */}
        <div className="hidden sm:block px-6 py-2.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/60 shrink-0">
          <div className="inline-flex p-1 bg-slate-200/70 dark:bg-zinc-800/80 rounded-xl gap-1">
            <button
              type="button"
              id="btn-tab-modal-resumo"
              onClick={() => setActiveTab('resumo')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'resumo'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Resumo de Aceite</span>
            </button>
            <button
              type="button"
              id="btn-tab-modal-privacy"
              data-testid="btn-tab-modal-privacy"
              onClick={() => setActiveTab('privacidade')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'privacidade'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Política de Privacidade (LGPD)</span>
            </button>
            <button
              type="button"
              id="btn-tab-modal-terms"
              data-testid="btn-tab-modal-terms"
              onClick={() => setActiveTab('termos')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'termos'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Termos de Uso</span>
            </button>
          </div>
        </div>

        {/* Tab Body - Single Smooth Scroll Container without nested scroll limits */}
        <div className="p-5 sm:p-6 overflow-y-auto text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed grow space-y-4">
          {/* TAB 1: RESUMO DE ACEITE */}
          {activeTab === 'resumo' && (
            <div className="space-y-4" data-testid="lgpd-summary-content">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 text-emerald-950 dark:text-emerald-200 space-y-1.5">
                <div className="font-bold text-sm flex items-center gap-2 text-emerald-900 dark:text-emerald-300">
                  <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Bem-vindo ao GeaAgro CRM 4.2.2</span>
                </div>
                <p className="text-xs leading-relaxed text-emerald-900/90 dark:text-emerald-200/90">
                  Para utilizar as ferramentas de análise de solo, recomendação de adubação, caderno de campo e laudos agronômicos, é necessário concordar com o tratamento de dados segundo a <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong> e os termos de responsabilidade técnica agronômica.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
                  <div className="font-semibold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Armazenamento Local e Seguro</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Seus dados de propriedades rurais, laudos de fertilidade e relatórios são salvos localmente no seu dispositivo via IndexedDB com criptografia.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
                  <div className="font-semibold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Isenção de ART Técnica</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    As ferramentas e simuladores são orientativos e não substituem a Anotação de Responsabilidade Técnica (ART) por engenheiro agrônomo com CREA.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
                  <div className="font-semibold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                    <span>Direitos do Titular (LGPD Art. 18)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Você pode consultar, exportar em JSON/CSV, corrigir ou solicitar a exclusão de todos os seus dados salvos a qualquer momento.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
                  <div className="font-semibold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-500 shrink-0" />
                    <span>Sigilo do Bulário &amp; Amostras</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Não comercializamos nem compartilhamos seus dados de solo, talhões ou pulverizações com terceiros ou indústrias agroquímicas.
                  </p>
                </div>
              </div>

              {/* Direct links to view full documents */}
              <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <span className="text-slate-600 dark:text-zinc-400 font-medium">
                  Deseja consultar o texto na íntegra?
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    id="btn-modal-open-privacy-tab"
                    onClick={() => setActiveTab('privacidade')}
                    className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Política de Privacidade</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    id="btn-modal-open-terms-tab"
                    onClick={() => setActiveTab('termos')}
                    className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Termos de Uso</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: POLÍTICA DE PRIVACIDADE ESPECÍFICA (LGPD) */}
          {activeTab === 'privacidade' && (
            <div className="space-y-4" data-testid="lgpd-privacy-content" id="lgpd-privacy-view">
              {/* Header card with external full HTML button */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-semibold text-xs">
                  <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Documento Oficial — Lei Geral de Proteção de Dados nº 13.709/2018</span>
                </div>
                <a
                  href="/privacy-policy.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1.5"
                  title="Abrir versão HTML completa em nova aba"
                >
                  <span>Abrir em página dedicada</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Full Document Body (Uncapped, scrolls smoothly with parent) */}
              <div className="space-y-4 pt-1">
                <div className="border-b border-slate-200 dark:border-zinc-800 pb-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100">
                    {PRIVACY_POLICY_DATA.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    {PRIVACY_POLICY_DATA.subtitle}
                  </p>
                </div>

                {PRIVACY_POLICY_DATA.sections.map((sec) => (
                  <div key={sec.id} className="space-y-1.5">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-zinc-100">
                      {sec.number}. {sec.title}
                    </h4>
                    <p className="text-slate-600 dark:text-zinc-300 leading-relaxed text-xs">
                      {sec.content}
                    </p>
                    {sec.bullets && (
                      <ul className="list-disc list-inside space-y-1 pl-1 text-xs text-slate-600 dark:text-zinc-300">
                        {sec.bullets.map((b, idx) => (
                          <li key={idx}>{b}</li>
                        ))}
                      </ul>
                    )}
                    {sec.subsections && sec.subsections.map((sub, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-lg border border-slate-200/80 dark:border-zinc-800 mt-2">
                        <strong className="text-slate-900 dark:text-zinc-100 block text-xs font-semibold mb-0.5">
                          {sub.title}
                        </strong>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                          {sub.text}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}

                <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400 flex flex-wrap items-center justify-between gap-2">
                  <span>Encarregado de Proteção de Dados (DPO): <strong className="text-slate-700 dark:text-zinc-300">{DPO_CONTACT_EMAIL}</strong></span>
                  <span>Versão {PRIVACY_POLICY_DATA.controller.version}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TERMOS DE USO ESPECÍFICOS */}
          {activeTab === 'termos' && (
            <div className="space-y-4" data-testid="terms-of-use-content" id="terms-of-use-view">
              {/* Header card with external full HTML button */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-semibold text-xs">
                  <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Condições Gerais de Uso &amp; Responsabilidade Agronômica</span>
                </div>
                <a
                  href="/terms-of-use.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-amber-800 dark:text-amber-400 hover:underline inline-flex items-center gap-1.5"
                  title="Abrir versão HTML completa em nova aba"
                >
                  <span>Abrir em página dedicada</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Technical disclaimer notice */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                <strong className="text-slate-900 dark:text-zinc-100 font-semibold block mb-1">
                  Nota Importante de Responsabilidade Profissional:
                </strong>
                As análises, cálculos e bulários contidos nesta plataforma constituem recursos auxiliares e informativos. Toda aplicação de defensivos, corretivos ou adubação deve ser prescrita por Engenheiro Agrônomo habilitado, mediante emissão de Receituário Agronômico com Anotação de Responsabilidade Técnica (ART/CREA).
              </div>

              {/* Full Document Body (Uncapped, scrolls smoothly with parent) */}
              <div className="space-y-4 pt-1">
                <div className="border-b border-slate-200 dark:border-zinc-800 pb-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100">
                    {TERMS_OF_USE_DATA.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    {TERMS_OF_USE_DATA.subtitle}
                  </p>
                </div>

                {TERMS_OF_USE_DATA.sections.map((sec) => (
                  <div key={sec.id} className="space-y-1.5">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-zinc-100">
                      {sec.number}. {sec.title}
                    </h4>
                    <p className="text-slate-600 dark:text-zinc-300 leading-relaxed text-xs">
                      {sec.content}
                    </p>
                    {sec.bullets && (
                      <ul className="list-disc list-inside space-y-1 pl-1 text-xs text-slate-600 dark:text-zinc-300">
                        {sec.bullets.map((b, idx) => (
                          <li key={idx}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

                <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400 flex flex-wrap items-center justify-between gap-2">
                  <span>Versão {TERMS_OF_USE_DATA.version}</span>
                  <span>GeaAgro CRM — Todos os direitos reservados</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Clean, Compact Footer Action Area - No redundant "Navegar pelos documentos" obstacle */}
        <div className="bg-slate-50 dark:bg-zinc-900/90 border-t border-slate-200 dark:border-zinc-800 p-4 sm:p-5 shrink-0 space-y-3">
          {/* Checkbox consent declaration */}
          <label className="flex items-start gap-3 cursor-pointer group select-none">
            <input
              type="checkbox"
              id="checkbox-lgpd-accept"
              data-testid="checkbox-lgpd-accept"
              checked={isChecked}
              onChange={e => setIsChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 dark:border-zinc-700 focus:ring-emerald-500 cursor-pointer shrink-0"
            />
            <span className="text-xs text-slate-700 dark:text-zinc-300 font-medium leading-relaxed group-hover:text-slate-900 dark:group-hover:text-zinc-100">
              Declaro que li, compreendi e concordo com os{' '}
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('termos'); }}
                className="text-emerald-700 dark:text-emerald-400 font-bold underline hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer"
              >
                Termos de Uso
              </button>{' '}
              e com a{' '}
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('privacidade'); }}
                className="text-emerald-700 dark:text-emerald-400 font-bold underline hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer"
              >
                Política de Privacidade
              </button>{' '}
              (LGPD) do GeaAgro CRM.
            </span>
          </label>

          {/* Action Buttons Row */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Conformidade com a Lei Federal nº 13.709/2018</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                id="btn-modal-close"
                onClick={handleClose}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold transition-all cursor-pointer text-center"
              >
                Fechar
              </button>

              <button
                type="button"
                id="btn-modal-accept"
                data-testid="btn-modal-accept"
                onClick={handleAccept}
                disabled={!isChecked}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                  isChecked
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-[0.98]'
                    : 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Aceitar e Continuar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
