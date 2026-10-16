import React from 'react';
import { ForageItem } from '../../types/forage';
import { FORAGES_CATALOG } from '../../data/foragesCatalogData';
import { Scale, X, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface ForageComparatorProps {
  selectedIds: string[];
  onRemove: (id: string) => void;
  onSelectForage: (forage: ForageItem) => void;
  onAddMore: () => void;
}

export const ForageComparator: React.FC<ForageComparatorProps> = ({
  selectedIds,
  onRemove,
  onSelectForage,
  onAddMore,
}) => {
  const forages = selectedIds
    .map(id => FORAGES_CATALOG.find(f => f.id === id))
    .filter(Boolean) as ForageItem[];

  if (forages.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 text-center space-y-4">
        <Scale className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto" />
        <div className="space-y-1">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Nenhuma forrageira selecionada para comparação
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
            Clique no botão <strong>"Comparar"</strong> nos cards do catálogo para comparar até 4 espécies lado a lado em tabela técnica.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddMore}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          Explorar Catálogo de 30 Forrageiras
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-emerald-600" />
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            Comparador Lado a Lado ({forages.length} selecionadas)
          </h3>
        </div>

        {forages.length < 4 && (
          <button
            type="button"
            onClick={onAddMore}
            className="px-3.5 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            + Adicionar Mais Espécies
          </button>
        )}
      </div>

      {/* Comparison Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-800">
              <th className="p-4 font-bold text-slate-500 dark:text-zinc-400 w-48 shrink-0">
                Critério Agronômico
              </th>
              {forages.map(f => (
                <th key={f.id} className="p-4 font-extrabold text-slate-900 dark:text-white min-w-[220px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{f.commonName}</span>
                    <button
                      type="button"
                      onClick={() => onRemove(f.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Remover da comparação"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                    {f.cultivar}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
            {/* Nome Científico */}
            <tr>
              <td className="p-3.5 font-bold text-slate-500 dark:text-zinc-400 bg-slate-50/50 dark:bg-zinc-800/30">
                Nome Científico
              </td>
              {forages.map(f => (
                <td key={f.id} className="p-3.5 italic text-slate-700 dark:text-zinc-300">
                  {f.scientificName}
                </td>
              ))}
            </tr>

            {/* Proteína Bruta */}
            <tr>
              <td className="p-3.5 font-bold text-slate-500 dark:text-zinc-400 bg-slate-50/50 dark:bg-zinc-800/30">
                Proteína Bruta (PB)
              </td>
              {forages.map(f => (
                <td key={f.id} className="p-3.5 font-black text-emerald-700 dark:text-emerald-400 text-sm">
                  {f.bromatology.crudeProteinPercent.average}% <span className="text-[10px] text-slate-400 font-normal">({f.bromatology.crudeProteinPercent.min}-{f.bromatology.crudeProteinPercent.max}%)</span>
                </td>
              ))}
            </tr>

            {/* Digestibilidade DIVMS */}
            <tr>
              <td className="p-3.5 font-bold text-slate-500 dark:text-zinc-400 bg-slate-50/50 dark:bg-zinc-800/30">
                Digestibilidade (DIVMS)
              </td>
              {forages.map(f => (
                <td key={f.id} className="p-3.5 font-bold text-blue-700 dark:text-blue-400">
                  {f.bromatology.inVitroDryMatterDigestibilityPercent.average}%
                </td>
              ))}
            </tr>

            {/* Produção Matéria Seca */}
            <tr>
              <td className="p-3.5 font-bold text-slate-500 dark:text-zinc-400 bg-slate-50/50 dark:bg-zinc-800/30">
                Produção t MS/ha/ano
              </td>
              {forages.map(f => (
                <td key={f.id} className="p-3.5 font-bold text-amber-700 dark:text-amber-400">
                  {f.dryMatterYieldTonHaYear.average} t/ha
                </td>
              ))}
            </tr>

            {/* Manejo de Entrada e Saída */}
            <tr>
              <td className="p-3.5 font-bold text-slate-500 dark:text-zinc-400 bg-slate-50/50 dark:bg-zinc-800/30">
                Manejo Rotacionado
              </td>
              {forages.map(f => (
                <td key={f.id} className="p-3.5 text-slate-800 dark:text-zinc-200">
                  Entrada: <strong>{f.phenology.entryHeightRotationalCm} cm</strong> &bull; Saída: <strong>{f.phenology.exitHeightRotationalCm} cm</strong>
                </td>
              ))}
            </tr>

            {/* Fertilidade e Calagem V% */}
            <tr>
              <td className="p-3.5 font-bold text-slate-500 dark:text-zinc-400 bg-slate-50/50 dark:bg-zinc-800/30">
                Fertilidade & V% Alvo
              </td>
              {forages.map(f => (
                <td key={f.id} className="p-3.5 text-slate-800 dark:text-zinc-200 capitalize">
                  {f.soilAndClimate.fertilityRequirement} (V = {f.fertilization.targetBaseSaturationPercent}%)
                </td>
              ))}
            </tr>

            {/* Tolerância a Encharcamento */}
            <tr>
              <td className="p-3.5 font-bold text-slate-500 dark:text-zinc-400 bg-slate-50/50 dark:bg-zinc-800/30">
                Encharcamento / Várzea
              </td>
              {forages.map(f => (
                <td key={f.id} className="p-3.5 text-slate-800 dark:text-zinc-200">
                  {f.soilAndClimate.waterloggingTolerance}
                </td>
              ))}
            </tr>

            {/* Tolerância à Seca */}
            <tr>
              <td className="p-3.5 font-bold text-slate-500 dark:text-zinc-400 bg-slate-50/50 dark:bg-zinc-800/30">
                Tolerância à Seca
              </td>
              {forages.map(f => (
                <td key={f.id} className="p-3.5 text-slate-800 dark:text-zinc-200">
                  {f.phenology.droughtTolerance}
                </td>
              ))}
            </tr>

            {/* Principais Vantagens */}
            <tr>
              <td className="p-3.5 font-bold text-slate-500 dark:text-zinc-400 bg-slate-50/50 dark:bg-zinc-800/30">
                Ponto Forte Principal
              </td>
              {forages.map(f => (
                <td key={f.id} className="p-3.5 text-slate-700 dark:text-zinc-300 text-[11.5px]">
                  {f.strengthsAndWeaknesses.strengths[0]}
                </td>
              ))}
            </tr>

            {/* Limitação */}
            <tr>
              <td className="p-3.5 font-bold text-slate-500 dark:text-zinc-400 bg-slate-50/50 dark:bg-zinc-800/30">
                Limitação / Atenção
              </td>
              {forages.map(f => (
                <td key={f.id} className="p-3.5 text-rose-700 dark:text-rose-400 text-[11.5px]">
                  {f.strengthsAndWeaknesses.weaknesses[0]}
                </td>
              ))}
            </tr>

            {/* Ação */}
            <tr>
              <td className="p-3.5 bg-slate-50/50 dark:bg-zinc-800/30" />
              {forages.map(f => (
                <td key={f.id} className="p-3.5">
                  <button
                    type="button"
                    onClick={() => onSelectForage(f)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Ficha Completa</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
