import React from 'react';
import { FORAGES_CATALOG } from '../../data/foragesCatalogData';
import { ForageItem, SoilFertilityLevel } from '../../types/forage';
import { Scale, X, Plus, Eye, Trash2, Sprout } from 'lucide-react';

interface ForageComparatorProps {
  selectedForageIds: string[];
  onRemoveForage: (id: string) => void;
  onAddForage?: (id: string) => void;
  onClearAll?: () => void;
  onSelectForage: (forage: ForageItem) => void;
  onGoToCatalog: () => void;
}

const FERTILITY_LABELS: Record<SoilFertilityLevel, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  muito_alta: 'Muito Alta',
};

const SUSCEPTIBILITY_LABELS: Record<string, string> = {
  alta: 'Alta',
  moderada: 'Moderada',
  tolerante: 'Tolerante',
  resistente: 'Resistente',
};

export const ForageComparator: React.FC<ForageComparatorProps> = ({
  selectedForageIds,
  onRemoveForage,
  onAddForage,
  onClearAll,
  onSelectForage,
  onGoToCatalog,
}) => {
  const selectedForages = selectedForageIds
    .map(id => FORAGES_CATALOG.find(f => f.id === id))
    .filter((f): f is ForageItem => Boolean(f));

  const availableToAdd = FORAGES_CATALOG.filter(f => !selectedForageIds.includes(f.id));

  const renderQuickAddSelect = () => {
    if (!onAddForage || selectedForages.length >= 4) return null;
    return (
      <select
        defaultValue=""
        aria-label="Adicionar forrageira à comparação"
        onChange={e => {
          if (e.target.value) {
            onAddForage(e.target.value);
            e.target.value = '';
          }
        }}
        className="h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-700 text-xs text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-emerald-500 transition-colors"
      >
        <option value="">+ Adicionar espécie...</option>
        {availableToAdd.map(f => (
          <option key={f.id} value={f.id}>
            {f.commonName} ({f.cultivar})
          </option>
        ))}
      </select>
    );
  };

  if (selectedForages.length === 0) {
    return (
      <section className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-10 text-center space-y-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center mx-auto">
          <Scale className="w-5 h-5" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Comparador Lado a Lado
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            Selecione até 4 espécies para comparar bromatologia, produtividade de matéria seca, alturas de pastejo, exigência de solo e resistência fitossanitária.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {renderQuickAddSelect()}
          <button
            type="button"
            onClick={onGoToCatalog}
            className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Explorar Catálogo ({FORAGES_CATALOG.length} espécies)</span>
          </button>
        </div>
      </section>
    );
  }

  const rows: Array<{
    label: string;
    render: (f: ForageItem) => React.ReactNode;
  }> = [
    {
      label: 'Proteína Bruta (PB)',
      render: f => (
        <span className="tabular-nums">
          <strong className="font-semibold text-emerald-700 dark:text-emerald-400">
            {f.bromatology.crudeProteinPercent.average}%
          </strong>{' '}
          <span className="text-slate-400 dark:text-zinc-500">
            ({f.bromatology.crudeProteinPercent.min}–{f.bromatology.crudeProteinPercent.max}%)
          </span>
        </span>
      ),
    },
    {
      label: 'Digestibilidade (DIVMS)',
      render: f => (
        <span className="tabular-nums">
          <strong className="font-semibold text-slate-900 dark:text-zinc-100">
            {f.bromatology.inVitroDryMatterDigestibilityPercent.average}%
          </strong>{' '}
          <span className="text-slate-400 dark:text-zinc-500">
            ({f.bromatology.inVitroDryMatterDigestibilityPercent.min}–
            {f.bromatology.inVitroDryMatterDigestibilityPercent.max}%)
          </span>
        </span>
      ),
    },
    {
      label: 'FDN / NDT Médios',
      render: f => (
        <span className="tabular-nums text-slate-700 dark:text-zinc-300">
          FDN {f.bromatology.neutralDetergentFiberPercent.average}% · NDT{' '}
          {f.bromatology.totalDigestibleNutrientsPercent.average}%
        </span>
      ),
    },
    {
      label: 'Produção MS (t/ha/ano)',
      render: f => (
        <span className="tabular-nums font-medium text-slate-900 dark:text-zinc-100">
          {f.dryMatterYieldTonHaYear.min} a {f.dryMatterYieldTonHaYear.max} t
        </span>
      ),
    },
    {
      label: 'Altura Rotacionado (Entrada / Saída)',
      render: f => (
        <span className="tabular-nums">
          <strong className="text-emerald-700 dark:text-emerald-400">
            {f.phenology.entryHeightRotationalCm} cm
          </strong>{' '}
          <span className="text-slate-400 dark:text-zinc-500">/</span>{' '}
          <strong className="text-slate-800 dark:text-zinc-200">
            {f.phenology.exitHeightRotationalCm} cm
          </strong>
        </span>
      ),
    },
    {
      label: 'Descanso (Águas / Seca)',
      render: f => (
        <span className="tabular-nums text-slate-700 dark:text-zinc-300">
          {f.phenology.grazingRestPeriodDays.rainy.min}–{f.phenology.grazingRestPeriodDays.rainy.max} d ·{' '}
          {f.phenology.grazingRestPeriodDays.dry.min}–{f.phenology.grazingRestPeriodDays.dry.max} d
        </span>
      ),
    },
    {
      label: 'Exigência de Fertilidade',
      render: f => (
        <span className="font-medium text-slate-800 dark:text-zinc-200">
          {FERTILITY_LABELS[f.soilAndClimate.fertilityRequirement]}
        </span>
      ),
    },
    {
      label: 'Saturação por Bases (V% Alvo)',
      render: f => (
        <span className="tabular-nums font-medium text-slate-800 dark:text-zinc-200">
          {f.fertilization.targetBaseSaturationPercent}% (pH {f.soilAndClimate.phRange.ideal})
        </span>
      ),
    },
    {
      label: 'Tolerância a Encharcamento',
      render: f => (
        <span className="text-slate-700 dark:text-zinc-300">
          {f.soilAndClimate.waterloggingTolerance}
        </span>
      ),
    },
    {
      label: 'Tolerância à Seca / Geadas',
      render: f => (
        <span className="text-slate-700 dark:text-zinc-300">
          Seca: <strong>{f.phenology.droughtTolerance}</strong> · Geada:{' '}
          <strong>{f.phenology.frostTolerance}</strong>
        </span>
      ),
    },
    {
      label: 'Aptidão ILPF / Sombra',
      render: f => (
        <span className="text-slate-700 dark:text-zinc-300">
          {f.strengthsAndWeaknesses.ilpfCompatibilityRating}
          {f.phenology.shadeTolerancePercent !== undefined && (
            <span className="text-slate-400 dark:text-zinc-500 tabular-nums">
              {' '}
              ({f.phenology.shadeTolerancePercent}% sombra)
            </span>
          )}
        </span>
      ),
    },
    {
      label: 'Estabelecimento / Pontos VC',
      render: f => (
        <span className="tabular-nums text-slate-700 dark:text-zinc-300">
          {f.phenology.establishmentDays.min}–{f.phenology.establishmentDays.max} d ·{' '}
          {f.seeding.pureLiveSeedPointsVC > 0
            ? `${f.seeding.pureLiveSeedPointsVC} pts VC`
            : 'Mudas'}
        </span>
      ),
    },
    {
      label: 'Principal Doença / Praga',
      render: f => {
        const d = f.diseasesAndPests[0];
        if (!d) return <span className="text-slate-400">—</span>;
        return (
          <span className="text-slate-700 dark:text-zinc-300">
            {d.name}{' '}
            <span
              className={
                d.susceptibilityLevel === 'alta'
                  ? 'text-rose-600 dark:text-rose-400 font-medium'
                  : d.susceptibilityLevel === 'moderada'
                  ? 'text-amber-600 dark:text-amber-400 font-medium'
                  : 'text-emerald-600 dark:text-emerald-400 font-medium'
              }
            >
              ({SUSCEPTIBILITY_LABELS[d.susceptibilityLevel] || d.susceptibilityLevel})
            </span>
          </span>
        );
      },
    },
    {
      label: 'Conservação (Feno / Silagem)',
      render: f => (
        <span className="text-slate-600 dark:text-zinc-400 leading-snug">
          {f.strengthsAndWeaknesses.hayOrSilageSuitability}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Comparativo Técnico ({selectedForages.length}/4)
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Compare até 4 espécies simultaneamente por bromatologia, manejo e exigência edafoclimática.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {renderQuickAddSelect()}

          {selectedForages.length < 4 && (
            <button
              type="button"
              onClick={onGoToCatalog}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catálogo</span>
            </button>
          )}

          {onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-zinc-800 inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Hairline Comparison Matrix */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-950/60 border-b border-slate-200/80 dark:border-zinc-800">
                <th className="py-3 px-4 font-semibold text-slate-600 dark:text-zinc-400 w-52 min-w-[180px]">
                  Parâmetro Agronômico
                </th>
                {selectedForages.map(forage => (
                  <th
                    key={forage.id}
                    className="py-3 px-4 border-l border-slate-200/80 dark:border-zinc-800 min-w-[200px] align-top"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                          {forage.commonName}
                        </div>
                        <div className="text-[11px] font-normal italic text-slate-500 dark:text-zinc-400 truncate">
                          {forage.scientificName} · {forage.cultivar}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveForage(forage.id)}
                        aria-label={`Remover ${forage.commonName}`}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectForage(forage)}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Ver ficha completa</span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {rows.map((row, idx) => (
                <tr
                  key={row.label}
                  className={idx % 2 === 1 ? 'bg-slate-50/40 dark:bg-zinc-950/30' : undefined}
                >
                  <td className="py-2.5 px-4 font-medium text-slate-600 dark:text-zinc-400 align-top">
                    {row.label}
                  </td>
                  {selectedForages.map(forage => (
                    <td
                      key={forage.id}
                      className="py-2.5 px-4 border-l border-slate-100 dark:border-zinc-800 align-top"
                    >
                      {row.render(forage)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
