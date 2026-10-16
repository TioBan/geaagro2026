// @ts-nocheck
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Leaf, FlaskConical, Map, Activity, Calculator, History, MapPin, 
  Camera, AlertTriangle, BookOpen, Droplets, FileText, Zap, BarChart2,
  TrendingUp, TrendingDown, CheckCircle2, ChevronRight, Info, HelpCircle,
  X, ChevronDown, ChevronUp, Lightbulb, Plus, Upload, Download, FileSpreadsheet,
  Edit, Trash2, Copy, Check, RefreshCw, Sliders, XCircle, WifiOff, CheckSquare,
  FileUp, Layers, Search, Target, Image, Eye, FlipHorizontal, Maximize2,
  ZoomIn, Tag, Sparkles
} from 'lucide-react';
import { FoliarTab, LeafSample, NutrientClass, LeafLabResults, PlotGeoVertex } from '../types/foliar';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  BarChart,
  Bar,
  Cell,
  ReferenceLine
} from 'recharts';
import { FOLIAR_SUFFICIENCY_RANGES, NUTRIENT_LIBRARY, INITIAL_LEAF_SAMPLES, interpretNutrient, getNutrientSufficiencyRange, calculateRatios, NUTRIENT_MANAGEMENT_GUIDE, RATIO_EXPLANATION_DETAILS } from '../data/foliarData';
import { INITIAL_SOIL_SAMPLES } from '../utils/sampleData';
import { Farm } from '../types/agronomy';
import { calculateDOP, calculateDRIS, calculateCND, getAbsorptionCurvesData } from '../utils/indicesNutricionais';

interface CropImplication {
  influence: string;
  implication: string;
  criticalStage: string;
}

const getNormalizedCrop = (cropName: string): string => {
  const normalized = (cropName || '').toLowerCase();
  if (normalized.includes('soja')) return 'Soja';
  if (normalized.includes('milho')) return 'Milho';
  if (normalized.includes('café') || normalized.includes('cafe')) return 'Café';
  return 'Soja';
};

export const DEFAULT_PLOT_VERTICES_PRESETS: Record<string, PlotGeoVertex[]> = {
  'talhao-01': [
    { id: 'v1', lat: -12.5480, lng: -55.7260, label: 'V1 - Vértice Norte' },
    { id: 'v2', lat: -12.5472, lng: -55.7145, label: 'V2 - Vértice Nordeste' },
    { id: 'v3', lat: -12.5538, lng: -55.7118, label: 'V3 - Vértice Leste' },
    { id: 'v4', lat: -12.5615, lng: -55.7155, label: 'V4 - Vértice Sudeste' },
    { id: 'v5', lat: -12.5605, lng: -55.7248, label: 'V5 - Vértice Sudoeste' },
    { id: 'v6', lat: -12.5532, lng: -55.7282, label: 'V6 - Vértice Oeste' },
  ],
  'talhao-02': [
    { id: 'v1', lat: -12.5420, lng: -55.7300, label: 'V1 - Canto Noroeste' },
    { id: 'v2', lat: -12.5415, lng: -55.7210, label: 'V2 - Canto Nordeste' },
    { id: 'v3', lat: -12.5490, lng: -55.7205, label: 'V3 - Canto Sudeste' },
    { id: 'v4', lat: -12.5498, lng: -55.7295, label: 'V4 - Canto Sudoeste' },
  ],
  'pivo-central': [
    { id: 'v1', lat: -12.5500, lng: -55.7200, label: 'P1 - Norte' },
    { id: 'v2', lat: -12.5515, lng: -55.7170, label: 'P2 - Nordeste' },
    { id: 'v3', lat: -12.5550, lng: -55.7160, label: 'P3 - Leste' },
    { id: 'v4', lat: -12.5585, lng: -55.7170, label: 'P4 - Sudeste' },
    { id: 'v5', lat: -12.5600, lng: -55.7200, label: 'P5 - Sul' },
    { id: 'v6', lat: -12.5585, lng: -55.7230, label: 'P6 - Sudoeste' },
    { id: 'v7', lat: -12.5550, lng: -55.7240, label: 'P7 - Oeste' },
    { id: 'v8', lat: -12.5515, lng: -55.7230, label: 'P8 - Noroeste' },
  ]
};

export function calculatePlotGeometry(vertices: PlotGeoVertex[]) {
  if (!vertices || vertices.length < 3) {
    return {
      areaHa: 0,
      perimeterKm: 0,
      centroid: { lat: -12.5535, lng: -55.7210 },
      bounds: { minLat: -12.56, maxLat: -12.54, minLng: -55.73, maxLng: -55.71 },
      svgPolygonPoints: '100,60 850,50 900,300 750,520 200,550 50,300',
      vertexSvgCoords: []
    };
  }

  const lats = vertices.map(v => v.lat);
  const lngs = vertices.map(v => v.lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const centroidLat = lats.reduce((a, b) => a + b, 0) / vertices.length;
  const centroidLng = lngs.reduce((a, b) => a + b, 0) / vertices.length;

  const cosLat = Math.cos((centroidLat * Math.PI) / 180);
  const coordsMeters = vertices.map(v => ({
    x: (v.lng - centroidLng) * 111320 * cosLat,
    y: (v.lat - centroidLat) * 110574,
  }));

  let areaSum = 0;
  let perimeterMeters = 0;
  const n = coordsMeters.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    areaSum += coordsMeters[i].x * coordsMeters[j].y - coordsMeters[j].x * coordsMeters[i].y;

    const dx = coordsMeters[j].x - coordsMeters[i].x;
    const dy = coordsMeters[j].y - coordsMeters[i].y;
    perimeterMeters += Math.sqrt(dx * dx + dy * dy);
  }

  const areaM2 = Math.abs(areaSum) / 2;
  const areaHa = Number((areaM2 / 10000).toFixed(2));
  const perimeterKm = Number((perimeterMeters / 1000).toFixed(2));

  const latRange = Math.max(maxLat - minLat, 0.0001);
  const lngRange = Math.max(maxLng - minLng, 0.0001);
  const marginPct = 12;

  const vertexSvgCoords = vertices.map((v, idx) => {
    const xPct = marginPct + ((v.lng - minLng) / lngRange) * (100 - 2 * marginPct);
    const yPct = marginPct + ((maxLat - v.lat) / latRange) * (100 - 2 * marginPct);
    return {
      ...v,
      label: v.label || `V${idx + 1}`,
      xPct: Number(xPct.toFixed(1)),
      yPct: Number(yPct.toFixed(1)),
      xPx: Number((xPct * 10).toFixed(1)),
      yPx: Number((yPct * 6).toFixed(1)),
    };
  });

  const svgPolygonPoints = vertexSvgCoords.map(v => `${v.xPx},${v.yPx}`).join(' ');

  return {
    areaHa,
    perimeterKm,
    centroid: { lat: Number(centroidLat.toFixed(5)), lng: Number(centroidLng.toFixed(5)) },
    bounds: { minLat, maxLat, minLng, maxLng },
    svgPolygonPoints,
    vertexSvgCoords,
  };
}

export function getPointCoordsFromBounds(
  sampleLat: number,
  sampleLng: number,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }
) {
  const latRange = Math.max(bounds.maxLat - bounds.minLat, 0.0001);
  const lngRange = Math.max(bounds.maxLng - bounds.minLng, 0.0001);
  const marginPct = 15;

  let x = marginPct + ((sampleLng - bounds.minLng) / lngRange) * (100 - 2 * marginPct);
  let y = marginPct + ((bounds.maxLat - sampleLat) / latRange) * (100 - 2 * marginPct);

  x = Math.max(8, Math.min(92, x));
  y = Math.max(8, Math.min(92, y));

  return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
}

export function getNormalizedSample(sample?: any): LeafSample {
  if (!sample) {
    return {
      id: 'default-foliar-sample',
      sampleCode: 'AF-2026-001',
      date: new Date().toISOString().split('T')[0],
      samplingDate: new Date().toISOString().split('T')[0],
      responsible: 'Eng. Agrônomo Responsável',
      farmId: 'faz-01',
      fieldId: 'talhao-01',
      plotId: 'talhao-01',
      crop: 'Soja',
      cultivar: 'TMG 7062 IPRO',
      phenologicalStage: 'R1 - Início do Florescimento',
      growthStage: 'R1 - Início do Florescimento',
      organCollected: 'Folha Índice',
      sampledPlantPart: '3ª folha trifoliolada com pecíolo',
      plantsSampled: 30,
      notes: '',
      photos: [],
      n_g_kg: 42.5,
      p_g_kg: 3.2,
      k_g_kg: 18.0,
      ca_g_kg: 12.5,
      mg_g_kg: 4.8,
      s_g_kg: 2.8,
      b_mg_kg: 38.0,
      zn_mg_kg: 28.0,
      fe_mg_kg: 115.0,
      mn_mg_kg: 65.0,
      cu_mg_kg: 9.5,
      mo_mg_kg: 0.45,
      results: {
        N: 42.5, P: 3.2, K: 18.0, Ca: 12.5, Mg: 4.8, S: 2.8,
        B: 38.0, Zn: 28.0, Fe: 115.0, Mn: 65.0, Cu: 9.5, Mo: 0.45,
      }
    } as any;
  }

  const N = Number(sample.results?.N ?? sample.n_g_kg ?? 0);
  const P = Number(sample.results?.P ?? sample.p_g_kg ?? 0);
  const K = Number(sample.results?.K ?? sample.k_g_kg ?? 0);
  const Ca = Number(sample.results?.Ca ?? sample.ca_g_kg ?? 0);
  const Mg = Number(sample.results?.Mg ?? sample.mg_g_kg ?? 0);
  const S = Number(sample.results?.S ?? sample.s_g_kg ?? 0);
  const B = Number(sample.results?.B ?? sample.b_mg_kg ?? 0);
  const Zn = Number(sample.results?.Zn ?? sample.zn_mg_kg ?? 0);
  const Fe = Number(sample.results?.Fe ?? sample.fe_mg_kg ?? 0);
  const Mn = Number(sample.results?.Mn ?? sample.mn_mg_kg ?? 0);
  const Cu = Number(sample.results?.Cu ?? sample.cu_mg_kg ?? 0);
  const Mo = Number(sample.results?.Mo ?? sample.mo_mg_kg ?? 0);

  const results: LeafLabResults = {
    N, P, K, Ca, Mg, S, B, Zn, Fe, Mn, Cu, Mo,
    Cl: sample.results?.Cl ?? 0,
    Ni: sample.results?.Ni ?? 0,
  };

  return {
    ...sample,
    id: sample.id || `foliar-${Date.now()}`,
    sampleCode: sample.sampleCode || 'AF-001',
    date: sample.date || sample.samplingDate || new Date().toISOString().split('T')[0],
    samplingDate: sample.samplingDate || sample.date || new Date().toISOString().split('T')[0],
    responsible: sample.responsible || sample.labName || 'Eng. Agrônomo Responsável',
    farmId: sample.farmId || '',
    fieldId: sample.fieldId || sample.plotId || 'talhao-01',
    plotId: sample.plotId || sample.fieldId || 'talhao-01',
    crop: sample.crop || 'Soja',
    cultivar: sample.cultivar || '',
    phenologicalStage: sample.phenologicalStage || sample.growthStage || 'R1',
    growthStage: sample.growthStage || sample.phenologicalStage || 'R1',
    organCollected: sample.organCollected || sample.sampledPlantPart || 'Folha Índice',
    sampledPlantPart: sample.sampledPlantPart || sample.organCollected || 'Folha Índice',
    plantsSampled: sample.plantsSampled || 30,
    notes: sample.notes || '',
    photos: sample.photos || [],
    n_g_kg: N,
    p_g_kg: P,
    k_g_kg: K,
    ca_g_kg: Ca,
    mg_g_kg: Mg,
    s_g_kg: S,
    b_mg_kg: B,
    zn_mg_kg: Zn,
    fe_mg_kg: Fe,
    mn_mg_kg: Mn,
    cu_mg_kg: Cu,
    mo_mg_kg: Mo,
    results,
  };
}

const CROP_IMPLICATION_GUIDE: Record<string, Record<string, CropImplication>> = {
  'Soja': {
    NP: {
      influence: "Determina a eficiência da fixação biológica de Nitrogênio (FBN). O Fósforo é o combustível essencial (ATP) para as bactérias noduladoras do gênero Bradyrhizobium fixarem o N atmosférico.",
      implication: "Relações desequilibradas limitam drasticamente a quantidade total de vagens fixadas por nó produtivo, reduzindo diretamente o número final de grãos por planta.",
      criticalStage: "R1 (Início do florescimento) a R5 (Enchimento de grãos)."
    },
    NK: {
      influence: "Controla a abertura estomática e o acúmulo de carboidratos nas folhas. Uma relação elevada (>2.4) deixa a soja extremamente vulnerável a estresses térmicos severos e murchamento por desidratação.",
      implication: "Implica em perda direta de peso de grãos (PMS) e desfolha precoce do terço médio da lavoura, encurtando o ciclo fotossintético produtivo.",
      criticalStage: "R2 (Florescimento Pleno) a R6 (Vagem cheia)."
    },
    CaMg: {
      influence: "Equilibra a formação e estabilidade da parede celular e pectinas (Cálcio) com a taxa fotossintética ativa pelo Magnésio no núcleo da clorofila.",
      implication: "Valores fora do padrão ideal geram folhas quebradiças, menor resistência mecânica a ventos e pragas, e abortamento excessivo de flores devido a falhas estruturais.",
      criticalStage: "V4 (Desenvolvimento vegetativo) a R2 (Florescimento)."
    },
    KMg: {
      influence: "Representa a competição direta por canais de absorção. Excesso de Potássio inibe fisicamente a captação de Magnésio pelas raízes, causando clorose internervosa intensa.",
      implication: "O bloqueio severo do Magnésio reduz a fotossíntese foliar em até 40%, gerando menos energia química para translocação e enchimento de vagens.",
      criticalStage: "R1 a R5.5 (Desenvolvimento das vagens)."
    },
    PZn: {
      influence: "O Zinco é cofator chave para a síntese de triptofano, precursor do ácido indolacético (auxina/hormônio de crescimento). Níveis excessivos de P imobilizam o Zinco.",
      implication: "Resulta no encurtamento nítido dos entrenódios da soja (síndrome do nanismo) e formação de folhas menores, reduzindo a área foliar ativa.",
      criticalStage: "V3 a V6 (Fase vegetativa inicial)."
    }
  },
  'Milho': {
    NP: {
      influence: "Crucial para o arranque inicial e definição física do número de fileiras de grãos na espiga. O Nitrogênio impulsiona a expansão foliar rápida e o Fósforo o vigor radicular pioneiro.",
      implication: "Uma relação desregulada resulta em espigas menores, com pontas desprovidas de grãos (espigas banguelas) e menor peso específico do milho colhido.",
      criticalStage: "V4 a V8 (Finição do potencial produtivo)."
    },
    NK: {
      influence: "O Potássio atua na regulação osmótica e rigidez estrutural do colmo do milho, enquanto o Nitrogênio gera a área foliar fotossintética necessária.",
      implication: "NK desequilibrado eleva drasticamente a taxa de acamamento e quebra de plantas sob ventos fortes, além de limitar a migração de amido.",
      criticalStage: "V12 a R1 (Pendoamento e polinização)."
    },
    CaMg: {
      influence: "Atua na estabilidade de membranas das folhas superiores e na eficiência metabólica da enzima RuBisCO, fortemente ativada pelo Magnésio.",
      implication: "Deficiências relativas atrasam a emissão do pendão e diminuem severamente a longevidade fotossintética das folhas acima da espiga (folha-guia).",
      criticalStage: "V8 a R2."
    },
    KMg: {
      influence: "A adubação excessiva de Potássio na linha de plantio do milho pode neutralizar a absorção de Magnésio, essencial para carregar as espigas.",
      implication: "Causa estrias cloróticas longitudinais ('folha riscada') e grãos de milho chochos ou com baixa densidade calórica.",
      criticalStage: "V6 a R3."
    },
    PZn: {
      influence: "Interação antagônica clássica em milho. O excesso de adubação fosfatada bloqueia a absorção de Zinco, cofator hormonal essencial.",
      implication: "Gera a síndrome do 'colmo em mola' ou 'esbranquiçamento apical do milho', onde folhas novas emergem esbranquiçadas ou cloróticas, travando o teto produtivo.",
      criticalStage: "V2 a V6."
    }
  },
  'Café': {
    NP: {
      influence: "O Fósforo estimula as raízes absorventes nas camadas superiores, enquanto o Nitrogênio garante o crescimento vigoroso dos ramos plagiotrópicos produtivos.",
      implication: "Impacta severamente a bienalidade do café, limitando a emissão de novos nós produtivos que sustentarão a safra do ano seguinte.",
      criticalStage: "Pós-colheita e expansão de novos ramos foliares."
    },
    NK: {
      influence: "O café é um altíssimo extrator de Potássio, elemento que dita o calibre do fruto, a qualidade final da bebida (açúcares) e a tolerância ao estresse hídrico.",
      implication: "Relação desequilibrada NK resulta em alta incidência de frutos chochos, maturação desuniforme (alta taxa de frutos verdes) e bebida de baixo valor de mercado.",
      criticalStage: "Florada e chumbinho (enchimento dos frutos)."
    },
    CaMg: {
      influence: "Mantém a robustez do sistema radicular em profundidade e a estabilidade da desfolha sob alta carga pendente de frutos.",
      implication: "Previne a desfolha precoce drástica pós-colheita e evita a morte de ramos apicais ('dieback' fisiológico por exaustão).",
      criticalStage: "Frutificação rápida a pré-colheita."
    },
    KMg: {
      influence: "A adubação potássica intensiva na lavoura cafeeira sem contrapartida é a causa principal de deficiências graves de Magnésio induzido.",
      implication: "Provoca queda foliar intensa do baixeiro produtivo, encurtando a vida útil útil dos ramos de produção ativa.",
      criticalStage: "Granação ativa dos frutos."
    },
    PZn: {
      influence: "O Zinco induz o brotamento de novas folhas nos ramos produtivos. O excesso de Fósforo precipita e trava o Zinco no sistema condutor.",
      implication: "Gera ramos com internódios excessivamente curtos, folhas pequenas deformadas ('orelha de onça') e perda progressiva de ramificação produtiva.",
      criticalStage: "Retomada vegetativa pós-chuvas de primavera."
    }
  }
};

const getLocalIntegratedDiagnosis = (
  ratioKey: string,
  leafValue: number,
  soil: any,
  cropName: string
) => {
  const normCrop = getNormalizedCrop(cropName);
  
  if (ratioKey === 'NK') {
    const isLeafHigh = leafValue > 2.4;
    const isLeafLow = leafValue < 1.8;
    const soilK = soil?.kCmolcDm3 || 0;
    const isSoilLow = soilK < 0.15;
    
    if (isLeafHigh && isSoilLow) {
      return {
        status: 'Falta Sistêmica de Potássio',
        severity: 'danger' as const,
        implication: `Tanto a reserva trocável do solo (${soilK} cmolc/dm³) quanto o teor foliar de K estão críticos (Relação N:K de ${leafValue} indica alta carência). Isso limita diretamente a fotossíntese e reduzirá o peso final dos grãos/frutos.`,
        decision: `Urgente: Aplicação imediata de adubação potássica via foliar (ex: Sulfato de Potássio a 3%) conjugada com adubação de cobertura no solo na próxima janela viável.`
      };
    } else if (isLeafHigh && !isSoilLow) {
      return {
        status: 'Bloqueio de Absorção por Estresse',
        severity: 'warning' as const,
        implication: `Apesar de o solo conter níveis adequados de Potássio (${soilK} cmolc/dm³), a folha apresenta deficiência relativa (N:K de ${leafValue}). Isso ocorre frequentemente por estresse hídrico severo, compactação do solo ou sistema radicular preguiçoso.`,
        decision: `Evite aplicar mais adubo de K no solo. Recomenda-se o uso de bioestimulantes à base de aminoácidos ou extrato de algas via foliar para reativar as raízes e melhorar a absorção por transpiração.`
      };
    } else if (isLeafLow) {
      return {
        status: 'Consumo de Luxo / Risco de Antagonismo',
        severity: 'info' as const,
        implication: `A relação N:K está baixa (${leafValue}), indicando acúmulo excessivo de Potássio na planta. Isso pode induzir deficiências de Magnésio e Cálcio nas folhas por competição catiônica severa nas membranas.`,
        decision: `Suspenda adubações foliares ou de solo de Potássio temporariamente. Monitore rigorosamente os teores de Magnésio (Mg) e Cálcio (Ca) foliares para prevenir desfolhas competitivas.`
      };
    } else {
      return {
        status: 'Paridade Solo-Folha Equilibrada',
        severity: 'success' as const,
        implication: `A relação N:K foliar está equilibrada (${leafValue}) e as reservas do solo estão excelentes (${soilK} cmolc/dm³). A planta está translocando açúcares com máxima eficiência estomática.`,
        decision: `Manter o plano de adubação atual. Realizar aplicações preventivas de manutenção apenas se houver sobrecarga de produtividade.`
      };
    }
  }

  if (ratioKey === 'CaMg') {
    const isLeafHigh = leafValue > 3.0;
    const isLeafLow = leafValue < 2.0;
    const soilCa = soil?.caCmolcDm3 || 0;
    const soilMg = soil?.mgCmolcDm3 || 1;
    const soilRatio = Number((soilCa / soilMg).toFixed(1));
    const isSoilHigh = soilRatio > 4.0;
    
    if (isLeafHigh && isSoilHigh) {
      return {
        status: 'Antagonismo por Solo Super-Calcário',
        severity: 'danger' as const,
        implication: `A relação Ca:Mg no solo está muito alta (${soilRatio}), induzindo o alto valor foliar (${leafValue}). O excesso de Cálcio do calcário calcítico está suprimindo a absorção de Magnésio, comprometendo a formação de clorofila ativa.`,
        decision: `Recomenda-se pulverização foliar com Sulfato de Magnésio (MgSO4) para suprir o Mg sem passar pelo solo. Na próxima calagem, utilize estritamente calcário dolomítico.`
      };
    } else if (isLeafHigh && !isSoilHigh) {
      return {
        status: 'Bloqueio Metabólico de Magnésio',
        severity: 'warning' as const,
        implication: `A relação Ca:Mg foliar está desbalanceada (${leafValue}), mas a relação no solo está normal (${soilRatio}). Pode haver interferência de outros cátions (como excesso de K ou NH4) ou estresse hídrico dificultando o fluxo.`,
        decision: `Aplicar Magnésio complexado ou quelatado via foliar (1.5 L/ha) no início do período de maior atividade luminosa.`
      };
    } else if (isLeafLow) {
      return {
        status: 'Acidez / Falta de Cálcio no Solo',
        severity: 'danger' as const,
        implication: `Baixa relação Ca:Mg na folha (${leafValue}) acompanhada por solo com baixa saturação por bases. Fragiliza as membranas celulares e gera alta suscetibilidade a estresses hídricos.`,
        decision: `Foliar: Aplicar Nitrato de Cálcio ou Cálcio Quelatado. Solo: Planejar aplicação de gesso agrícola ou calcário calcítico para elevar a relação Ca:Mg do solo.`
      };
    } else {
      return {
        status: 'Balanço Ca:Mg Excelente',
        severity: 'success' as const,
        implication: `Equilíbrio excelente entre rigidez celular e atividade fotossintética, tanto na folha (${leafValue}) quanto nas bases trocáveis do solo (${soilRatio}).`,
        decision: `Mantenha o monitoramento padrão sem intervenções corretivas.`
      };
    }
  }

  if (ratioKey === 'PZn') {
    const isLeafHigh = leafValue > 120;
    const isLeafLow = leafValue < 70;
    const soilP = soil?.pMehlich1MgDm3 || 0;
    const soilZn = soil?.znMgDm3 || 0;
    
    if (isLeafHigh && soilP > 25) {
      return {
        status: 'Bloqueio de Zinco por Excesso de Fósforo',
        severity: 'danger' as const,
        implication: `Clássico bloqueio de Fósforo-Zinco. O excesso de P no solo (${soilP} mg/dm³) precipita o Zinco nas raízes, travando seu transporte para a folha e gerando a relação foliar crítica (${leafValue}), causando encurtamento nítido de entrenós.`,
        decision: `Interrompa adubações fosfatadas imediatas. Aplique Zinco Quelatado (EDTA) via foliar a 0.5 kg/ha para contornar o bloqueio radicular e reestabelecer o alongamento vegetativo.`
      };
    } else if (isLeafHigh && soilP <= 25) {
      return {
        status: 'Carência Absoluta de Zinco',
        severity: 'warning' as const,
        implication: `A relação foliar P:Zn está alta (${leafValue}) devido ao teor foliar de Zinco muito baixo, embora o P do solo esteja em nível moderado (${soilP} mg/dm³). Compromete diretamente o vigor e o crescimento apical da planta.`,
        decision: `Aplicar Sulfato de Zinco ou quelato via foliar na fase de expansão foliar vegetativa para restabelecer os hormônios de crescimento.`
      };
    } else {
      return {
        status: 'Harmonia P:Zn Estável',
        severity: 'success' as const,
        implication: `Balanço perfeito de Fósforo e Zinco na folha (${leafValue}). Ótimo crescimento de entrenós e aproveitamento energético ativo sem bloqueios hormonais.`,
        decision: `Nenhuma ação corretiva é necessária. Continuar monitoramento padrão.`
      };
    }
  }

  // Fallback default
  return {
    status: 'Análise Integrada Ativa',
    severity: 'info' as const,
    implication: `O sistema cruzou os dados da análise foliar (${leafValue}) com a análise química do solo correspondente (${soil?.sampleCode || 'N/A'}).`,
    decision: `O balanço de bases trocáveis e fósforo do solo está dentro dos limites para suportar o desenvolvimento fisiológico sem inibições severas.`
  };
};

const NUTRIENT_ABSORPTION_CURVES: Record<string, { v4: number; v8: number; r1: number; r5: number; r7: number; description: string }> = {
  N: {
    v4: 15, v8: 30, r1: 55, r5: 90, r7: 100,
    description: "O Nitrogênio apresenta demanda constante e acentuada a partir do vegetativo tardio, com pico absoluto de translocação e enchimento de grãos entre R1 e R5."
  },
  P: {
    v4: 20, v8: 40, r1: 60, r5: 85, r7: 100,
    description: "O Fósforo tem absorção precoce e contínua. É essencial no vegetativo (V4-V8) para o desenvolvimento de raízes, e no florescimento (R1) para transporte de energia (ATP)."
  },
  K: {
    v4: 10, v8: 25, r1: 50, r5: 85, r7: 100,
    description: "O Potássio apresenta pico de demanda extrema entre R1 e R5. É o principal osmorregulador, crítico para o enchimento de vagens e tolerância ao estresse hídrico."
  },
  Ca: {
    v4: 25, v8: 45, r1: 70, r5: 92, r7: 100,
    description: "O Cálcio é absorvido via fluxo transpitatório (lento e contínuo). Sua demanda é alta e precoce para sustentação mecânica, alongamento celular e fixação de flores."
  },
  Mg: {
    v4: 15, v8: 35, r1: 60, r5: 85, r7: 100,
    description: "O Magnésio é o átomo central da clorofila. A curva acelera fortemente a partir de V8 para sustentar a fotossíntese ativa e translocar fotoassimilados."
  },
  S: {
    v4: 12, v8: 28, r1: 52, r5: 82, r7: 100,
    description: "O Enxofre tem curva de absorção linear e muito próxima à do Nitrogênio, sendo crucial para a síntese de proteínas, aminoácidos essenciais e nodulação na soja."
  },
  B: {
    v4: 10, v8: 22, r1: 65, r5: 88, r7: 100,
    description: "O Boro exibe um pico de demanda crítico e abrupto no florescimento (R1) para viabilidade do tubo polínico e fixação de flores, exigindo alta disponibilidade foliar."
  },
  Zn: {
    v4: 22, v8: 45, r1: 62, r5: 82, r7: 100,
    description: "O Zinco apresenta absorção concentrada nas fases iniciais e vegetativas, servindo como cofator essencial para produção de auxina (hormônio de crescimento vegetal)."
  },
  Fe: {
    v4: 18, v8: 38, r1: 58, r5: 83, r7: 100,
    description: "O Ferro tem demanda contínua ao longo de todo o ciclo para respiração celular, síntese de clorofila e manutenção do aparato fotossintético."
  },
  Mn: {
    v4: 15, v8: 32, r1: 55, r5: 80, r7: 100,
    description: "O Manganês é demandado de forma constante com pico de atuação na fotólise da água e ativação de enzimas do metabolismo secundário."
  },
  Cu: {
    v4: 12, v8: 30, r1: 50, r5: 78, r7: 100,
    description: "O Cobre possui demanda contínua, atuando na respiração, fotossíntese, síntese de lignina e viabilidade reprodutiva da planta."
  },
  Mo: {
    v4: 10, v8: 25, r1: 60, r5: 85, r7: 100,
    description: "O Molibdênio tem curva de demanda focada nas fases de nodulação e fixação biológica de nitrogênio (FBN), sendo o cofator da enzima nitrogenase."
  }
};

const getStageKey = (stageStr: string): 'v4' | 'v8' | 'r1' | 'r5' | 'r7' => {
  const s = (stageStr || '').toLowerCase();
  if (s.includes('v4')) return 'v4';
  if (s.includes('v8')) return 'v8';
  if (s.includes('r5')) return 'r5';
  if (s.includes('r7')) return 'r7';
  return 'r1';
};

const getActualPercentageMultiplier = (status: NutrientClass) => {
  switch (status) {
    case 'Muito Baixo': return 0.25;
    case 'Baixo': return 0.55;
    case 'Alto': return 1.15;
    case 'Muito Alto': return 1.25;
    case 'Adequado':
    default:
      return 1.0;
  }
};

interface LeafAnalysisModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: FoliarTab) => void;
  leafSamples?: LeafSample[];
  setLeafSamples?: React.Dispatch<React.SetStateAction<LeafSample[]>>;
  farm?: Farm;
}

export const LeafAnalysisModule: React.FC<LeafAnalysisModuleProps> = ({
  activeSubTab: externalSubTab,
  setActiveSubTab: setExternalSubTab,
  leafSamples: externalLeafSamples,
  setLeafSamples: setExternalLeafSamples,
  farm,
}) => {
  const [internalTab, setInternalTab] = useState<FoliarTab>('dashboard');
  const activeTab = (externalSubTab as FoliarTab) || internalTab;
  const setActiveTab = (tab: FoliarTab) => {
    setInternalTab(tab);
    if (setExternalSubTab) {
      setExternalSubTab(tab);
    }
  };

  const [localSamples, setLocalSamples] = useState<LeafSample[]>(INITIAL_LEAF_SAMPLES);
  const samples = externalLeafSamples || localSamples;
  const setSamples = (updater: LeafSample[] | ((prev: LeafSample[]) => LeafSample[])) => {
    if (setExternalLeafSamples) {
      setExternalLeafSamples(updater);
    }
    setLocalSamples(updater);
  };

  const normalizedSamples = useMemo(() => (samples || []).filter(Boolean).map(s => getNormalizedSample(s)), [samples]);

  const [selectedSampleId, setSelectedSampleId] = useState<string>(samples?.[0]?.id || INITIAL_LEAF_SAMPLES?.[0]?.id || '');

  const currentSample = useMemo(() => {
    const found = normalizedSamples.find(s => s?.id === selectedSampleId);
    return found || normalizedSamples[0] || getNormalizedSample(null);
  }, [normalizedSamples, selectedSampleId]);

  // Amostra Tab Internal State
  const [sampleTabMode, setSampleTabMode] = useState<'manual' | 'import' | 'list' | 'ocr'>('manual');
  const [editingSampleId, setEditingSampleId] = useState<string | null>(null);
  const [sampleSearchFilter, setSampleSearchFilter] = useState<string>('');
  const [samplePlotFilter, setSamplePlotFilter] = useState<string>('all');
  const [sampleSuccessMsg, setSampleSuccessMsg] = useState<string | null>(null);

  // OCR/Foto Import State
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState<string | null>(null);
  const [ocrImagePreview, setOcrImagePreview] = useState<string | null>(null);
  const [ocrExtractedData, setOcrExtractedData] = useState<any | null>(null);

  // Manual Form State
  const [formSampleCode, setFormSampleCode] = useState<string>('AF-2026-003');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formResponsible, setFormResponsible] = useState<string>('Eng. Agrônomo Responsável');
  const [formFarmId, setFormFarmId] = useState<string>(farm?.id || 'fazenda-santa-maria');
  const [formFieldId, setFormFieldId] = useState<string>(farm?.plots?.[0]?.id || 'talhao-01');
  const [formCrop, setFormCrop] = useState<string>('Soja');
  const [formCultivar, setFormCultivar] = useState<string>('TMG 7062 IPRO');
  const [formStage, setFormStage] = useState<string>('R1 - Início do Florescimento');
  const [formOrgan, setFormOrgan] = useState<'Folha' | 'Pecíolo' | 'Folha Índice' | 'Outro'>('Folha');
  const [formPlantsSampled, setFormPlantsSampled] = useState<number>(30);
  const [formNotes, setFormNotes] = useState<string>('');

  // Form Results - Macros (g/kg)
  const [formN, setFormN] = useState<number>(42.5);
  const [formP, setFormP] = useState<number>(3.2);
  const [formK, setFormK] = useState<number>(18.0);
  const [formCa, setFormCa] = useState<number>(12.5);
  const [formMg, setFormMg] = useState<number>(4.8);
  const [formS, setFormS] = useState<number>(2.8);

  // Form Results - Micros (mg/kg / ppm)
  const [formB, setFormB] = useState<number>(38.0);
  const [formZn, setFormZn] = useState<number>(28.0);
  const [formFe, setFormFe] = useState<number>(115.0);
  const [formMn, setFormMn] = useState<number>(65.0);
  const [formCu, setFormCu] = useState<number>(9.5);
  const [formMo, setFormMo] = useState<number>(0.45);
  const [formCl, setFormCl] = useState<number>(0);
  const [formNi, setFormNi] = useState<number>(0);

  // Import State
  const [csvText, setCsvText] = useState<string>('');
  const [dragOver, setDragOver] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [importResult, setImportResult] = useState<{
    validSamples: LeafSample[];
    errors: string[];
    warnings: string[];
  } | null>(null);

  const resetForm = (sampleToEdit?: LeafSample) => {
    if (sampleToEdit) {
      const norm = getNormalizedSample(sampleToEdit);
      setEditingSampleId(norm.id);
      setFormSampleCode(norm.sampleCode);
      setFormDate(norm.date);
      setFormResponsible(norm.responsible || 'Eng. Agrônomo Responsável');
      setFormFarmId(norm.farmId || farm?.id || 'fazenda-santa-maria');
      setFormFieldId(norm.fieldId || 'talhao-01');
      setFormCrop(norm.crop || 'Soja');
      setFormCultivar(norm.cultivar || '');
      setFormStage(norm.phenologicalStage || 'R1');
      setFormOrgan((norm.organCollected as any) || 'Folha');
      setFormPlantsSampled(norm.plantsSampled || 30);
      setFormNotes(norm.notes || '');

      const r = norm?.results || ({} as LeafLabResults);
      setFormN(r.N || 0);
      setFormP(r.P || 0);
      setFormK(r.K || 0);
      setFormCa(r.Ca || 0);
      setFormMg(r.Mg || 0);
      setFormS(r.S || 0);

      setFormB(r.B || 0);
      setFormZn(r.Zn || 0);
      setFormFe(r.Fe || 0);
      setFormMn(r.Mn || 0);
      setFormCu(r.Cu || 0);
      setFormMo(r.Mo || 0);
      setFormCl(r.Cl || 0);
      setFormNi(r.Ni || 0);
    } else {
      setEditingSampleId(null);
      const newNum = samples.length + 1;
      setFormSampleCode(`AF-2026-${String(newNum).padStart(3, '0')}`);
      setFormDate(new Date().toISOString().split('T')[0]);
      setFormResponsible('Eng. Agrônomo Responsável');
      setFormFarmId(farm?.id || 'fazenda-santa-maria');
      setFormFieldId(farm?.plots?.[0]?.id || 'talhao-01');
      setFormCrop('Soja');
      setFormCultivar('TMG 7062 IPRO');
      setFormStage('R1 - Início do Florescimento');
      setFormOrgan('Folha');
      setFormPlantsSampled(30);
      setFormNotes('');

      setFormN(42.5);
      setFormP(3.2);
      setFormK(18.0);
      setFormCa(12.5);
      setFormMg(4.8);
      setFormS(2.8);

      setFormB(38.0);
      setFormZn(28.0);
      setFormFe(115.0);
      setFormMn(65.0);
      setFormCu(9.5);
      setFormMo(0.45);
      setFormCl(0);
      setFormNi(0);
    }
  };

  const handleSaveManualSample = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(formN) || 0;
    const p = Number(formP) || 0;
    const k = Number(formK) || 0;
    const ca = Number(formCa) || 0;
    const mg = Number(formMg) || 0;
    const s = Number(formS) || 0;
    const b = Number(formB) || 0;
    const zn = Number(formZn) || 0;
    const fe = Number(formFe) || 0;
    const mn = Number(formMn) || 0;
    const cu = Number(formCu) || 0;
    const mo = Number(formMo) || 0;

    const newSample: LeafSample = {
      id: editingSampleId || `foliar-${Date.now()}`,
      sampleCode: formSampleCode.trim() || `AF-${Date.now()}`,
      date: formDate,
      samplingDate: formDate,
      responsible: formResponsible,
      farmId: formFarmId,
      fieldId: formFieldId,
      plotId: formFieldId,
      crop: formCrop,
      cultivar: formCultivar,
      phenologicalStage: formStage,
      growthStage: formStage,
      organCollected: formOrgan,
      sampledPlantPart: formOrgan,
      plantsSampled: Number(formPlantsSampled) || 30,
      notes: formNotes,
      photos: [],
      n_g_kg: n,
      p_g_kg: p,
      k_g_kg: k,
      ca_g_kg: ca,
      mg_g_kg: mg,
      s_g_kg: s,
      b_mg_kg: b,
      zn_mg_kg: zn,
      fe_mg_kg: fe,
      mn_mg_kg: mn,
      cu_mg_kg: cu,
      mo_mg_kg: mo,
      results: {
        N: n,
        P: p,
        K: k,
        Ca: ca,
        Mg: mg,
        S: s,
        B: b,
        Zn: zn,
        Fe: fe,
        Mn: mn,
        Cu: cu,
        Mo: mo,
        Cl: formCl ? Number(formCl) : undefined,
        Ni: formNi ? Number(formNi) : undefined,
      }
    } as any;

    if (editingSampleId) {
      setSamples(prev => prev.map(s => s.id === editingSampleId ? newSample : s));
      setSampleSuccessMsg(`Amostra ${newSample.sampleCode} atualizada com sucesso!`);
    } else {
      setSamples(prev => [newSample, ...prev]);
      setSampleSuccessMsg(`Amostra ${newSample.sampleCode} cadastrada com sucesso!`);
    }

    setSelectedSampleId(newSample.id);
    setSampleTabMode('list');
    setTimeout(() => setSampleSuccessMsg(null), 4000);
  };

  const handleDeleteSample = (idToDelete: string) => {
    if (confirm("Tem certeza que deseja excluir esta amostra foliar?")) {
      const updated = samples.filter(s => s.id !== idToDelete);
      setSamples(updated);
      if (selectedSampleId === idToDelete && updated.length > 0) {
        if (updated[0]?.id) setSelectedSampleId(updated[0].id);
      }
      setSampleSuccessMsg("Amostra excluída com sucesso.");
      setTimeout(() => setSampleSuccessMsg(null), 3000);
    }
  };

  const downloadFoliarCsvTemplate = () => {
    const headers = "Codigo;Data;Talhao;Cultura;Cultivar;Estagio;Responsavel;N;P;K;Ca;Mg;S;B;Zn;Fe;Mn;Cu;Mo;Observacoes";
    const row1 = "AF-2026-010;2026-02-15;talhao-01;Soja;TMG 7062 IPRO;R1 - Início do Florescimento;Dr. Roberto Mendes;42.5;3.2;18.0;12.5;4.8;2.8;38.0;28.0;115.0;65.0;9.5;0.45;Coleta folha índice";
    const row2 = "AF-2026-011;2026-02-16;talhao-02;Milho;DKB 360;V8 - Desenvolvimento;Dr. Roberto Mendes;31.0;2.8;22.0;6.5;3.2;2.1;22.0;24.0;95.0;52.0;8.0;0.30;Talhão irrigado";
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent([headers, row1, row2].join("\n"));
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "modelo_importacao_amostras_foliares.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseFoliarCsv = (content: string) => {
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return;

    const validSamples: LeafSample[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    const firstLine = lines[0];
    let delimiter = ';';
    if (firstLine.includes('\t')) delimiter = '\t';
    else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';
    else if (firstLine.includes(',') && !firstLine.includes(';')) delimiter = ',';

    const startIndex = (firstLine.toLowerCase().includes('n') || firstLine.toLowerCase().includes('codigo') || firstLine.toLowerCase().includes('data')) ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const cols = lines[i].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length < 5) {
        errors.push(`Linha ${i + 1}: Linha com poucas colunas de dados.`);
        continue;
      }

      const sampleCode = cols[0] || `AF-IMP-${i + 1}`;
      const date = cols[1] || new Date().toISOString().split('T')[0];
      const fieldId = cols[2] || 'talhao-01';
      const crop = cols[3] || 'Soja';
      const cultivar = cols[4] || '';
      const phenologicalStage = cols[5] || 'R1';
      const responsible = cols[6] || 'Importação via Planilha';

      const N = parseFloat(cols[7]?.replace(',', '.')) || 0;
      const P = parseFloat(cols[8]?.replace(',', '.')) || 0;
      const K = parseFloat(cols[9]?.replace(',', '.')) || 0;
      const Ca = parseFloat(cols[10]?.replace(',', '.')) || 0;
      const Mg = parseFloat(cols[11]?.replace(',', '.')) || 0;
      const S = parseFloat(cols[12]?.replace(',', '.')) || 0;

      const B = parseFloat(cols[13]?.replace(',', '.')) || 0;
      const Zn = parseFloat(cols[14]?.replace(',', '.')) || 0;
      const Fe = parseFloat(cols[15]?.replace(',', '.')) || 0;
      const Mn = parseFloat(cols[16]?.replace(',', '.')) || 0;
      const Cu = parseFloat(cols[17]?.replace(',', '.')) || 0;
      const Mo = parseFloat(cols[18]?.replace(',', '.')) || 0;
      const notes = cols[19] || 'Importado por planilha CSV';

      if (N === 0 && P === 0 && K === 0) {
        errors.push(`Linha ${i + 1} (${sampleCode}): Teores de N, P e K nulos.`);
        continue;
      }

      if (N > 80 || K > 60) {
        warnings.push(`Linha ${i + 1} (${sampleCode}): Teor de N (${N} g/kg) ou K (${K} g/kg) excepcionalmente elevado.`);
      }

      const sample: LeafSample = {
        id: `foliar-imp-${Date.now()}-${i}`,
        sampleCode,
        date,
        samplingDate: date,
        responsible,
        farmId: farm?.id || 'fazenda-santa-maria',
        fieldId,
        plotId: fieldId,
        crop,
        cultivar,
        phenologicalStage,
        growthStage: phenologicalStage,
        organCollected: 'Folha',
        sampledPlantPart: 'Folha',
        plantsSampled: 30,
        notes,
        photos: [],
        n_g_kg: N,
        p_g_kg: P,
        k_g_kg: K,
        ca_g_kg: Ca,
        mg_g_kg: Mg,
        s_g_kg: S,
        b_mg_kg: B,
        zn_mg_kg: Zn,
        fe_mg_kg: Fe,
        mn_mg_kg: Mn,
        cu_mg_kg: Cu,
        mo_mg_kg: Mo,
        results: { N, P, K, Ca, Mg, S, B, Zn, Fe, Mn, Cu, Mo }
      } as any;

      validSamples.push(sample);
    }

    setImportResult({ validSamples, errors, warnings });
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setCsvText(content);
        parseFoliarCsv(content);
      }
    };
    reader.readAsText(file);
  };

  const [ocrLoadingStep, setOcrLoadingStep] = useState<string>('');

  useEffect(() => {
    let interval: any;
    if (ocrLoading) {
      const steps = [
        "Enviando laudo foliar para processamento...",
        "IA Nema analisando estrutura e tabela de nutrientes...",
        "Extraindo teores de macronutrientes (N, P, K, Ca, Mg, S)...",
        "Extraindo micronutrientes e teores de boro, zinco, ferro...",
        "Mapeando identificação da amostra e cultura...",
        "Finalizando estruturação dos teores foliares..."
      ];
      let i = 0;
      setOcrLoadingStep(steps[0]);
      interval = setInterval(() => {
        i = (i + 1) % steps.length;
        setOcrLoadingStep(steps[i]);
      }, 1800);
    } else {
      setOcrLoadingStep('');
    }
    return () => clearInterval(interval);
  }, [ocrLoading]);

  const handleOcrFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processOcrFile(file);
  };

  const processOcrFile = async (file: File) => {
    setOcrLoading(true);
    setOcrError(null);
    setOcrSuccessMsg(null);
    setOcrExtractedData(null);

    // Create preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOcrImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setOcrImagePreview(null);
    }

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string;
          const base64 = dataUrl.split(',')[1];
          const response = await fetch('/api/extract-foliar-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileData: base64,
              mimeType: file.type || 'image/png',
              fileName: file.name
            })
          });

          const resData = await response.json();
          if (resData.success && resData.data) {
            const extracted = resData.data;
            setOcrExtractedData(extracted);

            // PRE-FILL ALL FORM STATES:
            if (extracted.sampleCode) setFormSampleCode(extracted.sampleCode);
            if (extracted.collectionDate) setFormDate(extracted.collectionDate);
            if (extracted.crop) setFormCrop(extracted.crop);
            if (extracted.cultivar) setFormCultivar(extracted.cultivar);
            if (extracted.phenologicalStage) setFormStage(extracted.phenologicalStage);
            if (extracted.organCollected) setFormOrgan(extracted.organCollected);
            if (extracted.plantsSampled) setFormPlantsSampled(extracted.plantsSampled);
            if (extracted.notes) setFormNotes(extracted.notes);

            const r = extracted.results || {};
            if (r.N !== undefined) setFormN(r.N);
            if (r.P !== undefined) setFormP(r.P);
            if (r.K !== undefined) setFormK(r.K);
            if (r.Ca !== undefined) setFormCa(r.Ca);
            if (r.Mg !== undefined) setFormMg(r.Mg);
            if (r.S !== undefined) setFormS(r.S);

            if (r.B !== undefined) setFormB(r.B);
            if (r.Zn !== undefined) setFormZn(r.Zn);
            if (r.Fe !== undefined) setFormFe(r.Fe);
            if (r.Mn !== undefined) setFormMn(r.Mn);
            if (r.Cu !== undefined) setFormCu(r.Cu);
            if (r.Mo !== undefined) setFormMo(r.Mo);
            if (r.Cl !== undefined) setFormCl(r.Cl);
            if (r.Ni !== undefined) setFormNi(r.Ni);

            setOcrSuccessMsg(`Laudo foliar extraído com sucesso!`);
            setSampleSuccessMsg(`Laudo foliar importado via IA OCR. Confira e ajuste os dados se houver alguma discrepância.`);

            // Automatically redirect to manual mode to let user edit and correct!
            setSampleTabMode('manual');
          } else {
            throw new Error(resData.error || 'Não foi possível ler o arquivo enviado.');
          }
        } catch (err: any) {
          console.error(err);
          setOcrError(err?.message || 'Erro ao comunicar com a inteligência artificial para leitura do laudo.');
        } finally {
          setOcrLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error(err);
      setOcrError('Falha ao processar arquivo localmente.');
      setOcrLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (!importResult || !importResult.validSamples || importResult.validSamples.length === 0) return;
    setSamples(prev => [...importResult.validSamples, ...prev]);
    if (importResult.validSamples[0]?.id) {
      setSelectedSampleId(importResult.validSamples[0].id);
    }
    setSampleSuccessMsg(`${importResult.validSamples.length} amostra(s) foliar(es) importadas com sucesso!`);
    setImportResult(null);
    setCsvText('');
    setSampleTabMode('list');
    setTimeout(() => setSampleSuccessMsg(null), 4000);
  };

  const [integrateWithSoil, setIntegrateWithSoil] = useState<boolean>(false);

  const matchingSoilSample = useMemo(() => {
    return INITIAL_SOIL_SAMPLES.find(s => s.plotId === currentSample.fieldId) ||
           INITIAL_SOIL_SAMPLES.find(s => s.farmId === currentSample.farmId) ||
           INITIAL_SOIL_SAMPLES[0];
  }, [currentSample]);

  const [selectedNutrient, setSelectedNutrient] = useState<string>('N');
  const [absorbNutrient, setAbsorbNutrient] = useState<string>('K');
  const [historyNutrient, setHistoryNutrient] = useState<string>('N');
  const [historyPlotFilter, setHistoryPlotFilter] = useState<string>('all');
  const [historyCropFilter, setHistoryCropFilter] = useState<string>('all');
  const nutrientInfo = useMemo(() => NUTRIENT_LIBRARY.find(n => n.symbol === selectedNutrient) || NUTRIENT_LIBRARY[0], [selectedNutrient]);

  // Ratio explanation modal & widget inline state
  const [selectedExplanationRatioKey, setSelectedExplanationRatioKey] = useState<string | null>(null);
  const [showInlineWidgetExplanations, setShowInlineWidgetExplanations] = useState<boolean>(false);

  // Estados para Mapa Nutricional Foliar (GIS / VRA)
  const [mapNutrient, setMapNutrient] = useState<string>('N');
  const [mapFieldId, setMapFieldId] = useState<string>('all');
  const [mapViewMode, setMapViewMode] = useState<'points' | 'heatmap' | 'zones'>('points');
  const [selectedMapPointId, setSelectedMapPointId] = useState<string | null>(samples[0]?.id || null);
  const [showVraModal, setShowVraModal] = useState<boolean>(false);
  const [showAddPointModal, setShowAddPointModal] = useState<boolean>(false);

  // Estados para Desenho do Talhão por Coordenadas Geográficas (GPS)
  const [plotVertices, setPlotVertices] = useState<PlotGeoVertex[]>(DEFAULT_PLOT_VERTICES_PRESETS['talhao-01']);
  const [showDrawPlotModal, setShowDrawPlotModal] = useState<boolean>(false);
  const [plotCoordTabMode, setPlotCoordTabMode] = useState<'form' | 'batch' | 'presets'>('form');
  const [batchCoordInput, setBatchCoordInput] = useState<string>('');
  const [coordErrorMsg, setCoordErrorMsg] = useState<string | null>(null);
  const [coordSuccessMsg, setCoordSuccessMsg] = useState<string | null>(null);

  const parseBatchCoordinates = (text: string) => {
    setCoordErrorMsg(null);
    setCoordSuccessMsg(null);
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 3) {
      setCoordErrorMsg("Insira pelo menos 3 linhas de coordenadas (Latitude, Longitude) para formar o polígono do talhão.");
      return;
    }

    const newVerts: PlotGeoVertex[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(/[,;\s\t]+/).map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          newVerts.push({
            id: `v-${Date.now()}-${i}`,
            lat,
            lng,
            label: `Vértice ${i + 1}`
          });
        }
      }
    }

    if (newVerts.length < 3) {
      setCoordErrorMsg("Não foi possível reconhecer pelo menos 3 pares de coordenadas válidas. Use o formato: -12.5480, -55.7260");
      return;
    }

    setPlotVertices(newVerts);
    setCoordSuccessMsg(`${newVerts.length} vértices georreferenciados carregados com sucesso!`);
    setTimeout(() => setCoordSuccessMsg(null), 3500);
  };

  // Formulário para Adicionar Ponto no Mapa
  const [mapNewCode, setMapNewCode] = useState<string>('AF-GEO-001');
  const [mapNewPlot, setMapNewPlot] = useState<string>('talhao-01');
  const [mapNewLat, setMapNewLat] = useState<number>(-12.5535);
  const [mapNewLng, setMapNewLng] = useState<number>(-55.7210);

  // Estado para Diário Fotográfico
  const [diarySearchFilter, setDiarySearchFilter] = useState<string>('');
  const [diaryPlotFilter, setDiaryPlotFilter] = useState<string>('all');
  const [selectedDiarySample, setSelectedDiarySample] = useState<LeafSample | null>(null);
  
  // Modal de Adição de Fotos (Câmera & Galeria)
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);
  const [photoModalTab, setPhotoModalTab] = useState<'camera' | 'gallery'>('camera');
  const [targetSampleIdForPhoto, setTargetSampleIdForPhoto] = useState<string>('');
  const [photoFormTag, setPhotoFormTag] = useState<string>('Sintoma Visual');
  const [photoFormNotes, setPhotoFormNotes] = useState<string>('');
  const [photoFormDate, setPhotoFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  
  // WebRTC Câmera ao vivo
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  // Lightbox Modal para Visualização em Tela Cheia
  const [lightboxPhoto, setLightboxPhoto] = useState<{
    url: string;
    sampleId: string;
    sampleCode: string;
    crop: string;
    date: string;
    notes: string;
    photoIndex: number;
  } | null>(null);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoStream]);

  // Controle da Câmera WebRTC
  const startCamera = async (facing: 'environment' | 'user' = cameraFacingMode) => {
    try {
      setCameraError(null);
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } }
        });
      } catch (firstErr) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facing }
          });
        } catch (secondErr) {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
      }
      setVideoStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn("Camera stream access warning:", err);
      setCameraError("Câmera ao vivo indisponível neste dispositivo ou permissão não concedida. Utilize o botão abaixo para selecionar arquivos ou fotos da galeria.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    setIsCameraActive(false);
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextFacing);
    if (isCameraActive) {
      startCamera(nextFacing);
    }
  };

  const captureCameraSnapshot = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setUploadedPhotos(prev => [...prev, dataUrl]);
      }
    }
  };

  const handleGalleryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setUploadedPhotos(prev => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
    e.target.value = '';
  };

  const openAddPhotoModal = (sampleId?: string, mode: 'camera' | 'gallery' = 'camera') => {
    setTargetSampleIdForPhoto(sampleId || samples[0]?.id || '');
    setPhotoModalTab(mode);
    setUploadedPhotos([]);
    setPhotoFormNotes('');
    setPhotoFormDate(new Date().toISOString().split('T')[0]);
    setIsPhotoModalOpen(true);
    if (mode === 'camera') {
      setTimeout(() => {
        startCamera('environment');
      }, 250);
    }
  };

  const closeAddPhotoModal = () => {
    stopCamera();
    setIsPhotoModalOpen(false);
  };

  const handleSavePhotosToDiary = () => {
    if (uploadedPhotos.length === 0) {
      alert("Por favor, tire uma foto pela câmera ou anexe pelo menos uma foto da galeria.");
      return;
    }

    const sampleToUpdate = samples.find(s => s.id === targetSampleIdForPhoto);
    if (sampleToUpdate) {
      setSamples(prev => prev.map(s => {
        if (s.id === targetSampleIdForPhoto) {
          const updatedPhotos = [...(s.photos || []), ...uploadedPhotos];
          const newNotes = photoFormNotes
            ? (s.notes ? `${s.notes} | [${photoFormDate}] ${photoFormTag}: ${photoFormNotes}` : `[${photoFormDate}] ${photoFormTag}: ${photoFormNotes}`)
            : s.notes;
          return {
            ...s,
            photos: updatedPhotos,
            notes: newNotes
          };
        }
        return s;
      }));
    } else {
      const newSampleId = `sample-${Date.now()}`;
      const newSample: LeafSample = {
        id: newSampleId,
        sampleCode: `AF-DIARIO-${Math.floor(100 + Math.random() * 900)}`,
        date: photoFormDate,
        responsible: 'Técnico de Campo',
        farmId: farm?.id || 'fazenda-01',
        fieldId: 'talhao-01',
        crop: 'Soja',
        cultivar: 'Variedade Local',
        phenologicalStage: 'R1 - Florescimento',
        organCollected: 'Folha',
        plantsSampled: 20,
        notes: photoFormNotes ? `[${photoFormTag}] ${photoFormNotes}` : 'Registro fotográfico de campo.',
        photos: uploadedPhotos,
        results: {
          N: 42, P: 3.0, K: 17.0, Ca: 10.0, Mg: 4.0, S: 2.5,
          B: 35, Zn: 25, Fe: 110, Mn: 60, Cu: 9.0, Mo: 0.5
        }
      };
      setSamples(prev => [newSample, ...prev]);
    }

    closeAddPhotoModal();
  };

  const handleDeletePhotoFromSample = (sampleId: string, photoIndex: number) => {
    setSamples(prev => prev.map(s => {
      if (s.id === sampleId) {
        const nextPhotos = [...(s.photos || [])];
        nextPhotos.splice(photoIndex, 1);
        return { ...s, photos: nextPhotos };
      }
      return s;
    }));
    setLightboxPhoto(null);
  };

  // Estado para Diagnóstico por Sintomas
  const [symptomOrganFilter, setSymptomOrganFilter] = useState<string>('all');
  const [symptomTypeFilter, setSymptomTypeFilter] = useState<string>('all');
  const [selectedSymptomNutrient, setSelectedSymptomNutrient] = useState<string | null>(null);

  // Estado para Integração Solo x Folha
  const [soilIntegrationPlot, setSoilIntegrationPlot] = useState<string>('all');

  // Estado para Comparação de Níveis de Suficiência Nutricional por Cultura
  const [selectedSufficiencyCrop, setSelectedSufficiencyCrop] = useState<string>('');
  const [sufficiencyViewMode, setSufficiencyViewMode] = useState<'gauges' | 'chart' | 'table'>('gauges');
  const [sufficiencyNutrientFilter, setSufficiencyNutrientFilter] = useState<'all' | 'macros' | 'micros' | 'imbalanced'>('all');

  // Visual Helpers
  const getClassColor = (c: NutrientClass) => {
    switch (c) {
      case 'Muito Baixo': return 'bg-red-100 text-red-800 border-red-300';
      case 'Baixo': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Adequado': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Alto': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Muito Alto': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getDot = (c: NutrientClass) => {
    switch (c) {
      case 'Muito Baixo': return '🔴';
      case 'Baixo': return '🟡';
      case 'Adequado': return '🟢';
      case 'Alto': return '🟠';
      case 'Muito Alto': return '🔴';
      default: return '⚪';
    }
  };

  const ratios = useMemo(() => calculateRatios(currentSample?.results), [currentSample]);

  // Dynamic Categorization of Nutrients with Management Protocols
  const categorizedNutrients = useMemo(() => {
    const r = currentSample?.results || ({} as LeafLabResults);
    const crop = currentSample?.crop || 'Soja';
    const stage = currentSample?.phenologicalStage || 'R1';

    const nutrientList = [
      { symbol: 'N', name: 'Nitrogênio', value: r.N ?? 0, type: 'macros' as const, unit: 'g/kg' },
      { symbol: 'P', name: 'Fósforo', value: r.P ?? 0, type: 'macros' as const, unit: 'g/kg' },
      { symbol: 'K', name: 'Potássio', value: r.K ?? 0, type: 'macros' as const, unit: 'g/kg' },
      { symbol: 'Ca', name: 'Cálcio', value: r.Ca ?? 0, type: 'macros' as const, unit: 'g/kg' },
      { symbol: 'Mg', name: 'Magnésio', value: r.Mg ?? 0, type: 'macros' as const, unit: 'g/kg' },
      { symbol: 'S', name: 'Enxofre', value: r.S ?? 0, type: 'macros' as const, unit: 'g/kg' },
      { symbol: 'B', name: 'Boro', value: r.B ?? 0, type: 'micros' as const, unit: 'mg/kg' },
      { symbol: 'Zn', name: 'Zinco', value: r.Zn ?? 0, type: 'micros' as const, unit: 'mg/kg' },
      { symbol: 'Fe', name: 'Ferro', value: r.Fe ?? 0, type: 'micros' as const, unit: 'mg/kg' },
      { symbol: 'Mn', name: 'Manganês', value: r.Mn ?? 0, type: 'micros' as const, unit: 'mg/kg' },
      { symbol: 'Cu', name: 'Cobre', value: r.Cu ?? 0, type: 'micros' as const, unit: 'mg/kg' },
      { symbol: 'Mo', name: 'Molibdênio', value: r.Mo ?? 0, type: 'micros' as const, unit: 'mg/kg' },
    ];

    const deficiencies: Array<{ symbol: string; name: string; value: number; unit: string; status: NutrientClass; details: any }> = [];
    const excesses: Array<{ symbol: string; name: string; value: number; unit: string; status: NutrientClass; details: any }> = [];
    const adequate: Array<{ symbol: string; name: string; value: number; unit: string; status: NutrientClass; details: any }> = [];

    nutrientList.forEach(item => {
      const status = interpretNutrient(item.value, item.symbol, item.type, crop, stage);
      const guide = NUTRIENT_MANAGEMENT_GUIDE[item.symbol] || null;
      const entry = { ...item, status, details: guide };

      if (status === 'Muito Baixo' || status === 'Baixo') {
        deficiencies.push(entry);
      } else if (status === 'Alto' || status === 'Muito Alto') {
        excesses.push(entry);
      } else {
        adequate.push(entry);
      }
    });

    return { deficiencies, excesses, adequate, total: nutrientList.length };
  }, [currentSample]);

  // States for Nutrifoliar System
  const [selectedRatioKey, setSelectedRatioKey] = useState<string>('NK');
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // States for Solo & Fert Interactive Matrix
  const [selectedSoilSituation, setSelectedSoilSituation] = useState<string>('k_efficiency');
  const [soilPhSim, setSoilPhSim] = useState<number | null>(null);
  const [soilKSim, setSoilKSim] = useState<number | null>(null);
  const [soilCaMgSim, setSoilCaMgSim] = useState<number | null>(null);

  // Sub-tab & calculated indices for "Índices e Relações"
  const [indicesSubTab, setIndicesSubTab] = useState<'relacoes' | 'dris' | 'cnd' | 'dop' | 'curvas'>('relacoes');
  const [selectedCurveNutrient, setSelectedCurveNutrient] = useState<string>('N');

  const dopData = useMemo(() => calculateDOP(currentSample), [currentSample]);
  const drisData = useMemo(() => calculateDRIS(currentSample), [currentSample]);
  const cndData = useMemo(() => calculateCND(currentSample), [currentSample]);
  const curvesData = useMemo(() => getAbsorptionCurvesData(currentSample, selectedCurveNutrient), [currentSample, selectedCurveNutrient]);

  // Extended Nutrifoliar Ratios calculated dynamically
  const extendedRatios = useMemo(() => {
    const r = currentSample?.results || ({} as LeafLabResults);
    const rN = r.N ?? 0;
    const rP = r.P || 1;
    const rK = r.K || 1;
    const rS = r.S || 1;
    const rCa = r.Ca || 1;
    const rMg = r.Mg || 1;
    const rZn = r.Zn || 1;
    const rFe = r.Fe ?? 0;
    const rMn = r.Mn || 1;

    const NP = Number((rP ? rN / rP : 0).toFixed(1));
    const NK = Number((rK ? rN / rK : 0).toFixed(1));
    const NS = Number((rS ? rN / rS : 0).toFixed(1));
    const CaMg = Number((rMg ? rCa / rMg : 0).toFixed(1));
    const KMg = Number((rMg ? rK / rMg : 0).toFixed(1));
    const KCa = Number((rCa ? rK / rCa : 0).toFixed(2));
    const PZn = Number((rZn ? (rP * 1000) / rZn : 0).toFixed(1));
    const FeMn = Number((rMn ? rFe / rMn : 0).toFixed(1));
    return { NP, NK, NS, CaMg, KMg, KCa, PZn, FeMn };
  }, [currentSample]);

  // Dictionary containing optimal ranges and physiology of Nutrifoliar ratios
  const ratiosConfig = useMemo<Record<string, { label: string; value: number; minIdeal: number; maxIdeal: number; unit: string; description: string }>>(() => {
    return {
      NP: {
        label: 'Relação N:P',
        value: extendedRatios.NP,
        minIdeal: 14.0,
        maxIdeal: 18.0,
        unit: '',
        description: 'Mede a paridade entre a taxa de crescimento vegetativo (N) e a energia celular de floração (P). Valores elevados sugerem estresse por excesso de N ou deficiência de P.'
      },
      NK: {
        label: 'Relação N:K',
        value: extendedRatios.NK,
        minIdeal: 1.8,
        maxIdeal: 2.4,
        unit: '',
        description: 'Fator crítico de regulação estomática e translocação de açúcares. Relações elevadas (>2.4) indicam que a planta está sedenta por Potássio, fragilizando-a contra desidratação.'
      },
      NS: {
        label: 'Relação N:S',
        value: extendedRatios.NS,
        minIdeal: 15.0,
        maxIdeal: 18.0,
        unit: '',
        description: 'Equilíbrio crucial para a síntese de proteínas e aminoácidos. Desvios severos impedem o correto enchimento proteico dos grãos.'
      },
      CaMg: {
        label: 'Relação Ca:Mg',
        value: extendedRatios.CaMg,
        minIdeal: 2.0,
        maxIdeal: 3.0,
        unit: '',
        description: 'Balanço entre rigidez celular (Cálcio) e fotossíntese (Magnésio). Mantém o desenvolvimento foliar estável.'
      },
      KMg: {
        label: 'Relação K:Mg',
        value: extendedRatios.KMg,
        minIdeal: 4.0,
        maxIdeal: 6.0,
        unit: '',
        description: 'Antagonismo competitivo de cátions. Se o Potássio estiver muito alto em relação ao Magnésio (>6.0), ele deprime fisicamente a absorção de Mg, reduzindo a clorofila.'
      },
      PZn: {
        label: 'Relação P:Zn',
        value: extendedRatios.PZn,
        minIdeal: 70,
        maxIdeal: 120,
        unit: '',
        description: 'Interação Fósforo-Zinco. Valores altos (>120) indicam excesso de adubação fosfatada imobilizando o Zinco, inibindo auxinas e encurtando os internódios.'
      },
      FeMn: {
        label: 'Relação Fe:Mn',
        value: extendedRatios.FeMn,
        minIdeal: 1.5,
        maxIdeal: 2.5,
        unit: '',
        description: 'Paridade de metais enzimáticos catalisadores. Mantém o equilíbrio respiratório foliar contra toxicidades metálicas.'
      }
    };
  }, [extendedRatios]);

  // Request to server-side Nutrifoliar AI endpoint
  const handleNutrifoliarAI = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch('/api/nutrifoliar-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crop: currentSample.crop,
          phenologicalStage: currentSample.phenologicalStage,
          results: currentSample.results,
          integrateSoil: integrateWithSoil,
          soilAnalysis: integrateWithSoil && matchingSoilSample ? {
            sampleCode: matchingSoilSample.sampleCode,
            clayPercent: matchingSoilSample.clayPercent,
            phCaCl2: matchingSoilSample.phCaCl2,
            pMehlich1MgDm3: matchingSoilSample.pMehlich1MgDm3,
            kCmolcDm3: matchingSoilSample.kCmolcDm3,
            caCmolcDm3: matchingSoilSample.caCmolcDm3,
            mgCmolcDm3: matchingSoilSample.mgCmolcDm3,
            alCmolcDm3: matchingSoilSample.alCmolcDm3,
            bMgDm3: matchingSoilSample.bMgDm3,
            znMgDm3: matchingSoilSample.znMgDm3,
          } : null
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na comunicação com o servidor de IA.');
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        setAiAnalysis(resData.data);
      } else {
        throw new Error(resData.error || 'Erro inesperado na resposta da IA.');
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Ocorreu um erro ao gerar a análise foliar IA.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Principal */}
      <div className="bg-gradient-to-r from-emerald-950 via-green-900 to-teal-950 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-emerald-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-emerald-400" />
              Diagnose Foliar & Gêmeo Nutricional
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-4xl">
              Compare teores, avalie relações (DRIS/Cátions) e acompanhe a Curva de Absorção Nutricional.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center">
            <button
              onClick={() => {
                setActiveTab('amostra');
                setSampleTabMode('manual');
                resetForm();
              }}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Amostra Foliar</span>
            </button>
          </div>
        </div>
      </div>



      {/* Seletor de Amostra */}
      {(activeTab !== 'biblioteca' && activeTab !== 'dashboard' && activeTab !== 'mapa') && (
        <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500">Amostra Ativa:</span>
            <select
              value={selectedSampleId}
              onChange={e => setSelectedSampleId(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 font-bold text-slate-900 dark:text-white"
            >
              {samples.map(s => (
                <option key={s.id} value={s.id}>{s.sampleCode} - {s.crop} ({s.cultivar}) - {s.date}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 text-slate-600 dark:text-zinc-400 text-[11px]">
            <span>Estágio: <strong>{currentSample.phenologicalStage}</strong></span>
            <span>Talhão: <strong>{currentSample.fieldId}</strong></span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. DASHBOARD EXECUTIVO                                      */}
      {/* ========================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4 animate-fade-in">
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
             <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
               <span className="text-xs font-bold text-slate-500 block mb-1">Amostras Cadastradas</span>
               <strong className="text-2xl text-slate-900 dark:text-white">{samples.length}</strong>
             </div>
             <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
               <span className="text-xs font-bold text-slate-500 block mb-1">Status Geral</span>
               <strong className={`text-lg font-bold ${(categorizedNutrients?.deficiencies || []).length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                 {(categorizedNutrients?.deficiencies || []).length > 0
                   ? `Alerta: ${(categorizedNutrients?.deficiencies || []).map(d => d.symbol).join(', ')}`
                   : 'Equilibrado'}
               </strong>
             </div>
             <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
               <span className="text-xs font-bold text-slate-500 block mb-1">Nutrientes Adequados</span>
               <strong className="text-2xl text-emerald-600">
                 {(categorizedNutrients?.adequate || []).length} / {categorizedNutrients?.total || 0}
               </strong>
             </div>
             <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
               <span className="text-xs font-bold text-slate-500 block mb-1">Deficiências / Excessos</span>
               <strong className="text-2xl text-red-600">
                 {(categorizedNutrients?.deficiencies || []).length + (categorizedNutrients?.excesses || []).length}
               </strong>
             </div>
           </div>

           {/* Mural de Deficiências e Excessos com Recomendações de Manejo */}
           <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-6">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-900 pb-4">
               <div>
                 <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                   <span>Mural de Deficiências, Excessos e Protocolos de Manejo</span>
                   <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-zinc-800 font-bold text-slate-600 dark:text-slate-300">
                     Talhão: {currentSample.fieldId} ({currentSample.crop})
                   </span>
                 </h3>
                 <p className="text-xs text-slate-500 mt-0.5">
                   Análise interpretativa dos teores foliares e condutas de manejo nutricional recomendadas.
                 </p>
               </div>
             </div>

             {/* Categorias em Resumo */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
               {/* Deficiências */}
               <div className="p-4 bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl space-y-1">
                 <div className="flex items-center justify-between">
                   <strong className="text-xs font-bold text-red-800 dark:text-red-400 flex items-center gap-1.5">
                     <span>🔴</span> Deficiências ({(categorizedNutrients?.deficiencies || []).length})
                   </strong>
                 </div>
                 <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                   {(categorizedNutrients?.deficiencies || []).length > 0
                     ? (categorizedNutrients?.deficiencies || []).map(d => `${d.name} (${d.symbol}): ${d.value} ${d.unit}`).join(' · ')
                     : 'Nenhuma deficiência severa detectada.'}
                 </p>
               </div>

               {/* Excessos */}
               <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl space-y-1">
                 <div className="flex items-center justify-between">
                   <strong className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                     <span>🟠</span> Excessos / Elevados ({(categorizedNutrients?.excesses || []).length})
                   </strong>
                 </div>
                 <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                   {(categorizedNutrients?.excesses || []).length > 0
                     ? (categorizedNutrients?.excesses || []).map(e => `${e.name} (${e.symbol}): ${e.value} ${e.unit}`).join(' · ')
                     : 'Nenhum teor excessivo identificado.'}
                 </p>
               </div>

               {/* Adequados */}
               <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl space-y-1">
                 <div className="flex items-center justify-between">
                   <strong className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                     <span>🟢</span> Adequados ({(categorizedNutrients?.adequate || []).length})
                   </strong>
                 </div>
                 <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                   {(categorizedNutrients?.adequate || []).map(a => a.symbol).join(', ')}
                 </p>
               </div>
             </div>

             {/* Seção Detalhada de Manejo Recomendado para Deficiências e Excessos */}
             {((categorizedNutrients?.deficiencies || []).length > 0 || (categorizedNutrients?.excesses || []).length > 0) && (
               <div className="space-y-4 pt-2">
                 <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 border-l-4 border-emerald-500 pl-2">
                   Planos de Ação e Manejo Recomendados para Correção Nutricional
                 </h4>

                 <div className="space-y-4">
                   {/* Deficiências */}
                   {categorizedNutrients.deficiencies.map((item) => {
                     const details = item.details?.deficiency;
                     return (
                       <div key={`def-${item.symbol}`} className="p-5 bg-slate-50 dark:bg-zinc-900/80 border border-red-200 dark:border-red-900/60 rounded-xl space-y-4">
                         <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
                           <div className="flex items-center gap-2">
                             <span className="w-8 h-8 rounded-lg bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-black text-sm flex items-center justify-center">
                               {item.symbol}
                             </span>
                             <div>
                               <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                                 {item.name} ({item.symbol}) — <span className="text-red-600 dark:text-red-400 font-extrabold">{item.status}</span>
                               </h5>
                               <span className="text-xs text-slate-500">
                                 Teor medido: <strong>{item.value} {item.unit}</strong> | Cultura: {currentSample.crop} ({currentSample.phenologicalStage})
                               </span>
                             </div>
                           </div>
                           <span className="px-2.5 py-1 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-md text-xs font-bold border border-red-200 dark:border-red-900">
                             Ação Requerida
                           </span>
                         </div>

                         {details && (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                             {/* Fisiologia e Causas */}
                             <div className="p-3 bg-white dark:bg-black rounded-lg border border-slate-200 dark:border-zinc-800 space-y-2">
                               <h6 className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                                 <span>🧬</span> Explicação Fisiológica & Impacto
                               </h6>
                               <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                 {details.explanation}
                               </p>
                               <div className="pt-1 border-t border-slate-100 dark:border-zinc-900">
                                 <span className="font-bold text-slate-700 dark:text-slate-300">Causas prováveis: </span>
                                 <span className="text-slate-600 dark:text-slate-400">{details.causes}</span>
                               </div>
                             </div>

                             {/* Manejo Foliar */}
                             <div className="p-3 bg-white dark:bg-black rounded-lg border border-slate-200 dark:border-zinc-800 space-y-2">
                               <h6 className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 text-xs">
                                 <span>🍃</span> Manejo Foliar (Ação Emergencial)
                               </h6>
                               <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                 {details.foliarManagement}
                               </p>
                             </div>

                             {/* Manejo de Solo */}
                             <div className="p-3 bg-white dark:bg-black rounded-lg border border-slate-200 dark:border-zinc-800 space-y-2">
                               <h6 className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5 text-xs">
                                 <span>🚜</span> Manejo de Solo & Correção do Perfil
                               </h6>
                               <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                 {details.soilManagement}
                               </p>
                             </div>

                             {/* Boas Práticas */}
                             <div className="p-3 bg-white dark:bg-black rounded-lg border border-slate-200 dark:border-zinc-800 space-y-2">
                               <h6 className="font-bold text-sky-800 dark:text-sky-400 flex items-center gap-1.5 text-xs">
                                 <span>🛡️</span> Boas Práticas & Calda
                               </h6>
                               <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                 {details.bestPractices}
                               </p>
                             </div>
                           </div>
                         )}
                       </div>
                     );
                   })}

                   {/* Excessos */}
                   {categorizedNutrients.excesses.map((item) => {
                     const details = item.details?.excess;
                     return (
                       <div key={`exc-${item.symbol}`} className="p-5 bg-slate-50 dark:bg-zinc-900/80 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-4">
                         <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
                           <div className="flex items-center gap-2">
                             <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-black text-sm flex items-center justify-center">
                               {item.symbol}
                             </span>
                             <div>
                               <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                                 {item.name} ({item.symbol}) — <span className="text-amber-600 dark:text-amber-400 font-extrabold">{item.status}</span>
                               </h5>
                               <span className="text-xs text-slate-500">
                                 Teor medido: <strong>{item.value} {item.unit}</strong> | Cultura: {currentSample.crop}
                               </span>
                             </div>
                           </div>
                           <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-md text-xs font-bold border border-amber-200 dark:border-amber-900">
                             Mitigação de Antagonismo
                           </span>
                         </div>

                         {details && (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                             <div className="p-3 bg-white dark:bg-black rounded-lg border border-slate-200 dark:border-zinc-800 space-y-2">
                               <h6 className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                                 <span>🧬</span> Riscos Fisiológicos do Excesso
                               </h6>
                               <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                 {details.explanation}
                               </p>
                             </div>

                             <div className="p-3 bg-white dark:bg-black rounded-lg border border-slate-200 dark:border-zinc-800 space-y-2">
                               <h6 className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5 text-xs">
                                 <span>🛑</span> Manejo & Ação Mitigadora
                               </h6>
                               <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                 {details.management}
                               </p>
                             </div>
                           </div>
                         )}
                       </div>
                     );
                   })}
                 </div>
               </div>
             )}
           </div>

           {/* Bloco Nutrifoliar Shortcut Widget */}
           <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-3xs space-y-4">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-lg">
                   🌱
                 </div>
                 <div>
                   <h4 className="font-black text-sm text-slate-900 dark:text-white">Sistema Nema IA Nutrifoliar de Relações</h4>
                   <p className="text-xs text-slate-500">Mapeamento de antagonismos fisiológicos e balanço mineral foliar. Clique em qualquer relação para ver a explicação fisiológica.</p>
                 </div>
               </div>
               <div className="flex flex-wrap gap-2">
                 <button
                   onClick={() => setShowInlineWidgetExplanations(!showInlineWidgetExplanations)}
                   className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 rounded-lg text-xs font-bold hover:bg-emerald-100 cursor-pointer flex items-center gap-1.5"
                 >
                   <BookOpen className="w-3.5 h-3.5" />
                   {showInlineWidgetExplanations ? 'Ocultar Explicações' : 'Explicação das Relações'}
                 </button>
                 <button
                   onClick={() => setActiveTab('indices')}
                   className="px-3 py-1.5 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-bold hover:bg-slate-100 cursor-pointer dark:text-white"
                 >
                   Abrir Relações
                 </button>
                 <button
                   onClick={() => {
                     setActiveTab('indices');
                     setTimeout(() => {
                       handleNutrifoliarAI();
                     }, 150);
                   }}
                   className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                 >
                   <Zap className="w-3 h-3" />
                   Versão IA
                 </button>
               </div>
             </div>

             {/* Interactive Ratio Cards */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
               {[
                 { key: 'NK', label: 'Relação N:K', val: extendedRatios.NK },
                 { key: 'CaMg', label: 'Relação Ca:Mg', val: extendedRatios.CaMg },
                 { key: 'PZn', label: 'Relação P:Zn', val: extendedRatios.PZn },
                 { key: 'KMg', label: 'Relação K:Mg', val: extendedRatios.KMg },
               ].map(item => {
                 const cfg = ratiosConfig[item.key];
                 const isLow = cfg && cfg.value < cfg.minIdeal;
                 const isHigh = cfg && cfg.value > cfg.maxIdeal;
                 const statusText = isLow ? 'Baixo' : isHigh ? 'Alto' : 'Ideal';
                 const badgeClass = isHigh
                   ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                   : isLow
                   ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400'
                   : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400';

                 return (
                   <button
                     key={item.key}
                     onClick={() => setSelectedExplanationRatioKey(item.key)}
                     className="p-3 bg-white dark:bg-black rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-emerald-500 transition cursor-pointer flex items-center justify-between text-left group shadow-2xs hover:shadow-md"
                     title="Clique para ver a explicação fisiológica detalhada"
                   >
                     <div>
                       <div className="flex items-center gap-1">
                         <span className="text-[10px] text-slate-400 block font-bold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">{item.label}</span>
                         <Info className="w-2.5 h-2.5 text-slate-300 opacity-0 group-hover:opacity-100 transition" />
                       </div>
                       <strong className="text-sm font-black text-slate-900 dark:text-white">{item.val}</strong>
                     </div>
                     <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${badgeClass}`}>
                       {statusText}
                     </span>
                   </button>
                 );
               })}
             </div>

             {/* Inline Explanations Expandable Panel */}
             {showInlineWidgetExplanations && (
               <div className="p-4 bg-white dark:bg-black rounded-xl border border-emerald-200 dark:border-emerald-900/50 space-y-4 animate-fade-in">
                 <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                   <h5 className="font-black text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                     <BookOpen className="w-4 h-4" />
                     <span>Explicações Fisiológicas das Relações Foliares</span>
                   </h5>
                   <span className="text-[10px] text-slate-400">Clique em qualquer item para ver o plano de ação</span>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {['NK', 'CaMg', 'PZn', 'KMg'].map(rKey => {
                     const ratioDetail = RATIO_EXPLANATION_DETAILS[rKey];
                     if (!ratioDetail) return null;
                     const cfg = ratiosConfig[rKey];
                     const val = cfg ? cfg.value : 0;
                     const isLow = cfg && val < ratioDetail.minIdeal;
                     const isHigh = cfg && val > ratioDetail.maxIdeal;
                     const statusObj = isHigh ? ratioDetail.highStatus : isLow ? ratioDetail.lowStatus : ratioDetail.idealStatus;

                     return (
                       <div
                         key={rKey}
                         onClick={() => setSelectedExplanationRatioKey(rKey)}
                         className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200/60 dark:border-zinc-800 hover:border-emerald-400 cursor-pointer transition space-y-2 group"
                       >
                         <div className="flex items-center justify-between">
                           <strong className="text-xs font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                             {ratioDetail.name}
                           </strong>
                           <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                             isHigh ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400' :
                             isLow ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400' :
                             'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                           }`}>
                             {val} ({isHigh ? 'ALTO' : isLow ? 'BAIXO' : 'IDEAL'})
                           </span>
                         </div>
                         <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                           {statusObj.physiologicalImpact}
                         </p>
                         <div className="flex items-center justify-end text-[10px] font-bold text-emerald-600 dark:text-emerald-400 gap-0.5 pt-1">
                           <span>Ver Ação de Manejo</span>
                           <ChevronRight className="w-3 h-3" />
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
             )}
           </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. INTERPRETAÇÃO & COMPARATIVO DE NÍVEIS DE SUFICIÊNCIA   */}
      {/* ========================================================= */}
      {activeTab === 'interpretacao' && (() => {
        const activeCrop = selectedSufficiencyCrop || currentSample.crop || 'Soja';
        const sufficiencyData = getNutrientSufficiencyRange(activeCrop, currentSample.phenologicalStage);
        
        const allNutrientKeys = [
          { symbol: 'N', name: 'Nitrogênio', type: 'macros' as const, unit: 'g/kg' },
          { symbol: 'P', name: 'Fósforo', type: 'macros' as const, unit: 'g/kg' },
          { symbol: 'K', name: 'Potássio', type: 'macros' as const, unit: 'g/kg' },
          { symbol: 'Ca', name: 'Cálcio', type: 'macros' as const, unit: 'g/kg' },
          { symbol: 'Mg', name: 'Magnésio', type: 'macros' as const, unit: 'g/kg' },
          { symbol: 'S', name: 'Enxofre', type: 'macros' as const, unit: 'g/kg' },
          { symbol: 'B', name: 'Boro', type: 'micros' as const, unit: 'mg/kg' },
          { symbol: 'Cu', name: 'Cobre', type: 'micros' as const, unit: 'mg/kg' },
          { symbol: 'Fe', name: 'Ferro', type: 'micros' as const, unit: 'mg/kg' },
          { symbol: 'Mn', name: 'Manganês', type: 'micros' as const, unit: 'mg/kg' },
          { symbol: 'Zn', name: 'Zinco', type: 'micros' as const, unit: 'mg/kg' },
          { symbol: 'Mo', name: 'Molibdênio', type: 'micros' as const, unit: 'mg/kg' },
        ];

        const analyzedNutrients = allNutrientKeys.map(item => {
          const val = currentSample?.results ? (currentSample.results as any)[item.symbol] ?? 0 : 0;
          const limits = sufficiencyData ? (sufficiencyData[item.type] as any)[item.symbol] : null;
          const status = interpretNutrient(val, item.symbol, item.type, activeCrop, currentSample.phenologicalStage);
          
          let minAdequate = limits?.minAdequate ?? 0;
          let maxAdequate = limits?.maxAdequate ?? 100;
          let midPoint = (minAdequate + maxAdequate) / 2;
          let deviationPct = midPoint > 0 ? Math.round(((val - midPoint) / midPoint) * 100) : 0;

          // Normalized percentage for gauge spectrum (0% to 100%)
          let spectrumPercent = 50;
          if (limits) {
            if (val <= limits.maxVeryLow) {
              spectrumPercent = Math.max(5, (val / limits.maxVeryLow) * 20);
            } else if (val <= limits.maxLow) {
              spectrumPercent = 20 + ((val - limits.minLow) / Math.max(0.001, limits.maxLow - limits.minLow)) * 20;
            } else if (val <= limits.maxAdequate) {
              spectrumPercent = 40 + ((val - limits.minAdequate) / Math.max(0.001, limits.maxAdequate - limits.minAdequate)) * 20;
            } else if (val <= limits.maxHigh) {
              spectrumPercent = 60 + ((val - limits.minHigh) / Math.max(0.001, limits.maxHigh - limits.minHigh)) * 20;
            } else {
              spectrumPercent = Math.min(95, 80 + ((val - limits.minVeryHigh) / Math.max(0.001, limits.maxVeryHigh - limits.minVeryHigh)) * 20);
            }
          }

          return {
            ...item,
            val,
            status,
            limits,
            minAdequate,
            maxAdequate,
            midPoint,
            deviationPct,
            spectrumPercent: Math.min(Math.max(spectrumPercent, 5), 95)
          };
        });

        const adequateCount = analyzedNutrients.filter(n => n.status === 'Adequado').length;
        const lowCount = analyzedNutrients.filter(n => n.status === 'Baixo' || n.status === 'Muito Baixo').length;
        const highCount = analyzedNutrients.filter(n => n.status === 'Alto' || n.status === 'Muito Alto').length;
        const criticalDeficiencies = analyzedNutrients.filter(n => n.status === 'Muito Baixo');
        const criticalExcesses = analyzedNutrients.filter(n => n.status === 'Muito Alto');

        const totalNutrients = analyzedNutrients.length;
        const healthIndex = Math.round((adequateCount / totalNutrients) * 100);

        // Filtered list according to user filter
        const filteredNutrients = analyzedNutrients.filter(item => {
          if (sufficiencyNutrientFilter === 'macros') return item.type === 'macros';
          if (sufficiencyNutrientFilter === 'micros') return item.type === 'micros';
          if (sufficiencyNutrientFilter === 'imbalanced') return item.status !== 'Adequado';
          return true;
        });

        // Data for normalized variation chart (% of midpoint)
        const chartData = analyzedNutrients.map(n => ({
          symbol: n.symbol,
          name: n.name,
          pctOfIdeal: n.midPoint > 0 ? Math.round((n.val / n.midPoint) * 100) : 100,
          val: n.val,
          unit: n.unit,
          status: n.status,
          rangeText: `${n.minAdequate} - ${n.maxAdequate} ${n.unit}`
        }));

        return (
          <div className="space-y-6 animate-fade-in">
            {/* Header & Controls Bar */}
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-900 pb-4">
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-600" />
                    <span>Níveis de Suficiência Foliar & Alertas de Desequilíbrio Nutricional</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Comparativo oficial baseado nos padrões agronômicos EMBRAPA / IAC / Malavolta para a cultura selecionada.
                  </p>
                </div>

                {/* Crop Selector & Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">Cultura:</span>
                    <select
                      value={activeCrop}
                      onChange={(e) => setSelectedSufficiencyCrop(e.target.value)}
                      className="bg-transparent text-xs font-black text-emerald-700 dark:text-emerald-400 focus:outline-hidden cursor-pointer"
                    >
                      {FOLIAR_SUFFICIENCY_RANGES.map(r => (
                        <option key={r.crop} value={r.crop} className="dark:bg-zinc-900 dark:text-white">
                          🌾 {r.crop} ({r.phenologicalStage.split('(')[0].trim()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                    Estágio: {sufficiencyData?.phenologicalStage || currentSample.phenologicalStage}
                  </span>
                </div>
              </div>

              {/* View Mode and Nutrient Filter selectors */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Nutrient Type Filter */}
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl">
                  {[
                    { id: 'all', label: `Todos (${analyzedNutrients.length})` },
                    { id: 'macros', label: 'Macronutrientes' },
                    { id: 'micros', label: 'Micronutrientes' },
                    { id: 'imbalanced', label: `⚠️ Desequilíbrios (${lowCount + highCount})` }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setSufficiencyNutrientFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        sufficiencyNutrientFilter === f.id
                          ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs font-black'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* View Mode Buttons */}
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl">
                  <button
                    onClick={() => setSufficiencyViewMode('gauges')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      sufficiencyViewMode === 'gauges'
                        ? 'bg-emerald-600 text-white shadow-2xs font-black'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Espectro Visual</span>
                  </button>
                  <button
                    onClick={() => setSufficiencyViewMode('chart')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      sufficiencyViewMode === 'chart'
                        ? 'bg-emerald-600 text-white shadow-2xs font-black'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>Gráfico Relativo</span>
                  </button>
                  <button
                    onClick={() => setSufficiencyViewMode('table')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      sufficiencyViewMode === 'table'
                        ? 'bg-emerald-600 text-white shadow-2xs font-black'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Tabela Detalhada</span>
                  </button>
                </div>
              </div>
            </div>

            {/* KPI Summary Banner & Health Index */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Global Sufficiency Score */}
              <div className="p-5 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                    Índice de Adequação Foliar (IGAF)
                  </span>
                  <div className="flex items-baseline gap-2">
                    <strong className="text-3xl font-black text-slate-900 dark:text-white">{healthIndex}%</strong>
                    <span className="text-xs text-slate-500 font-bold">({adequateCount}/{totalNutrients})</span>
                  </div>
                </div>
                <div className="space-y-1.5 mt-3">
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-900 rounded-full overflow-hidden border">
                    <div
                      className={`h-full transition-all duration-500 ${
                        healthIndex >= 80 ? 'bg-emerald-500' : healthIndex >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${healthIndex}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-black uppercase block ${
                    healthIndex >= 80 ? 'text-emerald-600' : healthIndex >= 60 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {healthIndex >= 80 ? '🟢 Nutrição Equilibrada' : healthIndex >= 60 ? '🟡 Alerta de Desbalanço' : '🔴 Crítico: Correção Urgente'}
                  </span>
                </div>
              </div>

              {/* Adequados Card */}
              <div className="p-5 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-400">
                    🟢 Na Faixa de Suficiência
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <strong className="text-3xl font-black text-emerald-700 dark:text-emerald-400 block">{adequateCount}</strong>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                  Nutrientes suprindo a demanda fisiológica em {activeCrop}.
                </p>
              </div>

              {/* Sub-óptimo / Deficiente Card */}
              <div className="p-5 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-400">
                    🟡 Sub-óptimo / Baixo
                  </span>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <strong className="text-3xl font-black text-amber-700 dark:text-amber-400 block">{lowCount}</strong>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                  {lowCount > 0 ? `Limitação em: ${analyzedNutrients.filter(n => n.status.includes('Baixo')).map(n => n.symbol).join(', ')}` : 'Nenhum teor abaixo da suficiência.'}
                </p>
              </div>

              {/* Super-óptimo / Excesso Card */}
              <div className="p-5 bg-red-50/40 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-red-800 dark:text-red-400">
                    🔴 Super-óptimo / Excesso
                  </span>
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
                <strong className="text-3xl font-black text-red-700 dark:text-red-400 block">{highCount}</strong>
                <p className="text-[11px] text-red-800 dark:text-red-300 font-medium">
                  {highCount > 0 ? `Teores elevados: ${analyzedNutrients.filter(n => n.status.includes('Alto')).map(n => n.symbol).join(', ')}` : 'Nenhum teor em excesso ou toxicidade.'}
                </p>
              </div>
            </div>

            {/* Critical Imbalance Visual Warning Banner */}
            {(criticalDeficiencies.length > 0 || criticalExcesses.length > 0) && (
              <div className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                  <strong className="text-xs font-black uppercase text-red-700 dark:text-red-400 tracking-wider">
                    Alertas Críticos de Desequilíbrio Nutricional para {activeCrop}
                  </strong>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {criticalDeficiencies.map(def => (
                    <div key={def.symbol} className="p-3 bg-white dark:bg-black rounded-xl border border-red-300 dark:border-red-900 flex items-start gap-3">
                      <span className="w-8 h-8 rounded-lg bg-red-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                        {def.symbol}
                      </span>
                      <div>
                        <strong className="font-bold text-slate-900 dark:text-white block">
                          {def.name} ({def.symbol}) — Deficiência Muito Baixa
                        </strong>
                        <p className="text-red-600 dark:text-red-400 font-medium mt-0.5">
                          Medido: <strong>{def.val} {def.unit}</strong> (Mínimo recomendado: {def.minAdequate} {def.unit})
                        </p>
                        <p className="text-slate-500 text-[11px] mt-1">
                          Ação: Recomendada pulverização foliar emergencial para suprimento rápido.
                        </p>
                      </div>
                    </div>
                  ))}

                  {criticalExcesses.map(exc => (
                    <div key={exc.symbol} className="p-3 bg-white dark:bg-black rounded-xl border border-red-300 dark:border-red-900 flex items-start gap-3">
                      <span className="w-8 h-8 rounded-lg bg-red-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                        {exc.symbol}
                      </span>
                      <div>
                        <strong className="font-bold text-slate-900 dark:text-white block">
                          {exc.name} ({exc.symbol}) — Excesso Muito Alto
                        </strong>
                        <p className="text-red-600 dark:text-red-400 font-medium mt-0.5">
                          Medido: <strong>{exc.val} {exc.unit}</strong> (Máximo seguro: {exc.maxAdequate} {exc.unit})
                        </p>
                        <p className="text-slate-500 text-[11px] mt-1">
                          Ação: Risco de antagonismo e toxicidade celular. Suspender adubações foliares do elemento.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW MODE 1: GAUGES / SPECTRUM */}
            {sufficiencyViewMode === 'gauges' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredNutrients.map((item) => {
                    const isDeficient = item.status === 'Muito Baixo' || item.status === 'Baixo';
                    const isExcessive = item.status === 'Alto' || item.status === 'Muito Alto';
                    const isAdequate = item.status === 'Adequado';

                    let statusBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300';
                    if (item.status === 'Muito Baixo') statusBadgeClass = 'bg-red-600 text-white border-red-700';
                    if (item.status === 'Baixo') statusBadgeClass = 'bg-amber-500 text-white border-amber-600';
                    if (item.status === 'Alto') statusBadgeClass = 'bg-orange-500 text-white border-orange-600';
                    if (item.status === 'Muito Alto') statusBadgeClass = 'bg-red-600 text-white border-red-700';

                    const libraryInfo = NUTRIENT_LIBRARY.find(n => n.symbol === item.symbol);

                    return (
                      <div
                        key={item.symbol}
                        className={`p-5 bg-white dark:bg-black border rounded-2xl shadow-2xs space-y-4 transition-all duration-200 ${
                          isDeficient ? 'border-amber-300 dark:border-amber-900/60 ring-1 ring-amber-500/20' :
                          isExcessive ? 'border-red-300 dark:border-red-900/60 ring-1 ring-red-500/20' :
                          'border-slate-200 dark:border-zinc-800'
                        }`}
                      >
                        {/* Nutrient Card Top Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-900 pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-9 h-9 rounded-xl font-black text-base flex items-center justify-center ${
                              item.type === 'macros' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-teal-500/10 text-teal-700 dark:text-teal-400'
                            }`}>
                              {item.symbol}
                            </span>
                            <div>
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                                {item.name}
                                <span className="text-[10px] text-slate-400 uppercase font-bold">({item.type === 'macros' ? 'Macro' : 'Micro'})</span>
                              </h4>
                              <span className="text-[11px] text-slate-500 font-medium block">
                                Faixa Adequada: <strong className="text-emerald-700 dark:text-emerald-400">{item.minAdequate} a {item.maxAdequate} {item.unit}</strong>
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-2xl font-black text-slate-900 dark:text-white block">{item.val} <span className="text-xs font-normal text-slate-400">{item.unit}</span></span>
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase inline-block ${statusBadgeClass}`}>
                              {item.status}
                            </span>
                          </div>
                        </div>

                        {/* 5-Zone Spectrum Meter Bar */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                            <span>Muito Baixo</span>
                            <span>Baixo</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-black">Suficiência ({item.minAdequate}-{item.maxAdequate})</span>
                            <span>Alto</span>
                            <span>Muito Alto</span>
                          </div>

                          <div className="h-7 w-full bg-slate-100 dark:bg-zinc-900 rounded-xl relative flex items-center overflow-hidden border border-slate-200 dark:border-zinc-800">
                            {/* Zone 1: Very Low */}
                            <div className="w-[20%] h-full bg-red-500/20 border-r border-red-500/30 flex items-center justify-center text-[9px] font-bold text-red-600 dark:text-red-400 opacity-75">
                              M. Baixo
                            </div>
                            {/* Zone 2: Low */}
                            <div className="w-[20%] h-full bg-amber-500/20 border-r border-amber-500/30 flex items-center justify-center text-[9px] font-bold text-amber-600 dark:text-amber-400 opacity-75">
                              Baixo
                            </div>
                            {/* Zone 3: Adequate (Target Bounds) */}
                            <div className="w-[20%] h-full bg-emerald-500/30 border-r-2 border-l-2 border-emerald-500 flex items-center justify-center text-[9px] font-black text-emerald-800 dark:text-emerald-300">
                              Adequado
                            </div>
                            {/* Zone 4: High */}
                            <div className="w-[20%] h-full bg-orange-500/20 border-r border-orange-500/30 flex items-center justify-center text-[9px] font-bold text-orange-600 dark:text-orange-400 opacity-75">
                              Alto
                            </div>
                            {/* Zone 5: Very High */}
                            <div className="w-[20%] h-full bg-red-500/20 flex items-center justify-center text-[9px] font-bold text-red-600 dark:text-red-400 opacity-75">
                              M. Alto
                            </div>

                            {/* Measured Position Marker / Pin */}
                            <div
                              className="absolute top-0 bottom-0 w-4 -ml-2 flex flex-col items-center justify-center transition-all duration-500 z-10"
                              style={{ left: `${item.spectrumPercent}%` }}
                            >
                              <div className="w-4 h-full bg-slate-900 dark:bg-white rounded-md shadow-md flex items-center justify-center border border-white dark:border-black text-[9px] text-white dark:text-black font-black">
                                📍
                              </div>
                            </div>
                          </div>

                          {/* Delta indicator below gauge */}
                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="text-slate-400 font-medium">
                              Desvio: <strong className={item.deviationPct < -10 ? 'text-amber-600' : item.deviationPct > 10 ? 'text-orange-600' : 'text-emerald-600'}>
                                {item.deviationPct >= 0 ? `+${item.deviationPct}%` : `${item.deviationPct}%`} da média ideal ({item.midPoint} {item.unit})
                              </strong>
                            </span>
                            {isAdequate && (
                              <span className="text-emerald-600 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Faixa Ideal
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Agronomic Insight Box */}
                        {(isDeficient || isExcessive) && libraryInfo && (
                          <div className={`p-3 rounded-xl text-xs space-y-1 ${
                            isDeficient ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50' :
                            'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50'
                          }`}>
                            <strong className={`font-bold flex items-center gap-1 ${
                              isDeficient ? 'text-amber-800 dark:text-amber-300' : 'text-red-800 dark:text-red-300'
                            }`}>
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{isDeficient ? 'Sintomas de Deficiência & Impacto:' : 'Riscos de Excesso & Antagonismos:'}</span>
                            </strong>
                            <p className="text-slate-700 dark:text-zinc-300 leading-relaxed text-[11px]">
                              {isDeficient ? libraryInfo.deficiencySymptoms : libraryInfo.excessSymptoms}
                            </p>
                            <div className="pt-1 border-t border-slate-200/40 dark:border-zinc-800 text-[10px] text-slate-500">
                              <span className="font-bold">Fontes recomendadas: </span>{libraryInfo.fertilizerSources}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW MODE 2: CHART (% of Midpoint) */}
            {sufficiencyViewMode === 'chart' && (
              <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-900 pb-3">
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">Variação Nutricional Relativa (% da Suficiência Média Ideal)</h4>
                    <p className="text-xs text-slate-500">
                      100% representa o ponto médio da faixa de suficiência. Valores entre 90% e 110% estão na faixa ótima.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500"></span> Ótimo (90-110%)</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500"></span> Atenção</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500"></span> Crítico</span>
                  </div>
                </div>

                <div className="h-80 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="symbol" tick={{ fontSize: 12, fontWeight: 'bold' }} />
                      <YAxis domain={[0, 180]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                      <RechartsTooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="p-3 bg-slate-900 text-white rounded-xl text-xs space-y-1 shadow-xl">
                              <strong className="font-black block">{data.name} ({data.symbol})</strong>
                              <div>Teor Medido: <strong>{data.val} {data.unit}</strong></div>
                              <div>Faixa Ideal: <strong>{data.rangeText}</strong></div>
                              <div>Porcentagem do Ideal: <strong className="text-emerald-400">{data.pctOfIdeal}%</strong></div>
                              <div>Status: <strong>{data.status}</strong></div>
                            </div>
                          );
                        }}
                      />
                      <ReferenceLine y={100} stroke="#10b981" strokeWidth={2} label={{ value: '100% IDEAL', fill: '#10b981', fontSize: 10, fontWeight: 'bold' }} />
                      <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="3 3" />
                      <ReferenceLine y={120} stroke="#f59e0b" strokeDasharray="3 3" />
                      <Bar dataKey="pctOfIdeal" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, index) => {
                          let color = '#10b981'; // green
                          if (entry.pctOfIdeal < 80 || entry.pctOfIdeal > 130) color = '#ef4444'; // red
                          else if (entry.pctOfIdeal < 90 || entry.pctOfIdeal > 110) color = '#f59e0b'; // amber
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* VIEW MODE 3: TABLE */}
            {sufficiencyViewMode === 'table' && (
              <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-4 overflow-x-auto">
                <div className="border-b border-slate-100 dark:border-zinc-900 pb-3">
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">Tabela Agronômica de Níveis de Suficiência ({activeCrop})</h4>
                  <p className="text-xs text-slate-500">Valores medidos vs faixas limite oficiais por nutriente.</p>
                </div>

                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 font-black uppercase text-[10px]">
                      <th className="p-3">Nutriente</th>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Teor Medido</th>
                      <th className="p-3">Faixa Adequada</th>
                      <th className="p-3">Desvio (%)</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Recomendação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
                    {filteredNutrients.map((item) => {
                      const isDeficient = item.status === 'Muito Baixo' || item.status === 'Baixo';
                      const isExcessive = item.status === 'Alto' || item.status === 'Muito Alto';

                      return (
                        <tr key={item.symbol} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                          <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 font-black flex items-center justify-center text-xs">
                              {item.symbol}
                            </span>
                            <span>{item.name}</span>
                          </td>
                          <td className="p-3 font-medium text-slate-500 uppercase text-[10px]">{item.type}</td>
                          <td className="p-3 font-black text-slate-900 dark:text-white">{item.val} {item.unit}</td>
                          <td className="p-3 font-bold text-emerald-700 dark:text-emerald-400">{item.minAdequate} - {item.maxAdequate} {item.unit}</td>
                          <td className={`p-3 font-bold ${item.deviationPct < 0 ? 'text-amber-600' : item.deviationPct > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                            {item.deviationPct > 0 ? `+${item.deviationPct}%` : `${item.deviationPct}%`}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase ${getClassColor(item.status)}`}>
                              {getDot(item.status)} {item.status}
                            </span>
                          </td>
                          <td className="p-3 text-[11px] text-slate-600 dark:text-zinc-400 max-w-xs">
                            {isDeficient ? 'Adubação foliar suplementar recomendada' : isExcessive ? 'Monitorar antagonismos e suspender doses foliares' : 'Manter programa nutricional atual'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}

      {/* ========================================================= */}
      {/* 4. ÍNDICES & RELAÇÕES NUTRICIONAIS                          */}
      {/* ========================================================= */}
      {activeTab === 'indices' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                   <h3 className="font-black text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                     <Calculator className="w-5 h-5 text-emerald-600" />
                     Nema IA Nutrifoliar — Relações Nutricionais & Métodos Diagnósticos
                   </h3>
                   <p className="text-xs text-slate-500 mt-1">
                     Diagnóstico foliar avançado integrando DRIS, CND, DOP, Cátions e Curvas Fisiológicas de Absorção.
                   </p>
                </div>
                <button
                  onClick={handleNutrifoliarAI}
                  disabled={aiLoading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition duration-200 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <Zap className="w-4 h-4" />
                  {aiLoading ? 'Analisando Relações...' : 'Consultar IA Nutrifoliar'}
                </button>
             </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Índice IBN (DRIS)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{drisData.IBN}</span>
                <span className="text-xs text-slate-500">IBNm: {drisData.IBNm}</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block mt-1">
                {drisData.IBN < 30 ? 'Balanço Excelente' : drisData.IBN < 60 ? 'Balanço Moderado' : 'Desbalanço Elevado'}
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">CND Imbalance (r²)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{cndData.r2Imbalance}</span>
                <span className="text-xs text-slate-500">G: {cndData.G}</span>
              </div>
              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 block mt-1">
                Rd: {cndData.Rd} g/kg
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">DOP Médio (|DOP|)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{dopData.avgDOP}%</span>
                <span className="text-xs text-slate-500">Total: {dopData.totalDOP}%</span>
              </div>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block mt-1">
                {dopData.avgDOP < 10 ? 'Faixa Ótima' : dopData.avgDOP < 25 ? 'Desvio Moderado' : 'Desvio Crítico'}
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Nutriente Mais Limitante</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-red-600">{drisData.mostDeficient?.nutrient || 'N/A'}</span>
                <span className="text-xs font-bold text-slate-500">(Deficiência)</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                Excesso: <strong className="text-blue-600">{drisData.mostExcessive?.nutrient || 'N/A'}</strong>
              </span>
            </div>
          </div>

          {/* Sub-tab Navigation Selector */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
            {[
              { id: 'relacoes', label: '⚖️ Relações Fisiológicas' },
              { id: 'dris', label: '📊 DRIS' },
              { id: 'cnd', label: '🧬 CND' },
              { id: 'dop', label: '🎯 DOP' },
              { id: 'curvas', label: '📈 Curvas de Absorção' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setIndicesSubTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
                  indicesSubTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sub-tab 1: RELAÇÕES FISIOLÓGICAS & CÁTIONS */}
          {indicesSubTab === 'relacoes' && (
            <div className="space-y-6">
              {/* Soil Integration Control Panel */}
              <div className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${integrateWithSoil ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-200 dark:bg-zinc-900 text-slate-400'}`}>
                🌱
              </div>
              <div>
                <strong className="text-sm font-black block text-slate-900 dark:text-white">Integração com Análise de Solo</strong>
                <p className="text-xs text-slate-500">
                  {integrateWithSoil 
                    ? `Cruzando laudo foliar com a amostra de solo: ${matchingSoilSample?.sampleCode || 'N/A'} (Talhão: ${matchingSoilSample?.plotId || 'N/A'})` 
                    : "Interprete as relações foliares junto com os teores do solo para maior assertividade de campo."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Integrar com Solo</span>
              <button
                type="button"
                onClick={() => setIntegrateWithSoil(!integrateWithSoil)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${integrateWithSoil ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-800'}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${integrateWithSoil ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Ratio Cards Selection */}
            <div className="lg:col-span-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Relações Fisiológicas</h4>
              
                {Object.keys(ratiosConfig).map((key) => {
                  const config = ratiosConfig[key];
                  const isSelected = selectedRatioKey === key;
                  const isLow = config.value < config.minIdeal;
                  const isHigh = config.value > config.maxIdeal;
                  const status = isLow ? 'Baixo' : isHigh ? 'Alto' : 'Equilibrado';

                  let badgeColor = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400";
                  if (isLow) badgeColor = "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400";
                  if (isHigh) badgeColor = "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400";

                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedRatioKey(key);
                        setSelectedExplanationRatioKey(key);
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group hover:shadow-sm ${
                        isSelected
                          ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-500 shadow-2xs ring-1 ring-emerald-500/30"
                          : "bg-white dark:bg-black border-slate-200 dark:border-zinc-800 hover:border-emerald-500/50"
                      }`}
                      title="Clique para ver a explicação fisiológica, cuidados e recomendações de manejo"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-xs font-bold text-slate-600 dark:text-zinc-300 block uppercase group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                            {config.label}
                          </strong>
                          <BookOpen className="w-3 h-3 text-emerald-500 opacity-60 group-hover:opacity-100 transition" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black text-slate-950 dark:text-white">{config.value}</span>
                          <span className="text-[10px] text-slate-400">/ Ideal: {config.minIdeal}-{config.maxIdeal}</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-0.5 group-hover:underline">
                          <span>Ver explicação, cuidados e recomendações</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase self-start sm:self-center ${badgeColor}`}>
                        {status}
                      </span>
                    </button>
                  );
                })}
            </div>

            {/* Right Column: Detailed analysis or AI version */}
            <div className="lg:col-span-7 space-y-6">
              {/* Tabs for offline vs AI inside the analysis screen */}
              <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xs overflow-hidden">
                <div className="flex border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50">
                  <button
                    onClick={() => { if (aiAnalysis) setAiAnalysis(null); }}
                    className={`flex-1 py-3 text-center text-xs font-black transition cursor-pointer ${
                      !aiAnalysis
                        ? "border-b-2 border-emerald-500 text-slate-900 dark:text-white bg-white dark:bg-black"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    Fisiologia da Relação
                  </button>
                  <button
                    onClick={handleNutrifoliarAI}
                    disabled={aiLoading}
                    className={`flex-1 py-3 text-center text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      aiAnalysis
                        ? "border-b-2 border-emerald-500 text-slate-900 dark:text-white bg-white dark:bg-black"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-500" />
                    Balanço & Calda Nema IA Nutrifoliar
                  </button>
                </div>

                {/* Content Area */}
                <div className="p-6">
                  {aiLoading ? (
                    /* Loading State for AI */
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-12 h-12 border-4 border-emerald-500/35 border-t-emerald-600 rounded-full animate-spin"></div>
                      <div className="space-y-1">
                        <strong className="text-sm font-bold block text-slate-800 dark:text-zinc-200 animate-pulse">
                          Nema IA Nutrifoliar está analisando a folha...
                        </strong>
                        <p className="text-xs text-slate-500 max-w-sm">
                          Calculando relações de cátions, determinando bloqueios fisiológicos e estruturando a calda ideal.
                        </p>
                      </div>
                    </div>
                  ) : aiError ? (
                    /* Error State */
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900 text-center space-y-3">
                      <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
                      <div>
                        <strong className="text-xs text-red-800 dark:text-red-400 uppercase block font-black">Falha ao chamar Nema IA Nutrifoliar</strong>
                        <p className="text-xs text-red-600 dark:text-red-300 mt-1">{aiError}</p>
                      </div>
                      <button
                        onClick={handleNutrifoliarAI}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs cursor-pointer"
                      >
                        Tentar Novamente
                      </button>
                    </div>
                  ) : aiAnalysis ? (
                    /* AI Analysis View */
                    <div className="space-y-6 animate-fade-in">
                      {/* Summary */}
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl">
                        <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 block mb-1">
                          Diagnóstico Nema IA Nutrifoliar
                        </span>
                        <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-bold">
                          {aiAnalysis.summary}
                        </p>
                      </div>

                      {/* Hidden Hunger and Blockages */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-xl bg-slate-50 dark:bg-zinc-900">
                          <strong className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 block mb-2">
                            🔍 Fome Oculta Detectada
                          </strong>
                          <ul className="space-y-2">
                            {aiAnalysis.hiddenHunger?.map((item: string, idx: number) => (
                              <li key={idx} className="text-xs text-slate-600 dark:text-zinc-400 flex items-start gap-1.5">
                                <span className="text-amber-500 mt-0.5">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-4 border rounded-xl bg-slate-50 dark:bg-zinc-900">
                          <strong className="text-[10px] font-black uppercase text-red-600 dark:text-red-400 block mb-2">
                            🚫 Antagonismos Ativos
                          </strong>
                          <ul className="space-y-2">
                            {aiAnalysis.antagonismsIdentified?.map((item: string, idx: number) => (
                              <li key={idx} className="text-xs text-slate-600 dark:text-zinc-400 flex items-start gap-1.5">
                                <span className="text-red-500 mt-0.5">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Spray Prescription */}
                      <div className="space-y-3">
                        <strong className="text-xs font-black uppercase text-slate-700 dark:text-zinc-300 block">
                          🧪 Prescrição Foliar e Calda Recomendada
                        </strong>
                        <div className="space-y-4">
                          {aiAnalysis.foliarPrescription?.map((p: any, idx: number) => (
                            <div key={idx} className="p-4 border rounded-xl bg-white dark:bg-zinc-950 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                                <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-xs font-black">
                                    {idx + 1}
                                  </span>
                                  {p.productName}
                                </span>
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                                  {p.dose}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px]">
                                <div>
                                  <span className="text-slate-400 font-bold block">ÉPOCA</span>
                                  <strong className="dark:text-white">{p.timing}</strong>
                                </div>
                                <div>
                                  <span className="text-slate-400 font-bold block">VOL. CALDA</span>
                                  <strong className="dark:text-white">{p.waterVolume}</strong>
                                </div>
                                <div>
                                  <span className="text-slate-400 font-bold block">pH IDEAL</span>
                                  <strong className="dark:text-white">{p.sprayPh}</strong>
                                </div>
                                <div>
                                  <span className="text-slate-400 font-bold block">ADJUVANTE</span>
                                  <strong className="dark:text-white">{p.adjuvantRecommendation}</strong>
                                </div>
                              </div>
                              <div className="pt-2 border-t text-xs text-slate-500">
                                <strong className="text-[10px] font-black text-slate-400 uppercase block mb-1">Mecanismo Fisiológico</strong>
                                <p className="dark:text-zinc-400">{p.mechanismOfAction}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Operational Guidelines */}
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl space-y-2">
                        <strong className="text-[10px] font-black uppercase text-blue-700 dark:text-blue-400 block">
                          ⚙️ Recomendações de Campo & Operação
                        </strong>
                        <ul className="space-y-1.5 text-xs text-slate-600 dark:text-zinc-400">
                          {aiAnalysis.operationalRecommendations?.map((rec: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-blue-500 mt-0.5 font-bold">✓</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    /* Classical Physiology Interpretation (Offline) */
                    <div className="space-y-6 animate-fade-in">
                      {(() => {
                        const activeConfig = ratiosConfig[selectedRatioKey as keyof typeof ratiosConfig];
                        if (!activeConfig) return null;

                        const isLow = activeConfig.value < activeConfig.minIdeal;
                        const isHigh = activeConfig.value > activeConfig.maxIdeal;
                        
                        // Calculate percentage on a simple meter
                        const idealCenter = (activeConfig.minIdeal + activeConfig.maxIdeal) / 2;
                        const deviation = ((activeConfig.value - idealCenter) / idealCenter) * 100;
                        const meterPercent = Math.min(Math.max(50 + deviation, 10), 90);

                        return (
                          <div className="space-y-6">
                            {/* Selected Ratio Details */}
                            <div className="border-b pb-4 flex items-center justify-between">
                              <div>
                                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                                  {activeConfig.label}
                                </h4>
                                <span className="text-xs text-slate-400 uppercase font-black">
                                  Análise de Paridade Mineral
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-3xl font-black text-emerald-600 block">
                                  {activeConfig.value}
                                </span>
                                <span className="text-[10px] text-slate-500 font-bold block">
                                  Faixa Ideal: {activeConfig.minIdeal} a {activeConfig.maxIdeal}
                                </span>
                              </div>
                            </div>

                            {/* Gauge / Slider */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                                <span>Sub-óptimo (Baixo)</span>
                                <span className="text-emerald-600">Equilibrado (Ideal)</span>
                                <span>Super-óptimo (Alto)</span>
                              </div>
                              
                              <div className="h-6 w-full bg-slate-100 dark:bg-zinc-900 rounded-full relative flex items-center px-1 overflow-hidden border">
                                {/* Under limit zone */}
                                <div className="absolute left-0 top-0 bottom-0 w-[35%] bg-yellow-500/10 border-r border-yellow-500/20"></div>
                                {/* Ideal zone */}
                                <div className="absolute left-[35%] right-[35%] top-0 bottom-0 bg-emerald-500/10"></div>
                                {/* Over limit zone */}
                                <div className="absolute right-0 top-0 bottom-0 w-[35%] bg-red-500/10 border-l border-red-500/20"></div>
                                
                                {/* Current value marker */}
                                <div 
                                  className="absolute w-5 h-5 rounded-full bg-slate-950 dark:bg-white flex items-center justify-center text-[10px] text-white dark:text-slate-950 font-black shadow-md border transition-all duration-300"
                                  style={{ left: `calc(${meterPercent}% - 10px)` }}
                                >
                                  ★
                                </div>
                              </div>
                            </div>

                            {/* Detailed Text explanation & Diagnosis */}
                            {(() => {
                              const ratioDetail = RATIO_EXPLANATION_DETAILS[selectedRatioKey];
                              if (!ratioDetail) {
                                return (
                                  <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-xl space-y-2">
                                    <strong className="text-xs font-bold block text-slate-800 dark:text-zinc-200">
                                      Significado Fisiológico:
                                    </strong>
                                    <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                                      {activeConfig.description}
                                    </p>
                                  </div>
                                );
                              }

                              const statusObj = isHigh ? ratioDetail.highStatus : isLow ? ratioDetail.lowStatus : ratioDetail.idealStatus;

                              return (
                                <div className="space-y-4">
                                  {/* Overview */}
                                  <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-xl space-y-2 border border-slate-200/60 dark:border-zinc-800">
                                    <strong className="text-xs font-bold block text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                                      <BookOpen className="w-4 h-4 text-emerald-600" />
                                      <span>Visão Geral e Mecanismo Fisiológico</span>
                                    </strong>
                                    <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                                      {ratioDetail.definition}
                                    </p>
                                  </div>

                                  {/* Diagnostic Card for Current Status */}
                                  <div className={`p-4 rounded-xl border space-y-3 ${
                                    isHigh ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900' :
                                    isLow ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900' :
                                    'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900'
                                  }`}>
                                    <div className="flex items-center justify-between border-b pb-2 border-slate-200/50 dark:border-zinc-800">
                                      <strong className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <AlertTriangle className={`w-4 h-4 ${isHigh ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-emerald-600'}`} />
                                        <span>{statusObj.title}</span>
                                      </strong>
                                      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                                        isHigh ? 'bg-red-600 text-white' :
                                        isLow ? 'bg-amber-600 text-white' :
                                        'bg-emerald-600 text-white'
                                      }`}>
                                        {statusObj.badge}
                                      </span>
                                    </div>

                                    <div className="space-y-2 text-xs text-slate-700 dark:text-zinc-300">
                                      <div>
                                        <strong className="font-bold text-slate-900 dark:text-white block">Causas Fisiológicas e do Solo:</strong>
                                        <p className="mt-0.5 leading-relaxed">{statusObj.cause}</p>
                                      </div>
                                      <div>
                                        <strong className="font-bold text-slate-900 dark:text-white block">Mecanismo Fisiológico Celular:</strong>
                                        <p className="mt-0.5 leading-relaxed">{statusObj.physiologicalImpact}</p>
                                      </div>
                                    </div>

                                    {statusObj.practicalConsequences && statusObj.practicalConsequences.length > 0 && (
                                      <div className="pt-2 border-t border-slate-200/50 dark:border-zinc-800 space-y-1">
                                        <strong className="font-bold text-xs text-slate-900 dark:text-white block">Sintomas Práticos & Impactos na Cultura:</strong>
                                        <ul className="space-y-1 pt-0.5">
                                          {statusObj.practicalConsequences.map((cons, i) => (
                                            <li key={i} className="text-xs text-slate-600 dark:text-zinc-300 flex items-start gap-1.5">
                                              <span className="text-emerald-500 font-bold">•</span>
                                              <span>{cons}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    <div className="p-3 bg-white dark:bg-black rounded-lg border border-emerald-500/30 space-y-1">
                                      <strong className="text-xs font-black uppercase text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                        <Zap className="w-3.5 h-3.5" />
                                        <span>Recomendação de Manejo / Pulverização Foliar</span>
                                       </strong>
                                       {statusObj.careAndPrecautions && statusObj.careAndPrecautions.length > 0 && (
                                         <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg space-y-1 my-2">
                                           <strong className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                                             <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                             <span>Cuidados & Precauções Importantes:</span>
                                           </strong>
                                           <ul className="space-y-1">
                                             {statusObj.careAndPrecautions.map((care, i) => (
                                               <li key={i} className="text-xs text-slate-700 dark:text-zinc-300 flex items-start gap-1">
                                                 <span className="text-amber-500 font-bold">•</span>
                                                 <span>{care}</span>
                                               </li>
                                             ))}
                                           </ul>
                                         </div>
                                       )}
                                       <strong className="hidden">
                                      </strong>
                                      <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                                        {statusObj.action}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Influence on Production and Development per Crop */}
                            {(() => {
                              const normCrop = getNormalizedCrop(currentSample.crop);
                              const guide = CROP_IMPLICATION_GUIDE[normCrop]?.[selectedRatioKey];
                              if (!guide) return null;
                              return (
                                <div className="p-4 bg-emerald-50/15 dark:bg-emerald-950/5 border border-emerald-100/30 dark:border-emerald-900/30 rounded-xl space-y-3">
                                  <div className="flex items-center gap-1.5 border-b pb-1.5">
                                    <span className="text-xs">🌾</span>
                                    <strong className="text-xs font-black uppercase text-slate-800 dark:text-zinc-200">
                                      Influência Fisiológica por Cultura (Ativa: {normCrop})
                                    </strong>
                                  </div>
                                  <div className="space-y-2.5">
                                    <div>
                                      <strong className="text-[10px] text-slate-400 uppercase tracking-wider block">Influência no Desenvolvimento:</strong>
                                      <p className="text-xs text-slate-600 dark:text-zinc-300 mt-0.5 leading-relaxed">{guide.influence}</p>
                                    </div>
                                    <div>
                                      <strong className="text-[10px] text-slate-400 uppercase tracking-wider block">Impacto na Produtividade e Colheita:</strong>
                                      <p className="text-xs text-slate-600 dark:text-zinc-300 mt-0.5 leading-relaxed">{guide.implication}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 pt-1">
                                      <strong className="text-[10px] text-slate-400 uppercase tracking-wider">Estágio Crítico de Exigência:</strong>
                                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{guide.criticalStage}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Integrated Decision (Soil + Leaf) */}
                            {integrateWithSoil && (() => {
                              const integrated = getLocalIntegratedDiagnosis(selectedRatioKey, activeConfig.value, matchingSoilSample, currentSample.crop);
                              
                              let borderClass = 'border-slate-200 dark:border-zinc-800';
                              let bgClass = 'bg-slate-50 dark:bg-zinc-900/30';
                              let textClass = 'text-slate-800 dark:text-zinc-200';
                              
                              if (integrated.severity === 'danger') {
                                borderClass = 'border-red-200 dark:border-red-950 bg-red-50/10';
                                textClass = 'text-red-900 dark:text-red-400';
                              } else if (integrated.severity === 'warning') {
                                borderClass = 'border-amber-200 dark:border-amber-950 bg-amber-50/10';
                                textClass = 'text-amber-900 dark:text-amber-400';
                              } else if (integrated.severity === 'success') {
                                borderClass = 'border-emerald-200 dark:border-emerald-950 bg-emerald-50/10';
                                textClass = 'text-emerald-900 dark:text-emerald-400';
                              } else if (integrated.severity === 'info') {
                                borderClass = 'border-blue-200 dark:border-blue-950 bg-blue-50/10';
                                textClass = 'text-blue-900 dark:text-blue-400';
                              }

                              return (
                                <div className={`p-4 border rounded-xl space-y-3 ${borderClass} ${bgClass}`}>
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                                    <strong className={`text-xs font-black uppercase flex items-center gap-1.5 ${textClass}`}>
                                      <span>🧬</span> Decisão Integrada Solo + Folha
                                    </strong>
                                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase self-start sm:self-auto ${
                                      integrated.severity === 'danger' ? 'bg-red-100 text-red-800 border-red-300' :
                                      integrated.severity === 'warning' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                                      integrated.severity === 'success' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                                      'bg-blue-100 text-blue-800 border-blue-300'
                                    }`}>
                                      {integrated.status}
                                    </span>
                                  </div>
                                  
                                  <div className="space-y-2.5">
                                    <div>
                                      <strong className="text-[10px] text-slate-400 uppercase tracking-wider block">Análise & Implicações Cruzadas:</strong>
                                      <p className="text-xs mt-0.5 leading-relaxed text-slate-700 dark:text-zinc-300">
                                        {integrated.implication}
                                      </p>
                                    </div>
                                    <div>
                                      <strong className="text-[10px] text-slate-400 uppercase tracking-wider block">Recomendação de Campo:</strong>
                                      <p className="text-xs mt-0.5 font-bold leading-relaxed text-slate-900 dark:text-white">
                                        {integrated.decision}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Standard correction recommendations */}
                            <div className="p-4 border border-emerald-100 dark:border-emerald-950 rounded-xl bg-emerald-50/20 space-y-3">
                              <strong className="text-xs font-bold block text-emerald-800 dark:text-emerald-400 uppercase">
                                Ações Recomendadas (Lab Virtual):
                              </strong>
                              <p className="text-xs text-slate-600 dark:text-zinc-400">
                                {isLow 
                                  ? "Relação abaixo do ideal. Recomenda-se realizar uma adubação corretiva via foliar com fontes quelatadas para suprir o elemento limitante sem bloquear outros cátions." 
                                  : isHigh 
                                    ? "Relação acima do ideal. Alerta para consumo de luxo ou inibição competitiva. Suspenda aplicações desnecessárias e equilibre o pH da calda de pulverização." 
                                    : "Balanço nutricional perfeito nesta relação. Mantenha o manejo preventivo e acompanhe as curvas de absorção."
                                }
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>
          )}

          {/* Sub-tab 2: DRIS (Diagnosis and Recommendation Integrated System) */}
          {indicesSubTab === 'dris' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
                  <div>
                    <h4 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-emerald-600" />
                      Índices DRIS (Diagnosis and Recommendation Integrated System)
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      O DRIS avalia o balanço relativo entre pares de nutrientes. Valores negativos indicam deficiência relativa; valores positivos indicam consumo de luxo/excesso.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">IBN (Índice de Balanço)</span>
                      <strong className="text-lg font-black text-emerald-600">{drisData.IBN}</strong>
                    </div>
                    <div className="border-l border-slate-200 dark:border-zinc-800 pl-3">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">IBN Médio (IBNm)</span>
                      <strong className="text-lg font-black text-slate-800 dark:text-zinc-200">{drisData.IBNm}</strong>
                    </div>
                  </div>
                </div>

                {/* DRIS Bar Chart */}
                <div className="h-80 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={drisData.items} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="nutrient" tick={{ fill: '#888', fontSize: 12, fontWeight: 'bold' }} />
                      <YAxis domain={[-30, 30]} tick={{ fill: '#888', fontSize: 11 }} />
                      <RechartsTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="p-3 bg-slate-950 text-white rounded-xl shadow-lg border border-slate-800 text-xs space-y-1">
                                <strong className="font-bold block">{data.name} ({data.nutrient})</strong>
                                <div>Índice DRIS: <span className="font-black" style={{ color: data.color }}>{data.index}</span></div>
                                <div>Teor Medido: <strong>{data.measured} {data.unit}</strong></div>
                                <div>Status: <span className="uppercase font-bold" style={{ color: data.color }}>{data.status}</span></div>
                              </div>
                            );
                          }
                          return null;
                        }} 
                      />
                      <ReferenceLine y={0} stroke="#64748b" strokeWidth={1.5} />
                      <ReferenceLine y={-10} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Limite Deficiente (-10)', fill: '#ef4444', fontSize: 10 }} />
                      <ReferenceLine y={10} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Limite Excesso (+10)', fill: '#3b82f6', fontSize: 10 }} />
                      <Bar dataKey="index" radius={[4, 4, 0, 0]}>
                        {drisData.items.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* DRIS Order of Requirement */}
              <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xs">
                <h4 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Ordem de Requerimento e Limitação de Adubação (DRIS)
                </h4>
                <p className="text-xs text-slate-500">
                  Sequência dos nutrientes do mais deficiente (prioridade máxima de adubação) ao mais abundante.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {drisData.sorted.map((item, idx) => (
                    <div key={item.nutrient} className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-800 text-[10px] flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          {item.name} ({item.nutrient})
                        </span>
                        <span className="text-xs font-black" style={{ color: item.color }}>
                          {item.index}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Medido: <strong>{item.measured} {item.unit}</strong></span>
                        <span className="uppercase font-bold" style={{ color: item.color }}>{item.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab 3: CND (Diagnose Nutricional Composta) */}
          {indicesSubTab === 'cnd' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
                  <div>
                    <h4 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-teal-600" />
                      CND — Diagnose Nutricional Composta (Compositional Nutrient Diagnosis)
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Método multivariado que calcula a razão logarítmica de cada nutriente em relação à média geométrica (G) e matéria seca residual (Rd).
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Desbalanço CND (r²)</span>
                      <strong className="text-lg font-black text-teal-600">{cndData.r2Imbalance}</strong>
                    </div>
                    <div className="border-l border-slate-200 dark:border-zinc-800 pl-3">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Massa Residual (Rd)</span>
                      <strong className="text-lg font-black text-slate-800 dark:text-zinc-200">{cndData.Rd} g/kg</strong>
                    </div>
                  </div>
                </div>

                {/* CND Bar Chart */}
                <div className="h-80 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cndData.items} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="nutrient" tick={{ fill: '#888', fontSize: 12, fontWeight: 'bold' }} />
                      <YAxis domain={[-3, 3]} tick={{ fill: '#888', fontSize: 11 }} />
                      <RechartsTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="p-3 bg-slate-950 text-white rounded-xl shadow-lg border border-slate-800 text-xs space-y-1">
                                <strong className="font-bold block">{data.name} ({data.nutrient})</strong>
                                <div>Índice CND (I_CND): <span className="font-black" style={{ color: data.color }}>{data.index}</span></div>
                                <div>Teor (g/kg): <strong>{data.measuredGKg}</strong></div>
                                <div>Log-Ratio (Vx): <strong>{data.logRatio}</strong></div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <ReferenceLine y={0} stroke="#64748b" strokeWidth={1.5} />
                      <ReferenceLine y={-1.0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Limite Deficiência (-1.0)', fill: '#ef4444', fontSize: 10 }} />
                      <ReferenceLine y={1.0} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Limite Excesso (+1.0)', fill: '#3b82f6', fontSize: 10 }} />
                      <Bar dataKey="index" radius={[4, 4, 0, 0]}>
                        {cndData.items.map((entry, index) => (
                          <Cell key={`cnd-cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* CND Data Table */}
              <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 overflow-x-auto space-y-3 shadow-2xs">
                <h4 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">
                  Tabela Detalhada de Razões Logarítmicas CND
                </h4>
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="p-2.5">Nutriente</th>
                      <th className="p-2.5">Teor (g/kg)</th>
                      <th className="p-2.5">Log-Ratio Vx = ln(X/G)</th>
                      <th className="p-2.5">Índice CND (I_CND)</th>
                      <th className="p-2.5">Diagnóstico CND</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cndData.items.map((item) => (
                      <tr key={item.nutrient} className="border-b border-slate-100 dark:border-zinc-800/60 hover:bg-slate-50/50 dark:hover:bg-zinc-900/40">
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white">{item.name} ({item.nutrient})</td>
                        <td className="p-2.5 font-mono">{item.measuredGKg}</td>
                        <td className="p-2.5 font-mono">{item.logRatio}</td>
                        <td className="p-2.5 font-mono font-black" style={{ color: item.color }}>{item.index}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white" style={{ backgroundColor: item.color }}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-tab 4: DOP (Desvio do Percentual Ótimo) */}
          {indicesSubTab === 'dop' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
                  <div>
                    <h4 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-amber-600" />
                      DOP — Desvio do Percentual Ótimo (% Deviation from Optimum)
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      O DOP quantifica o percentual exato de desvio de cada nutriente em relação ao centro da faixa adequada recomendada para a cultura.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Desvio Médio (|DOP|)</span>
                      <strong className="text-lg font-black text-amber-600">{dopData.avgDOP}%</strong>
                    </div>
                    <div className="border-l border-slate-200 dark:border-zinc-800 pl-3">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Desvio Acumulado</span>
                      <strong className="text-lg font-black text-slate-800 dark:text-zinc-200">{dopData.totalDOP}%</strong>
                    </div>
                  </div>
                </div>

                {/* DOP Chart */}
                <div className="h-80 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dopData.items} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="nutrient" tick={{ fill: '#888', fontSize: 12, fontWeight: 'bold' }} />
                      <YAxis unit="%" tick={{ fill: '#888', fontSize: 11 }} />
                      <RechartsTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="p-3 bg-slate-950 text-white rounded-xl shadow-lg border border-slate-800 text-xs space-y-1">
                                <strong className="font-bold block">{data.name} ({data.nutrient})</strong>
                                <div>Desvio DOP: <span className="font-black" style={{ color: data.color }}>{data.dop > 0 ? `+${data.dop}%` : `${data.dop}%`}</span></div>
                                <div>Teor Medido: <strong>{data.measured} {data.unit}</strong></div>
                                <div>Faixa Ideal: <strong>{data.minAdequate} a {data.maxAdequate} {data.unit}</strong></div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <ReferenceLine y={0} stroke="#64748b" strokeWidth={1.5} />
                      <ReferenceLine y={-15} stroke="#ef4444" strokeDasharray="3 3" />
                      <ReferenceLine y={15} stroke="#3b82f6" strokeDasharray="3 3" />
                      <Bar dataKey="dop" radius={[4, 4, 0, 0]}>
                        {dopData.items.map((entry, index) => (
                          <Cell key={`dop-cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* DOP Nutrient Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dopData.items.map((item) => (
                  <div key={item.nutrient} className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                      <strong className="text-sm font-bold text-slate-900 dark:text-white">{item.name} ({item.nutrient})</strong>
                      <span className="text-xs font-black" style={{ color: item.color }}>
                        {item.dop > 0 ? `+${item.dop}%` : `${item.dop}%`}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Medido: <strong className="dark:text-white">{item.measured} {item.unit}</strong></span>
                      <span>Ótimo: <strong>{item.optimum} {item.unit}</strong></span>
                    </div>
                    <div className="pt-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white" style={{ backgroundColor: item.color }}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-tab 5: CURVAS DE ABSORÇÃO & SINCRONISMO NUTRICIONAL */}
          {indicesSubTab === 'curvas' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
                  <div>
                    <h4 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      Curvas Fisiológicas de Marcha e Acúmulo de Nutrientes
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Acompanhe o ritmo de extração e absorção do nutriente selecionado ao longo do ciclo fenológico (0 a 120 DAE) e sincronize a adubação.
                    </p>
                  </div>

                  {/* Nutrient Selector */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-zinc-900 p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                    {['N', 'P', 'K', 'Ca', 'Mg', 'S', 'B', 'Zn', 'Cu', 'Fe', 'Mn'].map((nut) => (
                      <button
                        key={nut}
                        onClick={() => setSelectedCurveNutrient(nut)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                          selectedCurveNutrient === nut
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {nut}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Absorption Curve Chart */}
                <div className="h-80 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={curvesData.curveData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="stage" tick={{ fill: '#888', fontSize: 11, fontWeight: 'bold' }} />
                      <YAxis unit={` ${curvesData.unit}`} tick={{ fill: '#888', fontSize: 11 }} />
                      <RechartsTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="p-3 bg-slate-950 text-white rounded-xl shadow-lg border border-slate-800 text-xs space-y-1">
                                <strong className="font-bold block">{data.stage} ({data.dae} DAE)</strong>
                                <div>Ideal Esperado: <strong>{data.idealVal} {curvesData.unit}</strong></div>
                                <div>Faixa Ótima: <strong>{data.minVal} a {data.maxVal} {curvesData.unit}</strong></div>
                                <div>Taxa de Absorção: <strong>{data.demandRateKgDay} kg/ha/dia</strong></div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line type="monotone" dataKey="idealVal" name="Demanda Ideal" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: '#10b981' }} />
                      <Line type="monotone" dataKey="minVal" name="Piso Mínimo" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" />
                      <Line type="monotone" dataKey="maxVal" name="Teto Máximo" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 4" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Curve Details & Sincronismo Nutricional */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-2 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Pico de Demanda Fisiológica</span>
                  <strong className="text-base font-black text-slate-900 dark:text-white block">Florescimento R1 - R2 (45 a 65 DAE)</strong>
                  <p className="text-xs text-slate-500">Taxa máxima de absorção foliar/radicular de {curvesData.name}.</p>
                </div>

                <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-2 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Teor Atual Medido</span>
                  <div className="flex items-baseline gap-2">
                    <strong className="text-2xl font-black text-emerald-600">{curvesData.currentVal}</strong>
                    <span className="text-xs text-slate-500">{curvesData.unit}</span>
                  </div>
                  <p className="text-xs text-slate-500">Suficiência recomendada: {curvesData.minAdequate} a {curvesData.maxAdequate} {curvesData.unit}.</p>
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-2xl space-y-2 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 block">Janela de Aplicação Foliar</span>
                  <strong className="text-sm font-black text-slate-900 dark:text-white block">Pré-Florescimento (V8 a R1)</strong>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">Garanta suplementação antes do pico de absorção para evitar fome oculta e abortamento.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. GÊMEO NUTRICIONAL (DIGITAL TWIN)                         */}
      {/* ========================================================= */}
      {activeTab === 'gemeo_nutricional' && (
        <div className="space-y-6 animate-fade-in bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
           <div className="border-b pb-4">
              <h3 className="font-black text-lg text-emerald-700 dark:text-emerald-500 flex items-center gap-2">
                <Zap className="w-5 h-5"/> Gêmeo Nutricional da Cultura (T-04)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Acompanhamento holístico da trajetória nutricional integrando folha, solo e fenologia.
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="md:col-span-2 space-y-4 border-r border-slate-200 dark:border-zinc-800 pr-6">
                <h4 className="font-bold text-sm">Linha do Tempo Nutricional (Safra Atual)</h4>
                
                <div className="space-y-4 border-l-2 border-emerald-500/30 ml-2 pl-4">
                  <div className="relative">
                    <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-stone-500 border-2 border-white dark:border-black"></span>
                    <span className="text-[10px] font-bold text-stone-500">Pré-Plantio (Solo)</span>
                    <strong className="text-sm font-bold block dark:text-white">Análise de Solo: K (0.15 cmol/dm³) - Baixo</strong>
                    <span className="text-xs text-slate-500">Alerta inicial gerado pelo Lab Virtual de Solos.</span>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-black"></span>
                    <span className="text-[10px] font-bold text-blue-500">Adubação de Base (V3)</span>
                    <strong className="text-sm font-bold block dark:text-white">Aplicação de 150 kg/ha KCl</strong>
                    <span className="text-xs text-slate-500">Tentativa de correção do potássio.</span>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-black"></span>
                    <span className="text-[10px] font-bold text-emerald-600">Amostragem Foliar (R1) - {currentSample.date}</span>
                    <strong className="text-sm font-bold block dark:text-white text-red-600">Diagnóstico Foliar: K (15.5 g/kg) - Baixo</strong>
                    <span className="text-xs text-slate-500">A planta não absorveu K suficiente. Risco de abortamento de vagens.</span>
                  </div>
                </div>
             </div>
             
             <div className="space-y-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900">
                  <strong className="text-xs block text-emerald-800 dark:text-emerald-400 mb-2">Clima & Fenologia</strong>
                  <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 space-y-1">
                    <p>Estágio: R1 (Florescimento)</p>
                    <p>Clima: Estresse Hídrico (Seca 15 dias)</p>
                    <p className="mt-2 text-red-600">Conclusão do Gêmeo: A seca limitou o fluxo de massa do Potássio (K) no solo, impedindo a absorção radicular apesar da adubação de base.</p>
                  </div>
                </div>
             </div>
           </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. CURVA DE ABSORÇÃO                                        */}
      {/* ========================================================= */}
      {activeTab === 'curva_absorcao' && (() => {
        const curve = NUTRIENT_ABSORPTION_CURVES[absorbNutrient] || NUTRIENT_ABSORPTION_CURVES.K;
        const nutrientName = NUTRIENT_LIBRARY.find(n => n.symbol === absorbNutrient)?.name || absorbNutrient;
        const r = currentSample?.results || ({} as LeafLabResults);
        const measuredValue = Number(r[absorbNutrient as keyof LeafLabResults] ?? 0);
        const isMacro = ['N', 'P', 'K', 'Ca', 'Mg', 'S'].includes(absorbNutrient);
        const nutrientType = isMacro ? 'macros' : 'micros';
        const status = interpretNutrient(measuredValue, absorbNutrient, nutrientType, currentSample?.crop || 'Soja', currentSample?.phenologicalStage || 'R1');
        const multiplier = getActualPercentageMultiplier(status);
        const unit = isMacro ? 'g/kg' : 'mg/kg';
        const activeStageKey = getStageKey(currentSample?.phenologicalStage || 'R1');

        let statusColorClass = "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900";
        let statusLabel = "ADEQUADO";
        let actualBarColor = "bg-emerald-500";
        let actualBarBorder = "border-t-2 border-emerald-600";

        if (status === 'Muito Baixo') {
          statusColorClass = "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900";
          statusLabel = "CRÍTICO (Muito Baixo)";
          actualBarColor = "bg-red-500 animate-pulse";
          actualBarBorder = "border-t-2 border-red-600 border-dashed";
        } else if (status === 'Baixo') {
          statusColorClass = "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900";
          statusLabel = "DEFICITÁRIO (Baixo)";
          actualBarColor = "bg-amber-500";
          actualBarBorder = "border-t-2 border-amber-600 border-dashed";
        } else if (status === 'Alto') {
          statusColorClass = "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-900";
          statusLabel = "ELEVADO (Alto)";
          actualBarColor = "bg-sky-500";
          actualBarBorder = "border-t-2 border-sky-600";
        } else if (status === 'Muito Alto') {
          statusColorClass = "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-900";
          statusLabel = "EXCESSIVO (Muito Alto)";
          actualBarColor = "bg-purple-500";
          actualBarBorder = "border-t-2 border-purple-600";
        }

        const stagesList: Array<{ id: 'v4' | 'v8' | 'r1' | 'r5' | 'r7'; label: string; name: string }> = [
          { id: 'v4', label: 'V4', name: 'Vegetativo Inicial' },
          { id: 'v8', label: 'V8', name: 'Vegetativo Avançado' },
          { id: 'r1', label: 'R1', name: 'Início do Florescimento' },
          { id: 'r5', label: 'R5', name: 'Enchimento de Grãos' },
          { id: 'r7', label: 'R7', name: 'Maturação Fisiológica' }
        ];

        return (
          <div className="space-y-6 animate-fade-in bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h3 className="font-black text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                  Curva de Absorção Nutricional 
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Comparação entre a demanda da cultura (Literatura) e o status real da análise foliar no estágio {currentSample.phenologicalStage}.
                </p>
              </div>

              {/* Seletor Interativo de Nutrientes para a Curva */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">Selecionar Nutriente:</span>
                <select 
                  value={absorbNutrient}
                  onChange={e => setAbsorbNutrient(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 font-bold text-xs focus:ring-2 focus:ring-emerald-500 cursor-pointer text-slate-800 dark:text-zinc-100"
                >
                  {NUTRIENT_LIBRARY.map(n => (
                    <option key={n.symbol} value={n.symbol}>
                      {n.name} ({n.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Painel de Métricas e Informações Básicas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Teor Medido no Lote</span>
                <strong className="text-xl font-black text-slate-800 dark:text-white block mt-1">
                  {measuredValue} <span className="text-sm font-medium">{unit}</span>
                </strong>
                <span className="text-[10px] text-slate-500">Amostra: {currentSample.sampleCode}</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Status Nutricional</span>
                <span className={`inline-block text-[10px] font-black px-2.5 py-1 rounded-full mt-2 border ${statusColorClass}`}>
                  {statusLabel}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Estágio Coleta: {currentSample.phenologicalStage}</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Classificação</span>
                <strong className="text-sm font-bold block mt-2 text-slate-700 dark:text-zinc-200">
                  {isMacro ? 'Macronutriente' : 'Micronutriente'}
                </strong>
                <span className="text-[10px] text-slate-500">Mobilidade: {NUTRIENT_LIBRARY.find(n => n.symbol === absorbNutrient)?.mobility || 'N/A'}</span>
              </div>
            </div>
            
            {/* Gráfico de Curva Dinâmica */}
            <div className="p-4 border rounded-xl bg-slate-50 dark:bg-zinc-900/30">
              <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
                <strong className="text-sm font-black text-slate-800 dark:text-zinc-100">
                  Demanda Acumulada de {nutrientName} ({absorbNutrient}) na {currentSample.crop}
                </strong>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded border ${statusColorClass}`}>
                  Status Real: {statusLabel}
                </span>
              </div>
              
              <div className="w-full h-44 flex items-end justify-between px-6 pb-2 border-b border-l border-slate-300 dark:border-zinc-700 relative mt-4">
                {/* Eixo Y */}
                <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-between text-[8px] text-slate-400 font-black">
                  <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
                </div>
                
                {/* Barras e Curvas */}
                {stagesList.map((stageItem) => {
                  const stageId = stageItem.id;
                  const demandVal = curve[stageId];
                  const isActiveStage = activeStageKey === stageId;

                  return (
                    <div key={stageId} className="w-1/6 flex flex-col items-center justify-end h-full relative group">
                      <div className="w-4/5 h-full flex items-end justify-center relative">
                        {/* Barra Cinza de Demanda Teórica */}
                        <div 
                          className="w-full bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors h-full rounded-t relative flex items-start justify-center"
                          style={{ height: `${demandVal}%` }}
                        >
                          <span className="absolute -top-5 text-[9px] font-bold text-slate-500 dark:text-zinc-400">
                            {demandVal}%
                          </span>
                        </div>

                        {/* Barra Colorida do Status Real (Somente renderizado se for o estágio ativo atual) */}
                        {isActiveStage && (
                          <div 
                            className={`w-3/5 ${actualBarColor} absolute bottom-0 z-10 rounded-t opacity-90 transition-all ${actualBarBorder}`}
                            style={{ height: `${Math.min(100, Math.max(5, demandVal * multiplier))}%` }}
                            title={`Status Medido: ${statusLabel}`}
                          />
                        )}
                      </div>

                      {/* Legenda de Estágio */}
                      <span className={`text-[10px] mt-2 font-black ${isActiveStage ? 'text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/10 px-2 py-0.5 rounded-full' : 'text-slate-500'}`}>
                        {stageItem.label}{isActiveStage ? ' (Coleta)' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legenda Visual */}
              <div className="flex flex-wrap justify-center items-center gap-6 text-[10px] font-bold text-slate-500 dark:text-zinc-400 mt-5 border-t border-slate-100 dark:border-zinc-800/80 pt-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-slate-200 dark:bg-zinc-800 rounded"></span>
                  <span>Demanda Teórica (Literatura Agronômica)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 ${actualBarColor} rounded`}></span>
                  <span>Absorção Real Registrada ({currentSample.phenologicalStage})</span>
                </div>
              </div>

              {/* Explicação e Interpretação Fisiológica */}
              <div className="mt-4 p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl text-xs space-y-2">
                <p className="font-bold text-slate-800 dark:text-zinc-200 leading-relaxed">
                  {curve.description}
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-900 flex items-start gap-2 text-slate-600 dark:text-zinc-400">
                  <span className="text-emerald-500 font-extrabold text-sm leading-none">ℹ</span>
                  <p>
                    {status === 'Muito Baixo' || status === 'Baixo' ? (
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        Atenção: O teor real medido de {nutrientName} ({measuredValue} {unit}) está abaixo do ideal para o estágio {currentSample.phenologicalStage}. Como indicado pela barra menor sobreposta, a taxa de absorção real está aquém da curva de desenvolvimento esperada para atingir o potencial produtivo pleno. Recomenda-se conferir as recomendações de manejo do solo/folha no painel de interpretação.
                      </span>
                    ) : status === 'Alto' || status === 'Muito Alto' ? (
                      <span className="text-purple-600 dark:text-purple-400 font-medium">
                        Atenção: O teor real medido de {nutrientName} ({measuredValue} {unit}) está acima do limite técnico superior para o estágio {currentSample.phenologicalStage}. Uma saturação elevada pode causar desequilíbrios osmóticos, queima foliar ou antagonismo competitivo com outros cátions no fluxo de absorção radicular.
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Excelente: O teor real medido de {nutrientName} ({measuredValue} {unit}) está perfeitamente alinhado com a curva teórica ideal. A planta apresenta nutrição equilibrada para suportar a demanda fisiológica atual sem limitações metabólicas.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}


      {/* ========================================================= */}
      {/* 7. BIBLIOTECA TÉCNICA E SINTOMAS                            */}
      {/* ========================================================= */}
      {activeTab === 'biblioteca' && (
        <div className="space-y-6 animate-fade-in bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
           <div className="border-b pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-base">Biblioteca Técnica & Sintomas de Deficiência</h3>
                <p className="text-xs text-slate-500">Mobilidade e interações fisiológicas (100% offline).</p>
              </div>
              <select 
                value={selectedNutrient}
                onChange={e => setSelectedNutrient(e.target.value)}
                className="bg-slate-50 dark:bg-zinc-900 border rounded-lg p-2 font-bold text-xs"
              >
                {NUTRIENT_LIBRARY.map(n => <option key={n.symbol} value={n.symbol}>{n.name} ({n.symbol})</option>)}
              </select>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
             <div className="bg-slate-50 dark:bg-zinc-900 p-4 rounded-xl border space-y-3">
                <strong className="block text-emerald-700 dark:text-emerald-500 font-black mb-2 uppercase text-xs">Fisiologia e Função</strong>
                <div><span className="text-[10px] font-bold text-slate-400 block uppercase">Classificação / Mobilidade</span><strong className="dark:text-white">{nutrientInfo.type} / {nutrientInfo.mobility}</strong></div>
                <div><span className="text-[10px] font-bold text-slate-400 block uppercase">Funções na Planta</span><p className="text-xs dark:text-zinc-300">{nutrientInfo.functions}</p></div>
                <div><span className="text-[10px] font-bold text-slate-400 block uppercase">Fase de Maior Demanda</span><p className="text-xs dark:text-zinc-300 font-bold">{nutrientInfo.peakDemandStage}</p></div>
                <div><span className="text-[10px] font-bold text-slate-400 block uppercase">Fontes Fertilizantes</span><p className="text-xs dark:text-zinc-300">{nutrientInfo.fertilizerSources}</p></div>
             </div>
             
             <div className="space-y-4">
               <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-200 dark:border-red-900 space-y-2">
                  <strong className="block text-red-800 dark:text-red-400 font-black uppercase text-xs">Sintomas de Deficiência</strong>
                  <p className="text-xs dark:text-red-300">{nutrientInfo.deficiencySymptoms}</p>
                  <span className="text-[10px] text-red-500 italic">*Como tem mobilidade {nutrientInfo.mobility}, os sintomas começam nas folhas {nutrientInfo.mobility === 'Alta' ? 'mais velhas (baixeiras)' : 'mais novas (ponteiro)'}.</span>
               </div>
               <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-200 dark:border-blue-900 space-y-2">
                  <strong className="block text-blue-800 dark:text-blue-400 font-black uppercase text-xs">Interações (Sinergismo/Antagonismo)</strong>
                  <p className="text-xs dark:text-blue-300">{nutrientInfo.interactions}</p>
               </div>
             </div>
           </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MÓDULO DE ENTRADA, EDIÇÃO E IMPORTAÇÃO EM LOTE DE AMOSTRAS */}
      {/* ========================================================= */}
      {activeTab === 'amostra' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header & Mode Switcher */}
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-900 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>Cadastro & Entrada de Amostras Foliariares</span>
                  </h3>
                  <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                    <WifiOff className="w-3 h-3 text-emerald-600" />
                    <span>Offline Rules Engine (Sem Internet)</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Adicione resultados de análises de folha manualmente ou importe em lote via planilha (CSV/Excel).
                </p>
              </div>

              {/* Botões de Ação Rápida */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadFoliarCsvTemplate()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Baixar modelo em CSV para preenchimento no Excel"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Modelo Planilha (.csv)</span>
                </button>
              </div>
            </div>

            {/* Selector das Sub-Abas do Cadastro: Manual, Importação, Lista */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setSampleTabMode('manual');
                    resetForm();
                  }}
                  className={`px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    sampleTabMode === 'manual'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adição Manual</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSampleTabMode('ocr');
                    setOcrError(null);
                    setOcrSuccessMsg(null);
                    setOcrImagePreview(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    sampleTabMode === 'ocr'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Importar por Foto / PDF (IA)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSampleTabMode('import')}
                  className={`px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    sampleTabMode === 'import'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Importação em Lote (Planilha)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSampleTabMode('list')}
                  className={`px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    sampleTabMode === 'list'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Amostras Cadastradas ({samples.length})</span>
                </button>
              </div>

              {/* Mensagem de Sucesso */}
              {sampleSuccessMsg && (
                <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{sampleSuccessMsg}</span>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* MODO 1: ADIÇÃO / EDIÇÃO MANUAL                             */}
          {/* ========================================================= */}
          {sampleTabMode === 'manual' && (
            <form onSubmit={handleSaveManualSample} className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-900 pb-3">
                <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit className="w-4 h-4 text-emerald-600" />
                  <span>{editingSampleId ? 'Editar Amostra Foliar' : 'Lançamento Manual de Nova Amostra'}</span>
                </h4>
                {editingSampleId && (
                  <button
                    type="button"
                    onClick={() => resetForm()}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-zinc-200 underline cursor-pointer"
                  >
                    Cancelar edição e criar nova
                  </button>
                )}
              </div>

              {ocrExtractedData && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl flex items-start justify-between gap-3 text-xs text-amber-900 dark:text-amber-300 animate-fade-in">
                  <div className="flex gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Valores Preenchidos por Inteligência Artificial (OCR)!</span>
                      <p className="mt-1">
                        A IA do Nema extraiu os teores nutricionais do documento <strong className="font-semibold text-slate-900 dark:text-white">"{ocrExtractedData.fileName || ocrExtractedData.labName || 'Laudo Importado'}"</strong>. 
                        Por favor, confira os teores e informações abaixo com cuidado. Corrija qualquer discrepância do laudo físico e clique em <strong className="font-semibold">Salvar</strong> no final da página para registrar a amostra.
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setOcrExtractedData(null)}
                    className="p-1 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Identificação da Amostra */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider block border-l-4 border-emerald-500 pl-2">
                  1. Dados Gerais da Coleta e Talhão
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                      Código da Amostra
                    </label>
                    <input
                      type="text"
                      value={formSampleCode}
                      onChange={e => setFormSampleCode(e.target.value)}
                      placeholder="Ex: AF-2026-003"
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                      Data da Coleta
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={e => setFormDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                      Talhão / Área
                    </label>
                    <select
                      value={formFieldId}
                      onChange={e => setFormFieldId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    >
                      {farm?.plots && farm.plots.length > 0 ? (
                        farm.plots.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.areaHa} ha - {p.currentCrop})</option>
                        ))
                      ) : (
                        [
                          <option key="talhao-01" value="talhao-01">Talhão 01 - Sede (45 ha)</option>,
                          <option key="talhao-02" value="talhao-02">Talhão 02 - Pivô Central (60 ha)</option>,
                          <option key="talhao-03" value="talhao-03">Talhão 03 - Baixada (38 ha)</option>,
                          <option key="talhao-04" value="talhao-04">Talhão 04 - Morro (52 ha)</option>
                        ]
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                      Cultura Agrícola
                    </label>
                    <select
                      value={formCrop}
                      onChange={e => setFormCrop(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Soja">Soja</option>
                      <option value="Milho">Milho</option>
                      <option value="Café">Café</option>
                      <option value="Algodão">Algodão</option>
                      <option value="Feijão">Feijão</option>
                      <option value="Trigo">Trigo</option>
                      <option value="Citros">Citros</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                      Cultivar / Híbrido
                    </label>
                    <input
                      type="text"
                      value={formCultivar}
                      onChange={e => setFormCultivar(e.target.value)}
                      placeholder="Ex: TMG 7062 IPRO, DKB 360"
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                      Estágio Fenológico
                    </label>
                    <input
                      type="text"
                      value={formStage}
                      onChange={e => setFormStage(e.target.value)}
                      placeholder="Ex: R1 - Início do Florescimento"
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                      Órgão Coletado
                    </label>
                    <select
                      value={formOrgan}
                      onChange={e => setFormOrgan(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Folha">Folha (Terço superior / 3ª folha)</option>
                      <option value="Pecíolo">Pecíolo</option>
                      <option value="Folha Índice">Folha Índice Oficial</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                      Responsável Técnico
                    </label>
                    <input
                      type="text"
                      value={formResponsible}
                      onChange={e => setFormResponsible(e.target.value)}
                      placeholder="Eng. Agrônomo"
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Teores Laboratoriais - Macronutrientes */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider block border-l-4 border-emerald-500 pl-2">
                    2. Teores de Macronutrientes (em g/kg de matéria seca)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Validação Agronômica Instantânea Offline
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {[
                    { symbol: 'N', name: 'Nitrogênio', val: formN, setFn: setFormN },
                    { symbol: 'P', name: 'Fósforo', val: formP, setFn: setFormP },
                    { symbol: 'K', name: 'Potássio', val: formK, setFn: setFormK },
                    { symbol: 'Ca', name: 'Cálcio', val: formCa, setFn: setFormCa },
                    { symbol: 'Mg', name: 'Magnésio', val: formMg, setFn: setFormMg },
                    { symbol: 'S', name: 'Enxofre', val: formS, setFn: setFormS },
                  ].map((m) => {
                    const status = interpretNutrient(m.val, m.symbol, 'macros', formCrop, formStage);
                    return (
                      <div key={m.symbol} className="p-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <strong className="font-extrabold text-slate-900 dark:text-white">{m.symbol} ({m.name})</strong>
                          <span className="text-[10px] text-slate-500 font-mono">g/kg</span>
                        </div>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={m.val}
                          onChange={e => m.setFn(parseFloat(e.target.value) || 0)}
                          className="w-full p-2 bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                        />
                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold border text-center ${getClassColor(status)}`}>
                          {getDot(status)} {status}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Teores Laboratoriais - Micronutrientes */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-900">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider block border-l-4 border-emerald-500 pl-2">
                  3. Teores de Micronutrientes (em mg/kg ou ppm de matéria seca)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {[
                    { symbol: 'B', name: 'Boro', val: formB, setFn: setFormB },
                    { symbol: 'Zn', name: 'Zinco', val: formZn, setFn: setFormZn },
                    { symbol: 'Fe', name: 'Ferro', val: formFe, setFn: setFormFe },
                    { symbol: 'Mn', name: 'Manganês', val: formMn, setFn: setFormMn },
                    { symbol: 'Cu', name: 'Cobre', val: formCu, setFn: setFormCu },
                    { symbol: 'Mo', name: 'Molibdênio', val: formMo, setFn: setFormMo },
                  ].map((m) => {
                    const status = interpretNutrient(m.val, m.symbol, 'micros', formCrop, formStage);
                    return (
                      <div key={m.symbol} className="p-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <strong className="font-extrabold text-slate-900 dark:text-white">{m.symbol} ({m.name})</strong>
                          <span className="text-[10px] text-slate-500 font-mono">mg/kg</span>
                        </div>
                        <input
                          type="number"
                          step={m.symbol === 'Mo' ? "0.01" : "0.1"}
                          min="0"
                          value={m.val}
                          onChange={e => m.setFn(parseFloat(e.target.value) || 0)}
                          className="w-full p-2 bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                        />
                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold border text-center ${getClassColor(status)}`}>
                          {getDot(status)} {status}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Botão de Salvar */}
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-900 flex justify-end gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer text-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingSampleId ? 'Salvar Alterações da Amostra' : 'Salvar Amostra Foliar e Executar Diagnose'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ========================================================= */}
          {/* MODO EXTRA: IMPORTAÇÃO POR FOTO / PDF VIA IA OCR         */}
          {/* ========================================================= */}
          {sampleTabMode === 'ocr' && (
            <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 dark:border-zinc-900 pb-4">
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Leitura Inteligente de Laudos por IA (Foto / PDF)</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Envie uma foto legível ou arquivo PDF do seu laudo laboratorial de análise foliar.
                  Nossa inteligência artificial identificará a cultura, dados de campo e preencherá automaticamente todos os teores nutricionais para validação rápida.
                </p>
              </div>

              {ocrError && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Falha no processamento:</span> {ocrError}
                    <p className="mt-1 text-[10px] opacity-80">
                      Verifique se a imagem está nítida e bem iluminada. O sistema continuará funcionando no modo manual se preferir digitar.
                    </p>
                  </div>
                </div>
              )}

              {/* Loader de Progresso */}
              {ocrLoading ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50/50 dark:bg-zinc-900/20 space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                    <Sparkles className="w-5 h-5 text-amber-400 animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">Processando documento...</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">{ocrLoadingStep}</p>
                  </div>
                  <div className="w-full max-w-xs bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Upload box */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        processOcrFile(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => {
                      const input = document.getElementById('ocr-file-input');
                      input?.click();
                    }}
                    className="border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-10 text-center cursor-pointer bg-slate-50/50 dark:bg-zinc-900/50 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/10 transition-all flex flex-col items-center justify-center space-y-4 group min-h-[250px]"
                  >
                    <input
                      id="ocr-file-input"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleOcrFileChange}
                      className="hidden"
                    />
                    <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-slate-200 dark:border-zinc-800 group-hover:scale-105 transition-transform duration-300">
                      <Camera className="w-8 h-8 text-slate-500 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">Arraste a foto/laudo aqui ou clique para selecionar</p>
                      <p className="text-xs text-slate-400 mt-1">Formatos suportados: PNG, JPG, JPEG, PDF (Até 10MB)</p>
                    </div>
                    <div className="px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg text-[10px] text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 animate-bounce" />
                      <span>Processamento 100% off-line integrado com o modelo de fallback</span>
                    </div>
                  </div>

                  {/* Instruções de Captura */}
                  <div className="bg-slate-50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-900 rounded-2xl p-6 flex flex-col justify-between space-y-4">
                    <div>
                      <h5 className="text-xs font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider mb-3">Como garantir a leitura perfeita:</h5>
                      <ul className="space-y-3 text-xs text-slate-600 dark:text-zinc-400">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span><strong className="text-slate-800 dark:text-zinc-200">Enquadramento Total:</strong> Capture todo o papel, certificando-se de que os números da tabela de resultados estão visíveis.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span><strong className="text-slate-800 dark:text-zinc-200">Boa Iluminação:</strong> Evite sombras sobre as tabelas e garanta que o texto não esteja borrado.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span><strong className="text-slate-800 dark:text-zinc-200">Orientação Correta:</strong> Certifique-se de que a imagem não está de ponta-cabeça ou rotacionada.</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/60 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                      <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Fluxo de Correção Ativo</p>
                        <p className="text-[10px] opacity-90 mt-0.5">Após o processamento, o sistema preencherá o formulário manual. Você poderá conferir cada valor e corrigi-los caso identifique qualquer divergência física.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* MODO 2: IMPORTAÇÃO EM LOTE POR PLANILHA (CSV / COPIAR-COLAR) */}
          {/* ========================================================= */}
          {sampleTabMode === 'import' && (
            <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-900 pb-4">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    <span>Importação em Lote por Planilha (CSV / Copiar-Colar)</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                    Faça upload do arquivo CSV ou cole a tabela copiada diretamente do Excel / Google Sheets.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => downloadFoliarCsvTemplate()}
                  className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs font-bold hover:bg-emerald-100 cursor-pointer flex items-center gap-1.5 self-start"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Planilha Modelo (.csv)</span>
                </button>
              </div>

              {/* Area Drag & Drop */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'border-slate-300 dark:border-zinc-700 hover:border-emerald-500 bg-slate-50/50 dark:bg-zinc-900/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h5 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                  Arraste seu arquivo CSV aqui ou clique para selecionar
                </h5>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
                  Suporta arquivos CSV delimitados por ponto e vírgula (;), vírgula (,) ou tabulação.
                </p>
              </div>

              {/* Area de Copiar e Colar Tabela */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200">
                  Ou Cole a Tabela Copiada do Excel / Google Sheets:
                </label>
                <textarea
                  rows={5}
                  value={csvText}
                  onChange={e => {
                    setCsvText(e.target.value);
                    if (e.target.value.trim().length > 10) {
                      parseFoliarCsv(e.target.value);
                    }
                  }}
                  placeholder="Codigo;Data;Talhao;Cultura;Cultivar;Estagio;Responsavel;N;P;K;Ca;Mg;S;B;Zn;Fe;Mn;Cu;Mo&#10;AF-2026-020;2026-02-18;talhao-01;Soja;TMG 7062 IPRO;R1;Dr. Roberto;42.5;3.2;18.0;12.5;4.8;2.8;38.0;28.0;115.0;65.0;9.5;0.45"
                  className="w-full p-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-slate-900 dark:text-zinc-200 focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>Cole diretamente a seleção de células da sua planilha.</span>
                  <button
                    type="button"
                    onClick={() => parseFoliarCsv(csvText)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold cursor-pointer"
                  >
                    Processar Tabela
                  </button>
                </div>
              </div>

              {/* Resultado da Importação */}
              {importResult && (
                <div className="space-y-4 border-t border-slate-100 dark:border-zinc-800 pt-4 animate-fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <strong className="text-slate-800 dark:text-zinc-200">Resultado da Validação:</strong>
                      <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-full border border-emerald-300 dark:border-emerald-800">
                        {(importResult?.validSamples || []).length} Válidas
                      </span>
                      {(importResult?.errors || []).length > 0 && (
                        <span className="px-2.5 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-xs font-bold rounded-full border border-rose-300 dark:border-rose-800">
                          {importResult?.errors?.length} Erros
                        </span>
                      )}
                      {(importResult?.warnings || []).length > 0 && (
                        <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-full border border-amber-300 dark:border-amber-800">
                          {importResult?.warnings?.length} Alertas
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={(importResult?.validSamples || []).length === 0}
                      onClick={handleConfirmImport}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirmar e Salvar {(importResult?.validSamples || []).length} Amostras</span>
                    </button>
                  </div>

                  {(importResult?.validSamples || []).length > 0 && (
                    <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 font-bold text-slate-700 dark:text-zinc-300">
                          <tr>
                            <th className="p-2.5">Código</th>
                            <th className="p-2.5">Data</th>
                            <th className="p-2.5">Talhão</th>
                            <th className="p-2.5">Cultura</th>
                            <th className="p-2.5">N</th>
                            <th className="p-2.5">P</th>
                            <th className="p-2.5">K</th>
                            <th className="p-2.5">B</th>
                            <th className="p-2.5">Zn</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium text-slate-800 dark:text-zinc-200">
                          {importResult.validSamples.map((s, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                              <td className="p-2.5 font-bold font-mono">{s.sampleCode}</td>
                              <td className="p-2.5">{s.date}</td>
                              <td className="p-2.5">{s.fieldId}</td>
                              <td className="p-2.5">{s.crop} ({s.cultivar})</td>
              <td className="p-2.5 font-bold">{s.results?.N ?? 0} g/kg</td>
              <td className="p-2.5">{s.results?.P ?? 0} g/kg</td>
              <td className="p-2.5 font-bold">{s.results?.K ?? 0} g/kg</td>
              <td className="p-2.5">{s.results?.B ?? 0} mg/kg</td>
              <td className="p-2.5">{s.results?.Zn ?? 0} mg/kg</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {importResult.errors.length > 0 && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs space-y-1">
                      <strong className="text-rose-800 dark:text-rose-300 flex items-center gap-1">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        Inconsistências encontradas:
                      </strong>
                      <ul className="list-disc list-inside text-rose-700 dark:text-rose-300/90 space-y-0.5">
                        {importResult.errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* MODO 3: GERENCIADOR E LISTA DE AMOSTRAS CADASTRADAS         */}
          {/* ========================================================= */}
          {sampleTabMode === 'list' && (
            <div className="space-y-4">
              {/* Filtros da Lista */}
              <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={sampleSearchFilter}
                      onChange={e => setSampleSearchFilter(e.target.value)}
                      placeholder="Buscar por código, cultura, cultivar..."
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>

                  <select
                    value={samplePlotFilter}
                    onChange={e => setSamplePlotFilter(e.target.value)}
                    className="p-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    <option value="all">Todos os Talhões</option>
                    {farm?.plots?.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="text-slate-500 font-medium self-end sm:self-center">
                  Total de <strong className="text-slate-900 dark:text-white">{samples.length}</strong> amostras ativas
                </div>
              </div>

              {/* Grid de Amostras */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {normalizedSamples
                  .filter(s => {
                    const matchSearch = (s.sampleCode + s.crop + (s.cultivar || '') + s.fieldId + (s.responsible || '')).toLowerCase().includes(sampleSearchFilter.toLowerCase());
                    const matchPlot = samplePlotFilter === 'all' || s.fieldId === samplePlotFilter;
                    return matchSearch && matchPlot;
                  })
                  .map(sample => {
                    const isSelected = sample.id === selectedSampleId;
                    return (
                      <div
                        key={sample.id}
                        className={`p-5 rounded-2xl border transition-all space-y-4 ${
                          isSelected
                            ? 'bg-emerald-500/5 border-emerald-500 dark:border-emerald-500/80 shadow-sm'
                            : 'bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        {/* Card Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black font-mono text-sm ${
                              isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200'
                            }`}>
                              AF
                            </div>
                            <div>
                              <h5 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                <span>{sample.sampleCode}</span>
                                {isSelected && (
                                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded-full">
                                    Ativa
                                  </span>
                                )}
                              </h5>
                              <p className="text-xs text-slate-500">
                                {sample.crop} ({sample.cultivar || 'Sem cultivar'}) • {sample.date}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSampleId(sample.id);
                                setActiveTab('dashboard');
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                            >
                              Ver Diagnose
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                resetForm(sample);
                                setSampleTabMode('manual');
                              }}
                              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
                              title="Editar Amostra"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSample(sample.id)}
                              className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl cursor-pointer"
                              title="Excluir Amostra"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Metadados & Resumo do Teores */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 bg-slate-50 dark:bg-zinc-900 rounded-xl space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Talhão / Estágio</span>
                            <span className="font-bold text-slate-800 dark:text-zinc-200 block">{sample.fieldId}</span>
                            <span className="text-[11px] text-slate-500 block">{sample.phenologicalStage}</span>
                          </div>

                          <div className="p-2.5 bg-slate-50 dark:bg-zinc-900 rounded-xl space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Macros N - P - K</span>
                            <span className="font-extrabold text-slate-900 dark:text-white block font-mono">
              {sample.results?.N ?? 0} | {sample.results?.P ?? 0} | {sample.results?.K ?? 0} g/kg
                            </span>
                          </div>
                        </div>

                        {/* Badges dos Teores */}
                        <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                          {['N', 'P', 'K', 'Ca', 'Mg', 'S', 'B', 'Zn'].map(sym => {
                            const val = sample?.results ? (sample.results as any)[sym] ?? 0 : 0;
                            const type = ['B', 'Zn'].includes(sym) ? 'micros' : 'macros';
                            const status = interpretNutrient(val, sym, type as any, sample.crop, sample.phenologicalStage);
                            return (
                              <span key={sym} className={`px-2 py-0.5 rounded font-bold border ${getClassColor(status)}`}>
                                {sym}: {val} ({status})
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* HISTÓRICO DE ANÁLISES FOLIARES (Módulo Interativo)        */}
      {/* ========================================================= */}
      {activeTab === 'historico' && (() => {
        const uniquePlots = Array.from(new Set(normalizedSamples.map(s => s.fieldId || s.plotId).filter(Boolean)));
        const uniqueCrops = Array.from(new Set(normalizedSamples.map(s => s.crop).filter(Boolean)));
        
        const filteredHistorySamples = normalizedSamples
          .filter(s => historyPlotFilter === 'all' || s.fieldId === historyPlotFilter || s.plotId === historyPlotFilter)
          .filter(s => historyCropFilter === 'all' || s.crop === historyCropFilter)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const isMacro = ['N', 'P', 'K', 'Ca', 'Mg', 'S'].includes(historyNutrient);
        const unit = isMacro ? 'g/kg' : 'mg/kg';

        const chartDataWithRanges = filteredHistorySamples.map(s => {
          const val = Number(s.results?.[historyNutrient as keyof LeafLabResults] ?? 0);
          const normCrop = getNormalizedCrop(s.crop);
          
          // Encontrar o intervalo de suficiência foliar correspondente
          const matchingRange = FOLIAR_SUFFICIENCY_RANGES.find(r => 
            getNormalizedCrop(r.crop) === normCrop
          );
          
          let minAdequate = 0;
          let maxAdequate = 0;
          if (matchingRange) {
            const group = isMacro ? matchingRange.macros : matchingRange.micros;
            const nutRange = (group as any)[historyNutrient];
            if (nutRange) {
              minAdequate = nutRange.minAdequate;
              maxAdequate = nutRange.maxAdequate;
            }
          }

          return {
            date: s.date,
            label: s.sampleCode,
            stage: s.phenologicalStage,
            valor: val,
            'Mínimo Ideal': minAdequate || undefined,
            'Máximo Ideal': maxAdequate || undefined,
          };
        });

        const activeNutrientName = NUTRIENT_LIBRARY.find(n => n.symbol === historyNutrient)?.name || historyNutrient;

        return (
          <div className="space-y-6 animate-fade-in bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h3 className="font-black text-base flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-600" />
                  Histórico de Análises Foliares
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Acompanhe a evolução nutricional dos seus talhões, compare diferentes safras e analise as curvas de tendência de nutrientes.
                </p>
              </div>

              {/* Controles de Filtros e Seleção rápidos */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Filtro Talhão */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Talhão</label>
                  <select
                    value={historyPlotFilter}
                    onChange={e => setHistoryPlotFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 font-bold text-xs cursor-pointer text-slate-800 dark:text-zinc-100"
                  >
                    <option value="all">Todos os Talhões</option>
                    {uniquePlots.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro Cultura */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Cultura</label>
                  <select
                    value={historyCropFilter}
                    onChange={e => setHistoryCropFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 font-bold text-xs cursor-pointer text-slate-800 dark:text-zinc-100"
                  >
                    <option value="all">Todas as Culturas</option>
                    {uniqueCrops.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Seletor Nutriente do Gráfico */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nutriente Alvo</label>
                  <select
                    value={historyNutrient}
                    onChange={e => setHistoryNutrient(e.target.value)}
                    className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 font-bold text-xs cursor-pointer text-slate-800 dark:text-zinc-100"
                  >
                    {NUTRIENT_LIBRARY.map(n => (
                      <option key={n.symbol} value={n.symbol}>
                        {n.name} ({n.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Gráfico de Evolução com Área de Suficiência */}
            {filteredHistorySamples.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900/50 text-slate-500">
                <Info className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p className="text-xs font-bold">Nenhuma amostra encontrada para os filtros aplicados.</p>
                <button
                  onClick={() => {
                    setHistoryPlotFilter('all');
                    setHistoryCropFilter('all');
                  }}
                  className="mt-2 text-xs text-emerald-600 font-bold hover:underline"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              <>
                <div className="p-4 border rounded-2xl bg-slate-50/50 dark:bg-zinc-900/30">
                  <div className="mb-4">
                    <h4 className="text-sm font-black text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      Evolução de {activeNutrientName} ({historyNutrient}) ao Longo do Tempo
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      As linhas pontilhadas de referência indicam a faixa de suficiência ideal da literatura.
                    </p>
                  </div>

                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartDataWithRanges}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" className="hidden dark:block" />
                        <XAxis 
                          dataKey="label" 
                          stroke="#94a3b8" 
                          fontSize={11} 
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="#94a3b8" 
                          fontSize={11} 
                          tickLine={false}
                          axisLine={false}
                          label={{ value: unit, angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontSize: '10px', fontWeight: 'bold' } }}
                        />
                        <RechartsTooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(30, 41, 59, 0.95)',
                            borderColor: '#334155',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '11px',
                          }}
                        />
                        <RechartsLegend verticalAlign="top" height={36} iconType="circle" />
                        
                        {/* Linha de Teor Real */}
                        <Line 
                          type="monotone" 
                          dataKey="valor" 
                          name={`Teor Medido (${unit})`}
                          stroke="#10b981" 
                          strokeWidth={3} 
                          dot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
                          activeDot={{ r: 7 }}
                        />

                        {/* Linha de Referência Mínima */}
                        <Line 
                          type="monotone" 
                          dataKey="Mínimo Ideal" 
                          stroke="#f59e0b" 
                          strokeWidth={1.5} 
                          strokeDasharray="5 5"
                          dot={false}
                        />

                        {/* Linha de Referência Máxima */}
                        <Line 
                          type="monotone" 
                          dataKey="Máximo Ideal" 
                          stroke="#ef4444" 
                          strokeWidth={1.5} 
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tabela de Comparação Completa */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    Tabela Comparativa de Teores Nutritivos
                  </h4>
                  <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 text-slate-500 font-bold uppercase text-[10px]">
                          <th className="p-3">Amostra</th>
                          <th className="p-3">Data</th>
                          <th className="p-3">Talhão</th>
                          <th className="p-3">Estágio</th>
                          <th className="p-3">Cultura</th>
                          <th className="p-3">{historyNutrient} ({unit})</th>
                          <th className="p-3">Status {historyNutrient}</th>
                          <th className="p-3">Macros Principais N-P-K (g/kg)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
                        {filteredHistorySamples.map((sample) => {
                          const val = Number(sample.results?.[historyNutrient as keyof LeafLabResults] ?? 0);
                          const type = isMacro ? 'macros' : 'micros';
                          const status = interpretNutrient(val, historyNutrient, type, sample.crop, sample.phenologicalStage);
                          const isCurrent = sample.id === selectedSampleId;

                          return (
                            <tr 
                              key={sample.id} 
                              className={`hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-colors ${
                                isCurrent ? 'bg-emerald-500/5 dark:bg-emerald-500/2 shadow-xs' : ''
                              }`}
                            >
                              <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{sample.sampleCode}</span>
                                {isCurrent && (
                                  <span className="px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] rounded font-bold">Ativa</span>
                                )}
                              </td>
                              <td className="p-3 text-slate-500">{sample.date}</td>
                              <td className="p-3 font-bold text-slate-700 dark:text-zinc-300">{sample.fieldId}</td>
                              <td className="p-3 text-slate-500">{sample.phenologicalStage}</td>
                              <td className="p-3 text-slate-600 dark:text-zinc-400">{sample.crop} {sample.cultivar ? `(${sample.cultivar})` : ''}</td>
                              <td className="p-3 font-mono font-bold text-slate-800 dark:text-zinc-200">{val}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded font-black border text-[10px] ${getClassColor(status)}`}>
                                  {status}
                                </span>
                              </td>
                              <td className="p-3 font-mono text-slate-600 dark:text-zinc-400 font-bold">
              N:{sample.results?.N ?? 0} | P:{sample.results?.P ?? 0} | K:{sample.results?.K ?? 0}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })()}

      {/* ========================================================= */}
      {/* 8. MAPA NUTRICIONAL GEORREFERENCIADO & PRESCRIÇÃO VRA     */}
      {/* ========================================================= */}
      {activeTab === 'mapa' && (() => {
        const plotGeo = calculatePlotGeometry(plotVertices);

        const mapSamplesList = mapFieldId === 'all'
          ? samples
          : samples.filter(s => s.fieldId === mapFieldId || s.farmId === mapFieldId);

        const getCoords = (s: LeafSample, idx: number) => {
          const defaultCoords: Record<string, { lat: number; lng: number }> = {
            'sample-001': { lat: -12.5532, lng: -55.7214 },
            'sample-002': { lat: -12.5518, lng: -55.7198 },
            'sample-003': { lat: -12.5545, lng: -55.7182 },
            'sample-004': { lat: -12.5570, lng: -55.7225 },
            'sample-005': { lat: -12.5582, lng: -55.7190 },
            'sample-006': { lat: -12.5480, lng: -55.7250 },
            'sample-007': { lat: -12.5610, lng: -55.7140 }
          };
          const latLng = defaultCoords[s.id] || {
            lat: plotGeo.centroid.lat + (((idx * 37) % 7) - 3) * 0.0018,
            lng: plotGeo.centroid.lng + (((idx * 29) % 7) - 3) * 0.0022,
          };

          const proj = getPointCoordsFromBounds(latLng.lat, latLng.lng, plotGeo.bounds);
          return { x: proj.x, y: proj.y, lat: latLng.lat, lng: latLng.lng };
        };

        const evaluatedPoints = mapSamplesList.map((s, idx) => {
          const coords = getCoords(s, idx);
          let rawVal = 0;
          let status: NutrientClass = 'Adequado';

          if (mapNutrient === 'IBN_DRIS') {
            const dris = calculateDRIS(s);
            rawVal = dris ? dris.IBN : 0;
            status = rawVal < 15 ? 'Adequado' : rawVal < 30 ? 'Baixo' : 'Muito Baixo';
          } else {
            rawVal = s?.results ? (s.results as any)[mapNutrient] ?? 0 : 0;
            const isMacro = ['N','P','K','Ca','Mg','S'].includes(mapNutrient);
            status = interpretNutrient(rawVal, mapNutrient, isMacro ? 'macros' : 'micros', s.crop, s.phenologicalStage);
          }

          const getColor = (c: NutrientClass) => {
            switch(c) {
              case 'Muito Baixo': return { bg: 'bg-red-500', hex: '#ef4444', text: 'text-red-500', border: 'border-red-500', label: 'Muito Baixo' };
              case 'Baixo': return { bg: 'bg-amber-500', hex: '#f59e0b', text: 'text-amber-500', border: 'border-amber-500', label: 'Baixo' };
              case 'Adequado': return { bg: 'bg-emerald-500', hex: '#10b981', text: 'text-emerald-500', border: 'border-emerald-500', label: 'Adequado' };
              case 'Alto': return { bg: 'bg-blue-500', hex: '#3b82f6', text: 'text-blue-500', border: 'border-blue-500', label: 'Alto' };
              case 'Muito Alto': return { bg: 'bg-purple-500', hex: '#a855f7', text: 'text-purple-500', border: 'border-purple-500', label: 'Muito Alto' };
              default: return { bg: 'bg-slate-500', hex: '#64748b', text: 'text-slate-500', border: 'border-slate-500', label: 'Indefinido' };
            }
          };

          return {
            sample: s,
            coords,
            value: rawVal,
            status,
            color: getColor(status)
          };
        });

        const totalPoints = evaluatedPoints.length;
        const valuesArr = evaluatedPoints.map(p => p.value);
        const avgVal = totalPoints > 0 ? (valuesArr.reduce((a,b)=>a+b, 0) / totalPoints) : 0;
        const variance = totalPoints > 1 ? (valuesArr.reduce((a,b)=>a + Math.pow(b - avgVal, 2), 0) / (totalPoints - 1)) : 0;
        const stdDev = Math.sqrt(variance);
        const cvPercent = avgVal > 0 ? ((stdDev / avgVal) * 100) : 0;

        const countDeficient = evaluatedPoints.filter(p => p.status === 'Muito Baixo' || p.status === 'Baixo').length;
        const countAdequate = evaluatedPoints.filter(p => p.status === 'Adequado').length;
        const countExcess = evaluatedPoints.filter(p => p.status === 'Alto' || p.status === 'Muito Alto').length;

        const pctDeficient = totalPoints > 0 ? Math.round((countDeficient / totalPoints) * 100) : 0;
        const pctAdequate = totalPoints > 0 ? Math.round((countAdequate / totalPoints) * 100) : 0;
        const pctExcess = totalPoints > 0 ? Math.round((countExcess / totalPoints) * 100) : 0;

        const selectedPointObj = evaluatedPoints.find(p => p.sample.id === selectedMapPointId) || evaluatedPoints[0];

        const nutrientUnit = ['N','P','K','Ca','Mg','S'].includes(mapNutrient) ? 'g/kg' : mapNutrient === 'IBN_DRIS' ? 'Índice' : 'mg/kg (ppm)';

        return (
          <div className="space-y-6 animate-fade-in">
            {/* Cabeçalho do Mapa Nutricional */}
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Geoprocessamento Foliar & GIS
                  </span>
                  <span className="text-xs font-semibold text-slate-400">• VRA Prescriptions</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  Mapa de Variabilidade Espacial Nutricional
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-3xl">
                  Mapeamento georreferenciado da nutrição foliar por talhão, permitindo identificação de manchas de deficiência e prescrição para aplicação em taxa variável.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowDrawPlotModal(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Desenhar Talhão (Coordenadas GPS)</span>
                </button>

                <button
                  onClick={() => setShowVraModal(true)}
                  className="px-3.5 py-2 bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>Prescrição VRA (Taxa Variável)</span>
                </button>

                <button
                  onClick={() => setShowAddPointModal(true)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Ponto GPS</span>
                </button>
              </div>
            </div>

            {/* Barra de Seleção de Nutrientes & Filtros */}
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nutriente ou Índice Mapeado:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['N', 'P', 'K', 'Ca', 'Mg', 'S', 'B', 'Zn', 'Cu', 'Fe', 'Mn', 'IBN_DRIS'].map(nut => (
                      <button
                        key={nut}
                        onClick={() => setMapNutrient(nut)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          mapNutrient === nut
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {nut === 'IBN_DRIS' ? 'IBN DRIS (Balanço)' : nut}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Filtrar por Talhão:</span>
                    <select
                      value={mapFieldId}
                      onChange={e => setMapFieldId(e.target.value)}
                      className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="all">Todos os Talhões ({samples.length} pontos)</option>
                      <option value="talhao-01">Talhão 01 - Pivô Central</option>
                      <option value="talhao-02">Talhão 02 - Gleba Norte</option>
                      <option value="talhao-03">Talhão 03 - Coxilha</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Modo de Exibição:</span>
                    <div className="flex items-center p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
                      <button
                        onClick={() => setMapViewMode('points')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          mapViewMode === 'points' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        <Target className="w-3.5 h-3.5" />
                        <span>Pontos</span>
                      </button>
                      <button
                        onClick={() => setMapViewMode('heatmap')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          mapViewMode === 'heatmap' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Heatmap</span>
                      </button>
                      <button
                        onClick={() => setMapViewMode('zones')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          mapViewMode === 'zones' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Zonas VRA</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* KPIs da Variabilidade Espacial */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
                <span className="text-xs font-bold text-slate-400 block mb-1">Pontos Amostrados</span>
                <strong className="text-2xl font-black text-slate-900 dark:text-white">{totalPoints}</strong>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                  1 ponto a cada ~5.2 ha
                </span>
              </div>

              <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
                <span className="text-xs font-bold text-slate-400 block mb-1">Média ({mapNutrient})</span>
                <strong className="text-2xl font-black text-slate-900 dark:text-white">
                  {avgVal.toFixed(1)} <span className="text-xs font-normal text-slate-500">{nutrientUnit}</span>
                </strong>
                <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">
                  Desvio Padrão: {stdDev.toFixed(2)}
                </span>
              </div>

              <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
                <span className="text-xs font-bold text-slate-400 block mb-1">Variabilidade (CV%)</span>
                <strong className={`text-2xl font-black ${cvPercent > 20 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {cvPercent.toFixed(1)}%
                </strong>
                <span className="text-[11px] font-semibold block mt-0.5 text-slate-500">
                  {cvPercent < 10 ? 'Baixa Variabilidade' : cvPercent < 20 ? 'Média Variabilidade' : 'Alta Variabilidade (Ideal p/ VRA)'}
                </span>
              </div>

              <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xs space-y-1.5">
                <span className="text-xs font-bold text-slate-400 block">Distribuição da Área</span>
                <div className="h-3 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                  <div style={{ width: `${pctDeficient}%` }} className="bg-red-500 h-full" title={`Deficiente: ${pctDeficient}%`} />
                  <div style={{ width: `${pctAdequate}%` }} className="bg-emerald-500 h-full" title={`Adequado: ${pctAdequate}%`} />
                  <div style={{ width: `${pctExcess}%` }} className="bg-purple-500 h-full" title={`Excesso: ${pctExcess}%`} />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span className="text-red-500">🔴 Def: {pctDeficient}%</span>
                  <span className="text-emerald-600">🟢 Idl: {pctAdequate}%</span>
                  <span className="text-purple-500">🟣 Exc: {pctExcess}%</span>
                </div>
              </div>
            </div>

            {/* CANVAS DO MAPA GIS INTERATIVO & PAINEL LATERAL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Canvas Principal do Mapa */}
              <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden min-h-[460px] flex flex-col justify-between">
                {/* Textura Geográfica de Fundo / Grade de Coordenadas */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

                {/* Contorno do Talhão por Coordenadas GPS (SVG Polígono GIS) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80" viewBox="0 0 1000 600">
                  <polygon
                    points={plotGeo.svgPolygonPoints}
                    fill="url(#fieldGradient)"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray="6,4"
                  />
                  <defs>
                    <linearGradient id="fieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#064e3b" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#022c22" stopOpacity="0.85" />
                    </linearGradient>
                  </defs>

                  {/* Renderização dos Vértices do Polígono no Mapa */}
                  {plotGeo.vertexSvgCoords.map(v => (
                    <g key={v.id}>
                      <circle cx={v.xPx} cy={v.yPx} r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                      <text x={v.xPx} y={v.yPx - 9} fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" className="drop-shadow-md">
                        {v.label}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* Camada Heatmap (se ativo) */}
                {mapViewMode === 'heatmap' && (
                  <div className="absolute inset-0 pointer-events-none opacity-60">
                    {evaluatedPoints.map(p => (
                      <div
                        key={`heat-${p.sample.id}`}
                        style={{
                          left: `${p.coords.x}%`,
                          top: `${p.coords.y}%`,
                          backgroundColor: p.color.hex,
                          transform: 'translate(-50%, -50%)'
                        }}
                        className="absolute w-44 h-44 rounded-full blur-2xl opacity-40"
                      />
                    ))}
                  </div>
                )}

                {/* Camada Zonas VRA (se ativo) */}
                {mapViewMode === 'zones' && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                    <div className="w-3/4 h-3/4 border-4 border-dashed border-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-yellow-400 font-extrabold text-xs tracking-widest uppercase bg-black/60 px-3 py-1 rounded-full">
                        Zona 1: Requer Aplicação VRA (+2.5 L/ha)
                      </span>
                    </div>
                  </div>
                )}

                {/* Cabeçalho de Controle sobre o Mapa com Vértices & Coordenadas */}
                <div className="relative z-10 flex flex-wrap items-center justify-between bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-white text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold">Talhão Desenhado por Coordenadas</span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      {plotGeo.areaHa} ha
                    </span>
                    <span className="text-slate-400 text-[11px] hidden sm:inline">• {plotVertices.length} Vértices GPS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-slate-300 font-mono text-[11px] hidden md:flex items-center gap-2">
                      <span>Lat: {plotGeo.centroid.lat}°</span>
                      <span>Long: {plotGeo.centroid.lng}°</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDrawPlotModal(true)}
                      className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold rounded-lg text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Editar Vértices</span>
                    </button>
                  </div>
                </div>

                {/* Pontos Georreferenciados Clicáveis */}
                <div className="relative z-10 flex-1 my-6 min-h-[300px]">
                  {evaluatedPoints.map(p => {
                    const isSelected = selectedMapPointId === p.sample.id;
                    return (
                      <div
                        key={p.sample.id}
                        style={{ left: `${p.coords.x}%`, top: `${p.coords.y}%` }}
                        onClick={() => setSelectedMapPointId(p.sample.id)}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                      >
                        {/* Pulso e Indicador do Ponto */}
                        <div className="relative flex items-center justify-center">
                          {isSelected && (
                            <span className="absolute w-12 h-12 rounded-full bg-white/30 animate-ping" />
                          )}
                          <div className={`w-8 h-8 rounded-full ${p.color.bg} text-white font-black text-[10px] flex items-center justify-center shadow-lg border-2 border-white dark:border-zinc-900 transition-transform hover:scale-125 ${isSelected ? 'scale-125 ring-4 ring-white/50' : ''}`}>
                            {p.value.toFixed(0)}
                          </div>
                        </div>

                        {/* Card Tooltip Hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                          <div className="bg-slate-900 text-white text-[10px] p-2 rounded-xl shadow-xl whitespace-nowrap border border-slate-700">
                            <strong className="block text-emerald-400 font-bold">{p.sample.sampleCode}</strong>
                            <span>{mapNutrient}: <strong>{p.value} {nutrientUnit}</strong> ({p.status})</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Rodapé do Mapa: Legenda e Escala */}
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-white text-xs">
                  <div className="flex items-center gap-3 text-[11px] font-bold">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /> Baixo/Deficiente</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500" /> Moderado</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Adequado</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-500" /> Alto/Excesso</span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-400 text-[11px] font-mono">
                    <span>Escala: 0 ---- 500m</span>
                    <span className="text-emerald-400 font-bold">N ⬆</span>
                  </div>
                </div>
              </div>

              {/* Painel Lateral: Inspeção do Ponto Selecionado */}
              <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider block">Ponto Georreferenciado</span>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">
                      {selectedPointObj?.sample.sampleCode || 'Amostra'}
                    </h4>
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase ${selectedPointObj?.color.bg} text-white`}>
                    {selectedPointObj?.status}
                  </span>
                </div>

                {selectedPointObj && (
                  <div className="space-y-4 text-xs">
                    {/* Dados de Campo */}
                    <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200/60 dark:border-zinc-800">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Talhão</span>
                        <strong className="text-slate-800 dark:text-zinc-200">{selectedPointObj.sample.fieldId}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Cultura / Fase</span>
                        <strong className="text-slate-800 dark:text-zinc-200">{selectedPointObj.sample.crop} ({selectedPointObj.sample.phenologicalStage})</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Coordenadas GPS</span>
                        <strong className="font-mono text-slate-800 dark:text-zinc-200">{selectedPointObj.coords.lat}, {selectedPointObj.coords.lng}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Data de Coleta</span>
                        <strong className="text-slate-800 dark:text-zinc-200">{selectedPointObj.sample.date}</strong>
                      </div>
                    </div>

                    {/* Destaque do Nutriente Selecionado */}
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-900 dark:text-emerald-300 space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-xs">Teor de {mapNutrient}:</span>
                        <strong className="text-xl font-black">{selectedPointObj.value} {nutrientUnit}</strong>
                      </div>
                      <p className="text-[11px] opacity-80">
                        Classificação diagnóstica: <strong className="font-bold">{selectedPointObj.status}</strong> para a fase fenológica.
                      </p>
                    </div>

                    {/* Resumo de Todos os Nutrientes da Amostra */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Outros Nutrientes no Ponto:</span>
                      <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                        {Object.entries(selectedPointObj?.sample?.results || {}).map(([nKey, nVal]) => (
                          <div key={nKey} className="p-2 bg-slate-100 dark:bg-zinc-900 rounded-xl flex justify-between items-center">
                            <span className="font-bold text-slate-500">{nKey}:</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">{nVal}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ação rápida para carregar na plataforma */}
                    <button
                      onClick={() => setSelectedSampleId(selectedPointObj.sample.id)}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Definir como Amostra Ativa da Plataforma</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* MODAL / DRAWER DE PRESCRIÇÃO VRA */}
            {showVraModal && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
                  <button
                    onClick={() => setShowVraModal(false)}
                    className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-100 dark:bg-zinc-800 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
                      <Sliders className="w-4 h-4" />
                      <span>Prescrição de Adubação Foliar em Taxa Variável</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      Recomendação VRA - Talhão 01 (Soja R1)
                    </h3>
                  </div>

                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-emerald-700 dark:text-emerald-300 font-bold block">Economia Estimada de Insumos:</span>
                      <strong className="text-2xl font-black text-emerald-600 dark:text-emerald-400">-22.4% em R$ / ha</strong>
                    </div>
                    <span className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold">
                      Otimizado p/ Piloto Automático
                    </span>
                  </div>

                  {/* Tabela de Zonas de Manejo VRA */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 uppercase font-black">
                        <tr>
                          <th className="p-3 rounded-l-xl">Zona de Manejo</th>
                          <th className="p-3">Status Foliar</th>
                          <th className="p-3">Área (ha)</th>
                          <th className="p-3">Produto Recomendado</th>
                          <th className="p-3 rounded-r-xl">Dose VRA (L/ha)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                        <tr>
                          <td className="p-3 font-bold text-red-600 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500" /> Zona 1 (Deficiente)
                          </td>
                          <td className="p-3 font-semibold">Muito Baixo / Baixo</td>
                          <td className="p-3 font-mono font-bold">40.8 ha (28%)</td>
                          <td className="p-3 font-medium">Formulado N-K + Zinco Foliar</td>
                          <td className="p-3 font-mono font-black text-emerald-600">3.5 L/ha</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-amber-600 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-amber-500" /> Zona 2 (Moderada)
                          </td>
                          <td className="p-3 font-semibold">Baixo Limítrofe</td>
                          <td className="p-3 font-mono font-bold">32.0 ha (22%)</td>
                          <td className="p-3 font-medium">Formulado N-K Foliar</td>
                          <td className="p-3 font-mono font-black text-emerald-600">1.5 L/ha</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-emerald-600 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-500" /> Zona 3 (Adequada)
                          </td>
                          <td className="p-3 font-semibold">Adequado / Ideal</td>
                          <td className="p-3 font-mono font-bold">73.0 ha (50%)</td>
                          <td className="p-3 font-medium">Manutenção Fisiológica</td>
                          <td className="p-3 font-mono font-black text-emerald-600">0.5 L/ha</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => alert('Arquivo de Prescrição VRA baixado em formato CSV/Shapefile para controlador de pulverizador.')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Baixar Prescrição VRA (.CSV / ISO-XML)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL PARA DESENHO DO TALHÃO POR COORDENADAS GEOGRÁFICAS (GPS) */}
            {showDrawPlotModal && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => setShowDrawPlotModal(false)}
                    className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-100 dark:bg-zinc-800 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
                      <MapPin className="w-4 h-4" />
                      <span>Geoprocessamento GIS & Polígono do Talhão</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      Desenho do Talhão por Coordenadas Geográficas (GPS / WGS84)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Informe ou edite as coordenadas geográficas (latitude e longitude) dos vértices perimétricos do talhão para calcular a área real, perímetro e desenhar a área no Mapa Nutricional.
                    </p>
                  </div>

                  {/* Modelos Pré-definidos */}
                  <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Carregar Modelo de Geometria:</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setPlotVertices(DEFAULT_PLOT_VERTICES_PRESETS['talhao-01'])}
                        className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>🌾 Talhão 01 Standard (6 vértices)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPlotVertices(DEFAULT_PLOT_VERTICES_PRESETS['pivo-central'])}
                        className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>🟢 Pivô Central (8 vértices)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPlotVertices(DEFAULT_PLOT_VERTICES_PRESETS['talhao-02'])}
                        className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>📐 Retangular (4 vértices)</span>
                      </button>
                    </div>
                  </div>

                  {/* Abas do Modo de Entrada */}
                  <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setPlotCoordTabMode('form')}
                      className={`px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        plotCoordTabMode === 'form' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Tabela de Vértices GPS</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlotCoordTabMode('batch')}
                      className={`px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        plotCoordTabMode === 'batch' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Colar Coordenadas em Lote (CSV/Texto)</span>
                    </button>
                  </div>

                  {/* Mensagens de Alerta */}
                  {coordErrorMsg && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 rounded-xl text-xs font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{coordErrorMsg}</span>
                    </div>
                  )}

                  {coordSuccessMsg && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{coordSuccessMsg}</span>
                    </div>
                  )}

                  {/* Grid de Configuração & Visualização */}
                  {(() => {
                    const livePlotGeo = calculatePlotGeometry(plotVertices);
                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Coluna Esquerda: Inputs e Indicador de Área */}
                        <div className="space-y-4">
                          {/* Banner de Resultado de Área Calculada Automática */}
                          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                                <Layers className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-black tracking-wider text-emerald-800 dark:text-emerald-400 block">
                                  Área Calculada Automática (Hectares)
                                </span>
                                <div className="flex items-baseline gap-2">
                                  <strong className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                                    {livePlotGeo.areaHa} ha
                                  </strong>
                                  <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold">
                                    ({(livePlotGeo.areaHa * 2.47105).toFixed(2)} alqueires / {livePlotGeo.perimeterKm} km perím.)
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className="px-2.5 py-1 bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px] rounded-lg border border-emerald-500/30 uppercase tracking-wide">
                              GIS WGS84
                            </span>
                          </div>

                          {plotCoordTabMode === 'form' ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                                    Lista de Vértices ({plotVertices.length} coordenadas)
                                  </span>
                                  <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                    {livePlotGeo.areaHa} ha
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const last = plotVertices[plotVertices.length - 1] || { lat: -12.553, lng: -55.721 };
                                    setPlotVertices(prev => [
                                      ...prev,
                                      {
                                        id: `v-${Date.now()}`,
                                        lat: Number((last.lat - 0.0015).toFixed(5)),
                                        lng: Number((last.lng - 0.0015).toFixed(5)),
                                        label: `Vértice ${prev.length + 1}`
                                      }
                                    ]);
                                  }}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Adicionar Vértice</span>
                                </button>
                              </div>

                              <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2">
                                {plotVertices.map((v, idx) => (
                                  <div key={v.id} className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl flex items-center gap-2 text-xs">
                                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-center text-[10px] shrink-0">
                                      V{idx + 1}
                                    </span>
                                    <div className="grid grid-cols-2 gap-2 flex-1">
                                      <div>
                                        <label className="text-[10px] text-slate-400 font-bold block">Latitude</label>
                                        <input
                                          type="number"
                                          step="0.00001"
                                          value={v.lat}
                                          onChange={e => {
                                            const val = parseFloat(e.target.value);
                                            setPlotVertices(prev => prev.map(p => p.id === v.id ? { ...p, lat: isNaN(val) ? 0 : val } : p));
                                          }}
                                          className="w-full p-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg font-mono font-bold text-slate-900 dark:text-white text-xs"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[10px] text-slate-400 font-bold block">Longitude</label>
                                        <input
                                          type="number"
                                          step="0.00001"
                                          value={v.lng}
                                          onChange={e => {
                                            const val = parseFloat(e.target.value);
                                            setPlotVertices(prev => prev.map(p => p.id === v.id ? { ...p, lng: isNaN(val) ? 0 : val } : p));
                                          }}
                                          className="w-full p-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg font-mono font-bold text-slate-900 dark:text-white text-xs"
                                        />
                                      </div>
                                    </div>
                                    {plotVertices.length > 3 && (
                                      <button
                                        type="button"
                                        onClick={() => setPlotVertices(prev => prev.filter(p => p.id !== v.id))}
                                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer shrink-0"
                                        title="Remover vértice"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200">
                                  Cole as coordenadas geográficas (uma por linha: Lat, Lng):
                                </label>
                                <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                  Área Atual: {livePlotGeo.areaHa} ha
                                </span>
                              </div>
                              <textarea
                                rows={8}
                                value={batchCoordInput}
                                onChange={e => setBatchCoordInput(e.target.value)}
                                placeholder={`Exemplo:\n-12.5480, -55.7260\n-12.5472, -55.7145\n-12.5538, -55.7118\n-12.5615, -55.7155\n-12.5605, -55.7248\n-12.5532, -55.7282`}
                                className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl font-mono text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                              />
                              <button
                                type="button"
                                onClick={() => parseBatchCoordinates(batchCoordInput)}
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <Check className="w-4 h-4" />
                                <span>Processar e Recalcular Área ({livePlotGeo.areaHa} ha)</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Coluna Direita: Preview Live SVG do Polígono */}
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between text-white space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-black uppercase text-emerald-400">Desenho do Polígono em Tempo Real</span>
                            <span className="text-[10px] font-mono text-slate-400">EPSG:4326</span>
                          </div>

                          <div className="space-y-4">
                            <div className="h-52 w-full bg-slate-900/90 rounded-xl relative overflow-hidden border border-slate-800 flex items-center justify-center">
                              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

                              <svg className="w-full h-full p-2" viewBox="0 0 1000 600">
                                <polygon
                                  points={livePlotGeo.svgPolygonPoints}
                                  fill="rgba(16, 185, 129, 0.25)"
                                  stroke="#10b981"
                                  strokeWidth="3"
                                />
                                {livePlotGeo.vertexSvgCoords.map(v => (
                                  <g key={v.id}>
                                    <circle cx={v.xPx} cy={v.yPx} r="8" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                                    <text x={v.xPx} y={v.yPx - 10} fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">
                                      {v.label}
                                    </text>
                                  </g>
                                ))}
                              </svg>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">Área Calculada</span>
                                <strong className="text-lg font-black text-emerald-400">{livePlotGeo.areaHa} ha</strong>
                              </div>

                              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">Perímetro Total</span>
                                <strong className="text-lg font-black text-slate-200">{livePlotGeo.perimeterKm} km</strong>
                              </div>

                              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 col-span-2">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">Centroide Geográfico</span>
                                <strong className="font-mono text-slate-200">
                                  Lat: {livePlotGeo.centroid.lat}°, Lng: {livePlotGeo.centroid.lng}°
                                </strong>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowDrawPlotModal(false)}
                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Aplicar Coordenadas e Desenhar Talhão no Mapa</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* MODAL ADICIONAR PONTO GPS */}
            {showAddPointModal && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
                  <button
                    onClick={() => setShowAddPointModal(false)}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-100 dark:bg-zinc-800"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-500" />
                    Novo Ponto Georreferenciado
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-500 block mb-1">Código da Amostra GPS</label>
                      <input
                        type="text"
                        value={mapNewCode}
                        onChange={e => setMapNewCode(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-slate-500 block mb-1">Latitude (°S)</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={mapNewLat}
                          onChange={e => setMapNewLat(parseFloat(e.target.value))}
                          className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-500 block mb-1">Longitude (°W)</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={mapNewLng}
                          onChange={e => setMapNewLng(parseFloat(e.target.value))}
                          className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const newS: LeafSample = {
                          id: `sample-${Date.now()}`,
                          sampleCode: mapNewCode,
                          date: new Date().toISOString().split('T')[0],
                          responsible: 'Agrônomo de Campo',
                          farmId: 'fazenda-santa-maria',
                          fieldId: mapNewPlot,
                          crop: 'Soja',
                          cultivar: 'TMG 7062 IPRO',
                          phenologicalStage: 'R1 - Início do Florescimento',
                          organCollected: 'Folha Índice',
                          plantsSampled: 25,
                          notes: 'Ponto georreferenciado adicionado no mapa',
                          photos: [],
                          results: { N: 41.0, P: 2.6, K: 16.0, Ca: 9.5, Mg: 3.2, S: 2.2, B: 28, Zn: 22, Fe: 95, Mn: 42, Cu: 8.5, Mo: 0.4 }
                        };
                        setSamples(prev => [newS, ...prev]);
                        setSelectedMapPointId(newS.id);
                        setShowAddPointModal(false);
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer mt-2"
                    >
                      Salvar Ponto no Mapa
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ========================================================= */}
      {/* 9. DIÁRIO FOTOGRÁFICO DE ACOMPANHAMENTO FOLIAR             */}
      {/* ========================================================= */}
      {activeTab === 'diario' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Banner & Main Actions */}
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  Laudo & Histórico Fotográfico
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Diário Fotográfico de Diagnóstico Foliar
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Tire fotos em tempo real no campo com a câmera do seu dispositivo ou anexe fotos da galeria para acompanhar sintomas e respostas nutricionais.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => openAddPhotoModal(undefined, 'camera')}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Camera className="w-4 h-4" />
                Tirar Foto (Câmera)
              </button>

              <button
                onClick={() => openAddPhotoModal(undefined, 'gallery')}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Image className="w-4 h-4" />
                Anexar da Galeria
              </button>

              <button
                onClick={() => openAddPhotoModal(undefined, 'camera')}
                className="px-3 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Novo Registro
              </button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por amostra, cultura, nota..."
                value={diarySearchFilter}
                onChange={e => setDiarySearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Filtrar por Talhão:</span>
              <select
                value={diaryPlotFilter}
                onChange={e => setDiaryPlotFilter(e.target.value)}
                className="py-2 px-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 outline-none"
              >
                <option value="all">Todos os Talhões</option>
                {Array.from(new Set(samples.map(s => s.fieldId).filter(Boolean))).map(plot => (
                  <option key={plot} value={plot}>{plot}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Photo Diary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {samples
              .filter(s => {
                const matchesSearch = !diarySearchFilter || 
                  s.sampleCode.toLowerCase().includes(diarySearchFilter.toLowerCase()) ||
                  s.crop.toLowerCase().includes(diarySearchFilter.toLowerCase()) ||
                  s.fieldId.toLowerCase().includes(diarySearchFilter.toLowerCase()) ||
                  (s.notes && s.notes.toLowerCase().includes(diarySearchFilter.toLowerCase()));
                const matchesPlot = diaryPlotFilter === 'all' || s.fieldId === diaryPlotFilter;
                return matchesSearch && matchesPlot;
              })
              .map((s) => {
                const hasPhotos = s.photos && (s.photos || []).length > 0;
                return (
                  <div key={s.id} className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
                    {/* Top Image Box */}
                    {hasPhotos ? (
                      <div className="space-y-2">
                        <div 
                          onClick={() => setLightboxPhoto({
                            url: s.photos[0],
                            sampleId: s.id,
                            sampleCode: s.sampleCode,
                            crop: s.crop,
                            date: s.date,
                            notes: s.notes,
                            photoIndex: 0
                          })}
                          className="aspect-video bg-slate-900 rounded-xl overflow-hidden relative group cursor-pointer border border-slate-200 dark:border-zinc-800"
                        >
                          <img 
                            src={s.photos[0]} 
                            alt={`Foto Amostra ${s.sampleCode}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" 
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                            <span className="px-3 py-1 bg-black/70 text-white text-xs font-bold rounded-lg backdrop-blur-xs flex items-center gap-1.5">
                              <ZoomIn className="w-3.5 h-3.5" /> Ampliar Foto
                            </span>
                          </div>
                          <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 text-white text-[10px] font-mono rounded-lg backdrop-blur-xs flex items-center gap-1">
                            <Camera className="w-3 h-3 text-emerald-400" />
                            {(s.photos || []).length} {(s.photos || []).length === 1 ? 'Foto' : 'Fotos'}
                          </span>
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 text-white text-[10px] font-mono rounded-lg backdrop-blur-xs">
                            {s.date}
                          </span>
                        </div>

                        {/* Additional Thumbnails */}
                        {(s.photos || []).length > 1 && (
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {s.photos.map((pUrl, pIdx) => (
                              <button
                                key={pIdx}
                                onClick={() => setLightboxPhoto({
                                  url: pUrl,
                                  sampleId: s.id,
                                  sampleCode: s.sampleCode,
                                  crop: s.crop,
                                  date: s.date,
                                  notes: s.notes,
                                  photoIndex: pIdx
                                })}
                                className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 cursor-pointer transition-all ${
                                  pIdx === 0 ? 'border-emerald-500' : 'border-transparent hover:border-slate-400'
                                }`}
                              >
                                <img src={pUrl} alt="" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video bg-slate-50 dark:bg-zinc-900/60 rounded-xl flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 relative space-y-2">
                        <Camera className="w-8 h-8 text-slate-300 dark:text-zinc-700" />
                        <div>
                          <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">Sem fotos anexadas</p>
                          <p className="text-[10px] text-slate-400">Capture com a câmera ou escolha da galeria</p>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => openAddPhotoModal(s.id, 'camera')}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Camera className="w-3 h-3" /> Câmera
                          </button>
                          <button
                            onClick={() => openAddPhotoModal(s.id, 'gallery')}
                            className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Image className="w-3 h-3" /> Galeria
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Card Content Info */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-black text-slate-900 dark:text-white text-base">{s.sampleCode}</h4>
                          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">{s.crop} ({s.cultivar || 'Padrão'})</p>
                        </div>
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-[10px] rounded-lg uppercase">
                          {s.fieldId}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                        <span>Estágio: <strong>{s.phenologicalStage}</strong></span>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-zinc-900/80 rounded-xl text-xs space-y-1 border border-slate-100 dark:border-zinc-800">
                        <span className="font-bold text-slate-400 text-[10px] uppercase block">Nota Agronômica de Campo:</span>
                        <p className="text-slate-700 dark:text-zinc-300 italic text-xs leading-relaxed">
                          {s.notes || 'Nenhuma observação cadastrada para este registro.'}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-900 flex items-center justify-between gap-2">
                      <button
                        onClick={() => openAddPhotoModal(s.id, 'camera')}
                        className="flex-1 py-1.5 px-2 bg-slate-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-400 font-bold text-[11px] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-emerald-600" />
                        + Câmera
                      </button>

                      <button
                        onClick={() => openAddPhotoModal(s.id, 'gallery')}
                        className="flex-1 py-1.5 px-2 bg-slate-100 dark:bg-zinc-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-zinc-300 hover:text-teal-700 dark:hover:text-teal-400 font-bold text-[11px] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Image className="w-3.5 h-3.5 text-teal-600" />
                        + Galeria
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 10. DIAGNÓSTICO VISUAL DE SINTOMAS & CHAVE DICOTÔMICA      */}
      {/* ========================================================= */}
      {activeTab === 'sintomas' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-500/10 text-amber-600 font-extrabold uppercase text-[10px] px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Chave Dicotômica de Campo
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Guia Diagnóstico por Sintomas Visuais de Deficiência
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Identifique deficiências nutricionais no campo através da localização e padrão visual de cloroses e necroses na planta.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
              <h4 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                Em qual região da planta o sintoma predomina?
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSymptomOrganFilter('velhas')}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    symptomOrganFilter === 'velhas'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/30'
                      : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  <strong className="block text-sm font-black mb-1">Folhas Velhas (Basais)</strong>
                  <p className="text-xs opacity-75">Indica deficiência de nutrientes móveis (N, P, K, Mg).</p>
                </button>

                <button
                  onClick={() => setSymptomOrganFilter('novas')}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    symptomOrganFilter === 'novas'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/30'
                      : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  <strong className="block text-sm font-black mb-1">Folhas Novas / Broto Apical</strong>
                  <p className="text-xs opacity-75">Indica deficiência de nutrientes imóveis ou de baixa mobilidade (Ca, S, B, Fe, Zn, Mn, Cu).</p>
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
              <h4 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                Diagnóstico Dicotômico Provável:
              </h4>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-3">
                {symptomOrganFilter === 'velhas' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <strong className="text-base font-black text-emerald-800 dark:text-emerald-300">Suspeita Principal: N, K ou Mg</strong>
                      <span className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-extrabold uppercase rounded-lg">Alta Probabilidade</span>
                    </div>
                    <ul className="text-xs space-y-1.5 text-slate-700 dark:text-zinc-300 list-disc pl-4">
                      <li><strong>Clorose Uniforme:</strong> Deficiência de Nitrogênio (N).</li>
                      <li><strong>Necrose nas Margens:</strong> Deficiência de Potássio (K).</li>
                      <li><strong>Clorose Internerval (Espinha de Peixe):</strong> Deficiência de Magnésio (Mg).</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <strong className="text-base font-black text-emerald-800 dark:text-emerald-300">Suspeita Principal: Ca, B, S, Zn ou Fe</strong>
                      <span className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-extrabold uppercase rounded-lg">Alta Probabilidade</span>
                    </div>
                    <ul className="text-xs space-y-1.5 text-slate-700 dark:text-zinc-300 list-disc pl-4">
                      <li><strong>Morte do Broto Apical & Deformação:</strong> Deficiência de Cálcio (Ca) ou Boro (B).</li>
                      <li><strong>Clorose Amarela nas Folhas Novas:</strong> Deficiência de Enxofre (S) ou Ferro (Fe).</li>
                      <li><strong>Folhas Pequenas & Encurtamento de Entrenós:</strong> Deficiência de Zinco (Zn).</li>
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 11. DIAGNÓSTICO INTEGRADO SOLO X FOLHA                    */}
      {/* ========================================================= */}
      {activeTab === 'integracao_solo' && (() => {
        const simPh = soilPhSim !== null ? soilPhSim : (matchingSoilSample?.phCaCl2 || 5.2);
        const simK = soilKSim !== null ? soilKSim : (matchingSoilSample?.kCmolcDm3 || 0.35);
        const simCaMg = soilCaMgSim !== null ? soilCaMgSim : (matchingSoilSample ? Number((matchingSoilSample.caCmolcDm3 / (matchingSoilSample.mgCmolcDm3 || 1.0)).toFixed(1)) : 3.0);

        const leafK = currentSample?.results?.K || 16.0;
        const leafMg = currentSample?.results?.Mg || 3.2;
        const leafP = currentSample?.results?.P || 2.2;
        const leafZn = currentSample?.results?.Zn || 20.0;
        const leafMn = currentSample?.results?.Mn || 40.0;

        // Define dynamic statuses and physiological details
        const situationsConfig: Record<string, {
          id: string;
          title: string;
          icon: string;
          score: string;
          badge: string;
          severity: 'success' | 'warning' | 'danger';
          statusText: string;
          definition: string;
          biochemicalImpact: string;
          soilChemistry: string;
          fieldSymptoms: string[];
          management: string[];
          simImpactText: string;
        }> = {
          k_efficiency: {
            id: 'k_efficiency',
            title: 'Eficiência de Absorção do Potássio (K)',
            icon: '⚖️',
            ...(simK < 0.15 && leafK < 15 ? {
              score: '35% - Muito Baixa',
              badge: 'Déficit Crítico',
              severity: 'danger',
              statusText: 'Esgotamento sistêmico de K no solo e na planta.'
            } : simK >= 0.15 && leafK < 15 ? {
              score: '55% - Comprometida',
              badge: 'Bloqueio Radicular',
              severity: 'warning',
              statusText: 'K disponível no solo, porém com barreira de absorção.'
            } : simK < 0.15 && leafK >= 15 ? {
              score: '75% - Alerta',
              badge: 'Consumo de Reserva',
              severity: 'warning',
              statusText: 'Planta sustentada por reservas, solo empobrecido.'
            } : {
              score: '94% - Otimizada',
              badge: 'Excelente',
              severity: 'success',
              statusText: 'Sinergismo saudável, ótima absorção e hidratação.'
            }),
            definition: 'O Potássio é o motor de transporte de açúcares dentro da planta. Ele dita o calibre dos frutos, turgor celular e resistência à seca. Sua absorção pelas raízes ocorre por difusão em água.',
            biochemicalImpact: 'Atua na osmorregulação vacuolar e na ativação de mais de 60 sistemas enzimáticos fundamentais para a síntese de proteínas e fotossíntese ativa. Sem K, os estômatos não fecham corretamente, levando a murchamento rápido.',
            soilChemistry: 'Em solos de argila de baixa atividade (típicos do Brasil) ou muito arenosos, o Potássio lixivia com facilidade. Além disso, estresse hídrico reduz drasticamente a taxa de difusão de K até a superfície da raiz.',
            fieldSymptoms: [
              'Necrose ("queima") das margens e ápices das folhas mais velhas.',
              'Encurtamento do período de granação, resultando em frutos menores ou chochos.',
              'Ramos flácidos com perda rápida de turgor nas horas quentes do dia.'
            ],
            management: [
              'Foliar: Aplicação emergencial de Sulfato de Potássio (2% a 3%) ou Cloreto de Potássio purificado.',
              'Solo: Planejar adubação potássica parcelada, principalmente em solos arenosos (argila < 15%).',
              'Fisiológico: Uso de aminoácidos (ex: Prolina, Glicina-Betaina) para proteção celular contra estresse osmótico.'
            ],
            simImpactText: 'Elevar o Potássio do solo para valores > 0.25 cmolc/dm³ eleva a eficiência para o patamar ideal (94%).'
          },
          ca_mg_antagonism: {
            id: 'ca_mg_antagonism',
            title: 'Antagonismo Ca:Mg & Absorção de Magnésio',
            icon: '🧬',
            ...(simCaMg > 4.5 && leafMg < 3.0 ? {
              score: 'Bloqueio Severo',
              badge: 'Antagonismo Ativo',
              severity: 'danger',
              statusText: 'O excesso de Cálcio no solo está inibindo a absorção de Magnésio.'
            } : simCaMg <= 1.5 && leafMg < 3.0 ? {
              score: 'Carência Dupla',
              badge: 'Acidez Extrema',
              severity: 'danger',
              statusText: 'Solo muito ácido com baixo teor de ambos os cátions.'
            } : simCaMg > 4.5 && leafMg >= 3.0 ? {
              score: 'Alerta de Risco',
              badge: 'Risco Moderado',
              severity: 'warning',
              statusText: 'Relação desequilibrada no solo, porém folha em nível aceitável temporariamente.'
            } : {
              score: 'Equilibrado',
              badge: 'Excelente',
              severity: 'success',
              statusText: 'Paridade ideal Ca:Mg no solo e folha propiciando fotossíntese máxima.'
            }),
            definition: 'Cálcio e Magnésio competem diretamente pelos mesmos transportadores catiônicos nas membranas celulares das raízes. A relação ideal Ca:Mg no solo situa-se entre 3.0 e 4.0.',
            biochemicalImpact: 'O Magnésio é o constituinte central do anel porfirínico da molécula de clorofila. A inibição competitiva pelo Cálcio reduz a concentração foliar de Mg, diminuindo severamente a capacidade da planta de fixar CO2.',
            soilChemistry: 'Calagens pesadas utilizando estritamente calcário calcítico (rico em Ca e pobre em Mg) geram relações Ca:Mg elevadas (> 5), bloqueando a absorção de Mg. Solos muito intemperizados ácidos sofrem de lixiviação de ambos.',
            fieldSymptoms: [
              'Clorose internerval marcante ("espinha de peixe") nas folhas mais velhas.',
              'Queda precoce de folhas do terço inferior da planta sob alta carga produtiva.',
              'Folhas velhas com manchas amareladas que evoluem para bronzeamento.'
            ],
            management: [
              'Foliar: Aplicações foliares rápidas de Sulfato de Magnésio (15 a 20 kg/ha) ou Mg quelatado na fase vegetativa.',
              'Solo: Na próxima operação de calagem, aplicar exclusivamente Calcário Dolomítico para equilibrar a relação.',
              'Fisiológico: Adição de fontes de nitrogênio nítrico que facilitam sinergicamente o transporte de cátions di-valentes.'
            ],
            simImpactText: 'Reduzir a relação Ca:Mg no solo para valores entre 3 e 4 (através de fontes magnesianas) anula o bloqueio químico.'
          },
          p_fixation: {
            id: 'p_fixation',
            title: 'Fixação de Fósforo (P) por pH do Solo',
            icon: '🎯',
            ...(simPh < 4.8 && leafP < 2.0 ? {
              score: 'Fixação Altíssima',
              badge: 'Precipitado com Al/Fe',
              severity: 'danger',
              statusText: 'Fósforo fortemente adsorvido por óxidos de Ferro e Alumínio em solo ácido.'
            } : simPh > 6.2 && leafP < 2.0 ? {
              score: 'Precipitado com Ca',
              badge: 'Precipitado com Ca',
              severity: 'warning',
              statusText: 'pH elevado provoca precipitação do Fósforo como Fosfato de Cálcio.'
            } : simPh < 4.8 && leafP >= 2.0 ? {
              score: 'Aproveitamento Limite',
              badge: 'Alerta Acidez',
              severity: 'warning',
              statusText: 'Foliar adequado, mas solo ácido limitando durabilidade do nutriente.'
            } : {
              score: 'Aproveitamento Ótimo',
              badge: 'Solúvel e Ativo',
              severity: 'success',
              statusText: 'pH ideal mantendo o Fósforo altamente disponível para as raízes.'
            }),
            definition: 'O Fósforo é o nutriente da energia celular (ATP). No Brasil, solos altamente ácidos possuem alta carga de Ferro e Alumínio que fixam quimicamente o fósforo de forma quase irreversível.',
            biochemicalImpact: 'O Fósforo é componente essencial de fosfolipídios de membrana, ácidos nucleicos (DNA/RNA) e ATP. Sem P solúvel, os processos de mitose e alongamento radicular são drasticamente paralisados.',
            soilChemistry: 'A disponibilidade máxima de P ocorre em pH (CaCl2) entre 5.2 e 5.8 (pH H2O de 6.0 a 6.5). Abaixo de 5.0, o P se liga fortemente a óxidos de Fe e Al. Acima de 6.5, associa-se de forma insolúvel ao Cálcio.',
            fieldSymptoms: [
              'Folhas velhas com coloração verde-escura azulada ou manchas arroxeadas (acúmulo de antocianina).',
              'Desenvolvimento radicular extremamente atrofiado com poucas radicelas.',
              'Atraso nítido na floração e redução do vigor reprodutivo.'
            ],
            management: [
              'Solo: Realizar calagem adequada para elevar o pH em CaCl2 para pelo menos 5.5, desativando o Alumínio tóxico.',
              'Fertilizante: Usar fosfatos protegidos (revestidos com polímeros) ou associar matéria orgânica de qualidade.',
              'Biológico: Inoculação com bactérias solubilizadoras de Fósforo (ex: Pseudomonas fluorescens ou Bacillus subtilis).'
            ],
            simImpactText: 'Ajustar o pH do solo para a faixa ideal de 5.3 a 5.8 reduz a fixação do P em até 80%.'
          },
          k_mg_antagonism: {
            id: 'k_mg_antagonism',
            title: 'Inibição Catiônica Potássio x Magnésio (K x Mg)',
            icon: '⚡',
            ...(simK > 0.45 && leafMg < 3.0 ? {
              score: 'Bloqueio Ativo',
              badge: 'Antagonismo K-Mg',
              severity: 'danger',
              statusText: 'Altos teores de K no solo estão bloqueando competitivamente a absorção de Mg.'
            } : simK < 0.15 && leafMg < 3.0 ? {
              score: 'Subnutrição Geral',
              badge: 'Carência Absoluta',
              severity: 'warning',
              statusText: 'Carência generalizada de cátions no perfil do solo.'
            } : {
              score: 'Harmonia Ativa',
              badge: 'Equilibrado',
              severity: 'success',
              statusText: 'Níveis saudáveis de Potássio e Magnésio sem inibição competitiva.'
            }),
            definition: 'O excesso de Potássio (K) no solo ou aplicações maciças de cloreto de potássio na linha provocam um "abafamento" competitivo nas raízes, inibindo severamente a absorção de Magnésio.',
            biochemicalImpact: 'As raízes possuem canais de alta afinidade por Potássio (cátion monovalente que entra preferencialmente). Cátions divalentes como Magnésio (Mg2+) necessitam de mais energia celular para transporte nas membranas.',
            soilChemistry: 'A relação ideal de saturação de K na CTC deve estar entre 2% e 5%, enquanto o Mg deve estar entre 10% e 15%. Quando a relação K/Mg no solo ultrapassa 0.5, a inibição competitiva atinge o nível crítico.',
            fieldSymptoms: [
              'Clorose marginal em formato de "V" invertido iniciando nas folhas basais.',
              'Desfolha prematura do baixeiro produtivo, encurtando o vigor dos ramos produtivos.',
              'Perda de açúcar e maturação desuniforme dos frutos por falha na translocação.'
            ],
            management: [
              'Solo: Reduzir ou suspender adubação potássica se os níveis no solo forem muito elevados (> 0.45 cmolc/dm³).',
              'Foliar: Aplicar Magnésio Quelatado ou Nitrato de Magnésio para suprir as folhas rapidamente por via foliar.',
              'Fertilização: Buscar fontes alternativas que associem magnésio solúvel nas coberturas de nitrogênio.'
            ],
            simImpactText: 'Manter o Potássio do solo equilibrado (abaixo de 0.40 cmolc/dm³) previne a deficiência induzida de Magnésio.'
          },
          micro_availability: {
            id: 'micro_availability',
            title: 'Micronutrientes Metálicos por pH (Zn, Mn, Fe)',
            icon: '🛡️',
            ...(simPh > 6.0 && (leafZn < 20 || leafMn < 30) ? {
              score: 'Retenção Química',
              badge: 'Precipitação Ativa',
              severity: 'danger',
              statusText: 'pH elevado provoca precipitação insolúvel de Zinco e Manganês.'
            } : simPh < 4.8 && (leafZn < 20 || leafMn < 30) ? {
              score: 'Solo Esgotado',
              badge: 'Lixiviação Severa',
              severity: 'warning',
              statusText: 'Solo excessivamente ácido e intemperizado esgotou as reservas metálicas.'
            } : {
              score: 'Absorção Plena',
              badge: 'Excelente',
              severity: 'success',
              statusText: 'pH do solo mantém os micronutrientes na forma solúvel assimilável.'
            }),
            definition: 'Micronutrientes metálicos (Zinco, Manganês, Ferro e Cobre) necessitam de condições levemente ácidas para permanecerem livres e solúveis na solução do solo. Calagens excessivas travam sua absorção.',
            biochemicalImpact: 'O Zinco é cofator da síntese de auxinas (hormônio do crescimento apical). O Manganês é responsável pelo fotossistema II (quebra da água). Sua carência reduz severamente o tamanho das folhas e o alongamento de brotos novos.',
            soilChemistry: 'A solubilidade de metais decai exponencialmente com a elevação do pH. Em pH (CaCl2) > 6.0, ocorre a reação de precipitação em hidróxidos insolúveis nas superfícies das partículas de solo, indisponibilizando o nutriente.',
            fieldSymptoms: [
              'Folhas novas muito pequenas e estreitas ("orelha de onça" ou "folha miúda").',
              'Encurtamento drástico de entrenós dando visual "rosetado" aos ramos.',
              'Clorose reticulada fina em folhas novas (nervuras verdes e lâmina amarela).'
            ],
            management: [
              'Foliar: Uso de quelatos metálicos reais (Zn-EDTA, Mn-EDTA) que impedem reações químicas indesejadas na calda.',
              'Solo: Aplicação localizada de micronutrientes associados a fertilizantes acidificantes (como Sulfato de Amônio).',
              'Manejo: Evitar supercalagem e monitorar o pH para que nunca ultrapasse 5.8 em CaCl2.'
            ],
            simImpactText: 'Adequar o pH do solo para abaixo de 5.8 reativa instantaneamente a absorção destes micronutrientes.'
          }
        };

        const activeSit = situationsConfig[selectedSoilSituation] || situationsConfig.k_efficiency;

        return (
          <div className="space-y-6 animate-fade-in">
            {/* Header tab card */}
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-teal-500/10 text-teal-600 dark:text-teal-400 font-extrabold uppercase text-[10px] px-2.5 py-0.5 rounded-full border border-teal-500/20 flex items-center gap-1">
                    <Droplets className="w-3 h-3" />
                    Sinergismo Solo x Folha
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Matriz de Translocação & Eficiência Solo-Folha
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Avalie e simule em tempo real como as propriedades físicas e químicas do solo influenciam de forma sistêmica os teores foliares das plantas.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left side: Matched Samples Info & Situation Selector */}
              <div className="lg:col-span-4 space-y-4">
                {/* Matched Info */}
                <div className="p-4 bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                    <strong className="text-xs font-black uppercase text-slate-700 dark:text-zinc-300">Cruzamento de Dados Ativo</strong>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div className="space-y-1">
                      <span className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">Folha Selecionada</span>
                      <strong className="dark:text-white block truncate">{currentSample.sampleCode}</strong>
                      <span className="text-slate-500 text-[10px]">{currentSample.crop.split(' ')[0]}</span>
                    </div>
                    <div className="space-y-1 border-l pl-3 border-slate-200 dark:border-zinc-800">
                      <span className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">Solo Correspondente</span>
                      <strong className="dark:text-white block truncate">{matchingSoilSample?.sampleCode || 'N/A'}</strong>
                      <span className="text-slate-500 text-[10px]">Talhão {matchingSoilSample?.plotId || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Situation List */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">Selecione uma Relação Solo-Planta</h4>
                  {Object.values(situationsConfig).map((sit) => {
                    const isSelected = selectedSoilSituation === sit.id;
                    let borderClass = 'border-slate-200 dark:border-zinc-800 hover:border-teal-500/50';
                    let iconBg = 'bg-slate-100 dark:bg-zinc-850 text-slate-500 dark:text-zinc-400';
                    
                    if (isSelected) {
                      borderClass = 'border-teal-500 bg-teal-50/20 dark:bg-teal-950/10 ring-1 ring-teal-500/20';
                      iconBg = 'bg-teal-500 text-white';
                    }

                    let badgeColor = 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400';
                    if (sit.severity === 'danger') badgeColor = 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400';
                    if (sit.severity === 'warning') badgeColor = 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';
                    if (sit.severity === 'success') badgeColor = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';

                    return (
                      <button
                        key={sit.id}
                        type="button"
                        onClick={() => setSelectedSoilSituation(sit.id)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-start gap-3 cursor-pointer group ${borderClass}`}
                      >
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-base font-bold shrink-0 ${iconBg}`}>
                          {sit.icon}
                        </span>
                        <div className="space-y-1 min-w-0 flex-1">
                          <strong className="text-xs font-black text-slate-900 dark:text-white block group-hover:text-teal-600 dark:group-hover:text-teal-400 transition truncate">
                            {sit.title}
                          </strong>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-normal line-clamp-1">
                            {sit.statusText}
                          </p>
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${badgeColor}`}>
                              {sit.score}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right side: Detailed explanation + interactive simulator */}
              <div className="lg:col-span-8 space-y-6">
                {/* Simulator Card */}
                <div className="bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-zinc-850">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-teal-600" />
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">Simulador de Correção Fisiológica do Solo</h4>
                    </div>
                    {(soilPhSim !== null || soilKSim !== null || soilCaMgSim !== null) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSoilPhSim(null);
                          setSoilKSim(null);
                          setSoilCaMgSim(null);
                        }}
                        className="flex items-center gap-1 text-[10px] font-extrabold text-teal-600 hover:text-teal-700 bg-teal-50 dark:bg-teal-950/30 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-900/60 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Restaurar Originais</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* pH Slider */}
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase block mb-1">
                        pH em CaCl₂: <strong className="text-slate-700 dark:text-zinc-300">{simPh.toFixed(1)}</strong>
                      </label>
                      <input
                        type="range"
                        min="4.0"
                        max="7.0"
                        step="0.1"
                        value={simPh}
                        onChange={(e) => setSoilPhSim(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                        <span>Ácido (4.0)</span>
                        <span className="text-teal-500 font-bold">Ideal (5.2 - 5.8)</span>
                        <span>Alcalino (7.0)</span>
                      </div>
                    </div>

                    {/* K Slider */}
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase block mb-1">
                        Potássio no Solo (cmol_c/dm³): <strong className="text-slate-700 dark:text-zinc-300">{simK.toFixed(2)}</strong>
                      </label>
                      <input
                        type="range"
                        min="0.05"
                        max="0.80"
                        step="0.01"
                        value={simK}
                        onChange={(e) => setSoilKSim(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                        <span>Baixo (0.05)</span>
                        <span className="text-teal-500 font-bold">Adequado (&gt;0.25)</span>
                        <span>Alto (0.80)</span>
                      </div>
                    </div>

                    {/* Ca:Mg Slider */}
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase block mb-1">
                        Relação Ca:Mg Solo: <strong className="text-slate-700 dark:text-zinc-300">{simCaMg.toFixed(1)}</strong>
                      </label>
                      <input
                        type="range"
                        min="1.0"
                        max="10.0"
                        step="0.1"
                        value={simCaMg}
                        onChange={(e) => setSoilCaMgSim(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                        <span>Falta Ca (1.0)</span>
                        <span className="text-teal-500 font-bold">Ideal (3.0 - 4.0)</span>
                        <span>Excesso Ca (10.0)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-teal-500/5 border border-teal-500/10 rounded-xl flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                    <p className="text-[11px] text-slate-600 dark:text-zinc-300">
                      <strong className="text-teal-600 font-bold">Impacto da Simulação:</strong> {activeSit.simImpactText}
                    </p>
                  </div>
                </div>

                {/* Detailed Active Situation Info */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="p-5 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-zinc-950/20">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{activeSit.icon}</span>
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white">{activeSit.title}</h3>
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Situação Diagnóstica Detalhada</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider self-start sm:self-auto ${
                      activeSit.severity === 'danger' ? 'bg-red-600 text-white shadow-xs' :
                      activeSit.severity === 'warning' ? 'bg-amber-600 text-white shadow-xs' :
                      'bg-emerald-600 text-white shadow-xs'
                    }`}>
                      {activeSit.score}
                    </span>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Visão Geral */}
                    <div className="p-4 bg-slate-50 dark:bg-zinc-850 rounded-xl space-y-2 border border-slate-200 dark:border-zinc-800">
                      <h4 className="text-xs font-black uppercase text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-teal-600" />
                        <span>Visão Geral & Significado Fisiológico</span>
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-medium">
                        {activeSit.definition}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Dinâmica Fisiológica */}
                      <div className="p-4 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-2">
                        <h5 className="text-[11px] font-black uppercase text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-emerald-500" />
                          <span>Mecanismo Fisiológico Celular</span>
                        </h5>
                        <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                          {activeSit.biochemicalImpact}
                        </p>
                      </div>

                      {/* Química do solo */}
                      <div className="p-4 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-2">
                        <h5 className="text-[11px] font-black uppercase text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <span>Dinâmica Química do Solo</span>
                        </h5>
                        <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                          {activeSit.soilChemistry}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Sintomas Visuais */}
                      <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2.5">
                        <h5 className="text-[11px] font-black uppercase text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>Sintomas de Campo Associados</span>
                        </h5>
                        <ul className="space-y-1.5">
                          {activeSit.fieldSymptoms.map((sym, idx) => (
                            <li key={idx} className="text-xs text-slate-700 dark:text-zinc-300 flex items-start gap-1.5">
                              <span className="text-amber-500 mt-0.5 font-bold">•</span>
                              <span>{sym}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Recomendações de Manejo */}
                      <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-2.5">
                        <h5 className="text-[11px] font-black uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-emerald-600" />
                          <span>Ações de Manejo & Correção</span>
                        </h5>
                        <ul className="space-y-1.5">
                          {activeSit.management.map((man, idx) => (
                            <li key={idx} className="text-xs text-slate-700 dark:text-zinc-300 flex items-start gap-1.5">
                              <span className="text-emerald-500 mt-0.5 font-bold">✓</span>
                              <span>{man}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

       {/* ========================================================= */}
       {/* MODAL DE EXPLICAÇÃO FISIOLÓGICA DAS RELAÇÕES               */}
       {/* ========================================================= */}
       {selectedExplanationRatioKey && RATIO_EXPLANATION_DETAILS[selectedExplanationRatioKey] && (() => {
         const ratioData = RATIO_EXPLANATION_DETAILS[selectedExplanationRatioKey];
         const cfg = ratiosConfig[selectedExplanationRatioKey] || { value: 0, minIdeal: ratioData.minIdeal, maxIdeal: ratioData.maxIdeal };
         const val = cfg.value;
         const isLow = val < ratioData.minIdeal;
         const isHigh = val > ratioData.maxIdeal;
         const statusType = isHigh ? 'highStatus' : isLow ? 'lowStatus' : 'idealStatus';
         const currentDetails = ratioData[statusType];

         return (
           <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
             <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
               {/* Botão Fechar */}
               <button
                 onClick={() => setSelectedExplanationRatioKey(null)}
                 className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-100 dark:bg-zinc-800 cursor-pointer"
               >
                 <X className="w-5 h-5" />
               </button>

               {/* Cabeçalho do Modal */}
               <div className="space-y-1.5 pr-8">
                 <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
                   <BookOpen className="w-4 h-4" />
                   <span>Explicação Fisiológica Nema IA Nutrifoliar</span>
                 </div>
                 <h3 className="text-xl font-black text-slate-900 dark:text-white">
                   {ratioData.name}
                 </h3>
                 <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                   {ratioData.definition}
                 </p>
               </div>

               {/* Seletor de Relações dentro do Modal */}
               <div className="space-y-1">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Navegar pelas Relações Nutricionais:</span>
                 <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl border border-slate-200/60 dark:border-zinc-700/60">
                   {Object.keys(RATIO_EXPLANATION_DETAILS).map(rKey => {
                     const item = RATIO_EXPLANATION_DETAILS[rKey];
                     const isSelected = selectedExplanationRatioKey === rKey;
                     return (
                       <button
                         key={rKey}
                         onClick={() => setSelectedExplanationRatioKey(rKey)}
                         className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                           isSelected
                             ? 'bg-emerald-600 text-white shadow-xs'
                             : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                         }`}
                       >
                         {item.key}
                       </button>
                     );
                   })}
                 </div>
               </div>

               {/* Card de Status da Amostra */}
               <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                 isHigh ? 'bg-red-500/10 border-red-200 dark:border-red-900 text-red-900 dark:text-red-200' :
                 isLow ? 'bg-yellow-500/10 border-yellow-200 dark:border-yellow-900 text-yellow-900 dark:text-yellow-200' :
                 'bg-emerald-500/10 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
               }`}>
                 <div>
                   <span className="text-[10px] uppercase font-black tracking-wider block opacity-75">Status na Amostra Selecionada ({currentSample.sampleCode})</span>
                   <div className="flex items-baseline gap-2 mt-0.5">
                     <strong className="text-2xl font-black">{val}</strong>
                     <span className="text-xs opacity-80">(Faixa Ideal: {ratioData.minIdeal} a {ratioData.maxIdeal})</span>
                   </div>
                 </div>
                 <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${
                   isHigh ? 'bg-red-600 text-white shadow-xs' :
                   isLow ? 'bg-amber-600 text-white shadow-xs' :
                   'bg-emerald-600 text-white shadow-xs'
                 }`}>
                   {currentDetails.badge}
                 </span>
               </div>

               {/* Detalhamento Fisiológico */}
               <div className="space-y-4">
                 <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl space-y-2 border border-slate-200/60 dark:border-zinc-700/60">
                   <h4 className="text-xs font-black uppercase text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                     <AlertTriangle className={`w-4 h-4 ${isHigh ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-emerald-500'}`} />
                     <span>{currentDetails.title}</span>
                   </h4>
                   <div className="space-y-2.5 pt-1 text-xs text-slate-600 dark:text-zinc-300">
                     <div>
                       <strong className="font-bold text-slate-800 dark:text-zinc-100 block">Causas Fisiológicas e de Nutrição no Solo:</strong>
                       <p className="mt-0.5 leading-relaxed">{currentDetails.cause}</p>
                     </div>
                     <div>
                       <strong className="font-bold text-slate-800 dark:text-zinc-100 block">Mecanismo Fisiológico e Celular:</strong>
                       <p className="mt-0.5 leading-relaxed">{currentDetails.physiologicalImpact}</p>
                     </div>
                   </div>
                 </div>

                 {/* Lista de Consequências Práticas */}
                 <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl space-y-2 border border-slate-200/60 dark:border-zinc-700/60">
                   <h4 className="text-xs font-black uppercase text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                     <Activity className="w-4 h-4 text-emerald-500" />
                     <span>Sintomas & Riscos Práticos na Cultura</span>
                   </h4>
                   <ul className="space-y-1.5 pt-1">
                     {currentDetails.practicalConsequences.map((cons, idx) => (
                       <li key={idx} className="text-xs text-slate-600 dark:text-zinc-300 flex items-start gap-2">
                         <span className="text-emerald-500 font-bold">•</span>
                         <span className="leading-relaxed">{cons}</span>
                       </li>
                     ))}
                   </ul>
                 </div>

                 {/* Ação de Manejo Recomendada */}
                 <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-2">
                   <h4 className="text-xs font-black uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                     <Zap className="w-4 h-4 text-emerald-600" />
                     <span>Plano de Manejo e Pulverização Foliar Recomendada</span>
                    </h4>
                    {currentDetails.careAndPrecautions && currentDetails.careAndPrecautions.length > 0 && (
                      <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl space-y-1.5 my-2">
                        <strong className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Cuidados & Precauções Importantes no Campo:</span>
                        </strong>
                        <ul className="space-y-1">
                          {currentDetails.careAndPrecautions.map((care, idx) => (
                            <li key={idx} className="text-xs text-slate-700 dark:text-zinc-300 flex items-start gap-1.5">
                              <span className="text-amber-500 font-bold">•</span>
                              <span>{care}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <h4 className="hidden">
                   </h4>
                   <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                     {currentDetails.action}
                   </p>
                 </div>
               </div>

               {/* Rodapé do Modal */}
               <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-zinc-800">
                 <button
                   onClick={() => {
                     setSelectedExplanationRatioKey(null);
                     setActiveTab('indices');
                   }}
                   className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                 >
                   <span>Abrir painel completo de Relações</span>
                   <ChevronRight className="w-3.5 h-3.5" />
                 </button>

                 <button
                   onClick={() => setSelectedExplanationRatioKey(null)}
                   className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 cursor-pointer shadow-xs"
                 >
                   Fechar Explicação
                 </button>
               </div>
             </div>
           </div>
         );
       })()}

     {/* ========================================================= */}
      {/* MODAL: REGISTRAR FOTO NO DIÁRIO (CÂMERA & GALERIA)        */}
      {/* ========================================================= */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">Anexar Foto no Diário Fotográfico</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Capture com a câmera do dispositivo ou selecione imagens da galeria.</p>
                </div>
              </div>
              <button 
                onClick={closeAddPhotoModal}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-Tabs: Câmera vs Galeria */}
            <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-2xl">
              <button
                onClick={() => {
                  setPhotoModalTab('camera');
                  startCamera('environment');
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  photoModalTab === 'camera'
                    ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>📷 Câmera ao Vivo</span>
              </button>

              <button
                onClick={() => {
                  stopCamera();
                  setPhotoModalTab('gallery');
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  photoModalTab === 'gallery'
                    ? 'bg-white dark:bg-zinc-800 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                <Image className="w-4 h-4" />
                <span>🖼️ Galeria do Dispositivo</span>
              </button>
            </div>

            {/* TAB CONTENT: CAMERA */}
            {photoModalTab === 'camera' && (
              <div className="space-y-4">
                {isCameraActive ? (
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-slate-800 group shadow-inner">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover"
                    />
                    {/* Leaf Framing Target Overlay */}
                    <div className="absolute inset-4 border-2 border-dashed border-emerald-400/50 rounded-2xl pointer-events-none flex items-center justify-center">
                      <span className="text-[10px] font-bold text-emerald-300 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-xs">
                        Posicione a folha / sintoma no centro
                      </span>
                    </div>

                    {/* Camera Control Bar */}
                    <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-4 px-4">
                      <button
                        type="button"
                        onClick={toggleCameraFacing}
                        className="p-3 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all border border-white/20 cursor-pointer"
                        title="Alternar Câmera (Frontal/Traseira)"
                      >
                        <FlipHorizontal className="w-5 h-5" />
                      </button>

                      <button
                        type="button"
                        onClick={captureCameraSnapshot}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border-2 border-white"
                      >
                        <Camera className="w-5 h-5" />
                        Tirar Foto
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-800 rounded-2xl text-center space-y-4">
                    <Camera className="w-12 h-12 mx-auto text-emerald-500/50" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-200">Usar Câmera do Dispositivo</h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
                        {cameraError || "Inicie a câmera ao vivo ou utilize a câmera nativa do seu celular."}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => startCamera('environment')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Ativar Câmera Web
                      </button>

                      <label className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 hover:opacity-90">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Abrir Câmera Nativa do Celular</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleGalleryFileSelect}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: GALLERY */}
            {photoModalTab === 'gallery' && (
              <div className="space-y-3">
                <label className="border-2 border-dashed border-slate-300 dark:border-zinc-800 hover:border-teal-500 dark:hover:border-teal-500 bg-slate-50 dark:bg-zinc-900/60 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 rounded-2xl p-8 text-center cursor-pointer transition-all block space-y-3">
                  <Upload className="w-10 h-10 mx-auto text-teal-500" />
                  <div>
                    <strong className="text-sm font-black text-slate-800 dark:text-zinc-200 block">Clique para Selecionar Fotos da Galeria</strong>
                    <span className="text-xs text-slate-500 dark:text-zinc-400">Formatos aceitos: JPG, PNG, WEBP (Selecione uma ou mais fotos)</span>
                  </div>
                  <span className="inline-block px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl shadow-xs">
                    Escolher Fotos no Aparelho
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* PREVIEW STRIP OF CAPTURED/UPLOADED PHOTOS */}
            {uploadedPhotos.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <span className="text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">
                  Fotos Capturadas para Envio ({uploadedPhotos.length}):
                </span>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {uploadedPhotos.map((url, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-500 flex-shrink-0 group">
                      <img src={url} alt={`Foto ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setUploadedPhotos(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 transition-all cursor-pointer"
                        title="Remover foto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* METADATA FORM */}
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">Vincular à Amostra Foliar:</label>
                  <select
                    value={targetSampleIdForPhoto}
                    onChange={e => setTargetSampleIdForPhoto(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  >
                    {samples.map(s => (
                      <option key={s.id} value={s.id}>
                        Amostra #{s.sampleCode} - {s.crop} ({s.fieldId})
                      </option>
                    ))}
                    <option value="new">+ Criar Novo Registro no Diário</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">Categoria / Tag da Foto:</label>
                  <select
                    value={photoFormTag}
                    onChange={e => setPhotoFormTag(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  >
                    <option value="Sintoma Visual">🟡 Sintoma Visual de Deficiência</option>
                    <option value="Evolução Pós-Folhar">🟢 Evolução Pós-Adubação Foliar</option>
                    <option value="Folhas Limpas">🟢 Nutrição Foliar Adequada</option>
                    <option value="Queima / Dano">🔴 Queima / Toxicidade / Fitotoxidez</option>
                    <option value="Sanidade / Pragas">🟣 Sanidade Foliar / Doenças</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">Observação Agronômica / Notas de Campo:</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Clorose amarelada observada nas folhas mais velhas no início do florescimento R1..."
                  value={photoFormNotes}
                  onChange={e => setPhotoFormNotes(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={closeAddPhotoModal}
                className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSavePhotosToDiary}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Salvar {uploadedPhotos.length > 0 ? `(${uploadedPhotos.length})` : ''} no Diário</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL LIGHTBOX: VISUALIZAÇÃO EM TELA CHEIA DA FOTO        */}
      {/* ========================================================= */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-4xl w-full bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-black text-sm">{lightboxPhoto.sampleCode} - {lightboxPhoto.crop}</h3>
                  <span className="text-[11px] text-zinc-400 font-mono">Data do Registro: {lightboxPhoto.date}</span>
                </div>
              </div>
              <button
                onClick={() => setLightboxPhoto(null)}
                className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 bg-black overflow-hidden flex items-center justify-center p-4 relative min-h-[300px]">
              <img 
                src={lightboxPhoto.url} 
                alt="Foto Foliar" 
                className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>

            <div className="p-4 bg-zinc-900 border-t border-zinc-800 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-zinc-300 italic max-w-xl">
                {lightboxPhoto.notes || 'Sem observações cadastradas.'}
              </p>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={lightboxPhoto.url}
                  download={`laudo-foliar-${lightboxPhoto.sampleCode}.jpg`}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Baixar
                </a>

                <button
                  onClick={() => handleDeletePhotoFromSample(lightboxPhoto.sampleId, lightboxPhoto.photoIndex)}
                  className="px-3 py-2 bg-red-900/60 hover:bg-red-800 text-red-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Excluir Foto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
