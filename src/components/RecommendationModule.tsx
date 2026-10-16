// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Calculator,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  HelpCircle,
  TrendingUp,
  Droplets,
  Sprout,
  Plus,
  Search,
  Printer,
  Download,
  Copy,
  Sliders,
  DollarSign,
  Activity,
  BarChart3,
  Calendar,
  Layers3,
  RefreshCw,
  Zap,
  Globe,
  Leaf,
  FlaskConical,
  X,
  BookOpen,
  Trash2,
  Coffee,
  Bell,
  Clock,
  Send,
  Share2,
  Mail,
  MessageCircle,
  MapPin,
  Table,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import {
  RecommendationTab,
  SoilAnalysisExtended,
  OrganicFertilizerItem,
  MineralFertilizerItem,
  CropAbsorptionCurve,
  ScenarioRecommendation,
  CropPlantingRecommendation,
} from '../types/recommendationsPro';
import {
  ORGANIC_FERTILIZERS_CATALOG,
  MINERAL_FERTILIZERS_CATALOG,
  ABSORPTION_CURVES_CATALOG,
  CROP_PLANTING_RECOMMENDATIONS,
  SAMPLE_SOIL_EXTENDED,
  calculateIGF,
} from '../data/recommendationsProData';

import {
  REGIONAL_BULLETINS,
  getBulletinById,
  evaluateNutrientStatus,
  RegionalBulletin,
  DEFAULT_BULLETIN_REFERENCE_PARAMS,
} from '../data/regionalBulletins';
import { SoilCalibrationCurves } from './SoilCalibrationCurves';
import { IgfExplanationModal } from './IgfExplanationModal';
import { PersonalizedRecommendationsTab } from './PersonalizedRecommendationsTab';

const POPULATION_CROP_PRESETS = [
  { id: 'soja', name: 'Soja (Glycine max)', rowSpacing: 0.45, plantsPerM: 12, pmv: 160, seedsBag: 60000, germ: 90, emerg: 92, targetPop: 266667 },
  { id: 'milho', name: 'Milho Grãos (Zea mays)', rowSpacing: 0.50, plantsPerM: 3.2, pmv: 320, seedsBag: 60000, germ: 95, emerg: 95, targetPop: 64000 },
  { id: 'algodao', name: 'Algodão (Gossypium hirsutum)', rowSpacing: 0.76, plantsPerM: 8.5, pmv: 110, seedsBag: 100000, germ: 88, emerg: 90, targetPop: 111842 },
  { id: 'feijao', name: 'Feijão (Phaseolus vulgaris)', rowSpacing: 0.45, plantsPerM: 11, pmv: 220, seedsBag: 200000, germ: 90, emerg: 92, targetPop: 244444 },
  { id: 'trigo', name: 'Trigo / Cereais de Inverno', rowSpacing: 0.17, plantsPerM: 55, pmv: 38, seedsBag: 5000000, germ: 92, emerg: 90, targetPop: 3235294 },
  { id: 'cafe', name: 'Café Arábica (Coffea arabica)', rowSpacing: 3.00, plantDistM: 0.75, pmv: 400, seedsBag: 1000, germ: 85, emerg: 85, targetPop: 4444 },
  { id: 'citros', name: 'Citros (Laranja/Limão)', rowSpacing: 6.00, plantDistM: 3.00, pmv: 0, seedsBag: 1, germ: 100, emerg: 100, targetPop: 556 },
  { id: 'girassol', name: 'Girassol (Helianthus annuus)', rowSpacing: 0.70, plantsPerM: 3.2, pmv: 65, seedsBag: 150000, germ: 90, emerg: 90, targetPop: 45714 },
  { id: 'sorgo', name: 'Sorgo Granífero', rowSpacing: 0.50, plantsPerM: 9.0, pmv: 28, seedsBag: 100000, germ: 88, emerg: 88, targetPop: 180000 },
];

const TOPDRESSING_SOURCES_CATALOG = [
  // Potássicos
  { id: 'min-kcl', name: 'Cloreto de Potássio - KCl (60% K₂O)', category: 'potassio', n: 0, p2o5: 0, k2o: 60, ca: 0, mg: 0, s: 0, b: 0, zn: 0, cu: 0, mn: 0, mo: 0, isPotassium: true },
  { id: 'min-sulfato-potassio', name: 'Sulfato de Potássio - K₂SO₄ (50% K₂O + 17% S)', category: 'potassio', n: 0, p2o5: 0, k2o: 50, ca: 0, mg: 0, s: 17, b: 0, zn: 0, cu: 0, mn: 0, mo: 0, isPotassium: true },
  { id: 'min-nitrato-potassio', name: 'Nitrato de Potássio - KNO₃ (13% N + 44% K₂O)', category: 'potassio', n: 13, p2o5: 0, k2o: 44, ca: 0, mg: 0, s: 0, b: 0, zn: 0, cu: 0, mn: 0, mo: 0, isPotassium: true },
  { id: 'min-kcl-s', name: 'KCl Granulado + Enxofre (58% K₂O + 6% S)', category: 'potassio', n: 0, p2o5: 0, k2o: 58, ca: 0, mg: 0, s: 6, b: 0, zn: 0, cu: 0, mn: 0, mo: 0, isPotassium: true },
  { id: 'npk-00-00-60', name: 'Formulado Potássico 00-00-60 (60% K₂O)', category: 'potassio', n: 0, p2o5: 0, k2o: 60, ca: 0, mg: 0, s: 0, b: 0, zn: 0, cu: 0, mn: 0, mo: 0, isPotassium: true },

  // Nitrogenados / Mistos
  { id: 'min-ureia', name: 'Ureia Agrícola 45% N (com inibidor NBPT)', category: 'nitrogenio', n: 45, p2o5: 0, k2o: 0, ca: 0, mg: 0, s: 0, b: 0, zn: 0, cu: 0, mn: 0, mo: 0, isPotassium: false },
  { id: 'min-sulfato-amonio', name: 'Sulfato de Amônio (21% N + 24% S)', category: 'nitrogenio', n: 21, p2o5: 0, k2o: 0, ca: 0, mg: 0, s: 24, b: 0, zn: 0, cu: 0, mn: 0, mo: 0, isPotassium: false },
  { id: 'npk-20-00-20', name: 'NPK 20-00-20 (20% N + 20% K₂O)', category: 'nitrogenio', n: 20, p2o5: 0, k2o: 20, ca: 0, mg: 0, s: 0, b: 0, zn: 0, cu: 0, mn: 0, mo: 0, isPotassium: true },
  { id: 'npk-10-00-30', name: 'NPK 10-00-30 (10% N + 30% K₂O)', category: 'potassio', n: 10, p2o5: 0, k2o: 30, ca: 0, mg: 0, s: 0, b: 0, zn: 0, cu: 0, mn: 0, mo: 0, isPotassium: true },

  // Cálcio e Magnésio (Essenciais em Frutíferas)
  { id: 'min-nitrato-calcio', name: 'Nitrato de Cálcio (15,5% N + 19% Ca)', category: 'calcio_magnesio', n: 15.5, p2o5: 0, k2o: 0, ca: 19, mg: 0, s: 0, b: 0, zn: 0, cu: 0, mn: 0, mo: 0, isPotassium: false },
  { id: 'min-nitrato-calcio-boro', name: 'Nitrato de Cálcio + Boro (15,5% N + 19% Ca + 0,3% B)', category: 'calcio_magnesio', n: 15.5, p2o5: 0, k2o: 0, ca: 19, mg: 0, s: 0, b: 0.3, zn: 0, cu: 0, mn: 0, mo: 0, isPotassium: false },
  { id: 'min-sulfato-magnesio', name: 'Sulfato de Magnésio Solúvel (9,6% Mg + 13% S)', category: 'calcio_magnesio', n: 0, p2o5: 0, k2o: 0, ca: 0, mg: 9.6, s: 13, b: 0, zn: 0, cu: 0, mn: 0, mo: 0, isPotassium: false },
  { id: 'min-nitrato-magnesio', name: 'Nitrato de Magnésio (11% N + 9% Mg)', category: 'calcio_magnesio', n: 11, p2o5: 0, k2o: 0, ca: 0, mg: 9, s: 0, b: 0, zn: 0, cu: 0, mn: 0, mo: 0, isPotassium: false },

  // Fósforo Solúvel
  { id: 'min-map-soluvel', name: 'MAP Purificado Solúvel (12% N + 61% P₂O₅)', category: 'fosforo', n: 12, p2o5: 61, k2o: 0, ca: 0, mg: 0, s: 0, b: 0, zn: 0, cu: 0, mn: 0, mo: 0, isPotassium: false },

  // Formulados Especializados Frutíferas / Horti
  { id: 'npk-15-05-20-frutiferas', name: 'NPK 15-05-20 + Ca + Mg + Micronutrientes (Frutíferas)', category: 'npk_frutiferas', n: 15, p2o5: 5, k2o: 20, ca: 3, mg: 2, s: 4, b: 0.2, zn: 0.5, cu: 0.1, mn: 0.3, mo: 0, isPotassium: true },
  { id: 'npk-12-06-18-frutiferas', name: 'NPK 12-06-18 + 4% S + Micro (Café/Citros/Frutíferas)', category: 'npk_frutiferas', n: 12, p2o5: 6, k2o: 18, ca: 4, mg: 2, s: 4, b: 0.3, zn: 0.8, cu: 0.2, mn: 0.5, mo: 0.05, isPotassium: true },

  // Micronutrientes Cobertura / Fertirrigação
  { id: 'micro-acido-borico', name: 'Ácido Bórico / Octaborato (17% B)', category: 'micronutrientes', n: 0, p2o5: 0, k2o: 0, ca: 0, mg: 0, s: 0, b: 17, zn: 0, cu: 0, mn: 0, mo: 0, isPotassium: false },
  { id: 'micro-sulfato-zinco', name: 'Sulfato de Zinco (20% Zn + 10% S)', category: 'micronutrientes', n: 0, p2o5: 0, k2o: 0, ca: 0, mg: 0, s: 10, b: 0, zn: 20, cu: 0, mn: 0, mo: 0, isPotassium: false },
  { id: 'micro-sulfato-manganes', name: 'Sulfato de Manganês (26% Mn + 12% S)', category: 'micronutrientes', n: 0, p2o5: 0, k2o: 0, ca: 0, mg: 0, s: 12, b: 0, zn: 0, cu: 0, mn: 26, mo: 0, isPotassium: false },
  { id: 'micro-sulfato-cobre', name: 'Sulfato de Cobre (25% Cu + 12% S)', category: 'micronutrientes', n: 0, p2o5: 0, k2o: 0, ca: 0, mg: 0, s: 12, b: 0, zn: 0, cu: 25, mn: 0, mo: 0, isPotassium: false },
  { id: 'micro-mix-frutiferas', name: 'Mix Micronutrientes Frutíferas (3% B + 4% Zn + 3% Mn + 1% Cu + 0,1% Mo)', category: 'micronutrientes', n: 0, p2o5: 0, k2o: 0, ca: 0, mg: 0, s: 5, b: 3, zn: 4, cu: 1, mn: 3, mo: 0.1, isPotassium: false },

  // Personalizado
  { id: 'custom-topdressing', name: '➕ Fertilizante Personalizado (Garantia Aberta)', category: 'personalizado', n: 0, p2o5: 0, k2o: 0, ca: 0, mg: 0, s: 0, b: 0, zn: 0, cu: 0, mn: 0, mo: 0, isPotassium: false },
];

export interface ParcelaFertilizerItem {
  id: string;
  sourceId: string;
  doseKgHa: number;
  customName?: string;
  customN?: number;
  customP2O5?: number;
  customK2O?: number;
  customCa?: number;
  customMg?: number;
  customS?: number;
  customB?: number;
  customZn?: number;
  customCu?: number;
  customMn?: number;
  customMo?: number;
}

export interface ParcelaConfig {
  id: string;
  name: string;
  timing: string;
  fertilizers: ParcelaFertilizerItem[];
  observation?: string;
}

import { SoilSample, Farm, CropNutritionalTarget, Company, Agronomist } from '../types/agronomy';

interface RecommendationModuleProps {
  soilSamples?: SoilSample[];
  selectedFarm?: Farm;
  initialSelectedSampleId?: string;
  onGenerateReport?: (
    sample: SoilSample,
    crop: CropNutritionalTarget,
    yieldTarget: number,
    limingPRNT: number,
    depth: number
  ) => void;
  activeSubTab?: string;
  setActiveSubTab?: (tab: RecommendationTab) => void;
  agronomist?: Agronomist;
  company?: Company;
  onNavigateToSolos?: (subTab?: string) => void;
}

function mapSoilSampleToExtended(s: SoilSample, farm?: Farm): SoilAnalysisExtended {
  const plot = farm?.plots?.find(p => p.id === s.plotId);
  const plotName = plot ? plot.name : `Talhão ${s.plotId}`;
  
  let cropName = 'Soja';
  if (plot?.currentCrop) {
    const rawCrop = plot.currentCrop;
    if (rawCrop.includes('Café Arábica') || rawCrop.includes('Arábica') || rawCrop.toLowerCase().includes('arábica')) {
      cropName = 'Café Arábica';
    } else if (rawCrop.includes('Café Conilon') || rawCrop.includes('Conilon') || rawCrop.toLowerCase().includes('conilon')) {
      cropName = 'Café Conilon';
    } else if (rawCrop.toLowerCase().includes('soja')) {
      cropName = 'Soja';
    } else if (rawCrop.toLowerCase().includes('milho')) {
      cropName = 'Milho';
    } else {
      cropName = rawCrop.split('(')[0].trim();
    }
  }

  const sb = s.sb ?? ((s.caCmolcDm3 || 0) + (s.mgCmolcDm3 || 0) + (s.kCmolcDm3 || 0));
  const t = s.ctcTotal ?? (sb + (s.hAlCmolcDm3 || 0));
  const baseSat = s.vPercent ?? (t > 0 ? (sb / t) * 100 : 0);
  const alSat = s.mPercent ?? (((sb + (s.alCmolcDm3 || 0)) > 0) ? ((s.alCmolcDm3 || 0) / (sb + (s.alCmolcDm3 || 0))) * 100 : 0);

  return {
    id: s.id,
    sampleCode: s.sampleCode,
    laboratoryName: s.labName || 'Laboratório de Análise',
    analysisDate: s.collectionDate,
    depth: s.depth as any,
    plotId: s.plotId,
    plotName: plotName,
    cropName: cropName,
    cultivar: plot?.currentCrop || '',
    expectedYield: cropName.includes('Café') ? 45 : 75,
    yieldUnit: cropName.includes('Café') ? 'sc/ha' : 'sc/ha',
    
    phCacl2: s.phCaCl2,
    phH2o: s.phH2O || (s.phCaCl2 + 0.7),
    phSmp: s.phSmp || 6.0,
    organicMatterGKg: s.organicMatterGdm3,
    organicCarbonGKg: Number(((s.organicMatterGdm3 || 0) / 1.724).toFixed(1)),
    pMehlich1: s.pMehlich1MgDm3 || 0,
    pMehlich3: s.pMehlich3MgDm3,
    pResina: s.pResinaMgDm3 || s.pMehlich1MgDm3 || 0,
    pRemanescente: s.pRemanescenteMgL || 20,
    pRemanescente3: s.pRemanescente3MgL || 18,
    kCmolc: s.kCmolcDm3 || 0,
    kMgDm3: Math.round((s.kCmolcDm3 || 0) * 391),
    caCmolc: s.caCmolcDm3 || 0,
    mgCmolc: s.mgCmolcDm3 || 0,
    naCmolc: s.naCmolcDm3 || 0,
    alCmolc: s.alCmolcDm3 || 0,
    hAlCmolc: s.hAlCmolcDm3 || 0,
    sSulfurMgDm3: s.sSO4MgDm3 || 0,
    bBoroMgDm3: s.bMgDm3 || 0,
    cuCobreMgDm3: s.cuMgDm3 || 0,
    feFerroMgDm3: s.feMgDm3 || 0,
    mnManganesMgDm3: s.mnMgDm3 || 0,
    znZincoMgDm3: s.znMgDm3 || 0,
    moMolibdenioMgDm3: s.moMgDm3 || 0.1,
    coCobaltoMgDm3: s.coMgDm3 || 0.05,
    niNiquelMgDm3: s.niMgDm3 || 0.15,
    siSilicioMgDm3: s.siMgDm3 || 10,
    
    clayPercent: s.clayPercent || 30,
    siltPercent: s.siltPercent || 10,
    sandPercent: s.sandPercent || 60,
    texturalClass: (s.clayPercent || 30) > 35 ? 'Argilosa' : (s.clayPercent || 30) > 15 ? 'Média' : 'Arenosa',
    soilDensityGcm3: s.soilDensityGcm3 || 1.2,
    
    betaGlucosidaseActivity: s.betaGlucosidaseMgPnpKgH,
    arylsulfataseActivity: s.arylsulfataseMgPnpKgH,
    acidPhosphataseActivity: s.acidPhosphataseMgPnpKgH,
    
    sumOfBases: sb,
    effectiveCtc: s.ctcEffective ?? (sb + (s.alCmolcDm3 || 0)),
    potentialCtc: t,
    baseSaturationPercent: baseSat,
    aluminumSaturationPercent: alSat,
    caMgRatio: s.caMgRatio || ((s.mgCmolcDm3 || 0) > 0 ? (s.caCmolcDm3 || 0) / s.mgCmolcDm3 : 0),
    caKRatio: s.caKRatio || ((s.kCmolcDm3 || 0) > 0 ? (s.caCmolcDm3 || 0) / s.kCmolcDm3 : 0),
    mgKRatio: s.mgKRatio || ((s.kCmolcDm3 || 0) > 0 ? (s.mgCmolcDm3 || 0) / s.kCmolcDm3 : 0),
    caMgKRatio: (s.kCmolcDm3 || 0) > 0 ? ((s.caCmolcDm3 || 0) + (s.mgCmolcDm3 || 0)) / (s.kCmolcDm3 || 1) : 0,
    igfScore: s.iqsTotalScore ? (s.iqsTotalScore <= 1.0 ? Math.round(s.iqsTotalScore * 100) : Math.round(s.iqsTotalScore)) : 75
  };
}

// Calibrador Dinâmico de Parâmetros e Exigências da Cultura conforme o Boletim Regional Selecionado
export function getBulletinCalibratedCropParameters(
  crop: CropPlantingRecommendation,
  bulletin: RegionalBulletin,
  soil?: SoilAnalysisExtended
): CropPlantingRecommendation {
  if (!crop || !bulletin) return crop;
  const cropIdLower = (crop.cropId || '').toLowerCase();
  const cropNameLower = (crop.cropName || '').toLowerCase();
  
  // 1. Resolver Saturação por Bases (V% Alvo) pelo Boletim Regional
  let targetV = crop.targetV || 65;
  if (bulletin?.targetVByCrop) {
    if (cropIdLower.includes('soja') || cropNameLower.includes('soja')) {
      targetV = bulletin.targetVByCrop['soja'] ?? 60;
    } else if (cropIdLower.includes('milho') || cropNameLower.includes('milho') || cropIdLower.includes('sorgo') || cropNameLower.includes('sorgo')) {
      targetV = bulletin.targetVByCrop['milho'] ?? 65;
    } else if (cropIdLower.includes('cafe') || cropNameLower.includes('café') || cropNameLower.includes('cafe') || cropIdLower.includes('coffee')) {
      targetV = bulletin.targetVByCrop['cafe'] ?? 60;
    } else if (cropIdLower.includes('algodao') || cropNameLower.includes('algodão') || cropNameLower.includes('algodao')) {
      targetV = bulletin.targetVByCrop['algodao'] ?? 70;
    } else if (cropIdLower.includes('feijao') || cropNameLower.includes('feijão') || cropNameLower.includes('feijao')) {
      targetV = bulletin.targetVByCrop['feijao'] ?? 70;
    } else if (cropIdLower.includes('cana') || cropNameLower.includes('cana')) {
      targetV = bulletin.targetVByCrop['cana'] ?? 60;
    } else if (cropIdLower.includes('trigo') || cropIdLower.includes('aveia') || cropIdLower.includes('cevada') || cropNameLower.includes('trigo')) {
      targetV = bulletin.targetVByCrop['trigo'] ?? 65;
    } else if (cropIdLower.includes('citros') || cropNameLower.includes('laranja') || cropNameLower.includes('limão') || cropNameLower.includes('citros')) {
      targetV = bulletin.targetVByCrop['citros'] ?? 70;
    } else if (cropIdLower.includes('pastagem') || cropNameLower.includes('brachiaria') || cropNameLower.includes('braquiaria') || cropNameLower.includes('capim') || cropNameLower.includes('mombaça') || cropNameLower.includes('tanzânia')) {
      targetV = bulletin.targetVByCrop['pastagem'] ?? 50;
    } else if (cropIdLower.includes('alface') || cropIdLower.includes('tomate') || cropIdLower.includes('cenoura') || cropNameLower.includes('hortaliça') || cropNameLower.includes('batata')) {
      targetV = bulletin.targetVByCrop['hortalicas'] ?? 80;
    } else if (bulletin.targetVByCrop[cropIdLower] !== undefined) {
      targetV = bulletin.targetVByCrop[cropIdLower];
    } else if (bulletin.targetVByCrop[cropNameLower] !== undefined) {
      targetV = bulletin.targetVByCrop[cropNameLower];
    }
  }

  // 2. Calibrar Exigências Nutricionais (N, P2O5, K2O, Ca, Mg, S, Micros) pelo Boletim e Análise
  const baseD = { ...(crop.demandsKgPerHa || { n: 20, p2o5: 64, k2o: 50, ca: 25, mg: 12, s: 18, b: 800, cu: 350, fe: 500, mn: 1200, mo: 60, zn: 1500 }) };
  const clay = soil?.clayPercent ?? 45;
  const pVal = bulletin.phosphorusMethod === 'Resina' ? (soil?.pResina || soil?.pMehlich1 || 15) : (soil?.pMehlich1 || soil?.pResina || 10);
  const kVal = soil?.kCmolc ?? 0.20;
  
  let recFormulation = crop.recommendedFormulationId || 'npk-02-20-20';
  let plantingDose = crop.defaultPlantingDoseKgHa || 350;

  // Indicadores Regionais de Boletim
  const isCerrado = bulletin.id?.includes('cerrado') || bulletin.id?.includes('fertbio') || bulletin.code?.toLowerCase().includes('cerrado') || bulletin.code?.toLowerCase().includes('fertbio');
  const isIAC = bulletin.id?.includes('iac') || bulletin.code?.toLowerCase().includes('iac');
  const isMG = bulletin.id?.includes('5a') || bulletin.id?.includes('mg') || bulletin.region?.toLowerCase().includes('minas');
  const isSul = bulletin.id?.includes('cqfs') || bulletin.region?.toLowerCase().includes('sul');
  const isIncaper = bulletin.id?.includes('incaper') || bulletin.code?.toLowerCase().includes('incaper');

  if (cropIdLower.includes('soja') || cropNameLower.includes('soja')) {
    if (isCerrado) {
      recFormulation = clay > 45 ? 'npk-02-20-20' : 'npk-04-30-16';
      baseD.n = 15;
      baseD.p2o5 = pVal < 10 ? 85 : pVal < 18 ? 65 : 45;
      baseD.k2o = kVal < 0.25 ? 75 : 50;
      plantingDose = recFormulation === 'npk-04-30-16' ? 280 : 360;
    } else if (isIAC) {
      recFormulation = 'npk-02-20-20';
      baseD.n = 20;
      baseD.p2o5 = pVal < 15 ? 75 : pVal < 30 ? 55 : 35;
      baseD.k2o = kVal < 0.30 ? 65 : 45;
      plantingDose = 320;
    } else if (isSul) {
      recFormulation = 'npk-02-20-20';
      baseD.n = 15;
      baseD.p2o5 = pVal < 12 ? 80 : 55;
      baseD.k2o = kVal < 0.25 ? 65 : 45;
      plantingDose = 320;
    } else if (isMG) {
      recFormulation = 'npk-04-14-08';
      baseD.n = 20;
      baseD.p2o5 = pVal < 10 ? 75 : 50;
      baseD.k2o = kVal < 0.20 ? 60 : 40;
      plantingDose = 380;
    }
  } else if (cropIdLower.includes('milho') || cropNameLower.includes('milho')) {
    if (isCerrado) {
      recFormulation = 'npk-08-28-16';
      baseD.n = 30;
      baseD.p2o5 = pVal < 12 ? 95 : 70;
      baseD.k2o = kVal < 0.25 ? 65 : 45;
      plantingDose = 330;
    } else if (isIAC) {
      recFormulation = 'npk-08-28-16';
      baseD.n = 30;
      baseD.p2o5 = pVal < 20 ? 80 : 60;
      baseD.k2o = kVal < 0.30 ? 60 : 40;
      plantingDose = 300;
    } else if (isMG) {
      recFormulation = 'npk-04-14-08';
      baseD.n = 25;
      baseD.p2o5 = pVal < 15 ? 85 : 60;
      baseD.k2o = kVal < 0.20 ? 55 : 40;
      plantingDose = 400;
    } else if (isSul) {
      recFormulation = 'npk-05-20-20';
      baseD.n = 30;
      baseD.p2o5 = pVal < 15 ? 80 : 60;
      baseD.k2o = kVal < 0.25 ? 60 : 40;
      plantingDose = 350;
    }
  } else if (cropIdLower.includes('cafe') || cropNameLower.includes('café') || cropNameLower.includes('cafe')) {
    if (isIncaper) {
      recFormulation = 'npk-12-06-18-frutiferas';
      baseD.n = 45;
      baseD.p2o5 = pVal < 15 ? 65 : 40;
      baseD.k2o = 80;
      plantingDose = 380;
    } else if (isMG || isCerrado) {
      recFormulation = 'npk-10-10-10';
      baseD.n = 40;
      baseD.p2o5 = pVal < 15 ? 60 : 40;
      baseD.k2o = 60;
      plantingDose = 350;
    }
  } else if (cropIdLower.includes('algodao') || cropNameLower.includes('algodão')) {
    if (isCerrado) {
      recFormulation = 'npk-08-28-16';
      baseD.n = 25;
      baseD.p2o5 = pVal < 12 ? 90 : 60;
      baseD.k2o = kVal < 0.25 ? 70 : 50;
      plantingDose = 320;
    }
  } else if (cropIdLower.includes('trigo') || cropNameLower.includes('trigo')) {
    if (isSul) {
      recFormulation = 'npk-05-20-20';
      baseD.n = 20;
      baseD.p2o5 = 65;
      baseD.k2o = 55;
      plantingDose = 300;
    }
  } else if (cropIdLower.includes('cana') || cropNameLower.includes('cana')) {
    if (isIAC) {
      recFormulation = 'npk-05-25-15';
      baseD.n = 30;
      baseD.p2o5 = 100;
      baseD.k2o = 80;
      plantingDose = 400;
    }
  }

  const bulletinLabel = `${bulletin.code} - ${bulletin.name} (${bulletin.institution})`;

  return {
    ...crop,
    targetV,
    bulletinReference: bulletinLabel,
    recommendedFormulationId: recFormulation,
    defaultPlantingDoseKgHa: plantingDose,
    demandsKgPerHa: baseD,
    observation: `Calibração oficial pelo ${bulletin.name} (${bulletin.region}). Método P: ${bulletin.phosphorusMethod}, V% alvo de ${targetV}%, Fator gessagem: ${bulletin.gypsumFactor} × Argila%.`,
  };
}

export const RecommendationModule: React.FC<RecommendationModuleProps> = ({
  soilSamples: parentSoilSamples,
  selectedFarm,
  initialSelectedSampleId,
  onGenerateReport,
  activeSubTab: externalSubTab,
  setActiveSubTab: setExternalSubTab,
  agronomist,
  company,
  onNavigateToSolos,
}) => {
  const [internalTab, setInternalTab] = useState<RecommendationTab>('dashboard');
  const activeTab = (externalSubTab as RecommendationTab) || internalTab;
  const setActiveTab = (tab: RecommendationTab) => {
    setInternalTab(tab);
    if (setExternalSubTab) {
      setExternalSubTab(tab);
    }
  };
  const [soilAnalyses, setSoilAnalyses] = useState<SoilAnalysisExtended[]>(SAMPLE_SOIL_EXTENDED);
  const [selectedSoilId, setSelectedSoilId] = useState<string>(SAMPLE_SOIL_EXTENDED[0]?.id || '');

  // Sync parent soil samples with local state and select active one
  useEffect(() => {
    if (parentSoilSamples && (parentSoilSamples || []).length > 0) {
      const farmSamples = selectedFarm?.id
        ? (parentSoilSamples || []).filter(s => s?.farmId === selectedFarm?.id)
        : (parentSoilSamples || []);
        
      if ((farmSamples || []).length > 0) {
        const mapped = farmSamples.map(s => mapSoilSampleToExtended(s, selectedFarm));
        setSoilAnalyses(mapped);
        
        if (initialSelectedSampleId && mapped.some(m => m?.id === initialSelectedSampleId)) {
          setSelectedSoilId(initialSelectedSampleId);
        } else {
          setSelectedSoilId(mapped[0]?.id || '');
        }
      } else {
        setSoilAnalyses(SAMPLE_SOIL_EXTENDED);
        setSelectedSoilId(SAMPLE_SOIL_EXTENDED[0]?.id || '');
      }
    } else {
      setSoilAnalyses(SAMPLE_SOIL_EXTENDED);
      setSelectedSoilId(SAMPLE_SOIL_EXTENDED[0]?.id || '');
    }
  }, [parentSoilSamples, selectedFarm, initialSelectedSampleId]);

  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      // Ensure the report tab is active so the element is rendered in the DOM
      if (activeTab !== 'relatorio_laudo') {
        setActiveTab('relatorio_laudo');
      }

      showNotification('📄 Processando laudo técnico para exportação PDF...');

      // Actively wait for the element to appear in the DOM
      let element = document.getElementById('recommendation-report-content');
      if (!element) {
        for (let i = 0; i < 20; i++) {
          await new Promise(resolve => setTimeout(resolve, 80));
          element = document.getElementById('recommendation-report-content');
          if (element) break;
        }
      }

      if (!element) {
        setIsExportingPDF(false);
        showNotification('⚠️ Não foi possível localizar o laudo técnico.');
        return;
      }

      // Small delay to ensure all DOM elements and fonts are fully painted
      await new Promise(resolve => setTimeout(resolve, 200));

      const pages = element.querySelectorAll('.report-pdf-page');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      if (pages.length > 0) {
        for (let i = 0; i < pages.length; i++) {
          const pageEl = pages[i] as HTMLElement;

          let canvas: HTMLCanvasElement;
          try {
            canvas = await html2canvas(pageEl, {
              scale: 2.2, // High resolution crisp rendering
              useCORS: true,
              logging: false,
              backgroundColor: '#ffffff',
              windowWidth: 794,
              windowHeight: 1123,
            });
          } catch (errPro) {
            console.warn('html2canvas-pro failed, falling back to standard html2canvas:', errPro);
            const standardHtml2Canvas = (await import('html2canvas')).default;
            canvas = await standardHtml2Canvas(pageEl, {
              scale: 2.2,
              useCORS: true,
              logging: false,
              backgroundColor: '#ffffff',
              windowWidth: 794,
              windowHeight: 1123,
            });
          }

          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          if (i > 0) {
            pdf.addPage();
          }
          pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
        }
      } else {
        // Fallback for single container if pages not found
        let canvas = await html2canvas(element, {
          scale: 2.0,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 794,
          windowHeight: 1123,
        });
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      }

      const cleanPlot = (currentSoil?.plotName || 'Talhao').replace(/[^a-zA-Z0-9_-]/g, '_');
      const cleanCode = (currentSoil?.sampleCode || 'LAUDO').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `Laudo_Tecnico_Agronomico_${cleanCode}_${cleanPlot}.pdf`;
      pdf.save(filename);
      showNotification('✅ Laudo técnico em PDF exportado com sucesso!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      showNotification('⚠️ Não foi possível gerar o arquivo PDF. Tente novamente.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handlePrintSystem = () => {
    document.body.classList.add('recommendation-printing-now');
    window.print();
    const cleanup = () => {
      document.body.classList.remove('recommendation-printing-now');
    };
    window.addEventListener('afterprint', cleanup, { once: true });
    setTimeout(cleanup, 3000);
  };

  // Dynamic list of bulletins including custom ones from LocalStorage
  const [allBulletins, setAllBulletins] = useState<RegionalBulletin[]>(() => {
    const saved = localStorage.getItem('geaagro_custom_bulletins');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [...REGIONAL_BULLETINS, ...parsed];
      } catch (e) {
        console.error('Error parsing custom bulletins:', e);
      }
    }
    return REGIONAL_BULLETINS;
  });

  // Regional Bulletin State (Default: Cerrado - Embrapa)
  const [selectedBulletinId, setSelectedBulletinId] = useState<string>('boletim-cerrado-embrapa');

  // Missing sub-tabs state variables & simulator states
  const [twinSelectedLayer, setTwinSelectedLayer] = useState<'0-20' | '20-40' | '40-60'>('0-20');
  const [twinPhSlider, setTwinPhSlider] = useState<number>(6.0);
  const [twinOmSlider, setTwinOmSlider] = useState<number>(25);
  const [twinCompactionSlider, setTwinCompactionSlider] = useState<number>(1.2);
  const [fertilizerSearchQuery, setFertilizerSearchQuery] = useState<string>('');
  const [fertilizerTypeFilter, setFertilizerTypeFilter] = useState<'todos' | 'simples' | 'formulado_npk' | 'organico'>('todos');
  const [mapSelectedNutrient, setMapSelectedNutrient] = useState<'igf' | 'ph' | 'p' | 'k' | 'organicMatter' | 'clay'>('igf');
  const [scenarioLimestone, setScenarioLimestone] = useState<number>(2.0);
  const [scenarioOrganic, setScenarioOrganic] = useState<number>(4.0);
  const [scenarioN, setScenarioN] = useState<number>(100);

  // Estados para o Mapa de Fertilidade e Cadastro de Talhões com Polígonos Georreferenciados
  const [mapPlots, setMapPlots] = useState<Array<{
    name: string;
    type: string;
    igf: number;
    ph: number;
    p: number;
    k: number;
    organicMatter: number;
    clay: number;
    status: 'high' | 'medium' | 'low';
    coords: [number, number][]; // [[latitude, longitude], ...]
  }>>([
    {
      name: 'Talhão Sede Pivô 01',
      type: 'Soja / Milho',
      igf: 88,
      ph: 6.2,
      p: 25,
      k: 0.35,
      organicMatter: 34,
      clay: 38,
      status: 'high',
      coords: [
        [-21.120, -48.210],
        [-21.120, -48.200],
        [-21.125, -48.200],
        [-21.125, -48.210]
      ]
    },
    {
      name: 'Talhão Norte Estrada',
      type: 'Milho Safrinha',
      igf: 42,
      ph: 4.8,
      p: 6,
      k: 0.12,
      organicMatter: 16,
      clay: 18,
      status: 'low',
      coords: [
        [-21.110, -48.205],
        [-21.110, -48.195],
        [-21.115, -48.195],
        [-21.115, -48.205]
      ]
    },
    {
      name: 'Talhão Leste Encosta',
      type: 'Algodão',
      igf: 61,
      ph: 5.5,
      p: 14,
      k: 0.22,
      organicMatter: 24,
      clay: 42,
      status: 'medium',
      coords: [
        [-21.115, -48.195],
        [-21.115, -48.185],
        [-21.122, -48.185],
        [-21.122, -48.195]
      ]
    },
    {
      name: 'Talhão Sul Riacho',
      type: 'Café Conilon',
      igf: 55,
      ph: 5.2,
      p: 9,
      k: 0.18,
      organicMatter: 21,
      clay: 15,
      status: 'medium',
      coords: [
        [-21.125, -48.205],
        [-21.125, -48.195],
        [-21.132, -48.195],
        [-21.132, -48.205]
      ]
    },
    {
      name: 'Talhão Pivô Central 02',
      type: 'Soja / Trigo',
      igf: 76,
      ph: 5.9,
      p: 21,
      k: 0.28,
      organicMatter: 29,
      clay: 35,
      status: 'high',
      coords: [
        [-21.120, -48.195],
        [-21.120, -48.185],
        [-21.126, -48.185],
        [-21.126, -48.195]
      ]
    },
    {
      name: 'Talhão Reserva Bosque',
      type: 'Eucalipto',
      igf: 70,
      ph: 5.7,
      p: 18,
      k: 0.25,
      organicMatter: 27,
      clay: 22,
      status: 'high',
      coords: [
        [-21.126, -48.190],
        [-21.126, -48.180],
        [-21.132, -48.180],
        [-21.132, -48.190]
      ]
    }
  ]);

  const [newPlotName, setNewPlotName] = useState<string>('');
  const [newPlotType, setNewPlotType] = useState<string>('Soja');
  const [newPlotCoords, setNewPlotCoords] = useState<[number, number][]>([]);
  const [inputLat, setInputLat] = useState<string>('');
  const [inputLon, setInputLon] = useState<string>('');
  const [newPlotPh, setNewPlotPh] = useState<number>(6.0);
  const [newPlotP, setNewPlotP] = useState<number>(20);
  const [newPlotK, setNewPlotK] = useState<number>(0.25);
  const [newPlotOm, setNewPlotOm] = useState<number>(28);
  const [newPlotClay, setNewPlotClay] = useState<number>(35);
  const [isClickDrawing, setIsClickDrawing] = useState<boolean>(true);
  const [hoveredPlot, setHoveredPlot] = useState<number | null>(null);
  const [mapFormError, setMapFormError] = useState<string | null>(null);
  const [mapFormSuccess, setMapFormSuccess] = useState<string | null>(null);

  const { loading: geoLoading, error: geoError, getPosition } = useGeolocation();

  const handleCaptureGeolocation = async () => {
    try {
      setMapFormError(null);
      setMapFormSuccess('Buscando sinal do satélite GPS...');
      const coords = await getPosition();
      setInputLat(coords.latitude.toFixed(6));
      setInputLon(coords.longitude.toFixed(6));
      
      // Adiciona o vértice atual do usuário diretamente ao rascunho do polígono
      setNewPlotCoords(prev => [...prev, [parseFloat(coords.latitude.toFixed(6)), parseFloat(coords.longitude.toFixed(6))]]);
      setMapFormSuccess(`Localização capturada com precisão e adicionada como vértice: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`);
    } catch (err: any) {
      setMapFormError(err || 'Falha ao obter geolocalização. Por favor, verifique as permissões de GPS.');
      setMapFormSuccess(null);
    }
  };

  // Calcula os limites geográficos (bounding box) da fazenda dinamicamente
  const mapBounds = useMemo(() => {
    let minLat = -21.138;
    let maxLat = -21.105;
    let minLon = -48.215;
    let maxLon = -48.175;

    const allCoords = [...mapPlots.flatMap(p => p.coords), ...newPlotCoords];
    if (allCoords.length > 0) {
      minLat = Math.min(...allCoords.map(c => c[0])) - 0.003;
      maxLat = Math.max(...allCoords.map(c => c[0])) + 0.003;
      minLon = Math.min(...allCoords.map(c => c[1])) - 0.003;
      maxLon = Math.max(...allCoords.map(c => c[1])) + 0.003;
    }

    return { minLat, maxLat, minLon, maxLon };
  }, [mapPlots, newPlotCoords]);

  // Carrega um polígono realista de exemplo para fins de teste
  const handleLoadSampleCoords = () => {
    // Coordenadas centrais da fazenda de exemplo
    const centerLat = -21.124;
    const centerLon = -48.192;
    setNewPlotCoords([
      [centerLat - 0.003, centerLon - 0.004],
      [centerLat + 0.003, centerLon - 0.004],
      [centerLat + 0.002, centerLon + 0.004],
      [centerLat - 0.004, centerLon + 0.003]
    ]);
    setMapFormError(null);
    setMapFormSuccess('Polígono de exemplo carregado com sucesso!');
  };

  // Salva o novo talhão desenhado
  const handleSavePlot = () => {
    if (!newPlotName.trim()) {
      setMapFormError('Por favor, informe o nome do talhão.');
      setMapFormSuccess(null);
      return;
    }
    if (newPlotCoords.length < 3) {
      setMapFormError('Por favor, defina pelo menos 3 coordenadas (pontos) para formar o polígono do talhão.');
      setMapFormSuccess(null);
      return;
    }

    // Calcula um índice IGF estimado com base nas propriedades do solo configuradas
    const calculatedIgf = Math.round(
      ((newPlotPh - 4.0) / 3.0) * 30 +
      (newPlotOm / 50) * 25 +
      (newPlotP / 40) * 25 +
      (newPlotK / 0.8) * 20
    );
    const igfClamped = Math.max(15, Math.min(100, calculatedIgf));

    const newPlot = {
      name: newPlotName,
      type: newPlotType,
      igf: igfClamped,
      ph: newPlotPh,
      p: newPlotP,
      k: newPlotK,
      organicMatter: newPlotOm,
      clay: newPlotClay,
      status: (igfClamped >= 70 ? 'high' : igfClamped >= 50 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
      coords: newPlotCoords
    };

    setMapPlots(prev => [...prev, newPlot]);
    setMapFormSuccess(`Talhão "${newPlotName}" cadastrado e mapeado com sucesso!`);
    setMapFormError(null);

    // Limpa os campos após salvar
    setNewPlotName('');
    setNewPlotCoords([]);
  };

  // Sync Gêmeo Digital sliders with selected soil analysis values
  useEffect(() => {
    if (currentSoil) {
      setTwinPhSlider(currentSoil.phCaCl2 || 6.0);
      setTwinOmSlider(currentSoil.organicMatterGKg || 25);
      setTwinCompactionSlider(currentSoil.penetrationResistanceMpa || 1.2);
    }
  }, [selectedSoilId]);

  // Active Soil Sample
  const currentSoil = useMemo(() => {
    return soilAnalyses.find(s => s.id === selectedSoilId) || soilAnalyses[0];
  }, [soilAnalyses, selectedSoilId]);

  // Active Regional Bulletin (merged with DEFAULT_BULLETIN_REFERENCE_PARAMS for safety)
  const currentBulletin = useMemo(() => {
    const found = allBulletins.find(b => b.id === selectedBulletinId);
    if (found) {
      return { ...DEFAULT_BULLETIN_REFERENCE_PARAMS, ...found };
    }
    return getBulletinById(selectedBulletinId);
  }, [selectedBulletinId, allBulletins]);

  // Dynamic calculation of Critical Levels (NICRIP, NICRIS, NICRIZ) based on soil clay and active bulletin
  const criticalLevels = useMemo(() => {
    const clay = currentSoil.clayPercent;
    
    // Phosphorus (P) Critical Level (NICRIP)
    let nicrip = 15; // default
    if (currentBulletin.pCriticalLevels) {
      if (clay > 60 && currentBulletin.pCriticalLevels.veryClayey) {
        nicrip = currentBulletin.pCriticalLevels.veryClayey.good;
      } else if (clay > 35 && currentBulletin.pCriticalLevels.clayey) {
        nicrip = currentBulletin.pCriticalLevels.clayey.good;
      } else if (clay > 15 && currentBulletin.pCriticalLevels.medium) {
        nicrip = currentBulletin.pCriticalLevels.medium.good;
      } else if (currentBulletin.pCriticalLevels.sandy) {
        nicrip = currentBulletin.pCriticalLevels.sandy.good;
      }
    } else {
      nicrip = clay > 60 ? 12 : clay > 35 ? 15 : clay > 15 ? 20 : 30;
    }

    // Sulfur (S) Critical Level (NICRIS)
    const nicris = currentBulletin.sulfurCriticalLevel || 10;

    // Zinc (Zn) Critical Level (NICRIZ)
    const nicriz = currentBulletin.zincCriticalLevel || 1.2;

    return {
      nicrip,
      nicris,
      nicriz,
      nicrica: currentBulletin.calciumCriticalLevel || 2.0,
      nicrimg: currentBulletin.magnesiumCriticalLevel || 0.8,
      nicrik: currentBulletin.potassiumCriticalLevel || 0.20,
      nicrib: currentBulletin.boronCriticalLevel || 0.35,
      nicricu: currentBulletin.copperCriticalLevel || 0.8,
      nicrimn: currentBulletin.manganeseCriticalLevel || 4.0,
      nicrife: currentBulletin.ironCriticalLevel || 12.0,
      nicrimo: currentBulletin.molybdenumCriticalLevel || 0.10,
      nicrisi: currentBulletin.siliconCriticalLevel || 10.0,
      bioasAryl: currentBulletin.bioasArylCriticalLevel || 50,
      bioasBetaGli: currentBulletin.bioasBetaGliCriticalLevel || 140,
      bioasFosfAc: currentBulletin.bioasFosfAcCriticalLevel || 210,
      bioasCbm: currentBulletin.bioasCbmCriticalLevel || 300,
      bioasRbs: currentBulletin.bioasRbsCriticalLevel || 18.0,
    };
  }, [currentSoil, currentBulletin]);

  // Detailed breakdown of the Soil IGF score for transparent explanation of the grade
  const igfBreakdown = useMemo(() => {
    const breakdown = [];
    let score = 50;

    // 1. Saturação por Bases
    let basesContrib = -10;
    let basesStatus = 'Deficiente (Crítico - Necessita de Calagem)';
    if (currentSoil.baseSaturationPercent >= 65 && currentSoil.baseSaturationPercent <= 75) {
      basesContrib = 15;
      basesStatus = 'Excelente (Na faixa ideal de 65-75%)';
    } else if (currentSoil.baseSaturationPercent >= 50) {
      basesContrib = 10;
      basesStatus = 'Adequado (Suficiente para a maioria das culturas)';
    }
    score += basesContrib;
    breakdown.push({
      id: 'bases',
      name: 'Saturação por Bases (V%)',
      value: `${currentSoil.baseSaturationPercent}%`,
      range: '65% a 75%',
      points: basesContrib,
      status: basesStatus,
      color: basesContrib > 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold',
    });

    // 2. Alumínio m%
    let alContrib = 0;
    let alStatus = 'Moderado (Tolerável para algumas culturas)';
    if (currentSoil.aluminumSaturationPercent <= 5) {
      alContrib = 10;
      alStatus = 'Seguro (Sem toxicidade de alumínio)';
    } else if (currentSoil.aluminumSaturationPercent > 20) {
      alContrib = -15;
      alStatus = 'Crítico (Presença de alumínio tóxico para as raízes)';
    }
    score += alContrib;
    breakdown.push({
      id: 'al',
      name: 'Saturação por Alumínio (m%)',
      value: `${currentSoil.aluminumSaturationPercent}%`,
      range: `≤ ${currentBulletin.tolerableAlSaturation || 15}%`,
      points: alContrib,
      status: alStatus,
      color: alContrib >= 10 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : alContrib < 0 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-amber-600 dark:text-amber-400 font-bold',
    });

    // 3. Matéria Orgânica
    let moContrib = 0;
    let moStatus = 'Baixo (Requer adubação orgânica e rotação de culturas)';
    if (currentSoil.organicMatterGKg >= 30) {
      moContrib = 10;
      moStatus = 'Excelente (Adequado para atividade biológica e CTC)';
    } else if (currentSoil.organicMatterGKg >= 20) {
      moContrib = 6;
      moStatus = 'Moderado (Nível aceitável para sustentação)';
    }
    score += moContrib;
    breakdown.push({
      id: 'mo',
      name: 'Matéria Orgânica (M.O.)',
      value: `${currentSoil.organicMatterGKg} g/dm³`,
      range: '≥ 30 g/dm³',
      points: moContrib,
      status: moStatus,
      color: moContrib >= 10 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : moContrib >= 6 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold',
    });

    // 4. Fósforo
    let pContrib = -5;
    let pStatus = 'Deficiente (Fósforo é o principal limitante químico)';
    if (currentSoil.pResina >= 25) {
      pContrib = 10;
      pStatus = 'Excelente (Disponibilidade alta de fósforo)';
    } else if (currentSoil.pResina >= 15) {
      pContrib = 5;
      pStatus = 'Moderado (Disponibilidade intermediária)';
    }
    score += pContrib;
    breakdown.push({
      id: 'p',
      name: `Fósforo (P ${currentBulletin.phosphorusMethod})`,
      value: `${currentSoil.pResina} mg/dm³`,
      range: '≥ 25 mg/dm³',
      points: pContrib,
      status: pStatus,
      color: pContrib >= 10 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : pContrib >= 5 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold',
    });

    // 5. Potássio
    let kContrib = 0;
    let kStatus = 'Deficiente (Baixa saturação de K na CTC, afeta translocação)';
    if (currentSoil.kCmolc >= 0.3) {
      kContrib = 10;
      kStatus = 'Excelente (Nível ideal de potássio na CTC)';
    } else if (currentSoil.kCmolc >= 0.18) {
      kContrib = 5;
      kStatus = 'Moderado (Nível satisfatório)';
    }
    score += kContrib;
    breakdown.push({
      id: 'k',
      name: 'Potássio (K)',
      value: `${currentSoil.kCmolc} cmol_c/dm³`,
      range: '≥ 0,30 cmol_c/dm³',
      points: kContrib,
      status: kStatus,
      color: kContrib >= 10 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : kContrib >= 5 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold',
    });

    // 6. Atividade BioAS (Enzimática)
    let bioContrib = 0;
    let bioStatus = 'Atividade biológica baixa ou enzimas não avaliadas';
    if (currentSoil.betaGlucosidaseActivity && currentSoil.betaGlucosidaseActivity > 120) {
      bioContrib += 5;
    }
    if (currentSoil.arylsulfataseActivity && currentSoil.arylsulfataseActivity > 60) {
      bioContrib += 5;
    }
    if (bioContrib === 10) {
      bioStatus = 'Alta atividade de Beta-Glicosidase e Arilsulfatase (Saúde do solo excelente)';
    } else if (bioContrib === 5) {
      bioStatus = 'Atividade biológica moderada';
    }
    score += bioContrib;
    breakdown.push({
      id: 'bio',
      name: 'Enzimas BioAS (B-Gluc. & Aril.)',
      value: `B-Gluc: ${currentSoil.betaGlucosidaseActivity || 145} / Aril: ${currentSoil.arylsulfataseActivity || 85}`,
      range: 'B-Gluc > 120 / Aril > 60',
      points: bioContrib,
      status: bioStatus,
      color: bioContrib >= 10 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : bioContrib >= 5 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold',
    });

    return {
      items: breakdown,
      baseScore: 50,
      totalCalculated: Math.min(100, Math.max(10, Math.round(score)))
    };
  }, [currentSoil, currentBulletin]);

  // Data for the CTC occupation Pie Chart
  const ctcChartData = useMemo(() => {
    const total = currentSoil.potentialCtc || 10;
    const caPct = Math.round((currentSoil.caCmolc / total) * 100);
    const mgPct = Math.round((currentSoil.mgCmolc / total) * 100);
    const kPct = Math.round((currentSoil.kCmolc / total) * 100);
    const hAlPct = Math.round(((currentSoil.potentialAcidityHAl || 0) / total) * 100);
    const otherPct = Math.max(0, 100 - (caPct + mgPct + kPct + hAlPct));

    return [
      { name: 'Cálcio (Ca²⁺)', value: caPct, color: '#3b82f6' },
      { name: 'Magnésio (Mg²⁺)', value: mgPct, color: '#10b981' },
      { name: 'Potássio (K⁺)', value: kPct, color: '#f59e0b' },
      { name: 'Acidez (H+Al)', value: hAlPct, color: '#8b5cf6' },
      { name: 'Outros Cátions', value: otherPct, color: '#94a3b8' },
    ].filter(item => item.value > 0);
  }, [currentSoil]);

  // Data for the micronutrients and sulfur vs NICRI critical levels chart
  const micronutrientsChartData = useMemo(() => {
    return [
      {
        name: 'Fósforo (P)',
        Atual: currentSoil.pResina,
        Critico: criticalLevels.nicrip,
        unidade: 'mg/dm³',
      },
      {
        name: 'Enxofre (S)',
        Atual: currentSoil.sSulfurMgDm3,
        Critico: criticalLevels.nicris,
        unidade: 'mg/dm³',
      },
      {
        name: 'Zinco (Zn)',
        Atual: currentSoil.znZincoMgDm3,
        Critico: criticalLevels.nicriz,
        unidade: 'mg/dm³',
      },
      {
        name: 'Boro (B)',
        Atual: Math.round(currentSoil.bBoroMgDm3 * 100) / 10, // scaled for readability
        Critico: Math.round(criticalLevels.nicrib * 100) / 10,
        unidade: 'mg/dm³ (x10)',
      },
    ];
  }, [currentSoil, criticalLevels]);

  // Comparison data for all Macronutrients (% of adequacy compared to agronomic standards)
  const macroComparisonChartData = useMemo(() => {
    const calcAdequacy = (current: number, target: number) => {
      if (target <= 0) return 100;
      return Math.min(250, Math.round((current / target) * 100));
    };

    return [
      { name: 'Fósforo (P)', Atual: currentSoil.pResina, Alvo: criticalLevels.nicrip, Adequacao: calcAdequacy(currentSoil.pResina, criticalLevels.nicrip), unidade: 'mg/dm³' },
      { name: 'Potássio (K)', Atual: currentSoil.kCmolc, Alvo: 0.25, Adequacao: calcAdequacy(currentSoil.kCmolc, 0.25), unidade: 'cmol_c/dm³' },
      { name: 'Cálcio (Ca)', Atual: currentSoil.caCmolc, Alvo: 3.0, Adequacao: calcAdequacy(currentSoil.caCmolc, 3.0), unidade: 'cmol_c/dm³' },
      { name: 'Magnésio (Mg)', Atual: currentSoil.mgCmolc, Alvo: 0.9, Adequacao: calcAdequacy(currentSoil.mgCmolc, 0.9), unidade: 'cmol_c/dm³' },
      { name: 'Enxofre (S)', Atual: currentSoil.sSulfurMgDm3, Alvo: criticalLevels.nicris, Adequacao: calcAdequacy(currentSoil.sSulfurMgDm3, criticalLevels.nicris), unidade: 'mg/dm³' },
      { name: 'Matéria Orgânica', Atual: currentSoil.organicMatterGKg, Alvo: 25, Adequacao: calcAdequacy(currentSoil.organicMatterGKg, 25), unidade: 'g/dm³' }
    ];
  }, [currentSoil, criticalLevels]);

  // Comparison data for all Micronutrients (% of adequacy compared to active bulletin targets)
  const microComparisonChartData = useMemo(() => {
    const calcAdequacy = (current: number, target: number) => {
      if (target <= 0) return 100;
      return Math.min(250, Math.round((current / target) * 100));
    };

    return [
      { name: 'Boro (B)', Atual: currentSoil.bBoroMgDm3, Alvo: criticalLevels.nicrib, Adequacao: calcAdequacy(currentSoil.bBoroMgDm3, criticalLevels.nicrib), unidade: 'mg/dm³' },
      { name: 'Zinco (Zn)', Atual: currentSoil.znZincoMgDm3, Alvo: criticalLevels.nicriz, Adequacao: calcAdequacy(currentSoil.znZincoMgDm3, criticalLevels.nicriz), unidade: 'mg/dm³' },
      { name: 'Cobre (Cu)', Atual: currentSoil.cuCobreMgDm3, Alvo: criticalLevels.nicricu, Adequacao: calcAdequacy(currentSoil.cuCobreMgDm3, criticalLevels.nicricu), unidade: 'mg/dm³' },
      { name: 'Manganês (Mn)', Atual: currentSoil.mnManganesMgDm3, Alvo: criticalLevels.nicrimn, Adequacao: calcAdequacy(currentSoil.mnManganesMgDm3, criticalLevels.nicrimn), unidade: 'mg/dm³' },
      { name: 'Ferro (Fe)', Atual: currentSoil.feFerroMgDm3, Alvo: criticalLevels.nicrife, Adequacao: calcAdequacy(currentSoil.feFerroMgDm3, criticalLevels.nicrife), unidade: 'mg/dm³' }
    ];
  }, [currentSoil, criticalLevels]);

  // Combined Comparison data for all 11 Macro & Micronutrients
  const allNutrientsComparisonChartData = useMemo(() => {
    return [...macroComparisonChartData, ...microComparisonChartData];
  }, [macroComparisonChartData, microComparisonChartData]);

  // Modal State for custom bulletin creator
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [newBulletin, setNewBulletin] = useState<Partial<RegionalBulletin>>({
    code: 'REF-CUSTOM',
    name: 'Boletim Técnico Personalizado',
    institution: 'Consultoria Agropecuária',
    region: 'Nacional',
    coveredStates: ['MT'],
    edition: 'Edição do Usuário',
    description: 'Boletim customizado com referências e níveis críticos personalizados para calagem e adubação.',
    badgeColor: 'bg-purple-600 text-white',
    defaultLimingMethod: 'v_percent',
    supportedLimingMethods: ['v_percent', 'al_neutralization'],
    targetVByCrop: {
      soja: 65,
      milho: 70,
      algodao: 70,
      feijao: 70,
      trigo: 65,
      cafe: 60,
      cana: 60,
      citros: 70,
      pastagem: 50,
      hortalicas: 75,
    },
    textureClasses: {
      sandy: { maxClay: 15, label: 'Arenosa (<15% argila)' },
      medium: { minClay: 15, maxClay: 35, label: 'Média (15 a 35% argila)' },
      clayey: { minClay: 35, maxClay: 60, label: 'Argilosa (35 a 60% argila)' },
      veryClayey: { minClay: 60, label: 'Muito Argilosa (>60% argila)' },
    },
    phosphorusMethod: 'Resina',
    pCriticalLevels: {
      sandy: { low: 10, medium: 20, good: 30, high: 45 },
      medium: { low: 8, medium: 16, good: 24, high: 36 },
      clayey: { low: 5, medium: 10, good: 15, high: 22 },
      veryClayey: { low: 3.5, medium: 7, good: 10, high: 16 },
    },
    kCriticalLevels: { low: 0.15, medium: 0.30, good: 0.45, high: 0.60 },
    gypsumMethod: 'clay_multiplier',
    gypsumFactor: 50,
    notes: ['Boletim customizado definido pelo agrônomo responsável.'],
    officialReference: 'Referência personalizada inserida pelo usuário.',
    
    // Custom extensions
    pRemanescenteCritical: 25,
    sulfurCriticalLevel: 10,
    boronCriticalLevel: 0.35,
    zincCriticalLevel: 1.2,
    copperCriticalLevel: 0.8,
    manganeseCriticalLevel: 4.0,
    ironCriticalLevel: 12.0,
    tolerableAlSaturation: 15,
    idealCaPercentageRange: { min: 50, max: 70 },
    idealMgPercentageRange: { min: 10, max: 20 },
    idealKPercentageRange: { min: 2, max: 5 },
  });

  // State for dashboard view toggle (Charts vs. Indicators) and IGF explanation panel
  const [dashboardMode, setDashboardMode] = useState<'indicators' | 'charts'>('charts');
  const [showIgfExpl, setShowIgfExpl] = useState<boolean>(false);
  const [nutrientFilter, setNutrientFilter] = useState<'all' | 'macro' | 'micro'>('all');
  const [nutrientSubMode, setNutrientSubMode] = useState<'all' | 'macro' | 'micro' | 'nicri'>('all');

  // Bulletin Catalog Modal State
  const [showBulletinCatalogModal, setShowBulletinCatalogModal] = useState<boolean>(false);
  const [bulletinSearchTerm, setBulletinSearchTerm] = useState<string>('');
  const [bulletinCategoryFilter, setBulletinCategoryFilter] = useState<'all' | 'regional' | 'lab'>('all');

  const filteredCatalogBulletins = useMemo(() => {
    return allBulletins.filter(b => {
      const isLab = b.id.startsWith('padrao-lab-') || b.code.startsWith('LAB-');
      if (bulletinCategoryFilter === 'regional' && isLab) return false;
      if (bulletinCategoryFilter === 'lab' && !isLab) return false;

      if (!bulletinSearchTerm.trim()) return true;

      const query = bulletinSearchTerm.toLowerCase();
      const codeMatch = b.code.toLowerCase().includes(query);
      const nameMatch = b.name.toLowerCase().includes(query);
      const instMatch = b.institution.toLowerCase().includes(query);
      const regionMatch = b.region.toLowerCase().includes(query);
      const statesMatch = (b.coveredStates || []).some(s => s.toLowerCase().includes(query));
      const methodMatch = (b.phosphorusMethod || '').toLowerCase().includes(query);

      return codeMatch || nameMatch || instMatch || regionMatch || statesMatch || methodMatch;
    });
  }, [allBulletins, bulletinCategoryFilter, bulletinSearchTerm]);

  // Calagem State Parameters
  const [limingMethod, setLimingMethod] = useState<'v_percent' | 'smp' | 'al_neutralization' | 'ca_elevation' | 'mg_elevation'>('v_percent');
  const [limingTargetCa, setLimingTargetCa] = useState<number | ''>(3.0);
  const [limingTargetMg, setLimingTargetMg] = useState<number | ''>(1.0);
  const [limingPrnt, setLimingPrnt] = useState<number | ''>(85);
  const [limingTargetV, setLimingTargetV] = useState<number | ''>(70);
  const [limingDepthCm, setLimingDepthCm] = useState<number | ''>(20);
  const [limingMoisture, setLimingMoisture] = useState<number | ''>(5);
  const [limingObservation, setLimingObservation] = useState<string>('');
  
  // Gessagem Multi-Method State
  const [selectedGypsumMethod, setSelectedGypsumMethod] = useState<'fator_argila' | 'demate' | 'caires_guimaraes' | 'boletim_100' | 'classe_textural'>('fator_argila');
  const [gypsumClayFactor, setGypsumClayFactor] = useState<number>(50);
  const [demateTargetV, setDemateTargetV] = useState<number>(50);
  const [cairesTargetCa, setCairesTargetCa] = useState<number>(60);
  const [gypsumObservation, setGypsumObservation] = useState<string>('');

  // Adubação Orgânica State
  const [selectedOrganicId, setSelectedOrganicId] = useState<string>('org-cama-frango');
  const [organicDoseTonHa, setOrganicDoseTonHa] = useState<number | ''>(3.5);
  const [customOrganicName, setCustomOrganicName] = useState<string>('Fonte Personalizada');
  const [customOrganicN, setCustomOrganicN] = useState<number | ''>(2.0);
  const [customOrganicP, setCustomOrganicP] = useState<number | ''>(2.0);
  const [customOrganicK, setCustomOrganicK] = useState<number | ''>(2.0);

  // Adubação Mineral State
  const [selectedPlantingCropId, setSelectedPlantingCropId] = useState<string>('soja-grao');
  const [isCropSelectorModalOpen, setIsCropSelectorModalOpen] = useState<boolean>(false);
  const [cropSelectorCategory, setCropSelectorCategory] = useState<string>('all');
  const [cropSearchQuery, setCropSearchQuery] = useState<string>('');
  const [selectedFormulationId, setSelectedFormulationId] = useState<string>('npk-02-20-20');
  const [plantingDoseKgHa, setPlantingDoseKgHa] = useState<number | ''>(320);
  const [enableSecondaryPlanting, setEnableSecondaryPlanting] = useState<boolean>(false);
  const [secondaryPlantingPercentage, setSecondaryPlantingPercentage] = useState<number>(30);
  const [topdressingDoseKgHa, setTopdressingDoseKgHa] = useState<number | ''>(180);
  const [topdressingSource, setTopdressingSource] = useState<string>('min-kcl');
  const [topdressingDoseUnit, setTopdressingDoseUnit] = useState<'kg_ha' | 'area_total' | 'g_planta' | 'g_sulco'>('kg_ha');
  const [topdressingSplits, setTopdressingSplits] = useState<string>('2');
  const [customNumSplits, setCustomNumSplits] = useState<number>(2);
  const [topdressingObservation, setTopdressingObservation] = useState<string>('');

  // Coffee Management Specific State (Arábica & Conilon - Formação, Produção, Renovação)
  const [coffeeType, setCoffeeType] = useState<'arabica' | 'conilon'>('arabica');
  const [coffeePhase, setCoffeePhase] = useState<'formacao_1ano' | 'formacao_2ano' | 'producao' | 'renovacao_poda'>('producao');
  const [coffeeYieldTargetSc, setCoffeeYieldTargetSc] = useState<number | ''>(45);
  const [coffeePruningType, setCoffeePruningType] = useState<'recepa' | 'decote' | 'esqueletamento'>('recepa');

  // Advanced Parcela Management State
  const [parcelaList, setParcelaList] = useState<ParcelaConfig[]>([
    {
      id: 'p-1',
      name: '1ª Parcela de Cobertura',
      timing: '30 DAP / Início da Brotação',
      fertilizers: [
        { id: 'f-1-1', sourceId: 'min-kcl', doseKgHa: 90 }
      ],
      observation: 'Aplicar antes de chuva leve ou irrigação.'
    },
    {
      id: 'p-2',
      name: '2ª Parcela de Cobertura',
      timing: '60 DAP / Enchimento de Frutos',
      fertilizers: [
        { id: 'f-2-1', sourceId: 'min-kcl', doseKgHa: 90 }
      ],
      observation: 'Manter solo úmido durante a aplicação.'
    }
  ]);

  // Spacing & Population State
  const [rowSpacingM, setRowSpacingM] = useState<number | ''>(0.45);
  const [plantSpacingMode, setPlantSpacingMode] = useState<'per_meter' | 'plant_distance'>('per_meter');
  const [plantsPerMeter, setPlantsPerMeter] = useState<number | ''>(12);
  const [plantSpacingM, setPlantSpacingM] = useState<number | ''>(0.18);
  const [customPopulationHa, setCustomPopulationHa] = useState<number | ''>('');
  const [germinationRatePct, setGerminationRatePct] = useState<number | ''>(90);
  const [emergenceRatePct, setEmergenceRatePct] = useState<number | ''>(92);
  const [thousandSeedWeightG, setThousandSeedWeightG] = useState<number | ''>(160);
  const [seedsPerBag, setSeedsPerBag] = useState<number | ''>(60000);
  const [selectedPopPresetId, setSelectedPopPresetId] = useState<string>('soja');

  // Custom Fertilizer State
  const [isCustomFertilizer, setIsCustomFertilizer] = useState<boolean>(false);
  const [customFertName, setCustomFertName] = useState<string>('Meu NPK Bunge 03-24-12 + 2% S + 0,1% B');
  const [customFertN, setCustomFertN] = useState<number | ''>(3);
  const [customFertP2O5, setCustomFertP2O5] = useState<number | ''>(24);
  const [customFertK2O, setCustomFertK2O] = useState<number | ''>(12);
  const [customFertS, setCustomFertS] = useState<number | ''>(2);
  const [customFertCa, setCustomFertCa] = useState<number | ''>(0);
  const [customFertMg, setCustomFertMg] = useState<number | ''>(0);
  const [customFertB, setCustomFertB] = useState<number | ''>(0.2);
  const [customFertZn, setCustomFertZn] = useState<number | ''>(0.5);

  // Planting Dosage View / Unit & Field Notes State
  const [plantingDoseUnit, setPlantingDoseUnit] = useState<'kg_ha' | 'area_total' | 'g_planta' | 'g_sulco'>('kg_ha');
  const [plantingObservation, setPlantingObservation] = useState<string>('Aplicar a 5 cm ao lado e 5 cm abaixo da semente no sulco de plantio para evitar fitotoxidez e promover enraizamento profundo.');

  // Reminders & Notifications State
  const [reminders, setReminders] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('agronutri_fertilizer_reminders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [reminderType, setReminderType] = useState<'plantio' | 'cobertura'>('plantio');
  const [reminderParcelaIndex, setReminderParcelaIndex] = useState<number>(0);
  const [reminderRecipientName, setReminderRecipientName] = useState<string>('Produtor Lucas Mendes');
  const [reminderRecipientPhone, setReminderRecipientPhone] = useState<string>('5511999999999');
  const [reminderRecipientEmail, setReminderRecipientEmail] = useState<string>('mendeslucas42cs@gmail.com');
  const [reminderDate, setReminderDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // Amanhã por padrão
    return d.toISOString().split('T')[0];
  });
  const [reminderTime, setReminderTime] = useState<string>('08:00');
  const [reminderChannel, setReminderChannel] = useState<'browser' | 'whatsapp' | 'email' | 'in_app'>('whatsapp');
  const [activeFiredReminder, setActiveFiredReminder] = useState<any | null>(null);

  const [browserNotificationPermission, setBrowserNotificationPermission] = useState<string>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported';
  });

  // Action Handlers for Reminders
  const triggerWhatsApp = (rem: any) => {
    const text = `Olá ${rem.recipientName}! 🌱 Aqui é o AgroNutri Pro. Lembramos que está programada a adubação de ${rem.type === 'plantio' ? 'Plantio (Sulco)' : `Cobertura (${rem.parcelaNum}ª Parcela)`} para a cultura do ${rem.cropName}.\n\n📋 Detalhes da Adubação:\n- Fertilizante: ${rem.fertilizerName}\n- Dose recomendada: ${rem.dose}\n- Área: ${rem.area} ha\n- Volume Total: ${rem.totalKg.toLocaleString('pt-BR')} kg\n- Data agendada: ${rem.scheduledDate} às ${rem.scheduledTime}h\n\nExcelente jornada de trabalho no campo!`;
    const url = `https://api.whatsapp.com/send?phone=${rem.recipientPhone || ''}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const triggerEmail = (rem: any) => {
    const subject = `AgroNutri Pro: Lembrete de Adubação de ${rem.type === 'plantio' ? 'Plantio' : `Cobertura (${rem.parcelaNum}ª Parcela)`} - ${rem.cropName}`;
    const body = `Olá ${rem.recipientName},\n\nEste é um lembrete oficial emitido pelo AgroNutri Pro para a execução da adubação programada:\n\n- Cultura: ${rem.cropName}\n- Tipo de Adubação: ${rem.type === 'plantio' ? 'Plantio no Sulco' : `Cobertura Parcelada (${rem.parcelaNum}ª Parcela)`}\n- Fertilizante Recomendado: ${rem.fertilizerName}\n- Recomendação de Dose: ${rem.dose}\n- Área do Talhão: ${rem.area} ha\n- Quantidade Total Necessária: ${rem.totalKg.toLocaleString('pt-BR')} kg\n- Data Programada: ${rem.scheduledDate}\n- Hora Programada: ${rem.scheduledTime}h\n\nPor favor, certifique-se de que os equipamentos estejam devidamente calibrados e as condições climáticas favoráveis.\n\nAtenciosamente,\nEquipe de Recomendação AgroNutri Pro`;
    const mailto = `mailto:${rem.recipientEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
  };

  const handleAddReminder = () => {
    let crop = '';
    let fert = '';
    let doseStr = '';
    let areaVal = currentSoil?.areaHa || 50;
    let total = 0;
    let pNum: number | undefined = undefined;

    if (reminderType === 'plantio') {
      const actualRec = CROP_PLANTING_RECOMMENDATIONS.find(c => c.cropId === selectedPlantingCropId);
      crop = actualRec?.cropName || currentSoil?.cropName || 'Cultura';
      fert = activeFertilizerGuarantees.name || 'Adubo NPK';
      doseStr = `${plantingNutrientsSupplied.doseKgHa} kg/ha`;
      total = plantingNutrientsSupplied.totalKg;
    } else {
      crop = currentSoil?.cropName || 'Cultura';
      const p = parcelaList[reminderParcelaIndex];
      pNum = reminderParcelaIndex + 1;
      if (p) {
        const ferts = p.fertilizers || [];
        fert = ferts.map((f: any) => {
          if (f.sourceId === 'min-kcl') return 'KCl (Cloreto de Potássio)';
          if (f.sourceId === 'min-ureia') return 'Ureia';
          if (f.sourceId === 'min-sulfato-amonio') return 'Sulfato de Amônio';
          return 'Adubo';
        }).join(' + ') || 'Adubo Cobertura';
        doseStr = ferts.map((f: any) => `${f.doseKgHa} kg/ha`).join(' + ');
        const firstDose = ferts[0]?.doseKgHa || 0;
        total = firstDose * areaVal;
      } else {
        fert = 'Adubo Cobertura';
        doseStr = 'Dosagem de Cobertura';
        total = 0;
      }
    }

    const newRem: any = {
      id: Math.random().toString(36).substring(2, 9),
      type: reminderType,
      cropName: crop,
      fertilizerName: fert,
      dose: doseStr,
      area: areaVal,
      totalKg: total,
      parcelaNum: pNum,
      recipientName: reminderRecipientName,
      recipientPhone: reminderRecipientPhone,
      recipientEmail: reminderRecipientEmail,
      scheduledDate: reminderDate,
      scheduledTime: reminderTime,
      channel: reminderChannel,
      status: 'agendado'
    };

    setReminders(prev => [newRem, ...prev]);
    showNotification('📆 Lembrete de adubação agendado com sucesso!');
  };

  const getCropCategory = (crop: CropPlantingRecommendation): string => {
    const id = (crop.cropId || '').toLowerCase();
    const name = (crop.cropName || '').toLowerCase();
    
    if (['soja', 'milho', 'arroz', 'trigo', 'feijao', 'sorgo', 'aveia', 'centeio', 'cevada', 'triticale', 'quinoa', 'gergelim', 'grao', 'ervilha', 'lentilha', 'grao-de-bico', 'girassol'].some(k => id.includes(k) || name.includes(k))) {
      return 'graos';
    }
    if (['algodao', 'algodoeiro', 'amendoim', 'canola', 'mamona', 'linho', 'sisal', 'agave', 'dende'].some(k => id.includes(k) || name.includes(k))) {
      return 'fibras_oleaginosas';
    }
    if (['citros', 'laranja', 'limao', 'tangerina', 'cafe', 'banana', 'uva', 'manga', 'mamao', 'maca', 'pessego', 'maracuja', 'goiaba', 'abacaxi', 'melancia', 'melao', 'morango', 'cacau', 'abacate', 'caju', 'coco', 'acai', 'amora', 'figo', 'pera', 'ameixa', 'jabuticaba', 'pitanga', 'pitaia', 'graviola', 'cupuacu', 'caqui', 'noz', 'atemoia', 'azeitona', 'oliveira'].some(k => id.includes(k) || name.includes(k))) {
      return 'fruticultura';
    }
    if (['tomate', 'batata', 'cebola', 'alho', 'cenoura', 'pimentao', 'alface', 'brocolis', 'couve', 'repolho', 'abobora', 'abobrinha', 'pepino', 'berinjela', 'quiabo', 'beterraba', 'espinafre', 'rucula', 'agriao', 'coentro', 'salsa', 'cebolinha', 'aipo', 'mandioquinha', 'inhame', 'cara', 'hortalica', 'chuchu', 'rabanete', 'jilo', 'alcachofra', 'acelga', 'almeirao', 'aspargo', 'palmito', 'batata-baroa', 'batata-doce'].some(k => id.includes(k) || name.includes(k))) {
      return 'hortalicas';
    }
    if (['cana', 'mandioca', 'eucalipto', 'pinus', 'teca', 'mogno', 'tabaco', 'seringueira', 'bambu'].some(k => id.includes(k) || name.includes(k))) {
      return 'grandes_culturas';
    }
    if (['brachiaria', 'braquiaria', 'mombaca', 'tanzania', 'panicum', 'tifton', 'capim', 'alfafa', 'estilosantes', 'amendoim-forrageiro', 'pastagem', 'forrageira', 'aveia-preta', 'azevem', 'coastcross', 'marandu', 'piata', 'xaraes', 'humidicola', 'ruziziensis'].some(k => id.includes(k) || name.includes(k))) {
      return 'pastagens';
    }
    return 'outros';
  };

  const filteredPlantingCrops = useMemo(() => {
    let list = CROP_PLANTING_RECOMMENDATIONS;
    if (cropSelectorCategory !== 'all') {
      list = list.filter(c => getCropCategory(c) === cropSelectorCategory);
    }
    if (cropSearchQuery.trim()) {
      const q = cropSearchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      list = list.filter(c => {
        const nameClean = (c.cropName || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const sciClean = (c.scientificName || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const idClean = (c.cropId || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const obsClean = (c.observation || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const refClean = (c.bulletinReference || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return nameClean.includes(q) || sciClean.includes(q) || idClean.includes(q) || obsClean.includes(q) || refClean.includes(q);
      });
    }
    return list;
  }, [cropSearchQuery, cropSelectorCategory]);

  const selectedPlantingCropRec = useMemo(() => {
    const base = CROP_PLANTING_RECOMMENDATIONS.find(c => c.cropId === selectedPlantingCropId) || CROP_PLANTING_RECOMMENDATIONS[0];
    return getBulletinCalibratedCropParameters(base, currentBulletin, currentSoil);
  }, [selectedPlantingCropId, currentBulletin, currentSoil]);

  // Recommendation Method & Parameters State: 'boletim' | 'extracao' | 'personalizado'
  const [cropRecommendationMethod, setCropRecommendationMethod] = useState<'boletim' | 'extracao' | 'personalizado'>('boletim');

  // Extração e Exportação State
  const [extractionExpectedYield, setExtractionExpectedYield] = useState<number | ''>(80);
  const [extractionMode, setExtractionMode] = useState<'extracao' | 'exportacao'>('extracao');

  // Extração Coefficients (kg/unid)
  const [extractionCoeffN, setExtractionCoeffN] = useState<number | ''>('');
  const [extractionCoeffP2O5, setExtractionCoeffP2O5] = useState<number | ''>('');
  const [extractionCoeffK2O, setExtractionCoeffK2O] = useState<number | ''>('');
  const [extractionCoeffCa, setExtractionCoeffCa] = useState<number | ''>('');
  const [extractionCoeffMg, setExtractionCoeffMg] = useState<number | ''>('');
  const [extractionCoeffS, setExtractionCoeffS] = useState<number | ''>('');

  // Personalizado State
  const [customDemandN, setCustomDemandN] = useState<number | ''>(20);
  const [customDemandP2O5, setCustomDemandP2O5] = useState<number | ''>(64);
  const [customDemandK2O, setCustomDemandK2O] = useState<number | ''>(50);
  const [customDemandCa, setCustomDemandCa] = useState<number | ''>(25);
  const [customDemandMg, setCustomDemandMg] = useState<number | ''>(12);
  const [customDemandS, setCustomDemandS] = useState<number | ''>(18);
  const [customDemandB, setCustomDemandB] = useState<number | ''>(800);
  const [customDemandCu, setCustomDemandCu] = useState<number | ''>(350);
  const [customDemandFe, setCustomDemandFe] = useState<number | ''>(500);
  const [customDemandMn, setCustomDemandMn] = useState<number | ''>(1200);
  const [customDemandMo, setCustomDemandMo] = useState<number | ''>(60);
  const [customDemandZn, setCustomDemandZn] = useState<number | ''>(1500);

  // Bulletin & System Registered Tables Details Viewer Toggle
  const [showBulletinTableDetails, setShowBulletinTableDetails] = useState<boolean>(false);

  // Sync crop extraction defaults and custom inputs when crop selection or bulletin changes
  useEffect(() => {
    if (selectedPlantingCropRec) {
      const defYield = selectedPlantingCropRec.expectedYieldDefault || 80;
      setExtractionExpectedYield(defYield);
      const d = selectedPlantingCropRec.demandsKgPerHa;

      setExtractionCoeffN(Number((d.n / defYield).toFixed(2)));
      setExtractionCoeffP2O5(Number((d.p2o5 / defYield).toFixed(2)));
      setExtractionCoeffK2O(Number((d.k2o / defYield).toFixed(2)));
      setExtractionCoeffCa(Number(((d.ca || 25) / defYield).toFixed(2)));
      setExtractionCoeffMg(Number(((d.mg || 12) / defYield).toFixed(2)));
      setExtractionCoeffS(Number(((d.s || 18) / defYield).toFixed(2)));

      setCustomDemandN(d.n);
      setCustomDemandP2O5(d.p2o5);
      setCustomDemandK2O(d.k2o);
      setCustomDemandCa(d.ca || 25);
      setCustomDemandMg(d.mg || 12);
      setCustomDemandS(d.s || 18);
      setCustomDemandB(d.b || 800);
      setCustomDemandCu(d.cu || 350);
      setCustomDemandFe(d.fe || 500);
      setCustomDemandMn(d.mn || 1200);
      setCustomDemandMo(d.mo || 60);
      setCustomDemandZn(d.zn || 1500);

      // Auto-update formulation, dose and target V% based on bulletin calibration
      if (selectedPlantingCropRec.recommendedFormulationId) {
        setSelectedFormulationId(selectedPlantingCropRec.recommendedFormulationId);
      }
      if (selectedPlantingCropRec.defaultPlantingDoseKgHa) {
        setPlantingDoseKgHa(selectedPlantingCropRec.defaultPlantingDoseKgHa);
      }
      if (selectedPlantingCropRec.targetV) {
        setLimingTargetV(selectedPlantingCropRec.targetV);
      }
    }
  }, [selectedPlantingCropRec]);

  // Unified Active Crop Demands Computation
  const activeCropDemands = useMemo(() => {
    if (!selectedPlantingCropRec) {
      return {
        n: 20, p2o5: 64, k2o: 50, ca: 25, mg: 12, s: 18,
        b: 800, cu: 350, fe: 500, mn: 1200, mo: 60, zn: 1500,
        bulletinReference: 'Boletim Agronômico Regional',
        methodLabel: 'Via Boletim Oficial',
      };
    }

    const d = selectedPlantingCropRec.demandsKgPerHa;

    if (cropRecommendationMethod === 'boletim') {
      const cropId = (selectedPlantingCropId || '').toLowerCase();
      const cropName = (selectedPlantingCropRec?.cropName || '').toLowerCase();
      const isCoffee = cropId.includes('cafe') || cropId.includes('coffee') || cropName.includes('café') || cropName.includes('cafe');

      if (isCoffee) {
        const isConilon = coffeeType === 'conilon' || cropId.includes('conilon');
        const coffeeBulletinCode = isConilon ? 'Incaper ES / Embrapa Conilon' : 'Boletim 100 IAC / 5ª Aprox. MG';
        
        let coffeeN = isConilon ? 15 : 10;
        let coffeeP2O5 = isConilon ? 75 : 35;
        let coffeeK2O = isConilon ? 45 : 20;
        let coffeeCa = 25;
        let coffeeMg = 12;
        let coffeeS = 18;
        let coffeeB = 800;
        let coffeeZn = 1500;

        if (coffeePhase === 'formacao_1ano') {
          coffeeN = isConilon ? 70 : 60;
          coffeeP2O5 = isConilon ? 40 : 30;
          coffeeK2O = isConilon ? 70 : 60;
          coffeeCa = 25;
          coffeeS = 20;
          coffeeB = 1000;
          coffeeZn = 1200;
        } else if (coffeePhase === 'formacao_2ano') {
          coffeeN = isConilon ? 220 : 180;
          coffeeP2O5 = isConilon ? 40 : 30;
          coffeeK2O = isConilon ? 220 : 180;
          coffeeCa = 35;
          coffeeS = 30;
          coffeeB = 1500;
          coffeeZn = 1800;
        } else if (coffeePhase === 'producao') {
          const yieldTarget = coffeeYieldTargetSc || (isConilon ? 80 : 45);
          if (isConilon) {
            if (yieldTarget <= 50) { coffeeN = 200; coffeeK2O = 220; coffeeP2O5 = 40; }
            else if (yieldTarget <= 80) { coffeeN = 320; coffeeK2O = 360; coffeeP2O5 = 60; }
            else if (yieldTarget <= 110) { coffeeN = 440; coffeeK2O = 480; coffeeP2O5 = 80; }
            else { coffeeN = 540; coffeeK2O = 580; coffeeP2O5 = 100; }
          } else {
            if (yieldTarget <= 30) { coffeeN = 160; coffeeK2O = 170; coffeeP2O5 = 30; }
            else if (yieldTarget <= 50) { coffeeN = 250; coffeeK2O = 270; coffeeP2O5 = 50; }
            else if (yieldTarget <= 70) { coffeeN = 330; coffeeK2O = 360; coffeeP2O5 = 70; }
            else { coffeeN = 400; coffeeK2O = 440; coffeeP2O5 = 90; }
          }
          coffeeCa = 50;
          coffeeMg = 30;
          coffeeS = 40;
          coffeeB = 2200;
          coffeeZn = 2500;
        } else if (coffeePhase === 'renovacao_poda') {
          const isRecepa = coffeePruningType === 'recepa';
          if (isRecepa) {
            coffeeN = isConilon ? 180 : 140;
            coffeeP2O5 = 60;
            coffeeK2O = isConilon ? 70 : 50;
            coffeeCa = 30;
            coffeeS = 25;
            coffeeB = 1500;
            coffeeZn = 2000;
          } else {
            coffeeN = isConilon ? 220 : 180;
            coffeeP2O5 = 40;
            coffeeK2O = isConilon ? 140 : 110;
            coffeeCa = 35;
            coffeeS = 30;
            coffeeB = 1800;
            coffeeZn = 2200;
          }
        }

        const phaseLabel = coffeePhase === 'producao' 
          ? `Produção: ${coffeeYieldTargetSc || (isConilon ? 80 : 45)} sc/ha` 
          : coffeePhase === 'formacao_1ano' 
            ? 'Formação 1º Ano' 
            : coffeePhase === 'formacao_2ano' 
              ? 'Formação 2º Ano' 
              : `Renovação/Poda (${coffeePruningType === 'recepa' ? 'Recepa' : 'Decote/Esqueletamento'})`;

        return {
          n: coffeeN,
          p2o5: coffeeP2O5,
          k2o: coffeeK2O,
          ca: coffeeCa,
          mg: coffeeMg,
          s: coffeeS,
          b: coffeeB,
          cu: d.cu || 350,
          fe: d.fe || 500,
          mn: d.mn || 1200,
          mo: d.mo || 60,
          zn: coffeeZn,
          bulletinReference: `${coffeeBulletinCode} (${phaseLabel})`,
          methodLabel: 'Via Boletim Oficial',
        };
      }

      return {
        n: d.n,
        p2o5: d.p2o5,
        k2o: d.k2o,
        ca: d.ca || 25,
        mg: d.mg || 12,
        s: d.s || 18,
        b: d.b || 800,
        cu: d.cu || 350,
        fe: d.fe || 500,
        mn: d.mn || 1200,
        mo: d.mo || 60,
        zn: d.zn || 1500,
        bulletinReference: selectedPlantingCropRec.bulletinReference || 'Boletim Agronômico Regional',
        methodLabel: 'Via Boletim Oficial',
      };
    }

    if (cropRecommendationMethod === 'extracao') {
      const yieldVal = extractionExpectedYield === '' ? (selectedPlantingCropRec.expectedYieldDefault || 80) : Number(extractionExpectedYield);
      const defYield = selectedPlantingCropRec.expectedYieldDefault || 80;

      const cN = extractionCoeffN === '' ? d.n / defYield : Number(extractionCoeffN);
      const cP = extractionCoeffP2O5 === '' ? d.p2o5 / defYield : Number(extractionCoeffP2O5);
      const cK = extractionCoeffK2O === '' ? d.k2o / defYield : Number(extractionCoeffK2O);
      const cCa = extractionCoeffCa === '' ? (d.ca || 25) / defYield : Number(extractionCoeffCa);
      const cMg = extractionCoeffMg === '' ? (d.mg || 12) / defYield : Number(extractionCoeffMg);
      const cS = extractionCoeffS === '' ? (d.s || 18) / defYield : Number(extractionCoeffS);

      const exportFactor = extractionMode === 'exportacao' ? 0.70 : 1.0;
      const exportFactorN = extractionMode === 'exportacao' ? 0.60 : 1.0;

      const ratio = yieldVal / (defYield || 1);

      return {
        n: Number((yieldVal * cN * exportFactorN).toFixed(1)),
        p2o5: Number((yieldVal * cP * exportFactor).toFixed(1)),
        k2o: Number((yieldVal * cK * exportFactor).toFixed(1)),
        ca: Number((yieldVal * cCa * exportFactor).toFixed(1)),
        mg: Number((yieldVal * cMg * exportFactor).toFixed(1)),
        s: Number((yieldVal * cS * exportFactor).toFixed(1)),
        b: Number(((d.b || 800) * ratio * exportFactor).toFixed(0)),
        cu: Number(((d.cu || 350) * ratio * exportFactor).toFixed(0)),
        fe: Number(((d.fe || 500) * ratio * exportFactor).toFixed(0)),
        mn: Number(((d.mn || 1200) * ratio * exportFactor).toFixed(0)),
        mo: Number(((d.mo || 60) * ratio * exportFactor).toFixed(0)),
        zn: Number(((d.zn || 1500) * ratio * exportFactor).toFixed(0)),
        bulletinReference: `Extração e Exportação (${yieldVal} ${selectedPlantingCropRec.yieldUnit || 'sc/ha'} - ${extractionMode === 'extracao' ? 'Extração Total' : 'Exportação'})`,
        methodLabel: `Via Extração e Exportação (${extractionMode === 'extracao' ? 'Extração Total' : 'Exportação'})`,
      };
    }

    // Personalizado
    return {
      n: customDemandN === '' ? 0 : Number(customDemandN),
      p2o5: customDemandP2O5 === '' ? 0 : Number(customDemandP2O5),
      k2o: customDemandK2O === '' ? 0 : Number(customDemandK2O),
      ca: customDemandCa === '' ? 0 : Number(customDemandCa),
      mg: customDemandMg === '' ? 0 : Number(customDemandMg),
      s: customDemandS === '' ? 0 : Number(customDemandS),
      b: customDemandB === '' ? 0 : Number(customDemandB),
      cu: customDemandCu === '' ? 0 : Number(customDemandCu),
      fe: customDemandFe === '' ? 0 : Number(customDemandFe),
      mn: customDemandMn === '' ? 0 : Number(customDemandMn),
      mo: customDemandMo === '' ? 0 : Number(customDemandMo),
      zn: customDemandZn === '' ? 0 : Number(customDemandZn),
      bulletinReference: 'Lançamento Personalizado pelo Agrônomo',
      methodLabel: 'Personalizado',
    };
  }, [
    selectedPlantingCropRec,
    selectedPlantingCropId,
    cropRecommendationMethod,
    extractionExpectedYield,
    extractionMode,
    extractionCoeffN,
    extractionCoeffP2O5,
    extractionCoeffK2O,
    extractionCoeffCa,
    extractionCoeffMg,
    extractionCoeffS,
    customDemandN,
    customDemandP2O5,
    customDemandK2O,
    customDemandCa,
    customDemandMg,
    customDemandS,
    customDemandB,
    customDemandCu,
    customDemandFe,
    customDemandMn,
    customDemandMo,
    customDemandZn,
    coffeeType,
    coffeePhase,
    coffeeYieldTargetSc,
    coffeePruningType,
    selectedBulletinId,
    currentBulletin,
  ]);

  // Calculated Population (plantas/ha)
  const calculatedPopulationHa = useMemo(() => {
    if (customPopulationHa !== '' && Number(customPopulationHa) > 0) {
      return Number(customPopulationHa);
    }
    const rM = rowSpacingM !== '' && Number(rowSpacingM) > 0 ? Number(rowSpacingM) : 0.45;
    if (plantSpacingMode === 'per_meter') {
      const pM = plantsPerMeter !== '' && Number(plantsPerMeter) > 0 ? Number(plantsPerMeter) : 12;
      return Math.round((10000 / rM) * pM);
    } else {
      const pDist = plantSpacingM !== '' && Number(plantSpacingM) > 0 ? Number(plantSpacingM) : 0.18;
      return Math.round(10000 / (rM * pDist));
    }
  }, [customPopulationHa, rowSpacingM, plantSpacingMode, plantsPerMeter, plantSpacingM]);

  // Linear Furrow Meters per Hectare
  const furrowMetersHa = useMemo(() => {
    const rM = rowSpacingM !== '' && Number(rowSpacingM) > 0 ? Number(rowSpacingM) : 0.45;
    return Math.round(10000 / rM);
  }, [rowSpacingM]);

  // Total Field Population
  const totalFieldPopulation = useMemo(() => {
    const area = currentSoil?.areaHa || 50;
    return Math.round(calculatedPopulationHa * area);
  }, [calculatedPopulationHa, currentSoil?.areaHa]);

  // Detailed Seed & Stand Metrics for Plant Population Calculator
  const seedStandMetrics = useMemo(() => {
    const germ = germinationRatePct === '' ? 90 : Number(germinationRatePct);
    const emerg = emergenceRatePct === '' ? 92 : Number(emergenceRatePct);
    const pmv = thousandSeedWeightG === '' ? 160 : Number(thousandSeedWeightG);
    const bagSeeds = seedsPerBag === '' ? 60000 : Number(seedsPerBag);
    const area = currentSoil?.areaHa || 50;

    const germFactor = (germ / 100) * (emerg / 100);
    const seedsPerHa = germFactor > 0 ? Math.round(calculatedPopulationHa / germFactor) : calculatedPopulationHa;
    const seedsPerM = furrowMetersHa > 0 ? Number((seedsPerHa / furrowMetersHa).toFixed(1)) : 0;
    
    const totalSeedsField = seedsPerHa * area;
    const bagsPerHa = bagSeeds > 0 ? Number((seedsPerHa / bagSeeds).toFixed(2)) : 0;
    const totalBagsField = Math.ceil(bagSeeds > 0 ? totalSeedsField / bagSeeds : 0);

    const kgSeedsPerHa = pmv > 0 ? Number(((seedsPerHa / 1000) * (pmv / 1000)).toFixed(1)) : 0;
    const totalKgSeedsField = Math.round(kgSeedsPerHa * area);

    return {
      germ,
      emerg,
      pmv,
      bagSeeds,
      seedsPerHa,
      seedsPerM,
      totalSeedsField,
      bagsPerHa,
      totalBagsField,
      kgSeedsPerHa,
      totalKgSeedsField,
    };
  }, [germinationRatePct, emergenceRatePct, thousandSeedWeightG, seedsPerBag, calculatedPopulationHa, furrowMetersHa, currentSoil?.areaHa]);

  // Detection of Fruit / Perennial Crop for Macro + Micro display
  const isFruitOrPerennialCrop = useMemo(() => {
    const cropId = (selectedPlantingCropId || '').toLowerCase();
    const cropName = (selectedPlantingCropRec?.name || selectedPlantingCropRec?.cropName || '').toLowerCase();
    return ['citros', 'cafe', 'manga', 'uva', 'banana', 'mamao', 'maca', 'pessego', 'maracuja', 'goiaba', 'cacau', 'frutiferas', 'perenes', 'limao', 'laranja'].some(k => cropId.includes(k) || cropName.includes(k));
  }, [selectedPlantingCropId, selectedPlantingCropRec]);

  // Coffee Specific Crop Detection
  const isCoffeeCrop = useMemo(() => {
    const cropId = (selectedPlantingCropId || '').toLowerCase();
    const cropName = (selectedPlantingCropRec?.cropName || selectedPlantingCropRec?.name || currentSoil?.cropName || '').toLowerCase();
    return cropId.includes('cafe') || cropId.includes('coffee') || cropName.includes('café') || cropName.includes('cafe');
  }, [selectedPlantingCropId, selectedPlantingCropRec, currentSoil]);

  // Active Fertilizer Guarantees (%)
  const activeFertilizerGuarantees = useMemo(() => {
    let baseGuarantees;
    if (isCustomFertilizer) {
      baseGuarantees = {
        name: customFertName || 'Meu Fertilizante Personalizado',
        n: customFertN === '' ? 0 : Number(customFertN),
        p2o5: customFertP2O5 === '' ? 0 : Number(customFertP2O5),
        k2o: customFertK2O === '' ? 0 : Number(customFertK2O),
        s: customFertS === '' ? 0 : Number(customFertS),
        ca: customFertCa === '' ? 0 : Number(customFertCa),
        mg: customFertMg === '' ? 0 : Number(customFertMg),
        b: customFertB === '' ? 0 : Number(customFertB),
        zn: customFertZn === '' ? 0 : Number(customFertZn),
      };
    } else {
      const preset = MINERAL_FERTILIZERS_CATALOG.find(f => f.id === selectedFormulationId);
      baseGuarantees = {
        name: preset ? `${preset.name} (${preset.formula})` : 'NPK Formulado',
        n: preset?.n || 0,
        p2o5: preset?.p2o5 || 0,
        k2o: preset?.k2o || 0,
        s: preset?.s || 0,
        ca: preset?.ca || 0,
        mg: preset?.mg || 0,
        b: preset?.b || 0,
        zn: preset?.zn || 0,
      };
    }

    // Apply secondary fertilizer proportion (Termofosfato Magnesiano) if enabled
    const isEligible = isFruitOrPerennialCrop || isCoffeeCrop;
    if (isEligible && enableSecondaryPlanting) {
      const p = secondaryPlantingPercentage; // 0 to 100
      const mainPct = (100 - p) / 100;
      const secPct = p / 100;

      return {
        name: `${baseGuarantees.name} (${100 - p}%) + Termofosfato Magnesiano (${p}%)`,
        mainName: baseGuarantees.name,
        n: baseGuarantees.n * mainPct,
        p2o5: baseGuarantees.p2o5 * mainPct + 18 * secPct,
        k2o: baseGuarantees.k2o * mainPct,
        s: baseGuarantees.s * mainPct,
        ca: baseGuarantees.ca * mainPct + 18 * secPct,
        mg: baseGuarantees.mg * mainPct + 7 * secPct,
        b: baseGuarantees.b * mainPct,
        zn: baseGuarantees.zn * mainPct,
      };
    }

    return {
      ...baseGuarantees,
      mainName: baseGuarantees.name,
    };
  }, [
    isCustomFertilizer,
    customFertName,
    customFertN,
    customFertP2O5,
    customFertK2O,
    customFertS,
    customFertCa,
    customFertMg,
    customFertB,
    customFertZn,
    selectedFormulationId,
    enableSecondaryPlanting,
    secondaryPlantingPercentage,
    isFruitOrPerennialCrop,
    isCoffeeCrop,
  ]);

  // Auto-calculated Planting Dosage based on Nutrient Demand (P2O5 / K2O / N) and Active Fertilizer Concentration
  const autoCalculatedPlantingDose = useMemo(() => {
    const p2o5Demand = activeCropDemands.p2o5 ?? 64;
    const k2oDemand = activeCropDemands.k2o ?? 50;
    const nDemand = activeCropDemands.n ?? 20;

    const p2o5Pct = activeFertilizerGuarantees.p2o5;
    const k2oPct = activeFertilizerGuarantees.k2o;
    const nPct = activeFertilizerGuarantees.n;

    let targetNutrientName = 'P₂O₅';
    let targetNutrientKg = p2o5Demand;
    let guaranteePct = p2o5Pct;

    if (p2o5Pct > 0) {
      targetNutrientName = 'P₂O₅';
      targetNutrientKg = p2o5Demand;
      guaranteePct = p2o5Pct;
    } else if (k2oPct > 0) {
      targetNutrientName = 'K₂O';
      targetNutrientKg = k2oDemand;
      guaranteePct = k2oPct;
    } else if (nPct > 0) {
      targetNutrientName = 'N';
      targetNutrientKg = nDemand;
      guaranteePct = nPct;
    } else {
      return {
        doseKgHa: 300,
        targetNutrientName: 'P₂O₅',
        targetNutrientKg: 64,
        guaranteePct: 20,
      };
    }

    const rawDose = targetNutrientKg / (guaranteePct / 100);
    const doseKgHa = Number(rawDose.toFixed(2));

    return {
      doseKgHa,
      targetNutrientName,
      targetNutrientKg,
      guaranteePct,
    };
  }, [activeCropDemands, activeFertilizerGuarantees]);

  // Sync plantingDoseKgHa automatically when formulation or crop demand changes
  useEffect(() => {
    if (autoCalculatedPlantingDose.doseKgHa > 0) {
      setPlantingDoseKgHa(autoCalculatedPlantingDose.doseKgHa);
    }
  }, [autoCalculatedPlantingDose.doseKgHa]);

  // Nutrients Supplied by Planting Dose (kg/ha and g/ha)
  const plantingNutrientsSupplied = useMemo(() => {
    const doseKgHa = plantingDoseKgHa === '' ? 0 : Number(plantingDoseKgHa);
    const area = currentSoil?.areaHa || 50;
    const gPerPlant = calculatedPopulationHa > 0 ? (doseKgHa * 1000) / calculatedPopulationHa : 0;
    const gPerM = furrowMetersHa > 0 ? (doseKgHa * 1000) / furrowMetersHa : 0;
    const totalKg = doseKgHa * area;

    return {
      doseKgHa,
      totalKg,
      gPerPlant,
      gPerM,
      suppliedN: (doseKgHa * activeFertilizerGuarantees.n) / 100,
      suppliedP2O5: (doseKgHa * activeFertilizerGuarantees.p2o5) / 100,
      suppliedK2O: (doseKgHa * activeFertilizerGuarantees.k2o) / 100,
      suppliedS: (doseKgHa * activeFertilizerGuarantees.s) / 100,
      suppliedCa: (doseKgHa * activeFertilizerGuarantees.ca) / 100,
      suppliedMg: (doseKgHa * activeFertilizerGuarantees.mg) / 100,
      suppliedB: (doseKgHa * activeFertilizerGuarantees.b) / 100 * 1000, // g/ha
      suppliedZn: (doseKgHa * activeFertilizerGuarantees.zn) / 100 * 1000, // g/ha
    };
  }, [plantingDoseKgHa, currentSoil?.areaHa, calculatedPopulationHa, furrowMetersHa, activeFertilizerGuarantees]);

  // Dosage Input Display Value Converter
  const currentPlantingDoseDisplayVal = useMemo(() => {
    if (plantingDoseKgHa === '') return '';
    const kgHa = Number(plantingDoseKgHa);
    const area = currentSoil?.areaHa || 50;

    if (plantingDoseUnit === 'kg_ha') return kgHa;
    if (plantingDoseUnit === 'area_total') return Number((kgHa * area).toFixed(1));
    if (plantingDoseUnit === 'g_planta') return Number(((kgHa * 1000) / (calculatedPopulationHa || 1)).toFixed(2));
    if (plantingDoseUnit === 'g_sulco') return Number(((kgHa * 1000) / (furrowMetersHa || 1)).toFixed(2));
    return kgHa;
  }, [plantingDoseKgHa, plantingDoseUnit, currentSoil?.areaHa, calculatedPopulationHa, furrowMetersHa]);

  const handlePlantingDoseValueChange = (val: number | '') => {
    if (val === '') {
      setPlantingDoseKgHa('');
      return;
    }
    const num = Number(val);
    const area = currentSoil?.areaHa || 50;

    if (plantingDoseUnit === 'kg_ha') {
      setPlantingDoseKgHa(num);
    } else if (plantingDoseUnit === 'area_total') {
      setPlantingDoseKgHa(area > 0 ? Number((num / area).toFixed(1)) : num);
    } else if (plantingDoseUnit === 'g_planta') {
      setPlantingDoseKgHa(Number(((num * calculatedPopulationHa) / 1000).toFixed(1)));
    } else if (plantingDoseUnit === 'g_sulco') {
      setPlantingDoseKgHa(Number(((num * furrowMetersHa) / 1000).toFixed(1)));
    }
  };

  // Soybean Detection (BNF / FBN - Biological Nitrogen Fixation)
  const isSojaCrop = useMemo(() => {
    const cropId = (selectedPlantingCropId || '').toLowerCase();
    const actualRec = CROP_PLANTING_RECOMMENDATIONS.find(c => c.cropId === selectedPlantingCropId);
    const cropName = actualRec?.cropName?.toLowerCase() || '';
    return cropId.includes('soja') || cropName.includes('soja');
  }, [selectedPlantingCropId]);

  // Synchronize selectedPlantingCropId when switching soil analyses
  useEffect(() => {
    if (currentSoil?.cropName) {
      const cleanString = (str: string) => {
        return str
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // remove accents
          .replace(/cafeeiro/g, 'cafe') // normalize cafeeiro -> cafe
          .replace(/-/g, ' ') // normalize dashes
          .trim();
      };

      const soilCropClean = cleanString(currentSoil.cropName);
      
      const matched = CROP_PLANTING_RECOMMENDATIONS.find(c => {
        const recCropIdClean = cleanString(c.cropId);
        const recCropNameClean = cleanString(c.cropName);
        
        return (
          recCropIdClean === soilCropClean ||
          recCropNameClean === soilCropClean ||
          recCropNameClean.includes(soilCropClean) ||
          soilCropClean.includes(recCropNameClean)
        );
      });

      if (matched) {
        setSelectedPlantingCropId(matched.cropId);
        setSelectedFormulationId(matched.recommendedFormulationId);
        setPlantingDoseKgHa(matched.defaultPlantingDoseKgHa);
      }
    }
  }, [selectedSoilId, currentSoil]);

  // Auto-switch topdressing source to KCl when Soja is active
  useEffect(() => {
    if (isSojaCrop && (topdressingSource === 'min-ureia' || topdressingSource === 'min-sulfato-amonio')) {
      setTopdressingSource('min-kcl');
      if (topdressingDoseKgHa === '' || topdressingDoseKgHa === 180) {
        setTopdressingDoseKgHa(150);
      }
    }
  }, [isSojaCrop]);

  // Play synthesizer chime for notifications
  const playNotificationChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.12); // E5
      gain2.gain.setValueAtTime(0.08, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.52);
    } catch (err) {
      console.error('Audio chime failed:', err);
    }
  };

  // Persist reminders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('agronutri_fertilizer_reminders', JSON.stringify(reminders));
    } catch (err) {
      console.error('Failed to save reminders:', err);
    }
  }, [reminders]);

  // Request browser notification permission
  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    try {
      const perm = await Notification.requestPermission();
      setBrowserNotificationPermission(perm);
      if (perm === 'granted') {
        playNotificationChime();
        new Notification('AgroNutri Pro', {
          body: 'Notificações ativadas com sucesso! Você receberá os avisos de adubação aqui.',
        });
      }
    } catch (err) {
      console.error('Notification request failed:', err);
    }
  };

  // Checker loop for scheduled reminders (checks every 30 seconds, optimized to save battery on mobile/tablet)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${hours}:${minutes}`;

      let updated = false;
      const newReminders = reminders.map(r => {
        if (r.status === 'agendado') {
          // If date matches and current time is equal or past the scheduled time
          if (r.scheduledDate < todayStr || (r.scheduledDate === todayStr && r.scheduledTime <= timeStr)) {
            updated = true;
            
            // Fire in-app alert
            setActiveFiredReminder(r);
            playNotificationChime();

            // Fire browser push notification if granted
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(`Adubação - ${r.cropName}`, {
                  body: `Está na hora da aplicação! ${r.type === 'plantio' ? 'Adubação de Plantio' : `Cobertura (${r.parcelaNum}ª Parcela)`}: ${r.fertilizerName} @ ${r.dose}. Destinatário: ${r.recipientName}`,
                  requireInteraction: true
                });
              } catch (e) {
                console.error(e);
              }
            }

            return { ...r, status: 'enviado' };
          }
        }
        return r;
      });

      if (updated) {
        setReminders(newReminders);
      }
    }, 30000);

    return () => clearInterval(timer);
  }, [reminders]);

  // Topdressing Active Guarantees & Nutrient Supply
  const activeTopdressingData = useMemo(() => {
    return TOPDRESSING_SOURCES_CATALOG.find(s => s.id === topdressingSource) || TOPDRESSING_SOURCES_CATALOG[0];
  }, [topdressingSource]);



  // Sync parcelas list whenever topdressingSplits changes
  const handleTopdressingSplitsChange = (val: string) => {
    setTopdressingSplits(val);
    if (val !== 'custom') {
      const count = parseInt(val, 10) || 1;
      setCustomNumSplits(count);
      handleSyncSplitsFromCount(count);
    }
  };

  const handleSyncSplitsFromCount = (targetCount: number) => {
    const count = Math.max(1, Math.min(12, targetCount));
    setCustomNumSplits(count);

    if (parcelaList.length === count) return;

    if (parcelaList.length < count) {
      const currentDose = topdressingDoseKgHa ? Number(topdressingDoseKgHa) : 180;
      const dosePerParcela = Number((currentDose / count).toFixed(1));

      const newParcelas = [...parcelaList];
      for (let i = parcelaList.length; i < count; i++) {
        const num = i + 1;
        newParcelas.push({
          id: `p-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`,
          name: `${num}ª Parcela de Cobertura`,
          timing: `${num * 30} DAP`,
          fertilizers: [
            {
              id: `f-${Date.now()}-${i}-1`,
              sourceId: topdressingSource || 'min-kcl',
              doseKgHa: dosePerParcela > 0 ? dosePerParcela : 90,
            }
          ],
          observation: ''
        });
      }
      setParcelaList(newParcelas);
    } else {
      setParcelaList(parcelaList.slice(0, count));
    }
  };

  const handleCloneParcela = (indexToClone: number) => {
    const target = parcelaList[indexToClone];
    if (!target) return;

    const clonedFertilizers: ParcelaFertilizerItem[] = target.fertilizers.map(f => ({
      ...f,
      id: `f-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    }));

    const nextNumber = parcelaList.length + 1;
    const clonedParcela: ParcelaConfig = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `${nextNumber}ª Parcela (Cópia de ${target.name.split(' - ')[0] || target.name})`,
      timing: target.timing,
      fertilizers: clonedFertilizers,
      observation: target.observation ? `${target.observation} (Cópia)` : ''
    };

    const updated = [...parcelaList];
    updated.splice(indexToClone + 1, 0, clonedParcela);
    setParcelaList(updated);
    setCustomNumSplits(updated.length);
    if (topdressingSplits !== 'custom') {
      setTopdressingSplits('custom');
    }
  };

  const handleCloneFertilizerInParcela = (pIndex: number, fIndex: number) => {
    const updated = [...parcelaList];
    const targetFert = updated[pIndex]?.fertilizers[fIndex];
    if (!targetFert) return;

    const clonedFert: ParcelaFertilizerItem = {
      ...targetFert,
      id: `f-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };

    updated[pIndex].fertilizers.splice(fIndex + 1, 0, clonedFert);
    setParcelaList(updated);
  };

  const handleAddFertilizerToParcela = (pIndex: number) => {
    const updated = [...parcelaList];
    if (!updated[pIndex]) return;
    updated[pIndex].fertilizers.push({
      id: `f-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sourceId: topdressingSource || 'min-kcl',
      doseKgHa: 50,
    });
    setParcelaList(updated);
  };

  const handleRemoveFertilizerFromParcela = (pIndex: number, fIndex: number) => {
    const updated = [...parcelaList];
    if (!updated[pIndex] || updated[pIndex].fertilizers.length <= 1) return;
    updated[pIndex].fertilizers.splice(fIndex, 1);
    setParcelaList(updated);
  };

  const handleAddParcela = () => {
    const num = parcelaList.length + 1;
    const newParcela: ParcelaConfig = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `${num}ª Parcela de Cobertura`,
      timing: `${num * 30} DAP`,
      fertilizers: [
        {
          id: `f-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          sourceId: topdressingSource || 'min-kcl',
          doseKgHa: 90,
        }
      ],
      observation: ''
    };
    const updated = [...parcelaList, newParcela];
    setParcelaList(updated);
    setCustomNumSplits(updated.length);
    if (topdressingSplits !== 'custom') {
      setTopdressingSplits('custom');
    }
  };

  const handleRemoveParcela = (indexToRemove: number) => {
    if (parcelaList.length <= 1) return;
    const updated = parcelaList.filter((_, idx) => idx !== indexToRemove);
    setParcelaList(updated);
    setCustomNumSplits(updated.length);
  };

  // Comprehensive Total Calculations for Parcelas (Macro & Micro)
  const parcelasNutrientsTotal = useMemo(() => {
    const area = currentSoil?.areaHa || 50;
    const pop = calculatedPopulationHa || 1;
    const furrow = furrowMetersHa || 1;

    let totalDoseKgHa = 0;
    let totalN = 0;
    let totalP2O5 = 0;
    let totalK2O = 0;
    let totalCa = 0;
    let totalMg = 0;
    let totalS = 0;
    let totalB = 0;
    let totalZn = 0;
    let totalCu = 0;
    let totalMn = 0;
    let totalMo = 0;

    parcelaList.forEach(p => {
      p.fertilizers.forEach(f => {
        const dose = Number(f.doseKgHa) || 0;
        totalDoseKgHa += dose;

        const src = TOPDRESSING_SOURCES_CATALOG.find(s => s?.id === f.sourceId) || TOPDRESSING_SOURCES_CATALOG[0];

        const nVal = src?.id === 'custom-topdressing' ? (f.customN || 0) : (src?.n || 0);
        const p2o5Val = src?.id === 'custom-topdressing' ? (f.customP2O5 || 0) : (src?.p2o5 || 0);
        const k2oVal = src?.id === 'custom-topdressing' ? (f.customK2O || 0) : (src?.k2o || 0);
        const caVal = src?.id === 'custom-topdressing' ? (f.customCa || 0) : (src?.ca || 0);
        const mgVal = src?.id === 'custom-topdressing' ? (f.customMg || 0) : (src?.mg || 0);
        const sVal = src?.id === 'custom-topdressing' ? (f.customS || 0) : (src?.s || 0);
        const bVal = src?.id === 'custom-topdressing' ? (f.customB || 0) : (src?.b || 0);
        const znVal = src?.id === 'custom-topdressing' ? (f.customZn || 0) : (src?.zn || 0);
        const cuVal = src?.id === 'custom-topdressing' ? (f.customCu || 0) : (src?.cu || 0);
        const mnVal = src?.id === 'custom-topdressing' ? (f.customMn || 0) : (src?.mn || 0);
        const moVal = src?.id === 'custom-topdressing' ? (f.customMo || 0) : (src?.mo || 0);

        totalN += (dose * nVal) / 100;
        totalP2O5 += (dose * p2o5Val) / 100;
        totalK2O += (dose * k2oVal) / 100;
        totalCa += (dose * caVal) / 100;
        totalMg += (dose * mgVal) / 100;
        totalS += (dose * sVal) / 100;
        totalB += (dose * bVal) / 100;
        totalZn += (dose * znVal) / 100;
        totalCu += (dose * cuVal) / 100;
        totalMn += (dose * mnVal) / 100;
        totalMo += (dose * moVal) / 100;
      });
    });

    const totalFarmKg = totalDoseKgHa * area;
    const gPerPlant = pop > 0 ? (totalDoseKgHa * 1000) / pop : 0;
    const gPerM = furrow > 0 ? (totalDoseKgHa * 1000) / furrow : 0;

    return {
      totalDoseKgHa,
      totalFarmKg,
      gPerPlant,
      gPerM,
      totalN,
      totalP2O5,
      totalK2O,
      totalCa,
      totalMg,
      totalS,
      totalB,
      totalZn,
      totalCu,
      totalMn,
      totalMo,
      totalBG: totalB * 1000,
      totalZnG: totalZn * 1000,
      totalCuG: totalCu * 1000,
      totalMnG: totalMn * 1000,
      totalMoG: totalMo * 1000,
      nPerPlantG: pop > 0 ? (totalN * 1000) / pop : 0,
      k2oPerPlantG: pop > 0 ? (totalK2O * 1000) / pop : 0,
      caPerPlantG: pop > 0 ? (totalCa * 1000) / pop : 0,
      mgPerPlantG: pop > 0 ? (totalMg * 1000) / pop : 0,
      sPerPlantG: pop > 0 ? (totalS * 1000) / pop : 0,
      bPerPlantMg: pop > 0 ? (totalB * 1000 * 1000) / pop : 0,
      znPerPlantMg: pop > 0 ? (totalZn * 1000 * 1000) / pop : 0,
    };
  }, [parcelaList, currentSoil?.areaHa, calculatedPopulationHa, furrowMetersHa]);

  // Official Bulletin Topdressing Recommendation per Crop
  const bulletinTopdressingRecommendation = useMemo(() => {
    const crop = selectedPlantingCropRec;
    const cropId = (selectedPlantingCropId || '').toLowerCase();
    const cropName = crop?.cropName || currentSoil?.cropName || 'Cultura Geral';
    const bulletin = currentBulletin;
    const totalN = activeCropDemands.n || 0;
    const totalP2O5 = activeCropDemands.p2o5 || 0;
    const totalK2O = activeCropDemands.k2o || 0;
    const totalCa = activeCropDemands.ca || 0;
    const totalMg = activeCropDemands.mg || 0;
    const totalS = activeCropDemands.s || 0;

    const isLegumeFbn = ['soja', 'amendoim', 'ervilha', 'feijao-caupi', 'crotalaria', 'guandu', 'alfafa', 'lab-lab'].some(k => cropId.includes(k) || cropName.toLowerCase().includes(k));
    const isCornOrCereal = ['milho', 'sorgo', 'trigo', 'arroz', 'aveia', 'cevada', 'centeio'].some(k => cropId.includes(k) || cropName.toLowerCase().includes(k));
    const isCotton = cropId.includes('algod');
    const isCoffee = isCoffeeCrop || cropId.includes('cafe') || cropName.toLowerCase().includes('café') || cropName.toLowerCase().includes('cafeeiro');
    const isFruitOrPerennial = isFruitOrPerennialCrop && !isCoffee;
    const isVegOrHorti = ['tomate', 'batata', 'cenoura', 'pimentao', 'repolho', 'alface', 'alho', 'cebola', 'morango', 'melancia', 'meloes'].some(k => cropId.includes(k) || cropName.toLowerCase().includes(k));

    // Calculate Topdressing Nutrients (kg/ha) according to Bulletin rules
    let recommendedTopdressingN = 0;
    let recommendedTopdressingP2O5 = 0;
    let recommendedTopdressingK2O = 0;
    let recommendedTopdressingS = 0;
    let recommendedTopdressingCa = 0;
    let recommendedTopdressingMg = 0;
    let recommendedTopdressingBoroG = 0;
    let recommendedTopdressingZincoG = 0;

    if (isCoffee) {
      const isConilon = coffeeType === 'conilon' || cropId.includes('conilon');
      if (coffeePhase === 'formacao_1ano') {
        recommendedTopdressingN = isConilon ? 70 : 60;
        recommendedTopdressingP2O5 = isConilon ? 40 : 30;
        recommendedTopdressingK2O = isConilon ? 70 : 60;
        recommendedTopdressingCa = 25;
        recommendedTopdressingS = 20;
        recommendedTopdressingBoroG = 1000;
        recommendedTopdressingZincoG = 1200;
      } else if (coffeePhase === 'formacao_2ano') {
        recommendedTopdressingN = isConilon ? 220 : 180;
        recommendedTopdressingP2O5 = isConilon ? 40 : 30;
        recommendedTopdressingK2O = isConilon ? 220 : 180;
        recommendedTopdressingCa = 35;
        recommendedTopdressingS = 30;
        recommendedTopdressingBoroG = 1500;
        recommendedTopdressingZincoG = 1800;
      } else if (coffeePhase === 'producao') {
        const yieldTarget = coffeeYieldTargetSc || (isConilon ? 80 : 45);
        if (isConilon) {
          if (yieldTarget <= 50) { recommendedTopdressingN = 200; recommendedTopdressingK2O = 220; recommendedTopdressingP2O5 = 40; }
          else if (yieldTarget <= 80) { recommendedTopdressingN = 320; recommendedTopdressingK2O = 360; recommendedTopdressingP2O5 = 60; }
          else if (yieldTarget <= 110) { recommendedTopdressingN = 440; recommendedTopdressingK2O = 480; recommendedTopdressingP2O5 = 80; }
          else { recommendedTopdressingN = 540; recommendedTopdressingK2O = 580; recommendedTopdressingP2O5 = 100; }
        } else {
          if (yieldTarget <= 30) { recommendedTopdressingN = 160; recommendedTopdressingK2O = 170; recommendedTopdressingP2O5 = 30; }
          else if (yieldTarget <= 50) { recommendedTopdressingN = 250; recommendedTopdressingK2O = 270; recommendedTopdressingP2O5 = 50; }
          else if (yieldTarget <= 70) { recommendedTopdressingN = 330; recommendedTopdressingK2O = 360; recommendedTopdressingP2O5 = 70; }
          else { recommendedTopdressingN = 400; recommendedTopdressingK2O = 440; recommendedTopdressingP2O5 = 90; }
        }
        recommendedTopdressingCa = 50; recommendedTopdressingMg = 30; recommendedTopdressingS = 40;
        recommendedTopdressingBoroG = 2200; recommendedTopdressingZincoG = 2500;
      } else if (coffeePhase === 'renovacao_poda') {
        const isRecepa = coffeePruningType === 'recepa';
        if (isRecepa) {
          recommendedTopdressingN = isConilon ? 180 : 140;
          recommendedTopdressingP2O5 = 60;
          recommendedTopdressingK2O = isConilon ? 70 : 50;
          recommendedTopdressingCa = 30; recommendedTopdressingS = 25;
          recommendedTopdressingBoroG = 1500; recommendedTopdressingZincoG = 2000;
        } else {
          recommendedTopdressingN = isConilon ? 220 : 180;
          recommendedTopdressingP2O5 = 40;
          recommendedTopdressingK2O = isConilon ? 140 : 110;
          recommendedTopdressingCa = 35; recommendedTopdressingS = 30;
          recommendedTopdressingBoroG = 1800; recommendedTopdressingZincoG = 2200;
        }
      }
    } else if (isLegumeFbn) {
      recommendedTopdressingN = 0; // FBN
      recommendedTopdressingK2O = Math.max(30, totalK2O);
      recommendedTopdressingS = Math.max(0, totalS - 10);
    } else if (isCornOrCereal) {
      const plantingN = Math.min(25, Math.round(totalN * 0.2));
      recommendedTopdressingN = Math.max(20, Math.round(totalN - plantingN));
      recommendedTopdressingK2O = totalK2O > 50 ? Math.round(totalK2O - 30) : 0;
      recommendedTopdressingS = Math.max(10, Math.round(totalS * 0.6));
      recommendedTopdressingZincoG = activeCropDemands.zn || 1200;
    } else if (isCotton) {
      recommendedTopdressingN = Math.max(40, Math.round(totalN - 20));
      recommendedTopdressingK2O = Math.max(30, Math.round(totalK2O - 40));
      recommendedTopdressingBoroG = activeCropDemands.b || 1500;
    } else if (isFruitOrPerennial) {
      recommendedTopdressingN = Math.round(totalN * 0.80);
      recommendedTopdressingP2O5 = Math.round(totalP2O5 * 0.30);
      recommendedTopdressingK2O = Math.round(totalK2O * 0.80);
      recommendedTopdressingCa = Math.round((totalCa || 30) * 0.50);
      recommendedTopdressingMg = Math.round((totalMg || 15) * 0.50);
      recommendedTopdressingS = Math.round((totalS || 20) * 0.70);
      recommendedTopdressingBoroG = activeCropDemands.b || 1200;
      recommendedTopdressingZincoG = activeCropDemands.zn || 1500;
    } else if (isVegOrHorti) {
      recommendedTopdressingN = Math.round(totalN * 0.75);
      recommendedTopdressingP2O5 = Math.round(totalP2O5 * 0.20);
      recommendedTopdressingK2O = Math.round(totalK2O * 0.75);
      recommendedTopdressingCa = Math.round((totalCa || 20) * 0.60);
      recommendedTopdressingS = Math.round((totalS || 15) * 0.60);
      recommendedTopdressingBoroG = activeCropDemands.b || 800;
    } else {
      recommendedTopdressingN = Math.round(totalN * 0.70);
      recommendedTopdressingK2O = totalK2O > 40 ? Math.round(totalK2O - 30) : 0;
      recommendedTopdressingS = Math.round((totalS || 15) * 0.50);
    }

    // Number of parcelas & timing schedule according to bulletin
    let numSplits = 2;
    let suggestedParcelas: ParcelaConfig[] = [];
    let agronomicGuideline = '';

    if (isCoffee) {
      const isConilon = coffeeType === 'conilon' || cropId.includes('conilon');
      const coffeeBulletinCode = isConilon ? 'Incaper ES / Embrapa Conilon' : 'Boletim 100 IAC / 5ª Aprox. MG';

      if (coffeePhase === 'formacao_1ano') {
        numSplits = 5;
        const pop = calculatedPopulationHa || (isConilon ? 3333 : 4444);
        const gNPerPlant = Number(((recommendedTopdressingN * 1000) / pop).toFixed(1));
        const gKPerPlant = Number(((recommendedTopdressingK2O * 1000) / pop).toFixed(1));
        const ureaSplitDose = Math.round((recommendedTopdressingN / 0.45) / 5);
        const kclSplitDose = Math.round((recommendedTopdressingK2O / 0.60) / 5);

        suggestedParcelas = [
          { id: 'c-f1-1', name: '1ª Parcela (Pós-Pegamento Mudas)', timing: '30 DAP (Novembro)', fertilizers: [{ id: 'cf1-1', sourceId: 'min-ureia', doseKgHa: ureaSplitDose }], observation: `Aplicar ~${(gNPerPlant/5).toFixed(1)}g N/planta em coroa a 10-15cm do tronco.` },
          { id: 'c-f1-2', name: '2ª Parcela (Crescimento Vegetativo)', timing: '60 DAP (Dezembro)', fertilizers: [{ id: 'cf1-2', sourceId: 'min-ureia', doseKgHa: ureaSplitDose }, { id: 'cf1-2k', sourceId: 'min-kcl', doseKgHa: kclSplitDose }], observation: `Emissão dos primeiros ramos plagiotrópicos.` },
          { id: 'c-f1-3', name: '3ª Parcela (Verão Pleno)', timing: '90 DAP (Janeiro)', fertilizers: [{ id: 'cf1-3', sourceId: 'min-ureia', doseKgHa: ureaSplitDose }, { id: 'cf1-3k', sourceId: 'min-kcl', doseKgHa: kclSplitDose }], observation: `Adubação em coroa acompanhando o crescimento radicular.` },
          { id: 'c-f1-4', name: '4ª Parcela (Nutrição Foliar/Cálcio)', timing: '120 DAP (Fevereiro)', fertilizers: [{ id: 'cf1-4', sourceId: 'min-nitrato-calcio-boro', doseKgHa: 40 }], observation: `Suplementação de Ca e B para estruturação caulinar.` },
          { id: 'c-f1-5', name: '5ª Parcela (Outono)', timing: '150 DAP (Março)', fertilizers: [{ id: 'cf1-5', sourceId: 'min-kcl', doseKgHa: kclSplitDose }], observation: `Acúmulo de reservas para enfrentamento do período seco de inverno.` },
        ];
        agronomicGuideline = `Conforme ${coffeeBulletinCode}: Café de Formação (1º Ano - Implantação de ${isConilon ? 'Conilon' : 'Arábica'}). Adubação em coroa parcelada em 5 vezes de ~${gNPerPlant}g N e ~${gKPerPlant}g K₂O por muda. Foco em enraizamento e brotação.`;

      } else if (coffeePhase === 'formacao_2ano') {
        numSplits = 4;
        const u4 = Math.round((recommendedTopdressingN / 0.45) / 4);
        const k4 = Math.round((recommendedTopdressingK2O / 0.60) / 4);

        suggestedParcelas = [
          { id: 'c-f2-1', name: '1ª Parcela (Início das Chuvas / Primavera)', timing: 'Outubro', fertilizers: [{ id: 'cf2-1', sourceId: 'min-ureia', doseKgHa: u4 }, { id: 'cf2-1k', sourceId: 'min-kcl', doseKgHa: k4 }], observation: `Início do vigoroso crescimento vegetativo do 2º ano.` },
          { id: 'c-f2-2', name: '2ª Parcela (Verão Inicial)', timing: 'Dezembro', fertilizers: [{ id: 'cf2-2', sourceId: 'min-ureia', doseKgHa: u4 }, { id: 'cf2-2k', sourceId: 'min-kcl', doseKgHa: k4 }], observation: `Expansão de nós e internódios reprodutivos.` },
          { id: 'c-f2-3', name: '3ª Parcela (Verão Pleno)', timing: 'Janeiro / Fevereiro', fertilizers: [{ id: 'cf2-3', sourceId: 'min-nitrato-calcio-boro', doseKgHa: 80 }], observation: `Nitrato de Cálcio e Boro para consistência celular.` },
          { id: 'c-f2-4', name: '4ª Parcela (Fim das Chuvas)', timing: 'Março', fertilizers: [{ id: 'cf2-4', sourceId: 'min-kcl', doseKgHa: k4 }], observation: `Finalização do crescimento vegetativo pré-safra.` },
        ];
        agronomicGuideline = `Conforme ${coffeeBulletinCode}: Café de Formação (2º Ano - Pré-Produção de ${isConilon ? 'Conilon' : 'Arábica'}). Adubação em projeção da saia dividida em 4 parcelas no período chuvoso.`;

      } else if (coffeePhase === 'producao') {
        numSplits = 4;
        const uPerP = Math.round((recommendedTopdressingN / 0.45) / 4);
        const kPerP = Math.round((recommendedTopdressingK2O / 0.60) / 4);

        suggestedParcelas = [
          { id: 'c-prod-1', name: '1ª Parcela (Florada / Pós-Chumbinho)', timing: 'Outubro / Novembro', fertilizers: [{ id: 'cp-1-1', sourceId: 'min-ureia', doseKgHa: uPerP }, { id: 'cp-1-2', sourceId: 'min-kcl', doseKgHa: kPerP }], observation: `Fixação de chumbinhos e nova vegetação dos ramos.` },
          { id: 'c-prod-2', name: '2ª Parcela (Expansão Rápida dos Frutos)', timing: 'Dezembro', fertilizers: [{ id: 'cp-2-1', sourceId: 'min-ureia', doseKgHa: uPerP }, { id: 'cp-2-2', sourceId: 'min-kcl', doseKgHa: kPerP }], observation: `Maior taxa de absorção de Nitrogênio e Potássio.` },
          { id: 'c-prod-3', name: '3ª Parcela (Enchimento de Grãos / Granação)', timing: 'Janeiro / Fevereiro', fertilizers: [{ id: 'cp-3-1', sourceId: 'min-nitrato-potassio', doseKgHa: 100 }, { id: 'cp-3-2', sourceId: 'min-nitrato-calcio-boro', doseKgHa: 80 }], observation: `Enchimento endospérmico, densidade dos grãos e peso de sacas.` },
          { id: 'c-prod-4', name: '4ª Parcela (Maturação / Pré-Colheita)', timing: 'Março / Abril', fertilizers: [{ id: 'cp-4-1', sourceId: 'min-kcl', doseKgHa: kPerP }, { id: 'cp-4-2', sourceId: 'micro-mix-frutiferas', doseKgHa: 15 }], observation: `Uniformização da maturação e recomposição das reservas nutricionais dos ramos.` },
        ];
        agronomicGuideline = `Conforme ${coffeeBulletinCode}: Café de Produção (${isConilon ? 'Conilon' : 'Arábica'}, Meta: ${coffeeYieldTargetSc || (isConilon ? 80 : 45)} sc/ha). Adubação de cobertura dividida em 4 parcelas na projeção da saia acompanhando a demanda da carga pênsil.`;

      } else if (coffeePhase === 'renovacao_poda') {
        const isRecepa = coffeePruningType === 'recepa';
        numSplits = 3;
        if (isRecepa) {
          suggestedParcelas = [
            { id: 'c-poda-1', name: '1ª Parcela (Início de Brotação Ortotrópica)', timing: 'Outubro / Novembro', fertilizers: [{ id: 'cpod-1-1', sourceId: 'min-ureia', doseKgHa: 100 }, { id: 'cpod-1-2', sourceId: 'min-map-purificado', doseKgHa: 80 }], observation: `Estímulo de emissão de brotos ladrões e enraizamento após estresse de poda.` },
            { id: 'c-poda-2', name: '2ª Parcela (Pós-Desbrota)', timing: 'Dezembro / Janeiro', fertilizers: [{ id: 'cpod-2-1', sourceId: 'min-ureia', doseKgHa: 100 }, { id: 'cpod-2-2', sourceId: 'min-kcl', doseKgHa: 50 }], observation: `Condução de 3 a 4 hastes selecionadas por touça.` },
            { id: 'c-poda-3', name: '3ª Parcela (Outono Vegetativo)', timing: 'Fevereiro / Março', fertilizers: [{ id: 'cpod-3-1', sourceId: 'min-nitrato-calcio-boro', doseKgHa: 70 }, { id: 'cpod-3-2', sourceId: 'micro-mix-frutiferas', doseKgHa: 12 }], observation: `Consolidação e engrossamento das novas hastes.` },
          ];
          agronomicGuideline = `Conforme ${coffeeBulletinCode}: Café em Renovação por Recepa (Poda Baixa). Sem carga de frutos no 1º ano. Dose de Potássio (K₂O) reduzida e focado em Nitrogênio, Fósforo solúvel e Micronutrientes (B e Zn) para brotação vigorosa das hastes.`;
        } else {
          suggestedParcelas = [
            { id: 'c-dec-1', name: '1ª Parcela (Pós-Poda / Primavera)', timing: 'Outubro', fertilizers: [{ id: 'cdec-1', sourceId: 'min-ureia', doseKgHa: 120 }, { id: 'cdec-1k', sourceId: 'min-kcl', doseKgHa: 70 }], observation: `Estímulo de ramos laterais (esqueletados/decotados).` },
            { id: 'c-dec-2', name: '2ª Parcela (Verão)', timing: 'Dezembro / Janeiro', fertilizers: [{ id: 'cdec-2', sourceId: 'min-ureia', doseKgHa: 120 }, { id: 'cdec-2k', sourceId: 'min-kcl', doseKgHa: 70 }], observation: `Recomposição da arquitetura foliar e nós reprodutivos.` },
            { id: 'c-dec-3', name: '3ª Parcela (Outono)', timing: 'Fevereiro / Março', fertilizers: [{ id: 'cdec-3', sourceId: 'min-nitrato-calcio-boro', doseKgHa: 80 }], observation: `Nutrição de Ca e B para estruturação dos novos nós.` },
          ];
          agronomicGuideline = `Conforme ${coffeeBulletinCode}: Café em Renovação por Decote / Esqueletamento. Recomposição da arquitetura da planta e preparação dos nós para a próxima florada.`;
        }
      }

    } else if (isLegumeFbn) {
      numSplits = 1;
      const kclDose = Number((recommendedTopdressingK2O / 0.60).toFixed(0));
      suggestedParcelas = [
        {
          id: `b-p-1`,
          name: '1ª Parcela Única de Cobertura (V2 - V4)',
          timing: '20 a 25 DAP (Estádio V2-V4)',
          fertilizers: [
            { id: `f-b-1`, sourceId: 'min-kcl', doseKgHa: kclDose > 0 ? kclDose : 120 }
          ],
          observation: `Boletim ${bulletin.code}: Aplicação 100% potássica para proteger a Fixação Biológica de Nitrogênio (FBN).`
        }
      ];
    } else if (isCornOrCereal) {
      numSplits = 2;
      const ureaTotal = Math.round(recommendedTopdressingN / 0.45);
      const kclTotal = recommendedTopdressingK2O > 0 ? Math.round(recommendedTopdressingK2O / 0.60) : 0;
      
      const ureaP1 = Math.round(ureaTotal * 0.5);
      const ureaP2 = ureaTotal - ureaP1;
      const kclP1 = Math.round(kclTotal * 0.6);
      const kclP2 = kclTotal - kclP1;

      suggestedParcelas = [
        {
          id: `b-p-1`,
          name: '1ª Parcela de Cobertura (V4 - Perfilhamento/Início)',
          timing: '15 a 20 DAP (Estádio V4)',
          fertilizers: [
            { id: `f-b-1-1`, sourceId: 'min-ureia', doseKgHa: ureaP1 > 0 ? ureaP1 : 100 },
            ...(kclP1 > 0 ? [{ id: `f-b-1-2`, sourceId: 'min-kcl', doseKgHa: kclP1 }] : [])
          ],
          observation: `Boletim ${bulletin.code}: Aplicação no início da diferenciação do pendão/espiga com solo úmido.`
        },
        {
          id: `b-p-2`,
          name: '2ª Parcela de Cobertura (V8 - Definição de Produção)',
          timing: '35 a 40 DAP (Estádio V8)',
          fertilizers: [
            { id: `f-b-2-1`, sourceId: 'min-ureia', doseKgHa: ureaP2 > 0 ? ureaP2 : 100 },
            ...(kclP2 > 0 ? [{ id: `f-b-2-2`, sourceId: 'min-kcl', doseKgHa: kclP2 }] : [])
          ],
          observation: `Boletim ${bulletin.code}: Aplicação antes do fechamento do dossel para máximo rendimento de grãos.`
        }
      ];
    } else if (isCotton) {
      numSplits = 2;
      const ureaTotal = Math.round(recommendedTopdressingN / 0.45);
      const kclTotal = Math.round(recommendedTopdressingK2O / 0.60);

      suggestedParcelas = [
        {
          id: `b-p-1`,
          name: '1ª Cobertura (B2 - Primeiro Botão Floral)',
          timing: '20 a 25 DAP',
          fertilizers: [
            { id: `f-b-1-1`, sourceId: 'min-ureia', doseKgHa: Math.round(ureaTotal * 0.5) },
            { id: `f-b-1-2`, sourceId: 'min-kcl', doseKgHa: Math.round(kclTotal * 0.5) }
          ],
          observation: `Boletim Embrapa/IAC: Suplementar Boro via solo/folha neste estádio.`
        },
        {
          id: `b-p-2`,
          name: '2ª Cobertura (F1 - Início do Florescimento)',
          timing: '40 a 45 DAP',
          fertilizers: [
            { id: `f-b-2-1`, sourceId: 'min-ureia', doseKgHa: Math.round(ureaTotal * 0.5) },
            { id: `f-b-2-2`, sourceId: 'min-kcl', doseKgHa: Math.round(kclTotal * 0.5) }
          ],
          observation: `Boletim Embrapa/IAC: Garantir suprimento de N e K para desenvolvimento das maçãs.`
        }
      ];
    } else if (isFruitOrPerennial) {
      numSplits = 3;
      const doseFormulado = Math.round(recommendedTopdressingK2O / 0.20);
      const dosePerP = Math.round(doseFormulado / 3);

      suggestedParcelas = [
        {
          id: `b-p-1`,
          name: '1ª Parcela (Início das Chuvas / Primavera)',
          timing: 'Outubro / Novembro (Brotação)',
          fertilizers: [
            { id: `f-b-1-1`, sourceId: 'npk-15-05-20-frutiferas', doseKgHa: dosePerP > 0 ? dosePerP : 150 },
            { id: `f-b-1-2`, sourceId: 'min-nitrato-calcio-boro', doseKgHa: 80 }
          ],
          observation: `Boletim ${bulletin.code}: Aplicar na projeção da copa com solo úmido.`
        },
        {
          id: `b-p-2`,
          name: '2ª Parcela (Verão / Enchimento de Frutos)',
          timing: 'Dezembro / Janeiro',
          fertilizers: [
            { id: `f-b-2-1`, sourceId: 'npk-15-05-20-frutiferas', doseKgHa: dosePerP > 0 ? dosePerP : 150 },
            { id: `f-b-2-2`, sourceId: 'min-sulfato-magnesio', doseKgHa: 50 }
          ],
          observation: `Boletim ${bulletin.code}: Fase crítica de demanda de K, Mg e N para pegamento de frutos.`
        },
        {
          id: `b-p-3`,
          name: '3ª Parcela (Final do Verão / Maturação)',
          timing: 'Fevereiro / Março',
          fertilizers: [
            { id: `f-b-3-1`, sourceId: 'min-nitrato-potassio', doseKgHa: 100 },
            { id: `f-b-3-2`, sourceId: 'micro-mix-frutiferas', doseKgHa: 15 }
          ],
          observation: `Boletim ${bulletin.code}: Acúmulo de açúcares, calibre e reservas energéticas.`
        }
      ];
    } else {
      numSplits = 2;
      const ureaTotal = Math.round(recommendedTopdressingN / 0.45);
      const kclTotal = recommendedTopdressingK2O > 0 ? Math.round(recommendedTopdressingK2O / 0.60) : 0;

      suggestedParcelas = [
        {
          id: `b-p-1`,
          name: '1ª Parcela de Cobertura',
          timing: '20 a 25 DAP',
          fertilizers: [
            { id: `f-b-1-1`, sourceId: 'min-ureia', doseKgHa: Math.round(ureaTotal * 0.5) || 100 },
            ...(kclTotal > 0 ? [{ id: `f-b-1-2`, sourceId: 'min-kcl', doseKgHa: Math.round(kclTotal * 0.5) }] : [])
          ],
          observation: `Boletim ${bulletin.code}: Aplicação inicial de desenvolvimento vegetativo.`
        },
        {
          id: `b-p-2`,
          name: '2ª Parcela de Cobertura',
          timing: '40 a 45 DAP',
          fertilizers: [
            { id: `f-b-2-1`, sourceId: 'min-ureia', doseKgHa: Math.round(ureaTotal * 0.5) || 100 },
            ...(kclTotal > 0 ? [{ id: `f-b-2-2`, sourceId: 'min-kcl', doseKgHa: Math.round(kclTotal * 0.5) }] : [])
          ],
          observation: `Boletim ${bulletin.code}: Segunda cobertura para enchimento de grãos/frutos.`
        }
      ];
    }

    // Equivalent Commercial Fertilizers calculations
    const area = currentSoil?.areaHa || 50;
    const pop = calculatedPopulationHa || 1;
    const furrow = furrowMetersHa || 1;

    const equivalentFertilizers = [
      ...(recommendedTopdressingN > 0 ? [{
        name: 'Ureia (45% N)',
        doseKgHa: Math.round(recommendedTopdressingN / 0.45),
        totalFarmKg: Math.round((recommendedTopdressingN / 0.45) * area),
        gPerPlant: Number((((recommendedTopdressingN / 0.45) * 1000) / pop).toFixed(1)),
        gPerM: Number((((recommendedTopdressingN / 0.45) * 1000) / furrow).toFixed(1)),
        nutrientRole: `${recommendedTopdressingN} kg/ha de N`
      }] : []),
      ...(recommendedTopdressingK2O > 0 ? [{
        name: 'Cloreto de Potássio - KCl (60% K₂O)',
        doseKgHa: Math.round(recommendedTopdressingK2O / 0.60),
        totalFarmKg: Math.round((recommendedTopdressingK2O / 0.60) * area),
        gPerPlant: Number((((recommendedTopdressingK2O / 0.60) * 1000) / pop).toFixed(1)),
        gPerM: Number((((recommendedTopdressingK2O / 0.60) * 1000) / furrow).toFixed(1)),
        nutrientRole: `${recommendedTopdressingK2O} kg/ha de K₂O`
      }] : []),
      ...(recommendedTopdressingCa > 0 ? [{
        name: 'Nitrato de Cálcio (15,5% N + 19% Ca)',
        doseKgHa: Math.round(recommendedTopdressingCa / 0.19),
        totalFarmKg: Math.round((recommendedTopdressingCa / 0.19) * area),
        gPerPlant: Number((((recommendedTopdressingCa / 0.19) * 1000) / pop).toFixed(1)),
        gPerM: Number((((recommendedTopdressingCa / 0.19) * 1000) / furrow).toFixed(1)),
        nutrientRole: `${recommendedTopdressingCa} kg/ha de Ca`
      }] : []),
      ...(recommendedTopdressingS > 0 ? [{
        name: 'Sulfato de Amônio (21% N + 24% S)',
        doseKgHa: Math.round(recommendedTopdressingS / 0.24),
        totalFarmKg: Math.round((recommendedTopdressingS / 0.24) * area),
        gPerPlant: Number((((recommendedTopdressingS / 0.24) * 1000) / pop).toFixed(1)),
        gPerM: Number((((recommendedTopdressingS / 0.24) * 1000) / furrow).toFixed(1)),
        nutrientRole: `${recommendedTopdressingS} kg/ha de Enxofre`
      }] : [])
    ];

    // Technical Agronomic Notes from Bulletin
    if (!agronomicGuideline) {
      if (isLegumeFbn) {
        agronomicGuideline = `Conforme ${bulletin.code} e Embrapa: A cultura da ${cropName} fixa 100% do N via simbiose (FBN). Não aplicar N mineral em cobertura. Recomenda-se aplicar ${recommendedTopdressingK2O} kg/ha de K₂O em cobertura no estádio V2-V4.`;
      } else if (isCornOrCereal) {
        agronomicGuideline = `Conforme ${bulletin.code}: Recomenda-se a aplicação total de ${recommendedTopdressingN} kg/ha de N em cobertura, parcelada em 2 vezes (estádios V4 e V8), incorporada por irrigação ou chuva recente para evitar perdas por volatilização de amônia (NH₃).`;
      } else if (isFruitOrPerennial) {
        agronomicGuideline = `Conforme ${bulletin.code}: Em culturas perenes/frutíferas (${cropName}), parcelar a cobertura em 3 a 4 aplicações durante o período de maior precipitação e atividade radicular (Outubro a Março), cobrindo a faixa da projeção da copa.`;
      } else {
        agronomicGuideline = `Conforme ${bulletin.code}: Recomenda-se o parcelamento da adubação de cobertura em ${numSplits} aplicações durante a fase de crescimento vegetativo e pré-florescimento.`;
      }
    }

    return {
      cropName,
      bulletinTitle: bulletin.name,
      bulletinCode: bulletin.code,
      recommendedNutrients: {
        n: recommendedTopdressingN,
        p2o5: recommendedTopdressingP2O5,
        k2o: recommendedTopdressingK2O,
        ca: recommendedTopdressingCa,
        mg: recommendedTopdressingMg,
        s: recommendedTopdressingS,
        boroG: recommendedTopdressingBoroG,
        zincoG: recommendedTopdressingZincoG,
      },
      isLegumeFbn,
      suggestedSplitsCount: numSplits,
      suggestedParcelas,
      equivalentFertilizers,
      agronomicGuideline
    };
  }, [selectedPlantingCropRec, selectedPlantingCropId, currentSoil, currentBulletin, activeCropDemands, isFruitOrPerennialCrop, isCoffeeCrop, coffeeType, coffeePhase, coffeeYieldTargetSc, coffeePruningType, calculatedPopulationHa, furrowMetersHa]);

  // Handler to apply official bulletin recommendation directly to interactive topdressing parcelas
  const handleApplyBulletinTopdressingRecommendation = () => {
    const rec = bulletinTopdressingRecommendation;
    if (!rec || !rec.suggestedParcelas || rec.suggestedParcelas.length === 0) return;

    setParcelaList(rec.suggestedParcelas);
    setCustomNumSplits(rec.suggestedSplitsCount);
    setTopdressingSplits(rec.suggestedSplitsCount.toString());
    setTopdressingObservation(rec.agronomicGuideline);

    let sumDose = 0;
    rec.suggestedParcelas.forEach(p => {
      p.fertilizers.forEach(f => {
        sumDose += f.doseKgHa;
      });
    });
    if (sumDose > 0) {
      setTopdressingDoseKgHa(sumDose);
    }
  };

  const topdressingNutrientsSupplied = useMemo(() => {
    const doseKgHa = topdressingDoseKgHa === '' ? 0 : Number(topdressingDoseKgHa);
    const area = currentSoil?.areaHa || 50;
    const gPerPlant = calculatedPopulationHa > 0 ? (doseKgHa * 1000) / calculatedPopulationHa : 0;
    const gPerM = furrowMetersHa > 0 ? (doseKgHa * 1000) / furrowMetersHa : 0;
    const totalKg = doseKgHa * area;

    return {
      doseKgHa,
      totalKg,
      gPerPlant,
      gPerM,
      suppliedN: (doseKgHa * activeTopdressingData.n) / 100,
      suppliedP2O5: (doseKgHa * activeTopdressingData.p2o5) / 100,
      suppliedK2O: (doseKgHa * activeTopdressingData.k2o) / 100,
      suppliedS: (doseKgHa * activeTopdressingData.s) / 100,
    };
  }, [topdressingDoseKgHa, activeTopdressingData, currentSoil?.areaHa, calculatedPopulationHa, furrowMetersHa]);

  const currentTopdressingDoseDisplayVal = useMemo(() => {
    if (topdressingDoseKgHa === '') return '';
    const kgHa = Number(topdressingDoseKgHa);
    const area = currentSoil?.areaHa || 50;

    if (topdressingDoseUnit === 'kg_ha') return kgHa;
    if (topdressingDoseUnit === 'area_total') return Number((kgHa * area).toFixed(1));
    if (topdressingDoseUnit === 'g_planta') return Number(((kgHa * 1000) / (calculatedPopulationHa || 1)).toFixed(2));
    if (topdressingDoseUnit === 'g_sulco') return Number(((kgHa * 1000) / (furrowMetersHa || 1)).toFixed(2));
    return kgHa;
  }, [topdressingDoseKgHa, topdressingDoseUnit, currentSoil?.areaHa, calculatedPopulationHa, furrowMetersHa]);

  const handleTopdressingDoseValueChange = (val: number | '') => {
    if (val === '') {
      setTopdressingDoseKgHa('');
      return;
    }
    const num = Number(val);
    const area = currentSoil?.areaHa || 50;

    if (topdressingDoseUnit === 'kg_ha') {
      setTopdressingDoseKgHa(num);
    } else if (topdressingDoseUnit === 'area_total') {
      setTopdressingDoseKgHa(area > 0 ? Number((num / area).toFixed(1)) : num);
    } else if (topdressingDoseUnit === 'g_planta') {
      setTopdressingDoseKgHa(Number(((num * calculatedPopulationHa) / 1000).toFixed(1)));
    } else if (topdressingDoseUnit === 'g_sulco') {
      setTopdressingDoseKgHa(Number(((num * furrowMetersHa) / 1000).toFixed(1)));
    }
  };

  const handleSelectPlantingCrop = (cropId: string) => {
    setSelectedPlantingCropId(cropId);
    const baseCrop = CROP_PLANTING_RECOMMENDATIONS.find(c => c.cropId === cropId) || CROP_PLANTING_RECOMMENDATIONS[0];
    const rec = getBulletinCalibratedCropParameters(baseCrop, currentBulletin, currentSoil);
    if (rec) {
      setSelectedFormulationId(rec.recommendedFormulationId);
      setPlantingDoseKgHa(rec.defaultPlantingDoseKgHa);
      setLimingTargetV(rec.targetV);
      if (rec.expectedYieldDefault) {
        setExtractionExpectedYield(rec.expectedYieldDefault);
      }
      if (rec.cropId.includes('soja')) {
        setTopdressingSource('min-kcl');
        setTopdressingDoseKgHa(150);
      }
      if (rec.defaultSpacing) {
        setRowSpacingM(rec.defaultSpacing.rowSpacingM);
        if (rec.defaultSpacing.plantsPerMeter) {
          setPlantSpacingMode('per_meter');
          setPlantsPerMeter(rec.defaultSpacing.plantsPerMeter);
        } else if (rec.defaultSpacing.plantSpacingM) {
          setPlantSpacingMode('plant_distance');
          setPlantSpacingM(rec.defaultSpacing.plantSpacingM);
        }
      }
      setIsCropSelectorModalOpen(false);
      showNotification(`Recomendação carregada para ${rec.cropName} (${rec.defaultPlantingDoseKgHa} kg/ha de ${rec.recommendedFormulationId.toUpperCase()} • V% Alvo ${rec.targetV}%)`);
    }
  };

  const handleSelectPopPreset = (presetId: string) => {
    setSelectedPopPresetId(presetId);
    const p = POPULATION_CROP_PRESETS.find(x => x.id === presetId);
    if (p) {
      setRowSpacingM(p.rowSpacing);
      if (p.plantsPerM) {
        setPlantSpacingMode('per_meter');
        setPlantsPerMeter(p.plantsPerM);
      } else if (p.plantDistM) {
        setPlantSpacingMode('plant_distance');
        setPlantSpacingM(p.plantDistM);
      }
      if (p.pmv !== undefined) setThousandSeedWeightG(p.pmv);
      if (p.seedsBag !== undefined) setSeedsPerBag(p.seedsBag);
      if (p.germ !== undefined) setGerminationRatePct(p.germ);
      if (p.emerg !== undefined) setEmergenceRatePct(p.emerg);
      setCustomPopulationHa('');
      showNotification(`Parâmetros populacionais de ${p.name} carregados!`);
    }
  };

  const handleApplyPlantingCropRecommendation = (rec: CropPlantingRecommendation) => {
    setSelectedFormulationId(rec.recommendedFormulationId);
    setPlantingDoseKgHa(rec.defaultPlantingDoseKgHa);
    if (rec.defaultSpacing) {
      setRowSpacingM(rec.defaultSpacing.rowSpacingM);
      if (rec.defaultSpacing.plantsPerMeter) {
        setPlantSpacingMode('per_meter');
        setPlantsPerMeter(rec.defaultSpacing.plantsPerMeter);
      } else if (rec.defaultSpacing.plantSpacingM) {
        setPlantSpacingMode('plant_distance');
        setPlantSpacingM(rec.defaultSpacing.plantSpacingM);
      }
    }
    showNotification(`Recomendação para ${rec.cropName} aplicada: ${rec.defaultPlantingDoseKgHa} kg/ha!`);
  };

  // Fertilizer Mixer State
  const [mixerSourceA, setMixerSourceA] = useState<string>('min-map');
  const [mixerSourceB, setMixerSourceB] = useState<string>('min-kcl');
  const [mixerSourceC, setMixerSourceC] = useState<string>('min-sulfato-amonio');
  const [mixerKgA, setMixerKgA] = useState<number | ''>(400);
  const [mixerKgB, setMixerKgB] = useState<number | ''>(350);
  const [mixerKgC, setMixerKgC] = useState<number | ''>(250);

  // Active Absorption Curve & Nutrient Comparison
  const [selectedCurveCrop, setSelectedCurveCrop] = useState<string>('soja');
  const [selectedCurveNutrient, setSelectedCurveNutrient] = useState<string>('N');
  const [curveCycleDays, setCurveCycleDays] = useState<number>(120);
  const [curveDisplayDays, setCurveDisplayDays] = useState<number>(120);

  // Sync default cycle days when selectedCurveCrop changes
  useEffect(() => {
    const staticCurve = ABSORPTION_CURVES_CATALOG.find(c => c.cropId === selectedCurveCrop);
    let defaultCycle = 120;
    if (staticCurve) {
      defaultCycle = staticCurve.cycleDays;
    } else {
      const cropRec = CROP_PLANTING_RECOMMENDATIONS.find(c => c.cropId === selectedCurveCrop);
      const name = (cropRec?.cropName || '').toLowerCase();
      if (name.includes('alface') || name.includes('rabanete') || name.includes('coentro') || name.includes('rúcula') || name.includes('maxixe') || name.includes('espinafre')) {
        defaultCycle = 45;
      } else if (name.includes('tomate') || name.includes('pimentão') || name.includes('melancia') || name.includes('batata') || name.includes('cebola') || name.includes('alho') || name.includes('morango')) {
        defaultCycle = 90;
      } else if (name.includes('soja') || name.includes('milho') || name.includes('trigo') || name.includes('arroz') || name.includes('feijão') || name.includes('cevada') || name.includes('aveia') || name.includes('sorgo')) {
        defaultCycle = 120;
      } else {
        defaultCycle = 365;
      }
    }
    setCurveCycleDays(defaultCycle);
    setCurveDisplayDays(defaultCycle);
  }, [selectedCurveCrop]);

  const comparisonCurveData = useMemo(() => {
    const getPercentForNutrient = (pt: any, nutrient: string): number => {
      if (nutrient === 'N') return pt.percentN ?? 0;
      if (nutrient === 'P2O5') return pt.percentP2O5 ?? 0;
      if (nutrient === 'K2O') return pt.percentK2O ?? 0;
      if (nutrient === 'Ca') return pt.percentCa ?? 0;
      if (nutrient === 'Mg') return pt.percentMg ?? 0;
      if (nutrient === 'S') return pt.percentS ?? 0;
      if (nutrient === 'B') return pt.percentB ?? pt.percentN ?? 0;
      if (nutrient === 'Zn') return pt.percentZn ?? pt.percentN ?? 0;
      if (nutrient === 'Cu') return pt.percentCu ?? pt.percentN ?? 0;
      if (nutrient === 'Mn') return pt.percentMn ?? pt.percentN ?? 0;
      if (nutrient === 'Fe') return pt.percentFe ?? pt.percentN ?? 0;
      return pt.percentN ?? 0;
    };

    const cropRec = CROP_PLANTING_RECOMMENDATIONS.find(c => c.cropId === selectedCurveCrop) || CROP_PLANTING_RECOMMENDATIONS[0];
    const staticCurve = ABSORPTION_CURVES_CATALOG.find(c => c.cropId === selectedCurveCrop);
    
    let rawPoints: any[] = [];
    if (staticCurve && curveCycleDays === staticCurve.cycleDays) {
      rawPoints = staticCurve.points;
    } else {
      const staticPoints = staticCurve?.points || [];
      if (staticPoints.length > 0) {
        rawPoints = staticPoints.map(pt => {
          const ratio = pt.dae / staticCurve!.cycleDays;
          return {
            ...pt,
            dae: Math.round(ratio * curveCycleDays)
          };
        });
      } else {
        rawPoints = [
          {
            dae: Math.round(curveCycleDays * 0.15),
            phenologicalStage: 'Vegetativo Inicial (V2)',
            percentN: 5, percentP2O5: 4, percentK2O: 6, percentCa: 5, percentMg: 5, percentS: 4,
            percentB: 5, percentZn: 4, percentCu: 4, percentMn: 4, percentFe: 4
          },
          {
            dae: Math.round(curveCycleDays * 0.35),
            phenologicalStage: 'Desenvolvimento Vegetativo Ativo',
            percentN: 22, percentP2O5: 18, percentK2O: 28, percentCa: 20, percentMg: 18, percentS: 20,
            percentB: 20, percentZn: 18, percentCu: 18, percentMn: 18, percentFe: 18
          },
          {
            dae: Math.round(curveCycleDays * 0.55),
            phenologicalStage: 'Início do Florescimento / Pré-Frutificação',
            percentN: 52, percentP2O5: 46, percentK2O: 60, percentCa: 48, percentMg: 45, percentS: 48,
            percentB: 50, percentZn: 48, percentCu: 48, percentMn: 48, percentFe: 48
          },
          {
            dae: Math.round(curveCycleDays * 0.75),
            phenologicalStage: 'Enchimento de Grãos / Expansão de Frutos',
            percentN: 80, percentP2O5: 75, percentK2O: 88, percentCa: 76, percentMg: 74, percentS: 78,
            percentB: 78, percentZn: 76, percentCu: 76, percentMn: 76, percentFe: 76
          },
          {
            dae: Math.round(curveCycleDays * 0.90),
            phenologicalStage: 'Maturação Fisiológica',
            percentN: 94, percentP2O5: 92, percentK2O: 96, percentCa: 90, percentMg: 88, percentS: 92,
            percentB: 94, percentZn: 92, percentCu: 92, percentMn: 92, percentFe: 92
          },
          {
            dae: curveCycleDays,
            phenologicalStage: 'Maturidade de Colheita / Final do Ciclo',
            percentN: 100, percentP2O5: 100, percentK2O: 100, percentCa: 100, percentMg: 100, percentS: 100,
            percentB: 100, percentZn: 100, percentCu: 100, percentMn: 100, percentFe: 100
          }
        ];
      }
    }

    const demands = cropRec.demandsKgPerHa || { n: 100, p2o5: 80, k2o: 90, ca: 30, mg: 15, s: 20, b: 800, zn: 1500, cu: 350, mn: 1200, fe: 500 };
    
    let totalBiologicalDemand = 100;
    const isMicro = ['B', 'Zn', 'Cu', 'Mn', 'Fe'].includes(selectedCurveNutrient);
    if (selectedCurveNutrient === 'N') totalBiologicalDemand = demands.n || 100;
    else if (selectedCurveNutrient === 'P2O5') totalBiologicalDemand = demands.p2o5 || 80;
    else if (selectedCurveNutrient === 'K2O') totalBiologicalDemand = demands.k2o || 90;
    else if (selectedCurveNutrient === 'Ca') totalBiologicalDemand = demands.ca || 30;
    else if (selectedCurveNutrient === 'Mg') totalBiologicalDemand = demands.mg || 15;
    else if (selectedCurveNutrient === 'S') totalBiologicalDemand = demands.s || 20;
    else if (selectedCurveNutrient === 'B') totalBiologicalDemand = demands.b || 800;
    else if (selectedCurveNutrient === 'Zn') totalBiologicalDemand = demands.zn || 1500;
    else if (selectedCurveNutrient === 'Cu') totalBiologicalDemand = demands.cu || 350;
    else if (selectedCurveNutrient === 'Mn') totalBiologicalDemand = demands.mn || 1200;
    else if (selectedCurveNutrient === 'Fe') totalBiologicalDemand = demands.fe || 500;

    let totalRecommendedDemand = totalBiologicalDemand;
    if (selectedCurveCrop === selectedPlantingCropId && activeCropDemands) {
      if (selectedCurveNutrient === 'N') totalRecommendedDemand = activeCropDemands.n || 100;
      else if (selectedCurveNutrient === 'P2O5') totalRecommendedDemand = activeCropDemands.p2o5 || 80;
      else if (selectedCurveNutrient === 'K2O') totalRecommendedDemand = activeCropDemands.k2o || 90;
      else if (selectedCurveNutrient === 'Ca') totalRecommendedDemand = activeCropDemands.ca || 30;
      else if (selectedCurveNutrient === 'Mg') totalRecommendedDemand = activeCropDemands.mg || 15;
      else if (selectedCurveNutrient === 'S') totalRecommendedDemand = activeCropDemands.s || 20;
      else if (selectedCurveNutrient === 'B') totalRecommendedDemand = activeCropDemands.b || 800;
      else if (selectedCurveNutrient === 'Zn') totalRecommendedDemand = activeCropDemands.zn || 1500;
      else if (selectedCurveNutrient === 'Cu') totalRecommendedDemand = activeCropDemands.cu || 350;
      else if (selectedCurveNutrient === 'Mn') totalRecommendedDemand = activeCropDemands.mn || 1200;
      else if (selectedCurveNutrient === 'Fe') totalRecommendedDemand = activeCropDemands.fe || 500;
    }

    let plantingActual = 0;
    if (selectedCurveCrop === selectedPlantingCropId) {
      if (selectedCurveNutrient === 'N') plantingActual = plantingNutrientsSupplied.suppliedN;
      else if (selectedCurveNutrient === 'P2O5') plantingActual = plantingNutrientsSupplied.suppliedP2O5;
      else if (selectedCurveNutrient === 'K2O') plantingActual = plantingNutrientsSupplied.suppliedK2O;
      else if (selectedCurveNutrient === 'Ca') plantingActual = plantingNutrientsSupplied.suppliedCa;
      else if (selectedCurveNutrient === 'Mg') plantingActual = plantingNutrientsSupplied.suppliedMg;
      else if (selectedCurveNutrient === 'S') plantingActual = plantingNutrientsSupplied.suppliedS;
      else if (selectedCurveNutrient === 'B') plantingActual = plantingNutrientsSupplied.suppliedB;
      else if (selectedCurveNutrient === 'Zn') plantingActual = plantingNutrientsSupplied.suppliedZn;
    }

    const parsedParcelas = selectedCurveCrop === selectedPlantingCropId ? parcelaList.map((p, idx) => {
      const match = p.timing.match(/(\d+)\s*(?:DAP|DAE|dias)/i);
      const parsedDae = match ? parseInt(match[1], 10) : Math.round(([0.25, 0.50, 0.75, 0.90][idx] || 0.95) * curveCycleDays);
      
      let supply = 0;
      p.fertilizers.forEach(f => {
        const dose = Number(f.doseKgHa) || 0;
        const src = TOPDRESSING_SOURCES_CATALOG.find(s => s?.id === f.sourceId) || TOPDRESSING_SOURCES_CATALOG[0];
        
        let val = 0;
        if (src?.id === 'custom-topdressing') {
          if (selectedCurveNutrient === 'N') val = f.customN || 0;
          else if (selectedCurveNutrient === 'P2O5') val = f.customP2O5 || 0;
          else if (selectedCurveNutrient === 'K2O') val = f.customK2O || 0;
          else if (selectedCurveNutrient === 'Ca') val = f.customCa || 0;
          else if (selectedCurveNutrient === 'Mg') val = f.customMg || 0;
          else if (selectedCurveNutrient === 'S') val = f.customS || 0;
          else if (selectedCurveNutrient === 'B') val = f.customB || 0;
          else if (selectedCurveNutrient === 'Zn') val = f.customZn || 0;
          else if (selectedCurveNutrient === 'Cu') val = f.customCu || 0;
          else if (selectedCurveNutrient === 'Mn') val = f.customMn || 0;
          else if (selectedCurveNutrient === 'Fe') val = f.customFe || 0;
        } else if (src) {
          const s = src as any;
          if (selectedCurveNutrient === 'N') val = s.n || 0;
          else if (selectedCurveNutrient === 'P2O5') val = s.p2o5 || 0;
          else if (selectedCurveNutrient === 'K2O') val = s.k2o || 0;
          else if (selectedCurveNutrient === 'Ca') val = s.ca || 0;
          else if (selectedCurveNutrient === 'Mg') val = s.mg || 0;
          else if (selectedCurveNutrient === 'S') val = s.s || 0;
          else if (selectedCurveNutrient === 'B') val = s.b || 0;
          else if (selectedCurveNutrient === 'Zn') val = s.zn || 0;
          else if (selectedCurveNutrient === 'Cu') val = s.cu || 0;
          else if (selectedCurveNutrient === 'Mn') val = s.mn || 0;
          else if (selectedCurveNutrient === 'Fe') val = s.fe || 0;
        }

        if (isMicro) {
          supply += dose * (val / 100) * 1000;
        } else {
          supply += dose * (val / 100);
        }
      });

      return { dae: parsedDae, supply };
    }) : [];

    const filteredPoints = rawPoints.filter(pt => pt.dae <= curveDisplayDays);

    return filteredPoints.map((pt) => {
      const pct = getPercentForNutrient(pt, selectedCurveNutrient);
      const demandaFisiologica = Math.round((pct / 100) * totalBiologicalDemand);

      const isFixedNutrient = ['P2O5', 'Ca', 'Mg'].includes(selectedCurveNutrient);
      let recommendedCumulative = 0;
      if (isFixedNutrient) {
        recommendedCumulative = totalRecommendedDemand;
      } else {
        recommendedCumulative = totalRecommendedDemand * 0.40;
        if (pt.dae >= Math.round(curveCycleDays * 0.25)) {
          recommendedCumulative += totalRecommendedDemand * 0.30;
        }
        if (pt.dae >= Math.round(curveCycleDays * 0.50)) {
          recommendedCumulative += totalRecommendedDemand * 0.30;
        }
      }
      recommendedCumulative = Math.round(Math.min(totalRecommendedDemand, recommendedCumulative));

      let aporteEfetivo = plantingActual;
      parsedParcelas.forEach(p => {
        if (p.dae <= pt.dae) {
          aporteEfetivo += p.supply;
        }
      });
      aporteEfetivo = Math.round(aporteEfetivo);

      return {
        dae: `${pt.dae} DAE`,
        stage: pt.phenologicalStage,
        percentCrop: pct,
        demandaKgHa: demandaFisiologica,
        recomendacaoApp: recommendedCumulative,
        aporteAppKgHa: aporteEfetivo,
      };
    });
  }, [
    selectedCurveCrop,
    selectedCurveNutrient,
    curveCycleDays,
    curveDisplayDays,
    activeCropDemands,
    plantingNutrientsSupplied,
    parcelaList,
    selectedPlantingCropId,
  ]);

  // Scenario Simulator
  const [activeScenario, setActiveScenario] = useState<'economico' | 'padrao' | 'alta_produtividade'>('padrao');

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // When changing regional bulletin, auto-adjust liming method and target V%
  const handleSelectBulletin = (bulletinId: string) => {
    setSelectedBulletinId(bulletinId);
    const b = allBulletins.find(x => x.id === bulletinId) || getBulletinById(bulletinId);
    setLimingMethod(b.defaultLimingMethod);
    const baseCrop = CROP_PLANTING_RECOMMENDATIONS.find(c => c.cropId === selectedPlantingCropId) || CROP_PLANTING_RECOMMENDATIONS[0];
    const calibrated = getBulletinCalibratedCropParameters(baseCrop, b, currentSoil);
    setLimingTargetV(calibrated.targetV);
    setSelectedFormulationId(calibrated.recommendedFormulationId);
    setPlantingDoseKgHa(calibrated.defaultPlantingDoseKgHa);
    showNotification(`Boletim ${b.code} (${b.name}) selecionado! Parâmetros de ${calibrated.cropName} recalculados (V% Alvo: ${calibrated.targetV}%, Fórmula: ${calibrated.recommendedFormulationId.toUpperCase()}).`);
  };

  // Save Custom Bulletin Reference
  const handleSaveCustomBulletin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBulletin.name || !newBulletin.code) {
      showNotification('Por favor, insira o nome e o código do boletim.');
      return;
    }

    const uniqueId = `boletim-custom-${Date.now()}`;
    
    // Parse covered states from comma separated string
    let statesArr: string[] = ['MT'];
    if (typeof newBulletin.coveredStates === 'string') {
      statesArr = (newBulletin.coveredStates as string).split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    } else if (Array.isArray(newBulletin.coveredStates)) {
      statesArr = newBulletin.coveredStates;
    }

    const formattedBulletin: RegionalBulletin = {
      id: uniqueId,
      code: newBulletin.code,
      name: newBulletin.name,
      institution: newBulletin.institution || 'Consultoria Agro',
      region: newBulletin.region || 'Região Personalizada',
      coveredStates: statesArr,
      edition: newBulletin.edition || '2026',
      description: newBulletin.description || 'Boletim Técnico Personalizado',
      badgeColor: 'bg-indigo-600 text-white',
      
      defaultLimingMethod: newBulletin.defaultLimingMethod || 'v_percent',
      supportedLimingMethods: newBulletin.supportedLimingMethods || ['v_percent', 'al_neutralization'],
      targetVByCrop: newBulletin.targetVByCrop || { soja: 65, milho: 70 },
      textureClasses: newBulletin.textureClasses || {
        sandy: { maxClay: 15, label: 'Arenosa (<15% argila)' },
        medium: { minClay: 15, maxClay: 35, label: 'Média (15 a 35% argila)' },
        clayey: { minClay: 35, maxClay: 60, label: 'Argilosa (35 a 60% argila)' },
        veryClayey: { minClay: 60, label: 'Muito Argilosa (>60% argila)' },
      },
      phosphorusMethod: newBulletin.phosphorusMethod || 'Resina',
      pCriticalLevels: newBulletin.pCriticalLevels || {
        sandy: { low: 10, medium: 20, good: 30, high: 45 },
        medium: { low: 8, medium: 16, good: 24, high: 36 },
        clayey: { low: 5, medium: 10, good: 15, high: 22 },
        veryClayey: { low: 3.5, medium: 7, good: 10, high: 16 },
      },
      kCriticalLevels: newBulletin.kCriticalLevels || { low: 0.15, medium: 0.30, good: 0.45, high: 0.60 },
      gypsumMethod: newBulletin.gypsumMethod || 'clay_multiplier',
      gypsumFactor: Number(newBulletin.gypsumFactor) || 50,
      notes: newBulletin.notes || ['Boletim customizado definido pelo agrônomo.'],
      officialReference: newBulletin.officialReference || 'Referência personalizada inserida pelo usuário.',
      
      // Custom extensions
      pRemanescenteCritical: Number(newBulletin.pRemanescenteCritical) || 25,
      sulfurCriticalLevel: Number(newBulletin.sulfurCriticalLevel) || 10,
      boronCriticalLevel: Number(newBulletin.boronCriticalLevel) || 0.35,
      zincCriticalLevel: Number(newBulletin.zincCriticalLevel) || 1.2,
      copperCriticalLevel: Number(newBulletin.copperCriticalLevel) || 0.8,
      manganeseCriticalLevel: Number(newBulletin.manganeseCriticalLevel) || 4.0,
      ironCriticalLevel: Number(newBulletin.ironCriticalLevel) || 12.0,
      tolerableAlSaturation: Number(newBulletin.tolerableAlSaturation) || 15,
      idealCaPercentageRange: newBulletin.idealCaPercentageRange || { min: 50, max: 70 },
      idealMgPercentageRange: newBulletin.idealMgPercentageRange || { min: 10, max: 20 },
      idealKPercentageRange: newBulletin.idealKPercentageRange || { min: 2, max: 5 },
    };

    // Save custom list
    const savedList = localStorage.getItem('geaagro_custom_bulletins');
    let customList: RegionalBulletin[] = [];
    if (savedList) {
      try {
        customList = JSON.parse(savedList);
      } catch (e) {
        console.error(e);
      }
    }
    customList.push(formattedBulletin);
    localStorage.setItem('geaagro_custom_bulletins', JSON.stringify(customList));

    // Update state
    setAllBulletins([...REGIONAL_BULLETINS, ...customList]);
    
    // Auto-select newly created bulletin!
    setSelectedBulletinId(uniqueId);
    setLimingMethod(formattedBulletin.defaultLimingMethod);
    const cropKey = currentSoil.cropName.toLowerCase();
    const targetV = formattedBulletin.targetVByCrop?.[cropKey] || formattedBulletin.targetVByCrop?.['soja'] || 65;
    setLimingTargetV(targetV);

    setShowCustomModal(false);
    showNotification(`Boletim personalizado "${formattedBulletin.name}" adicionado com sucesso!`);
  };

  // Determine Soil Texture Class based on Bulletin
  const textureClassKey = useMemo(() => {
    const clay = currentSoil.clayPercent;
    const tc = currentBulletin.textureClasses;
    if (clay <= tc.sandy.maxClay) return 'sandy';
    if (clay <= tc.medium.maxClay) return 'medium';
    if (clay <= tc.clayey.maxClay) return 'clayey';
    return 'veryClayey';
  }, [currentSoil.clayPercent, currentBulletin]);

  // Regional Nutrient Diagnoses
  const regionalDiagnosis = useMemo(() => {
    // 1. Fósforo (P)
    const pLevels = currentBulletin.pCriticalLevels[textureClassKey] || currentBulletin.pCriticalLevels['clayey'] || { low: 10, medium: 20, good: 30, high: 45 };
    const pVal = currentBulletin.phosphorusMethod === 'Resina' ? currentSoil.pResina : currentSoil.pMehlich1;
    const pStatus = evaluateNutrientStatus(pVal, pLevels);

    // 2. Potássio (K)
    const kLevels = currentBulletin.kCriticalLevels;
    const kVal = currentSoil.kCmolc;
    const kStatus = evaluateNutrientStatus(kVal, kLevels);

    // 3. Saturação por Bases (V%)
    const cropKey = currentSoil.cropName.toLowerCase();
    const targetV = currentBulletin.targetVByCrop[cropKey] || 65;
    const vVal = currentSoil.baseSaturationPercent;
    let vStatus: { status: string; color: string; badgeBg: string } = {
      status: 'Adequado',
      color: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300',
    };
    if (vVal < targetV * 0.75) {
      vStatus = { status: 'Muito Baixo (Calagem Urgente)', color: 'text-rose-600 dark:text-rose-400', badgeBg: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300' };
    } else if (vVal < targetV) {
      vStatus = { status: 'Abaixo da Meta', color: 'text-amber-600 dark:text-amber-400', badgeBg: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' };
    } else if (vVal <= targetV + 15) {
      vStatus = { status: 'Ideal / Na Meta', color: 'text-emerald-600 dark:text-emerald-400', badgeBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' };
    } else {
      vStatus = { status: 'Elevado (Supercalagem)', color: 'text-blue-600 dark:text-blue-400', badgeBg: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300' };
    }

    // 4. pH
    let phStatus = { status: 'Ideal (5.5 - 6.2)', color: 'text-emerald-600 dark:text-emerald-400', badgeBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' };
    if (currentSoil.phCacl2 < 4.5) {
      phStatus = { status: 'Muito Ácido (< 4.5)', color: 'text-rose-600 dark:text-rose-400', badgeBg: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300' };
    } else if (currentSoil.phCacl2 < 5.2) {
      phStatus = { status: 'Ácido (4.5 - 5.2)', color: 'text-amber-600 dark:text-amber-400', badgeBg: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' };
    } else if (currentSoil.phCacl2 > 6.5) {
      phStatus = { status: 'Alcalino (> 6.5)', color: 'text-blue-600 dark:text-blue-400', badgeBg: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300' };
    }

    // 5. Alumínio Tóxico (m%)
    let mStatus = { status: 'Baixo / Seguro (< 5%)', color: 'text-emerald-600 dark:text-emerald-400', badgeBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' };
    if (currentSoil.aluminumSaturationPercent > 20) {
      mStatus = { status: 'Crítico / Tóxico (> 20%)', color: 'text-rose-600 dark:text-rose-400', badgeBg: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300' };
    } else if (currentSoil.aluminumSaturationPercent > 10) {
      mStatus = { status: 'Alerta (10 - 20%)', color: 'text-amber-600 dark:text-amber-400', badgeBg: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' };
    }

    // 6. Relação Ca/Mg
    let caMgStatus = { status: 'Equilibrada (3 a 4:1)', color: 'text-emerald-600 dark:text-emerald-400', badgeBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' };
    if (currentSoil.caMgRatio < 2.0) {
      caMgStatus = { status: 'Excesso Relativo de Mg (< 2:1)', color: 'text-amber-600 dark:text-amber-400', badgeBg: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' };
    } else if (currentSoil.caMgRatio > 5.0) {
      caMgStatus = { status: 'Deficiência Relativa de Mg (> 5:1)', color: 'text-amber-600 dark:text-amber-400', badgeBg: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' };
    }

    return {
      pVal,
      pStatus,
      pLevels,
      kVal,
      kStatus,
      kLevels,
      vVal,
      targetV,
      vStatus,
      phStatus,
      mStatus,
      caMgStatus,
    };
  }, [currentSoil, currentBulletin, textureClassKey]);

  // Calculations: Calagem (Adapted by Regional Method)
  const calagemResult = useMemo(() => {
    let ncTonHa = 0;
    const prntVal = limingPrnt === '' ? 85 : Number(limingPrnt) || 85;
    const targetVVal = limingTargetV === '' ? 70 : Number(limingTargetV);
    const targetCaVal = limingTargetCa === '' ? 3.0 : Number(limingTargetCa);
    const targetMgVal = limingTargetMg === '' ? 1.0 : Number(limingTargetMg);
    const depthVal = limingDepthCm === '' ? 20 : Number(limingDepthCm);
    const moistureVal = limingMoisture === '' ? 0 : Number(limingMoisture);
    const rowSpacingVal = rowSpacingM === '' ? 0.45 : Number(rowSpacingM);
    const plantSpacingVal = plantSpacingM === '' ? 0.15 : Number(plantSpacingM);

    const f = 85 / (prntVal > 0 ? prntVal : 85);
    const depthFactor = (depthVal > 0 ? depthVal : 20) / 20;
    const moistureFactor = 100 / Math.max(1, (100 - moistureVal));
    
    if (limingMethod === 'v_percent') {
      // Método de Saturação por Bases
      const deltaV = Math.max(0, targetVVal - currentSoil.baseSaturationPercent);
      // Nc(t/ha) = ((deltaV * CTC) / 850) * f * depthFactor * moistureFactor
      ncTonHa = Math.round((((deltaV * currentSoil.potentialCtc) / 850) * f * depthFactor * moistureFactor) * 100) / 100;
    } else if (limingMethod === 'smp') {
      // Método do Índice SMP (SBCS RS/SC)
      const phSmp = currentSoil.phSmp || 5.8;
      const smpDose = Math.max(0, (6.8 - phSmp) * 4.2);
      const baseDose85 = smpDose * (100 / 85);
      ncTonHa = Math.round((baseDose85 * f * depthFactor) * 100) / 100;
    } else if (limingMethod === 'ca_elevation') {
      // Método de Elevação de Cálcio
      const deltaCa = Math.max(0, targetCaVal - currentSoil.caCmolc);
      const baseDose85 = deltaCa * (100 / 85);
      ncTonHa = Math.round((baseDose85 * f * depthFactor * moistureFactor) * 100) / 100;
    } else if (limingMethod === 'mg_elevation') {
      // Método de Elevação de Magnésio
      const deltaMg = Math.max(0, targetMgVal - currentSoil.mgCmolc);
      const baseDose85 = deltaMg * (100 / 85);
      ncTonHa = Math.round((baseDose85 * f * depthFactor * moistureFactor) * 100) / 100;
    } else {
      // Método de Neutralização de Al + Elevação de Ca+Mg (5ª Aproximação CFSEMG)
      const yFactor = currentSoil.clayPercent > 40 ? 2.0 : currentSoil.clayPercent > 20 ? 1.5 : 1.0;
      const alNeutralization = yFactor * currentSoil.alCmolc;
      const targetCaMg = 2.0; // cmolc/dm3 mínimo exigido
      const currentCaMg = currentSoil.caCmolc + currentSoil.mgCmolc;
      const caMgElevation = Math.max(0, targetCaMg - currentCaMg);
      const ncBase = alNeutralization + caMgElevation;
      const baseDose85 = ncBase * (100 / 85);
      ncTonHa = Math.round((baseDose85 * f * depthFactor) * 100) / 100;
    }
    
    // Quantity per linear meter of row and per plant hole
    const metersPerHa = 10000 / (rowSpacingVal > 0 ? rowSpacingVal : 0.45);
    const plantsPerHa = 10000 / ((rowSpacingVal > 0 ? rowSpacingVal : 0.45) * (plantSpacingVal > 0 ? plantSpacingVal : 0.15));
    const gramsPerLinearMeter = Math.round((ncTonHa * 1000000 / metersPerHa) * 10) / 10;
    const gramsPerHole = Math.round((ncTonHa * 1000000 / plantsPerHa) * 10) / 10;

    let limestoneType = 'Dolomítico (Mg > 12%)';
    if (currentSoil.mgCmolc >= 1.5 && currentSoil.caMgRatio < 2.5) {
      limestoneType = 'Calcítico (Ca > 40%, Mg < 5%)';
    } else if (currentSoil.caMgRatio >= 2.5 && currentSoil.caMgRatio <= 4.0) {
      limestoneType = 'Magnesiano (Mg 5-12%)';
    }

    return {
      ncTonHa,
      gramsPerLinearMeter,
      gramsPerHole,
      limestoneType,
      fFactor: f,
      recommendedSeason: '60 a 90 dias antes do plantio com solo úmido',
      methodLabel:
        limingMethod === 'v_percent'
          ? 'Saturação por Bases (V%)'
          : limingMethod === 'smp'
          ? 'Índice SMP (RS/SC)'
          : limingMethod === 'ca_elevation'
          ? 'Elevação de Cálcio'
          : limingMethod === 'mg_elevation'
          ? 'Elevação de Magnésio'
          : 'Neutralização de Al + Ca/Mg (CFSEMG)',
    };
  }, [currentSoil, limingTargetV, limingTargetCa, limingTargetMg, limingPrnt, limingDepthCm, limingMoisture, rowSpacingM, plantSpacingM, limingMethod]);

  // Calculations: Gessagem (Multi-Method: Argila, Dematê, Caires & Guimarães, Boletim 100, Classe Textural)
  const gessagemResult = useMemo(() => {
    const subsoilClay = currentSoil.clayPercent || 30;
    const subsoilCtc = currentSoil.potentialCtc || 10;
    const subsoilCa = currentSoil.caCmolc || 1.2;
    const subsoilCaPct = subsoilCtc > 0 ? (subsoilCa / subsoilCtc) * 100 : 30;
    const subsoilV = currentSoil.baseSaturationPercent || 35;
    const subsoilAl = currentSoil.aluminumSaturationPercent || 0;
    const subsoilAlCmolc = currentSoil.alCmolc || 0;
    const sSO4 = currentSoil.sSO4MgDm3 || 4;

    // 1. Método Fator de Argila (Sousa & Lobato / Embrapa Cerrados)
    const ngKg_fatorArgila = Math.round(subsoilClay * gypsumClayFactor);
    const ngTon_fatorArgila = Math.round((ngKg_fatorArgila / 1000) * 100) / 100;

    // 2. Método Dematê (Raij & Dematê 1988/1991 - Elevação da Saturação por Bases do Subsolo V%)
    const demateDiffV = Math.max(0, demateTargetV - subsoilV);
    const ngKg_demate = Math.round(demateDiffV * subsoilCtc * 10);
    const ngTon_demate = Math.round((ngKg_demate / 1000) * 100) / 100;

    // 3. Método Caires & Guimarães (2018 - Elevação da Saturação por Cálcio no Subsolo Ca%)
    const cairesDiffCa = Math.max(0, cairesTargetCa - subsoilCaPct);
    const ngKg_caires = Math.round(cairesDiffCa * subsoilCtc * 5);
    const ngTon_caires = Math.round((ngKg_caires / 1000) * 100) / 100;

    // 4. Método Boletim 100 IAC (Raij et al. 1997)
    const ngKg_b100 = Math.round(subsoilClay * 60);
    const ngTon_b100 = Math.round((ngKg_b100 / 1000) * 100) / 100;

    // 5. Método Classe Textural (Faixas Fixas por Textura de Solo)
    let ngKg_classeTextural = 2000;
    let textClassLabel = 'Média (16-35% Argila)';
    if (subsoilClay <= 15) {
      ngKg_classeTextural = 1000;
      textClassLabel = 'Arenosa (0-15% Argila)';
    } else if (subsoilClay <= 35) {
      ngKg_classeTextural = 2000;
      textClassLabel = 'Média (16-35% Argila)';
    } else if (subsoilClay <= 60) {
      ngKg_classeTextural = 3000;
      textClassLabel = 'Argilosa (36-60% Argila)';
    } else {
      ngKg_classeTextural = 4000;
      textClassLabel = 'Muito Argilosa (> 60% Argila)';
    }
    const ngTon_classeTextural = Math.round((ngKg_classeTextural / 1000) * 100) / 100;

    // Seleção Ativa do Método
    let ngKgHa = ngKg_fatorArgila;
    let ngTonHa = ngTon_fatorArgila;
    let methodLabel = `Fator de Argila (${gypsumClayFactor} × % Argila)`;

    if (selectedGypsumMethod === 'demate') {
      ngKgHa = ngKg_demate;
      ngTonHa = ngTon_demate;
      methodLabel = `Dematê (V% subsolo de ${subsoilV.toFixed(1)}% para ${demateTargetV}%)`;
    } else if (selectedGypsumMethod === 'caires_guimaraes') {
      ngKgHa = ngKg_caires;
      ngTonHa = ngTon_caires;
      methodLabel = `Caires & Guimarães 2018 (Ca% subsolo de ${subsoilCaPct.toFixed(1)}% para ${cairesTargetCa}%)`;
    } else if (selectedGypsumMethod === 'boletim_100') {
      ngKgHa = ngKg_b100;
      ngTonHa = ngTon_b100;
      methodLabel = `Boletim 100 IAC (60 × ${subsoilClay}% Argila)`;
    } else if (selectedGypsumMethod === 'classe_textural') {
      ngKgHa = ngKg_classeTextural;
      ngTonHa = ngTon_classeTextural;
      methodLabel = `Classe Textural (${textClassLabel})`;
    }

    const criteriaTriggered: string[] = [];
    if (subsoilCa < 1.5) criteriaTriggered.push(`Cálcio em subsuperfície baixo (${subsoilCa.toFixed(2)} cmol_c/dm³ < 1,5)`);
    if (subsoilAl > 20) criteriaTriggered.push(`Saturação por Alumínio (m%) em subsuperfície elevada (${subsoilAl.toFixed(1)}% > 20%)`);
    if (subsoilAlCmolc > 0.5) criteriaTriggered.push(`Alumínio tóxico trocável elevado (${subsoilAlCmolc.toFixed(2)} cmol_c/dm³ > 0,5)`);
    if (sSO4 < 5.0) criteriaTriggered.push(`Enxofre-sulfato deficiente em subsuperfície (${sSO4.toFixed(1)} mg/dm³ < 5,0)`);

    const needsGypsum = criteriaTriggered.length > 0;

    return {
      ngTonHa,
      ngKgHa,
      needsGypsum,
      methodLabel,
      activeMethod: selectedGypsumMethod,
      subsoilClay,
      subsoilCtc,
      subsoilCa,
      subsoilCaPct,
      subsoilV,
      subsoilAl,
      sSO4,
      criteriaTriggered,
      textClassLabel,
      comparison: {
        fatorArgila: { id: 'fator_argila', name: 'Fator de Argila (Sousa & Lobato)', kg: ngKg_fatorArgila, ton: ngTon_fatorArgila, desc: `Fator ${gypsumClayFactor} × ${subsoilClay}% Argila` },
        demate: { id: 'demate', name: 'Método Dematê (Raij & Dematê)', kg: ngKg_demate, ton: ngTon_demate, desc: `V% subsolo ${subsoilV.toFixed(0)}% → ${demateTargetV}%, CTC ${subsoilCtc.toFixed(1)}` },
        cairesGuimaraes: { id: 'caires_guimaraes', name: 'Caires & Guimarães (2018)', kg: ngKg_caires, ton: ngTon_caires, desc: `Ca% subsolo ${subsoilCaPct.toFixed(0)}% → ${cairesTargetCa}%, CTC ${subsoilCtc.toFixed(1)}` },
        boletim100: { id: 'boletim_100', name: 'Boletim 100 (IAC)', kg: ngKg_b100, ton: ngTon_b100, desc: `IAC 60 × ${subsoilClay}% Argila` },
        classeTextural: { id: 'classe_textural', name: 'Classe Textural', kg: ngKg_classeTextural, ton: ngTon_classeTextural, desc: `Faixa fixa: ${textClassLabel}` },
      },
      applicationMethod: 'Aplicação a lanço em área total sem necessidade de incorporação mecânica',
      effectiveDepth: 'Camada de 20 a 40 cm e 40 a 60 cm (condicionador de subsolo)',
      bulletinRule: `${currentBulletin.code}: Método ${methodLabel}`,
    };
  }, [currentSoil, currentBulletin, selectedGypsumMethod, gypsumClayFactor, demateTargetV, cairesTargetCa]);

  // Calculations: Organic Supply
  const selectedOrganic = useMemo(() => {
    const base = ORGANIC_FERTILIZERS_CATALOG.find(o => o?.id === selectedOrganicId) || ORGANIC_FERTILIZERS_CATALOG[0];
    if (base?.id === 'org-personalizado') {
      return {
        ...base,
        name: customOrganicName || 'Fonte Personalizada',
        nPercent: Number(customOrganicN) || 0,
        p2o5Percent: Number(customOrganicP) || 0,
        k2oPercent: Number(customOrganicK) || 0,
      };
    }
    return base;
  }, [selectedOrganicId, customOrganicName, customOrganicN, customOrganicP, customOrganicK]);

  const organicNutrientSupply = useMemo(() => {
    const dose = Number(organicDoseTonHa) || 0;
    const kgN = Math.round(dose * 1000 * (selectedOrganic.nPercent / 100) * (selectedOrganic.mineralizationRateYear1 / 100));
    const kgP2O5 = Math.round(dose * 1000 * (selectedOrganic.p2o5Percent / 100) * (selectedOrganic.mineralizationRateYear1 / 100));
    const kgK2O = Math.round(dose * 1000 * (selectedOrganic.k2oPercent / 100) * 0.9); // K prontamente disponível
    const kgCa = Math.round(dose * 1000 * (selectedOrganic.caPercent / 100) * 0.6);
    const kgS = Math.round(dose * 1000 * (selectedOrganic.sPercent / 100) * 0.6);
    const totalCostR = Math.round(dose * selectedOrganic.costPerTonR);

    return { kgN, kgP2O5, kgK2O, kgCa, kgS, totalCostR };
  }, [selectedOrganic, organicDoseTonHa]);

  // Calculations: Fertilizer Mixture
  const mixerResult = useMemo(() => {
    const fertA = MINERAL_FERTILIZERS_CATALOG.find(f => f.id === mixerSourceA) || MINERAL_FERTILIZERS_CATALOG[2];
    const fertB = MINERAL_FERTILIZERS_CATALOG.find(f => f.id === mixerSourceB) || MINERAL_FERTILIZERS_CATALOG[6];
    const fertC = MINERAL_FERTILIZERS_CATALOG.find(f => f.id === mixerSourceC) || MINERAL_FERTILIZERS_CATALOG[1];

    const kgA = Number(mixerKgA) || 0;
    const kgB = Number(mixerKgB) || 0;
    const kgC = Number(mixerKgC) || 0;

    const totalWeightKg = (kgA + kgB + kgC) || 1000;
    const finalN = Math.round(((fertA.n * kgA + fertB.n * kgB + fertC.n * kgC) / totalWeightKg) * 10) / 10;
    const finalP2O5 = Math.round(((fertA.p2o5 * kgA + fertB.p2o5 * kgB + fertC.p2o5 * kgC) / totalWeightKg) * 10) / 10;
    const finalK2O = Math.round(((fertA.k2o * kgA + fertB.k2o * kgB + fertC.k2o * kgC) / totalWeightKg) * 10) / 10;
    const finalS = Math.round(((fertA.s * kgA + fertB.s * kgB + fertC.s * kgC) / totalWeightKg) * 10) / 10;

    const costA = (kgA / 1000) * fertA.pricePerTonR;
    const costB = (kgB / 1000) * fertB.pricePerTonR;
    const costC = (kgC / 1000) * fertC.pricePerTonR;
    const totalCostR = Math.round(costA + costB + costC);
    const costPerTonR = Math.round((totalCostR / totalWeightKg) * 1000);

    return {
      formula: `${finalN}-${finalP2O5}-${finalK2O} + ${finalS}S`,
      finalN,
      finalP2O5,
      finalK2O,
      finalS,
      totalWeightKg,
      totalCostR,
      costPerTonR,
      compatibility: 'Compatibilidade Química Total (Sem segregação higroscópica)',
    };
  }, [mixerSourceA, mixerSourceB, mixerSourceC, mixerKgA, mixerKgB, mixerKgC]);

  return (
    <div className="space-y-6">
      {/* Header Banner: GeaAgro Recomendações Pro */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-emerald-700/50">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-emerald-200/80 text-xs font-semibold">Gêmeo Digital & Suite Integrada</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Sprout className="w-6 h-6 text-emerald-400" />
            Módulo de Recomendação Agronômica Completa
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-4xl">
            Calagem multiparâmetro, gessagem profunda, adubação orgânica & mineral de plantio/cobertura, fertirrigação, curvas de absorção, misturador de fórmulas, simulador de cenários e Índice GeaAgro de Fertilidade (IGF).
          </p>
        </div>

        {/* Global Statistics Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 mt-5 pt-4 border-t border-emerald-800/60 text-xs">
          <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300/80 block">Índice IGF do Solo</span>
            <strong className="text-base text-emerald-300 font-black">{currentSoil.igfScore} / 100</strong>
            <span className="text-[10px] text-emerald-200 block">Fertilidade Alta</span>
          </div>

          <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300/80 block">Calagem Recomendada</span>
            <strong className="text-base text-amber-300 font-black">{calagemResult.ncTonHa} t/ha</strong>
            <span className="text-[10px] text-emerald-200 block">{calagemResult.limestoneType}</span>
          </div>

          <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300/80 block">Gessagem Agrícola</span>
            <strong className="text-base text-teal-300 font-black">{gessagemResult.ngTonHa} t/ha</strong>
            <span className="text-[10px] text-emerald-200 block">Subsolo (20-40 cm)</span>
          </div>

          <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300/80 block">Adubação no Sulco</span>
            <strong className="text-base text-white font-black">{plantingDoseKgHa} kg/ha</strong>
            <span className="text-[10px] text-emerald-200 block">NPK 02-20-20</span>
          </div>

          <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300/80 block">Orgânico Fornecido</span>
            <strong className="text-base text-emerald-300 font-black">{organicDoseTonHa} t/ha</strong>
            <span className="text-[10px] text-emerald-200 block">Cama de Frango</span>
          </div>

          <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300/80 block">Custo Médio / ha</span>
            <strong className="text-base text-amber-300 font-black">R$ 1.680/ha</strong>
            <span className="text-[10px] text-emerald-200 block">Retorno Est.: +34%</span>
          </div>
        </div>

        {/* Action Buttons in Bottom Area */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3.5 border-t border-emerald-800/50">
          <div className="text-[11px] text-emerald-200/80 font-medium hidden sm:block">
            Selecione uma ação rápida ou navegue pelos relatórios técnicos detalhados:
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('recomendacoes_personalizadas')}
              className="flex-1 sm:flex-initial bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Recomendações Personalizadas
            </button>
            <button
              onClick={() => setActiveTab('relatorio_laudo')}
              className="flex-1 sm:flex-initial bg-slate-900/80 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer border border-emerald-500/30"
            >
              <FileText className="w-4 h-4" />
              Ver Laudo
            </button>
            <button
              id="top-export-pdf-btn"
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/60 text-white font-black px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer border border-emerald-400/40"
            >
              {isExportingPDF ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isExportingPDF ? 'Gerando PDF...' : 'Exportar Laudo PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between shadow-md animate-fade-in">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-white hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Active Soil Sample Selection Bar */}
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-500 dark:text-zinc-400">Amostra de Solo em Foco:</span>
          <select
            value={selectedSoilId}
            onChange={e => setSelectedSoilId(e.target.value)}
            className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 font-bold text-slate-900 dark:text-white truncate max-w-xs cursor-pointer"
          >
            {soilAnalyses.map(s => (
              <option key={s.id} value={s.id}>
                {s.sampleCode} - {s.plotName} ({s.depth} cm • {s.cropName})
              </option>
            ))}
          </select>

          {onNavigateToSolos && (
            <button
              type="button"
              onClick={() => onNavigateToSolos('amostras')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 cursor-pointer transition-colors"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Gerenciar no Módulo de Solos</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-slate-600 dark:text-zinc-400 text-[11px] flex-wrap">
          <span>Data: <strong>{currentSoil.analysisDate}</strong></span>
          <span>Textura: <strong>{currentSoil.texturalClass} ({currentSoil.clayPercent}% Argila)</strong></span>
          <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded font-black text-[10px]">
            IGF: {currentSoil.igfScore}/100
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. DASHBOARD & IGF (ÍNDICE GEAAGRO DE FERTILIDADE)        */}
      {/* ========================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top IGF Banner Card (Full Width) */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-zinc-900 border border-emerald-800/50 rounded-2xl p-5 text-white shadow-md">
            <div className="flex flex-col md:flex-row items-center justify-between gap-5">
              {/* Left: Score Gauge & Key Summary */}
              <div className="flex items-center gap-5">
                <div className="relative w-24 h-24 rounded-full flex items-center justify-center border-4 border-emerald-400 bg-black/50 shadow-inner shrink-0">
                  <div className="text-center">
                    <span className="text-3xl font-black text-white">
                      {currentSoil.igfScore}
                    </span>
                    <span className="text-[10px] text-emerald-300 block font-bold">/ 100</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/80 border border-emerald-700/60 px-2.5 py-0.5 rounded-md">
                      Índice GeaAgro de Fertilidade (IGF)
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-md text-xs font-black uppercase">
                      Alta Fertilidade &amp; Equilíbrio
                    </span>
                  </div>

                  <p className="text-xs text-slate-200">
                    <strong>Cultura:</strong> {currentSoil.cropName} ({currentSoil.cultivar}) • <strong>Meta de Produtividade:</strong> {currentSoil.expectedYield} {currentSoil.yieldUnit}
                  </p>
                  
                  <p className="text-[11px] text-slate-400 hidden sm:block">
                    Nota integrada calculada a partir de parâmetros químicos, físicos e biológicos do solo.
                  </p>
                </div>
              </div>

              {/* Right: Explanation Action Button */}
              <div className="shrink-0 w-full md:w-auto">
                <button
                  id="toggle-igf-explanation-btn"
                  onClick={() => setShowIgfExpl(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer w-full justify-center shadow-sm group"
                >
                  <HelpCircle className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
                  <span>Explicação Detalhada da Nota</span>
                </button>
              </div>
            </div>
          </div>

          {/* Regional Pillars Diagnosis & Interactive Charts (Full Width) */}
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4.5 h-4.5 text-emerald-600" />
                  Diagnóstico dos Pilares de Fertilidade do Solo
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Interpretação calibrada por padrões edafoclimáticos regionais do Brasil.
                </p>
              </div>

              {/* Regional Bulletin / Lab Reference Selector */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">Referência / Boletim:</label>
                <select
                  value={selectedBulletinId}
                  onChange={e => handleSelectBulletin(e.target.value)}
                  className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 font-bold text-xs rounded-lg px-2.5 py-1.5 cursor-pointer max-w-[220px] sm:max-w-xs truncate shadow-2xs focus:ring-2 focus:ring-emerald-500"
                >
                  <optgroup label="🏛️ Boletins Regionais Oficiais" className="bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-extrabold">
                    {allBulletins.filter(b => !b.id.startsWith('padrao-lab-') && !b.code.startsWith('LAB-')).map(b => (
                      <option key={b.id} value={b.id} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-bold py-1">
                        {b.name} ({b.region})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🧪 Padrões Laboratoriais de Análise de Solo" className="bg-slate-100 dark:bg-zinc-900 text-purple-800 dark:text-purple-300 font-extrabold">
                    {allBulletins.filter(b => b.id.startsWith('padrao-lab-') || b.code.startsWith('LAB-')).map(b => (
                      <option key={b.id} value={b.id} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-bold py-1">
                        {b.name} ({b.region})
                      </option>
                    ))}
                  </optgroup>
                </select>

                <button
                  type="button"
                  onClick={() => setShowBulletinCatalogModal(true)}
                  className="bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 font-bold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title="Abrir Catálogo de Boletins e Padrões Laboratoriais"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Catálogo ({allBulletins.length})</span>
                </button>
                
                <button
                  onClick={() => setShowCustomModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                  title="Adicionar Referência Personalizada"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Adicionar</span>
                </button>
              </div>
            </div>

                {/* Regional Calibration Banner */}
                <div className="bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="bg-emerald-600 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded">
                        {currentBulletin.code}
                      </span>
                      <span className="font-black text-slate-900 dark:text-white text-xs">
                        {currentBulletin.institution} • {currentBulletin.region}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      <strong>Estados abrangidos:</strong> {(currentBulletin.states || []).join(', ')} | <strong>Método P:</strong> {currentBulletin.phosphorusMethod} | <strong>Método Calagem:</strong> {currentBulletin.defaultLimingMethod === 'v_percent' ? 'Saturação por Bases (V%)' : currentBulletin.defaultLimingMethod === 'smp' ? 'Índice SMP' : 'Neutralização de Al + Ca/Mg'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block font-semibold">Classe Textural Calibrada</span>
                    <strong className="text-xs text-slate-900 dark:text-white font-black capitalize">
                      {currentBulletin.textureClasses[textureClassKey]?.label || currentSoil.texturalClass}
                    </strong>
                  </div>
                </div>

                {/* Dashboard Mode Selector and Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b dark:border-zinc-800 pb-2.5 gap-2 mt-2">
                  <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    Diagnóstico Químico Regional do Solo ({currentBulletin.code})
                  </h4>
                  <div className="flex bg-slate-100 dark:bg-zinc-900/80 p-0.5 rounded-lg border dark:border-zinc-800 shrink-0">
                    <button
                      id="view-indicators-grid-btn"
                      onClick={() => setDashboardMode('indicators')}
                      className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase transition-all cursor-pointer ${
                        dashboardMode === 'indicators'
                          ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-xs'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200'
                      }`}
                    >
                      Indicadores
                    </button>
                    <button
                      id="view-charts-btn"
                      onClick={() => setDashboardMode('charts')}
                      className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase transition-all cursor-pointer ${
                        dashboardMode === 'charts'
                          ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-xs'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200'
                      }`}
                    >
                      Gráficos Interativos
                    </button>
                  </div>
                </div>

                {/* Render indicators or charts conditionally */}
                {dashboardMode === 'indicators' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 2xl:grid-cols-8 gap-3">
                  {/* 1. pH */}
                  <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold">pH em CaCl₂</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${regionalDiagnosis.phStatus.badgeBg}`}>
                        {regionalDiagnosis.phStatus.status.split(' ')[0]}
                      </span>
                    </div>
                    <strong className="text-base text-slate-900 dark:text-white font-black block">{currentSoil.phCacl2}</strong>
                    <span className="text-[10px] text-emerald-600 block font-semibold">Ideal: 5.5 - 6.2</span>
                  </div>

                  {/* 2. V% */}
                  <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold">Saturação por Bases (V%)</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${regionalDiagnosis.vStatus.badgeBg}`}>
                        Meta: {regionalDiagnosis.targetV}%
                      </span>
                    </div>
                    <strong className="text-base text-emerald-600 font-black block">{currentSoil.baseSaturationPercent}%</strong>
                    <span className={`text-[10px] block font-semibold ${regionalDiagnosis.vStatus.color}`}>
                      {regionalDiagnosis.vStatus.status}
                    </span>
                  </div>

                  {/* 3. Fósforo P */}
                  <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold">Fósforo ({currentBulletin.phosphorusMethod})</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${regionalDiagnosis.pStatus.badgeBg}`}>
                        {regionalDiagnosis.pStatus.label}
                      </span>
                    </div>
                    <strong className="text-base text-emerald-600 font-black block">
                      {regionalDiagnosis.pVal} mg/dm³
                    </strong>
                    <span className="text-[10px] text-slate-500 block font-semibold">
                      Bom: ≥ {regionalDiagnosis.pLevels.good} mg/dm³
                    </span>
                  </div>

                  {/* 4. Potássio K */}
                  <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold">Potássio (K)</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${regionalDiagnosis.kStatus.badgeBg}`}>
                        {regionalDiagnosis.kStatus.label}
                      </span>
                    </div>
                    <strong className="text-base text-teal-600 font-black block">{currentSoil.kCmolc} cmol_c/dm³</strong>
                    <span className="text-[10px] text-slate-500 block font-semibold">
                      Bom: ≥ {regionalDiagnosis.kLevels.good} cmol_c
                    </span>
                  </div>

                  {/* 5. Ca/Mg Ratio */}
                  <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold">Relação Ca / Mg</span>
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        Equilíbrio
                      </span>
                    </div>
                    <strong className="text-base text-slate-900 dark:text-white font-black block">{currentSoil.caMgRatio} : 1</strong>
                    <span className="text-[10px] text-emerald-600 block font-semibold">Ideal: 3 a 4 : 1</span>
                  </div>

                  {/* 6. Matéria Orgânica */}
                  <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold">Matéria Orgânica</span>
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                        Carbono
                      </span>
                    </div>
                    <strong className="text-base text-slate-900 dark:text-white font-black block">{currentSoil.organicMatterGKg} g/dm³</strong>
                    <span className="text-[10px] text-emerald-600 block font-semibold">Carbono: {currentSoil.organicCarbonGKg} g/dm³</span>
                  </div>

                  {/* 7. BioAS */}
                  <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold">BioAS: Beta-Glicosidase</span>
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        Enzimático
                      </span>
                    </div>
                    <strong className="text-base text-emerald-600 font-black block">{currentSoil.betaGlucosidaseActivity || 145}</strong>
                    <span className="text-[10px] text-emerald-600 block font-semibold">Atividade Alta</span>
                  </div>

                  {/* 8. Alumínio Tóxico (m%) */}
                  <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold">Alumínio Tóxico (m%)</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${regionalDiagnosis.mStatus.badgeBg}`}>
                        {regionalDiagnosis.mStatus.status.split(' ')[0]}
                      </span>
                    </div>
                    <strong className="text-base text-emerald-600 font-black block">{currentSoil.aluminumSaturationPercent}%</strong>
                    <span className={`text-[10px] block font-semibold ${regionalDiagnosis.mStatus.color}`}>
                      {regionalDiagnosis.mStatus.status}
                    </span>
                  </div>
                </div>
                ) : (
                  /* CHARTS VIEW (2 LARGE SPACIOUS CHARTS INSTEAD OF 4 SQUISHED) */
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in text-xs">
                    {/* Gráfico 1: Ocupação da CTC por Cátions (%) */}
                    <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3 shadow-2xs">
                      <div className="border-b dark:border-zinc-800 pb-2 flex flex-wrap justify-between items-center gap-2">
                        <div>
                          <strong className="text-xs text-slate-800 dark:text-zinc-200 block uppercase font-black">
                            Ocupação da CTC por Cátions (%)
                          </strong>
                          <span className="text-[10px] text-slate-500">
                            Equilíbrio Catiônico no Solo (Ca²⁺, Mg²⁺, K⁺, H⁺+Al³⁺)
                          </span>
                        </div>
                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                          Total CTC: {currentSoil.potentialCtc} cmol_c/dm³
                        </span>
                      </div>

                      <div className="h-80 w-full flex flex-col sm:flex-row items-center justify-center gap-4">
                        <div className="w-full sm:w-3/5 h-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={ctcChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={95}
                                paddingAngle={4}
                                dataKey="value"
                              >
                                {ctcChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value, name) => [`${value}% da CTC`, name]} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Legend Column */}
                        <div className="w-full sm:w-2/5 space-y-2 text-xs shrink-0 bg-slate-50 dark:bg-zinc-900/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                          <span className="text-[10px] font-black uppercase text-slate-400 block border-b pb-1">
                            Distribuição do Complexo:
                          </span>
                          {ctcChartData.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 truncate">
                                <span className="w-3 h-3 rounded-xs shrink-0" style={{ backgroundColor: entry.color }} />
                                <span className="font-semibold text-slate-700 dark:text-zinc-300 text-xs truncate">{entry.name}</span>
                              </div>
                              <span className="font-black text-slate-900 dark:text-white text-xs">{entry.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Gráfico 2: Adequação Nutricional ao Alvo (%) / Limiares Críticos */}
                    <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3 shadow-2xs">
                      <div className="border-b dark:border-zinc-800 pb-2 flex flex-wrap justify-between items-center gap-2">
                        <div>
                          <strong className="text-xs text-slate-800 dark:text-zinc-200 block uppercase font-black">
                            {nutrientSubMode === 'nicri'
                              ? 'Limiares Críticos de Solo (NICRI vs Atual)'
                              : 'Adequação Nutricional (% do Alvo)'}
                          </strong>
                          <span className="text-[10px] text-slate-500">
                            Compara teores analíticos com as metas regionais ({currentBulletin.code})
                          </span>
                        </div>

                        {/* Sub-mode Filter Buttons */}
                        <div className="flex bg-slate-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-slate-200 dark:border-zinc-800 shrink-0">
                          <button
                            onClick={() => setNutrientSubMode('all')}
                            className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase transition-all cursor-pointer ${
                              nutrientSubMode === 'all'
                                ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-xs'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200'
                            }`}
                          >
                            Todos
                          </button>
                          <button
                            onClick={() => setNutrientSubMode('macro')}
                            className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase transition-all cursor-pointer ${
                              nutrientSubMode === 'macro'
                                ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-xs'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200'
                            }`}
                          >
                            Macros
                          </button>
                          <button
                            onClick={() => setNutrientSubMode('micro')}
                            className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase transition-all cursor-pointer ${
                              nutrientSubMode === 'micro'
                                ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-xs'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200'
                            }`}
                          >
                            Micros
                          </button>
                          <button
                            onClick={() => setNutrientSubMode('nicri')}
                            className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase transition-all cursor-pointer ${
                              nutrientSubMode === 'nicri'
                                ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-xs'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200'
                            }`}
                          >
                            Limiares (NICRI)
                          </button>
                        </div>
                      </div>

                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          {nutrientSubMode === 'nicri' ? (
                            <BarChart
                              data={micronutrientsChartData}
                              margin={{ top: 15, right: 10, left: -20, bottom: 25 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
                              <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 600 }} angle={-20} textAnchor="end" height={40} />
                              <YAxis tick={{ fontSize: 10 }} />
                              <Tooltip formatter={(value, name) => [value, name === 'Atual' ? 'Teor Atual do Solo' : 'Nível Crítico (NICRI)']} />
                              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                              <Bar dataKey="Atual" fill="#10b981" radius={[4, 4, 0, 0]} name="Teor Atual do Solo" />
                              <Bar dataKey="Critico" fill="#ef4444" radius={[4, 4, 0, 0]} name="Nível Crítico (NICRI)" />
                            </BarChart>
                          ) : (
                            <BarChart
                              data={
                                nutrientSubMode === 'macro'
                                  ? macroComparisonChartData
                                  : nutrientSubMode === 'micro'
                                  ? microComparisonChartData
                                  : allNutrientsComparisonChartData
                              }
                              margin={{ top: 15, right: 10, left: -20, bottom: 25 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
                              <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 600 }} angle={-20} textAnchor="end" height={40} />
                              <YAxis tick={{ fontSize: 10 }} unit="%" domain={[0, 250]} />
                              <Tooltip formatter={(value, name) => [`${value}%`, name === 'Adequacao' ? 'Adequação ao Alvo' : name]} />
                              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                              <Bar
                                dataKey="Adequacao"
                                fill={nutrientSubMode === 'micro' ? '#f59e0b' : nutrientSubMode === 'macro' ? '#3b82f6' : '#10b981'}
                                radius={[4, 4, 0, 0]}
                                name="Adequação ao Alvo (%)"
                              />
                            </BarChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* Parâmetros Avançados de Referência do Boletim */}
                <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between border-b dark:border-zinc-800 pb-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                      Parâmetros Avançados de Referência ({currentBulletin.code})
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">Macro/Micronutrientes, Cátions & BioAS Embrapa</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    {/* Macronutrientes Críticos */}
                    <div className="space-y-2 bg-white dark:bg-zinc-950 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                      <strong className="text-[10px] text-slate-400 block uppercase font-bold border-b dark:border-zinc-800 pb-1 flex items-center justify-between">
                        <span>Limiares Macronutrientes</span>
                        <span className="text-emerald-600 text-[9px]">Solo vs NICRI</span>
                      </strong>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Fósforo P (NICRIP):</span>
                          <span className="font-semibold">{currentSoil.pResina} vs NC {criticalLevels.nicrip} mg/dm³</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Potássio K (NICRIK):</span>
                          <span className="font-semibold">{currentSoil.kCmolc} vs NC {criticalLevels.nicrik} cmolc</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Cálcio Ca (NICRICA):</span>
                          <span className="font-semibold">{currentSoil.caCmolc} vs NC {criticalLevels.nicrica} cmolc</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Magnésio Mg (NICRIMG):</span>
                          <span className="font-semibold">{currentSoil.mgCmolc} vs NC {criticalLevels.nicrimg} cmolc</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Enxofre S (NICRIS):</span>
                          <span className="font-semibold">{currentSoil.sSulfurMgDm3} vs NC {criticalLevels.nicris} mg/dm³</span>
                        </div>
                        <div className="flex items-center justify-between border-t dark:border-zinc-800 pt-1 mt-1">
                          <span className="text-slate-500 text-[10px]">N Min. Est. (M.O.):</span>
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            ~{Math.round(currentSoil.organicMatterGKg * (currentBulletin.nitrogenMineralizationFactor || 0.5) * 10) / 10} kg/ha N
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Micronutrientes e Benéficos */}
                    <div className="space-y-2 bg-white dark:bg-zinc-950 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                      <strong className="text-[10px] text-slate-400 block uppercase font-bold border-b dark:border-zinc-800 pb-1 flex items-center justify-between">
                        <span>Micronutrientes &amp; Si</span>
                        <span className="text-slate-400 text-[9px]">Mínimos Mín</span>
                      </strong>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Zinco (Zn):</span>
                          <span className="font-semibold">{currentSoil.znZincoMgDm3} vs Mín {criticalLevels.nicriz} mg/dm³</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Boro (B):</span>
                          <span className="font-semibold">{currentSoil.bBoroMgDm3} vs Mín {criticalLevels.nicrib} mg/dm³</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Cobre (Cu):</span>
                          <span className="font-semibold">{currentSoil.cuCobreMgDm3} vs Mín {criticalLevels.nicricu} mg/dm³</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Manganês (Mn):</span>
                          <span className="font-semibold">{currentSoil.mnManganesMgDm3} vs Mín {criticalLevels.nicrimn} mg/dm³</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Ferro (Fe):</span>
                          <span className="font-semibold">{currentSoil.feFerroMgDm3} vs Mín {criticalLevels.nicrife} mg/dm³</span>
                        </div>
                        <div className="flex items-center justify-between border-t dark:border-zinc-800 pt-1 mt-1">
                          <span className="text-slate-500 text-[10px]">Mo / Si Benéfico:</span>
                          <span className="font-medium text-slate-700 dark:text-zinc-300 text-[10px]">
                            Mo {currentSoil.moMolibdenioMgDm3 || 0.12} / Si {currentSoil.siSilicioMgDm3 || 12} mg/dm³
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Relações Catiônicas & Saturação CTC */}
                    <div className="space-y-2 bg-white dark:bg-zinc-950 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                      <strong className="text-[10px] text-slate-400 block uppercase font-bold border-b dark:border-zinc-800 pb-1 flex items-center justify-between">
                        <span>Equilíbrio Catiônico CTC</span>
                        <span className="text-slate-400 text-[9px]">Saturação &amp; Relações</span>
                      </strong>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Ca % CTC:</span>
                          <span className="font-semibold text-slate-700 dark:text-zinc-200">
                            {currentSoil.potentialCtc > 0 ? Math.round((currentSoil.caCmolc / currentSoil.potentialCtc) * 100) : 0}% 
                            <span className="text-[9px] text-slate-400 ml-1">({currentBulletin.idealCaPercentageRange?.min || 50}-{currentBulletin.idealCaPercentageRange?.max || 70}%)</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Mg % CTC:</span>
                          <span className="font-semibold text-slate-700 dark:text-zinc-200">
                            {currentSoil.potentialCtc > 0 ? Math.round((currentSoil.mgCmolc / currentSoil.potentialCtc) * 100) : 0}% 
                            <span className="text-[9px] text-slate-400 ml-1">({currentBulletin.idealMgPercentageRange?.min || 10}-{currentBulletin.idealMgPercentageRange?.max || 20}%)</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">K % CTC:</span>
                          <span className="font-semibold text-slate-700 dark:text-zinc-200">
                            {currentSoil.potentialCtc > 0 ? Math.round((currentSoil.kCmolc / currentSoil.potentialCtc) * 100) : 0}% 
                            <span className="text-[9px] text-slate-400 ml-1">({currentBulletin.idealKPercentageRange?.min || 2}-{currentBulletin.idealKPercentageRange?.max || 5}%)</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t dark:border-zinc-800 pt-1 mt-0.5 text-[10px]">
                          <span className="text-slate-500">Rel. Ca/Mg:</span>
                          <span className="font-semibold">{currentSoil.caMgRatio || Math.round((currentSoil.caCmolc / (currentSoil.mgCmolc || 0.1)) * 10) / 10} : 1</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500">Rel. (Ca+Mg)/K:</span>
                          <span className="font-semibold">{currentSoil.caMgKRatio || Math.round(((currentSoil.caCmolc + currentSoil.mgCmolc) / (currentSoil.kCmolc || 0.05)) * 10) / 10} : 1</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500">Alumínio m%:</span>
                          <span className="font-semibold text-rose-600 dark:text-rose-400">{currentSoil.aluminumSaturationPercent}% (≤{currentBulletin.tolerableAlSaturation || 15}%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Bioanálise de Solo (BioAS - Embrapa Cerrados) */}
                    <div className="space-y-2 bg-white dark:bg-zinc-950 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                      <strong className="text-[10px] text-emerald-700 dark:text-emerald-400 block uppercase font-bold border-b dark:border-zinc-800 pb-1 flex items-center justify-between">
                        <span>BioAS Embrapa Cerrados</span>
                        <span className="text-emerald-600 text-[9px]">Enzimas &amp; CBM</span>
                      </strong>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Beta-glicosidase:</span>
                          <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                            {currentSoil.betaGlucosidaseActivity || 145} vs NC {criticalLevels.bioasBetaGli}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Arilsulfatase:</span>
                          <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                            {currentSoil.arylsulfataseActivity || 85} vs NC {criticalLevels.bioasAryl}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Fosfatase Ácida:</span>
                          <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                            {currentSoil.acidPhosphataseActivity || 210} vs NC {criticalLevels.bioasFosfAc}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t dark:border-zinc-800 pt-1 mt-0.5 text-[10px]">
                          <span className="text-slate-500">Biomassa CBM:</span>
                          <span className="font-semibold">{currentSoil.microbialBiomassCarbonMgKg || 320} vs NC {criticalLevels.bioasCbm} mg/kg</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500">Respiração RBS:</span>
                          <span className="font-semibold">{currentSoil.basalRespirationMgC || 18.5} vs NC {criticalLevels.bioasRbs} mg C</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-amber-700 dark:text-amber-400 pt-0.5">
                          <span>P-rem Crítico:</span>
                          <span className="font-bold">{currentBulletin.pRemanescenteCritical || 25} mg/L</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Official Reference & Notes */}
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 p-4 bg-stone-50 dark:bg-zinc-900/50 rounded-xl border border-stone-200 dark:border-zinc-800 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b dark:border-zinc-800 pb-1.5">
                    <span>
                      📖 <strong>Referência Oficial:</strong> {currentBulletin.officialReference || 'Referência customizada do usuário'}
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold shrink-0">
                      Regra Gessagem: {gessagemResult.bulletinRule}
                    </span>
                  </div>
                  <div className="space-y-1 text-[10px]">
                    <span className="font-bold text-slate-400 block uppercase">Notas Metodológicas do Boletim:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-zinc-400 pl-1">
                      {Array.isArray(currentBulletin.notes) ? (
                        currentBulletin.notes.map((note, index) => <li key={index}>{note}</li>)
                      ) : (
                        <li>{currentBulletin.notes}</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Callout to Tailored Recommendation Engine */}
                <div className="p-4 bg-gradient-to-r from-emerald-900/30 via-teal-900/20 to-slate-900/30 dark:from-emerald-950/60 dark:via-teal-950/40 dark:to-slate-950/60 rounded-xl border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        Motor de Recomendação Personalizada Multiparâmetro
                        <span className="text-[10px] font-extrabold uppercase bg-emerald-500 text-emerald-950 px-2 py-0.5 rounded-full">
                          Tailored IA &amp; Histórico
                        </span>
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-zinc-300 mt-0.5">
                        Integração em tempo real de histórico da área (palhada, leguminosas, adubação verde), preferências operacionais do produtor (fontes preferidas, orçamento, aplicação a lanço/sulco/taxa variável) e metas de produtividade.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('recomendacoes_personalizadas')}
                    className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Configurar e Gerar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
            </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. CADASTRO DA ANÁLISE DE SOLO                            */}
      {/* ========================================================= */}
      {activeTab === 'cadastro_analise' && (
        <div className="space-y-6 animate-fade-in">
          {/* Banner de Unificação com o Módulo Dedicado */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                  Módulo Dedicado de Análise de Solo Unificado
                </h4>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 max-w-2xl">
                  Para cadastrar novas amostras, importar planilhas CSV ou extrair laudos laboratoriais via Inteligência Artificial (foto ou PDF), utilize o menu dedicado de <strong>Análise de Solo</strong>.
                </p>
              </div>
            </div>
            {onNavigateToSolos && (
              <button
                type="button"
                onClick={() => onNavigateToSolos('amostras')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer shrink-0 transition-colors"
              >
                <span>Acessar Módulo Dedicado</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-6">
            <div className="border-b pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  Cadastro & Laudo Completo de Análise de Solo
                </h3>
                <p className="text-xs text-slate-500">
                  Laboratório: {currentSoil.laboratoryName} • Data: {currentSoil.analysisDate}
                </p>
              </div>
            </div>

            {/* Chemical Parameters Table */}
            <div className="space-y-2">
              <strong className="text-xs font-bold text-slate-900 dark:text-white block uppercase text-emerald-600">
                1. Atributos Químicos & Micronutrientes
              </strong>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
                <div className="p-2.5 border rounded-lg bg-slate-50 dark:bg-zinc-900">
                  <span className="text-[9px] text-slate-400 block font-bold">pH (CaCl₂)</span>
                  <strong className="text-sm">{currentSoil.phCacl2}</strong>
                </div>
                <div className="p-2.5 border rounded-lg bg-slate-50 dark:bg-zinc-900">
                  <span className="text-[9px] text-slate-400 block font-bold">pH (H₂O)</span>
                  <strong className="text-sm">{currentSoil.phH2o}</strong>
                </div>
                <div className="p-2.5 border rounded-lg bg-slate-50 dark:bg-zinc-900">
                  <span className="text-[9px] text-slate-400 block font-bold">pH SMP</span>
                  <strong className="text-sm">{currentSoil.phSmp}</strong>
                </div>
                <div className="p-2.5 border rounded-lg bg-slate-50 dark:bg-zinc-900">
                  <span className="text-[9px] text-slate-400 block font-bold">P (Mehlich-1)</span>
                  <strong className="text-sm">{currentSoil.pMehlich1} mg/dm³</strong>
                </div>
                <div className="p-2.5 border rounded-lg bg-slate-50 dark:bg-zinc-900">
                  <span className="text-[9px] text-slate-400 block font-bold">P (Resina)</span>
                  <strong className="text-sm text-emerald-600">{currentSoil.pResina} mg/dm³</strong>
                </div>
                <div className="p-2.5 border rounded-lg bg-slate-50 dark:bg-zinc-900">
                  <span className="text-[9px] text-slate-400 block font-bold">K Trocável</span>
                  <strong className="text-sm">{currentSoil.kCmolc} cmol_c/dm³</strong>
                </div>
                <div className="p-2.5 border rounded-lg bg-slate-50 dark:bg-zinc-900">
                  <span className="text-[9px] text-slate-400 block font-bold">Ca Trocável</span>
                  <strong className="text-sm">{currentSoil.caCmolc} cmol_c/dm³</strong>
                </div>
                <div className="p-2.5 border rounded-lg bg-slate-50 dark:bg-zinc-900">
                  <span className="text-[9px] text-slate-400 block font-bold">Mg Trocável</span>
                  <strong className="text-sm">{currentSoil.mgCmolc} cmol_c/dm³</strong>
                </div>
                <div className="p-2.5 border rounded-lg bg-slate-50 dark:bg-zinc-900">
                  <span className="text-[9px] text-slate-400 block font-bold">Al³⁺ Trocável</span>
                  <strong className="text-sm">{currentSoil.alCmolc} cmol_c/dm³</strong>
                </div>
                <div className="p-2.5 border rounded-lg bg-slate-50 dark:bg-zinc-900">
                  <span className="text-[9px] text-slate-400 block font-bold">H + Al</span>
                  <strong className="text-sm">{currentSoil.hAlCmolc} cmol_c/dm³</strong>
                </div>
                <div className="p-2.5 border rounded-lg bg-slate-50 dark:bg-zinc-900">
                  <span className="text-[9px] text-slate-400 block font-bold">Enxofre (S-SO₄)</span>
                  <strong className="text-sm">{currentSoil.sSulfurMgDm3} mg/dm³</strong>
                </div>
                <div className="p-2.5 border rounded-lg bg-slate-50 dark:bg-zinc-900">
                  <span className="text-[9px] text-slate-400 block font-bold">Boro (B)</span>
                  <strong className="text-sm">{currentSoil.bBoroMgDm3} mg/dm³</strong>
                </div>
                <div className="p-2.5 border rounded-lg bg-slate-50 dark:bg-zinc-900">
                  <span className="text-[9px] text-slate-400 block font-bold">Zinco (Zn)</span>
                  <strong className="text-sm">{currentSoil.znZincoMgDm3} mg/dm³</strong>
                </div>
                <div className="p-2.5 border rounded-lg bg-slate-50 dark:bg-zinc-900">
                  <span className="text-[9px] text-slate-400 block font-bold">Cobre (Cu)</span>
                  <strong className="text-sm">{currentSoil.cuCobreMgDm3} mg/dm³</strong>
                </div>
                <div className="p-2.5 border rounded-lg bg-slate-50 dark:bg-zinc-900">
                  <span className="text-[9px] text-slate-400 block font-bold">Manganês (Mn)</span>
                  <strong className="text-sm">{currentSoil.mnManganesMgDm3} mg/dm³</strong>
                </div>
                <div className="p-2.5 border rounded-lg bg-slate-50 dark:bg-zinc-900">
                  <span className="text-[9px] text-slate-400 block font-bold">Ferro (Fe)</span>
                  <strong className="text-sm">{currentSoil.feFerroMgDm3} mg/dm³</strong>
                </div>
                <div className="p-2.5 border rounded-lg bg-slate-50 dark:bg-zinc-900">
                  <span className="text-[9px] text-slate-400 block font-bold">Molibdênio (Mo)</span>
                  <strong className="text-sm">{currentSoil.moMolibdenioMgDm3 || 0.12} mg/dm³</strong>
                </div>
                <div className="p-2.5 border rounded-lg bg-slate-50 dark:bg-zinc-900">
                  <span className="text-[9px] text-slate-400 block font-bold">Silício (Si)</span>
                  <strong className="text-sm">{currentSoil.siSilicioMgDm3 || 14.2} mg/dm³</strong>
                </div>
              </div>
            </div>

            {/* Physical & Biological Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-xl space-y-2 text-xs">
                <strong className="font-bold text-slate-900 dark:text-white block uppercase text-teal-600">
                  2. Atributos Físicos
                </strong>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Argila</span>
                    <strong className="text-sm">{currentSoil.clayPercent}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Silte</span>
                    <strong className="text-sm">{currentSoil.siltPercent}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Areia</span>
                    <strong className="text-sm">{currentSoil.sandPercent}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Classe Textural</span>
                    <strong className="text-xs">{currentSoil.texturalClass}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Densidade</span>
                    <strong className="text-xs">{currentSoil.soilDensityGcm3} g/cm³</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Resist. Penetração</span>
                    <strong className="text-xs">{currentSoil.penetrationResistanceMpa} MPa</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-xl space-y-2 text-xs">
                <strong className="font-bold text-slate-900 dark:text-white block uppercase text-cyan-600">
                  3. Atributos Biológicos (BioAS - EMBRAPA)
                </strong>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Beta-Glicosidase</span>
                    <strong className="text-xs text-emerald-600">{currentSoil.betaGlucosidaseActivity || 145}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Fosfatase Ácida</span>
                    <strong className="text-xs text-emerald-600">{currentSoil.acidPhosphataseActivity || 210}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Arilsulfatase</span>
                    <strong className="text-xs text-emerald-600">{currentSoil.arylsulfataseActivity || 85}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">C Biomassa Microb.</span>
                    <strong className="text-xs">{currentSoil.microbialBiomassCarbonMgKg || 320} mg/kg</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Respiração Basal</span>
                    <strong className="text-xs">{currentSoil.basalRespirationMgC || 18.5} mg C</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* NUTRIINTERPRETAÇÃO & RELAÇÕES NUTRICIONAIS                */}
      {/* ========================================================= */}
      {activeTab === 'nutriinterpretacao' && (
        <div className="space-y-6 animate-fade-in text-xs">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-6">
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-600" />
                Interpretação Avançada de Relações Nutricionais (Nutriinterpretação)
              </h3>
              <p className="text-xs text-slate-500">
                O equilíbrio de cátions e ânions no solo evita inibição competitiva e garante a absorção máxima das culturas.
              </p>
            </div>

            {/* Relations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Card 1: Ca / Mg */}
              {(() => {
                const val = Math.round((currentSoil.caCmolc / (currentSoil.mgCmolc || 0.1)) * 100) / 100;
                const status = val < 3 ? 'low' : val > 4 ? 'high' : 'ideal';
                return (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-500 block uppercase text-[10px]">Cátions Divalentes</span>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">Relação Cálcio / Magnésio (Ca/Mg)</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase ${
                        status === 'ideal' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        status === 'low' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {status === 'ideal' ? 'Equilibrado' : status === 'low' ? 'Falta Ca / Excesso Mg' : 'Excesso Ca / Falta Mg'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-white dark:bg-zinc-950 p-2.5 rounded-lg border text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Valor Atual</span>
                        <strong className="text-base font-black text-slate-900 dark:text-white">{val} : 1</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Faixa Ideal</span>
                        <strong className="text-base font-black text-emerald-600">3.0 - 4.0</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Foco da Amostra</span>
                        <strong className="text-sm font-bold text-slate-500">{currentSoil.caCmolc} Ca / {currentSoil.mgCmolc} Mg</strong>
                      </div>
                    </div>

                    <p className="text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                      {status === 'low' ? (
                        'Relação abaixo de 3.0. Indica excesso relativo de Magnésio ou deficiência de Cálcio. Pode comprometer a divisão celular, estabilidade de membranas e crescimento de pontas de raízes.'
                      ) : status === 'high' ? (
                        'Relação acima de 4.0. Indica excesso relativo de Cálcio, o que causa inibição competitiva (bloqueio físico) da absorção de Magnésio, prejudicando a fotossíntese e síntese de clorofila.'
                      ) : (
                        'Relação ideal e equilibrada. Excelente sinergia iônica que otimiza o desenvolvimento radicular e as funções metabólicas das folhas sem causar inibição mútua.'
                      )}
                    </p>
                  </div>
                );
              })()}

              {/* Card 2: Ca / K */}
              {(() => {
                const val = Math.round((currentSoil.caCmolc / (currentSoil.kCmolc || 0.05)) * 100) / 100;
                const status = val < 10 ? 'low' : val > 15 ? 'high' : 'ideal';
                return (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-500 block uppercase text-[10px]">Estrutura vs Osmose</span>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">Relação Cálcio / Potássio (Ca/K)</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase ${
                        status === 'ideal' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        status === 'low' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {status === 'ideal' ? 'Equilibrado' : status === 'low' ? 'Falta Ca / Excesso K' : 'Excesso Ca / Falta K'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-white dark:bg-zinc-950 p-2.5 rounded-lg border text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Valor Atual</span>
                        <strong className="text-base font-black text-slate-900 dark:text-white">{val} : 1</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Faixa Ideal</span>
                        <strong className="text-base font-black text-emerald-600">10.0 - 15.0</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Foco da Amostra</span>
                        <strong className="text-sm font-bold text-slate-500">{currentSoil.caCmolc} Ca / {currentSoil.kCmolc} K</strong>
                      </div>
                    </div>

                    <p className="text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                      {status === 'low' ? (
                        'Relação abaixo de 10.0. Indica excesso de Potássio em detrimento do Cálcio. Reduz a rigidez estrutural da epiderme da planta, aumentando o acamamento e a vulnerabilidade a doenças fúngicas.'
                      ) : status === 'high' ? (
                        'Relação acima de 15.0. Indica excesso severo de Cálcio. Impede a absorção adequada de Potássio pelas raízes, afetando o controle de estômatos, turgor celular e translocação de amidos.'
                      ) : (
                        'Relação equilibrada. Proporciona excelente equilíbrio entre sustentação de talos (Cálcio) e regulação de fluxo hídrico celular (Potássio).'
                      )}
                    </p>
                  </div>
                );
              })()}

              {/* Card 3: Mg / K */}
              {(() => {
                const val = Math.round((currentSoil.mgCmolc / (currentSoil.kCmolc || 0.05)) * 100) / 100;
                const status = val < 2.5 ? 'low' : val > 4 ? 'high' : 'ideal';
                return (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-500 block uppercase text-[10px]">Energia vs Osmose</span>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">Relação Magnésio / Potássio (Mg/K)</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase ${
                        status === 'ideal' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        status === 'low' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {status === 'ideal' ? 'Equilibrado' : status === 'low' ? 'Falta Mg / Excesso K' : 'Excesso Mg / Falta K'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-white dark:bg-zinc-950 p-2.5 rounded-lg border text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Valor Atual</span>
                        <strong className="text-base font-black text-slate-900 dark:text-white">{val} : 1</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Faixa Ideal</span>
                        <strong className="text-base font-black text-emerald-600">2.5 - 4.0</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Foco da Amostra</span>
                        <strong className="text-sm font-bold text-slate-500">{currentSoil.mgCmolc} Mg / {currentSoil.kCmolc} K</strong>
                      </div>
                    </div>

                    <p className="text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                      {status === 'low' ? (
                        'Relação abaixo de 2.5. O excesso de Potássio induz uma carência de Magnésio ("Fome de Mg"). As folhas velhas da cultura apresentarão clorose internerval típica e queda prematura.'
                      ) : status === 'high' ? (
                        'Relação acima de 4.0. Indica excesso de Magnésio ou falta severa de Potássio. Resulta em folhas murchas com bordas necrosadas devido a falhas no fechamento estomático sob calor intenso.'
                      ) : (
                        'Relação ideal. Permite síntese contínua de clorofila e fosforilação perfeita com aproveitamento integral do potássio absorvido.'
                      )}
                    </p>
                  </div>
                );
              })()}

              {/* Card 4: (Ca+Mg) / K */}
              {(() => {
                const val = Math.round(((currentSoil.caCmolc + currentSoil.mgCmolc) / (currentSoil.kCmolc || 0.05)) * 100) / 100;
                const status = val < 12 ? 'low' : val > 20 ? 'high' : 'ideal';
                return (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-500 block uppercase text-[10px]">Cátions Totais</span>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">Relação (Cálcio + Magnésio) / Potássio ((Ca+Mg)/K)</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase ${
                        status === 'ideal' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        status === 'low' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {status === 'ideal' ? 'Equilibrado' : status === 'low' ? 'Excesso de K' : 'Excesso de Divalentes'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-white dark:bg-zinc-950 p-2.5 rounded-lg border text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Valor Atual</span>
                        <strong className="text-base font-black text-slate-900 dark:text-white">{val} : 1</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Faixa Ideal</span>
                        <strong className="text-base font-black text-emerald-600">12.0 - 20.0</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Bases CTC</span>
                        <strong className="text-sm font-bold text-slate-500">Ca+Mg: {Math.round((currentSoil.caCmolc + currentSoil.mgCmolc)*100)/100} / K: {currentSoil.kCmolc}</strong>
                      </div>
                    </div>

                    <p className="text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                      {status === 'low' ? (
                        'Relação abaixo de 12.0. O solo está fortemente desequilibrado em favor do Potássio monovalente. Isso gera forte inibição divalente, inibindo severamente a absorção de Cálcio e Magnésio.'
                      ) : status === 'high' ? (
                        'Relação acima de 20.0. O excesso de divalentes (Ca+Mg) bloqueia a absorção de Potássio. A cultura sofrerá com grãos pequenos, casca fina de frutos e vulnerabilidade ao estresse térmico.'
                      ) : (
                        'Equilíbrio perfeito de cargas divalentes e monovalentes. Máximo potencial de enchimento de grãos com firmeza estrutural garantida.'
                      )}
                    </p>
                  </div>
                );
              })()}

              {/* Card 5: P / Zn */}
              {(() => {
                const val = Math.round((currentSoil.pResina / (currentSoil.znZincoMgDm3 || 0.1)) * 100) / 100;
                const status = val < 5 ? 'low' : val > 15 ? 'high' : 'ideal';
                return (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-500 block uppercase text-[10px]">Macro vs Micronutriente</span>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">Antagonismo Fósforo / Zinco (P/Zn)</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase ${
                        status === 'ideal' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        status === 'low' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {status === 'ideal' ? 'Sinergia' : status === 'low' ? 'Excesso de Zinco' : 'Antagonismo P-Zn'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-white dark:bg-zinc-950 p-2.5 rounded-lg border text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Valor Atual</span>
                        <strong className="text-base font-black text-slate-900 dark:text-white">{val} : 1</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Faixa Ideal</span>
                        <strong className="text-base font-black text-emerald-600">5.0 - 15.0</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Foco da Amostra</span>
                        <strong className="text-sm font-bold text-slate-500">P: {currentSoil.pResina} / Zn: {currentSoil.znZincoMgDm3}</strong>
                      </div>
                    </div>

                    <p className="text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                      {status === 'low' ? (
                        'Relação abaixo de 5.0. Indica níveis excessivos de Zinco ou escassez crônica de Fósforo. É necessário priorizar a adubação fosfatada no sulco de plantio.'
                      ) : status === 'high' ? (
                        'Relação acima de 15.0. Indica "Antagonismo Fósforo-Zinco". Altíssimas doses de fósforo ou saturação extrema bloqueiam a translocação do Zinco da raiz para as folhas, causando entrenós curtos.'
                      ) : (
                        'Sinergia perfeita. O fósforo e o zinco estão equilibrados, garantindo excelente arranque inicial de plântulas e produção de fitohormônios naturais (auxina).'
                      )}
                    </p>
                  </div>
                );
              })()}

              {/* Card 6: N / S */}
              {(() => {
                const nEst = Math.round(currentSoil.organicMatterGKg * 0.5 * 10) / 10;
                const val = Math.round((nEst / (currentSoil.sSulfurMgDm3 || 1)) * 10) / 10;
                const status = val < 10 ? 'low' : val > 12 ? 'high' : 'ideal';
                return (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-500 block uppercase text-[10px]">Ânions e Proteínas</span>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">Sinergia Proteica Nitrogênio / Enxofre (N/S)</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase ${
                        status === 'ideal' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        status === 'low' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {status === 'ideal' ? 'Sinergia Ótima' : status === 'low' ? 'Falta N' : 'Bloqueio de Nitrogênio'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-white dark:bg-zinc-950 p-2.5 rounded-lg border text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Valor Atual Est.</span>
                        <strong className="text-base font-black text-slate-900 dark:text-white">{val} : 1</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Faixa Ideal</span>
                        <strong className="text-base font-black text-emerald-600">10.0 - 12.0</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Balanço Solo</span>
                        <strong className="text-sm font-bold text-slate-500">N Est: {nEst} / S: {currentSoil.sSulfurMgDm3}</strong>
                      </div>
                    </div>

                    <p className="text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                      {status === 'low' ? (
                        'Relação abaixo de 10.0. Indica potencial falta de Nitrogênio ou alta presença de sulfato no solo. A planta pode ter limitações no acúmulo de biomassa total.'
                      ) : status === 'high' ? (
                        'Relação superior a 12.0. Há escassez de Enxofre para metabolizar o Nitrogênio acumulado. Isso causa acúmulo de N não-proteico na seiva (amidos e aminoácidos livres), atraindo pragas mastigadoras.'
                      ) : (
                        'Balanço N:S excelente para síntese de proteínas, enzimas e anticorpos vegetais. Otimiza o aproveitamento das coberturas nitrogenadas com máxima eficiência de conversão em grãos.'
                      )}
                    </p>
                  </div>
                );
              })()}

              {/* Card 7: Fe / Mn */}
              {(() => {
                const val = Math.round((currentSoil.feFerroMgDm3 / (currentSoil.mnManganesMgDm3 || 0.1)) * 100) / 100;
                const status = val < 1.5 ? 'low' : val > 3.0 ? 'high' : 'ideal';
                return (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-500 block uppercase text-[10px]">Micronutrientes Metálicos</span>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">Relação Ferro / Manganês (Fe/Mn)</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase ${
                        status === 'ideal' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        status === 'low' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {status === 'ideal' ? 'Equilibrado' : status === 'low' ? 'Risco Toxicidade Mn' : 'Risco Clorose Férrica'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-white dark:bg-zinc-950 p-2.5 rounded-lg border text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Valor Atual</span>
                        <strong className="text-base font-black text-slate-900 dark:text-white">{val} : 1</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Faixa Ideal</span>
                        <strong className="text-base font-black text-emerald-600">1.5 - 3.0</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Foco da Amostra</span>
                        <strong className="text-sm font-bold text-slate-500">{currentSoil.feFerroMgDm3} Fe / {currentSoil.mnManganesMgDm3} Mn</strong>
                      </div>
                    </div>

                    <p className="text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                      {status === 'low' ? (
                        'Relação abaixo de 1.5. Indica alto risco de toxicidade por Manganês em solos muito ácidos, ou severa falta de Ferro. Reduz a atividade de enzimas de respiração celular na planta.'
                      ) : status === 'high' ? (
                        'Relação acima de 3.0. O excesso de Ferro bloqueia competitivamente a absorção de Manganês pelas raízes. Causa pontuações necróticas foliares e interfere na fotólise da água.'
                      ) : (
                        'Relação equilibrada. Excelente sinergia na cadeia de transporte de elétrons da fotossíntese e ativação equilibrada de fitohormônios.'
                      )}
                    </p>
                  </div>
                );
              })()}

              {/* Card 8: Ca / B */}
              {(() => {
                const val = Math.round((currentSoil.caCmolc / (currentSoil.bBoroMgDm3 || 0.05)) * 10) / 10;
                const status = val < 10.0 ? 'low' : val > 30.0 ? 'high' : 'ideal';
                return (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-500 block uppercase text-[10px]">Cátions vs Ânions Micro</span>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">Relação Cálcio / Boro (Ca/B)</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase ${
                        status === 'ideal' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        status === 'low' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {status === 'ideal' ? 'Equilibrado' : status === 'low' ? 'Acúmulo Tóxico de B' : 'Inibição por Excesso de Ca'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-white dark:bg-zinc-950 p-2.5 rounded-lg border text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Valor Atual</span>
                        <strong className="text-base font-black text-slate-900 dark:text-white">{val} : 1</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Faixa Ideal</span>
                        <strong className="text-base font-black text-emerald-600">10.0 - 30.0</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Foco da Amostra</span>
                        <strong className="text-sm font-bold text-slate-500">{currentSoil.caCmolc} Ca / {currentSoil.bBoroMgDm3} B</strong>
                      </div>
                    </div>

                    <p className="text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                      {status === 'low' ? (
                        'Relação abaixo de 10.0. Indica perigo de toxicidade por Boro ou falta grave de Cálcio estrutural. Leva ao murchamento rápido e morte do broto terminal por colapso de membrana.'
                      ) : status === 'high' ? (
                        'Relação acima de 30.0. O excesso de Cálcio (muito comum em solos supercalcareados) suprime a assimilação de Boro, impedindo o correto desenvolvimento de tubos polínicos e provocando alta taxa de abortamento floral.'
                      ) : (
                        'Sinergia celular excelente. Relação perfeita para sustentação física (Cálcio) e integridade flexível da parede celular (Boro).'
                      )}
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Division Line for Separate Nutrient Fisiologia */}
            <div className="border-t dark:border-zinc-800 pt-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers3 className="w-4 h-4 text-emerald-600" />
                    Diagnóstico Individual e Fisiologia na Planta (Nutrientes Separados)
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Explore o comportamento fisiológico individual de cada elemento mineral, seus sintomas foliares típicos e interações no desenvolvimento vegetal.
                  </p>
                </div>

                {/* Filter Controls */}
                <div className="flex bg-slate-100 dark:bg-zinc-900/80 p-0.5 rounded-lg border dark:border-zinc-800 self-start sm:self-center shrink-0">
                  <button
                    id="nutrient-filter-all"
                    onClick={() => setNutrientFilter('all')}
                    className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase transition-all cursor-pointer ${
                      nutrientFilter === 'all'
                        ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-xs'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Todos (11)
                  </button>
                  <button
                    id="nutrient-filter-macro"
                    onClick={() => setNutrientFilter('macro')}
                    className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase transition-all cursor-pointer ${
                      nutrientFilter === 'macro'
                        ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-xs'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Macronutrientes (6)
                  </button>
                  <button
                    id="nutrient-filter-micro"
                    onClick={() => setNutrientFilter('micro')}
                    className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase transition-all cursor-pointer ${
                      nutrientFilter === 'micro'
                        ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-xs'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Micronutrientes (5)
                  </button>
                </div>
              </div>

              {/* Nutrients Bento Cards Container */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-xs mt-3">
                {/* 1. NITROGÊNIO */}
                {(nutrientFilter === 'all' || nutrientFilter === 'macro') && (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 space-y-3 shadow-2xs">
                    <div className="flex justify-between items-center border-b dark:border-zinc-800/80 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-black text-[11px]">N</span>
                        <div>
                          <h5 className="font-black text-slate-800 dark:text-zinc-200">Nitrogênio</h5>
                          <span className="text-[9px] text-slate-400 uppercase font-bold">Macronutriente Primário</span>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                        {Math.round(currentSoil.organicMatterGKg * 0.5 * 10) / 10} kg/ha Est.
                      </span>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div>
                        <strong className="text-slate-700 dark:text-zinc-300 block text-[10px] uppercase font-bold">Relação e Função na Planta:</strong>
                        <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                          Componente essencial das moléculas de clorofila, proteínas, enzimas estruturais (incluindo Rubisco) e ácidos nucleicos (DNA/RNA). Controla diretamente o tamanho da área foliar fotossintética ativa e induz o perfilhamento.
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-zinc-900/60 p-2 rounded-lg border border-slate-100 dark:border-zinc-800/80">
                        <strong className="text-rose-600 dark:text-rose-400 block text-[10px] uppercase font-black">Sintomas Fisiológicos de Deficiência / Excesso:</strong>
                        <p className="text-slate-600 dark:text-zinc-400 leading-relaxed mt-0.5 text-[10px]">
                          <strong>Deficiência:</strong> Clorose (amarelecimento) uniforme que inicia nas folhas velhas e migra para as jovens. Reduz severamente o crescimento. <strong>Excesso:</strong> Alongamento excessivo de colmos, tecidos muito tenros e sensíveis a pragas/vento.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. FÓSFORO */}
                {(nutrientFilter === 'all' || nutrientFilter === 'macro') && (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 space-y-3 shadow-2xs">
                    <div className="flex justify-between items-center border-b dark:border-zinc-800/80 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-black text-[11px]">P</span>
                        <div>
                          <h5 className="font-black text-slate-800 dark:text-zinc-200">Fósforo</h5>
                          <span className="text-[9px] text-slate-400 uppercase font-bold">Macronutriente Primário</span>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                        {currentSoil.pResina} mg/dm³
                      </span>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div>
                        <strong className="text-slate-700 dark:text-zinc-300 block text-[10px] uppercase font-bold">Relação e Função na Planta:</strong>
                        <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                          Armazenamento, conversão e transferência de energia sob a forma de ATP e ADP. Crucial para a respiração vegetal, síntese de amidos, ativação metabólica e expansão das raízes na busca por água profunda.
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-zinc-900/60 p-2 rounded-lg border border-slate-100 dark:border-zinc-800/80">
                        <strong className="text-rose-600 dark:text-rose-400 block text-[10px] uppercase font-black">Sintomas Fisiológicos de Deficiência / Excesso:</strong>
                        <p className="text-slate-600 dark:text-zinc-400 leading-relaxed mt-0.5 text-[10px]">
                          <strong>Deficiência:</strong> Acúmulo foliar de antocianina, causando coloração roxa/púrpura escura nas bordas das folhas velhas. O crescimento radicular é severamente travado. <strong>Excesso:</strong> Induz inibição competitiva e indisponibilidade de Zinco (P-Zn) e Ferro.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. POTÁSSIO */}
                {(nutrientFilter === 'all' || nutrientFilter === 'macro') && (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 space-y-3 shadow-2xs">
                    <div className="flex justify-between items-center border-b dark:border-zinc-800/80 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center font-black text-[11px]">K</span>
                        <div>
                          <h5 className="font-black text-slate-800 dark:text-zinc-200">Potássio</h5>
                          <span className="text-[9px] text-slate-400 uppercase font-bold">Macronutriente Primário</span>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                        {currentSoil.kCmolc} cmol_c/dm³
                      </span>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div>
                        <strong className="text-slate-700 dark:text-zinc-300 block text-[10px] uppercase font-bold">Relação e Função na Planta:</strong>
                        <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                          Cátion osmótico regulador de turgor celular, regendo o fechamento estomático sob calor intenso. Ativa dezenas de sistemas enzimáticos e impulsiona a translocação de açúcares das folhas para grãos, vagens e frutos.
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-zinc-900/60 p-2 rounded-lg border border-slate-100 dark:border-zinc-800/80">
                        <strong className="text-rose-600 dark:text-rose-400 block text-[10px] uppercase font-black">Sintomas Fisiológicos de Deficiência / Excesso:</strong>
                        <p className="text-slate-600 dark:text-zinc-400 leading-relaxed mt-0.5 text-[10px]">
                          <strong>Deficiência:</strong> Queima e necrose progressiva das bordas de folhas velhas, flacidez dos colmos (acamamento) e perda de resistência à seca. <strong>Excesso:</strong> Inibe a absorção de Cálcio e Magnésio divalentes na CTC.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. CÁLCIO */}
                {(nutrientFilter === 'all' || nutrientFilter === 'macro') && (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 space-y-3 shadow-2xs">
                    <div className="flex justify-between items-center border-b dark:border-zinc-800/80 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center font-black text-[11px]">Ca</span>
                        <div>
                          <h5 className="font-black text-slate-800 dark:text-zinc-200">Cálcio</h5>
                          <span className="text-[9px] text-slate-400 uppercase font-bold">Macronutriente Secundário</span>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                        {currentSoil.caCmolc} cmol_c/dm³
                      </span>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div>
                        <strong className="text-slate-700 dark:text-zinc-300 block text-[10px] uppercase font-bold">Relação e Função na Planta:</strong>
                        <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                          Formador de pectato de cálcio na lamela média da parede celular, conferindo firmeza mecânica e resistência a infecções fúngicas. Essencial como mensageiro secundário no controle do estresse térmico/salino.
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-zinc-900/60 p-2 rounded-lg border border-slate-100 dark:border-zinc-800/80">
                        <strong className="text-rose-600 dark:text-rose-400 block text-[10px] uppercase font-black">Sintomas Fisiológicos de Deficiência / Excesso:</strong>
                        <p className="text-slate-600 dark:text-zinc-400 leading-relaxed mt-0.5 text-[10px]">
                          <strong>Deficiência:</strong> Morte de pontos de crescimento (broto terminal), deformação de folhas jovens com bordas em colapso e podridão apical de frutos (fundo preto em tomates/pimentões). <strong>Excesso:</strong> Eleva o pH e induz clorose por indisponibilizar micronutrientes.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. MAGNÉSIO */}
                {(nutrientFilter === 'all' || nutrientFilter === 'macro') && (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 space-y-3 shadow-2xs">
                    <div className="flex justify-between items-center border-b dark:border-zinc-800/80 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-lg bg-pink-100 dark:bg-pink-950/40 text-pink-600 flex items-center justify-center font-black text-[11px]">Mg</span>
                        <div>
                          <h5 className="font-black text-slate-800 dark:text-zinc-200">Magnésio</h5>
                          <span className="text-[9px] text-slate-400 uppercase font-bold">Macronutriente Secundário</span>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-pink-50 dark:bg-pink-950/60 text-[10px] font-bold text-pink-700 dark:text-pink-300">
                        {currentSoil.mgCmolc} cmol_c/dm³
                      </span>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div>
                        <strong className="text-slate-700 dark:text-zinc-300 block text-[10px] uppercase font-bold">Relação e Função na Planta:</strong>
                        <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                          Átomo central de coordenação na molécula de clorofila, sendo indispensável para a absorção de luz solar. Atua como co-fator enzimático crucial na ativação da enzima Rubisco e na fosforilação oxidativa.
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-zinc-900/60 p-2 rounded-lg border border-slate-100 dark:border-zinc-800/80">
                        <strong className="text-rose-600 dark:text-rose-400 block text-[10px] uppercase font-black">Sintomas Fisiológicos de Deficiência / Excesso:</strong>
                        <p className="text-slate-600 dark:text-zinc-400 leading-relaxed mt-0.5 text-[10px]">
                          <strong>Deficiência:</strong> Clorose internerval típica nas folhas mais velhas (as nervuras ficam intensamente verdes, e o limbo entre elas amarela ou avermelha). Reduz severamente a taxa fotossintética líquida. <strong>Excesso:</strong> Inibe a absorção de Potássio.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. ENXOFRE */}
                {(nutrientFilter === 'all' || nutrientFilter === 'macro') && (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 space-y-3 shadow-2xs">
                    <div className="flex justify-between items-center border-b dark:border-zinc-800/80 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center font-black text-[11px]">S</span>
                        <div>
                          <h5 className="font-black text-slate-800 dark:text-zinc-200">Enxofre</h5>
                          <span className="text-[9px] text-slate-400 uppercase font-bold">Macronutriente Secundário</span>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-[10px] font-bold text-teal-700 dark:text-teal-300">
                        {currentSoil.sSulfurMgDm3} mg/dm³
                      </span>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div>
                        <strong className="text-slate-700 dark:text-zinc-300 block text-[10px] uppercase font-bold">Relação e Função na Planta:</strong>
                        <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                          Constituinte estrutural de aminoácidos sulfurados essenciais (Metionina e Cisteína) que determinam a estrutura terciária e quaternária de todas as proteínas e anticorpos vegetais. Atua ativamente na nodulação bacteriana de leguminosas.
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-zinc-900/60 p-2 rounded-lg border border-slate-100 dark:border-zinc-800/80">
                        <strong className="text-rose-600 dark:text-rose-400 block text-[10px] uppercase font-black">Sintomas Fisiológicos de Deficiência / Excesso:</strong>
                        <p className="text-slate-600 dark:text-zinc-400 leading-relaxed mt-0.5 text-[10px]">
                          <strong>Deficiência:</strong> Clorose uniforme (amarelecimento completo do limbo foliar) muito parecida com a falta de Nitrogênio, porém manifestando-se primeiro nas <strong>folhas mais jovens</strong> (baixa mobilidade).
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. BORO */}
                {(nutrientFilter === 'all' || nutrientFilter === 'micro') && (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 space-y-3 shadow-2xs">
                    <div className="flex justify-between items-center border-b dark:border-zinc-800/80 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center font-black text-[11px]">B</span>
                        <div>
                          <h5 className="font-black text-slate-800 dark:text-zinc-200">Boro</h5>
                          <span className="text-[9px] text-slate-400 uppercase font-bold">Micronutriente Metaloide</span>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-orange-50 dark:bg-orange-950/60 text-[10px] font-bold text-orange-700 dark:text-orange-300">
                        {currentSoil.bBoroMgDm3} mg/dm³
                      </span>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div>
                        <strong className="text-slate-700 dark:text-zinc-300 block text-[10px] uppercase font-bold">Relação e Função na Planta:</strong>
                        <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                          Co-responsável com o cálcio pela elasticidade de novas paredes celulares por meio da complexação estável com borato-borato-pectina. Regula o alongamento do tubo polínico garantindo alta taxa de fecundação floral.
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-zinc-900/60 p-2 rounded-lg border border-slate-100 dark:border-zinc-800/80">
                        <strong className="text-rose-600 dark:text-rose-400 block text-[10px] uppercase font-black">Sintomas Fisiológicos de Deficiência / Excesso:</strong>
                        <p className="text-slate-600 dark:text-zinc-400 leading-relaxed mt-0.5 text-[10px]">
                          <strong>Deficiência:</strong> Quebra/aborto precoce de flores, "coração oco" em raízes tuberosas e morte do meristema apical com abundante ramificação lateral de colmo com nós curtos ("roseta"). <strong>Excesso:</strong> Queima acentuada de bordas de folhas velhas.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. ZINCO */}
                {(nutrientFilter === 'all' || nutrientFilter === 'micro') && (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 space-y-3 shadow-2xs">
                    <div className="flex justify-between items-center border-b dark:border-zinc-800/80 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-lg bg-yellow-100 dark:bg-yellow-950/40 text-yellow-600 flex items-center justify-center font-black text-[11px]">Zn</span>
                        <div>
                          <h5 className="font-black text-slate-800 dark:text-zinc-200">Zinco</h5>
                          <span className="text-[9px] text-slate-400 uppercase font-bold">Micronutriente Metálico</span>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-yellow-50 dark:bg-yellow-950/60 text-[10px] font-bold text-yellow-700 dark:text-yellow-300">
                        {currentSoil.znZincoMgDm3} mg/dm³
                      </span>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div>
                        <strong className="text-slate-700 dark:text-zinc-300 block text-[10px] uppercase font-bold">Relação e Função na Planta:</strong>
                        <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                          Catalisador obrigatório na biossíntese do triptofano, aminoácido precursor imediato do hormônio Auxina (Ácido Indolacético - AIA). Rege o crescimento celular, alongamento de folhas e formação correta de gemas de crescimento.
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-zinc-900/60 p-2 rounded-lg border border-slate-100 dark:border-zinc-800/80">
                        <strong className="text-rose-600 dark:text-rose-400 block text-[10px] uppercase font-black">Sintomas Fisiológicos de Deficiência / Excesso:</strong>
                        <p className="text-slate-600 dark:text-zinc-400 leading-relaxed mt-0.5 text-[10px]">
                          <strong>Deficiência:</strong> Encurtamento de entrenós, deixando a planta anã com aspecto de roseta apical. No milho, provoca "milho branco" (bandas de clorose clara paralelas à nervura principal).
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. COBRE */}
                {(nutrientFilter === 'all' || nutrientFilter === 'micro') && (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 space-y-3 shadow-2xs">
                    <div className="flex justify-between items-center border-b dark:border-zinc-800/80 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center font-black text-[11px]">Cu</span>
                        <div>
                          <h5 className="font-black text-slate-800 dark:text-zinc-200">Cobre</h5>
                          <span className="text-[9px] text-slate-400 uppercase font-bold">Micronutriente Metálico</span>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                        {currentSoil.cuCobreMgDm3} mg/dm³
                      </span>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div>
                        <strong className="text-slate-700 dark:text-zinc-300 block text-[10px] uppercase font-bold">Relação e Função na Planta:</strong>
                        <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                          Formador da proteína plastocianina, agente fundamental no transporte de elétrons na fase fotoquímica da fotossíntese. Intervém ativamente na lignificação de vasos de seiva, conferindo imunidade mecânica natural contra fungos de xilema.
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-zinc-900/60 p-2 rounded-lg border border-slate-100 dark:border-zinc-800/80">
                        <strong className="text-rose-600 dark:text-rose-400 block text-[10px] uppercase font-black">Sintomas Fisiológicos de Deficiência / Excesso:</strong>
                        <p className="text-slate-600 dark:text-zinc-400 leading-relaxed mt-0.5 text-[10px]">
                          <strong>Deficiência:</strong> Deformação, enrolamento espiral e cor verde-azulada opaca nas folhas novas. Em cereais, provoca chochamento e esterilidade das espigas ("seca de pontas").
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 10. MANGANÊS */}
                {(nutrientFilter === 'all' || nutrientFilter === 'micro') && (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 space-y-3 shadow-2xs">
                    <div className="flex justify-between items-center border-b dark:border-zinc-800/80 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-lg bg-cyan-100 dark:bg-cyan-950/40 text-cyan-600 flex items-center justify-center font-black text-[11px]">Mn</span>
                        <div>
                          <h5 className="font-black text-slate-800 dark:text-zinc-200">Manganês</h5>
                          <span className="text-[9px] text-slate-400 uppercase font-bold">Micronutriente Metálico</span>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/60 text-[10px] font-bold text-cyan-700 dark:text-cyan-300">
                        {currentSoil.mnManganesMgDm3} mg/dm³
                      </span>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div>
                        <strong className="text-slate-700 dark:text-zinc-300 block text-[10px] uppercase font-bold">Relação e Função na Planta:</strong>
                        <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                          Ativador fundamental do fotossistema II, participando ativamente da quebra enzimática da água (fotólise da água ou Reação de Hill) para liberar oxigênio e prótons de energia. Regula compostos de autodefesa vegetal (lignina e fenóis).
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-zinc-900/60 p-2 rounded-lg border border-slate-100 dark:border-zinc-800/80">
                        <strong className="text-rose-600 dark:text-rose-400 block text-[10px] uppercase font-black">Sintomas Fisiológicos de Deficiência / Excesso:</strong>
                        <p className="text-slate-600 dark:text-zinc-400 leading-relaxed mt-0.5 text-[10px]">
                          <strong>Deficiência:</strong> Clorose internerval salpicada ou em rede delicada em folhas jovens (nervuras finas e verdes formam padrão de malha). <strong>Excesso (comum em pH &lt; 5.2):</strong> Pontos necróticos escuros rodeados por halo amarelo em folhas velhas.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 11. FERRO */}
                {(nutrientFilter === 'all' || nutrientFilter === 'micro') && (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 space-y-3 shadow-2xs">
                    <div className="flex justify-between items-center border-b dark:border-zinc-800/80 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center font-black text-[11px]">Fe</span>
                        <div>
                          <h5 className="font-black text-slate-800 dark:text-zinc-200">Ferro</h5>
                          <span className="text-[9px] text-slate-400 uppercase font-bold">Micronutriente Metálico</span>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/60 text-[10px] font-bold text-red-700 dark:text-red-300">
                        {currentSoil.feFerroMgDm3} mg/dm³
                      </span>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div>
                        <strong className="text-slate-700 dark:text-zinc-300 block text-[10px] uppercase font-bold">Relação e Função na Planta:</strong>
                        <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                          Co-responsável pela síntese e estabilidade dos tilacoides no cloroplasto. Integra citocromos e ferredoxinas que atuam no transporte de elétrons de alta energia na respiração e fotossíntese.
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-zinc-900/60 p-2 rounded-lg border border-slate-100 dark:border-zinc-800/80">
                        <strong className="text-rose-600 dark:text-rose-400 block text-[10px] uppercase font-black">Sintomas Fisiológicos de Deficiência / Excesso:</strong>
                        <p className="text-slate-600 dark:text-zinc-400 leading-relaxed mt-0.5 text-[10px]">
                          <strong>Deficiência:</strong> Clorose internerval nítida e extremamente brilhante nas folhas jovens. Em casos severos de solos alcalinos ou saturados de calcário, a folha fica completamente branca-marfim/descolorida.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2.5 CURVAS DE CALIBRAÇÃO (ANÁLISE DE SOLO & NÍVEIS CRÍTICOS)*/}
      {/* ========================================================= */}
      {activeTab === 'curvas_calibracao' && (
        <SoilCalibrationCurves
          currentSoil={currentSoil}
          allBulletins={allBulletins}
          selectedBulletinId={selectedBulletinId}
          onSelectBulletin={setSelectedBulletinId}
          onUpdateBulletin={(updated) => {
            setAllBulletins(prev => prev.map(b => (b.id === updated.id ? updated : b)));
          }}
          showNotification={(msg) => setNotification(msg)}
        />
      )}

      {/* ========================================================= */}
      {/* 3. CALAGEM                                                */}
      {/* ========================================================= */}
      {activeTab === 'calagem' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-6">
            <div className="border-b pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-amber-500" />
                  Recomendação Técnica de Calagem
                </h3>
                <p className="text-xs text-slate-500">
                  Ajuste fino de parâmetros da calagem para o talhão {currentSoil.plotName}.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 px-3 py-1 rounded-xl text-xs">
                <Globe className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-bold text-amber-950 dark:text-amber-200">Boletim: {currentBulletin.name}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold">Método de Calagem:</label>
                <select
                  value={limingMethod}
                  onChange={e => setLimingMethod(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border rounded-lg font-bold"
                >
                  <option value="v_percent">Saturação por Bases (V%)</option>
                  <option value="smp">Solução Tampão SMP (RS/SC)</option>
                  <option value="al_neutralization">Neutralização de Al + Ca/Mg (CFSEMG)</option>
                  <option value="ca_elevation">Elevação de Cálcio</option>
                  <option value="mg_elevation">Elevação de Magnésio</option>
                </select>
              </div>

              {limingMethod === 'v_percent' && (
                <div className="space-y-1">
                  <label className="font-bold">V% Meta da Cultura (%):</label>
                  <input
                    type="number"
                    value={limingTargetV}
                    onChange={e => setLimingTargetV(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border rounded-lg font-bold"
                  />
                </div>
              )}

              {limingMethod === 'ca_elevation' && (
                <div className="space-y-1">
                  <label className="font-bold">Ca Alvo (cmol_c/dm³):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={limingTargetCa}
                    onChange={e => setLimingTargetCa(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border rounded-lg font-bold"
                  />
                </div>
              )}

              {limingMethod === 'mg_elevation' && (
                <div className="space-y-1">
                  <label className="font-bold">Mg Alvo (cmol_c/dm³):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={limingTargetMg}
                    onChange={e => setLimingTargetMg(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border rounded-lg font-bold"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold">PRNT do Calcário (%):</label>
                <input
                  type="number"
                  value={limingPrnt}
                  onChange={e => setLimingPrnt(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border rounded-lg font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold">Profundidade (cm):</label>
                <input
                  type="number"
                  value={limingDepthCm}
                  onChange={e => setLimingDepthCm(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border rounded-lg font-bold"
                />
              </div>
            </div>

            {/* Results */}
            <div className="p-5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl space-y-4 text-xs">
              <strong className="text-sm font-black text-amber-900 dark:text-amber-300 block">
                Parecer de Calagem Calculado ({calagemResult.methodLabel}):
              </strong>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 bg-white dark:bg-black rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-bold">Dose por Hectare</span>
                  <strong className="text-2xl text-amber-600 font-black">{calagemResult.ncTonHa} t/ha</strong>
                </div>
                <div className="p-3 bg-white dark:bg-black rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-bold">Tipo de Calcário</span>
                  <strong className="text-sm font-bold block">{calagemResult.limestoneType}</strong>
                </div>
                <div className="p-3 bg-white dark:bg-black rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-bold">Fator de Correção f</span>
                  <strong className="text-lg text-amber-700 dark:text-amber-400 font-black">f = {calagemResult.fFactor.toFixed(3)}</strong>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-medium">
                    {calagemResult.fFactor === 1 ? '100% Eficiência (PRNT 85%)' : `f = 85 / ${limingPrnt || 85}`}
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-black rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-bold">Dose no Sulco ({rowSpacingM}m)</span>
                  <strong className="text-lg text-slate-900 dark:text-white font-black">{calagemResult.gramsPerLinearMeter} g/m</strong>
                </div>
                <div className="p-3 bg-white dark:bg-black rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-bold">Dose por Cova</span>
                  <strong className="text-lg text-slate-900 dark:text-white font-black">{calagemResult.gramsPerHole} g/cova</strong>
                </div>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-zinc-400">
                <strong>Época Recomendada:</strong> {calagemResult.recommendedSeason}
              </div>
              <div className="mt-4">
                <label className="font-bold text-[10px] text-slate-500 block mb-1">Observações Técnicas / Restrições (Calagem)</label>
                <textarea
                  value={limingObservation}
                  onChange={e => setLimingObservation(e.target.value)}
                  placeholder="Ex: Aplicar 60 dias antes do plantio, parcelar em duas vezes, incorporar a 20cm..."
                  className="w-full p-2.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs min-h-[60px]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. GESSAGEM                                               */}
      {/* ========================================================= */}
      {activeTab === 'gessagem' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-6 text-xs">
            <div className="border-b pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-teal-500" />
                  Recomendação de Gessagem Agrícola Subsuperficial
                </h3>
                <p className="text-xs text-slate-500">
                  Condicionamento da camada subsuperficial (20-40cm e 40-60cm), aprofundamento radicular e neutralização de Alumínio tóxico.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-teal-50 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-700/60 px-3 py-1 rounded-xl text-xs">
                <Globe className="w-3.5 h-3.5 text-teal-600" />
                <span className="font-bold text-teal-950 dark:text-teal-200">Boletim: {currentBulletin.name}</span>
              </div>
            </div>

            {/* Seletor de Método de Gessagem */}
            <div className="space-y-3">
              <label className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                Selecione o Método de Cálculo de Gessagem:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedGypsumMethod('fator_argila')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${selectedGypsumMethod === 'fator_argila' ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
                >
                  <span className="font-black text-xs block">1. Fator de Argila</span>
                  <span className={`text-[10px] block mt-0.5 ${selectedGypsumMethod === 'fator_argila' ? 'text-teal-100' : 'text-slate-500'}`}>
                    Sousa & Lobato / Embrapa
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGypsumMethod('demate')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${selectedGypsumMethod === 'demate' ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
                >
                  <span className="font-black text-xs block">2. Método Dematê</span>
                  <span className={`text-[10px] block mt-0.5 ${selectedGypsumMethod === 'demate' ? 'text-teal-100' : 'text-slate-500'}`}>
                    Saturação V% Subsolo
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGypsumMethod('caires_guimaraes')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${selectedGypsumMethod === 'caires_guimaraes' ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
                >
                  <span className="font-black text-xs block">3. Caires & Guimarães</span>
                  <span className={`text-[10px] block mt-0.5 ${selectedGypsumMethod === 'caires_guimaraes' ? 'text-teal-100' : 'text-slate-500'}`}>
                    Saturação Ca% Subsolo (2018)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGypsumMethod('boletim_100')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${selectedGypsumMethod === 'boletim_100' ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
                >
                  <span className="font-black text-xs block">4. Boletim 100 IAC</span>
                  <span className={`text-[10px] block mt-0.5 ${selectedGypsumMethod === 'boletim_100' ? 'text-teal-100' : 'text-slate-500'}`}>
                    Raij et al. (60 × % Argila)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGypsumMethod('classe_textural')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${selectedGypsumMethod === 'classe_textural' ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
                >
                  <span className="font-black text-xs block">5. Classe Textural</span>
                  <span className={`text-[10px] block mt-0.5 ${selectedGypsumMethod === 'classe_textural' ? 'text-teal-100' : 'text-slate-500'}`}>
                    Tabela por Faixa Textural
                  </span>
                </button>
              </div>
            </div>

            {/* Painel de Parâmetros e Ajuste Fino do Método Ativo */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-3">
              {selectedGypsumMethod === 'fator_argila' && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2 border-slate-200 dark:border-zinc-800">
                    <strong className="text-xs font-bold text-slate-900 dark:text-white">
                      Parâmetros: Método Fator de Argila (Sousa & Lobato / Embrapa Cerrados)
                    </strong>
                    <span className="text-[11px] text-teal-700 dark:text-teal-400 font-bold">
                      NG (kg/ha) = Fator × % Argila ({gessagemResult.subsoilClay}%)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Fator Multiplicador da Argila (kg de Gesso / % Argila):</label>
                      <input
                        type="number"
                        step="5"
                        value={gypsumClayFactor}
                        onChange={e => setGypsumClayFactor(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full p-2.5 bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-lg font-bold text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 block">Atalhos por Grupo de Culturas:</span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setGypsumClayFactor(50)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${gypsumClayFactor === 50 ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-slate-300'}`}
                        >
                          50 (Culturas Anuais)
                        </button>
                        <button
                          type="button"
                          onClick={() => setGypsumClayFactor(60)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${gypsumClayFactor === 60 ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-slate-300'}`}
                        >
                          60 (Perenes/Café/Citros)
                        </button>
                        <button
                          type="button"
                          onClick={() => setGypsumClayFactor(35)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${gypsumClayFactor === 35 ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-slate-300'}`}
                        >
                          35 (Pastagem / Cana)
                        </button>
                        <button
                          type="button"
                          onClick={() => setGypsumClayFactor(28)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${gypsumClayFactor === 28 ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-slate-300'}`}
                        >
                          28 (Subtropical / IAC)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedGypsumMethod === 'demate' && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2 border-slate-200 dark:border-zinc-800">
                    <strong className="text-xs font-bold text-slate-900 dark:text-white">
                      Parâmetros: Método Dematê (Raij & Dematê 1988/1991)
                    </strong>
                    <span className="text-[11px] text-teal-700 dark:text-teal-400 font-bold">
                      NG (kg/ha) = (V% alvo - V% atual) × CTC × 10
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">V% Alvo em Subsuperfície (%):</label>
                      <input
                        type="number"
                        step="5"
                        value={demateTargetV}
                        onChange={e => setDemateTargetV(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full p-2.5 bg-white dark:bg-black border rounded-lg font-bold text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="p-2.5 bg-white dark:bg-black rounded-lg border border-slate-200 dark:border-zinc-800">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">V% Subsolo Atual</span>
                      <strong className="text-sm font-black text-slate-800 dark:text-slate-200">{gessagemResult.subsoilV.toFixed(1)}%</strong>
                    </div>

                    <div className="p-2.5 bg-white dark:bg-black rounded-lg border border-slate-200 dark:border-zinc-800">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">CTC pH 7,0 Subsolo</span>
                      <strong className="text-sm font-black text-slate-800 dark:text-slate-200">{gessagemResult.subsoilCtc.toFixed(2)} cmol_c/dm³</strong>
                    </div>
                  </div>
                </div>
              )}

              {selectedGypsumMethod === 'caires_guimaraes' && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2 border-slate-200 dark:border-zinc-800">
                    <strong className="text-xs font-bold text-slate-900 dark:text-white">
                      Parâmetros: Método Caires & Guimarães (2018)
                    </strong>
                    <span className="text-[11px] text-teal-700 dark:text-teal-400 font-bold">
                      NG (kg/ha) = (Ca% alvo - Ca% atual) × CTC × 5
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Ca% Alvo na CTC Subsolo (%):</label>
                      <input
                        type="number"
                        step="5"
                        value={cairesTargetCa}
                        onChange={e => setCairesTargetCa(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full p-2.5 bg-white dark:bg-black border rounded-lg font-bold text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="p-2.5 bg-white dark:bg-black rounded-lg border border-slate-200 dark:border-zinc-800">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Ca% Subsolo Atual</span>
                      <strong className="text-sm font-black text-slate-800 dark:text-slate-200">{gessagemResult.subsoilCaPct.toFixed(1)}%</strong>
                    </div>

                    <div className="p-2.5 bg-white dark:bg-black rounded-lg border border-slate-200 dark:border-zinc-800">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">CTC pH 7,0 Subsolo</span>
                      <strong className="text-sm font-black text-slate-800 dark:text-slate-200">{gessagemResult.subsoilCtc != null ? gessagemResult.subsoilCtc.toFixed(2) : '0.00'} cmol_c/dm³</strong>
                    </div>
                  </div>
                </div>
              )}

              {selectedGypsumMethod === 'boletim_100' && (
                <div className="space-y-2">
                  <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                    Parâmetros: Boletim 100 IAC (Raij et al. 1997)
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                    Fórmula oficial do Instituto Agronômico de Campinas (IAC): <strong>NG (kg/ha) = 60 × % Argila</strong>. Para o teor de argila do laudo ({gessagemResult.subsoilClay}%), resulta em {(gessagemResult.comparison?.boletim100?.kg ?? 0).toLocaleString('pt-BR')} kg/ha ({gessagemResult.comparison?.boletim100?.ton ?? 0} t/ha).
                  </p>
                </div>
              )}

              {selectedGypsumMethod === 'classe_textural' && (
                <div className="space-y-2">
                  <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                    Parâmetros: Recomendação por Classe Textural do Solo
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                    Classificação baseada em faixas fixas de textura: <strong>Arenosa (&lt;15% Argila) = 1,0 t/ha</strong> | <strong>Média (16-35% Argila) = 2,0 t/ha</strong> | <strong>Argilosa (36-60% Argila) = 3,0 t/ha</strong> | <strong>Muito Argilosa (&gt;60% Argila) = 4,0 t/ha</strong>.
                  </p>
                  <span className="inline-block px-3 py-1 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold rounded-lg text-xs">
                    Classe Detectada: {gessagemResult.textClassLabel} → Dose: {gessagemResult.comparison?.classeTextural?.ton ?? 0} t/ha
                  </span>
                </div>
              )}
            </div>

            {/* Quadro Comparativo das 5 Metodologias em Tempo Real */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <strong className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  📊 Quadro Comparativo dos 5 Métodos de Gessagem
                </strong>
                <span className="text-[10px] text-slate-500 font-medium">Clique em qualquer método para ativá-lo</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {Object.entries(gessagemResult.comparison || {}).map(([key, rawItem]) => {
                  const item = rawItem as { id: string; name: string; ton: number; kg: number; desc: string };
                  const isActive = selectedGypsumMethod === item.id;
                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedGypsumMethod(item.id as any)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${isActive ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-500 dark:border-teal-600 shadow-xs ring-1 ring-teal-500' : 'bg-white dark:bg-black border-slate-200 dark:border-zinc-800 hover:border-teal-300'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 block truncate">{item.name}</span>
                        {isActive && (
                          <span className="px-1.5 py-0.5 bg-teal-600 text-white text-[8px] font-black uppercase rounded">Ativo</span>
                        )}
                      </div>

                      <div>
                        <strong className="text-xl font-black text-teal-700 dark:text-teal-400 block">
                          {(item.ton ?? 0).toLocaleString('pt-BR')} t/ha
                        </strong>
                        <span className="text-[10px] text-slate-500 font-medium">({(item.kg ?? 0).toLocaleString('pt-BR')} kg/ha)</span>
                      </div>

                      <p className="text-[10px] text-slate-500 leading-tight border-t pt-1.5 border-slate-100 dark:border-zinc-800">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Painel Final de Recomendação e Instruções Operacionais */}
            <div className="p-5 bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900 rounded-2xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white dark:bg-black rounded-xl border border-teal-200 dark:border-teal-900/60">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Dose Ativa do Laudo</span>
                  <strong className="text-2xl text-teal-600 font-black">{gessagemResult.ngTonHa} t/ha</strong>
                  <span className="text-[10px] text-slate-500 block">({(gessagemResult.ngKgHa ?? 0).toLocaleString('pt-BR')} kg/ha)</span>
                </div>

                <div className="p-3 bg-white dark:bg-black rounded-xl border border-teal-200 dark:border-teal-900/60">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Camada Alvo Efetiva</span>
                  <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{gessagemResult.effectiveDepth}</strong>
                </div>

                <div className="p-3 bg-white dark:bg-black rounded-xl border border-teal-200 dark:border-teal-900/60">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Forma de Aplicação</span>
                  <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{gessagemResult.applicationMethod}</strong>
                </div>
              </div>

              {/* Justificativa / Gatilhos TÉCNICOS */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-teal-900 dark:text-teal-200 block">
                  💡 Diagnóstico Agronômico do Subsolo ({gessagemResult.subsoilClay}% Argila):
                </span>
                {(gessagemResult?.criteriaTriggered || []).length > 0 ? (
                  <ul className="list-disc list-inside space-y-0.5 text-teal-800 dark:text-teal-300 text-[11px] font-medium pl-1">
                    {gessagemResult.criteriaTriggered.map((crit, idx) => (
                      <li key={idx}>{crit}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-emerald-700 dark:text-emerald-400 text-[11px] font-medium">
                    O subsolo apresenta níveis adequados de Cálcio e Enxofre, sem barreira química de Alumínio tóxico.
                  </p>
                )}
              </div>

              {/* Observações Técnicas */}
              <div className="mt-3 pt-3 border-t border-teal-200/50 dark:border-teal-900/30">
                <label className="font-bold text-[10px] text-teal-800 dark:text-teal-400 block mb-1 uppercase tracking-wider">
                  Observações Técnicas / Restrições (Gessagem)
                </label>
                <textarea
                  value={gypsumObservation}
                  onChange={e => setGypsumObservation(e.target.value)}
                  placeholder="Ex: Aplicar gesso agrícola a lanço sem necessidade de incorporação. Pode ser aplicado junto com calcário se necessário..."
                  className="w-full p-2.5 bg-white dark:bg-zinc-950 border border-teal-200 dark:border-teal-900/50 rounded-lg text-xs min-h-[60px]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. ADUBAÇÃO ORGÂNICA                                      */}
      {/* ========================================================= */}
      {activeTab === 'adubacao_organica' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-6 text-xs">
            <div className="border-b pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Manejo & Adubação Orgânica
              </h3>
              <p className="text-xs text-slate-500">
                Seleção de compostos, estercos e biofertilizantes com taxa de mineralização no 1º ano.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold">Fonte Orgânica:</label>
                <select
                  value={selectedOrganicId}
                  onChange={e => {
                    const newId = e.target.value;
                    setSelectedOrganicId(newId);
                    const source = ORGANIC_FERTILIZERS_CATALOG.find(o => o.id === newId);
                    if (source && source.defaultDoseTonHa !== undefined) {
                      setOrganicDoseTonHa(source.defaultDoseTonHa);
                    }
                  }}
                  className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border rounded-lg font-bold"
                >
                  {ORGANIC_FERTILIZERS_CATALOG.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.name} {o.id !== 'org-nenhum' ? `(N: ${o.nPercent}%, P₂O₅: ${o.p2o5Percent}%, K₂O: ${o.k2oPercent}%)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold">Dose Aplicada (t/ha) (Automático):</label>
                <input
                  type="number"
                  step="0.5"
                  value={organicDoseTonHa}
                  onChange={e => setOrganicDoseTonHa(e.target.value === '' ? '' : Number(e.target.value))}
                  disabled={selectedOrganicId !== 'org-personalizado'}
                  className={`w-full p-2 border rounded-lg font-bold ${selectedOrganicId !== 'org-personalizado' ? 'bg-slate-200 dark:bg-zinc-800 text-slate-500 cursor-not-allowed' : 'bg-slate-50 dark:bg-zinc-900'}`}
                />
              </div>
            </div>

            {selectedOrganicId === 'org-personalizado' && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-slate-100 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700">
                <div className="space-y-1 sm:col-span-1">
                  <label className="font-bold text-xs">Nome da Fonte:</label>
                  <input
                    type="text"
                    value={customOrganicName}
                    onChange={e => setCustomOrganicName(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-zinc-900 border rounded-lg font-bold text-sm"
                    placeholder="Ex: Composto Especial"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-xs">Garantia N (%):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customOrganicN}
                    onChange={e => setCustomOrganicN(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2 bg-white dark:bg-zinc-900 border rounded-lg font-bold text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-xs">Garantia P₂O₅ (%):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customOrganicP}
                    onChange={e => setCustomOrganicP(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2 bg-white dark:bg-zinc-900 border rounded-lg font-bold text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-xs">Garantia K₂O (%):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customOrganicK}
                    onChange={e => setCustomOrganicK(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2 bg-white dark:bg-zinc-900 border rounded-lg font-bold text-sm"
                  />
                </div>
              </div>
            )}

            {/* Nutrients provided */}
            <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-2xl space-y-3">
              <strong className="text-sm font-black text-emerald-900 dark:text-emerald-300 block">
                Nutrientes Efetivamente Fornecidos no 1º Ano (Mineralizados):
              </strong>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 bg-white dark:bg-black rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-bold">Nitrogênio (N)</span>
                  <strong className="text-lg text-emerald-600 font-black">{organicNutrientSupply.kgN} kg/ha</strong>
                </div>
                <div className="p-3 bg-white dark:bg-black rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-bold">Fósforo (P₂O₅)</span>
                  <strong className="text-lg text-emerald-600 font-black">{organicNutrientSupply.kgP2O5} kg/ha</strong>
                </div>
                <div className="p-3 bg-white dark:bg-black rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-bold">Potássio (K₂O)</span>
                  <strong className="text-lg text-emerald-600 font-black">{organicNutrientSupply.kgK2O} kg/ha</strong>
                </div>
                <div className="p-3 bg-white dark:bg-black rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-bold">Cálcio (Ca)</span>
                  <strong className="text-lg text-slate-900 dark:text-white font-black">{organicNutrientSupply.kgCa} kg/ha</strong>
                </div>
                <div className="p-3 bg-white dark:bg-black rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-bold">Custo Orgânico</span>
                  <strong className="text-lg text-amber-600 font-black">R$ {organicNutrientSupply.totalCostR}/ha</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. ADUBAÇÃO DE PLANTIO & COBERTURA                        */}
      {/* ========================================================= */}
      {(activeTab === 'adubacao_plantio' || activeTab === 'adubacao_cobertura') && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Cultura da Amostra & Boletim Regional Integrado */}
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-600" />
                <strong className="font-black text-base text-slate-900 dark:text-white">
                  Cultura da Amostra &amp; Boletim Regional Integrado
                </strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCropSearchQuery('');
                    setIsCropSelectorModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Escolher Cultura</span>
                </button>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {currentBulletin.code} • {currentBulletin.region}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/80 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-300 block font-bold uppercase tracking-wider">Cultura Ativa</span>
                  <strong className="text-sm text-slate-900 dark:text-white font-black block mt-0.5">
                    {selectedPlantingCropRec?.cropName || currentSoil?.cropName || 'Soja'} {selectedPlantingCropRec?.scientificName ? `(${selectedPlantingCropRec.scientificName})` : ''}
                  </strong>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 block mt-0.5">
                    Talhão: <strong>{currentSoil?.fieldPlot || 'Geral'}</strong> ({currentSoil?.areaHa || 50} ha)
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Boletim Técnico Ativo</span>
                <strong className="text-sm text-emerald-700 dark:text-emerald-400 font-black block mt-0.5 truncate" title={currentBulletin.name}>
                  {currentBulletin.name}
                </strong>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Método P: <strong>{currentBulletin.phosphorusMethod}</strong> • V% Alvo: <strong>{currentBulletin.targetVByCrop[currentSoil.cropName.toLowerCase()] || currentBulletin.targetVByCrop['soja'] || 65}%</strong>
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Meta de Produtividade Base</span>
                <strong className="text-sm text-teal-700 dark:text-teal-400 font-black block mt-0.5">
                  {selectedPlantingCropRec.expectedYieldDefault || 75} {selectedPlantingCropRec.yieldUnit || 'sc/ha'}
                </strong>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Fórmula Padrão: <strong>{selectedPlantingCropRec.recommendedFormulationId.toUpperCase()}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Espaçamento e População de Plantas */}
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-zinc-800">
              <strong className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>📏</span> Espaçamento e População de Plantas
              </strong>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-black px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 rounded-full border border-emerald-200 dark:border-emerald-800">
                Estande Calculado
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-xs text-slate-800 dark:text-slate-200">Espaçamento entre Linhas (m):</label>
                <input
                  type="number"
                  step="0.05"
                  value={rowSpacingM}
                  onChange={e => setRowSpacingM(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-lg font-bold text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-800 dark:text-slate-200">Arranjo de Plantas:</label>
                  <div className="flex gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setPlantSpacingMode('per_meter')}
                      className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${plantSpacingMode === 'per_meter' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-slate-300'}`}
                    >
                      Plantas/m
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlantSpacingMode('plant_distance')}
                      className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${plantSpacingMode === 'plant_distance' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-slate-300'}`}
                    >
                      Distância (m)
                    </button>
                  </div>
                </div>

                {plantSpacingMode === 'per_meter' ? (
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Ex: 12 plantas por metro"
                    value={plantsPerMeter}
                    onChange={e => setPlantsPerMeter(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-lg font-bold text-xs text-slate-900 dark:text-white"
                  />
                ) : (
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 0.18 m entre plantas"
                    value={plantSpacingM}
                    onChange={e => setPlantSpacingM(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-lg font-bold text-xs text-slate-900 dark:text-white"
                  />
                )}
              </div>
            </div>

            {/* Calculated Population Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center pt-1">
              <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">População / ha</span>
                <strong className="text-sm text-emerald-700 dark:text-emerald-400 font-black">
                  {calculatedPopulationHa.toLocaleString('pt-BR')} plantas
                </strong>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">População Total ({currentSoil?.areaHa || 50} ha)</span>
                <strong className="text-sm text-teal-700 dark:text-teal-400 font-black">
                  {totalFieldPopulation.toLocaleString('pt-BR')} plantas
                </strong>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Metros Sulco / ha</span>
                <strong className="text-sm text-indigo-700 dark:text-indigo-400 font-black">
                  {furrowMetersHa.toLocaleString('pt-BR')} m/ha
                </strong>
              </div>
            </div>
          </div>

          {/* Exigências Nutricionais e Parâmetros */}
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-slate-200 dark:border-zinc-800">
              <strong className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-600" /> Parâmetros e Exigências da Cultura
              </strong>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCropSearchQuery('');
                    setIsCropSelectorModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Escolher Cultura ({CROP_PLANTING_RECOMMENDATIONS.length})</span>
                </button>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Parâmetros Agronômicos
                </span>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 1. SELETOR DE BOLETIM TÉCNICO REGIONAL INTEGRADO (ACIMA)  */}
            {/* ========================================================= */}
            <div className="p-4 bg-emerald-950/20 dark:bg-emerald-950/60 rounded-2xl border-2 border-emerald-500/40 dark:border-emerald-600/50 space-y-2.5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-black text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Boletim Técnico Regional Integrado (Tabela de Calibração Oficial):</span>
                </label>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setShowBulletinTableDetails(!showBulletinTableDetails)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 border ${
                      showBulletinTableDetails
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                        : 'bg-white/90 dark:bg-zinc-900/90 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900'
                    }`}
                    title="Visualizar Níveis Críticos e Parâmetros Regionais do Boletim"
                  >
                    <Table className="w-3 h-3" />
                    <span>{showBulletinTableDetails ? 'Ocultar Tabelas de Interpretação' : 'Ver Tabelas de Interpretação'}</span>
                    {showBulletinTableDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  <span className="text-[10px] font-extrabold text-emerald-900 dark:text-emerald-200 bg-emerald-200/90 dark:bg-emerald-900/80 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                    {currentBulletin.region} • {currentBulletin.institution}
                  </span>
                </div>
              </div>

              <select
                value={selectedBulletinId}
                onChange={e => handleSelectBulletin(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-zinc-900 border-2 border-emerald-500 dark:border-emerald-600 rounded-xl font-bold text-xs text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs"
              >
                <optgroup label="🏛️ Diretrizes &amp; Boletins Regionais Oficiais" className="bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-extrabold">
                  {allBulletins.filter(b => !b.id.startsWith('padrao-lab-') && !b.code.startsWith('LAB-')).map(b => (
                    <option key={b.id} value={b.id} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-bold py-1">
                      {b.code} - {b.name} ({b.region}) • {b.institution}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🧪 Padrões Laboratoriais de Análise de Solo" className="bg-slate-100 dark:bg-zinc-900 text-purple-800 dark:text-purple-300 font-extrabold">
                  {allBulletins.filter(b => b.id.startsWith('padrao-lab-') || b.code.startsWith('LAB-')).map(b => (
                    <option key={b.id} value={b.id} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-bold py-1">
                      {b.code} - {b.name} ({b.region}) • {b.institution}
                    </option>
                  ))}
                </optgroup>
              </select>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-emerald-950 dark:text-emerald-200 pt-1 font-semibold">
                <div className="p-1.5 bg-white/70 dark:bg-zinc-900/70 rounded-lg border border-emerald-200 dark:border-emerald-800 text-center">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-normal">Método P</span>
                  <strong className="text-emerald-800 dark:text-emerald-300 font-black">{currentBulletin.phosphorusMethod}</strong>
                </div>
                <div className="p-1.5 bg-white/70 dark:bg-zinc-900/70 rounded-lg border border-emerald-200 dark:border-emerald-800 text-center">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-normal">V% Alvo da Cultura</span>
                  <strong className="text-teal-800 dark:text-teal-300 font-black">
                    {currentBulletin.targetVByCrop?.[(selectedPlantingCropRec?.cropName || currentSoil?.cropName || '').toLowerCase()] || currentBulletin.targetVByCrop?.['soja'] || 65}%
                  </strong>
                </div>
                <div className="p-1.5 bg-white/70 dark:bg-zinc-900/70 rounded-lg border border-emerald-200 dark:border-emerald-800 text-center">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-normal">Fator Gessagem</span>
                  <strong className="text-indigo-800 dark:text-indigo-300 font-black">{currentBulletin.gypsumFactor} × Argila%</strong>
                </div>
                <div className="p-1.5 bg-white/70 dark:bg-zinc-900/70 rounded-lg border border-emerald-200 dark:border-emerald-800 text-center truncate" title={currentBulletin.name}>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-normal">Referência</span>
                  <strong className="text-slate-800 dark:text-zinc-200 font-black truncate block">{currentBulletin.name}</strong>
                </div>
              </div>
            </div>

            {/* EXPANDABLE BULLETIN INTERPRETATION & CALIBRATION TABLES */}
            {showBulletinTableDetails && (
              <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-300 dark:border-emerald-700 space-y-3 shadow-2xs animate-fade-in">
                <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <Table className="w-4 h-4 text-emerald-600" />
                    <strong className="text-xs font-black text-slate-900 dark:text-white">
                      Tabelas de Interpretação e Níveis Críticos Oficiais ({currentBulletin.name})
                    </strong>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {currentBulletin.region} • {currentBulletin.institution}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px]">
                  {/* 1. Tabela de Fósforo por Textura */}
                  <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-1.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      📊 Níveis de Fósforo (P {currentBulletin.phosphorusMethod} - mg/dm³):
                    </span>
                    <div className="grid grid-cols-4 gap-1 text-center text-[9px]">
                      <div className="p-1 bg-rose-50 dark:bg-rose-950/40 rounded border border-rose-200 dark:border-rose-900">
                        <span className="text-slate-500 block">M. Baixo</span>
                        <strong className="text-rose-700 dark:text-rose-300">
                          &lt; {(currentBulletin.pCriticalLevels.clayey?.low || 10) * 0.5}
                        </strong>
                      </div>
                      <div className="p-1 bg-amber-50 dark:bg-amber-950/40 rounded border border-amber-200 dark:border-amber-900">
                        <span className="text-slate-500 block">Baixo</span>
                        <strong className="text-amber-700 dark:text-amber-300">
                          {currentBulletin.pCriticalLevels.clayey?.low || 10}
                        </strong>
                      </div>
                      <div className="p-1 bg-blue-50 dark:bg-blue-950/40 rounded border border-blue-200 dark:border-blue-900">
                        <span className="text-slate-500 block">Médio</span>
                        <strong className="text-blue-700 dark:text-blue-300">
                          {currentBulletin.pCriticalLevels.clayey?.medium || 20}
                        </strong>
                      </div>
                      <div className="p-1 bg-emerald-50 dark:bg-emerald-950/40 rounded border border-emerald-200 dark:border-emerald-900">
                        <span className="text-slate-500 block">Bom/Alto</span>
                        <strong className="text-emerald-700 dark:text-emerald-300">
                          &ge; {currentBulletin.pCriticalLevels.clayey?.good || 30}
                        </strong>
                      </div>
                    </div>
                    <span className="text-[8px] text-slate-500 block">
                      Textura de referência: Argilosa (35-60% argila) conforme metodologia regional.
                    </span>
                  </div>

                  {/* 2. Tabela de Potássio */}
                  <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-1.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      📊 Níveis de Potássio (K - cmol_c/dm³):
                    </span>
                    <div className="grid grid-cols-4 gap-1 text-center text-[9px]">
                      <div className="p-1 bg-rose-50 dark:bg-rose-950/40 rounded border border-rose-200 dark:border-rose-900">
                        <span className="text-slate-500 block">M. Baixo</span>
                        <strong className="text-rose-700 dark:text-rose-300">
                          &lt; {currentBulletin.kCriticalLevels.low}
                        </strong>
                      </div>
                      <div className="p-1 bg-amber-50 dark:bg-amber-950/40 rounded border border-amber-200 dark:border-amber-900">
                        <span className="text-slate-500 block">Baixo</span>
                        <strong className="text-amber-700 dark:text-amber-300">
                          {currentBulletin.kCriticalLevels.low}
                        </strong>
                      </div>
                      <div className="p-1 bg-blue-50 dark:bg-blue-950/40 rounded border border-blue-200 dark:border-blue-900">
                        <span className="text-slate-500 block">Médio</span>
                        <strong className="text-blue-700 dark:text-blue-300">
                          {currentBulletin.kCriticalLevels.medium}
                        </strong>
                      </div>
                      <div className="p-1 bg-emerald-50 dark:bg-emerald-950/40 rounded border border-emerald-200 dark:border-emerald-900">
                        <span className="text-slate-500 block">Bom/Alto</span>
                        <strong className="text-emerald-700 dark:text-emerald-300">
                          &ge; {currentBulletin.kCriticalLevels.good}
                        </strong>
                      </div>
                    </div>
                    <span className="text-[8px] text-slate-500 block">
                      Fator de suficiência K: {((currentBulletin.kCriticalLevels.good || 0.30) * 391).toFixed(0)} mg/dm³.
                    </span>
                  </div>

                  {/* 3. Saturação por Bases Alvo (V%) por Cultura */}
                  <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-1.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      🎯 Saturação por Bases (V% Alvo) pelo Boletim:
                    </span>
                    <div className="grid grid-cols-4 gap-1 text-center text-[9px]">
                      <div className="p-1 bg-white dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800">
                        <span className="text-slate-500 block">Soja</span>
                        <strong className="text-emerald-700 dark:text-emerald-400 font-black">
                          {currentBulletin.targetVByCrop['soja'] || 65}%
                        </strong>
                      </div>
                      <div className="p-1 bg-white dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800">
                        <span className="text-slate-500 block">Milho</span>
                        <strong className="text-emerald-700 dark:text-emerald-400 font-black">
                          {currentBulletin.targetVByCrop['milho'] || 70}%
                        </strong>
                      </div>
                      <div className="p-1 bg-white dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800">
                        <span className="text-slate-500 block">Café</span>
                        <strong className="text-emerald-700 dark:text-emerald-400 font-black">
                          {currentBulletin.targetVByCrop['cafe'] || 65}%
                        </strong>
                      </div>
                      <div className="p-1 bg-white dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800">
                        <span className="text-slate-500 block">Algodão</span>
                        <strong className="text-emerald-700 dark:text-emerald-400 font-black">
                          {currentBulletin.targetVByCrop['algodao'] || 70}%
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* 4. Parâmetros Complementares do Solo */}
                  <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-1.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      🧪 Parâmetros Regionais de Calagem & Solo:
                    </span>
                    <div className="grid grid-cols-3 gap-1 text-center text-[9px]">
                      <div className="p-1 bg-white dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800">
                        <span className="text-slate-500 block">Al Tolerável</span>
                        <strong className="text-indigo-700 dark:text-indigo-400 font-bold">
                          &le; {currentBulletin.tolerableAlSaturation || 15}%
                        </strong>
                      </div>
                      <div className="p-1 bg-white dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800">
                        <span className="text-slate-500 block">Método Calagem</span>
                        <strong className="text-indigo-700 dark:text-indigo-400 font-bold">
                          {currentBulletin.limingMethod === 'base_saturation' ? 'Saturação Bases' : 'Alumínio + Ca/Mg'}
                        </strong>
                      </div>
                      <div className="p-1 bg-white dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800">
                        <span className="text-slate-500 block">Gessagem</span>
                        <strong className="text-indigo-700 dark:text-indigo-400 font-bold">
                          {currentBulletin.gypsumFactor} × Argila
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 2. SELETOR DIRETO DE CULTURA (ABAIXO DO BOLETIM)           */}
            {/* ========================================================= */}
            <div className="p-4 bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/90 dark:from-emerald-950/50 dark:via-zinc-900/80 dark:to-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌾</span>
                    <label className="text-xs font-black text-emerald-950 dark:text-emerald-200 uppercase tracking-wide">
                      Escolher Cultura para Recomendação:
                    </label>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 rounded-full">
                      Boletins Oficiais do Sistema
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-400 mt-0.5 font-medium">
                    Selecione a cultura abaixo para recalcular automaticamente as exigências nutricionais, fórmulas e doses oficiais dos boletins.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCropSearchQuery('');
                    setIsCropSelectorModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all whitespace-nowrap self-start md:self-auto"
                >
                  <Search className="w-4 h-4" />
                  <span>Catálogo de Culturas</span>
                </button>
              </div>

              {/* Quick Select & Crop Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-center">
                <div className="lg:col-span-7">
                  <select
                    value={selectedPlantingCropId}
                    onChange={e => handleSelectPlantingCrop(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-zinc-950 border-2 border-emerald-400 dark:border-emerald-700 rounded-xl font-black text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
                  >
                    {CROP_PLANTING_RECOMMENDATIONS.map(c => {
                      const cal = getBulletinCalibratedCropParameters(c, currentBulletin, currentSoil);
                      return (
                        <option key={c.cropId} value={c.cropId}>
                          {c.cropName} {c.scientificName ? `(${c.scientificName})` : ''} — Ref: {currentBulletin.code} (V% Alvo: {cal.targetV}%)
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="lg:col-span-5 grid grid-cols-2 gap-2">
                  <div className="p-2 bg-white/95 dark:bg-zinc-900/90 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Fórmula Base:</span>
                    <strong className="text-emerald-700 dark:text-emerald-300 font-black">
                      {selectedPlantingCropRec.recommendedFormulationId.toUpperCase()}
                    </strong>
                  </div>
                  <div className="p-2 bg-white/95 dark:bg-zinc-900/90 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Dose Oficial:</span>
                    <strong className="text-teal-700 dark:text-teal-300 font-black">
                      {selectedPlantingCropRec.defaultPlantingDoseKgHa} kg/ha
                    </strong>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 1. Crop Recommendation Info Box - Interactive Method Choice (Boletim, Extração/Exportação, Personalizado) */}
                {selectedPlantingCropRec && (
                  <div className="p-4 bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-4">
                    {/* Header & Method Switcher Tabs */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-emerald-200 dark:border-emerald-800">
                      <div>
                        <span className="font-black text-xs text-emerald-950 dark:text-emerald-200 block">
                          Parâmetros da Cultura: {selectedPlantingCropRec.cropName}
                        </span>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block">
                          {activeCropDemands.methodLabel} • {activeCropDemands.bulletinReference}
                        </span>
                      </div>

                      {/* Method Selector Pills */}
                      <div className="flex items-center gap-1 bg-emerald-100/90 dark:bg-emerald-900/60 p-1 rounded-lg border border-emerald-200 dark:border-emerald-800 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setCropRecommendationMethod('boletim')}
                          className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                            cropRecommendationMethod === 'boletim'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'text-emerald-950 dark:text-emerald-200 hover:bg-emerald-200/50 dark:hover:bg-emerald-800/50'
                          }`}
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>1. Via Boletim</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCropRecommendationMethod('extracao')}
                          className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                            cropRecommendationMethod === 'extracao'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'text-emerald-950 dark:text-emerald-200 hover:bg-emerald-200/50 dark:hover:bg-emerald-800/50'
                          }`}
                        >
                          <TrendingUp className="w-3 h-3" />
                          <span>2. Extração & Exportação</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCropRecommendationMethod('personalizado')}
                          className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                            cropRecommendationMethod === 'personalizado'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'text-emerald-950 dark:text-emerald-200 hover:bg-emerald-200/50 dark:hover:bg-emerald-800/50'
                          }`}
                        >
                          <Sliders className="w-3 h-3" />
                          <span>3. Personalizado</span>
                        </button>
                      </div>
                    </div>

                    {/* OPTION 1: VIA BOLETIM OFICIAL E TABELAS DO SISTEMA */}
                    {cropRecommendationMethod === 'boletim' && (
                      <div className="space-y-3.5">
                        {/* Header & Quick Action Buttons */}
                        <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-emerald-950 dark:text-emerald-200 bg-white/80 dark:bg-zinc-900/80 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-xs text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                              📋 Tabelas Oficiais do Boletim Agronômico ({selectedPlantingCropRec.bulletinReference || currentBulletin.name}):
                            </span>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                              {currentBulletin.code}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setShowBulletinTableDetails(!showBulletinTableDetails)}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 border ${
                                showBulletinTableDetails
                                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900'
                              }`}
                              title="Visualizar Níveis Críticos e Parâmetros Regionais do Boletim"
                            >
                              <Table className="w-3.5 h-3.5" />
                              <span>{showBulletinTableDetails ? 'Ocultar Parâmetros' : 'Ver Tabelas de Interpretação'}</span>
                              {showBulletinTableDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleApplyPlantingCropRecommendation(selectedPlantingCropRec)}
                              className="text-[10px] font-bold px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-md transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Aplicar Recomendação</span>
                            </button>
                          </div>
                        </div>

                        {/* Macronutrientes Table */}
                        <div>
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                            Exigência de Macronutrientes da Tabela Oficial (kg/ha):
                          </span>
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center">
                            <div className="p-1.5 bg-white dark:bg-zinc-900 rounded-lg border border-emerald-100 dark:border-emerald-900">
                              <span className="text-[8px] text-slate-500 block font-bold">N</span>
                              <strong className="text-xs text-emerald-700 dark:text-emerald-400 font-black">
                                {activeCropDemands.n} kg/ha
                              </strong>
                            </div>
                            <div className="p-1.5 bg-white dark:bg-zinc-900 rounded-lg border border-emerald-100 dark:border-emerald-900">
                              <span className="text-[8px] text-slate-500 block font-bold">P₂O₅</span>
                              <strong className="text-xs text-teal-700 dark:text-teal-400 font-black">
                                {activeCropDemands.p2o5} kg/ha
                              </strong>
                            </div>
                            <div className="p-1.5 bg-white dark:bg-zinc-900 rounded-lg border border-emerald-100 dark:border-emerald-900">
                              <span className="text-[8px] text-slate-500 block font-bold">K₂O</span>
                              <strong className="text-xs text-cyan-700 dark:text-cyan-400 font-black">
                                {activeCropDemands.k2o} kg/ha
                              </strong>
                            </div>
                            <div className="p-1.5 bg-white dark:bg-zinc-900 rounded-lg border border-emerald-100 dark:border-emerald-900">
                              <span className="text-[8px] text-slate-500 block font-bold">Ca</span>
                              <strong className="text-xs text-slate-800 dark:text-slate-200 font-black">
                                {activeCropDemands.ca} kg/ha
                              </strong>
                            </div>
                            <div className="p-1.5 bg-white dark:bg-zinc-900 rounded-lg border border-emerald-100 dark:border-emerald-900">
                              <span className="text-[8px] text-slate-500 block font-bold">Mg</span>
                              <strong className="text-xs text-slate-800 dark:text-slate-200 font-black">
                                {activeCropDemands.mg} kg/ha
                              </strong>
                            </div>
                            <div className="p-1.5 bg-white dark:bg-zinc-900 rounded-lg border border-emerald-100 dark:border-emerald-900">
                              <span className="text-[8px] text-slate-500 block font-bold">S</span>
                              <strong className="text-xs text-amber-700 dark:text-amber-400 font-black">
                                {activeCropDemands.s} kg/ha
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* Micronutrientes Table */}
                        <div>
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                            Exigência de Micronutrientes da Tabela Oficial (g/ha):
                          </span>
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center">
                            <div className="p-1 bg-white dark:bg-zinc-900 rounded-md border border-emerald-100 dark:border-emerald-900">
                              <span className="text-[8px] text-slate-400 block font-bold">Boro (B)</span>
                              <strong className="text-[11px] text-emerald-800 dark:text-emerald-300 font-black">
                                {activeCropDemands.b} g
                              </strong>
                            </div>
                            <div className="p-1 bg-white dark:bg-zinc-900 rounded-md border border-emerald-100 dark:border-emerald-900">
                              <span className="text-[8px] text-slate-400 block font-bold">Cobre (Cu)</span>
                              <strong className="text-[11px] text-emerald-800 dark:text-emerald-300 font-black">
                                {activeCropDemands.cu} g
                              </strong>
                            </div>
                            <div className="p-1 bg-white dark:bg-zinc-900 rounded-md border border-emerald-100 dark:border-emerald-900">
                              <span className="text-[8px] text-slate-400 block font-bold">Ferro (Fe)</span>
                              <strong className="text-[11px] text-emerald-800 dark:text-emerald-300 font-black">
                                {activeCropDemands.fe} g
                              </strong>
                            </div>
                            <div className="p-1 bg-white dark:bg-zinc-900 rounded-md border border-emerald-100 dark:border-emerald-900">
                              <span className="text-[8px] text-slate-400 block font-bold">Manganês (Mn)</span>
                              <strong className="text-[11px] text-emerald-800 dark:text-emerald-300 font-black">
                                {activeCropDemands.mn} g
                              </strong>
                            </div>
                            <div className="p-1 bg-white dark:bg-zinc-900 rounded-md border border-emerald-100 dark:border-emerald-900">
                              <span className="text-[8px] text-slate-400 block font-bold">Molibdênio (Mo)</span>
                              <strong className="text-[11px] text-emerald-800 dark:text-emerald-300 font-black">
                                {activeCropDemands.mo} g
                              </strong>
                            </div>
                            <div className="p-1 bg-white dark:bg-zinc-900 rounded-md border border-emerald-100 dark:border-emerald-900">
                              <span className="text-[8px] text-slate-400 block font-bold">Zinco (Zn)</span>
                              <strong className="text-[11px] text-emerald-800 dark:text-emerald-300 font-black">
                                {activeCropDemands.zn} g
                              </strong>
                            </div>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed italic border-t border-emerald-200/60 dark:border-emerald-800/60 pt-2">
                          💡 <strong>Diretriz Agronômica Oficial:</strong> {selectedPlantingCropRec.observation}
                        </p>
                      </div>
                    )}

                    {/* OPTION 2: VIA EXTRAÇÃO E EXPORTAÇÃO */}
                    {cropRecommendationMethod === 'extracao' && (
                      <div className="space-y-3">
                        <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <label className="font-bold text-xs text-slate-800 dark:text-slate-200">
                                Meta de Produtividade Esperada:
                              </label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={extractionExpectedYield}
                                  onChange={e => setExtractionExpectedYield(e.target.value === '' ? '' : Number(e.target.value))}
                                  className="w-24 p-1.5 bg-slate-50 dark:bg-black border border-emerald-300 dark:border-emerald-700 rounded font-black text-xs text-emerald-700 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 text-center"
                                />
                                <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                                  {selectedPlantingCropRec.yieldUnit || 'sc/ha'}
                                </span>
                              </div>
                            </div>

                            {/* Mode Selector: Extração Total vs Exportação Grão */}
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg">
                              <button
                                type="button"
                                onClick={() => setExtractionMode('extracao')}
                                className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${
                                  extractionMode === 'extracao' ? 'bg-emerald-600 text-white' : 'text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                🌱 Extração Total (Planta Inteira)
                              </button>
                              <button
                                type="button"
                                onClick={() => setExtractionMode('exportacao')}
                                className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${
                                  extractionMode === 'exportacao' ? 'bg-emerald-600 text-white' : 'text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                🌾 Exportação (Grãos/Frutos)
                              </button>
                            </div>
                          </div>

                          {/* Editable Coefficients Table / Calculation Breakdown */}
                          <div>
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                              Coeficientes de Remoção (kg do nutriente por {selectedPlantingCropRec.yieldUnit || 'unidade produzida'}):
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                              <div className="p-2 bg-slate-50 dark:bg-black rounded-lg border border-slate-200 dark:border-zinc-800">
                                <label className="text-[9px] font-bold text-slate-500 block mb-0.5">N (kg/{selectedPlantingCropRec.yieldUnit || 'unid'})</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={extractionCoeffN}
                                  onChange={e => setExtractionCoeffN(e.target.value === '' ? '' : Number(e.target.value))}
                                  className="w-full p-1 bg-white dark:bg-zinc-900 border rounded font-bold text-xs text-center"
                                />
                                <span className="text-[9px] font-black text-emerald-600 block text-center mt-1">
                                  = {activeCropDemands.n} kg/ha
                                </span>
                              </div>

                              <div className="p-2 bg-slate-50 dark:bg-black rounded-lg border border-slate-200 dark:border-zinc-800">
                                <label className="text-[9px] font-bold text-slate-500 block mb-0.5">P₂O₅ (kg/{selectedPlantingCropRec.yieldUnit || 'unid'})</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={extractionCoeffP2O5}
                                  onChange={e => setExtractionCoeffP2O5(e.target.value === '' ? '' : Number(e.target.value))}
                                  className="w-full p-1 bg-white dark:bg-zinc-900 border rounded font-bold text-xs text-center"
                                />
                                <span className="text-[9px] font-black text-teal-600 block text-center mt-1">
                                  = {activeCropDemands.p2o5} kg/ha
                                </span>
                              </div>

                              <div className="p-2 bg-slate-50 dark:bg-black rounded-lg border border-slate-200 dark:border-zinc-800">
                                <label className="text-[9px] font-bold text-slate-500 block mb-0.5">K₂O (kg/{selectedPlantingCropRec.yieldUnit || 'unid'})</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={extractionCoeffK2O}
                                  onChange={e => setExtractionCoeffK2O(e.target.value === '' ? '' : Number(e.target.value))}
                                  className="w-full p-1 bg-white dark:bg-zinc-900 border rounded font-bold text-xs text-center"
                                />
                                <span className="text-[9px] font-black text-cyan-600 block text-center mt-1">
                                  = {activeCropDemands.k2o} kg/ha
                                </span>
                              </div>

                              <div className="p-2 bg-slate-50 dark:bg-black rounded-lg border border-slate-200 dark:border-zinc-800">
                                <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Ca (kg/{selectedPlantingCropRec.yieldUnit || 'unid'})</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={extractionCoeffCa}
                                  onChange={e => setExtractionCoeffCa(e.target.value === '' ? '' : Number(e.target.value))}
                                  className="w-full p-1 bg-white dark:bg-zinc-900 border rounded font-bold text-xs text-center"
                                />
                                <span className="text-[9px] font-black text-slate-700 dark:text-slate-300 block text-center mt-1">
                                  = {activeCropDemands.ca} kg/ha
                                </span>
                              </div>

                              <div className="p-2 bg-slate-50 dark:bg-black rounded-lg border border-slate-200 dark:border-zinc-800">
                                <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Mg (kg/{selectedPlantingCropRec.yieldUnit || 'unid'})</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={extractionCoeffMg}
                                  onChange={e => setExtractionCoeffMg(e.target.value === '' ? '' : Number(e.target.value))}
                                  className="w-full p-1 bg-white dark:bg-zinc-900 border rounded font-bold text-xs text-center"
                                />
                                <span className="text-[9px] font-black text-slate-700 dark:text-slate-300 block text-center mt-1">
                                  = {activeCropDemands.mg} kg/ha
                                </span>
                              </div>

                              <div className="p-2 bg-slate-50 dark:bg-black rounded-lg border border-slate-200 dark:border-zinc-800">
                                <label className="text-[9px] font-bold text-slate-500 block mb-0.5">S (kg/{selectedPlantingCropRec.yieldUnit || 'unid'})</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={extractionCoeffS}
                                  onChange={e => setExtractionCoeffS(e.target.value === '' ? '' : Number(e.target.value))}
                                  className="w-full p-1 bg-white dark:bg-zinc-900 border rounded font-bold text-xs text-center"
                                />
                                <span className="text-[9px] font-black text-amber-600 block text-center mt-1">
                                  = {activeCropDemands.s} kg/ha
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* OPTION 3: PERSONALIZADO */}
                    {cropRecommendationMethod === 'personalizado' && (
                      <div className="space-y-3">
                        <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                              ✏️ Lançamento Manual das Exigências Nutricionais da Cultura:
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const d = selectedPlantingCropRec.demandsKgPerHa;
                                setCustomDemandN(d.n);
                                setCustomDemandP2O5(d.p2o5);
                                setCustomDemandK2O(d.k2o);
                                setCustomDemandCa(d.ca || 25);
                                setCustomDemandMg(d.mg || 12);
                                setCustomDemandS(d.s || 18);
                                setCustomDemandB(d.b || 800);
                                setCustomDemandCu(d.cu || 350);
                                setCustomDemandFe(d.fe || 500);
                                setCustomDemandMn(d.mn || 1200);
                                setCustomDemandMo(d.mo || 60);
                                setCustomDemandZn(d.zn || 1500);
                                showNotification('Parâmetros do Boletim copiados para os campos personalizados!');
                              }}
                              className="text-[10px] font-bold px-2 py-1 bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-slate-200 rounded cursor-pointer flex items-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Copiar do Boletim</span>
                            </button>
                          </div>

                          {/* Macronutrientes Manual Inputs */}
                          <div>
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                              Macronutrientes (kg/ha):
                            </span>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                              <div>
                                <label className="text-[9px] font-bold text-emerald-700 block text-center">N</label>
                                <input
                                  type="number"
                                  value={customDemandN}
                                  onChange={e => setCustomDemandN(e.target.value === '' ? '' : Number(e.target.value))}
                                  className="w-full p-1.5 bg-slate-50 dark:bg-black border rounded font-black text-xs text-center"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-teal-700 block text-center">P₂O₅</label>
                                <input
                                  type="number"
                                  value={customDemandP2O5}
                                  onChange={e => setCustomDemandP2O5(e.target.value === '' ? '' : Number(e.target.value))}
                                  className="w-full p-1.5 bg-slate-50 dark:bg-black border rounded font-black text-xs text-center"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-cyan-700 block text-center">K₂O</label>
                                <input
                                  type="number"
                                  value={customDemandK2O}
                                  onChange={e => setCustomDemandK2O(e.target.value === '' ? '' : Number(e.target.value))}
                                  className="w-full p-1.5 bg-slate-50 dark:bg-black border rounded font-black text-xs text-center"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-slate-600 block text-center">Ca</label>
                                <input
                                  type="number"
                                  value={customDemandCa}
                                  onChange={e => setCustomDemandCa(e.target.value === '' ? '' : Number(e.target.value))}
                                  className="w-full p-1.5 bg-slate-50 dark:bg-black border rounded font-black text-xs text-center"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-slate-600 block text-center">Mg</label>
                                <input
                                  type="number"
                                  value={customDemandMg}
                                  onChange={e => setCustomDemandMg(e.target.value === '' ? '' : Number(e.target.value))}
                                  className="w-full p-1.5 bg-slate-50 dark:bg-black border rounded font-black text-xs text-center"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-amber-700 block text-center">S</label>
                                <input
                                  type="number"
                                  value={customDemandS}
                                  onChange={e => setCustomDemandS(e.target.value === '' ? '' : Number(e.target.value))}
                                  className="w-full p-1.5 bg-slate-50 dark:bg-black border rounded font-black text-xs text-center"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Micronutrientes Manual Inputs */}
                          <div>
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                              Micronutrientes (g/ha):
                            </span>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                              <div>
                                <label className="text-[9px] font-bold text-slate-500 block text-center">Boro (B)</label>
                                <input
                                  type="number"
                                  value={customDemandB}
                                  onChange={e => setCustomDemandB(e.target.value === '' ? '' : Number(e.target.value))}
                                  className="w-full p-1.5 bg-slate-50 dark:bg-black border rounded font-black text-xs text-center"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-slate-500 block text-center">Cobre (Cu)</label>
                                <input
                                  type="number"
                                  value={customDemandCu}
                                  onChange={e => setCustomDemandCu(e.target.value === '' ? '' : Number(e.target.value))}
                                  className="w-full p-1.5 bg-slate-50 dark:bg-black border rounded font-black text-xs text-center"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-slate-500 block text-center">Ferro (Fe)</label>
                                <input
                                  type="number"
                                  value={customDemandFe}
                                  onChange={e => setCustomDemandFe(e.target.value === '' ? '' : Number(e.target.value))}
                                  className="w-full p-1.5 bg-slate-50 dark:bg-black border rounded font-black text-xs text-center"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-slate-500 block text-center">Manganês (Mn)</label>
                                <input
                                  type="number"
                                  value={customDemandMn}
                                  onChange={e => setCustomDemandMn(e.target.value === '' ? '' : Number(e.target.value))}
                                  className="w-full p-1.5 bg-slate-50 dark:bg-black border rounded font-black text-xs text-center"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-slate-500 block text-center">Molibdênio (Mo)</label>
                                <input
                                  type="number"
                                  value={customDemandMo}
                                  onChange={e => setCustomDemandMo(e.target.value === '' ? '' : Number(e.target.value))}
                                  className="w-full p-1.5 bg-slate-50 dark:bg-black border rounded font-black text-xs text-center"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-slate-500 block text-center">Zinco (Zn)</label>
                                <input
                                  type="number"
                                  value={customDemandZn}
                                  onChange={e => setCustomDemandZn(e.target.value === '' ? '' : Number(e.target.value))}
                                  className="w-full p-1.5 bg-slate-50 dark:bg-black border rounded font-black text-xs text-center"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Active Target Demands Summary Pill */}
                    <div className="p-2.5 bg-emerald-100/80 dark:bg-emerald-950/90 border border-emerald-300 dark:border-emerald-800 rounded-lg flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-emerald-950 dark:text-emerald-200 text-[11px]">
                          Exigência Nutricional Ativa ({activeCropDemands.methodLabel}):
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-black text-[11px] text-emerald-900 dark:text-emerald-100 flex-wrap">
                        <span>N: <strong>{activeCropDemands.n}</strong> kg/ha</span> • 
                        <span className="text-teal-700 dark:text-teal-300">P₂O₅: <strong>{activeCropDemands.p2o5}</strong> kg/ha</span> • 
                        <span className="text-cyan-700 dark:text-cyan-300">K₂O: <strong>{activeCropDemands.k2o}</strong> kg/ha</span> • 
                        <span>S: <strong>{activeCropDemands.s}</strong> kg/ha</span>
                      </div>
                    </div>
                  </div>
                )}
          </div>

          

          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-6 text-xs">
            <div className="border-b pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Adubação Mineral de Precisão (Plantio & Cobertura)
              </h3>
            </div>

            <div className="flex flex-col gap-6">
              <div className="p-4 border rounded-xl space-y-4 bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-zinc-800">
                  <strong className="font-bold text-sm text-slate-900 dark:text-white block">
                    1. Adubação de Plantio (Sulco)
                  </strong>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                    Fertilizantes Minerais
                  </span>
                </div>

                {/* 2. Formulation NPK Selector & Custom Fertilizer Option with Renaming */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 dark:text-slate-200">
                      Formulação NPK / Fertilizante Escolhido:
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomFertilizer(!isCustomFertilizer)}
                      className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 rounded cursor-pointer transition-colors"
                    >
                      {isCustomFertilizer ? '📋 Usar Formulado Pré-cadastrado' : '✏️ Personalizar / Renomear Meu Fertilizante'}
                    </button>
                  </div>

                  {!isCustomFertilizer ? (
                    <select
                      value={selectedFormulationId}
                      onChange={e => {
                        if (e.target.value === 'custom') {
                          setIsCustomFertilizer(true);
                        } else {
                          setSelectedFormulationId(e.target.value);
                        }
                      }}
                      className="w-full p-2 bg-white dark:bg-black border rounded-lg font-bold cursor-pointer"
                    >
                      {MINERAL_FERTILIZERS_CATALOG.filter(f => f.type === 'formulado_npk').map(f => (
                        <option key={f.id} value={f.id}>{f.name} ({f.formula})</option>
                      ))}
                      <option value="custom">➕ Adicionar / Personalizar Meu Fertilizante (Garantia Aberta)</option>
                    </select>
                  ) : (
                    <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-3">
                      <div className="space-y-1">
                        <label className="font-bold text-[11px] text-indigo-900 dark:text-indigo-300">
                          Nome do Fertilizante (Personalizado):
                        </label>
                        <input
                          type="text"
                          value={customFertName}
                          onChange={e => setCustomFertName(e.target.value)}
                          placeholder="Ex: Meu NPK Bunge 03-24-12 + S + Zn"
                          className="w-full p-2 bg-white dark:bg-zinc-900 border border-indigo-300 rounded-lg font-bold text-xs text-indigo-950 dark:text-white"
                        />
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-slate-600 block">% N</label>
                          <input
                            type="number"
                            step="0.5"
                            value={customFertN}
                            onChange={e => setCustomFertN(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full p-1.5 bg-white dark:bg-zinc-900 border rounded font-bold text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-600 block">% P₂O₅</label>
                          <input
                            type="number"
                            step="0.5"
                            value={customFertP2O5}
                            onChange={e => setCustomFertP2O5(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full p-1.5 bg-white dark:bg-zinc-900 border rounded font-bold text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-600 block">% K₂O</label>
                          <input
                            type="number"
                            step="0.5"
                            value={customFertK2O}
                            onChange={e => setCustomFertK2O(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full p-1.5 bg-white dark:bg-zinc-900 border rounded font-bold text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-600 block">% S</label>
                          <input
                            type="number"
                            step="0.5"
                            value={customFertS}
                            onChange={e => setCustomFertS(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full p-1.5 bg-white dark:bg-zinc-900 border rounded font-bold text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-600 block">% Ca</label>
                          <input
                            type="number"
                            step="0.5"
                            value={customFertCa}
                            onChange={e => setCustomFertCa(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full p-1.5 bg-white dark:bg-zinc-900 border rounded font-bold text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-600 block">% Mg</label>
                          <input
                            type="number"
                            step="0.5"
                            value={customFertMg}
                            onChange={e => setCustomFertMg(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full p-1.5 bg-white dark:bg-zinc-900 border rounded font-bold text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-600 block">% B</label>
                          <input
                            type="number"
                            step="0.05"
                            value={customFertB}
                            onChange={e => setCustomFertB(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full p-1.5 bg-white dark:bg-zinc-900 border rounded font-bold text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-600 block">% Zn</label>
                          <input
                            type="number"
                            step="0.05"
                            value={customFertZn}
                            onChange={e => setCustomFertZn(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full p-1.5 bg-white dark:bg-zinc-900 border rounded font-bold text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Secondary planting fertilizer (for Fruits & Coffee only) */}
                  {(isFruitOrPerennialCrop || isCoffeeCrop) && (
                    <div className="p-3 bg-teal-50/50 dark:bg-teal-950/10 border border-teal-100 dark:border-teal-900/60 rounded-xl space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            id="enableSecondaryPlanting"
                            checked={enableSecondaryPlanting}
                            onChange={e => setEnableSecondaryPlanting(e.target.checked)}
                            className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                          />
                          <label htmlFor="enableSecondaryPlanting" className="font-bold text-xs text-teal-950 dark:text-teal-300 cursor-pointer">
                            Adicionar Termofosfato Magnesiano (00-18-00 + 18Ca + 7Mg)
                          </label>
                        </div>
                        <span className="text-[9px] font-bold bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 px-1.5 py-0.5 rounded">
                          Fosfato Gradual
                        </span>
                      </div>

                      {enableSecondaryPlanting && (
                        <div className="space-y-2 border-t pt-2 border-teal-100 dark:border-teal-950">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                            <span>Proporção de Termofosfato no Plantio:</span>
                            <span className="text-teal-700 dark:text-teal-400">{secondaryPlantingPercentage}% Termofosfato / {100 - secondaryPlantingPercentage}% NPK</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={secondaryPlantingPercentage}
                              onChange={e => setSecondaryPlantingPercentage(Number(e.target.value))}
                              className="flex-1 accent-teal-600 cursor-pointer"
                            />
                            <div className="w-16">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={secondaryPlantingPercentage}
                                onChange={e => {
                                  const val = Math.max(0, Math.min(100, Number(e.target.value)));
                                  setSecondaryPlantingPercentage(val);
                                }}
                                className="w-full p-1 text-center bg-white dark:bg-zinc-900 border rounded font-bold text-xs"
                              />
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            O termofosfato magnesiano fornece Fósforo (18% P₂O₅) de liberação progressiva, Cálcio (18% Ca) e Magnésio (7% Mg), melhorando o condicionamento do sulco de plantio e nutrição inicial.
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 4. Planting Dosage Inputs: Units, Conversions & Field Notes */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                    {/* Auto-Calculation Info Badge */}
                    <div className="flex items-center justify-between flex-wrap gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-900 dark:text-emerald-200 text-[11px] font-medium">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>
                          <strong>Cálculo Automático por Exigência ({autoCalculatedPlantingDose.targetNutrientKg} kg/ha de {autoCalculatedPlantingDose.targetNutrientName}):</strong> {autoCalculatedPlantingDose.targetNutrientKg} ÷ {autoCalculatedPlantingDose.guaranteePct}% = <strong className="text-emerald-700 dark:text-emerald-300 font-black">{autoCalculatedPlantingDose.doseKgHa} kg/ha</strong>
                        </span>
                      </div>
                      {plantingDoseKgHa !== autoCalculatedPlantingDose.doseKgHa && (
                        <button
                          type="button"
                          onClick={() => setPlantingDoseKgHa(autoCalculatedPlantingDose.doseKgHa)}
                          className="text-[10px] font-bold px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Aplicar Dose ({autoCalculatedPlantingDose.doseKgHa} kg/ha)</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <label className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        Dosagem de Plantio:
                      </label>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setPlantingDoseUnit('kg_ha')}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer ${plantingDoseUnit === 'kg_ha' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-slate-300'}`}
                        >
                          kg/ha
                        </button>
                        <button
                          type="button"
                          onClick={() => setPlantingDoseUnit('area_total')}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer ${plantingDoseUnit === 'area_total' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-slate-300'}`}
                        >
                          Área Total (kg)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPlantingDoseUnit('g_planta')}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer ${plantingDoseUnit === 'g_planta' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-slate-300'}`}
                        >
                          g/planta
                        </button>
                        <button
                          type="button"
                          onClick={() => setPlantingDoseUnit('g_sulco')}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer ${plantingDoseUnit === 'g_sulco' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-slate-300'}`}
                        >
                          g/m sulco
                        </button>
                      </div>
                    </div>

                    <input
                      type="number"
                      step="1"
                      value={currentPlantingDoseDisplayVal}
                      onChange={e => handlePlantingDoseValueChange(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder={`Informe a dosagem em ${plantingDoseUnit}`}
                      className="w-full p-2 bg-white dark:bg-black border rounded-lg font-black text-sm text-emerald-700 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500"
                    />

                    {/* Live Multi-Unit Dosage Conversion Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center pt-1">
                      <div className="p-2 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <span className="text-[8px] text-emerald-800 dark:text-emerald-400 block font-bold">📦 Dose por ha</span>
                        <strong className="text-xs text-emerald-900 dark:text-emerald-300 font-black">
                          {plantingNutrientsSupplied.doseKgHa} kg/ha
                        </strong>
                      </div>
                      <div className="p-2 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <span className="text-[8px] text-emerald-800 dark:text-emerald-400 block font-bold">🚜 Área Total ({currentSoil?.areaHa || 50} ha)</span>
                        <strong className="text-xs text-emerald-900 dark:text-emerald-300 font-black">
                          {plantingNutrientsSupplied.totalKg.toLocaleString('pt-BR')} kg
                        </strong>
                      </div>
                      <div className="p-2 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <span className="text-[8px] text-emerald-800 dark:text-emerald-400 block font-bold">🪴 Dose / Planta</span>
                        <strong className="text-xs text-emerald-900 dark:text-emerald-300 font-black">
                          {plantingNutrientsSupplied.gPerPlant.toFixed(2)} g/planta
                        </strong>
                      </div>
                      <div className="p-2 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <span className="text-[8px] text-emerald-800 dark:text-emerald-400 block font-bold">📏 Dose / m Sulco</span>
                        <strong className="text-xs text-emerald-900 dark:text-emerald-300 font-black">
                          {plantingNutrientsSupplied.gPerM.toFixed(2)} g/m
                        </strong>
                      </div>
                    </div>

                    {/* Detailed Mixture Breakdown for Secondary Fertilizer */}
                    {enableSecondaryPlanting && (isFruitOrPerennialCrop || isCoffeeCrop) && (
                      <div className="p-3 bg-teal-50/40 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/60 rounded-lg space-y-2 mt-2">
                        <span className="text-[10px] font-bold text-teal-950 dark:text-teal-300 block">
                          Detalhamento da Mistura de Fertilizantes para Aplicação no Plantio:
                        </span>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-2.5 bg-white dark:bg-zinc-900 border border-teal-100 dark:border-teal-950 rounded-lg space-y-0.5">
                            <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-semibold truncate">
                              1. {activeFertilizerGuarantees.mainName || 'Formulação NPK'} ({100 - secondaryPlantingPercentage}%)
                            </span>
                            <div className="text-xs text-slate-800 dark:text-slate-200 font-black">
                              {(plantingNutrientsSupplied.doseKgHa * (100 - secondaryPlantingPercentage) / 100).toFixed(1)} kg/ha
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">
                              Total: {((plantingNutrientsSupplied.totalKg * (100 - secondaryPlantingPercentage)) / 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg
                            </div>
                          </div>
                          <div className="p-2.5 bg-white dark:bg-zinc-900 border border-teal-100 dark:border-teal-950 rounded-lg space-y-0.5">
                            <span className="text-[9px] text-teal-600 dark:text-teal-400 block font-black truncate">
                              2. Termofosfato Magnesiano ({secondaryPlantingPercentage}%)
                            </span>
                            <div className="text-xs text-teal-750 dark:text-teal-400 font-black">
                              {(plantingNutrientsSupplied.doseKgHa * secondaryPlantingPercentage / 100).toFixed(1)} kg/ha
                            </div>
                            <div className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">
                              Total: {((plantingNutrientsSupplied.totalKg * secondaryPlantingPercentage) / 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Auto-Calculated Nutrients Supplied Summary */}
                    <div className="p-3 bg-white dark:bg-zinc-900 border rounded-lg space-y-1 mt-2">
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">
                        Aporte Nutricional Efetivo no Sulco (Com base no fertilizante {activeFertilizerGuarantees.name}):
                      </span>
                      <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                        <span className="text-emerald-600">N: {plantingNutrientsSupplied.suppliedN.toFixed(1)} kg/ha</span> • 
                        <span className="text-teal-600">P₂O₅: {plantingNutrientsSupplied.suppliedP2O5.toFixed(1)} kg/ha</span> • 
                        <span className="text-cyan-600">K₂O: {plantingNutrientsSupplied.suppliedK2O.toFixed(1)} kg/ha</span> • 
                        <span className="text-amber-600">S: {plantingNutrientsSupplied.suppliedS.toFixed(1)} kg/ha</span>
                        {plantingNutrientsSupplied.suppliedB > 0 && <span> • B: {plantingNutrientsSupplied.suppliedB.toFixed(0)} g/ha</span>}
                        {plantingNutrientsSupplied.suppliedZn > 0 && <span> • Zn: {plantingNutrientsSupplied.suppliedZn.toFixed(0)} g/ha</span>}
                      </div>
                    </div>

                    {/* Planting Notes / Field Instructions */}
                    <div className="pt-2">
                      <label className="font-bold text-[10px] text-slate-700 dark:text-slate-300 block mb-1">
                        Observações e Instruções Agronômicas para Aplicação no Plantio:
                      </label>
                      <textarea
                        value={plantingObservation}
                        onChange={e => setPlantingObservation(e.target.value)}
                        placeholder="Adicione observações de campo, regulagem de adubadora e recomendações de segurança no sulco..."
                        className="w-full p-2 bg-white dark:bg-black border rounded-lg text-xs min-h-[50px] font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-xl space-y-4 bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-zinc-800 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <strong className="font-bold text-sm text-slate-900 dark:text-white block">
                      2. Adubação de Cobertura (Parcelada) & Frutíferas
                    </strong>
                    {isFruitOrPerennialCrop && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300">
                        🍊 Frutíferas / Perenes (Macro + Micro)
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    isSojaCrop
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {isSojaCrop ? '🌱 Adubação Exclusivamente Potássica (FBN - Soja)' : 'Aplicação Nitrogênio / Potássio / Cálcio / Micro'}
                  </span>
                </div>

                {/* Soja FBN Agronomic Banner & Alerts */}
                {isSojaCrop && (
                  <div className="p-3 bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-start gap-2">
                      <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold text-emerald-950 dark:text-emerald-200 text-xs">
                          Manejo Agronômico Especial da Soja (Fixação Biológica de N - Bradyrhizobium):
                        </p>
                        <p className="text-emerald-850 dark:text-emerald-300 leading-relaxed text-[11px]">
                          A cultura da soja supre 100% de suas exigências de Nitrogênio via simbiose (FBN). A aplicação de adubo nitrogenado mineral em cobertura na soja é <strong>não recomendada e desnecessária</strong> por inibir a nodulação. A adubação de cobertura na Soja deve ser <strong>estritamente Potássica (K₂O)</strong> com Cloreto de Potássio (KCl 60%) ou Sulfato de Potássio para assegurar o enchimento de grãos.
                        </p>
                      </div>
                    </div>

                    {activeTopdressingData.n > 0 && (
                      <div className="p-2 bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 rounded-lg flex items-center justify-between flex-wrap gap-2 text-[11px] text-amber-900 dark:text-amber-200 mt-2">
                        <div className="flex items-center gap-1.5 font-bold">
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>Atenção: A fonte selecionada ({activeTopdressingData.name}) contém {activeTopdressingData.n}% de N. Não recomendada para Soja!</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTopdressingSource('min-kcl')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10px] cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Mudar para KCl (60% K₂O)</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Coffee Specific Management Control Banner (Arábica / Conilon) */}
                {isCoffeeCrop && (
                  <div className="p-3.5 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-amber-200/80 dark:border-amber-800/60">
                      <div className="flex items-center gap-2">
                        <Coffee className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0" />
                        <div>
                          <h4 className="font-extrabold text-xs text-amber-950 dark:text-amber-200 uppercase tracking-wider">
                            Manejo Nutricional Especial do Cafeeiro ({coffeeType === 'conilon' ? 'Café Conilon / Robusta' : 'Café Arábica'})
                          </h4>
                          <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                            Selecione a fase da lavoura e a meta produtiva para calibrar os parâmetros dos boletins técnicos (IAC / Incaper / 5ª Aproximação).
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      {/* Sub-Espécie */}
                      <div>
                        <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-200 mb-1">
                          Espécie de Café:
                        </label>
                        <select
                          value={coffeeType}
                          onChange={(e) => setCoffeeType(e.target.value as 'arabica' | 'conilon')}
                          className="w-full p-2 bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-zinc-100"
                        >
                          <option value="arabica">Café Arábica (Coffea arabica)</option>
                          <option value="conilon">Café Conilon / Robusta (Coffea canephora)</option>
                        </select>
                      </div>

                      {/* Fase da Lavoura */}
                      <div>
                        <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-200 mb-1">
                          Fase Fenológica / Estágio:
                        </label>
                        <select
                          value={coffeePhase}
                          onChange={(e) => setCoffeePhase(e.target.value as any)}
                          className="w-full p-2 bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-zinc-100"
                        >
                          <option value="formacao_1ano">Café de Formação (1º Ano - Implantação)</option>
                          <option value="formacao_2ano">Café de Formação (2º Ano - Pré-Produção)</option>
                          <option value="producao">Café de Produção (Lavoura Adulta)</option>
                          <option value="renovacao_poda">Renovação / Poda (Recepa / Decote)</option>
                        </select>
                      </div>

                      {/* Meta de Produtividade (se Produção) */}
                      {coffeePhase === 'producao' && (
                        <div>
                          <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-200 mb-1">
                            Meta Produtiva Esperada (sc/ha):
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="10"
                              max="180"
                              value={coffeeYieldTargetSc}
                              onChange={(e) => setCoffeeYieldTargetSc(e.target.value === '' ? '' : Number(e.target.value))}
                              className="w-full p-2 bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                              placeholder="ex: 50"
                            />
                            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 shrink-0">sc/ha</span>
                          </div>
                        </div>
                      )}

                      {/* Tipo de Poda (se Renovação) */}
                      {coffeePhase === 'renovacao_poda' && (
                        <div>
                          <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-200 mb-1">
                            Tipo de Poda Efetuada:
                          </label>
                          <select
                            value={coffeePruningType}
                            onChange={(e) => setCoffeePruningType(e.target.value as any)}
                            className="w-full p-2 bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-zinc-100"
                          >
                            <option value="recepa">Recepa (Poda Baixa / Sem Carga)</option>
                            <option value="decote">Decote / Esqueletamento</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Parâmetros de Referência dos Boletins Cadastrados para Adubação de Cobertura */}
                <div className="p-3.5 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-slate-50 dark:from-zinc-900/90 dark:via-indigo-950/20 dark:to-zinc-900 border border-blue-200/80 dark:border-indigo-900/60 rounded-xl space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-blue-200/60 dark:border-indigo-900/40">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <div>
                        <span className="font-extrabold text-xs text-indigo-950 dark:text-indigo-200 block">
                          Parâmetros Oficiais de Referência de Cobertura ({bulletinTopdressingRecommendation.bulletinCode}):
                        </span>
                        <span className="text-[11px] text-indigo-800 dark:text-indigo-300 font-medium">
                          Cultura: <strong>{bulletinTopdressingRecommendation.cropName}</strong> • Tabela: {bulletinTopdressingRecommendation.bulletinTitle}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyBulletinTopdressingRecommendation}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                      title="Preenche o parcelamento de cobertura automaticamente com os parâmetros deste boletim"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                      <span>Aplicar Parâmetros do Boletim ({bulletinTopdressingRecommendation.bulletinCode})</span>
                    </button>
                  </div>

                  {/* Quantidades Recomendadas por Nutriente pelo Boletim */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                      <FlaskConical className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Nutrientes Recomendados em Cobertura pelo Boletim Oficial:</span>
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
                      {/* N */}
                      <div className={`p-2 rounded-lg border text-center ${
                        bulletinTopdressingRecommendation.isLegumeFbn 
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
                          : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white'
                      }`}>
                        <span className="text-[10px] uppercase font-black text-slate-500 dark:text-zinc-400 block">Nitrogênio (N)</span>
                        <strong className="text-sm font-black">
                          {bulletinTopdressingRecommendation.recommendedNutrients.n} <span className="text-[10px]">kg/ha</span>
                        </strong>
                        {bulletinTopdressingRecommendation.isLegumeFbn && (
                          <span className="block text-[9px] font-bold text-emerald-700 dark:text-emerald-400">🌱 FBN (0 N)</span>
                        )}
                      </div>

                      {/* K2O */}
                      <div className="p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-center text-slate-900 dark:text-white">
                        <span className="text-[10px] uppercase font-black text-slate-500 dark:text-zinc-400 block">Potássio (K₂O)</span>
                        <strong className="text-sm font-black text-cyan-700 dark:text-cyan-400">
                          {bulletinTopdressingRecommendation.recommendedNutrients.k2o} <span className="text-[10px]">kg/ha</span>
                        </strong>
                      </div>

                      {/* P2O5 (if fruit/perennial) */}
                      {bulletinTopdressingRecommendation.recommendedNutrients.p2o5 > 0 && (
                        <div className="p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-center text-slate-900 dark:text-white">
                          <span className="text-[10px] uppercase font-black text-slate-500 dark:text-zinc-400 block">Fósforo (P₂O₅)</span>
                          <strong className="text-sm font-black text-teal-700 dark:text-teal-400">
                            {bulletinTopdressingRecommendation.recommendedNutrients.p2o5} <span className="text-[10px]">kg/ha</span>
                          </strong>
                        </div>
                      )}

                      {/* Ca */}
                      {bulletinTopdressingRecommendation.recommendedNutrients.ca > 0 && (
                        <div className="p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-center text-slate-900 dark:text-white">
                          <span className="text-[10px] uppercase font-black text-slate-500 dark:text-zinc-400 block">Cálcio (Ca)</span>
                          <strong className="text-sm font-black text-indigo-700 dark:text-indigo-400">
                            {bulletinTopdressingRecommendation.recommendedNutrients.ca} <span className="text-[10px]">kg/ha</span>
                          </strong>
                        </div>
                      )}

                      {/* Enxofre */}
                      {bulletinTopdressingRecommendation.recommendedNutrients.s > 0 && (
                        <div className="p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-center text-slate-900 dark:text-white">
                          <span className="text-[10px] uppercase font-black text-slate-500 dark:text-zinc-400 block">Enxofre (S)</span>
                          <strong className="text-sm font-black text-amber-700 dark:text-amber-400">
                            {bulletinTopdressingRecommendation.recommendedNutrients.s} <span className="text-[10px]">kg/ha</span>
                          </strong>
                        </div>
                      )}

                      {/* Boro */}
                      {bulletinTopdressingRecommendation.recommendedNutrients.boroG > 0 && (
                        <div className="p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-center text-slate-900 dark:text-white">
                          <span className="text-[10px] uppercase font-black text-slate-500 dark:text-zinc-400 block">Boro (B)</span>
                          <strong className="text-sm font-black text-purple-700 dark:text-purple-400">
                            {bulletinTopdressingRecommendation.recommendedNutrients.boroG} <span className="text-[10px]">g/ha</span>
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Equivalência e Fontes Comercias Sugeridas */}
                  {(bulletinTopdressingRecommendation?.equivalentFertilizers || []).length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                        📦 Equivalência de Adubos Comerciais Sugeridos pelo Boletim (Por Hectare / Planta):
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px]">
                        {(bulletinTopdressingRecommendation.equivalentFertilizers || []).map((f, idx) => (
                          <div key={idx} className="p-2 bg-white/90 dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 rounded-lg space-y-1">
                            <strong className="font-bold text-indigo-950 dark:text-indigo-200 block truncate">
                              {f.name}
                            </strong>
                            <div className="flex items-center justify-between text-[11px] text-slate-700 dark:text-zinc-300">
                              <span>Dose: <strong>{f.doseKgHa} kg/ha</strong></span>
                              <span className="text-[10px] text-slate-500">({f.nutrientRole})</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-zinc-400 border-t pt-1 border-slate-100 dark:border-zinc-700">
                              <span>Total Área ({currentSoil?.areaHa || 50} ha): <strong>{f.totalFarmKg.toLocaleString()} kg</strong></span>
                              {f.gPerPlant > 0 && (
                                <span className="text-amber-800 dark:text-amber-300 font-bold"><strong>{f.gPerPlant}</strong> g/planta</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Esquema de Parcelamento e Orientação do Boletim */}
                  <div className="p-2.5 bg-white/80 dark:bg-zinc-800/80 border border-indigo-100 dark:border-indigo-900/50 rounded-lg text-xs space-y-1.5">
                    <div className="flex items-center justify-between flex-wrap gap-2 text-[11px]">
                      <span className="font-bold text-indigo-900 dark:text-indigo-200">
                        📅 Esquema de Parcelamento do Boletim: <strong>{bulletinTopdressingRecommendation.suggestedSplitsCount}x parcelas</strong>
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-zinc-300">
                        Épocas: {bulletinTopdressingRecommendation.suggestedParcelas.map(p => p.timing).join(' | ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-zinc-300 leading-relaxed italic">
                      "{bulletinTopdressingRecommendation.agronomicGuideline}"
                    </p>
                  </div>
                </div>

                {/* Topdressing Configuration Panel */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Fonte Principal / Base */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Fonte Principal / Padrão:</label>
                    <select
                      value={topdressingSource}
                      onChange={e => setTopdressingSource(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-lg font-bold text-xs cursor-pointer text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 h-[40px]"
                    >
                      <optgroup label="🟢 Fontes Potássicas">
                        <option value="min-kcl">Cloreto de Potássio - KCl (60% K₂O)</option>
                        <option value="min-sulfato-potassio">Sulfato de Potássio - K₂SO₄ (50% K₂O + 17% S)</option>
                        <option value="min-nitrato-potassio">Nitrato de Potássio - KNO₃ (13% N + 44% K₂O)</option>
                        <option value="min-kcl-s">KCl Granulado + Enxofre (58% K₂O + 6% S)</option>
                        <option value="npk-00-00-60">Formulado Potássico 00-00-60 (60% K₂O)</option>
                      </optgroup>
                      <optgroup label="🔵 Fontes Nitrogenadas">
                        <option value="min-ureia">Ureia Agrícola 45% N (com inibidor NBPT) {isSojaCrop ? ' ⚠️ [Inibe FBN]' : ''}</option>
                        <option value="min-sulfato-amonio">Sulfato de Amônio (21% N + 24% S) {isSojaCrop ? ' ⚠️ [Inibe FBN]' : ''}</option>
                        <option value="npk-20-00-20">NPK 20-00-20 (20% N + 20% K₂O)</option>
                        <option value="npk-10-00-30">NPK 10-00-30 (10% N + 30% K₂O)</option>
                      </optgroup>
                      <optgroup label="🟠 Cálcio, Magnésio & Fósforo (Frutíferas)">
                        <option value="min-nitrato-calcio">Nitrato de Cálcio (15,5% N + 19% Ca)</option>
                        <option value="min-nitrato-calcio-boro">Nitrato de Cálcio + Boro (15,5% N + 19% Ca + 0,3% B)</option>
                        <option value="min-sulfato-magnesio">Sulfato de Magnésio Solúvel (9,6% Mg + 13% S)</option>
                        <option value="min-nitrato-magnesio">Nitrato de Magnésio (11% N + 9% Mg)</option>
                        <option value="min-map-soluvel">MAP Purificado Solúvel (12% N + 61% P₂O₅)</option>
                      </optgroup>
                      <optgroup label="🍇 Formulados Frutíferas & Horti">
                        <option value="npk-15-05-20-frutiferas">NPK 15-05-20 + Ca + Mg + Micronutrientes</option>
                        <option value="npk-12-06-18-frutiferas">NPK 12-06-18 + 4% S + Micro (Café/Citros/Frutíferas)</option>
                      </optgroup>
                      <optgroup label="🧪 Micronutrientes Cobertura / Via Solo">
                        <option value="micro-acido-borico">Ácido Bórico / Octaborato (17% B)</option>
                        <option value="micro-sulfato-zinco">Sulfato de Zinco (20% Zn + 10% S)</option>
                        <option value="micro-sulfato-manganes">Sulfato de Manganês (26% Mn + 12% S)</option>
                        <option value="micro-sulfato-cobre">Sulfato de Cobre (25% Cu + 12% S)</option>
                        <option value="micro-mix-frutiferas">Mix Micronutrientes Frutíferas (3% B + 4% Zn + 3% Mn + 1% Cu)</option>
                      </optgroup>
                      <optgroup label="➕ Personalizado">
                        <option value="custom-topdressing">➕ Fertilizante Personalizado (Garantia Aberta)</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* Parcelamento selector */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Esquema de Parcelamento:</label>
                    <select
                      value={topdressingSplits}
                      onChange={e => handleTopdressingSplitsChange(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-lg font-bold text-xs cursor-pointer text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 h-[40px]"
                    >
                      <option value="1">1ª Aplicação Única (100% da dose)</option>
                      <option value="2">Parcelado em 2x (Ex: 50% / 50%)</option>
                      <option value="3">Parcelado em 3x (Ex: 33% / 33% / 34%)</option>
                      <option value="4">Parcelado em 4x (Ex: 25% / 25% / 25% / 25%)</option>
                      <option value="5">Parcelado em 5x (Aplicações Mensais)</option>
                      <option value="6">Parcelado em 6x (Frutíferas / Fertirrigação)</option>
                      <option value="custom">✏️ Personalizado (Definir nº de parcelas)</option>
                    </select>
                  </div>

                  {/* Custom parcelas quantity input */}
                  {topdressingSplits === 'custom' ? (
                    <div className="space-y-1.5 animate-fade-in">
                      <label className="font-bold text-xs text-emerald-800 dark:text-emerald-400 block">
                        Quantidade de Parcelas (1 a 12):
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={customNumSplits}
                        onChange={e => handleSyncSplitsFromCount(parseInt(e.target.value, 10) || 1)}
                        className="w-full p-2.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-lg font-black text-xs text-emerald-900 dark:text-emerald-200 h-[40px]"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Dose Alvo Total (kg/ha):</label>
                      <input
                        type="number"
                        value={topdressingDoseKgHa}
                        onChange={e => setTopdressingDoseKgHa(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="Ex: 180"
                        className="w-full p-2.5 bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-lg font-bold text-xs text-slate-900 dark:text-white h-[40px]"
                      />
                    </div>
                  )}
                </div>

                {/* Dynamic Parcela List & Fertilizer Cloning Manager */}
                <div className="p-4 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b pb-2.5 border-slate-200 dark:border-zinc-800 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <strong className="font-bold text-xs text-slate-900 dark:text-white">
                        Gerenciador de Parcelas & Fontes de Cobertura ({parcelaList.length} parcelas ativas)
                      </strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddParcela}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] cursor-pointer flex items-center gap-1 shadow-2xs transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Parcela</span>
                      </button>
                    </div>
                  </div>

                  {/* Parcelas Cards Container */}
                  <div className="space-y-4">
                    {parcelaList.map((parcela, pIdx) => (
                      <div
                        key={parcela.id}
                        className="p-3.5 bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-3 relative group hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors"
                      >
                        {/* Parcela Header Bar */}
                        <div className="flex items-center justify-between flex-wrap gap-2 bg-white dark:bg-zinc-950 p-2 rounded-lg border border-slate-200 dark:border-zinc-800">
                          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                              {pIdx + 1}
                            </span>
                            <input
                              type="text"
                              value={parcela.name}
                              onChange={e => {
                                const updated = [...parcelaList];
                                updated[pIdx].name = e.target.value;
                                setParcelaList(updated);
                              }}
                              placeholder="Nome da Parcela"
                              className="font-bold text-xs text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 px-1 py-0.5 w-full focus:outline-none"
                            />
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <input
                              type="text"
                              value={parcela.timing}
                              onChange={e => {
                                const updated = [...parcelaList];
                                updated[pIdx].timing = e.target.value;
                                setParcelaList(updated);
                              }}
                              placeholder="Época (ex: 30 DAP / Florescimento)"
                              className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded border border-slate-200 dark:border-zinc-700 w-[180px]"
                            />

                            {/* Clone Parcela Action Button */}
                            <button
                              type="button"
                              onClick={() => handleCloneParcela(pIdx)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-[10px] cursor-pointer flex items-center gap-1 shadow-2xs shrink-0 transition-all hover:scale-102"
                              title="Clonar esta parcela e todos os seus fertilizantes"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Clonar Parcela</span>
                            </button>

                            {/* Delete Parcela Button */}
                            {parcelaList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveParcela(pIdx)}
                                className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer rounded shrink-0"
                                title="Excluir Parcela"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Fertilizantes inside this Parcela */}
                        <div className="space-y-2 pl-2 border-l-2 border-emerald-500/40">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Fertilizantes Aplicados na Parcela {pIdx + 1}:
                          </span>

                          {parcela.fertilizers.map((fert, fIdx) => {
                            const srcObj = TOPDRESSING_SOURCES_CATALOG.find(s => s.id === fert.sourceId) || TOPDRESSING_SOURCES_CATALOG[0];
                            const doseKgHa = Number(fert.doseKgHa) || 0;
                            const doseGPlant = calculatedPopulationHa > 0 ? (doseKgHa * 1000) / calculatedPopulationHa : 0;
                            const totalKgArea = doseKgHa * (currentSoil?.areaHa || 50);

                            return (
                              <div
                                key={fert.id}
                                className="p-2.5 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-lg space-y-2 text-xs"
                              >
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                                  {/* Fonte selector */}
                                  <div className="sm:col-span-6 space-y-1">
                                    <label className="text-[9px] font-bold text-slate-500 block">Fonte / Adubo:</label>
                                    <select
                                      value={fert.sourceId}
                                      onChange={e => {
                                        const updated = [...parcelaList];
                                        updated[pIdx].fertilizers[fIdx].sourceId = e.target.value;
                                        setParcelaList(updated);
                                      }}
                                      className="w-full p-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded font-bold text-xs text-slate-900 dark:text-white"
                                    >
                                      <optgroup label="🟢 Potássicos">
                                        <option value="min-kcl">Cloreto de Potássio (60% K₂O)</option>
                                        <option value="min-sulfato-potassio">Sulfato de Potássio (50% K₂O + 17% S)</option>
                                        <option value="min-nitrato-potassio">Nitrato de Potássio (13% N + 44% K₂O)</option>
                                        <option value="min-kcl-s">KCl + Enxofre (58% K₂O + 6% S)</option>
                                        <option value="npk-00-00-60">00-00-60 (60% K₂O)</option>
                                      </optgroup>
                                      <optgroup label="🔵 Nitrogenados">
                                        <option value="min-ureia">Ureia 45% N</option>
                                        <option value="min-sulfato-amonio">Sulfato de Amônio (21% N + 24% S)</option>
                                        <option value="npk-20-00-20">NPK 20-00-20</option>
                                        <option value="npk-10-00-30">NPK 10-00-30</option>
                                      </optgroup>
                                      <optgroup label="🟠 Cálcio / Magnésio / Fósforo">
                                        <option value="min-nitrato-calcio">Nitrato de Cálcio (15,5% N + 19% Ca)</option>
                                        <option value="min-nitrato-calcio-boro">Nitrato de Cálcio + Boro (15,5% N + 19% Ca + 0,3% B)</option>
                                        <option value="min-sulfato-magnesio">Sulfato de Magnésio (9,6% Mg + 13% S)</option>
                                        <option value="min-nitrato-magnesio">Nitrato de Magnésio (11% N + 9% Mg)</option>
                                        <option value="min-map-soluvel">MAP Solúvel (12% N + 61% P₂O₅)</option>
                                      </optgroup>
                                      <optgroup label="🍇 Formulados Frutíferas">
                                        <option value="npk-15-05-20-frutiferas">NPK 15-05-20 + Ca + Mg + Micro</option>
                                        <option value="npk-12-06-18-frutiferas">NPK 12-06-18 + 4% S + Micro</option>
                                      </optgroup>
                                      <optgroup label="🧪 Micronutrientes">
                                        <option value="micro-acido-borico">Ácido Bórico / Octaborato (17% B)</option>
                                        <option value="micro-sulfato-zinco">Sulfato de Zinco (20% Zn + 10% S)</option>
                                        <option value="micro-sulfato-manganes">Sulfato de Manganês (26% Mn + 12% S)</option>
                                        <option value="micro-sulfato-cobre">Sulfato de Cobre (25% Cu + 12% S)</option>
                                        <option value="micro-mix-frutiferas">Mix Micronutrientes Frutíferas</option>
                                      </optgroup>
                                      <optgroup label="➕ Personalizado">
                                        <option value="custom-topdressing">➕ Personalizado (Garantia Aberta)</option>
                                      </optgroup>
                                    </select>
                                  </div>

                                  {/* Dose input */}
                                  <div className="sm:col-span-3 space-y-1">
                                    <label className="text-[9px] font-bold text-slate-500 block">Dose (kg/ha):</label>
                                    <input
                                      type="number"
                                      value={fert.doseKgHa}
                                      onChange={e => {
                                        const updated = [...parcelaList];
                                        updated[pIdx].fertilizers[fIdx].doseKgHa = Number(e.target.value) || 0;
                                        setParcelaList(updated);
                                      }}
                                      className="w-full p-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded font-black text-xs text-emerald-800 dark:text-emerald-400"
                                    />
                                  </div>

                                  {/* Clone & Remove Fertilizer Actions */}
                                  <div className="sm:col-span-3 flex items-center gap-1 justify-end pt-3">
                                    <button
                                      type="button"
                                      onClick={() => handleCloneFertilizerInParcela(pIdx, fIdx)}
                                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded cursor-pointer flex items-center gap-1 border border-slate-300 dark:border-zinc-700"
                                      title="Clonar este adubo na mesma parcela"
                                    >
                                      <Copy className="w-3 h-3 text-emerald-600" />
                                      <span>Clonar Adubo</span>
                                    </button>

                                    {(parcela.fertilizers || []).length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveFertilizerFromParcela(pIdx, fIdx)}
                                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer rounded"
                                        title="Remover Adubo"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Custom guarantees fields if 'custom-topdressing' is selected */}
                                {fert.sourceId === 'custom-topdressing' && (
                                  <div className="p-2 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded space-y-1.5 mt-1 text-[11px]">
                                    <span className="font-bold text-amber-900 dark:text-amber-200 block text-[10px]">
                                      Garantias do Fertilizante Personalizado (%):
                                    </span>
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                                      <div>
                                        <label className="text-[8px] font-bold text-slate-500 block">N %</label>
                                        <input
                                          type="number"
                                          value={fert.customN || 0}
                                          onChange={e => {
                                            const updated = [...parcelaList];
                                            updated[pIdx].fertilizers[fIdx].customN = Number(e.target.value) || 0;
                                            setParcelaList(updated);
                                          }}
                                          className="w-full p-1 border rounded text-xs font-bold"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[8px] font-bold text-slate-500 block">P₂O₅ %</label>
                                        <input
                                          type="number"
                                          value={fert.customP2O5 || 0}
                                          onChange={e => {
                                            const updated = [...parcelaList];
                                            updated[pIdx].fertilizers[fIdx].customP2O5 = Number(e.target.value) || 0;
                                            setParcelaList(updated);
                                          }}
                                          className="w-full p-1 border rounded text-xs font-bold"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[8px] font-bold text-slate-500 block">K₂O %</label>
                                        <input
                                          type="number"
                                          value={fert.customK2O || 0}
                                          onChange={e => {
                                            const updated = [...parcelaList];
                                            updated[pIdx].fertilizers[fIdx].customK2O = Number(e.target.value) || 0;
                                            setParcelaList(updated);
                                          }}
                                          className="w-full p-1 border rounded text-xs font-bold"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[8px] font-bold text-slate-500 block">Ca %</label>
                                        <input
                                          type="number"
                                          value={fert.customCa || 0}
                                          onChange={e => {
                                            const updated = [...parcelaList];
                                            updated[pIdx].fertilizers[fIdx].customCa = Number(e.target.value) || 0;
                                            setParcelaList(updated);
                                          }}
                                          className="w-full p-1 border rounded text-xs font-bold"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[8px] font-bold text-slate-500 block">Mg %</label>
                                        <input
                                          type="number"
                                          value={fert.customMg || 0}
                                          onChange={e => {
                                            const updated = [...parcelaList];
                                            updated[pIdx].fertilizers[fIdx].customMg = Number(e.target.value) || 0;
                                            setParcelaList(updated);
                                          }}
                                          className="w-full p-1 border rounded text-xs font-bold"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[8px] font-bold text-slate-500 block">S %</label>
                                        <input
                                          type="number"
                                          value={fert.customS || 0}
                                          onChange={e => {
                                            const updated = [...parcelaList];
                                            updated[pIdx].fertilizers[fIdx].customS = Number(e.target.value) || 0;
                                            setParcelaList(updated);
                                          }}
                                          className="w-full p-1 border rounded text-xs font-bold"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Computed Dose conversions per fertilizer */}
                                <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-zinc-900/60 p-1.5 rounded gap-2">
                                  <span>Garantias: <strong>{srcObj.name}</strong></span>
                                  <div className="flex items-center gap-3 font-semibold">
                                    <span>🚜 Total Área: <strong>{totalKgArea.toLocaleString('pt-BR')} kg</strong></span>
                                    <span>🪴 Por Planta: <strong>{doseGPlant.toFixed(1)} g/planta</strong></span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {/* Add Another Fertilizer inside this Parcela */}
                          <button
                            type="button"
                            onClick={() => handleAddFertilizerToParcela(pIdx)}
                            className="px-2 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded cursor-pointer flex items-center gap-1 border border-emerald-300 dark:border-emerald-800 border-dashed"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Adicionar Outra Fonte nesta Parcela</span>
                          </button>
                        </div>

                        {/* Parcela Observation */}
                        <div>
                          <input
                            type="text"
                            value={parcela.observation || ''}
                            onChange={e => {
                              const updated = [...parcelaList];
                              updated[pIdx].observation = e.target.value;
                              setParcelaList(updated);
                            }}
                            placeholder="Obs da Parcela (ex: Via fertirrigação ou na projeção da copa)"
                            className="w-full p-1.5 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded text-[11px] font-medium"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Parcela & Clone Actions Bar */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                    <span className="text-[11px] font-semibold text-slate-500">
                      💡 Dica: Clique em <strong>"Clonar Parcela"</strong> para duplicar parcelamentos mantendo os adubos e dosagens configurados.
                    </span>

                    <button
                      type="button"
                      onClick={handleAddParcela}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar Nova Parcela</span>
                    </button>
                  </div>
                </div>

                {/* Live Totals & Nutrient Summary Dashboard across ALL Parcelas */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <span className="text-[9px] text-emerald-800 dark:text-emerald-400 block font-bold uppercase">Dose Total Cobertura</span>
                      <strong className="text-sm text-emerald-950 dark:text-emerald-200 font-black">
                        {parcelasNutrientsTotal.totalDoseKgHa.toFixed(1)} kg/ha
                      </strong>
                    </div>
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <span className="text-[9px] text-emerald-800 dark:text-emerald-400 block font-bold uppercase">Volume Total Área ({currentSoil?.areaHa || 50} ha)</span>
                      <strong className="text-sm text-emerald-950 dark:text-emerald-200 font-black">
                        {parcelasNutrientsTotal.totalFarmKg.toLocaleString('pt-BR')} kg
                      </strong>
                    </div>
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <span className="text-[9px] text-emerald-800 dark:text-emerald-400 block font-bold uppercase">Dose / Planta</span>
                      <strong className="text-sm text-emerald-950 dark:text-emerald-200 font-black">
                        {parcelasNutrientsTotal.gPerPlant.toFixed(1)} g/planta
                      </strong>
                    </div>
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <span className="text-[9px] text-emerald-800 dark:text-emerald-400 block font-bold uppercase">Dose / m Sulco</span>
                      <strong className="text-sm text-emerald-950 dark:text-emerald-200 font-black">
                        {parcelasNutrientsTotal.gPerM.toFixed(1)} g/m
                      </strong>
                    </div>
                  </div>

                  {/* Comprehensive Macro & Micro Nutrient Supply Display Card (Frutíferas & Gerais) */}
                  <div className="p-3.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between border-b pb-1.5 border-slate-200 dark:border-zinc-800 flex-wrap gap-1">
                      <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Aporte Nutricional Efetivo em Cobertura (Macronutrientes & Micronutrientes)
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        Somatório de todas as parcelas ({parcelaList.length} parcelas)
                      </span>
                    </div>

                    {/* Macronutrientes Row */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">Macronutrientes:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
                        <div className="p-2 bg-emerald-50/80 dark:bg-emerald-950/30 rounded border border-emerald-200 dark:border-emerald-800">
                          <span className="text-[9px] text-emerald-700 block font-bold">N (Nitrogênio)</span>
                          <strong className="text-emerald-900 dark:text-emerald-300 font-black">{parcelasNutrientsTotal.totalN.toFixed(1)} kg/ha</strong>
                          <span className="text-[8px] text-slate-500 block">{parcelasNutrientsTotal.nPerPlantG.toFixed(1)} g/planta</span>
                        </div>
                        <div className="p-2 bg-teal-50/80 dark:bg-teal-950/30 rounded border border-teal-200 dark:border-teal-800">
                          <span className="text-[9px] text-teal-700 block font-bold">P₂O₅ (Fósforo)</span>
                          <strong className="text-teal-900 dark:text-teal-300 font-black">{parcelasNutrientsTotal.totalP2O5.toFixed(1)} kg/ha</strong>
                        </div>
                        <div className="p-2 bg-cyan-50/80 dark:bg-cyan-950/30 rounded border border-cyan-200 dark:border-cyan-800">
                          <span className="text-[9px] text-cyan-700 block font-bold">K₂O (Potássio)</span>
                          <strong className="text-cyan-900 dark:text-cyan-300 font-black">{parcelasNutrientsTotal.totalK2O.toFixed(1)} kg/ha</strong>
                          <span className="text-[8px] text-slate-500 block">{parcelasNutrientsTotal.k2oPerPlantG.toFixed(1)} g/planta</span>
                        </div>
                        <div className="p-2 bg-blue-50/80 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
                          <span className="text-[9px] text-blue-700 block font-bold">Ca (Cálcio)</span>
                          <strong className="text-blue-900 dark:text-blue-300 font-black">{parcelasNutrientsTotal.totalCa.toFixed(1)} kg/ha</strong>
                          <span className="text-[8px] text-slate-500 block">{parcelasNutrientsTotal.caPerPlantG.toFixed(1)} g/planta</span>
                        </div>
                        <div className="p-2 bg-indigo-50/80 dark:bg-indigo-950/30 rounded border border-indigo-200 dark:border-indigo-800">
                          <span className="text-[9px] text-indigo-700 block font-bold">Mg (Magnésio)</span>
                          <strong className="text-indigo-900 dark:text-indigo-300 font-black">{parcelasNutrientsTotal.totalMg.toFixed(1)} kg/ha</strong>
                          <span className="text-[8px] text-slate-500 block">{parcelasNutrientsTotal.mgPerPlantG.toFixed(1)} g/planta</span>
                        </div>
                        <div className="p-2 bg-amber-50/80 dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-800">
                          <span className="text-[9px] text-amber-700 block font-bold">S (Enxofre)</span>
                          <strong className="text-amber-900 dark:text-amber-300 font-black">{parcelasNutrientsTotal.totalS.toFixed(1)} kg/ha</strong>
                          <span className="text-[8px] text-slate-500 block">{parcelasNutrientsTotal.sPerPlantG.toFixed(1)} g/planta</span>
                        </div>
                      </div>
                    </div>

                    {/* Micronutrientes Row */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">Micronutrientes (solo / fertirrigação / folha):</span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                        <div className="p-1.5 bg-slate-50 dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800">
                          <span className="text-[9px] text-slate-600 dark:text-slate-400 block font-bold">B (Boro)</span>
                          <strong className="text-slate-900 dark:text-white font-bold">{parcelasNutrientsTotal.totalBG.toFixed(0)} g/ha</strong>
                          <span className="text-[8px] text-slate-500 block">{parcelasNutrientsTotal.bPerPlantMg.toFixed(1)} mg/planta</span>
                        </div>
                        <div className="p-1.5 bg-slate-50 dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800">
                          <span className="text-[9px] text-slate-600 dark:text-slate-400 block font-bold">Zn (Zinco)</span>
                          <strong className="text-slate-900 dark:text-white font-bold">{parcelasNutrientsTotal.totalZnG.toFixed(0)} g/ha</strong>
                          <span className="text-[8px] text-slate-500 block">{parcelasNutrientsTotal.znPerPlantMg.toFixed(1)} mg/planta</span>
                        </div>
                        <div className="p-1.5 bg-slate-50 dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800">
                          <span className="text-[9px] text-slate-600 dark:text-slate-400 block font-bold">Cu (Cobre)</span>
                          <strong className="text-slate-900 dark:text-white font-bold">{parcelasNutrientsTotal.totalCuG.toFixed(0)} g/ha</strong>
                        </div>
                        <div className="p-1.5 bg-slate-50 dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800">
                          <span className="text-[9px] text-slate-600 dark:text-slate-400 block font-bold">Mn (Manganês)</span>
                          <strong className="text-slate-900 dark:text-white font-bold">{parcelasNutrientsTotal.totalMnG.toFixed(0)} g/ha</strong>
                        </div>
                        <div className="p-1.5 bg-slate-50 dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800">
                          <span className="text-[9px] text-slate-600 dark:text-slate-400 block font-bold">Mo (Molibdênio)</span>
                          <strong className="text-slate-900 dark:text-white font-bold">{parcelasNutrientsTotal.totalMoG.toFixed(1)} g/ha</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Observações Gerais */}
                  <div className="pt-1">
                    <label className="font-bold text-[10px] text-slate-700 dark:text-slate-300 block mb-1">
                      Observações Gerais de Campo para Aplicação da Cobertura:
                    </label>
                    <input
                      type="text"
                      value={topdressingObservation}
                      onChange={e => setTopdressingObservation(e.target.value)}
                      placeholder="Ex: Aplicar via fertirrigação ou na projeção da copa antes do período chuvoso."
                      className="w-full p-2 bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-lg text-xs font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* CENTRAL DE NOTIFICAÇÕES & AGENDAMENTO DE ADUBAÇÃO         */}
          {/* ========================================================= */}
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 border-slate-200 dark:border-zinc-800 gap-4">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl relative">
                  <Bell className="w-5 h-5 animate-pulse" />
                  {reminders.filter(r => r.status === 'agendado').length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                      {reminders.filter(r => r.status === 'agendado').length}
                    </span>
                  )}
                </span>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    🔔 Central de Lembretes & Notificações de Adubação
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Programe alertas de aplicação e envie receitas agronômicas para produtores e operadores.
                  </p>
                </div>
              </div>

              {/* Browser notification activation */}
              <div className="flex items-center gap-2">
                {browserNotificationPermission !== 'granted' ? (
                  <button
                    type="button"
                    onClick={requestNotificationPermission}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    Ativar Avisos no Navegador
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                    Notificações Ativas
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Col */}
              <div className="lg:col-span-5 p-4 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 rounded-2xl space-y-4">
                <strong className="text-xs font-black text-slate-900 dark:text-white block uppercase tracking-wider border-b pb-2 dark:border-zinc-800">
                  📅 Agendar Novo Alerta
                </strong>

                {/* Tipo de Lembrete Toggle */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 block uppercase">Tipo de Adubação</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setReminderType('plantio')}
                      className={`py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${reminderType === 'plantio' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white dark:bg-zinc-800 border dark:border-zinc-700 text-slate-700 dark:text-slate-300'}`}
                    >
                      🌱 Plantio (Sulco)
                    </button>
                    <button
                      type="button"
                      onClick={() => setReminderType('cobertura')}
                      className={`py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${reminderType === 'cobertura' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white dark:bg-zinc-800 border dark:border-zinc-700 text-slate-700 dark:text-slate-300'}`}
                    >
                      💧 Cobertura
                    </button>
                  </div>
                </div>

                {/* Parcela Selector (cobertura only) */}
                {reminderType === 'cobertura' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 block uppercase">Selecionar Parcela</label>
                    <select
                      value={reminderParcelaIndex}
                      onChange={e => setReminderParcelaIndex(Number(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-black border border-slate-200 dark:border-zinc-705 rounded-lg text-xs font-bold text-slate-800 dark:text-zinc-200 cursor-pointer"
                    >
                      {parcelaList.map((p, idx) => (
                        <option key={p.id} value={idx}>
                          {idx + 1}ª Parcela ({p.timing || 'Sem época'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Info Box Preview */}
                <div className="p-3 bg-white dark:bg-zinc-950 border dark:border-zinc-800 rounded-xl space-y-1.5 text-[11px]">
                  <span className="text-[9px] font-black text-slate-400 block uppercase">Prévia dos Dados Fornecidos</span>
                  <div>
                    <span className="text-slate-500">Cultura:</span>{' '}
                    <strong className="text-slate-900 dark:text-white font-bold">
                      {reminderType === 'plantio'
                        ? (CROP_PLANTING_RECOMMENDATIONS.find(c => c.cropId === selectedPlantingCropId)?.cropName || currentSoil?.cropName || 'Cultura')
                        : (currentSoil?.cropName || 'Cultura')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Adubo & Dosagem:</span>{' '}
                    <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
                      {reminderType === 'plantio'
                        ? `${activeFertilizerGuarantees.name} @ ${plantingNutrientsSupplied.doseKgHa} kg/ha`
                        : `${parcelaList[reminderParcelaIndex]?.fertilizers?.map((f: any) => `${f.sourceId === 'min-kcl' ? 'KCl' : f.sourceId === 'min-ureia' ? 'Ureia' : f.sourceId === 'min-sulfato-amonio' ? 'Sulfato de Amônio' : 'Adubo'}`).join(' + ') || 'Adubo'} @ ${parcelaList[reminderParcelaIndex]?.fertilizers?.map((f: any) => `${f.doseKgHa} kg/ha`).join(' + ') || '0 kg/ha'}`}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Área:</span>{' '}
                    <strong className="text-slate-900 dark:text-white font-bold">{currentSoil?.areaHa || 50} ha</strong>
                  </div>
                </div>

                {/* Recipient details */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 block uppercase mb-1">Destinatário</label>
                      <input
                        type="text"
                        value={reminderRecipientName}
                        onChange={e => setReminderRecipientName(e.target.value)}
                        placeholder="Nome do receptor"
                        className="w-full p-2 bg-white dark:bg-black border border-slate-200 dark:border-zinc-750 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 block uppercase mb-1">WhatsApp (DDD+Num)</label>
                      <input
                        type="text"
                        value={reminderRecipientPhone}
                        onChange={e => setReminderRecipientPhone(e.target.value)}
                        placeholder="Ex: 5511999999999"
                        className="w-full p-2 bg-white dark:bg-black border border-slate-200 dark:border-zinc-750 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 block uppercase mb-1">E-mail de Notificação</label>
                    <input
                      type="email"
                      value={reminderRecipientEmail}
                      onChange={e => setReminderRecipientEmail(e.target.value)}
                      placeholder="Email de destino"
                      className="w-full p-2 bg-white dark:bg-black border border-slate-200 dark:border-zinc-750 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Scheduling dates */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 block uppercase mb-1">Data Programada</label>
                    <input
                      type="date"
                      value={reminderDate}
                      onChange={e => setReminderDate(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-black border border-slate-200 dark:border-zinc-750 rounded-lg text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 block uppercase mb-1">Hora</label>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={e => setReminderTime(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-black border border-slate-200 dark:border-zinc-750 rounded-lg text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                    />
                  </div>
                </div>

                {/* Notification Channel */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 block uppercase">Canal de Envio Principal</label>
                  <select
                    value={reminderChannel}
                    onChange={e => setReminderChannel(e.target.value as any)}
                    className="w-full p-2 bg-white dark:bg-black border border-slate-200 dark:border-zinc-750 rounded-lg text-xs font-bold text-slate-800 dark:text-zinc-200 cursor-pointer"
                  >
                    <option value="whatsapp">📱 Disparo Integrado do WhatsApp</option>
                    <option value="browser">💻 Notificação de Navegador (Push)</option>
                    <option value="email">✉️ E-mail Técnico de Recomendação</option>
                    <option value="in_app">🔔 Apenas Alerta no App</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleAddReminder}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  Salvar e Agendar Alerta
                </button>
              </div>

              {/* Active Reminders List Col */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between border-b pb-2 dark:border-zinc-800">
                  <strong className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    🔔 Lista de Lembretes Ativos
                  </strong>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                    {(reminders || []).length} no total
                  </span>
                </div>

                {(reminders || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 dark:bg-zinc-900/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800">
                    <Clock className="w-8 h-8 text-slate-300 dark:text-zinc-700 mb-2" />
                    <p className="text-slate-800 dark:text-slate-400 font-bold text-xs">Nenhum lembrete agendado</p>
                    <p className="text-slate-500 dark:text-slate-500 text-[10px] mt-0.5 max-w-xs leading-normal">
                      Programe um lembrete usando o formulário à esquerda para monitorar a aplicação no campo.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 font-sans">
                    {reminders.map((rem: any) => (
                      <div
                        key={rem.id}
                        className={`p-3.5 bg-white dark:bg-zinc-900 border rounded-xl shadow-2xs space-y-2.5 transition-all ${rem.status === 'enviado' ? 'opacity-85 border-slate-200 dark:border-zinc-800' : 'border-amber-200 dark:border-amber-900/60'}`}
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${rem.type === 'plantio' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'}`}>
                              {rem.type === 'plantio' ? '🌱 Plantio' : `💧 Cobertura (P-${rem.parcelaNum})`}
                            </span>
                            <strong className="text-xs text-slate-900 dark:text-white font-bold truncate max-w-[120px]">
                              {rem.cropName}
                            </strong>
                          </div>
                          <span className={`text-[10px] font-semibold flex items-center gap-1 ${rem.status === 'enviado' ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-amber-600 dark:text-amber-400'}`}>
                            {rem.status === 'enviado' ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Notificado
                              </>
                            ) : (
                              <>
                                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
                                {rem.scheduledDate.split('-').reverse().join('/')} às {rem.scheduledTime}
                              </>
                            )}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-800 dark:text-slate-300">
                          <div>
                            <span className="text-slate-500 text-[10px]">Adubo:</span>{' '}
                            <strong className="font-semibold text-slate-900 dark:text-zinc-100">{rem.fertilizerName}</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px]">Recomendação:</span>{' '}
                            <strong className="font-semibold text-slate-900 dark:text-zinc-100">{rem.dose}</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px]">Destinatário:</span>{' '}
                            <strong className="font-semibold text-slate-900 dark:text-zinc-100">{rem.recipientName}</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px]">Volume Total:</span>{' '}
                            <strong className="font-black text-slate-900 dark:text-zinc-100">{rem.totalKg.toLocaleString('pt-BR')} kg</strong>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t pt-2 dark:border-zinc-800 flex-wrap gap-2">
                          <div className="flex gap-2 flex-wrap">
                            {rem.channel === 'whatsapp' && (
                              <button
                                type="button"
                                onClick={() => triggerWhatsApp(rem)}
                                className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800 cursor-pointer transition-colors"
                              >
                                <MessageCircle className="w-3 h-3" />
                                Enviar WhatsApp
                              </button>
                            )}
                            {rem.channel === 'email' && (
                              <button
                                type="button"
                                onClick={() => triggerEmail(rem)}
                                className="inline-flex items-center gap-1 text-[10px] font-black text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/40 px-2 py-1 rounded-md border border-blue-200 dark:border-blue-800 cursor-pointer transition-colors"
                              >
                                <Mail className="w-3 h-3" />
                                Enviar E-mail
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                playNotificationChime();
                                setActiveFiredReminder(rem);
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-black text-slate-600 hover:text-slate-700 bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded-md cursor-pointer transition-colors"
                            >
                              <Bell className="w-3 h-3" />
                              Simular Notificação
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setReminders(prev => prev.filter(r => r.id !== rem.id));
                              showNotification('🗑️ Lembrete removido!');
                            }}
                            className="text-red-500 hover:text-red-650 p-1.5 bg-red-50 hover:bg-red-100 dark:bg-zinc-850 dark:hover:bg-red-950/50 rounded-lg cursor-pointer transition-colors"
                            title="Remover Lembrete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CALCULADORA DE POPULAÇÃO DE PLANTAS                       */}
      {/* ========================================================= */}
      {activeTab === 'calculadora_populacao' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-6 text-xs">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center border-b pb-4 gap-3 border-slate-200 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl">
                    <Calculator className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-white">
                      Calculadora de População e Estande de Plantas
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Cálculo de densidade populacional, metros de sulco por hectare, sementes por metro e regulagem da plantadeira.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('adubacao_plantio');
                    showNotification('População e espaçamento vinculados à Adubação de Plantio!');
                  }}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Sprout className="w-4 h-4" />
                  Ir para Adubação de Plantio
                </button>
              </div>
            </div>

            {/* Presets Quick Selector */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2">
              <span className="font-bold text-xs text-slate-700 dark:text-slate-300 block">
                ⚡ Seleção Rápida de Cultura (Parâmetros Padrão Recomendados):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULATION_CROP_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPopPreset(p.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                      selectedPopPresetId === p.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {p.name} ({p.rowSpacing}m × {p.plantsPerM ? `${p.plantsPerM} pl/m` : `${p.plantDistM}m`})
                  </button>
                ))}
              </div>
            </div>

            {/* Main Input Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Box 1: Espaçamento & Arranjo */}
              <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b pb-2 border-emerald-200/60 dark:border-emerald-800/60">
                  <h4 className="font-black text-sm text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    📏 1. Geometria do Plantio e Arranjo
                  </h4>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 font-bold px-2 py-0.5 rounded-md">
                    Espaçamento de Campo
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        Espaçamento entre Linhas (m):
                      </label>
                      <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                        {rowSpacingM !== '' ? (Number(rowSpacingM) * 100).toFixed(0) : '45'} cm
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.05"
                      value={rowSpacingM}
                      onChange={e => {
                        setRowSpacingM(e.target.value === '' ? '' : Number(e.target.value));
                        setCustomPopulationHa('');
                      }}
                      className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        Modo de Arranjo na Linha:
                      </label>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setPlantSpacingMode('per_meter')}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md cursor-pointer ${
                            plantSpacingMode === 'per_meter'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          Plantas por Metro
                        </button>
                        <button
                          type="button"
                          onClick={() => setPlantSpacingMode('plant_distance')}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md cursor-pointer ${
                            plantSpacingMode === 'plant_distance'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          Distância entre Plantas
                        </button>
                      </div>
                    </div>

                    {plantSpacingMode === 'per_meter' ? (
                      <div>
                        <input
                          type="number"
                          step="0.5"
                          placeholder="Ex: 12 plantas/m"
                          value={plantsPerMeter}
                          onChange={e => {
                            setPlantsPerMeter(e.target.value === '' ? '' : Number(e.target.value));
                            setCustomPopulationHa('');
                          }}
                          className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white"
                        />
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          Equivale a 1 planta a cada {plantsPerMeter !== '' && Number(plantsPerMeter) > 0 ? ((1 / Number(plantsPerMeter)) * 100).toFixed(1) : '8.3'} cm na linha.
                        </span>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 0.18 m"
                          value={plantSpacingM}
                          onChange={e => {
                            setPlantSpacingM(e.target.value === '' ? '' : Number(e.target.value));
                            setCustomPopulationHa('');
                          }}
                          className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white"
                        />
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          Equivale a {plantSpacingM !== '' && Number(plantSpacingM) > 0 ? (1 / Number(plantSpacingM)).toFixed(1) : '5.5'} plantas por metro linear.
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="font-bold text-xs text-slate-800 dark:text-slate-200 block mb-1">
                      Ou Digite a População Desejada (Sobrescrever plantas/ha):
                    </label>
                    <input
                      type="number"
                      step="1000"
                      placeholder="Ex: 280000 para definir direto no hectare"
                      value={customPopulationHa}
                      onChange={e => setCustomPopulationHa(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-xs text-emerald-700 dark:text-emerald-400"
                    />
                    {customPopulationHa !== '' && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-1 block">
                        ⚠️ População fixada manualmente em {Number(customPopulationHa).toLocaleString('pt-BR')} pl/ha.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Box 2: Qualidade de Sementes & Fatores de Perda */}
              <div className="p-5 bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/60 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b pb-2 border-teal-200/60 dark:border-teal-800/60">
                  <h4 className="font-black text-sm text-teal-900 dark:text-teal-300 flex items-center gap-1.5">
                    🌱 2. Qualidade da Semente & Fatores de Campo
                  </h4>
                  <span className="text-[10px] bg-teal-100 dark:bg-teal-900/80 text-teal-800 dark:text-teal-200 font-bold px-2 py-0.5 rounded-md">
                    Ajuste de Plantabilidade
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-xs text-slate-800 dark:text-slate-200 block mb-1">
                      Germinação Lab (%):
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="50"
                      max="100"
                      value={germinationRatePct}
                      onChange={e => setGerminationRatePct(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-xs text-slate-800 dark:text-slate-200 block mb-1">
                      Emergência Campo (%):
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="50"
                      max="100"
                      value={emergenceRatePct}
                      onChange={e => setEmergenceRatePct(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-xs text-slate-800 dark:text-slate-200 block mb-1">
                      PMV - Peso 1000 Sementes (g):
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={thousandSeedWeightG}
                      onChange={e => setThousandSeedWeightG(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Ex: 160g"
                      className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-xs text-slate-800 dark:text-slate-200 block mb-1">
                      Sementes por Saco / BAG:
                    </label>
                    <input
                      type="number"
                      step="1000"
                      value={seedsPerBag}
                      onChange={e => setSeedsPerBag(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Ex: 60000"
                      className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-xs"
                    />
                  </div>
                </div>

                <div className="p-3 bg-white/80 dark:bg-zinc-900/80 rounded-xl border border-teal-100 dark:border-teal-900 text-[11px] text-teal-900 dark:text-teal-200 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Fator de Sobrevivência Efetivo:</span>
                    <span className="text-teal-700 dark:text-teal-300">
                      {((seedStandMetrics.germ / 100) * (seedStandMetrics.emerg / 100) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    💡 Para obter {calculatedPopulationHa.toLocaleString('pt-BR')} plantas/ha no estande final, você precisará distribuir {seedStandMetrics.seedsPerHa.toLocaleString('pt-BR')} sementes/ha na plantadeira.
                  </p>
                </div>
              </div>
            </div>

            {/* Metric Results Bento Cards */}
            <div className="space-y-3 border-t pt-4 border-slate-200 dark:border-zinc-800">
              <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                📊 Resultados do Estande Populacional e Distribuição de Sementes
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400">
                    🪴 Estande Final Desejado
                  </span>
                  <strong className="text-base text-emerald-900 dark:text-emerald-200 font-black my-1">
                    {calculatedPopulationHa.toLocaleString('pt-BR')}
                  </strong>
                  <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-semibold">
                    plantas / ha
                  </span>
                </div>

                <div className="p-3.5 bg-teal-50 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800/60 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-teal-800 dark:text-teal-400">
                    🎯 Sementes a Plantar / ha
                  </span>
                  <strong className="text-base text-teal-900 dark:text-teal-200 font-black my-1">
                    {seedStandMetrics.seedsPerHa.toLocaleString('pt-BR')}
                  </strong>
                  <span className="text-[9px] text-teal-700 dark:text-teal-400 font-semibold">
                    sementes / ha
                  </span>
                </div>

                <div className="p-3.5 bg-cyan-50 dark:bg-cyan-950/40 rounded-2xl border border-cyan-200 dark:border-cyan-800/60 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-cyan-800 dark:text-cyan-400">
                    📏 Sementes por Metro
                  </span>
                  <strong className="text-base text-cyan-900 dark:text-cyan-200 font-black my-1">
                    {seedStandMetrics.seedsPerM}
                  </strong>
                  <span className="text-[9px] text-cyan-700 dark:text-cyan-400 font-semibold">
                    sementes / m linear
                  </span>
                </div>

                <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800/60 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-blue-800 dark:text-blue-400">
                    📦 Consumo de Sacaria
                  </span>
                  <strong className="text-base text-blue-900 dark:text-blue-200 font-black my-1">
                    {seedStandMetrics.bagsPerHa}
                  </strong>
                  <span className="text-[9px] text-blue-700 dark:text-blue-400 font-semibold">
                    sacos ({seedStandMetrics.bagSeeds.toLocaleString('pt-BR')} sem) / ha
                  </span>
                </div>

                <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800/60 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-purple-800 dark:text-purple-400">
                    ⚖️ Quilo de Sementes / ha
                  </span>
                  <strong className="text-base text-purple-900 dark:text-purple-200 font-black my-1">
                    {seedStandMetrics.kgSeedsPerHa}
                  </strong>
                  <span className="text-[9px] text-purple-700 dark:text-purple-400 font-semibold">
                    kg sementes / ha (PMV {seedStandMetrics.pmv}g)
                  </span>
                </div>

                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800/60 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400">
                    🚜 Sulco por Hectare
                  </span>
                  <strong className="text-base text-amber-900 dark:text-amber-200 font-black my-1">
                    {furrowMetersHa.toLocaleString('pt-BR')}
                  </strong>
                  <span className="text-[9px] text-amber-700 dark:text-amber-400 font-semibold">
                    metros lineares / ha
                  </span>
                </div>
              </div>
            </div>

            {/* Total Field Area Scale Table & Agronomic Directive */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
              <div className="lg:col-span-2 p-5 bg-slate-50 dark:bg-zinc-900/80 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    📑 Balanço Geral de Sementes para a Área Total do Talhão ({currentSoil?.areaHa || 50} ha)
                  </h4>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                    Talhão: {currentSoil?.fieldName || 'Talhão 01'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 font-bold">
                        <th className="py-2">Métrica Agronômica</th>
                        <th className="py-2 text-right">Por Hectare (1 ha)</th>
                        <th className="py-2 text-right">Área Total ({currentSoil?.areaHa || 50} ha)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 font-medium">
                      <tr>
                        <td className="py-2 text-slate-700 dark:text-slate-300">População de Plantas Viva</td>
                        <td className="py-2 text-right font-bold text-emerald-600">{calculatedPopulationHa.toLocaleString('pt-BR')} pl</td>
                        <td className="py-2 text-right font-black text-emerald-700 dark:text-emerald-400">{totalFieldPopulation.toLocaleString('pt-BR')} pl</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-700 dark:text-slate-300">Sementes Distribuídas</td>
                        <td className="py-2 text-right font-bold text-teal-600">{seedStandMetrics.seedsPerHa.toLocaleString('pt-BR')} sem</td>
                        <td className="py-2 text-right font-black text-teal-700 dark:text-teal-400">{seedStandMetrics.totalSeedsField.toLocaleString('pt-BR')} sem</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-700 dark:text-slate-300">Sacaria / BAGs ({seedStandMetrics.bagSeeds.toLocaleString('pt-BR')} sem/saco)</td>
                        <td className="py-2 text-right font-bold text-blue-600">{seedStandMetrics.bagsPerHa} sacos</td>
                        <td className="py-2 text-right font-black text-blue-700 dark:text-blue-400">{seedStandMetrics.totalBagsField} sacos</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-700 dark:text-slate-300">Peso Total de Sementes (kg)</td>
                        <td className="py-2 text-right font-bold text-purple-600">{seedStandMetrics.kgSeedsPerHa} kg</td>
                        <td className="py-2 text-right font-black text-purple-700 dark:text-purple-400">{seedStandMetrics.totalKgSeedsField.toLocaleString('pt-BR')} kg</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-700 dark:text-slate-300">Metros de Sulco de Plantio</td>
                        <td className="py-2 text-right font-bold text-amber-600">{furrowMetersHa.toLocaleString('pt-BR')} m</td>
                        <td className="py-2 text-right font-black text-amber-700 dark:text-amber-400">{(furrowMetersHa * (currentSoil?.areaHa || 50)).toLocaleString('pt-BR')} m</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-5 bg-emerald-950 text-white rounded-2xl space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black tracking-wider uppercase text-emerald-400 block mb-1">
                    💡 Diretriz Agronômica de Plantabilidade
                  </span>
                  <h4 className="font-black text-sm text-white mb-2">
                    Estande Ideal & Fechamento de Canopy
                  </h4>
                  <p className="text-[11px] text-emerald-100/90 leading-relaxed">
                    O arranjo espacial com espaçamento de <strong>{rowSpacingM || 0.45} m</strong> e <strong>{seedStandMetrics.seedsPerM} sementes/m</strong> proporciona uma distribuição uniforme no sulco. Essa densidade otimiza a interceptação de luz solar, reduz a competição intraespecífica e acelera o fechamento do dossel, inibindo o desenvolvimento de plantas daninhas.
                  </p>
                </div>

                <div className="pt-3 border-t border-emerald-800 flex justify-between items-center text-[10px] text-emerald-300 font-bold">
                  <span>Velocidade de Plantio Recomendada:</span>
                  <span className="bg-emerald-800 text-white px-2 py-0.5 rounded-md">4,5 a 6,0 km/h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. CURVAS DE ABSORÇÃO                                     */}
      {/* ========================================================= */}
      {activeTab === 'curvas_absorcao' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-6 text-xs">
            {/* Header section with description and crop select */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b pb-4 gap-4">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>📈 Curvas de Marcha de Absorção e Sincronismo Nutricional</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Monitore e compare a demanda teórica da cultura versus a recomendação oficial do boletim e a adubação realmente configurada em seu plano.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">Selecione a Cultura (250 integradas)</span>
                  <select
                    value={selectedCurveCrop}
                    onChange={e => setSelectedCurveCrop(e.target.value)}
                    className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-2.5 font-bold cursor-pointer text-xs w-full sm:w-64"
                  >
                    {CROP_PLANTING_RECOMMENDATIONS.map(c => (
                      <option key={c.cropId} value={c.cropId}>{c.cropName}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Customization controls & nutrient tabs */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-4 bg-slate-50/60 dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl">
              {/* Sliders to customize cycle days and displayed days */}
              <div className="md:col-span-6 space-y-4">
                <strong className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                  ⚙️ Personalização Temporal do Ciclo
                </strong>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Duração do Ciclo da Cultura:</span>
                      <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md font-extrabold">{curveCycleDays} Dias</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="30"
                        max="365"
                        value={curveCycleDays}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setCurveCycleDays(val);
                          if (curveDisplayDays > val) setCurveDisplayDays(val);
                        }}
                        className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Exibir no Gráfico até o dia:</span>
                      <span className="text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded-md font-extrabold">{curveDisplayDays} DAE</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="10"
                        max={curveCycleDays}
                        value={curveDisplayDays}
                        onChange={e => setCurveDisplayDays(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Grouped Nutrient Buttons Row (Macro & Micro) */}
              <div className="md:col-span-6 space-y-3">
                <strong className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                  🧪 Seleção de Nutrientes para Análise
                </strong>

                <div className="space-y-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-slate-500">Macronutrientes (em kg/ha)</span>
                    <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl">
                      {[
                        { key: 'N', label: 'N', color: 'bg-emerald-600' },
                        { key: 'P2O5', label: 'P₂O₅', color: 'bg-teal-600' },
                        { key: 'K2O', label: 'K₂O', color: 'bg-cyan-600' },
                        { key: 'Ca', label: 'Ca', color: 'bg-blue-600' },
                        { key: 'Mg', label: 'Mg', color: 'bg-indigo-600' },
                        { key: 'S', label: 'S', color: 'bg-amber-600' }
                      ].map(item => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setSelectedCurveNutrient(item.key)}
                          className={`flex-1 min-w-[50px] px-2 py-1.5 text-[10px] font-extrabold rounded-lg cursor-pointer transition-all duration-150 ${selectedCurveNutrient === item.key ? `${item.color} text-white shadow-xs scale-102` : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-zinc-700/50'}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-slate-500">Micronutrientes (em g/ha)</span>
                    <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl">
                      {[
                        { key: 'B', label: 'Boro (B)', color: 'bg-purple-600' },
                        { key: 'Zn', label: 'Zinco (Zn)', color: 'bg-rose-600' },
                        { key: 'Cu', label: 'Cobre (Cu)', color: 'bg-orange-600' },
                        { key: 'Mn', label: 'Manganês (Mn)', color: 'bg-sky-600' },
                        { key: 'Fe', label: 'Ferro (Fe)', color: 'bg-lime-600' }
                      ].map(item => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setSelectedCurveNutrient(item.key)}
                          className={`flex-1 min-w-[70px] px-2 py-1.5 text-[10px] font-extrabold rounded-lg cursor-pointer transition-all duration-150 ${selectedCurveNutrient === item.key ? `${item.color} text-white shadow-xs scale-102` : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-zinc-700/50'}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Absorption Comparison Chart */}
            <div className="p-5 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <strong className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  📈 Gráfico de Sincronismo: Necessidade Teórica vs. Recomendação App vs. Aporte Efetivo ({selectedCurveNutrient})
                </strong>
                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded">
                  Unidade: {['B', 'Zn', 'Cu', 'Mn', 'Fe'].includes(selectedCurveNutrient) ? 'g/ha' : 'kg/ha'}
                </span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comparisonCurveData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="dae" tick={{ fontSize: 10 }} />
                    <YAxis label={{ value: ['B', 'Zn', 'Cu', 'Mn', 'Fe'].includes(selectedCurveNutrient) ? 'g/ha' : 'kg/ha', angle: -90, position: 'insideLeft', fontSize: 10 }} tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    
                    {/* Curve 1: Physiological crop necessity */}
                    <Line
                      type="monotone"
                      dataKey="demandaKgHa"
                      name={`1. Necessidade Fisiológica (${['B', 'Zn', 'Cu', 'Mn', 'Fe'].includes(selectedCurveNutrient) ? 'g/ha' : 'kg/ha'})`}
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                    />

                    {/* Curve 2: App recommendation based on official bulletin */}
                    <Line
                      type="stepAfter"
                      dataKey="recomendacaoApp"
                      name={`2. Recomendação Oficial do App (${['B', 'Zn', 'Cu', 'Mn', 'Fe'].includes(selectedCurveNutrient) ? 'g/ha' : 'kg/ha'})`}
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      strokeDasharray="4 4"
                      dot={{ r: 4 }}
                    />

                    {/* Curve 3: Effective applied by user config */}
                    <Line
                      type="stepAfter"
                      dataKey="aporteAppKgHa"
                      name={`3. Aporte Efetivo Aplicado no Plano (${['B', 'Zn', 'Cu', 'Mn', 'Fe'].includes(selectedCurveNutrient) ? 'g/ha' : 'kg/ha'})`}
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-[11px] text-emerald-900 dark:text-emerald-300 font-medium leading-relaxed space-y-1">
                <div>
                  ✅ <strong>Análise de Marcha de Sincronismo:</strong> A curva <strong>verde</strong> representa a necessidade fisiológica da planta ao longo dos dias após a emergência (DAE). A curva <strong>laranja</strong> mostra o cronograma teórico de adubação sugerido, e a curva <strong>azul</strong> exibe a adubação que o usuário configurou (considerando adubação de plantio e as parcelas de cobertura ativas).
                </div>
                {selectedCurveCrop === selectedPlantingCropId ? (
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                    💡 O sincronismo está ativo para a cultura corrente ({CROP_PLANTING_RECOMMENDATIONS.find(c => c.cropId === selectedCurveCrop)?.cropName}). Ajustes no plantio e coberturas na aba "Adubação" impactarão diretamente a curva azul de adubação aplicada.
                  </div>
                ) : (
                  <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                    ⚠️ Atenção: A cultura selecionada para o gráfico ({CROP_PLANTING_RECOMMENDATIONS.find(c => c.cropId === selectedCurveCrop)?.cropName}) difere da cultura ativa do talhão atual. Para visualizar o seu plano de adubação na curva azul, altere a cultura principal do talhão na aba de cima.
                  </div>
                )}
              </div>
            </div>

            {/* Table of Absorption Points */}
            <div className="space-y-2">
              <strong className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                📋 Valores Detalhados por Estádio Fenológico
              </strong>
              <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Estádio</th>
                      <th className="py-3 px-4">DAE Estimado</th>
                      <th className="py-3 px-4 text-center">Marcha de Absorção</th>
                      <th className="py-3 px-4 text-right">1. Nec. Fisiológica</th>
                      <th className="py-3 px-4 text-right">2. Rec. Recomendada</th>
                      <th className="py-3 px-4 text-right">3. Aporte Efetivo</th>
                      <th className="py-3 px-4 text-center">Status Sincronismo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {comparisonCurveData.map((pt, i) => {
                      const isMicro = ['B', 'Zn', 'Cu', 'Mn', 'Fe'].includes(selectedCurveNutrient);
                      const unit = isMicro ? 'g/ha' : 'kg/ha';
                      
                      // Agronomic comparison status
                      let statusBadge = (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400">
                          Sem Adubação
                        </span>
                      );

                      if (pt.aporteAppKgHa > 0) {
                        const ratio = pt.aporteAppKgHa / (pt.demandaKgHa || 1);
                        if (ratio >= 0.9 && ratio <= 1.3) {
                          statusBadge = (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400">
                              ✅ Ideal (Equilibrado)
                            </span>
                          );
                        } else if (ratio < 0.9) {
                          statusBadge = (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400">
                              ⚠️ Déficit (Falta {(pt.demandaKgHa - pt.aporteAppKgHa).toFixed(0)} {unit})
                            </span>
                          );
                        } else {
                          statusBadge = (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-400">
                              📈 Superavit (+{(pt.aporteAppKgHa - pt.demandaKgHa).toFixed(0)} {unit})
                            </span>
                          );
                        }
                      }

                      return (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/40">
                          <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{pt.stage}</td>
                          <td className="py-3 px-4 font-bold text-slate-600 dark:text-slate-400">{pt.dae}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded text-[10px]">
                              {pt.percentCrop}% absorvido
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-800 dark:text-zinc-100">
                            {pt.demandaKgHa} {unit}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-amber-600 dark:text-amber-400">
                            {pt.recomendacaoApp} {unit}
                          </td>
                          <td className="py-3 px-4 text-right font-black text-blue-600 dark:text-blue-400">
                            {pt.aporteAppKgHa} {unit}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {statusBadge}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. MISTURADOR DE FERTILIZANTES                            */}
      {/* ========================================================= */}
      {activeTab === 'mistura_fertilizantes' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-6 text-xs">
            <div className="border-b pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Misturador de Fertilizantes & Cálculo de Garantia
              </h3>
              <p className="text-xs text-slate-500">
                Simule misturas de matérias-primas simples para obter uma fórmula personalizada balanceada.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 border rounded-xl space-y-2 bg-slate-50 dark:bg-zinc-900">
                <label className="font-bold block">Fonte 1 (Fósforo/N):</label>
                <select value={mixerSourceA} onChange={e => setMixerSourceA(e.target.value)} className="w-full p-2 bg-white dark:bg-black border rounded-lg font-bold">
                  {MINERAL_FERTILIZERS_CATALOG.filter(f => f.type === 'simples').map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.formula})</option>
                  ))}
                </select>
                <label className="font-bold block pt-1">Quilos na Mistura (kg):</label>
                <input type="number" value={mixerKgA} onChange={e => setMixerKgA(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-2 bg-white dark:bg-black border rounded-lg font-bold" />
              </div>

              <div className="p-3 border rounded-xl space-y-2 bg-slate-50 dark:bg-zinc-900">
                <label className="font-bold block">Fonte 2 (Potássio):</label>
                <select value={mixerSourceB} onChange={e => setMixerSourceB(e.target.value)} className="w-full p-2 bg-white dark:bg-black border rounded-lg font-bold">
                  {MINERAL_FERTILIZERS_CATALOG.filter(f => f.type === 'simples').map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.formula})</option>
                  ))}
                </select>
                <label className="font-bold block pt-1">Quilos na Mistura (kg):</label>
                <input type="number" value={mixerKgB} onChange={e => setMixerKgB(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-2 bg-white dark:bg-black border rounded-lg font-bold" />
              </div>

              <div className="p-3 border rounded-xl space-y-2 bg-slate-50 dark:bg-zinc-900">
                <label className="font-bold block">Fonte 3 (Nitrogênio/Enxofre):</label>
                <select value={mixerSourceC} onChange={e => setMixerSourceC(e.target.value)} className="w-full p-2 bg-white dark:bg-black border rounded-lg font-bold">
                  {MINERAL_FERTILIZERS_CATALOG.filter(f => f.type === 'simples').map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.formula})</option>
                  ))}
                </select>
                <label className="font-bold block pt-1">Quilos na Mistura (kg):</label>
                <input type="number" value={mixerKgC} onChange={e => setMixerKgC(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-2 bg-white dark:bg-black border rounded-lg font-bold" />
              </div>
            </div>

            {/* Results Card */}
            <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-2xl space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <strong className="font-black text-sm text-emerald-900 dark:text-emerald-300">
                  Garantia Ponderada Final da Mistura:
                </strong>
                <span className="text-xs bg-emerald-600 text-white font-bold px-2 py-0.5 rounded">
                  Fórmula NPK {mixerResult.formula}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white dark:bg-black rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-bold">Garantia N-P₂O₅-K₂O</span>
                  <strong className="text-lg text-emerald-600 font-black">{mixerResult.finalN}% - {mixerResult.finalP2O5}% - {mixerResult.finalK2O}%</strong>
                </div>
                <div className="p-3 bg-white dark:bg-black rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-bold">Teor de Enxofre (S)</span>
                  <strong className="text-lg text-teal-600 font-black">{mixerResult.finalS}% S</strong>
                </div>
                <div className="p-3 bg-white dark:bg-black rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-bold">Peso Total da Mistura</span>
                  <strong className="text-lg text-slate-900 dark:text-white font-black">{mixerResult.totalWeightKg} kg</strong>
                </div>
                <div className="p-3 bg-white dark:bg-black rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-bold">Custo por Tonelada</span>
                  <strong className="text-lg text-amber-600 font-black">R$ {mixerResult.costPerTonR}/t</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* RECOMENDAÇÕES PERSONALIZADAS (ALGORITMOS MULTIPARÂMETRO)   */}
      {/* ========================================================= */}
      {activeTab === 'recomendacoes_personalizadas' && (
        <PersonalizedRecommendationsTab
          currentSoil={currentSoil}
          selectedFarm={selectedFarm}
          onApplyPlantingRecommendation={(formula, dose) => {
            setPlantingDoseKgHa(dose);
            showNotification(`✅ Adubação de plantio com ${formula} (${dose} kg/ha) aplicada ao planejamento!`);
          }}
          onApplyLimingRecommendation={(doseTons, corrective) => {
            showNotification(`✅ Calagem de ${doseTons} t/ha (${corrective}) sincronizada!`);
          }}
          onApplyGypsumRecommendation={(doseKg) => {
            showNotification(`✅ Gessagem de ${doseKg} kg/ha sincronizada com sucesso!`);
          }}
        />
      )}

      {activeTab === 'relatorio_laudo' && (
        <div className="space-y-6 animate-fade-in text-slate-800">
          {/* Action Header that doesn't get exported to PDF */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 dark:bg-zinc-900/60 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 gap-4">
            <div>
              <h4 className="font-black text-sm text-slate-800 dark:text-zinc-200">Exportação do Laudo Técnico Agronômico</h4>
              <p className="text-[11px] text-slate-500 max-w-xl">
                Gere um dossiê técnico profissional em PDF contendo dados analíticos, balanço químico de macro e micronutrientes, cálculos de correção de solo, adubação equilibrada e relações de sinergia vegetal.
              </p>
            </div>
            <div className="flex gap-2 shrink-0 w-full sm:w-auto">
              <button
                id="export-pdf-btn"
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/60 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
              >
                {isExportingPDF ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isExportingPDF ? 'Gerando PDF...' : 'Baixar Laudo PDF'}
              </button>
              <button
                onClick={handlePrintSystem}
                className="bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4" />
                Imprimir via Sistema
              </button>
            </div>
          </div>

          {/* Printable Report Content - True A4 WYSIWYG Architecture (No Overflow / Zero Spillover) */}
          <div className="overflow-x-auto pb-8 flex flex-col items-center gap-8 bg-slate-100 dark:bg-zinc-950 p-3 sm:p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <div id="recommendation-report-content" className="flex flex-col items-center gap-8">
              
              {/* PÁGINA 1: Diagnóstico e Correção do Solo (Calagem & Gessagem) */}
              <div
                className="report-pdf-page bg-white text-slate-900 border border-slate-300 shadow-2xl relative flex flex-col justify-between"
                style={{
                  width: '210mm',
                  height: '297mm',
                  minWidth: '210mm',
                  minHeight: '297mm',
                  maxWidth: '210mm',
                  maxHeight: '297mm',
                  padding: '10mm 12mm',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}
              >
                <div className="space-y-3.5">
                  {/* Visual Header Strip */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600" />

                  {/* Document Header with Registered Company Information & Logo */}
                  {company && company.name && company.name !== 'Nome da Empresa' && company.name.trim() !== '' ? (
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3 pt-1 gap-3">
                      <div className="flex items-center gap-3">
                        {company.logoUrl ? (
                          <img
                            src={company.logoUrl}
                            alt={company.name}
                            className="w-14 h-14 object-contain rounded-lg border border-slate-200 bg-white p-1 shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-slate-900 text-emerald-400 border border-slate-800 flex items-center justify-center font-black text-xl shrink-0">
                            {company.tradingName ? company.tradingName.slice(0, 2).toUpperCase() : company.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h1 className="text-base font-black text-slate-900 tracking-tight uppercase leading-none">
                            {company.name}
                          </h1>
                          {company.tradingName && company.tradingName !== company.name && (
                            <p className="text-[11px] font-bold text-emerald-700 mt-0.5">{company.tradingName}</p>
                          )}
                          <p className="text-[9px] text-slate-600 font-medium leading-tight mt-1">
                            {company.cnpj && <span>CNPJ: {company.cnpj}</span>}
                            {company.creaRegister && <span className="ml-2">• CREA PJ: {company.creaRegister}</span>}
                            {company.mapaRegister && <span className="ml-2">• MAPA: {company.mapaRegister}</span>}
                          </p>
                          <p className="text-[8.5px] text-slate-500 mt-0.5">
                            {company.address ? `${company.address}, ` : ''}{company.city} - {company.state} {company.phone ? `• Tel: ${company.phone}` : ''} {company.email ? `• ${company.email}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-[10px] shrink-0 bg-slate-50 border border-slate-200 p-2.5 rounded-lg shadow-2xs">
                        <span className="font-black text-emerald-700 uppercase tracking-wide block text-[9px]">Laudo Técnico Agronômico</span>
                        <p className="font-bold text-slate-900 text-xs mt-0.5">Nº LAUDO-2026-{(currentSoil?.sampleCode || '001').replace(/\D/g, '')}</p>
                        <p className="text-slate-500 text-[9px] mt-0.5">Amostra: <strong className="font-mono text-slate-800">{currentSoil.sampleCode}</strong></p>
                        <p className="text-slate-500 text-[9px]">Data da Análise: <strong className="font-mono text-slate-800">{currentSoil.analysisDate}</strong></p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3 pt-1 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-lg bg-slate-900 text-emerald-400 border border-slate-800 flex items-center justify-center font-black text-lg shrink-0">
                          GA
                        </div>
                        <div>
                          <span className="text-[9px] font-black uppercase text-emerald-600 tracking-wider block">
                            Consultoria e Tecnologia Agronômica • GeaAgro Suite
                          </span>
                          <h3 className="text-lg font-black text-slate-900 leading-tight">
                            Laudo de Recomendação Agronômica e Equilíbrio de Solo
                          </h3>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Relatório técnico integrado de fertilidade, calagem, gessagem e nutrição vegetal
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
                        <span className="font-black text-[9px] text-emerald-600 block">GEAAGRO RECOMENDAÇÕES PRO</span>
                        <span className="text-[9px] text-slate-500 block font-mono">Amostra: {currentSoil.sampleCode}</span>
                        <span className="text-[9px] text-slate-500 block font-mono">Data: {currentSoil.analysisDate}</span>
                      </div>
                    </div>
                  )}

                  {/* Client, Property & Technical Metadata Bar */}
                  <div className="grid grid-cols-4 gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 text-[10px]">
                    <div>
                      <span className="text-[8.5px] text-slate-400 block uppercase font-black">Produtor Rural / Cliente</span>
                      <strong className="text-slate-900 text-[10.5px] font-black block truncate">
                        {selectedFarm?.producerName || currentSoil?.producerName || 'Produtor Rural'}
                      </strong>
                      <span className="text-[8.5px] text-slate-500 block">Propriedade: {selectedFarm?.name || 'Fazenda Principal'}</span>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 block uppercase font-black">Talhão & Profundidade</span>
                      <strong className="text-slate-900 text-[10.5px] font-black block truncate">{currentSoil.plotName}</strong>
                      <span className="text-[8.5px] text-slate-500 block">Camada: {currentSoil.depth} cm ({currentSoil.texturalClass})</span>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 block uppercase font-black">Cultura & Estande</span>
                      <strong className="text-slate-900 text-[10.5px] font-black block truncate">{currentSoil.cropName} ({currentSoil.cultivar})</strong>
                      <span className="text-[8.5px] text-emerald-700 block font-bold">
                        {calculatedPopulationHa.toLocaleString('pt-BR')} pl/ha • Área: {currentSoil?.areaHa || 50} ha
                      </span>
                      <span className="text-[8px] text-slate-500 block truncate">
                        Total: {totalFieldPopulation.toLocaleString('pt-BR')} plantas na área
                      </span>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 block uppercase font-black">Responsável Técnico</span>
                      <strong className="text-slate-900 text-[10.5px] font-black block truncate">
                        {agronomist?.name || 'Engenheiro Agrônomo'}
                      </strong>
                      <span className="text-[8.5px] text-slate-500 block font-mono">
                        CREA-{agronomist?.creaState || 'MT'}: {agronomist?.crea || 'N/D'}
                      </span>
                    </div>
                  </div>

                  {/* Part 1: Chemical and Physical Soil Properties */}
                  <div className="space-y-1.5">
                    <h4 className="font-black text-[11px] text-slate-900 uppercase tracking-wider text-emerald-800 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                      <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
                      1. Teores Físico-Químicos Analisados
                    </h4>
                    <div className="grid grid-cols-6 gap-1.5 text-center">
                      <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[8.5px] text-slate-400 block font-semibold">pH CaCl₂</span>
                        <strong className="text-xs font-black text-slate-800">{currentSoil.phCaCl2}</strong>
                        <span className="text-[7.5px] text-slate-500 block">Acidez</span>
                      </div>
                      <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[8.5px] text-slate-400 block font-semibold">M. Orgânica</span>
                        <strong className="text-xs font-black text-slate-800">{currentSoil.organicMatterGKg} g/dm³</strong>
                        <span className="text-[7.5px] text-slate-500 block">Carbono</span>
                      </div>
                      <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[8.5px] text-slate-400 block font-semibold">Fósforo (P)</span>
                        <strong className="text-xs font-black text-slate-800">{currentSoil.pResina} mg/dm³</strong>
                        <span className="text-[7.5px] text-slate-500 block">Resina</span>
                      </div>
                      <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[8.5px] text-slate-400 block font-semibold">Potássio (K)</span>
                        <strong className="text-xs font-black text-slate-800">{currentSoil.kCmolc} cmol_c</strong>
                        <span className="text-[7.5px] text-slate-500 block">({(currentSoil.kCmolc * 391).toFixed(0)} mg)</span>
                      </div>
                      <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[8.5px] text-slate-400 block font-semibold">Cálcio (Ca)</span>
                        <strong className="text-xs font-black text-slate-800">{currentSoil.caCmolc} cmol_c</strong>
                        <span className="text-[7.5px] text-slate-500 block">Estrutural</span>
                      </div>
                      <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[8.5px] text-slate-400 block font-semibold">Magnésio (Mg)</span>
                        <strong className="text-xs font-black text-slate-800">{currentSoil.mgCmolc} cmol_c</strong>
                        <span className="text-[7.5px] text-slate-500 block">Clorofila</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-6 gap-1.5 text-center">
                      <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[8.5px] text-slate-400 block font-semibold">Enxofre (S)</span>
                        <strong className="text-xs font-black text-slate-800">{currentSoil.sSulfurMgDm3} mg/dm³</strong>
                        <span className="text-[7.5px] text-slate-500 block">Sulfato</span>
                      </div>
                      <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[8.5px] text-slate-400 block font-semibold">Saturação (V%)</span>
                        <strong className="text-xs font-black text-slate-800">{currentSoil.baseSaturationPercent}%</strong>
                        <span className="text-[7.5px] text-slate-500 block">Bases</span>
                      </div>
                      <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[8.5px] text-slate-400 block font-semibold">Alumínio (m%)</span>
                        <strong className="text-xs font-black text-slate-800">{currentSoil.aluminumSaturationPercent}%</strong>
                        <span className="text-[7.5px] text-slate-500 block">Toxidez</span>
                      </div>
                      <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[8.5px] text-slate-400 block font-semibold">CTC Efetiva (t)</span>
                        <strong className="text-xs font-black text-slate-800">{currentSoil.effectiveCtc} cmol_c</strong>
                        <span className="text-[7.5px] text-slate-500 block">Cátions</span>
                      </div>
                      <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[8.5px] text-slate-400 block font-semibold">CTC Potencial (T)</span>
                        <strong className="text-xs font-black text-slate-800">{currentSoil.potentialCtc} cmol_c</strong>
                        <span className="text-[7.5px] text-slate-500 block">pH 7.0</span>
                      </div>
                      <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[8.5px] text-slate-400 block font-semibold">Argila</span>
                        <strong className="text-xs font-black text-slate-800">{currentSoil.clayPercent}%</strong>
                        <span className="text-[7.5px] text-slate-500 block">Textura</span>
                      </div>
                    </div>
                  </div>

                  {/* Part 2: Correction & Gypsum Details */}
                  <div className="space-y-1.5">
                    <h4 className="font-black text-[11px] text-slate-900 uppercase tracking-wider text-emerald-800 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                      2. Recomendações de Correção do Solo (Calagem &amp; Gessagem em Área Total)
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2.5 border border-slate-200 rounded-xl space-y-1.5 bg-amber-50/15">
                        <span className="font-black text-[9.5px] uppercase text-amber-700 block">Operação: Método de Calagem</span>
                        <div className="flex justify-between items-center bg-amber-50/80 p-2 rounded-lg border border-amber-200/80">
                          <div>
                            <span className="text-[8.5px] text-slate-500 block">Dose por Hectare</span>
                            <strong className="text-sm font-black text-amber-900">{calagemResult.ncTonHa} t/ha</strong>
                            <span className="text-[8.5px] text-slate-500 block font-semibold">PRNT: {limingPrnt}%</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[8.5px] text-amber-700 font-extrabold uppercase block">Área Total ({currentSoil?.areaHa || 50} ha)</span>
                            <strong className="text-sm font-black text-amber-950">
                              {(calagemResult.ncTonHa * (currentSoil?.areaHa || 50)).toFixed(1)} t
                            </strong>
                            <span className="text-[7.5px] text-amber-800 block font-bold uppercase mt-0.5">
                              {currentBulletin.defaultLimingMethod === 'v_percent' ? 'Saturação por Bases' : 'Neutralização do Al'}
                            </span>
                          </div>
                        </div>
                        <p className="text-[8.5px] text-slate-600 leading-snug">
                          <strong>Recomendação:</strong> {calagemResult.limestoneType}. Incorporar a 0-20 cm com antecedência mínima de 60 dias para elevação plena do V%.
                          {limingObservation && <><br /><strong className="text-slate-700">Obs:</strong> {limingObservation}</>}
                        </p>
                      </div>

                      <div className="p-2.5 border border-slate-200 rounded-xl space-y-1.5 bg-teal-50/15">
                        <span className="font-black text-[9.5px] uppercase text-teal-700 block">Operação: Método de Gessagem</span>
                        <div className="flex justify-between items-center bg-teal-50/80 p-2 rounded-lg border border-teal-200/80">
                          <div>
                            <span className="text-[8.5px] text-slate-500 block">Dose por Hectare</span>
                            <strong className="text-sm font-black text-teal-900">{gessagemResult.ngTonHa} t/ha</strong>
                            <span className="text-[8.5px] text-slate-500 block font-semibold">Subsuperfície (20-40cm)</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[8.5px] text-teal-700 font-extrabold uppercase block">Área Total ({currentSoil?.areaHa || 50} ha)</span>
                            <strong className="text-sm font-black text-teal-950">
                              {(gessagemResult.ngTonHa * (currentSoil?.areaHa || 50)).toFixed(1)} t
                            </strong>
                            <span className="text-[7.5px] text-teal-800 block font-bold uppercase mt-0.5">Gesso Agrícola</span>
                          </div>
                        </div>
                        <p className="text-[8.5px] text-slate-600 leading-snug">
                          <strong>Recomendação:</strong> Gesso agrícola de alta pureza. Aplicar a lanço em área total sem incorporação profunda.
                          {gypsumObservation && <><br /><strong className="text-slate-700">Obs:</strong> {gypsumObservation}</>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Page 1 Footer */}
                <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-[8.5px] text-slate-400 font-mono mt-2">
                  <span>Laudo Técnico Agronômico • Amostra: {currentSoil.sampleCode} • Talhão: {currentSoil.plotName}</span>
                  <span className="font-bold uppercase tracking-wider text-slate-600">Página 1 de 2</span>
                </div>
              </div>

              {/* PÁGINA 2: Nutrição, Equilíbrio Mineral, Gráficos e Assinatura Digital */}
              <div
                className="report-pdf-page bg-white text-slate-900 border border-slate-300 shadow-2xl relative flex flex-col justify-between"
                style={{
                  width: '210mm',
                  height: '297mm',
                  minWidth: '210mm',
                  minHeight: '297mm',
                  maxWidth: '210mm',
                  maxHeight: '297mm',
                  padding: '10mm 12mm',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}
              >
                <div className="space-y-3">
                  {/* Visual Header Strip */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600" />

                  {/* Page 2 Mini Header */}
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2 pt-0.5 text-[9.5px]">
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900 font-black uppercase">{company?.name || 'GeaAgro Tech'}</strong>
                      <span className="text-slate-400">• Laudo Técnico Agronômico</span>
                    </div>
                    <div className="font-mono text-slate-500 text-[9px]">
                      Nº LAUDO-2026-{(currentSoil?.sampleCode || '001').replace(/\D/g, '')} • Amostra: <strong className="text-slate-800">{currentSoil.sampleCode}</strong>
                    </div>
                  </div>

                  {/* Part 3: Fertilization Requirements with complete plant, ha and total metrics */}
                  <div className="space-y-1.5">
                    <h4 className="font-black text-[11px] text-slate-900 uppercase tracking-wider text-emerald-800 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                      <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                      3. Programa de Nutrição e Fertilização Inteligente (g/planta, kg/ha, t/ha e Área Total)
                    </h4>
                    <div className="grid grid-cols-3 gap-2.5">
                      {/* Adubação de Plantio */}
                      <div className="p-2.5 border border-slate-200 rounded-xl space-y-1 bg-blue-50/15">
                        <span className="font-black text-[9.5px] uppercase text-blue-700 block">Adubação de Plantio (Sulco)</span>
                        <div className="bg-blue-50/80 p-2 rounded-lg border border-blue-200/80 space-y-0.5">
                          <div className="flex justify-between items-center border-b border-blue-200/50 pb-0.5">
                            <span className="text-[8.5px] text-slate-500 font-bold">Dose g/planta:</span>
                            <strong className="text-xs font-black text-blue-900">
                              {calculatedPopulationHa > 0 ? (plantingDoseKgHa * 1000 / calculatedPopulationHa).toFixed(1) : '0'} g/planta
                            </strong>
                          </div>
                          <div className="flex justify-between items-center text-[8.5px]">
                            <span className="text-slate-500 font-bold">Dose kg/ha:</span>
                            <strong className="font-black text-blue-800">{plantingDoseKgHa} kg/ha</strong>
                          </div>
                          <div className="flex justify-between items-center text-[8.5px]">
                            <span className="text-slate-500 font-bold">Dose t/ha:</span>
                            <strong className="font-black text-blue-800">{(plantingDoseKgHa / 1000).toFixed(3)} t/ha</strong>
                          </div>
                          <div className="flex justify-between items-center pt-0.5 border-t border-blue-200/50">
                            <span className="text-[8px] text-blue-700 font-black uppercase">Área Total ({currentSoil?.areaHa || 50} ha):</span>
                            <strong className="text-[11px] font-black text-blue-900">
                              {((plantingDoseKgHa * (currentSoil?.areaHa || 50)) / 1000).toFixed(2)} t
                            </strong>
                          </div>
                        </div>
                        <p className="text-[8px] text-slate-600 leading-tight">
                          Posicionar no sulco a 5cm abaixo e ao lado da semente.
                        </p>
                      </div>

                      {/* Adubação de Cobertura */}
                      <div className="p-2.5 border border-slate-200 rounded-xl space-y-1 bg-emerald-50/15">
                        <span className="font-black text-[9.5px] uppercase text-emerald-700 block truncate">Cobertura ({activeTopdressingData.name})</span>
                        <div className="bg-emerald-50/80 p-2 rounded-lg border border-emerald-200/80 space-y-0.5">
                          <div className="flex justify-between items-center border-b border-emerald-200/50 pb-0.5">
                            <span className="text-[8.5px] text-slate-500 font-bold">Dose g/planta:</span>
                            <strong className="text-xs font-black text-emerald-900">
                              {calculatedPopulationHa > 0 ? (topdressingDoseKgHa * 1000 / calculatedPopulationHa).toFixed(1) : '0'} g/planta
                            </strong>
                          </div>
                          <div className="flex justify-between items-center text-[8.5px]">
                            <span className="text-slate-500 font-bold">Dose kg/ha:</span>
                            <strong className="font-black text-emerald-800">{topdressingDoseKgHa} kg/ha</strong>
                          </div>
                          <div className="flex justify-between items-center text-[8.5px]">
                            <span className="text-slate-500 font-bold">Dose t/ha:</span>
                            <strong className="font-black text-emerald-800">{(topdressingDoseKgHa / 1000).toFixed(3)} t/ha</strong>
                          </div>
                          <div className="flex justify-between items-center pt-0.5 border-t border-emerald-200/50">
                            <span className="text-[8px] text-emerald-700 font-black uppercase">Área Total ({currentSoil?.areaHa || 50} ha):</span>
                            <strong className="text-[11px] font-black text-emerald-900">
                              {((topdressingDoseKgHa * (currentSoil?.areaHa || 50)) / 1000).toFixed(2)} t
                            </strong>
                          </div>
                        </div>
                        <p className="text-[8px] text-slate-600 leading-tight">
                          Fase vegetativa ativa (V4-V6). {topdressingSplits && topdressingSplits !== '1' ? `Parcelado em ${topdressingSplits}x.` : ''}
                        </p>
                      </div>

                      {/* Adubação Orgânica */}
                      <div className={`p-2.5 border border-slate-200 rounded-xl space-y-1 ${selectedOrganicId === 'org-nenhum' ? 'bg-slate-50 opacity-60' : 'bg-purple-50/15'}`}>
                        <span className={`font-black text-[9.5px] uppercase block ${selectedOrganicId === 'org-nenhum' ? 'text-slate-500' : 'text-purple-700'}`}>Adubação Orgânica</span>
                        <div className={`${selectedOrganicId === 'org-nenhum' ? 'bg-slate-100 border-slate-200' : 'bg-purple-50/80 border-purple-200/80'} p-2 rounded-lg border text-center space-y-0.5`}>
                          <span className="text-[8.5px] text-slate-500 block">Dose Orgânica</span>
                          <strong className={`text-xs font-black ${selectedOrganicId === 'org-nenhum' ? 'text-slate-700' : 'text-purple-900'}`}>{organicDoseTonHa} t/ha</strong>
                          <span className="text-[8px] text-purple-800 block font-bold">
                            Área Total ({currentSoil?.areaHa || 50} ha): {(organicDoseTonHa * (currentSoil?.areaHa || 50)).toFixed(1)} t
                          </span>
                          <span className={`text-[8px] ${selectedOrganicId === 'org-nenhum' ? 'text-slate-600' : 'text-purple-700'} block font-semibold truncate mt-0.5`}>{selectedOrganic.name}</span>
                        </div>
                        <p className="text-[8px] text-slate-600 leading-tight">
                          {selectedOrganicId === 'org-nenhum' 
                            ? 'Nenhuma adubação orgânica configurada.'
                            : 'Aporte biológico e carbono estável.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Part 4: Nutrient Balances and Physiology Relations */}
                  <div className="space-y-1.5">
                    <h4 className="font-black text-[11px] text-slate-900 uppercase tracking-wider text-emerald-800 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-600" />
                      4. Relações de Equilíbrio e Sinergia Mineral na Planta
                    </h4>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-150 text-center space-y-0.5">
                        <span className="text-[8px] text-slate-500 block font-black uppercase">Cálcio / Magnésio (Ca/Mg)</span>
                        <strong className="text-sm font-black text-slate-800 block">{currentSoil.caMgRatio} : 1</strong>
                        <span className="text-[8px] text-emerald-600 font-extrabold block">Ideal: 3 a 4 : 1</span>
                      </div>

                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-150 text-center space-y-0.5">
                        <span className="text-[8px] text-slate-500 block font-black uppercase">Ferro / Manganês (Fe/Mn)</span>
                        <strong className="text-sm font-black text-slate-800 block">
                          {Math.round((currentSoil.feFerroMgDm3 / (currentSoil.mnManganesMgDm3 || 0.1)) * 100) / 100} : 1
                        </strong>
                        <span className="text-[8px] text-emerald-600 font-extrabold block">Ideal: 1.5 a 3.0 : 1</span>
                      </div>

                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-150 text-center space-y-0.5">
                        <span className="text-[8px] text-slate-500 block font-black uppercase">Cálcio / Boro (Ca/B)</span>
                        <strong className="text-sm font-black text-slate-800 block">
                          {Math.round((currentSoil.caCmolc / (currentSoil.bBoroMgDm3 || 0.05)) * 10) / 10} : 1
                        </strong>
                        <span className="text-[8px] text-emerald-600 font-extrabold block">Ideal: 10.0 a 30.0 : 1</span>
                      </div>
                    </div>
                  </div>

                  {/* Part 5: Visual Static Representation of Charts inside the PDF */}
                  <div className="space-y-1.5">
                    <h4 className="font-black text-[11px] text-slate-900 uppercase tracking-wider text-emerald-800 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                      5. Análise de Adequação Nutricional (% do Alvo)
                    </h4>
                    <div className="grid grid-cols-2 gap-2.5 text-center">
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <strong className="text-[8.5px] text-slate-500 uppercase block font-black border-b pb-0.5">Macronutrientes (% de Adequação)</strong>
                        <div className="grid grid-cols-3 gap-1 mt-1 text-[8.5px]">
                          {macroComparisonChartData.map((item, idx) => (
                            <div key={idx} className="p-1 bg-white rounded border border-slate-100">
                              <span className="text-slate-400 block font-bold truncate">{item.name.split(' ')[0]}</span>
                              <strong className={`text-[11px] block ${item.Adequacao >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>{item.Adequacao}%</strong>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <strong className="text-[8.5px] text-slate-500 uppercase block font-black border-b pb-0.5">Micronutrientes (% de Adequação)</strong>
                        <div className="grid grid-cols-3 gap-1 mt-1 text-[8.5px]">
                          {microComparisonChartData.map((item, idx) => (
                            <div key={idx} className="p-1 bg-white rounded border border-slate-100">
                              <span className="text-slate-400 block font-bold truncate">{item.name.split(' ')[0]}</span>
                              <strong className={`text-[11px] block ${item.Adequacao >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>{item.Adequacao}%</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Document Footer, Signatures and Legal/Juridical Digital Seal */}
                  <div className="border-t border-slate-200 pt-2 space-y-2">
                    <div className="flex justify-between items-center gap-3">
                      <div className="text-slate-400 text-[8px] leading-tight max-w-sm">
                        <strong>Responsabilidade Técnica Agronômica:</strong> Laudo gerado com base em boletins agronômicos oficiais. Recomenda-se acompanhamento presencial do engenheiro agrônomo com registro ativo no CREA.
                      </div>
                      
                      {/* Legal/Juridical Digital Signature Block */}
                      <div className="flex flex-col items-end text-right shrink-0 bg-emerald-50/50 border border-emerald-200/80 p-2 rounded-lg min-w-[220px]">
                        <div className="flex items-center gap-1 mb-0.5 text-emerald-700 font-bold text-[8px] uppercase tracking-wider">
                          <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>Assinado Digitalmente</span>
                        </div>
                        <div className="font-serif italic text-[11px] text-slate-800 font-bold bg-white/90 py-0.5 px-2 rounded border border-slate-200 border-dashed mb-0.5">
                          {agronomist?.signatureText || (agronomist ? `${agronomist.name} - CREA-${agronomist.creaState} ${agronomist.crea}` : 'Eng. Agrônomo Responsável')}
                        </div>
                        <div className="text-left w-full border-t border-slate-200 pt-0.5 text-[7px] text-slate-400 font-mono space-y-0.5">
                          <p className="truncate"><strong className="text-slate-500 font-sans">HASH:</strong> {agronomist?.legalSignatureHash || 'SHA256: 4e9d92e8d14bc16a908da45b62b109312d4a13f8'}</p>
                          <p><strong className="text-slate-500 font-sans">DATA:</strong> {agronomist?.legalSignatureDate || new Date().toLocaleString('pt-BR')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Responsible Agronomist Information Footer Grid */}
                    <div className="flex justify-between items-center border-t border-slate-100 pt-1.5 text-[8.5px]">
                      <div>
                        <span className="text-slate-900 font-black">Engenheiro Agrônomo: </span>
                        <strong className="text-slate-700">{agronomist?.name || 'Lucas Silva Mendes'}</strong>
                      </div>
                      <div className="text-slate-600">
                        <span>CREA-{agronomist?.creaState || 'MT'} nº {agronomist?.crea || '4210'}</span>
                        {agronomist?.rnp && <span className="ml-2 font-mono">• RNP: {agronomist.rnp}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Page 2 Footer */}
                <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-[8.5px] text-slate-400 font-mono mt-2">
                  <span>Laudo Técnico Agronômico • Amostra: {currentSoil.sampleCode} • Sistema GeaAgro PRO</span>
                  <span className="font-bold uppercase tracking-wider text-slate-600">Página 2 de 2</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* GÊMEO DIGITAL DO SOLO (DASHBOARD IMERSIVO & SIMULADOR)    */}
      {/* ========================================================= */}
      {activeTab === 'gemeo_digital_solo' && (
        <div className="space-y-6 animate-fade-in text-xs">
          <div className="bg-gradient-to-r from-emerald-900/10 to-teal-950/10 border border-emerald-500/20 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                Gêmeo Digital de Solo Ativo
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-1.5 flex items-center gap-1.5">
                <Globe className="w-5 h-5 text-emerald-600 animate-spin-slow" />
                Simulação Multicamada e Crescimento Radicular
              </h3>
              <p className="text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
                O gêmeo digital projeta o comportamento físico, químico e biológico do perfil do solo. Selecione a profundidade ou ajuste os controles para prever o enraizamento e a retenção hídrica em tempo real.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <span className="bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-3 py-1.5 rounded-xl font-bold text-slate-700 dark:text-zinc-300">
                Amostra: <strong className="font-mono text-emerald-600">{currentSoil.sampleCode}</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* COLUMN 1: Profile Selector & Depth Layers (lg:col-span-3) */}
            <div className="lg:col-span-3 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs space-y-3">
              <h4 className="font-black text-[10px] uppercase text-slate-500 tracking-wider">Perfil Vertical de Profundidade</h4>
              <div className="flex flex-col gap-2.5">
                {[
                  {
                    id: '0-20',
                    label: 'Camada de Diagnóstico (0-20 cm)',
                    desc: 'Alta atividade biológica, maior teor de matéria orgânica e carbono.',
                    color: 'border-amber-700/60 bg-amber-950/5 dark:bg-amber-950/10',
                    textColor: 'text-amber-800 dark:text-amber-300',
                  },
                  {
                    id: '20-40',
                    label: 'Camada de Transição (20-40 cm)',
                    desc: 'Zona de estresse físico por compactação e lixiviação de bases.',
                    color: 'border-yellow-700/40 bg-yellow-950/5 dark:bg-yellow-950/10',
                    textColor: 'text-yellow-800 dark:text-yellow-300',
                  },
                  {
                    id: '40-60',
                    label: 'Camada Profunda (40-60 cm)',
                    desc: 'Elevado risco de acidez subsuperficial e barreira física mecânica.',
                    color: 'border-orange-950/60 bg-orange-950/5 dark:bg-orange-950/10',
                    textColor: 'text-orange-800 dark:text-orange-400',
                  },
                ].map((layer) => {
                  const isSelected = twinSelectedLayer === layer.id;
                  return (
                    <button
                      key={layer.id}
                      onClick={() => setTwinSelectedLayer(layer.id as any)}
                      className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? `ring-2 ring-emerald-500 dark:ring-emerald-400 ${layer.color} border-transparent shadow-xs`
                          : 'border-slate-100 dark:border-zinc-900 hover:border-slate-300 dark:hover:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className={`font-black text-xs ${isSelected ? layer.textColor : 'text-slate-800 dark:text-zinc-200'}`}>
                          {layer.label}
                        </strong>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                          isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-500'
                        }`}>
                          {layer.id} cm
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                        {layer.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Pedotransfer function explanation */}
              <div className="bg-slate-50 dark:bg-zinc-900 p-3 rounded-xl border dark:border-zinc-800 space-y-1.5">
                <span className="font-bold text-[10px] uppercase text-emerald-600 block">Equações de Pedotransferência</span>
                <p className="text-[10px] text-slate-500 leading-normal">
                  O gêmeo digital utiliza algoritmos calibrados com dados de textura do solo e matéria orgânica para prever a CTC potencial, saturação de bases e capacidade de água utilizável (CAD) do perfil simulado.
                </p>
              </div>
            </div>

            {/* COLUMN 2: Plant Roots and Compactness Simulator Map (lg:col-span-5) */}
            {(() => {
              // Real-time calculations based on interactive sliders
              // Simulated values per layer
              const getSimulatedValues = (depth: '0-20' | '20-40' | '40-60') => {
                const ph = depth === '0-20' ? twinPhSlider : depth === '20-40' ? Math.max(4.2, twinPhSlider - 0.4) : Math.max(4.0, twinPhSlider - 0.6);
                const om = depth === '0-20' ? twinOmSlider : depth === '20-40' ? Math.max(5, twinOmSlider * 0.6) : Math.max(3, twinOmSlider * 0.3);
                const comp = depth === '0-20' ? twinCompactionSlider : depth === '20-40' ? Math.min(4.0, twinCompactionSlider + 0.5) : Math.min(4.0, twinCompactionSlider + 0.8);
                
                // standard curve calculations
                const baseSat = Math.max(10, Math.min(95, Math.round((ph - 4.0) * 25 + 15)));
                const alSat = Math.max(0, Math.min(80, Math.round((7.0 - ph) * 22)));
                const ctcT = Math.round((currentSoil.clayPercent * 0.15 + om * 0.4) * 10) / 10;
                const waterCap = Math.round((currentSoil.clayPercent * 0.35 + om * 1.4) * 10) / 10;
                const biologicalScore = Math.max(12, Math.min(100, Math.round((om * 2.3) + (ph * 4))));

                return { ph, om, comp, baseSat, alSat, ctcT, waterCap, biologicalScore };
              };

              const currentSim = getSimulatedValues(twinSelectedLayer);

              // Calculate active limits for root growth
              // Root limit calculations:
              let rootLimitReason = 'Crescimento pleno do perfil';
              let maxRootDepth = 60; // full
              let rootStatus = 'excellent';

              const layer1Sim = getSimulatedValues('0-20');
              const layer2Sim = getSimulatedValues('20-40');
              const layer3Sim = getSimulatedValues('40-60');

              // Check 0-20 compaction
              if (layer1Sim.comp > 2.2) {
                maxRootDepth = 15;
                rootLimitReason = 'Compactação severa na camada superficial (0-20 cm)';
                rootStatus = 'critical';
              } else if (layer2Sim.comp > 2.2) {
                maxRootDepth = 30;
                rootLimitReason = 'Barreira física de compactação na camada de transição (20-40 cm)';
                rootStatus = 'critical';
              } else if (layer3Sim.comp > 2.2) {
                maxRootDepth = 45;
                rootLimitReason = 'Impedimento físico mecânico profundo (40-60 cm)';
                rootStatus = 'warning';
              } else if (layer1Sim.alSat > 20) {
                maxRootDepth = 20;
                rootLimitReason = 'Toxidez de Alumínio ativo na camada superficial (0-20 cm)';
                rootStatus = 'critical';
              } else if (layer2Sim.alSat > 20) {
                maxRootDepth = 35;
                rootLimitReason = 'Acidez subsuperficial e Alumínio tóxico (20-40 cm)';
                rootStatus = 'critical';
              } else if (layer3Sim.alSat > 20) {
                maxRootDepth = 48;
                rootLimitReason = 'Presença de Alumínio em profundidade (40-60 cm)';
                rootStatus = 'warning';
              }

              return (
                <>
                  <div className="lg:col-span-5 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
                    <div>
                      <h4 className="font-black text-[10px] uppercase text-slate-500 tracking-wider mb-2">Simulação Gráfica do Enraizamento</h4>
                      <div className="bg-slate-50 dark:bg-zinc-900 border dark:border-zinc-800 p-3 rounded-xl flex items-center justify-between text-[11px] mb-4">
                        <div className="space-y-0.5">
                          <span className="text-slate-400 font-bold block">Status do Enraizamento:</span>
                          <strong className={`font-black ${
                            rootStatus === 'excellent' ? 'text-emerald-600' :
                            rootStatus === 'warning' ? 'text-amber-600' : 'text-rose-600'
                          }`}>
                            {rootStatus === 'excellent' ? 'Excelente (Crescimento Pleno)' :
                             rootStatus === 'warning' ? 'Atenção (Estresse Moderado)' : 'Crítico (Crescimento Stuntado)'}
                          </strong>
                        </div>
                        <div className="text-right space-y-0.5">
                          <span className="text-slate-400 font-bold block">Prof. Radicular Efetiva:</span>
                          <strong className="text-base text-slate-800 dark:text-white font-black">{maxRootDepth} cm</strong>
                        </div>
                      </div>

                      {/* SVG Root Growth Simulator */}
                      <div className="relative w-full h-72 bg-gradient-to-b from-sky-500/10 via-amber-900/10 to-orange-950/20 rounded-xl border border-dashed dark:border-zinc-800 overflow-hidden flex items-stretch">
                        {/* Left grid metrics */}
                        <div className="w-12 border-r border-slate-200 dark:border-zinc-800 text-[9px] font-bold text-slate-400 flex flex-col justify-between py-4 select-none">
                          <div className="text-center">0 cm</div>
                          <div className="text-center">20 cm</div>
                          <div className="text-center">40 cm</div>
                          <div className="text-center">60 cm</div>
                        </div>

                        {/* Middle Soil SVG graphic */}
                        <div className="flex-1 relative">
                          {/* Soil Horizons Colors background */}
                          <div className="absolute top-0 bottom-0 left-0 right-0 flex flex-col">
                            {/* Layer 0-20 */}
                            <div className={`h-1/3 border-b border-dashed border-slate-200/50 dark:border-zinc-800/50 flex flex-col justify-end p-2 ${
                              twinSelectedLayer === '0-20' ? 'bg-amber-900/15' : 'bg-transparent'
                            }`}>
                              <span className="text-[8px] text-amber-800/50 dark:text-amber-300/30 font-black uppercase text-right">0-20 cm (pH {layer1Sim.ph.toFixed(1)} • {layer1Sim.comp.toFixed(1)} MPa)</span>
                            </div>
                            {/* Layer 20-40 */}
                            <div className={`h-1/3 border-b border-dashed border-slate-200/50 dark:border-zinc-800/50 flex flex-col justify-end p-2 ${
                              twinSelectedLayer === '20-40' ? 'bg-yellow-900/15' : 'bg-transparent'
                            }`}>
                              <span className="text-[8px] text-yellow-800/50 dark:text-yellow-300/30 font-black uppercase text-right">20-40 cm (pH {layer2Sim.ph.toFixed(1)} • {layer2Sim.comp.toFixed(1)} MPa)</span>
                            </div>
                            {/* Layer 40-60 */}
                            <div className={`h-1/3 flex flex-col justify-end p-2 ${
                              twinSelectedLayer === '40-60' ? 'bg-orange-950/15' : 'bg-transparent'
                            }`}>
                              <span className="text-[8px] text-orange-800/40 dark:text-orange-300/20 font-black uppercase text-right">40-60 cm (pH {layer3Sim.ph.toFixed(1)} • {layer3Sim.comp.toFixed(1)} MPa)</span>
                            </div>
                          </div>

                          {/* SVG plant with roots growing based on maxRootDepth */}
                          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 300" preserveAspectRatio="none">
                            {/* Plant Shoot (Above ground) */}
                            <path d="M100,50 Q105,25 100,5 Q95,25 100,50" fill="#22c55e" />
                            <path d="M100,45 Q115,35 118,20 Q105,38 100,45" fill="#16a34a" />
                            <path d="M100,40 Q85,30 82,15 Q95,33 100,40" fill="#15803d" />
                            <line x1="100" y1="5" x2="100" y2="70" stroke="#16a34a" strokeWidth="2.5" />

                            {/* Main Taproot */}
                            <path
                              d={`M100,70 Q102,120 101,${70 + (maxRootDepth * 3)}`}
                              stroke="#eab308"
                              strokeWidth="3"
                              fill="none"
                              strokeLinecap="round"
                            />

                            {/* Lateral Roots (based on depth limit) */}
                            {maxRootDepth >= 20 && (
                              <>
                                <path d="M100,100 Q120,110 135,115" stroke="#eab308" strokeWidth="1.5" fill="none" />
                                <path d="M100,120 Q80,130 65,135" stroke="#eab308" strokeWidth="1.5" fill="none" />
                              </>
                            )}
                            {maxRootDepth >= 35 && (
                              <>
                                <path d="M101,150 Q125,165 140,175" stroke="#ca8a04" strokeWidth="1.2" fill="none" />
                                <path d="M101,180 Q75,195 60,205" stroke="#ca8a04" strokeWidth="1.2" fill="none" />
                              </>
                            )}
                            {maxRootDepth >= 50 && (
                              <>
                                <path d="M101,210 Q115,225 125,240" stroke="#a16207" strokeWidth="1" fill="none" />
                                <path d="M101,235 Q85,250 75,265" stroke="#a16207" strokeWidth="1" fill="none" />
                              </>
                            )}

                            {/* Red restriction indicator line */}
                            {maxRootDepth < 60 && (
                              <line
                                x1="20"
                                y1={70 + (maxRootDepth * 3)}
                                x2="180"
                                y2={70 + (maxRootDepth * 3)}
                                stroke="#f43f5e"
                                strokeWidth="1.5"
                                strokeDasharray="3,3"
                              />
                            )}
                          </svg>

                          {/* Text indicators for compaction block overlay */}
                          {maxRootDepth < 60 && (
                            <div
                              className="absolute bg-rose-600/90 text-white font-black text-[9px] px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 animate-pulse"
                              style={{ top: `${Math.min(240, 70 + (maxRootDepth * 3) - 10)}px`, left: '10px' }}
                            >
                              <AlertTriangle className="w-3 h-3 text-white shrink-0" />
                              <span>Barreira Radicular</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-zinc-900 border dark:border-zinc-800 p-2.5 rounded-xl text-[10px] text-slate-500 leading-normal flex items-start gap-1.5 mt-3">
                      <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Causa da Restrição:</strong> {rootLimitReason}. Ajuste os controles de calagem e compactação abaixo para ver o impacto mecânico direto nas raízes.
                      </span>
                    </div>
                  </div>

                  {/* COLUMN 3: Chemical & Physical Twin Indicators (lg:col-span-4) */}
                  <div className="lg:col-span-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-2 dark:border-zinc-800">
                        <h4 className="font-black text-[10px] uppercase text-slate-500 tracking-wider">
                          Propriedades da Camada ({twinSelectedLayer} cm)
                        </h4>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 px-2 py-0.5 rounded font-black">
                          SIMULADO
                        </span>
                      </div>

                      {/* Chemical attributes list */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2.5 bg-slate-50 dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 text-center">
                          <span className="text-[9px] text-slate-400 block font-bold">pH do Gêmeo</span>
                          <strong className="text-base text-slate-800 dark:text-white font-black">{currentSim.ph.toFixed(1)}</strong>
                          <span className="text-[8px] text-slate-500 block">{currentSim.ph >= 5.8 ? 'Excelente' : 'Acidez Ativa'}</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 text-center">
                          <span className="text-[9px] text-slate-400 block font-bold">Matéria Orgânica</span>
                          <strong className="text-base text-slate-800 dark:text-white font-black">{currentSim.om} g/dm³</strong>
                          <span className="text-[8px] text-slate-500 block">Carbono</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 text-center">
                          <span className="text-[9px] text-slate-400 block font-bold">Saturação por Bases (V%)</span>
                          <strong className="text-base text-slate-800 dark:text-white font-black">{currentSim.baseSat}%</strong>
                          <span className="text-[8px] text-slate-500 block">{currentSim.baseSat >= 60 ? 'Ideal' : 'Abaixo da Meta'}</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 text-center">
                          <span className="text-[9px] text-slate-400 block font-bold">Alumínio Ativo (m%)</span>
                          <strong className={`text-base font-black ${currentSim.alSat > 15 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {currentSim.alSat}%
                          </strong>
                          <span className="text-[8px] text-slate-500 block">{currentSim.alSat > 10 ? 'Fitotóxico' : 'Seguro'}</span>
                        </div>
                      </div>

                      {/* Calculated Advanced Soil Science Indicators */}
                      <div className="space-y-2 pt-2 border-t dark:border-zinc-800 text-[10px]">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-500 font-bold flex items-center gap-1">
                              <Droplets className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                              Capacidade de Água Disponível (CAD)
                            </span>
                            <strong className="text-slate-800 dark:text-white font-black">{currentSim.waterCap} L/m³</strong>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-teal-500 h-2 rounded-full"
                              style={{ width: `${Math.min(100, (currentSim.waterCap / 50) * 100)}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-500 font-bold flex items-center gap-1">
                              <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              CTC Potencial Baseada em Matéria Orgânica
                            </span>
                            <strong className="text-slate-800 dark:text-white font-black">{currentSim.ctcT} cmol_c/dm³</strong>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-500 h-2 rounded-full"
                              style={{ width: `${Math.min(100, (currentSim.ctcT / 20) * 100)}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-500 font-bold flex items-center gap-1">
                              <Activity className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              Atividade Enzimática & Microbiológica Estimada
                            </span>
                            <strong className="text-slate-800 dark:text-white font-black">{currentSim.biologicalScore} / 100</strong>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-2 rounded-full"
                              style={{ width: `${currentSim.biologicalScore}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Digital Seal of verification */}
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/40 p-3 rounded-xl flex items-center gap-3 text-[10px] mt-4">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 rounded-lg">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="leading-tight text-slate-600 dark:text-zinc-400">
                        <strong>Certificado GeaAgro Twin v2.5</strong>
                        <p className="text-[9px] text-slate-400">Balanço eletroquímico validado de acordo com a textura de {currentSoil.clayPercent}% Argila.</p>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* SIMULATOR INTERACTIVE CONTROLS BOX */}
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="border-b pb-2 dark:border-zinc-800">
              <h4 className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-600" />
                Painel do Gêmeo Digital: Simulador Dinâmico do Solo (Amostra Foco)
              </h4>
              <p className="text-slate-400 text-[10px] mt-0.5">
                Mova os controles deslizantes para aplicar insumos ou simular a degradação do perfil. As mudanças químicas e físicas respondem em tempo de resposta de milissegundos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sliders PH */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-600 dark:text-zinc-300">Simular Calagem / Acidificação (pH CaCl₂)</span>
                  <span className="bg-slate-100 dark:bg-zinc-800 font-mono px-2 py-0.5 rounded font-black text-emerald-600 dark:text-emerald-400">
                    {twinPhSlider.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="7.0"
                  step="0.1"
                  value={twinPhSlider}
                  onChange={(e) => setTwinPhSlider(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-100 rounded-lg dark:bg-zinc-800"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                  <span>pH 4.0 (Muito Ácido)</span>
                  <span>pH 6.0 (Ideal)</span>
                  <span>pH 7.0 (Neutro)</span>
                </div>
              </div>

              {/* Sliders OM */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-600 dark:text-zinc-300">Aumento de Matéria Orgânica (g/dm³)</span>
                  <span className="bg-slate-100 dark:bg-zinc-800 font-mono px-2 py-0.5 rounded font-black text-emerald-600 dark:text-emerald-400">
                    {twinOmSlider} g/dm³
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="1"
                  value={twinOmSlider}
                  onChange={(e) => setTwinOmSlider(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-100 rounded-lg dark:bg-zinc-800"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                  <span>5 g/dm³ (Pobre)</span>
                  <span>30 g/dm³ (Ideal)</span>
                  <span>60 g/dm³ (Excelente)</span>
                </div>
              </div>

              {/* Sliders Compaction */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-600 dark:text-zinc-300">Compactação Mecânica do Perfil (MPa)</span>
                  <span className={`font-mono px-2 py-0.5 rounded font-black ${
                    twinCompactionSlider > 2.0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 dark:bg-zinc-800 text-emerald-600'
                  }`}>
                    {twinCompactionSlider.toFixed(1)} MPa
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.5"
                  step="0.1"
                  value={twinCompactionSlider}
                  onChange={(e) => setTwinCompactionSlider(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-100 rounded-lg dark:bg-zinc-800"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                  <span>0.5 MPa (Solto)</span>
                  <span>1.8 MPa (Limite)</span>
                  <span>3.5 MPa (Severo)</span>
                </div>
              </div>
            </div>

            {/* Quick Action Simulator presets */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t dark:border-zinc-800">
              <span className="font-bold text-slate-400 text-[10px] mr-2">Configurações Rápidas:</span>
              <button
                onClick={() => {
                  setTwinPhSlider(currentSoil.phCaCl2 || 6.0);
                  setTwinOmSlider(currentSoil.organicMatterGKg || 25);
                  setTwinCompactionSlider(currentSoil.penetrationResistanceMpa || 1.2);
                }}
                className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 font-black rounded-lg cursor-pointer transition-all"
              >
                Resetar para Valores Reais
              </button>
              <button
                onClick={() => {
                  setTwinPhSlider(6.2);
                  setTwinOmSlider(35);
                  setTwinCompactionSlider(1.0);
                }}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50 hover:bg-emerald-100 font-black rounded-lg cursor-pointer transition-all"
              >
                Simular Solo Corrigido & Descompactado
              </button>
              <button
                onClick={() => {
                  setTwinPhSlider(4.5);
                  setTwinOmSlider(12);
                  setTwinCompactionSlider(2.8);
                }}
                className="px-3 py-1.5 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/50 hover:bg-rose-100 font-black rounded-lg cursor-pointer transition-all"
              >
                Simular Solo Degradado & Compacto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MAPAS DE FERTILIDADE (2D GRID VARIABILIDADE ESPACIAL)      */}
      {/* ========================================================= */}
      {activeTab === 'mapas_fertilidade' && (
        <div className="space-y-6 animate-fade-in text-xs">
          {/* Main Container */}
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4 dark:border-zinc-800 gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  Mapeamento de Variabilidade e Desenho Georreferenciado
                </h3>
                <p className="text-slate-400 text-[10px] mt-0.5">
                  Cadastre talhões informando coordenadas geográficas ou clicando no mapa satélite interativo para desenhar o polígono.
                </p>
              </div>

              {/* Selector to map different nutrients */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'igf', label: 'Índice Geral (IGF)' },
                  { id: 'ph', label: 'Acidez (pH)' },
                  { id: 'p', label: 'Fósforo (P)' },
                  { id: 'k', label: 'Potássio (K)' },
                  { id: 'organicMatter', label: 'M. Orgânica' },
                  { id: 'clay', label: 'Argila %' },
                ].map((nut) => (
                  <button
                    key={nut.id}
                    onClick={() => setMapSelectedNutrient(nut.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                      mapSelectedNutrient === nut.id
                        ? 'bg-emerald-600 text-white font-extrabold shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    {nut.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Split Grid: Interactive Map + Registration Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Side: Dynamic SVG Map Satellite (Col-span 8) */}
              <div className="lg:col-span-8 flex flex-col gap-3">
                <div className="relative bg-slate-950 dark:bg-zinc-950 rounded-2xl border border-slate-800 shadow-inner overflow-hidden select-none">
                  {/* Satelite Backdrop Overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent)] pointer-events-none" />
                  <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded bg-black/75 border border-slate-800 text-slate-400 font-mono text-[9px] flex items-center gap-1.5 uppercase">
                    <Globe className="w-3 h-3 text-emerald-500 animate-spin-slow" />
                    Satélite Ativo: Sentinel-2
                  </div>

                  <div className="absolute top-3 right-3 z-10 flex gap-1.5">
                    <div className="px-2.5 py-1 rounded bg-black/75 border border-slate-800 text-emerald-400 font-mono text-[9px] flex items-center gap-1">
                      Lat: {mapBounds.minLat.toFixed(4)} a {mapBounds.maxLat.toFixed(4)}
                    </div>
                  </div>

                  {/* SVG Map Container */}
                  <svg
                    viewBox="0 0 760 300"
                    className="w-full h-[300px] cursor-crosshair"
                    onClick={(e) => {
                      if (!isClickDrawing) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      
                      // Map to viewBox 760 x 300
                      const svgX = (x / rect.width) * 760;
                      const svgY = (y / rect.height) * 300;
                      
                      // Convert back to geo lat/lon
                      const latRange = mapBounds.maxLat - mapBounds.minLat;
                      const lonRange = mapBounds.maxLon - mapBounds.minLon;
                      const lon = mapBounds.minLon + ((svgX - 40) / 680) * lonRange;
                      const lat = mapBounds.minLat + ((260 - svgY) / 220) * latRange;
                      
                      setNewPlotCoords(prev => [...prev, [parseFloat(lat.toFixed(6)), parseFloat(lon.toFixed(6))]]);
                      setMapFormError(null);
                      setMapFormSuccess(null);
                    }}
                  >
                    {/* Grid Lines */}
                    <g stroke="#334155" strokeWidth="0.5" strokeDasharray="2,5" opacity="0.4">
                      {[1, 2, 3, 4, 5].map(i => (
                        <line key={`v-${i}`} x1={40 + i * 110} y1={10} x2={40 + i * 110} y2={290} />
                      ))}
                      {[1, 2, 3, 4].map(i => (
                        <line key={`h-${i}`} x1={10} y1={20 + i * 50} x2={750} y2={20 + i * 50} />
                      ))}
                    </g>

                    {/* Render All Plots Polygons */}
                    {mapPlots.map((plot, idx) => {
                      // Project to SVG X,Y
                      const latRange = mapBounds.maxLat - mapBounds.minLat || 0.001;
                      const lonRange = mapBounds.maxLon - mapBounds.minLon || 0.001;
                      
                      const pointsStr = plot.coords.map(([lat, lon]) => {
                        const x = 40 + ((lon - mapBounds.minLon) / lonRange) * 680;
                        const y = 260 - ((lat - mapBounds.minLat) / latRange) * 220;
                        return `${x.toFixed(1)},${y.toFixed(1)}`;
                      }).join(' ');

                      // Centroid for Labels
                      let sumX = 0, sumY = 0;
                      const plotCoords = plot.coords || [];
                      plotCoords.forEach(([lat, lon]) => {
                        sumX += 40 + ((lon - mapBounds.minLon) / lonRange) * 680;
                        sumY += 260 - ((lat - mapBounds.minLat) / latRange) * 220;
                      });
                      const centroidX = plotCoords.length ? sumX / plotCoords.length : 0;
                      const centroidY = plotCoords.length ? sumY / plotCoords.length : 0;

                      // Nutrient determination
                      let color = '#10b981'; // Default emerald
                      let strokeColor = '#34d399';
                      let valLabel = '';

                      if (mapSelectedNutrient === 'igf') {
                        if (plot.igf < 50) { color = '#ef4444'; strokeColor = '#f87171'; }
                        else if (plot.igf < 70) { color = '#f59e0b'; strokeColor = '#fbbf24'; }
                        valLabel = `${plot.igf}/100`;
                      } else if (mapSelectedNutrient === 'ph') {
                        if (plot.ph < 5.2) { color = '#ef4444'; strokeColor = '#f87171'; }
                        else if (plot.ph < 5.8) { color = '#f59e0b'; strokeColor = '#fbbf24'; }
                        valLabel = `pH ${plot.ph.toFixed(1)}`;
                      } else if (mapSelectedNutrient === 'p') {
                        if (plot.p < 10) { color = '#ef4444'; strokeColor = '#f87171'; }
                        else if (plot.p < 18) { color = '#f59e0b'; strokeColor = '#fbbf24'; }
                        valLabel = `${plot.p} mg`;
                      } else if (mapSelectedNutrient === 'k') {
                        if (plot.k < 0.15) { color = '#ef4444'; strokeColor = '#f87171'; }
                        else if (plot.k < 0.25) { color = '#f59e0b'; strokeColor = '#fbbf24'; }
                        valLabel = `${plot.k.toFixed(2)}`;
                      } else if (mapSelectedNutrient === 'organicMatter') {
                        if (plot.organicMatter < 20) { color = '#ef4444'; strokeColor = '#f87171'; }
                        else if (plot.organicMatter < 28) { color = '#f59e0b'; strokeColor = '#fbbf24'; }
                        valLabel = `${plot.organicMatter}g`;
                      } else if (mapSelectedNutrient === 'clay') {
                        if (plot.clay < 20) { color = '#eab308'; strokeColor = '#fde047'; }
                        else if (plot.clay < 35) { color = '#14b8a6'; strokeColor = '#2dd4bf'; }
                        valLabel = `${plot.clay}%`;
                      }

                      const isHovered = hoveredPlot === idx;

                      return (
                        <g key={idx} className="transition-all duration-300">
                          <polygon
                            points={pointsStr}
                            fill={color}
                            fillOpacity={isHovered ? 0.45 : 0.25}
                            stroke={strokeColor}
                            strokeWidth={isHovered ? 2.5 : 1.2}
                            className="cursor-pointer transition-all duration-200"
                            onMouseEnter={() => setHoveredPlot(idx)}
                            onMouseLeave={() => setHoveredPlot(null)}
                          />
                          {/* Label overlay */}
                          <g transform={`translate(${centroidX}, ${centroidY})`} className="pointer-events-none">
                            <rect
                              x={-50}
                              y={-14}
                              width={100}
                              height={28}
                              rx={4}
                              fill="#000000"
                              fillOpacity={isHovered ? 0.85 : 0.6}
                              stroke={strokeColor}
                              strokeWidth={0.5}
                            />
                            <text
                              textAnchor="middle"
                              y={-2}
                              fill="#ffffff"
                              className="font-black text-[9px]"
                            >
                              {plot.name}
                            </text>
                            <text
                              textAnchor="middle"
                              y={8}
                              fill={strokeColor}
                              className="font-bold font-mono text-[8px]"
                            >
                              {valLabel} ({plot.type})
                            </text>
                          </g>
                        </g>
                      );
                    })}

                    {/* Draw active points of the new plot being registered */}
                    {newPlotCoords.length > 0 && (() => {
                      const latRange = mapBounds.maxLat - mapBounds.minLat || 0.001;
                      const lonRange = mapBounds.maxLon - mapBounds.minLon || 0.001;

                      const projected = newPlotCoords.map(([lat, lon]) => {
                        const x = 40 + ((lon - mapBounds.minLon) / lonRange) * 680;
                        const y = 260 - ((lat - mapBounds.minLat) / latRange) * 220;
                        return [x, y];
                      });

                      const pointsStr = projected.map(([x, y]) => `${x},${y}`).join(' ');

                      return (
                        <g>
                          {/* Incomplete Polygon outline */}
                          {newPlotCoords.length >= 2 && (
                            <polyline
                              points={pointsStr}
                              fill="rgba(251,191,36,0.1)"
                              stroke="#fbbf24"
                              strokeWidth={1.5}
                              strokeDasharray="4"
                            />
                          )}

                          {/* Dots at vertices */}
                          {projected.map(([x, y], pIdx) => (
                            <g key={pIdx}>
                              <circle
                                cx={x}
                                cy={y}
                                r={5}
                                fill="#fbbf24"
                                stroke="#ffffff"
                                strokeWidth={1}
                              />
                              <text
                                x={x}
                                y={y - 8}
                                fill="#fbbf24"
                                textAnchor="middle"
                                className="text-[8px] font-mono font-bold fill-amber-300 drop-shadow-md"
                              >
                                P{pIdx + 1}
                              </text>
                            </g>
                          ))}
                        </g>
                      );
                    })()}
                  </svg>

                  {/* Compass Overlay */}
                  <div className="absolute bottom-3 right-3 bg-black/70 p-2 rounded-lg border border-slate-800 flex flex-col items-center gap-0.5 text-slate-400 font-mono text-[8px]">
                    <div className="w-5 h-5 border border-slate-700 rounded-full flex items-center justify-center font-bold text-emerald-400 text-[8px]">
                      N
                    </div>
                    <span>BÚSSOLA</span>
                  </div>

                  {/* Bottom Guide indicator */}
                  {isClickDrawing && (
                    <div className="absolute bottom-3 left-3 bg-emerald-950/80 border border-emerald-800/40 px-2.5 py-1.5 rounded-lg text-emerald-300 text-[9px] flex items-center gap-1.5 font-bold animate-pulse">
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      Clique em qualquer área do satélite acima para posicionar os pontos do talhão!
                    </div>
                  )}
                </div>

                {/* Legend explanation bar */}
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg text-[9px] text-slate-500 font-bold">
                  <span>Classificação de Fertilidade no Talhão:</span>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Adequado / Alto</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full" /> Moderado / Médio</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-rose-500 rounded-full" /> Crítico / Baixo</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Georeferenced Coordinates Editor Form (Col-span 4) */}
              <div className="lg:col-span-4 bg-slate-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 space-y-4">
                <div className="border-b pb-2 dark:border-zinc-800 flex justify-between items-center">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Registrador Geográfico (GPS)
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isClickDrawing ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isClickDrawing ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase font-black">
                      {isClickDrawing ? 'Desenho Ativo' : 'Manual'}
                    </span>
                  </div>
                </div>

                {/* Notification Feedbacks */}
                {mapFormError && (
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/20 rounded-lg text-[10px] font-bold">
                    ⚠️ {mapFormError}
                  </div>
                )}
                {mapFormSuccess && (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20 rounded-lg text-[10px] font-bold animate-fade-in">
                    ✓ {mapFormSuccess}
                  </div>
                )}

                {/* Form fields */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase font-black tracking-wider block mb-1">Nome do Talhão *</label>
                    <input
                      type="text"
                      placeholder="Ex: Talhão Sede Leste G1"
                      value={newPlotName}
                      onChange={(e) => { setNewPlotName(e.target.value); setMapFormError(null); }}
                      className="w-full px-3 py-2 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-lg text-[11px] font-bold text-slate-800 dark:text-white outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase font-black tracking-wider block mb-1">Cultura Principal</label>
                      <select
                        value={newPlotType}
                        onChange={(e) => setNewPlotType(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-lg text-[11px] font-bold text-slate-800 dark:text-white cursor-pointer"
                      >
                        <option value="Soja">Soja</option>
                        <option value="Milho Safrinha">Milho Safrinha</option>
                        <option value="Algodão">Algodão</option>
                        <option value="Trigo">Trigo</option>
                        <option value="Café Conilon">Café Conilon</option>
                        <option value="Cana-de-açúcar">Cana-de-açúcar</option>
                        <option value="Eucalipto">Eucalipto</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase font-black tracking-wider block mb-1">Argila (%)</label>
                      <input
                        type="number"
                        min="10"
                        max="75"
                        value={newPlotClay}
                        onChange={(e) => setNewPlotClay(parseInt(e.target.value) || 30)}
                        className="w-full px-3 py-2 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-lg text-[11px] font-bold text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Sliders to simulate analysis profile */}
                  <div className="bg-white dark:bg-zinc-950 p-2.5 rounded-lg border dark:border-zinc-800 space-y-2">
                    <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">
                      Perfil de Solo para Simular Recomendações
                    </span>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[8px] text-slate-500">
                          <span>pH CaCl₂</span>
                          <strong>{newPlotPh.toFixed(1)}</strong>
                        </div>
                        <input
                          type="range"
                          min="4.0"
                          max="7.0"
                          step="0.1"
                          value={newPlotPh}
                          onChange={(e) => setNewPlotPh(parseFloat(e.target.value))}
                          className="w-full accent-emerald-600 h-1"
                        />
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[8px] text-slate-500">
                          <span>Fósforo (mg)</span>
                          <strong>{newPlotP} P</strong>
                        </div>
                        <input
                          type="range"
                          min="3"
                          max="40"
                          value={newPlotP}
                          onChange={(e) => setNewPlotP(parseInt(e.target.value))}
                          className="w-full accent-emerald-600 h-1"
                        />
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[8px] text-slate-500">
                          <span>Potássio (cmol)</span>
                          <strong>{newPlotK.toFixed(2)} K</strong>
                        </div>
                        <input
                          type="range"
                          min="0.05"
                          max="0.80"
                          step="0.01"
                          value={newPlotK}
                          onChange={(e) => setNewPlotK(parseFloat(e.target.value))}
                          className="w-full accent-emerald-600 h-1"
                        />
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[8px] text-slate-500">
                          <span>M. Orgânica</span>
                          <strong>{newPlotOm} g/dm³</strong>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="50"
                          value={newPlotOm}
                          onChange={(e) => setNewPlotOm(parseInt(e.target.value))}
                          className="w-full accent-emerald-600 h-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Manual coordinates input */}
                  <div className="bg-white dark:bg-zinc-950 p-2.5 rounded-lg border dark:border-zinc-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">
                        Adicionar Coordenada GPS Manualmente
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Latitude (Ex: -21.1152)"
                        value={inputLat}
                        onChange={(e) => setInputLat(e.target.value)}
                        className="px-2 py-1.5 bg-slate-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg text-[10px] outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Longitude (Ex: -48.2014)"
                        value={inputLon}
                        onChange={(e) => setInputLon(e.target.value)}
                        className="px-2 py-1.5 bg-slate-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg text-[10px] outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const latVal = parseFloat(inputLat);
                          const lonVal = parseFloat(inputLon);
                          if (!isNaN(latVal) && !isNaN(lonVal)) {
                            setNewPlotCoords(prev => [...prev, [latVal, lonVal]]);
                            setInputLat('');
                            setInputLon('');
                            setMapFormError(null);
                          } else {
                            setMapFormError('Coordenadas Latitude/Longitude inválidas.');
                          }
                        }}
                        className="py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded font-black text-[9px] cursor-pointer flex items-center justify-center gap-1 transition-all"
                      >
                        <Plus className="w-3 h-3 text-emerald-600" /> Inserir Ponto
                      </button>

                      <button
                        type="button"
                        disabled={geoLoading}
                        onClick={handleCaptureGeolocation}
                        className="py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/20 rounded font-black text-[9px] cursor-pointer flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                      >
                        <MapPin className={`w-3 h-3 ${geoLoading ? 'animate-spin' : 'text-emerald-600'}`} />
                        {geoLoading ? 'Obtendo...' : 'Capturar GPS'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Polygon vertices tracker */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase font-black">
                      Vértices do Polígono ({newPlotCoords.length} adicionados)
                    </span>
                    {newPlotCoords.length > 0 && (
                      <button
                        type="button"
                        onClick={() => { setNewPlotCoords([]); setMapFormError(null); }}
                        className="text-[8px] text-rose-500 font-bold hover:underline cursor-pointer"
                      >
                        Limpar Polígono
                      </button>
                    )}
                  </div>

                  {newPlotCoords.length === 0 ? (
                    <div className="text-[10px] text-slate-400 py-3 text-center border border-dashed dark:border-zinc-800 rounded-lg">
                      Nenhum vértice adicionado. Use o clique no mapa satélite ao lado ou insira manualmente acima.
                    </div>
                  ) : (
                    <div className="max-h-[85px] overflow-y-auto space-y-1 pr-1 bg-white dark:bg-zinc-950 p-1.5 rounded-lg border dark:border-zinc-800">
                      {newPlotCoords.map(([lat, lon], idx) => (
                        <div key={idx} className="flex justify-between items-center text-[9px] font-mono bg-slate-50 dark:bg-zinc-900 p-1 rounded border dark:border-zinc-800 text-slate-600 dark:text-zinc-400">
                          <span>
                            P{idx + 1}: <strong className="text-slate-800 dark:text-zinc-300">{lat.toFixed(5)}, {lon.toFixed(5)}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => setNewPlotCoords(prev => prev.filter((_, i) => i !== idx))}
                            className="text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1.5">
                    <button
                      type="button"
                      onClick={() => setIsClickDrawing(!isClickDrawing)}
                      className={`w-full py-2 rounded-xl font-bold text-[9px] cursor-pointer flex items-center justify-center gap-1 transition-all border ${
                        isClickDrawing
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/40 text-emerald-700 dark:text-emerald-400'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200'
                      }`}
                    >
                      📍 Desenhar por Cliques: {isClickDrawing ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="button"
                  onClick={handleSavePlot}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-xs transition-all tracking-wider uppercase"
                >
                  <Plus className="w-4 h-4" /> Cadastrar e Projetar Novo Talhão
                </button>
              </div>
            </div>

            {/* Dynamic Stateful Fertility Map Cards grid */}
            <div className="pt-4 border-t dark:border-zinc-800">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-black tracking-wider">
                  Listagem Detalhada dos Talhões Georreferenciados ({(mapPlots || []).length})
                </span>
                <span className="text-[9px] text-slate-400 font-bold">
                  Clique nos botões de nutrientes acima para filtrar a análise visual
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {mapPlots.map((plot, index) => {
                  // Determine color based on nutrient selected
                  let colorClass = 'bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-800 border-emerald-500/20';
                  let indicatorVal = '';
                  let statusLabel = 'Adequado';

                  if (mapSelectedNutrient === 'igf') {
                    if (plot.igf < 50) {
                      colorClass = 'bg-rose-500/15 dark:bg-rose-500/5 text-rose-800 dark:text-rose-400 border-rose-500/20';
                      statusLabel = 'Crítico';
                    } else if (plot.igf < 70) {
                      colorClass = 'bg-amber-500/15 dark:bg-amber-500/5 text-amber-800 dark:text-amber-400 border-amber-500/20';
                      statusLabel = 'Médio';
                    }
                    indicatorVal = `${plot.igf} / 100`;
                  } else if (mapSelectedNutrient === 'ph') {
                    if (plot.ph < 5.2) {
                      colorClass = 'bg-rose-500/15 dark:bg-rose-500/5 text-rose-800 dark:text-rose-400 border-rose-500/20';
                      statusLabel = 'Forte Acidez';
                    } else if (plot.ph < 5.8) {
                      colorClass = 'bg-amber-500/15 dark:bg-amber-500/5 text-amber-800 dark:text-amber-400 border-amber-500/20';
                      statusLabel = 'Médio';
                    }
                    indicatorVal = `pH ${plot.ph.toFixed(1)}`;
                  } else if (mapSelectedNutrient === 'p') {
                    if (plot.p < 10) {
                      colorClass = 'bg-rose-500/15 dark:bg-rose-500/5 text-rose-800 dark:text-rose-400 border-rose-500/20';
                      statusLabel = 'Baixo';
                    } else if (plot.p < 18) {
                      colorClass = 'bg-amber-500/15 dark:bg-amber-500/5 text-amber-800 dark:text-amber-400 border-amber-500/20';
                      statusLabel = 'Médio';
                    }
                    indicatorVal = `${plot.p} mg/dm³`;
                  } else if (mapSelectedNutrient === 'k') {
                    if (plot.k < 0.15) {
                      colorClass = 'bg-rose-500/15 dark:bg-rose-500/5 text-rose-800 dark:text-rose-400 border-rose-500/20';
                      statusLabel = 'Deficiente';
                    } else if (plot.k < 0.25) {
                      colorClass = 'bg-amber-500/15 dark:bg-amber-500/5 text-amber-800 dark:text-amber-400 border-amber-500/20';
                      statusLabel = 'Médio';
                    }
                    indicatorVal = `${plot.k.toFixed(2)} cmol_c`;
                  } else if (mapSelectedNutrient === 'organicMatter') {
                    if (plot.organicMatter < 20) {
                      colorClass = 'bg-rose-500/15 dark:bg-rose-500/5 text-rose-800 dark:text-rose-400 border-rose-500/20';
                      statusLabel = 'Pobre';
                    } else if (plot.organicMatter < 28) {
                      colorClass = 'bg-amber-500/15 dark:bg-amber-500/5 text-amber-800 dark:text-amber-400 border-amber-500/20';
                      statusLabel = 'Médio';
                    }
                    indicatorVal = `${plot.organicMatter} g/dm³`;
                  } else if (mapSelectedNutrient === 'clay') {
                    if (plot.clay < 20) {
                      colorClass = 'bg-yellow-500/15 dark:bg-yellow-500/5 text-yellow-800 border-yellow-500/20';
                      statusLabel = 'Arenoso';
                    } else if (plot.clay < 35) {
                      colorClass = 'bg-teal-500/15 dark:bg-teal-500/5 text-teal-800 border-teal-500/20';
                      statusLabel = 'Misto';
                    } else {
                      colorClass = 'bg-emerald-500/15 dark:bg-emerald-500/5 text-emerald-800 border-emerald-500/20';
                      statusLabel = 'Argiloso';
                    }
                    indicatorVal = `${plot.clay}% Argila`;
                  }

                  const isHovered = hoveredPlot === index;

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-2xl border flex flex-col justify-between ${colorClass} shadow-3xs cursor-pointer transition-all duration-300 ${
                        isHovered ? 'ring-2 ring-emerald-500 border-transparent scale-[1.02] shadow-md' : ''
                      }`}
                      onMouseEnter={() => setHoveredPlot(index)}
                      onMouseLeave={() => setHoveredPlot(null)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <strong className="text-xs font-black text-slate-800 dark:text-zinc-200 block">{plot.name}</strong>
                          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Cultura: {plot.type}</span>
                        </div>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-white/80 dark:bg-zinc-950/80 shadow-3xs">
                          {statusLabel}
                        </span>
                      </div>

                      <div className="mt-4 text-[9px] font-mono text-slate-500 dark:text-zinc-500 space-y-0.5">
                        <span className="block">Centro GPS: <strong>{plot.coords && plot.coords[0] && typeof plot.coords[0][0] === 'number' ? `${plot.coords[0][0].toFixed(4)}, ${plot.coords[0][1]?.toFixed(4)}` : 'S/D'}</strong></span>
                        <span className="block">Pontos de Vértice: <strong>{(plot.coords || []).length} pontos</strong></span>
                      </div>

                      <div className="flex justify-between items-end mt-4 pt-3 border-t border-slate-200/40 dark:border-zinc-800/20">
                        <div>
                          <span className="text-[9px] text-slate-500 block uppercase">Nível Diagnosticado</span>
                          <strong className="text-base font-black tracking-tight">{indicatorVal}</strong>
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold">Talhão {index < 9 ? `0${index + 1}` : index + 1}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Spatial recommendations summary */}
            <div className="bg-slate-50 dark:bg-zinc-900 border dark:border-zinc-800 p-4 rounded-xl flex items-start gap-3 mt-4">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400 rounded-lg">
                <Sliders className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <strong className="text-slate-900 dark:text-white font-bold block text-xs">Aplicações Recomendadas em Taxa Variável</strong>
                <p className="text-slate-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                  O Talhão Norte Estrada apresenta forte acidez de solo e baixos índices de IGF. Recomenda-se calagem pesada localizada de 3.5 t/ha no talhão Norte. Já o Talhão Encosta apresenta alta saturação de argila e compactação em profundidade, recomendando-se gessagem profunda e subsolagem imediata antes de plantar. O sistema analisa as coordenadas geográficas de cada polígono para mapear com precisão as zonas de manejo.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SIMULADOR DE CENÁRIOS E RETORNO FINANCEIRO                */}
      {/* ========================================================= */}
      {activeTab === 'simulador_cenarios' && (
        <div className="space-y-6 animate-fade-in text-xs">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="border-b pb-2 dark:border-zinc-800">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Zap className="w-5 h-5 text-emerald-600 animate-pulse" />
                Simulador Dinâmico de Cenários e Retorno de Investimento (ROI)
              </h3>
              <p className="text-slate-400 text-[10px] mt-0.5">
                Altere as doses estimadas de insumos para ver a projeção analítica de produtividade (sc/ha) e retorno líquido financeiro comparativo em soja.
              </p>
            </div>

            {/* Interactive Sliders for investment parameters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border dark:border-zinc-800">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-600 dark:text-zinc-300">Dose de Calcário Comercial (PRNT 80%)</span>
                  <strong className="text-emerald-600">{scenarioLimestone.toFixed(1)} t/ha</strong>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="6.0"
                  step="0.5"
                  value={scenarioLimestone}
                  onChange={(e) => setScenarioLimestone(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-zinc-800 rounded-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-600 dark:text-zinc-300">Dose de Adubo Orgânico (Composto/Esterco)</span>
                  <strong className="text-emerald-600">{scenarioOrganic.toFixed(1)} t/ha</strong>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="10.0"
                  step="0.5"
                  value={scenarioOrganic}
                  onChange={(e) => setScenarioOrganic(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-zinc-800 rounded-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-600 dark:text-zinc-300">Aporte de Nitrogênio em Cobertura (N)</span>
                  <strong className="text-emerald-600">{scenarioN} kg/ha</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={scenarioN}
                  onChange={(e) => setScenarioN(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-zinc-800 rounded-full"
                />
              </div>
            </div>

            {/* Simulated side-by-side comparison cards */}
            {(() => {
              // calculations
              const baseProd = 62; // sc/ha standard soy
              const npkProd = 69.5; // with simple NPK
              const simProd = Math.min(95, baseProd + (scenarioLimestone * 2.8) + (scenarioOrganic * 1.6) + (scenarioN * 0.05));

              const limestoneCost = scenarioLimestone * 140; // R$ per ton
              const organicCost = scenarioOrganic * 90; // R$ per ton
              const nCost = scenarioN * 7.5; // R$ per kg
              const extraCost = limestoneCost + organicCost + nCost;

              const bagPrice = 135; // R$ per soy bag
              const baseRevenue = baseProd * bagPrice;
              const npkRevenue = npkProd * bagPrice;
              const simRevenue = simProd * bagPrice;

              const baseProfit = baseRevenue - 4200; // rough fixed cost
              const npkProfit = npkRevenue - 4800;
              const simProfit = simRevenue - (4200 + extraCost);

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Scenario 1: Actual / Neglected */}
                  <div className="p-4 rounded-2xl border border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/30 space-y-3">
                    <span className="text-[10px] uppercase font-black text-slate-500 block">Cenário 1: Sem Correções (Testemunha)</span>
                    <div className="bg-white dark:bg-black p-3.5 rounded-xl border border-slate-100 dark:border-zinc-900 text-center">
                      <span className="text-[10px] text-slate-400 block font-bold">Produtividade Esperada</span>
                      <strong className="text-xl text-slate-700 dark:text-zinc-400 font-black">{baseProd} sc/ha</strong>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-500">
                      <div className="flex justify-between">
                        <span>Faturamento Bruto:</span>
                        <strong className="text-slate-800 dark:text-zinc-300">R$ {baseRevenue.toLocaleString('pt-BR')} / ha</strong>
                      </div>
                      <div className="flex justify-between border-t border-dashed pt-1 mt-1 font-bold text-slate-700 dark:text-white">
                        <span>Lucro Líquido:</span>
                        <span>R$ {baseProfit.toLocaleString('pt-BR')} / ha</span>
                      </div>
                    </div>
                  </div>

                  {/* Scenario 2: Conventional NPK only */}
                  <div className="p-4 rounded-2xl border border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/30 space-y-3">
                    <span className="text-[10px] uppercase font-black text-amber-600 block">Cenário 2: Adubação NPK Convencional</span>
                    <div className="bg-white dark:bg-black p-3.5 rounded-xl border border-slate-100 dark:border-zinc-900 text-center">
                      <span className="text-[10px] text-slate-400 block font-bold">Produtividade Esperada</span>
                      <strong className="text-xl text-amber-600 font-black">{npkProd} sc/ha</strong>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-500">
                      <div className="flex justify-between">
                        <span>Faturamento Bruto:</span>
                        <strong className="text-slate-800 dark:text-zinc-300">R$ {npkRevenue.toLocaleString('pt-BR')} / ha</strong>
                      </div>
                      <div className="flex justify-between border-t border-dashed pt-1 mt-1 font-bold text-slate-700 dark:text-white">
                        <span>Lucro Líquido:</span>
                        <span>R$ {npkProfit.toLocaleString('pt-BR')} / ha</span>
                      </div>
                    </div>
                  </div>

                  {/* Scenario 3: Regenerative High-Prod Twin */}
                  <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-3 ring-2 ring-emerald-500/20">
                    <span className="text-[10px] uppercase font-black text-emerald-600 block">Cenário Simulador: Manejo Planejado</span>
                    <div className="bg-white dark:bg-zinc-950 p-3.5 rounded-xl border border-emerald-500/20 text-center">
                      <span className="text-[10px] text-slate-400 block font-bold">Produtividade Esperada</span>
                      <strong className="text-xl text-emerald-600 font-black">{simProd.toFixed(1)} sc/ha</strong>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-500">
                      <div className="flex justify-between">
                        <span>Investimento em Corretivos:</span>
                        <strong className="text-slate-800 dark:text-zinc-300">R$ {extraCost.toLocaleString('pt-BR')} / ha</strong>
                      </div>
                      <div className="flex justify-between border-t border-dashed pt-1 mt-1 font-bold text-emerald-700 dark:text-emerald-300">
                        <span>Lucro Líquido Previsto:</span>
                        <span>R$ {simProfit.toLocaleString('pt-BR')} / ha</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* BANCO DE FERTILIZANTES (ORGANIZAÇÃO DE INSUMOS)          */}
      {/* ========================================================= */}
      {activeTab === 'banco_fertilizantes' && (
        <div className="space-y-6 animate-fade-in text-xs">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-3 dark:border-zinc-800 gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Layers3 className="w-5 h-5 text-emerald-600" />
                  Biblioteca e Catálogo Técnico de Fertilizantes
                </h3>
                <p className="text-slate-400 text-[10px] mt-0.5">
                  Consulte a composição centesimal, o índice salino e a solubilidade dos principais adubos minerais e orgânicos cadastrados no sistema.
                </p>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Pesquisar adubo..."
                    value={fertilizerSearchQuery}
                    onChange={(e) => setFertilizerSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-[11px] text-slate-900 dark:text-white w-full sm:w-44"
                  />
                </div>
                <select
                  value={fertilizerTypeFilter}
                  onChange={(e) => setFertilizerTypeFilter(e.target.value as any)}
                  className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:text-zinc-300 cursor-pointer"
                >
                  <option value="todos">Todos Insumos</option>
                  <option value="simples">Minerais Simples</option>
                  <option value="formulado_npk">Fórmulas NPK</option>
                  <option value="organico">Orgânicos</option>
                </select>
              </div>
            </div>

            {/* List and Cards of fertilizers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Ureia Agrícola', type: 'simples', n: 46, p: 0, k: 0, ca: 0, s: 0, desc: 'Alta concentração de Nitrogênio amídico. Sujeito a perdas por volatilização.', sol: 'Fácil', salt: 75 },
                { name: 'Superfosfato Simples (SPS)', type: 'simples', n: 0, p: 18, k: 0, ca: 18, s: 12, desc: 'Fonte ideal de Fósforo, Cálcio e Enxofre solúveis para plantio em sulcos.', sol: 'Média', salt: 8 },
                { name: 'Superfosfato Triplo (SPT)', type: 'simples', n: 0, p: 46, k: 0, ca: 10, s: 0, desc: 'Alta concentração de P2O5 para arranque radicular agressivo.', sol: 'Média', salt: 10 },
                { name: 'Cloreto de Potássio (KCl)', type: 'simples', n: 0, p: 0, k: 60, ca: 0, s: 0, desc: 'Principal fonte de Potássio. Alto índice salino, aplicar com cuidado.', sol: 'Fácil', salt: 116 },
                { name: 'MAP Comercial', type: 'simples', n: 11, p: 52, k: 0, ca: 0, s: 0, desc: 'Fosfato monoamônico excelente para adubação de base inicial.', sol: 'Fácil', salt: 30 },
                { name: 'Fórmula NPK 02-20-20', type: 'formulado_npk', n: 2, p: 20, k: 20, ca: 4, s: 3, desc: 'Fórmula balanceada ideal para plantio de soja e milho.', sol: 'Média', salt: 45 },
                { name: 'Fórmula NPK 20-00-20', type: 'formulado_npk', n: 20, p: 0, k: 20, ca: 0, s: 2, desc: 'NPK concentrado excelente para cobertura foliar ou fertirrigação.', sol: 'Fácil', salt: 60 },
                { name: 'Esterco de Curral Curtido', type: 'organico', n: 1.5, p: 1.2, k: 1.8, ca: 2.0, s: 0.5, desc: 'Melhora a agregação de solos arenosos e aporta microrganismos.', sol: 'Lenta', salt: 2 },
                { name: 'Cama de Frango Especial', type: 'organico', n: 3.2, p: 2.8, k: 2.5, ca: 4.0, s: 1.2, desc: 'Excelente aporte de matéria orgânica ativa com liberação gradual.', sol: 'Lenta', salt: 3 },
              ]
                .filter(f => {
                  if (fertilizerTypeFilter !== 'todos' && f.type !== fertilizerTypeFilter) return false;
                  if (fertilizerSearchQuery && !f.name.toLowerCase().includes(fertilizerSearchQuery.toLowerCase())) return false;
                  return true;
                })
                .map((f, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-black text-slate-800 dark:text-zinc-200 block">{f.name}</strong>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                          f.type === 'organico' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300' :
                          f.type === 'formulado_npk' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                        }`}>
                          {f.type === 'organico' ? 'Orgânico' : f.type === 'formulado_npk' ? 'Fórmula NPK' : 'Mineral Simples'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        {f.desc}
                      </p>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5 text-center mt-4 border-t border-b border-dashed border-slate-200/60 dark:border-zinc-800/20 py-2">
                      <div>
                        <span className="text-[8px] text-slate-400 block font-bold">N</span>
                        <strong className="text-slate-800 dark:text-white font-black">{f.n}%</strong>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-400 block font-bold">P₂O₅</span>
                        <strong className="text-slate-800 dark:text-white font-black">{f.p}%</strong>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-400 block font-bold">K₂O</span>
                        <strong className="text-slate-800 dark:text-white font-black">{f.k}%</strong>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-400 block font-bold">Ca</span>
                        <strong className="text-slate-800 dark:text-white font-black">{f.ca}%</strong>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-400 block font-bold">S</span>
                        <strong className="text-slate-800 dark:text-white font-black">{f.s}%</strong>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-semibold mt-3 pt-1">
                      <span>Solubilidade: <strong className="text-slate-600 dark:text-zinc-300 font-bold">{f.sol}</strong></span>
                      <span>Índice Salino: <strong className="text-slate-600 dark:text-zinc-300 font-bold">{f.salt}</strong></span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CATÁLOGO COMPLETO DE BOLETINS E PADRÕES LAB        */}
      {/* ========================================================= */}
      {showBulletinCatalogModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in text-xs">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black flex items-center gap-2 text-white">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                  Catálogo de Boletins Regionais &amp; Padrões Laboratoriais
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Selecione a diretriz oficial ou o método do seu laboratório de análise de solo ({allBulletins.length} disponíveis).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBulletinCatalogModal(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search and Category Filter Toolbar */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-900 border-b dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative w-full sm:w-96">
                <input
                  type="text"
                  placeholder="🔍 Buscar por nome, laboratório, estado (SP, MT, GO...), instituição ou extrator..."
                  value={bulletinSearchTerm}
                  onChange={e => setBulletinSearchTerm(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500"
                />
                {bulletinSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setBulletinSearchTerm('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex bg-slate-200 dark:bg-zinc-800 p-1 rounded-xl gap-1 w-full sm:w-auto shrink-0 justify-center">
                <button
                  type="button"
                  onClick={() => setBulletinCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    bulletinCategoryFilter === 'all'
                      ? 'bg-white dark:bg-zinc-950 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  Todos ({allBulletins.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBulletinCategoryFilter('regional')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    bulletinCategoryFilter === 'regional'
                      ? 'bg-white dark:bg-zinc-950 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  🏛️ Regionais
                </button>
                <button
                  type="button"
                  onClick={() => setBulletinCategoryFilter('lab')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    bulletinCategoryFilter === 'lab'
                      ? 'bg-white dark:bg-zinc-950 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  🧪 Laboratoriais
                </button>
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="flex-1 overflow-y-auto p-5">
              {filteredCatalogBulletins.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <p className="text-sm font-bold text-slate-500 dark:text-zinc-400">
                    Nenhum boletim ou referência laboratorial encontrada para "{bulletinSearchTerm}".
                  </p>
                  <button
                    type="button"
                    onClick={() => { setBulletinSearchTerm(''); setBulletinCategoryFilter('all'); }}
                    className="text-xs text-emerald-600 font-bold underline"
                  >
                    Limpar filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCatalogBulletins.map(b => {
                    const isSelected = b.id === selectedBulletinId;
                    const isLab = b.id.startsWith('padrao-lab-') || b.code.startsWith('LAB-');
                    return (
                      <div
                        key={b.id}
                        onClick={() => {
                          handleSelectBulletin(b.id);
                          setShowBulletinCatalogModal(false);
                          showNotification(`Referência ativada: ${b.name}`, 'success');
                        }}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                          isSelected
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                            : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-2xs'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${b.badgeColor || (isLab ? 'bg-purple-600 text-white' : 'bg-emerald-600 text-white')}`}>
                              {b.code}
                            </span>
                            <span className="text-[10px] font-extrabold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                              {b.region}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-black text-xs text-slate-900 dark:text-white leading-tight">
                              {b.name}
                            </h4>
                            <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                              {b.institution}
                            </p>
                          </div>

                          <p className="text-[11px] text-slate-600 dark:text-zinc-300 line-clamp-2">
                            {b.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-zinc-400 pt-1">
                            <span className="bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-semibold">
                              <strong>Método P:</strong> {b.phosphorusMethod}
                            </span>
                            <span className="bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-semibold">
                              <strong>Estados:</strong> {(b.coveredStates || []).slice(0, 5).join(', ')}{(b.coveredStates || []).length > 5 ? '...' : ''}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400">
                            {isLab ? '🧪 Padrão Laboratorial' : '🏛️ Boletim Regional'}
                          </span>
                          <span className={`text-xs font-black px-3 py-1 rounded-lg ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200'
                          }`}>
                            {isSelected ? '✓ Ativo para Recomendação' : 'Selecionar'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 dark:bg-zinc-900 px-6 py-3 border-t dark:border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-zinc-400 font-medium">
                {filteredCatalogBulletins.length} referências exibidas
              </span>
              <button
                type="button"
                onClick={() => setShowBulletinCatalogModal(false)}
                className="bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-100 font-bold px-4 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CRIAR REFERÊNCIA PERSONALIZADA DE BOLETIM          */}
      {/* ========================================================= */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in text-xs">
            {/* Header */}
            <div className="bg-slate-50 dark:bg-zinc-900 px-5 py-4 border-b dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  Nova Referência de Boletim Agronômico
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Cadastre referências regionais customizadas ou as recomendadas pelo seu consultor.
                </p>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCustomBulletin} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Secção 1: Identificação */}
              <div className="space-y-2">
                <h4 className="font-bold text-[10px] uppercase text-emerald-600 tracking-wider border-b pb-1">1. Identificação do Boletim</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Nome do Boletim *</label>
                    <input
                      type="text"
                      required
                      value={newBulletin.name || ''}
                      onChange={e => setNewBulletin(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Boletim Fundação MT 2026"
                      className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Código da Ref. *</label>
                    <input
                      type="text"
                      required
                      value={newBulletin.code || ''}
                      onChange={e => setNewBulletin(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="Ex: FMT-2026"
                      className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Instituição</label>
                    <input
                      type="text"
                      value={newBulletin.institution || ''}
                      onChange={e => setNewBulletin(prev => ({ ...prev, institution: e.target.value }))}
                      placeholder="Ex: Fundação MT"
                      className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Região de Abrangência</label>
                    <input
                      type="text"
                      value={newBulletin.region || ''}
                      onChange={e => setNewBulletin(prev => ({ ...prev, region: e.target.value }))}
                      placeholder="Ex: Cerrado de MT"
                      className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Estados (siglas separadas por vírgula)</label>
                    <input
                      type="text"
                      value={typeof newBulletin.coveredStates === 'string' ? newBulletin.coveredStates : (newBulletin.coveredStates || []).join(', ')}
                      onChange={e => setNewBulletin(prev => ({ ...prev, coveredStates: e.target.value }))}
                      placeholder="Ex: MT, GO"
                      className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Ano / Edição</label>
                    <input
                      type="text"
                      value={newBulletin.edition || ''}
                      onChange={e => setNewBulletin(prev => ({ ...prev, edition: e.target.value }))}
                      placeholder="Ex: 1a Edição 2026"
                      className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Secção 2: Parâmetros Químicos Principais */}
              <div className="space-y-2">
                <h4 className="font-bold text-[10px] uppercase text-emerald-600 tracking-wider border-b pb-1">2. Métodos e Fatores de Correção de Solo</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Método de Calagem Oficial</label>
                    <select
                      value={newBulletin.defaultLimingMethod}
                      onChange={e => setNewBulletin(prev => ({ ...prev, defaultLimingMethod: e.target.value as any }))}
                      className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="v_percent">Saturação por Bases (V%)</option>
                      <option value="al_neutralization">Neutralização de Al + Ca/Mg</option>
                      <option value="smp">Índice SMP (RS/SC)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Método de Extração de Fósforo (P)</label>
                    <select
                      value={newBulletin.phosphorusMethod}
                      onChange={e => setNewBulletin(prev => ({ ...prev, phosphorusMethod: e.target.value as any }))}
                      className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="Resina">Resina Trocadora de Ânions</option>
                      <option value="Mehlich-1">Mehlich-1</option>
                      <option value="Mehlich-3">Mehlich-3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Fator p/ Gessagem (ex: Fator * Argila)</label>
                    <input
                      type="number"
                      value={newBulletin.gypsumFactor || 50}
                      onChange={e => setNewBulletin(prev => ({ ...prev, gypsumFactor: parseFloat(e.target.value) || 50 }))}
                      className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Secção 3: Parâmetros Avançados e Limiares Críticos */}
              <div className="space-y-2">
                <h4 className="font-bold text-[10px] uppercase text-emerald-600 tracking-wider border-b pb-1">3. Valores Críticos de Referência (Adubação e Balanço)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Enxofre S Mín (mg/dm³)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newBulletin.sulfurCriticalLevel || 10}
                      onChange={e => setNewBulletin(prev => ({ ...prev, sulfurCriticalLevel: parseFloat(e.target.value) || 0 }))}
                      className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Boro B Mín (mg/dm³)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newBulletin.boronCriticalLevel || 0.35}
                      onChange={e => setNewBulletin(prev => ({ ...prev, boronCriticalLevel: parseFloat(e.target.value) || 0 }))}
                      className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Zinco Zn Mín (mg/dm³)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newBulletin.zincCriticalLevel || 1.2}
                      onChange={e => setNewBulletin(prev => ({ ...prev, zincCriticalLevel: parseFloat(e.target.value) || 0 }))}
                      className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Cobre Cu Mín (mg/dm³)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newBulletin.copperCriticalLevel || 0.8}
                      onChange={e => setNewBulletin(prev => ({ ...prev, copperCriticalLevel: parseFloat(e.target.value) || 0 }))}
                      className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Manganês Mn Mín (mg/dm³)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newBulletin.manganeseCriticalLevel || 4.0}
                      onChange={e => setNewBulletin(prev => ({ ...prev, manganeseCriticalLevel: parseFloat(e.target.value) || 0 }))}
                      className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Ferro Fe Mín (mg/dm³)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newBulletin.ironCriticalLevel || 12.0}
                      onChange={e => setNewBulletin(prev => ({ ...prev, ironCriticalLevel: parseFloat(e.target.value) || 0 }))}
                      className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Alumínio m% Máx Tolerável</label>
                    <input
                      type="number"
                      value={newBulletin.tolerableAlSaturation || 15}
                      onChange={e => setNewBulletin(prev => ({ ...prev, tolerableAlSaturation: parseFloat(e.target.value) || 0 }))}
                      className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">P-Remanescente Crítico (mg/L)</label>
                    <input
                      type="number"
                      value={newBulletin.pRemanescenteCritical || 25}
                      onChange={e => setNewBulletin(prev => ({ ...prev, pRemanescenteCritical: parseFloat(e.target.value) || 0 }))}
                      className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Secção 4: Equilíbrio de Cátions na CTC */}
              <div className="space-y-2">
                <h4 className="font-bold text-[10px] uppercase text-emerald-600 tracking-wider border-b pb-1">4. Equilíbrio Ideal de Bases (% da CTC T)</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 dark:bg-zinc-900 p-2.5 rounded-lg border dark:border-zinc-800">
                    <span className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-500 mb-1">Cálcio Ca Ideal %</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="Mín"
                        value={newBulletin.idealCaPercentageRange?.min || 50}
                        onChange={e => setNewBulletin(prev => ({
                          ...prev,
                          idealCaPercentageRange: { min: parseFloat(e.target.value) || 0, max: prev.idealCaPercentageRange?.max || 70 }
                        }))}
                        className="w-full p-1.5 bg-white dark:bg-zinc-950 border dark:border-zinc-800 rounded text-center font-bold"
                      />
                      <span>a</span>
                      <input
                        type="number"
                        placeholder="Máx"
                        value={newBulletin.idealCaPercentageRange?.max || 70}
                        onChange={e => setNewBulletin(prev => ({
                          ...prev,
                          idealCaPercentageRange: { min: prev.idealCaPercentageRange?.min || 50, max: parseFloat(e.target.value) || 0 }
                        }))}
                        className="w-full p-1.5 bg-white dark:bg-zinc-950 border dark:border-zinc-800 rounded text-center font-bold"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-900 p-2.5 rounded-lg border dark:border-zinc-800">
                    <span className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-500 mb-1">Magnésio Mg Ideal %</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="Mín"
                        value={newBulletin.idealMgPercentageRange?.min || 10}
                        onChange={e => setNewBulletin(prev => ({
                          ...prev,
                          idealMgPercentageRange: { min: parseFloat(e.target.value) || 0, max: prev.idealMgPercentageRange?.max || 20 }
                        }))}
                        className="w-full p-1.5 bg-white dark:bg-zinc-950 border dark:border-zinc-800 rounded text-center font-bold"
                      />
                      <span>a</span>
                      <input
                        type="number"
                        placeholder="Máx"
                        value={newBulletin.idealMgPercentageRange?.max || 20}
                        onChange={e => setNewBulletin(prev => ({
                          ...prev,
                          idealMgPercentageRange: { min: prev.idealMgPercentageRange?.min || 10, max: parseFloat(e.target.value) || 0 }
                        }))}
                        className="w-full p-1.5 bg-white dark:bg-zinc-950 border dark:border-zinc-800 rounded text-center font-bold"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-900 p-2.5 rounded-lg border dark:border-zinc-800">
                    <span className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-500 mb-1">Potássio K Ideal %</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="Mín"
                        value={newBulletin.idealKPercentageRange?.min || 2}
                        onChange={e => setNewBulletin(prev => ({
                          ...prev,
                          idealKPercentageRange: { min: parseFloat(e.target.value) || 0, max: prev.idealKPercentageRange?.max || 5 }
                        }))}
                        className="w-full p-1.5 bg-white dark:bg-zinc-950 border dark:border-zinc-800 rounded text-center font-bold"
                      />
                      <span>a</span>
                      <input
                        type="number"
                        placeholder="Máx"
                        value={newBulletin.idealKPercentageRange?.max || 5}
                        onChange={e => setNewBulletin(prev => ({
                          ...prev,
                          idealKPercentageRange: { min: prev.idealKPercentageRange?.min || 2, max: parseFloat(e.target.value) || 0 }
                        }))}
                        className="w-full p-1.5 bg-white dark:bg-zinc-950 border dark:border-zinc-800 rounded text-center font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Referência e Notas */}
              <div className="space-y-2">
                <h4 className="font-bold text-[10px] uppercase text-emerald-600 tracking-wider border-b pb-1">5. Notas Metodológicas e Oficiais</h4>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Referência Bibliográfica / Link Técnico</label>
                  <input
                    type="text"
                    value={newBulletin.officialReference || ''}
                    onChange={e => setNewBulletin(prev => ({ ...prev, officialReference: e.target.value }))}
                    placeholder="Ex: EMBRAPA Soja, Informativo Técnico No 14, Londrina-PR, 2026."
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="bg-slate-50 dark:bg-zinc-900 px-5 py-4 border-t dark:border-zinc-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="bg-white hover:bg-slate-50 dark:bg-zinc-850 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border dark:border-zinc-700 font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCustomBulletin}
                className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Salvar e Aplicar Referência
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================= */}
      {/* MODAL: ALERT TRIGGER DE ADUBAÇÃO ATIVO                  */}
      {/* ========================================================= */}
      {activeFiredReminder && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in font-sans text-xs">
          <div className="bg-white dark:bg-zinc-950 border-2 border-amber-500 dark:border-amber-600 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-5 text-white relative">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full animate-bounce">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">🚨 ALERTA DE ADUBAÇÃO!</h3>
                  <p className="text-xs text-white/95 font-semibold">Aplicação Recomendada & Agendada</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveFiredReminder(null)}
                className="absolute top-4 right-4 text-white hover:text-amber-100 p-1 bg-white/10 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5 p-4 bg-amber-500/10 dark:bg-amber-500/5 rounded-2xl border border-amber-200 dark:border-amber-900/60 text-xs text-slate-850 dark:text-zinc-200">
                <div className="flex justify-between items-center border-b pb-1.5 border-amber-200 dark:border-amber-900/40">
                  <span className="font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider text-[10px]">Cultura e Solo</span>
                  <strong className="font-extrabold text-sm text-slate-900 dark:text-white">{activeFiredReminder.cropName}</strong>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1.5 text-[11px]">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Tipo de Adubação:</span>
                    <strong className="font-bold capitalize text-slate-900 dark:text-zinc-100">
                      {activeFiredReminder.type === 'plantio' ? '🌱 Plantio (Sulco)' : `💧 Cobertura (${activeFiredReminder.parcelaNum}ª Parcela)`}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Área do Talhão:</span>
                    <strong className="font-bold text-slate-900 dark:text-zinc-100">{activeFiredReminder.area} ha</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Fertilizante:</span>
                    <strong className="font-bold text-emerald-700 dark:text-emerald-400">{activeFiredReminder.fertilizerName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Dose recomendada:</span>
                    <strong className="font-bold text-emerald-700 dark:text-emerald-400">{activeFiredReminder.dose}</strong>
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-amber-200 dark:border-amber-900/40 flex justify-between font-black text-xs">
                  <span>Volume Total Necessário:</span>
                  <span className="text-amber-650 dark:text-amber-400">{activeFiredReminder.totalKg.toLocaleString('pt-BR')} kg</span>
                </div>
              </div>

              <div className="text-xs space-y-1">
                <span className="font-bold text-slate-500 dark:text-slate-400">Notificar Destinatário:</span>
                <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 flex justify-between items-center">
                  <div>
                    <strong className="block text-slate-900 dark:text-white text-xs">{activeFiredReminder.recipientName}</strong>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{activeFiredReminder.recipientPhone || activeFiredReminder.recipientEmail}</span>
                  </div>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                    Via {activeFiredReminder.channel}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => triggerWhatsApp(activeFiredReminder)}
                  className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-black py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Disparar WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => triggerEmail(activeFiredReminder)}
                  className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-black py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Enviar E-mail Técnico
                </button>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-900 px-6 py-4 border-t dark:border-zinc-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveFiredReminder(null)}
                className="bg-white hover:bg-slate-50 dark:bg-zinc-850 dark:hover:bg-zinc-850 text-slate-700 dark:text-zinc-200 border dark:border-zinc-700 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                Ignorar
              </button>
              <button
                type="button"
                onClick={() => {
                  showNotification('✅ Aplicação confirmada no registro de atividades!');
                  setActiveFiredReminder(null);
                }}
                className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white font-black px-5 py-2 rounded-xl text-xs cursor-pointer"
              >
                Marcar como Concluída
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: SELETOR DE CULTURAS & BOLETINS AGRONÔMICOS         */}
      {/* ========================================================= */}
      {isCropSelectorModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fade-in font-sans text-xs">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Sprout className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">Catálogo de Culturas &amp; Boletins Oficiais</h3>
                  <p className="text-[11px] text-emerald-100 font-medium">
                    Selecione a cultura para carregar exigências nutricionais e fórmulas recomendadas pelos boletins técnicos
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCropSelectorModalOpen(false)}
                className="text-white hover:text-emerald-200 p-1.5 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search and Category Filters */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar por cultura (ex: Soja, Milho, Café, Algodão, Cana, Tomate, Pastagem, Brachiaria)..."
                  value={cropSearchQuery}
                  onChange={e => setCropSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                  autoFocus
                />
                {cropSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setCropSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                <button
                  type="button"
                  onClick={() => setCropSelectorCategory('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all whitespace-nowrap ${
                    cropSelectorCategory === 'all'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                  }`}
                >
                  🌾 Todas ({CROP_PLANTING_RECOMMENDATIONS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCropSelectorCategory('graos')}
                  className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all whitespace-nowrap ${
                    cropSelectorCategory === 'graos'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                  }`}
                >
                  🌽 Grãos &amp; Cereais
                </button>
                <button
                  type="button"
                  onClick={() => setCropSelectorCategory('fibras_oleaginosas')}
                  className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all whitespace-nowrap ${
                    cropSelectorCategory === 'fibras_oleaginosas'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                  }`}
                >
                  🧶 Fibras &amp; Oleaginosas
                </button>
                <button
                  type="button"
                  onClick={() => setCropSelectorCategory('fruticultura')}
                  className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all whitespace-nowrap ${
                    cropSelectorCategory === 'fruticultura'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                  }`}
                >
                  🍎 Fruticultura
                </button>
                <button
                  type="button"
                  onClick={() => setCropSelectorCategory('hortalicas')}
                  className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all whitespace-nowrap ${
                    cropSelectorCategory === 'hortalicas'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                  }`}
                >
                  🥬 Hortaliças &amp; Olerícolas
                </button>
                <button
                  type="button"
                  onClick={() => setCropSelectorCategory('grandes_culturas')}
                  className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all whitespace-nowrap ${
                    cropSelectorCategory === 'grandes_culturas'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                  }`}
                >
                  🎋 Grandes Culturas &amp; Bioenergia
                </button>
                <button
                  type="button"
                  onClick={() => setCropSelectorCategory('pastagens')}
                  className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all whitespace-nowrap ${
                    cropSelectorCategory === 'pastagens'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                  }`}
                >
                  🌿 Pastagens &amp; Forragens
                </button>
              </div>
            </div>

            {/* Results Grid */}
            <div className="p-4 overflow-y-auto max-h-[55vh] space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1 pb-1">
                <span>Exibindo <strong>{filteredPlantingCrops.length}</strong> culturas encontradas</span>
                {selectedPlantingCropRec && (
                  <span>Cultura ativa: <strong className="text-emerald-600 dark:text-emerald-400">{selectedPlantingCropRec.cropName}</strong></span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {filteredPlantingCrops.map(c => {
                  const isSelected = c.cropId === selectedPlantingCropId;
                  const cal = getBulletinCalibratedCropParameters(c, currentBulletin, currentSoil);
                  return (
                    <div
                      key={c.cropId}
                      onClick={() => handleSelectPlantingCrop(c.cropId)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-600 shadow-sm ring-2 ring-emerald-500/30'
                          : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-2xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1.5">
                          <div>
                            <strong className="text-xs font-black text-slate-900 dark:text-white block">
                              {cal.cropName}
                            </strong>
                            {cal.scientificName && (
                              <span className="text-[10px] text-slate-500 italic block">
                                {cal.scientificName}
                              </span>
                            )}
                          </div>
                          {isSelected && (
                            <span className="p-1 bg-emerald-600 text-white rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-1 text-[10px]">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-extrabold">
                            Fórmula: {cal.recommendedFormulationId.toUpperCase()}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold">
                            Dose: {cal.defaultPlantingDoseKgHa} kg/ha
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 font-bold">
                            V% Alvo: {cal.targetV}%
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 font-semibold">
                            Meta: {cal.expectedYieldDefault} {cal.yieldUnit}
                          </span>
                        </div>

                        <p className="mt-2 text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {cal.observation}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[10px]">
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold truncate max-w-[170px]" title={currentBulletin.name}>
                          📋 {currentBulletin.code} • {currentBulletin.region}
                        </span>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleSelectPlantingCrop(c.cropId);
                          }}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[10px] cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 dark:bg-zinc-800 hover:bg-emerald-600 hover:text-white text-slate-800 dark:text-zinc-200'
                          }`}
                        >
                          {isSelected ? 'Selecionada' : 'Selecionar'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredPlantingCrops.length === 0 && (
                <div className="p-8 text-center space-y-2">
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                    Nenhuma cultura encontrada para "{cropSearchQuery}".
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCropSearchQuery('');
                      setCropSelectorCategory('all');
                    }}
                    className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    Limpar filtros e exibir todas as 250 culturas
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 dark:bg-zinc-900 px-6 py-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-medium">
                Dica: A escolha da cultura sincroniza automaticamente com as curvas de absorção e adubação.
              </span>
              <button
                type="button"
                onClick={() => setIsCropSelectorModalOpen(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold rounded-xl cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EXPLICAÇÃO DETALHADA DO IGF & PARECER AGRONÔMICO    */}
      {/* ========================================================= */}
      <IgfExplanationModal
        isOpen={showIgfExpl}
        onClose={() => setShowIgfExpl(false)}
        soil={currentSoil}
        bulletin={currentBulletin}
        igfBreakdown={igfBreakdown}
      />
    </div>
  );
};
