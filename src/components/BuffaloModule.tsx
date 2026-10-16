// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  BuffaloAnimal,
  BuffaloPaddock,
  BuffaloWaterPoint,
  BuffaloThermalWelfareIndex,
  BuffaloPharmacyItem,
  BuffaloFacility
} from '../types/buffalo';
import {
  loadBuffaloAnimals,
  saveBuffaloAnimals,
  loadBuffaloPaddocks,
  saveBuffaloPaddocks,
  loadBuffaloWaterPoints,
  saveBuffaloWaterPoints,
  loadBuffaloThermalWelfare,
  saveBuffaloThermalWelfare,
  loadBuffaloPharmacy,
  saveBuffaloPharmacy,
  loadBuffaloFacilities,
  saveBuffaloFacilities,
  resetBuffaloDataToDefaults
} from '../utils/buffaloStorage';

// Import Views
import { BuffaloDashboardView } from './buffalo/BuffaloDashboardView';
import { BuffaloIndividualRegistryView } from './buffalo/BuffaloIndividualRegistryView';
import { BuffaloDigitalTwinView } from './buffalo/BuffaloDigitalTwinView';
import { BuffaloGenealogyView } from './buffalo/BuffaloGenealogyView';
import { BuffaloReproductionView } from './buffalo/BuffaloReproductionView';
import { BuffaloCalfManagementView } from './buffalo/BuffaloCalfManagementView';
import { BuffaloDairyProductionView } from './buffalo/BuffaloDairyProductionView';
import { BuffaloBeefProductionView } from './buffalo/BuffaloBeefProductionView';
import { BuffaloWelfareWaterView } from './buffalo/BuffaloWelfareWaterView';
import { BuffaloNutritionView } from './buffalo/BuffaloNutritionView';
import { BuffaloPasturesView } from './buffalo/BuffaloPasturesView';
import { BuffaloHealthVaccinesView } from './buffalo/BuffaloHealthVaccinesView';
import { BuffaloDiseasesLibraryView } from './buffalo/BuffaloDiseasesLibraryView';
import { BuffaloPharmacyView } from './buffalo/BuffaloPharmacyView';
import { BuffaloFacilitiesView } from './buffalo/BuffaloFacilitiesView';
import { BuffaloSmartMapView } from './buffalo/BuffaloSmartMapView';
import { BuffaloReportsView } from './buffalo/BuffaloReportsView';
import { BuffaloPhotoDiaryView } from './buffalo/BuffaloPhotoDiaryView';

// Lucide Icons
import {
  LayoutDashboard,
  Shield,
  Activity,
  Dna,
  HeartPulse,
  Baby,
  Milk,
  Beef,
  Droplets,
  Wheat,
  Sprout,
  ShieldCheck,
  BookOpen,
  Pill,
  Building2,
  Compass,
  FileText,
  Sparkles,
  Layers3
} from 'lucide-react';

export type BuffaloTab =
  | 'dashboard'
  | 'registry'
  | 'digital_twin'
  | 'genealogy'
  | 'reproduction'
  | 'calves'
  | 'dairy'
  | 'beef'
  | 'welfare_water'
  | 'nutrition'
  | 'pastures'
  | 'health'
  | 'diseases_lib'
  | 'pharmacy'
  | 'facilities'
  | 'smart_map'
  | 'reports'
  | 'photo_diary';

interface BuffaloModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (subTab: string) => void;
}

export const BuffaloModule: React.FC<BuffaloModuleProps> = ({
  activeSubTab = 'dashboard',
  setActiveSubTab
}) => {
  const [internalTab, setInternalTab] = useState<BuffaloTab>((activeSubTab as BuffaloTab) || 'dashboard');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');

  // Sync internal tab whenever activeSubTab prop changes from navbar
  useEffect(() => {
    if (activeSubTab && activeSubTab !== internalTab) {
      setInternalTab(activeSubTab as BuffaloTab);
    }
  }, [activeSubTab]);

  const activeTab = (activeSubTab as BuffaloTab) || internalTab;

  const handleTabChange = (tab: BuffaloTab | string) => {
    setInternalTab(tab as BuffaloTab);
    if (setActiveSubTab) {
      setActiveSubTab(tab);
    }
  };

  // States com persistência 100% offline
  const [animals, setAnimals] = useState<BuffaloAnimal[]>(() => loadBuffaloAnimals());
  const [paddocks, setPaddocks] = useState<BuffaloPaddock[]>(() => loadBuffaloPaddocks());
  const [waterPoints, setWaterPoints] = useState<BuffaloWaterPoint[]>(() => loadBuffaloWaterPoints());
  const [thermalWelfare, setThermalWelfare] = useState<BuffaloThermalWelfareIndex>(() => loadBuffaloThermalWelfare());
  const [pharmacy, setPharmacy] = useState<BuffaloPharmacyItem[]>(() => loadBuffaloPharmacy());
  const [facilities, setFacilities] = useState<BuffaloFacility[]>(() => loadBuffaloFacilities());

  // Salvar automaticamente ao alterar estado
  useEffect(() => {
    saveBuffaloAnimals(animals);
    if (!selectedAnimalId && animals.length > 0 && animals[0]?.id) {
      setSelectedAnimalId(animals[0].id);
    }
  }, [animals, selectedAnimalId]);

  useEffect(() => {
    saveBuffaloPaddocks(paddocks);
  }, [paddocks]);

  useEffect(() => {
    saveBuffaloWaterPoints(waterPoints);
  }, [waterPoints]);

  useEffect(() => {
    saveBuffaloThermalWelfare(thermalWelfare);
  }, [thermalWelfare]);

  useEffect(() => {
    saveBuffaloPharmacy(pharmacy);
  }, [pharmacy]);

  useEffect(() => {
    saveBuffaloFacilities(facilities);
  }, [facilities]);

  // Handlers
  const handleSaveAnimal = (animal: BuffaloAnimal) => {
    setAnimals(prev => {
      const idx = prev.findIndex(a => a.id === animal.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = animal;
        return next;
      }
      return [animal, ...prev];
    });
  };

  const handleDeleteAnimal = (animalId: string) => {
    setAnimals(prev => prev.filter(a => a.id !== animalId));
    if (selectedAnimalId === animalId) {
      const remaining = animals.filter(a => a.id !== animalId);
      setSelectedAnimalId(remaining[0]?.id || '');
    }
  };

  const handleOpenDigitalTwin = (animalId: string) => {
    setSelectedAnimalId(animalId);
    handleTabChange('digital_twin');
  };

  const handleResetData = () => {
    if (window.confirm('Deseja restaurar os dados de demonstração do módulo de Bubalinos? Todos os registros serão reinicializados.')) {
      resetBuffaloDataToDefaults();
      setAnimals(loadBuffaloAnimals());
      setPaddocks(loadBuffaloPaddocks());
      setWaterPoints(loadBuffaloWaterPoints());
      setThermalWelfare(loadBuffaloThermalWelfare());
      setPharmacy(loadBuffaloPharmacy());
      setFacilities(loadBuffaloFacilities());
      alert('Dados restaurados com sucesso!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Principal do Módulo (Unboxed para integração perfeita de UI) */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-zinc-800/60">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 text-white flex items-center justify-center font-black text-2xl shadow-xs shrink-0">
            🐃
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Bubalinocultura de Precisão
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Gestão Zootécnica, Reprodutiva, Sanitária, Leiteira (Mozzarella &amp; Marajó), Corte e Bem-Estar Hídrico.
            </p>
          </div>
        </div>
      </div>

      {/* Renderização Condicional das Visualizações */}
      <div className="max-w-7xl mx-auto transition-all duration-200">
        {activeTab === 'dashboard' && (
          <BuffaloDashboardView
            animals={animals}
            paddocks={paddocks}
            thermalWelfare={thermalWelfare}
            onOpenDigitalTwin={handleOpenDigitalTwin}
            onNavigateTab={handleTabChange}
          />
        )}

        {activeTab === 'registry' && (
          <BuffaloIndividualRegistryView
            animals={animals}
            onSaveAnimal={handleSaveAnimal}
            onDeleteAnimal={handleDeleteAnimal}
            onOpenDigitalTwin={handleOpenDigitalTwin}
          />
        )}

        {activeTab === 'digital_twin' && (
          <BuffaloDigitalTwinView
            animals={animals}
            selectedAnimalId={selectedAnimalId}
            onSelectAnimal={setSelectedAnimalId}
            onUpdateAnimal={handleSaveAnimal}
          />
        )}

        {activeTab === 'genealogy' && (
          <BuffaloGenealogyView
            animals={animals}
            onSelectAnimalForTwin={handleOpenDigitalTwin}
          />
        )}

        {activeTab === 'reproduction' && (
          <BuffaloReproductionView
            animals={animals}
            onUpdateAnimal={handleSaveAnimal}
            onOpenDigitalTwin={handleOpenDigitalTwin}
          />
        )}

        {activeTab === 'calves' && (
          <BuffaloCalfManagementView
            animals={animals}
            onOpenDigitalTwin={handleOpenDigitalTwin}
          />
        )}

        {activeTab === 'dairy' && (
          <BuffaloDairyProductionView
            animals={animals}
            onOpenDigitalTwin={handleOpenDigitalTwin}
          />
        )}

        {activeTab === 'beef' && (
          <BuffaloBeefProductionView
            animals={animals}
            onOpenDigitalTwin={handleOpenDigitalTwin}
          />
        )}

        {activeTab === 'welfare_water' && (
          <BuffaloWelfareWaterView
            waterPoints={waterPoints}
            thermalWelfare={thermalWelfare}
            onUpdateThermal={setThermalWelfare}
            onAddWaterPoint={(pt) => setWaterPoints(prev => [...prev, pt])}
          />
        )}

        {activeTab === 'nutrition' && (
          <BuffaloNutritionView animals={animals} />
        )}

        {activeTab === 'pastures' && (
          <BuffaloPasturesView paddocks={paddocks} />
        )}

        {activeTab === 'health' && (
          <BuffaloHealthVaccinesView
            animals={animals}
            onOpenDigitalTwin={handleOpenDigitalTwin}
          />
        )}

        {activeTab === 'diseases_lib' && (
          <BuffaloDiseasesLibraryView />
        )}

        {activeTab === 'pharmacy' && (
          <BuffaloPharmacyView
            pharmacy={pharmacy}
            onUpdatePharmacy={setPharmacy}
          />
        )}

        {activeTab === 'facilities' && (
          <BuffaloFacilitiesView facilities={facilities} />
        )}

        {activeTab === 'smart_map' && (
          <BuffaloSmartMapView
            paddocks={paddocks}
            waterPoints={waterPoints}
            animals={animals}
            onOpenDigitalTwin={handleOpenDigitalTwin}
          />
        )}

        {activeTab === 'reports' && (
          <BuffaloReportsView animals={animals} paddocks={paddocks} />
        )}

        {activeTab === 'photo_diary' && (
          <BuffaloPhotoDiaryView
            animals={animals}
            onOpenDigitalTwin={handleOpenDigitalTwin}
          />
        )}
      </div>
    </div>
  );
};
