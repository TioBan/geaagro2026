import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Compass,
  MapPin,
  Layers,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Info,
  RefreshCw,
  Search,
  Eye,
  EyeOff,
  Check,
  Edit2,
  Edit3,
  Grid,
  Shuffle,
  X,
  Image,
  ArrowRight,
  Crosshair,
  Map as MapIcon,
  SlidersHorizontal,
} from 'lucide-react';
import { Farm, SoilSample } from '../../types/agronomy';
import {
  SoilSamplingPoint,
  PlotBoundary,
  SoilSamplingStatus,
  GeoTIFFOverlay,
} from '../../types/soilSampling';
import {
  calculatePolygonAreaHa,
  calculatePolygonPerimeter,
  generateSamplingGrid,
  generateZigzagSamplingPath,
  exportToKML,
  exportToKMZ,
  exportToGeoJSON,
  exportToCSV,
  exportToGPKG,
  importFromKML,
  importFromKMZ,
  importFromGeoJSON,
  importFromCSV,
  importFromGPKG,
  importFromGeoTIFF,
} from '../../utils/soilSamplingGeo';
import {
  AgroCity,
  BRAZILIAN_AGRO_CITIES,
  searchLocalBrazilianCities,
  searchOnlineCityNominatim,
} from '../../data/brazilianAgroCities';
import { lazyWithRetry } from '../../utils/lazyWithRetry';
import {
  SoilPointModal,
  SoilEditPlotModal,
  SoilExportModal,
  SoilImportModal,
  SoilGridModal,
  PointFormState,
  PlotEditFormState,
  ImportSummaryState,
  ExportFormatType,
} from './SoilSamplingModals';

const VraPrescriptionModal = lazyWithRetry(() =>
  import('./VraPrescriptionModal').then((m) => ({ default: m.VraPrescriptionModal }))
);

export interface SoilSamplingMapViewProps {
  selectedFarm: Farm;
  soilSamples?: SoilSample[];
  onNavigateToManualSample?: (prefilledData: Partial<SoilSample>) => void;
  hideHeader?: boolean;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

const QUICK_AGRO_HUBS = [
  { label: 'Sorriso (MT)', query: 'Sorriso' },
  { label: 'Rio Verde (GO)', query: 'Rio Verde' },
  { label: 'Cascavel (PR)', query: 'Cascavel' },
  { label: 'LEM (BA)', query: 'Luís Eduardo Magalhães' },
  { label: 'Dourados (MS)', query: 'Dourados' },
  { label: 'Uberlândia (MG)', query: 'Uberlândia' },
  { label: 'Passo Fundo (RS)', query: 'Passo Fundo' },
  { label: 'Cristalina (GO)', query: 'Cristalina' },
  { label: 'Balsas (MA)', query: 'Balsas' },
  { label: 'Ribeirão Preto (SP)', query: 'Ribeirão Preto' },
  { label: 'Sinop (MT)', query: 'Sinop' },
  { label: 'Primavera do Leste (MT)', query: 'Primavera do Leste' },
];

const getStatusMeta = (status: SoilSamplingStatus) => {
  switch (status) {
    case 'planejado':
      return {
        hex: '#d97706',
        dotClass: 'bg-amber-500',
        textClass: 'text-amber-700 dark:text-amber-400',
        label: 'Planejado',
      };
    case 'coletado':
      return {
        hex: '#2563eb',
        dotClass: 'bg-blue-600',
        textClass: 'text-blue-700 dark:text-blue-400',
        label: 'Coletado',
      };
    case 'enviado_laboratorio':
    case 'em_laboratorio':
      return {
        hex: '#7c3aed',
        dotClass: 'bg-violet-600',
        textClass: 'text-violet-700 dark:text-violet-400',
        label: 'Em Laboratório',
      };
    case 'analisado':
      return {
        hex: '#059669',
        dotClass: 'bg-emerald-600',
        textClass: 'text-emerald-700 dark:text-emerald-400',
        label: 'Laudo Concluído',
      };
    default:
      return {
        hex: '#64748b',
        dotClass: 'bg-slate-500',
        textClass: 'text-slate-600 dark:text-zinc-400',
        label: String(status),
      };
  }
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const SoilSamplingMapView: React.FC<SoilSamplingMapViewProps> = ({
  selectedFarm,
  onNavigateToManualSample,
  hideHeader = false,
}) => {
  const plots = useMemo(() => selectedFarm?.plots || [], [selectedFarm?.plots]);
  const [selectedPlotId, setSelectedPlotId] = useState<string>(() => plots[0]?.id || 'plot-1');

  useEffect(() => {
    if (plots.length > 0 && !plots.some((p) => p.id === selectedPlotId)) {
      setSelectedPlotId(plots[0].id);
    }
  }, [plots, selectedPlotId]);

  const currentPlot = useMemo(
    () =>
      plots.find((p) => p.id === selectedPlotId) ||
      plots[0] || {
        id: 'plot-1',
        name: 'Talhão Principal',
        areaHa: 25,
        clayPercentage: 35,
      },
    [plots, selectedPlotId]
  );

  // Estado principal (sem dados pré-preenchidos)
  const [boundaries, setBoundaries] = useState<Record<string, PlotBoundary>>({});
  const [points, setPoints] = useState<SoilSamplingPoint[]>([]);
  const [geotiffOverlay, setGeotiffOverlay] = useState<GeoTIFFOverlay | null>(null);

  // Refs para evitar stale closures em handlers do Leaflet
  const boundariesRef = useRef<Record<string, PlotBoundary>>(boundaries);
  const pointsRef = useRef<SoilSamplingPoint[]>(points);
  useEffect(() => {
    boundariesRef.current = boundaries;
  }, [boundaries]);
  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  // Modos do mapa
  const [mapMode, setMapMode] = useState<'view' | 'draw_polygon' | 'add_point' | 'edit_vertices'>(
    'view'
  );
  const [mapLayerType, setMapLayerType] = useState<'satellite' | 'streets'>('satellite');
  const [drawingCoords, setDrawingCoords] = useState<[number, number][]>([]);

  // Confirmações inline em dois passos
  const [confirmClearAction, setConfirmClearAction] = useState<null | 'plot' | 'farm'>(null);
  const [confirmDeletePointId, setConfirmDeletePointId] = useState<string | null>(null);

  // Modais
  const [isPointModalOpen, setIsPointModalOpen] = useState(false);
  const [pendingPointCoords, setPendingPointCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [editingPoint, setEditingPoint] = useState<SoilSamplingPoint | null>(null);

  const [isEditPlotModalOpen, setIsEditPlotModalOpen] = useState(false);
  const [plotEditForm, setPlotEditForm] = useState<PlotEditFormState>({
    name: '',
    crop: '',
    notes: '',
    areaHa: 0,
    perimeterM: 0,
  });

  const [isGridModalOpen, setIsGridModalOpen] = useState(false);
  const [isVraModalOpen, setIsVraModalOpen] = useState(false);
  const [gridDensityHa, setGridDensityHa] = useState<number>(2);
  const [gridDepth, setGridDepth] = useState<'0-20' | '20-40'>('0-20');
  const [gridSubsamples, setGridSubsamples] = useState<number>(15);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormatType>('kml');
  const [isExporting, setIsExporting] = useState(false);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importDragOver, setImportDragOver] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importSummary, setImportSummary] = useState<ImportSummaryState | null>(null);
  const [importMergeMode, setImportMergeMode] = useState<'replace' | 'append'>('replace');

  // Filtros e toast
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [depthFilter, setDepthFilter] = useState<string>('all');
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Formulário de ponto
  const [pointForm, setPointForm] = useState<PointFormState>({
    code: '',
    lat: 0,
    lng: 0,
    depth: '0-20',
    date: new Date().toISOString().split('T')[0],
    subsamplesCount: 15,
    status: 'planejado',
    soilColor: 'Latossolo Vermelho Eutrófico',
    notes: '',
  });

  // Refs do Leaflet
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tempDrawLayerRef = useRef<L.LayerGroup | null>(null);
  const vertexEditLayerRef = useRef<L.LayerGroup | null>(null);
  const geotiffLayerRef = useRef<L.ImageOverlay | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Busca de cidades
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [citySearchResults, setCitySearchResults] = useState<AgroCity[]>([]);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [selectedCityInfo, setSelectedCityInfo] = useState<AgroCity | null>(null);
  const cityLocationMarkerRef = useRef<L.Marker | null>(null);
  const citySearchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const citySearchContainerRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setToast({ message, type });
      toastTimerRef.current = setTimeout(() => {
        setToast(null);
        toastTimerRef.current = null;
      }, 3800);
    },
    []
  );

  // Cleanup de timers ao desmontar
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (citySearchDebounceRef.current) clearTimeout(citySearchDebounceRef.current);
    };
  }, []);

  // Fechar dropdown de cidades ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        citySearchContainerRef.current &&
        !citySearchContainerRef.current.contains(e.target as Node)
      ) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Persistência: Salvar limites no localStorage
  const saveBoundariesToStorage = useCallback(
    (updated: Record<string, PlotBoundary>) => {
      boundariesRef.current = updated;
      setBoundaries(updated);
      try {
        if (selectedFarm?.id) {
          localStorage.setItem(
            `geaagro_plot_boundaries_${selectedFarm.id}`,
            JSON.stringify(updated)
          );
          window.dispatchEvent(
            new CustomEvent('geaagro_plot_boundaries_updated', {
              detail: { farmId: selectedFarm.id, boundaries: updated },
            })
          );
        }
      } catch (e) {
        console.error(e);
      }
    },
    [selectedFarm?.id]
  );

  // Persistência: Salvar pontos no localStorage
  const savePointsToStorage = useCallback(
    (updated: SoilSamplingPoint[]) => {
      pointsRef.current = updated;
      setPoints(updated);
      try {
        if (selectedFarm?.id) {
          localStorage.setItem(
            `geaagro_soil_sampling_points_${selectedFarm.id}`,
            JSON.stringify(updated)
          );
          window.dispatchEvent(
            new CustomEvent('geaagro_soil_points_updated', {
              detail: { farmId: selectedFarm.id, points: updated },
            })
          );
        }
      } catch (e) {
        console.error(e);
      }
    },
    [selectedFarm?.id]
  );

  // Carregamento inicial por fazenda
  useEffect(() => {
    if (!selectedFarm?.id) return;
    try {
      const savedBoundariesStr = localStorage.getItem(
        `geaagro_plot_boundaries_${selectedFarm.id}`
      );
      setBoundaries(savedBoundariesStr ? JSON.parse(savedBoundariesStr) : {});

      const savedPointsStr = localStorage.getItem(
        `geaagro_soil_sampling_points_${selectedFarm.id}`
      );
      setPoints(savedPointsStr ? JSON.parse(savedPointsStr) : []);
    } catch (e) {
      console.warn('Erro ao carregar dados de mapeamento de solo:', e);
      setBoundaries({});
      setPoints([]);
    }
  }, [selectedFarm?.id]);

  // Sincronização em tempo real entre abas e módulos
  useEffect(() => {
    if (!selectedFarm?.id) return;

    const handleExternalPoints = (e: Event) => {
      const custom = e as CustomEvent<{ farmId?: string; points?: SoilSamplingPoint[] }>;
      if (custom.detail?.farmId === selectedFarm.id && custom.detail?.points) {
        setPoints(custom.detail.points);
      }
    };

    const handleExternalBoundaries = (e: Event) => {
      const custom = e as CustomEvent<{
        farmId?: string;
        boundaries?: Record<string, PlotBoundary>;
      }>;
      if (custom.detail?.farmId === selectedFarm.id && custom.detail?.boundaries) {
        setBoundaries(custom.detail.boundaries);
      }
    };

    window.addEventListener('geaagro_soil_points_updated', handleExternalPoints);
    window.addEventListener('geaagro_plot_boundaries_updated', handleExternalBoundaries);
    return () => {
      window.removeEventListener('geaagro_soil_points_updated', handleExternalPoints);
      window.removeEventListener('geaagro_plot_boundaries_updated', handleExternalBoundaries);
    };
  }, [selectedFarm?.id]);

  // Busca de cidades
  const handleCityInputChange = (query: string) => {
    setCitySearchQuery(query);
    if (!query.trim() || query.trim().length < 2) {
      setCitySearchResults([]);
      setShowCityDropdown(false);
      return;
    }

    const localMatches = searchLocalBrazilianCities(query, 8);
    setCitySearchResults(localMatches);
    setShowCityDropdown(true);

    if (citySearchDebounceRef.current) clearTimeout(citySearchDebounceRef.current);

    citySearchDebounceRef.current = setTimeout(async () => {
      if (query.trim().length < 3) return;
      setIsSearchingCity(true);
      try {
        const onlineMatches = await searchOnlineCityNominatim(query, 6);
        if (onlineMatches.length > 0) {
          setCitySearchResults((prev) => {
            const seen = new Set(prev.map((c) => `${c.name.toLowerCase()}-${c.state.toLowerCase()}`));
            const merged = [...prev];
            for (const item of onlineMatches) {
              const key = `${item.name.toLowerCase()}-${item.state.toLowerCase()}`;
              if (!seen.has(key)) {
                seen.add(key);
                merged.push(item);
              }
            }
            return merged.slice(0, 10);
          });
        }
      } catch (err) {
        console.warn('Erro na busca online de cidades:', err);
      } finally {
        setIsSearchingCity(false);
      }
    }, 350);
  };

  const handleFlyToCity = (city: AgroCity) => {
    setCitySearchQuery(`${city.name} - ${city.state}`);
    setSelectedCityInfo(city);
    setShowCityDropdown(false);

    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    map.flyTo([city.lat, city.lng], 14, { duration: 1.4, easeLinearity: 0.25 });

    if (cityLocationMarkerRef.current) {
      map.removeLayer(cityLocationMarkerRef.current);
      cityLocationMarkerRef.current = null;
    }

    const cityIcon = L.divIcon({
      className: 'bg-transparent border-none',
      html: `<div style="width:26px;height:26px;border-radius:50%;background:#059669;border:2px solid #ffffff;color:#ffffff;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:10px;font-weight:700;">${escapeHtml(city.state)}</div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });

    const marker = L.marker([city.lat, city.lng], { icon: cityIcon })
      .bindTooltip(
        `<div style="font-family:sans-serif;padding:2px 4px;">
          <strong style="font-size:12px;color:#065f46;">${escapeHtml(city.name)} - ${escapeHtml(city.state)}</strong><br/>
          <span style="font-size:10px;color:#475569;">${escapeHtml(city.notes || 'Região Agrícola Centralizada')}</span>
        </div>`,
        { permanent: false, direction: 'top', offset: [0, -10] }
      )
      .addTo(map);

    cityLocationMarkerRef.current = marker;
    showToast(`Mapa centralizado em ${city.name} - ${city.state}.`, 'info');
  };

  const handleSearchCitySubmit = async (overrideQuery?: string) => {
    const q = overrideQuery || citySearchQuery;
    if (!q.trim()) return;

    if (citySearchResults.length > 0 && !overrideQuery) {
      handleFlyToCity(citySearchResults[0]);
      return;
    }

    setIsSearchingCity(true);
    try {
      const local = searchLocalBrazilianCities(q, 5);
      if (local.length > 0) {
        handleFlyToCity(local[0]);
        return;
      }
      const online = await searchOnlineCityNominatim(q, 5);
      if (online.length > 0) {
        handleFlyToCity(online[0]);
      } else {
        showToast(
          `Cidade "${q}" não localizada. Informe o estado (ex: Sorriso MT).`,
          'error'
        );
      }
    } catch {
      showToast('Erro ao consultar a localização da cidade.', 'error');
    } finally {
      setIsSearchingCity(false);
    }
  };

  const handleCenterGPS = () => {
    if (!navigator.geolocation) {
      showToast('Geolocalização não suportada neste dispositivo.', 'error');
      return;
    }

    showToast('Buscando sinal GPS do dispositivo...', 'info');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 16, { duration: 1.2 });

          if (cityLocationMarkerRef.current) {
            mapInstanceRef.current.removeLayer(cityLocationMarkerRef.current);
          }

          const gpsIcon = L.divIcon({
            className: 'bg-transparent border-none',
            html: `<div style="width:26px;height:26px;border-radius:50%;background:#2563eb;border:2px solid #ffffff;color:#ffffff;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:9px;font-weight:700;">GPS</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          });

          const marker = L.marker([latitude, longitude], { icon: gpsIcon })
            .bindTooltip(
              `<strong>Posição GPS Atual</strong><br/><span style="font-size:10px;">${latitude.toFixed(5)}, ${longitude.toFixed(5)}</span>`,
              { permanent: false, direction: 'top' }
            )
            .addTo(mapInstanceRef.current);

          cityLocationMarkerRef.current = marker;
          showToast('Mapa centralizado na localização GPS atual.');
        }
      },
      (err) => {
        showToast(
          `Não foi possível obter GPS: ${err.message}. Verifique as permissões do navegador.`,
          'error'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Limpar talhão ativo (confirmado inline)
  const executeClearPlot = () => {
    const updatedBoundaries = { ...boundariesRef.current };
    delete updatedBoundaries[selectedPlotId];
    saveBoundariesToStorage(updatedBoundaries);

    const otherPoints = pointsRef.current.filter((p) => p.plotId !== selectedPlotId);
    savePointsToStorage(otherPoints);

    if (geotiffLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(geotiffLayerRef.current);
      geotiffLayerRef.current = null;
    }
    setGeotiffOverlay(null);
    setDrawingCoords([]);
    setMapMode('view');
    setConfirmClearAction(null);
    showToast('Contorno e pontos do talhão removidos.');
  };

  // Zerar toda a fazenda (confirmado inline)
  const executeClearEntireFarm = () => {
    boundariesRef.current = {};
    pointsRef.current = [];
    setBoundaries({});
    setPoints([]);
    try {
      localStorage.removeItem(`geaagro_plot_boundaries_${selectedFarm.id}`);
      localStorage.removeItem(`geaagro_soil_sampling_points_${selectedFarm.id}`);
      window.dispatchEvent(
        new CustomEvent('geaagro_plot_boundaries_updated', {
          detail: { farmId: selectedFarm.id, boundaries: {} },
        })
      );
      window.dispatchEvent(
        new CustomEvent('geaagro_soil_points_updated', {
          detail: { farmId: selectedFarm.id, points: [] },
        })
      );
    } catch (e) {
      console.error(e);
    }
    if (geotiffLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(geotiffLayerRef.current);
      geotiffLayerRef.current = null;
    }
    setGeotiffOverlay(null);
    setDrawingCoords([]);
    setMapMode('view');
    setConfirmClearAction(null);
    showToast('Mapeamento da fazenda zerado com sucesso.');
  };

  // Limite e pontos do talhão ativo
  const currentBoundary = boundaries[selectedPlotId];

  const plotPoints = useMemo(
    () => points.filter((p) => p.plotId === selectedPlotId),
    [points, selectedPlotId]
  );

  const filteredPoints = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return plotPoints.filter((p) => {
      const matchQuery =
        !q ||
        p.code.toLowerCase().includes(q) ||
        (p.notes || '').toLowerCase().includes(q) ||
        (p.soilColor || '').toLowerCase().includes(q);
      const matchStatus =
        statusFilter === 'all' ||
        p.status === statusFilter ||
        (statusFilter === 'enviado_laboratorio' && p.status === 'em_laboratorio');
      const matchDepth = depthFilter === 'all' || p.depth === depthFilter;
      return matchQuery && matchStatus && matchDepth;
    });
  }, [plotPoints, searchQuery, statusFilter, depthFilter]);

  // Inicializar Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const baseLat = selectedFarm?.latitude || -15.7801;
      const baseLng = selectedFarm?.longitude || -47.9292;

      const map = L.map(mapContainerRef.current, {
        center: [baseLat, baseLng],
        zoom: 16,
        zoomControl: true,
        attributionControl: false,
      });

      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      );
      satLayer.addTo(map);
      tileLayerRef.current = satLayer;

      L.control.scale({ imperial: false, metric: true, position: 'bottomleft' }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      tempDrawLayerRef.current = L.layerGroup().addTo(map);
      vertexEditLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Alternar camada base
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);

    if (mapLayerType === 'satellite') {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(map);
    } else {
      tileLayerRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19 }
      ).addTo(map);
    }
  }, [mapLayerType]);

  // Clique no mapa para desenho ou novo ponto
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (mapMode === 'draw_polygon') {
        setDrawingCoords((prev) => [
          ...prev,
          [Number(lat.toFixed(6)), Number(lng.toFixed(6))],
        ]);
      } else if (mapMode === 'add_point') {
        const nextNum = plotPoints.length + 1;
        setPendingPointCoords({ lat, lng });
        setEditingPoint(null);
        setPointForm({
          code: `P-${nextNum.toString().padStart(2, '0')}`,
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6)),
          depth: '0-20',
          date: new Date().toISOString().split('T')[0],
          subsamplesCount: 15,
          status: 'planejado',
          soilColor: 'Latossolo Vermelho Eutrófico',
          notes: '',
        });
        setIsPointModalOpen(true);
        setMapMode('view');
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [mapMode, plotPoints.length]);

  // Desenho temporário de polígono
  useEffect(() => {
    if (!tempDrawLayerRef.current) return;
    tempDrawLayerRef.current.clearLayers();

    if (drawingCoords.length > 0) {
      drawingCoords.forEach(([lat, lng]) => {
        L.circleMarker([lat, lng], {
          radius: 5,
          color: '#10b981',
          fillColor: '#ffffff',
          fillOpacity: 1,
          weight: 2,
        }).addTo(tempDrawLayerRef.current!);
      });

      if (drawingCoords.length >= 2) {
        L.polyline(drawingCoords, {
          color: '#10b981',
          dashArray: '5, 5',
          weight: 2,
        }).addTo(tempDrawLayerRef.current);
      }
    }
  }, [drawingCoords]);

  // Renderizar polígono do talhão
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }

    if (currentBoundary && currentBoundary.coordinates && currentBoundary.coordinates.length >= 3) {
      const poly = L.polygon(currentBoundary.coordinates, {
        color: '#10b981',
        weight: 2.5,
        fillColor: '#10b981',
        fillOpacity: 0.16,
      }).addTo(map);

      poly.bindTooltip(
        `<div style="font-family:sans-serif;font-size:11px;font-weight:700;">${escapeHtml(
          currentBoundary.name || currentPlot.name
        )}<br/><span style="font-size:10px;font-weight:500;color:#065f46;">${currentBoundary.areaHa} ha | ${currentBoundary.perimeterM} m</span></div>`,
        { permanent: true, direction: 'center', className: 'soil-plot-tooltip' }
      );

      polygonLayerRef.current = poly;

      if (mapMode !== 'draw_polygon' && mapMode !== 'edit_vertices') {
        map.fitBounds(poly.getBounds(), { padding: [50, 50], maxZoom: 17 });
      }
    }
  }, [currentBoundary, selectedPlotId, mapMode, currentPlot.name]);

  // Edição de vértices (corrigido stale closure via boundariesRef)
  useEffect(() => {
    if (!vertexEditLayerRef.current || !mapInstanceRef.current) return;
    const layer = vertexEditLayerRef.current;
    layer.clearLayers();

    if (mapMode === 'edit_vertices' && currentBoundary && currentBoundary.coordinates) {
      currentBoundary.coordinates.forEach(([lat, lng], index) => {
        const marker = L.marker([lat, lng], {
          draggable: true,
          icon: L.divIcon({
            className: 'vertex-drag-handle',
            html: `<div style="background:#ffffff;color:#065f46;border:2px solid #059669;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;cursor:grab;font-family:sans-serif;">${
              index + 1
            }</div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          }),
        });

        marker.on('drag', (e) => {
          const newPos = (e as L.LeafletEvent & { latlng: L.LatLng }).latlng;
          const latest = boundariesRef.current[selectedPlotId];
          if (!latest) return;

          const updatedCoords: [number, number][] = [...latest.coordinates];
          updatedCoords[index] = [Number(newPos.lat.toFixed(6)), Number(newPos.lng.toFixed(6))];

          const updatedBoundary: PlotBoundary = {
            ...latest,
            coordinates: updatedCoords,
            areaHa: calculatePolygonAreaHa(updatedCoords),
            perimeterM: calculatePolygonPerimeter(updatedCoords),
            lastUpdated: new Date().toISOString(),
          };

          const nextMap = { ...boundariesRef.current, [selectedPlotId]: updatedBoundary };
          boundariesRef.current = nextMap;
          setBoundaries(nextMap);
        });

        marker.on('dragend', () => {
          saveBoundariesToStorage({ ...boundariesRef.current });
          showToast(`Vértice ${index + 1} ajustado.`);
        });

        marker.addTo(layer);
      });
    }
  }, [mapMode, currentBoundary?.coordinates.length, selectedPlotId, saveBoundariesToStorage, showToast]);

  // Camada GeoTIFF overlay
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (geotiffLayerRef.current) {
      map.removeLayer(geotiffLayerRef.current);
      geotiffLayerRef.current = null;
    }

    if (geotiffOverlay && geotiffOverlay.visible) {
      const overlay = L.imageOverlay(geotiffOverlay.imageUrl, geotiffOverlay.bounds, {
        opacity: geotiffOverlay.opacity,
        interactive: false,
      }).addTo(map);

      geotiffLayerRef.current = overlay;
      map.fitBounds(geotiffOverlay.bounds, { padding: [40, 40] });
    }
  }, [geotiffOverlay]);

  const handleOpenEditPoint = useCallback((point: SoilSamplingPoint) => {
    setEditingPoint(point);
    setPointForm({
      code: point.code,
      lat: point.lat,
      lng: point.lng,
      depth: point.depth === '20-40' || point.depth === '0-40' ? point.depth : '0-20',
      date: point.date,
      subsamplesCount: point.subsamplesCount,
      status: point.status,
      soilColor: point.soilColor || 'Latossolo Vermelho Eutrófico',
      notes: point.notes || '',
    });
    setIsPointModalOpen(true);
  }, []);

  const handleDeletePoint = useCallback(
    (pointId: string) => {
      const updated = pointsRef.current.filter((p) => p.id !== pointId);
      savePointsToStorage(updated);
      setConfirmDeletePointId(null);
      showToast('Ponto de coleta excluído.');
    },
    [savePointsToStorage, showToast]
  );

  // Renderizar marcadores dos pontos de amostragem
  useEffect(() => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;
    const layer = markersLayerRef.current;
    layer.clearLayers();

    plotPoints.forEach((point) => {
      const statusMeta = getStatusMeta(point.status);
      const pinLabel = escapeHtml(
        String(point.pointNumber || point.code.replace(/\D/g, '') || 'P')
      );

      const icon = L.divIcon({
        className: 'custom-soil-pin',
        html: `<div style="background:${statusMeta.hex};color:#ffffff;border:2px solid #ffffff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;font-family:sans-serif;cursor:pointer;">${pinLabel}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16],
      });

      const marker = L.marker([point.lat, point.lng], { icon, draggable: true });

      marker.on('dragend', (e) => {
        const newPos = (e.target as L.Marker).getLatLng();
        const updated = pointsRef.current.map((p) =>
          p.id === point.id
            ? { ...p, lat: Number(newPos.lat.toFixed(6)), lng: Number(newPos.lng.toFixed(6)) }
            : p
        );
        savePointsToStorage(updated);
        showToast(
          `Coordenadas de ${point.code} atualizadas (${newPos.lat.toFixed(5)}, ${newPos.lng.toFixed(5)}).`
        );
      });

      const popupHtml = document.createElement('div');
      popupHtml.style.fontFamily = 'sans-serif';
      popupHtml.style.fontSize = '12px';
      popupHtml.style.minWidth = '210px';
      popupHtml.innerHTML = `
        <div style="border-bottom:1px solid #e2e8f0;padding-bottom:6px;margin-bottom:6px;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <strong style="font-size:13px;color:#0f172a;">${escapeHtml(point.code)}</strong>
            <span style="background:${statusMeta.hex};color:#ffffff;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:600;">
              ${escapeHtml(statusMeta.label)}
            </span>
          </div>
          <div style="font-size:10px;color:#64748b;margin-top:2px;">${escapeHtml(
            currentPlot.name
          )} · ${escapeHtml(point.depth)} cm</div>
        </div>
        <div style="font-size:11px;color:#334155;line-height:1.5;margin-bottom:8px;">
          <div><strong>Data:</strong> ${escapeHtml(point.date)}</div>
          <div><strong>Subamostras:</strong> ${point.subsamplesCount}</div>
          <div><strong>Coord:</strong> ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}</div>
          ${point.soilColor ? `<div><strong>Solo:</strong> ${escapeHtml(point.soilColor)}</div>` : ''}
          ${
            point.notes
              ? `<div style="color:#64748b;font-style:italic;margin-top:3px;">"${escapeHtml(
                  point.notes
                )}"</div>`
              : ''
          }
          <div style="font-size:10px;color:#047857;margin-top:4px;">Arraste o pino para ajustar a posição.</div>
        </div>
        <div style="border-top:1px solid #e2e8f0;padding-top:6px;display:flex;flex-direction:column;gap:5px;">
          <button id="btn-create-sample-${point.id}" style="width:100%;background:#059669;color:#ffffff;border:none;border-radius:6px;padding:6px 8px;font-size:11px;font-weight:600;cursor:pointer;">
            Lançar Laudo no Módulo &rarr;
          </button>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
            <button id="btn-edit-${point.id}" style="flex:1;background:#ffffff;color:#334155;border:1px solid #cbd5e1;border-radius:6px;padding:4px 8px;font-size:11px;font-weight:600;cursor:pointer;">
              Editar
            </button>
            <button id="btn-delete-${point.id}" data-armed="false" style="flex:1;background:#ffffff;color:#dc2626;border:1px solid #fecaca;border-radius:6px;padding:4px 8px;font-size:11px;font-weight:600;cursor:pointer;">
              Excluir
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btnCreateSample = document.getElementById(`btn-create-sample-${point.id}`);
        if (btnCreateSample) {
          btnCreateSample.onclick = () => {
            if (onNavigateToManualSample) {
              onNavigateToManualSample({
                sampleCode: point.code,
                plotId: point.plotId,
                depth: point.depth === '20-40' ? '20-40' : '0-20',
                collectionDate: point.date,
                notes: `Ponto georreferenciado: Lat ${point.lat}, Lng ${point.lng}. ${
                  point.notes || ''
                }`,
              });
            }
          };
        }

        const btnEdit = document.getElementById(`btn-edit-${point.id}`);
        if (btnEdit) {
          btnEdit.onclick = () => {
            handleOpenEditPoint(point);
            marker.closePopup();
          };
        }

        const btnDelete = document.getElementById(`btn-delete-${point.id}`);
        if (btnDelete) {
          btnDelete.onclick = () => {
            if (btnDelete.getAttribute('data-armed') === 'true') {
              handleDeletePoint(point.id);
              marker.closePopup();
            } else {
              btnDelete.setAttribute('data-armed', 'true');
              btnDelete.textContent = 'Confirmar?';
              btnDelete.style.background = '#dc2626';
              btnDelete.style.color = '#ffffff';
              btnDelete.style.borderColor = '#dc2626';
            }
          };
        }
      });

      marker.addTo(layer);
    });
  }, [
    plotPoints,
    currentPlot.name,
    onNavigateToManualSample,
    handleOpenEditPoint,
    handleDeletePoint,
    savePointsToStorage,
    showToast,
  ]);

  // Salvar ponto (novo ou edição)
  const handleSavePoint = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPoint) {
      const updated = pointsRef.current.map((p) =>
        p.id === editingPoint.id
          ? {
              ...p,
              code: pointForm.code.trim() || p.code,
              lat: Number(pointForm.lat) || p.lat,
              lng: Number(pointForm.lng) || p.lng,
              depth: pointForm.depth,
              date: pointForm.date,
              subsamplesCount: Number(pointForm.subsamplesCount) || 15,
              status: pointForm.status,
              soilColor: pointForm.soilColor,
              notes: pointForm.notes,
            }
          : p
      );
      savePointsToStorage(updated);
      showToast(`Ponto ${pointForm.code} atualizado.`);
    } else if (pendingPointCoords) {
      const nextNum = plotPoints.length + 1;
      const newPoint: SoilSamplingPoint = {
        id: `point-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        farmId: selectedFarm.id,
        plotId: currentPlot.id,
        pointNumber: nextNum,
        code: pointForm.code.trim() || `P-${nextNum.toString().padStart(2, '0')}`,
        lat: Number(pointForm.lat || pendingPointCoords.lat),
        lng: Number(pointForm.lng || pendingPointCoords.lng),
        depth: pointForm.depth,
        date: pointForm.date,
        subsamplesCount: Number(pointForm.subsamplesCount) || 15,
        status: pointForm.status,
        soilColor: pointForm.soilColor,
        notes: pointForm.notes,
        createdAt: new Date().toISOString(),
      };
      savePointsToStorage([...pointsRef.current, newPoint]);
      showToast(`Ponto ${newPoint.code} cadastrado no talhão.`);
    }

    setIsPointModalOpen(false);
    setEditingPoint(null);
    setPendingPointCoords(null);
  };

  // Editar dados do talhão
  const handleOpenEditPlot = () => {
    setPlotEditForm({
      name: currentBoundary?.name || currentPlot.name,
      crop: currentBoundary?.crop || (currentPlot as { crop?: string }).crop || '',
      notes: currentBoundary?.notes || '',
      areaHa: currentBoundary?.areaHa || currentPlot.areaHa || 0,
      perimeterM: currentBoundary?.perimeterM || 0,
    });
    setIsEditPlotModalOpen(true);
  };

  const handleSavePlotEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentBoundary) {
      const updatedBoundary: PlotBoundary = {
        ...currentBoundary,
        name: plotEditForm.name.trim() || currentPlot.name,
        crop: plotEditForm.crop.trim(),
        notes: plotEditForm.notes.trim(),
        lastUpdated: new Date().toISOString(),
      };
      saveBoundariesToStorage({ ...boundariesRef.current, [selectedPlotId]: updatedBoundary });
      showToast(`Talhão ${plotEditForm.name} atualizado.`);
    } else {
      showToast('Desenhe o contorno antes de salvar metadados do talhão.', 'info');
    }
    setIsEditPlotModalOpen(false);
  };

  // Desenho de polígono
  const handleFinishDrawing = () => {
    if (drawingCoords.length < 3) {
      showToast('Marque pelo menos 3 pontos no mapa para fechar o polígono.', 'error');
      return;
    }

    const areaHa = calculatePolygonAreaHa(drawingCoords);
    const perimeterM = calculatePolygonPerimeter(drawingCoords);

    const newBoundary: PlotBoundary = {
      plotId: currentPlot.id,
      farmId: selectedFarm.id,
      name: currentPlot.name,
      coordinates: drawingCoords,
      areaHa,
      perimeterM,
      lastUpdated: new Date().toISOString(),
    };

    saveBoundariesToStorage({ ...boundariesRef.current, [currentPlot.id]: newBoundary });
    setDrawingCoords([]);
    setMapMode('view');
    showToast(`Contorno do talhão salvo (${areaHa} ha).`);
  };

  const handleCancelDrawing = () => {
    setDrawingCoords([]);
    setMapMode('view');
  };

  const handleClearPolygon = () => {
    const updated = { ...boundariesRef.current };
    delete updated[currentPlot.id];
    saveBoundariesToStorage(updated);
    setMapMode('view');
    showToast('Contorno do talhão removido.');
  };

  // Grade Amostral Regular
  const handleGenerateGrid = () => {
    if (!currentBoundary || currentBoundary.coordinates.length < 3) {
      showToast('Delimite o contorno do talhão antes de gerar a grade amostral.', 'error');
      return;
    }

    const newPts = generateSamplingGrid(
      currentBoundary.coordinates,
      gridDensityHa,
      selectedFarm.id,
      currentPlot.id,
      gridDepth,
      gridSubsamples
    );

    if (newPts.length === 0) {
      showToast('Nenhum ponto pôde ser gerado dentro dos limites com esta densidade.', 'error');
      return;
    }

    const otherPoints = pointsRef.current.filter((p) => p.plotId !== currentPlot.id);
    savePointsToStorage([...otherPoints, ...newPts]);
    setIsGridModalOpen(false);
    showToast(`Grade amostral gerada: ${newPts.length} pontos no talhão.`);
  };

  // Zigue-Zague Embrapa
  const handleGenerateZigzag = () => {
    if (!currentBoundary || currentBoundary.coordinates.length < 3) {
      showToast('Delimite o contorno do talhão antes de gerar o percurso zigue-zague.', 'error');
      return;
    }

    const newPts = generateZigzagSamplingPath(
      currentBoundary.coordinates,
      12,
      selectedFarm.id,
      currentPlot.id,
      '0-20'
    );

    const otherPoints = pointsRef.current.filter((p) => p.plotId !== currentPlot.id);
    savePointsToStorage([...otherPoints, ...newPts]);
    showToast(`Percurso zigue-zague Embrapa gerado com ${newPts.length} pontos.`);
  };

  // Exportação geoespacial
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExecuteExport = async () => {
    if (plotPoints.length === 0 && !currentBoundary) {
      showToast('Nenhum ponto ou contorno cadastrado para exportação.', 'error');
      return;
    }

    setIsExporting(true);
    const farmName = selectedFarm.name || 'Fazenda';
    const plotName = currentBoundary?.name || currentPlot.name || 'Talhao';
    const baseFilename = `GeaAgro_${plotName.toLowerCase().replace(/\s+/g, '_')}`;

    try {
      if (exportFormat === 'kml') {
        const kmlText = exportToKML(farmName, plotName, currentBoundary, plotPoints);
        downloadBlob(
          new Blob([kmlText], { type: 'application/vnd.google-earth.kml+xml;charset=utf-8' }),
          `${baseFilename}.kml`
        );
        showToast('Arquivo KML exportado.');
      } else if (exportFormat === 'kmz') {
        const kmzBlob = await exportToKMZ(farmName, plotName, currentBoundary, plotPoints);
        downloadBlob(kmzBlob, `${baseFilename}.kmz`);
        showToast('Pacote KMZ exportado.');
      } else if (exportFormat === 'geojson') {
        const geojsonText = exportToGeoJSON(farmName, plotName, currentBoundary, plotPoints);
        downloadBlob(
          new Blob([geojsonText], { type: 'application/geo+json;charset=utf-8' }),
          `${baseFilename}.geojson`
        );
        showToast('Arquivo GeoJSON exportado.');
      } else if (exportFormat === 'gpkg') {
        const gpkgBlob = await exportToGPKG(farmName, plotName, currentBoundary, plotPoints);
        downloadBlob(gpkgBlob, `${baseFilename}.gpkg`);
        showToast('Pacote GeoPackage (.gpkg) exportado.');
      } else if (exportFormat === 'csv') {
        const csvText = exportToCSV(farmName, plotName, plotPoints);
        downloadBlob(
          new Blob([csvText], { type: 'text/csv;charset=utf-8;' }),
          `${baseFilename}_coordenadas.csv`
        );
        showToast('Planilha CSV de pontos exportada.');
      } else if (exportFormat === 'geotiff') {
        if (geotiffOverlay) {
          const a = document.createElement('a');
          a.href = geotiffOverlay.imageUrl;
          a.download = `${baseFilename}_raster_overlay.png`;
          a.click();
          showToast('Imagem raster GeoTIFF baixada.');
        } else {
          const geojsonText = exportToGeoJSON(farmName, plotName, currentBoundary, plotPoints);
          downloadBlob(
            new Blob([geojsonText], { type: 'application/geo+json;charset=utf-8' }),
            `${baseFilename}_camadas.geojson`
          );
          showToast('Camadas geoespaciais exportadas.');
        }
      }
      setIsExportModalOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showToast(`Erro na exportação: ${msg}`, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Importação geoespacial
  const handleFileSelectForImport = async (file: File) => {
    setImportLoading(true);
    const ext = file.name.split('.').pop()?.toLowerCase();

    try {
      if (ext === 'kml') {
        const parsed = importFromKML(await file.text(), currentPlot.id, selectedFarm.id);
        setImportSummary({
          file,
          type: 'KML (Google Earth)',
          pointsCount: parsed.points.length,
          hasBoundary: parsed.boundaries.length > 0,
          hasRaster: false,
          parsedData: parsed,
        });
      } else if (ext === 'kmz') {
        const parsed = await importFromKMZ(file, currentPlot.id, selectedFarm.id);
        setImportSummary({
          file,
          type: 'KMZ Compactado',
          pointsCount: parsed.points.length,
          hasBoundary: parsed.boundaries.length > 0,
          hasRaster: false,
          parsedData: parsed,
        });
      } else if (ext === 'geojson' || ext === 'json') {
        const parsed = importFromGeoJSON(await file.text(), currentPlot.id, selectedFarm.id);
        setImportSummary({
          file,
          type: 'GeoJSON (RFC 7946)',
          pointsCount: parsed.points.length,
          hasBoundary: parsed.boundaries.length > 0,
          hasRaster: false,
          parsedData: parsed,
        });
      } else if (ext === 'csv' || ext === 'txt') {
        const parsed = importFromCSV(await file.text(), currentPlot.id, selectedFarm.id);
        if (parsed.errors.length > 0 && parsed.points.length === 0) {
          throw new Error(parsed.errors.slice(0, 2).join('; '));
        }
        setImportSummary({
          file,
          type: 'Planilha CSV de Coordenadas',
          pointsCount: parsed.points.length,
          hasBoundary: false,
          hasRaster: false,
          parsedData: { boundaries: [], points: parsed.points },
        });
      } else if (ext === 'gpkg') {
        const parsed = await importFromGPKG(file, currentPlot.id, selectedFarm.id);
        setImportSummary({
          file,
          type: 'GeoPackage OGC (.gpkg)',
          pointsCount: parsed.points.length,
          hasBoundary: parsed.boundaries.length > 0,
          hasRaster: false,
          parsedData: parsed,
        });
      } else if (ext === 'tif' || ext === 'tiff') {
        const buffer = await file.arrayBuffer();
        const farmCenter: [number, number] = [
          selectedFarm?.latitude || -15.7801,
          selectedFarm?.longitude || -47.9292,
        ];
        const overlay = await importFromGeoTIFF(buffer, file.name, farmCenter);
        setImportSummary({
          file,
          type: 'Raster GeoTIFF / TIFF',
          pointsCount: 0,
          hasBoundary: false,
          hasRaster: true,
          parsedData: { overlay },
        });
      } else {
        throw new Error(
          'Formato não suportado. Utilize KML, KMZ, GeoJSON, CSV, GPKG ou GeoTIFF (.tif).'
        );
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showToast(`Falha ao ler arquivo: ${msg}`, 'error');
      setImportSummary(null);
    } finally {
      setImportLoading(false);
    }
  };

  const handleApplyImport = () => {
    if (!importSummary?.parsedData) return;

    const { parsedData, hasRaster } = importSummary;

    if (hasRaster && parsedData.overlay) {
      setGeotiffOverlay(parsedData.overlay);
    }

    if (parsedData.boundaries && parsedData.boundaries.length > 0) {
      const newBoundary = parsedData.boundaries[0];
      saveBoundariesToStorage({
        ...boundariesRef.current,
        [currentPlot.id]: {
          ...newBoundary,
          plotId: currentPlot.id,
          name: newBoundary.name || currentPlot.name,
        },
      });
    }

    if (parsedData.points && parsedData.points.length > 0) {
      if (importMergeMode === 'replace') {
        const otherPoints = pointsRef.current.filter((p) => p.plotId !== currentPlot.id);
        savePointsToStorage([...otherPoints, ...parsedData.points]);
      } else {
        savePointsToStorage([...pointsRef.current, ...parsedData.points]);
      }
    }

    setIsImportModalOpen(false);
    setImportSummary(null);
    showToast('Dados geoespaciais carregados no mapa.');
  };

  const displayAreaHa = currentBoundary?.areaHa || currentPlot.areaHa || 0;

  return (
    <div className="space-y-4">
      {/* Toast Hairline Discreto */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-5 right-5 z-[2000] max-w-sm px-3.5 py-2.5 rounded-lg border text-xs font-medium flex items-center gap-2.5 ${
            toast.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
              : toast.type === 'info'
                ? 'bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 border-slate-200 dark:border-zinc-700'
                : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          ) : toast.type === 'info' ? (
            <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          )}
          <span className="flex-1">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Fechar aviso"
            className="opacity-60 hover:opacity-100 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Cabeçalho / Toolbar do Talhão */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        {!hideHeader && (
          <div className="px-4 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-slate-900 dark:text-zinc-100">
                <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <h2 className="text-sm font-semibold">Mapeamento de Coletas no Talhão</h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Delimite contornos sobre satélite, gerencie pontos georreferenciados, gere grades e prescrições VRA.
              </p>
            </div>

            {/* 4 Métricas Hairline */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden tabular-nums shrink-0">
              <div className="bg-slate-50 dark:bg-zinc-950 px-3 py-1.5">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Área</span>
                <strong className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  {displayAreaHa ? `${displayAreaHa} ha` : '—'}
                </strong>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-950 px-3 py-1.5">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Pontos</span>
                <strong className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {plotPoints.length}
                </strong>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-950 px-3 py-1.5">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Perímetro</span>
                <strong className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  {currentBoundary?.perimeterM ? `${currentBoundary.perimeterM} m` : '—'}
                </strong>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-950 px-3 py-1.5">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Contorno</span>
                <strong
                  className={`text-xs font-semibold ${
                    currentBoundary
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-amber-700 dark:text-amber-400'
                  }`}
                >
                  {currentBoundary ? 'Delimitado' : 'Pendente'}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Toolbar Integrada: Seleção de Talhão & Ações */}
        <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-600 dark:text-zinc-400 font-medium inline-flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Talhão:
            </span>
            <select
              value={selectedPlotId}
              onChange={(e) => {
                setSelectedPlotId(e.target.value);
                setConfirmClearAction(null);
              }}
              className="h-8 px-2.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 rounded-md text-xs font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {plots.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.areaHa} ha)
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleOpenEditPlot}
              className="h-8 px-2.5 bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-md text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Editar nome, cultura, notas e vértices do talhão"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Editar Talhão</span>
            </button>

            {hideHeader && (
              <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 tabular-nums">
                <span>
                  Área:{' '}
                  <strong className="text-slate-900 dark:text-zinc-100">
                    {displayAreaHa ? `${displayAreaHa} ha` : '—'}
                  </strong>
                </span>
                <span>·</span>
                <span>
                  Pontos:{' '}
                  <strong className="text-emerald-700 dark:text-emerald-400">
                    {plotPoints.length}
                  </strong>
                </span>
                {currentBoundary?.perimeterM ? (
                  <>
                    <span>·</span>
                    <span>
                      Perímetro:{' '}
                      <strong className="text-slate-900 dark:text-zinc-100">
                        {currentBoundary.perimeterM} m
                      </strong>
                    </span>
                  </>
                ) : null}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsVraModalOpen(true)}
              className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Gerar prescrição em taxa variável (IDW / Krigagem Ordinária) e exportar ISOXML / GeoJSON"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Taxa Variável VRA</span>
            </button>

            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="h-8 px-2.5 bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-md text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Importar</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="h-8 px-2.5 bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-md text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Exportar</span>
            </button>

            {confirmClearAction ? (
              <div className="inline-flex items-center gap-1.5 pl-1">
                <span className="text-[11px] font-medium text-rose-700 dark:text-rose-400">
                  {confirmClearAction === 'plot' ? 'Limpar talhão?' : 'Zerar fazenda?'}
                </span>
                <button
                  type="button"
                  onClick={confirmClearAction === 'plot' ? executeClearPlot : executeClearEntireFarm}
                  className="h-7 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-semibold cursor-pointer"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClearAction(null)}
                  className="h-7 px-2 border border-slate-200 dark:border-zinc-700 rounded text-[11px] text-slate-600 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setConfirmClearAction('plot')}
                  className="h-8 px-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-md text-xs font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                  title="Remover contorno e pontos deste talhão"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar Talhão</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmClearAction('farm')}
                  className="h-8 px-2.5 text-slate-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-zinc-700 rounded-md text-xs font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                  title="Zerar todos os contornos e pontos desta fazenda"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Zerar Fazenda</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Painel Principal do Mapa */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
        {/* Barra de Pesquisa de Cidades & Polos Agrícolas */}
        <div
          ref={citySearchContainerRef}
          className="px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 space-y-2 relative"
        >
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
            <div className="relative flex-1 max-w-xl">
              <div className="relative flex items-center">
                <div className="absolute left-2.5 text-slate-400 dark:text-zinc-500 pointer-events-none">
                  {isSearchingCity ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  ) : (
                    <Search className="w-3.5 h-3.5" />
                  )}
                </div>
                <input
                  type="text"
                  value={citySearchQuery}
                  onChange={(e) => handleCityInputChange(e.target.value)}
                  onFocus={() => {
                    if (citySearchResults.length > 0) setShowCityDropdown(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchCitySubmit();
                    }
                  }}
                  placeholder="Buscar município (ex: Sorriso, Rio Verde, Cascavel, LEM, Dourados...)"
                  className="w-full h-8 pl-8 pr-20 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 rounded-md text-xs border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                />
                {citySearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setCitySearchQuery('');
                      setCitySearchResults([]);
                      setShowCityDropdown(false);
                    }}
                    aria-label="Limpar busca"
                    className="absolute right-14 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleSearchCitySubmit()}
                  disabled={!citySearchQuery.trim()}
                  className="absolute right-1 h-6 px-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded text-[11px] font-semibold cursor-pointer"
                >
                  Ir
                </button>
              </div>

              {/* Dropdown de sugestões */}
              {showCityDropdown && citySearchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-[1500] bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-700 overflow-hidden max-h-64 overflow-y-auto">
                  <div className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                    <span>Municípios ({citySearchResults.length})</span>
                    <span className="normal-case font-normal">clique para centralizar</span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {citySearchResults.map((city, idx) => (
                      <button
                        key={`${city.name}-${city.state}-${idx}`}
                        type="button"
                        onClick={() => handleFlyToCity(city)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-zinc-800/70 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                              <span className="truncate">{city.name}</span>
                              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                                {city.state}
                              </span>
                            </div>
                            {city.notes && (
                              <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate max-w-sm">
                                {city.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleCenterGPS}
                className="h-8 px-2.5 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-md text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                title="Centralizar mapa na coordenada GPS atual"
              >
                <Crosshair className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Meu GPS</span>
              </button>

              {selectedCityInfo && (
                <div className="h-8 px-2.5 inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-md text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {selectedCityInfo.name} - {selectedCityInfo.state}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (cityLocationMarkerRef.current && mapInstanceRef.current) {
                        mapInstanceRef.current.removeLayer(cityLocationMarkerRef.current);
                        cityLocationMarkerRef.current = null;
                      }
                      setSelectedCityInfo(null);
                    }}
                    aria-label="Remover marcador de cidade"
                    className="text-emerald-700 dark:text-emerald-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Atalhos Rápidos de Polos Agrícolas */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar pt-1">
            <span className="text-slate-500 dark:text-zinc-400 font-medium text-[10px] uppercase tracking-wide shrink-0">
              Polos:
            </span>
            {QUICK_AGRO_HUBS.map((hub) => (
              <button
                key={hub.label}
                type="button"
                onClick={() => {
                  const found = BRAZILIAN_AGRO_CITIES.find(
                    (c) => c.name.toLowerCase() === hub.query.toLowerCase()
                  );
                  if (found) {
                    handleFlyToCity(found);
                  } else {
                    handleCityInputChange(hub.query);
                    handleSearchCitySubmit(hub.query);
                  }
                }}
                className="h-6 px-2 rounded bg-white dark:bg-zinc-900 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer"
              >
                {hub.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ferramentas de Desenho & Camada Base */}
        <div className="px-3.5 py-2 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setMapMode('view');
                setDrawingCoords([]);
              }}
              className={`h-8 px-2.5 rounded-md font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                mapMode === 'view'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Navegar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMapMode('draw_polygon');
                setDrawingCoords([]);
              }}
              className={`h-8 px-2.5 rounded-md font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                mapMode === 'draw_polygon'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Desenhar Contorno</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMapMode('add_point');
                setDrawingCoords([]);
              }}
              className={`h-8 px-2.5 rounded-md font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                mapMode === 'add_point'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Marcar Ponto</span>
            </button>

            {currentBoundary && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setMapMode(mapMode === 'edit_vertices' ? 'view' : 'edit_vertices')
                  }
                  className={`h-8 px-2.5 rounded-md font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                    mapMode === 'edit_vertices'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{mapMode === 'edit_vertices' ? 'Concluir Vértices' : 'Ajustar Vértices'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsGridModalOpen(true)}
                  className="h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 hover:border-emerald-500 rounded-md font-medium inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Grid className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Grade Regular</span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerateZigzag}
                  className="h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 hover:border-emerald-500 rounded-md font-medium inline-flex items-center gap-1.5 cursor-pointer"
                  title="Gera rota de amostragem em zigue-zague recomendada pela Embrapa"
                >
                  <Shuffle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Zigue-Zague Embrapa</span>
                </button>
              </>
            )}
          </div>

          {/* Camada Base */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">Camada:</span>
            <div className="inline-flex p-0.5 bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md">
              <button
                type="button"
                onClick={() => setMapLayerType('satellite')}
                className={`h-6 px-2.5 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                  mapLayerType === 'satellite'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                Satélite
              </button>
              <button
                type="button"
                onClick={() => setMapLayerType('streets')}
                className={`h-6 px-2.5 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                  mapLayerType === 'streets'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                Ruas
              </button>
            </div>
          </div>
        </div>

        {/* Banner contextual: Desenho de polígono */}
        {mapMode === 'draw_polygon' && (
          <div className="px-3.5 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-900 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <MapIcon className="w-4 h-4 shrink-0" />
              <span>
                <strong>Modo Desenho:</strong> Clique nos vértices do talhão no mapa (
                <span className="tabular-nums font-semibold">{drawingCoords.length}</span> pontos marcados).
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelDrawing}
                className="h-7 px-2.5 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 rounded-md font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleFinishDrawing}
                disabled={drawingCoords.length < 3}
                className="h-7 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Fechar e Salvar</span>
              </button>
            </div>
          </div>
        )}

        {/* Banner contextual: Ajuste de vértices */}
        {mapMode === 'edit_vertices' && (
          <div className="px-3.5 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
              <Edit2 className="w-4 h-4 shrink-0" />
              <span>
                <strong>Ajuste de Vértices:</strong> Arraste os marcadores numerados para remodelar o contorno. Área e perímetro recalculam automaticamente.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMapMode('view')}
              className="h-7 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-semibold cursor-pointer"
            >
              Concluir Ajustes
            </button>
          </div>
        )}

        {/* Controle da Camada GeoTIFF */}
        {geotiffOverlay && (
          <div className="px-3.5 py-2 bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200">
              <Image className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>Raster GeoTIFF:</strong> {geotiffOverlay.name}{' '}
                {geotiffOverlay.fileSizeStr ? `(${geotiffOverlay.fileSizeStr})` : ''}
              </span>
            </div>
            <div className="flex items-center gap-3 tabular-nums">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">Opacidade:</span>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={geotiffOverlay.opacity}
                  onChange={(e) =>
                    setGeotiffOverlay({ ...geotiffOverlay, opacity: parseFloat(e.target.value) })
                  }
                  className="w-24 cursor-pointer accent-emerald-600"
                />
                <span className="text-[11px] font-mono text-slate-700 dark:text-zinc-300">
                  {Math.round(geotiffOverlay.opacity * 100)}%
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setGeotiffOverlay({ ...geotiffOverlay, visible: !geotiffOverlay.visible })
                }
                className="h-7 px-2 border border-slate-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                {geotiffOverlay.visible ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
                <span>{geotiffOverlay.visible ? 'Ocultar' : 'Exibir'}</span>
              </button>
              <button
                type="button"
                onClick={() => setGeotiffOverlay(null)}
                className="text-rose-600 dark:text-rose-400 hover:underline font-medium cursor-pointer"
              >
                Remover
              </button>
            </div>
          </div>
        )}

        {/* Mapa Leaflet */}
        <div className="relative isolate z-0 w-full h-[500px] bg-zinc-950">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Legenda compacta */}
          <div className="absolute top-3 right-3 z-[400] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs px-3 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-[11px] space-y-1.5 select-none">
            <div className="font-semibold text-slate-800 dark:text-zinc-200 pb-1 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 tabular-nums">
              <span>Legenda</span>
              <span className="text-[10px] font-normal text-slate-500 dark:text-zinc-400">
                {plotPoints.length} pts
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 shrink-0" />
              <span>Planejado</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 shrink-0" />
              <span>Coletado</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-xs bg-violet-600 shrink-0" />
              <span>Em Laboratório</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 shrink-0" />
              <span>Laudo Concluído</span>
            </div>
          </div>
        </div>

        {/* Lista / Tabela de Pontos */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Pontos de Amostragem ({filteredPoints.length})</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Edite detalhes ou arraste os marcadores diretamente no mapa.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filtrar ponto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 pr-2.5 border border-slate-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 w-40 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filtrar por status"
                className="h-8 px-2 border border-slate-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs cursor-pointer"
              >
                <option value="all">Todos Status</option>
                <option value="planejado">Planejados</option>
                <option value="coletado">Coletados</option>
                <option value="enviado_laboratorio">Em Laboratório</option>
                <option value="analisado">Laudo Concluído</option>
              </select>

              <select
                value={depthFilter}
                onChange={(e) => setDepthFilter(e.target.value)}
                aria-label="Filtrar por profundidade"
                className="h-8 px-2 border border-slate-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs cursor-pointer"
              >
                <option value="all">Todas Prof.</option>
                <option value="0-20">0-20 cm</option>
                <option value="20-40">20-40 cm</option>
                <option value="0-40">0-40 cm</option>
              </select>
            </div>
          </div>

          {filteredPoints.length === 0 ? (
            <div className="py-7 px-4 text-center bg-slate-50 dark:bg-zinc-950 rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 space-y-1.5">
              <MapPin className="w-5 h-5 text-slate-400 dark:text-zinc-600 mx-auto" />
              <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                Nenhum ponto de amostragem encontrado neste talhão
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                Use &quot;Marcar Ponto&quot;, gere uma &quot;Grade Regular&quot; ou importe arquivos KML, GeoJSON ou CSV.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300 tabular-nums">
                <thead className="bg-slate-50 dark:bg-zinc-950 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-2 px-3">Código</th>
                    <th className="py-2 px-3">Coordenadas</th>
                    <th className="py-2 px-3">Profundidade</th>
                    <th className="py-2 px-3">Subamostras</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Data</th>
                    <th className="py-2 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                  {filteredPoints.map((pt) => {
                    const st = getStatusMeta(pt.status);
                    const isConfirmingDelete = confirmDeletePointId === pt.id;
                    return (
                      <tr
                        key={pt.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        <td className="py-2 px-3 font-mono font-semibold text-slate-900 dark:text-zinc-100 whitespace-nowrap">
                          <span className="inline-flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-xs shrink-0 ${st.dotClass}`} />
                            {pt.code}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                          {pt.lat.toFixed(5)}, {pt.lng.toFixed(5)}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">{pt.depth} cm</td>
                        <td className="py-2 px-3 whitespace-nowrap">{pt.subsamplesCount}</td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className={`text-[11px] font-medium ${st.textClass}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-500 dark:text-zinc-400 text-[11px] whitespace-nowrap">
                          {pt.date}
                        </td>
                        <td className="py-2 px-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditPoint(pt)}
                              className="h-7 w-7 inline-flex items-center justify-center text-slate-500 hover:text-emerald-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded cursor-pointer"
                              title="Editar ponto"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {onNavigateToManualSample && (
                              <button
                                type="button"
                                onClick={() =>
                                  onNavigateToManualSample({
                                    sampleCode: pt.code,
                                    plotId: pt.plotId,
                                    depth: pt.depth === '20-40' ? '20-40' : '0-20',
                                    collectionDate: pt.date,
                                    notes: `Ponto georreferenciado: Lat ${pt.lat}, Lng ${pt.lng}. ${
                                      pt.notes || ''
                                    }`,
                                  })
                                }
                                className="h-7 px-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/80 dark:border-emerald-900 rounded text-[11px] font-medium cursor-pointer"
                              >
                                Lançar Laudo
                              </button>
                            )}

                            {isConfirmingDelete ? (
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDeletePoint(pt.id)}
                                  className="h-7 px-2 bg-rose-600 text-white rounded text-[11px] font-semibold cursor-pointer"
                                >
                                  Confirmar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeletePointId(null)}
                                  className="h-7 px-1.5 border border-slate-200 dark:border-zinc-700 rounded text-[11px] text-slate-600 dark:text-zinc-300 cursor-pointer"
                                >
                                  Não
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeletePointId(pt.id)}
                                className="h-7 w-7 inline-flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded cursor-pointer"
                                title="Excluir ponto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modais Extraídos */}
      <SoilPointModal
        isOpen={isPointModalOpen}
        editingPoint={editingPoint}
        pointForm={pointForm}
        setPointForm={setPointForm}
        onSubmit={handleSavePoint}
        onClose={() => {
          setIsPointModalOpen(false);
          setEditingPoint(null);
          setPendingPointCoords(null);
        }}
      />

      <SoilEditPlotModal
        isOpen={isEditPlotModalOpen}
        plotEditForm={plotEditForm}
        setPlotEditForm={setPlotEditForm}
        currentBoundary={currentBoundary}
        onSubmit={handleSavePlotEdit}
        onEditVertices={() => {
          setIsEditPlotModalOpen(false);
          setMapMode('edit_vertices');
        }}
        onClearPolygon={handleClearPolygon}
        onClose={() => setIsEditPlotModalOpen(false)}
      />

      <SoilExportModal
        isOpen={isExportModalOpen}
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
        isExporting={isExporting}
        plotName={currentBoundary?.name || currentPlot.name}
        areaHa={displayAreaHa || '—'}
        pointsCount={plotPoints.length}
        onExecute={handleExecuteExport}
        onClose={() => setIsExportModalOpen(false)}
      />

      <SoilImportModal
        isOpen={isImportModalOpen}
        fileInputRef={fileInputRef}
        importDragOver={importDragOver}
        setImportDragOver={setImportDragOver}
        importLoading={importLoading}
        importSummary={importSummary}
        importMergeMode={importMergeMode}
        setImportMergeMode={setImportMergeMode}
        onFileSelect={handleFileSelectForImport}
        onApply={handleApplyImport}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportSummary(null);
        }}
      />

      <SoilGridModal
        isOpen={isGridModalOpen}
        areaHa={displayAreaHa || 10}
        gridDensityHa={gridDensityHa}
        setGridDensityHa={setGridDensityHa}
        gridDepth={gridDepth}
        setGridDepth={setGridDepth}
        gridSubsamples={gridSubsamples}
        setGridSubsamples={setGridSubsamples}
        onGenerate={handleGenerateGrid}
        onClose={() => setIsGridModalOpen(false)}
      />

      {/* Modal VRA Lazy-loaded */}
      {isVraModalOpen && (
        <Suspense fallback={null}>
          <VraPrescriptionModal
            isOpen={isVraModalOpen}
            onClose={() => setIsVraModalOpen(false)}
            plotName={currentPlot.name}
            farmName={selectedFarm?.name || 'Fazenda'}
            boundaryCoordinates={currentBoundary?.coordinates}
            existingPoints={plotPoints}
          />
        </Suspense>
      )}
    </div>
  );
};
