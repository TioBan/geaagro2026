import React, { useState, useMemo } from 'react';
import {
  Search,
  AlertTriangle,
  FlaskConical,
  Sprout,
  ShieldAlert,
  Droplets,
  ChevronRight,
  Leaf,
} from 'lucide-react';
import { FertilizerItem } from '../../types/fertigation';
import { FERTILIZERS_DATABASE } from '../../data/fertigationData';

interface TechnicalLibraryViewProps {
  onSelectFertilizerForDetail: (fert: FertilizerItem) => void;
  onSendToTank: (fertId: string) => void;
}

const GROUP_OPTIONS = [
  { id: 'todos', label: 'Todos os grupos' },
  { id: 'nitrogenados', label: 'Nitrogenados' },
  { id: 'fosfatados', label: 'Fosfatados' },
  { id: 'potassicos', label: 'Potássicos' },
  { id: 'calcio', label: 'Cálcio' },
  { id: 'magnesio', label: 'Magnésio' },
  { id: 'enxofre', label: 'Enxofre' },
  { id: 'micronutrientes_quelatos', label: 'Micronutrientes (Quelatos)' },
  { id: 'micronutrientes_sais', label: 'Micronutrientes (Sais)' },
  { id: 'acidos', label: 'Ácidos e corretivos' },
];

export const TechnicalLibraryView: React.FC<TechnicalLibraryViewProps> = ({
  onSendToTank,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('todos');
  const [selectedFertId, setSelectedFertId] = useState<string>(FERTILIZERS_DATABASE[0]?.id || '');

  const filteredFertilizers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return FERTILIZERS_DATABASE.filter(f => {
      const matchesSearch =
        f.name.toLowerCase().includes(q) ||
        f.commercialName.toLowerCase().includes(q) ||
        f.formula.toLowerCase().includes(q) ||
        f.plantFunction.toLowerCase().includes(q);
      const matchesGroup = selectedGroup === 'todos' || f.group === selectedGroup;
      return matchesSearch && matchesGroup;
    });
  }, [searchQuery, selectedGroup]);

  const activeFert = useMemo(() => {
    return FERTILIZERS_DATABASE.find(f => f?.id === selectedFertId) || FERTILIZERS_DATABASE[0];
  }, [selectedFertId]);

  let mobility = 'Moderadamente móvel';
  if (
    activeFert?.group === 'calcio' ||
    activeFert?.id?.includes('boro') ||
    activeFert?.id?.includes('borico')
  ) {
    mobility = 'Imóvel no floema (exige fluxo transpiratório contínuo)';
  } else if (
    activeFert?.id?.includes('potassio') ||
    activeFert?.id?.includes('ureia') ||
    activeFert?.id?.includes('nitrato_amonio') ||
    activeFert?.group === 'magnesio'
  ) {
    mobility = 'Altamente móvel no floema (sintomas em folhas velhas)';
  } else if (
    activeFert?.group === 'micronutrientes_quelatos' ||
    activeFert?.group === 'micronutrientes_sais'
  ) {
    mobility = 'Baixa mobilidade (sintomas em folhas novas e ápices)';
  }

  return (
    <div className="space-y-5" id="technical-library">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
          Biblioteca Técnica de Fertilizantes
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
          {FERTILIZERS_DATABASE.length} insumos catalogados · Fisiologia, sintomas de deficiência/excesso e segurança FISPQ
        </p>
      </div>

      {/* Layout Mestre-Detalhe */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Lista Esquerda */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-3 border-b border-slate-100 dark:border-zinc-800 space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar nome, fórmula ou sintoma..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
              aria-label="Filtrar grupo químico"
              className="w-full h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              {GROUP_OPTIONS.map(grp => (
                <option key={grp.id} value={grp.id}>
                  {grp.label}
                </option>
              ))}
            </select>
          </div>

          <div className="px-3.5 py-2 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/40 text-[11px] font-medium text-slate-500 dark:text-zinc-400 tabular-nums">
            {filteredFertilizers.length} {filteredFertilizers.length === 1 ? 'insumo' : 'insumos'}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800 max-h-[600px] overflow-y-auto">
            {filteredFertilizers.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 dark:text-zinc-400">
                Nenhum fertilizante encontrado.
              </div>
            ) : (
              filteredFertilizers.map(f => {
                const isSelected = selectedFertId === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFertId(f.id)}
                    className={`w-full px-3.5 py-2.5 text-left transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/35'
                        : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-xs font-semibold truncate ${
                          isSelected
                            ? 'text-emerald-800 dark:text-emerald-300'
                            : 'text-slate-900 dark:text-zinc-100'
                        }`}
                      >
                        {f.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono truncate mt-0.5">
                        {f.formula} · {f.defaultTank}
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Ficha Técnica Completa */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          {/* Cabeçalho da Ficha */}
          <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-zinc-400 capitalize">
                <span>{activeFert.group.replace(/_/g, ' ')}</span>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-emerald-700 dark:text-emerald-400">
                  {activeFert.defaultTank}
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                {activeFert.name}
              </h3>
              <div className="font-mono text-xs text-slate-600 dark:text-zinc-400">
                {activeFert.chemicalName} ({activeFert.formula})
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSendToTank(activeFert.id)}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start"
            >
              <FlaskConical className="w-3.5 h-3.5 shrink-0" />
              <span>Simular no Tanque</span>
            </button>
          </div>

          {/* Faixa de Parâmetros Físico-Químicos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 divide-x divide-slate-100 dark:divide-zinc-800 border-b border-slate-100 dark:border-zinc-800 text-xs">
            <div className="p-3.5">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                Solubilidade (20 °C)
              </span>
              <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5 block">
                {activeFert.solubilityAt20C_gL} g/L
              </span>
            </div>

            <div className="p-3.5">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                Índice salino
              </span>
              <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5 block">
                {activeFert.saltIndex}
              </span>
            </div>

            <div className="p-3.5">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                pH solução 10%
              </span>
              <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5 block">
                {activeFert.solutionPh10Percent}
              </span>
            </div>

            <div className="p-3.5">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                CE a 1 g/L
              </span>
              <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5 block">
                {activeFert.estimatedCeMsPerCmAt1gL} mS/cm
              </span>
            </div>
          </div>

          {/* Garantias Nutricionais */}
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-zinc-800 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
            <span className="font-semibold text-slate-700 dark:text-zinc-300">
              Garantias (%):
            </span>
            {Object.entries(activeFert.guaranteedNutrients).map(([elem, pct]) => (
              <span key={elem} className="tabular-nums">
                <strong className="font-semibold text-emerald-700 dark:text-emerald-400">{elem}</strong>{' '}
                <span className="text-slate-900 dark:text-zinc-100 font-medium">{pct}%</span>
              </span>
            ))}
          </div>

          {/* Função Fisiológica e Mobilidade */}
          <div className="p-5 border-b border-slate-100 dark:border-zinc-800 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-zinc-100">
              <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Função na fisiologia vegetal</span>
            </div>
            <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
              {activeFert.plantFunction}
            </p>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 pt-0.5">
              <strong className="text-slate-700 dark:text-zinc-300">Mobilidade:</strong> {mobility}
            </div>
          </div>

          {/* Deficiência vs Excesso */}
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-zinc-800 border-b border-slate-100 dark:border-zinc-800 text-xs">
            <div className="p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Sintomas de deficiência</span>
              </div>
              <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                {activeFert.deficiencySymptoms}
              </p>
            </div>

            <div className="p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-rose-700 dark:text-rose-400">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>Sintomas de excesso / fitotoxicidade</span>
              </div>
              <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                {activeFert.excessSymptoms}
              </p>
            </div>
          </div>

          {/* Diretrizes de Aplicação */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-zinc-800 border-b border-slate-100 dark:border-zinc-800 text-xs">
            <div className="p-4 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-zinc-200">
                <Droplets className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Fertirrigação</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                Dosar via {activeFert.defaultTank}. Concentração de injeção segura de 50 a 150 g/L.
              </p>
            </div>

            <div className="p-4 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-zinc-200">
                <Sprout className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                <span>Hidroponia</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                Ajustar CE conforme fase fenológica mantendo a solução abaixo de 2,2 mS/cm.
              </p>
            </div>

            <div className="p-4 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-zinc-200">
                <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Aplicação foliar</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                Concentração de 0,1% a 0,5% com adjuvante nas horas mais amenas do dia.
              </p>
            </div>
          </div>

          {/* Incompatibilidades e FISPQ */}
          <div className="p-4 space-y-3 text-xs">
            {activeFert.prohibitedMixNotes && (
              <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-800/70 bg-rose-50/70 dark:bg-rose-950/30 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-rose-800 dark:text-rose-300">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Incompatibilidades químicas proibidas</span>
                </div>
                <p className="text-[11px] text-rose-950 dark:text-rose-200/90 leading-relaxed">
                  {activeFert.prohibitedMixNotes}
                </p>
              </div>
            )}

            <div className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
              <strong className="text-slate-800 dark:text-zinc-200">
                Armazenamento e segurança (FISPQ):{' '}
              </strong>
              {activeFert.storageAndSafety}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
