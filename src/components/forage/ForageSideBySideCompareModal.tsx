import React, { useState, useEffect, useMemo } from 'react';
import { ForageItem, SoilFertilityLevel } from '../../types/forage';
import { FORAGES_CATALOG } from '../../data/foragesCatalogData';
import { getForagePhotoData } from '../../data/foragePhotosDatabase';
import {
  X,
  ArrowLeftRight,
  Layers,
  FlaskConical,
  Scale,
  Sprout,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Info,
} from 'lucide-react';

interface ForageSideBySideCompareModalProps {
  initialForageA: ForageItem;
  initialForageB?: ForageItem;
  onClose: () => void;
  onSelectForageToView?: (forage: ForageItem) => void;
}

type CompareTab = 'solo_adubacao' | 'nutricao_bromatologia' | 'sintese_veredito' | 'manejo_fenologia';

const FERTILITY_LABELS: Record<SoilFertilityLevel, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  muito_alta: 'Muito Alta',
};

export const ForageSideBySideCompareModal: React.FC<ForageSideBySideCompareModalProps> = ({
  initialForageA,
  initialForageB,
  onClose,
  onSelectForageToView,
}) => {
  const defaultB = useMemo(() => {
    if (initialForageB && initialForageB.id !== initialForageA.id) {
      return initialForageB;
    }
    return FORAGES_CATALOG.find(f => f.id !== initialForageA.id) || FORAGES_CATALOG[0];
  }, [initialForageA.id, initialForageB]);

  const [forageAId, setForageAId] = useState<string>(initialForageA.id);
  const [forageBId, setForageBId] = useState<string>(defaultB.id);
  const [activeTab, setActiveTab] = useState<CompareTab>('solo_adubacao');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const forageA = FORAGES_CATALOG.find(f => f.id === forageAId) || initialForageA;
  const forageB = FORAGES_CATALOG.find(f => f.id === forageBId) || defaultB;

  const photoDataA = getForagePhotoData(forageA.id);
  const photoDataB = getForagePhotoData(forageB.id);

  const handleSwap = () => {
    setForageAId(forageBId);
    setForageBId(forageAId);
  };

  const tabs: Array<{
    id: CompareTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'solo_adubacao', label: 'Solo & Adubação', icon: Layers },
    { id: 'nutricao_bromatologia', label: 'Nutrição & Bromatologia', icon: FlaskConical },
    { id: 'sintese_veredito', label: 'Síntese & Veredito', icon: Scale },
    { id: 'manejo_fenologia', label: 'Manejo & Fenologia', icon: Sprout },
  ];

  const renderComparisonTable = (
    headerLabel: string,
    rows: Array<{ label: string; a: React.ReactNode; b: React.ReactNode }>
  ) => (
    <div className="border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-zinc-950/60 border-b border-slate-200/80 dark:border-zinc-800">
              <th className="py-2.5 px-3.5 font-semibold text-slate-600 dark:text-zinc-400 w-1/4 min-w-[160px]">
                {headerLabel}
              </th>
              <th className="py-2.5 px-3.5 font-semibold text-emerald-700 dark:text-emerald-400 w-3/8 min-w-[200px] border-l border-slate-200/80 dark:border-zinc-800">
                {forageA.commonName} ({forageA.cultivar})
              </th>
              <th className="py-2.5 px-3.5 font-semibold text-blue-700 dark:text-blue-400 w-3/8 min-w-[200px] border-l border-slate-200/80 dark:border-zinc-800">
                {forageB.commonName} ({forageB.cultivar})
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
            {rows.map((row, idx) => (
              <tr
                key={row.label}
                className={idx % 2 === 1 ? 'bg-slate-50/40 dark:bg-zinc-950/30' : undefined}
              >
                <td className="py-2.5 px-3.5 font-medium text-slate-600 dark:text-zinc-400 align-top">
                  {row.label}
                </td>
                <td className="py-2.5 px-3.5 border-l border-slate-100 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 align-top">
                  {row.a}
                </td>
                <td className="py-2.5 px-3.5 border-l border-slate-100 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 align-top">
                  {row.b}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const soilRows = [
    {
      label: 'Exigência de Fertilidade',
      a: (
        <span className="font-semibold">
          {FERTILITY_LABELS[forageA.soilAndClimate.fertilityRequirement]}
        </span>
      ),
      b: (
        <span className="font-semibold">
          {FERTILITY_LABELS[forageB.soilAndClimate.fertilityRequirement]}
        </span>
      ),
    },
    {
      label: 'Saturação por Bases (V% Alvo)',
      a: (
        <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
          {forageA.fertilization.targetBaseSaturationPercent}%
        </span>
      ),
      b: (
        <span className="font-semibold text-blue-700 dark:text-blue-400 tabular-nums">
          {forageB.fertilization.targetBaseSaturationPercent}%
        </span>
      ),
    },
    {
      label: 'Faixa de pH (Ideal)',
      a: (
        <span className="tabular-nums">
          {forageA.soilAndClimate.phRange.min}–{forageA.soilAndClimate.phRange.max} (ideal{' '}
          <strong>{forageA.soilAndClimate.phRange.ideal}</strong>)
        </span>
      ),
      b: (
        <span className="tabular-nums">
          {forageB.soilAndClimate.phRange.min}–{forageB.soilAndClimate.phRange.max} (ideal{' '}
          <strong>{forageB.soilAndClimate.phRange.ideal}</strong>)
        </span>
      ),
    },
    {
      label: 'Tolerância a Alumínio',
      a: forageA.soilAndClimate.aluminumTolerance,
      b: forageB.soilAndClimate.aluminumTolerance,
    },
    {
      label: 'Encharcamento / Drenagem',
      a: forageA.soilAndClimate.waterloggingTolerance,
      b: forageB.soilAndClimate.waterloggingTolerance,
    },
    {
      label: 'Aptidão ILPF / Sombra',
      a: (
        <span>
          {forageA.strengthsAndWeaknesses.ilpfCompatibilityRating}
          {forageA.phenology.shadeTolerancePercent !== undefined && (
            <span className="text-slate-400 dark:text-zinc-500 tabular-nums">
              {' '}
              (até {forageA.phenology.shadeTolerancePercent}%)
            </span>
          )}
        </span>
      ),
      b: (
        <span>
          {forageB.strengthsAndWeaknesses.ilpfCompatibilityRating}
          {forageB.phenology.shadeTolerancePercent !== undefined && (
            <span className="text-slate-400 dark:text-zinc-500 tabular-nums">
              {' '}
              (até {forageB.phenology.shadeTolerancePercent}%)
            </span>
          )}
        </span>
      ),
    },
    {
      label: 'Pluviometria Anual',
      a: (
        <span className="tabular-nums">
          {forageA.soilAndClimate.annualRainfallMmRange.min}–
          {forageA.soilAndClimate.annualRainfallMmRange.max} mm/ano
        </span>
      ),
      b: (
        <span className="tabular-nums">
          {forageB.soilAndClimate.annualRainfallMmRange.min}–
          {forageB.soilAndClimate.annualRainfallMmRange.max} mm/ano
        </span>
      ),
    },
    {
      label: 'Fósforo Mín. (Mehlich-1)',
      a: <span className="tabular-nums">{forageA.fertilization.minPhosphorusP_mg_dm3} mg/dm³</span>,
      b: <span className="tabular-nums">{forageB.fertilization.minPhosphorusP_mg_dm3} mg/dm³</span>,
    },
    {
      label: 'Nitrogênio (Manut. / Intensivo)',
      a: (
        <span className="tabular-nums">
          {forageA.fertilization.nitrogenN_kg_ha_year_range.maintenance}–
          {forageA.fertilization.nitrogenN_kg_ha_year_range.intensive} kg N/ha/ano
        </span>
      ),
      b: (
        <span className="tabular-nums">
          {forageB.fertilization.nitrogenN_kg_ha_year_range.maintenance}–
          {forageB.fertilization.nitrogenN_kg_ha_year_range.intensive} kg N/ha/ano
        </span>
      ),
    },
    {
      label: 'Potássio no Solo',
      a: (
        <span className="tabular-nums">{forageA.fertilization.potassiumK_cmolc_dm3} cmolc/dm³</span>
      ),
      b: (
        <span className="tabular-nums">{forageB.fertilization.potassiumK_cmolc_dm3} cmolc/dm³</span>
      ),
    },
    {
      label: 'Textura de Solo',
      a: forageA.soilAndClimate.soilTextureRecommendation.join(', '),
      b: forageB.soilAndClimate.soilTextureRecommendation.join(', '),
    },
  ];

  const nutritionBars = [
    {
      label: 'Proteína Bruta Média (PB)',
      valA: forageA.bromatology.crudeProteinPercent.average,
      valB: forageB.bromatology.crudeProteinPercent.average,
      maxScale: 26,
      unit: '%',
    },
    {
      label: 'Digestibilidade (DIVMS)',
      valA: forageA.bromatology.inVitroDryMatterDigestibilityPercent.average,
      valB: forageB.bromatology.inVitroDryMatterDigestibilityPercent.average,
      maxScale: 85,
      unit: '%',
    },
    {
      label: 'Energia (NDT)',
      valA: forageA.bromatology.totalDigestibleNutrientsPercent.average,
      valB: forageB.bromatology.totalDigestibleNutrientsPercent.average,
      maxScale: 80,
      unit: '%',
    },
    {
      label: 'Produção Máxima MS',
      valA: forageA.dryMatterYieldTonHaYear.max,
      valB: forageB.dryMatterYieldTonHaYear.max,
      maxScale: 55,
      unit: ' t/ha',
    },
  ];

  const nutritionRows = [
    {
      label: 'Proteína Bruta (Faixa)',
      a: (
        <span className="tabular-nums">
          <strong>{forageA.bromatology.crudeProteinPercent.average}%</strong> (
          {forageA.bromatology.crudeProteinPercent.min}–
          {forageA.bromatology.crudeProteinPercent.max}%)
        </span>
      ),
      b: (
        <span className="tabular-nums">
          <strong>{forageB.bromatology.crudeProteinPercent.average}%</strong> (
          {forageB.bromatology.crudeProteinPercent.min}–
          {forageB.bromatology.crudeProteinPercent.max}%)
        </span>
      ),
    },
    {
      label: 'DIVMS (Faixa)',
      a: (
        <span className="tabular-nums">
          <strong>{forageA.bromatology.inVitroDryMatterDigestibilityPercent.average}%</strong> (
          {forageA.bromatology.inVitroDryMatterDigestibilityPercent.min}–
          {forageA.bromatology.inVitroDryMatterDigestibilityPercent.max}%)
        </span>
      ),
      b: (
        <span className="tabular-nums">
          <strong>{forageB.bromatology.inVitroDryMatterDigestibilityPercent.average}%</strong> (
          {forageB.bromatology.inVitroDryMatterDigestibilityPercent.min}–
          {forageB.bromatology.inVitroDryMatterDigestibilityPercent.max}%)
        </span>
      ),
    },
    {
      label: 'FDN / FDA Médios',
      a: (
        <span className="tabular-nums">
          FDN {forageA.bromatology.neutralDetergentFiberPercent.average}% · FDA{' '}
          {forageA.bromatology.acidDetergentFiberPercent.average}%
        </span>
      ),
      b: (
        <span className="tabular-nums">
          FDN {forageB.bromatology.neutralDetergentFiberPercent.average}% · FDA{' '}
          {forageB.bromatology.acidDetergentFiberPercent.average}%
        </span>
      ),
    },
    {
      label: 'Produção MS Anual',
      a: (
        <span className="tabular-nums font-medium">
          {forageA.dryMatterYieldTonHaYear.min}–{forageA.dryMatterYieldTonHaYear.max} t/ha/ano
        </span>
      ),
      b: (
        <span className="tabular-nums font-medium">
          {forageB.dryMatterYieldTonHaYear.min}–{forageB.dryMatterYieldTonHaYear.max} t/ha/ano
        </span>
      ),
    },
    {
      label: 'Palatabilidade & Consumo',
      a: (
        <div>
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
            {forageA.bromatology.palatabilityRating}
          </span>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
            {forageA.bromatology.voluntaryIntakeNotes}
          </p>
        </div>
      ),
      b: (
        <div>
          <span className="font-semibold text-blue-700 dark:text-blue-400">
            {forageB.bromatology.palatabilityRating}
          </span>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
            {forageB.bromatology.voluntaryIntakeNotes}
          </p>
        </div>
      ),
    },
    {
      label: 'Aptidão Animal',
      a: forageA.strengthsAndWeaknesses.animalCategoriesRecommended.join(', '),
      b: forageB.strengthsAndWeaknesses.animalCategoriesRecommended.join(', '),
    },
    {
      label: 'Conservação (Feno / Silagem)',
      a: forageA.strengthsAndWeaknesses.hayOrSilageSuitability,
      b: forageB.strengthsAndWeaknesses.hayOrSilageSuitability,
    },
  ];

  const managementRows = [
    {
      label: 'Hábito de Crescimento',
      a: <span className="capitalize">{forageA.phenology.growthHabit.replace(/_/g, ' ')}</span>,
      b: <span className="capitalize">{forageB.phenology.growthHabit.replace(/_/g, ' ')}</span>,
    },
    {
      label: 'Altura de Entrada (95% IL)',
      a: (
        <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
          {forageA.phenology.entryHeightRotationalCm} cm
        </span>
      ),
      b: (
        <span className="font-semibold text-blue-700 dark:text-blue-400 tabular-nums">
          {forageB.phenology.entryHeightRotationalCm} cm
        </span>
      ),
    },
    {
      label: 'Altura de Saída / Resíduo',
      a: (
        <span className="font-semibold tabular-nums">
          {forageA.phenology.exitHeightRotationalCm} cm
        </span>
      ),
      b: (
        <span className="font-semibold tabular-nums">
          {forageB.phenology.exitHeightRotationalCm} cm
        </span>
      ),
    },
    {
      label: 'Descanso (Águas / Seca)',
      a: (
        <span className="tabular-nums">
          Águas:{' '}
          <strong>
            {forageA.phenology.grazingRestPeriodDays.rainy.min}–
            {forageA.phenology.grazingRestPeriodDays.rainy.max} d
          </strong>{' '}
          · Seca:{' '}
          <strong>
            {forageA.phenology.grazingRestPeriodDays.dry.min}–
            {forageA.phenology.grazingRestPeriodDays.dry.max} d
          </strong>
        </span>
      ),
      b: (
        <span className="tabular-nums">
          Águas:{' '}
          <strong>
            {forageB.phenology.grazingRestPeriodDays.rainy.min}–
            {forageB.phenology.grazingRestPeriodDays.rainy.max} d
          </strong>{' '}
          · Seca:{' '}
          <strong>
            {forageB.phenology.grazingRestPeriodDays.dry.min}–
            {forageB.phenology.grazingRestPeriodDays.dry.max} d
          </strong>
        </span>
      ),
    },
    {
      label: 'Tolerância à Seca / Geadas',
      a: (
        <span>
          Seca: <strong>{forageA.phenology.droughtTolerance}</strong> · Geadas:{' '}
          <strong>{forageA.phenology.frostTolerance}</strong>
        </span>
      ),
      b: (
        <span>
          Seca: <strong>{forageB.phenology.droughtTolerance}</strong> · Geadas:{' '}
          <strong>{forageB.phenology.frostTolerance}</strong>
        </span>
      ),
    },
    {
      label: 'Acúmulo na Seca (% anual)',
      a: (
        <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
          {forageA.phenology.drySeasonAccumulationPercent}% do total anual
        </span>
      ),
      b: (
        <span className="font-semibold text-blue-700 dark:text-blue-400 tabular-nums">
          {forageB.phenology.drySeasonAccumulationPercent}% do total anual
        </span>
      ),
    },
    {
      label: 'Estabelecimento & Pontos VC',
      a: (
        <span className="tabular-nums">
          {forageA.phenology.establishmentDays.min}–{forageA.phenology.establishmentDays.max} dias ·{' '}
          {forageA.seeding.pureLiveSeedPointsVC > 0
            ? `${forageA.seeding.pureLiveSeedPointsVC} pts VC`
            : 'Mudas'}
        </span>
      ),
      b: (
        <span className="tabular-nums">
          {forageB.phenology.establishmentDays.min}–{forageB.phenology.establishmentDays.max} dias ·{' '}
          {forageB.seeding.pureLiveSeedPointsVC > 0
            ? `${forageB.seeding.pureLiveSeedPointsVC} pts VC`
            : 'Mudas'}
        </span>
      ),
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="side-by-side-title"
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Compact Modal Header */}
        <header className="px-4 py-3 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="min-w-0">
            <h2
              id="side-by-side-title"
              className="text-sm sm:text-base font-semibold text-slate-900 dark:text-zinc-100 truncate"
            >
              Comparador Lado a Lado
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
              Compare parâmetros de solo, bromatologia, manejo e indicação entre duas cultivares.
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => window.print()}
              className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar comparador"
              className="h-8 w-8 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 inline-flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Compact Dual Selector Bar */}
        <div className="px-4 py-3 bg-slate-50/70 dark:bg-zinc-950/40 border-b border-slate-200/80 dark:border-zinc-800 shrink-0 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-2.5 items-center">
            {/* Forage A */}
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-emerald-500/40">
              <img
                src={photoDataA.primaryPhotoUrl}
                alt={forageA.commonName}
                className="w-9 h-9 rounded-md object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Forrageira A
                </span>
                <select
                  value={forageAId}
                  onChange={e => setForageAId(e.target.value)}
                  aria-label="Selecionar Forrageira A"
                  className="w-full text-xs font-medium bg-transparent text-slate-900 dark:text-zinc-100 focus:outline-none truncate"
                >
                  {FORAGES_CATALOG.map(f => (
                    <option key={f.id} value={f.id} className="bg-white dark:bg-zinc-900">
                      {f.commonName} ({f.cultivar})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <button
              type="button"
              onClick={handleSwap}
              aria-label="Inverter espécies"
              title="Inverter posições"
              className="h-8 w-8 mx-auto rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 inline-flex items-center justify-center transition-colors cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>

            {/* Forage B */}
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-blue-500/40">
              <img
                src={photoDataB.primaryPhotoUrl}
                alt={forageB.commonName}
                className="w-9 h-9 rounded-md object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  Forrageira B
                </span>
                <select
                  value={forageBId}
                  onChange={e => setForageBId(e.target.value)}
                  aria-label="Selecionar Forrageira B"
                  className="w-full text-xs font-medium bg-transparent text-slate-900 dark:text-zinc-100 focus:outline-none truncate"
                >
                  {FORAGES_CATALOG.map(f => (
                    <option key={f.id} value={f.id} className="bg-white dark:bg-zinc-900">
                      {f.commonName} ({f.cultivar})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Hairline Sub-Navigation */}
        <nav
          aria-label="Critérios de comparação"
          className="px-4 flex items-center gap-1 overflow-x-auto border-b border-slate-200/80 dark:border-zinc-800 shrink-0 print:hidden"
        >
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 h-9 px-2.5 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors cursor-pointer ${
                  active
                    ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
                    : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'solo_adubacao' && renderComparisonTable('Critério Edafoclimático', soilRows)}

          {activeTab === 'nutricao_bromatologia' && (
            <div className="space-y-4">
              {/* Visual Comparative Bars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {nutritionBars.map(bar => {
                  const pctA = Math.min(100, Math.round((bar.valA / bar.maxScale) * 100));
                  const pctB = Math.min(100, Math.round((bar.valB / bar.maxScale) * 100));
                  return (
                    <div
                      key={bar.label}
                      className="border border-slate-200/80 dark:border-zinc-800 rounded-xl p-3.5 space-y-2.5"
                    >
                      <span className="block text-xs font-semibold text-slate-800 dark:text-zinc-200">
                        {bar.label}
                      </span>
                      <div className="space-y-2 text-[11px] tabular-nums">
                        <div className="space-y-1">
                          <div className="flex justify-between gap-2">
                            <span className="text-slate-600 dark:text-zinc-400 truncate">
                              {forageA.commonName}
                            </span>
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                              {bar.valA}
                              {bar.unit}
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500"
                              style={{ width: `${pctA}%` }}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between gap-2">
                            <span className="text-slate-600 dark:text-zinc-400 truncate">
                              {forageB.commonName}
                            </span>
                            <span className="font-semibold text-blue-700 dark:text-blue-400 shrink-0">
                              {bar.valB}
                              {bar.unit}
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-600 dark:bg-blue-500"
                              style={{ width: `${pctB}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {renderComparisonTable('Parâmetro Bromatológico', nutritionRows)}
            </div>
          )}

          {activeTab === 'sintese_veredito' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {[
                  {
                    forage: forageA,
                    photo: photoDataA.primaryPhotoUrl,
                    accentText: 'text-emerald-700 dark:text-emerald-400',
                    accentBorder: 'border-emerald-500/35',
                  },
                  {
                    forage: forageB,
                    photo: photoDataB.primaryPhotoUrl,
                    accentText: 'text-blue-700 dark:text-blue-400',
                    accentBorder: 'border-blue-500/35',
                  },
                ].map(({ forage: f, photo, accentText, accentBorder }) => (
                  <section
                    key={f.id}
                    className={`border ${accentBorder} rounded-xl p-4 space-y-3 text-xs`}
                  >
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
                      <img
                        src={photo}
                        alt={f.commonName}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className={`text-sm font-semibold truncate ${accentText}`}>
                          {f.commonName} (cv. {f.cultivar})
                        </h3>
                        <p className="text-[11px] italic text-slate-500 dark:text-zinc-400 truncate">
                          {f.scientificName}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Vantagens Agronômicas
                      </span>
                      <ul className="space-y-1 text-slate-700 dark:text-zinc-300">
                        {f.strengthsAndWeaknesses.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                            <span className="text-emerald-600 dark:text-emerald-400">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1.5 pt-2.5 border-t border-slate-100 dark:border-zinc-800">
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Limitações & Pontos de Atenção
                      </span>
                      <ul className="space-y-1 text-slate-700 dark:text-zinc-300">
                        {f.strengthsAndWeaknesses.weaknesses.map((w, i) => (
                          <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                            <span className="text-amber-600 dark:text-amber-400">•</span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <p className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 leading-relaxed">
                      <strong className="text-slate-800 dark:text-zinc-200">Indicação:</strong>{' '}
                      {f.strengthsAndWeaknesses.agronomicIndication}
                    </p>
                  </section>
                ))}
              </div>

              {/* Clean Hairline Decision Matrix */}
              <section className="border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-3 text-xs">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Síntese de Decisão Agronômica
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 block">
                      Priorize {forageA.commonName} quando:
                    </span>
                    <ul className="space-y-1 text-slate-700 dark:text-zinc-300 leading-relaxed">
                      <li className="tabular-nums">
                        • Solo com V% alvo de {forageA.fertilization.targetBaseSaturationPercent}% e fertilidade{' '}
                        {FERTILITY_LABELS[forageA.soilAndClimate.fertilityRequirement].toLowerCase()}.
                      </li>
                      <li className="tabular-nums">
                        • Drenagem compatível com {forageA.soilAndClimate.waterloggingTolerance.toLowerCase()} e chuva a partir de{' '}
                        {forageA.soilAndClimate.annualRainfallMmRange.min} mm/ano.
                      </li>
                      <li className="tabular-nums">
                        • Meta nutricional de {forageA.bromatology.crudeProteinPercent.average}% PB para{' '}
                        {forageA.strengthsAndWeaknesses.animalCategoriesRecommended.slice(0, 2).join(', ')}.
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-1.5 md:border-l md:border-slate-100 md:dark:border-zinc-800 md:pl-4">
                    <span className="font-semibold text-blue-700 dark:text-blue-400 block">
                      Priorize {forageB.commonName} quando:
                    </span>
                    <ul className="space-y-1 text-slate-700 dark:text-zinc-300 leading-relaxed">
                      <li className="tabular-nums">
                        • Solo com V% alvo de {forageB.fertilization.targetBaseSaturationPercent}% e fertilidade{' '}
                        {FERTILITY_LABELS[forageB.soilAndClimate.fertilityRequirement].toLowerCase()}.
                      </li>
                      <li className="tabular-nums">
                        • Drenagem compatível com {forageB.soilAndClimate.waterloggingTolerance.toLowerCase()} e chuva a partir de{' '}
                        {forageB.soilAndClimate.annualRainfallMmRange.min} mm/ano.
                      </li>
                      <li className="tabular-nums">
                        • Meta nutricional de {forageB.bromatology.crudeProteinPercent.average}% PB para{' '}
                        {forageB.strengthsAndWeaknesses.animalCategoriesRecommended.slice(0, 2).join(', ')}.
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'manejo_fenologia' &&
            renderComparisonTable('Critério de Manejo & Fenologia', managementRows)}
        </div>

        {/* Compact Footer */}
        <footer className="px-4 py-2.5 bg-slate-50/70 dark:bg-zinc-950/40 border-t border-slate-200/80 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0 print:hidden">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Compare qualquer uma das {FORAGES_CATALOG.length} espécies cadastradas.</span>
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {onSelectForageToView && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectForageToView(forageA);
                  }}
                  className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Ficha de {forageA.commonName}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectForageToView(forageB);
                  }}
                  className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Ficha de {forageB.commonName}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
