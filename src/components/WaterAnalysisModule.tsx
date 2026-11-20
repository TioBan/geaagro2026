import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Droplets,
  Plus,
  Activity,
  FlaskConical,
  Microscope,
  Wrench,
  MapPin,
  Sprout,
  FileText,
  CheckCircle2,
  X,
} from 'lucide-react';
import { CollectionPoint, WaterAnalysisRecord } from '../types/waterAnalysis';
import {
  WATER_ANALYSIS_DATABASE,
  COLLECTION_POINTS_DATABASE,
  DEFAULT_BLANK_ANALYSIS,
  DEFAULT_BLANK_POINT,
} from '../data/waterAnalysisData';
import { lazyWithRetry } from '../utils/lazyWithRetry';
import {
  COLLECTION_POINTS_STORAGE_KEY,
  EMITTER_RISK_META,
  IGA_META,
  WATER_STORAGE_KEY,
  WaterAnalysisSubTab,
} from './water/waterConstants';
import { WaterDashboardIgaView } from './water/WaterDashboardIgaView';
import { WaterSamplesListView } from './water/WaterSamplesListView';

export type { WaterAnalysisSubTab };

const WaterInterpretationView = lazyWithRetry(() =>
  import('./water/WaterInterpretationView').then((m) => ({ default: m.WaterInterpretationView }))
);
const WaterCorrectionAssistantView = lazyWithRetry(() =>
  import('./water/WaterCorrectionAssistantView').then((m) => ({
    default: m.WaterCorrectionAssistantView,
  }))
);
const WaterCollectionPointsView = lazyWithRetry(() =>
  import('./water/WaterCollectionPointsView').then((m) => ({ default: m.WaterCollectionPointsView }))
);
const WaterCropSalinityView = lazyWithRetry(() =>
  import('./water/WaterCropSalinityView').then((m) => ({ default: m.WaterCropSalinityView }))
);
const WaterOfficialReportView = lazyWithRetry(() =>
  import('./water/WaterOfficialReportView').then((m) => ({ default: m.WaterOfficialReportView }))
);
const WaterAnalysisModal = lazyWithRetry(() =>
  import('./water/WaterModals').then((m) => ({ default: m.WaterAnalysisModal }))
);
const WaterCollectionPointModal = lazyWithRetry(() =>
  import('./water/WaterModals').then((m) => ({ default: m.WaterCollectionPointModal }))
);

interface WaterAnalysisModuleProps {
  activeSubTab?: WaterAnalysisSubTab;
  setActiveSubTab?: (tab: WaterAnalysisSubTab) => void;
}

const SUBTABS: { id: WaterAnalysisSubTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard_iga', label: 'Painel IGA', icon: Activity },
  { id: 'laboratorio_amostras', label: 'Amostras', icon: FlaskConical },
  { id: 'interpretacao_agronomica', label: 'Interpretação', icon: Microscope },
  { id: 'assistente_correcao', label: 'Correção', icon: Wrench },
  { id: 'pontos_coleta', label: 'Pontos de Coleta', icon: MapPin },
  { id: 'banco_culturas', label: 'Tolerância Salina', icon: Sprout },
  { id: 'laudo_oficial', label: 'Laudo Oficial', icon: FileText },
];

const TabLoadingFallback: React.FC = () => (
  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
    Carregando painel...
  </div>
);

export const WaterAnalysisModule: React.FC<WaterAnalysisModuleProps> = ({
  activeSubTab: propSubTab,
  setActiveSubTab: propSetSubTab,
}) => {
  const [internalSubTab, setInternalSubTab] = useState<WaterAnalysisSubTab>('dashboard_iga');
  const activeSubTab = propSubTab ?? internalSubTab;
  const setActiveSubTab = propSetSubTab ?? setInternalSubTab;

  // Persistent Analyses
  const [analyses, setAnalyses] = useState<WaterAnalysisRecord[]>(() => {
    try {
      const saved = localStorage.getItem(WATER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback to initial database
    }
    return WATER_ANALYSIS_DATABASE;
  });

  // Persistent Collection Points
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>(() => {
    try {
      const saved = localStorage.getItem(COLLECTION_POINTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback to initial database
    }
    return COLLECTION_POINTS_DATABASE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(WATER_STORAGE_KEY, JSON.stringify(analyses));
    } catch {
      // Ignore storage quota errors
    }
  }, [analyses]);

  useEffect(() => {
    try {
      localStorage.setItem(COLLECTION_POINTS_STORAGE_KEY, JSON.stringify(collectionPoints));
    } catch {
      // Ignore storage quota errors
    }
  }, [collectionPoints]);

  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>(() => analyses[0]?.id ?? '');

  useEffect(() => {
    if (analyses.length === 0) {
      setSelectedAnalysisId('');
      return;
    }
    if (!analyses.some((a) => a.id === selectedAnalysisId)) {
      setSelectedAnalysisId(analyses[0].id);
    }
  }, [analyses, selectedAnalysisId]);

  // Modal State
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WaterAnalysisRecord | null>(null);
  const [presetPointIdForNewSample, setPresetPointIdForNewSample] = useState<string | undefined>(undefined);

  const [isPointModalOpen, setIsPointModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<CollectionPoint | null>(null);

  // Notification Toast with tracked cleanup
  const [notification, setNotification] = useState<string | null>(null);
  const notificationTimerRef = useRef<number | null>(null);

  const showNotification = useCallback((message: string) => {
    if (notificationTimerRef.current !== null) {
      window.clearTimeout(notificationTimerRef.current);
    }
    setNotification(message);
    notificationTimerRef.current = window.setTimeout(() => {
      setNotification(null);
      notificationTimerRef.current = null;
    }, 3600);
  }, []);

  useEffect(() => {
    return () => {
      if (notificationTimerRef.current !== null) {
        window.clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  const currentAnalysis = useMemo(() => {
    return analyses.find((a) => a.id === selectedAnalysisId) ?? analyses[0] ?? DEFAULT_BLANK_ANALYSIS;
  }, [analyses, selectedAnalysisId]);

  const currentPoint = useMemo(() => {
    return (
      collectionPoints.find((p) => p.id === currentAnalysis.collectionPointId) ??
      collectionPoints[0] ??
      DEFAULT_BLANK_POINT
    );
  }, [collectionPoints, currentAnalysis.collectionPointId]);

  const hasAnalyses = analyses.length > 0;
  const ecDsM = currentAnalysis.physical.electricalConductivityMicroS / 1000;
  const igaMeta = IGA_META[currentAnalysis.calculated.igaClassification];
  const emitterMeta = EMITTER_RISK_META[currentAnalysis.calculated.emitterCloggingRisk];

  // Handlers
  const handleOpenNewAnalysis = useCallback((pointId?: string) => {
    setEditingRecord(null);
    setPresetPointIdForNewSample(pointId);
    setIsAnalysisModalOpen(true);
  }, []);

  const handleOpenEditAnalysis = useCallback((record: WaterAnalysisRecord) => {
    setEditingRecord(record);
    setPresetPointIdForNewSample(undefined);
    setIsAnalysisModalOpen(true);
  }, []);

  const handleSaveAnalysis = useCallback(
    (record: WaterAnalysisRecord, isEdit: boolean) => {
      setAnalyses((prev) =>
        isEdit ? prev.map((a) => (a.id === record.id ? record : a)) : [record, ...prev]
      );
      setSelectedAnalysisId(record.id);
      setIsAnalysisModalOpen(false);
      setEditingRecord(null);
      showNotification(
        isEdit
          ? `Amostra ${record.sampleCode} atualizada com sucesso.`
          : `Amostra ${record.sampleCode} cadastrada com sucesso.`
      );
    },
    [showNotification]
  );

  const handleDeleteAnalysis = useCallback(
    (id: string) => {
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      showNotification('Amostra removida do histórico.');
    },
    [showNotification]
  );

  const handleOpenNewPoint = useCallback(() => {
    setEditingPoint(null);
    setIsPointModalOpen(true);
  }, []);

  const handleOpenEditPoint = useCallback((point: CollectionPoint) => {
    setEditingPoint(point);
    setIsPointModalOpen(true);
  }, []);

  const handleSavePoint = useCallback(
    (point: CollectionPoint, isEdit: boolean) => {
      setCollectionPoints((prev) =>
        isEdit ? prev.map((p) => (p.id === point.id ? point : p)) : [point, ...prev]
      );
      setIsPointModalOpen(false);
      setEditingPoint(null);
      showNotification(
        isEdit
          ? `Ponto "${point.name}" atualizado.`
          : `Ponto "${point.name}" cadastrado.`
      );
    },
    [showNotification]
  );

  const handleDeletePoint = useCallback(
    (pointId: string) => {
      setCollectionPoints((prev) => prev.filter((p) => p.id !== pointId));
      showNotification('Ponto de coleta removido.');
    },
    [showNotification]
  );

  return (
    <div className="space-y-4">
      {/* Compact Hairline Header */}
      <div className="print:hidden bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Droplets className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-semibold tracking-tight text-slate-900 dark:text-zinc-100 truncate">
                Análise de Água &amp; Qualidade Hídrica
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                IGA, enquadramento CONAMA 357, irrigação FAO 29, fertirrigação e tolerância salina.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleOpenNewPoint}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
              Novo Ponto
            </button>
            <button
              type="button"
              onClick={() => handleOpenNewAnalysis()}
              className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova Análise
            </button>
          </div>
        </div>

        {/* 6-KPI Hairline Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Amostras</span>
            <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-zinc-100">
              {analyses.length}
            </span>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">IGA em Foco</span>
            <span className={`text-sm font-bold tabular-nums ${hasAnalyses ? igaMeta.textClass : 'text-slate-400 dark:text-zinc-500'}`}>
              {hasAnalyses ? `${currentAnalysis.calculated.igaScore}/100` : '—'}
            </span>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">pH</span>
            <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-zinc-100">
              {hasAnalyses ? currentAnalysis.chemical.ph.toFixed(2) : '—'}
            </span>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">CEw (dS/m)</span>
            <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-zinc-100">
              {hasAnalyses ? ecDsM.toFixed(2) : '—'}
            </span>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Classe USSL</span>
            <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-zinc-100">
              {hasAnalyses
                ? `${currentAnalysis.calculated.salinityClass}-${currentAnalysis.calculated.sodicityClass}`
                : '—'}
            </span>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Emissores</span>
            <span className={`text-sm font-bold ${hasAnalyses ? emitterMeta.textClass : 'text-slate-400 dark:text-zinc-500'}`}>
              {hasAnalyses ? emitterMeta.label : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Subtab Navigation + Focused Sample Strip */}
      <div className="print:hidden flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-1 flex items-center gap-1 overflow-x-auto">
          {SUBTABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`h-8 px-2.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {hasAnalyses && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 whitespace-nowrap">
              Amostra em foco:
            </span>
            <select
              value={currentAnalysis.id}
              onChange={(e) => setSelectedAnalysisId(e.target.value)}
              aria-label="Selecionar amostra de água em foco"
              className="h-7 px-2 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 max-w-[240px]"
            >
              {analyses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.sampleCode} — {a.propertyName || 'Sem fazenda'} ({a.collectionDate})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Inline Notification */}
      {notification && (
        <div className="print:hidden bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/50 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs text-emerald-700 dark:text-emerald-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            aria-label="Fechar notificação"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Active Subtab Content */}
      {activeSubTab === 'dashboard_iga' && (
        <WaterDashboardIgaView
          hasAnalyses={hasAnalyses}
          analysis={currentAnalysis}
          point={currentPoint}
          onCreateAnalysis={() => handleOpenNewAnalysis()}
          onNavigateSubTab={setActiveSubTab}
        />
      )}

      {activeSubTab === 'laboratorio_amostras' && (
        <WaterSamplesListView
          analyses={analyses}
          collectionPoints={collectionPoints}
          selectedAnalysisId={currentAnalysis.id}
          onSelectAnalysis={setSelectedAnalysisId}
          onCreateAnalysis={() => handleOpenNewAnalysis()}
          onEditAnalysis={handleOpenEditAnalysis}
          onDeleteAnalysis={handleDeleteAnalysis}
          onOpenInterpretation={(id) => {
            setSelectedAnalysisId(id);
            setActiveSubTab('interpretacao_agronomica');
          }}
        />
      )}

      {activeSubTab === 'interpretacao_agronomica' && (
        <Suspense fallback={<TabLoadingFallback />}>
          <WaterInterpretationView analysis={currentAnalysis} />
        </Suspense>
      )}

      {activeSubTab === 'assistente_correcao' && (
        <Suspense fallback={<TabLoadingFallback />}>
          <WaterCorrectionAssistantView analysis={currentAnalysis} />
        </Suspense>
      )}

      {activeSubTab === 'pontos_coleta' && (
        <Suspense fallback={<TabLoadingFallback />}>
          <WaterCollectionPointsView
            collectionPoints={collectionPoints}
            analyses={analyses}
            onCreatePoint={handleOpenNewPoint}
            onEditPoint={handleOpenEditPoint}
            onDeletePoint={handleDeletePoint}
            onCreateSampleForPoint={(ptId) => handleOpenNewAnalysis(ptId)}
          />
        </Suspense>
      )}

      {activeSubTab === 'banco_culturas' && (
        <Suspense fallback={<TabLoadingFallback />}>
          <WaterCropSalinityView sampleEcDsM={ecDsM} hasAnalyses={hasAnalyses} />
        </Suspense>
      )}

      {activeSubTab === 'laudo_oficial' && (
        <Suspense fallback={<TabLoadingFallback />}>
          <WaterOfficialReportView analysis={currentAnalysis} point={currentPoint} />
        </Suspense>
      )}

      {/* Lazy-loaded Modals */}
      {isAnalysisModalOpen && (
        <Suspense fallback={null}>
          <WaterAnalysisModal
            isOpen={isAnalysisModalOpen}
            editingRecord={editingRecord}
            initialPointId={presetPointIdForNewSample}
            collectionPoints={collectionPoints}
            onClose={() => {
              setIsAnalysisModalOpen(false);
              setEditingRecord(null);
            }}
            onSave={handleSaveAnalysis}
          />
        </Suspense>
      )}

      {isPointModalOpen && (
        <Suspense fallback={null}>
          <WaterCollectionPointModal
            isOpen={isPointModalOpen}
            editingPoint={editingPoint}
            onClose={() => {
              setIsPointModalOpen(false);
              setEditingPoint(null);
            }}
            onSave={handleSavePoint}
          />
        </Suspense>
      )}
    </div>
  );
};

export default WaterAnalysisModule;
