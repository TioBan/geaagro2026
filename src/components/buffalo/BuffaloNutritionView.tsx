import React, { useState } from 'react';
import { BuffaloAnimal, BuffaloFeedItem } from '../../types/buffalo';
import { BUFFALO_FEEDS } from '../../data/buffaloData';
import {
  Wheat,
  Scale,
  Sparkles,
  Award,
  TrendingUp,
  DollarSign,
  Activity,
  CheckCircle2,
  Layers3
} from 'lucide-react';

interface BuffaloNutritionViewProps {
  animals: BuffaloAnimal[];
}

export const BuffaloNutritionView: React.FC<BuffaloNutritionViewProps> = ({ animals }) => {
  const [targetCategory, setTargetCategory] = useState<'Matriz Alta Lactação (15L)' | 'Garrote Engorda Pasto' | 'Bezerro Desmame'>('Matriz Alta Lactação (15L)');
  const [animalWeightKg, setAnimalWeightKg] = useState(680);
  const [targetMilkLiters, setTargetMilkLiters] = useState(15);
  const [targetGmdKg, setTargetGmdKg] = useState(0.8);

  // Cálculos Nutricionais
  // Búfalos consomem cerca de 2.2% a 2.5% do Peso Vivo em Matéria Seca (CMS)
  const intakeRatePct = targetCategory === 'Matriz Alta Lactação (15L)' ? 2.5 : 2.2;
  const totalDryMatterKg = Number(((animalWeightKg * intakeRatePct) / 100).toFixed(2));
  
  // Requisitos Nutricionais Estimados
  const crudeProteinKgReq = targetCategory === 'Matriz Alta Lactação (15L)'
    ? Number((totalDryMatterKg * 0.145).toFixed(2)) // 14.5% PB
    : Number((totalDryMatterKg * 0.115).toFixed(2)); // 11.5% PB

  const tdnKgReq = Number((totalDryMatterKg * 0.64).toFixed(2)); // 64% NDT

  // Custo estimado diário da dieta (R$/cabeça/dia)
  const estimatedCostDayBRL = targetCategory === 'Matriz Alta Lactação (15L)' ? 12.80 : 5.40;
  const costPerLiterBRL = targetCategory === 'Matriz Alta Lactação (15L)' ? Number((estimatedCostDayBRL / targetMilkLiters).toFixed(2)) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner sobre a Eficiência Digestiva dos Búfalos */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-lime-950 border border-lime-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-lime-500/20 text-lime-300 border border-lime-500/40 rounded-full text-xs font-bold uppercase">
            <Sparkles className="w-3.5 h-3.5 text-lime-400" />
            <span>Fisiologia Digestiva Singular</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Nutrição de Precisão &amp; Eficiência Fibrolítica de Búfalos
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            O rúmen dos bubalinos possui uma população bacteriana celulolítica até <strong>30% mais ativa</strong> que a dos bovinos, permitindo converter forragens tropicais fibrosas (Capim Mombaça, Humidicola e Angola) em leite de alto teor de sólidos e ganho de peso a baixo custo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-center">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-lime-500/20">
            <span className="text-[10px] text-lime-400 font-bold uppercase block">Consumo MS (CMS)</span>
            <span className="text-xl font-black">{totalDryMatterKg} kg MS/dia</span>
            <span className="text-[10px] text-slate-400">{intakeRatePct}% do Peso Vivo</span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-lime-500/20">
            <span className="text-[10px] text-lime-400 font-bold uppercase block">Proteína Bruta (PB)</span>
            <span className="text-xl font-black">{crudeProteinKgReq} kg/dia</span>
            <span className="text-[10px] text-slate-400">14.5% da dieta MS</span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-lime-500/20">
            <span className="text-[10px] text-lime-400 font-bold uppercase block">NDT / Energia</span>
            <span className="text-xl font-black">{tdnKgReq} kg NDT</span>
            <span className="text-[10px] text-slate-400">64% digestibilidade</span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-lime-500/20">
            <span className="text-[10px] text-lime-400 font-bold uppercase block">Custo Alimentar</span>
            <span className="text-xl font-black text-emerald-300">R$ {costPerLiterBRL > 0 ? `${costPerLiterBRL} / L` : `${estimatedCostDayBRL}/dia`}</span>
            <span className="text-[10px] text-slate-400">Excelente margem IOFC</span>
          </div>
        </div>
      </div>

      {/* Tabela de Alimentos & Ingredientes Disponíveis */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
          Banco de Alimentos &amp; Ingredientes Específicos para Bubalinos
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-800 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Alimento / Forragem</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Matéria Seca (%)</th>
                <th className="p-3">Proteína Bruta (%)</th>
                <th className="p-3">NDT (%)</th>
                <th className="p-3">FDN (%)</th>
                <th className="p-3">Custo (R$/kg MN)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {BUFFALO_FEEDS.map((feed) => (
                <tr key={feed.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{feed.name}</td>
                  <td className="p-3 font-semibold text-teal-600">{feed.type}</td>
                  <td className="p-3 font-bold">{feed.dryMatterPct}%</td>
                  <td className="p-3 font-black text-lime-600">{feed.crudeProteinPct}%</td>
                  <td className="p-3 font-bold">{feed.totalDigestibleNutrientsPct}%</td>
                  <td className="p-3 text-slate-600 dark:text-zinc-300">{feed.neutralDetergentFiberPct}%</td>
                  <td className="p-3 font-bold text-emerald-600">R$ {feed.costPerKgNaturalBRL.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
