export interface GeoprocessamentoPlotState {
  id: string;
  code: string;
  name: string;
  farmName: string;
  areaHa: number;
  crop: string;
  cultivar: string;
  season: string;
  plantingDate: string;
  estimatedHarvestDate: string;
  irrigationType: string;
  soilTexture: string;
  coordinates: { lat: number; lng: number };
  boundaryGeoJSON?: any;
  photos: Array<{
    id: string;
    url: string;
    caption: string;
    date: string;
    stage: string;
    ndviPoint?: number;
  }>;
  // Current Remote Sensing Status
  currentNdvi: number;
  currentNdre: number;
  currentGndvi: number;
  currentSavi: number;
  currentMsavi: number;
  currentEvi: number;
  currentVari: number;
  currentNdwi: number;
  currentChlorophyll: number; // Estimated SPAD / CI-Green
  currentBiomassTonHa: number;
  currentCanopyCoverPct: number; // %
  igvvScore: number; // Índice GeaAgro de Vigor Vegetativo (0-100)
  vigorClassification: 'Alto Vigor' | 'Médio Vigor' | 'Baixo Vigor' | 'Crítico';
  highVigorPct: number;
  mediumVigorPct: number;
  lowVigorPct: number;
  criticalAreaHa: number;
  estimatedYieldKgHa: number;
  yieldPotentialPct: number; // 0-100%
  // Integrations
  phenologyStage: 'Plantio' | 'Emergência' | 'Desenvolvimento Vegetativo' | 'Florescimento' | 'Enchimento de Grãos' | 'Maturação';
  gddAccumulated: number;
  irrigationDeficitMm: number;
  soilMoisturePct: number;
  fertilityStatus: 'Adequado' | 'Deficiência N' | 'Deficiência K' | 'Deficiência P' | 'Estresse Nutricional Generalizado';
  lastSatelliteDate: string;
  cloudCoverPct: number;
}

export interface GeoprocessamentoInspectionPoint {
  id: string;
  plotId: string;
  plotCode: string;
  name: string;
  lat: number;
  lng: number;
  type: 'baixo_vigor' | 'estresse_hidrico' | 'deficiencia_nutricional' | 'falha_plantio' | 'dano_geada' | 'dano_seca' | 'praga_doenca' | 'rotina';
  severity: 'baixa' | 'media' | 'alta' | 'critica';
  status: 'pendente' | 'em_vistoria' | 'concluido';
  dateCreated: string;
  dateInspected?: string;
  inspectorName?: string;
  observations?: string;
  diagnosis?: string;
  recommendedAction?: string;
  photoUrl?: string;
  photos?: string[];
  associatedIndexValue?: number;
}

export interface GeoprocessamentoAlert {
  id: string;
  plotId: string;
  plotCode: string;
  plotName: string;
  type: 'baixo_vigor' | 'estresse_hidrico' | 'deficiencia_nutricional' | 'falha_plantio' | 'dano_geada' | 'dano_seca' | 'praga_doenca';
  title: string;
  severity: 'moderado' | 'grave' | 'critico';
  description: string;
  affectedAreaHa: number;
  affectedAreaPct: number;
  detectedDate: string;
  suggestedAction: string;
  isResolved: boolean;
}

export interface GeoprocessamentoTemporalPoint {
  stage: 'Plantio' | 'Emergência' | 'Desenvolvimento Vegetativo' | 'Florescimento' | 'Enchimento de Grãos' | 'Maturação';
  date: string;
  daysAfterPlanting: number;
  ndvi: number;
  ndre: number;
  evi: number;
  ndwi: number;
  biomass: number;
  targetExpectedNdvi: number;
}

export interface GeoprocessamentoRasterUpload {
  id: string;
  plotId: string;
  fileName: string;
  fileSize: string;
  sourceType: 'drone' | 'sentinel' | 'multispectral' | 'geotiff' | 'jpeg_geo' | 'png_geo' | 'sensor_agricola';
  captureDate: string;
  resolutionMeters: number;
  status: 'processado_offline' | 'pronto' | 'sincronizado';
  bandsAvailable: string[];
  averageNdvi: number;
  thumbnailUrl?: string;
}

export const INITIAL_GEO_PLOTS: GeoprocessamentoPlotState[] = [];

export const INITIAL_GEO_INSPECTIONS: GeoprocessamentoInspectionPoint[] = [];

export const INITIAL_GEO_ALERTS: GeoprocessamentoAlert[] = [];

export const TEMPORAL_STAGES_PROGRESSION: GeoprocessamentoTemporalPoint[] = [
  { stage: 'Plantio', date: '2026-07-20', daysAfterPlanting: 0, ndvi: 0.15, ndre: 0.12, evi: 0.14, ndwi: 0.10, biomass: 1.2, targetExpectedNdvi: 0.15 },
  { stage: 'Emergência', date: '2026-08-01', daysAfterPlanting: 12, ndvi: 0.28, ndre: 0.24, evi: 0.26, ndwi: 0.25, biomass: 3.5, targetExpectedNdvi: 0.30 },
  { stage: 'Desenvolvimento Vegetativo', date: '2026-08-20', daysAfterPlanting: 31, ndvi: 0.65, ndre: 0.58, evi: 0.62, ndwi: 0.52, biomass: 12.0, targetExpectedNdvi: 0.68 },
  { stage: 'Florescimento', date: '2026-09-05', daysAfterPlanting: 47, ndvi: 0.84, ndre: 0.76, evi: 0.80, ndwi: 0.68, biomass: 21.0, targetExpectedNdvi: 0.82 },
  { stage: 'Enchimento de Grãos', date: '2026-09-20', daysAfterPlanting: 62, ndvi: 0.82, ndre: 0.74, evi: 0.79, ndwi: 0.64, biomass: 26.5, targetExpectedNdvi: 0.85 },
  { stage: 'Maturação', date: '2026-10-25', daysAfterPlanting: 97, ndvi: 0.45, ndre: 0.38, evi: 0.42, ndwi: 0.28, biomass: 28.0, targetExpectedNdvi: 0.48 }
];

export const INITIAL_GEO_RASTERS: GeoprocessamentoRasterUpload[] = [];
