import React, { useState } from 'react';
import { ForageItem } from '../../types/forage';
import { FORAGES_CATALOG } from '../../data/foragesCatalogData';
import { getForagePhotoData } from '../../data/foragePhotosDatabase';
import {
  X,
  Scale,
  ArrowLeftRight,
  FlaskConical,
  Leaf,
  Layers,
  Sparkles,
  Droplets,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Info,
  Tractor,
  ShieldCheck,
  ChevronDown,
  Search,
  Printer,
  Compass,
  ArrowRight,
  Award,
} from 'lucide-react';

interface ForageSideBySideCompareModalProps {
  primaryForage: ForageItem;
  initialSecondaryForageId?: string;
  onClose: () => void;
  onSelectForageToView?: (forage: ForageItem) => void;
}

export const ForageSideBySideCompareModal: React.FC<ForageSideBySideCompareModalProps> = ({
  primaryForage,
  initialSecondaryForageId,
  onClose,
  onSelectForageToView,
}) => {
  // Find initial partner forage (defaults to a popular benchmark like Mombaça or Marandu if different from primary)
  const defaultSecondaryId =
    initialSecondaryForageId ||
    (primaryForage.id === 'marandu' ? 'mombaca' : 'marandu');

  const [forageAId, setForageAId] = useState<string>(primaryForage.id);
  const [forageBId, setForageBId] = useState<string>(
    defaultSecondaryId === primaryForage.id ? 'tanzania' : defaultSecondaryId
  );

  const [activeTab, setActiveTab] = useState<'solo_adubacao' | 'nutricao_bromatologia' | 'sintese_veredito' | 'manejo_fenologia'>('solo_adubacao');
  const [searchBQuery, setSearchBQuery] = useState<string>('');

  const forageA = FORAGES_CATALOG.find(f => f.id === forageAId) || primaryForage;
  const forageB = FORAGES_CATALOG.find(f => f.id === forageBId) || FORAGES_CATALOG[1];

  const photoDataA = getForagePhotoData(forageA.id);
  const photoDataB = getForagePhotoData(forageB.id);

  // Quick swap
  const handleSwap = () => {
    const temp = forageAId;
    setForageAId(forageBId);
    setForageBId(temp);
  };

  const filteredForagesForB = FORAGES_CATALOG.filter(
    f =>
      f.id !== forageAId &&
      (f.commonName.toLowerCase().includes(searchBQuery.toLowerCase()) ||
        f.cultivar.toLowerCase().includes(searchBQuery.toLowerCase()) ||
        f.scientificName.toLowerCase().includes(searchBQuery.toLowerCase()))
  );

  const handlePrint = () => {
    window.print();
  };

  // Helper for fertility color badge
  const getFertilityBadge = (fertility: string) => {
    switch (fertility) {
      case 'baixa':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">Baixa Fertilidade (Rústica)</span>;
      case 'media':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">Média Fertilidade</span>;
      case 'alta':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">Alta Fertilidade (Exigente)</span>;
      case 'muito_alta':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800">Muito Alta / Intensiva</span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">{fertility}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-[220] overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 print:p-0 print:bg-white">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-6xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden print:max-h-none print:border-none print:shadow-none">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between border-b border-emerald-900/50 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  COMPARAÇÃO LATERAL
                </span>
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  Comparador de Exigências Nutricionais & Solo
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                Análise direta lado a lado de adubação, saturação por bases (V%), bromatologia e aptidão zootécnica
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Imprimir Comparativo"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer"
              title="Fechar Comparador"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Forage Selector Cards (Lado A vs Lado B) */}
        <div className="bg-slate-100 dark:bg-zinc-800/90 p-4 border-b border-slate-200 dark:border-zinc-800 print:bg-white print:border-none">
          <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
            
            {/* Forrageira A (Coluna 1) */}
            <div className="md:col-span-5 bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-2xl border-2 border-emerald-500 shadow-sm flex items-center gap-3">
              <img
                src={photoDataA.primaryPhotoUrl}
                alt={forageA.commonName}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-emerald-400/40 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    FORRAGEIRA A
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 truncate italic">
                    {forageA.scientificName}
                  </span>
                </div>
                <h4 className="font-black text-base text-slate-900 dark:text-white truncate">
                  {forageA.commonName}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                    cv. {forageA.cultivar}
                  </span>
                  <select
                    value={forageAId}
                    onChange={e => setForageAId(e.target.value)}
                    className="text-xs bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold rounded-lg px-2 py-1 border border-slate-200 dark:border-zinc-700 cursor-pointer"
                  >
                    {FORAGES_CATALOG.map(f => (
                      <option key={f.id} value={f.id}>
                        Trocar A: {f.commonName} ({f.cultivar})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Swap Button Center */}
            <div className="md:col-span-1 flex justify-center">
              <button
                type="button"
                onClick={handleSwap}
                className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-md transition-all cursor-pointer flex items-center justify-center group"
                title="Inverter Forrageiras A e B"
              >
                <ArrowLeftRight className="w-5 h-5 transition-transform group-hover:rotate-180 duration-300" />
              </button>
            </div>

            {/* Forrageira B (Coluna 2) */}
            <div className="md:col-span-5 bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-2xl border-2 border-blue-500 shadow-sm flex items-center gap-3">
              <img
                src={photoDataB.primaryPhotoUrl}
                alt={forageB.commonName}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-blue-400/40 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    FORRAGEIRA B (COMPARATIVO)
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 truncate italic">
                    {forageB.scientificName}
                  </span>
                </div>
                <h4 className="font-black text-base text-slate-900 dark:text-white truncate">
                  {forageB.commonName}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-extrabold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800/60">
                    cv. {forageB.cultivar}
                  </span>
                  <select
                    value={forageBId}
                    onChange={e => setForageBId(e.target.value)}
                    className="text-xs bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold rounded-lg px-2 py-1 border border-slate-200 dark:border-zinc-700 cursor-pointer"
                  >
                    {FORAGES_CATALOG.map(f => (
                      <option key={f.id} value={f.id}>
                        Trocar B: {f.commonName} ({f.cultivar})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-50 dark:bg-zinc-800/60 px-4 py-2 border-b border-slate-200 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto scrollbar-thin print:hidden">
          <button
            type="button"
            onClick={() => setActiveTab('solo_adubacao')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'solo_adubacao'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            1. Exigências de Solo & Adubação (V%, N, P, K, pH)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('nutricao_bromatologia')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'nutricao_bromatologia'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            2. Exigências Nutricionais & Bromatologia (PB, DIVMS, NDT, FDN)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sintese_veredito')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'sintese_veredito'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            3. Síntese Comparativa & Veredito Agronômico
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manejo_fenologia')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'manejo_fenologia'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            4. Manejo Rotacionado & Fenologia
          </button>
        </div>

        {/* Scrollable Comparison Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: SOLO & ADUBAÇÃO */}
          {activeTab === 'solo_adubacao' && (
            <div className="space-y-6">
              
              {/* Highlight summary card */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
                <FlaskConical className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 dark:text-zinc-300 space-y-1">
                  <strong className="text-emerald-900 dark:text-emerald-300 block text-sm">
                    Comparativo Específico de Fertilidade, Calagem e Nutrição Mineral de Solo
                  </strong>
                  <p>
                    A saturação por bases alvo (V%) e a demanda de Fósforo (P) e Nitrogênio (N) determinam o investimento financeiro necessário na implantação e mantença anual de cada espécie.
                  </p>
                </div>
              </div>

              {/* Side-by-side Table for Soil & Fertilization */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-b border-slate-200 dark:border-zinc-700">
                      <th className="p-3.5 font-bold w-1/4">Parâmetro de Solo / Adubação</th>
                      <th className="p-3.5 font-black text-emerald-700 dark:text-emerald-400 w-3/8 border-l border-slate-200 dark:border-zinc-700">
                        {forageA.commonName} ({forageA.cultivar})
                      </th>
                      <th className="p-3.5 font-black text-blue-700 dark:text-blue-400 w-3/8 border-l border-slate-200 dark:border-zinc-700">
                        {forageB.commonName} ({forageB.cultivar})
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    
                    {/* Exigência de Fertilidade */}
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                      <td className="p-3.5 font-bold text-slate-600 dark:text-zinc-400">
                        Exigência de Fertilidade do Solo
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        {getFertilityBadge(forageA.soilAndClimate.fertilityRequirement)}
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        {getFertilityBadge(forageB.soilAndClimate.fertilityRequirement)}
                      </td>
                    </tr>

                    {/* Saturação por Bases Alvo (V%) */}
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 bg-slate-50/30 dark:bg-zinc-800/20">
                      <td className="p-3.5 font-bold text-slate-600 dark:text-zinc-400">
                        Saturação por Bases Alvo (V%)
                        <span className="block text-[10px] text-slate-400 font-normal">Meta de Calagem (V2)</span>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">
                              {forageA.fertilization.targetBaseSaturationPercent}%
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                              {forageA.fertilization.targetBaseSaturationPercent <= 45 ? 'Baixa calagem' : forageA.fertilization.targetBaseSaturationPercent <= 60 ? 'Média calagem' : 'Alta calagem'}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, forageA.fertilization.targetBaseSaturationPercent)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-blue-700 dark:text-blue-400 text-sm">
                              {forageB.fertilization.targetBaseSaturationPercent}%
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                              {forageB.fertilization.targetBaseSaturationPercent <= 45 ? 'Baixa calagem' : forageB.fertilization.targetBaseSaturationPercent <= 60 ? 'Média calagem' : 'Alta calagem'}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-500 h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, forageB.fertilization.targetBaseSaturationPercent)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* Faixa de pH Recomendada */}
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                      <td className="p-3.5 font-bold text-slate-600 dark:text-zinc-400">
                        Faixa de pH do Solo (H₂O / CaCl₂)
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        <span className="font-bold text-slate-800 dark:text-zinc-200">
                          {forageA.soilAndClimate.phRange.min.toFixed(1)} - {forageA.soilAndClimate.phRange.max.toFixed(1)}
                        </span>{' '}
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-extrabold">
                          (Ideal: {forageA.soilAndClimate.phRange.ideal.toFixed(1)})
                        </span>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        <span className="font-bold text-slate-800 dark:text-zinc-200">
                          {forageB.soilAndClimate.phRange.min.toFixed(1)} - {forageB.soilAndClimate.phRange.max.toFixed(1)}
                        </span>{' '}
                        <span className="text-[11px] text-blue-600 dark:text-blue-400 font-extrabold">
                          (Ideal: {forageB.soilAndClimate.phRange.ideal.toFixed(1)})
                        </span>
                      </td>
                    </tr>

                    {/* Fósforo (P) e Potássio (K) */}
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 bg-slate-50/30 dark:bg-zinc-800/20">
                      <td className="p-3.5 font-bold text-slate-600 dark:text-zinc-400">
                        Fósforo Mínimo (P Mehlich-1) & Potássio (K)
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800 text-slate-800 dark:text-zinc-200">
                        <div className="space-y-0.5">
                          <div><strong>P Mehlich-1:</strong> &ge; {forageA.fertilization.minPhosphorusP_mg_dm3} mg/dm³</div>
                          <div><strong>K no solo:</strong> &ge; {forageA.fertilization.potassiumK_cmolc_dm3} cmolc/dm³</div>
                        </div>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800 text-slate-800 dark:text-zinc-200">
                        <div className="space-y-0.5">
                          <div><strong>P Mehlich-1:</strong> &ge; {forageB.fertilization.minPhosphorusP_mg_dm3} mg/dm³</div>
                          <div><strong>K no solo:</strong> &ge; {forageB.fertilization.potassiumK_cmolc_dm3} cmolc/dm³</div>
                        </div>
                      </td>
                    </tr>

                    {/* Adubação Nitrogenada (kg N/ha/ano) */}
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                      <td className="p-3.5 font-bold text-slate-600 dark:text-zinc-400">
                        Adubação com Nitrogênio (N)
                        <span className="block text-[10px] text-slate-400 font-normal">Mantença vs Intensivo</span>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        <div className="font-bold text-slate-800 dark:text-zinc-200">
                          {forageA.fertilization.nitrogenN_kg_ha_year_range.maintenance} a {forageA.fertilization.nitrogenN_kg_ha_year_range.intensive} kg N/ha/ano
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {forageA.fertilization.nitrogenN_kg_ha_year_range.intensive > 200 ? 'Alta resposta a N' : 'Resposta moderada a N'}
                        </span>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        <div className="font-bold text-slate-800 dark:text-zinc-200">
                          {forageB.fertilization.nitrogenN_kg_ha_year_range.maintenance} a {forageB.fertilization.nitrogenN_kg_ha_year_range.intensive} kg N/ha/ano
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {forageB.fertilization.nitrogenN_kg_ha_year_range.intensive > 200 ? 'Alta resposta a N' : 'Resposta moderada a N'}
                        </span>
                      </td>
                    </tr>

                    {/* Tolerância a Alumínio Tóxico */}
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 bg-slate-50/30 dark:bg-zinc-800/20">
                      <td className="p-3.5 font-bold text-slate-600 dark:text-zinc-400">
                        Tolerância a Alumínio Tóxico (Al³⁺)
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          forageA.soilAndClimate.aluminumTolerance === 'Alta Tolerância'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : forageA.soilAndClimate.aluminumTolerance === 'Moderadamente Tolerante'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {forageA.soilAndClimate.aluminumTolerance}
                        </span>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          forageB.soilAndClimate.aluminumTolerance === 'Alta Tolerância'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : forageB.soilAndClimate.aluminumTolerance === 'Moderadamente Tolerante'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {forageB.soilAndClimate.aluminumTolerance}
                        </span>
                      </td>
                    </tr>

                    {/* Drenagem & Encharcamento */}
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                      <td className="p-3.5 font-bold text-slate-600 dark:text-zinc-400">
                        Encharcamento & Várzeas Úmidas
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        <div className="font-semibold text-slate-800 dark:text-zinc-200">
                          {forageA.soilAndClimate.waterloggingTolerance}
                        </div>
                        <span className="text-[10px] text-slate-500 capitalize">
                          Drenagem: {forageA.soilAndClimate.drainageRequirement.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        <div className="font-semibold text-slate-800 dark:text-zinc-200">
                          {forageB.soilAndClimate.waterloggingTolerance}
                        </div>
                        <span className="text-[10px] text-slate-500 capitalize">
                          Drenagem: {forageB.soilAndClimate.drainageRequirement.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>

                    {/* Texturas de Solo Aptas */}
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 bg-slate-50/30 dark:bg-zinc-800/20">
                      <td className="p-3.5 font-bold text-slate-600 dark:text-zinc-400">
                        Textura de Solo Recomendada
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        <div className="flex flex-wrap gap-1">
                          {forageA.soilAndClimate.soilTextureRecommendation.map((t, idx) => (
                            <span key={idx} className="bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[11px] text-slate-700 dark:text-zinc-300">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        <div className="flex flex-wrap gap-1">
                          {forageB.soilAndClimate.soilTextureRecommendation.map((t, idx) => (
                            <span key={idx} className="bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[11px] text-slate-700 dark:text-zinc-300">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>

                    {/* Precipitação Pluviométrica */}
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                      <td className="p-3.5 font-bold text-slate-600 dark:text-zinc-400">
                        Chuva Anual Necessária (mm/ano)
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800 text-slate-800 dark:text-zinc-200">
                        <strong>{forageA.soilAndClimate.annualRainfallMmRange.min} a {forageA.soilAndClimate.annualRainfallMmRange.max} mm</strong>{' '}
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400">(Ideal: {forageA.soilAndClimate.annualRainfallMmRange.ideal} mm)</span>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800 text-slate-800 dark:text-zinc-200">
                        <strong>{forageB.soilAndClimate.annualRainfallMmRange.min} a {forageB.soilAndClimate.annualRainfallMmRange.max} mm</strong>{' '}
                        <span className="text-[10px] text-blue-600 dark:text-blue-400">(Ideal: {forageB.soilAndClimate.annualRainfallMmRange.ideal} mm)</span>
                      </td>
                    </tr>

                    {/* Adubação de Implantação e Calagem Resumo */}
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 bg-slate-50/30 dark:bg-zinc-800/20">
                      <td className="p-3.5 font-bold text-slate-600 dark:text-zinc-400">
                        Diretriz de Implantação & Calagem
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px] leading-relaxed">
                        <p className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">{forageA.fertilization.limingRecommendation}</p>
                        <p>{forageA.fertilization.establishmentFertilizerNPK}</p>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px] leading-relaxed">
                        <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1">{forageB.fertilization.limingRecommendation}</p>
                        <p>{forageB.fertilization.establishmentFertilizerNPK}</p>
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 2: EXIGÊNCIAS NUTRICIONAIS & BROMATOLOGIA */}
          {activeTab === 'nutricao_bromatologia' && (
            <div className="space-y-6">

              {/* Highlight summary card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 rounded-2xl border border-blue-200 dark:border-blue-800 flex items-start gap-3">
                <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 dark:text-zinc-300 space-y-1">
                  <strong className="text-blue-900 dark:text-blue-300 block text-sm">
                    Comparativo Nutricional, Proteico e Digestibilidade Ruminal
                  </strong>
                  <p>
                    Avaliação da densidade de Proteína Bruta (PB%), Nutrientes Digestíveis Totais (NDT%), Fibra (FDN/FDA) e aptidão para categorias animais de alta ou moderada exigência zootécnica.
                  </p>
                </div>
              </div>

              {/* Side-by-side Table for Nutrition & Bromatology */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-b border-slate-200 dark:border-zinc-700">
                      <th className="p-3.5 font-bold w-1/4">Indicador Nutricional</th>
                      <th className="p-3.5 font-black text-emerald-700 dark:text-emerald-400 w-3/8 border-l border-slate-200 dark:border-zinc-700">
                        {forageA.commonName} ({forageA.cultivar})
                      </th>
                      <th className="p-3.5 font-black text-blue-700 dark:text-blue-400 w-3/8 border-l border-slate-200 dark:border-zinc-700">
                        {forageB.commonName} ({forageB.cultivar})
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">

                    {/* Proteína Bruta (PB %) */}
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                      <td className="p-3.5 font-bold text-slate-600 dark:text-zinc-400">
                        Proteína Bruta (PB %)
                        <span className="block text-[10px] text-slate-400 font-normal">Fase Vegetativa de Entrada</span>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-base font-black text-emerald-700 dark:text-emerald-400">
                              {forageA.bromatology.crudeProteinPercent.average}%
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                              Faixa: {forageA.bromatology.crudeProteinPercent.min}% - {forageA.bromatology.crudeProteinPercent.max}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, (forageA.bromatology.crudeProteinPercent.average / 25) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-base font-black text-blue-700 dark:text-blue-400">
                              {forageB.bromatology.crudeProteinPercent.average}%
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                              Faixa: {forageB.bromatology.crudeProteinPercent.min}% - {forageB.bromatology.crudeProteinPercent.max}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-500 h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, (forageB.bromatology.crudeProteinPercent.average / 25) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* Digestibilidade DIVMS (%) */}
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 bg-slate-50/30 dark:bg-zinc-800/20">
                      <td className="p-3.5 font-bold text-slate-600 dark:text-zinc-400">
                        Digestibilidade In Vitro (DIVMS %)
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-base font-black text-emerald-700 dark:text-emerald-400">
                              {forageA.bromatology.inVitroDryMatterDigestibilityPercent.average}%
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                              Faixa: {forageA.bromatology.inVitroDryMatterDigestibilityPercent.min}% - {forageA.bromatology.inVitroDryMatterDigestibilityPercent.max}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, forageA.bromatology.inVitroDryMatterDigestibilityPercent.average)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-base font-black text-blue-700 dark:text-blue-400">
                              {forageB.bromatology.inVitroDryMatterDigestibilityPercent.average}%
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                              Faixa: {forageB.bromatology.inVitroDryMatterDigestibilityPercent.min}% - {forageB.bromatology.inVitroDryMatterDigestibilityPercent.max}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-500 h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, forageB.bromatology.inVitroDryMatterDigestibilityPercent.average)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* NDT (Nutrientes Digestíveis Totais %) */}
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                      <td className="p-3.5 font-bold text-slate-600 dark:text-zinc-400">
                        Energia / NDT Estimado (%)
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {forageA.bromatology.totalDigestibleNutrientsPercent.average}%
                        </span>{' '}
                        <span className="text-[11px] text-slate-500">
                          ({forageA.bromatology.totalDigestibleNutrientsPercent.min}% a {forageA.bromatology.totalDigestibleNutrientsPercent.max}%)
                        </span>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {forageB.bromatology.totalDigestibleNutrientsPercent.average}%
                        </span>{' '}
                        <span className="text-[11px] text-slate-500">
                          ({forageB.bromatology.totalDigestibleNutrientsPercent.min}% a {forageB.bromatology.totalDigestibleNutrientsPercent.max}%)
                        </span>
                      </td>
                    </tr>

                    {/* FDN e FDA (Fibras) */}
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 bg-slate-50/30 dark:bg-zinc-800/20">
                      <td className="p-3.5 font-bold text-slate-600 dark:text-zinc-400">
                        Fibras (FDN & FDA)
                        <span className="block text-[10px] text-slate-400 font-normal">Impacto no consumo voluntário</span>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800 text-slate-800 dark:text-zinc-200">
                        <div><strong>FDN:</strong> {forageA.bromatology.neutralDetergentFiberPercent.average}% <span className="text-[10px] text-slate-400">({forageA.bromatology.neutralDetergentFiberPercent.min}-{forageA.bromatology.neutralDetergentFiberPercent.max}%)</span></div>
                        <div><strong>FDA:</strong> {forageA.bromatology.acidDetergentFiberPercent.average}% <span className="text-[10px] text-slate-400">({forageA.bromatology.acidDetergentFiberPercent.min}-{forageA.bromatology.acidDetergentFiberPercent.max}%)</span></div>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800 text-slate-800 dark:text-zinc-200">
                        <div><strong>FDN:</strong> {forageB.bromatology.neutralDetergentFiberPercent.average}% <span className="text-[10px] text-slate-400">({forageB.bromatology.neutralDetergentFiberPercent.min}-{forageB.bromatology.neutralDetergentFiberPercent.max}%)</span></div>
                        <div><strong>FDA:</strong> {forageB.bromatology.acidDetergentFiberPercent.average}% <span className="text-[10px] text-slate-400">({forageB.bromatology.acidDetergentFiberPercent.min}-{forageB.bromatology.acidDetergentFiberPercent.max}%)</span></div>
                      </td>
                    </tr>

                    {/* Produção de Matéria Seca (t MS/ha/ano) */}
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                      <td className="p-3.5 font-bold text-slate-600 dark:text-zinc-400">
                        Produção de Matéria Seca Anual
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        <span className="text-base font-black text-amber-700 dark:text-amber-400">
                          {forageA.dryMatterYieldTonHaYear.average} t MS/ha/ano
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          Potencial: {forageA.dryMatterYieldTonHaYear.min} a {forageA.dryMatterYieldTonHaYear.max} t/ha
                        </span>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        <span className="text-base font-black text-amber-700 dark:text-amber-400">
                          {forageB.dryMatterYieldTonHaYear.average} t MS/ha/ano
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          Potencial: {forageB.dryMatterYieldTonHaYear.min} a {forageB.dryMatterYieldTonHaYear.max} t/ha
                        </span>
                      </td>
                    </tr>

                    {/* Palatabilidade & Consumo Voluntário */}
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 bg-slate-50/30 dark:bg-zinc-800/20">
                      <td className="p-3.5 font-bold text-slate-600 dark:text-zinc-400">
                        Palatabilidade & Consumo
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {forageA.bromatology.palatabilityRating}
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
                          {forageA.bromatology.voluntaryIntakeNotes}
                        </p>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          {forageB.bromatology.palatabilityRating}
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
                          {forageB.bromatology.voluntaryIntakeNotes}
                        </p>
                      </td>
                    </tr>

                    {/* Categorias Animais Recomendadas */}
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                      <td className="p-3.5 font-bold text-slate-600 dark:text-zinc-400">
                        Aptidão por Categoria Animal
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        <div className="flex flex-wrap gap-1">
                          {forageA.strengthsAndWeaknesses.animalCategoriesRecommended.map((cat, idx) => (
                            <span key={idx} className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded text-[11px] font-semibold">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        <div className="flex flex-wrap gap-1">
                          {forageB.strengthsAndWeaknesses.animalCategoriesRecommended.map((cat, idx) => (
                            <span key={idx} className="bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 px-2 py-0.5 rounded text-[11px] font-semibold">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>

                    {/* Aptidão para Feno ou Silagem */}
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 bg-slate-50/30 dark:bg-zinc-800/20">
                      <td className="p-3.5 font-bold text-slate-600 dark:text-zinc-400">
                        Aptidão para Conservação (Feno/Silagem)
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px]">
                        {forageA.strengthsAndWeaknesses.hayOrSilageSuitability}
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px]">
                        {forageB.strengthsAndWeaknesses.hayOrSilageSuitability}
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: SÍNTESE COMPARATIVA & VEREDITO AGRONÔMICO */}
          {activeTab === 'sintese_veredito' && (
            <div className="space-y-6">

              {/* Head-to-head Quick Highlights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Forrageira A Profile Box */}
                <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border-2 border-emerald-500/40 rounded-3xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={photoDataA.primaryPhotoUrl}
                      alt={forageA.commonName}
                      className="w-12 h-12 rounded-xl object-cover border border-emerald-500"
                    />
                    <div>
                      <h4 className="font-black text-base text-emerald-950 dark:text-emerald-200">
                        {forageA.commonName} (cv. {forageA.cultivar})
                      </h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 italic">
                        {forageA.scientificName}
                      </p>
                    </div>
                  </div>

                  {/* Strengths */}
                  <div className="space-y-2">
                    <span className="text-xs font-black uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Principais Vantagens Agronômicas:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700 dark:text-zinc-300">
                      {forageA.strengthsAndWeaknesses.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="space-y-2 pt-2 border-t border-emerald-200 dark:border-emerald-800/60">
                    <span className="text-xs font-black uppercase text-rose-800 dark:text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                      Limitações & Pontos de Atenção:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700 dark:text-zinc-300">
                      {forageA.strengthsAndWeaknesses.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-slate-700 dark:text-zinc-300">
                    <strong>Indicação Técnica:</strong> {forageA.strengthsAndWeaknesses.agronomicIndication}
                  </div>
                </div>

                {/* Forrageira B Profile Box */}
                <div className="bg-blue-50/60 dark:bg-blue-950/20 border-2 border-blue-500/40 rounded-3xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={photoDataB.primaryPhotoUrl}
                      alt={forageB.commonName}
                      className="w-12 h-12 rounded-xl object-cover border border-blue-500"
                    />
                    <div>
                      <h4 className="font-black text-base text-blue-950 dark:text-blue-200">
                        {forageB.commonName} (cv. {forageB.cultivar})
                      </h4>
                      <p className="text-xs text-blue-700 dark:text-blue-400 italic">
                        {forageB.scientificName}
                      </p>
                    </div>
                  </div>

                  {/* Strengths */}
                  <div className="space-y-2">
                    <span className="text-xs font-black uppercase text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      Principais Vantagens Agronômicas:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700 dark:text-zinc-300">
                      {forageB.strengthsAndWeaknesses.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="space-y-2 pt-2 border-t border-blue-200 dark:border-blue-800/60">
                    <span className="text-xs font-black uppercase text-rose-800 dark:text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                      Limitações & Pontos de Atenção:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700 dark:text-zinc-300">
                      {forageB.strengthsAndWeaknesses.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-blue-200 dark:border-blue-800 text-xs text-slate-700 dark:text-zinc-300">
                    <strong>Indicação Técnica:</strong> {forageB.strengthsAndWeaknesses.agronomicIndication}
                  </div>
                </div>

              </div>

              {/* Direct Agronomic Decision Matrix */}
              <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-4 border border-slate-800">
                <div className="flex items-center gap-2 text-amber-400">
                  <Sparkles className="w-5 h-5" />
                  <h4 className="font-extrabold text-sm">
                    Matriz de Decisão Agronômica Rápida: Quando Escolher Qual?
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-emerald-500/30 space-y-2">
                    <span className="font-black text-emerald-400 text-sm block">
                      🌱 Escolha {forageA.commonName} se você busca:
                    </span>
                    <ul className="space-y-1.5 text-slate-300">
                      <li>• <strong>Solo:</strong> Saturação por bases de {forageA.fertilization.targetBaseSaturationPercent}% e demanda de {forageA.soilAndClimate.fertilityRequirement} fertilidade.</li>
                      <li>• <strong>Clima & Água:</strong> Suporta {forageA.soilAndClimate.waterloggingTolerance.toLowerCase()} e chuva de {forageA.soilAndClimate.annualRainfallMmRange.min} mm.</li>
                      <li>• <strong>Pecuária:</strong> Meta de Proteína Bruta de {forageA.bromatology.crudeProteinPercent.average}% com foco em {forageA.strengthsAndWeaknesses.animalCategoriesRecommended.slice(0, 2).join(', ')}.</li>
                    </ul>
                  </div>

                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-blue-500/30 space-y-2">
                    <span className="font-black text-blue-400 text-sm block">
                      🌿 Escolha {forageB.commonName} se você busca:
                    </span>
                    <ul className="space-y-1.5 text-slate-300">
                      <li>• <strong>Solo:</strong> Saturação por bases de {forageB.fertilization.targetBaseSaturationPercent}% e demanda de {forageB.soilAndClimate.fertilityRequirement} fertilidade.</li>
                      <li>• <strong>Clima & Água:</strong> Suporta {forageB.soilAndClimate.waterloggingTolerance.toLowerCase()} e chuva de {forageB.soilAndClimate.annualRainfallMmRange.min} mm.</li>
                      <li>• <strong>Pecuária:</strong> Meta de Proteína Bruta de {forageB.bromatology.crudeProteinPercent.average}% com foco em {forageB.strengthsAndWeaknesses.animalCategoriesRecommended.slice(0, 2).join(', ')}.</li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: MANEJO ROTACIONADO & FENOLOGIA */}
          {activeTab === 'manejo_fenologia' && (
            <div className="space-y-6">

              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-b border-slate-200 dark:border-zinc-700">
                      <th className="p-3.5 font-bold w-1/4">Critério de Manejo & Fenologia</th>
                      <th className="p-3.5 font-black text-emerald-700 dark:text-emerald-400 w-3/8 border-l border-slate-200 dark:border-zinc-700">
                        {forageA.commonName} ({forageA.cultivar})
                      </th>
                      <th className="p-3.5 font-black text-blue-700 dark:text-blue-400 w-3/8 border-l border-slate-200 dark:border-zinc-700">
                        {forageB.commonName} ({forageB.cultivar})
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    
                    {/* Hábito de Crescimento */}
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                      <td className="p-3.5 font-bold text-slate-600 dark:text-zinc-400">
                        Hábito de Crescimento
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800 font-semibold text-slate-800 dark:text-zinc-200 capitalize">
                        {forageA.phenology.growthHabit.replace('_', ' ')}
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800 font-semibold text-slate-800 dark:text-zinc-200 capitalize">
                        {forageB.phenology.growthHabit.replace('_', ' ')}
                      </td>
                    </tr>

                    {/* Altura de Entrada Rotacionado */}
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 bg-slate-50/30 dark:bg-zinc-800/20">
                      <td className="p-3.5 font-bold text-slate-600 dark:text-zinc-400">
                        Altura de Entrada (95% IL)
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        <span className="text-base font-black text-emerald-700 dark:text-emerald-400">
                          {forageA.phenology.entryHeightRotationalCm} cm
                        </span>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800">
                        <span className="text-base font-black text-blue-700 dark:text-blue-400">
                          {forageB.phenology.entryHeightRotationalCm} cm
                        </span>
                      </td>
                    </tr>

                    {/* Altura de Saída / Resíduo */}
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                      <td className="p-3.5 font-bold text-slate-600 dark:text-zinc-400">
                        Altura de Saída / Resíduo Pós-Pastejo
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800 font-bold text-slate-800 dark:text-zinc-200">
                        {forageA.phenology.exitHeightRotationalCm} cm
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800 font-bold text-slate-800 dark:text-zinc-200">
                        {forageB.phenology.exitHeightRotationalCm} cm
                      </td>
                    </tr>

                    {/* Período de Descanso */}
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 bg-slate-50/30 dark:bg-zinc-800/20">
                      <td className="p-3.5 font-bold text-slate-600 dark:text-zinc-400">
                        Período de Descanso (Águas vs Seca)
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800 text-slate-800 dark:text-zinc-200">
                        <div>Águas: <strong>{forageA.phenology.grazingRestPeriodDays.rainy.min} a {forageA.phenology.grazingRestPeriodDays.rainy.max} dias</strong></div>
                        <div>Seca: <strong>{forageA.phenology.grazingRestPeriodDays.dry.min} a {forageA.phenology.grazingRestPeriodDays.dry.max} dias</strong></div>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800 text-slate-800 dark:text-zinc-200">
                        <div>Águas: <strong>{forageB.phenology.grazingRestPeriodDays.rainy.min} a {forageB.phenology.grazingRestPeriodDays.rainy.max} dias</strong></div>
                        <div>Seca: <strong>{forageB.phenology.grazingRestPeriodDays.dry.min} a {forageB.phenology.grazingRestPeriodDays.dry.max} dias</strong></div>
                      </td>
                    </tr>

                    {/* Tolerância à Seca & Geadas */}
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                      <td className="p-3.5 font-bold text-slate-600 dark:text-zinc-400">
                        Tolerância a Seca & Frio / Geadas
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800 text-slate-800 dark:text-zinc-200">
                        <div>Seca: <strong>{forageA.phenology.droughtTolerance}</strong></div>
                        <div>Geadas: <strong>{forageA.phenology.frostTolerance}</strong></div>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800 text-slate-800 dark:text-zinc-200">
                        <div>Seca: <strong>{forageB.phenology.droughtTolerance}</strong></div>
                        <div>Geadas: <strong>{forageB.phenology.frostTolerance}</strong></div>
                      </td>
                    </tr>

                    {/* Produção na Seca (%) */}
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 bg-slate-50/30 dark:bg-zinc-800/20">
                      <td className="p-3.5 font-bold text-slate-600 dark:text-zinc-400">
                        Acúmulo de Biomassa na Seca (% anual)
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800 font-extrabold text-emerald-700 dark:text-emerald-400">
                        {forageA.phenology.drySeasonAccumulationPercent}% do total anual
                      </td>
                      <td className="p-3.5 border-l border-slate-100 dark:border-zinc-800 font-extrabold text-blue-700 dark:text-blue-400">
                        {forageB.phenology.drySeasonAccumulationPercent}% do total anual
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100 dark:bg-zinc-800 border-t border-slate-200 dark:border-zinc-700 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>Selecione qualquer uma das 30 forrageiras acima para comparar instantaneamente.</span>
          </div>

          <div className="flex items-center gap-2">
            {onSelectForageToView && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectForageToView(forageA);
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Ver Ficha de {forageA.commonName}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectForageToView(forageB);
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Ver Ficha de {forageB.commonName}</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 text-slate-800 dark:text-zinc-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
