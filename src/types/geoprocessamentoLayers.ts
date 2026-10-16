import React from 'react';

export type LayerCategory = 'multispectral' | 'stress' | 'soil_nutrients' | 'operational' | 'vectors';

export interface OverlayLayerItem {
  id: string;
  name: string;
  category: LayerCategory;
  categoryLabel: string;
  description: string;
  icon: string;
  color: string;
  visible: boolean;
  opacity: number; // 0.1 to 1.0
  order: number; // visual stack priority: higher is rendered on top (higher z-index)
  legendGradient?: string[];
  legendLabels?: { min: string; mid: string; max: string };
  badge?: string;
  locked?: boolean;
}

export const INITIAL_OVERLAY_LAYERS: OverlayLayerItem[] = [
  {
    id: 'ndvi_multispectral',
    name: 'Índice de Vigor (NDVI)',
    category: 'multispectral',
    categoryLabel: 'Sensoriamento Espectral',
    description: 'Vigor fotossintético e densidade da biomassa foliar (Sentinel-2 L2A / Drone)',
    icon: '🌱',
    color: '#10b981',
    visible: true,
    opacity: 0.85,
    order: 6,
    legendGradient: ['#d73027', '#fee08b', '#66bd63', '#1a9850', '#006837'],
    legendLabels: { min: '0.10 (Solo/Baixo)', mid: '0.50 (Médio)', max: '0.90+ (Exuberante)' },
    badge: 'Sentinel & Drone'
  },
  {
    id: 'water_stress_ndwi',
    name: 'Estresse Hídrico & NDWI',
    category: 'stress',
    categoryLabel: 'Estresse & Clima',
    description: 'Teor de água foliar e déficit hídrico calculado por bandas infravermelho de onda curta (SWIR)',
    icon: '💧',
    color: '#0284c7',
    visible: true,
    opacity: 0.75,
    order: 5,
    legendGradient: ['#d73027', '#fee090', '#91bfdb', '#313695'],
    legendLabels: { min: 'Seco / Murchamento', mid: 'Moderado', max: 'Alta Turgescência' },
    badge: 'SWIR / NDWI'
  },
  {
    id: 'soil_fertility',
    name: 'Fertilidade & Amostras de Solo',
    category: 'soil_nutrients',
    categoryLabel: 'Solo & Nutrição',
    description: 'Cruzamento com laudos laboratoriais químicos (CTC, V%, fósforo e potássio)',
    icon: '🧪',
    color: '#f59e0b',
    visible: true,
    opacity: 0.70,
    order: 4,
    legendGradient: ['#b46e3c', '#e6d250', '#28b450', '#0a7828'],
    legendLabels: { min: 'Deficiência', mid: 'Equilibrado', max: 'Alta Fertilidade' },
    badge: 'Química Edáfica'
  },
  {
    id: 'pests_alerts',
    name: 'Pragas, Doenças & Nematoides',
    category: 'stress',
    categoryLabel: 'Fitossanidade & MIP',
    description: 'Mapeamento de reboleiras críticas de nematoides e focos de pragas detectados por anomalia',
    icon: '🪱',
    color: '#ef4444',
    visible: true,
    opacity: 0.85,
    order: 3,
    legendGradient: ['#ef4444', '#f97316', '#eab308'],
    legendLabels: { min: 'Foco Severo', mid: 'Atenção', max: 'Monitorado' },
    badge: 'MIP & Alertas'
  },
  {
    id: 'inspection_points',
    name: 'Pontos de Vistoria & POIs',
    category: 'operational',
    categoryLabel: 'Operações em Campo',
    description: 'Amostragens georreferenciadas com GPS em campo, fotos e diagnóstico técnico',
    icon: '📍',
    color: '#8b5cf6',
    visible: true,
    opacity: 1.0,
    order: 2,
    badge: 'Vistoria GPS'
  },
  {
    id: 'plots_boundary',
    name: 'Delimitação dos Talhões',
    category: 'vectors',
    categoryLabel: 'Vetores Cadastrais',
    description: 'Polígonos georreferenciados cadastrais e talhões da propriedade',
    icon: '📐',
    color: '#3b82f6',
    visible: true,
    opacity: 0.95,
    order: 1,
    locked: false,
    badge: 'Cadastro Técnico'
  }
];
