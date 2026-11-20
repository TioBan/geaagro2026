import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import {
  Sprout,
  Plus,
  X,
  Activity,
  TrendingUp,
  Droplets,
  ShieldAlert,
  Camera,
  Calendar,
  MapPin,
  Leaf,
  CheckCircle2
} from 'lucide-react';
import {
  CropDigitalTwin,
  PhenologicalStage,
  FieldPhotoRecord,
  TechnicalScheduleItem
} from '../types/phenology';
import { Farm } from '../types/agronomy';
import {
  SOJA_PHENOLOGICAL_STAGES,
  initialCropDigitalTwins,
  initialGrowthCurvePoints,
  initialFieldPhotos,
  initialTechnicalSchedules
} from '../data/phenologyData';
import { lazyWithRetry } from '../utils/lazyWithRetry';

const PhenologyTimeline = lazyWithRetry(() =>
  import('./phenology/PhenologyTimeline').then(m => ({ default: m.PhenologyTimeline }))
);
const PhenologyIdcDiagnostic = lazyWithRetry(() =>
  import('./phenology/PhenologyIdcDiagnostic').then(m => ({ default: m.PhenologyIdcDiagnostic }))
);
const PhenologyPhysiologyCurves = lazyWithRetry(() =>
  import('./phenology/PhenologyPhysiologyCurves').then(m => ({ default: m.PhenologyPhysiologyCurves }))
);
const PhenologyWaterNutrition = lazyWithRetry(() =>
  import('./phenology/PhenologyWaterNutrition').then(m => ({ default: m.PhenologyWaterNutrition }))
);
const PhenologySanityThreats = lazyWithRetry(() =>
  import('./phenology/PhenologySanityThreats').then(m => ({ default: m.PhenologySanityThreats }))
);
const PhenologyPhotoDiary = lazyWithRetry(() =>
  import('./phenology/PhenologyPhotoDiary').then(m => ({ default: m.PhenologyPhotoDiary }))
);
const PhenologyTechnicalAgenda = lazyWithRetry(() =>
  import('./phenology/PhenologyTechnicalAgenda').then(m => ({ default: m.PhenologyTechnicalAgenda }))
);
const PhenologyCropTwinsManager = lazyWithRetry(() =>
  import('./phenology/PhenologyCropTwinsManager').then(m => ({ default: m.PhenologyCropTwinsManager }))
);
const NewPhotoModal = lazyWithRetry(() =>
  import('./phenology/NewPhotoModal').then(m => ({ default: m.NewPhotoModal }))
);
const NewTwinModal = lazyWithRetry(() =>
  import('./phenology/NewTwinModal').then(m => ({ default: m.NewTwinModal }))
);

export type PhenologySubTab =
  | 'linha_tempo'
  | 'gemeo_digital'
  | 'fisiologia'
  | 'nutricao_agua'
  | 'sanidade'
  | 'diario_fotos'
  | 'agenda_tecnica'
  | 'cadastro_lavouras';

const TABS: Array<{
  id: PhenologySubTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'linha_tempo', label: 'Linha do Tempo', icon: Leaf },
  { id: 'gemeo_digital', label: 'Índice IDC', icon: Activity },
  { id: 'fisiologia', label: 'Fisiologia', icon: TrendingUp },
  { id: 'nutricao_agua', label: 'Água & Nutrição', icon: Droplets },
  { id: 'sanidade', label: 'Sanidade', icon: ShieldAlert },
  { id: 'diario_fotos', label: 'Diário de Fotos', icon: Camera },
  { id: 'agenda_tecnica', label: 'Agenda Técnica', icon: Calendar },
  { id: 'cadastro_lavouras', label: 'Lavouras', icon: MapPin }
];

const PHOTOS_STORAGE_KEY = 'agronutri_phenology_photos';
const SCHEDULES_STORAGE_KEY = 'agronutri_phenology_schedules';

interface PhenologyModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: PhenologySubTab) => void;
  selectedFarm?: Farm;
  farms?: Farm[];
}

export const PhenologyModule: React.FC<PhenologyModuleProps> = ({
  activeSubTab: externalSubTab,
  setActiveSubTab: setExternalSubTab,
  selectedFarm
}) => {
  const [internalSubTab, setInternalSubTab] = useState<PhenologySubTab>('linha_tempo');
  const activeSubTab: PhenologySubTab = (externalSubTab as PhenologySubTab) || internalSubTab;

  const handleTabChange = (tab: PhenologySubTab) => {
    if (setExternalSubTab) {
      setExternalSubTab(tab);
    } else {
      setInternalSubTab(tab);
    }
  };

  // Digital Twins LocalStorage Persistence (shared key with ClimateAlertWidget)
  const [twins, setTwins] = useState<CropDigitalTwin[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('agronutri_digital_twins');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {
        return initialCropDigitalTwins;
      }
    }
    return initialCropDigitalTwins;
  });

  const [selectedTwinId, setSelectedTwinId] = useState<string>(() => twins[0]?.id || '');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('agronutri_digital_twins', JSON.stringify(twins));
      window.dispatchEvent(new Event('storage'));
    }
  }, [twins]);

  useEffect(() => {
    if (twins.length > 0 && !twins.some(t => t.id === selectedTwinId)) {
      setSelectedTwinId(twins[0].id);
    } else if (twins.length === 0 && selectedTwinId !== '') {
      setSelectedTwinId('');
    }
  }, [twins, selectedTwinId]);

  // Photos persistence
  const [photos, setPhotos] = useState<FieldPhotoRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(PHOTOS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {
        return initialFieldPhotos;
      }
    }
    return initialFieldPhotos;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(photos));
    }
  }, [photos]);

  // Technical schedules persistence
  const [schedules, setSchedules] = useState<TechnicalScheduleItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(SCHEDULES_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {
        return initialTechnicalSchedules;
      }
    }
    return initialTechnicalSchedules;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(schedules));
    }
  }, [schedules]);

  const stages: PhenologicalStage[] = SOJA_PHENOLOGICAL_STAGES;
  const currentTwin = useMemo(
    () => twins.find(t => t.id === selectedTwinId) || twins[0],
    [twins, selectedTwinId]
  );

  const [selectedStageId, setSelectedStageId] = useState<string>(
    currentTwin?.currentStageId || 'soja_R1'
  );

  useEffect(() => {
    if (currentTwin?.currentStageId && stages.some(s => s.id === currentTwin.currentStageId)) {
      setSelectedStageId(currentTwin.currentStageId);
    }
  }, [currentTwin?.id, currentTwin?.currentStageId, stages]);

  // Notification toast with unmount cleanup
  const [notification, setNotification] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => setNotification(null), 4000);
  };

  // Modals
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isTwinModalOpen, setIsTwinModalOpen] = useState(false);

  const handleSavePhoto = (newEntry: FieldPhotoRecord) => {
    setPhotos(prev => [newEntry, ...prev]);
    setIsPhotoModalOpen(false);
    showNotification('Registro fotográfico adicionado ao diário fenológico.');
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
    showNotification('Foto removida do diário fenológico.');
  };

  const handleSaveNewTwin = (createdTwin: CropDigitalTwin) => {
    setTwins(prev => [...prev, createdTwin]);
    setSelectedTwinId(createdTwin.id);
    setIsTwinModalOpen(false);
    showNotification(`Lavoura "${createdTwin.plotName}" ativada no Gêmeo Digital.`);
  };

  const handleDeleteTwin = (id: string) => {
    setTwins(prev => prev.filter(t => t.id !== id));
    showNotification('Lavoura removida do monitoramento.');
  };

  const handleAddSchedule = (item: TechnicalScheduleItem) => {
    setSchedules(prev => [item, ...prev]);
    showNotification('Atividade técnica adicionada à agenda.');
  };

  const handleToggleScheduleStatus = (id: string) => {
    setSchedules(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: item.status === 'concluido' ? 'pendente' : 'concluido' }
          : item
      )
    );
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(item => item.id !== id));
  };

  const handleGenerateStageSchedules = () => {
    if (!currentTwin) return;
    const currentStage =
      stages.find(s => s.code === currentTwin.currentStageCode) || stages[0];
    if (!currentStage) return;

    const today = new Date().toISOString().split('T')[0];
    const generated: TechnicalScheduleItem[] = currentStage.management.recommendedOperations.map(
      (op, idx) => ({
        id: `sched-${Date.now()}-${idx}`,
        twinId: currentTwin.id,
        plotName: currentTwin.plotName,
        targetStageCode: currentStage.code,
        targetDap: currentTwin.currentDap,
        scheduledDate: today,
        operationType: 'monitoramento_mip',
        title: `Manejo ${currentStage.code} — ${currentTwin.plotName}`,
        description: op,
        status: 'pendente',
        priority: currentStage.category === 'reprodutivo' ? 'urgente' : 'alta'
      })
    );

    setSchedules(prev => [...generated, ...prev]);
    showNotification(`${generated.length} atividades geradas para o estádio ${currentStage.code}.`);
  };

  const twinPhotos = useMemo(
    () => (currentTwin ? photos.filter(p => p.twinId === currentTwin.id) : photos),
    [photos, currentTwin]
  );

  const twinSchedules = useMemo(
    () => (currentTwin ? schedules.filter(s => s.twinId === currentTwin.id) : schedules),
    [schedules, currentTwin]
  );

  const idcStatusLabel =
    currentTwin?.idcStatus === 'dentro_do_esperado'
      ? 'Dentro do esperado'
      : currentTwin?.idcStatus === 'ligeiramente_atrasado'
        ? 'Ligeiramente atrasado'
        : currentTwin?.idcStatus === 'comprometido'
          ? 'Comprometido'
          : 'Crítico';

  return (
    <div className="space-y-4 pb-10">
      {/* Compact Module Header + Plot Controls + Tab Strip */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 px-4 py-3.5 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Sprout className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
                Fenologia & Desenvolvimento Vegetal
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                Estádios fenológicos, índice IDC, demanda hídrica, marcha nutricional e agenda técnica
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {twins.length > 0 && (
              <select
                value={selectedTwinId}
                onChange={e => setSelectedTwinId(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-white text-xs font-medium outline-none focus:border-emerald-500 cursor-pointer"
              >
                {twins.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.plotName} ({t.cultivarName})
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={() => setIsTwinModalOpen(true)}
              className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Lavoura</span>
            </button>
          </div>
        </div>

        {/* Digital Twin KPI Strip */}
        {currentTwin && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800/80 text-xs tabular-nums">
            <div className="px-3 py-2 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Idade</span>
              <strong className="text-sm font-bold text-slate-900 dark:text-white block">
                {currentTwin.currentDap} DAP
              </strong>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">Dias após plantio</span>
            </div>

            <div className="px-3 py-2 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Estádio Atual</span>
              <strong className="text-sm font-bold text-emerald-700 dark:text-emerald-400 block">
                {currentTwin.currentStageCode}
              </strong>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 block truncate">
                {currentTwin.currentStageName.split('(')[0].trim()}
              </span>
            </div>

            <div className="px-3 py-2 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Ciclo</span>
              <strong className="text-sm font-bold text-slate-900 dark:text-white block">
                {currentTwin.cycleProgressPercent}%
              </strong>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">
                Total: {currentTwin.cycleDays} dias
              </span>
            </div>

            <div className="px-3 py-2 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Graus-Dia (GDD)</span>
              <strong className="text-sm font-bold text-amber-600 dark:text-amber-400 block">
                {currentTwin.accumulatedGdd} °C
              </strong>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">
                Meta: {currentTwin.targetGdd} °C
              </span>
            </div>

            <div className="px-3 py-2 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Índice IDC</span>
              <strong className="text-sm font-bold text-emerald-600 dark:text-emerald-400 block">
                {currentTwin.idcScore} / 100
              </strong>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 block truncate">
                {idcStatusLabel}
              </span>
            </div>

            <div className="px-3 py-2 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Próxima Fase</span>
              <strong className="text-sm font-bold text-slate-900 dark:text-white block">
                {currentTwin.nextStageCode}
              </strong>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-medium block">
                Em ~{currentTwin.daysToNextStage} dias
              </span>
            </div>
          </div>
        )}

        {/* Single-Row Navigation Strip */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`h-8 px-2.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Inline Toast Feedback */}
      {notification && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-emerald-700 dark:text-emerald-300 hover:opacity-75 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Content */}
      <Suspense
        fallback={
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
            Carregando visualização fenológica...
          </div>
        }
      >
        {!currentTwin ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-10 flex flex-col items-center text-center space-y-3 max-w-xl mx-auto">
            <div className="w-11 h-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Nenhuma lavoura ativa no monitoramento fenológico
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed max-w-md">
              Cadastre um talhão para acompanhar a linha do tempo fenológica, o índice IDC, a demanda hídrica, a marcha nutricional e a agenda técnica.
            </p>
            <button
              type="button"
              onClick={() => setIsTwinModalOpen(true)}
              className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar Primeira Lavoura</span>
            </button>
          </div>
        ) : (
          <>
            {activeSubTab === 'linha_tempo' && (
              <PhenologyTimeline
                currentTwin={currentTwin}
                stages={stages}
                selectedStageId={selectedStageId}
                onSelectStage={setSelectedStageId}
              />
            )}

            {activeSubTab === 'gemeo_digital' && (
              <PhenologyIdcDiagnostic currentTwin={currentTwin} />
            )}

            {activeSubTab === 'fisiologia' && (
              <PhenologyPhysiologyCurves
                currentTwin={currentTwin}
                growthPoints={initialGrowthCurvePoints}
              />
            )}

            {activeSubTab === 'nutricao_agua' && (
              <PhenologyWaterNutrition currentTwin={currentTwin} stages={stages} />
            )}

            {activeSubTab === 'sanidade' && (
              <PhenologySanityThreats currentTwin={currentTwin} stages={stages} />
            )}

            {activeSubTab === 'diario_fotos' && (
              <PhenologyPhotoDiary
                photos={twinPhotos}
                onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
                onDeletePhoto={handleDeletePhoto}
              />
            )}

            {activeSubTab === 'agenda_tecnica' && (
              <PhenologyTechnicalAgenda
                currentTwin={currentTwin}
                stages={stages}
                schedules={twinSchedules}
                onAddSchedule={handleAddSchedule}
                onToggleStatus={handleToggleScheduleStatus}
                onDeleteSchedule={handleDeleteSchedule}
                onGenerateStageSchedules={handleGenerateStageSchedules}
              />
            )}

            {activeSubTab === 'cadastro_lavouras' && (
              <PhenologyCropTwinsManager
                twins={twins}
                selectedTwinId={selectedTwinId}
                onSelectTwin={setSelectedTwinId}
                onOpenNewTwinModal={() => setIsTwinModalOpen(true)}
                onDeleteTwin={handleDeleteTwin}
              />
            )}
          </>
        )}

        {isPhotoModalOpen && currentTwin && (
          <NewPhotoModal
            currentTwin={currentTwin}
            stages={stages}
            onClose={() => setIsPhotoModalOpen(false)}
            onSave={handleSavePhoto}
          />
        )}

        {isTwinModalOpen && (
          <NewTwinModal
            selectedFarm={selectedFarm}
            onClose={() => setIsTwinModalOpen(false)}
            onSave={handleSaveNewTwin}
          />
        )}
      </Suspense>
    </div>
  );
};

export default PhenologyModule;
