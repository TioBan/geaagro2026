import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Sliders,
  History,
  UserCheck,
  Sprout,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Scale,
  DollarSign,
  ShieldCheck,
  Flame,
  FileText,
  Printer,
  ChevronDown,
  ChevronUp,
  Info,
  Beaker,
  Settings2,
  Truck,
  Leaf,
  Calendar,
  CheckSquare,
  Wheat,
  Share2,
} from 'lucide-react';
import { SoilAnalysisExtended } from '../types/recommendationsPro';
import { FieldPlot, Farm } from '../types/agronomy';
import {
  ProducerPreferences,
  FarmPlotHistory,
  PersonalizedCropTarget,
  DEFAULT_PRODUCER_PREFERENCES,
  DEFAULT_FARM_PLOT_HISTORY,
  PERSONALIZED_CROPS_PRESETS,
  generatePersonalizedRecommendation,
  PersonalizedRecommendationOutput,
} from '../utils/personalizedRecommendations';

interface PersonalizedRecommendationsTabProps {
  currentSoil: SoilAnalysisExtended;
  selectedFarm?: Farm;
  onApplyPlantingRecommendation?: (formulationName: string, doseKgHa: number) => void;
  onApplyLimingRecommendation?: (doseTonsHa: number, corrective: string) => void;
  onApplyGypsumRecommendation?: (doseKgHa: number) => void;
}

export const PersonalizedRecommendationsTab: React.FC<PersonalizedRecommendationsTabProps> = ({
  currentSoil,
  selectedFarm,
  onApplyPlantingRecommendation,
  onApplyLimingRecommendation,
  onApplyGypsumRecommendation,
}) => {
  // 1. STATE: Selected Crop Target Profile
  const [selectedCropId, setSelectedCropId] = useState<string>(() => {
    const cropLower = (currentSoil.cropName || '').toLowerCase();
    if (cropLower.includes('soja')) return 'soja';
    if (cropLower.includes('milho')) return 'milho';
    if (cropLower.includes('cafe') || cropLower.includes('café')) return 'cafe_arabica';
    if (cropLower.includes('algod')) return 'algodao';
    if (cropLower.includes('feij')) return 'feijao';
    if (cropLower.includes('citro') || cropLower.includes('laranja')) return 'citros';
    if (cropLower.includes('cana')) return 'cana_de_acucar';
    if (cropLower.includes('trigo')) return 'trigo';
    return 'soja';
  });

  const basePreset = useMemo(() => {
    return PERSONALIZED_CROPS_PRESETS.find(c => c.cropId === selectedCropId) || PERSONALIZED_CROPS_PRESETS[0];
  }, [selectedCropId]);

  const [customYieldTarget, setCustomYieldTarget] = useState<number>(basePreset.targetYield);

  // Update custom yield when base preset changes
  React.useEffect(() => {
    setCustomYieldTarget(basePreset.targetYield);
  }, [basePreset]);

  // Active Crop Target with custom yield
  const activeCropTarget: PersonalizedCropTarget = useMemo(() => {
    return {
      ...basePreset,
      targetYield: customYieldTarget > 0 ? customYieldTarget : basePreset.targetYield,
    };
  }, [basePreset, customYieldTarget]);

  // 2. STATE: Spacing & Geometry
  const plot = useMemo(() => {
    return selectedFarm?.plots?.find(p => p.id === currentSoil.plotId);
  }, [selectedFarm, currentSoil.plotId]);

  const [rowSpacingM, setRowSpacingM] = useState<number>(plot?.spacingBetweenRowsMeters || (basePreset.isFruitOrPerennial ? 3.0 : 0.45));
  const [plantSpacingM, setPlantSpacingM] = useState<number>(plot?.spacingBetweenPlantsMeters || (basePreset.isFruitOrPerennial ? 0.75 : 0.08));

  // Sync default spacings if crop category changes
  React.useEffect(() => {
    if (basePreset.isFruitOrPerennial) {
      if (rowSpacingM < 1.5) setRowSpacingM(3.0);
      if (plantSpacingM < 0.3) setPlantSpacingM(0.75);
    } else {
      if (rowSpacingM > 1.5) setRowSpacingM(0.45);
      if (plantSpacingM > 0.3) setPlantSpacingM(0.08);
    }
  }, [basePreset.isFruitOrPerennial]);

  // 3. STATE: Farm & Plot History
  const [history, setHistory] = useState<FarmPlotHistory>({
    ...DEFAULT_FARM_PLOT_HISTORY,
  });

  // 4. STATE: Producer Preferences
  const [preferences, setPreferences] = useState<ProducerPreferences>({
    ...DEFAULT_PRODUCER_PREFERENCES,
  });

  // UI state toggles
  const [showHistoryConfig, setShowHistoryConfig] = useState<boolean>(true);
  const [showPreferencesConfig, setShowPreferencesConfig] = useState<boolean>(false);
  const [showRecipeModal, setShowRecipeModal] = useState<boolean>(false);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  // EXECUTE MASTER ALGORITHM
  const recommendationResult: PersonalizedRecommendationOutput = useMemo(() => {
    const customPlot: FieldPlot = {
      id: currentSoil.plotId || 'plot-1',
      name: currentSoil.plotName || 'Talhão Principal',
      farmId: selectedFarm?.id || 'farm-1',
      areaHa: 50,
      texture: (currentSoil.clayPercent || 30) > 35 ? 'argiloso' : 'medio',
      clayPercentage: currentSoil.clayPercent || 30,
      spacingBetweenRowsMeters: rowSpacingM,
      spacingBetweenPlantsMeters: plantSpacingM,
      plantPopulationPerHa: Math.round(10000 / (rowSpacingM * plantSpacingM)),
      linearMetersPerHa: Math.round(10000 / rowSpacingM),
      irrigationType: 'sequeiro',
    };

    return generatePersonalizedRecommendation(
      currentSoil,
      undefined,
      customPlot,
      activeCropTarget,
      history,
      preferences
    );
  }, [currentSoil, selectedFarm, activeCropTarget, history, preferences, rowSpacingM, plantSpacingM]);

  const showToast = (msg: string) => {
    setAppliedNotification(msg);
    setTimeout(() => setAppliedNotification(null), 4000);
  };

  const handleApplyCommercialPlanting = () => {
    if (onApplyPlantingRecommendation) {
      onApplyPlantingRecommendation(
        recommendationResult.fertilization.suggestedCommercialBlend.formula,
        recommendationResult.fertilization.suggestedCommercialBlend.dose.kgPerHa
      );
      showToast(`Adubação Comercial aplicada: ${recommendationResult.fertilization.suggestedCommercialBlend.formula} (${recommendationResult.fertilization.suggestedCommercialBlend.dose.kgPerHa} kg/ha)`);
    } else {
      showToast(`Formulação ${recommendationResult.fertilization.suggestedCommercialBlend.formula} selecionada!`);
    }
  };

  const handleApplyCustomBlend = () => {
    if (onApplyPlantingRecommendation) {
      onApplyPlantingRecommendation(
        recommendationResult.fertilization.tailoredCustomBlend.customFormulaNPKS,
        recommendationResult.fertilization.tailoredCustomBlend.recommendedDose.kgPerHa
      );
      showToast(`Mistura Sob Medida aplicada: ${recommendationResult.fertilization.tailoredCustomBlend.customFormulaNPKS} (${recommendationResult.fertilization.tailoredCustomBlend.recommendedDose.kgPerHa} kg/ha)`);
    } else {
      showToast(`Fórmula Sob Medida ${recommendationResult.fertilization.tailoredCustomBlend.customFormulaNPKS} selecionada!`);
    }
  };

  const handleApplyLiming = () => {
    if (onApplyLimingRecommendation && recommendationResult.liming.needed) {
      onApplyLimingRecommendation(
        recommendationResult.liming.doseTonsHa,
        recommendationResult.liming.recommendedCorrective
      );
      showToast(`Calagem aplicada: ${recommendationResult.liming.doseTonsHa} t/ha de ${recommendationResult.liming.recommendedCorrective}`);
    } else {
      showToast('Calagem registrada!');
    }
  };

  const handleApplyGypsum = () => {
    if (onApplyGypsumRecommendation && recommendationResult.gypsum.needed) {
      onApplyGypsumRecommendation(recommendationResult.gypsum.doseKgHa);
      showToast(`Gessagem aplicada: ${recommendationResult.gypsum.doseKgHa} kg/ha`);
    } else {
      showToast('Gessagem registrada!');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12" id="personalized-recommendation-engine">
      {/* TOAST NOTIFICATION */}
      {appliedNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-500 font-bold text-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{appliedNotification}</span>
        </div>
      )}

      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-emerald-700/50 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Sparkles className="w-64 h-64 text-emerald-300" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Algoritmo de Recomendação Personalizada
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              Recomendações Sob Medida: Solo + Histórico + Produtor
            </h2>
            <p className="text-sm text-emerald-100/90 mt-1 max-w-3xl leading-relaxed">
              Integração multidimensional de atributos de fertilidade e física do solo, histórico da lavoura (cultura anterior, palhada, calagem prévia), demandas fenológicas e preferências operacionais e orçamentárias do produtor rural.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Imprimir Relatório
            </button>
          </div>
        </div>

        {/* QUICK STATUS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-emerald-700/40 text-xs">
          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
            <span className="text-emerald-200/80 block text-[10px] uppercase font-bold">Talhão & Solo</span>
            <strong className="text-white text-sm font-black truncate block">
              {currentSoil.plotName || 'Talhão Principal'} • {currentSoil.texturalClass}
            </strong>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
            <span className="text-emerald-200/80 block text-[10px] uppercase font-bold">Cultura Alvo</span>
            <strong className="text-emerald-300 text-sm font-black truncate block">
              {activeCropTarget.cropName} ({activeCropTarget.targetYield} {activeCropTarget.yieldUnit})
            </strong>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
            <span className="text-emerald-200/80 block text-[10px] uppercase font-bold">Manejo Selecionado</span>
            <strong className="text-teal-200 text-sm font-black truncate block capitalize">
              {preferences.managementSystem.replace(/_/g, ' ')}
            </strong>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
            <span className="text-emerald-200/80 block text-[10px] uppercase font-bold">Crédito N Histórico</span>
            <strong className="text-amber-300 text-sm font-black truncate block">
              {recommendationResult.fertilization.creditsAndDiscounts.previousCropNCreditKgHa > 0
                ? `-${recommendationResult.fertilization.creditsAndDiscounts.previousCropNCreditKgHa} kg N/ha (${history.previousCrop.toUpperCase()})`
                : 'Sem crédito de FBN'}
            </strong>
          </div>
        </div>
      </div>

      {/* PARAMETER CONFIGURATION DRAWER / ACCORDIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 1. CROP & SPACING TARGETS */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
            <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-600" />
              Cultura e Espaçamento
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
              Passo 1
            </span>
          </div>

          <div className="space-y-2.5">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Cultura Agrícola Alvo:
              </label>
              <select
                value={selectedCropId}
                onChange={e => setSelectedCropId(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white cursor-pointer"
              >
                {PERSONALIZED_CROPS_PRESETS.map(c => (
                  <option key={c.cropId} value={c.cropId}>
                    {c.cropName} ({c.scientificName})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Meta de Produtividade ({activeCropTarget.yieldUnit}):
                </label>
                <input
                  type="number"
                  value={customYieldTarget}
                  onChange={e => setCustomYieldTarget(Number(e.target.value))}
                  min={1}
                  step={0.5}
                  className="w-full p-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-xs text-emerald-700 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Saturação V% Alvo:
                </label>
                <div className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-xl font-black text-xs text-slate-800 dark:text-slate-200 text-center">
                  {activeCropTarget.targetVPercent}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-zinc-800">
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Entre Linhas (m):
                </label>
                <input
                  type="number"
                  value={rowSpacingM}
                  onChange={e => setRowSpacingM(Number(e.target.value))}
                  step={0.05}
                  min={0.1}
                  className="w-full p-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Entre Plantas (m):
                </label>
                <input
                  type="number"
                  value={plantSpacingM}
                  onChange={e => setPlantSpacingM(Number(e.target.value))}
                  step={0.01}
                  min={0.01}
                  className="w-full p-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-[10px] text-emerald-900 dark:text-emerald-300 flex justify-between font-semibold">
              <span><strong>Metros/ha:</strong> {recommendationResult.spacing.linearMetersPerHa.toLocaleString()} m</span>
              <span><strong>População:</strong> {recommendationResult.spacing.plantPopulationHa.toLocaleString()} pl/ha</span>
            </div>
          </div>
        </div>

        {/* 2. FARM & PLOT HISTORY */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
            <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <History className="w-4 h-4 text-amber-600" />
              Histórico da Área & Palhada
            </h3>
            <button
              type="button"
              onClick={() => setShowHistoryConfig(!showHistoryConfig)}
              className="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold flex items-center gap-0.5"
            >
              {showHistoryConfig ? 'Recolher' : 'Editar'}
              {showHistoryConfig ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Cultura Anterior no Talhão:
              </label>
              <select
                value={history.previousCrop}
                onChange={e => setHistory({ ...history, previousCrop: e.target.value as any })}
                className="w-full p-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="soja">Soja (Deixa ~25 kg N residual / FBN)</option>
                <option value="crotalaria">Crotalária / Leguminosa de Cobertura (Alta FBN)</option>
                <option value="milho">Milho 2ª Safra (Alta palhada C/N)</option>
                <option value="braquiaria">Braquiária / Pastagem (Alta palhada C/N)</option>
                <option value="trigo">Trigo / Aveia (Cereal de inverno)</option>
                <option value="feijao">Feijão (Ciclo curto)</option>
                <option value="algodao">Algodão</option>
                <option value="pousio">Pousio</option>
              </select>
            </div>

            {showHistoryConfig && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Densidade de Palhada:
                    </label>
                    <select
                      value={history.strawDensity}
                      onChange={e => setHistory({ ...history, strawDensity: e.target.value as any })}
                      className="w-full p-1.5 bg-slate-50 dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-lg font-bold text-[11px] text-slate-900 dark:text-white"
                    >
                      <option value="alta_mais_6_ton">Alta (&gt; 6 t/ha)</option>
                      <option value="media_3_a_5_ton">Média (3 a 5 t/ha)</option>
                      <option value="baixa_pouca_palha">Baixa (&lt; 3 t/ha)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Anos em Plantio Direto:
                    </label>
                    <input
                      type="number"
                      value={history.yearsInDirectPlanting}
                      onChange={e => setHistory({ ...history, yearsInDirectPlanting: Number(e.target.value) })}
                      min={0}
                      className="w-full p-1.5 bg-slate-50 dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-lg font-bold text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Última Calagem (meses):
                    </label>
                    <input
                      type="number"
                      value={history.lastLimingMonthsAgo}
                      onChange={e => setHistory({ ...history, lastLimingMonthsAgo: Number(e.target.value) })}
                      min={0}
                      className="w-full p-1.5 bg-slate-50 dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-lg font-bold text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Dose Calagem Anterior:
                    </label>
                    <input
                      type="number"
                      value={history.lastLimingDoseTonsHa}
                      onChange={e => setHistory({ ...history, lastLimingDoseTonsHa: Number(e.target.value) })}
                      min={0}
                      step={0.5}
                      placeholder="t/ha"
                      className="w-full p-1.5 bg-slate-50 dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-lg font-bold text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900 text-[10px] text-amber-900 dark:text-amber-200">
                  <div className="flex items-center justify-between font-bold">
                    <span>Adubação Orgânica Recente:</span>
                    <input
                      type="checkbox"
                      checked={history.organicFertilization.applied}
                      onChange={e => setHistory({
                        ...history,
                        organicFertilization: { ...history.organicFertilization, applied: e.target.checked }
                      })}
                      className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                    />
                  </div>
                  {history.organicFertilization.applied && (
                    <div className="grid grid-cols-2 gap-1.5 mt-2 pt-1 border-t border-amber-200 dark:border-amber-800">
                      <select
                        value={history.organicFertilization.type || 'cama_frango'}
                        onChange={e => setHistory({
                          ...history,
                          organicFertilization: { ...history.organicFertilization, type: e.target.value as any }
                        })}
                        className="p-1 bg-white dark:bg-black border rounded text-[10px] font-semibold"
                      >
                        <option value="cama_frango">Cama de Frango</option>
                        <option value="esterco_bovino">Esterco Bovino</option>
                        <option value="torta_filtro">Torta de Filtro</option>
                      </select>
                      <input
                        type="number"
                        value={history.organicFertilization.doseTonsHa || 3}
                        onChange={e => setHistory({
                          ...history,
                          organicFertilization: { ...history.organicFertilization, doseTonsHa: Number(e.target.value) }
                        })}
                        placeholder="t/ha"
                        className="p-1 bg-white dark:bg-black border rounded text-[10px] font-bold"
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 3. PRODUCER PREFERENCES & STRATEGY */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
            <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" />
              Preferências do Produtor
            </h3>
            <button
              type="button"
              onClick={() => setShowPreferencesConfig(!showPreferencesConfig)}
              className="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold flex items-center gap-0.5"
            >
              {showPreferencesConfig ? 'Recolher' : 'Avançado'}
              {showPreferencesConfig ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Sistema de Manejo:
              </label>
              <select
                value={preferences.managementSystem}
                onChange={e => setPreferences({ ...preferences, managementSystem: e.target.value as any })}
                className="w-full p-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="plantio_direto_consolidado">Plantio Direto Consolidado (&gt;5 anos)</option>
                <option value="plantio_direto_recente">Plantio Direto Recente (1-4 anos)</option>
                <option value="convencional">Convencional (Aração / Gradagem)</option>
                <option value="cultivo_minimo">Cultivo Mínimo / Escarificado</option>
                <option value="organico">Sistema Orgânico Certificado</option>
                <option value="regenerativo">Agricultura Regenerativa / Biológica</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Estratégia Orçamentária / Tecnologia:
              </label>
              <select
                value={preferences.budgetStrategy}
                onChange={e => setPreferences({ ...preferences, budgetStrategy: e.target.value as any })}
                className="w-full p-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="teto_produtivo_alta_tecnologia">Teto Produtivo (Alta Tecnologia / Máximo Retorno)</option>
                <option value="equilibrado_custo_beneficio">Equilibrado (Ótimo Custo-Benefício)</option>
                <option value="baixo_investimento_seguranca">Baixo Investimento (Segurança de Caixa)</option>
              </select>
            </div>

            {showPreferencesConfig && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Forma do Fertilizante:
                    </label>
                    <select
                      value={preferences.fertilizerFormPreference}
                      onChange={e => setPreferences({ ...preferences, fertilizerFormPreference: e.target.value as any })}
                      className="w-full p-1.5 bg-slate-50 dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-lg font-bold text-[10px] text-slate-900 dark:text-white"
                    >
                      <option value="complexo_granulado">Complexo Granulado</option>
                      <option value="mistura_de_granulos">Mistura de Grânulos</option>
                      <option value="organomineral">Organomineral</option>
                      <option value="liberacao_lenta_polimerizado">Polimerizado / Lenta Liberação</option>
                      <option value="liquido_sulco">Líquido no Sulco</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Parcelas de Cobertura:
                    </label>
                    <select
                      value={preferences.topDressingSplits}
                      onChange={e => setPreferences({ ...preferences, topDressingSplits: Number(e.target.value) })}
                      className="w-full p-1.5 bg-slate-50 dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-lg font-bold text-[10px] text-slate-900 dark:text-white"
                    >
                      <option value={1}>1 Aplicação</option>
                      <option value={2}>2 Aplicações</option>
                      <option value={3}>3 Aplicações</option>
                      <option value={4}>4 Aplicações</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Capacidade Sulco (kg/ha):
                    </label>
                    <input
                      type="number"
                      value={preferences.maxPlanterBoxKgHa}
                      onChange={e => setPreferences({ ...preferences, maxPlanterBoxKgHa: Number(e.target.value) })}
                      className="w-full p-1.5 bg-slate-50 dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-lg font-bold text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Limite N+K₂O Sulco (kg/ha):
                    </label>
                    <input
                      type="number"
                      value={preferences.maxSalinityInFurrowKgHa}
                      onChange={e => setPreferences({ ...preferences, maxSalinityInFurrowKgHa: Number(e.target.value) })}
                      className="w-full p-1.5 bg-slate-50 dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-lg font-bold text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* EXECUTIVE SUMMARY BULLETS */}
      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2">
        <h3 className="text-xs font-black uppercase text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-emerald-600" />
          Síntese Executiva do Parecer Agronômico
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-emerald-900 dark:text-emerald-200">
          {recommendationResult.executiveSummary.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-white/70 dark:bg-zinc-900/70 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900">
              <span className="text-sm">📌</span>
              <span className="leading-tight">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 1: CALAGEM & GESSAGEM PERSONALIZADA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1.1 CALAGEM */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    Calagem Personalizada
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Correção de Acidez & Saturação por Bases
                  </span>
                </div>
              </div>

              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                recommendationResult.liming.needed
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
              }`}>
                {recommendationResult.liming.needed ? 'Aplicação Necessária' : 'Solo em Equilíbrio'}
              </span>
            </div>

            {/* Dose Triad Box */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900 text-center">
              <div>
                <span className="text-[10px] text-slate-500 block font-bold">Dose por Hectare</span>
                <strong className="text-base text-indigo-900 dark:text-indigo-200 font-black">
                  {recommendationResult.liming.doseTonsHa} t/ha
                </strong>
                <span className="text-[9px] text-indigo-600 dark:text-indigo-400 block font-semibold">
                  ({recommendationResult.liming.dose.kgPerHa} kg/ha)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-bold">Dose por Metro Linear</span>
                <strong className="text-base text-indigo-900 dark:text-indigo-200 font-black">
                  {recommendationResult.liming.dose.gPerLinearMeter} g/m
                </strong>
                <span className="text-[9px] text-slate-500 block">no sulco/faixa</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-bold">Dose por Planta</span>
                <strong className="text-base text-indigo-900 dark:text-indigo-200 font-black">
                  {recommendationResult.liming.dose.gPerPlant} g/pl
                </strong>
                <span className="text-[9px] text-slate-500 block">projeção copa</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Corretivo Indicado:</span>
                <strong className="text-slate-900 dark:text-white font-bold block">
                  {recommendationResult.liming.recommendedCorrective}
                </strong>
                <span className="text-[10px] text-slate-500 block">
                  {recommendationResult.liming.incorporationMethod}
                </span>
              </div>

              {/* Justification */}
              <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed space-y-1.5">
                <span className="font-black text-indigo-700 dark:text-indigo-400 flex items-center gap-1 text-[11px]">
                  <Info className="w-3.5 h-3.5" />
                  Justificativa Agronômica Integrada:
                </span>
                <p>{recommendationResult.liming.justification}</p>
              </div>

              {/* Factors considered list */}
              {(recommendationResult.liming.integratedFactors || []).length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 block">Variáveis Integradas pelo Algoritmo:</span>
                  <div className="space-y-1">
                    {(recommendationResult.liming.integratedFactors || []).map((f, i) => (
                      <div key={i} className="text-[10px] p-1.5 bg-slate-100 dark:bg-zinc-800 rounded-lg flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">🔍 {f.factor}</span>
                        <span className="text-slate-600 dark:text-slate-400 text-right">{f.impact}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
            <button
              type="button"
              onClick={handleApplyLiming}
              disabled={!recommendationResult.liming.needed}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Sincronizar Calagem
            </button>
          </div>
        </div>

        {/* 1.2 GESSAGEM */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    Gessagem Personalizada
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Condicionamento Subsuperficial & Enxofre
                  </span>
                </div>
              </div>

              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                recommendationResult.gypsum.needed
                  ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-zinc-700'
              }`}>
                {recommendationResult.gypsum.needed ? 'Aplicação Indicada' : 'Não Requerida'}
              </span>
            </div>

            {/* Dose Triad Box */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-teal-50/60 dark:bg-teal-950/30 rounded-xl border border-teal-100 dark:border-teal-900 text-center">
              <div>
                <span className="text-[10px] text-slate-500 block font-bold">Dose por Hectare</span>
                <strong className="text-base text-teal-900 dark:text-teal-200 font-black">
                  {recommendationResult.gypsum.doseKgHa} kg/ha
                </strong>
                <span className="text-[9px] text-teal-600 dark:text-teal-400 block font-semibold">
                  (Fator {recommendationResult.gypsum.multiplierFactor} × Argila)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-bold">Dose por Metro Linear</span>
                <strong className="text-base text-teal-900 dark:text-teal-200 font-black">
                  {recommendationResult.gypsum.dose.gPerLinearMeter} g/m
                </strong>
                <span className="text-[9px] text-slate-500 block">em linha/faixa</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-bold">Dose por Planta</span>
                <strong className="text-base text-teal-900 dark:text-teal-200 font-black">
                  {recommendationResult.gypsum.dose.gPerPlant} g/pl
                </strong>
                <span className="text-[9px] text-slate-500 block">projeção copa</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Gatilhos Técnicos Ativados:</span>
                <div className="flex flex-wrap gap-1">
                  {(recommendationResult.gypsum.triggerCriteria || []).map((crit, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-teal-100/80 dark:bg-teal-900/50 text-teal-900 dark:text-teal-200 font-semibold">
                      ✓ {crit}
                    </span>
                  ))}
                  {(recommendationResult.gypsum.triggerCriteria || []).length === 0 && (
                    <span className="text-[10px] text-slate-500 italic">Nenhum gatilho de toxidez por Al³⁺ ou déficit de Ca²⁺ em subsuperfície.</span>
                  )}
                </div>
              </div>

              {/* Justification */}
              <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed space-y-1.5">
                <span className="font-black text-teal-700 dark:text-teal-400 flex items-center gap-1 text-[11px]">
                  <Info className="w-3.5 h-3.5" />
                  Justificativa Agronômica Integrada:
                </span>
                <p>{recommendationResult.gypsum.justification}</p>
              </div>

              {/* Factors considered list */}
              {(recommendationResult.gypsum.integratedFactors || []).length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 block">Variáveis Integradas pelo Algoritmo:</span>
                  <div className="space-y-1">
                    {(recommendationResult.gypsum.integratedFactors || []).map((f, i) => (
                      <div key={i} className="text-[10px] p-1.5 bg-slate-100 dark:bg-zinc-800 rounded-lg flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">🔍 {f.factor}</span>
                        <span className="text-slate-600 dark:text-slate-400 text-right">{f.impact}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
            <button
              type="button"
              onClick={handleApplyGypsum}
              disabled={!recommendationResult.gypsum.needed}
              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Sincronizar Gessagem
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: ADUBAÇÃO DE PLANTIO & FORMULAÇÕES SOB MEDIDA */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-slate-100 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Beaker className="w-5 h-5 text-emerald-600" />
              Formulações de Plantio: Comercial vs. Mistura Sob Medida (Tailored Blend)
            </h3>
            <p className="text-xs text-slate-500">
              O sistema calcula a demanda nutricional líquida compensando créditos do histórico e sugere opções comerciais e personalizadas.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowRecipeModal(!showRecipeModal)}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-emerald-100"
          >
            <Truck className="w-4 h-4" />
            <span>{showRecipeModal ? 'Ocultar Matérias-Primas' : 'Ver Receita Big Bag (kg/ton)'}</span>
          </button>
        </div>

        {/* NUTRIENT BALANCE COMPARISON: GROSS vs CREDITS vs NET */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-center text-xs">
          <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
            <span className="text-[10px] text-slate-500 block font-bold">Nitrogênio (N)</span>
            <strong className="text-sm font-black text-emerald-700 dark:text-emerald-400">
              {recommendationResult.fertilization.netNutrientDemandKgHa.n} kg/ha
            </strong>
            <span className="text-[9px] text-slate-500 block">
              Bruto: {recommendationResult.fertilization.grossNutrientDemandKgHa.n}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
            <span className="text-[10px] text-slate-500 block font-bold">Fósforo (P₂O₅)</span>
            <strong className="text-sm font-black text-teal-700 dark:text-teal-400">
              {recommendationResult.fertilization.netNutrientDemandKgHa.p2o5} kg/ha
            </strong>
            <span className="text-[9px] text-slate-500 block">
              Bruto: {recommendationResult.fertilization.grossNutrientDemandKgHa.p2o5}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
            <span className="text-[10px] text-slate-500 block font-bold">Potássio (K₂O)</span>
            <strong className="text-sm font-black text-cyan-700 dark:text-cyan-400">
              {recommendationResult.fertilization.netNutrientDemandKgHa.k2o} kg/ha
            </strong>
            <span className="text-[9px] text-slate-500 block">
              Bruto: {recommendationResult.fertilization.grossNutrientDemandKgHa.k2o}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
            <span className="text-[10px] text-slate-500 block font-bold">Enxofre (S)</span>
            <strong className="text-sm font-black text-amber-700 dark:text-amber-400">
              {recommendationResult.fertilization.netNutrientDemandKgHa.s} kg/ha
            </strong>
            <span className="text-[9px] text-slate-500 block">
              Bruto: {recommendationResult.fertilization.grossNutrientDemandKgHa.s}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
            <span className="text-[10px] text-slate-500 block font-bold">Boro (B)</span>
            <strong className="text-sm font-black text-indigo-700 dark:text-indigo-400">
              {recommendationResult.fertilization.netNutrientDemandKgHa.b} g/ha
            </strong>
            <span className="text-[9px] text-slate-500 block">
              Solo: {currentSoil.bBoroMgDm3} mg/dm³
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
            <span className="text-[10px] text-slate-500 block font-bold">Zinco (Zn)</span>
            <strong className="text-sm font-black text-violet-700 dark:text-violet-400">
              {recommendationResult.fertilization.netNutrientDemandKgHa.zn} g/ha
            </strong>
            <span className="text-[9px] text-slate-500 block">
              Solo: {currentSoil.znZincoMgDm3} mg/dm³
            </span>
          </div>
        </div>

        {/* COMPARATIVE CARDS: COMMERCIAL vs CUSTOM BLEND */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* OPTION A: FORMULADO COMERCIAL RECOMENDADO */}
          <div className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                  Opção A • Formulado Comercial de Mercado
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  Pronto Entrega
                </span>
              </div>

              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                {recommendationResult.fertilization.suggestedCommercialBlend.formula}
              </h4>

              {/* Triad Output */}
              <div className="grid grid-cols-3 gap-1.5 p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 text-center">
                <div>
                  <span className="text-[9px] text-slate-500 block font-bold">Dose Hectare</span>
                  <strong className="text-sm text-emerald-700 dark:text-emerald-400 font-black">
                    {recommendationResult.fertilization.suggestedCommercialBlend.dose.kgPerHa} kg/ha
                  </strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block font-bold">Dose Metro Linear</span>
                  <strong className="text-sm text-emerald-700 dark:text-emerald-400 font-black">
                    {recommendationResult.fertilization.suggestedCommercialBlend.dose.gPerLinearMeter} g/m
                  </strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block font-bold">Dose por Planta</span>
                  <strong className="text-sm text-emerald-700 dark:text-emerald-400 font-black">
                    {recommendationResult.fertilization.suggestedCommercialBlend.dose.gPerPlant} g/pl
                  </strong>
                </div>
              </div>

              {recommendationResult.fertilization.suggestedCommercialBlend.splitWarning && (
                <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-900 text-[10px] text-amber-900 dark:text-amber-300 flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>{recommendationResult.fertilization.suggestedCommercialBlend.splitWarning}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleApplyCommercialPlanting}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              Aplicar Formulado Comercial
            </button>
          </div>

          {/* OPTION B: MISTURA SOB MEDIDA (BIG BAG) */}
          <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-300 dark:border-emerald-700 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-600 text-white shadow-2xs">
                  Opção B • Mistura Sob Medida de Alta Eficiência
                </span>
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                  Sob Encomenda (Big Bag)
                </span>
              </div>

              <h4 className="text-sm font-black text-emerald-950 dark:text-white">
                Fórmula Exata: {recommendationResult.fertilization.tailoredCustomBlend.customFormulaNPKS}
              </h4>

              {/* Triad Output */}
              <div className="grid grid-cols-3 gap-1.5 p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
                <div>
                  <span className="text-[9px] text-slate-500 block font-bold">Dose Hectare</span>
                  <strong className="text-sm text-emerald-700 dark:text-emerald-400 font-black">
                    {recommendationResult.fertilization.tailoredCustomBlend.recommendedDose.kgPerHa} kg/ha
                  </strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block font-bold">Dose Metro Linear</span>
                  <strong className="text-sm text-emerald-700 dark:text-emerald-400 font-black">
                    {recommendationResult.fertilization.tailoredCustomBlend.recommendedDose.gPerLinearMeter} g/m
                  </strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block font-bold">Dose por Planta</span>
                  <strong className="text-sm text-emerald-700 dark:text-emerald-400 font-black">
                    {recommendationResult.fertilization.tailoredCustomBlend.recommendedDose.gPerPlant} g/pl
                  </strong>
                </div>
              </div>

              <div className="space-y-1">
                {recommendationResult.fertilization.tailoredCustomBlend.advantages.map((adv, idx) => (
                  <div key={idx} className="text-[10px] text-emerald-900 dark:text-emerald-200 flex items-center gap-1">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{adv}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleApplyCustomBlend}
              className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-4 h-4" />
              Aplicar Mistura Sob Medida
            </button>
          </div>
        </div>

        {/* EXPANDABLE RAW MATERIAL BIG BAG RECIPE */}
        {showRecipeModal && (
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 animate-fadeIn border border-emerald-600">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-black text-white">
                  Receita da Mistura Sob Medida para Fabricante / Misturador (Base: 1 Tonelada = 1.000 kg)
                </h4>
              </div>
              <span className="text-xs text-emerald-300 font-bold">
                Fórmula Final: {recommendationResult.fertilization.tailoredCustomBlend.customFormulaNPKS}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="py-2">Matéria-Prima Industrial</th>
                    <th className="py-2 text-right">Quantidade (kg/ton)</th>
                    <th className="py-2 text-right">Participação (%)</th>
                    <th className="py-2 text-right">Garantia Nutricional Contribuída</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {recommendationResult.fertilization.tailoredCustomBlend.rawMaterialsRecipeKgPerTon.map((mat) => (
                    <tr key={mat.id} className="hover:bg-slate-800/40">
                      <td className="py-2 font-bold text-slate-200">{mat.name}</td>
                      <td className="py-2 text-right font-black text-emerald-400">{mat.kgPerTon} kg</td>
                      <td className="py-2 text-right text-slate-300">{mat.percentage}%</td>
                      <td className="py-2 text-right text-teal-300 font-semibold">{mat.contributedNutrients}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-slate-700 font-black text-white">
                    <td className="py-2">TOTAL DA BATELADA</td>
                    <td className="py-2 text-right text-emerald-300">1.000 kg (1 Ton)</td>
                    <td className="py-2 text-right">100%</td>
                    <td className="py-2 text-right text-amber-300">Grau Equilibrado</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: PLANO DE COBERTURA & BIOESTIMULANTES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3.1 COBERTURA NITROGENADA & POTÁSSICA */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Plano de Cobertura Parcelada
                </h4>
                <span className="text-[11px] text-slate-500 font-medium">
                  {(recommendationResult.fertilization.topDressingPlan?.splits || []).length} Aplicações Fenológicas
                </span>
              </div>
            </div>

            <span className="text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900">
              Total: {recommendationResult.fertilization.topDressingPlan?.totalTopDressingDoseKgHa || 0} kg/ha
            </span>
          </div>

          <div className="space-y-2.5">
            {(recommendationResult.fertilization.topDressingPlan?.splits || []).map((split) => (
              <div
                key={split.splitIndex}
                className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-black text-slate-900 dark:text-white">
                    Parcela #{split.splitIndex}: {split.stage}
                  </strong>
                  <span className="text-xs font-black text-amber-700 dark:text-amber-400">
                    {split.dose.kgPerHa} kg/ha ({split.dose.gPerLinearMeter} g/m)
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                  <strong>Produto:</strong> {split.productName}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200 dark:border-zinc-800">
                  <span>Nutrientes: {split.nKgHa} kg N • {split.k2oKgHa} kg K₂O</span>
                  <span className="italic">{split.guidance}</span>
                </div>
              </div>
            ))}

            {(recommendationResult.fertilization.topDressingPlan?.splits || []).length === 0 && (
              <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl text-center text-xs text-slate-500 italic">
                Não requer adubação mineral de cobertura nitrogenada (Simbiose Biológica FBN integral).
              </div>
            )}
          </div>
        </div>

        {/* 3.2 PROGRAMA FOLIAR E BIOESTIMULANTES */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Nutrição Foliar & Bioestimulantes
                </h4>
                <span className="text-[11px] text-slate-500 font-medium">
                  Complementação Estratégica em Fases Críticas
                </span>
              </div>
            </div>

            <span className="text-xs font-black text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-900">
              3 Janelas de Aplicação
            </span>
          </div>

          <div className="space-y-2.5">
            {recommendationResult.fertilization.foliarAndBiostimulants.map((prog, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-black text-slate-900 dark:text-white">
                    {prog.stage}
                  </strong>
                  <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400">
                    {prog.rate}
                  </span>
                </div>

                <div className="text-[11px] text-slate-700 dark:text-slate-300">
                  <strong>Produtos:</strong> {prog.products} ({prog.elements})
                </div>

                <div className="text-[10px] text-slate-500 italic pt-0.5">
                  🎯 <strong>Objetivo:</strong> {prog.technicalObjective}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: JUSTIFICATIVA INTEGRADA & CHECKLIST OPERACIONAL */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-xs">
        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-600" />
          Parecer Agronômico & Checklist de Aplicação em Campo
        </h3>

        <div className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
          <p className="font-semibold">{recommendationResult.fertilization.integratedJustification}</p>
        </div>

        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">
            Checklist Operacional de Aplicação:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {recommendationResult.fertilization.fieldActionChecklist.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900 text-xs text-slate-800 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
