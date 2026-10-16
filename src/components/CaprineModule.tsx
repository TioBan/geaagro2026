// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  loadCaprineAnimals,
  saveCaprineAnimals,
  loadCaprineMilkLogs,
  saveCaprineMilkLogs,
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
  CaprineAnimal,
  CaprineMilkRecord,
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
import { CaprinoIcon } from './icons/CaprinoIcon';

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
  WifiOff,
  BookOpen
} from 'lucide-react';

type CaprineTab =
  | 'dashboard'
  | 'digital_twin'
  | 'registry'
  | 'genealogy'
  | 'reproduction'
  | 'kids'
  | 'milk'
  | 'meat'
  | 'nutrition'
  | 'pastures'
  | 'health'
  | 'pharmacy'
  | 'photo_diary'
  | 'facilities'
  | 'disease_library'
  | 'reports';

interface CaprineModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (subTab: string) => void;
}

export const CaprineModule: React.FC<CaprineModuleProps> = ({
  activeSubTab = 'dashboard',
  setActiveSubTab
}) => {
  const [internalTab, setInternalTab] = useState<CaprineTab>((activeSubTab as CaprineTab) || 'dashboard');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');

  useEffect(() => {
    if (activeSubTab && activeSubTab !== internalTab) {
      setInternalTab(activeSubTab as CaprineTab);
    }
  }, [activeSubTab]);

  const activeTab = (activeSubTab as CaprineTab) || internalTab;

  const handleTabChange = (tab: CaprineTab | string) => {
    setInternalTab(tab as CaprineTab);
    if (setActiveSubTab) {
      setActiveSubTab(tab);
    }
  };

  // Local storage states
  const [animals, setAnimals] = useState<CaprineAnimal[]>([]);
  const [milkLogs, setMilkLogs] = useState<CaprineMilkRecord[]>([]);
  const [weighings, setWeighings] = useState<CaprineWeighingRecord[]>([]);
  const [healthRecords, setHealthRecords] = useState<CaprineHealthRecord[]>([]);
  const [reproductionRecords, setReproductionRecords] = useState<CaprineReproductionRecord[]>([]);
  const [kidRecords, setKidRecords] = useState<CaprineKidRecord[]>([]);
  const [feeds, setFeeds] = useState<CaprineFeedItem[]>([]);
  const [paddocks, setPaddocks] = useState<CaprinePasturePaddock[]>([]);
  const [pharmacy, setPharmacy] = useState<CaprinePharmacyItem[]>([]);
  const [photos, setPhotos] = useState<CaprinePhotoEntry[]>([]);
  const [facilities, setFacilities] = useState<CaprineFacility[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const loadedAnimals = loadCaprineAnimals();
    setAnimals(loadedAnimals);
    if (loadedAnimals.length > 0 && loadedAnimals[0]?.id) setSelectedAnimalId(loadedAnimals[0].id);

    setMilkLogs(loadCaprineMilkLogs());
    setWeighings(loadCaprineWeighings());
    setHealthRecords(loadCaprineHealth());
    setReproductionRecords(loadCaprineReproduction());
    setKidRecords(loadCaprineKids());
    setFeeds(loadCaprineFeeds());
    setPaddocks(loadCaprinePaddocks());
    setPharmacy(loadCaprinePharmacy());
    setPhotos(loadCaprinePhotos());
    setFacilities(loadCaprineFacilities());
  }, []);

  // Handlers for updating local state and local storage
  const handleSaveAnimal = (animal: CaprineAnimal) => {
    const existingIndex = animals.findIndex(a => a.id === animal.id);
    let updated: CaprineAnimal[];
    if (existingIndex >= 0) {
      updated = [...animals];
      updated[existingIndex] = animal;
    } else {
      updated = [animal, ...animals];
    }
    setAnimals(updated);
    saveCaprineAnimals(updated);
  };

  const handleSaveMilkLog = (log: CaprineMilkRecord) => {
    const updated = [log, ...milkLogs];
    setMilkLogs(updated);
    saveCaprineMilkLogs(updated);
  };

  const handleSaveWeighing = (wei: CaprineWeighingRecord) => {
    const updated = [wei, ...weighings];
    setWeighings(updated);
    saveCaprineWeighings(updated);
  };

  const handleSaveHealthRecord = (rec: CaprineHealthRecord) => {
    const updated = [rec, ...healthRecords];
    setHealthRecords(updated);
    saveCaprineHealth(updated);
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
    const updated = [item, ...pharmacy];
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

  // Sub-Navigation Tabs Config
  const subNavTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'digital_twin', label: 'Gêmeo Digital 360°', icon: Sparkles },
    { id: 'registry', label: 'Cadastro (RFID)', icon: Users },
    { id: 'genealogy', label: 'Genealogia', icon: Dna },
    { id: 'reproduction', label: 'Reprodução & IA', icon: Heart },
    { id: 'kids', label: 'Criação Cabritos', icon: Baby },
    { id: 'milk', label: 'Produção Leite', icon: Milk },
    { id: 'meat', label: 'Produção Carne', icon: Beef },
    { id: 'nutrition', label: 'Nutrição (NRC)', icon: Wheat },
    { id: 'pastures', label: 'Pastagens/Caprineira', icon: Sprout },
    { id: 'health', label: 'Sanidade & FAMACHA', icon: Syringe },
    { id: 'pharmacy', label: 'Farmácia', icon: Package },
    { id: 'disease_library', label: 'Biblioteca de Doenças', icon: BookOpen },
    { id: 'photo_diary', label: 'Diário Fotográfico', icon: Camera },
    { id: 'facilities', label: 'Apriscos', icon: Home },
    { id: 'reports', label: 'Relatórios & Exportar', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-stone-100 p-4 md:p-6 space-y-6">

      {/* Main Tab Content View Switcher */}
      {activeTab === 'dashboard' && (
        <CaprineDashboardView
          animals={animals}
          milkLogs={milkLogs}
          weighings={weighings}
          healthRecords={healthRecords}
          onNavigate={handleTabChange}
          onOpenAddAnimalModal={() => handleTabChange('registry')}
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
          meatRecords={[]}
          weighings={weighings}
          onSaveMeatRecord={() => {}}
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
