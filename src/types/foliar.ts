export type FoliarTab =
  | 'dashboard'
  | 'propriedade'
  | 'amostra'
  | 'interpretacao'
  | 'indices'
  | 'historico'
  | 'mapa'
  | 'diario'
  | 'sintomas'
  | 'integracao_solo'
  | 'relatorios'
  | 'biblioteca'
  | 'gemeo_nutricional'
  | 'curva_absorcao';

export type NutrientClass = 'Muito Baixo' | 'Baixo' | 'Adequado' | 'Alto' | 'Muito Alto';

export interface NutrientSufficiency {
  minVeryLow: number;
  maxVeryLow: number;
  minLow: number;
  maxLow: number;
  minAdequate: number;
  maxAdequate: number;
  minHigh: number;
  maxHigh: number;
  minVeryHigh: number;
  maxVeryHigh: number;
}

export interface SufficiencyRanges {
  crop: string;
  phenologicalStage: string;
  macros: {
    N: NutrientSufficiency;
    P: NutrientSufficiency;
    K: NutrientSufficiency;
    Ca: NutrientSufficiency;
    Mg: NutrientSufficiency;
    S: NutrientSufficiency;
  };
  micros: {
    B: NutrientSufficiency;
    Zn: NutrientSufficiency;
    Fe: NutrientSufficiency;
    Mn: NutrientSufficiency;
    Cu: NutrientSufficiency;
    Mo: NutrientSufficiency;
    Cl?: NutrientSufficiency;
    Ni?: NutrientSufficiency;
  };
}

export interface LeafLabResults {
  // Macros in g/kg
  N: number; P: number; K: number; Ca: number; Mg: number; S: number;
  // Micros in mg/kg (ppm)
  B: number; Zn: number; Fe: number; Mn: number; Cu: number; Mo: number;
  Cl?: number; Ni?: number;
  // Extras in mg/kg
  Si?: number; Na?: number; Co?: number; Se?: number;
}

export interface LeafSample {
  id: string;
  sampleCode: string;
  date: string;
  responsible: string;
  farmId: string;
  fieldId: string;
  crop: string;
  cultivar: string;
  phenologicalStage: string;
  organCollected: 'Folha' | 'Pecíolo' | 'Folha Índice' | 'Outro';
  plantsSampled: number;
  notes: string;
  photos: string[];
  results: LeafLabResults;
}

export interface NutrientLibraryItem {
  symbol: string;
  name: string;
  type: 'Macro' | 'Micro' | 'Benéfico';
  functions: string;
  mobility: 'Alta' | 'Média' | 'Baixa' | 'Imóvel';
  deficiencySymptoms: string;
  excessSymptoms: string;
  fertilizerSources: string;
  interactions: string;
  peakDemandStage: string;
  references: string;
}

export interface PlotGeoVertex {
  id: string;
  lat: number;
  lng: number;
  label?: string;
}

export interface AbsorptionCurvePoint {
  stage: string;
  daysAfterPlanting: number;
  demandPercentage: number;
  actualStatus: NutrientClass;
}

export interface NutritionalTwin {
  fieldId: string;
  fieldName: string;
  crop: string;
  yieldExpected: number;
  currentStage: string;
  samples: LeafSample[];
  soilAnalysesHistory: any[];
  fertilizations: { date: string; product: string; dose: string }[];
  climateConditions: string;
}
