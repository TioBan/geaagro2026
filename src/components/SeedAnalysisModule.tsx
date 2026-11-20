import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  LayoutGrid,
  Boxes,
  Target,
  Scale,
  Sprout,
  Activity,
  Droplets,
  Microscope,
  FlaskConical,
  Warehouse,
  Camera,
  BookOpen,
  ShieldCheck,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  SeedModuleTab,
  SeedLot,
  RegulatoryProfileId,
  ProfileThresholds,
} from '../types/seedAnalysis';
import {
  INITIAL_SEED_LOTS,
  REGULATORY_PROFILES,
  recalculateSeedLot,
  createSeedLotFromInput,
  NewSeedLotInput,
} from '../data/seedAnalysisData';
import { SeedDashboardAndReception } from './seeds/SeedDashboardAndReception';
import { SeedLabAnalysesTabs } from './seeds/SeedLabAnalysesTabs';
import { SeedOperationsAndExpertTabs } from './seeds/SeedOperationsAndExpertTabs';
import { SeedLotModal, ConfirmDeleteLotDialog } from './seeds/SeedLotModal';

interface SeedAnalysisModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: SeedModuleTab) => void;
}

const STORAGE_KEY = 'geaagro_seed_lots_v1';

const VALID_TABS: SeedModuleTab[] = [
  'dashboard_estatisticas',
  'recepcao_amostras',
  'identidade_gemeo_digital',
  'qualidade_fisica',
  'germinacao',
  'vigor',
  'umidade',
  'sanidade',
  'tratamento',
  'armazenamento',
  'banco_imagens',
  'biblioteca_tecnologia',
  'sistema_especialista',
  'certificados',
];

function normalizeSeedTab(tab?: string): SeedModuleTab {
  if (tab && (VALID_TABS as string[]).includes(tab)) {
    return tab as SeedModuleTab;
  }
  return 'dashboard_estatisticas';
}

const NAV_TABS: Array<{
  id: SeedModuleTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'dashboard_estatisticas', label: 'Dashboard IQS', icon: LayoutGrid },
  { id: 'recepcao_amostras', label: 'Recepção', icon: Boxes },
  { id: 'identidade_gemeo_digital', label: 'Gêmeo Digital', icon: Target },
  { id: 'qualidade_fisica', label: 'Pureza Física', icon: Scale },
  { id: 'germinacao', label: 'Germinação', icon: Sprout },
  { id: 'vigor', label: 'Tetrazólio & Vigor', icon: Activity },
  { id: 'umidade', label: 'Umidade', icon: Droplets },
  { id: 'sanidade', label: 'Patologia', icon: Microscope },
  { id: 'tratamento', label: 'TSI', icon: FlaskConical },
  { id: 'armazenamento', label: 'Armazenamento', icon: Warehouse },
  { id: 'banco_imagens', label: 'Fotos', icon: Camera },
  { id: 'biblioteca_tecnologia', label: 'Biblioteca RAS', icon: BookOpen },
  { id: 'sistema_especialista', label: 'Regras & Limites', icon: ShieldCheck },
  { id: 'certificados', label: 'BAS / Laudo', icon: FileText },
];

export const SeedAnalysisModule: React.FC<SeedAnalysisModuleProps> = ({
  activeSubTab,
  setActiveSubTab,
}) => {
  const [internalTab, setInternalTab] = useState<SeedModuleTab>('dashboard_estatisticas');
  const activeTab: SeedModuleTab = activeSubTab
    ? normalizeSeedTab(activeSubTab)
    : internalTab;

  const handleSelectTab = (tab: SeedModuleTab) => {
    setInternalTab(tab);
    setActiveSubTab?.(tab);
  };

  const [seedLots, setSeedLots] = useState<SeedLot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((lot: SeedLot) => {
            const safePhotos = Array.isArray(lot.reception?.photos)
              ? lot.reception.photos.filter(
                  (p) => typeof p === 'object' && p !== null && typeof p.dataUrl === 'string'
                )
              : [];
            const safeTreatment = Array.isArray(lot.treatment)
              ? lot.treatment.map((t, i) => ({
                  ...t,
                  id: t.id || `tsi_${lot.id}_${i}`,
                }))
              : [];
            return recalculateSeedLot({
              ...lot,
              reception: { ...lot.reception, photos: safePhotos },
              treatment: safeTreatment,
            });
          });
        }
      }
    } catch {
      // Fallback para estado inicial limpo
    }
    return INITIAL_SEED_LOTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedLots));
    } catch {
      // Ignora erro de cota do armazenamento local
    }
  }, [seedLots]);

  const [selectedLotId, setSelectedLotId] = useState<string>(() => seedLots[0]?.id || '');

  useEffect(() => {
    if (seedLots.length === 0) {
      if (selectedLotId !== '') setSelectedLotId('');
    } else if (!seedLots.some((l) => l.id === selectedLotId)) {
      setSelectedLotId(seedLots[0].id);
    }
  }, [seedLots, selectedLotId]);

  const currentLot = useMemo<SeedLot | null>(() => {
    if (!seedLots.length) return null;
    return seedLots.find((l) => l.id === selectedLotId) || seedLots[0];
  }, [seedLots, selectedLotId]);

  // Perfil regulatório e limiares parametrizados
  const [selectedProfile, setSelectedProfile] = useState<RegulatoryProfileId>('laboratorio');
  const [isCustomized, setIsCustomized] = useState(false);
  const [profileThresholds, setProfileThresholds] = useState<ProfileThresholds>(
    REGULATORY_PROFILES.laboratorio.thresholds
  );

  // Modais e feedback inline
  const [isNewLotOpen, setIsNewLotOpen] = useState(false);
  const [lotPendingDelete, setLotPendingDelete] = useState<SeedLot | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setNotification(null);
      toastTimerRef.current = null;
    }, 3500);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handleProfileChange = (profile: RegulatoryProfileId) => {
    const preset = REGULATORY_PROFILES[profile];
    setSelectedProfile(profile);
    setIsCustomized(false);
    setProfileThresholds({ ...preset.thresholds });
    showToast(`Limites atualizados para o perfil ${preset.shortLabel}.`);
  };

  const handleThresholdChange = (key: keyof ProfileThresholds, value: number) => {
    setProfileThresholds((prev) => ({ ...prev, [key]: value }));
    setIsCustomized(true);
  };

  const handleCreateLot = (input: NewSeedLotInput) => {
    const created = createSeedLotFromInput(input);
    setSeedLots((prev) => [created, ...prev]);
    setSelectedLotId(created.id);
    showToast(`Lote ${created.lotNumber} cadastrado (IQS ${created.iqsScore}/100).`);
  };

  const handleUpdateLot = (updated: SeedLot, message?: string) => {
    const recalculated = recalculateSeedLot(updated);
    setSeedLots((prev) => prev.map((l) => (l.id === recalculated.id ? recalculated : l)));
    if (message) showToast(message);
  };

  const handleConfirmDeleteLot = () => {
    if (!lotPendingDelete) return;
    const removedNumber = lotPendingDelete.lotNumber;
    setSeedLots((prev) => prev.filter((l) => l.id !== lotPendingDelete.id));
    setLotPendingDelete(null);
    showToast(`Lote ${removedNumber} removido.`);
  };

  const showLotContextBar =
    seedLots.length > 0 && currentLot !== null && activeTab !== 'biblioteca_tecnologia';

  return (
    <div className="min-h-full pb-8">
      {/* Cabeçalho Plano de Elevação Única */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-4 sm:px-6 pt-4 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5">
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
              Análise de Sementes &amp; IQS
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Qualidade física, germinação (TPG), vigor tetrazólio, sanidade, armazenamento e Boletim RAS/MAPA.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select
              aria-label="Perfil regulatório"
              value={selectedProfile}
              onChange={(e) => handleProfileChange(e.target.value as RegulatoryProfileId)}
              className="h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
            >
              {Object.values(REGULATORY_PROFILES).map((p) => (
                <option key={p.id} value={p.id}>
                  Perfil: {p.shortLabel}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setIsNewLotOpen(true)}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Novo lote</span>
            </button>
          </div>
        </div>

        {/* Navegação Horizontal (Underline Tabs) */}
        <nav
          aria-label="Seções de Análise de Sementes"
          className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto border-t border-slate-100 dark:border-zinc-800/80 -mb-px"
        >
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                className={`px-2.5 py-2.5 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-semibold'
                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-4">
        {/* Feedback Inline */}
        {notification && (
          <div className="bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/60 rounded-xl px-3.5 py-2 text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">{notification}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              aria-label="Fechar notificação"
              className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Barra de Contexto do Lote Ativo */}
        {showLotContextBar && currentLot && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs print:hidden">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <label
                htmlFor="seed-lot-selector"
                className="font-medium text-slate-500 dark:text-zinc-400 shrink-0"
              >
                Lote:
              </label>
              <select
                id="seed-lot-selector"
                value={selectedLotId}
                onChange={(e) => setSelectedLotId(e.target.value)}
                className="h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {seedLots.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.lotNumber} — {l.speciesName} ({l.cultivar})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-slate-500 dark:text-zinc-400 tabular-nums">
              <span>{currentLot.seedClass}</span>
              <span aria-hidden="true">·</span>
              <span>Safra {currentLot.cropSeason}</span>
              <span aria-hidden="true">·</span>
              <span>
                IQS{' '}
                <strong className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {currentLot.iqsScore}/100 ({currentLot.iqsClassification})
                </strong>
              </span>
              <button
                type="button"
                onClick={() => setLotPendingDelete(currentLot)}
                aria-label="Excluir lote selecionado"
                title="Excluir lote"
                className="ml-1 h-7 w-7 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Abas de Dashboard, Recepção e Gêmeo Digital */}
        {(activeTab === 'dashboard_estatisticas' ||
          activeTab === 'recepcao_amostras' ||
          activeTab === 'identidade_gemeo_digital') && (
          <SeedDashboardAndReception
            mode={activeTab}
            seedLots={seedLots}
            currentLot={currentLot}
            thresholds={profileThresholds}
            onSelectLot={setSelectedLotId}
            onUpdateLot={handleUpdateLot}
            onOpenNewLotModal={() => setIsNewLotOpen(true)}
            onNavigateTab={handleSelectTab}
          />
        )}

        {/* Abas de Análises Laboratoriais */}
        {(activeTab === 'qualidade_fisica' ||
          activeTab === 'germinacao' ||
          activeTab === 'vigor' ||
          activeTab === 'umidade') && (
          <SeedLabAnalysesTabs
            mode={activeTab}
            currentLot={currentLot}
            thresholds={profileThresholds}
            onUpdateLot={handleUpdateLot}
            onOpenNewLotModal={() => setIsNewLotOpen(true)}
          />
        )}

        {/* Abas Operacionais, Biblioteca RAS, Sistema Especialista e BAS */}
        {(activeTab === 'sanidade' ||
          activeTab === 'tratamento' ||
          activeTab === 'armazenamento' ||
          activeTab === 'banco_imagens' ||
          activeTab === 'biblioteca_tecnologia' ||
          activeTab === 'sistema_especialista' ||
          activeTab === 'certificados') && (
          <SeedOperationsAndExpertTabs
            mode={activeTab}
            currentLot={currentLot}
            selectedProfile={selectedProfile}
            isCustomized={isCustomized}
            thresholds={profileThresholds}
            onProfileChange={handleProfileChange}
            onThresholdChange={handleThresholdChange}
            onUpdateLot={handleUpdateLot}
            onOpenNewLotModal={() => setIsNewLotOpen(true)}
          />
        )}
      </main>

      {/* Modais */}
      <SeedLotModal
        isOpen={isNewLotOpen}
        onClose={() => setIsNewLotOpen(false)}
        onCreate={handleCreateLot}
      />
      <ConfirmDeleteLotDialog
        lot={lotPendingDelete}
        onCancel={() => setLotPendingDelete(null)}
        onConfirm={handleConfirmDeleteLot}
      />
    </div>
  );
};

export default SeedAnalysisModule;
