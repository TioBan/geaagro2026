import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Eye,
  Compass,
  Maximize2,
  Minimize2,
  RefreshCw,
  Grid,
  Download,
  FileCode,
  X
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

  const satelliteUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  const streetsUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  // Inicializar o Mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = boundaryCoordinates && boundaryCoordinates.length > 0 ? boundaryCoordinates[0][0] : -12.5833;
    const initialLng = boundaryCoordinates && boundaryCoordinates.length > 0 ? boundaryCoordinates[0][1] : -55.7167;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer(satelliteUrl, {
      maxZoom: 19,
      attribution: 'Esri World Imagery',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Reajustar dimensões do canvas ao alternar tela cheia
  useEffect(() => {
    const timer = window.setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 150);
    return () => window.clearTimeout(timer);
  }, [isFullscreen]);

  // Atualizar Tipo de Mapa Base
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

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

    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
      geoJsonLayerRef.current = null;
    }

    if (boundaryLayerRef.current) {
      map.removeLayer(boundaryLayerRef.current);
      boundaryLayerRef.current = null;
    }

    if (boundaryCoordinates && boundaryCoordinates.length >= 3) {
      const poly = L.polygon(boundaryCoordinates, {
        color: '#10b981',
        weight: 2.5,
        dashArray: '6, 6',
        fillOpacity: 0.05,
      }).addTo(map);
      boundaryLayerRef.current = poly;
    }

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
              <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">Célula ${props.ID}</div>
              <div style="color: #059669; font-weight: 600;">Teor: ${props.VALOR_INTERPOLADO}</div>
              ${props.VARIANCE_KRIGING ? `<div style="color: #64748b;">Variância: ${props.VARIANCE_KRIGING}</div>` : ''}
              <div style="font-weight: 600; color: #1e293b; margin-top: 2px;">Dose: ${props.DOSE_TARGET} ${props.UNIT}</div>
              <div style="background-color: ${props.COLOR}; color: #ffffff; padding: 1px 6px; border-radius: 4px; font-weight: 600; margin-top: 4px; display: inline-block;">${props.CLASS_LABEL}</div>
            </div>
          `;

          layer.bindTooltip(tooltipContent, {
            sticky: true,
            direction: 'auto',
            opacity: 0.95,
          });

          layer.on({
            mouseover: (e) => {
              e.target.setStyle({ weight: 2, color: '#ffffff' });
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

      try {
        const bounds = geoJsonLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [30, 30] });
        }
      } catch {
        // Ignora bounds inválidos
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
      className={`relative rounded-xl overflow-hidden border border-slate-200/80 dark:border-zinc-800 bg-zinc-950 flex flex-col transition-all ${
        isFullscreen ? 'fixed inset-4 z-[3000] h-[calc(100vh-2rem)]' : 'isolate z-0'
      }`}
      style={{ height: isFullscreen ? undefined : height }}
    >
      {/* Toolbar Superior do Mapa */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="bg-zinc-950/90 backdrop-blur-md text-white border border-zinc-700/80 px-3 py-2 rounded-lg pointer-events-auto flex items-center gap-2.5">
          <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] font-medium text-emerald-400 block leading-tight">
              Interpolação Espacial (IDW / Krigagem)
            </span>
            <h4 className="text-xs font-semibold text-white truncate max-w-[220px] sm:max-w-[340px]">
              {nutrientName} · {plotName}
            </h4>
          </div>
        </div>

        <div className="bg-zinc-950/90 backdrop-blur-md text-white border border-zinc-700/80 p-1 rounded-lg pointer-events-auto flex items-center gap-1.5 text-xs">
          <div className="flex items-center bg-zinc-900 rounded-md p-0.5 border border-zinc-700/80">
            <button
              type="button"
              onClick={() => setMapTileType('satellite')}
              className={`h-6 px-2.5 rounded text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                mapTileType === 'satellite' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Satélite
            </button>
            <button
              type="button"
              onClick={() => setMapTileType('streets')}
              className={`h-6 px-2.5 rounded text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                mapTileType === 'streets' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Mapa
            </button>
          </div>

          {prescriptionResult && (
            <div className="hidden sm:flex items-center gap-1.5 px-2 border-l border-zinc-700/80">
              <Eye className="w-3.5 h-3.5 text-zinc-400" />
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={gridOpacity}
                onChange={(e) => setGridOpacity(Number(e.target.value))}
                className="w-20 accent-emerald-500 cursor-pointer h-1.5 bg-zinc-700 rounded-lg"
                aria-label="Opacidade da grade interpolada"
              />
              <span className="text-[10px] font-mono tabular-nums text-emerald-400 w-8 text-right">
                {Math.round(gridOpacity * 100)}%
              </span>
            </div>
          )}

          {prescriptionResult && onDownloadGeoJSON && (
            <button
              type="button"
              onClick={onDownloadGeoJSON}
              className="h-7 px-2 hover:bg-zinc-800 rounded-md transition-colors text-zinc-300 hover:text-white cursor-pointer flex items-center gap-1 text-[11px]"
              title="Baixar GeoJSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">GeoJSON</span>
            </button>
          )}

          {prescriptionResult && onDownloadISOXML && (
            <button
              type="button"
              onClick={onDownloadISOXML}
              className="h-7 px-2 hover:bg-zinc-800 rounded-md transition-colors text-zinc-300 hover:text-white cursor-pointer flex items-center gap-1 text-[11px]"
              title="Baixar ISOXML"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span className="hidden md:inline">ISOXML</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-7 w-7 flex items-center justify-center hover:bg-zinc-800 rounded-md transition-colors text-zinc-300 hover:text-white cursor-pointer"
            title={isFullscreen ? 'Sair da tela cheia' : 'Expandir tela cheia'}
            aria-label={isFullscreen ? 'Sair da tela cheia' : 'Expandir tela cheia'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Canvas Leaflet */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Legenda Flutuante */}
      {prescriptionResult && showLegend && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-zinc-950/92 backdrop-blur-md text-white border border-zinc-700/80 p-3 rounded-lg max-w-xs text-xs space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
            <span className="font-semibold text-[11px] text-emerald-400 flex items-center gap-1.5">
              <Grid className="w-3.5 h-3.5" />
              <span>Doses Prescritas</span>
            </span>
            <button
              type="button"
              onClick={() => setShowLegend(false)}
              className="text-[10px] text-zinc-400 hover:text-white cursor-pointer"
            >
              Ocultar
            </button>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {(prescriptionResult.metadata.intervals || []).map((inter) => (
              <div key={inter.id} className="flex items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3 h-3 rounded-sm shrink-0 border border-white/20"
                    style={{ backgroundColor: inter.color }}
                  />
                  <span className="truncate text-zinc-200">{inter.label}</span>
                </div>
                <span className="font-mono tabular-nums font-semibold text-amber-300 shrink-0">
                  {inter.dose} {inter.unit}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-zinc-800 text-[10px] grid grid-cols-2 gap-2 text-zinc-400">
            <div>
              <span className="block text-zinc-500">Área Mapeada</span>
              <strong className="text-white font-mono tabular-nums">{prescriptionResult.metadata.totalAreaHa} ha</strong>
            </div>
            <div>
              <span className="block text-zinc-500">Total Insumo</span>
              <strong className="text-amber-300 font-mono tabular-nums">
                {prescriptionResult.metadata.totalInputRequired} {prescriptionResult.metadata.inputUnit}
              </strong>
            </div>
          </div>
        </div>
      )}

      {prescriptionResult && !showLegend && (
        <button
          type="button"
          onClick={() => setShowLegend(true)}
          className="absolute bottom-3 left-3 z-[1000] bg-zinc-950/90 backdrop-blur-md text-white border border-zinc-700 h-8 px-3 rounded-lg text-xs font-medium hover:bg-zinc-900 transition-colors cursor-pointer"
        >
          Exibir Legenda
        </button>
      )}

      {/* Inspetor de Célula Selecionada */}
      {selectedCell && (
        <div className="absolute bottom-3 right-14 z-[1000] bg-zinc-950/95 backdrop-blur-md text-white border border-emerald-500/50 p-3.5 rounded-lg max-w-xs text-xs space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
            <span className="font-semibold text-emerald-400 tabular-nums">Célula #{selectedCell.ID}</span>
            <button
              type="button"
              onClick={() => setSelectedCell(null)}
              className="text-zinc-400 hover:text-white cursor-pointer p-0.5"
              aria-label="Fechar detalhes da célula"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 font-mono tabular-nums text-[11px]">
            <div className="flex justify-between gap-3">
              <span className="text-zinc-400 font-sans">Coordenadas</span>
              <span>{selectedCell.Y.toFixed(5)}, {selectedCell.X.toFixed(5)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-zinc-400 font-sans">Teor Interpolado</span>
              <strong className="text-emerald-400">{selectedCell.VALOR_INTERPOLADO}</strong>
            </div>
            {selectedCell.VARIANCE_KRIGING && (
              <div className="flex justify-between gap-3">
                <span className="text-zinc-400 font-sans">Variância Krigagem</span>
                <span>{selectedCell.VARIANCE_KRIGING}</span>
              </div>
            )}
            <div className="flex justify-between gap-3 items-center">
              <span className="text-zinc-400 font-sans">Classe</span>
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold text-white"
                style={{ backgroundColor: selectedCell.COLOR }}
              >
                {selectedCell.CLASS_LABEL}
              </span>
            </div>
            <div className="flex justify-between gap-3 pt-1.5 border-t border-zinc-800 text-xs">
              <span className="text-zinc-300 font-sans font-medium">Dose Prescrita</span>
              <strong className="text-amber-300 font-semibold">{selectedCell.DOSE_TARGET} {selectedCell.UNIT}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Estado Sem Matriz Interpolada */}
      {!prescriptionResult && (
        <div className="absolute inset-0 z-[500] bg-zinc-950/45 backdrop-blur-xs flex items-center justify-center p-4 text-center pointer-events-none">
          <div className="bg-zinc-950/92 border border-zinc-700/80 text-white p-5 rounded-xl max-w-sm space-y-2.5 pointer-events-auto">
            <div className="w-10 h-10 bg-emerald-500/15 text-emerald-400 rounded-lg flex items-center justify-center mx-auto border border-emerald-500/30">
              <Grid className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">
              Nenhuma Matriz Interpolada
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Execute a interpolação geoestatística (IDW ou Krigagem Ordinária) para visualizar zonas de aplicação em taxa variável neste mapa.
            </p>

            {onOpenModalToReinterpolate && (
              <button
                type="button"
                onClick={onOpenModalToReinterpolate}
                className="mt-1 h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2 whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Configurar e Gerar Grid</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
