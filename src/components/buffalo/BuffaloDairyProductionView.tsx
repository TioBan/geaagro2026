import React, { useState } from 'react';
import { BuffaloAnimal } from '../../types/buffalo';
import { calculateMozzarellaYieldLitersPerKg } from '../../data/buffaloData';
import {
  Milk,
  Award,
  Sparkles,
  TrendingUp,
  Droplets,
  Activity,
  Plus,
  Scale,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface BuffaloDairyProductionViewProps {
  animals: BuffaloAnimal[];
  onOpenDigitalTwin: (animalId: string) => void;
}

export const BuffaloDairyProductionView: React.FC<BuffaloDairyProductionViewProps> = ({
  animals,
  onOpenDigitalTwin
}) => {
  const lactatingCows = animals.filter(a => a.status === 'Em Lactação');

  // Cálculos Gerais
  const totalDailyMilk = lactatingCows.reduce((acc, a) => acc + (a.averageDailyMilkLiters || 0), 0);
  const avgMilkPerCow = lactatingCows.length > 0 ? totalDailyMilk / lactatingCows.length : 0;
  const avgFat = lactatingCows.length > 0 ? lactatingCows.reduce((acc, a) => acc + (a.averageFatPct || 7.8), 0) / lactatingCows.length : 7.8;
  const avgProtein = lactatingCows.length > 0 ? lactatingCows.reduce((acc, a) => acc + (a.averageProteinPct || 4.4), 0) / lactatingCows.length : 4.4;
  
  const mozzarellaLitersPerKg = calculateMozzarellaYieldLitersPerKg(avgFat, avgProtein);
  const dailyMozzarellaKg = mozzarellaLitersPerKg > 0 ? totalDailyMilk / mozzarellaLitersPerKg : 0;
  
  // Rendimento Queijo do Marajó Tipo Creme / Manteiga
  const marajoLitersPerKg = Number((mozzarellaLitersPerKg * 1.12).toFixed(2));
  const dailyMarajoKg = marajoLitersPerKg > 0 ? totalDailyMilk / marajoLitersPerKg : 0;

  // Preços Médios de Mercado BRL
  const priceMilkPerLiter = 4.80;
  const priceMozzarellaKg = 62.00;
  const dailyRevenueMilk = totalDailyMilk * priceMilkPerLiter;
  const dailyRevenueMozzarella = dailyMozzarellaKg * priceMozzarellaKg;

  // Simulador de Rendimento Queijeiro
  const [simFat, setSimFat] = useState(7.8);
  const [simProtein, setSimProtein] = useState(4.4);
  const [simLiters, setSimLiters] = useState(500);

  const simYieldLitersPerKg = calculateMozzarellaYieldLitersPerKg(simFat, simProtein);
  const simTotalMozzarellaKg = Number((simLiters / simYieldLitersPerKg).toFixed(1));

  return (
    <div className="space-y-6">
      {/* Top Banner com Métricas de Leite & Queijaria */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Produção Diária do Rebanho</span>
          <div className="text-3xl font-black text-blue-600">
            {totalDailyMilk.toFixed(1)} <span className="text-sm font-bold text-slate-500">L/dia</span>
          </div>
          <span className="text-xs text-slate-500">Média: {avgMilkPerCow.toFixed(1)} L/vaca em lactação</span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Gordura &amp; Proteína Média</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {avgFat.toFixed(1)}% <span className="text-base text-slate-400 font-medium">/ {avgProtein.toFixed(1)}%</span>
          </div>
          <span className="text-xs text-teal-600 font-bold">Sólidos Totais: ~18.2% (Densidade Alta)</span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Produção de Mozzarella D.O.P.</span>
          <div className="text-3xl font-black text-emerald-600">
            {dailyMozzarellaKg.toFixed(1)} <span className="text-sm font-bold text-slate-500">kg/dia</span>
          </div>
          <span className="text-xs text-slate-500">Rendimento: <strong>{mozzarellaLitersPerKg} L por kg</strong></span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Faturamento Bruto Queijaria</span>
          <div className="text-3xl font-black text-teal-600">
            R$ {dailyRevenueMozzarella.toFixed(0)} <span className="text-sm font-bold text-slate-400">/dia</span>
          </div>
          <span className="text-xs text-emerald-600 font-semibold">Valor agregado superior ao leite fluido</span>
        </div>
      </div>

      {/* Simulador Interativo de Rendimento de Mozzarella */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 border border-blue-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-full text-xs font-bold uppercase">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Calculadora Industrial de Queijaria</span>
            </div>
            <h3 className="text-2xl font-black text-white">Simulador de Rendimento de Mozzarella &amp; Queijo Marajó</h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Fórmula de transformação láctea oficial baseada no teor de matéria gorda e caseínas da leite bubalino.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/70 border border-blue-500/40 rounded-2xl p-4 text-center min-w-[200px]">
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Mozzarella Produzida</span>
              <span className="text-3xl font-black text-blue-300">{simTotalMozzarellaKg} kg</span>
              <span className="text-[11px] text-emerald-400 font-bold block">{simYieldLitersPerKg} L de leite / kg</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex justify-between">
              <span>Volume de Leite:</span>
              <span className="text-blue-400 font-black">{simLiters} Litros</span>
            </label>
            <input
              type="range"
              min="50"
              max="3000"
              step="50"
              value={simLiters}
              onChange={(e) => setSimLiters(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex justify-between">
              <span>Teor de Gordura:</span>
              <span className="text-blue-400 font-black">{simFat}%</span>
            </label>
            <input
              type="range"
              min="6.0"
              max="10.0"
              step="0.1"
              value={simFat}
              onChange={(e) => setSimFat(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex justify-between">
              <span>Teor de Proteína:</span>
              <span className="text-blue-400 font-black">{simProtein}%</span>
            </label>
            <input
              type="range"
              min="3.8"
              max="5.5"
              step="0.1"
              value={simProtein}
              onChange={(e) => setSimProtein(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Tabela de Matrizes em Lactação e Produções Individuais */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
          Matrizes em Lactação &amp; Qualidade Individual
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-800 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Brinco / Matriz</th>
                <th className="p-3">Raça</th>
                <th className="p-3">Produção (L/dia)</th>
                <th className="p-3">Gordura (%)</th>
                <th className="p-3">Proteína (%)</th>
                <th className="p-3">Rendimento (L/kg Mozz.)</th>
                <th className="p-3">Lote</th>
                <th className="p-3">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {lactatingCows.map((cow) => {
                const yieldKg = calculateMozzarellaYieldLitersPerKg(cow.averageFatPct || 7.8, cow.averageProteinPct || 4.4);
                return (
                  <tr key={cow.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white">{cow.identificationNumber}</div>
                      <span className="text-[11px] text-slate-500">{cow.name}</span>
                    </td>
                    <td className="p-3 font-semibold">{cow.breed}</td>
                    <td className="p-3 font-black text-blue-600">{cow.averageDailyMilkLiters} L</td>
                    <td className="p-3 font-bold">{cow.averageFatPct}%</td>
                    <td className="p-3 font-bold">{cow.averageProteinPct}%</td>
                    <td className="p-3 font-black text-emerald-600">{yieldKg} L/kg</td>
                    <td className="p-3 text-slate-600 dark:text-zinc-300">{cow.batchName}</td>
                    <td className="p-3">
                      <button
                        onClick={() => onOpenDigitalTwin(cow.id)}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] rounded-lg cursor-pointer"
                      >
                        Controle Detalhado
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
