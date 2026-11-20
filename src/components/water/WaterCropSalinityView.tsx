import React, { useMemo, useState } from 'react';
import {
  Search,
  Sprout,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { CropCategory } from '../../types/waterAnalysis';
import { CROP_SALINITY_DATABASE } from '../../data/waterAnalysisData';

interface WaterCropSalinityViewProps {
  sampleEcDsM: number;
  hasAnalyses: boolean;
}

const CROP_CATEGORIES: { id: 'todas' | CropCategory; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'graos', label: 'Grãos' },
  { id: 'hortalicas', label: 'Hortaliças' },
  { id: 'frutiferas', label: 'Frutíferas' },
  { id: 'pastagens', label: 'Pastagens' },
  { id: 'industriais', label: 'Industriais' },
  { id: 'florestais', label: 'Florestais' },
  { id: 'ornamentais', label: 'Ornamentais' },
  { id: 'medicinais', label: 'Medicinais' },
];

const SENSITIVITY_OPTIONS = [
  { id: 'todas', label: 'Todas tolerâncias' },
  { id: 'sensivel', label: 'Sensível' },
  { id: 'moderadamente_sensivel', label: 'Mod. Sensível' },
  { id: 'moderadamente_tolerante', label: 'Mod. Tolerante' },
  { id: 'tolerante', label: 'Tolerante' },
] as const;

const SENSITIVITY_LABELS: Record<string, string> = {
  sensivel: 'Sensível',
  moderadamente_sensivel: 'Mod. Sensível',
  moderadamente_tolerante: 'Mod. Tolerante',
  tolerante: 'Tolerante',
};

const PAGE_SIZE = 40;

export const WaterCropSalinityView: React.FC<WaterCropSalinityViewProps> = ({
  sampleEcDsM,
  hasAnalyses,
}) => {
  const [simulatedEc, setSimulatedEc] = useState<number>(() =>
    hasAnalyses ? Number(sampleEcDsM.toFixed(2)) : 0.7
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'todas' | CropCategory>('todas');
  const [sensitivityFilter, setSensitivityFilter] = useState<string>('todas');
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  // Compute Maas & Hoffman relative yield (Yr = 100 - b * (ECe - a)) with ECe ≈ 1.5 * ECw
  const evaluatedCrops = useMemo(() => {
    const ece = simulatedEc * 1.5;
    return CROP_SALINITY_DATABASE.map((crop) => {
      const excess = Math.max(0, ece - crop.thresholdEcDeciSiemensM);
      const yieldLoss = Math.min(100, Math.round(excess * crop.yieldLossPercentPerUnitEc * 10) / 10);
      const relativeYield = Math.max(0, Math.round((100 - yieldLoss) * 10) / 10);
      const status: 'plena' | 'moderada' | 'severa' =
        yieldLoss <= 5 ? 'plena' : yieldLoss <= 25 ? 'moderada' : 'severa';
      return {
        crop,
        yieldLoss,
        relativeYield,
        status,
      };
    });
  }, [simulatedEc]);

  const stats = useMemo(() => {
    let plena = 0;
    let moderada = 0;
    let severa = 0;
    for (const item of evaluatedCrops) {
      if (item.status === 'plena') plena++;
      else if (item.status === 'moderada') moderada++;
      else severa++;
    }
    return { total: evaluatedCrops.length, plena, moderada, severa };
  }, [evaluatedCrops]);

  const filteredCrops = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return evaluatedCrops.filter(({ crop }) => {
      const matchesQuery =
        !q ||
        crop.cropName.toLowerCase().includes(q) ||
        (crop.scientificName?.toLowerCase().includes(q) ?? false);
      const matchesCategory = categoryFilter === 'todas' || crop.category === categoryFilter;
      const matchesSensitivity =
        sensitivityFilter === 'todas' || crop.sensitivityRating === sensitivityFilter;
      return matchesQuery && matchesCategory && matchesSensitivity;
    });
  }, [evaluatedCrops, searchQuery, categoryFilter, sensitivityFilter]);

  const displayedCrops = useMemo(
    () => filteredCrops.slice(0, visibleCount),
    [filteredCrops, visibleCount]
  );

  return (
    <div className="space-y-4">
      {/* Header + Interactive EC Simulator */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Banco de Tolerância à Salinidade — Maas & Hoffman (FAO 29)
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Simule o potencial produtivo de {CROP_SALINITY_DATABASE.length} culturas conforme a condutividade elétrica da água (CEw).
            </p>
          </div>
          {hasAnalyses && (
            <button
              type="button"
              onClick={() => setSimulatedEc(Number(sampleEcDsM.toFixed(2)))}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Usar Amostra ({sampleEcDsM.toFixed(2)} dS/m)
            </button>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-3.5 flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <label htmlFor="crop-ec-slider" className="text-xs font-medium text-slate-700 dark:text-zinc-300">
              CEw Simulada:
            </label>
          </div>
          <input
            id="crop-ec-slider"
            type="range"
            min={0}
            max={12}
            step={0.1}
            value={simulatedEc}
            onChange={(e) => setSimulatedEc(Number(e.target.value))}
            className="flex-1 accent-emerald-600 cursor-pointer"
          />
          <div className="flex items-center gap-3 shrink-0 tabular-nums text-xs">
            <span className="font-bold text-slate-900 dark:text-zinc-100">
              {simulatedEc.toFixed(2)} dS/m
            </span>
            <span className="text-slate-500 dark:text-zinc-400">
              (CEe est.: {(simulatedEc * 1.5).toFixed(2)} dS/m)
            </span>
          </div>
        </div>

        {/* 5-Metric Hairline Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 p-2.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Catálogo Total</span>
            <span className="text-base font-bold tabular-nums text-slate-900 dark:text-zinc-100">
              {stats.total}
            </span>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 p-2.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Sem Perda (≥95%)</span>
            <span className="text-base font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
              {stats.plena}
            </span>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 p-2.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Perda Moderada</span>
            <span className="text-base font-bold tabular-nums text-amber-700 dark:text-amber-400">
              {stats.moderada}
            </span>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 p-2.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Risco Severo</span>
            <span className="text-base font-bold tabular-nums text-rose-700 dark:text-rose-400">
              {stats.severa}
            </span>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 p-2.5 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">CEw em µS/cm</span>
            <span className="text-base font-bold tabular-nums text-slate-900 dark:text-zinc-100">
              {Math.round(simulatedEc * 1000).toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              placeholder="Buscar cultura por nome popular ou científico..."
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <select
            value={sensitivityFilter}
            onChange={(e) => {
              setSensitivityFilter(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            aria-label="Filtrar por sensibilidade salina"
            className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
          >
            {SENSITIVITY_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {CROP_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setCategoryFilter(cat.id);
                setVisibleCount(PAGE_SIZE);
              }}
              className={`h-7 px-2.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Maas & Hoffman Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                <th className="py-2.5 px-3.5">Cultura</th>
                <th className="py-2.5 px-3.5">Sensibilidade</th>
                <th className="py-2.5 px-3.5">Limiar CEe</th>
                <th className="py-2.5 px-3.5">Boro Máx.</th>
                <th className="py-2.5 px-3.5">Produtividade Est.</th>
                <th className="py-2.5 px-3.5 hidden lg:table-cell">Recomendação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
              {displayedCrops.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 dark:text-zinc-400">
                    Nenhuma cultura encontrada para os filtros aplicados.
                  </td>
                </tr>
              ) : (
                displayedCrops.map(({ crop, relativeYield, status }) => (
                  <tr
                    key={`${crop.cropName}-${crop.category}`}
                    className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40"
                  >
                    <td className="py-2.5 px-3.5">
                      <div className="font-medium text-slate-900 dark:text-zinc-100">
                        {crop.cropName}
                      </div>
                      {crop.scientificName && (
                        <div className="text-[11px] italic text-slate-500 dark:text-zinc-400">
                          {crop.scientificName}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-600 dark:text-zinc-300 whitespace-nowrap">
                      {SENSITIVITY_LABELS[crop.sensitivityRating] ?? crop.sensitivityRating}
                    </td>
                    <td className="py-2.5 px-3.5 tabular-nums text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                      {crop.thresholdEcDeciSiemensM.toFixed(1)} dS/m
                    </td>
                    <td className="py-2.5 px-3.5 tabular-nums text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                      {crop.maxBoronMgL.toFixed(1)} mg/L
                    </td>
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      {status === 'plena' ? (
                        <span className="inline-flex items-center gap-1 font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {relativeYield.toFixed(0)}%
                        </span>
                      ) : status === 'moderada' ? (
                        <span className="inline-flex items-center gap-1 font-semibold tabular-nums text-amber-700 dark:text-amber-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {relativeYield.toFixed(0)}%
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold tabular-nums text-rose-700 dark:text-rose-400">
                          <XCircle className="w-3.5 h-3.5" />
                          {relativeYield.toFixed(0)}%
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 hidden lg:table-cell text-[11px] text-slate-600 dark:text-zinc-400 max-w-xs">
                      {crop.specialRecommendations}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Lightweight Pagination Footer */}
        {filteredCrops.length > displayedCrops.length && (
          <div className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-500 dark:text-zinc-400 tabular-nums">
              Exibindo {displayedCrops.length} de {filteredCrops.length} culturas
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                className="h-7 px-3 rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium text-slate-700 dark:text-zinc-200 cursor-pointer"
              >
                Carregar mais {Math.min(PAGE_SIZE, filteredCrops.length - displayedCrops.length)}
              </button>
              <button
                type="button"
                onClick={() => setVisibleCount(filteredCrops.length)}
                className="h-7 px-3 rounded-md text-emerald-700 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
              >
                Mostrar todas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaterCropSalinityView;
