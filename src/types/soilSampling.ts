export type SoilSamplingStatus = 'planejado' | 'coletado' | 'enviado_laboratorio' | 'em_laboratorio' | 'analisado';

export interface SoilSamplingPoint {
  id: string;
  farmId: string;
  plotId: string;
  pointNumber: number;
  code: string; // ex: P-01, P-02, P-03...
  lat: number;
  lng: number;
  depth: '0-20' | '20-40' | '0-40' | 'subamostra';
  date: string; // YYYY-MM-DD
  subsamplesCount: number; // Quantidade de subamostras (ex: 15-20)
  status: SoilSamplingStatus;
  linkedSampleCode?: string;
  soilColor?: string; // ex: Latossolo Vermelho, Amarelado, etc.
  notes?: string;
  createdAt: string;
}

export interface PlotBoundary {
  plotId: string;
  farmId: string;
  name?: string;
  crop?: string;
  color?: string;
  notes?: string;
  coordinates: [number, number][]; // [lat, lng]
  areaHa: number;
  perimeterM: number;
  lastUpdated: string;
}

export interface SamplingGridConfig {
  gridDensityHa: number; // ex: 1 ponto por cada X hectares (1, 2, 3, 5 ha)
  pattern: 'regular' | 'zigzag' | 'aleatorio';
  depth: '0-20' | '20-40';
  targetDate: string;
  subsamplesPerPoint: number;
}

export interface GeoTIFFOverlay {
  id: string;
  name: string;
  imageUrl: string;
  bounds: [[number, number], [number, number]]; // [[south, west], [north, east]]
  opacity: number;
  visible: boolean;
  fileSizeStr?: string;
  bandsCount?: number;
  minVal?: number;
  maxVal?: number;
}
