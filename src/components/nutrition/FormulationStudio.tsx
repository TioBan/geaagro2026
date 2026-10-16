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
  Sparkles,
  Save,
  Printer,
  Plus,
  Trash2,
  AlertTriangle,
  Award,
  CheckCircle2,
  DollarSign,
  Layers,
  Scale,
  RefreshCw,
  Zap,
  Info,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface Props {
  formulation: DietFormulation | null;
  animalProfiles: AnimalProfile[];
  ingredients: FeedIngredient[];
  onSaveFormulation: (diet: DietFormulation) => void;
  onOpenReport: (diet: DietFormulation) => void;
}

export const FormulationStudio: React.FC<Props> = ({
  formulation,
  animalProfiles,
  ingredients,
  onSaveFormulation,
  onOpenReport,
}) => {
  // Map ingredients for fast lookup
  const ingredientsMap = useMemo(() => {
    const map = new Map<string, FeedIngredient>();
    ingredients.forEach((i) => map.set(i.id, i));
    return map;
  }, [ingredients]);

  // Current formulation state
  const [dietId, setDietId] = useState<string>(formulation ? formulation.id : `diet_${Date.now()}`);
  const [name, setName] = useState<string>(formulation ? formulation.name : 'Nova Dieta Balanceada');
  const [selectedSpecies, setSelectedSpecies] = useState<AnimalSpecies>(formulation ? formulation.species : 'bovinos_leite');
  const [selectedProfileId, setSelectedProfileId] = useState<string>(formulation?.animalProfileId || animalProfiles[0]?.id || '');
  const [animalCount, setAnimalCount] = useState<number>(formulation ? formulation.animalCount : 50);
  const [targetBatchKg, setTargetBatchKg] = useState<number>(formulation ? formulation.targetBatchKg : 3000);
  const [targetDmiKg, setTargetDmiKg] = useState<number>(formulation ? formulation.totalDmiKgPerAnimal : 22.0);
  const [notes, setNotes] = useState<string>(formulation?.notes || '');
  const [items, setItems] = useState<DietFormulationItem[]>(formulation ? formulation.items : []);
  const [optimizerStatus, setOptimizerStatus] = useState<string | null>(null);
  const [selectedIngredientToAdd, setSelectedIngredientToAdd] = useState<string>('');

  // Selected animal profile
  const currentProfile = useMemo(() => {
    return (animalProfiles || []).find((p) => p?.id === selectedProfileId) || {
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
        type: selectedSpecies === 'bovinos_corte' ? 'carne' as const : 'leite' as const,
        targetMilkLitersDay: 30.0,
        targetAdgKgDay: 1.4,
      },
      targetDmiKgDay: targetDmiKg,
      lotNumber: 'LOTE-01',
    };
  }, [selectedProfileId, animalProfiles, selectedSpecies, animalCount, targetDmiKg]);

  // Calculate animal nutritional requirements (NRC/BR-CORTE)
  const requirements: NutritionalRequirement = useMemo(() => {
    return calculateAnimalRequirements(currentProfile);
  }, [currentProfile]);

  // Update values if formulation prop changes
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
    }
  }, [formulation]);

  // Synchronize target DMI when profile changes
  const handleProfileChange = (profId: string) => {
    setSelectedProfileId(profId);
    const prof = (animalProfiles || []).find((p) => p?.id === profId);
    if (prof) {
      setSelectedSpecies(prof.species);
      setAnimalCount(prof.count);
      setTargetDmiKg(prof.targetDmiKgDay);
    }
  };

  // Recalculate weights & amounts for each item whenever inclusions or targetDMI changes
  const updatedItems = useMemo(() => {
    const totalMsInclusionPct = items.reduce((sum, it) => sum + (it.inclusionPctMs || 0), 0);
    
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

  // Total Matéria Natural per animal/day
  const totalDmnKgPerAnimal = useMemo(() => {
    return updatedItems.reduce((sum, it) => sum + (it.inclusionKgMnPerAnimal || 0), 0);
  }, [updatedItems]);

  // Batch inclusions (kg for the mixer wagon)
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

  // Total inclusion % MS
  const totalInclusionPctMs = useMemo(() => {
    return items.reduce((sum, it) => sum + (it.inclusionPctMs || 0), 0);
  }, [items]);

  // Calculated bromatology
  const calculatedBromatology = useMemo(() => {
    return calculateDietBromatology(finalizedItems, ingredientsMap);
  }, [finalizedItems, ingredientsMap]);

  // Forage to concentrate ratio
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
      concentratePct: Math.round((100 - forageMsPct) * 10) / 10,
    };
  }, [finalizedItems, ingredientsMap]);

  // Metabolic health evaluation
  const metabolicHealth = useMemo(() => {
    return evaluateMetabolicHealth(
      selectedSpecies,
      calculatedBromatology,
      forageRatio.foragePct,
      currentProfile.category
    );
  }, [selectedSpecies, calculatedBromatology, forageRatio.foragePct, currentProfile.category]);

  // Costs calculation
  const costs = useMemo(() => {
    return calculateDietCosts(
      finalizedItems,
      ingredientsMap,
      targetDmiKg,
      targetBatchKg,
      selectedSpecies,
      currentProfile.productionGoal
    );
  }, [finalizedItems, ingredientsMap, targetDmiKg, targetBatchKg, selectedSpecies, currentProfile.productionGoal]);

  // IGEN Score
  const igen = useMemo(() => {
    return calculateIgenScore(
      calculatedBromatology,
      requirements,
      costs,
      metabolicHealth,
      selectedSpecies,
      currentProfile,
      targetDmiKg
    );
  }, [calculatedBromatology, requirements, costs, metabolicHealth, selectedSpecies, currentProfile, targetDmiKg]);

  // Handle inclusion change
  const handleInclusionChange = (ingredientId: string, valPct: number) => {
    setItems((prev) =>
      prev.map((it) =>
        it.ingredientId === ingredientId ? { ...it, inclusionPctMs: Math.max(0, valPct) } : it
      )
    );
  };

  // Add ingredient to diet
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

  // Remove ingredient from diet
  const handleRemoveIngredient = (ingredientId: string) => {
    setItems((prev) => prev.filter((it) => it.ingredientId !== ingredientId));
  };

  // Run Linear Programming Least-Cost Optimizer
  const handleRunSimplexOptimizer = () => {
    const available = items.map((it) => ingredientsMap.get(it.ingredientId)!).filter(Boolean);
    if (available.length < 2) {
      setOptimizerStatus('Adicione pelo menos 3 a 4 ingredientes variados (volumoso, grãos, proteico, mineral) para otimização.');
      return;
    }

    setOptimizerStatus('Executando Otimização Linear (Menor Custo)...');
    
    setTimeout(() => {
      const result = solveLeastCostDiet(available, {}, requirements);
      if (result.status === 'optimal' || result.status === 'relaxed') {
        setItems(
          items.map((it) => ({
            ...it,
            inclusionPctMs: result.inclusionsPctMs[it.ingredientId] !== undefined ? result.inclusionsPctMs[it.ingredientId] : it.inclusionPctMs,
          }))
        );
        setOptimizerStatus(`Sucesso! ${result.message} (Custo estimado: R$ ${result.totalCostPerKgMs.toFixed(2)}/kg MS)`);
      } else {
        setOptimizerStatus(`Atenção: ${result.message}`);
      }
    }, 150);
  };

  // Normalize proportions to exactly 100%
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

  // Save current formulation
  const handleSave = () => {
    const fullDiet: DietFormulation = {
      id: dietId,
      name,
      species: selectedSpecies,
      category: currentProfile.category,
      animalProfileId: selectedProfileId || undefined,
      animalCount,
      targetBatchKg,
      createdAt: formulation?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: (formulation?.version || 1) + 1,
      isLocked: false,
      items: finalizedItems,
      totalDmiKgPerAnimal: targetDmiKg,
      totalDmnKgPerAnimal: Math.round(totalDmnKgPerAnimal * 10) / 10,
      calculatedBromatology,
      costs,
      metabolicHealth,
      igen,
      forageToConcentrateRatio: forageRatio,
      digitalTwin: formulation?.digitalTwin || [],
      notes,
    };
    onSaveFormulation(fullDiet);
  };

  // Unselected ingredients available to add
  const availableToAdd = (ingredients || []).filter(
    (ing) => ing?.id && !(items || []).some((it) => it?.ingredientId === ing.id)
  );

  return (
    <div id="formulation-studio" className="space-y-6">
      {/* Studio Header & Profile Selector */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Formulador Zootécnico
              </span>
              <span className="text-xs text-slate-400">
                Versão {formulation?.version || 1} &bull; NRC & BR-CORTE
              </span>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da Formulação / Dieta..."
              className="text-lg font-bold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 focus:outline-none w-full mt-1.5 pb-0.5"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRunSimplexOptimizer}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Otimizar Menor Custo
            </button>

            <button
              onClick={() => {
                const current: DietFormulation = {
                  id: dietId,
                  name,
                  species: selectedSpecies,
                  category: currentProfile.category,
                  animalProfileId: selectedProfileId || undefined,
                  animalCount,
                  targetBatchKg,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  version: 1,
                  items: finalizedItems,
                  totalDmiKgPerAnimal: targetDmiKg,
                  totalDmnKgPerAnimal,
                  calculatedBromatology,
                  costs,
                  metabolicHealth,
                  igen,
                  forageToConcentrateRatio: forageRatio,
                  digitalTwin: [],
                  notes,
                };
                onOpenReport(current);
              }}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              Relatório / Batelada
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
            >
              <Save className="w-4 h-4" />
              Salvar Dieta
            </button>
          </div>
        </div>

        {/* Status / Message Alert */}
        {optimizerStatus && (
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              {optimizerStatus}
            </span>
            <button onClick={() => setOptimizerStatus(null)} className="text-slate-400 hover:text-white">
              &times;
            </button>
          </div>
        )}

        {/* Global Batch & Animal Parameters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Lote / Perfil Animal</label>
            <select
              value={selectedProfileId}
              onChange={(e) => handleProfileChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="">-- Personalizado --</option>
              {animalProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.species})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Espécie</label>
            <select
              value={selectedSpecies}
              onChange={(e) => setSelectedSpecies(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="bovinos_leite">Bovinos Leite</option>
              <option value="bovinos_corte">Bovinos Corte</option>
              <option value="bezerros">Bezerros</option>
              <option value="bubalinos">Bubalinos</option>
              <option value="caprinos">Caprinos</option>
              <option value="ovinos">Ovinos</option>
              <option value="suinos">Suínos</option>
              <option value="aves_corte">Aves Corte</option>
              <option value="aves_postura">Aves Postura</option>
              <option value="equinos">Equinos</option>
              <option value="peixes">Piscicultura</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Animais no Lote</label>
            <input
              type="number"
              min="1"
              value={animalCount}
              onChange={(e) => setAnimalCount(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500 font-bold"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Consumo Alvo (kg MS/dia)</label>
            <input
              type="number"
              step="0.1"
              value={targetDmiKg}
              onChange={(e) => setTargetDmiKg(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-400 focus:outline-none focus:border-emerald-500 font-bold"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Batelada do Vagão (kg MN)</label>
            <input
              type="number"
              step="100"
              value={targetBatchKg}
              onChange={(e) => setTargetBatchKg(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500 font-bold"
            />
          </div>
        </div>
      </div>

      {/* Main Studio Grid: Ingredients Sliders (Left) vs Nutritional Balance & Health (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ingredients List and Interactive Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Composição da Dieta (% na Matéria Seca)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Relação: <strong className="text-amber-400">{forageRatio.foragePct}% Volumoso</strong> :{' '}
                  <strong className="text-emerald-400">{forageRatio.concentratePct}% Concentrado</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                    Math.abs(totalInclusionPctMs - 100) < 0.05
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  Soma: {totalInclusionPctMs.toFixed(1)}% MS
                </span>
                {Math.abs(totalInclusionPctMs - 100) >= 0.1 && (
                  <button
                    onClick={handleNormalizeTo100}
                    className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
                    title="Ajustar proporcionalmente para 100%"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Ingredients Inclusions List */}
            <div className="space-y-3">
              {finalizedItems.map((item, idx) => {
                const ing = ingredientsMap.get(item.ingredientId);
                if (!ing) return null;

                return (
                  <div
                    key={item.ingredientId}
                    className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 space-y-2 hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-white block">{ing.name}</span>
                          <span className="text-[10px] text-slate-400">
                            {ing.category} &bull; {ing.bromatology.dryMatterPct}% MS &bull; R$ {ing.pricePerKg.toFixed(2)}/kg
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg px-2 py-1">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={item.inclusionPctMs}
                            onChange={(e) => handleInclusionChange(item.ingredientId, Number(e.target.value))}
                            className="w-12 bg-transparent text-right text-xs font-bold text-emerald-400 focus:outline-none"
                          />
                          <span className="text-slate-400 text-[10px] ml-1">% MS</span>
                        </div>

                        <button
                          onClick={() => handleRemoveIngredient(item.ingredientId)}
                          className="p-1 text-slate-400 hover:text-rose-400 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Interactive Slider */}
                    <input
                      type="range"
                      min="0"
                      max="80"
                      step="0.2"
                      value={item.inclusionPctMs}
                      onChange={(e) => handleInclusionChange(item.ingredientId, Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />

                    {/* Calculated amounts bar: kg MS, kg MN, kg Batelada */}
                    <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-900/50 p-2 rounded-lg text-center text-slate-300">
                      <div>
                        <span className="text-[9px] text-slate-400 block">MS / Animal</span>
                        <strong className="text-white">{item.inclusionKgMsPerAnimal} kg</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">MN / Animal (In Natura)</span>
                        <strong className="text-emerald-400">{item.inclusionKgMnPerAnimal} kg</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">Ordem Batelada</span>
                        <strong className="text-amber-400">{item.inclusionKgBatch} kg</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add New Ingredient Dropdown */}
            <div className="pt-2 flex items-center gap-2">
              <select
                value={selectedIngredientToAdd}
                onChange={(e) => handleAddIngredient(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="">+ Selecionar Ingrediente para Adicionar à Dieta...</option>
                {availableToAdd.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name} ({ing.category} - {ing.bromatology.crudeProteinPct}% PB)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Live Nutritional Balance, IGEN & Metabolic Health (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* IGEN Score & Economic Summary */}
          <div className="bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                  Índice GeaAgro de Eficiência Nutricional (IGEN)
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black text-emerald-300">{igen.score}</span>
                  <span className="text-sm font-bold text-emerald-400">/ 100 ({igen.grade})</span>
                </div>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-300 border border-emerald-500/30">
                <Award className="w-6 h-6" />
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              {igen.summary}
            </p>

            {/* Core IGEN Consolidated Pillars */}
            <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3 space-y-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Métricas Consolidadas de Eficiência
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Custo da Dieta</span>
                  <strong className="text-emerald-300 text-sm">
                    R$ {(igen.dietCostDaily ?? costs.costPerAnimalDay).toFixed(2)} / dia
                  </strong>
                </div>

                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Conversão Alimentar (FCR)</span>
                  <strong className="text-cyan-300 text-sm">
                    {igen.feedConversion ?? 0} kg MS / {selectedSpecies === 'bovinos_leite' ? 'L' : 'kg'}
                  </strong>
                </div>

                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">
                    {selectedSpecies === 'bovinos_leite' ? 'Produção Esperada' : 'Ganho de Peso Esperado'}
                  </span>
                  <strong className="text-amber-300 text-sm">
                    {igen.expectedGain ?? 0} {selectedSpecies === 'bovinos_leite' ? 'L/dia' : 'kg/dia'}
                  </strong>
                </div>

                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Custo por {selectedSpecies === 'bovinos_leite' ? 'Litro' : 'kg Ganho'}</span>
                  <strong className="text-emerald-400 text-sm">
                    R$ {(igen.costPerKgGain ?? (costs.costPerAnimalDay / Math.max(0.1, igen.expectedGain || 1))).toFixed(2)}
                  </strong>
                </div>
              </div>
            </div>

            {/* IGEN Sub-scores */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Aderência Nutricional</span>
                <strong className="text-emerald-400">{igen.nutritionalAdherence}%</strong>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Eficiência de Conversão</span>
                <strong className="text-cyan-400">{igen.feedConversionEfficiency ?? 85}%</strong>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Eficiência Econômica</span>
                <strong className="text-amber-400">{igen.economicEfficiency}%</strong>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Saúde Digestiva/Ruminal</span>
                <strong className="text-blue-400">{igen.digestiveHealth}%</strong>
              </div>
            </div>

            {/* Recommendations */}
            {igen.recommendations && igen.recommendations.length > 0 && (
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Recomendações do IGEN
                </span>
                <ul className="space-y-1 text-slate-300">
                  {igen.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Metabolic Health & SARA Risk Diagnostic */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Monitoramento Metabólico & Ruminal
            </h4>

            <div className="space-y-2 text-xs">
              {/* SARA */}
              <div className="flex items-center justify-between bg-slate-800/50 p-2.5 rounded-xl">
                <div>
                  <span className="font-semibold text-slate-200 block">Risco de Acidose Ruminal (SARA)</span>
                  <span className="text-[11px] text-slate-400">FDNef: {calculatedBromatology.peNdfPct.toFixed(1)}% | Amido: {calculatedBromatology.starchPct.toFixed(1)}%</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    metabolicHealth.saraRisk === 'baixo'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : metabolicHealth.saraRisk === 'moderado'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {metabolicHealth.saraRisk.toUpperCase()}
                </span>
              </div>

              {/* DCAD */}
              <div className="flex items-center justify-between bg-slate-800/50 p-2.5 rounded-xl">
                <div>
                  <span className="font-semibold text-slate-200 block">Balanço Cátion-Ânion (DCAD)</span>
                  <span className="text-[11px] text-slate-400">(Na + K) - (Cl + S)</span>
                </div>
                <span className="font-bold text-white bg-slate-900 px-2 py-0.5 rounded">
                  {metabolicHealth.dcadValueMeqKg > 0 ? `+${metabolicHealth.dcadValueMeqKg}` : metabolicHealth.dcadValueMeqKg} mEq/kg
                </span>
              </div>
            </div>

            {/* Health Alerts if any */}
            {(metabolicHealth.alerts || []).length > 0 && (
              <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-3 space-y-1 text-xs">
                {(metabolicHealth.alerts || []).map((alt, i) => (
                  <p key={i} className="text-amber-300 text-[11px] flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>{alt}</span>
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Live Nutritional Balance Comparison Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-blue-400" />
              Balanço Nutricional vs Exigência (NRC/BR-CORTE)
            </h4>

            <div className="space-y-2 text-xs">
              {/* PB */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Proteína Bruta (PB)</span>
                  <span>
                    <strong className="text-emerald-400">{calculatedBromatology.crudeProteinPct.toFixed(1)}%</strong>{' '}
                    <span className="text-slate-500">(Meta: {requirements.pbPct.target.toFixed(1)}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${Math.min(100, (calculatedBromatology.crudeProteinPct / (requirements.pbPct.target * 1.2)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* NDT */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Energia NDT Total</span>
                  <span>
                    <strong className="text-blue-400">{calculatedBromatology.tdnPct.toFixed(1)}%</strong>{' '}
                    <span className="text-slate-500">(Meta: {requirements.ndtPct.target.toFixed(1)}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400 rounded-full"
                    style={{ width: `${Math.min(100, (calculatedBromatology.tdnPct / 85) * 100)}%` }}
                  />
                </div>
              </div>

              {/* FDN Total & peNDF */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">FDN Total / FDN Efetivo</span>
                  <span>
                    <strong className="text-amber-400">{calculatedBromatology.ndfPct.toFixed(1)}%</strong>{' '}
                    <span className="text-slate-400">/ {calculatedBromatology.peNdfPct.toFixed(1)}% peNDF</span>
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${Math.min(100, (calculatedBromatology.ndfPct / 50) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Calcium & Phosphorus */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                <div className="bg-slate-800/60 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Cálcio (Ca)</span>
                  <strong className="text-white">{calculatedBromatology.calciumPct.toFixed(2)}%</strong>
                  <span className="text-slate-500 block text-[9px]">Meta: {requirements.caPct.target}%</span>
                </div>
                <div className="bg-slate-800/60 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Fósforo (P)</span>
                  <strong className="text-white">{calculatedBromatology.phosphorusPct.toFixed(2)}%</strong>
                  <span className="text-slate-500 block text-[9px]">Meta: {requirements.pPct.target}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
