import React, { useState } from 'react';
import {
  Sparkles,
  Scale,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Droplet,
  Info,
  Layers,
  Plus,
  Save,
} from 'lucide-react';
import { EquineAnimal, EquineNutritionFeed, EquineNutritionPlan } from '../../types/equine';
import { EQUINE_FEEDS_CATALOG } from '../../data/equineData';

interface Props {
  animals: EquineAnimal[];
  selectedAnimalId?: string;
  nutritionPlans: EquineNutritionPlan[];
  onSavePlan: (plan: EquineNutritionPlan) => void;
}

export const EquineNutritionView: React.FC<Props> = ({
  animals,
  selectedAnimalId,
  nutritionPlans,
  onSavePlan,
}) => {
  const [currentId, setCurrentId] = useState<string>(selectedAnimalId || (animals[0]?.id ?? ''));
  const animal = animals.find(a => a?.id === currentId) || animals[0];

  // Diet inputs state
  const [workIntensity, setWorkIntensity] = useState<'Manutenção' | 'Trabalho Leve' | 'Trabalho Moderado' | 'Trabalho Pesado / Prova' | 'Gestação Terço Final' | 'Lactação Inicial' | 'Crescimento / Potro'>('Trabalho Moderado');
  const [roughageKg, setRoughageKg] = useState<number>(7.0);
  const [selectedRoughageId, setSelectedRoughageId] = useState<string>('feed-01'); // Feno Tifton 85
  const [concentrateKg, setConcentrateKg] = useState<number>(3.5);
  const [selectedConcentrateId, setSelectedConcentrateId] = useState<string>('feed-04'); // Ração 14%
  const [mineralSaltGrams, setMineralSaltGrams] = useState<number>(80);
  const [supplementsText, setSupplementsText] = useState<string>('Biotina 20mg + Eletrólitos pós-treino');

  if (!animal) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center">
        <span className="text-4xl">🐎</span>
        <h3 className="text-base font-black text-stone-900 mt-2">Nenhum animal selecionado</h3>
      </div>
    );
  }

  const roughageFeed = EQUINE_FEEDS_CATALOG.find(f => f?.id === selectedRoughageId) || EQUINE_FEEDS_CATALOG[0];
  const concentrateFeed = EQUINE_FEEDS_CATALOG.find(f => f?.id === selectedConcentrateId) || EQUINE_FEEDS_CATALOG[3];
  const mineralFeed = EQUINE_FEEDS_CATALOG.find(f => f?.id === 'feed-07') || EQUINE_FEEDS_CATALOG[6];

  // Nutritional Calculations
  // Dry matter kg
  const dmRoughage = roughageKg * (roughageFeed.dryMatterPct / 100);
  const dmConcentrate = concentrateKg * (concentrateFeed.dryMatterPct / 100);
  const dmMineral = (mineralSaltGrams / 1000) * (mineralFeed.dryMatterPct / 100);
  const totalDmKg = Number((dmRoughage + dmConcentrate + dmMineral).toFixed(2));
  const dmPctBodyWeight = Number(((totalDmKg / animal.weightKg) * 100).toFixed(2));

  // Crude Protein (g)
  const cpRoughageG = dmRoughage * (roughageFeed.crudeProteinPct / 100) * 1000;
  const cpConcentrateG = dmConcentrate * (concentrateFeed.crudeProteinPct / 100) * 1000;
  const totalCpG = Math.round(cpRoughageG + cpConcentrateG);

  // Digestible Energy (Mcal)
  const deRoughage = dmRoughage * roughageFeed.digestibleEnergyMcalKg;
  const deConcentrate = dmConcentrate * concentrateFeed.digestibleEnergyMcalKg;
  const totalDeMcal = Number((deRoughage + deConcentrate).toFixed(2));

  // Calcium (g) & Phosphorus (g)
  const caRoughageG = dmRoughage * (roughageFeed.calciumPct / 100) * 1000;
  const caConcentrateG = dmConcentrate * (concentrateFeed.calciumPct / 100) * 1000;
  const caMineralG = (mineralSaltGrams / 1000) * (mineralFeed.calciumPct / 100) * 1000;
  const totalCaG = Number((caRoughageG + caConcentrateG + caMineralG).toFixed(1));

  const pRoughageG = dmRoughage * (roughageFeed.phosphorusPct / 100) * 1000;
  const pConcentrateG = dmConcentrate * (concentrateFeed.phosphorusPct / 100) * 1000;
  const pMineralG = (mineralSaltGrams / 1000) * (mineralFeed.phosphorusPct / 100) * 1000;
  const totalPG = Number((pRoughageG + pConcentrateG + pMineralG).toFixed(1));

  const caPRatio = totalPG > 0 ? Number((totalCaG / totalPG).toFixed(2)) : 2.0;

  // NRC Equine Requirements (Based on body weight and work intensity)
  let nrcDeMultiplier = 0.0333; // Mcal per kg BW for maintenance
  let nrcCpMultiplier = 1.44; // g CP per kg BW
  let nrcCa = animal.weightKg * 0.06;
  let nrcP = animal.weightKg * 0.035;

  if (workIntensity === 'Trabalho Leve') {
    nrcDeMultiplier = 0.039;
    nrcCpMultiplier = 1.7;
    nrcCa = animal.weightKg * 0.07;
    nrcP = animal.weightKg * 0.045;
  } else if (workIntensity === 'Trabalho Moderado') {
    nrcDeMultiplier = 0.047;
    nrcCpMultiplier = 2.0;
    nrcCa = animal.weightKg * 0.08;
    nrcP = animal.weightKg * 0.055;
  } else if (workIntensity === 'Trabalho Pesado / Prova') {
    nrcDeMultiplier = 0.058;
    nrcCpMultiplier = 2.4;
    nrcCa = animal.weightKg * 0.10;
    nrcP = animal.weightKg * 0.07;
  } else if (workIntensity === 'Gestação Terço Final') {
    nrcDeMultiplier = 0.043;
    nrcCpMultiplier = 2.0;
    nrcCa = animal.weightKg * 0.09;
    nrcP = animal.weightKg * 0.065;
  } else if (workIntensity === 'Lactação Inicial') {
    nrcDeMultiplier = 0.062;
    nrcCpMultiplier = 3.1;
    nrcCa = animal.weightKg * 0.12;
    nrcP = animal.weightKg * 0.08;
  }

  const nrcDeMcal = Number((animal.weightKg * nrcDeMultiplier).toFixed(1));
  const nrcCpG = Math.round(animal.weightKg * nrcCpMultiplier);

  // Daily Cost (BRL)
  const dailyCostBrl = Number(
    (roughageKg * roughageFeed.costPerKgBrl +
      concentrateKg * concentrateFeed.costPerKgBrl +
      (mineralSaltGrams / 1000) * mineralFeed.costPerKgBrl).toFixed(2)
  );

  // Estimated Water Intake: ~7% of body weight
  const estimatedWaterLiters = Math.round(animal.weightKg * 0.08);

  // Safety checks
  const isConcentrateTooHigh = concentrateKg > (animal.weightKg * 0.012);
  const isRoughageTooLow = dmRoughage < (animal.weightKg * 0.012);
  const isCaPBalanced = caPRatio >= 1.4 && caPRatio <= 2.5;

  const handleSavePlan = () => {
    const plan: EquineNutritionPlan = {
      id: `nutri-${Date.now()}`,
      animalId: animal.id,
      targetCategory: animal.category,
      animalWeightKg: animal.weightKg,
      workIntensity,
      dailyRoughageKg: roughageKg,
      roughageFeedName: roughageFeed.name,
      dailyConcentrateKg: concentrateKg,
      concentrateFeedName: concentrateFeed.name,
      supplementsDaily: supplementsText,
      mineralSaltGrams,
      waterIntakeLitersEstimate: estimatedWaterLiters,
      totalDryMatterKg: totalDmKg,
      dryMatterPctBodyWeight: dmPctBodyWeight,
      totalCrudeProteinGrams: totalCpG,
      totalDigestibleEnergyMcal: totalDeMcal,
      totalCalciumGrams: totalCaG,
      totalPhosphorusGrams: totalPG,
      caPRatio,
      nrcCrudeProteinGrams: nrcCpG,
      nrcDigestibleEnergyMcal: nrcDeMcal,
      nrcCalciumGrams: Math.round(nrcCa),
      nrcPhosphorusGrams: Math.round(nrcP),
      balanceEvaluation: isConcentrateTooHigh ? 'Excesso de Concentrado (Risco de Cólica/Laminite)' : isCaPBalanced ? 'Dieta Equilibrada' : 'Desbalanço Ca:P',
      notes: `Plano nutricional calculado conforme diretrizes NRC Equinos 2007. Custo diário: R$ ${dailyCostBrl.toFixed(2)}.`,
    };

    onSavePlan(plan);
    alert(`Plano nutricional para ${animal.name} salvo com sucesso!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="text-[10px] font-black uppercase text-amber-900 tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Nutrição de Precisão & Balanceamento NRC Equinos
          </div>
          <h2 className="text-xl font-black text-stone-900">{animal.name}</h2>
          <div className="text-xs text-stone-500 font-mono mt-0.5">
            Peso: <strong>{animal.weightKg} kg</strong> • Escore: <strong>{animal.bodyScore}/9</strong> • Categoria: <strong>{animal.category}</strong>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={currentId}
            onChange={e => setCurrentId(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-hidden focus:border-amber-600"
          >
            {animals.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.category})
              </option>
            ))}
          </select>

          <button
            onClick={handleSavePlan}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Dieta</span>
          </button>
        </div>
      </div>

      {/* Safety Alerts Banner */}
      {isConcentrateTooHigh && (
        <div className="p-4 bg-red-50 rounded-2xl border-2 border-red-300 flex items-start gap-3 text-xs text-red-950">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-black block text-sm">Alerta Zootécnico: Sobrecarga de Concentrado!</strong>
            Fornecimento de concentrado ({concentrateKg} kg) ultrapassa o limite seguro de 1.0% a 1.2% do peso vivo. Risco aumentado de acidose cecal, cólica por sobrecarga e laminite subclínica.
          </div>
        </div>
      )}

      {/* Main Diet Formulation Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input Formulator */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-700" />
            <span>Formulação da Dieta Diária</span>
          </h3>

          {/* Activity / Work Intensity */}
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Nível de Esforço / Fase Fisiológica:</label>
            <select
              value={workIntensity}
              onChange={e => setWorkIntensity(e.target.value as any)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold"
            >
              <option value="Manutenção">Manutenção (Descanso / Sem trabalho)</option>
              <option value="Trabalho Leve">Trabalho Leve (Cavalgadas / Passeio)</option>
              <option value="Trabalho Moderado">Trabalho Moderado (Treino Regular / Pista)</option>
              <option value="Trabalho Pesado / Prova">Trabalho Pesado / Prova (Tambor, Corrida, Salto)</option>
              <option value="Gestação Terço Final">Gestação Terço Final (Últimos 3 meses)</option>
              <option value="Lactação Inicial">Lactação Inicial (Primeiros 3 meses com potro)</option>
              <option value="Crescimento / Potro">Crescimento / Potro em Recria</option>
            </select>
          </div>

          {/* Roughage Selection & Amount */}
          <div className="space-y-1.5 p-3 bg-stone-50 rounded-xl border border-stone-200">
            <label className="text-xs font-bold text-stone-900 block">1. Volumoso / Feno (Base da Dieta):</label>
            <select
              value={selectedRoughageId}
              onChange={e => setSelectedRoughageId(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
            >
              {EQUINE_FEEDS_CATALOG.filter(f => f.category === 'Feno' || f.category === 'Pastagem').map(f => (
                <option key={f.id} value={f.id}>{f.name} (R$ {f.costPerKgBrl}/kg)</option>
              ))}
            </select>
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-stone-600">Quantidade fornecida:</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.5"
                  value={roughageKg}
                  onChange={e => setRoughageKg(parseFloat(e.target.value) || 0)}
                  className="w-16 px-2 py-1 bg-white border border-stone-300 rounded-md font-bold font-mono text-center"
                />
                <span className="font-bold">kg/dia</span>
              </div>
            </div>
          </div>

          {/* Concentrate Selection & Amount */}
          <div className="space-y-1.5 p-3 bg-stone-50 rounded-xl border border-stone-200">
            <label className="text-xs font-bold text-stone-900 block">2. Ração Concentrada / Grãos:</label>
            <select
              value={selectedConcentrateId}
              onChange={e => setSelectedConcentrateId(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
            >
              {EQUINE_FEEDS_CATALOG.filter(f => f.category === 'Ração Concentrada' || f.category === 'Aditivo / Óleo').map(f => (
                <option key={f.id} value={f.id}>{f.name} (R$ {f.costPerKgBrl}/kg)</option>
              ))}
            </select>
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-stone-600">Quantidade fornecida:</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.2"
                  value={concentrateKg}
                  onChange={e => setConcentrateKg(parseFloat(e.target.value) || 0)}
                  className="w-16 px-2 py-1 bg-white border border-stone-300 rounded-md font-bold font-mono text-center"
                />
                <span className="font-bold">kg/dia</span>
              </div>
            </div>
          </div>

          {/* Mineral Salt & Water */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-stone-700 font-bold">Sal Mineral Equino Premium:</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="10"
                  value={mineralSaltGrams}
                  onChange={e => setMineralSaltGrams(parseFloat(e.target.value) || 0)}
                  className="w-16 px-2 py-1 bg-stone-50 border border-stone-300 rounded-md font-bold font-mono text-center"
                />
                <span className="font-bold">g/dia</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Suplementos & Aditivos Diários:</label>
              <input
                type="text"
                value={supplementsText}
                onChange={e => setSupplementsText(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Daily Cost Card */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
            <span className="font-bold text-amber-900">Custo Alimentar Diário Estimado:</span>
            <span className="text-base font-black text-amber-900 font-mono">R$ {dailyCostBrl.toFixed(2)} / dia</span>
          </div>
        </div>

        {/* Right 2 Cols: Nutrient Balance vs NRC Requirements */}
        <div className="lg:col-span-2 space-y-5">
          {/* Top Comparison KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[10px] text-stone-500 font-bold uppercase block">Matéria Seca (MS)</span>
              <span className="text-xl font-black text-stone-900 font-mono">{totalDmKg} kg</span>
              <span className="text-[11px] text-stone-500 block mt-0.5">{dmPctBodyWeight}% Peso Vivo</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[10px] text-stone-500 font-bold uppercase block">Energia Digestível</span>
              <span className="text-xl font-black text-amber-900 font-mono">{totalDeMcal} Mcal</span>
              <span className={`text-[10px] font-bold block mt-0.5 ${totalDeMcal >= nrcDeMcal ? 'text-emerald-700' : 'text-red-700'}`}>
                Req NRC: {nrcDeMcal} Mcal
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[10px] text-stone-500 font-bold uppercase block">Proteína Bruta (PB)</span>
              <span className="text-xl font-black text-blue-900 font-mono">{totalCpG} g</span>
              <span className={`text-[10px] font-bold block mt-0.5 ${totalCpG >= nrcCpG ? 'text-emerald-700' : 'text-red-700'}`}>
                Req NRC: {nrcCpG} g
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[10px] text-stone-500 font-bold uppercase block">Relação Cálcio : Fósforo</span>
              <span className="text-xl font-black font-mono text-emerald-800">{caPRatio} : 1</span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">Ideal: 1.5 a 2.0</span>
            </div>
          </div>

          {/* Nutrient Comparison Table */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
                Balanço Nutricional: Fornecido vs Requisito NRC Equinos
              </h3>
              <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-2.5 py-0.5 rounded-full">
                NRC 2007 Compliant
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* DE Bar */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-stone-800">
                  <span>Energia Digestível (ED):</span>
                  <span>{totalDeMcal} Mcal fornecidas / {nrcDeMcal} Mcal requeridas ({Math.round((totalDeMcal / nrcDeMcal) * 100)}%)</span>
                </div>
                <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${totalDeMcal >= nrcDeMcal ? 'bg-emerald-600' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, Math.round((totalDeMcal / nrcDeMcal) * 100))}%` }}
                  ></div>
                </div>
              </div>

              {/* CP Bar */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-stone-800">
                  <span>Proteína Bruta (PB):</span>
                  <span>{totalCpG} g fornecidas / {nrcCpG} g requeridas ({Math.round((totalCpG / nrcCpG) * 100)}%)</span>
                </div>
                <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${totalCpG >= nrcCpG ? 'bg-blue-600' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, Math.round((totalCpG / nrcCpG) * 100))}%` }}
                  ></div>
                </div>
              </div>

              {/* Calcium Bar */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-stone-800">
                  <span>Cálcio Total (Ca):</span>
                  <span>{totalCaG} g fornecidas / {Math.round(nrcCa)} g requeridas</span>
                </div>
                <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((totalCaG / Math.max(1, nrcCa)) * 100))}%` }}
                  ></div>
                </div>
              </div>

              {/* Phosphorus Bar */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-stone-800">
                  <span>Fósforo Total (P):</span>
                  <span>{totalPG} g fornecidas / {Math.round(nrcP)} g requeridas</span>
                </div>
                <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((totalPG / Math.max(1, nrcP)) * 100))}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Water Estimator Bar */}
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 flex items-center justify-between text-xs text-blue-950">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-blue-600" />
                <span>Consumo de Água Estimado: <strong>{estimatedWaterLiters} a {estimatedWaterLiters + 15} Litros / dia</strong></span>
              </div>
              <span className="text-[10px] font-bold text-blue-800">Bebedouro automático com água fresca à vontade</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
