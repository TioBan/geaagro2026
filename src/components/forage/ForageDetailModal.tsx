import React, { useState, useEffect, Suspense } from 'react';
import { ForageDisease, ForageItem, SoilFertilityLevel } from '../../types/forage';
import { getForagePhotoData } from '../../data/foragePhotosDatabase';
import { lazyWithRetry } from '../../utils/lazyWithRetry';
import {
  X,
  Printer,
  Leaf,
  CheckCircle2,
  AlertTriangle,
  Bug,
  Camera,
  Scale,
  BookOpen,
  FlaskConical,
  Sprout,
  Layers,
  FileText,
  ShieldCheck,
  MapPin,
} from 'lucide-react';

const ForageSideBySideCompareModal = lazyWithRetry(() =>
  import('./ForageSideBySideCompareModal').then(m => ({ default: m.ForageSideBySideCompareModal }))
);

interface ForageDetailModalProps {
  forage: ForageItem;
  onClose: () => void;
  onSelectAnotherForage?: (forage: ForageItem) => void;
}

type DetailTab =
  | 'visao_geral'
  | 'fotos'
  | 'bromatologia'
  | 'manejo'
  | 'solo'
  | 'doencas'
  | 'ficha_tecnica';

const CATEGORY_LABELS: Record<ForageItem['category'], string> = {
  graminea_tropical: 'Gramínea Tropical',
  corte_silagem: 'Corte & Silagem',
  graminea_temperada: 'Inverno / Temperada',
  leguminosa_tropical: 'Leguminosa',
  leguminosa_temperada: 'Leguminosa Temperada',
};

const FERTILITY_LABELS: Record<SoilFertilityLevel, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  muito_alta: 'Muito Alta',
};

const AGENT_LABELS: Record<ForageDisease['agentType'], string> = {
  fungo: 'Fungo',
  inseto_praga: 'Praga / Inseto',
  nematoide: 'Nematoide',
  bacteria: 'Bactéria',
  virus: 'Vírus',
  disturbio_fisiologico: 'Distúrbio Fisiológico',
};

const SUSCEPTIBILITY_LABELS: Record<ForageDisease['susceptibilityLevel'], string> = {
  alta: 'Alta',
  moderada: 'Moderada',
  tolerante: 'Tolerante',
  resistente: 'Resistente',
};

export const ForageDetailModal: React.FC<ForageDetailModalProps> = ({
  forage,
  onClose,
  onSelectAnotherForage,
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('visao_geral');
  const [showSideBySideCompare, setShowSideBySideCompare] = useState(false);

  const photoData = getForagePhotoData(forage.id);

  useEffect(() => {
    if (showSideBySideCompare) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showSideBySideCompare]);

  const tabs: Array<{
    id: DetailTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'visao_geral', label: 'Visão Geral', icon: BookOpen },
    { id: 'fotos', label: 'Fotos & Macro', icon: Camera },
    { id: 'bromatologia', label: 'Bromatologia', icon: FlaskConical },
    { id: 'manejo', label: 'Manejo & Fenologia', icon: Sprout },
    { id: 'solo', label: 'Solo & Adubação', icon: Layers },
    { id: 'doencas', label: 'Sanidade', icon: Bug },
    { id: 'ficha_tecnica', label: 'Ficha Técnica', icon: FileText },
  ];

  const handlePrint = () => {
    setActiveTab('ficha_tecnica');
    setTimeout(() => {
      window.print();
    }, 180);
  };

  const bromatologyRows = [
    {
      label: 'Proteína Bruta (PB)',
      unit: '%',
      min: forage.bromatology.crudeProteinPercent.min,
      avg: forage.bromatology.crudeProteinPercent.average,
      max: forage.bromatology.crudeProteinPercent.max,
      highlight: true,
    },
    {
      label: 'Digestibilidade In Vitro (DIVMS)',
      unit: '%',
      min: forage.bromatology.inVitroDryMatterDigestibilityPercent.min,
      avg: forage.bromatology.inVitroDryMatterDigestibilityPercent.average,
      max: forage.bromatology.inVitroDryMatterDigestibilityPercent.max,
    },
    {
      label: 'Fibra em Detergente Neutro (FDN)',
      unit: '%',
      min: forage.bromatology.neutralDetergentFiberPercent.min,
      avg: forage.bromatology.neutralDetergentFiberPercent.average,
      max: forage.bromatology.neutralDetergentFiberPercent.max,
    },
    {
      label: 'Fibra em Detergente Ácido (FDA)',
      unit: '%',
      min: forage.bromatology.acidDetergentFiberPercent.min,
      avg: forage.bromatology.acidDetergentFiberPercent.average,
      max: forage.bromatology.acidDetergentFiberPercent.max,
    },
    {
      label: 'Nutrientes Digestíveis Totais (NDT)',
      unit: '%',
      min: forage.bromatology.totalDigestibleNutrientsPercent.min,
      avg: forage.bromatology.totalDigestibleNutrientsPercent.average,
      max: forage.bromatology.totalDigestibleNutrientsPercent.max,
    },
    {
      label: 'Produtividade de Matéria Seca',
      unit: 't/ha/ano',
      min: forage.dryMatterYieldTonHaYear.min,
      avg: forage.dryMatterYieldTonHaYear.average,
      max: forage.dryMatterYieldTonHaYear.max,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="forage-detail-title"
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Compact Header */}
        <header className="px-4 py-3 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={photoData.primaryPhotoUrl}
              alt={forage.commonName}
              className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-zinc-700 shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="forage-detail-title"
                  className="text-sm sm:text-base font-semibold text-slate-900 dark:text-zinc-100 truncate"
                >
                  {forage.commonName}
                </h2>
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  {CATEGORY_LABELS[forage.category]}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 italic truncate">
                {forage.scientificName} · cv. {forage.cultivar}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowSideBySideCompare(true)}
              className="h-8 px-2.5 sm:px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Comparar Lado a Lado</span>
              <span className="sm:hidden">Comparar</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              aria-label="Imprimir ficha técnica"
              className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Imprimir</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar ficha"
              className="h-8 w-8 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 inline-flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Hairline Tabs */}
        <nav
          aria-label="Seções da ficha técnica"
          className="px-4 flex items-center gap-1 overflow-x-auto border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/40 shrink-0 print:hidden"
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* TAB: VISÃO GERAL */}
          {activeTab === 'visao_geral' && (
            <div className="space-y-4">
              {/* 4-Column Hairline KPI Strip */}
              <div className="border border-slate-200/80 dark:border-zinc-800 rounded-xl grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-zinc-800">
                <div className="p-3.5">
                  <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
                    Proteína Bruta Média
                  </span>
                  <span className="block text-lg font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums mt-0.5">
                    {forage.bromatology.crudeProteinPercent.average}%
                  </span>
                  <span className="block text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">
                    Faixa {forage.bromatology.crudeProteinPercent.min}–{forage.bromatology.crudeProteinPercent.max}%
                  </span>
                </div>
                <div className="p-3.5">
                  <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
                    Digestibilidade (DIVMS)
                  </span>
                  <span className="block text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
                    {forage.bromatology.inVitroDryMatterDigestibilityPercent.average}%
                  </span>
                  <span className="block text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">
                    NDT médio {forage.bromatology.totalDigestibleNutrientsPercent.average}%
                  </span>
                </div>
                <div className="p-3.5">
                  <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
                    Produção Anual MS
                  </span>
                  <span className="block text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
                    {forage.dryMatterYieldTonHaYear.min}–{forage.dryMatterYieldTonHaYear.max} t/ha
                  </span>
                  <span className="block text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">
                    Seca: {forage.phenology.drySeasonAccumulationPercent}% do total
                  </span>
                </div>
                <div className="p-3.5">
                  <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
                    Saturação por Bases (V%)
                  </span>
                  <span className="block text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
                    {forage.fertilization.targetBaseSaturationPercent}%
                  </span>
                  <span className="block text-[11px] text-slate-400 dark:text-zinc-500">
                    Fertilidade {FERTILITY_LABELS[forage.soilAndClimate.fertilityRequirement]}
                  </span>
                </div>
              </div>

              {/* Technical Summary + Origin */}
              <div className="border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Indicação Agronômica & Perfil
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Origem: <strong className="font-medium text-slate-700 dark:text-zinc-300">{forage.origin}</strong>
                    {' · '}
                    {forage.botanicalFamily}
                    {forage.releaseYearOrInstitution ? ` · ${forage.releaseYearOrInstitution}` : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                  {forage.strengthsAndWeaknesses.agronomicIndication}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs">
                  <div>
                    <span className="block text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-1">
                      Categorias Animais Recomendadas
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {forage.strengthsAndWeaknesses.animalCategoriesRecommended.map((cat, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px] font-medium"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="block text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-1">
                      Aptidão para Feno / Silagem & ILPF
                    </span>
                    <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                      {forage.strengthsAndWeaknesses.hayOrSilageSuitability}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                      Compatibilidade ILPF:{' '}
                      <strong className="text-slate-700 dark:text-zinc-300">
                        {forage.strengthsAndWeaknesses.ilpfCompatibilityRating}
                      </strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <section className="border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-2.5">
                  <h3 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Principais Pontos Fortes</span>
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-zinc-300">
                    {forage.strengthsAndWeaknesses.strengths.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-2.5">
                  <h3 className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Limitações & Pontos de Atenção</span>
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-zinc-300">
                    {forage.strengthsAndWeaknesses.weaknesses.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          )}

          {/* TAB: FOTOS & MACRO */}
          {activeTab === 'fotos' && (
            <div className="space-y-4">
              <div className="border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-zinc-950/60 border-b border-slate-200/80 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-slate-800 dark:text-zinc-200">
                    Registro Fotográfico de Campo — {forage.visuals.growthHabitBadge}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400">
                    <MapPin className="w-3 h-3" />
                    {photoData.tagLocation}
                  </span>
                </div>

                <div className="relative aspect-[16/9] max-h-[360px] w-full bg-slate-950 overflow-hidden">
                  <img
                    src={photoData.primaryPhotoUrl}
                    alt={`${forage.commonName} (${forage.scientificName})`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4 space-y-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
                  <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                    <strong className="text-slate-900 dark:text-zinc-100">Observação de Campo:</strong>{' '}
                    {photoData.fieldAngleDescription}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    <strong className="text-slate-700 dark:text-zinc-300">Comportamento na Seca:</strong>{' '}
                    {photoData.drySeasonPhotoNote}
                  </p>
                </div>
              </div>

              {/* Botanical Macro Diagnostics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                <section className="border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-zinc-100">
                    {photoData.macroZoomTitle}
                  </h3>
                  <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {photoData.macroZoomDescription}
                  </p>
                  <dl className="divide-y divide-slate-100 dark:divide-zinc-800 pt-1">
                    <div className="py-1.5">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                        Lígula & Colar
                      </dt>
                      <dd className="text-slate-700 dark:text-zinc-300 mt-0.5">
                        {photoData.botanicalZoomDetails.collarAndLigule}
                      </dd>
                    </div>
                    <div className="py-1.5">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                        Textura Foliar
                      </dt>
                      <dd className="text-slate-700 dark:text-zinc-300 mt-0.5">
                        {photoData.botanicalZoomDetails.leafTexture}
                      </dd>
                    </div>
                    <div className="py-1.5">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                        Inflorescência / Semente
                      </dt>
                      <dd className="text-slate-700 dark:text-zinc-300 mt-0.5">
                        {photoData.botanicalZoomDetails.seedheadVisual}
                      </dd>
                    </div>
                  </dl>
                </section>

                <section className="border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-zinc-100">
                    Morfologia Botânica Complementar
                  </h3>
                  <dl className="divide-y divide-slate-100 dark:divide-zinc-800">
                    <div className="py-1.5">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                        Lâmina Foliar
                      </dt>
                      <dd className="text-slate-700 dark:text-zinc-300 mt-0.5">
                        {forage.visuals.leafBladeDescription}
                      </dd>
                    </div>
                    <div className="py-1.5">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                        Colar & Lígula
                      </dt>
                      <dd className="text-slate-700 dark:text-zinc-300 mt-0.5">
                        {forage.visuals.collarAndLiguleDescription}
                      </dd>
                    </div>
                    <div className="py-1.5">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                        Inflorescência
                      </dt>
                      <dd className="text-slate-700 dark:text-zinc-300 mt-0.5">
                        {forage.visuals.inflorescenceType}
                      </dd>
                    </div>
                    <div className="py-1.5">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                        Sistema Radicular
                      </dt>
                      <dd className="text-slate-700 dark:text-zinc-300 mt-0.5">
                        {forage.visuals.rootSystemDescription}
                      </dd>
                    </div>
                  </dl>
                </section>
              </div>
            </div>
          )}

          {/* TAB: BROMATOLOGIA */}
          {activeTab === 'bromatologia' && (
            <div className="space-y-4">
              <div className="border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-zinc-950/60 border-b border-slate-200/80 dark:border-zinc-800 text-slate-600 dark:text-zinc-400">
                      <th className="py-2.5 px-4 font-semibold">Parâmetro Bromatológico</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Mínimo</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Média</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Máximo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 tabular-nums">
                    {bromatologyRows.map(row => (
                      <tr key={row.label}>
                        <td className="py-2.5 px-4 font-medium text-slate-700 dark:text-zinc-300">
                          {row.label}
                        </td>
                        <td className="py-2.5 px-4 text-right text-slate-500 dark:text-zinc-400">
                          {row.min} {row.unit}
                        </td>
                        <td
                          className={`py-2.5 px-4 text-right font-semibold ${
                            row.highlight
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-slate-900 dark:text-zinc-100'
                          }`}
                        >
                          {row.avg} {row.unit}
                        </td>
                        <td className="py-2.5 px-4 text-right text-slate-500 dark:text-zinc-400">
                          {row.max} {row.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <section className="border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-1.5 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-slate-900 dark:text-zinc-100">
                    Palatabilidade & Consumo Voluntário
                  </h3>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    Classificação: {forage.bromatology.palatabilityRating}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                  {forage.bromatology.voluntaryIntakeNotes}
                </p>
              </section>
            </div>
          )}

          {/* TAB: MANEJO & FENOLOGIA */}
          {activeTab === 'manejo' && (
            <div className="space-y-4">
              <div className="border border-slate-200/80 dark:border-zinc-800 rounded-xl grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-zinc-800">
                <div className="p-3.5">
                  <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
                    Entrada (95% IL)
                  </span>
                  <span className="block text-lg font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums mt-0.5">
                    {forage.phenology.entryHeightRotationalCm} cm
                  </span>
                </div>
                <div className="p-3.5">
                  <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
                    Saída / Resíduo
                  </span>
                  <span className="block text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
                    {forage.phenology.exitHeightRotationalCm} cm
                  </span>
                </div>
                <div className="p-3.5">
                  <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
                    Descanso (Águas)
                  </span>
                  <span className="block text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
                    {forage.phenology.grazingRestPeriodDays.rainy.min}–{forage.phenology.grazingRestPeriodDays.rainy.max} d
                  </span>
                </div>
                <div className="p-3.5">
                  <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
                    Descanso (Seca)
                  </span>
                  <span className="block text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
                    {forage.phenology.grazingRestPeriodDays.dry.min}–{forage.phenology.grazingRestPeriodDays.dry.max} d
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                <section className="border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-zinc-100">
                    Fenologia & Estacionalidade
                  </h3>
                  <dl className="divide-y divide-slate-100 dark:divide-zinc-800">
                    <div className="py-1.5 flex justify-between gap-3">
                      <dt className="text-slate-500 dark:text-zinc-400">Hábito de Crescimento</dt>
                      <dd className="font-medium text-slate-800 dark:text-zinc-200 capitalize text-right">
                        {forage.phenology.growthHabit.replace(/_/g, ' ')}
                      </dd>
                    </div>
                    <div className="py-1.5 flex justify-between gap-3">
                      <dt className="text-slate-500 dark:text-zinc-400">Porte Livre da Planta</dt>
                      <dd className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums text-right">
                        {forage.phenology.plantHeightRangeCm.min}–{forage.phenology.plantHeightRangeCm.max} cm
                      </dd>
                    </div>
                    <div className="py-1.5 flex justify-between gap-3">
                      <dt className="text-slate-500 dark:text-zinc-400">Tolerância à Seca</dt>
                      <dd className="font-medium text-slate-800 dark:text-zinc-200 text-right">
                        {forage.phenology.droughtTolerance}
                      </dd>
                    </div>
                    <div className="py-1.5 flex justify-between gap-3">
                      <dt className="text-slate-500 dark:text-zinc-400">Tolerância a Geadas</dt>
                      <dd className="font-medium text-slate-800 dark:text-zinc-200 text-right">
                        {forage.phenology.frostTolerance}
                      </dd>
                    </div>
                    <div className="py-1.5 flex justify-between gap-3">
                      <dt className="text-slate-500 dark:text-zinc-400">Florescimento</dt>
                      <dd className="font-medium text-slate-800 dark:text-zinc-200 text-right">
                        {forage.phenology.floweringSeason}
                      </dd>
                    </div>
                    <div className="py-1.5 flex justify-between gap-3">
                      <dt className="text-slate-500 dark:text-zinc-400">Acúmulo na Seca</dt>
                      <dd className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums text-right">
                        {forage.phenology.drySeasonAccumulationPercent}% do total anual
                      </dd>
                    </div>
                    {forage.phenology.shadeTolerancePercent !== undefined && (
                      <div className="py-1.5 flex justify-between gap-3">
                        <dt className="text-slate-500 dark:text-zinc-400">Sombreamento Tolerado</dt>
                        <dd className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums text-right">
                          Até {forage.phenology.shadeTolerancePercent}%
                        </dd>
                      </div>
                    )}
                  </dl>
                </section>

                <section className="border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-zinc-100">
                    Implantação & Semeadura
                  </h3>
                  <dl className="divide-y divide-slate-100 dark:divide-zinc-800">
                    <div className="py-1.5 flex justify-between gap-3">
                      <dt className="text-slate-500 dark:text-zinc-400">Pontos de VC</dt>
                      <dd className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums text-right">
                        {forage.seeding.pureLiveSeedPointsVC > 0
                          ? `${forage.seeding.pureLiveSeedPointsVC} pts`
                          : 'Propagação vegetativa (mudas)'}
                      </dd>
                    </div>
                    <div className="py-1.5 flex justify-between gap-3">
                      <dt className="text-slate-500 dark:text-zinc-400">Taxa em Linha</dt>
                      <dd className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums text-right">
                        {forage.seeding.seedingRateKgHa.drill.max > 0
                          ? `${forage.seeding.seedingRateKgHa.drill.min}–${forage.seeding.seedingRateKgHa.drill.max} kg/ha`
                          : 'N/A'}
                      </dd>
                    </div>
                    <div className="py-1.5 flex justify-between gap-3">
                      <dt className="text-slate-500 dark:text-zinc-400">Taxa a Lanço</dt>
                      <dd className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums text-right">
                        {forage.seeding.seedingRateKgHa.broadcast.max > 0
                          ? `${forage.seeding.seedingRateKgHa.broadcast.min}–${forage.seeding.seedingRateKgHa.broadcast.max} kg/ha`
                          : 'N/A'}
                      </dd>
                    </div>
                    <div className="py-1.5 flex justify-between gap-3">
                      <dt className="text-slate-500 dark:text-zinc-400">Profundidade</dt>
                      <dd className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums text-right">
                        {forage.seeding.seedPlantingDepthCm.min}–{forage.seeding.seedPlantingDepthCm.max} cm
                      </dd>
                    </div>
                    <div className="py-1.5 flex justify-between gap-3">
                      <dt className="text-slate-500 dark:text-zinc-400">Estabelecimento (1º Pastejo)</dt>
                      <dd className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums text-right">
                        {forage.phenology.establishmentDays.min}–{forage.phenology.establishmentDays.max} dias
                      </dd>
                    </div>
                    <div className="py-1.5 flex justify-between gap-3">
                      <dt className="text-slate-500 dark:text-zinc-400">Sementes / grama</dt>
                      <dd className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums text-right">
                        {forage.seeding.seedsPerGramApprox > 0
                          ? forage.seeding.seedsPerGramApprox.toLocaleString('pt-BR')
                          : 'Mudas'}
                      </dd>
                    </div>
                  </dl>
                </section>
              </div>
            </div>
          )}

          {/* TAB: SOLO & ADUBAÇÃO */}
          {activeTab === 'solo' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              <section className="border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-slate-900 dark:text-zinc-100">
                  Exigências Edafoclimáticas
                </h3>
                <dl className="divide-y divide-slate-100 dark:divide-zinc-800">
                  <div className="py-1.5 flex justify-between gap-3">
                    <dt className="text-slate-500 dark:text-zinc-400">Fertilidade Exigida</dt>
                    <dd className="font-medium text-slate-800 dark:text-zinc-200 text-right">
                      {FERTILITY_LABELS[forage.soilAndClimate.fertilityRequirement]}
                    </dd>
                  </div>
                  <div className="py-1.5 flex justify-between gap-3">
                    <dt className="text-slate-500 dark:text-zinc-400">Faixa de pH (Ideal)</dt>
                    <dd className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums text-right">
                      {forage.soilAndClimate.phRange.min}–{forage.soilAndClimate.phRange.max} (ideal{' '}
                      {forage.soilAndClimate.phRange.ideal})
                    </dd>
                  </div>
                  <div className="py-1.5 flex justify-between gap-3">
                    <dt className="text-slate-500 dark:text-zinc-400">Tolerância ao Alumínio</dt>
                    <dd className="font-medium text-slate-800 dark:text-zinc-200 text-right">
                      {forage.soilAndClimate.aluminumTolerance}
                    </dd>
                  </div>
                  <div className="py-1.5 flex justify-between gap-3">
                    <dt className="text-slate-500 dark:text-zinc-400">Encharcamento / Drenagem</dt>
                    <dd className="font-medium text-slate-800 dark:text-zinc-200 text-right">
                      {forage.soilAndClimate.waterloggingTolerance}
                    </dd>
                  </div>
                  <div className="py-1.5 flex justify-between gap-3">
                    <dt className="text-slate-500 dark:text-zinc-400">Pluviometria Anual</dt>
                    <dd className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums text-right">
                      {forage.soilAndClimate.annualRainfallMmRange.min}–
                      {forage.soilAndClimate.annualRainfallMmRange.max} mm (ideal{' '}
                      {forage.soilAndClimate.annualRainfallMmRange.ideal} mm)
                    </dd>
                  </div>
                  {forage.soilAndClimate.altitudeRangeMeters && (
                    <div className="py-1.5 flex justify-between gap-3">
                      <dt className="text-slate-500 dark:text-zinc-400">Altitude</dt>
                      <dd className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums text-right">
                        {forage.soilAndClimate.altitudeRangeMeters.min}–
                        {forage.soilAndClimate.altitudeRangeMeters.max} m
                      </dd>
                    </div>
                  )}
                </dl>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 pt-1">
                  <strong className="text-slate-800 dark:text-zinc-200">Textura de solo recomendada:</strong>{' '}
                  {forage.soilAndClimate.soilTextureRecommendation.join(', ')}
                </p>
              </section>

              <section className="border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-slate-900 dark:text-zinc-100">
                  Calagem & Adubação
                </h3>
                <dl className="divide-y divide-slate-100 dark:divide-zinc-800">
                  <div className="py-1.5 flex justify-between gap-3">
                    <dt className="text-slate-500 dark:text-zinc-400">Meta V% (Calagem)</dt>
                    <dd className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums text-right">
                      {forage.fertilization.targetBaseSaturationPercent}%
                    </dd>
                  </div>
                  <div className="py-1.5 flex justify-between gap-3">
                    <dt className="text-slate-500 dark:text-zinc-400">Fósforo Mín. (Mehlich-1)</dt>
                    <dd className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums text-right">
                      {forage.fertilization.minPhosphorusP_mg_dm3} mg/dm³
                    </dd>
                  </div>
                  <div className="py-1.5 flex justify-between gap-3">
                    <dt className="text-slate-500 dark:text-zinc-400">Potássio Recomendado</dt>
                    <dd className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums text-right">
                      {forage.fertilization.potassiumK_cmolc_dm3} cmolc/dm³
                    </dd>
                  </div>
                  <div className="py-1.5 flex justify-between gap-3">
                    <dt className="text-slate-500 dark:text-zinc-400">Nitrogênio (Manut. / Intensivo)</dt>
                    <dd className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums text-right">
                      {forage.fertilization.nitrogenN_kg_ha_year_range.maintenance}–
                      {forage.fertilization.nitrogenN_kg_ha_year_range.intensive} kg N/ha/ano
                    </dd>
                  </div>
                  <div className="py-1.5 flex justify-between gap-3">
                    <dt className="text-slate-500 dark:text-zinc-400">Micronutrientes</dt>
                    <dd className="font-medium text-slate-800 dark:text-zinc-200 text-right">
                      {forage.fertilization.micronutrientsNeeds}
                    </dd>
                  </div>
                </dl>
                <div className="space-y-1.5 pt-1 text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                  <p>
                    <strong className="text-slate-800 dark:text-zinc-200">Calagem:</strong>{' '}
                    {forage.fertilization.limingRecommendation}
                  </p>
                  <p>
                    <strong className="text-slate-800 dark:text-zinc-200">Plantio (NPK):</strong>{' '}
                    {forage.fertilization.establishmentFertilizerNPK}
                  </p>
                  <p>
                    <strong className="text-slate-800 dark:text-zinc-200">Manutenção:</strong>{' '}
                    {forage.fertilization.annualMaintenanceFertilizer}
                  </p>
                  <p>
                    <strong className="text-slate-800 dark:text-zinc-200">Gessagem:</strong>{' '}
                    {forage.fertilization.gypsumNeedIndication}
                  </p>
                </div>
              </section>
            </div>
          )}

          {/* TAB: DOENÇAS & PRAGAS */}
          {activeTab === 'doencas' && (
            <div className="space-y-3">
              {forage.diseasesAndPests.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-zinc-400 py-6 text-center">
                  Nenhum registro fitossanitário crítico cadastrado para esta espécie.
                </p>
              ) : (
                forage.diseasesAndPests.map((disease, idx) => (
                  <article
                    key={`${disease.id}-${idx}`}
                    className="border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-2.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                          {disease.name}
                        </h3>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                          Agente: {AGENT_LABELS[disease.agentType]}
                          {disease.scientificName ? ` · ${disease.scientificName}` : ''}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-semibold shrink-0 ${
                          disease.susceptibilityLevel === 'alta'
                            ? 'text-rose-700 dark:text-rose-400'
                            : disease.susceptibilityLevel === 'moderada'
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        Suscetibilidade: {SUSCEPTIBILITY_LABELS[disease.susceptibilityLevel]}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800">
                      <div className="space-y-1">
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                          Sintomas & Impacto
                        </span>
                        <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                          {disease.symptoms}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                          {disease.damageImpact}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          <ShieldCheck className="w-3 h-3" />
                          Controle & Manejo
                        </span>
                        <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                          {disease.controlAndManagement}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                          Condições favoráveis: {disease.favorableConditions}
                        </p>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}

          {/* TAB: FICHA TÉCNICA IMPRIMÍVEL */}
          {activeTab === 'ficha_tecnica' && (
            <div className="border border-slate-200/80 dark:border-zinc-800 rounded-xl p-5 space-y-5 text-xs">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800">
                <div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    <Leaf className="w-3 h-3" />
                    Ficha Técnica Agronômica
                  </span>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 mt-0.5">
                    {forage.commonName} — cv. {forage.cultivar}
                  </h3>
                  <p className="text-xs italic text-slate-500 dark:text-zinc-400">
                    {forage.scientificName} · {forage.botanicalFamily} · {CATEGORY_LABELS[forage.category]}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer print:hidden"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Salvar PDF</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <dl className="divide-y divide-slate-100 dark:divide-zinc-800">
                  <div className="py-1.5 flex justify-between gap-2">
                    <dt className="text-slate-500 dark:text-zinc-400">PB Média / Faixa</dt>
                    <dd className="font-medium text-slate-900 dark:text-zinc-100 tabular-nums">
                      {forage.bromatology.crudeProteinPercent.average}% (
                      {forage.bromatology.crudeProteinPercent.min}–
                      {forage.bromatology.crudeProteinPercent.max}%)
                    </dd>
                  </div>
                  <div className="py-1.5 flex justify-between gap-2">
                    <dt className="text-slate-500 dark:text-zinc-400">DIVMS / NDT</dt>
                    <dd className="font-medium text-slate-900 dark:text-zinc-100 tabular-nums">
                      {forage.bromatology.inVitroDryMatterDigestibilityPercent.average}% /{' '}
                      {forage.bromatology.totalDigestibleNutrientsPercent.average}%
                    </dd>
                  </div>
                  <div className="py-1.5 flex justify-between gap-2">
                    <dt className="text-slate-500 dark:text-zinc-400">Produção MS Anual</dt>
                    <dd className="font-medium text-slate-900 dark:text-zinc-100 tabular-nums">
                      {forage.dryMatterYieldTonHaYear.min}–{forage.dryMatterYieldTonHaYear.max} t/ha/ano
                    </dd>
                  </div>
                  <div className="py-1.5 flex justify-between gap-2">
                    <dt className="text-slate-500 dark:text-zinc-400">Manejo (Entrada / Saída)</dt>
                    <dd className="font-medium text-slate-900 dark:text-zinc-100 tabular-nums">
                      {forage.phenology.entryHeightRotationalCm} cm /{' '}
                      {forage.phenology.exitHeightRotationalCm} cm
                    </dd>
                  </div>
                  <div className="py-1.5 flex justify-between gap-2">
                    <dt className="text-slate-500 dark:text-zinc-400">Descanso (Águas / Seca)</dt>
                    <dd className="font-medium text-slate-900 dark:text-zinc-100 tabular-nums">
                      {forage.phenology.grazingRestPeriodDays.rainy.min}–
                      {forage.phenology.grazingRestPeriodDays.rainy.max} d /{' '}
                      {forage.phenology.grazingRestPeriodDays.dry.min}–
                      {forage.phenology.grazingRestPeriodDays.dry.max} d
                    </dd>
                  </div>
                </dl>

                <dl className="divide-y divide-slate-100 dark:divide-zinc-800">
                  <div className="py-1.5 flex justify-between gap-2">
                    <dt className="text-slate-500 dark:text-zinc-400">Fertilidade / Meta V%</dt>
                    <dd className="font-medium text-slate-900 dark:text-zinc-100 tabular-nums">
                      {FERTILITY_LABELS[forage.soilAndClimate.fertilityRequirement]} (
                      {forage.fertilization.targetBaseSaturationPercent}%)
                    </dd>
                  </div>
                  <div className="py-1.5 flex justify-between gap-2">
                    <dt className="text-slate-500 dark:text-zinc-400">pH Ideal</dt>
                    <dd className="font-medium text-slate-900 dark:text-zinc-100 tabular-nums">
                      {forage.soilAndClimate.phRange.ideal} ({forage.soilAndClimate.phRange.min}–
                      {forage.soilAndClimate.phRange.max})
                    </dd>
                  </div>
                  <div className="py-1.5 flex justify-between gap-2">
                    <dt className="text-slate-500 dark:text-zinc-400">Drenagem</dt>
                    <dd className="font-medium text-slate-900 dark:text-zinc-100">
                      {forage.soilAndClimate.waterloggingTolerance}
                    </dd>
                  </div>
                  <div className="py-1.5 flex justify-between gap-2">
                    <dt className="text-slate-500 dark:text-zinc-400">Seca / Geada</dt>
                    <dd className="font-medium text-slate-900 dark:text-zinc-100">
                      {forage.phenology.droughtTolerance} / {forage.phenology.frostTolerance}
                    </dd>
                  </div>
                  <div className="py-1.5 flex justify-between gap-2">
                    <dt className="text-slate-500 dark:text-zinc-400">Estabelecimento / ILPF</dt>
                    <dd className="font-medium text-slate-900 dark:text-zinc-100 tabular-nums">
                      {forage.phenology.establishmentDays.min}–{forage.phenology.establishmentDays.max} d ·{' '}
                      {forage.strengthsAndWeaknesses.ilpfCompatibilityRating}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                  <strong className="text-slate-900 dark:text-zinc-100">Indicação Técnica:</strong>{' '}
                  {forage.strengthsAndWeaknesses.agronomicIndication}
                </p>
                <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                  <strong className="text-slate-900 dark:text-zinc-100">Calagem & Adubação:</strong>{' '}
                  {forage.fertilization.limingRecommendation} · {forage.fertilization.establishmentFertilizerNPK} ·{' '}
                  {forage.fertilization.annualMaintenanceFertilizer}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Side-by-Side Comparison Modal */}
      {showSideBySideCompare && (
        <Suspense fallback={null}>
          <ForageSideBySideCompareModal
            initialForageA={forage}
            onClose={() => setShowSideBySideCompare(false)}
            onSelectForageToView={onSelectAnotherForage}
          />
        </Suspense>
      )}
    </div>
  );
};
