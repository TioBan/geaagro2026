import React, { useState } from 'react';
import {
  LayoutGrid,
  Sparkles,
  ShieldCheck,
  Dna,
  Heart,
  Scale,
  Wheat,
  Syringe,
  Hammer,
  Award,
  Activity,
  DollarSign,
  Building2,
  BookOpen,
} from 'lucide-react';
import {
  EquineAnimal,
  EquineBiometricsRecord,
  EquineReproductionRecord,
  EquineHealthRecord,
  EquineDentalRecord,
  EquineFarrieryRecord,
  EquineTrainingRecord,
  EquineCompetitionRecord,
  EquineNutritionPlan,
  EquineFacility,
  EquineExpenseRecord,
  EquineInventoryItem,
  EquineExamRecord,
} from '../types/equine';
import {
  loadEquineAnimals,
  saveEquineAnimals,
  loadEquineBiometrics,
  saveEquineBiometrics,
  loadEquineReproduction,
  saveEquineReproduction,
  loadEquineHealth,
  saveEquineHealth,
  loadEquineDental,
  saveEquineDental,
  loadEquineFarriery,
  saveEquineFarriery,
  loadEquineTrainings,
  saveEquineTrainings,
  loadEquineCompetitions,
  saveEquineCompetitions,
  loadEquineNutritionPlans,
  saveEquineNutritionPlans,
  loadEquineFacilities,
  saveEquineFacilities,
  loadEquineExpenses,
  saveEquineExpenses,
  loadEquineInventory,
  saveEquineInventory,
  loadEquineExams,
  saveEquineExams,
} from '../utils/equineStorage';
import { EquineDashboardView } from './equine/EquineDashboardView';
import { EquineRegistryView } from './equine/EquineRegistryView';
import { EquineDigitalTwinView } from './equine/EquineDigitalTwinView';
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

interface Props {
  activeSubTab?: string;
  setActiveSubTab?: (tab: string) => void;
}

const EQUINE_SUBTABS = [
  { id: 'dashboard', label: 'Painel', icon: LayoutGrid },
  { id: 'registry', label: 'Plantel', icon: ShieldCheck },
  { id: 'digital_twin', label: 'Gêmeo 360°', icon: Sparkles },
  { id: 'genealogy', label: 'Genealogia', icon: Dna },
  { id: 'reproduction', label: 'Reprodução', icon: Heart },
  { id: 'biometrics', label: 'Biometria', icon: Scale },
  { id: 'nutrition', label: 'Nutrição NRC', icon: Wheat },
  { id: 'health', label: 'Sanidade', icon: Syringe },
  { id: 'farriery', label: 'Podologia', icon: Hammer },
  { id: 'dental', label: 'Odontologia', icon: Activity },
  { id: 'training', label: 'Treinos & Provas', icon: Award },
  { id: 'financial', label: 'Custos', icon: DollarSign },
  { id: 'facilities_inventory', label: 'Haras & Estoque', icon: Building2 },
  { id: 'diseases_bank', label: 'Enfermidades', icon: BookOpen },
] as const;

export const EquineModule: React.FC<Props> = ({
  activeSubTab: externalSubTab,
  setActiveSubTab: externalSetSubTab,
}) => {
  const [internalSubTab, setInternalSubTab] = useState<string>('dashboard');
  const activeSubTab = externalSubTab || internalSubTab;
  const setActiveSubTab = externalSetSubTab || setInternalSubTab;

  const [animals, setAnimals] = useState<EquineAnimal[]>(() => loadEquineAnimals());
  const [biometrics, setBiometrics] = useState<EquineBiometricsRecord[]>(() => loadEquineBiometrics());
  const [reproduction, setReproduction] = useState<EquineReproductionRecord[]>(() => loadEquineReproduction());
  const [health, setHealth] = useState<EquineHealthRecord[]>(() => loadEquineHealth());
  const [dental, setDental] = useState<EquineDentalRecord[]>(() => loadEquineDental());
  const [farriery, setFarriery] = useState<EquineFarrieryRecord[]>(() => loadEquineFarriery());
  const [trainings, setTrainings] = useState<EquineTrainingRecord[]>(() => loadEquineTrainings());
  const [competitions, setCompetitions] = useState<EquineCompetitionRecord[]>(() => loadEquineCompetitions());
  const [nutritionPlans, setNutritionPlans] = useState<EquineNutritionPlan[]>(() => loadEquineNutritionPlans());
  const [facilities, setFacilities] = useState<EquineFacility[]>(() => loadEquineFacilities());
  const [expenses, setExpenses] = useState<EquineExpenseRecord[]>(() => loadEquineExpenses());
  const [inventory, setInventory] = useState<EquineInventoryItem[]>(() => loadEquineInventory());
  const [exams, setExams] = useState<EquineExamRecord[]>(() => loadEquineExams());

  const [selectedAnimalId, setSelectedAnimalId] = useState<string | undefined>(undefined);
  const [passportAnimal, setPassportAnimal] = useState<EquineAnimal | null>(null);

  const handleNavigateTab = (tabId: string, animalId?: string) => {
    if (animalId) {
      setSelectedAnimalId(animalId);
    }
    setActiveSubTab(tabId);
  };

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
    const updated = animals.filter(a => a.id !== id);
    setAnimals(updated);
    saveEquineAnimals(updated);
    if (selectedAnimalId === id) {
      setSelectedAnimalId(undefined);
    }
  };

  const handleAddBiometrics = (record: EquineBiometricsRecord) => {
    const updated = [record, ...biometrics];
    setBiometrics(updated);
    saveEquineBiometrics(updated);

    const animal = animals.find(a => a.id === record.animalId);
    if (animal) {
      handleUpdateAnimal({
        ...animal,
        weightKg: record.weightKg,
        bodyScore: record.bodyScore,
        heightM: record.heightM || animal.heightM,
        chestCircumferenceCm: record.chestCircumferenceCm || animal.chestCircumferenceCm,
        updatedAt: new Date().toISOString(),
      });
    }
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

  const handleAddDental = (record: EquineDentalRecord) => {
    const updated = [record, ...dental];
    setDental(updated);
    saveEquineDental(updated);
  };

  const handleAddFarriery = (record: EquineFarrieryRecord) => {
    const updated = [record, ...farriery];
    setFarriery(updated);
    saveEquineFarriery(updated);
  };

  const handleAddTraining = (record: EquineTrainingRecord) => {
    const updated = [record, ...trainings];
    setTrainings(updated);
    saveEquineTrainings(updated);
  };

  const handleAddCompetition = (record: EquineCompetitionRecord) => {
    const updated = [record, ...competitions];
    setCompetitions(updated);
    saveEquineCompetitions(updated);
  };

  const handleSaveNutritionPlan = (plan: EquineNutritionPlan) => {
    const updated = [plan, ...nutritionPlans];
    setNutritionPlans(updated);
    saveEquineNutritionPlans(updated);
  };

  const handleAddFacility = (facility: EquineFacility) => {
    const updated = [facility, ...facilities];
    setFacilities(updated);
    saveEquineFacilities(updated);
  };

  const handleUpdateFacility = (facility: EquineFacility) => {
    const updated = facilities.map(f => (f.id === facility.id ? facility : f));
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

  const handleAddExpense = (expense: EquineExpenseRecord) => {
    const updated = [expense, ...expenses];
    setExpenses(updated);
    saveEquineExpenses(updated);
  };

  const currentTab = activeSubTab || 'dashboard';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 pb-10 space-y-5 text-slate-900 dark:text-zinc-100">
      {/* Compact Horizontal Module Sub-Navigation */}
      <nav
        aria-label="Seções de Equinos"
        className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200 dark:border-zinc-800 no-scrollbar"
      >
        {EQUINE_SUBTABS.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`h-8 px-2.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/70 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Active Subview Content */}
      <main>
        {currentTab === 'dashboard' && (
          <EquineDashboardView
            animals={animals}
            healthRecords={health}
            farrieryRecords={farriery}
            trainingRecords={trainings}
            competitionRecords={competitions}
            expenses={expenses}
            onNavigateTab={handleNavigateTab}
            onOpenPassport={animal => setPassportAnimal(animal)}
          />
        )}

        {currentTab === 'registry' && (
          <EquineRegistryView
            animals={animals}
            onAddAnimal={handleAddAnimal}
            onUpdateAnimal={handleUpdateAnimal}
            onDeleteAnimal={handleDeleteAnimal}
            onNavigateTab={handleNavigateTab}
            onOpenPassport={animal => setPassportAnimal(animal)}
          />
        )}

        {currentTab === 'digital_twin' && (
          <EquineDigitalTwinView
            animals={animals}
            selectedAnimalId={selectedAnimalId}
            healthRecords={health}
            farrieryRecords={farriery}
            dentalRecords={dental}
            trainingRecords={trainings}
            competitionRecords={competitions}
            reproductionRecords={reproduction}
            biometricsRecords={biometrics}
            onNavigateTab={handleNavigateTab}
            onOpenPassport={animal => setPassportAnimal(animal)}
          />
        )}

        {currentTab === 'genealogy' && (
          <EquineGenealogyView
            animals={animals}
            selectedAnimalId={selectedAnimalId}
            onUpdateAnimal={handleUpdateAnimal}
          />
        )}

        {currentTab === 'reproduction' && (
          <EquineReproductionView
            animals={animals}
            reproductionRecords={reproduction}
            onAddReproduction={handleAddReproduction}
            onUpdateReproduction={handleUpdateReproduction}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {currentTab === 'biometrics' && (
          <EquineBiometricsView
            animals={animals}
            selectedAnimalId={selectedAnimalId}
            biometricsRecords={biometrics}
            onAddBiometrics={handleAddBiometrics}
          />
        )}

        {currentTab === 'nutrition' && (
          <EquineNutritionView
            animals={animals}
            nutritionPlans={nutritionPlans}
            onSaveNutritionPlan={handleSaveNutritionPlan}
          />
        )}

        {currentTab === 'health' && (
          <EquineHealthSanityView
            animals={animals}
            healthRecords={health}
            examRecords={exams}
            onAddHealth={handleAddHealth}
            onAddExam={handleAddExam}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {currentTab === 'farriery' && (
          <EquineFarrieryView
            animals={animals}
            farrieryRecords={farriery}
            onAddFarriery={handleAddFarriery}
          />
        )}

        {currentTab === 'training' && (
          <EquineTrainingPerformanceView
            animals={animals}
            trainingRecords={trainings}
            competitionRecords={competitions}
            onAddTraining={handleAddTraining}
            onAddCompetition={handleAddCompetition}
          />
        )}

        {currentTab === 'dental' && (
          <EquineDentalView
            animals={animals}
            dentalRecords={dental}
            onAddDental={handleAddDental}
          />
        )}

        {currentTab === 'financial' && (
          <EquineFinancialView
            animals={animals}
            expenses={expenses}
            onAddExpense={handleAddExpense}
          />
        )}

        {currentTab === 'facilities_inventory' && (
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

        {currentTab === 'diseases_bank' && <EquineDiseasesBankView />}
      </main>

      {/* Official Digital Passport Modal */}
      {passportAnimal && (
        <EquineDigitalPassportModal
          animal={passportAnimal}
          healthRecords={health.filter(h => h.animalId === passportAnimal.id)}
          farrieryRecords={farriery.filter(f => f.animalId === passportAnimal.id)}
          biometricsRecords={biometrics.filter(b => b.animalId === passportAnimal.id)}
          onClose={() => setPassportAnimal(null)}
        />
      )}
    </div>
  );
};

export default EquineModule;
