import React, { useState, useEffect, useMemo } from 'react';
import {
  AnimalProfile,
  AnimalSpecies,
  FeedIngredient,
  DietFormulation,
  ForageProductionPlan,
  DigitalTwinValidation,
} from '../../types/animalNutrition';
import {
  DEFAULT_ANIMAL_PROFILES,
  DEFAULT_DIET_FORMULATIONS,
  DEFAULT_FORAGE_PLANS,
} from '../../data/defaultAnimalNutritionData';
import { NATIONAL_FEED_DATABASE } from '../../data/nationalFeedDatabase';
import { NutritionDashboard } from './NutritionDashboard';
import { AnimalProfilesView } from './AnimalProfilesView';
import { IngredientDatabaseView } from './IngredientDatabaseView';
import { FormulationStudio } from './FormulationStudio';
import { CostAnalysisView } from './CostAnalysisView';
import { ScenarioSimulatorView } from './ScenarioSimulatorView';
import { ForagePlanningView } from './ForagePlanningView';
import { DigitalTwinView } from './DigitalTwinView';
import { DietReportModal } from './DietReportModal';
import {
  Activity,
  Calculator,
  DollarSign,
  GitCompare,
  LayoutGrid,
  Package,
  Printer,
  Users,
  Wheat,
} from 'lucide-react';

export type NutritionSubTab =
  | 'dashboard'
  | 'formulador'
  | 'animais'
  | 'alimentos'
  | 'custos'
  | 'cenarios'
  | 'forragens'
  | 'gemeo_digital';

interface AnimalNutritionModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: string) => void;
}

const SUBTAB_ALIAS_MAP: Record<string, NutritionSubTab> = {
  dashboard: 'dashboard',
  formulador: 'formulador',
  formulacao: 'formulador',
  formulation: 'formulador',
  laudo: 'formulador',
  animais: 'animais',
  alimentos: 'alimentos',
  ingredientes: 'alimentos',
  ingredients: 'alimentos',
  premistura: 'alimentos',
  custos: 'custos',
  cenarios: 'cenarios',
  dietas: 'cenarios',
  forragens: 'forragens',
  forage: 'forragens',
  gemeo_digital: 'gemeo_digital',
};

const NAV_TABS: Array<{ id: NutritionSubTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'dashboard', label: 'Visão Geral', icon: LayoutGrid },
  { id: 'formulador', label: 'Formulador', icon: Calculator },
  { id: 'animais', label: 'Lotes & Perfis', icon: Users },
  { id: 'alimentos', label: 'Ingredientes', icon: Package },
  { id: 'custos', label: 'Custos & IOFC', icon: DollarSign },
  { id: 'cenarios', label: 'Cenários', icon: GitCompare },
  { id: 'forragens', label: 'Forragens', icon: Wheat },
  { id: 'gemeo_digital', label: 'Gêmeo Digital', icon: Activity },
];

export const AnimalNutritionModule: React.FC<AnimalNutritionModuleProps> = ({
  activeSubTab: externalActiveSubTab,
  setActiveSubTab: externalSetActiveSubTab,
}) => {
  const [internalActiveSubTab, setInternalActiveSubTab] = useState<NutritionSubTab>('dashboard');
  const [selectedSpecies, setSelectedSpecies] = useState<AnimalSpecies | 'todas'>('todas');
  const [pendingProfileForDiet, setPendingProfileForDiet] = useState<AnimalProfile | null>(null);

  const activeSubTab: NutritionSubTab = useMemo(() => {
    if (externalActiveSubTab && SUBTAB_ALIAS_MAP[externalActiveSubTab]) {
      return SUBTAB_ALIAS_MAP[externalActiveSubTab];
    }
    return internalActiveSubTab;
  }, [externalActiveSubTab, internalActiveSubTab]);

  const setActiveSubTab = (tab: string) => {
    const normalized = SUBTAB_ALIAS_MAP[tab] || 'dashboard';
    setInternalActiveSubTab(normalized);
    if (externalSetActiveSubTab) {
      externalSetActiveSubTab(normalized);
    }
  };

  // Persistence State
  const [animalProfiles, setAnimalProfiles] = useState<AnimalProfile[]>(() => {
    try {
      const saved = localStorage.getItem('gea_nutrition_animal_profiles');
      const parsed = saved ? JSON.parse(saved) : DEFAULT_ANIMAL_PROFILES;
      return Array.isArray(parsed)
        ? parsed.filter((p): p is AnimalProfile => Boolean(p && typeof p === 'object' && p.id))
        : DEFAULT_ANIMAL_PROFILES;
    } catch {
      return DEFAULT_ANIMAL_PROFILES;
    }
  });

  const [ingredients, setIngredients] = useState<FeedIngredient[]>(() => {
    try {
      const saved = localStorage.getItem('gea_nutrition_ingredients');
      const parsed = saved ? JSON.parse(saved) : NATIONAL_FEED_DATABASE;
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed.filter((i): i is FeedIngredient => Boolean(i && typeof i === 'object' && i.id))
        : NATIONAL_FEED_DATABASE;
    } catch {
      return NATIONAL_FEED_DATABASE;
    }
  });

  const [formulations, setFormulations] = useState<DietFormulation[]>(() => {
    try {
      const saved = localStorage.getItem('gea_nutrition_formulations');
      const parsed = saved ? JSON.parse(saved) : DEFAULT_DIET_FORMULATIONS;
      return Array.isArray(parsed)
        ? parsed.filter((d): d is DietFormulation => Boolean(d && typeof d === 'object' && d.id))
        : DEFAULT_DIET_FORMULATIONS;
    } catch {
      return DEFAULT_DIET_FORMULATIONS;
    }
  });

  const [foragePlans, setForagePlans] = useState<ForageProductionPlan[]>(() => {
    try {
      const saved = localStorage.getItem('gea_nutrition_forage_plans');
      const parsed = saved ? JSON.parse(saved) : DEFAULT_FORAGE_PLANS;
      return Array.isArray(parsed)
        ? parsed.filter((p): p is ForageProductionPlan => Boolean(p && typeof p === 'object' && p.id))
        : DEFAULT_FORAGE_PLANS;
    } catch {
      return DEFAULT_FORAGE_PLANS;
    }
  });

  const [activeFormulationId, setActiveFormulationId] = useState<string>(
    () => formulations[0]?.id || ''
  );

  const [reportModalDiet, setReportModalDiet] = useState<DietFormulation | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('gea_nutrition_animal_profiles', JSON.stringify(animalProfiles));
  }, [animalProfiles]);

  useEffect(() => {
    localStorage.setItem('gea_nutrition_ingredients', JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem('gea_nutrition_formulations', JSON.stringify(formulations));
  }, [formulations]);

  useEffect(() => {
    localStorage.setItem('gea_nutrition_forage_plans', JSON.stringify(foragePlans));
  }, [foragePlans]);

  const currentFormulation =
    formulations.find((f) => f.id === activeFormulationId) || formulations[0] || null;

  const handleSaveProfile = (profile: AnimalProfile) => {
    if (!profile?.id) return;
    setAnimalProfiles((prev) => {
      const idx = prev.findIndex((p) => p.id === profile.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = profile;
        return next;
      }
      return [profile, ...prev];
    });
  };

  const handleDeleteProfile = (id: string) => {
    setAnimalProfiles((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSaveIngredient = (ing: FeedIngredient) => {
    if (!ing?.id) return;
    setIngredients((prev) => {
      const idx = prev.findIndex((i) => i.id === ing.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = ing;
        return next;
      }
      return [ing, ...prev];
    });
  };

  const handleDeleteIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSaveFormulation = (diet: DietFormulation) => {
    if (!diet?.id) return;
    setFormulations((prev) => {
      const idx = prev.findIndex((d) => d.id === diet.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = diet;
        return next;
      }
      return [diet, ...prev];
    });
    setActiveFormulationId(diet.id);
    setPendingProfileForDiet(null);
  };

  const handleSaveForagePlan = (plan: ForageProductionPlan) => {
    if (!plan?.id) return;
    setForagePlans((prev) => {
      const idx = prev.findIndex((p) => p.id === plan.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = plan;
        return next;
      }
      return [plan, ...prev];
    });
  };

  const handleDeleteForagePlan = (id: string) => {
    setForagePlans((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddValidation = (dietId: string, validation: DigitalTwinValidation) => {
    setFormulations((prev) =>
      prev.map((d) =>
        d.id === dietId
          ? { ...d, digitalTwin: [validation, ...(d.digitalTwin || [])] }
          : d
      )
    );
  };

  return (
    <div id="animal-nutrition-master-module" className="p-3 sm:p-5 max-w-7xl mx-auto space-y-4">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Nutrição Animal & Formulação de Dietas
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Otimização linear de menor custo, balanço bromatológico NRC 2001 / BR-CORTE, margem IOFC e índice IGEN
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {currentFormulation && (
            <button
              type="button"
              onClick={() => setReportModalDiet(currentFormulation)}
              className="h-8 px-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-md inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Imprimir Batelada
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Sub-Navigation Strip */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2">
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`h-8 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sub-Views Content */}
      <div>
        {activeSubTab === 'dashboard' && (
          <NutritionDashboard
            formulations={formulations}
            animalProfiles={animalProfiles}
            ingredients={ingredients}
            foragePlans={foragePlans}
            selectedSpecies={selectedSpecies}
            onSelectSpecies={setSelectedSpecies}
            onSelectDiet={(dietId) => {
              setActiveFormulationId(dietId);
              setPendingProfileForDiet(null);
              setActiveSubTab('formulador');
            }}
            onNavigateTab={(tab) => setActiveSubTab(tab)}
          />
        )}

        {activeSubTab === 'formulador' && (
          <FormulationStudio
            formulation={currentFormulation}
            formulations={formulations}
            initialProfile={pendingProfileForDiet}
            animalProfiles={animalProfiles}
            ingredients={ingredients}
            onSelectFormulation={(dietId) => {
              setActiveFormulationId(dietId);
              setPendingProfileForDiet(null);
            }}
            onSaveFormulation={handleSaveFormulation}
            onOpenReport={(diet) => setReportModalDiet(diet)}
          />
        )}

        {activeSubTab === 'animais' && (
          <AnimalProfilesView
            profiles={animalProfiles}
            onSaveProfile={handleSaveProfile}
            onDeleteProfile={handleDeleteProfile}
            onFormulateForProfile={(profile) => {
              setPendingProfileForDiet(profile);
              setActiveSubTab('formulador');
            }}
          />
        )}

        {activeSubTab === 'alimentos' && (
          <IngredientDatabaseView
            ingredients={ingredients}
            onSaveIngredient={handleSaveIngredient}
            onDeleteIngredient={handleDeleteIngredient}
          />
        )}

        {activeSubTab === 'custos' && (
          <CostAnalysisView
            formulations={formulations}
            ingredients={ingredients}
            onNavigateFormulator={() => setActiveSubTab('formulador')}
          />
        )}

        {activeSubTab === 'cenarios' && (
          <ScenarioSimulatorView
            formulations={formulations}
            onApplyScenario={(diet) => {
              handleSaveFormulation(diet);
              setActiveSubTab('formulador');
            }}
            onNavigateFormulator={() => setActiveSubTab('formulador')}
          />
        )}

        {activeSubTab === 'forragens' && (
          <ForagePlanningView
            foragePlans={foragePlans}
            onSavePlan={handleSaveForagePlan}
            onDeletePlan={handleDeleteForagePlan}
          />
        )}

        {activeSubTab === 'gemeo_digital' && (
          <DigitalTwinView
            formulation={currentFormulation}
            formulations={formulations}
            onSelectFormulation={(dietId) => setActiveFormulationId(dietId)}
            onAddValidation={handleAddValidation}
            onNavigateFormulator={() => setActiveSubTab('formulador')}
          />
        )}
      </div>

      {/* Report & Mixer Batch Loading Sheet Modal */}
      {reportModalDiet && (
        <DietReportModal
          diet={reportModalDiet}
          ingredients={ingredients}
          onClose={() => setReportModalDiet(null)}
        />
      )}
    </div>
  );
};
