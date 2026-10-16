import React, { useState } from 'react';
import { SoilFertilityLevel, SoilDrainageLevel, ForageItem, ForageCategory } from '../../types/forage';
import { filterForagesBySoilAndClimate } from '../../data/foragesCatalogData';
import { Compass, Sparkles, Award, ArrowRight, CheckCircle2, AlertTriangle, Layers, Droplets } from 'lucide-react';

interface ForageSoilMatcherProps {
  onSelectForage: (forage: ForageItem) => void;
}

export const ForageSoilMatcher: React.FC<ForageSoilMatcherProps> = ({ onSelectForage }) => {
  const [fertility, setFertility] = useState<SoilFertilityLevel>('media');
  const [drainage, setDrainage] = useState<SoilDrainageLevel>('bem_drenado');
  const [animalCategory, setAnimalCategory] = useState<string>('Bovinos de Corte');
  const [isIlpf, setIsIlpf] = useState<boolean>(false);
  const [category, setCategory] = useState<ForageCategory | 'todas'>('todas');

  const matches = filterForagesBySoilAndClimate({
    fertility,
    drainage,
    animalType: animalCategory,
    category: category === 'todas' ? undefined : category,
    isIlpf,
  });

  return (
    <div className="space-y-6">
      {/* Interactive Selection Criteria Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-zinc-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Recomendador Técnico de Forrageiras por Solo & Aptidão
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Cruze as condições físicas e químicas do solo com a categoria animal para identificar as espécies de melhor desempenho.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Fertilidade do Solo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              Fertilidade do Solo (V%):
            </label>
            <select
              value={fertility}
              onChange={e => setFertility(e.target.value as SoilFertilityLevel)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-emerald-500"
            >
              <option value="baixa">Baixa (V &lt; 40% &bull; Solos Pobres / Arenosos)</option>
              <option value="media">Média (V = 45% a 55% &bull; Solos Corrigidos)</option>
              <option value="alta">Alta (V = 60% a 70% &bull; Solos Altamente Férteis)</option>
            </select>
          </div>

          {/* 2. Drenagem e Umidade */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-blue-600" />
              Drenagem & Relevo:
            </label>
            <select
              value={drainage}
              onChange={e => setDrainage(e.target.value as SoilDrainageLevel)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-emerald-500"
            >
              <option value="bem_drenado">Bem Drenado (Terra firme / Chapada)</option>
              <option value="moderado">Drenagem Moderada / Meia-encosta</option>
              <option value="tolerante_encharcamento">Várzea Úmida (Encharca nas chuvas)</option>
              <option value="tolerante_inundacao">Alagadiço / Pantanal / Baixada</option>
            </select>
          </div>

          {/* 3. Categoria Animal */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              Finalidade / Categoria:
            </label>
            <select
              value={animalCategory}
              onChange={e => setAnimalCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-emerald-500"
            >
              <option value="Bovinos de Corte">Bovinos de Corte (Cria / Recria / Engorda)</option>
              <option value="Bovinos de Leite">Bovinos de Leite (Vacas em Lactação)</option>
              <option value="Equinos">Equinos / Cavalos (Sem oxalato / Não estufa)</option>
              <option value="Ovinos">Ovinos & Caprinos (Porte baixo / Macio)</option>
              <option value="Búfalos">Bubalinocultura (Búfalos)</option>
            </select>
          </div>

          {/* 4. Integração ILPF */}
          <div className="space-y-1.5 flex flex-col justify-end">
            <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 cursor-pointer text-xs font-bold text-slate-800 dark:text-zinc-200">
              <input
                type="checkbox"
                checked={isIlpf}
                onChange={e => setIsIlpf(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <span>Consórcio ILPF / Safrinha</span>
            </label>
          </div>
        </div>
      </div>

      {/* Ranking of Recommended Forages */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Ranking de Espécies Compatíveis ({matches.length} forrageiras avaliadas)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.slice(0, 8).map(({ forage, score, matchReasons }, idx) => (
            <div
              key={forage.id}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-black flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                      {forage.commonName}
                    </h5>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                      score >= 80
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : score >= 60
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    Índice: {score}%
                  </span>
                </div>

                <p className="text-xs text-slate-500 italic mb-3">
                  {forage.scientificName} &bull; {forage.cultivar}
                </p>

                {/* Match criteria badges */}
                <div className="space-y-1.5 mb-3">
                  {matchReasons.map((reason, rIdx) => (
                    <div key={rIdx} className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-zinc-300">
                      {reason.includes('⚠️') ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      )}
                      <span className="text-[11.5px]">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                  PB: <strong>{forage.bromatology.crudeProteinPercent.average}%</strong> &bull; V%: <strong>{forage.fertilization.targetBaseSaturationPercent}%</strong>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectForage(forage)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Ver Ficha</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
