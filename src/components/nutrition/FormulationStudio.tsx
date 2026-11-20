import React, { useState, useEffect, useMemo } from 'react';
import {
  DietFormulation,
  DietFormulationItem,
  FeedIngredient,
  AnimalProfile,
  AnimalSpecies,
  NutritionalRequirement,
} from '../../types/animalNutrition';
import {
  calculateAnimalRequirements,
  calculateDietBromatology,
  evaluateMetabolicHealth,
  calculateIgenScore,
  calculateDietCosts,
} from '../../utils/nutritionRequirements';
import { solveLeastCostDiet } from '../../utils/simplexSolver';
import {
  getIngredientCategoryLabel,
  getSpeciesLabel,
  INGREDIENT_CATEGORIES,
  SPECIES_OPTIONS,
} from './nutritionConstants';
import {
  Sparkles,
  Save,
  Printer,
  Trash2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Scale,
  Plus,
  X,
  Check,
} from 'lucide-react';

interface Props {
  formulation: DietFormulation | null;
  formulations: DietFormulation[];
  initialProfile?: AnimalProfile | null;
  animalProfiles: AnimalProfile[];
  ingredients: FeedIngredient[];
  onSelectFormulation: (dietId: string) => void;
  onSaveFormulation: (diet: DietFormulation) => void;
  onOpenReport: (diet: DietFormulation) => void;
}

export const FormulationStudio: React.FC<Props> = ({
  formulation,
  formulations,
  initialProfile,
  animalProfiles,
  ingredients,
  onSelectFormulation,
  onSaveFormulation,
  onOpenReport,
}) => {
  const ingredientsMap = useMemo(() => {
    const map = new Map<string, FeedIngredient>();
    ingredients.forEach((i) => map.set(i.id, i));
    return map;
  }, [ingredients]);

  const [dietId, setDietId] = useState<string>(formulation ? formulation.id : `diet_${Date.now()}`);
  const [name, setName] = useState<string>(formulation ? formulation.name : 'Nova Dieta Balanceada');
  const [selectedSpecies, setSelectedSpecies] = useState<AnimalSpecies>(
    formulation ? formulation.species : initialProfile?.species || 'bovinos_leite'
  );
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    formulation?.animalProfileId || initialProfile?.id || animalProfiles[0]?.id || ''
  );
  const [animalCount, setAnimalCount] = useState<number>(
    formulation ? formulation.animalCount : initialProfile?.count || 50
  );
  const [targetBatchKg, setTargetBatchKg] = useState<number>(formulation ? formulation.targetBatchKg : 3000);
  const [targetDmiKg, setTargetDmiKg] = useState<number>(
    formulation ? formulation.totalDmiKgPerAnimal : initialProfile?.targetDmiKgDay || 22.0
  );
  const [notes, setNotes] = useState<string>(formulation?.notes || '');
  const [items, setItems] = useState<DietFormulationItem[]>(formulation ? formulation.items : []);
  const [optimizerStatus, setOptimizerStatus] = useState<string | null>(null);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [selectedIngredientToAdd, setSelectedIngredientToAdd] = useState<string>('');

  // Sync when external formulation selection changes
  useEffect(() => {
    if (formulation) {
      setDietId(formulation.id);
      setName(formulation.name);
      setSelectedSpecies(formulation.species);
      setSelectedProfileId(formulation.animalProfileId || '');
      setAnimalCount(formulation.animalCount);
      setTargetBatchKg(formulation.targetBatchKg);
      setTargetDmiKg(formulation.totalDmiKgPerAnimal);
      setNotes(formulation.notes || '');
      setItems(formulation.items || []);
      setOptimizerStatus(null);
    }
  }, [formulation]);

  // Apply pre-selected animal profile when launched from AnimalProfilesView
  useEffect(() => {
    if (initialProfile) {
      setDietId(`diet_${Date.now()}`);
      setName(`Dieta · ${initialProfile.name}`);
      setSelectedProfileId(initialProfile.id);
      setSelectedSpecies(initialProfile.species);
      setAnimalCount(initialProfile.count);
      setTargetDmiKg(initialProfile.targetDmiKgDay);
      setNotes('');
      setOptimizerStatus(null);
    }
  }, [initialProfile]);

  const handleNewDiet = () => {
    setDietId(`diet_${Date.now()}`);
    setName('Nova Dieta Balanceada');
    setSelectedProfileId('');
    setAnimalCount(50);
    setTargetBatchKg(3000);
    setTargetDmiKg(selectedSpecies === 'bovinos_corte' ? 10.5 : 22.0);
    setNotes('');
    setItems([]);
    setOptimizerStatus(null);
  };

  const currentProfile = useMemo<AnimalProfile>(() => {
    return (
      (animalProfiles || []).find((p) => p?.id === selectedProfileId) || {
        id: 'custom',
        name: 'Perfil Customizado',
        species: selectedSpecies,
        category: 'Geral',
        breed: 'Mestiço',
        sex: 'femea' as const,
        ageMonths: 36,
        currentWeightKg: selectedSpecies === 'bovinos_corte' ? 480 : 600,
        bodyConditionScore: 3.25,
        count: animalCount,
        productionGoal: {
          type: selectedSpecies === 'bovinos_corte' ? ('carne' as const) : ('leite' as const),
          targetMilkLitersDay: 30.0,
          targetAdgKgDay: 1.4,
        },
        targetDmiKgDay: targetDmiKg,
        lotNumber: 'LOTE-01',
      }
    );
  }, [selectedProfileId, animalProfiles, selectedSpecies, animalCount, targetDmiKg]);

  const requirements: NutritionalRequirement = useMemo(
    () => calculateAnimalRequirements(currentProfile),
    [currentProfile]
  );

  const handleProfileChange = (profId: string) => {
    setSelectedProfileId(profId);
    const prof = (animalProfiles || []).find((p) => p?.id === profId);
    if (prof) {
      setSelectedSpecies(prof.species);
      setAnimalCount(prof.count);
      setTargetDmiKg(prof.targetDmiKgDay);
    }
  };

  const updatedItems = useMemo(() => {
    return items.map((it) => {
      const ing = ingredientsMap.get(it.ingredientId);
      const dmPct = ing ? Math.max(5, ing.bromatology.dryMatterPct) : 88;
      const msKg = (it.inclusionPctMs / 100) * targetDmiKg;
      const mnKg = msKg / (dmPct / 100);

      return {
        ...it,
        inclusionKgMsPerAnimal: Math.round(msKg * 1000) / 1000,
        inclusionKgMnPerAnimal: Math.round(mnKg * 1000) / 1000,
      };
    });
  }, [items, targetDmiKg, ingredientsMap]);

  const totalDmnKgPerAnimal = useMemo(
    () => updatedItems.reduce((sum, it) => sum + (it.inclusionKgMnPerAnimal || 0), 0),
    [updatedItems]
  );

  const finalizedItems = useMemo(() => {
    if (totalDmnKgPerAnimal === 0) return updatedItems;
    return updatedItems.map((it) => {
      const batchFraction = it.inclusionKgMnPerAnimal / totalDmnKgPerAnimal;
      return {
        ...it,
        inclusionKgBatch: Math.round(batchFraction * targetBatchKg * 10) / 10,
      };
    });
  }, [updatedItems, totalDmnKgPerAnimal, targetBatchKg]);

  const totalInclusionPctMs = useMemo(
    () => items.reduce((sum, it) => sum + (it.inclusionPctMs || 0), 0),
    [items]
  );

  const calculatedBromatology = useMemo(
    () => calculateDietBromatology(finalizedItems, ingredientsMap),
    [finalizedItems, ingredientsMap]
  );

  const forageRatio = useMemo(() => {
    let forageMsPct = 0;
    finalizedItems.forEach((it) => {
      const ing = ingredientsMap.get(it.ingredientId);
      if (ing && ing.category === 'volumosos') {
        forageMsPct += it.inclusionPctMs;
      }
    });
    return {
      foragePct: Math.round(forageMsPct * 10) / 10,
      concentratePct: Math.round(Math.max(0, 100 - forageMsPct) * 10) / 10,
    };
  }, [finalizedItems, ingredientsMap]);

  const metabolicHealth = useMemo(
    () =>
      evaluateMetabolicHealth(
        selectedSpecies,
        calculatedBromatology,
        forageRatio.foragePct,
        currentProfile.category
      ),
    [selectedSpecies, calculatedBromatology, forageRatio.foragePct, currentProfile.category]
  );

  const costs = useMemo(
    () =>
      calculateDietCosts(
        finalizedItems,
        ingredientsMap,
        targetDmiKg,
        targetBatchKg,
        selectedSpecies,
        currentProfile.productionGoal
      ),
    [finalizedItems, ingredientsMap, targetDmiKg, targetBatchKg, selectedSpecies, currentProfile.productionGoal]
  );

  const igen = useMemo(
    () =>
      calculateIgenScore(
        calculatedBromatology,
        requirements,
        costs,
        metabolicHealth,
        selectedSpecies,
        currentProfile,
        targetDmiKg
      ),
    [calculatedBromatology, requirements, costs, metabolicHealth, selectedSpecies, currentProfile, targetDmiKg]
  );

  const handleInclusionChange = (ingredientId: string, valPct: number) => {
    setItems((prev) =>
      prev.map((it) =>
        it.ingredientId === ingredientId ? { ...it, inclusionPctMs: Math.max(0, Math.min(100, valPct)) } : it
      )
    );
  };

  const handleAddIngredient = (ingredientId: string) => {
    if (!ingredientId) return;
    if (items.some((it) => it.ingredientId === ingredientId)) {
      setSelectedIngredientToAdd('');
      return;
    }
    const ing = ingredientsMap.get(ingredientId);
    const initialInclusion = ing?.category === 'volumosos' ? 30.0 : ing?.category === 'minerais' ? 1.0 : 5.0;
    setItems((prev) => [
      ...prev,
      {
        ingredientId,
        inclusionPctMs: initialInclusion,
        inclusionKgMsPerAnimal: 0,
        inclusionKgMnPerAnimal: 0,
        inclusionKgBatch: 0,
        costPerAnimalDay: 0,
      },
    ]);
    setSelectedIngredientToAdd('');
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    setItems((prev) => prev.filter((it) => it.ingredientId !== ingredientId));
  };

  const handleRunSimplexOptimizer = () => {
    const available = items
      .map((it) => ingredientsMap.get(it.ingredientId))
      .filter((ing): ing is FeedIngredient => Boolean(ing));

    if (available.length < 2) {
      setOptimizerStatus(
        'Adicione pelo menos 3 ingredientes variados (volumoso, energético, proteico e mineral) para executar a otimização linear.'
      );
      return;
    }

    setOptimizerStatus('Calculando combinação de menor custo...');

    setTimeout(() => {
      const result = solveLeastCostDiet(available, {}, requirements);
      if (result.status === 'optimal' || result.status === 'relaxed') {
        setItems((prev) =>
          prev.map((it) => ({
            ...it,
            inclusionPctMs:
              result.inclusionsPctMs[it.ingredientId] !== undefined
                ? result.inclusionsPctMs[it.ingredientId]
                : it.inclusionPctMs,
          }))
        );
        setOptimizerStatus(
          `${result.message} — Custo estimado: R$ ${result.totalCostPerKgMs.toFixed(2)}/kg MS.`
        );
      } else {
        setOptimizerStatus(`Atenção: ${result.message}`);
      }
    }, 100);
  };

  const handleNormalizeTo100 = () => {
    if (totalInclusionPctMs === 0) return;
    const factor = 100 / totalInclusionPctMs;
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        inclusionPctMs: Math.round(it.inclusionPctMs * factor * 100) / 100,
      }))
    );
  };

  const buildDietPayload = (incrementVersion: boolean): DietFormulation => {
    const existingVersion = formulation?.id === dietId ? formulation.version : 0;
    return {
      id: dietId,
      name: name.trim() || 'Dieta Sem Título',
      species: selectedSpecies,
      category: currentProfile.category,
      animalProfileId: selectedProfileId || undefined,
      animalCount,
      targetBatchKg,
      createdAt: formulation?.id === dietId ? formulation.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: incrementVersion ? existingVersion + 1 : Math.max(1, existingVersion),
      isLocked: false,
      items: finalizedItems,
      totalDmiKgPerAnimal: targetDmiKg,
      totalDmnKgPerAnimal: Math.round(totalDmnKgPerAnimal * 10) / 10,
      calculatedBromatology,
      costs,
      metabolicHealth,
      igen,
      forageToConcentrateRatio: forageRatio,
      digitalTwin: formulation?.id === dietId ? formulation.digitalTwin || [] : [],
      notes,
    };
  };

  const handleSave = () => {
    onSaveFormulation(buildDietPayload(true));
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const availableByCategory = useMemo(() => {
    const chosen = new Set(items.map((it) => it.ingredientId));
    return INGREDIENT_CATEGORIES.map((cat) => ({
      category: cat,
      items: ingredients.filter((ing) => ing?.id && ing.category === cat.id && !chosen.has(ing.id)),
    })).filter((group) => group.items.length > 0);
  }, [ingredients, items]);

  const inputCls =
    'w-full h-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500';

  const isSumBalanced = Math.abs(totalInclusionPctMs - 100) < 0.1;

  return (
    <div id="formulation-studio" className="space-y-4">
      {/* Studio Top Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Formulador Zootécnico · NRC 2001 & BR-CORTE</span>
              {formulations.length > 0 && (
                <>
                  <span>·</span>
                  <select
                    value={formulations.some((f) => f.id === dietId) ? dietId : ''}
                    onChange={(e) => {
                      if (e.target.value) onSelectFormulation(e.target.value);
                    }}
                    className="h-6 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 text-[11px] text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Carregar dieta salva ({formulations.length})...</option>
                    {formulations.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({getSpeciesLabel(f.species)})
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da Formulação / Dieta..."
              className="text-base font-semibold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-emerald-500 focus:outline-none w-full pb-0.5"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={handleNewDiet}
              className="h-8 px-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-md inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova Dieta
            </button>

            <button
              type="button"
              onClick={handleRunSimplexOptimizer}
              className="h-8 px-3 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 font-medium text-xs rounded-md inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Otimizar Menor Custo
            </button>

            <button
              type="button"
              onClick={() => onOpenReport(buildDietPayload(false))}
              className="h-8 px-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-md inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Batelada
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-md inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
            >
              {savedFeedback ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              {savedFeedback ? 'Salvo' : 'Salvar Dieta'}
            </button>
          </div>
        </div>

        {optimizerStatus && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-md px-3 py-2 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-2">
            <span>{optimizerStatus}</span>
            <button
              type="button"
              onClick={() => setOptimizerStatus(null)}
              aria-label="Dispensar aviso"
              className="text-emerald-700 dark:text-emerald-400 hover:opacity-75"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Parameters Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
              Lote / Perfil Animal
            </label>
            <select
              value={selectedProfileId}
              onChange={(e) => handleProfileChange(e.target.value)}
              className={inputCls}
            >
              <option value="">Personalizado</option>
              {animalProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({getSpeciesLabel(p.species)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
              Espécie
            </label>
            <select
              value={selectedSpecies}
              onChange={(e) => setSelectedSpecies(e.target.value as AnimalSpecies)}
              className={inputCls}
            >
              {SPECIES_OPTIONS.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.shortLabel}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
              Animais no Lote
            </label>
            <input
              type="number"
              min="1"
              value={animalCount}
              onChange={(e) => setAnimalCount(Math.max(1, Number(e.target.value)))}
              className={`${inputCls} font-semibold tabular-nums`}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
              Consumo Alvo (kg MS/dia)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={targetDmiKg}
              onChange={(e) => setTargetDmiKg(Math.max(0.1, Number(e.target.value)))}
              className={`${inputCls} font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums`}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
              Batelada Vagão (kg MN)
            </label>
            <input
              type="number"
              step="100"
              min="100"
              value={targetBatchKg}
              onChange={(e) => setTargetBatchKg(Math.max(50, Number(e.target.value)))}
              className={`${inputCls} font-semibold tabular-nums`}
            />
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Ingredients Composition (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Composição da Dieta (% na Matéria Seca)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                Relação Volumoso / Concentrado:{' '}
                <strong className="text-slate-800 dark:text-slate-200">{forageRatio.foragePct}%</strong> :{' '}
                <strong className="text-slate-800 dark:text-slate-200">{forageRatio.concentratePct}%</strong>
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`text-xs font-semibold tabular-nums ${
                  isSumBalanced
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-700 dark:text-amber-400'
                }`}
              >
                Soma: {totalInclusionPctMs.toFixed(1)}% MS
              </span>
              {!isSumBalanced && totalInclusionPctMs > 0 && (
                <button
                  type="button"
                  onClick={handleNormalizeTo100}
                  className="h-7 px-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-md text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
                  title="Ajustar proporcionalmente para 100%"
                >
                  <RefreshCw className="w-3 h-3" />
                  Normalizar 100%
                </button>
              )}
            </div>
          </div>

          {finalizedItems.length === 0 ? (
            <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-lg py-8 px-4 text-center">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Nenhum ingrediente adicionado à fórmula
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Selecione ingredientes abaixo (volumosos, energéticos, proteicos e minerais) para montar ou otimizar a dieta.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {finalizedItems.map((item, idx) => {
                const ing = ingredientsMap.get(item.ingredientId);
                if (!ing) return null;

                return (
                  <div key={item.ingredientId} className="py-3 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                            {String(idx + 1).padStart(2, '0')}.
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white truncate">
                            {ing.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums block pl-6">
                          {getIngredientCategoryLabel(ing.category)} · {ing.bromatology.dryMatterPct}% MS · R$ {ing.pricePerKg.toFixed(2)}/kg
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center h-7 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={item.inclusionPctMs}
                            onChange={(e) => handleInclusionChange(item.ingredientId, Number(e.target.value))}
                            className="w-12 bg-transparent text-right text-xs font-semibold text-emerald-700 dark:text-emerald-400 focus:outline-none tabular-nums"
                          />
                          <span className="text-slate-400 text-[10px] ml-1">% MS</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(item.ingredientId)}
                          aria-label={`Remover ${ing.name}`}
                          className="h-7 w-7 inline-flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="80"
                      step="0.2"
                      value={Math.min(80, item.inclusionPctMs)}
                      onChange={(e) => handleInclusionChange(item.ingredientId, Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />

                    <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                      <div>
                        MS/cab: <strong className="text-slate-800 dark:text-slate-200">{item.inclusionKgMsPerAnimal.toFixed(2)} kg</strong>
                      </div>
                      <div className="text-center">
                        MN/cab: <strong className="text-emerald-700 dark:text-emerald-400">{item.inclusionKgMnPerAnimal.toFixed(2)} kg</strong>
                      </div>
                      <div className="text-right">
                        Batelada: <strong className="text-slate-900 dark:text-white">{item.inclusionKgBatch.toFixed(1)} kg</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Ingredient Selector */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <select
              value={selectedIngredientToAdd}
              onChange={(e) => handleAddIngredient(e.target.value)}
              className={inputCls}
            >
              <option value="">+ Adicionar ingrediente à dieta...</option>
              {availableByCategory.map((group) => (
                <optgroup key={group.category.id} label={group.category.label}>
                  {group.items.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} ({ing.bromatology.crudeProteinPct}% PB · R$ {ing.pricePerKg.toFixed(2)}/kg)
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <div>
              <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                Observações técnicas da dieta (aparece no relatório de batelada)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Misturar volumoso primeiro, oferecer em 2 tratos diários..."
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Right: IGEN, Metabolic Health & Nutritional Balance (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* IGEN & Economics */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3.5">
            <div className="flex items-baseline justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                  Índice de Eficiência Nutricional (IGEN)
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5 tabular-nums">
                  <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{igen.score}</span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">/ 100 · Nota {igen.grade}</span>
                </div>
              </div>
              <div className="text-right tabular-nums">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Custo / dia</span>
                <strong className="text-sm font-bold text-slate-900 dark:text-white">
                  R$ {(igen.dietCostDaily ?? costs.costPerAnimalDay).toFixed(2)}
                </strong>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{igen.summary}</p>

            <div className="grid grid-cols-2 gap-2.5 text-xs tabular-nums pt-1">
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-md">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Conversão (FCR)</span>
                <strong className="text-slate-900 dark:text-white">
                  {igen.feedConversion ?? 0} kg MS/{selectedSpecies === 'bovinos_leite' ? 'L' : 'kg'}
                </strong>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-md">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  {selectedSpecies === 'bovinos_leite' ? 'Produção Esperada' : 'Ganho Esperado'}
                </span>
                <strong className="text-slate-900 dark:text-white">
                  {igen.expectedGain ?? 0} {selectedSpecies === 'bovinos_leite' ? 'L/dia' : 'kg/dia'}
                </strong>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-md">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Custo / {selectedSpecies === 'bovinos_leite' ? 'Litro' : 'kg Ganho'}
                </span>
                <strong className="text-emerald-700 dark:text-emerald-400">
                  R$ {(igen.costPerKgGain ?? costs.costPerAnimalDay / Math.max(0.1, igen.expectedGain || 1)).toFixed(2)}
                </strong>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-md">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Custo / kg MS</span>
                <strong className="text-slate-900 dark:text-white">R$ {costs.costPerKgMs.toFixed(2)}</strong>
              </div>
            </div>

            {/* Sub-scores */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] tabular-nums">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Aderência</span>
                <strong className="text-slate-900 dark:text-slate-100">{igen.nutritionalAdherence}%</strong>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Conversão</span>
                <strong className="text-slate-900 dark:text-slate-100">{igen.feedConversionEfficiency ?? 85}%</strong>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Econômico</span>
                <strong className="text-slate-900 dark:text-slate-100">{igen.economicEfficiency}%</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500 dark:text-slate-400 block">Digestivo</span>
                <strong className="text-slate-900 dark:text-slate-100">{igen.digestiveHealth}%</strong>
              </div>
            </div>

            {igen.recommendations && igen.recommendations.length > 0 && (
              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 block">
                  Recomendações de Ajuste
                </span>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px] list-disc list-inside">
                  {igen.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Metabolic Health */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Monitoramento Metabólico & Ruminal
            </h4>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs tabular-nums">
              <div className="py-2 first:pt-0 flex items-center justify-between gap-2">
                <div>
                  <span className="font-medium text-slate-800 dark:text-slate-200 block">Risco de Acidose (SARA)</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    peNDF: {calculatedBromatology.peNdfPct.toFixed(1)}% · Amido: {calculatedBromatology.starchPct.toFixed(1)}%
                  </span>
                </div>
                <span
                  className={`font-semibold text-xs ${
                    metabolicHealth.saraRisk === 'baixo'
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : metabolicHealth.saraRisk === 'moderado'
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-rose-700 dark:text-rose-400'
                  }`}
                >
                  {metabolicHealth.saraRisk === 'baixo'
                    ? 'Baixo'
                    : metabolicHealth.saraRisk === 'moderado'
                    ? 'Moderado'
                    : 'Alto'}
                </span>
              </div>

              <div className="py-2 last:pb-0 flex items-center justify-between gap-2">
                <div>
                  <span className="font-medium text-slate-800 dark:text-slate-200 block">Balanço Cátion-Ânion (DCAD)</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">(Na + K) − (Cl + S)</span>
                </div>
                <strong className="text-slate-900 dark:text-white">
                  {metabolicHealth.dcadValueMeqKg > 0
                    ? `+${metabolicHealth.dcadValueMeqKg}`
                    : metabolicHealth.dcadValueMeqKg}{' '}
                  mEq/kg
                </strong>
              </div>
            </div>

            {metabolicHealth.alerts.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-md p-2.5 space-y-1">
                {metabolicHealth.alerts.map((alt, i) => (
                  <p key={i} className="text-amber-800 dark:text-amber-300 text-[11px] flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>{alt}</span>
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Nutritional Balance */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              Balanço Nutricional vs Exigência
            </h4>

            <div className="space-y-2.5 text-xs tabular-nums">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-300">Proteína Bruta (PB)</span>
                  <span>
                    <strong className="text-slate-900 dark:text-white">
                      {calculatedBromatology.crudeProteinPct.toFixed(1)}%
                    </strong>{' '}
                    <span className="text-slate-500 dark:text-slate-400">
                      / meta {requirements.pbPct.target.toFixed(1)}%
                    </span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
                    style={{
                      width: `${Math.min(100, (calculatedBromatology.crudeProteinPct / Math.max(1, requirements.pbPct.target * 1.2)) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-300">Energia NDT Total</span>
                  <span>
                    <strong className="text-slate-900 dark:text-white">{calculatedBromatology.tdnPct.toFixed(1)}%</strong>{' '}
                    <span className="text-slate-500 dark:text-slate-400">
                      / meta {requirements.ndtPct.target.toFixed(1)}%
                    </span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(100, (calculatedBromatology.tdnPct / 85) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-300">FDN Total / Efetivo (peNDF)</span>
                  <span>
                    <strong className="text-slate-900 dark:text-white">{calculatedBromatology.ndfPct.toFixed(1)}%</strong>{' '}
                    <span className="text-slate-500 dark:text-slate-400">
                      / {calculatedBromatology.peNdfPct.toFixed(1)}% peNDF
                    </span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${Math.min(100, (calculatedBromatology.ndfPct / 50) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-500 dark:text-slate-400">Cálcio (Ca)</span>
                  <span>
                    <strong className="text-slate-900 dark:text-white">{calculatedBromatology.calciumPct.toFixed(2)}%</strong>{' '}
                    <span className="text-slate-400">({requirements.caPct.target}%)</span>
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-500 dark:text-slate-400">Fósforo (P)</span>
                  <span>
                    <strong className="text-slate-900 dark:text-white">{calculatedBromatology.phosphorusPct.toFixed(2)}%</strong>{' '}
                    <span className="text-slate-400">({requirements.pPct.target}%)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
