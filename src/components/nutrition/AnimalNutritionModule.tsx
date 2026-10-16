// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  AnimalProfile,
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
  Printer,
  HelpCircle,
} from 'lucide-react';

export type NutritionSubTab =
  | 'dashboard'
  | 'animais'
  | 'alimentos'
  | 'formulador'
  | 'custos'
  | 'cenarios'
  | 'forragens'
  | 'gemeo_digital';

interface AnimalNutritionModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: string) => void;
}

export const AnimalNutritionModule: React.FC<AnimalNutritionModuleProps> = ({
  activeSubTab: externalActiveSubTab,
  setActiveSubTab: externalSetActiveSubTab,
}) => {
  const [internalActiveSubTab, setInternalActiveSubTab] = useState<NutritionSubTab>('dashboard');

  const activeSubTab = (externalActiveSubTab as NutritionSubTab) || internalActiveSubTab;
  const setActiveSubTab = (tab: string | NutritionSubTab) => {
    if (externalSetActiveSubTab) {
      externalSetActiveSubTab(tab);
    } else {
      setInternalActiveSubTab(tab as NutritionSubTab);
    }
  };

  // Persistence State
  const [animalProfiles, setAnimalProfiles] = useState<AnimalProfile[]>(() => {
    try {
      const saved = localStorage.getItem('gea_nutrition_animal_profiles');
      const parsed = saved ? JSON.parse(saved) : DEFAULT_ANIMAL_PROFILES;
      return Array.isArray(parsed) ? parsed.filter(p => p && typeof p === 'object' && p.id) : DEFAULT_ANIMAL_PROFILES;
    } catch {
      return DEFAULT_ANIMAL_PROFILES;
    }
  });

  const [ingredients, setIngredients] = useState<FeedIngredient[]>(() => {
    try {
      const saved = localStorage.getItem('gea_nutrition_ingredients');
      const parsed = saved ? JSON.parse(saved) : NATIONAL_FEED_DATABASE;
      return Array.isArray(parsed) ? parsed.filter(i => i && typeof i === 'object' && i.id) : NATIONAL_FEED_DATABASE;
    } catch {
      return NATIONAL_FEED_DATABASE;
    }
  });

  const [formulations, setFormulations] = useState<DietFormulation[]>(() => {
    try {
      const saved = localStorage.getItem('gea_nutrition_formulations');
      const parsed = saved ? JSON.parse(saved) : DEFAULT_DIET_FORMULATIONS;
      return Array.isArray(parsed) ? parsed.filter(d => d && typeof d === 'object' && d.id) : DEFAULT_DIET_FORMULATIONS;
    } catch {
      return DEFAULT_DIET_FORMULATIONS;
    }
  });

  const [foragePlans, setForagePlans] = useState<ForageProductionPlan[]>(() => {
    try {
      const saved = localStorage.getItem('gea_nutrition_forage_plans');
      const parsed = saved ? JSON.parse(saved) : DEFAULT_FORAGE_PLANS;
      return Array.isArray(parsed) ? parsed.filter(p => p && typeof p === 'object' && p.id) : DEFAULT_FORAGE_PLANS;
    } catch {
      return DEFAULT_FORAGE_PLANS;
    }
  });

  const [activeFormulationId, setActiveFormulationId] = useState<string>(
    DEFAULT_DIET_FORMULATIONS[0]?.id || ''
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

  // Current active diet for studio / digital twin
  const currentFormulation =
    (formulations || []).find((f) => f?.id === activeFormulationId) || formulations?.[0] || null;

  // Handlers for Animal Profiles
  const handleSaveProfile = (profile: AnimalProfile) => {
    if (!profile || !profile.id) return;
    setAnimalProfiles((prev) => {
      const idx = prev.findIndex((p) => p?.id === profile.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = profile;
        return next;
      }
      return [profile, ...prev];
    });
  };

  const handleDeleteProfile = (id: string) => {
    setAnimalProfiles((prev) => prev.filter((p) => p?.id !== id));
  };

  // Handlers for Ingredients
  const handleSaveIngredient = (ing: FeedIngredient) => {
    if (!ing || !ing.id) return;
    setIngredients((prev) => {
      const idx = prev.findIndex((i) => i?.id === ing.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = ing;
        return next;
      }
      return [ing, ...prev];
    });
  };

  const handleDeleteIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((i) => i?.id !== id));
  };

  // Handlers for Formulations
  const handleSaveFormulation = (diet: DietFormulation) => {
    if (!diet || !diet.id) return;
    setFormulations((prev) => {
      const idx = prev.findIndex((d) => d?.id === diet.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = diet;
        return next;
      }
      return [diet, ...prev];
    });
    setActiveFormulationId(diet.id);
  };

  // Handlers for Forage Plans
  const handleSaveForagePlan = (plan: ForageProductionPlan) => {
    if (!plan || !plan.id) return;
    setForagePlans((prev) => {
      const idx = prev.findIndex((p) => p?.id === plan.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = plan;
        return next;
      }
      return [plan, ...prev];
    });
  };

  const handleDeleteForagePlan = (id: string) => {
    setForagePlans((prev) => prev.filter((p) => p?.id !== id));
  };

  // Handlers for Digital Twin
  const handleAddValidation = (dietId: string, validation: DigitalTwinValidation) => {
    setFormulations((prev) =>
      prev.map((d) => {
        if (d.id === dietId) {
          return {
            ...d,
            digitalTwin: [validation, ...(d.digitalTwin || [])],
          };
        }
        return d;
      })
    );
  };

  return (
    <div id="animal-nutrition-master-module" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Module Title & Quick Summary Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Módulo Técnico Zootécnico &bull; 100% Offline
            </span>
            <span className="text-xs text-slate-400">NRC 2001 & BR-CORTE 2016</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            Nutrição Animal & Formulação de Dietas
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Otimização linear de menor custo, balanço de aminoácidos/minerais, previsão de desempenho e índice IGEN
          </p>
        </div>

        {/* Quick Top Controls */}
        <div className="flex items-center gap-2">
          {currentFormulation && (
            <button
              onClick={() => setReportModalDiet(currentFormulation)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              Imprimir Batelada
            </button>
          )}
        </div>
      </div>

      {/* Sub-Views Content */}
      <div className="mt-4">
        {activeSubTab === 'dashboard' && (
          <NutritionDashboard
            formulations={formulations}
            animalProfiles={animalProfiles}
            ingredients={ingredients}
            foragePlans={foragePlans}
            onSelectDiet={(dietId) => {
              setActiveFormulationId(dietId);
              setActiveSubTab('formulador');
            }}
            onNavigateTab={(tab) => setActiveSubTab(tab as NutritionSubTab)}
          />
        )}

        {activeSubTab === 'formulador' && (
          <FormulationStudio
            formulation={currentFormulation}
            animalProfiles={animalProfiles}
            ingredients={ingredients}
            onSaveFormulation={handleSaveFormulation}
            onOpenReport={(diet) => setReportModalDiet(diet)}
          />
        )}

        {activeSubTab === 'animais' && (
          <AnimalProfilesView
            profiles={animalProfiles}
            onSaveProfile={handleSaveProfile}
            onDeleteProfile={handleDeleteProfile}
            onStartFormulation={(profile) => {
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
          <CostAnalysisView formulations={formulations} ingredients={ingredients} />
        )}

        {activeSubTab === 'cenarios' && (
          <ScenarioSimulatorView
            formulations={formulations}
            ingredients={ingredients}
            onApplyScenario={(diet) => {
              handleSaveFormulation(diet);
              setActiveSubTab('formulador');
            }}
          />
        )}

        {activeSubTab === 'forragens' && (
          <ForagePlanningView
            foragePlans={foragePlans}
            onSavePlan={handleSaveForagePlan}
            onDeletePlan={handleDeleteForagePlan}
          />
        )}

        {activeSubTab === 'gemeo_digital' && currentFormulation && (
          <DigitalTwinView
            formulation={currentFormulation}
            onAddValidation={handleAddValidation}
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
