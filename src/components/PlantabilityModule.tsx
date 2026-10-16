import React, { useState, useEffect } from 'react';
import {
  PropertyField,
  PlanterEquipment,
  SeedBatch,
  SeedingConfig,
  PlantabilitySamplingPoint,
  PlantabilityPhoto,
  ComponentMaintenanceStatus
} from '../types/plantability';
import {
  loadPropertyFields,
  savePropertyField,
  loadPlanters,
  savePlanter,
  loadSeedBatches,
  saveSeedBatch,
  loadSeedingConfigs,
  saveSeedingConfig,
  loadSamplingPoints,
  saveSamplingPoint,
  loadPhotos,
  savePhoto,
  loadMaintenanceStatus,
  saveMaintenanceStatus
} from '../utils/plantabilityStorage';

import { PlantabilityDashboardView } from './plantabilidade/PlantabilityDashboardView';
import { PlantabilityFieldsView } from './plantabilidade/PlantabilityFieldsView';
import { PlantabilityEquipmentView } from './plantabilidade/PlantabilityEquipmentView';
import { PlantabilitySeedsView } from './plantabilidade/PlantabilitySeedsView';
import { PlantabilitySamplingView } from './plantabilidade/PlantabilitySamplingView';
import { PlantabilityDigitalTwinView } from './plantabilidade/PlantabilityDigitalTwinView';
import { PlantabilityDiagnosticRuleEngineView } from './plantabilidade/PlantabilityDiagnosticRuleEngineView';
import { PlantabilityLossSimulatorView } from './plantabilidade/PlantabilityLossSimulatorView';
import { PlantabilityMapView } from './plantabilidade/PlantabilityMapView';
import { PlantabilityPhotoDiaryView } from './plantabilidade/PlantabilityPhotoDiaryView';
import { PlantabilityReportsView } from './plantabilidade/PlantabilityReportsView';

import { Sprout } from 'lucide-react';

type TabType =
  | 'dashboard'
  | 'fields'
  | 'equipment'
  | 'seeds'
  | 'sampling'
  | 'digital-twin'
  | 'diagnostics'
  | 'loss-simulator'
  | 'map'
  | 'photo-diary'
  | 'reports';

interface PlantabilityModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: string) => void;
}

export const PlantabilityModule: React.FC<PlantabilityModuleProps> = ({
  activeSubTab,
  setActiveSubTab
}) => {
  const [internalTab, setInternalTab] = useState<TabType>('dashboard');

  const normalizeTab = (tab?: string): TabType => {
    if (!tab) return 'dashboard';
    const normalized = tab.replace(/_/g, '-');
    if (normalized === 'simulator') return 'loss-simulator';
    if (normalized === 'diagnostic') return 'diagnostics';
    return normalized as TabType;
  };

  const activeTab: TabType = activeSubTab ? normalizeTab(activeSubTab) : internalTab;

  const handleTabChange = (tabId: string) => {
    const normalized = normalizeTab(tabId);
    if (setActiveSubTab) {
      setActiveSubTab(normalized);
    } else {
      setInternalTab(normalized);
    }
  };

  // State
  const [fields, setFields] = useState<PropertyField[]>([]);
  const [planters, setPlanters] = useState<PlanterEquipment[]>([]);
  const [seeds, setSeeds] = useState<SeedBatch[]>([]);
  const [configs, setConfigs] = useState<SeedingConfig[]>([]);
  const [samplings, setSamplings] = useState<PlantabilitySamplingPoint[]>([]);
  const [photos, setPhotos] = useState<PlantabilityPhoto[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<ComponentMaintenanceStatus[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    setFields(loadPropertyFields());
    setPlanters(loadPlanters());
    setSeeds(loadSeedBatches());
    setConfigs(loadSeedingConfigs());
    setSamplings(loadSamplingPoints());
    setPhotos(loadPhotos());
    setMaintenanceLogs(loadMaintenanceStatus());
  }, []);

  // Handlers
  const handleSaveField = (f: PropertyField) => {
    savePropertyField(f);
    setFields(loadPropertyFields());
  };

  const handleSavePlanter = (p: PlanterEquipment) => {
    savePlanter(p);
    setPlanters(loadPlanters());
  };

  const handleSaveSeed = (s: SeedBatch) => {
    saveSeedBatch(s);
    setSeeds(loadSeedBatches());
  };

  const handleSaveSampling = (s: PlantabilitySamplingPoint) => {
    saveSamplingPoint(s);
    setSamplings(loadSamplingPoints());
  };

  const handleSavePhoto = (p: PlantabilityPhoto) => {
    savePhoto(p);
    setPhotos(loadPhotos());
  };

  const handleSaveMaintenance = (m: ComponentMaintenanceStatus) => {
    saveMaintenanceStatus(m);
    setMaintenanceLogs(loadMaintenanceStatus());
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb when inside subviews */}
      {activeTab !== 'dashboard' && (
        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 px-5 py-3 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-zinc-400">
            <button
              onClick={() => handleTabChange('dashboard')}
              className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>Plantabilidade & Semeadura</span>
            </button>
            <span>/</span>
            <span className="font-semibold text-stone-900 dark:text-white">
              {activeTab === 'fields' && 'Cadastro da Propriedade'}
              {activeTab === 'equipment' && 'Plantadeira & Linhas'}
              {activeTab === 'seeds' && 'Lotes de Sementes'}
              {activeTab === 'sampling' && 'Amostragem em Campo'}
              {activeTab === 'digital-twin' && 'Gêmeo Digital 360°'}
              {activeTab === 'diagnostics' && 'Diagnósticos de Regulagem'}
              {activeTab === 'loss-simulator' && 'Simulador de Perdas'}
              {activeTab === 'map' && 'Mapa Interativo'}
              {activeTab === 'photo-diary' && 'Diário Fotográfico'}
              {activeTab === 'reports' && 'Relatórios & Laudo'}
            </span>
          </div>
          <button
            onClick={() => handleTabChange('dashboard')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            ← Voltar ao Painel Geral
          </button>
        </div>
      )}

      {/* Module Content */}
      <div>
        {activeTab === 'dashboard' && (
          <PlantabilityDashboardView
            fields={fields}
            planters={planters}
            seeds={seeds}
            configs={configs}
            samplings={samplings}
            onNavigateTab={handleTabChange}
          />
        )}

        {activeTab === 'fields' && (
          <PlantabilityFieldsView fields={fields} onSaveField={handleSaveField} />
        )}

        {activeTab === 'equipment' && (
          <PlantabilityEquipmentView
            planters={planters}
            maintenanceLogs={maintenanceLogs}
            onSavePlanter={handleSavePlanter}
            onSaveMaintenance={handleSaveMaintenance}
          />
        )}

        {activeTab === 'seeds' && (
          <PlantabilitySeedsView seeds={seeds} onSaveSeed={handleSaveSeed} />
        )}

        {activeTab === 'sampling' && (
          <PlantabilitySamplingView
            fields={fields}
            configs={configs}
            samplings={samplings}
            onSaveSampling={handleSaveSampling}
          />
        )}

        {activeTab === 'digital-twin' && (
          <PlantabilityDigitalTwinView
            fields={fields}
            planters={planters}
            seeds={seeds}
            configs={configs}
            samplings={samplings}
            photos={photos}
          />
        )}

        {activeTab === 'diagnostics' && (
          <PlantabilityDiagnosticRuleEngineView samplings={samplings} configs={configs} />
        )}

        {activeTab === 'loss-simulator' && (
          <PlantabilityLossSimulatorView fields={fields} samplings={samplings} configs={configs} />
        )}

        {activeTab === 'map' && (
          <PlantabilityMapView fields={fields} samplings={samplings} configs={configs} />
        )}

        {activeTab === 'photo-diary' && (
          <PlantabilityPhotoDiaryView photos={photos} fields={fields} onSavePhoto={handleSavePhoto} />
        )}

        {activeTab === 'reports' && (
          <PlantabilityReportsView
            fields={fields}
            planters={planters}
            seeds={seeds}
            configs={configs}
            samplings={samplings}
          />
        )}
      </div>
    </div>
  );
};

export default PlantabilityModule;
