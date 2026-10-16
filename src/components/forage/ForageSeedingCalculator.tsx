import React, { useState } from 'react';
import { FORAGES_CATALOG } from '../../data/foragesCatalogData';
import { Calculator, Sparkles, Scale, DollarSign, Sprout, ArrowRight, Layers, HelpCircle } from 'lucide-react';

export const ForageSeedingCalculator: React.FC = () => {
  const [selectedForageId, setSelectedForageId] = useState<string>(FORAGES_CATALOG[0].id);
  const [plantingMethod, setPlantingMethod] = useState<'broadcast' | 'drill' | 'aerial' | 'ilpf'>('broadcast');
  const [areaHa, setAreaHa] = useState<number>(20);
  const [culturalValueVC, setCulturalValueVC] = useState<number>(76); // VC% do lote comercial
  const [seedPricePerKg, setSeedPricePerKg] = useState<number>(35); // R$/kg

  const selectedForage = FORAGES_CATALOG.find(f => f.id === selectedForageId) || FORAGES_CATALOG[0];

  // Calculation formulas:
  // Taxa de semeadura (kg/ha) = (Pontos de VC recomendados) / (% VC da semente)
  const basePointsVC = selectedForage.seeding.pureLiveSeedPointsVC || 300;

  let methodFactor = 1.0;
  if (plantingMethod === 'drill') methodFactor = 0.75; // Em linha exige ~25% menos semente
  if (plantingMethod === 'aerial') methodFactor = 1.25; // Aérea exige ~25% a mais
  if (plantingMethod === 'ilpf') methodFactor = 0.50; // Consórcio safrinha usa dose reduzida

  const calculatedKgPerHa = Math.max(1, Math.round(((basePointsVC * methodFactor) / Math.max(10, culturalValueVC)) * 10) / 10);
  const totalKgNeeded = Math.round(calculatedKgPerHa * areaHa);
  const totalCost = Math.round(totalKgNeeded * seedPricePerKg);
  const costPerHa = Math.round(calculatedKgPerHa * seedPricePerKg);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-zinc-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Calculadora de Taxa de Semeadura & Valor Cultural (VC%)
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Cálculo agronômico oficial: <strong>kg/ha = Pontos de VC &divide; % VC do Lote</strong> com ajuste de método de plantio.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Forage Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              Forrageira Selecionada:
            </label>
            <select
              value={selectedForageId}
              onChange={e => setSelectedForageId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-emerald-500"
            >
              {FORAGES_CATALOG.map(f => (
                <option key={f.id} value={f.id}>
                  {f.commonName}
                </option>
              ))}
            </select>
          </div>

          {/* Planting Method */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              Método de Semeadura:
            </label>
            <select
              value={plantingMethod}
              onChange={e => setPlantingMethod(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-emerald-500"
            >
              <option value="broadcast">A Lanço com Incorporação (Grade niveladora)</option>
              <option value="drill">Em Linha com Semeadora / Plantadeira</option>
              <option value="aerial">Semeadura Aérea (Avião / Drone)</option>
              <option value="ilpf">Consórcio ILPF / Safrinha com Milho</option>
            </select>
          </div>

          {/* Area Ha */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              Área de Plantio (Hectares):
            </label>
            <input
              type="number"
              min="0.1"
              step="0.5"
              value={areaHa}
              onChange={e => setAreaHa(Math.max(0.1, parseFloat(e.target.value) || 1))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-emerald-500"
            />
          </div>

          {/* Cultural Value VC% */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              Valor Cultural da Semente (% VC):
            </label>
            <input
              type="number"
              min="10"
              max="100"
              value={culturalValueVC}
              onChange={e => setCulturalValueVC(Math.max(10, Math.min(100, parseFloat(e.target.value) || 50)))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-emerald-500"
            />
          </div>
        </div>

        {/* Seed Price / kg */}
        <div className="max-w-xs space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
            Preço Estimado da Semente (R$/kg):
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">R$</span>
            <input
              type="number"
              min="0"
              step="1"
              value={seedPricePerKg}
              onChange={e => setSeedPricePerKg(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Calculated Results Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-950/40 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase block">
            Taxa de Semeadura Recomendada
          </span>
          <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400 my-1 block">
            {calculatedKgPerHa} <span className="text-sm font-normal">kg/ha</span>
          </span>
          <span className="text-[10px] text-slate-500 dark:text-zinc-400">
            Pontos de VC base: {basePointsVC}
          </span>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/40 p-5 rounded-2xl border border-blue-200 dark:border-blue-800 shadow-xs">
          <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase block">
            Volume Total de Sementes
          </span>
          <span className="text-3xl font-black text-blue-700 dark:text-blue-400 my-1 block">
            {totalKgNeeded.toLocaleString()} <span className="text-sm font-normal">kg</span>
          </span>
          <span className="text-[10px] text-slate-500 dark:text-zinc-400">
            Equivale a {Math.ceil(totalKgNeeded / 20)} sacas de 20 kg
          </span>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/40 p-5 rounded-2xl border border-purple-200 dark:border-purple-800 shadow-xs">
          <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300 uppercase block">
            Custo por Hectare
          </span>
          <span className="text-3xl font-black text-purple-700 dark:text-purple-400 my-1 block">
            R$ {costPerHa.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-zinc-400">
            Com semente a R$ {seedPricePerKg}/kg
          </span>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/40 p-5 rounded-2xl border border-amber-200 dark:border-amber-800 shadow-xs">
          <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase block">
            Investimento Total em Sementes
          </span>
          <span className="text-3xl font-black text-amber-700 dark:text-amber-400 my-1 block">
            R$ {totalCost.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-zinc-400">
            Para área total de {areaHa} ha
          </span>
        </div>
      </div>

      {/* Practical Planting Rules */}
      <div className="bg-slate-50 dark:bg-zinc-800/40 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3">
        <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Sprout className="w-4 h-4 text-emerald-600" />
          Recomendações Práticas de Calibração & Profundidade
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
            <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
              Profundidade de Incorporação:
            </span>
            <p className="text-slate-700 dark:text-zinc-300">
              Semear a <strong>{selectedForage.seeding.seedPlantingDepthCm.min} a {selectedForage.seeding.seedPlantingDepthCm.max} cm</strong>. Sementes miúdas (como Panicuns) não devem ser enterradas a mais de 2 cm sob risco de asfixia e falhas na germinação.
            </p>
          </div>

          <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
            <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
              Adubação Fosfatada no Plantio:
            </span>
            <p className="text-slate-700 dark:text-zinc-300">
              {selectedForage.fertilization.establishmentFertilizerNPK}. O contato direto da semente com cloreto de potássio ou ureia pode queimar o embrião.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
