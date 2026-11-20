import React, { useState, useEffect } from 'react';
import {
  loadCaprineAnimals,
  saveCaprineAnimals,
  loadCaprineMilkLogs,
  saveCaprineMilkLogs,
  loadCaprineMeatLogs,
  saveCaprineMeatLogs,
  loadCaprineWeighings,
  saveCaprineWeighings,
  loadCaprineHealth,
  saveCaprineHealth,
  loadCaprineReproduction,
  saveCaprineReproduction,
  loadCaprineKids,
  saveCaprineKids,
  loadCaprineFeeds,
  saveCaprineFeeds,
  loadCaprinePaddocks,
  saveCaprinePaddocks,
  loadCaprinePharmacy,
  saveCaprinePharmacy,
  loadCaprinePhotos,
  saveCaprinePhotos,
  loadCaprineFacilities,
  saveCaprineFacilities
} from '../utils/caprineStorage';

import {
  CaprineTab,
  CaprineAnimal,
  CaprineMilkRecord,
  CaprineMeatRecord,
  CaprineWeighingRecord,
  CaprineHealthRecord,
  CaprineReproductionRecord,
  CaprineKidRecord,
  CaprineFeedItem,
  CaprinePasturePaddock,
  CaprinePharmacyItem,
  CaprinePhotoEntry,
  CaprineFacility
} from '../types/caprine';

import { CaprineDashboardView } from './caprinos/CaprineDashboardView';
import { CaprineIndividualRegistryView } from './caprinos/CaprineIndividualRegistryView';
import { CaprineDigitalTwinView } from './caprinos/CaprineDigitalTwinView';
import { CaprineGenealogyView } from './caprinos/CaprineGenealogyView';
import { CaprineReproductionView } from './caprinos/CaprineReproductionView';
import { CaprineKidsManagementView } from './caprinos/CaprineKidsManagementView';
import { CaprineDairyProductionView } from './caprinos/CaprineDairyProductionView';
import { CaprineMeatProductionView } from './caprinos/CaprineMeatProductionView';
import { CaprineNutritionView } from './caprinos/CaprineNutritionView';
import { CaprinePasturesView } from './caprinos/CaprinePasturesView';
import { CaprineHealthVaccinesView } from './caprinos/CaprineHealthVaccinesView';
import { CaprinePharmacyView } from './caprinos/CaprinePharmacyView';
import { CaprinePhotoDiaryView } from './caprinos/CaprinePhotoDiaryView';
import { CaprineFacilitiesView } from './caprinos/CaprineFacilitiesView';
import { CaprineReportsView } from './caprinos/CaprineReportsView';
import { CaprineDiseaseLibraryView } from './caprinos/CaprineDiseaseLibraryView';

import {
  LayoutDashboard,
  Sparkles,
  Users,
  Dna,
  Heart,
  Baby,
  Milk,
  Beef,
  Wheat,
  Sprout,
  Syringe,
  Package,
  Camera,
  Home,
  FileText,
  BookOpen
} from 'lucide-react';

interface CaprineModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (subTab: string) => void;
}

const VALID_TABS: CaprineTab[] = [
  'dashboard',
  'digital_twin',
  'registry',
  'genealogy',
  'reproduction',
  'kids',
  'milk',
  'meat',
  'nutrition',
  'pastures',
  'health',
  'pharmacy',
  'disease_library',
  'photo_diary',
  'facilities',
  'reports'
];

const SUB_NAV_TABS: { id: CaprineTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
  { id: 'digital_twin', label: 'Gêmeo 360°', icon: Sparkles },
  { id: 'registry', label: 'Cadastro RFID', icon: Users },
  { id: 'genealogy', label: 'Genealogia', icon: Dna },
  { id: 'reproduction', label: 'Reprodução', icon: Heart },
  { id: 'kids', label: 'Cabritos', icon: Baby },
  { id: 'milk', label: 'Leite', icon: Milk },
  { id: 'meat', label: 'Carne & Peso', icon: Beef },
  { id: 'nutrition', label: 'Nutrição NRC', icon: Wheat },
  { id: 'pastures', label: 'Pastagens', icon: Sprout },
  { id: 'health', label: 'Sanidade', icon: Syringe },
  { id: 'pharmacy', label: 'Farmácia', icon: Package },
  { id: 'disease_library', label: 'Patologias', icon: BookOpen },
  { id: 'photo_diary', label: 'Diário Visual', icon: Camera },
  { id: 'facilities', label: 'Apriscos', icon: Home },
  { id: 'reports', label: 'Relatórios', icon: FileText }
];

function resolveTab(raw?: string): CaprineTab {
  if (raw && VALID_TABS.includes(raw as CaprineTab)) {
    return raw as CaprineTab;
  }
  return 'dashboard';
}

export const CaprineModule: React.FC<CaprineModuleProps> = ({
  activeSubTab,
  setActiveSubTab
}) => {
  const [internalTab, setInternalTab] = useState<CaprineTab>(() => resolveTab(activeSubTab));
  const [animals, setAnimals] = useState<CaprineAnimal[]>(() => loadCaprineAnimals());
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(() => loadCaprineAnimals()[0]?.id || '');

  const [milkLogs, setMilkLogs] = useState<CaprineMilkRecord[]>(() => loadCaprineMilkLogs());
  const [meatLogs, setMeatLogs] = useState<CaprineMeatRecord[]>(() => loadCaprineMeatLogs());
  const [weighings, setWeighings] = useState<CaprineWeighingRecord[]>(() => loadCaprineWeighings());
  const [healthRecords, setHealthRecords] = useState<CaprineHealthRecord[]>(() => loadCaprineHealth());
  const [reproductionRecords, setReproductionRecords] = useState<CaprineReproductionRecord[]>(() => loadCaprineReproduction());
  const [kidRecords, setKidRecords] = useState<CaprineKidRecord[]>(() => loadCaprineKids());
  const [feeds, setFeeds] = useState<CaprineFeedItem[]>(() => loadCaprineFeeds());
  const [paddocks, setPaddocks] = useState<CaprinePasturePaddock[]>(() => loadCaprinePaddocks());
  const [pharmacy, setPharmacy] = useState<CaprinePharmacyItem[]>(() => loadCaprinePharmacy());
  const [photos, setPhotos] = useState<CaprinePhotoEntry[]>(() => loadCaprinePhotos());
  const [facilities, setFacilities] = useState<CaprineFacility[]>(() => loadCaprineFacilities());

  useEffect(() => {
    if (activeSubTab) {
      const next = resolveTab(activeSubTab);
      if (next !== internalTab) {
        setInternalTab(next);
      }
    }
  }, [activeSubTab, internalTab]);

  const activeTab: CaprineTab = activeSubTab ? resolveTab(activeSubTab) : internalTab;

  const handleTabChange = (tab: CaprineTab) => {
    setInternalTab(tab);
    if (setActiveSubTab) {
      setActiveSubTab(tab);
    }
  };

  const handleSelectAnimalForTwin = (id: string) => {
    setSelectedAnimalId(id);
    handleTabChange('digital_twin');
  };

  const handleSaveAnimal = (animal: CaprineAnimal) => {
    const existingIndex = animals.findIndex(a => a.id === animal.id);
    const updated =
      existingIndex >= 0
        ? animals.map(a => (a.id === animal.id ? animal : a))
        : [animal, ...animals];
    setAnimals(updated);
    saveCaprineAnimals(updated);
    if (!selectedAnimalId) {
      setSelectedAnimalId(animal.id);
    }
  };

  const handleDeleteAnimal = (id: string) => {
    const updated = animals.filter(a => a.id !== id);
    setAnimals(updated);
    saveCaprineAnimals(updated);
    if (selectedAnimalId === id) {
      setSelectedAnimalId(updated[0]?.id || '');
    }
  };

  const handleSaveMilkLog = (log: CaprineMilkRecord) => {
    const updated = [log, ...milkLogs];
    setMilkLogs(updated);
    saveCaprineMilkLogs(updated);
  };

  const handleSaveMeatRecord = (rec: CaprineMeatRecord) => {
    const updated = [rec, ...meatLogs];
    setMeatLogs(updated);
    saveCaprineMeatLogs(updated);
  };

  const handleSaveWeighing = (wei: CaprineWeighingRecord) => {
    const updated = [wei, ...weighings];
    setWeighings(updated);
    saveCaprineWeighings(updated);

    // Sync latest weight/ECC/FAMACHA back to animal profile
    if (wei.animalId) {
      const updatedAnimals = animals.map(a =>
        a.id === wei.animalId
          ? {
              ...a,
              weightKg: wei.weightKg,
              bodyConditionScore: wei.bodyConditionScore ?? a.bodyConditionScore,
              famachaScore: wei.famachaScore ?? a.famachaScore
            }
          : a
      );
      setAnimals(updatedAnimals);
      saveCaprineAnimals(updatedAnimals);
    }
  };

  const handleSaveHealthRecord = (rec: CaprineHealthRecord) => {
    const updated = [rec, ...healthRecords];
    setHealthRecords(updated);
    saveCaprineHealth(updated);

    if (rec.animalId && rec.famachaScore) {
      const updatedAnimals = animals.map(a =>
        a.id === rec.animalId ? { ...a, famachaScore: rec.famachaScore } : a
      );
      setAnimals(updatedAnimals);
      saveCaprineAnimals(updatedAnimals);
    }
  };

  const handleSaveReproductionRecord = (rec: CaprineReproductionRecord) => {
    const updated = [rec, ...reproductionRecords];
    setReproductionRecords(updated);
    saveCaprineReproduction(updated);
  };

  const handleSaveKidRecord = (kid: CaprineKidRecord) => {
    const updated = [kid, ...kidRecords];
    setKidRecords(updated);
    saveCaprineKids(updated);
  };

  const handleSaveFeed = (feed: CaprineFeedItem) => {
    const updated = [feed, ...feeds];
    setFeeds(updated);
    saveCaprineFeeds(updated);
  };

  const handleSavePaddock = (padd: CaprinePasturePaddock) => {
    const updated = [padd, ...paddocks];
    setPaddocks(updated);
    saveCaprinePaddocks(updated);
  };

  const handleSavePharmacyItem = (item: CaprinePharmacyItem) => {
    const existingIndex = pharmacy.findIndex(p => p.id === item.id);
    const updated =
      existingIndex >= 0
        ? pharmacy.map(p => (p.id === item.id ? item : p))
        : [item, ...pharmacy];
    setPharmacy(updated);
    saveCaprinePharmacy(updated);
  };

  const handleSavePhoto = (photo: CaprinePhotoEntry) => {
    const updated = [photo, ...photos];
    setPhotos(updated);
    saveCaprinePhotos(updated);
  };

  const handleSaveFacility = (facility: CaprineFacility) => {
    const updated = [facility, ...facilities];
    setFacilities(updated);
    saveCaprineFacilities(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 pb-10 space-y-5 text-slate-900 dark:text-zinc-100">
      {/* Compact Horizontal Sub-Navigation Strip */}
      <div className="border-b border-slate-200 dark:border-zinc-800 print:hidden">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar -mb-px pb-0.5">
          {SUB_NAV_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`h-8 px-2.5 inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Sub-View */}
      {activeTab === 'dashboard' && (
        <CaprineDashboardView
          animals={animals}
          milkLogs={milkLogs}
          weighings={weighings}
          healthRecords={healthRecords}
          onNavigate={handleTabChange}
          onOpenAddAnimalModal={() => handleTabChange('registry')}
          onSelectAnimalForTwin={handleSelectAnimalForTwin}
        />
      )}

      {activeTab === 'digital_twin' && (
        <CaprineDigitalTwinView
          animals={animals}
          selectedAnimalId={selectedAnimalId}
          milkLogs={milkLogs}
          weighings={weighings}
          healthRecords={healthRecords}
          reproductionRecords={reproductionRecords}
          photos={photos}
          onSelectAnimal={id => setSelectedAnimalId(id)}
        />
      )}

      {activeTab === 'registry' && (
        <CaprineIndividualRegistryView
          animals={animals}
          onSaveAnimal={handleSaveAnimal}
          onDeleteAnimal={handleDeleteAnimal}
          onSelectAnimalForTwin={handleSelectAnimalForTwin}
        />
      )}

      {activeTab === 'genealogy' && (
        <CaprineGenealogyView animals={animals} />
      )}

      {activeTab === 'reproduction' && (
        <CaprineReproductionView
          animals={animals}
          reproductionRecords={reproductionRecords}
          onSaveRecord={handleSaveReproductionRecord}
        />
      )}

      {activeTab === 'kids' && (
        <CaprineKidsManagementView
          animals={animals}
          kidRecords={kidRecords}
          onSaveKid={handleSaveKidRecord}
        />
      )}

      {activeTab === 'milk' && (
        <CaprineDairyProductionView
          animals={animals}
          milkLogs={milkLogs}
          onSaveMilkLog={handleSaveMilkLog}
        />
      )}

      {activeTab === 'meat' && (
        <CaprineMeatProductionView
          animals={animals}
          meatRecords={meatLogs}
          weighings={weighings}
          onSaveMeatRecord={handleSaveMeatRecord}
          onSaveWeighing={handleSaveWeighing}
        />
      )}

      {activeTab === 'nutrition' && (
        <CaprineNutritionView
          feeds={feeds}
          onSaveFeed={handleSaveFeed}
        />
      )}

      {activeTab === 'pastures' && (
        <CaprinePasturesView
          paddocks={paddocks}
          onSavePaddock={handleSavePaddock}
        />
      )}

      {activeTab === 'health' && (
        <CaprineHealthVaccinesView
          animals={animals}
          healthRecords={healthRecords}
          onSaveHealthRecord={handleSaveHealthRecord}
        />
      )}

      {activeTab === 'pharmacy' && (
        <CaprinePharmacyView
          pharmacy={pharmacy}
          onSavePharmacyItem={handleSavePharmacyItem}
        />
      )}

      {activeTab === 'disease_library' && (
        <CaprineDiseaseLibraryView />
      )}

      {activeTab === 'photo_diary' && (
        <CaprinePhotoDiaryView
          photos={photos}
          animals={animals}
          onSavePhoto={handleSavePhoto}
        />
      )}

      {activeTab === 'facilities' && (
        <CaprineFacilitiesView
          facilities={facilities}
          onSaveFacility={handleSaveFacility}
        />
      )}

      {activeTab === 'reports' && (
        <CaprineReportsView
          animals={animals}
          milkLogs={milkLogs}
          healthRecords={healthRecords}
          reproductionRecords={reproductionRecords}
        />
      )}
    </div>
  );
};

export default CaprineModule;
