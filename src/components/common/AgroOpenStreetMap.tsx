import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Compass,
  Layers,
  MapPin,
  Navigation,
  RefreshCw,
  Search,
  Crosshair,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Sparkles,
  Satellite,
  Map as MapIcon,
  X,
} from 'lucide-react';
import {
  searchLocalBrazilianCities,
  searchOnlineCityNominatim,
  findCityCoordinates,
  reverseGeocodeNominatim,
  AgroCity,
} from '../../data/brazilianAgroCities';

export interface MapPolygonItem {
  id: string;
  name: string;
  points: Array<[number, number]>; // [lat, lng]
  color?: string;
  fillColor?: string;
  fillOpacity?: number;
  areaHa?: number;
  subtitle?: string;
  data?: any;
}

export interface MapMarkerItem {
  id: string;
  label: string;
  lat: number;
  lng: number;
  color?: string; // hex or tailwind class
  type?: 'vertice' | 'foto' | 'amostra' | 'marco' | 'sede' | 'ponto' | 'alerta';
  details?: string;
  altitude?: number;
  accuracy?: number;
  onClick?: () => void;
}

export interface AgroOpenStreetMapProps {
  heightClassName?: string;
  title?: string;
  subtitle?: string;
  currentCity?: string;
  currentUf?: string;
  polygons?: MapPolygonItem[];
  markers?: MapMarkerItem[];
  activeCenter?: { lat: number; lng: number; zoom?: number };
  selectedPolygonId?: string | null;
  selectedMarkerId?: string | null;
  onPolygonClick?: (poly: MapPolygonItem) => void;
  onMarkerClick?: (marker: MapMarkerItem) => void;
  onCitySelected?: (city: { name: string; state: string; lat: number; lng: number }) => void;
  onGpsLocated?: (location: {
    lat: number;
    lng: number;
    city: string;
    uf: string;
    accuracy: number;
  }) => void;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  allowClickToAddPoint?: boolean;
  clickInstruction?: string;
  customHeaderTools?: React.ReactNode;
  showLayerControls?: boolean;
}

export const AgroOpenStreetMap: React.FC<AgroOpenStreetMapProps> = ({
  heightClassName = 'h-[440px]',
  title,
  subtitle,
  currentCity,
  currentUf,
  polygons = [],
  markers = [],
  activeCenter,
  selectedPolygonId,
  selectedMarkerId,
  onPolygonClick,
  onMarkerClick,
  onCitySelected,
  onGpsLocated,
  onMapClick,
  allowClickToAddPoint = false,
  clickInstruction,
  customHeaderTools,
  showLayerControls = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const polygonLayersRef = useRef<L.Polygon[]>([]);
  const markerLayersRef = useRef<L.Marker[]>([]);
  const cityMarkerRef = useRef<L.Marker | null>(null);
  const gpsMarkerRef = useRef<L.Marker | null>(null);
  const gpsCircleRef = useRef<L.Circle | null>(null);

  // States
  const [mapLayerType, setMapLayerType] = useState<'streets' | 'satellite' | 'topo'>('streets');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AgroCity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [activeCityLabel, setActiveCityLabel] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center in central agricultural Brazil (Goiás / MT region)
    const initialLat = activeCenter?.lat || -16.1482;
    const initialLng = activeCenter?.lng || -47.5192;
    const initialZoom = activeCenter?.zoom || 13;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: false,
    });

    // Custom Zoom Control top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial OSM Tile Layer
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    // Handle Map Clicks
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (onMapClick) {
        onMapClick({
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6)),
        });
      }
    });

    // Resize invalidate after render
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Change Tile Layers (OpenStreetMap vs Satellite ESRI vs Topo)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    if (mapLayerType === 'satellite') {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics, USDA, USGS',
          maxZoom: 19,
        }
      ).addTo(map);
    } else if (mapLayerType === 'topo') {
      tileLayerRef.current = L.tileLayer(
        'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        {
          attribution: 'Map data: &copy; OpenStreetMap, SRTM | Map style: &copy; OpenTopoMap',
          maxZoom: 17,
        }
      ).addTo(map);
    } else {
      tileLayerRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }
      ).addTo(map);
    }
  }, [mapLayerType]);

  // 3. INTEGRAÇÃO POR CIDADE INFORMADA DURANTE O PREENCHIMENTO
  // Whenever currentCity or currentUf changes in the parent form/report, sync the map
  const lastSyncedCityRef = useRef<string>('');
  useEffect(() => {
    if (!currentCity || !currentCity.trim() || !mapInstanceRef.current) return;

    const cityKey = `${currentCity.trim().toLowerCase()}_${(currentUf || '').trim().toLowerCase()}`;
    if (cityKey === lastSyncedCityRef.current) return;
    lastSyncedCityRef.current = cityKey;

    let isMounted = true;
    findCityCoordinates(currentCity, currentUf).then(coords => {
      if (!isMounted || !coords || !mapInstanceRef.current) return;

      setActiveCityLabel(`${coords.city} - ${coords.uf}`);
      mapInstanceRef.current.flyTo([coords.lat, coords.lng], 13, {
        duration: 1.2,
      });

      // Update or create city center marker
      if (cityMarkerRef.current) {
        mapInstanceRef.current.removeLayer(cityMarkerRef.current);
      }

      const icon = L.divIcon({
        className: 'bg-transparent border-none',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute -top-2 -left-2 w-10 h-10 rounded-full bg-emerald-500/30 animate-ping"></div>
            <div class="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white text-white flex items-center justify-center shadow-xl text-xs font-black">
              📍
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      cityMarkerRef.current = L.marker([coords.lat, coords.lng], { icon })
        .bindTooltip(
          `<div style="font-family:sans-serif;padding:3px 6px;">
            <strong style="font-size:12px;color:#047857;">${coords.city} - ${coords.uf}</strong><br/>
            <span style="font-size:10px;color:#475569;">Município informado no preenchimento</span>
          </div>`,
          { permanent: false, direction: 'top', offset: [0, -10] }
        )
        .addTo(mapInstanceRef.current);
    });

    return () => {
      isMounted = false;
    };
  }, [currentCity, currentUf]);

  // 4. INTEGRAÇÃO MANUAL: BUSCANDO A CIDADE QUANDO INFORMA
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      const localMatches = searchLocalBrazilianCities(val, 6);
      setSearchResults(localMatches);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectCity = (city: AgroCity) => {
    if (!mapInstanceRef.current) return;
    setSearchQuery('');
    setSearchResults([]);
    setActiveCityLabel(`${city.name} - ${city.state}`);

    mapInstanceRef.current.flyTo([city.lat, city.lng], 14, {
      duration: 1.2,
    });

    if (cityMarkerRef.current) {
      mapInstanceRef.current.removeLayer(cityMarkerRef.current);
    }

    const icon = L.divIcon({
      className: 'bg-transparent border-none',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute -top-2 -left-2 w-10 h-10 rounded-full bg-emerald-500/30 animate-ping"></div>
          <div class="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white text-white flex items-center justify-center shadow-xl text-xs font-black">
            📍
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    cityMarkerRef.current = L.marker([city.lat, city.lng], { icon })
      .bindTooltip(
        `<div style="font-family:sans-serif;padding:3px 6px;">
          <strong style="font-size:12px;color:#047857;">${city.name} - ${city.state}</strong><br/>
          <span style="font-size:10px;color:#475569;">${city.notes || 'Localizado no OpenStreetMap'}</span>
        </div>`,
        { permanent: false, direction: 'top', offset: [0, -10] }
      )
      .addTo(mapInstanceRef.current);

    showToast(`OpenStreetMap centralizado em ${city.name} - ${city.state}!`);

    if (onCitySelected) {
      onCitySelected({
        name: city.name,
        state: city.state,
        lat: city.lat,
        lng: city.lng,
      });
    }
  };

  const handleManualSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // 1. Try local list first
      const local = searchLocalBrazilianCities(searchQuery, 4);
      if (local.length > 0) {
        handleSelectCity(local[0]);
        return;
      }

      // 2. Query Nominatim OpenStreetMap
      const online = await searchOnlineCityNominatim(searchQuery, 4);
      if (online.length > 0) {
        handleSelectCity(online[0]);
      } else {
        showToast(`Cidade "${searchQuery}" não encontrada no OpenStreetMap. Tente com a UF.`);
      }
    } catch (err) {
      showToast('Falha ao pesquisar localidade no OpenStreetMap.');
    } finally {
      setIsSearching(false);
    }
  };

  // 5. INTEGRAÇÃO PELO GPS (CAI NA CIDADE AUTOMATICAMENTE)
  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      showToast('Geolocalização não suportada no seu navegador/aparelho.');
      return;
    }

    setIsCapturingGps(true);
    showToast('Sintonizando satélites GPS do dispositivo...');

    navigator.geolocation.getCurrentPosition(
      async position => {
        setIsCapturingGps(false);
        const { latitude, longitude, accuracy } = position.coords;
        const roundedLat = Number(latitude.toFixed(6));
        const roundedLng = Number(longitude.toFixed(6));
        const roundedAcc = Math.round(accuracy * 10) / 10;

        if (!mapInstanceRef.current) return;
        const map = mapInstanceRef.current;

        // Fly to user GPS position
        map.flyTo([roundedLat, roundedLng], 16, { duration: 1.4 });

        // Remove previous GPS layers
        if (gpsMarkerRef.current) map.removeLayer(gpsMarkerRef.current);
        if (gpsCircleRef.current) map.removeLayer(gpsCircleRef.current);

        // Accuracy circle
        gpsCircleRef.current = L.circle([roundedLat, roundedLng], {
          radius: Math.max(accuracy, 10),
          color: '#3b82f6',
          fillColor: '#60a5fa',
          fillOpacity: 0.15,
          weight: 1.5,
          dashArray: '3, 4',
        }).addTo(map);

        // Pulsing GPS Marker
        const gpsIcon = L.divIcon({
          className: 'bg-transparent border-none',
          html: `
            <div class="relative flex items-center justify-center">
              <div class="absolute -top-2 -left-2 w-12 h-12 rounded-full bg-blue-500/40 animate-ping"></div>
              <div class="w-8 h-8 rounded-full bg-blue-600 border-2 border-white text-white flex items-center justify-center shadow-2xl text-xs font-black">
                📡
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        gpsMarkerRef.current = L.marker([roundedLat, roundedLng], { icon: gpsIcon })
          .bindTooltip(
            `<div style="font-family:sans-serif;padding:3px 6px;">
              <strong style="font-size:12px;color:#1e40af;">Localização GPS Ao Vivo</strong><br/>
              <span style="font-size:10px;color:#334155;">Lat: ${roundedLat.toFixed(5)}° | Lng: ${roundedLng.toFixed(5)}°</span><br/>
              <span style="font-size:10px;color:#059669;font-weight:bold;">Precisão: ±${roundedAcc}m</span>
            </div>`,
            { permanent: false, direction: 'top', offset: [0, -10] }
          )
          .addTo(map);

        // REVERSE GEOCODE: "Pelo GPS já cai na cidade automaticamente"
        showToast('Identificando município via OpenStreetMap Nominatim...');
        const geoResult = await reverseGeocodeNominatim(roundedLat, roundedLng);

        if (geoResult && geoResult.city) {
          setActiveCityLabel(`${geoResult.city} - ${geoResult.uf}`);
          showToast(
            `📍 GPS detectado: ${geoResult.city} - ${geoResult.uf} (±${roundedAcc}m)! Município atualizado automaticamente!`
          );

          if (onGpsLocated) {
            onGpsLocated({
              lat: roundedLat,
              lng: roundedLng,
              city: geoResult.city,
              uf: geoResult.uf,
              accuracy: roundedAcc,
            });
          }
        } else {
          showToast(`Coordenadas capturadas: ${roundedLat}, ${roundedLng} (±${roundedAcc}m)`);
          if (onGpsLocated) {
            onGpsLocated({
              lat: roundedLat,
              lng: roundedLng,
              city: currentCity || '',
              uf: currentUf || '',
              accuracy: roundedAcc,
            });
          }
        }
      },
      error => {
        setIsCapturingGps(false);
        showToast(`Erro ao capturar GPS: ${error.message}. Permita o acesso à localização.`);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  // 6. RENDER POLYGONS (PROPRIEDADES & TALHÕES)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear old polygon layers
    polygonLayersRef.current.forEach(layer => map.removeLayer(layer));
    polygonLayersRef.current = [];

    if (!polygons || polygons.length === 0) return;

    polygons.forEach(poly => {
      if (!poly.points || poly.points.length < 3) return;

      const isSelected = selectedPolygonId === poly.id;
      const strokeColor = poly.color || (isSelected ? '#10b981' : '#3b82f6');
      const fillColor = poly.fillColor || strokeColor;
      const fillOpacity = poly.fillOpacity !== undefined ? poly.fillOpacity : isSelected ? 0.35 : 0.2;

      const leafletPoly = L.polygon(poly.points, {
        color: strokeColor,
        weight: isSelected ? 3.5 : 2,
        fillColor: fillColor,
        fillOpacity: fillOpacity,
        dashArray: poly.data?.dashed ? '5, 5' : undefined,
      }).addTo(map);

      leafletPoly.bindTooltip(
        `<div style="font-family:sans-serif;padding:3px 6px;">
          <strong style="font-size:12px;color:#0f172a;">${poly.name}</strong>
          ${poly.areaHa ? `<br/><span style="font-size:10px;color:#059669;font-weight:bold;">${poly.areaHa} ha</span>` : ''}
          ${poly.subtitle ? `<br/><span style="font-size:10px;color:#475569;">${poly.subtitle}</span>` : ''}
        </div>`,
        { permanent: false, direction: 'center', opacity: 0.95 }
      );

      leafletPoly.on('click', () => {
        if (onPolygonClick) onPolygonClick(poly);
      });

      polygonLayersRef.current.push(leafletPoly);
    });

    // Auto fit bounds if polygons exist and no active manual center
    if (!activeCenter && polygonLayersRef.current.length > 0) {
      try {
        const group = L.featureGroup(polygonLayersRef.current);
        const bounds = group.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [35, 35], maxZoom: 16 });
        }
      } catch (e) {}
    }
  }, [polygons, selectedPolygonId]);

  // 7. RENDER MARKERS (VÉRTICES, AMOSTRAS, FOTOS, MARCOS)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear old markers
    markerLayersRef.current.forEach(m => map.removeLayer(m));
    markerLayersRef.current = [];

    if (!markers || markers.length === 0) return;

    markers.forEach(m => {
      const isSelected = selectedMarkerId === m.id;
      let bgColor = 'bg-emerald-600';
      let iconSymbol = '📍';

      if (m.type === 'foto') {
        bgColor = 'bg-sky-600';
        iconSymbol = '📷';
      } else if (m.type === 'amostra') {
        bgColor = 'bg-amber-600';
        iconSymbol = '🧪';
      } else if (m.type === 'alerta') {
        bgColor = 'bg-rose-600';
        iconSymbol = '⚠️';
      } else if (m.type === 'sede') {
        bgColor = 'bg-indigo-600';
        iconSymbol = '🏡';
      } else if (m.type === 'vertice') {
        bgColor = 'bg-emerald-600';
        iconSymbol = '•';
      }

      const customIcon = L.divIcon({
        className: 'bg-transparent border-none',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="${isSelected ? 'w-8 h-8 scale-110 ring-4 ring-white shadow-2xl' : 'w-6 h-6'} ${bgColor} rounded-full text-white flex items-center justify-center font-bold text-[10px] border border-white transition-all shadow-md">
              ${iconSymbol}
            </div>
            <span class="absolute -bottom-4 whitespace-nowrap bg-slate-900/90 text-white font-mono text-[9px] px-1 py-0.2 rounded font-bold shadow-xs pointer-events-none">
              ${m.label}
            </span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const leafletMarker = L.marker([m.lat, m.lng], { icon: customIcon }).addTo(map);

      leafletMarker.bindTooltip(
        `<div style="font-family:sans-serif;padding:3px 6px;">
          <strong style="font-size:12px;color:#0f172a;">${m.label}</strong><br/>
          <span style="font-size:10px;color:#475569;">Lat: ${m.lat.toFixed(6)} | Lng: ${m.lng.toFixed(6)}</span>
          ${m.details ? `<br/><span style="font-size:10px;color:#059669;">${m.details}</span>` : ''}
          ${m.altitude ? `<br/><span style="font-size:10px;color:#64748b;">Alt: ${m.altitude}m</span>` : ''}
        </div>`,
        { permanent: false, direction: 'top', offset: [0, -10] }
      );

      leafletMarker.on('click', () => {
        if (m.onClick) m.onClick();
        if (onMarkerClick) onMarkerClick(m);
      });

      markerLayersRef.current.push(leafletMarker);
    });
  }, [markers, selectedMarkerId]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);
  };

  return (
    <div
      className={`relative rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden flex flex-col transition-all ${
        isFullscreen
          ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)] shadow-2xl'
          : heightClassName
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-1000 flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-xl border border-emerald-500/50 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP INTEGRATED TOOLBAR */}
      <div className="bg-slate-900 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 z-500 border-b border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <MapIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black truncate flex items-center gap-1.5">
              <span>{title || 'OpenStreetMap Georreferenciado'}</span>
              {activeCityLabel && (
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-2 py-0.2 rounded-full font-mono font-bold">
                  {activeCityLabel}
                </span>
              )}
            </h4>
            <p className="text-[10px] text-slate-400 truncate">
              {subtitle ||
                'Integração oficial OpenStreetMap • Busca de cidades, GPS ao vivo e camadas agrícolas'}
            </p>
          </div>
        </div>

        {/* SEARCH, GPS AND ACTIONS */}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {/* SEARCH BOX: INTEGRAÇÃO MANUAL BUSCANDO CIDADE */}
          <div className="relative">
            <form onSubmit={handleManualSearchSubmit} className="flex items-center">
              <input
                type="text"
                placeholder="Buscar cidade (ex: Sorriso, Rio Verde)..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                className="w-48 sm:w-60 bg-slate-800/90 text-white placeholder-slate-400 text-xs rounded-l-xl px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:border-emerald-500 font-medium"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2.5 py-1.5 rounded-r-xl border border-emerald-600 font-bold transition flex items-center gap-1 cursor-pointer"
                title="Pesquisar cidade no OpenStreetMap"
              >
                {isSearching ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">Buscar</span>
              </button>
            </form>

            {/* AUTOCOMPLETE SUGGESTIONS DROPDOWN */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-1000 max-h-52 overflow-y-auto overflow-x-hidden p-1 space-y-1">
                {searchResults.map((city, idx) => (
                  <button
                    key={`${city.name}-${city.state}-${idx}`}
                    type="button"
                    onClick={() => handleSelectCity(city)}
                    className="w-full text-left p-2 hover:bg-slate-800 rounded-lg text-xs transition flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-white">
                        {city.name} - {city.state}
                      </span>
                      {city.region && (
                        <span className="text-[10px] text-slate-400 block">{city.region}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                      OSM 📍
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* GPS BUTTON: INTEGRAÇÃO PELO GPS (CAI NA CIDADE AUTOMATICAMENTE) */}
          <button
            type="button"
            onClick={handleCaptureGps}
            disabled={isCapturingGps}
            className="px-2.5 py-1.5 bg-blue-600/90 hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            title="Localizar posição GPS atual do dispositivo e identificar a cidade automaticamente"
          >
            {isCapturingGps ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <Crosshair className="w-3.5 h-3.5 text-blue-200" />
            )}
            <span className="hidden sm:inline">
              {isCapturingGps ? 'Localizando...' : 'GPS Ao Vivo'}
            </span>
          </button>

          {/* LAYER SELECTOR */}
          {showLayerControls && (
            <div className="flex bg-slate-800 rounded-xl p-0.5 border border-slate-700 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setMapLayerType('streets')}
                className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                  mapLayerType === 'streets'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Camada Padrão OpenStreetMap (Ruas e Localidades)"
              >
                OSM
              </button>
              <button
                type="button"
                onClick={() => setMapLayerType('satellite')}
                className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                  mapLayerType === 'satellite'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Camada de Satélite de Alta Resolução (Esri World Imagery)"
              >
                Satélite
              </button>
              <button
                type="button"
                onClick={() => setMapLayerType('topo')}
                className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                  mapLayerType === 'topo'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Camada Topográfica (Curvas de Nível e Relevo)"
              >
                Relevo
              </button>
            </div>
          )}

          {/* CUSTOM EXTRA TOOLS */}
          {customHeaderTools}

          {/* FULLSCREEN TOGGLE */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition cursor-pointer"
            title={isFullscreen ? 'Reduzir mapa' : 'Tela cheia'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* CLICK INSTRUCTION BANNER (IF ACTIVE) */}
      {allowClickToAddPoint && (
        <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-4 py-1 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            {clickInstruction ||
              'Modo de captura ativo: clique em qualquer lugar do mapa para fixar novas coordenadas.'}
          </span>
          <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase">
            Clique no Mapa
          </span>
        </div>
      )}

      {/* MAP LEAFLET CONTAINER */}
      <div ref={mapContainerRef} className="w-full flex-1 z-0 min-h-64" />

      {/* FOOTER BADGE / METRICS BAR */}
      <div className="bg-slate-950 text-slate-300 px-4 py-1.5 text-[10px] font-mono flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 z-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            OpenStreetMap Engine
          </span>
          {polygons.length > 0 && (
            <span>
              Polígonos/Talhões: <strong className="text-white">{polygons.length}</strong>
            </span>
          )}
          {markers.length > 0 && (
            <span>
              Pontos GPS: <strong className="text-white">{markers.length}</strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span>Datum: SIRGAS 2000 / WGS 84</span>
          <span>•</span>
          <span>Tiles: OpenStreetMap Contributors</span>
        </div>
      </div>
    </div>
  );
};
