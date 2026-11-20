import React, { useEffect, useState } from 'react';
import {
  Scale,
  FileText,
  MapPin,
  FlaskConical,
  Calculator,
  FileCheck2,
  ChevronLeft,
  Plus,
  Share2,
  CloudSun,
  Landmark,
} from 'lucide-react';
import { Pericia } from '../../types/pericia';
import { samplePericias } from '../../data/periciaSampleData';
import { lazyWithRetry } from '../../utils/lazyWithRetry';
import { PericiaDashboard } from './PericiaDashboard';

const PericiaSubmoduleAbertura = lazyWithRetry(() =>
  import('./PericiaSubmoduleAbertura').then(m => ({ default: m.PericiaSubmoduleAbertura }))
);
const PericiaSubmoduleDadosRegiao = lazyWithRetry(() =>
  import('./PericiaSubmoduleDadosRegiao').then(m => ({ default: m.PericiaSubmoduleDadosRegiao }))
);
const PericiaSubmoduleAvaliacaoImovel = lazyWithRetry(() =>
  import('./PericiaSubmoduleAvaliacaoImovel').then(m => ({ default: m.PericiaSubmoduleAvaliacaoImovel }))
);
const PericiaSubmoduleVistoria = lazyWithRetry(() =>
  import('./PericiaSubmoduleVistoria').then(m => ({ default: m.PericiaSubmoduleVistoria }))
);
const PericiaSubmoduleAnalise = lazyWithRetry(() =>
  import('./PericiaSubmoduleAnalise').then(m => ({ default: m.PericiaSubmoduleAnalise }))
);
const PericiaSubmoduleCalculos = lazyWithRetry(() =>
  import('./PericiaSubmoduleCalculos').then(m => ({ default: m.PericiaSubmoduleCalculos }))
);
const PericiaSubmoduleLaudo = lazyWithRetry(() =>
  import('./PericiaSubmoduleLaudo').then(m => ({ default: m.PericiaSubmoduleLaudo }))
);
const NewPericiaModal = lazyWithRetry(() =>
  import('./NewPericiaModal').then(m => ({ default: m.NewPericiaModal }))
);
const EvidenceChainModal = lazyWithRetry(() =>
  import('./EvidenceChainModal').then(m => ({ default: m.EvidenceChainModal }))
);
const PericiaReportGenerator = lazyWithRetry(() =>
  import('./PericiaReportGenerator').then(m => ({ default: m.PericiaReportGenerator }))
);

type PericiaSubmoduleId =
  | 'abertura'
  | 'dados_regiao'
  | 'avaliacao_imovel'
  | 'vistoria'
  | 'analise'
  | 'calculos'
  | 'laudo';

const SUBMODULE_TABS: Array<{ id: PericiaSubmoduleId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'abertura', label: '1. Abertura', icon: FileText },
  { id: 'dados_regiao', label: 'Região & Clima', icon: CloudSun },
  { id: 'avaliacao_imovel', label: 'Avaliação Imóvel', icon: Landmark },
  { id: 'vistoria', label: '2. Vistoria', icon: MapPin },
  { id: 'analise', label: '3. Análise', icon: FlaskConical },
  { id: 'calculos', label: '4. Cálculos', icon: Calculator },
  { id: 'laudo', label: '5. Laudo', icon: FileCheck2 },
];

const VALID_SUBMODULES: PericiaSubmoduleId[] = SUBMODULE_TABS.map(t => t.id);

const SubmoduleFallback: React.FC = () => (
  <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-6 text-center text-xs text-slate-500 dark:text-zinc-400">
    Carregando submódulo pericial...
  </div>
);

interface PericiaModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (subTab: string) => void;
}

export const PericiaModule: React.FC<PericiaModuleProps> = ({
  activeSubTab,
  setActiveSubTab,
}) => {
  const [periciasList, setPericiasList] = useState<Pericia[]>(() => {
    try {
      const saved = localStorage.getItem('agronutri_pericias_pro_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((p: any) => p && p.id && !p.id.startsWith('per-'));
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar perícias do localStorage:', e);
    }
    return [];
  });

  const [selectedPericia, setSelectedPericia] = useState<Pericia | null>(null);
  const [activeSubmodule, setActiveSubmodule] = useState<'dashboard' | PericiaSubmoduleId>('dashboard');

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeModalPericia, setActiveModalPericia] = useState<Pericia | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('agronutri_pericias_pro_v1', JSON.stringify(periciasList));
    } catch (e) {
      console.warn('Erro ao salvar perícias no localStorage:', e);
    }
  }, [periciasList]);

  useEffect(() => {
    if (!activeSubTab) return;

    if (activeSubTab === 'dashboard') {
      setActiveSubmodule('dashboard');
      return;
    }

    if (VALID_SUBMODULES.includes(activeSubTab as PericiaSubmoduleId)) {
      const targetSub = activeSubTab as PericiaSubmoduleId;
      setActiveSubmodule(targetSub);
      setSelectedPericia(current => {
        if (!current && periciasList.length > 0) {
          return periciasList[0];
        }
        return current;
      });
    }
  }, [activeSubTab, periciasList]);

  const handleSelectPericia = (p: Pericia, targetSub: PericiaSubmoduleId = 'abertura') => {
    setSelectedPericia(p);
    setActiveSubmodule(targetSub);
    if (setActiveSubTab) {
      setActiveSubTab(targetSub);
    }
  };

  const handleNavigateSubmodule = (targetSub: PericiaSubmoduleId) => {
    setActiveSubmodule(targetSub);
    if (setActiveSubTab) {
      setActiveSubTab(targetSub);
    }
  };

  const handleBackToDashboard = () => {
    setSelectedPericia(null);
    setActiveSubmodule('dashboard');
    if (setActiveSubTab) {
      setActiveSubTab('dashboard');
    }
  };

  const handleUpdatePericia = (updated: Pericia) => {
    setPericiasList(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    if (selectedPericia?.id === updated.id) {
      setSelectedPericia(updated);
    }
  };

  const handleCreatePericia = (newP: Pericia) => {
    setPericiasList(prev => [newP, ...prev]);
    setSelectedPericia(newP);
    setActiveSubmodule('abertura');
    if (setActiveSubTab) {
      setActiveSubTab('abertura');
    }
  };

  const handleDeletePericia = (id: string) => {
    setPericiasList(prev => prev.filter(p => p.id !== id));
    if (selectedPericia?.id === id) {
      setSelectedPericia(null);
      setActiveSubmodule('dashboard');
      if (setActiveSubTab) {
        setActiveSubTab('dashboard');
      }
    }
  };

  const handleLoadDemoPericias = () => {
    setPericiasList(samplePericias);
  };

  const handleClearAllPericias = () => {
    setPericiasList([]);
    setSelectedPericia(null);
    setActiveSubmodule('dashboard');
    if (setActiveSubTab) {
      setActiveSubTab('dashboard');
    }
  };

  const handleOpenEvidenceModal = (p: Pericia) => {
    setActiveModalPericia(p);
    setIsEvidenceModalOpen(true);
  };

  const handleOpenReportModal = (p: Pericia) => {
    setActiveModalPericia(p);
    setIsReportModalOpen(true);
  };

  const activeSubmoduleLabel =
    SUBMODULE_TABS.find(t => t.id === activeSubmodule)?.label || 'Submódulo Pericial';

  return (
    <div className="space-y-5 pb-8 animate-fade-in">
      {/* ACTIVE PERÍCIA CONTEXT HEADER & HAIRLINE SUB-TABS */}
      {selectedPericia && activeSubmodule !== 'dashboard' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={handleBackToDashboard}
                className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Perícias</span>
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    {selectedPericia.codigoPericia}
                  </span>
                  <span className="text-slate-300 dark:text-zinc-700">·</span>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                    {selectedPericia.nome}
                  </h2>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                  {selectedPericia.contratanteNome} · {selectedPericia.imovelNome} ({selectedPericia.municipio}/{selectedPericia.uf})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenEvidenceModal(selectedPericia)}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Custódia</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenReportModal(selectedPericia)}
                className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Gerar Laudo PDF</span>
              </button>
            </div>
          </div>

          {/* SUBMODULE HAIRLINE NAV */}
          <div className="border-t border-slate-200/80 dark:border-zinc-800 px-3 sm:px-5 overflow-x-auto no-scrollbar">
            <nav className="flex items-center gap-1 min-w-max" aria-label="Etapas da Perícia">
              {SUBMODULE_TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeSubmodule === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleNavigateSubmodule(tab.id)}
                    className={`relative h-10 px-2.5 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                        : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
                    {isActive && (
                      <span className="absolute inset-x-1 bottom-0 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* SELECT PERÍCIA EMPTY STATE WHEN DIRECTLY ENTERING A SUBMODULE */}
      {activeSubmodule !== 'dashboard' && !selectedPericia && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-6 max-w-xl mx-auto space-y-4">
          <div className="flex items-start gap-3">
            <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Selecione uma Perícia Técnica
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Para acessar <strong className="font-medium text-slate-700 dark:text-zinc-200">{activeSubmoduleLabel}</strong>, escolha um processo cadastrado ou inicie uma nova perícia.
              </p>
            </div>
          </div>

          {periciasList.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200/80 dark:border-zinc-800 rounded-lg max-h-64 overflow-y-auto">
              {periciasList.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPericia(p, activeSubmodule as PericiaSubmoduleId)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        {p.codigoPericia}
                      </span>
                      <span className="text-xs font-medium text-slate-900 dark:text-zinc-100 truncate">
                        {p.nome}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                      {p.imovelNome} · {p.contratanteNome} ({p.municipio}/{p.uf})
                    </p>
                  </div>
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 shrink-0">
                    Abrir
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsNewModalOpen(true)}
                className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Perícia</span>
              </button>
              <button
                type="button"
                onClick={handleLoadDemoPericias}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium cursor-pointer"
              >
                Carregar Exemplo
              </button>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleBackToDashboard}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
            >
              &larr; Voltar ao Dashboard de Perícias
            </button>
          </div>
        </div>
      )}

      {/* MAIN SUBMODULE ROUTER */}
      {activeSubmodule === 'dashboard' && (
        <PericiaDashboard
          pericias={periciasList}
          onSelectPericia={handleSelectPericia}
          onOpenNewModal={() => setIsNewModalOpen(true)}
          onOpenEvidenceChain={handleOpenEvidenceModal}
          onOpenReportGenerator={handleOpenReportModal}
          onDeletePericia={handleDeletePericia}
          onLoadDemoPericias={handleLoadDemoPericias}
          onClearAllPericias={handleClearAllPericias}
        />
      )}

      <React.Suspense fallback={<SubmoduleFallback />}>
        {selectedPericia && activeSubmodule === 'abertura' && (
          <PericiaSubmoduleAbertura pericia={selectedPericia} onUpdatePericia={handleUpdatePericia} />
        )}

        {selectedPericia && activeSubmodule === 'dados_regiao' && (
          <PericiaSubmoduleDadosRegiao pericia={selectedPericia} onUpdatePericia={handleUpdatePericia} />
        )}

        {selectedPericia && activeSubmodule === 'avaliacao_imovel' && (
          <PericiaSubmoduleAvaliacaoImovel pericia={selectedPericia} onUpdatePericia={handleUpdatePericia} />
        )}

        {selectedPericia && activeSubmodule === 'vistoria' && (
          <PericiaSubmoduleVistoria pericia={selectedPericia} onUpdatePericia={handleUpdatePericia} />
        )}

        {selectedPericia && activeSubmodule === 'analise' && (
          <PericiaSubmoduleAnalise pericia={selectedPericia} onUpdatePericia={handleUpdatePericia} />
        )}

        {selectedPericia && activeSubmodule === 'calculos' && (
          <PericiaSubmoduleCalculos pericia={selectedPericia} onUpdatePericia={handleUpdatePericia} />
        )}

        {selectedPericia && activeSubmodule === 'laudo' && (
          <PericiaSubmoduleLaudo
            pericia={selectedPericia}
            onUpdatePericia={handleUpdatePericia}
            onOpenReportGenerator={() => handleOpenReportModal(selectedPericia)}
          />
        )}
      </React.Suspense>

      {/* LAZY-LOADED MODALS */}
      <React.Suspense fallback={null}>
        {isNewModalOpen && (
          <NewPericiaModal
            isOpen
            onClose={() => setIsNewModalOpen(false)}
            onCreatePericia={handleCreatePericia}
          />
        )}

        {isEvidenceModalOpen && (
          <EvidenceChainModal
            isOpen
            pericia={activeModalPericia}
            onClose={() => setIsEvidenceModalOpen(false)}
          />
        )}

        {isReportModalOpen && (
          <PericiaReportGenerator
            isOpen
            pericia={activeModalPericia}
            onClose={() => setIsReportModalOpen(false)}
          />
        )}
      </React.Suspense>
    </div>
  );
};

export default PericiaModule;
