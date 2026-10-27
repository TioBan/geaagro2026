// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Compass,
  MapPin,
  Layers,
  Plus,
  Trash2,
  Download,
  Upload,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  FileCheck2,
  Maximize2,
  Minimize2,
  RefreshCw,
  Search,
  Filter,
  Eye,
  EyeOff,
  Sliders,
  Printer,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  Info,
  ChevronRight,
  Check,
  Edit2,
  Edit3,
  Save,
  Grid,
  Shuffle,
  FileText,
  X,
  FileCode,
  Image,
  Database,
  ArrowRight,
  Crosshair,
  Map as MapIcon
} from 'lucide-react';
import { Farm, FieldPlot, SoilSample } from '../../types/agronomy';
import { SoilSamplingPoint, PlotBoundary, SoilSamplingStatus, GeoTIFFOverlay } from '../../types/soilSampling';
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
  calculateDistanceMeters
} from '../../utils/soilSamplingGeo';
import {
  BRAZILIAN_AGRO_CITIES,
  searchLocalBrazilianCities,
  searchOnlineCityNominatim,
} from '../../data/brazilianAgroCities';
import { VraPrescriptionModal } from './VraPrescriptionModal';

interface SoilSamplingMapViewProps {
  selectedFarm: Farm;
  soilSamples?: SoilSample[];
  onNavigateToManualSample?: (prefilledData: Partial<SoilSample>) => void;
  hideHeader?: boolean;
}

export const SoilSamplingMapView: React.FC<SoilSamplingMapViewProps> = ({
  selectedFarm,
  soilSamples = [],
  onNavigateToManualSample,
  hideHeader = false,
}) => {
  // Plots da fazenda selecionada
  const plots = selectedFarm?.plots || [];
  const [selectedPlotId, setSelectedPlotId] = useState<string>(() => plots[0]?.id || 'plot-1');
  const currentPlot = plots.find(p => p.id === selectedPlotId) || plots[0] || {
    id: 'plot-1',
    name: 'Talhão Principal',
    areaHa: 25,
    clayPercentage: 35
  };

  // Estado: Limites do talhão e Pontos de Amostragem (Inicia VAZIO sem dados pré-preenchidos)
  const [boundaries, setBoundaries] = useState<Record<string, PlotBoundary>>({});
  const [points, setPoints] = useState<SoilSamplingPoint[]>([]);

  // Camada GeoTIFF Raster carregada
  const [geotiffOverlay, setGeotiffOverlay] = useState<GeoTIFFOverlay | null>(null);

  // Modos de Operação do Mapa
  const [mapMode, setMapMode] = useState<'view' | 'draw_polygon' | 'add_point' | 'edit_vertices'>('view');
  const [mapLayerType, setMapLayerType] = useState<'satellite' | 'streets'>('satellite');
  const [drawingCoords, setDrawingCoords] = useState<[number, number][]>([]);

  // Modais
  const [isPointModalOpen, setIsPointModalOpen] = useState(false);
  const [pendingPointCoords, setPendingPointCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [editingPoint, setEditingPoint] = useState<SoilSamplingPoint | null>(null);

  const [isEditPlotModalOpen, setIsEditPlotModalOpen] = useState(false);
  const [plotEditForm, setPlotEditForm] = useState({
    name: '',
    crop: '',
    notes: '',
    areaHa: 0,
    perimeterM: 0
  });

  const [isGridModalOpen, setIsGridModalOpen] = useState(false);
  const [isVraModalOpen, setIsVraModalOpen] = useState(false);
  const [gridDensityHa, setGridDensityHa] = useState<number>(2);
  const [gridDepth, setGridDepth] = useState<'0-20' | '20-40'>('0-20');
  const [gridSubsamples, setGridSubsamples] = useState<number>(15);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'kml' | 'kmz' | 'geojson' | 'gpkg' | 'csv' | 'geotiff'>('kml');
  const [isExporting, setIsExporting] = useState(false);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importDragOver, setImportDragOver] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    file: File;
    type: string;
    pointsCount: number;
    hasBoundary: boolean;
    hasRaster: boolean;
    parsedData: any;
  } | null>(null);
  const [importMergeMode, setImportMergeMode] = useState<'replace' | 'append'>('replace');

  // Filtros & Pesquisa
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [depthFilter, setDepthFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Formulário de Cadastro e Edição de Ponto
  const [pointForm, setPointForm] = useState({
    code: '',
    lat: 0,
    lng: 0,
    depth: '0-20' as '0-20' | '20-40' | '0-40',
    date: new Date().toISOString().split('T')[0],
    subsamplesCount: 15,
    status: 'planejado' as SoilSamplingStatus,
    soilColor: 'Latossolo Vermelho Eutrófico',
    notes: '',
  });

  // Referências do Mapa Leaflet
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tempDrawLayerRef = useRef<L.LayerGroup | null>(null);
  const vertexEditLayerRef = useRef<L.LayerGroup | null>(null);
  const geotiffLayerRef = useRef<L.ImageOverlay | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para Busca de Cidades
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [citySearchResults, setCitySearchResults] = useState<AgroCity[]>([]);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [selectedCityInfo, setSelectedCityInfo] = useState<AgroCity | null>(null);
  const cityLocationMarkerRef = useRef<L.Marker | null>(null);
  const citySearchDebounceRef = useRef<any>(null);
  const citySearchContainerRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fechar dropdown de cidades ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (citySearchContainerRef.current && !citySearchContainerRef.current.contains(e.target as Node)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Manipulador de Digitação no Campo de Busca de Cidade
  const handleCityInputChange = (query: string) => {
    setCitySearchQuery(query);

    if (!query.trim() || query.trim().length < 2) {
      setCitySearchResults([]);
      setShowCityDropdown(false);
      return;
    }

    // 1. Busca local instantânea (catálogo em memória de municípios agrícolas)
    const localMatches = searchLocalBrazilianCities(query, 8);
    setCitySearchResults(localMatches);
    setShowCityDropdown(true);

    // 2. Busca online complementar via Nominatim OpenStreetMap com debounce
    if (citySearchDebounceRef.current) {
      clearTimeout(citySearchDebounceRef.current);
    }

    citySearchDebounceRef.current = setTimeout(async () => {
      if (query.trim().length < 3) return;
      setIsSearchingCity(true);
      try {
        const onlineMatches = await searchOnlineCityNominatim(query, 6);
        if (onlineMatches.length > 0) {
          setCitySearchResults((prev) => {
            const seen = new Set(prev.map(c => `${c.name.toLowerCase()}-${c.state.toLowerCase()}`));
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

  // Voar até a Cidade e Centralizar Mapa
  const handleFlyToCity = (city: AgroCity) => {
    setCitySearchQuery(`${city.name} - ${city.state}`);
    setSelectedCityInfo(city);
    setShowCityDropdown(false);

    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Voo suave do Leaflet com zoom de aproximação
    map.flyTo([city.lat, city.lng], 14, {
      duration: 1.5,
      easeLinearity: 0.25,
    });

    // Remover marcador anterior de busca se houver
    if (cityLocationMarkerRef.current) {
      map.removeLayer(cityLocationMarkerRef.current);
      cityLocationMarkerRef.current = null;
    }

    // Pino animado de localização
    const cityIcon = L.divIcon({
      className: 'bg-transparent border-none',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute -top-1.5 -left-1.5 w-10 h-10 rounded-full bg-emerald-400/40 animate-ping"></div>
          <div class="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white text-white flex items-center justify-center shadow-2xl text-xs font-black">
            📍
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const marker = L.marker([city.lat, city.lng], { icon: cityIcon })
      .bindTooltip(
        `<div style="font-family:sans-serif;padding:3px 6px;">
           <strong style="font-size:12px;color:#065f46;">${city.name} - ${city.state}</strong><br/>
           <span style="font-size:10px;color:#475569;">${city.notes || 'Região Agrícola Centralizada'}</span><br/>
           <span style="font-size:9px;color:#059669;font-weight:bold;">Use o botão "Desenhar Contorno" para delimitar seu talhão</span>
         </div>`,
        { permanent: false, direction: 'top', offset: [0, -10] }
      )
      .addTo(map);

    cityLocationMarkerRef.current = marker;
    showToast(`Mapa centralizado em ${city.name} - ${city.state}!`);
  };

  // Submissão ao Teclar Enter ou Clicar no Botão "Ir"
  const handleSearchCitySubmit = async (overrideQuery?: string) => {
    const q = overrideQuery || citySearchQuery;
    if (!q.trim()) return;

    if (citySearchResults.length > 0) {
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
        showToast(`Cidade "${q}" não localizada. Tente informar o estado (ex: Sorriso MT).`);
      }
    } catch (err) {
      showToast('Erro ao consultar a localização da cidade.');
    } finally {
      setIsSearchingCity(false);
    }
  };

  // Centralizar na Posição GPS do Usuário
  const handleCenterGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não suportada no seu dispositivo.');
      return;
    }

    showToast('Buscando sinal GPS do seu dispositivo...');
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
            html: `
              <div class="relative flex items-center justify-center">
                <div class="absolute -top-2 -left-2 w-12 h-12 rounded-full bg-blue-400/40 animate-ping"></div>
                <div class="w-8 h-8 rounded-full bg-blue-600 border-2 border-white text-white flex items-center justify-center shadow-xl text-xs font-black">
                  📡
                </div>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const marker = L.marker([latitude, longitude], { icon: gpsIcon })
            .bindTooltip(`<strong>Minha Posição GPS Atual</strong><br/><span style="font-size:10px;">${latitude.toFixed(5)}, ${longitude.toFixed(5)}</span>`, { permanent: false, direction: 'top' })
            .addTo(mapInstanceRef.current);

          cityLocationMarkerRef.current = marker;
          showToast('Centralizado na sua localização GPS atual!');
        }
      },
      (err) => {
        alert(`Não foi possível obter GPS: ${err.message}. Verifique as permissões de localização no navegador.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // 1. CARREGAMENTO SEM DADOS PRÉ-PREENCHIDOS (Somente dados salvos pelo usuário)
  useEffect(() => {
    if (!selectedFarm?.id) return;
    try {
      const savedBoundariesStr = localStorage.getItem(`geaagro_plot_boundaries_${selectedFarm.id}`);
      if (savedBoundariesStr) {
        setBoundaries(JSON.parse(savedBoundariesStr));
      } else {
        setBoundaries({});
      }

      const savedPointsStr = localStorage.getItem(`geaagro_soil_sampling_points_${selectedFarm.id}`);
      if (savedPointsStr) {
        setPoints(JSON.parse(savedPointsStr));
      } else {
        setPoints([]);
      }
    } catch (e) {
      console.warn('Erro ao carregar dados de mapeamento de solo:', e);
      setBoundaries({});
      setPoints([]);
    }
  }, [selectedFarm?.id]);

  // Listener para sincronização em tempo real entre abas e módulos
  useEffect(() => {
    if (!selectedFarm?.id) return;

    const handleExternalPoints = (e: CustomEvent) => {
      if (e.detail?.farmId === selectedFarm.id && e.detail?.points) {
        setPoints(e.detail.points);
      }
    };

    const handleExternalBoundaries = (e: CustomEvent) => {
      if (e.detail?.farmId === selectedFarm.id && e.detail?.boundaries) {
        setBoundaries(e.detail.boundaries);
      }
    };

    window.addEventListener('geaagro_soil_points_updated', handleExternalPoints as EventListener);
    window.addEventListener('geaagro_plot_boundaries_updated', handleExternalBoundaries as EventListener);

    return () => {
      window.removeEventListener('geaagro_soil_points_updated', handleExternalPoints as EventListener);
      window.removeEventListener('geaagro_plot_boundaries_updated', handleExternalBoundaries as EventListener);
    };
  }, [selectedFarm?.id]);

  // Salvar limites no localStorage
  const saveBoundariesToStorage = (updated: Record<string, PlotBoundary>) => {
    setBoundaries(updated);
    try {
      if (selectedFarm?.id) {
        localStorage.setItem(`geaagro_plot_boundaries_${selectedFarm.id}`, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('geaagro_plot_boundaries_updated', {
          detail: { farmId: selectedFarm.id, boundaries: updated }
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Salvar pontos no localStorage
  const savePointsToStorage = (updated: SoilSamplingPoint[]) => {
    setPoints(updated);
    try {
      if (selectedFarm?.id) {
        localStorage.setItem(`geaagro_soil_sampling_points_${selectedFarm.id}`, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('geaagro_soil_points_updated', {
          detail: { farmId: selectedFarm.id, points: updated }
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Limpar todos os dados do mapeamento (Zerar Talhão Ativo)
  const handleClearAllData = () => {
    if (window.confirm('Deseja limpar todos os pontos de amostragem e contorno deste talhão? Esta ação não pode ser desfeita.')) {
      const updatedBoundaries = { ...boundaries };
      delete updatedBoundaries[selectedPlotId];
      saveBoundariesToStorage(updatedBoundaries);

      const otherPoints = points.filter(p => p.plotId !== selectedPlotId);
      savePointsToStorage(otherPoints);

      if (geotiffLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(geotiffLayerRef.current);
        geotiffLayerRef.current = null;
      }
      setGeotiffOverlay(null);
      setDrawingCoords([]);
      setMapMode('view');
      showToast('Dados do talhão limpos com sucesso.');
    }
  };

  // Zerar completamente todos os dados de mapeamento da fazenda
  const handleClearEntireFarmData = () => {
    if (window.confirm(`Deseja zerar e remover TODOS os contornos e pontos de amostragem de TODOS os talhões da fazenda ${selectedFarm?.name || ''}? O mapa ficará 100% limpo.`)) {
      setBoundaries({});
      setPoints([]);
      try {
        localStorage.removeItem(`geaagro_plot_boundaries_${selectedFarm.id}`);
        localStorage.removeItem(`geaagro_soil_sampling_points_${selectedFarm.id}`);
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
      showToast('Mapeamento zerado: Todos os pontos e contornos da fazenda foram removidos!');
    }
  };

  // Limite atual do talhão selecionado
  const currentBoundary = boundaries[selectedPlotId];

  // Pontos pertencentes ao talhão selecionado
  const plotPoints = useMemo(() => {
    return points.filter(p => p.plotId === selectedPlotId);
  }, [points, selectedPlotId]);

  // Pontos filtrados
  const filteredPoints = useMemo(() => {
    return plotPoints.filter(p => {
      const matchQuery =
        !searchQuery ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.notes || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.soilColor || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchDepth = depthFilter === 'all' || p.depth === depthFilter;

      return matchQuery && matchStatus && matchDepth;
    });
  }, [plotPoints, searchQuery, statusFilter, depthFilter]);

  // Inicializar o Mapa Leaflet
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

      // Satélite ESRI World Imagery
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      );

      satLayer.addTo(map);
      tileLayerRef.current = satLayer;

      // Escala métrica
      L.control.scale({ imperial: false, metric: true, position: 'bottomleft' }).addTo(map);

      // Layer groups
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

  // Alternar Camada de Fundo (Satélite vs Mapa de Ruas)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    if (mapLayerType === 'satellite') {
      const sat = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(map);
      tileLayerRef.current = sat;
    } else {
      const streets = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19 }
      ).addTo(map);
      tileLayerRef.current = streets;
    }
  }, [mapLayerType]);

  // Manipulador de Clique no Mapa baseado no Modo Ativo
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (mapMode === 'draw_polygon') {
        setDrawingCoords(prev => [...prev, [Number(lat.toFixed(6)), Number(lng.toFixed(6))]]);
      } else if (mapMode === 'add_point') {
        const nextNum = (plotPoints.length || 0) + 1;
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

  // Renderizar desenho temporário de novo polígono
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

  // Renderizar e Atualizar Polígono do Talhão
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
        weight: 3,
        fillColor: '#10b981',
        fillOpacity: 0.18,
      }).addTo(map);

      poly.bindTooltip(
        `<div class="text-xs font-bold font-sans">${currentBoundary.name || currentPlot.name}<br/><span class="text-[10px] font-normal text-emerald-800">${currentBoundary.areaHa} ha | ${currentBoundary.perimeterM}m</span></div>`,
        { permanent: true, direction: 'center', className: 'soil-plot-tooltip' }
      );

      polygonLayerRef.current = poly;

      if (mapMode !== 'draw_polygon' && mapMode !== 'edit_vertices') {
        map.fitBounds(poly.getBounds(), { padding: [50, 50], maxZoom: 17 });
      }
    }
  }, [currentBoundary, selectedPlotId, mapMode, currentPlot.name]);

  // MODO EDIÇÃO DE VÉRTICES DO TALHÃO NO MAPA
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
            html: `
              <div style="
                background-color: #ffffff;
                color: #065f46;
                border: 2px solid #10b981;
                border-radius: 9999px;
                width: 22px;
                height: 22px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: 900;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                cursor: grab;
              ">
                ${index + 1}
              </div>
            `,
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          })
        });

        marker.on('drag', (e) => {
          const newPos = (e as any).latlng;
          const updatedCoords = [...currentBoundary.coordinates];
          updatedCoords[index] = [Number(newPos.lat.toFixed(6)), Number(newPos.lng.toFixed(6))];

          const newArea = calculatePolygonAreaHa(updatedCoords);
          const newPerimeter = calculatePolygonPerimeter(updatedCoords);

          const updatedBoundary: PlotBoundary = {
            ...currentBoundary,
            coordinates: updatedCoords,
            areaHa: newArea,
            perimeterM: newPerimeter,
            lastUpdated: new Date().toISOString()
          };

          setBoundaries(prev => ({ ...prev, [selectedPlotId]: updatedBoundary }));
        });

        marker.on('dragend', () => {
          saveBoundariesToStorage({ ...boundaries, [selectedPlotId]: boundaries[selectedPlotId] });
          showToast(`Vértice ${index + 1} ajustado.`);
        });

        marker.addTo(layer);
      });
    }
  }, [mapMode, currentBoundary?.coordinates]);

  // Renderizar Camada GeoTIFF Raster Overlay
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
        interactive: false
      }).addTo(map);

      geotiffLayerRef.current = overlay;
      map.fitBounds(geotiffOverlay.bounds, { padding: [40, 40] });
    }
  }, [geotiffOverlay]);

  // Auxiliar para Cores de Status
  const getStatusColor = (status: SoilSamplingStatus) => {
    switch (status) {
      case 'planejado':
        return { bg: '#f59e0b', text: '#ffffff', border: '#fcd34d', label: 'Planejado' };
      case 'coletado':
        return { bg: '#2563eb', text: '#ffffff', border: '#93c5fd', label: 'Coletado' };
      case 'enviado_laboratorio':
      case 'em_laboratorio':
        return { bg: '#8b5cf6', text: '#ffffff', border: '#c4b5fd', label: 'Em Laboratório' };
      case 'analisado':
        return { bg: '#10b981', text: '#ffffff', border: '#6ee7b7', label: 'Laudo Concluído' };
      default:
        return { bg: '#64748b', text: '#ffffff', border: '#cbd5e1', label: status };
    }
  };

  // Renderizar Marcadores dos Pontos de Amostragem (com suporte a Arrastar para Editar Posição)
  useEffect(() => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;
    const layer = markersLayerRef.current;
    layer.clearLayers();

    plotPoints.forEach((point) => {
      const statusStyle = getStatusColor(point.status);

      const icon = L.divIcon({
        className: 'custom-soil-pin',
        html: `
          <div style="
            background-color: ${statusStyle.bg};
            color: ${statusStyle.text};
            border: 2px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.35);
            border-radius: 9999px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 800;
            font-family: sans-serif;
            cursor: pointer;
            transition: transform 0.15s ease;
          ">
            ${point.pointNumber || point.code.replace(/\D/g, '') || '•'}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([point.lat, point.lng], {
        icon,
        draggable: true
      });

      // Evento de Arrastar Ponto para Editar Coordenadas no Mapa
      marker.on('dragend', (e) => {
        const newPos = (e as any).target.getLatLng();
        const updated = points.map(p => {
          if (p.id === point.id) {
            return {
              ...p,
              lat: Number(newPos.lat.toFixed(6)),
              lng: Number(newPos.lng.toFixed(6))
            };
          }
          return p;
        });
        savePointsToStorage(updated);
        showToast(`Coordenadas do ponto ${point.code} atualizadas para ${newPos.lat.toFixed(5)}, ${newPos.lng.toFixed(5)}.`);
      });

      // Popup com Ações Rápidas
      const popupHtml = document.createElement('div');
      popupHtml.className = 'p-1 font-sans text-xs text-slate-800 space-y-2';
      popupHtml.innerHTML = `
        <div class="border-b pb-1">
          <div class="flex items-center justify-between gap-2">
            <strong class="text-sm font-black text-slate-900">${point.code}</strong>
            <span style="background-color: ${statusStyle.bg}; color: #ffffff;" class="px-2 py-0.5 rounded-full text-[10px] font-bold">
              ${statusStyle.label}
            </span>
          </div>
          <div class="text-[10px] text-slate-500">${currentPlot.name} &bull; ${point.depth} cm</div>
        </div>

        <div class="space-y-1 text-[11px]">
          <div><strong>Data:</strong> ${point.date}</div>
          <div><strong>Subamostras:</strong> ${point.subsamplesCount} subamostras</div>
          <div><strong>Coordenadas:</strong> ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}</div>
          ${point.soilColor ? `<div><strong>Solo:</strong> ${point.soilColor}</div>` : ''}
          ${point.notes ? `<div class="text-slate-600 italic mt-1">"${point.notes}"</div>` : ''}
          <div class="text-[10px] text-emerald-700 bg-emerald-50 p-1 rounded font-semibold mt-1">
            Dica: você pode arrastar este pino no mapa para ajustar a posição!
          </div>
        </div>

        <div class="pt-2 border-t flex flex-col gap-1.5">
          <button id="btn-create-sample-${point.id}" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-2 rounded-lg cursor-pointer flex items-center justify-center gap-1">
            <span>Lançar Laudo no Módulo</span> &rarr;
          </button>
          <div class="flex items-center gap-1 justify-between">
            <button id="btn-edit-${point.id}" class="text-slate-700 hover:text-slate-900 text-[11px] font-bold py-1 px-2.5 border rounded hover:bg-slate-100 cursor-pointer flex items-center gap-1">
              ✏️ Editar Detalhes
            </button>
            <button id="btn-delete-${point.id}" class="text-red-600 hover:text-red-700 text-[11px] font-bold py-1 px-2.5 border border-red-200 rounded hover:bg-red-50 cursor-pointer">
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
                depth: (point.depth === '20-40' ? '20-40' : '0-20') as any,
                collectionDate: point.date,
                notes: `Ponto georreferenciado: Lat ${point.lat}, Lng ${point.lng}. ${point.notes || ''}`
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
            if (window.confirm(`Deseja realmente excluir o ponto ${point.code}?`)) {
              handleDeletePoint(point.id);
            }
          };
        }
      });

      marker.addTo(layer);
    });
  }, [plotPoints, currentPlot.name, onNavigateToManualSample]);

  // ABRIR MODAL DE EDIÇÃO DE PONTO
  const handleOpenEditPoint = (point: SoilSamplingPoint) => {
    setEditingPoint(point);
    setPointForm({
      code: point.code,
      lat: point.lat,
      lng: point.lng,
      depth: point.depth as any,
      date: point.date,
      subsamplesCount: point.subsamplesCount,
      status: point.status,
      soilColor: point.soilColor || 'Latossolo Vermelho Eutrófico',
      notes: point.notes || '',
    });
    setIsPointModalOpen(true);
  };

  // SALVAR / ATUALIZAR PONTO DE AMOSTRA
  const handleSavePoint = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPoint) {
      // Atualizar ponto existente
      const updated = points.map(p => {
        if (p.id === editingPoint.id) {
          return {
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
          };
        }
        return p;
      });
      savePointsToStorage(updated);
      showToast(`Ponto ${pointForm.code} atualizado com sucesso!`);
    } else if (pendingPointCoords) {
      // Criar novo ponto
      const newPoint: SoilSamplingPoint = {
        id: `point-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        farmId: selectedFarm.id,
        plotId: currentPlot.id,
        pointNumber: (plotPoints.length || 0) + 1,
        code: pointForm.code.trim() || `P-${((plotPoints.length || 0) + 1).toString().padStart(2, '0')}`,
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
      savePointsToStorage([...points, newPoint]);
      showToast(`Ponto ${newPoint.code} cadastrado no talhão!`);
    }

    setIsPointModalOpen(false);
    setEditingPoint(null);
    setPendingPointCoords(null);
  };

  // EXCLUIR PONTO
  const handleDeletePoint = (pointId: string) => {
    const updated = points.filter(p => p.id !== pointId);
    savePointsToStorage(updated);
    showToast('Ponto de coleta excluído.');
  };

  // ABRIR MODAL DE EDIÇÃO DO TALHÃO
  const handleOpenEditPlot = () => {
    setPlotEditForm({
      name: currentBoundary?.name || currentPlot.name,
      crop: currentBoundary?.crop || (currentPlot as any).crop || '',
      notes: currentBoundary?.notes || '',
      areaHa: currentBoundary?.areaHa || currentPlot.areaHa || 0,
      perimeterM: currentBoundary?.perimeterM || 0
    });
    setIsEditPlotModalOpen(true);
  };

  // SALVAR ALTERAÇÕES DO TALHÃO
  const handleSavePlotEdit = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentBoundary) {
      const updatedBoundary: PlotBoundary = {
        ...currentBoundary,
        name: plotEditForm.name.trim() || currentPlot.name,
        crop: plotEditForm.crop.trim(),
        notes: plotEditForm.notes.trim(),
        lastUpdated: new Date().toISOString()
      };
      saveBoundariesToStorage({ ...boundaries, [selectedPlotId]: updatedBoundary });
      showToast(`Talhão ${plotEditForm.name} atualizado com sucesso!`);
    } else {
      showToast('Nenhum contorno desenhado para salvar metadados.');
    }
    setIsEditPlotModalOpen(false);
  };

  // Concluir Desenho de Polígono
  const handleFinishDrawing = () => {
    if (drawingCoords.length < 3) {
      alert('Desenhe pelo menos 3 pontos no mapa para formar o polígono do talhão.');
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
      lastUpdated: new Date().toISOString()
    };

    saveBoundariesToStorage({ ...boundaries, [currentPlot.id]: newBoundary });
    setDrawingCoords([]);
    setMapMode('view');
    showToast(`Contorno do talhão salvo com sucesso! (${areaHa} ha)`);
  };

  // Cancelar Desenho
  const handleCancelDrawing = () => {
    setDrawingCoords([]);
    setMapMode('view');
  };

  // Excluir Contorno do Talhão
  const handleClearPolygon = () => {
    if (window.confirm(`Deseja remover o contorno do talhão ${currentPlot.name}?`)) {
      const updated = { ...boundaries };
      delete updated[currentPlot.id];
      saveBoundariesToStorage(updated);
      setMapMode('view');
      showToast('Contorno do talhão removido.');
    }
  };

  // Gerar Grade Amostral Regular
  const handleGenerateGrid = () => {
    if (!currentBoundary || currentBoundary.coordinates.length < 3) {
      alert('Desenhe o contorno do talhão no mapa antes de gerar a grade amostral.');
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
      alert('Nenhum ponto pôde ser gerado dentro dos limites com esta densidade.');
      return;
    }

    const otherPoints = points.filter(p => p.plotId !== currentPlot.id);
    savePointsToStorage([...otherPoints, ...newPts]);
    setIsGridModalOpen(false);
    showToast(`Grade amostral gerada: ${newPts.length} pontos distribuídos no talhão!`);
  };

  // Gerar Zigue-Zague Embrapa
  const handleGenerateZigzag = () => {
    if (!currentBoundary || currentBoundary.coordinates.length < 3) {
      alert('Desenhe o contorno do talhão no mapa antes de gerar o percurso em zigue-zague.');
      return;
    }

    const newPts = generateZigzagSamplingPath(
      currentBoundary.coordinates,
      12,
      selectedFarm.id,
      currentPlot.id,
      '0-20'
    );

    const otherPoints = points.filter(p => p.plotId !== currentPlot.id);
    savePointsToStorage([...otherPoints, ...newPts]);
    showToast(`Percurso zigue-zague Embrapa gerado com ${newPts.length} subamostras!`);
  };

  // =======================================================================
  // MOTOR DE EXPORTAÇÃO COMPLETA
  // =======================================================================
  const handleExecuteExport = async () => {
    if (plotPoints.length === 0 && !currentBoundary) {
      alert('Nenhum ponto ou contorno cadastrado para exportação.');
      return;
    }

    setIsExporting(true);
    const farmName = selectedFarm.name || 'Fazenda';
    const plotName = currentBoundary?.name || currentPlot.name || 'Talhao';
    const baseFilename = `GeaAgro_${plotName.toLowerCase().replace(/\s+/g, '_')}`;

    try {
      if (exportFormat === 'kml') {
        const kmlText = exportToKML(farmName, plotName, currentBoundary, plotPoints);
        const blob = new Blob([kmlText], { type: 'application/vnd.google-earth.kml+xml;charset=utf-8' });
        downloadBlob(blob, `${baseFilename}.kml`);
        showToast('Arquivo KML gerado para Google Earth e GPS!');
      } else if (exportFormat === 'kmz') {
        const kmzBlob = await exportToKMZ(farmName, plotName, currentBoundary, plotPoints);
        downloadBlob(kmzBlob, `${baseFilename}.kmz`);
        showToast('Pacote KMZ compactado exportado com sucesso!');
      } else if (exportFormat === 'geojson') {
        const geojsonText = exportToGeoJSON(farmName, plotName, currentBoundary, plotPoints);
        const blob = new Blob([geojsonText], { type: 'application/geo+json;charset=utf-8' });
        downloadBlob(blob, `${baseFilename}.geojson`);
        showToast('Arquivo GeoJSON exportado para SIG (QGIS/ArcGIS)!');
      } else if (exportFormat === 'gpkg') {
        const gpkgBlob = await exportToGPKG(farmName, plotName, currentBoundary, plotPoints);
        downloadBlob(gpkgBlob, `${baseFilename}.gpkg`);
        showToast('Pacote GeoPackage (.gpkg) exportado!');
      } else if (exportFormat === 'csv') {
        const csvText = exportToCSV(farmName, plotName, plotPoints);
        const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
        downloadBlob(blob, `${baseFilename}_coordenadas.csv`);
        showToast('Planilha CSV de pontos de coleta exportada!');
      } else if (exportFormat === 'geotiff') {
        // Exportar metadados e coordenadas de mapa raster
        if (geotiffOverlay) {
          const a = document.createElement('a');
          a.href = geotiffOverlay.imageUrl;
          a.download = `${baseFilename}_raster_overlay.png`;
          a.click();
          showToast('Imagem raster do GeoTIFF baixada com sucesso!');
        } else {
          // Exportar KML + GeoJSON combinado
          const geojsonText = exportToGeoJSON(farmName, plotName, currentBoundary, plotPoints);
          const blob = new Blob([geojsonText], { type: 'application/geo+json;charset=utf-8' });
          downloadBlob(blob, `${baseFilename}_camadas.geojson`);
          showToast('Camadas geoespaciais exportadas com sucesso!');
        }
      }
      setIsExportModalOpen(false);
    } catch (e: any) {
      alert(`Erro na exportação: ${e?.message || e}`);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // =======================================================================
  // MOTOR DE IMPORTAÇÃO COMPLETA
  // =======================================================================
  const handleFileSelectForImport = async (file: File) => {
    setImportLoading(true);
    const ext = file.name.split('.').pop()?.toLowerCase();

    try {
      if (ext === 'kml') {
        const text = await file.text();
        const parsed = importFromKML(text, currentPlot.id, selectedFarm.id);
        setImportSummary({
          file,
          type: 'KML (Google Earth)',
          pointsCount: parsed.points.length,
          hasBoundary: parsed.boundaries.length > 0,
          hasRaster: false,
          parsedData: parsed
        });
      } else if (ext === 'kmz') {
        const parsed = await importFromKMZ(file, currentPlot.id, selectedFarm.id);
        setImportSummary({
          file,
          type: 'KMZ Compactado',
          pointsCount: parsed.points.length,
          hasBoundary: parsed.boundaries.length > 0,
          hasRaster: false,
          parsedData: parsed
        });
      } else if (ext === 'geojson' || ext === 'json') {
        const text = await file.text();
        const parsed = importFromGeoJSON(text, currentPlot.id, selectedFarm.id);
        setImportSummary({
          file,
          type: 'GeoJSON (RFC 7946)',
          pointsCount: parsed.points.length,
          hasBoundary: parsed.boundaries.length > 0,
          hasRaster: false,
          parsedData: parsed
        });
      } else if (ext === 'csv' || ext === 'txt') {
        const text = await file.text();
        const parsed = importFromCSV(text, currentPlot.id, selectedFarm.id);
        if (parsed.errors.length > 0 && parsed.points.length === 0) {
          throw new Error(`Erros no CSV:\n${parsed.errors.slice(0, 3).join('\n')}`);
        }
        setImportSummary({
          file,
          type: 'Planilha CSV de Coordenadas',
          pointsCount: parsed.points.length,
          hasBoundary: false,
          hasRaster: false,
          parsedData: { boundaries: [], points: parsed.points }
        });
      } else if (ext === 'gpkg') {
        const parsed = await importFromGPKG(file, currentPlot.id, selectedFarm.id);
        setImportSummary({
          file,
          type: 'GeoPackage OGC (.gpkg)',
          pointsCount: parsed.points.length,
          hasBoundary: parsed.boundaries.length > 0,
          hasRaster: false,
          parsedData: parsed
        });
      } else if (ext === 'tif' || ext === 'tiff') {
        const buffer = await file.arrayBuffer();
        const farmCenter: [number, number] = [selectedFarm?.latitude || -15.7801, selectedFarm?.longitude || -47.9292];
        const overlay = await importFromGeoTIFF(buffer, file.name, farmCenter);
        setImportSummary({
          file,
          type: 'Raster GeoTIFF / TIFF (Fertilidade / NDVI / Drone)',
          pointsCount: 0,
          hasBoundary: false,
          hasRaster: true,
          parsedData: { overlay }
        });
      } else {
        throw new Error('Formato de arquivo não suportado. Utilize KML, KMZ, GeoJSON, CSV, GPKG ou GeoTIFF (.tif).');
      }
    } catch (e: any) {
      alert(`Falha ao ler o arquivo: ${e.message || e}`);
      setImportSummary(null);
    } finally {
      setImportLoading(false);
    }
  };

  // Confirmar Importação dos Dados Lidos
  const handleApplyImport = () => {
    if (!importSummary || !importSummary.parsedData) return;

    const { parsedData, hasRaster } = importSummary;

    if (hasRaster && parsedData.overlay) {
      setGeotiffOverlay(parsedData.overlay);
      showToast(`Camada GeoTIFF "${parsedData.overlay.name}" sobreposta no mapa!`);
    }

    if (parsedData.boundaries && parsedData.boundaries.length > 0) {
      const newBoundary = parsedData.boundaries[0];
      const updated = {
        ...boundaries,
        [currentPlot.id]: {
          ...newBoundary,
          plotId: currentPlot.id,
          name: newBoundary.name || currentPlot.name,
        }
      };
      saveBoundariesToStorage(updated);
    }

    if (parsedData.points && parsedData.points.length > 0) {
      if (importMergeMode === 'replace') {
        const otherPoints = points.filter(p => p.plotId !== currentPlot.id);
        savePointsToStorage([...otherPoints, ...parsedData.points]);
      } else {
        savePointsToStorage([...points, ...parsedData.points]);
      }
    }

    setIsImportModalOpen(false);
    setImportSummary(null);
    showToast('Importação concluída com sucesso!');
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Notificação Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[2000] bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-up border border-emerald-500/50">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header do Mapeamento de Solo ou Toolbar Compacta se hideHeader */}
      {!hideHeader ? (
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-800/40">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-xs font-extrabold text-emerald-300 border border-emerald-400/30">
                <Compass className="w-3.5 h-3.5" />
                <span>Agricultura de Precisão &bull; Amostragem Georreferenciada</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Mapeamento de Coletas no Talhão
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
                Delimite o contorno do talhão sobre imagem de satélite, crie ou edite pontos de coleta de solo e importe/exporte arquivos KML, KMZ, GeoJSON, CSV, GeoPackage e GeoTIFF.
              </p>
            </div>

            {/* Barra de Métricas em Tempo Real */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-xs">
              <div className="p-2 bg-black/20 rounded-xl">
                <span className="text-[10px] text-emerald-300 block font-bold">Área do Talhão</span>
                <strong className="text-sm font-black text-white">
                  {currentBoundary?.areaHa ? `${currentBoundary.areaHa} ha` : `${currentPlot.areaHa || '-'} ha`}
                </strong>
              </div>

              <div className="p-2 bg-black/20 rounded-xl">
                <span className="text-[10px] text-emerald-300 block font-bold">Pontos Marcados</span>
                <strong className="text-sm font-black text-white">{plotPoints.length}</strong>
              </div>

              <div className="p-2 bg-black/20 rounded-xl">
                <span className="text-[10px] text-emerald-300 block font-bold">Perímetro</span>
                <strong className="text-sm font-black text-white">
                  {currentBoundary?.perimeterM ? `${currentBoundary.perimeterM} m` : '-'}
                </strong>
              </div>

              <div className="p-2 bg-black/20 rounded-xl">
                <span className="text-[10px] text-emerald-300 block font-bold">Status Talhão</span>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                  currentBoundary ? 'bg-emerald-500/30 text-emerald-300' : 'bg-amber-500/30 text-amber-300'
                }`}>
                  {currentBoundary ? 'Delimitado' : 'Sem Contorno'}
                </span>
              </div>
            </div>
          </div>

          {/* Toolbar de Ações: Seleção de Talhão, Importar, Exportar e Editar */}
          <div className="mt-5 pt-4 border-t border-emerald-800/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> Talhão Ativo:
              </span>
              <select
                value={selectedPlotId}
                onChange={(e) => setSelectedPlotId(e.target.value)}
                className="bg-black/40 border border-emerald-700/60 text-white rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-400 cursor-pointer"
              >
                {(plots || []).map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.name} ({p.areaHa} ha)
                  </option>
                ))}
              </select>

              {/* Botão Editar Talhão */}
              <button
                onClick={handleOpenEditPlot}
                className="px-3 py-1.5 bg-teal-600/30 hover:bg-teal-600/50 text-teal-200 border border-teal-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                title="Editar nome, cultura, notas e vértices do talhão"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Talhão</span>
              </button>
            </div>

            {/* Botões Importar, Exportar e Limpar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Importar Arquivo</span>
              </button>

              <button
                onClick={() => setIsExportModalOpen(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar</span>
              </button>

              <button
                onClick={handleClearAllData}
                className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                title="Limpar todos os pontos e contornos deste talhão"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Talhão</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Toolbar Compacta e Integrada */
        <div className="bg-white dark:bg-zinc-950 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" /> Talhão Selecionado:
            </span>
            <select
              value={selectedPlotId}
              onChange={(e) => setSelectedPlotId(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer"
            >
              {(plots || []).map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.areaHa} ha)
                </option>
              ))}
            </select>

            <button
              onClick={handleOpenEditPlot}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-200 dark:border-zinc-700"
              title="Editar nome, cultura, notas e vértices do talhão"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Editar Talhão</span>
            </button>

            <div className="h-4 w-px bg-slate-200 dark:border-zinc-800 hidden md:block" />

            <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 font-medium">
              <span>Área: <strong className="text-slate-900 dark:text-zinc-100">{currentBoundary?.areaHa ? `${currentBoundary.areaHa} ha` : `${currentPlot.areaHa || '-'} ha`}</strong></span>
              <span>&bull;</span>
              <span>Pontos: <strong className="text-emerald-600 dark:text-emerald-400">{plotPoints.length}</strong></span>
              {currentBoundary?.perimeterM && (
                <>
                  <span>&bull;</span>
                  <span>Perímetro: <strong className="text-slate-800 dark:text-zinc-200">{currentBoundary.perimeterM} m</strong></span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsVraModalOpen(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-md"
              title="Gerar mapa de prescrição em taxa variável (IDW / Krigagem Ordinária) e exportar ISOXML / GeoJSON"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Taxa Variável VRA (IDW / Krigagem)</span>
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>Importar Arquivo</span>
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>

            <button
              onClick={handleClearAllData}
              className="px-3 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer border border-rose-200 dark:border-rose-900/50"
              title="Limpar todos os pontos e contornos deste talhão específico"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Talhão</span>
            </button>

            <button
              onClick={handleClearEntireFarmData}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
              title="Zerar e remover todos os contornos e pontos pré-preenchidos de toda a fazenda"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Zerar Mapeamento da Fazenda</span>
            </button>
          </div>
        </div>
      )}

      {/* Painel Principal do Mapa e Ferramentas */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* BARRA DE PESQUISA DE CIDADES & NAVEGAÇÃO REGIONAL */}
        <div
          ref={citySearchContainerRef}
          className="p-3 sm:p-3.5 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white border-b border-emerald-800/40 relative"
        >
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Campo de Pesquisa com Autocomplete de Cidades */}
            <div className="relative flex-1 max-w-2xl">
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-emerald-400 pointer-events-none">
                  {isSearchingCity ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  ) : (
                    <Search className="w-4 h-4 text-emerald-400" />
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
                  placeholder="Pesquisar cidade do talhão (ex: Sorriso, Rio Verde, Cascavel, LEM, Dourados...)"
                  className="w-full pl-10 pr-20 py-2.5 bg-black/50 hover:bg-black/60 focus:bg-black/75 text-white placeholder:text-emerald-200/50 rounded-xl text-xs sm:text-sm font-semibold border border-emerald-500/40 focus:outline-hidden focus:ring-2 focus:ring-emerald-400 shadow-inner transition"
                />
                {citySearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setCitySearchQuery('');
                      setCitySearchResults([]);
                      setShowCityDropdown(false);
                    }}
                    className="absolute right-12 text-slate-400 hover:text-white p-1 rounded-lg"
                    title="Limpar busca"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleSearchCitySubmit()}
                  disabled={!citySearchQuery.trim()}
                  className="absolute right-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  Buscar
                </button>
              </div>

              {/* Dropdown de Sugestões / Resultados de Cidades */}
              {showCityDropdown && citySearchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-[1500] bg-slate-900/98 backdrop-blur-md rounded-2xl border border-emerald-500/50 shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
                  <div className="p-2.5 bg-emerald-950/80 border-b border-emerald-800/40 text-[10px] font-black uppercase tracking-wider text-emerald-300 flex items-center justify-between">
                    <span>Municípios Encontrados ({citySearchResults.length})</span>
                    <span className="text-slate-400 lowercase font-normal">clique para posicionar o mapa</span>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {citySearchResults.map((city, idx) => (
                      <button
                        key={`${city.name}-${city.state}-${idx}`}
                        type="button"
                        onClick={() => handleFlyToCity(city)}
                        className="w-full text-left p-2.5 hover:bg-emerald-800/40 text-white transition flex items-center justify-between gap-2 group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-black transition">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{city.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-900/90 text-emerald-300 rounded font-black border border-emerald-700/50">
                                {city.state}
                              </span>
                            </div>
                            {city.notes && (
                              <p className="text-[11px] text-slate-300 truncate max-w-sm">
                                {city.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-[11px] text-emerald-400 font-bold shrink-0 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Centralizar</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Botões de Apoio: GPS e Indicação da Cidade Ativa */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleCenterGPS}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs shrink-0"
                title="Centralizar mapa na minha coordenada GPS atual"
              >
                <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
                <span>Meu GPS</span>
              </button>

              {selectedCityInfo && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-xl text-xs font-bold">
                  <span>📍 {selectedCityInfo.name} - {selectedCityInfo.state}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (cityLocationMarkerRef.current && mapInstanceRef.current) {
                        mapInstanceRef.current.removeLayer(cityLocationMarkerRef.current);
                        cityLocationMarkerRef.current = null;
                      }
                      setSelectedCityInfo(null);
                    }}
                    className="text-emerald-400 hover:text-white ml-1 cursor-pointer"
                    title="Remover indicador de cidade"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Atalhos Rápidos para Principais Polos do Agronegócio Brasileiro */}
          <div className="mt-2.5 pt-2 border-t border-emerald-900/40 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <span className="text-emerald-300/80 font-bold text-[10px] uppercase shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" /> Polos Agro:
            </span>
            {[
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
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  const found = BRAZILIAN_AGRO_CITIES.find(
                    (c) => c.name.toLowerCase() === chip.query.toLowerCase()
                  );
                  if (found) {
                    handleFlyToCity(found);
                  } else {
                    handleCityInputChange(chip.query);
                    handleSearchCitySubmit(chip.query);
                  }
                }}
                className="px-2.5 py-0.5 rounded-lg bg-black/40 hover:bg-emerald-600/40 text-emerald-200 hover:text-white border border-emerald-500/30 text-[10px] font-semibold whitespace-nowrap transition cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Barra Superior do Mapa: Ferramentas de Desenho e Visualização */}
        <div className="p-3 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Modos do Mapa */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => { setMapMode('view'); setDrawingCoords([]); }}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                mapMode === 'view'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Navegar</span>
            </button>

            <button
              onClick={() => { setMapMode('draw_polygon'); setDrawingCoords([]); }}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                mapMode === 'draw_polygon'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Desenhar Contorno</span>
            </button>

            <button
              onClick={() => { setMapMode('add_point'); setDrawingCoords([]); }}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                mapMode === 'add_point'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Marcar Ponto no Mapa</span>
            </button>

            {currentBoundary && (
              <button
                onClick={() => setMapMode(mapMode === 'edit_vertices' ? 'view' : 'edit_vertices')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  mapMode === 'edit_vertices'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                }`}
                title="Ajustar vértices do contorno arrastando no mapa"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{mapMode === 'edit_vertices' ? 'Concluir Vértices' : 'Ajustar Vértices'}</span>
              </button>
            )}

            {currentBoundary && (
              <button
                onClick={() => setIsGridModalOpen(true)}
                className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg font-bold flex items-center gap-1.5 hover:bg-indigo-100 cursor-pointer"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Grade Automática</span>
              </button>
            )}

            {currentBoundary && (
              <button
                onClick={handleGenerateZigzag}
                className="px-3 py-1.5 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-lg font-bold flex items-center gap-1.5 hover:bg-teal-100 cursor-pointer"
                title="Gera rota de amostragem em zigue-zague recomendada pela Embrapa"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Zigue-Zague Embrapa</span>
              </button>
            )}
          </div>

          {/* Camada do Mapa (Satélite vs Ruas) */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Camada:</span>
            <div className="flex items-center p-0.5 bg-slate-200 dark:bg-zinc-800 rounded-lg">
              <button
                onClick={() => setMapLayerType('satellite')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                  mapLayerType === 'satellite'
                    ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                Satélite
              </button>
              <button
                onClick={() => setMapLayerType('streets')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                  mapLayerType === 'streets'
                    ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                Ruas
              </button>
            </div>
          </div>
        </div>

        {/* Notificação / Instrução quando desenhando polígono */}
        {mapMode === 'draw_polygon' && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 p-3 border-b border-emerald-200 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
              <MapIcon className="w-4 h-4 text-emerald-600" />
              <span>
                <strong>Modo Desenho Ativo:</strong> Clique nos cantos do talhão na imagem de satélite para traçar os limites. ({drawingCoords.length} pontos marcados)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelDrawing}
                className="px-3 py-1 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border rounded-lg font-bold hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleFinishDrawing}
                disabled={drawingCoords.length < 3}
                className="px-4 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold disabled:opacity-50 cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Fechar e Salvar Talhão</span>
              </button>
            </div>
          </div>
        )}

        {/* Notificação quando ajustando vértices */}
        {mapMode === 'edit_vertices' && (
          <div className="bg-amber-50 dark:bg-amber-950/60 p-3 border-b border-amber-200 dark:border-amber-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-medium">
              <Edit2 className="w-4 h-4 text-amber-600" />
              <span>
                <strong>Ajuste de Vértices Ativo:</strong> Arraste os pinos circulares numerados no mapa para remodelar as bordas do talhão. A área e perímetro recalculam em tempo real.
              </span>
            </div>
            <button
              onClick={() => setMapMode('view')}
              className="px-3 py-1 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 cursor-pointer"
            >
              Concluir Ajustes
            </button>
          </div>
        )}

        {/* Controle Flutuante da Camada GeoTIFF Raster se carregada */}
        {geotiffOverlay && (
          <div className="bg-indigo-950 text-white p-3 border-b border-indigo-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4 text-indigo-400" />
              <div>
                <strong className="text-indigo-200 font-bold">Camada Raster GeoTIFF:</strong> {geotiffOverlay.name} ({geotiffOverlay.fileSizeStr})
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-indigo-300">Opacidade:</span>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={geotiffOverlay.opacity}
                  onChange={(e) => setGeotiffOverlay({ ...geotiffOverlay, opacity: parseFloat(e.target.value) })}
                  className="w-24 cursor-pointer accent-indigo-400"
                />
                <span className="text-[11px] font-mono">{Math.round(geotiffOverlay.opacity * 100)}%</span>
              </div>
              <button
                onClick={() => setGeotiffOverlay({ ...geotiffOverlay, visible: !geotiffOverlay.visible })}
                className="px-2 py-1 bg-indigo-900 hover:bg-indigo-800 rounded font-bold flex items-center gap-1"
              >
                {geotiffOverlay.visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{geotiffOverlay.visible ? 'Ocultar' : 'Exibir'}</span>
              </button>
              <button
                onClick={() => setGeotiffOverlay(null)}
                className="text-rose-300 hover:text-rose-100 font-bold ml-1"
                title="Remover camada raster"
              >
                &times; Fechar
              </button>
            </div>
          </div>
        )}

        {/* Conteúdo do Mapa Interativo */}
        <div className="relative w-full h-[520px] bg-slate-900">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Legenda Flutuante dos Status de Amostragem */}
          <div className="absolute top-3 right-3 z-[400] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-lg text-xs space-y-1.5 select-none">
            <div className="font-bold text-slate-800 dark:text-zinc-200 text-[11px] pb-1 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2">
              <span>Legenda de Coletas</span>
              <span className="text-[10px] text-slate-400">{plotPoints.length} total</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 border border-white shrink-0"></span>
              <span className="text-slate-600 dark:text-zinc-400 text-[11px]">Planejado / A Coletar</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600 border border-white shrink-0"></span>
              <span className="text-slate-600 dark:text-zinc-400 text-[11px]">Coletado em Campo</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-600 border border-white shrink-0"></span>
              <span className="text-slate-600 dark:text-zinc-400 text-[11px]">Em Laboratório</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white shrink-0"></span>
              <span className="text-slate-600 dark:text-zinc-400 text-[11px]">Laudo Concluído</span>
            </div>
          </div>
        </div>

        {/* Tabela e Lista de Pontos com Edição Rápida */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Pontos de Amostragem do Talhão ({filteredPoints.length})</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Clique em "Editar" para alterar código, coordenadas ou status, ou arraste o pino diretamente no mapa.
              </p>
            </div>

            {/* Filtros da Tabela */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar ponto..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-slate-300 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 w-44"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-medium cursor-pointer"
              >
                <option value="all">Todos os Status</option>
                <option value="planejado">Planejados</option>
                <option value="coletado">Coletados</option>
                <option value="enviado_laboratorio">Em Laboratório</option>
                <option value="analisado">Laudo Concluído</option>
              </select>
            </div>
          </div>

          {/* Tabela de Pontos */}
          {filteredPoints.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 space-y-2">
              <MapPin className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto" />
              <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Nenhum ponto de amostragem cadastrado neste talhão
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                Clique no botão "Marcar Ponto no Mapa", use a "Grade Automática" ou importe arquivos KML, GeoJSON ou CSV.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
                <thead className="bg-slate-100 dark:bg-zinc-900 font-bold text-slate-800 dark:text-zinc-200 border-b border-slate-200 dark:border-zinc-800 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3">Coordenadas (Lat, Lng)</th>
                    <th className="py-2.5 px-3">Profundidade</th>
                    <th className="py-2.5 px-3">Subamostras</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                  {filteredPoints.map((pt) => {
                    const st = getStatusColor(pt.status);
                    return (
                      <tr key={pt.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: st.bg }}
                          />
                          {pt.code}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-zinc-400">
                          {pt.lat.toFixed(5)}, {pt.lng.toFixed(5)}
                        </td>
                        <td className="py-2.5 px-3 font-medium">
                          {pt.depth} cm
                        </td>
                        <td className="py-2.5 px-3">
                          {pt.subsamplesCount} subs
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold inline-block text-white"
                            style={{ backgroundColor: st.bg }}
                          >
                            {st.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                          {pt.date}
                        </td>
                        <td className="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEditPoint(pt)}
                            className="p-1 text-slate-600 hover:text-emerald-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded cursor-pointer"
                            title="Editar detalhes do ponto"
                          >
                            <Edit2 className="w-3.5 h-3.5 inline" />
                          </button>
                          <button
                            onClick={() => {
                              if (onNavigateToManualSample) {
                                onNavigateToManualSample({
                                  sampleCode: pt.code,
                                  plotId: pt.plotId,
                                  depth: (pt.depth === '20-40' ? '20-40' : '0-20') as any,
                                  collectionDate: pt.date,
                                  notes: `Ponto georreferenciado: Lat ${pt.lat}, Lng ${pt.lng}. ${pt.notes || ''}`
                                });
                              }
                            }}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 rounded font-bold text-[11px] cursor-pointer"
                            title="Lançar análise química laboratorial deste ponto"
                          >
                            Lançar Laudo
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Excluir o ponto ${pt.code}?`)) {
                                handleDeletePoint(pt.id);
                              }
                            }}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                            title="Excluir ponto"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
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

      {/* =======================================================================
          MODAL 1: EDITAR / CADASTRAR PONTO DE AMOSTRA
          ======================================================================= */}
      {isPointModalOpen && (
        <div className="fixed inset-0 z-[1500] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>{editingPoint ? `Editar Ponto: ${editingPoint.code}` : 'Novo Ponto de Amostragem'}</span>
              </h3>
              <button
                onClick={() => setIsPointModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePoint} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                    Código da Amostra *
                  </label>
                  <input
                    type="text"
                    required
                    value={pointForm.code}
                    onChange={e => setPointForm({ ...pointForm, code: e.target.value })}
                    placeholder="Ex: P-01, ZL-02"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                    Profundidade da Coleta
                  </label>
                  <select
                    value={pointForm.depth}
                    onChange={e => setPointForm({ ...pointForm, depth: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black cursor-pointer font-medium"
                  >
                    <option value="0-20">0-20 cm (Camada Arável)</option>
                    <option value="20-40">20-40 cm (Subsolo)</option>
                    <option value="0-40">0-40 cm (Perfil Total)</option>
                  </select>
                </div>
              </div>

              {/* Coordenadas Geográficas Editáveis */}
              <div className="bg-slate-50 dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block">
                  Coordenadas Geográficas (Graus Decimais WGS84)
                </span>
                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      value={pointForm.lat}
                      onChange={e => setPointForm({ ...pointForm, lat: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      value={pointForm.lng}
                      onChange={e => setPointForm({ ...pointForm, lng: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                    Status da Coleta
                  </label>
                  <select
                    value={pointForm.status}
                    onChange={e => setPointForm({ ...pointForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black cursor-pointer font-bold"
                  >
                    <option value="planejado">🟡 Planejado</option>
                    <option value="coletado">🔵 Coletado</option>
                    <option value="enviado_laboratorio">🟣 Em Laboratório</option>
                    <option value="analisado">🟢 Laudo Concluído</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                    Data da Coleta
                  </label>
                  <input
                    type="date"
                    value={pointForm.date}
                    onChange={e => setPointForm({ ...pointForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                    Subamostras
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={pointForm.subsamplesCount}
                    onChange={e => setPointForm({ ...pointForm, subsamplesCount: parseInt(e.target.value, 10) || 15 })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                  Cor / Tipo de Solo no Local
                </label>
                <input
                  type="text"
                  value={pointForm.soilColor}
                  onChange={e => setPointForm({ ...pointForm, soilColor: e.target.value })}
                  placeholder="Ex: Latossolo Vermelho Eutrófico, Argiloso"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                  Observações de Campo
                </label>
                <textarea
                  rows={2}
                  value={pointForm.notes}
                  onChange={e => setPointForm({ ...pointForm, notes: e.target.value })}
                  placeholder="Ex: Ponto próximo à curva de nível 3, presença de palhada densa..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPointModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingPoint ? 'Salvar Alterações' : 'Adicionar Ponto'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL 2: EDITAR TALHÃO (NOME, CULTURA, NOTAS E OPÇÕES)
          ======================================================================= */}
      {isEditPlotModalOpen && (
        <div className="fixed inset-0 z-[1500] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-teal-600" />
                <span>Editar Dados do Talhão</span>
              </h3>
              <button
                onClick={() => setIsEditPlotModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlotEdit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                  Nome / Identificação do Talhão *
                </label>
                <input
                  type="text"
                  required
                  value={plotEditForm.name}
                  onChange={e => setPlotEditForm({ ...plotEditForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                  Cultura / Variedade Atual
                </label>
                <input
                  type="text"
                  placeholder="Ex: Soja Intacta 2, Milho Safrinha, Café Conilon"
                  value={plotEditForm.crop}
                  onChange={e => setPlotEditForm({ ...plotEditForm, crop: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black"
                />
              </div>

              {/* Informações Geográficas do Contorno */}
              <div className="bg-slate-50 dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                <span className="font-bold text-slate-800 dark:text-zinc-200 text-xs block">
                  Geometria do Contorno Atual
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Área Calculada</span>
                    <strong className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                      {currentBoundary?.areaHa ? `${currentBoundary.areaHa} hectares` : 'Não delimitado'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Perímetro</span>
                    <strong className="text-slate-800 dark:text-zinc-200 font-bold text-sm">
                      {currentBoundary?.perimeterM ? `${currentBoundary.perimeterM} metros` : '-'}
                    </strong>
                  </div>
                </div>

                {currentBoundary && (
                  <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditPlotModalOpen(false);
                        setMapMode('edit_vertices');
                      }}
                      className="text-xs text-amber-700 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Ajustar vértices arrastando no mapa
                    </button>
                    <button
                      type="button"
                      onClick={handleClearPolygon}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
                    >
                      Excluir Contorno
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                  Notas / Observações do Talhão
                </label>
                <textarea
                  rows={2}
                  value={plotEditForm.notes}
                  onChange={e => setPlotEditForm({ ...plotEditForm, notes: e.target.value })}
                  placeholder="Ex: Histórico de calagem em 2024, talhão com declividade moderada..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditPlotModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Dados</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL 3: EXPORTAÇÃO COMPLETA DE ARQUIVOS
          ======================================================================= */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-[1500] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-600" />
                <span>Exportar Dados de Mapeamento Agrícola</span>
              </h3>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 dark:text-zinc-400">
                Selecione o formato desejado para exportar o contorno do talhão e os pontos de amostragem georreferenciados:
              </p>

              {/* Cards de Formatos Suportados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* KML */}
                <div
                  onClick={() => setExportFormat('kml')}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                    exportFormat === 'kml'
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                      : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300'
                  }`}
                >
                  <FileCode className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 dark:text-zinc-100 font-bold">KML (Google Earth)</strong>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Ideal para visualização 3D no Google Earth e computadores de bordo.
                    </span>
                  </div>
                </div>

                {/* KMZ */}
                <div
                  onClick={() => setExportFormat('kmz')}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                    exportFormat === 'kmz'
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                      : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300'
                  }`}
                >
                  <FileCode className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 dark:text-zinc-100 font-bold">KMZ Compactado</strong>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Pacote KML compactado com ícones e metadados completos.
                    </span>
                  </div>
                </div>

                {/* GeoJSON */}
                <div
                  onClick={() => setExportFormat('geojson')}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                    exportFormat === 'geojson'
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                      : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300'
                  }`}
                >
                  <FileText className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 dark:text-zinc-100 font-bold">GeoJSON (QGIS / SIG)</strong>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Padrão OGC RFC 7946 para QGIS, ArcGIS e scripts de análise em Python.
                    </span>
                  </div>
                </div>

                {/* GeoPackage */}
                <div
                  onClick={() => setExportFormat('gpkg')}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                    exportFormat === 'gpkg'
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                      : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300'
                  }`}
                >
                  <Database className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 dark:text-zinc-100 font-bold">GeoPackage (.gpkg)</strong>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Banco de dados espacial padrão aberto universal para softwares SIG.
                    </span>
                  </div>
                </div>

                {/* CSV */}
                <div
                  onClick={() => setExportFormat('csv')}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                    exportFormat === 'csv'
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                      : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300'
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 dark:text-zinc-100 font-bold">Planilha CSV</strong>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Tabela com coordenadas Lat/Lng, códigos, profundidade e status.
                    </span>
                  </div>
                </div>

                {/* GeoTIFF / Raster */}
                <div
                  onClick={() => setExportFormat('geotiff')}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                    exportFormat === 'geotiff'
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                      : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300'
                  }`}
                >
                  <Image className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 dark:text-zinc-100 font-bold">GeoTIFF / Imagem Raster</strong>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Exporta o mapa raster e imagem de satélite com metadados espaciais.
                    </span>
                  </div>
                </div>
              </div>

              {/* Resumo do Conteúdo */}
              <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block">Talhão selecionado:</span>
                  <strong className="text-slate-900 dark:text-zinc-100">{currentPlot.name} ({currentBoundary?.areaHa || currentPlot.areaHa || '-'} ha)</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Total de pontos:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{plotPoints.length} pontos</strong>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handleExecuteExport}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>{isExporting ? 'Exportando...' : `Baixar Arquivo (${exportFormat.toUpperCase()})`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL 4: IMPORTAÇÃO COMPLETA DE ARQUIVOS (KML, KMZ, GeoJSON, CSV, GPKG, GeoTIFF)
          ======================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[1500] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                <span>Importar Arquivo Geoespacial</span>
              </h3>
              <button
                onClick={() => { setIsImportModalOpen(false); setImportSummary(null); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div
                onDragOver={(e) => { e.preventDefault(); setImportDragOver(true); }}
                onDragLeave={() => setImportDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setImportDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileSelectForImport(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition ${
                  importDragOver
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
                    : 'border-slate-300 dark:border-zinc-700 hover:border-emerald-500 bg-slate-50/50 dark:bg-zinc-900/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".kml,.kmz,.geojson,.json,.csv,.txt,.gpkg,.tif,.tiff"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelectForImport(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                  Arraste o arquivo ou clique para selecionar
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                  Formatos aceitos: <strong>KML, KMZ, GeoJSON, CSV, GeoPackage (.gpkg) e GeoTIFF / TIFF (.tif)</strong>
                </p>
              </div>

              {/* Status de Leitura / Resumo do Arquivo */}
              {importLoading && (
                <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl text-center space-y-2">
                  <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">Processando camadas georreferenciadas...</p>
                </div>
              )}

              {importSummary && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-2">
                    <div>
                      <strong className="block text-emerald-900 dark:text-emerald-200 text-sm font-bold">
                        {importSummary.file.name}
                      </strong>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        Formato: {importSummary.type}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 rounded-full font-bold text-[10px]">
                      {(importSummary.file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-white/70 dark:bg-black/30 rounded-lg">
                      <span className="text-slate-500 text-[10px] block">Contorno do Talhão</span>
                      <strong className="text-slate-900 dark:text-zinc-100 font-bold">
                        {importSummary.hasBoundary ? '✓ Detectado' : 'Não encontrado'}
                      </strong>
                    </div>

                    <div className="p-2 bg-white/70 dark:bg-black/30 rounded-lg">
                      <span className="text-slate-500 text-[10px] block">Pontos de Amostragem</span>
                      <strong className="text-slate-900 dark:text-zinc-100 font-bold">
                        {importSummary.pointsCount} pontos detectados
                      </strong>
                    </div>
                  </div>

                  {importSummary.hasRaster && (
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-lg text-indigo-900 dark:text-indigo-200 text-xs">
                      <strong>Mapa Raster GeoTIFF detectado:</strong> a imagem de satélite / fertilidade será projetada como camada sobreposta com controle de transparência.
                    </div>
                  )}

                  {importSummary.pointsCount > 0 && (
                    <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
                      <span className="text-slate-700 dark:text-zinc-300 font-medium">Modo de Gravação:</span>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="mergeMode"
                            checked={importMergeMode === 'replace'}
                            onChange={() => setImportMergeMode('replace')}
                          />
                          <span>Substituir</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="mergeMode"
                            checked={importMergeMode === 'append'}
                            onChange={() => setImportMergeMode('append')}
                          />
                          <span>Mesclar</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsImportModalOpen(false); setImportSummary(null); }}
                  className="px-4 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!importSummary}
                  onClick={handleApplyImport}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>Carregar no Mapa</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL 5: GERAR GRADE AMOSTRAL AUTOMÁTICA
          ======================================================================= */}
      {isGridModalOpen && (
        <div className="fixed inset-0 z-[1500] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Grid className="w-5 h-5 text-indigo-600" />
                <span>Gerar Grade Amostral Regular</span>
              </h3>
              <button
                onClick={() => setIsGridModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 dark:text-zinc-400">
                Gere pontos de amostragem georreferenciados distribuídos uniformemente dentro do contorno do talhão ({currentBoundary?.areaHa || currentPlot.areaHa} ha).
              </p>

              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                  Densidade Amostral (Hectares por Ponto)
                </label>
                <select
                  value={gridDensityHa}
                  onChange={e => setGridDensityHa(parseFloat(e.target.value) || 2)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black font-bold cursor-pointer"
                >
                  <option value="1">1 ponto a cada 1,0 hectare (Alta Precisão)</option>
                  <option value="2">1 ponto a cada 2,0 hectares (Padrão Recomendado)</option>
                  <option value="2.5">1 ponto a cada 2,5 hectares</option>
                  <option value="3">1 ponto a cada 3,0 hectares</option>
                  <option value="5">1 ponto a cada 5,0 hectares (Extensivo)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                    Profundidade Padrão
                  </label>
                  <select
                    value={gridDepth}
                    onChange={e => setGridDepth(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black cursor-pointer font-medium"
                  >
                    <option value="0-20">0-20 cm</option>
                    <option value="20-40">20-40 cm</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                    Subamostras por Ponto
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="30"
                    value={gridSubsamples}
                    onChange={e => setGridSubsamples(parseInt(e.target.value, 10) || 15)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs flex items-center justify-between">
                <span>Estimativa de pontos gerados:</span>
                <strong className="text-sm font-bold">
                  ~{Math.max(1, Math.round((currentBoundary?.areaHa || currentPlot.areaHa || 10) / gridDensityHa))} pontos
                </strong>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGridModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleGenerateGrid}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Grid className="w-4 h-4" />
                  <span>Gerar Grade</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Prescrição VRA e Interpolação Espacial */}
      <VraPrescriptionModal
        isOpen={isVraModalOpen}
        onClose={() => setIsVraModalOpen(false)}
        plotName={currentPlot.name}
        farmName={selectedFarm?.name || 'Fazenda'}
        boundaryCoordinates={currentBoundary?.coordinates}
        existingPoints={plotPoints}
      />
    </div>
  );
};
