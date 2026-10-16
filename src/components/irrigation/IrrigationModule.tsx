import React, { useState, useEffect } from 'react';
import {
  SoilPhysicsProfile,
  CropWaterRequirement,
  IrrigationSystemRecord,
  ClimateDayRecord,
  IrrigationEventLog,
  WaterQualityAnalysis,
  FertigationProgramItem,
  IrrigationDiaryEntry,
  IrrigationKPIs,
} from '../../types/irrigation';
import {
  loadIrrigationData,
  saveIrrigationData,
  calculateIGEH,
} from '../../utils/irrigationStorage';

import { IrrigationDashboardView } from './IrrigationDashboardView';
import { AreaAndSoilsView } from './AreaAndSoilsView';
import { IrrigationSystemsView } from './IrrigationSystemsView';
import { MeteorologyIrrigationView } from './MeteorologyIrrigationView';
import { WaterRequirementEngineView } from './WaterRequirementEngineView';
import { EnergyAndFertigationView } from './EnergyAndFertigationView';
import { WaterQualityAndDiaryView } from './WaterQualityAndDiaryView';
import { SystemDigitalTwinView } from './SystemDigitalTwinView';
import { IrrigationSimulatorView } from './IrrigationSimulatorView';
import { IrrigationReportsView } from './IrrigationReportsView';

import {
  Droplets,
  Layers,
  Settings,
  Sun,
  Gauge,
  Zap,
  Camera,
  Activity,
  Sparkles,
  FileText,
  WifiOff,
  Calendar,
} from 'lucide-react';

export type IrrigationTab =
  | 'dashboard'
  | 'soils_areas'
  | 'systems'
  | 'weather'
  | 'calculator'
  | 'energy_fertigation'
  | 'water_quality'
  | 'digital_twin'
  | 'simulator'
  | 'reports';

interface IrrigationModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: string) => void;
}

export const IrrigationModule: React.FC<IrrigationModuleProps> = ({
  activeSubTab,
  setActiveSubTab,
}) => {
  const [internalTab, setInternalTab] = useState<IrrigationTab>('dashboard');
  const activeTab: IrrigationTab = (activeSubTab as IrrigationTab) || internalTab;

  const setActiveTab = (tab: IrrigationTab) => {
    setInternalTab(tab);
    if (setActiveSubTab) {
      setActiveSubTab(tab);
    }
  };

  // State Management - Loaded synchronously to prevent empty-state flashes
  const [systems, setSystems] = useState<IrrigationSystemRecord[]>(() => loadIrrigationData().systems);
  const [climate, setClimate] = useState<ClimateDayRecord[]>(() => loadIrrigationData().climate);
  const [logs, setLogs] = useState<IrrigationEventLog[]>(() => loadIrrigationData().logs);
  const [soils, setSoils] = useState<SoilPhysicsProfile[]>(() => loadIrrigationData().soils);
  const [crops, setCrops] = useState<CropWaterRequirement[]>(() => loadIrrigationData().crops);
  const [waterQuality, setWaterQuality] = useState<WaterQualityAnalysis[]>(() => loadIrrigationData().waterQuality);
  const [fertigation, setFertigation] = useState<FertigationProgramItem[]>(() => loadIrrigationData().fertigation);
  const [diary, setDiary] = useState<IrrigationDiaryEntry[]>(() => loadIrrigationData().diary);

  // Sync helpers
  const handleAddSoil = (newSoil: SoilPhysicsProfile) => {
    const updated = [...soils, newSoil];
    setSoils(updated);
    saveIrrigationData({ soils: updated });
  };

  const handleAddCrop = (newCrop: CropWaterRequirement) => {
    const updated = [...crops, newCrop];
    setCrops(updated);
    saveIrrigationData({ crops: updated });
  };

  const handleAddSystem = (newSys: IrrigationSystemRecord) => {
    const updated = [...systems, newSys];
    setSystems(updated);
    saveIrrigationData({ systems: updated });
  };

  const handleUpdateSystem = (updatedSys: IrrigationSystemRecord) => {
    const updated = systems.map(s => (s.id === updatedSys.id ? updatedSys : s));
    setSystems(updated);
    saveIrrigationData({ systems: updated });
  };

  const handleAddClimate = (rec: ClimateDayRecord) => {
    const updated = [...climate, rec];
    setClimate(updated);
    saveIrrigationData({ climate: updated });
  };

  const handleAddLog = (log: IrrigationEventLog) => {
    const updated = [log, ...logs];
    setLogs(updated);
    saveIrrigationData({ logs: updated });
  };

  const handleAddWaterQuality = (wq: WaterQualityAnalysis) => {
    const updated = [wq, ...waterQuality];
    setWaterQuality(updated);
    saveIrrigationData({ waterQuality: updated });
  };

  const handleAddFertigation = (item: FertigationProgramItem) => {
    const updated = [item, ...fertigation];
    setFertigation(updated);
    saveIrrigationData({ fertigation: updated });
  };

  const handleAddDiary = (entry: IrrigationDiaryEntry) => {
    const updated = [entry, ...diary];
    setDiary(updated);
    saveIrrigationData({ diary: updated });
  };

  // Calculated KPIs
  const kpis: IrrigationKPIs = calculateIGEH(systems, logs, climate);

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Unified Irrigation Module Header - Gradient Style */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-cyan-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-cyan-800/50">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Droplets className="w-96 h-96 text-cyan-300" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Painel de Irrigação & Eficiência Hídrica
            </h2>

            <p className="text-xs sm:text-sm text-cyan-100/80 leading-relaxed">
              Monitoramento em tempo real do lâmina aplicada, umidade do solo, balanço hídrico ET₀/ETc, consumo de energia e índice IGEH.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs bg-cyan-950/60 px-3 py-1.5 rounded-xl border border-cyan-800/60">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Próxima Irrigação: <strong>{kpis.recommendedNextIrrigationDate}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-cyan-950/60 px-3 py-1.5 rounded-xl border border-cyan-800/60">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span>Lâmina Recomendada: <strong>{kpis.recommendedGrossDepthMm} mm</strong></span>
              </div>
            </div>
          </div>

          {/* IGEH Score Circular Badge */}
          <div className="bg-cyan-950/80 backdrop-blur-md p-5 rounded-2xl border border-cyan-700/50 flex flex-col items-center justify-center text-center shrink-0 min-w-[200px]">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300 mb-1">
              Índice IGEH
            </span>
            <div className="text-4xl font-black text-white flex items-baseline gap-1">
              <span>{kpis.igehScore}</span>
              <span className="text-xs font-semibold text-cyan-300">/100</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40">
                Alta Eficiência Hídrica
              </span>
              <div className="px-2 py-0.5 rounded-md bg-cyan-900/60 text-cyan-300 border border-cyan-700/40 text-[10px] font-bold">
                Ea {kpis.avgSystemEfficiencyPct}%
              </div>
            </div>
            <span className="text-[10px] text-cyan-200/70 mt-2">
              💧 {kpis.waterSavedM3.toLocaleString('pt-BR')} m³ economizados
            </span>
          </div>
        </div>
      </div>

      {/* Main Active Tab Content View Render */}
      <div className="animate-fade-in">
        {activeTab === 'dashboard' && (
          <IrrigationDashboardView
            systems={systems}
            climate={climate}
            logs={logs}
            kpis={kpis}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'soils_areas' && (
          <AreaAndSoilsView
            soils={soils}
            crops={crops}
            onAddSoil={handleAddSoil}
            onAddCrop={handleAddCrop}
          />
        )}

        {activeTab === 'systems' && (
          <IrrigationSystemsView
            systems={systems}
            onAddSystem={handleAddSystem}
            onUpdateSystem={handleUpdateSystem}
          />
        )}

        {activeTab === 'weather' && (
          <MeteorologyIrrigationView
            climate={climate}
            onAddClimateRecord={handleAddClimate}
          />
        )}

        {activeTab === 'calculator' && (
          <WaterRequirementEngineView
            soils={soils}
            crops={crops}
            systems={systems}
            logs={logs}
            onAddLog={handleAddLog}
          />
        )}

        {activeTab === 'energy_fertigation' && (
          <EnergyAndFertigationView
            systems={systems}
            fertigation={fertigation}
            onAddFertigation={handleAddFertigation}
          />
        )}

        {activeTab === 'water_quality' && (
          <WaterQualityAndDiaryView
            waterQuality={waterQuality}
            diary={diary}
            systems={systems}
            onAddWaterQuality={handleAddWaterQuality}
            onAddDiaryEntry={handleAddDiary}
          />
        )}

        {activeTab === 'digital_twin' && (
          <SystemDigitalTwinView
            systems={systems}
            climate={climate}
            kpis={kpis}
          />
        )}

        {activeTab === 'simulator' && <IrrigationSimulatorView />}

        {activeTab === 'reports' && (
          <IrrigationReportsView
            kpis={kpis}
            systems={systems}
            logs={logs}
          />
        )}
      </div>
    </div>
  );
};
export default IrrigationModule;
