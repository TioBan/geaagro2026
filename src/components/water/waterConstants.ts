import { CollectionPointType, IGARange, WaterPurpose } from '../../types/waterAnalysis';

export const WATER_STORAGE_KEY = 'agronutri_water_analyses_v2';
export const COLLECTION_POINTS_STORAGE_KEY = 'agronutri_water_collection_points_v2';

export type WaterAnalysisSubTab =
  | 'dashboard_iga'
  | 'laboratorio_amostras'
  | 'interpretacao_agronomica'
  | 'assistente_correcao'
  | 'pontos_coleta'
  | 'banco_culturas'
  | 'laudo_oficial';

export const COLLECTION_POINT_TYPE_LABELS: Record<CollectionPointType, string> = {
  poco_artesiano: 'Poço Artesiano',
  poco_semiartesiano: 'Poço Semiartesiano',
  rio: 'Rio',
  lago: 'Lago',
  represa: 'Represa',
  acude: 'Açude',
  nascente: 'Nascente',
  cisterna: 'Cisterna',
  rede_publica: 'Rede Pública',
  reservatorio: 'Reservatório',
  canal_irrigacao: 'Canal de Irrigação',
  outro: 'Outro',
};

export const WATER_PURPOSE_LABELS: Record<WaterPurpose, string> = {
  irrigacao: 'Irrigação',
  fertirrigacao: 'Fertirrigação',
  pulverizacao: 'Pulverização',
  hidroponia: 'Hidroponia',
  consumo_humano: 'Consumo Humano',
  bovinocultura: 'Bovinocultura',
  avicultura: 'Avicultura',
  suinocultura: 'Suinocultura',
  piscicultura: 'Piscicultura',
  viveiros_mudas: 'Viveiros de Mudas',
};

export const WATER_PURPOSE_OPTIONS: { value: WaterPurpose; label: string }[] = [
  { value: 'irrigacao', label: 'Irrigação' },
  { value: 'fertirrigacao', label: 'Fertirrigação' },
  { value: 'pulverizacao', label: 'Pulverização' },
  { value: 'hidroponia', label: 'Hidroponia' },
  { value: 'consumo_humano', label: 'Consumo Humano' },
  { value: 'bovinocultura', label: 'Bovinocultura' },
  { value: 'avicultura', label: 'Avicultura' },
  { value: 'suinocultura', label: 'Suinocultura' },
  { value: 'piscicultura', label: 'Piscicultura' },
  { value: 'viveiros_mudas', label: 'Viveiros de Mudas' },
];

export const IGA_META: Record<IGARange, { label: string; textClass: string; strokeClass: string; barClass: string }> = {
  excelente: {
    label: 'Excelente',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    strokeClass: 'stroke-emerald-600 dark:stroke-emerald-400',
    barClass: 'bg-emerald-600 dark:bg-emerald-400',
  },
  muito_boa: {
    label: 'Muito Boa',
    textClass: 'text-teal-700 dark:text-teal-400',
    strokeClass: 'stroke-teal-600 dark:stroke-teal-400',
    barClass: 'bg-teal-600 dark:bg-teal-400',
  },
  boa: {
    label: 'Boa',
    textClass: 'text-sky-700 dark:text-sky-400',
    strokeClass: 'stroke-sky-600 dark:stroke-sky-400',
    barClass: 'bg-sky-600 dark:bg-sky-400',
  },
  regular: {
    label: 'Regular',
    textClass: 'text-amber-700 dark:text-amber-400',
    strokeClass: 'stroke-amber-500 dark:stroke-amber-400',
    barClass: 'bg-amber-500 dark:bg-amber-400',
  },
  restrita: {
    label: 'Restrita',
    textClass: 'text-orange-700 dark:text-orange-400',
    strokeClass: 'stroke-orange-600 dark:stroke-orange-400',
    barClass: 'bg-orange-600 dark:bg-orange-400',
  },
  inadequada: {
    label: 'Inadequada',
    textClass: 'text-rose-700 dark:text-rose-400',
    strokeClass: 'stroke-rose-600 dark:stroke-rose-400',
    barClass: 'bg-rose-600 dark:bg-rose-400',
  },
};

export const EMITTER_RISK_META: Record<'baixo' | 'moderado' | 'alto' | 'severo', { label: string; textClass: string }> = {
  baixo: { label: 'Baixo', textClass: 'text-emerald-700 dark:text-emerald-400' },
  moderado: { label: 'Moderado', textClass: 'text-amber-700 dark:text-amber-400' },
  alto: { label: 'Alto', textClass: 'text-orange-700 dark:text-orange-400' },
  severo: { label: 'Severo', textClass: 'text-rose-700 dark:text-rose-400' },
};

export const RISK_LEVEL_META: Record<'baixo' | 'moderado' | 'alto' | 'critico', { label: string; textClass: string; borderClass: string }> = {
  baixo: {
    label: 'Risco Baixo',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    borderClass: 'border-emerald-200 dark:border-emerald-900/50',
  },
  moderado: {
    label: 'Risco Moderado',
    textClass: 'text-amber-700 dark:text-amber-400',
    borderClass: 'border-amber-200 dark:border-amber-900/50',
  },
  alto: {
    label: 'Risco Alto',
    textClass: 'text-orange-700 dark:text-orange-400',
    borderClass: 'border-orange-200 dark:border-orange-900/50',
  },
  critico: {
    label: 'Risco Crítico',
    textClass: 'text-rose-700 dark:text-rose-400',
    borderClass: 'border-rose-200 dark:border-rose-900/50',
  },
};

export const REFERENCE_STANDARD_LABELS: Record<'FAO_29' | 'MS_888' | 'CONAMA_357' | 'HIDROPONIA_PRO', string> = {
  FAO_29: 'FAO 29 (Irrigação)',
  CONAMA_357: 'CONAMA 357/2005',
  MS_888: 'Portaria GM/MS 888',
  HIDROPONIA_PRO: 'Hidroponia Profissional',
};
