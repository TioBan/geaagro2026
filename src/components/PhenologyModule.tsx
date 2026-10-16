import React, { useState, useMemo, useEffect } from 'react';
import {
  Sprout,
  Sparkles,
  PlusCircle,
  X,
} from 'lucide-react';
import {
  CropDigitalTwin,
  PhenologicalStage,
  FieldPhotoRecord,
  TechnicalScheduleItem,
} from '../types/phenology';
import { Farm } from '../types/agronomy';
import {
  SOJA_PHENOLOGICAL_STAGES,
  initialCropDigitalTwins,
  initialGrowthCurvePoints,
  initialFieldPhotos,
  initialTechnicalSchedules,
} from '../data/phenologyData';

// Subcomponents
import { PhenologyTimeline } from './phenology/PhenologyTimeline';
import { PhenologyIdcDiagnostic } from './phenology/PhenologyIdcDiagnostic';
import { PhenologyPhysiologyCurves } from './phenology/PhenologyPhysiologyCurves';
import { PhenologyWaterNutrition } from './phenology/PhenologyWaterNutrition';
import { PhenologySanityThreats } from './phenology/PhenologySanityThreats';
import { PhenologyPhotoDiary } from './phenology/PhenologyPhotoDiary';
import { PhenologyTechnicalAgenda } from './phenology/PhenologyTechnicalAgenda';
import { PhenologyCropTwinsManager } from './phenology/PhenologyCropTwinsManager';
import { NewPhotoModal } from './phenology/NewPhotoModal';
import { NewTwinModal } from './phenology/NewTwinModal';

export type PhenologySubTab =
  | 'linha_tempo'
  | 'gemeo_digital'
  | 'fisiologia'
  | 'nutricao_agua'
  | 'sanidade'
  | 'diario_fotos'
  | 'agenda_tecnica'
  | 'cadastro_lavouras';

interface PhenologyModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: PhenologySubTab) => void;
  selectedFarm?: Farm;
  farms?: Farm[];
}

export const PhenologyModule: React.FC<PhenologyModuleProps> = ({
  activeSubTab: externalSubTab,
  setActiveSubTab: setExternalSubTab,
  selectedFarm,
}) => {
  const [internalSubTab, setInternalSubTab] = useState<PhenologySubTab>('linha_tempo');
  const activeSubTab = (externalSubTab as PhenologySubTab) || internalSubTab;

  // Digital Twins LocalStorage Persistence
  const [twins, setTwins] = useState<CropDigitalTwin[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('agronutri_digital_twins');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error('Error reading digital twins from localStorage', e);
      }
    }
    return initialCropDigitalTwins;
  });

  const [selectedTwinId, setSelectedTwinId] = useState<string>(() => {
    return twins[0]?.id || '';
  });

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('agronutri_digital_twins', JSON.stringify(twins));
      window.dispatchEvent(new Event('storage'));
    }
  }, [twins]);

  // Stages & Selected Stage
  const [stages] = useState<PhenologicalStage[]>(SOJA_PHENOLOGICAL_STAGES);
  const [selectedStageId, setSelectedStageId] = useState<string>('soja_R1');

  // Photos & Schedules
  const [photos, setPhotos] = useState<FieldPhotoRecord[]>(initialFieldPhotos);
  const [schedules] = useState<TechnicalScheduleItem[]>(initialTechnicalSchedules);

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Modals
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isTwinModalOpen, setIsTwinModalOpen] = useState(false);

  // Current selected digital twin
  const currentTwin = useMemo(() => {
    return twins.find(t => t.id === selectedTwinId) || twins[0];
  }, [twins, selectedTwinId]);

  const handleSavePhoto = (newEntry: FieldPhotoRecord) => {
    setPhotos(prev => [newEntry, ...prev]);
    setIsPhotoModalOpen(false);
    showNotification('Foto e observação fenológica adicionadas com sucesso!');
  };

  const handleSaveNewTwin = (createdTwin: CropDigitalTwin) => {
    setTwins(prev => [...prev, createdTwin]);
    setSelectedTwinId(createdTwin.id);
    setIsTwinModalOpen(false);
    showNotification(`Gêmeo Digital da lavoura "${createdTwin.plotName}" ativado com sucesso!`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner: Gêmeo Digital da Lavoura */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-emerald-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
                <Sprout className="w-3 h-3" />
                Gêmeo Digital da Lavoura
              </span>
              <span className="text-emerald-200/80 text-xs font-semibold">• Evolução Fisiológica & Linha do Tempo</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-400" />
              Fenologia, Fisiologia & Índice de Desenvolvimento (IDC)
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-3xl">
              Acompanhe cada estádio fenológico da sua cultura, exigências nutricionais por fase, demanda hídrica, sanidade fitossanitária e o índice de resposta fisiológica em tempo real.
            </p>
          </div>

          {/* Plot Selector and Add Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            {twins.length > 0 && (
              <select
                value={selectedTwinId}
                onChange={e => setSelectedTwinId(e.target.value)}
                className="bg-emerald-900/80 border border-emerald-600/80 text-white text-xs font-bold rounded-xl px-3 py-2.5 outline-none cursor-pointer"
              >
                {twins.map(t => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                    {t.plotName} ({t.cultivarName})
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={() => setIsTwinModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-teal-950 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Nova Lavoura
            </button>
          </div>
        </div>

        {/* Global Digital Twin Status Cards */}
        {currentTwin && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-5 pt-4 border-t border-emerald-800/60 text-xs">
            <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
              <span className="text-[10px] text-emerald-300/80 block">Idade da Lavoura</span>
              <strong className="text-base text-white font-black">{currentTwin.currentDap} DAP</strong>
              <span className="text-[10px] text-emerald-300 block">Dias após plantio</span>
            </div>

            <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
              <span className="text-[10px] text-emerald-300/80 block">Estádio Atual</span>
              <strong className="text-base text-cyan-300 font-black">{currentTwin.currentStageCode}</strong>
              <span className="text-[10px] text-emerald-200 block truncate">{currentTwin.currentStageName.split('(')[0]}</span>
            </div>

            <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
              <span className="text-[10px] text-emerald-300/80 block">Progresso do Ciclo</span>
              <strong className="text-base text-emerald-400 font-black">{currentTwin.cycleProgressPercent}%</strong>
              <span className="text-[10px] text-emerald-200 block">Total: {currentTwin.cycleDays} dias</span>
            </div>

            <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
              <span className="text-[10px] text-emerald-300/80 block">Graus-Dia (GDD)</span>
              <strong className="text-base text-amber-300 font-black">{currentTwin.accumulatedGdd} °C</strong>
              <span className="text-[10px] text-emerald-200 block">Meta: {currentTwin.targetGdd} °C</span>
            </div>

            <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
              <span className="text-[10px] text-emerald-300/80 block">Índice IDC</span>
              <strong className="text-base text-emerald-300 font-black">{currentTwin.idcScore} / 100</strong>
              <span className="text-[10px] text-emerald-200 block">Status Ótimo</span>
            </div>

            <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
              <span className="text-[10px] text-emerald-300/80 block">Próxima Fase</span>
              <strong className="text-base text-white font-black">{currentTwin.nextStageCode}</strong>
              <span className="text-[10px] text-cyan-300 font-bold block">Em ~{currentTwin.daysToNextStage} dias</span>
            </div>
          </div>
        )}
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between shadow-md animate-fade-in">
          <span>{notification}</span>
          <button type="button" onClick={() => setNotification(null)} className="text-white hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!currentTwin ? (
        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 sm:p-12 flex flex-col items-center text-center space-y-4 max-w-xl mx-auto mt-6 shadow-2xs">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-full text-emerald-600 dark:text-emerald-400">
            <Sprout className="w-10 h-10 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Nenhuma Lavoura Ativa no Gêmeo Digital
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            Para começar a monitorar a fenologia, o índice IDC, a demanda hídrica, a sanidade fitossanitária e gerenciar as atividades técnicas do seu talhão de forma profissional, cadastre o seu primeiro talhão.
          </p>
          <button
            type="button"
            onClick={() => setIsTwinModalOpen(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer select-none"
          >
            <PlusCircle className="w-4 h-4" />
            Cadastrar Primeira Lavoura
          </button>
        </div>
      ) : (
        <>
          {/* Sub-tab 1: Linha do Tempo Fenológica */}
          {activeSubTab === 'linha_tempo' && (
            <PhenologyTimeline
              currentTwin={currentTwin}
              stages={stages}
              selectedStageId={selectedStageId}
              onSelectStage={setSelectedStageId}
            />
          )}

          {/* Sub-tab 2: Índice IDC */}
          {activeSubTab === 'gemeo_digital' && (
            <PhenologyIdcDiagnostic currentTwin={currentTwin} />
          )}

          {/* Sub-tab 3: Fisiologia e Curvas */}
          {activeSubTab === 'fisiologia' && (
            <PhenologyPhysiologyCurves
              currentTwin={currentTwin}
              growthPoints={initialGrowthCurvePoints}
            />
          )}

          {/* Sub-tab 4: Nutrição e Água */}
          {activeSubTab === 'nutricao_agua' && (
            <PhenologyWaterNutrition currentTwin={currentTwin} />
          )}

          {/* Sub-tab 5: Sanidade Fitossanitária */}
          {activeSubTab === 'sanidade' && (
            <PhenologySanityThreats currentTwin={currentTwin} />
          )}

          {/* Sub-tab 6: Diário de Fotos */}
          {activeSubTab === 'diario_fotos' && (
            <PhenologyPhotoDiary
              photos={photos}
              onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
            />
          )}

          {/* Sub-tab 7: Agenda Técnica */}
          {activeSubTab === 'agenda_tecnica' && (
            <PhenologyTechnicalAgenda schedules={schedules} />
          )}

          {/* Sub-tab 8: Cadastro de Lavouras */}
          {activeSubTab === 'cadastro_lavouras' && (
            <PhenologyCropTwinsManager
              twins={twins}
              selectedTwinId={selectedTwinId}
              onSelectTwin={setSelectedTwinId}
              onOpenNewTwinModal={() => setIsTwinModalOpen(true)}
            />
          )}
        </>
      )}

      {/* Modal: New Photo Entry */}
      {isPhotoModalOpen && currentTwin && (
        <NewPhotoModal
          currentTwin={currentTwin}
          stages={stages}
          onClose={() => setIsPhotoModalOpen(false)}
          onSave={handleSavePhoto}
        />
      )}

      {/* Modal: New Twin Plot */}
      {isTwinModalOpen && (
        <NewTwinModal
          selectedFarm={selectedFarm}
          onClose={() => setIsTwinModalOpen(false)}
          onSave={handleSaveNewTwin}
        />
      )}
    </div>
  );
};
