import React, { useState } from 'react';
import { BuffaloAnimal } from '../../types/buffalo';
import {
  Beef,
  Scale,
  TrendingUp,
  Award,
  Sparkles,
  Layers3,
  Calendar,
  CheckCircle2,
  Plus
} from 'lucide-react';

interface BuffaloBeefProductionViewProps {
  animals: BuffaloAnimal[];
  onOpenDigitalTwin: (animalId: string) => void;
}

export const BuffaloBeefProductionView: React.FC<BuffaloBeefProductionViewProps> = ({
  animals,
  onOpenDigitalTwin
}) => {
  const beefAnimals = animals.filter(a => a.purpose === 'Corte' || a.category.includes('Engorda') || a.category.includes('Terminação') || a.category.includes('Recria'));
  
  const avgWeight = beefAnimals.length > 0 ? Math.round(beefAnimals.reduce((acc, a) => acc + a.currentWeightKg, 0) / beefAnimals.length) : 480;
  const avgGmd = 0.78; // kg/dia médio
  const carcassYieldPct = 51.5; // % rendimento de carcaça
  const priceArrobaBRL = 310.0; // R$ / @

  return (
    <div className="space-y-6">
      {/* Top Banner de Métricas de Carne */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Animais em Recria / Engorda</span>
          <div className="text-3xl font-black text-rose-600">{beefAnimals.length}</div>
          <span className="text-xs text-slate-500">Peso médio: <strong>{avgWeight} kg</strong></span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Ganho Médio Diário (GMD)</span>
          <div className="text-3xl font-black text-emerald-600">{avgGmd} <span className="text-sm font-bold text-slate-400">kg/dia</span></div>
          <span className="text-xs text-teal-600 font-bold">Pasto Mombaça + Suplemento Proteico</span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Rendimento de Carcaça</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{carcassYieldPct}%</div>
          <span className="text-xs text-slate-500">Gordura branca, menor colesterol</span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Cotação da @ do Búfalo</span>
          <div className="text-3xl font-black text-teal-600">R$ {priceArrobaBRL.toFixed(2)}</div>
          <span className="text-xs text-emerald-600 font-semibold">Valorização por carne saudável</span>
        </div>
      </div>

      {/* Diferenciais da Carne de Búfalo */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-rose-950 border border-rose-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full text-xs font-bold uppercase">
            <Award className="w-3.5 h-3.5 text-rose-400" />
            <span>Perfil Nutricional Superior da Carne Bubalina</span>
          </div>
          <h3 className="text-2xl font-black">Por que a Carne de Búfalo se Destaca no Mercado Gourmet?</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-rose-500/30 text-center space-y-1">
            <span className="text-3xl font-black text-emerald-400">-40%</span>
            <span className="text-xs font-bold text-slate-300 block">Menos Colesterol</span>
            <p className="text-[11px] text-slate-400">Gordura predominantemente branca e periférica (fácil remoção).</p>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-2xl border border-rose-500/30 text-center space-y-1">
            <span className="text-3xl font-black text-rose-400">-55%</span>
            <span className="text-xs font-bold text-slate-300 block">Menos Calorias</span>
            <p className="text-[11px] text-slate-400">Carne altamente proteica e com baixos teores de lipídios intramusculares.</p>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-2xl border border-rose-500/30 text-center space-y-1">
            <span className="text-3xl font-black text-amber-400">+10%</span>
            <span className="text-xs font-bold text-slate-300 block">Mais Minerais &amp; Ferro</span>
            <p className="text-[11px] text-slate-400">Excelente retenção de ferro e fósforo em pastagens tropicais.</p>
          </div>
        </div>
      </div>

      {/* Lista de Lotes de Corte & Pesagens */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
          Animais em Engorda &amp; Terminação
        </h4>

        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
          {beefAnimals.map((animal) => {
            const arrobas = Number((animal.currentWeightKg * (carcassYieldPct / 100) / 15).toFixed(1));
            const estimatedValueBRL = Number((arrobas * priceArrobaBRL).toFixed(2));
            return (
              <div key={animal.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900 dark:text-white">{animal.identificationNumber}</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">{animal.name}</span>
                    <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold text-[10px] rounded">
                      {animal.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Peso Vivo: <strong>{animal.currentWeightKg} kg</strong> (ECC {animal.bodyConditionScore}) • Equivalente: <strong>{arrobas} @</strong>
                  </p>
                  <span className="text-[11px] text-teal-600 font-semibold block">
                    Valor Estimado de Carcaça: R$ {estimatedValueBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <button
                  onClick={() => onOpenDigitalTwin(animal.id)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-700 dark:text-zinc-300 hover:text-rose-600 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Ver Curva de Ganho
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
