import React, { useState } from 'react';
import { BuffaloAnimal } from '../../types/buffalo';
import { calculateMozzarellaYieldLitersPerKg } from '../../data/buffaloData';
import {
  Activity,
  Milk,
  Beef,
  Scale,
  Calendar,
  ShieldCheck,
  Dna,
  HeartPulse,
  Thermometer,
  Award,
  Sparkles,
  Camera,
  Plus,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  Droplets,
  CheckCircle2
} from 'lucide-react';

interface BuffaloDigitalTwinViewProps {
  animals: BuffaloAnimal[];
  selectedAnimalId: string;
  onSelectAnimal: (id: string) => void;
  onBackToRegistry: () => void;
  onUpdateAnimal: (animal: BuffaloAnimal) => void;
}

export const BuffaloDigitalTwinView: React.FC<BuffaloDigitalTwinViewProps> = ({
  animals,
  selectedAnimalId,
  onSelectAnimal,
  onBackToRegistry,
  onUpdateAnimal
}) => {
  const animal = animals.find(a => a?.id === selectedAnimalId) || animals[0];

  const [activeSubTab, setActiveSubTab] = useState<'biometria' | 'leite' | 'peso_gmd' | 'reproducao' | 'sanidade' | 'fotos'>('biometria');
  
  // Modal de Adicionar Pesagem
  const [showWeighingModal, setShowWeighingModal] = useState(false);
  const [newWeightKg, setNewWeightKg] = useState(animal?.currentWeightKg || 650);
  const [newBcs, setNewBcs] = useState(animal?.bodyConditionScore || 3.5);

  // Modal de Adicionar Controle Leiteiro
  const [showMilkModal, setShowMilkModal] = useState(false);
  const [newMilkLiters, setNewMilkLiters] = useState(15.0);
  const [newFatPct, setNewFatPct] = useState(7.8);
  const [newProteinPct, setNewProteinPct] = useState(4.4);

  if (!animal) {
    return (
      <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
        <p className="text-slate-500">Nenhum animal selecionado para o Gêmeo Digital.</p>
        <button onClick={onBackToRegistry} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl font-bold text-xs">
          Voltar ao Cadastro
        </button>
      </div>
    );
  }

  const handleAddWeighing = (e: React.FormEvent) => {
    e.preventDefault();
    const lastWeight = (animal?.weighings && animal.weighings.length > 0) ? animal.weighings[animal.weighings.length - 1]?.weightKg : (animal?.currentWeightKg || 0);
    const diff = Number(newWeightKg) - lastWeight;
    const gmd = diff > 0 ? Number((diff / 30).toFixed(2)) : 0;

    const newEntry = {
      id: `w-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weightKg: Number(newWeightKg),
      bodyConditionScore: Number(newBcs),
      dailyGainKg: gmd
    };

    const updated: BuffaloAnimal = {
      ...animal,
      currentWeightKg: Number(newWeightKg),
      bodyConditionScore: Number(newBcs),
      weighings: [...animal.weighings, newEntry]
    };

    onUpdateAnimal(updated);
    setShowWeighingModal(false);
  };

  const handleAddMilk = (e: React.FormEvent) => {
    e.preventDefault();
    const yieldKg = calculateMozzarellaYieldLitersPerKg(Number(newFatPct), Number(newProteinPct));
    const estimatedMozzarella = Number((Number(newMilkLiters) / yieldKg).toFixed(2));

    const newRecord = {
      id: `m-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      milkingSession: 'Total do Dia' as const,
      productionLiters: Number(newMilkLiters),
      fatPercentage: Number(newFatPct),
      proteinPercentage: Number(newProteinPct),
      lactosePercentage: 4.9,
      totalSolidsPercentage: Number(newFatPct) + Number(newProteinPct) + 5.9,
      somaticCellCountThousands: 110,
      totalBacterialCountThousands: 15,
      cmtScore: 'Negativo' as const,
      estimatedMozzarellaYieldKg: estimatedMozzarella
    };

    const updated: BuffaloAnimal = {
      ...animal,
      averageDailyMilkLiters: Number(newMilkLiters),
      averageFatPct: Number(newFatPct),
      averageProteinPct: Number(newProteinPct),
      milkRecords: [...animal.milkRecords, newRecord]
    };

    onUpdateAnimal(updated);
    setShowMilkModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header com Seletor Rápido de Animal e Voltar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToRegistry}
            className="p-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl cursor-pointer transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 block">
              Gêmeo Digital do Búfalo 360°
            </span>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{animal.identificationNumber}</span>
              <span className="text-slate-400 font-normal">|</span>
              <span>{animal.name}</span>
            </h2>
          </div>
        </div>

        {/* Seletor Dropdown de Animais */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 whitespace-nowrap">Trocar Animal:</label>
          <select
            value={animal.id}
            onChange={(e) => onSelectAnimal(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 cursor-pointer"
          >
            {animals.map((a) => (
              <option key={a.id} value={a.id}>
                {a.identificationNumber} - {a.name} ({a.breed})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hero Card do Gêmeo Digital */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-teal-950 border border-teal-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          {/* Foto / Avatar e Identificadores */}
          <div className="flex items-center gap-4 lg:col-span-2">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-teal-950/80 border-2 border-teal-400/50 flex items-center justify-center shrink-0 overflow-hidden relative shadow-lg">
              {animal.photos && (animal.photos || []).length > 0 ? (
                <img src={animal.photos[0].url} alt={animal.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">🐃</span>
              )}
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-[9px] font-bold text-teal-300 rounded">
                RFID ON
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-full text-xs font-bold">
                  {animal.breed}
                </span>
                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-md">
                  {animal.bloodDegree}
                </span>
              </div>
              <h3 className="text-2xl font-black text-white">{animal.name}</h3>
              <p className="text-xs text-slate-300">
                Brinco: <strong>{animal.identificationNumber}</strong> • RFID: <span className="font-mono text-teal-300">{animal.rfidCode || 'N/D'}</span>
              </p>
              <p className="text-xs text-slate-400">
                Nascimento: {animal.birthDate} • Lote: <strong>{animal.batchName}</strong>
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-950/60 border border-teal-500/30 rounded-2xl text-center">
              <span className="text-[10px] text-teal-300 uppercase font-bold block">Peso &amp; ECC</span>
              <span className="text-xl font-black text-white">{animal.currentWeightKg} kg</span>
              <span className="text-[10px] text-slate-400 block">ECC {animal.bodyConditionScore}/5.0</span>
            </div>

            <div className="p-3.5 bg-slate-950/60 border border-teal-500/30 rounded-2xl text-center">
              <span className="text-[10px] text-emerald-300 uppercase font-bold block">Leite Diário</span>
              <span className="text-xl font-black text-emerald-300">
                {animal.averageDailyMilkLiters ? `${animal.averageDailyMilkLiters} L` : 'N/A'}
              </span>
              <span className="text-[10px] text-slate-400 block">{animal.averageFatPct || 7.8}% Gordura</span>
            </div>

            <div className="p-3.5 bg-slate-950/60 border border-teal-500/30 rounded-2xl text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] text-amber-300 uppercase font-bold block">Conforto Térmico</span>
              <span className="text-xl font-black text-amber-300">{animal.thermalComfortScore || 92}%</span>
              <span className="text-[10px] text-slate-400 block">Acesso Açude 01</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navegação do Gêmeo Digital */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveSubTab('biometria')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'biometria'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Biometria &amp; Genealogia</span>
        </button>

        <button
          onClick={() => setActiveSubTab('leite')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'leite'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-100'
          }`}
        >
          <Milk className="w-4 h-4" />
          <span>Lactação &amp; Mozzarella ({animal.milkRecords?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('peso_gmd')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'peso_gmd'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-100'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Pesagens &amp; GMD ({animal.weighings?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('reproducao')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'reproducao'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-100'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>Histórico Reprodutivo &amp; Partos ({animal.reproductionRecords?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sanidade')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'sanidade'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Passaporte Sanitário &amp; Vacinas ({animal.healthRecords?.length || 0})</span>
        </button>
      </div>

      {/* Conteúdo das Sub-Tabs */}

      {/* 1. Biometria & Genealogia */}
      {activeSubTab === 'biometria' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ficha Zootécnica Completa */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-600" />
              <span>Ficha Biométrica &amp; Identidade</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Número de Brinco</span>
                <span className="font-black text-slate-900 dark:text-white text-sm">{animal.identificationNumber}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Grau de Sangue</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">{animal.bloodDegree}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Pelagem</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">{animal.coatColor}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Aptidão / Finalidade</span>
                <span className="font-bold text-teal-600">{animal.purpose}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Peso ao Nascer</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">{animal.birthWeightKg || 38} kg</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Status Zootécnico</span>
                <span className="font-black text-emerald-600">{animal.status}</span>
              </div>
            </div>

            {animal.notes && (
              <div className="p-3.5 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 rounded-xl text-xs text-teal-900 dark:text-teal-200">
                <strong>Observações de Manejo:</strong> {animal.notes}
              </div>
            )}
          </div>

          {/* Pedigree & Linhagem */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Dna className="w-4 h-4 text-teal-600" />
              <span>Pedigree &amp; Genealogia de 3 Gerações</span>
            </h3>

            <div className="space-y-3">
              {/* Pai & Mãe */}
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700">
                <span className="text-[10px] font-black uppercase text-teal-600 block">Pai (Sire)</span>
                <span className="font-bold text-xs text-slate-900 dark:text-white">{animal.sireName || 'Touro Murrah Importado'}</span>
                {animal.paternalGrandsire && (
                  <span className="text-[10px] text-slate-500 block mt-0.5">Avô Paterno: {animal.paternalGrandsire}</span>
                )}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700">
                <span className="text-[10px] font-black uppercase text-emerald-600 block">Mãe (Dam)</span>
                <span className="font-bold text-xs text-slate-900 dark:text-white">{animal.damName || 'Matriz Elite do Pantanal'}</span>
                {animal.maternalGrandsire && (
                  <span className="text-[10px] text-slate-500 block mt-0.5">Avô Materno: {animal.maternalGrandsire}</span>
                )}
              </div>

              {animal.geneticLineage && (
                <div className="p-3 bg-slate-100 dark:bg-zinc-800 rounded-xl text-xs text-slate-700 dark:text-zinc-300">
                  <span className="font-bold block text-slate-900 dark:text-white">Linhagem Genética:</span>
                  {animal.geneticLineage}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Lactação & Mozzarella */}
      {activeSubTab === 'leite' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Milk className="w-4 h-4 text-blue-600" />
                <span>Histórico de Controles Leiteiros &amp; Qualidade</span>
              </h3>
              <p className="text-xs text-slate-500">Rendimento de Mozzarella D.O.P. e Parâmetros Físico-Químicos</p>
            </div>
            <button
              onClick={() => setShowMilkModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Ordenha</span>
            </button>
          </div>

          {/* Cards de Resumo da Lactação */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-200/50">
              <span className="text-[10px] text-blue-600 font-bold uppercase block">Média Diária</span>
              <span className="text-xl font-black text-blue-900 dark:text-blue-200">{animal.averageDailyMilkLiters || 14.8} L</span>
            </div>
            <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-200/50">
              <span className="text-[10px] text-blue-600 font-bold uppercase block">Teor de Gordura</span>
              <span className="text-xl font-black text-blue-900 dark:text-blue-200">{animal.averageFatPct || 7.8}%</span>
            </div>
            <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-200/50">
              <span className="text-[10px] text-blue-600 font-bold uppercase block">Teor de Proteína</span>
              <span className="text-xl font-black text-blue-900 dark:text-blue-200">{animal.averageProteinPct || 4.4}%</span>
            </div>
            <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-200/50">
              <span className="text-[10px] text-blue-600 font-bold uppercase block">Rendimento Queijeiro</span>
              <span className="text-xl font-black text-blue-900 dark:text-blue-200">
                {calculateMozzarellaYieldLitersPerKg(animal.averageFatPct || 7.8, animal.averageProteinPct || 4.4)} L/kg
              </span>
            </div>
          </div>

          {/* Tabela de Controles Leiteiros */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-800 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Data</th>
                  <th className="p-3">Sessão</th>
                  <th className="p-3">Produção (L)</th>
                  <th className="p-3">Gordura (%)</th>
                  <th className="p-3">Proteína (%)</th>
                  <th className="p-3">Sólidos Totais (%)</th>
                  <th className="p-3">CCS (mil/mL)</th>
                  <th className="p-3">Mozzarella Estimada (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {animal.milkRecords.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{m.date}</td>
                    <td className="p-3">{m.milkingSession}</td>
                    <td className="p-3 font-black text-blue-600">{m.productionLiters} L</td>
                    <td className="p-3 font-bold">{m.fatPercentage}%</td>
                    <td className="p-3 font-bold">{m.proteinPercentage}%</td>
                    <td className="p-3">{m.totalSolidsPercentage}%</td>
                    <td className="p-3 font-semibold text-emerald-600">{m.somaticCellCountThousands}</td>
                    <td className="p-3 font-black text-slate-900 dark:text-white">{m.estimatedMozzarellaYieldKg} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Pesagens & GMD */}
      {activeSubTab === 'peso_gmd' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-teal-600" />
                <span>Histórico de Pesagens &amp; Ganho Médio Diário (GMD)</span>
              </h3>
              <p className="text-xs text-slate-500">Monitoramento da curva de crescimento e terminação</p>
            </div>
            <button
              onClick={() => setShowWeighingModal(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Pesagem</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-800 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Data</th>
                  <th className="p-3">Peso Registrado (kg)</th>
                  <th className="p-3">Escore Corporal (ECC)</th>
                  <th className="p-3">Ganho Médio Diário (GMD)</th>
                  <th className="p-3">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {animal.weighings.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{w.date}</td>
                    <td className="p-3 font-black text-teal-600">{w.weightKg} kg</td>
                    <td className="p-3 font-semibold">{w.bodyConditionScore || 3.5} / 5.0</td>
                    <td className="p-3 font-bold text-emerald-600">
                      {w.dailyGainKg ? `+${w.dailyGainKg} kg/dia` : '-'}
                    </td>
                    <td className="p-3 text-slate-500">{w.notes || 'Pesagem de rotina no curral'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Histórico Reprodutivo */}
      {activeSubTab === 'reproducao' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-emerald-600" />
            <span>Linha do Tempo Reprodutiva</span>
          </h3>

          <div className="space-y-3">
            {animal.reproductionRecords.map((r) => (
              <div key={r.id} className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-slate-900 dark:text-white">{r.eventType}</span>
                    <span className="text-[11px] text-slate-500">em {r.date}</span>
                  </div>
                  {r.notes && <p className="text-xs text-slate-600 dark:text-zinc-300">{r.notes}</p>}
                  {r.dgResult && (
                    <span className="inline-block px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] rounded">
                      Resultado: {r.dgResult}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Passaporte Sanitário */}
      {activeSubTab === 'sanidade' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>Passaporte Sanitário &amp; Registro de Imunizações</span>
          </h3>

          <div className="space-y-3">
            {animal.healthRecords.map((h) => (
              <div key={h.id} className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-slate-900 dark:text-white">{h.productName}</span>
                    <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-bold text-[10px] rounded">
                      {h.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-300">
                    Dose: <strong>{h.dosage}</strong> ({h.route}) • Resp: {h.veterinarian}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg">
                  {h.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Nova Pesagem */}
      {showWeighingModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Registrar Nova Pesagem</h3>
            <form onSubmit={handleAddWeighing} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-slate-700 dark:text-zinc-300 block mb-1">Peso (kg) *</label>
                <input
                  type="number"
                  required
                  value={newWeightKg}
                  onChange={(e) => setNewWeightKg(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-slate-700 dark:text-zinc-300 block mb-1">Escore de Condição Corporal ECC (1-5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={newBcs}
                  onChange={(e) => setNewBcs(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWeighingModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Novo Controle Leiteiro */}
      {showMilkModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Registrar Controle Leiteiro</h3>
            <form onSubmit={handleAddMilk} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-slate-700 dark:text-zinc-300 block mb-1">Produção de Leite do Dia (Litros) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newMilkLiters}
                  onChange={(e) => setNewMilkLiters(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-zinc-300 block mb-1">Gordura (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFatPct}
                    onChange={(e) => setNewFatPct(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-zinc-300 block mb-1">Proteína (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newProteinPct}
                    onChange={(e) => setNewProteinPct(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMilkModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
