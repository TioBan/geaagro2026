import React, { useState, useEffect } from 'react';
import {
  BuffaloTab,
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
  saveBuffaloFacilities
} from '../utils/buffaloStorage';

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

import {
  LayoutDashboard,
  ShieldCheck,
  Activity,
  Dna,
  HeartPulse,
  Baby,
  Milk,
  Beef,
  Droplets,
  Wheat,
  Sprout,
  Syringe,
  BookOpen,
  Pill,
  Building2,
  Compass,
  FileText,
  Camera
} from 'lucide-react';

export type { BuffaloTab };

interface BuffaloModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (subTab: string) => void;
}

const VALID_TABS: BuffaloTab[] = [
  'dashboard',
  'registry',
  'digital_twin',
  'genealogy',
  'reproduction',
  'calves',
  'dairy',
  'beef',
  'welfare_water',
  'nutrition',
  'pastures',
  'health',
  'diseases_lib',
  'pharmacy',
  'facilities',
  'smart_map',
  'reports',
  'photo_diary'
];

const SUB_NAV_TABS: { id: BuffaloTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Painel & IEB', icon: LayoutDashboard },
  { id: 'registry', label: 'Cadastro', icon: ShieldCheck },
  { id: 'digital_twin', label: 'Gêmeo 360°', icon: Activity },
  { id: 'genealogy', label: 'Genealogia', icon: Dna },
  { id: 'reproduction', label: 'Reprodução', icon: HeartPulse },
  { id: 'calves', label: 'Bezerreiro', icon: Baby },
  { id: 'dairy', label: 'Leite & Mozzarella', icon: Milk },
  { id: 'beef', label: 'Carne & GMD', icon: Beef },
  { id: 'welfare_water', label: 'Bem-Estar & Água', icon: Droplets },
  { id: 'nutrition', label: 'Nutrição', icon: Wheat },
  { id: 'pastures', label: 'Pastagens', icon: Sprout },
  { id: 'health', label: 'Sanidade', icon: Syringe },
  { id: 'diseases_lib', label: 'Atlas Doenças', icon: BookOpen },
  { id: 'pharmacy', label: 'Farmácia', icon: Pill },
  { id: 'facilities', label: 'Instalações', icon: Building2 },
  { id: 'smart_map', label: 'Mapa', icon: Compass },
  { id: 'reports', label: 'Relatórios', icon: FileText },
  { id: 'photo_diary', label: 'Diário Visual', icon: Camera }
];

function resolveTab(raw?: string): BuffaloTab {
  if (raw && VALID_TABS.includes(raw as BuffaloTab)) {
    return raw as BuffaloTab;
  }
  return 'dashboard';
}

export const BuffaloModule: React.FC<BuffaloModuleProps> = ({
  activeSubTab,
  setActiveSubTab
}) => {
  const [internalTab, setInternalTab] = useState<BuffaloTab>(() => resolveTab(activeSubTab));
  const [animals, setAnimals] = useState<BuffaloAnimal[]>(() => loadBuffaloAnimals());
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(() => loadBuffaloAnimals()[0]?.id || '');

  const [paddocks, setPaddocks] = useState<BuffaloPaddock[]>(() => loadBuffaloPaddocks());
  const [waterPoints, setWaterPoints] = useState<BuffaloWaterPoint[]>(() => loadBuffaloWaterPoints());
  const [thermalWelfare, setThermalWelfare] = useState<BuffaloThermalWelfareIndex>(() => loadBuffaloThermalWelfare());
  const [pharmacy, setPharmacy] = useState<BuffaloPharmacyItem[]>(() => loadBuffaloPharmacy());
  const [facilities, setFacilities] = useState<BuffaloFacility[]>(() => loadBuffaloFacilities());

  useEffect(() => {
    if (activeSubTab) {
      const next = resolveTab(activeSubTab);
      if (next !== internalTab) {
        setInternalTab(next);
      }
    }
  }, [activeSubTab, internalTab]);

  const activeTab: BuffaloTab = activeSubTab ? resolveTab(activeSubTab) : internalTab;

  const handleTabChange = (tab: string) => {
    const resolved = resolveTab(tab);
    setInternalTab(resolved);
    if (setActiveSubTab) {
      setActiveSubTab(resolved);
    }
  };

  useEffect(() => {
    saveBuffaloAnimals(animals);
    if (!selectedAnimalId && animals.length > 0) {
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

  const handleAddAnimal = (newAnimal: BuffaloAnimal) => {
    setAnimals(prev => [newAnimal, ...prev]);
    if (!selectedAnimalId) {
      setSelectedAnimalId(newAnimal.id);
    }
  };

  const handleUpdateAnimal = (updated: BuffaloAnimal) => {
    setAnimals(prev => {
      const idx = prev.findIndex(a => a.id === updated.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [updated, ...prev];
    });
  };

  const handleDeleteAnimal = (animalId: string) => {
    setAnimals(prev => {
      const remaining = prev.filter(a => a.id !== animalId);
      if (selectedAnimalId === animalId) {
        setSelectedAnimalId(remaining[0]?.id || '');
      }
      return remaining;
    });
  };

  const handleOpenDigitalTwin = (animalId: string) => {
    setSelectedAnimalId(animalId);
    handleTabChange('digital_twin');
  };

  const handleSavePaddock = (paddock: BuffaloPaddock) => {
    setPaddocks(prev => {
      const idx = prev.findIndex(p => p.id === paddock.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = paddock;
        return next;
      }
      return [paddock, ...prev];
    });
  };

  const handleDeletePaddock = (paddockId: string) => {
    setPaddocks(prev => prev.filter(p => p.id !== paddockId));
  };

  const handleAddWaterPoint = (point: BuffaloWaterPoint) => {
    setWaterPoints(prev => [point, ...prev]);
  };

  const handleDeleteWaterPoint = (pointId: string) => {
    setWaterPoints(prev => prev.filter(p => p.id !== pointId));
  };

  const handleSaveFacility = (facility: BuffaloFacility) => {
    setFacilities(prev => {
      const idx = prev.findIndex(f => f.id === facility.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = facility;
        return next;
      }
      return [facility, ...prev];
    });
  };

  const handleDeleteFacility = (facilityId: string) => {
    setFacilities(prev => prev.filter(f => f.id !== facilityId));
  };

  const lactatingCount = animals.filter(a => a.status === 'Em Lactação').length;

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* Cabeçalho compacto do módulo */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-zinc-800 print:hidden">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Bubalinocultura de Precisão
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Gestão zootécnica, reprodutiva, leiteira (Mozzarella), corte, sanidade e conforto térmico hídrico
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 tabular-nums shrink-0">
            <span>
              <strong className="font-semibold text-slate-800 dark:text-zinc-200">{animals.length}</strong> animais
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <strong className="font-semibold text-slate-800 dark:text-zinc-200">{lactatingCount}</strong> lactação
            </span>
            <span aria-hidden="true">·</span>
            <span>
              ITU <strong className="font-semibold text-slate-800 dark:text-zinc-200">{thermalWelfare.thiCalculated}</strong>
            </span>
          </div>
        </header>

        {/* Sub-navegação horizontal compacta */}
        <nav
          aria-label="Submódulos de Bubalinocultura"
          className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200 dark:border-zinc-800 no-scrollbar print:hidden"
        >
          {SUB_NAV_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/70 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Conteúdo da aba ativa */}
        <main>
          {activeTab === 'dashboard' && (
            <BuffaloDashboardView
              animals={animals}
              paddocks={paddocks}
              waterPoints={waterPoints}
              thermalWelfare={thermalWelfare}
              onSelectAnimalForTwin={handleOpenDigitalTwin}
              onNavigateTab={handleTabChange}
            />
          )}

          {activeTab === 'registry' && (
            <BuffaloIndividualRegistryView
              animals={animals}
              onAddAnimal={handleAddAnimal}
              onUpdateAnimal={handleUpdateAnimal}
              onDeleteAnimal={handleDeleteAnimal}
              onOpenDigitalTwin={handleOpenDigitalTwin}
            />
          )}

          {activeTab === 'digital_twin' && (
            <BuffaloDigitalTwinView
              animals={animals}
              selectedAnimalId={selectedAnimalId}
              onSelectAnimal={setSelectedAnimalId}
              onBackToRegistry={() => handleTabChange('registry')}
              onUpdateAnimal={handleUpdateAnimal}
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
              onUpdateAnimal={handleUpdateAnimal}
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
              onAddWaterPoint={handleAddWaterPoint}
              onDeleteWaterPoint={handleDeleteWaterPoint}
            />
          )}

          {activeTab === 'nutrition' && (
            <BuffaloNutritionView animals={animals} />
          )}

          {activeTab === 'pastures' && (
            <BuffaloPasturesView
              paddocks={paddocks}
              onSavePaddock={handleSavePaddock}
              onDeletePaddock={handleDeletePaddock}
            />
          )}

          {activeTab === 'health' && (
            <BuffaloHealthVaccinesView
              animals={animals}
              onUpdateAnimal={handleUpdateAnimal}
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
            <BuffaloFacilitiesView
              facilities={facilities}
              onSaveFacility={handleSaveFacility}
              onDeleteFacility={handleDeleteFacility}
            />
          )}

          {activeTab === 'smart_map' && (
            <BuffaloSmartMapView
              paddocks={paddocks}
              waterPoints={waterPoints}
              animals={animals}
              onOpenDigitalTwin={handleOpenDigitalTwin}
              onNavigateTab={handleTabChange}
            />
          )}

          {activeTab === 'reports' && (
            <BuffaloReportsView animals={animals} paddocks={paddocks} />
          )}

          {activeTab === 'photo_diary' && (
            <BuffaloPhotoDiaryView
              animals={animals}
              onUpdateAnimal={handleUpdateAnimal}
              onOpenDigitalTwin={handleOpenDigitalTwin}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default BuffaloModule;
