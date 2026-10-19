import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet-draw';
import {
  MapPin,
  Layers,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Boxes,
  Droplets,
  Sun,
  Moon,
  Eye,
  EyeOff,
  CheckCircle2,
  Trash2,
  Plus,
  Save,
  Download,
  Upload,
  Layers3,
  Map as MapIcon,
  Compass,
  FileSpreadsheet,
  RefreshCw,
  Info,
  Sliders,
  SlidersHorizontal,
  Check,
  Tag,
  MapPin as PinIcon,
  Search,
  Navigation,
  Activity,
  Leaf,
  Flame,
  BarChart3,
  Calendar,
  Zap,
  Maximize2,
  Calculator,
  Image as ImageIcon,
  FileImage,
  Percent,
  ChevronDown,
  ChevronUp,
  Edit3,
  Pencil,
  X,
  Send,
  Bot,
  Brain,
  BookOpen,
  HelpCircle,
  Filter,
} from 'lucide-react';
import {
  TraceabilityPlot,
  TraceabilityLot,
  TraceabilityProperty,
} from '../../types/traceability';
import { OverlayLayerItem, INITIAL_OVERLAY_LAYERS } from '../../types/geoprocessamentoLayers';
import { LayerManagerSidebar } from '../geoprocessamento/LayerManagerSidebar';
import {
  generateGeoJSONAllPlots,
  generateGeoJSONSinglePlot,
  generateKMLAllPlots,
  generateKMLSinglePlot,
  triggerFileDownload,
} from '../../utils/gisExportUtils';

interface LeafletMapProps {
  property: TraceabilityProperty;
  plots: TraceabilityPlot[];
  lots: TraceabilityLot[];
  onSavePlots?: (updatedPlots: TraceabilityPlot[]) => void;
  onSelectLot: (lot: TraceabilityLot) => void;
  onOpenPassport: (lot: TraceabilityLot) => void;
  activeSubTab?: string;
  setActiveSubTab?: (subTab: string) => void;
}

interface CustomPOI {
  id: string;
  name: string;
  type: 'soil' | 'water' | 'well' | 'trap' | 'station' | 'gate' | 'house' | 'nematode' | 'pest' | 'disease';
  lat: number;
  lng: number;
}

interface NdviPointSample {
  lat: number;
  lng: number;
  val: number;
  indexName: string;
  classification: string;
  color: string;
  biomass: string;
  chlorophyll: string;
  recommendation: string;
}

interface CustomRasterMetadata {
  plotId: string;
  fileName: string;
  fileSize: string;
  imageUrl: string;
  uploadedAt: string;
  sourceType: 'drone' | 'geotiff' | 'sentinel' | 'orthomosaic';
}

interface NdviAiAnalysisData {
  overallHealthScore: number;
  riskLevel: 'Baixo' | 'Moderado' | 'Alto' | 'Crítico';
  executiveSummary: string;
  vigorDistributionAnalysis: {
    highVigorAssessment: string;
    moderateVigorAssessment: string;
    stressSoilAssessment: string;
  };
  fieldActionPrescriptions: Array<{
    title: string;
    priority: 'Alta' | 'Média' | 'Baixa';
    description: string;
  }>;
  suggestedSamplingPois: Array<{
    name: string;
    type: 'nematode' | 'soil' | 'pest' | 'disease' | 'water' | 'well';
    reason: string;
  }>;
  followUpSuggestions: string[];
}

// Satellite Orbital Passes (Sentinel-2 L2A Multispectral)
const SATELLITE_PASSES = [
  { id: 'pass-1', date: '2026-09-20', label: '20/09/2026 (Recente - 0% Nuvens)', cloudCover: '0.0%', satellite: 'Sentinel-2 MSI L2A (10m)', meanFactor: 1.0 },
  { id: 'pass-2', date: '2026-09-15', label: '15/09/2026 (Pós-Adubação)', cloudCover: '1.2%', satellite: 'Sentinel-2 MSI L2A (10m)', meanFactor: 0.95 },
  { id: 'pass-3', date: '2026-09-05', label: '05/09/2026 (Florada)', cloudCover: '0.8%', satellite: 'Sentinel-2 MSI L2A (10m)', meanFactor: 0.88 },
  { id: 'pass-4', date: '2026-08-20', label: '20/08/2026 (Vegetativo Inicial)', cloudCover: '3.5%', satellite: 'Sentinel-2 MSI L2A (10m)', meanFactor: 0.68 },
];

export interface VegetationIndexDetail {
  id: string;
  label: string;
  symbol: string;
  formula: string;
  category: 'multispectral' | 'water_soil' | 'visible_rgb';
  categoryLabel: string;
  categoryIcon: string;
  desc: string; // Breve explicação agronômica
  whatItMeasures: string; // O que mede
  bestUse: string; // Fases / Aplicação ideal
  typicalRange: string; // Faixa típica e interpretação
}

export const VEGETATION_INDEX_DETAILS: Record<string, VegetationIndexDetail> = {
  ndvi: {
    id: 'ndvi',
    label: 'NDVI (Normalized Difference Vegetation Index)',
    symbol: 'NDVI',
    formula: '(NIR - RED) / (NIR + RED)',
    category: 'multispectral',
    categoryLabel: '🌱 Multiespectrais (NIR / Red)',
    categoryIcon: '🌱',
    desc: 'Índice padrão universal para mensuração de biomassa, atividade fotossintética e vigor vegetal geral.',
    whatItMeasures: 'Mede a relação entre a luz vermelha (absorvida pela clorofila) e o infravermelho próximo (refletido pelas células foliares).',
    bestUse: 'Monitoramento geral da lavoura, mapeamento de manchas de vigor e zonamento de produtividade.',
    typicalRange: '-1.0 a +1.0 (Valores de 0.6 a 0.85 indicam cultura saudável e densa).'
  },
  savi: {
    id: 'savi',
    label: 'SAVI (Soil-Adjusted Vegetation Index)',
    symbol: 'SAVI',
    formula: '((NIR - RED) / (NIR + RED + L)) * (1 + L)',
    category: 'multispectral',
    categoryLabel: '🌱 Multiespectrais (Com Ajuste de Solo L=0.5)',
    categoryIcon: '🌱',
    desc: 'Ajusta matematicamente a refletância para isolar o ruído e brilho do solo exposto nas fases iniciais do cultivo.',
    whatItMeasures: 'Vigor vegetal puro com neutralização do sinal do solo em coberturas foliares abaixo de 70%.',
    bestUse: 'Fases iniciais de crescimento (V1-V4), estande de emergência, hortaliças e plantios espaçados.',
    typicalRange: '-1.0 a +1.0 (Ideal para os primeiros 30 a 40 dias pós-emergência).'
  },
  evi: {
    id: 'evi',
    label: 'EVI (Enhanced Vegetation Index)',
    symbol: 'EVI',
    formula: '2.5 * (NIR - RED) / (NIR + 6*RED - 7.5*BLUE + 1)',
    category: 'multispectral',
    categoryLabel: '🌱 Multiespectrais (Canópias Densas)',
    categoryIcon: '🌱',
    desc: 'Otimizado para canópias densas de alta biomassa, corrigindo dispersões atmosféricas sem saturação do sinal.',
    whatItMeasures: 'Estrutura e volume do dossel vegetal e biomassa foliar em picos de desenvolvimento.',
    bestUse: 'Fases de pré-florescimento e enchimento de grãos (R1-R5), cana-de-açúcar, algodão e florestas.',
    typicalRange: '0.0 a +1.0 (Mantém diferenciação mesmo onde o NDVI comum satura acima de 0.85).'
  },
  evi2: {
    id: 'evi2',
    label: 'EVI2 (Enhanced Vegetation Index - 2 Bandas)',
    symbol: 'EVI2',
    formula: '2.5 * (NIR - RED) / (NIR + 2.4*RED + 1)',
    category: 'multispectral',
    categoryLabel: '🌱 Multiespectrais (2 Bandas sem Azul)',
    categoryIcon: '🌱',
    desc: 'Versão simplificada do EVI desenvolvida para sensores que não possuem o canal espectral Azul.',
    whatItMeasures: 'Índice de Área Foliar (IAF) e acúmulo de biomassa com alta precisão computacional.',
    bestUse: 'Satélites agrícolas (Sentinel, Planet) e câmeras multiespectrais com canais Red/NIR.',
    typicalRange: '0.0 a +1.0 (Excelente estabilidade em dosséis densos).'
  },
  ndre: {
    id: 'ndre',
    label: 'NDRE (Normalized Difference Red Edge)',
    symbol: 'NDRE',
    formula: '(NIR - RedEdge) / (NIR + RedEdge)',
    category: 'multispectral',
    categoryLabel: '🌱 Multiespectrais (Borda do Vermelho)',
    categoryIcon: '🌱',
    desc: 'Utiliza a banda Red Edge para penetrar nas camadas profundas do dossel e estimar a clorofila interna.',
    whatItMeasures: 'Teor foliar de clorofila no meio/baixo do dossel e saúde celular em plantas adultas.',
    bestUse: 'Culturas de grande porte (milho, cana, algodão, café) em fases reprodutivas e estimativa de maturação.',
    typicalRange: '0.0 a +0.9 (Sensível a alterações na saúde foliar interna antes de aparecerem no NDVI).'
  },
  gndvi: {
    id: 'gndvi',
    label: 'GNDVI (Green Normalized Difference Vegetation Index)',
    symbol: 'GNDVI',
    formula: '(NIR - GREEN) / (NIR + GREEN)',
    category: 'multispectral',
    categoryLabel: '🌱 Multiespectrais (Sensível a Nitrogênio)',
    categoryIcon: '🌱',
    desc: 'Substitui a banda vermelha pela verde, apresentando alta sensibilidade para absorção de Nitrogênio (N).',
    whatItMeasures: 'Concentração de clorofila funcional e acúmulo de Nitrogênio nas folhas.',
    bestUse: 'Prescrição de adubação nitrogenada de cobertura em taxa variável e detecção de clorose.',
    typicalRange: '0.0 a +0.95 (Identifica com precisão manchas com carência de N).'
  },
  wdrvi: {
    id: 'wdrvi',
    label: 'WDRVI (Wide Dynamic Range Vegetation Index)',
    symbol: 'WDRVI',
    formula: '(α*NIR - RED) / (α*NIR + RED) [α=0.1]',
    category: 'multispectral',
    categoryLabel: '🌱 Multiespectrais (Ampla Faixa Dinâmica)',
    categoryIcon: '🌱',
    desc: 'Amplia a faixa dinâmica do sinal em lavouras hiper-densas através da ponderação do canal NIR (α=0.1).',
    whatItMeasures: 'Variações sutis no índice de área foliar em dosséis totalmente fechados.',
    bestUse: 'Monitoramento de alta produtividade e talhões comerciais com teto produtivo elevado.',
    typicalRange: '-0.8 a +0.8 (Aumenta a resolução em até 300% para áreas de biomassa extrema).'
  },
  cigreen: {
    id: 'cigreen',
    label: 'CI-Green (Green Chlorophyll Index)',
    symbol: 'CI-Green',
    formula: '(NIR / GREEN) - 1',
    category: 'multispectral',
    categoryLabel: '🌱 Multiespectrais (Índice de Clorofila)',
    categoryIcon: '🌱',
    desc: 'Índice de relação direta linear com a concentração total de clorofila foliar na biomassa.',
    whatItMeasures: 'Quantidade absoluta de clorofila por centímetro quadrado de folha.',
    bestUse: 'Validação de nutrição foliar, monitoramento de micronutrientes e testes de eficiência de fertilizantes.',
    typicalRange: '0.0 a 10.0+ (Escala aberta highly responsiva a alterações foliares).'
  },
  ndwi: {
    id: 'ndwi',
    label: 'NDWI (Normalized Difference Water Index)',
    symbol: 'NDWI',
    formula: '(GREEN - NIR) / (GREEN + NIR)',
    category: 'water_soil',
    categoryLabel: '💧 Umidade Edáfica & Estresse Hídrico',
    categoryIcon: '💧',
    desc: 'Avalia o teor de água nos tecidos vegetais, identificando a turgescência foliar e o estresse por seca.',
    whatItMeasures: 'Hidratação das plantas e lâminas de água livres na superfície do terreno.',
    bestUse: 'Gestão de irrigação, detecção precoce de murcha fisiológica e mapeamento de drenagem.',
    typicalRange: '-1.0 a +1.0 (Valores positivos indicam bom status hídrico; negativos indicam déficit).'
  },
  ndsi: {
    id: 'ndsi',
    label: 'NDSI / NDMI (Normalized Difference Moisture Index)',
    symbol: 'NDSI',
    formula: '(GREEN - SWIR) / (GREEN + SWIR)',
    category: 'water_soil',
    categoryLabel: '💧 Umidade Edáfica & Estresse Hídrico',
    categoryIcon: '💧',
    desc: 'Mapeia a umidade retida na camada superficial do solo e nos resíduos de palhada.',
    whatItMeasures: 'Retenção hídrica edáfica no solo exposto e presença de orvalho/geada.',
    bestUse: 'Decisão do momento ideal de semeadura com base na umidade real do solo.',
    typicalRange: '-0.5 a +0.8 (Avalia a capacidade de retenção hídrica do solo).'
  },
  msavi2: {
    id: 'msavi2',
    label: 'MSAVI2 (Modified Soil Adjusted Index 2)',
    symbol: 'MSAVI2',
    formula: '(2*NIR + 1 - √((2*NIR+1)² - 8*(NIR-RED))) / 2',
    category: 'water_soil',
    categoryLabel: '💧 Umidade Edáfica & Estresse Hídrico',
    categoryIcon: '💧',
    desc: 'Calcula o ajuste do solo automaticamente sem necessidade de parametrizar o fator L.',
    whatItMeasures: 'Emergência de plântulas e cobertura vegetal inicial isolada da cor do solo.',
    bestUse: 'Mapeamento de falhas de plantio, estande inicial e germinação em lavouras recém-implantadas.',
    typicalRange: '0.0 a 1.0 (Sensibilidade máxima em fases iniciais).'
  },
  rgb: {
    id: 'rgb',
    label: 'Visível (RGB Cor Real)',
    symbol: 'RGB',
    formula: 'Red, Green, Blue',
    category: 'visible_rgb',
    categoryLabel: '📸 Sensores Visíveis & Drones (RGB)',
    categoryIcon: '📸',
    desc: 'Composição espectral em cores reais para inspeção visual e auditoria estética do talhão.',
    whatItMeasures: 'Visualização ortomosaica idêntica ao olho humano.',
    bestUse: 'Auditoria de estradas, drenos, manchas de erosão e confirmação de anomalias físicas.',
    typicalRange: 'Cor Real (RGB 24-bit).'
  },
  vari: {
    id: 'vari',
    label: 'VARI (Visible Atmospherically Resistant Index)',
    symbol: 'VARI',
    formula: '(GREEN - RED) / (GREEN + RED - BLUE)',
    category: 'visible_rgb',
    categoryLabel: '📸 Sensores Visíveis & Drones (RGB)',
    categoryIcon: '📸',
    desc: 'Mede a fração de cobertura vegetal utilizando apenas luz visível (RGB) com correção de iluminação.',
    whatItMeasures: 'Proporção de cobertura verde estimada com câmeras fotográficas convencionais.',
    bestUse: 'Voo de drones de baixo custo (Phantom, Mavic, Mini) para estimativa de vigor sem sensor infravermelho.',
    typicalRange: '-0.2 a +0.8 (Muito útil para mapeamento de vigor com câmeras padrão).'
  },
  gli: {
    id: 'gli',
    label: 'GLI (Green Leaf Index)',
    symbol: 'GLI',
    formula: '(2*GREEN - RED - BLUE) / (2*GREEN + RED + BLUE)',
    category: 'visible_rgb',
    categoryLabel: '📸 Sensores Visíveis & Drones (RGB)',
    categoryIcon: '📸',
    desc: 'Mede a proporção de folhas verdes vivas contra fundo de matéria seca, solo nu e palhada.',
    whatItMeasures: 'Pigmentação verde ativa no espectro visível.',
    bestUse: 'Mapeamento de plantas daninhas verdejantes sobre palhada seca de pré-plantio.',
    typicalRange: '-1.0 a +1.0 (Valores > 0.15 indicam folhagem verde viva).'
  },
  tgi: {
    id: 'tgi',
    label: 'TGI (Triangular Greenness Index)',
    symbol: 'TGI',
    formula: 'GREEN - 0.39*RED - 0.61*BLUE',
    category: 'visible_rgb',
    categoryLabel: '📸 Sensores Visíveis & Drones (RGB)',
    categoryIcon: '📸',
    desc: 'Área triangular de absorção no espectro visível com alta correlação com a clorofila foliar.',
    whatItMeasures: 'Teor relativo de clorofila utilizando apenas imagens da câmera visível RGB.',
    bestUse: 'Diagnóstico rápido de clorose e vigor em campo usando imagens de smartphones e drones.',
    typicalRange: 'Valores maiores refletem maior teor de clorofila.'
  }
};

export const TraceabilityLeafletMap: React.FC<LeafletMapProps> = ({
  property,
  plots: initialPlots,
  lots,
  onSavePlots,
  onSelectLot,
  onOpenPassport,
  activeSubTab,
  setActiveSubTab,
}) => {
  // State for plots (talhões)
  const [plots, setPlots] = useState<TraceabilityPlot[]>(() => {
    return initialPlots.map(p => {
      if (!p.croquiData) {
        const lat = p.latitude || property.latitude;
        const lng = p.longitude || property.longitude;
        const size = 0.0004;
        const coords = [
          { lat: lat - size, lng: lng - size },
          { lat: lat - size, lng: lng + size },
          { lat: lat + size, lng: lng + size },
          { lat: lat + size, lng: lng - size },
        ];
        return {
          ...p,
          croquiData: JSON.stringify(coords),
        };
      }
      return p;
    });
  });

  // Active Map Layer type
  const [mapLayer, setMapLayer] = useState<'osm' | 'satellite' | 'topography' | 'hot'>('satellite');

  // Selected Plot & Lot for inspection
  const [selectedPlot, setSelectedPlot] = useState<TraceabilityPlot>(plots[0]);
  const [activeTabInternal, setActiveTabInternal] = useState<'list' | 'draw' | 'pois' | 'ndvi' | 'layers'>('list');

  // Multi-layer Overlay Management (Persistence + Drag-and-drop visual priority)
  const [overlayLayers, setOverlayLayers] = useState<OverlayLayerItem[]>(() => {
    const saved = localStorage.getItem('geaagro_multilayer_stack');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_OVERLAY_LAYERS;
  });

  const handleUpdateLayers = (updated: OverlayLayerItem[]) => {
    setOverlayLayers(updated);
    try {
      localStorage.setItem('geaagro_multilayer_stack', JSON.stringify(updated));
    } catch {}
  };

  const handleResetLayers = () => {
    setOverlayLayers(INITIAL_OVERLAY_LAYERS);
    try {
      localStorage.setItem('geaagro_multilayer_stack', JSON.stringify(INITIAL_OVERLAY_LAYERS));
    } catch {}
  };

  // Synchronize internal activeTab with activeSubTab prop from Navbar
  useEffect(() => {
    if (activeSubTab) {
      if (activeSubTab === 'draw' || activeSubTab === 'delimitar') {
        setActiveTabInternal('draw');
      } else if (activeSubTab === 'ndvi' || activeSubTab === 'raster') {
        setActiveTabInternal('ndvi');
      } else if (activeSubTab === 'pois' || activeSubTab === 'marcadores') {
        setActiveTabInternal('pois');
      } else if (activeSubTab === 'layers' || activeSubTab === 'camadas') {
        setActiveTabInternal('layers');
      } else if (activeSubTab === 'list' || activeSubTab === 'talhoes') {
        setActiveTabInternal('list');
      }
    }
  }, [activeSubTab]);

  const activeTab = activeTabInternal;
  const setActiveTab = (tab: 'list' | 'draw' | 'pois' | 'ndvi' | 'layers') => {
    setActiveTabInternal(tab);
    if (setActiveSubTab) {
      setActiveSubTab(tab);
    }
  };

  // NDVI & Satellite Remote Sensing States
  const [showNdvi, setShowNdvi] = useState<boolean>(true);
  const [isNdviPanelExpanded, setIsNdviPanelExpanded] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [ndviOpacity, setNdviOpacity] = useState<number>(0.75);
  const [ndviIndexType, setNdviIndexType] = useState<
    | 'ndvi'
    | 'savi'
    | 'evi'
    | 'ndre'
    | 'gndvi'
    | 'ndwi'
    | 'ndsi'
    | 'msavi2'
    | 'rgb'
    | 'evi2'
    | 'wdrvi'
    | 'cigreen'
    | 'vari'
    | 'gli'
    | 'tgi'
  >('ndvi');
  const [selectedPassId, setSelectedPassId] = useState<string>('pass-1');
  const [pointSample, setPointSample] = useState<NdviPointSample | null>(null);
  const [isCalculatingIndex, setIsCalculatingIndex] = useState<boolean>(false);
  const [calculationFeedback, setCalculationFeedback] = useState<string | null>(null);

  // Vegetation Index Guide Modal States
  const [showIndexGuideModal, setShowIndexGuideModal] = useState<boolean>(false);
  const [indexSearchQuery, setIndexSearchQuery] = useState<string>('');
  const [indexCategoryFilter, setIndexCategoryFilter] = useState<'all' | 'multispectral' | 'water_soil' | 'visible_rgb'>('all');

  // Custom Imported Raster Images by Plot ID
  const [customRasters, setCustomRasters] = useState<Record<string, CustomRasterMetadata>>(() => {
    const saved = localStorage.getItem('geaagro_custom_ndvi_rasters');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {};
  });

  // Drawing state
  const [isDrawing, setIsDrawing] = useState<boolean>(() => {
    const saved = localStorage.getItem('geaagro_polygon_is_drawing');
    return saved === 'true';
  });
  const [drawVertices, setDrawVertices] = useState<{ lat: number; lng: number }[]>(() => {
    const saved = localStorage.getItem('geaagro_polygon_draw_vertices');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });
  const [drawArea, setDrawArea] = useState<number>(0);
  const [selectedPlotToDelimit, setSelectedPlotToDelimit] = useState<string>(() => {
    const saved = localStorage.getItem('geaagro_polygon_selected_plot_id');
    if (saved && plots.some(p => p.id === saved)) {
      return saved;
    }
    return plots[0]?.id || '__new_plot__';
  });
  const [newPlotCustomName, setNewPlotCustomName] = useState<string>('');
  const [mapToast, setMapToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showMapToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setMapToast({ message, type });
    setTimeout(() => setMapToast(null), 4000);
  };

  // POI points of interest state
  const [pois, setPois] = useState<CustomPOI[]>(() => {
    const saved = localStorage.getItem('geaagro_custom_pois');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      { id: 'poi-1', name: 'Poço Artesiano Central', type: 'well', lat: -22.3705, lng: -46.9425 },
      { id: 'poi-2', name: 'Estação Metereológica Davis', type: 'station', lat: -22.3715, lng: -46.9410 },
      { id: 'poi-3', name: 'Ponto Amostragem de Solo T1', type: 'soil', lat: -22.3712, lng: -46.9419 },
      { id: 'poi-4', name: 'Armadilha MIP Reale', type: 'trap', lat: -22.3725, lng: -46.9431 },
    ];
  });

  // State for new POI creation
  const [newPoiName, setNewPoiName] = useState<string>('');
  const [newPoiType, setNewPoiType] = useState<CustomPOI['type']>('soil');
  const [newPoiCoords, setNewPoiCoords] = useState<{ lat: number; lng: number } | null>(null);

  // KML/GeoJSON import paste block
  const [coordPasteText, setCoordPasteText] = useState<string>('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Search and GPS states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [gpsActive, setGpsActive] = useState<boolean>(false);

  // GIS & Interoperability Export States
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  // Plot Edit & Delete States
  const [editingPlot, setEditingPlot] = useState<TraceabilityPlot | null>(null);
  const [plotFormData, setPlotFormData] = useState<{
    code: string;
    name: string;
    areaHa: number;
    currentCrop: string;
    currentCultivar: string;
    soilType: string;
    irrigationSystem: string;
    structureType: string;
  }>({
    code: '',
    name: '',
    areaHa: 0,
    currentCrop: '',
    currentCultivar: '',
    soilType: '',
    irrigationSystem: 'sequeiro',
    structureType: 'campo_aberto',
  });

  // Gemini AI NDVI Decision Assistant States
  const [isAnalyzingNdviAi, setIsAnalyzingNdviAi] = useState<boolean>(false);
  const [ndviAiData, setNdviAiData] = useState<NdviAiAnalysisData | null>(null);
  const [ndviAiError, setNdviAiError] = useState<string | null>(null);
  const [showNdviAiModal, setShowNdviAiModal] = useState<boolean>(false);
  const [ndviAiFollowUpInput, setNdviAiFollowUpInput] = useState<string>('');

  // Map element references
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const drawingPolylineRef = useRef<L.Polyline | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const currentMarkersRef = useRef<L.Layer[]>([]);
  const ndviLayersRef = useRef<L.ImageOverlay[]>([]);
  const prevSelectedPlotIdRef = useRef<string | undefined>(undefined);

  // Coordinate tracking for mouse hover
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Save custom POIs to localStorage
  useEffect(() => {
    localStorage.setItem('geaagro_custom_pois', JSON.stringify(pois));
  }, [pois]);

  // Auto-save polygon drawing state and coordinates to localStorage
  useEffect(() => {
    localStorage.setItem('geaagro_polygon_draw_vertices', JSON.stringify(drawVertices));
  }, [drawVertices]);

  useEffect(() => {
    localStorage.setItem('geaagro_polygon_is_drawing', isDrawing ? 'true' : 'false');
  }, [isDrawing]);

  useEffect(() => {
    localStorage.setItem('geaagro_polygon_selected_plot_id', selectedPlotToDelimit);
  }, [selectedPlotToDelimit]);

  // Save custom Rasters to localStorage
  useEffect(() => {
    localStorage.setItem('geaagro_custom_ndvi_rasters', JSON.stringify(customRasters));
  }, [customRasters]);

  // Inject Leaflet & Leaflet-Draw Stylesheets dynamically
  useEffect(() => {
    const linkLeaflet = document.createElement('link');
    linkLeaflet.rel = 'stylesheet';
    linkLeaflet.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(linkLeaflet);

    const linkDraw = document.createElement('link');
    linkDraw.rel = 'stylesheet';
    linkDraw.href = 'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css';
    document.head.appendChild(linkDraw);

    // Custom CSS to fix overlap with menus & style Leaflet Draw toolbar
    const style = document.createElement('style');
    style.id = 'leaflet-custom-zindex-fix';
    style.textContent = `
      .leaflet-container {
        z-index: 1 !important;
      }
      .leaflet-pane {
        z-index: 1 !important;
      }
      .leaflet-top, .leaflet-bottom {
        z-index: 10 !important;
      }
      .leaflet-tooltip-pane {
        z-index: 300 !important;
      }
      .leaflet-popup-pane {
        z-index: 400 !important;
      }
      .leaflet-control {
        z-index: 10 !important;
      }
      /* Leaflet.Draw Toolbar Modernization */
      .leaflet-draw-toolbar {
        border-radius: 12px !important;
        overflow: hidden !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        border: 1px solid rgba(0, 0, 0, 0.1) !important;
      }
      .leaflet-draw-toolbar a {
        background-color: #ffffff !important;
        transition: background 0.2s ease;
      }
      .leaflet-draw-toolbar a:hover {
        background-color: #f1f5f9 !important;
      }
      /* Dark Theme Leaflet Controls and Overlays */
      .dark .leaflet-draw-toolbar {
        border-color: rgba(255, 255, 255, 0.15) !important;
      }
      .dark .leaflet-draw-toolbar a {
        background-color: #18181b !important;
        color: #f4f4f5 !important;
        border-color: #27272a !important;
      }
      .dark .leaflet-draw-toolbar a:hover {
        background-color: #27272a !important;
      }
      .dark .leaflet-bar a {
        background-color: #18181b !important;
        color: #f4f4f5 !important;
        border-bottom-color: #27272a !important;
      }
      .dark .leaflet-bar a:hover {
        background-color: #27272a !important;
      }
      .dark .leaflet-popup-content-wrapper, .dark .leaflet-popup-tip {
        background-color: #18181b !important;
        color: #f4f4f5 !important;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5) !important;
      }
      .dark .leaflet-tooltip {
        background-color: #18181b !important;
        color: #f4f4f5 !important;
        border: 1px solid #27272a !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
      }
      .dark .leaflet-container {
        background-color: #09090b !important;
      }
      .dark .leaflet-control-attribution {
        background-color: rgba(24, 24, 27, 0.8) !important;
        color: #a1a1aa !important;
      }
      .dark .leaflet-control-attribution a {
        color: #34d399 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(linkLeaflet);
      document.head.removeChild(linkDraw);
      const existingStyle = document.getElementById('leaflet-custom-zindex-fix');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  // Compute Shoelace Area for Geodetic coordinates
  const calculateAreaInHectares = (coords: { lat: number; lng: number }[]): number => {
    if (coords.length < 3) return 0;
    
    const avgLat = coords.reduce((sum, c) => sum + c.lat, 0) / coords.length;
    const latToMeters = 111320;
    const lngToMeters = 111320 * Math.cos((avgLat * Math.PI) / 180);

    const centerLat = avgLat;
    const centerLng = coords.reduce((sum, c) => sum + c.lng, 0) / coords.length;

    const points = coords.map(c => ({
      x: (c.lng - centerLng) * lngToMeters,
      y: (c.lat - centerLat) * latToMeters,
    }));

    let area = 0;
    const n = points.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    area = Math.abs(area) / 2.0;

    const hectares = area / 10000;
    return parseFloat(hectares.toFixed(2));
  };

  // Recalculate area whenever drawn vertices change
  useEffect(() => {
    if (drawVertices.length >= 3) {
      setDrawArea(calculateAreaInHectares(drawVertices));
    } else {
      setDrawArea(0);
    }
  }, [drawVertices]);

  // Linear RGB Color Interpolation helper for smooth continuous colormaps
  const lerpColor = (c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }, t: number) => {
    const clampT = Math.max(0, Math.min(1, t));
    return {
      r: Math.round(c1.r + (c2.r - c1.r) * clampT),
      g: Math.round(c1.g + (c2.g - c1.g) * clampT),
      b: Math.round(c1.b + (c2.b - c1.b) * clampT),
    };
  };

  // Continuous Colormap Function for Remote Sensing Spectral Indices (-1.0 to +1.0)
  const getIndexColor = (val: number, indexType: string): { r: number; g: number; b: number; hex: string } => {
    // NDWI (Normalized Difference Water Index - Hydration & Water Content)
    if (indexType === 'ndwi') {
      const cDry = { r: 215, g: 48, b: 39 };     // Deficiência Hídrica (#d73027)
      const cMod = { r: 254, g: 224, b: 144 };   // Umidade Moderada (#fee090)
      const cWet = { r: 145, g: 191, b: 219 };   // Ótimo Turgor (#91bfdb)
      const cWater = { r: 49, g: 54, b: 149 };   // Plena Turgescência / Água (#313695)

      let c: { r: number; g: number; b: number };
      if (val < 0.25) {
        c = lerpColor(cDry, cMod, val / 0.25);
      } else if (val < 0.60) {
        c = lerpColor(cMod, cWet, (val - 0.25) / 0.35);
      } else {
        c = lerpColor(cWet, cWater, (val - 0.60) / 0.40);
      }
      const hex = `#${((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1)}`;
      return { ...c, hex };
    }

    // NDSI (Normalized Difference Snow & Soil Moisture Index)
    if (indexType === 'ndsi') {
      const cLow = { r: 230, g: 120, b: 50 };    // Solo Seco (#e67832)
      const cMid = { r: 220, g: 220, b: 130 };   // Umidade Normal (#dcdc82)
      const cHigh = { r: 64, g: 196, b: 255 };   // Elevada Umidade / Geada (#40c4ff)
      const cSaturated = { r: 20, g: 100, b: 220 }; // Saturação Edáfica (#1464dc)

      let c: { r: number; g: number; b: number };
      if (val < 0.30) {
        c = lerpColor(cLow, cMid, val / 0.30);
      } else if (val < 0.65) {
        c = lerpColor(cMid, cHigh, (val - 0.30) / 0.35);
      } else {
        c = lerpColor(cHigh, cSaturated, (val - 0.65) / 0.35);
      }
      const hex = `#${((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1)}`;
      return { ...c, hex };
    }

    // MSAVI2 (Modified Soil Adjusted Vegetation Index 2)
    if (indexType === 'msavi2') {
      const cSoil = { r: 180, g: 110, b: 60 };   // Solo Exposto Sem Ruído (#b46e3c)
      const cSprout = { r: 230, g: 210, b: 80 }; // Brotação / Emergência (#e6d250)
      const cVeg = { r: 40, g: 180, b: 80 };     // Cobertura Ativa (#28b450)
      const cDense = { r: 10, g: 120, b: 40 };   // Fechamento Dossel (#0a7828)

      let c: { r: number; g: number; b: number };
      if (val < 0.25) {
        c = lerpColor(cSoil, cSprout, val / 0.25);
      } else if (val < 0.60) {
        c = lerpColor(cSprout, cVeg, (val - 0.25) / 0.35);
      } else {
        c = lerpColor(cVeg, cDense, (val - 0.60) / 0.40);
      }
      const hex = `#${((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1)}`;
      return { ...c, hex };
    }

    // Visível (RGB True Color Aerial Composite)
    if (indexType === 'rgb') {
      const cSoil = { r: 140, g: 105, b: 70 };      // Solo (#8c6946)
      const cLightVeg = { r: 110, g: 165, b: 75 };  // Vegetação Clara (#6ea54b)
      const cDarkVeg = { r: 45, g: 115, b: 45 };    // Vegetação Densa (#2d732d)

      let c: { r: number; g: number; b: number };
      if (val < 0.40) {
        c = lerpColor(cSoil, cLightVeg, val / 0.40);
      } else {
        c = lerpColor(cLightVeg, cDarkVeg, (val - 0.40) / 0.60);
      }
      const hex = `#${((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1)}`;
      return { ...c, hex };
    }

    // EVI2 (Enhanced Vegetation Index 2-band)
    if (indexType === 'evi2') {
      const cSoil = { r: 215, g: 48, b: 39 };
      const cLow = { r: 253, g: 174, b: 97 };
      const cMod = { r: 166, g: 217, b: 106 };
      const cHigh = { r: 26, g: 152, b: 80 };

      let c: { r: number; g: number; b: number };
      if (val < 0.25) c = lerpColor(cSoil, cLow, val / 0.25);
      else if (val < 0.60) c = lerpColor(cLow, cMod, (val - 0.25) / 0.35);
      else c = lerpColor(cMod, cHigh, (val - 0.60) / 0.40);
      const hex = `#${((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1)}`;
      return { ...c, hex };
    }

    // WDRVI (Wide Dynamic Range Vegetation Index)
    if (indexType === 'wdrvi') {
      const cLow = { r: 215, g: 48, b: 39 };
      const cMid = { r: 240, g: 210, b: 50 };
      const cDense = { r: 20, g: 140, b: 60 };

      let c: { r: number; g: number; b: number };
      if (val < 0.40) c = lerpColor(cLow, cMid, val / 0.40);
      else c = lerpColor(cMid, cDense, (val - 0.40) / 0.60);
      const hex = `#${((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1)}`;
      return { ...c, hex };
    }

    // Clorofila Green (CI Green / Index Clorofila Verde)
    if (indexType === 'cigreen') {
      const cLowChl = { r: 250, g: 190, b: 80 };   // Clorofila baixa / Amarelamento
      const cModChl = { r: 130, g: 200, b: 80 };   // Clorofila média
      const cHighChl = { r: 15, g: 110, b: 45 };   // Clorofila elevada / Pleno N

      let c: { r: number; g: number; b: number };
      if (val < 0.45) c = lerpColor(cLowChl, cModChl, val / 0.45);
      else c = lerpColor(cModChl, cHighChl, (val - 0.45) / 0.55);
      const hex = `#${((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1)}`;
      return { ...c, hex };
    }

    // VARI (Visible Atmospherically Resistant Index)
    if (indexType === 'vari') {
      const cLow = { r: 190, g: 90, b: 50 };
      const cMid = { r: 210, g: 200, b: 90 };
      const cHigh = { r: 40, g: 170, b: 70 };

      let c: { r: number; g: number; b: number };
      if (val < 0.35) c = lerpColor(cLow, cMid, val / 0.35);
      else c = lerpColor(cMid, cHigh, (val - 0.35) / 0.65);
      const hex = `#${((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1)}`;
      return { ...c, hex };
    }

    // GLI (Green Leaf Index)
    if (indexType === 'gli') {
      const cSoil = { r: 200, g: 110, b: 70 };
      const cVeg = { r: 150, g: 210, b: 90 };
      const cHigh = { r: 25, g: 135, b: 50 };

      let c: { r: number; g: number; b: number };
      if (val < 0.35) c = lerpColor(cSoil, cVeg, val / 0.35);
      else c = lerpColor(cVeg, cHigh, (val - 0.35) / 0.65);
      const hex = `#${((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1)}`;
      return { ...c, hex };
    }

    // TGI (Triangular Greenness Index)
    if (indexType === 'tgi') {
      const cLow = { r: 220, g: 140, b: 60 };
      const cMid = { r: 160, g: 210, b: 80 };
      const cHigh = { r: 15, g: 125, b: 55 };

      let c: { r: number; g: number; b: number };
      if (val < 0.40) c = lerpColor(cLow, cMid, val / 0.40);
      else c = lerpColor(cMid, cHigh, (val - 0.40) / 0.60);
      const hex = `#${((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1)}`;
      return { ...c, hex };
    }

    // Default Vegetation Palette (NDVI, SAVI, EVI, NDRE, GNDVI - RdYlGn)
    const cWater = { r: 43, g: 131, b: 186 };  // < 0.0 Water / Shadow (#2b83ba)
    const cSoil  = { r: 215, g: 48, b: 39 };   // < 0.10 Bare Soil / Unvegetated (#d73027)
    const cEmerg = { r: 244, g: 109, b: 67 };  // 0.10 Weak vegetation / Emergence (#f46d43)
    const cWeak  = { r: 253, g: 174, b: 97 };  // 0.30 Low-moderate vegetation (#fdae61)
    const cMod   = { r: 166, g: 217, b: 106 }; // 0.50 Moderate canopy (#a6d96a)
    const cDense = { r: 102, g: 189, b: 99 };  // 0.70 Dense vegetation (#66bd63)
    const cHigh  = { r: 26, g: 152, b: 80 };   // 1.00 High photosynthetic activity (#1a9850)

    let c: { r: number; g: number; b: number };

    if (val < 0.0) {
      c = cWater;
    } else if (val < 0.10) {
      const t = Math.max(0, val) / 0.10;
      c = lerpColor(cWater, cSoil, t);
    } else if (val < 0.30) {
      const t = (val - 0.10) / 0.20;
      c = lerpColor(cEmerg, cWeak, t);
    } else if (val < 0.50) {
      const t = (val - 0.30) / 0.20;
      c = lerpColor(cWeak, cMod, t);
    } else if (val < 0.70) {
      const t = (val - 0.50) / 0.20;
      c = lerpColor(cMod, cDense, t);
    } else {
      const t = (val - 0.70) / 0.30;
      c = lerpColor(cDense, cHigh, t);
    }

    const hex = `#${((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1)}`;
    return { ...c, hex };
  };

  // Helper: Ray-casting Point-in-Polygon test for exact canvas clipping
  const isPointInPolygon = (x: number, y: number, poly: { x: number; y: number }[]): boolean => {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i].x, yi = poly[i].y;
      const xj = poly[j].x, yj = poly[j].y;
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi || 0.0001) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // Generate High-Resolution Vegetation Index Raster Overlay for a Plot
  const generatePlotNdviRaster = (
    vertices: { lat: number; lng: number }[],
    plot: TraceabilityPlot,
    factor: number = 1.0,
    indexType:
      | 'ndvi'
      | 'savi'
      | 'evi'
      | 'ndre'
      | 'gndvi'
      | 'ndwi'
      | 'ndsi'
      | 'msavi2'
      | 'rgb'
      | 'evi2'
      | 'wdrvi'
      | 'cigreen'
      | 'vari'
      | 'gli'
      | 'tgi' = 'ndvi'
  ) => {
    if (vertices.length < 3) return null;

    const lats = vertices.map(v => v.lat);
    const lngs = vertices.map(v => v.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const width = 256;
    const height = 256;

    // Transform geodetic (lat, lng) to canvas pixels (x, y)
    const toPx = (lat: number, lng: number) => {
      const x = ((lng - minLng) / (maxLng - minLng || 0.0001)) * width;
      const y = ((maxLat - lat) / (maxLat - minLat || 0.0001)) * height;
      return { x, y };
    };

    // Calculate pixel coordinates of plot polygon boundary
    const polyPx = vertices.map(v => toPx(v.lat, v.lng));

    // Offscreen Canvas for raw raster buffer pixel rendering
    const offCanvas = document.createElement('canvas');
    offCanvas.width = width;
    offCanvas.height = height;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return null;

    // Check if there is an imported custom raster image
    const customRaster = customRasters[plot.id];

    // Deterministic agronomic seed based on plot code and area
    const seed = (plot.code.charCodeAt(0) || 65) + (plot.areaHa || 5);

    // Index specific base calibration
    let indexMultiplier = 1.0;
    if (indexType === 'savi') indexMultiplier = 0.94;
    else if (indexType === 'evi') indexMultiplier = 1.06;
    else if (indexType === 'ndre') indexMultiplier = 0.88;
    else if (indexType === 'gndvi') indexMultiplier = 0.97;
    else if (indexType === 'ndwi') indexMultiplier = 0.82;
    else if (indexType === 'ndsi') indexMultiplier = 0.78;
    else if (indexType === 'msavi2') indexMultiplier = 1.01;
    else if (indexType === 'rgb') indexMultiplier = 1.0;
    else if (indexType === 'evi2') indexMultiplier = 1.04;
    else if (indexType === 'wdrvi') indexMultiplier = 0.90;
    else if (indexType === 'cigreen') indexMultiplier = 0.96;
    else if (indexType === 'vari') indexMultiplier = 0.86;
    else if (indexType === 'gli') indexMultiplier = 0.88;
    else if (indexType === 'tgi') indexMultiplier = 0.84;

    const baseMean = (0.76 + ((seed % 7) * 0.012)) * factor * indexMultiplier;

    // Define 3 realistic agronomic stress centers (reboleiras / nematoides / falhas de plantio)
    const reboleira1 = {
      x: 0.32 + ((seed * 17) % 35) / 100,
      y: 0.38 + ((seed * 23) % 35) / 100,
      r: 0.12 + ((seed * 7) % 8) / 100,
      drop: 0.45, // Nematode / compaction drop
    };
    const reboleira2 = {
      x: 0.65 + ((seed * 11) % 25) / 100,
      y: 0.70 + ((seed * 13) % 20) / 100,
      r: 0.09 + ((seed * 5) % 6) / 100,
      drop: 0.38, // Soil erosion / water deficit drop
    };
    const reboleira3 = {
      x: 0.20 + ((seed * 29) % 20) / 100,
      y: 0.75 + ((seed * 31) % 18) / 100,
      r: 0.07 + ((seed * 3) % 5) / 100,
      drop: 0.30, // Initial pest infestation
    };

    const imgData = offCtx.createImageData(width, height);
    const data = imgData.data;

    let sumVal = 0;
    let minVal = 1.0;
    let maxVal = -1.0;
    let highCount = 0;
    let modCount = 0;
    let stressCount = 0;
    let insidePixels = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        // Strict Point-in-Polygon Check: Guarantee ZERO pixel leaks outside boundary
        const isInside = isPointInPolygon(x + 0.5, y + 0.5, polyPx);

        if (!isInside) {
          data[idx] = 0;
          data[idx + 1] = 0;
          data[idx + 2] = 0;
          data[idx + 3] = 0; // Fully transparent outside vector boundary
          continue;
        }

        const nx = x / width;
        const ny = y / height;

        // 1. Natural canopy spatial gradient
        const spatialGradient = Math.sin(nx * 3.14 + seed) * 0.05 + Math.cos(ny * 3.14 + seed * 1.3) * 0.04;

        // 2. High-frequency planting rows & machine pass texture
        const rowOrientation = 0.6; // Angle of planting rows
        const rowPos = (nx * Math.cos(rowOrientation) + ny * Math.sin(rowOrientation)) * 75;
        const rowTexture = Math.sin(rowPos) * 0.025;

        // 3. Reboleiras & Localized Agronomic Stress Spots (Gaussian decay)
        const d1 = Math.hypot(nx - reboleira1.x, ny - reboleira1.y);
        const stress1 = d1 < reboleira1.r ? Math.pow(1 - d1 / reboleira1.r, 1.8) * reboleira1.drop : 0;

        const d2 = Math.hypot(nx - reboleira2.x, ny - reboleira2.y);
        const stress2 = d2 < reboleira2.r ? Math.pow(1 - d2 / reboleira2.r, 1.8) * reboleira2.drop : 0;

        const d3 = Math.hypot(nx - reboleira3.x, ny - reboleira3.y);
        const stress3 = d3 < reboleira3.r ? Math.pow(1 - d3 / reboleira3.r, 1.8) * reboleira3.drop : 0;

        // 4. Boundary headland / border dry-down
        const borderDist = Math.min(nx, 1 - nx, ny, 1 - ny);
        const headlandPenalty = borderDist < 0.08 ? (0.08 - borderDist) * 0.6 : 0;

        let pixelVal = baseMean + spatialGradient + rowTexture - stress1 - stress2 - stress3 - headlandPenalty;
        pixelVal = Math.max(0.08, Math.min(0.96, pixelVal));

        const c = getIndexColor(pixelVal, indexType);

        data[idx] = c.r;
        data[idx + 1] = c.g;
        data[idx + 2] = c.b;
        data[idx + 3] = 230; // Alpha inside plot

        sumVal += pixelVal;
        if (pixelVal < minVal) minVal = pixelVal;
        if (pixelVal > maxVal) maxVal = pixelVal;

        if (pixelVal >= 0.65) highCount++;
        else if (pixelVal >= 0.38) modCount++;
        else stressCount++;

        insidePixels++;
      }
    }

    offCtx.putImageData(imgData, 0, 0);

    // Main Canvas with Polygon Path Clip Mask + Offscreen Draw
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(polyPx[0].x, polyPx[0].y);
    for (let i = 1; i < polyPx.length; i++) {
      ctx.lineTo(polyPx[i].x, polyPx[i].y);
    }
    ctx.closePath();
    ctx.clip(); // Hard vector clip mask
    ctx.drawImage(offCanvas, 0, 0);

    const total = insidePixels || 1;
    const stats = {
      meanVal: parseFloat((sumVal / total).toFixed(2)),
      minVal: parseFloat(minVal.toFixed(2)),
      maxVal: parseFloat(maxVal.toFixed(2)),
      highVigorPct: Math.round((highCount / total) * 100),
      moderateVigorPct: Math.round((modCount / total) * 100),
      stressSoilPct: Math.round((stressCount / total) * 100),
    };

    return {
      dataUrl: customRaster?.imageUrl || canvas.toDataURL(),
      bounds: L.latLngBounds([minLat, minLng], [maxLat, maxLng]),
      stats,
      sampleAt: (lat: number, lng: number): NdviPointSample => {
        const nx = (lng - minLng) / (maxLng - minLng || 0.0001);
        const ny = (maxLat - lat) / (maxLat - minLat || 0.0001);
        const wave = Math.sin(nx * 12 + seed) * 0.08 + Math.cos(ny * 12 + seed) * 0.07;
        let val = Math.max(0.15, Math.min(0.95, baseMean + wave));
        val = parseFloat(val.toFixed(2));
        
        let classification = 'Alto Vigor Vegetativo';
        let recommendation = 'Canópia com alta atividade fotossintética. Manter lâmina hídrica e nutrição padrão.';
        let biomass = '5.4 t/ha';
        let chlorophyll = '48.2 SPAD';

        if (indexType === 'ndwi') {
          if (val < 0.35) {
            classification = 'Deficiência Hídrica / Estresse Hídrico';
            recommendation = 'Teor de água foliar reduzido. Avaliar turno de rega e funcionamento dos pivôs/aspersores.';
            biomass = '2.1 t/ha';
            chlorophyll = '30.2 SPAD';
          } else if (val < 0.60) {
            classification = 'Turgescência Moderada';
            recommendation = 'Teor de umidade foliar satisfatório no dossel vegetal.';
            biomass = '4.0 t/ha';
            chlorophyll = '41.0 SPAD';
          } else {
            classification = 'Alta Hidratação / Plena Turgescência';
            recommendation = 'Excelente turgor foliar e elevado conteúdo hídrico no tecido vegetal.';
            biomass = '5.8 t/ha';
            chlorophyll = '51.5 SPAD';
          }
        } else if (indexType === 'ndsi') {
          if (val < 0.35) {
            classification = 'Superfície Seca / Baixa Umidade Edáfica';
            recommendation = 'Solo com reduzida retenção de água ou alta evapotranspiração.';
            biomass = '1.8 t/ha';
            chlorophyll = '28.0 SPAD';
          } else if (val < 0.60) {
            classification = 'Umidade Edáfica Adequada';
            recommendation = 'Grau de umidade no solo e dossel dentro dos parâmetros agronômicos ideais.';
            biomass = '3.9 t/ha';
            chlorophyll = '40.0 SPAD';
          } else {
            classification = 'Saturação Hídrica / Umidade Elevada';
            recommendation = 'Alta umidade edáfica ou orvalho/geada. Atentar para drenagem e sanidade fúngica.';
            biomass = '5.5 t/ha';
            chlorophyll = '49.0 SPAD';
          }
        } else if (indexType === 'msavi2') {
          if (val < 0.35) {
            classification = 'Solo Predominante / Estágio Inicial';
            recommendation = 'Emergência inicial das plântulas. Excelente imunidade ao ruído de fundo do solo.';
            biomass = '1.1 t/ha';
            chlorophyll = '20.0 SPAD';
          } else if (val < 0.60) {
            classification = 'Emergência & Cobertura Parcial';
            recommendation = 'Vegetação em plena expansão foliar no estágio vegetativo V3-V6.';
            biomass = '3.5 t/ha';
            chlorophyll = '37.0 SPAD';
          } else {
            classification = 'Fechamento de Dossel / MSAVI2 Elevado';
            recommendation = 'Pleno fechamento das entrelinhas de plantio sem saturação de sinal.';
            biomass = '5.6 t/ha';
            chlorophyll = '50.0 SPAD';
          }
        } else if (indexType === 'rgb') {
          classification = 'Composição de Cor Real (Visível RGB)';
          recommendation = 'Visão ortomosaica em espectro visível para inspeção de cor real da lavoura.';
          biomass = '4.2 t/ha';
          chlorophyll = '42.0 SPAD';
        } else if (indexType === 'evi2') {
          if (val < 0.35) {
            classification = 'EVI2 Baixo / Pouca Biomassa';
            recommendation = 'Pouca resposta em EVI2 sem banda azul. Verificar nutrição e irrigação.';
            biomass = '1.4 t/ha';
            chlorophyll = '25.0 SPAD';
          } else if (val < 0.60) {
            classification = 'EVI2 Moderado / Desenvolvimento';
            recommendation = 'Índice de 2 bandas otimizado com boa resposta de expansão foliar.';
            biomass = '3.9 t/ha';
            chlorophyll = '40.0 SPAD';
          } else {
            classification = 'EVI2 Elevado / Alta Biomassa';
            recommendation = 'Excelente biomassa vegetal e alto índice de vegetação aprimorado.';
            biomass = '5.7 t/ha';
            chlorophyll = '51.0 SPAD';
          }
        } else if (indexType === 'wdrvi') {
          if (val < 0.35) {
            classification = 'WDRVI Baixo / Cobertura Reduzida';
            recommendation = 'Baixa resposta no WDRVI de ampla faixa dinâmica.';
            biomass = '1.3 t/ha';
            chlorophyll = '23.0 SPAD';
          } else if (val < 0.60) {
            classification = 'WDRVI Médio / Faixa Dinâmica Ativa';
            recommendation = 'Boa diferenciação de vigor em áreas onde o NDVI convencional satura.';
            biomass = '4.1 t/ha';
            chlorophyll = '42.0 SPAD';
          } else {
            classification = 'WDRVI Máximo / Ampla Sensibilidade';
            recommendation = 'Altíssima densidade de biomassa captada na faixa dinâmica ampla.';
            biomass = '6.1 t/ha';
            chlorophyll = '54.0 SPAD';
          }
        } else if (indexType === 'cigreen') {
          if (val < 0.35) {
            classification = 'Clorofila Verde Baixa / Deficiência de N';
            recommendation = 'Índice CI Green baixo indicando amarelamento e necessidade de adubação nitrogenada.';
            biomass = '1.6 t/ha';
            chlorophyll = '24.0 SPAD';
          } else if (val < 0.60) {
            classification = 'Clorofila Verde Satisfatória';
            recommendation = 'Boa concentração de clorofila verde nas folhas das plantas.';
            biomass = '4.2 t/ha';
            chlorophyll = '43.0 SPAD';
          } else {
            classification = 'Clorofila Green Elevada / Pleno Nitrogênio';
            recommendation = 'Excelente acúmulo de clorofila verde e alta taxa fotosssintética.';
            biomass = '5.9 t/ha';
            chlorophyll = '53.0 SPAD';
          }
        } else if (indexType === 'vari') {
          if (val < 0.35) {
            classification = 'VARI Baixo / Solo Exposto (Visível RGB)';
            recommendation = 'Índice visível resistente à atmosfera indicando baixa cobertura vegetal.';
            biomass = '1.2 t/ha';
            chlorophyll = '21.0 SPAD';
          } else if (val < 0.60) {
            classification = 'VARI Moderado / Vegetação Visível';
            recommendation = 'Fração de cobertura verde equilibrada em sensor visível RGB.';
            biomass = '3.7 t/ha';
            chlorophyll = '38.0 SPAD';
          } else {
            classification = 'VARI Elevado / Alta Cobertura Verde';
            recommendation = 'Dossel bem desenvolvido com alta fração de vegetação corrigida atmosfericamente.';
            biomass = '5.3 t/ha';
            chlorophyll = '49.0 SPAD';
          }
        } else if (indexType === 'gli') {
          if (val < 0.35) {
            classification = 'GLI Baixo / Pouca Cobertura Folha Verde';
            recommendation = 'Pouca pigmentação de folha verde captada pelo Green Leaf Index.';
            biomass = '1.3 t/ha';
            chlorophyll = '22.0 SPAD';
          } else if (val < 0.60) {
            classification = 'GLI Moderado / Green Leaf Index Adequado';
            recommendation = 'Boa pigmentação de folha verde medida por câmera visível RGB.';
            biomass = '3.8 t/ha';
            chlorophyll = '39.0 SPAD';
          } else {
            classification = 'GLI Elevado / Abundante Folha Verde';
            recommendation = 'Intensa presença de folha verde e alta porcentagem de cobertura do solo.';
            biomass = '5.4 t/ha';
            chlorophyll = '50.0 SPAD';
          }
        } else if (indexType === 'tgi') {
          if (val < 0.35) {
            classification = 'TGI Baixo / Clorofila Triangular Baixa';
            recommendation = 'Índice TGI baixo. Avaliar estado nutricional e estresse foliar em imagens RGB.';
            biomass = '1.5 t/ha';
            chlorophyll = '23.0 SPAD';
          } else if (val < 0.60) {
            classification = 'TGI Moderado / Clorofila Triangular Ideal';
            recommendation = 'Bons níveis de clorofila medidos através da área de verde triangular visível.';
            biomass = '4.0 t/ha';
            chlorophyll = '41.0 SPAD';
          } else {
            classification = 'TGI Elevado / Alta Concentração de Clorofila';
            recommendation = 'Excelente pigmentação e teor de clorofila foliar calculado pelo método TGI.';
            biomass = '5.8 t/ha';
            chlorophyll = '52.0 SPAD';
          }
        } else {
          if (val < 0.35) {
            classification = 'Estresse Hídrico / Solo Exposto';
            recommendation = 'Ponto crítico: Verificar bicos de aspersão, histórico de nematoides ou compactação de solo.';
            biomass = '1.2 t/ha';
            chlorophyll = '22.0 SPAD';
          } else if (val < 0.60) {
            classification = 'Vigor Moderado';
            recommendation = 'Vegetação em desenvolvimento. Recomendada aplicação foliar balanceada de N-P-K / Micronutrientes.';
            biomass = '3.8 t/ha';
            chlorophyll = '36.5 SPAD';
          }
        }

        return {
          lat,
          lng,
          val,
          indexName: indexType.toUpperCase(),
          classification,
          color: getIndexColor(val, indexType).hex,
          biomass,
          chlorophyll,
          recommendation,
        };
      }
    };
  };

  // Active satellite pass multiplier
  const activePass = useMemo(() => {
    return SATELLITE_PASSES.find(p => p.id === selectedPassId) || SATELLITE_PASSES[0];
  }, [selectedPassId]);

  // Selected plot NDVI stats
  const selectedPlotNdviStats = useMemo(() => {
    if (!selectedPlot?.croquiData) return null;
    try {
      const vertices = JSON.parse(selectedPlot.croquiData);
      const res = generatePlotNdviRaster(vertices, selectedPlot, activePass.meanFactor, ndviIndexType);
      return res?.stats || null;
    } catch {
      return null;
    }
  }, [selectedPlot, activePass, ndviIndexType, customRasters]);

  // Handle Calculate or Recalculate Vegetation Index
  const handleCalculateIndex = () => {
    setIsCalculatingIndex(true);
    setCalculationFeedback(null);
    setTimeout(() => {
      setIsCalculatingIndex(false);
      setCalculationFeedback(`Índice ${ndviIndexType.toUpperCase()} calculado com sucesso para todos os talhões!`);
      setTimeout(() => setCalculationFeedback(null), 4000);
    }, 600);
  };

  // Handle Custom NDVI / GeoTIFF / Orthomosaic Image Upload
  const handleImportCustomRaster = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPlot) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      const meta: CustomRasterMetadata = {
        plotId: selectedPlot.id,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        imageUrl,
        uploadedAt: new Date().toLocaleDateString('pt-BR'),
        sourceType: file.name.toLowerCase().endsWith('.tif') || file.name.toLowerCase().endsWith('.tiff') ? 'geotiff' : 'orthomosaic',
      };

      setCustomRasters(prev => ({
        ...prev,
        [selectedPlot.id]: meta,
      }));

      setCalculationFeedback(`Imagem raster "${file.name}" importada com sucesso no talhão ${selectedPlot.code}!`);
      setTimeout(() => setCalculationFeedback(null), 4000);
    };
    reader.readAsDataURL(file);
  };

  // Handle Remove Custom Raster
  const handleRemoveCustomRaster = (plotId: string) => {
    setCustomRasters(prev => {
      const next = { ...prev };
      delete next[plotId];
      return next;
    });
  };

  // Open Edit Plot Dialog
  const handleOpenEditPlot = (plot: TraceabilityPlot, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPlot(plot);
    setPlotFormData({
      code: plot.code || '',
      name: plot.name || '',
      areaHa: plot.areaHa || 0,
      currentCrop: plot.currentCrop || '',
      currentCultivar: plot.currentCultivar || '',
      soilType: plot.soilType || '',
      irrigationSystem: plot.irrigationSystem || 'sequeiro',
      structureType: plot.structureType || 'campo_aberto',
    });
  };

  // Save Edit Plot
  const handleSaveEditPlot = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingPlot) return;
    if (!plotFormData.code.trim() || !plotFormData.name.trim()) {
      alert('Por favor, preencha o código e o nome do talhão.');
      return;
    }

    const updatedPlots = plots.map(p => {
      if (p.id === editingPlot.id) {
        return {
          ...p,
          code: plotFormData.code.trim(),
          name: plotFormData.name.trim(),
          areaHa: Number(plotFormData.areaHa) || p.areaHa,
          currentCrop: plotFormData.currentCrop.trim(),
          currentCultivar: plotFormData.currentCultivar.trim(),
          soilType: plotFormData.soilType.trim(),
          irrigationSystem: plotFormData.irrigationSystem as any,
          structureType: plotFormData.structureType as any,
        };
      }
      return p;
    });

    setPlots(updatedPlots);
    if (onSavePlots) onSavePlots(updatedPlots);

    const updatedTarget = updatedPlots.find(p => p.id === editingPlot.id);
    if (updatedTarget && selectedPlot?.id === editingPlot.id) {
      setSelectedPlot(updatedTarget);
    }

    setEditingPlot(null);
    notifyExportSuccess(`Talhão ${plotFormData.code} atualizado com sucesso!`);
  };

  // Delete Plot
  const handleDeletePlot = (plotToDelete: TraceabilityPlot, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const confirmMsg = `Tem certeza que deseja excluir o talhão "${plotToDelete.code} - ${plotToDelete.name}"?\nEsta ação removerá o polígono do mapa.`;
    if (!window.confirm(confirmMsg)) return;

    const updatedPlots = plots.filter(p => p.id !== plotToDelete.id);
    setPlots(updatedPlots);
    if (onSavePlots) onSavePlots(updatedPlots);

    if (selectedPlot?.id === plotToDelete.id) {
      setSelectedPlot(updatedPlots[0] || null);
    }

    notifyExportSuccess(`Talhão ${plotToDelete.code} excluído com sucesso.`);
  };

  // Run Gemini AI NDVI Analysis
  const handleRunNdviAiAnalysis = async (userPromptOverride?: string) => {
    if (!selectedPlot) return;

    setIsAnalyzingNdviAi(true);
    setNdviAiError(null);
    setShowNdviAiModal(true);

    try {
      const payload = {
        plotCode: selectedPlot.code,
        plotName: selectedPlot.name,
        areaHa: selectedPlot.areaHa,
        currentCrop: selectedPlot.currentCrop,
        currentCultivar: selectedPlot.currentCultivar,
        soilType: selectedPlot.soilType,
        irrigationSystem: selectedPlot.irrigationSystem,
        indexType: ndviIndexType,
        satellitePass: activePass,
        ndviStats: selectedPlotNdviStats,
        userQuestion: userPromptOverride || '',
      };

      const res = await fetch('/api/analyze-ndvi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setNdviAiData(json.data);
      } else {
        throw new Error(json.error || 'Falha ao processar análise inteligente com a Nema IA.');
      }
    } catch (err: any) {
      setNdviAiError(err?.message || 'Ocorreu um erro na análise de sensoriamento remoto com a Nema IA.');
    } finally {
      setIsAnalyzingNdviAi(false);
    }
  };

  // Inject Suggested POIs onto Map Layer
  const handleInjectSuggestedPois = () => {
    if (!ndviAiData || !ndviAiData.suggestedSamplingPois || ndviAiData.suggestedSamplingPois.length === 0 || !selectedPlot) return;

    let centerLat = -12.98;
    let centerLng = -45.85;

    if (selectedPlot.croquiData) {
      try {
        const vertices = JSON.parse(selectedPlot.croquiData);
        if (Array.isArray(vertices) && vertices.length > 0) {
          centerLat = vertices.reduce((sum: number, v: any) => sum + v[0], 0) / vertices.length;
          centerLng = vertices.reduce((sum: number, v: any) => sum + v[1], 0) / vertices.length;
        }
      } catch {}
    }

    const newPoisToAdd: CustomPOI[] = ndviAiData.suggestedSamplingPois.map((p, idx) => {
      const offsetLat = (idx === 0 ? -1 : 1) * 0.0012;
      const offsetLng = (idx === 0 ? 0.001 : -0.001) * 0.0012;

      return {
        id: `poi-ai-${Date.now()}-${idx}`,
        name: p.name,
        type: p.type || 'nematode',
        lat: centerLat + offsetLat,
        lng: centerLng + offsetLng,
      };
    });

    setPois(prev => [...prev, ...newPoisToAdd]);
    notifyExportSuccess(`${newPoisToAdd.length} Marcadores recomendados pela Nema IA adicionados ao mapa!`);
  };

  // Parse Text Coordinates
  const handleImportCoordinates = () => {
    if (!coordPasteText.trim()) return;
    try {
      const lines = coordPasteText.trim().split('\n');
      const parsedCoords: { lat: number; lng: number }[] = [];
      lines.forEach(line => {
        const parts = line.replace(/[;,\t]/g, ' ').trim().split(/\s+/);
        if (parts.length >= 2) {
          const lat = parseFloat(parts[0]);
          const lng = parseFloat(parts[1]);
          if (!isNaN(lat) && !isNaN(lng)) {
            parsedCoords.push({ lat, lng });
          }
        }
      });

      if (parsedCoords.length >= 3) {
        setDrawVertices(parsedCoords);
        setImportStatus('success');
        if (mapRef.current) {
          mapRef.current.setView([parsedCoords[0].lat, parsedCoords[0].lng], 16);
        }
        setTimeout(() => setImportStatus('idle'), 3000);
      } else {
        setImportStatus('error');
        setTimeout(() => setImportStatus('idle'), 4000);
      }
    } catch (err) {
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 4000);
    }
  };

  // GIS & Interoperability Exporters (KML, GeoJSON)
  const notifyExportSuccess = (msg: string) => {
    setExportFeedback(msg);
    setTimeout(() => setExportFeedback(null), 4000);
  };

  // 1. Export ALL plots as OGC GeoJSON FeatureCollection
  const handleExportAllGeoJSON = () => {
    try {
      const geojsonStr = generateGeoJSONAllPlots(plots, lots, property);
      triggerFileDownload(
        geojsonStr,
        `talhoes-sig-${(property?.farmName || 'propriedade').toLowerCase().replace(/\s+/g, '-')}-${new Date().getTime()}.geojson`,
        'application/geo+json'
      );
      notifyExportSuccess('GeoJSON com todos os talhões exportado com sucesso!');
    } catch (err: any) {
      alert(`Erro ao exportar GeoJSON: ${err.message}`);
    }
  };

  // 2. Export ALL plots & POIs as KML for Google Earth & Agricultural Drones
  const handleExportAllKML = () => {
    try {
      const kmlStr = generateKMLAllPlots(plots, lots, pois, property);
      triggerFileDownload(
        kmlStr,
        `talhoes-drones-${(property?.farmName || 'fazenda').toLowerCase().replace(/\s+/g, '-')}-${new Date().getTime()}.kml`,
        'application/vnd.google-earth.kml+xml'
      );
      notifyExportSuccess('KML compatível com Google Earth e Drones exportado com sucesso!');
    } catch (err: any) {
      alert(`Erro ao exportar KML: ${err.message}`);
    }
  };

  // 3. Export specific plot as GeoJSON
  const handleExportSelectedPlotGeoJSON = (targetPlot?: TraceabilityPlot) => {
    const plot = targetPlot || selectedPlot;
    if (!plot) return;
    try {
      const geojsonStr = generateGeoJSONSinglePlot(plot);
      triggerFileDownload(
        geojsonStr,
        `talhao-${plot.code.toLowerCase()}-${new Date().getTime()}.geojson`,
        'application/geo+json'
      );
      notifyExportSuccess(`GeoJSON do Talhão ${plot.code} exportado com sucesso!`);
    } catch (err: any) {
      alert(`Erro ao exportar GeoJSON do talhão: ${err.message}`);
    }
  };

  // 4. Export specific plot as KML
  const handleExportSelectedPlotKML = (targetPlot?: TraceabilityPlot) => {
    const plot = targetPlot || selectedPlot;
    if (!plot) return;
    try {
      const kmlStr = generateKMLSinglePlot(plot);
      triggerFileDownload(
        kmlStr,
        `talhao-${plot.code.toLowerCase()}-${new Date().getTime()}.kml`,
        'application/vnd.google-earth.kml+xml'
      );
      notifyExportSuccess(`KML do Talhão ${plot.code} exportado com sucesso!`);
    } catch (err: any) {
      alert(`Erro ao exportar KML do talhão: ${err.message}`);
    }
  };

  // 5. Export currently drawn geometry from Leaflet.Draw as GeoJSON
  const handleExportGeoJSON = () => {
    if (drawVertices.length < 3) return;
    const target = plots.find(p => p.id === selectedPlotToDelimit) || selectedPlot;
    try {
      const geojsonStr = generateGeoJSONSinglePlot(target, drawVertices);
      triggerFileDownload(
        geojsonStr,
        `talhao-desenhado-${target?.code || 'delimitacao'}-${new Date().getTime()}.geojson`,
        'application/geo+json'
      );
      notifyExportSuccess('Polígono desenhado exportado em GeoJSON!');
    } catch (err: any) {
      alert(`Erro ao exportar polígono desenhado: ${err.message}`);
    }
  };

  // 6. Export currently drawn geometry as KML
  const handleExportDrawnKML = () => {
    if (drawVertices.length < 3) return;
    const target = plots.find(p => p.id === selectedPlotToDelimit) || selectedPlot;
    try {
      const kmlStr = generateKMLSinglePlot(target, drawVertices);
      triggerFileDownload(
        kmlStr,
        `talhao-desenhado-${target?.code || 'delimitacao'}-${new Date().getTime()}.kml`,
        'application/vnd.google-earth.kml+xml'
      );
      notifyExportSuccess('Polígono desenhado exportado em KML para drones!');
    } catch (err: any) {
      alert(`Erro ao exportar polígono desenhado em KML: ${err.message}`);
    }
  };

  // GPS Auto-Locate with Accuracy Circle
  const handleAutoLocate = () => {
    if (!navigator.geolocation) {
      alert('Seu dispositivo ou navegador não suporta geolocalização por GPS.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 17);
          
          const gpsMarker = L.marker([latitude, longitude], {
            icon: L.divIcon({
              className: 'bg-transparent border-none',
              html: `
                <div class="relative flex items-center justify-center">
                  <div class="absolute w-5 h-5 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                  <div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md"></div>
                </div>
              `,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })
          }).addTo(mapRef.current);

          const gpsCircle = L.circle([latitude, longitude], {
            radius: accuracy || 40,
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.15,
            weight: 1.5,
          }).addTo(mapRef.current);

          gpsMarker.bindTooltip(`Sua Posição (Precisão: ±${Math.round(accuracy || 0)}m)`).openTooltip();

          currentMarkersRef.current.push(gpsMarker);
          currentMarkersRef.current.push(gpsCircle);
          setGpsActive(true);
        }
      },
      (error) => {
        alert(`Não foi possível obter o GPS: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Address Search via Nominatim API
  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=br&limit=5`;
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'pt-BR,pt;q=0.9',
          'User-Agent': 'GeaAgro-GIS-Applet-Build'
        }
      });
      const data = await res.json();
      setSearchResults(data || []);
    } catch (err) {
      console.warn('Erro ao consultar Nominatim:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Select Search Result & Pin
  const handleSelectSearchResult = (result: { display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    if (!isNaN(lat) && !isNaN(lng) && mapRef.current) {
      mapRef.current.setView([lat, lng], 15);
      
      const searchMarker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'bg-transparent border-none',
          html: `
            <div class="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-white shadow-md border-2 border-white">
              📍
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })
      }).addTo(mapRef.current);

      searchMarker.bindTooltip(`<div class="p-1 font-bold text-xs">${result.display_name}</div>`).openTooltip();
      currentMarkersRef.current.push(searchMarker);
      
      setSearchResults([]);
      setSearchQuery('');
    }
  };

  // Import GeoJSON from File System
  const handleImportGeoJSONFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        
        let coords: { lat: number; lng: number }[] = [];
        
        if (parsed.type === 'FeatureCollection' && parsed.features?.[0]) {
          const geom = parsed.features[0].geometry;
          if (geom.type === 'Polygon' && geom.coordinates?.[0]) {
            coords = geom.coordinates[0].map((c: any) => ({ lat: c[1], lng: c[0] }));
          }
        } else if (parsed.type === 'Feature' && parsed.geometry?.type === 'Polygon' && parsed.geometry?.coordinates?.[0]) {
          coords = parsed.geometry.coordinates[0].map((c: any) => ({ lat: c[1], lng: c[0] }));
        } else if (parsed.geometry?.type === 'Polygon' && parsed.geometry?.coordinates?.[0]) {
          coords = parsed.geometry.coordinates[0].map((c: any) => ({ lat: c[1], lng: c[0] }));
        } else if (Array.isArray(parsed)) {
          coords = parsed;
        }

        if (coords.length > 3 && coords[0].lat === coords[coords.length - 1].lat && coords[0].lng === coords[coords.length - 1].lng) {
          coords.pop();
        }

        if (coords.length >= 3) {
          setDrawVertices(coords);
          setImportStatus('success');
          if (mapRef.current) {
            mapRef.current.setView([coords[0].lat, coords[0].lng], 16);
          }
          setTimeout(() => setImportStatus('idle'), 3000);
        } else {
          setImportStatus('error');
          setTimeout(() => setImportStatus('idle'), 4000);
        }
      } catch (err) {
        console.error('Falha ao ler arquivo GeoJSON:', err);
        setImportStatus('error');
        setTimeout(() => setImportStatus('idle'), 4000);
      }
    };
    reader.readAsText(file);
  };

  // Re-initialize and render Leaflet Map layers
  const renderMap = () => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    let lat = selectedPlot?.latitude || property.latitude || -22.3714;
    let lng = selectedPlot?.longitude || property.longitude || -46.9421;
    let zoom = 15;

    // Detect if the user explicitly changed the selected plot
    const plotChanged = prevSelectedPlotIdRef.current !== selectedPlot?.id;
    prevSelectedPlotIdRef.current = selectedPlot?.id;

    if (mapRef.current) {
      if (!plotChanged) {
        try {
          const currentCenter = mapRef.current.getCenter();
          const currentZoom = mapRef.current.getZoom();
          lat = currentCenter.lat;
          lng = currentCenter.lng;
          zoom = currentZoom;
        } catch (e) {
          console.warn('Erro ao obter centro/zoom do mapa anterior:', e);
        }
      }
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([lat, lng], zoom);

    mapRef.current = map;

    // Zoom Control
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Layer selection
    const tilesSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
    });
    const tilesOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png', {
      maxZoom: 19,
    });
    const tilesTopography = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{y}/{x}.png', {
      maxZoom: 17,
    });
    const tilesHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{y}/{x}.png', {
      maxZoom: 19,
    });

    if (mapLayer === 'satellite') tilesSatellite.addTo(map);
    else if (mapLayer === 'osm') tilesOSM.addTo(map);
    else if (mapLayer === 'topography') tilesTopography.addTo(map);
    else if (mapLayer === 'hot') tilesHOT.addTo(map);

    // FeatureGroup for Leaflet.Draw controls
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;

    // Leaflet.Draw Control Toolbar
    const drawControl = new L.Control.Draw({
      position: 'topleft',
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: false, // Set to false to avoid leaflet-draw strict-mode type ReferenceError bug
          drawError: {
            color: '#e11d48',
            message: '<strong>Aviso:</strong> Os limites do talhão não podem se cruzar!'
          },
          shapeOptions: {
            color: '#10b981',
            weight: 3,
            fillColor: '#10b981',
            fillOpacity: 0.35,
          }
        },
        rectangle: {
          shapeOptions: {
            color: '#3b82f6',
            weight: 3,
            fillColor: '#3b82f6',
            fillOpacity: 0.35,
          }
        },
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false
      },
      edit: {
        featureGroup: drawnItems,
        remove: true
      }
    });
    map.addControl(drawControl);

    // Listen to Leaflet.Draw Events
    map.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer;
      drawnItems.addLayer(layer);
      
      if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
        const latlngs: any = layer.getLatLngs();
        const rawCoords = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;
        const vertices = rawCoords.map((c: any) => ({ lat: c.lat, lng: c.lng }));
        
        setDrawVertices(vertices);
        const area = calculateAreaInHectares(vertices);
        setDrawArea(area);
        setActiveTab('draw');
      }
    });

    map.on(L.Draw.Event.EDITED, (event: any) => {
      const layers = event.layers;
      layers.eachLayer((layer: any) => {
        if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
          const latlngs: any = layer.getLatLngs();
          const rawCoords = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;
          const vertices = rawCoords.map((c: any) => ({ lat: c.lat, lng: c.lng }));
          setDrawVertices(vertices);
          setDrawArea(calculateAreaInHectares(vertices));
        }
      });
    });

    map.on(L.Draw.Event.DELETED, () => {
      setDrawVertices([]);
      setDrawArea(0);
    });

    // Clean up old markers and overlays
    currentMarkersRef.current.forEach(layer => map.removeLayer(layer));
    currentMarkersRef.current = [];
    ndviLayersRef.current.forEach(layer => map.removeLayer(layer));
    ndviLayersRef.current = [];

    // Layer Manager State Resolvers
    const ndviLayerConfig = overlayLayers.find(l => l.id === 'ndvi_multispectral');
    const waterStressConfig = overlayLayers.find(l => l.id === 'water_stress_ndwi');
    const soilLayerConfig = overlayLayers.find(l => l.id === 'soil_fertility');
    const pestsLayerConfig = overlayLayers.find(l => l.id === 'pests_alerts');
    const inspectionConfig = overlayLayers.find(l => l.id === 'inspection_points');
    const boundariesConfig = overlayLayers.find(l => l.id === 'plots_boundary');

    // Determine active multispectral rendering according to layers configuration
    const isNdviLayerVisible = (ndviLayerConfig ? ndviLayerConfig.visible : true) && showNdvi;
    const activeNdviOpacity = ndviLayerConfig ? ndviLayerConfig.opacity : ndviOpacity;

    // Check if Boundary vectors are visible
    const isBoundariesVisible = boundariesConfig ? boundariesConfig.visible : true;
    const boundaryOpacity = boundariesConfig ? boundariesConfig.opacity : 1.0;

    // Check if POIs/Inspection points are visible
    const isPoisVisible = inspectionConfig ? inspectionConfig.visible : true;
    const isPestAlertsVisible = pestsLayerConfig ? pestsLayerConfig.visible : true;
    const isSoilVisible = soilLayerConfig ? soilLayerConfig.visible : true;
    const isWaterStressVisible = waterStressConfig ? waterStressConfig.visible : true;

    // Sort active overlay layers by visual order (lower order rendered first, higher order rendered on top)
    const sortedLayers = [...overlayLayers].sort((a, b) => a.order - b.order);

    // Helper map of render operations per layer id
    const renderLayerById = (layerId: string) => {
      switch (layerId) {
        case 'plots_boundary': {
          if (!isBoundariesVisible) return;
          // Draw Plot Polygons
          plots.forEach(plot => {
            if (!plot.croquiData) return;
            try {
              const vertices: { lat: number; lng: number }[] = JSON.parse(plot.croquiData);
              if (vertices.length < 3) return;

              const isSelected = selectedPlot?.id === plot.id;
              const hasQuarantine = lots.some(l => (l.plotId === plot.id || l.plotCode === plot.code) && l.isUnderActiveQuarantine);

              const color = hasQuarantine ? '#ef4444' : isSelected ? '#10b981' : '#3b82f6';
              const fillOpacity = isNdviLayerVisible ? 0.05 * boundaryOpacity : (isSelected ? 0.45 : 0.25) * boundaryOpacity;

              // Base Polygon Vector Boundary
              const polygon = L.polygon(vertices.map(v => [v.lat, v.lng]), {
                color: color,
                weight: isSelected ? 3.5 : 2,
                opacity: boundaryOpacity,
                fillColor: color,
                fillOpacity: fillOpacity,
              }).addTo(map);

              // Bind interactive tooltip
              const plotLots = lots.filter(l => l.plotId === plot.id || l.plotCode === plot.code);
              const lotLabel = plotLots.map(l => l.lotCode).join(', ') || 'Nenhum lote ativo';
              
              polygon.bindTooltip(`
                <div class="p-2 text-xs font-sans text-slate-800">
                  <strong class="text-sm font-bold text-slate-900">${plot.name} (${plot.code})</strong><br/>
                  Cultura: <strong>${plot.currentCrop || 'Sem cultivo'}</strong> (${plot.currentCultivar || '--'})<br/>
                  Área: <strong>${plot.areaHa} ha</strong> | Irrigação: <strong>${plot.irrigationSystem}</strong><br/>
                  Lotes: <span class="font-mono text-[10px] text-emerald-600 font-bold">${lotLabel}</span>
                </div>
              `, { sticky: true });

              polygon.on('click', () => {
                setSelectedPlot(plot);
              });

              currentMarkersRef.current.push(polygon);

              // Center Label
              const bounds = polygon.getBounds();
              const center = bounds.getCenter();
              const labelMarker = L.marker(center, {
                icon: L.divIcon({
                  className: 'bg-transparent border-none',
                  html: `
                    <div class="flex flex-col items-center justify-center font-bold font-sans text-[10px] text-white bg-black/65 px-1.5 py-0.5 rounded shadow-sm border border-white/20 whitespace-nowrap">
                      <span>${plot.code}</span>
                      <span class="text-[8px] font-normal text-emerald-300 font-semibold">${plot.currentCrop || 'Livre'}</span>
                    </div>
                  `,
                  iconSize: [40, 20],
                  iconAnchor: [20, 10],
                })
              }).addTo(map);

              currentMarkersRef.current.push(labelMarker);
            } catch (err) {
              console.warn('Erro ao processar polígono do talhão:', plot.id, err);
            }
          });
          break;
        }

        case 'ndvi_multispectral': {
          if (!isNdviLayerVisible) return;
          plots.forEach(plot => {
            if (!plot.croquiData) return;
            try {
              const vertices: { lat: number; lng: number }[] = JSON.parse(plot.croquiData);
              if (vertices.length < 3) return;

              const ndviData = generatePlotNdviRaster(vertices, plot, activePass.meanFactor, ndviIndexType);
              if (ndviData) {
                const overlay = L.imageOverlay(ndviData.dataUrl, ndviData.bounds, {
                  opacity: activeNdviOpacity,
                  interactive: true,
                }).addTo(map);

                // Click on NDVI Overlay to Probe Exact Vegetation Index
                overlay.on('click', (e: L.LeafletMouseEvent) => {
                  L.DomEvent.stopPropagation(e);
                  setSelectedPlot(plot);
                  const sample = ndviData.sampleAt(e.latlng.lat, e.latlng.lng);
                  setPointSample(sample);

                  // Add a ping probe marker on map
                  const probeMarker = L.circleMarker([e.latlng.lat, e.latlng.lng], {
                    radius: 7,
                    color: '#ffffff',
                    weight: 2,
                    fillColor: sample.color,
                    fillOpacity: 1,
                  }).addTo(map);

                  probeMarker.bindTooltip(`
                    <div class="p-1 font-sans text-xs">
                      <strong class="text-emerald-700 font-bold">${sample.indexName}: ${sample.val}</strong><br/>
                      <span>${sample.classification}</span>
                    </div>
                  `).openTooltip();

                  currentMarkersRef.current.push(probeMarker);
                });

                ndviLayersRef.current.push(overlay);
              }
            } catch (err) {
              console.warn('Erro ao gerar NDVI:', plot.id, err);
            }
          });
          break;
        }

        case 'water_stress_ndwi': {
          if (!isWaterStressVisible) return;
          // Overlay indicating water deficit / high turgescence points
          plots.forEach(plot => {
            if (!plot.croquiData) return;
            try {
              const vertices: { lat: number; lng: number }[] = JSON.parse(plot.croquiData);
              if (vertices.length < 3) return;
              const bounds = L.polygon(vertices.map(v => [v.lat, v.lng])).getBounds();
              const center = bounds.getCenter();

              const stressBadge = L.marker([center.lat + 0.0003, center.lng - 0.0003], {
                icon: L.divIcon({
                  className: 'bg-transparent border-none',
                  html: `
                    <div class="flex items-center gap-1 bg-sky-950/85 text-sky-200 border border-sky-400/50 px-2 py-0.5 rounded-full text-[9px] font-bold shadow-md">
                      <span class="text-[10px]">💧</span>
                      <span>NDWI ${(0.52 + (plot.areaHa % 3) * 0.08).toFixed(2)}</span>
                    </div>
                  `,
                  iconSize: [80, 20],
                  iconAnchor: [40, 10],
                })
              }).addTo(map);
              currentMarkersRef.current.push(stressBadge);
            } catch {}
          });
          break;
        }

        case 'soil_fertility': {
          if (!isSoilVisible) return;
          // Soil Chemistry overlay pins
          plots.forEach(plot => {
            if (!plot.croquiData) return;
            try {
              const vertices: { lat: number; lng: number }[] = JSON.parse(plot.croquiData);
              if (vertices.length < 3) return;
              const bounds = L.polygon(vertices.map(v => [v.lat, v.lng])).getBounds();
              const center = bounds.getCenter();

              const soilBadge = L.marker([center.lat - 0.0004, center.lng + 0.0004], {
                icon: L.divIcon({
                  className: 'bg-transparent border-none',
                  html: `
                    <div class="flex items-center gap-1 bg-amber-950/85 text-amber-200 border border-amber-400/50 px-2 py-0.5 rounded-full text-[9px] font-bold shadow-md">
                      <span class="text-[10px]">🧪</span>
                      <span>V%: 68% | CTC: 12.4</span>
                    </div>
                  `,
                  iconSize: [110, 20],
                  iconAnchor: [55, 10],
                })
              }).addTo(map);
              currentMarkersRef.current.push(soilBadge);
            } catch {}
          });
          break;
        }

        case 'pests_alerts': {
          if (!isPestAlertsVisible) return;
          // Render Pest & Nematode alerts
          pois.filter(poi => poi.type === 'nematode' || poi.type === 'pest' || poi.type === 'disease').forEach(poi => {
            const pestMarker = L.circle([poi.lat, poi.lng], {
              radius: 35,
              color: '#ef4444',
              weight: 2,
              fillColor: '#ef4444',
              fillOpacity: 0.35,
              dashArray: '4, 4'
            }).addTo(map);
            pestMarker.bindTooltip(`<strong>${poi.name}</strong><br/><span class="text-rose-600 font-bold">Alerta Fitossanitário Ativo</span>`);
            currentMarkersRef.current.push(pestMarker);
          });
          break;
        }

        case 'inspection_points': {
          if (!isPoisVisible) return;
          // Render Special Points of Interest (POIs) and inspections
          pois.forEach(poi => {
            const typeIcons: Record<CustomPOI['type'], string> = {
              well: '💧',
              water: '🌊',
              soil: '🧪',
              trap: '🪰',
              station: '🌤️',
              gate: '🚪',
              house: '🏠',
              nematode: '🪱',
              pest: '🐛',
              disease: '🍂',
            };
            
            const marker = L.marker([poi.lat, poi.lng], {
              icon: L.divIcon({
                className: 'bg-transparent border-none',
                html: `
                  <div class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900/90 text-sm shadow-md border-2 border-white transition hover:scale-115">
                    <span>${typeIcons[poi.type] || '📍'}</span>
                  </div>
                `,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
              })
            }).addTo(map);

            marker.bindTooltip(`
              <div class="p-1.5 text-xs">
                <strong>${poi.name}</strong><br/>
                Coordenadas: <span class="font-mono">${poi.lat.toFixed(5)}, ${poi.lng.toFixed(5)}</span>
              </div>
            `);

            currentMarkersRef.current.push(marker);
          });
          break;
        }

        default:
          break;
      }
    };

    // Execute rendering in the priority order established by the LayerManager
    sortedLayers.forEach(layer => {
      renderLayerById(layer.id);
    });

    // Handle mouse movement for coordinates display
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setMouseCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    // Manual Drawing Polyline Overlay
    if (isDrawing && drawVertices.length > 0) {
      const points = drawVertices.map(v => [v.lat, v.lng] as [number, number]);
      if (points.length >= 3) {
        points.push(points[0]);
      }

      const polyline = L.polyline(points, {
        color: '#f59e0b',
        weight: 3,
        dashArray: '5, 8',
      }).addTo(map);

      drawingPolylineRef.current = polyline;
      currentMarkersRef.current.push(polyline);

      drawVertices.forEach((vertex, idx) => {
        const handle = L.circleMarker([vertex.lat, vertex.lng], {
          radius: 6,
          fillColor: '#f59e0b',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 0.9,
        }).addTo(map);

        handle.bindTooltip(`Vértice ${idx + 1}`, { permanent: false, direction: 'top' });

        handle.on('click', (ev) => {
          L.DomEvent.stopPropagation(ev);
          setDrawVertices(prev => prev.filter((_, i) => i !== idx));
        });

        currentMarkersRef.current.push(handle);
      });
    }

    // Click map to draw or record new point
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (isDrawing) {
        setDrawVertices(prev => [...prev, { lat: e.latlng.lat, lng: e.latlng.lng }]);
      } else if (activeTab === 'pois') {
        setNewPoiCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });
  };

  // Watch state changes to update Leaflet Map
  useEffect(() => {
    renderMap();
  }, [plots, mapLayer, selectedPlot, isDrawing, drawVertices, pois, activeTab, showNdvi, ndviOpacity, ndviIndexType, selectedPassId, customRasters, overlayLayers]);

  // Handle Save drawn delimitation to selected plot
  const handleSaveDelimitation = () => {
    if (drawVertices.length < 3) {
      showMapToast('Desenhe pelo menos 3 pontos no mapa para formar um polígono fechado.', 'error');
      return;
    }

    let targetPlotId = selectedPlotToDelimit;

    // Se nenhum talhão foi selecionado, mas existem talhões, assume o primeiro
    if ((!targetPlotId || targetPlotId === '') && plots.length > 0) {
      targetPlotId = plots[0].id;
      setSelectedPlotToDelimit(targetPlotId);
    }

    // Se foi escolhido criar novo talhão OU se não há nenhum talhão cadastrado:
    if (targetPlotId === '__new_plot__' || plots.length === 0 || !plots.some(p => p.id === targetPlotId)) {
      const nextNum = plots.length + 1;
      const plotName = newPlotCustomName.trim() || `Talhão 0${nextNum} (${drawArea > 0 ? `${drawArea} ha` : 'Novo'})`;
      const plotCode = `TAL-0${nextNum}`;

      const newPlot: TraceabilityPlot = {
        id: `plot-${Date.now()}`,
        code: plotCode,
        name: plotName,
        farmId: property?.id || (plots[0]?.farmId) || 'farm-1',
        areaHa: drawArea > 0 ? drawArea : 1.0,
        structureType: 'campo_aberto',
        currentCrop: 'Hortifruti / Lavoura',
        currentCultivar: 'Padrão',
        irrigationSystem: 'sequeiro',
        soilType: 'Latossolo Vermelho',
        soilTexture: 'medio',
        latitude: drawVertices[0].lat,
        longitude: drawVertices[0].lng,
        croquiData: JSON.stringify(drawVertices),
        active: true
      };

      const updatedPlots = [...plots, newPlot];
      setPlots(updatedPlots);
      if (onSavePlots) {
        onSavePlots(updatedPlots);
      }

      setSelectedPlot(newPlot);
      setSelectedPlotToDelimit(newPlot.id);
      setNewPlotCustomName('');
      setIsDrawing(false);
      setDrawVertices([]);
      localStorage.removeItem('geaagro_polygon_draw_vertices');
      localStorage.setItem('geaagro_polygon_is_drawing', 'false');

      showMapToast(`Novo talhão "${newPlot.name}" criado com sucesso (${drawArea} ha)!`, 'success');
      setActiveTab('list');
      return;
    }

    // Atualiza o talhão selecionado existente
    const updatedPlots = plots.map(p => {
      if (p.id === targetPlotId) {
        return {
          ...p,
          areaHa: drawArea > 0 ? drawArea : p.areaHa,
          croquiData: JSON.stringify(drawVertices),
          latitude: drawVertices[0].lat,
          longitude: drawVertices[0].lng,
        };
      }
      return p;
    });

    setPlots(updatedPlots);
    if (onSavePlots) {
      onSavePlots(updatedPlots);
    }

    const edited = updatedPlots.find(p => p.id === targetPlotId);
    if (edited) setSelectedPlot(edited);

    setIsDrawing(false);
    setDrawVertices([]);
    localStorage.removeItem('geaagro_polygon_draw_vertices');
    localStorage.setItem('geaagro_polygon_is_drawing', 'false');

    const plotName = edited ? edited.name : 'Talhão';
    showMapToast(`Polígono do talhão "${plotName}" salvo com sucesso (${drawArea} ha)!`, 'success');
    setActiveTab('list');
  };

  // Add custom Point of Interest
  const handleAddPOI = () => {
    if (!newPoiName.trim() || !newPoiCoords) return;
    const item: CustomPOI = {
      id: `poi-${Date.now()}`,
      name: newPoiName,
      type: newPoiType,
      lat: newPoiCoords.lat,
      lng: newPoiCoords.lng,
    };
    setPois(prev => [...prev, item]);
    setNewPoiName('');
    setNewPoiCoords(null);
  };

  // Delete custom POI
  const handleDeletePOI = (id: string) => {
    setPois(prev => prev.filter(p => p.id !== id));
  };

  const selectedPlotLots = lots.filter(l => l.plotId === selectedPlot?.id || l.plotCode === selectedPlot?.code);

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {mapToast && (
        <div className={`fixed top-6 right-6 z-[9999] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold text-white transition-all animate-bounce ${
          mapToast.type === 'error' ? 'bg-rose-600' : mapToast.type === 'info' ? 'bg-sky-600' : 'bg-emerald-600'
        }`}>
          {mapToast.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{mapToast.message}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-xl">
              <Layers className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Módulo de Geoprocessamento & NDVI
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Sensoriamento Orbital & Delimitação SIG
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Índices de vegetação multiespectrais (NDVI, SAVI, EVI, NDRE), importação de imagens raster e controle de opacidade.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100 dark:border-zinc-800/60 my-0.5" />

        {/* Base Layer & NDVI quick controls (Positioned below) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Map Base Layer Picker */}
            <div className="flex flex-wrap items-center bg-slate-100 dark:bg-zinc-800/60 p-1 rounded-xl border border-slate-200/80 dark:border-zinc-700/50">
              <button
                onClick={() => setMapLayer('satellite')}
                className={`px-3.5 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  mapLayer === 'satellite' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-emerald-500" /> Satélite Esri
              </button>
              <button
                onClick={() => setMapLayer('osm')}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  mapLayer === 'osm' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5 text-blue-500" /> OSM Padrão
              </button>
              <button
                onClick={() => setMapLayer('topography')}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  mapLayer === 'topography' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-amber-500" /> Topo Relevo
              </button>
              <button
                onClick={() => setMapLayer('hot')}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  mapLayer === 'hot' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-500" /> Terreno HOT
              </button>
            </div>
          </div>

          {/* NDVI Direct Quick Toggle */}
          <button
            onClick={() => setShowNdvi(!showNdvi)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs border ${
              showNdvi
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20'
                : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
            }`}
          >
            <Activity className={`w-4 h-4 ${showNdvi ? 'animate-pulse text-white' : 'text-emerald-500'}`} />
            <span>Camada {ndviIndexType.toUpperCase()} {showNdvi ? 'Ativa' : 'Desativada'}</span>
          </button>
        </div>
      </div>

      {/* Grid Control Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive GIS Map Canvas */}
        <div className="lg:col-span-8 flex flex-col space-y-3 relative">
          {/* Floating Search & GPS Autolocate Bar */}
          <div className="flex flex-col sm:flex-row gap-2 w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 rounded-2xl shadow-sm">
            {/* Nominatim Search Input */}
            <form onSubmit={handleSearchAddress} className="flex-1 relative flex gap-1.5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar cidades, municípios agrícolas ou endereços no Brasil..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-850 text-xs text-slate-800 dark:text-zinc-100 border border-slate-200 dark:border-zinc-700/60 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={searchLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              >
                {searchLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Buscar'}
              </button>

              {/* Autocomplete suggestions dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-[1000] max-h-56 overflow-y-auto bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                  {searchResults.map((r, i) => (
                    <div
                      key={i}
                      onClick={() => handleSelectSearchResult(r)}
                      className="p-3 hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer text-slate-700 dark:text-zinc-300 transition-colors"
                    >
                      {r.display_name}
                    </div>
                  ))}
                </div>
              )}
            </form>

            {/* GPS locate & GIS export tools */}
            <div className="flex items-center gap-1.5 shrink-0 relative">
              <button
                type="button"
                onClick={handleAutoLocate}
                className="px-3.5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Sua localização atual por GPS"
              >
                <Navigation className="w-3.5 h-3.5 fill-white animate-pulse" />
                <span>GPS Atual</span>
              </button>

              {/* Interoperability Dropdown Menu Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowExportModal(!showExportModal)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Exportar polígonos dos talhões em KML e GeoJSON para agricultura de precisão"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Exportar SIG & Drones</span>
                </button>

                {/* Dropdown Menu Modal Popover */}
                {showExportModal && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-[1100] p-3 text-xs space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                      <span className="font-black text-slate-800 dark:text-zinc-100 flex items-center gap-1.5">
                        <Layers3 className="w-4 h-4 text-emerald-600" />
                        Interoperabilidade SIG
                      </span>
                      <button
                        onClick={() => setShowExportModal(false)}
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-1 text-slate-600 dark:text-zinc-400 text-[11px]">
                      <span className="font-bold text-slate-400 block uppercase text-[9px]">Todos os Talhões ({plots.length}):</span>
                      
                      {/* Export All GeoJSON */}
                      <button
                        type="button"
                        onClick={() => { handleExportAllGeoJSON(); setShowExportModal(false); }}
                        className="w-full text-left p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-zinc-200 flex items-center justify-between group transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center font-mono font-black text-[10px]">
                            GEO
                          </span>
                          <div>
                            <strong className="block group-hover:text-emerald-600">GeoJSON Geral (OGC)</strong>
                            <span className="text-[10px] text-slate-400">QGIS, ArcGIS, Agrosmart</span>
                          </div>
                        </div>
                        <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                      </button>

                      {/* Export All KML */}
                      <button
                        type="button"
                        onClick={() => { handleExportAllKML(); setShowExportModal(false); }}
                        className="w-full text-left p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-800 dark:text-zinc-200 flex items-center justify-between group transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 flex items-center justify-center font-mono font-black text-[10px]">
                            KML
                          </span>
                          <div>
                            <strong className="block group-hover:text-amber-600">KML Geral + POIs</strong>
                            <span className="text-[10px] text-slate-400">Google Earth & Drones DJI/Trimble</span>
                          </div>
                        </div>
                        <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
                      </button>
                    </div>

                    {selectedPlot && (
                      <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-1 text-slate-600 dark:text-zinc-400 text-[11px]">
                        <span className="font-bold text-slate-400 block uppercase text-[9px]">
                          Talhão Selecionado ({selectedPlot.code}):
                        </span>
                        
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => { handleExportSelectedPlotGeoJSON(selectedPlot); setShowExportModal(false); }}
                            className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 hover:bg-emerald-50 text-slate-800 dark:text-zinc-200 font-bold text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
                          >
                            <Download className="w-3 h-3 text-emerald-600" /> GeoJSON
                          </button>
                          <button
                            type="button"
                            onClick={() => { handleExportSelectedPlotKML(selectedPlot); setShowExportModal(false); }}
                            className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 hover:bg-amber-50 text-slate-800 dark:text-zinc-200 font-bold text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
                          >
                            <Download className="w-3 h-3 text-amber-600" /> KML
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Export Success Feedback Notification */}
          {exportFeedback && (
            <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-lg flex items-center justify-between animate-fade-in">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {exportFeedback}
              </span>
              <button onClick={() => setExportFeedback(null)} className="p-0.5 hover:opacity-80 cursor-pointer">✕</button>
            </div>
          )}

          {/* Map wrapper container */}
          <div className="relative w-full h-[540px] rounded-3xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-sm bg-slate-100 dark:bg-zinc-950">
            <div ref={containerRef} className="w-full h-full" style={{ minHeight: '480px' }} />

            {/* Floating Top In-Map Quick Raster Controller ("Ajustar Camada") */}
            {showNdvi && (
              <div className="absolute top-3 left-14 sm:left-16 right-3 sm:right-auto z-[400] transition-all duration-300 max-w-[calc(100%-4.5rem)] sm:max-w-xl pointer-events-auto">
                {!isNdviPanelExpanded ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setIsNdviPanelExpanded(true)}
                      className="flex items-center gap-2 px-3.5 py-2 bg-slate-900/90 hover:bg-slate-900 text-white dark:bg-zinc-900/95 dark:hover:bg-zinc-900 backdrop-blur-md font-bold rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 cursor-pointer text-xs border border-emerald-500/40"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ajustar Camada: <strong className="text-emerald-300 font-mono">{ndviIndexType.toUpperCase()}</strong> ({Math.round(ndviOpacity * 100)}%)</span>
                      <SlidersHorizontal className="w-3.5 h-3.5 ml-1 text-emerald-400" />
                    </button>

                    {/* Quick opacity stepper presets while collapsed */}
                    <div className="hidden sm:flex items-center gap-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-1.5 py-1 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-md">
                      {[0.3, 0.6, 0.85, 1.0].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setNdviOpacity(val)}
                          className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-lg transition cursor-pointer ${
                            Math.abs(ndviOpacity - val) < 0.08
                              ? 'bg-emerald-600 text-white'
                              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                          }`}
                          title={`Opacidade ${Math.round(val * 100)}%`}
                        >
                          {Math.round(val * 100)}%
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-zinc-700/80 shadow-2xl flex flex-col gap-2.5 animate-fade-in text-xs w-full max-h-[85vh] overflow-y-auto">
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                          <Activity className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <div className="font-extrabold text-slate-800 dark:text-zinc-100 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                            <span>Ajustar Camada de Satélite & Drone</span>
                            <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-[9px] font-bold">
                              {ndviIndexType.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-400">
                            Selecione o índice biofísico e ajuste a transparência da sobreposição
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setShowIndexGuideModal(true)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-[10px] font-bold rounded-xl flex items-center gap-1 transition cursor-pointer"
                          title="Abrir Guia Científico dos 15 Índices"
                        >
                          <BookOpen className="w-3 h-3 text-emerald-500" />
                          <span className="hidden sm:inline">Guia</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsNdviPanelExpanded(false)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 transition cursor-pointer"
                          title="Recolher Barra de Ajuste"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Index Selector Scrollable Carousel */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-1">
                        <span>ÍNDICE ESPECTRAL (15 ALGORITMOS):</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-normal">Arraste para o lado &rarr;</span>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-zinc-800/80 p-1 rounded-xl overflow-x-auto scrollbar-thin scrollbar-thumb-emerald-500/40">
                        {(['ndvi', 'savi', 'evi', 'evi2', 'ndre', 'gndvi', 'wdrvi', 'cigreen', 'ndwi', 'ndsi', 'msavi2', 'rgb', 'vari', 'gli', 'tgi'] as const).map(type => {
                          const isActive = ndviIndexType === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setNdviIndexType(type)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                                isActive
                                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/50'
                                  : 'text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 hover:text-slate-900'
                              }`}
                            >
                              <span>{type === 'rgb' ? 'RGB Visível' : type === 'cigreen' ? 'CI Green' : type.toUpperCase()}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Opacity Controls Bar */}
                    <div className="bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1 shrink-0">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-500" />
                          Opacidade:
                        </span>
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.05"
                          value={ndviOpacity}
                          onChange={e => setNdviOpacity(parseFloat(e.target.value))}
                          className="flex-1 accent-emerald-600 cursor-pointer h-1.5"
                        />
                        <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 w-10 text-right shrink-0">
                          {Math.round(ndviOpacity * 100)}%
                        </span>
                      </div>

                      {/* Quick opacity preset buttons */}
                      <div className="flex items-center gap-1 self-end sm:self-center border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-zinc-700 pt-1.5 sm:pt-0 sm:pl-2.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase mr-1 sm:hidden">Predefinições:</span>
                        {[
                          { label: '25%', val: 0.25 },
                          { label: '50%', val: 0.50 },
                          { label: '75%', val: 0.75 },
                          { label: '100%', val: 1.00 }
                        ].map(p => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => setNdviOpacity(p.val)}
                            className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition cursor-pointer ${
                              Math.abs(ndviOpacity - p.val) < 0.05
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-white dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 border border-slate-200 dark:border-zinc-600'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Status bar */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {customRasters[selectedPlot?.id] ? 'Ortomosaico / Raster Personalizado' : `Satélite: ${activePass.satellite}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowLegend(prev => !prev)}
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Leaf className="w-3 h-3" />
                        <span>{showLegend ? 'Ocultar Legenda' : 'Ver Legenda de Cores'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mouse coords badge absolute overlay */}
            {mouseCoords && (
              <div className="absolute bottom-4 left-24 sm:left-28 z-40 bg-slate-900/85 backdrop-blur-md text-[10px] sm:text-xs text-white px-3 py-1.5 rounded-xl border border-white/20 font-mono font-bold flex items-center gap-2 shadow-md">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Lat: {mouseCoords.lat.toFixed(6)} | Lng: {mouseCoords.lng.toFixed(6)}
              </div>
            )}

            {/* Standard NDVI/SAVI/EVI Color Legend (Escala de Cores Padrão -1 a 1) */}
            {showNdvi && (
              showLegend ? (
                <div className="absolute bottom-4 right-4 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700/80 shadow-xl max-w-[280px] text-xs animate-fade-in">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5 font-black text-[11px] text-slate-800 dark:text-zinc-100">
                      <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Legenda de Cores {ndviIndexType.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                        -1.0 a +1.0
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowLegend(false)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
                        title="Ocultar Legenda"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Continuous Gradient Color Ramp Bar */}
                  <div className="mt-2.5">
                    <div
                      className="h-3.5 w-full rounded-md shadow-inner border border-black/10"
                      style={{
                        background:
                          ndviIndexType === 'ndwi'
                            ? 'linear-gradient(to right, #d73027 0%, #fee090 35%, #91bfdb 70%, #313695 100%)'
                            : ndviIndexType === 'ndsi'
                            ? 'linear-gradient(to right, #e67832 0%, #dcdc82 35%, #40c4ff 70%, #1464dc 100%)'
                            : ndviIndexType === 'msavi2'
                            ? 'linear-gradient(to right, #b46e3c 0%, #e6d250 35%, #28b450 70%, #0a7828 100%)'
                            : ndviIndexType === 'rgb'
                            ? 'linear-gradient(to right, #8c6946 0%, #6ea54b 50%, #2d732d 100%)'
                            : ndviIndexType === 'cigreen'
                            ? 'linear-gradient(to right, #fabe50 0%, #82c850 45%, #0f6e2d 100%)'
                            : ndviIndexType === 'wdrvi'
                            ? 'linear-gradient(to right, #d73027 0%, #f0d232 40%, #148c3c 100%)'
                            : ndviIndexType === 'vari'
                            ? 'linear-gradient(to right, #be5a32 0%, #d2c85a 35%, #28aa46 100%)'
                            : ndviIndexType === 'gli'
                            ? 'linear-gradient(to right, #c86e46 0%, #96d25a 35%, #198732 100%)'
                            : ndviIndexType === 'tgi'
                            ? 'linear-gradient(to right, #dc8c3c 0%, #a0d250 40%, #0f7d37 100%)'
                            : 'linear-gradient(to right, #d73027 0%, #f46d43 15%, #fdae61 30%, #a6d96a 50%, #66bd63 70%, #1a9850 100%)'
                      }}
                    />
                    <div className="flex justify-between text-[9px] font-mono font-bold text-slate-500 dark:text-zinc-400 mt-1">
                      <span>&lt;0.10</span>
                      <span>0.30</span>
                      <span>0.50</span>
                      <span>0.70</span>
                      <span>1.00</span>
                    </div>
                  </div>

                  {/* Legend Reference Categories */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-[10px] text-slate-600 dark:text-zinc-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1a9850] shrink-0" />
                      <span>Alta Atividade (0.7-1.0)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#66bd63] shrink-0" />
                      <span>Veg. Densa (0.5-0.7)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#a6d96a] shrink-0" />
                      <span>Veg. Moderada (0.3-0.5)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#fdae61] shrink-0" />
                      <span>Veg. Fraca (0.1-0.3)</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#d73027] shrink-0" />
                      <span>Solo Exposto / Não Vegetado (&lt;0.10)</span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                    <button
                      type="button"
                      onClick={() => handleRunNdviAiAnalysis()}
                      className="w-full py-1.5 px-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer text-[10px]"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                      <span>Analisar Tomada de Decisão com a Nema</span>
                    </button>
                    <div className="flex items-center justify-between text-[9px] text-slate-400">
                      <span>{customRasters[selectedPlot?.id] ? 'Raster: Drone / Ortomosaico' : `Satélite: ${activePass.satellite.split(' ')[0]}`}</span>
                      <span>Opacidade: {Math.round(ndviOpacity * 100)}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowLegend(true)}
                  className="absolute bottom-4 right-4 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-200 dark:border-zinc-700/80 shadow-xl flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-800 transition cursor-pointer animate-fade-in"
                  title="Mostrar Legenda de Cores"
                >
                  <Leaf className="w-4 h-4 text-emerald-500" />
                  <span>Mostrar Legenda</span>
                  <Eye className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                </button>
              )
            )}

            {/* Drawing mode help tooltip absolute overlay */}
            {isDrawing && (
              <div className="absolute top-4 left-14 sm:left-16 z-40 bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-xl border border-amber-400 shadow-md flex items-center gap-2 animate-bounce">
                <Sparkles className="w-4 h-4 animate-pulse" />
                Modo Desenho Ativo: Use o mouse ou a barra Leaflet.Draw para delimitar
              </div>
            )}
          </div>

          {/* Point Sample Inspector Banner (When clicking in NDVI mode) */}
          {pointSample && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in shadow-xs">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-md"
                  style={{ backgroundColor: pointSample.color }}
                >
                  {pointSample.val}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-emerald-950 dark:text-emerald-200">
                      PONTO AMOSTRADO: {pointSample.classification} ({pointSample.indexName})
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      ({pointSample.lat.toFixed(5)}, {pointSample.lng.toFixed(5)})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-300 mt-0.5 leading-snug">
                    {pointSample.recommendation}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <div className="text-right text-[10px]">
                  <span className="text-slate-400 block">Biomassa Est.</span>
                  <strong className="text-slate-800 dark:text-zinc-200">{pointSample.biomass}</strong>
                </div>
                <div className="text-right text-[10px]">
                  <span className="text-slate-400 block">Clorofila</span>
                  <strong className="text-slate-800 dark:text-zinc-200">{pointSample.chlorophyll}</strong>
                </div>
                <button
                  onClick={() => setPointSample(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar GIS Controller & Inspector */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* Section Tab bar selector */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-1.5 rounded-2xl flex items-center gap-1 shadow-2xs">
            <button
              onClick={() => { setActiveTab('list'); setIsDrawing(false); }}
              className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === 'list' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
              }`}
            >
              Talhões
            </button>
            <button
              onClick={() => { setActiveTab('draw'); setIsDrawing(false); }}
              className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === 'draw' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
              }`}
            >
              Delimitar
            </button>
            <button
              onClick={() => { setActiveTab('layers'); setIsDrawing(false); }}
              className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'layers' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
              }`}
              title="Gerenciador Multicamadas (Drag & Drop)"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Camadas</span>
            </button>
            <button
              onClick={() => { setActiveTab('ndvi'); setIsDrawing(false); }}
              className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'ndvi' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>NDVI & Raster</span>
            </button>
            <button
              onClick={() => { setActiveTab('pois'); setIsDrawing(false); }}
              className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === 'pois' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
              }`}
            >
              POIs
            </button>
          </div>

          {/* TAB 1: PLOT LIST & DETAILED INSPECTOR */}
          {activeTab === 'list' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4 flex-1">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Boxes className="w-4 h-4 text-emerald-600" />
                  Talhões da Propriedade
                </h4>
                <span className="text-xs bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-bold">
                  {plots.length} Unidades
                </span>
              </div>

              {/* Scrollable Plots list */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {plots.map(plot => {
                  const isSelected = selectedPlot.id === plot.id;
                  const hasQuarantine = lots.some(l => (l.plotId === plot.id || l.plotCode === plot.code) && l.isUnderActiveQuarantine);

                  return (
                    <div
                      key={plot.id}
                      onClick={() => setSelectedPlot(plot)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-xs flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                          : 'bg-slate-50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold">{plot.code}</span>
                          <span className="text-[10px] text-slate-400 font-medium capitalize">{(plot.structureType || 'campo_aberto').replace('_', ' ')}</span>
                        </div>
                        <p className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">{plot.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{plot.currentCrop ? `${plot.currentCrop} (${plot.currentCultivar})` : 'Sem plantio'}</p>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                        <div className="flex items-center gap-1">
                          <span className="font-bold bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-800">
                            {plot.areaHa} ha
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditPlot(plot, e)}
                            className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-800 rounded transition cursor-pointer"
                            title="Editar Talhão"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeletePlot(plot, e)}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-zinc-800 rounded transition cursor-pointer"
                            title="Excluir Talhão"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {hasQuarantine && (
                          <span className="text-[9px] font-bold text-rose-600 bg-rose-100 px-1 rounded uppercase">Carência</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Inspector for selected plot */}
              {selectedPlot && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 space-y-3 mt-2 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-zinc-800 flex-wrap gap-2">
                    <span className="font-black text-xs text-emerald-800 dark:text-emerald-300">INSPECIONAR: {selectedPlot.code}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditPlot(selectedPlot, e)}
                        className="text-[10px] text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-200/80 dark:border-emerald-800/80 transition"
                        title="Editar Dados do Talhão"
                      >
                        <Pencil className="w-3 h-3 text-emerald-600" />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeletePlot(selectedPlot, e)}
                        className="text-[10px] text-rose-700 dark:text-rose-300 hover:text-rose-900 font-bold flex items-center gap-1 cursor-pointer bg-rose-100/70 dark:bg-rose-950/60 px-2 py-1 rounded-lg border border-rose-200/80 dark:border-rose-800/80 transition"
                        title="Excluir Talhão"
                      >
                        <Trash2 className="w-3 h-3 text-rose-600" />
                        <span>Excluir</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPlotToDelimit(selectedPlot.id);
                          if (selectedPlot.croquiData) {
                            try { setDrawVertices(JSON.parse(selectedPlot.croquiData)); } catch {}
                          }
                          setActiveTab('draw');
                        }}
                        className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer ml-1"
                      >
                        Editar Fronteira &rarr;
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] text-slate-600 dark:text-zinc-400">
                    <div>
                      <span>Área Cultivada:</span>
                      <strong className="block text-slate-900 dark:text-white">{selectedPlot.areaHa} ha</strong>
                    </div>
                    <div>
                      <span>Manejo de Irrigação:</span>
                      <strong className="block text-slate-900 dark:text-white capitalize">{selectedPlot.irrigationSystem}</strong>
                    </div>
                    <div>
                      <span>Tipo de Solo:</span>
                      <strong className="block text-slate-900 dark:text-white truncate" title={selectedPlot.soilType}>{selectedPlot.soilType}</strong>
                    </div>
                    <div>
                      <span>Fisiologia Ativa:</span>
                      <strong className="block text-slate-900 dark:text-white truncate">{selectedPlot.currentCrop || 'Livre'}</strong>
                    </div>
                  </div>

                  {/* Lots in plot */}
                  {selectedPlotLots.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/50 dark:border-zinc-800 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Lotes de Rastreabilidade Ativos:</span>
                      {selectedPlotLots.map(lot => (
                        <div key={lot.id} className="p-2 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                          <div>
                            <strong className="text-emerald-600 dark:text-emerald-400 block font-mono">{lot.lotCode}</strong>
                            <span className="text-slate-500 font-medium">{lot.cropName} ({lot.cultivarName})</span>
                          </div>
                          <button
                            onClick={() => onOpenPassport(lot)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10px] cursor-pointer"
                          >
                            Passaporte
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Direct Export Buttons for this Plot */}
                  <div className="pt-2.5 border-t border-slate-200/50 dark:border-zinc-800 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleExportSelectedPlotGeoJSON(selectedPlot)}
                      className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-bold rounded-lg text-[10px] transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-emerald-600" /> Exportar GeoJSON
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportSelectedPlotKML(selectedPlot)}
                      className="flex-1 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-bold rounded-lg text-[10px] transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-amber-600" /> Exportar KML
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DELIMITATION & LEAFLET.DRAW WORKBENCH */}
          {activeTab === 'draw' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4 flex-1">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-amber-500" />
                  Delimitação SIG & Leaflet.Draw
                </h4>
                <span className="text-xs text-amber-600 font-bold bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">
                  {drawVertices.length} Vértices
                </span>
              </div>

              {/* Target Plot Selection */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Selecionar Talhão Alvo:</label>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    {plots.length} talhão(ões) disponível(is)
                  </span>
                </div>
                <select
                  value={selectedPlotToDelimit}
                  onChange={e => {
                    const id = e.target.value;
                    setSelectedPlotToDelimit(id);
                    if (id === '__new_plot__') {
                      return;
                    }
                    const plot = plots.find(p => p.id === id);
                    if (plot && plot.croquiData) {
                      try { setDrawVertices(JSON.parse(plot.croquiData)); } catch { setDrawVertices([]); }
                    } else {
                      setDrawVertices([]);
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium text-slate-800 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                >
                  {plots.length === 0 ? (
                    <option value="__new_plot__">+ Criar Novo Talhão com este Polígono</option>
                  ) : (
                    <>
                      {plots.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.code} - {p.name} {p.areaHa ? `(${p.areaHa} ha)` : ''}
                        </option>
                      ))}
                      <option value="__new_plot__">+ Criar Novo Talhão com este Polígono</option>
                    </>
                  )}
                </select>

                {selectedPlotToDelimit === '__new_plot__' && (
                  <div className="pt-1 animate-fadeIn">
                    <input
                      type="text"
                      placeholder={`Nome do novo talhão (ex: Talhão 0${plots.length + 1})`}
                      value={newPlotCustomName}
                      onChange={e => setNewPlotCustomName(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-emerald-400 dark:border-emerald-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400"
                    />
                  </div>
                )}
              </div>

              {/* Interactive Delimitation controls */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {!isDrawing ? (
                    <button
                      type="button"
                      onClick={() => setIsDrawing(true)}
                      className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-4 h-4" /> Iniciar Desenho Livre
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsDrawing(false)}
                      className="flex-1 py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" /> Pausar Desenho
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => { setDrawVertices([]); }}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-400 rounded-xl transition cursor-pointer"
                    title="Limpar Vértices"
                  >
                    <Trash2 className="w-4.5 h-4.5 text-rose-500" />
                  </button>
                </div>

                <div className="text-[10px] text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-zinc-800 leading-relaxed">
                  💡 <strong>Dica:</strong> Você também pode usar a barra <strong>Leaflet.Draw</strong> no topo esquerdo do mapa para desenhar polígonos ou retângulos e editar vértices livremente!
                </div>

                {drawVertices.length > 0 && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 dark:text-zinc-300">Área Calculada:</span>
                      <strong className="text-sm text-amber-700 dark:text-amber-300">{drawArea} hectares (ha)</strong>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-none">Vértices demarcados: <strong>{drawVertices.length} pontos</strong></p>
                  </div>
                )}
              </div>

              {/* Import/Paste and vertex manager list */}
              <div className="space-y-3 pt-3 border-t border-slate-200/50 dark:border-zinc-800 text-xs">
                {/* Save vertices back to selected plot */}
                <button
                  type="button"
                  onClick={handleSaveDelimitation}
                  disabled={drawVertices.length < 3}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  {selectedPlotToDelimit === '__new_plot__' || plots.length === 0
                    ? (drawArea > 0 ? `Criar Novo Talhão (${drawArea} ha)` : 'Criar Novo Talhão')
                    : (drawArea > 0 ? `Salvar Polígono no Talhão (${drawArea} ha)` : 'Salvar Polígono no Talhão')}
                </button>

                {/* Import paste coordination segment */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-700 dark:text-zinc-400 block uppercase text-[10px]">Importar Coordenadas ou Arquivo GeoJSON:</label>
                  
                  {/* File Upload for GeoJSON */}
                  <div className="border border-dashed border-slate-300 dark:border-zinc-700 p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/20 text-center relative hover:bg-slate-100 dark:hover:bg-zinc-800 transition">
                    <input
                      type="file"
                      accept=".json,.geojson"
                      onChange={handleImportGeoJSONFile}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <Upload className="w-4 h-4 text-emerald-500 animate-bounce" />
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold">Importar arquivo .GeoJSON / .JSON</span>
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={coordPasteText}
                    onChange={e => setCoordPasteText(e.target.value)}
                    placeholder="Ou cole os pontos aqui:&#10;-22.3712, -46.9419&#10;-22.3718, -46.9424"
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-[10px] font-mono outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleImportCoordinates}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-500" /> Carregar Texto
                    </button>
                    <button
                      type="button"
                      onClick={handleExportGeoJSON}
                      disabled={drawVertices.length === 0}
                      className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 disabled:opacity-40 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" /> GeoJSON
                    </button>
                    <button
                      type="button"
                      onClick={handleExportDrawnKML}
                      disabled={drawVertices.length === 0}
                      className="flex-1 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 disabled:opacity-40 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-600" /> KML Drones
                    </button>
                  </div>
                  {importStatus === 'success' && <p className="text-[10px] text-emerald-600 font-bold">✓ Coordenadas carregadas com sucesso!</p>}
                  {importStatus === 'error' && <p className="text-[10px] text-rose-500 font-bold">✗ Erro ao extrair coordenadas válidas. Verifique o formato.</p>}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NDVI & VEGETATION INDEX CONTROLLER */}
          {activeTab === 'ndvi' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4 flex-1">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-emerald-500" />
                  Painel de Sensoriamento NDVI
                </h4>
                <button
                  onClick={() => setShowNdvi(!showNdvi)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer ${
                    showNdvi ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-600'
                  }`}
                >
                  {showNdvi ? 'Camada Ativa' : 'Desativada'}
                </button>
              </div>

              {/* Recalculate Index Action Banner */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-3 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-emerald-600" />
                    Cálculo de Índices Espectrais
                  </span>
                  <button
                    onClick={handleCalculateIndex}
                    disabled={isCalculatingIndex}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-[10px] rounded-xl transition flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Zap className={`w-3.5 h-3.5 ${isCalculatingIndex ? 'animate-spin' : ''}`} />
                    <span>{isCalculatingIndex ? 'Processando...' : 'Calcular / Atualizar'}</span>
                  </button>
                </div>
                {calculationFeedback && (
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold animate-fade-in">
                    ✓ {calculationFeedback}
                  </p>
                )}
              </div>

              {/* Vegetation Index Selection Dropdown Menu */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    Seletor de Índice de Vegetação:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowIndexGuideModal(true)}
                    className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900 border border-emerald-300/60 dark:border-emerald-800 px-2 py-0.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Guia de Índices (15)</span>
                  </button>
                </div>

                {/* Categorized Dropdown Select Input */}
                <div className="relative">
                  <select
                    value={ndviIndexType}
                    onChange={e => setNdviIndexType(e.target.value as any)}
                    className="w-full p-3 bg-slate-50 dark:bg-zinc-800/80 border-2 border-slate-200 dark:border-zinc-700/80 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-2xl text-xs font-bold text-slate-800 dark:text-zinc-100 outline-none transition cursor-pointer appearance-none pr-10 shadow-xs"
                  >
                    <optgroup label="🌱 Multiespectrais (Infravermelho NIR / RedEdge)">
                      <option value="ndvi">NDVI — Vigor Vegetativo Geral — (NIR-RED)/(NIR+RED)</option>
                      <option value="savi">SAVI — Ajuste de Solo (L=0.5) — Fase Inicial</option>
                      <option value="evi">EVI — Canópias Densas — Sem Saturação</option>
                      <option value="evi2">EVI2 — 2 Bandas (Otimizado sem Banda Azul)</option>
                      <option value="ndre">NDRE — Borda Vermelha — Clorofila Folha</option>
                      <option value="gndvi">GNDVI — Absorção de Nitrogênio — (NIR-GREEN)</option>
                      <option value="wdrvi">WDRVI — Ampla Faixa Dinâmica — (a*NIR-RED)</option>
                      <option value="cigreen">Clorofila Green — CI Green — Clorofila & N</option>
                    </optgroup>
                    <optgroup label="💧 Umidade Edáfica & Estresse Hídrico">
                      <option value="ndwi">NDWI — Teor de Água & Estresse Hídrico</option>
                      <option value="ndsi">NDSI — Umidade Edáfica / Geada</option>
                      <option value="msavi2">MSAVI2 — Mod. Soil Adjusted Index — Plantio & Solo Exposto</option>
                    </optgroup>
                    <optgroup label="📸 Sensores Visíveis & Drones (RGB)">
                      <option value="rgb">Visível (RGB) — Cor Real Espectro Visível</option>
                      <option value="vari">VARI — Sensor Visível Corrigido</option>
                      <option value="gli">GLI — Índice de Folha Verde (RGB)</option>
                      <option value="tgi">TGI — Clorofila Triangular (RGB)</option>
                    </optgroup>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 dark:text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Active Selected Index Quick Specs Card */}
                {(() => {
                  const current = VEGETATION_INDEX_DETAILS[ndviIndexType] || VEGETATION_INDEX_DETAILS['ndvi'];

                  return (
                    <div className="p-3.5 bg-gradient-to-br from-emerald-50/90 to-teal-50/60 dark:from-emerald-950/50 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl space-y-2 animate-fade-in shadow-2xs">
                      <div className="flex items-center justify-between gap-2 border-b border-emerald-200/60 dark:border-emerald-800/60 pb-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs">{current.categoryIcon}</span>
                          <span className="font-black text-emerald-950 dark:text-emerald-100 text-xs truncate">
                            {current.label}
                          </span>
                        </div>
                        <span className="font-mono text-[9px] bg-emerald-200/90 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 px-2 py-0.5 rounded-md font-black shrink-0 border border-emerald-300/50 dark:border-emerald-700">
                          {current.formula}
                        </span>
                      </div>

                      {/* Breve Explicação */}
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-0.5">
                          Breve Explicação:
                        </span>
                        <p className="text-[11px] text-slate-700 dark:text-zinc-200 font-medium leading-snug">
                          {current.desc}
                        </p>
                      </div>

                      {/* O Que Mede & Aplicação */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5 text-[10px]">
                        <div className="bg-white/80 dark:bg-zinc-900/80 p-2 rounded-xl border border-emerald-100 dark:border-zinc-800">
                          <span className="font-black text-emerald-800 dark:text-emerald-300 block uppercase text-[8px]">
                            🔍 O Que Mede na Planta:
                          </span>
                          <span className="text-slate-600 dark:text-zinc-300 leading-tight block mt-0.5 font-medium">
                            {current.whatItMeasures}
                          </span>
                        </div>
                        <div className="bg-white/80 dark:bg-zinc-900/80 p-2 rounded-xl border border-emerald-100 dark:border-zinc-800">
                          <span className="font-black text-emerald-800 dark:text-emerald-300 block uppercase text-[8px]">
                            🎯 Aplicação Ideal em Campo:
                          </span>
                          <span className="text-slate-600 dark:text-zinc-300 leading-tight block mt-0.5 font-medium">
                            {current.bestUse}
                          </span>
                        </div>
                      </div>

                      {/* Faixa Típica */}
                      <div className="flex items-center justify-between text-[10px] bg-emerald-100/50 dark:bg-emerald-900/40 p-2 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
                        <span className="text-slate-600 dark:text-zinc-300 font-medium">
                          <strong>Faixa de Valores:</strong> {current.typicalRange}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowIndexGuideModal(true)}
                          className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 underline hover:text-emerald-900 shrink-0 cursor-pointer ml-2"
                        >
                          Guia Completo (15) →
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Opacity Control Interface with Quick Preset Buttons */}
              <div className="space-y-2 text-xs pt-1 p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-200 dark:border-zinc-800">
                <div className="flex items-center justify-between text-slate-700 dark:text-zinc-300">
                  <span className="flex items-center gap-1 font-bold">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-500" />
                    Controle de Opacidade da Camada Raster:
                  </span>
                  <span className="font-mono font-bold bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 text-emerald-600">
                    {Math.round(ndviOpacity * 100)}%
                  </span>
                </div>
                
                {/* Continuous Slider */}
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={ndviOpacity}
                  onChange={e => setNdviOpacity(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-2"
                />

                {/* Preset Quick Buttons */}
                <div className="flex items-center gap-1 pt-1">
                  {[0.25, 0.5, 0.75, 1.0].map(val => (
                    <button
                      key={val}
                      onClick={() => setNdviOpacity(val)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
                        ndviOpacity === val
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                      }`}
                    >
                      {Math.round(val * 100)}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Import Custom Raster / Drone / GeoTIFF Image */}
              <div className="space-y-2 text-xs p-3.5 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-200/80 dark:border-blue-900/50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                    <FileImage className="w-4 h-4 text-blue-500" />
                    Importar Imagem NDVI / Ortomosaico Drone
                  </span>
                  <span className="text-[10px] text-blue-600 font-mono font-bold">{selectedPlot?.code}</span>
                </div>
                
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                  Faça o upload do mapa NDVI gerado pelo seu drone (DJI, Pix4D, DroneDeploy) ou arquivo GeoTIFF/PNG para sobrepor ao polígono:
                </p>

                <div className="border border-dashed border-blue-300 dark:border-blue-800 p-2.5 rounded-xl bg-white dark:bg-zinc-900 text-center relative hover:bg-blue-50 dark:hover:bg-zinc-800 transition">
                  <input
                    type="file"
                    accept=".tif,.tiff,.png,.jpg,.jpeg"
                    onChange={handleImportCustomRaster}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <Upload className="w-4 h-4 text-blue-500 animate-bounce" />
                    <span className="text-[10px] text-slate-700 dark:text-zinc-300 font-bold">Selecionar Imagem NDVI (.TIF / .PNG / .JPG)</span>
                  </div>
                </div>

                {/* Show Custom Raster if attached */}
                {customRasters[selectedPlot?.id] && (
                  <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-blue-200 dark:border-blue-900 flex items-center justify-between text-[10px]">
                    <div>
                      <strong className="text-blue-700 dark:text-blue-300 block truncate max-w-[180px]">
                        {customRasters[selectedPlot.id].fileName}
                      </strong>
                      <span className="text-slate-400">
                        {customRasters[selectedPlot.id].fileSize} • {customRasters[selectedPlot.id].uploadedAt}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveCustomRaster(selectedPlot.id)}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded transition cursor-pointer"
                      title="Remover Imagem e Voltar ao Satélite"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Satellite Orbital Pass Picker */}
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-slate-700 dark:text-zinc-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  Passagem Orbital do Satélite Sentinel-2:
                </label>
                <select
                  value={selectedPassId}
                  onChange={e => setSelectedPassId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium"
                >
                  {SATELLITE_PASSES.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
                <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                  <span>Cobertura de Nuvens: <strong>{activePass.cloudCover}</strong></span>
                  <span>Sensor: <strong>{activePass.satellite}</strong></span>
                </div>
              </div>

              {/* Selected Plot NDVI Metrics */}
              {selectedPlotNdviStats && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 dark:border-zinc-700">
                    <span className="font-bold text-xs text-slate-800 dark:text-zinc-200">
                      Métricas do Talhão: {selectedPlot.code}
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                      {ndviIndexType.toUpperCase()} Médio: {selectedPlotNdviStats.meanVal}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="p-1.5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
                      <span className="text-slate-400 block">Mínimo</span>
                      <strong className="text-rose-600 text-xs font-mono">{selectedPlotNdviStats.minVal}</strong>
                    </div>
                    <div className="p-1.5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
                      <span className="text-slate-400 block">Médio</span>
                      <strong className="text-emerald-600 text-xs font-mono">{selectedPlotNdviStats.meanVal}</strong>
                    </div>
                    <div className="p-1.5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
                      <span className="text-slate-400 block">Máximo</span>
                      <strong className="text-emerald-700 text-xs font-mono">{selectedPlotNdviStats.maxVal}</strong>
                    </div>
                  </div>

                  {/* Vigor Zones Distribution Bar */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Distribuição Zonal de Manejo:</span>
                    <div className="h-2 w-full flex rounded-full overflow-hidden">
                      <div style={{ width: `${selectedPlotNdviStats.highVigorPct}%` }} className="bg-emerald-600" title={`Alto Vigor: ${selectedPlotNdviStats.highVigorPct}%`} />
                      <div style={{ width: `${selectedPlotNdviStats.moderateVigorPct}%` }} className="bg-amber-500" title={`Vigor Médio: ${selectedPlotNdviStats.moderateVigorPct}%`} />
                      <div style={{ width: `${selectedPlotNdviStats.stressSoilPct}%` }} className="bg-rose-500" title={`Estresse/Solo: ${selectedPlotNdviStats.stressSoilPct}%`} />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500">
                      <span className="text-emerald-600 font-bold">● Alto: {selectedPlotNdviStats.highVigorPct}%</span>
                      <span className="text-amber-500 font-bold">● Médio: {selectedPlotNdviStats.moderateVigorPct}%</span>
                      <span className="text-rose-500 font-bold">● Baixo: {selectedPlotNdviStats.stressSoilPct}%</span>
                    </div>
                  </div>

                  {/* Nema IA Decision Button */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-700">
                    <button
                      type="button"
                      onClick={() => handleRunNdviAiAnalysis()}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs group"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse group-hover:scale-110 transition-transform" />
                      <span>Analisar Tomada de Decisão com a Nema</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: POIS MARKERS SYSTEM */}
          {activeTab === 'pois' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4 flex-1">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <PinIcon className="w-4 h-4 text-emerald-500" />
                  Marcadores de Interesse (POI)
                </h4>
                <span className="text-xs bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-bold">
                  {pois.length} Ativos
                </span>
              </div>

              {/* Add New POI form */}
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs space-y-2">
                <span className="font-bold text-[10px] uppercase text-emerald-700 block">Adicionar Marcador Técnico:</span>
                
                <div className="space-y-1">
                  <label className="text-slate-500">Nome do Marcador:</label>
                  <input
                    type="text"
                    value={newPoiName}
                    onChange={e => setNewPoiName(e.target.value)}
                    placeholder="Ex: Poço, Amostra Solo T1"
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-500">Tipo de Estrutura:</label>
                    <select
                      value={newPoiType}
                      onChange={e => setNewPoiType(e.target.value as any)}
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-[11px]"
                    >
                      <option value="soil">🧪 Amostra de Solo</option>
                      <option value="nematode">🪱 Reboleira de Nematoides</option>
                      <option value="pest">🐛 Foco de Praga</option>
                      <option value="disease">🍂 Foco de Doença</option>
                      <option value="well">💧 Poço Artesiano</option>
                      <option value="water">🌊 Caixa d'Água</option>
                      <option value="trap">🪰 Armadilha MIP</option>
                      <option value="station">🌤️ Estação Clima</option>
                      <option value="gate">🚪 Porteira</option>
                      <option value="house">🏠 Packing House</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500">Coordenadas:</label>
                    <div className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-[10px] font-mono select-all truncate text-slate-700 dark:text-zinc-300">
                      {newPoiCoords ? `${newPoiCoords.lat.toFixed(4)}, ${newPoiCoords.lng.toFixed(4)}` : "Clique no Mapa"}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddPOI}
                  disabled={!newPoiName.trim() || !newPoiCoords}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600 text-white font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Adicionar Marcador
                </button>
              </div>

              {/* POI List Scrollable */}
              <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-1">
                {pois.map(poi => {
                  const labelMap: Record<CustomPOI['type'], string> = {
                    soil: 'Amostra de Solo',
                    nematode: 'Reboleira de Nematoides',
                    pest: 'Foco de Praga',
                    disease: 'Foco de Doença',
                    well: 'Poço Artesiano',
                    water: 'Reservatório Hídrico',
                    trap: 'Armadilha MIP',
                    station: 'Estação Clima',
                    gate: 'Acesso Principal',
                    house: 'Sede / Packing',
                  };
                  return (
                    <div key={poi.id} className="p-2.5 bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-slate-800 dark:text-zinc-200 block">{poi.name}</strong>
                        <span className="text-[10px] text-slate-400 font-medium block">{labelMap[poi.type]}</span>
                        <span className="text-[9px] font-mono text-slate-400 block">{poi.lat.toFixed(5)}, {poi.lng.toFixed(5)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeletePOI(poi.id)}
                        className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 rounded transition shrink-0 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: MULTILAYER STACK & DRAG-AND-DROP MANAGER */}
          {activeTab === 'layers' && (
            <div className="flex-1">
              <LayerManagerSidebar
                layers={overlayLayers}
                onLayersChange={handleUpdateLayers}
                onResetLayers={handleResetLayers}
              />
            </div>
          )}
        </div>
      </div>

      {/* EDIT PLOT MODAL DIALOG */}
      {editingPlot && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white">
                <Pencil className="w-5 h-5 text-emerald-600" />
                <span>Editar Talhão {editingPlot.code}</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingPlot(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPlot} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Código do Talhão *
                  </label>
                  <input
                    type="text"
                    required
                    value={plotFormData.code}
                    onChange={e => setPlotFormData(p => ({ ...p, code: e.target.value }))}
                    placeholder="Ex: EST-01, TAL-04"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Área (Hectares) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={plotFormData.areaHa}
                    onChange={e => setPlotFormData(p => ({ ...p, areaHa: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Nome / Identificador *
                </label>
                <input
                  type="text"
                  required
                  value={plotFormData.name}
                  onChange={e => setPlotFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Estufa 01 - Tomate Especial"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Cultura Atual
                  </label>
                  <input
                    type="text"
                    value={plotFormData.currentCrop}
                    onChange={e => setPlotFormData(p => ({ ...p, currentCrop: e.target.value }))}
                    placeholder="Ex: Tomate, Milho, Alface"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Cultivar / Variedade
                  </label>
                  <input
                    type="text"
                    value={plotFormData.currentCultivar}
                    onChange={e => setPlotFormData(p => ({ ...p, currentCultivar: e.target.value }))}
                    placeholder="Ex: Sweet Grape, BRS 1030"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Sistema de Irrigação
                  </label>
                  <select
                    value={plotFormData.irrigationSystem}
                    onChange={e => setPlotFormData(p => ({ ...p, irrigationSystem: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="gotejamento">Gotejamento</option>
                    <option value="pivo">Pivô Central</option>
                    <option value="aspersao">Aspersão</option>
                    <option value="sequeiro">Sequeiro (Sem Irrigação)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Estrutura de Cultivo
                  </label>
                  <select
                    value={plotFormData.structureType}
                    onChange={e => setPlotFormData(p => ({ ...p, structureType: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="campo_aberto">Campo Aberto</option>
                    <option value="estufa_plastica">Estufa Plástica</option>
                    <option value="telado">Telado / Sombredor</option>
                    <option value="hidroponia">Hidroponia</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Tipo de Solo
                </label>
                <input
                  type="text"
                  value={plotFormData.soilType}
                  onChange={e => setPlotFormData(p => ({ ...p, soilType: e.target.value }))}
                  placeholder="Ex: Franco-Argiloso, Latossolo Vermelho"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPlot(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GEMINI AI NDVI DECISION ASSISTANT MODAL */}
      {showNdviAiModal && selectedPlot && (
        <div className="fixed inset-0 z-[1200] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-amber-400 p-0.5 shadow-lg flex items-center justify-center">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                      Nema IA
                    </h3>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider">
                      Sensoriamento Remoto
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                    <span>Talhão: <strong>{selectedPlot.code} - {selectedPlot.name}</strong> ({selectedPlot.areaHa} ha)</span>
                    <span>•</span>
                    <span>Índice: <strong>{ndviIndexType.toUpperCase()}</strong></span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowNdviAiModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
              {/* Loading State */}
              {isAnalyzingNdviAi && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-600 animate-spin" />
                    <Brain className="w-8 h-8 text-emerald-600 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-800 dark:text-zinc-100">
                      Analisando Matriz Vegetacional com Nema IA...
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mt-1">
                      Avaliando padrões de reflectância espectral, distribuição zonal de vigor e cruzando com o perfil edafoclimático do talhão.
                    </p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {ndviAiError && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl text-rose-800 dark:text-rose-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>Erro no Processamento Inteligente</span>
                  </div>
                  <p>{ndviAiError}</p>
                  <button
                    type="button"
                    onClick={() => handleRunNdviAiAnalysis()}
                    className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700 transition cursor-pointer"
                  >
                    Tentar Novamente
                  </button>
                </div>
              )}

              {/* Success Data Presentation */}
              {!isAnalyzingNdviAi && ndviAiData && (
                <div className="space-y-5 animate-fade-in text-xs">
                  {/* Executive Overview Header Box */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-lg space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        {/* Overall Score Badge */}
                        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Escore</span>
                          <span className="text-xl font-black font-mono text-emerald-400">{ndviAiData.overallHealthScore}</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-zinc-100">Diagnóstico Geral do Vigor Vegetativo</span>
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                              ndviAiData.riskLevel === 'Baixo' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                              ndviAiData.riskLevel === 'Moderado' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                              'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            }`}>
                              Risco {ndviAiData.riskLevel}
                            </span>
                          </div>
                          <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                            {ndviAiData.executiveSummary}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Fast Stats Bar */}
                    {selectedPlotNdviStats && (
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                        <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                          <span className="text-slate-400 block font-medium">Mínimo ({ndviIndexType.toUpperCase()})</span>
                          <strong className="text-rose-400 font-mono text-xs">{selectedPlotNdviStats.minVal}</strong>
                        </div>
                        <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                          <span className="text-slate-400 block font-medium">Média Vegetativa</span>
                          <strong className="text-emerald-400 font-mono text-xs">{selectedPlotNdviStats.meanVal}</strong>
                        </div>
                        <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                          <span className="text-slate-400 block font-medium">Máximo Pico</span>
                          <strong className="text-teal-300 font-mono text-xs">{selectedPlotNdviStats.maxVal}</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Zonal Analysis Breakdown Cards */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      <span>Análise Fisiológica Zonal ({ndviIndexType.toUpperCase()})</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* High Vigor Card */}
                      <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-1.5">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                          Alto Vigor (&gt;0.60)
                        </span>
                        <p className="text-slate-700 dark:text-zinc-300 text-[11px] leading-relaxed">
                          {ndviAiData.vigorDistributionAnalysis.highVigorAssessment}
                        </p>
                      </div>

                      {/* Moderate Vigor Card */}
                      <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-1.5">
                        <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 text-xs">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          Vigor Moderado (0.30-0.60)
                        </span>
                        <p className="text-slate-700 dark:text-zinc-300 text-[11px] leading-relaxed">
                          {ndviAiData.vigorDistributionAnalysis.moderateVigorAssessment}
                        </p>
                      </div>

                      {/* Stress / Soil Card */}
                      <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 space-y-1.5">
                        <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 text-xs">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          Estresse / Solo (&lt;0.30)
                        </span>
                        <p className="text-slate-700 dark:text-zinc-300 text-[11px] leading-relaxed">
                          {ndviAiData.vigorDistributionAnalysis.stressSoilAssessment}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Field Action Prescriptions */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>Prescrições Práticas e Ações de Campo (Manejo)</span>
                    </h4>

                    <div className="space-y-2">
                      {ndviAiData.fieldActionPrescriptions.map((action, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 flex items-start gap-3">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase shrink-0 mt-0.5 ${
                            action.priority === 'Alta' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                            action.priority === 'Média' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                            'bg-slate-200 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300'
                          }`}>
                            {action.priority}
                          </span>
                          <div>
                            <strong className="block text-slate-900 dark:text-zinc-100 text-xs">{action.title}</strong>
                            <p className="text-slate-600 dark:text-zinc-400 text-[11px] mt-0.5 leading-relaxed">{action.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggested POIs / Scouting Points */}
                  {ndviAiData.suggestedSamplingPois && ndviAiData.suggestedSamplingPois.length > 0 && (
                    <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <PinIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <h4 className="font-bold text-indigo-950 dark:text-indigo-200 text-xs">
                            Pontos de Amostragem Georreferenciada Recomendados (Scouting)
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={handleInjectSuggestedPois}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar Marcadores no Mapa</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ndviAiData.suggestedSamplingPois.map((poi, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-indigo-100 dark:border-indigo-900/40 text-[11px]">
                            <strong className="text-indigo-900 dark:text-indigo-300 block">{poi.name}</strong>
                            <span className="text-slate-500 dark:text-zinc-400 block mt-0.5">{poi.reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow Up Interaction Suggestions */}
                  {ndviAiData.followUpSuggestions && ndviAiData.followUpSuggestions.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Procurando mais detalhes? Pergunte à IA:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {ndviAiData.followUpSuggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setNdviAiFollowUpInput(sug);
                              handleRunNdviAiAnalysis(sug);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-zinc-300 hover:text-emerald-700 text-[11px] font-medium transition cursor-pointer text-left border border-slate-200/60 dark:border-zinc-700"
                          >
                            💡 {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Prompt Box to Ask Gemini */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!ndviAiFollowUpInput.trim()) return;
                      handleRunNdviAiAnalysis(ndviAiFollowUpInput);
                    }}
                    className="flex items-center gap-2 pt-2"
                  >
                    <input
                      type="text"
                      value={ndviAiFollowUpInput}
                      onChange={e => setNdviAiFollowUpInput(e.target.value)}
                      placeholder="Faça uma pergunta específica para a Nema IA sobre este talhão..."
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={isAnalyzingNdviAi || !ndviAiFollowUpInput.trim()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* GUIA TÉCNICO COMPLETO DE ÍNDICES DE VEGETAÇÃO MODAL */}
      {showIndexGuideModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-start justify-between gap-4 border-b border-emerald-800/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                      Guia Técnico de Índices de Vegetação & Sensoriamento Remoto
                    </h3>
                    <p className="text-xs text-emerald-200/90 font-medium">
                      Explicação agronômica detalhada, fórmulas espectrais, interpretação de valores e aplicações recomendadas no campo.
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIndexGuideModal(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Controls Bar */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={indexSearchQuery}
                  onChange={e => setIndexSearchQuery(e.target.value)}
                  placeholder="Pesquisar índice, palavra-chave (ex: Nitrogênio, Solo, Drone, Estresse, Milho)..."
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-800 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {indexSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setIndexSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-xs font-bold"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto shrink-0 pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'Todos (15)' },
                  { id: 'multispectral', label: '🌱 Multiespectrais (8)' },
                  { id: 'water_soil', label: '💧 Umidade & Água (3)' },
                  { id: 'visible_rgb', label: '📸 Drones & RGB (4)' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setIndexCategoryFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                      indexCategoryFilter === tab.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Index Cards List Container */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {(() => {
                const filtered = Object.values(VEGETATION_INDEX_DETAILS).filter(item => {
                  const matchesCategory =
                    indexCategoryFilter === 'all' || item.category === indexCategoryFilter;
                  const query = indexSearchQuery.toLowerCase().trim();
                  const matchesQuery =
                    !query ||
                    item.label.toLowerCase().includes(query) ||
                    item.symbol.toLowerCase().includes(query) ||
                    item.formula.toLowerCase().includes(query) ||
                    item.desc.toLowerCase().includes(query) ||
                    item.whatItMeasures.toLowerCase().includes(query) ||
                    item.bestUse.toLowerCase().includes(query) ||
                    item.categoryLabel.toLowerCase().includes(query);

                  return matchesCategory && matchesQuery;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-12 space-y-2">
                      <p className="text-slate-400 font-bold text-sm">Nenhum índice encontrado para "{indexSearchQuery}".</p>
                      <button
                        onClick={() => { setIndexSearchQuery(''); setIndexCategoryFilter('all'); }}
                        className="text-xs text-emerald-600 font-bold underline cursor-pointer"
                      >
                        Limpar filtros de pesquisa
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map(index => {
                      const isSelected = ndviIndexType === index.id;

                      return (
                        <div
                          key={index.id}
                          className={`p-4 rounded-2xl border transition-all space-y-2.5 flex flex-col justify-between ${
                            isSelected
                              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-2 border-emerald-500 dark:border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                              : 'bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700/80 hover:border-emerald-300 dark:hover:border-emerald-700'
                          }`}
                        >
                          <div className="space-y-2">
                            {/* Card Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-0.5 min-w-0">
                                <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 block truncate">
                                  {index.categoryLabel}
                                </span>
                                <h4 className="font-black text-slate-900 dark:text-white text-sm leading-tight">
                                  {index.label}
                                </h4>
                              </div>
                              <span className="font-mono text-[10px] bg-slate-100 dark:bg-zinc-900 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-zinc-700 px-2 py-0.5 rounded-lg font-black shrink-0">
                                {index.formula}
                              </span>
                            </div>

                            {/* Breve Explicação */}
                            <div className="bg-slate-50 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                              <span className="text-[9px] font-black uppercase text-slate-500 dark:text-zinc-400 block mb-0.5">
                                💡 Breve Explicação (O Que É):
                              </span>
                              <p className="text-xs text-slate-800 dark:text-zinc-200 font-bold leading-relaxed">
                                {index.desc}
                              </p>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                              <div>
                                <span className="font-bold text-slate-700 dark:text-zinc-300">🔍 O Que Mede: </span>
                                <span className="text-slate-600 dark:text-zinc-300">{index.whatItMeasures}</span>
                              </div>
                              <div>
                                <span className="font-bold text-slate-700 dark:text-zinc-300">🎯 Aplicação no Campo: </span>
                                <span className="text-slate-600 dark:text-zinc-300">{index.bestUse}</span>
                              </div>
                              <div>
                                <span className="font-bold text-slate-700 dark:text-zinc-300">📊 Faixa Típica: </span>
                                <span className="text-slate-600 dark:text-zinc-300 font-mono text-[10px]">{index.typicalRange}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-medium">
                              {isSelected ? '✓ Índice Ativo no Mapa' : 'Disponível no Mapa'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setNdviIndexType(index.id as any);
                                setShowIndexGuideModal(false);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-zinc-700 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-zinc-200'
                              }`}
                            >
                              {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <BarChart3 className="w-3.5 h-3.5" />}
                              <span>{isSelected ? 'Ativo no Mapa' : 'Selecionar este Índice'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-800/80 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                15 Índices de Sensoriamento Remoto Integrados • GeaAgro GIS Suite
              </span>
              <button
                type="button"
                onClick={() => setShowIndexGuideModal(false)}
                className="px-4 py-2 bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 font-bold rounded-xl text-xs hover:bg-slate-800 transition cursor-pointer"
              >
                Fechar Guia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
