import React, { useState, useMemo, useEffect } from 'react';
import {
  Wheat,
  Droplets,
  AlertTriangle,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { EquineAnimal, EquineNutritionPlan } from '../../types/equine';
import { EQUINE_FEEDS_CATALOG } from '../../data/equineData';
import { EquinoIcon } from '../icons/EquinoIcon';

interface Props {
  animals: EquineAnimal[];
  nutritionPlans: EquineNutritionPlan[];
  onSaveNutritionPlan: (plan: EquineNutritionPlan) => void;
}

type WorkIntensity = EquineNutritionPlan['workIntensity'];

const inputCls =
  'w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500';
const labelCls = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const EquineNutritionView: React.FC<Props> = ({
  animals,
  nutritionPlans,
  onSaveNutritionPlan,
}) => {
  const safeAnimals = useMemo(() => (animals || []).filter(a => a && a.id), [animals]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(safeAnimals[0]?.id || '');

  useEffect(() => {
    if (!safeAnimals.some(a => a.id === selectedAnimalId)) {
      setSelectedAnimalId(safeAnimals[0]?.id || '');
    }
  }, [safeAnimals, selectedAnimalId]);

  const animal = safeAnimals.find(a => a.id === selectedAnimalId) || safeAnimals[0];

  const [workIntensity, setWorkIntensity] = useState<WorkIntensity>('Trabalho Moderado');
  const [roughageId, setRoughageId] = useState<string>('feed-01');
  const [dailyRoughageKg, setDailyRoughageKg] = useState<number>(8.5);
  const [concentrateId, setConcentrateId] = useState<string>('feed-04');
  const [dailyConcentrateKg, setDailyConcentrateKg] = useState<number>(3.5);
  const [oilMl, setOilMl] = useState<number>(150);
  const [mineralGrams, setMineralGrams] = useState<number>(100);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const roughageFeed = EQUINE_FEEDS_CATALOG.find(f => f.id === roughageId) || EQUINE_FEEDS_CATALOG[0];
  const concentrateFeed = EQUINE_FEEDS_CATALOG.find(f => f.id === concentrateId) || EQUINE_FEEDS_CATALOG[3];
  const oilFeed = EQUINE_FEEDS_CATALOG.find(f => f.id === 'feed-06')!;
  const mineralFeed = EQUINE_FEEDS_CATALOG.find(f => f.id === 'feed-07')!;

  const weightKg = animal?.weightKg || 450;

  // NRC (2007) Equine Requirements
  const nrcReq = useMemo(() => {
    const baseED = 0.0333 * weightKg;
    let edMult = 1.0;
    let pbMult = 1.0;
    let caMult = 1.0;
    let pMult = 1.0;

    if (workIntensity === 'Trabalho Leve') {
      edMult = 1.2;
      pbMult = 1.12;
      caMult = 1.5;
      pMult = 1.3;
    } else if (workIntensity === 'Trabalho Moderado') {
      edMult = 1.4;
      pbMult = 1.25;
      caMult = 1.75;
      pMult = 1.5;
    } else if (workIntensity === 'Trabalho Pesado / Prova') {
      edMult = 1.65;
      pbMult = 1.4;
      caMult = 2.0;
      pMult = 1.9;
    } else if (workIntensity === 'Gestação Terço Final') {
      edMult = 1.28;
      pbMult = 1.4;
      caMult = 1.8;
      pMult = 1.85;
    } else if (workIntensity === 'Lactação Inicial') {
      edMult = 1.85;
      pbMult = 2.1;
      caMult = 2.8;
      pMult = 2.5;
    } else if (workIntensity === 'Crescimento / Potro') {
      edMult = 1.35;
      pbMult = 1.6;
      caMult = 1.9;
      pMult = 1.7;
    }

    return {
      edMcal: Number((baseED * edMult).toFixed(2)),
      pbGrams: Math.round(weightKg * 1.26 * pbMult),
      caGrams: Math.round(weightKg * 0.04 * caMult),
      pGrams: Math.round(weightKg * 0.028 * pMult),
    };
  }, [weightKg, workIntensity]);

  // Diet Supply Calculation
  const dietCalc = useMemo(() => {
    const roughDM = dailyRoughageKg * (roughageFeed.dryMatterPct / 100);
    const concDM = dailyConcentrateKg * (concentrateFeed.dryMatterPct / 100);
    const oilKg = oilMl / 1000;
    const minKg = mineralGrams / 1000;

    const totalDM = roughDM + concDM + oilKg * 0.99 + minKg * 0.98;
    const dmPctBW = (totalDM / weightKg) * 100;

    const totalED =
      roughDM * roughageFeed.digestibleEnergyMcalKg +
      concDM * concentrateFeed.digestibleEnergyMcalKg +
      oilKg * oilFeed.digestibleEnergyMcalKg +
      minKg * mineralFeed.digestibleEnergyMcalKg;

    const totalPB =
      roughDM * (roughageFeed.crudeProteinPct / 100) * 1000 +
      concDM * (concentrateFeed.crudeProteinPct / 100) * 1000 +
      minKg * (mineralFeed.crudeProteinPct / 100) * 1000;

    const totalCa =
      roughDM * (roughageFeed.calciumPct / 100) * 1000 +
      concDM * (concentrateFeed.calciumPct / 100) * 1000 +
      minKg * (mineralFeed.calciumPct / 100) * 1000;

    const totalP =
      roughDM * (roughageFeed.phosphorusPct / 100) * 1000 +
      concDM * (concentrateFeed.phosphorusPct / 100) * 1000 +
      minKg * (mineralFeed.phosphorusPct / 100) * 1000;

    const caPRatio = totalP > 0 ? totalCa / totalP : 0;
    const roughageRatioPct = totalDM > 0 ? (roughDM / totalDM) * 100 : 0;
    const concentrateRatioPct = 100 - roughageRatioPct;

    const dailyCost =
      dailyRoughageKg * roughageFeed.costPerKgBrl +
      dailyConcentrateKg * concentrateFeed.costPerKgBrl +
      oilKg * oilFeed.costPerKgBrl +
      minKg * mineralFeed.costPerKgBrl;

    const waterIntakeLiters = Math.round(totalDM * 3.2 + (workIntensity.includes('Pesado') ? 12 : 4));

    const isExcessConcentrate = concentrateRatioPct > 45;
    const isRoughageTooLow = (roughDM / weightKg) * 100 < 1.5;

    let evaluation: EquineNutritionPlan['balanceEvaluation'] = 'Dieta Equilibrada';
    if (isExcessConcentrate) {
      evaluation = 'Excesso de Concentrado (Risco de Cólica/Laminite)';
    } else if (totalED < nrcReq.edMcal * 0.9) {
      evaluation = 'Déficit Energético';
    } else if (totalPB < nrcReq.pbGrams * 0.9) {
      evaluation = 'Déficit Proteico';
    } else if (caPRatio < 1.2 || caPRatio > 3.5) {
      evaluation = 'Desbalanço Ca:P';
    }

    return {
      totalDM: Number(totalDM.toFixed(2)),
      dmPctBW: Number(dmPctBW.toFixed(2)),
      totalED: Number(totalED.toFixed(2)),
      totalPB: Math.round(totalPB),
      totalCa: Math.round(totalCa),
      totalP: Math.round(totalP),
      caPRatio: Number(caPRatio.toFixed(2)),
      roughageRatioPct: Math.round(roughageRatioPct),
      concentrateRatioPct: Math.round(concentrateRatioPct),
      dailyCost: Number(dailyCost.toFixed(2)),
      waterIntakeLiters,
      isExcessConcentrate,
      isRoughageTooLow,
      evaluation,
    };
  }, [
    dailyRoughageKg,
    dailyConcentrateKg,
    oilMl,
    mineralGrams,
    roughageFeed,
    concentrateFeed,
    oilFeed,
    mineralFeed,
    weightKg,
    workIntensity,
    nrcReq,
  ]);

  const handleSave = () => {
    if (!animal) return;
    const plan: EquineNutritionPlan = {
      id: `nut-${Date.now()}`,
      animalId: animal.id,
      targetCategory: animal.category,
      animalWeightKg: weightKg,
      workIntensity,
      dailyRoughageKg,
      roughageFeedName: roughageFeed.name,
      dailyConcentrateKg,
      concentrateFeedName: concentrateFeed.name,
      supplementsDaily: `${oilMl} ml Óleo + ${mineralGrams} g Mineral`,
      mineralSaltGrams: mineralGrams,
      waterIntakeLitersEstimate: dietCalc.waterIntakeLiters,
      totalDryMatterKg: dietCalc.totalDM,
      dryMatterPctBodyWeight: dietCalc.dmPctBW,
      totalCrudeProteinGrams: dietCalc.totalPB,
      totalDigestibleEnergyMcal: dietCalc.totalED,
      totalCalciumGrams: dietCalc.totalCa,
      totalPhosphorusGrams: dietCalc.totalP,
      caPRatio: dietCalc.caPRatio,
      nrcCrudeProteinGrams: nrcReq.pbGrams,
      nrcDigestibleEnergyMcal: nrcReq.edMcal,
      nrcCalciumGrams: nrcReq.caGrams,
      nrcPhosphorusGrams: nrcReq.pGrams,
      balanceEvaluation: dietCalc.evaluation,
    };
    onSaveNutritionPlan(plan);
    setSavedNotice(`Plano nutricional salvo para ${animal.name}.`);
    setTimeout(() => setSavedNotice(null), 4000);
  };

  if (!animal) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-10 text-center space-y-2">
        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-400 mx-auto flex items-center justify-center">
          <EquinoIcon className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
          Nenhum equino cadastrado
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Cadastre um animal no Plantel para formular dietas segundo exigências NRC.
        </p>
      </div>
    );
  }

  const edPct = Math.min(130, Math.round((dietCalc.totalED / Math.max(1, nrcReq.edMcal)) * 100));
  const pbPct = Math.min(130, Math.round((dietCalc.totalPB / Math.max(1, nrcReq.pbGrams)) * 100));
  const savedForAnimal = (nutritionPlans || []).filter(p => p && p.animalId === animal.id);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Wheat className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Formulação Nutricional Equina (NRC)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Balanceamento de Energia Digestível, Proteína Bruta, relação Ca:P e prevenção de cólica/laminite
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={animal.id}
            onChange={e => setSelectedAnimalId(e.target.value)}
            className="h-8 px-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
          >
            {safeAnimals.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.weightKg} kg)
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleSave}
            className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Dieta</span>
          </button>
        </div>
      </div>

      {/* Inline Feedback Notice */}
      {savedNotice && (
        <div className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Safety Warnings */}
      {(dietCalc.isExcessConcentrate || dietCalc.isRoughageTooLow) && (
        <div className="px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div className="space-y-0.5">
            {dietCalc.isExcessConcentrate && (
              <div>
                <strong>Atenção à proporção de concentrado ({dietCalc.concentrateRatioPct}%):</strong> Acima de 45% da matéria seca eleva o risco de acidose cecal, cólica e laminite.
              </div>
            )}
            {dietCalc.isRoughageTooLow && (
              <div>
                <strong>Volumoso abaixo de 1,5% do peso vivo:</strong> Aumente a oferta de feno ou pastagem para preservar a motilidade gastrointestinal.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Formulation Inputs */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Parâmetros da Dieta Diária
            </h3>
            <span className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
              Peso base: {weightKg} kg
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className={labelCls}>Intensidade de Trabalho / Estágio Fisiológico (NRC)</label>
              <select
                value={workIntensity}
                onChange={e => setWorkIntensity(e.target.value as WorkIntensity)}
                className={inputCls}
              >
                <option value="Manutenção">Manutenção (Repouso / Lazer leve)</option>
                <option value="Trabalho Leve">Trabalho Leve (1–3h/semana)</option>
                <option value="Trabalho Moderado">Trabalho Moderado (Treino regular)</option>
                <option value="Trabalho Pesado / Prova">Trabalho Pesado / Alta Performance</option>
                <option value="Gestação Terço Final">Gestação Terço Final (9º–11º mês)</option>
                <option value="Lactação Inicial">Lactação Inicial (1º–3º mês)</option>
                <option value="Crescimento / Potro">Crescimento / Potro</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Fonte de Volumoso</label>
              <select
                value={roughageId}
                onChange={e => setRoughageId(e.target.value)}
                className={inputCls}
              >
                {EQUINE_FEEDS_CATALOG.filter(f => f.category === 'Feno' || f.category === 'Pastagem').map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.crudeProteinPct}% PB)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Oferta de Volumoso (kg matéria natural/dia)</label>
              <input
                type="number"
                step="0.5"
                min={0}
                value={dailyRoughageKg}
                onChange={e => setDailyRoughageKg(Math.max(0, Number(e.target.value) || 0))}
                className={`${inputCls} tabular-nums`}
              />
            </div>

            <div>
              <label className={labelCls}>Ração Concentrada</label>
              <select
                value={concentrateId}
                onChange={e => setConcentrateId(e.target.value)}
                className={inputCls}
              >
                {EQUINE_FEEDS_CATALOG.filter(f => f.category === 'Ração Concentrada').map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.crudeProteinPct}% PB)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Oferta de Concentrado (kg/dia)</label>
              <input
                type="number"
                step="0.25"
                min={0}
                value={dailyConcentrateKg}
                onChange={e => setDailyConcentrateKg(Math.max(0, Number(e.target.value) || 0))}
                className={`${inputCls} tabular-nums`}
              />
            </div>

            <div>
              <label className={labelCls}>Óleo Vegetal Energético (ml/dia)</label>
              <input
                type="number"
                step="50"
                min={0}
                value={oilMl}
                onChange={e => setOilMl(Math.max(0, Number(e.target.value) || 0))}
                className={`${inputCls} tabular-nums`}
              />
            </div>

            <div>
              <label className={labelCls}>Suplemento Mineral / Sal (g/dia)</label>
              <input
                type="number"
                step="10"
                min={0}
                value={mineralGrams}
                onChange={e => setMineralGrams(Math.max(0, Number(e.target.value) || 0))}
                className={`${inputCls} tabular-nums`}
              />
            </div>
          </div>

          {/* Dry Matter Split Bar */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-zinc-300">
                Relação Volumoso : Concentrado (Base MS)
              </span>
              <span className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                {dietCalc.roughageRatioPct}% : {dietCalc.concentrateRatioPct}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-emerald-600 dark:bg-emerald-500"
                style={{ width: `${dietCalc.roughageRatioPct}%` }}
              />
              <div
                className={`h-full ${dietCalc.isExcessConcentrate ? 'bg-red-500' : 'bg-amber-500'}`}
                style={{ width: `${dietCalc.concentrateRatioPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              <span>Matéria Seca Total: {dietCalc.totalDM} kg ({dietCalc.dmPctBW}% PV)</span>
              <span>Recomendado: 2,0% a 2,5% PV</span>
            </div>
          </div>
        </div>

        {/* Right: Nutritional Balance Results */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Balanço NRC vs Fornecido
            </h3>
            <span
              className={`text-[11px] font-medium ${
                dietCalc.evaluation === 'Dieta Equilibrada'
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-amber-700 dark:text-amber-400'
              }`}
            >
              {dietCalc.evaluation}
            </span>
          </div>

          <div className="space-y-3.5 text-xs tabular-nums">
            {/* Energy */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-zinc-400">Energia Digestível (Mcal/dia)</span>
                <span className="font-semibold text-slate-900 dark:text-zinc-100">
                  {dietCalc.totalED} / {nrcReq.edMcal} Mcal ({edPct}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${edPct < 90 ? 'bg-amber-500' : 'bg-emerald-600'}`}
                  style={{ width: `${Math.min(100, edPct)}%` }}
                />
              </div>
            </div>

            {/* Protein */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-zinc-400">Proteína Bruta (g/dia)</span>
                <span className="font-semibold text-slate-900 dark:text-zinc-100">
                  {dietCalc.totalPB} / {nrcReq.pbGrams} g ({pbPct}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${pbPct < 90 ? 'bg-amber-500' : 'bg-emerald-600'}`}
                  style={{ width: `${Math.min(100, pbPct)}%` }}
                />
              </div>
            </div>

            {/* Minerals & Water */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Cálcio : Fósforo</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  {dietCalc.totalCa}g : {dietCalc.totalP}g ({dietCalc.caPRatio}:1)
                </span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                  Meta NRC: {nrcReq.caGrams}g Ca / {nrcReq.pGrams}g P
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                  <span>Consumo Hídrico</span>
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  ~{dietCalc.waterIntakeLiters} L/dia
                </span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                  Água limpa ad libitum
                </span>
              </div>
            </div>

            {/* Cost Summary */}
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Custo Diário Estimado</span>
                <span className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                  R$ {dietCalc.dailyCost.toFixed(2)} / dia
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Projeção Mensal</span>
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  R$ {(dietCalc.dailyCost * 30).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Plans History */}
      {savedForAnimal.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Planos Salvos — {animal.name}
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              {savedForAnimal.length} plano{savedForAnimal.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
            {savedForAnimal.slice(0, 5).map(plan => (
              <div key={plan.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-medium text-slate-900 dark:text-zinc-100">
                    {plan.workIntensity} · {plan.dailyRoughageKg} kg volumoso + {plan.dailyConcentrateKg} kg concentrado
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                    {plan.totalDigestibleEnergyMcal} Mcal ED · {plan.totalCrudeProteinGrams} g PB · Ca:P {plan.caPRatio}:1 · {plan.supplementsDaily}
                  </div>
                </div>
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 shrink-0">
                  {plan.balanceEvaluation}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
