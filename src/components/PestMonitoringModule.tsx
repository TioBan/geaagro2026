import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutGrid,
  Radar,
  Target,
  MapPin,
  Activity,
  ShieldCheck,
  BookOpen,
  Bug,
  Plus,
  CheckCircle2,
  X,
  Trash2,
} from 'lucide-react';
import {
  PestTab,
  PestField,
  PestInspection,
  Trap,
  PestManagement,
} from '../types/pests';
import {
  PEST_SPECIES_CATALOG,
  INITIAL_PEST_FIELDS,
  NATURAL_ENEMIES_CATALOG,
} from '../data/pestsData';
import { MipDashboardAndRadar } from './mip/MipDashboardAndRadar';
import { MipOperationsTabs } from './mip/MipOperationsTabs';
import { MipKnowledgeTabs } from './mip/MipKnowledgeTabs';
import { MipModals, MipConfirmDialogState } from './mip/MipModals';

interface PestMonitoringModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: PestTab) => void;
}

const STORAGE_KEY = 'geaagro_mip_fields_v1';

type CanonicalMipTab =
  | 'dashboard'
  | 'radar'
  | 'monitoramento'
  | 'mapa'
  | 'curvas'
  | 'manejo'
  | 'banco_pragas'
  | 'inimigos_naturais';

function normalizeMipTab(tab?: string): CanonicalMipTab {
  switch (tab) {
    case 'dashboard':
    case 'radar':
    case 'monitoramento':
    case 'mapa':
    case 'curvas':
    case 'manejo':
    case 'banco_pragas':
    case 'inimigos_naturais':
      return tab;
    case 'armadilhas':
    case 'diario':
      return 'monitoramento';
    case 'biblioteca':
      return 'banco_pragas';
    default:
      return 'dashboard';
  }
}

export const PestMonitoringModule: React.FC<PestMonitoringModuleProps> = ({
  activeSubTab,
  setActiveSubTab,
}) => {
  const [internalTab, setInternalTab] = useState<CanonicalMipTab>('dashboard');
  const activeTab: CanonicalMipTab = activeSubTab
    ? normalizeMipTab(activeSubTab)
    : internalTab;

  const handleSelectTab = (tab: CanonicalMipTab) => {
    setInternalTab(tab);
    if (setActiveSubTab) {
      setActiveSubTab(tab);
    }
  };

  // Persistent monitored fields
  const [fields, setFields] = useState<PestField[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback to initial state
    }
    return INITIAL_PEST_FIELDS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
    } catch {
      // Ignore storage quota errors
    }
  }, [fields]);

  const [selectedFieldId, setSelectedFieldId] = useState<string>(
    () => fields[0]?.id || ''
  );

  // Sync selected field if list changes
  useEffect(() => {
    if (fields.length === 0) {
      if (selectedFieldId !== '') setSelectedFieldId('');
    } else if (!fields.some((f) => f.id === selectedFieldId)) {
      setSelectedFieldId(fields[0].id);
    }
  }, [fields, selectedFieldId]);

  // Pest Bank filter states
  const [selectedPestId, setSelectedPestId] = useState<string>(
    PEST_SPECIES_CATALOG[0]?.id || 'spodoptera_frugiperda'
  );
  const [cropFilter, setCropFilter] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & toast feedback
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [inspectionDefaultPestId, setInspectionDefaultPestId] = useState<string | undefined>(
    undefined
  );
  const [showTrapModal, setShowTrapModal] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<MipConfirmDialogState | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const currentField = useMemo(
    () => fields.find((f) => f?.id === selectedFieldId) || fields[0] || null,
    [fields, selectedFieldId]
  );

  const filteredPests = useMemo(() => {
    return PEST_SPECIES_CATALOG.filter((pest) => {
      const matchesCrop =
        cropFilter === 'Todas' ||
        pest.hosts.some((h) => h.toLowerCase() === cropFilter.toLowerCase()) ||
        pest.otherHosts?.some((oh) => oh.toLowerCase() === cropFilter.toLowerCase());

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        pest.scientificName.toLowerCase().includes(query) ||
        pest.commonName.toLowerCase().includes(query) ||
        pest.order.toLowerCase().includes(query) ||
        pest.family.toLowerCase().includes(query);

      return matchesCrop && matchesSearch;
    });
  }, [cropFilter, searchQuery]);

  const currentPest = useMemo(() => {
    const found = filteredPests.find((p) => p?.id === selectedPestId);
    if (found) return found;
    return filteredPests[0] || PEST_SPECIES_CATALOG[0] || null;
  }, [selectedPestId, filteredPests]);

  // Total counters across fields
  const totalInspections = useMemo(
    () => fields.reduce((acc, f) => acc + (f.inspections?.length || 0), 0),
    [fields]
  );

  // Handlers
  const handleCreateField = (newField: PestField) => {
    setFields((prev) => [newField, ...prev]);
    setSelectedFieldId(newField.id);
    showToast(`Talhão "${newField.fieldName}" cadastrado para monitoramento.`);
  };

  const handleDeleteCurrentField = () => {
    if (!currentField) return;
    setConfirmDialog({
      title: 'Excluir talhão monitorado',
      message: `Deseja excluir "${currentField.fieldName}" e todos os registros de inspeções, armadilhas e manejo vinculados?`,
      confirmLabel: 'Excluir talhão',
      variant: 'danger',
      onConfirm: () => {
        setFields((prev) => prev.filter((f) => f.id !== currentField.id));
        showToast(`Talhão "${currentField.fieldName}" removido.`);
      },
    });
  };

  const handleUpdateFieldStage = (fieldId: string, stage: string) => {
    setFields((prev) =>
      prev.map((f) =>
        f.id === fieldId ? { ...f, currentPhenologicalStage: stage } : f
      )
    );
  };

  const handleCreateInspection = (inspection: PestInspection) => {
    setFields((prev) =>
      prev.map((f) =>
        f.id === inspection.fieldId
          ? { ...f, inspections: [inspection, ...f.inspections] }
          : f
      )
    );
    showToast(`Inspeção registrada no ponto ${inspection.pointCode}.`);
  };

  const handleDeleteInspection = (inspectionId: string) => {
    if (!currentField) return;
    setConfirmDialog({
      title: 'Excluir inspeção',
      message: 'Deseja remover este registro de inspeção de campo?',
      confirmLabel: 'Excluir',
      variant: 'danger',
      onConfirm: () => {
        setFields((prev) =>
          prev.map((f) =>
            f.id === currentField.id
              ? { ...f, inspections: f.inspections.filter((i) => i.id !== inspectionId) }
              : f
          )
        );
        showToast('Inspeção removida.');
      },
    });
  };

  const handleCreateTrap = (trap: Trap) => {
    setFields((prev) =>
      prev.map((f) =>
        f.id === trap.fieldId ? { ...f, traps: [trap, ...f.traps] } : f
      )
    );
    showToast(`Armadilha "${trap.code}" cadastrada.`);
  };

  const handleUpdateTrapCaptures = (trapId: string, delta: number) => {
    if (!currentField) return;
    setFields((prev) =>
      prev.map((f) =>
        f.id === currentField.id
          ? {
              ...f,
              traps: f.traps.map((t) =>
                t.id === trapId
                  ? { ...t, totalCaptured: Math.max(0, t.totalCaptured + delta) }
                  : t
              ),
            }
          : f
      )
    );
  };

  const handleDeleteTrap = (trapId: string) => {
    if (!currentField) return;
    setConfirmDialog({
      title: 'Excluir armadilha',
      message: 'Deseja remover esta armadilha do monitoramento?',
      confirmLabel: 'Excluir',
      variant: 'danger',
      onConfirm: () => {
        setFields((prev) =>
          prev.map((f) =>
            f.id === currentField.id
              ? { ...f, traps: f.traps.filter((t) => t.id !== trapId) }
              : f
          )
        );
        showToast('Armadilha removida.');
      },
    });
  };

  const handleCreateManagement = (management: PestManagement) => {
    setFields((prev) =>
      prev.map((f) =>
        f.id === management.fieldId
          ? { ...f, managements: [management, ...f.managements] }
          : f
      )
    );
    showToast(`Manejo (${management.type}) registrado com sucesso.`);
  };

  const handleDeleteManagement = (managementId: string) => {
    if (!currentField) return;
    setConfirmDialog({
      title: 'Excluir registro de manejo',
      message: 'Deseja remover esta aplicação do histórico do talhão?',
      confirmLabel: 'Excluir',
      variant: 'danger',
      onConfirm: () => {
        setFields((prev) =>
          prev.map((f) =>
            f.id === currentField.id
              ? { ...f, managements: f.managements.filter((m) => m.id !== managementId) }
              : f
          )
        );
        showToast('Registro de manejo removido.');
      },
    });
  };

  const openInspectionModal = (pestId?: string) => {
    if (!currentField) {
      setShowFieldModal(true);
      return;
    }
    setInspectionDefaultPestId(pestId);
    setShowInspectionModal(true);
  };

  const openPestInBank = (pestId: string) => {
    setCropFilter('Todas');
    setSearchQuery('');
    setSelectedPestId(pestId);
    handleSelectTab('banco_pragas');
  };

  const navTabs: {
    id: CanonicalMipTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }[] = [
    { id: 'dashboard', label: 'Dashboard MIP', icon: LayoutGrid },
    { id: 'radar', label: 'Radar Fitossanitário', icon: Radar },
    {
      id: 'monitoramento',
      label: 'Inspeções',
      icon: Target,
      count: currentField?.inspections.length,
    },
    { id: 'mapa', label: 'Distribuição', icon: MapPin },
    { id: 'curvas', label: 'Curvas', icon: Activity },
    {
      id: 'manejo',
      label: 'Manejo & NDE',
      icon: ShieldCheck,
      count: currentField?.managements.length,
    },
    {
      id: 'banco_pragas',
      label: 'Banco de Pragas',
      icon: BookOpen,
      count: PEST_SPECIES_CATALOG.length,
    },
    {
      id: 'inimigos_naturais',
      label: 'Controle Biológico',
      icon: Bug,
    },
  ];

  const showFieldContextBar =
    activeTab !== 'banco_pragas' && activeTab !== 'inimigos_naturais' && fields.length > 0;

  return (
    <div className="min-h-full bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 pb-8">
      {/* Cabeçalho Plano */}
      <header className="bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 px-4 sm:px-6 pt-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
                MIP &amp; Radar Fitossanitário
              </h1>
              <span className="text-xs text-slate-400 dark:text-zinc-500" aria-hidden="true">
                ·
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                Monitoramento de Pragas, Fenologia &amp; Controle Integrado
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
              <span>
                {fields.length} {fields.length === 1 ? 'talhão' : 'talhões'}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {totalInspections} {totalInspections === 1 ? 'inspeção' : 'inspeções'}
              </span>
              <span aria-hidden="true">·</span>
              <span>{PEST_SPECIES_CATALOG.length} pragas catalogadas</span>
              <span aria-hidden="true">·</span>
              <span>{NATURAL_ENEMIES_CATALOG.length}+ agentes biológicos</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {currentField && (
              <button
                type="button"
                onClick={() => openInspectionModal()}
                className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Inspeção</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowFieldModal(true)}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Novo talhão</span>
            </button>
          </div>
        </div>

        {/* Navegação Horizontal (Underline Tabs) */}
        <nav
          aria-label="Seções do MIP e Radar Fitossanitário"
          className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto border-t border-slate-100 dark:border-zinc-800/80 -mb-px"
        >
          {navTabs.map((tab) => {
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
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Área Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-4">
        {/* Feedback Inline */}
        {toastMessage && (
          <div className="bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/60 rounded-xl px-3.5 py-2 text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              aria-label="Fechar aviso"
              className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Barra de Contexto do Talhão */}
        {showFieldContextBar && currentField && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <label
                htmlFor="mip-field-selector"
                className="font-medium text-slate-500 dark:text-zinc-400 shrink-0"
              >
                Talhão:
              </label>
              <select
                id="mip-field-selector"
                value={selectedFieldId}
                onChange={(e) => setSelectedFieldId(e.target.value)}
                className="h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.farmName} — {f.fieldName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-slate-500 dark:text-zinc-400 tabular-nums">
              <span>{currentField.crop}</span>
              <span aria-hidden="true">·</span>
              <span>{currentField.areaHa.toLocaleString('pt-BR')} ha</span>
              <span aria-hidden="true">·</span>
              <span>
                Estádio:{' '}
                <strong className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {currentField.currentPhenologicalStage}
                </strong>
              </span>
              <button
                type="button"
                onClick={handleDeleteCurrentField}
                aria-label="Excluir talhão selecionado"
                title="Excluir talhão"
                className="ml-1 h-7 w-7 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Conteúdo das Abas */}
        {(activeTab === 'dashboard' || activeTab === 'radar') && (
          <MipDashboardAndRadar
            mode={activeTab}
            fields={fields}
            currentField={currentField}
            onUpdateFieldStage={handleUpdateFieldStage}
            onOpenFieldModal={() => setShowFieldModal(true)}
            onOpenInspectionModal={openInspectionModal}
            onOpenManagementModal={() => setShowManagementModal(true)}
            onNavigateTab={(t) => handleSelectTab(normalizeMipTab(t))}
            onOpenPestInBank={openPestInBank}
          />
        )}

        {(activeTab === 'monitoramento' ||
          activeTab === 'mapa' ||
          activeTab === 'curvas' ||
          activeTab === 'manejo') && (
          <MipOperationsTabs
            mode={activeTab}
            currentField={currentField}
            onOpenFieldModal={() => setShowFieldModal(true)}
            onOpenInspectionModal={openInspectionModal}
            onOpenTrapModal={() => setShowTrapModal(true)}
            onOpenManagementModal={() => setShowManagementModal(true)}
            onDeleteInspection={handleDeleteInspection}
            onDeleteTrap={handleDeleteTrap}
            onUpdateTrapCaptures={handleUpdateTrapCaptures}
            onDeleteManagement={handleDeleteManagement}
            onOpenPestInBank={openPestInBank}
          />
        )}

        {(activeTab === 'banco_pragas' || activeTab === 'inimigos_naturais') && (
          <MipKnowledgeTabs
            mode={activeTab}
            cropFilter={cropFilter}
            setCropFilter={setCropFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredPests={filteredPests}
            currentPest={currentPest}
            setSelectedPestId={setSelectedPestId}
            onInspectPest={openInspectionModal}
            onOpenPestInBank={openPestInBank}
            hasActiveField={Boolean(currentField)}
          />
        )}
      </main>

      {/* Modais */}
      <MipModals
        showFieldModal={showFieldModal}
        onCloseFieldModal={() => setShowFieldModal(false)}
        onCreateField={handleCreateField}
        showInspectionModal={showInspectionModal}
        onCloseInspectionModal={() => setShowInspectionModal(false)}
        activeField={currentField}
        defaultPestId={inspectionDefaultPestId}
        onCreateInspection={handleCreateInspection}
        showTrapModal={showTrapModal}
        onCloseTrapModal={() => setShowTrapModal(false)}
        onCreateTrap={handleCreateTrap}
        showManagementModal={showManagementModal}
        onCloseManagementModal={() => setShowManagementModal(false)}
        onCreateManagement={handleCreateManagement}
        confirmDialog={confirmDialog}
        onCloseConfirmDialog={() => setConfirmDialog(null)}
      />
    </div>
  );
};

export default PestMonitoringModule;
