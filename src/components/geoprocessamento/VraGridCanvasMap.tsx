import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Layers,
  Eye,
  Sliders,
  Download,
  FileCode,
  Sparkles,
  Compass,
  Maximize2,
  Minimize2,
  Info,
  MapPin,
  RefreshCw,
  TrendingUp,
  Grid
} from 'lucide-react';
import { PrescriptionMapResult } from '../../utils/spatialInterpolationEngine';

interface VraGridCanvasMapProps {
  prescriptionResult: PrescriptionMapResult | null;
  height?: string;
  nutrientName?: string;
  plotName?: string;
  farmName?: string;
  boundaryCoordinates?: [number, number][];
  onOpenModalToReinterpolate?: () => void;
  onDownloadGeoJSON?: () => void;
  onDownloadISOXML?: () => void;
}

export const VraGridCanvasMap: React.FC<VraGridCanvasMapProps> = ({
  prescriptionResult,
  height = '500px',
  nutrientName = 'Nutriente Interpolação',
  plotName = 'Talhão Mapeado',
  farmName = 'Fazenda',
  boundaryCoordinates,
  onOpenModalToReinterpolate,
  onDownloadGeoJSON,
  onDownloadISOXML,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const boundaryLayerRef = useRef<L.Polygon | null>(null);

  const [mapTileType, setMapTileType] = useState<'satellite' | 'streets'>('satellite');
  const [gridOpacity, setGridOpacity] = useState<number>(0.75);
  const [selectedCell, setSelectedCell] = useState<any | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(true);

  // Tile Layers URLs
  const satelliteUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  const streetsUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  // Inicializar o Mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Já inicializado

    // Centro inicial (Brasil Central por padrão)
    const initialLat = boundaryCoordinates && boundaryCoordinates.length > 0 ? boundaryCoordinates[0][0] : -12.5833;
    const initialLng = boundaryCoordinates && boundaryCoordinates.length > 0 ? boundaryCoordinates[0][1] : -55.7167;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Adicionar camada base
    const baseTile = L.tileLayer(satelliteUrl, {
      maxZoom: 19,
      attribution: 'Esri Satellite & Esri World Imagery',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Atualizar Tipo de Mapa Base (Satélite vs Ruas)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remover tile layers existentes
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const url = mapTileType === 'satellite' ? satelliteUrl : streetsUrl;
    L.tileLayer(url, { maxZoom: 19 }).addTo(map);
  }, [mapTileType]);

  // Renderizar o Grid Interpolado e o Contorno do Talhão
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // 1. Remover camada GeoJSON anterior
    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
      geoJsonLayerRef.current = null;
    }

    // 2. Remover camada do contorno
    if (boundaryLayerRef.current) {
      map.removeLayer(boundaryLayerRef.current);
      boundaryLayerRef.current = null;
    }

    // Renderizar contorno do talhão
    if (boundaryCoordinates && boundaryCoordinates.length >= 3) {
      const poly = L.polygon(boundaryCoordinates, {
        color: '#10b981',
        weight: 3,
        dashArray: '6, 6',
        fillOpacity: 0.05,
      }).addTo(map);
      boundaryLayerRef.current = poly;
    }

    // Se houver resultado de prescrição, renderizar o Grid
    if (prescriptionResult && prescriptionResult.features && prescriptionResult.features.length > 0) {
      const geoJsonLayer = L.geoJSON(prescriptionResult as any, {
        style: (feature) => {
          const color = feature?.properties?.COLOR || '#10b981';
          return {
            fillColor: color,
            weight: 0.8,
            opacity: 0.9,
            color: '#1e293b',
            fillOpacity: gridOpacity,
          };
        },
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          const tooltipContent = `
            <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 11px; padding: 4px;">
              <div style="font-weight: 900; color: #0f172a; margin-bottom: 2px;">Célula ${props.ID}</div>
              <div style="color: #059669; font-weight: 800;">Teor Interpolado: ${props.VALOR_INTERPOLADO}</div>
              ${props.VARIANCE_KRIGING ? `<div style="color: #64748b;">Variância Krigagem: ${props.VARIANCE_KRIGING}</div>` : ''}
              <div style="font-weight: 700; color: #1e293b; margin-top: 2px;">Dose Target: ${props.DOSE_TARGET} ${props.UNIT}</div>
              <div style="background-color: ${props.COLOR}; color: #ffffff; padding: 1px 6px; border-radius: 4px; font-weight: bold; margin-top: 4px; display: inline-block;">${props.CLASS_LABEL}</div>
            </div>
          `;

          layer.bindTooltip(tooltipContent, {
            sticky: true,
            direction: 'auto',
            opacity: 0.95,
          });

          layer.on({
            mouseover: (e) => {
              const l = e.target;
              l.setStyle({ weight: 2.5, color: '#ffffff' });
            },
            mouseout: (e) => {
              if (geoJsonLayerRef.current) {
                geoJsonLayerRef.current.resetStyle(e.target);
              }
            },
            click: () => {
              setSelectedCell(props);
            },
          });
        },
      }).addTo(map);

      geoJsonLayerRef.current = geoJsonLayer;

      // Ajustar Zoom para Enquadrar o Grid
      try {
        const bounds = geoJsonLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [30, 30] });
        }
      } catch (e) {
        console.warn('Bounds inválidos para fitBounds:', e);
      }
    } else if (boundaryCoordinates && boundaryCoordinates.length >= 3) {
      const polyBounds = L.polygon(boundaryCoordinates).getBounds();
      if (polyBounds.isValid()) {
        map.fitBounds(polyBounds, { padding: [20, 20] });
      }
    }
  }, [prescriptionResult, boundaryCoordinates]);

  // Atualizar Opacidade do Grid Dinamicamente
  useEffect(() => {
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.setStyle({ fillOpacity: gridOpacity });
    }
  }, [gridOpacity]);

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-900 shadow-xl flex flex-col transition-all ${
        isFullscreen ? 'fixed inset-4 z-[3000] h-[calc(100vh-2rem)]' : ''
      }`}
      style={{ height: isFullscreen ? undefined : height }}
    >
      {/* Header / Barra de Ferramentas Superior do Mapa */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Título e Info do Talhão */}
        <div className="bg-slate-950/85 backdrop-blur-md text-white border border-slate-700/60 px-3.5 py-2 rounded-2xl shadow-lg pointer-events-auto flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
            <Compass className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                Mapa Interativo de Interpolação (IDW / Krigagem)
              </span>
            </div>
            <h4 className="text-xs font-black text-white truncate max-w-[240px] sm:max-w-[360px]">
              {nutrientName} &bull; {plotName}
            </h4>
          </div>
        </div>

        {/* Controles do Mapa (Troca de Camada, Opacidade, Fullscreen) */}
        <div className="bg-slate-950/85 backdrop-blur-md text-white border border-slate-700/60 p-1.5 rounded-2xl shadow-lg pointer-events-auto flex items-center gap-2 text-xs font-bold">
          {/* Alternar Satélite vs Ruas */}
          <div className="flex items-center bg-slate-800/80 rounded-xl p-0.5 border border-slate-700">
            <button
              onClick={() => setMapTileType('satellite')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px] ${
                mapTileType === 'satellite' ? 'bg-emerald-600 text-white font-black shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Satélite
            </button>
            <button
              onClick={() => setMapTileType('streets')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px] ${
                mapTileType === 'streets' ? 'bg-emerald-600 text-white font-black shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mapa
            </button>
          </div>

          {/* Controle de Opacidade do Grid */}
          {prescriptionResult && (
            <div className="hidden sm:flex items-center gap-2 px-2 border-l border-slate-700/80">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] text-slate-300">Transparência:</span>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={gridOpacity}
                onChange={(e) => setGridOpacity(Number(e.target.value))}
                className="w-20 accent-emerald-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
              <span className="text-[10px] font-mono text-emerald-400 w-8 text-right">
                {Math.round(gridOpacity * 100)}%
              </span>
            </div>
          )}

          {/* Botão de Tela Cheia */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-slate-800 rounded-xl transition text-slate-300 hover:text-white cursor-pointer"
            title={isFullscreen ? 'Sair da Tela Cheia' : 'Expandir Tela Cheia'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Container Principal do Mapa Leaflet */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Legenda Agronômica Flutuante no Canto Inferior Esquerdo */}
      {prescriptionResult && showLegend && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-slate-950/90 backdrop-blur-md text-white border border-slate-700/70 p-3.5 rounded-2xl shadow-2xl max-w-xs animate-fade-in text-xs space-y-2.5">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="font-black text-[11px] text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Grid className="w-3.5 h-3.5 text-emerald-400" />
              <span>Legenda de Doses Prescritas</span>
            </span>
            <button
              onClick={() => setShowLegend(false)}
              className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
            >
              Ocultar
            </button>
          </div>

          {/* Classes de Cores */}
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {(prescriptionResult.metadata.intervals || []).map((inter) => (
              <div key={inter.id} className="flex items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3.5 h-3.5 rounded-md shrink-0 shadow-xs border border-white/20"
                    style={{ backgroundColor: inter.color }}
                  />
                  <span className="truncate font-semibold text-slate-200">{inter.label}</span>
                </div>
                <span className="font-mono font-black text-amber-300 shrink-0">
                  {inter.dose} {inter.unit}
                </span>
              </div>
            ))}
          </div>

          {/* Métricas do Grid */}
          <div className="pt-2 border-t border-slate-800/80 text-[10px] grid grid-cols-2 gap-2 text-slate-400">
            <div>
              <span className="block text-slate-500">Área Mapeada:</span>
              <strong className="text-white font-mono">{prescriptionResult.metadata.totalAreaHa} ha</strong>
            </div>
            <div>
              <span className="block text-slate-500">Total Insumo:</span>
              <strong className="text-amber-300 font-mono">
                {prescriptionResult.metadata.totalInputRequired} {prescriptionResult.metadata.inputUnit}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Botão de Reexibir Legenda (se ocultada) */}
      {prescriptionResult && !showLegend && (
        <button
          onClick={() => setShowLegend(true)}
          className="absolute bottom-4 left-4 z-[1000] bg-slate-950/85 backdrop-blur-md text-white border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-slate-900 transition cursor-pointer shadow-lg"
        >
          Exibir Legenda
        </button>
      )}

      {/* Card Flutuante de Célula Selecionada (ao Clicar em uma Célula do Grid) */}
      {selectedCell && (
        <div className="absolute bottom-4 right-14 z-[1000] bg-slate-950/95 backdrop-blur-md text-white border border-emerald-500/50 p-4 rounded-2xl shadow-2xl max-w-xs animate-in slide-in-from-bottom-2 text-xs space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="font-black text-emerald-400">Célula da Grade #{selectedCell.ID}</span>
            <button
              onClick={() => setSelectedCell(null)}
              className="text-slate-400 hover:text-white cursor-pointer font-bold text-sm"
            >
              &times;
            </button>
          </div>

          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Coordenadas:</span>
              <span>{selectedCell.Y.toFixed(5)}, {selectedCell.X.toFixed(5)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Teor Interpolado:</span>
              <strong className="text-emerald-400">{selectedCell.VALOR_INTERPOLADO}</strong>
            </div>
            {selectedCell.VARIANCE_KRIGING && (
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Variância Krigagem:</span>
                <span>{selectedCell.VARIANCE_KRIGING}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Classe:</span>
              <span className="px-1.5 rounded text-[10px] font-extrabold text-white" style={{ backgroundColor: selectedCell.COLOR }}>
                {selectedCell.CLASS_LABEL}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800 text-xs">
              <span className="text-slate-300 font-sans font-bold">Dose Prescrita Target:</span>
              <strong className="text-amber-300 font-black">{selectedCell.DOSE_TARGET} {selectedCell.UNIT}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Overlay Sem Dados (Caso o Grid ainda não tenha sido gerado) */}
      {!prescriptionResult && (
        <div className="absolute inset-0 z-[500] bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-6 text-center pointer-events-none">
          <div className="bg-slate-950/90 border border-slate-700/80 text-white p-6 rounded-3xl max-w-md shadow-2xl space-y-3 pointer-events-auto">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-400/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-white">
              Nenhuma Matriz Interpolada Renderizada
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Execute a interpolação geoestatística (IDW ou Krigagem Ordinária) para visualizar a camada de manchas de nutrientes e zonas de aplicação a taxa variável neste mapa.
            </p>

            {onOpenModalToReinterpolate && (
              <button
                onClick={onOpenModalToReinterpolate}
                className="mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center gap-2 mx-auto active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Configurar &amp; Gerar Grid Interpolado</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
