import React, { useState, useMemo } from 'react';
import {
  ForageCategory,
  ForageItem,
  SoilDrainageLevel,
  SoilFertilityLevel,
} from '../../types/forage';
import { filterForagesBySoilAndClimate } from '../../data/foragesCatalogData';
import { CheckCircle2, AlertTriangle, Eye, RotateCcw } from 'lucide-react';

interface ForageSoilMatcherProps {
  onSelectForage: (forage: ForageItem) => void;
}

const DEFAULT_FERTILITY: SoilFertilityLevel = 'media';
const DEFAULT_DRAINAGE: SoilDrainageLevel = 'bem_drenado';
const DEFAULT_CATEGORY: ForageCategory | 'todas' = 'todas';
const DEFAULT_ANIMAL = '';
const DEFAULT_ILPF = false;

export const ForageSoilMatcher: React.FC<ForageSoilMatcherProps> = ({ onSelectForage }) => {
  const [fertility, setFertility] = useState<SoilFertilityLevel>(DEFAULT_FERTILITY);
  const [drainage, setDrainage] = useState<SoilDrainageLevel>(DEFAULT_DRAINAGE);
  const [category, setCategory] = useState<ForageCategory | 'todas'>(DEFAULT_CATEGORY);
  const [animalType, setAnimalType] = useState<string>(DEFAULT_ANIMAL);
  const [isIlpf, setIsIlpf] = useState<boolean>(DEFAULT_ILPF);
  const [showAll, setShowAll] = useState(false);

  const recommendations = useMemo(() => {
    return filterForagesBySoilAndClimate({
      fertility,
      drainage,
      category: category === 'todas' ? undefined : category,
      animalType: animalType || undefined,
      isIlpf,
    });
  }, [fertility, drainage, category, animalType, isIlpf]);

  const visibleItems = showAll ? recommendations : recommendations.slice(0, 12);

  const isModified =
    fertility !== DEFAULT_FERTILITY ||
    drainage !== DEFAULT_DRAINAGE ||
    category !== DEFAULT_CATEGORY ||
    animalType !== DEFAULT_ANIMAL ||
    isIlpf !== DEFAULT_ILPF;

  const handleReset = () => {
    setFertility(DEFAULT_FERTILITY);
    setDrainage(DEFAULT_DRAINAGE);
    setCategory(DEFAULT_CATEGORY);
    setAnimalType(DEFAULT_ANIMAL);
    setIsIlpf(DEFAULT_ILPF);
    setShowAll(false);
  };

  return (
    <div className="space-y-4">
      {/* Criteria Surface */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Recomendador por Solo & Clima
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Defina as condições do talhão e categoria animal para ranquear as cultivares mais compatíveis.
            </p>
          </div>
          {isModified && (
            <button
              type="button"
              onClick={handleReset}
              className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrão</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800 items-end">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
              Fertilidade do Solo
            </label>
            <select
              value={fertility}
              onChange={e => setFertility(e.target.value as SoilFertilityLevel)}
              className="w-full h-9 px-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/90 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="baixa">Baixa (Ácidos / Arenosos / Baixo V%)</option>
              <option value="media">Média (Latossolo Corrigido)</option>
              <option value="alta">Alta (Solo Fértil / Adubado)</option>
              <option value="muito_alta">Muito Alta (Intensivo / Irrigado)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
              Drenagem / Encharcamento
            </label>
            <select
              value={drainage}
              onChange={e => setDrainage(e.target.value as SoilDrainageLevel)}
              className="w-full h-9 px-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/90 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="bem_drenado">Solo Bem Drenado</option>
              <option value="moderado">Drenagem Moderada</option>
              <option value="tolerante_encharcamento">Baixada Úmida / Encharcamento</option>
              <option value="tolerante_inundacao">Várzea / Alagadiço</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
              Finalidade / Categoria
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as ForageCategory | 'todas')}
              className="w-full h-9 px-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/90 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="todas">Todas as Categorias</option>
              <option value="graminea_tropical">Gramínea Tropical (Pastejo)</option>
              <option value="corte_silagem">Capineira / Corte & Silagem</option>
              <option value="graminea_temperada">Inverno / Temperada (Sul)</option>
              <option value="leguminosa_tropical">Leguminosa (Consórcio / Proteína)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
              Categoria Animal
            </label>
            <select
              value={animalType}
              onChange={e => setAnimalType(e.target.value)}
              className="w-full h-9 px-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/90 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="">Todas as Categorias</option>
              <option value="Cria">Cria / Matrizes</option>
              <option value="Recria">Recria</option>
              <option value="Engorda">Engorda / Terminação</option>
              <option value="Leite">Vacas em Lactação / Leite</option>
              <option value="Equinos">Equinos</option>
              <option value="Ovinos">Ovinos / Caprinos</option>
              <option value="Bubalinos">Bubalinos</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 h-9 px-3 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/90 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isIlpf}
                onChange={e => setIsIlpf(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="truncate font-medium">Priorizar ILPF / Sombra</span>
            </label>
          </div>
        </div>
      </section>

      {/* Results Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
        <p className="text-xs text-slate-600 dark:text-zinc-400 tabular-nums">
          Exibindo{' '}
          <strong className="font-semibold text-slate-900 dark:text-zinc-100">
            {visibleItems.length}
          </strong>{' '}
          de{' '}
          <strong className="font-semibold text-slate-900 dark:text-zinc-100">
            {recommendations.length}
          </strong>{' '}
          espécies ordenadas por aderência
        </p>

        {recommendations.length > 12 && (
          <button
            type="button"
            onClick={() => setShowAll(prev => !prev)}
            className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            {showAll ? 'Mostrar apenas Top 12' : `Ver todas (${recommendations.length})`}
          </button>
        )}
      </div>

      {/* Ranking Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {visibleItems.map((rec, idx) => {
          const normalizedScore = Math.max(0, Math.min(100, rec.score));
          const scoreColor =
            normalizedScore >= 85
              ? 'text-emerald-700 dark:text-emerald-400'
              : normalizedScore >= 65
              ? 'text-blue-700 dark:text-blue-400'
              : 'text-amber-700 dark:text-amber-400';

          return (
            <article
              key={rec.forage.id}
              className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 tabular-nums">
                        #{idx + 1}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                        {rec.forage.commonName}
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 italic truncate mt-0.5">
                      {rec.forage.scientificName} · cv. {rec.forage.cultivar}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`block text-base font-semibold tabular-nums leading-none ${scoreColor}`}>
                      {normalizedScore}%
                    </span>
                    <span className="block text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                      Aderência
                    </span>
                  </div>
                </div>

                {rec.matchReasons.length > 0 && (
                  <ul className="space-y-1 text-xs border-t border-slate-100 dark:border-zinc-800 pt-2.5">
                    {rec.matchReasons.map((reason, rIdx) => {
                      const isWarning = reason.includes('⚠️') || reason.startsWith('Não recomendada');
                      const cleanText = reason.replace(/^⚠️\s*/, '');
                      return (
                        <li
                          key={rIdx}
                          className={`flex items-start gap-1.5 leading-snug ${
                            isWarning
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-slate-600 dark:text-zinc-300'
                          }`}
                        >
                          {isWarning ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          )}
                          <span>{cleanText}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                  <span>
                    PB{' '}
                    <strong className="text-slate-800 dark:text-zinc-200">
                      {rec.forage.bromatology.crudeProteinPercent.average}%
                    </strong>
                  </span>
                  <span>
                    V%{' '}
                    <strong className="text-slate-800 dark:text-zinc-200">
                      {rec.forage.fertilization.targetBaseSaturationPercent}%
                    </strong>
                  </span>
                  <span>
                    MS{' '}
                    <strong className="text-slate-800 dark:text-zinc-200">
                      {rec.forage.dryMatterYieldTonHaYear.min}–{rec.forage.dryMatterYieldTonHaYear.max} t
                    </strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectForage(rec.forage)}
                  className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Ficha</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
