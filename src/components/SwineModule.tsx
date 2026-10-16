// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  GitCommit,
  Users,
  Sparkles,
  Heart,
  Baby,
  Activity,
  Scale,
  Wheat,
  Droplets,
  Thermometer,
  ShieldCheck,
  BookOpen,
  ShieldAlert,
  Boxes,
  Camera,
  Award,
  FileText,
  Layers,
  Search,
  Plus,
  RefreshCw,
} from 'lucide-react';
import {
  SwineTab,
  SwineAnimal,
  SwineBatch,
  FarrowingLitter,
  SwineDiet,
  SwineWaterLog,
  SwineShedEnvironment,
  SwineBiosecurityCheck,
  SwineInventoryItem,
  SwineHealthRecord,
} from '../types/swine';
import { SuinoIcon } from './icons/SuinoIcon';
import {
  loadSwineAnimals,
  saveSwineAnimals,
  loadSwineBatches,
  saveSwineBatches,
  loadSwineLitters,
  saveSwineLitters,
  loadSwineDiets,
  saveSwineDiets,
  loadSwineWaterLogs,
  saveSwineWaterLogs,
  loadSwineSheds,
  saveSwineSheds,
  loadSwineBiosecurity,
  saveSwineBiosecurity,
  loadSwineInventory,
  saveSwineInventory,
  calculateSwineExecutiveKPIs,
  calculateSwineIES,
} from '../utils/swineStorage';

// Subcomponents
import { SwineDashboardView } from './swine/SwineDashboardView';
import { SwineProductionFlowView } from './swine/SwineProductionFlowView';
import { SwineIndividualRegistryView } from './swine/SwineIndividualRegistryView';
import { SwineDigitalTwinView } from './swine/SwineDigitalTwinView';
import { SwineReproductionView } from './swine/SwineReproductionView';
import { SwineFarrowingMaternityView } from './swine/SwineFarrowingMaternityView';
import { SwineNurseryView } from './swine/SwineNurseryView';
import { SwineGrowFinishView } from './swine/SwineGrowFinishView';
import { SwineNutritionView } from './swine/SwineNutritionView';
import { SwineWaterManagementView } from './swine/SwineWaterManagementView';
import { SwineEnvironmentView } from './swine/SwineEnvironmentView';
import { SwineHealthSanityView } from './swine/SwineHealthSanityView';
import { SwineDiseasesLibraryView } from './swine/SwineDiseasesLibraryView';
import { SwineBiosecurityView } from './swine/SwineBiosecurityView';
import { SwineInventoryView } from './swine/SwineInventoryView';
import { SwinePhotoDiaryView } from './swine/SwinePhotoDiaryView';
import { SwineIESScoreView } from './swine/SwineIESScoreView';
import { SwineReportsView } from './swine/SwineReportsView';
import { SwineGeaSuiteIntegrationView } from './swine/SwineGeaSuiteIntegrationView';

interface SwineModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (subTab: string) => void;
  onNavigateToTankMix?: () => void;
  onNavigateToPoultry?: () => void;
  onNavigateToBuffalo?: () => void;
}

export const SwineModule: React.FC<SwineModuleProps> = ({
  activeSubTab: propActiveSubTab = 'dashboard',
  setActiveSubTab: propSetActiveSubTab,
  onNavigateToTankMix,
  onNavigateToPoultry,
  onNavigateToBuffalo,
}) => {
  const [internalTab, setInternalTab] = useState<SwineTab>((propActiveSubTab as SwineTab) || 'dashboard');

  useEffect(() => {
    if (propActiveSubTab && propActiveSubTab !== internalTab) {
      setInternalTab(propActiveSubTab as SwineTab);
    }
  }, [propActiveSubTab]);

  const activeTab = (propActiveSubTab as SwineTab) || internalTab;

  const setActiveTab = (tab: SwineTab | string) => {
    setInternalTab(tab as SwineTab);
    if (propSetActiveSubTab) {
      propSetActiveSubTab(tab);
    }
  };

  // Core Data States
  const [animals, setAnimals] = useState<SwineAnimal[]>(loadSwineAnimals);
  const [batches, setBatches] = useState<SwineBatch[]>(loadSwineBatches);
  const [litters, setLitters] = useState<FarrowingLitter[]>(loadSwineLitters);
  const [diets, setDiets] = useState<SwineDiet[]>(loadSwineDiets);
  const [waterLogs, setWaterLogs] = useState<SwineWaterLog[]>(loadSwineWaterLogs);
  const [sheds, setSheds] = useState<SwineShedEnvironment[]>(loadSwineSheds);
  const [biosecurity, setBiosecurity] = useState<SwineBiosecurityCheck[]>(loadSwineBiosecurity);
  const [inventory, setInventory] = useState<SwineInventoryItem[]>(loadSwineInventory);

  // Selected animal for Digital Twin
  const [selectedAnimalForTwin, setSelectedAnimalForTwin] = useState<SwineAnimal | undefined>(animals[0]);

  // Persist handlers
  useEffect(() => {
    saveSwineAnimals(animals);
  }, [animals]);

  useEffect(() => {
    saveSwineBatches(batches);
  }, [batches]);

  useEffect(() => {
    saveSwineLitters(litters);
  }, [litters]);

  useEffect(() => {
    saveSwineDiets(diets);
  }, [diets]);

  useEffect(() => {
    saveSwineWaterLogs(waterLogs);
  }, [waterLogs]);

  useEffect(() => {
    saveSwineSheds(sheds);
  }, [sheds]);

  useEffect(() => {
    saveSwineBiosecurity(biosecurity);
  }, [biosecurity]);

  useEffect(() => {
    saveSwineInventory(inventory);
  }, [inventory]);

  // Dynamic Calculated Metrics
  const kpis = calculateSwineExecutiveKPIs(animals, batches, litters, inventory, sheds);
  const iesScore = calculateSwineIES(kpis, sheds, biosecurity);

  // Animal CRUD
  const handleAddAnimal = (animal: SwineAnimal) => {
    const updated = [animal, ...animals];
    setAnimals(updated);
    setSelectedAnimalForTwin(animal);
  };

  const handleUpdateAnimal = (updated: SwineAnimal) => {
    const updatedList = animals.map(a => (a.id === updated.id ? updated : a));
    setAnimals(updatedList);
    if (selectedAnimalForTwin?.id === updated.id) {
      setSelectedAnimalForTwin(updated);
    }
  };

  const handleDeleteAnimal = (id: string) => {
    const updated = animals.filter(a => a.id !== id);
    setAnimals(updated);
    if (selectedAnimalForTwin?.id === id) {
      setSelectedAnimalForTwin(updated[0]);
    }
  };

  const handleSelectAnimalForTwin = (animal: SwineAnimal) => {
    setSelectedAnimalForTwin(animal);
    setActiveTab('digital_twin');
  };

  // Batch CRUD
  const handleAddBatch = (batch: SwineBatch) => {
    setBatches([batch, ...batches]);
  };

  const handleUpdateBatch = (updated: SwineBatch) => {
    setBatches(batches.map(b => (b.id === updated.id ? updated : b)));
  };

  // Litter CRUD
  const handleAddLitter = (litter: FarrowingLitter) => {
    setLitters([litter, ...litters]);
  };

  const handleUpdateLitter = (updated: FarrowingLitter) => {
    setLitters(litters.map(l => (l.id === updated.id ? updated : l)));
  };

  // Diet CRUD
  const handleAddDiet = (diet: SwineDiet) => {
    setDiets([diet, ...diets]);
  };

  // Water CRUD
  const handleAddWaterLog = (log: SwineWaterLog) => {
    setWaterLogs([log, ...waterLogs]);
  };

  // Shed Reading CRUD
  const handleAddShedReading = (reading: SwineShedEnvironment) => {
    setSheds([reading, ...sheds]);
  };

  // Health To Animal
  const handleAddHealthRecordToAnimal = (animalId: string, record: SwineHealthRecord) => {
    const target = animals.find(a => a.id === animalId);
    if (!target) return;
    const updated = {
      ...target,
      healthHistory: [record, ...target.healthHistory],
    };
    handleUpdateAnimal(updated);
  };

  // Biosecurity CRUD
  const handleAddBiosecurityCheck = (check: SwineBiosecurityCheck) => {
    setBiosecurity([check, ...biosecurity]);
  };

  const handleUpdateBiosecurityCheck = (updated: SwineBiosecurityCheck) => {
    setBiosecurity(biosecurity.map(b => (b.id === updated.id ? updated : b)));
  };

  // Inventory CRUD
  const handleAddInventoryItem = (item: SwineInventoryItem) => {
    setInventory([item, ...inventory]);
  };

  const handleUpdateInventoryItem = (updated: SwineInventoryItem) => {
    setInventory(inventory.map(i => (i.id === updated.id ? updated : i)));
  };

  const navItems = [
    { id: 'dashboard' as SwineTab, label: 'Dashboard Executivo', icon: LayoutDashboard, group: 'Visão Geral' },
    { id: 'flow_pipeline' as SwineTab, label: 'Fluxo da Produção', icon: GitCommit, group: 'Visão Geral' },
    { id: 'animals' as SwineTab, label: 'Cadastro do Plantel', icon: Users, group: 'Rebanho' },
    { id: 'digital_twin' as SwineTab, label: 'Gêmeo Digital 360°', icon: Sparkles, group: 'Rebanho' },
    { id: 'reproduction' as SwineTab, label: 'Reprodução, IA & Gestação', icon: Heart, group: 'Fases Produtivas' },
    { id: 'maternity' as SwineTab, label: 'Maternidade & Partos', icon: Baby, group: 'Fases Produtivas' },
    { id: 'nursery' as SwineTab, label: 'Creche Climatizada', icon: Activity, group: 'Fases Produtivas' },
    { id: 'grow_finish' as SwineTab, label: 'Crescimento & Terminação', icon: Scale, group: 'Fases Produtivas' },
    { id: 'nutrition' as SwineTab, label: 'Nutrição & Fábrica de Ração', icon: Wheat, group: 'Recursos & Sanidade' },
    { id: 'water' as SwineTab, label: 'Gestão de Água & Vazão', icon: Droplets, group: 'Recursos & Sanidade' },
    { id: 'environment' as SwineTab, label: 'Ambiência & ITU', icon: Thermometer, group: 'Recursos & Sanidade' },
    { id: 'health' as SwineTab, label: 'Sanidade & Vacinômetro', icon: ShieldCheck, group: 'Recursos & Sanidade' },
    { id: 'diseases' as SwineTab, label: 'Guia de Enfermidades', icon: BookOpen, group: 'Recursos & Sanidade' },
    { id: 'biosecurity' as SwineTab, label: 'Biosseguridade & Barreiras', icon: ShieldAlert, group: 'Controle & Auditoria' },
    { id: 'inventory' as SwineTab, label: 'Almoxarifado & Insumos', icon: Boxes, group: 'Controle & Auditoria' },
    { id: 'photo_diary' as SwineTab, label: 'Diário Fotográfico', icon: Camera, group: 'Controle & Auditoria' },
    { id: 'ies_score' as SwineTab, label: 'Índice IES GeaAgro', icon: Award, group: 'Inteligência & Laudos' },
    { id: 'reports' as SwineTab, label: 'Relatórios & Pré-GTA', icon: FileText, group: 'Inteligência & Laudos' },
    { id: 'gea_suite' as SwineTab, label: 'Sinergias GeaAgro', icon: Layers, group: 'Inteligência & Laudos' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Module Title Banner */}
      <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-pink-600/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner border border-white/20 shrink-0">
              <SuinoIcon className="w-10 h-10 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold tracking-wide uppercase mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>GeaAgro Suinocultura de Precisão</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Módulo Técnico de Suinocultura
              </h1>
              <p className="text-xs sm:text-sm text-pink-100 font-medium max-w-2xl mt-0.5">
                Gestão zootécnica completa de plantel, reprodução, maternidade, creche, terminação, ambiência e Índice IES.
              </p>
            </div>
          </div>

          {/* Quick IES Badge */}
          <div
            onClick={() => setActiveTab('ies_score')}
            className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer hover:bg-white/25 transition-all shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-gray-900 flex items-center justify-center font-black">
              <Award className="w-5 h-5 text-amber-900" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-pink-100 font-bold block">
                Índice IES Geral
              </span>
              <div className="text-xl font-black text-white">{iesScore.totalScore} pts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation Scrollable Bar */}


      {/* Main Tab Render Container */}
      <main className="transition-all">
        {activeTab === 'dashboard' && (
          <SwineDashboardView
            kpis={kpis}
            iesScore={iesScore}
            animals={animals}
            batches={batches}
            litters={litters}
            sheds={sheds}
            inventory={inventory}
            biosecurity={biosecurity}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'flow_pipeline' && (
          <SwineProductionFlowView
            animals={animals}
            batches={batches}
            litters={litters}
            sheds={sheds}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'animals' && (
          <SwineIndividualRegistryView
            animals={animals}
            onAddAnimal={handleAddAnimal}
            onUpdateAnimal={handleUpdateAnimal}
            onDeleteAnimal={handleDeleteAnimal}
            onSelectAnimalForTwin={handleSelectAnimalForTwin}
          />
        )}

        {activeTab === 'digital_twin' && (
          <SwineDigitalTwinView
            animals={animals}
            selectedAnimal={selectedAnimalForTwin}
            onSelectAnimal={setSelectedAnimalForTwin}
            onUpdateAnimal={handleUpdateAnimal}
          />
        )}

        {activeTab === 'reproduction' && (
          <SwineReproductionView
            animals={animals}
            onUpdateAnimal={handleUpdateAnimal}
          />
        )}

        {activeTab === 'maternity' && (
          <SwineFarrowingMaternityView
            litters={litters}
            onAddLitter={handleAddLitter}
            onUpdateLitter={handleUpdateLitter}
            animals={animals}
          />
        )}

        {activeTab === 'nursery' && (
          <SwineNurseryView
            batches={batches}
            onAddBatch={handleAddBatch}
            onUpdateBatch={handleUpdateBatch}
          />
        )}

        {activeTab === 'grow_finish' && (
          <SwineGrowFinishView
            batches={batches}
            onAddBatch={handleAddBatch}
            onUpdateBatch={handleUpdateBatch}
          />
        )}

        {activeTab === 'nutrition' && (
          <SwineNutritionView
            diets={diets}
            onAddDiet={handleAddDiet}
          />
        )}

        {activeTab === 'water' && (
          <SwineWaterManagementView
            waterLogs={waterLogs}
            onAddWaterLog={handleAddWaterLog}
          />
        )}

        {activeTab === 'environment' && (
          <SwineEnvironmentView
            sheds={sheds}
            onAddShedReading={handleAddShedReading}
          />
        )}

        {activeTab === 'health' && (
          <SwineHealthSanityView
            animals={animals}
            onAddHealthRecordToAnimal={handleAddHealthRecordToAnimal}
          />
        )}

        {activeTab === 'diseases' && (
          <SwineDiseasesLibraryView />
        )}

        {activeTab === 'biosecurity' && (
          <SwineBiosecurityView
            checks={biosecurity}
            onAddCheck={handleAddBiosecurityCheck}
            onUpdateCheck={handleUpdateBiosecurityCheck}
          />
        )}

        {activeTab === 'inventory' && (
          <SwineInventoryView
            items={inventory}
            onAddItem={handleAddInventoryItem}
            onUpdateItem={handleUpdateInventoryItem}
          />
        )}

        {activeTab === 'photo_diary' && (
          <SwinePhotoDiaryView
            animals={animals}
          />
        )}

        {activeTab === 'ies_score' && (
          <SwineIESScoreView
            iesScore={iesScore}
          />
        )}

        {activeTab === 'reports' && (
          <SwineReportsView
            animals={animals}
            batches={batches}
            litters={litters}
            iesScore={iesScore}
          />
        )}

        {activeTab === 'gea_suite' && (
          <SwineGeaSuiteIntegrationView
            onNavigateToTankMix={onNavigateToTankMix}
            onNavigateToPoultry={onNavigateToPoultry}
            onNavigateToBuffalo={onNavigateToBuffalo}
          />
        )}
      </main>
    </div>
  );
};
