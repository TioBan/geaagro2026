import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
  Sprout,
  ShieldAlert,
  Droplets,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { FertilizerItem, FertilizerGroup } from '../../types/fertigation';
import { FERTILIZERS_DATABASE } from '../../data/fertigationData';

interface TechnicalLibraryViewProps {
  onSelectFertilizerForDetail: (fert: FertilizerItem) => void;
  onSendToTank: (fertId: string) => void;
}

export const TechnicalLibraryView: React.FC<TechnicalLibraryViewProps> = ({
  onSelectFertilizerForDetail,
  onSendToTank,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('todos');
  const [selectedFertId, setSelectedFertId] = useState<string>(FERTILIZERS_DATABASE[0]?.id || '');

  const filteredFertilizers = useMemo(() => {
    return FERTILIZERS_DATABASE.filter(f => {
      const matchesSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.commercialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.formula.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.plantFunction.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGroup = selectedGroup === 'todos' || f.group === selectedGroup;
      return matchesSearch && matchesGroup;
    });
  }, [searchQuery, selectedGroup]);

  const activeFert = useMemo(() => {
    return FERTILIZERS_DATABASE.find(f => f?.id === selectedFertId) || FERTILIZERS_DATABASE[0];
  }, [selectedFertId]);

  // Mobility deduction
  let mobility = 'Moderadamente Móvel';
  if (activeFert?.group === 'calcio' || activeFert?.id?.includes('boro') || activeFert?.id?.includes('borico')) {
    mobility = 'Imóvel no Floema (Exige fluxo transpiratório contínuo)';
  } else if (activeFert?.id?.includes('potassio') || activeFert?.id?.includes('ureia') || activeFert?.id?.includes('nitrato_amonio') || activeFert?.group === 'magnesio') {
    mobility = 'Altamente Móvel no Floema (Sintomas em folhas velhas)';
  } else if (activeFert?.group === 'micronutrientes_quelatos' || activeFert?.group === 'micronutrientes_sais') {
    mobility = 'Baixa a Pouca Mobilidade (Sintomas em folhas novas/ápices)';
  }

  return (
    <div className="space-y-6 animate-fade-in" id="technical-library">
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              Biblioteca Técnica & Enciclopédia Agronômica de Fertilizantes
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Guia completo de fisiologia vegetal, sintomas de deficiência/excesso, mobilidade e boas práticas agronômicas
            </p>
          </div>

          <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-black px-3 py-1 rounded-full w-fit">
            {FERTILIZERS_DATABASE.length} Insumos Catalogados
          </span>
        </div>

        {/* Filter and Search Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por nome, fórmula, sintoma..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'nitrogenados', label: 'Nitrogenados' },
              { id: 'fosfatados', label: 'Fosfatados' },
              { id: 'potassicos', label: 'Potássicos' },
              { id: 'calcio', label: 'Cálcio' },
              { id: 'magnesio', label: 'Magnésio' },
              { id: 'enxofre', label: 'Enxofre' },
              { id: 'micronutrientes_quelatos', label: 'Micronutrientes (Quelatos)' },
              { id: 'micronutrientes_sais', label: 'Micronutrientes (Sais)' },
              { id: 'acidos', label: 'Ácidos & Corretivos' },
            ].map(grp => (
              <button
                key={grp.id}
                onClick={() => setSelectedGroup(grp.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-[11px] ${
                  selectedGroup === grp.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
                }`}
              >
                {grp.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout: Fertilizer Selector list (4 cols) & Full Technical Sheet (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Fertilizers */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs space-y-2 max-h-[700px] overflow-y-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Selecione o Insumo ({filteredFertilizers.length}):
          </span>

          {filteredFertilizers.map(f => (
            <div
              key={f.id}
              onClick={() => setSelectedFertId(f.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                selectedFertId === f.id
                  ? 'bg-emerald-50/80 dark:bg-zinc-800 border-emerald-500 text-emerald-950 dark:text-white shadow-xs'
                  : 'bg-slate-50/60 dark:bg-zinc-900/60 border-slate-200/70 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/80'
              }`}
            >
              <div className="min-w-0 flex-1">
                <strong className="block font-bold truncate">{f.name}</strong>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                  <span>{f.formula}</span>
                  <span>•</span>
                  <span className="uppercase text-emerald-600 dark:text-emerald-400 font-bold">{f.defaultTank}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
            </div>
          ))}
        </div>

        {/* Right Encyclopedic Sheet */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-6">
          {/* Header of Active Fertilizer */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                  {activeFert.group}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-black uppercase tracking-wider">
                  {activeFert.defaultTank}
                </span>
              </div>
              <h3 className="font-black text-xl text-slate-900 dark:text-white mt-1.5">
                {activeFert.name}
              </h3>
              <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                {activeFert.chemicalName} ({activeFert.formula})
              </span>
            </div>

            <button
              onClick={() => onSendToTank(activeFert.id)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all shrink-0"
            >
              <FlaskConical className="w-4 h-4" />
              Simular no Tanque
            </button>
          </div>

          {/* Quick Technical Fact Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-zinc-800/80 rounded-xl border border-slate-200/70 dark:border-zinc-700/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Solubilidade a 20°C:</span>
              <strong className="text-sm font-black text-slate-900 dark:text-white">{activeFert.solubilityAt20C_gL} g/L</strong>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-zinc-800/80 rounded-xl border border-slate-200/70 dark:border-zinc-700/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Índice Salino:</span>
              <strong className="text-sm font-black text-slate-900 dark:text-white">{activeFert.saltIndex}</strong>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-zinc-800/80 rounded-xl border border-slate-200/70 dark:border-zinc-700/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">pH Solução 10%:</span>
              <strong className="text-sm font-black text-slate-900 dark:text-white">{activeFert.solutionPh10Percent}</strong>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-zinc-800/80 rounded-xl border border-slate-200/70 dark:border-zinc-700/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">CE a 1 g/L:</span>
              <strong className="text-sm font-black text-slate-900 dark:text-white">{activeFert.estimatedCeMsPerCmAt1gL} mS/cm</strong>
            </div>
          </div>

          {/* Guaranteed Nutrients Breakdown */}
          <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/80 rounded-xl border border-slate-200/70 dark:border-zinc-700/60 space-y-2 text-xs">
            <strong className="font-bold text-slate-900 dark:text-white block">
              Garantias Nutricionais Declaradas (%):
            </strong>
            <div className="flex flex-wrap gap-2">
              {Object.entries(activeFert.guaranteedNutrients).map(([elem, pct]) => (
                <div key={elem} className="px-3 py-1 bg-white dark:bg-zinc-900 border rounded-lg flex items-center gap-1.5 font-bold">
                  <span className="text-emerald-600 dark:text-emerald-400">{elem}:</span>
                  <span className="text-slate-900 dark:text-white">{pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deep Agronomic Sections */}
          <div className="space-y-4 text-xs">
            {/* 1. Função na Planta & Mobilidade */}
            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/60 space-y-2">
              <strong className="text-emerald-950 dark:text-emerald-200 font-bold text-sm flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-emerald-600" />
                Função Bioquímica na Fisiologia Vegetal:
              </strong>
              <p className="text-[11px] text-emerald-900 dark:text-emerald-300 leading-relaxed font-medium">
                {activeFert.plantFunction}
              </p>
              <div className="pt-1 text-[11px] text-slate-600 dark:text-zinc-400">
                <strong>Mobilidade no Tecido Vegetal: </strong> {mobility}
              </div>
            </div>

            {/* 2. Sintomas de Deficiência vs Sintomas de Excesso */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/60 space-y-1.5">
                <strong className="text-amber-950 dark:text-amber-200 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Sintomas Visuais de Deficiência:
                </strong>
                <p className="text-[11px] text-amber-900 dark:text-amber-300 leading-relaxed">
                  {activeFert.deficiencySymptoms}
                </p>
              </div>

              <div className="p-3.5 bg-rose-50/70 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/60 space-y-1.5">
                <strong className="text-rose-950 dark:text-rose-200 font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Sintomas de Fitotoxicidade / Excesso:
                </strong>
                <p className="text-[11px] text-rose-900 dark:text-rose-300 leading-relaxed">
                  {activeFert.excessSymptoms}
                </p>
              </div>
            </div>

            {/* 3. Recomendações Práticas de Aplicação */}
            <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/80 rounded-xl border border-slate-200/70 dark:border-zinc-700/60 space-y-2">
              <strong className="text-slate-900 dark:text-white font-bold block">
                Diretrizes de Aplicação Agronômica:
              </strong>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg border space-y-1">
                  <span className="font-bold text-teal-600 dark:text-teal-400 block">💧 Fertirrigação:</span>
                  <span className="text-slate-600 dark:text-zinc-400">
                    Dosar via {activeFert.defaultTank}. Concentração de injeção segura de 50 a 150 g/L de água.
                  </span>
                </div>
                <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg border space-y-1">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 block">🌱 Hidroponia (NFT/Substrato):</span>
                  <span className="text-slate-600 dark:text-zinc-400">
                    Ajustar condutividade elétrica conforme a fase fenológica da cultura sem ultrapassar 2.2 mS/cm.
                  </span>
                </div>
                <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg border space-y-1">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block">🍃 Aplicação Foliar:</span>
                  <span className="text-slate-600 dark:text-zinc-400">
                    Dose de 0.1% a 0.5% com adjuvante espalhante adesivo nas horas mais frescas do dia.
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Incompatibilidades & Segurança FISPQ */}
            {activeFert.prohibitedMixNotes && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 rounded-xl space-y-1 text-rose-950 dark:text-rose-200">
                <strong className="block font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Incompatibilidades Químicas Proibidas:
                </strong>
                <p className="text-[11px] leading-relaxed">{activeFert.prohibitedMixNotes}</p>
              </div>
            )}

            <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/80 rounded-xl border border-slate-200/70 dark:border-zinc-700/60 space-y-1 text-slate-700 dark:text-zinc-300">
              <strong className="text-slate-900 dark:text-white font-bold block">
                Armazenamento, Manuseio & Segurança (FISPQ):
              </strong>
              <p className="text-[11px] leading-relaxed">{activeFert.storageAndSafety}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
