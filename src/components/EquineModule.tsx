// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Award,
  ShieldCheck,
  Scale,
  Activity,
  Heart,
  Calendar,
  Clock,
  Dna,
  Zap,
  QrCode,
  FileText,
  TrendingUp,
  Stethoscope,
  Building2,
  Hammer,
  DollarSign,
  Package,
  Layers,
  Search,
  BookOpen,
} from 'lucide-react';

import {
  EquineAnimal,
  EquineBiometricsRecord,
  EquineHealthRecord,
  EquineFarrieryRecord,
  EquineDentalRecord,
  EquineTrainingRecord,
  EquineCompetitionRecord,
  EquineReproductionRecord,
  EquineNutritionPlan,
  EquineExpenseRecord,
  EquineFacility,
  EquineInventoryItem,
  EquineExamRecord,
} from '../types/equine';

import {
  loadEquineAnimals,
  saveEquineAnimals,
  loadEquineBiometrics,
  saveEquineBiometrics,
  loadEquineHealth,
  saveEquineHealth,
  loadEquineFarriery,
  saveEquineFarriery,
  loadEquineDental,
  saveEquineDental,
  loadEquineTrainings,
  saveEquineTrainings,
  loadEquineCompetitions,
  saveEquineCompetitions,
  loadEquineReproduction,
  saveEquineReproduction,
  loadEquineNutritionPlans,
  saveEquineNutritionPlans,
  loadEquineExpenses,
  saveEquineExpenses,
  loadEquineFacilities,
  saveEquineFacilities,
  loadEquineInventory,
  saveEquineInventory,
  loadEquineExams,
  saveEquineExams,
} from '../utils/equineStorage';

import { EquineDashboardView } from './equine/EquineDashboardView';
import { EquineDigitalTwinView } from './equine/EquineDigitalTwinView';
import { EquineRegistryView } from './equine/EquineRegistryView';
import { EquineGenealogyView } from './equine/EquineGenealogyView';
import { EquineReproductionView } from './equine/EquineReproductionView';
import { EquineBiometricsView } from './equine/EquineBiometricsView';
import { EquineNutritionView } from './equine/EquineNutritionView';
import { EquineHealthSanityView } from './equine/EquineHealthSanityView';
import { EquineFarrieryView } from './equine/EquineFarrieryView';
import { EquineTrainingPerformanceView } from './equine/EquineTrainingPerformanceView';
import { EquineDentalView } from './equine/EquineDentalView';
import { EquineFinancialView } from './equine/EquineFinancialView';
import { EquineFacilitiesInventoryView } from './equine/EquineFacilitiesInventoryView';
import { EquineDiseasesBankView } from './equine/EquineDiseasesBankView';
import { EquineDigitalPassportModal } from './equine/EquineDigitalPassportModal';
import { EquinoIcon } from './icons/EquinoIcon';

interface EquineModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (subTab: string) => void;
}

export const EquineModule: React.FC<EquineModuleProps> = ({
  activeSubTab: propActiveSubTab = 'dashboard',
  setActiveSubTab: propSetActiveSubTab
}) => {
  // Navigation tab state
  const [internalSubTab, setInternalSubTab] = useState<string>(propActiveSubTab || 'dashboard');
  const [focusedAnimalId, setFocusedAnimalId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (propActiveSubTab && propActiveSubTab !== internalSubTab) {
      setInternalSubTab(propActiveSubTab);
    }
  }, [propActiveSubTab]);

  const activeSubTab = propActiveSubTab || internalSubTab;

  const setActiveSubTab = (tab: string) => {
    setInternalSubTab(tab);
    if (propSetActiveSubTab) {
      propSetActiveSubTab(tab);
    }
  };

  // Passport modal state
  const [passportAnimal, setPassportAnimal] = useState<EquineAnimal | null>(null);

  // Core Data States
  const [animals, setAnimals] = useState<EquineAnimal[]>(() => loadEquineAnimals());
  const [biometrics, setBiometrics] = useState<EquineBiometricsRecord[]>(() => loadEquineBiometrics());
  const [health, setHealth] = useState<EquineHealthRecord[]>(() => loadEquineHealth());
  const [farriery, setFarriery] = useState<EquineFarrieryRecord[]>(() => loadEquineFarriery());
  const [dental, setDental] = useState<EquineDentalRecord[]>(() => loadEquineDental());
  const [training, setTraining] = useState<EquineTrainingRecord[]>(() => loadEquineTrainings());
  const [competitions, setCompetitions] = useState<EquineCompetitionRecord[]>(() => loadEquineCompetitions());
  const [reproduction, setReproduction] = useState<EquineReproductionRecord[]>(() => loadEquineReproduction());
  const [nutritionPlans, setNutritionPlans] = useState<EquineNutritionPlan[]>(() => loadEquineNutritionPlans());
  const [expenses, setExpenses] = useState<EquineExpenseRecord[]>(() => loadEquineExpenses());
  const [facilities, setFacilities] = useState<EquineFacility[]>(() => loadEquineFacilities());
  const [inventory, setInventory] = useState<EquineInventoryItem[]>(() => loadEquineInventory());
  const [exams, setExams] = useState<EquineExamRecord[]>(() => loadEquineExams());

  // Storage Sync
  useEffect(() => {
    setAnimals(loadEquineAnimals());
    setBiometrics(loadEquineBiometrics());
    setHealth(loadEquineHealth());
    setFarriery(loadEquineFarriery());
    setDental(loadEquineDental());
    setTraining(loadEquineTrainings());
    setCompetitions(loadEquineCompetitions());
    setReproduction(loadEquineReproduction());
    setNutritionPlans(loadEquineNutritionPlans());
    setExpenses(loadEquineExpenses());
    setFacilities(loadEquineFacilities());
    setInventory(loadEquineInventory());
    setExams(loadEquineExams());
  }, []);

  // Handler functions with persistence
  const handleAddAnimal = (newAnimal: EquineAnimal) => {
    const updated = [newAnimal, ...animals];
    setAnimals(updated);
    saveEquineAnimals(updated);
  };

  const handleUpdateAnimal = (updatedAnimal: EquineAnimal) => {
    const updated = animals.map(a => (a.id === updatedAnimal.id ? updatedAnimal : a));
    setAnimals(updated);
    saveEquineAnimals(updated);
  };

  const handleDeleteAnimal = (id: string) => {
    if (confirm('Deseja realmente remover o registro deste equino?')) {
      const updated = animals.filter(a => a.id !== id);
      setAnimals(updated);
      saveEquineAnimals(updated);
    }
  };

  const handleAddBiometrics = (record: EquineBiometricsRecord) => {
    const updated = [record, ...biometrics];
    setBiometrics(updated);
    saveEquineBiometrics(updated);
  };

  const handleAddHealth = (record: EquineHealthRecord) => {
    const updated = [record, ...health];
    setHealth(updated);
    saveEquineHealth(updated);
  };

  const handleAddExam = (record: EquineExamRecord) => {
    const updated = [record, ...exams];
    setExams(updated);
    saveEquineExams(updated);
  };

  const handleAddFarriery = (record: EquineFarrieryRecord) => {
    const updated = [record, ...farriery];
    setFarriery(updated);
    saveEquineFarriery(updated);
  };

  const handleAddDental = (record: EquineDentalRecord) => {
    const updated = [record, ...dental];
    setDental(updated);
    saveEquineDental(updated);
  };

  const handleAddTraining = (record: EquineTrainingRecord) => {
    const updated = [record, ...training];
    setTraining(updated);
    saveEquineTrainings(updated);
  };

  const handleAddCompetition = (record: EquineCompetitionRecord) => {
    const updated = [record, ...competitions];
    setCompetitions(updated);
    saveEquineCompetitions(updated);
  };

  const handleAddReproduction = (record: EquineReproductionRecord) => {
    const updated = [record, ...reproduction];
    setReproduction(updated);
    saveEquineReproduction(updated);
  };

  const handleUpdateReproduction = (record: EquineReproductionRecord) => {
    const updated = reproduction.map(r => (r.id === record.id ? record : r));
    setReproduction(updated);
    saveEquineReproduction(updated);
  };

  const handleSaveNutritionPlan = (plan: EquineNutritionPlan) => {
    const updated = [plan, ...nutritionPlans];
    setNutritionPlans(updated);
    saveEquineNutritionPlans(updated);
  };

  const handleAddExpense = (record: EquineExpenseRecord) => {
    const updated = [record, ...expenses];
    setExpenses(updated);
    saveEquineExpenses(updated);
  };

  const handleAddFacility = (fac: EquineFacility) => {
    const updated = [fac, ...facilities];
    setFacilities(updated);
    saveEquineFacilities(updated);
  };

  const handleUpdateFacility = (fac: EquineFacility) => {
    const updated = facilities.map(f => (f.id === fac.id ? fac : f));
    setFacilities(updated);
    saveEquineFacilities(updated);
  };

  const handleAddInventoryItem = (item: EquineInventoryItem) => {
    const updated = [item, ...inventory];
    setInventory(updated);
    saveEquineInventory(updated);
  };

  const handleUpdateInventoryItem = (item: EquineInventoryItem) => {
    const updated = inventory.map(i => (i.id === item.id ? item : i));
    setInventory(updated);
    saveEquineInventory(updated);
  };

  const handleNavigateTab = (tabId: string, animalId?: string) => {
    setActiveSubTab(tabId);
    if (animalId) setFocusedAnimalId(animalId);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 pb-16">
      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {activeSubTab === 'dashboard' && (
          <EquineDashboardView
            animals={animals}
            biometrics={biometrics}
            healthRecords={health}
            farrieryRecords={farriery}
            dentalRecords={dental}
            trainingRecords={training}
            competitionRecords={competitions}
            reproductionRecords={reproduction}
            expenses={expenses}
            facilities={facilities}
            onOpenPassport={a => setPassportAnimal(a)}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeSubTab === 'digital_twin' && (
          <EquineDigitalTwinView
            animals={animals}
            selectedAnimalId={focusedAnimalId}
            biometricsRecords={biometrics}
            healthRecords={health}
            farrieryRecords={farriery}
            dentalRecords={dental}
            trainingRecords={training}
            competitionRecords={competitions}
            reproductionRecords={reproduction}
            onOpenPassport={a => setPassportAnimal(a)}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeSubTab === 'registry' && (
          <EquineRegistryView
            animals={animals}
            onAddAnimal={handleAddAnimal}
            onUpdateAnimal={handleUpdateAnimal}
            onDeleteAnimal={handleDeleteAnimal}
            onOpenPassport={a => setPassportAnimal(a)}
            onNavigateToTwin={id => {
              setFocusedAnimalId(id);
              setActiveSubTab('digital_twin');
            }}
          />
        )}

        {activeSubTab === 'genealogy' && (
          <EquineGenealogyView
            animals={animals}
            selectedAnimalId={focusedAnimalId}
            onUpdateAnimal={handleUpdateAnimal}
          />
        )}

        {activeSubTab === 'reproduction' && (
          <EquineReproductionView
            animals={animals}
            reproductionRecords={reproduction}
            onAddReproduction={handleAddReproduction}
            onUpdateReproduction={handleUpdateReproduction}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeSubTab === 'biometrics' && (
          <EquineBiometricsView
            animals={animals}
            selectedAnimalId={focusedAnimalId}
            biometricsRecords={biometrics}
            onAddBiometrics={handleAddBiometrics}
            onUpdateAnimal={handleUpdateAnimal}
          />
        )}

        {activeSubTab === 'nutrition' && (
          <EquineNutritionView
            animals={animals}
            selectedAnimalId={focusedAnimalId}
            nutritionPlans={nutritionPlans}
            onSavePlan={handleSaveNutritionPlan}
          />
        )}

        {activeSubTab === 'health' && (
          <EquineHealthSanityView
            animals={animals}
            healthRecords={health}
            examRecords={exams}
            onAddHealth={handleAddHealth}
            onAddExam={handleAddExam}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeSubTab === 'farriery' && (
          <EquineFarrieryView
            animals={animals}
            farrieryRecords={farriery}
            onAddFarriery={handleAddFarriery}
          />
        )}

        {activeSubTab === 'training' && (
          <EquineTrainingPerformanceView
            animals={animals}
            trainingRecords={training}
            competitionRecords={competitions}
            onAddTraining={handleAddTraining}
            onAddCompetition={handleAddCompetition}
          />
        )}

        {activeSubTab === 'dental' && (
          <EquineDentalView
            animals={animals}
            dentalRecords={dental}
            onAddDental={handleAddDental}
          />
        )}

        {activeSubTab === 'financial' && (
          <EquineFinancialView
            animals={animals}
            expenses={expenses}
            onAddExpense={handleAddExpense}
          />
        )}

        {activeSubTab === 'facilities_inventory' && (
          <EquineFacilitiesInventoryView
            animals={animals}
            facilities={facilities}
            inventory={inventory}
            onAddFacility={handleAddFacility}
            onUpdateFacility={handleUpdateFacility}
            onAddInventoryItem={handleAddInventoryItem}
            onUpdateInventoryItem={handleUpdateInventoryItem}
          />
        )}

        {activeSubTab === 'diseases_bank' && (
          <EquineDiseasesBankView onBack={() => setActiveSubTab('health')} />
        )}
      </main>

      {/* Digital Passport Modal (Digital Twin Passport) */}
      {passportAnimal && (
        <EquineDigitalPassportModal
          animal={passportAnimal}
          healthRecords={health}
          farrieryRecords={farriery}
          dentalRecords={dental}
          trainingRecords={training}
          competitionRecords={competitions}
          reproductionRecords={reproduction}
          onClose={() => setPassportAnimal(null)}
        />
      )}
    </div>
  );
};

export default EquineModule;
